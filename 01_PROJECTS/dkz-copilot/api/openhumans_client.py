"""
DkZ CoPilot — OpenHumans Integration
Synchronisiert Walkthroughs, Session-Daten und Metriken
mit dem OpenHumans Projekt fuer offene Forschung.
"""

import httpx
import json
import logging
from datetime import datetime
from typing import Optional

logger = logging.getLogger("dkz-copilot.openhumans")

OPENHUMANS_API = "https://www.openhumans.org/api"


class OpenHumansClient:
    """Client fuer OpenHumans Data Integration."""

    def __init__(self, token: str = "", project_id: str = ""):
        self.token = token
        self.project_id = project_id
        self.client = httpx.AsyncClient(
            timeout=30.0,
            headers={"Authorization": f"Bearer {token}"} if token else {}
        )

    async def health_check(self) -> dict:
        """Prueft OpenHumans Verbindung."""
        if not self.token:
            return {"status": "not_configured", "message": "OPENHUMANS_TOKEN nicht gesetzt"}
        try:
            resp = await self.client.get(f"{OPENHUMANS_API}/member/")
            if resp.status_code == 200:
                data = resp.json()
                return {
                    "status": "connected",
                    "username": data.get("username", ""),
                    "project": self.project_id
                }
            return {"status": "auth_error", "code": resp.status_code}
        except Exception as e:
            return {"status": "offline", "error": str(e)}

    async def upload_walkthrough(self, walkthrough: dict) -> dict:
        """
        Laedt einen Walkthrough als JSON in OpenHumans hoch.
        Typ: Coding-Session Daten fuer Open Science.
        """
        if not self.token:
            return {"success": False, "error": "Token fehlt"}

        metadata = {
            "description": f"DkZ CoPilot Walkthrough: {walkthrough.get('title', '')}",
            "tags": ["devkitz", "copilot", "walkthrough", "coding-agent"],
            "created": datetime.utcnow().isoformat(),
            "source": "dkz-copilot"
        }

        payload = {
            "metadata": metadata,
            "data": walkthrough
        }

        try:
            resp = await self.client.post(
                f"{OPENHUMANS_API}/project/data/upload/",
                json=payload
            )
            if resp.status_code in (200, 201):
                logger.info(f"OpenHumans: Walkthrough '{walkthrough.get('title')}' hochgeladen")
                return {"success": True, "id": resp.json().get("id")}
            return {"success": False, "error": resp.text}
        except Exception as e:
            logger.error(f"OpenHumans Upload Error: {e}")
            return {"success": False, "error": str(e)}

    async def upload_metrics(self, metrics: dict) -> dict:
        """
        Laedt Agent-Metriken hoch (Commits, PRs, Tokens, Fehler).
        Taeglich aggregiert fuer Forschungszwecke.
        """
        if not self.token:
            return {"success": False, "error": "Token fehlt"}

        payload = {
            "metadata": {
                "description": f"DkZ CoPilot Metriken {datetime.utcnow().strftime('%Y-%m-%d')}",
                "tags": ["devkitz", "metrics", "daily"],
                "created": datetime.utcnow().isoformat()
            },
            "data": {
                "date": datetime.utcnow().strftime("%Y-%m-%d"),
                "commits": metrics.get("commits", 0),
                "prs_created": metrics.get("prs_created", 0),
                "issues_resolved": metrics.get("issues_resolved", 0),
                "tokens_used": metrics.get("tokens_used", 0),
                "models_used": metrics.get("models_used", {}),
                "modules_fixed": metrics.get("modules_fixed", 0),
                "errors": metrics.get("errors", 0)
            }
        }

        try:
            resp = await self.client.post(
                f"{OPENHUMANS_API}/project/data/upload/",
                json=payload
            )
            return {"success": resp.status_code in (200, 201)}
        except Exception as e:
            return {"success": False, "error": str(e)}

    async def upload_session_log(self, session: dict) -> dict:
        """
        Laedt einen kompletten Agent-Session-Log hoch.
        Enthaelt: Issue, LLM-Calls, Aenderungen, Ergebnis.
        """
        if not self.token:
            return {"success": False, "error": "Token fehlt"}

        # Sensible Daten entfernen
        sanitized = {
            "session_id": session.get("id", ""),
            "started": session.get("started", ""),
            "ended": session.get("ended", ""),
            "issue_number": session.get("issue_number", 0),
            "issue_title": session.get("issue_title", ""),
            "model_used": session.get("model", ""),
            "tokens_in": session.get("tokens_in", 0),
            "tokens_out": session.get("tokens_out", 0),
            "files_changed": session.get("files_changed", []),
            "pr_created": session.get("pr_url", ""),
            "success": session.get("success", False),
            "duration_seconds": session.get("duration", 0)
        }

        try:
            resp = await self.client.post(
                f"{OPENHUMANS_API}/project/data/upload/",
                json={
                    "metadata": {
                        "description": f"Agent Session: Issue #{sanitized['issue_number']}",
                        "tags": ["devkitz", "session", "agent-log"]
                    },
                    "data": sanitized
                }
            )
            return {"success": resp.status_code in (200, 201)}
        except Exception as e:
            return {"success": False, "error": str(e)}

    async def get_data(self, limit: int = 10) -> list:
        """Holt die letzten N hochgeladenen Datensaetze."""
        if not self.token:
            return []
        try:
            resp = await self.client.get(
                f"{OPENHUMANS_API}/project/data/",
                params={"limit": limit}
            )
            return resp.json().get("results", []) if resp.status_code == 200 else []
        except Exception:
            return []

    async def close(self):
        await self.client.aclose()
