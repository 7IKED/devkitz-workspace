# Agent Builder v2 + Büro-Visualizer — Walkthrough

> Stand: 2026-03-16

## Agent Builder v2 Core

- SVG-Bézier-Kanten mit Port-Handles
- 5 Knotentypen: Input, Output, LLM, Tool, Agent
- Canvas Zoom/Pan mit Dot-Grid
- 8 Pattern-Templates (Parallelisierung, Routing, etc.)
- Graph Execution Engine mit topologischer Sortierung
- Google ADK YAML Export

## Büro-Visualizer

Animiertes Pixel-Office — jeder Knoten = ein Arbeitsplatz:
- Worker-Sprites (👤🤖🧠🔧📋) mit Typing/Running/Thinking/Celebrating
- Speed-Tags: ⚡schnell 🏃normal 🐢langsam 🧱blockiert
- SVG Conveyor-Lines + Datenpakete
- Progress Bars + Papierstapel + Status Bar

## n8n Iceberg Integration

- 3815 Workflows katalogisiert aus 3 Quellen
- Auto-Tags: openai, ai-agent, google, webhook, telegram, slack, etc.
- Gespeichert in WissenHub Iceberg (W-0008)
