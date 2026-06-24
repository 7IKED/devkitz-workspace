import json
import os
import threading
import time

MEMORY_DIR = os.path.join(os.path.dirname(__file__), "store")


class MemoryManager:
    """
    Zentrales Memory-Management fuer den Nemotron-Schwarm.
    Verwaltet persistente JSON-Stores fuer Agents, Context, History, Tasks.
    """

    def __init__(self, mem_dir: str = MEMORY_DIR):
        self.mem_dir = mem_dir
        self.lock = threading.Lock()
        os.makedirs(self.mem_dir, exist_ok=True)

    def _path_for(self, store: str) -> str:
        return os.path.join(self.mem_dir, f"{store}.json")

    def _read(self, store: str) -> dict | list:
        path = self._path_for(store)
        if os.path.exists(path):
            with open(path, "r", encoding="utf-8") as f:
                return json.load(f)
        return {} if store != "history" else []

    def _write(self, store: str, data):
        path = self._path_for(store)
        with open(path, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2, ensure_ascii=False)

    # --- Context ---

    def update_context(self, key: str, value) -> dict:
        with self.lock:
            ctx = self._read("context")
            ctx[key] = value
            self._write("context", ctx)
            return ctx

    def get_context(self, key: str):
        with self.lock:
            ctx = self._read("context")
            return ctx.get(key)

    def get_all_context(self) -> dict:
        with self.lock:
            return self._read("context")

    # --- Tasks ---

    def track_task(self, task_id: str, meta: dict):
        with self.lock:
            tasks = self._read("tasks")
            tasks[task_id] = meta
            self._write("tasks", tasks)

    def get_task(self, task_id: str) -> dict | None:
        with self.lock:
            tasks = self._read("tasks")
            return tasks.get(task_id)

    def list_tasks(self, status: str = None) -> list[dict]:
        with self.lock:
            tasks = self._read("tasks")
            if status:
                return [{k: v} for k, v in tasks.items() if v.get("status") == status]
            return [v for v in tasks.values()]

    def find_pending(self, agent_id: str) -> list[tuple[str, dict]]:
        """Findet alle Tasks, die auf einen bestimmten Agenten warten."""
        with self.lock:
            tasks = self._read("tasks")
            result = []
            for tid, t in tasks.items():
                if t.get("assigned_agent") == agent_id and t.get("status") == "pending":
                    result.append((tid, t))
            return result

    def find_completed_by_coder(self) -> list[tuple[str, dict]]:
        """Findet Tasks die vom Coder abgeschlossen wurden und auf Review warten."""
        with self.lock:
            tasks = self._read("tasks")
            result = []
            for tid, t in tasks.items():
                if t.get("status") == "completed" and t.get("assigned_agent") == "nemo-code":
                    result.append((tid, t))
            return result

    # --- Agents ---

    def register_agent(self, agent_id: str, meta: dict = None):
        with self.lock:
            agents = self._read("agents")
            agents[agent_id] = {**(meta or {}), "last_seen": time.time()}
            self._write("agents", agents)

    def get_agent(self, agent_id: str) -> dict | None:
        with self.lock:
            agents = self._read("agents")
            return agents.get(agent_id)

    def list_agents(self) -> dict:
        with self.lock:
            return self._read("agents")

    # --- History ---

    def append_history(self, entry: dict):
        with self.lock:
            history = self._read("history")
            history.append({**entry, "timestamp": time.time()})
            self._write("history", history)

    def get_recent_history(self, limit: int = 10) -> list:
        with self.lock:
            history = self._read("history")
            return history[-limit:]

    # --- Stats ---

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
            }
