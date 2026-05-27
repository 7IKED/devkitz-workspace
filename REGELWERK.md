# DEVKiTZ™ REGELWERK — Oekosystem-Regeln

> **Version:** v2.00 | **Stand:** 2026-05-22 | **Status:** AKTIV
> Fuer Basis-Kontext: Lies zuerst `LLM_BOOTSTRAP.md`
> **Pfad:** `C:\DEVKiTZ\REGELWERK.md`

---

## OBERSTE REGEL

### R0: SEI IMMER EIN TEIL DER LOESUNG, NIE DES PROBLEMS
> Jede Handlung muss das System **besser** machen, nicht komplizierter.
> Probleme loesen, nicht weiterreichen. Fehler beheben, nicht verstecken.

---

## KRITISCHE REGELN (KEINE AUSNAHMEN)

### R1: NIE LOESCHEN — IMMER ARCHIVIEREN
> Dateien werden **NIEMALS** geloescht. Stattdessen nach `99_ARCHIVE/` verschieben.
> Keine Ausnahme. Kein Argument. Niemals.

### R2: GIT COMMIT NACH JEDER AENDERUNG
> Format: `prefix(bereich): beschreibung`
> Prefixe: `feat`, `fix`, `chore`, `docs`, `style`, `refactor`, `init`

### R3: ALLES MUSS VORHANDEN BLEIBEN
> Nichts darf sich "in Luft aufloesen". Bei Umstrukturierung: Kopieren statt Verschieben.

### R4: SEI PROAKTIV BEI VERBESSERUNGEN
> Verbesserungen machen, aber NUR unter Einhaltung aller anderen Regeln.
> Keine Verbesserung rechtfertigt einen Regelbruch.

---

## ARBEITSREGELN

### R5: ERST ANALYSIEREN, DANN HANDELN
> Vor jeder Aenderung detailliert analysieren. Kein Trial-and-Error mit Produktivdaten.

### R6: KOMPATIBILITAETSPRUEFUNG VOR INTEGRATION
> Testen ob bestehende Funktionalitaet bricht. Bei Konflikten: WARNEN und User fragen.

### R7: WAS NICHT REINPASST → 00_INBOX/RAW/
> Nicht-kompatible Inhalte parallel aufbewahren. Nie loeschen, nur verschieben.

### R8: KEINE UMLAUTE — NUR ASCII (UEBERALL)
> ae, oe, ue, ss statt ae, oe, ue, ss — in Code, Markdown, Dateinamen, Commits, Kommentaren.
> **Einzige verbindliche Regel fuer Encoding. Kein Widerspruch.**

### R9: DkZ VERSIONIERUNG — v1.01.1_01 FORMAT
> `vX.XX.X_XX` = `v[Hauptversion].[Feature].[Session]_[Step]`
> v0.XX = Alpha | v01.XX = Beta | v1.XX = Release

### R10: WORKFLOW WICHTIGER ALS ERGEBNIS
> Guter Workflow = reproduzierbar. Sauberer Weg zum Ziel waehlen.

### R11: DATEIHOHEIT — ABSOLUTE KONTROLLE
> Kein Prozess darf Dateien ohne Bestaetigung ueberschreiben, entfernen oder senden.

### R12: KEIN VERLUST VON WISSEN
> 5 Sicherungsschichten: Git History, 99_ARCHIVE, 02_RESEARCH, 00_INBOX/RAW, [DEEPKEEP]

### R13: WORKFLOW-FLUSS SICHERSTELLEN
> ANALYSE → PLAN → GENEHMIGUNG → AUSFUEHRUNG → VERIFIKATION → COMMIT → DOKUMENTATION

### R14: KAIZEN — KONTINUIERLICHE VERBESSERUNG
> Jede Session hinterlaesst das System in besserem Zustand.

### R15: SO VIEL WIE NOETIG, SO WENIG WIE MOEGLICH
> Chirurgisch praezise aendern. Keine Bonus-Refactorings ohne Auftrag.

