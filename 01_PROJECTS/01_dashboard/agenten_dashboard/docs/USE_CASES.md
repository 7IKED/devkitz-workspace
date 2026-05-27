# 🎯 Use Cases – SECOND BRAIN / Mission Control

> Konkrete Anwendungsbeispiele für jeden Bereich

---

## Use Case 1: Tägliches Morning Briefing

### Szenario
Es ist 08:00 Uhr. Du öffnest das Dashboard für den Tagesstart.

### Ablauf
1. **Mission Control** öffnen → Metriken prüfen
   - Tasks Completed: gestern erledigte Aufgaben sehen
   - Credits Used: Budget-Status dieser Woche
   - Employees Online: wer ist bereit?
2. **Tasks Tab** → Filter auf "Pending"
   - Priorisierung: High-Priority zuerst zuweisen
   - ATLAS bekommt Research, SCRIBE den Newsletter
3. **Control Panel** → Ampeln setzen
   - ATLAS: 🟢 OPEN NET (braucht Web-Recherche)
   - SCRIBE: 🟡 NACHFRAGEN (soll nicht alleine surfen)
   - Modus: 📋 PLAN für alle (erstmal planen lassen)

### Ergebnis
Alle Agenten arbeiten kontrolliert, Budget wird überwacht.

---

## Use Case 2: Dringender Research-Auftrag

### Szenario
CEO braucht sofort eine Analyse der Quartalszahlen von NVIDIA.

### Ablauf
1. **Control Panel** → ATLAS auswählen
   - Internet: 🟢 OPEN NET
   - Modus: 🔥 **YOLO** (keine Zeit für Planung!)
2. **Chat Tab** → ATLAS auswählen
   - "Analysiere die Q4 2025 Earnings von NVIDIA. SEC Filing, Revenue, Gross Margin, Forward Guidance."
3. **Tasks Tab** → Task erscheint automatisch als "In Progress"
4. **Logs Tab** → Alle ATLAS-Aktionen live verfolgen
   - Filter: "ATLAS" in Suchfeld
   - Kosten pro API-Call sichtbar
5. **Costs Tab** → Budget-Verbrauch von ATLAS prüfen

### Ergebnis
In YOLO-Modus arbeitet ATLAS ohne Unterbrechung durch – alle Aktionen werden rot markiert im Log. Am Ende: vollständiger Report.

---

## Use Case 3: Content-Woche planen

### Szenario
Es ist Montag, die Content-Woche muss geplant werden.

### Ablauf
1. **Playbook Tab** → "Content Pipeline" Template öffnen
   - Wochenplan anschauen (Mo=YouTube, Di=X, Mi=LinkedIn...)
   - LLM Vorlage: "Content Creation" auswählen → Claude 3.5 Sonnet
2. **Tasks Tab** → 5 neue Tasks anlegen
   - Mo: "YouTube Skript: KI-Team aufbauen" → SCRIBE
   - Di: "X/Twitter Thread: 5 Tipps für Agenten" → ECHO
   - Mi: "LinkedIn Artikel: OpenClaw Review" → SCRIBE
   - Do: "Newsletter: Wöchentlicher Digest" → SCRIBE
   - Fr: "Reel: Behind the Scenes AI Office" → NOVA
3. **Control Panel** → Content-Team freischalten
   - SCRIBE: 🟡 NACHFRAGEN + 📋 PLAN
   - ECHO: 🟢 OPEN NET (Social Monitoring) + 📋 PLAN
   - NOVA: 🟡 NACHFRAGEN + 📋 PLAN

### Ergebnis
Alle Content-Tasks sind zugewiesen, Agenten arbeiten im Plan-Modus – jeder Step wird genehmigt.

---

## Use Case 4: Security-Audit vor Release

### Szenario
Neuer Code soll deployed werden, vorher Security-Check.

### Ablauf
1. **Playbook Tab** → "Settings & Integrations" → GitHub prüfen (🟢 Verbunden)
2. **Control Panel** →
   - CIPHER: 🔴 AUS (Internet) + 📋 PLAN (alles prüfen lassen)
   - NEXUS: 🔴 AUS + 📋 PLAN
3. **Chat Tab** → CIPHER
   - "Analysiere den aktuellen Code auf Sicherheitslücken. Module: Auth, API Endpoints, Token Handling."
4. **Chat Tab** → NEXUS
   - "Überprüfe Unit Tests für das Auth-Modul. Alle Tests müssen grün sein."
