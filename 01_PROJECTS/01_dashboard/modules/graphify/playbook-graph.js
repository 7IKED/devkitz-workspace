window.__PLAYBOOK_GRAPH__ = {
  "version": "1.0",
  "source": "C:\\DEVKiTZ\\04_SYSTEM\\DKZ_PLAYBOOK.md",
  "generated": "2026-05-20",
  "stats": {
    "total_nodes": 308,
    "total_edges": 297,
    "total_lines": 2663,
    "categories": {
      "output": 21,
      "general": 100,
      "module": 31,
      "rules": 45,
      "git": 21,
      "design": 25,
      "backend": 19,
      "data": 9,
      "agent": 25,
      "nlm": 10,
      "research": 2
    },
    "levels": {
      "h1": 35,
      "h2": 103,
      "h3": 157,
      "h4": 13
    }
  },
  "nodes": [
    {
      "id": "node_0",
      "title": "? DKZ PLAYBOOK � Output Rules & Design Standards",
      "level": 1,
      "parent": null,
      "content_preview": "> **Version:** v1.01.2_01 � **Erstellt:** 2026-03-08 � **Autor:** DkZ devkitz\n> **Geltungsbereich:** Alle Chat-Ausgaben, Berichte, Module, Dashboards, Dokumentationen\n> **Status:** ?? VERBINDLICH\n\n---",
      "line_start": 1,
      "line_end": 8,
      "category": "output",
      "children": [
        "node_1",
        "node_2",
        "node_3",
        "node_7",
        "node_8",
        "node_9"
      ],
      "section_num": null,
      "paragraph_num": null
    },
    {
      "id": "node_1",
      "title": "-------------------------------------------",
      "level": 2,
      "parent": "node_0",
      "content_preview": "",
      "line_start": 9,
      "line_end": 9,
      "category": "general",
      "children": [],
      "section_num": null,
      "paragraph_num": null
    },
    {
      "id": "node_2",
      "title": "SEKTION 01 � OUTPUT-FORMATIERUNG",
      "level": 2,
      "parent": "node_0",
      "content_preview": "",
      "line_start": 10,
      "line_end": 10,
      "category": "output",
      "children": [],
      "section_num": "01",
      "paragraph_num": null
    },
    {
      "id": "node_3",
      "title": "-------------------------------------------",
      "level": 2,
      "parent": "node_0",
      "content_preview": "",
      "line_start": 11,
      "line_end": 12,
      "category": "general",
      "children": [
        "node_4",
        "node_5",
        "node_6"
      ],
      "section_num": null,
      "paragraph_num": null
    },
    {
      "id": "node_4",
      "title": "1.1 Der 7-Block-Standard (Pflicht f�r jeden Output)",
      "level": 3,
      "parent": "node_3",
      "content_preview": "Jeder strukturierte Output folgt diesem Schema. Kein Block darf �bersprungen werden.\n\n| # | Block | Pflicht | Min. Zeichen | Inhalt |\n|---|-------|---------|-------------|--------|\n| ? | **Metadaten-Header** | ? JA | 80 | Tags, Projekt, Kategorie, Version, Datum |\n| ? | **Einf�hrung / Problem** | ? JA | 120 | Kontext setzen, Relevanz erkl�ren |\n| ? | **Ziel / Nutzen** | ? JA | 80 | Was wird erreicht, warum ist es wichtig |\n| ? | **Strukturierte Erkl�rung** | ? JA | 200 | Kerninhalt, Analyse, Det",
      "line_start": 13,
      "line_end": 26,
      "category": "output",
      "children": [],
      "section_num": null,
      "paragraph_num": null
    },
    {
      "id": "node_5",
      "title": "1.2 Metadaten-Header-Template",
      "level": 3,
      "parent": "node_3",
      "content_preview": "Jeder Output beginnt mit folgendem Header:\n\n```markdown\n---\n?? METADATEN\n+- ??? Projekt:    [Projektname]\n+- ?? Kategorie:  [A�P Code] � [Name]\n+- ?? Version:    v[major].[minor].[session]_[step]\n+- ?? Datum:      [YYYY-MM-DD]\n+- ?? Autor:      [Ersteller]\n+- ?? Status:     [?? AKTIV | ?? DEV | ?? ARCHIV]\n+- ??? Tags:       #tag1 #tag2 #tag3 ... (min. 10)\n---\n```",
      "line_start": 27,
      "line_end": 43,
      "category": "output",
      "children": [],
      "section_num": null,
      "paragraph_num": null
    },
    {
      "id": "node_6",
      "title": "1.3 Mindest-Zeichenanzahl pro Element",
      "level": 3,
      "parent": "node_3",
      "content_preview": "| Element | Min. Zeichen | Beispiel |\n|---------|-------------|----------|\n| **Dokumenten-Titel** | 30 | `DKZ Ecosystem Blueprint � Architektur-�bersicht v2` |\n| **Sektions-�berschrift** | 15 | `Modularer System-Aufbau` |\n| **Absatz / Paragraph** | 120 | Mindestens 2-3 vollst�ndige S�tze |\n| **Listenpunkt** | 40 | Genug Kontext f�r Standalone-Verst�ndnis |\n| **Tabellenzelle (Text)** | 10 | Keine Einwort-Zellen (au�er Status/Tags) |\n| **Tag** | 3 | `#ai`, `#cloud`, `#module` |\n| **Code-Kommentar*",
      "line_start": 44,
      "line_end": 58,
      "category": "module",
      "children": [],
      "section_num": null,
      "paragraph_num": null
    },
    {
      "id": "node_7",
      "title": "-------------------------------------------",
      "level": 2,
      "parent": "node_0",
      "content_preview": "",
      "line_start": 59,
      "line_end": 59,
      "category": "general",
      "children": [],
      "section_num": null,
      "paragraph_num": null
    },
    {
      "id": "node_8",
      "title": "SEKTION 02 � BERICHTSDARSTELLUNG",
      "level": 2,
      "parent": "node_0",
      "content_preview": "",
      "line_start": 60,
      "line_end": 60,
      "category": "output",
      "children": [],
      "section_num": "02",
      "paragraph_num": null
    },
    {
      "id": "node_9",
      "title": "-------------------------------------------",
      "level": 2,
      "parent": "node_0",
      "content_preview": "",
      "line_start": 61,
      "line_end": 62,
      "category": "general",
      "children": [
        "node_10",
        "node_11",
        "node_12"
      ],
      "section_num": null,
      "paragraph_num": null
    },
    {
      "id": "node_10",
      "title": "2.1 Berichtsaufbau-Schema",
      "level": 3,
      "parent": "node_9",
      "content_preview": "```\n+-------------------------------------------------+\n�  ? TITEL � Projekt/Thema                       �\n�  ? Version � Datum � Status-Badge               �\n+-------------------------------------------------�\n�  ?? METADATEN-BLOCK                             �\n�  Tags, Kategorie, Projekt                       �\n+-------------------------------------------------�\n�  ?? INHALT (5�7 Bl�cke)                        �\n�  +- Block 1: Einf�hrung                        �\n�  +- Block 2: Analyse / Erkl�r",
      "line_start": 63,
      "line_end": 89,
      "category": "output",
      "children": [],
      "section_num": null,
      "paragraph_num": null
    },
    {
      "id": "node_11",
      "title": "2.2 Status-Ampel-System",
      "level": 3,
      "parent": "node_9",
      "content_preview": "In allen Berichten, Tabellen und �bersichten gelten diese Status-Indikatoren:\n\n| Symbol | Status | Farbe | Verwendung |\n|--------|--------|-------|------------|\n| ?? | **AKTIV / OK / LIVE** | `--dkz-success` `#00FF88` | Produktiv, funktionsf�hig |\n| ?? | **IN ARBEIT / DEV** | `--dkz-warning` `#FFB800` | In Entwicklung, teilweise fertig |\n| ?? | **FEHLER / STOP / ARCHIV** | `--dkz-error` `#FF3366` | Kritisch, blockiert, archiviert |\n| ?? | **INFO / GEPLANT** | `--dkz-blue-heart` `#55ACEE` | Zur K",
      "line_start": 90,
      "line_end": 101,
      "category": "output",
      "children": [],
      "section_num": null,
      "paragraph_num": null
    },
    {
      "id": "node_12",
      "title": "2.3 Header-Struktur-Hierarchie",
      "level": 3,
      "parent": "node_9",
      "content_preview": "```markdown",
      "line_start": 102,
      "line_end": 104,
      "category": "general",
      "children": [],
      "section_num": null,
      "paragraph_num": null
    },
    {
      "id": "node_13",
      "title": "? Dokument-Titel (H1 � nur 1x pro Dokument)",
      "level": 1,
      "parent": null,
      "content_preview": "",
      "line_start": 105,
      "line_end": 106,
      "category": "general",
      "children": [
        "node_14",
        "node_17",
        "node_18",
        "node_19",
        "node_23",
        "node_24",
        "node_25",
        "node_29",
        "node_30",
        "node_31",
        "node_39",
        "node_40",
        "node_41",
        "node_45",
        "node_46",
        "node_47",
        "node_53",
        "node_54",
        "node_55",
        "node_59",
        "node_60",
        "node_61",
        "node_64",
        "node_65",
        "node_66",
        "node_67",
        "node_68",
        "node_69",
        "node_73",
        "node_74",
        "node_75",
        "node_78",
        "node_79",
        "node_80",
        "node_84",
        "node_85",
        "node_86",
        "node_90",
        "node_97",
        "node_98",
        "node_99",
        "node_106",
        "node_107",
        "node_108",
        "node_122",
        "node_123",
        "node_124"
      ],
      "section_num": null,
      "paragraph_num": null
    },
    {
      "id": "node_14",
      "title": "--- SEKTION [Nr] � [NAME] (H2 � Hauptbereiche)",
      "level": 2,
      "parent": "node_13",
      "content_preview": "",
      "line_start": 107,
      "line_end": 108,
      "category": "general",
      "children": [
        "node_15"
      ],
      "section_num": null,
      "paragraph_num": null
    },
    {
      "id": "node_15",
      "title": "[Nr].[Sub] Untertitel (H3 � Unterbereiche)",
      "level": 3,
      "parent": "node_14",
      "content_preview": "",
      "line_start": 109,
      "line_end": 110,
      "category": "general",
      "children": [
        "node_16"
      ],
      "section_num": null,
      "paragraph_num": null
    },
    {
      "id": "node_16",
      "title": "Detail-Element (H4 � selten, nur bei Bedarf)",
      "level": 4,
      "parent": "node_15",
      "content_preview": "```\n\n**Regeln:**\n- ? Immer ein Emoji vor dem H1-Titel\n- --- Immer die Trennlinie `---` vor H2-Sektionen\n- `[Nr].[Sub]` Nummerierung ist Pflicht f�r alle H3\n- Trennlinie `---` zwischen Hauptsektionen verwenden\n\n---",
      "line_start": 111,
      "line_end": 121,
      "category": "rules",
      "children": [],
      "section_num": null,
      "paragraph_num": null
    },
    {
      "id": "node_17",
      "title": "-------------------------------------------",
      "level": 2,
      "parent": "node_13",
      "content_preview": "",
      "line_start": 122,
      "line_end": 122,
      "category": "general",
      "children": [],
      "section_num": null,
      "paragraph_num": null
    },
    {
      "id": "node_18",
      "title": "SEKTION 03 � MINDMAPS & DIAGRAMME",
      "level": 2,
      "parent": "node_13",
      "content_preview": "",
      "line_start": 123,
      "line_end": 123,
      "category": "general",
      "children": [],
      "section_num": "03",
      "paragraph_num": null
    },
    {
      "id": "node_19",
      "title": "-------------------------------------------",
      "level": 2,
      "parent": "node_13",
      "content_preview": "",
      "line_start": 124,
      "line_end": 125,
      "category": "general",
      "children": [
        "node_20",
        "node_21",
        "node_22"
      ],
      "section_num": null,
      "paragraph_num": null
    },
    {
      "id": "node_20",
      "title": "3.1 Mermaid-Mindmap (Standard f�r Konzepte)",
      "level": 3,
      "parent": "node_19",
      "content_preview": "```mermaid\nmindmap\n  root((DkZ �kosystem))\n    Infrastruktur\n      Docker\n      Cloudflare Workers\n      GitHub Actions\n    Module\n      AI Chat\n      Converter\n      Analyser\n      File Manager\n    Daten\n      FAISS Vector-DB\n      PostgreSQL\n      DuckDB-Wasm\n    Governance\n      EU AI Act\n      DSGVO\n      LiteLLM\n```\n\n**Regeln f�r Mindmaps:**\n- Root-Node immer mit `(( ))` (Kreis)\n- Maximal 4 Ebenen tief\n- Jeder Ast hat mindestens 2, maximal 7 Kinder\n- Emoji `????????` vor Nodes f�r visuelle ",
      "line_start": 126,
      "line_end": 156,
      "category": "git",
      "children": [],
      "section_num": null,
      "paragraph_num": null
    },
    {
      "id": "node_21",
      "title": "3.2 Flowchart-Diagramm (Standard f�r Prozesse)",
      "level": 3,
      "parent": "node_19",
      "content_preview": "```mermaid\nflowchart LR\n    A[\"?? Input\"] --> B{\"?? Verarbeitung\"}\n    B -->|Erfolg| C[\"?? Output\"]\n    B -->|Fehler| D[\"?? Error Handler\"]\n    D --> E[\"?? Retry Loop\"]\n    E --> B\n    C --> F[\"?? Export\"]\n```\n\n**Regeln f�r Flowcharts:**\n- Immer `LR` (links?rechts) oder `TD` (oben?unten)\n- Emojis in Node-Labels verwenden\n- Entscheidungen immer als Raute `{ }`\n- Fehler-Pfade immer in Rot-Ton (`??`)\n- Erfolgs-Pfade immer in Gr�n-Ton (`??`)",
      "line_start": 157,
      "line_end": 175,
      "category": "rules",
      "children": [],
      "section_num": null,
      "paragraph_num": null
    },
    {
      "id": "node_22",
      "title": "3.3 ASCII-Mindmap (Fallback f�r Terminal/Plaintext)",
      "level": 3,
      "parent": "node_19",
      "content_preview": "```\n                        +--- ?? AI Chat\n                        +--- ?? Converter\n              +- Module �\n              �         +--- ?? Analyser\n              �         +--- ?? File Manager\n              �\n? DkZ -------+- Infra ----- ?? Docker\n              �         +--- ?? Cloudflare\n              �         +--- ?? GitHub CI/CD\n              �\n              +- Data ------ ??? PostgreSQL\n                        +--- ?? FAISS\n                        +--- ?? DuckDB-Wasm\n```\n\n**Regeln:**\n-",
      "line_start": 176,
      "line_end": 200,
      "category": "git",
      "children": [],
      "section_num": null,
      "paragraph_num": null
    },
    {
      "id": "node_23",
      "title": "-------------------------------------------",
      "level": 2,
      "parent": "node_13",
      "content_preview": "",
      "line_start": 201,
      "line_end": 201,
      "category": "general",
      "children": [],
      "section_num": null,
      "paragraph_num": null
    },
    {
      "id": "node_24",
      "title": "SEKTION 04 � TABELLEN IN MARKDOWN",
      "level": 2,
      "parent": "node_13",
      "content_preview": "",
      "line_start": 202,
      "line_end": 202,
      "category": "general",
      "children": [],
      "section_num": "04",
      "paragraph_num": null
    },
    {
      "id": "node_25",
      "title": "-------------------------------------------",
      "level": 2,
      "parent": "node_13",
      "content_preview": "",
      "line_start": 203,
      "line_end": 204,
      "category": "general",
      "children": [
        "node_26",
        "node_27",
        "node_28"
      ],
      "section_num": null,
      "paragraph_num": null
    },
    {
      "id": "node_26",
      "title": "4.1 Standard-Tabellenformat",
      "level": 3,
      "parent": "node_25",
      "content_preview": "```markdown\n| Spalte A | Spalte B | Spalte C | Status |\n|----------|----------|----------|--------|\n| Wert 1   | Detail   | Info     | ??     |\n| Wert 2   | Detail   | Info     | ??     |\n```",
      "line_start": 205,
      "line_end": 213,
      "category": "output",
      "children": [],
      "section_num": null,
      "paragraph_num": null
    },
    {
      "id": "node_27",
      "title": "4.2 Tabellenregeln",
      "level": 3,
      "parent": "node_25",
      "content_preview": "| Regel | Beschreibung |\n|-------|-------------|\n| **Header** | Immer fett oder Caps, niemals leer |\n| **Alignment** | Links-b�ndig f�r Text, zentriert f�r Status/Icons |\n| **Min. Spalten** | Mindestens 3 Spalten (sonst Liste verwenden) |\n| **Max. Spalten** | Maximal 7 Spalten (sonst aufteilen) |\n| **Status-Spalte** | Immer letzte Spalte, Emoji-Ampel verwenden |\n| **Tag-Spalte** | Tags als `?? TAG` oder `[TAG]` formatieren |\n| **Leere Zellen** | Nie leer lassen ? mindestens `�` oder `n/a` |\n| **",
      "line_start": 214,
      "line_end": 226,
      "category": "rules",
      "children": [],
      "section_num": null,
      "paragraph_num": null
    },
    {
      "id": "node_28",
      "title": "4.3 Tabellentypen",
      "level": 3,
      "parent": "node_25",
      "content_preview": "**Typ A � �bersichtstabelle** (f�r Registrierungen, Listen)\n```markdown\n| # | Name | Typ | Stack | Status |\n|---|------|-----|-------|--------|\n```\n\n**Typ B � Vergleichstabelle** (f�r Evaluierungen)\n```markdown\n| Feature | Option A | Option B | Empfehlung |\n|---------|----------|----------|------------|\n```\n\n**Typ C � Konfigurationstabelle** (f�r Settings)\n```markdown\n| Parameter | Wert | Default | Beschreibung |\n|-----------|------|---------|-------------|\n```\n\n**Typ D � Statustabelle** (f�r Mo",
      "line_start": 227,
      "line_end": 254,
      "category": "general",
      "children": [],
      "section_num": null,
      "paragraph_num": null
    },
    {
      "id": "node_29",
      "title": "-------------------------------------------",
      "level": 2,
      "parent": "node_13",
      "content_preview": "",
      "line_start": 255,
      "line_end": 255,
      "category": "general",
      "children": [],
      "section_num": null,
      "paragraph_num": null
    },
    {
      "id": "node_30",
      "title": "SEKTION 05 � CHAT-BUTTON-OPTIK",
      "level": 2,
      "parent": "node_13",
      "content_preview": "",
      "line_start": 256,
      "line_end": 256,
      "category": "general",
      "children": [],
      "section_num": "05",
      "paragraph_num": null
    },
    {
      "id": "node_31",
      "title": "-------------------------------------------",
      "level": 2,
      "parent": "node_13",
      "content_preview": "",
      "line_start": 257,
      "line_end": 258,
      "category": "general",
      "children": [
        "node_32",
        "node_37",
        "node_38"
      ],
      "section_num": null,
      "paragraph_num": null
    },
    {
      "id": "node_32",
      "title": "5.1 Button-Klassen im DkZ-Design",
      "level": 3,
      "parent": "node_31",
      "content_preview": "Alle interaktiven Elemente in Chat-Ausgaben folgen dem Cyberclean-Design:",
      "line_start": 259,
      "line_end": 262,
      "category": "design",
      "children": [
        "node_33",
        "node_34",
        "node_35",
        "node_36"
      ],
      "section_num": null,
      "paragraph_num": null
    },
    {
      "id": "node_33",
      "title": "Prim�rer Action-Button (Neonrot)",
      "level": 4,
      "parent": "node_32",
      "content_preview": "```html\n<button class=\"dkz-btn dkz-btn--primary\">\n  ? Aktion starten\n</button>\n```\n```css\n.dkz-btn--primary {\n  background: linear-gradient(135deg, #fa1e4e, #ec4899);\n  color: #ffffff;\n  border: none;\n  padding: 10px 24px;\n  border-radius: 8px;\n  font-family: 'JetBrains Mono', monospace;\n  font-size: 0.85rem;\n  font-weight: 600;\n  cursor: pointer;\n  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);\n  box-shadow: 0 0 20px rgba(250, 30, 78, 0.25);\n  letter-spacing: 0.05em;\n}\n.dkz-btn--primary:hov",
      "line_start": 263,
      "line_end": 289,
      "category": "design",
      "children": [],
      "section_num": null,
      "paragraph_num": null
    },
    {
      "id": "node_34",
      "title": "Sekund�rer Button (Ghost/Outline)",
      "level": 4,
      "parent": "node_32",
      "content_preview": "```html\n<button class=\"dkz-btn dkz-btn--ghost\">\n  ?? Details anzeigen\n</button>\n```\n```css\n.dkz-btn--ghost {\n  background: transparent;\n  color: #fa1e4e;\n  border: 1px solid rgba(250, 30, 78, 0.4);\n  padding: 10px 24px;\n  border-radius: 8px;\n  font-family: 'JetBrains Mono', monospace;\n  font-size: 0.85rem;\n  cursor: pointer;\n  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);\n}\n.dkz-btn--ghost:hover {\n  background: rgba(250, 30, 78, 0.12);\n  box-shadow: 0 0 15px rgba(250, 30, 78, 0.2);\n}\n```",
      "line_start": 290,
      "line_end": 313,
      "category": "design",
      "children": [],
      "section_num": null,
      "paragraph_num": null
    },
    {
      "id": "node_35",
      "title": "Tag-Button (Compact)",
      "level": 4,
      "parent": "node_32",
      "content_preview": "```html\n<span class=\"dkz-tag dkz-tag--red\">?? CRITICAL</span>\n<span class=\"dkz-tag dkz-tag--green\">?? ACTIVE</span>\n<span class=\"dkz-tag dkz-tag--blue\">?? INFO</span>\n```\n```css\n.dkz-tag {\n  display: inline-flex;\n  align-items: center;\n  gap: 4px;\n  font-family: 'JetBrains Mono', monospace;\n  font-size: 0.65rem;\n  padding: 2px 10px;\n  border-radius: 9999px;\n  letter-spacing: 0.05em;\n  font-weight: 600;\n}\n.dkz-tag--red {\n  background: rgba(250, 30, 78, 0.12);\n  color: #fa1e4e;\n}\n.dkz-tag--green {",
      "line_start": 314,
      "line_end": 345,
      "category": "design",
      "children": [],
      "section_num": null,
      "paragraph_num": null
    },
    {
      "id": "node_36",
      "title": "Icon-Button (Rund, f�r Toolbars)",
      "level": 4,
      "parent": "node_32",
      "content_preview": "```html\n<button class=\"dkz-btn dkz-btn--icon\" title=\"Einstellungen\">??</button>\n```\n```css\n.dkz-btn--icon {\n  width: 40px;\n  height: 40px;\n  border-radius: 8px;\n  background: #1a1a1c;\n  border: 1px solid rgba(255, 255, 255, 0.06);\n  color: #a1a1aa;\n  font-size: 1.1rem;\n  cursor: pointer;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  transition: all 0.15s cubic-bezier(0.4, 0, 0.2, 1);\n}\n.dkz-btn--icon:hover {\n  border-color: rgba(250, 30, 78, 0.4);\n  color: #fa1e4e;\n  box-s",
      "line_start": 346,
      "line_end": 371,
      "category": "design",
      "children": [],
      "section_num": null,
      "paragraph_num": null
    },
    {
      "id": "node_37",
      "title": "5.2 Button-Grid f�r Chat-Aktionen",
      "level": 3,
      "parent": "node_31",
      "content_preview": "```html\n<div class=\"dkz-action-grid\">\n  <button class=\"dkz-btn dkz-btn--primary\">? Generieren</button>\n  <button class=\"dkz-btn dkz-btn--ghost\">?? Analysieren</button>\n  <button class=\"dkz-btn dkz-btn--ghost\">?? Konvertieren</button>\n  <button class=\"dkz-btn dkz-btn--ghost\">?? Exportieren</button>\n</div>\n```\n```css\n.dkz-action-grid {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 8px;\n  padding: 16px 0;\n}\n```",
      "line_start": 372,
      "line_end": 390,
      "category": "design",
      "children": [],
      "section_num": null,
      "paragraph_num": null
    },
    {
      "id": "node_38",
      "title": "5.3 Chat-Nachrichten-Styling",
      "level": 3,
      "parent": "node_31",
      "content_preview": "| Element | Stil |\n|---------|------|\n| **Benutzer-Nachricht** | Rechts-aligned, `--dkz-dark-03` Hintergrund, runder Radius |\n| **System-Antwort** | Links-aligned, `--dkz-dark-01` Hintergrund, Neonrot-Akzentlinie oben |\n| **Code-Block** | `--dkz-dark-00` Hintergrund, `--font-mono`, Kopier-Button |\n| **Inline-Code** | `rgba(250,30,78,0.12)` Hintergrund, Neonrot Textfarbe |\n| **Trennlinie** | Gradient: `transparent ? --dkz-neonrot-dim ? transparent` |\n\n---",
      "line_start": 391,
      "line_end": 402,
      "category": "design",
      "children": [],
      "section_num": null,
      "paragraph_num": null
    },
    {
      "id": "node_39",
      "title": "-------------------------------------------",
      "level": 2,
      "parent": "node_13",
      "content_preview": "",
      "line_start": 403,
      "line_end": 403,
      "category": "general",
      "children": [],
      "section_num": null,
      "paragraph_num": null
    },
    {
      "id": "node_40",
      "title": "SEKTION 06 � TAG-SYSTEM",
      "level": 2,
      "parent": "node_13",
      "content_preview": "",
      "line_start": 404,
      "line_end": 404,
      "category": "general",
      "children": [],
      "section_num": "06",
      "paragraph_num": null
    },
    {
      "id": "node_41",
      "title": "-------------------------------------------",
      "level": 2,
      "parent": "node_13",
      "content_preview": "",
      "line_start": 405,
      "line_end": 406,
      "category": "general",
      "children": [
        "node_42",
        "node_43",
        "node_44"
      ],
      "section_num": null,
      "paragraph_num": null
    },
    {
      "id": "node_42",
      "title": "6.1 Tag-Regeln (Verbindlich)",
      "level": 3,
      "parent": "node_41",
      "content_preview": "| Regel | Wert |\n|-------|------|\n| **Mindestanzahl Tags** | 10 pro Output |\n| **Bei Research-Content** | 15+ Tags |\n| **Format** | `#kleinbuchstaben`, keine Leerzeichen, Bindestrich erlaubt |\n| **Sprache** | Deutsch oder Englisch (konsistent pro Dokument) |\n| **Kategorie-Tag** | Immer mindestens 1 aus dem A�P System |\n| **Projekt-Tag** | Immer den Projektnamen als Tag |\n| **Status-Tag** | Immer: `#aktiv` oder `#dev` oder `#archiv` |\n| **Platzierung** | Im Metadaten-Header UND am Dokumentende |",
      "line_start": 407,
      "line_end": 419,
      "category": "rules",
      "children": [],
      "section_num": null,
      "paragraph_num": null
    },
    {
      "id": "node_43",
      "title": "6.2 Obligatorische Tag-Kategorien",
      "level": 3,
      "parent": "node_41",
      "content_preview": "Jeder Output braucht mindestens **einen Tag aus jeder dieser Gruppen**:\n\n```\n?? CONTENT-TYP:    #bericht #analyse #tutorial #doku #guide #blueprint\n?? TECHNOLOGIE:     #html #css #js #python #docker #ai #react #node\n?? PROJEKT:         #dkz #openclaw #kirk #leeted #flyerpro\n?? KLASSIFIKATION:  #a-artikel #j-javascript #k-konfig #m-meeting\n? STATUS:          #aktiv #dev #archiv #geplant #done\n```",
      "line_start": 420,
      "line_end": 431,
      "category": "output",
      "children": [],
      "section_num": null,
      "paragraph_num": null
    },
    {
      "id": "node_44",
      "title": "6.3 Tag-Anzeige in HTML",
      "level": 3,
      "parent": "node_41",
      "content_preview": "```html\n<div class=\"dkz-tag-cloud\">\n  <span class=\"dkz-tag dkz-tag--red\">#blueprint</span>\n  <span class=\"dkz-tag dkz-tag--blue\">#docker</span>\n  <span class=\"dkz-tag dkz-tag--green\">#dkz</span>\n  <span class=\"dkz-tag dkz-tag--yellow\">#k-konfig</span>\n  <span class=\"dkz-tag dkz-tag--red\">#aktiv</span>\n</div>\n```\n```css\n.dkz-tag-cloud {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 6px;\n  padding: 8px 0;\n}\n```\n\n---",
      "line_start": 432,
      "line_end": 453,
      "category": "backend",
      "children": [],
      "section_num": null,
      "paragraph_num": null
    },
    {
      "id": "node_45",
      "title": "-------------------------------------------",
      "level": 2,
      "parent": "node_13",
      "content_preview": "",
      "line_start": 454,
      "line_end": 454,
      "category": "general",
      "children": [],
      "section_num": null,
      "paragraph_num": null
    },
    {
      "id": "node_46",
      "title": "SEKTION 07 � FARBSCHEMA",
      "level": 2,
      "parent": "node_13",
      "content_preview": "",
      "line_start": 455,
      "line_end": 455,
      "category": "design",
      "children": [],
      "section_num": "07",
      "paragraph_num": null
    },
    {
      "id": "node_47",
      "title": "-------------------------------------------",
      "level": 2,
      "parent": "node_13",
      "content_preview": "",
      "line_start": 456,
      "line_end": 457,
      "category": "general",
      "children": [
        "node_48",
        "node_52"
      ],
      "section_num": null,
      "paragraph_num": null
    },
    {
      "id": "node_48",
      "title": "7.1 Drei Farbschemata (Umschaltbar)",
      "level": 3,
      "parent": "node_47",
      "content_preview": "",
      "line_start": 458,
      "line_end": 459,
      "category": "design",
      "children": [
        "node_49",
        "node_50",
        "node_51"
      ],
      "section_num": null,
      "paragraph_num": null
    },
    {
      "id": "node_49",
      "title": "Schema A � **DARK MODE** (Standard)",
      "level": 4,
      "parent": "node_48",
      "content_preview": "| Rolle | Farbe | Hex | CSS Variable |\n|-------|-------|-----|-------------|\n| Background | Tiefschwarz | `#0e0e10` | `--dkz-black` |\n| Surface | Dunkelgrau | `#1a1a1c` | `--dkz-dark-01` |\n| Text Primary | Soft White | `#f6f6f7` | `--dkz-soft-white` |\n| Text Secondary | Grau | `#71717a` | `--dkz-gray-02` |\n| Accent Primary | **Neonrot** | `#fa1e4e` | `--dkz-neonrot` |\n| Accent Glow | Neonrot Glow | `rgba(250,30,78,0.35)` | `--dkz-neonrot-glow` |\n| Success | Gr�n | `#00FF88` | `--dkz-success` |\n|",
      "line_start": 460,
      "line_end": 472,
      "category": "design",
      "children": [],
      "section_num": null,
      "paragraph_num": null
    },
    {
      "id": "node_50",
      "title": "Schema B � **CRIMSON MODE** (Schwarz + Rot Kontrast)",
      "level": 4,
      "parent": "node_48",
      "content_preview": "| Rolle | Farbe | Hex | CSS Variable |\n|-------|-------|-----|-------------|\n| Background | Pures Schwarz | `#000000` | `--dkz-bg` |\n| Surface | Dunkles Blutrot | `#1a0008` | `--dkz-surface` |\n| Text Primary | Neonrot | `#fa1e4e` | `--dkz-text` |\n| Text Secondary | Ged�mpftes Rot | `#8b1a2b` | `--dkz-text-dim` |\n| Accent Primary | **Helles Neonrot** | `#ff2d5e` | `--dkz-accent` |\n| Accent Glow | Intensiver Glow | `rgba(255,45,94,0.5)` | `--dkz-accent-glow` |\n| Borders | Rotschimmer | `rgba(250,3",
      "line_start": 473,
      "line_end": 484,
      "category": "design",
      "children": [],
      "section_num": null,
      "paragraph_num": null
    },
    {
      "id": "node_51",
      "title": "Schema C � **NEON MODE** (Maximaler Kontrast)",
      "level": 4,
      "parent": "node_48",
      "content_preview": "| Rolle | Farbe | Hex | CSS Variable |\n|-------|-------|-----|-------------|\n| Background | Void Black | `#050505` | `--dkz-bg` |\n| Surface | Charcoal | `#0a0a0c` | `--dkz-surface` |\n| Text Primary | Hot White | `#ffffff` | `--dkz-text` |\n| Accent Primary | **ULTRA Neonrot** | `#ff0040` | `--dkz-accent` |\n| Accent Glow | Maximaler Glow | `rgba(255,0,64,0.6)` | `--dkz-accent-glow` |\n| Accent Alt | Neon Cyan | `#00FFD5` | `--dkz-accent-alt` |\n| Grid Lines | Ghost Rot | `rgba(255,0,64,0.05)` | `--d",
      "line_start": 485,
      "line_end": 495,
      "category": "design",
      "children": [],
      "section_num": null,
      "paragraph_num": null
    },
    {
      "id": "node_52",
      "title": "7.2 Farbschema-Kontrast-Matrix",
      "level": 3,
      "parent": "node_47",
      "content_preview": "```\nDARK MODE (Standard)   CRIMSON MODE           NEON MODE\n??????????????????    ??????????????????    ??????????????????\n���������  #0e0e10    ���������� #000000    ���������� #050505\n���������  #1a1a1c    ���������� #1a0008    ���������� #0a0a0c\n���������  #fa1e4e    ���������� #fa1e4e    ���������� #ff0040\n���������  #f6f6f7    ���������� #8b1a2b    ���������� #ffffff\n??????????????????    ??????????????????    ??????????????????\nKontrast: Normal       Kontrast: Intensiv     Kontrast: Maximu",
      "line_start": 496,
      "line_end": 510,
      "category": "design",
      "children": [],
      "section_num": null,
      "paragraph_num": null
    },
    {
      "id": "node_53",
      "title": "-------------------------------------------",
      "level": 2,
      "parent": "node_13",
      "content_preview": "",
      "line_start": 511,
      "line_end": 511,
      "category": "general",
      "children": [],
      "section_num": null,
      "paragraph_num": null
    },
    {
      "id": "node_54",
      "title": "SEKTION 08 � THEME-SWITCHING",
      "level": 2,
      "parent": "node_13",
      "content_preview": "",
      "line_start": 512,
      "line_end": 512,
      "category": "design",
      "children": [],
      "section_num": "08",
      "paragraph_num": null
    },
    {
      "id": "node_55",
      "title": "-------------------------------------------",
      "level": 2,
      "parent": "node_13",
      "content_preview": "",
      "line_start": 513,
      "line_end": 514,
      "category": "general",
      "children": [
        "node_56",
        "node_57",
        "node_58"
      ],
      "section_num": null,
      "paragraph_num": null
    },
    {
      "id": "node_56",
      "title": "8.1 CSS-Implementation: `data-theme` Toggle",
      "level": 3,
      "parent": "node_55",
      "content_preview": "```css\n/* --- THEME TOKENS --- */\n\n/* DARK MODE (Default) */\n:root,\n[data-theme=\"dark\"] {\n  --dkz-bg:           #0e0e10;\n  --dkz-surface:      #1a1a1c;\n  --dkz-surface-2:    #222226;\n  --dkz-text:         #f6f6f7;\n  --dkz-text-dim:     #71717a;\n  --dkz-accent:       #fa1e4e;\n  --dkz-accent-glow:  rgba(250, 30, 78, 0.35);\n  --dkz-accent-dim:   rgba(250, 30, 78, 0.12);\n  --dkz-border:       rgba(255, 255, 255, 0.06);\n  --dkz-border-glow:  rgba(250, 30, 78, 0.4);\n}\n\n/* CRIMSON MODE */\n[data-theme=\"",
      "line_start": 515,
      "line_end": 563,
      "category": "design",
      "children": [],
      "section_num": null,
      "paragraph_num": null
    },
    {
      "id": "node_57",
      "title": "8.2 JavaScript Theme-Toggle",
      "level": 3,
      "parent": "node_55",
      "content_preview": "```javascript\n// --- DKZ THEME SWITCHER ---\nconst DKZ_THEMES = ['dark', 'crimson', 'neon'];\n\nfunction setTheme(theme) {\n  document.documentElement.setAttribute('data-theme', theme);\n  localStorage.setItem('dkz-theme', theme);\n\n  // Update toggle button\n  const btn = document.getElementById('theme-toggle');\n  if (btn) {\n    const icons = { dark: '??', crimson: '??', neon: '?' };\n    const labels = { dark: 'Dark', crimson: 'Crimson', neon: 'Neon' };\n    btn.innerHTML = `${icons[theme]} ${labels[th",
      "line_start": 564,
      "line_end": 596,
      "category": "design",
      "children": [],
      "section_num": null,
      "paragraph_num": null
    },
    {
      "id": "node_58",
      "title": "8.3 Theme-Toggle-Button (HTML)",
      "level": 3,
      "parent": "node_55",
      "content_preview": "```html\n<button id=\"theme-toggle\"\n        class=\"dkz-btn dkz-btn--icon\"\n        onclick=\"cycleTheme()\"\n        title=\"Farbschema wechseln\"\n        style=\"position:fixed; bottom:20px; right:20px; z-index:2000;\">\n  ?? Dark\n</button>\n```\n\n---",
      "line_start": 597,
      "line_end": 610,
      "category": "design",
      "children": [],
      "section_num": null,
      "paragraph_num": null
    },
    {
      "id": "node_59",
      "title": "-------------------------------------------",
      "level": 2,
      "parent": "node_13",
      "content_preview": "",
      "line_start": 611,
      "line_end": 611,
      "category": "general",
      "children": [],
      "section_num": null,
      "paragraph_num": null
    },
    {
      "id": "node_60",
      "title": "SEKTION 09 � LLM PROMPT-ENGINEERING",
      "level": 2,
      "parent": "node_13",
      "content_preview": "",
      "line_start": 612,
      "line_end": 612,
      "category": "general",
      "children": [],
      "section_num": "09",
      "paragraph_num": null
    },
    {
      "id": "node_61",
      "title": "-------------------------------------------",
      "level": 2,
      "parent": "node_13",
      "content_preview": "",
      "line_start": 613,
      "line_end": 614,
      "category": "general",
      "children": [
        "node_62",
        "node_63"
      ],
      "section_num": null,
      "paragraph_num": null
    },
    {
      "id": "node_62",
      "title": "9.1 Die 20 LLM Prompt-Blueprints",
      "level": 3,
      "parent": "node_61",
      "content_preview": "> **Vollst�ndige Dokumentation:** `04_SYSTEM/DKZ_LLM_PROMPT_BLUEPRINTS.md`\n> **Quelle:** [20 KI-Tipps Video](https://www.youtube.com/watch?v=HKRzt6aNlWY)\n\n20 formalisierte Prompt-Engineering-Techniken, jeweils mit Template, Beispiel und Anti-Pattern:\n\n| # | Blueprint | Kategorie | Einsatz |\n|---|-----------|-----------|---------|\n| BP-01 | **Reasoning Effort** | ?? Performance | Rechenpower pro Task steuern |\n| BP-02 | **XML-Container** | ?? Struktur | Prompts mit XML-Tags strukturieren |\n| BP-0",
      "line_start": 615,
      "line_end": 644,
      "category": "output",
      "children": [],
      "section_num": null,
      "paragraph_num": null
    },
    {
      "id": "node_63",
      "title": "9.2 Pflicht-Blueprints nach Task-Typ",
      "level": 3,
      "parent": "node_61",
      "content_preview": "| Task-Typ | Pflicht-Blueprints |\n|----------|-------------------|\n| **Code schreiben** | BP-02, BP-06, BP-04 |\n| **Code reviewen** | BP-19, BP-15, BP-06 |\n| **Recherche** | BP-09, BP-16, BP-18, BP-10 |\n| **Dokument-Analyse** | BP-12, BP-13, BP-03 |\n| **API-Call / Automation** | BP-01, BP-14, BP-02 |\n| **Kritische Entscheidung** | BP-20, BP-15, BP-08 |\n| **Chat-Komprimierung** | BP-17, BP-05, BP-04 |\n\n---",
      "line_start": 645,
      "line_end": 658,
      "category": "rules",
      "children": [],
      "section_num": null,
      "paragraph_num": null
    },
    {
      "id": "node_64",
      "title": "-------------------------------------------",
      "level": 2,
      "parent": "node_13",
      "content_preview": "",
      "line_start": 659,
      "line_end": 659,
      "category": "general",
      "children": [],
      "section_num": null,
      "paragraph_num": null
    },
    {
      "id": "node_65",
      "title": "ANHANG A � SCHNELLREFERENZ-KARTE",
      "level": 2,
      "parent": "node_13",
      "content_preview": "",
      "line_start": 660,
      "line_end": 660,
      "category": "general",
      "children": [],
      "section_num": null,
      "paragraph_num": null
    },
    {
      "id": "node_66",
      "title": "-------------------------------------------",
      "level": 2,
      "parent": "node_13",
      "content_preview": "```\n+---------------------------------------------------------+\n�  ? DKZ PLAYBOOK � SCHNELLREFERENZ                      �\n+---------------------------------------------------------�\n�                                                         �\n�  ?? OUTPUT:     7-Block-Standard, immer Metadaten       �\n�  ??? TAGS:       Min. 10 Tags, bei Research 15+          �\n�  ?? ZEICHEN:    Titel =30, Absatz =120, Listenpunkt =40�\n�  ?? TABELLEN:   3�7 Spalten, Status letzte Spalte       �\n�  ?? MINDMAPS:  ",
      "line_start": 661,
      "line_end": 686,
      "category": "output",
      "children": [],
      "section_num": null,
      "paragraph_num": null
    },
    {
      "id": "node_67",
      "title": "-------------------------------------------",
      "level": 2,
      "parent": "node_13",
      "content_preview": "",
      "line_start": 687,
      "line_end": 687,
      "category": "general",
      "children": [],
      "section_num": null,
      "paragraph_num": null
    },
    {
      "id": "node_68",
      "title": "SEKTION 10 � EVENT-LOG SYSTEM",
      "level": 2,
      "parent": "node_13",
      "content_preview": "",
      "line_start": 688,
      "line_end": 688,
      "category": "general",
      "children": [],
      "section_num": "10",
      "paragraph_num": null
    },
    {
      "id": "node_69",
      "title": "-------------------------------------------",
      "level": 2,
      "parent": "node_13",
      "content_preview": "",
      "line_start": 689,
      "line_end": 690,
      "category": "general",
      "children": [
        "node_70",
        "node_71",
        "node_72"
      ],
      "section_num": null,
      "paragraph_num": null
    },
    {
      "id": "node_70",
      "title": "10.1 Universal Event Logger (`dkz-eventlog.js`)",
      "level": 3,
      "parent": "node_69",
      "content_preview": "Jedes Event im �kosystem bekommt eine UUID und wird protokolliert:\n\n| Feld | Format | Pflicht |\n|------|--------|---------|\n| **id** | `EVT-{timestamp}-{hex4}` | ? |\n| **type** | creation / action / error / system / output / command | ? |\n| **source** | Modul-Name (z.B. clipboard, hub, cmd) | ? |\n| **action** | Was passiert ist | ? |\n| **metadata** | Modul, Version, User, Input, Output, Duration | ? |\n| **tags** | Filter-Tags (min. 2) | ? |\n| **parentId** | �bergeordnetes Event (f�r Verkettung) ",
      "line_start": 691,
      "line_end": 706,
      "category": "output",
      "children": [],
      "section_num": null,
      "paragraph_num": null
    },
    {
      "id": "node_71",
      "title": "10.2 Log-Pflicht",
      "level": 3,
      "parent": "node_69",
      "content_preview": "Jedes Modul MUSS loggen bei: **Erstellen**, **Ausgabe**, **Fehler**.\nOS-Befehle via `cmd-logger.ps1` ? `dkz \"befehl\"`.",
      "line_start": 707,
      "line_end": 711,
      "category": "rules",
      "children": [],
      "section_num": null,
      "paragraph_num": null
    },
    {
      "id": "node_72",
      "title": "10.3 Dokumentations-Sync (`doc-sync.js`)",
      "level": 3,
      "parent": "node_69",
      "content_preview": "10 System-Dokumente werden �berwacht und bei �nderung auto-committed.\nRollback: `node doc-sync.js rollback <hash>`.\n\n---",
      "line_start": 712,
      "line_end": 718,
      "category": "git",
      "children": [],
      "section_num": null,
      "paragraph_num": null
    },
    {
      "id": "node_73",
      "title": "-------------------------------------------",
      "level": 2,
      "parent": "node_13",
      "content_preview": "",
      "line_start": 719,
      "line_end": 719,
      "category": "general",
      "children": [],
      "section_num": null,
      "paragraph_num": null
    },
    {
      "id": "node_74",
      "title": "SEKTION 11 � GIT-ARCHIVE SYSTEM",
      "level": 2,
      "parent": "node_13",
      "content_preview": "",
      "line_start": 720,
      "line_end": 720,
      "category": "git",
      "children": [],
      "section_num": "11",
      "paragraph_num": null
    },
    {
      "id": "node_75",
      "title": "-------------------------------------------",
      "level": 2,
      "parent": "node_13",
      "content_preview": "",
      "line_start": 721,
      "line_end": 722,
      "category": "general",
      "children": [
        "node_76",
        "node_77"
      ],
      "section_num": null,
      "paragraph_num": null
    },
    {
      "id": "node_76",
      "title": "11.1 5 Separate Archive",
      "level": 3,
      "parent": "node_75",
      "content_preview": "| Archiv | Pfad | Inhalt |\n|--------|------|--------|\n| **Prompts** | `_archives/prompts/` | System- & Tool-Prompts |\n| **Snippets** | `_archives/snippets/` | JS, CSS, PowerShell |\n| **Workflows** | `_archives/workflows/` | Workflow-Definitionen |\n| **Agents** | `_archives/agents/` | Copilot, CodeRabbit, Antigravity |\n| **Blueprints** | `_archives/blueprints/` | Blaupausen + Impl-Pl�ne |",
      "line_start": 723,
      "line_end": 732,
      "category": "data",
      "children": [],
      "section_num": null,
      "paragraph_num": null
    },
    {
      "id": "node_77",
      "title": "11.2 Archiv-Regeln",
      "level": 3,
      "parent": "node_75",
      "content_preview": "- Jedes Archiv hat `*-index.json` + `README.md`\n- Jede �nderung wird Git-committed (R20)\n- Blaupausen + Analysen ? `blueprints/implementations/`\n- Prompt-�nderungen ? `prompts/`\n- Agent-Config-�nderungen ? `agents/{name}/`\n\n---",
      "line_start": 733,
      "line_end": 742,
      "category": "rules",
      "children": [],
      "section_num": null,
      "paragraph_num": null
    },
    {
      "id": "node_78",
      "title": "-------------------------------------------",
      "level": 2,
      "parent": "node_13",
      "content_preview": "",
      "line_start": 743,
      "line_end": 743,
      "category": "general",
      "children": [],
      "section_num": null,
      "paragraph_num": null
    },
    {
      "id": "node_79",
      "title": "SEKTION 12 � BACKEND / FRONTEND TRENNUNG",
      "level": 2,
      "parent": "node_13",
      "content_preview": "",
      "line_start": 744,
      "line_end": 744,
      "category": "backend",
      "children": [],
      "section_num": "12",
      "paragraph_num": null
    },
    {
      "id": "node_80",
      "title": "-------------------------------------------",
      "level": 2,
      "parent": "node_13",
      "content_preview": "",
      "line_start": 745,
      "line_end": 746,
      "category": "general",
      "children": [
        "node_81",
        "node_82",
        "node_83"
      ],
      "section_num": null,
      "paragraph_num": null
    },
    {
      "id": "node_81",
      "title": "12.1 Zwei Lager",
      "level": 3,
      "parent": "node_80",
      "content_preview": "| Lager | Sichtbarkeit | Inhalt |\n|-------|-------------|--------|\n| **BACKEND/** | Nur Admin + System | Auth, Admin Dashboard, Archive, Logs, Internes |\n| **FRONTEND/** | User + Kunden | Landing Page, App, Module, Profil |",
      "line_start": 747,
      "line_end": 753,
      "category": "module",
      "children": [],
      "section_num": null,
      "paragraph_num": null
    },
    {
      "id": "node_82",
      "title": "12.2 Daten-Isolation",
      "level": 3,
      "parent": "node_80",
      "content_preview": "- User sieht NUR eigene Daten (userId-Filter)\n- System-Kommunikation: base64-verschl�sselt\n- Admin (777): ALLES sichtbar\n- Chat/Konsole: Interne Daten nicht sichtbar",
      "line_start": 754,
      "line_end": 760,
      "category": "data",
      "children": [],
      "section_num": null,
      "paragraph_num": null
    },
    {
      "id": "node_83",
      "title": "12.3 API-Kommunikation",
      "level": 3,
      "parent": "node_80",
      "content_preview": "```\nFRONTEND --[API Key]--? BACKEND\n         ?--[encrypted]--\n```\n\nJeder Request: `Authorization: Bearer dkz_xxx`\n\n---",
      "line_start": 761,
      "line_end": 771,
      "category": "backend",
      "children": [],
      "section_num": null,
      "paragraph_num": null
    },
    {
      "id": "node_84",
      "title": "-------------------------------------------",
      "level": 2,
      "parent": "node_13",
      "content_preview": "",
      "line_start": 772,
      "line_end": 772,
      "category": "general",
      "children": [],
      "section_num": null,
      "paragraph_num": null
    },
    {
      "id": "node_85",
      "title": "SEKTION 13 � MULTI-USER + API KEYS",
      "level": 2,
      "parent": "node_13",
      "content_preview": "",
      "line_start": 773,
      "line_end": 773,
      "category": "backend",
      "children": [],
      "section_num": "13",
      "paragraph_num": null
    },
    {
      "id": "node_86",
      "title": "-------------------------------------------",
      "level": 2,
      "parent": "node_13",
      "content_preview": "",
      "line_start": 774,
      "line_end": 775,
      "category": "general",
      "children": [
        "node_87",
        "node_88",
        "node_89"
      ],
      "section_num": null,
      "paragraph_num": null
    },
    {
      "id": "node_87",
      "title": "13.1 Rollen (bestehend aus `roles.json`)",
      "level": 3,
      "parent": "node_86",
      "content_preview": "| Rolle | Level | Rechte |\n|-------|-------|--------|\n| ?? Admin | 100 | Alles, System, Deploy, Rollen erstellen |\n| ????? Developer | 50 | Code, Agenten, Logs, Deploy |\n| ??? Viewer | 20 | Nur Lesen |\n| ?? Guest | 10 | �ffentliche Bereiche |",
      "line_start": 776,
      "line_end": 784,
      "category": "agent",
      "children": [],
      "section_num": null,
      "paragraph_num": null
    },
    {
      "id": "node_88",
      "title": "13.2 API-Key Lifecycle",
      "level": 3,
      "parent": "node_86",
      "content_preview": "1. User ? Google Login ? Firebase Auth\n2. Backend ? User in `users.json` finden/erstellen\n3. API-Key generieren (AES-256 verschl�sselt)\n4. Frontend erh�lt Key ? speichert in `sessionStorage`\n5. Admin kann Keys jederzeit an/aus schalten",
      "line_start": 785,
      "line_end": 792,
      "category": "backend",
      "children": [],
      "section_num": null,
      "paragraph_num": null
    },
    {
      "id": "node_89",
      "title": "13.3 Per-User Git",
      "level": 3,
      "parent": "node_86",
      "content_preview": "Jeder User bekommt eigenes Git-Verzeichnis:\n`BACKEND/_data/users/{userId}/` � isoliert, nur eigene Daten.\n\n---\n\n> **??? Tags:** #playbook #dkz #design-system #output-regeln #farbschema #neonrot #button-design #tag-system #mindmap #tabellen #chat-optik #theme-switching #css-tokens #cyberclean #formatierung #standards #event-log #git-archives #backend-frontend #multi-user #api-keys\n>\n> **?? Kategorie:** K-Konfig � Systemkonfiguration\n> **?? Version:** v1.01.2_01\n> **?? Status:** ?? VERBINDLICH\n> *",
      "line_start": 793,
      "line_end": 808,
      "category": "git",
      "children": [],
      "section_num": null,
      "paragraph_num": null
    },
    {
      "id": "node_90",
      "title": "14. ONTHERUN MCP + NEXUZ-API",
      "level": 2,
      "parent": "node_13",
      "content_preview": "",
      "line_start": 809,
      "line_end": 810,
      "category": "backend",
      "children": [
        "node_91",
        "node_92",
        "node_93",
        "node_94",
        "node_95",
        "node_96"
      ],
      "section_num": null,
      "paragraph_num": null
    },
    {
      "id": "node_91",
      "title": "14.1 ONTHERUN -- MCP Server",
      "level": 3,
      "parent": "node_90",
      "content_preview": "Das Backend-Rueckgrat des DkZ Oekosystems. Model Context Protocol Server mit 34+ Tools.\n\n- **Pfad:** `ONTHERUN/`\n- **Start:** `node cli/dkz.js start` oder `DKZ_START.bat`\n- **Config:** `ONTHERUN/server/config.js` -- 12 Provider, n8n, Puter, NotebookLM\n- **Tools:** `server/tools/` -- tokens, integrations, research, prompts, chat, files, health, modules, seo, workflow, system\n\n**Regel:** Alle Backend-Aufrufe NUR ueber NEXUZ (R31). Kein direkter API-Zugriff aus Modulen.",
      "line_start": 811,
      "line_end": 821,
      "category": "backend",
      "children": [],
      "section_num": null,
      "paragraph_num": null
    },
    {
      "id": "node_92",
      "title": "14.2 NEXUZ-API -- Gateway",
      "level": 3,
      "parent": "node_90",
      "content_preview": "Express.js REST + WebSocket Gateway auf Port 3040.\n\n- **Pfad:** `ONTHERUN/gateway/`\n- **Endpoints:** `/api/v1/chat`, `/api/v1/modules`, `/api/v1/tools/execute`, `/api/v1/health`\n- **Middleware:** CORS, Helmet, Rate-Limiting, Logging\n- **Frontend-Bridge:** `shared/nexuz.js` -- Einbinden mit `<script src=\"../../shared/nexuz.js\"></script>`",
      "line_start": 822,
      "line_end": 830,
      "category": "backend",
      "children": [],
      "section_num": null,
      "paragraph_num": null
    },
    {
      "id": "node_93",
      "title": "14.3 James -- Evaluations-Agent",
      "level": 3,
      "parent": "node_90",
      "content_preview": "James LIEST und BEWERTET -- aendert NIE Code. 19 Rubric-Regeln in 6 Kategorien.\n\n- **Pfad:** `shared/dkz-james.js`\n- **Kategorien:** quality, security, design, prompt, structure, logic\n- **Score:** 0-100 mit Note A-F\n- **Integration:** Auto-Inject Panel (unten links) in allen Buildern + Iceberg\n- **Prompt Archive:** Bewertet Prompts via `otr_prompt_evaluate` MCP Tool",
      "line_start": 831,
      "line_end": 840,
      "category": "agent",
      "children": [],
      "section_num": null,
      "paragraph_num": null
    },
    {
      "id": "node_94",
      "title": "14.4 App Builder",
      "level": 3,
      "parent": "node_90",
      "content_preview": "Chat-Export Setup fuer 6 AI-Plattformen: OpenAI, Gemini, Claude, DeepSeek, Perplexity, Grok.\n\n- **Pfad:** `modules/app-builder/`\n- **Features:** Setup Save/Load/Export/Import, 6 Presets, Token-Management via NEXUZ\n- **API-Keys:** Via Settings Panel oder direkt im Builder",
      "line_start": 841,
      "line_end": 848,
      "category": "module",
      "children": [],
      "section_num": null,
      "paragraph_num": null
    },
    {
      "id": "node_95",
      "title": "14.5 Settings Panel",
      "level": 3,
      "parent": "node_90",
      "content_preview": "5 Tabs: API-Keys (9 Provider), Personalisierung (Akzentfarbe, Schrift, Sprache), Verbindungen (Gateway, n8n, Puter), Erlaubnisse (pro Modul), James Config (Schwellwerte, Regeln).\n\n- **Pfad:** `modules/settings/`",
      "line_start": 849,
      "line_end": 854,
      "category": "module",
      "children": [],
      "section_num": null,
      "paragraph_num": null
    },
    {
      "id": "node_96",
      "title": "14.6 DKZ_START.bat",
      "level": 3,
      "parent": "node_90",
      "content_preview": "Ecosystem Launcher. Doppelklick startet:\n1. Node.js + Python Check\n2. `npm install` + `pip install notebooklm-mcp-cli`\n3. Desktop-Shortcuts (Hub, Console, Server)\n4. Windows-Kontextmenue \"DkZ / Console oeffnen\"\n5. NEXUZ-API Gateway Start\n6. Landing Page oeffnen\n\n\n---",
      "line_start": 855,
      "line_end": 867,
      "category": "backend",
      "children": [],
      "section_num": null,
      "paragraph_num": null
    },
    {
      "id": "node_97",
      "title": "-------------------------------------------",
      "level": 2,
      "parent": "node_13",
      "content_preview": "",
      "line_start": 868,
      "line_end": 868,
      "category": "general",
      "children": [],
      "section_num": null,
      "paragraph_num": null
    },
    {
      "id": "node_98",
      "title": "SEKTION 15 � NETZWERK-INTEGRATION & AUTOMATISIERUNG",
      "level": 2,
      "parent": "node_13",
      "content_preview": "",
      "line_start": 869,
      "line_end": 869,
      "category": "general",
      "children": [],
      "section_num": "15",
      "paragraph_num": null
    },
    {
      "id": "node_99",
      "title": "-------------------------------------------",
      "level": 2,
      "parent": "node_13",
      "content_preview": "",
      "line_start": 870,
      "line_end": 871,
      "category": "general",
      "children": [
        "node_100",
        "node_101",
        "node_102",
        "node_103",
        "node_104",
        "node_105"
      ],
      "section_num": null,
      "paragraph_num": null
    },
    {
      "id": "node_100",
      "title": "15.1 Shared Scripts � Pflicht fuer ALLE Module",
      "level": 3,
      "parent": "node_99",
      "content_preview": "Jedes Modul MUSS diese 6 Scripts einbinden (via Auto-Injector oder manuell):\n\n| Script | Funktion | Pflicht |\n|--------|----------|---------|\n| dkz-james.js | Prompt-Bewertung, KNOWLEDGE, Rules, GM-Rules | JA |\n| dkz-memory.js | 3-Layer Memory (Hot/Warm/Cold), Presets, Conflicts | JA |\n| dkz-compaction.js | Auto-Compact, Backup/Rollback, 3 Strategien | JA |\n| dkz-iceberg.js | Versioned Prompt Storage, 7 Categories | JA |\n| dkz-prompt-score.js | Live Score Widget, textarea + div Support | JA |\n| ",
      "line_start": 872,
      "line_end": 886,
      "category": "module",
      "children": [],
      "section_num": null,
      "paragraph_num": null
    },
    {
      "id": "node_101",
      "title": "15.2 Bidirektionale Datenfluss-Regeln",
      "level": 3,
      "parent": "node_99",
      "content_preview": "R97: Jedes neue Modul muss beim Erstellen automatisch alle 6 Shared Scripts erhalten.\nR98: Jeder Builder muss ueber BuilderBridge bidirektional mit Iceberg und James verbunden sein.\nR99: Der Updater muss neue Module automatisch erkennen und in den HealthCheck aufnehmen.",
      "line_start": 887,
      "line_end": 892,
      "category": "rules",
      "children": [],
      "section_num": null,
      "paragraph_num": null
    },
    {
      "id": "node_102",
      "title": "15.3 AutoHealthCheck (dkz-updater.js)",
      "level": 3,
      "parent": "node_99",
      "content_preview": "Prueft alle 15 Minuten automatisch:\n- Iceberg >500 Prompts � Archiv-Export Warnung\n- localStorage >4MB � Auto-Compact + REDNOTE\n- Memory >85% Fill � REDNOTE (GM-02 Wache)\n- REDNOTE >10 offene � Review Warnung\n- Builder >200 Eintraege � Export Warnung",
      "line_start": 893,
      "line_end": 901,
      "category": "data",
      "children": [],
      "section_num": null,
      "paragraph_num": null
    },
    {
      "id": "node_103",
      "title": "15.4 Neues Modul integrieren � Checkliste",
      "level": 3,
      "parent": "node_99",
      "content_preview": "1. `tools/dkz-auto-inject.ps1 -SingleModule [name]` ausfuehren\n2. BUILDER_MAP in dkz-builder-bridge.js erweitern (wenn Builder)\n3. MODULES Array in dkz-updater.js erweitern\n4. Hub Auto-Discovery pruefen\n5. Stress-Test via /debug2 Workflow\n6. Git commit",
      "line_start": 902,
      "line_end": 910,
      "category": "module",
      "children": [],
      "section_num": null,
      "paragraph_num": null
    },
    {
      "id": "node_104",
      "title": "15.5 Content-Dokumentation",
      "level": 3,
      "parent": "node_99",
      "content_preview": "Alle Automatisierungen werden protokolliert unter:\n- debug�/STRESS_TEST_[datum].md\n- debug�/AUTOMATION_PROTOKOLL_[datum].md\n- shared/PROMPT_OPTIMIZER_DOCS.md\n- IMPLEMENTIERUNGSPLAN.md Phase 6",
      "line_start": 911,
      "line_end": 918,
      "category": "general",
      "children": [],
      "section_num": null,
      "paragraph_num": null
    },
    {
      "id": "node_105",
      "title": "15.6 Archiv-Pflicht (R100 � NIEMALS LOESCHEN)",
      "level": 3,
      "parent": "node_99",
      "content_preview": "> **KRITISCH:** Dateien, Module, Configs, Daten, Scripts, Logs � NICHTS darf geloescht werden.\n> Alles was nicht mehr gebraucht wird, wird in ein `_archives/` Verzeichnis VERSCHOBEN.\n\n```\nR100: LOESCHEN IST VERBOTEN. Immer verschieben nach _archives/.\n      Gilt fuer: Dateien, Module, Configs, Daten, Scripts, Logs, Prompts,\n      localStorage-Eintraege, Git-Branches, Backups � ALLES.\n\n      Ablauf:\n      1. Zieldatei identifizieren\n      2. _archives/ Ordner erstellen (falls nicht vorhanden)\n   ",
      "line_start": 919,
      "line_end": 946,
      "category": "rules",
      "children": [],
      "section_num": null,
      "paragraph_num": null
    },
    {
      "id": "node_106",
      "title": "-------------------------------------------",
      "level": 2,
      "parent": "node_13",
      "content_preview": "",
      "line_start": 947,
      "line_end": 947,
      "category": "general",
      "children": [],
      "section_num": null,
      "paragraph_num": null
    },
    {
      "id": "node_107",
      "title": "SEKTION 16 � SYSTEM-HAUPTINFORMATION & DOKUMENTEN-REGISTER",
      "level": 2,
      "parent": "node_13",
      "content_preview": "",
      "line_start": 948,
      "line_end": 948,
      "category": "output",
      "children": [],
      "section_num": "16",
      "paragraph_num": null
    },
    {
      "id": "node_108",
      "title": "-------------------------------------------",
      "level": 2,
      "parent": "node_13",
      "content_preview": "> **Zweck:** Zentraler Anker f�r ALLE systemrelevanten Informationen, Regeln, Architektur-Dokumente und Update-Verfahren. Jedes LLM / jeder Agent findet hier den vollst�ndigen �berblick �ber das DEVKiTZ� �kosystem.",
      "line_start": 949,
      "line_end": 952,
      "category": "output",
      "children": [
        "node_109",
        "node_110",
        "node_116",
        "node_117",
        "node_118",
        "node_119",
        "node_120",
        "node_121"
      ],
      "section_num": null,
      "paragraph_num": null
    },
    {
      "id": "node_109",
      "title": "16.1 System-Identit�t",
      "level": 3,
      "parent": "node_108",
      "content_preview": "| Eigenschaft | Wert |\n|-------------|------|\n| **Name** | DEVKiTZ� (Developer & Creator Hub) |\n| **Vision** | �Google f�r die EU\" � souver�nes, modulares �kosystem |\n| **Operator** | Seven / LIKEDBIG / 777 |\n| **Codename** | NEW EUROP ORDER |\n| **Motto** | �Das exakte Verfahren ist wichtiger als das Ergebnis\" |\n| **Design** | Cyberclean � Neonrot `#fa1e4e` � Dark/Crimson/Neon |\n| **Lizenz** | AGPL-3.0 / MIT |\n| **Architektur** | 5-Layer + Foundation (Frontend ? Orchestration ? Storage ? Infra ?",
      "line_start": 953,
      "line_end": 965,
      "category": "module",
      "children": [],
      "section_num": null,
      "paragraph_num": null
    },
    {
      "id": "node_110",
      "title": "16.2 Pflicht-Dokumente (IMMER aktuell halten)",
      "level": 3,
      "parent": "node_108",
      "content_preview": "> **KRITISCH:** Diese Dokumente bilden das Fundament des Systems. Bei JEDER �nderung am System M�SSEN die betroffenen Dokumente aktualisiert werden.",
      "line_start": 966,
      "line_end": 969,
      "category": "rules",
      "children": [
        "node_111",
        "node_112",
        "node_113",
        "node_114",
        "node_115"
      ],
      "section_num": null,
      "paragraph_num": null
    },
    {
      "id": "node_111",
      "title": "?? Tier 1 � Regelwerk & Identit�t (PFLICHTLEKT�RE)",
      "level": 4,
      "parent": "node_110",
      "content_preview": "| Dokument | Pfad | Inhalt | Zeichen |\n|----------|------|--------|---------|\n| **REGELWERK.md** | `C:\\DEVKiTZ\\REGELWERK.md` | 25 �kosystem-Regeln (R0�R25), Ordnerstruktur, Modul-Konventionen, Konflikt-Warnsystem | ~31K |\n| **claude.md** | `04_SYSTEM/claude.md` | Projekt-Identit�t, Architektur, Tech-Stack, Aktive Projekte, Ordnerstruktur, OpenClaw, ONTHERUN | ~14K |\n| **DKZ_PLAYBOOK.md** | `04_SYSTEM/DKZ_PLAYBOOK.md` | DU BIST HIER � Output-Regeln, Design-Standards, Tag-System, Farbschemata, Pro",
      "line_start": 970,
      "line_end": 978,
      "category": "rules",
      "children": [],
      "section_num": null,
      "paragraph_num": null
    },
    {
      "id": "node_112",
      "title": "?? Tier 2 � Architektur & Blueprints",
      "level": 4,
      "parent": "node_110",
      "content_preview": "| Dokument | Pfad | Inhalt |\n|----------|------|--------|\n| **Ecosystem Blueprint V2** | `04_SYSTEM/DKZ_ECOSYSTEM_BLUEPRINT_V2.md` | Vollst�ndige 5-Layer Architektur, Selbstreparatur, Feedback-Loops, Cloud-Strategie |\n| **Grand Architecture Symphony** | `04_SYSTEM/DKZ_GRAND_ARCHITECTURE_SYMPHONY.md` | Architektur-Gesamtbild, Komponenten-Zusammenspiel |\n| **Ecosystem Flow Blaupause** | `04_SYSTEM/DKZ_ECOSYSTEM_FLOW_BLAUPAUSE.md` | Datenfluss, Prozessabl�ufe, Automationsketten |\n| **MCP API Dokume",
      "line_start": 979,
      "line_end": 989,
      "category": "backend",
      "children": [],
      "section_num": null,
      "paragraph_num": null
    },
    {
      "id": "node_113",
      "title": "?? Tier 3 � Produkt-Blaupausen",
      "level": 4,
      "parent": "node_110",
      "content_preview": "| Dokument | Pfad | Produkt |\n|----------|------|---------|\n| **BotNet Marketplace** | `04_SYSTEM/BOTNET_MARKETPLACE_BLAUPAUSE.md` | BotNet� Agent-Marktplatz + DAC |\n| **BotNet Playbook** | `04_SYSTEM/BOTNET_PLAYBOOK.md` | BotNet� Strategien und Runbooks |\n| **Business Ecosystem** | `04_SYSTEM/BUSINESS_ECOSYSTEM_BLAUPAUSE.md` | Gesch�ftsmodell, Monetarisierung, Partnerschaften |\n| **DataLakeHouse** | `04_SYSTEM/DATALAKEHOUSE_BLAUPAUSE.md` | Apache Iceberg + DuckDB Architektur |\n| **DocEngine** |",
      "line_start": 990,
      "line_end": 1005,
      "category": "data",
      "children": [],
      "section_num": null,
      "paragraph_num": null
    },
    {
      "id": "node_114",
      "title": "?? Tier 4 � Registries & Konfiguration",
      "level": 4,
      "parent": "node_110",
      "content_preview": "| Registry | Pfad | Inhalt |\n|----------|------|--------|\n| **Master-Registry** | `01_PROJECTS/01_dashboard/REGISTRY.json` | Master-Index aller 85+ Module |\n| **Agenten-Registry** | `04_SYSTEM/SYSTEM/_core/agents-registry.json` | OpenClaw + PicoClaws + NanoBots |\n| **Teams-Registry** | `04_SYSTEM/SYSTEM/_core/teams-registry.json` | 6 BMAD Team-Templates |\n| **Leadership-Registry** | `04_SYSTEM/SYSTEM/_core/leadership-registry.json` | 3 Leadership-Templates (CTO/CMO/CISO) |\n| **Skills-Registry** ",
      "line_start": 1006,
      "line_end": 1025,
      "category": "agent",
      "children": [],
      "section_num": null,
      "paragraph_num": null
    },
    {
      "id": "node_115",
      "title": "? Tier 5 � Dokumentation & Anleitungen",
      "level": 4,
      "parent": "node_110",
      "content_preview": "| Dokument | Pfad | Inhalt |\n|----------|------|--------|\n| **Doc Management Blueprint** | `04_SYSTEM/DKZ_DOC_MANAGEMENT_BLUEPRINT.md` | Dokumentations-Architektur |\n| **Doc Management Doku** | `04_SYSTEM/DKZ_DOC_MANAGEMENT_DOKUMENTATION.md` | Dokumentations-Handbuch |\n| **Doc Management Datasheet** | `04_SYSTEM/DKZ_DOC_MANAGEMENT_DATASHEET.md` | Technisches Datenblatt |\n| **Doc Management Mindmap** | `04_SYSTEM/DKZ_DOC_MANAGEMENT_MINDMAP.md` | Visuelle Dokumentations-Map |\n| **DkZ Symbole** | `",
      "line_start": 1026,
      "line_end": 1040,
      "category": "data",
      "children": [],
      "section_num": null,
      "paragraph_num": null
    },
    {
      "id": "node_116",
      "title": "16.3 Regeln-Schnellreferenz",
      "level": 3,
      "parent": "node_108",
      "content_preview": "> Alle 25+ Regeln aus `REGELWERK.md` � hier komprimiert als Nachschlagewerk.\n\n| # | Regel | Kurzbeschreibung |\n|---|-------|-----------------|\n| R0 | L�SUNG > PROBLEM | Jede Handlung macht das System besser |\n| R1 | NIE L�SCHEN | Immer archivieren ? `99_ARCHIVE/` |\n| R2 | GIT NACH JEDER �NDERUNG | `prefix(bereich): was` |\n| R3 | ALLES BLEIBT VORHANDEN | Dateien sind immer nachverfolgbar |\n| R4 | PROAKTIVE VERBESSERUNG | Optimierungen sind Pflicht |\n| R5 | ERST ANALYSIEREN | Kein blindes Verschie",
      "line_start": 1041,
      "line_end": 1078,
      "category": "rules",
      "children": [],
      "section_num": null,
      "paragraph_num": null
    },
    {
      "id": "node_117",
      "title": "16.4 Produkte-Register�",
      "level": 3,
      "parent": "node_108",
      "content_preview": "| Produkt� | Typ | Status | Pfad |\n|----------|-----|--------|------|\n| DEVKiTZ� | �kosystem | ?? AKTIV | `C:\\DEVKiTZ\\` |\n| DkZ� | Dashboard | ?? AKTIV | `01_PROJECTS/01_dashboard/` |\n| OpenClaw� | Orchestrator | ?? AKTIV | `01_PROJECTS/07_dkz/OpenClaw/` |\n| PicoClaw� | Micro-Agent | ?? AKTIV | (Teil von OpenClaw) |\n| BotNet� | Marketplace | ?? DEV | `04_SYSTEM/BOTNET/` |\n| James� | Evaluator | ?? AKTIV | `shared/dkz-james.js` |\n| AiAiKirk� | KI-Assistent | ?? DEV | `01_PROJECTS/08_aiaikirk/` |\n",
      "line_start": 1079,
      "line_end": 1101,
      "category": "agent",
      "children": [],
      "section_num": null,
      "paragraph_num": null
    },
    {
      "id": "node_118",
      "title": "16.5 Tech-Stack-Referenz",
      "level": 3,
      "parent": "node_108",
      "content_preview": "```\n+----------------------------------------------------------+\n�  LAYER 1: FRONTEND                                        �\n�  HTML5 + CSS3 + Vanilla JS (ES6+) � Kein Framework       �\n�  DkZ Design System v2 � Inter + JetBrains Mono           �\n�  72 Module + 14 Dashboards � localStorage + JSON          �\n+----------------------------------------------------------�\n�  LAYER 2: ORCHESTRATION                                   �\n�  OpenClaw (Python/FastAPI) � PicoClaws � NanoBots         �\n�  O",
      "line_start": 1102,
      "line_end": 1132,
      "category": "module",
      "children": [],
      "section_num": null,
      "paragraph_num": null
    },
    {
      "id": "node_119",
      "title": "16.6 Update-Verfahren f�r System-Dokumente",
      "level": 3,
      "parent": "node_108",
      "content_preview": "> **PFLICHT:** Bei JEDER �nderung am System m�ssen die betroffenen Dokumente aktualisiert werden.\n\n| �nderungstyp | Betroffene Dokumente |\n|-------------|---------------------|\n| **Neues Modul** | REGISTRY.json, BLAUPAUSE.md, features.json, claude.md |\n| **Neue Regel** | REGELWERK.md, DKZ_PLAYBOOK.md �16.3, claude.md |\n| **Neues Produkt�** | DKZ_PLAYBOOK.md �16.4, claude.md, REGELWERK.md �R25 |\n| **Architektur-�nderung** | DKZ_ECOSYSTEM_BLUEPRINT_V2.md, claude.md, BLAUPAUSE.md |\n| **Neue Registr",
      "line_start": 1133,
      "line_end": 1149,
      "category": "rules",
      "children": [],
      "section_num": null,
      "paragraph_num": null
    },
    {
      "id": "node_120",
      "title": "16.7 Dokumenten-Hierarchie",
      "level": 3,
      "parent": "node_108",
      "content_preview": "```\n                    +------------------+\n                    �   REGELWERK.md   �  ? Oberste Instanz\n                    �   25+ Regeln     �\n                    +------------------+\n                             �\n              +--------------+--------------+\n              �              �              �\n     +----------------+ +------------+ +--------------+\n     �  claude.md     � � PLAYBOOK   � � BLAUPAUSE    �\n     �  Identit�t     � � Standards  � � Architektur  �\n     +----------------",
      "line_start": 1150,
      "line_end": 1170,
      "category": "rules",
      "children": [],
      "section_num": null,
      "paragraph_num": null
    },
    {
      "id": "node_121",
      "title": "16.8 Kompakt-Referenzkarte",
      "level": 3,
      "parent": "node_108",
      "content_preview": "> Eine komprimierte Version aller System-Informationen (10.000 Zeichen Limit):\n> **Pfad:** `C:\\Users\\777\\Downloads\\DEVKiTZ_HAUPTINFORMATION_KONTENERSTELLUNG.md`\n>\n> Enth�lt auf ~7.000 Zeichen: Identit�t, Architektur, Produkte, Ordnerstruktur, Regeln, Design, Tech-Stack, Content-Regeln, Agent-System, Datenpersistenz, Shared Scripts und Workflow-Fluss.\n\n---\n\n> **??? Tags:** #system-hauptinformation #dokumenten-register #regelwerk #blaupausen #registries #architektur #update-verfahren #playbook #dk",
      "line_start": 1171,
      "line_end": 1183,
      "category": "output",
      "children": [],
      "section_num": null,
      "paragraph_num": null
    },
    {
      "id": "node_122",
      "title": "-------------------------------------------",
      "level": 2,
      "parent": "node_13",
      "content_preview": "",
      "line_start": 1184,
      "line_end": 1184,
      "category": "general",
      "children": [],
      "section_num": null,
      "paragraph_num": null
    },
    {
      "id": "node_123",
      "title": "�17 � PHASEN-PFLICHT (Implementierungs-Workflow)",
      "level": 2,
      "parent": "node_13",
      "content_preview": "",
      "line_start": 1185,
      "line_end": 1185,
      "category": "rules",
      "children": [],
      "section_num": null,
      "paragraph_num": null
    },
    {
      "id": "node_124",
      "title": "-------------------------------------------",
      "level": 2,
      "parent": "node_13",
      "content_preview": "> **?? PFLICHT:** Jede Implementierung � ob neues Modul, Feature, Bugfix oder System-�nderung � MUSS mindestens die folgenden **5 Phasen** durchlaufen. **Mehr Phasen sind erlaubt, weniger NIE.**",
      "line_start": 1186,
      "line_end": 1189,
      "category": "module",
      "children": [
        "node_125",
        "node_126",
        "node_127",
        "node_128",
        "node_129",
        "node_130",
        "node_131",
        "node_132",
        "node_133"
      ],
      "section_num": null,
      "paragraph_num": null
    },
    {
      "id": "node_125",
      "title": "17.1 Die 5 Pflicht-Phasen",
      "level": 3,
      "parent": "node_124",
      "content_preview": "```\n+-------------------------------------------------------------+\n�  ??  MINDESTENS 5 PHASEN � IMMER � KEINE AUSNAHMEN        �\n�  Mehr Phasen = ? erlaubt � Weniger Phasen = ? VERBOTEN    �\n+-------------------------------------------------------------+\n```\n\n| Phase | Name | Pflicht | Beschreibung |\n|:------|:-----|:--------|:-------------|\n| **Phase 1** | ?? **Planung** | ? IMMER | Startup, Analyse, Plan erstellen, User-Genehmigung |\n| **Phase 2** | ?? **Arbeit** | ? IMMER | Projektspezifisch",
      "line_start": 1190,
      "line_end": 1206,
      "category": "rules",
      "children": [],
      "section_num": null,
      "paragraph_num": null
    },
    {
      "id": "node_126",
      "title": "17.2 Workflow-Flussdiagramm",
      "level": 3,
      "parent": "node_124",
      "content_preview": "```\n  +----------------+\n  �  START          �\n  �  Neuer Auftrag  �\n  +----------------+\n          �\n          ?\n  +----------------+     ? Fehlt was?\n  � PHASE 1        �------------------+\n  � ?? Planung     �                  �\n  � Startup + Plan �?-----------------+\n  +----------------+     Zur�ck zur Planung\n          �\n          � ? Quality Gate 1: User-Genehmigung erhalten\n          ?\n  +----------------+     ? Blockiert?\n  � PHASE 2        �------------------+\n  � ?? Arbeit      �      ",
      "line_start": 1207,
      "line_end": 1266,
      "category": "general",
      "children": [],
      "section_num": null,
      "paragraph_num": null
    },
    {
      "id": "node_127",
      "title": "17.3 Phase 1 � Planung (Pflicht-Schritte)",
      "level": 3,
      "parent": "node_124",
      "content_preview": "```\nPhase 1: Planung\n+-- 1.1 Startup-Workflow ausf�hren (ORDNER.ini, REGELWERK.md, claude.md)\n+-- 1.2 Playbook lesen (DKZ_PLAYBOOK.md) � inkl. �17 Phasen-Pflicht\n+-- 1.3 REGISTRY.json analysieren (n�chste freie MOD-ID ermitteln)\n+-- 1.4 Bestehende Module/Systeme pr�fen (Duplikate vermeiden!)\n+-- 1.5 Shared Scripts identifizieren (welche werden gebraucht?)\n+-- 1.6 Abh�ngigkeiten kl�ren (Gallery, Hub, andere Module)\n+-- 1.7 Implementierungsplan erstellen (implementation_plan.md)\n+-- 1.8 task.md Ch",
      "line_start": 1267,
      "line_end": 1285,
      "category": "rules",
      "children": [],
      "section_num": null,
      "paragraph_num": null
    },
    {
      "id": "node_128",
      "title": "17.4 Phase 2 � Arbeit (Projektspezifisch)",
      "level": 3,
      "parent": "node_124",
      "content_preview": "Phase 2 ist **variabel** und h�ngt vom Projekt ab. Beispiel f�r ein neues Modul:\n\n```\nPhase 2: Modul erstellen\n+-- 2.1 Ordner modules/[modul-name]/ erstellen\n+-- 2.2 index.html mit allen Hauptbereichen bauen\n�   +-- HTML-Struktur (Header, Tabs, Cards, Footer)\n�   +-- CSS (DkZ Design System v2 � Farben, Fonts, Glassmorphism, Blobs)\n�   +-- JavaScript (Logik, Events, localStorage)\n�   +-- Info-Popups + Guides einbauen\n+-- 2.3 features.json erstellen (MOD-XXX)\n+-- 2.4 Shared Scripts einbinden:\n�   ",
      "line_start": 1286,
      "line_end": 1311,
      "category": "design",
      "children": [],
      "section_num": null,
      "paragraph_num": null
    },
    {
      "id": "node_129",
      "title": "17.5 Phase 3 � Registrierung (Pflicht-Schritte)",
      "level": 3,
      "parent": "node_124",
      "content_preview": "```\nPhase 3: Registrierung\n+-- 3.1 REGISTRY.json aktualisieren:\n�   +-- Neuen Modul-Eintrag mit Pfad + features.json\n�   +-- MOD-ID vergeben (fortlaufend!)\n�   +-- totalModules Z�hler erh�hen\n+-- 3.2 BLAUPAUSE.md aktualisieren:\n�   +-- Ordnerbaum erweitern (alphabetisch einsortieren!)\n�   +-- Modul-Count erh�hen\n�   +-- Kategorie-Zuordnung (Design & UI, Dev Tools, etc.)\n+-- 3.3 Gallery & Datenbank-Eintrag hinzuf�gen (wo anwendbar)\n+-- 3.4 Hub-Verlinkung pr�fen (automatisch via modules/ Scan)\n+--",
      "line_start": 1312,
      "line_end": 1333,
      "category": "rules",
      "children": [],
      "section_num": null,
      "paragraph_num": null
    },
    {
      "id": "node_130",
      "title": "17.6 Phase 4 � Verifikation (Pflicht-Schritte)",
      "level": 3,
      "parent": "node_124",
      "content_preview": "```\nPhase 4: Verifikation\n+-- 4.1 Browser-Test:\n�   +-- index.html im Browser �ffnen\n�   +-- Screenshot jeder Ansicht/Tab machen\n�   +-- DkZ Design pr�fen (#fa1e4e Akzent, Dark Theme, Blobs)\n�   +-- Responsive pr�fen (Desktop + Mobile)\n�   +-- Console auf Fehler pr�fen (keine JS Errors!)\n+-- 4.2 Integration testen:\n�   +-- ? Hub Link funktioniert\n�   +-- Shared Scripts laden (Debug-Panel, Copilot etc.)\n�   +-- Toast-System funktioniert\n�   +-- Theme-Toggle funktioniert\n+-- 4.3 Funktions-Test:\n� ",
      "line_start": 1334,
      "line_end": 1363,
      "category": "rules",
      "children": [],
      "section_num": null,
      "paragraph_num": null
    },
    {
      "id": "node_131",
      "title": "17.7 Phase 5 � Git Commit (Pflicht-Schritte)",
      "level": 3,
      "parent": "node_124",
      "content_preview": "```\nPhase 5: Git Commit\n+-- 5.1 git add -A (alle �nderungen stagen)\n+-- 5.2 git status pr�fen (nur erwartete Dateien?)\n+-- 5.3 Commit mit aussagekr�ftiger Message:\n�   +-- Neue Module: feat([modul]): initial [Name] v0.01\n�   +-- Registrierung: docs: register [modul] MOD-XXX\n�   +-- Bugfixes: fix([modul]): [Beschreibung]\n�   +-- Updates: update([modul]): [Beschreibung] v[X.XX]\n+-- 5.4 Versionen im �kosystem updaten:\n�   +-- features.json ? version Feld\n�   +-- index.html ? Header + Footer\n�   +--",
      "line_start": 1364,
      "line_end": 1385,
      "category": "git",
      "children": [],
      "section_num": null,
      "paragraph_num": null
    },
    {
      "id": "node_132",
      "title": "17.8 Fehlerbehandlung & Rollback",
      "level": 3,
      "parent": "node_124",
      "content_preview": "Was tun, wenn in einer Phase ein Fehler auftritt?\n\n| Fehler in Phase | Aktion | Zur�ck zu |\n|:----------------|:-------|:----------|\n| Phase 1 � Plan unvollst�ndig | Plan erg�nzen, erneut vorlegen | Phase 1 (Neustart) |\n| Phase 2 � Code-Fehler | Bugfix direkt in Phase 2 | Phase 2 (weiter) |\n| Phase 2 � Design falsch | Zur�ck zur Planung wenn grundlegend | Phase 1 (teilweise) |\n| Phase 3 � REGISTRY kaputt | JSON reparieren, validieren | Phase 3 (Neustart) |\n| Phase 4 � Test fehlgeschlagen | Bug i",
      "line_start": 1386,
      "line_end": 1401,
      "category": "design",
      "children": [],
      "section_num": null,
      "paragraph_num": null
    },
    {
      "id": "node_133",
      "title": "17.9 task.md Checklisten-Template",
      "level": 3,
      "parent": "node_124",
      "content_preview": "Jede Implementierung beginnt mit einer `task.md` in folgendem Format:\n\n```markdown",
      "line_start": 1402,
      "line_end": 1406,
      "category": "output",
      "children": [],
      "section_num": null,
      "paragraph_num": null
    },
    {
      "id": "node_134",
      "title": "[Projektname] � task.md",
      "level": 1,
      "parent": null,
      "content_preview": "",
      "line_start": 1407,
      "line_end": 1408,
      "category": "general",
      "children": [
        "node_135",
        "node_136",
        "node_137",
        "node_138",
        "node_139",
        "node_145",
        "node_146",
        "node_147",
        "node_153",
        "node_160",
        "node_166",
        "node_171",
        "node_175",
        "node_176",
        "node_177",
        "node_178",
        "node_181",
        "node_185",
        "node_186",
        "node_187"
      ],
      "section_num": null,
      "paragraph_num": null
    },
    {
      "id": "node_135",
      "title": "Phase 1: Planung",
      "level": 2,
      "parent": "node_134",
      "content_preview": "- [ ] Startup-Workflow ausgef�hrt\n- [ ] Playbook + REGISTRY gelesen\n- [ ] Implementierungsplan erstellt\n- [ ] User-Genehmigung erhalten",
      "line_start": 1409,
      "line_end": 1414,
      "category": "general",
      "children": [],
      "section_num": null,
      "paragraph_num": null
    },
    {
      "id": "node_136",
      "title": "Phase 2: [Projektspezifischer Name]",
      "level": 2,
      "parent": "node_134",
      "content_preview": "- [ ] [Schritt 1]\n- [ ] [Schritt 2]\n- [ ] [Schritt N...]",
      "line_start": 1415,
      "line_end": 1419,
      "category": "general",
      "children": [],
      "section_num": null,
      "paragraph_num": null
    },
    {
      "id": "node_137",
      "title": "Phase 3: Registrierung",
      "level": 2,
      "parent": "node_134",
      "content_preview": "- [ ] REGISTRY.json aktualisiert\n- [ ] BLAUPAUSE.md aktualisiert\n- [ ] Gallery/Datenbank-Eintrag",
      "line_start": 1420,
      "line_end": 1424,
      "category": "data",
      "children": [],
      "section_num": null,
      "paragraph_num": null
    },
    {
      "id": "node_138",
      "title": "Phase 4: Verifikation",
      "level": 2,
      "parent": "node_134",
      "content_preview": "- [ ] Browser-Test bestanden\n- [ ] Integration getestet\n- [ ] Funktions-Test bestanden",
      "line_start": 1425,
      "line_end": 1429,
      "category": "general",
      "children": [],
      "section_num": null,
      "paragraph_num": null
    },
    {
      "id": "node_139",
      "title": "Phase 5: Git Commit",
      "level": 2,
      "parent": "node_134",
      "content_preview": "- [ ] �nderungen committed\n- [ ] Versionen aktualisiert\n- [ ] User informiert\n```\n\n**Status-Notation:**\n- `[ ]` � Offen\n- `[/]` � In Arbeit\n- `[x]` � Erledigt\n- `[!]` � Blockiert (Grund angeben!)",
      "line_start": 1430,
      "line_end": 1441,
      "category": "git",
      "children": [
        "node_140",
        "node_141",
        "node_142",
        "node_143",
        "node_144"
      ],
      "section_num": null,
      "paragraph_num": null
    },
    {
      "id": "node_140",
      "title": "17.10 Status-Indikatoren pro Phase",
      "level": 3,
      "parent": "node_139",
      "content_preview": "| Indikator | Bedeutung | Emoji |\n|:----------|:----------|:------|\n| ?? GEPLANT | Phase steht bevor, noch nicht gestartet | ?? |\n| ?? IN ARBEIT | Phase l�uft gerade | ?? |\n| ?? ABGESCHLOSSEN | Phase erfolgreich beendet | ?? |\n| ?? FEHLGESCHLAGEN | Phase hat Fehler, Rollback n�tig | ?? |\n| ? �BERSPRUNGEN | Phase wurde korrekt �bersprungen (nur Zusatz-Phasen!) | ? |\n| ?? BLOCKIERT | Wartet auf User-Input oder externe Abh�ngigkeit | ?? |",
      "line_start": 1442,
      "line_end": 1452,
      "category": "general",
      "children": [],
      "section_num": null,
      "paragraph_num": null
    },
    {
      "id": "node_141",
      "title": "17.11 Pflicht-Artefakte pro Phase",
      "level": 3,
      "parent": "node_139",
      "content_preview": "| Phase | Pflicht-Artefakt | Beschreibung |\n|:------|:----------------|:-------------|\n| Phase 1 | `implementation_plan.md` | Detaillierter Plan mit allen �nderungen |\n| Phase 1 | `task.md` | Checkliste mit allen 5 Phasen |\n| Phase 2 | Projektdateien | index.html, features.json etc. |\n| Phase 3 | REGISTRY.json Update | Neuer Eintrag + Count |\n| Phase 3 | BLAUPAUSE.md Update | Ordnerbaum + Kategorie |\n| Phase 4 | Screenshots | Mindestens 1 Browser-Screenshot |\n| Phase 5 | Git Commit | Aussagekr�f",
      "line_start": 1453,
      "line_end": 1465,
      "category": "rules",
      "children": [],
      "section_num": null,
      "paragraph_num": null
    },
    {
      "id": "node_142",
      "title": "17.12 Verbotene Abk�rzungen",
      "level": 3,
      "parent": "node_139",
      "content_preview": "```\n? VERBOTEN:\n+-- Code schreiben OHNE Implementierungsplan\n+-- Phasen �berspringen oder zusammenlegen\n+-- Phase 4 (Test) auslassen weil �es sicher funktioniert\"\n+-- Phase 5 (Git) vergessen oder aufschieben\n+-- Phase 3 (Registrierung) ignorieren\n+-- Arbeit beginnen OHNE User-Genehmigung\n+-- REGISTRY.json manuell editieren OHNE JSON-Validierung\n+-- Dateien l�schen statt archivieren (? R1!)\n```",
      "line_start": 1466,
      "line_end": 1479,
      "category": "rules",
      "children": [],
      "section_num": null,
      "paragraph_num": null
    },
    {
      "id": "node_143",
      "title": "17.13 Erweiterte Phasen (Optional)",
      "level": 3,
      "parent": "node_139",
      "content_preview": "Zus�tzliche Phasen k�nnen jederzeit hinzugef�gt werden:\n\n| Zusatz-Phase | Wann? | Beispiel |\n|:-------------|:------|:---------|\n| Phase 1b: Requirement Review | Bei unklaren Anforderungen | User befragen |\n| Phase 2b: Design Review | Bei komplexen UI-Komponenten | Mockup erstellen |\n| Phase 2c: API-Integration | Bei externen API-Anbindungen | API-Keys testen |\n| Phase 2d: Datenbank-Schema | Bei neuen Datenstrukturen | JSON-Schema definieren |\n| Phase 3b: Cross-Module Links | Bei bidirektionalen",
      "line_start": 1480,
      "line_end": 1498,
      "category": "backend",
      "children": [],
      "section_num": null,
      "paragraph_num": null
    },
    {
      "id": "node_144",
      "title": "17.14 Namenskonventionen",
      "level": 3,
      "parent": "node_139",
      "content_preview": "| Element | Format | Beispiel |\n|:--------|:-------|:---------|\n| Modul-Ordner | `kebab-case` | `image-forge` |\n| Modul-ID | `MOD-XXX` (fortlaufend) | `MOD-074` |\n| Commit Message | `type(scope): beschreibung` | `feat(image-forge): initial v0.01` |\n| Version | `v[major].[minor]` | `v0.01` |\n| localStorage Key | `dkz-[modul-name]` | `dkz-imageforge` |\n| features.json | Immer im Modul-Root | `modules/x/features.json` |\n| Implementierungsplan | `implementation_plan.md` | Im Artefakt-Ordner |\n| Chec",
      "line_start": 1499,
      "line_end": 1514,
      "category": "output",
      "children": [],
      "section_num": null,
      "paragraph_num": null
    },
    {
      "id": "node_145",
      "title": "-------------------------------------------",
      "level": 2,
      "parent": "node_134",
      "content_preview": "",
      "line_start": 1515,
      "line_end": 1515,
      "category": "general",
      "children": [],
      "section_num": null,
      "paragraph_num": null
    },
    {
      "id": "node_146",
      "title": "SEKTION 18 � NAMING RULE (� Pflicht)",
      "level": 2,
      "parent": "node_134",
      "content_preview": "",
      "line_start": 1516,
      "line_end": 1516,
      "category": "rules",
      "children": [],
      "section_num": "18",
      "paragraph_num": null
    },
    {
      "id": "node_147",
      "title": "-------------------------------------------",
      "level": 2,
      "parent": "node_134",
      "content_preview": "",
      "line_start": 1517,
      "line_end": 1518,
      "category": "general",
      "children": [
        "node_148",
        "node_149",
        "node_150",
        "node_151",
        "node_152"
      ],
      "section_num": null,
      "paragraph_num": null
    },
    {
      "id": "node_148",
      "title": "�18.1 Eigennamen mit �",
      "level": 3,
      "parent": "node_147",
      "content_preview": "> **VERBINDLICH:** Alle Eigennamen des DkZ-�kosystems werden in UI-Strings, Dokumentation, Commits und Playbook-Referenzen immer mit � geschrieben.\n\n| Name | Schreibweise | Kontext |\n|:-----|:-------------|:--------|\n| NEXUZ | **NEXUZ�** | Frontend-Backend Bridge, MCP-System |\n| NEXUZ� Builder | **NEXUZ� Builder (MCP�)�** | MCP Pool Builder |\n| JAMEZ | **JAMEZ�** | Evaluations-Agent, Builder |\n| DEVKiTZ | **DEVKiTZ�** | �kosystem-Name |\n| DkZ | **DkZ�** | Design-System Prefix |",
      "line_start": 1519,
      "line_end": 1530,
      "category": "backend",
      "children": [],
      "section_num": null,
      "paragraph_num": null
    },
    {
      "id": "node_149",
      "title": "�18.2 Anwendungsregel",
      "level": 3,
      "parent": "node_147",
      "content_preview": "```\n? Korrekt:   NEXUZ� Gateway verbunden\n? Falsch:    NEXUZ Gateway verbunden\n\n? Korrekt:   JAMEZ� Eval Score: 85/100\n? Falsch:    James Eval Score: 85/100\n\n? Korrekt:   DEVKiTZ� �kosystem\n? Falsch:    DEVKiTZ �kosystem\n```",
      "line_start": 1531,
      "line_end": 1543,
      "category": "rules",
      "children": [],
      "section_num": null,
      "paragraph_num": null
    },
    {
      "id": "node_150",
      "title": "�18.3 JS-Variablennamen (Ausnahme)",
      "level": 3,
      "parent": "node_147",
      "content_preview": "JavaScript-Variablen bleiben OHNE � (technische Limitierung):\n- `window.NEXUZ` ? (kein � in JS)\n- `window.JAMEZ` ? (kein � in JS)\n- UI-String: `\"NEXUZ� v1.0\"` ? (� in Strings)",
      "line_start": 1544,
      "line_end": 1550,
      "category": "general",
      "children": [],
      "section_num": null,
      "paragraph_num": null
    },
    {
      "id": "node_151",
      "title": "�18.4 Eiserne Regeln",
      "level": 3,
      "parent": "node_147",
      "content_preview": "| Regel | Beschreibung | Durchsetzung |\n|:------|:-------------|:-------------|\n| **L�schverbot** | Dateien werden NIEMALS gel�scht, nur in `/Archive/` verschoben | `ArchiveManager.gs` |\n| **Naming �** | Alle Eigennamen mit � in allen Outputs | �18.1 |\n| **Phasen-Pflicht** | Min. 5 Phasen bei jedem Projekt (�17) | Implementierungs-Workflow |\n| **7-Block-Standard** | Jeder Output folgt dem 7-Block-Schema (�1.1) | Output-Formatierung |",
      "line_start": 1551,
      "line_end": 1559,
      "category": "rules",
      "children": [],
      "section_num": null,
      "paragraph_num": null
    },
    {
      "id": "node_152",
      "title": "�18.5 Wissensdatenbank-Naming",
      "level": 3,
      "parent": "node_147",
      "content_preview": "Alle Wissenseintr�ge folgen dem Schema:\n\n```\n{version}_{projektname}_{rubrik}.json\nBeispiel: v0.01_ImageForge_impl.json\n```\n\n| Rubrik | K�rzel | Speicher |\n|:-------|:-------|:---------|\n| Implementierungsplan | `impl` | Google Sheet + localStorage + DEEPKEEP |\n| Walkthrough | `walk` | Google Sheet + localStorage + DEEPKEEP |\n| Research | `research` | Google Sheet + localStorage + DEEPKEEP + Google Docs Import |\n| Task | `task` | Google Sheet + localStorage + DEEPKEEP |\n\n\n---",
      "line_start": 1560,
      "line_end": 1578,
      "category": "data",
      "children": [],
      "section_num": null,
      "paragraph_num": null
    },
    {
      "id": "node_153",
      "title": "�19 � Prompt-Hub Architektur",
      "level": 2,
      "parent": "node_134",
      "content_preview": "**LLM-ANWEISUNG:**\n> Wenn du Prompts liest oder schreibst, nutze IMMER `DkzPromptHub` aus `dkz-prompt-hub.js`.\n> Es gibt EINE zentrale Quelle: `dkz-prompts` (localStorage) mit 2 Rolling Backups.\n> Legacy Keys (`dkz-promptgen-saved`, `dkz-prompt-archive`, etc.) NICHT L�SCHEN � sie dienen als Backup.",
      "line_start": 1579,
      "line_end": 1585,
      "category": "module",
      "children": [
        "node_154",
        "node_155",
        "node_156",
        "node_157",
        "node_158",
        "node_159"
      ],
      "section_num": null,
      "paragraph_num": null
    },
    {
      "id": "node_154",
      "title": "Zentrale API",
      "level": 3,
      "parent": "node_153",
      "content_preview": "| Methode | Beschreibung |\n|:--------|:-------------|\n| `DkzPromptHub.addPrompt(obj, source)` | Prompt hinzuf�gen mit Source-Tag |\n| `DkzPromptHub.getAll({source, search})` | Alle Prompts filtern |\n| `DkzPromptHub.getById(id)` | Einzelnen Prompt laden |\n| `DkzPromptHub.updatePrompt(id, updates)` | Prompt aktualisieren |\n| `DkzPromptHub.getStats()` | Statistiken (total, bySource) |\n| `DkzPromptHub.sendToModule(id, data)` | Daten an anderes Modul senden |\n| `DkzPromptHub.receiveFromModule()` | Emp",
      "line_start": 1586,
      "line_end": 1596,
      "category": "backend",
      "children": [],
      "section_num": null,
      "paragraph_num": null
    },
    {
      "id": "node_155",
      "title": "Source Tags (Pflicht bei addPrompt)",
      "level": 3,
      "parent": "node_153",
      "content_preview": "`gen` = Prompt Generator | `arc` = Prompt Archiv | `eng` = Prompter\n`chat` = AI Chat | `loop` = Loop Dashboard | `import` = CSV/JSON Import",
      "line_start": 1597,
      "line_end": 1600,
      "category": "rules",
      "children": [],
      "section_num": null,
      "paragraph_num": null
    },
    {
      "id": "node_156",
      "title": "Datenfluss",
      "level": 3,
      "parent": "node_153",
      "content_preview": "```\nprompt-generator --+\nprompt-viewer    --�\nprompter (400+)  --+--? dkz-prompts --? bak1 --? bak2\nai-chat          --�\nloop-dashboard   --+\n```",
      "line_start": 1601,
      "line_end": 1609,
      "category": "data",
      "children": [],
      "section_num": null,
      "paragraph_num": null
    },
    {
      "id": "node_157",
      "title": "Builder Chain (Auto-Transfer via localStorage)",
      "level": 3,
      "parent": "node_153",
      "content_preview": "```\nAction-Builder ? dkz-action-to-skill ? Skill-Builder\nSkill-Builder  ? dkz-skill-to-agent  ? Agent-Builder\nSkill-Builder  ? dkz-skill-to-workflow ? Workflow-Builder\nAgent-Builder  ? dkz-agent-to-team    ? Team-Builder\nPrompt-Gen     ? dkz-loop-import-prompt ? Loop-Dashboard\n```",
      "line_start": 1610,
      "line_end": 1618,
      "category": "module",
      "children": [],
      "section_num": null,
      "paragraph_num": null
    },
    {
      "id": "node_158",
      "title": "Cross-Module Navigation",
      "level": 3,
      "parent": "node_153",
      "content_preview": "`dkz-prompt-hub.js` injiziert automatisch eine fixe Nav-Bar am unteren Bildschirmrand.\n3 Gruppen: **Prompts** (5) | **Builder** (7) | **System** (2) � insgesamt 14 Module verkn�pft.",
      "line_start": 1619,
      "line_end": 1622,
      "category": "module",
      "children": [],
      "section_num": null,
      "paragraph_num": null
    },
    {
      "id": "node_159",
      "title": "Bei �nderungen an Prompt-Modulen",
      "level": 3,
      "parent": "node_153",
      "content_preview": "1. `dkz-prompt-hub.js` NICHT brechen (R100)\n2. Source-Tags bei neuen Quellen erweitern\n3. Neue Module: `<script src=\"../../shared/dkz-prompt-hub.js\"></script>` vor `</body>`\n4. `NAV_MODULES` Array in `dkz-prompt-hub.js` erweitern\n5. Git Commit: `feat(prompt-hub): [beschreibung]`\n6. BLAUPAUSE.md + IMPLEMENTIERUNGSPLAN.md aktualisieren\n\n\n---",
      "line_start": 1623,
      "line_end": 1633,
      "category": "module",
      "children": [],
      "section_num": null,
      "paragraph_num": null
    },
    {
      "id": "node_160",
      "title": "�20 � Navigation, Notizen & �berarbeitungsprotokoll",
      "level": 2,
      "parent": "node_134",
      "content_preview": "",
      "line_start": 1634,
      "line_end": 1635,
      "category": "general",
      "children": [
        "node_161",
        "node_162",
        "node_163",
        "node_164",
        "node_165"
      ],
      "section_num": null,
      "paragraph_num": null
    },
    {
      "id": "node_161",
      "title": "Navigation (dkz-navbar.js)",
      "level": 3,
      "parent": "node_160",
      "content_preview": "- Hamburger ? oben links ? animiertes Slide-In Men�\n- 5 Gruppen: Wissen, Prompts, Builder, Design, System � 86 Dateien\n- Einbindung: `<script src=\"../../shared/dkz-navbar.js\"></script>` vor `</body>`",
      "line_start": 1636,
      "line_end": 1640,
      "category": "design",
      "children": [],
      "section_num": null,
      "paragraph_num": null
    },
    {
      "id": "node_162",
      "title": "Notiz-System (DkzNotes API)",
      "level": 3,
      "parent": "node_160",
      "content_preview": "**LLM-Anweisung:** Wenn du erkennst dass ein Modul noch Arbeit braucht, hinterlasse eine Notiz:\n```js\nDkzNotes.add('modul-name', 'Was noch fehlt/angepasst werden muss', 'system');\n```\n\n| Methode | Beschreibung |\n|:--------|:-------------|\n| `DkzNotes.add(id, text, 'system')` | System-Notiz hinterlassen |\n| `DkzNotes.add(id, text, 'user')`   | User-Notiz hinterlassen |\n| `DkzNotes.getAll(id)`              | Alle Notizen eines Moduls |",
      "line_start": 1641,
      "line_end": 1653,
      "category": "backend",
      "children": [],
      "section_num": null,
      "paragraph_num": null
    },
    {
      "id": "node_163",
      "title": "Review-Status (DkzReview API)",
      "level": 3,
      "parent": "node_160",
      "content_preview": "**LLM-Anweisung:** Setze Module die nicht fertig sind auf 'review':\n```js\nDkzReview.setStatus('modul-name', 'review');\n```\n\n| Status | Bedeutung | Sichtbarkeit |\n|:-------|:----------|:-------------|\n| `active` | Fertig, getestet, dokumentiert | Normal angezeigt |\n| `review` | Muss �berarbeitet werden | Gelbes Badge, nicht als 'aktiv' gef�hrt |\n| `draft`  | In Entwicklung | Nicht angezeigt |",
      "line_start": 1654,
      "line_end": 1666,
      "category": "backend",
      "children": [],
      "section_num": null,
      "paragraph_num": null
    },
    {
      "id": "node_164",
      "title": "Modul-�berarbeitungsplan (�20)",
      "level": 3,
      "parent": "node_160",
      "content_preview": "Bevor ein Modul von `review` auf `active` gesetzt wird:\n1. Shared Scripts eingebunden (dkz-theme.css, dkz-navbar.js, dkz-prompt-hub.js)\n2. Encoding korrekt (keine ? statt Emojis)\n3. Navigation funktioniert (Hamburger + Links)\n4. Alle Verweise/Links existieren\n5. System-Notizen abgearbeitet\n6. LLM-Dokumentation vorhanden\n7. Git Commit mit Message\n8. BLAUPAUSE aktualisiert\n9. Modul �ffnet ohne Console-Errors",
      "line_start": 1667,
      "line_end": 1679,
      "category": "module",
      "children": [],
      "section_num": null,
      "paragraph_num": null
    },
    {
      "id": "node_165",
      "title": "Wo findet man was im �kosystem",
      "level": 3,
      "parent": "node_160",
      "content_preview": "| Was | Wo |\n|:----|:---|\n| Alle Regeln | `REGELWERK.md` |\n| Architektur & Module | `BLAUPAUSE.md` |\n| Feature-Status | `IMPLEMENTIERUNGSPLAN.md` |\n| Playbook (dieses Dokument) | `04_SYSTEM/DKZ_PLAYBOOK.md` |\n| Prompt-System �19 | `shared/dkz-prompt-hub.js` + BLAUPAUSE �19 |\n| Navigation �20 | `shared/dkz-navbar.js` + BLAUPAUSE �20 |\n| Notizen-System | `DkzNotes` API in `dkz-navbar.js` |\n| Module einzeln | `modules/[name]/index.html` |\n| Hub (alle Module) | `hub/index.html` |\n| Mainboard� | `mai",
      "line_start": 1680,
      "line_end": 1698,
      "category": "module",
      "children": [],
      "section_num": null,
      "paragraph_num": null
    },
    {
      "id": "node_166",
      "title": "�21 � Persistenz-Regeln (PFLICHT f�r jede Session)",
      "level": 2,
      "parent": "node_134",
      "content_preview": "> **WARNUNG AN ALLE LLMs/Agenten:**\n> Diese Regeln M�SSEN bei JEDER Session beachtet werden.\n> Verletzung f�hrt zu Datenverlust und Frustration.",
      "line_start": 1699,
      "line_end": 1704,
      "category": "rules",
      "children": [
        "node_167",
        "node_168",
        "node_169",
        "node_170"
      ],
      "section_num": null,
      "paragraph_num": null
    },
    {
      "id": "node_167",
      "title": "Bei Session-Start IMMER:",
      "level": 3,
      "parent": "node_166",
      "content_preview": "1. `/startup` Workflow ausf�hren (Playbook + REGELWERK + BLAUPAUSE lesen)\n2. `git log -5` pr�fen � was wurde zuletzt gemacht?\n3. Bestehende Archive und Backups NUTZEN, nicht neue erstellen\n4. ORDNER.ini des Zielordners lesen",
      "line_start": 1705,
      "line_end": 1710,
      "category": "rules",
      "children": [],
      "section_num": null,
      "paragraph_num": null
    },
    {
      "id": "node_168",
      "title": "NIEMALS:",
      "level": 3,
      "parent": "node_166",
      "content_preview": "- ? Playbook-Inhalte l�schen oder k�rzen ? nur ERG�NZEN\n- ? Neues Archive erstellen wenn bereits eines existiert ? existierendes verwenden\n- ? Templates-Datei (`dkz-prompt-templates.js`) l�schen oder k�rzen ? R100\n- ? Shared Scripts entfernen oder �berschreiben ? R100\n- ? Module zur�cksetzen ohne System-Notiz mit Grund\n- ? Gedanken/Kontext verwerfen ? in Notizen (DkzNotes) festhalten",
      "line_start": 1711,
      "line_end": 1718,
      "category": "rules",
      "children": [],
      "section_num": null,
      "paragraph_num": null
    },
    {
      "id": "node_169",
      "title": "Playbook aktuell halten:",
      "level": 3,
      "parent": "node_166",
      "content_preview": "- Bei JEDER neuen Funktion: Playbook �-Eintrag erstellen\n- Bei neuen Regeln: REGELWERK.md aktualisieren\n- Bei neuen Modulen: BLAUPAUSE.md + REGISTRY.json aktualisieren\n- Bei Architektur-�nderungen: IMPLEMENTIERUNGSPLAN.md aktualisieren",
      "line_start": 1719,
      "line_end": 1724,
      "category": "module",
      "children": [],
      "section_num": null,
      "paragraph_num": null
    },
    {
      "id": "node_170",
      "title": "Wo ist was (Quick Reference):",
      "level": 3,
      "parent": "node_166",
      "content_preview": "| Was | Datei | Pfad |\n|:----|:------|:-----|\n| Alle Regeln | REGELWERK.md | `C:\\DEVKiTZ\\REGELWERK.md` |\n| Architektur | BLAUPAUSE.md | `01_PROJECTS/01_dashboard/BLAUPAUSE.md` |\n| Features | IMPLEMENTIERUNGSPLAN.md | `01_PROJECTS/01_dashboard/IMPLEMENTIERUNGSPLAN.md` |\n| Playbook | DKZ_PLAYBOOK.md | `04_SYSTEM/DKZ_PLAYBOOK.md` |\n| Prompts (�19) | dkz-prompt-hub.js | `shared/dkz-prompt-hub.js` |\n| Templates (344) | dkz-prompt-templates.js | `shared/dkz-prompt-templates.js` |\n| Navigation (�20) | ",
      "line_start": 1725,
      "line_end": 1741,
      "category": "module",
      "children": [],
      "section_num": null,
      "paragraph_num": null
    },
    {
      "id": "node_171",
      "title": "Workflow-First Prinzip (R35 — PFLICHT)",
      "level": 2,
      "parent": "node_134",
      "content_preview": "> JEDE neue Funktion wird ERST als Skill/Workflow gespeichert, DANN ausgefuehrt.",
      "line_start": 1742,
      "line_end": 1745,
      "category": "rules",
      "children": [
        "node_172",
        "node_173",
        "node_174"
      ],
      "section_num": null,
      "paragraph_num": null
    },
    {
      "id": "node_172",
      "title": "Ablauf:",
      "level": 3,
      "parent": "node_171",
      "content_preview": "1. SKILL erstellen: `.agents/skills/[name]/SKILL.md`\n2. WORKFLOW erstellen: `.agents/workflows/[name].md`\n3. WORKFLOW ausfuehren via `/[name]`\n4. TESTEN mit Browser-Test + Screenshots/Video\n5. Bei Bugs: Workflow/Skill korrigieren",
      "line_start": 1746,
      "line_end": 1752,
      "category": "agent",
      "children": [],
      "section_num": null,
      "paragraph_num": null
    },
    {
      "id": "node_173",
      "title": "NLM Content-Pipeline (R31):",
      "level": 3,
      "parent": "node_171",
      "content_preview": "- Workflow: `.agents/workflows/notebooklm.md`\n- Syntax: `.agents/skills/notebooklm-integration/NLM-SYNTAX.md`\n- Cheatsheet: `.gemini/antigravity/NLM-CHEATSHEET.md`\n- Brand: `DkZ-Brand.md` (DkZ statt DEVKiTZ)\n- Sprache: IMMER `--language de` bei Audio\n- PFLICHT: Report + Slides + Audio bei Projekt-Abschluss",
      "line_start": 1753,
      "line_end": 1760,
      "category": "nlm",
      "children": [],
      "section_num": null,
      "paragraph_num": null
    },
    {
      "id": "node_174",
      "title": "Vorschau-Ordner (R34):",
      "level": 3,
      "parent": "node_171",
      "content_preview": "```\nmodul/Vorschau/clips/\nmodul/Vorschau/screenshots/\nmodul/Vorschau/recordings/\nmodul/docs/research/\nmodul/docs/chatlog/\nmodul/docs/metadata/\n```",
      "line_start": 1761,
      "line_end": 1771,
      "category": "module",
      "children": [],
      "section_num": null,
      "paragraph_num": null
    },
    {
      "id": "node_175",
      "title": "KERN2 Systemkomponenten (6 Dateien)",
      "level": 2,
      "parent": "node_134",
      "content_preview": "1. hub/index.html\n2. shared/dkz-navbar.js\n3. shared/dkz-headbar.js\n4. shared/dkz-copilot.js\n5. shared/dkz-crosslinks.js\n6. shared/dkz-theme.css\n\n**PLAYB00K Ordner:** C:\\DEVKiTZ\\PLAYB00K\\ (10 Kategorien)\n\n---",
      "line_start": 1772,
      "line_end": 1784,
      "category": "design",
      "children": [],
      "section_num": null,
      "paragraph_num": null
    },
    {
      "id": "node_176",
      "title": "-------------------------------------------",
      "level": 2,
      "parent": "node_134",
      "content_preview": "",
      "line_start": 1785,
      "line_end": 1785,
      "category": "general",
      "children": [],
      "section_num": null,
      "paragraph_num": null
    },
    {
      "id": "node_177",
      "title": "SEKTION 26 — NLM (NotebookLM CLI) REGELN",
      "level": 2,
      "parent": "node_134",
      "content_preview": "",
      "line_start": 1786,
      "line_end": 1786,
      "category": "nlm",
      "children": [],
      "section_num": "26",
      "paragraph_num": null
    },
    {
      "id": "node_178",
      "title": "-------------------------------------------",
      "level": 2,
      "parent": "node_134",
      "content_preview": "",
      "line_start": 1787,
      "line_end": 1788,
      "category": "general",
      "children": [
        "node_179",
        "node_180"
      ],
      "section_num": null,
      "paragraph_num": null
    },
    {
      "id": "node_179",
      "title": "26.1 Version-Pin: v0.5.2 (NICHT upgraden!)",
      "level": 3,
      "parent": "node_178",
      "content_preview": "| Feld | Wert |\n|:-----|:-----|\n| **Aktuelle Version** | `nlm v0.5.2` |\n| **Pfad** | `%USERPROFILE%\\.local\\bin\\` |\n| **NICHT upgraden auf** | `v0.5.9` (instabil, API-Timeouts) |\n\n> ⚠️ **WARNUNG:** `nlm v0.5.9` verursacht hängende Source-Uploads und API-Timeouts.\n> Bei v0.5.2 bleiben! Falls versehentlich upgegradet:\n> ```powershell\n> uv tool install notebooklm-mcp-cli==0.5.2\n> ```",
      "line_start": 1789,
      "line_end": 1802,
      "category": "nlm",
      "children": [],
      "section_num": null,
      "paragraph_num": null
    },
    {
      "id": "node_180",
      "title": "26.2 NLM Dateityp-Beschränkung",
      "level": 3,
      "parent": "node_178",
      "content_preview": "| Erlaubt | Verboten |\n|:--------|:---------|\n| `.md` (Markdown) | `.png`, `.jpg` (Bilder) |\n| `.pdf` (PDF) | `.js`, `.json` (Code) |\n| `.txt` (Text) | `.css`, `.html` (Web) |\n\n**Bilder als NLM-Quellen:** NLM kann KEINE Bilder verarbeiten!\n**Workaround:** Bilder auf Google Fotos hochladen, veröffentlichen, den Link\nin einer .md-Quelldatei als Branding-Referenz angeben:\n\n```markdown",
      "line_start": 1803,
      "line_end": 1815,
      "category": "nlm",
      "children": [],
      "section_num": null,
      "paragraph_num": null
    },
    {
      "id": "node_181",
      "title": "Branding-Logos",
      "level": 2,
      "parent": "node_134",
      "content_preview": "- DEVKiTZ™ Logo: [Google Fotos Link]\n  → Verwende dieses Logo für alle Branding-Elemente\n- DkZ™ Icon: [Google Fotos Link]\n  → Verwende dieses Icon als kompakte Brand-Marke\n```",
      "line_start": 1816,
      "line_end": 1822,
      "category": "general",
      "children": [
        "node_182",
        "node_183",
        "node_184"
      ],
      "section_num": null,
      "paragraph_num": null
    },
    {
      "id": "node_182",
      "title": "26.3 NLM Wartezeiten",
      "level": 3,
      "parent": "node_181",
      "content_preview": "| Content-Typ | Wartezeit | Erfolgsrate |\n|:------------|:----------|:------------|\n| Report | ~30 Sek | 99% |\n| Slides | 2-5 Min | 95% |\n| Audio/Podcast | **5-15 Min** | 95% |\n| Video | **5-15 Min** | 90% |\n| Mindmap | Sofort | 99% |\n| Infographic | ~60 Sek | 70% (2-3x versuchen!) |\n| Data Table | ~60 Sek | 95% |\n\n> **WICHTIG:** Podcast und Video brauchen manchmal **10+ Minuten**.\n> Nicht abbrechen! Zu 95% funktioniert es — einfach warten lassen.",
      "line_start": 1823,
      "line_end": 1837,
      "category": "nlm",
      "children": [],
      "section_num": null,
      "paragraph_num": null
    },
    {
      "id": "node_183",
      "title": "26.4 NLM Content-Erstellungs-Workflow (Best Practice)",
      "level": 3,
      "parent": "node_181",
      "content_preview": "```\n1. Quelldatei vorbereiten (.md mit vollständigem Content-Guide)\n   → Blog-Beiträge, Keywords, Design-Richtlinien, Branding-Links\n2. Notebook erstellen: nlm notebook create \"DkZ - [THEMA]\"\n3. Quellen hochladen (OHNE --wait falls Timeout):\n   nlm source add $NB --file \"quelle.md\"\n4. Content generieren (Report → Slides → Audio → Infographic)\n5. Git Commit nach jedem Teilschritt!\n6. Podcast/Video 10+ Min warten lassen\n7. Download + Ordner strukturieren\n```",
      "line_start": 1838,
      "line_end": 1851,
      "category": "nlm",
      "children": [],
      "section_num": null,
      "paragraph_num": null
    },
    {
      "id": "node_184",
      "title": "26.5 Content-Qualitäts-Regeln (bewährt)",
      "level": 3,
      "parent": "node_181",
      "content_preview": "Diese Regeln haben sich bei der SEO-Content-Produktion bewährt:\n\n1. **NLM-Quelldatei als Komplett-Guide:** Alles in EINER .md-Datei bündeln\n   - Blog-Beiträge ausgeschrieben (nicht nur Stichpunkte)\n   - Keyword-Tabellen mit Suchvolumen\n   - Design-Richtlinien (Farben, Fonts, Bildsprache)\n   - Branding-Links zu Logos (Google Fotos)\n2. **Mehrere Quellen:** SEO-Berichte + Content-Guide kombinieren\n3. **Immer `--language de`** bei Audio für deutschen Podcast\n4. **Infographic 2-3x versuchen** — schei",
      "line_start": 1852,
      "line_end": 1869,
      "category": "rules",
      "children": [],
      "section_num": null,
      "paragraph_num": null
    },
    {
      "id": "node_185",
      "title": "-------------------------------------------",
      "level": 2,
      "parent": "node_134",
      "content_preview": "",
      "line_start": 1870,
      "line_end": 1870,
      "category": "general",
      "children": [],
      "section_num": null,
      "paragraph_num": null
    },
    {
      "id": "node_186",
      "title": "SEKTION 27 — SETUP-WORKFLOW + ESC TERMINAL (R36)",
      "level": 2,
      "parent": "node_134",
      "content_preview": "",
      "line_start": 1871,
      "line_end": 1871,
      "category": "general",
      "children": [],
      "section_num": "27",
      "paragraph_num": null
    },
    {
      "id": "node_187",
      "title": "-------------------------------------------",
      "level": 2,
      "parent": "node_134",
      "content_preview": "> **Stand:** 2026-03-28 · Portable Installation mit Skills-Verknüpfung",
      "line_start": 1872,
      "line_end": 1875,
      "category": "general",
      "children": [
        "node_188"
      ],
      "section_num": null,
      "paragraph_num": null
    },
    {
      "id": "node_188",
      "title": "27.1 1-Klick Installer",
      "level": 3,
      "parent": "node_187",
      "content_preview": "| Datei | Pfad | Zweck |\n|:------|:-----|:------|\n| `setup.ps1` | `C:\\DEVKiTZ\\setup.ps1` | Automatischer Installer (Windows) |\n| `SETUP.md` | `C:\\DEVKiTZ\\SETUP.md` | Setup Guide für Repo-Kloner |\n| `/setup` Workflow | `.agents/workflows/setup.md` | 10-Schritte Setup mit Skills |\n\n**Nutzung:**\n\n```powershell",
      "line_start": 1876,
      "line_end": 1886,
      "category": "agent",
      "children": [],
      "section_num": null,
      "paragraph_num": null
    },
    {
      "id": "node_189",
      "title": "Standard (alles installieren)",
      "level": 1,
      "parent": null,
      "content_preview": "powershell -ExecutionPolicy Bypass -File setup.ps1",
      "line_start": 1887,
      "line_end": 1889,
      "category": "general",
      "children": [],
      "section_num": null,
      "paragraph_num": null
    },
    {
      "id": "node_190",
      "title": "Minimal (nur Basics)",
      "level": 1,
      "parent": null,
      "content_preview": "powershell -ExecutionPolicy Bypass -File setup.ps1 -Minimal",
      "line_start": 1890,
      "line_end": 1892,
      "category": "general",
      "children": [],
      "section_num": null,
      "paragraph_num": null
    },
    {
      "id": "node_191",
      "title": "Ohne NLM oder CodeRabbit",
      "level": 1,
      "parent": null,
      "content_preview": "powershell -ExecutionPolicy Bypass -File setup.ps1 -SkipNLM\npowershell -ExecutionPolicy Bypass -File setup.ps1 -SkipCodeRabbit\n```",
      "line_start": 1893,
      "line_end": 1897,
      "category": "nlm",
      "children": [
        "node_192",
        "node_193",
        "node_194",
        "node_195",
        "node_196",
        "node_197",
        "node_198",
        "node_202",
        "node_203",
        "node_204",
        "node_207",
        "node_208",
        "node_209",
        "node_213",
        "node_214",
        "node_215",
        "node_219",
        "node_220",
        "node_221",
        "node_224",
        "node_225",
        "node_226",
        "node_230",
        "node_231",
        "node_232",
        "node_239",
        "node_240",
        "node_241",
        "node_248",
        "node_249",
        "node_250",
        "node_258",
        "node_262"
      ],
      "section_num": null,
      "paragraph_num": null
    },
    {
      "id": "node_192",
      "title": "27.2 Setup-Workflow (10 Schritte mit Skills)",
      "level": 3,
      "parent": "node_191",
      "content_preview": "| # | Schritt | Skill | Datei |\n|:--|:--------|:------|:------|\n| 1 | Repo klonen | Git Basics | — |\n| 2 | System erkennen + Dependencies | `setup.ps1` | `setup.ps1` |\n| 3 | NotebookLM MCP installieren | `notebooklm-integration` | `.agents/skills/` |\n| 4 | CodeRabbit konfigurieren | Code Review | `.coderabbit.yml` |\n| 5 | ONTHERUN™ MCP Server | `mcp-builder` | `.agents/skills/` |\n| 6 | Verzeichnisstruktur verifizieren | Ecosystem Validation | `setup.ps1` |\n| 7 | Shared Scripts validieren | `weba",
      "line_start": 1898,
      "line_end": 1912,
      "category": "backend",
      "children": [],
      "section_num": null,
      "paragraph_num": null
    },
    {
      "id": "node_193",
      "title": "27.3 ESC Terminal Panel (dkz-terminal.js)",
      "level": 3,
      "parent": "node_191",
      "content_preview": "**Shared Script:** `01_PROJECTS/01_dashboard/shared/dkz-terminal.js`\n\n**Einbindung in Modulen:**\n\n```html\n<script src=\"../shared/dkz-terminal.js\"></script>\n```\n\n**Tastaturkürzel:**\n\n| Taste | Aktion |\n|:------|:-------|\n| `ESC` | Terminal Panel öffnen/schließen |\n| `Ctrl+K` | Copilot-Suche fokussieren |\n\n**Features des Panels:**\n- Glassmorphism Slide-In Panel (400px, von rechts)\n- System-Status mit Ampel (Git, NLM, ONTHERUN™, CodeRabbit)\n- 1-Klick: Setup Guide, Dashboard, Install-Befehl kopieren",
      "line_start": 1913,
      "line_end": 1936,
      "category": "module",
      "children": [],
      "section_num": null,
      "paragraph_num": null
    },
    {
      "id": "node_194",
      "title": "27.4 Antigravity Knowledge Base",
      "level": 3,
      "parent": "node_191",
      "content_preview": "6 Dateien in `.gemini/antigravity/` für Agent-Kontext:\n\n| Datei | Inhalt |\n|:------|:-------|\n| `MISSION_CONTROL.md` | Dashboard Pattern, Pixel Office, Org Chart |\n| `DEEPKEEP_ARCHIVING.md` | GitHub-Backups, REDNOTE, Gallery |\n| `FLYER_ENGINE.md` | HSV Color Engine, Tauri, Mistral OCR |\n| `SKILLS_REFERENCE.md` | 5 Skills + 31 Workflows komplett |\n| `SNIPPETS.md` | XSS, Theme, Cards, Boilerplate Code |\n| `QUELLEN.md` | APIs, Repos, MCP Tools, Google Drive |",
      "line_start": 1937,
      "line_end": 1949,
      "category": "backend",
      "children": [],
      "section_num": null,
      "paragraph_num": null
    },
    {
      "id": "node_195",
      "title": "27.5 Portabilisierungs-Regel (R36)",
      "level": 3,
      "parent": "node_191",
      "content_preview": "> **PFLICHT:** Keine hardcodierten User-Pfade im Repository!\n\n| Kontext | Statt | Verwende |\n|:--------|:------|:---------|\n| PowerShell | `C:\\Users\\BAZE²\\...` | `$env:USERPROFILE\\...` |\n| Dokumentation | `C:\\Users\\BAZE²\\...` | `%USERPROFILE%\\...` |\n| JavaScript | Hardcoded Pfade | Relative Pfade (`../shared/`) |\n| Bash | `~/` oder `/home/user/` | `$HOME/` |\n\n---",
      "line_start": 1950,
      "line_end": 1962,
      "category": "rules",
      "children": [],
      "section_num": null,
      "paragraph_num": null
    },
    {
      "id": "node_196",
      "title": "-------------------------------------------",
      "level": 2,
      "parent": "node_191",
      "content_preview": "",
      "line_start": 1963,
      "line_end": 1963,
      "category": "general",
      "children": [],
      "section_num": null,
      "paragraph_num": null
    },
    {
      "id": "node_197",
      "title": "SEKTION 28 — CLOUD & PANELS (v2.1)",
      "level": 2,
      "parent": "node_191",
      "content_preview": "",
      "line_start": 1964,
      "line_end": 1964,
      "category": "module",
      "children": [],
      "section_num": "28",
      "paragraph_num": null
    },
    {
      "id": "node_198",
      "title": "-------------------------------------------",
      "level": 2,
      "parent": "node_191",
      "content_preview": "> **Stand:** 2026-03-24 · 6 neue Module + Shared Script + Vivaldi Extension",
      "line_start": 1965,
      "line_end": 1968,
      "category": "module",
      "children": [
        "node_199",
        "node_200",
        "node_201"
      ],
      "section_num": null,
      "paragraph_num": null
    },
    {
      "id": "node_199",
      "title": "28.1 Neue Module (MOD-081..086)",
      "level": 3,
      "parent": "node_198",
      "content_preview": "| ID | Modul | Pfad | Features |\n|:---|:------|:-----|:---------|\n| MOD-081 | 🎧 Whisper TTS | `modules/whisper-tts/` | Browser TTS/STT, Stimmen, Speed, Verlauf |\n| MOD-082 | ☁️ Cloud Control | `modules/cloud-control/` | GDrive, Cloudflare, Oracle, Users |\n| MOD-083 | 🏰 CL0UDiA™ | `modules/claudia-cloud/` | Nextcloud EU, DSGVO, WebDAV, E2EE |\n| MOD-084 | 🤖 NanoBot Center | `modules/nanobot-center/` | 6 Agenten, Chat, Tasks, MCP |\n| MOD-085 | 🐰 CodeRabbit | `modules/coderabbit-panel/` | Reviews, O",
      "line_start": 1969,
      "line_end": 1979,
      "category": "module",
      "children": [],
      "section_num": null,
      "paragraph_num": null
    },
    {
      "id": "node_200",
      "title": "28.2 Shared Script: dkz-tts.js",
      "level": 3,
      "parent": "node_198",
      "content_preview": "Text-to-Speech Modul für ALLE Module:\n\n| Feature | Beschreibung |\n|:--------|:-------------|\n| 🎧 Kopfhörer-Button | Fixiert unten links, Klick = Seitentext vorlesen |\n| Stimmen-Auswahl | DE/EN/FR/ES Filter, Doppelklick-Preview |\n| Speed/Pitch | 0.5x–2.0x Geschwindigkeit, Tonhöhe anpassbar |\n| Panel | Shift+Click öffnet Vollpanel mit Stimmen-Liste |\n| Shortcut | Alt+T = sofort vorlesen |\n| Console | `/tts`, `/tts:stop`, `/tts:voices` |\n\n**Einbindung:**\n```html\n<script src=\"../../shared/dkz-tts.js",
      "line_start": 1980,
      "line_end": 1997,
      "category": "module",
      "children": [],
      "section_num": null,
      "paragraph_num": null
    },
    {
      "id": "node_201",
      "title": "28.3 Vivaldi Side Panel Extension",
      "level": 3,
      "parent": "node_198",
      "content_preview": "```\n01_PROJECTS/chrome-extensions/dkz-panels/\n├── manifest.json       ← MV3, sidePanel API\n├── background.js       ← Service Worker\n└── sidepanel.html      ← Panel-Selector (10 Module)\n```\n\n---",
      "line_start": 1998,
      "line_end": 2008,
      "category": "module",
      "children": [],
      "section_num": null,
      "paragraph_num": null
    },
    {
      "id": "node_202",
      "title": "-------------------------------------------",
      "level": 2,
      "parent": "node_191",
      "content_preview": "",
      "line_start": 2009,
      "line_end": 2009,
      "category": "general",
      "children": [],
      "section_num": null,
      "paragraph_num": null
    },
    {
      "id": "node_203",
      "title": "SEKTION 29 — BACKUP & PERSISTENZ-SYSTEM",
      "level": 2,
      "parent": "node_191",
      "content_preview": "",
      "line_start": 2010,
      "line_end": 2010,
      "category": "data",
      "children": [],
      "section_num": "29",
      "paragraph_num": null
    },
    {
      "id": "node_204",
      "title": "-------------------------------------------",
      "level": 2,
      "parent": "node_191",
      "content_preview": "> **Stand:** 2026-03-27 · `dkz-persist.js` v2.0",
      "line_start": 2011,
      "line_end": 2014,
      "category": "general",
      "children": [
        "node_205",
        "node_206"
      ],
      "section_num": null,
      "paragraph_num": null
    },
    {
      "id": "node_205",
      "title": "29.1 Shared Script: dkz-persist.js",
      "level": 3,
      "parent": "node_204",
      "content_preview": "3-Tab Backup Manager mit IndexedDB + Cloudflare R2:\n\n| Tab | Funktion |\n|:----|:---------|\n| 💾 Lokal | IndexedDB Snapshot, localStorage Export/Import |\n| ☁️ Cloud | Cloudflare R2 Bucket Upload/Download |\n| 📊 Status | Storage-Verbrauch, letzte Backups, Warnschwellen |\n\n**Regeln:**\n- Auto-Save bei `beforeunload` Event\n- Max 5 Snapshots lokal, älteste wird rotiert\n- Cloud-Backup optional (R2 Token in Settings)\n- Collision-Detection bei Multi-Tab",
      "line_start": 2015,
      "line_end": 2030,
      "category": "rules",
      "children": [],
      "section_num": null,
      "paragraph_num": null
    },
    {
      "id": "node_206",
      "title": "29.2 Auto-Save Strategie",
      "level": 3,
      "parent": "node_204",
      "content_preview": "```\nIntervall:  5 Min Auto-Save → IndexedDB\nTrigger:    beforeunload → Emergency Save\nRotate:     Max 5 Snapshots (FIFO)\nCloud:      Manuell oder per Cron (R2)\nRecovery:   IndexedDB → localStorage Restore\n```\n\n---",
      "line_start": 2031,
      "line_end": 2042,
      "category": "general",
      "children": [],
      "section_num": null,
      "paragraph_num": null
    },
    {
      "id": "node_207",
      "title": "-------------------------------------------",
      "level": 2,
      "parent": "node_191",
      "content_preview": "",
      "line_start": 2043,
      "line_end": 2043,
      "category": "general",
      "children": [],
      "section_num": null,
      "paragraph_num": null
    },
    {
      "id": "node_208",
      "title": "SEKTION 30 — BLOGGER V2.1 ÖKOSYSTEM",
      "level": 2,
      "parent": "node_191",
      "content_preview": "",
      "line_start": 2044,
      "line_end": 2044,
      "category": "general",
      "children": [],
      "section_num": "30",
      "paragraph_num": null
    },
    {
      "id": "node_209",
      "title": "-------------------------------------------",
      "level": 2,
      "parent": "node_191",
      "content_preview": "> **Stand:** 2026-03-30 · 53 Blogs SEO-optimiert, 12 Verticals",
      "line_start": 2045,
      "line_end": 2048,
      "category": "general",
      "children": [
        "node_210",
        "node_211",
        "node_212"
      ],
      "section_num": null,
      "paragraph_num": null
    },
    {
      "id": "node_210",
      "title": "30.1 Blog-Netzwerk",
      "level": 3,
      "parent": "node_209",
      "content_preview": "| Metrik | Wert |\n|:-------|:-----|\n| Blogs gesamt | 53 |\n| Verticals | 12 (Sport, Tech, AI, Style, Gaming, Finance, Crypto, Food, Travel, Music, Health, Lifestyle) |\n| Template | V2.1 DkZ™ Design mit Panel-Farben |\n| SEO | Title, Meta, OG Tags, Schema.org |",
      "line_start": 2049,
      "line_end": 2057,
      "category": "design",
      "children": [],
      "section_num": null,
      "paragraph_num": null
    },
    {
      "id": "node_211",
      "title": "30.2 Panel-Farbsystem",
      "level": 3,
      "parent": "node_209",
      "content_preview": "Jedes Blog hat ein eigenes Farbpanel basierend auf Vertical:\n\n| Vertical | Primärfarbe | Sekundärfarbe |\n|:---------|:------------|:--------------|\n| Sport | `#fa1e4e` (DkZ Rot) | `#00ff88` |\n| Tech | `#3b82f6` (Blue) | `#00ff88` |\n| AI | `#8b5cf6` (Purple) | `#fa1e4e` |\n| Gaming | `#f59e0b` (Amber) | `#fa1e4e` |",
      "line_start": 2058,
      "line_end": 2068,
      "category": "module",
      "children": [],
      "section_num": null,
      "paragraph_num": null
    },
    {
      "id": "node_212",
      "title": "30.3 Workflows",
      "level": 3,
      "parent": "node_209",
      "content_preview": "| Workflow | Pfad | Funktion |\n|:---------|:-----|:---------|\n| `/blog-deploy` | `.agents/workflows/blog-deploy.md` | Blog auf Blogger deployen |\n| `/blog-rebrand` | `.agents/workflows/blog-rebrand.md` | Blog-Netzwerk rebranden |\n| `/seo-optimize` | `.agents/workflows/seo-optimize.md` | SEO optimieren |\n\n---",
      "line_start": 2069,
      "line_end": 2078,
      "category": "agent",
      "children": [],
      "section_num": null,
      "paragraph_num": null
    },
    {
      "id": "node_213",
      "title": "-------------------------------------------",
      "level": 2,
      "parent": "node_191",
      "content_preview": "",
      "line_start": 2079,
      "line_end": 2079,
      "category": "general",
      "children": [],
      "section_num": null,
      "paragraph_num": null
    },
    {
      "id": "node_214",
      "title": "SEKTION 31 — BETCHECK & LIVESCORE",
      "level": 2,
      "parent": "node_191",
      "content_preview": "",
      "line_start": 2080,
      "line_end": 2080,
      "category": "general",
      "children": [],
      "section_num": "31",
      "paragraph_num": null
    },
    {
      "id": "node_215",
      "title": "-------------------------------------------",
      "level": 2,
      "parent": "node_191",
      "content_preview": "> **Stand:** 2026-03-28 · BetCheck mit NanoBot AI + DoubleCheck",
      "line_start": 2081,
      "line_end": 2084,
      "category": "agent",
      "children": [
        "node_216",
        "node_217",
        "node_218"
      ],
      "section_num": null,
      "paragraph_num": null
    },
    {
      "id": "node_216",
      "title": "31.1 BetCheck Module",
      "level": 3,
      "parent": "node_215",
      "content_preview": "| Feature | Status |\n|:--------|:-------|\n| NanoBot AI Integration | ✅ |\n| DoubleCheck System | ✅ |\n| QR Scanner (Mobile) | ✅ |\n| PWA Support | ✅ |\n| Tor-Ticker | ✅ |\n| LiveTV.sx Stream | ✅ |",
      "line_start": 2085,
      "line_end": 2095,
      "category": "module",
      "children": [],
      "section_num": null,
      "paragraph_num": null
    },
    {
      "id": "node_217",
      "title": "31.2 Chrome Extension: DkZ LiveScore",
      "level": 3,
      "parent": "node_215",
      "content_preview": "Side Panel Extension für Vivaldi/Chrome:\n\n```\n01_PROJECTS/chrome-extensions/dkz-livescore/\n├── manifest.json       ← MV3\n├── background.js       ← Service Worker\n├── panel/\n│   ├── index.html      ← Side Panel UI\n│   ├── panel.js        ← Logik\n│   └── panel.css       ← Styles\n└── icons/              ← Extension Icons\n```",
      "line_start": 2096,
      "line_end": 2110,
      "category": "module",
      "children": [],
      "section_num": null,
      "paragraph_num": null
    },
    {
      "id": "node_218",
      "title": "31.3 Agent-Architektur",
      "level": 3,
      "parent": "node_215",
      "content_preview": "`G0B!G0RG0H0ME` Agent-System:\n- PyTorch + Keras für ML/AI Vision\n- ADK + A2A Protokoll\n- ComfyUI Pipeline\n- LangChain Integration\n\n---",
      "line_start": 2111,
      "line_end": 2120,
      "category": "agent",
      "children": [],
      "section_num": null,
      "paragraph_num": null
    },
    {
      "id": "node_219",
      "title": "-------------------------------------------",
      "level": 2,
      "parent": "node_191",
      "content_preview": "",
      "line_start": 2121,
      "line_end": 2121,
      "category": "general",
      "children": [],
      "section_num": null,
      "paragraph_num": null
    },
    {
      "id": "node_220",
      "title": "SEKTION 32 — WORKFLOWS & SKILLS REGISTER",
      "level": 2,
      "parent": "node_191",
      "content_preview": "",
      "line_start": 2122,
      "line_end": 2122,
      "category": "general",
      "children": [],
      "section_num": "32",
      "paragraph_num": null
    },
    {
      "id": "node_221",
      "title": "-------------------------------------------",
      "level": 2,
      "parent": "node_191",
      "content_preview": "> **Stand:** 2026-04-01 · 54+ Workflows, 12 Skills",
      "line_start": 2123,
      "line_end": 2126,
      "category": "general",
      "children": [
        "node_222",
        "node_223"
      ],
      "section_num": null,
      "paragraph_num": null
    },
    {
      "id": "node_222",
      "title": "32.1 Workflows (`.agents/workflows/`)",
      "level": 3,
      "parent": "node_221",
      "content_preview": "| Kategorie | Workflows | Beispiele |\n|:----------|:----------|:---------|\n| 🏗️ Build & Deploy | 8 | `/build`, `/create-module`, `/docker-manage`, `/cloudflare-setup` |\n| 🤖 Agenten | 7 | `/agent-create`, `/agent-debug`, `/agent-review`, `/agent-test` |\n| 📝 Content | 6 | `/blog-deploy`, `/blog-rebrand`, `/nlm-batch`, `/video-create` |\n| 🔧 DevOps | 6 | `/setup`, `/system-check`, `/server-health`, `/ssh-connect` |\n| 🎨 Design | 5 | `/css-template`, `/widget-create`, `/drag-drop`, `/form-validate` |\n",
      "line_start": 2127,
      "line_end": 2143,
      "category": "agent",
      "children": [],
      "section_num": null,
      "paragraph_num": null
    },
    {
      "id": "node_223",
      "title": "32.2 Skills (`.agents/skills/`)",
      "level": 3,
      "parent": "node_221",
      "content_preview": "| Skill | Beschreibung |\n|:------|:-------------|\n| `changelog-generator` | Changelogs aus Git-Commits generieren |\n| `hostinger-kodee` | Hostinger Domains, VPS, DNS einrichten |\n| `mcp-builder` | MCP Server erstellen (Python/TypeScript) |\n| `notebooklm-integration` | NLM Batch Content-Generierung |\n| `webapp-testing` | Playwright Frontend-Tests |\n| `stitch-design` | UI Design mit Stitch MCP |\n| `enhance-prompt` | Vage Prompts zu polished Prompts |\n| `remotion` | Walkthrough-Videos generieren |\n",
      "line_start": 2144,
      "line_end": 2162,
      "category": "agent",
      "children": [],
      "section_num": null,
      "paragraph_num": null
    },
    {
      "id": "node_224",
      "title": "-------------------------------------------",
      "level": 2,
      "parent": "node_191",
      "content_preview": "",
      "line_start": 2163,
      "line_end": 2163,
      "category": "general",
      "children": [],
      "section_num": null,
      "paragraph_num": null
    },
    {
      "id": "node_225",
      "title": "SEKTION 33 — AUTO-SYNC SYSTEM (R46)",
      "level": 2,
      "parent": "node_191",
      "content_preview": "",
      "line_start": 2164,
      "line_end": 2164,
      "category": "general",
      "children": [],
      "section_num": "33",
      "paragraph_num": null
    },
    {
      "id": "node_226",
      "title": "-------------------------------------------",
      "level": 2,
      "parent": "node_191",
      "content_preview": "> **Stand:** 2026-04-01 · Playbook pflegt sich automatisch aktuell",
      "line_start": 2165,
      "line_end": 2168,
      "category": "general",
      "children": [
        "node_227",
        "node_228",
        "node_229"
      ],
      "section_num": null,
      "paragraph_num": null
    },
    {
      "id": "node_227",
      "title": "33.1 Regel R46: PLAYBOOK AUTO-SYNC",
      "level": 3,
      "parent": "node_226",
      "content_preview": "> **PFLICHT:** Bei JEDER Session-Ende MUSS das Playbook auf fehlende §§ geprüft\n> und ergänzt werden. Neue Features → neue §§-Sektion. Automatisch einsortiert.",
      "line_start": 2169,
      "line_end": 2173,
      "category": "rules",
      "children": [],
      "section_num": null,
      "paragraph_num": null
    },
    {
      "id": "node_228",
      "title": "33.2 Auto-Sync Workflow",
      "level": 3,
      "parent": "node_226",
      "content_preview": "```\nSession-Ende\n     │\n     ├──→ 1. git log seit letztem Playbook-Update prüfen\n     │       → Neue feat() Commits identifizieren\n     │\n     ├──→ 2. Fehlende §§-Sektionen identifizieren\n     │       → Commits ohne Playbook-Eintrag = LÜCKE\n     │\n     ├──→ 3. Neue §§-Sektion erstellen\n     │       → Format: §[Nr] — [Titel]\n     │       → Tabellen, Features, Pfade dokumentieren\n     │\n     ├──→ 4. Ans Ende des Playbooks anhängen\n     │       → Vor dem Abschluss-Tag\n     │\n     └──→ 5. Git commit",
      "line_start": 2174,
      "line_end": 2195,
      "category": "git",
      "children": [],
      "section_num": null,
      "paragraph_num": null
    },
    {
      "id": "node_229",
      "title": "33.3 §§-Sektions-Template",
      "level": 3,
      "parent": "node_226",
      "content_preview": "Jede neue Sektion folgt diesem Format:\n\n```markdown",
      "line_start": 2196,
      "line_end": 2200,
      "category": "output",
      "children": [],
      "section_num": null,
      "paragraph_num": null
    },
    {
      "id": "node_230",
      "title": "-------------------------------------------",
      "level": 2,
      "parent": "node_191",
      "content_preview": "",
      "line_start": 2201,
      "line_end": 2201,
      "category": "general",
      "children": [],
      "section_num": null,
      "paragraph_num": null
    },
    {
      "id": "node_231",
      "title": "SEKTION [NR] — [TITEL IN GROSSBUCHSTABEN]",
      "level": 2,
      "parent": "node_191",
      "content_preview": "",
      "line_start": 2202,
      "line_end": 2202,
      "category": "general",
      "children": [],
      "section_num": null,
      "paragraph_num": null
    },
    {
      "id": "node_232",
      "title": "-------------------------------------------",
      "level": 2,
      "parent": "node_191",
      "content_preview": "> **Stand:** [YYYY-MM-DD] · [Einzeiler-Beschreibung]",
      "line_start": 2203,
      "line_end": 2206,
      "category": "general",
      "children": [
        "node_233",
        "node_234",
        "node_235",
        "node_236",
        "node_237",
        "node_238"
      ],
      "section_num": null,
      "paragraph_num": null
    },
    {
      "id": "node_233",
      "title": "[NR].1 [Übersicht]",
      "level": 3,
      "parent": "node_232",
      "content_preview": "| Feature | Status |\n|:--------|:-------|\n| ... | ✅/⚠️/❌ |",
      "line_start": 2207,
      "line_end": 2212,
      "category": "general",
      "children": [],
      "section_num": null,
      "paragraph_num": null
    },
    {
      "id": "node_234",
      "title": "[NR].2 [Details]",
      "level": 3,
      "parent": "node_232",
      "content_preview": "...",
      "line_start": 2213,
      "line_end": 2215,
      "category": "general",
      "children": [],
      "section_num": null,
      "paragraph_num": null
    },
    {
      "id": "node_235",
      "title": "[NR].3 [Workflows/Pfade]",
      "level": 3,
      "parent": "node_232",
      "content_preview": "...\n```",
      "line_start": 2216,
      "line_end": 2219,
      "category": "general",
      "children": [],
      "section_num": null,
      "paragraph_num": null
    },
    {
      "id": "node_236",
      "title": "33.4 Einsortierungs-Regeln",
      "level": 3,
      "parent": "node_232",
      "content_preview": "| Typ | Wo einsortieren | §§-Nummer |\n|:----|:----------------|:----------|\n| Neues Modul | §28 erweitern ODER neue §§ | Nächste freie |\n| Neue Regel | §16.3 aktualisieren + eigene §§ | Nächste freie |\n| Neuer Workflow | §32 erweitern | — |\n| Neues Shared Script | §15.1 erweitern + eigene §§ | Nächste freie |\n| Neues Produkt™ | §16.4 aktualisieren | — |\n| Neue Extension | §28.3 erweitern ODER neue §§ | Nächste freie |",
      "line_start": 2220,
      "line_end": 2230,
      "category": "rules",
      "children": [],
      "section_num": null,
      "paragraph_num": null
    },
    {
      "id": "node_237",
      "title": "33.5 Shared Script: dkz-playbook-sync.js",
      "level": 3,
      "parent": "node_232",
      "content_preview": "**Pfad:** `01_PROJECTS/01_dashboard/shared/dkz-playbook-sync.js`\n\nAutomatische Prüfung bei Session-Start:\n- Liest REGISTRY.json → kennt alle Module\n- Prüft DKZ_PLAYBOOK.md → welche §§ existieren\n- Identifiziert Lücken → Module ohne §§-Eintrag\n- Gibt Console-Warnung: `⚠️ Playbook Sync: X Module ohne §§-Eintrag`",
      "line_start": 2231,
      "line_end": 2240,
      "category": "module",
      "children": [],
      "section_num": null,
      "paragraph_num": null
    },
    {
      "id": "node_238",
      "title": "33.6 Aktuelle Statistik",
      "level": 3,
      "parent": "node_232",
      "content_preview": "| Metrik | Wert |\n|:-------|:-----|\n| Playbook-Sektionen | §1–§33 |\n| Regeln im Playbook | R0–R100 + R46 |\n| Module dokumentiert | 86+ |\n| Workflows dokumentiert | 54+ |\n| Skills dokumentiert | 12 |\n| Letzte Aktualisierung | 2026-04-01 |\n\n---",
      "line_start": 2241,
      "line_end": 2253,
      "category": "module",
      "children": [],
      "section_num": null,
      "paragraph_num": null
    },
    {
      "id": "node_239",
      "title": "-------------------------------------------",
      "level": 2,
      "parent": "node_191",
      "content_preview": "",
      "line_start": 2254,
      "line_end": 2254,
      "category": "general",
      "children": [],
      "section_num": null,
      "paragraph_num": null
    },
    {
      "id": "node_240",
      "title": "SEKTION 34 — OPTION A/B/C MUSTER (R47 — PFLICHT)",
      "level": 2,
      "parent": "node_191",
      "content_preview": "",
      "line_start": 2255,
      "line_end": 2255,
      "category": "rules",
      "children": [],
      "section_num": "34",
      "paragraph_num": null
    },
    {
      "id": "node_241",
      "title": "-------------------------------------------",
      "level": 2,
      "parent": "node_191",
      "content_preview": "> **Stand:** 2026-04-01 · Verbindliches Feedback-Pattern für alle Agenten",
      "line_start": 2256,
      "line_end": 2259,
      "category": "agent",
      "children": [
        "node_242",
        "node_243",
        "node_244",
        "node_245",
        "node_246",
        "node_247"
      ],
      "section_num": null,
      "paragraph_num": null
    },
    {
      "id": "node_242",
      "title": "34.1 Regel R47: ABC-Optionen nach Feature-Abschluss",
      "level": 3,
      "parent": "node_241",
      "content_preview": "> **PFLICHT:** Nach JEDEM abgeschlossenen Feature oder Task werden dem User\n> 3 Optionen zur Weiterentwicklung angeboten. Kein Agent darf ein Feature\n> abschließen ohne Optionen anzubieten.",
      "line_start": 2260,
      "line_end": 2265,
      "category": "rules",
      "children": [],
      "section_num": null,
      "paragraph_num": null
    },
    {
      "id": "node_243",
      "title": "34.2 Format-Vorlage",
      "level": 3,
      "parent": "node_241",
      "content_preview": "```markdown",
      "line_start": 2266,
      "line_end": 2268,
      "category": "output",
      "children": [],
      "section_num": null,
      "paragraph_num": null
    },
    {
      "id": "node_244",
      "title": "🚀 Nächste Optionen (§[Nr]):",
      "level": 3,
      "parent": "node_241",
      "content_preview": "**Option A:** [Einfaches Feature] — schnell, 1-2 Dateien\n\n**Option B:** [Mittleres Feature] — moderate Komplexität\n\n**Option C:**\n  - **a)** [Power-Feature 1] — komplexes System\n  - **b)** [Power-Feature 2] — ergänzendes System\n```",
      "line_start": 2269,
      "line_end": 2279,
      "category": "general",
      "children": [],
      "section_num": null,
      "paragraph_num": null
    },
    {
      "id": "node_245",
      "title": "34.3 Regeln",
      "level": 3,
      "parent": "node_241",
      "content_preview": "| Regel | Beschreibung |\n|:------|:-------------|\n| **IMMER 3 Optionen** | A, B und C — niemals weniger |\n| **C hat IMMER a+b** | Zwei Sub-Features die zusammen Sinn ergeben |\n| **Aufsteigend komplex** | A = einfach, B = mittel, C = komplex (a+b) |\n| **Kontextbezogen** | Optionen bauen auf dem gerade fertiggestellten Feature auf |\n| **§-Nummer fortlaufend** | Jede Option-Runde bekommt eine neue §-Nummer im Output |\n| **Kein Zwang** | User kann auch etwas komplett anderes wählen |\n| **Git Commit ",
      "line_start": 2280,
      "line_end": 2291,
      "category": "rules",
      "children": [],
      "section_num": null,
      "paragraph_num": null
    },
    {
      "id": "node_246",
      "title": "34.4 Warum dieses Muster",
      "level": 3,
      "parent": "node_241",
      "content_preview": "- **Power-User Workflow:** 777 wählt fast immer Option C → beide Sub-Features\n- **Momentum:** Kein Stopp-Moment nach Feature-Abschluss — direkter Flow\n- **Priorisierung:** User entscheidet sofort, Agent liefert passende Vorschläge\n- **Dokumentation:** §-Nummern im Output tracken den Feature-Verlauf der Session",
      "line_start": 2292,
      "line_end": 2298,
      "category": "output",
      "children": [],
      "section_num": null,
      "paragraph_num": null
    },
    {
      "id": "node_247",
      "title": "34.5 Für Admins / Neue Agenten",
      "level": 3,
      "parent": "node_241",
      "content_preview": "Wenn ein neuer Agent (Claude, Gemini, oder Custom) das System betritt:\n1. GEMINI.md §31 lesen → ABC-Muster kennen\n2. Playbook §34 lesen → Format-Vorlage übernehmen\n3. Nach JEDEM abgeschlossenen Task → 3 Optionen anbieten\n4. **Verletzung:** Wenn keine Optionen angeboten werden → Agent muss nachliefern\n\n---",
      "line_start": 2299,
      "line_end": 2308,
      "category": "agent",
      "children": [],
      "section_num": null,
      "paragraph_num": null
    },
    {
      "id": "node_248",
      "title": "-------------------------------------------",
      "level": 2,
      "parent": "node_191",
      "content_preview": "",
      "line_start": 2309,
      "line_end": 2309,
      "category": "general",
      "children": [],
      "section_num": null,
      "paragraph_num": null
    },
    {
      "id": "node_249",
      "title": "SEKTION 35 — FRONTPAGE BUILDER",
      "level": 2,
      "parent": "node_191",
      "content_preview": "",
      "line_start": 2310,
      "line_end": 2310,
      "category": "general",
      "children": [],
      "section_num": "35",
      "paragraph_num": null
    },
    {
      "id": "node_250",
      "title": "-------------------------------------------",
      "level": 2,
      "parent": "node_191",
      "content_preview": "",
      "line_start": 2311,
      "line_end": 2312,
      "category": "general",
      "children": [
        "node_251",
        "node_252",
        "node_253",
        "node_254",
        "node_255",
        "node_256",
        "node_257"
      ],
      "section_num": null,
      "paragraph_num": null
    },
    {
      "id": "node_251",
      "title": "35.1 Übersicht",
      "level": 3,
      "parent": "node_250",
      "content_preview": "Premium-Frontpages für neue User erstellen — mit NLM-Infografiken, Podcast-Player,\nShowcase-Slider und Signup-Guide. Komplett dokumentiert als Skill + Workflow.",
      "line_start": 2313,
      "line_end": 2317,
      "category": "nlm",
      "children": [],
      "section_num": null,
      "paragraph_num": null
    },
    {
      "id": "node_252",
      "title": "35.2 Dateien",
      "level": 3,
      "parent": "node_250",
      "content_preview": "| Datei | Pfad |\n|:------|:-----|\n| Skill | `.agents/skills/frontpage-builder/SKILL.md` |\n| Workflow | `.agents/workflows/frontpage-create.md` |\n| Referenz-HTML | `01_PROJECTS/10_devkitz-eu/welcome.html` |\n| Referenz-CSS | `01_PROJECTS/10_devkitz-eu/welcome.css` |\n| Referenz-JS | `01_PROJECTS/10_devkitz-eu/welcome.js` |",
      "line_start": 2318,
      "line_end": 2327,
      "category": "design",
      "children": [],
      "section_num": null,
      "paragraph_num": null
    },
    {
      "id": "node_253",
      "title": "35.3 Pflicht-Sektionen (10 Blöcke)",
      "level": 3,
      "parent": "node_250",
      "content_preview": "| # | Sektion | Beschreibung |\n|:--|:--------|:-------------|\n| 1 | 🍌 Hero | Titel, Tagline, CTA Buttons |\n| 2 | 📋 Einführung | 6 Feature-Cards, kundenfreundlich |\n| 3 | 📊 Infografiken | NLM Mind Maps mit Lightbox-Zoom |\n| 4 | 📸 Showcase Slider | 3+ Slides, Auto-Rotation (6s) |\n| 5 | 🎙️ Podcast Player | Play/Pause, Progress-Seek, Zeitanzeige |\n| 6 | 🔢 Timeline | 4-Schritt Loslegen-Guide |\n| 7 | 📝 Signup Guide | GitHub + Google nebeneinander |\n| 8 | 📋 Clone Box | `git clone` + Copy-to-Clipboard |",
      "line_start": 2328,
      "line_end": 2342,
      "category": "rules",
      "children": [],
      "section_num": null,
      "paragraph_num": null
    },
    {
      "id": "node_254",
      "title": "35.4 Podcast-Integration",
      "level": 3,
      "parent": "node_250",
      "content_preview": "- **Quelle:** `02_RESEARCH/01_podcasts/` (35+ MP3)\n- **Player:** Custom HTML5 Audio mit Progress-Bar-Seek\n- **Verhalten:** Single-Active (nur ein Podcast gleichzeitig)\n- **UI:** Glassmorphism-Cards mit Play-Button, Cover-Art, Zeitanzeige",
      "line_start": 2343,
      "line_end": 2349,
      "category": "nlm",
      "children": [],
      "section_num": null,
      "paragraph_num": null
    },
    {
      "id": "node_255",
      "title": "35.5 NLM-Infografiken",
      "level": 3,
      "parent": "node_250",
      "content_preview": "- **Quelle:** `02_RESEARCH/notebooklm/` (11+ Mind Map PNGs)\n- **Lightbox:** Klick → Vollbild-Overlay, ESC zum Schließen\n- **Zoom:** 🔍 Indikator bei Hover",
      "line_start": 2350,
      "line_end": 2355,
      "category": "nlm",
      "children": [],
      "section_num": null,
      "paragraph_num": null
    },
    {
      "id": "node_256",
      "title": "35.6 🍌 Banana-Theme (Optional)",
      "level": 3,
      "parent": "node_250",
      "content_preview": "Spielerische Variante mit Banana-Elementen:\n\n```css\n.banana-theme {\n    --accent: #FFD700;\n    --accent-soft: rgba(255, 215, 0, 0.12);\n    --accent-glow: rgba(255, 215, 0, 0.4);\n}\n.banana-btn {\n    background: linear-gradient(135deg, #FFD700, #FFA500);\n    color: #1a1a1a;\n}\n.banana-btn::before { content: '🍌 '; }\n```\n\n- Buttons mit 🍌 Emoji-Präfix\n- Gold/Banana Akzent-Farbe `#FFD700`\n- Icons als Banana-Emojis\n- Subtile Banana-Pattern in Backgrounds",
      "line_start": 2356,
      "line_end": 2377,
      "category": "design",
      "children": [],
      "section_num": null,
      "paragraph_num": null
    },
    {
      "id": "node_257",
      "title": "35.7 Workflow-Ablauf (12 Schritte)",
      "level": 3,
      "parent": "node_250",
      "content_preview": "1. Skill lesen → `.agents/skills/frontpage-builder/SKILL.md`\n2. Zielordner analysieren\n3. Asset-Ordner erstellen (`assets/img/`, `assets/mindmaps/`, `assets/podcasts/`)\n4. NLM Mind Maps kopieren (3+)\n5. Podcasts kopieren (3+)\n6. Vorschaubilder generieren (`generate_image`)\n7. HTML mit 10 Sektionen erstellen\n8. CSS mit DkZ™ Design System v2\n9. JS mit Player, Slider, Lightbox\n10. Browser-Test\n11. Git Commit\n12. Dokumentation (Antigravity-Artefakt + Playbook)\n\n---\n\n> **🏷️ Tags:** #playbook #auto-sy",
      "line_start": 2378,
      "line_end": 2402,
      "category": "git",
      "children": [],
      "section_num": null,
      "paragraph_num": null
    },
    {
      "id": "node_258",
      "title": "§46 — Ecosystem Final Upgrade: Manus Brain & Karpathy Optimizer",
      "level": 2,
      "parent": "node_191",
      "content_preview": "> Stand: Mai 2026",
      "line_start": 2403,
      "line_end": 2404,
      "category": "general",
      "children": [
        "node_259",
        "node_260",
        "node_261"
      ],
      "section_num": null,
      "paragraph_num": "46"
    },
    {
      "id": "node_259",
      "title": "1. Karpathy-Optimizer Meta-Skill",
      "level": 3,
      "parent": "node_258",
      "content_preview": "Jeder neu erstellte Skill muss ab sofort durch den `karpathy-optimizer` Meta-Skill durchlaufen. Dieser optimiert Code, Prompts und Logik auf maximale Effizienz, Redundanzvermeidung und Token-Ersparnis. Die Logik wird auch angewandt auf die Legacy/Kern-Systeme: `nanobot`, `nanochat` und `pytorch`.",
      "line_start": 2405,
      "line_end": 2406,
      "category": "agent",
      "children": [],
      "section_num": null,
      "paragraph_num": null
    },
    {
      "id": "node_260",
      "title": "2. Das Manus Brain für OpenCode",
      "level": 3,
      "parent": "node_258",
      "content_preview": "OpenCode Agenten agieren nicht mehr nur als Coder, sondern als \"Manus Brain\". Das heißt:\n- Sie erstellen vorab einen *Tree of Thoughts* für komplexe Probleme.\n- Sie nutzen *Dead-End Prediction* und *Self-Correction*.\n- Sie orchestrieren Asynchronität wie eine Senior-Instanz.",
      "line_start": 2407,
      "line_end": 2411,
      "category": "agent",
      "children": [],
      "section_num": null,
      "paragraph_num": null
    },
    {
      "id": "node_261",
      "title": "3. The New Meta: AutoResearch Finalisiert",
      "level": 3,
      "parent": "node_258",
      "content_preview": "Wir kondensieren \"Claude Code + Karpathy AutoResearch = The New Meta\" im dedizierten `autoresearch` Skill. Agenten fluten keinen Kontext mehr mit RAG-Daten, sondern nutzen LLM-vorverarbeitete, kondensierte Master-Wikis als \"Anti-RAG\"-Architektur.\n\n---",
      "line_start": 2412,
      "line_end": 2416,
      "category": "research",
      "children": [],
      "section_num": null,
      "paragraph_num": null
    },
    {
      "id": "node_262",
      "title": "§47 — Post-Implementierungs-Workflow (Build → Test → Deploy → Verify)",
      "level": 2,
      "parent": "node_191",
      "content_preview": "> **Stand:** 2026-05-10 · **Status:** 🟢 VERBINDLICH\n> **Anlass:** Wispe™ v3.0 Audit — 59/59 Tests bestanden, 1 Bug entdeckt (fehlende CSS)\n> **Regel:** Nach JEDER neuen Erstellung oder Verbesserung MUSS dieser Workflow durchlaufen werden.",
      "line_start": 2417,
      "line_end": 2422,
      "category": "rules",
      "children": [
        "node_263",
        "node_264",
        "node_265",
        "node_266"
      ],
      "section_num": null,
      "paragraph_num": "47"
    },
    {
      "id": "node_263",
      "title": "47.1 Der 7-Schritt Post-Implementation Cycle",
      "level": 3,
      "parent": "node_262",
      "content_preview": "```\n+---------------------------------------------------------------+\n│  🔄 NACH JEDER IMPLEMENTIERUNG — PFLICHT — KEINE AUSNAHMEN   │\n+---------------------------------------------------------------+\n\n  ┌──────────┐     ┌──────────┐     ┌──────────┐\n  │ 1. BUILD │────→│ 2. TEST  │────→│ 3. FIX   │\n  │ Version  │     │ TestCafe │     │ Bugs     │\n  │ bumpen   │     │ Headless │     │ fixen    │\n  └──────────┘     └──────────┘     └────┬─────┘\n                                         │ ↺ Loop bis ",
      "line_start": 2423,
      "line_end": 2448,
      "category": "rules",
      "children": [],
      "section_num": null,
      "paragraph_num": null
    },
    {
      "id": "node_264",
      "title": "47.2 Schritt-für-Schritt Anleitung",
      "level": 3,
      "parent": "node_262",
      "content_preview": "| # | Schritt | Befehl / Aktion | Pflicht |\n|:--|:--------|:----------------|:--------|\n| 1 | **Version bumpen** | `package.json` → version hochsetzen (semver) | ✅ IMMER |\n| 2 | **TestCafe Tests schreiben/ausführen** | `npx testcafe chrome:headless tests/ --reporter spec` | ✅ IMMER |\n| 3 | **Bugs fixen** | Fehlgeschlagene Tests analysieren → Fix → Erneut testen | ✅ BIS 100% |\n| 4 | **Build erstellen** | `npm run build` (Electron: portable EXE) | ✅ bei Electron/App |\n| 5 | **Deploy + Starten** | ",
      "line_start": 2449,
      "line_end": 2461,
      "category": "rules",
      "children": [],
      "section_num": null,
      "paragraph_num": null
    },
    {
      "id": "node_265",
      "title": "47.3 TestCafe Audit-Vorlage (Pflicht-Testbereiche)",
      "level": 3,
      "parent": "node_262",
      "content_preview": "Jede Test-Suite MUSS mindestens diese 10 Bereiche abdecken:\n\n```javascript\n// ═══ PFLICHT-TEST-BEREICHE (Minimum) ═══\n// 1. Grundstruktur    — Seite lädt, Title, Meta, CSS/JS vorhanden\n// 2. Navigation       — Alle Buttons klickbar, Tabs wechseln\n// 3. Core-Feature     — Hauptfunktion funktioniert (Voice, Chat, etc.)\n// 4. Console/Terminal — Befehle funktionieren, Output korrekt\n// 5. Modul-Laden     — Alle JS-Module geladen (typeof !== 'undefined')\n// 6. Persistenz      — localStorage, Sessions",
      "line_start": 2462,
      "line_end": 2479,
      "category": "rules",
      "children": [],
      "section_num": null,
      "paragraph_num": null
    },
    {
      "id": "node_266",
      "title": "47.4 Test-Infrastruktur Setup (Einmalig pro Projekt)",
      "level": 3,
      "parent": "node_262",
      "content_preview": "```bash",
      "line_start": 2480,
      "line_end": 2482,
      "category": "general",
      "children": [],
      "section_num": null,
      "paragraph_num": null
    },
    {
      "id": "node_267",
      "title": "1. TestCafe installieren",
      "level": 1,
      "parent": null,
      "content_preview": "npm install --save-dev testcafe",
      "line_start": 2483,
      "line_end": 2485,
      "category": "general",
      "children": [],
      "section_num": null,
      "paragraph_num": null
    },
    {
      "id": "node_268",
      "title": "2. Test-Scripts in package.json",
      "level": 1,
      "parent": null,
      "content_preview": "\"scripts\": {\n  \"test\": \"npx http-server ./src -p 8899 -c-1 --cors & npx testcafe chrome:headless tests/\",\n  \"test:headed\": \"npx http-server ./src -p 8899 -c-1 --cors & npx testcafe chrome tests/\"\n}",
      "line_start": 2486,
      "line_end": 2491,
      "category": "backend",
      "children": [],
      "section_num": null,
      "paragraph_num": null
    },
    {
      "id": "node_269",
      "title": "3. Tests-Ordner erstellen",
      "level": 1,
      "parent": null,
      "content_preview": "mkdir tests/",
      "line_start": 2492,
      "line_end": 2494,
      "category": "general",
      "children": [],
      "section_num": null,
      "paragraph_num": null
    },
    {
      "id": "node_270",
      "title": "4. Test-Datei erstellen",
      "level": 1,
      "parent": null,
      "content_preview": "",
      "line_start": 2495,
      "line_end": 2495,
      "category": "general",
      "children": [],
      "section_num": null,
      "paragraph_num": null
    },
    {
      "id": "node_271",
      "title": "→ tests/[projektname]-full-audit.test.js",
      "level": 1,
      "parent": null,
      "content_preview": "```",
      "line_start": 2496,
      "line_end": 2498,
      "category": "general",
      "children": [
        "node_272",
        "node_273",
        "node_274",
        "node_275"
      ],
      "section_num": null,
      "paragraph_num": null
    },
    {
      "id": "node_272",
      "title": "47.5 Referenz-Implementierung: Wispe™ v3.0",
      "level": 3,
      "parent": "node_271",
      "content_preview": "| Metrik | Wert |\n|:-------|:-----|\n| **Tests gesamt** | 59 |\n| **Bestanden (Run 1)** | 56/59 (3 Bugs) |\n| **Bestanden (Run 2)** | 59/59 (100% ✅) |\n| **Entdeckte Bugs** | `console-bar.css` fehlte (404), Nanobot-Modulname, CSS uppercase |\n| **Testzeit** | ~52 Sekunden (headless Chrome) |\n| **Testbereiche** | 20 Fixtures × 1-8 Tests |\n| **Test-Datei** | `tests/wispe-full-audit.test.js` |",
      "line_start": 2499,
      "line_end": 2510,
      "category": "module",
      "children": [],
      "section_num": null,
      "paragraph_num": null
    },
    {
      "id": "node_273",
      "title": "47.6 Wann NICHT testen (Ausnahmen)",
      "level": 3,
      "parent": "node_271",
      "content_preview": "| Situation | Aktion |\n|:----------|:-------|\n| Nur Dokumentation geändert (.md) | ❌ Kein TestCafe nötig — nur Git Commit |\n| Nur CSS-Farbe angepasst | ❌ Kein TestCafe — visuell prüfen reicht |\n| Neues Feature/Modul gebaut | ✅ PFLICHT — Voller Audit |\n| Bugfix implementiert | ✅ PFLICHT — Regression-Test |\n| Build/EXE erneuert | ✅ PFLICHT — Smoke-Test (mind. 10 Tests) |\n| Config/API-Key geändert | ⚠️ Situativ — Integration-Test empfohlen |",
      "line_start": 2511,
      "line_end": 2521,
      "category": "git",
      "children": [],
      "section_num": null,
      "paragraph_num": null
    },
    {
      "id": "node_274",
      "title": "47.7 Automatische Bug-Erkennung (Lessons Learned)",
      "level": 3,
      "parent": "node_271",
      "content_preview": "Bugs die TestCafe automatisch findet:\n\n| Bug-Typ | Wie TestCafe es findet | Beispiel |\n|:---------|:----------------------|:---------|\n| **Fehlende CSS-Datei** | Server-Logs zeigen 404 | `console-bar.css` nicht erstellt |\n| **Falscher Modulname** | `typeof X !== 'undefined'` schlägt fehl | `NanobotClassifier` vs `Nanobot` |\n| **CSS text-transform** | `innerText` liefert uppercase | `.brand-sub` war `UPPERCASE` |\n| **Fehlende HTML-IDs** | `Selector('#id').exists` = false | Button ohne ID |\n| **JS",
      "line_start": 2522,
      "line_end": 2534,
      "category": "backend",
      "children": [],
      "section_num": null,
      "paragraph_num": null
    },
    {
      "id": "node_275",
      "title": "47.8 Git-Commit-Schema nach Audit",
      "level": 3,
      "parent": "node_271",
      "content_preview": "```bash",
      "line_start": 2535,
      "line_end": 2537,
      "category": "git",
      "children": [],
      "section_num": null,
      "paragraph_num": null
    },
    {
      "id": "node_276",
      "title": "Nach erfolgreichem Audit:",
      "level": 1,
      "parent": null,
      "content_preview": "git add -A\ngit commit -m \"feat([projekt]): TestCafe [N]-Test Audit + [Bug-Fix] + npm test Scripts\"",
      "line_start": 2538,
      "line_end": 2541,
      "category": "git",
      "children": [],
      "section_num": null,
      "paragraph_num": null
    },
    {
      "id": "node_277",
      "title": "Beispiel:",
      "level": 1,
      "parent": null,
      "content_preview": "git commit -m \"feat(wispe): TestCafe 59-Test Audit + console-bar.css Bug-Fix + npm test Scripts\"\n```",
      "line_start": 2542,
      "line_end": 2545,
      "category": "git",
      "children": [
        "node_278",
        "node_279"
      ],
      "section_num": null,
      "paragraph_num": null
    },
    {
      "id": "node_278",
      "title": "47.9 Pflicht-Artefakte nach Post-Implementation",
      "level": 3,
      "parent": "node_277",
      "content_preview": "| Artefakt | Pfad | Inhalt |\n|:---------|:-----|:-------|\n| **Test-Suite** | `tests/[name]-full-audit.test.js` | Mindestens 10 Fixtures |\n| **package.json** | Root | `test` und `test:headed` Scripts |\n| **task.md** | Antigravity Brain | Aktualisiert mit Test-Ergebnissen |\n| **Playbook §-Eintrag** | `04_SYSTEM/DKZ_PLAYBOOK.md` | Neue §-Sektion für Feature |\n| **Git Commit** | Repository | Aussagekräftige Message |\n| **EXE/Build** | Desktop oder `build_out/` | Aktueller Stand |\n| **GitHub Push** |",
      "line_start": 2546,
      "line_end": 2559,
      "category": "rules",
      "children": [],
      "section_num": null,
      "paragraph_num": null
    },
    {
      "id": "node_279",
      "title": "47.10 GitHub Release & Push Workflow (PFLICHT am Ende)",
      "level": 3,
      "parent": "node_277",
      "content_preview": "> **Regel:** Jede abgeschlossene Implementierung MUSS auf GitHub gepusht werden.\n> Bei Major-Features (neue Module, Breaking Changes) MUSS ein GitHub Release erstellt werden.\n\n```bash",
      "line_start": 2560,
      "line_end": 2565,
      "category": "git",
      "children": [],
      "section_num": null,
      "paragraph_num": null
    },
    {
      "id": "node_280",
      "title": "═══ SCHRITT 1: Push zum Remote ═══",
      "level": 1,
      "parent": null,
      "content_preview": "git push origin master",
      "line_start": 2566,
      "line_end": 2567,
      "category": "git",
      "children": [],
      "section_num": null,
      "paragraph_num": null
    },
    {
      "id": "node_281",
      "title": "Falls kein Remote: git remote add origin https://github.com/777/[repo].git",
      "level": 1,
      "parent": null,
      "content_preview": "",
      "line_start": 2568,
      "line_end": 2569,
      "category": "git",
      "children": [],
      "section_num": null,
      "paragraph_num": null
    },
    {
      "id": "node_282",
      "title": "═══ SCHRITT 2: Release Tag erstellen (bei Major Features) ═══",
      "level": 1,
      "parent": null,
      "content_preview": "git tag -a v3.0.0 -m \"feat: Wispe v3.0 — Brain View, Chat-Persistenz, Research Modi\"\ngit push origin v3.0.0",
      "line_start": 2570,
      "line_end": 2573,
      "category": "git",
      "children": [],
      "section_num": null,
      "paragraph_num": null
    },
    {
      "id": "node_283",
      "title": "═══ SCHRITT 3: GitHub Release erstellen ═══",
      "level": 1,
      "parent": null,
      "content_preview": "",
      "line_start": 2574,
      "line_end": 2574,
      "category": "git",
      "children": [],
      "section_num": null,
      "paragraph_num": null
    },
    {
      "id": "node_284",
      "title": "→ Via GitKraken MCP oder GitHub Web UI",
      "level": 1,
      "parent": null,
      "content_preview": "",
      "line_start": 2575,
      "line_end": 2575,
      "category": "git",
      "children": [],
      "section_num": null,
      "paragraph_num": null
    },
    {
      "id": "node_285",
      "title": "→ Titel: \"v3.0.0 — [Feature-Name]\"",
      "level": 1,
      "parent": null,
      "content_preview": "",
      "line_start": 2576,
      "line_end": 2576,
      "category": "general",
      "children": [],
      "section_num": null,
      "paragraph_num": null
    },
    {
      "id": "node_286",
      "title": "→ Body: Changelog mit allen Änderungen",
      "level": 1,
      "parent": null,
      "content_preview": "",
      "line_start": 2577,
      "line_end": 2577,
      "category": "general",
      "children": [],
      "section_num": null,
      "paragraph_num": null
    },
    {
      "id": "node_287",
      "title": "→ Assets: EXE-Datei anhängen (wenn Electron/Desktop)",
      "level": 1,
      "parent": null,
      "content_preview": "```\n\n| Wann Release erstellen? | Tag-Format | Beispiel |\n|:------------------------|:-----------|:---------|\n| **Neues Modul** | `vX.0.0` (Major) | `v3.0.0` |\n| **Neues Feature** | `vX.Y.0` (Minor) | `v3.1.0` |\n| **Bugfix / Patch** | `vX.Y.Z` (Patch) | `v3.0.1` |\n| **Nur Docs** | ❌ Kein Release | Nur Push |\n| **Hotfix** | `vX.Y.Z-hotfix.N` | `v3.0.0-hotfix.1` |",
      "line_start": 2578,
      "line_end": 2588,
      "category": "output",
      "children": [
        "node_288"
      ],
      "section_num": null,
      "paragraph_num": null
    },
    {
      "id": "node_288",
      "title": "47.11 Dokumentations-Update Pflicht (GitHub `docs/`)",
      "level": 3,
      "parent": "node_287",
      "content_preview": "> **Regel:** Bei JEDER Implementierung müssen die GitHub-Docs aktualisiert werden.\n> Die Docs leben im `docs/` Ordner des Repos und werden als GitHub Pages oder README referenziert.\n\n```\ndocs/\n├── README.md              ← Projekt-Übersicht (IMMER aktuell!)\n├── CHANGELOG.md           ← Alle Versionen + Änderungen\n├── ARCHITECTURE.md        ← System-Architektur\n├── API.md                 ← API-Referenz (wenn Backend)\n├── TESTING.md             ← Test-Strategie + TestCafe Setup\n├── CONTRIBUTING.md ",
      "line_start": 2589,
      "line_end": 2618,
      "category": "git",
      "children": [],
      "section_num": null,
      "paragraph_num": null
    },
    {
      "id": "node_289",
      "title": "Changelog",
      "level": 1,
      "parent": null,
      "content_preview": "",
      "line_start": 2619,
      "line_end": 2620,
      "category": "general",
      "children": [
        "node_290"
      ],
      "section_num": null,
      "paragraph_num": null
    },
    {
      "id": "node_290",
      "title": "[3.0.0] - 2026-05-10",
      "level": 2,
      "parent": "node_289",
      "content_preview": "",
      "line_start": 2621,
      "line_end": 2621,
      "category": "general",
      "children": [
        "node_291",
        "node_292",
        "node_293",
        "node_294"
      ],
      "section_num": null,
      "paragraph_num": null
    },
    {
      "id": "node_291",
      "title": "Added",
      "level": 3,
      "parent": "node_290",
      "content_preview": "- Brain View mit Obsidian + Graphify Integration\n- Chat-Persistenz (auto-save als .md)\n- Research-Modi: fast, think, fakecheck\n- 59 TestCafe Tests (Full Audit)",
      "line_start": 2622,
      "line_end": 2627,
      "category": "research",
      "children": [],
      "section_num": null,
      "paragraph_num": null
    },
    {
      "id": "node_292",
      "title": "Fixed",
      "level": 3,
      "parent": "node_290",
      "content_preview": "- console-bar.css fehlte (404 Bug)\n- Nanobot Modulname-Korrektur",
      "line_start": 2628,
      "line_end": 2631,
      "category": "module",
      "children": [],
      "section_num": null,
      "paragraph_num": null
    },
    {
      "id": "node_293",
      "title": "Changed",
      "level": 3,
      "parent": "node_290",
      "content_preview": "- Version bump 2.1.0 → 3.0.0\n```",
      "line_start": 2632,
      "line_end": 2635,
      "category": "general",
      "children": [],
      "section_num": null,
      "paragraph_num": null
    },
    {
      "id": "node_294",
      "title": "47.12 Komplett-Checkliste (Am Ende JEDER Session)",
      "level": 3,
      "parent": "node_290",
      "content_preview": "```\n✅ POST-IMPLEMENTATION CHECKLISTE\n═══════════════════════════════════\n□ 1. Version in package.json gebumpt\n□ 2. TestCafe Tests geschrieben + alle grün\n□ 3. Build erstellt (EXE/Bundle wenn nötig)\n□ 4. EXE deployed + gestartet + verifiziert\n□ 5. Git commit mit aussagekräftiger Message\n□ 6. Git push origin master\n□ 7. GitHub Release erstellt (bei Major/Minor)\n□ 8. CHANGELOG.md aktualisiert\n□ 9. README.md aktualisiert (Features, Screenshots)\n□ 10. Playbook §-Eintrag erstellt\n□ 11. task.md + walkt",
      "line_start": 2636,
      "line_end": 2663,
      "category": "git",
      "children": [],
      "section_num": null,
      "paragraph_num": null
    },
    {
      "id": "sys_bootstrap",
      "title": "LLM_BOOTSTRAP.md",
      "level": 1,
      "parent": null,
      "content_preview": "Minimaler Kontext fuer JEDEN Agenten beim Session-Start. Schluesselregeln und CSS-Variablen.",
      "line_start": 1,
      "line_end": 1,
      "category": "rules",
      "children": [],
      "section_num": null,
      "paragraph_num": null
    },
    {
      "id": "sys_regelwerk",
      "title": "REGELWERK.md",
      "level": 1,
      "parent": null,
      "content_preview": "Alle 44+ Oekosystem-Regeln (R0-R44) und Konventionen. Verbindliche Richtlinie fuer die Codebase.",
      "line_start": 1,
      "line_end": 1,
      "category": "rules",
      "children": [],
      "section_num": null,
      "paragraph_num": null
    },
    {
      "id": "sys_blaupause",
      "title": "BLAUPAUSE.md",
      "level": 1,
      "parent": null,
      "content_preview": "Architektur-Uebersicht des DkZ Dashboards. Zeigt alle 89+ Module und 34+ Shared Scripts.",
      "line_start": 1,
      "line_end": 1,
      "category": "design",
      "children": [],
      "section_num": null,
      "paragraph_num": null
    },
    {
      "id": "sys_gemini",
      "title": "GEMINI.md",
      "level": 1,
      "parent": null,
      "content_preview": "Gemini/Antigravity-Gedaechtnis und session-spezifische Anweisungen.",
      "line_start": 1,
      "line_end": 1,
      "category": "agent",
      "children": [],
      "section_num": null,
      "paragraph_num": null
    },
    {
      "id": "sys_claude",
      "title": "CLAUDE.md",
      "level": 1,
      "parent": null,
      "content_preview": "Claude-Gedaechtnis, system-spezifische Anweisungen und aktive MCP Server.",
      "line_start": 1,
      "line_end": 1,
      "category": "agent",
      "children": [],
      "section_num": null,
      "paragraph_num": null
    },
    {
      "id": "sys_agents",
      "title": "AGENTS.md",
      "level": 1,
      "parent": null,
      "content_preview": "DkZ AGENTS.md — Agenten-Registry des BMAD-Systems und der Fleet.",
      "line_start": 1,
      "line_end": 1,
      "category": "agent",
      "children": [],
      "section_num": null,
      "paragraph_num": null
    },
    {
      "id": "agent_james",
      "title": "James™ (Guardian)",
      "level": 1,
      "parent": null,
      "content_preview": "Ueberwacht alle Aktionen, code-freie Zone, R24-Schutz und Context Pipeline.",
      "line_start": 1,
      "line_end": 1,
      "category": "agent",
      "children": [],
      "section_num": null,
      "paragraph_num": null
    },
    {
      "id": "agent_pm",
      "title": "DkZ PM™",
      "level": 1,
      "parent": null,
      "content_preview": "Product Manager — spec.md, User Stories und Feature-Sichtbarkeit.",
      "line_start": 1,
      "line_end": 1,
      "category": "agent",
      "children": [],
      "section_num": null,
      "paragraph_num": null
    },
    {
      "id": "agent_architekt",
      "title": "DkZ Architekt™",
      "level": 1,
      "parent": null,
      "content_preview": "plan.md, Tech-Stack Design und Modularisierung.",
      "line_start": 1,
      "line_end": 1,
      "category": "agent",
      "children": [],
      "section_num": null,
      "paragraph_num": null
    },
    {
      "id": "agent_developer",
      "title": "DkZ Developer™",
      "level": 1,
      "parent": null,
      "content_preview": "Coder — Ralph-Loop Executor und TDD-Strasse.",
      "line_start": 1,
      "line_end": 1,
      "category": "agent",
      "children": [],
      "section_num": null,
      "paragraph_num": null
    },
    {
      "id": "agent_reviewer",
      "title": "DkZ Reviewer™",
      "level": 1,
      "parent": null,
      "content_preview": "CodeRabbit Panel — Qualitaetspruefung und Umlautkontrolle.",
      "line_start": 1,
      "line_end": 1,
      "category": "agent",
      "children": [],
      "section_num": null,
      "paragraph_num": null
    },
    {
      "id": "agent_tester",
      "title": "DkZ Tester™",
      "level": 1,
      "parent": null,
      "content_preview": "E2E-Tests, Playwright Smoke-Tests und Validierung.",
      "line_start": 1,
      "line_end": 1,
      "category": "agent",
      "children": [],
      "section_num": null,
      "paragraph_num": null
    },
    {
      "id": "agent_dokumentar",
      "title": "DkZ Dokumentar™",
      "level": 1,
      "parent": null,
      "content_preview": "READMEs, Wiki Hub, WissenHub-Archivierung und Session-Ende-Check.",
      "line_start": 1,
      "line_end": 1,
      "category": "agent",
      "children": [],
      "section_num": null,
      "paragraph_num": null
    }
  ],
  "edges": [
    {
      "source": "node_0",
      "target": "node_1",
      "type": "parent-child"
    },
    {
      "source": "node_0",
      "target": "node_2",
      "type": "parent-child"
    },
    {
      "source": "node_0",
      "target": "node_3",
      "type": "parent-child"
    },
    {
      "source": "node_3",
      "target": "node_4",
      "type": "parent-child"
    },
    {
      "source": "node_3",
      "target": "node_5",
      "type": "parent-child"
    },
    {
      "source": "node_3",
      "target": "node_6",
      "type": "parent-child"
    },
    {
      "source": "node_0",
      "target": "node_7",
      "type": "parent-child"
    },
    {
      "source": "node_0",
      "target": "node_8",
      "type": "parent-child"
    },
    {
      "source": "node_0",
      "target": "node_9",
      "type": "parent-child"
    },
    {
      "source": "node_9",
      "target": "node_10",
      "type": "parent-child"
    },
    {
      "source": "node_9",
      "target": "node_11",
      "type": "parent-child"
    },
    {
      "source": "node_9",
      "target": "node_12",
      "type": "parent-child"
    },
    {
      "source": "node_13",
      "target": "node_14",
      "type": "parent-child"
    },
    {
      "source": "node_14",
      "target": "node_15",
      "type": "parent-child"
    },
    {
      "source": "node_15",
      "target": "node_16",
      "type": "parent-child"
    },
    {
      "source": "node_13",
      "target": "node_17",
      "type": "parent-child"
    },
    {
      "source": "node_13",
      "target": "node_18",
      "type": "parent-child"
    },
    {
      "source": "node_13",
      "target": "node_19",
      "type": "parent-child"
    },
    {
      "source": "node_19",
      "target": "node_20",
      "type": "parent-child"
    },
    {
      "source": "node_19",
      "target": "node_21",
      "type": "parent-child"
    },
    {
      "source": "node_19",
      "target": "node_22",
      "type": "parent-child"
    },
    {
      "source": "node_13",
      "target": "node_23",
      "type": "parent-child"
    },
    {
      "source": "node_13",
      "target": "node_24",
      "type": "parent-child"
    },
    {
      "source": "node_13",
      "target": "node_25",
      "type": "parent-child"
    },
    {
      "source": "node_25",
      "target": "node_26",
      "type": "parent-child"
    },
    {
      "source": "node_25",
      "target": "node_27",
      "type": "parent-child"
    },
    {
      "source": "node_25",
      "target": "node_28",
      "type": "parent-child"
    },
    {
      "source": "node_13",
      "target": "node_29",
      "type": "parent-child"
    },
    {
      "source": "node_13",
      "target": "node_30",
      "type": "parent-child"
    },
    {
      "source": "node_13",
      "target": "node_31",
      "type": "parent-child"
    },
    {
      "source": "node_31",
      "target": "node_32",
      "type": "parent-child"
    },
    {
      "source": "node_32",
      "target": "node_33",
      "type": "parent-child"
    },
    {
      "source": "node_32",
      "target": "node_34",
      "type": "parent-child"
    },
    {
      "source": "node_32",
      "target": "node_35",
      "type": "parent-child"
    },
    {
      "source": "node_32",
      "target": "node_36",
      "type": "parent-child"
    },
    {
      "source": "node_31",
      "target": "node_37",
      "type": "parent-child"
    },
    {
      "source": "node_31",
      "target": "node_38",
      "type": "parent-child"
    },
    {
      "source": "node_13",
      "target": "node_39",
      "type": "parent-child"
    },
    {
      "source": "node_13",
      "target": "node_40",
      "type": "parent-child"
    },
    {
      "source": "node_13",
      "target": "node_41",
      "type": "parent-child"
    },
    {
      "source": "node_41",
      "target": "node_42",
      "type": "parent-child"
    },
    {
      "source": "node_41",
      "target": "node_43",
      "type": "parent-child"
    },
    {
      "source": "node_41",
      "target": "node_44",
      "type": "parent-child"
    },
    {
      "source": "node_13",
      "target": "node_45",
      "type": "parent-child"
    },
    {
      "source": "node_13",
      "target": "node_46",
      "type": "parent-child"
    },
    {
      "source": "node_13",
      "target": "node_47",
      "type": "parent-child"
    },
    {
      "source": "node_47",
      "target": "node_48",
      "type": "parent-child"
    },
    {
      "source": "node_48",
      "target": "node_49",
      "type": "parent-child"
    },
    {
      "source": "node_48",
      "target": "node_50",
      "type": "parent-child"
    },
    {
      "source": "node_48",
      "target": "node_51",
      "type": "parent-child"
    },
    {
      "source": "node_47",
      "target": "node_52",
      "type": "parent-child"
    },
    {
      "source": "node_13",
      "target": "node_53",
      "type": "parent-child"
    },
    {
      "source": "node_13",
      "target": "node_54",
      "type": "parent-child"
    },
    {
      "source": "node_13",
      "target": "node_55",
      "type": "parent-child"
    },
    {
      "source": "node_55",
      "target": "node_56",
      "type": "parent-child"
    },
    {
      "source": "node_55",
      "target": "node_57",
      "type": "parent-child"
    },
    {
      "source": "node_55",
      "target": "node_58",
      "type": "parent-child"
    },
    {
      "source": "node_13",
      "target": "node_59",
      "type": "parent-child"
    },
    {
      "source": "node_13",
      "target": "node_60",
      "type": "parent-child"
    },
    {
      "source": "node_13",
      "target": "node_61",
      "type": "parent-child"
    },
    {
      "source": "node_61",
      "target": "node_62",
      "type": "parent-child"
    },
    {
      "source": "node_61",
      "target": "node_63",
      "type": "parent-child"
    },
    {
      "source": "node_13",
      "target": "node_64",
      "type": "parent-child"
    },
    {
      "source": "node_13",
      "target": "node_65",
      "type": "parent-child"
    },
    {
      "source": "node_13",
      "target": "node_66",
      "type": "parent-child"
    },
    {
      "source": "node_13",
      "target": "node_67",
      "type": "parent-child"
    },
    {
      "source": "node_13",
      "target": "node_68",
      "type": "parent-child"
    },
    {
      "source": "node_13",
      "target": "node_69",
      "type": "parent-child"
    },
    {
      "source": "node_69",
      "target": "node_70",
      "type": "parent-child"
    },
    {
      "source": "node_69",
      "target": "node_71",
      "type": "parent-child"
    },
    {
      "source": "node_69",
      "target": "node_72",
      "type": "parent-child"
    },
    {
      "source": "node_13",
      "target": "node_73",
      "type": "parent-child"
    },
    {
      "source": "node_13",
      "target": "node_74",
      "type": "parent-child"
    },
    {
      "source": "node_13",
      "target": "node_75",
      "type": "parent-child"
    },
    {
      "source": "node_75",
      "target": "node_76",
      "type": "parent-child"
    },
    {
      "source": "node_75",
      "target": "node_77",
      "type": "parent-child"
    },
    {
      "source": "node_13",
      "target": "node_78",
      "type": "parent-child"
    },
    {
      "source": "node_13",
      "target": "node_79",
      "type": "parent-child"
    },
    {
      "source": "node_13",
      "target": "node_80",
      "type": "parent-child"
    },
    {
      "source": "node_80",
      "target": "node_81",
      "type": "parent-child"
    },
    {
      "source": "node_80",
      "target": "node_82",
      "type": "parent-child"
    },
    {
      "source": "node_80",
      "target": "node_83",
      "type": "parent-child"
    },
    {
      "source": "node_13",
      "target": "node_84",
      "type": "parent-child"
    },
    {
      "source": "node_13",
      "target": "node_85",
      "type": "parent-child"
    },
    {
      "source": "node_13",
      "target": "node_86",
      "type": "parent-child"
    },
    {
      "source": "node_86",
      "target": "node_87",
      "type": "parent-child"
    },
    {
      "source": "node_86",
      "target": "node_88",
      "type": "parent-child"
    },
    {
      "source": "node_86",
      "target": "node_89",
      "type": "parent-child"
    },
    {
      "source": "node_13",
      "target": "node_90",
      "type": "parent-child"
    },
    {
      "source": "node_90",
      "target": "node_91",
      "type": "parent-child"
    },
    {
      "source": "node_90",
      "target": "node_92",
      "type": "parent-child"
    },
    {
      "source": "node_90",
      "target": "node_93",
      "type": "parent-child"
    },
    {
      "source": "node_90",
      "target": "node_94",
      "type": "parent-child"
    },
    {
      "source": "node_90",
      "target": "node_95",
      "type": "parent-child"
    },
    {
      "source": "node_90",
      "target": "node_96",
      "type": "parent-child"
    },
    {
      "source": "node_13",
      "target": "node_97",
      "type": "parent-child"
    },
    {
      "source": "node_13",
      "target": "node_98",
      "type": "parent-child"
    },
    {
      "source": "node_13",
      "target": "node_99",
      "type": "parent-child"
    },
    {
      "source": "node_99",
      "target": "node_100",
      "type": "parent-child"
    },
    {
      "source": "node_99",
      "target": "node_101",
      "type": "parent-child"
    },
    {
      "source": "node_99",
      "target": "node_102",
      "type": "parent-child"
    },
    {
      "source": "node_99",
      "target": "node_103",
      "type": "parent-child"
    },
    {
      "source": "node_99",
      "target": "node_104",
      "type": "parent-child"
    },
    {
      "source": "node_99",
      "target": "node_105",
      "type": "parent-child"
    },
    {
      "source": "node_13",
      "target": "node_106",
      "type": "parent-child"
    },
    {
      "source": "node_13",
      "target": "node_107",
      "type": "parent-child"
    },
    {
      "source": "node_13",
      "target": "node_108",
      "type": "parent-child"
    },
    {
      "source": "node_108",
      "target": "node_109",
      "type": "parent-child"
    },
    {
      "source": "node_108",
      "target": "node_110",
      "type": "parent-child"
    },
    {
      "source": "node_110",
      "target": "node_111",
      "type": "parent-child"
    },
    {
      "source": "node_110",
      "target": "node_112",
      "type": "parent-child"
    },
    {
      "source": "node_110",
      "target": "node_113",
      "type": "parent-child"
    },
    {
      "source": "node_110",
      "target": "node_114",
      "type": "parent-child"
    },
    {
      "source": "node_110",
      "target": "node_115",
      "type": "parent-child"
    },
    {
      "source": "node_108",
      "target": "node_116",
      "type": "parent-child"
    },
    {
      "source": "node_108",
      "target": "node_117",
      "type": "parent-child"
    },
    {
      "source": "node_108",
      "target": "node_118",
      "type": "parent-child"
    },
    {
      "source": "node_108",
      "target": "node_119",
      "type": "parent-child"
    },
    {
      "source": "node_108",
      "target": "node_120",
      "type": "parent-child"
    },
    {
      "source": "node_108",
      "target": "node_121",
      "type": "parent-child"
    },
    {
      "source": "node_13",
      "target": "node_122",
      "type": "parent-child"
    },
    {
      "source": "node_13",
      "target": "node_123",
      "type": "parent-child"
    },
    {
      "source": "node_13",
      "target": "node_124",
      "type": "parent-child"
    },
    {
      "source": "node_124",
      "target": "node_125",
      "type": "parent-child"
    },
    {
      "source": "node_124",
      "target": "node_126",
      "type": "parent-child"
    },
    {
      "source": "node_124",
      "target": "node_127",
      "type": "parent-child"
    },
    {
      "source": "node_124",
      "target": "node_128",
      "type": "parent-child"
    },
    {
      "source": "node_124",
      "target": "node_129",
      "type": "parent-child"
    },
    {
      "source": "node_124",
      "target": "node_130",
      "type": "parent-child"
    },
    {
      "source": "node_124",
      "target": "node_131",
      "type": "parent-child"
    },
    {
      "source": "node_124",
      "target": "node_132",
      "type": "parent-child"
    },
    {
      "source": "node_124",
      "target": "node_133",
      "type": "parent-child"
    },
    {
      "source": "node_134",
      "target": "node_135",
      "type": "parent-child"
    },
    {
      "source": "node_134",
      "target": "node_136",
      "type": "parent-child"
    },
    {
      "source": "node_134",
      "target": "node_137",
      "type": "parent-child"
    },
    {
      "source": "node_134",
      "target": "node_138",
      "type": "parent-child"
    },
    {
      "source": "node_134",
      "target": "node_139",
      "type": "parent-child"
    },
    {
      "source": "node_139",
      "target": "node_140",
      "type": "parent-child"
    },
    {
      "source": "node_139",
      "target": "node_141",
      "type": "parent-child"
    },
    {
      "source": "node_139",
      "target": "node_142",
      "type": "parent-child"
    },
    {
      "source": "node_139",
      "target": "node_143",
      "type": "parent-child"
    },
    {
      "source": "node_139",
      "target": "node_144",
      "type": "parent-child"
    },
    {
      "source": "node_134",
      "target": "node_145",
      "type": "parent-child"
    },
    {
      "source": "node_134",
      "target": "node_146",
      "type": "parent-child"
    },
    {
      "source": "node_134",
      "target": "node_147",
      "type": "parent-child"
    },
    {
      "source": "node_147",
      "target": "node_148",
      "type": "parent-child"
    },
    {
      "source": "node_147",
      "target": "node_149",
      "type": "parent-child"
    },
    {
      "source": "node_147",
      "target": "node_150",
      "type": "parent-child"
    },
    {
      "source": "node_147",
      "target": "node_151",
      "type": "parent-child"
    },
    {
      "source": "node_147",
      "target": "node_152",
      "type": "parent-child"
    },
    {
      "source": "node_134",
      "target": "node_153",
      "type": "parent-child"
    },
    {
      "source": "node_153",
      "target": "node_154",
      "type": "parent-child"
    },
    {
      "source": "node_153",
      "target": "node_155",
      "type": "parent-child"
    },
    {
      "source": "node_153",
      "target": "node_156",
      "type": "parent-child"
    },
    {
      "source": "node_153",
      "target": "node_157",
      "type": "parent-child"
    },
    {
      "source": "node_153",
      "target": "node_158",
      "type": "parent-child"
    },
    {
      "source": "node_153",
      "target": "node_159",
      "type": "parent-child"
    },
    {
      "source": "node_134",
      "target": "node_160",
      "type": "parent-child"
    },
    {
      "source": "node_160",
      "target": "node_161",
      "type": "parent-child"
    },
    {
      "source": "node_160",
      "target": "node_162",
      "type": "parent-child"
    },
    {
      "source": "node_160",
      "target": "node_163",
      "type": "parent-child"
    },
    {
      "source": "node_160",
      "target": "node_164",
      "type": "parent-child"
    },
    {
      "source": "node_160",
      "target": "node_165",
      "type": "parent-child"
    },
    {
      "source": "node_134",
      "target": "node_166",
      "type": "parent-child"
    },
    {
      "source": "node_166",
      "target": "node_167",
      "type": "parent-child"
    },
    {
      "source": "node_166",
      "target": "node_168",
      "type": "parent-child"
    },
    {
      "source": "node_166",
      "target": "node_169",
      "type": "parent-child"
    },
    {
      "source": "node_166",
      "target": "node_170",
      "type": "parent-child"
    },
    {
      "source": "node_134",
      "target": "node_171",
      "type": "parent-child"
    },
    {
      "source": "node_171",
      "target": "node_172",
      "type": "parent-child"
    },
    {
      "source": "node_171",
      "target": "node_173",
      "type": "parent-child"
    },
    {
      "source": "node_171",
      "target": "node_174",
      "type": "parent-child"
    },
    {
      "source": "node_134",
      "target": "node_175",
      "type": "parent-child"
    },
    {
      "source": "node_134",
      "target": "node_176",
      "type": "parent-child"
    },
    {
      "source": "node_134",
      "target": "node_177",
      "type": "parent-child"
    },
    {
      "source": "node_134",
      "target": "node_178",
      "type": "parent-child"
    },
    {
      "source": "node_178",
      "target": "node_179",
      "type": "parent-child"
    },
    {
      "source": "node_178",
      "target": "node_180",
      "type": "parent-child"
    },
    {
      "source": "node_134",
      "target": "node_181",
      "type": "parent-child"
    },
    {
      "source": "node_181",
      "target": "node_182",
      "type": "parent-child"
    },
    {
      "source": "node_181",
      "target": "node_183",
      "type": "parent-child"
    },
    {
      "source": "node_181",
      "target": "node_184",
      "type": "parent-child"
    },
    {
      "source": "node_134",
      "target": "node_185",
      "type": "parent-child"
    },
    {
      "source": "node_134",
      "target": "node_186",
      "type": "parent-child"
    },
    {
      "source": "node_134",
      "target": "node_187",
      "type": "parent-child"
    },
    {
      "source": "node_187",
      "target": "node_188",
      "type": "parent-child"
    },
    {
      "source": "node_191",
      "target": "node_192",
      "type": "parent-child"
    },
    {
      "source": "node_191",
      "target": "node_193",
      "type": "parent-child"
    },
    {
      "source": "node_191",
      "target": "node_194",
      "type": "parent-child"
    },
    {
      "source": "node_191",
      "target": "node_195",
      "type": "parent-child"
    },
    {
      "source": "node_191",
      "target": "node_196",
      "type": "parent-child"
    },
    {
      "source": "node_191",
      "target": "node_197",
      "type": "parent-child"
    },
    {
      "source": "node_191",
      "target": "node_198",
      "type": "parent-child"
    },
    {
      "source": "node_198",
      "target": "node_199",
      "type": "parent-child"
    },
    {
      "source": "node_198",
      "target": "node_200",
      "type": "parent-child"
    },
    {
      "source": "node_198",
      "target": "node_201",
      "type": "parent-child"
    },
    {
      "source": "node_191",
      "target": "node_202",
      "type": "parent-child"
    },
    {
      "source": "node_191",
      "target": "node_203",
      "type": "parent-child"
    },
    {
      "source": "node_191",
      "target": "node_204",
      "type": "parent-child"
    },
    {
      "source": "node_204",
      "target": "node_205",
      "type": "parent-child"
    },
    {
      "source": "node_204",
      "target": "node_206",
      "type": "parent-child"
    },
    {
      "source": "node_191",
      "target": "node_207",
      "type": "parent-child"
    },
    {
      "source": "node_191",
      "target": "node_208",
      "type": "parent-child"
    },
    {
      "source": "node_191",
      "target": "node_209",
      "type": "parent-child"
    },
    {
      "source": "node_209",
      "target": "node_210",
      "type": "parent-child"
    },
    {
      "source": "node_209",
      "target": "node_211",
      "type": "parent-child"
    },
    {
      "source": "node_209",
      "target": "node_212",
      "type": "parent-child"
    },
    {
      "source": "node_191",
      "target": "node_213",
      "type": "parent-child"
    },
    {
      "source": "node_191",
      "target": "node_214",
      "type": "parent-child"
    },
    {
      "source": "node_191",
      "target": "node_215",
      "type": "parent-child"
    },
    {
      "source": "node_215",
      "target": "node_216",
      "type": "parent-child"
    },
    {
      "source": "node_215",
      "target": "node_217",
      "type": "parent-child"
    },
    {
      "source": "node_215",
      "target": "node_218",
      "type": "parent-child"
    },
    {
      "source": "node_191",
      "target": "node_219",
      "type": "parent-child"
    },
    {
      "source": "node_191",
      "target": "node_220",
      "type": "parent-child"
    },
    {
      "source": "node_191",
      "target": "node_221",
      "type": "parent-child"
    },
    {
      "source": "node_221",
      "target": "node_222",
      "type": "parent-child"
    },
    {
      "source": "node_221",
      "target": "node_223",
      "type": "parent-child"
    },
    {
      "source": "node_191",
      "target": "node_224",
      "type": "parent-child"
    },
    {
      "source": "node_191",
      "target": "node_225",
      "type": "parent-child"
    },
    {
      "source": "node_191",
      "target": "node_226",
      "type": "parent-child"
    },
    {
      "source": "node_226",
      "target": "node_227",
      "type": "parent-child"
    },
    {
      "source": "node_226",
      "target": "node_228",
      "type": "parent-child"
    },
    {
      "source": "node_226",
      "target": "node_229",
      "type": "parent-child"
    },
    {
      "source": "node_191",
      "target": "node_230",
      "type": "parent-child"
    },
    {
      "source": "node_191",
      "target": "node_231",
      "type": "parent-child"
    },
    {
      "source": "node_191",
      "target": "node_232",
      "type": "parent-child"
    },
    {
      "source": "node_232",
      "target": "node_233",
      "type": "parent-child"
    },
    {
      "source": "node_232",
      "target": "node_234",
      "type": "parent-child"
    },
    {
      "source": "node_232",
      "target": "node_235",
      "type": "parent-child"
    },
    {
      "source": "node_232",
      "target": "node_236",
      "type": "parent-child"
    },
    {
      "source": "node_232",
      "target": "node_237",
      "type": "parent-child"
    },
    {
      "source": "node_232",
      "target": "node_238",
      "type": "parent-child"
    },
    {
      "source": "node_191",
      "target": "node_239",
      "type": "parent-child"
    },
    {
      "source": "node_191",
      "target": "node_240",
      "type": "parent-child"
    },
    {
      "source": "node_191",
      "target": "node_241",
      "type": "parent-child"
    },
    {
      "source": "node_241",
      "target": "node_242",
      "type": "parent-child"
    },
    {
      "source": "node_241",
      "target": "node_243",
      "type": "parent-child"
    },
    {
      "source": "node_241",
      "target": "node_244",
      "type": "parent-child"
    },
    {
      "source": "node_241",
      "target": "node_245",
      "type": "parent-child"
    },
    {
      "source": "node_241",
      "target": "node_246",
      "type": "parent-child"
    },
    {
      "source": "node_241",
      "target": "node_247",
      "type": "parent-child"
    },
    {
      "source": "node_191",
      "target": "node_248",
      "type": "parent-child"
    },
    {
      "source": "node_191",
      "target": "node_249",
      "type": "parent-child"
    },
    {
      "source": "node_191",
      "target": "node_250",
      "type": "parent-child"
    },
    {
      "source": "node_250",
      "target": "node_251",
      "type": "parent-child"
    },
    {
      "source": "node_250",
      "target": "node_252",
      "type": "parent-child"
    },
    {
      "source": "node_250",
      "target": "node_253",
      "type": "parent-child"
    },
    {
      "source": "node_250",
      "target": "node_254",
      "type": "parent-child"
    },
    {
      "source": "node_250",
      "target": "node_255",
      "type": "parent-child"
    },
    {
      "source": "node_250",
      "target": "node_256",
      "type": "parent-child"
    },
    {
      "source": "node_250",
      "target": "node_257",
      "type": "parent-child"
    },
    {
      "source": "node_191",
      "target": "node_258",
      "type": "parent-child"
    },
    {
      "source": "node_258",
      "target": "node_259",
      "type": "parent-child"
    },
    {
      "source": "node_258",
      "target": "node_260",
      "type": "parent-child"
    },
    {
      "source": "node_258",
      "target": "node_261",
      "type": "parent-child"
    },
    {
      "source": "node_191",
      "target": "node_262",
      "type": "parent-child"
    },
    {
      "source": "node_262",
      "target": "node_263",
      "type": "parent-child"
    },
    {
      "source": "node_262",
      "target": "node_264",
      "type": "parent-child"
    },
    {
      "source": "node_262",
      "target": "node_265",
      "type": "parent-child"
    },
    {
      "source": "node_262",
      "target": "node_266",
      "type": "parent-child"
    },
    {
      "source": "node_271",
      "target": "node_272",
      "type": "parent-child"
    },
    {
      "source": "node_271",
      "target": "node_273",
      "type": "parent-child"
    },
    {
      "source": "node_271",
      "target": "node_274",
      "type": "parent-child"
    },
    {
      "source": "node_271",
      "target": "node_275",
      "type": "parent-child"
    },
    {
      "source": "node_277",
      "target": "node_278",
      "type": "parent-child"
    },
    {
      "source": "node_277",
      "target": "node_279",
      "type": "parent-child"
    },
    {
      "source": "node_287",
      "target": "node_288",
      "type": "parent-child"
    },
    {
      "source": "node_289",
      "target": "node_290",
      "type": "parent-child"
    },
    {
      "source": "node_290",
      "target": "node_291",
      "type": "parent-child"
    },
    {
      "source": "node_290",
      "target": "node_292",
      "type": "parent-child"
    },
    {
      "source": "node_290",
      "target": "node_293",
      "type": "parent-child"
    },
    {
      "source": "node_290",
      "target": "node_294",
      "type": "parent-child"
    },
    {
      "source": "node_0",
      "target": "sys_bootstrap",
      "type": "system-link"
    },
    {
      "source": "node_0",
      "target": "sys_regelwerk",
      "type": "system-link"
    },
    {
      "source": "node_0",
      "target": "sys_blaupause",
      "type": "system-link"
    },
    {
      "source": "node_0",
      "target": "sys_agents",
      "type": "system-link"
    },
    {
      "source": "sys_regelwerk",
      "target": "sys_bootstrap",
      "type": "system-link"
    },
    {
      "source": "sys_agents",
      "target": "agent_james",
      "type": "system-link"
    },
    {
      "source": "sys_agents",
      "target": "agent_pm",
      "type": "system-link"
    },
    {
      "source": "sys_agents",
      "target": "agent_architekt",
      "type": "system-link"
    },
    {
      "source": "sys_agents",
      "target": "agent_developer",
      "type": "system-link"
    },
    {
      "source": "sys_agents",
      "target": "agent_reviewer",
      "type": "system-link"
    },
    {
      "source": "sys_agents",
      "target": "agent_tester",
      "type": "system-link"
    },
    {
      "source": "sys_agents",
      "target": "agent_dokumentar",
      "type": "system-link"
    },
    {
      "source": "agent_james",
      "target": "agent_pm",
      "type": "guardian-link"
    },
    {
      "source": "agent_james",
      "target": "agent_architekt",
      "type": "guardian-link"
    },
    {
      "source": "agent_james",
      "target": "agent_developer",
      "type": "guardian-link"
    },
    {
      "source": "agent_james",
      "target": "agent_reviewer",
      "type": "guardian-link"
    },
    {
      "source": "agent_james",
      "target": "agent_tester",
      "type": "guardian-link"
    },
    {
      "source": "agent_james",
      "target": "agent_dokumentar",
      "type": "guardian-link"
    },
    {
      "source": "agent_pm",
      "target": "agent_architekt",
      "type": "ralph-loop"
    },
    {
      "source": "agent_architekt",
      "target": "agent_developer",
      "type": "ralph-loop"
    },
    {
      "source": "agent_developer",
      "target": "agent_reviewer",
      "type": "ralph-loop"
    },
    {
      "source": "agent_reviewer",
      "target": "agent_tester",
      "type": "ralph-loop"
    },
    {
      "source": "agent_tester",
      "target": "agent_dokumentar",
      "type": "ralph-loop"
    },
    {
      "source": "agent_dokumentar",
      "target": "agent_pm",
      "type": "ralph-loop"
    }
  ]
};
