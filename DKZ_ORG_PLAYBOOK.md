# ⚡ GitHub Organisation DkZ Playbook

> Zentrale Richtlinien für das DkZ-Ökosystem und die GitHub-Organisation
> Stand: 2026-06-14

## 1. Vision & Mission
Das DkZ-Ökosystem (DEVKiTZ™) ist eine vollständige, autarke KI-Entwickler-Umgebung, fokussiert auf Vanilla Webtechnologien, performante Microservices und ein robustes "BMAD" (Blueprint → Mapping → Analyse → Design) Agenten-Netzwerk.

## 2. GitHub Hub & Repositories
Die GitHub-Organisation dient als Single Source of Truth für:
- **Zero-Rules**: Die absoluten Basis-Regeln für alle Agenten (`dkz-playbook/zero-rules`).
- **Dashboard Modules**: Die 130+ Vanilla HTML5 Module (Glassmorphism, Dark-Mode).
- **NanoBots**: Die dezentrale Flotte aus Sub-Agenten (James™, Antigravity, OpenCode, etc.).

## 3. Tech Stack & Architektur
- **Frontend**: Vanilla HTML5 + CSS3 + JS ES6+. KEINE Frameworks (React, Vue) erlaubt!
- **CSS**: DkZ Design System v2 mit CSS Custom Properties (`--bg: #060608`, `--accent: #fa1e4e`).
- **Backend**: Node.js 18+ (API Gateway Port 3040), Go Iceberg (Port 9881).
- **Daten**: LocalStorage (Offline-First) + DuckDB.

## 4. Ralph-Loop™ Workflow
Jeder Task im DkZ-Netzwerk folgt einem 6-Phasen-Loop:
1. **LESEN**: `prd.json`, `constitution`, `AGENTS.md`
2. **SPAWN**: Neue Instanz (frischer Kontext)
3. **EXECUTE**: Code schreiben (Developer™)
4. **VERIFY**: Testen & Validieren (Tester™/Reviewer™)
5. **COMMIT**: Git commit + `prd.json` Update
6. **LOOP**: Nächster Task

## 5. Security & SSO
- **XSS-Schutz**: Nutzung von `esc()` vor *jedem* `innerHTML`.
- **SSO**: Keine hardcodierten Mistral- oder SSO-Referenzen in Dashboards! Authentifizierung läuft exklusiv über `dkz-auth.js` / API Gateway.
- **Keys**: Nur `NEXUZ.getToken()` oder ENV-Variablen. Keine raw Keys im Code.

## 6. Kommunikationsprotokoll
- Agenten kommunizieren über Port `3040` (WebSocket NanoChat Bridge).
- Bots (wie `@antigravity` und `@opencode`) operieren dezentral, hören auf den Broadcast und antworten autark.
- **DkZ Guardian (James™)** überwacht den Flow und bewertet Code nach den DkZ-Quality-Rules.

## 7. Archivierung & Persistenz (Rule 12 & 29)
Nichts geht verloren. Jede Session, jede Code-Änderung und jeder Chat-Log wird in:
- `99_ARCHIVE/`
- `.gemini/antigravity/brain/...`
- Lokale `LocalStorage` / `IndexedDB`
synchronisiert und für den CoPilot/Agent-Handoff vorbereitet.

---
*End of Playbook.*
