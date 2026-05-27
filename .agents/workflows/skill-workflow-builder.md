# DkZ™ Skill/Workflow Builder — Orchestrierungsregeln

> Automatische Skill-Discovery, Matching, Clone, Erstellung
> Version: 1.0.0 · Stand: 2026-05-16

---

## 🔄 Workflow bei JEDER Aufgabe

```
1. SCAN    → Bestehende Skills durchsuchen (skills/ Ordner)
2. MATCH   → Relevanz prüfen (Tags, Name, Beschreibung)
3. DECIDE  → Perfekt? → Nutzen
             Ok? → Clonen + Anpassen
             Nein? → Neu bauen
4. EXECUTE → Skill/Workflow ausführen
5. LOG     → Builder-Log aktualisieren
6. SAVE    → Output als Snippet prüfen + ggf. speichern
```

---

## 📐 Entscheidungsmatrix

| Situation | Aktion | Metadaten |
|:----------|:-------|:----------|
| Perfekter Skill existiert | Direkt nutzen | `usageCount++` |
| Skill passt mit Anpassung | **Clonen** → neuen Skill anlegen | `origin: "cloned:SKILL-XXX"` |
| Kein passender Skill | **Neu bauen** mit Builder | `origin: "original"` |
| Skill 1x benutzt | Als **Vorlage** speichern | `template: true, rating: "estimate"` |
| Output ist speichernswert | In **Snippet-Speicher** ablegen | `type: "snippet"` |

---

## 📋 Skill-Metadaten Schema

```json
{
  "id": "SKILL-YYYY-MMDD-NNN",
  "name": "skill-name-kebab",
  "displayName": "Skill Display Name",
  "type": "skill|workflow|snippet|template|playbook",
  "origin": "original|cloned:SKILL-XXX",
  "cloneSource": null,
  "tags": ["category", "tool", "pattern"],
  "triggers": ["/command", "pattern-match", "auto"],
  "usageCount": 0,
  "rating": "estimate|tested|production",
  "created": "2026-05-16",
  "lastUsed": null,
  "author": "antigravity|claude|777",
  "patterns": ["pattern-file.md"],
  "checklist": ["step-1", "step-2"],
  "description": "Was dieser Skill macht"
}
```

---

## 🏗️ Workflow-Struktur

Ein Workflow besteht aus:

1. **Skills** — Einzelne Fähigkeiten für Unterschritte
2. **Patterns** — Wiederverwendbare Anweisungstexte
3. **Orchestrierung** — Reihenfolge + Abhängigkeiten
4. **Checkliste** — Prüfpunkte pro Schritt
5. **Trigger** — Wie der Workflow gestartet wird

```yaml
workflow:
  name: "research-to-guide"
  trigger: "/research"
  steps:
    - skill: "youtube-analyzer"
      input: "video-url"
      output: "analysis.md"
    - skill: "guide-builder"
      input: "analysis.md"
      output: "guide.md"
    - skill: "blog-publisher"
      input: "guide.md"
      output: "blog-url"
  checklist:
    - "Video vollständig analysiert?"
    - "Guide hat actionable Steps?"
    - "Blog-Post veröffentlicht?"
```

---

## 📦 Vorlagen-System

### Vorlage speichern (nach 1. Nutzung):
```json
{
  "template": true,
  "templateName": "Research-to-Guide Pipeline",
  "estimatedRating": 4,
  "notes": "Gut für YouTube-Video Analyse",
  "reusable": true
}
```

### Vorlage abrufen:
- Builder prüft Vorlagen-Index vor Neuerstellung
- Vorlagen werden nach Rating sortiert
- Top-Vorlage wird vorgeschlagen

---

## 📝 Builder-Log (Autopilot)

Jeder Builder-Aufruf wird geloggt:

```json
{
  "timestamp": "2026-05-16T01:50:00Z",
  "action": "create|clone|use|template",
  "skillId": "SKILL-2026-0516-001",
  "input": "user-anfrage-zusammenfassung",
  "decision": "Kein passender Skill → Neu gebaut",
  "outputQuality": "estimate",
  "suggestions": ["Ähnlich wie SKILL-XXX", "Pattern Y nutzen"]
}
```

→ Bei nächster Nutzung: Autopilot schlägt basierend auf Log vor.

---

## 🔍 Skill-Suche (Discovery)

### Suchreihenfolge:
1. `C:\Users\BAZE²\.gemini\antigravity\skills\` (Antigravity Skills)
2. `C:\DEVKiTZ\.agents\workflows\` (DkZ Workflows)
3. `C:\DEVKiTZ\.agents\skills\` (DkZ Custom Skills)
4. Builder-Log Vorlagen
5. Web-Suche (über Agents)

### Matching-Kriterien:
- Name enthält Keywords
- Tags überlappen mit Aufgabe
- Description passt semantisch
- Trigger matcht Command

---

*Dieser Builder wird bei jeder Nutzung weiter verbessert.*
