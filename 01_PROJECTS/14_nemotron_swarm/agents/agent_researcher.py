#!/usr/bin/env python3
import json
import os
import sys
import time
import urllib.request
import urllib.parse

AGENT_ID = "nemo-res"
POLL_INTERVAL = 7
PROJECT_BASE = os.path.join(os.path.dirname(__file__), "..")

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))
from orchestrator.logger import SwarmLogger
from orchestrator.llm_client import ask
from orchestrator.iceberg_client import get_client as get_iceberg

logger = SwarmLogger(agent_id=AGENT_ID)
ice = get_iceberg()


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


def scan_workspace():
    results = []
    base = PROJECT_BASE
    for root, dirs, files in os.walk(base):
        skip = {"__pycache__", ".git", "node_modules", "venv", ".venv", "LOGS", "SCRATCH"}
        dirs[:] = [d for d in dirs if d not in skip]
        for f in files:
            if f.endswith((".py", ".js", ".md", ".json", ".yaml", ".yml", ".html", ".css")):
                path = os.path.join(root, f)
                try:
                    with open(path, "r", encoding="utf-8", errors="ignore") as fh:
                        lines = fh.readlines()
                    results.append({"path": os.path.relpath(path, base), "size": len(lines)})
                except Exception:
                    pass
    return results


def query_iceberg_with_sql(question: str) -> dict:
    """Uebersetzt eine Research-Frage via LLM in SQL, fuehrt sie aus und gibt Ergebnisse zurueck."""
    tables = ice.list_tables()
    schema_summary = ""
    if tables:
        try:
            schema = ice.get_schema()
            cols = schema.get("columns", {})
            parts = []
            for t in tables:
                cdef = cols.get(t, [])
                parts.append(f"  {t}: {', '.join(cdef[:20])}")
            schema_summary = "\n".join(parts)
        except RuntimeError:
            schema_summary = "\n".join(f"  {t}" for t in tables)

    sql_prompt = f"""You are an SQL query generator. Given the available Iceberg tables below, convert the research question into a single SQL query.

Available tables:
{schema_summary or "(no schema available — use generic SHOW style queries)"}

Rules:
- Output ONLY the SQL query, no explanations, no markdown
- If the question cannot be answered with these tables, output: -- no_sql_possible
- Use standard SQL (SELECT, WHERE, GROUP BY, ORDER BY, LIMIT)

Research question: {question}"""

    raw_sql = ask(sql_prompt, role="researcher").strip().strip("`")
    if raw_sql.startswith("sql"):
        raw_sql = raw_sql[3:].strip()
    if raw_sql.startswith("-- no_sql_possible"):
        return {"rows": [], "columns": [], "note": "No suitable table found for this question"}

    if not raw_sql.upper().startswith("SELECT"):
        logger.warn(f"LLM generated non-SELECT — skipping: {raw_sql[:60]}...")
        return {"rows": [], "columns": [], "note": "Generated query was not a SELECT"}

    logger.info(f"Iceberg SQL: {raw_sql[:120]}...")
    return ice.query(raw_sql)


def synthesize(question, workspace_summary, iceberg_data=None):
    prompt = f"""Research question: {question}

Workspace overview ({len(workspace_summary)} files):
{json.dumps(workspace_summary[:30], indent=2)}
"""
    if iceberg_data and iceberg_data.get("rows"):
        rows = iceberg_data["rows"][:15]
        cols = iceberg_data.get("columns", [])
        prompt += f"""
Iceberg query results ({len(ic) if (ic := iceberg_data.get('rows')) else 0} rows, columns: {cols}):
{json.dumps(rows, indent=2, default=str)}
"""
    prompt += """
Synthesize the findings into a structured report covering:
1. Key files and their roles
2. Architecture observations
3. Potential issues or improvements
4. Answer to the research question"""
    logger.info(f"LLM research synthesis for: {question[:80]}...")
    report = ask(prompt, role="researcher")
    logger.info(f"Report generated ({len(report)} chars)")
    return report


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
            question = task.get("prompt", task.get("data", ""))
            logger.info(f"Researching: {question[:80]}")

            try:
                files = scan_workspace()
                iceberg = query_iceberg_with_sql(question)

                raw_findings = {"files": files, "iceberg": iceberg}
                report = synthesize(question, files, iceberg_data=iceberg)

                out_dir = os.path.join(PROJECT_BASE, "SCRATCH")
                os.makedirs(out_dir, exist_ok=True)
                report_path = os.path.join(out_dir, f"research_{task_id}.md")
                with open(report_path, "w", encoding="utf-8") as f:
                    f.write(f"# Research: {question}\n\n{report}\n")

                raw_path = os.path.join(out_dir, f"research_{task_id}_raw.json")
                with open(raw_path, "w", encoding="utf-8") as f:
                    json.dump(raw_findings, f, indent=2, ensure_ascii=False)

                send_webhook("completed", {
                    "task_id": task_id, "report": report_path,
                    "files_scanned": len(files)
                })
                logger.info(f"Done: {report_path}")
            except Exception as e:
                logger.error(f"Failed: {e}")
                send_webhook("failed", {"task_id": task_id, "error": str(e)})
        else:
            time.sleep(POLL_INTERVAL)


if __name__ == "__main__":
    run()
