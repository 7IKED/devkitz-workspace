"""
DkZ CoPilot — Integrations Hub
Alle Module mit An/Aus-Steuerung:
- OpenHumans, Browser Use, Open Manus, Computer Use, Playwright
- Pico Claw, MiroFish, GitNexus, SecondBrain, CLOUDIA2, AiAiKirk
- NanoBot Swarms, AutoUpdate
"""

import asyncio
import json
import logging
import subprocess
import httpx
from datetime import datetime
from pathlib import Path
from typing import Optional

logger = logging.getLogger("dkz-copilot.integrations")


class IntegrationToggle:
    """Einzelne Integration mit An/Aus-Steuerung."""

    def __init__(self, name: str, category: str, description: str,
                 default_on: bool = False, auto_mode: bool = False):
        self.name = name
        self.category = category
        self.description = description
        self.enabled = default_on
        self.auto_mode = auto_mode
        self.status = "idle"  # idle, running, error, disabled
        self.last_run = None
        self.error_msg = ""

    def toggle(self, state: Optional[bool] = None) -> bool:
        if state is not None:
            self.enabled = state
        else:
            self.enabled = not self.enabled
        self.status = "idle" if self.enabled else "disabled"
        return self.enabled

    def toggle_auto(self, state: Optional[bool] = None) -> bool:
        if state is not None:
            self.auto_mode = state
        else:
            self.auto_mode = not self.auto_mode
        return self.auto_mode

    def to_dict(self) -> dict:
        return {
            "name": self.name,
            "category": self.category,
            "description": self.description,
            "enabled": self.enabled,
            "auto_mode": self.auto_mode,
            "status": self.status,
            "last_run": self.last_run,
            "error": self.error_msg
        }


class IntegrationsHub:
    """Zentrale Steuerung aller Integrationen."""

    def __init__(self, config_path: str = ""):
        self.integrations: dict[str, IntegrationToggle] = {}
        self.config_path = Path(config_path) if config_path else Path.home() / ".dkz-copilot" / "integrations.json"
        self._init_defaults()
        self._load_state()

    def _init_defaults(self):
        """Alle verfuegbaren Integrationen registrieren."""

        # === IMMER AN (Computer Use + Playwright) ===
        self._add("computer-use", "core", "Desktop-Steuerung via OS-Copilot", default_on=True)
        self._add("playwright", "core", "Browser-Automation + E2E Tests", default_on=True)

        # === AN/AUS Toggle ===
        self._add("openhands", "agent", "OpenHands Coding Agent (Issue->PR)", default_on=True)
        self._add("openhumans", "data", "OpenHumans Daten-Upload (Walkthroughs, Metriken)", default_on=False)
        self._add("browser-use", "browser", "Browser Use — KI-gesteuertes Web-Browsing", default_on=False)
        self._add("open-manus", "agent", "Open Manus — Multi-Agent Desktop Kontrolle", default_on=False)
        self._add("pico-claw", "health", "Pico Herzschlag-Sensor (MAX30102 USB)", default_on=False, auto_mode=False)
        self._add("nanobot-swarm", "swarm", "NanoBot Schwarm — Info-Quellen Scraping", default_on=True, auto_mode=True)

        # === DkZ Module ===
        self._add("mirofish", "module", "MiroFish Simulator — KI-Fisch Simulation", default_on=True)
        self._add("gitnexus", "module", "GitNexus Explorer — Repo-Analyse", default_on=True)
        self._add("second-brain", "data", "Obsidian SecondBrain Sync", default_on=True, auto_mode=True)
        self._add("cloudia2", "infra", "CLOUDIA2 Cloud Control — VPS Management", default_on=True)
        self._add("aiaikirk", "ai", "AiAiKirk — KI-Modul Integration", default_on=True)
        self._add("pr-agent", "agent", "PR-Agent — Automatische Code Reviews", default_on=True)

        # === AutoUpdate ===
        self._add("auto-update", "system", "AutoUpdate bei Start + manuell", default_on=True, auto_mode=True)

    def _add(self, name: str, category: str, desc: str,
             default_on: bool = False, auto_mode: bool = False):
        self.integrations[name] = IntegrationToggle(name, category, desc, default_on, auto_mode)

    # === Toggle API ===

    def toggle(self, name: str, state: Optional[bool] = None) -> dict:
        if name not in self.integrations:
            return {"error": f"Integration '{name}' nicht gefunden"}
        result = self.integrations[name].toggle(state)
        self._save_state()
        return {"name": name, "enabled": result}

    def toggle_auto(self, name: str, state: Optional[bool] = None) -> dict:
        if name not in self.integrations:
            return {"error": f"Integration '{name}' nicht gefunden"}
        result = self.integrations[name].toggle_auto(state)
        self._save_state()
        return {"name": name, "auto_mode": result}

    def get_all(self) -> dict:
        return {
            name: i.to_dict() for name, i in self.integrations.items()
        }

    def get_enabled(self) -> list[str]:
        return [name for name, i in self.integrations.items() if i.enabled]

    def get_by_category(self, category: str) -> dict:
        return {
            name: i.to_dict() for name, i in self.integrations.items()
            if i.category == category
        }

    # === Persistenz ===

    def _save_state(self):
        self.config_path.parent.mkdir(parents=True, exist_ok=True)
        state = {}
        for name, i in self.integrations.items():
            state[name] = {"enabled": i.enabled, "auto_mode": i.auto_mode}
        self.config_path.write_text(json.dumps(state, indent=2), encoding="utf-8")

    def _load_state(self):
        if self.config_path.exists():
            try:
                state = json.loads(self.config_path.read_text(encoding="utf-8"))
                for name, s in state.items():
                    if name in self.integrations:
                        self.integrations[name].enabled = s.get("enabled", False)
                        self.integrations[name].auto_mode = s.get("auto_mode", False)
            except Exception:
                pass


