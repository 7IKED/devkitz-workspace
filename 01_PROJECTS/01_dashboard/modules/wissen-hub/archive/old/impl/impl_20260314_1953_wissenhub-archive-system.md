# WissenHub Archive System — Implementation Plan

## Ziel
Das WissenHub wird zur zentralen, unveränderlichen Wissensdatenbank des DEVKiTZ Ökosystems.

## Neue Regel R26
- Jede KI-Session archiviert erstelltes Wissen automatisch als .md
- 4 Rubriken: Implementierungsplan, Walkthrough, Research, Task
- Keine Löschfunktion — Daten sind immutable
- Kein manuelles Upload — nur KI-Agenten schreiben

## Änderungen
- REGELWERK.md: R26 WissenHub Archiv-Pflicht
- CLAUDE.md: §22 WissenHub-Regel
- GEMINI.md: WissenHub Archiv-Regel
- archive/catalog.json: Apache Iceberg Manifest
- index.html: Komplett-Rebuild mit DuckDB + Iceberg

## Architektur
- Archive-Pfad: modules/wissen-hub/archive/[rubrik]/
- Katalog: catalog.json (Iceberg Manifest)
- Interface: index.html mit DuckDB Query + JAMEZ Suche
