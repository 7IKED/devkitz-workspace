"""
Phase 3: Inject esc() XSS protection into all HTML files missing it
"""
import os
import re

ROOT_DIR = r"c:\DEVKiTZ\01_PROJECTS\01_dashboard"

ESC_FUNCTION = """
    // DkZ XSS Protection
    function esc(s) {
      const d = document.createElement('div');
      d.appendChild(document.createTextNode(s));
      return d.innerHTML;
    }"""

fixed = 0
skipped = 0

for root, dirs, files in os.walk(ROOT_DIR):
    dirs[:] = [d for d in dirs if d not in {'.git', 'node_modules', '_logs'}]
    for file in files:
        if not file.endswith('.html'):
            continue
        fp = os.path.join(root, file)
        try:
            with open(fp, 'r', encoding='utf-8') as f:
                content = f.read()
        except UnicodeDecodeError:
            try:
                with open(fp, 'r', encoding='cp1252', errors='replace') as f:
                    content = f.read()
            except:
                continue

        # Skip if already has esc function
        if 'function esc(' in content or 'function esc (' in content:
            skipped += 1
            continue

        # Skip if no <script> tag (pure HTML without JS)
        if '<script>' not in content and '<script ' not in content:
            continue

        # Find the first <script> block and inject esc() at the top
        match = re.search(r'(<script[^>]*>)', content)
        if match:
            insert_pos = match.end()
            content = content[:insert_pos] + ESC_FUNCTION + content[insert_pos:]
            
            with open(fp, 'w', encoding='utf-8') as f:
                f.write(content)
            fixed += 1
            rel = os.path.relpath(fp, ROOT_DIR)
            print(f"  esc() injected: {rel}")

print(f"\n=== XSS Fix: {fixed} files patched, {skipped} already had esc() ===")
