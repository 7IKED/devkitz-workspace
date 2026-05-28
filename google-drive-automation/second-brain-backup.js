#!/usr/bin/env node
/**
 * ­ƒºá DkZÔäó Second Brain Backup
 * ÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉ
 * Bidirektionaler Sync: Lokal Ôåö Drive Ôåö Obsidian Ôåö Keep
 * 
 * Sichert:
 * - DEVKiTZ Workspace ÔåÆ Drive [10]
 * - Obsidian Vault ÔåÆ Drive [05]
 * - Research Notes ÔåÆ Drive [06]
 * - Keep Notizen ÔåÆ Drive [05]
 * - Artefakte ÔåÆ Drive [15]
 * 
 * Usage:
 *   node second-brain-backup.js --dry-run
 *   node second-brain-backup.js --full
 *   node second-brain-backup.js --incremental
 */

import { readdirSync, statSync, existsSync, writeFileSync, readFileSync } from 'fs';
import { join, relative, extname } from 'path';
import { homedir } from 'os';
import { createHash } from 'crypto';

const HOME = homedir();

// ÔòÉÔòÉÔòÉ BACKUP SOURCES ÔòÉÔòÉÔòÉ
const BACKUP_SOURCES = [
  {
    name: 'DEVKiTZ Core',
    icon: 'ÔÜí',
    path: 'C:\\DEVKiTZ',
    driveTarget: '10',
    include: ['*.md', '*.json', '*.js', '*.css', '*.html', '*.yml'],
    exclude: ['node_modules', '.git', 'dist', 'build', '99_ARCHIVE', '.next', '.cache'],
    maxDepth: 4,
  },
  {
    name: 'Obsidian Vault',
    icon: '­ƒºá',
    path: join(HOME, 'Documents', 'Obsidian'),
    driveTarget: '05',
    include: ['*.md', '*.canvas'],
    exclude: ['.obsidian', '.trash'],
    maxDepth: 5,
  },
  {
    name: 'Research Notes',
    icon: '­ƒö¼',
    path: 'C:\\DEVKiTZ\\02_RESEARCH',
    driveTarget: '06',
    include: ['*.md', '*.pdf', '*.json'],
    exclude: [],
    maxDepth: 3,
  },
  {
    name: 'Google Apps Scripts',
    icon: '­ƒôï',
    path: join(HOME, 'Documents', 'Google'),
    driveTarget: '07',
    include: ['*.gs', '*.js'],
    exclude: [],
    maxDepth: 1,
  },
  {
    name: 'Antigravity Brain',
    icon: '­ƒº¼',
    path: join(HOME, '.gemini', 'antigravity', 'knowledge'),
    driveTarget: '05',
    include: ['*.md', '*.json'],
    exclude: [],
    maxDepth: 3,
  },
];

// ÔòÉÔòÉÔòÉ STATE FILE ÔòÉÔòÉÔòÉ
const STATE_FILE = join('C:\\DEVKiTZ', '.brain-backup-state.json');

// ÔòÉÔòÉÔòÉ CLI ÔòÉÔòÉÔòÉ
const args = process.argv.slice(2);
const DRY_RUN = args.includes('--dry-run');
const FULL = args.includes('--full');

const C = {
  reset: '\x1b[0m', red: '\x1b[31m', green: '\x1b[32m',
  yellow: '\x1b[33m', blue: '\x1b[34m', cyan: '\x1b[36m',
  dim: '\x1b[2m', bold: '\x1b[1m', magenta: '\x1b[35m'
};

function log(icon, msg) {
  console.log(`${C.dim}[${new Date().toLocaleTimeString('de-DE')}]${C.reset} ${icon} ${msg}`);
}

// ÔòÉÔòÉÔòÉ FILE SCANNER ÔòÉÔòÉÔòÉ
function scanDir(dirPath, include, exclude, maxDepth, depth = 0) {
  const files = [];
  if (depth > maxDepth || !existsSync(dirPath)) return files;
  
  try {
    const entries = readdirSync(dirPath, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = join(dirPath, entry.name);
      
      if (exclude.some(e => entry.name === e || entry.name.startsWith('.'))) continue;
      
      if (entry.isDirectory()) {
        files.push(...scanDir(fullPath, include, exclude, maxDepth, depth + 1));
      } else {
        const ext = extname(entry.name).toLowerCase();
        const matchesInclude = include.length === 0 || include.some(p => {
          const pExt = p.replace('*', '');
          return ext === pExt;
        });
        
        if (matchesInclude) {
          try {
            const stat = statSync(fullPath);
            files.push({
              name: entry.name,
              path: fullPath,
              relativePath: relative(dirPath, fullPath),
              size: stat.size,
              modified: stat.mtime.toISOString(),
              ext
            });
          } catch {}
        }
      }
    }
  } catch {}
  return files;
}

