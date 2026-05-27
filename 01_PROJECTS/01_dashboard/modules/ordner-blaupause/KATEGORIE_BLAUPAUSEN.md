# 🔱 /power+ Kategorie-Blaupausen — Dateiklassifizierung

> Stand: 2026-05-17 · Status: 🟢 VERBINDLICH
> Gmail Entwürfe + Google Drive Loose Files → Automatische Zuordnung

---

## ═══ ÜBERSICHT: 10 Kategorien ═══

| # | Ordner | Dateitypen | Gmail-Label | Drive-Suchfilter |
|:--|:-------|:-----------|:------------|:-----------------|
| 00 | INBOX | ALLES | `label:drafts` | `owner:me modified:today` |
| 01 | PROJECTS | .js .html .css .json .md | `subject:projekt OR feature` | `type:folder name:projekt` |
| 02 | RESEARCH | .pdf .epub .md .bib | `subject:research OR paper` | `type:pdf OR type:document` |
| 03 | MEDIA | .png .jpg .mp4 .mp3 .svg | `has:attachment filename:jpg` | `type:image OR type:video` |
| 04 | SYSTEM | .yml .env .ini .conf .sh | `subject:config OR backup` | `name:config OR name:backup` |
| 05 | INTERN | .docx .xlsx .pptx | `subject:intern OR vertraulich` | `name:intern OR name:vertrag` |
| 06 | NOTEPAD | .md .txt .ipynb .json | `subject:notiz OR todo` | `type:document modified:week` |
| 07 | PRIVAT | .pdf .docx .jpg | `label:privat` | `visibility:private` |
| 99 | ARCHIVE | alle (>30d inaktiv) | `older_than:30d` | `modifiedDate<30d` |
| — | DEEPKEEP | .zip .rar .bak .sql | `has:attachment filename:zip` | `type:archive` |

---

## ═══ 00_INBOX — Capture Zone ═══

### Dateien die hierhin gehören
- **Alles Neue** — Kein Nachdenken, einfach ablegen
- Unsortierte Downloads, Screenshots, Quick-Notes
- Gmail-Entwürfe ohne klares Label

### Gmail Entwürfe → INBOX
```
Suchfilter: label:drafts -label:projekt -label:research -label:privat
Aktion:     Anhänge → 00_INBOX/ · Text → 00_INBOX/entwurf-YYYY-MM-DD.md
```

### Drive Loose Files → INBOX
```
Suchfilter: owner:me -parents:any (Dateien ohne Ordner)
Aktion:     → 00_INBOX/ mit Datum-Prefix
```

### Auto-Regeln
| Trigger | Frist | Aktion |
|:--------|:------|:-------|
| Datei unsortiert | 7d | ⚠️ Warnung |
| Datei unsortiert | 14d | 🔴 Eskalation |

---

## ═══ 01_PROJECTS — Aktive Arbeit ═══

### Dateien
- Code: `.js` `.html` `.css` `.py` `.sh`
- Config: `package.json` `tsconfig.json` `.env`
- Docs: `README.md` `BLAUPAUSE.md` `spec.md`
- Assets: `favicon.ico` `.svg` `.woff2`

### Gmail → PROJECTS
```
Suchfilter: label:drafts (subject:feature OR subject:sprint OR subject:deploy)
Aktion:     → 01_PROJECTS/[projekt-name]/docs/
```

### Drive → PROJECTS
```
Suchfilter: name contains "projekt" OR name contains "feature"
Aktion:     → 01_PROJECTS/ mit Projekt-Erkennung
```

---

## ═══ 02_RESEARCH — Wissen ═══

### Dateien
- Papers: `.pdf` `.epub` `.bib`
- Notes: `.md` (mit R- Präfix)
- Data: `.csv` `.json` (Datensätze)
- AI: NotebookLM Exports, Zusammenfassungen

### Gmail → RESEARCH
```
Suchfilter: label:drafts (subject:paper OR subject:research OR subject:studie)
Aktion:     Anhänge → 02_RESEARCH/papers/ · Links → 02_RESEARCH/links.md
```

### Drive → RESEARCH
```
Suchfilter: type:pdf name contains "paper" OR "study" OR "research"
Aktion:     → 02_RESEARCH/[thema]/
```

---

## ═══ 03_MEDIA — Medien ═══

### Dateien
- Bilder: `.png` `.jpg` `.webp` `.gif` `.svg`
- Video: `.mp4` `.webm` `.mov`
- Audio: `.mp3` `.wav` `.ogg`
- Design: `.psd` `.fig` `.sketch`

### Gmail → MEDIA
```
Suchfilter: label:drafts has:attachment (filename:jpg OR filename:png OR filename:mp4)
Aktion:     → 03_MEDIA/[typ]/ (auto-sort nach Extension)
```

### Drive → MEDIA
```
Suchfilter: type:image OR type:video OR type:audio
Aktion:     → 03_MEDIA/ mit Auto-Unterordner
```

---

## ═══ 04_SYSTEM — Konfiguration ═══

