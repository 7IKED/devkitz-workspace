import os
import json
import re

ROOT_DIR = r"c:\DEVKiTZ\01_PROJECTS\01_dashboard"

# Paths
registry_path = os.path.join(ROOT_DIR, "REGISTRY.json")
blaupause_path = os.path.join(ROOT_DIR, "BLAUPAUSE.md")
impl_path = os.path.join(ROOT_DIR, "IMPLEMENTIERUNGSPLAN.md")

# 1. READ REGISTRY
try:
    with open(registry_path, "r", encoding="utf-8-sig") as f:
        registry_data = json.load(f)
    registry_modules = set(registry_data.get("tree", {}).keys())
except Exception as e:
    registry_modules = set()
    print("Error reading REGISTRY.json:", e)

# 2. READ BLAUPAUSE
blaupause_modules = set()
try:
    with open(blaupause_path, "r", encoding="utf-8") as f:
        blau_content = f.read()
    # Extract modules mentioned in backticks like `json-formatter` or `modules/json-formatter`
    matches = re.findall(r'`([^`]+)`', blau_content)
    for m in matches:
        if m.startswith('modules/'):
            blaupause_modules.add(m)
        elif not m.startswith('dkz-') and not ' ' in m and not m.upper() == m and m.islower() and '-' in m:
            blaupause_modules.add(f"modules/{m}")
except Exception as e:
    print("Error reading BLAUPAUSE.md:", e)

# 3. READ IMPLEMENTIERUNGSPLAN
impl_modules = set()
try:
    with open(impl_path, "r", encoding="utf-8") as f:
        impl_content = f.read()
    # Extract headers like `### 🎨 color-picker`
    matches = re.findall(r'### [^\s]+ ([^\n]+)', impl_content)
    for m in matches:
        names = [n.strip() for n in m.split('·')]
        for name in names:
             if ' ' not in name and name.islower():
                 impl_modules.add(f"modules/{name}")
except Exception as e:
    print("Error reading IMPLEMENTIERUNGSPLAN.md:", e)

# 4. READ FILESYSTEM
fs_modules = set()
modules_dir = os.path.join(ROOT_DIR, "modules")
if os.path.exists(modules_dir):
    for d in os.listdir(modules_dir):
        if os.path.isdir(os.path.join(modules_dir, d)):
            fs_modules.add(f"modules/{d}")
            
# specific dashboards from registry to check
for p in registry_modules:
    if not p.startswith("modules/"):
        fs_modules.add(p) if os.path.exists(os.path.join(ROOT_DIR, p)) else None


# 5. CROSS-REFERENCE
redlist = []
log = []

all_known = registry_modules.union(blaupause_modules).union(impl_modules).union(fs_modules)
# filter out noise from regex
all_known = {k for k in all_known if ' ' not in k and '{' not in k and '\\' not in k}

log.append("# 📋 Dokumentations-Audit Log")
log.append(f"> Generiert durch Cross-Reference Scan in `c:\\DEVKiTZ\\01_PROJECTS\\01_dashboard`\n")

log.append("## 🔍 Alle erkannten Module & Dashboards\n")

for mod in sorted(all_known):
    in_reg = "✅" if mod in registry_modules else "❌"
    in_blau = "✅" if mod in blaupause_modules else "❌"
    in_impl = "✅" if mod in impl_modules else "❌"
    in_fs = "✅" if mod in fs_modules else "❌"
    
    # Check if files exist
    index_exists = os.path.exists(os.path.join(ROOT_DIR, mod, "index.html")) if mod in fs_modules else False
    json_exists = os.path.exists(os.path.join(ROOT_DIR, mod, "features.json")) if mod in fs_modules else False
    
    idx_str = "✅" if index_exists else "🔴"
    jsn_str = "✅" if json_exists else "🔴"
    
    status = f"| `{mod}` | {in_reg} | {in_blau} | {in_impl} | {in_fs} | {idx_str} (index) | {jsn_str} (json) |"
    log.append(status)
    
    if "❌" in [in_reg, in_blau, in_impl, in_fs] or False in [index_exists, json_exists]:
        issues = []
        if mod not in registry_modules: issues.append("Fehlt in REGISTRY.json")
        if mod not in blaupause_modules and mod.startswith('modules/'): issues.append("Fehlt in BLAUPAUSE.md")
        if mod not in impl_modules and mod.startswith('modules/'): issues.append("Fehlt in IMPLEMENTIERUNGSPLAN.md")
        if mod not in fs_modules: issues.append("Fehlt auf Festplatte (Ordner fehlt)")
        if mod in fs_modules and not index_exists: issues.append("Keine index.html gefunden")
        if mod in fs_modules and not json_exists: issues.append("Keine features.json gefunden")
        
        # Don't flag high-level dashboards for missing in impl/blau pause if they are not expected there
        if not mod.startswith("modules/"):
             issues = [i for i in issues if not "Fehlt in" in i or "REGISTRY" in i]
             
        if issues:
            redlist.append(f"- **`{mod}`**: {', '.join(issues)}")

# WRITE OUTPUT
log.insert(2, "| Modul/Dashboard | REGISTRY | BLAUPAUSE | IMPL.PLAN | Ordner | Files |")
log.insert(3, "|-----------------|----------|-----------|-----------|--------|-------|")

with open(os.path.join(ROOT_DIR, "AUDIT_LOG_DOCS.md"), "w", encoding="utf-8") as f:
    f.write("\n".join(log))

redlist_out = ["# 🚨 REDLIST — Diskordanzen & Fehler", "> Was in den Dokumentationen fehlt oder kaputt ist.\n"]
if redlist:
    redlist_out.extend(redlist)
else:
    redlist_out.append("✅ Keine Fehler gefunden! Alles synchron.")

with open(os.path.join(ROOT_DIR, "REDLIST.md"), "w", encoding="utf-8") as f:
    f.write("\n".join(redlist_out))

print("Audit finished. Created REDLIST.md and AUDIT_LOG_DOCS.md")
