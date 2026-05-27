# Apache Iceberg Knowledge Pattern — Research

## Was ist Apache Iceberg?
Apache Iceberg ist ein offenes Tabellenformat für analytische Datensätze.
Im WissenHub wird das Iceberg-Pattern für die Wissensverwaltung adaptiert:

## Iceberg-Prinzipien im WissenHub
1. **Snapshots**: Jeder neue Eintrag erzeugt einen Snapshot (unveränderlich)
2. **Catalog**: catalog.json ist das Manifest aller Einträge
3. **Schema Evolution**: Neue Felder können hinzugefügt, nie entfernt werden
4. **Time Travel**: Alle historischen Zustände sind nachvollziehbar
5. **Immutability**: Einmal geschrieben, nie gelöscht

## DuckDB Integration
- DuckDB Query Engine simuliert SQL-Abfragen über den Katalog
- SELECT, WHERE, ORDER BY, LIMIT werden unterstützt
- Tag-basierte Filterung über Iceberg Tag-Cloud

## Rubriken-System
| Rubrik | Zweck | Quellen |
|:---|:---|:---|
| impl | Implementierungspläne | Antigravity, Claude, Gemini |
| walk | Walkthroughs | Antigravity, Claude, Gemini |
| research | Forschung, Analysen | Antigravity, Claude, Gemini |
| task | Aufgaben, Checklisten | Antigravity, Claude, Gemini |
