#!/usr/bin/env python3
"""
DEEPKEEP Blog Auto-Publisher — Research mit Quellen auf Blogger releasen

Scannt Research-Ordner nach Markdown-Dateien mit Quellenangaben.
Dateien MIT Quellen werden automatisch als Blog-Post auf dem
DEEPKEEP Blogger-Blog veroeffentlicht.

Quellen-Erkennung:
  - URLs (https://...)
  - Markdown-Links [text](url)
  - Referenz-Listen [1], [2], ...
  - "Quelle:", "Source:", "Referenz:", "Reference:" Labels
  - Fussnotenformat (^1, ^2)
  - DOI-Nummern (10.xxxx/...)

Usage:
    python blog-publisher.py --scan                # Research scannen
    python blog-publisher.py --publish             # Alles publishen (Dry-Run)
    python blog-publisher.py --publish --execute   # Wirklich publishen
    python blog-publisher.py --status              # Blog-Status pruefen

@DKZ:TAG → [SYS:deepkeep] [CAT:scripts] [LANG:py]
@version v1.00.0_01
"""
import os
import re
import sys
import json
import time
import logging
import argparse
import hashlib
from datetime import datetime
from pathlib import Path
from urllib.request import Request, urlopen
from urllib.error import URLError, HTTPError

# ═══════════════════════════════════════════════════════
# Konfiguration
# ═══════════════════════════════════════════════════════
SCRIPT_DIR = Path(__file__).parent
CONFIG_PATH = SCRIPT_DIR / 'blog-publisher-config.json'
PUBLISHED_DB = SCRIPT_DIR / 'blog-published.json'

DEFAULT_CONFIG = {
    "blogger_blog_id": "",
    "blogger_api_key": "",
    "apps_script_url": "",
    "research_folders": [
        "C:\\DEVKiTZ\\02_RESEARCH",
        "C:\\DEVKiTZ\\06_RESEARCH"
    ],
    "min_sources": 1,
    "min_content_length": 200,
    "blog_name": "DEEPKEEP Research",
    "default_labels": ["DEVKiTZ", "Research", "Auto-Published"],
    "max_title_length": 100,
    "publish_status": "DRAFT"
}

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] %(message)s',
    datefmt='%H:%M:%S'
)
log = logging.getLogger('blog-publisher')


def load_config():
    """Lade Blog-Publisher Konfiguration."""
    try:
        with open(CONFIG_PATH, 'r', encoding='utf-8') as f:
            cfg = json.load(f)
        # Merge mit Defaults
        for k, v in DEFAULT_CONFIG.items():
            if k not in cfg:
                cfg[k] = v
        return cfg
    except FileNotFoundError:
        # Config erstellen mit Defaults
        save_config(DEFAULT_CONFIG)
        return DEFAULT_CONFIG.copy()
    except json.JSONDecodeError:
        return DEFAULT_CONFIG.copy()


def save_config(cfg):
    """Speichere Konfiguration."""
    try:
        with open(CONFIG_PATH, 'w', encoding='utf-8') as f:
            json.dump(cfg, f, indent=2, ensure_ascii=False)
    except OSError as e:
        log.warning(f'Config-Speichern fehlgeschlagen: {e}')


def load_published_db():
    """Lade Datenbank bereits publishter Dateien."""
    try:
        with open(PUBLISHED_DB, 'r', encoding='utf-8') as f:
            return json.load(f)
    except (FileNotFoundError, json.JSONDecodeError):
        return {"published": [], "total": 0}


def save_published_db(db):
    """Speichere Published-Datenbank."""
    try:
        with open(PUBLISHED_DB, 'w', encoding='utf-8') as f:
            json.dump(db, f, indent=2, ensure_ascii=False)
    except OSError as e:
        log.warning(f'DB-Speichern fehlgeschlagen: {e}')


CONFIG = load_config()


# ═══════════════════════════════════════════════════════
# Quellen-Erkennung
# ═══════════════════════════════════════════════════════

