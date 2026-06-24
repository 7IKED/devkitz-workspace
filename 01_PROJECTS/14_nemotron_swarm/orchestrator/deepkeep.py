"""
DEEPKEEP Sanitizer — Soft-Delete & 7-Tage-Archiv-Regel

- sanitize(path): Verschiebt eine Datei statt zu loeschen nach 99_ARCHIVE/
- run_retention(dry_run): Scannt 99_ARCHIVE/ nach Dateien aelter 7 Tage
  → komprimiert (gzip) oder pushed zu Iceberg
- Status-Monitoring ueber get_deepkeep().status()
"""

import gzip
import json
import os
import shutil
import sys
import threading
import time
from datetime import datetime, timezone

from config import ARCHIVE_ROOT, SECONDS_PER_DAY, RETENTION_DAYS


def esc(text: str, max_len: int = 120) -> str:
    """R15: Escaped einen String fuer Logging (entfernt Steuerzeichen)."""
    clean = "".join(c if c.isprintable() else "?" for c in text)
    return clean[:max_len]


class DeepKeep:
    """Soft-Delete + Archiv-Retention. Thread-safe via Lock."""

    def __init__(self, archive_root: str | None = None):
        self.archive_root = (archive_root or ARCHIVE_ROOT)
        self.lock = threading.Lock()
        self._logger = None

    def _log(self):
        if self._logger is None:
            sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))
            from orchestrator.logger import SwarmLogger
            self._logger = SwarmLogger(agent_id="deepkeep")
        return self._logger

    # ------------------------------------------------------------------
    # Sanitize (Soft-Delete)
    # ------------------------------------------------------------------

    def sanitize(self, src_path: str) -> dict:
        """Verschiebt eine Datei nach 99_ARCHIVE/sanitized/YYYY-MM/.
        Gibt {'ok': True, 'archive_path': '...', 'size': N} zurueck.
        Wirft FileNotFoundError / RuntimeError bei Fehlern."""
        src = os.path.abspath(src_path)
        if not os.path.isfile(src):
            raise FileNotFoundError(f"Datei nicht gefunden: {src}")

        now = datetime.now(timezone.utc)
        subdir = f"sanitized/{now.strftime('%Y-%m')}"
        dest_dir = os.path.join(self.archive_root, subdir)
        ts = now.strftime("%Y%m%dT%H%M%S")
        basename = os.path.basename(src)
        dest = os.path.join(dest_dir, f"{ts}_{basename}")

        with self.lock:
            os.makedirs(dest_dir, exist_ok=True)
            shutil.move(src, dest)

        size = os.path.getsize(dest)
        self._log().info(f"sanitized: {esc(basename)} → {esc(os.path.relpath(dest, self.archive_root))} ({size}B)")

        return {
            "ok": True,
            "archive_path": os.path.normpath(dest),
            "size": size,
        }

    def sanitize_tree(self, root_dir: str, pattern: str | None = None) -> list[dict]:
        """Durchlaeuft rekursiv ein Verzeichnis und sanitized alle Dateien,
        optional gefiltert nach Endung (z. B. '.tmp', '.log').
        Gibt Liste der Ergebnisse zurueck."""
        results = []
        root = os.path.abspath(root_dir)
        if not os.path.isdir(root):
            raise NotADirectoryError(f"Kein Verzeichnis: {root}")

        for dirpath, _dirnames, filenames in os.walk(root):
            for fn in filenames:
                if pattern and not fn.endswith(pattern):
                    continue
                full = os.path.join(dirpath, fn)
                try:
                    results.append(self.sanitize(full))
                except (FileNotFoundError, RuntimeError, OSError) as e:
                    self._log().warn(f"sanitize skipped {esc(fn)}: {e}")
        return results

    # ------------------------------------------------------------------
    # Retention (7-Tage-Regel)
    # ------------------------------------------------------------------

    def run_retention(self, dry_run: bool = False) -> dict:
        """Scannt das Archiv nach Dateien aelter als RETENTION_DAYS.
        - > 7d: gzip-komprimieren (oder an Iceberg pushen)
        Gibt Report {'scanned': N, 'compressed': N, 'pushed': N, 'errors': [...]}"""
        cutoff = time.time() - (RETENTION_DAYS * SECONDS_PER_DAY)
        report: dict = {"scanned": 0, "compressed": 0, "pushed": 0, "errors": []}

        if not os.path.isdir(self.archive_root):
            self._log().info("retention: kein Archiv-Verzeichnis vorhanden")
            return report

        for dirpath, _dirnames, filenames in os.walk(self.archive_root):
            for fn in filenames:
                full = os.path.join(dirpath, fn)

                if fn.endswith(".gz"):
                    continue

                try:
                    mtime = os.path.getmtime(full)
                except OSError:
                    continue

                if mtime >= cutoff:
                    continue

                report["scanned"] += 1

                if dry_run:
                    continue

                # Versuche Iceberg-Push
                pushed = self._try_push_to_iceberg(full)
                if pushed:
                    report["pushed"] += 1

                # Komprimieren (auch wenn Iceberg-Push erfolgreich — als lokales Backup)
                try:
                    self._compress(full)
                    report["compressed"] += 1
                except OSError as e:
                    report["errors"].append(f"compress {esc(fn)}: {e}")

        self._log().info(
            f"retention: scanned={report['scanned']} "
            f"compressed={report['compressed']} pushed={report['pushed']}"
        )
        return report

    def _compress(self, file_path: str):
        """Erzeugt file.gz und loescht das Original (shutil schon im Archiv)."""
        gz_path = f"{file_path}.gz"
        with open(file_path, "rb") as f_in:
            with gzip.open(gz_path, "wb", mtime=0) as f_out:
                shutil.copyfileobj(f_in, f_out)
        os.remove(file_path)
        self._log().debug(
            f"compressed: {esc(os.path.basename(file_path))} → "
            f"{esc(os.path.basename(gz_path))}"
        )

    def _try_push_to_iceberg(self, file_path: str) -> bool:
        """Versucht, den Dateiinhalt als Row an Iceberg zu senden.
        Fehler sind nicht fatal — wird nur geloggt."""
        try:
            sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))
            from orchestrator.iceberg_client import get_client
            client = get_client()
        except ImportError:
            return False

        basename = os.path.basename(file_path)
        rel = os.path.relpath(file_path, self.archive_root)
        size = os.path.getsize(file_path)

        sql = (
            "INSERT INTO deepkeep_archive (path, filename, size, archived_at) "
            f"VALUES ('{esc(rel).replace("'", "''")}', '{esc(basename).replace("'", "''")}', "
            f"{size}, '{datetime.now(timezone.utc).isoformat()}')"
        )
        try:
            client.query(sql)
            return True
        except RuntimeError:
            return False

    # ------------------------------------------------------------------
    # Status
    # ------------------------------------------------------------------

    def status(self) -> dict:
        """Gibt einen Report ueber den aktuellen Archiv-Zustand zurueck."""
        total = 0
        size_bytes = 0
        oldest: float | None = None
        newest: float | None = None
        by_month: dict[str, int] = {}

        if os.path.isdir(self.archive_root):
            for dirpath, _dirnames, filenames in os.walk(self.archive_root):
                for fn in filenames:
                    full = os.path.join(dirpath, fn)
                    try:
                        mtime = os.path.getmtime(full)
                        size = os.path.getsize(full)
                    except OSError:
                        continue
                    total += 1
                    size_bytes += size
                    if oldest is None or mtime < oldest:
                        oldest = mtime
                    if newest is None or mtime > newest:
                        newest = mtime

                    rel = os.path.relpath(dirpath, self.archive_root)
                    month = rel.replace("\\", "/").split("/")[0]
                    by_month[month] = by_month.get(month, 0) + 1

        return {
            "archive_root": os.path.normpath(self.archive_root),
            "total_files": total,
            "size_bytes": size_bytes,
            "size_mb": round(size_bytes / (1024 * 1024), 2),
            "oldest_ts": oldest,
            "newest_ts": newest,
            "retention_days": RETENTION_DAYS,
            "by_month": by_month,
        }


# ------------------------------------------------------------------
# Singleton
# ------------------------------------------------------------------

_instance: DeepKeep | None = None
_lock = threading.Lock()


def get_deepkeep() -> DeepKeep:
    global _instance
    if _instance is None:
        with _lock:
            if _instance is None:
                _instance = DeepKeep()
    return _instance
