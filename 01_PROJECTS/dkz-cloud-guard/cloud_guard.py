#!/usr/bin/env python3
"""
═══════════════════════════════════════════════════════════════
  🛡️ DkZ Cloud Guard™ — Drive Schutz & Sortierung
  
  Portable EXE für alle Windows-Systeme
  Bringt Ordnung in Google Drive und schützt [DEEPKEEP]
  
  DEVKiTZ™ Ökosystem · Built by 777
═══════════════════════════════════════════════════════════════
"""

import os
import sys
import json
import time
import shutil
import hashlib
import argparse
import webbrowser
from pathlib import Path
from datetime import datetime
from http.server import HTTPServer, SimpleHTTPRequestHandler
import threading

# ═══════════════════════════════════════════════════════════════
#  CONSTANTS
# ═══════════════════════════════════════════════════════════════

VERSION = "1.0.0"
APP_NAME = "DkZ Cloud Guard™"

# DkZ Farben für Terminal
class C:
    RED = "\033[91m"
    GREEN = "\033[92m"
    YELLOW = "\033[93m"
    BLUE = "\033[94m"
    MAGENTA = "\033[95m"
    CYAN = "\033[96m"
    WHITE = "\033[97m"
    BOLD = "\033[1m"
    DIM = "\033[2m"
    RESET = "\033[0m"

# Ordner-Struktur (Jeff Su 5x99 + DEVKiTZ)
FOLDER_STRUCTURE = {
    "00_INBOX":     [],
    "01_PROJECTS":  ["01_active", "02_templates", "03_shared", "99_archived"],
    "02_RESEARCH":  ["01_ai_agents", "02_tutorials", "03_frameworks", "04_blueprints", "05_notebooklm", "99_archived"],
    "03_MEDIA":     ["01_images", "02_video", "03_audio", "04_ai_generated", "99_archived"],
    "04_SYSTEM":    ["01_configs", "02_scripts", "03_exports", "04_backups", "99_archived"],
    "05_INTERN":    [],
    "06_NOTEPAD":   [],
    "07_PRIVAT":    [],
    "99_ARCHIVE":   [],
}

# NIEMALS anfassen!
NEVER_TOUCH = [
    "[DEEPKEEP]",
    "raw",
]

# Behalten in Root (nicht verschieben)
KEEP_IN_ROOT = [
    "00_INBOX", "01_PROJECTS", "02_RESEARCH", "03_MEDIA", "04_SYSTEM",
    "05_INTERN", "06_NOTEPAD", "07_PRIVAT", "09_SYSTEM", "99_ARCHIVE",
    "[DEEPKEEP]", "[HELLO WORLD]", "[WORKSPACE]",
]

# Sortier-Regeln (Name-basiert)
SORT_RULES_NAME = [
    # Projects
    (r"dashboard|panel|hub|app|builder|engine", "01_PROJECTS/01_active"),
    (r"template|vorlage|boilerplate", "01_PROJECTS/02_templates"),
    (r"shared|team|collab", "01_PROJECTS/03_shared"),
    # Research
    (r"blueprint|blaupause|architektur", "02_RESEARCH/04_blueprints"),
    (r"notebooklm|notebook|mind.?map", "02_RESEARCH/05_notebooklm"),
    (r"agent|agenten|agentic|bmad|ralph", "02_RESEARCH/01_ai_agents"),
    (r"tutorial|guide|anleitung|how.?to", "02_RESEARCH/02_tutorials"),
    (r"framework|iceberg|docker|n8n|mcp", "02_RESEARCH/03_frameworks"),
    (r"prompt|skill|workflow|playbook", "02_RESEARCH/01_ai_agents"),
    (r"gemini|gpt|claude|grok|mistral|deepseek", "02_RESEARCH/01_ai_agents"),
    (r"research|analyse|studie|paper", "02_RESEARCH"),
    # Media
    (r"image|bild|foto|photo|screenshot|logo", "03_MEDIA/01_images"),
    (r"video|film|clip|recording", "03_MEDIA/02_video"),
    (r"audio|podcast|mp3|musik|sound", "03_MEDIA/03_audio"),
    (r"generated|sora|dall|flux|midjourney", "03_MEDIA/04_ai_generated"),
    # System
    (r"config|setting|env", "04_SYSTEM/01_configs"),
    (r"script|code|api", "04_SYSTEM/02_scripts"),
    (r"csv|report|export|tabelle", "04_SYSTEM/03_exports"),
    (r"backup|dump", "04_SYSTEM/04_backups"),
]

