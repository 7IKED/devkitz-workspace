#!/usr/bin/env node
/**
 * DkZ FileManager EXE v1.0
 * Desktop/Downloads sortieren, in DEEPKEEP archivieren, Drive-Sync
 * Baut als EXE: npx -y pkg dkz-filemanager.js --target win-x64
 */
const fs = require('fs');
const path = require('path');
const os = require('os');
const { execSync } = require('child_process');

const C = {
  r: '\x1b[0m', red: '\x1b[31m', grn: '\x1b[32m',
  yel: '\x1b[33m', cyn: '\x1b[36m', mag: '\x1b[35m',
  b: '\x1b[1m', d: '\x1b[2m'
};

const DEEPKEEP = 'C:\\DEVKiTZ\\[DEEPKEEP]';
const DESKTOP = path.join(os.homedir(), 'Desktop');
const DOWNLOADS = path.join(os.homedir(), 'Downloads');
const DRIVE = path.join(os.homedir(), 'Google Drive'); // Anpassbar
const TS = new Date().toISOString().slice(0, 10);

function log(m, t = 'i') {
  const i = { o: `${C.grn}✓`, e: `${C.red}✗`, w: `${C.yel}⚠`, i: `${C.cyn}ℹ` };
  console.log(`  ${i[t] || i.i} ${C.d}[${new Date().toLocaleTimeString()}]${C.r} ${m}`);
}

function ensureDir(d) { if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true }); }

function categorize(ext) {
  ext = ext.toLowerCase();
  if (/^\.(png|jpg|jpeg|gif|webp|svg|ico|bmp|tiff|heic)$/.test(ext)) return 'bilder';
  if (/^\.(mp4|webm|avi|mkv|mov|wmv|flv)$/.test(ext)) return 'videos';
  if (/^\.(mp3|wav|flac|ogg|m4a|aac|wma)$/.test(ext)) return 'musik';
  if (/^\.(pdf|doc|docx|txt|md|csv|xlsx|xls|pptx|odt)$/.test(ext)) return 'dokumente';
  if (/^\.(zip|rar|7z|tar|gz|bz2)$/.test(ext)) return 'archive';
  if (/^\.(exe|msi|bat|cmd|ps1|sh)$/.test(ext)) return 'installer';
  if (/^\.(js|py|html|css|json|yml|yaml|ts|jsx|tsx)$/.test(ext)) return 'code';
  return 'sonstige';
}

// === DESKTOP SORTIEREN ===
function sortDesktop() {
  console.log(`\n${C.cyn}${C.b}  ► DESKTOP → DEEPKEEP${C.r}`);
  const dest = path.join(DEEPKEEP, `desktop-${TS}`);
  ensureDir(dest);
  
  const files = fs.readdirSync(DESKTOP).filter(f => {
    const full = path.join(DESKTOP, f);
    return fs.statSync(full).isFile() && f !== 'desktop.ini';
  });
  
  log(`${files.length} Dateien auf Desktop gefunden`, 'i');
  const stats = {};
  
  files.forEach(f => {
    const ext = path.extname(f);
    const cat = categorize(ext);
    const catDir = path.join(dest, cat);
    ensureDir(catDir);
    
    const src = path.join(DESKTOP, f);
    const dst = path.join(catDir, f);
    fs.copyFileSync(src, dst);
    stats[cat] = (stats[cat] || 0) + 1;
  });
  
  Object.entries(stats).forEach(([cat, count]) => {
    log(`${cat}: ${count} Dateien archiviert`, 'o');
  });
  log(`Archiv: ${dest}`, 'o');
  return { dest, count: files.length };
}

