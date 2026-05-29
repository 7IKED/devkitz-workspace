# DkZ AGENTS.md — Agenten-Registry

> Stand: 2026-05-30 · 41 Agenten · Zentrale Agent-Uebersicht fuer alle LLMs

---

## BMAD Agenten (7 Rollen)

| # | Agent | Aufgabe | Team | Status |
|:--|:------|:--------|:-----|:-------|
| 1 | James Guardian | Ueberwacht alle, coded NICHT | james-guardian | Active |
| 2 | DkZ PM | Product Manager, Specs, User Stories | dkz-pm | Active |
| 3 | DkZ Architekt | plan.md, Tech-Stack | dkz-architekt | Active |
| 4 | DkZ Developer | Coder, Ralph-Loop Executor | dkz-developer | Active |
| 5 | DkZ Reviewer | CodeRabbit Qualitaetspruefung | dkz-reviewer | Active |
| 6 | DkZ Tester | Tests + Validierung (TestStrasse v3) | dkz-tester | Active |
| 7 | DkZ Dokumentar | README, Wiki, Learnings | dkz-dokumentar | Active |

---

## Builder Agenten (14)

| # | Agent | Aufgabe | Team |
|:--|:------|:--------|:-----|
| 8 | Wiki+Kanban Mega Builder | Wiki Modul (1198 Zeilen, 8 Tabs) | core-team |
| 9 | Kanban + Patterns Builder | GitHub Kanban Boards + Pattern Docs | core-team |
| 10 | LLMs.txt + GitHub Rules Builder | llms.txt Dateien + KERN Backup | docs-team |
| 11 | PWA Builder 1 (Copy+TTS+QR) | CopyPaste, TTS-Reader, QR-Scanner | core-team |
| 12 | PWA Builder 2 (Timer+Clip+Screen) | DkZ-Timer, Clipboard, Screenshot | core-team |
| 13 | MiroFish Module Builder | MiroFish Simulator Modul | ai-team |
| 14 | GitNexus Module Builder | GitNexus Explorer Modul | core-team |
| 15 | OpenHumans Module Builder | OpenHumans Hub Modul | ai-team |
| 16 | AiAiKirk Module Builder | AI Module Integration | ai-team |
| 17 | CLOUDIA Module Builder | Cloud Control Modul | infra-team |
| 18 | DEEPKEEP Module Builder | Security + Sanitizer Modul | infra-team |
| 19 | Webhook Hub Builder | Webhook Dashboard | infra-team |
| 20 | Skeleton Module Builder | Modul-Grundgerueste (Batch) | core-team |
| 21 | Module Builder (Batch) | Mehrere Module parallel | core-team |

---

## Infrastructure Agenten (8)

| # | Agent | Aufgabe | Team |
|:--|:------|:--------|:-----|
| 22 | Infrastructure Researcher | VPS + Cloud Recherche | infra-team |
| 23 | VPS Infrastructure Researcher | KVM8 Server Analyse | infra-team |
| 24 | Cloud Infrastructure Analyst | EU Cloud + Puter Planung | infra-team |
| 25 | Automation Script Builder | Python/Bash Automatisierung | infra-team |
| 26 | Python Automation Builder | vps-auto-update.py + Cron | infra-team |
| 27 | System Integration Researcher | System-Verbindungen Research | infra-team |
| 28 | OpenHands Researcher | OpenHands VPS Integration | infra-team |
| 29 | Drive Health Analyst | Google Drive Sync + Health | infra-team |

---

## GitHub Agenten (6)

| # | Agent | Aufgabe | Team |
|:--|:------|:--------|:-----|
| 30 | 7IKED Repos README Updater | 25 Repos READMEs | docs-team |
| 31 | D-VKITZ README Pusher | 11 Repos READMEs | docs-team |
| 32 | GitHub Issues Creator | Issues #208-#247 erstellen | core-team |
| 33 | Critical Issue Fixer | P1/P2 Issues automatisch fixen | core-team |
| 34 | README Generator | Batch README Generierung | docs-team |
| 35 | Git Branch Cleaner | Alte Branches aufraeumen | core-team |

---

## Analyse Agenten (6)

| # | Agent | Aufgabe | Team |
|:--|:------|:--------|:-----|
| 36 | Unfinished Work Scanner | Unfertige Module finden | dkz-reviewer |
| 37 | Brain Conversation Scanner | Antigravity Brain durchsuchen | ai-team |
| 38 | Features.json Drift Analyst | Module vs features.json Abgleich | dkz-tester |
| 39 | Workspace Structure Analyst | Ordnerstruktur analysieren | dkz-architekt |
| 40 | Git History Analyst | Git Log Auswertung | dkz-reviewer |
| 41 | Legacy Project Analyst | Alte Projekte evaluieren | dkz-reviewer |

---

## NanoBot Fleet

| Bot | Datei | Zweck |
|:----|:------|:------|
| Antigravity | nanobot-antigravity.js | Gemini Agent Kommunikation |
| OpenCode | nanobot-opencode.js | OpenCode Agent Kommunikation |
| Gemma4 2B | (integriert) | Lokales LLM Fallback |

---

## Copilot Integration

Alle Agenten koennen ueber GitHub Copilot Chat aktiviert werden:
- `.github/copilot-instructions.md` — Globale Regeln
- `.github/prompts/*.prompt.md` — Task-spezifische Prompts
- `AGENTS.md` — Agent-Definitionen fuer Copilot Coding Agent

## Delegations-Kette

```
User (Handy) -> Issues erstellen
  -> Copilot Pro (1200 Premium Requests)
    -> GitHub Coding Agent (Issues -> PRs)
    -> Gemma4 2B (lokales Fallback)
    -> VPS Auto-Update (Python Cron, 0 Requests)
```

---

## Health Check System

| Komponente | Pfad | Zweck |
|:-----------|:-----|:------|
| Startup Skill | .agents/skills/startup/SKILL.md | Session-Start Validierung |
| Checkup Skill | .agents/skills/checkup/SKILL.md | Deep Diagnostik |
| Health Agent | .agents/skills/health-agent/SKILL.md | Universeller Pruefer |
| Health Chain | 04_SYSTEM/scripts/health-check-chain.py | Python Check-Kette |
| REDNOTE DB | 04_SYSTEM/REDNOTE.json | Zentrale Fehlerdatenbank |

---

## Kommunikation

```
Agent <-> NanoChat Bridge (Port 3040) <-> Dashboard
  |                                        |
REDNOTE.json                          LocalStorage
  |
  +-> GitHub Issues (Handy-Sync)
  +-> Copilot Chat (IDE + GitHub.com)
  +-> MCP Server (VPS, Drive, Brain)
```
