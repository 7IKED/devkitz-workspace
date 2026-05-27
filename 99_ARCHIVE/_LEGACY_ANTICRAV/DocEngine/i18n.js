// ============================================================
// DEVKiTZ DocEngine — i18n (EN/DE Translation Module)
// ============================================================

const I18N = {
    en: {
        // Sidebar
        'nav.overview': 'Overview',
        'nav.dashboard': 'Dashboard',
        'nav.management': 'Management',
        'nav.scraper': 'Scraper',
        'nav.results': 'Results',
        'nav.wiki': 'Wiki Browser',
        'nav.search': 'Search',
        'nav.tools': 'Tools',
        'nav.search_engine': 'Search Engine',
        'nav.exports': 'Export Hub',
        'nav.integrations': 'Integrations',
        'nav.cse': 'CSE Manager',
        'nav.publisher': 'Publisher',

        // Header
        'header.online': 'Systems Online',

        // Dashboard
        'dash.title': 'System Overview',
        'dash.subtitle': 'All scraping sessions and data at a glance',
        'dash.total_scraped': 'Total Scraped',
        'dash.pages': 'Pages',
        'dash.images': 'Images Found',
        'dash.videos': 'Videos Found',
        'dash.exports': 'Exports',
        'dash.recent': 'Recent Activity',
        'dash.quick_actions': 'Quick Actions',
        'dash.start_scrape': 'Start New Scrape',
        'dash.search_data': 'Search Data',
        'dash.export_all': 'Export All',

        // Scraper
        'scraper.title': 'HTML Scraper',
        'scraper.subtitle': 'Enter URLs to scrape deeply — content, images, videos, and site structure',
        'scraper.url_label': 'Target URLs (one per line)',
        'scraper.url_placeholder': 'https://example.com\nhttps://docs.example.com/guide\nhttps://blog.example.com',
        'scraper.url_count': 'URLs',
        'scraper.options': 'Scrape Options',
        'scraper.extract_images': 'Extract & compress images',
        'scraper.extract_yt': 'Detect YouTube embeds',
        'scraper.extract_menu': 'Auto-detect navigation menus',
        'scraper.deep_links': 'Follow internal links (depth: 1)',
        'scraper.start': '🚀 Start Scraping',
        'scraper.stop': '⏹ Stop',
        'scraper.clear': '🗑️ Clear',
        'scraper.progress': 'Scraping Progress',
        'scraper.log': 'Activity Log',
        'scraper.engine': 'Engine',
        'scraper.engine_fetch': 'fetch() + CORS Proxy',
        'scraper.engine_proxy': 'Node.js Proxy',
        'scraper.engine_paste': 'Paste HTML',
        'scraper.paste_label': 'Paste raw HTML here',

        // Results
        'results.title': 'Scrape Results',
        'results.subtitle': 'Browse, filter, and export your scraped data',
        'results.filter_all': 'All',
        'results.filter_text': 'Text',
        'results.filter_img': 'Images',
        'results.filter_vid': 'Videos',
        'results.items': 'items',
        'results.view_data': 'View Data',
        'results.folder_tree': 'Folder Tree',

        // Search
        'search.title': 'Tag Search Engine',
        'search.subtitle': 'DuckDB-powered search across all scraped content',
        'search.placeholder': 'Search tags, titles, content...',
        'search.powered_by': 'Powered by DuckDB-WASM',
        'search.no_results': 'No results found',
        'search.results_for': 'Results for',

        // Exports
        'exports.title': 'Export Hub',
        'exports.subtitle': 'Download your data in multiple formats',
        'exports.json': 'JSON Export',
        'exports.csv': 'CSV Export',
        'exports.md': 'Markdown Files',
        'exports.zip': 'ZIP Bundle',
        'exports.sheets': 'Google Sheets',
        'exports.ini': 'Folder .ini',
        'exports.download': 'Download',
        'exports.generating': 'Generating...',

        // CSE
        'cse.title': 'Google CSE Manager',
        'cse.subtitle': 'Configure and manage Custom Search Engine variants',
        'cse.api_key': 'CSE API Key',
        'cse.cx_id': 'Search Engine ID (CX)',
        'cse.save': 'Save Configuration',
        'cse.variants': 'Output Variants',
        'cse.var_topbar': 'Top Bar',
        'cse.var_center': 'Center Input',
        'cse.var_popup': 'Popup Results',
        'cse.var_images': 'Image Grid',
        'cse.var_list': 'List View',
        'cse.var_youtube': 'YouTube Carousel',
        'cse.preview': 'Preview',
        'cse.search_btn': 'Search',

        // Publisher
        'pub.title': 'Publishing Hub',
        'pub.subtitle': 'Connect and publish to external platforms',
        'pub.blogger': 'Blogger',
        'pub.github': 'GitHub',
        'pub.notion': 'Notion',
        'pub.drive': 'Google Drive',
        'pub.ssh': 'SSH Upload',
        'pub.connect': 'Connect',
        'pub.connected': 'Connected',
        'pub.disconnected': 'Not Connected',
        'pub.publish': 'Publish',
        'pub.select_blog': 'Select target blog',
        'pub.ssh_host': 'Host',
        'pub.ssh_port': 'Port',
        'pub.ssh_user': 'Username',
        'pub.ssh_path': 'Remote Path',
        'pub.upload': 'Upload',

        // Tooltips
        'tip.cse': 'Google Programmable Search (CSE) lets you create custom search experiences. You need a CSE API key from console.cloud.google.com.',
        'tip.engine': 'The scraper tries fetch() first with a CORS proxy. If that fails, it falls back to a local Node.js proxy, or you can paste HTML directly.',
        'tip.duckdb': 'DuckDB-WASM runs an analytical database directly in your browser. It indexes all scraped content for fast tag-based searching.',
        'tip.shortcuts': 'Keyboard shortcuts: Ctrl+K = Search, Ctrl+Enter = Start Scrape, Ctrl+E = Export, Esc = Close modal',
        'tip.sheets': 'Google Sheets sync requires a Google API key with Sheets API enabled. Data is pushed to a new sheet per scrape session.',
        'tip.ini': 'The .ini file describes the folder tree structure. PowerShell can use it to auto-create directories: Get-Content dirs.ini | ForEach-Object { mkdir $_ }',
        'tip.images': 'Images are downloaded, compressed via Canvas API, and stored in the Archive/Pic/ directory organized by source domain.',
        'tip.menu': 'Menu extraction scans <nav>, <ul>, and sidebar elements with links to reconstruct the site\'s navigation hierarchy as a folder tree.',

        // Common
        'common.save': 'Save',
        'common.cancel': 'Cancel',
        'common.close': 'Close',
        'common.delete': 'Delete',
        'common.copy': 'Copy',
        'common.copied': 'Copied!',
        'common.loading': 'Loading...',
        'common.error': 'Error',
        'common.success': 'Success',
        'common.warning': 'Warning',
    },

    de: {
        // Sidebar
        'nav.overview': 'Übersicht',
        'nav.dashboard': 'Dashboard',
        'nav.management': 'Verwaltung',
        'nav.scraper': 'Scraper',
        'nav.results': 'Ergebnisse',
        'nav.wiki': 'Wiki Browser',
        'nav.search': 'Suche',
        'nav.tools': 'Werkzeuge',
        'nav.search_engine': 'Suchmaschine',
        'nav.exports': 'Export Hub',
        'nav.integrations': 'Integrationen',
        'nav.cse': 'CSE Manager',
        'nav.publisher': 'Publisher',

        // Header
        'header.online': 'Systeme Online',

        // Dashboard
        'dash.title': 'System-Übersicht',
        'dash.subtitle': 'Alle Scraping-Sitzungen und Daten auf einen Blick',
        'dash.total_scraped': 'Gesamt gescrapt',
        'dash.pages': 'Seiten',
        'dash.images': 'Bilder gefunden',
        'dash.videos': 'Videos gefunden',
        'dash.exports': 'Exporte',
        'dash.recent': 'Letzte Aktivität',
        'dash.quick_actions': 'Schnellaktionen',
        'dash.start_scrape': 'Neuen Scrape starten',
        'dash.search_data': 'Daten durchsuchen',
        'dash.export_all': 'Alles exportieren',

        // Scraper
        'scraper.title': 'HTML Scraper',
        'scraper.subtitle': 'URLs eintragen und tief scrapen — Inhalte, Bilder, Videos und Seitenstruktur',
        'scraper.url_label': 'Ziel-URLs (eine pro Zeile)',
        'scraper.url_placeholder': 'https://example.com\nhttps://docs.example.com/guide\nhttps://blog.example.com',
        'scraper.url_count': 'URLs',
        'scraper.options': 'Scrape-Optionen',
        'scraper.extract_images': 'Bilder extrahieren & komprimieren',
        'scraper.extract_yt': 'YouTube-Embeds erkennen',
        'scraper.extract_menu': 'Navigationsmenüs automatisch erkennen',
        'scraper.deep_links': 'Interne Links folgen (Tiefe: 1)',
        'scraper.start': '🚀 Scraping starten',
        'scraper.stop': '⏹ Stopp',
        'scraper.clear': '🗑️ Löschen',
        'scraper.progress': 'Scraping-Fortschritt',
        'scraper.log': 'Aktivitätsprotokoll',
        'scraper.engine': 'Engine',
        'scraper.engine_fetch': 'fetch() + CORS Proxy',
        'scraper.engine_proxy': 'Node.js Proxy',
        'scraper.engine_paste': 'HTML einfügen',
        'scraper.paste_label': 'Rohes HTML hier einfügen',

        // Results
        'results.title': 'Scrape-Ergebnisse',
        'results.subtitle': 'Gescrapte Daten durchsuchen, filtern und exportieren',
        'results.filter_all': 'Alle',
        'results.filter_text': 'Text',
        'results.filter_img': 'Bilder',
        'results.filter_vid': 'Videos',
        'results.items': 'Einträge',
        'results.view_data': 'Daten anzeigen',
        'results.folder_tree': 'Ordner-Baum',

        // Search
        'search.title': 'Tag-Suchmaschine',
        'search.subtitle': 'DuckDB-gestützte Suche über alle gescrapten Inhalte',
        'search.placeholder': 'Tags, Titel, Inhalte durchsuchen...',
        'search.powered_by': 'Powered by DuckDB-WASM',
        'search.no_results': 'Keine Ergebnisse',
        'search.results_for': 'Ergebnisse für',

        // Exports
        'exports.title': 'Export Hub',
        'exports.subtitle': 'Daten in verschiedenen Formaten herunterladen',
        'exports.json': 'JSON Export',
        'exports.csv': 'CSV Export',
        'exports.md': 'Markdown-Dateien',
        'exports.zip': 'ZIP-Paket',
        'exports.sheets': 'Google Sheets',
        'exports.ini': 'Ordner .ini',
        'exports.download': 'Herunterladen',
        'exports.generating': 'Wird generiert...',

        // CSE
        'cse.title': 'Google CSE Manager',
        'cse.subtitle': 'Custom Search Engine Varianten konfigurieren und verwalten',
        'cse.api_key': 'CSE API-Schlüssel',
        'cse.cx_id': 'Suchmaschinen-ID (CX)',
        'cse.save': 'Konfiguration speichern',
        'cse.variants': 'Ausgabevarianten',
        'cse.var_topbar': 'Top-Leiste',
        'cse.var_center': 'Zentrierte Eingabe',
        'cse.var_popup': 'Popup-Ergebnisse',
        'cse.var_images': 'Bildraster',
        'cse.var_list': 'Listenansicht',
        'cse.var_youtube': 'YouTube-Karussell',
        'cse.preview': 'Vorschau',
        'cse.search_btn': 'Suchen',

        // Publisher
        'pub.title': 'Publishing Hub',
        'pub.subtitle': 'Verbinden und auf externen Plattformen veröffentlichen',
        'pub.blogger': 'Blogger',
        'pub.github': 'GitHub',
        'pub.notion': 'Notion',
        'pub.drive': 'Google Drive',
        'pub.ssh': 'SSH Upload',
        'pub.connect': 'Verbinden',
        'pub.connected': 'Verbunden',
        'pub.disconnected': 'Nicht verbunden',
        'pub.publish': 'Veröffentlichen',
        'pub.select_blog': 'Ziel-Blog auswählen',
        'pub.ssh_host': 'Host',
        'pub.ssh_port': 'Port',
        'pub.ssh_user': 'Benutzer',
        'pub.ssh_path': 'Remote-Pfad',
        'pub.upload': 'Hochladen',

        // Tooltips
        'tip.cse': 'Google Programmable Search (CSE) ermöglicht eigene Sucherlebnisse. API-Schlüssel über console.cloud.google.com erstellen.',
        'tip.engine': 'Der Scraper versucht zuerst fetch() mit CORS Proxy. Bei Fehler fällt er auf den lokalen Node.js Proxy zurück, oder du kannst HTML direkt einfügen.',
        'tip.duckdb': 'DuckDB-WASM führt eine analytische Datenbank direkt im Browser aus. Alle gescrapten Inhalte werden für schnelle Tag-basierte Suche indexiert.',
        'tip.shortcuts': 'Tastenkürzel: Ctrl+K = Suche, Ctrl+Enter = Scrape starten, Ctrl+E = Export, Esc = Modal schließen',
        'tip.sheets': 'Google Sheets Sync benötigt einen Google API-Schlüssel mit Sheets API. Daten werden pro Scrape-Sitzung in ein neues Sheet geschrieben.',
        'tip.ini': 'Die .ini-Datei beschreibt die Ordnerstruktur. PowerShell kann sie nutzen: Get-Content dirs.ini | ForEach-Object { mkdir $_ }',
        'tip.images': 'Bilder werden heruntergeladen, via Canvas API komprimiert und im Ordner Archive/Pic/ nach Quell-Domain organisiert gespeichert.',
        'tip.menu': 'Die Menü-Extraktion scannt <nav>, <ul> und Sidebar-Elemente mit Links, um die Navigations-Hierarchie als Ordner-Baum zu rekonstruieren.',

        // Common
        'common.save': 'Speichern',
        'common.cancel': 'Abbrechen',
        'common.close': 'Schließen',
        'common.delete': 'Löschen',
        'common.copy': 'Kopieren',
        'common.copied': 'Kopiert!',
        'common.loading': 'Laden...',
        'common.error': 'Fehler',
        'common.success': 'Erfolg',
        'common.warning': 'Warnung',
    }
};

// Current language
let currentLang = localStorage.getItem('docengine-lang') || 'en';

/**
 * Get translation string
 * @param {string} key - dot-notation key
 * @returns {string}
 */
function t(key) {
    return I18N[currentLang]?.[key] || I18N['en']?.[key] || key;
}

/**
 * Set language and update all translatable elements
 * @param {string} lang - 'en' or 'de'
 */
function setLanguage(lang) {
    currentLang = lang;
    localStorage.setItem('docengine-lang', lang);
    applyTranslations();
}

/**
 * Apply translations to all [data-i18n] elements
 */
function applyTranslations() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        const val = t(key);
        if (el.tagName === 'INPUT' && el.type !== 'submit') {
            el.placeholder = val;
        } else {
            el.textContent = val;
        }
    });

    // Update tooltip contents
    document.querySelectorAll('[data-tip]').forEach(el => {
        const key = el.getAttribute('data-tip');
        const tipEl = el.querySelector('.tip-content');
        if (tipEl) tipEl.textContent = t(key);
    });
}

/**
 * Toggle between EN and DE
 */
function toggleLanguage() {
    setLanguage(currentLang === 'en' ? 'de' : 'en');
    return currentLang;
}