# Sortier-Regeln (Extension-basiert)
SORT_RULES_EXT = {
    ".pdf": "02_RESEARCH",
    ".md": "02_RESEARCH",
    ".txt": "02_RESEARCH",
    ".doc": "02_RESEARCH",
    ".docx": "02_RESEARCH",
    ".html": "02_RESEARCH",
    ".png": "03_MEDIA/01_images",
    ".jpg": "03_MEDIA/01_images",
    ".jpeg": "03_MEDIA/01_images",
    ".gif": "03_MEDIA/01_images",
    ".svg": "03_MEDIA/01_images",
    ".webp": "03_MEDIA/01_images",
    ".mp4": "03_MEDIA/02_video",
    ".webm": "03_MEDIA/02_video",
    ".avi": "03_MEDIA/02_video",
    ".mov": "03_MEDIA/02_video",
    ".mp3": "03_MEDIA/03_audio",
    ".wav": "03_MEDIA/03_audio",
    ".ogg": "03_MEDIA/03_audio",
    ".json": "04_SYSTEM/01_configs",
    ".yaml": "04_SYSTEM/01_configs",
    ".yml": "04_SYSTEM/01_configs",
    ".js": "04_SYSTEM/02_scripts",
    ".py": "04_SYSTEM/02_scripts",
    ".ps1": "04_SYSTEM/02_scripts",
    ".sh": "04_SYSTEM/02_scripts",
    ".csv": "04_SYSTEM/03_exports",
    ".xlsx": "04_SYSTEM/03_exports",
    ".xls": "04_SYSTEM/03_exports",
    ".zip": "04_SYSTEM/04_backups",
    ".rar": "04_SYSTEM/04_backups",
    ".7z": "04_SYSTEM/04_backups",
    ".tar": "04_SYSTEM/04_backups",
    ".gz": "04_SYSTEM/04_backups",
    ".exe": "04_SYSTEM/02_scripts",
}


# ═══════════════════════════════════════════════════════════════
#  BANNER
# ═══════════════════════════════════════════════════════════════

def banner():
    print(f"""
{C.RED}{C.BOLD}
  ╔══════════════════════════════════════════════╗
  ║  🛡️  DkZ Cloud Guard™  v{VERSION}            ║
  ║  ─────────────────────────────────────────── ║
  ║  Drive Schutz · Sortierung · DEEPKEEP       ║
  ║  DEVKiTZ™ Ökosystem · Built by 777          ║
  ╚══════════════════════════════════════════════╝
{C.RESET}""")


# ═══════════════════════════════════════════════════════════════
#  DRIVE PATH DETECTION
# ═══════════════════════════════════════════════════════════════

def find_drive_path():
    """Findet den Google Drive Ordner auf dem System."""
    candidates = [
        Path("G:/Meine Ablage"),
        Path("G:/My Drive"),
        Path(os.path.expanduser("~/Google Drive")),
        Path(os.path.expanduser("~/Google Drive/My Drive")),
        Path("D:/Google Drive"),
        Path("E:/Google Drive"),
    ]
    for p in candidates:
        if p.exists():
            return p
    return None

def find_local_path():
    """Findet den lokalen DEVKiTZ Ordner."""
    candidates = [
        Path("C:/DEVKiTZ"),
        Path(os.path.expanduser("~/DEVKiTZ")),
        Path("D:/DEVKiTZ"),
    ]
    for p in candidates:
        if p.exists():
            return p
    return None


# ═══════════════════════════════════════════════════════════════
#  DEEPKEEP — Alles sichern
# ═══════════════════════════════════════════════════════════════

