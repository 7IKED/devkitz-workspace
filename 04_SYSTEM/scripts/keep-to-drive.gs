/**
 * DkZ Keep-to-Drive Exporter v2
 * ================================
 * Google Apps Script — Exportiert ALLE Google Keep Notizen nach Google Drive
 * Danach: Keep leeren, Tags mit GitHub Tags fuellen
 * 
 * SETUP:
 * 1. https://script.google.com → Neues Projekt
 * 2. Diesen Code einfuegen
 * 3. Services → "Google Keep API" hinzufuegen
 * 4. setupDriveStructure() einmal ausfuehren
 * 5. exportAllKeepNotes() ausfuehren
 * 6. Optional: deleteAllKeepNotes() nach Pruefung
 * 7. Trigger setzen: syncKeepToDrive() alle 15 Min (solange Keep noch genutzt wird)
 * 
 * DRIVE STRUKTUR:
 * DEVKiTZ-Notepad/
 *   note/
 *     keep-import/     → Alle Keep-Notizen als .md
 *     idea/            → Ideen (Label: idea)
 *     snippets/        → Code-Snippets (Label: snippet)
 *     notebook/        → Notizbuch (Label: notebook)
 *     use-case/        → Use Cases (Label: use-case)
 *     tags/            → Tag-Index als JSON
 *   archive/           → Archivierte Notizen
 *   todo/              → Checklisten
 *   meeting/           → Meeting-Notizen
 */

// === CONFIG ===
const DRIVE_ROOT = 'DEVKiTZ-Notepad';
const NOTE_FOLDER = 'note';
const GITHUB_REPO = '7IKED/devkitz-workspace';
const GITHUB_TAGS_URL = 'https://api.github.com/repos/' + GITHUB_REPO + '/labels';

// DkZ Tag-System (wird in Keep und Drive verwendet)
const DKZ_TAGS = {
  // Projekt-Tags
  'dkz-copilot': { color: '#fa1e4e', description: 'CoPilot Agent System' },
  'dkz-dashboard': { color: '#3b82f6', description: 'Dashboard Module' },
  'dkz-gateway': { color: '#8b5cf6', description: 'Gateway v2' },
  'dkz-graphify': { color: '#06b6d4', description: 'Knowledge Graph' },
  'dkz-mirofish': { color: '#ec4899', description: 'MiroFish Simulator' },
  'dkz-gitnexus': { color: '#10b981', description: 'GitNexus Explorer' },
  'dkz-openhumans': { color: '#a855f7', description: 'OpenHumans Hub' },
  'dkz-openhands': { color: '#f59e0b', description: 'OpenHands Agent' },
  'dkz-deepkeep': { color: '#ef4444', description: 'Security Tresor' },
  'dkz-cloudia': { color: '#6366f1', description: 'Cloud Control' },
  // Typ-Tags
  'type-bug': { color: '#ff3b5c', description: 'Bug Report' },
  'type-feature': { color: '#00ff88', description: 'Feature Request' },
  'type-idea': { color: '#ffb800', description: 'Idee' },
  'type-research': { color: '#14b8a6', description: 'Research' },
  'type-task': { color: '#3b82f6', description: 'Task / TODO' },
  'type-meeting': { color: '#8b5cf6', description: 'Meeting Notes' },
  'type-snippet': { color: '#84cc16', description: 'Code Snippet' },
  // Prio-Tags
  'prio-p0': { color: '#ff0000', description: 'Kritisch' },
  'prio-p1': { color: '#ff3b5c', description: 'Hoch' },
  'prio-p2': { color: '#ffb800', description: 'Mittel' },
  'prio-p3': { color: '#00ff88', description: 'Niedrig' },
  // Status-Tags
  'status-open': { color: '#3b82f6', description: 'Offen' },
  'status-wip': { color: '#ffb800', description: 'In Arbeit' },
  'status-done': { color: '#00ff88', description: 'Erledigt' },
  'status-blocked': { color: '#ff3b5c', description: 'Blockiert' },
};

