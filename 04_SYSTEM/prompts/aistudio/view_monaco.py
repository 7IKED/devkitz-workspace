import json
with open(r'C:\DEVKiTZ\04_SYSTEM\prompts\aistudio\export-DEEP-sample.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

for app in data:
    title = app['title'][:50]
    print(f'=== {title} ===')
    monaco = app['content']['monaco']
    for i, m in enumerate(monaco):
        if len(m) > 5:
            print(f'  Monaco[{i}] ({len(m)} chars):')
            lines = m.split('\n')
            for line in lines[:15]:
                print(f'    {line[:120]}')
            if len(lines) > 15:
                print(f'    ... ({len(lines)} Zeilen total)')
    print()
