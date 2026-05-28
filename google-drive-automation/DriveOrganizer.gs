/**
 * DkZÔäó Google Drive Organizer ÔÇö Jeff Su 00-99 System
 * ÔØî ABSOLUTES L├ûSCH-VERBOT ÔÇö Nur safeArchive() verwenden!
 * @version 1.0.0
 */

const CONFIG = {
  ROOT: { '00':'Inbox','01':'Projekte','02':'Bereiche','03':'Ressourcen',
    '04':'Medien','05':'Dokumente','06':'Research','07':'Templates',
    '08':'Shared','09':'System','99':'Archiv' },
  SUB: {
    '04':{'01':'Fotos','02':'Videos','03':'Musik','99':'Archiv'},
    '05':{'01':'PDFs','02':'Slides','03':'Keep','04':'Sheets','05':'Docs','99':'Archiv'},
    '06':{'01':'Papers','02':'Web-Clips','03':'Bookmarks','99':'Archiv'},
    '09':{'01':'Desktop-Backup','02':'SecondBrain','03':'Logs','99':'Archiv'}
  },
  TRASH: '­ƒùæ´©Å Papierkorb',
  ROUTE: {
    'image/jpeg':'04/01','image/png':'04/01','image/webp':'04/01','image/heic':'04/01',
    'video/mp4':'04/02','video/quicktime':'04/02','video/webm':'04/02',
    'audio/mpeg':'04/03','audio/wav':'04/03','audio/flac':'04/03','audio/ogg':'04/03',
    'application/pdf':'05/01',
    'application/vnd.ms-powerpoint':'05/02',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation':'05/02',
    'application/vnd.google-apps.presentation':'05/02',
    'application/vnd.ms-excel':'05/04',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':'05/04',
    'application/vnd.google-apps.spreadsheet':'05/04',
    'application/msword':'05/05',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document':'05/05',
    'application/vnd.google-apps.document':'05/05',
    'text/plain':'05/05','text/markdown':'05/05'
  },
  MAX_DEPTH: 5
};

function setupFolderStructure() {
  const root = DriveApp.getRootFolder();
  for (const [num, name] of Object.entries(CONFIG.ROOT)) {
    const fn = `[${num}] ${name}`;
    let f = _findChild(root, fn) || root.createFolder(fn);
    if (CONFIG.SUB[num]) {
      for (const [sn, sname] of Object.entries(CONFIG.SUB[num])) {
        _findChild(f, `[${sn}] ${sname}`) || f.createFolder(`[${sn}] ${sname}`);
      }
    }
  }
  const trash = _getOrCreate(root, CONFIG.TRASH);
  ['Duplikate','Varianten','Sortiert'].forEach(s => _getOrCreate(trash, s));
  Logger.log('Ô£à Ordnerstruktur erstellt!');
}

function processInbox() {
  const inbox = _findRoot('[00] Inbox');
  if (!inbox) return Logger.log('ÔØî Inbox fehlt!');
  const files = inbox.getFiles();
  let ok=0, err=0;
  while (files.hasNext()) {
    const f = files.next();
    try {
      const path = CONFIG.ROUTE[f.getMimeType()];
      if (path) {
        const [rn, sn] = path.split('/');
        const rf = _findRoot(`[${rn}] ${CONFIG.ROOT[rn]}`);
        const sf = rf && CONFIG.SUB[rn]?.[sn] ? _findChild(rf, `[${sn}] ${CONFIG.SUB[rn][sn]}`) || rf : rf;
        if (sf) { f.moveTo(sf); ok++; _log('SORT', f.getName(), path); }
      } else if (_isResearch(f)) {
        const r6 = _findRoot('[06] Research');
        if (r6) { f.moveTo(_findChild(r6,'[01] Papers')||r6); ok++; }
      }
    } catch(e) { err++; _log('ERR', f.getName(), e.message); }
  }
  Logger.log(`­ƒôè ${ok} sortiert, ${err} Fehler`);
}

function safeArchive(file, sub) {
  const trash = _getOrCreate(DriveApp.getRootFolder(), CONFIG.TRASH);
  file.moveTo(sub ? _getOrCreate(trash, sub) : trash);
  _log('ARCHIVE', file.getName(), sub||'');
}

function _isResearch(f) {
  const kw = ['research','paper','studie','analyse','report','whitepaper','arxiv'];
  return kw.some(k => f.getName().toLowerCase().includes(k));
}
function _findRoot(n) { const fs=DriveApp.getRootFolder().getFolders(); while(fs.hasNext()){const f=fs.next();if(f.getName()===n)return f;} return null; }
function _findChild(p,n) { const fs=p.getFolders(); while(fs.hasNext()){const f=fs.next();if(f.getName()===n)return f;} return null; }
function _getOrCreate(p,n) { return _findChild(p,n) || p.createFolder(n); }
function _log(a,f,d) { try{Logger.log(`[${a}] ${f} ÔåÆ ${d}`);}catch(e){} }
function _nextNum(p) {
  const fs=p.getFolders(); let max=-1;
  while(fs.hasNext()){const m=fs.next().getName().match(/^\[(\d{2})\]/);if(m)max=Math.max(max,parseInt(m[1]));}
  return String(Math.min(max+1,98)).padStart(2,'0');
}

function installTriggers() {
  ScriptApp.newTrigger('processInbox').timeBased().everyHours(2).create();
}
function onOpen() {
  SpreadsheetApp.getUi().createMenu('­ƒñû DkZ Drive')
    .addItem('­ƒôü Setup','setupFolderStructure')
    .addItem('­ƒôÑ Inbox sortieren','processInbox')
    .addItem('­ƒöì Duplikate','findDuplicates')
    .addItem('ÔÅ░ Trigger','installTriggers')
    .addToUi();
}