// === SETUP ===
function setupDriveStructure() {
  const root = getOrCreateFolder_(null, DRIVE_ROOT);
  const note = getOrCreateFolder_(root, NOTE_FOLDER);
  getOrCreateFolder_(note, 'keep-import');
  getOrCreateFolder_(note, 'idea');
  getOrCreateFolder_(note, 'snippets');
  getOrCreateFolder_(note, 'notebook');
  getOrCreateFolder_(note, 'use-case');
  getOrCreateFolder_(note, 'tags');
  getOrCreateFolder_(root, 'archive');
  getOrCreateFolder_(root, 'todo');
  getOrCreateFolder_(root, 'meeting');
  
  Logger.log('✅ Drive-Struktur erstellt: ' + DRIVE_ROOT);
  Logger.log('📁 Pfad: My Drive/' + DRIVE_ROOT + '/' + NOTE_FOLDER + '/');
}

// === EXPORT ALL KEEP NOTES ===
function exportAllKeepNotes() {
  const root = getOrCreateFolder_(null, DRIVE_ROOT);
  const noteFolder = getOrCreateFolder_(root, NOTE_FOLDER);
  const importFolder = getOrCreateFolder_(noteFolder, 'keep-import');
  const todoFolder = getOrCreateFolder_(root, 'todo');
  const archiveFolder = getOrCreateFolder_(root, 'archive');
  const tagsFolder = getOrCreateFolder_(noteFolder, 'tags');
  
  let exported = 0;
  let errors = 0;
  const tagIndex = {};
  const allNotes = [];
  
  try {
    // Google Keep API abrufen
    const notes = Keep.Notes.list();
    
    if (!notes || !notes.notes || notes.notes.length === 0) {
      Logger.log('⚠️ Keine Keep-Notizen gefunden.');
      // Fallback: Takeout-Hinweis
      createTakeoutInstructions_(importFolder);
      return;
    }
    
    Logger.log('📋 ' + notes.notes.length + ' Notizen gefunden.');
    
    notes.notes.forEach(function(note, idx) {
      try {
        const title = note.title || 'Notiz-' + (idx + 1);
        const body = note.body ? note.body.text || '' : '';
        const labels = (note.labels || []).map(function(l) { return l.name; });
        const created = note.createTime || new Date().toISOString();
        const updated = note.updateTime || created;
        const isArchived = note.trashed || false;
        const isList = note.body && note.body.list;
        
        // Markdown erstellen
        var md = '# ' + title + '\n\n';
        md += '> Erstellt: ' + created + '\n';
        md += '> Aktualisiert: ' + updated + '\n';
        if (labels.length) md += '> Tags: ' + labels.join(', ') + '\n';
        md += '\n---\n\n';
        
        if (isList) {
          // Checkliste
          note.body.list.listItems.forEach(function(item) {
            const checked = item.checked ? '[x]' : '[ ]';
            const text = item.text ? item.text.text || '' : '';
            md += '- ' + checked + ' ' + text + '\n';
          });
        } else {
          md += body;
        }
        
        // Tags sammeln
        labels.forEach(function(tag) {
          if (!tagIndex[tag]) tagIndex[tag] = [];
          tagIndex[tag].push({ title: title, file: sanitize_(title) + '.md' });
        });
        
        // Ziel-Ordner bestimmen
        var targetFolder = importFolder;
        if (isArchived) targetFolder = archiveFolder;
        else if (isList) targetFolder = todoFolder;
        else if (labels.some(function(l) { return l.toLowerCase().includes('idea'); })) {
          targetFolder = getOrCreateFolder_(noteFolder, 'idea');
        }
        else if (labels.some(function(l) { return l.toLowerCase().includes('snippet'); })) {
          targetFolder = getOrCreateFolder_(noteFolder, 'snippets');
        }
        
        // Datei erstellen
        const filename = sanitize_(title) + '.md';
        targetFolder.createFile(filename, md, 'text/markdown');
        exported++;
        
        allNotes.push({
          title: title,
          file: filename,
          labels: labels,
          created: created,
          folder: targetFolder.getName(),
          isList: !!isList
        });
        
      } catch(e) {
        Logger.log('❌ Fehler bei Notiz ' + idx + ': ' + e.message);
        errors++;
      }
    });
    
    // Tag-Index speichern
    tagsFolder.createFile('tag-index.json', JSON.stringify(tagIndex, null, 2), 'application/json');
    
    // Export-Manifest
    const manifest = {
      exported: exported,
      errors: errors,
      date: new Date().toISOString(),
      source: 'Google Keep',
      target: DRIVE_ROOT + '/' + NOTE_FOLDER,
      notes: allNotes
    };
    importFolder.createFile('_manifest.json', JSON.stringify(manifest, null, 2), 'application/json');
    
    Logger.log('✅ Export fertig: ' + exported + ' Notizen, ' + errors + ' Fehler');
    Logger.log('📁 Gespeichert in: My Drive/' + DRIVE_ROOT);
    
  } catch(e) {
    Logger.log('❌ Keep API Fehler: ' + e.message);
    Logger.log('💡 Fallback: Google Takeout verwenden');
    createTakeoutInstructions_(importFolder);
  }
}

