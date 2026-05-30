"""
DkZ CoPilot Backend — Agent Orchestrator
Parst Issues, ruft Qwen via vLLM auf, extrahiert Code, orchestriert Workflow.
"""

import logging
import re
from pathlib import Path
from typing import Any

import httpx

from config import settings
from file_analyzer import find_relevant_files, scan_module
from git_worker import clone_or_pull, create_branch, apply_changes, commit_and_push, create_pull_request

logger = logging.getLogger("dkz-copilot.agent")

# --- Prompt Templates nach Labels ---
PROMPT_TEMPLATES: dict[str, str] = {
    "bug": (
        "Du bist ein erfahrener Bugfixer fuer das DEVKiTZ Dashboard.\n"
        "Analysiere den Bug-Report und erstelle einen Fix.\n"
        "Beachte: esc() bei innerHTML, DkZ CSS Variables, kein hardcoded Farben.\n"
        "Antworte mit den geaenderten Dateien als Code-Bloecke im Format:\n"
        "```filepath: pfad/zur/datei.js\n...code...\n```"
    ),
    "enhancement": (
        "Du bist ein Feature-Developer fuer das DEVKiTZ Dashboard.\n"
        "Implementiere das gewuenschte Feature.\n"
        "Beachte: Shared Scripts einbinden, features.json aktualisieren.\n"
        "Antworte mit den geaenderten Dateien als Code-Bloecke im Format:\n"
        "```filepath: pfad/zur/datei.js\n...code...\n```"
    ),
    "refactor": (
        "Du bist ein Code-Reviewer fuer das DEVKiTZ Dashboard.\n"
        "Refactore den Code nach DkZ Standards.\n"
        "Pruefe: XSS-Schutz, CSS Variables, console.log entfernen.\n"
        "Antworte mit den geaenderten Dateien als Code-Bloecke im Format:\n"
        "```filepath: pfad/zur/datei.js\n...code...\n```"
    ),
    "default": (
        "Du bist der DkZ CoPilot — ein KI-Entwickler fuer das DEVKiTZ Dashboard.\n"
        "Analysiere das Issue und erstelle eine Loesung.\n"
        "Beachte alle DkZ Coding Standards (esc(), CSS Variables, Shared Scripts).\n"
        "Antworte mit den geaenderten Dateien als Code-Bloecke im Format:\n"
        "```filepath: pfad/zur/datei.js\n...code...\n```"
    ),
}

# Regex fuer Code-Block Extraktion: ```filepath: pfad\n...code...\n```
CODE_BLOCK_PATTERN = re.compile(
    r"```(?:filepath:\s*(.+?)\n(.*?)```"
    r"|(\w+)\n(.*?)```)",
    re.DOTALL,
)

# Alternatives Pattern: Dateipfad in Kommentar
FILE_HEADER_PATTERN = re.compile(
    r"```(?:\w*)\n\s*(?://|#|<!--|/\*)\s*(?:file|path|datei):\s*(.+?)(?:\s*-->|\s*\*/|\s*)\n(.*?)```",
    re.DOTALL,
)


def _select_prompt_template(labels: list[str]) -> str:
    """Waehlt Prompt-Template basierend auf Issue-Labels."""
    for label in labels:
        label_lower = label.lower().strip()
        if label_lower in PROMPT_TEMPLATES:
            return PROMPT_TEMPLATES[label_lower]
        # Partielle Matches
        if "bug" in label_lower:
            return PROMPT_TEMPLATES["bug"]
        if "feature" in label_lower or "enhancement" in label_lower:
            return PROMPT_TEMPLATES["enhancement"]
        if "refactor" in label_lower or "cleanup" in label_lower:
            return PROMPT_TEMPLATES["refactor"]
    return PROMPT_TEMPLATES["default"]


def _load_copilot_instructions(repo_path: str) -> str:
    """Laedt copilot-instructions.md aus dem Repo falls vorhanden."""
    candidates = [
        Path(repo_path) / ".github" / "copilot-instructions.md",
        Path(repo_path) / "CLAUDE.md",
        Path(repo_path) / "GEMINI.md",
    ]
    for candidate in candidates:
        if candidate.exists():
            try:
                content = candidate.read_text(encoding="utf-8")
                logger.info("Instructions geladen: %s (%d Zeichen)", candidate.name, len(content))
                # Auf vernuenftige Laenge begrenzen
                return content[:4000]
            except OSError as exc:
                logger.warning("Konnte %s nicht lesen: %s", candidate, exc)
    return ""


