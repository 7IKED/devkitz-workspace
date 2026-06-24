"""
Nemotron API Gateway — REST-API auf Port 3060
Empfaengt Tasks vom Dashboard/n8n und leitet sie an den SwarmRouter.
"""

import json
import sys
import os
import threading
import time
import urllib.request

from config import API_HOST, API_PORT, SWARM_VERSION, VECTOR_STORE_PATH, DASHBOARD_HUB_URL

try:
    from http.server import HTTPServer, BaseHTTPRequestHandler
except ImportError:
    print("Fehler: Python http.server nicht verfuegbar")
    sys.exit(1)

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))
from memory.memory_manager import MemoryManager
from memory.vector_store.vector_store import VectorStore
from orchestrator.iceberg_client import get_client as get_iceberg
from orchestrator.deepkeep import get_deepkeep

class SwarmGatewayHandler(BaseHTTPRequestHandler):
    """HTTP-Handler fuer das API Gateway (Port 3060)."""

    mem = MemoryManager()
    vec = VectorStore(VECTOR_STORE_PATH)

    def log_message(self, format, *args):
        sys.stderr.write(f"[API:3060] {args[0]} {args[1]} {args[2]}\n")

    def _send_json(self, status: int, data: dict):
        body = json.dumps(data).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def do_OPTIONS(self):
        self.send_response(204)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()

    def do_GET(self):
        path = self.path.rstrip("/")

        if path == "/healthz" or path == "/":
            return self._send_json(200, {
                "service": "nemotron-swarm",
                "status": "alive",
                "version": SWARM_VERSION,
            })

        if path == "/api/v1/swarm/status":
            stats = self.mem.get_stats()
            agents = self.mem.list_agents()
            return self._send_json(200, {
                "stats": stats,
                "agents": agents,
                "tasks": self.mem.list_tasks(),
            })

        if path == "/api/v1/swarm/history":
            return self._send_json(200, {
                "history": self.mem.get_recent_history(limit=50),
            })

        if path.startswith("/api/v1/swarm/task/"):
            task_id = path.split("/")[-1]
            task = self.mem.get_task(task_id)
            if task:
                return self._send_json(200, task)
            return self._send_json(404, {"error": "Task not found"})

        if path == "/api/v1/swarm/vector/collections":
            return self._send_json(200, {
                "collections": self.vec.list_collections(),
            })

        if path.startswith("/api/v1/swarm/vector/size/"):
            collection = path.split("/")[-1]
            return self._send_json(200, {
                "collection": collection,
                "size": self.vec.collection_size(collection),
            })

        if path == "/api/v1/swarm/iceberg/tables":
            try:
                tables = get_iceberg().list_tables()
                return self._send_json(200, {"tables": tables})
            except RuntimeError as e:
                return self._send_json(503, {"error": str(e)})

        if path == "/api/v1/swarm/iceberg/schema":
            try:
                schema = get_iceberg().get_schema()
                return self._send_json(200, schema)
            except RuntimeError as e:
                return self._send_json(503, {"error": str(e)})

        if path == "/api/v1/swarm/deepkeep/status":
            return self._send_json(200, get_deepkeep().status())

        self._send_json(404, {"error": "Not found"})

    def do_POST(self):
        path = self.path.rstrip("/")
        content_length = int(self.headers.get("Content-Length", 0))
        body = self.rfile.read(content_length) if content_length > 0 else b"{}"

        try:
            data = json.loads(body)
        except json.JSONDecodeError:
            return self._send_json(400, {"error": "Invalid JSON"})

        if path == "/api/v1/swarm/task":
            prompt = data.get("prompt", "").strip()
            if not prompt:
                return self._send_json(400, {"error": "Prompt is required"})
            source = data.get("source", "api")
            return self._handle_task_submit(prompt, source)

        if path == "/api/v1/swarm/data/query":
            try:
                req = urllib.request.Request(
                    DASHBOARD_HUB_URL,
                    data=body,
                    headers={'Content-Type': 'application/json'},
                )
                with urllib.request.urlopen(req, timeout=5) as resp:
                    resp_data = json.loads(resp.read().decode('utf-8'))
                    return self._send_json(200, resp_data)
            except Exception as e:
                return self._send_json(500, {"error": f"Data Source Offline: {str(e)}"})

        if path == "/api/v1/swarm/vector/add":
            collection = data.get("collection", "default")
            text = data.get("text", "").strip()
            if not text:
                return self._send_json(400, {"error": "text is required"})
            try:
                item_id = self.vec.add(collection, text, data.get("metadata"))
                return self._send_json(201, {"id": item_id, "collection": collection})
            except RuntimeError as e:
                return self._send_json(503, {"error": str(e)})

        if path == "/api/v1/swarm/vector/search":
            collection = data.get("collection", "default")
            query = data.get("query", "").strip()
            if not query:
                return self._send_json(400, {"error": "query is required"})
            top_k = data.get("top_k", 5)
            threshold = data.get("threshold", 0.0)
            try:
                results = self.vec.search(collection, query, top_k=top_k, threshold=threshold)
                return self._send_json(200, {"results": results, "collection": collection})
            except RuntimeError as e:
                return self._send_json(503, {"error": str(e)})

        if path == "/api/v1/swarm/vector/remove":
            collection = data.get("collection", "default")
            item_id = data.get("id", "").strip()
            if not item_id:
                return self._send_json(400, {"error": "id is required"})
            self.vec.remove(collection, item_id)
            return self._send_json(200, {"removed": True})

        if path == "/api/v1/swarm/iceberg/query":
            sql = data.get("query", "").strip()
            if not sql:
                return self._send_json(400, {"error": "query is required"})
            try:
                result = get_iceberg().query(sql)
                return self._send_json(200, result)
            except RuntimeError as e:
                return self._send_json(503, {"error": str(e)})

        if path == "/api/v1/swarm/deepkeep/sanitize":
            src = data.get("path", "").strip()
            if not src:
                return self._send_json(400, {"error": "path is required"})
            try:
                result = get_deepkeep().sanitize(src)
                return self._send_json(200, result)
            except (FileNotFoundError, RuntimeError, OSError) as e:
                return self._send_json(422, {"error": str(e)})

        if path == "/api/v1/swarm/deepkeep/retention":
            dry_run = data.get("dry_run", False)
            try:
                report = get_deepkeep().run_retention(dry_run=dry_run)
                return self._send_json(200, report)
            except RuntimeError as e:
                return self._send_json(503, {"error": str(e)})

        self._send_json(404, {"error": "Not found"})

    def _handle_task_submit(self, prompt: str, source: str):
        task_id = f"task-{int(time.time())}"
        assigned_agent = "nemo-code"

        prompt_lower = prompt.lower()
        if any(kw in prompt_lower for kw in ["recherche", "suche", "finde", "research"]):
            assigned_agent = "nemo-res"
        elif any(kw in prompt_lower for kw in ["review", "check", "pruefe"]):
            assigned_agent = "nemo-rev"

        task_meta = {
            "prompt": prompt,
            "source": source,
            "assigned_agent": assigned_agent,
            "status": "pending",
            "created_at": time.time(),
        }
        self.mem.track_task(task_id, task_meta)
        self.mem.append_history({
            "action": "task_created",
            "task_id": task_id,
            "agent": assigned_agent,
            "source": source,
        })

        self._send_json(201, {
            "task_id": task_id,
            "agent": assigned_agent,
            "status": "pending",
        })


