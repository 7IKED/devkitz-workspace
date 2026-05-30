---
name: content-factory
description: Batch content creation pipeline for blog posts, social media, and documentation. Use when generating multiple content pieces from a single topic.
---

# 🏭 DkZ™ Content Factory — Master Skill

> **Skill-ID:** `content-factory`
> **Alias:** `factory`, `cf`, `fabrik`
> **Terminal:** `dkz skill:factory` · `dkz factory:run`
> **Version:** 1.0
> **Für:** ALLE LLMs · Superpower-Modus

---

## 🎯 Was ist die Content Factory?

Die Content Factory ist ein **automatisiertes Content-Produktionssystem**, das alle DkZ™ Methodiken vereint:

| System | Rolle in der Factory |
|:-------|:--------------------|
| **BMAD™** | 7 Agenten steuern den Workflow |
| **Ralph-Loop™** | 6-Phasen Execution Pipeline |
| **Superpowers DkZ™** | Skill-Check + Qualitätssicherung |
| **Open Swarm** | Multi-LLM Koordination |
| **SecondBrain** | Persistenz + Wissensbank |

---

## 🏗️ Architektur

```
┌─────────────────────────────────────────────────────┐
│                 CONTENT FACTORY                      │
│                                                      │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐          │
│  │  INPUT    │→│ PIPELINE │→│  OUTPUT   │          │
│  │          │  │          │  │          │          │
│  │ Prompt   │  │ BMAD™    │  │ Blog     │          │
│  │ Skill    │  │ Ralph™   │  │ Skill    │          │
│  │ Research │  │ Swarm    │  │ Doku     │          │
│  │ Template │  │ Super™   │  │ Code     │          │
│  └──────────┘  └──────────┘  └──────────┘          │
│                      │                               │
│              ┌───────▼───────┐                      │
│              │  SecondBrain  │                      │
│              │  (Persistenz) │                      │
│              └───────────────┘                      │
└─────────────────────────────────────────────────────┘
```

---

## 🤖 BMAD™ Agenten in der Factory

| # | Agent | Factory-Rolle |
|:--|:------|:-------------|
| 1 | 🎯 **James™** | Guardian — überwacht Pipeline, assigned Tasks |
| 2 | 📋 **DkZ PM™** | Nimmt Prompt entgegen → erstellt Content-Spec |
| 3 | 🏗️ **DkZ Architekt™** | Wählt Template + Skills + Output-Format |
| 4 | 👨‍💻 **DkZ Developer™** | Generiert Content (Text/Code/HTML) |
| 5 | 🔍 **DkZ Reviewer™** | Qualitätsprüfung (Checkliste) |
| 6 | 🧪 **DkZ Tester™** | Validiert Output (Links, Syntax, Rendering) |
| 7 | 📚 **DkZ Dokumentar™** | Speichert in SecondBrain + Blog |

---

## 🔄 Ralph-Loop™ in der Factory

```
┌─ Phase 1: LESEN ──────────────────────┐
│  → Prompt analysieren                  │
│  → Relevante Skills laden             │
│  → Templates aus SecondBrain holen    │
│  → Kontext aus früheren Sessions      │
└────────────────────────────────────────┘
         │
┌─ Phase 2: SPAWN ──────────────────────┐
│  → Frischer Kontext (kein Drift!)     │
│  → BMAD Agent zuweisen                │
│  → Open Swarm: LLM auswählen         │
│    Antigravity → Code, CSS, Canvas    │
│    Gemini → Skills, Workflows, Docs   │
│    Claude → Analyse, Research, Review │
└────────────────────────────────────────┘
         │
┌─ Phase 3: EXECUTE ─────────────────────┐
│  → Developer™ generiert Content        │
│  → Template füllen                     │
│  → Glassmorphism/3D anwenden           │
│  → Hyper-Prompt verarbeiten            │
└────────────────────────────────────────┘
         │
┌─ Phase 4: VERIFY ─────────────────────┐
│  → Reviewer™ prüft Qualität           │
│  → Superpowers Checkliste             │
│  → esc() bei User-Input?             │
│  → CSS Variables statt hardcoded?     │
│  → Responsive?                        │
└────────────────────────────────────────┘
         │
┌─ Phase 5: COMMIT ─────────────────────┐
│  → Git commit mit feat() Präfix       │
│  → SecondBrain aktualisieren          │
│  → Blog-Post generieren               │
│  → Daily Note ergänzen                │
└────────────────────────────────────────┘
         │
┌─ Phase 6: LOOP ───────────────────────┐
│  → Nächster Content-Task              │
│  → Oder: Deploy (Blogger / Cloud)     │
│  → Oder: Feedback → zurück zu Phase 1 │
└────────────────────────────────────────┘
```

---

## ⚡ Superpowers DkZ™ Integration

### Vor JEDEM Content-Task:
```
1. SKILL CHECK    → Welche Skills braucht dieser Task?
2. BRAINSTORMING  → Welches Format? Template? Output?
3. TDD            → Was ist das erwartete Ergebnis?
4. EXECUTE        → Content generieren
5. VERIFY         → Checkliste durchgehen
6. DAILY LOG      → In SecondBrain loggen
```

### Qualitäts-Checkliste (Superpowers):
```
□ Skill gelesen vor Ausführung?
□ Template genutzt (nicht from scratch)?
□ DkZ Design System angewendet?
□ esc() bei dynamischen Inhalten?
□ Responsive (auto-fit grid)?
□ Metadata vorhanden (Titel, Datum, Tags)?
□ In SecondBrain geloggt?
□ Git committed?
□ Blog-ready HTML generiert?
```

---

## 🐝 Open Swarm — Multi-LLM Verteilung