# ============================================
# Browser Use Integration
# ============================================

class BrowserUseClient:
    """Browser Use — KI-gesteuertes Web-Browsing."""

    def __init__(self, llm_url: str = "http://localhost:11434/v1", model: str = "qwen3.5:7b"):
        self.llm_url = llm_url
        self.model = model

    async def browse(self, task: str) -> dict:
        """Fuehrt eine Browser-Aufgabe aus via Playwright."""
        try:
            from playwright.async_api import async_playwright
            async with async_playwright() as p:
                browser = await p.chromium.launch(headless=True)
                page = await browser.new_page()

                # URL extrahieren oder Google-Suche
                if task.startswith("http"):
                    await page.goto(task, timeout=30000)
                else:
                    await page.goto(f"https://www.google.com/search?q={task}", timeout=30000)

                title = await page.title()
                content = await page.content()
                screenshot = await page.screenshot(type="png")

                await browser.close()

                return {
                    "title": title,
                    "url": page.url,
                    "content_length": len(content),
                    "screenshot_size": len(screenshot),
                    "success": True
                }
        except ImportError:
            return {"error": "playwright nicht installiert: pip install playwright && playwright install"}
        except Exception as e:
            return {"error": str(e)}

    async def scrape_and_summarize(self, url: str) -> dict:
        """Seite laden + LLM Zusammenfassung."""
        browse_result = await self.browse(url)
        if "error" in browse_result:
            return browse_result

        # LLM fuer Zusammenfassung
        try:
            async with httpx.AsyncClient(timeout=60.0) as client:
                resp = await client.post(
                    f"{self.llm_url}/chat/completions",
                    json={
                        "model": self.model,
                        "messages": [
                            {"role": "system", "content": "Fasse die Webseite in 3 Saetzen zusammen. Deutsch."},
                            {"role": "user", "content": f"Titel: {browse_result['title']}\nURL: {browse_result['url']}"}
                        ],
                        "max_tokens": 500
                    }
                )
                summary = resp.json().get("choices", [{}])[0].get("message", {}).get("content", "")
                browse_result["summary"] = summary
        except Exception:
            pass

        return browse_result


# ============================================
# AutoUpdate System
# ============================================

