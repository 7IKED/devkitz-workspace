"""
DkZ CoPilot — NanoBot Swarm System
Erstellt autonome Bot-Schwärme fuer dauerhaftes Info-Scraping.
Jeder Bot hat eine Quelle und laeuft als Hintergrund-Task.
"""

import asyncio
import httpx
import json
import logging
import time
from datetime import datetime
from typing import Optional
from pathlib import Path

logger = logging.getLogger("dkz-copilot.swarm")


class NanoBot:
    """Ein einzelner NanoBot — spezialisiert auf eine Infoquelle."""

    def __init__(self, name: str, source_type: str, config: dict):
        self.name = name
        self.source_type = source_type  # github, reddit, rss, api, web
        self.config = config
        self.status = "idle"  # idle, running, error, paused
        self.last_run = None
        self.data_collected = 0
        self.errors = 0
        self.results: list[dict] = []

    async def run(self) -> list[dict]:
        """Fuehrt den Bot-Task aus."""
        self.status = "running"
        self.last_run = datetime.now().isoformat()

        try:
            if self.source_type == "github":
                return await self._scrape_github()
            elif self.source_type == "reddit":
                return await self._scrape_reddit()
            elif self.source_type == "rss":
                return await self._scrape_rss()
            elif self.source_type == "api":
                return await self._call_api()
            elif self.source_type == "web":
                return await self._scrape_web()
            else:
                return []
        except Exception as e:
            self.status = "error"
            self.errors += 1
            logger.error(f"NanoBot {self.name} Fehler: {e}")
            return []
        finally:
            if self.status != "error":
                self.status = "idle"

    async def _scrape_github(self) -> list[dict]:
        """GitHub Repos, Issues, PRs, Commits durchsuchen."""
        async with httpx.AsyncClient(timeout=30.0) as client:
            results = []
            query = self.config.get("query", "")
            repo = self.config.get("repo", "")

            if repo:
                # Repo-spezifisch: Issues, PRs, Commits
                for endpoint in ["issues", "pulls", "commits"]:
                    try:
                        resp = await client.get(
                            f"https://api.github.com/repos/{repo}/{endpoint}",
                            params={"per_page": 10, "state": "all"},
                            headers={"Accept": "application/vnd.github.v3+json"}
                        )
                        if resp.status_code == 200:
                            for item in resp.json()[:5]:
                                results.append({
                                    "source": f"github/{repo}/{endpoint}",
                                    "title": item.get("title", item.get("commit", {}).get("message", "")),
                                    "url": item.get("html_url", ""),
                                    "date": item.get("created_at", item.get("commit", {}).get("author", {}).get("date", "")),
                                    "bot": self.name
                                })
                    except Exception:
                        pass

            elif query:
                # Suche
                resp = await client.get(
                    "https://api.github.com/search/repositories",
                    params={"q": query, "per_page": 10, "sort": "updated"}
                )
                if resp.status_code == 200:
                    for item in resp.json().get("items", [])[:5]:
                        results.append({
                            "source": "github/search",
                            "title": item.get("full_name", ""),
                            "description": item.get("description", ""),
                            "stars": item.get("stargazers_count", 0),
                            "url": item.get("html_url", ""),
                            "bot": self.name
                        })

            self.data_collected += len(results)
            self.results = results
            return results

    async def _scrape_reddit(self) -> list[dict]:
        """Reddit Subreddits durchsuchen."""
        async with httpx.AsyncClient(timeout=30.0) as client:
            subreddit = self.config.get("subreddit", "programming")
            resp = await client.get(
                f"https://www.reddit.com/r/{subreddit}/hot.json",
                params={"limit": 10},
                headers={"User-Agent": "DkZ-CoPilot/1.0"}
            )
            results = []
            if resp.status_code == 200:
                for post in resp.json().get("data", {}).get("children", []):
                    d = post.get("data", {})
                    results.append({
                        "source": f"reddit/r/{subreddit}",
                        "title": d.get("title", ""),
                        "score": d.get("score", 0),
                        "url": f"https://reddit.com{d.get('permalink', '')}",
                        "comments": d.get("num_comments", 0),
                        "bot": self.name
                    })
            self.data_collected += len(results)
            self.results = results
            return results

    async def _scrape_rss(self) -> list[dict]:
        """RSS Feeds lesen."""
        async with httpx.AsyncClient(timeout=30.0) as client:
            url = self.config.get("url", "")
            resp = await client.get(url)
            # Einfacher XML Parser
            results = []
            if resp.status_code == 200:
                text = resp.text
                items = text.split("<item>")[1:]
                for item in items[:10]:
                    title = item.split("<title>")[1].split("</title>")[0] if "<title>" in item else ""
                    link = item.split("<link>")[1].split("</link>")[0] if "<link>" in item else ""
                    results.append({
                        "source": f"rss/{url[:50]}",
                        "title": title.replace("<![CDATA[", "").replace("]]>", ""),
                        "url": link,
                        "bot": self.name
                    })
            self.data_collected += len(results)
            self.results = results
            return results

    async def _call_api(self) -> list[dict]:
        """Custom API aufrufen."""
        async with httpx.AsyncClient(timeout=30.0) as client:
            url = self.config.get("url", "")
            method = self.config.get("method", "GET")
            headers = self.config.get("headers", {})
            resp = await client.request(method, url, headers=headers)
            if resp.status_code == 200:
                self.results = [{"source": "api", "data": resp.json(), "bot": self.name}]
                self.data_collected += 1
                return self.results
        return []

    async def _scrape_web(self) -> list[dict]:
        """Web-Seiten scrapen (einfach)."""
        async with httpx.AsyncClient(timeout=30.0) as client:
            url = self.config.get("url", "")
            resp = await client.get(url)
            if resp.status_code == 200:
                self.results = [{
                    "source": "web",
                    "url": url,
                    "size": len(resp.text),
                    "bot": self.name
                }]
                self.data_collected += 1
                return self.results
        return []

    def to_dict(self) -> dict:
        return {
            "name": self.name,
            "source_type": self.source_type,
            "status": self.status,
            "last_run": self.last_run,
            "data_collected": self.data_collected,
            "errors": self.errors,
            "results_count": len(self.results)
        }


