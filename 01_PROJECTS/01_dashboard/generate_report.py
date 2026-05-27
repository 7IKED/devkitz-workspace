import json
from collections import defaultdict

def generate_report():
    with open(r"c:\DEVKiTZ\01_PROJECTS\01_dashboard\AUDIT_RESULTS.json", "r", encoding="utf-8") as f:
        data = json.load(f)

    md = []
    md.append("# 🕵️‍♂️ Exhaustiver System-Audit Report")
    md.append("> Komplett-Scan aller Dateien, Grafiken und Lizenzen im DkZ Ökosystem.")
    md.append("")
    md.append(f"**Gescannte Dateien:** {data['total_files']}\n")

    md.append("## 📊 Statistik")
    md.append(f"- HTML Dateien: {len(data['html_files'])}")
    md.append(f"- CSS Dateien: {len(data['css_files'])}")
    md.append(f"- JS Dateien: {len(data['js_files'])}")
    md.append(f"- JSON Dateien: {len(data['json_files'])}")
    md.append(f"- MD Dateien: {len(data['md_files'])}")
    md.append("")

    md.append("## 🟢 Positives (Gut implementiert)")
    if data['good']:
        good_grouped = defaultdict(list)
        for g in data['good']:
            path = g.split('] ')[0][1:]
            msg = g.split('] ')[1]
            good_grouped[msg].append(path)
            
        for msg, paths in good_grouped.items():
            md.append(f"### {msg}")
            for p in paths[:10]:
                md.append(f"- `{p}`")
            if len(paths) > 10:
                md.append(f"- *... und {len(paths)-10} weitere Dateien*")
    else:
        md.append("- Keine positiven Merkmale erfasst.")
    md.append("")

    md.append("## 🔴 Fehler & Warnungen")
    if data['errors']:
        err_grouped = defaultdict(list)
        for e in data['errors']:
            path = e.split('] ')[0][1:]
            msg = e.split('] ')[1]
            err_grouped[msg].append(path)

        for msg, paths in err_grouped.items():
            md.append(f"### ⚠️ {msg}")
            for p in paths:
                md.append(f"- `{p}`")
    else:
        md.append("- Keine Fehler gefunden!")
    md.append("")

    md.append("## 🖼️ Grafiken (Bilder & SVG)")
    if data['graphics']:
        for g in set(data['graphics']): # remove duplicates
            md.append(f"- `{g}`")
    else:
        md.append("- Keine internen Grafiken gefunden.")
    md.append("")

    md.append("## 📜 Lizenzen & Copyrights")
    if data['licenses']:
        for l in set(data['licenses']):
            md.append(f"- `{l}`")
    else:
        md.append("- Keine Lizenzen oder Copyrights gefunden!")

    with open(r"c:\DEVKiTZ\01_PROJECTS\01_dashboard\AUDIT_REPORT.md", "w", encoding="utf-8") as f:
        f.write("\n".join(md))
        
if __name__ == "__main__":
    generate_report()
    print("Report generated: AUDIT_REPORT.md")
