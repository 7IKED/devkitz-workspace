// Nexus Copilot — Electron Desktop Shell
// @DKZ:RULES -> Siehe REGELWERK.md
const { app, BrowserWindow, Menu, Tray, globalShortcut, ipcMain } = require('electron');
const path = require('path');
const { exec } = require('child_process');
const express = require('express');
const cors = require('cors');

let mainWindow;
let tray = null;
let isQuitting = false;

// ==========================================
// Interner Backend Server (Gemma 4 + Autonomy)
// ==========================================
function startInternalServer() {
  const serverApp = express();
  serverApp.use(cors());
  serverApp.use(express.json());

  serverApp.get('/api/health', (req, res) => {
    res.json({ status: 'online', mode: 'god-mode' });
  });

  serverApp.post('/api/chat', async (req, res) => {
    const { message } = req.body;
    
    // 1. Ollama Call (gemma4:12b)
    try {
      const ollamaRes = await fetch('http://localhost:11434/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'gemma4:12b',
          prompt: `Du bist der Nexus Copilot (DEVKiTZ). Du kannst Systembefehle in <EXECUTE>CMD</EXECUTE> Tags verpacken, um autonom Dinge für den User einzurichten. User Anfrage: ${message}`,
          stream: false
        })
      });
      
      if (!ollamaRes.ok) {
        throw new Error('Ollama nicht erreichbar');
      }

      const ollamaData = await ollamaRes.json();
      const aiReply = ollamaData.response;

      // 2. Parse for <EXECUTE> commands
      const execMatch = aiReply.match(/<EXECUTE>(.*?)<\/EXECUTE>/s);
      if (execMatch) {
        const cmd = execMatch[1].trim();
        exec(cmd, { cwd: app.getPath('desktop') }, (err, stdout, stderr) => {
          if (mainWindow) {
            mainWindow.webContents.send('cmd-result', {
              cmd, 
              output: err ? stderr : stdout 
            });
          }
        });
      }

      res.json({ reply: aiReply, timestamp: Date.now() });

    } catch (e) {
      // Fallback
      res.json({
        reply: `[Fallback] Internes System aktiv. Ollama gemma4:12b nicht gefunden. Deine Nachricht: "${message}"`,
        timestamp: Date.now()
      });
    }
  });

  serverApp.listen(7778, () => {
    console.log('Nexus Interner API Server laeuft auf Port 7778');
  });
}


let mainWindow;
let tray = null;
let isQuitting = false;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 480,
    height: 720,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    skipTaskbar: true,
    show: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  mainWindow.loadFile(path.join(__dirname, 'ui', 'index.html'));

  // Rechts unten platzieren
  const { screen } = require('electron');
  const display = screen.getPrimaryDisplay();
  const { width, height } = display.workAreaSize;
  mainWindow.setPosition(width - 500, height - 740);

  mainWindow.on('close', (e) => {
    if (!isQuitting) {
      e.preventDefault();
      mainWindow.hide();
    }
  });

  mainWindow.on('blur', () => {
    if (!mainWindow.webContents.isDevToolsOpened()) {
      mainWindow.hide();
    }
  });
}

function createTray() {
  // Simple Placeholder Icon (should be replaced with proper DkZ icon)
  const iconPath = path.join(__dirname, 'ui', 'icons', 'icon-16x16.png');
  // Fallback if icon doesn't exist yet
  try {
    tray = new Tray(iconPath);
  } catch (e) {
    const { nativeImage } = require('electron');
    const canvas = nativeImage.createEmpty();
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16">
        <circle cx="8" cy="8" r="7" fill="#fa1e4e" stroke="#333" stroke-width="1"/>
        <text x="8" y="11" text-anchor="middle" font-size="8" fill="#fff" font-weight="bold">N</text>
    </svg>`;
    const base64 = Buffer.from(svg).toString('base64');
    tray = new Tray(nativeImage.createFromDataURL('data:image/svg+xml;base64,' + base64));
  }

  tray.setToolTip('Nexus Copilot™');
  
  const contextMenu = Menu.buildFromTemplate([
    { label: '💬 Oeffnen (Ctrl+Space)', click: () => toggleWindow() },
    { type: 'separator' },
    { label: '❌ Beenden', click: () => { isQuitting = true; app.quit(); } }
  ]);
  
  tray.setContextMenu(contextMenu);
  tray.on('click', () => toggleWindow());
}

function toggleWindow() {
  if (!mainWindow) createWindow();
  if (mainWindow.isVisible()) {
    mainWindow.hide();
  } else {
    mainWindow.show();
    mainWindow.focus();
  }
}

app.whenReady().then(() => {
  startInternalServer(); // Server im Hintergrund mitstarten
  createWindow();
  createTray();

  globalShortcut.register('CommandOrControl+Space', () => {
    toggleWindow();
  });

  console.log('Nexus Copilot Shell gestartet.');
});

app.on('will-quit', () => {
  globalShortcut.unregisterAll();
});

app.on('window-all-closed', (e) => {
  e.preventDefault();
});
