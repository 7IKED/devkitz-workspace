import uuid
import time
import threading

import sys
sys.path.append(r"C:\DEVKiTZ\01_PROJECTS\14_nemotron_swarm")
from memory import memory

class SwarmRouter:
    """
    Nemotron-Schwarm Router
    Verwaltet eingehende Tasks, weist diese den passenden Agenten zu und fuehrt Status-Tracking durch.
    Nutzt MemoryManager fuer persistente Speicherung.
    """
    
    def __init__(self):
        self.task_queue = []
        self.active_tasks = {}
        self.completed_tasks = []
        self.lock = threading.Lock()
        self._restore_active_tasks()

    def _restore_active_tasks(self):
        for t in memory.list_tasks(limit=200):
            tid = t["id"]
            if t.get("status") in ("pending", "running"):
                t["status"] = "lost_on_restart"
                memory.save_task(t)

    def submit_task(self, prompt: str, source: str = "api") -> str:
        """
        Nimmt einen neuen Task auf, generiert eine ID und schiebt ihn in die Queue.
        """
        task_id = f"task-{uuid.uuid4().hex[:8]}"
        task = {
            "id": task_id,
            "prompt": prompt,
            "source": source,
            "status": "pending",
            "created_at": time.time(),
            "assigned_agent": None
        }
        
        with self.lock:
            self.task_queue.append(task)
            self.active_tasks[task_id] = task
            
        memory.save_task(task)
        print(f"[SwarmRouter] Task {task_id} queued from {source}")
        
        # Trigger async dispatch
        threading.Thread(target=self._dispatch_task, args=(task_id,)).start()
        
        return task_id

    def _analyze_intent(self, prompt: str) -> str:
        """
        MVP: Einfache Keyword-Analyse, um den passenden Agenten zu finden.
        In Zukunft: LLM Call an Nemotron.
        """
        prompt_lower = prompt.lower()
        if any(kw in prompt_lower for kw in ["recherche", "suche", "finde", "research", "lese"]):
            return "nemo-res" # Researcher
        if any(kw in prompt_lower for kw in ["code", "bau", "script", "app", "html", "python"]):
            return "nemo-code" # Coder
        if any(kw in prompt_lower for kw in ["review", "check", "pruefe", "test"]):
            return "nemo-rev" # Reviewer
        
        # Default fallback
        return "nemo-code"

    def _dispatch_task(self, task_id: str):
        """
        Simuliert das Dispatching an einen Agenten.
        """
        with self.lock:
            if task_id not in self.active_tasks:
                return
            task = self.active_tasks[task_id]
            
        # Agent zuweisen
        agent = self._analyze_intent(task["prompt"])
        
        with self.lock:
            task["status"] = "running"
            task["assigned_agent"] = agent
            
        memory.save_task(task)
        print(f"[SwarmRouter] Task {task_id} dispatched to {agent}")
        
        # MVP: Simuliere Arbeit
        time.sleep(2)
        
        with self.lock:
            task["status"] = "completed"
            task["completed_at"] = time.time()
            self.completed_tasks.append(task)
            if task in self.task_queue:
                self.task_queue.remove(task)
            memory.save_task(task)
                
        print(f"[SwarmRouter] Task {task_id} completed by {agent}")

    def get_status(self):
        """
        Liefert den aktuellen Status aller Tasks und der Queue.
        """
        with self.lock:
            return {
                "queue_length": len(self.task_queue),
                "active_tasks": len([t for t in self.active_tasks.values() if t["status"] == "running"]),
                "completed": len(self.completed_tasks),
                "tasks": list(self.active_tasks.values())
            }

# Singleton Instanz
router = SwarmRouter()
