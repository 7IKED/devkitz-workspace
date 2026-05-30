"""
DkZ CoPilot Backend — File Analyzer
Findet relevante Dateien und scannt Module auf DkZ-Compliance.
"""

import logging
import re
from pathlib import Path
from typing import Any

logger = logging.getLogger("dkz-copilot.analyzer")

# --- Bekannte Modul-Namen Pattern ---
MODULE_NAME_PATTERN = re.compile(
    r"\b(modules?[/\\][\w-]+|[\w]+-(?:hub|board|viewer|manager|check|tools?|editor|monitor))\b",
    re.IGNORECASE,
)

# Shared Script Referenzen
SHARED_SCRIPTS = [
    "dkz-debug.js",
    "dkz-guide.js",
    "dkz-navbar.js",
    "dkz-toast.js",
    "dkz-copilot.js",
    "dkz-theme.js",
]

# DkZ CSS Custom Properties (duerfen NICHT hardcoded werden)
HARDCODED_COLORS = re.compile(
    r"(?:color|background|border|fill|stroke)\s*:\s*#(?:fa1e4e|060608|00ff88|ffb800|ff3b5c)",
    re.IGNORECASE,
)

# XSS Check: innerHTML ohne esc()
INNERHTML_PATTERN = re.compile(r"\.innerHTML\s*=\s*(?!.*esc\()", re.IGNORECASE)
INNERHTML_SAFE_PATTERN = re.compile(r"\.innerHTML\s*=\s*['\"`]\s*['\"`]")  # Leerer String ist OK

# Meta-Tag Check
DKZ_VERSION_PATTERN = re.compile(r'<meta\s+name="dkz-version"', re.IGNORECASE)

# Hub-Button Check
HUB_BUTTON_PATTERN = re.compile(
    r'class="[^"]*hub-btn[^"]*"|id="[^"]*hub-button[^"]*"|dkz-navbar',
    re.IGNORECASE,
)


def find_relevant_files(repo_path: str, issue_text: str) -> list[dict[str, Any]]:
    """Findet relevante Dateien im Repo basierend auf Issue-Text.

    Strategie:
    1. Modul-Namen aus Issue extrahieren
    2. In modules/ nach passenden Ordnern suchen
    3. index.html der Module lesen
    4. Shared Scripts pruefen
    5. Direkt referenzierte Dateipfade erkennen

    Returns:
        Liste von {path, content, size} Dicts
    """
    repo = Path(repo_path)
    results: list[dict[str, Any]] = []
    seen_paths: set[str] = set()

    # 1. Modul-Namen aus Issue-Text extrahieren
    module_refs = MODULE_NAME_PATTERN.findall(issue_text)
    logger.info("Modul-Referenzen im Issue: %s", module_refs)

    # Auch einfache Woerter die Modul-Namen sein koennten
    words = set(re.findall(r"\b[\w-]{3,30}\b", issue_text.lower()))

    # 2. modules/ Verzeichnis durchsuchen
    modules_dir = repo / "modules"
    if modules_dir.is_dir():
        for module_dir in sorted(modules_dir.iterdir()):
            if not module_dir.is_dir():
                continue

            module_name = module_dir.name.lower()
            is_relevant = False

            # Direkte Referenz aus Regex
            for ref in module_refs:
                if module_name in ref.lower():
                    is_relevant = True
                    break

            # Wort-Match
            if not is_relevant and module_name in words:
                is_relevant = True

            # Teil-Match (z.B. "wissen" matched "wissen-hub")
            if not is_relevant:
                for word in words:
                    if len(word) >= 4 and (word in module_name or module_name in word):
                        is_relevant = True
                        break

            if is_relevant:
                _collect_module_files(module_dir, repo, results, seen_paths)

    # 3. Shared Scripts pruefen (wenn im Issue erwaehnt)
    shared_dir = repo / "shared"
    if shared_dir.is_dir():
        for script_name in SHARED_SCRIPTS:
            script_path = shared_dir / script_name
            if script_path.exists() and script_name.lower() in issue_text.lower():
                _add_file(script_path, repo, results, seen_paths)

    # 4. Direkt referenzierte Dateipfade
    file_refs = re.findall(r"[\w/\\.-]+\.(?:js|css|html|json)", issue_text)
    for ref in file_refs:
        ref_path = repo / ref.replace("\\", "/")
        if ref_path.exists():
            _add_file(ref_path, repo, results, seen_paths)

    # 5. features.json immer mit einbeziehen wenn vorhanden
    features_json = repo / "features.json"
    if features_json.exists():
        _add_file(features_json, repo, results, seen_paths)

    logger.info("Insgesamt %d relevante Dateien gefunden", len(results))
    return results


