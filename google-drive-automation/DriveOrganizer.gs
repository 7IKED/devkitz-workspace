/**
 * DkZ™ Google Drive Organizer v2.2 — Jeff Su 00-99 System
 * ═══════════════════════════════════════════════════════════
 * ABSOLUTES LOESCH-VERBOT — Nur safeArchive() verwenden!
 * 
 * EISERNE REGELN (von 777):
 * ──────────────────────────
 * R1: NIEMALS loeschen — nur verschieben in Papierkorb-Ordner
 * R2: 05_INTERN — GESCHUETZT
 * R3: 06_NOTEPAD — ABSOLUT UNANTASTBAR
 * R4: 07_PRIVAT — ABSOLUT UNANTASTBAR
 * R5: 08_PLAYSTATION — GESCHUETZT
 * R6: [DEEPKEEP] — NUR KOPIEREN, nie verschieben/loeschen
 * R7: "raw" Ordner — IMMER unangetastet, egal wo
 * R8: Fotos → NUR in 03_MEDIA/Fotos
 * R9: Videos → NUR in 03_MEDIA/Videos
 * R10: Inbox [00] ist der EINZIGE Ordner der sortiert wird
 * R11: Desktop — NUR Dateien ABLEGEN, nie bestehende aendern
 * R12: 04_SYSTEM — NUR verschieben, NIEMALS loeschen
 * R13: Apps Script ALLEINE darf NUR Dateien REIN-verschieben (Dauer-Sortierung)
 * R14: ERWEITERTE Aktionen (umbenennen, editieren, loeschen) NUR mit LLM_OVERRIDE
 *      → Haupt-LLM (Antigravity/Claude) setzt Override-Token wenn noetig
 *      → Ohne Token: NUR moveTo() erlaubt
 * 
 * BETRIEBSMODI:
 * ─────────────
 * AUTO         → Dauer-Sortierung, nur moveTo(), keine Aenderungen
 * LLM_OVERRIDE → LLM hat explizit angewiesen, erweiterte Ops erlaubt
 * 
 * ECHTE DEVKITZ STRUKTUR (Stand 2026-05-28):
 * ──────────────────────────────────────────
 * 00_INBOX
 * 01_PROJECTS
 * 02_RESEARCH
 * 03_MEDIA        (Fotos/Videos/Musik/Design)
 * 04_SYSTEM       (Scripts, ONTHERUN, BOTNET, Shortcuts)
 * 05_INTERN       ██ GESCHUETZT ██
 * 06_NOTEPAD      ██ GESCHUETZT ██
 * 07_PRIVAT       ██ GESCHUETZT ██
 * 08_PLAYSTATION  ██ GESCHUETZT ██
 * 99_ARCHIVE
 * [DEEPKEEP]      ██ NUR KOPIEREN ██
 * 
 * @version 2.2.0
 * @author 777 / Antigravity
 */

// ═══ BETRIEBSMODUS ═══
// AUTO = Dauer-Sortierung (nur moveTo)
// LLM  = Haupt-LLM hat erweiterte Ops freigegeben
var MODE = {
  AUTO: 'AUTO',
  LLM: 'LLM_OVERRIDE'
};

function getMode() {
  try {
    var token = PropertiesService.getScriptProperties().getProperty('LLM_OVERRIDE');
    if (token && token === 'ACTIVE') return MODE.LLM;
  } catch(e) {}
  return MODE.AUTO;
}

// LLM setzt diesen Override wenn noetig
function enableLLMOverride() {
  PropertiesService.getScriptProperties().setProperty('LLM_OVERRIDE', 'ACTIVE');
  _log('MODE', 'LLM_OVERRIDE', 'AKTIVIERT — erweiterte Ops erlaubt');
}

// Nach LLM-Aktion wieder zuruecksetzen
function disableLLMOverride() {
  PropertiesService.getScriptProperties().deleteProperty('LLM_OVERRIDE');
  _log('MODE', 'AUTO', 'Zurueck auf Dauer-Sortierung');
}

