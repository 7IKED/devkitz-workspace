// DEVKiTZ™ Ecosystem — Electron Desktop App
// @DKZ:RULES -> Siehe REGELWERK.md
// Version: v0.02.0_01
// Integriert in devkitz-workspace

const { app, BrowserWindow, Tray, Menu, ipcMain, globalShortcut } = require('electron');
const path = require('path');
const fs = require('fs');
const { exec } = require('child_process');

let mainWindow;
let tray = null;

// WICHTIG: Auf devkitz-workspace zeigen (nicht den alten devkitz-ecosystem)
const REPO_URL = 'https://github.com/7IKED/devkitz-workspace.git';

// Dashboard Entry Point (direkt zum Kanban fuer Issues/PRs)
const DASHBOARD_PATH = '01_PROJECTS/01_dashboard/modules/github-kanban/index.html';

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    icon: getIconPath(),
    webPreferences: {
      // SECURITY NOTE: nodeIntegration ist noetig fuer Electron IPC
      // contextIsolation sollte in v2 auf true gesetzt werden mit preload script
      nodeIntegration: true,
      contextIsolation: false
    },
    autoHideMenuBar: true,
    backgroundColor: '#060608',
    title: 'DEVKiTZ™ Ecosystem'
  });

  mainWindow.on('close', function (event) {
    if (!app.isQuitting) {
      event.preventDefault();
      mainWindow.hide();
    }
    return false;
  });

  checkAndLoadEcosystem();
}

/**
 * Icon-Pfad ermitteln — verschiedene Locations pruefen
 */
function getIconPath() {
  const candidates = [
    path.join(__dirname, '..', '01_PROJECTS', '01_dashboard', 'modules', 'icon-creator', 'icons', 'devkitz.ico'),
    path.join(__dirname, 'desktop-app', 'devkitz.ico'),
    path.join(__dirname, '01_PROJECTS', '01_dashboard', 'modules', 'icon-creator', 'icons', 'devkitz.ico')
  ];
  for (const p of candidates) {
    if (fs.existsSync(p)) return p;
  }
  return undefined; // System default
}

/**
 * Lade-Reihenfolge:
 * 1. Dev-Modus: Workspace-Root (eine Ebene ueber runtime/)
 * 2. Persoenlicher Clone in Dokumente
 * 3. Lokaler C:\DEVKiTZ Pfad
 * 4. Setup-Screen (klont das Repo)
 */
function checkAndLoadEcosystem() {
  const documentsPath = app.getPath('documents');
  const targetPath = path.join(documentsPath, 'DEVKiTZ_Ecosystem');
  const localDevkitzPath = 'C:\\DEVKiTZ';
  const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;

  // Dev-Modus: Dashboard aus dem Workspace-Root laden
  if (isDev) {
    const workspaceRoot = path.join(__dirname, '..');
    const dashboardFile = path.join(workspaceRoot, DASHBOARD_PATH);
    if (fs.existsSync(dashboardFile)) {
      mainWindow.loadFile(dashboardFile);
      return;
    }
  }

  // Persoenlicher Clone in Dokumente
  if (fs.existsSync(path.join(targetPath, '01_PROJECTS'))) {
    mainWindow.loadFile(path.join(targetPath, DASHBOARD_PATH));
    checkForUpdates(targetPath);
  }
  // Lokaler C:\DEVKiTZ Pfad
  else if (fs.existsSync(path.join(localDevkitzPath, '01_PROJECTS'))) {
    mainWindow.loadFile(path.join(localDevkitzPath, DASHBOARD_PATH));
  }
  // Setup Screen — Repo klonen
  else {
    mainWindow.loadFile(path.join(__dirname, 'desktop-app', 'setup.html'));
    mainWindow.webContents.on('did-finish-load', () => {
      cloneRepo(targetPath);
    });
  }
}

/**
 * Auto-Update Check: 10s nach Start, dann stuendlich
 */
function checkForUpdates(targetPath) {
  const checkCmd = 'git fetch && git status -uno';
  const checkLogic = () => {
    exec(checkCmd, { cwd: targetPath }, (err, stdout) => {
      if (!err && stdout.includes('Your branch is behind')) {
        mainWindow.webContents.send('update-available');
      }
    });
  };

  setTimeout(checkLogic, 10000);
  setInterval(checkLogic, 3600000);
}

ipcMain.on('trigger-update', (event) => {
  const documentsPath = app.getPath('documents');
  const targetPath = path.join(documentsPath, 'DEVKiTZ_Ecosystem');
  exec('git pull', { cwd: targetPath }, (err) => {
    if (!err) {
      mainWindow.reload();
    }
  });
});

/**
 * Repo klonen und Dashboard laden
 */
function cloneRepo(targetPath) {
  mainWindow.webContents.send('setup-log', 'Starte Klon-Vorgang via Git...');
  mainWindow.webContents.send('setup-log', `Zielverzeichnis: ${targetPath}`);

  if (!fs.existsSync(targetPath)) {
    fs.mkdirSync(targetPath, { recursive: true });
  }

  // Shallow clone fuer schnelleren Start (--depth 1)
  const command = `git clone --depth 1 ${REPO_URL} "${targetPath}"`;

  exec(command, { timeout: 120000 }, (error, stdout, stderr) => {
    if (error) {
      mainWindow.webContents.send('setup-error',
        `Git Error: ${error.message}\nBitte stelle sicher, dass Git (git-scm.com) installiert ist.`
      );
      return;
    }
    mainWindow.webContents.send('setup-log', 'Repository erfolgreich geklont!');
    mainWindow.webContents.send('setup-complete');

    setTimeout(() => {
      mainWindow.loadFile(path.join(targetPath, DASHBOARD_PATH));
      checkForUpdates(targetPath);
    }, 2000);
  });
}

// ═══════════════════════════════════════════
// App Lifecycle
// ═══════════════════════════════════════════

app.whenReady().then(() => {
  createWindow();

  // Global Shortcut: Ctrl+Shift+Space togglet das Fenster
  globalShortcut.register('CommandOrControl+Shift+Space', () => {
    if (mainWindow) {
      mainWindow.isVisible() ? mainWindow.hide() : mainWindow.show();
    }
  });

  // Copilot automatisch mitstarten
  const copilotPath = path.join(__dirname, '..', '01_PROJECTS', 'nexus-copilot', 'frontend');
  if (fs.existsSync(copilotPath)) {
    console.log('Starte Nexus Copilot...');
    const npxCmd = process.platform === 'win32' ? 'npx.cmd' : 'npx';
    exec(`${npxCmd} electron .`, { cwd: copilotPath }, (err) => {
      if (err) console.error('Fehler beim Starten von Nexus Copilot:', err);
    });
  }

  // Tray Icon
  const iconPath = getIconPath();
  if (iconPath) {
    try {
      tray = new Tray(iconPath);
    } catch (e) {
      console.warn('Tray-Icon konnte nicht geladen werden:', e.message);
    }
  }

  if (tray) {
    const contextMenu = Menu.buildFromTemplate([
      { label: 'DEVKiTZ oeffnen', click: () => mainWindow.show() },
      { type: 'separator' },
      {
        label: 'Beenden', click: () => {
          app.isQuitting = true;
          app.quit();
        }
      }
    ]);
    tray.setToolTip('DEVKiTZ™ Ecosystem');
    tray.setContextMenu(contextMenu);
    tray.on('click', () => {
      mainWindow.isVisible() ? mainWindow.hide() : mainWindow.show();
    });
  }

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});
