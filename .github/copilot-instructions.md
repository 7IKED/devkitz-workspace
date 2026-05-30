# DEVKiTZ Copilot Instructions

> Zentrale Konfiguration fuer GitHub Copilot Coding Agent + Chat.
> Alle Agenten, Skills und Workflows sind hier referenziert.

## WICHTIG: Context Bridge

Lies `.github/CONTEXT_BRIDGE.md` fuer aktuellen Kontext von Antigravity (Gemini Agent).
Dort stehen: letzte Aktionen, offene Aufgaben, Session-Historie.

Bei JEDEM PR/Issue den du erstellst:
1. @7IKED erwaehnen mit konkreter Aufgabe
2. CONTEXT_BRIDGE.md mit deiner Aktion updaten
3. Referenz auf den Antigravity-Kontext angeben

## Custom Agents (via @name)

- `@dkz-builder` — Module bauen/reparieren (`.github/agents/dkz-builder.agent.md`)
- `@dkz-infra` — VPS/Docker/CI (`.github/agents/dkz-infra.agent.md`)
- `@dkz-docs` — README/Wiki/Changelog (`.github/agents/dkz-docs.agent.md`)
- `@dkz-reviewer` — Code Review (`.github/agents/dkz-reviewer.agent.md`)

## Projekt

DEVKiTZ — KI-Entwickler-Oekosystem mit 152+ Dashboard-Modulen.
Organisation: D-VKITZ (29 Repos) | Owner: @7IKED

## Tech Stack (VERBINDLICH)

- Frontend: Vanilla HTML5/CSS3/JS ES6+ (Dashboard Module)
- Optional: React+Vite+Tailwind (PWA Apps — NUR mit Genehmigung)
- Backend: Node.js 18+ / Express
- Daten: localStorage (Offline-First), DuckDB, Apache Iceberg
- Fonts: Inter (UI) + JetBrains Mono (Code) via Google Fonts
- Farben: --accent:#fa1e4e, --bg:#000000, --green:#00ff88, --yellow:#ffb800, --red:#ff3b5c

## Coding Standards (EISERN)

- IMMER esc() bei User-Input vor innerHTML (XSS-Schutz)
- DkZ CSS Custom Properties — KEIN hardcoded #fa1e4e
- Shared Scripts einbinden: dkz-debug.js, dkz-guide.js, dkz-navbar.js, dkz-james.js
- features.json nach Modul-Aenderung aktualisieren
- KEINE Umlaute in Code: ae, oe, ue, ss
- KEIN console.log in Produktion
- KEIN jQuery ohne Ruecksprache
- EN/DE Toggle in jedem Modul
- Kontrast-Toggle in jedem Modul
- Hub-Button: <a href='../../hub/index.html'>
- <meta name='dkz-version' content='v2.00.0_01'>

## Commit Messages

Format: feat(bereich): beschreibung
Beispiele: feat(wiki): 8 Tabs, fix(ci): Deploy repariert, docs(kern): README

## PR-Regeln

- IMMER @7IKED als Reviewer zuweisen
- IMMER @7IKED im PR-Body erwaehnen mit Aufgabe
- PR-Template nutzen (.github/PULL_REQUEST_TEMPLATE.md)
- Branch-Format: feat/beschreibung oder fix/beschreibung

## File Structure

- Module: 01_PROJECTS/01_dashboard/modules/[name]/index.html
- Shared: 01_PROJECTS/01_dashboard/shared/dkz-[name].js
- Skills: .agents/skills/[name]/SKILL.md
- Workflows: .agents/workflows/[name].md
- Prompts: .github/prompts/[name].prompt.md

## Architecture

- 7 BMAD Agenten: James (Guardian), PM, Architekt, Developer, Reviewer, Tester, Dokumentar
- 41 Agenten insgesamt (siehe AGENTS.md)
- Ralph-Loop: LESEN > SPAWN > EXECUTE > VERIFY > COMMIT > LOOP
- OpenSpec: GRILL > PROPOSE > DESIGN > TASKS > BUILD > TEST > COMMIT
- VPS: KVM8 mit Docker, nginx, SSL
- GitHub: D-VKITZ Organisation (29 Repos)

## Skills (54 verfuegbar)

Pfad: .agents/skills/[name]/SKILL.md

### Kern-Skills
| Skill | Zweck |
|:------|:------|
| startup | Session-Start Health-Check |
| checkup | Tiefe Fehlersuche |
| health-agent | Universeller Pruefer |
| playbook | Regeln + Methodik laden |
| power | POWER MODE — 1.442 Awesome-Skills |
| superpowers | 14 Sub-Skills (Brainstorming, TDD, Debug) |
| superpowers-dkz | DkZ-adaptierte Superpowers |

