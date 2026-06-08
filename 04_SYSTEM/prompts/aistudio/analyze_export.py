import json, sys

with open(r'C:\DEVKiTZ\04_SYSTEM\prompts\aistudio\export-FINAL.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

print("=== STICHPROBE: App-Details ===")
for app in data['apps'][:5]:
    title = app.get('page_title', app.get('title', '?'))
    print(f"\n--- {title} ---")
    print(f"  ID: {app.get('id', '?')[:30]}")
    print(f"  Text-Laenge: {app.get('text_length', 0)}")
    tas = app.get('textareas', [])
    print(f"  Textareas: {len(tas)}")
    for i, ta in enumerate(tas):
        preview = ta[:200].replace('\n', ' ') if ta else '(leer)'
        print(f"    [{i}] {len(ta)} chars: {preview[:200]}")
    tp = app.get('text_preview', '')[:300]
    print(f"  Text-Preview: {tp}")

print("\n=== PROMPT-Details ===")
for pr in data['prompts']:
    print(f"\n--- {pr['title']} ---")
    txt = pr.get('text', '')
    print(f"  Text: {len(txt)} Zeichen")
    print(f"  Preview: {txt[:500]}")

# Gesamtstatistik
total_chars = sum(app.get('text_length', 0) or 0 for app in data['apps'])
total_chars += sum(len(pr.get('text', '')) for pr in data['prompts'])
print(f"\n=== STATISTIK ===")
print(f"Gesamt Text: {total_chars} Zeichen ({total_chars/1024:.1f} KB)")
print(f"Apps mit 0 Zeichen: {sum(1 for a in data['apps'] if not a.get('text_length'))}")
print(f"Apps mit <1000 Zeichen: {sum(1 for a in data['apps'] if (a.get('text_length') or 0) < 1000)}")
print(f"Apps mit >3000 Zeichen: {sum(1 for a in data['apps'] if (a.get('text_length') or 0) > 3000)}")
