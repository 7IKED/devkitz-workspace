/**
 * DkZÔäó WalkthroughSheets ÔÇö Google Apps Script
 * Versteckte Sheets f├╝r Walkthrough-Registry + System-Options + Lernfunktion
 * ÔØî ABSOLUTES L├ûSCH-VERBOT
 * @version 1.0.0
 */

const WT_CONFIG = {
  REGISTRY_SHEET: '_DkZ_Walkthrough_Registry',
  OPTIONS_SHEET: '_DkZ_System_Options',
  PROFILES_SHEET: '_DkZ_Auto_Profiles',
  TRIGGERS_SHEET: '_DkZ_Trigger_Rules',
  DRIVE_FOLDER: '[06] Research',
  DRIVE_SUB: '[04] Walkthrough'
};

// ÔòÉÔòÉÔòÉ SETUP ÔòÉÔòÉÔòÉ
function setupWalkthroughSheets() {
  const ss = SpreadsheetApp.getActiveSpreadsheet() || SpreadsheetApp.create('DkZ Walkthrough Registry');
  
  // Registry Sheet
  let reg = ss.getSheetByName(WT_CONFIG.REGISTRY_SHEET);
  if (!reg) {
    reg = ss.insertSheet(WT_CONFIG.REGISTRY_SHEET);
    reg.appendRow(['DocID','Datum','Session','Tags','Antworten','Profil','Modus','Version','URL','Status']);
    reg.getRange('1:1').setFontWeight('bold').setBackground('#1a1a2a').setFontColor('#fa1e4e');
    reg.hideSheet();
  }

  // System Options Sheet
  let opts = ss.getSheetByName(WT_CONFIG.OPTIONS_SHEET);
  if (!opts) {
    opts = ss.insertSheet(WT_CONFIG.OPTIONS_SHEET);
    opts.appendRow(['Option_A','Option_B','Regel','Beschreibung']);
    // Default Trigger-Regeln: inkompatible Kombinationen
    opts.appendRow(['Echtzeit-Watcher','Manuell','EXCLUDE','Gegenseitig ausschlie├ƒend']);
    opts.appendRow(['Echtzeit-Watcher','Cron','EXCLUDE','Watcher ersetzt Cron']);
    opts.appendRow(['Kling/Luma','Pollinations','PREFER_B','Fallback auf Free Provider']);
    opts.appendRow(['red-team-tactics','vibe-coding','WARN','Security + Vibe selten kombiniert']);
    opts.getRange('1:1').setFontWeight('bold').setBackground('#1a1a2a').setFontColor('#00ff88');
    opts.hideSheet();
  }

  // Auto-Profiles Sheet
  let prof = ss.getSheetByName(WT_CONFIG.PROFILES_SHEET);
  if (!prof) {
    prof = ss.insertSheet(WT_CONFIG.PROFILES_SHEET);
    prof.appendRow(['Profil','Frage_ID','Vorauswahl','Ampel','Skills']);
    // Optimierung
    prof.appendRow(['optimierung','q1','Meine Ablage (Root)','green','/power,dkz-teststrasse,code-reviewer,simplify-code']);
    prof.appendRow(['optimierung','q2','Cron / Task Scheduler','yellow','performance-engineer']);
    prof.appendRow(['optimierung','q3','Pollinations (Free)','green','']);
    // Pflege
    prof.appendRow(['pflege','q1','Meine Ablage (Root)','green','dkz-qa-audit,dkz-pre-commit,pr-writer']);
    prof.appendRow(['pflege','q2','Manuell (on-demand)','green','']);
    prof.appendRow(['pflege','q3','Pollinations (Free)','green','']);
    // Expansion
    prof.appendRow(['expansion','q1','Neuen 00-99 Root erstellen','green','/power+,architect-review,api-patterns']);
    prof.appendRow(['expansion','q2','Cron / Task Scheduler','yellow','senior-architect']);
    prof.appendRow(['expansion','q3','Veo 3.1 (Gemini)','yellow','']);
    // Benutzerfreundlichkeit
    prof.appendRow(['ux','q1','Meine Ablage (Root)','green','frontend-design,vibe-coding,design-spells']);
    prof.appendRow(['ux','q2','Manuell (on-demand)','green','']);
    prof.appendRow(['ux','q3','Pollinations (Free)','green','']);
    prof.getRange('1:1').setFontWeight('bold').setBackground('#1a1a2a').setFontColor('#ffb800');
    prof.hideSheet();
  }

  Logger.log('Ô£à Walkthrough Sheets erstellt (4 versteckte Sheets)');
  return ss.getUrl();
}

// ÔòÉÔòÉÔòÉ REGISTER WALKTHROUGH ÔòÉÔòÉÔòÉ
function registerWalkthrough(data) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const reg = ss.getSheetByName(WT_CONFIG.REGISTRY_SHEET);
  if (!reg) { Logger.log('ÔØî Registry Sheet fehlt!'); return null; }

  const docId = data.id || _generateDocId();
  const url = `devkitz.sites/Walkthrough/${docId}`;
  
  reg.appendRow([
    docId,
    new Date().toISOString(),
    data.session || '',
    (data.tags || []).join(', '),
    JSON.stringify(data.answers || {}),
    data.profile || 'manual',
    data.mode || 'full',
    data.version || '1.0.0',
    url,
    'active'
  ]);

  // Lernfunktion: Speichere Antworten f├╝r Vorauswahl
  _updateLearning(data.answers);

  Logger.log(`Ô£à Walkthrough ${docId} registriert ÔåÆ ${url}`);
  return { docId, url };
}

