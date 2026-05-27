# 📋 DKZ PLAYBOOK V1 — Classic Foundation

> **Version:** v1.0.0 · **Stand:** 2026-05-10 · **Autor:** DkZ devkitz
> **Zweck:** Kern-Regeln + Output-Standards + Design System Basics
> **Geltungsbereich:** Alle Module, Dashboards, Dokumentationen
> **Status:** 🟢 VERBINDLICH

---

## SEKTION 01 — OUTPUT-FORMATIERUNG

### 1.1 Der 7-Block-Standard

Jeder strukturierte Output folgt diesem Schema:

| # | Block | Pflicht | Inhalt |
|:--|:------|:--------|:-------|
| 1 | **Metadaten-Header** | ✅ JA | Tags, Projekt, Kategorie, Version, Datum |
| 2 | **Einführung / Problem** | ✅ JA | Kontext setzen, Relevanz erklären |
| 3 | **Ziel / Nutzen** | ✅ JA | Was wird erreicht |
| 4 | **Strukturierte Erklärung** | ✅ JA | Kerninhalt, Analyse, Details |
| 5 | **Visuelle Darstellung** | ✅ JA | Tabelle, Diagramm, Code-Block |
| 6 | **Anwendung / Beispiel** | 💡 EMPF. | Praxisbezug, Use-Case |
| 7 | **Fazit + Next Steps** | ✅ JA | Zusammenfassung, Weiterführung |

### 1.2 Metadaten-Header

```markdown
---
📋 METADATEN
├─ 🏷️ Projekt:    [Projektname]
├─ 📂 Kategorie:  [A–P Code] — [Name]
├─ 📌 Version:    v[major].[minor].[session]_[step]
├─ 📅 Datum:      [YYYY-MM-DD]
├─ 👤 Autor:      [Ersteller]
├─ 🚦 Status:     [🟢 AKTIV | 🟡 DEV | 🔴 ARCHIV]
├─ 🏷️ Tags:       #tag1 #tag2 (min. 10)
---
```

---

## SEKTION 02 — STATUS-AMPEL

| Symbol | Status | Farbe |
|:-------|:-------|:------|
| 🟢 | AKTIV / OK | `#00FF88` |
| 🟡 | IN ARBEIT / DEV | `#FFB800` |
| 🔴 | FEHLER / ARCHIV | `#FF3366` |
| 🔵 | INFO / GEPLANT | `#55ACEE` |

---

## SEKTION 03 — DkZ™ DESIGN SYSTEM

### 3.1 Farben

```css
:root {
    --accent: #fa1e4e;
    --accent-soft: rgba(250, 30, 78, 0.12);
    --bg: #060608;
    --bg-card: rgba(18, 18, 24, 0.85);
    --text-primary: #e8e8ec;
    --text-secondary: #8a8a9a;
    --green: #00ff88;
    --yellow: #ffb800;
    --red: #ff3b5c;
    --blue: #3b82f6;
}
```

### 3.2 Fonts

```css
--font-main: 'Inter', sans-serif;
--font-mono: 'JetBrains Mono', monospace;
```

### 3.3 Effekte

```css
--radius-sm: 8px;
--radius-md: 12px;
--radius-lg: 16px;
--shadow-card: 0 8px 32px rgba(0, 0, 0, 0.4);
backdrop-filter: blur(20px);  /* Glassmorphism */
```

---

## SEKTION 04 — CODING-REGELN

### 4.1 XSS-Schutz (PFLICHT)

```javascript
function esc(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}
// Niemals: element.innerHTML = userInput;
// Immer:   element.innerHTML = esc(userInput);
```

### 4.2 IMMER

- `esc()` bei JEDEM User-Input vor innerHTML
- DkZ™ CSS Variables nutzen
- Shared Scripts einbinden
- `features.json` nach Modul-Änderung aktualisieren
- Git Commit nach JEDER Änderung

