import os
import sys
import time
import json
import threading
import subprocess
import urllib.request
import datetime

from second_brain import query_second_brain

if sys.stdout.encoding != 'utf-8':
    sys.stdout.reconfigure(encoding='utf-8')

# Konfiguration
DEVKITZ_REPO = "C:\\DEVKiTZ"
ISSUES_DIR = os.path.join(DEVKITZ_REPO, "04_SYSTEM", "ISSUES")
PAPERLESS_DIR = os.path.join(DEVKITZ_REPO, "Paperless_Inbox")
STAGING_DIR = os.path.join(PAPERLESS_DIR, "staging")
KANBAN_PATH = os.path.join(DEVKITZ_REPO, "KANBAN_AUTO.md")
WALKTHROUGH_PATH = os.path.join(DEVKITZ_REPO, "WALKTHROUGH_AUTO.md")
LOCAL_OLLAMA_URL = "http://localhost:11434/v1/chat/completions"
VPS_OLLAMA_URL = "http://srv1298466.hstgr.cloud:11435/v1/chat/completions"
MANAGER_MODEL = "mistral-nemo:12b" # Nemotron

is_running = False

def run_git_command(args, cwd=DEVKITZ_REPO):
    try:
        res = subprocess.run(["git"] + args, cwd=cwd, capture_output=True, text=True, encoding='utf-8', check=True)
        return res.stdout.strip()
    except subprocess.CalledProcessError as e:
        print(f"❌ [Git Nexus] Git Fehler: {e.stderr}")
        return None

def check_vps_connection():
    try:
        req = urllib.request.Request("http://srv1298466.hstgr.cloud:11435/", method="GET")
        with urllib.request.urlopen(req, timeout=2) as r:
            return r.status == 200
    except:
        return False

def select_best_llm(task_category):
    vps_online = check_vps_connection()
    if vps_online:
        # VPS Models (Internet)
        mapping = {
            "code": "qwen2.5-coder:7b",
            "logic": "qwen2.5:32b",
            "vision": "gemma3:4b",
            "ocr": "qwen2.5-vl:7b",
            "design": "gemma4:12b",
            "docs": "qwen2.5:7b",
            "default": "qwen2.5:3b"
        }
        return mapping.get(task_category, mapping["default"]), VPS_OLLAMA_URL
    else:
        # Local Models (Offline)
        mapping = {
            "code": "deepseek-coder-v2",
            "logic": "mistral-nemo:12b",
            "vision": "gemma4:12b",
            "audio": "gemma4:12b",
            "design": "gemma4:12b",
            "ocr": "qwen2-vl",
            "docs": "qwen2.5-coder:7b",
            "default": "mistral-nemo:12b"
        }
        return mapping.get(task_category, mapping["default"]), LOCAL_OLLAMA_URL

def ask_llm(prompt, model, url, system_prompt="Du bist ein hilfreicher KI Agent."):
    data = {
        "model": model,
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": prompt}
        ],
        "temperature": 0.2
    }
    req = urllib.request.Request(url, data=json.dumps(data).encode('utf-8'), headers={'Content-Type': 'application/json'})
    try:
        with urllib.request.urlopen(req) as response:
            res = json.loads(response.read().decode('utf-8'))
            return res.get('choices', [{}])[0].get('message', {}).get('content', '')
    except Exception as e:
        print(f"❌ [LLM] API Error bei {model} auf {url}: {e}")
        return "Fehler bei der Generierung."

def nanobot_agent_delegate(task_instruction, category):
    model, url = select_best_llm(category)
    print(f"🤖 [Nanobot] Spawne Agent für Kategorie '{category}' -> Nutze {model} via {url}")
    
    sys_prompt = f"Du bist ein spezialisierter Nanobot-Agent für den Bereich '{category}'. Arbeite hochpräzise und standardisiert nach den DEVKiTZ Regeln."
    return ask_llm(task_instruction, model, url, sys_prompt)

def process_issue(issue_file):
    issue_name = os.path.basename(issue_file)
    is_paperclip = issue_name.startswith("PC-")

    print(f"🐙 [Git Nexus] Nemotron analysiert Issue: {issue_name}")
    with open(issue_file, 'r', encoding='utf-8') as f:
        issue_content = f.read()

    # Second Brain Analyse
    print("🧠 [Git Nexus] Hole Kontext vom Second Brain...")
    brain_context = query_second_brain("REGELWERK Guidelines für " + issue_content[:50])

    # Nemotron splittet die Arbeit und delegiert an Nanobots
    print(f"🐙 [Git Nexus] Nemotron delegiert Aufgaben an Nanobots...")
    
    # Task 1: KANBAN Update (Docs) — paperclip-spezifisch oder generisch
    if is_paperclip:
        kanban_prompt = (
            f"Kontext:\n{brain_context}\n\n"
            f"Aktualisiere das KANBAN Board für dieses Paperclip-Issue. "
            f"Das Board ist eine Markdown-Tabelle mit Spalten: ID | Status | Owner | KW | Beschreibung. "
            f"Setze Status auf 'Done' und füge neue Zeilen für Folge-Issues hinzu.\n{issue_content}"
        )
    else:
        kanban_prompt = f"Kontext:\n{brain_context}\n\nErstelle ein sauberes KANBAN Update (JSON oder Markdown) für dieses Issue:\n{issue_content}"
    kanban_solution = nanobot_agent_delegate(kanban_prompt, "docs")
    
    # Task 2: WALKTHROUGH Update (Logic/Docs)
    walkthrough_prompt = f"Fasse die Bearbeitung dieses Issues in 3 kurzen Sätzen für das WALKTHROUGH Protokoll zusammen:\n{issue_content}"
    walkthrough_solution = nanobot_agent_delegate(walkthrough_prompt, "logic")

    # Git Operations
    branch_name = "auto-issue-" + str(int(time.time()))
    print(f"🐙 [Git Nexus] Erstelle Branch: {branch_name}")
    run_git_command(["checkout", "-b", branch_name])

    with open(KANBAN_PATH, 'w', encoding='utf-8') as f:
        f.write(kanban_solution)
    run_git_command(["add", "KANBAN_AUTO.md"])

    with open(WALKTHROUGH_PATH, 'a', encoding='utf-8') as f:
        f.write(f"\n## {datetime.date.today()} — Issue: {issue_name}\n{walkthrough_solution}\n")
    run_git_command(["add", "WALKTHROUGH_AUTO.md"])

    # Commit and return
    run_git_command(["commit", "-m", f"docs(auto): Processed {issue_name} via Nanobot Agent Swarm"])
    print("🐙 [Git Nexus] Git Commit erstellt. Gehe zurück zum Main-Branch.")
    run_git_command(["checkout", "main"])

    # Issue als erledigt markieren
    done_file = issue_file + ".done"
    os.rename(issue_file, done_file)
    print("✅ [Git Nexus] Issue erfolgreich durch Nanobot-Schwarm verarbeitet.")


