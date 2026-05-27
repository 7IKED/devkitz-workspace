# DkZ AGENTS.md — Agenten-Registry

> Stand: 2026-05-18 · Zentrale Agent-Uebersicht fuer alle LLMs

---

## BMAD Agenten (7 Rollen)

| # | Agent | Aufgabe | Status |
|:--|:------|:--------|:-------|
| 1 | James™ | Guardian — ueberwacht alle, coded NICHT | ✅ Aktiv (dkz-james.js) |
| 2 | DkZ PM™ | Product Manager — spec.md, User Stories | ✅ Definiert |
| 3 | DkZ Architekt™ | plan.md, Tech-Stack | ✅ Definiert |
| 4 | DkZ Developer™ | Coder — Ralph-Loop Executor | ✅ Definiert |
| 5 | DkZ Reviewer™ | CodeRabbit — Qualitaetspruefung | ✅ Definiert |
| 6 | DkZ Tester™ | Tests + Validierung | ✅ TestStrasse v3 |
| 7 | DkZ Dokumentar™ | README, Wiki, Learnings | ✅ Definiert |

---

## NanoBot Fleet

| Bot | Datei | Zweck |
|:----|:------|:------|
| Antigravity | `nanobot-antigravity.js` | Gemini Agent Kommunikation |
| OpenCode | `nanobot-opencode.js` | OpenCode Agent Kommunikation |

---

## Health Check System

| Komponente | Pfad | Zweck |
|:-----------|:-----|:------|
| Startup Skill | `.agents/skills/startup/SKILL.md` | Session-Start Validierung |
| Checkup Skill | `.agents/skills/checkup/SKILL.md` | Deep Diagnostik |
| Health Agent | `.agents/skills/health-agent/SKILL.md` | Universeller Pruefer |
| Health Chain | `04_SYSTEM/scripts/health-check-chain.py` | Python Check-Kette |
| REDNOTE DB | `04_SYSTEM/REDNOTE.json` | Zentrale Fehlerdatenbank |
| REDNOTE Collector | `04_SYSTEM/scripts/rednote-collector.js` | Fehler-Manager CLI |
| Dashboard | `modules/system-check/index.html` | Visueller Health Monitor |

---

## Skills Registry (`.agents/skills/`)

Gesamt: 42+ Skills — siehe `ls .agents/skills/`

### Kern-Skills
- `startup` — Session-Start Check
- `checkup` — Deep Diagnostik
- `health-agent` — Universeller Pruefer
- `power` — Superpowers Lab + DDD
- `power-openspec` — OpenSpec Integration

### Entwicklungs-Skills
- `mod-builder` — Modul Generator
- `dkz-webapp-builder` — WebApp Builder
- `dkz-skillpack` — Skill-Paket Manager
- `ralph-loop-tester` — Ralph Loop Tests

### Content-Skills
- `notebooklm-integration` — NLM Batch Content
- `frontpage-builder` — Landing Pages
- `changelog-generator` — Changelogs

---

## Kommunikation

```
Agent ←→ NanoChat Bridge (Port 3040) ←→ Dashboard
  ↕                                        ↕
REDNOTE.json                          LocalStorage
```

Alle Agenten kommunizieren ueber die NanoChat Bridge.
Health-Checks laufen ueber die Python Chain oder direkt als Shell-Befehle.
