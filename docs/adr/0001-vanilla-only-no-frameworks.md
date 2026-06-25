# ADR 0001: Vanilla-Only — Keine Frontend-Frameworks

- **Status:** accepted
- **Datum:** 2026-06-25
- **Kontext:** Ecosystem Optimization Phase 2, Block G

## Kontext

Das DkZ Dashboard besteht aus 50+ Modulen, die als HTML-Dateien im
`01_PROJECTS/01_dashboard/modules/` Verzeichnis liegen. Jedes Modul wird zur
Laufzeit als Iframe oder per Fetch in das Dashboard geladen.

Bei der Wartung und Erweiterung dieser Module wurde festgestellt, dass
verschiedene Frameworks und Build-Tools zum Einsatz kamen:
- Vue.js (einige Module)
- React (ein Modul)
- jQuery (Legacy-Module)
- TypeScript (muss kompiliert werden)

Dies fuehrte zu folgenden Problemen:
1. **Inkonsistente Ladezeiten** — Framework-Module brauchen 2-5x laenger
2. **Kompilierung noetig** — TypeScript-Module koennen nicht direkt editiert werden
3. **Groessere Bundle-Groessen** — React/Vue bringen 50-200 KB Framework-Code
4. **Wartungsaufwand** — 4 verschiedene Build-Konfigurationen
5. **Kein SSR noetig** — Dashboard ist ein reines Client-SPA

## Entscheidung

Sae mtliche Dashboard-Module werden ausschliesslich mit Vanilla-HTML,
Vanilla-CSS und Vanilla-JS (ES2022+) erstellt.

Erlaubt:
- ES Modules (`<script type="module">`)
- CSS Custom Properties (Variablen)
- CSS Grid / Flexbox (kein Tailwind/Bootstrap)
- `fetch()` + `async/await` fuer API-Zugriffe
- `import` / `export` fuer Code-Strukturierung
- DkZ Design Tokens via `--accent`, `--neon-red`, `--bg-*` usw.

Nicht erlaubt:
- Vue.js, React, Svelte, Angular
- jQuery, Lodash, Alpine.js (keine Utility-Bibliotheken)
- TypeScript (nur Plain JS)
- Tailwind, Bootstrap (kein CSS-Framework)
- Webpack, Vite, esbuild (keine Build-Tools)
- JSX, TSX

## Konsequenzen

### Positive
- **Schnellere Ladezeiten** — Kein Framework-Overhead
- **Direkte Editierbarkeit** — Jede HTML-Datei kann sofort im Browser oder
  Editor geoeffnet werden
- **Geringere Bundle-Groesse** — Module sind 10-50 KB statt 200+ KB
- **Einheitliche Codebasis** — Gleiche Patterns in allen Modulen
- **Keine Build-Schritte** — `git clone` und loslegen
- **Zukunftssicher** — ES2022+ ist nativer Browser-Standard

### Negative
- **Weniger Developer-Okosystem** — Kein React-Devtools, kein HMR
- **Mehr Boilerplate** — Eigene State-Management-Loesung statt Vue/React
- **Keine SSR/SSG** — Aber nicht noetig (Dashboard ist Client-SPA)
- **Lernkurve** — Entwickler muessen Vanilla-JS Patterns kennen

## Ueberpruefung

Diese Entscheidung wird bei Aenderungen an Modulen durchgesetzt:
1. **Code-Review** — Neue Module muessen Vanilla-Only sein
2. **Pre-Commit Hook** — TestStrasse prueft auf Framework-Importe
3. **Module-Builder** — Der `mod-builder` Skill generiert Vanilla-HTML

## Alternativen

| Alternative | Bewertung |
|:------------|:----------|
| Vue.js fuer alle Module | Einheitlich, aber Overhead fuer kleine Module |
| Lit (Web Components) | Leichtgewichtig, aber zusaetzliche Abhaengigkeit |
| Keine Regel (Status Quo) | Fuehrte zu 4 Frameworks in 50 Modulen — abgelehnt |

## Verwandte D okumente

- `01_PROJECTS/01_dashboard/BLAUPAUSE.md` — Dashboard-Architektur
- `REGELWERK.md` — Coding Rules (Abschnitt: Stack)
- `.agents/skills/mod-builder/SKILL.md` — Modul-Generator
