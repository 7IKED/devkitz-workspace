---
description: Neues DkZ Dashboard Modul erstellen — Kompletter Workflow
---

# Neues DkZ Dashboard Modul erstellen

## Was ist das?
Ein DkZ Modul ist eine einzelne HTML-Datei im Ordner `c:\DEVKiTZ\01_PROJECTS\01_dashboard\modules\`.
Jedes Modul ist ein Werkzeug (z.B. JSON Formatter, Passwort Generator, etc.).
Der gesamte Code (HTML + CSS + JS) steht in EINER Datei: `index.html`.

## Projekt-Root
```
c:\DEVKiTZ\01_PROJECTS\01_dashboard\
```

## Schritt 1: Ordner erstellen
Erstelle einen neuen Ordner in `modules/`. Der Name ist immer `kebab-case` (Kleinbuchstaben, Bindestriche).

```powershell
mkdir c:\DEVKiTZ\01_PROJECTS\01_dashboard\modules\DEIN-MODUL-NAME
```

Beispiel: Für ein "Farb-Mixer" Tool:
```powershell
mkdir c:\DEVKiTZ\01_PROJECTS\01_dashboard\modules\farb-mixer
```

## Schritt 2: index.html erstellen
Erstelle die Datei `c:\DEVKiTZ\01_PROJECTS\01_dashboard\modules\DEIN-MODUL-NAME\index.html`.

Kopiere dieses KOMPLETTE Template und passe NUR die markierten Stellen an:

```html
<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>EMOJI MODUL-NAME — DkZ</title>
    <!-- ANPASSEN: Ersetze EMOJI und MODUL-NAME mit deinem Modul -->
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800;900&family=JetBrains+Mono:wght@400;700&display=swap" rel="stylesheet">
    <style>
        :root {
            --bg: #000000;
            --bg2: #0a0a0a;
            --card: #111111;
            --card2: #1a1a1a;
            --border: #222222;
            --border2: #333333;
            --text: #ffffff;
            --text2: #f0f0f0;
            --muted: #888888;
            --muted2: #555555;
            --accent: #FF3131;
            --accent-hover: #ff4d4d;
            --accent-glow: rgba(255, 49, 49, 0.15);
            --green: #00ff88;
            --blue: #55ACEE;
            --yellow: #FFB800;
            --font: 'Inter', -apple-system, sans-serif;
            --mono: 'JetBrains Mono', 'Fira Code', monospace;
            --glass: rgba(0, 0, 0, 0.72);
            --blur: blur(24px);
            --radius: 12px;
            --radius-lg: 16px;
            --shadow: 0 4px 24px rgba(0,0,0,.5);
            --shadow-accent: 0 0 20px rgba(255,49,49,.2);
            --transition: all .2s cubic-bezier(.4,0,.2,1);
        }
        * { margin:0; padding:0; box-sizing:border-box; }
        body {
            background: var(--bg);
            color: var(--text);
            font-family: var(--font);
            min-height: 100vh;
            line-height: 1.5;
        }
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,.06); border-radius: 5px; }
        ::selection { background: var(--accent); color: #fff; }

        .bg-mesh { position:fixed; inset:0; z-index:0; pointer-events:none; }
        .bg-blob { position:absolute; border-radius:50%; filter:blur(140px); opacity:.04; animation:bf 25s ease-in-out infinite; }
        .bg-blob:nth-child(1) { width:500px; height:500px; background:var(--accent); top:-15%; left:5%; }
        .bg-blob:nth-child(2) { width:350px; height:350px; background:var(--green); bottom:5%; right:10%; animation-delay:-10s; }
        @keyframes bf { 0%,100%{transform:translate(0,0) scale(1)} 50%{transform:translate(40px,-50px) scale(1.15)} }

        .header {
            padding: 14px 24px;
            border-bottom: 1px solid var(--border);
            background: var(--glass);
            backdrop-filter: var(--blur);
            display: flex;
            align-items: center;
            gap: 12px;
            position: sticky;
            top: 0;
            z-index: 100;
        }
        .back-btn {
            padding: 6px 12px;
            border: 1px solid var(--border);
            border-radius: 8px;
            background: rgba(255,255,255,.03);
            color: var(--muted);
            font-size: 11px;
            cursor: pointer;
            text-decoration: none;
            font-family: var(--font);
        }
        .back-btn:hover { border-color: var(--accent); }
        .header h1 {
            font-size: 20px;
            font-weight: 900;
            background: linear-gradient(135deg, var(--accent), var(--green));
            -webkit-background-clip: text;
            background-clip: text;
            -webkit-text-fill-color: transparent;
        }
        .ver { font-size: 9px; color: var(--muted); font-family: var(--mono); margin-left: auto; }

        .app { position: relative; z-index: 1; }
        .content { max-width: 1000px; margin: 0 auto; padding: 24px; }

        .card {
            background: var(--card);
            border: 1px solid var(--border);
            border-radius: var(--radius-lg);
            padding: 20px;
            margin-bottom: 16px;
        }
        .btn {
            padding: 10px 20px;
            border: none;
            border-radius: var(--radius);
            background: var(--accent);
            color: #fff;
            font-family: var(--font);
            font-size: 13px;
            font-weight: 700;
            cursor: pointer;
            transition: var(--transition);
        }
        .btn:hover { background: var(--accent-hover); box-shadow: var(--shadow-accent); }

        .toast {
            position: fixed; bottom: 24px; right: 24px;
            padding: 12px 20px; background: var(--green); color: #000;
            font-size: 12px; font-weight: 700; border-radius: 10px;
            z-index: 300; opacity: 0; transform: translateY(20px);
            transition: var(--transition); pointer-events: none;
        }
        .toast.show { opacity: 1; transform: translateY(0); }

        .footer {
            margin-top: 40px; padding: 16px 0;
            border-top: 1px solid var(--border);
            text-align: center; font-size: 9px; color: var(--muted2);
            font-family: var(--mono); letter-spacing: 1px;
        }
        .footer a { color: var(--accent); text-decoration: none; }
    </style>
</head>
<body>
    <div class="bg-mesh"><div class="bg-blob"></div><div class="bg-blob"></div></div>
    <div class="app">
        <div class="header">
            <a href="../../hub/index.html" class="back-btn">← Hub</a>
            <h1>EMOJI MODUL-NAME</h1>
            <!-- ANPASSEN: Ersetze EMOJI und MODUL-NAME -->
            <span class="ver">v0.01</span>
        </div>
        <div class="content">
            <div class="card">
                <h2 style="font-size:16px;font-weight:900;margin-bottom:12px">ÜBERSCHRIFT</h2>
                <!-- HIER DEIN MODUL-INHALT -->
            </div>
            <button class="btn" onclick="doAction()">🚀 Aktion</button>
        </div>
        <footer class="footer">
            © 2024–2026 <a href="../../hub/index.html">DEVKiTZ™</a> · MODUL-NAME v0.01 · DkZ Design System v2
        </footer>
    </div>
    <div class="toast" id="toast"></div>
    <script>
        function doAction() {
            // DEINE LOGIK HIER
            showToast('✅ Aktion ausgeführt!');
        }
        function showToast(m) {
            const t = document.getElementById('toast');
            t.textContent = m;
            t.classList.add('show');
            setTimeout(() => t.classList.remove('show'), 2500);
        }
    </script>
</body>
</html>
```

### Was du ANPASSEN musst (nur diese 4 Stellen):
1. Zeile `<title>` → Dein Emoji + Name
2. Zeile `<h1>` → Dein Emoji + Name
3. Zeile `<footer>` → MODUL-NAME ersetzen
4. Die `<div class="content">` → Dein eigentlicher Modul-Inhalt

### Was du NICHT ändern darfst:
- Keine CSS-Variablen in `:root` ändern
- Keine Fonts ändern
- Keine Background-Blob-Animation ändern
- Keine Toast-Funktion ändern
- Den `← Hub` Link NICHT ändern (immer `../../hub/index.html`)

## Schritt 3: features.json erstellen
Erstelle die Datei `c:\DEVKiTZ\01_PROJECTS\01_dashboard\modules\DEIN-MODUL-NAME\features.json`.

Kopiere dieses Template und passe die markierten Werte an:

```json
{
  "id": "MOD-053",
  "_ANPASSEN_id": "Nächste freie ID. Aktuell ist MOD-052 vergeben. Nutze MOD-053.",
  "name": "Dein Modul Name",
  "_ANPASSEN_name": "Der menschenlesbare Name deines Moduls",
  "folder": "modules/dein-modul-name",
  "_ANPASSEN_folder": "Der Ordnername den du in Schritt 1 erstellt hast",
  "version": "v0.01",
  "description": "Kurze Beschreibung was das Modul macht",
  "specs": {
    "ui": "HTML5 + DkZ CSS v2 + Vanilla JS",
    "code": "Single-File index.html",
    "lines": 0,
    "rating": 0,
    "frequency": "mittel"
  },
  "features": [
    {
      "id": "FT-XXX",
      "_ANPASSEN": "FT-IDs sind fortlaufend. Aktuell bis FT-541. Starte bei FT-542.",
      "name": "Feature Name",
      "status": "done",
      "desc": "Was dieses Feature macht"
    }
  ],
  "issues": [],
  "debug": [],
  "updateLog": [
    {
      "version": "v0.01",
      "date": "YYYY-MM-DD",
      "_ANPASSEN_date": "Heutiges Datum im Format 2026-03-09",
      "changes": ["Initial: Kurze Beschreibung"]
    }
  ],
  "_llm": {
    "contextFile": "modules/dein-modul-name/features.json",
    "noFullUpload": true,
    "logTo": "modules/dein-modul-name/_logs/",
    "readFirst": ["BLAUPAUSE.md", "DKZ_CSS_V2_PRIMARY.css"]
  },
  "prompt": "Erstelle/aktualisiere das DkZ Modul 'DEIN NAME' (modules/dein-name/index.html): BESCHREIBUNG. DkZ v2 Design (#FF3131 accent, black bg). Footer: © 2024-2026 DEVKiTZ™."
}
```

WICHTIG: Lösche alle Zeilen die mit `"_ANPASSEN` beginnen aus der finalen JSON. Die sind nur Erklärungen.

## Schritt 4: Gallery-Eintrag hinzufügen
Öffne: `c:\DEVKiTZ\01_PROJECTS\01_dashboard\modules\gallery\index.html`

Suche nach dem Text `// Dashboards` (ca. Zeile 567).
Füge DAVOR eine neue Zeile ein:

```javascript
{ n: "Dein Modul", id: "MOD-053", f: "dein-modul-name", t: "module", d: "Kurze Beschreibung", icon: "🔧", path: "../dein-modul-name/index.html" },
```

## Schritt 5: BLAUPAUSE.md updaten
Öffne: `c:\DEVKiTZ\01_PROJECTS\01_dashboard\BLAUPAUSE.md`

1. Zeile 3: Modul-Zahl um 1 erhöhen (aktuell: 51 → 52)
2. Im Ordnerbaum (Zeile 40-95): Neuen Ordner alphabetisch einsortieren

## Schritt 6: Git Commit
```powershell
cd c:\DEVKiTZ\01_PROJECTS\01_dashboard
git add -A
git commit -m "feat(dein-modul-name): initial module v0.01"
```

## Checkliste (ALLES muss ✅ sein)
- [ ] Ordner erstellt in `modules/`
- [ ] index.html mit DkZ v2 CSS Template erstellt
- [ ] `← Hub` Link geht zu `../../hub/index.html`
- [ ] Version `v0.01` im Header sichtbar
- [ ] © DEVKiTZ™ im Footer
- [ ] Toast-System funktioniert (showToast Funktion)
- [ ] Background Blobs sind animiert (2 farbige Kreise)
- [ ] features.json erstellt mit korrekter MOD-ID
- [ ] Gallery-Eintrag hinzugefügt
- [ ] BLAUPAUSE.md Modul-Count erhöht
- [ ] Git Commit gemacht
