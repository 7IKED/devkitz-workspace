# Nemotron-Schwarm — BLAUPAUSE (Blueprint)

> **Version:** v1.00 | **Stand:** 2026-06-24 | **Status:** Init
> **Typ:** Eigenständiges Projekt (Multi-Agent Swarm)
> **LLM-Engine:** Nvidia Nemotron (Lokal/API)

---

## 1. Vision & Goal

Der **Nemotron-Schwarm** ist ein dediziertes Multi-Agenten-System innerhalb des DEVKiTZ™-Ökosystems. 
Er weicht vom standardmäßigen BMAD™ (Blueprint → Mapping → Analyse → Design) ab und fokussiert sich stattdessen auf **YOLO-Mode, asynchrone Massen-Datenverarbeitung und autonomen Research**.

Anstatt sequenzieller menschlicher Review-Zyklen arbeiten hier die Agenten *parallel* und *zustandsgesteuert* (State Machine). Nemotron fungiert als Backbone aufgrund seiner Stärke in Kontext-Verständnis und Instruktions-Followup.

---

## 2. Ordnerstruktur

```text
14_nemotron_swarm/
├── BLAUPAUSE.md                  ← DU BIST HIER
├── KANBAN_NEMOTRON.md            ← Projekt-Fortschritt (Root/Alias)
├── orchestrator/                 ← Master-Node
│   ├── swarm_router.py           ← Verteilt Tasks an Agenten
│   └── api_gateway.py            ← REST/WebSocket Endpunkte für DkZ Dashboard
├── agents/                       ← Spezialisierte Agenten (Workers)
│   ├── agent_researcher.py       ← Web/Iceberg-Recherche
│   ├── agent_coder.py            ← YOLO-Coder für POCs
│   └── agent_reviewer.py         ← Nemotron CodeRabbit/Review Instanz
└── memory/                       ← Shared Context (Memory Pool)
    ├── vector_store/             ← ChromaDB oder DuckDB embeddings
    └── context.json              ← Globaler State
```

---

## 3. Die Agenten-Rollen im Schwarm

| Rolle | ID | Hauptaufgabe | Trigger |
|:------|:---|:-------------|:--------|
| **N-Orchestrator** | `nemo-master` | Task Routing, API-Schnittstelle zum User | Eingehender Task (Webhook/Copilot) |
| **N-Researcher** | `nemo-res` | Kontext beschaffen, Docs lesen, Iceberg query | Wenn Orchestrator Kontext braucht |
| **N-Coder** | `nemo-code` | Schnelle Skripte / POCs bauen (YOLO-Modus) | Orchestrator gibt "Build"-Befehl |
| **N-Reviewer** | `nemo-rev` | Prüft N-Coder Output, generiert `test_report.md` | N-Coder pusht fertigen Code |

---

## 4. Architektur-Fluss (Data Flow)

1. **Input:** User oder DkZ Dashboard (z.B. Paperclip) sendet Task an `api_gateway.py`.
2. **Dispatch:** `swarm_router.py` analysiert Task (Nemotron-Prompt) und bestimmt benötigte Agenten.
3. **Research:** `agent_researcher.py` sucht in `C:\DEVKiTZ` nach bestehenden BLAUPAUSEn oder Dateien und speichert in `/memory/context.json`.
4. **Execution:** `agent_coder.py` baut Code.
5. **Verification:** `agent_reviewer.py` prüft und gibt Freigabe.
6. **Output:** System antwortet via WebSocket an Copilot UI.

---

## 5. Leitlinien & Constraints

1. **Kein Console.log-Spam:** Agenten kommunizieren via `context.json` oder über interne SQLite/DuckDB-States.
2. **Nemotron-Limitierungen beachten:** Kontext-Fenster strikt managen (z.B. RAG für große Docs).
3. **Persistenz:** Jeglicher Code geht in `99_ARCHIVE/` oder in das finale Modul-Verzeichnis, niemals auf dem Desktop arbeiten lassen.
4. **Schnittstellen:** Der Schwarm MUSS kompatibel zur `dkz-copilot.js` Event-Architektur sein.

---

*Erstellt für DEVKiTZ™ durch Antigravity & Nemotron*