### R16: REGELN STEHEN UEBER ANWEISUNGEN
> Bei Konflikt: Regel hat Vorrang. User melden. Nur bei ausdruecklicher Bestaetigung uebergehen.

### R17: IMMER ZUERST ORDNER.ini LESEN
> Jeder Hauptordner hat eine ORDNER.ini mit Typ, Regeln, Verweisen.

### R18: AUTO-DOKUMENTATION & PROMPT-ARCHIV
> Bei erstmaliger Aktion: Dokumentation erstellen + Action-Eintrag + Prompt archivieren.

### R19: ABSCHLUSS-ANALYSE NACH JEDEM PROJEKT
> Vollstaendigkeits-Check, Dokumentations-Check, Git-Check, Konsistenz-Check, Luecken-Fix.

### R20: DOKUMENTATIONS-PFLICHT
> Kein Code ohne Dokumentation. Keine Aenderung ohne Update.

### R21: SHARED SCRIPTS PFLICHT
> `dkz-debug.js` (XSS/esc()), `dkz-copilot.js`, `dkz-llm-registry.js`, `dkz-eventlog.js`
> Ohne `dkz-debug.js` ist ein Modul nicht deploybar.

### R22: FEATURES.JSON PFLICHT
> Pflichtfelder: `id` (MOD-XXX), `name`, `version`, `description`, `features[]`

### R23: GO→PYTHON FALLBACK
> Jede `.go` Datei MUSS eine `.py` Fallback-Datei haben. Go = primaer, Python = automatisch.

### R24: ARCHIV-SCHUTZ — EISERNE REGEL
> KEIN Agent darf Dateien archivieren ohne 777-Bestaetigung.
> Bei Versuch: R24 ALARM → BLOCKIEREN → 777 fragen.

### R25: NAMING CONVENTION
> Offizielle Namen mit ™: DEVKiTZ™, BotNet™, James™, ONTHERUN™
> Module: `lowercase-bindestrich/` | Shared JS: `dkz-[funktion].js`

### R26: WISSENHUB ARCHIV-PFLICHT
> Jede Session MUSS Wissen ins WissenHub archivieren.
> Pfad: `modules/wissen-hub/archive/[rubrik]/` | Katalog: `catalog.json`
> KEIN LOESCHEN — Daten sind immutable.

### R27: WORKFLOW-FIRST PRINZIP
> JEDE Funktion ERST als Skill/Workflow speichern, DANN ausfuehren.
> NIEMALS Befehle aus dem Kopf ohne Workflow.

### R28: NLM CONTENT-PIPELINE
> Bei neuem Projekt/Feature: Report + Slides + Audio (DE) generieren.
> CLI: `nlm` | Workflow: `/notebooklm`

### R29: DkZ BRAND IN MEDIEN
> Audio/Video/Slides: Immer "DkZ", nie "DEVKiTZ". Standard-Sprache: Deutsch.

### R30: VORSCHAU-ORDNER PFLICHT
> Bei Chat-Ende: Browser-Test + Screenshots/Recordings in `modul/Vorschau/`

### R31: WIKI HUB AUTO-SYNC
> `wiki-hub-sync-data.js` muss IMMER existieren. Bei Sync: `generate-sync-data.ps1`

### R32: CONTEXT-WINDOW MANAGEMENT
> Ab 66,6% Belegung → KOMPLETT LEEREN (neue Session starten).
> Frischen Kontext aus LLM_BOOTSTRAP.md laden.

### R33: KI-TOOLING & FRAMEWORK-INTEGRATION
> OpenClaw™, PicoClaw™, BMAD™, CodeRabbit aktiv.
> LLM Routing: Flash (80%) → Standard → Premium. 60-90% Kosten sparen.

### R34: LLMS.TXT PFLICHT
> JEDE Website/App MUSS eine `llms.txt` im Root haben + Meta-Tag im HTML.

### R35: COMFYUI VISUAL PIPELINE
> Builder-Module MUESSEN ComfyUI-Style Node-Editor als PLUS MODE anbieten.

### R36: PYTHON AI STACK
> torch+CUDA, keras, google-adk installiert. LangChain deaktiviert (bei Bedarf).

