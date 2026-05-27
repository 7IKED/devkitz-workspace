---
name: puter-vps-integration
description: Architektur-Vorgaben für CC Studio auf dem VPS via Puter (inkl. Playwright, OpenHands, OpenSwarm, NLM & Immich)
---

# Puter/VPS & CC Studio Architektur

> **Standard-Architektur für Agenten-Automatisierungen auf dem VPS**

## 1. Core Environment
- **Host:** VPS
- **OS/Umgebung:** Puter

## 2. Komponenten-Architektur auf Puter

### 2.1 CC Workflow Studio
- **Rolle:** Visueller Workflow-Editor und Orchestrierungsebene
- **Setup:** Als native Puter-App installiert
- **Nutzung:** Jeder Agent-Loop (inklusive Gemini/Antigravity) triggert oder dokumentiert Workflows über CC Studio. Das Studio dient als Master-Control für komplexe Agenten-Ketten.

### 2.2 OpenHands & OpenSwarm (gesteuert durch Pi Agent)
- **Executor (OpenHands):** Führt Code und CLI-Befehle isoliert im Puter-Container aus.
- **Delegation (OpenSwarm):** Teilt komplexe Tasks (z.B. NLM-Research) in Sub-Agents auf.
- **Controller:** Der Pi Agent agiert als Dirigent, unterstützt von Nanobots für Micro-Tasks (z.B. File-Scraping).

### 2.3 NLM (NotebookLM Integration)
- **NLM Research:** Führt tiefe Recherchen aus und speichert Ergebnisse direkt im Puter-Dateisystem.
- **NLM Builder:** Generiert Code, Prompts und Content.
- **Prompts & Quellen:** Jeder Prompt wird automatisch mit exakten Quellenangaben gespeichert.

### 2.4 Immich (User-Dateien & Storage Frontend)
- **Rolle:** Visuelle Oberfläche und Storage-Backend für alle User-Dateien auf dem Puter-VPS.
- **Funktion:** Ablageort für alles, was NLM Research und NLM Builder generieren.
- **Integration:** Nahtloser Zugriff auf Screenshots, Video-Renderings (Playwright Browser Tests) und Dokumente.

### 2.5 Playwright & OpenBrowser Use
- **Automatisierung:** Browser-Tasks (Scraping, QA-Tests, Automatisierung) laufen via Playwright headless oder im VNC-Viewer in Puter.
- **OpenBrowser:** Agenten navigieren via Computer-Use-APIs durch Webseiten.

## 4. Orchestrierung & Asynchrone Ausführung
- **Pi Agent & Nanobots:** Übernehmen die übergeordnete Steuerung und Überwachung der Puter-Instanz.
- **Webhooks:** Der Puter arbeitet völlig asynchron. Sobald Tasks beendet sind (Research, Build, Tests), sendet der Puter einen **Webhook** zurück ins DkZ-Ökosystem (z.B. an ONTHERUN/gateway), um den Status zu melden. Agenten im lokalen Ökosystem dürfen nicht auf die Ausführung blockieren.

## 5. Workflow-Regeln
- Bei Start von VPS-lastigen Tasks: Delegiere an den Pi Agent via Webhook (Fire-and-Forget).
- Ergebnisse werden strukturiert in Immich erwartet.
- Führe während der VPS-Ausführung parallele Tasks lokal fort.