def cmd_deepkeep(args):
    """Verschiebt ALLES aus Root in [DEEPKEEP] — sichert den gesamten Bestand."""
    print(f"\n{C.RED}{C.BOLD}🔒 DEEPKEEP MODE — Alles sichern{C.RESET}\n")
    
    drive = find_drive_path()
    local = find_local_path()
    
    source = drive or local
    if not source:
        print(f"{C.RED}❌ Kein Drive/DEVKiTZ Ordner gefunden!{C.RESET}")
        print(f"   Starte Google Drive Desktop oder gib den Pfad an:")
        print(f"   dkz-cloud-guard deepkeep --path /pfad/zum/ordner")
        return
    
    if args.path:
        source = Path(args.path)
    
    print(f"  📂 Quelle: {C.CYAN}{source}{C.RESET}")
    
    deepkeep = source / "[DEEPKEEP]"
    deepkeep.mkdir(exist_ok=True)
    
    # Timestamp-Ordner in DEEPKEEP
    timestamp = datetime.now().strftime("%Y-%m-%d_%H%M")
    backup_dir = deepkeep / f"backup_{timestamp}"
    backup_dir.mkdir(exist_ok=True)
    
    print(f"  💾 Ziel:   {C.GREEN}{backup_dir}{C.RESET}")
    print()
    
    moved_files = 0
    moved_dirs = 0
    skipped = 0
    errors = 0
    
    # Inventar erstellen
    inventory = {
        "timestamp": timestamp,
        "source": str(source),
        "files": [],
        "folders": [],
        "skipped": [],
    }
    
    # Dateien verschieben
    for item in sorted(source.iterdir()):
        name = item.name
        
        # NEVER TOUCH
        if name in NEVER_TOUCH:
            print(f"  {C.YELLOW}🔒 SKIP (NEVER TOUCH): {name}{C.RESET}")
            inventory["skipped"].append({"name": name, "reason": "NEVER_TOUCH"})
            skipped += 1
            continue
        
        # Behalten in Root
        if name in KEEP_IN_ROOT:
            print(f"  {C.DIM}   SKIP (Root-Ordner): {name}{C.RESET}")
            inventory["skipped"].append({"name": name, "reason": "KEEP_IN_ROOT"})
            skipped += 1
            continue
        
        # Versteckte Dateien/Ordner
        if name.startswith("."):
            print(f"  {C.DIM}   SKIP (versteckt): {name}{C.RESET}")
            inventory["skipped"].append({"name": name, "reason": "hidden"})
            skipped += 1
            continue
        
        try:
            target = backup_dir / name
            if item.is_dir():
                shutil.copytree(item, target, dirs_exist_ok=True)
                print(f"  {C.GREEN}📂 {name} → [DEEPKEEP]{C.RESET}")
                inventory["folders"].append({"name": name, "size": sum(f.stat().st_size for f in item.rglob("*") if f.is_file())})
                moved_dirs += 1
            else:
                shutil.copy2(item, target)
                size = item.stat().st_size
                print(f"  {C.GREEN}📄 {name} ({_format_size(size)}) → [DEEPKEEP]{C.RESET}")
                inventory["files"].append({"name": name, "size": size, "ext": item.suffix})
                moved_files += 1
        except Exception as e:
            print(f"  {C.RED}❌ FEHLER: {name} — {e}{C.RESET}")
            errors += 1
    
    # Inventar speichern
    inv_path = backup_dir / "_INVENTAR.json"
    with open(inv_path, "w", encoding="utf-8") as f:
        json.dump(inventory, f, indent=2, ensure_ascii=False)
    
    print(f"\n{C.GREEN}{C.BOLD}{'═'*50}")
    print(f"  ✅ DEEPKEEP FERTIG!")
    print(f"  📄 {moved_files} Dateien gesichert")
    print(f"  📂 {moved_dirs} Ordner gesichert")
    print(f"  ⏭️  {skipped} übersprungen")
    if errors:
        print(f"  {C.RED}❌ {errors} Fehler{C.GREEN}")
    print(f"  📋 Inventar: {inv_path}")
    print(f"{'═'*50}{C.RESET}\n")


# ═══════════════════════════════════════════════════════════════
#  SMART SORT — Aus DEEPKEEP sortieren
# ═══════════════════════════════════════════════════════════════

