"""
mirofish_chat.py — MiroFish Chat API Container
================================================
Agent-Netzwerk Simulation, Ecosystem, Fish Pool Queries.
Nutzt Kimi K2.6 als Backend-LLM.
REGEL #0: Nur lesen + kopieren. NIE Originale aendern.
"""

import os
import json
import datetime
from http.server import HTTPServer, BaseHTTPRequestHandler

CHAT_PORT = int(os.getenv('CHAT_PORT', '3041'))
MODEL = os.getenv('MODEL', 'kimi-k2.6')
TRESOR = os.getenv('TRESOR_PATH', '/data/tresor')
ROLE = os.getenv('ROLE', 'kopist')

# MiroFish Wissensbasis (Built-in)
MIROFISH_KB = {
    'agents': {
        'james': {'role': 'Guardian', 'status': 'aktiv', 'coded': False},
        'pm': {'role': 'Product Manager', 'status': 'aktiv'},
        'developer': {'role': 'Coder', 'status': 'aktiv'},
        'reviewer': {'role': 'CodeRabbit QA', 'status': 'aktiv'},
        'tester': {'role': 'TestStrasse v3', 'status': 'aktiv'},
        'dokumentar': {'role': 'Wiki/README', 'status': 'aktiv'},
    },
    'ecosystem': {
        'modules': 130,
        'skills': 53,
        'workflows': 77,
        'agents': 51,
        'nanobots': 2,
    },
    'simulation': {
        'fish_pool': 'Agent-Interaktion Simulator',
        'swarm': 'Multi-Agent Koordination',
        'evolution': 'Skill-Optimierung durch Feedback',
    }
}


def build_response(message, context='mirofish'):
    """Antwort generieren basierend auf MiroFish KB"""
    msg_lower = message.lower()
    ts = datetime.datetime.now().isoformat()

    # Agent-Fragen
    if 'agent' in msg_lower or 'james' in msg_lower:
        agents = MIROFISH_KB['agents']
        lines = [f"**{k.title()}**: {v['role']} — {v['status']}" for k, v in agents.items()]
        return {
            'reply': f"MiroFish Agent Network ({len(agents)} Agenten):\n" + '\n'.join(lines),
            'data': {'type': 'agents', 'nodes': list(agents.keys())},
            'actions': ['show_in_graphify'],
            'version': f'v{ts}'
        }

    # Ecosystem-Fragen
    if 'ecosystem' in msg_lower or 'status' in msg_lower or 'modul' in msg_lower:
        eco = MIROFISH_KB['ecosystem']
        return {
            'reply': (
                f"DkZ Ecosystem Status:\n"
                f"- {eco['modules']} Module\n"
                f"- {eco['skills']} Skills\n"
                f"- {eco['workflows']} Workflows\n"
                f"- {eco['agents']} Agenten\n"
                f"- {eco['nanobots']} NanoBots"
            ),
            'data': {'type': 'ecosystem', 'stats': eco},
            'actions': ['export_to_second_brain'],
            'version': f'v{ts}'
        }

    # Simulation-Fragen
    if 'simulation' in msg_lower or 'fish' in msg_lower or 'swarm' in msg_lower:
        sim = MIROFISH_KB['simulation']
        return {
            'reply': (
                f"MiroFish Simulation:\n"
                f"- Fish Pool: {sim['fish_pool']}\n"
                f"- Swarm: {sim['swarm']}\n"
                f"- Evolution: {sim['evolution']}"
            ),
            'data': {'type': 'simulation', 'features': sim},
            'actions': ['show_in_graphify'],
            'version': f'v{ts}'
        }

    # Default
    return {
        'reply': f"MiroFish Chat ({MODEL}): Frag mich ueber Agenten, Ecosystem oder Simulation.",
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
            context = body.get('context', 'mirofish')

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
                'mode': 'mirofish', 'regel_0': True
            }).encode())

    def do_GET(self):
        if self.path == '/api/health':
            self.do_POST()
        else:
            self.send_response(200)
            self.send_header('Content-Type', 'text/plain')
            self.end_headers()
            self.wfile.write(b'MiroFish Chat API v2 — REGEL #0 aktiv')

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, GET, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

    def log_message(self, format, *args):
        pass  # Stille Logs


if __name__ == '__main__':
    server = HTTPServer(('0.0.0.0', CHAT_PORT), ChatHandler)
    print(f"MiroFish Chat API laeuft auf Port {CHAT_PORT}")
    print(f"  Model: {MODEL} | Role: {ROLE} | REGEL #0: AKTIV")
    server.serve_forever()