# Patterns fuer Quellenangaben
SOURCE_PATTERNS = [
    # URLs
    (r'https?://[^\s\)>\]]+', 'URL'),
    # Markdown Links
    (r'\[([^\]]+)\]\(https?://[^\)]+\)', 'Markdown-Link'),
    # Referenz-Nummern [1], [2] etc.
    (r'\[\d+\]', 'Referenz-Nummer'),
    # Quellen-Labels
    (r'(?:Quelle|Source|Referenz|Reference|Literatur|Bibliography)\s*:', 'Quellen-Label'),
    # Fussnoten ^1, ^2
    (r'\[\^?\d+\]', 'Fussnote'),
    # DOI
    (r'10\.\d{4,}/[^\s]+', 'DOI'),
    # arXiv
    (r'arXiv:\d{4}\.\d+', 'arXiv'),
    # GitHub Repos
    (r'github\.com/[a-zA-Z0-9_-]+/[a-zA-Z0-9_-]+', 'GitHub'),
]


def detect_sources(content):
    """Erkenne Quellenangaben im Markdown-Content."""
    sources = []
    seen = set()

    for pattern, source_type in SOURCE_PATTERNS:
        matches = re.findall(pattern, content, re.IGNORECASE)
        for match in matches:
            text = match if isinstance(match, str) else match[0]
            key = f'{source_type}:{text[:100]}'
            if key not in seen:
                seen.add(key)
                sources.append({
                    'type': source_type,
                    'value': text[:200],
                    'pattern': pattern
                })

    return sources


def has_enough_sources(content, min_sources=1):
    """Hat der Content genug Quellenangaben?"""
    sources = detect_sources(content)
    return len(sources) >= min_sources, sources


# ═══════════════════════════════════════════════════════
# Markdown → HTML Konvertierung (minimal, ohne Dependencies)
# ═══════════════════════════════════════════════════════

def md_to_html(md):
    """Einfache Markdown → HTML Konvertierung (Python stdlib)."""
    html = md

    # Code-Bloecke (vor allem anderen!)
    html = re.sub(r'```(\w*)\n(.*?)```', _code_block, html, flags=re.DOTALL)
    html = re.sub(r'`([^`]+)`', r'<code>\1</code>', html)

    # Headers
    html = re.sub(r'^#{4}\s+(.+)$', r'<h4>\1</h4>', html, flags=re.MULTILINE)
    html = re.sub(r'^#{3}\s+(.+)$', r'<h3>\1</h3>', html, flags=re.MULTILINE)
    html = re.sub(r'^#{2}\s+(.+)$', r'<h2>\1</h2>', html, flags=re.MULTILINE)
    html = re.sub(r'^#{1}\s+(.+)$', r'<h1>\1</h1>', html, flags=re.MULTILINE)

    # Bold + Italic
    html = re.sub(r'\*\*\*(.+?)\*\*\*', r'<strong><em>\1</em></strong>', html)
    html = re.sub(r'\*\*(.+?)\*\*', r'<strong>\1</strong>', html)
    html = re.sub(r'\*(.+?)\*', r'<em>\1</em>', html)

    # Links
    html = re.sub(r'\[([^\]]+)\]\(([^\)]+)\)', r'<a href="\2" target="_blank">\1</a>', html)

    # Images
    html = re.sub(r'!\[([^\]]*)\]\(([^\)]+)\)', r'<img src="\2" alt="\1" style="max-width:100%">', html)

    # Lists
    html = re.sub(r'^[-*]\s+(.+)$', r'<li>\1</li>', html, flags=re.MULTILINE)
    html = re.sub(r'(<li>.*</li>\n?)+', _wrap_list, html)

    # Numbered Lists
    html = re.sub(r'^\d+\.\s+(.+)$', r'<li>\1</li>', html, flags=re.MULTILINE)

    # Blockquotes
    html = re.sub(r'^>\s+(.+)$', r'<blockquote>\1</blockquote>', html, flags=re.MULTILINE)

    # Horizontal Rules
    html = re.sub(r'^---+$', '<hr>', html, flags=re.MULTILINE)

    # Paragraphs (doppelte Newlines)
    html = re.sub(r'\n\n+', '</p>\n<p>', html)
    html = '<p>' + html + '</p>'

    # Cleanup
    html = html.replace('<p><h', '<h').replace('</h1></p>', '</h1>')
    html = html.replace('</h2></p>', '</h2>').replace('</h3></p>', '</h3>')
    html = html.replace('</h4></p>', '</h4>')
    html = html.replace('<p><hr></p>', '<hr>')
    html = html.replace('<p><ul>', '<ul>').replace('</ul></p>', '</ul>')
    html = html.replace('<p><blockquote>', '<blockquote>')
    html = html.replace('</blockquote></p>', '</blockquote>')
    html = html.replace('<p></p>', '')

    return html.strip()


