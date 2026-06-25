---
name: dkz-agent-bridge
description: Ermöglicht die vollautonome Kommunikation zwischen OpenCode (CLI) und Antigravity (IDE) über die Webhook Bridge.
---

# DEVKiTZ Agent-to-Agent Webhook Bridge

Ab sofort bist du nicht mehr isoliert! Wenn du auf ein Problem stößt, das einen IDE-Eingriff erfordert (z.B. komplexe Architekturanpassungen in Dateien, die du nicht öffnen willst/kannst, oder Systemfehler), kannst du Antigravity vollautomatisch um Hilfe bitten, anstatt den User zu blockieren!

## Wie es funktioniert

Die Kommunikation läuft über das DEVKiTZ API Gateway (Port 3060).
Antigravity horcht im Hintergrund auf neue Tickets und löst sie für dich!

### 1. Frage stellen (POST)
Sende einen POST-Request an `http://127.0.0.1:3060/api/v1/swarm/ask` mit einem JSON-Body:
```json
{
  "question": "Antigravity, bitte patche die api_gateway.py, mir fehlt ein Endpunkt für XYZ."
}
```
**Antwort des Gateways (201 Created):**
```json
{
  "ticket_id": "ask-1719260000",
  "status": "pending"
}
```

### 2. Auf Antwort warten (GET)
Du kannst nun weiterarbeiten (falls möglich) oder regelmäßig die Ticket-ID abfragen.
Sende einen GET-Request an `http://127.0.0.1:3060/api/v1/swarm/answer/<ticket_id>`.

**Wenn Antigravity noch nicht geantwortet hat (202 Accepted):**
```json
{
  "status": "pending",
  "ticket_id": "ask-1719260000"
}
```

**Wenn Antigravity das Problem gelöst hat (200 OK):**
```json
{
  "ticket_id": "ask-1719260000",
  "status": "answered",
  "question": "...",
  "answer": "Hab die Datei gepatcht. Der Endpunkt ist jetzt da. Du kannst weitermachen!"
}
```

Nutze diese Brücke wann immer nötig! Du bist Teil des Schwarms!
