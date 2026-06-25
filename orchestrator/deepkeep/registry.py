import sqlite3
import json
from datetime import datetime
from pathlib import Path
from orchestrator.deepkeep.config import DB_PATH


def _get_conn():
    DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(str(DB_PATH))
    conn.execute("PRAGMA journal_mode=WAL")
    _ensure_schema(conn)
    return conn


def _ensure_schema(conn):
    conn.execute("""
        CREATE TABLE IF NOT EXISTS archive_entries (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            original_path TEXT NOT NULL,
            archive_path TEXT NOT NULL,
            mode TEXT NOT NULL,
            size_bytes INTEGER NOT NULL,
            created_at TEXT NOT NULL,
            compressed INTEGER DEFAULT 0,
            compressed_at TEXT,
            migrated INTEGER DEFAULT 0,
            migrated_at TEXT
        )
    """)
    conn.execute("""
        CREATE INDEX IF NOT EXISTS idx_original_path
        ON archive_entries(original_path)
    """)
    conn.execute("""
        CREATE INDEX IF NOT EXISTS idx_created_at
        ON archive_entries(created_at)
    """)


def register(original_path, archive_path, mode, size_bytes):
    conn = _get_conn()
    conn.execute("""
        INSERT INTO archive_entries (original_path, archive_path, mode, size_bytes, created_at)
        VALUES (?, ?, ?, ?, ?)
    """, (
        str(original_path),
        str(archive_path),
        mode,
        size_bytes,
        datetime.utcnow().isoformat(),
    ))
    conn.commit()
    conn.close()


def query(original_path=None, days_old=None, compressed=None, migrated=None):
    conn = _get_conn()
    parts = ["SELECT * FROM archive_entries WHERE 1=1"]
    params = []
    if original_path:
        parts.append("AND original_path = ?")
        params.append(str(original_path))
    if days_old is not None:
        parts.append("AND created_at < date('now', ?)")
        params.append(f"-{days_old} days")
    if compressed is not None:
        parts.append("AND compressed = ?")
        params.append(1 if compressed else 0)
    if migrated is not None:
        parts.append("AND migrated = ?")
        params.append(1 if migrated else 0)
    rows = conn.execute(" ".join(parts), params).fetchall()
    conn.close()
    return rows


def mark_compressed(entry_id):
    conn = _get_conn()
    conn.execute("""
        UPDATE archive_entries
        SET compressed = 1, compressed_at = ?
        WHERE id = ?
    """, (datetime.utcnow().isoformat(), entry_id))
    conn.commit()
    conn.close()


def mark_migrated(entry_id):
    conn = _get_conn()
    conn.execute("""
        UPDATE archive_entries
        SET migrated = 1, migrated_at = ?
        WHERE id = ?
    """, (datetime.utcnow().isoformat(), entry_id))
    conn.commit()
    conn.close()


def stats():
    conn = _get_conn()
    row = conn.execute("""
        SELECT
            COUNT(*) as total,
            COALESCE(SUM(size_bytes), 0) as total_bytes,
            COALESCE(SUM(CASE WHEN compressed = 1 THEN 1 ELSE 0 END), 0) as compressed_count,
            COALESCE(SUM(CASE WHEN migrated = 1 THEN 1 ELSE 0 END), 0) as migrated_count
        FROM archive_entries
    """).fetchone()
    conn.close()
    return {
        "total": row[0],
        "total_bytes": row[1],
        "compressed_count": row[2],
        "migrated_count": row[3],
    }
