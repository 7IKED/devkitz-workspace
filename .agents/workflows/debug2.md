---
description: DkZ Debug² — Vollständiger System Stress-Test aller Shared Scripts und Module
---

# Debug² Skill — System Stress-Test

## Wann verwenden
Wenn das gesamte DEVKiTZ-System auf Fehler, Performance und Integration geprueft werden soll.

## Schritte

### 1. Browser oeffnen
Oeffne ein Modul das ALLE Shared Scripts geladen hat (z.B. Agent Builder):
```
file:///C:/DEVKiTZ/01_PROJECTS/01_dashboard/modules/agent-builder/index.html
```

// turbo
### 2. Script-Verfuegbarkeit pruefen
In der Browser-Konsole ausfuehren:
```javascript
console.log('James:', typeof DkzJames, 'Memory:', typeof DkzMemory, 'Compaction:', typeof DkzCompaction, 'Iceberg:', typeof DkzIceberg, 'PromptScore:', typeof DkzPromptScore, 'Bridge:', typeof DkzBuilderBridge, 'Updater:', typeof DkzUpdater);
```
Alle muessen `object` sein.

### 3. Unit Tests ausfuehren
Test-Suite in der Konsole ausfuehren. Prueft:
- **DkzJames**: KNOWLEDGE, evaluate(), GM-Rules (8), R95/R96, externalCatalog
- **DkzMemory**: Config (15+ Settings), 5 Presets, 8 Conflicts, 3-Layer, Profiles
- **DkzCompaction**: Backup, Compact (Soft/Medium/Aggressiv), Rollback, AutoCompact
- **DkzIceberg**: Save, Version, Diff, Trend, 7 Categories, Search
- **DkzPromptScore**: Widget, Live-Score, 6 Categories, div+textarea Support
- **DkzBuilderBridge**: 29 Agents, 4 Phases, AutoSave, LoadForBuilder, Search

### 4. Stress Tests
- **100x Iceberg saves** — muss <3s sein
- **50x Bridge concurrent saves** — muss <3s sein
- **10k+ char Prompt evaluate** — muss <1s sein
- **Compaction nach Stress** — muss `status: done` liefern

### 5. Modul-Integrationstests
Teste in mindestens 3 Modulen:
- **Settings** (index.html) — Scripts + Memory + HealthCheck
- **Prompter** (index.html) — Widget + Bridge + Score
- **Agent Builder** (index.html) — Bridge + Auto-Save + Catalog

Pruefe Cross-Module Sync: Daten aus Modul A muessen in Modul B sichtbar sein.

### 6. Ergebnis speichern
// turbo
```powershell
Copy-Item report.md "C:\DEVKiTZ\debug²\STRESS_TEST_$(Get-Date -Format 'yyyy-MM-dd').md"
```

// turbo
### 7. Git Commit
```powershell
cd C:\DEVKiTZ; git add debug²/; git commit -m "test(debug²): System Stress-Test $(Get-Date -Format 'yyyy-MM-dd')"
```

### 8. REDNOTE pruefen
```javascript
JSON.parse(localStorage.getItem('dkz-rednotes') || '[]').filter(r => !r.resolved)
```
Offene REDNOTEs = 0 ist Ziel.

## Referenzwerte (Baseline 2026-03-13)
| Metrik | Baseline |
|--------|----------|
| Iceberg 100x | 195ms |
| Bridge 50x | 49ms |
| 10k Prompt | 2ms |
| localStorage | 169.9 KB |
| Iceberg Prompts | 228 |

## Ergebnis-Ordner
Alle Reports werden unter `C:\DEVKiTZ\debug²\` gespeichert mit Datum im Dateinamen.
