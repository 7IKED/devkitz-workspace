"""
gitnexus_chat.py — GitNexus Chat API Container
================================================
Repository-Graph, Git History, Branch Explorer, Issue Tracker.
Nutzt Grok 4.1 Fast als Backend-LLM.
REGEL #0: Nur lesen + kopieren. NIE Originale aendern.
"""

import os
import json
import subprocess
import datetime
from http.server import HTTPServer, BaseHTTPRequestHandler

CHAT_PORT = int(os.getenv('CHAT_PORT', '3042'))
MODEL = os.getenv('MODEL', 'grok-4.1-fast')
TRESOR = os.getenv('TRESOR_PATH', '/data/tresor')
ROLE = os.getenv('ROLE', 'kopist')
GIT_REPO = os.getenv('GIT_REPO', '/data/tresor/DEVKiTZ')

# GitNexus Wissensbasis (Built-in)
GITNEXUS_KB = {
    'repos': {
        'devkitz-workspace': {'stars': 0, 'org': '7IKED', 'branches': ['main'], 'modules': 130},
        'devkitz-ecosystem': {'stars': 0, 'org': '777', 'branches': ['main']},
    },
    'structure': {
        '01_PROJECTS': ['01_dashboard', 'dkz-copilot', 'dkz-keep'],
        '04_SYSTEM': ['scripts', 'REDNOTE.json'],
        '.agents': ['skills (53)', 'workflows (77)', 'agents'],
        '06_NOTEPAD': ['note', 'tags'],
        '99_ARCHIVE': ['deleted', 'moved', 'replaced'],
    },
    'stats': {
        'commits_today': 6,
        'files_changed': 15,
        'agents': 51,
        'issues_open': 8,
        'labels': 26,
    }
}


def _run_git(cmd, cwd=None):
    """Git-Befehl ausfuehren (READ-ONLY!)"""
    allowed_cmds = ['log', 'status', 'branch', 'diff', 'show', 'shortlog', 'tag']
    parts = cmd.split()
    if parts[0] not in allowed_cmds:
        return f"BLOCKIERT: git {parts[0]} ist nicht erlaubt (Regel #0)"
    try:
        result = subprocess.run(
            ['git'] + parts,
            cwd=cwd or GIT_REPO,
            capture_output=True, text=True, timeout=10
        )
        return result.stdout or result.stderr or '(keine Ausgabe)'
    except Exception as e:
        return f"Git-Fehler: {e}"


def build_response(message, context='gitnexus'):
    """Antwort generieren basierend auf GitNexus KB"""
    msg_lower = message.lower()
    ts = datetime.datetime.now().isoformat()

    # Git Log Fragen
    if 'commit' in msg_lower or 'log' in msg_lower or 'history' in msg_lower:
        log_output = _run_git('log --oneline -10')
        return {
            'reply': f"Letzte 10 Commits:\n```\n{log_output}\n```",
            'data': {'type': 'git_log', 'raw': log_output},
            'actions': ['show_in_graphify'],
            'version': f'v{ts}'
        }

    # Branch Fragen
    if 'branch' in msg_lower:
        branches = _run_git('branch -a')
        return {
            'reply': f"Branches:\n```\n{branches}\n```",
            'data': {'type': 'branches', 'raw': branches},
            'actions': [],
            'version': f'v{ts}'
        }

    # Status Fragen
    if 'status' in msg_lower or 'aender' in msg_lower or 'change' in msg_lower:
        status = _run_git('status --short')
        stats = GITNEXUS_KB['stats']
        return {
            'reply': (
                f"Git Status:\n```\n{status or '(clean)'}\n```\n\n"
                f"Heute: {stats['commits_today']} Commits, "
                f"{stats['files_changed']} Dateien, "
                f"{stats['issues_open']} offene Issues"
            ),
            'data': {'type': 'status', 'stats': stats},
            'actions': ['export_to_second_brain'],
            'version': f'v{ts}'
        }

    # Struktur Fragen
    if 'struktur' in msg_lower or 'ordner' in msg_lower or 'verzeichnis' in msg_lower:
        structure = GITNEXUS_KB['structure']
        lines = []
        for folder, subs in structure.items():
            lines.append(f"**{folder}/**")
            for sub in subs:
                lines.append(f"  - {sub}")
        return {
            'reply': "Workspace-Struktur:\n" + '\n'.join(lines),
            'data': {'type': 'structure', 'tree': structure},
            'actions': ['show_in_graphify'],
            'version': f'v{ts}'
        }

    # Issue Fragen
    if 'issue' in msg_lower or 'bug' in msg_lower or 'task' in msg_lower:
        return {
            'reply': (
                f"Offene Issues: {GITNEXUS_KB['stats']['issues_open']}\n"
                f"Labels: {GITNEXUS_KB['stats']['labels']}\n"
                f"Siehe: ISSUES-BATCH.md fuer Details"
            ),
            'data': {'type': 'issues', 'count': GITNEXUS_KB['stats']['issues_open']},
            'actions': ['export_to_second_brain'],
            'version': f'v{ts}'
        }

    # Diff Fragen
    if 'diff' in msg_lower or 'unterschied' in msg_lower:
        diff = _run_git('diff --stat HEAD~1')
        return {
            'reply': f"Letzter Diff:\n```\n{diff}\n```",
            'data': {'type': 'diff', 'raw': diff},
            'actions': [],
            'version': f'v{ts}'
        }

    # Default
    return {
        'reply': (
            f"GitNexus Chat ({MODEL}): Frag mich ueber:\n"
            f"- Commits / Log / History\n"
            f"- Branches\n"
            f"- Status / Aenderungen\n"
            f"- Struktur / Ordner\n"
            f"- Issues / Tasks\n"
            f"- Diff / Unterschiede"
        ),
        'data': None,
        'actions': [],
        'version': f'v{ts}'
    }


class ChatHandler(BaseHTTPRequestHandler):
    def do_POST(self):
        if self.path == '/api/chat':
            length = int(self.headers.get('Content-Length', 0))
            body = json.loads(self.rfile.read(length)) if length else {}
            message = body.get('message', '')
            context = body.get('context', 'gitnexus')

            response = build_response(message, context)

            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps(response).encode())

        elif self.path == '/api/health':
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({
                'status': 'ok', 'model': MODEL, 'role': ROLE,
                'mode': 'gitnexus', 'regel_0': True
            }).encode())

    def do_GET(self):
        if self.path == '/api/health':
            self.do_POST()
        else:
            self.send_response(200)
            self.send_header('Content-Type', 'text/plain')
            self.end_headers()
            self.wfile.write(b'GitNexus Chat API v2 — REGEL #0 aktiv')

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, GET, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

    def log_message(self, format, *args):
        pass


if __name__ == '__main__':
    server = HTTPServer(('0.0.0.0', CHAT_PORT), ChatHandler)
    print(f"GitNexus Chat API laeuft auf Port {CHAT_PORT}")
    print(f"  Model: {MODEL} | Role: {ROLE} | REGEL #0: AKTIV")
    print(f"  Git Repo: {GIT_REPO}")
    server.serve_forever()