class AutoUpdater:
    """AutoUpdate bei Start und manuell."""

    def __init__(self, workspace: str = r"C:\DEVKiTZ",
                 vps_project: str = "/opt/dkz-copilot"):
        self.workspace = Path(workspace)
        self.vps_project = vps_project
        self.last_update = None
        self.update_log: list[dict] = []

    async def check_for_updates(self) -> dict:
        """Prueft ob Updates verfuegbar sind."""
        try:
            result = subprocess.run(
                "git fetch origin && git log HEAD..origin/main --oneline",
                shell=True, capture_output=True, text=True,
                cwd=str(self.workspace), timeout=30
            )
            commits = result.stdout.strip().split("\n") if result.stdout.strip() else []
            return {
                "updates_available": len(commits) > 0,
                "pending_commits": len(commits),
                "commits": commits[:10],
                "checked": datetime.now().isoformat()
            }
        except Exception as e:
            return {"error": str(e)}

    async def update_local(self) -> dict:
        """Lokales Update (git pull)."""
        try:
            result = subprocess.run(
                "git pull origin main",
                shell=True, capture_output=True, text=True,
                cwd=str(self.workspace), timeout=60
            )
            update = {
                "type": "local",
                "success": result.returncode == 0,
                "output": result.stdout.strip(),
                "timestamp": datetime.now().isoformat()
            }
            self.update_log.append(update)
            self.last_update = update["timestamp"]
            return update
        except Exception as e:
            return {"error": str(e)}

    async def update_vps(self, vps_controller) -> dict:
        """VPS Update: git pull + docker rebuild."""
        steps = []

        r = await vps_controller.ssh_exec(f"cd {self.vps_project} && git pull origin main")
        steps.append({"step": "git_pull", "ok": r.get("returncode") == 0})

        r = await vps_controller.ssh_exec(
            f"cd {self.vps_project} && docker compose pull",
            timeout=300
        )
        steps.append({"step": "docker_pull", "ok": r.get("returncode") == 0})

        r = await vps_controller.ssh_exec(
            f"cd {self.vps_project} && docker compose up -d --force-recreate"
        )
        steps.append({"step": "restart", "ok": r.get("returncode") == 0})

        update = {
            "type": "vps",
            "steps": steps,
            "success": all(s["ok"] for s in steps),
            "timestamp": datetime.now().isoformat()
        }
        self.update_log.append(update)
        return update

    async def update_ollama_models(self, vps_controller) -> dict:
        """Ollama Models aktualisieren."""
        models = ["qwen3.5:7b", "gemma4:2b", "qwen2.5-coder:7b"]
        results = []
        for model in models:
            r = await vps_controller.ssh_exec(
                f"docker exec ollama ollama pull {model}", timeout=600
            )
            results.append({"model": model, "ok": r.get("returncode") == 0})
        return {"models": results}

    async def auto_update_on_start(self) -> dict:
        """Wird bei App-Start automatisch ausgefuehrt."""
        check = await self.check_for_updates()
        if check.get("updates_available"):
            return await self.update_local()
        return {"status": "already_up_to_date"}


# ============================================
# Pico Claw Controller (erweiterert)
# ============================================

class PicoClawController:
    """Erweiterte Pico Claw Steuerung mit Auto-Modus."""

    def __init__(self):
        self.auto_mode = False
        self.monitoring = False
        self.alert_callback = None
        self.stress_threshold_bpm = 100
        self.rest_threshold_bpm = 55

    def toggle_auto_mode(self, state: Optional[bool] = None) -> bool:
        if state is not None:
            self.auto_mode = state
        else:
            self.auto_mode = not self.auto_mode
        return self.auto_mode

    def set_thresholds(self, stress: int = 100, rest: int = 55):
        self.stress_threshold_bpm = stress
        self.rest_threshold_bpm = rest

    def evaluate_state(self, bpm: int, spo2: int) -> dict:
        """Bewertet den Zustand basierend auf Vitaldaten."""
        state = "normal"
        action = None

        if bpm > self.stress_threshold_bpm:
            state = "stress"
            action = "pause_suggestion"
        elif bpm < self.rest_threshold_bpm:
            state = "resting"
            action = "break_detected"
        elif spo2 < 92:
            state = "low_oxygen"
            action = "health_alert"

        result = {
            "bpm": bpm, "spo2": spo2, "state": state,
            "action": action, "auto_mode": self.auto_mode
        }

        # Auto-Modus Aktionen
        if self.auto_mode and action:
            if action == "pause_suggestion":
                result["auto_action"] = "Agent pausiert — Stress erkannt"
            elif action == "break_detected":
                result["auto_action"] = "Agent merkt sich Fortschritt — Pause"
            elif action == "health_alert":
                result["auto_action"] = "WARNUNG an Dashboard gesendet"

        return result

    def to_dict(self) -> dict:
        return {
            "auto_mode": self.auto_mode,
            "monitoring": self.monitoring,
            "stress_threshold": self.stress_threshold_bpm,
            "rest_threshold": self.rest_threshold_bpm
        }
