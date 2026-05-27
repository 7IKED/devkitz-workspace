/**
 * DkZ Prompt Templates — 400 UNDELETABLE Templates
 * @DKZ:RULES → R100 (No Deletion), R12 (No Data Loss)
 * @version v0.01 — 344 Templates in 17 Kategorien
 * 
 * WARNUNG: Diese Datei darf NICHT gelöscht oder gekürzt werden.
 * Sie enthält die komplette Template-Galerie des DkZ Prompt Systems.
 * Änderungen nur durch HINZUFÜGEN neuer Templates erlaubt.
 */

const DKZ_PROMPT_TEMPLATES = [
  {
    id: 'html', icon: '&#128196;', name: 'HTML Struktur',
    modules: [
      { id: 'h1', icon: '&#128196;', name: 'Boilerplate', desc: 'HTML5 Grundstruktur mit SEO', prompt: 'Erstelle eine vollständige HTML5-Grundstruktur mit semantischen Tags (header, main, footer, nav, section, article), Meta-Description, OpenGraph-Tags, Twitter Cards, responsive Viewport, Charset UTF-8, und Favicon-Link. Verwende das DkZ Dark-Theme Design-System.' },
      { id: 'h2', icon: '&#128196;', name: 'Navigation', desc: 'Responsive Navbar', prompt: 'Baue eine responsive Navigation mit Logo (SVG/Text), horizontalen Links, Mobile-Hamburger-Menu mit Slide-In Animation, Sticky-Header mit Blur-Backdrop, aktiver Link-Markierung und Keyboard-Navigation (Tab, Enter, Escape).' },
      { id: 'h3', icon: '&#128196;', name: 'Formulare', desc: 'Validierte Inputs', prompt: 'Erstelle ein mehrstufiges Formular mit Real-Time-Validierung, Error-Messages unter jedem Feld, verschiedenen Input-Typen (text, email, password, select, checkbox, radio, textarea), Submit-Handling mit Loading-State und Erfolgs-Toast.' },
      { id: 'h4', icon: '&#128196;', name: 'Card-Layout', desc: 'Responsive Grid', prompt: 'Baue ein responsives Card-Grid (CSS Grid, auto-fill, minmax) mit Bild, Titel, Beschreibung, Tags, Hover-Effekten (translateY, shadow), Skeleton-Loading und Lazy-Load für Bilder.' },
      { id: 'h5', icon: '&#128196;', name: 'Modal-System', desc: 'Overlay-Dialoge', prompt: 'Erstelle ein wiederverwendbares Modal-System mit Overlay (Glassmorphism-Blur), Ein-/Ausblend-Animation (scale+opacity), Close-Button, Keyboard-Support (Escape), Click-Outside-Close und aria-Attribute für Accessibility.' },
      { id: 'h6', icon: '&#128196;', name: 'Datentabelle', desc: 'Sortierbar & Filterbar', prompt: 'Baue eine interaktive Datentabelle mit Spalten-Sortierung (ASC/DESC), Suchfeld-Filter, Pagination (10/25/50 pro Seite), Row-Selection, CSV-Export und Responsive-Collapse auf Mobile.' },
      { id: 'h7', icon: '&#128196;', name: 'Tabs & Panels', desc: 'Tab-Navigation', prompt: 'Erstelle ein Tab-System mit horizontalen Tabs, Content-Panels mit Fade-Animation, URL-Hash-basierter Tab-Auswahl, Keyboard-Navigation (Pfeiltasten) und ARIA-Rollen (tablist, tab, tabpanel).' },
      { id: 'h8', icon: '&#128196;', name: 'Accordion', desc: 'Collapsible-Sektionen', prompt: 'Baue ein Accordion mit animiertem Öffnen/Schließen (max-height transition), Chevron-Rotation, nur-eine-offen-Option, Smooth-Scroll zum geöffneten Panel und ARIA-Attribute.' },
      { id: 'h9', icon: '&#128196;', name: 'Footer', desc: 'Multi-Column Footer', prompt: 'Erstelle einen mehrspaltige Footer mit Logo, Link-Sektionen (Produkt, Ressourcen, Legal), Social-Media-Icons, Newsletter-Formular, Copyright und responsive Collapse auf Mobile.' },
      { id: 'h10', icon: '&#128196;', name: 'Hero-Section', desc: 'Landing Page Hero', prompt: 'Baue eine Hero-Section mit animiertem Hintergrund-Gradient, Headline mit Gradient-Text, Subheadline, CTA-Button (Glow-Effect), und optionalem Video/Bild-Hintergrund.' },
      { id: 'h11', icon: '&#128196;', name: 'Sidebar', desc: 'Responsive Sidebar', prompt: 'Erstelle eine responsive Sidebar mit Toggle-Button, Slide-In Animation, Verschachtelten Menü-Items, Active-State-Markierung und Auto-Collapse auf Mobile.' },
      { id: 'h12', icon: '&#128196;', name: 'Breadcrumb', desc: 'Navigation-Trail', prompt: 'Baue eine Breadcrumb-Navigation mit Schema.org Markup, Pfeil-Separatoren, aktuellem Seiten-Highlight, Responsive-Truncation und Keyboard-Navigation.' },
      { id: 'h13', icon: '&#128196;', name: 'Toast-System', desc: 'Benachrichtigungen', prompt: 'Erstelle ein Toast/Notification-System mit 4 Typen (success/error/warning/info), Auto-Dismiss nach 5s, Slide-In Animation, Close-Button, Stack-Queue und API: showToast(msg, type).' },
      { id: 'h14', icon: '&#128196;', name: 'Skeleton-Loading', desc: 'Platzhalter-UI', prompt: 'Baue Skeleton-Loading-Komponenten (Pulse-Animation) für Cards, Listen, Tabellen und Text-Blöcke. Smooth-Übergang zu echtem Content nach Laden.' },
      { id: 'h15', icon: '&#128196;', name: 'Scroll-Effekte', desc: 'Parallax & Reveal', prompt: 'Erstelle Scroll-basierte Effekte: Parallax-Hintergrund, Reveal-on-Scroll (IntersectionObserver), Progress-Bar im Header, Smooth-Scroll zu Ankern und Back-to-Top Button.' },
      { id: 'h16', icon: '&#128196;', name: 'Print-Layout', desc: 'Druck-optimiert', prompt: 'Baue ein Print-CSS mit sauberer Typografie, versteckter Navigation, Seitenumbruch-Kontrolle, QR-Code für URL und Monochrome-Farbschema.' },
    ]
  },
  {
    id: 'css', icon: '&#127912;', name: 'CSS & Styling',
    modules: [
      { id: 'c1', icon: '&#127912;', name: 'Dark Theme', desc: 'Dunkles Farbschema', prompt: 'Erstelle ein vollständiges Dark-Theme mit CSS Custom Properties: --bg (#0e0e10), --card (#1a1a1c), --text (#f6f6f7), --accent (#fa1e4e), --green (#00ff88), --muted (#a1a1aa). Alle Hover-, Focus- und Active-States definiert.' },
      { id: 'c2', icon: '&#127912;', name: 'Glassmorphism', desc: 'Glas-Effekte', prompt: 'Implementiere Glassmorphism-Effekte mit backdrop-filter: blur(), semi-transparente Backgrounds, subtile Borders, Glow-Shadows und Layer-Hierarchie für Modals, Cards und Overlays.' },
      { id: 'c3', icon: '&#127912;', name: 'CSS Grid System', desc: '12-Column Grid', prompt: 'Baue ein 12-Column Grid-System mit CSS Grid, Gap-Utilities, Responsive Breakpoints (sm/md/lg/xl), Column-Span-Klassen und Auto-Fill/Auto-Fit für Karten-Layouts.' },
      { id: 'c4', icon: '&#127912;', name: 'Animationen', desc: 'Micro-Interactions', prompt: 'Erstelle eine Sammlung von Micro-Animations: Button-Hover (scale+glow), Card-Hover (translateY+shadow), Loading-Spinner, Pulse-Dot, Fade-In, Slide-Up, Text-Gradient-Shift und Skeleton-Shimmer.' },
      { id: 'c5', icon: '&#127912;', name: 'Typografie', desc: 'Font-System', prompt: 'Definiere ein Typografie-System mit Inter (Body) und JetBrains Mono (Code), Heading-Hierarchie (h1-h6 mit Größen/Gewichten), Line-Heights, Letter-Spacing und Responsive Font-Sizes (clamp()).' },
      { id: 'c6', icon: '&#127912;', name: 'Buttons', desc: 'Button-Variants', prompt: 'Erstelle Button-Varianten: Primary (Accent), Secondary (Border), Ghost (Transparent), Danger (Rot), Disabled, Loading (Spinner), Icon-Button und Button-Group. Alle mit Hover/Active/Focus States.' },
      { id: 'c7', icon: '&#127912;', name: 'Farbpalette', desc: 'Color-System', prompt: 'Generiere ein harmonisches Farbsystem mit Primary, Secondary, Success, Warning, Danger, Info plus Abstufungen (50-900). HSL-basiert mit CSS Custom Properties und Dark/Light Mode Support.' },
      { id: 'c8', icon: '&#127912;', name: 'Responsive Design', desc: 'Mobile-First', prompt: 'Implementiere Mobile-First Responsive Design mit Breakpoints (480/768/1024/1280px), Touch-Targets (min 44px), Stack-to-Grid Layouts, Responsive Typography und Container-Queries.' },
      { id: 'c9', icon: '&#127912;', name: 'Scrollbar-Styling', desc: 'Custom Scrollbars', prompt: 'Style Custom-Scrollbars für Webkit und Firefox: dünne Tracks, abgerundete Thumbs, Hover-Highlight, Auto-Hide und konsistentes Aussehen über alle Browser.' },
      { id: 'c10', icon: '&#127912;', name: 'Gradients', desc: 'Smooth Verläufe', prompt: 'Erstelle eine Gradient-Bibliothek: Linear (Accent-Purple, Blue-Green), Radial (Glow-Effects), Conic (Progress-Rings), Animierte Gradients und Text-Gradients.' },
      { id: 'c11', icon: '&#127912;', name: 'Spacing-System', desc: 'Margin & Padding', prompt: 'Definiere ein konsistentes Spacing-System mit CSS Custom Properties: --space-xs (4px) bis --space-xxl (64px). Utility-Klassen für margin/padding in allen Richtungen.' },
      { id: 'c12', icon: '&#127912;', name: 'Shadow-System', desc: 'Elevation Levels', prompt: 'Erstelle ein Shadow-System mit 5 Elevation-Stufen (flat, raised, floating, overlay, modal). Farbige Glow-Shadows für Accent, Success, Danger und interaktive Elemente.' },
      { id: 'c13', icon: '&#127912;', name: 'Icon-System', desc: 'SVG/Emoji Icons', prompt: 'Baue ein Icon-System mit SVG-Sprites oder Emoji-Icons, einheitlicher Größe (16/20/24/32px), Farb-Vererbung via currentColor und Icon-Button-Komponenten.' },
      { id: 'c14', icon: '&#127912;', name: 'CSS Variablen', desc: 'Design Tokens', prompt: 'Erstelle ein vollständiges Design-Token System mit CSS Custom Properties: Farben, Typografie, Spacing, Radii, Shadows, Transitions, Z-Index-Skala und Breakpoints.' },
      { id: 'c15', icon: '&#127912;', name: 'Transitions', desc: 'Smooth Übergänge', prompt: 'Definiere Transition-Presets: ease-in-out (default), spring (cubic-bezier), bounce, elastic. Duration-Skala: fast (150ms), normal (250ms), slow (500ms). Für hover, focus, open/close.' },
      { id: 'c16', icon: '&#127912;', name: 'Form-Styling', desc: 'Input-Design', prompt: 'Style Form-Elemente: Text-Inputs (dark bg, border-glow on focus), Select (custom arrow), Checkbox/Radio (accent-colored), Range-Slider, File-Upload und Toggle-Switch.' },
    ]
  },
  {
    id: 'js', icon: '&#128187;', name: 'JavaScript',
    modules: [
      { id: 'j1', icon: '&#128187;', name: 'Event-System', desc: 'Custom Events', prompt: 'Implementiere ein Event-Bus System mit subscribe/publish/unsubscribe Pattern, Event-History für Debugging, Wildcard-Listener und automatischer Memory-Cleanup.' },
      { id: 'j2', icon: '&#128187;', name: 'State Management', desc: 'Reactive Store', prompt: 'Baue einen reaktiven State-Store mit Proxy-basiertem Change-Detection, Subscriber-Pattern, Undo/Redo-History und localStorage-Persistenz.' },
      { id: 'j3', icon: '&#128187;', name: 'Fetch-Wrapper', desc: 'API-Client', prompt: 'Erstelle einen Fetch-Wrapper mit automatischem JSON-Parsing, Error-Handling, Retry-Logic (3 Versuche), Timeout, Request-Interceptors und Response-Caching.' },
      { id: 'j4', icon: '&#128187;', name: 'Router', desc: 'SPA-Navigation', prompt: 'Baue einen Client-Side Router mit Hash-basierter Navigation, Route-Parameter, Middleware-Support, 404-Handling, Transition-Animationen und Browser-History.' },
      { id: 'j5', icon: '&#128187;', name: 'Drag & Drop', desc: 'Sortierbare Listen', prompt: 'Implementiere Drag-and-Drop mit nativen HTML5 Events, Sortierbare Listen, Kanban-Board, Ghost-Element, Drop-Zones mit Highlight und Touch-Support.' },
      { id: 'j6', icon: '&#128187;', name: 'LocalStorage', desc: 'Persistenz-Layer', prompt: 'Erstelle einen LocalStorage-Wrapper mit JSON-Serialisierung, Expiry-Dates, Namespace-Prefixing (dkz-), Auto-Backup und Migration-Support für Schema-Änderungen.' },
      { id: 'j7', icon: '&#128187;', name: 'Debounce/Throttle', desc: 'Performance', prompt: 'Implementiere Debounce und Throttle Utility-Funktionen für Scroll-Handler, Resize-Events, Search-Input und API-Calls. Mit Cancel-Funktion und Immediate-Option.' },
      { id: 'j8', icon: '&#128187;', name: 'Clipboard API', desc: 'Copy/Paste', prompt: 'Baue Clipboard-Utilities: Copy-to-Clipboard (mit Fallback für ältere Browser), Paste-Handler, Rich-Text-Copy und Toast-Feedback nach Copy-Aktion.' },
      { id: 'j9', icon: '&#128187;', name: 'Date/Time', desc: 'Datum-Formatierung', prompt: 'Erstelle Date-Utilities: Relative Zeitangaben (\'vor 5 Min\'), deutsches Format (DD.MM.YYYY), ISO-Parsing, Zeitstempel-Vergleich und Timer/Countdown-Funktion.' },
      { id: 'j10', icon: '&#128187;', name: 'Validation', desc: 'Input-Prüfung', prompt: 'Baue ein Validation-Framework: E-Mail, URL, Telefon, Passwort-Stärke, Custom-Regeln, Echtzeit-Feedback, Error-Message-Templates und Formular-Level-Validation.' },
      { id: 'j11', icon: '&#128187;', name: 'Animation API', desc: 'Web Animations', prompt: 'Nutze die Web Animations API für: Keyframe-Animationen, Stagger-Effekte, Sequentielle Animationen, Pause/Resume, und integration mit IntersectionObserver für Scroll-Trigger.' },
      { id: 'j12', icon: '&#128187;', name: 'Web Workers', desc: 'Background Tasks', prompt: 'Implementiere Web Workers für CPU-intensive Aufgaben: Daten-Parsing, Bild-Filterung, Such-Indizierung. Mit Transferable Objects und SharedArrayBuffer.' },
      { id: 'j13', icon: '&#128187;', name: 'Service Worker', desc: 'Offline-Support', prompt: 'Erstelle einen Service Worker mit Cache-First-Strategie, Offline-Fallback-Page, Background-Sync, Push-Notifications und App-Update-Prompt.' },
      { id: 'j14', icon: '&#128187;', name: 'Keyboard Shortcuts', desc: 'Hotkeys', prompt: 'Baue ein Keyboard-Shortcut-System mit Mod-Keys (Ctrl+S, Cmd+K), Shortcut-Overlay (? zum Anzeigen), Konfigurierbaren Bindings und Context-abhängigen Aktionen.' },
      { id: 'j15', icon: '&#128187;', name: 'Intersection Observer', desc: 'Scroll-Detection', prompt: 'Implementiere IntersectionObserver für Lazy-Loading von Bildern, Infinite-Scroll, Scroll-Spy für Navigation, Fade-In-Animationen und Sticky-Detection.' },
      { id: 'j16', icon: '&#128187;', name: 'Canvas API', desc: '2D-Zeichnen', prompt: 'Erstelle Canvas-basierte Komponenten: Waveform-Visualisierung, Chart-Rendering, Konfetti-Animation, Partikel-System und Screenshot-Capture.' },
    ]
  },
  {
    id: 'ai', icon: '&#129302;', name: 'KI & Prompts',
    modules: [
      { id: 'a1', icon: '&#129302;', name: 'System-Prompt', desc: 'KI-Persönlichkeit', prompt: 'Erstelle einen detaillierten System-Prompt der die KI als DkZ-Experten definiert: Rolle, Tonfall (professionell, deutsch), Fachgebiete, Einschränkungen, Output-Format und Verhaltensregeln.' },
      { id: 'a2', icon: '&#129302;', name: 'Chain-of-Thought', desc: 'Schritt-für-Schritt', prompt: 'Baue eine Chain-of-Thought Prompt-Vorlage die die KI zwingt: 1) Problem analysieren, 2) Ansätze auflisten, 3) Besten wählen mit Begründung, 4) Lösung implementieren, 5) Ergebnis verifizieren.' },
      { id: 'a3', icon: '&#129302;', name: 'Few-Shot Learning', desc: 'Beispiel-basiert', prompt: 'Erstelle eine Few-Shot-Vorlage mit 3-5 Input/Output-Beispielen, klarer Format-Spezifikation, Edge-Case-Behandlung und Konsistenz-Anweisungen.' },
      { id: 'a4', icon: '&#129302;', name: 'RAG-Prompt', desc: 'Quellen-gestützt', prompt: 'Baue einen RAG-Prompt der: Kontext-Dokumente einbindet, Quellen-Referenzierung erzwingt, Halluzinationen verhindert, Unsicherheit kommuniziert und Antwort-Qualität sicherstellt.' },
      { id: 'a5', icon: '&#129302;', name: 'Code-Review', desc: 'Code analysieren', prompt: 'Erstelle einen Code-Review-Prompt: Sicherheitslücken finden, Performance-Probleme identifizieren, Clean-Code-Verbesserungen vorschlagen, Kompatibilität prüfen und Testbarkeit bewerten.' },
      { id: 'a6', icon: '&#129302;', name: 'Agent-System', desc: 'Autonomer Agent', prompt: 'Baue einen Agent-System-Prompt mit: Tool-Definitionen (Funktions-Beschreibungen), Entscheidungs-Logik, Fehler-Recovery, Fortschritts-Tracking und Human-in-the-Loop Checkpoints.' },
      { id: 'a7', icon: '&#129302;', name: 'Multi-Turn', desc: 'Gesprächs-Kontext', prompt: 'Erstelle eine Multi-Turn Konversations-Vorlage mit: Kontext-Zusammenfassung, Referenz auf vorherige Antworten, Themen-Tracking, Klärungsfragen und Gesprächs-Abschluss.' },
      { id: 'a8', icon: '&#129302;', name: 'Output-Parser', desc: 'Strukturierte Ausgabe', prompt: 'Baue einen Output-Parser-Prompt der JSON/XML/YAML-formatierte Antworten erzwingt mit: Schema-Definition, Validierungs-Regeln, Default-Werte und Error-Fallback.' },
      { id: 'a9', icon: '&#129302;', name: 'Evaluator', desc: 'Qualitäts-Bewertung', prompt: 'Erstelle einen Evaluator-Prompt der KI-Antworten bewertet: Accuracy (0-10), Relevanz, Vollständigkeit, Format-Treue und Verbesserungs-Vorschläge.' },
      { id: 'a10', icon: '&#129302;', name: 'Translator', desc: 'Mehrsprachig', prompt: 'Baue einen Übersetzungs-Prompt mit: Quell-/Zielsprache, Tonfall-Beibehaltung, Fachbegriff-Glossar, Kultur-Anpassung und Format-Erhaltung.' },
      { id: 'a11', icon: '&#129302;', name: 'Data-Extractor', desc: 'Daten extrahieren', prompt: 'Erstelle einen Data-Extraction-Prompt der strukturierte Daten aus unstrukturiertem Text extrahiert: Named Entities, Beziehungen, Kategorien, Daten/Zahlen und Zusammenfassungen.' },
      { id: 'a12', icon: '&#129302;', name: 'Creative Writer', desc: 'Kreatives Schreiben', prompt: 'Baue einen Creative-Writing-Prompt mit: Genre-Spezifikation, Stilistik-Vorgaben, Charakter-Profile, Handlungs-Outline und Tonfall-Anweisungen.' },
      { id: 'a13', icon: '&#129302;', name: 'Debugger', desc: 'Fehler finden', prompt: 'Erstelle einen Debug-Prompt der: Stack-Traces analysiert, Root-Cause identifiziert, Fix-Vorschläge macht, Regressions-Risiken bewertet und Testfälle generiert.' },
      { id: 'a14', icon: '&#129302;', name: 'Zusammenfasser', desc: 'Text kürzen', prompt: 'Baue einen Summarization-Prompt mit: Ziel-Länge, Key-Points-Extraktion, Bullet-Points vs Fließtext, Abstraktions-Level und Quellen-Zuordnung.' },
      { id: 'a15', icon: '&#129302;', name: 'Instructor', desc: 'Lerninhalte', prompt: 'Erstelle einen Instructor-Prompt der Lerninhalte aufbereitet: Schwierigkeitsgrad, Lernziele, Schritt-für-Schritt Erklärungen, Praxis-Beispiele und Quiz-Fragen.' },
      { id: 'a16', icon: '&#129302;', name: 'Persona', desc: 'Rollen-Simulation', prompt: 'Baue einen Persona-Prompt der eine spezifische Rolle simuliert: Beruf, Expertise-Level, Kommunikationsstil, typische Denkweisen und Fach-Jargon.' },
    ]
  },
  {
    id: 'seo', icon: '&#128269;', name: 'SEO & Marketing',
    modules: [
      { id: 's1', icon: '&#128269;', name: 'Meta-Tags', desc: 'SEO Grundlagen', prompt: 'Generiere optimierte Meta-Tags: Title (50-60 Chars), Description (150-160 Chars), Keywords, Canonical-URL, Robots-Directives und hreflang für Mehrsprachigkeit.' },
      { id: 's2', icon: '&#128269;', name: 'Schema.org', desc: 'Structured Data', prompt: 'Erstelle Schema.org JSON-LD Markup für: Organization, Product, Article, BreadcrumbList, FAQ, HowTo und LocalBusiness mit allen Pflichtfeldern.' },
      { id: 's3', icon: '&#128269;', name: 'Social Cards', desc: 'OG & Twitter', prompt: 'Baue Social-Media-Cards: OpenGraph (og:title, image, description), Twitter Cards (summary_large_image), Pinterest Rich Pins und LinkedIn Article-Posts.' },
      { id: 's4', icon: '&#128269;', name: 'Keyword Research', desc: 'SEO Analyse', prompt: 'Erstelle eine Keyword-Research-Vorlage: Seeds → LSI-Keywords, Suchvolumen-Schätzung, Schwierigkeits-Bewertung, SERP-Intent-Analyse und Content-Gap-Identifikation.' },
      { id: 's5', icon: '&#128269;', name: 'Content Brief', desc: 'Artikel-Planung', prompt: 'Baue ein Content-Brief-Template: Zielgruppe, Keyword-Cluster, H1/H2-Outline, Word-Count-Ziel, interne Links, CTAs und Content-Typ (How-To, Listicle, Guide).' },
      { id: 's6', icon: '&#128269;', name: 'Email-Marketing', desc: 'Newsletter', prompt: 'Erstelle Email-Templates: Subject-Lines (A/B-Test-Varianten), Pre-Header, Body-Struktur, CTA-Buttons, Footer mit Abmelde-Link und Personalisierungs-Platzhalter.' },
      { id: 's7', icon: '&#128269;', name: 'Ad Copy', desc: 'Werbetexte', prompt: 'Baue Werbetext-Vorlagen: Google Ads (Headlines+Descriptions), Facebook Ads, Instagram Stories, LinkedIn Sponsored und YouTube Pre-Roll mit CTA-Optimierung.' },
      { id: 's8', icon: '&#128269;', name: 'Landing Page', desc: 'Conversion-Seite', prompt: 'Erstelle eine Landing-Page-Vorlage: Hero mit Value-Prop, Social-Proof, Feature-Benefits, Testimonials, FAQ, CTA-Wiederholung und Trust-Badges.' },
      { id: 's9', icon: '&#128269;', name: 'Blog-Post', desc: 'Artikel-Struktur', prompt: 'Baue eine Blog-Post-Vorlage: Attention-Grabbing-Intro, Problem-Agitation-Solution, H2/H3-Hierarchie, interne Links, Bild-Alt-Texte und FAQ-Schema am Ende.' },
      { id: 's10', icon: '&#128269;', name: 'Product Description', desc: 'Produkttexte', prompt: 'Erstelle Produkttext-Vorlagen: Features→Benefits, emotionale Trigger, technische Spezifikationen, Vergleichstabelle und Kundenbewertungs-Highlights.' },
      { id: 's11', icon: '&#128269;', name: 'Social Media', desc: 'Post-Vorlagen', prompt: 'Baue Social-Media-Post-Templates: LinkedIn (Professional), Twitter/X (Concise), Instagram (Visual+Caption), TikTok-Script und Facebook-Announcement.' },
      { id: 's12', icon: '&#128269;', name: 'Pitch Deck', desc: 'Präsentation', prompt: 'Erstelle ein Pitch-Deck-Outline: Problem, Solution, Market-Size, Business-Model, Traction, Team, Ask. Mit Storytelling-Tipps und Design-Guidelines.' },
    ]
  },
  {
    id: 'data', icon: '&#128202;', name: 'Daten & Analyse',
    modules: [
      { id: 'd1', icon: '&#128202;', name: 'Dashboard', desc: 'Daten-Visualisierung', prompt: 'Erstelle ein Analytics-Dashboard mit KPI-Karten, Line-Charts, Bar-Charts, Pie-Charts, Datentabelle und Filter-System. Responsive Grid-Layout mit DkZ Design.' },
      { id: 'd2', icon: '&#128202;', name: 'CSV-Parser', desc: 'Daten-Import', prompt: 'Baue einen CSV-Parser mit: File-Upload, Header-Detection, Datentyp-Erkennung, Preview-Tabelle, Column-Mapping, Fehler-Handling und JSON-Konvertierung.' },
      { id: 'd3', icon: '&#128202;', name: 'JSON-Viewer', desc: 'Strukturierte Daten', prompt: 'Erstelle einen interaktiven JSON-Viewer mit: Syntax-Highlighting, Collapsible-Nodes, Suche, Copy-Path, Edit-Inline und Schema-Validierung.' },
      { id: 'd4', icon: '&#128202;', name: 'Chart-System', desc: 'Diagramme', prompt: 'Baue ein Chart-System (Canvas-basiert): Line, Bar, Pie, Doughnut, Area, Scatter. Mit Tooltip, Legend, Responsive-Resize, Animationen und Data-Labels.' },
      { id: 'd5', icon: '&#128202;', name: 'KPI-Tracker', desc: 'Metriken', prompt: 'Erstelle ein KPI-Tracking-System: Ziel-vs-Ist, Trend-Pfeile, Sparklines, Vergleichszeitraum, Alert-Thresholds und automatische Status-Ampel (grün/gelb/rot).' },
      { id: 'd6', icon: '&#128202;', name: 'Report Generator', desc: 'Berichte', prompt: 'Baue einen Report-Generator: Template-System, dynamische Daten-Einbindung, PDF-Export (Print CSS), Diagramm-Einbettung und Zeitraum-Auswahl.' },
      { id: 'd7', icon: '&#128202;', name: 'Data Pipeline', desc: 'ETL-Prozess', prompt: 'Erstelle eine Data-Pipeline-Visualisierung: Source→Transform→Load Schritte, Status-Anzeige, Error-Log, Scheduling und Performance-Metriken.' },
      { id: 'd8', icon: '&#128202;', name: 'A/B Test', desc: 'Experiment-Framework', prompt: 'Baue ein A/B-Test-Framework: Varianten-Definition, User-Zuweisung (Hash-basiert), Metriken-Tracking, Signifikanz-Berechnung und Ergebnis-Dashboard.' },
      { id: 'd9', icon: '&#128202;', name: 'Heatmap', desc: 'Klick-Analyse', prompt: 'Erstelle eine Heatmap-Visualisierung: Klick-Position-Tracking, Canvas-Rendering mit Farbverlauf, Scroll-Depth-Analyse und Session-Recording-Replay.' },
      { id: 'd10', icon: '&#128202;', name: 'Log Analyzer', desc: 'Log-Auswertung', prompt: 'Baue einen Log-Analyzer: Pattern-Erkennung, Error-Clustering, Timeline-Visualisierung, Filter nach Level/Source, Export und Alert-Rules.' },
      { id: 'd11', icon: '&#128202;', name: 'SQL Builder', desc: 'Query-Generator', prompt: 'Erstelle einen visuellen SQL-Query-Builder: Tabellen-Auswahl, JOIN-Visualization, WHERE-Conditions, GROUP BY, Syntax-Highlighting und Query-Preview.' },
      { id: 'd12', icon: '&#128202;', name: 'Cost Calculator', desc: 'Kosten-Rechner', prompt: 'Baue einen interaktiven Kostenrechner: Slider-basierte Input-Parameter, Echtzeit-Berechnung, Vergleichstabelle, Breakeven-Punkt und PDF-Export.' },
    ]
  },
  {
    id: 'api', icon: '&#128279;', name: 'API & Backend',
    modules: [
      { id: 'p1', icon: '&#128279;', name: 'REST API', desc: 'CRUD Endpoints', prompt: 'Erstelle eine REST API Design-Vorlage: CRUD-Endpoints (GET/POST/PUT/DELETE), Request/Response-Schemas, Status-Codes, Pagination, Filtering und Error-Handling.' },
      { id: 'p2', icon: '&#128279;', name: 'Auth System', desc: 'Login/Register', prompt: 'Baue ein Auth-System: JWT Token, Refresh-Token, Login/Register/Logout Flows, Password-Hashing, Rate-Limiting, CORS-Config und Session-Management.' },
      { id: 'p3', icon: '&#128279;', name: 'WebSocket', desc: 'Echtzeit-Kommunikation', prompt: 'Implementiere WebSocket: Connection-Management, Heartbeat/Ping, Room-System, Message-Types, Reconnection-Logic und Broadcasting.' },
      { id: 'p4', icon: '&#128279;', name: 'GraphQL', desc: 'Query Language', prompt: 'Erstelle GraphQL Schema-Design: Types, Queries, Mutations, Subscriptions, Resolver-Structure, Input-Validation und N+1-Prevention.' },
      { id: 'p5', icon: '&#128279;', name: 'Rate Limiter', desc: 'API-Schutz', prompt: 'Baue einen Rate-Limiter: Token-Bucket-Algorithmus, Per-IP/Per-User Limits, Retry-After Header, Dashboard und Whitelist-Funktion.' },
      { id: 'p6', icon: '&#128279;', name: 'Webhook', desc: 'Event-Notification', prompt: 'Erstelle ein Webhook-System: Event-Registration, Payload-Signing (HMAC), Retry-Queue, Delivery-Log und Admin-Dashboard.' },
      { id: 'p7', icon: '&#128279;', name: 'File Upload', desc: 'Multi-Part Upload', prompt: 'Baue File-Upload: Drag-and-Drop Zone, Progress-Bar, File-Type-Validation, Size-Limits, Preview für Bilder und Chunk-Upload für große Dateien.' },
      { id: 'p8', icon: '&#128279;', name: 'Caching', desc: 'Performance', prompt: 'Implementiere Caching-Strategien: In-Memory Cache, Cache-Invalidation, TTL, Cache-Aside Pattern, ETag/Last-Modified Headers und Cache-Warming.' },
      { id: 'p9', icon: '&#128279;', name: 'Error Handler', desc: 'Fehler-Management', prompt: 'Erstelle globales Error-Handling: Custom Error-Klassen, HTTP-Status-Mapping, Logging, User-freundliche Messages, Stack-Trace-Filtering und Error-Reporting.' },
      { id: 'p10', icon: '&#128279;', name: 'Migration', desc: 'Schema-Updates', prompt: 'Baue ein Migration-System: Versions-Tracking, Up/Down-Migrationen, Seed-Data, Rollback und automatische Ausführung bei Deployment.' },
      { id: 'p11', icon: '&#128279;', name: 'Middleware', desc: 'Request-Pipeline', prompt: 'Erstelle Middleware-Patterns: Auth-Check, Logging, CORS, Compression, Body-Parsing, Request-ID und Performance-Monitoring.' },
      { id: 'p12', icon: '&#128279;', name: 'API Documentation', desc: 'Swagger/OpenAPI', prompt: 'Generiere API-Dokumentation: OpenAPI 3.0 Spec, Endpoint-Beschreibungen, Request/Response-Beispiele, Auth-Flows und Try-It-Out-Feature.' },
    ]
  },
  {
    id: 'tic', icon: '&#128295;', name: 'DevTools',
    modules: [
      { id: 't1', icon: '&#128295;', name: 'CLI Tool', desc: 'Terminal-Utility', prompt: 'Erstelle ein CLI-Tool mit: Argument-Parsing, Help-Output, Progress-Bars, Colorized Output, Interactive-Prompts und Config-File-Support.' },
      { id: 't2', icon: '&#128295;', name: 'Code Generator', desc: 'Scaffolding', prompt: 'Baue einen Code-Generator: Template-Engine, Variable-Interpolation, File-System-Output, Konfigurierbares Schema und Post-Generation-Hooks.' },
      { id: 't3', icon: '&#128295;', name: 'Linter', desc: 'Code-Analyse', prompt: 'Erstelle Linter-Regeln: Naming-Conventions, Import-Ordnung, Unused-Variables, Complexity-Score, Auto-Fix und VSCode-Integration.' },
      { id: 't4', icon: '&#128295;', name: 'Build Script', desc: 'Automatisierung', prompt: 'Baue ein Build-Script: File-Watching, Live-Reload, CSS-Minification, JS-Bundling, Asset-Optimization und Environment-Variables.' },
      { id: 't5', icon: '&#128295;', name: 'Testing', desc: 'Test-Framework', prompt: 'Implementiere Testing-Utilities: Unit-Tests, Integration-Tests, Snapshot-Testing, Coverage-Report, Mock-Functions und Test-Runner.' },
      { id: 't6', icon: '&#128295;', name: 'Docker Setup', desc: 'Container', prompt: 'Erstelle Docker-Konfiguration: Dockerfile (Multi-Stage), Docker-Compose, Volume-Mapping, Network-Config, Health-Checks und CI/CD-Integration.' },
      { id: 't7', icon: '&#128295;', name: 'Git Hooks', desc: 'Commit-Quality', prompt: 'Baue Git-Hooks: Pre-Commit (Lint), Commit-Message-Format, Pre-Push (Tests), Branch-Naming-Check und Conventional-Commits-Enforcement.' },
      { id: 't8', icon: '&#128295;', name: 'Performance', desc: 'Optimization', prompt: 'Erstelle Performance-Audit: Lighthouse-Score-Analyse, Bundle-Size-Tracking, Critical-CSS, Code-Splitting, Lazy-Loading und Resource-Hints (preload/prefetch).' },
      { id: 't9', icon: '&#128295;', name: 'Monitoring', desc: 'System-Health', prompt: 'Baue ein Monitoring-System: Health-Endpoint, Uptime-Tracking, Response-Time-Messung, Error-Rate-Alert, Dashboard und Incident-Timeline.' },
      { id: 't10', icon: '&#128295;', name: 'Environment', desc: 'Config-Management', prompt: 'Erstelle Environment-Management: .env-Parsing, Secrets-Handling, Stage-spezifische Configs (dev/staging/prod), Validation und Auto-Documentation.' },
      { id: 't11', icon: '&#128295;', name: 'Deployment', desc: 'CI/CD Pipeline', prompt: 'Baue Deployment-Pipeline: Build→Test→Deploy, GitHub Actions Workflow, Docker-Registry-Push, Rolling-Update, Rollback und Smoke-Tests.' },
      { id: 't12', icon: '&#128295;', name: 'Backup System', desc: 'Datensicherung', prompt: 'Erstelle ein Backup-System: Automatische Snapshots, Incremental-Backup, Retention-Policy, Restore-Verifizierung und Off-Site-Storage-Sync.' },
    ]
  },
  {
    id: 'tic2', icon: '&#127912;', name: 'UI Components',
    modules: [
      { id: 'u1', icon: '&#127912;', name: 'Kalender', desc: 'Date-Picker', prompt: 'Baue einen interaktiven Kalender: Monats-/Wochen-/Tag-Ansicht, Event-Erstellung, Drag-Resize für Termine, Recurring-Events und iCal-Export.' },
      { id: 'u2', icon: '&#127912;', name: 'Kanban Board', desc: 'Task-Management', prompt: 'Erstelle ein Kanban-Board: Drag-and-Drop-Spalten, Card-Erstellung, Labels/Tags, Assignees, Due-Dates, Filter und WIP-Limits.' },
      { id: 'u3', icon: '&#127912;', name: 'Rich Text Editor', desc: 'WYSIWYG', prompt: 'Baue einen Rich-Text-Editor: Bold/Italic/Underline, Headings, Lists, Links, Images, Tables, Code-Blocks, Undo/Redo und HTML-Export.' },
      { id: 'u4', icon: '&#127912;', name: 'File Manager', desc: 'Datei-Browser', prompt: 'Erstelle einen File-Manager: Ordner-Baum, Grid/List-View, Upload/Download, Rename/Delete, Drag-Drop-Verschieben, Suche und Breadcrumb-Navigation.' },
      { id: 'u5', icon: '&#127912;', name: 'Timeline', desc: 'Chronologie', prompt: 'Baue eine Timeline-Komponente: Vertikale/Horizontale Ausrichtung, Event-Cards, Date-Markers, Animierte Entry-Points und Expandable-Details.' },
      { id: 'u6', icon: '&#127912;', name: 'Code Editor', desc: 'Syntax Highlighting', prompt: 'Erstelle einen Code-Editor: Syntax-Highlighting (JS/CSS/HTML/Python), Line-Numbers, Auto-Indent, Bracket-Matching, Mini-Map und Theme-Support.' },
      { id: 'u7', icon: '&#127912;', name: 'Chat Interface', desc: 'Messaging UI', prompt: 'Baue ein Chat-Interface: Message-Bubbles, Avatar, Timestamp, Typing-Indicator, Read-Receipts, Emoji-Picker, File-Attach und Scroll-to-Bottom.' },
      { id: 'u8', icon: '&#127912;', name: 'Color Picker', desc: 'Farbauswahl', prompt: 'Erstelle einen Color-Picker: HSL/RGB/HEX-Input, Gradient-Selector, Saturation-Lightness-Canvas, Preset-Farben, Pipette-Tool und Palette-Export.' },
      { id: 'u9', icon: '&#127912;', name: 'Tree View', desc: 'Hierarchie', prompt: 'Baue eine Tree-View-Komponente: Verschachtelte Nodes, Expand/Collapse, Drag-Drop-Reorder, Checkbox-Selection, Search-Filter und Lazy-Load für große Bäume.' },
      { id: 'u10', icon: '&#127912;', name: 'Stepper', desc: 'Multi-Step Form', prompt: 'Erstelle einen Stepper/Wizard: Nummerierte Schritte, Progress-Bar, Step-Validation, Back/Next-Navigation, Summary-Step und Form-State-Persistence.' },
      { id: 'u11', icon: '&#127912;', name: 'Dropdown', desc: 'Select-Menü', prompt: 'Baue ein Custom-Dropdown: Searchable, Multi-Select, Group-Options, Virtual-Scroll für große Listen, Keyboard-Navigation und Clear-Button.' },
      { id: 'u12', icon: '&#127912;', name: 'Notification Center', desc: 'Alert-System', prompt: 'Erstelle ein Notification-Center: Ungelesene-Count-Badge, Notification-Panel, Mark-as-Read, Group-by-Type, Action-Buttons und Real-Time-Updates.' },
      { id: 'u13', icon: '&#127912;', name: 'Image Cropper', desc: 'Bild-Zuschnitt', prompt: 'Baue einen Image-Cropper: Canvas-basiert, Aspect-Ratio-Lock, Zoom/Pan, Round/Square-Mode, Mobile-Touch-Support und Export als Blob/Data-URL.' },
      { id: 'u14', icon: '&#127912;', name: 'Data Grid', desc: 'Advanced Table', prompt: 'Erstelle ein Advanced Data-Grid: Virtualized-Rows (10k+ Zeilen), Column-Resize, Inline-Edit, Row-Grouping, Cell-Formatting und Frozen-Columns.' },
      { id: 'u15', icon: '&#127912;', name: 'Audio Visualizer', desc: 'Waveform/Spectrum', prompt: 'Baue einen Audio-Visualizer: Web Audio API, Waveform-Canvas, Frequency-Bars, Peak-Meter, Responsive-Resize und Farb-Mapping nach Frequenz.' },
      { id: 'u16', icon: '&#127912;', name: 'Tag Input', desc: 'Multi-Tag Feld', prompt: 'Erstelle ein Tag-Input: Autocomplete-Suggestions, Create-on-Enter, Remove-on-Backspace, Drag-Reorder, Max-Tags-Limit und Validation.' },
    ]
  },
  {
    id: 'sec', icon: '&#128274;', name: 'Security',
    modules: [
      { id: 'sec1', icon: '&#128274;', name: 'XSS-Schutz', desc: 'Input Sanitization', prompt: 'Implementiere XSS-Schutz: HTML-Entity-Encoding, Content-Security-Policy Header, DOMPurify-Integration, Sanitize-Function und Output-Encoding für verschiedene Kontexte.' },
      { id: 'sec2', icon: '&#128274;', name: 'CSRF Protection', desc: 'Token-basiert', prompt: 'Baue CSRF-Schutz: Token-Generierung, Hidden-Form-Fields, Header-Validation, SameSite-Cookies und Double-Submit-Cookie Pattern.' },
      { id: 'sec3', icon: '&#128274;', name: 'Password Security', desc: 'Hash & Salt', prompt: 'Erstelle Password-Security: bcrypt-Hashing, Password-Strength-Meter, Breach-Check (HaveIBeenPwned API), Password-Policies und Secure-Reset-Flow.' },
      { id: 'sec4', icon: '&#128274;', name: 'Encryption', desc: 'Datenverschlüsselung', prompt: 'Implementiere Web-Crypto-API: AES-GCM Verschlüsselung, Key-Derivation (PBKDF2), Secure-Random, Signature-Verification und Key-Management.' },
      { id: 'sec5', icon: '&#128274;', name: 'OAuth Flow', desc: 'Social Login', prompt: 'Baue OAuth 2.0/OIDC Flow: Authorization-Code mit PKCE, Token-Exchange, User-Info-Endpoint, Refresh-Token-Rotation und Multi-Provider (Google, GitHub, Microsoft).' },
      { id: 'sec6', icon: '&#128274;', name: 'Access Control', desc: 'RBAC', prompt: 'Erstelle Role-Based Access Control: Rollen-Definition, Permission-Matrix, Middleware-Guard, UI-Element-Ausblendung und Audit-Log.' },
      { id: 'sec7', icon: '&#128274;', name: '2FA', desc: 'Zwei-Faktor-Auth', prompt: 'Implementiere 2FA: TOTP-Generierung (Google Authenticator kompatibel), QR-Code-Setup, Backup-Codes, Remember-Device und Recovery-Flow.' },
      { id: 'sec8', icon: '&#128274;', name: 'Input Validation', desc: 'Server-Side', prompt: 'Erstelle Server-Side Validation: Schema-Validation (Joi/Zod-Style), Type-Coercion, Nested-Object-Validation, Custom-Rules und Sanitization-Pipeline.' },
    ]
  },
  {
    id: 'mob', icon: '&#128241;', name: 'Mobile & PWA',
    modules: [
      { id: 'm1', icon: '&#128241;', name: 'PWA Setup', desc: 'Progressive Web App', prompt: 'Erstelle vollständiges PWA-Setup: Manifest.json, Service Worker, Offline-Fallback, Install-Prompt, App-Icon-Set und Splash-Screen.' },
      { id: 'm2', icon: '&#128241;', name: 'Touch Gesten', desc: 'Swipe & Pinch', prompt: 'Implementiere Touch-Gesten: Swipe (links/rechts/oben/unten), Pinch-to-Zoom, Long-Press, Double-Tap und gesture-basierte Navigation.' },
      { id: 'm3', icon: '&#128241;', name: 'Bottom Navigation', desc: 'Mobile Nav', prompt: 'Baue eine Bottom-Navigation-Bar: 4-5 Icons mit Label, Active-State, Badge-Counter, Ripple-Effect und Safe-Area-Padding (iPhone Notch).' },
      { id: 'm4', icon: '&#128241;', name: 'Pull-to-Refresh', desc: 'Aktualisieren', prompt: 'Implementiere Pull-to-Refresh: Touch-basiertes Ziehen, Animations-Feedback, Loading-Spinner, Threshold-Detection und Haptic-Feedback.' },
      { id: 'm5', icon: '&#128241;', name: 'Push Notifications', desc: 'Benachrichtigungen', prompt: 'Erstelle Push-Notification-System: Permission-Request, Notification-API, Action-Buttons, Badge-Update und Notification-Grouping.' },
      { id: 'm6', icon: '&#128241;', name: 'Camera Access', desc: 'Foto-Capture', prompt: 'Baue Kamera-Zugriff: getUserMedia, Photo-Capture, Video-Recording, Camera-Switch (front/back), Flash-Control und QR-Scanner.' },
      { id: 'm7', icon: '&#128241;', name: 'Geolocation', desc: 'Standort-Services', prompt: 'Implementiere Geolocation: getCurrentPosition, watchPosition, Map-Integration, Distance-Calculation, Geofencing und Offline-Map-Tiles.' },
      { id: 'm8', icon: '&#128241;', name: 'App Shell', desc: 'Shell-Architektur', prompt: 'Erstelle App-Shell-Architektur: Statisches Shell (Header, Nav, Footer) gecached, dynamischer Content via API, Skeleton-Loading und Offline-Queue.' },
    ]
  },
  {
    id: 'biz', icon: '&#128188;', name: 'Business & Finanzen',
    modules: [
      { id: 'b1', icon: '&#128188;', name: 'Invoice Generator', desc: 'Rechnungen', prompt: 'Erstelle einen Rechnungs-Generator: Kunden-/Firmen-Daten, Positions-Tabelle, MwSt-Berechnung, PDF-Export, Nummern-Serie und Vorlagen-Speicherung.' },
      { id: 'b2', icon: '&#128188;', name: 'Kalkulationstool', desc: 'Preisberechnung', prompt: 'Baue ein Kalkulationstool: Stunden→Preis, Material-Kosten, Gewinn-Marge, Mengen-Rabatte, Währungs-Umrechnung und Angebots-PDF.' },
      { id: 'b3', icon: '&#128188;', name: 'CRM Kontakte', desc: 'Kundenverwaltung', prompt: 'Erstelle ein CRM-Kontaktmodul: Kontakt-Karten, Firmen-Zuordnung, Tags, Notiz-History, E-Mail-Integration und Aktivitäts-Timeline.' },
      { id: 'b4', icon: '&#128188;', name: 'Projekt-Tracker', desc: 'Projekte verwalten', prompt: 'Baue einen Projekt-Tracker: Kanban-ansicht, Meilensteine, Zeiterfassung, Budget-Tracking, Team-Zuordnung und Fortschritts-Dashboard.' },
      { id: 'b5', icon: '&#128188;', name: 'Finanzbericht', desc: 'Buchung-Übersicht', prompt: 'Erstelle Finanzberichte: Einnahmen/Ausgaben, Kategorisierung, Monats-/Jahres-Vergleich, Chart-Visualisierung und CSV/PDF-Export.' },
      { id: 'b6', icon: '&#128188;', name: 'Meeting Notes', desc: 'Protokoll-System', prompt: 'Baue ein Meeting-Notes-System: Agenda-Punkte, Teilnehmer, Aktionen mit Zuständigem/Deadline, Follow-Up-Tracking und Template-Bibliothek.' },
      { id: 'b7', icon: '&#128188;', name: 'ROI Calculator', desc: 'Rendite-Rechner', prompt: 'Erstelle einen ROI-Calculator: Investment-Input, Revenue-Prognose, Amortisations-Zeit, Szenario-Vergleich und Break-Even-Chart.' },
      { id: 'b8', icon: '&#128188;', name: 'Zeiterfassung', desc: 'Time-Tracking', prompt: 'Baue eine Zeiterfassung: Start/Stop-Timer, Projekt-Zuordnung, Tages-/Wochen-Übersicht, Report-Export und Overtime-Tracking.' },
    ]
  },
  {
    id: 'game', icon: '&#127918;', name: 'Gaming & Fun',
    modules: [
      { id: 'g1', icon: '&#127918;', name: 'Quiz-App', desc: 'Frage-Antwort', prompt: 'Erstelle eine Quiz-App: Kategorie-Auswahl, Multiple-Choice, Timer, Score-Tracking, Highscore-Board, Streak-Counter und Sound-Effects.' },
      { id: 'g2', icon: '&#127918;', name: 'Memory-Spiel', desc: 'Karten-Paare', prompt: 'Baue ein Memory-Spiel: Karten-Grid, Flip-Animation, Matching-Logic, Move-Counter, Timer, Difficulty-Levels und Win-Animation.' },
      { id: 'g3', icon: '&#127918;', name: 'Snake', desc: 'Klassiker', prompt: 'Implementiere Snake: Canvas-Rendering, Arrow-Key-Steuerung, Wachstum bei Futter, Score, Speed-Increase, Wall-Collision und Game-Over-Screen.' },
      { id: 'g4', icon: '&#127918;', name: 'Typing Test', desc: 'Tipp-Geschwindigkeit', prompt: 'Erstelle einen Typing-Test: Zufalls-Texte, WPM-Messung, Fehler-Highlight, Accuracy-Score, Progress-Bar und Ergebnis-Vergleich.' },
      { id: 'g5', icon: '&#127918;', name: 'Pomodoro Timer', desc: '25/5 Technik', prompt: 'Baue einen Pomodoro-Timer: 25-Minuten Sessions, 5-Minuten Pausen, Long-Break nach 4 Sessions, Sound-Alert, Task-Zuordnung und Statistik.' },
      { id: 'g6', icon: '&#127918;', name: 'Habit Tracker', desc: 'Gewohnheiten', prompt: 'Erstelle einen Habit-Tracker: Tägliche Check-Markierung, Streak-Visualisierung, Kategorie-Farben, Monats-Heatmap und Motivations-Quotes.' },
      { id: 'g7', icon: '&#127918;', name: 'Puzzle', desc: 'Schiebe-Puzzle', prompt: 'Baue ein 15er Schiebe-Puzzle: Grid-Rendering, Tile-Move-Animation, Shuffle-Algorithmus, Move-Counter und Solvability-Check.' },
      { id: 'g8', icon: '&#127918;', name: 'Würfelroller', desc: 'Zufalls-Würfel', prompt: 'Erstelle einen Würfelroller: 3D-CSS-Würfel-Animation, Anzahl wählbar (1-6), Ergebnis-Log, Statistik-Chart und Sound-Effects.' },
    ]
  },
  {
    id: 'auto', icon: '&#9881;', name: 'Automation',
    modules: [
      { id: 'au1', icon: '&#9881;', name: 'Workflow Engine', desc: 'Task-Automatisierung', prompt: 'Baue eine Workflow-Engine: Visuelle Node-Verbindung, Trigger-Types (Timer, Event, Manual), Conditions, Actions und Execution-Log.' },
      { id: 'au2', icon: '&#9881;', name: 'Email Automation', desc: 'Auto-Versand', prompt: 'Erstelle Email-Automation: Template-Editor, Trigger-Regeln, Delay-Scheduling, Variable-Substitution, Bounce-Handling und Analytics.' },
      { id: 'au3', icon: '&#9881;', name: 'Web Scraper', desc: 'Daten-Extraktion', prompt: 'Baue einen Web-Scraper-Builder: URL-Input, CSS-Selector-Picker, Data-Preview, Schedule-Option, JSON/CSV-Output und Rate-Limiting.' },
      { id: 'au4', icon: '&#9881;', name: 'Bot Framework', desc: 'Chat-Bot', prompt: 'Erstelle ein Bot-Framework: Intent-Erkennung, Dialog-Flow-Builder, Response-Templates, Context-Management und Multi-Channel-Support.' },
      { id: 'au5', icon: '&#9881;', name: 'Task Scheduler', desc: 'Cron-Jobs', prompt: 'Baue einen Task-Scheduler: Cron-Expression-Builder, Visual-Timeline, Execution-History, Error-Notification und Retry-Policy.' },
      { id: 'au6', icon: '&#9881;', name: 'Batch Processor', desc: 'Massen-Verarbeitung', prompt: 'Erstelle einen Batch-Processor: Upload-Queue, Progress-Tracking, Parallel-Execution, Error-Skip/Retry, Result-Summary und Export.' },
      { id: 'au7', icon: '&#9881;', name: 'Integration Hub', desc: 'API-Verbindungen', prompt: 'Baue einen Integration-Hub: Pre-built Connectors, OAuth-Flow, Webhook-Receiver, Data-Mapping und Transformation-Pipeline.' },
      { id: 'au8', icon: '&#9881;', name: 'Form Builder', desc: 'Formular-Generator', prompt: 'Erstelle einen Drag-Drop-Form-Builder: Field-Types, Validation-Rules, Conditional-Logic, Multi-Page, Submission-Handler und Response-Dashboard.' },
    ]
  },
  {
    id: 'a11y', icon: '&#9855;', name: 'Accessibility',
    modules: [
      { id: 'ax1', icon: '&#9855;', name: 'ARIA Labels', desc: 'Screen Reader', prompt: 'Implementiere ARIA: landmark-roles, live-regions, aria-label/labelledby, aria-expanded, aria-hidden und role-Attribute für alle interaktiven Elemente.' },
      { id: 'ax2', icon: '&#9855;', name: 'Keyboard Nav', desc: 'Tastatur-Bedienung', prompt: 'Erstelle vollständige Keyboard-Navigation: Tab-Order, Focus-Visible-Styles, Skip-Links, Focus-Trapping in Modals und Custom-Key-Bindings.' },
      { id: 'ax3', icon: '&#9855;', name: 'Kontrast-Check', desc: 'WCAG Farben', prompt: 'Baue einen Kontrast-Checker: WCAG 2.1 AA/AAA Berechnung, Farbvorschläge bei Fehler, Dark/Light-Mode-Prüfung und automatischer Report.' },
      { id: 'ax4', icon: '&#9855;', name: 'Responsive Text', desc: 'Barrierefreie Typografie', prompt: 'Erstelle barrierefreie Typografie: rem-basierte Größen, Minimum 16px Body, Line-Height 1.5+, No-Text-in-Images und Dyslexia-Font-Option.' },
    ]
  },
  {
    id: 'i18n', icon: '&#127760;', name: 'Internationalisierung',
    modules: [
      { id: 'i1', icon: '&#127760;', name: 'i18n System', desc: 'Mehrsprachigkeit', prompt: 'Baue ein i18n-System: JSON-basierte Übersetzungsdateien, Sprach-Switcher, Fallback-Sprache, Pluralisierung, Datum-/Zahlen-Formatierung und RTL-Support.' },
      { id: 'i2', icon: '&#127760;', name: 'RTL Support', desc: 'Rechts-nach-Links', prompt: 'Implementiere RTL-Layout: dir=rtl, logische CSS Properties (margin-inline), Mirrored-Icons, Bidirectional-Text und Layout-Flip.' },
      { id: 'i3', icon: '&#127760;', name: 'Currency Format', desc: 'Währungs-Anzeige', prompt: 'Erstelle Währungs-Formatierung: Intl.NumberFormat, Locale-basiert, Kurs-Umrechnung, Custom-Formatter und Accounting-Format (negativ in Klammern).' },
      { id: 'i4', icon: '&#127760;', name: 'Date Locale', desc: 'Datum-Formatierung', prompt: 'Baue Datum-Lokalisierung: Intl.DateTimeFormat, relative Zeitangaben (vor 5 Min), Kalender-Systeme und Timezone-Konvertierung.' },
    ]
  },
  {
    id: 'mail', icon: '&#128231;', name: 'Templates',
    modules: [
      { id: 'ml1', icon: '&#128231;', name: 'Hero Email', desc: 'Newsletter', prompt: 'Erstelle ein responsives Email-Template: Table-basiertes Layout, Hero-Image, CTA-Button (VML für Outlook), Dark-Mode-Support und 600px Max-Breite.' },
      { id: 'ml2', icon: '&#128231;', name: 'Transactional', desc: 'System-Emails', prompt: 'Baue transaktionale Email-Templates: Passwort-Reset, Willkommen, Bestellbestätigung, Versandinfo. Minimales Design, klarer CTA, rechtliche Pflichtangaben.' },
      { id: 'ml3', icon: '&#128231;', name: 'Marketing', desc: 'Promotion-Emails', prompt: 'Erstelle Marketing-Email-Templates: Produkt-Showcase, Rabatt-Banner, Countdown-Timer (GIF), Social-Proof-Section und Unsubscribe-Link.' },
      { id: 'ml4', icon: '&#128231;', name: 'Digest', desc: 'Zusammenfassung', prompt: 'Baue Digest-Email-Templates: Wöchentliche Zusammenfassung, Artikel-Previews, Statistik-Highlights, Personalisierte Empfehlungen und Action-Count.' },
    ]
  },

  {
    id: 'wp', icon: '&#128187;', name: 'WordPress & CMS',
    modules: [
      { id: 'wp1', icon: '&#128187;', name: 'Theme-Struktur', desc: 'WP Theme Aufbau', prompt: 'Erstelle eine vollständige WordPress Theme-Struktur: style.css mit Theme-Header, functions.php mit Hooks, header.php, footer.php, index.php, single.php, page.php, archive.php. Child-Theme-kompatibel, DkZ Dark-Design.' },
      { id: 'wp2', icon: '&#128187;', name: 'Custom Post Type', desc: 'CPT anlegen', prompt: 'Registriere einen Custom Post Type in WordPress: register_post_type() mit Labels (DE), Taxonomien, Meta-Boxes, Admin-Columns, Archive-Template und REST API Support.' },
      { id: 'wp3', icon: '&#128187;', name: 'WooCommerce Shop', desc: 'Shop-Seite', prompt: 'Erstelle ein WooCommerce Shop-Template: Produkt-Grid mit Filtern, Warenkorb-Widget, Checkout-Flow, Bewertungssystem, Related-Products und responsive Mobile-Ansicht.' },
      { id: 'wp4', icon: '&#128187;', name: 'Gutenberg Block', desc: 'Custom Block', prompt: 'Baue einen Custom Gutenberg Block mit React: Edit-Component, Save-Component, Attributes, InspectorControls, Block-Styles und Server-Side-Rendering.' },
      { id: 'wp5', icon: '&#128187;', name: 'Plugin-Struktur', desc: 'WP Plugin', prompt: 'Erstelle ein WordPress Plugin-Grundgerüst: Plugin-Header, Activation/Deactivation Hooks, Admin-Menu-Page, Settings-API, Nonces, AJAX-Handler und Uninstall.php.' },
      { id: 'wp6', icon: '&#128187;', name: 'REST API Endpoints', desc: 'Custom Endpoints', prompt: 'Registriere Custom REST API Endpoints in WordPress: register_rest_route(), Permission-Callbacks, Schema-Definition, Sanitization und Response-Formatierung.' },
      { id: 'wp7', icon: '&#128187;', name: 'ACF Integration', desc: 'Custom Fields', prompt: 'Implementiere Advanced Custom Fields: Feld-Gruppen, Flexible Content, Repeater-Fields, Options-Page, Frontend-Rendering und JSON-Sync für Versionskontrolle.' },
      { id: 'wp8', icon: '&#128187;', name: 'SEO für WordPress', desc: 'WP SEO', prompt: 'Optimiere WordPress für SEO: Yoast/RankMath-Konfiguration, Schema-Markup, XML-Sitemap, Breadcrumbs, Canonical-URLs, og:image und Performance-Optimierung.' },
      { id: 'wp9', icon: '&#128187;', name: 'E-Commerce Landing', desc: 'Shop Landing Page', prompt: 'Erstelle eine E-Commerce Landing Page: Hero mit Produkt-Slider, Trust-Badges, Feature-Comparison, Testimonials, FAQ-Accordion, Countdown-Timer und CTA.' },
      { id: 'wp10', icon: '&#128187;', name: 'Portfolio Theme', desc: 'Kreativ-Portfolio', prompt: 'Baue ein Portfolio-Theme: Projektgalerie mit Filterable-Isotope-Grid, Lightbox, Projekt-Detail-Seiten, About-Section, Kontaktformular und Smooth-Scroll.' },
      { id: 'wp11', icon: '&#128187;', name: 'Blog Layout', desc: 'Blog-Design', prompt: 'Erstelle ein Blog-Layout: Featured-Post-Hero, Post-Grid mit Excerpt, Sidebar-Widgets, Author-Box, Related-Posts, Social-Share-Buttons und Infinite-Scroll.' },
      { id: 'wp12', icon: '&#128187;', name: 'Membership Site', desc: 'Mitglieder-Bereich', prompt: 'Baue einen Membership-Bereich: Login/Register, Content-Restriction, User-Levels, Dashboard, Profile-Editor und Subscription-Plans.' },
    ]
  },
  {
    id: 'shop', icon: '&#128722;', name: 'E-Commerce & Shop',
    modules: [
      { id: 'sh1', icon: '&#128722;', name: 'Produktseite', desc: 'Product Detail', prompt: 'Erstelle eine Produktseite: Hero-Bild mit Zoom, Galerie-Thumbnails, Preis mit Rabatt-Badge, Varianten-Auswahl (Farbe/Größe), Add-to-Cart, Reviews und Related-Products.' },
      { id: 'sh2', icon: '&#128722;', name: 'Warenkorb', desc: 'Shopping Cart', prompt: 'Baue einen Warenkorb: Line-Items mit Bild/Titel/Preis, Quantity-Selector, Remove-Button, Subtotal/Shipping/Tax-Berechnung, Coupon-Feld und Checkout-CTA.' },
      { id: 'sh3', icon: '&#128722;', name: 'Checkout Flow', desc: 'Bezahlvorgang', prompt: 'Erstelle einen Checkout-Flow: Step-by-Step (Adresse→Versand→Zahlung→Bestätigung), Form-Validation, Order-Summary, Payment-Methods-Icons und Trust-Badges.' },
      { id: 'sh4', icon: '&#128722;', name: 'Kategorie-Seite', desc: 'Product Listing', prompt: 'Baue eine Kategorie-Seite: Filter-Sidebar (Preis-Range, Farbe, Bewertung), Sortierung, Grid/List-Toggle, Pagination, Quick-View-Modal und Breadcrumbs.' },
      { id: 'sh5', icon: '&#128722;', name: 'Wishlist', desc: 'Merkliste', prompt: 'Erstelle eine Wishlist: Heart-Icon-Toggle, Persisted in localStorage, Wishlist-Page mit Add-to-Cart, Share-Link und Anzahl-Badge im Header.' },
      { id: 'sh6', icon: '&#128722;', name: 'Bewertungssystem', desc: 'Review System', prompt: 'Baue ein Review-System: 5-Sterne-Rating, Text-Review, Foto-Upload, Verified-Purchase-Badge, Sorting (newest/helpful), Average-Rating-Summary und Reply-Funktion.' },
      { id: 'sh7', icon: '&#128722;', name: 'Coupon System', desc: 'Rabattcodes', prompt: 'Erstelle ein Coupon-System: Code-Eingabe, Prozent/Festbetrag, Mindestbestellwert, Ablaufdatum, Einmal-Nutzung, Product-Restriction und Auto-Apply-Banner.' },
      { id: 'sh8', icon: '&#128722;', name: 'Order Tracking', desc: 'Bestellverfolgung', prompt: 'Baue ein Order-Tracking: Status-Timeline (Bestellt→Bezahlt→Versendet→Zugestellt), Tracking-Nummer-Link, Map-Integration und Email-Notifications.' },
      { id: 'sh9', icon: '&#128722;', name: 'Shop Dashboard', desc: 'Händler-Dashboard', prompt: 'Erstelle ein Shop-Dashboard: Umsatz-KPIs, Bestellungen-Tabelle, Bestseller-Chart, Lager-Status, Kunden-Übersicht und Export-Funktionen.' },
      { id: 'sh10', icon: '&#128722;', name: 'Produkt-Vergleich', desc: 'Compare Products', prompt: 'Baue einen Produkt-Vergleich: Side-by-Side-Tabelle, Feature-Highlights (besser/schlechter), Add-to-Compare-Button, Max 4 Produkte und Sticky-Header.' },
      { id: 'sh11', icon: '&#128722;', name: 'Preisrechner', desc: 'Kalkulator', prompt: 'Erstelle einen Preisrechner: Slider/Input für Menge, Staffelpreise, Mengenrabatte, Versandkosten-Berechnung, Währungswahl und Angebots-PDF-Download.' },
      { id: 'sh12', icon: '&#128722;', name: 'Shop Header', desc: 'E-Commerce Navigation', prompt: 'Baue einen Shop-Header: Logo, Suchleiste mit Autocomplete, Kategorie-Mega-Menu, Warenkorb-Icon mit Counter, User-Menu und Announcement-Bar (Sale/Versand).' },
      { id: 'sh13', icon: '&#127916;', name: 'NanoBanna Reel', desc: 'High-End 8K Reel', prompt: 'Generiere eine Prompt-Struktur für NanoBanna PRO um ein 8K Reel-Skript + Visuals für ein E-Commerce Produkt zu erstellen. Fokus auf: Hook, Close-Up Shots, Glassmorphism Overlays, Cinematic Lighting und Brand-Color-Integration.' },
      { id: 'sh14', icon: '&#128248;', name: 'Premium Produkt-Bild', desc: 'Photorealistic Model', prompt: 'Prompt für KI-Generierung eines ultra-premium E-Commerce Bildes: 8K, DSLR, Floating, Dark Mode Background, subtle glowing neon accents, sharp focus, reflection layer (Luxus-Ästhetik für CloudNine).' },
      { id: 'sh15', icon: '&#127909;', name: 'Content Pipeline', desc: 'Shop Workflow', prompt: 'Erstelle einen automatisierten Content-Flow: 1. Produkt-Analyse → 2. 8K Bild-Prompts erstellen → 3. NLM Podcast Briefing generieren → 4. NanoBanna Reel-Assets planen. Alles strikt auf die Marken-Identität gemappt.' },
    ]
  },
  {
    id: 'linkedin', icon: '&#128188;', name: 'LinkedIn & Professional',
    modules: [
      { id: 'li1', icon: '&#128188;', name: 'Profil-Headline', desc: 'Headline optimieren', prompt: 'Erstelle 10 LinkedIn-Headlines: Formel = [Titel] | [Expertise] | [Unique Value Proposition]. Max 220 Zeichen, Keywords für Recruiter, Persönlichkeit zeigen.' },
      { id: 'li2', icon: '&#128188;', name: 'About Section', desc: 'Über mich', prompt: 'Schreibe eine LinkedIn About-Section: Hook (erste 2 Zeilen), Story (Problem→Lösung), Skills, Achievements mit Zahlen, CTA und Kontaktinfo. 2600 Chars max.' },
      { id: 'li3', icon: '&#128188;', name: 'Post Template', desc: 'Content Posts', prompt: 'Erstelle 5 LinkedIn-Post-Vorlagen: Hook-Zeile, Story/Insight, 3-5 Bullet-Points, CTA, Hashtags (max 5). Formate: Carousel, Poll, Text-Only, Image-Post, Document.' },
      { id: 'li4', icon: '&#128188;', name: 'Connection Request', desc: 'Vernetzung', prompt: 'Schreibe 5 Connection-Request-Nachrichten: Personalisiert, Gemeinsamkeit erwähnen, Wert bieten, max 300 Zeichen, kein Pitch in erster Nachricht.' },
      { id: 'li5', icon: '&#128188;', name: 'Recommendation', desc: 'Empfehlung schreiben', prompt: 'Erstelle eine LinkedIn-Empfehlung: Kontext der Zusammenarbeit, spezifische Stärken, konkretes Beispiel, Impact-Statement und persönliche Note. 3000 Chars max.' },
      { id: 'li6', icon: '&#128188;', name: 'Job Description', desc: 'Stellenanzeige', prompt: 'Schreibe eine LinkedIn-Stellenanzeige: Attention-Grabbing-Title, Company-Culture, Role-Description, Requirements (must/nice-to-have), Benefits und Application-CTA.' },
      { id: 'li7', icon: '&#128188;', name: 'Company Page', desc: 'Firmenseite', prompt: 'Optimiere eine LinkedIn Company-Page: About-Text, Specialties-Keywords, Custom-Button, Life-Tab-Content, Featured-Posts und Employee-Advocacy-Strategie.' },
      { id: 'li8', icon: '&#128188;', name: 'Artikel schreiben', desc: 'LinkedIn Article', prompt: 'Erstelle einen LinkedIn-Artikel: SEO-Title, Intro-Hook, Structured-Headings, Data/Stats, Personal-Experience, Key-Takeaways und Discussion-CTA. 5000+ Wörter.' },
      { id: 'li9', icon: '&#128188;', name: 'Pitch Message', desc: 'Sales Outreach', prompt: 'Schreibe 5 LinkedIn-Sales-Nachrichten: AIDA-Formel, Pain-Point-Fokus, Social-Proof, Soft-CTA (Frage statt Pitch), Follow-Up-Sequenz (3 Messages).' },
      { id: 'li10', icon: '&#128188;', name: 'Event Promotion', desc: 'Event bewerben', prompt: 'Erstelle ein LinkedIn Event-Promotion-Paket: Event-Beschreibung, 3 Ankündigungs-Posts, Speaker-Highlight, Countdown-Post und Danke-Post mit Replay-Link.' },
      { id: 'li11', icon: '&#128188;', name: 'Skill Endorsement', desc: 'Skills optimieren', prompt: 'Optimiere LinkedIn-Skills: Top 3 Skills pinnen, Keyword-Research für Branche, Endorsement-Strategie, Skill-Assessment-Tests und Featured-Section-Integration.' },
      { id: 'li12', icon: '&#128188;', name: 'Newsletter', desc: 'LinkedIn Newsletter', prompt: 'Erstelle eine LinkedIn-Newsletter-Vorlage: Catchy-Title, Intro-Paragraph, 3-5 Sections mit Headers, Pro-Tips-Boxes, Resource-Links und Subscribe-CTA.' },
    ]
  },
  {
    id: 'social', icon: '&#128247;', name: 'Social Media',
    modules: [
      { id: 'so1', icon: '&#128247;', name: 'Instagram Caption', desc: 'Bildunterschrift', prompt: 'Schreibe 10 Instagram-Captions: Hook (erste Zeile), Story/Value, Call-to-Action, Emoji-Einsatz, 5-10 relevante Hashtags und Line-Breaks für Lesbarkeit.' },
      { id: 'so2', icon: '&#128247;', name: 'Story Sequence', desc: 'Insta Stories', prompt: 'Erstelle eine 7-Slide Instagram-Story-Sequenz: Title-Slide, Problem, Solution (3 Slides), Result, CTA-Slide. Mit Poll/Quiz-Sticker-Vorschlägen.' },
      { id: 'so3', icon: '&#128247;', name: 'Reel Script', desc: 'Kurzvideos', prompt: 'Schreibe 5 Reel-Scripts (30-60 Sek): Hook (3 Sek), Content (Value/Entertainment), CTA. B-Roll-Vorschläge, Trending-Audio-Tipps und Caption mit Hashtags.' },
      { id: 'so4', icon: '&#128247;', name: 'Twitter Thread', desc: 'X Thread', prompt: 'Erstelle einen Twitter/X-Thread (10 Tweets): Hook-Tweet, Progressive-Revelation, Numbered (1/10), Key-Insight pro Tweet, Summary-Tweet und Pin/Retweet-CTA.' },
      { id: 'so5', icon: '&#128247;', name: 'YouTube Script', desc: 'Video-Skript', prompt: 'Schreibe ein YouTube-Video-Script (10 Min): Hook (30 Sek), Intro, 3-5 Hauptpunkte mit B-Roll-Notizen, Transition-Sätze, CTA (Subscribe/Like) und Outro.' },
      { id: 'so6', icon: '&#128247;', name: 'TikTok Script', desc: 'TikTok Videos', prompt: 'Erstelle 5 TikTok-Scripts: Viral-Hook (1 Sek), Fast-Paced-Content, Text-Overlays, Trending-Sound-Vorschläge, Hashtags und Duett/Stitch-Potential.' },
      { id: 'so7', icon: '&#128247;', name: 'Content Calendar', desc: 'Redaktionsplan', prompt: 'Erstelle einen 30-Tage Content-Calendar: Platform-Mix (IG/LinkedIn/TikTok/X), Content-Pillars (4), Post-Types, Best-Posting-Times und Batch-Content-Ideen.' },
      { id: 'so8', icon: '&#128247;', name: 'Bio Generator', desc: 'Social Media Bios', prompt: 'Generiere Social-Media-Bios für alle Plattformen: Instagram (150 Chars), Twitter (160 Chars), LinkedIn (220 Chars), TikTok (80 Chars) mit Emoji und CTA.' },
      { id: 'so9', icon: '&#128247;', name: 'Hashtag Strategie', desc: 'Hashtag Research', prompt: 'Erstelle eine Hashtag-Strategie: 30 Hashtags in 3 Größen (small/medium/large), Nischen-Hashtags, Branded-Hashtag, Hashtag-Gruppen und Rotation-Plan.' },
      { id: 'so10', icon: '&#128247;', name: 'Collab Template', desc: 'Zusammenarbeit', prompt: 'Schreibe 5 Collaboration-Anfragen: Persönlich, Marken-Fit zeigen, Medienkit-Verweis, Konditionen (Paid/Barter), Follow-Up und Contract-Basics.' },
    ]
  },
  {
    id: 'doc', icon: '&#128221;', name: 'Dokumentation',
    modules: [
      { id: 'do1', icon: '&#128221;', name: 'README.md', desc: 'Projekt-README', prompt: 'Erstelle eine README.md: Project-Title mit Badge, Description, Features-Liste, Screenshots, Installation-Steps, Usage-Examples, API-Reference, Contributing und License.' },
      { id: 'do2', icon: '&#128221;', name: 'API Docs', desc: 'API-Dokumentation', prompt: 'Schreibe API-Dokumentation: Endpoint-Liste, Request/Response-Examples, Authentication, Error-Codes, Rate-Limits, Pagination, Versioning und SDK-Links.' },
      { id: 'do3', icon: '&#128221;', name: 'Changelog', desc: 'Versionshistorie', prompt: 'Erstelle ein CHANGELOG.md: Keep-a-Changelog-Format, Semantic-Versioning, Kategorien (Added/Changed/Fixed/Removed), Links zu Commits/PRs und Migration-Notes.' },
      { id: 'do4', icon: '&#128221;', name: 'User Guide', desc: 'Benutzerhandbuch', prompt: 'Schreibe ein Benutzerhandbuch: Getting-Started, Features-Walkthrough, FAQ, Troubleshooting, Screenshots, Keyboard-Shortcuts und Video-Tutorial-Links.' },
      { id: 'do5', icon: '&#128221;', name: 'Architecture Doc', desc: 'System-Architektur', prompt: 'Erstelle Architektur-Dokumentation: System-Übersicht (Mermaid-Diagram), Komponenten, Datenfluss, Tech-Stack, Decision-Records und Deployment-Architecture.' },
      { id: 'do6', icon: '&#128221;', name: 'Contributing Guide', desc: 'Beitrags-Richtlinien', prompt: 'Schreibe ein CONTRIBUTING.md: Setup-Guide, Branch-Naming, Commit-Convention, PR-Process, Code-Review-Checklist, Testing-Requirements und Code-of-Conduct.' },
      { id: 'do7', icon: '&#128221;', name: 'SLA Document', desc: 'Service Level', prompt: 'Erstelle ein SLA-Dokument: Service-Definition, Uptime-Ziel (99.9%), Support-Response-Times, Incident-Severity-Levels, Escalation-Process und Reporting.' },
      { id: 'do8', icon: '&#128221;', name: 'Release Notes', desc: 'Version Release', prompt: 'Schreibe Release-Notes: Version-Headline, Highlight-Features, Bug-Fixes, Known-Issues, Upgrade-Guide, Breaking-Changes und Thank-You an Contributors.' },
      { id: 'do9', icon: '&#128221;', name: 'Onboarding Doc', desc: 'Einarbeitung', prompt: 'Erstelle ein Onboarding-Dokument: Team-Übersicht, Tool-Setup, Code-Base-Tour, First-Task-Guide, Mentoring-Prozess, 30/60/90-Tage-Plan und Culture-Guide.' },
      { id: 'do10', icon: '&#128221;', name: 'Postmortem', desc: 'Incident-Analyse', prompt: 'Schreibe ein Postmortem-Template: Incident-Summary, Timeline, Root-Cause-Analysis, Impact, Detection-Method, Resolution, Action-Items und Lessons-Learned.' },
    ]
  },
  {
    id: 'mail2', icon: '&#128236;', name: 'E-Mail Vorlagen',
    modules: [
      { id: 'em1', icon: '&#128236;', name: 'Kaltakquise', desc: 'Cold Email', prompt: 'Schreibe 5 Cold-Email-Vorlagen: Personalisierte Subject-Line, Problem-Statement, Social-Proof, Soft-CTA, Follow-Up-Sequenz (3 Emails) und A/B-Test-Varianten.' },
      { id: 'em2', icon: '&#128236;', name: 'Follow-Up', desc: 'Nachfassen', prompt: 'Erstelle 5 Follow-Up-Email-Vorlagen: Tag 3/7/14/30 nach Erstkontakt, Wert-Addierung statt Drängeln, Reference-to-Previous, New-Angle und Break-Up-Email.' },
      { id: 'em3', icon: '&#128236;', name: 'Onboarding Sequence', desc: 'Willkommens-Serie', prompt: 'Schreibe eine 7-Email Onboarding-Sequenz: Welcome, Quick-Start, Feature-Deep-Dive (3), Success-Story, Check-In. Personalisierung und Trigger-Logik.' },
      { id: 'em4', icon: '&#128236;', name: 'Win-Back', desc: 'Kunden zurückgewinnen', prompt: 'Erstelle 3 Win-Back-Emails: We-Miss-You, Special-Offer, Last-Chance. Emotionale Trigger, Rabatt-Code, Feedback-Frage und Easy-Return-CTA.' },
      { id: 'em5', icon: '&#128236;', name: 'Referral Request', desc: 'Empfehlungs-Bitte', prompt: 'Schreibe Referral-Request-Emails: Timing (nach positiver Erfahrung), Easy-Forward, Incentive-Mention, Template für den Empfehler und Danke-Email.' },
      { id: 'em6', icon: '&#128236;', name: 'Event Einladung', desc: 'Veranstaltung', prompt: 'Erstelle Event-Einladungs-Emails: Save-the-Date, Details-Email, Reminder (3 Tage/1 Tag vorher), Day-of-Checkin und Post-Event-Danke mit Replay-Link.' },
      { id: 'em7', icon: '&#128236;', name: 'Feedback Request', desc: 'Bewertung bitten', prompt: 'Schreibe Feedback-Request-Emails: NPS-Frage, 1-Click-Rating (1-5 Sterne), Detailliertes-Feedback-Formular-Link, Incentive und Danke-Follow-Up.' },
      { id: 'em8', icon: '&#128236;', name: 'Announcement', desc: 'Ankündigung', prompt: 'Erstelle Announcement-Emails: Product-Launch, Feature-Update, Company-News, Partnership-Announcement. Hero-Image, Key-Benefits, CTA und Social-Share-Buttons.' },
    ]
  },
  {
    id: 'psy', icon: '&#129504;', name: 'Psychologie & Verkauf',
    modules: [
      { id: 'ps1', icon: '&#129504;', name: 'AIDA Framework', desc: 'Attention-Interest-Desire-Action', prompt: 'Erstelle Texte nach AIDA: Attention (provokante Frage/Statistik), Interest (Problem vertiefen), Desire (Lösung + Emotionen), Action (klarer CTA). 5 Beispiele für verschiedene Produkte.' },
      { id: 'ps2', icon: '&#129504;', name: 'PAS Framework', desc: 'Problem-Agitate-Solve', prompt: 'Schreibe nach PAS: Problem identifizieren, Agitate (Schmerz verstärken), Solve (Lösung präsentieren). 5 Varianten für Landing-Pages, Ads und Emails.' },
      { id: 'ps3', icon: '&#129504;', name: 'Social Proof', desc: 'Soziale Bewährtheit', prompt: 'Erstelle Social-Proof-Elemente: Testimonial-Templates, Case-Study-Outline, Zahlen/Statistiken-Darstellung, Logo-Walls, User-Count-Banner und Trust-Badges.' },
      { id: 'ps4', icon: '&#129504;', name: 'Urgency & Scarcity', desc: 'Dringlichkeit', prompt: 'Baue Urgency/Scarcity-Elemente: Countdown-Timer, Limited-Stock-Banner, Early-Bird-Pricing, Deadline-Copy, FOMO-Trigger und Ethische Grenzen beachten.' },
      { id: 'ps5', icon: '&#129504;', name: 'Storytelling', desc: 'Geschichte erzählen', prompt: 'Erstelle Storytelling-Frameworks: Hero Journey (Problem→Struggle→Discovery→Transformation), Before/After/Bridge, und Founder-Story-Template.' },
      { id: 'ps6', icon: '&#129504;', name: 'Objection Handling', desc: 'Einwand-Behandlung', prompt: 'Schreibe Einwand-Behandlungen für: zu teuer, brauche ich nicht, kein Vertrauen, später, Konkurrenz ist besser. Feel-Felt-Found-Methode mit Beispielen.' },
      { id: 'ps7', icon: '&#129504;', name: 'Value Proposition', desc: 'Wertversprechen', prompt: 'Erstelle Value-Proposition-Canvases: Gain-Creators, Pain-Relievers, Products/Services. Headline-Formeln, Sub-Headline, Bullet-Points und Hero-Section-Text.' },
      { id: 'ps8', icon: '&#129504;', name: 'Call-to-Action', desc: 'CTA-Collection', prompt: 'Generiere 50 CTA-Varianten für: Buttons (Jetzt kaufen/Testen/...), Email-CTAs, Landing-Page-CTAs, Social-CTAs. A/B-Test-Pairs und Farb-/Größen-Empfehlungen.' },
      { id: 'ps9', icon: '&#129504;', name: 'Pricing Page', desc: 'Preisgestaltung', prompt: 'Erstelle eine Pricing-Page: 3 Tiers (Starter/Pro/Enterprise), Feature-Comparison-Matrix, Recommended-Badge, Toggle Monthly/Yearly, FAQ und Custom-Plan-CTA.' },
      { id: 'ps10', icon: '&#129504;', name: 'Testimonial Template', desc: 'Kundenstimmen', prompt: 'Erstelle Testimonial-Frameworks: Video-Testimonial-Script, Written-Review-Template, Case-Study-Outline, Before/After, Star-Rating und Photo-Guidelines.' },
    ]
  },
  {
    id: 'devops', icon: '&#9881;', name: 'DevOps & Cloud',
    modules: [
      { id: 'dv1', icon: '&#9881;', name: 'Dockerfile', desc: 'Container Build', prompt: 'Erstelle ein optimiertes Dockerfile: Multi-Stage-Build, Alpine-Base, Non-Root-User, Health-Check, Layer-Caching, .dockerignore und Security-Scanning.' },
      { id: 'dv2', icon: '&#9881;', name: 'Docker Compose', desc: 'Multi-Container', prompt: 'Baue docker-compose.yml: App+DB+Cache+Proxy, Volumes, Networks, Environment-Variables, Health-Checks, Restart-Policy und Development/Production-Override.' },
      { id: 'dv3', icon: '&#9881;', name: 'GitHub Actions', desc: 'CI/CD', prompt: 'Erstelle GitHub Actions Workflow: Build→Test→Lint→Deploy, Matrix-Strategy (Node-Versionen), Caching, Secrets-Management, Environment-Protection und Status-Badges.' },
      { id: 'dv4', icon: '&#9881;', name: 'Kubernetes', desc: 'K8s Deployment', prompt: 'Schreibe K8s Manifests: Deployment, Service, Ingress, ConfigMap, Secret, HPA (Auto-Scaling), PVC und NetworkPolicy. Mit Kustomize-Overlays für dev/staging/prod.' },
      { id: 'dv5', icon: '&#9881;', name: 'Terraform', desc: 'Infrastructure as Code', prompt: 'Erstelle Terraform-Konfiguration: Provider (AWS/GCP), VPC/Subnet, EC2/GCE, RDS/CloudSQL, S3/GCS, IAM-Roles, Output-Values und Remote-State-Backend.' },
      { id: 'dv6', icon: '&#9881;', name: 'Nginx Config', desc: 'Reverse Proxy', prompt: 'Schreibe Nginx-Konfiguration: Reverse-Proxy, SSL/TLS (Let\s Encrypt), HTTP/2, Gzip, Rate-Limiting, Security-Headers, Load-Balancing und Caching.' },
      { id: 'dv7', icon: '&#9881;', name: 'Monitoring Stack', desc: 'Prometheus/Grafana', prompt: 'Erstelle Monitoring-Setup: Prometheus-Config, Grafana-Dashboards, AlertManager-Rules, Node-Exporter, Custom-Metrics und PagerDuty-Integration.' },
      { id: 'dv8', icon: '&#9881;', name: 'Backup Strategy', desc: 'Datensicherung', prompt: 'Definiere Backup-Strategie: 3-2-1-Regel, Automated-Backup-Scripts, Retention-Policy, Restore-Testing, Off-Site-Storage und Disaster-Recovery-Plan.' },
      { id: 'dv9', icon: '&#9881;', name: 'SSL/TLS Setup', desc: 'Zertifikate', prompt: 'Erstelle SSL/TLS-Setup: Let\s-Encrypt-Certbot, Auto-Renewal, HSTS-Header, Certificate-Pinning, OCSP-Stapling und Security-Audit-Checklist.' },
      { id: 'dv10', icon: '&#9881;', name: 'Log Management', desc: 'Zentrales Logging', prompt: 'Baue Log-Management: Structured-Logging (JSON), Log-Levels, Central-Aggregation (ELK/Loki), Log-Rotation, Search/Filter und Alert-on-Error-Patterns.' },
    ]
  },
  {
    id: 'db', icon: '&#128451;', name: 'Datenbank & SQL',
    modules: [
      { id: 'db1', icon: '&#128451;', name: 'Schema Design', desc: 'DB-Struktur', prompt: 'Erstelle ein Datenbank-Schema: ER-Diagramm, Tabellen mit Primary/Foreign-Keys, Indices, Constraints, Normalisierung (3NF) und Migration-Script.' },
      { id: 'db2', icon: '&#128451;', name: 'CRUD Queries', desc: 'SQL-Grundlagen', prompt: 'Schreibe CRUD-Queries: SELECT mit JOIN/WHERE/GROUP BY, INSERT mit ON CONFLICT, UPDATE mit Conditions, DELETE mit CASCADE und Prepared-Statements.' },
      { id: 'db3', icon: '&#128451;', name: 'Performance Tuning', desc: 'SQL-Optimierung', prompt: 'Optimiere SQL-Queries: EXPLAIN ANALYZE, Index-Strategie, Query-Rewriting, Partitioning, Materialized-Views, Connection-Pooling und Slow-Query-Log.' },
      { id: 'db4', icon: '&#128451;', name: 'NoSQL Design', desc: 'Document Store', prompt: 'Erstelle NoSQL-Schema-Design: Collection-Struktur, Embedding vs Referencing, Index-Strategie, Aggregation-Pipeline, Sharding und Backup-Recovery.' },
      { id: 'db5', icon: '&#128451;', name: 'Migration Script', desc: 'Schema-Updates', prompt: 'Schreibe Migration-Scripts: Versions-nummeriert, Up/Down-Migrationen, Data-Transformation, Rollback-Safety, Zero-Downtime und Testing-Strategie.' },
      { id: 'db6', icon: '&#128451;', name: 'Redis Cache', desc: 'In-Memory Store', prompt: 'Implementiere Redis-Caching: Key-Design, TTL-Strategy, Cache-Invalidation, Pub/Sub, Session-Store, Rate-Limiting und Cluster-Config.' },
      { id: 'db7', icon: '&#128451;', name: 'Full-Text Search', desc: 'Volltextsuche', prompt: 'Baue Full-Text-Search: Index-Erstellung, Tokenization, Stemming, Relevance-Scoring, Fuzzy-Search, Autocomplete und Multi-Language-Support.' },
      { id: 'db8', icon: '&#128451;', name: 'Data Modeling', desc: 'Datenmodell', prompt: 'Erstelle Datenmodelle: Entity-Relationship, Star-Schema (Data Warehouse), Graph-Model, Time-Series und Event-Sourcing mit CQRS-Pattern.' },
    ]
  },
  {
    id: 'portfolio', icon: '&#127912;', name: 'Portfolio & Showcase',
    modules: [
      { id: 'pf1', icon: '&#127912;', name: 'Dev Portfolio', desc: 'Entwickler-Portfolio', prompt: 'Erstelle ein Entwickler-Portfolio: Hero mit Typing-Animation, Skill-Section (Icons+Bars), Projekt-Showcase (Filterable), About-Section, Timeline und Kontakt-Formular.' },
      { id: 'pf2', icon: '&#127912;', name: 'Design Portfolio', desc: 'Designer-Portfolio', prompt: 'Baue ein Designer-Portfolio: Full-Width-Galerie, Case-Study-Layout, Process-Documentation, Mockup-Showcase, Client-Liste und Kontakt-CTA.' },
      { id: 'pf3', icon: '&#127912;', name: 'Agency Website', desc: 'Agentur-Seite', prompt: 'Erstelle eine Agency-Website: Hero mit Video-Background, Services-Grid, Team-Carousel, Case-Studies, Client-Logo-Slider, Blog-Preview und Footer-CTA.' },
      { id: 'pf4', icon: '&#127912;', name: 'Startup Landing', desc: 'Startup-Seite', prompt: 'Baue eine Startup-Landing-Page: Problem→Solution-Hero, Feature-Showcase, Pricing-Table, Testimonials, Integration-Logos, FAQ und Beta-Signup-Form.' },
      { id: 'pf5', icon: '&#127912;', name: 'Resume/CV', desc: 'Lebenslauf', prompt: 'Erstelle einen digitalen Lebenslauf: Personal-Info, Timeline (Erfahrung+Ausbildung), Skill-Chart, Projects, Certifications, Languages und PDF-Download-Button.' },
      { id: 'pf6', icon: '&#127912;', name: 'SaaS Landing', desc: 'Software-Seite', prompt: 'Baue eine SaaS-Landing-Page: Feature-Hero mit Screenshot, Benefits-Grid, How-It-Works (3 Steps), Pricing, Enterprise-CTA, Security-Badges und Free-Trial-Button.' },
      { id: 'pf7', icon: '&#127912;', name: 'Restaurant', desc: 'Gastronomie-Seite', prompt: 'Erstelle eine Restaurant-Website: Hero mit Fullscreen-Food-Image, Menu-Karte, Reservation-Form, Gallery, Opening-Hours, Map-Integration und Reviews.' },
      { id: 'pf8', icon: '&#127912;', name: 'Event Page', desc: 'Veranstaltung', prompt: 'Baue eine Event-Page: Countdown-Timer, Speaker-Grid, Schedule-Timeline, Venue-Map, Ticket-Selection, Sponsor-Logos und Early-Bird-Banner.' },
    ]
  },

  {
    id: 'python', icon: '&#128013;', name: 'Python',
    modules: [
      { id: 'py1', icon: '&#128013;', name: 'Flask API', desc: 'Web-API', prompt: 'Erstelle eine Flask-API: Blueprints, SQLAlchemy-Models, Marshmallow-Schemas, JWT-Auth, Error-Handling, CORS, Rate-Limiting und Swagger-Docs.' },
      { id: 'py2', icon: '&#128013;', name: 'FastAPI', desc: 'Async API', prompt: 'Baue eine FastAPI-Anwendung: Pydantic-Models, Dependency-Injection, OAuth2, Background-Tasks, WebSockets, Auto-Generated-OpenAPI und Middleware-Stack.' },
      { id: 'py3', icon: '&#128013;', name: 'Data Pipeline', desc: 'ETL Script', prompt: 'Erstelle eine Python-Data-Pipeline: CSV/JSON-Input, Pandas-Transformation, Data-Validation, Error-Logging, Output-Format-Selection und Scheduling mit APScheduler.' },
      { id: 'py4', icon: '&#128013;', name: 'Web Scraper', desc: 'BeautifulSoup', prompt: 'Baue einen Web-Scraper: Requests+BS4, CSS-Selektoren, Pagination-Handling, Rate-Limiting, Proxy-Rotation, JSON-Output und Retry-Logic.' },
      { id: 'py5', icon: '&#128013;', name: 'CLI Tool', desc: 'Command Line', prompt: 'Erstelle ein Python-CLI-Tool: Click/Typer, Sub-Commands, Arguments/Options, Progress-Bars (tqdm), Config-File (.ini/.toml), Logging und Colorized-Output.' },
      { id: 'py6', icon: '&#128013;', name: 'Test Suite', desc: 'pytest', prompt: 'Baue eine Test-Suite: pytest-Fixtures, Parametrize, Mocking (unittest.mock), Coverage-Report, conftest.py, Markers und CI-Integration.' },
      { id: 'py7', icon: '&#128013;', name: 'Automation', desc: 'Task-Automatisierung', prompt: 'Erstelle Automation-Scripts: File-Watcher (watchdog), Batch-Processing, Email-Sending (smtplib), PDF-Generation (reportlab), und System-Monitoring.' },
      { id: 'py8', icon: '&#128013;', name: 'ML Pipeline', desc: 'Machine Learning', prompt: 'Baue eine ML-Pipeline: Data-Loading, Feature-Engineering, Train/Test-Split, Model-Training (sklearn), Evaluation-Metrics, Model-Serialization und Prediction-API.' },
      { id: 'py9', icon: '&#128013;', name: 'Django App', desc: 'Web Framework', prompt: 'Erstelle eine Django-App: Models, Views, Templates, URL-Config, Admin-Customization, Forms, Middleware, Signals und REST-Framework-Serializers.' },
      { id: 'py10', icon: '&#128013;', name: 'Bot Script', desc: 'Discord/Telegram Bot', prompt: 'Baue einen Chat-Bot: Command-Handler, Event-Listener, Role-Management, Scheduled-Messages, Database-Integration und Admin-Commands.' },
    ]
  },
  {
    id: 'react', icon: '&#9883;', name: 'React & Frontend',
    modules: [
      { id: 'rc1', icon: '&#9883;', name: 'Component Library', desc: 'UI-Komponenten', prompt: 'Erstelle eine React-Component-Library: Button, Input, Modal, Toast, Dropdown, Tabs, Card, Badge mit TypeScript, Storybook und Theme-Support.' },
      { id: 'rc2', icon: '&#9883;', name: 'State Management', desc: 'Zustand/Redux', prompt: 'Implementiere State-Management: Zustand-Store, Selectors, Actions, Middleware (Logging/Persist), DevTools-Integration und Optimistic-Updates.' },
      { id: 'rc3', icon: '&#9883;', name: 'Auth Flow', desc: 'Login/Register', prompt: 'Baue Auth-Flow in React: Login/Register-Forms, JWT-Token-Storage, Protected-Routes, Auth-Context, Refresh-Token-Logic und Social-Login-Buttons.' },
      { id: 'rc4', icon: '&#9883;', name: 'Data Fetching', desc: 'React Query', prompt: 'Implementiere Data-Fetching: React-Query/SWR, Custom-Hooks, Loading/Error-States, Pagination, Infinite-Scroll, Optimistic-Updates und Cache-Management.' },
      { id: 'rc5', icon: '&#9883;', name: 'Form Handling', desc: 'React Hook Form', prompt: 'Erstelle Form-Handling: React-Hook-Form, Zod-Validation, Dynamic-Fields, Multi-Step-Wizard, File-Upload, Custom-Inputs und Error-Display.' },
      { id: 'rc6', icon: '&#9883;', name: 'Routing', desc: 'React Router', prompt: 'Implementiere Routing: React-Router v6, Nested-Routes, Layout-Routes, Protected-Routes, URL-Parameters, Search-Params und Breadcrumb-Auto-Generation.' },
      { id: 'rc7', icon: '&#9883;', name: 'Dashboard Layout', desc: 'Admin Panel', prompt: 'Baue ein Dashboard-Layout: Sidebar-Navigation, Header mit User-Menu, Content-Area, Responsive-Collapse, Theme-Toggle und Notification-Bell.' },
      { id: 'rc8', icon: '&#9883;', name: 'Hook Collection', desc: 'Custom Hooks', prompt: 'Erstelle Custom-Hooks: useLocalStorage, useDebounce, useMediaQuery, useIntersectionObserver, useCopyToClipboard, useKeyPress und useOnClickOutside.' },
      { id: 'rc9', icon: '&#9883;', name: 'Animation', desc: 'Framer Motion', prompt: 'Implementiere Animationen: Page-Transitions, List-Reorder, Gesture-Animations, Scroll-Linked, Shared-Layout und Exit-Animations mit Framer-Motion.' },
      { id: 'rc10', icon: '&#9883;', name: 'Testing', desc: 'React Testing', prompt: 'Schreibe React-Tests: Component-Tests (Testing-Library), Hook-Tests, Snapshot-Tests, User-Event-Simulation, MSW für API-Mocking und E2E mit Playwright.' },
    ]
  },
  {
    id: 'next', icon: '&#9883;', name: 'Next.js & Full-Stack',
    modules: [
      { id: 'nx1', icon: '&#9883;', name: 'App Router', desc: 'Next.js 14+', prompt: 'Erstelle Next.js App-Router-Projekt: Layout/Page-Struktur, Loading/Error-UI, Route-Groups, Parallel-Routes, Intercepting-Routes und Metadata-API.' },
      { id: 'nx2', icon: '&#9883;', name: 'Server Components', desc: 'RSC', prompt: 'Implementiere React-Server-Components: Data-Fetching in Server-Components, Client-Component-Boundary, Streaming, Suspense und Server-Actions.' },
      { id: 'nx3', icon: '&#9883;', name: 'API Routes', desc: 'Route Handlers', prompt: 'Baue API-Route-Handlers: GET/POST/PUT/DELETE, Request-Validation (Zod), Error-Responses, Auth-Middleware, Rate-Limiting und Edge-Runtime.' },
      { id: 'nx4', icon: '&#9883;', name: 'Auth.js', desc: 'NextAuth', prompt: 'Implementiere Auth.js (NextAuth): Provider-Config (GitHub/Google/Credentials), Session-Management, Protected-Pages, Middleware-Auth und Database-Adapter.' },
      { id: 'nx5', icon: '&#9883;', name: 'Prisma ORM', desc: 'Database Layer', prompt: 'Erstelle Prisma-Setup: Schema-Design, Migrations, CRUD-Operations, Relations, Middleware, Seeding und Type-Safe-Client mit Next.js-Integration.' },
      { id: 'nx6', icon: '&#9883;', name: 'Deployment', desc: 'Vercel/Docker', prompt: 'Konfiguriere Next.js-Deployment: Vercel-Config, Environment-Variables, Edge-Functions, ISR/SSG/SSR-Strategie, Custom-Domain und Preview-Deployments.' },
      { id: 'nx7', icon: '&#9883;', name: 'Middleware', desc: 'Edge Middleware', prompt: 'Erstelle Next.js-Middleware: Geo-Routing, A/B-Testing, Auth-Check, Redirects, Rate-Limiting, Bot-Detection und Custom-Headers.' },
      { id: 'nx8', icon: '&#9883;', name: 'Image Optimization', desc: 'next/image', prompt: 'Implementiere Image-Optimization: next/image-Component, Blur-Placeholder, Remote-Images, Responsive-Sizes, Lazy-Loading und WebP/AVIF-Auto-Format.' },
    ]
  },
  {
    id: 'legal', icon: '&#128220;', name: 'Legal & Compliance',
    modules: [
      { id: 'le1', icon: '&#128220;', name: 'Datenschutz', desc: 'DSGVO Texte', prompt: 'Erstelle DSGVO-konforme Datenschutzerklärung: Verantwortlicher, Datenerhebung, Rechtsgrundlagen, Betroffenenrechte, Cookies, Drittanbieter und Aufbewahrungsfristen.' },
      { id: 'le2', icon: '&#128220;', name: 'Impressum', desc: 'Legal Notice', prompt: 'Generiere Impressum: Pflichtangaben nach TMG §5, Kontaktdaten, USt-IdNr, Berufsbezeichnung, Verantwortlicher i.S.d. §55 RStV und Streitschlichtung.' },
      { id: 'le3', icon: '&#128220;', name: 'AGB', desc: 'Geschäftsbedingungen', prompt: 'Erstelle AGB: Geltungsbereich, Vertragsschluss, Preise/Zahlung, Lieferung, Widerrufsrecht, Gewährleistung, Haftung und Schlussbestimmungen.' },
      { id: 'le4', icon: '&#128220;', name: 'Cookie Banner', desc: 'Cookie Consent', prompt: 'Baue einen Cookie-Consent-Banner: Kategorien (Notwendig/Statistik/Marketing), Granular-Auswahl, Accept/Reject-All, Einstellungen-Modal und Cookie-Policy-Link.' },
      { id: 'le5', icon: '&#128220;', name: 'Terms of Service', desc: 'Nutzungsbedingungen', prompt: 'Erstelle Nutzungsbedingungen für SaaS: Account-Erstellung, Acceptable-Use, Intellectual-Property, Limitation-of-Liability, Termination und Governing-Law.' },
      { id: 'le6', icon: '&#128220;', name: 'NDA Template', desc: 'Geheimhaltung', prompt: 'Schreibe eine NDA-Vorlage: Definition vertraulicher Informationen, Pflichten, Ausnahmen, Laufzeit, Vertragsstrafen und Gerichtsstand.' },
    ]
  },
  {
    id: 'web3', icon: '&#128279;', name: 'Web3 & Blockchain',
    modules: [
      { id: 'w31', icon: '&#128279;', name: 'Smart Contract', desc: 'Solidity', prompt: 'Erstelle einen Smart-Contract (Solidity): ERC-20/721 Token, Access-Control, Events, Modifier, Gas-Optimization, Testing (Hardhat) und Security-Best-Practices.' },
      { id: 'w32', icon: '&#128279;', name: 'Web3 Frontend', desc: 'dApp UI', prompt: 'Baue ein Web3-Frontend: Wallet-Connect (MetaMask/WalletConnect), Contract-Interaction (ethers.js), Transaction-Handling, Chain-Switching und Balance-Display.' },
      { id: 'w33', icon: '&#128279;', name: 'NFT Marketplace', desc: 'Digital Collectibles', prompt: 'Erstelle NFT-Marketplace-Konzept: Mint-Page, Gallery-View, Auction-System, Royalty-Setup, Metadata-Standard (ERC-721), IPFS-Storage und Floor-Price-Tracker.' },
      { id: 'w34', icon: '&#128279;', name: 'DeFi Dashboard', desc: 'DeFi Analytics', prompt: 'Baue ein DeFi-Dashboard: Pool-Liquidity-Anzeige, APY-Calculator, Impermanent-Loss-Rechner, Portfolio-Tracker, Gas-Tracker und Token-Swap-UI.' },
      { id: 'w35', icon: '&#128279;', name: 'DAO Governance', desc: 'Abstimmung', prompt: 'Erstelle DAO-Governance-UI: Proposal-Erstellung, Voting-Interface, Delegation, Quorum-Display, Execution-Queue und Treasury-Übersicht.' },
      { id: 'w36', icon: '&#128279;', name: 'Token Economics', desc: 'Tokenomics', prompt: 'Definiere Tokenomics: Supply-Distribution (vesting/release), Utility-Beschreibung, Staking-Mechanics, Burn-Mechanism, Governance-Power und Simulation-Tabelle.' },
    ]
  },
  {
    id: 'writing', icon: '&#128214;', name: 'Kreatives Schreiben',
    modules: [
      { id: 'wr1', icon: '&#128214;', name: 'Blog-Outline', desc: 'Artikel planen', prompt: 'Erstelle einen Blog-Outline: Title-Optionen (5), Intro-Hook, H2-Struktur (5-7), Key-Points pro Section, Internal-Links, CTA und Meta-Description.' },
      { id: 'wr2', icon: '&#128214;', name: 'Brand Voice', desc: 'Markenstimme', prompt: 'Definiere eine Brand-Voice: Tone (formal/casual), Vocabulary-Do/Dont, Example-Paragraphs, Adjektive die die Marke beschreiben, und Kommunikations-Leitfaden.' },
      { id: 'wr3', icon: '&#128214;', name: 'Case Study', desc: 'Fallstudie', prompt: 'Schreibe eine Case-Study: Client-Background, Challenge, Solution (mit Details), Results (Zahlen), Testimonial-Quote, Key-Takeaways und Visual-Elements.' },
      { id: 'wr4', icon: '&#128214;', name: 'White Paper', desc: 'Expertenpapier', prompt: 'Erstelle ein White-Paper-Outline: Executive-Summary, Problem-Definition, Market-Analysis, Proposed-Solution, Technical-Details, ROI und Call-to-Action.' },
      { id: 'wr5', icon: '&#128214;', name: 'Press Release', desc: 'Pressemitteilung', prompt: 'Schreibe eine Pressemitteilung: Headline (wer/was/wann), Lead-Paragraph (5W+H), Body (Details+Zitate), Boilerplate, Kontaktinfo und Multimedia-Assets.' },
      { id: 'wr6', icon: '&#128214;', name: 'Interview Fragen', desc: 'Interview vorbereiten', prompt: 'Erstelle Interview-Fragen: Eisbrecher, Background, Deep-Dive-Fragen, Follow-Up-Varianten, Controversial-Question, Closing und Rapid-Fire-Round.' },
      { id: 'wr7', icon: '&#128214;', name: 'Speech/Rede', desc: 'Rede schreiben', prompt: 'Schreibe eine Rede: Attention-Grabbing-Opening, Personal-Story, 3 Kernpunkte mit Beispielen, Audience-Engagement, Memorable-Quote und Call-to-Action-Schluss.' },
      { id: 'wr8', icon: '&#128214;', name: 'Microcopy', desc: 'UX-Texte', prompt: 'Erstelle Microcopy: Button-Labels, Empty-States, Error-Messages, Onboarding-Tooltips, Confirmation-Dialogs, Loading-Messages und Success-States.' },
    ]
  },
];

// Total: 344 Templates in 17 Kategorien
// R100: Diese Datei darf NICHT gelöscht werden!
if(typeof window!=='undefined'){window.DKZ_PROMPT_TEMPLATES=DKZ_PROMPT_TEMPLATES;}