"""
DkZ CoPilot Gateway v2.0 — mit AutoSync
=========================================
ZENTRALER Eingang + AutoSync + FileWatcher + GitHub Log.
ALLES fliesst durch diesen einen Punkt.

Flow:
  Lokal (FileWatcher) → Gateway → EventLog → Git Auto-Commit
  GitHub (Webhooks)    → Gateway → EventLog → Route → Handler
  Dashboard (Tickets)  → Gateway → EventLog → James GPT
  VPS (Health/Sync)    → Gateway → EventLog → Dashboard

Port: 3060
"""

import json
import hashlib
import hmac
import os
import sys
import time
import asyncio
import logging
import subprocess
from datetime import datetime, timezone
from pathlib import Path
from typing import Optional
from collections import deque
from threading import Thread

# --- Konfig ---
GATEWAY_PORT = int(os.getenv("GATEWAY_PORT", "3060"))
WEBHOOK_SECRET = os.getenv("WEBHOOK_SECRET", "dkz-dev-secret")
VLLM_URL = os.getenv("VLLM_URL", "http://localhost:8811/v1")
LOG_DIR = Path(os.getenv("LOG_DIR", "./logs"))
EVENT_LOG_FILE = LOG_DIR / "gateway-events.jsonl"
TICKET_LOG_FILE = LOG_DIR / "tickets.jsonl"
GITHUB_LOG_FILE = LOG_DIR / "github-events.jsonl"
SYNC_LOG_FILE = LOG_DIR / "sync.jsonl"
MAX_EVENTS = 50000
RATE_LIMIT_PER_MIN = 120

# Watch Pfade (lokal)
WATCH_PATHS = [
    os.getenv("WATCH_DASHBOARD", "C:/DEVKiTZ/01_PROJECTS/01_dashboard"),
    os.getenv("WATCH_COPILOT", "C:/DEVKiTZ/01_PROJECTS/dkz-copilot"),
    os.getenv("WATCH_SHARED", "C:/DEVKiTZ/01_PROJECTS/01_dashboard/shared"),
]
WATCH_EXTENSIONS = {".html", ".css", ".js", ".json", ".py", ".java", ".md"}
AUTOSYNC_INTERVAL = int(os.getenv("AUTOSYNC_INTERVAL", "120"))  # Sekunden
GIT_ROOT = os.getenv("GIT_ROOT", "C:/DEVKiTZ")

# Downstream
DOWNSTREAM = {
    "webhook": os.getenv("WEBHOOK_URL", "http://localhost:3050"),
    "nanochat": os.getenv("NANOCHAT_URL", "http://localhost:3040"),
    "dashboard": os.getenv("DASHBOARD_URL", "http://localhost:5173"),
    "eventlog_sync": os.getenv("EVENTLOG_SYNC_URL", "http://localhost:9877"),
}

PATTERN_CODES = {
    "anfrage": "AN", "feedback": "FB", "bug": "BG",
    "idee": "ID", "prio": "PR", "ok": "OK",
    "nein": "NO", "james": "JM"
}

# --- Logging ---
LOG_DIR.mkdir(parents=True, exist_ok=True)
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    handlers=[
        logging.FileHandler(LOG_DIR / "gateway.log", encoding="utf-8"),
        logging.StreamHandler()
    ]
)
log = logging.getLogger("dkz-gateway")


