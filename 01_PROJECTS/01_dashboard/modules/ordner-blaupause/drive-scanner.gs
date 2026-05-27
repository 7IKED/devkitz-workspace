/**
 * DkZ™ Google Drive Loose Files Scanner v1.0
 * Findet lose Dateien im Drive-Root und klassifiziert sie
 * 
 * Setup: Google Sheet → Extensions → Apps Script → Paste → Deploy
 * Trigger: Manuell oder wöchentlich via createDriveTrigger()
 */

function findLooseFiles() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('Lose Dateien');
  if (!sheet) sheet = ss.insertSheet('Lose Dateien');
  
  sheet.clear();
  sheet.appendRow(['Name', 'Typ', 'Größe', 'Geändert', 'Tage alt', 'Kategorie', 'Zielordner', 'Status']);
  sheet.getRange(1, 1, 1, 8).setFontWeight('bold').setBackground('#1a1a2e').setFontColor('#e8e8ec');
  
  var rootFiles = DriveApp.getRootFolder().getFiles();
  var count = 0;
  
  while (rootFiles.hasNext()) {
    var file = rootFiles.next();
    var name = file.getName();
    var mime = file.getMimeType();
    var size = formatSize_(file.getSize());
    var modified = file.getLastUpdated();
    var daysOld = Math.floor((new Date() - modified) / (1000 * 60 * 60 * 24));
    var kategorie = classifyFile_(name, mime);
    var ziel = getTargetFolder_(kategorie);
    var status = daysOld > 30 ? '🔴 Archivieren' : daysOld > 7 ? '🟡 Sortieren' : '🟢 Neu';
    
    sheet.appendRow([name, mime.split('/').pop(), size, modified, daysOld, kategorie, ziel, status]);
    count++;
  }
  
  Logger.log('Scan fertig: ' + count + ' lose Dateien gefunden');
}

function classifyFile_(name, mime) {
  var n = name.toLowerCase();
  var m = mime.toLowerCase();
  
  if (/image|video|audio/.test(m) || /\.(jpg|png|mp4|mp3|svg|gif|webp|mov)$/i.test(n)) return '03_MEDIA';
  if (/\.(js|html|css|py|json|yml|tsx|jsx)$/i.test(n)) return '01_PROJECTS';
  if (/\.(pdf|epub|bib)$/i.test(n) || /paper|research|studie/i.test(n)) return '02_RESEARCH';
  if (/\.(ipynb|md|txt)$/i.test(n) || /notiz|todo|note|idea/i.test(n)) return '06_NOTEPAD';
  if (/\.(docx|xlsx|pptx)$/i.test(n) || /vertrag|intern|rechnung/i.test(n)) return '05_INTERN';
  if (/\.(env|yml|conf|sh|bat|ps1|ini)$/i.test(n) || /config|backup/i.test(n)) return '04_SYSTEM';
  if (/privat|steuer|gesundheit|versicherung/i.test(n)) return '07_PRIVAT';
  if (/\.(zip|rar|7z|bak|sql|tar|gz)$/i.test(n)) return 'DEEPKEEP';
  
  return '00_INBOX';
}

function getTargetFolder_(kat) {
  var map = {
    '00_INBOX': '📥 00_INBOX/',
    '01_PROJECTS': '🚀 01_PROJECTS/',
    '02_RESEARCH': '🔬 02_RESEARCH/',
    '03_MEDIA': '🎬 03_MEDIA/',
    '04_SYSTEM': '⚙️ 04_SYSTEM/',
    '05_INTERN': '🔒 05_INTERN/',
    '06_NOTEPAD': '📝 06_NOTEPAD/note/',
    '07_PRIVAT': '🔐 07_PRIVAT/',
    'DEEPKEEP': '💾 DEEPKEEP/'
  };
  return map[kat] || '00_INBOX/';
}

function formatSize_(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
  if (bytes < 1073741824) return (bytes / 1048576).toFixed(1) + ' MB';
  return (bytes / 1073741824).toFixed(1) + ' GB';
}

function createDriveTrigger() {
  ScriptApp.newTrigger('findLooseFiles')
    .timeBased()
    .everyWeeks(1)
    .onWeekDay(ScriptApp.WeekDay.SUNDAY)
    .atHour(9)
    .create();
  Logger.log('Trigger erstellt: findLooseFiles jeden Sonntag 9:00');
}

/** Beide Scanner auf einmal */
function scanAll() {
  scanDrafts();
  findLooseFiles();
  Logger.log('Komplett-Scan abgeschlossen');
}
