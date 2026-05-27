---
description: NanoBot Center einrichten — Agent-System mit Custom Themes, Shortcuts, Onboarding
---

# /nanobot-setup — NanoBot Center Agent-System

> **Kernregel:** Der passende und ordentlich eingetragene Workflow mit allen Regeln ist wichtiger als das Ergebnis.

## Wann verwenden?
- Neuen NanoBot-Agenten erstellen
- Agent-Themes und Farben konfigurieren
- Keyboard Shortcuts einrichten
- Onboarding Guide für NanoBot UI bauen
- Chat UX mit timed responses implementieren

## Workflow

### 1. Agent-Profil definieren
```javascript
const agent = {
    name: '[AGENT-NAME]',
    emoji: '🤖',
    role: 'beschreibung-der-rolle',
    color: '#fa1e4e',          // Agent-Theme-Farbe
    capabilities: ['qloop', 'chat', 'analyze'],
    model: 'gemini-flash',     // oder claude, gpt-4o, groq
    systemPrompt: 'Du bist...'
};
```

### 2. Theme-Farben (8 verfügbar)
```css
/* Agent-spezifische Themes */
--agent-red:    #fa1e4e;   /* DkZ Default */
--agent-blue:   #3b82f6;   /* Analyse */
--agent-green:  #00ff88;   /* Status/Health */
--agent-purple: #8b5cf6;   /* Creative */
--agent-orange: #f6821f;   /* Builder */
--agent-cyan:   #06b6d4;   /* Data */
--agent-pink:   #ec4899;   /* Design */
--agent-yellow: #ffb800;   /* Warning */
```

### 3. Keyboard Shortcuts
```javascript
// Standard NanoBot Shortcuts:
// F1-F7 → Agent wechseln
// Ctrl+G → Guide öffnen
// ESC → Console toggle
// NUM 1-7 → Feature Blocks (NumLock an)
```

### 4. Chat UX Pattern
```javascript
// Timed Agent Responses (natürlicher)
async function agentRespond(message) {
    showTypingIndicator(agent.name);
    await delay(800 + Math.random() * 1200); // 0.8-2s Denkzeit
    appendMessage({
        from: agent.name,
        text: message,
        timestamp: new Date().toISOString()
    });
}
```

### 5. Onboarding Guide
```javascript
// Collapsible Feature Blocks
const features = [
    { title: 'Chat', desc: 'KI-Agent kommunizieren', icon: '💬' },
    { title: 'Q-Loop', desc: 'Selbst-Verbesserung', icon: '🔄' },
    { title: 'Ticker', desc: 'Live-Status', icon: '📡' },
    { title: 'Copilot', desc: 'Auto-Vorschläge', icon: '🧠' }
];
// Anti-Clutter: Feature Blocks sind standardmäßig collapsed
```

### 6. Copilot Startprompt Integration
```javascript
// 42 klickbare Prompt-Chips
DkzCopilot.loadStartPrompts({
    category: 'agent-name',
    chips: ['Analysiere...', 'Erstelle...', 'Prüfe...'],
    enhance: true  // Enhance-Button für jeden Chip
});
```

### 7. Conflict Detection
```javascript
// Wenn mehrere Agents gleichzeitig aktiv:
DkzNanoBot.checkConflicts({
    agent: agent.name,
    action: 'modify',
    target: 'modul-name'
});
// → Warning Badge im Ticker wenn Conflict
```

### 8. Git Commit
```bash
git add -A
git commit -m "feat(nanobot): [agent-name] agent eingerichtet mit theme + shortcuts"
```