# =============================================
#  EVENT STORE (dkz-eventlog.js kompatibel)
# =============================================
class EventStore:
    def __init__(self, filepath: Path, max_entries: int = MAX_EVENTS):
        self.filepath = filepath
        self.max_entries = max_entries
        self.entries = deque(maxlen=max_entries)
        self._counter = 0
        self._ticket_counter = 0
        self._load_counter()
        self._load()

    def _load(self):
        if self.filepath.exists():
            try:
                with open(self.filepath, "r", encoding="utf-8") as f:
                    for line in f:
                        if line.strip():
                            self.entries.append(json.loads(line))
            except Exception as e:
                log.warning(f"EventStore load: {e}")

    def _load_counter(self):
        cf = self.filepath.parent / "ticket-counter.txt"
        if cf.exists():
            try: self._ticket_counter = int(cf.read_text().strip())
            except: pass

    def _save_counter(self):
        cf = self.filepath.parent / "ticket-counter.txt"
        cf.write_text(str(self._ticket_counter))

    def generate_id(self) -> str:
        ts = int(time.time() * 1000)
        rnd = os.urandom(2).hex()
        return f"EVT-{ts}-{rnd}"

    def next_ticket_id(self, code: str = "XX") -> str:
        self._ticket_counter += 1
        self._save_counter()
        return f"dkz-{code}-{self._ticket_counter:03d}"

    def log(self, event_type: str, source: str, action: str,
            severity: str = "info", metadata: dict = None,
            tags: list = None, parent_id: str = None) -> dict:
        self._counter += 1
        entry = {
            "id": self.generate_id(),
            "type": event_type,
            "severity": severity,
            "source": source,
            "action": action,
            "metadata": {"module": source, "gateway": True, "counter": self._counter, **(metadata or {})},
            "tags": tags or [],
            "parentId": parent_id,
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "sessionId": f"GW-{os.getpid()}"
        }
        self.entries.append(entry)
        try:
            with open(self.filepath, "a", encoding="utf-8") as f:
                f.write(json.dumps(entry, ensure_ascii=False) + "\n")
        except Exception as e:
            log.error(f"Write error: {e}")
        return entry

    def log_ticket(self, ticket: dict) -> dict:
        try:
            with open(TICKET_LOG_FILE, "a", encoding="utf-8") as f:
                f.write(json.dumps(ticket, ensure_ascii=False) + "\n")
        except: pass
        return self.log("action", "ticket-system", f"ticket: {ticket.get('id','?')}",
                       metadata={"ticketId": ticket.get("id"), "pattern": ticket.get("pattern"),
                                 "text": ticket.get("text","")[:200]},
                       tags=["ticket", ticket.get("pattern","?")])

    def log_github(self, event_type: str, payload: dict) -> dict:
        """GitHub Event komplett loggen"""
        gh_entry = {
            "id": self.generate_id(),
            "github_event": event_type,
            "action": payload.get("action", ""),
            "repo": payload.get("repository", {}).get("full_name", ""),
            "sender": payload.get("sender", {}).get("login", ""),
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "issue": None, "pr": None, "ref": None
        }
        # Details je nach Event
        if "issue" in payload:
            gh_entry["issue"] = {
                "number": payload["issue"].get("number"),
                "title": payload["issue"].get("title"),
                "labels": [l.get("name") for l in payload["issue"].get("labels", [])],
                "state": payload["issue"].get("state")
            }
        if "pull_request" in payload:
            gh_entry["pr"] = {
                "number": payload["pull_request"].get("number"),
                "title": payload["pull_request"].get("title"),
                "state": payload["pull_request"].get("state"),
                "merged": payload["pull_request"].get("merged", False)
            }
        if "ref" in payload:
            gh_entry["ref"] = payload["ref"]

        # In GitHub-Log schreiben
        try:
            with open(GITHUB_LOG_FILE, "a", encoding="utf-8") as f:
                f.write(json.dumps(gh_entry, ensure_ascii=False) + "\n")
        except: pass

        return self.log("action", "github", f"{event_type}.{payload.get('action','')}",
                       metadata=gh_entry, tags=["github", event_type, payload.get("action","")])

    def log_sync(self, sync_type: str, files_changed: list, result: str) -> dict:
        """Sync-Event loggen"""
        sync_entry = {
            "type": sync_type,
            "files": files_changed[:20],
            "count": len(files_changed),
            "result": result,
            "timestamp": datetime.now(timezone.utc).isoformat()
        }
        try:
            with open(SYNC_LOG_FILE, "a", encoding="utf-8") as f:
                f.write(json.dumps(sync_entry, ensure_ascii=False) + "\n")
        except: pass
        return self.log("action", "autosync", f"sync-{sync_type}: {len(files_changed)} files",
                       metadata=sync_entry, tags=["sync", sync_type])

    def get_stats(self) -> dict:
        sources, types, tags = {}, {}, {}
        for e in self.entries:
            s = e.get("source", "?")
            sources[s] = sources.get(s, 0) + 1
            t = e.get("type", "?")
            types[t] = types.get(t, 0) + 1
            for tag in e.get("tags", []):
                tags[tag] = tags.get(tag, 0) + 1
        return {"total": len(self.entries), "sources": sources, "types": types, "tags": tags}

    def find_by_source(self, source: str, limit: int = 50) -> list:
        return [e for e in self.entries if e.get("source") == source][-limit:]

    def find_by_tag(self, tag: str, limit: int = 50) -> list:
        return [e for e in self.entries if tag in e.get("tags", [])][-limit:]

    def get_tickets(self, status: str = None) -> list:
        if not TICKET_LOG_FILE.exists(): return []
        tickets = []
        with open(TICKET_LOG_FILE, "r", encoding="utf-8") as f:
            for line in f:
                if line.strip():
                    t = json.loads(line)
                    if status is None or t.get("status") == status:
                        tickets.append(t)
        return tickets


