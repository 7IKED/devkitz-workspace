import uuid
import time
import threading


class SwarmRouter:
    """
    Nemotron-Schwarm Router
    Verwaltet eingehende Tasks, weist diese den passenden Agenten zu
    und fuehrt Status-Tracking durch.
    """

    def __init__(self):
        self.task_queue = []
        self.active_tasks = {}
        self.completed_tasks = []
        self.lock = threading.Lock()

    def submit_task(self, prompt: str, source: str = "manual") -> str:
        task_id = f"task-{uuid.uuid4().hex[:8]}"
        task = {
            "id": task_id,
            "prompt": prompt,
            "source": source,
            "status": "pending",
            "created_at": time.time(),
            "assigned_agent": None,
        }
        with self.lock:
            self.task_queue.append(task)
            self.active_tasks[task_id] = task
        print(f"[SwarmRouter] Task {task_id} queued from {source}")
        threading.Thread(target=self._dispatch_task, args=(task_id,), daemon=True).start()
        return task_id

    def _analyze_intent(self, prompt: str) -> str:
        prompt_lower = prompt.lower()
        if any(kw in prompt_lower for kw in ["recherche", "suche", "finde", "research", "lese"]):
            return "nemo-res"
        if any(kw in prompt_lower for kw in ["review", "check", "pruefe", "test"]):
            return "nemo-rev"
        return "nemo-code"

    def _dispatch_task(self, task_id: str):
        with self.lock:
            if task_id not in self.active_tasks:
                return
            task = self.active_tasks[task_id]
        agent = self._analyze_intent(task["prompt"])
        with self.lock:
            task["status"] = "running"
            task["assigned_agent"] = agent
        print(f"[SwarmRouter] Task {task_id} dispatched to {agent}")
        time.sleep(2)
        with self.lock:
            task["status"] = "completed"
            task["completed_at"] = time.time()
            self.completed_tasks.append(task)
            if task in self.task_queue:
                self.task_queue.remove(task)
        print(f"[SwarmRouter] Task {task_id} completed by {agent}")

    def get_status(self) -> dict:
        with self.lock:
            return {
                "queue_length": len(self.task_queue),
                "active_tasks": len([t for t in self.active_tasks.values() if t.get("status") == "running"]),
                "completed": len(self.completed_tasks),
                "tasks": list(self.active_tasks.values()),
            }
