---
name: power
description: "POWER MODE — Aktiviert alle Superpowers. Trigger: 'power'. Fusioniert DkZ™ Superpowers mit 1.442+ Awesome-Skills. Skills MÜSSEN geprüft werden BEVOR jede Antwort oder Aktion."
tags: [power, superpowers, skills, meta, activation]
risk: safe
source: "DEVKiTZ + antigravity-awesome-skills"
date_added: "2026-05-14"
---

<EXTREMELY-IMPORTANT>
Wenn du auch nur 1% Chance siehst, dass ein Skill relevant sein könnte, MUSST du ihn aufrufen.
WENN EIN SKILL ZU DEINEM TASK PASST, HAST DU KEINE WAHL. DU MUSST IHN NUTZEN.
Das ist nicht verhandelbar. Das ist nicht optional. Du kannst dich NICHT herausreden.
</EXTREMELY-IMPORTANT>

# ⚡ POWER MODE — Superpowers Aktiviert

> Fusioniert DkZ™ Superpowers-Methodik mit 1.442+ antigravity-awesome-skills.
> Trigger: Sage einfach **"power"** um diesen Modus zu aktivieren.

---

## Kern-Prinzip

**Skills IMMER prüfen BEVOR du antwortest oder handelst.**
Auch bei 1% Chance, dass ein Skill relevant ist → MUSS er invoked werden.

## Priorität

1. **User-Anweisungen** (GEMINI.md, CLAUDE.md, REGELWERK.md) — höchste Priorität
2. **DkZ™ eigene Skills** (`.agents/skills/`) — überschreiben Standard-Verhalten
3. **Awesome-Skills** (`~/.gemini/antigravity/skills/`) — erweiterte Fähigkeiten
4. **Default System Prompt** — niedrigste Priorität

---

## Skill-Lookup Workflow

```
1. TRIGGER     → User sagt "power" oder startet eine Aufgabe
2. SCAN        → Prüfe BEIDE Skill-Libraries:
                  a) DkZ™ Skills: .agents/skills/ (28+ eigene)
                  b) Awesome-Skills: ~/.gemini/antigravity/skills/ (1.442+)
3. MATCH       → Finde relevante Skills zum Task
4. ANNOUNCE    → "⚡ POWER: Verwende [skill-name] für [zweck]"
5. EXECUTE     → Folge den Skill-Anweisungen EXAKT
6. VERIFY      → Prüfe Ergebnis, dokumentiere Learnings
```

---

## DkZ™ Superpowers Workflow (Pflicht-Reihenfolge)

```
1. BRAINSTORMING    → Idee → Design → Spec (BEVOR Code!)
2. WRITING-PLANS    → Bite-sized Tasks (2-5 Min pro Task)
3. EXECUTION        → Subagent oder Inline, Task für Task
4. TDD              → RED → GREEN → REFACTOR
5. CODE-REVIEW      → Nach jedem Task prüfen
6. VERIFICATION     → Verifizieren BEVOR "fertig" gesagt wird
7. COMMIT           → Git Commit nach jeder Änderung
```

---

## Skill-Library Übersicht

### DkZ™ Eigene Skills (`.agents/skills/`)

| Skill | Trigger |
|:------|:--------|
| `superpowers-dkz` | Agenten-Methodik (diese Basis) |
| `autoresearch` | Tiefe Recherche mit Karpathy-Methodik |
| `cloud-functions` | GCP Cloud Functions erstellen/deployen |
| `mcp-builder` | MCP Server erstellen |
| `second-brain-sync` | Obsidian Vault aktualisieren |
| `hyperreal-ui` | 8K UI-Animationen |
| `frontpage-builder` | Landing Pages erstellen |
| `social-search` | Reddit, X, GitHub, YouTube durchsuchen |
| `swarm-content-creator` | Autonome Content-Erstellung |
| `builder-install` | Externe Repos integrieren |
| `webapp-testing` | Playwright Frontend-Tests |
| `changelog-generator` | Changelogs aus Git-Commits |
| `karpathy-optimizer` | Meta-Skill Optimierung |

### Awesome-Skills Highlights (`~/.gemini/antigravity/skills/`)

