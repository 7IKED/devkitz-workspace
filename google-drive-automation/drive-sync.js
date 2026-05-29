#!/usr/bin/env node
/**
 * DkZ™ Drive Sync v2.0 — Desktop → Google Drive 00-99
 * ═══════════════════════════════════════════════════════
 * Synchronisiert lokale Ordner in die 00-99 Drive-Struktur
 * 
 * EISERNE REGELN (von 777):
 * ──────────────────────────
 * R1: NIEMALS loeschen — nur verschieben/kopieren
 * R2: 07_NOTEPAD — ABSOLUT UNANTASTBAR
 * R3: [DEEPKEEP] — NUR KOPIEREN, nie verschieben
 * R4: "raw" Ordner — IMMER unangetastet
 * R5: Fotos → NUR in Fotos-Ordner
 * R6: Videos → NUR in Videos-Ordner
 * R7: Desktop — NUR ablegen, nie bestehende aendern
 * 
 * Setup:
 *   npm install googleapis
 *   node drive-sync.js --dry-run     → Vorschau
 *   node drive-sync.js               → Echte Ausfuehrung
 *   node drive-sync.js --watch       → Dauerbetrieb
 * 
 * @version 2.0.0
 */

import { readdirSync, statSync, readFileSync, existsSync } from 'fs';
import { join, extname, basename, dirname } from 'path';
import { homedir } from 'os';
import { createHash } from 'crypto';

// ═══ GESCHUETZTE PFADE (NIEMALS ANFASSEN!) ═══
const PROTECTED_PATHS = [
  '07_NOTEPAD', '07_notepad', 'NOTEPAD',
  '[DEEPKEEP]', 'DEEPKEEP', 'deepkeep',
  'raw'
];

// ═══ CONFIG ═══
const CONFIG = {
  sources: [
    { path: join(homedir(), 'Desktop'), target: '00', mode: 'scan-only' },  // Desktop: NUR scannen, NIE aendern
    { path: join(homedir(), 'Downloads'), target: '00', mode: 'move' },
    { path: join(homedir(), 'Documents'), target: '05', mode: 'scan-only' },
    { path: join(homedir(), 'Music'), target: '04-03', mode: 'copy' },      // Musik → Medien/Musik
    { path: join(homedir(), 'Videos'), target: '04-02', mode: 'copy' },     // Videos → NUR Video-Ordner
    { path: join(homedir(), 'Pictures'), target: '04-01', mode: 'copy' },   // Fotos → NUR Foto-Ordner
  ],
  
  // STRENGE Zuordnung: Fotos NUR zu Fotos, Videos NUR zu Videos
  extRouting: {
    // Fotos → 04-01 (Fotos)
    '.png': '04-01', '.jpg': '04-01', '.jpeg': '04-01', '.gif': '04-01',
    '.webp': '04-01', '.svg': '04-01', '.bmp': '04-01', '.heic': '04-01',
    '.tiff': '04-01', '.ico': '04-01', '.raw': '04-01',
    // Videos → 04-02 (Videos)
    '.mp4': '04-02', '.mov': '04-02', '.avi': '04-02', '.mkv': '04-02',
    '.webm': '04-02', '.flv': '04-02', '.wmv': '04-02', '.m4v': '04-02',
    // Musik → 04-03 (Musik)
    '.mp3': '04-03', '.wav': '04-03', '.flac': '04-03', '.aac': '04-03',
    '.ogg': '04-03', '.wma': '04-03', '.m4a': '04-03',
    // Dokumente → 05
    '.pdf': '05-01', '.doc': '05-05', '.docx': '05-05',
    '.xls': '05-04', '.xlsx': '05-04', '.csv': '05-04',
    '.ppt': '05-02', '.pptx': '05-02',
    '.md': '05-05', '.txt': '05-05',
    // Code → 10 (DEVKiTZ)
    '.js': '10', '.ts': '10', '.py': '10', '.json': '10', '.html': '10', '.css': '10',
    // Archive → 15
    '.zip': '15', '.rar': '15', '.7z': '15', '.tar': '15', '.gz': '15',
    // Design → 08
    '.psd': '08', '.ai': '08', '.fig': '08', '.sketch': '08',
  },
  
  skipFiles: ['.DS_Store', 'Thumbs.db', 'desktop.ini', '.gitignore', '.gitkeep'],
  skipExtensions: ['.tmp', '.crdownload', '.part', '.download'],
  maxFileSizeMB: 500,
  
  driveParentId: process.env.DRIVE_PARENT_ID || null,
};

