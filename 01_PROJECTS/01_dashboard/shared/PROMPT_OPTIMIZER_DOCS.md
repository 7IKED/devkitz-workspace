# DkZ Prompt-Optimizer & Builder-Bridge — Dokumentation

> **Version:** 1.0.0 | **Datum:** 2026-03-13 | **Status:** AKTIV

## Shared Scripts Uebersicht

| Script | Zweck | Abhaengigkeiten |
|--------|-------|-----------------|
| `dkz-james.js` v2.1.0 | Bewertungsagent + KNOWLEDGE Base | - |
| `dkz-memory.js` v1.0.0 | 3-Layer Memory + Config + Profile | - |
| `dkz-compaction.js` v1.0.0 | Komprimierung + Backup + Rollback | dkz-memory.js |
| `dkz-iceberg.js` v1.0.0 | Versionierte Prompt-Speicherung | dkz-memory.js |
| `dkz-prompt-score.js` v1.0.0 | Auto-Score Widget (injizierbar) | dkz-james.js, dkz-iceberg.js |
| `dkz-builder-bridge.js` v1.0.0 | Builder ↔ Iceberg/James Bridge | dkz-james.js, dkz-iceberg.js |

## GM-Regeln (Gedaechtnis-Management)

| ID | Name | Severity | Beschreibung |
|----|------|----------|-------------|
| GM-01 | Kontext-Inventur | Pflicht | Hot/Warm/Cold vor Session pruefen |
| GM-02 | Fuellstand-Wache | Pflicht | Nie >85% ohne Compaction |
| GM-03 | Backup-vor-Vergessen | Pflicht | Snapshot vor Compaction |
| GM-04 | Relevanz-Ranking | Empfohlen | Selten-Genutztes zuerst compacten |
| GM-05 | Kontext-Bruecke | Pflicht | Zusammenfassung statt Loeschen |
| GM-06 | Playbook-Pinning | Pflicht | Kern-Daten ueberleben ALLES |
| GM-07 | Score-Tracking | Empfohlen | Versionierte Score-Historie |
| GM-08 | Human-in-the-Loop | Optional | Bestaetigung bei Compaction |

## Neue Regeln

| ID | Name | Beschreibung |
|----|------|-------------|
| R95 | Prompt-Archivpflicht | Externe LLMs (Gemini, GPT, Claude) muessen Prompts im Iceberg archivieren |
| R96 | Playbook-Bindung | Playbook lesen = gesamter Output bindend an Standards |

## Externe Kataloge (ZIP-Import)

### claude-octopus (29 Agent-Personas)
**Phasen-System:**
- **Probe** (Discover): AI Engineer, Business Analyst, Context Manager, Research Synthesizer, Strategy Analyst, Content Analyst, Thought Partner, UX Researcher
- **Grasp** (Define): Backend Architect, Frontend Developer, Database Architect, Cloud Architect, GraphQL Architect
- **Tangle** (Develop): TDD Orchestrator, Debugger, DevOps Troubleshooter, Python Pro, TypeScript Pro, Incident Responder
- **Ink** (Deliver): Code Reviewer, Security Auditor, Test Automator, Performance Engineer, Deployment Engineer, Docs Architect, Product Writer, Exec Communicator, Mermaid Expert, Academic Writer

### auto-claude (Guides + Design-System)
- CLI Usage, Docker Setup, Windows/Linux Path Fix
- Design-System, Update System Analysis

### cookbook (94MB Prompting-Rezepte)
- Prompting, LangChain, ChromaDB, Google ADK, JSON Capabilities, Qdrant, Weaviate

## Builder-Bridge API

```javascript
// Auto-Save eines gebauten Elements
DkzBuilderBridge.autoSave('agent-builder', {
    name: 'Research Agent',
    description: 'Analysiert Quellen',
    steps: ['Quellen sammeln', 'Filtern', 'Zusammenfassen']
});

// Katalog fuer einen Builder laden
var agents = DkzBuilderBridge.loadForBuilder('agent-builder');

// Suche ueber alle Quellen
var results = DkzBuilderBridge.search('security audit');

// Statistiken
var stats = DkzBuilderBridge.getStats();
```

## Compaction API

```javascript
// Auto-Check + Compact wenn noetig
DkzCompaction.checkAndAutoCompact();

// Manuell compacten (Level 1-5)
DkzCompaction.compact({ level: 3 });

// Rollback zum letzten Backup
DkzCompaction.rollback();

// Storage-Uebersicht
DkzCompaction.getStorageStats();
```

## Iceberg API

```javascript
// Prompt versioniert speichern
DkzIceberg.savePrompt('Dein Prompt...', { score: 87, category: 'agents' });

// Score-Trend abrufen
DkzIceberg.getScoreTrend('ICE-xxx');

// Statistiken
DkzIceberg.getStats();
```
