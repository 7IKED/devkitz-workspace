---
name: second-brain-sync
description: Obsidian Second Brain automatisch aktuell halten — Dailys, Logs, Research Auto-Ingest und Wissensexpansion
---

# Second Brain Sync Skill

Hält das Obsidian Second Brain (`ai-wiki`) permanent aktuell, generiert Tagesberichte und expandiert das Wissen automatisch.

## Wann nutzen
- Tagesbericht (Daily Note) erstellen oder aktualisieren
- Session-Logs archivieren
- Neues Research-Material in den Vault einpflegen
- Wissens-Gaps identifizieren und füllen
- Vault-Struktur pflegen und erweitern

## Vault-Pfad
```
C:\DEVKiTZ\02_RESEARCH\ai-wiki\
```

## Anweisungen

### 1. Vault-Struktur (Ziel)
```
ai-wiki/
├── dailys/                        # Tagesberichte
│   ├── 2026-05-13.md
│   ├── 2026-05-14.md
│   └── ...
├── logs/                          # Session- & System-Logs
│   ├── sessions/                  # Agent-Session-Protokolle
│   │   └── 2026-05-13_session-01.md
│   ├── deployments/               # Deploy-Logs
│   │   └── 2026-05-13_cloud-function.md
│   └── errors/                    # Fehler-Protokolle
│       └── 2026-05-13_build-error.md
├── skills/                        # Skill-Dokumentation (Mirror)
│   └── cloud-functions.md
├── projects/                      # Projekt-Notizen
│   └── devkitz-dashboard.md
├── research/                      # Research-Ergebnisse
│   └── [auto-generated].md
├── raw/                           # Rohdaten (bestehend)
│   └── ...
└── templates/                     # Vorlagen
    ├── daily-template.md
    ├── session-log-template.md
    └── research-template.md
```

### 2. Daily Note Format
```markdown
---
date: {{date:YYYY-MM-DD}}
type: daily
tags: [daily, log, {{date:YYYY}}, {{date:MM}}]
---

# 📅 {{date:YYYY-MM-DD}} — Tagesbericht

## 🎯 Ziele heute
- [ ] ...

## ✅ Erledigt
- ...

## 🔨 Gearbeitet an
### Projekte
- ...

### Skills & Workflows erstellt
- ...

### Deployments
- ...

## 📝 Notizen
- ...

## 🔗 Verknüpfte Sessions
- [[sessions/{{date:YYYY-MM-DD}}_session-01]]

## 📊 Metriken
| Metrik | Wert |
|:-------|:-----|
| Conversations | — |
| Commits | — |
| Deployments | — |
| Neue Skills | — |
| Research Docs | — |

## ⏭️ Morgen
- [ ] ...
```

### 3. Session-Log Format
```markdown
---
date: {{date:YYYY-MM-DD}}
type: session-log
session: {{session-id}}
agent: Antigravity
tags: [log, session, {{project}}]
---

# 🤖 Session Log — {{date:YYYY-MM-DD}} #{{nr}}

## Kontext
- **Conversation ID:** {{conversation-id}}
- **Dauer:** ~X Min
- **Agent:** Antigravity (Claude Opus 4.6)

## Aufgaben
1. ...

## Ergebnisse
- ...

## Dateien geändert
- `pfad/zur/datei.md` — Beschreibung

## Learnings
- ...

## Offene Punkte
- [ ] ...
```

### 4. Auto-Sync Trigger (wann aktualisieren)

| Trigger | Aktion |
|:--------|:-------|
| Session-Start | Daily Note erstellen (falls nicht vorhanden) |
| Skill/Workflow erstellt | In Daily Note loggen + `skills/` Mirror |
| Deployment | Deploy-Log + Daily Note Update |
| Research durchgeführt | Auto-Ingest in `research/` |
| Session-Ende | Session-Log schreiben + Daily Metriken |
| Fehler aufgetreten | Error-Log in `logs/errors/` |
| Git Commit | Commit-Info in Daily Note |

### 5. Auto-Ingest via MCP Tools

#### Research einfügen
```
mcp_devkitz-autoresearch_autoresearch:
  topic: "[Thema]"
# → Wird automatisch in ai-wiki/ gespeichert

mcp_devkitz-autoresearch_ingest_url_to_obsidian:
  url: "https://..."
  title: "Beschreibender Titel"
# → Markdown in ai-wiki/ gespeichert
```

#### Deep Research
```
mcp_dkz-n8n-research_google_deep_research:
  query: "[Forschungsfrage]"
  save: true
# → Ergebnisse in Vault gespeichert
```

### 6. Wissensexpansion (Self-Growing)

Das Second Brain wächst automatisch durch:

1. **Jede Session** → Daily + Session-Log
2. **Jeder Research-Aufruf** → Neue Markdown-Datei
3. **Jeder Skill** → Mirror-Dokument in `skills/`
4. **Jeder Deploy** → Deploy-Log
5. **Jede Fehlerbehebung** → Learnings-Eintrag
6. **Cross-Linking** → `[[wikilinks]]` zwischen Dokumenten

### 7. Vault-Pflege Commands

```bash
# Vault-Statistik
Get-ChildItem "C:\DEVKiTZ\02_RESEARCH\ai-wiki" -Recurse -File | Measure-Object | Select Count

# Dailys dieses Monats
Get-ChildItem "C:\DEVKiTZ\02_RESEARCH\ai-wiki\dailys" -Filter "2026-05-*"

# Neueste Einträge
Get-ChildItem "C:\DEVKiTZ\02_RESEARCH\ai-wiki" -Recurse -File | Sort-Object LastWriteTime -Descending | Select -First 10 Name, LastWriteTime
```

## Referenz
- Vault: `C:\DEVKiTZ\02_RESEARCH\ai-wiki\`
- Antigravity Brain: `C:\Users\BAZE²\.gemini\antigravity\brain\`
- MCP Server: `devkitz-autoresearch`, `dkz-n8n-research`
- Template-Ordner: `ai-wiki/templates/`
