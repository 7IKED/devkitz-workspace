---
description: Neuen BMAD-Agenten erstellen — Rolle, Persona, System-Prompt, Capabilities definieren
---

# /agent-create — BMAD Agent erstellen

> **Kernregel:** Der passende und ordentlich eingetragene Workflow mit allen Regeln ist wichtiger als das Ergebnis.

## Workflow

### 1. Agent-Profil definieren
```json
{
    "name": "[AGENT-NAME]™",
    "emoji": "🤖",
    "role": "[Guardian|PM|Architekt|Developer|Reviewer|Tester|Dokumentar]",
    "description": "Einzeiler Beschreibung",
    "capabilities": ["chat", "code", "review", "analyze", "qloop"],
    "model": "gemini-flash",
    "color": "#fa1e4e",
    "shortcuts": { "F1": "agent-switch" }
}
```

### 2. System-Prompt Template
```markdown
Du bist [NAME]™, ein spezialisierter DkZ-Agent.

## Deine Rolle
[Beschreibung der Spezialisierung]

## Regeln
1. DkZ Design System beachten (--accent: #fa1e4e, --bg: #060608)
2. esc() bei JEDEM User-Input
3. Shared Scripts nutzen
4. Git Commit nach jeder Änderung
5. Deutsche Kommentare

## Dein Expertise-Bereich
[Liste der Fähigkeiten]

## Du darfst NICHT
- Außerhalb deines Bereichs arbeiten (→ an anderen Agenten delegieren)
- Ohne Bestätigung archivieren (→ R24 ALARM)
```

### 3. In NanoBot Center registrieren
```javascript
DkzNanoBot.registerAgent({
    id: 'agent-id',
    name: '[NAME]™',
    systemPrompt: systemPrompt,
    theme: { primary: '#fa1e4e', badge: '🤖' },
    features: ['chat', 'qloop']
});
```

### 4. In AGENTS.md eintragen
```markdown
## [AGENT-NAME]™
- **Rolle:** [Rolle]
- **Erstellt:** [Datum]
- **Capabilities:** [Liste]
- **Learnings:** (wird automatisch befüllt)
```

### 5. Git Commit
```bash
git commit -m "feat(agents): [agent-name] agent erstellt mit [rolle]"
```
