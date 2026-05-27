# 🎯 DKZ PLAYBOOK ZERO — Essential Quick Reference

> **Version:** ZERO · **Stand:** 2026-05-10 · **Autor:** DkZ devkitz
> **Zweck:** Minimale Referenz — alles auf 1 Seite · Für schnelle Orientierung
> **Status:** 🟢 VERBINDLICH

---

## ⚡ Die 10 Goldenen Regeln

| # | Regel | Keyword |
|:--|:------|:--------|
| 1 | `esc()` bei JEDEM User-Input vor innerHTML | **XSS-Schutz** |
| 2 | DkZ™ CSS Variables nutzen — kein Hardcoded | **Design System** |
| 3 | Git Commit nach JEDER Änderung | **Versionierung** |
| 4 | Shared Scripts einbinden | **Wiederverwendung** |
| 5 | `features.json` nach Modul-Änderung updaten | **Registry** |
| 6 | TestCafe Tests schreiben + ausführen | **Qualität** |
| 7 | Playbook §-Eintrag nach neuem Feature | **Dokumentation** |
| 8 | `99_ARCHIVE/` nur ablegen — NIEMALS löschen | **Persistenz** |
| 9 | Kein React, Vue, Angular — nur Vanilla | **Stack** |
| 10 | R24 ALARM vor Archivierung | **Sicherheit** |

---

## 🎨 Design Tokens (DkZ™ v2)

```css
--accent: #fa1e4e;    /* Neonrot */
--bg: #060608;        /* Hintergrund */
--green: #00ff88;     /* OK */
--yellow: #ffb800;    /* Degraded */
--red: #ff3b5c;       /* Offline */
--font-main: 'Inter';
--font-mono: 'JetBrains Mono';
```

---

## 🔄 Post-Implementation Workflow

```
Version bumpen → Tests schreiben → Tests ausführen → Bugs fixen
→ Build → Deploy → Verify → Git Commit → Git Push
→ GitHub Release → CHANGELOG → README → Playbook
```

---

## 📝 Commit-Präfixe

```
feat(modul): Neues Feature
fix(modul):  Bug gefixt
docs:        Dokumentation
chore:       Wartung
refactor:    Umstrukturierung
test:        Tests
```

---

## 📁 Wichtige Pfade

| Was | Pfad |
|:----|:-----|
| Dashboard | `01_PROJECTS/01_dashboard/` |
| Module | `01_PROJECTS/01_dashboard/modules/` |
| Shared | `01_PROJECTS/01_dashboard/shared/` |
| Playbook | `04_SYSTEM/DKZ_PLAYBOOK.md` |
| Archiv | `99_ARCHIVE/` |

---

## 🧪 TestCafe Quick Start

```bash
npm install --save-dev testcafe
npx testcafe chrome:headless tests/
```

---

## 📐 Modul-Checkliste (Neues Modul)

```
□ index.html mit DkZ™ Design
□ features.json mit MOD-ID
□ README.md
□ In REGISTRY.json eingetragen
□ In BLAUPAUSE.md eingetragen
□ Git committed
□ TestCafe Tests geschrieben
```

---

## 🏷️ Naming

- Module: `lowercase-bindestrich/`
- Scripts: `dkz-[funktion].js`
- Commits: `feat(bereich): beschreibung`
- Offizielle Namen: IMMER mit ™

---

> **📌 Version:** ZERO (Minimal Essential)
> **🚦 Status:** 🟢 VERBINDLICH
> **✨ DkZ devkitz** — „Vorausschauend. Direkt. Klar. Innovativ."