def main():
    server = HTTPServer((API_HOST, API_PORT), SwarmGatewayHandler)
    print(f"[Nemotron API] Gateway gestartet auf http://{API_HOST}:{API_PORT}")
    print(f"[Nemotron API] Endpunkte:")
    print(f"   GET  /healthz, /")
    print(f"   GET  /api/v1/swarm/status")
    print(f"   GET  /api/v1/swarm/history")
    print(f"   GET  /api/v1/swarm/vector/collections")
    print(f"   GET  /api/v1/swarm/vector/size/<collection>")
    print(f"   POST /api/v1/swarm/task")
    print(f"   POST /api/v1/swarm/vector/add")
    print(f"   POST /api/v1/swarm/vector/search")
    print(f"   POST /api/v1/swarm/vector/remove")
    print(f"   GET  /api/v1/swarm/iceberg/tables")
    print(f"   GET  /api/v1/swarm/iceberg/schema")
    print(f"   POST /api/v1/swarm/iceberg/query")
    print(f"   GET  /api/v1/swarm/deepkeep/status")
    print(f"   POST /api/v1/swarm/deepkeep/sanitize")
    print(f"   POST /api/v1/swarm/deepkeep/retention")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\n[Nemotron API] Herunterfahren...")
        server.shutdown()


if __name__ == "__main__":
    main()
