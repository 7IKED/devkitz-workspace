/**
 * DkZ™ Google Drive Organizer v2.1 — Jeff Su 00-99 System
 * ═══════════════════════════════════════════════════════════
 * ABSOLUTES LOESCH-VERBOT — Nur safeArchive() verwenden!
 * 
 * EISERNE REGELN (von 777):
 * ──────────────────────────
 * R1: NIEMALS loeschen — nur verschieben in Papierkorb-Ordner
 * R2: 06_NOTEPAD — ABSOLUT UNANTASTBAR, NICHTS sortieren/aendern/anfassen
 * R3: 07_PRIVAT — ABSOLUT UNANTASTBAR, NICHTS sortieren/aendern/anfassen
 * R4: [DEEPKEEP] — NUR KOPIEREN, nie verschieben/loeschen
 *     → Kopie in Bibliothek einfuegen, Original bleibt IMMER
 * R5: "raw" Ordner — IMMER unangetastet, egal wo
 * R6: Fotos → NUR in Fotos-Ordner (03_MEDIA/Fotos)
 * R7: Videos → NUR in Videos-Ordner (03_MEDIA/Videos)
 * R8: Inbox [00] ist der EINZIGE Ordner der sortiert wird
 * R9: Desktop — NUR Dateien ABLEGEN, nie bestehende aendern
 * 
 * @version 2.1.0
 * @author 777 / Antigravity
 */

// ═══ ECHTE DEVKITZ ORDNERSTRUKTUR (Stand 2026-05-28) ═══
const CONFIG = {
  ROOT: {
    '00': 'INBOX',
    '01': 'PROJECTS',
    '02': 'RESEARCH',
    '03': 'MEDIA',
    '04': 'SYSTEM',
    '05': 'INTERN',
    '06': 'NOTEPAD',     // ██ GESCHUETZT — NIE ANFASSEN ██
    '07': 'PRIVAT',      // ██ GESCHUETZT — NIE ANFASSEN ██
    '08': 'PLAYSTATION',
    '09': 'SYSTEM',
    '99': 'ARCHIVE'
  },
  SUB: {
    '03': {              // MEDIA — Fotos/Videos/Musik STRENG getrennt
      '01': 'Fotos',     // NUR Bilder hierhin
      '02': 'Videos',    // NUR Videos hierhin
      '03': 'Musik',     // NUR Audio hierhin
      '04': 'Design',    // PSD, AI, Figma
      '99': 'Archiv'
    },
    '02': {              // RESEARCH
      '01': 'Papers',
      '02': 'Web-Clips',
      '03': 'Bookmarks',
      '99': 'Archiv'
    },
    '05': {              // INTERN
      '01': 'PDFs',
      '02': 'Slides',
      '03': 'Keep',
      '04': 'Sheets',
      '05': 'Docs',
      '99': 'Archiv'
    },
    '04': {              // SYSTEM
      '01': 'Desktop-Backup',
      '02': 'SecondBrain',
      '03': 'Logs',
      '04': 'Scripts',
      '99': 'Archiv'
    }
  },
  TRASH: 'Papierkorb',

  // STRENGE Routing: Fotos NUR zu Fotos, Videos NUR zu Videos
  ROUTE: {
    // BILDER → 03/01 (MEDIA/Fotos) — NIEMALS woanders hin
    'image/jpeg':    '03/01',
    'image/png':     '03/01',
    'image/webp':    '03/01',
    'image/heic':    '03/01',
    'image/gif':     '03/01',
    'image/svg+xml': '03/01',
    'image/bmp':     '03/01',
    'image/tiff':    '03/01',

    // VIDEOS → 03/02 (MEDIA/Videos) — NIEMALS woanders hin
    'video/mp4':        '03/02',
    'video/quicktime':  '03/02',
    'video/webm':       '03/02',
    'video/x-msvideo':  '03/02',
    'video/x-matroska': '03/02',

    // AUDIO → 03/03 (MEDIA/Musik)
    'audio/mpeg': '03/03',
    'audio/wav':  '03/03',
    'audio/flac': '03/03',
    'audio/ogg':  '03/03',
    'audio/aac':  '03/03',

    // DOKUMENTE → 05 (INTERN)
    'application/pdf': '05/01',
    'application/vnd.ms-powerpoint': '05/02',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation': '05/02',
    'application/vnd.google-apps.presentation': '05/02',
    'application/vnd.ms-excel': '05/04',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': '05/04',
    'application/vnd.google-apps.spreadsheet': '05/04',
    'application/msword': '05/05',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '05/05',
    'application/vnd.google-apps.document': '05/05',
    'text/plain': '05/05',
    'text/markdown': '05/05'
  },
  MAX_DEPTH: 5
};

