"""
Phase 2: Remove UTF-8 BOM from all JSON files
Phase 4: Add missing copyright footer to all HTML files
"""
import os
import re

ROOT_DIR = r"c:\DEVKiTZ\01_PROJECTS\01_dashboard"

# ── PHASE 2: Fix UTF-8 BOM ──
bom_fixed = 0
for root, dirs, files in os.walk(ROOT_DIR):
    dirs[:] = [d for d in dirs if d not in {'.git', 'node_modules', '_logs'}]
    for file in files:
        if file.endswith('.json'):
            fp = os.path.join(root, file)
            try:
                with open(fp, 'rb') as f:
                    raw = f.read()
                if raw[:3] == b'\xef\xbb\xbf':
                    with open(fp, 'wb') as f:
                        f.write(raw[3:])
                    bom_fixed += 1
                    print(f"  BOM removed: {os.path.relpath(fp, ROOT_DIR)}")
            except Exception as e:
                print(f"  ERROR: {fp}: {e}")

print(f"\n=== BOM Fix: {bom_fixed} files fixed ===\n")

# ── PHASE 4: Add missing copyright footer ──
COPYRIGHT_COMMENT = '\n<!-- © DEVKiTZ™ 2026 — All Rights Reserved -->'
copyright_added = 0

for root, dirs, files in os.walk(ROOT_DIR):
    dirs[:] = [d for d in dirs if d not in {'.git', 'node_modules', '_logs'}]
    for file in files:
        if file.endswith('.html'):
            fp = os.path.join(root, file)
            try:
                with open(fp, 'r', encoding='utf-8') as f:
                    content = f.read()
            except UnicodeDecodeError:
                try:
                    with open(fp, 'r', encoding='cp1252') as f:
                        content = f.read()
                except:
                    continue
                    
            if '©' not in content and 'Copyright' not in content and 'DEVKiTZ' not in content:
                # Add copyright before closing </html> or at end
                if '</html>' in content:
                    content = content.replace('</html>', COPYRIGHT_COMMENT + '\n</html>')
                else:
                    content += COPYRIGHT_COMMENT + '\n'
                    
                with open(fp, 'w', encoding='utf-8') as f:
                    f.write(content)
                copyright_added += 1
                print(f"  © added: {os.path.relpath(fp, ROOT_DIR)}")

print(f"\n=== Copyright Fix: {copyright_added} files fixed ===\n")
print("Phase 2 + 4 complete.")
