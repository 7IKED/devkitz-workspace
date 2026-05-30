"""
DkZ CoPilot — Zentraler Server Connector
Verbindet ALLE Komponenten: Webhook Server + Agent + CLOUDIA + VPS + Swarm + Desktop.
Starten mit: python -m api.server
"""

import asyncio
import json
import logging
import os
import sys
from pathlib import Path

# Sicherstellen dass api/ importierbar ist
sys.path.insert(0, str(Path(__file__).parent.parent))

from fastapi import FastAPI, Request, WebSocket, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, JSONResponse

# Eigene Module
from api.config import Settings
from api.agent import AgentOrchestrator
from api.file_analyzer import FileAnalyzer
from api.git_worker import GitWorker
from api.webhook_server import verify_github_signature
from api.webhook_local import LocalWebhookProxy, WebhookRouter
from api.cloudia import CloudiaController
from api.integrations import IntegrationsManager
from api.vps_controller import VPSController
from api.swarm import SwarmController

# --- Setup ---
logging.basicConfig(level=logging.INFO, format='%(asctime)s [%(name)s] %(message)s')
logger = logging.getLogger("dkz-copilot")

settings = Settings()

app = FastAPI(title="DkZ CoPilot", version="2.0.0")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

# --- Komponenten initialisieren ---
webhook_proxy = LocalWebhookProxy(secret=settings.WEBHOOK_SECRET)
webhook_router = WebhookRouter(webhook_proxy)
cloudia = CloudiaController(config={
    "vps_host": os.getenv("VPS_HOST", ""),
    "vps_user": os.getenv("VPS_USER", "root"),
    "drive_folder": os.getenv("DRIVE_FOLDER", "DEVKiTZ-Backup"),
    "domains": os.getenv("DOMAINS", "").split(",") if os.getenv("DOMAINS") else []
})
integrations = IntegrationsManager()
agent = AgentOrchestrator(settings)
vps = VPSController(settings)
# swarm = SwarmController()

ws_clients: list[WebSocket] = []
status = {"status": "idle", "last_action": None}
history: list[dict] = []


# --- WebSocket fuer Live-Logs ---
@app.websocket("/ws")
async def websocket_endpoint(ws: WebSocket):
    await ws.accept()
    ws_clients.append(ws)
    try:
        while True:
            await ws.receive_text()
    except Exception:
        ws_clients.remove(ws)


async def broadcast(msg: dict):
    for ws in ws_clients[:]:
        try:
            await ws.send_json(msg)
        except Exception:
            ws_clients.remove(ws)


# === HEALTH + STATUS ===

@app.get("/health")
async def health():
    return {"status": "ok", "version": "2.0.0", "components": {
        "agent": status["status"],
        "cloudia": cloudia.get_status().get("ampel", "unbekannt"),
        "integrations": integrations.get_active_count() if hasattr(integrations, 'get_active_count') else 0,
        "webhooks": webhook_proxy.get_status()
    }}

@app.get("/status")
async def get_status():
    return status


# === WEBHOOKS (Remote GitHub + Lokal) ===

@app.post("/webhook")
async def receive_webhook(request: Request, bg: BackgroundTasks):
    """Empfaengt GitHub Webhooks ODER lokale Events."""
    body = await request.body()
    event_type = request.headers.get("X-GitHub-Event", "custom")
    signature = request.headers.get("X-Hub-Signature-256", "")

    # GitHub Signature pruefen (wenn vorhanden)
    if signature and not webhook_proxy.verify_signature(body, signature):
        return JSONResponse({"error": "Invalid signature"}, status_code=401)

    payload = json.loads(body)
    source = "github" if signature else "local"

    # Event verarbeiten
    result = await webhook_proxy.emit(event_type, payload, source=source)
    await broadcast({"type": "webhook", "event": event_type, "source": source})

    # Agent starten wenn Issue assigned/labeled
    if event_type == "issues":
        action = payload.get("action", "")
        issue = payload.get("issue", {})
        assignee = (issue.get("assignee") or {}).get("login", "")
        labels = [l.get("name", "") for l in issue.get("labels", [])]

        if action in ("assigned", "labeled", "opened"):
            if assignee == settings.BOT_USERNAME or "copilot" in " ".join(labels).lower():
                bg.add_task(process_issue_task, payload)
                return {"status": "accepted", "action": "agent_triggered"}

    return {"status": "received", "event": event_type, "source": source}

async def process_issue_task(payload: dict):
    global status
    status = {"status": "working", "last_action": payload.get("issue", {}).get("title", "")}
    await broadcast({"type": "status", "status": "working"})
    try:
        result = await agent.process_issue(payload)
        history.append({"payload": payload, "result": result})
        if len(history) > 50:
            history.pop(0)
        status = {"status": "idle", "last_action": result.get("pr_url", "")}
    except Exception as e:
        status = {"status": "error", "error": str(e)}
        logger.exception("Agent Fehler")
    await broadcast({"type": "status", "status": status["status"]})


# === GITHUB API ===

