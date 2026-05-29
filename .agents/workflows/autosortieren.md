---
description: AutoSortierer — 5-Zonen Datei-Automatisierung mit DEEPKEEP Tresor und Blog-Publisher
---

# /autosortieren — CLOUDIA AutoSortierer v2.0

> **Wann:** Workspace aufraeumen, Dateien sortieren, Research publishen
> **Was:** 5-Zonen System mit DEEPKEEP Tresor, Google Sheets Protokoll, Blog Auto-Publish
> **Regeln:** R2, R8, R24

---

## Quick Commands

```powershell
# 1. Scan — Zeigt was passieren WUERDE (sicher!)
python .agents/scripts/cloudia-auto.py --scan

# 2. Einzelne Zone testen (Dry-Run)
python .agents/scripts/cloudia-auto.py --check-inbox        # ZONE A
python .agents/scripts/cloudia-auto.py --resort             # ZONE B
python .agents/scripts/cloudia-auto.py --manage-archive     # ZONE C
python .agents/scripts/cloudia-auto.py --sort-loose         # ZONE D
python .agents/scripts/cloudia-auto.py --tag-old-research   # Research

# 3. Alles ausfuehren (ACHTUNG!)
python .agents/scripts/cloudia-auto.py --full --execute

# 4. Blog Publisher
python .agents/scripts/blog-publisher.py --scan              # Research scannen
python .agents/scripts/blog-publisher.py --publish           # Dry-Run
python .agents/scripts/blog-publisher.py --publish --execute # Publishen
```

---

## 5 Zonen

| Zone | Ordner | Regel |
|:-----|:-------|:------|
| PROTECTED | [DEEPKEEP], [WORKSPACE], 06_NOTEPAD, 09_BRAIN*, Dot-Ordner | Niemals anfassen |
| A | 00_INBOX | Dateien > 30 Tage → DEEPKEEP + Bereich |
| B | 01-08 | Nur REINSORTIEREN, Research NIEMALS Archiv |
| C | 99_ARCHIVE | Reintun + Naming + Rausstellen |
| D | Lose (ohne 00-99) | Original → DEEPKEEP, Kopie → Bereich |

---

## Config

Regelwerk als JSON: `.agents/scripts/autosortierer-config.json`

Aenderbar OHNE Code zu aendern:
- Protected-Listen
- Extension-zu-Bereich Mapping
- 30-Tage Grenze
- Google Sheets URL

---

## Blog Publisher

Research mit Quellenangaben → automatisch auf Blogger DEEPKEEP releasen.

Config: `.agents/scripts/blog-publisher-config.json`

Blogger API konfigurieren:
```json
{
  "blogger_blog_id": "DEIN_BLOG_ID",
  "blogger_api_key": "DEIN_API_KEY"
}
```

Oder via Apps Script:
```json
{
  "apps_script_url": "https://script.google.com/macros/s/DEIN_SCRIPT/exec"
}
```

Fallback: Lokale HTML-Dateien in `02_RESEARCH/_blog_drafts/`
