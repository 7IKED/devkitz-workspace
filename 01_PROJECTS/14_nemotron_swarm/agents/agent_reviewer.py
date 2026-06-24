#!/usr/bin/env python3
import json
import os
import sys
import time
import urllib.request
import urllib.parse

AGENT_ID = "nemo-rev"
POLL_INTERVAL = 8
SCRATCH_DIR = os.path.join(os.path.dirname(__file__), "..", "SCRATCH")

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))
from orchestrator.logger import SwarmLogger
from orchestrator.llm_client import ask

logger = SwarmLogger(agent_id=AGENT_ID)


def send_webhook(status, payload):
    body = json.dumps({"agent_id": AGENT_ID, "status": status, **payload}).encode()
    try:
        req = urllib.request.Request(
            "http://localhost:3060/api/v1/swarm/task",
            data=body, headers={"Content-Type": "application/json"}, method="POST"
        )
        urllib.request.urlopen(req, timeout=10)
    except Exception as e:
        logger.warn(f"Webhook failed: {e}")


def review_code(file_path):
    try:
        with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
            content = f.read()
    except Exception as e:
        return {"file": file_path, "error": str(e)}

    prompt = f"""Review the following code file: {os.path.basename(file_path)}

```python
{content}
```

Analyze for:
1. **Bugs / Logic errors** – potential runtime issues
2. **Security** – injection, credentials, unsafe patterns
3. **Style / Maintainability** – naming, structure, DRY
4. **Performance** – inefficiencies, N+1, slow patterns
5. **Improvements** – concrete suggestions

Output as a structured markdown report."""
    logger.info(f"Reviewing {os.path.basename(file_path)} ({len(content)} chars)")
    report = ask(prompt, role="reviewer")
    logger.info(f"Review done ({len(report)} chars)")
    return {"file": file_path, "lines": len(content.split("\n")), "report": report}


def review_files(files_to_review=None):
    if files_to_review is None:
        files_to_review = []
        for root, _, fnames in os.walk(SCRATCH_DIR):
            for f in fnames:
                if f.endswith(".py"):
                    files_to_review.append(os.path.join(root, f))
        files_to_review.sort()

    if not files_to_review:
        return {"verdict": "No files to review", "reports": []}

    results = []
    for path in files_to_review:
        results.append(review_code(path))
    return {"verdict": f"{len(results)} files reviewed", "reviews": results}


def run():
    logger.info("Agent started")
    send_webhook("started", {"msg": "Agent online"})

    while True:
        try:
            req = urllib.request.Request(
                f"http://localhost:3060/api/v1/swarm/task?agent_id={urllib.parse.quote(AGENT_ID)}"
            )
            with urllib.request.urlopen(req, timeout=10) as resp:
                task = json.loads(resp.read().decode("utf-8"))
        except Exception:
            task = None

        if task:
            task_id = task.get("id", "unknown")
            payload = task.get("data", task.get("prompt", ""))
            logger.info(f"Reviewing task {task_id}")

            try:
                if isinstance(payload, dict) and payload.get("files"):
                    result = review_files(payload["files"])
                else:
                    result = review_files()

                out_dir = os.path.join(os.path.dirname(__file__), "..", "SCRATCH")
                os.makedirs(out_dir, exist_ok=True)
                review_path = os.path.join(out_dir, f"review_{task_id}.md")
                with open(review_path, "w", encoding="utf-8") as f:
                    f.write(f"# Review {task_id}\n\n")
                    for r in result.get("reviews", []):
                        f.write(f"## {os.path.basename(r['file'])}\n\n{r.get('report', 'N/A')}\n\n")

                send_webhook("completed", {
                    "task_id": task_id, "review": review_path,
                    "files": len(result.get("reviews", []))
                })
                logger.info(f"Done: {review_path}")
            except Exception as e:
                logger.error(f"Failed: {e}")
                send_webhook("failed", {"task_id": task_id, "error": str(e)})
        else:
            time.sleep(POLL_INTERVAL)


if __name__ == "__main__":
    run()