// === SYNC (fuer Trigger) ===
function syncKeepToDrive() {
  // Prueft auf neue Notizen seit letztem Sync
  const props = PropertiesService.getScriptProperties();
  const lastSync = props.getProperty('lastSync') || '2020-01-01T00:00:00Z';
  
  try {
    const notes = Keep.Notes.list({ filter: 'updateTime > "' + lastSync + '"' });
    if (notes && notes.notes && notes.notes.length > 0) {
      Logger.log('🔄 ' + notes.notes.length + ' neue/geaenderte Notizen seit ' + lastSync);
      exportAllKeepNotes(); // Re-export alles
    } else {
      Logger.log('✅ Keine Aenderungen seit ' + lastSync);
    }
  } catch(e) {
    Logger.log('⚠️ Sync-Fehler: ' + e.message);
  }
  
  props.setProperty('lastSync', new Date().toISOString());
}

// === DELETE ALL KEEP NOTES ===
function deleteAllKeepNotes() {
  // ⚠️ WARNUNG: Loescht ALLE Keep-Notizen!
  // Nur ausfuehren NACHDEM exportAllKeepNotes() erfolgreich war!
  
  const ui = SpreadsheetApp.getUi ? SpreadsheetApp.getUi() : null;
  
  try {
    const notes = Keep.Notes.list();
    if (!notes || !notes.notes) {
      Logger.log('Keine Notizen zum Loeschen.');
      return;
    }
    
    var count = 0;
    notes.notes.forEach(function(note) {
      try {
        Keep.Notes.remove(note.name);
        count++;
      } catch(e) {
        // Trash statt delete
        try {
          note.trashed = true;
          Keep.Notes.patch(note, note.name);
          count++;
        } catch(e2) {
          Logger.log('⚠️ Konnte nicht loeschen: ' + (note.title || note.name));
        }
      }
    });
    
    Logger.log('🗑️ ' + count + ' Notizen geloescht/archiviert.');
    
  } catch(e) {
    Logger.log('❌ Fehler: ' + e.message);
  }
}

// === GITHUB TAGS SYNC ===
function syncGitHubTags() {
  // Holt GitHub Labels und erstellt sie als Keep-Labels / Drive-Tags
  const root = getOrCreateFolder_(null, DRIVE_ROOT);
  const noteFolder = getOrCreateFolder_(root, NOTE_FOLDER);
  const tagsFolder = getOrCreateFolder_(noteFolder, 'tags');
  
  try {
    const response = UrlFetchApp.fetch(GITHUB_TAGS_URL, {
      headers: { 'Accept': 'application/vnd.github.v3+json' },
      muteHttpExceptions: true
    });
    
    if (response.getResponseCode() === 200) {
      const labels = JSON.parse(response.getContentText());
      
      // Merge mit DkZ Tags
      const allTags = Object.assign({}, DKZ_TAGS);
      labels.forEach(function(label) {
        allTags['gh-' + label.name] = {
          color: '#' + label.color,
          description: label.description || label.name,
          source: 'github'
        };
      });
      
      // Speichern
      const existing = tagsFolder.getFilesByName('github-labels.json');
      if (existing.hasNext()) existing.next().setTrashed(true);
      tagsFolder.createFile('github-labels.json', JSON.stringify(allTags, null, 2), 'application/json');
      
      const existing2 = tagsFolder.getFilesByName('dkz-tags.json');
      if (existing2.hasNext()) existing2.next().setTrashed(true);
      tagsFolder.createFile('dkz-tags.json', JSON.stringify(DKZ_TAGS, null, 2), 'application/json');
      
      Logger.log('✅ ' + labels.length + ' GitHub Labels + ' + Object.keys(DKZ_TAGS).length + ' DkZ Tags gespeichert');
      
    } else {
      Logger.log('⚠️ GitHub API: ' + response.getResponseCode());
      // Nur DkZ Tags speichern
      const existing = tagsFolder.getFilesByName('dkz-tags.json');
      if (existing.hasNext()) existing.next().setTrashed(true);
      tagsFolder.createFile('dkz-tags.json', JSON.stringify(DKZ_TAGS, null, 2), 'application/json');
      Logger.log('✅ ' + Object.keys(DKZ_TAGS).length + ' DkZ Tags gespeichert (ohne GitHub)');
    }
    
  } catch(e) {
    Logger.log('❌ GitHub Tags Fehler: ' + e.message);
  }
}