// ═══ CLI ARGS ═══
const args = process.argv.slice(2);
const DRY_RUN = args.includes('--dry-run');
const WATCH = args.includes('--watch');
const VERBOSE = args.includes('-v') || args.includes('--verbose');

// ═══ TERMINAL COLORS ═══
const C = {
  reset: '\x1b[0m', red: '\x1b[31m', green: '\x1b[32m',
  yellow: '\x1b[33m', blue: '\x1b[34m', cyan: '\x1b[36m',
  dim: '\x1b[2m', bold: '\x1b[1m', magenta: '\x1b[35m'
};

function log(icon, msg) {
  console.log(`${C.dim}[${new Date().toLocaleTimeString('de-DE')}]${C.reset} ${icon} ${msg}`);
}

// ═══ SICHERHEITS-CHECKS ═══

function isProtectedPath(filePath) {
  var lower = filePath.toLowerCase();
  for (var i = 0; i < PROTECTED_PATHS.length; i++) {
    if (lower.indexOf(PROTECTED_PATHS[i].toLowerCase()) !== -1) return true;
  }
  return false;
}

function isDeepKeepPath(filePath) {
  var lower = filePath.toLowerCase();
  return lower.indexOf('deepkeep') !== -1;
}

function isRawPath(filePath) {
  // Prueft ob irgendwo im Pfad ein "raw" Ordner liegt
  var parts = filePath.replace(/\\/g, '/').split('/');
  return parts.some(function(p) { return p.toLowerCase() === 'raw'; });
}

// ═══ FILE SCANNER ═══
function scanSource(sourcePath) {
  var files = [];
  try {
    var entries = readdirSync(sourcePath);
    for (var entry of entries) {
      var fullPath = join(sourcePath, entry);
      try {
        var stat = statSync(fullPath);
        if (stat.isDirectory()) continue;
        
        var ext = extname(entry).toLowerCase();
        if (CONFIG.skipFiles.includes(entry)) continue;
        if (CONFIG.skipExtensions.includes(ext)) continue;
        if (stat.size > CONFIG.maxFileSizeMB * 1024 * 1024) continue;
        
        // SICHERHEITSCHECK
        if (isProtectedPath(fullPath)) {
          if (VERBOSE) log('🛡️', `${C.yellow}GESCHUETZT: ${entry}${C.reset}`);
          continue;
        }
        
        files.push({
          name: entry,
          path: fullPath,
          size: stat.size,
          ext: ext,
          modified: stat.mtime,
          md5: computeMD5(fullPath, stat.size),
        });
      } catch (e) { /* skip inaccessible files */ }
    }
  } catch (e) {
    log('⚠️', `${C.yellow}Ordner nicht lesbar: ${sourcePath}${C.reset}`);
  }
  return files;
}

function computeMD5(filePath, size) {
  try {
    var buffer = readFileSync(filePath, { length: Math.min(65536, size) });
    return createHash('md5').update(buffer).digest('hex').substring(0, 12);
  } catch(e) { return 'unknown'; }
}

function resolveTarget(file, sourceTarget) {
  // STRENG: Ext-basiertes Routing hat absolute Prioritaet
  if (CONFIG.extRouting[file.ext]) return CONFIG.extRouting[file.ext];
  return sourceTarget;
}

