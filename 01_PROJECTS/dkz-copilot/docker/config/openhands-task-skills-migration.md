# OpenHands Task: AgentSkills Migration auf KVM4

> REGEL #0: NIE ERSETZEN. NIE LOESCHEN. NUR VERSIONIEREN + ARCHIVIEREN.
> Diese Datei ist die Arbeitsanweisung fuer OpenHands auf dem VPS (KVM4).

---

## Kontext

DEVKiTZ hat 53 Skills in `.agents/skills/`.
AgentSkills.io ist der offene Standard: https://agentskills.io
Kompatibilitaet aktuell: ~75% — Ziel: 100%

## Server

- VPS: KVM4 (`srv1368349.hstgr.cloud`)
- SSH: `ssh -i ~/.ssh/dkz_hostinger root@srv1368349.hstgr.cloud`
- Arbeitsverzeichnis: `/opt/dkz-skills-migration/`
- Git Repo: `https://github.com/7IKED/devkitz-workspace.git` (Branch: `skills-migration`)

## REGEL #0 (IMMER BEACHTEN!)

```
Du darfst NIEMALS Dateien ersetzen oder loeschen.
Jede Aenderung erstellt eine neue Version (datei_vYYYYMMDD.ext).
Jede "Loeschung" verschiebt ins Archiv (archive/).
Git Commit VOR jeder Aenderung.
Kein Ersetzen. Kein Loeschen. Nur Versionieren.
```

---

## Phase 1: Setup (5 Min)

```bash
# 1. Repo klonen
git clone https://github.com/7IKED/devkitz-workspace.git /opt/dkz-workspace
cd /opt/dkz-workspace

# 2. Branch erstellen (NIE auf main arbeiten!)
git checkout -b skills-migration

# 3. Arbeitsverzeichnis
mkdir -p /opt/dkz-skills-migration/{audit,output,archive}
```

## Phase 2: Audit (20 Min)

Fuer JEDEN Skill in `.agents/skills/*/SKILL.md`:

```python
# audit_skills.py — Skill-Audit nach AgentSkills Spec
import os, re, yaml, json

SKILLS_DIR = '/opt/dkz-workspace/.agents/skills'
REPORT = []

for skill_dir in sorted(os.listdir(SKILLS_DIR)):
    skill_path = os.path.join(SKILLS_DIR, skill_dir, 'SKILL.md')
    if not os.path.isfile(skill_path):
        continue
    
    with open(skill_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Parse YAML frontmatter
    match = re.match(r'^---\s*\n(.*?)\n---', content, re.DOTALL)
    if not match:
        REPORT.append({'dir': skill_dir, 'error': 'No frontmatter'})
        continue
    
    try:
        fm = yaml.safe_load(match.group(1))
    except:
        REPORT.append({'dir': skill_dir, 'error': 'Invalid YAML'})
        continue
    
    name = fm.get('name', '')
    desc = fm.get('description', '')
    issues = []
    
    # Name checks
    if name != name.lower():
        issues.append('name-not-lowercase')
    if ' ' in name:
        issues.append('name-has-spaces')
    if name != skill_dir:
        issues.append('name-dir-mismatch')
    if len(name) > 64:
        issues.append('name-too-long')
    if name.startswith('-') or name.endswith('-'):
        issues.append('name-starts-ends-hyphen')
    if '--' in name:
        issues.append('name-double-hyphen')
    if not re.match(r'^[a-z0-9][a-z0-9-]*[a-z0-9]$', name) and len(name) > 1:
        issues.append('name-invalid-chars')
    
    # Description checks
    if not desc:
        issues.append('description-missing')
    elif len(desc) > 1024:
        issues.append('description-too-long')
    
    # Optional fields check
    has_license = 'license' in fm
    has_compat = 'compatibility' in fm
    has_metadata = 'metadata' in fm
    
    # Body size check
    body = content[match.end():].strip()
    lines = body.count('\n') + 1
    
    REPORT.append({
        'dir': skill_dir,
        'name': name,
        'name_valid': len(issues) == 0 or all('name' not in i for i in issues),
        'description_len': len(desc),
        'body_lines': lines,
        'has_license': has_license,
        'has_metadata': has_metadata,
        'has_compatibility': has_compat,
        'issues': issues,
        'status': 'PASS' if not issues else 'FAIL'
    })

# Report schreiben
with open('/opt/dkz-skills-migration/audit/audit-report.json', 'w') as f:
    json.dump(REPORT, f, indent=2)

passed = sum(1 for r in REPORT if r.get('status') == 'PASS')
failed = sum(1 for r in REPORT if r.get('status') == 'FAIL')
print(f"Audit fertig: {passed} PASS, {failed} FAIL von {len(REPORT)} Skills")
```

## Phase 3: Migration (30 Min)