def cmd_sort(args):
    """Sortiert Dateien aus [DEEPKEEP] oder [HELLO WORLD] in richtige Ordner."""
    import re
    
    print(f"\n{C.CYAN}{C.BOLD}📂 SMART SORT — Intelligent sortieren{C.RESET}\n")
    
    source = find_drive_path() or find_local_path()
    if args.path:
        source = Path(args.path)
    if not source:
        print(f"{C.RED}❌ Kein Ordner gefunden!{C.RESET}")
        return
    
    # Sortier-Quelle: [HELLO WORLD] oder spezifischer Ordner
    sort_from = source / "[HELLO WORLD]"
    if args.source_dir:
        sort_from = source / args.source_dir
    
    if not sort_from.exists():
        print(f"{C.YELLOW}⚠️ Quell-Ordner nicht gefunden: {sort_from}{C.RESET}")
        print(f"   Verwende: dkz-cloud-guard sort --source-dir '[HELLO WORLD]'")
        return
    
    print(f"  📂 Sortiere aus: {C.CYAN}{sort_from}{C.RESET}")
    print(f"  🎯 Ziel-Root:    {C.GREEN}{source}{C.RESET}")
    print(f"  🔒 Dry-Run:      {C.YELLOW}{'JA (--execute zum Ausführen)' if not args.execute else 'NEIN — LIVE!'}{C.RESET}")
    print()
    
    # Ordner-Struktur sicherstellen
    for folder, subs in FOLDER_STRUCTURE.items():
        (source / folder).mkdir(exist_ok=True)
        for sub in subs:
            (source / folder / sub).mkdir(exist_ok=True)
    
    sorted_count = 0
    unsorted = []
    duplicates = []
    
    for item in sorted(sort_from.iterdir()):
        if item.name.startswith(".") or item.name.startswith("_"):
            continue
        
        name = item.name.lower()
        target_folder = None
        
        # 1. Name-basierte Regeln
        for pattern, folder in SORT_RULES_NAME:
            if re.search(pattern, name):
                target_folder = folder
                break
        
        # 2. Extension-basierte Regeln (Fallback)
        if not target_folder and item.is_file():
            ext = item.suffix.lower()
            target_folder = SORT_RULES_EXT.get(ext)
        
        # 3. Ordner-Erkennung
        if not target_folder and item.is_dir():
            if re.search(r"project|app|code|build|dev", name):
                target_folder = "01_PROJECTS/01_active"
            elif re.search(r"research|doc|wiki|note", name):
                target_folder = "02_RESEARCH"
            elif re.search(r"image|photo|media|video", name):
                target_folder = "03_MEDIA"
            elif re.search(r"backup|config|system", name):
                target_folder = "04_SYSTEM"
        
        if target_folder:
            target_path = source / target_folder / item.name
            
            # Duplikat-Check: NICHT löschen, nur markieren!
            if target_path.exists():
                dup_info = f"  {C.YELLOW}⚠️ DUPLIKAT: {item.name} existiert bereits in {target_folder}{C.RESET}"
                print(dup_info)
                duplicates.append({"name": item.name, "target": target_folder})
                continue
            
            action = "→" if args.execute else "→ (dry-run)"
            print(f"  {C.GREEN}✅ {item.name} {action} {target_folder}{C.RESET}")
            
            if args.execute:
                target_dir = source / target_folder
                target_dir.mkdir(parents=True, exist_ok=True)
                if item.is_dir():
                    shutil.move(str(item), str(target_path))
                else:
                    shutil.move(str(item), str(target_path))
            
            sorted_count += 1
        else:
            print(f"  {C.DIM}❓ {item.name} — kein Match (bleibt){C.RESET}")
            unsorted.append(item.name)
    
    print(f"\n{C.CYAN}{C.BOLD}{'═'*50}")
    print(f"  📊 SORTIERUNG {'ABGESCHLOSSEN' if args.execute else 'VORSCHAU (dry-run)'}")
    print(f"  ✅ {sorted_count} sortiert")
    print(f"  ⚠️  {len(duplicates)} Duplikate (NICHT gelöscht!)")
    print(f"  ❓ {len(unsorted)} unsortiert (bleiben)")
    if not args.execute:
        print(f"\n  {C.YELLOW}Zum Ausführen: dkz-cloud-guard sort --execute{C.RESET}")
    print(f"{'═'*50}{C.RESET}\n")