| Kategorie | Skills | Beispiele |
|:----------|:-------|:----------|
| 🏗️ Architektur | 50+ | `architecture`, `clean-code`, `design-taste-frontend` |
| 🔒 Security | 80+ | `api-security-best-practices`, `pentest-checklist`, `xss-html-injection` |
| 🧪 Testing | 40+ | `tdd-workflow`, `e2e-testing`, `playwright-skill` |
| 🤖 AI/ML | 60+ | `langchain-architecture`, `rag-engineer`, `llm-ops` |
| 🌐 Frontend | 100+ | `react-patterns`, `threejs-skills`, `tailwind-design-system` |
| ⚙️ Backend | 80+ | `nodejs-best-practices`, `fastapi-pro`, `golang-pro` |
| 📊 DevOps | 60+ | `docker-expert`, `kubernetes-architect`, `terraform-skill` |
| 📝 Content | 40+ | `seo-content-writer`, `blog-writing-guide`, `copywriting` |
| 🔍 Debugging | 30+ | `systematic-debugging`, `phase-gated-debugging`, `debugger` |
| 📐 Planning | 20+ | `brainstorming`, `plan-writing`, `concise-planning` |
| 🛠️ Tools | 100+ | `n8n-workflow-patterns`, `github-actions-templates`, `mcp-builder` |

---

## Red Flags (STOP — du rationalisierst!)

| Gedanke | Realität |
|:--------|:---------|
| "Nur eine einfache Frage" | Fragen sind Tasks. Skills prüfen. |
| "Ich brauche erstmal Kontext" | Skill-Check KOMMT VOR Klärungsfragen. |
| "Lass mich erstmal den Code anschauen" | Skills sagen dir WIE du schaust. |
| "Das braucht keinen formellen Skill" | Wenn ein Skill existiert → nutze ihn. |
| "Ich kenne diesen Skill" | Skills ändern sich. Aktuelle Version lesen. |
| "Der Skill ist übertrieben" | Einfache Dinge werden komplex. Nutze ihn. |
| "Ich mache erstmal nur das eine" | Check BEVOR du IRGENDWAS tust. |
| "Das fühlt sich produktiv an" | Undisziplinierte Aktion verschwendet Zeit. |
| "Ich weiß was das heißt" | Konzept kennen ≠ Skill nutzen. Invoke! |

---

## Systematic Debugging (4 Phasen)

```
Phase 1: ROOT CAUSE  → Fehler lesen, reproduzieren, Beweise sammeln
Phase 2: PATTERN     → Arbeitende Beispiele finden, vergleichen
Phase 3: HYPOTHESIS  → Eine Theorie, minimal testen
Phase 4: FIX         → Test schreiben, fixen, verifizieren
```

**Eisernes Gesetz:** KEINE Fixes ohne Root-Cause-Analyse!
**3+ Fixes gescheitert?** → Architektur hinterfragen, nicht weiterfixen.

---

## Skill-Typ Erkennung

**Rigid** (TDD, Debugging, Security): Folge EXAKT. Keine Abweichung.
**Flexible** (Patterns, Design): Passe Prinzipien an Kontext an.

Der Skill selbst sagt dir welcher Typ er ist.

---

## Aktivierung

Sage einfach eines dieser Wörter:
- **"power"** → Aktiviert POWER MODE
- **"superpowers"** → Aktiviert POWER MODE  
- **"skills an"** → Aktiviert POWER MODE

Nach Aktivierung:
1. ⚡ Alle Skills werden gescannt
2. 🎯 Relevante Skills automatisch geladen
3. 🚀 Workflow startet nach Superpowers-Methodik

---

## Referenz

- DkZ™ Skills: `C:\DEVKiTZ\.agents\skills\`
- Awesome-Skills (global): `C:\Users\BAZE²\.gemini\antigravity\skills\`
- Awesome-Skills (workspace): `C:\DEVKiTZ\.agents\skills\awesome-skills\`
- Superpowers Original: `C:\DEVKiTZ\02_RESEARCH\superpowers\`
- Obsidian Vault: `C:\DEVKiTZ\02_RESEARCH\ai-wiki\`

---

*⚡ POWER MODE — 1.470+ Skills bereit. Brainstorming vor Code. Plans vor Execution.*
