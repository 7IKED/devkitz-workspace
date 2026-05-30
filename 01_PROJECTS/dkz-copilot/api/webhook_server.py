"""
DkZ CoPilot Backend — Webhook Server
FastAPI mit GitHub Webhook Empfang, HMAC Verifikation, Live-Log WebSocket.
"""

import hashlib
import hmac
import logging
import time
from collections import deque
from contextlib import asynccontextmanager
from typing import Any

import uvicorn
from fastapi import BackgroundTasks, FastAPI, HTTPException, Request, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from starlette.websockets import WebSocketState

from config import settings

# --- Logging ---
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)-7s | %(name)s | %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger("dkz-copilot")

# --- State ---
VERSION = "1.0.0"
LOGO = r"""
  ____  _    _____    ____       ____  _ _       _
 |  _ \| | _|__  /   / ___|___  |  _ \(_) | ___ | |_
 | | | | |/ / / /   | |   / _ \ | |_) | | |/ _ \| __|
 | |_| |   < / /_   | |__| (_) ||  __/| | | (_) | |_
 |____/|_|\_\____|   \____\___/ |_|   |_|_|\___/ \__|
"""


class AgentState:
    """Globaler Agent-Status und History-Tracker."""

    def __init__(self) -> None:
        self.status: str = "idle"
        self.current_issue: dict[str, Any] | None = None
        self.history: deque[dict[str, Any]] = deque(maxlen=20)
        self.log_subscribers: list[WebSocket] = []
        self.start_time: float = time.time()

    def set_working(self, issue: dict[str, Any]) -> None:
        self.status = "working"
        self.current_issue = issue

    def set_idle(self) -> None:
        self.status = "idle"
        self.current_issue = None

    def set_error(self, error: str) -> None:
        self.status = "error"
        self.current_issue = {"error": error}

    def add_to_history(self, entry: dict[str, Any]) -> None:
        entry["timestamp"] = time.time()
        self.history.appendleft(entry)


state = AgentState()


# --- WebSocket Log Broadcasting ---
async def broadcast_log(message: str) -> None:
    """Sendet Log-Nachricht an alle verbundenen WebSocket Clients."""
    logger.info(message)
    disconnected: list[WebSocket] = []
    for ws in state.log_subscribers:
        try:
            if ws.client_state == WebSocketState.CONNECTED:
                await ws.send_text(message)
        except Exception:
            disconnected.append(ws)
    for ws in disconnected:
        state.log_subscribers.remove(ws)


# --- HMAC Verifikation ---
def verify_signature(payload: bytes, signature: str) -> bool:
    """Verifiziert GitHub Webhook HMAC SHA-256 Signatur."""
    if not signature.startswith("sha256="):
        return False
    expected = hmac.new(
        settings.WEBHOOK_SECRET.encode("utf-8"),
        payload,
        hashlib.sha256,
    ).hexdigest()
    return hmac.compare_digest(f"sha256={expected}", signature)


# --- Lifespan ---
@asynccontextmanager
async def lifespan(app: FastAPI):  # type: ignore[no-untyped-def]
    """Startup und Shutdown Events."""
    logger.info(LOGO)
    logger.info("DkZ CoPilot Backend v%s gestartet auf Port %d", VERSION, settings.PORT)
    logger.info("Modell: %s @ %s", settings.MODEL_NAME, settings.VLLM_URL)
    logger.info("Repo: %s/%s", settings.REPO_OWNER, settings.DEFAULT_REPO)
    logger.info("Bot: @%s | Reviewer: @%s", settings.BOT_USERNAME, settings.REVIEWER)
    yield
    logger.info("DkZ CoPilot Backend wird heruntergefahren...")