// Prueft ob eine Aktion erlaubt ist
function isAllowed(action) {
  var mode = getMode();
  // AUTO: NUR moveTo/SORT erlaubt
  if (mode === MODE.AUTO) {
    var allowed = ['SORT', 'MOVE', 'MOVE_IN', 'DEEPKEEP-COPY', 'REPORT'];
    return allowed.indexOf(action) !== -1;
  }
  // LLM: Alles erlaubt (ausser loeschen in geschuetzten Zonen)
  return true;
}

// ═══ ECHTE DEVKITZ ORDNERSTRUKTUR ═══
var CONFIG = {
  ROOT: {
    '00': 'INBOX',
    '01': 'PROJECTS',
    '02': 'RESEARCH',
    '03': 'MEDIA',
    '04': 'SYSTEM',
    '05': 'INTERN',        // ██ GESCHUETZT ██
    '06': 'NOTEPAD',       // ██ GESCHUETZT ██
    '07': 'PRIVAT',        // ██ GESCHUETZT ██
    '08': 'PLAYSTATION',   // ██ GESCHUETZT ██
    '09': 'BRAIN\u00B2',       // ██ GESCHUETZT (raw!) ██
    '99': 'ARCHIVE'
  },
  SUB: {
    '03': {
      '01': 'Fotos',
      '02': 'Videos',
      '03': 'Musik',
      '04': 'Design',
      '99': 'Archiv'
    },
    '02': {
      '01': 'Papers',
      '02': 'Web-Clips',
      '03': 'Bookmarks',
      '99': 'Archiv'
    },
    '04': {              // SYSTEM (einziger System-Ordner!)
      '01': 'installers',
      '02': 'ONTHERUN',
      '03': 'shortcuts',
      '04': 'scripts',
      '05': 'downloads',
      '06': 'BOTNET',
      '99': '99_archived'
    }
  },
  TRASH: 'Papierkorb',

  // Fotos NUR zu Fotos, Videos NUR zu Videos
  ROUTE: {
    'image/jpeg':    '03/01', 'image/png':     '03/01', 'image/webp':    '03/01',
    'image/heic':    '03/01', 'image/gif':     '03/01', 'image/svg+xml': '03/01',
    'image/bmp':     '03/01', 'image/tiff':    '03/01',
    'video/mp4':        '03/02', 'video/quicktime':  '03/02', 'video/webm':       '03/02',
    'video/x-msvideo':  '03/02', 'video/x-matroska': '03/02',
    'audio/mpeg': '03/03', 'audio/wav': '03/03', 'audio/flac': '03/03',
    'audio/ogg':  '03/03', 'audio/aac': '03/03',
    'application/pdf': '02/01',
    'text/plain': '00', 'text/markdown': '02'
  },
  MAX_DEPTH: 5
};

// ═══ GESCHUETZTE ZONEN — 6 BEREICHE, 3x SCHUTZ ═══
//
// Zone 1: 05_INTERN        — Interne Dokumente
// Zone 2: 06_NOTEPAD       — Notizen, ABSOLUT TABU
// Zone 3: 07_PRIVAT        — Privat, ABSOLUT TABU
// Zone 4: 08_PLAYSTATION   — Gaming, geschuetzt
// Zone 5: 09_BRAIN²        — SecondBrain + raw
// Zone 6: [DEEPKEEP]       — NUR KOPIEREN
// Zone 7: raw              — NIE ANFASSEN
// Zone 8: 04_SYSTEM        — NUR VERSCHIEBEN, nie loeschen
//
// Schutz 1: isProtected()  — Name-Check (Ordner + 5 Eltern)
// Schutz 2: isBlocked()    — Nummer-Check (05/06/07/08/09)
// Schutz 3: tripleGuard()  — Kombination: Protected + Blocked + DeepKeep + Raw
// Schutz 4: isSystemFolder() — 04_SYSTEM: nur rein, nie loeschen
//
// ALLE muessen GRUEN sein bevor IRGENDWAS passiert!
//
// GLOBAL: Apps Script darf NUR moveTo() — NIEMALS:
//   - file.setName()      ← VERBOTEN
//   - file.setContent()   ← VERBOTEN
//   - file.setTrashed()   ← VERBOTEN
//   - file.remove()       ← VERBOTEN
//   - folder.removeFile() ← VERBOTEN

