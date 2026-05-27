# 🏗️ DEVKiTZ™ MASTER BLAUPAUSE

> **Version:** v1.0 | **Stand:** 2026-05-21 | **Fokus:** Master-Architektur und System-Integration

Diese Blaupause dient als visueller und technischer Bauplan fuer das gesamte DEVKiTZ™ Oekosystem. Sie dokumentiert den Datenfluss vom Playbook bis zum Endnutzer (Copilot und Chatleiste) sowie die Server- und API-Infrastruktur.

---

## 🗺️ 1. Architektur-Ebenen (The 7 Layers)

Das DEVKiTZ™ System operiert auf einem strikten 7-Ebenen-Modell:

```text
┌────────────────────────────────────────────────────────┐
│                   DEVKiTZ™ ARCHITEKTUR                  │
├────────────────────────────────────────────────────────┤
│                                                        │
│  ┌─ INTERN ─────────────────────────────────────────┐  │
│  │  L00  Admin & System Instructions → James™       │  │
│  │  L0   Logs & REDNOTE™ → dkz-eventlog.js          │  │
│  └──────────────────────────────────────────────────┘  │
│                                                        │
│  ┌─ OPERATIV ───────────────────────────────────────┐  │
│  │  L1   Orchestrator → James™ + Ralph-Loop™        │  │
│  │  L2   Routine Layer → Developer™ + Tester™       │  │
│  │  L3   Project Layer → PM™ + Architekt™           │  │
│  │  L4   Interface Layer → Browser/Voice/Mobile      │  │
│  │  L5   Console Layer → ESC-Konsole                │  │
│  └──────────────────────────────────────────────────┘  │
│                                                        │
│  ┌─ EXTERN (NEXUS) ─────────────────────────────────┐  │
│  │  Dashboard (89+ Module) · ONTHERUN™ MCP          │  │
│  │  Wissens-Gateway (Iceberg) · VPS Hostinger       │  │
│  └──────────────────────────────────────────────────┘  │
│                                                        │
└────────────────────────────────────────────────────────┘
```

---

## 🧠 2. Playbook → Copilot → Chatleiste Pipeline

Der Informationsfluss fuer AI-Assistenz und User-Interaktion:

1. **Playbook (`DKZ_PLAYBOOK.md`) und `REGELWERK.md`:** 
   - Die "Constitution" des Systems.
   - Beinhaltet eiserne Regeln (esc-Schutz, DkZ Theme, R24 Alarm).
2. **James™ Guardian (Context Pipeline):**
   - James liest das Playbook und filtert relevante Paragraphen.
3. **Copilot (`dkz-copilot.js`):**
   - Der Copilot erhaelt den kontextualisierten Prompt von James.
   - Er fragt den Nutzer ueber die integrierte Chatleiste (z.B. Hamburger Menu Panel).
4. **Chatleiste (Interface):**
   - Nahtlos in jedes Dashboard-Modul integriert. 
   - Stellt den direkten Kanal zwischen User und Agenten dar.

```text
[PLAYBOOK/WIKI] ──(Context)──▶ [JAMES™ GUARDIAN] ──(Payload)──▶ [COPILOT] ──(UI)──▶ [CHATLEISTE]
```

---

## 🌐 3. Der Nexus: ONTHERUN™, Webhooks und VPS

Der "Nexus" ist das Herzstueck der externen Kommunikation.

*   **ONTHERUN™ Server (Node.js/Express):**
    *   Der primaere MCP Server.
    *   Hostet lokale APIs, routet LLM-Requests, verbindet sich zu Ollama/OpenAI/Claude.
*   **Wissens-Gateway (DataLakeHouse™):**
    *   Apache Iceberg + DuckDB. 
    *   Verankert alle Artefakte (3-fach Verankerung: Iceberg + Hub + Copilot).
*   **Webhooks und Free APIs:**
    *   N8N Workflows laufen auf Hostinger VPS.
    *   Fangen Events ab (z.B. GitHub Commits, RSS Feeds, System Health).
*   **Hostinger VPS (kvm8):**
    *   Verwaltet Docker-Container fuer APIs.
    *   Bietet SSH-Bridge (DkZ™ SSH-Terminal Mini).
    *   Fuehrt Ollama Backend aus.

```text
                         ┌─────────────────┐
                         │ Hostinger VPS   │
                         │ (Docker, n8n)   │
                         └───────┬─────────┘
                                 │ Webhooks / SSH
┌────────────────┐       ┌───────┴─────────┐       ┌────────────────┐
│ Free APIs      │◀─────▶│ ONTHERUN™ MCP   │◀─────▶│ Wissens-Gateway│
│ (Weather, etc) │       │ (Node.js Nexus) │       │ (Iceberg/Duck) │
└────────────────┘       └───────┬─────────┘       └────────────────┘
                                 │
                         ┌───────┴─────────┐
                         │ DkZ™ Dashboards │
                         └─────────────────┘
```

---

## 📜 4. Die `llms.txt` Spezifikation

Die `llms.txt` liegt im Root von DEVKiTZ™ Webseiten und Hubs.
*   **Zweck:** Bietet einkommenden AI-Crawlern (oder unseren eigenen Scraper-Modulen) eine strukturierte Zusammenfassung des Projekts.
*   **Inhalt:** Verweise auf `REGELWERK.md`, `BLAUPAUSE.md`, verfuegbare APIs, und Dokumentations-Pfade.
*   **Data Flow:** Wird von `dkz-copilot.js` beim Start geparst, um zu verstehen, in welchem Modul-/Projekt-Kontext er sich befindet.