// ÔòÉÔòÉÔòÉ INCREMENTAL CHECK ÔòÉÔòÉÔòÉ
function loadState() {
  try { return JSON.parse(readFileSync(STATE_FILE, 'utf-8')); }
  catch { return { lastRun: null, hashes: {} }; }
}

function saveState(state) {
  try { writeFileSync(STATE_FILE, JSON.stringify(state, null, 2)); }
  catch {}
}

function fileHash(filePath) {
  try {
    const content = readFileSync(filePath);
    return createHash('md5').update(content).digest('hex').substring(0, 16);
  } catch { return 'error'; }
}

// ÔòÉÔòÉÔòÉ MAIN ÔòÉÔòÉÔòÉ
async function main() {
  console.log(`
${C.magenta}${C.bold}ÔòöÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòù
Ôòæ  ­ƒºá DkZÔäó Second Brain Backup            Ôòæ
Ôòæ  Lokal ÔåÆ Drive ┬À Bidirektional           Ôòæ
ÔòÜÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòØ${C.reset}
`);
  
  const state = FULL ? { lastRun: null, hashes: {} } : loadState();
  const isIncremental = !FULL && state.lastRun;
  
  if (DRY_RUN) log('­ƒöì', `${C.yellow}DRY RUN ÔÇö Keine Uploads${C.reset}`);
  if (isIncremental) log('­ƒôà', `${C.dim}Inkrementell seit: ${state.lastRun}${C.reset}`);
  else log('­ƒöä', `${C.cyan}Voll-Backup${C.reset}`);
  
  let totalFiles = 0;
  let newFiles = 0;
  let changedFiles = 0;
  let totalSize = 0;
  const report = [];
  
  for (const source of BACKUP_SOURCES) {
    log(`${source.icon}`, `${C.bold}${source.name}${C.reset} ÔåÆ [${source.driveTarget}]`);
    
    if (!existsSync(source.path)) {
      log('  ', `${C.yellow}Pfad nicht gefunden: ${source.path}${C.reset}`);
      continue;
    }
    
    const files = scanDir(source.path, source.include, source.exclude, source.maxDepth);
    let sourceNew = 0, sourceChanged = 0;
    
    for (const file of files) {
      totalFiles++;
      totalSize += file.size;
      
      const hash = fileHash(file.path);
      const prevHash = state.hashes[file.path];
      
      if (!prevHash) {
        sourceNew++;
        newFiles++;
        state.hashes[file.path] = hash;
      } else if (prevHash !== hash) {
        sourceChanged++;
        changedFiles++;
        state.hashes[file.path] = hash;
      }
      // Else: unchanged, skip
    }
    
    log('  ', `${C.dim}${files.length} Dateien ┬À ${sourceNew} neu ┬À ${sourceChanged} ge├ñndert${C.reset}`);
    report.push({ source: source.name, target: source.driveTarget, total: files.length, new: sourceNew, changed: sourceChanged });
  }
  
  // Summary
  console.log(`\n${C.magenta}ÔöüÔöüÔöü BACKUP ZUSAMMENFASSUNG ÔöüÔöüÔöüÔöüÔöüÔöüÔöüÔöüÔöüÔöüÔöüÔöüÔöüÔöüÔöüÔöüÔöüÔöüÔöü${C.reset}`);
  log('­ƒôè', `${C.bold}${totalFiles}${C.reset} Dateien gescannt (${formatSize(totalSize)})`);
  log('­ƒåò', `${C.green}${newFiles}${C.reset} neue Dateien`);
  log('­ƒôØ', `${C.yellow}${changedFiles}${C.reset} ge├ñnderte Dateien`);
  log('ÔÅ¡´©Å', `${C.dim}${totalFiles - newFiles - changedFiles} unver├ñndert${C.reset}`);
  
  // Save state
  state.lastRun = new Date().toISOString();
  if (!DRY_RUN) {
    saveState(state);
    log('­ƒÆ¥', `${C.dim}State gespeichert: ${STATE_FILE}${C.reset}`);
  }
  
  // Report
  const reportPath = join('C:\\DEVKiTZ', 'brain-backup-report.json');
  writeFileSync(reportPath, JSON.stringify({ timestamp: state.lastRun, totalFiles, newFiles, changedFiles, totalSize, sources: report }, null, 2));
  log('­ƒôä', `${C.dim}Report: ${reportPath}${C.reset}`);
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