```python
# migrate_skills.py — Skills AgentSkills-konform machen
# REGEL #0: NUR KOPIEN erstellen, NIE Originale aendern!

import os, re, yaml, json, shutil, datetime

SKILLS_DIR = '/opt/dkz-workspace/.agents/skills'
OUTPUT_DIR = '/opt/dkz-skills-migration/output'
ARCHIVE_DIR = '/opt/dkz-skills-migration/archive'
ts = datetime.datetime.now().strftime('%Y%m%d_%H%M%S')

with open('/opt/dkz-skills-migration/audit/audit-report.json') as f:
    audit = json.load(f)

migrated = []

for skill in audit:
    if skill.get('status') == 'PASS':
        migrated.append({'dir': skill['dir'], 'action': 'SKIP', 'reason': 'Already compliant'})
        continue
    
    skill_dir = skill['dir']
    src = os.path.join(SKILLS_DIR, skill_dir)
    dst = os.path.join(OUTPUT_DIR, skill_dir)
    
    # KOPIERE den gesamten Skill-Ordner (NICHT verschieben!)
    if os.path.exists(dst):
        shutil.copytree(dst, os.path.join(ARCHIVE_DIR, f"{skill_dir}_{ts}"))
    shutil.copytree(src, dst, dirs_exist_ok=True)
    
    # Lese SKILL.md
    skill_md = os.path.join(dst, 'SKILL.md')
    with open(skill_md, 'r', encoding='utf-8') as f:
        content = f.read()
    
    match = re.match(r'^---\s*\n(.*?)\n---', content, re.DOTALL)
    fm = yaml.safe_load(match.group(1))
    body = content[match.end():]
    
    changes = []
    
    # Fix: name → lowercase, no spaces
    old_name = fm.get('name', '')
    new_name = old_name.lower().replace(' ', '-').replace('_', '-')
    new_name = re.sub(r'-+', '-', new_name).strip('-')
    if new_name != old_name:
        fm['name'] = new_name
        changes.append(f"name: '{old_name}' → '{new_name}'")
    
    # Fix: name = dir name
    if fm['name'] != skill_dir:
        fm['name'] = skill_dir
        changes.append(f"name aligned to dir: '{skill_dir}'")
    
    # Fix: description <= 1024
    desc = fm.get('description', '')
    if len(desc) > 1024:
        fm['description'] = desc[:1020] + '...'
        changes.append(f"description truncated: {len(desc)} → 1024")
    
    # Add: license (wenn fehlend)
    if 'license' not in fm:
        fm['license'] = 'MIT'
        changes.append('license: MIT added')
    
    # Add: metadata (wenn fehlend)
    if 'metadata' not in fm:
        fm['metadata'] = {
            'author': 'DEVKiTZ',
            'version': '1.0',
            'ecosystem': 'devkitz'
        }
        changes.append('metadata added')
    
    # Move custom fields to metadata
    for field in ['tags', 'risk', 'source', 'date_added']:
        if field in fm and field not in ('name', 'description', 'license', 'compatibility', 'metadata', 'allowed-tools'):
            if 'metadata' not in fm:
                fm['metadata'] = {}
            fm['metadata'][field] = fm.pop(field)
            changes.append(f"'{field}' moved to metadata")
    
    # Schreibe neue SKILL.md (in KOPIE!)
    new_content = '---\n' + yaml.dump(fm, default_flow_style=False, allow_unicode=True) + '---\n' + body
    with open(skill_md, 'w', encoding='utf-8') as f:
        f.write(new_content)
    
    migrated.append({
        'dir': skill_dir,
        'action': 'MIGRATED',
        'changes': changes
    })

# Report
with open('/opt/dkz-skills-migration/output/migration-report.json', 'w') as f:
    json.dump(migrated, f, indent=2)

skipped = sum(1 for m in migrated if m['action'] == 'SKIP')
fixed = sum(1 for m in migrated if m['action'] == 'MIGRATED')
print(f"Migration fertig: {fixed} migriert, {skipped} uebersprungen")
```

## Phase 4: Validierung (10 Min)

```bash
# Alle migrierten Skills gegen AgentSkills Spec validieren
cd /opt/dkz-skills-migration/output

for dir in */; do
    if [ -f "$dir/SKILL.md" ]; then
        name=$(head -20 "$dir/SKILL.md" | grep "^name:" | cut -d: -f2 | tr -d ' ')
        dirname=$(basename "$dir")
        
        # Check: name = dirname
        if [ "$name" != "$dirname" ]; then
            echo "FAIL: $dirname — name '$name' != dirname"
        fi
        
        # Check: name lowercase
        if echo "$name" | grep -q '[A-Z ]'; then
            echo "FAIL: $dirname — name has uppercase/spaces"
        fi
        
        echo "PASS: $dirname"
    fi
done
```

## Phase 5: Git Commit + Report (5 Min)

```bash
cd /opt/dkz-workspace
git add .agents/skills/
git commit -m "feat(skills): AgentSkills.io Standard-Migration — $(date +%Y-%m-%d)

- Name-Felder auf lowercase normalisiert
- Descriptions auf max 1024 Zeichen
- license + metadata Felder ergaenzt
- Custom Felder unter metadata verschoben
- KEINE Originale geaendert (nur Kopien)"

# NICHT auf main pushen! PR erstellen stattdessen.
git push origin skills-migration
```

## Zusammenfassung

| Phase | Dauer | Ergebnis |
|:------|:------|:---------|
| Setup | 5 Min | Repo geklont, Branch erstellt |
| Audit | 20 Min | audit-report.json |
| Migration | 30 Min | Kopien mit Fixes |
| Validierung | 10 Min | Alle PASS? |
| Git | 5 Min | Branch gepusht, PR ready |
| **Total** | **70 Min** | **AgentSkills-konform** |
