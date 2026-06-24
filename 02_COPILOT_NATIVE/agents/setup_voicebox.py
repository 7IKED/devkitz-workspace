import os
import subprocess
import sys

# Ersetze dies mit der exakten GitHub-URL für "voicebox", falls abweichend.
VOICEBOX_REPO_URL = "https://github.com/lucidrains/voicebox-pytorch.git"
TARGET_DIR = "voicebox_repo"

def run_command(cmd, cwd=None):
    print(f"Ausführen: {cmd}")
    result = subprocess.run(cmd, shell=True, cwd=cwd)
    if result.returncode != 0:
        print(f"❌ Fehler bei: {cmd}")
        sys.exit(1)

def setup_voicebox():
    import sys
    if sys.stdout.encoding != 'utf-8':
        sys.stdout.reconfigure(encoding='utf-8')
    print("==================================================")
    print(" 🗣️ DEVKiTZ Voicebox Setup Script ")
    print("==================================================")

    if not os.path.exists(TARGET_DIR):
        print(f"📥 Klone Voicebox Repository von {VOICEBOX_REPO_URL}...")
        run_command(f"git clone {VOICEBOX_REPO_URL} {TARGET_DIR}")
    else:
        print(f"✅ Ordner '{TARGET_DIR}' existiert bereits. Überspringe Klonen.")
        print("🔄 Ziehe neuste Änderungen...")
        run_command("git pull", cwd=TARGET_DIR)

    print("📦 Installiere Abhängigkeiten...")
    req_file = os.path.join(TARGET_DIR, "requirements.txt")
    if os.path.exists(req_file):
        run_command(f"{sys.executable} -m pip install -r {req_file}")
    else:
        print(f"⚠️ Keine requirements.txt gefunden in {TARGET_DIR}. Installiere Standard-Pakete...")
        run_command(f"{sys.executable} -m pip install torch torchaudio einops")

    print("🎉 Voicebox erfolgreich vorbereitet!")
    print("Du kannst nun voicebox.py ausführen, um die API zu testen.")

if __name__ == "__main__":
    setup_voicebox()
