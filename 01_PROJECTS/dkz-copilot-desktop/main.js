/**
 * DkZ Copilot™ v3 — Electron Main Process
 * System Tray + Global Hotkey + James v4 Guardian Brain
 * 
 * Ersetzt MS Copilot komplett.
 * Hotkey: Ctrl+Space oeffnet Quick Chat
 * Tray: Ampel-Status von James v4
 */
const { app, BrowserWindow, Tray, Menu, globalShortcut, nativeImage, ipcMain, Notification } = require('electron');
const path = require('path');

let mainWindow = null;
let tray = null;
let isQuitting = false;

// ========================================
// TRAY ICON (Ampel-Farben als dynamisches Icon)
// ========================================
function createTrayIcon(color) {
    const size = 16;
    const canvas = nativeImage.createEmpty();
    // Erzeuge farbiges Icon als Data-URL
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}">
        <circle cx="8" cy="8" r="7" fill="${color}" stroke="#333" stroke-width="1"/>
        <text x="8" y="11" text-anchor="middle" font-size="8" fill="#000" font-weight="bold">J</text>
    </svg>`;
    const base64 = Buffer.from(svg).toString('base64');
    return nativeImage.createFromDataURL('data:image/svg+xml;base64,' + base64);
}

// ========================================
// MAIN WINDOW (Quick Chat Popup)
// ========================================
function createWindow() {
    mainWindow = new BrowserWindow({
        width: 480,
        height: 640,
        frame: false,
        transparent: true,
        resizable: true,
        alwaysOnTop: true,
        skipTaskbar: true,
        show: false,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            webSecurity: false
        }
    });

    mainWindow.loadFile(path.join(__dirname, 'ui', 'index.html'));

    // Position: rechts unten (wie MS Copilot)
    const { screen } = require('electron');
    const display = screen.getPrimaryDisplay();
    const { width, height } = display.workAreaSize;
    mainWindow.setPosition(width - 500, height - 660);

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

// ========================================
// SYSTEM TRAY
// ========================================
function createTray() {
    const icon = createTrayIcon('#00ff88'); // Start: Gruen
    tray = new Tray(icon);
    tray.setToolTip('DkZ Copilot™ v3 — JAMEZ™ Guardian + Hermes');

    const contextMenu = Menu.buildFromTemplate([
        { label: '🤖 DkZ Copilot™ v3 Hermes', enabled: false },
        { type: 'separator' },
        // ── Haupt-Aktionen ──
        { label: '💬 Hermes Chat (Ctrl+Space)', click: () => toggleWindow() },
        { label: '🚀 Dashboard (localhost:7777)', click: () => openDashboard() },
        { label: '🌐 devkitz.eu oeffnen', click: () => openExtUrl('https://devkitz.eu') },
        { type: 'separator' },
        // ── Views ──
        {
            label: '🎨 Ansichten',
            submenu: [
                { label: '💬 Hermes Chat (Ctrl+Space)', click: () => toggleWindow() },
                { label: '🖥️ Hermes Agent Console (Ctrl+Shift+H)', click: () => openHermesConsole() },
                { label: '🎯 Hermes Overlay (Ctrl+Shift+O)', click: () => openOverlay() },
                { label: '🏢 3D Buero (Hermes 3D)', click: () => openHermes3D() },
                { type: 'separator' },
                { label: '📄 Paperless-ngx', click: () => openPaperless() },
                { label: '📎 Paperclip (im Overlay)', click: () => openOverlay() },
                { type: 'separator' },
                { label: '🏥 Health Dashboard', click: () => { toggleWindow(); mainWindow?.webContents.send('navigate-tab', 'health'); } },
                { label: '🤖 Agenten Monitor', click: () => { toggleWindow(); mainWindow?.webContents.send('navigate-tab', 'agents'); } },
                { label: '📜 Chat-Logs / LLM Logs', click: () => { toggleWindow(); mainWindow?.webContents.send('navigate-tab', 'logs'); } },
            ]
        },
        { type: 'separator' },
        // ── Puter & Cloud ──
        {
            label: '☁️ Puter Cloud',
            submenu: [
                { label: '☁️ Puter oeffnen', click: () => openExtUrl('https://puter.com') },
                { label: '🔄 Chats sync', click: () => { toggleWindow(); mainWindow?.webContents.send('puter-sync'); } },
                { label: '💾 LLM Logs exportieren', click: () => { toggleWindow(); mainWindow?.webContents.send('export-logs'); } },
            ]
        },
        { type: 'separator' },
        // ── Status ──
        { label: '🟢 Ampel: OK', id: 'ampel-status', enabled: false },
        { label: '🏥 Health Check', click: () => runHealthCheck() },
        { type: 'separator' },
        { label: '⚙️ Einstellungen', click: () => openSettings() },
        { label: '❌ Beenden', click: () => { isQuitting = true; app.quit(); } }
    ]);

    tray.setContextMenu(contextMenu);
    tray.on('click', () => toggleWindow());
}

// ========================================
// TOGGLE WINDOW
// ========================================
function toggleWindow() {
    if (!mainWindow) createWindow();

    if (mainWindow.isVisible()) {
        mainWindow.hide();
    } else {
        mainWindow.show();
        mainWindow.focus();
    }
}

// ========================================
// DASHBOARD + SETTINGS
// ========================================
function openDashboard() {
    const { shell } = require('electron');
    shell.openExternal('http://localhost:7777');
}

function openExtUrl(url) {
    const { shell } = require('electron');
    shell.openExternal(url);
}

// ========================================
// HERMES 3D BUERO (eigenes Fenster)
// ========================================
let hermes3DWindow = null;

function openHermes3D() {
    if (hermes3DWindow && !hermes3DWindow.isDestroyed()) {
        hermes3DWindow.focus();
        return;
    }

    hermes3DWindow = new BrowserWindow({
        width: 1280,
        height: 800,
        title: 'Hermes 3D Buero — DkZ™',
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            webSecurity: false
        }
    });

    // Lade hermes-3d Modul vom lokalen Server oder direkt
    hermes3DWindow.loadURL('http://localhost:7777/modules/hermes-3d/index.html');
    hermes3DWindow.on('closed', () => { hermes3DWindow = null; });
}

// ========================================
// HERMES AGENT CONSOLE (volles Web-UI)
// ========================================
let hermesConsoleWindow = null;

function openHermesConsole() {
    if (hermesConsoleWindow && !hermesConsoleWindow.isDestroyed()) {
        hermesConsoleWindow.focus();
        return;
    }

    hermesConsoleWindow = new BrowserWindow({
        width: 1400,
        height: 900,
        title: 'Hermes Agent Console — DkZ™',
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            webSecurity: false
        }
    });

    // Hermes Agent Web UI (Vite dev server oder Puter)
    // Lokal: npm run dev im hermes-agent/web Ordner (Port 5173)
    // Puter: https://hermes.puter.site
    // VPS: https://hermes.devkitz.eu
    hermesConsoleWindow.loadURL('http://localhost:5173');
    hermesConsoleWindow.on('closed', () => { hermesConsoleWindow = null; });
}

// ========================================
// HERMES OVERLAY (Agent Control Center)
// ========================================
let overlayWindow = null;

function openOverlay() {
    if (overlayWindow && !overlayWindow.isDestroyed()) {
        overlayWindow.focus();
        return;
    }

    overlayWindow = new BrowserWindow({
        width: 1200,
        height: 850,
        title: 'Hermes Overlay™ — Agent Control Center',
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            webSecurity: false
        }
    });

    overlayWindow.loadURL('http://localhost:7777/modules/hermes-overlay/index.html');
    overlayWindow.on('closed', () => { overlayWindow = null; });
}

// ========================================
// PAPERLESS-NGX
// ========================================
let paperlessWindow = null;

function openPaperless() {
    if (paperlessWindow && !paperlessWindow.isDestroyed()) {
        paperlessWindow.focus();
        return;
    }

    paperlessWindow = new BrowserWindow({
        width: 1200,
        height: 850,
        title: 'Paperless-ngx — DkZ™ Dokumente',
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            webSecurity: false
        }
    });

    // Paperless-ngx auf VPS oder lokal
    paperlessWindow.loadURL('https://paperless.devkitz.eu');
    paperlessWindow.on('closed', () => { paperlessWindow = null; });
}

function openSettings() {
    if (!mainWindow) createWindow();
    mainWindow.webContents.send('navigate', 'settings');
    mainWindow.show();
    mainWindow.focus();
}

// ========================================
// HEALTH CHECK (via James v4)
// ========================================
function runHealthCheck() {
    if (mainWindow) {
        mainWindow.webContents.send('health-check');
    }
    new Notification({
        title: 'JAMEZ™ Health Check',
        body: 'Health Check gestartet...'
    }).show();
}

// ========================================
// UPDATE TRAY AMPEL
// ========================================
function updateAmpel(ampel, label) {
    if (!tray) return;
    const colors = { gruen: '#00ff88', gelb: '#ffb800', rot: '#fa1e4e' };
    const icons = { gruen: '🟢', gelb: '🟡', rot: '🔴' };
    tray.setImage(createTrayIcon(colors[ampel] || '#00ff88'));
    tray.setToolTip('DkZ Copilot™ v3 — ' + (label || 'OK'));
}

// ========================================
// IPC HANDLERS
// ========================================
ipcMain.on('ampel-update', (event, data) => {
    updateAmpel(data.ampel, data.label);
});

ipcMain.on('notification', (event, data) => {
    new Notification({
        title: data.title || 'DkZ Copilot™',
        body: data.body || ''
    }).show();
});

ipcMain.on('hide-window', () => {
    if (mainWindow) mainWindow.hide();
});

// Window Openers from UI
ipcMain.on('open-hermes-console', () => openHermesConsole());
ipcMain.on('open-hermes-3d', () => openHermes3D());
ipcMain.on('open-overlay', () => openOverlay());
ipcMain.on('open-paperless', () => openPaperless());

// ========================================
// APP LIFECYCLE
// ========================================
app.whenReady().then(() => {
    createWindow();
    createTray();

    // Global Hotkey: Ctrl+Space
    globalShortcut.register('CommandOrControl+Space', () => {
        toggleWindow();
    });

    // Alt Hotkey: Win+J (Windows only)
    try {
        globalShortcut.register('Super+J', () => {
            toggleWindow();
        });
    } catch(e) {
        // Win+J may conflict — fallback OK
    }

    // Ctrl+Shift+H: Hermes Console
    try {
        globalShortcut.register('CommandOrControl+Shift+H', () => {
            openHermesConsole();
        });
    } catch(e) {}

    // Ctrl+Shift+O: Overlay
    try {
        globalShortcut.register('CommandOrControl+Shift+O', () => {
            openOverlay();
        });
    } catch(e) {}

    console.log('DkZ Copilot™ v3 gestartet — Ctrl+Space / Ctrl+Shift+H / Ctrl+Shift+O');
});

app.on('will-quit', () => {
    globalShortcut.unregisterAll();
});

app.on('window-all-closed', (e) => {
    // Nicht beenden — im Tray bleiben
    e.preventDefault?.();
});

// Autostart Setup (einmalig)
if (process.platform === 'win32') {
    app.setLoginItemSettings({
        openAtLogin: true,
        path: app.getPath('exe'),
        args: ['--hidden']
    });
}

// Hidden Start Check
if (process.argv.includes('--hidden')) {
    app.on('ready', () => {
        if (mainWindow) mainWindow.hide();
    });
}
