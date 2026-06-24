from fastapi import FastAPI, BackgroundTasks
from pydantic import BaseModel
import uvicorn
from swarm_router import router
from memory import memory

app = FastAPI(
    title="Nemotron-Schwarm API Gateway",
    description="REST API fuer den DkZ Nemotron-Schwarm",
    version="1.0.0"
)

class TaskRequest(BaseModel):
    prompt: str
    source: str = "api"

@app.post("/api/v1/swarm/task")
async def create_task(req: TaskRequest):
    """
    Nimmt einen neuen Task auf und leitet ihn an den SwarmRouter weiter.
    """
    task_id = router.submit_task(prompt=req.prompt, source=req.source)
    return {"success": True, "task_id": task_id, "message": "Task im Schwarm eingereiht."}

@app.get("/api/v1/swarm/status")
async def get_status():
    """
    Gibt den Live-Status des gesamten Schwarms zurueck.
    """
    status = router.get_status()
    status["memory"] = memory.get_stats()
    return {"success": True, "data": status}

@app.get("/api/v1/swarm/memory/tasks")
async def list_memory_tasks():
    return {"success": True, "data": memory.list_tasks(limit=100)}

@app.get("/api/v1/swarm/memory/task/{task_id}")
async def get_memory_task(task_id: str):
    t = memory.get_task(task_id)
    if t is None:
        return {"success": False, "error": "Task not found"}
    return {"success": True, "data": t}

@app.post("/api/v1/swarm/memory/context")
async def set_context(key: str, value: str):
    memory.save_context(key, value)
    return {"success": True, "message": f"Context '{key}' saved"}

@app.get("/api/v1/swarm/memory/context/{key}")
async def get_context(key: str):
    val = memory.get_context(key)
    if val is None:
        return {"success": False, "error": "Key not found"}
    return {"success": True, "data": {key: val}}

@app.get("/api/v1/swarm/memory/agents")
async def list_agents():
    return {"success": True, "data": memory.list_agents()}

@app.post("/api/v1/swarm/memory/agents/register")
async def register_agent(name: str, role: str = "agent"):
    memory.register_agent(name, {"role": role, "registered_via": "api"})
    return {"success": True, "message": f"Agent '{name}' registered"}

@app.get("/api/v1/swarm/memory/stats")
async def memory_stats():
    return {"success": True, "data": memory.get_stats()}

if __name__ == "__main__":
    print("[Nemotron-Schwarm] Starte API Gateway auf Port 3060...")
    uvicorn.run(app, host="0.0.0.0", port=3060)
