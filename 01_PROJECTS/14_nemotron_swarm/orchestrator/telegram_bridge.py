"""
telegram_bridge.py — Telegram ↔ Nemotron Swarm Bridge

Pollt Telegram auf neue Nachrichten und postet sie als Tasks
an das Antigravity API Gateway (Port 3060).
"""

import os
import sys
import time
import json
import urllib.request
import urllib.error
import urllib.parse

from config import TELEGRAM_POLL_INTERVAL, GATEWAY_URL, DOTENV_PATH as ENV_PATH
TELEGRAM_BOT_TOKEN = None

OFFSET = 0


def load_token() -> str | None:
    if not os.path.exists(ENV_PATH):
        print(f"[telegram-bridge] .env nicht gefunden: {ENV_PATH}")
        return None
    with open(ENV_PATH, "r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if line.startswith("TELEGRAM_BOT_TOKEN="):
                return line.split("=", 1)[1]
    return None


def get_updates() -> list[dict]:
    global OFFSET
    url = f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/getUpdates?offset={OFFSET}&timeout=20"
    try:
        req = urllib.request.Request(url)
        with urllib.request.urlopen(req, timeout=25) as resp:
            data = json.loads(resp.read().decode())
        updates = data.get("result", [])
        if updates:
            OFFSET = max(u["update_id"] for u in updates) + 1
        return updates
    except (urllib.error.URLError, json.JSONDecodeError, Exception) as e:
        print(f"[telegram-bridge] getUpdates Fehler: {e}")
        return []


def post_to_gateway(prompt: str) -> bool:
    payload = json.dumps({"prompt": prompt, "source": "telegram"}).encode()
    try:
        req = urllib.request.Request(
            GATEWAY_URL,
            data=payload,
            headers={"Content-Type": "application/json"},
            method="POST",
        )
        with urllib.request.urlopen(req, timeout=5) as resp:
            body = resp.read().decode()
            print(f"[telegram-bridge] Gateway antwortet: {body[:200]}")
            return True
    except (urllib.error.URLError, ConnectionRefusedError) as e:
        print(f"[telegram-bridge] Gateway nicht erreichbar ({e})")
        return False


def main():
    global TELEGRAM_BOT_TOKEN
    TELEGRAM_BOT_TOKEN = load_token()
    if not TELEGRAM_BOT_TOKEN:
        print("[telegram-bridge] Kein Telegram Token gefunden. Abbruch.")
        sys.exit(1)

    print(f"[telegram-bridge] Telegram Bridge gestartet (Poll: {TELEGRAM_POLL_INTERVAL}s)")
    print(f"[telegram-bridge] Gateway: {GATEWAY_URL}")
    print(f"[telegram-bridge] Token: ...{TELEGRAM_BOT_TOKEN[-6:]}")

    while True:
        try:
            updates = get_updates()
            for update in updates:
                msg = update.get("message", {})
                text = msg.get("text", "")
                chat_id = msg.get("chat", {}).get("id", "?")
                username = msg.get("from", {}).get("username", "?")

                if text.startswith("/"):
                    print(f"[telegram-bridge] Command ignoriert: {text}")
                    continue

                if text:
                    print(f"[telegram-bridge] Nachricht von @{username}: {text[:80]}...")
                    ok = post_to_gateway(text)
                    if ok:
                        print(f"[telegram-bridge] Task an Gateway gesendet.")
                    else:
                        print(f"[telegram-bridge] Gateway nicht erreichbar — Nachricht verworfen.")

            time.sleep(TELEGRAM_POLL_INTERVAL)
        except KeyboardInterrupt:
            print("[telegram-bridge] Herunterfahren...")
            break
        except Exception as e:
            print(f"[telegram-bridge] Fehler: {e}")
            time.sleep(TELEGRAM_POLL_INTERVAL)


if __name__ == "__main__":
    main()