### LLM-Spezialisierung
```
┌─ Antigravity ─────────────────────────┐
│ STARK: Code, CSS, Canvas, 3D, UI     │
│ NUTZE FÜR: Module, Panels, Animationen│
│ SCHREIBT: .js, .css, .html, index.*  │
└────────────────────────────────────────┘

┌─ Gemini Code Assist ──────────────────┐
│ STARK: Skills, Patterns, Architektur  │
│ NUTZE FÜR: Skill-Dateien, Workflows  │
│ SCHREIBT: *-gemini.md, SKILL.md      │
└────────────────────────────────────────┘

┌─ Claude ──────────────────────────────┐
│ STARK: Analyse, Research, Long-Form   │
│ NUTZE FÜR: Dokumentation, Reviews    │
│ SCHREIBT: *-claude.md, REVIEW.md     │
└────────────────────────────────────────┘

┌─ ChatGPT ─────────────────────────────┐
│ STARK: Kreativ, Marketing, Copy      │
│ NUTZE FÜR: Blog-Posts, Social Media  │
│ SCHREIBT: *-gpt.md, posts/*.html     │
└────────────────────────────────────────┘
```

### Swarm-Koordination
```
James™ → Analysiert Task
       → Wählt besten LLM
       → Verteilt Sub-Tasks
       → Sammelt Outputs
       → Merged in SecondBrain
```

---

## 📦 Content-Typen

| Typ | Template | Output | Ziel |
|:----|:---------|:-------|:-----|
| 📝 **Blog Post** | `blog-post.html` | Styled HTML | Blogger |
| 📐 **Blaupause** | `blueprint.html` | Tech-Doku HTML | Blogger + SecondBrain |
| 🔧 **Skill** | `SKILL.md` | Markdown | SecondBrain/skills/ |
| 🔄 **Workflow** | `workflow.md` | Markdown | .agents/workflows/ |
| 📋 **Daily** | `daily.md` | Markdown | SecondBrain/dailys/ |
| 📊 **Report** | `report.html` | Styled HTML | Blogger |
| 🧪 **Research** | `research.md` | Markdown | SecondBrain/research/ |
| 💻 **Modul** | `module.js` | JS + HTML + CSS | dkz-webapp-v2/modules/ |

---

## 🚀 Factory starten

### Hyper-Prompt (Copy-Paste für jeden LLM):
```
@dkz-factory MODUS:superpower METHODE:bmad+ralph+swarm

AUFGABE: [Beschreibung]
TYP: [blog|skill|workflow|modul|research|daily]
FORMAT: [html|md|js]
ZIEL: [blogger|secondbrain|webapp|github]

KONTEXT:
- Lies: Documents\SecondBrain\skills\NAVIGATOR.md
- Lies: .agents\skills\dkz-webapp-builder\SKILL.md
- Template: [template-name]

QUALITÄT: superpower-checkliste anwenden
DEPLOY: [blogger|cloud|lokal]
```

### Beispiel:
```
@dkz-factory MODUS:superpower METHODE:bmad+ralph+swarm

AUFGABE: Erstelle einen Blog-Post über die Canvas Engine
TYP: blog
FORMAT: html
ZIEL: blogger+secondbrain

KONTEXT:
- Lies: SecondBrain\skills\canvas-engine.md
- Lies: SecondBrain\skills\canvas-engine-gemini.md
- Template: blog-post.html

QUALITÄT: superpower-checkliste anwenden
DEPLOY: blogger
```

---

## ⌨️ Terminal-Shortcuts

```
dkz factory:run              → Factory starten (interaktiv)
dkz factory:blog [thema]     → Blog-Post generieren
dkz factory:skill [name]     → Neuen Skill erstellen
dkz factory:workflow [name]  → Neuen Workflow erstellen
dkz factory:module [name]    → WebApp-Modul erstellen
dkz factory:daily            → Daily Note erstellen
dkz factory:research [topic] → Research-Dokument
dkz factory:deploy [ziel]    → Deploy (blogger/cloud/github)
dkz factory:status           → Pipeline-Status
dkz factory:queue             → Task-Queue anzeigen
```

---

## 📋 Factory-Workflow (Komplett)

```
USER → Prompt
  │
  ├─ James™ → TASK ANALYSE
  │   ├─ Typ erkennen (blog/skill/modul/...)
  │   ├─ Skills zuordnen (Nanobot-Suche)
  │   ├─ LLM wählen (Open Swarm)
  │   └─ Template laden
  │
  ├─ PM™ → SPEC ERSTELLEN
  │   ├─ Content-Spec (was genau?)
  │   ├─ Output-Format (HTML/MD/JS)
  │   └─ Ziel (Blogger/SecondBrain/GitHub)
  │
  ├─ Architekt™ → PLAN
  │   ├─ Dateistruktur
  │   ├─ Abhängigkeiten
  │   └─ Integration
  │
  ├─ Developer™ → GENERATE (Ralph Phase 3)
  │   ├─ Template füllen
  │   ├─ Code generieren
  │   ├─ Styling anwenden
  │   └─ Content schreiben
  │
  ├─ Reviewer™ → CHECK (Superpowers Phase 5)
  │   ├─ Qualitäts-Checkliste
  │   ├─ DkZ Design System
  │   └─ Security (esc())
  │
  ├─ Tester™ → VALIDATE
  │   ├─ HTML Syntax
  │   ├─ Links prüfen
  │   └─ Rendering testen
  │
  └─ Dokumentar™ → PUBLISH (Ralph Phase 5)
      ├─ Git commit
      ├─ SecondBrain loggen
      ├─ Blog deployen
      └─ Daily Note updaten
```

---

*Die Content Factory vereint ALLE DkZ™ Methodiken in einer automatisierten Pipeline.*
*JEDER LLM kann sie nutzen. JEDER Output landet im selben SecondBrain.*