def _code_block(match):
    lang = match.group(1) or ''
    code = match.group(2).strip()
    code = code.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;')
    cls = f' class="language-{lang}"' if lang else ''
    return f'<pre><code{cls}>{code}</code></pre>'


def _wrap_list(match):
    return '<ul>\n' + match.group(0) + '</ul>\n'


# ═══════════════════════════════════════════════════════
# Blog-Post Metadaten extrahieren
# ═══════════════════════════════════════════════════════

def extract_metadata(filepath, content):
    """Extrahiere Titel, Labels, Zusammenfassung aus Markdown."""
    lines = content.strip().split('\n')

    # Titel: Erster # Header oder Dateiname
    title = Path(filepath).stem.replace('-', ' ').replace('_', ' ').title()
    for line in lines[:10]:
        m = re.match(r'^#\s+(.+)$', line.strip())
        if m:
            title = m.group(1).strip()
            break

    # Titel kuerzen
    max_len = CONFIG.get('max_title_length', 100)
    if len(title) > max_len:
        title = title[:max_len-3] + '...'

    # Labels aus Frontmatter oder Ordner
    labels = list(CONFIG.get('default_labels', ['DEVKiTZ', 'Research']))
    parent_dir = Path(filepath).parent.name
    if parent_dir and parent_dir not in labels:
        labels.append(parent_dir)

    # YAML Frontmatter tags
    fm_match = re.match(r'^---\s*\n(.+?)\n---', content, re.DOTALL)
    if fm_match:
        fm = fm_match.group(1)
        tag_match = re.search(r'tags:\s*\[([^\]]+)\]', fm)
        if tag_match:
            for tag in tag_match.group(1).split(','):
                tag = tag.strip().strip('"\'')
                if tag and tag not in labels:
                    labels.append(tag)

    # Zusammenfassung: Erste 2-3 Saetze (ohne Header)
    summary_lines = []
    for line in lines:
        if line.strip() and not line.startswith('#') and not line.startswith('---'):
            summary_lines.append(line.strip())
            if len(' '.join(summary_lines)) > 200:
                break

    summary = ' '.join(summary_lines)[:300]

    return {
        'title': title,
        'labels': labels,
        'summary': summary,
        'filepath': str(filepath),
        'filename': Path(filepath).name
    }


# ═══════════════════════════════════════════════════════
# DkZ Blog Post HTML Template
# ═══════════════════════════════════════════════════════

def create_blog_html(content_html, metadata, sources):
    """Erstelle Blog-Post HTML im DkZ Design."""
    source_count = len(sources)
    source_html = ''
    if sources:
        source_items = []
        for s in sources[:20]:  # Max 20 Quellen anzeigen
            val = s['value']
            if s['type'] in ('URL', 'GitHub'):
                source_items.append(f'<li><a href="{val}" target="_blank">{val[:80]}</a> [{s["type"]}]</li>')
            elif s['type'] == 'DOI':
                source_items.append(f'<li><a href="https://doi.org/{val}" target="_blank">{val}</a> [DOI]</li>')
            elif s['type'] == 'arXiv':
                arxiv_id = val.replace('arXiv:', '')
                source_items.append(f'<li><a href="https://arxiv.org/abs/{arxiv_id}" target="_blank">{val}</a> [arXiv]</li>')
            else:
                source_items.append(f'<li>{val} [{s["type"]}]</li>')

        source_html = f'''
<div style="margin-top:2rem;padding:1.5rem;background:#0a0a0f;border:1px solid rgba(250,30,78,0.2);border-radius:12px">
<h3 style="color:#fa1e4e;margin:0 0 1rem 0;font-size:1rem">📚 Quellen ({source_count})</h3>
<ol style="margin:0;padding-left:1.5rem;color:#a1a1aa;font-size:0.85rem;line-height:1.8">
{"".join(source_items)}
</ol>
</div>'''

    footer_html = f'''
<hr style="border:none;border-top:1px solid rgba(255,255,255,0.05);margin:2rem 0">
<div style="text-align:center;color:#52525b;font-size:0.7rem;line-height:1.6">
<p>Auto-Published by <strong style="color:#fa1e4e">DEEPKEEP™</strong> Research Publisher</p>
<p>DEVKiTZ™ Ecosystem · {datetime.now().strftime("%d.%m.%Y %H:%M")} · {source_count} Quellen</p>
<p>Originaldatei: <code>{metadata["filename"]}</code></p>
</div>'''

    return f'''<div style="font-family:'Inter',system-ui,sans-serif;color:#e4e4e7;line-height:1.8;max-width:800px;margin:0 auto">
{content_html}
{source_html}
{footer_html}
</div>'''