# ═══════════════════════════════════════════════════════════════
#  STATUS — Drive-Übersicht
# ═══════════════════════════════════════════════════════════════

def cmd_status(args):
    """Zeigt den aktuellen Drive/Lokal Status."""
    print(f"\n{C.BLUE}{C.BOLD}📊 DRIVE STATUS{C.RESET}\n")
    
    drive = find_drive_path()
    local = find_local_path()
    
    for label, path in [("☁️  Google Drive", drive), ("💻 Lokal DEVKiTZ", local)]:
        if path and path.exists():
            print(f"  {C.GREEN}✅ {label}: {path}{C.RESET}")
            items = list(path.iterdir())
            dirs = [i for i in items if i.is_dir()]
            files = [i for i in items if i.is_file()]
            print(f"     📂 {len(dirs)} Ordner · 📄 {len(files)} Dateien")
            
            # DEEPKEEP Check
            dk = path / "[DEEPKEEP]"
            if dk.exists():
                dk_files = sum(1 for _ in dk.rglob("*") if _.is_file())
                dk_size = sum(f.stat().st_size for f in dk.rglob("*") if f.is_file())
                print(f"     🔒 [DEEPKEEP]: {dk_files} Dateien ({_format_size(dk_size)})")
            else:
                print(f"     {C.YELLOW}⚠️ [DEEPKEEP] nicht vorhanden{C.RESET}")
            
            # Ordner-Status
            for folder in sorted(FOLDER_STRUCTURE.keys()):
                fp = path / folder
                if fp.exists():
                    count = sum(1 for _ in fp.rglob("*") if _.is_file())
                    print(f"     {'✅' if count > 0 else '📂'} {folder}: {count} Dateien")
                else:
                    print(f"     {C.RED}❌ {folder}: FEHLT{C.RESET}")
        else:
            print(f"  {C.RED}❌ {label}: Nicht gefunden{C.RESET}")
        print()


# ═══════════════════════════════════════════════════════════════
#  HTML → MARKDOWN KONVERTER
# ═══════════════════════════════════════════════════════════════

def cmd_export_md(args):
    """Konvertiert HTML-Dateien zu Markdown."""
    print(f"\n{C.MAGENTA}{C.BOLD}📝 HTML → MARKDOWN Export{C.RESET}\n")
    
    source = find_drive_path() or find_local_path()
    if args.path:
        source = Path(args.path)
    if not source:
        print(f"{C.RED}❌ Kein Ordner gefunden!{C.RESET}")
        return
    
    # Finde alle .html Dateien
    html_files = list(source.rglob("*.html"))
    print(f"  🔍 {len(html_files)} HTML-Dateien gefunden")
    
    converted = 0
    for html_file in html_files:
        # Skip node_modules, .git etc
        if any(skip in str(html_file) for skip in ["node_modules", ".git", "__pycache__"]):
            continue
        
        md_file = html_file.with_suffix(".md")
        if md_file.exists() and not args.overwrite:
            continue
        
        try:
            content = html_file.read_text(encoding="utf-8", errors="ignore")
            md_content = _html_to_md(content)
            
            if args.execute:
                md_file.write_text(md_content, encoding="utf-8")
                print(f"  {C.GREEN}✅ {html_file.name} → {md_file.name}{C.RESET}")
            else:
                print(f"  {C.DIM}📄 {html_file.name} → {md_file.name} (dry-run){C.RESET}")
            
            converted += 1
        except Exception as e:
            print(f"  {C.RED}❌ {html_file.name}: {e}{C.RESET}")
    
    print(f"\n  📊 {converted} Dateien {'konvertiert' if args.execute else 'gefunden (dry-run)'}")