// ═══ MAIN ═══
async function main() {
  console.log(`
${C.magenta}${C.bold}╔══════════════════════════════════════════╗
║  DkZ™ Drive Sync v2.0                   ║
║  Desktop → Google Drive 00-99            ║
║  SICHERHEITS-MODUS: AKTIV               ║
╚══════════════════════════════════════════╝${C.reset}
`);
  
  // Safety Report
  log('🛡️', `${C.red}GESCHUETZT: 07_NOTEPAD, [DEEPKEEP], raw${C.reset}`);
  log('🛡️', `${C.red}DEEPKEEP: Nur KOPIEREN erlaubt${C.reset}`);
  log('🛡️', `${C.red}LOESCHEN: VERBOTEN${C.reset}`);
  console.log('');
  
  if (DRY_RUN) log('🔍', `${C.yellow}DRY RUN — Keine Aenderungen${C.reset}`);
  
  var totalFiles = 0;
  var totalSize = 0;
  var totalSkipped = 0;
  var plan = [];
  
  for (var source of CONFIG.sources) {
    log('📂', `${C.bold}Scanne:${C.reset} ${source.path} ${C.dim}(${source.mode})${C.reset}`);
    
    // Desktop: NIE Dateien aendern — nur scannen
    if (source.mode === 'scan-only') {
      var scanFiles = scanSource(source.path);
      log('  ', `${C.dim}${scanFiles.length} Dateien (nur Bericht, kein Move)${C.reset}`);
      for (var sf of scanFiles) {
        var scanTarget = resolveTarget(sf, source.target);
        plan.push({ ...sf, target: scanTarget, folder: '[' + scanTarget + ']', action: 'REPORT' });
      }
      totalFiles += scanFiles.length;
      continue;
    }
    
    var files = scanSource(source.path);
    
    if (files.length === 0) {
      log('  ', `${C.dim}Keine Dateien gefunden${C.reset}`);
      continue;
    }
    
    for (var file of files) {
      var target = resolveTarget(file, source.target);
      var folder = '[' + target + ']';
      
      // SICHERHEIT: Ziel 07 blockieren
      if (target.startsWith('07')) {
        log('🛡️', `${C.red}BLOCK: ${file.name} → 07_NOTEPAD verboten${C.reset}`);
        totalSkipped++;
        continue;
      }
      
      var action = source.mode === 'copy' ? 'COPY' : 'MOVE';
      
      // DEEPKEEP: Immer COPY
      if (isDeepKeepPath(file.path)) {
        action = 'COPY';
      }
      
      plan.push({ ...file, target: target, folder: folder, action: action });
      totalFiles++;
      totalSize += file.size;
      
      if (VERBOSE) {
        log('  ', `${C.dim}[${action}] ${file.name} → ${folder} (${formatSize(file.size)})${C.reset}`);
      }
    }
    
    log('  ', `${C.green}${files.length} Dateien${C.reset} → Sortiert in 00-99`);
  }
  
  // Zusammenfassung
  console.log(`\n${C.magenta}═══ ZUSAMMENFASSUNG ══════════════════════${C.reset}`);
  log('📊', `${C.bold}${totalFiles} Dateien${C.reset} · ${formatSize(totalSize)}`);
  if (totalSkipped > 0) {
    log('🛡️', `${C.yellow}${totalSkipped} uebersprungen (geschuetzt)${C.reset}`);
  }
  
  // Gruppierung nach Ziel
  var groups = {};
  for (var pf of plan) {
    if (!groups[pf.target]) groups[pf.target] = { files: [], actions: {} };
    groups[pf.target].files.push(pf);
    groups[pf.target].actions[pf.action] = (groups[pf.target].actions[pf.action] || 0) + 1;
  }
  
  for (var [gTarget, gData] of Object.entries(groups).sort()) {
    var actionStr = Object.entries(gData.actions).map(function(e) { return e[1] + 'x ' + e[0]; }).join(', ');
    log('  ', `[${gTarget}] → ${C.cyan}${gData.files.length} Dateien${C.reset} (${actionStr})`);
  }
  
  if (DRY_RUN) {
    log('🔍', `${C.yellow}DRY RUN fertig. Starte ohne --dry-run fuer echte Ausfuehrung.${C.reset}`);
  } else if (!CONFIG.driveParentId) {
    log('⚠️', `${C.yellow}DRIVE_PARENT_ID nicht gesetzt!${C.reset}`);
  } else {
    log('🚀', `${C.green}Upload startet...${C.reset}`);
    // TODO: Google Drive API Upload
  }
  
  // JSON-Report
  var reportPath = join(process.cwd(), 'sync-report.json');
  var report = {
    timestamp: new Date().toISOString(),
    version: '2.0.0',
    safetyMode: true,
    protectedFolders: PROTECTED_PATHS,
    totalFiles: totalFiles,
    totalSkipped: totalSkipped,
    totalSize: totalSize,
    groups: Object.fromEntries(Object.entries(groups).map(function(e) { return [e[0], e[1].files.length]; })),
    plan: plan.map(function(f) { return { name: f.name, target: f.target, size: f.size, ext: f.ext, action: f.action }; })
  };
  
  try {
    var { writeFileSync } = await import('fs');
    writeFileSync(reportPath, JSON.stringify(report, null, 2));
    log('💾', `${C.dim}Report: ${reportPath}${C.reset}`);
  } catch(e) {}
}

function formatSize(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
  if (bytes < 1073741824) return (bytes / 1048576).toFixed(1) + ' MB';
  return (bytes / 1073741824).toFixed(1) + ' GB';
}

main().catch(function(err) {
  log('💥', `${C.red}Fehler: ${err.message}${C.reset}`);
  process.exit(1);
});