# ═══════════════════════════════════════════════════════
# Blogger API / Apps Script Publishing
# ═══════════════════════════════════════════════════════

def publish_to_blogger(title, html_content, labels, dry_run=True):
    """Post auf Blogger veroeffentlichen."""
    if dry_run:
        log.info(f'  [DRY-RUN] PUBLISH: "{title}" ({len(html_content)} chars, Labels: {labels})')
        return {'ok': True, 'dry_run': True, 'title': title}

    # Methode 1: Apps Script URL (bevorzugt)
    apps_url = CONFIG.get('apps_script_url', '')
    if apps_url:
        try:
            payload = json.dumps({
                'action': 'blog-publish',
                'title': title,
                'content': html_content,
                'labels': labels,
                'blog': 'deepkeep',
                'status': CONFIG.get('publish_status', 'DRAFT')
            }).encode('utf-8')

            req = Request(apps_url, data=payload,
                         headers={'Content-Type': 'application/json'})
            resp = urlopen(req, timeout=15)
            result = json.loads(resp.read().decode('utf-8'))
            return {'ok': True, 'method': 'apps_script', 'result': result}
        except Exception as e:
            log.warning(f'  Apps Script Fehler: {e}')

    # Methode 2: Blogger REST API v3
    blog_id = CONFIG.get('blogger_blog_id', '')
    api_key = CONFIG.get('blogger_api_key', '')
    if blog_id and api_key:
        try:
            url = f'https://www.googleapis.com/blogger/v3/blogs/{blog_id}/posts'
            payload = json.dumps({
                'kind': 'blogger#post',
                'title': title,
                'content': html_content,
                'labels': labels
            }).encode('utf-8')

            req = Request(f'{url}?key={api_key}&isDraft=true',
                         data=payload,
                         headers={'Content-Type': 'application/json'})
            resp = urlopen(req, timeout=15)
            result = json.loads(resp.read().decode('utf-8'))
            return {'ok': True, 'method': 'blogger_api', 'post_id': result.get('id'), 'url': result.get('url')}
        except Exception as e:
            log.warning(f'  Blogger API Fehler: {e}')

    # Methode 3: Lokales HTML speichern (Fallback)
    fallback_dir = Path(CONFIG.get('research_folders', ['C:\\DEVKiTZ\\02_RESEARCH'])[0]) / '_blog_drafts'
    fallback_dir.mkdir(parents=True, exist_ok=True)
    safe_title = re.sub(r'[^a-zA-Z0-9-_]', '-', title.lower())[:60]
    filename = f'{datetime.now().strftime("%Y-%m-%d")}_{safe_title}.html'
    filepath = fallback_dir / filename

    full_html = f'''<!DOCTYPE html>
<html lang="de">
<head>
<meta charset="UTF-8">
<title>{title}</title>
<style>body{{background:#060608;color:#e4e4e7;font-family:Inter,sans-serif;padding:2rem;max-width:800px;margin:0 auto}}a{{color:#fa1e4e}}code{{background:rgba(250,30,78,0.1);padding:2px 6px;border-radius:4px}}pre{{background:#0a0a0f;padding:1rem;border-radius:8px;overflow-x:auto}}h1,h2,h3{{color:#f0f0f2}}blockquote{{border-left:3px solid #fa1e4e;padding-left:1rem;color:#a1a1aa}}</style>
</head>
<body>
<div style="margin-bottom:1rem;font-size:0.75rem;color:#52525b">Labels: {", ".join(labels)}</div>
{html_content}
</body>
</html>'''

    try:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(full_html)
        log.info(f'  Lokal gespeichert: {filepath}')
        return {'ok': True, 'method': 'local_fallback', 'path': str(filepath)}
    except OSError as e:
        return {'ok': False, 'error': str(e)}


