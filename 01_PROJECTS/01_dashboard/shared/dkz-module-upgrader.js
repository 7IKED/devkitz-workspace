const fs = require('fs');
const path = require('path');

const DASHBOARD_DIR = path.join(__dirname, '..');
const FEATURES_FILE = path.join(DASHBOARD_DIR, 'features.json');

console.log('🚀 Starte DkZ Module Upgrader...');

if (!fs.existsSync(FEATURES_FILE)) {
    console.error('❌ features.json nicht gefunden!');
    process.exit(1);
}

const featuresData = JSON.parse(fs.readFileSync(FEATURES_FILE, 'utf-8'));
let upgradedCount = 0;
let errorCount = 0;

featuresData.modules.forEach(mod => {
    if (!mod.has_index || mod.status !== 'active') return;

    const indexPath = path.join(DASHBOARD_DIR, mod.path, 'index.html');
    if (!fs.existsSync(indexPath)) return;

    try {
        let html = fs.readFileSync(indexPath, 'utf-8');
        let modified = false;

        // 1. DkZ Design System & Responsive Viewport
        if (!html.includes('dkz-theme.css')) {
            html = html.replace('</head>', '    <link rel="stylesheet" href="../../shared/dkz-theme.css">\n</head>');
            modified = true;
        }
        if (!html.includes('name="viewport"')) {
            html = html.replace('<head>', '<head>\n    <meta name="viewport" content="width=device-width, initial-scale=1.0">');
            modified = true;
        }

        // 8. dkz-debug.js für esc() Funktion (XSS-Schutz)
        if (!html.includes('dkz-debug.js')) {
            html = html.replace('</body>', '    <script src="../../shared/dkz-debug.js"></script>\n</body>');
            modified = true;
        }

        // 7. Background Blobs Animationen -> Hyperreal Background
        if (html.includes('dkz-bg-blobs')) {
            // Remove the old simple blobs
            html = html.replace(/<div class="dkz-bg-blobs"><\/div>\n?/g, '');
            modified = true;
        }

        // Hyperreal Injektion
        if (!html.includes('dkz-hyperreal-bg.js')) {
            html = html.replace('</body>', '    <script src="../../shared/dkz-hyperreal-bg.js"></script>\n</body>');
            modified = true;
        }

        // 5. Toast-Benachrichtigungen
        if (!html.includes('dkz-toast-container')) {
            html = html.replace('</body>', '    <div id="dkz-toast-container"></div>\n</body>');
            modified = true;
        }

        if (modified) {
            fs.writeFileSync(indexPath, html, 'utf-8');
            upgradedCount++;
            console.log(`✅ Modul aktualisiert: ${mod.name}`);
        }

    } catch (e) {
        console.error(`❌ Fehler bei Modul ${mod.name}:`, e.message);
        errorCount++;
    }
});

console.log('-----------------------------------');
console.log(`🎉 Upgrader fertig!`);
console.log(`📈 Module aktualisiert: ${upgradedCount}`);
console.log(`⚠️ Fehler: ${errorCount}`);
console.log('-----------------------------------');
