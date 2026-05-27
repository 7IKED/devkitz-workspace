# 🤖 Swarm Mission Control (MOD-088)

Zentrales Kanban- und Graph-Dashboard zur Überwachung und Steuerung des DEVKiTZ™ Agenten-Swarms.

## Features

1. **Hardware Control Panel**: LED-Indikatoren (🟢 Laufend, 🟡 Standby, 🔴 Fehler, 🚨 Blinkend für Critical) für APIs und MCPs.
2. **Vanilla Canvas Graph**: Drag & Drop Netzwerk-Visualisierung ohne externe Abhängigkeiten (Regel R0).
3. **Kanban Board**: Drag & Drop Aufgabenverwaltung.
4. **NanoBot Event-Driven Logic**: Polling-freie Architektur. Agenten-NanoBots wachen via `localStorage` Event-Listener auf, sobald ein Vorgänger ein Event feuert (Push statt Pull).
5. **AutoResearch Hook**: Button zur Optimierung einzelner Agenten im NanoChat.

## Event-Driven Architektur
Beispiel-Aufruf, um den `Writer` Agenten aufzuwecken:

```javascript
DkzEventLog.log({
    type: 'workflow_trigger',
    action: 'task_completed',
    metadata: { nextAgent: 'writer', data: 'Research Data' }
});
```

Dieser Trigger löst ein systemweites Storage-Event aus, das der NanoBot abfängt und den Status in Echtzeit ändert.
