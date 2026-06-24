import os
import sys
import json
import time
import datetime
import urllib.request
import urllib.error

if sys.stdout.encoding != 'utf-8':
    sys.stdout.reconfigure(encoding='utf-8')

PAPERLESS_INBOX = os.path.join("C:\\DEVKiTZ", "Paperless_Inbox")
STAGING_DIR = os.path.join(PAPERLESS_INBOX, "staging")
PROCESSED_DIR = os.path.join(PAPERLESS_INBOX, "processed")
ERROR_DIR = os.path.join(PAPERLESS_INBOX, "error")

PAPERLESS_API_URL = os.environ.get("PAPERLESS_API_URL", "")
PAPERLESS_API_KEY = os.environ.get("PAPERLESS_API_KEY", "")

REQUIRED_FIELDS = ["title", "created", "content"]
OPTIONAL_FIELDS = {
    "correspondent": str,
    "document_type": str,
    "tags": list,
    "custom_fields": dict,
}


def validate_schema(payload: dict) -> list[str]:
    errors = []
    for field in REQUIRED_FIELDS:
        if field not in payload:
            errors.append(f"Fehlendes Pflichtfeld: {field}")
    for field, expected_type in OPTIONAL_FIELDS.items():
        if field in payload and not isinstance(payload[field], expected_type):
            errors.append(
                f"Falscher Typ für {field}: erwartet {expected_type.__name__}, "
                f"bekam {type(payload[field]).__name__}"
            )
    if "tags" in payload:
        for tag in payload["tags"]:
            if not isinstance(tag, str):
                errors.append(f"Tags müssen Strings sein, bekam {type(tag).__name__}")
    return errors


def send_to_nemotron(prompt, source="paperless-consumer"):
    """Sendet eine Nachricht an den Antigravity/Nemotron Swarm Orchestrator."""
    url = "http://localhost:3060/api/v1/swarm/task"
    payload = json.dumps({"prompt": prompt, "source": source}).encode("utf-8")
    try:
        req = urllib.request.Request(url, data=payload, headers={"Content-Type": "application/json"}, method="POST")
        with urllib.request.urlopen(req, timeout=5) as resp:
            print(f"  🤖 [Nemotron Webhook] Gesendet: {resp.status}")
            return True
    except Exception as e:
        print(f"  ⚠️ [Nemotron Webhook] Fehler: {e}")
        return False


def push_to_paperless(payload: dict) -> bool:
    if not PAPERLESS_API_URL or not PAPERLESS_API_KEY:
        print("  ⏭️  Keine Paperless-ngx API konfiguriert (PAPERLESS_API_URL/KEY). Überspringe Push.")
        return True
    url = f"{PAPERLESS_API_URL.rstrip('/')}/api/documents/post_document/"
    headers = {
        "Authorization": f"Token {PAPERLESS_API_KEY}",
        "Content-Type": "application/json",
    }
    data = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(url, data=data, headers=headers, method="POST")
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            print(f"  ✅ Paperless-ngx antwortete: {resp.status}")
            return True
    except urllib.error.HTTPError as e:
        body = e.read().decode("utf-8", errors="replace")
        print(f"  ❌ Paperless-ngx Fehler {e.code}: {body[:200]}")
        return False
    except urllib.error.URLError as e:
        print(f"  ❌ Netzwerkfehler: {e.reason}")
        return False


def process_file(json_path: str):
    filename = os.path.basename(json_path)
    print(f"\n📄 Paperless Consumer verarbeitet: {filename}")

    try:
        with open(json_path, "r", encoding="utf-8") as f:
            payload = json.load(f)
    except json.JSONDecodeError as e:
        print(f"  ❌ Ungültiges JSON: {e}")
        send_to_nemotron(f"JSON decode error in {filename}: {e}")
        os.makedirs(ERROR_DIR, exist_ok=True)
        os.rename(json_path, os.path.join(ERROR_DIR, filename))
        return

    validation_errors = validate_schema(payload)
    if validation_errors:
        print(f"  ❌ Validierungsfehler:")
        for err in validation_errors:
            print(f"     - {err}")
        send_to_nemotron(f"Validation failed for {filename}: {validation_errors}")
        os.makedirs(ERROR_DIR, exist_ok=True)
        os.rename(json_path, os.path.join(ERROR_DIR, filename))
        return

    title = payload.get("title", "untitled")
    print(f"  📌 Titel: {title}")
    print(f"  🏷️  Tags: {payload.get('tags', [])}")

    success = push_to_paperless(payload)
    if success:
        os.makedirs(STAGING_DIR, exist_ok=True)
        os.rename(json_path, os.path.join(STAGING_DIR, filename))
        print(f"  ✅ {filename} -> staging/ (wartet auf git_nexus)")
    else:
        print(f"  ⚠️  {filename} bleibt in Paperless_Inbox/ (Push fehlgeschlagen)")
        send_to_nemotron(f"Paperless push failed for {filename} — stuck in inbox")


def main():
    os.makedirs(PAPERLESS_INBOX, exist_ok=True)
    os.makedirs(STAGING_DIR, exist_ok=True)
    os.makedirs(PROCESSED_DIR, exist_ok=True)
    os.makedirs(ERROR_DIR, exist_ok=True)

    print(f"📬 Paperless Consumer gestartet")
    print(f"   Überwache: {PAPERLESS_INBOX}")
    if PAPERLESS_API_URL:
        print(f"   Ziel-API: {PAPERLESS_API_URL}")
    else:
        print(f"   ⚠️  Keine API konfiguriert — nur Validierung, kein Push")

    staging_pending = set()

    while True:
        try:
            # Phase 1: Neue JSON-Dateien in Inbox validieren → staging/
            found = False
            for entry in sorted(os.listdir(PAPERLESS_INBOX)):
                if not entry.endswith(".json"):
                    continue
                if entry.endswith(".done") or entry.endswith(".error"):
                    continue
                json_path = os.path.join(PAPERLESS_INBOX, entry)
                if os.path.isfile(json_path):
                    process_file(json_path)
                    found = True
                    staging_pending.add(entry)

            # Phase 2: Bearbeitete Dateien aus staging/ nach processed/ archivieren
            if os.path.isdir(STAGING_DIR):
                for entry in sorted(os.listdir(STAGING_DIR)):
                    if entry.endswith(".json.done"):
                        src = os.path.join(STAGING_DIR, entry)
                        dst = os.path.join(PROCESSED_DIR, entry)
                        os.makedirs(PROCESSED_DIR, exist_ok=True)
                        os.rename(src, dst)
                        print(f"  📦 {entry} -> processed/")
                        staging_pending.discard(entry.replace(".json.done", ".json"))

            if not found and not staging_pending:
                print(".", end="", flush=True)
        except Exception as e:
            print(f"\n❌ [Consumer Loop] Unerwarteter Fehler: {e}")
            send_to_nemotron(f"Consumer loop error: {e}")
        time.sleep(15)


if __name__ == "__main__":
    main()
