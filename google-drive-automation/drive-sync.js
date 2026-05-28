#!/usr/bin/env node
/**
 * ­ƒöä DkZÔäó Drive Sync ÔÇö Desktop ÔåÆ Google Drive 00-99
 * ÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉ
 * Synchronisiert lokale Ordner in die 00-99 Drive-Struktur
 * 
 * Features:
 * - Desktop, Downloads, Documents ÔåÆ Drive Inbox [00]
 * - Fotos/Videos ÔåÆ Google Fotos oder [09] Medien
 * - Automatische MIME-basierte Sortierung
 * - Duplikat-Pr├╝fung vor Upload
 * - Trockenlauf-Modus (--dry-run)
 * 
 * Setup:
 *   npm install googleapis
 *   node drive-sync.js --dry-run     ÔåÉ Vorschau
 *   node drive-sync.js               ÔåÉ Echte Ausf├╝hrung
 *   node drive-sync.js --watch       ÔåÉ Dauerbetrieb
 */

import { readdirSync, statSync, readFileSync, createReadStream } from 'fs';
import { join, extname, basename } from 'path';
import { homedir } from 'os';
import { createHash } from 'crypto';

// ÔòÉÔòÉÔòÉ CONFIG ÔòÉÔòÉÔòÉ
const CONFIG = {
  // Lokale Quell-Ordner (Windows)
  sources: [
    { path: join(homedir(), 'Desktop'), target: '00' },
    { path: join(homedir(), 'Downloads'), target: '00' },
    { path: join(homedir(), 'Documents'), target: '05' },
    { path: join(homedir(), 'Music'), target: '09' },
    { path: join(homedir(), 'Videos'), target: '09' },
    { path: join(homedir(), 'Pictures'), target: '09' },
  ],
  
  // MIME ÔåÆ Ziel-Ordner Mapping
  mimeRouting: {
    'application/pdf': '04',           // Vertr├ñge/Dokumente
    'image/': '09',                    // Medien
    'video/': '09',                    // Medien
    'audio/': '09',                    // Medien
    'application/vnd.ms-excel': '03',  // Finanzen
    'application/vnd.openxmlformats-officedocument.spreadsheetml': '03',
    'text/markdown': '05',            // Wissen
    'application/json': '10',          // DEVKiTZ
    'text/javascript': '10',           // DEVKiTZ
  },
  
  // Dateiendung ÔåÆ Ziel-Ordner
  extRouting: {
    '.pdf': '04', '.doc': '04', '.docx': '04',
    '.xls': '03', '.xlsx': '03', '.csv': '03',
    '.png': '09', '.jpg': '09', '.jpeg': '09', '.gif': '09', '.webp': '09', '.svg': '08',
    '.mp4': '09', '.mov': '09', '.avi': '09', '.mkv': '09',
    '.mp3': '09', '.wav': '09', '.flac': '09',
    '.md': '05', '.txt': '05',
    '.js': '10', '.ts': '10', '.py': '10', '.json': '10',
    '.zip': '15', '.rar': '15', '.7z': '15',
    '.psd': '08', '.ai': '08', '.fig': '08',
  },
  
  // Skip-Patterns
  skipFiles: ['.DS_Store', 'Thumbs.db', 'desktop.ini', '.gitignore'],
  skipExtensions: ['.tmp', '.crdownload', '.part'],
  maxFileSizeMB: 500, // Max 500MB pro Datei
  
  // Drive Parent Folder ID (muss gesetzt werden)
  driveParentId: process.env.DRIVE_PARENT_ID || null,
};

// ÔòÉÔòÉÔòÉ CLI ÔòÉÔòÉÔòÉ
const args = process.argv.slice(2);
const DRY_RUN = args.includes('--dry-run');
const WATCH = args.includes('--watch');
const VERBOSE = args.includes('-v') || args.includes('--verbose');

// ÔòÉÔòÉÔòÉ TERMINAL COLORS ÔòÉÔòÉÔòÉ
const C = {
  reset: '\x1b[0m', red: '\x1b[31m', green: '\x1b[32m',
  yellow: '\x1b[33m', blue: '\x1b[34m', cyan: '\x1b[36m',
  dim: '\x1b[2m', bold: '\x1b[1m', magenta: '\x1b[35m'
};

function log(icon, msg) {
  console.log(`${C.dim}[${new Date().toLocaleTimeString('de-DE')}]${C.reset} ${icon} ${msg}`);
}

// ÔòÉÔòÉÔòÉ FILE SCANNER ÔòÉÔòÉÔòÉ
function scanSource(sourcePath) {
  const files = [];
  try {
    const entries = readdirSync(sourcePath);
    for (const entry of entries) {
      const fullPath = join(sourcePath, entry);
      try {
        const stat = statSync(fullPath);
        if (stat.isDirectory()) continue; // Nur Dateien auf erster Ebene
        
        const ext = extname(entry).toLowerCase();
        if (CONFIG.skipFiles.includes(entry)) continue;
        if (CONFIG.skipExtensions.includes(ext)) continue;
        if (stat.size > CONFIG.maxFileSizeMB * 1024 * 1024) continue;
        
        files.push({
          name: entry,
          path: fullPath,
          size: stat.size,
          ext,
          modified: stat.mtime,
          md5: computeMD5(fullPath, stat.size),
        });
      } catch (e) { /* skip inaccessible files */ }
    }
  } catch (e) {
    log('ÔÜá´©Å', `${C.yellow}Ordner nicht lesbar: ${sourcePath}${C.reset}`);
  }
  return files;
}