// === DOWNLOADS SORTIEREN ===
function sortDownloads() {
  console.log(`\n${C.cyn}${C.b}  ► DOWNLOADS → DEEPKEEP${C.r}`);
  const dest = path.join(DEEPKEEP, `downloads-${TS}`);
  ensureDir(dest);
  
  const files = fs.readdirSync(DOWNLOADS).filter(f => {
    const full = path.join(DOWNLOADS, f);
    return fs.statSync(full).isFile();
  });
  
  log(`${files.length} Dateien in Downloads`, 'i');
  const stats = {};
  
  files.forEach(f => {
    const ext = path.extname(f);
    const cat = categorize(ext);
    const catDir = path.join(dest, cat);
    ensureDir(catDir);
    
    fs.copyFileSync(path.join(DOWNLOADS, f), path.join(catDir, f));
    stats[cat] = (stats[cat] || 0) + 1;
  });
  
  Object.entries(stats).forEach(([cat, count]) => {
    log(`${cat}: ${count} Dateien`, 'o');
  });
  return { dest, count: files.length };
}

// === DRIVE SYNC (Kopieren, erst löschen nach Verify) ===
function syncToDrive(srcDir) {
  console.log(`\n${C.cyn}${C.b}  ► DRIVE SYNC${C.r}`);
  
  // Google Drive Pfad suchen
  const drivePaths = [
    path.join(os.homedir(), 'Google Drive'),
    path.join(os.homedir(), 'GoogleDrive'),
    'G:\\My Drive',
    'G:\\Meine Ablage'
  ];
  
  const driveRoot = drivePaths.find(p => fs.existsSync(p));
  if (!driveRoot) {
    log('Google Drive nicht gefunden — überspringe Sync', 'w');
    log('Installiere Google Drive Desktop: https://dl.google.com/drive-file-stream/GoogleDriveSetup.exe', 'i');
    return false;
  }
  
  const driveDest = path.join(driveRoot, 'DEEPKEEP', path.basename(srcDir));
  ensureDir(driveDest);
  
  // Rekursiv kopieren
  function copyDir(src, dst) {
    ensureDir(dst);
    fs.readdirSync(src, { withFileTypes: true }).forEach(e => {
      const s = path.join(src, e.name);
      const d = path.join(dst, e.name);
      if (e.isDirectory()) copyDir(s, d);
      else fs.copyFileSync(s, d);
    });
  }
  
  copyDir(srcDir, driveDest);
  log(`Kopiert nach: ${driveDest}`, 'o');
  
  // Verify
  const srcCount = countFiles(srcDir);
  const dstCount = countFiles(driveDest);
  if (srcCount === dstCount) {
    log(`Verifiziert: ${srcCount} == ${dstCount} Dateien ✓`, 'o');
    return true;
  } else {
    log(`WARNUNG: ${srcCount} != ${dstCount} — Originale werden NICHT gelöscht`, 'e');
    return false;
  }
}

function countFiles(dir) {
  let count = 0;
  fs.readdirSync(dir, { withFileTypes: true }).forEach(e => {
    if (e.isDirectory()) count += countFiles(path.join(dir, e.name));
    else count++;
  });
  return count;
}

// === MAIN ===
console.log(`${C.mag}${C.b}
  ╔══════════════════════════════════════════╗
  ║  📁  DkZ™ FileManager v1.0              ║
  ║  Desktop + Downloads → DEEPKEEP → Drive  ║
  ╚══════════════════════════════════════════╝${C.r}`);

const args = process.argv.slice(2);
const doAll = args.includes('--all') || args.length === 0;

if (doAll || args.includes('--desktop')) {
  const r = sortDesktop();
  if (doAll || args.includes('--drive')) syncToDrive(r.dest);
}

if (doAll || args.includes('--downloads')) {
  const r = sortDownloads();
  if (doAll || args.includes('--drive')) syncToDrive(r.dest);
}

console.log(`\n  ${C.grn}${C.b}Fertig!${C.r} Originale bleiben erhalten bis Drive-Sync bestätigt.\n`);
console.log(`  ${C.d}Drücke eine Taste zum Beenden...${C.r}`);
if (process.stdin.setRawMode) { process.stdin.setRawMode(true); process.stdin.resume(); process.stdin.once('data', () => process.exit(0)); }
