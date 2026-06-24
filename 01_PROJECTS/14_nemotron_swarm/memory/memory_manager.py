import os
import json
import time
import threading


MEMORY_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "store")

FILES = {
    "tasks": os.path.join(MEMORY_DIR, "tasks.json"),
    "agents": os.path.join(MEMORY_DIR, "agents.json"),
    "context": os.path.join(MEMORY_DIR, "context.json"),
    "history": os.path.join(MEMORY_DIR, "history.json"),
}


class MemoryManager:
    def __init__(self):
        os.makedirs(MEMORY_DIR, exist_ok=True)
        self.lock = threading.Lock()
        self._init_store()

    def _init_store(self):
        for name, path in FILES.items():
            if not os.path.exists(path):
                self._write(name, {} if name != "history" else [])

    def _read(self, name: str):
        path = FILES.get(name)
        if not path or not os.path.exists(path):
            return {} if name != "history" else []
        with open(path, "r", encoding="utf-8") as f:
            return json.load(f)

    def _write(self, name: str, data):
        path = FILES.get(name)
        if not path:
            return False
        os.makedirs(os.path.dirname(path), exist_ok=True)
        with open(path, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
        return True

    def save_task(self, task: dict):
        with self.lock:
            tasks = self._read("tasks")
            tasks[task["id"]] = {
                **task,
                "saved_at": time.time(),
            }
            self._write("tasks", tasks)
            history = self._read("history")
            history.append({"id": task["id"], "prompt": task.get("prompt", ""), "agent": task.get("assigned_agent", ""), "status": task["status"], "ts": time.time()})
            self._write("history", history)

    def get_task(self, task_id: str) -> dict | None:
        with self.lock:
            tasks = self._read("tasks")
            return tasks.get(task_id)

    def list_tasks(self, limit: int = 50) -> list:
        with self.lock:
            tasks = self._read("tasks")
            sorted_tasks = sorted(tasks.values(), key=lambda t: t.get("saved_at", 0), reverse=True)
            return sorted_tasks[:limit]

    def save_context(self, key: str, value):
        with self.lock:
            ctx = self._read("context")
            ctx[key] = {"value": value, "updated_at": time.time()}
            self._write("context", ctx)

    def get_context(self, key: str):
        with self.lock:
            ctx = self._read("context")
            entry = ctx.get(key)
            return entry["value"] if entry else None

    def register_agent(self, agent_id: str, meta: dict):
        with self.lock:
            agents = self._read("agents")
            agents[agent_id] = {**meta, "last_seen": time.time()}
            self._write("agents", agents)

    def get_agent(self, agent_id: str) -> dict | None:
        with self.lock:
            agents = self._read("agents")
            return agents.get(agent_id)

    def list_agents(self) -> dict:
        with self.lock:
            return self._read("agents")

    def get_recent_history(self, limit: int = 20) -> list:
        with self.lock:
            history = self._read("history")
            return history[-limit:]

    def get_stats(self) -> dict:
        with self.lock:
            tasks = self._read("tasks")
            agents = self._read("agents")
            context = self._read("context")
            history = self._read("history")
            return {
                "total_tasks": len(tasks),
                "total_agents": len(agents),
                "total_context_keys": len(context),
                "total_history_entries": len(history),
                "memory_dir": MEMORY_DIR,
            }
