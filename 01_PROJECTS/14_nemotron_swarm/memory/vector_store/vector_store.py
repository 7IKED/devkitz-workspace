import json
import math
import os
import threading
import time
import urllib.request
import urllib.error

OLLAMA_BASE = "http://localhost:11434/v1"
EMBED_MODEL = "mistral-nemo"
TIMEOUT = 30


class VectorStore:
    """Lightweight vector store — Ollama Embedding API + JSON-Persistenz."""

    def __init__(self, store_dir: str):
        self.store_dir = store_dir
        self.lock = threading.Lock()
        os.makedirs(store_dir, exist_ok=True)

    def _path(self, collection: str) -> str:
        safe = collection.replace("/", "_").replace("\\", "_")
        return os.path.join(self.store_dir, f"{safe}.json")

    def _load(self, collection: str) -> list:
        path = self._path(collection)
        if os.path.exists(path):
            with open(path, "r", encoding="utf-8") as f:
                return json.load(f)
        return []

    def _save(self, collection: str, data: list):
        with open(self._path(collection), "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2, ensure_ascii=False)

    def _get_embedding(self, text: str) -> list[float]:
        body = json.dumps({"model": EMBED_MODEL, "input": text}).encode("utf-8")
        req = urllib.request.Request(
            f"{OLLAMA_BASE}/embeddings",
            data=body,
            headers={"Content-Type": "application/json"},
            method="POST",
        )
        try:
            with urllib.request.urlopen(req, timeout=TIMEOUT) as resp:
                result = json.loads(resp.read().decode("utf-8"))
        except (urllib.error.URLError, OSError) as e:
            raise RuntimeError(f"Embedding API unerreichbar: {e}")
        data = result.get("data", [])
        return data[0].get("embedding", []) if data else []

    def add(self, collection: str, text: str, metadata: dict | None = None) -> str:
        embedding = self._get_embedding(text)
        entry = {
            "id": f"vec-{int(time.time() * 1000)}",
            "text": text,
            "embedding": embedding,
            "metadata": metadata or {},
            "created": time.time(),
        }
        with self.lock:
            items = self._load(collection)
            items.append(entry)
            self._save(collection, items)
        return entry["id"]

    def search(
        self, collection: str, query: str, top_k: int = 5, threshold: float = 0.0
    ) -> list[dict]:
        q_emb = self._get_embedding(query)
        with self.lock:
            items = self._load(collection)
        if not items or not q_emb:
            return []
        scored = []
        for item in items:
            sim = self._cosine_similarity(q_emb, item.get("embedding", []))
            if sim >= threshold:
                scored.append({
                    "id": item["id"],
                    "text": item["text"],
                    "metadata": item["metadata"],
                    "score": round(sim, 4),
                    "created": item["created"],
                })
        scored.sort(key=lambda x: -x["score"])
        return scored[:top_k]

    @staticmethod
    def _cosine_similarity(a: list[float], b: list[float]) -> float:
        if not a or not b or len(a) != len(b):
            return 0.0
        dot = sum(x * y for x, y in zip(a, b))
        na = math.sqrt(sum(x * x for x in a))
        nb = math.sqrt(sum(y * y for y in b))
        if na == 0 or nb == 0:
            return 0.0
        return dot / (na * nb)

    def remove(self, collection: str, item_id: str):
        with self.lock:
            items = self._load(collection)
            items = [i for i in items if i["id"] != item_id]
            self._save(collection, items)

    def list_collections(self) -> list[str]:
        files = [f for f in os.listdir(self.store_dir) if f.endswith(".json")]
        return sorted(f.replace(".json", "") for f in files)

    def collection_size(self, collection: str) -> int:
        with self.lock:
            return len(self._load(collection))