# =============================================
#  FILE WATCHER — Lokale Aenderungen erkennen
# =============================================
class FileWatcher:
    """Ueberwacht Pfade auf Datei-Aenderungen"""

    def __init__(self, paths: list, extensions: set):
        self.paths = [Path(p) for p in paths if Path(p).exists()]
        self.extensions = extensions
        self.snapshots = {}
        self._take_snapshot()

    def _take_snapshot(self):
        """Aktuellen Zustand aller Dateien speichern"""
        snap = {}
        for base in self.paths:
            if not base.exists():
                continue
            for f in base.rglob("*"):
                if f.is_file() and f.suffix in self.extensions:
                    # node_modules, .git, out/ ignorieren
                    parts = f.parts
                    if any(skip in parts for skip in ["node_modules", ".git", "out", "__pycache__", ".vite"]):
                        continue
                    try:
                        snap[str(f)] = f.stat().st_mtime
                    except: pass
        self.snapshots = snap

    def check_changes(self) -> dict:
        """Aenderungen seit letztem Snapshot finden"""
        old = self.snapshots
        new_snap = {}
        changed = {"modified": [], "added": [], "deleted": []}

        for base in self.paths:
            if not base.exists():
                continue
            for f in base.rglob("*"):
                if f.is_file() and f.suffix in self.extensions:
                    parts = f.parts
                    if any(skip in parts for skip in ["node_modules", ".git", "out", "__pycache__", ".vite"]):
                        continue
                    try:
                        key = str(f)
                        mtime = f.stat().st_mtime
                        new_snap[key] = mtime
                        if key not in old:
                            changed["added"].append(key)
                        elif old[key] != mtime:
                            changed["modified"].append(key)
                    except: pass

        # Geloeschte
        for key in old:
            if key not in new_snap:
                changed["deleted"].append(key)

        self.snapshots = new_snap
        return changed


