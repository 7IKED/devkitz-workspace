# DkZ CoPilot™ — Ticket Queue

> Copilot Leseberechtigung: Diese Datei wird automatisch aktualisiert.
> Tickets im Format `dkz-XX-NNN` mit Pattern-Codes.
> Agent-Assignee: James™ GPT

---

## Offene Tickets

_Noch keine Tickets — erstelle welche ueber die Landing Page._

---

## Pattern-Codes

| Code | Pattern | Beschreibung |
|:-----|:--------|:-------------|
| AN | Anfrage | Allgemeine Anfrage |
| FB | Feedback | Rueckmeldung |
| BG | Bug Report | Fehler melden |
| ID | Feature Idee | Neue Funktion |
| PR | Prioritaet | Dringend |
| OK | Genehmigt | Freigabe |
| NO | Abgelehnt | Ablehnung |
| JM | James GPT | Guardian Task |

---

## Wie Tickets erstellen

1. **Landing Page** → http://localhost:5173/landing.html → Webhook Trigger unten
2. **Dashboard** → Hamburger Menue → 📝 Neues Ticket
3. **Rechtsklick** → Ticket
4. **Gateway API** → `POST localhost:3060/tickets`

## Wie Tickets lesen (Copilot)

```bash
# Via Gateway API
curl localhost:3060/tickets
curl localhost:3060/tickets?status=pending

# Via Datei
cat 01_PROJECTS/dkz-copilot/logs/tickets.jsonl

# Via diese Datei
cat 01_PROJECTS/dkz-copilot/TICKETS.md
```