// ═══ GESCHUETZTE ORDNER (ABSOLUT UNANTASTBAR) ═══
const PROTECTED_FOLDERS = [
  '06_NOTEPAD', 'NOTEPAD', '06 ',
  '07_PRIVAT', 'PRIVAT', '07 ',
  '[DEEPKEEP]', 'DEEPKEEP',
  'raw'
];

const DEEPKEEP_NAMES = ['[DEEPKEEP]', 'DEEPKEEP'];

// ═══ SAFETY CHECKS ═══

/**
 * Prueft ob ein Ordner geschuetzt ist
 * PROTECTED = 06_NOTEPAD, 07_PRIVAT, [DEEPKEEP], raw
 */
function isProtected(folder) {
  if (!folder) return false;
  var name = folder.getName();
  for (var i = 0; i < PROTECTED_FOLDERS.length; i++) {
    if (name.toLowerCase().indexOf(PROTECTED_FOLDERS[i].toLowerCase()) !== -1) return true;
  }
  // Eltern-Ordner pruefen (rekursiv bis 5 Ebenen)
  var parent = folder;
  for (var d = 0; d < 5; d++) {
    try {
      parent = parent.getParents().next();
      var pName = parent.getName();
      for (var j = 0; j < PROTECTED_FOLDERS.length; j++) {
        if (pName.toLowerCase().indexOf(PROTECTED_FOLDERS[j].toLowerCase()) !== -1) return true;
      }
    } catch(e) { break; }
  }
  return false;
}

/**
 * Prueft ob ein Ordner in [DEEPKEEP] liegt
 * DEEPKEEP = NUR KOPIEREN erlaubt, nie verschieben
 */
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
      var pName = parent.getName();
      for (var j = 0; j < DEEPKEEP_NAMES.length; j++) {
        if (pName.indexOf(DEEPKEEP_NAMES[j]) !== -1) return true;
      }
    } catch(e) { break; }
  }
  return false;
}

/**
 * Prueft ob Ordner "raw" heisst — NIEMALS anfassen
 */
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
  Logger.log('OK Ordnerstruktur erstellt nach echtem DEVKiTZ Layout!');
}

// ═══ INBOX PROCESSOR (NUR 00_INBOX wird sortiert!) ═══

function processInbox() {
  var inbox = _findRoot('00_INBOX');
  if (!inbox) return Logger.log('FEHLER: 00_INBOX nicht gefunden!');

  // SICHERHEITSCHECK
  if (isProtected(inbox)) {
    Logger.log('ALARM: Inbox in geschuetztem Ordner! ABBRUCH.');
    return;
  }

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
        var sn = parts[1];

        // SICHERHEIT: Ziel darf NICHT 06 oder 07 sein
        if (rn === '06' || rn === '07') {
          _log('BLOCK', f.getName(), rn + ' ist GESCHUETZT');
          skip++;
          continue;
        }

        var rf = _findRoot(rn + '_' + CONFIG.ROOT[rn]);
        var sf = rf;
        if (rf && CONFIG.SUB[rn] && CONFIG.SUB[rn][sn]) {
          sf = _findChild(rf, CONFIG.SUB[rn][sn]) || rf;
        }

        if (sf) {
          f.moveTo(sf);
          ok++;
          _log('SORT', f.getName(), rn + '/' + sn + ' (' + CONFIG.SUB[rn]?.[sn] || CONFIG.ROOT[rn] + ')');
        }
      } else if (_isResearch(f)) {
        var r2 = _findRoot('02_RESEARCH');
        if (r2) {
          f.moveTo(_findChild(r2, 'Papers') || r2);
          ok++;
          _log('SORT', f.getName(), '02_RESEARCH/Papers');
        }
      } else {
        skip++;
        _log('SKIP', f.getName(), 'Kein Routing fuer: ' + mime);
      }
    } catch(e) {
      err++;
      _log('ERR', f.getName(), e.message);
    }
  }

  Logger.log('Ergebnis: ' + ok + ' sortiert, ' + skip + ' uebersprungen, ' + err + ' Fehler');
}

// ═══ DEEPKEEP BIBLIOTHEK (Nur KOPIEREN!) ═══

/**
 * Kopiert eine Datei aus [DEEPKEEP] in die Bibliothek
 * ORIGINAL BLEIBT IMMER! Nur Kopie wird erstellt.
 */
function copyFromDeepKeep(file, targetFolder) {
  try {
    var parent = file.getParents().next();
    if (!isDeepKeep(parent)) {
      Logger.log('WARNUNG: Datei ist nicht in DEEPKEEP');
      return null;
    }
  } catch(e) {}

  // NUR KOPIEREN — Original bleibt IMMER
  var copy = file.makeCopy(file.getName(), targetFolder);
  _log('DEEPKEEP-COPY', file.getName(), 'Kopie → ' + targetFolder.getName());
  return copy;
}