# =============================================
#  AUTO-SYNC ENGINE
# =============================================
class AutoSyncEngine:
    """Automatisches Git-Sync bei lokalen Aenderungen"""

    def __init__(self, store: EventStore, watcher: FileWatcher, git_root: str = GIT_ROOT):
        self.store = store
        self.watcher = watcher
        self.git_root = git_root
        self.last_sync = time.time()
        self.sync_count = 0

    def git_status(self) -> list:
        """git status --porcelain"""
        try:
            r = subprocess.run(
                ["git", "status", "--porcelain"],
                cwd=self.git_root, capture_output=True, text=True, timeout=10
            )
            return [l.strip() for l in r.stdout.strip().split("\n") if l.strip()]
        except:
            return []

    def git_diff_stat(self) -> str:
        try:
            r = subprocess.run(
                ["git", "diff", "--stat", "--cached"],
                cwd=self.git_root, capture_output=True, text=True, timeout=10
            )
            return r.stdout.strip()
        except:
            return ""

    def git_log_recent(self, n: int = 5) -> list:
        try:
            r = subprocess.run(
                ["git", "log", f"-{n}", "--oneline", "--format=%h %s (%ar)"],
                cwd=self.git_root, capture_output=True, text=True, timeout=10
            )
            return [l.strip() for l in r.stdout.strip().split("\n") if l.strip()]
        except:
            return []

    def auto_commit(self, changed_files: list, msg_prefix: str = "autosync") -> dict:
        """Automatisch committen wenn Aenderungen da"""
        if not changed_files:
            return {"committed": False, "reason": "no changes"}

        try:
            # git add
            subprocess.run(["git", "add", "-A"], cwd=self.git_root, timeout=15)

            # Commit-Message bauen
            file_summary = ", ".join([Path(f).name for f in changed_files[:5]])
            if len(changed_files) > 5:
                file_summary += f" +{len(changed_files)-5} more"
            ts = datetime.now().strftime("%H:%M")
            msg = f"{msg_prefix}(gateway): {file_summary} [{ts}]"

            # git commit
            r = subprocess.run(
                ["git", "commit", "-m", msg],
                cwd=self.git_root, capture_output=True, text=True, timeout=30
            )

            if r.returncode == 0:
                self.sync_count += 1
                self.store.log_sync("auto-commit", changed_files, "ok")
                log.info(f"AutoSync: {msg}")
                return {"committed": True, "message": msg, "files": len(changed_files)}
            else:
                return {"committed": False, "reason": r.stderr.strip()[:200]}
        except Exception as e:
            return {"committed": False, "error": str(e)}

    def auto_push(self) -> dict:
        """git push origin"""
        try:
            r = subprocess.run(
                ["git", "push", "origin", "HEAD"],
                cwd=self.git_root, capture_output=True, text=True, timeout=60
            )
            if r.returncode == 0:
                self.store.log("action", "autosync", "git-push", tags=["sync", "push"])
                return {"pushed": True}
            return {"pushed": False, "error": r.stderr.strip()[:200]}
        except Exception as e:
            return {"pushed": False, "error": str(e)}

    def check_and_sync(self) -> dict:
        """Kompletter Sync-Zyklus: Check → Commit → optional Push"""
        changes = self.watcher.check_changes()
        all_changed = changes["modified"] + changes["added"]

        if not all_changed and not changes["deleted"]:
            return {"synced": False, "reason": "no changes"}

        # Loggen
        self.store.log("action", "autosync", f"changes detected: {len(all_changed)} modified, {len(changes['deleted'])} deleted",
                      metadata=changes, tags=["sync", "detect"])

        # Auto-Commit
        result = self.auto_commit(all_changed + changes["deleted"])
        self.last_sync = time.time()

        return {"synced": result.get("committed", False), **result, "changes": changes}


# =============================================
#  RATE LIMITER
# =============================================
class RateLimiter:
    def __init__(self, max_per_min: int = RATE_LIMIT_PER_MIN):
        self.max = max_per_min
        self.hits = deque()

    def check(self) -> bool:
        now = time.time()
        while self.hits and self.hits[0] < now - 60:
            self.hits.popleft()
        if len(self.hits) >= self.max:
            return False
        self.hits.append(now)
        return True


# =============================================
#  HMAC
# =============================================
def verify_signature(payload: bytes, signature: str) -> bool:
    if not signature: return False
    expected = "sha256=" + hmac.new(WEBHOOK_SECRET.encode(), payload, hashlib.sha256).hexdigest()
    return hmac.compare_digest(expected, signature)


