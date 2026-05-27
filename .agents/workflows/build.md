---
description: DkZ Build-Workflow — Neues Feature, Modul oder System-Komponente bauen
---

# DkZ Build Workflow — Ökosystem erweitern

> **Wann:** Wenn etwas Neues gebaut, integriert oder erweitert wird.
> **Regeln:** R0, R2, R4, R5, R6, R13, R15, R17, R18

---

## Phase 1: ANALYSE (R5)

1. Was genau soll gebaut werden? Anforderungen klären
2. `ORDNER.ini` des Zielordners lesen (R17)
3. Prüfen ob ähnliches schon existiert → wiederverwenden
4. `REGISTRY.json` lesen → aktuelle Modulzahl + IDs kennen
5. Kompatibilität prüfen (R6) — passt es ins DkZ Design System?

## Phase 2: PLAN (R13)

6. Implementierungsplan erstellen mit:
   - Welche Dateien werden erstellt/geändert
   - Welche Regeln sind betroffen
   - Verifikations-Schritte
7. Plan dem User vorlegen → Genehmigung einholen

## Phase 3: AUSFÜHRUNG (R15)

8. Dateien erstellen/ändern — SO WENIG WIE MÖGLICH, SO VIEL WIE NÖTIG
9. DkZ Design System verwenden:
   - Akzent: `#fa1e4e`
   - Fonts: Inter + JetBrains Mono
   - Glassmorphism + Blobs
   - XSS-Schutz: `esc()` Funktion
   - Toast-System
   - `← Hub` Button
   - v0.01 im Header (R9)

// turbo
10. `git add -A && git commit -m "feat(name): beschreibung v0.01"` (R2)

## Phase 4: REGISTRIERUNG (bei neuen Modulen)

11. `features.json` erstellen (MOD-XXX Format)
12. `REGISTRY.json` aktualisieren → totalModules++
13. `BLAUPAUSE.md` aktualisieren → Ordnerbaum + Kategorie

// turbo
14. `git add -A && git commit -m "docs: register name in REGISTRY + BLAUPAUSE"` (R2)

## Phase 5: VERIFIKATION (R13)

15. Browser-Test: Modul öffnen, Funktionalität prüfen
16. Health Check: `features.json` valides JSON?
17. `git grep "modul-name"` → in REGISTRY + BLAUPAUSE?

## Phase 6: DOKUMENTATION (R18)

18. ORDNER.ini aktualisieren falls nötig (R17)
19. Bei erstmaliger Technik: Prompt/Workflow dokumentieren
20. Prompt-Bewertung: `[QUALITY: 1-5] [RESULT: success/partial/fail] [REUSABLE: yes/no]`

// turbo
21. `git add -A && git commit -m "docs: documentation update after build"` (R2)
