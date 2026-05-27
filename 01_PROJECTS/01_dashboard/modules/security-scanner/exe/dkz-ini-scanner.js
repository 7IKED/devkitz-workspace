#!/usr/bin/env node
/**
 * DkZ™ INI-Scanner + DuckDB Session v1.0
 * Liest alle ORDNER.ini, zeigt Inventar, speichert in DuckDB
 * Kategorisiert lose Dateien und erstellt ZIP-Backups für Drive
 */
const fs = require('fs');
const path = require('path');
const os = require('os');
const { execSync } = require('child_process');

const C = { r:'\x1b[0m',red:'\x1b[31m',grn:'\x1b[32m',yel:'\x1b[33m',cyn:'\x1b[36m',mag:'\x1b[35m',b:'\x1b[1m',d:'\x1b[2m' };

const DESKTOP = path.join(os.homedir(), 'Desktop');
const DOWNLOADS = path.join(os.homedir(), 'Downloads');
const DEEPKEEP = 'C:\\DEVKiTZ\\[DEEPKEEP]';
const TS = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
const DB_PATH = path.join(DEEPKEEP, 'session-db', `session_${TS}.json`);

function log(m, t='i') {
  const i = {o:`${C.grn}✓`,e:`${C.red}✗`,w:`${C.yel}⚠`,i:`${C.cyn}ℹ`};
  console.log(`  ${i[t]||i.i} ${C.d}[${new Date().toLocaleTimeString()}]${C.r} ${m}`);
}
function hr() { console.log(`  ${C.d}${'─'.repeat(56)}${C.r}`); }
function ensureDir(d) { if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true }); }

// === INI Parser ===
function parseIni(filePath) {
  if (!fs.existsSync(filePath)) return null;
  const content = fs.readFileSync(filePath, 'utf8');
  const result = { _path: filePath, _sections: {} };
  let section = 'default';
  content.split('\n').forEach(line => {
    line = line.trim();
    if (!line || line.startsWith(';') || line.startsWith('#')) return;
    const secMatch = line.match(/^\[(.+)\]$/);
    if (secMatch) { section = secMatch[1]; result._sections[section] = {}; return; }
    const kvMatch = line.match(/^([^=]+)=(.*)$/);
    if (kvMatch) {
      const key = kvMatch[1].trim();
      const val = kvMatch[2].trim();
      if (!result._sections[section]) result._sections[section] = {};
      result._sections[section][key] = val;
      result[key] = val;
    }
  });
  return result;
}

// === Dateien kategorisieren ===
function categorize(ext) {
  ext = ext.toLowerCase();
  if (/^\.(png|jpg|jpeg|gif|webp|svg|ico|bmp|heic)$/.test(ext)) return 'bilder';
  if (/^\.(mp4|webm|avi|mkv|mov)$/.test(ext)) return 'videos';
  if (/^\.(mp3|wav|flac|ogg|m4a|aac)$/.test(ext)) return 'musik';
  if (/^\.(pdf|doc|docx|txt|md|csv|xlsx|pptx|rtf)$/.test(ext)) return 'dokumente';
  if (/^\.(zip|rar|7z|tar|gz)$/.test(ext)) return 'archive';
  if (/^\.(exe|msi|bat|cmd|ps1)$/.test(ext)) return 'installer';
  if (/^\.(js|py|html|css|json|yml|ts|jsx)$/.test(ext)) return 'code';
  if (/^\.(url|lnk)$/.test(ext)) return 'shortcuts';
  if (/^\.(vsix)$/.test(ext)) return 'extensions';
  return 'sonstige';
}

