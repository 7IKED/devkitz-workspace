#!/usr/bin/env python3
"""
DkZ Project Automator v1.0
==========================
Automatisiert GitHub Project #5 Timeline (D-VKITZ Ecosystem Kanban)

Features:
- Webhook-Empfang (Flask) → Auto-Eintrag ins Kanban
- Time Check-In → Timestamps + Status-Updates
- Issue-Erstellung bei Prompt-Eingang
- Dokumentation + Source auto-update
- Kein LLM — rein event-driven

Usage:
  python dkz-project-automator.py serve          # Webhook-Server starten (Port 3050)
  python dkz-project-automator.py add "Titel"    # Item manuell hinzufuegen
  python dkz-project-automator.py issue "Titel" "Body"  # Issue erstellen + ins Board
  python dkz-project-automator.py status          # Alle Items + Status anzeigen
  python dkz-project-automator.py sync            # Alle offenen Issues ins Board synchen
  python dkz-project-automator.py checkin "Msg"   # Time Check-In (Timestamp + Log)

Env:
  GITHUB_TOKEN  — Personal Access Token mit project + repo Scopes
  ORG           — GitHub Org (default: D-VKITZ)
  PROJECT_NUM   — Projekt-Nummer (default: 5)
"""

import os
import sys
import json
import hashlib
import hmac
from datetime import datetime, timezone
from urllib.request import Request, urlopen
from urllib.error import HTTPError

# ═══ CONFIG ═══
ORG = os.environ.get("ORG", "D-VKITZ")
PROJECT_NUM = int(os.environ.get("PROJECT_NUM", "5"))
REPO = os.environ.get("REPO", "D-VKITZ.github.io")
GITHUB_TOKEN = os.environ.get("GITHUB_TOKEN", "")
WEBHOOK_SECRET = os.environ.get("WEBHOOK_SECRET", "dkz-automator-secret")
PORT = int(os.environ.get("PORT", "3050"))

# Projekt-IDs (D-VKITZ Ecosystem Kanban)
PROJECT_ID = "PVT_kwDOERvAec4BZD6a"
STATUS_FIELD_ID = "PVTSSF_lADOERvAec4BZD6azhUFRrc"
STATUS_OPTIONS = {
    "todo": "f75ad846",
    "in_progress": "47fc9ee4",
    "done": "98236657"
}

# Log-Datei
LOG_FILE = os.path.join(os.path.dirname(__file__), "automator.log")

def log(msg):
    ts = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    line = f"[{ts}] {msg}"
    print(line)
    with open(LOG_FILE, "a", encoding="utf-8") as f:
        f.write(line + "\n")


# ═══════════════════════════════════════
# GITHUB GRAPHQL API
# ═══════════════════════════════════════
def graphql(query, variables=None):
    """GitHub GraphQL API Aufruf"""
    token = GITHUB_TOKEN
    if not token:
        # Fallback: gh auth token
        import subprocess
        try:
            r = subprocess.run(["gh", "auth", "token"], capture_output=True, text=True, timeout=5)
            token = r.stdout.strip()
        except Exception:
            pass
    if not token:
        raise RuntimeError("Kein GITHUB_TOKEN gesetzt! Export: set GITHUB_TOKEN=ghp_...")

    payload = json.dumps({"query": query, "variables": variables or {}}).encode()
    req = Request("https://api.github.com/graphql", data=payload, method="POST")
    req.add_header("Authorization", f"Bearer {token}")
    req.add_header("Content-Type", "application/json")
    req.add_header("Accept", "application/json")

    try:
        with urlopen(req, timeout=15) as resp:
            data = json.loads(resp.read())
            if "errors" in data:
                log(f"GraphQL Error: {data['errors']}")
            return data
    except HTTPError as e:
        body = e.read().decode()
        log(f"HTTP {e.code}: {body}")
        raise


def rest_api(method, endpoint, data=None):
    """GitHub REST API Aufruf"""
    token = GITHUB_TOKEN
    if not token:
        import subprocess
        try:
            r = subprocess.run(["gh", "auth", "token"], capture_output=True, text=True, timeout=5)
            token = r.stdout.strip()
        except Exception:
            pass

    url = f"https://api.github.com{endpoint}"
    payload = json.dumps(data).encode() if data else None
    req = Request(url, data=payload, method=method)
    req.add_header("Authorization", f"Bearer {token}")
    req.add_header("Content-Type", "application/json")
    req.add_header("Accept", "application/vnd.github+json")

    with urlopen(req, timeout=15) as resp:
        return json.loads(resp.read()) if resp.status != 204 else {}


