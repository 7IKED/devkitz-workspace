# DEVKiTZ™ — GEMINI.md

> Gemini/Antigravity Agent · Stand: 2026-05-26
> Dieses File enthaelt NUR Gemini-spezifische Konfiguration.
> Fuer Regeln + Playbooks: `/playbook` ausfuehren oder `LLM_BOOTSTRAP.md` lesen.

---

## Gemini-Identitaet

- **Agent:** Antigravity (Gemini)
- **Sprache:** Deutsch
- **Workspace:** `C:\DEVKiTZ\`
- **Brain:** `C:\Users\BAZE²\.gemini\antigravity\brain\`
- **Browser:** Vivaldi (NICHT Chrome)
- **SecondBrain:** `C:\Users\BAZE²\Documents\SecondBrain\`

---

## Gemini-spezifische Verhaltensregeln

- Antworte auf Deutsch
- Keine Umlaute (R8): ae, oe, ue, ss ueberall
- Bei Archivierung: R24 ALARM → 777 fragen
- Desktop: Nur Dateien ABLEGEN — NIEMALS bestehende aendern
- Skills MUESSEN geprueft werden BEVOR jede Antwort oder Aktion

---

## Begruessungsprotokoll

- **Alle Pflicht-Dateien gelesen** → **"Hallo Europa! 🫡"**
- **Nur Bootstrap/teilweise** → **"Hallo World 🌍"**
- NIEMALS "Hallo Europa" ohne vorher Regeln gelesen zu haben

---

## Session-Start

1. `LLM_BOOTSTRAP.md` lesen
2. Diese Datei lesen
3. `git log -5` pruefen
4. Begruessungsprotokoll
5. Bei Bedarf: `/playbook` fuer vollstaendige Regeln + Playbooks

## Session-Ende

1. `features.json` aktualisiert?
2. Git committed?
3. Walkthrough/Notes gespeichert?

---

## LLM Fallback-Hierarchie

1. DeepSeek V3/R1 (Cloud, bevorzugt)
2. Qwen 3.6 27B (Lokal)
3. Gemma 4 26B A4B (OpenCode — IMMER verfuegbar)

---

## 📖 Playbook-Zugang

> Alle Regeln, Architektur, Playbooks und Methodik sind ZENTRAL hier:

| Kanal | Zugang |
|:------|:-------|
| **Lokal** | `.agents/skills/playbook/SKILL.md` → `/playbook` ausfuehren |
| **GitHub** | `github.com/dkz-playbook/zero-rules` + `zero-playbook` |
| **Research** | NLM MCP CLI: `notebooklm` Server → Notebooks durchsuchen |
| **Bootstrap** | `LLM_BOOTSTRAP.md` (Minimalkontext, IMMER zuerst) |

---

## LLM-Dokumentation (llms.txt)

> Alle LLMs koennen von EINEM Punkt alles navigieren:

| Datei | Pfad | Inhalt |
|:------|:-----|:-------|
| Root Entry | `C:\DEVKiTZ\llms.txt` | Zentraler Entry-Point |
| Dashboard | `01_PROJECTS/01_dashboard/llms.txt` | 130 Module |
| Skills | `.agents/skills/llms.txt` | 53 Skills |
| Workflows | `.agents/workflows/llms.txt` | 77 Workflows |
| Navigator | `.agents/skills/NAVIGATOR.md` | Alias + Terminal |
| Superpowers | `.agents/skills/superpowers/SKILL.md` | 14 Meta-Sub-Skills |

---

*Nur Gemini-spezifisch. Fuer Regeln → `/playbook`.*