# --- FastAPI App ---
app = FastAPI(
    title="DkZ CoPilot Backend",
    version=VERSION,
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# --- Endpoints ---
@app.post("/webhook")
async def webhook(request: Request, background_tasks: BackgroundTasks) -> dict[str, str]:
    """GitHub Webhook Empfaenger mit HMAC Verifikation und Issue-Filterung."""
    # Signatur pruefen
    signature = request.headers.get("X-Hub-Signature-256", "")
    payload = await request.body()

    if not verify_signature(payload, signature):
        logger.warning("Webhook Signatur ungueltig — Request abgelehnt")
        raise HTTPException(status_code=401, detail="Ungueltige Signatur")

    # Event-Typ pruefen
    event_type = request.headers.get("X-GitHub-Event", "")
    if event_type != "issues":
        return {"status": "ignored", "reason": f"Event '{event_type}' nicht relevant"}

    data = await request.json()
    action: str = data.get("action", "")

    # Nur 'assigned' oder 'labeled' Events
    if action not in ("assigned", "labeled"):
        return {"status": "ignored", "reason": f"Action '{action}' nicht relevant"}

    issue: dict[str, Any] = data.get("issue", {})
    repo: dict[str, Any] = data.get("repository", {})

    # Filter: assignee == BOT_USERNAME oder label '🤖 copilot'
    is_bot_assigned = False
    if action == "assigned":
        assignee = data.get("assignee", {})
        is_bot_assigned = assignee.get("login", "") == settings.BOT_USERNAME

    has_copilot_label = False
    if action == "labeled":
        label = data.get("label", {})
        has_copilot_label = label.get("name", "") == "\U0001f916 copilot"

    # Auch Labels am Issue pruefen
    issue_labels = [lbl.get("name", "") for lbl in issue.get("labels", [])]
    has_copilot_label = has_copilot_label or ("\U0001f916 copilot" in issue_labels)

    # Assignees am Issue pruefen
    issue_assignees = [a.get("login", "") for a in issue.get("assignees", [])]
    is_bot_assigned = is_bot_assigned or (settings.BOT_USERNAME in issue_assignees)

    if not (is_bot_assigned or has_copilot_label):
        return {"status": "ignored", "reason": "Weder Bot-assigned noch Copilot-labeled"}

    # Issue-Daten aufbereiten
    issue_data: dict[str, Any] = {
        "number": issue.get("number"),
        "title": issue.get("title", ""),
        "body": issue.get("body", ""),
        "labels": issue_labels,
        "repo_name": repo.get("name", settings.DEFAULT_REPO),
        "repo_full_name": repo.get("full_name", f"{settings.REPO_OWNER}/{settings.DEFAULT_REPO}"),
        "html_url": issue.get("html_url", ""),
    }

    logger.info(
        "Issue #%s empfangen: %s [%s]",
        issue_data["number"],
        issue_data["title"],
        ", ".join(issue_data["labels"]),
    )

    # Agent im Background starten
    # Import hier um zirkulaere Imports zu vermeiden
    from agent import process_issue

    background_tasks.add_task(_run_agent, issue_data, process_issue)

    return {
        "status": "accepted",
        "issue": f"#{issue_data['number']}",
        "title": issue_data["title"],
    }


async def _run_agent(
    issue_data: dict[str, Any],
    process_fn: Any,
) -> None:
    """Wrapper fuer Agent-Ausfuehrung mit State-Management."""
    state.set_working(issue_data)
    try:
        await broadcast_log(f"🚀 Starte Verarbeitung: Issue #{issue_data['number']}")
        result = await process_fn(issue_data)
        state.add_to_history({
            "issue_number": issue_data["number"],
            "title": issue_data["title"],
            "result": result.get("status", "unknown"),
            "pr_url": result.get("pr_url", ""),
        })
        await broadcast_log(
            f"✅ Issue #{issue_data['number']} abgeschlossen: {result.get('status', 'unknown')}"
        )
    except Exception as exc:
        error_msg = str(exc)
        state.set_error(error_msg)
        state.add_to_history({
            "issue_number": issue_data["number"],
            "title": issue_data["title"],
            "result": "error",
            "error": error_msg,
        })
        await broadcast_log(f"❌ Issue #{issue_data['number']} fehlgeschlagen: {error_msg}")
        logger.exception("Agent Fehler bei Issue #%s", issue_data["number"])
    finally:
        state.set_idle()


@app.get("/health")
async def health() -> dict[str, Any]:
    """Health-Check Endpoint."""
    return {
        "status": "ok",
        "version": VERSION,
        "uptime_seconds": round(time.time() - state.start_time, 1),
        "model": settings.MODEL_NAME,
    }


@app.get("/status")
async def status() -> dict[str, Any]:
    """Aktueller Agent-Status."""
    return {
        "status": state.status,
        "current_issue": state.current_issue,
        "uptime_seconds": round(time.time() - state.start_time, 1),
        "history_count": len(state.history),
    }


@app.get("/history")
async def history() -> dict[str, Any]:
    """Letzte 20 verarbeitete Issues."""
    return {
        "count": len(state.history),
        "items": list(state.history),
    }


@app.websocket("/ws")
async def websocket_log(ws: WebSocket) -> None:
    """Live-Log Stream via WebSocket."""
    await ws.accept()
    state.log_subscribers.append(ws)
    logger.info("WebSocket Client verbunden (%d aktiv)", len(state.log_subscribers))
    try:
        # Willkommensnachricht
        await ws.send_text(f"🔌 DkZ CoPilot v{VERSION} — Live-Log verbunden")
        # Verbindung offen halten
        while True:
            # Auf Ping/Pong oder Client-Disconnect warten
            await ws.receive_text()
    except WebSocketDisconnect:
        pass
    finally:
        if ws in state.log_subscribers:
            state.log_subscribers.remove(ws)
        logger.info("WebSocket Client getrennt (%d aktiv)", len(state.log_subscribers))


# --- Standalone Start ---
if __name__ == "__main__":
    uvicorn.run(
        "webhook_server:app",
        host="0.0.0.0",
        port=settings.PORT,
        reload=False,
        log_level="info",
    )
