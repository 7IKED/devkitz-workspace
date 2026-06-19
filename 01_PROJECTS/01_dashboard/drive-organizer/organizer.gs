/**
 * ═══════════════════════════════════════════════════════════════
 *  🧹 DRIVE AUFRÄUMER – Jeff Su 5x99 System
 *  
 *  Universell für JEDEN Google Drive Account nutzbar!
 *  
 *  ANLEITUNG:
 *  1. Geh zu → https://script.google.com
 *  2. Neues Projekt → diesen Code rein
 *  3. Zuerst "phase1_AUFRÄUMEN" ausführen
 *     → Erstellt Ordner-Struktur
 *     → Fegt ALLES aus der Root in [HELLO WORLD]
 *     → Dein Drive ist SOFORT sauber!
 *  4. Dann "phase2_SORTIEREN" ausführen
 *     → Sortiert aus [HELLO WORLD] in die richtigen Ordner
 *  5. Optional: "phase3_INVENTAR" für eine Übersicht als Sheet
 *
 *  ⚠️ Beim ersten Mal: Google-Berechtigung erteilen!
 *  🔒 [DEEPKEEP] wird NIE angefasst!
 * ═══════════════════════════════════════════════════════════════
 */

// ═══════════════════════════════════════════════════════════════
//  PHASE 1: AUFRÄUMEN – Ordner bauen + alles in [HELLO WORLD]
// ═══════════════════════════════════════════════════════════════

function phase1_AUFRÄUMEN() {
    const root = DriveApp.getRootFolder();

    // 1. Ordner-Struktur erstellen
    Logger.log("📁 Erstelle Jeff Su 5x99 Ordner-Struktur...");

    const folders = {
        "00_INBOX":     [],
        "01_PROJECTS":  ["01_active","02_templates","03_shared","99_archived"],
        "02_RESEARCH":  ["01_ai_agents","02_tutorials","03_frameworks","04_blueprints","05_notebooklm","99_archived"],
        "03_MEDIA":     ["01_images","02_video","03_audio","04_ai_generated","99_archived"],
        "04_SYSTEM":    ["01_configs","02_scripts","03_exports","04_backups","99_archived"],
        "99_ARCHIVE":   [],
    };

    for (let main in folders) {
        let f = _getOrCreate(root, main);
        folders[main].forEach(sub => _getOrCreate(f, sub));
        Logger.log("  ✅ " + main + " (" + folders[main].length + " Unterordner)");
    }

    let deepkeep = _getOrCreate(root, "[DEEPKEEP]");
    let helloworld = _getOrCreate(root, "[HELLO WORLD]");
    let workspace = _getOrCreate(root, "[WORKSPACE]");
    _getOrCreate(workspace, "[NOTE]");
    _getOrCreate(workspace, "[TO-DO]");
    _getOrCreate(workspace, "[ARCHIVE]");
    Logger.log("  🔒 [DEEPKEEP] erstellt (wird NIE angefasst)");
    Logger.log("  📦 [HELLO WORLD] erstellt (Sammel-Ordner)");
    Logger.log("  💻 [WORKSPACE] erstellt ([NOTE], [TO-DO], [ARCHIVE])");

    // 2. Liste der EIGENEN Ordner (die NICHT verschoben werden)
    const KEEP_NAMES = [
        "00_INBOX", "01_PROJECTS", "02_RESEARCH", "03_MEDIA", "04_SYSTEM", "99_ARCHIVE",
        "[DEEPKEEP]", "[HELLO WORLD]", "[WORKSPACE]"
    ];

    // 3. ALLE losen Dateien aus Root → [HELLO WORLD]
    Logger.log("\n🧹 Fege alle losen Dateien in [HELLO WORLD]...");
    let fileCount = 0;
    let files = root.getFiles();
    while (files.hasNext()) {
        let file = files.next();
        if (file.getMimeType() === "application/vnd.google-apps.script") continue;
        file.moveTo(helloworld);
        fileCount++;
        if (fileCount % 50 === 0) Logger.log("  📄 " + fileCount + " Dateien verschoben...");
    }
    Logger.log("  📄 " + fileCount + " Dateien → [HELLO WORLD]");

    // 4. ALLE losen Ordner aus Root → [HELLO WORLD]
    Logger.log("\n🧹 Fege alle losen Ordner in [HELLO WORLD]...");
    let folderCount = 0;
    let rootFolders = root.getFolders();
    while (rootFolders.hasNext()) {
        let folder = rootFolders.next();
        let name = folder.getName();
        if (KEEP_NAMES.includes(name)) continue;
        folder.moveTo(helloworld);
        folderCount++;
        Logger.log("  📂 " + name + " → [HELLO WORLD]");
    }

    Logger.log("\n═══════════════════════════════════════");
    Logger.log("🎉 PHASE 1 FERTIG!");
    Logger.log("📄 " + fileCount + " Dateien aufgeräumt");
    Logger.log("📂 " + folderCount + " Ordner aufgeräumt");
    Logger.log("🧊 Dein Drive hat jetzt nur noch 6 saubere Ordner!");
    Logger.log("👉 Führe jetzt 'phase2_SORTIEREN' aus!");
}

