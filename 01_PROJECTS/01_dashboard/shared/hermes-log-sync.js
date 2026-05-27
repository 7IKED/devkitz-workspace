#!/usr/bin/env node
/**
 * DkZ Hermes Log Sync — Automatische Archivierung
 * @DKZ:TAG → [SHARED:hermes-log-sync] [CAT:shared] [LANG:js]
 * @DKZ:RULES → R21 Shared Scripts
 * @version v0.01.1_01
 * 
 * Liest Hermes Sessions und archiviert sie in:
 * 1. Second Brain: C:\Users\BAZE²\Documents\SecondBrain\03_Chat_Logs\hermes\
 * 2. WissenHub:    modules/wissen-hub/archive/walkthroughs/
 * 
 * Nutzung: node hermes-log-sync.js
 * Auto:    Via Task Scheduler oder nach jeder Session
 */

const fs = require('fs');
const path = require('path');

// === KONFIGURATION ===
const HERMES_HOME = path.join(process.env.USERPROFILE, '.hermes');
const SESSIONS_DIR = path.join(HERMES_HOME, 'sessions');
const LOGS_DIR = path.join(HERMES_HOME, 'logs');

// Ziel 1: Second Brain
const BRAIN_DIR = path.join(process.env.USERPROFILE, 'Documents', 'SecondBrain', '03_Chat_Logs', 'hermes');

// Ziel 2: WissenHub
const WISSEN_DIR = path.join('C:', 'DEVKiTZ', '01_PROJECTS', '01_dashboard', 'modules', 'wissen-hub', 'archive', 'walkthroughs');

// Sync-Status
const SYNC_STATE_FILE = path.join(HERMES_HOME, 'log-sync-state.json');

// === HELPERS ===
function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`📁 Erstellt: ${dir}`);
  }
}

function loadSyncState() {
  try {
    return JSON.parse(fs.readFileSync(SYNC_STATE_FILE, 'utf8'));
  } catch {
    return { synced: [] };
  }
}

function saveSyncState(state) {
  fs.writeFileSync(SYNC_STATE_FILE, JSON.stringify(state, null, 2));
}

function extractMessages(sessionData) {
  const messages = [];
  if (!sessionData.messages) return messages;
  
  for (const msg of sessionData.messages) {
    if (msg.role === 'user' || msg.role === 'assistant') {
      const content = typeof msg.content === 'string' 
        ? msg.content 
        : Array.isArray(msg.content) 
          ? msg.content.map(c => c.text || c.content || '').join('\n')
          : '';
      
      if (content && content.trim() && content.trim() !== '(empty)') {
        messages.push({
          role: msg.role,
          content: content.trim().substring(0, 5000) // Max 5K pro Nachricht
        });
      }
    }
  }
  return messages;
}

function sessionToMarkdown(sessionFile, sessionData, messages) {
  const sessionId = path.basename(sessionFile, '.json').replace('session_', '');
  const dateMatch = sessionId.match(/^(\d{4})(\d{2})(\d{2})_(\d{2})(\d{2})(\d{2})/);
  
  let dateStr = new Date().toISOString().split('T')[0];
  let timeStr = '';
  if (dateMatch) {
    dateStr = `${dateMatch[1]}-${dateMatch[2]}-${dateMatch[3]}`;
    timeStr = `${dateMatch[4]}:${dateMatch[5]}:${dateMatch[6]}`;
  }

  const model = sessionData.model || sessionData.tools?.[0]?.model || 'unknown';
  const provider = sessionData.provider || 'openrouter';
  
  let md = `# Hermes Chat — ${dateStr} ${timeStr}\n\n`;
  md += `> Session: \`${sessionId}\`\n`;
  md += `> Modell: ${model} | Provider: ${provider}\n`;
  md += `> Nachrichten: ${messages.length}\n\n`;
  md += `---\n\n`;

  for (const msg of messages) {
    const icon = msg.role === 'user' ? '👤' : '🤖';
    const label = msg.role === 'user' ? 'User' : 'Hermes';
    md += `### ${icon} ${label}\n\n`;
    md += `${msg.content}\n\n`;
    md += `---\n\n`;
  }

  md += `\n*Archiviert am ${new Date().toISOString()} von hermes-log-sync.js*\n`;
  return { md, dateStr, sessionId };
}

// === MAIN ===
function syncLogs() {
  console.log('🔄 DkZ Hermes Log Sync gestartet...\n');

  // Verzeichnisse sicherstellen
  ensureDir(BRAIN_DIR);
  ensureDir(WISSEN_DIR);

  // Sync-State laden
  const state = loadSyncState();

  // Session-Dateien finden
  if (!fs.existsSync(SESSIONS_DIR)) {
    console.log('⚠️  Kein Sessions-Verzeichnis gefunden:', SESSIONS_DIR);
    return;
  }

  const sessionFiles = fs.readdirSync(SESSIONS_DIR)
    .filter(f => f.endsWith('.json') && f.startsWith('session_'))
    .sort();

  console.log(`📋 ${sessionFiles.length} Session(s) gefunden`);

  let synced = 0;
  let skipped = 0;

  for (const file of sessionFiles) {
    if (state.synced.includes(file)) {
      skipped++;
      continue;
    }

    try {
      const filePath = path.join(SESSIONS_DIR, file);
      const raw = fs.readFileSync(filePath, 'utf8');
      const data = JSON.parse(raw);
      const messages = extractMessages(data);

      if (messages.length === 0) {
        state.synced.push(file);
        skipped++;
        continue;
      }

      const { md, dateStr, sessionId } = sessionToMarkdown(file, data, messages);
      const mdFilename = `hermes_${dateStr}_${sessionId.split('_').pop()}.md`;

      // 1. Second Brain
      const brainPath = path.join(BRAIN_DIR, mdFilename);
      fs.writeFileSync(brainPath, md, 'utf8');
      console.log(`  📚 Brain: ${mdFilename}`);

      // 2. WissenHub
      const wissenPath = path.join(WISSEN_DIR, `walkthrough_${dateStr}_hermes-session-${sessionId.split('_').pop()}.md`);
      fs.writeFileSync(wissenPath, md, 'utf8');
      console.log(`  🗄️  Wissen: ${path.basename(wissenPath)}`);

      state.synced.push(file);
      synced++;
    } catch (err) {
      console.error(`  ❌ Fehler bei ${file}: ${err.message}`);
    }
  }

  // Agent + Error Logs kopieren
  try {
    const today = new Date().toISOString().split('T')[0];
    
    for (const logFile of ['agent.log', 'gateway.log', 'errors.log']) {
      const src = path.join(LOGS_DIR, logFile);
      if (fs.existsSync(src)) {
        const dest = path.join(BRAIN_DIR, `${logFile.replace('.log', '')}_${today}.log`);
        fs.copyFileSync(src, dest);
        console.log(`  📝 Log: ${logFile} → Brain`);
      }
    }
  } catch (err) {
    console.error(`  ⚠️  Log-Kopie: ${err.message}`);
  }

  // State speichern
  saveSyncState(state);

  console.log(`\n✅ Sync fertig: ${synced} neu, ${skipped} übersprungen`);
  console.log(`   Brain: ${BRAIN_DIR}`);
  console.log(`   Wissen: ${WISSEN_DIR}`);
}

syncLogs();
