const { app, BrowserWindow, Tray, Menu, globalShortcut } = require('electron');
const path = require('path');
const { spawn } = require('child_process');

let mainWindow;
let tray = null;
let serverProcess = null;

// Konfiguration
const SERVER_PORT = 3040;
const START_URL = `http://localhost:${SERVER_PORT}/hub/index.html`;

function startSyncServer() {
    console.log('[Electron] Starte lokales Backend (sync-server.js)...');
    serverProcess = spawn('node', ['sync-server.js'], {
        cwd: __dirname,
        stdio: 'inherit',
        shell: true
    });

    serverProcess.on('close', (code) => {
        console.log(`[Electron] sync-server beendet mit Code ${code}`);
    });
}

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1280,
        height: 800,
        title: 'DEVKiTZ™ Copilot',
        icon: path.join(__dirname, 'assets', 'icon.png'), // Platzhalter für Icon
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true
        },
        autoHideMenuBar: true
    });

    // Warten bis der Server (hoffentlich) hochgefahren ist
    setTimeout(() => {
        mainWindow.loadURL(START_URL);
    }, 3000);

    mainWindow.on('close', (event) => {
        if (!app.isQuitting) {
            event.preventDefault();
            mainWindow.hide();
        }
        return false;
    });
}

function createTray() {
    // Da wir noch kein echtes Icon haben, fangen wir Fehler ab falls assets/icon.png fehlt.
    try {
        tray = new Tray(path.join(__dirname, 'assets', 'icon.png'));
    } catch (e) {
        // Fallback falls icon nicht da ist (was crashen könnte)
        // Wir brauchen für Tray zwingend ein Icon in Electron.
        console.warn('Kein Tray Icon gefunden. Tray wird nicht erstellt.');
        return;
    }

    const contextMenu = Menu.buildFromTemplate([
        { label: 'DEVKiTZ Dashboard öffnen', click: () => mainWindow.show() },
        { label: 'Handbuch (Copilot)', click: () => { /* TODO: Open Github / Local Manual */ } },
        { type: 'separator' },
        { label: 'YOLO-Modus umschalten', click: () => { /* API call to backend */ } },
        { type: 'separator' },
        { label: 'Beenden', click: () => {
            app.isQuitting = true;
            app.quit();
        }}
    ]);
    
    tray.setToolTip('DEVKiTZ Copilot');
    tray.setContextMenu(contextMenu);
    
    tray.on('click', () => {
        mainWindow.show();
    });
}

app.whenReady().then(() => {
    startSyncServer();
    createWindow();
    createTray();

    // Not-Aus Killswitch
    globalShortcut.register('CommandOrControl+Escape', () => {
        console.log('🚨 [KILLSWITCH] STRG+ESC GEDRÜCKT! Beende alle Prozesse!');
        if (serverProcess) serverProcess.kill('SIGINT');
        app.isQuitting = true;
        app.quit();
    });

    app.on('activate', function () {
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
});

app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') app.quit();
});

app.on('before-quit', () => {
    app.isQuitting = true;
    if (serverProcess) {
        serverProcess.kill('SIGINT');
    }
});