# ═══════════════════════════════════════════════════════
# Scan + Publish Pipeline
# ═══════════════════════════════════════════════════════

def scan_research():
    """Scanne Research-Ordner nach publishbaren Dateien."""
    min_sources = CONFIG.get('min_sources', 1)
    min_length = CONFIG.get('min_content_length', 200)
    research_folders = CONFIG.get('research_folders', [])

    publishable = []
    total_files = 0
    skipped_no_sources = 0
    skipped_too_short = 0

    print(f'\n{"=" * 60}')
    print(f'  DEEPKEEP Blog Publisher — Research Scan')
    print(f'{"=" * 60}')

    db = load_published_db()
    published_hashes = {p.get('hash') for p in db.get('published', [])}

    for folder in research_folders:
        folder_path = Path(folder)
        if not folder_path.exists():
            log.info(f'  ⚠️ Ordner nicht gefunden: {folder}')
            continue

        print(f'\n  📂 Scanne: {folder_path.name}/')

        for md_file in folder_path.rglob('*.md'):
            # Skip: _status.json Sidecar-Ordner, versteckte Dateien
            if md_file.name.startswith('.') or md_file.name.startswith('_'):
                continue

            total_files += 1

            try:
                content = md_file.read_text(encoding='utf-8')
            except (OSError, UnicodeDecodeError):
                continue

            # Zu kurz?
            if len(content) < min_length:
                skipped_too_short += 1
                continue

            # Quellen pruefen
            has_sources, sources = has_enough_sources(content, min_sources)
            if not has_sources:
                skipped_no_sources += 1
                continue

            # Bereits publisht? (Hash-Check)
            content_hash = hashlib.sha256(content.encode('utf-8')).hexdigest()[:12]
            if content_hash in published_hashes:
                continue

            metadata = extract_metadata(str(md_file), content)
            metadata['hash'] = content_hash
            metadata['source_count'] = len(sources)
            metadata['sources'] = sources

            publishable.append(metadata)
            print(f'    ✅ {md_file.name} — {len(sources)} Quellen')

    print(f'\n  📊 Ergebnis:')
    print(f'     Gesamt:           {total_files} .md Dateien')
    print(f'     Publishbar:       {len(publishable)}')
    print(f'     Ohne Quellen:     {skipped_no_sources}')
    print(f'     Zu kurz (<{min_length}):  {skipped_too_short}')
    print(f'     Bereits publisht: {len(published_hashes)}')

    return publishable


def publish_all(dry_run=True):
    """Publishe alle Research-Dateien mit Quellen."""
    publishable = scan_research()

    if not publishable:
        print(f'\n  ℹ️ Keine neuen Dateien zum Publishen')
        return []

    print(f'\n{"=" * 60}')
    print(f'  Publishing {len(publishable)} Dateien...')
    print(f'  Modus: {"DRY-RUN" if dry_run else "EXECUTE"}')
    print(f'{"=" * 60}')

    db = load_published_db()
    results = []

    for meta in publishable:
        filepath = meta['filepath']
        print(f'\n  📝 {meta["title"]}')
        print(f'     Datei: {meta["filename"]}')
        print(f'     Quellen: {meta["source_count"]}')
        print(f'     Labels: {", ".join(meta["labels"])}')

        try:
            content = Path(filepath).read_text(encoding='utf-8')
        except (OSError, UnicodeDecodeError) as e:
            log.warning(f'  Lese-Fehler: {e}')
            continue

        # Konvertieren
        html_content = md_to_html(content)
        blog_html = create_blog_html(html_content, meta, meta['sources'])

        # Publishen
        result = publish_to_blogger(meta['title'], blog_html, meta['labels'], dry_run)
        result['metadata'] = meta
        results.append(result)

        if result.get('ok') and not dry_run:
            # In Published-DB eintragen
            db['published'].append({
                'hash': meta['hash'],
                'title': meta['title'],
                'filepath': filepath,
                'published_at': datetime.now().isoformat(),
                'source_count': meta['source_count'],
                'method': result.get('method', 'unknown')
            })
            db['total'] = len(db['published'])
            save_published_db(db)

    print(f'\n{"=" * 60}')
    ok_count = sum(1 for r in results if r.get('ok'))
    print(f'  Ergebnis: {ok_count}/{len(results)} erfolgreich')
    if dry_run:
        print(f'  ℹ️ DRY-RUN — nutze --execute zum wirklichen Publishen')
    print(f'{"=" * 60}\n')

    return results