# ═══════════════════════════════════════
# PROJECT OPERATIONS
# ═══════════════════════════════════════
def add_draft_item(title, status="todo"):
    """Draft-Item ins Projekt hinzufuegen"""
    q = """
    mutation($projectId: ID!, $title: String!) {
        addProjectV2DraftItem(input: {projectId: $projectId, title: $title}) {
            projectItem { id }
        }
    }
    """
    result = graphql(q, {"projectId": PROJECT_ID, "title": title})
    item_id = result.get("data", {}).get("addProjectV2DraftItem", {}).get("projectItem", {}).get("id")
    if item_id and status in STATUS_OPTIONS:
        set_item_status(item_id, status)
    log(f"[ADD] '{title}' → Status: {status} (ID: {item_id})")
    return item_id


def add_issue_to_project(issue_node_id):
    """Existierendes Issue ins Projekt hinzufuegen"""
    q = """
    mutation($projectId: ID!, $contentId: ID!) {
        addProjectV2ItemByContentId(input: {projectId: $projectId, contentId: $contentId}) {
            item { id }
        }
    }
    """
    result = graphql(q, {"projectId": PROJECT_ID, "contentId": issue_node_id})
    item_id = result.get("data", {}).get("addProjectV2ItemByContentId", {}).get("item", {}).get("id")
    log(f"[LINK] Issue → Projekt (Item: {item_id})")
    return item_id


def set_item_status(item_id, status):
    """Status eines Items setzen (todo/in_progress/done)"""
    option_id = STATUS_OPTIONS.get(status)
    if not option_id:
        log(f"[WARN] Unbekannter Status: {status}")
        return
    q = """
    mutation($projectId: ID!, $itemId: ID!, $fieldId: ID!, $value: ProjectV2FieldValue!) {
        updateProjectV2ItemFieldValue(input: {
            projectId: $projectId, itemId: $itemId, fieldId: $fieldId, value: $value
        }) { projectV2Item { id } }
    }
    """
    graphql(q, {
        "projectId": PROJECT_ID,
        "itemId": item_id,
        "fieldId": STATUS_FIELD_ID,
        "value": {"singleSelectOptionId": option_id}
    })
    log(f"[STATUS] {item_id} → {status}")


def list_items():
    """Alle Items im Projekt auflisten"""
    q = """
    query($projectId: ID!) {
        node(id: $projectId) {
            ... on ProjectV2 {
                items(first: 100) {
                    nodes {
                        id
                        content {
                            ... on DraftIssue { title }
                            ... on Issue { title number url }
                            ... on PullRequest { title number url }
                        }
                        fieldValues(first: 10) {
                            nodes {
                                ... on ProjectV2ItemFieldSingleSelectValue {
                                    name
                                    field { ... on ProjectV2SingleSelectField { name } }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
    """
    result = graphql(q, {"projectId": PROJECT_ID})
    items = result.get("data", {}).get("node", {}).get("items", {}).get("nodes", [])
    return items


# ═══════════════════════════════════════
# ISSUE OPERATIONS
# ═══════════════════════════════════════
def create_issue(title, body="", labels=None, repo=None):
    """Issue erstellen und ins Projekt linken"""
    repo = repo or REPO
    data = {"title": title, "body": body}
    if labels:
        data["labels"] = labels

    issue = rest_api("POST", f"/repos/{ORG}/{repo}/issues", data)
    issue_num = issue.get("number")
    issue_node_id = issue.get("node_id")
    log(f"[ISSUE] #{issue_num} erstellt: {title}")

    # Ins Projekt linken
    if issue_node_id:
        item_id = add_issue_to_project(issue_node_id)
        if item_id:
            set_item_status(item_id, "todo")

    return issue


# ═══════════════════════════════════════
# TIME CHECK-IN
# ═══════════════════════════════════════
def checkin(message):
    """Time Check-In: Timestamp + Message als Kanban-Eintrag"""
    ts = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M UTC")
    title = f"⏰ Check-In: {message} [{ts}]"
    item_id = add_draft_item(title, "in_progress")
    log(f"[CHECKIN] {message} @ {ts}")
    return item_id


# ═══════════════════════════════════════
# SYNC: Offene Issues → Projekt
# ═══════════════════════════════════════
def sync_issues(repo=None):
    """Alle offenen Issues eines Repos ins Projekt synchen"""
    repo = repo or REPO
    issues = rest_api("GET", f"/repos/{ORG}/{repo}/issues?state=open&per_page=100")
    count = 0
    for issue in issues:
        if issue.get("pull_request"):
            continue  # PRs ueberspringen
        node_id = issue.get("node_id")
        title = issue.get("title", "")
        if node_id:
            try:
                add_issue_to_project(node_id)
                count += 1
                log(f"[SYNC] #{issue['number']} {title}")
            except Exception as e:
                log(f"[SYNC-SKIP] #{issue.get('number')} (bereits im Board oder Fehler: {e})")
    log(f"[SYNC] {count} Issues aus {ORG}/{repo} synchronisiert")
    return count