def _collect_module_files(
    module_dir: Path,
    repo_root: Path,
    results: list[dict[str, Any]],
    seen: set[str],
) -> None:
    """Sammelt wichtige Dateien aus einem Modul-Verzeichnis."""
    # Prioritaet: index.html zuerst
    priority_files = ["index.html", "style.css", "script.js", "app.js", "main.js"]
    for fname in priority_files:
        fpath = module_dir / fname
        if fpath.exists():
            _add_file(fpath, repo_root, results, seen)

    # Dann alle anderen relevanten Dateien (max 3 zusaetzliche)
    extra_count = 0
    for fpath in sorted(module_dir.rglob("*")):
        if extra_count >= 3:
            break
        if fpath.is_file() and fpath.suffix in (".js", ".css", ".html", ".json"):
            rel = str(fpath.relative_to(repo_root))
            if rel not in seen:
                _add_file(fpath, repo_root, results, seen)
                extra_count += 1


def _add_file(
    filepath: Path,
    repo_root: Path,
    results: list[dict[str, Any]],
    seen: set[str],
) -> None:
    """Fuegt eine Datei zur Ergebnisliste hinzu."""
    rel_path = str(filepath.relative_to(repo_root)).replace("\\", "/")
    if rel_path in seen:
        return

    try:
        content = filepath.read_text(encoding="utf-8", errors="replace")
        size = filepath.stat().st_size
    except OSError as exc:
        logger.warning("Datei nicht lesbar: %s — %s", filepath, exc)
        return

    seen.add(rel_path)
    results.append({
        "path": rel_path,
        "content": content,
        "size": size,
    })


def scan_module(module_path: str) -> dict[str, Any]:
    """Scannt ein Modul-Verzeichnis auf DkZ-Compliance.

    Checks:
    - XSS: innerHTML ohne esc()
    - CSS: Hardcoded Farben statt CSS Variables
    - Meta: dkz-version Meta-Tag
    - Hub: Hub-Button / Navbar vorhanden

    Returns:
        {issues: list[str], score: int}  (Score 0-100, hoeher = besser)
    """
    module = Path(module_path)
    issues: list[str] = []
    score = 100

    if not module.is_dir():
        return {"issues": ["Modul-Verzeichnis existiert nicht"], "score": 0}

    # Alle relevanten Dateien sammeln
    html_files = list(module.rglob("*.html"))
    js_files = list(module.rglob("*.js"))
    css_files = list(module.rglob("*.css"))

    # --- XSS Check ---
    for js_file in js_files:
        try:
            content = js_file.read_text(encoding="utf-8", errors="replace")
        except OSError:
            continue

        for line_num, line in enumerate(content.splitlines(), start=1):
            if INNERHTML_PATTERN.search(line) and not INNERHTML_SAFE_PATTERN.search(line):
                issues.append(
                    f"XSS-Risiko: {js_file.name}:{line_num} — innerHTML ohne esc()"
                )
                score -= 15

    # --- CSS Hardcoded Colors ---
    all_style_files = css_files.copy()
    # Auch inline Styles in HTML pruefen
    for html_file in html_files:
        try:
            content = html_file.read_text(encoding="utf-8", errors="replace")
        except OSError:
            continue
        for line_num, line in enumerate(content.splitlines(), start=1):
            if HARDCODED_COLORS.search(line):
                issues.append(
                    f"CSS: {html_file.name}:{line_num} — Hardcoded Farbe statt CSS Variable"
                )
                score -= 5

    for css_file in all_style_files:
        try:
            content = css_file.read_text(encoding="utf-8", errors="replace")
        except OSError:
            continue
        for line_num, line in enumerate(content.splitlines(), start=1):
            if HARDCODED_COLORS.search(line):
                issues.append(
                    f"CSS: {css_file.name}:{line_num} — Hardcoded Farbe statt CSS Variable"
                )
                score -= 5

    # --- Meta Check (dkz-version) ---
    has_version_meta = False
    for html_file in html_files:
        try:
            content = html_file.read_text(encoding="utf-8", errors="replace")
        except OSError:
            continue
        if DKZ_VERSION_PATTERN.search(content):
            has_version_meta = True
            break

    if html_files and not has_version_meta:
        issues.append("Meta: dkz-version Meta-Tag fehlt")
        score -= 10

    # --- Hub Button Check ---
    has_hub_button = False
    for html_file in html_files:
        try:
            content = html_file.read_text(encoding="utf-8", errors="replace")
        except OSError:
            continue
        if HUB_BUTTON_PATTERN.search(content):
            has_hub_button = True
            break

    if html_files and not has_hub_button:
        issues.append("Hub: Kein Hub-Button oder dkz-navbar gefunden")
        score -= 10

    # --- Console.log Check ---
    for js_file in js_files:
        try:
            content = js_file.read_text(encoding="utf-8", errors="replace")
        except OSError:
            continue
        console_count = len(re.findall(r"\bconsole\.log\b", content))
        if console_count > 0:
            issues.append(f"Cleanup: {js_file.name} — {console_count}x console.log gefunden")
            score -= min(console_count * 2, 10)

    # Score begrenzen
    score = max(score, 0)

    logger.info(
        "Modul-Scan %s: Score %d/100, %d Issues",
        module.name,
        score,
        len(issues),
    )

    return {
        "module": module.name,
        "issues": issues,
        "score": score,
        "files_scanned": len(html_files) + len(js_files) + len(css_files),
    }