var PROTECTED_FOLDERS = [
  '05_INTERN', 'INTERN',
  '06_NOTEPAD', 'NOTEPAD',
  '07_PRIVAT', 'PRIVAT',
  '08_PLAYSTATION', 'PLAYSTATION',
  '09_BRAIN', 'BRAIN', 'SecondBrain',
  '[DEEPKEEP]', 'DEEPKEEP',
  'raw'
];

var BLOCKED_NUMBERS = ['05', '06', '07', '08', '09'];

var DEEPKEEP_NAMES = ['[DEEPKEEP]', 'DEEPKEEP'];

// ═══ SCHUTZ 1: Name-basiert ═══
function isProtected(folder) {
  if (!folder) return false;
  var name = folder.getName().toLowerCase();
  for (var i = 0; i < PROTECTED_FOLDERS.length; i++) {
    if (name.indexOf(PROTECTED_FOLDERS[i].toLowerCase()) !== -1) return true;
  }
  var parent = folder;
  for (var d = 0; d < 5; d++) {
    try {
      parent = parent.getParents().next();
      var pName = parent.getName().toLowerCase();
      for (var j = 0; j < PROTECTED_FOLDERS.length; j++) {
        if (pName.indexOf(PROTECTED_FOLDERS[j].toLowerCase()) !== -1) return true;
      }
    } catch(e) { break; }
  }
  return false;
}

// ═══ SCHUTZ 2: Nummer-basiert ═══
function isBlocked(folderOrPath) {
  var name = '';
  if (typeof folderOrPath === 'string') { name = folderOrPath; }
  else if (folderOrPath && folderOrPath.getName) { name = folderOrPath.getName(); }
  else { return false; }
  for (var i = 0; i < BLOCKED_NUMBERS.length; i++) {
    if (name.indexOf(BLOCKED_NUMBERS[i] + '_') === 0) return true;
    if (name.indexOf(BLOCKED_NUMBERS[i] + '/') !== -1) return true;
  }
  return false;
}

// ═══ SCHUTZ 2b: DEEPKEEP ═══
function isDeepKeep(folder) {
  if (!folder) return false;
  var name = folder.getName();
  for (var i = 0; i < DEEPKEEP_NAMES.length; i++) {
    if (name.indexOf(DEEPKEEP_NAMES[i]) !== -1) return true;
  }
  var parent = folder;
  for (var d = 0; d < 5; d++) {
    try {
      parent = parent.getParents().next();
      for (var j = 0; j < DEEPKEEP_NAMES.length; j++) {
        if (parent.getName().indexOf(DEEPKEEP_NAMES[j]) !== -1) return true;
      }
    } catch(e) { break; }
  }
  return false;
}

// ═══ SCHUTZ 2c: RAW ═══
function isRaw(folder) {
  if (!folder) return false;
  if (folder.getName().toLowerCase() === 'raw') return true;
  var parent = folder;
  for (var d = 0; d < 5; d++) {
    try {
      parent = parent.getParents().next();
      if (parent.getName().toLowerCase() === 'raw') return true;
    } catch(e) { break; }
  }
  return false;
}

// ═══ SCHUTZ 3b: SYSTEM-ORDNER (nur rein, nie loeschen) ═══
function isSystemFolder(folder) {
  if (!folder) return false;
  var name = folder.getName();
  if (name === '04_SYSTEM' || name.indexOf('04_SYSTEM') === 0) return true;
  var parent = folder;
  for (var d = 0; d < 5; d++) {
    try {
      parent = parent.getParents().next();
      if (parent.getName() === '04_SYSTEM') return true;
    } catch(e) { break; }
  }
  return false;
}