// ═══════════════════════════════════════════════════════════════
//  PHASE 2: SORTIEREN – aus [HELLO WORLD] in richtige Ordner
// ═══════════════════════════════════════════════════════════════

function phase2_SORTIEREN() {
    const root = DriveApp.getRootFolder();
    const hw = _getOrCreate(root, "[HELLO WORLD]");

    Logger.log("🔄 Sortiere Dateien aus [HELLO WORLD]...\n");

    let moved = 0, kept = 0;
    let files = hw.getFiles();

    while (files.hasNext()) {
        let file = files.next();
        let name = file.getName();
        let mime = file.getMimeType();

        let targetPath = _bestimmOrdner(name, mime);

        if (targetPath) {
            let target = _navigiere(root, targetPath);
            file.moveTo(target);
            moved++;
            Logger.log("✅ " + name + " → " + targetPath);
        } else {
            kept++;
            // Bleibt in [HELLO WORLD]
        }
    }

    // Auch Unterordner in [HELLO WORLD] durchgehen
    let subfolders = hw.getFolders();
    let foldersMoved = 0;
    while (subfolders.hasNext()) {
        let folder = subfolders.next();
        let name = folder.getName();
        let targetPath = _bestimmOrdnerFürOrdner(name);

        if (targetPath) {
            let target = _navigiere(root, targetPath);
            folder.moveTo(target);
            foldersMoved++;
            Logger.log("📂 " + name + " → " + targetPath);
        }
    }

    Logger.log("\n═══════════════════════════════════════");
    Logger.log("🎉 PHASE 2 FERTIG!");
    Logger.log("📄 " + moved + " Dateien sortiert");
    Logger.log("📂 " + foldersMoved + " Ordner sortiert");
    Logger.log("❓ " + kept + " Dateien bleiben in [HELLO WORLD] (manuell prüfen)");
}

// ═══════════════════════════════════════════════════════════════
//  PHASE 3: INVENTAR – Sheet mit allen Dateien + Zielordner
// ═══════════════════════════════════════════════════════════════

function phase3_INVENTAR() {
    Logger.log("📋 Erstelle Drive-Inventar als Google Sheet...");

    let ss = SpreadsheetApp.create("📋 Drive Inventar – " + new Date().toLocaleDateString("de-DE"));
    let sheet = ss.getActiveSheet();
    sheet.setName("Inventar");

    // Header
    sheet.appendRow(["#", "Dateiname", "Typ", "Größe", "Erstellt", "Aktueller Ordner", "Ziel-Ordner", "Status"]);
    sheet.getRange(1, 1, 1, 8).setFontWeight("bold").setBackground("#1a1a2e").setFontColor("#00ff88");

    let count = 0;
    // B08-FIX: Set für besuchte Ordner-IDs (verhindert Endlosrekursion bei Shortcuts)
    let visitedIds = new Set();
    const MAX_SCAN_DEPTH = 20;

    function scanFolder(folder, pfad, depth) {
        // B08-FIX: Rekursionsschutz
        var folderId = folder.getId();
        if (visitedIds.has(folderId)) {
            Logger.log("⚠️ Zirkuläre Referenz übersprungen: " + pfad);
            return;
        }
        if (depth > MAX_SCAN_DEPTH) {
            Logger.log("⚠️ Max Tiefe erreicht (" + MAX_SCAN_DEPTH + "): " + pfad);
            return;
        }
        visitedIds.add(folderId);

        let files = folder.getFiles();
        while (files.hasNext()) {
            let f = files.next();
            let name = f.getName();
            let mime = f.getMimeType();
            let size = f.getSize();
            let created = f.getDateCreated();
            let ziel = _bestimmOrdner(name, mime) || "❓ [HELLO WORLD]";
            let status = pfad === ziel ? "✅ Richtig" : "🔄 Verschieben";

            count++;
            sheet.appendRow([
                count,
                name,
                _mimeKurz(mime),
                _formatSize(size),
                created.toISOString().split("T")[0],
                pfad || "Root",
                ziel,
                status
            ]);
        }

        let subs = folder.getFolders();
        while (subs.hasNext()) {
            let sub = subs.next();
            scanFolder(sub, pfad + "/" + sub.getName(), depth + 1);
        }
    }

    // Alle 6 Hauptordner scannen
    let root = DriveApp.getRootFolder();
    ["01_PROJECTS", "02_RESEARCH", "03_MEDIA", "04_SYSTEM", "[HELLO WORLD]"].forEach(name => {
        try {
            let f = root.getFoldersByName(name);
            if (f.hasNext()) scanFolder(f.next(), name, 0);
        } catch (e) {
            Logger.log("⚠️ Fehler beim Scannen von " + name + ": " + e.message);
        }
    });

    // Auch Root-Files
    let rootFiles = root.getFiles();
    while (rootFiles.hasNext()) {
        let f = rootFiles.next();
        if (f.getMimeType() === "application/vnd.google-apps.script") continue;
        count++;
        let ziel = _bestimmOrdner(f.getName(), f.getMimeType()) || "❓ [HELLO WORLD]";
        sheet.appendRow([count, f.getName(), _mimeKurz(f.getMimeType()), _formatSize(f.getSize()),
            f.getDateCreated().toISOString().split("T")[0], "Root", ziel, "🔄 Verschieben"]);
    }

    sheet.autoResizeColumns(1, 8);

    Logger.log("✅ Inventar: " + ss.getUrl());
    Logger.log("📊 " + count + " Dateien katalogisiert");
    Logger.log("🔍 " + visitedIds.size + " Ordner gescannt (keine Duplikate)");
}