5. **Logs Tab** → Filter: "CIPHER" und "NEXUS"
   - Alle Findings dokumentiert
   - Kosten minimal (kein Internet = kein Web-Scraping)

### Ergebnis
Security-Audit komplett offline, alle Findings geloggt, Kosten minimal.

---

## Use Case 5: Budget-Optimierung

### Szenario
Monatliche Kosten zu hoch – LLM-Auswahl optimieren.

### Ablauf
1. **Logs Tab** → Filter: "Kosten"
   - Suche: teuerste Agents identifizieren
   - CSV Export → in Excel nach Agent gruppieren
2. **Costs Tab** → LLM-Übersicht → Filter: "💚 Günstig"
   - DeepSeek V3 ($0.27/M) vs GPT-4o ($2.50/M) vergleichen
   - Für Research: DeepSeek R1 statt Claude Sonnet testen
3. **Costs Tab** → Kostenvorlagen anpassen
   - "Research & Analyse": Dropdown → DeepSeek R1
   - "Quick Tasks": Dropdown → Mistral Small (günstigstes)
4. **Control Panel** → Budget-Limits senken
   - ATLAS: $5 → $3 pro Tag
   - SCRIBE: $5 → $2 pro Tag

### Ergebnis
30-40% Kostenersparnis durch LLM-Optimierung + Budget-Caps.

---

## Use Case 6: Neuen Agent onboarden

### Szenario
Ein neuer Agent "VECTOR" (Data Scientist) soll ins Team.

### Ablauf
1. **Memory Tab** → JARVIS ansehen (als Referenz für Format)
2. **Org Tab** → Struktur prüfen → Research-Team hat Platz
3. **Playbook Tab** → "AI Team Setup" Template öffnen
   - Checkliste: Name, Avatar, Role, System Prompt, Rules, Internet, Budget
4. Programmatisch: `AGENTS.push({...})` in index.html
5. **Control Panel** → VECTOR erscheint automatisch
   - Internet: 🟡 NACHFRAGEN (Standard)
   - Modus: 📋 PLAN (neuer Agent = erstmal vorsichtig)
   - Budget: $2/Tag (Probephase)

### Ergebnis
Neuer Agent vollständig integriert, kontrolliert eingeführt.

---

## Use Case 7: Krisenmanagement (YOLO All)

### Szenario
Deadline in 2 Stunden. Alles muss sofort fertig werden.

### Ablauf
1. **Control Panel** → Bulk-Steuerung
   - **"🔥 ALLE → YOLO"** → Alle Agenten sofort auf YOLO
   - **"🟢 ALLE → OPEN NET"** → Voller Internetzugang
2. **Chat Tab** → JARVIS
   - "JARVIS, koordiniere alle Agenten. Deadline: 2 Stunden. Priorities: [Liste]. Go!"
3. **Mission Control** → Live-Feed beobachten
   - Alle Agenten arbeiten parallel
   - Metriken steigen rapide
4. **Logs Tab** → YOLO-Aktionen verfolgen (rot markiert)
5. Nach 2 Stunden:
   - **Control Panel** → "📋 ALLE → PLAN" (zurück zu kontrolliert)
   - **Logs** → CSV Export (Analyse was alles passiert ist)

### Ergebnis
Maximale Geschwindigkeit, volles Risiko – aber alles dokumentiert.

---

## Use Case 8: Schwächenanalyse

### Szenario
Monatlicher Review: Was lief gut, was nicht?

### Ablauf
1. **Logs Tab** → CSV Export der letzten 30 Tage
2. In Excel/Sheets:
   - Gruppieren nach Agent → Wer hat die meisten Fehler?
   - Gruppieren nach Typ → Wo sind die teuersten Calls?
   - Gruppieren nach Zeit → Wann sind Peaks?
3. **Costs Tab** → Budget vs. tatsächliche Kosten vergleichen
4. **Playbook Tab** → "System-Architektur" → Schwachstellen identifizieren
5. Aktionsplan erstellen:
   - Agent X: Prompt überarbeiten (Memory Tab)
   - Aufgabe Y: Günstigeres LLM wählen (Costs Tab)
   - Workflow Z: Automation einrichten (Settings)

### Ergebnis
Datenbasierte Verbesserung des gesamten AI-Teams.

---

*Use Cases v1.0 · 2026-03-08 · 8 Praxisbeispiele*
