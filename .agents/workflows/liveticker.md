---
description: DkZ LiveTicker — Cross-Tab Live Status System für Module und Dashboards
---

# /liveticker — Cross-Tab Live Status

> **Kernregel:** Der passende und ordentlich eingetragene Workflow mit allen Regeln ist wichtiger als das Ergebnis.

## Wann verwenden?
- Live-Status zwischen Tabs/Modulen teilen
- Echtzeit-Updates ohne Server (BroadcastChannel API)
- Dashboard-Widgets mit Live-Daten
- Modul-Health-Monitoring

## Workflow

### 1. LiveTicker Script einbinden
```html
<script src="../../shared/dkz-liveticker.js"></script>
```

### 2. Status senden (Publisher)
```javascript
// Aus jedem Modul Status senden
DkzLiveTicker.publish({
    module: 'modul-name',
    status: 'online',     // online | degraded | offline | busy
    message: 'Kurze Info',
    data: { /* beliebige Payload */ },
    timestamp: new Date().toISOString()
});
```

### 3. Status empfangen (Subscriber)
```javascript
// In einem Dashboard/Hub:
DkzLiveTicker.subscribe((msg) => {
    console.log(`[${msg.module}] ${msg.status}: ${msg.message}`);
    updateStatusWidget(msg);
});
```

### 4. Architektur
```
Tab A (Modul)  ──publish──→  BroadcastChannel('dkz-liveticker')
Tab B (Modul)  ──publish──→         ↓
Tab C (Hub)    ←─subscribe──  Alle Tabs empfangen
```

### 5. DkZ Ampel-Farben
```javascript
const statusColors = {
    online:   'var(--green)',    // #00ff88
    degraded: 'var(--yellow)',   // #ffb800
    offline:  'var(--red)',      // #ff3b5c
    busy:     'var(--blue)'     // #3b82f6
};
```

### 6. In Modul integrieren
- Header-Badge mit Live-Status-Indikator
- Auto-Publish bei wichtigen Events (Load, Error, Save)
- Fallback: localStorage-Polling wenn BroadcastChannel nicht verfügbar

### 7. Git Commit
```bash
git add -A
git commit -m "feat(liveticker): cross-tab live status in [modul] integriert"
```
