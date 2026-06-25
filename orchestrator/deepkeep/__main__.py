import argparse
import sys
from pathlib import Path

from orchestrator.deepkeep.sanitizer import apply_patches, remove_patches, SanitizerInterceptor
from orchestrator.deepkeep import registry


def cmd_sanitize(args):
    import os
    import shutil

    path = Path(args.path)
    if not path.exists():
        print(f"DEEPKEEP: Path not found — {path}")
        sys.exit(1)

    interceptor = SanitizerInterceptor()
    with interceptor:
        if path.is_file():
            os.remove(str(path))
        else:
            shutil.rmtree(str(path))
    print(f"DEEPKEEP: Archived {path} → 99_ARCHIVE/deepkeep/")


def cmd_status(args):
    s = registry.stats()
    print(f"DEEPKEEP Registry Status:")
    print(f"  Total entries:     {s['total']}")
    print(f"  Total bytes:       {s['total_bytes']}")
    print(f"  Compressed:        {s['compressed_count']}")
    print(f"  Migrated to tresor: {s['migrated_count']}")


def cmd_retention(args):
    interceptor = SanitizerInterceptor()
    with interceptor:
        interceptor.run_retention(days_first=args.first_stage, days_second=args.second_stage)
    print(f"DEEPKEEP: Retention run complete (Stage 1: {args.first_stage}d, Stage 2: {args.second_stage}d)")


def main():
    parser = argparse.ArgumentParser(description="DEEPKEEP Sanitizer — Never delete, only archive.")
    subparsers = parser.add_subparsers(dest="command")

    p_sanitize = subparsers.add_parser("sanitize", help="Archive a file or directory")
    p_sanitize.add_argument("--path", required=True, help="Path to archive")

    p_status = subparsers.add_parser("status", help="Show registry status")

    p_retention = subparsers.add_parser("retention", help="Run retention policy")
    p_retention.add_argument("--first-stage", type=int, default=7, help="Days before first stage (GZip)")
    p_retention.add_argument("--second-stage", type=int, default=30, help="Days before second stage (Tresor push)")

    args = parser.parse_args()

    if args.command == "sanitize":
        cmd_sanitize(args)
    elif args.command == "status":
        cmd_status(args)
    elif args.command == "retention":
        cmd_retention(args)
    else:
        parser.print_help()


if __name__ == "__main__":
    main()