class SwarmManager:
    """Verwaltet den NanoBot Schwarm."""

    def __init__(self, data_dir: str = ""):
        self.bots: dict[str, NanoBot] = {}
        self.data_dir = Path(data_dir) if data_dir else Path.home() / ".dkz-copilot" / "swarm"
        self.data_dir.mkdir(parents=True, exist_ok=True)
        self.running = False
        self._task: Optional[asyncio.Task] = None

    def create_bot(self, name: str, source_type: str, config: dict) -> NanoBot:
        """Erstellt einen neuen NanoBot."""
        bot = NanoBot(name, source_type, config)
        self.bots[name] = bot
        logger.info(f"NanoBot '{name}' erstellt ({source_type})")
        return bot

    def remove_bot(self, name: str) -> bool:
        if name in self.bots:
            del self.bots[name]
            return True
        return False

    async def run_all(self) -> dict:
        """Fuehrt alle Bots einmal aus."""
        results = {}
        tasks = []
        for name, bot in self.bots.items():
            tasks.append(self._run_bot(name, bot))
        
        gathered = await asyncio.gather(*tasks, return_exceptions=True)
        for i, (name, _) in enumerate(self.bots.items()):
            if isinstance(gathered[i], Exception):
                results[name] = {"error": str(gathered[i])}
            else:
                results[name] = gathered[i]
        
        # Ergebnisse speichern
        self._save_results(results)
        return results

    async def _run_bot(self, name: str, bot: NanoBot):
        return await bot.run()

    async def start_scheduler(self, interval_minutes: int = 30):
        """Startet den Schwarm-Scheduler."""
        self.running = True
        logger.info(f"Schwarm-Scheduler gestartet (alle {interval_minutes} Min)")
        while self.running:
            await self.run_all()
            await asyncio.sleep(interval_minutes * 60)

    def stop_scheduler(self):
        self.running = False

    def _save_results(self, results: dict):
        """Speichert Ergebnisse als JSON."""
        ts = datetime.now().strftime("%Y%m%d_%H%M%S")
        path = self.data_dir / f"swarm_{ts}.json"
        with open(path, "w", encoding="utf-8") as f:
            json.dump(results, f, indent=2, ensure_ascii=False, default=str)

        # Alte Dateien aufraeumen (max 100)
        files = sorted(self.data_dir.glob("swarm_*.json"))
        for old in files[:-100]:
            old.unlink()

    def get_status(self) -> dict:
        return {
            "running": self.running,
            "bots_count": len(self.bots),
            "bots": {name: bot.to_dict() for name, bot in self.bots.items()},
            "total_data": sum(b.data_collected for b in self.bots.values()),
            "total_errors": sum(b.errors for b in self.bots.values())
        }

    def create_default_swarm(self):
        """Erstellt den Standard-Schwarm fuer DEVKiTZ."""

        # GitHub Bots
        self.create_bot("kern-watcher", "github", {"repo": "D-VKITZ/KERN"})
        self.create_bot("ecosystem-watcher", "github", {"repo": "7IKED/devkitz-ecosystem"})
        self.create_bot("openhands-tracker", "github", {"repo": "All-Hands-AI/OpenHands"})
        self.create_bot("ollama-tracker", "github", {"repo": "ollama/ollama"})
        self.create_bot("qwen-tracker", "github", {"repo": "QwenLM/Qwen3"})
        self.create_bot("copilot-search", "github", {"query": "copilot coding agent self-hosted"})

        # Reddit Bots
        self.create_bot("r-programming", "reddit", {"subreddit": "programming"})
        self.create_bot("r-selfhosted", "reddit", {"subreddit": "selfhosted"})
        self.create_bot("r-localllama", "reddit", {"subreddit": "LocalLLaMA"})
        self.create_bot("r-github", "reddit", {"subreddit": "github"})

        # RSS Feeds
        self.create_bot("github-blog", "rss", {"url": "https://github.blog/feed/"})
        self.create_bot("hn-frontpage", "rss", {"url": "https://hnrss.org/frontpage"})

        logger.info(f"Standard-Schwarm erstellt: {len(self.bots)} Bots")
