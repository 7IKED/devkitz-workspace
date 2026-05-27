# 🏭 Content Factory Workflow

> **Workflow-ID:** `content-factory-flow`
> **Alias:** `factory-flow`, `cf-flow`
> **Terminal:** `dkz flow:factory`
> **Skills:** content-factory + dkz-webapp-builder + glassmorphism-3d + panel-system + canvas-engine

---

## Trigger

Wird ausgelöst durch:
- `dkz factory:run` (Terminal)
- `@dkz-factory` (Prompt-Präfix)
- Manuell: User gibt Prompt ein

---

## Pipeline

```
┌──────────────────────────────────────────────┐
│ STEP 1: INTAKE (James™)                     │
│                                              │
│ Input: User-Prompt oder @dkz-factory Command │
│                                              │
│ Aktionen:                                    │
│  1. Prompt dekonstruieren                    │
│  2. Content-Typ bestimmen                    │
│  3. Tags + Metadata extrahieren              │
│  4. Priorität setzen                         │
│                                              │
│ Output: Task-Objekt                          │
│ {                                            │
│   type: "blog|skill|workflow|module",        │
│   title: "...",                              │
│   tags: ["..."],                             │
│   priority: 1-5,                             │
│   assignedLLM: "antigravity|gemini|claude",  │
│   skills: ["wab", "glass", "canvas"],        │
│   template: "blog-post.html"                 │
│ }                                            │
└──────────────┬───────────────────────────────┘
               │
┌──────────────▼───────────────────────────────┐
│ STEP 2: SKILL LOAD (Superpowers Check)       │
│                                              │
│ Aktionen:                                    │
│  1. Nanobot-Suche: skills/ durchsuchen       │
│  2. Relevante Skills laden                   │
│  3. Patterns extrahieren                     │
│  4. Template aus SecondBrain/templates/       │
│                                              │
│ Superpowers-Prüfung:                         │
│  □ Gibt es einen Skill dafür?               │
│  □ Skill gelesen? (NICHT überspringen!)      │
│  □ Template verfügbar?                       │
│  □ Frühere Outputs als Referenz?             │
└──────────────┬───────────────────────────────┘
               │
┌──────────────▼───────────────────────────────┐
│ STEP 3: SWARM DISPATCH (Open Swarm)          │
│                                              │
│ Routing-Logik:                               │
│                                              │
│ IF type == "module" || "ui" || "canvas"       │
│   → Antigravity (Code-Spezialist)            │
│ IF type == "skill" || "workflow" || "pattern" │
│   → Gemini (Pattern-Spezialist)              │
│ IF type == "research" || "review" || "analyse"│
│   → Claude (Analyse-Spezialist)              │
│ IF type == "blog" || "marketing" || "copy"    │
│   → ChatGPT (Kreativ-Spezialist)             │
│ IF type == "any"                              │
│   → Aktueller LLM (wer gerade aktiv ist)    │
│                                              │
│ Parallel-Tasks möglich:                      │
│   Antigravity → Code generieren              │
│   Gemini → Skill schreiben                   │
│   → Merge in SecondBrain                     │
└──────────────┬───────────────────────────────┘
               │
┌──────────────▼───────────────────────────────┐
│ STEP 4: GENERATE (Ralph Phase 3 - EXECUTE)   │
│                                              │
│ Developer™ arbeitet:                         │
│                                              │
│ Blog-Post:                                   │
│  1. HTML-Template laden                      │
│  2. Style: Cyberclean (Black + Pink/Cyan)    │
│  3. Glassmorphism Cards für Sektionen        │
│  4. Code-Blocks mit Syntax-Highlighting      │
│  5. Metadata-Header (Datum, Tags, Badges)    │
│  6. Footer mit DkZ™ Branding                │
│                                              │
│ Skill:                                       │
│  1. SKILL.md Template laden                  │
│  2. ID, Alias, Terminal-Commands definieren   │
│  3. Code-Artefakte schreiben                 │
│  4. LLM-Instruktionen formulieren            │
│  5. Checkliste erstellen                     │
│                                              │
│ Modul:                                       │
│  1. JS: Revealing Module Pattern             │
│  2. HTML: View-Anker + g-card + btn3d        │
│  3. CSS: Glassmorphism + 3D                  │
│  4. IndexedDB Store                          │
│  5. Event-Bus Integration                    │
└──────────────┬───────────────────────────────┘
               │
┌──────────────▼───────────────────────────────┐
│ STEP 5: REVIEW (Superpowers Verify)          │
│                                              │
│ Reviewer™ Checkliste:                        │
│  □ Glassmorphism auf allen Cards?           │
│  □ 3D Buttons (nicht flach)?                │
│  □ data-tip auf interaktiven Elementen?     │
│  □ esc() bei User-Input?                    │
│  □ CSS Variables (keine hardcoded Farben)?  │
│  □ Responsive (auto-fit grid)?              │
│  □ Metadata vorhanden?                      │
│  □ Links funktionieren?                     │
│  □ Keine console.log in Production?         │
│  □ Commit-Message mit feat() Präfix?        │
│                                              │
│ IF Fehler → zurück zu STEP 4                │
│ IF OK → weiter                               │
└──────────────┬───────────────────────────────┘
               │
┌──────────────▼───────────────────────────────┐
│ STEP 6: PUBLISH (Ralph Phase 5 - COMMIT)     │
│                                              │
│ Dokumentar™ arbeitet:                        │
│                                              │
│ 1. SPEICHERN                                 │
│    Blog → blog-hub/posts/[name].html         │
│    Skill → SecondBrain/skills/[name].md      │
│    Modul → dkz-webapp-v2/modules/[name].js   │
│    Daily → SecondBrain/dailys/YYYY-MM-DD.md  │
│                                              │
│ 2. GIT                                       │
│    git add + commit: feat([bereich]): [msg]  │
│                                              │
│ 3. BRAIN                                     │
│    SecondBrain Daily Note aktualisieren      │
│    Session-Log ergänzen                      │
│                                              │
│ 4. DEPLOY (optional)                         │
│    Blogger → HTML in Post einfügen           │
│    Cloud Run → dkz factory:deploy cloud      │
│    GitHub → git push                         │
│                                              │
│ 5. LOOP                                      │
│    → Nächster Task oder FERTIG               │
└──────────────────────────────────────────────┘
```