def _extract_code_changes(llm_response: str) -> list[dict[str, str]]:
    """Extrahiert Datei-Aenderungen aus der LLM-Antwort.

    Unterstuetzt zwei Formate:
    1. ```filepath: pfad/datei.js\n...code...\n```
    2. ```js\n// file: pfad/datei.js\n...code...\n```
    """
    changes: list[dict[str, str]] = []

    # Format 1: filepath: im Fence
    for match in CODE_BLOCK_PATTERN.finditer(llm_response):
        filepath = match.group(1)
        content = match.group(2)
        if filepath and content:
            changes.append({
                "file_path": filepath.strip(),
                "content": content.strip(),
            })

    # Format 2: Datei-Header in Kommentar
    if not changes:
        for match in FILE_HEADER_PATTERN.finditer(llm_response):
            filepath = match.group(1)
            content = match.group(2)
            if filepath and content:
                changes.append({
                    "file_path": filepath.strip(),
                    "content": content.strip(),
                })

    logger.info("%d Code-Aenderungen aus LLM-Antwort extrahiert", len(changes))
    return changes


def _build_context(relevant_files: list[dict[str, Any]], scan_results: list[dict[str, Any]]) -> str:
    """Baut Kontext-String aus relevanten Dateien und Scan-Ergebnissen."""
    parts: list[str] = []

    if relevant_files:
        parts.append("=== Relevante Dateien ===")
        for f in relevant_files[:5]:  # Max 5 Dateien fuer Context-Limit
            parts.append(f"\n--- {f['path']} ({f['size']} bytes) ---")
            # Content begrenzen
            content = f.get("content", "")
            if len(content) > 2000:
                content = content[:2000] + "\n... (gekuerzt)"
            parts.append(content)

    if scan_results:
        parts.append("\n=== Modul-Scan Ergebnisse ===")
        for scan in scan_results:
            if scan.get("issues"):
                parts.append(f"\nModul-Score: {scan.get('score', 0)}/100")
                for issue in scan["issues"]:
                    parts.append(f"  ⚠ {issue}")

    return "\n".join(parts)


async def _call_vllm(system_prompt: str, user_message: str) -> str:
    """Ruft Qwen via vLLM OpenAI-kompatible API auf."""
    url = f"{settings.VLLM_URL}/chat/completions"
    payload = {
        "model": settings.MODEL_NAME,
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_message},
        ],
        "temperature": 0.3,
        "max_tokens": 4096,
    }

    logger.info("vLLM Anfrage an %s (Modell: %s)", url, settings.MODEL_NAME)

    async with httpx.AsyncClient(timeout=120.0) as client:
        response = await client.post(url, json=payload)
        response.raise_for_status()
        data = response.json()

    content: str = data["choices"][0]["message"]["content"]
    logger.info("vLLM Antwort erhalten: %d Zeichen", len(content))
    return content


async def _post_issue_comment(repo: str, issue_number: int, body: str) -> None:
    """Postet einen Kommentar auf das GitHub Issue."""
    url = f"https://api.github.com/repos/{settings.REPO_OWNER}/{repo}/issues/{issue_number}/comments"
    headers = {
        "Authorization": f"Bearer {settings.GITHUB_TOKEN}",
        "Accept": "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
    }

    async with httpx.AsyncClient(timeout=30.0) as client:
        response = await client.post(url, json={"body": body}, headers=headers)
        response.raise_for_status()

    logger.info("Kommentar auf Issue #%d gepostet", issue_number)