// === Inventar erstellen ===
function scanDir(dirPath, label) {
  console.log(`\n${C.cyn}${C.b}  ► ${label}: ${dirPath}${C.r}`);
  hr();
  
  if (!fs.existsSync(dirPath)) { log('Ordner nicht gefunden', 'w'); return []; }
  
  const files = fs.readdirSync(dirPath, { withFileTypes: true })
    .filter(e => e.isFile() && e.name !== 'desktop.ini' && e.name !== 'ORDNER.ini');
  
  const inventory = {};
  const fileList = [];
  
  files.forEach(f => {
    const ext = path.extname(f.name);
    const cat = categorize(ext);
    const full = path.join(dirPath, f.name);
    const stat = fs.statSync(full);
    
    if (!inventory[cat]) inventory[cat] = { count: 0, sizeBytes: 0, files: [] };
    inventory[cat].count++;
    inventory[cat].sizeBytes += stat.size;
    inventory[cat].files.push(f.name);
    
    fileList.push({
      name: f.name,
      ext: ext,
      category: cat,
      sizeBytes: stat.size,
      sizeMB: Math.round(stat.size / 1024 / 1024 * 10) / 10,
      modified: stat.mtime.toISOString(),
      source: label
    });
  });
  
  // Anzeigen
  Object.entries(inventory).sort((a, b) => b[1].sizeBytes - a[1].sizeBytes).forEach(([cat, data]) => {
    const sizeMB = Math.round(data.sizeBytes / 1024 / 1024 * 10) / 10;
    const icon = { bilder:'🖼️', videos:'🎬', musik:'🎵', dokumente:'📄', archive:'📦',
                   installer:'💾', code:'💻', shortcuts:'🔗', extensions:'🧩', sonstige:'📎' }[cat] || '📎';
    log(`${icon} ${cat}: ${data.count} Dateien (${sizeMB} MB)`, 'o');
  });
  
  log(`${C.b}Gesamt: ${files.length} Dateien${C.r}`, 'i');
  return fileList;
}

// === ZIP erstellen für Drive ===
function createCategoryZips(fileList, source, destRoot) {
  console.log(`\n${C.mag}${C.b}  ► ZIP-Backup für Drive erstellen${C.r}`);
  hr();
  
  const byCategory = {};
  fileList.forEach(f => {
    if (f.category === 'shortcuts') return; // .url/.lnk nicht zippen
    if (!byCategory[f.category]) byCategory[f.category] = [];
    byCategory[f.category].push(f);
  });
  
  const results = [];
  const srcDir = source === 'DESKTOP' ? DESKTOP : DOWNLOADS;
  
  Object.entries(byCategory).forEach(([cat, files]) => {
    const zipName = `${source.toLowerCase()}_${cat}_${TS.slice(0, 10)}.zip`;
    const zipDir = path.join(destRoot, cat);
    const zipPath = path.join(zipDir, zipName);
    ensureDir(zipDir);
    
    // PowerShell Compress-Archive nutzen
    const filePaths = files.map(f => `"${path.join(srcDir, f.name)}"`).join(',');
    try {
      execSync(`powershell -Command "Compress-Archive -Path ${filePaths} -DestinationPath '${zipPath}' -Force"`, 
        { timeout: 120000, windowsHide: true });
      const zipSize = Math.round(fs.statSync(zipPath).size / 1024 / 1024 * 10) / 10;
      log(`📦 ${zipName} (${zipSize} MB, ${files.length} Dateien)`, 'o');
      results.push({ zip: zipName, category: cat, files: files.length, sizeMB: zipSize, path: zipPath });
    } catch (e) {
      log(`${cat}: ZIP fehlgeschlagen — ${e.message.slice(0, 80)}`, 'e');
    }
  });
  
  return results;
}

// === DuckDB-äquivalente JSON Session DB ===
function saveToDuckDB(allFiles, iniData, zipResults) {
  console.log(`\n${C.cyn}${C.b}  ► Session-DB speichern${C.r}`);
  hr();
  
  const dbDir = path.dirname(DB_PATH);
  ensureDir(dbDir);
  
  const session = {
    sessionId: `SES-${TS}`,
    timestamp: new Date().toISOString(),
    host: os.hostname(),
    user: os.userInfo().username,
    iniFiles: iniData,
    inventory: {
      totalFiles: allFiles.length,
      totalSizeMB: Math.round(allFiles.reduce((s, f) => s + f.sizeBytes, 0) / 1024 / 1024),
      byCategory: {},
      bySource: {}
    },
    zipBackups: zipResults,
    status: 'COMPLETE'
  };
  
  // Aggregation
  allFiles.forEach(f => {
    if (!session.inventory.byCategory[f.category]) 
      session.inventory.byCategory[f.category] = { count: 0, sizeMB: 0 };
    session.inventory.byCategory[f.category].count++;
    session.inventory.byCategory[f.category].sizeMB += f.sizeMB;
    
    if (!session.inventory.bySource[f.source])
      session.inventory.bySource[f.source] = { count: 0, sizeMB: 0 };
    session.inventory.bySource[f.source].count++;
    session.inventory.bySource[f.source].sizeMB += f.sizeMB;
  });
  
  // Runden
  Object.values(session.inventory.byCategory).forEach(v => v.sizeMB = Math.round(v.sizeMB * 10) / 10);
  Object.values(session.inventory.bySource).forEach(v => v.sizeMB = Math.round(v.sizeMB * 10) / 10);
  
  fs.writeFileSync(DB_PATH, JSON.stringify(session, null, 2), 'utf8');
  log(`Session DB: ${DB_PATH}`, 'o');
  log(`${allFiles.length} Dateien inventarisiert, ${zipResults.length} ZIPs erstellt`, 'o');
  
  return session;
}