### Builder-Skills
| Skill | Zweck |
|:------|:------|
| mod-builder | Neue Dashboard-Module |
| mcp-builder | MCP Server erstellen |
| frontpage-builder | Landing Pages |
| changelog-generator | Changelogs aus Git |
| builder-install | GitHub Repos integrieren |

### Analyse-Skills
| Skill | Zweck |
|:------|:------|
| anal | Wochen-Analyse + Aktionsplan |
| chatsearch | Chat-Sessions durchsuchen |
| autoresearch | Karpathy AutoResearch |

### Integration-Skills
| Skill | Zweck |
|:------|:------|
| notebooklm-integration | NotebookLM Research Lab |
| second-brain-sync | Obsidian Sync |
| account-connector | API-Keys verwalten |
| dkz-power-openspec | OpenSpec Workflow |
| grill-with-docs | Architektur-Interview |

### Session-Skills
| Skill | Zweck |
|:------|:------|
| byebye | Session beenden |
| rebye | Session wiedereinstieg |
| handoff | Agent-Uebergabe |

## Workflows (78 verfuegbar)

Pfad: .agents/workflows/[name].md

### Haeufig verwendet
| Workflow | Zweck |
|:---------|:------|
| /startup | Session-Start |
| /build | Feature bauen |
| /create-module | Neues Modul |
| /browser-test | Browser-Test |
| /git-after-every-step | Git nach jedem Schritt |
| /system-check | System-Pruefung |
| /byebye | Session beenden |
| /debug2 | Stress-Test |
| /openspec | Spec-Driven Dev |
| /superpowers | Meta-Skills |

### Build + Deploy
| Workflow | Zweck |
|:---------|:------|
| /css-template | DkZ Design System anwenden |
| /widget-create | Dashboard Widget |
| /chart-create | Charts/Grafiken |
| /form-validate | Formular-Validierung |
| /drag-drop | Drag & Drop |
| /pwa-setup | PWA Setup |
| /react-to-vanilla | React zu Vanilla konvertieren |

### Infrastructure
| Workflow | Zweck |
|:---------|:------|
| /ssh-connect | SSH zu Hostinger |
| /docker-manage | Docker Container |
| /server-health | Server Check |
| /cloud-run-deploy | Cloud Run Deploy |
| /cloud-function-deploy | Cloud Function |
| /n8n-deploy | n8n Workflow |
| /backup | DkZ Backup |

### Content + Docs
| Workflow | Zweck |
|:---------|:------|
| /nlm-batch | NLM Batch Content |
| /blog-deploy | Blog Template |
| /seo-optimize | SEO |
| /video-create | Video Content |
| /frontpage-create | Landing Page |

## MCP Server (5 Definitionen)

Pfad: .mcp/servers.json

| Server | Tools |
|:-------|:------|
| devkitz-vps | get_vps_status, restart_container, check_ssl |
| devkitz-modules | list_modules, scan_features, validate_module |
| devkitz-drive | search_drive, backup_folder, sync_second_brain |
| devkitz-brain | search_notes, create_daily, link_references |
| devkitz-github | create_issue, list_prs, sync_kanban |

## Delegations-Kette

```
@7IKED (Handy) -> Issues/PRs erstellen + reviewen
  -> Copilot Pro (1200 Premium Requests/Monat)
    -> GitHub Coding Agent (Issue -> PR mit @7IKED Mention)
    -> Gemma4 2B (lokales Fallback, 0 Requests)
    -> VPS Auto-Pipeline (Python Cron, 0 Requests)
```

## Wichtige Dateien

| Datei | Pfad | Zweck |
|:------|:-----|:------|
| AGENTS.md | AGENTS.md | 41 Agenten Registry |
| RULES.md | D-VKITZ/KERN/RULES.md | Regeln |
| PATTERNS.md | D-VKITZ/KERN/PATTERNS.md | Patterns |
| PLAYBOOK.md | D-VKITZ/KERN/PLAYBOOK.md | Playbook |
| llms.txt | llms.txt | LLM Navigation |
| features.json | 01_PROJECTS/01_dashboard/features.json | Modul-Status |

## Notifications

Bei JEDER Aktion die @7IKED betrifft:
1. PR erstellen -> @7IKED als Reviewer + Kommentar mit Aufgabe
2. Issue updaten -> @7IKED erwaehnen wenn Action Required
3. CI failed -> Issue mit @7IKED erstellen
4. Review fertig -> @7IKED Kommentar mit Ergebnis