---

## Beispiel-Ausführungen

### Blog-Post erstellen:
```
dkz factory:blog "Canvas Particle Engine Dokumentation"

→ James™: Typ=blog, Skills=[canvas-engine, glassmorphism-3d]
→ Swarm: Antigravity (hat Canvas gebaut)
→ Developer™: blog-post.html Template + Canvas-Code
→ Reviewer™: Checkliste ✅
→ Dokumentar™: blog-hub/posts/canvas-engine.html + Commit
```

### Neuen Skill erstellen:
```
dkz factory:skill "color-picker"

→ James™: Typ=skill, Skills=[glassmorphism-3d, dkz-webapp-builder]
→ Swarm: Gemini (Skill-Spezialist)
→ Developer™: SKILL.md mit HSL/RAL Pattern
→ Reviewer™: Checkliste ✅
→ Dokumentar™: SecondBrain/skills/color-picker-gemini.md + Commit
```

### WebApp-Modul erstellen:
```
dkz factory:module "kalender"

→ James™: Typ=module, Skills=[wab, glass, panels]
→ Swarm: Antigravity (Code-Spezialist)
→ Developer™: modules/kalender.js + HTML-Anker + CSS
→ Reviewer™: IndexedDB? esc()? Responsive? ✅
→ Dokumentar™: dkz-webapp-v2/modules/kalender.js + Commit
```