### Dateien
- Config: `.yml` `.yaml` `.env` `.ini` `.conf`
- Scripts: `.sh` `.bat` `.ps1`
- Backups: `.sql` `.bak` `.dump`
- Certs: `.pem` `.key` `.crt`

### Gmail → SYSTEM
```
Suchfilter: label:drafts (subject:config OR subject:server OR subject:backup OR subject:deploy)
Aktion:     → 04_SYSTEM/docs/ oder 04_SYSTEM/backups/
```

### Drive → SYSTEM
```
Suchfilter: name contains "config" OR "backup" OR ".env"
Aktion:     → 04_SYSTEM/
```

---

## ═══ 05_INTERN — Interne Dokumente ═══

### Dateien
- Office: `.docx` `.xlsx` `.pptx`
- Verträge: `.pdf` (signed)
- Präsentationen: `.pptx` `.key`
- Tabellen: `.xlsx` `.ods` `.csv`

### Gmail → INTERN
```
Suchfilter: label:drafts (subject:vertrag OR subject:intern OR subject:NDA)
Aktion:     → 05_INTERN/[kategorie]/
```

### Drive → INTERN
```
Suchfilter: name contains "vertrag" OR "intern" OR "NDA" OR "rechnung"
Aktion:     → 05_INTERN/
```

---

## ═══ 06_NOTEPAD — Notizen & Notebooks ═══

### Unterordner-Blaupausen

#### 📝 note/
- `.md` `.txt` — Notizen mit P-/I-/R- Präfix
- `short/` (<500 Wörter) · `long/` (≥500 Wörter)

#### ✅ todo/
- `.md` `.json` — Aufgabenlisten, Checklisten
- Format: `TODO-YYYY-MM-DD-titel.md`

#### 💡 idea/
- `.md` — Ideen, Brainstorming, Konzepte
- Format: `I-titel.md`

#### 🎯 use-case/
- `.md` `.json` — Use Cases mit Status-Tracking
- Format: `UC-NNN-titel.md`

#### 📓 notebook/
- `jupyter/` → `.ipynb` (JupiterLab)
- `canvas/` → `.json` `.flow` (Canvas+Flow Workflows)
- `puter/` → `.log` `.json` (Puter+OpenManus Sessions)

#### 📅 meeting/
- `log/` → Meeting-Protokolle `.md`
- `blaupausen/` → Meeting-Vorlagen
- `usecase/` → Meeting-bezogene Use Cases
- `checklist/` → Checklisten `.md`

#### 📚 archive/
- `master/log/` → Erledigte Master-Logs
- `backup/` → Snapshots
- `raw/YYYY-MM/` → Originaldateien nach Monat

### Gmail → NOTEPAD
```
Suchfilter: label:drafts (subject:notiz OR subject:todo OR subject:idee OR subject:meeting)
Aktion:     → 06_NOTEPAD/[unterordner]/ (auto-detect Typ)
```

### Drive → NOTEPAD
```
Suchfilter: type:document modified:last7days name contains "note" OR "todo"
Aktion:     → 06_NOTEPAD/note/ oder todo/
```

---

## ═══ 07_PRIVAT — Persönlich ═══

### Unterordner
- `personal/` → Persönliche Dokumente
- `finanzen/` → `.pdf` `.xlsx` (Rechnungen, Steuer)
- `gesundheit/` → Gesundheitsdaten
- `legal/` → `.pdf` (Verträge, Ausweise)
- `credentials/` → `.kdbx` `.gpg` (verschlüsselt!)
- `journal/` → `.md` (Tagebuch)

### Gmail → PRIVAT
```
Suchfilter: label:drafts label:privat OR (subject:privat OR subject:steuer OR subject:arzt)
Aktion:     → 07_PRIVAT/[kategorie]/ · ⚠️ R24 ALARM an 777
```

### Drive → PRIVAT
```
Suchfilter: visibility:private name contains "privat" OR "steuer" OR "gesundheit"
Aktion:     → 07_PRIVAT/ (verschlüsselt sync)
```

> ⚠️ **NIEMALS in Git** · Verschlüsselt in Drive · R24 ALARM vor Archivierung

---

## ═══ 99_ARCHIVE — Abgeschlossenes ═══