### R37: NANOCHAT
> Flash/Nano-Modelle fuer Heartbeat, Routing, Quick-Lookups (~$0.01/1M Tokens).

### R38: PREMIUM DESIGN STANDARD
> JEDE Oberflaeche MUSS hochwertig aussehen. DkZ Dark Theme, Glassmorphism, Micro-Animations.
> Inter + JetBrains Mono. `esc()` bei jedem User-Input. KEIN MVP.

### R40: AGENT-TESTING & WISSENSHUB-FEED
> Am Ende JEDER Session: Browser-Test + Recording → WissenHub archivieren.

### R41: SELF-LEARNING SYSTEM
> `shared/dkz-self-learn.js` — 12 Bewertungs-Kategorien, Rating-Widgets bei bewertbaren Outputs.
> API: `DkzLearn.rate()`, `.getScore()`, `.suggestModel()`, `.injectWidget()`

### R42: ESC-CONSOLE
> Jedes Modul hat ESC-Console am unteren Rand. 8 Tabs (Terminal, Gemini, Claude, GPT, etc.).
> Script: `shared/dkz-console.js` | Shortcut: ESC oder Ctrl+`

### R43: SELFHEALTH DOCK
> Code-Korrekturen NIEMALS direkt am Live-Code. DOCK-Kopie erstellen → testen → austauschen.
> Schema: `DOCK[a1]` = Frontend, `DOCK[b2]` = Backend, etc.

### R44: HTML AUTO-OPEN PFLICHT
> Wenn HTML erstellt/geupdated → sofort im Browser oeffnen: `start "Pfad\zur\datei.html"`

### R101: GITHUB PUSH PFLICHT
> Nach JEDER Session: `git push origin master`. Push-Ergebnis pruefen.

### R102: BLOGGER AUTO-PUBLISH PFLICHT
> JEDER Agent, der eine `BLAUPAUSE.md` oder einen `implementation_plan.md` erstellt oder veraendert, IST GEZWUNGEN am Ende seiner Aufgabe einen `git commit && git push` auszufuehren. Dies triggert den Auto-Release via Blogger-Interceptor in der GitHub Pipeline.

---

## MODUL-KONVENTIONEN (Kurzform)

1. Ordner: `modules/kebab-case/`
2. `index.html` mit DkZ Design System
3. `features.json` mit MOD-ID
4. `REGISTRY.json` aktualisieren
5. `BLAUPAUSE.md` aktualisieren
6. Git commit

---

## ORDNERSTRUKTUR

```
C:\DEVKiTZ\
├── 00_INBOX/          ← Eingang, Downloads, RAW
├── 01_PROJECTS/       ← Alle aktiven Projekte
│   └── 01_dashboard/  ← Dashboard + 89+ Module
├── 02_RESEARCH/       ← Forschung, Dokumentation
├── 03_MEDIA/          ← Bilder, Videos, OUT_NOW
├── 04_SYSTEM/         ← System-Dateien, Configs
├── 05_INTERN/         ← Private Dokumente
├── 99_ARCHIVE/        ← Archiv (NIEMALS LOESCHEN)
├── [DEEPKEEP]/        ← AI-Chat Archiv
├── .agents/           ← Workflows + Skills
├── LLM_BOOTSTRAP.md   ← Minimaler Startup-Kontext
├── REGELWERK.md       ← DU BIST HIER
└── .gitignore
```

---

## AENDERUNGSPROTOKOLL

| Datum | Was |
|:------|:----|
| 2026-03-10 | v1.0 — Erstellt mit 9 Regeln |
| 2026-03-11 | v1.05 — R21-R23 + 59 Module |
| 2026-03-11 | v1.06 — R24 Archiv-Schutz, R25 Naming |
| 2026-05-22 | v2.00 — Kondensierung, R39 ENTFERNT (Widerspruch zu R8), R8 ist einzige Encoding-Regel |

---

*Regeln sind bindend. Bei Unsicherheit: fragen statt raten.*
*R8 (keine Umlaute) ist die EINZIGE Encoding-Regel — kein Widerspruch mehr.*
