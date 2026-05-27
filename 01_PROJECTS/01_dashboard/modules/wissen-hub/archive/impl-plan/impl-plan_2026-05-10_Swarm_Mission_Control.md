# 🚀 Swarm Mission Control (MOD-088)

Dieses Dokument beschreibt die Architektur und Umsetzung des neuen interaktiven Kanban- und Orchestrierungs-Dashboards für das DEVKiTZ™ Ökosystem.

## Zielsetzung
Ein animiertes, visuelles Dashboard, das den gesamten Agenten-Swarm steuert und überwacht. Es kombiniert Kanban-Logik mit Graph-Ansichten (Knoten & Kanten) und einem Hardware-ähnlichen Control Panel für System-Gesundheit. Es integriert die *Event-Driven NanoBot Architektur* (Push statt Pull) sowie die AutoResearch + NanoChat Optimierungsschleife.

---

## User Review Required

> [!IMPORTANT]  
> **Vanilla JS Graph Engine:** Wir dürfen keine externen Libraries wie D3.js oder React Flow nutzen (Regel R0). Die Graphen (Knoten und Verbindungen) werden komplett in **Vanilla HTML5 Canvas / SVG** geschrieben. Bist du mit einer nativen Canvas-Lösung für das Drag & Drop Graph-Netzwerk einverstanden?

> [!TIP]  
> **Event-Driven Architektur:** Um das ständige "Abfragen" (Polling) zu verhindern, nutze ich den `storage`-Event-Listener auf `localStorage` (via `DkzEventLog`), sodass ein Agent (NanoBot) sofort "geweckt" wird, wenn sein Vorgänger das Event `task_completed` feuert. Das spart Performance und ist extrem schnell.

---

## Proposed Changes

### 1. Neues Modul erstellen
#### [NEW] `01_PROJECTS/01_dashboard/modules/swarm-mission-control/index.html`
Das Herzstück des Dashboards. Layout-Zusammensetzung (CSS Grid):
- **Top Bar:** Glassmorphism Header mit Global Status.
- **Left Panel (Control Panel):** Hardware-inspirierte Status-LEDs für APIs, MCP, Tools, Bots.
  - 🟢 `running` (Laufend)
  - 🟡 `standby` (Bereit/Standby)
  - 🔴 `error` (Defekt/Fehler)
  - 🚨 `critical` (Blinkend, Totalausfall)
- **Center Area (Graph & Kanban):** 
  - Toggle zwischen Kanban-Board (To Do, Doing, Wait, Done) und
  - Graph-Netzwerk (Visualisierung der Agenten-Ketten via Canvas).
- **Right Panel (Agent List):** Liste aller BMAD-Agenten. Zeigt aktuellen Task, "Wait for New" oder "Wait for Result". Integriert den Button "NanoChat AutoResearch" zur Agenten-Optimierung.

#### [NEW] `01_PROJECTS/01_dashboard/modules/swarm-mission-control/features.json`
Registrierung als `MOD-088` mit allen Feature-Flags (Kanban, Graph, NanoBot Integration).

#### [NEW] `01_PROJECTS/01_dashboard/modules/swarm-mission-control/README.md`
Dokumentation zur Funktionsweise des Event-Driven NanoBot Systems und der Graph-Bedienung.

---

### 2. System-Registrierung
#### [MODIFY] `01_PROJECTS/01_dashboard/REGISTRY.json`
- Hinzufügen von `modules/swarm-mission-control` als neues Dashboard.
- `totalModules` inkrementieren.

#### [MODIFY] `01_PROJECTS/01_dashboard/BLAUPAUSE.md`
- Dokumentation des neuen Moduls in der Kategorie **🤖 Agent & Team**.

---

## ⚙️ NanoBot Event-Driven Logik (Push statt Pull)

Jeder Agent im Dashboard erhält eine NanoBot-Instanz. Diese fragt nicht nach neuen Tasks (kein Polling), sondern "schläft".
Sobald ein Agent (z.B. *Researcher*) fertig ist, feuert er ein Event:
```javascript
DkzEventLog.log({
    type: 'workflow_trigger',
    action: 'task_completed',
    metadata: { nextAgent: 'writer', data: result }
});
```
Der NanoBot des *Writers* lauscht auf `storage` Events (Cross-Tab Support!) und wacht exakt in der Millisekunde auf, in der dieses Event in den `localStorage` geschrieben wird.

## 🔬 AutoResearch & NanoChat Optimierung

Jeder Agent-Knoten im Graph und in der Kanban-Liste erhält einen **Optimize** Button. 
Klickt man diesen, wird der Agent in den NanoChat gezogen und bekommt seinen aktuellen Kontext sowie den `autoresearch` Skill geladen, um seine Instructions oder sein Vorgehen zu verbessern.

---

## Verification Plan

### Automated Tests
1. Event-Simulation: Feuern eines Mock-Events in den `localStorage` und prüfen, ob der anvisierte NanoBot (UI Element) den Status von "Wait" auf "Doing" (grün) ändert.
2. LED-Test: Umschalten der Control-Panel LEDs auf Rot-Blinkend und visuelle Verifikation (CSS Animations).

### Manual Verification
1. Öffnen der `index.html` im Browser.
2. Drag & Drop im Kanban-Board testen.
3. Wechsel in die Graph-Ansicht: Verbindungen zwischen den Agenten prüfen (werden per Canvas gezeichnet).
4. AutoResearch-Hook testen (öffnet Modal/Integration).