def process_paperless_file(json_file):
    """Verarbeitet Paperless JSON-Dateien aus Paperless_Inbox/."""
    json_name = os.path.basename(json_file)
    print(f"📄 [Git Nexus] Paperless Inbox Eintrag gefunden: {json_name}")

    try:
        with open(json_file, 'r', encoding='utf-8') as f:
            payload = json.load(f)
    except json.JSONDecodeError as e:
        print(f"❌ [Git Nexus] Ungültiges JSON in {json_name}: {e}")
        fehler_file = json_file + ".error"
        os.rename(json_file, fehler_file)
        return

    # Validiere Pflichtfelder
    title = payload.get("title", "unnamed_paperclip")
    created = payload.get("created", datetime.datetime.now().isoformat())
    tags = payload.get("tags", ["paperclip"])
    content = payload.get("content", "")

    # Schreibe als Markdown-Archiv in Issues (paperclip-archiviert)
    archive_name = f"clip_{created[:10]}_{title.replace(' ', '_')}.md"
    archive_path = os.path.join(ISSUES_DIR, archive_name)
    archive_md = (
        f"# Paperclip: {title}\n\n"
        f"**Datum:** {created}\n"
        f"**Tags:** {', '.join(tags)}\n\n"
        f"{content}\n"
    )
    with open(archive_path, 'w', encoding='utf-8') as f:
        f.write(archive_md)

    # Log in Walkthrough
    walkthrough_entry = (
        f"\n## {datetime.date.today()} — Paperclip: {title}\n"
        f"- Quelle: {json_name}\n"
        f"- Tags: {', '.join(tags)}\n"
        f"- Archiviert: {archive_name}\n"
    )
    with open(WALKTHROUGH_PATH, 'a', encoding='utf-8') as f:
        f.write(walkthrough_entry)

    # Git Commit
    run_git_command(["add", archive_path])
    run_git_command(["add", WALKTHROUGH_PATH])
    run_git_command(["commit", "-m", f"clip(auto): Ingested {title} from Paperless Inbox"])

    # Als erledigt markieren
    done_file = json_file + ".done"
    os.rename(json_file, done_file)
    print(f"✅ [Git Nexus] Paperclip {title} archiviert und committed.")

def send_to_nemotron(prompt, source="git_nexus"):
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

def autonomous_loop():
    global is_running
    is_running = True
    print("🐙 [Git Nexus/Nemotron] Autonomer Hintergrund-Worker gestartet. Prüfe Issues...")
    
    if not os.path.exists(ISSUES_DIR):
        os.makedirs(ISSUES_DIR, exist_ok=True)
    if not os.path.exists(PAPERLESS_DIR):
        os.makedirs(PAPERLESS_DIR, exist_ok=True)
    if not os.path.exists(STAGING_DIR):
        os.makedirs(STAGING_DIR, exist_ok=True)
        
    while is_running:
        # Issues verarbeiten
        if os.path.isdir(ISSUES_DIR):
            for file in os.listdir(ISSUES_DIR):
                if file.endswith(".md") and not file.endswith(".done"):
                    issue_path = os.path.join(ISSUES_DIR, file)
                    process_issue(issue_path)
        # Staging-Verzeichnis verarbeiten (NUR staging/ — nie root inbox)
        # Consumer legt validierte Dateien in staging/ ab, wir holen sie von dort
        if os.path.isdir(STAGING_DIR):
            for file in os.listdir(STAGING_DIR):
                if not file.endswith(".json"):
                    continue
                if file.endswith(".done") or file.endswith(".error") or file.endswith(".processing"):
                    continue
                lock_file = os.path.join(STAGING_DIR, file + ".processing")
                try:
                    with open(lock_file, "x") as f:
                        f.write(str(time.time()))
                except FileExistsError:
                    continue
                try:
                    json_path = os.path.join(STAGING_DIR, file)
                    process_paperless_file(json_path)
                except Exception as e:
                    print(f"❌ [Git Nexus] Fehler bei {file}: {e}")
                    send_to_nemotron(f"Git Nexus Fehler bei {file}: {e}")
                finally:
                    if os.path.exists(lock_file):
                        os.remove(lock_file)
                
        time.sleep(10) # Alle 10 Sekunden prüfen

def start_background_worker():
    t = threading.Thread(target=autonomous_loop, daemon=True)
    t.start()

def sync_git():
    if not is_running:
        start_background_worker()
        return "Autonomer Git Nexus Loop gestartet."
    return "Git Nexus läuft bereits im Hintergrund."

if __name__ == "__main__":
    autonomous_loop()