// ═══ SAFE ARCHIVE (Kein Loeschen!) ═══

function safeArchive(file, sub) {
  try {
    var parent = file.getParents().next();
    if (isProtected(parent)) {
      _log('BLOCK', file.getName(), 'Geschuetzter Ordner (06/07/DEEPKEEP/raw) — ABBRUCH');
      return false;
    }
    if (isRaw(parent)) {
      _log('BLOCK', file.getName(), 'Raw-Ordner — ABBRUCH');
      return false;
    }
    if (isDeepKeep(parent)) {
      _log('BLOCK', file.getName(), 'DEEPKEEP — nur copyFromDeepKeep() erlaubt!');
      return false;
    }
  } catch(e) {}

  var trash = _getOrCreate(DriveApp.getRootFolder(), CONFIG.TRASH);
  file.moveTo(sub ? _getOrCreate(trash, sub) : trash);
  _log('ARCHIVE', file.getName(), sub || 'Papierkorb');
  return true;
}

// ═══ DUPLIKAT-FINDER (nur in 00_INBOX) ═══

function findDuplicates() {
  var inbox = _findRoot('00_INBOX');
  if (!inbox) return;

  var files = inbox.getFiles();
  var seen = {};
  var dupes = 0;

  while (files.hasNext()) {
    var f = files.next();
    var key = f.getName() + '_' + f.getSize();
    if (seen[key]) {
      safeArchive(f, 'Duplikate');
      dupes++;
    } else {
      seen[key] = true;
    }
  }
  Logger.log(dupes + ' Duplikate in Inbox gefunden und archiviert');
}

// ═══ HELPERS ═══

function _isResearch(f) {
  var kw = ['research', 'paper', 'studie', 'analyse', 'report', 'whitepaper', 'arxiv'];
  var name = f.getName().toLowerCase();
  return kw.some(function(k) { return name.indexOf(k) !== -1; });
}

function _findRoot(n) {
  var fs = DriveApp.getRootFolder().getFolders();
  while (fs.hasNext()) {
    var f = fs.next();
    if (f.getName() === n) return f;
  }
  return null;
}

function _findChild(p, n) {
  var fs = p.getFolders();
  while (fs.hasNext()) {
    var f = fs.next();
    if (f.getName() === n) return f;
  }
  return null;
}

function _getOrCreate(p, n) {
  return _findChild(p, n) || p.createFolder(n);
}

function _log(a, f, d) {
  try { Logger.log('[' + a + '] ' + f + ' → ' + d); } catch(e) {}
}

// ═══ TRIGGERS + MENU ═══

function installTriggers() {
  ScriptApp.newTrigger('processInbox').timeBased().everyHours(2).create();
  Logger.log('Trigger: processInbox alle 2h');
}

function onOpen() {
  SpreadsheetApp.getUi().createMenu('DkZ Drive')
    .addItem('Setup Ordner', 'setupFolderStructure')
    .addItem('Inbox sortieren', 'processInbox')
    .addItem('Duplikate (nur Inbox)', 'findDuplicates')
    .addItem('Safety Report', 'safetyReport')
    .addItem('Trigger installieren', 'installTriggers')
    .addToUi();
}

// ═══ SAFETY REPORT ═══

function safetyReport() {
  Logger.log('═══ DkZ Drive Safety Report v2.1 ═══');
  Logger.log('');
  Logger.log('GESCHUETZT (NIE ANFASSEN):');
  Logger.log('  06_NOTEPAD — Notizen, privat, ABSOLUT TABU');
  Logger.log('  07_PRIVAT  — Privat, ABSOLUT TABU');
  Logger.log('  [DEEPKEEP] — NUR kopieren (copyFromDeepKeep)');
  Logger.log('  raw/       — Ueberall geschuetzt, nie anfassen');
  Logger.log('');
  Logger.log('ROUTING:');
  Logger.log('  Fotos  → 03_MEDIA/Fotos (NUR Bilder)');
  Logger.log('  Videos → 03_MEDIA/Videos (NUR Videos)');
  Logger.log('  Musik  → 03_MEDIA/Musik (NUR Audio)');
  Logger.log('  PDFs   → 05_INTERN/PDFs');
  Logger.log('  Papers → 02_RESEARCH/Papers');
  Logger.log('');
  Logger.log('SORTIERUNG: NUR aus 00_INBOX');
  Logger.log('LOESCHEN: VERBOTEN — nur safeArchive()');
  Logger.log('DESKTOP: NUR ablegen, nie aendern');
}