// === PUSH TAGS TO GITHUB ===
function pushTagsToGitHub() {
  // Erstellt DkZ Tags als GitHub Labels
  const token = PropertiesService.getScriptProperties().getProperty('GITHUB_TOKEN');
  if (!token) {
    Logger.log('⚠️ GITHUB_TOKEN nicht gesetzt. Setze unter Projekteinstellungen → Skripteigenschaften');
    return;
  }
  
  var created = 0;
  Object.keys(DKZ_TAGS).forEach(function(tag) {
    const data = DKZ_TAGS[tag];
    try {
      UrlFetchApp.fetch(GITHUB_TAGS_URL, {
        method: 'POST',
        headers: {
          'Authorization': 'token ' + token,
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json'
        },
        payload: JSON.stringify({
          name: tag,
          color: data.color.replace('#', ''),
          description: data.description
        }),
        muteHttpExceptions: true
      });
      created++;
    } catch(e) {}
  });
  
  Logger.log('✅ ' + created + ' Tags zu GitHub gepusht');
}

// === TAKEOUT FALLBACK ===
function createTakeoutInstructions_(folder) {
  const md = '# Google Keep Export via Takeout\n\n'
    + '## Anleitung\n\n'
    + '1. Gehe zu https://takeout.google.com\n'
    + '2. "Alle abwaehlen" klicken\n'
    + '3. Nur "Google Keep" anhaengen\n'
    + '4. "Naechster Schritt" → Export erstellen\n'
    + '5. ZIP herunterladen\n'
    + '6. Entpacken nach: `C:\\DEVKiTZ\\06_NOTEPAD\\note\\keep-import\\`\n'
    + '7. `process-takeout.ps1` ausfuehren\n\n'
    + '## Automatisch\n\n'
    + '```powershell\n'
    + '# In DEVKiTZ Terminal:\n'
    + '.\\06_NOTEPAD\\process-takeout.ps1\n'
    + '```\n';
  folder.createFile('_TAKEOUT_ANLEITUNG.md', md, 'text/markdown');
}

// === FULL PIPELINE ===
function fullPipeline() {
  Logger.log('🚀 DkZ Keep → Drive Pipeline gestartet');
  Logger.log('=====================================');
  
  // 1. Ordner-Struktur
  setupDriveStructure();
  
  // 2. GitHub Tags holen + speichern
  syncGitHubTags();
  
  // 3. Keep exportieren
  exportAllKeepNotes();
  
  // 4. NICHT automatisch loeschen — manuell mit deleteAllKeepNotes()
  Logger.log('');
  Logger.log('⚠️ Keep-Notizen NICHT automatisch geloescht.');
  Logger.log('💡 Nach Pruefung: deleteAllKeepNotes() manuell ausfuehren.');
  Logger.log('=====================================');
  Logger.log('✅ Pipeline fertig');
}

// === HELPERS ===
function getOrCreateFolder_(parent, name) {
  var search;
  if (parent) {
    search = parent.getFoldersByName(name);
  } else {
    search = DriveApp.getFoldersByName(name);
  }
  if (search.hasNext()) return search.next();
  if (parent) return parent.createFolder(name);
  return DriveApp.createFolder(name);
}

function sanitize_(name) {
  return (name || 'untitled')
    .replace(/[\/\\:*?"<>|]/g, '-')
    .replace(/\s+/g, '-')
    .substring(0, 100)
    .toLowerCase();
}
