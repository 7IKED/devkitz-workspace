# 🤖 LLM KONTEXT — Lies das ZUERST!

> **Für KI-Assistenten, die an diesem Projekt arbeiten.**
> Du musst NICHT alles hochladen. Lies nur was du brauchst.

---

## 📍 Wo bin ich?

```
C:\DEVKiTZ\01_PROJECTS\01_dashboard\
```

Ein Dashboard-Projekt mit **48 Modulen** und **14 Dashboards** — insgesamt **62 Komponenten**.

## 📖 Was zuerst lesen?

1. **Diese Datei** (`LLM_CONTEXT.md`) — Überblick
2. **`REGISTRY.json`** — Master-Liste aller Komponenten mit IDs und Pfaden
3. **`BLAUPAUSE.md`** — Architektur, Design System, Konventionen
4. **`IMPLEMENTIERUNGSPLAN.md`** — Feature-Roadmap mit Status

## 🎯 Wie arbeite ich hier?

### Einzelnes Modul bearbeiten:
```
1. Lies REGISTRY.json → finde das Modul (z.B. MOD-015)
2. Lies modules/meta-tag-gen/features.json → aktueller Stand
3. Bearbeite modules/meta-tag-gen/index.html
4. Aktualisiere features.json mit neuen FT-IDs
5. Logge Änderung in modules/meta-tag-gen/_logs/
```

### Neues Modul erstellen:
```
1. Lies BLAUPAUSE.md → Design System
2. Erstelle modules/ORDNER-NAME/index.html
3. Erstelle modules/ORDNER-NAME/features.json
4. Aktualisiere REGISTRY.json
```

## 🚫 Was NICHT tun

- ❌ Nicht alle 62 features.json gleichzeitig laden
- ❌ Nicht BLAUPAUSE.md oder IMPLEMENTIERUNGSPLAN.md löschen
- ❌ Nicht REGISTRY.json überschreiben ohne Backup
- ❌ Keine bestehende features.json ohne Grund löschen
- ❌ Keine Versionen ändern (alles bleibt v0.01 bis Git geht)

## 📝 Logging

Bei jeder Änderung: erstelle den Ordner `_logs/` im Modul und schreibe:

```json
{
  "timestamp": "2026-03-09T22:30:00+01:00",
  "agent": "claude/gemini/gpt",
  "action": "feature-added",
  "featureId": "FT-XXX",
  "description": "Was wurde gemacht",
  "filesChanged": ["index.html", "features.json"]
}
```

## 🎨 DkZ Design System (Kurzversion)

```css
--bg: #0e0e10;  --card: #1a1a1c;  --border: #333338;
--accent: #fa1e4e;  --green: #00ff88;  --blue: #55ACEE;  --yellow: #FFB800;
Fonts: Inter + JetBrains Mono (Google Fonts CDN)
Glassmorphism: backdrop-filter blur(24px)
```

## 🆔 ID-Schema

| Typ | Format | Bereich |
|-----|--------|---------|
| Module | MOD-001…048 | 48 Module |
| Dashboards | DSH-001…014 | 14 Dashboards |
| Features | FT-001…371+ | Jedes Feature |
| Issues | ISS-001…058+ | Bekannte Probleme |
| Debug | DBG-001…014+ | Debug-Einträge |

## 📂 Wichtige Dateien

| Datei | Was? |
|-------|------|
| `REGISTRY.json` | Master-Index aller Komponenten |
| `BLAUPAUSE.md` | Architektur-Dokumentation |
| `IMPLEMENTIERUNGSPLAN.md` | Feature-Roadmap |
| `LLM_CONTEXT.md` | Diese Datei |
| `modules/*/features.json` | Feature-Status pro Modul |
| `modules/project-registry/index.html` | Interaktiver Baum-Viewer |
