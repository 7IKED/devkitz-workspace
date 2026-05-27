---
name: startup
description: Session-Start Health-Check — validiert Oekosystem-Zustand und meldet Ampel-Status (GRUEN/GELB/ROT). Ausfuehren am Anfang jeder Session.
---

# Startup — DkZ Session Health Check

> Schneller Oekosystem-Check (~30 Sekunden). Stellt sicher dass wir fehlerfrei weiterarbeiten koennen.

## Wann ausfuehren

- **Immer** am Anfang einer neuen Session
- Wenn der User `/startup` oder `startup` eingibt
- Nach einem System-Neustart

## Ablauf

### Schritt 1: Pflichtdateien pruefen

```powershell
$pflicht = @(
    "C:\DEVKiTZ\CLAUDE.md",
    "C:\DEVKiTZ\GEMINI.md", 
    "C:\DEVKiTZ\REGELWERK.md",
    "C:\DEVKiTZ\01_PROJECTS\01_dashboard\BLAUPAUSE.md",
    "C:\DEVKiTZ\01_PROJECTS\01_dashboard\features.json"
)
$missing = @()
foreach ($f in $pflicht) {
    if (!(Test-Path -LiteralPath $f)) { $missing += (Split-Path $f -Leaf) }
}
```

**GRUEN:** Alle vorhanden  
**ROT:** Eine oder mehr fehlt → SOFORT melden

### Schritt 2: Git Status pruefen

```powershell
cd C:\DEVKiTZ
git status --short 2>$null
git branch --show-current
```

**GRUEN:** Clean oder nur untracked  
**GELB:** Modified files (uncommitted work)  
**ROT:** Detached HEAD oder corrupted repo

### Schritt 3: SSH/VPS Connectivity

```powershell
ssh -o ConnectTimeout=5 -o BatchMode=yes kvm8 "echo OK; docker ps --format '{{.Names}} {{.Status}}' | head -5" 2>&1
```

**GRUEN:** SSH antwortet, Docker Container laufen  
**GELB:** SSH antwortet, aber Container fehlen  
**ROT:** SSH Timeout oder Fehler

### Schritt 4: NanoChat Bridge

```powershell
try { 
    $r = Invoke-RestMethod -Uri "http://localhost:3040/api/status" -TimeoutSec 3 -ErrorAction Stop
    Write-Host "NanoChat: $($r.status)"
} catch { Write-Host "NanoChat: OFFLINE" }
```

**GRUEN:** Port 3040 antwortet  
**ROT:** Connection refused

### Schritt 5: GitHub Auth

```powershell
gh auth status 2>&1 | Select-Object -First 3
```

**GRUEN:** Logged in  
**ROT:** Not authenticated

### Schritt 6: REDNOTE Check

```powershell
$rednote = Get-Content -LiteralPath "C:\DEVKiTZ\04_SYSTEM\REDNOTE.json" -Raw | ConvertFrom-Json
Write-Host "Offene Fehler: $($rednote.errors.Count) (Kritisch: $($rednote.stats.critical))"
```

**GRUEN:** 0 kritische Fehler  
**GELB:** Warnungen vorhanden  
**ROT:** Kritische Fehler offen

### Schritt 7: features.json Validierung

```powershell
$fj = Get-Content -LiteralPath "C:\DEVKiTZ\01_PROJECTS\01_dashboard\features.json" -Raw | ConvertFrom-Json
$modCount = ($fj.modules | Get-Member -MemberType NoteProperty).Count
Write-Host "Features Registry: $modCount Module"
```

**GRUEN:** > 100 Module registriert  
**ROT:** < 50 oder kaputtes Schema

### Schritt 8: SecondBrain Status

```powershell
git -C "$env:USERPROFILE\Documents\SecondBrain" status --short 2>$null | Measure-Object | Select-Object -ExpandProperty Count
```

**GRUEN:** Clean  
**GELB:** Uncommitted changes

### Schritt 9: Log-Dateien

```powershell
$logDir = "C:\DEVKiTZ\06_NOTEPAD\meeting\log"
Get-ChildItem -LiteralPath $logDir -File -ErrorAction SilentlyContinue | ForEach-Object {
    $age = ((Get-Date) - $_.LastWriteTime).TotalHours
    Write-Host "$($_.Name): $([math]::Round($age,1))h alt"
}
```

**Info:** Alter der Logs anzeigen

### Schritt 10: Ampel-Zusammenfassung

Zaehle die Ergebnisse und gib dem User eine klare Ampel:

```
🟢 GRUEN: Alles OK — Weiterarbeiten
🟡 GELB:  Kleinigkeiten — Check empfohlen  
🔴 ROT:   Probleme — `checkup` ausfuehren!
```

## Output-Format

```
═══════════════════════════════════════
  DkZ STARTUP CHECK — 2026-05-18 18:42
═══════════════════════════════════════
  ✅ Pflichtdateien     5/5
  ✅ Git Status         clean (feat/docs-roadmap-v3)
  ✅ SSH KVM8           OK (46d uptime, 8 containers)
  ⚠️ NanoChat           OFFLINE
  ✅ GitHub Auth        7IKED ✓
  ✅ REDNOTE            0 kritisch, 2 warnungen
  ✅ Features Registry  122 Module
  ⚠️ SecondBrain        3 uncommitted
  ✅ Logs               nanochat: 2.1h alt
═══════════════════════════════════════
  AMPEL: 🟡 GELB — 2 Warnungen
  Empfehlung: NanoChat starten, SecondBrain committen
═══════════════════════════════════════
```

## Bei ROT

Wenn die Ampel ROT zeigt:
1. Den User informieren WAS genau das Problem ist
2. Empfehlen: `/checkup` fuer tiefe Analyse
3. Fehler in REDNOTE.json eintragen:
   ```powershell
   node C:\DEVKiTZ\04_SYSTEM\scripts\rednote-collector.js add --severity critical --category system --system "Startup" --message "Beschreibung"
   ```

## NanoBot Ping

Am Ende des Checks einen NanoBot-Ping senden um zu verifizieren dass die Kommunikationskanaele offen sind:

```javascript
// Falls NanoChat laeuft
fetch('http://localhost:3040/api/broadcast', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type: 'health-ping', from: 'startup-skill' })
});
```

## Konfiguration

Dieser Skill funktioniert identisch in:
- **Antigravity** (Google Gemini)
- **OpenCode** (beliebiges LLM)
- **Hermes** (VPS Agent)

Alle Befehle sind PowerShell/Shell und LLM-unabhaengig.
