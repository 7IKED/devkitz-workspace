# OpenSpec — DEVKiTZ Spec-Driven Development

> Jede Aenderung startet mit einer Spec, nicht mit Code.

## Aktive Changes

Keine aktiven Changes. Starte mit:
```bash
# Neuen Change erstellen
openspec new change "feature-name"
```

## Archivierte Changes

_Noch keine archivierten Changes._

## Workflow

```
1. GRILL    -> Interview + Requirements (PFLICHT)
2. PROPOSE  -> proposal.md (Was + Warum)
3. DESIGN   -> design.md (Wie + Architektur)
4. TASKS    -> tasks.md (Atomare Schritte)
5. BUILD    -> Code nach tasks.md
6. TEST     -> TestStrasse + Playwright
7. COMMIT   -> Git + openspec archive
```

## Regeln

- NIEMALS die Grill-Phase ueberspringen
- IMMER Spec BEVOR Code geschrieben wird
- ADRs sind Pflicht fuer Architektur-Entscheidungen
- TestStrasse muss bestehen vor Commit