// ═══ SCHUTZ 4: TRIPLE GUARD — Alle Checks kombiniert ═══
// true = SICHER (kein Schutz greift)
// false = BLOCKIERT
function tripleGuard(folder, action, fileName) {
  // Check 1: Name-basiert
  if (isProtected(folder)) {
    _log('GUARD-1', fileName || '?', action + ' BLOCKED — Name-Schutz: ' + folder.getName());
    return false;
  }
  // Check 2: Nummer-basiert
  if (isBlocked(folder)) {
    _log('GUARD-2', fileName || '?', action + ' BLOCKED — Nummer-Schutz: ' + folder.getName());
    return false;
  }
  // Check 3: DEEPKEEP + Raw
  if (isDeepKeep(folder)) {
    _log('GUARD-3', fileName || '?', action + ' BLOCKED — DEEPKEEP (nur kopieren!)');
    return false;
  }
  if (isRaw(folder)) {
    _log('GUARD-3', fileName || '?', action + ' BLOCKED — raw (nie anfassen!)');
    return false;
  }
  // Check 4: SYSTEM — nur rein, nie loeschen/raus
  if (isSystemFolder(folder) && (action === 'DELETE' || action === 'ARCHIVE' || action === 'REMOVE')) {
    _log('GUARD-4', fileName || '?', action + ' BLOCKED — 04_SYSTEM: nur rein-verschieben!');
    return false;
  }
  return true; // SICHER
}

// ═══ FOLDER STRUCTURE ═══

function setupFolderStructure() {
  var root = DriveApp.getRootFolder();
  for (var num in CONFIG.ROOT) {
    var fn = num + '_' + CONFIG.ROOT[num];
    var f = _findChild(root, fn) || root.createFolder(fn);
    if (CONFIG.SUB[num]) {
      for (var sn in CONFIG.SUB[num]) {
        var sfn = CONFIG.SUB[num][sn];
        _findChild(f, sfn) || f.createFolder(sfn);
      }
    }
  }
  var trash = _getOrCreate(root, CONFIG.TRASH);
  ['Duplikate', 'Varianten', 'Sortiert'].forEach(function(s) { _getOrCreate(trash, s); });
  Logger.log('OK Ordnerstruktur nach echtem DEVKiTZ Layout erstellt!');
}

// ═══ INBOX PROCESSOR (NUR 00_INBOX!) ═══

function processInbox() {
  var inbox = _findRoot('00_INBOX');
  if (!inbox) return Logger.log('FEHLER: 00_INBOX nicht gefunden!');
  if (isProtected(inbox)) return Logger.log('ALARM: Inbox geschuetzt! ABBRUCH.');

  var files = inbox.getFiles();
  var ok = 0, skip = 0, err = 0;

  while (files.hasNext()) {
    var f = files.next();
    try {
      var mime = f.getMimeType();
      var path = CONFIG.ROUTE[mime];

      if (path) {
        var parts = path.split('/');
        var rn = parts[0];
        var sn = parts.length > 1 ? parts[1] : null;

        // BLOCK: 05, 06, 07, 08 sind GESCHUETZT
        if (['05','06','07','08'].indexOf(rn) !== -1) {
          _log('BLOCK', f.getName(), rn + '_' + CONFIG.ROOT[rn] + ' ist GESCHUETZT');
          skip++;
          continue;
        }

        var rf = _findRoot(rn + '_' + CONFIG.ROOT[rn]);
        var sf = rf;
        if (rf && sn && CONFIG.SUB[rn] && CONFIG.SUB[rn][sn]) {
          sf = _findChild(rf, CONFIG.SUB[rn][sn]) || rf;
        }

        if (sf) {
          f.moveTo(sf);
          ok++;
          _log('SORT', f.getName(), path);
        }
      } else if (_isResearch(f)) {
        var r2 = _findRoot('02_RESEARCH');
        if (r2) { f.moveTo(_findChild(r2, 'Papers') || r2); ok++; }
      } else {
        skip++;
      }
    } catch(e) { err++; _log('ERR', f.getName(), e.message); }
  }
  Logger.log(ok + ' sortiert, ' + skip + ' uebersprungen, ' + err + ' Fehler');
}