# ═══════════════════════════════════════
# WEBHOOK HANDLER
# ═══════════════════════════════════════
def handle_webhook(event_type, payload):
    """Webhook-Event verarbeiten und Kanban-Timeline bestuecken"""
    action = payload.get("action", "")
    ts = datetime.now(timezone.utc).strftime("%H:%M")

    # ── PUSH (Commit) ──
    if event_type == "push":
        commits = payload.get("commits", [])
        ref = payload.get("ref", "").split("/")[-1]
        pusher = payload.get("pusher", {}).get("name", "unknown")
        for commit in commits[:5]:  # Max 5 Commits
            msg = commit.get("message", "").split("\n")[0][:80]
            title = f"📦 Commit: {msg} ({pusher}@{ref}) [{ts}]"
            add_draft_item(title, "done")
        log(f"[WEBHOOK] push: {len(commits)} commits von {pusher}")

    # ── ISSUE ──
    elif event_type == "issues":
        issue = payload.get("issue", {})
        title = issue.get("title", "")
        node_id = issue.get("node_id")
        if action == "opened" and node_id:
            item_id = add_issue_to_project(node_id)
            if item_id:
                set_item_status(item_id, "todo")
            log(f"[WEBHOOK] issue opened: #{issue.get('number')} {title}")
        elif action == "closed" and node_id:
            # Status auf Done setzen (muessten Item-ID finden)
            log(f"[WEBHOOK] issue closed: #{issue.get('number')} {title}")

    # ── PULL REQUEST ──
    elif event_type == "pull_request":
        pr = payload.get("pull_request", {})
        title = pr.get("title", "")
        if action == "opened":
            add_draft_item(f"🔀 PR: {title} [{ts}]", "in_progress")
        elif action in ("closed", "merged"):
            merged = pr.get("merged", False)
            status = "done" if merged else "todo"
            add_draft_item(f"{'✅' if merged else '❌'} PR: {title} [{ts}]", status)
        log(f"[WEBHOOK] PR {action}: {title}")

    # ── WORKFLOW RUN (CI/CD) ──
    elif event_type == "workflow_run":
        wf = payload.get("workflow_run", {})
        name = wf.get("name", "")
        conclusion = wf.get("conclusion", "")
        if action == "completed":
            icon = "✅" if conclusion == "success" else "❌"
            add_draft_item(f"{icon} CI: {name} ({conclusion}) [{ts}]", "done" if conclusion == "success" else "todo")
            log(f"[WEBHOOK] workflow: {name} → {conclusion}")

    # ── RELEASE ──
    elif event_type == "release":
        release = payload.get("release", {})
        tag = release.get("tag_name", "")
        name = release.get("name", tag)
        if action == "published":
            add_draft_item(f"🚀 Release: {name} [{ts}]", "done")
            log(f"[WEBHOOK] release: {name}")

    # ── CUSTOM (eigener Trigger) ──
    elif event_type == "repository_dispatch" or event_type == "custom":
        client_payload = payload.get("client_payload", payload)
        title = client_payload.get("title", "Custom Event")
        status = client_payload.get("status", "todo")
        body = client_payload.get("body", "")
        add_draft_item(f"⚡ {title} [{ts}]", status)
        # Optional: Issue erstellen
        if client_payload.get("create_issue"):
            create_issue(title, body, labels=client_payload.get("labels", []))
        log(f"[WEBHOOK] custom: {title}")

    else:
        log(f"[WEBHOOK] Unbekanntes Event: {event_type} ({action})")