# =============================================
#  FASTAPI APP
# =============================================
try:
    from fastapi import FastAPI, Request, Response, HTTPException, BackgroundTasks
    from fastapi.middleware.cors import CORSMiddleware
    import httpx

    app = FastAPI(title="DkZ CoPilot Gateway", version="2.0.0",
                  description="Zentraler Eingang — ALLES fliesst hier durch")

    app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

    # Globals
    store = EventStore(EVENT_LOG_FILE)
    watcher = FileWatcher(WATCH_PATHS, WATCH_EXTENSIONS)
    syncer = AutoSyncEngine(store, watcher)
    limiter = RateLimiter()
    http_client = None

    # Background AutoSync Loop
    async def autosync_loop():
        """Alle N Sekunden auf Aenderungen pruefen + auto-committen"""
        while True:
            await asyncio.sleep(AUTOSYNC_INTERVAL)
            try:
                result = syncer.check_and_sync()
                if result.get("synced"):
                    log.info(f"AutoSync: {result}")
            except Exception as e:
                log.error(f"AutoSync error: {e}")

    @app.on_event("startup")
    async def startup():
        global http_client
        http_client = httpx.AsyncClient(timeout=30.0)
        store.log("system", "gateway", "startup-v2",
                 metadata={"port": GATEWAY_PORT, "watch": WATCH_PATHS, "interval": AUTOSYNC_INTERVAL})
        log.info(f"DkZ Gateway v2 auf Port {GATEWAY_PORT} — AutoSync alle {AUTOSYNC_INTERVAL}s")
        asyncio.create_task(autosync_loop())

    @app.on_event("shutdown")
    async def shutdown():
        store.log("system", "gateway", "shutdown")
        if http_client: await http_client.aclose()

    # === HEALTH ===
    @app.get("/health")
    async def health():
        stats = store.get_stats()
        git_status = syncer.git_status()
        git_log = syncer.git_log_recent(5)
        ds = {}
        for name, url in DOWNSTREAM.items():
            try:
                r = await http_client.get(f"{url}/health", timeout=3.0)
                ds[name] = "online" if r.status_code == 200 else "degraded"
            except:
                ds[name] = "offline"
        return {
            "status": "online", "version": "2.0.0", "port": GATEWAY_PORT,
            "events": stats,
            "git": {"uncommitted": len(git_status), "recent": git_log},
            "autosync": {"enabled": True, "interval": AUTOSYNC_INTERVAL, "count": syncer.sync_count,
                        "last": syncer.last_sync},
            "downstream": ds
        }

    @app.get("/status")
    async def status():
        return {"status": "online", "events": len(store.entries), "syncs": syncer.sync_count}

    # === ZENTRALER EINGANG ===
    @app.post("/gateway")
    async def gateway_entry(request: Request):
        if not limiter.check():
            raise HTTPException(429, "Rate limit")
        body = await request.body()
        try: payload = json.loads(body)
        except: raise HTTPException(400, "Invalid JSON")

        event_type = request.headers.get("x-github-event") or payload.get("type") or "unknown"
        source = "github" if request.headers.get("x-github-event") else payload.get("source", "dashboard")

        # HMAC
        sig = request.headers.get("x-hub-signature-256")
        if sig and not verify_signature(body, sig):
            store.log("error", "gateway", "hmac-failed", severity="warn", tags=["security"])
            raise HTTPException(403, "Invalid signature")

        # GitHub-spezifisch loggen
        if source == "github":
            store.log_github(event_type, payload)
        else:
            store.log("action", source, f"incoming: {event_type}",
                     metadata={"event_type": event_type, "size": len(body)},
                     tags=["gateway", "incoming", event_type])

        # Routen
        route_map = {"issues": "webhook", "issue_comment": "webhook", "pull_request": "webhook",
                     "push": "webhook", "ping": "webhook", "ticket": "nanochat", "chat": "nanochat"}
        target = route_map.get(event_type, "webhook")
        url = DOWNSTREAM.get(target, DOWNSTREAM["webhook"])

        result = {"routed": False, "target": target}
        try:
            r = await http_client.post(f"{url}/webhook", content=body,
                                       headers={"x-github-event": event_type})
            result = {"routed": True, "target": target, "status": r.status_code}
        except Exception as e:
            result = {"routed": False, "error": str(e)[:100]}

        return {"ok": True, **result}

    # === GITHUB WEBHOOK ===
    @app.post("/webhook")
    async def webhook(request: Request):
        body = await request.body()
        event_type = request.headers.get("x-github-event", "ping")
        sig = request.headers.get("x-hub-signature-256")
        if sig and not verify_signature(body, sig):
            raise HTTPException(403, "Bad signature")
        payload = json.loads(body) if body else {}
        store.log_github(event_type, payload)
        # Weiterleiten
        try:
            r = await http_client.post(f"{DOWNSTREAM['webhook']}/webhook", content=body,
                                       headers={"x-github-event": event_type})
            return {"ok": True, "status": r.status_code}
        except:
            return {"ok": False, "queued": True}

    # === TICKETS ===
    @app.post("/tickets")
    async def create_ticket(request: Request):
        data = await request.json()
        pattern = data.get("pattern", "anfrage")
        code = PATTERN_CODES.get(pattern, "XX")
        ticket = {
            "id": store.next_ticket_id(code),
            "text": data.get("text", ""),
            "pattern": pattern,
            "status": "pending",
            "created": datetime.now(timezone.utc).isoformat(),
            "assignee": data.get("assignee", "james-gpt"),
            "source": data.get("source", "gateway"),
            "response": None
        }
        store.log_ticket(ticket)
        log.info(f"Ticket: {ticket['id']} [{pattern}]")
        return {"ok": True, "ticket": ticket}

    @app.get("/tickets")
    async def list_tickets(status: Optional[str] = None):
        return {"tickets": store.get_tickets(status)}

    @app.patch("/tickets/{ticket_id}")
    async def update_ticket(ticket_id: str, request: Request):
        data = await request.json()
        tickets = store.get_tickets()
        ok = False
        for t in tickets:
            if t["id"] == ticket_id:
                t.update(data)
                ok = True
                break
        if ok:
            with open(TICKET_LOG_FILE, "w", encoding="utf-8") as f:
                for t in tickets:
                    f.write(json.dumps(t, ensure_ascii=False) + "\n")
            store.log("action", "ticket-system", f"updated: {ticket_id}", tags=["ticket"])
        return {"ok": ok}

    # === EVENTS ===
    @app.get("/events")
    async def get_events(limit: int = 50, source: str = None, tag: str = None):
        if source: events = store.find_by_source(source, limit)
        elif tag: events = store.find_by_tag(tag, limit)
        else: events = list(store.entries)[-limit:]
        return {"events": events}

    @app.get("/events/stats")
    async def event_stats():
        return store.get_stats()

    # === SYNC ===
    @app.post("/sync/now")
    async def sync_now():
        """Sofort synchronisieren"""
        result = syncer.check_and_sync()
        return {"ok": True, **result}

    @app.post("/sync/push")
    async def sync_push():
        """Commit + Push"""
        sync = syncer.check_and_sync()
        push = syncer.auto_push()
        return {"ok": True, "sync": sync, "push": push}

    @app.post("/sync/events")
    async def sync_events():
        try:
            r = await http_client.post(f"{DOWNSTREAM['eventlog_sync']}/save-events",
                                       json={"entries": list(store.entries)[-1000:]}, timeout=10)
            return {"ok": True, "synced": min(len(store.entries), 1000)}
        except Exception as e:
            return {"ok": False, "error": str(e)}

    @app.post("/sync/all")
    async def sync_all():
        results = {}
        # 1. Local changes committen
        results["local"] = syncer.check_and_sync()
        # 2. Events an Sync Server
        try:
            r = await http_client.post(f"{DOWNSTREAM['eventlog_sync']}/save-events",
                                       json={"entries": list(store.entries)[-500:]}, timeout=10)
            results["events"] = "ok"
        except: results["events"] = "offline"
        # 3. Git push
        results["push"] = syncer.auto_push()
        store.log("action", "gateway", "full-sync", metadata=results, tags=["sync", "full"])
        return {"ok": True, "results": results}

    # === GIT INFO ===
    @app.get("/git/status")
    async def git_status():
        return {"files": syncer.git_status(), "log": syncer.git_log_recent(10)}

    @app.get("/git/log")
    async def git_log(n: int = 20):
        return {"log": syncer.git_log_recent(n)}

    # === API PROXY ===
    @app.api_route("/api/{path:path}", methods=["GET", "POST", "PUT", "PATCH", "DELETE"])
    async def api_proxy(path: str, request: Request):
        body = await request.body()
        store.log("action", "gateway", f"proxy: {request.method} /api/{path}", tags=["api", "proxy"])
        try:
            r = await http_client.request(request.method, f"{DOWNSTREAM['webhook']}/api/{path}",
                                          content=body, headers={"content-type": request.headers.get("content-type", "application/json")})
            return Response(content=r.content, status_code=r.status_code)
        except:
            return {"ok": False, "error": "downstream offline"}

    log.info("FastAPI Gateway v2 ready — AutoSync + FileWatcher + GitHub Log")

except ImportError:
    log.warning("FastAPI nicht installiert")
    app = None


# === MAIN ===
if __name__ == "__main__":
    if app:
        import uvicorn
        log.info(f"DkZ Gateway v2 — Port {GATEWAY_PORT} — AutoSync {AUTOSYNC_INTERVAL}s")
        uvicorn.run(app, host="0.0.0.0", port=GATEWAY_PORT, log_level="info")
    else:
        print("pip install fastapi uvicorn httpx")
        sys.exit(1)
