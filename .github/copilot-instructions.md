# DEVKiTZ Copilot Instructions

## Project
DEVKiTZ — KI-Entwickler-Oekosystem mit 152+ Dashboard-Modulen.

## Tech Stack
- Frontend: Vanilla HTML5/CSS3/JS ES6+ (Dashboard Module)
- Optional: React+Vite+Tailwind (PWA Apps)
- Backend: Node.js 18+ / Express
- Daten: localStorage (Offline-First), DuckDB, Apache Iceberg
- Fonts: Inter (UI) + JetBrains Mono (Code)
- Farben: --accent:#fa1e4e, --bg:#000000, --green:#00ff88, --yellow:#ffb800, --red:#ff3b5c

## Coding Standards
- IMMER esc() bei User-Input vor innerHTML (XSS-Schutz)
- DkZ CSS Custom Properties — KEIN hardcoded #fa1e4e
- Shared Scripts einbinden: dkz-debug.js, dkz-guide.js, dkz-navbar.js, dkz-james.js
- features.json nach Modul-Aenderung aktualisieren
- KEINE Umlaute in Code: ae, oe, ue, ss
- KEIN console.log in Produktion
- KEIN jQuery
- EN/DE Toggle in jedem Modul
- Kontrast-Toggle in jedem Modul
- Hub-Button: <a href='../../hub/index.html'>
- <meta name='dkz-version' content='v2.00.0_01'>

## Commit Messages
Format: feat(bereich): beschreibung
Beispiele: feat(wiki): 8 Tabs, fix(ci): Deploy repariert, docs(kern): README

## File Structure
- Module: 01_PROJECTS/01_dashboard/modules/[name]/index.html
- Shared: 01_PROJECTS/01_dashboard/shared/dkz-[name].js
- Skills: .agents/skills/[name]/SKILL.md
- Workflows: .agents/workflows/[name].md

## Testing
- Playwright fuer E2E Tests
- Browser-Test mit Screenshot
- features.json Validierung

## Architecture
- 7 BMAD Agenten: James (Guardian), PM, Architekt, Developer, Reviewer, Tester, Dokumentar
- Ralph-Loop: LESEN > SPAWN > EXECUTE > VERIFY > COMMIT > LOOP
- VPS: KVM8 mit Docker, nginx, SSL
- GitHub: D-VKITZ Organisation (29 Repos)

## Documentation
- Rules: D-VKITZ/KERN/RULES.md
- Patterns: D-VKITZ/KERN/PATTERNS.md
- llms.txt Navigation: C:\DEVKiTZ\llms.txt
