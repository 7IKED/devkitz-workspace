import os
import shutil
from pathlib import Path

from orchestrator.deepkeep.config import SCOPE_EXCEPTIONS, ARCHIVE_ROOT, TRESOR_PATH
from orchestrator.deepkeep.archiver import archive_file, archive_tree, run_first_stage, run_second_stage
from orchestrator.deepkeep import registry

_real_remove = os.remove
_real_unlink = os.unlink
_real_rmtree = shutil.rmtree
_real_move = shutil.move
_real_rename = os.rename

_patches_applied = False


def apply_patches():
    global _patches_applied
    if _patches_applied:
        return
    os.remove = _sanitized_remove
    os.unlink = _sanitized_unlink
    shutil.rmtree = _sanitized_rmtree
    shutil.move = _sanitized_move
    os.rename = _sanitized_rename
    _patches_applied = True


def remove_patches():
    global _patches_applied
    if not _patches_applied:
        return
    os.remove = _real_remove
    os.unlink = _real_unlink
    shutil.rmtree = _real_rmtree
    shutil.move = _real_move
    os.rename = _real_rename
    _patches_applied = False


def _is_scope_exception(resolved: Path) -> bool:
    return any(resolved.is_relative_to(ex) for ex in SCOPE_EXCEPTIONS)


def _is_archive_operation(resolved: Path) -> bool:
    return resolved.is_relative_to(ARCHIVE_ROOT) or resolved.is_relative_to(TRESOR_PATH)


def _sanitized_remove(path, *args, **kwargs):
    resolved = Path(path).resolve()
    if _is_scope_exception(resolved) or _is_archive_operation(resolved):
        _real_remove(path, *args, **kwargs)
        return
    size = resolved.stat().st_size
    dst = archive_file(resolved)
    registry.register(resolved, dst, "remove", size)


def _sanitized_unlink(path, *args, **kwargs):
    _sanitized_remove(path, *args, **kwargs)


def _sanitized_rmtree(path, *args, **kwargs):
    resolved = Path(path).resolve()
    if _is_scope_exception(resolved) or _is_archive_operation(resolved):
        _real_rmtree(path, *args, **kwargs)
        return
    size = sum(f.stat().st_size for f in resolved.rglob("*") if f.is_file())
    dst = archive_tree(resolved)
    registry.register(resolved, dst, "rmtree", size)


def _sanitized_move(src, dst, *args, **kwargs):
    resolved_src = Path(src).resolve()
    resolved_dst = Path(dst).resolve()
    if _is_archive_operation(resolved_src) or _is_scope_exception(resolved_src):
        _real_move(src, dst, *args, **kwargs)
        return
    size = resolved_src.stat().st_size
    archive_dst = archive_file(resolved_src)
    registry.register(resolved_src, archive_dst, "move", size)


def _sanitized_rename(src, dst, *args, **kwargs):
    resolved_src = Path(src).resolve()
    resolved_dst = Path(dst).resolve()
    if _is_scope_exception(resolved_src) or _is_archive_operation(resolved_src) or _is_archive_operation(resolved_dst):
        _real_rename(src, dst, *args, **kwargs)
        return
    size = resolved_src.stat().st_size
    archive_dst = archive_file(resolved_src)
    registry.register(resolved_src, archive_dst, "rename", size)


class SanitizerInterceptor:
    def __enter__(self):
        apply_patches()
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        remove_patches()

    def run_retention(self, days_first=7, days_second=30):
        run_first_stage(days_first)
        run_second_stage(days_second)

    def status(self):
        return registry.stats()
