#!/usr/bin/env node
/**
 * DkZ Security Scanner EXE v1.0
 * Standalone Scanner mit Windows Defender Integration
 * Baut als EXE: npx -y pkg dkz-scanner.js --target win-x64
 */
const { execSync, spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const os = require('os');

const COLORS = {
  reset: '\x1b[0m', red: '\x1b[31m', green: '\x1b[32m',
  yellow: '\x1b[33m', cyan: '\x1b[36m', magenta: '\x1b[35m',
  bold: '\x1b[1m', dim: '\x1b[2m'
};
const c = COLORS;

function banner() {
  console.log(`${c.magenta}${c.bold}
  ╔══════════════════════════════════════════╗
  ║  🛡️  DkZ™ Security Scanner v1.0         ║
  ║  Malware-Erkennung + Defender-Scan       ║
  ╚══════════════════════════════════════════╝${c.reset}
  `);
}

function log(msg, type = 'info') {
  const icons = { ok: `${c.green}✓`, err: `${c.red}✗`, warn: `${c.yellow}⚠`, info: `${c.cyan}ℹ` };
  const ts = new Date().toLocaleTimeString();
  console.log(`  ${icons[type] || icons.info} ${c.dim}[${ts}]${c.reset} ${msg}`);
}

function hr() { console.log(`  ${c.dim}${'─'.repeat(50)}${c.reset}`); }

// === PHASE 1: Registry Scan ===
function scanRegistry() {
  console.log(`\n${c.cyan}${c.bold}  ► PHASE 1: Registry Autostart${c.reset}`);
  hr();
  try {
    const out = execSync('reg query "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Run" 2>nul', { encoding: 'utf8' });
    const lines = out.split('\n').filter(l => l.includes('REG_SZ'));
    const malwarePatterns = ['AppResolver', 'O2V8', 'jkOCdaFelt', 'conhost.*headless'];
    
    lines.forEach(line => {
      const parts = line.trim().split(/\s+REG_SZ\s+/);
      const name = parts[0] || '';
      const val = parts[1] || '';
      const isMalware = malwarePatterns.some(p => new RegExp(p, 'i').test(name + val));
      if (isMalware) {
        log(`${c.red}MALWARE: ${name} → ${val}${c.reset}`, 'err');
      } else {
        log(`${name}`, 'ok');
      }
    });
  } catch (e) {
    log('Registry-Zugriff fehlgeschlagen', 'warn');
  }
}

// === PHASE 2: Prozess Scan ===
function scanProcesses() {
  console.log(`\n${c.cyan}${c.bold}  ► PHASE 2: Verdächtige Prozesse${c.reset}`);
  hr();
  try {
    const ps = execSync('powershell -Command "Get-Process node -ErrorAction SilentlyContinue | ForEach-Object { $cmd = (Get-CimInstance Win32_Process -Filter \\"ProcessId=$($_.Id)\\" -ErrorAction SilentlyContinue).CommandLine; \\"PID:$($_.Id)|CMD:$cmd\\" }"', { encoding: 'utf8' });
    
    if (!ps.trim()) {
      log('Keine Node.js-Prozesse aktiv', 'ok');
      return;
    }
    ps.trim().split('\n').forEach(line => {
      const [pid, cmd] = line.split('|CMD:');
      const isSus = /O2V8|jkOC|conhost.*headless|AppData\\Local\\[A-Z0-9]{8,}/i.test(cmd || '');
      if (isSus) {
        log(`${c.red}MALWARE: ${pid} → ${cmd}${c.reset}`, 'err');
      } else {
        log(`${pid} — OK`, 'ok');
      }
    });
  } catch (e) {
    log('Prozess-Scan OK (keine Node-Prozesse)', 'ok');
  }
}

// === PHASE 3: Windows Defender Quick Scan ===
function scanDefender() {
  console.log(`\n${c.cyan}${c.bold}  ► PHASE 3: Windows Defender Scan${c.reset}`);
  hr();
  try {
    // Defender Pfad finden
    const defPath = execSync('powershell -Command "$p = Get-ChildItem \\"C:\\ProgramData\\Microsoft\\Windows Defender\\Platform\\" -Directory -ErrorAction SilentlyContinue | Sort-Object Name -Descending | Select-Object -First 1; if($p){Join-Path $p.FullName \\"MpCmdRun.exe\\"}else{\\"notfound\\"}"', { encoding: 'utf8' }).trim();
    
    if (defPath === 'notfound' || !fs.existsSync(defPath)) {
      log('Windows Defender nicht gefunden — bitte manuell scannen', 'warn');
      return;
    }
    
    log(`Defender gefunden: ${defPath}`, 'info');
    log('Starte Quick Scan (kann einige Minuten dauern)...', 'info');
    
    try {
      execSync(`"${defPath}" -Scan -ScanType 1`, { encoding: 'utf8', timeout: 300000 });
      log('Defender Quick Scan abgeschlossen — keine Bedrohungen', 'ok');
    } catch (scanErr) {
      if (scanErr.status === 2) {
        log(`${c.red}BEDROHUNG GEFUNDEN! Defender hat Malware erkannt.${c.reset}`, 'err');
      } else {
        log('Defender Scan beendet (prüfe Windows-Sicherheit für Details)', 'warn');
      }
    }
  } catch (e) {
    log(`Defender-Integration: ${e.message}`, 'warn');
  }
}

// === PHASE 4: AppData Scan ===
function scanAppData() {
  console.log(`\n${c.cyan}${c.bold}  ► PHASE 4: Verdächtige AppData-Ordner${c.reset}`);
  hr();
  const localAppData = process.env.LOCALAPPDATA;
  const safe = ['npm','npm-cache','Temp','Programs','Microsoft','Google','Discord','Vivaldi',
    'Overwolf','electron','KeePassXC','AnthropicClaude','BraveSoftware','GitHubDesktop',
    'GitKrakenCLI','ExpressVPN','camoufox','ClassicShell','Creative','D3DSCache',
    'Packages','Publishers','NuGet','pip','yarn','pnpm','Cursor',
    'ConnectedDevicesPlatform','CrashDumps','CS2ServerPicker','Diagnostics',
    'ElevatedDiagnostics','NhNotifSys','PeerDistRepub','PlaceholderTileLogoFolder',
    'puccinialin','SquirrelTemp','ToastNotificationManagerCompat','VirtualStore',
    'WisprFlow','goimports','Logitech'];
  
  try {
    const dirs = fs.readdirSync(localAppData, { withFileTypes: true })
      .filter(d => d.isDirectory() && /^[A-Za-z0-9]{10,}$/.test(d.name) && !safe.includes(d.name));
    
    if (dirs.length === 0) {
      log('Keine verdächtigen Ordner gefunden', 'ok');
    } else {
      dirs.forEach(d => {
        const full = path.join(localAppData, d.name);
        const files = fs.readdirSync(full).filter(f => /\.(exe|cmd|bat|xml|bin|ps1)$/i.test(f));
        if (files.length > 0) {
          log(`${c.red}VERDÄCHTIG: ${d.name} (${files.length} ausführbare Dateien)${c.reset}`, 'err');
        } else {
          log(`${d.name} — wahrscheinlich harmlos`, 'warn');
        }
      });
    }
  } catch (e) {
    log('AppData-Scan fehlgeschlagen', 'warn');
  }
}

// === PHASE 5: System Summary ===
function systemSummary() {
  console.log(`\n${c.cyan}${c.bold}  ► ERGEBNIS${c.reset}`);
  hr();
  const totalMem = Math.round(os.totalmem() / 1024 / 1024 / 1024);
  const freeMem = Math.round(os.freemem() / 1024 / 1024 / 1024);
  log(`RAM: ${freeMem} GB frei / ${totalMem} GB`, 'info');
  log(`OS: ${os.platform()} ${os.release()}`, 'info');
  log(`User: ${os.userInfo().username}`, 'info');
  log(`Hostname: ${os.hostname()}`, 'info');
  hr();
  log(`${c.green}${c.bold}Scan abgeschlossen.${c.reset}`, 'ok');
}

// === MAIN ===
banner();
scanRegistry();
scanProcesses();
scanDefender();
scanAppData();
systemSummary();

console.log(`\n  ${c.dim}Drücke eine Taste zum Beenden...${c.reset}`);
process.stdin.setRawMode && process.stdin.setRawMode(true);
process.stdin.resume();
process.stdin.once('data', () => process.exit(0));
