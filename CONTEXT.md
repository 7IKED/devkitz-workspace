# DEEPKEEP™ / CLOUDIA² / AiAiKirk — Domain Glossary

> Erstellt: 2026-05-29 · Grill-Session Ergebnis
> Zweck: Einheitliche Begriffe fuer alle LLMs und Agenten

---

## Begriffe

### DEEPKEEP™
Der **unantastbare RAW-Tresor**. Alles wird hierhin verschoben, nichts wird geloescht.
- **Physisch:** Google Drive Ordner (Stammordner, schreibgeschuetzt)
- **Lokal:** Nur Links + INI-Dateien mit ASCII-Mindmap des Drive-Inhalts
- **Regel:** Dateien koennen IN DEEPKEEP verschoben und umbenannt werden, aber NIEMALS geloescht oder herausgenommen
- **Blog:** DEEPKEEP Blog auf Blogger — RAW Research direkt als Wissensdatenbank publizieren
- **Sanitizer:** `deepkeep.js` — Security-Script das Secrets vor Git-Push ersetzt

### CLOUDIA²
Das **Dokumenten-Strukturierungs-System**. Multi-Provider Engine die Ordnerstrukturen organisiert.
- **Provider:** Google Drive, Nextcloud, Cloudflare R2, GitHub, lokale Bibliotheken
- **Funktion:** Sortiert Dateien nach Regeln (Jeff Su 5x99), erstellt Metadaten, dokumentiert in Google Sheets
- **Beziehung:** DEEPKEEP ist der Input-Ordner fuer CLOUDIA² — alles kommt zuerst in DEEPKEEP, dann sortiert CLOUDIA² die Cloud

### AiAiKirk
Der **Chatbot/Assistent** der DEEPKEEP und CLOUDIA² steuert.
- **Tech:** Vanilla HTML/CSS/JS Dashboard (KEIN React!)
- **Funktion:** Copilot-aehnliche UI die alle Systeme orchestriert
- **Vorgaenger:** Google AI Studio App (dist/), NotebookLM MCP Server

### Oracle
**Oracle Database** — als Datenbank-Backend (nicht Oracle Cloud Infrastructure).

### Dashboard
Visuelles **Dashy-Style Glassmorphism Dashboard** das zeigt:
- Alle Google Drive Bibliotheken (Bilder, Musik, Videos, Dokumente, ZIPs)
- Cloudflare Status
- Oracle DB Status
- SecondBrain (Obsidian) durchsuchbar
- Alle Blogs und Homepages
- Lokale Ordner (Desktop, Downloads → 7-Tage-Regel)
- GitHub Repos durchsuchbar

### Suchleiste
**Unified Search** ueber:
- Google Drive (alle Dateien)
- GitHub (alle Repos von 7IKED, DEVTKITS, L33TSTAR, NEWEUROPEORDER)
- Lokale Ordner (C:\Users, C:\DEVKiTZ)
- SecondBrain (Obsidian Vault)
- Blogs und Homepages
- Email-Entwuerfe

---

## Architektur-Regeln

1. **DEEPKEEP = Tresor:** Write-Once, Read-Many. Loeschen VERBOTEN.
2. **CLOUDIA² = Sortierer:** Verschiebt, benennt um, erstellt Metadaten. Loescht NICHT.
3. **AiAiKirk = Steuermann:** Chatbot-UI die alles orchestriert.
4. **Lokale Ordner:** Nur Baumstruktur (00-99) + INI mit ASCII-Mindmap. Dateien leben auf Drive.
5. **Desktop/Downloads:** 7-Tage-Regel — unberuehrte Dateien → DEEPKEEP (Dashboard-Funktion, kein Auto-Scan)
6. **Copilot-Bug:** dkz-copilot.js wirft JavaScript-Fehler beim Laden → MUSS gefixt werden