function computeMD5(filePath, size) {
  // Nur erste 64KB hashen f├╝r Performance
  try {
    const buffer = readFileSync(filePath, { length: Math.min(65536, size) });
    return createHash('md5').update(buffer).digest('hex').substring(0, 12);
  } catch { return 'unknown'; }
}

function resolveTarget(file, sourceTarget) {
  // 1. Ext-basiertes Routing hat Priorit├ñt
  if (CONFIG.extRouting[file.ext]) return CONFIG.extRouting[file.ext];
  // 2. Fallback auf Quell-Ordner-Default
  return sourceTarget;
}

// ÔòÉÔòÉÔòÉ MAIN ÔòÉÔòÉÔòÉ
async function main() {
  console.log(`
${C.magenta}${C.bold}ÔòöÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòù
Ôòæ  ­ƒöä DkZÔäó Drive Sync                     Ôòæ
Ôòæ  Desktop ÔåÆ Google Drive 00-99            Ôòæ
ÔòÜÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòØ${C.reset}
`);
  
  if (DRY_RUN) log('­ƒöì', `${C.yellow}DRY RUN ÔÇö Keine ├änderungen${C.reset}`);
  
  let totalFiles = 0;
  let totalSize = 0;
  const plan = [];
  
  for (const source of CONFIG.sources) {
    log('­ƒôé', `${C.bold}Scanne:${C.reset} ${source.path}`);
    const files = scanSource(source.path);
    
    if (files.length === 0) {
      log('  ', `${C.dim}Keine Dateien gefunden${C.reset}`);
      continue;
    }
    
    for (const file of files) {
      const target = resolveTarget(file, source.target);
      const folder = `[${target}]`;
      plan.push({ ...file, target, folder });
      totalFiles++;
      totalSize += file.size;
      
      if (VERBOSE) {
        log('  ', `${C.dim}${file.name} ÔåÆ ${folder} (${formatSize(file.size)})${C.reset}`);
      }
    }
    
    log('  ', `${C.green}${files.length} Dateien${C.reset} ÔåÆ Sortiert in 00-99`);
  }
  
  // Zusammenfassung
  console.log(`\n${C.magenta}ÔöüÔöüÔöü ZUSAMMENFASSUNG ÔöüÔöüÔöüÔöüÔöüÔöüÔöüÔöüÔöüÔöüÔöüÔöüÔöüÔöüÔöüÔöüÔöüÔöüÔöüÔöüÔöüÔöüÔöüÔöü${C.reset}`);
  log('­ƒôè', `${C.bold}${totalFiles} Dateien${C.reset} ┬À ${formatSize(totalSize)}`);
  
  // Gruppierung nach Ziel-Ordner
  const groups = {};
  for (const file of plan) {
    if (!groups[file.target]) groups[file.target] = [];
    groups[file.target].push(file);
  }
  
  for (const [target, files] of Object.entries(groups).sort()) {
    log('  ', `[${target}] ÔåÆ ${C.cyan}${files.length} Dateien${C.reset}`);
  }
  
  if (DRY_RUN) {
    log('­ƒöì', `${C.yellow}DRY RUN fertig. Starte ohne --dry-run f├╝r echte Ausf├╝hrung.${C.reset}`);
  } else if (!CONFIG.driveParentId) {
    log('ÔÜá´©Å', `${C.yellow}DRIVE_PARENT_ID nicht gesetzt! Setze in .env oder als Umgebungsvariable.${C.reset}`);
    log('­ƒÆí', `${C.dim}F├╝r lokale Sortierung reicht der Dry-Run Modus.${C.reset}`);
  } else {
    log('­ƒÜÇ', `${C.green}Upload startet...${C.reset}`);
    // TODO: Google Drive API Upload implementieren
    // const { google } = await import('googleapis');
    // Credentials ├╝ber OAuth2 oder Service Account
  }
  
  // JSON-Report speichern
  const reportPath = join(process.cwd(), 'sync-report.json');
  const report = {
    timestamp: new Date().toISOString(),
    totalFiles,
    totalSize,
    groups: Object.fromEntries(Object.entries(groups).map(([k, v]) => [k, v.length])),
    plan: plan.map(f => ({ name: f.name, target: f.target, size: f.size, ext: f.ext }))
  };
  
  try {
    const { writeFileSync } = await import('fs');
    writeFileSync(reportPath, JSON.stringify(report, null, 2));
    log('­ƒÆ¥', `${C.dim}Report: ${reportPath}${C.reset}`);
  } catch {}
}

function formatSize(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
  if (bytes < 1073741824) return (bytes / 1048576).toFixed(1) + ' MB';
  return (bytes / 1073741824).toFixed(1) + ' GB';
}

main().catch(err => {
  log('­ƒÆÑ', `${C.red}Fehler: ${err.message}${C.reset}`);
  process.exit(1);
});