### 4.3 NIEMALS

- `99_ARCHIVE/` Dateien löschen
- React, Vue, Angular, Tailwind, jQuery verwenden
- `console.log` in Produktion
- Breaking Changes ohne Ankündigung
- Desktop-Dateien ändern (nur ABLEGEN)

---

## SEKTION 05 — MODUL-STANDARD

Jedes Modul MUSS:

1. `index.html` mit DkZ™ Design System
2. `features.json` mit MOD-ID und allen Features
3. `README.md` mit Beschreibung
4. In `REGISTRY.json` registriert sein
5. In `BLAUPAUSE.md` eingetragen sein
6. **PORTABLE:** Voll lauffähig als Einzeldatei

---

## SEKTION 06 — TAG-SYSTEM

### 6.1 Kategorien

| Code | Kategorie | Beschreibung |
|:-----|:----------|:-------------|
| A | A-Admin | Systemverwaltung |
| B | B-Build | Build-Prozesse |
| C | C-Code | Programmierung |
| D | D-Data | Datenmanagement |
| E | E-Eval | Evaluierung |
| F | F-Front | Frontend |
| G | G-Guide | Anleitungen |
| H | H-Hub | Hub-Systeme |
| K | K-Konfig | Konfiguration |
| L | L-Log | Protokolle |
| M | M-Modul | Module |
| P | P-Prompt | Prompts |

### 6.2 Pflicht-Tags (Minimum 10)

```
#dkz #devkitz #[kategorie] #[modul] #[feature] 
#[tech] #[status] #[version] #[datum] #[autor]
```

---

## SEKTION 07 — GIT-WORKFLOW

### 7.1 Commit-Präfixe

| Präfix | Verwendung |
|:-------|:-----------|
| `feat` | Neues Feature |
| `fix` | Bug gefixt |
| `docs` | Dokumentation |
| `chore` | Wartung |
| `refactor` | Umstrukturierung |
| `test` | Tests |

### 7.2 Naming Convention

- Module: `lowercase-bindestrich/`
- Scripts: `dkz-[funktion].js`
- Commits: `feat(bereich): beschreibung`
- Offizielle Namen mit ™: `DEVKiTZ™`, `James™`, `BotNet™`

---

## SEKTION 08 — SHARED SCRIPTS

| Script | Zweck |
|:-------|:------|
| `dkz-theme.css` | Dark-Theme, CSS Variables |
| `dkz-navbar.js` | Hamburger-Menu, Navigation |
| `dkz-debug.js` | Funktionstest, Stresstest |
| `dkz-guide.js` | Onboarding-Guide |
| `dkz-crosslinks.js` | Modul-Verlinkung |
| `dkz-prompt-hub.js` | Prompt-Speicher |
| `dkz-copilot.js` | KI-Copilot |
| `dkz-james.js` | James™ Guardian |

---

## SEKTION 09 — R24 ALARM

Wenn archiviert werden soll:
1. ❌ STOPP — Aktion NICHT ausführen
2. 📢 R24 ALARM melden
3. ⏳ Auf 777 Genehmigung warten
4. ✅ Erst nach Bestätigung ausführen

---

## SEKTION 10 — ORDNERSTRUKTUR

```
C:/DEVKiTZ/
├── 01_PROJECTS/01_dashboard/     ← Dashboard + Module
├── 02_RESEARCH/                  ← Forschung
├── 04_SYSTEM/                    ← Blaupausen + Playbook
├── ONTHERUN/                     ← MCP Server
├── [DEEPKEEP]/                   ← Archiv
├── [WORKSPACE]/                  ← GitHub Hub
└── 99_ARCHIVE/                   ← NIEMALS LÖSCHEN
```

---

> **📌 Version:** V1 Classic Foundation
> **🚦 Status:** 🟢 VERBINDLICH
> **✨ DkZ devkitz** — „Vorausschauend. Direkt. Klar. Innovativ."