async def process_issue(issue_data: dict[str, Any]) -> dict[str, Any]:
    """Hauptfunktion: Verarbeitet ein GitHub Issue end-to-end.

    Workflow:
    1. Issue parsen
    2. Repo clonen/pullen
    3. Relevante Dateien finden + scannen
    4. Prompt zusammenbauen
    5. Qwen via vLLM aufrufen
    6. Code-Aenderungen extrahieren
    7. Branch erstellen + Changes anwenden
    8. Commit + Push + PR erstellen
    9. Ergebnis-Kommentar posten
    """
    issue_number: int = issue_data["number"]
    title: str = issue_data["title"]
    body: str = issue_data.get("body", "") or ""
    labels: list[str] = issue_data.get("labels", [])
    repo_name: str = issue_data.get("repo_name", settings.DEFAULT_REPO)

    logger.info("=== Verarbeite Issue #%d: %s ===", issue_number, title)

    # 1. Repo clonen/pullen
    repo_path = await clone_or_pull(repo_name)
    logger.info("Repo bereit: %s", repo_path)

    # 2. Relevante Dateien finden
    issue_text = f"{title}\n{body}"
    relevant_files = find_relevant_files(repo_path, issue_text)
    logger.info("%d relevante Dateien gefunden", len(relevant_files))

    # 3. Module scannen (falls Modul-Dateien gefunden)
    scan_results: list[dict[str, Any]] = []
    for f in relevant_files:
        fpath = Path(f["path"])
        # Wenn Datei in einem Modul-Ordner liegt
        if "modules" in fpath.parts:
            module_idx = list(fpath.parts).index("modules")
            if module_idx + 1 < len(fpath.parts):
                module_dir = Path(*fpath.parts[: module_idx + 2])
                full_module_path = Path(repo_path) / module_dir
                if full_module_path.is_dir():
                    scan = scan_module(str(full_module_path))
                    scan_results.append(scan)

    # 4. Prompt zusammenbauen
    prompt_template = _select_prompt_template(labels)
    instructions = _load_copilot_instructions(repo_path)
    context = _build_context(relevant_files, scan_results)

    system_prompt = f"{prompt_template}\n\n"
    if instructions:
        system_prompt += f"=== Projekt-Regeln ===\n{instructions}\n\n"

    user_message = (
        f"Issue #{issue_number}: {title}\n\n"
        f"{body}\n\n"
        f"Labels: {', '.join(labels)}\n\n"
        f"{context}"
    )

    # 5. Qwen aufrufen
    llm_response = await _call_vllm(system_prompt, user_message)

    # 6. Code-Aenderungen extrahieren
    changes = _extract_code_changes(llm_response)

    if not changes:
        # Keine Code-Aenderungen — nur Analyse-Kommentar posten
        comment_body = (
            f"🤖 **DkZ CoPilot Analyse** fuer #{issue_number}\n\n"
            f"{llm_response}\n\n"
            f"---\n"
            f"_Keine automatischen Code-Aenderungen moeglich. "
            f"Manuelle Bearbeitung erforderlich._"
        )
        await _post_issue_comment(repo_name, issue_number, comment_body)
        return {"status": "analysis_only", "changes": 0}

    # 7. Branch erstellen
    branch = await create_branch(repo_path, issue_number)
    logger.info("Branch erstellt: %s", branch)

    # 8. Changes anwenden
    changed_files = await apply_changes(repo_path, changes)
    logger.info("%d Dateien geaendert", len(changed_files))

    # 9. Commit + Push
    commit_msg = f"fix(copilot): #{issue_number} — {title}"
    push_success = await commit_and_push(repo_path, commit_msg)

    if not push_success:
        await _post_issue_comment(
            repo_name,
            issue_number,
            f"🤖 ❌ Push fehlgeschlagen fuer Issue #{issue_number}. Bitte manuell pruefen.",
        )
        return {"status": "push_failed", "changes": len(changed_files)}

    # 10. Pull Request erstellen
    pr_body = (
        f"🤖 **Automatischer Fix von DkZ CoPilot**\n\n"
        f"Closes #{issue_number}\n\n"
        f"### Aenderungen\n"
        + "\n".join(f"- `{f}`" for f in changed_files)
        + f"\n\n### LLM Analyse\n{llm_response[:1500]}"
    )

    pr_url = await create_pull_request(
        repo=repo_name,
        branch=branch,
        title=f"🤖 Fix #{issue_number}: {title}",
        body=pr_body,
        issue_number=issue_number,
    )

    # 11. Erfolgs-Kommentar
    comment_body = (
        f"🤖 **DkZ CoPilot** hat einen Fix erstellt!\n\n"
        f"📎 Pull Request: {pr_url}\n\n"
        f"### Geaenderte Dateien\n"
        + "\n".join(f"- `{f}`" for f in changed_files)
        + f"\n\n_Review von @{settings.REVIEWER} angefordert._"
    )
    await _post_issue_comment(repo_name, issue_number, comment_body)

    logger.info("=== Issue #%d erfolgreich verarbeitet — PR: %s ===", issue_number, pr_url)

    return {
        "status": "success",
        "changes": len(changed_files),
        "pr_url": pr_url,
        "branch": branch,
    }
