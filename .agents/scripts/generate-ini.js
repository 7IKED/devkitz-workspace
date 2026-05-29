#!/usr/bin/env node
/**
 * CLOUDIA™ INI-Mindmap Generator
 * Generiert DIRECTORY.ini Dateien fuer alle DkZ Ordner
 * mit ASCII-Mindmap des Ordnerinhalts
 *
 * Usage: node .agents/scripts/generate-ini.js [verzeichnis]
 * Default: C:\DEVKiTZ\01_PROJECTS\
 *
 * @DKZ:TAG → [SYS:cloudia] [CAT:scripts] [LANG:js]
 * @version v1.00.0_01
 */

const fs = require('fs');
const path = require('path');

const DEFAULT_ROOT = path.resolve(__dirname, '../../01_PROJECTS');
const MAX_DEPTH = 3;
const IGNORE = [
    'node_modules', '.git', '.venv', '__pycache__', 'dist',
    '.next', '.cache', '.turbo', 'coverage', '.system_generated'
];

/**
 * Ordnerstruktur als Baum lesen
 */
function readTree(dir, depth = 0) {
    if (depth > MAX_DEPTH) return [];
    const items = [];

    try {
        const entries = fs.readdirSync(dir, { withFileTypes: true });
        const sorted = entries
            .filter(e => !IGNORE.includes(e.name) && !e.name.startsWith('.'))
            .sort((a, b) => {
                if (a.isDirectory() && !b.isDirectory()) return -1;
                if (!a.isDirectory() && b.isDirectory()) return 1;
                return a.name.localeCompare(b.name);
            });

        for (const entry of sorted) {
            const fullPath = path.join(dir, entry.name);
            if (entry.isDirectory()) {
                const children = readTree(fullPath, depth + 1);
                const stats = getDirStats(fullPath);
                items.push({
                    name: entry.name,
                    type: 'dir',
                    children,
                    fileCount: stats.files,
                    totalSize: stats.size
                });
            } else {
                try {
                    const stat = fs.statSync(fullPath);
                    items.push({
                        name: entry.name,
                        type: 'file',
                        size: stat.size
                    });
                } catch { /* skip */ }
            }
        }
    } catch (e) {
        console.warn(`  Warnung: ${dir}: ${e.message}`);
    }

    return items;
}

/**
 * Ordner-Statistiken
 */
function getDirStats(dir) {
    let files = 0;
    let size = 0;

    try {
        const entries = fs.readdirSync(dir, { withFileTypes: true });
        for (const entry of entries) {
            if (IGNORE.includes(entry.name)) continue;
            const fullPath = path.join(dir, entry.name);
            if (entry.isDirectory()) {
                const sub = getDirStats(fullPath);
                files += sub.files;
                size += sub.size;
            } else {
                try {
                    const stat = fs.statSync(fullPath);
                    files++;
                    size += stat.size;
                } catch { /* skip */ }
            }
        }
    } catch { /* skip */ }

    return { files, size };
}

/**
 * ASCII-Mindmap generieren
 */
function generateMindmap(items, prefix = '', isLast = true) {
    let result = '';

    items.forEach((item, idx) => {
        const last = idx === items.length - 1;
        const connector = last ? '└── ' : '├── ';
        const extension = last ? '    ' : '│   ';

        if (item.type === 'dir') {
            const info = item.fileCount > 0
                ? ` ; ${item.fileCount} Dateien, ${formatSize(item.totalSize)}`
                : '';
            result += `${prefix}${connector}${item.name}/${info}\n`;

            if (item.children && item.children.length > 0) {
                result += generateMindmap(item.children, prefix + extension, last);
            }
        } else {
            result += `${prefix}${connector}${item.name}\n`;
        }
    });

    return result;
}

/**
 * Groesse formatieren
 */
function formatSize(bytes) {
    if (!bytes || bytes === 0) return '0 B';
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return (bytes / Math.pow(1024, i)).toFixed(1) + ' ' + sizes[i];
}

/**
 * INI-Datei generieren
 */
function generateINI(dirName, dirPath, tree, stats) {
    const now = new Date().toISOString();
    const mindmap = generateMindmap(tree);

    return `; DEVKiTZ Ordner-Spiegel — Auto-generiert von CLOUDIA²
; Letzte Aktualisierung: ${now}
; Generator: generate-ini.js v1.00.0

[META]
ordner = ${dirName}
pfad = ${dirPath}
letzte_sync = ${now}
dateien_total = ${stats.files}
groesse_total = ${formatSize(stats.size)}

[MINDMAP]
${dirName}/
${mindmap}
[LINKS]
dashboard = https://devkitz.sites
github = https://github.com/7IKED/devkitz-workspace

; Ende der Datei — NICHT manuell bearbeiten
`;
}

// ═══════════════════════════════════════
// Main
// ═══════════════════════════════════════
function main() {
    const targetDir = process.argv[2] || DEFAULT_ROOT;
    const resolvedDir = path.resolve(targetDir);

    console.log('╔══════════════════════════════════════╗');
    console.log('║  CLOUDIA² INI-Mindmap Generator      ║');
    console.log('║  v1.00.0 — DEVKiTZ™                 ║');
    console.log('╚══════════════════════════════════════╝');
    console.log(`\nZielverzeichnis: ${resolvedDir}`);
    console.log(`Max Tiefe: ${MAX_DEPTH}`);
    console.log('');

    if (!fs.existsSync(resolvedDir)) {
        console.error(`FEHLER: Verzeichnis existiert nicht: ${resolvedDir}`);
        process.exit(1);
    }

    const entries = fs.readdirSync(resolvedDir, { withFileTypes: true });
    const dirs = entries.filter(e => e.isDirectory() && !IGNORE.includes(e.name) && !e.name.startsWith('.'));

    let generated = 0;

    for (const dir of dirs) {
        const fullPath = path.join(resolvedDir, dir.name);
        const iniPath = path.join(fullPath, 'DIRECTORY.ini');

        console.log(`📂 ${dir.name}/`);

        const tree = readTree(fullPath);
        const stats = getDirStats(fullPath);
        const ini = generateINI(dir.name, fullPath, tree, stats);

        fs.writeFileSync(iniPath, ini, 'utf-8');
        generated++;

        console.log(`   ✅ DIRECTORY.ini erstellt (${stats.files} Dateien, ${formatSize(stats.size)})`);
    }

    console.log(`\n═══════════════════════════════════════`);
    console.log(`✅ ${generated} DIRECTORY.ini Dateien generiert`);
    console.log(`═══════════════════════════════════════`);
}

main();