// ÔòÉÔòÉÔòÉ SAVE TO DRIVE ÔòÉÔòÉÔòÉ
function saveWalkthroughToDrive(htmlContent, docId) {
  const root = DriveApp.getRootFolder();
  const research = _findChild(root, WT_CONFIG.DRIVE_FOLDER);
  if (!research) { Logger.log('ÔØî Research-Ordner fehlt!'); return null; }
  
  let wtFolder = _findChild(research, WT_CONFIG.DRIVE_SUB);
  if (!wtFolder) wtFolder = research.createFolder(WT_CONFIG.DRIVE_SUB);

  const ts = Utilities.formatDate(new Date(), 'Europe/Berlin', 'yyyy-MMdd-HHmm');
  const filename = `${ts}_${docId}.html`;
  
  const file = wtFolder.createFile(filename, htmlContent, MimeType.HTML);
  Logger.log(`­ƒôü Drive: ${filename} ÔåÆ ${file.getUrl()}`);
  return file.getUrl();
}

// ÔòÉÔòÉÔòÉ GET LAST SELECTIONS (Lernfunktion) ÔòÉÔòÉÔòÉ
function getLastSelections(questionId) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const reg = ss.getSheetByName(WT_CONFIG.REGISTRY_SHEET);
  if (!reg || reg.getLastRow() < 2) return null;

  // Letzte 5 Eintr├ñge durchsuchen
  const lastRow = reg.getLastRow();
  const startRow = Math.max(2, lastRow - 4);
  const data = reg.getRange(startRow, 5, lastRow - startRow + 1, 1).getValues(); // Antworten-Spalte

  const history = [];
  data.forEach(row => {
    try {
      const answers = JSON.parse(row[0]);
      if (answers[questionId]) history.push(answers[questionId]);
    } catch(e) {}
  });

  if (history.length === 0) return null;

  // H├ñufigste Antwort als Vorschlag
  const counts = {};
  history.forEach(a => { counts[a] = (counts[a] || 0) + 1; });
  const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  return { suggestion: sorted[0][0], confidence: sorted[0][1] / history.length, history };
}

// ÔòÉÔòÉÔòÉ GET TRIGGER RULES ÔòÉÔòÉÔòÉ
function getTriggerRules() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const opts = ss.getSheetByName(WT_CONFIG.OPTIONS_SHEET);
  if (!opts || opts.getLastRow() < 2) return [];

  const data = opts.getRange(2, 1, opts.getLastRow() - 1, 4).getValues();
  return data.map(row => ({
    optionA: row[0], optionB: row[1], rule: row[2], desc: row[3]
  }));
}

// ÔòÉÔòÉÔòÉ GET AUTO PROFILE ÔòÉÔòÉÔòÉ
function getAutoProfile(profileName) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const prof = ss.getSheetByName(WT_CONFIG.PROFILES_SHEET);
  if (!prof || prof.getLastRow() < 2) return null;

  const data = prof.getRange(2, 1, prof.getLastRow() - 1, 5).getValues();
  const profile = {};
  data.filter(r => r[0] === profileName).forEach(row => {
    profile[row[1]] = { answer: row[2], ampel: row[3], skills: row[4] ? row[4].split(',') : [] };
  });
  return profile;
}

// ÔòÉÔòÉÔòÉ HELPERS ÔòÉÔòÉÔòÉ
function _generateDocId() {
  const d = new Date();
  const p = (n, l=2) => String(n).padStart(l, '0');
  const seq = _getNextSeq();
  return `DKZ-${d.getFullYear()}-${p(d.getMonth()+1)}${p(d.getDate())}-${p(seq, 3)}`;
}

function _getNextSeq() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const reg = ss.getSheetByName(WT_CONFIG.REGISTRY_SHEET);
  if (!reg || reg.getLastRow() < 2) return 1;
  const lastId = reg.getRange(reg.getLastRow(), 1).getValue();
  const m = lastId.match(/-(\d{3})$/);
  return m ? parseInt(m[1]) + 1 : 1;
}

function _updateLearning(answers) {
  // Answers werden in Registry gespeichert ÔÇö getLastSelections() liest sie aus
  // Keine separate Tabelle n├Âtig, die Registry IST die Lern-Datenbank
}

function _findChild(p, n) {
  const fs = p.getFolders();
  while (fs.hasNext()) { const f = fs.next(); if (f.getName() === n) return f; }
  return null;
}

// ÔòÉÔòÉÔòÉ WEB APP ENDPOINT (for n8n) ÔòÉÔòÉÔòÉ
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const result = registerWalkthrough(data);
    
    if (data.html) {
      const driveUrl = saveWalkthroughToDrive(data.html, result.docId);
      result.driveUrl = driveUrl;
    }

    return ContentService.createTextOutput(JSON.stringify({ success: true, ...result }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ success: false, error: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  const action = e.parameter.action;
  let result;

  if (action === 'profile') {
    result = getAutoProfile(e.parameter.name || 'optimierung');
  } else if (action === 'rules') {
    result = getTriggerRules();
  } else if (action === 'suggest') {
    result = getLastSelections(e.parameter.q || 'q1');
  } else {
    result = { error: 'Unknown action. Use: profile, rules, suggest' };
  }

  return ContentService.createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}