def _html_to_md(html):
    """Einfacher HTML → Markdown Konverter."""
    import re
    text = html
    # Remove scripts and styles
    text = re.sub(r'<script[^>]*>.*?</script>', '', text, flags=re.DOTALL)
    text = re.sub(r'<style[^>]*>.*?</style>', '', text, flags=re.DOTALL)
    # Headers
    for i in range(6, 0, -1):
        text = re.sub(f'<h{i}[^>]*>(.*?)</h{i}>', f'{"#"*i} \\1', text, flags=re.DOTALL)
    # Bold, italic
    text = re.sub(r'<(b|strong)[^>]*>(.*?)</\1>', r'**\2**', text, flags=re.DOTALL)
    text = re.sub(r'<(i|em)[^>]*>(.*?)</\1>', r'*\2*', text, flags=re.DOTALL)
    # Links
    text = re.sub(r'<a[^>]*href="([^"]*)"[^>]*>(.*?)</a>', r'[\2](\1)', text, flags=re.DOTALL)
    # Lists
    text = re.sub(r'<li[^>]*>(.*?)</li>', r'- \1', text, flags=re.DOTALL)
    # Paragraphs
    text = re.sub(r'<p[^>]*>(.*?)</p>', r'\1\n\n', text, flags=re.DOTALL)
    # Line breaks
    text = re.sub(r'<br[^>]*/?\s*>', '\n', text)
    # Remove remaining tags
    text = re.sub(r'<[^>]+>', '', text)
    # Clean up whitespace
    text = re.sub(r'\n{3,}', '\n\n', text)
    text = text.strip()
    return text


# ═══════════════════════════════════════════════════════════════
#  PAPERLESS EXPORT
# ═══════════════════════════════════════════════════════════════

def cmd_paperless(args):
    """Exportiert Dateien für Paperless-ngx Import."""
    print(f"\n{C.GREEN}{C.BOLD}📎 PAPERLESS-NGX Export{C.RESET}\n")
    
    source = find_drive_path() or find_local_path()
    if args.path:
        source = Path(args.path)
    if not source:
        print(f"{C.RED}❌ Kein Ordner gefunden!{C.RESET}")
        return
    
    export_dir = source / "_EXPORT_PAPERLESS"
    export_dir.mkdir(exist_ok=True)
    
    # Paperless consume-Ordner Struktur
    consume = export_dir / "consume"
    consume.mkdir(exist_ok=True)
    
    # Finde alle PDFs, Bilder, Dokumente
    extensions = {".pdf", ".png", ".jpg", ".jpeg", ".tiff", ".doc", ".docx"}
    count = 0
    
    for folder in ["02_RESEARCH", "04_SYSTEM", "00_INBOX"]:
        folder_path = source / folder
        if not folder_path.exists():
            continue
        for f in folder_path.rglob("*"):
            if f.is_file() and f.suffix.lower() in extensions:
                target = consume / f.name
                if not target.exists():
                    if args.execute:
                        shutil.copy2(f, target)
                    count += 1
    
    print(f"  📂 Export-Ordner: {export_dir}")
    print(f"  📄 {count} Dateien {'exportiert' if args.execute else 'gefunden (dry-run)'}")
    print(f"\n  {C.CYAN}Paperless consume Pfad: {consume}{C.RESET}")
    print(f"  Setze PAPERLESS_CONSUMPTION_DIR={consume}")


# ═══════════════════════════════════════════════════════════════
#  ANYTYPE EXPORT
# ═══════════════════════════════════════════════════════════════

def cmd_anytype(args):
    """Exportiert Dateien im Anytype-kompatiblen Format."""
    print(f"\n{C.BLUE}{C.BOLD}🧠 ANYTYPE Export{C.RESET}\n")
    
    source = find_drive_path() or find_local_path()
    if args.path:
        source = Path(args.path)
    if not source:
        print(f"{C.RED}❌ Kein Ordner gefunden!{C.RESET}")
        return
    
    export_dir = source / "_EXPORT_ANYTYPE"
    export_dir.mkdir(exist_ok=True)
    
    # Anytype importiert Markdown-Dateien
    # Erstelle für jede Research-Datei eine Anytype-kompatible .md
    research_path = source / "02_RESEARCH"
    count = 0
    
    if research_path.exists():
        for f in research_path.rglob("*.md"):
            try:
                content = f.read_text(encoding="utf-8", errors="ignore")
                
                # Anytype Frontmatter hinzufügen
                anytype_content = f"""---
title: {f.stem}
type: research
source: DEVKiTZ
date: {datetime.fromtimestamp(f.stat().st_mtime).strftime('%Y-%m-%d')}
tags: [devkitz, research, {f.parent.name}]
---

{content}
"""
                target = export_dir / f.name
                if args.execute:
                    target.write_text(anytype_content, encoding="utf-8")
                count += 1
            except Exception as e:
                print(f"  {C.RED}❌ {f.name}: {e}{C.RESET}")
    
    print(f"  📂 Export-Ordner: {export_dir}")
    print(f"  📄 {count} Markdown-Dateien {'exportiert' if args.execute else 'gefunden (dry-run)'}")
    print(f"\n  {C.CYAN}Import in Anytype: File → Import → Markdown{C.RESET}")