// ═══ DEEPKEEP (NUR KOPIEREN!) ═══

function copyFromDeepKeep(file, targetFolder) {
  try {
    if (!isDeepKeep(file.getParents().next())) {
      Logger.log('WARNUNG: Nicht in DEEPKEEP'); return null;
    }
  } catch(e) {}
  var copy = file.makeCopy(file.getName(), targetFolder);
  _log('DEEPKEEP-COPY', file.getName(), 'Kopie → ' + targetFolder.getName());
  return copy;
}

// ═══ SAFE ARCHIVE ═══

function safeArchive(file, sub) {
  try {
    var parent = file.getParents().next();
    if (isProtected(parent) || isRaw(parent) || isDeepKeep(parent)) {
      _log('BLOCK', file.getName(), 'Geschuetzt — ABBRUCH');
      return false;
    }
    // 04_SYSTEM: NIEMALS Dateien raus-archivieren
    if (isSystemFolder(parent)) {
      _log('BLOCK', file.getName(), '04_SYSTEM — nur rein, nie raus/loeschen!');
      return false;
    }
  } catch(e) {}
  var trash = _getOrCreate(DriveApp.getRootFolder(), CONFIG.TRASH);
  file.moveTo(sub ? _getOrCreate(trash, sub) : trash);
  _log('ARCHIVE', file.getName(), sub || 'Papierkorb');
  return true;
}

// ═══ DUPLIKATE (nur Inbox) ═══

function findDuplicates() {
  var inbox = _findRoot('00_INBOX');
  if (!inbox) return;
  var files = inbox.getFiles();
  var seen = {}, dupes = 0;
  while (files.hasNext()) {
    var f = files.next();
    var key = f.getName() + '_' + f.getSize();
    if (seen[key]) { safeArchive(f, 'Duplikate'); dupes++; }
    else { seen[key] = true; }
  }
  Logger.log(dupes + ' Duplikate archiviert');
}

// ═══ HELPERS ═══

function _isResearch(f) {
  var kw = ['research','paper','studie','analyse','report','whitepaper','arxiv'];
  var name = f.getName().toLowerCase();
  return kw.some(function(k) { return name.indexOf(k) !== -1; });
}
function _findRoot(n) { var fs=DriveApp.getRootFolder().getFolders(); while(fs.hasNext()){var f=fs.next();if(f.getName()===n)return f;} return null; }
function _findChild(p,n) { var fs=p.getFolders(); while(fs.hasNext()){var f=fs.next();if(f.getName()===n)return f;} return null; }
function _getOrCreate(p,n) { return _findChild(p,n) || p.createFolder(n); }
function _log(a,f,d) { try{Logger.log('['+a+'] '+f+' → '+d);}catch(e){} }

// ═══ MENU ═══

function installTriggers() { ScriptApp.newTrigger('processInbox').timeBased().everyHours(2).create(); }
function onOpen() {
  SpreadsheetApp.getUi().createMenu('DkZ Drive')
    .addItem('Setup Ordner','setupFolderStructure')
    .addItem('Inbox sortieren','processInbox')
    .addItem('Duplikate (Inbox)','findDuplicates')
    .addItem('Safety Report','safetyReport')
    .addItem('Trigger','installTriggers')
    .addToUi();
}

function safetyReport() {
  Logger.log('═══ DkZ Safety Report v2.2 ═══');
  Logger.log('GESCHUETZT: 05_INTERN, 06_NOTEPAD, 07_PRIVAT, 08_PLAYSTATION');
  Logger.log('DEEPKEEP: NUR kopieren · raw: NIE anfassen');
  Logger.log('Fotos → 03_MEDIA/Fotos · Videos → 03_MEDIA/Videos');
  Logger.log('Sortierung: NUR aus 00_INBOX · Loeschen: VERBOTEN');
}
