import gzip
import os as _os
import shutil as _shutil
from datetime import datetime, timezone
from pathlib import Path

from orchestrator.deepkeep.config import (
    ARCHIVE_ROOT,
    ARCHIVE_SUBDIR_FORMAT,
    RETENTION_DAYS_FIRST,
    RETENTION_DAYS_SECOND,
    TRESOR_PATH,
)
from orchestrator.deepkeep.registry import query, mark_compressed, mark_migrated

# Save originals at import time — before sanitizer patches are applied
_real_move = _shutil.move
_real_unlink = _os.unlink


def archive_file(src: Path) -> Path:
    dst_dir = ARCHIVE_ROOT / datetime.now().strftime(ARCHIVE_SUBDIR_FORMAT)
    dst_dir.mkdir(parents=True, exist_ok=True)
    dst = dst_dir / src.name
    _real_move(str(src), str(dst))
    return dst


def archive_tree(src: Path) -> Path:
    dst_dir = ARCHIVE_ROOT / datetime.now().strftime(ARCHIVE_SUBDIR_FORMAT)
    dst_dir.mkdir(parents=True, exist_ok=True)
    dst = dst_dir / src.name
    _real_move(str(src), str(dst))
    return dst


def run_first_stage(days=RETENTION_DAYS_FIRST):
    entries = query(days_old=days, compressed=False)
    for row in entries:
        entry_id, _, archive_path_str, _, _, _, _, _, _, _ = row
        archive_path = Path(archive_path_str)
        if not archive_path.exists():
            continue
        gz_path = archive_path.with_suffix(archive_path.suffix + ".gz")
        with open(archive_path, "rb") as f_in:
            with gzip.open(gz_path, "wb") as f_out:
                _shutil.copyfileobj(f_in, f_out)
        _real_unlink(str(archive_path))
        mark_compressed(entry_id)


def run_second_stage(days=RETENTION_DAYS_SECOND):
    entries = query(days_old=days, compressed=True, migrated=False)
    for row in entries:
        entry_id, original_path_str, archive_path_str, _, _, _, _, _, _, _ = row
        archive_path = Path(archive_path_str)
        if not archive_path.exists():
            continue
        relative = archive_path.relative_to(ARCHIVE_ROOT)
        tresor_dst = TRESOR_PATH / relative
        tresor_dst.parent.mkdir(parents=True, exist_ok=True)
        _real_move(str(archive_path), str(tresor_dst))
        mark_migrated(entry_id)
