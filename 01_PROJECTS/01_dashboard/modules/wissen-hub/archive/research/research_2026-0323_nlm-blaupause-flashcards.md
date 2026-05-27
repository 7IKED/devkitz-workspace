{
  "title": "Regelwerk Karten",
  "cards": [
    {
      "front": "Wie viele Dashboard-Module umfasst das DkZ-\u00d6kosystem in der Version v0.08?",
      "back": "88 Komponenten (74 Module + 14 Dashboards)."
    },
    {
      "front": "Welche Datei dient als Gesamt\u00fcbersicht der Architektur des DkZ Dashboards?",
      "back": "BLAUPAUSE.md"
    },
    {
      "front": "In welchem Format m\u00fcssen Ordnernamen laut der DkZ-Konvention benannt werden?",
      "back": "kebab-case (z. B. json-formatter)."
    },
    {
      "front": "Wie lautet der Standard-Dateiname f\u00fcr die Hauptdatei eines jeden Moduls?",
      "back": "index.html"
    },
    {
      "front": "Welche JavaScript-Funktion muss zwingend bei jedem User-Input vor dem Einf\u00fcgen in innerHTML genutzt werden?",
      "back": "esc()"
    },
    {
      "front": "Was ist die prim\u00e4re Akzentfarbe (Hex-Code) im DkZ Design System?",
      "back": "#fa1e4e"
    },
    {
      "front": "Welche Schriftart wird im DkZ-\u00d6kosystem prim\u00e4r f\u00fcr UI-Texte und Buttons verwendet?",
      "back": "Inter"
    },
    {
      "front": "Welche Schriftart wird im DkZ-\u00d6kosystem f\u00fcr Code, Daten und Zahlen verwendet?",
      "back": "JetBrains Mono"
    },
    {
      "front": "Nenne den Hex-Code f\u00fcr die Hintergrundfarbe (Background) einer DkZ-Card.",
      "back": "#1a1a1c"
    },
    {
      "front": "Welches CSS-Stilelement wird f\u00fcr den 'Glassmorphism'-Effekt im Header verwendet?",
      "back": "backdrop-filter: blur(24px)."
    },
    {
      "front": "Welche Technologie wird f\u00fcr das Frontend im DkZ CurrentVanilla Stack ausschlie\u00dflich verwendet?",
      "back": "Vanilla HTML5, CSS3 und JS (ES6+)."
    },
    {
      "front": "Warum wird im DkZ-Framework auf Frameworks wie Tailwind oder Bootstrap verzichtet?",
      "back": "Um eine 100%ige Vanilla-Abh\u00e4ngigkeitsfreiheit zu gew\u00e4hrleisten."
    },
    {
      "front": "Welche Technologie hat die h\u00f6chste Priorit\u00e4t (Prio 1) in der Datenbank-Hierarchie?",
      "back": "JSON (Single Source of Truth)."
    },
    {
      "front": "Wof\u00fcr wird 'Apache Iceberg' im Hybrid Backend prim\u00e4r eingesetzt?",
      "back": "Als Knowledge Lake und Katalog f\u00fcr Langzeitdaten."
    },
    {
      "front": "Welches System dient als Fallback f\u00fcr Go-Dateien im R23-Standard?",
      "back": "Python (.py)."
    },
    {
      "front": "Mit welchem Pr\u00e4fix m\u00fcssen localStorage-Keys laut Konvention starten?",
      "back": "dkz- (z. B. dkz-snippets)."
    },
    {
      "front": "Welches Shared Script ist f\u00fcr das Design System, CSS-Variablen und Blobs zust\u00e4ndig?",
      "back": "dkz-theme.css"
    },
    {
      "front": "Welches Shared Script verwaltet das Hamburger-Men\u00fc und den Review-Status?",
      "back": "dkz-navbar.js"
    },
    {
      "front": "Was ist die Kernaufgabe des Shared Scripts 'dkz-prompt-hub.js'?",
      "back": "Einheitliche Speicherung von Prompts mit Rolling Backups."
    },
    {
      "front": "Wie viele Prompt-Templates umfasst die Datei 'dkz-prompt-templates.js'?",
      "back": "344 Templates in 35 Kategorien."
    },
    {
      "front": "Welcher Statuswert (Review API) kennzeichnet ein vollst\u00e4ndig integriertes und getestetes Modul?",
      "back": "active (gr\u00fcn)."
    },
    {
      "front": "Was l\u00f6st die Regel 'R24 ALARM' im \u00d6kosystem aus?",
      "back": "Das Verschieben, Umbenennen oder L\u00f6schen von Dateien/Modulen ohne Genehmigung."
    },
    {
      "front": "In welcher Datei werden alle Module und deren Features zentral registriert?",
      "back": "REGISTRY.json"
    },
    {
      "front": "Was bedeutet das Akronym BMAD in der DkZ-Methodik?",
      "back": "Blueprint \u2192 Mapping \u2192 Analyse \u2192 Design."
    },
    {
      "front": "Welcher BMAD-Agent tr\u00e4gt die Rolle des 'Guardian' und \u00fcberwacht die Constitution?",
      "back": "James\u2122"
    },
    {
      "front": "Welche Aufgabe hat der BMAD-Agent 'DkZ Architekt\u2122'?",
      "back": "Erstellung des technischen Plans (plan.md) und Definition des Tech-Stacks."
    },
    {
      "front": "Wie viele Phasen hat der 'Ralph-Loop\u2122' zur Aufgabenbearbeitung?",
      "back": "6 Phasen (Lesen, Spawn, Execute, Verify, Commit, Loop)."
    },
    {
      "front": "Was ist der Zweck der 'Spawn'-Phase im Ralph-Loop\u2122?",
      "back": "Erstellung einer neuen Instanz mit frischem Kontext zur Vermeidung von Halluzinationen."
    },
    {
      "front": "In der VSM-Architektur entspricht welches System der operativen Ebene (Coding)?",
      "back": "System 1 (S1)."
    },
    {
      "front": "Welche Farbe signalisiert in der DkZ-Statusampel, dass kein KI-Token verf\u00fcgbar ist?",
      "back": "Gelb (\ud83d\udfe1)."
    },
    {
      "front": "Welches Dokument muss laut \u00a733 zwingend VOR dem Coden erstellt werden?",
      "back": "Implementierungsplan (impl-plan)."
    },
    {
      "front": "Welches Dokument dient als Nachweis der Ergebnisse NACH dem Coden?",
      "back": "Walkthrough (\ud83d\udcd6)."
    },
    {
      "front": "Wo werden alle Artefakte aus allen Sessions zentral und dauerhaft archiviert?",
      "back": "Im Research Archive (modules/research-archive/)."
    },
    {
      "front": "Welche Datenbank fungiert als 'Immutable Knowledge Database' im R26-Standard?",
      "back": "WissenHub."
    },
    {
      "front": "Was versteht man unter der 'Dreifach-Verankerung' eines Artefakts?",
      "back": "Speicherung in Iceberg (Daten), Hub (UI) und Copilot (Kontext)."
    },
    {
      "front": "Wie viele Datenquellen aggregiert der 'Wiki Hub\u2122'?",
      "back": "9 Datenquellen."
    },
    {
      "front": "Welche 3 Oberkategorien definiert die 'ECOSYSTEM_MAP.json'?",
      "back": "INTERN, SYSTEM und USER."
    },
    {
      "front": "Welcher Pfad ist f\u00fcr den finalen Content-Output (Musik, Video, Code) vorgesehen?",
      "back": "03_MEDIA/OUT_NOW/"
    },
    {
      "front": "Mit welchem CLI-Befehl \u00f6ffnet man den Wiki Hub?",
      "back": "dkz wiki"
    },
    {
      "front": "Welcher CLI-Befehl f\u00fchrt ein 'git add -A' und 'commit' gleichzeitig aus?",
      "back": "dkz commit 'nachricht'"
    },
    {
      "front": "In der Puter Cloud Integration: Welche Funktion speichert Daten im Cloud-localStorage?",
      "back": "DkzPuter.kvSet(key, val)"
    },
    {
      "front": "Welche technische Ausnahme gilt f\u00fcr die DkZ Hub Chrome Extension bez\u00fcglich Frameworks?",
      "back": "Sie darf React 18 und Tailwind 3 nutzen (Ausnahme R0)."
    },
    {
      "front": "Wie viele Module/Tabs bietet die DkZ Hub Chrome Extension?",
      "back": "8 Module."
    },
    {
      "front": "Was passiert laut Regel R100 mit der Datei 'dkz-prompt-templates.js'?",
      "back": "Sie darf niemals gel\u00f6scht werden (UNDELETABLE)."
    },
    {
      "front": "Ab welchem Alter gilt ein Dokument im WissenHub als 'veraltet' (\ud83d\udd34)?",
      "back": "Nach mehr als 30 Tagen."
    },
    {
      "front": "Welche Methode der Notes API f\u00fcgt eine vom System rot markierte Notiz hinzu?",
      "back": "DkzNotes.add(id, text, 'system')"
    },
    {
      "front": "Welches Modul erm\u00f6glicht die Visualisierung von n8n-Workflows mittels Drawflow?",
      "back": "n8n-viewer (MOD-083)."
    },
    {
      "front": "Was ist das Kernprinzip des Wiki Hubs bez\u00fcglich Daten\u00e4nderungen?",
      "back": "Immutable \u2013 Kein L\u00f6schen, nur Archivieren."
    },
    {
      "front": "Welche SSH-Konfiguration wird f\u00fcr den Hostinger KVM 8 Server genutzt?",
      "back": "~/.ssh/dkz_hostinger"
    },
    {
      "front": "Welcher Tag kennzeichnet im Prompt-Hub einen Prompt, der aus dem Archiv stammt?",
      "back": "arc"
    },
    {
      "front": "Was besagt die Regel R28 bez\u00fcglich alter Git-Repositories?",
      "back": "Sie m\u00fcssen identifiziert, gepr\u00fcft und ihr Wissen reaktiviert werden."
    },
    {
      "front": "Welches Design-Element dient im DkZ Theme zur Schaffung von Atmosph\u00e4re im Hintergrund?",
      "back": "Background Blobs (farbige Kreise mit starkem Blur)."
    },
    {
      "front": "Welche Technologie wird f\u00fcr Echtzeit-Kollaboration im Hybrid Backend genutzt?",
      "back": "Node.js WebSockets."
    },
    {
      "front": "Wie wird der Offline-Modus bei Puter Cloud Integration \u00fcberbr\u00fcckt?",
      "back": "Durch einen Fallback auf den lokalen localStorage."
    },
    {
      "front": "Welcher BMAD-Agent ist f\u00fcr Akzeptanzkriterien und User Stories verantwortlich?",
      "back": "DkZ PM\u2122 (Product Manager)."
    },
    {
      "front": "Welcher Schritt folgt im Ralph-Loop\u2122 unmittelbar auf 'Execute'?",
      "back": "Verify (Pr\u00fcfung durch Tester/Reviewer)."
    },
    {
      "front": "Welches Metadaten-Feld ist laut \u00a729 in jedem Artefakt zwingend erforderlich?",
      "back": "Timestamp (Datum/Uhrzeit)."
    },
    {
      "front": "Was ist das Ziel des 'Blitz Mode' im GitHub Hub?",
      "back": "Automatischer Check aller Systeme alle 20 Sekunden."
    },
    {
      "front": "Nenne eine Einschr\u00e4nkung der Puter Cloud API im Vergleich zu Node.js.",
      "back": "Kein Backend-Code (Node.js) in der Cloud ausf\u00fchrbar; nur statisches Frontend."
    },
    {
      "front": "Welche Dateiendung wird f\u00fcr Ordner-Informationen (ORDNER.ini) verwendet?",
      "back": ".ini (Kein Markdown erlaubt)."
    },
    {
      "front": "Welche CSS-Variable definiert im DkZ-System den Erfolg oder aktive Elemente?",
      "back": "--green (#00ff88)."
    },
    {
      "front": "Welches Shared Script erm\u00f6glicht den Zugriff auf KI-Copiloten verschiedener Provider?",
      "back": "dkz-copilot.js"
    },
    {
      "front": "Was versteht man unter 'JSON AST' im Kontext des Speichers?",
      "back": "Abstract Syntax Tree als Single Source of Truth f\u00fcr Daten."
    },
    {
      "front": "Welche Kategorie von Modulen umfasst Werkzeuge wie 'json-formatter' und 'regex-tester'?",
      "back": "Developer Tools."
    },
    {
      "front": "In welchem Verzeichnis liegen die BMAD-Agent-Templates?",
      "back": "[WORKSPACE]/github-hub/templates/"
    },
    {
      "front": "Welches Tool wird f\u00fcr DuckDB Analytics im DataLakeHouse\u2122 genutzt?",
      "back": "Apache Iceberg."
    },
    {
      "front": "Welche Git-Commit-Nachricht ist f\u00fcr die \u00c4nderung eines Moduls vorgeschrieben?",
      "back": "feat: Modul-Name \u2014 Beschreibung der \u00c4nderung."
    },
    {
      "front": "Welcher API-Befehl im Shared Script l\u00e4dt Daten aus dem Puter KV-Speicher?",
      "back": "DkzPuter.kvGet(key)"
    },
    {
      "front": "Welche Navigations-Komponente ist in 86+ Dateien des \u00d6kosystems eingebunden?",
      "back": "dkz-navbar.js (Hamburger-Men\u00fc)."
    },
    {
      "front": "Was bewirkt die Funktion 'DkzPuter.syncToCloud()'?",
      "back": "Synchronisation des lokalen localStorage in den Puter KV-Speicher."
    },
    {
      "front": "Welche 5 Gruppen umfasst das Slide-In Panel der Navigationsleiste?",
      "back": "Wissen & Daten, Prompts & Archive, Builder Chain, Design & Content, System & Tools."
    },
    {
      "front": "Welche Farbe haben System-Notizen in der Benutzeroberfl\u00e4che?",
      "back": "Rot."
    },
    {
      "front": "In welchem Modus werden Shared Scripts geladen, wenn sie nicht lokal vorhanden sind?",
      "back": "Portable Modus (dynamisches Laden)."
    },
    {
      "front": "Welcher Dienst wird f\u00fcr die Cloud-Synchronisation der Chrome Extension genutzt?",
      "back": "Google Apps Script (via API Key)."
    },
    {
      "front": "Was ist das Kerngebot bei Session-Start laut \u00a721?",
      "back": "Startup-Workflow ausf\u00fchren und Playbook, REGELWERK sowie BLAUPAUSE lesen."
    }
  ]
}