def show_status():
    """Zeige Blog-Publisher Status."""
    db = load_published_db()

    print(f'\n{"=" * 60}')
    print(f'  DEEPKEEP Blog Publisher — Status')
    print(f'{"=" * 60}')
    print(f'\n  📊 Published: {db.get("total", 0)} Posts')

    api_configured = bool(CONFIG.get('blogger_blog_id') or CONFIG.get('apps_script_url'))
    print(f'  🔑 API: {"✅ Konfiguriert" if api_configured else "❌ Nicht konfiguriert (lokaler Fallback)"}')
    print(f'  📂 Research-Ordner: {len(CONFIG.get("research_folders", []))}')
    print(f'  📋 Min. Quellen: {CONFIG.get("min_sources", 1)}')
    print(f'  📏 Min. Laenge: {CONFIG.get("min_content_length", 200)} Zeichen')
    print(f'  📌 Status: {CONFIG.get("publish_status", "DRAFT")}')

    if db.get('published'):
        print(f'\n  Letzte 5 Posts:')
        for p in db['published'][-5:]:
            print(f'    • {p["title"][:50]} ({p.get("published_at", "?")[:10]}, {p.get("source_count", 0)} Quellen)')

    if not api_configured:
        print(f'\n  ⚠️ Blogger API nicht konfiguriert.')
        print(f'     Konfiguriere in: {CONFIG_PATH}')
        print(f'     Optionen:')
        print(f'       - "apps_script_url": Google Apps Script Webhook')
        print(f'       - "blogger_blog_id" + "blogger_api_key": Direkte API')
        print(f'     Fallback: Lokale HTML-Dateien in _blog_drafts/')

    print()


# ═══════════════════════════════════════════════════════
# CLI
# ═══════════════════════════════════════════════════════

def main():
    parser = argparse.ArgumentParser(
        description='DEEPKEEP Blog Auto-Publisher v1.0',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog='''
Beispiele:
  python blog-publisher.py --scan              # Publishbare Dateien finden
  python blog-publisher.py --publish           # Dry-Run
  python blog-publisher.py --publish --execute # Wirklich publishen
  python blog-publisher.py --status            # Status anzeigen
'''
    )
    parser.add_argument('--scan', action='store_true', help='Research scannen')
    parser.add_argument('--publish', action='store_true', help='Publishen (Dry-Run)')
    parser.add_argument('--status', action='store_true', help='Blog-Status anzeigen')
    parser.add_argument('--execute', action='store_true', help='Wirklich ausfuehren')
    parser.add_argument('--json', action='store_true', help='JSON Output')

    args = parser.parse_args()

    print('=' * 60)
    print('  DEEPKEEP Blog Auto-Publisher v1.0')
    print(f'  Modus: {"EXECUTE" if args.execute else "DRY-RUN"}')
    print('=' * 60)

    if args.status:
        show_status()
    elif args.publish:
        results = publish_all(dry_run=not args.execute)
        if args.json:
            safe_results = []
            for r in results:
                sr = {k: v for k, v in r.items() if k != 'metadata'}
                if 'metadata' in r:
                    sr['title'] = r['metadata'].get('title', '')
                    sr['source_count'] = r['metadata'].get('source_count', 0)
                safe_results.append(sr)
            print(json.dumps(safe_results, indent=2, ensure_ascii=False))
    elif args.scan:
        publishable = scan_research()
        if args.json:
            safe_pub = []
            for p in publishable:
                sp = {k: v for k, v in p.items() if k != 'sources'}
                sp['source_count'] = len(p.get('sources', []))
                safe_pub.append(sp)
            print(json.dumps(safe_pub, indent=2, ensure_ascii=False))
    else:
        # Default: Status + Scan
        show_status()
        scan_research()


if __name__ == '__main__':
    main()
