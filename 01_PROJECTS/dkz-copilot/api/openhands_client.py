"""
DkZ CoPilot — OpenHands Integration
Steuert den OpenHands Coding Agent ueber die API.
Issue -> OpenHands Sandbox -> Code -> PR
"""

import httpx
import logging
import json
from typing import Optional

logger = logging.getLogger("dkz-copilot.openhands")


class OpenHandsClient:
    """Client fuer OpenHands Self-Hosted Coding Agent."""

    def __init__(self, base_url: str = "http://openhands:3000", github_token: str = ""):
        self.base_url = base_url.rstrip("/")
        self.github_token = github_token
        self.client = httpx.AsyncClient(timeout=300.0)  # 5min Timeout fuer Agent-Runs

    async def health_check(self) -> dict:
        """Prueft ob OpenHands erreichbar ist."""
        try:
            resp = await self.client.get(f"{self.base_url}/api/health")
            return {"status": "online", "code": resp.status_code}
        except Exception as e:
            logger.error(f"OpenHands offline: {e}")
            return {"status": "offline", "error": str(e)}

    async def resolve_issue(
        self,
        repo: str,
        issue_number: int,
        issue_text: str,
        instructions: str = "",
        model: str = "qwen3.5:7b"
    ) -> dict:
        """
        Sendet ein GitHub Issue an OpenHands zur automatischen Loesung.
        OpenHands klont das Repo, analysiert, fixt und erstellt PR.
        """
        payload = {
            "repository": repo,
            "issue_number": issue_number,
            "issue_text": issue_text,
            "instructions": instructions,
            "model": model,
            "max_iterations": 30,
            "sandbox": {
                "timeout": 600,
                "enable_testing": True
            }
        }

        try:
            logger.info(f"OpenHands: Starte Issue #{issue_number} fuer {repo}")
            resp = await self.client.post(
                f"{self.base_url}/api/resolve",
                json=payload
            )

            if resp.status_code == 200:
                result = resp.json()
                logger.info(f"OpenHands: Issue #{issue_number} bearbeitet -> {result.get('pr_url', 'kein PR')}")
                return {
                    "success": True,
                    "pr_url": result.get("pr_url"),
                    "branch": result.get("branch"),
                    "changes": result.get("changes", []),
                    "iterations": result.get("iterations", 0)
                }
            else:
                logger.error(f"OpenHands Error: {resp.status_code} {resp.text}")
                return {"success": False, "error": resp.text}

        except httpx.TimeoutException:
            logger.error(f"OpenHands Timeout fuer Issue #{issue_number}")
            return {"success": False, "error": "Timeout nach 5 Minuten"}
        except Exception as e:
            logger.error(f"OpenHands Exception: {e}")
            return {"success": False, "error": str(e)}

    async def get_session_status(self, session_id: str) -> dict:
        """Holt den Status einer laufenden OpenHands Session."""
        try:
            resp = await self.client.get(f"{self.base_url}/api/sessions/{session_id}")
            return resp.json()
        except Exception as e:
            return {"status": "unknown", "error": str(e)}

    async def list_sessions(self) -> list:
        """Listet alle aktiven OpenHands Sessions."""
        try:
            resp = await self.client.get(f"{self.base_url}/api/sessions")
            return resp.json() if resp.status_code == 200 else []
        except Exception:
            return []

    async def close(self):
        """Schliesst den HTTP Client."""
        await self.client.aclose()


class OpenHandsGitHubResolver:
    """
    GitHub Resolver — Ueberwacht Issues und triggert OpenHands.
    Basiert auf dem offiziellen OpenHands GitHub Resolver Pattern.
    """

    def __init__(self, client: OpenHandsClient, instructions: str = ""):
        self.client = client
        self.instructions = instructions

    async def process_issue(self, issue_data: dict) -> dict:
        """
        Verarbeitet ein GitHub Issue Event.
        Wird aufgerufen wenn ein Issue das Label 'fix-me' bekommt
        oder an @dkz-bot assigned wird.
        """
        repo = issue_data.get("repository", {}).get("full_name", "")
        number = issue_data.get("issue", {}).get("number", 0)
        title = issue_data.get("issue", {}).get("title", "")
        body = issue_data.get("issue", {}).get("body", "")

        issue_text = f"# {title}\n\n{body}"

        # DkZ-spezifische Instruktionen
        dkz_rules = """
REGELN:
- IMMER esc() bei User-Input vor innerHTML (XSS-Schutz)
- DkZ CSS Custom Properties verwenden, KEIN hardcoded #fa1e4e
- Shared Scripts einbinden: dkz-debug.js, dkz-guide.js, dkz-navbar.js
- Commit Message: fix(modul): Beschreibung
- PR erstellen mit @7IKED als Reviewer
- Labels: copilot, fix
"""
        full_instructions = f"{self.instructions}\n{dkz_rules}"

        # LLM waehlen basierend auf Labels
        labels = [l.get("name", "") for l in issue_data.get("issue", {}).get("labels", [])]
        model = self._select_model(labels, title)

        result = await self.client.resolve_issue(
            repo=repo,
            issue_number=number,
            issue_text=issue_text,
            instructions=full_instructions,
            model=model
        )

        return result

    def _select_model(self, labels: list, title: str) -> str:
        """Waehlt das beste LLM basierend auf Labels und Titel."""
        title_lower = title.lower()

        # Coder-Model fuer komplexe Tasks
        if any(l in labels for l in ["refactor", "complex"]):
            return "qwen2.5-coder:7b"

        # Mini-Model fuer Docs/Text
        if any(l in labels for l in ["docs", "readme", "text"]):
            return "gemma4:2b"

        # Default: Haupt-Coder
        return "qwen3.5:7b"