# ═══════════════════════════════════════════════════════════════
#  MD VIEWER — Markdown im Browser anzeigen
# ═══════════════════════════════════════════════════════════════

def cmd_viewer(args):
    """Startet einen lokalen Markdown-Viewer im Browser."""
    print(f"\n{C.MAGENTA}{C.BOLD}👁️ MARKDOWN VIEWER{C.RESET}\n")
    
    source = find_drive_path() or find_local_path()
    if args.path:
        source = Path(args.path)
    
    port = args.port or 8777
    
    # Generiere Index-HTML mit allen .md Dateien
    md_files = list(source.rglob("*.md")) if source else []
    
    # Filter
    md_files = [f for f in md_files if not any(s in str(f) for s in ["node_modules", ".git", "__pycache__"])]
    
    viewer_html = _generate_viewer_html(md_files, source)
    
    viewer_path = Path(os.path.expanduser("~")) / ".dkz-cloud-guard" / "viewer.html"
    viewer_path.parent.mkdir(exist_ok=True)
    viewer_path.write_text(viewer_html, encoding="utf-8")
    
    print(f"  🌐 Viewer: http://localhost:{port}")
    print(f"  📄 {len(md_files)} Markdown-Dateien")
    print(f"  {C.DIM}Ctrl+C zum Beenden{C.RESET}")
    
    webbrowser.open(f"http://localhost:{port}")
    
    os.chdir(viewer_path.parent)
    httpd = HTTPServer(("", port), SimpleHTTPRequestHandler)
    httpd.serve_forever()


def _generate_viewer_html(md_files, root):
    """Generiert eine HTML-Seite die Markdown rendert."""
    file_list = ""
    for f in sorted(md_files)[:200]:
        rel = f.relative_to(root) if root else f
        file_list += f'<div class="file" onclick="loadFile(this)" data-path="{f}">{rel}</div>\n'
    
    return f"""<!DOCTYPE html>
<html lang="de">
<head>
<meta charset="UTF-8"><title>DkZ MD Viewer</title>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&family=JetBrains+Mono&display=swap" rel="stylesheet">
<style>
:root{{--accent:#fa1e4e;--bg:#060608;--text:#e8e8ec;--muted:#71717a;--border:rgba(255,255,255,.06)}}
*{{margin:0;padding:0;box-sizing:border-box}}
body{{font-family:'Inter',sans-serif;background:var(--bg);color:var(--text);display:flex;height:100vh}}
.sidebar{{width:300px;border-right:1px solid var(--border);overflow-y:auto;padding:12px}}
.sidebar h2{{font-size:14px;padding:8px;color:var(--accent)}}
.file{{padding:6px 8px;font-size:11px;cursor:pointer;border-radius:6px;color:var(--muted);word-break:break-all}}
.file:hover{{background:rgba(250,30,78,.08);color:var(--text)}}
.content{{flex:1;padding:24px;overflow-y:auto}}
.content h1,.content h2,.content h3{{color:var(--accent);margin:16px 0 8px}}
.content p{{margin:8px 0;line-height:1.7}}
.content code{{background:rgba(255,255,255,.05);padding:2px 6px;border-radius:4px;font-family:'JetBrains Mono'}}
.content pre{{background:#0a0a0f;padding:12px;border-radius:8px;overflow-x:auto;font-family:'JetBrains Mono';font-size:12px}}
</style>
</head>
<body>
<div class="sidebar"><h2>🛡️ DkZ MD Viewer</h2>{file_list}</div>
<div class="content" id="content"><p style="color:var(--muted)">Wähle eine Datei aus der Sidebar</p></div>
<script>
async function loadFile(el){{
  const path=el.dataset.path;
  try{{const r=await fetch('file://'+path);const t=await r.text();document.getElementById('content').innerHTML=marked(t)}}
  catch(e){{document.getElementById('content').innerHTML='<p>Fehler: '+e.message+'</p>'}}
}}
</script>
</body></html>"""


