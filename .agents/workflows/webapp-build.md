# 🔄 WebApp Build Workflow

> **Workflow-ID:** `webapp-build`
> **Alias:** `wab-flow`
> **Terminal:** `dkz flow:build`
> **Skills benötigt:** `dkz-webapp-builder`, `glassmorphism-3d`, `panel-system`, `canvas-engine`

---

## Ablauf

```
┌─────────────────────────────────────────┐
│ 1. SKILL CHECK                          │
│    → dkz-webapp-builder/SKILL.md lesen  │
│    → glassmorphism-3d/SKILL.md lesen    │
│    → panel-system/SKILL.md lesen        │
│    → canvas-engine/SKILL.md lesen       │
├─────────────────────────────────────────┤
│ 2. ANALYSE                              │
│    → Was soll gebaut werden?            │
│    → Welches Modul? Panel? Board?       │
│    → Welche Phase? (1-6)               │
├─────────────────────────────────────────┤
│ 3. GENERATE                             │
│    → HTML-Anker in index.html           │
│    → CSS nach Glassmorphism-Pattern     │
│    → JS nach Revealing Module Pattern   │
│    → Tooltips + Blink + Sync-Dot        │
├─────────────────────────────────────────┤
│ 4. VALIDATE                             │
│    → Qualitäts-Checkliste durchgehen    │
│    → esc() bei User-Input?              │
│    → log() bei Aktionen?               │
│    → Responsive?                        │
├─────────────────────────────────────────┤
│ 5. INTEGRATE                            │
│    → In App Shell einbinden             │
│    → Tab/Button hinzufügen              │
│    → Bottom-Bar Ticker updaten          │
├─────────────────────────────────────────┤
│ 6. COMMIT                               │
│    → git add + commit                   │
│    → feat(webapp): [Beschreibung]       │
│    → SecondBrain loggen                 │
└─────────────────────────────────────────┘
```

---

## Hyper-Prompt Template (für JEDEN LLM)

```markdown
Du bist ein DkZ™ WebApp Developer. Lies folgende Skills:
- .agents/skills/dkz-webapp-builder/SKILL.md
- .agents/skills/glassmorphism-3d/SKILL.md
- .agents/skills/panel-system/SKILL.md
- .agents/skills/canvas-engine/SKILL.md

AUFGABE: Erstelle [MODUL_NAME] für DkZ™ devkitz Web App V2.

REGELN:
1. Vanilla JS ES6+ — KEIN Framework
2. Glassmorphism auf JEDEM Container (g-card Pattern)
3. 3D Buttons (btn3d-pink/ghost/cyan)
4. data-tip Tooltip auf JEDEM interaktiven Element
5. esc() bei JEDEM User-Input
6. log() bei JEDER Aktion
7. IndexedDB für Daten, LocalStorage für Settings
8. CSS Custom Properties — KEINE hardcoded Farben
9. Responsive mit CSS Grid auto-fit
10. Commit: feat(webapp): [beschreibung]

DATEIEN:
- HTML: Anker in index.html → <div id="v-[name]" class="view">
- JS: modules/[name].js → Revealing Module Pattern
- CSS: In style.css → Glassmorphism + 3D

OUTPUT: Kompletter Code für alle Dateien.
```