### Auto-Archiv Regeln (30-Tage)
| Quelle | Trigger | Ziel |
|:-------|:--------|:-----|
| 06_NOTEPAD/note | 30d inaktiv | archive/notes-short/ oder notes-long/ |
| 06_NOTEPAD/todo | 7d erledigt | archive/master/log/ |
| 06_NOTEPAD/idea | 30d unbearbeitet | ⚠️ Markieren |
| 06_NOTEPAD/use-case | 90d inaktiv | archive/ |
| 06_NOTEPAD/meeting | 3d vergangen | archive/raw/YYYY-MM/ |
| 01_PROJECTS/* | Projekt abgeschlossen | 99_ARCHIVE/projekte/ |
| 00_INBOX/* | 14d unsortiert | 99_ARCHIVE/inbox-overflow/ |

### Gmail → ARCHIVE
```
Suchfilter: label:drafts older_than:30d
Aktion:     Anhänge sichern → 99_ARCHIVE/gmail/YYYY-MM/ · Entwurf archivieren
```

### Drive → ARCHIVE
```
Suchfilter: modifiedDate < 30 days ago AND NOT starred
Aktion:     → 99_ARCHIVE/drive/YYYY-MM/
```

---

## ═══ APPS SCRIPT: Gmail Entwürfe Scanner ═══

```javascript
// Apps Script: Gmail Entwürfe → DkZ Kategorien
function scanDrafts() {
  const drafts = GmailApp.getDrafts();
  const sheet = SpreadsheetApp.getActiveSpreadsheet()
    .getSheetByName('Entwürfe') || SpreadsheetApp.getActiveSpreadsheet()
    .insertSheet('Entwürfe');
  
  sheet.clear();
  sheet.appendRow(['ID', 'Betreff', 'Datum', 'Anhänge', 'Kategorie', 'Zielordner']);
  
  drafts.forEach(draft => {
    const msg = draft.getMessage();
    const subject = msg.getSubject() || '(kein Betreff)';
    const date = msg.getDate();
    const attachments = msg.getAttachments().length;
    const kategorie = classifyDraft(subject, msg);
    const ziel = getTargetFolder(kategorie);
    
    sheet.appendRow([draft.getId(), subject, date, attachments, kategorie, ziel]);
  });
}

function classifyDraft(subject, msg) {
  const s = subject.toLowerCase();
  if (/projekt|feature|sprint|deploy/.test(s)) return '01_PROJECTS';
  if (/research|paper|studie/.test(s)) return '02_RESEARCH';
  if (/config|server|backup/.test(s)) return '04_SYSTEM';
  if (/vertrag|intern|nda/.test(s)) return '05_INTERN';
  if (/notiz|todo|idee|meeting/.test(s)) return '06_NOTEPAD';
  if (/privat|steuer|arzt/.test(s)) return '07_PRIVAT';
  if (msg.getAttachments().some(a => /\.(jpg|png|mp4)$/i.test(a.getName()))) return '03_MEDIA';
  return '00_INBOX';
}

function getTargetFolder(kat) {
  const map = {
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
```

---

## ═══ APPS SCRIPT: Drive Loose Files Finder ═══

```javascript
// Apps Script: Lose Dateien in Google Drive finden + klassifizieren
function findLooseFiles() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet()
    .getSheetByName('Lose Dateien') || SpreadsheetApp.getActiveSpreadsheet()
    .insertSheet('Lose Dateien');
  
  sheet.clear();
  sheet.appendRow(['Name', 'Typ', 'Größe', 'Geändert', 'Kategorie', 'Zielordner']);
  
  // Dateien im Root (ohne Ordner-Eltern)
  const rootFiles = DriveApp.getRootFolder().getFiles();
  
  while (rootFiles.hasNext()) {
    const file = rootFiles.next();
    const name = file.getName();
    const mime = file.getMimeType();
    const size = formatSize(file.getSize());
    const modified = file.getLastUpdated();
    const kategorie = classifyFile(name, mime);
    const ziel = getTargetFolder(kategorie);
    
    sheet.appendRow([name, mime.split('/').pop(), size, modified, kategorie, ziel]);
  }
}

function classifyFile(name, mime) {
  const n = name.toLowerCase();
  const m = mime.toLowerCase();
  
  // Media
  if (/image|video|audio/.test(m) || /\.(jpg|png|mp4|mp3|svg|gif)$/i.test(n)) return '03_MEDIA';
  // Code/Projects
  if (/\.(js|html|css|py|json|yml)$/i.test(n)) return '01_PROJECTS';
  // Research
  if (/\.(pdf|epub|bib)$/i.test(n) || /paper|research|studie/i.test(n)) return '02_RESEARCH';
  // Notebook
  if (/\.(ipynb|md|txt)$/i.test(n) || /notiz|todo|note/i.test(n)) return '06_NOTEPAD';
  // Office/Intern
  if (/\.(docx|xlsx|pptx)$/i.test(n) || /vertrag|intern/i.test(n)) return '05_INTERN';
  // System
  if (/\.(env|yml|conf|sh|bat)$/i.test(n) || /config|backup/i.test(n)) return '04_SYSTEM';
  // Privat
  if (/privat|steuer|gesundheit/i.test(n)) return '07_PRIVAT';
  // Archive
  if (/\.(zip|rar|bak|sql)$/i.test(n)) return 'DEEPKEEP';
  
  return '00_INBOX';
}

function formatSize(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1048576) return (bytes/1024).toFixed(1) + ' KB';
  return (bytes/1048576).toFixed(1) + ' MB';
}
```

---

> **Kein Löschen!** (R1) · **R24 ALARM** vor Archivierung · **777 muss bestätigen**
> **Tags:** #blaupause #gmail #drive #kategorien #apps-script #power-plus
