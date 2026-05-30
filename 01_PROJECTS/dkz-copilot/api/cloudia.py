"""
CLOUDIA² — Cloud Control Modul fuer DkZ CoPilot
Zentraler VPS + Cloud + Drive + Service Manager.
Verbindet alle Infrastruktur-Komponenten.
"""

import asyncio
import json
import logging
import subprocess
from datetime import datetime
from pathlib import Path
from typing import Optional

logger = logging.getLogger("dkz-copilot.cloudia")


class CloudiaController:
    """
    CLOUDIA² — Cloud Infrastructure Controller.
    Verwaltet: VPS, Docker, Google Drive, Domains, SSL, Backups.
    """

    def __init__(self, config: dict = None):
        self.config = config or {}
        self.vps_host = self.config.get("vps_host", "")
        self.vps_user = self.config.get("vps_user", "root")
        self.drive_folder = self.config.get("drive_folder", "")
        self.domains = self.config.get("domains", [])
        self.status_cache = {}
        self.last_sync = None

    # === Google Drive Sync ===

    async def sync_to_drive(self, local_path: str, drive_path: str = "") -> dict:
        """Synchronisiert lokalen Ordner zu Google Drive via rclone/gdrive."""
        if not drive_path:
            drive_path = self.drive_folder or "DEVKiTZ-Backup"

        try:
            # Methode 1: rclone (bevorzugt)
            result = subprocess.run(
                ["rclone", "sync", local_path, f"gdrive:{drive_path}",
                 "--progress", "--transfers", "4", "--checkers", "8",
                 "--exclude", "node_modules/**", "--exclude", ".git/**",
                 "--exclude", "__pycache__/**"],
                capture_output=True, text=True, timeout=600
            )

            if result.returncode == 0:
                self.last_sync = datetime.now().isoformat()
                return {
                    "success": True,
                    "method": "rclone",
                    "source": local_path,
                    "destination": f"gdrive:{drive_path}",
                    "timestamp": self.last_sync,
                    "output": result.stdout[-500:] if result.stdout else ""
                }

            # Methode 2: gdrive CLI
            result2 = subprocess.run(
                ["gdrive", "sync", "upload", local_path, "--keep-local"],
                capture_output=True, text=True, timeout=600
            )
            if result2.returncode == 0:
                self.last_sync = datetime.now().isoformat()
                return {"success": True, "method": "gdrive", "timestamp": self.last_sync}

            return {"success": False, "error": result.stderr + "\n" + result2.stderr}

        except FileNotFoundError:
            return {
                "success": False,
                "error": "Weder rclone noch gdrive installiert. Installiere: winget install rclone"
            }
        except subprocess.TimeoutExpired:
            return {"success": False, "error": "Timeout nach 10 Minuten"}
        except Exception as e:
            return {"success": False, "error": str(e)}

    async def sync_copilot_to_drive(self) -> dict:
        """Synchronisiert das komplette dkz-copilot Projekt zu Drive."""
        return await self.sync_to_drive(
            str(Path(__file__).parent.parent),
            "DEVKiTZ/dkz-copilot"
        )

    async def sync_dashboard_to_drive(self) -> dict:
        """Synchronisiert alle Dashboard-Module."""
        dashboard_path = Path(r"C:\DEVKiTZ\01_PROJECTS\01_dashboard")
        return await self.sync_to_drive(str(dashboard_path), "DEVKiTZ/dashboard")

    async def sync_walkthroughs_to_drive(self) -> dict:
        """Synchronisiert Walkthroughs + Artefakte."""
        brain_path = Path.home() / ".gemini" / "antigravity" / "brain"
        return await self.sync_to_drive(str(brain_path), "DEVKiTZ/brain-backup")

    # === Full Sync ===

    async def full_sync(self) -> dict:
        """Synchronisiert ALLES zu Drive + VPS."""
        results = {}

        # 1. Git Push
        try:
            git_result = subprocess.run(
                "git add -A && git commit -m \"sync: CLOUDIA Auto-Sync\" && git push origin main",
                shell=True, capture_output=True, text=True,
                cwd=r"C:\DEVKiTZ", timeout=60
            )
            results["git"] = {
                "success": git_result.returncode == 0,
                "output": git_result.stdout[-200:]
            }
        except Exception as e:
            results["git"] = {"success": False, "error": str(e)}

        # 2. Drive Sync
        results["drive_copilot"] = await self.sync_copilot_to_drive()
        results["drive_dashboard"] = await self.sync_dashboard_to_drive()

        # 3. VPS Sync (wenn konfiguriert)
        if self.vps_host:
            try:
                vps_result = subprocess.run(
                    ["ssh", f"{self.vps_user}@{self.vps_host}",
                     "cd /opt/dkz-copilot && git pull origin main && docker compose up -d"],
                    capture_output=True, text=True, timeout=120
                )
                results["vps"] = {"success": vps_result.returncode == 0}
            except Exception as e:
                results["vps"] = {"success": False, "error": str(e)}

        # 4. features.json aktualisieren
        try:
            modules_dir = Path(r"C:\DEVKiTZ\01_PROJECTS\01_dashboard\modules")
            count = sum(1 for d in modules_dir.iterdir() if d.is_dir() and (d / "index.html").exists())
            results["features"] = {"modules": count}
        except Exception:
            results["features"] = {"modules": 0}

        self.last_sync = datetime.now().isoformat()
        results["timestamp"] = self.last_sync
        return results

    # === Domain Management ===

    async def check_domains(self) -> list[dict]:
        """Prueft alle konfigurierten Domains."""
        results = []
        for domain in self.domains:
            try:
                import httpx
                async with httpx.AsyncClient(timeout=10.0) as client:
                    resp = await client.get(f"https://{domain}", follow_redirects=True)
                    results.append({
                        "domain": domain,
                        "status": resp.status_code,
                        "online": resp.status_code < 400,
                        "ssl": True
                    })
            except Exception as e:
                results.append({
                    "domain": domain,
                    "status": 0,
                    "online": False,
                    "error": str(e)
                })
        return results

    # === Service Health ===

    async def health_check(self) -> dict:
        """Kompletter CLOUDIA Health Check."""
        checks = {}

        # Git Status
        try:
            result = subprocess.run(
                "git status --porcelain", shell=True,
                capture_output=True, text=True,
                cwd=r"C:\DEVKiTZ", timeout=10
            )
            changes = len([l for l in result.stdout.strip().split("\n") if l.strip()])
            checks["git"] = {"status": "clean" if changes == 0 else f"{changes} Aenderungen"}
        except Exception:
            checks["git"] = {"status": "error"}

        # Drive
        try:
            rclone_check = subprocess.run(
                ["rclone", "about", "gdrive:"], capture_output=True, text=True, timeout=15
            )
            checks["drive"] = {
                "status": "connected" if rclone_check.returncode == 0 else "nicht verbunden",
                "info": rclone_check.stdout[:200] if rclone_check.returncode == 0 else ""
            }
        except FileNotFoundError:
            checks["drive"] = {"status": "rclone nicht installiert"}
        except Exception:
            checks["drive"] = {"status": "error"}

        # VPS
        if self.vps_host:
            try:
                ping = subprocess.run(
                    ["ping", "-n", "1", "-w", "3000", self.vps_host],
                    capture_output=True, text=True, timeout=5
                )
                checks["vps"] = {
                    "host": self.vps_host,
                    "reachable": ping.returncode == 0
                }
            except Exception:
                checks["vps"] = {"reachable": False}

        # Ampel
        all_ok = all(
            c.get("status") != "error" and c.get("reachable", True)
            for c in checks.values()
        )
        checks["ampel"] = "gruen" if all_ok else "gelb"
        checks["last_sync"] = self.last_sync
        checks["timestamp"] = datetime.now().isoformat()

        self.status_cache = checks
        return checks

    def get_status(self) -> dict:
        return self.status_cache or {"ampel": "unbekannt", "last_sync": self.last_sync}
