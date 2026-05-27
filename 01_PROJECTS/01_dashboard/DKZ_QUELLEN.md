# DkZ Quellen-Referenz — Alle Sources & Dateien

## Was ist dieses Dokument?
Eine vollständige Liste aller wichtigen Dateien im DkZ Dashboard Projekt.
Wenn du als KI-Modell eine Aufgabe bekommst, lies ZUERST die Dateien unter "Pflicht-Lektüre".

## Projekt-Root
```
c:\DEVKiTZ\01_PROJECTS\01_dashboard\
```

## 📌 Pflicht-Lektüre (vor JEDER Arbeit lesen)

| Priorität | Datei | Pfad | Inhalt |
|-----------|-------|------|--------|
| 1 | LLM_CONTEXT.md | `c:\DEVKiTZ\01_PROJECTS\01_dashboard\LLM_CONTEXT.md` | Arbeitsanweisungen für KI |
| 2 | BLAUPAUSE.md | `c:\DEVKiTZ\01_PROJECTS\01_dashboard\BLAUPAUSE.md` | Architektur-Blueprint |
| 3 | features.json | `modules/MODUL-NAME/features.json` | Nur vom aktuellen Modul |
| 4 | DKZ_CSS_V2_PRIMARY.css | `c:\DEVKiTZ\01_PROJECTS\01_dashboard\DKZ_CSS_V2_PRIMARY.css` | CSS Referenz |

## 📁 Alle Dokumentations-Dateien

| Datei | Pfad | Beschreibung |
|-------|------|-------------|
| BLAUPAUSE.md | Root | Architektur, Ordnerstruktur, 51 Module |
| LLM_CONTEXT.md | Root | KI-Arbeitsanweisungen |
| REGISTRY.json | Root | Modul-Index als JSON |
| IMPLEMENTIERUNGSPLAN.md | Root | Roadmap und Phasen |
| PLAYBOOK_ARCHIV.md | Root | Strategien, Kosten, LLM-Zuweisungen |
| WISSENSDATENBANK.md | Root | Technologie-Analyse, 2026 Stack |
| HTML_INVENTAR.md | Root | Liste aller 64 HTML-Dateien |
| DKZ_CSS_V2_PRIMARY.css | Root | CSS v2 Template (Neon Red #FF3131) |
| DKZ_CSS_V1_ALTERNATIVE.css | Root | CSS v1 Template (Classic #fa1e4e) |

## 📦 Modul-Struktur (JEDES Modul)

```
modules/modul-name/
├── index.html        ← Der gesamte Code (HTML + CSS + JS)
├── features.json     ← Feature-Status, Issues, Debug-Infos
└── _logs/            ← Änderungs-Logs (optional)
```

## 🔧 Workflows (Arbeitsanweisungen)

| Workflow | Slash-Command | Datei |
|----------|--------------|-------|
| Neues Modul erstellen | /create-module | `.agents/workflows/create-module.md` |
| Features.json pflegen | /feature-registry | `.agents/workflows/feature-registry.md` |
| CSS Template anwenden | /css-template | `.agents/workflows/css-template.md` |
| React → Vanilla konvertieren | /react-to-vanilla | `.agents/workflows/react-to-vanilla.md` |
| Modul auditieren | /audit-module | `.agents/workflows/audit-module.md` |
| Git Commit | /git-after-every-step | `.agents/workflows/git-after-every-step.md` |

## 🎨 Design-Farben Quick Reference

### v2 PRIMARY (Neuer Standard)
| Zweck | Variable | Wert | Farbe |
|-------|----------|------|-------|
| Hintergrund | --bg | #000000 | ⬛ Schwarz |
| Hintergrund-2 | --bg2 | #0a0a0a | ⬛ Fast-Schwarz |
| Karte | --card | #111111 | ⬛ Dunkelgrau |
| Karte-2 | --card2 | #1a1a1a | ⬛ Grau |
| Rand | --border | #222222 | ⬛ Grau-Rand |
| Text | --text | #ffffff | ⬜ Weiß |
| Gedämpft | --muted | #888888 | 🔘 Grau |
| Akzent | --accent | #FF3131 | 🔴 Neon Rot |
| Akzent-Hover | --accent-hover | #ff4d4d | 🔴 Helles Rot |
| Erfolg | --green | #00ff88 | 🟢 Neon Grün |
| Info | --blue | #55ACEE | 🔵 Blau |
| Warnung | --yellow | #FFB800 | 🟡 Gold |

### v1 ALTERNATIVE (Legacy)
| Zweck | Variable | Wert |
|-------|----------|------|
| Hintergrund | --bg | #0e0e10 |
| Akzent | --accent | #fa1e4e |

## 🔗 Hub Navigation

Alle Module nutzen relative Links zum Hub:
- Module → Hub: `../../hub/index.html`
- Dashboards → Hub: variiert je nach Tiefe
- Hub liegt: `c:\DEVKiTZ\01_PROJECTS\01_dashboard\hub\index.html`

## 📊 Aktuelle Statistiken (Stand 2026-03-09)

| Metrik | Wert |
|--------|------|
| Module | 52 (MOD-001 bis MOD-052) |
| Dashboards | 13 (DSH-001 bis DSH-013) |
| HTML-Dateien gesamt | 64 |
| Workflows | 6 |
| CSS Templates | 2 (v1 + v2) |
| CSS Pools | 12 Varianten |
| Nächste Modul-ID | MOD-053 |
| Nächste Feature-ID | FT-542 |
