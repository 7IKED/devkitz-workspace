# Evaluierung und Architekturanalyse von Open-Source-KI-Agenten-Frameworks

> **ID:** W-0007  
> **Rubrik:** 🔬 Research  
> **Tags:** `bmad`, `ralphloop`, `n8n`, `multi-agent`, `orchestrierung`, `cost-engineering`, `agentprism`  
> **Source:** antigravity  
> **Datum:** 2026-03-15  
> **Status:** complete  
> **Vollversion:** `02_RESEARCH/03_docs/research_20260315_ki-agenten-frameworks-evaluierung.md`

---

## Zusammenfassung

Umfassende Evaluierung von Open-Source-Frameworks für Multi-Agenten-Orchestrierung:

- **BMAD-Methodik** — Dokumentenzentrierte Statusverwaltung, 12-21 Personas, Document Sharding, Disk-as-Shared-State
- **Ralphloop** — Deterministische Ausführungsschleifen (Worker → Verifier → Controller), Kontextisolierung pro Iteration
- **n8n** — 140k+ Stars, visuelles Flow-Rückgrat, Enterprise ROI 40-60% vs. Zapier/Make
- **Prompting-Topologien** — Ketten-, Leiter-, Fächerprompts als n8n-Subworkflows
- **Cost Engineering** — tokencost, Token-Simulatoren, Dry Runs vor Live-Schaltung
- **AgentPrism** — OpenTelemetry Trace-Visualisierung
- **Governance** — FAIDD, opencode.de, UBA KI-Lab

### Empfohlener Stack

```
n8n (Orchestrierung) → BMAD (Methodik) → Ralphloop (Ausführung) → 
Kognitive Topologien (Routing) → Cost Engineering + Observability (Kontrolle)
```

**44 Quellen** analysiert | Vergleichstabelle Kosten: unoptimiert ($7.50 @20 Iterationen) vs. kontextisoliert ($0.40)
