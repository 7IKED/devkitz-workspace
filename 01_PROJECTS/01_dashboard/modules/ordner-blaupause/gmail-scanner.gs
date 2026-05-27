/**
 * DkZ™ Gmail Entwürfe Scanner v1.0
 * Scannt Gmail-Entwürfe und klassifiziert sie in DkZ-Kategorien
 * 
 * Setup: Google Sheet → Extensions → Apps Script → Paste → Deploy
 * Trigger: Manuell oder alle 15 Min via createTrigger()
 */

function scanDrafts() {
  const drafts = GmailApp.getDrafts();
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName('Entwürfe');
  if (!sheet) sheet = ss.insertSheet('Entwürfe');
  
  sheet.clear();
  sheet.appendRow(['ID', 'Betreff', 'Datum', 'Anhänge', 'Kategorie', 'Zielordner', 'Status']);
  sheet.getRange(1, 1, 1, 7).setFontWeight('bold').setBackground('#1a1a2e').setFontColor('#e8e8ec');
  
  drafts.forEach(function(draft) {
    var msg = draft.getMessage();
    var subject = msg.getSubject() || '(kein Betreff)';
    var date = msg.getDate();
    var attachments = msg.getAttachments().length;
    var kategorie = classifyDraft_(subject, msg);
    var ziel = getTargetFolder_(kategorie);
    var status = isOlderThan30Days_(date) ? '🔴 Veraltet' : '🟢 Aktuell';
    
    sheet.appendRow([draft.getId(), subject, date, attachments, kategorie, ziel, status]);
  });
  
  Logger.log('Scan fertig: ' + drafts.length + ' Entwürfe klassifiziert');
}

function classifyDraft_(subject, msg) {
  var s = subject.toLowerCase();
  if (/projekt|feature|sprint|deploy|release/.test(s)) return '01_PROJECTS';
  if (/research|paper|studie|analyse/.test(s)) return '02_RESEARCH';
  if (/config|server|backup|deploy|system/.test(s)) return '04_SYSTEM';
  if (/vertrag|intern|nda|rechnung|angebot/.test(s)) return '05_INTERN';
  if (/notiz|todo|idee|meeting|note/.test(s)) return '06_NOTEPAD';
  if (/privat|steuer|arzt|gesundheit|versicherung/.test(s)) return '07_PRIVAT';
  if (msg.getAttachments().some(function(a) { return /\.(jpg|png|mp4|svg|gif|webp)$/i.test(a.getName()); })) return '03_MEDIA';
  return '00_INBOX';
}

function getTargetFolder_(kat) {
  var map = {
    '00_INBOX': '📥 00_INBOX/',
    '01_PROJECTS': '🚀 01_PROJECTS/docs/',
    '02_RESEARCH': '🔬 02_RESEARCH/papers/',
    '03_MEDIA': '🎬 03_MEDIA/',
    '04_SYSTEM': '⚙️ 04_SYSTEM/docs/',
    '05_INTERN': '🔒 05_INTERN/',
    '06_NOTEPAD': '📝 06_NOTEPAD/note/',
    '07_PRIVAT': '🔐 07_PRIVAT/'
  };
  return map[kat] || '00_INBOX/';
}

function isOlderThan30Days_(date) {
  var now = new Date();
  var diff = (now - date) / (1000 * 60 * 60 * 24);
  return diff > 30;
}

function createScanTrigger() {
  ScriptApp.newTrigger('scanDrafts')
    .timeBased()
    .everyMinutes(15)
    .create();
  Logger.log('Trigger erstellt: scanDrafts alle 15 Min');
}
