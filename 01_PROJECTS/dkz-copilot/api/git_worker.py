"""
DkZ CoPilot Backend — Git Worker
Clone, Branch, Commit, Push, Pull Request via GitHub API.
"""

import asyncio
import logging
from pathlib import Path
from typing import Any

import httpx

from config import settings

logger = logging.getLogger("dkz-copilot.git")


async def _run_git(args: list[str], cwd: str | None = None) -> tuple[int, str, str]:
    """Fuehrt einen Git-Befehl aus und gibt (returncode, stdout, stderr) zurueck."""
    cmd = ["git"] + args
    logger.debug("Git: %s (cwd=%s)", " ".join(cmd), cwd)

    proc = await asyncio.create_subprocess_exec(
        *cmd,
        cwd=cwd,
        stdout=asyncio.subprocess.PIPE,
        stderr=asyncio.subprocess.PIPE,
    )
    stdout_bytes, stderr_bytes = await proc.communicate()
    stdout = stdout_bytes.decode("utf-8", errors="replace").strip()
    stderr = stderr_bytes.decode("utf-8", errors="replace").strip()

    if proc.returncode != 0:
        logger.warning("Git Fehler (rc=%d): %s\nstderr: %s", proc.returncode, " ".join(cmd), stderr)

    return proc.returncode, stdout, stderr


async def clone_or_pull(repo: str) -> str:
    """Clont ein Repo oder aktualisiert es via git pull.

    Args:
        repo: Repository-Name (ohne Owner)

    Returns:
        Absoluter Pfad zum Repo-Verzeichnis
    """
    work_dir = Path(settings.WORK_DIR)
    work_dir.mkdir(parents=True, exist_ok=True)

    repo_path = work_dir / repo

    if (repo_path / ".git").is_dir():
        # Repo existiert — pull
        logger.info("Repo existiert, fuehre git pull aus: %s", repo_path)

        # Auf main/master wechseln
        rc, stdout, _ = await _run_git(["symbolic-ref", "refs/remotes/origin/HEAD"], str(repo_path))
        default_branch = "main"
        if rc == 0 and stdout:
            default_branch = stdout.split("/")[-1]

        await _run_git(["checkout", default_branch], str(repo_path))
        await _run_git(["reset", "--hard", f"origin/{default_branch}"], str(repo_path))
        rc, _, stderr = await _run_git(["pull", "--ff-only"], str(repo_path))

        if rc != 0:
            logger.warning("Pull fehlgeschlagen, versuche force reset: %s", stderr)
            await _run_git(["fetch", "origin"], str(repo_path))
            await _run_git(["reset", "--hard", f"origin/{default_branch}"], str(repo_path))
    else:
        # Repo clonen
        clone_url = f"https://x-access-token:{settings.GITHUB_TOKEN}@github.com/{settings.REPO_OWNER}/{repo}.git"
        logger.info("Clone Repo: %s/%s → %s", settings.REPO_OWNER, repo, repo_path)

        rc, _, stderr = await _run_git(["clone", "--depth", "1", clone_url, str(repo_path)])
        if rc != 0:
            raise RuntimeError(f"Git clone fehlgeschlagen: {stderr}")

    # Git User konfigurieren
    await _run_git(["config", "user.name", settings.BOT_USERNAME], str(repo_path))
    await _run_git(["config", "user.email", f"{settings.BOT_USERNAME}@users.noreply.github.com"], str(repo_path))

    return str(repo_path)


async def create_branch(repo_path: str, issue_number: int) -> str:
    """Erstellt einen neuen Branch fuer das Issue.

    Args:
        repo_path: Pfad zum geclonten Repo
        issue_number: GitHub Issue Nummer

    Returns:
        Branch-Name
    """
    branch = f"dkz-bot/issue-{issue_number}"

    # Falls Branch schon existiert, loeschen
    await _run_git(["branch", "-D", branch], repo_path)

    rc, _, stderr = await _run_git(["checkout", "-b", branch], repo_path)
    if rc != 0:
        raise RuntimeError(f"Branch erstellen fehlgeschlagen: {stderr}")

    logger.info("Branch erstellt: %s", branch)
    return branch


async def apply_changes(repo_path: str, changes: list[dict[str, str]]) -> list[str]:
    """Wendet Code-Aenderungen an und staged sie.

    Args:
        repo_path: Pfad zum geclonten Repo
        changes: Liste von {file_path: str, content: str}

    Returns:
        Liste der geaenderten Dateipfade
    """
    changed_files: list[str] = []
    repo = Path(repo_path)

    for change in changes:
        file_path = change["file_path"]
        content = change["content"]

        # Sicherheitscheck: Kein Path Traversal
        target = (repo / file_path).resolve()
        if not str(target).startswith(str(repo.resolve())):
            logger.warning("Path Traversal blockiert: %s", file_path)
            continue

        # Verzeichnis erstellen falls noetig
        target.parent.mkdir(parents=True, exist_ok=True)

        # Datei schreiben
        try:
            target.write_text(content, encoding="utf-8")
            logger.info("Datei geschrieben: %s (%d Zeichen)", file_path, len(content))
            changed_files.append(file_path)
        except OSError as exc:
            logger.error("Datei schreiben fehlgeschlagen: %s — %s", file_path, exc)
            continue

    # Alle geaenderten Dateien stagen
    if changed_files:
        rc, _, stderr = await _run_git(["add"] + changed_files, repo_path)
        if rc != 0:
            logger.warning("Git add Warnung: %s", stderr)

    return changed_files


