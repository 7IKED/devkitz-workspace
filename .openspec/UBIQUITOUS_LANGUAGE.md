# Ubiquitous Language — DEVKiTZ Oekosystem

> Praesize Begriffe wie sie in DIESEM Projekt verwendet werden.

## Terms

- **Modul**: Ein einzelnes Dashboard-Feature als index.html in modules/[name]/
- **Shared Script**: Wiederverwendbares JS in shared/dkz-[name].js
- **Ralph-Loop**: 6-Phasen Entwicklungszyklus (LESEN > SPAWN > EXECUTE > VERIFY > COMMIT > LOOP)
- **BMAD**: Blueprint > Mapping > Analyse > Design Methodik
- **James**: Guardian Agent — ueberwacht, coded NICHT
- **DkZ Design System v2**: CSS Custom Properties fuer alle Module
- **Neon Matrix**: Gruenes Theme (#00ff88 auf #000000) fuer PWA Apps
- **features.json**: Source-of-Truth fuer Modul-Status
- **Hub**: Zentrales Dashboard (hub/index.html)
- **KERN**: D-VKITZ/KERN Repo mit allen Regeln und Patterns
- **llms.txt**: Navigation-Datei fuer LLMs
- **esc()**: XSS-Schutz-Funktion fuer innerHTML
- **TestStrasse**: Automatisierte Test-Pipeline (Playwright)
- **NanoBot**: Leichtgewichtiger Agent (JS-basiert)
- **Premium Request**: GitHub Copilot Pro Abrechnungseinheit
- **MCP Server**: Model Context Protocol Tool-Erweiterung
- **Coding Agent**: Autonomer GitHub Agent (Issue > PR)
- **VPS Pipeline**: Automatisches Deploy auf KVM8

## Anti-Terms (NICHT verwenden)

- **Component** -> Nutze **Modul** (kein React)
- **Framework** -> Nutze **Vanilla Stack** (kein React/Vue)
- **Deploy** -> Nutze **Push + Pipeline** (rsync-basiert)
- **API Key** -> Nutze **Secret** (in GitHub Settings)
- **Bug** -> Nutze **REDNOTE** (zentrale Fehlerdatenbank)
- **Sprint** -> Nutze **Ralph-Loop** (6 Phasen)

## Scope

### IN Scope
- Dashboard Module (152+)
- VPS Automatisierung
- GitHub Ecosystem (D-VKITZ)
- Second Brain (Obsidian)
- Google Drive Backup
- MCP Server Integration
- Copilot Pro Optimierung

### OUT of Scope
- Mobile Native Apps (nur PWA)
- Bezahl-APIs ohne Budget
- Third-Party SaaS (Self-hosted bevorzugt)
