# Hermes Model Manager

> Skill zum Verwalten, Verifizieren und Wechseln von Hermes Free-Modellen auf OpenRouter.

---

## Wann benutzen

- Hermes zeigt **HTTP 404** bei einem Model → Model-ID veraltet
- Hermes zeigt **HTTP 429** → Quota erschöpft, anderes Model wählen
- Du willst **neue Free-Modelle** hinzufügen
- Du willst **alle Models verifizieren** (welche existieren noch?)

---

## Schritt 1: Verfügbare Free-Modelle abfragen

```powershell
$r = Invoke-RestMethod -Uri "https://openrouter.ai/api/v1/models" -Method Get
$r.data | Where-Object { $_.id -match ':free' } | Select-Object id | Format-Table
```

Das gibt die **exakten, aktuell gültigen** Model-IDs zurück. NUR diese verwenden.

---

## Schritt 2: Hermes Config-Dateien aktualisieren

Es gibt **3 Dateien** die ALLE aktualisiert werden müssen:

### 2a. config.yaml (Default-Model)

```
Pfad: %USERPROFILE%\.hermes\config.yaml
Zeile 11: default: "MODEL_ID_HIER"
```

### 2b. models.json (Runtime-Dropdown)

```
Pfad: %USERPROFILE%\.hermes\models.json
Format: JSON Array mit {id, name, provider, model, baseUrl, createdAt}
```

### 2c. default-models.ts (Source-Code)

```
Pfad: C:\DEVKiTZ\01_PROJECTS\hermes-desktop\src\main\default-models.ts
Format: TypeScript Array mit {name, provider, model, baseUrl}
```

> **WICHTIG:** Wenn du nur 1 Datei änderst, überschreibt Hermes Desktop
> die Änderung beim nächsten Start! IMMER alle 3 synchron halten.

---

## Schritt 3: Hermes neu starten

```powershell
# Stoppen
Get-Process | Where-Object { $_.Path -match 'hermes-desktop.*electron' } | Stop-Process -Force
Start-Sleep 2

# Starten
npm run dev  # in C:\DEVKiTZ\01_PROJECTS\hermes-desktop
```

---

## Schritt 4: Im Chat wechseln

```
/model minimax/minimax-m2.5:free
/model qwen/qwen3-coder:free
/model google/gemma-4-31b-it:free
/model meta-llama/llama-3.3-70b-instruct:free
/model nvidia/nemotron-3-super-120b-a12b:free
/model openai/gpt-oss-120b:free
```

---

## Bekannte Probleme

| Problem | Lösung |
|:--------|:-------|
| HTTP 404 | Model-ID existiert nicht mehr → Schritt 1 |
| HTTP 429 | Rate Limit → anderes Model wechseln |
| Config wird zurückgesetzt | Installer überschreibt → alle 3 Dateien prüfen |
| `BAZE²` Pfad-Fehler | `BAZE~1` oder `%USERPROFILE%` benutzen |
| Gemini API Quota | Reset ~09:00 MESZ täglich, OpenRouter-Free als Fallback |

---

## Verifizierte Free-Modelle (Stand: 2026-05-13)

```
minimax/minimax-m2.5:free
qwen/qwen3-coder:free
qwen/qwen3-next-80b-a3b-instruct:free
google/gemma-4-31b-it:free
google/gemma-4-26b-a4b-it:free
meta-llama/llama-3.3-70b-instruct:free
meta-llama/llama-3.2-3b-instruct:free
nvidia/nemotron-3-super-120b-a12b:free
nvidia/nemotron-3-nano-30b-a3b:free
nvidia/nemotron-nano-9b-v2:free
openai/gpt-oss-120b:free
openai/gpt-oss-20b:free
nousresearch/hermes-3-llama-3.1-405b:free
arcee-ai/trinity-large-thinking:free
liquid/lfm-2.5-1.2b-thinking:free
poolside/laguna-m.1:free
```

> **TIPP:** Liste ändert sich regelmäßig. Immer Schritt 1 ausführen
> bevor neue Models eingebunden werden!
