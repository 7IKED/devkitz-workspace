"""
DkZ CoPilot — VPS Controller
Komplette Kontrolle ueber KVM8 VPS via SSH/API.
Docker, Nginx, Services, Monitoring, Deploy.
"""

import asyncio
import httpx
import json
import logging
import subprocess
from datetime import datetime
from typing import Optional

logger = logging.getLogger("dkz-copilot.vps")


class VPSController:
    """Volle VPS-Steuerung ueber SSH und Docker API."""

    def __init__(self, host: str = "", user: str = "root", key_path: str = ""):
        self.host = host
        self.user = user
        self.key_path = key_path
        self.ssh_base = self._build_ssh_cmd()
        self.status_cache: dict = {}
        self.last_check: Optional[str] = None

    def _build_ssh_cmd(self) -> list[str]:
        """Baut den SSH Basis-Befehl."""
        cmd = ["ssh", "-o", "StrictHostKeyChecking=no", "-o", "ConnectTimeout=10"]
        if self.key_path:
            cmd.extend(["-i", self.key_path])
        cmd.append(f"{self.user}@{self.host}")
        return cmd

    async def ssh_exec(self, command: str, timeout: int = 30) -> dict:
        """Fuehrt einen Befehl auf dem VPS aus."""
        if not self.host:
            return {"error": "VPS Host nicht konfiguriert", "command": command}

        try:
            full_cmd = self.ssh_base + [command]
            result = subprocess.run(
                full_cmd, capture_output=True, text=True, timeout=timeout
            )
            return {
                "command": command,
                "stdout": result.stdout.strip(),
                "stderr": result.stderr.strip(),
                "returncode": result.returncode,
                "timestamp": datetime.now().isoformat()
            }
        except subprocess.TimeoutExpired:
            return {"command": command, "error": f"Timeout nach {timeout}s"}
        except Exception as e:
            return {"command": command, "error": str(e)}

    # === System Monitoring ===

    async def get_system_status(self) -> dict:
        """Kompletter System-Status."""
        commands = {
            "cpu": "top -bn1 | grep 'Cpu(s)' | awk '{print $2}'",
            "ram": "free -m | awk 'NR==2{printf \"%s/%sMB (%.1f%%)\", $3, $2, $3*100/$2}'",
            "disk": "df -h / | awk 'NR==2{printf \"%s/%s (%s)\", $3, $2, $5}'",
            "uptime": "uptime -p",
            "load": "cat /proc/loadavg | awk '{print $1, $2, $3}'",
            "processes": "ps aux | wc -l",
            "connections": "ss -tuln | wc -l"
        }

        status = {}
        for key, cmd in commands.items():
            result = await self.ssh_exec(cmd)
            status[key] = result.get("stdout", result.get("error", "N/A"))

        status["timestamp"] = datetime.now().isoformat()
        self.status_cache = status
        self.last_check = status["timestamp"]
        return status

    # === Docker Management ===

    async def docker_ps(self) -> list[dict]:
        """Alle Docker Container auflisten."""
        result = await self.ssh_exec(
            'docker ps -a --format "{{.Names}}|{{.Status}}|{{.Ports}}|{{.Image}}"'
        )
        containers = []
        for line in result.get("stdout", "").split("\n"):
            if "|" in line:
                parts = line.split("|")
                containers.append({
                    "name": parts[0],
                    "status": parts[1] if len(parts) > 1 else "",
                    "ports": parts[2] if len(parts) > 2 else "",
                    "image": parts[3] if len(parts) > 3 else ""
                })
        return containers

    async def docker_start(self, container: str) -> dict:
        return await self.ssh_exec(f"docker start {container}")

    async def docker_stop(self, container: str) -> dict:
        return await self.ssh_exec(f"docker stop {container}")

    async def docker_restart(self, container: str) -> dict:
        return await self.ssh_exec(f"docker restart {container}")

    async def docker_logs(self, container: str, lines: int = 50) -> dict:
        return await self.ssh_exec(f"docker logs --tail {lines} {container}")

    async def docker_stats(self) -> dict:
        """Docker Resource-Verbrauch."""
        result = await self.ssh_exec(
            'docker stats --no-stream --format "{{.Name}}|{{.CPUPerc}}|{{.MemUsage}}"'
        )
        stats = {}
        for line in result.get("stdout", "").split("\n"):
            if "|" in line:
                parts = line.split("|")
                stats[parts[0]] = {
                    "cpu": parts[1] if len(parts) > 1 else "",
                    "memory": parts[2] if len(parts) > 2 else ""
                }
        return stats

    async def docker_compose_up(self, project_dir: str = "/opt/dkz-copilot") -> dict:
        """docker compose up -d im Projektverzeichnis."""
        return await self.ssh_exec(f"cd {project_dir} && docker compose up -d", timeout=120)

    async def docker_compose_pull(self, project_dir: str = "/opt/dkz-copilot") -> dict:
        """Images aktualisieren."""
        return await self.ssh_exec(f"cd {project_dir} && docker compose pull", timeout=300)

    # === Service Management ===

    async def nginx_reload(self) -> dict:
        return await self.ssh_exec("nginx -t && nginx -s reload")

    async def nginx_status(self) -> dict:
        return await self.ssh_exec("systemctl status nginx --no-pager -l | head -20")

    async def ssl_check(self, domain: str = "") -> dict:
        """SSL Zertifikat pruefen."""
        if not domain:
            return {"error": "Domain angeben"}
        return await self.ssh_exec(
            f"echo | openssl s_client -connect {domain}:443 -servername {domain} 2>/dev/null | "
            f"openssl x509 -noout -dates -subject 2>/dev/null"
        )

    async def ssl_renew(self) -> dict:
        """Certbot SSL erneuern."""
        return await self.ssh_exec("certbot renew --quiet", timeout=120)

    # === Deploy ===

    async def deploy_copilot(self, local_path: str = "") -> dict:
        """DkZ CoPilot auf VPS deployen."""
        steps = []

        # 1. Git Pull auf VPS
        r = await self.ssh_exec("cd /opt/dkz-copilot && git pull origin main")
        steps.append({"step": "git_pull", "result": r.get("stdout", r.get("error", ""))})

        # 2. Docker Compose rebuild
        r = await self.ssh_exec(
            "cd /opt/dkz-copilot && docker compose build --no-cache dkz-copilot",
            timeout=300
        )
        steps.append({"step": "docker_build", "result": r.get("returncode", -1)})

        # 3. Neustart
        r = await self.ssh_exec(
            "cd /opt/dkz-copilot && docker compose up -d --force-recreate dkz-copilot"
        )
        steps.append({"step": "restart", "result": r.get("stdout", r.get("error", ""))})

        # 4. Health Check
        await asyncio.sleep(5)
        r = await self.ssh_exec("curl -sf http://localhost:3050/health")
        steps.append({"step": "health", "result": r.get("stdout", r.get("error", ""))})

        return {"deployed": True, "steps": steps, "timestamp": datetime.now().isoformat()}

    async def deploy_dashboard(self, rsync_from: str = "") -> dict:
        """Dashboard auf VPS deployen via rsync."""
        if not rsync_from:
            return {"error": "rsync Quellpfad angeben"}
        
        result = subprocess.run(
            ["rsync", "-avz", "--delete",
             rsync_from,
             f"{self.user}@{self.host}:/var/www/dashboard/"],
            capture_output=True, text=True, timeout=120
        )
        return {
            "deployed": result.returncode == 0,
            "stdout": result.stdout[-500:],
            "stderr": result.stderr[-200:]
        }

    # === Ollama / LLM Management ===

    async def ollama_list_models(self) -> list[dict]:
        """Installierte Ollama Models auflisten."""
        result = await self.ssh_exec("docker exec ollama ollama list")
        models = []
        for line in result.get("stdout", "").split("\n")[1:]:
            parts = line.split()
            if parts:
                models.append({
                    "name": parts[0],
                    "size": parts[1] if len(parts) > 1 else "",
                    "modified": " ".join(parts[2:]) if len(parts) > 2 else ""
                })
        return models

    async def ollama_pull_model(self, model: str) -> dict:
        """Neues Model herunterladen."""
        return await self.ssh_exec(f"docker exec ollama ollama pull {model}", timeout=600)

    async def ollama_remove_model(self, model: str) -> dict:
        return await self.ssh_exec(f"docker exec ollama ollama rm {model}")

    # === Security ===

    async def check_open_ports(self) -> dict:
        return await self.ssh_exec("ss -tuln | grep LISTEN")

    async def check_fail2ban(self) -> dict:
        return await self.ssh_exec("fail2ban-client status 2>/dev/null || echo 'fail2ban nicht installiert'")

    async def check_updates(self) -> dict:
        return await self.ssh_exec("apt list --upgradable 2>/dev/null | head -20")

    async def apply_updates(self) -> dict:
        return await self.ssh_exec("apt update && apt upgrade -y", timeout=300)

    # === Backup ===

    async def backup_volumes(self, target: str = "/backups") -> dict:
        """Docker Volumes sichern."""
        ts = datetime.now().strftime("%Y%m%d_%H%M%S")
        commands = [
            f"mkdir -p {target}",
            f"docker run --rm -v copilot-data:/data -v {target}:/backup alpine tar czf /backup/copilot-data_{ts}.tar.gz -C /data .",
            f"docker run --rm -v ollama-models:/data -v {target}:/backup alpine tar czf /backup/ollama-models_{ts}.tar.gz -C /data .",
            f"docker run --rm -v n8n-data:/data -v {target}:/backup alpine tar czf /backup/n8n-data_{ts}.tar.gz -C /data .",
        ]
        results = []
        for cmd in commands:
            r = await self.ssh_exec(cmd, timeout=300)
            results.append(r)

        # Alte Backups aufraeumen (max 5)
        await self.ssh_exec(f"cd {target} && ls -t *.tar.gz | tail -n +16 | xargs rm -f 2>/dev/null")

        return {"backed_up": True, "files": len(commands) - 1, "target": target}

    # === Full Status ===

    async def full_health_check(self) -> dict:
        """Kompletter VPS Health-Check."""
        system = await self.get_system_status()
        containers = await self.docker_ps()
        models = await self.ollama_list_models()
        ports = await self.check_open_ports()

        # Ampel berechnen
        ampel = "gruen"
        issues = []

        # CPU Check
        try:
            cpu = float(system.get("cpu", "0").replace(",", "."))
            if cpu > 80:
                ampel = "rot"
                issues.append(f"CPU: {cpu}%")
            elif cpu > 60:
                ampel = "gelb"
                issues.append(f"CPU: {cpu}%")
        except ValueError:
            pass

        # Container Check
        stopped = [c for c in containers if "Exited" in c.get("status", "")]
        if stopped:
            ampel = "gelb" if ampel == "gruen" else ampel
            issues.append(f"{len(stopped)} Container gestoppt")

        return {
            "ampel": ampel,
            "issues": issues,
            "system": system,
            "containers": containers,
            "models": models,
            "ports": ports.get("stdout", ""),
            "timestamp": datetime.now().isoformat()
        }