async def commit_and_push(repo_path: str, message: str) -> bool:
    """Committet und pusht Aenderungen.

    Args:
        repo_path: Pfad zum geclonten Repo
        message: Commit-Message

    Returns:
        True bei Erfolg
    """
    # Pruefen ob es ueberhaupt Aenderungen gibt
    rc, stdout, _ = await _run_git(["status", "--porcelain"], repo_path)
    if not stdout.strip():
        logger.info("Keine Aenderungen zum committen")
        return True

    # Commit
    rc, _, stderr = await _run_git(["commit", "-m", message], repo_path)
    if rc != 0:
        logger.error("Commit fehlgeschlagen: %s", stderr)
        return False

    # Aktuellen Branch ermitteln
    rc, branch, _ = await _run_git(["branch", "--show-current"], repo_path)
    if rc != 0 or not branch:
        logger.error("Konnte aktuellen Branch nicht ermitteln")
        return False

    # Push
    rc, _, stderr = await _run_git(["push", "origin", branch, "--force-with-lease"], repo_path)
    if rc != 0:
        # Fallback: force push
        logger.warning("Push mit lease fehlgeschlagen, versuche force push")
        rc, _, stderr = await _run_git(["push", "origin", branch, "--force"], repo_path)
        if rc != 0:
            logger.error("Force Push fehlgeschlagen: %s", stderr)
            return False

    logger.info("Commit + Push erfolgreich: %s → %s", message[:50], branch)
    return True


async def create_pull_request(
    repo: str,
    branch: str,
    title: str,
    body: str,
    issue_number: int,
) -> str:
    """Erstellt einen Pull Request via GitHub API.

    Args:
        repo: Repository-Name
        branch: Source-Branch
        title: PR Titel
        body: PR Body (Markdown)
        issue_number: Verlinktes Issue

    Returns:
        PR HTML URL
    """
    url = f"https://api.github.com/repos/{settings.REPO_OWNER}/{repo}/pulls"
    headers = {
        "Authorization": f"Bearer {settings.GITHUB_TOKEN}",
        "Accept": "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
    }

    # Default Branch ermitteln
    repo_url = f"https://api.github.com/repos/{settings.REPO_OWNER}/{repo}"
    async with httpx.AsyncClient(timeout=30.0) as client:
        repo_resp = await client.get(repo_url, headers=headers)
        repo_resp.raise_for_status()
        repo_data = repo_resp.json()
        base_branch = repo_data.get("default_branch", "main")

    # PR Body mit Issue-Referenz
    full_body = f"{body}\n\n---\nCloses #{issue_number}"

    payload: dict[str, Any] = {
        "title": title,
        "body": full_body,
        "head": branch,
        "base": base_branch,
    }

    async with httpx.AsyncClient(timeout=30.0) as client:
        response = await client.post(url, json=payload, headers=headers)
        response.raise_for_status()
        pr_data = response.json()

    pr_number = pr_data["number"]
    pr_url = pr_data["html_url"]
    logger.info("Pull Request erstellt: #%d — %s", pr_number, pr_url)

    # Reviewer hinzufuegen
    await _add_reviewer(repo, pr_number, headers)

    # Labels hinzufuegen
    await _add_labels(repo, pr_number, headers)

    return pr_url


async def _add_reviewer(repo: str, pr_number: int, headers: dict[str, str]) -> None:
    """Fuegt den konfigurierten Reviewer zum PR hinzu."""
    url = f"https://api.github.com/repos/{settings.REPO_OWNER}/{repo}/pulls/{pr_number}/requested_reviewers"
    payload = {"reviewers": [settings.REVIEWER]}

    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            resp = await client.post(url, json=payload, headers=headers)
            if resp.status_code < 300:
                logger.info("Reviewer @%s zum PR #%d hinzugefuegt", settings.REVIEWER, pr_number)
            else:
                logger.warning(
                    "Reviewer hinzufuegen fehlgeschlagen (HTTP %d): %s",
                    resp.status_code,
                    resp.text[:200],
                )
    except httpx.HTTPError as exc:
        logger.warning("Reviewer Request fehlgeschlagen: %s", exc)


async def _add_labels(repo: str, pr_number: int, headers: dict[str, str]) -> None:
    """Fuegt Labels zum PR hinzu."""
    url = f"https://api.github.com/repos/{settings.REPO_OWNER}/{repo}/issues/{pr_number}/labels"
    payload = {"labels": ["copilot", "fix"]}

    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            resp = await client.post(url, json=payload, headers=headers)
            if resp.status_code < 300:
                logger.info("Labels zum PR #%d hinzugefuegt", pr_number)
            else:
                logger.warning(
                    "Labels hinzufuegen fehlgeschlagen (HTTP %d): %s",
                    resp.status_code,
                    resp.text[:200],
                )
    except httpx.HTTPError as exc:
        logger.warning("Labels Request fehlgeschlagen: %s", exc)
