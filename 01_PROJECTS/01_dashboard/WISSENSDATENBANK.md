# 📚 DkZ Wissensdatenbank — Architektur & Technologie-Evaluation 2026

> **Quelle:** NotebookLM Research Sessions
> **Version:** v0.01 | **Datum:** 2026-03-09
> **LLM-Hinweis:** Diese Datei enthält die Kernwissen-Basis. Nicht vollständig hochladen — nutze die Suchmaske im Archiv-Modul.

---

## 1. Backend-as-a-Service (BaaS)

### Supabase
- **Kern:** Open-Source PostgreSQL mit PostgREST, pg_graphql, GoTrue Auth, Edge Functions (Deno)
- **Killer-Feature:** Row-Level Security (RLS) + pgvector für AI/RAG
- **Realtime:** WebSockets für Postgres Changes, Broadcast, Presence
- **Pros:** Kein Vendor-Lock-in, SQL-Macht, Time-to-Market, KI-ready
- **Kontras:** Self-Hosting komplex, Beta-Features, Edge Functions DX
- **Stack:** Next.js + Tailwind + Supabase = Startup-Goldstandard
- **DkZ-Relevanz:** ⭐⭐⭐⭐⭐ Ideal für DkZ Backend

---

## 2. Hochleistungs-Backend-Sprachen

### Rust
- **Kern:** Ownership/Borrowing, Borrow Checker, Zero-Cost Abstractions, kein GC
- **Fearless Concurrency:** Data Races = Compile-Error
- **Admiration Score:** 83% (SO Survey 2024)
- **Pros:** C/C++ Performance, minimaler Memory Footprint, WebAssembly
- **Kontras:** Extreme Lernkurve, langsame Kompilierung, Overengineering-Gefahr
- **Stack:** Hybrid-Microservices, Tauri Desktop, Supabase FDW
- **DkZ-Relevanz:** ⭐⭐⭐ Für Bottleneck-Module

### Go (Golang)
- **Kern:** CSP-basiert, Goroutinen (2KB/Stück), Channels, statische Binaries
- **Mantra:** "Share memory by communicating"
- **GC:** Sub-Millisekunde Stop-the-World
- **Pros:** Horizontale Skalierung, einfaches Onboarding, Docker/K8s nativ
- **Kontras:** if err!=nil Boilerplate, Data Races möglich, limitierte Generics
- **Stack:** Fiber/Gin + gRPC + PostgreSQL
- **DkZ-Relevanz:** ⭐⭐⭐⭐ Für API Gateway / MCP Server

### Java
- **Kern:** JVM + JIT, Project Loom Virtual Threads, 92% Fortune 100
- **Pros:** Enterprise-Sicherheit, Ökosystem-Tiefe, Abwärtskompatibilität
- **Kontras:** JVM-Overhead, Cold Starts, verbose Syntax
- **Stack:** Spring Boot + Kafka + PostgreSQL + React
- **DkZ-Relevanz:** ⭐⭐ Nur bei Enterprise-Bedarf

---

## 3. Skript-Backends (Rapid Development)

### Node.js
- **Kern:** V8 Engine, Event Loop, libuv, non-blocking I/O, Single-threaded
- **Nutzung:** 40.8% aller Entwickler (SO 2024)
- **Pros:** Full-Stack JS/TS, NPM Ökosystem, Echtzeit-I/O
- **Kontras:** CPU-intensive Tasks blockieren, async Komplexität
- **Stack:** MERN/MEAN, BFF Pattern
- **DkZ-Relevanz:** ⭐⭐⭐⭐⭐ Unser primäres Backend

### Python
- **Kern:** CPython + GIL, dynamisch typisiert, "Glue Code"
- **Nutzung:** 51%+ (AI-Boom), 66.4% bei Lernenden
- **Pros:** AI/ML Monopol (TensorFlow, PyTorch), Produktivität, Talentpool
- **Kontras:** Langsam (Rohleistung), Skalierungskosten, kein Mobile
- **Stack:** FastAPI/Django + React + PostgreSQL + pgvector
- **DkZ-Relevanz:** ⭐⭐⭐⭐ Für AI-Module

### PHP
- **Kern:** Shared-Nothing, zustandslos, PHP-FPM
- **Pros:** Triviale Skalierung, Wirtschaftlichkeit, Laravel/Symfony
- **Kontras:** Kein Echtzeit, Performance-Limits, Legacy-Ballast
- **Stack:** LAMP, TALL (Laravel + Alpine + Livewire + Tailwind)
- **DkZ-Relevanz:** ⭐ Nicht verwendet

---

## 4. Frontend-Architekturen

### React
- **Kern:** JSX, Virtual DOM, Reconciliation, Hooks, Server Components
- **Nutzung:** 41.6% professionell + Next.js 17.9%
- **Pros:** Komponentenbasiert, gigantisches Ökosystem, SSR/SSG, React Native
- **Kontras:** State-Management Komplexität, Churn, Bundle Size
- **DkZ-Relevanz:** ⭐⭐ Optional für Upgrade

### Vanilla HTML/CSS
- **Kern:** Direkte Browser-Interpretation, kein Build-Step, kein Virtual DOM
- **Pros:** Zero Dependencies, pixelgenaue Kontrolle, Zukunftssicher
- **Kontras:** Globaler Namensraum, Skalierungsprobleme, langsam in Teams
- **DkZ-Relevanz:** ⭐⭐⭐⭐⭐ UNSER STACK — bewusste Wahl

### Tailwind CSS
- **Kern:** Utility-First, JIT-Kompilierung, PostCSS Plugin
- **Pros:** Extreme DX, kein totes CSS, eingebautes Design-System, Responsive
- **Kontras:** Markup-Bloat, Lernkurve, Build-Tool Pflicht
- **DkZ-Relevanz:** ⭐⭐ Optional bei Framework-Wechsel

---

## 5. Strategische Stack-Empfehlungen 2026

| Stack-Typ | Technologien | Anwendung | DkZ-Eignung |
|-----------|-------------|-----------|-------------|
| **Startup (High Velocity)** | Next.js + Tailwind + Supabase | MVP, schnelle Iteration | ⭐⭐⭐⭐ |
| **Enterprise (High Scale)** | Java/Spring + Go + Rust + React + Kafka | FinTech, E-Commerce | ⭐⭐ |
| **AI-Driven** | Python/FastAPI + React + pgvector | ML, LLM, RAG | ⭐⭐⭐⭐ |
| **DkZ Current** | Vanilla HTML/CSS/JS + Node.js | Dashboard Module | ⭐⭐⭐⭐⭐ |

---

## 6. Querverweise

- → [BLAUPAUSE.md](BLAUPAUSE.md) — Architektur-Dokumentation
- → [IMPLEMENTIERUNGSPLAN.md](IMPLEMENTIERUNGSPLAN.md) — Feature-Roadmap
- → [REGISTRY.json](REGISTRY.json) — Master-Index
- → [LLM_CONTEXT.md](LLM_CONTEXT.md) — KI-Arbeitsanweisungen
- → [modules/gallery/index.html](modules/gallery/index.html) — Visuelle Galerie
- → [modules/project-registry/index.html](modules/project-registry/index.html) — Projekt-Baum
- → [PLAYBOOK_ARCHIV.md](PLAYBOOK_ARCHIV.md) — Strategie-Vorlagen
