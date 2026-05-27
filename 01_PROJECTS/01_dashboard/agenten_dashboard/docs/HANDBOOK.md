# 📚 Benutzerhandbuch – SECOND BRAIN / Mission Control

> Alles was du wissen musst, um das Dashboard zu bedienen

---

## 🚀 Start

1. **Doppelklick** auf `updater.bat`
2. Browser öffnet automatisch `http://localhost:4242`
3. Dashboard ist sofort einsatzbereit

---

## 🧭 Navigation

Die **10 Tabs** oben in der Navigationsleiste:

| Tab | Shortcut-Idee | Was du hier machst |
|-----|---------|-------------------|
| Mission Control | Startseite | Überblick: Metriken, aktive Agenten, Live-Feed |
| Tasks | Aufgaben | Tasks erstellen, filtern, Status verwalten |
| Chat | Kommunikation | Direkt mit jedem Agenten chatten |
| Org | Organisation | Team-Struktur und Hierarchie ansehen |
| Office | Büro | Sehen wo Agenten gerade "sitzen" |
| Memory | Wissen | Identity, Prompts und Regeln jedes Agenten |
| 📖 Playbook | Vorlagen | Templates, Workflows, Aufbaupläne |
| 💰 Costs | Kosten | LLM-Preise, Budgets, Modell-Auswahl |
| 🚦 Control | Steuerung | Internet-Ampel, YOLO/Plan pro Agent |
| 📋 Logs | Protokoll | Alles was passiert, durchsuchbar + Export |

---

## 🎯 Mission Control – So liest du die Metriken

- **Tasks Completed**: Zähler steigt live mit jeder erledigten Aufgabe
- **Credits Used**: Kosten aller LLM-Calls heute (in Dollar)
- **Employees Online**: Anzahl aktiver Agenten vs. Gesamt
- **System Heartbeat**: Grün = alles läuft · Rot = Problem

### Currently Working
Liste aller Agenten die gerade aktiv an einer Aufgabe arbeiten.

### Latest Activity
Live-Feed aller Ereignisse mit Timestamps – scrollt automatisch.

---

## ✅ Tasks – Aufgaben verwalten

### Filter
- **All** – Alle Aufgaben
- **Pending** – Noch nicht begonnen
- **In Progress** – Wird gerade bearbeitet
- **Done** – Erledigt

### Neue Aufgabe erstellen
Klick auf **"+ Add Task"** → Titel eingeben → Wird automatisch JARVIS zugewiesen.

---

## 💬 Chat – Mit Agenten kommunizieren

1. Links den **Agent auswählen** (z.B. ATLAS)
2. Nachricht tippen und **Senden** klicken oder Enter drücken
3. Agent antwortet automatisch

> 💡 Tipp: Jeder Agent hat seine eigene Persönlichkeit und Expertise.

---

## 🚦 Control Panel – Das Herzstück der Steuerung

### Internet-Ampel (pro Agent)

Klicke auf die farbigen Kreise um den Internet-Zugang zu steuern:

| Farbe | Bedeutung | Wann nutzen |
|-------|-----------|-------------|
| 🔴 Rot | **AUS** – kein Internet | Sensible Aufgaben, reines Offline-Arbeiten |
| 🟡 Gelb | **NACHFRAGEN** – fragt vorher | Standard für die meisten Agenten |
| 🟢 Grün | **OPEN NET** – freier Zugang | Recherche, Web Scraping, API Calls |

### YOLO vs PLAN Modus

| Modus | Knopf | Verhalten |
|-------|-------|-----------|
| 🔥 YOLO | Rot leuchtend | Agent führt ALLES sofort aus, ohne Rückfrage |
| 📋 PLAN | Blau leuchtend | Agent erstellt erst Plan → Du genehmigst → Dann Ausführung |

### Bulk-Steuerung
Unten im Control Panel: **Alle Agenten gleichzeitig** umschalten.
- "ALLE → YOLO" / "ALLE → PLAN"
- "ALLE → AUS" / "ALLE → NACHFRAGEN" / "ALLE → OPEN NET"

---

## 💰 Costs – LLM Kosten managen

### Kostenvorlagen
Für jede Art von Arbeit gibt es eine Vorlage mit empfohlenem Modell:
- Klicke auf das **Dropdown** um das LLM für eine Aufgabe zu wechseln
- Das System merkt sich die Auswahl

### LLM-Übersicht
Alle 20+ Modelle mit Preisen, Speed und Qualität:
- **💚 Günstig**: DeepSeek, Gemini Flash, Mistral Small
- **🟡 Mittel**: Claude Sonnet, Gemini Pro, Grok-2
- **🔴 Teuer**: GPT-4o, Claude Opus, o1

### Budget-Balken
Jeder Agent hat einen Budget-Balken im Control Panel:
- Grün = unter Budget
- Rot = nahe am Limit (>80%)

---

## 📋 Logs – Alles analysieren

### Filter nutzen
- **Alle** – Kompletter Feed
- **Tasks** – Nur Task-bezogene Einträge
- **Kosten** – Nur LLM-Kosten
- **Control** – Ampel-Änderungen, Modus-Wechsel
- **Fehler** – Nur Fehler und Probleme

### Suche
Tippe im Suchfeld z.B. "ATLAS" um nur Einträge von Agent ATLAS zu sehen.

### CSV Export
Klick auf **"📥 Export CSV"** → Alle Logs als CSV-Datei herunterladen.

### Clear
**"🗑 Clear"** löscht alle Logs (nur im Browser, nicht permanent).

---

## 📖 Playbook – Templates & Pläne

### Verfügbare Templates
1. **Mission Control Setup** – Dashboard konfigurieren
2. **Task Board Vorlage** – Kanban einrichten
3. **Content Pipeline** – 7-Stufen Content-Workflow
4. **Kalender Setup** – Events & Automations
5. **AI Team Setup** – Rollen & Agenten definieren
6. **CRM / Contacts** – Kontakte verwalten
7. **Settings & Integrations** – APIs & Cron Jobs
8. **System-Architektur** – Modularer Aufbauplan
9. **Aufbauplan (Phasen)** – 8-Wochen Implementierung
10. **Modul-Integration** – Event Bus & Datenfluss

### LLM Vorlage
Am Ende jedes Templates: **Dropdown** um das ideale LLM für diese Art von Arbeit auszuwählen.

---

## 🔧 Technische Hinweise

- **Kein Backend nötig**: Alles läuft im Browser
- **State**: Wird im Browser-Speicher gehalten (noch nicht persistent)
- **Live-Updates**: Metriken und Feed updaten sich automatisch
- **Port**: Standard ist `4242`, änderbar in `updater.bat`

---

*Handbuch v1.0 · 2026-03-08*