@app.get("/github/issues")
async def get_issues():
    try:
        import httpx
        async with httpx.AsyncClient() as client:
            resp = await client.get(
                f"https://api.github.com/repos/{settings.REPO_OWNER}/{settings.DEFAULT_REPO}/issues",
                headers={"Authorization": f"token {settings.GITHUB_TOKEN}"},
                params={"state": "open", "per_page": 20}
            )
            return {"issues": resp.json()}
    except Exception:
        return {"issues": [], "error": "offline"}

@app.get("/github/pulls")
async def get_pulls():
    try:
        import httpx
        async with httpx.AsyncClient() as client:
            resp = await client.get(
                f"https://api.github.com/repos/{settings.REPO_OWNER}/{settings.DEFAULT_REPO}/pulls",
                headers={"Authorization": f"token {settings.GITHUB_TOKEN}"},
                params={"state": "all", "per_page": 10}
            )
            return {"pulls": resp.json()}
    except Exception:
        return {"pulls": [], "error": "offline"}


# === INTEGRATIONS ===

@app.post("/integrations/toggle")
async def toggle_integration(request: Request):
    data = await request.json()
    name = data.get("name", "")
    enabled = data.get("enabled", False)
    if hasattr(integrations, 'toggle'):
        integrations.toggle(name, enabled)
    await broadcast({"type": "integration", "name": name, "enabled": enabled})
    return {"ok": True, "name": name, "enabled": enabled}


# === VPS ===

@app.get("/vps/status")
async def vps_status():
    try:
        result = await vps.get_full_status()
        return result
    except Exception:
        return {"ampel": "offline", "metrics": {
            "cpu": "—", "ram": "—", "disk": "—", "uptime": "—", "load": "—"
        }}

@app.post("/vps/{action}")
async def vps_action(action: str, bg: BackgroundTasks):
    actions = {
        "deploy": lambda: vps.deploy(),
        "backup": lambda: vps.backup(),
        "update": lambda: vps.update_all(),
        "ssl": lambda: vps.renew_ssl(),
    }
    fn = actions.get(action)
    if fn:
        bg.add_task(fn)
        return {"status": "started", "action": action}
    return JSONResponse({"error": f"Unknown action: {action}"}, status_code=400)


# === CLOUDIA (Drive Sync) ===

@app.post("/sync/drive")
async def sync_drive():
    return await cloudia.sync_copilot_to_drive()

@app.post("/sync/all")
async def sync_all():
    return await cloudia.full_sync()

@app.get("/cloudia/health")
async def cloudia_health():
    return await cloudia.health_check()


# === CHAT ===

@app.post("/chat")
async def chat(request: Request):
    data = await request.json()
    message = data.get("message", "")
    model = data.get("model", "auto")
    try:
        import httpx
        async with httpx.AsyncClient(timeout=30.0) as client:
            resp = await client.post(
                f"{settings.VLLM_URL}/chat/completions",
                json={
                    "model": settings.MODEL_NAME,
                    "messages": [
                        {"role": "system", "content": "Du bist DkZ CoPilot, ein KI-Assistent fuer das DEVKiTZ Oekosystem."},
                        {"role": "user", "content": message}
                    ],
                    "max_tokens": 512
                }
            )
            result = resp.json()
            response_text = result.get("choices", [{}])[0].get("message", {}).get("content", "Keine Antwort")
            return {"response": response_text}
    except Exception:
        return {"response": "LLM offline. Nutze /help fuer lokale Befehle."}


# === UPDATE ===

@app.get("/update/check")
async def update_check():
    return {"update_available": False, "current": "2.0.0"}

@app.post("/update/local")
async def update_local():
    import subprocess
    try:
        result = subprocess.run("git pull origin main", shell=True, capture_output=True, text=True, cwd=r"C:\DEVKiTZ", timeout=30)
        return {"success": result.returncode == 0, "output": result.stdout}
    except Exception as e:
        return {"success": False, "error": str(e)}

@app.post("/update/vps")
async def update_vps():
    return await vps.update_all() if hasattr(vps, 'update_all') else {"error": "Not available"}


# === HISTORY ===

@app.get("/history")
async def get_history():
    return {"history": history[-20:]}


# === Static Files (Dashboard Build) ===
dist_path = Path(__file__).parent.parent / "dashboard" / "dist"
if dist_path.exists():
    app.mount("/", StaticFiles(directory=str(dist_path), html=True), name="static")


# === Startup ===
@app.on_event("startup")
async def startup():
    logger.info("""
    ╔══════════════════════════════════════╗
    ║   DkZ CoPilot™ v2.0 — Gestartet!   ║
    ║   Port: 3050 · React Dashboard      ║
    ║   Webhooks: Lokal + Remote           ║
    ║   CLOUDIA²: Drive + VPS Sync        ║
    ╚══════════════════════════════════════╝
    """)
    await broadcast({"type": "status", "status": "idle"})


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("api.server:app", host="0.0.0.0", port=settings.PORT, reload=True)
