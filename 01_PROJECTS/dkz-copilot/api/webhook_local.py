"""
DkZ CoPilot — Lokaler Webhook Proxy
Empfaengt Webhooks lokal (ohne VPS) und leitet sie an den Agent weiter.
Auch als Simulator fuer GitHub Webhooks nutzbar.
"""

import asyncio
import hashlib
import hmac
import json
import logging
from datetime import datetime
from typing import Callable, Optional

logger = logging.getLogger("dkz-copilot.webhook-local")


class LocalWebhookProxy:
    """
    Lokaler Webhook Proxy — ermoeglicht Webhook-Verarbeitung
    ohne VPS. Simuliert GitHub Webhook Events lokal.
    """

    def __init__(self, secret: str = "local-dev-secret"):
        self.secret = secret
        self.handlers: dict[str, list[Callable]] = {}
        self.event_log: list[dict] = []
        self.running = False

    def on(self, event_type: str, handler: Callable):
        """Registriert einen Handler fuer einen Event-Typ."""
        if event_type not in self.handlers:
            self.handlers[event_type] = []
        self.handlers[event_type].append(handler)

    def off(self, event_type: str, handler: Optional[Callable] = None):
        """Entfernt Handler."""
        if handler and event_type in self.handlers:
            self.handlers[event_type] = [h for h in self.handlers[event_type] if h != handler]
        elif event_type in self.handlers:
            del self.handlers[event_type]

    async def emit(self, event_type: str, payload: dict, source: str = "local") -> dict:
        """Feuert ein Event ab (lokal oder remote)."""
        event = {
            "id": f"evt_{int(datetime.now().timestamp()*1000)}",
            "type": event_type,
            "payload": payload,
            "source": source,
            "timestamp": datetime.now().isoformat(),
            "processed": False
        }

        self.event_log.append(event)
        if len(self.event_log) > 200:
            self.event_log = self.event_log[-100:]

        # Handler ausfuehren
        handlers = self.handlers.get(event_type, []) + self.handlers.get("*", [])
        results = []
        for handler in handlers:
            try:
                if asyncio.iscoroutinefunction(handler):
                    result = await handler(event)
                else:
                    result = handler(event)
                results.append({"handler": handler.__name__, "result": result})
            except Exception as e:
                results.append({"handler": handler.__name__, "error": str(e)})

        event["processed"] = True
        event["results"] = results

        logger.info(f"Webhook {event_type}: {len(results)} Handler ausgefuehrt")
        return event

    def verify_signature(self, payload_body: bytes, signature: str) -> bool:
        """Verifiziert GitHub HMAC-SHA256 Signatur."""
        expected = "sha256=" + hmac.new(
            self.secret.encode(), payload_body, hashlib.sha256
        ).hexdigest()
        return hmac.compare_digest(expected, signature)

    # === GitHub Event Simulatoren ===

    async def simulate_issue_created(self, title: str, body: str = "",
                                     labels: list = None, repo: str = "D-VKITZ/KERN") -> dict:
        """Simuliert ein GitHub Issue Created Event."""
        return await self.emit("issues", {
            "action": "opened",
            "issue": {
                "number": len(self.event_log) + 100,
                "title": title,
                "body": body,
                "labels": [{"name": l} for l in (labels or ["copilot"])],
                "user": {"login": "777"},
                "html_url": f"https://github.com/{repo}/issues/{len(self.event_log)+100}",
                "created_at": datetime.now().isoformat()
            },
            "repository": {"full_name": repo}
        }, source="simulator")

    async def simulate_issue_assigned(self, issue_number: int, assignee: str = "dkz-bot",
                                       repo: str = "D-VKITZ/KERN") -> dict:
        """Simuliert Issue Assign Event."""
        return await self.emit("issues", {
            "action": "assigned",
            "issue": {
                "number": issue_number,
                "title": f"Test Issue #{issue_number}",
                "body": "Auto-generiertes Test-Issue",
                "labels": [{"name": "copilot"}],
                "assignee": {"login": assignee}
            },
            "repository": {"full_name": repo}
        }, source="simulator")

    async def simulate_pr_created(self, title: str, branch: str = "fix/test",
                                   repo: str = "D-VKITZ/KERN") -> dict:
        """Simuliert PR Created Event."""
        return await self.emit("pull_request", {
            "action": "opened",
            "pull_request": {
                "number": len(self.event_log) + 200,
                "title": title,
                "head": {"ref": branch},
                "base": {"ref": "main"},
                "user": {"login": "dkz-bot"},
                "html_url": f"https://github.com/{repo}/pull/{len(self.event_log)+200}"
            },
            "repository": {"full_name": repo}
        }, source="simulator")

    async def simulate_push(self, commits: list = None,
                             repo: str = "D-VKITZ/KERN") -> dict:
        """Simuliert Push Event."""
        return await self.emit("push", {
            "ref": "refs/heads/main",
            "commits": commits or [{
                "message": "test: Simulierter Push",
                "author": {"name": "dkz-bot"},
                "timestamp": datetime.now().isoformat()
            }],
            "repository": {"full_name": repo}
        }, source="simulator")

    async def simulate_custom(self, event_type: str, payload: dict) -> dict:
        """Simuliert ein beliebiges Event."""
        return await self.emit(event_type, payload, source="custom")

    # === Status ===

    def get_status(self) -> dict:
        return {
            "handlers": {k: len(v) for k, v in self.handlers.items()},
            "events_total": len(self.event_log),
            "events_processed": sum(1 for e in self.event_log if e.get("processed")),
            "last_event": self.event_log[-1] if self.event_log else None
        }

    def get_log(self, limit: int = 20) -> list:
        return self.event_log[-limit:][::-1]


class WebhookRouter:
    """
    Router — Leitet Webhooks an den richtigen Handler weiter.
    Funktioniert lokal UND mit echten GitHub Webhooks.
    """

    def __init__(self, proxy: LocalWebhookProxy):
        self.proxy = proxy
        self._register_defaults()

    def _register_defaults(self):
        """Registriert Standard-Handler."""
        self.proxy.on("issues", self._handle_issue)
        self.proxy.on("pull_request", self._handle_pr)
        self.proxy.on("push", self._handle_push)
        self.proxy.on("*", self._log_all)

    async def _handle_issue(self, event: dict):
        action = event["payload"].get("action", "")
        issue = event["payload"].get("issue", {})
        logger.info(f"Issue #{issue.get('number')}: {action} — {issue.get('title')}")

        if action in ("assigned", "labeled", "opened"):
            # Agent starten
            return {"action": "agent_triggered", "issue": issue.get("number")}
        return {"action": "ignored"}

    async def _handle_pr(self, event: dict):
        action = event["payload"].get("action", "")
        pr = event["payload"].get("pull_request", {})
        logger.info(f"PR #{pr.get('number')}: {action} — {pr.get('title')}")

        if action == "opened":
            return {"action": "review_triggered", "pr": pr.get("number")}
        return {"action": "ignored"}

    async def _handle_push(self, event: dict):
        commits = event["payload"].get("commits", [])
        logger.info(f"Push: {len(commits)} Commits")
        return {"action": "sync_triggered", "commits": len(commits)}

    def _log_all(self, event: dict):
        logger.debug(f"Event: {event['type']} from {event.get('source', 'unknown')}")
