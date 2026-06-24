import json
import os
import threading
import time
from datetime import datetime, timezone

LOG_DIR = os.path.join(os.path.dirname(__file__), "..", "LOGS")

LEVEL_MAP = {"DEBUG": 10, "INFO": 20, "WARNING": 30, "ERROR": 40}

class SwarmLogger:
    def __init__(self, agent_id="swarm", min_level="INFO", log_dir=LOG_DIR):
        self.lock = threading.Lock()
        self.agent_id = agent_id
        self.min_level = LEVEL_MAP.get(min_level, 20)
        self.log_dir = log_dir
        if log_dir:
            os.makedirs(log_dir, exist_ok=True)

    def _entry(self, level, message, extra=None):
        entry = {
            "ts": datetime.now(timezone.utc).isoformat(),
            "level": level,
            "agent": self.agent_id,
            "msg": message,
        }
        if extra:
            entry["extra"] = extra
        return entry

    def _write(self, entry):
        if self.log_dir:
            date = datetime.now(timezone.utc).strftime("%Y-%m-%d")
            path = os.path.join(self.log_dir, f"swarm_{date}.jsonl")
            with self.lock:
                with open(path, "a", encoding="utf-8") as f:
                    f.write(json.dumps(entry, ensure_ascii=False) + "\n")

    def log(self, level, message, extra=None):
        if LEVEL_MAP.get(level, 0) < self.min_level:
            return
        entry = self._entry(level, message, extra)
        self._write(entry)
        print(f"[{level:<7}] [{self.agent_id}] {message}")
        return entry

    def debug(self, msg, extra=None):
        return self.log("DEBUG", msg, extra)

    def info(self, msg, extra=None):
        return self.log("INFO", msg, extra)

    def warn(self, msg, extra=None):
        return self.log("WARNING", msg, extra)

    def error(self, msg, extra=None):
        return self.log("ERROR", msg, extra)


logger = SwarmLogger()