// ═══════════════════════════════════════════════════════════════
//  SORTIER-REGELN
// ═══════════════════════════════════════════════════════════════

function _bestimmOrdner(name, mime) {
    let n = name.toLowerCase();

    // ── NAME-BASIERT (höhere Priorität) ──

    // Projects
    if (/dashboard|panel|hub|app|builder|engine/.test(n)) return "01_PROJECTS/01_active";
    if (/template|vorlage|boilerplate/.test(n)) return "01_PROJECTS/02_templates";
    if (/shared|team|collab/.test(n)) return "01_PROJECTS/03_shared";

    // Research
    if (/blueprint|blaupause|architektur/.test(n)) return "02_RESEARCH/04_blueprints";
    if (/notebooklm|notebook|mind.?map/.test(n)) return "02_RESEARCH/05_notebooklm";
    if (/agent|agenten|agentic|bmad|ralph|jarvis/.test(n)) return "02_RESEARCH/01_ai_agents";
    if (/tutorial|guide|anleitung|how.?to|kurs/.test(n)) return "02_RESEARCH/02_tutorials";
    if (/framework|iceberg|apache|docker|n8n|mcp/.test(n)) return "02_RESEARCH/03_frameworks";
    if (/prompt|skill|workflow|playbook/.test(n)) return "02_RESEARCH/01_ai_agents";
    if (/gemini|gpt|claude|grok|mistral|deepseek|openai|anthropic/.test(n)) return "02_RESEARCH/01_ai_agents";
    if (/blog|post|artikel|newsletter|medium/.test(n)) return "02_RESEARCH";
    if (/research|analyse|studie|paper|review/.test(n)) return "02_RESEARCH";
    if (/dkz|devkitz|ökosystem|ecosystem/.test(n)) return "02_RESEARCH/04_blueprints";
    if (/ki|ai|llm|model|neural|machine.?learn/.test(n)) return "02_RESEARCH/01_ai_agents";

    // Media
    if (/image|bild|foto|photo|screenshot|logo|icon/.test(n)) return "03_MEDIA/01_images";
    if (/video|film|clip|recording|screen/.test(n)) return "03_MEDIA/02_video";
    if (/audio|podcast|mp3|musik|song|sound/.test(n)) return "03_MEDIA/03_audio";
    if (/generated|generate|sora|dall|flux|midjourney/.test(n)) return "03_MEDIA/04_ai_generated";

    // System
    if (/backup|export|dump|archive/.test(n)) return "04_SYSTEM/04_backups";
    if (/config|setting|env|\.json|\.yaml/.test(n)) return "04_SYSTEM/01_configs";
    if (/script|code|api|function|\.js|\.py|\.go/.test(n)) return "04_SYSTEM/02_scripts";
    if (/csv|report|export|tabelle/.test(n)) return "04_SYSTEM/03_exports";

    // ── MIME-TYPE BASIERT ──

    // Google-eigene Formate
    if (mime === "application/vnd.google-apps.document") return "02_RESEARCH";
    if (mime === "application/vnd.google-apps.spreadsheet") return "04_SYSTEM/03_exports";
    if (mime === "application/vnd.google-apps.presentation") return "02_RESEARCH";
    if (mime === "application/vnd.google-apps.form") return "04_SYSTEM/03_exports";
    if (mime === "application/vnd.google-apps.drawing") return "03_MEDIA/01_images";
    if (mime === "application/vnd.google-apps.map") return "02_RESEARCH";
    if (mime === "application/vnd.google-apps.site") return "01_PROJECTS/01_active";

    // Standard-Formate
    if (mime === "application/pdf") return "02_RESEARCH";
    if (/^image\//.test(mime)) return "03_MEDIA/01_images";
    if (/^video\//.test(mime)) return "03_MEDIA/02_video";
    if (/^audio\//.test(mime)) return "03_MEDIA/03_audio";
    if (mime === "text/plain" || mime === "text/markdown") return "02_RESEARCH";
    if (mime === "text/html") return "02_RESEARCH";
    if (mime === "text/csv") return "04_SYSTEM/03_exports";
    if (/json|javascript|typescript/.test(mime)) return "04_SYSTEM/02_scripts";
    if (/zip|rar|gzip|tar|7z/.test(mime)) return "04_SYSTEM/04_backups";
    if (/msword|wordprocess|openxml/.test(mime)) return "02_RESEARCH";
    if (/excel|spreadsheet/.test(mime)) return "04_SYSTEM/03_exports";
    if (/powerpoint|presentation/.test(mime)) return "02_RESEARCH";

    // Kein Match → bleibt in [HELLO WORLD]
    return null;
}

function _bestimmOrdnerFürOrdner(name) {
    let n = name.toLowerCase();
    if (/project|app|code|build|dev/.test(n)) return "01_PROJECTS/01_active";
    if (/research|doc|wiki|blog|note/.test(n)) return "02_RESEARCH";
    if (/image|photo|media|video|audio/.test(n)) return "03_MEDIA";
    if (/backup|config|system|setup|install/.test(n)) return "04_SYSTEM";
    if (/template|vorlage/.test(n)) return "01_PROJECTS/02_templates";
    if (/agent|ai|ki|gpt|llm/.test(n)) return "02_RESEARCH/01_ai_agents";
    return null; // Bleibt in HELLO WORLD
}

// ═══════════════════════════════════════════════════════════════
//  HILFSFUNKTIONEN
// ═══════════════════════════════════════════════════════════════

function _getOrCreate(parent, name) {
    let f = parent.getFoldersByName(name);
    return f.hasNext() ? f.next() : parent.createFolder(name);
}

function _navigiere(root, path) {
    let parts = path.split("/");
    let current = root;
    for (let p of parts) {
        try {
            current = _getOrCreate(current, p);
        } catch (e) {
            // B07-FIX: Statt silent fail → loggen und letzten bekannten Ordner zurückgeben
            Logger.log("⚠️ Ordner konnte nicht erstellt/gefunden werden: " + p + " in Pfad " + path + " – Fehler: " + e.message);
            return current; // Letzten bekannten Ordner als Fallback
        }
    }
    return current;
}

function _mimeKurz(mime) {
    const map = {
        "application/vnd.google-apps.document": "📄 Google Doc",
        "application/vnd.google-apps.spreadsheet": "📊 Google Sheet",
        "application/vnd.google-apps.presentation": "📽️ Google Slides",
        "application/vnd.google-apps.form": "📝 Google Form",
        "application/vnd.google-apps.drawing": "🎨 Google Drawing",
        "application/vnd.google-apps.folder": "📁 Ordner",
        "application/pdf": "📕 PDF",
        "text/plain": "📃 Text",
        "text/html": "🌐 HTML",
        "text/csv": "📊 CSV",
        "application/json": "⚙️ JSON"
    };
    if (map[mime]) return map[mime];
    if (/^image/.test(mime)) return "🖼️ Bild";
    if (/^video/.test(mime)) return "🎬 Video";
    if (/^audio/.test(mime)) return "🎵 Audio";
    if (/zip|rar/.test(mime)) return "📦 Archiv";
    return mime;
}

function _formatSize(bytes) {
    if (bytes === 0) return "—";
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / 1048576).toFixed(1) + " MB";
}
