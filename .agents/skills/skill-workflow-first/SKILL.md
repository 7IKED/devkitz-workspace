---
name: skill-workflow-first
description: Erzwingt dass fuer JEDE neue Aktion erst ein Skill und fuer JEDEN Arbeitsschritt erst ein Workflow erstellt wird, BEVOR die eigentliche Arbeit beginnt.
---

# Skill & Workflow First — R-NEU

> **Regel:** NIEMALS eine Aktion ausfuehren ohne vorher den passenden Skill/Workflow anzulegen.
> **Gilt fuer:** Alle Agenten (Antigravity, OpenCode, lokale LLMs)

## Wann anwenden

- Bei JEDER neuen Aktion die wiederverwendbar sein koennte
- Bei JEDEM mehrstufigen Arbeitsschritt
- BEVOR Code geschrieben, Dateien verschoben oder Systeme konfiguriert werden

## Ablauf

### Schritt 1: Pruefen
Existiert bereits ein Skill/Workflow fuer diese Aktion?
- Pruefe `.agents/skills/NAVIGATOR.md`
- Pruefe `.agents/workflows/llms.txt`
- Wenn ja → benutze den bestehenden

### Schritt 2: Skill erstellen (falls Aktion)
```
Erstelle: .agents/skills/<name>/SKILL.md
Format:
---
name: <kebab-case>
description: <Einzeiler, keine Umlaute>
---
# <Titel>
## Ablauf
...
```

### Schritt 3: Workflow erstellen (falls Arbeitsschritte)
```
Erstelle: .agents/workflows/<name>.md
Format:
---
description: <Einzeiler>
---
# <Titel>
> Wann: <Trigger>
> Ziel: <Ergebnis>
## Phase 1: ...
```

### Schritt 4: Registrieren
- Skill → `NAVIGATOR.md` + `skills/llms.txt`
- Workflow → `workflows/llms.txt`

### Schritt 5: DANN erst ausfuehren
Jetzt darfst du die eigentliche Arbeit machen!

## Regeln
- Kein Skill/Workflow = Keine Ausfuehrung
- Ausnahme: Triviale Einzeiler (z.B. `git status`)
- R27 kompatibel: "JEDE Funktion ERST als Skill/Workflow speichern"