// ═══ MAIN ═══
console.log(`${C.mag}${C.b}
  ╔══════════════════════════════════════════════════╗
  ║  📁  DkZ™ INI-Scanner + Session-DB v1.0          ║
  ║  Desktop + Downloads → Inventar → ZIP → Drive    ║
  ╚══════════════════════════════════════════════════╝${C.r}`);

// 1. INIs lesen
console.log(`\n${C.cyn}${C.b}  ► ORDNER.ini Dateien lesen${C.r}`);
hr();

const iniPaths = [
  path.join(DESKTOP, 'ORDNER.ini'),
  path.join(DOWNLOADS, 'ORDNER.ini'),
  'C:\\DEVKiTZ\\ORDNER.ini',
  'C:\\DEVKiTZ\\01_PROJECTS\\ORDNER.ini'
];

const iniData = [];
iniPaths.forEach(p => {
  const data = parseIni(p);
  if (data) {
    iniData.push(data);
    const typ = data._sections?.Ordner?.Typ || 'unbekannt';
    const dateien = data._sections?.Ordner?.Dateien || '?';
    const mb = data._sections?.Ordner?.GesamtMB || '?';
    log(`${typ}: ${dateien} Dateien, ${mb} MB — ${p}`, 'o');
  } else {
    log(`Nicht gefunden: ${p}`, 'w');
  }
});

// 2. Inventar scannen
const desktopFiles = scanDir(DESKTOP, 'DESKTOP');
const downloadFiles = scanDir(DOWNLOADS, 'DOWNLOADS');
const allFiles = [...desktopFiles, ...downloadFiles];

// 3. ZIPs erstellen für Drive-Backup
const driveBackupDir = path.join(DEEPKEEP, 'drive-backup', TS.slice(0, 10));
const zipResults = [];

if (process.argv.includes('--zip') || process.argv.includes('--all')) {
  zipResults.push(...createCategoryZips(desktopFiles, 'DESKTOP', driveBackupDir));
  zipResults.push(...createCategoryZips(downloadFiles, 'DOWNLOADS', driveBackupDir));
} else {
  console.log(`\n${C.yel}  ⚠ ZIP-Backup übersprungen. Starte mit --zip oder --all für Backup.${C.r}`);
}

// 4. Session DB speichern
const session = saveToDuckDB(allFiles, iniData, zipResults);

// 5. Summary
console.log(`\n${C.grn}${C.b}  ═══ ERGEBNIS ═══${C.r}`);
hr();
log(`INI-Dateien gelesen: ${iniData.length}`, 'o');
log(`Dateien inventarisiert: ${allFiles.length}`, 'o');
log(`Desktop: ${desktopFiles.length} Dateien (${session.inventory.bySource.DESKTOP?.sizeMB || 0} MB)`, 'i');
log(`Downloads: ${downloadFiles.length} Dateien (${session.inventory.bySource.DOWNLOADS?.sizeMB || 0} MB)`, 'i');
if (zipResults.length > 0) {
  log(`ZIP-Backups erstellt: ${zipResults.length}`, 'o');
  const totalZipMB = Math.round(zipResults.reduce((s, z) => s + z.sizeMB, 0) * 10) / 10;
  log(`Backup-Größe: ${totalZipMB} MB in ${driveBackupDir}`, 'i');
}
log(`Session-DB: ${DB_PATH}`, 'o');

console.log(`\n  ${C.d}Optionen: --zip (Backups erstellen) | --all (alles)${C.r}\n`);
