#!/usr/bin/env python3
"""
DEVKiTZ Build Automation Script
Automatisiert: Module scannen, features.json updaten, README generieren, Git commit
"""

import json
import os
import glob
import hashlib
from datetime import datetime
from pathlib import Path

DASHBOARD_ROOT = r"C:\DEVKiTZ\01_PROJECTS\01_dashboard"
MODULES_DIR = os.path.join(DASHBOARD_ROOT, "modules")
FEATURES_FILE = os.path.join(DASHBOARD_ROOT, "features.json")

def scan_modules():
    """Scannt alle Module und gibt Metadaten zurueck"""
    modules = []
    if not os.path.isdir(MODULES_DIR):
        print(f"[ERROR] Modules dir not found: {MODULES_DIR}")
        return modules

    for entry in sorted(os.listdir(MODULES_DIR)):
        mod_path = os.path.join(MODULES_DIR, entry)
        if not os.path.isdir(mod_path):
            continue

        index_html = os.path.join(mod_path, "index.html")
        has_index = os.path.isfile(index_html)

        mod_info = {
            "name": entry,
            "path": f"modules/{entry}/",
            "has_index": has_index,
            "size_bytes": 0,
            "version": "v1.00.0_01",
            "status": "active" if has_index else "empty",
            "last_modified": None,
            "file_count": 0,
            "features": []
        }

        # Scan files
        file_count = 0
        total_size = 0
        for root, dirs, files in os.walk(mod_path):
            for f in files:
                fp = os.path.join(root, f)
                file_count += 1
                total_size += os.path.getsize(fp)

        mod_info["file_count"] = file_count
        mod_info["size_bytes"] = total_size

        if has_index:
            stat = os.stat(index_html)
            mod_info["last_modified"] = datetime.fromtimestamp(stat.st_mtime).isoformat()
            mod_info["size_bytes"] = stat.st_size

            # Parse meta tags from index.html
            try:
                with open(index_html, "r", encoding="utf-8", errors="ignore") as fh:
                    content = fh.read(5000)
                    if "dkz-version" in content:
                        import re
                        match = re.search(r"content=['\"]([^'\"]+)['\"]", content[content.index("dkz-version"):])
                        if match:
                            mod_info["version"] = match.group(1)
                    # Check for shared scripts
                    shared_scripts = ["dkz-premium", "dkz-copilot", "dkz-james", "dkz-navbar", "dkz-debug", "dkz-guide", "dkz-console"]
                    for script in shared_scripts:
                        if script in content:
                            mod_info["features"].append(script)
            except Exception:
                pass

        modules.append(mod_info)

    return modules


def generate_features_json(modules):
    """Generiert features.json aus gescannten Modulen"""
    features = {
        "generated": datetime.now().isoformat(),
        "generator": "dkz-build-automation v1.0",
        "stats": {
            "total_modules": len(modules),
            "active_modules": sum(1 for m in modules if m["status"] == "active"),
            "empty_modules": sum(1 for m in modules if m["status"] == "empty"),
            "total_size_mb": round(sum(m["size_bytes"] for m in modules) / 1024 / 1024, 2)
        },
        "modules": modules
    }

    with open(FEATURES_FILE, "w", encoding="utf-8") as f:
        json.dump(features, f, indent=2, ensure_ascii=False)

    print(f"[OK] features.json generated: {features['stats']['total_modules']} modules")
    return features


def check_shared_scripts():
    """Prueft ob alle Shared Scripts vorhanden sind"""
    shared_dir = os.path.join(DASHBOARD_ROOT, "shared")
    required = ["dkz-premium.js", "dkz-copilot.js", "dkz-james.js", "dkz-navbar.js", "dkz-debug.js", "dkz-guide.js", "dkz-console.js"]
    
    results = {}
    for script in required:
        path = os.path.join(shared_dir, script)
        exists = os.path.isfile(path)
        size = os.path.getsize(path) if exists else 0
        results[script] = {"exists": exists, "size": size}
        status = "OK" if exists else "MISSING"
        print(f"  [{status}] {script} ({size} bytes)")
    
    return results


def validate_modules(modules):
    """Validiert Module auf DkZ Standards"""
    issues = []
    for mod in modules:
        if mod["status"] != "active":
            continue
        
        index_path = os.path.join(MODULES_DIR, mod["name"], "index.html")
        try:
            with open(index_path, "r", encoding="utf-8", errors="ignore") as f:
                content = f.read()
            
            # Check for required elements
            if "esc(" not in content and "innerHTML" in content:
                issues.append(f"[XSS] {mod['name']}: innerHTML without esc()")
            
            if "console.log" in content:
                issues.append(f"[PROD] {mod['name']}: console.log found")
            
            if "dkz-premium" not in content:
                issues.append(f"[SHARED] {mod['name']}: Missing dkz-premium.js")
            
            if "hub/index.html" not in content and "hub/" not in content:
                issues.append(f"[NAV] {mod['name']}: Missing Hub link")
                
        except Exception as e:
            issues.append(f"[READ] {mod['name']}: {str(e)}")
    
    if issues:
        print(f"\n[WARN] {len(issues)} issues found:")
        for issue in issues:
            print(f"  {issue}")
    else:
        print("\n[OK] All active modules pass validation")
    
    return issues


def main():
    print("=" * 60)
    print("  DEVKiTZ Build Automation v1.0")
    print("=" * 60)
    print(f"\n  Dashboard: {DASHBOARD_ROOT}")
    print(f"  Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print()
    
    # 1. Check shared scripts
    print("[1/4] Checking shared scripts...")
    check_shared_scripts()
    
    # 2. Scan modules
    print("\n[2/4] Scanning modules...")
    modules = scan_modules()
    print(f"  Found {len(modules)} modules")
    
    # 3. Generate features.json
    print("\n[3/4] Generating features.json...")
    features = generate_features_json(modules)
    
    # 4. Validate
    print("\n[4/4] Validating modules...")
    issues = validate_modules(modules)
    
    # Summary
    print("\n" + "=" * 60)
    print("  SUMMARY")
    print("=" * 60)
    print(f"  Total Modules:  {features['stats']['total_modules']}")
    print(f"  Active:         {features['stats']['active_modules']}")
    print(f"  Empty:          {features['stats']['empty_modules']}")
    print(f"  Total Size:     {features['stats']['total_size_mb']} MB")
    print(f"  Issues:         {len(issues)}")
    print(f"  features.json:  UPDATED")
    print("=" * 60)


if __name__ == "__main__":
    main()