# ═══════════════════════════════════════════════════════════════
#  HELPERS
# ═══════════════════════════════════════════════════════════════

def _format_size(bytes):
    if bytes == 0: return "—"
    if bytes < 1024: return f"{bytes} B"
    if bytes < 1048576: return f"{bytes/1024:.1f} KB"
    if bytes < 1073741824: return f"{bytes/1048576:.1f} MB"
    return f"{bytes/1073741824:.1f} GB"


# ═══════════════════════════════════════════════════════════════
#  MAIN — CLI Parser
# ═══════════════════════════════════════════════════════════════

def main():
    banner()
    
    parser = argparse.ArgumentParser(
        prog="dkz-cloud-guard",
        description="🛡️ DkZ Cloud Guard™ — Drive Schutz & Sortierung"
    )
    parser.add_argument("--version", action="version", version=f"%(prog)s {VERSION}")
    
    subparsers = parser.add_subparsers(dest="command", help="Verfügbare Befehle")
    
    # deepkeep
    p_dk = subparsers.add_parser("deepkeep", help="🔒 Alles → [DEEPKEEP] sichern")
    p_dk.add_argument("--path", help="Pfad zum Drive/DEVKiTZ Ordner")
    p_dk.set_defaults(func=cmd_deepkeep)
    
    # sort
    p_sort = subparsers.add_parser("sort", help="📂 Smart Sort aus [HELLO WORLD]")
    p_sort.add_argument("--path", help="Pfad zum Drive/DEVKiTZ Ordner")
    p_sort.add_argument("--source-dir", default="[HELLO WORLD]", help="Quell-Ordner")
    p_sort.add_argument("--execute", action="store_true", help="Tatsächlich verschieben (sonst dry-run)")
    p_sort.set_defaults(func=cmd_sort)
    
    # status
    p_status = subparsers.add_parser("status", help="📊 Drive Status anzeigen")
    p_status.add_argument("--path", help="Pfad")
    p_status.set_defaults(func=cmd_status)
    
    # export-md
    p_md = subparsers.add_parser("export-md", help="📝 HTML → Markdown konvertieren")
    p_md.add_argument("--path", help="Pfad")
    p_md.add_argument("--execute", action="store_true", help="Tatsächlich konvertieren")
    p_md.add_argument("--overwrite", action="store_true", help="Bestehende .md überschreiben")
    p_md.set_defaults(func=cmd_export_md)
    
    # paperless
    p_pl = subparsers.add_parser("paperless", help="📎 Paperless-ngx Export")
    p_pl.add_argument("--path", help="Pfad")
    p_pl.add_argument("--execute", action="store_true", help="Tatsächlich exportieren")
    p_pl.set_defaults(func=cmd_paperless)
    
    # anytype
    p_at = subparsers.add_parser("anytype", help="🧠 Anytype Export")
    p_at.add_argument("--path", help="Pfad")
    p_at.add_argument("--execute", action="store_true", help="Tatsächlich exportieren")
    p_at.set_defaults(func=cmd_anytype)
    
    # viewer
    p_view = subparsers.add_parser("viewer", help="👁️ Markdown Viewer starten")
    p_view.add_argument("--path", help="Pfad")
    p_view.add_argument("--port", type=int, default=8777, help="Port (default: 8777)")
    p_view.set_defaults(func=cmd_viewer)
    
    args = parser.parse_args()
    
    if not args.command:
        parser.print_help()
        print(f"\n{C.YELLOW}Beispiele:{C.RESET}")
        print(f"  dkz-cloud-guard status")
        print(f"  dkz-cloud-guard deepkeep")
        print(f"  dkz-cloud-guard sort --execute")
        print(f"  dkz-cloud-guard export-md --execute")
        print(f"  dkz-cloud-guard viewer")
        return
    
    args.func(args)


if __name__ == "__main__":
    main()