# ═══════════════════════════════════════
# FLASK WEBHOOK SERVER
# ═══════════════════════════════════════
def serve():
    """Webhook-Server starten (Flask)"""
    try:
        from flask import Flask, request, jsonify
    except ImportError:
        print("Flask nicht installiert. Installiere mit: pip install flask")
        print("Oder nutze den Standalone-Modus: python dkz-project-automator.py add 'Titel'")
        sys.exit(1)

    app = Flask("DkZ-Automator")

    @app.route("/", methods=["GET"])
    def index():
        return jsonify({
            "service": "DkZ Project Automator v1.0",
            "org": ORG,
            "project": PROJECT_NUM,
            "project_id": PROJECT_ID,
            "endpoints": {
                "POST /webhook": "GitHub Webhook Empfaenger",
                "POST /trigger": "Custom Trigger (JSON: {title, status, body})",
                "POST /checkin": "Time Check-In (JSON: {message})",
                "POST /issue": "Issue erstellen (JSON: {title, body, labels})",
                "GET /status": "Alle Items anzeigen"
            }
        })

    @app.route("/webhook", methods=["POST"])
    def webhook():
        # Signature pruefen
        sig = request.headers.get("X-Hub-Signature-256", "")
        if WEBHOOK_SECRET and sig:
            expected = "sha256=" + hmac.new(
                WEBHOOK_SECRET.encode(), request.data, hashlib.sha256
            ).hexdigest()
            if not hmac.compare_digest(sig, expected):
                return jsonify({"error": "Invalid signature"}), 403

        event = request.headers.get("X-GitHub-Event", "ping")
        if event == "ping":
            return jsonify({"msg": "pong", "zen": request.json.get("zen", "")})

        payload = request.json or {}
        handle_webhook(event, payload)
        return jsonify({"ok": True, "event": event})

    @app.route("/trigger", methods=["POST"])
    def trigger():
        data = request.json or {}
        handle_webhook("custom", data)
        return jsonify({"ok": True, "title": data.get("title", "")})

    @app.route("/checkin", methods=["POST"])
    def checkin_endpoint():
        data = request.json or {}
        msg = data.get("message", "Manual Check-In")
        item_id = checkin(msg)
        return jsonify({"ok": True, "item_id": item_id, "message": msg})

    @app.route("/issue", methods=["POST"])
    def issue_endpoint():
        data = request.json or {}
        title = data.get("title", "Neues Issue")
        body = data.get("body", "")
        labels = data.get("labels", [])
        issue = create_issue(title, body, labels)
        return jsonify({"ok": True, "number": issue.get("number"), "url": issue.get("html_url")})

    @app.route("/status", methods=["GET"])
    def status():
        items = list_items()
        result = []
        for item in items:
            content = item.get("content", {}) or {}
            title = content.get("title", "???")
            st = "—"
            for fv in item.get("fieldValues", {}).get("nodes", []):
                if fv.get("name"):
                    st = fv["name"]
            result.append({"title": title, "status": st, "id": item.get("id")})
        return jsonify({"count": len(result), "items": result})

    log(f"[SERVER] DkZ Project Automator v1.0 → Port {PORT}")
    log(f"[SERVER] Webhook URL: http://localhost:{PORT}/webhook")
    log(f"[SERVER] Org: {ORG} | Project: #{PROJECT_NUM}")
    app.run(host="0.0.0.0", port=PORT, debug=False)


# ═══════════════════════════════════════
# CLI
# ═══════════════════════════════════════
def main():
    if len(sys.argv) < 2:
        print(__doc__)
        sys.exit(0)

    cmd = sys.argv[1].lower()

    if cmd == "serve":
        serve()

    elif cmd == "add":
        title = " ".join(sys.argv[2:]) or "Neuer Eintrag"
        status = "todo"
        # Optional: --status=in_progress
        for arg in sys.argv[2:]:
            if arg.startswith("--status="):
                status = arg.split("=")[1]
                title = title.replace(arg, "").strip()
        add_draft_item(title, status)

    elif cmd == "issue":
        title = sys.argv[2] if len(sys.argv) > 2 else "Neues Issue"
        body = sys.argv[3] if len(sys.argv) > 3 else ""
        create_issue(title, body)

    elif cmd == "checkin":
        msg = " ".join(sys.argv[2:]) or "Session Check-In"
        checkin(msg)

    elif cmd == "status":
        items = list_items()
        print(f"\n{'='*60}")
        print(f"  DEVKiTZ Ecosystem Kanban — {len(items)} Items")
        print(f"{'='*60}")
        for item in items:
            content = item.get("content", {}) or {}
            title = content.get("title", "???")
            st = "—"
            for fv in item.get("fieldValues", {}).get("nodes", []):
                if fv.get("name"):
                    st = fv["name"]
            icon = {"Todo": "⬜", "In Progress": "🔵", "Done": "✅"}.get(st, "⬜")
            print(f"  {icon} {st:12s} │ {title[:60]}")
        print(f"{'='*60}\n")

    elif cmd == "sync":
        repo = sys.argv[2] if len(sys.argv) > 2 else REPO
        sync_issues(repo)

    else:
        print(f"Unbekannter Befehl: {cmd}")
        print(__doc__)


if __name__ == "__main__":
    main()
