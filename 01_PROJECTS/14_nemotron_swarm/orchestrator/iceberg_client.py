import json
import os
import threading
import time
import urllib.request
import urllib.error

from config import ICEBERG_BASE, ICEBERG_QUERY_PATH, ICEBERG_SCHEMA_PATH, ICEBERG_TIMEOUT, ICEBERG_CACHE_TTL


class IcebergClient:
    """Thread-sicherer Client fuer Iceberg Go-Backend (:9881)."""

    def __init__(self, base_url: str | None = None):
        self.base_url = (base_url or ICEBERG_BASE).rstrip("/")
        self.lock = threading.Lock()
        self._schema_cache: dict | None = None
        self._schema_ts: float = 0

    def _post(self, path: str, body: dict) -> dict:
        url = f"{self.base_url}{path}"
        data = json.dumps(body).encode("utf-8")
        req = urllib.request.Request(
            url, data=data,
            headers={"Content-Type": "application/json"},
            method="POST",
        )
        try:
            with urllib.request.urlopen(req, timeout=ICEBERG_TIMEOUT) as resp:
                return json.loads(resp.read().decode("utf-8"))
        except (urllib.error.URLError, urllib.error.HTTPError, OSError) as e:
            raise RuntimeError(f"Iceberg unerreichbar ({url}): {e}")

    def _get(self, path: str) -> dict:
        url = f"{self.base_url}{path}"
        try:
            req = urllib.request.Request(url, method="GET")
            with urllib.request.urlopen(req, timeout=ICEBERG_TIMEOUT) as resp:
                return json.loads(resp.read().decode("utf-8"))
        except (urllib.error.URLError, urllib.error.HTTPError, OSError) as e:
            raise RuntimeError(f"Iceberg unerreichbar ({url}): {e}")

    def get_schema(self, force: bool = False) -> dict:
        """Ruft das Iceberg-Schema ab (Tabellen + Spalten), mit Cache."""
        now = time.time()
        with self.lock:
            if not force and self._schema_cache and (now - self._schema_ts) < ICEBERG_CACHE_TTL:
                return self._schema_cache
        try:
            result = self._get(ICEBERG_SCHEMA_PATH)
        except RuntimeError:
            result = self._post(ICEBERG_QUERY_PATH, {"query": "SHOW TABLES"})
        with self.lock:
            self._schema_cache = result
            self._schema_ts = now
        return result

    def query(self, sql: str) -> dict:
        """Fuehrt ein SQL-Statement auf Iceberg aus und gibt die Ergebnisse zurueck."""
        if not sql or not sql.strip():
            return {"error": "Empty query", "rows": [], "columns": []}
        result = self._post(ICEBERG_QUERY_PATH, {"query": sql.strip()})
        if "error" in result:
            raise RuntimeError(f"Iceberg query error: {result['error']}")
        return result

    def list_tables(self) -> list[str]:
        """Gibt eine Liste der verfuegbaren Tabellen zurueck."""
        schema = self.get_schema()
        tables = schema.get("tables", [])
        if not tables:
            try:
                result = self.query("SHOW TABLES")
                rows = result.get("rows", [])
                if rows:
                    first_key = list(rows[0].keys())[0] if rows else None
                    if first_key:
                        tables = [r[first_key] for r in rows if first_key in r]
            except RuntimeError:
                pass
        return tables or []


_client_instance: IcebergClient | None = None
_client_lock = threading.Lock()


def get_client() -> IcebergClient:
    global _client_instance
    if _client_instance is None:
        with _client_lock:
            if _client_instance is None:
                _client_instance = IcebergClient()
    return _client_instance
