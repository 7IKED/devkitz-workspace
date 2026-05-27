# 📖 DKZ PLAYBOOK V2 — Standard Edition

> **Version:** v2.03.2 · **Stand:** 2026-05-10 · **Autor:** DkZ devkitz
> **Zweck:** Vollständiges Regelwerk — V1 + BMAD + Orchestrierung + Workflows
> **Geltungsbereich:** Alle Systeme im DEVKiTZ™ Ökosystem
> **Status:** 🟢 VERBINDLICH

---

## 📋 Inhalt

- [V1-Kern](#v1-kern) — Output, Design, Coding, Module
- [BMAD™ Methodik](#bmad-methodik) — 7 Agenten
- [Ralph-Loop™](#ralph-loop) — 6 Phasen
- [ONTHERUN™ + NEXUZ™](#ontherun--nexuz) — MCP + Gateway
- [Phasen-Pflicht](#phasen-pflicht) — Implementierungs-Workflow
- [Prompt-Hub](#prompt-hub) — 344 Templates
- [Navigation & Notes](#navigation--notes) — Hamburger + Notizen
- [Persistenz-Regeln](#persistenz-regeln) — Session-Übergabe
- [WissenHub + Research](#wissenhub--research) — Dual-Datenbank
- [Workflows & Skills](#workflows--skills) — 19 Workflows, 5 Skills
- [Post-Implementation](#post-implementation) — §47 Workflow

---

## V1-Kern

> Alle V1-Regeln gelten unverändert. Siehe [DKZ_PLAYBOOK_V1.md](./DKZ_PLAYBOOK_V1.md)

**Kurzfassung der 10 Goldenen Regeln:**

| # | Regel |
|:--|:------|
| 1 | `esc()` bei JEDEM User-Input |
| 2 | DkZ™ CSS Variables |
| 3 | Git Commit nach JEDER Änderung |
| 4 | Shared Scripts einbinden |
| 5 | `features.json` updaten |
| 6 | TestCafe Tests |
| 7 | Playbook §-Eintrag |
| 8 | `99_ARCHIVE/` nur ablegen |
| 9 | Kein React/Vue/Angular |
| 10 | R24 ALARM |

---

## BMAD™ Methodik

**BMAD = Blueprint → Mapping → Analyse → Design**

### Die 7 Agenten

| # | Agent | Rolle | Verantwortung |
|:--|:------|:------|:-------------|
| 1 | 🎯 James™ | Guardian | Überwacht Constitution, coded NICHT |
| 2 | 📋 DkZ PM™ | Product Manager | spec.md, User Stories |
| 3 | 🏗️ DkZ Architekt™ | Architektur | plan.md, Tech-Stack |
| 4 | 👨‍💻 DkZ Developer™ | Coder | Ralph-Loop Executor |
| 5 | 🔍 DkZ Reviewer™ | CodeRabbit | esc()? DkZ CSS? features.json? |
| 6 | 🧪 DkZ Tester™ | Validierung | Tests + Fehlerreports |
| 7 | 📚 DkZ Dokumentar™ | Dokumentation | README, Wiki, Learnings |

### Full Planning Path

```
/dkz-brief → /dkz-prd → /dkz-spec → /dkz-architecture → /dkz-tasks → 777 Review → Ralph-Loop
```

---

## Ralph-Loop™

**6 Phasen — Stafford Beer VSM System 2:**

```
1. LESEN    → prd.json + constitution + AGENTS.md
2. SPAWN    → Neue Instanz (frischer Kontext!)
3. EXECUTE  → Developer™ schreibt Code
4. VERIFY   → Tester™/Reviewer™ prüft
5. COMMIT   → Git commit + prd.json update
6. LOOP     → Nächster Task
```

### VSM Architektur

| System | Funktion | Datei |
|:-------|:---------|:------|
| S5 | Identität / Gesetze | constitution.md |
| S4 | Zukunft / Specs | spec.md + plan.md |
| S3 | Management / Agenten | bmad-agents.md |
| S2 | Koordination / Loop | Ralph-Loop + prd.json |
| S1 | Operation / Coding | Developer™ Instanz |

---

## ONTHERUN™ + NEXUZ™

### ONTHERUN™ MCP Server

- **Port:** 9880
- **Tech:** Node.js + Express + MCP SDK
- **Tools:** 34+ (LLM-Chat, Eval, Research, File-Ops)
- **Provider:** 8+ (OpenAI, Claude, Gemini, Groq, Mistral, HuggingFace, NVIDIA, Local)

### NEXUZ™ Gateway

- **Port:** 3040
- **Funktion:** REST Bridge zwischen Frontend und ONTHERUN™
- **Auth:** API-Keys + RBAC
- **Features:** Rate-Limiting, Audit-Log, WebSocket (geplant)

---

## Phasen-Pflicht

### 5-Phasen-Workflow (§17)

```
Phase 1: PLANUNG    → Blaupause, spec.md, plan.md
Phase 2: BUILD      → Code schreiben nach Plan
Phase 3: REGISTER   → features.json, REGISTRY.json, BLAUPAUSE.md
Phase 4: VERIFY     → Tests, Browser-Check, Stresstest
Phase 5: COMMIT     → Git, Push, Docs, Playbook
```

---

## Prompt-Hub

- **344 Templates** in 35 Kategorien
- **Source Tags:** gen | arc | eng | chat | loop | import
- **API:** `DkzPromptHub.save()`, `.load()`, `.search()`, `.export()`
- **Datei:** `shared/dkz-prompt-templates.js` — **UNDELETABLE** (R100)

---

## Navigation & Notes

- **Hamburger ☰:** Fixiert oben links, Glassmorphism Panel
- **Notes API:** `DkzNotes.add(id, text, 'system')`
- **Review API:** `DkzReview.setStatus(id, 'review')`
- **Eingebunden in 86+ Dateien**

---

## Persistenz-Regeln

### Bei Session-Start IMMER:
1. `/startup` Workflow ausführen
2. `git log -5` prüfen
3. Bestehende Archive NUTZEN
4. ORDNER.ini lesen

### Bei Session-Ende IMMER:
1. ✅ CLAUDE.md aktuell?
2. ✅ GEMINI.md aktuell?
3. ✅ features.json aktualisiert?
4. ✅ Git committed?
5. ✅ Artefakte verankert?
6. ✅ Walkthrough gespeichert?

---

## WissenHub + Research

### Dual-Database System (R30)

```
Dokument erstellt
     │
     ├──→ 1. WissenHub (Iceberg)
     │       modules/wissen-hub/archive/[rubrik]/
     │
     └──→ 2. Research Archive
             modules/research-archive/master-index.json
```

### 7 Rubriken

| Typ | Tag |
|:----|:----|
| 📋 Task | `task` |
| 📖 Walkthrough | `walkthrough` |
| 📐 Impl-Plan | `impl-plan` |
| 🏗️ Blueprint | `blueprint` |
| 📝 Scratch | `scratch` |
| 🔬 Research | `research` |
| 📊 Report | `report` |

---

## Workflows & Skills

### 19 Workflows (Auswahl)

| Workflow | Zweck |
|:---------|:------|
| `/startup` | Session-Start |
| `/build` | Feature bauen |
| `/create-module` | Neues Modul |
| `/browser-test` | Browser-Test |
| `/audit-module` | Modul prüfen |
| `/git-after-every-step` | Git nach jedem Schritt |

### 5 Skills

| Skill | Zweck |
|:------|:------|
| AutoResearch | Autonome Recherche |
| Builder Install | GitHub Repos integrieren |
| Karpathy Optimizer | Meta-Skill Optimierung |
| Social Search | Reddit/X/GitHub/YouTube |
| Content Creator | Swarm Content Pipeline |

---

## Post-Implementation

### §47 — Build → Test → Deploy → Verify

```
Version bumpen → Tests schreiben → Tests ausführen → Bugs fixen
→ Build → Deploy → Verify → Git Commit → Git Push
→ GitHub Release → CHANGELOG → README → Playbook → PR erstellen
```

### 12-Punkte Checkliste

```
□ 1. Version in package.json gebumpt
□ 2. TestCafe Tests geschrieben + alle grün
□ 3. Build erstellt
□ 4. EXE deployed + verifiziert
□ 5. Git commit
□ 6. Git push origin
□ 7. GitHub Release (bei Major/Minor)
□ 8. CHANGELOG.md aktualisiert
□ 9. README.md aktualisiert
□ 10. Playbook §-Eintrag
□ 11. task.md + walkthrough.md
□ 12. GitHub Issues/Kanban aktualisiert
```

---

## 📊 Statistiken

| Metrik | Wert |
|:-------|:-----|
| Dashboard-Module | 89+ |
| Shared Scripts | 34+ |
| Prompt Templates | 344 |
| Wiki-Einträge | 4.121 |
| GitHub Issues | 26+ |
| Workflows | 19 |
| Skills | 5 |

---

> **📌 Version:** V2 Standard (v2.03.2)
> **🚦 Status:** 🟢 VERBINDLICH
> **✨ DkZ devkitz** — „Vorausschauend. Direkt. Klar. Innovativ."
