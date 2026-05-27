# Doc Ripper — Dokumentationen extrahieren und als Markdown speichern

> Komplette Dokumentationen von Websites, GitHub Repos und APIs rippen
> und als saubere Markdown-Dateien im Second Brain ablegen.

---

## Wann benutzen

- Du willst eine **komplette Doku** offline verfügbar machen
- Du brauchst **API-Referenzen** als lokale Markdown-Dateien
- Du willst **GitHub READMEs + Wikis** archivieren
- Du willst **YouTube-Transkripte** als Text speichern
- Du willst eine **Wissensbasis** für Agenten aufbauen

---

## Methode 1: Website-Doku rippen (Jina Reader)

### Einzelne Seite

```powershell
# Via Jina Reader API — konvertiert HTML zu Markdown
$url = "https://docs.example.com/getting-started"
$md = Invoke-RestMethod -Uri "https://r.jina.ai/$url" -Method Get
$md | Out-File -FilePath "C:\Users\BAZE~1\Documents\SecondBrain\02_Wissen\example-getting-started.md" -Encoding utf8
```

### Oder via MCP Tool

```
mcp_devkitz-autoresearch_ingest_url_to_obsidian(
  url: "https://docs.example.com/getting-started",
  title: "Example - Getting Started"
)
```

### Mehrere Seiten (Batch)

```powershell
# URLs Liste definieren
$urls = @(
  "https://docs.example.com/getting-started",
  "https://docs.example.com/api-reference",
  "https://docs.example.com/configuration",
  "https://docs.example.com/deployment"
)

$outputDir = "C:\Users\BAZE~1\Documents\SecondBrain\02_Wissen\example-docs"
New-Item -ItemType Directory -Path $outputDir -Force

foreach ($url in $urls) {
  $name = ($url -split '/')[-1]
  $md = Invoke-RestMethod -Uri "https://r.jina.ai/$url" -Method Get
  $md | Out-File -FilePath "$outputDir\$name.md" -Encoding utf8
  Write-Host "OK $name"
  Start-Sleep 2  # Rate Limit beachten
}
```

---

## Methode 2: GitHub Repo Doku rippen

### README + Wiki

```powershell
# README als Markdown
$owner = "NousResearch"
$repo = "hermes-agent"
$readme = Invoke-RestMethod -Uri "https://raw.githubusercontent.com/$owner/$repo/main/README.md"
$readme | Out-File "SecondBrain\02_Wissen\hermes-agent-readme.md" -Encoding utf8

# Alle Markdown-Dateien im Repo finden
$tree = Invoke-RestMethod -Uri "https://api.github.com/repos/$owner/$repo/git/trees/main?recursive=1"
$mdFiles = $tree.tree | Where-Object { $_.path -match '\.md$' }
$mdFiles | ForEach-Object { Write-Host $_.path }
```

### Komplettes Repo (alle .md Dateien)

```powershell
$owner = "NousResearch"
$repo = "hermes-agent"
$outputDir = "SecondBrain\02_Wissen\$repo-docs"
New-Item -ItemType Directory -Path $outputDir -Force

$tree = Invoke-RestMethod -Uri "https://api.github.com/repos/$owner/$repo/git/trees/main?recursive=1"
$mdFiles = $tree.tree | Where-Object { $_.path -match '\.md$' }

foreach ($f in $mdFiles) {
  $content = Invoke-RestMethod -Uri "https://raw.githubusercontent.com/$owner/$repo/main/$($f.path)"
  $safeName = $f.path -replace '/', '_'
  $content | Out-File "$outputDir\$safeName" -Encoding utf8
  Write-Host "OK $($f.path)"
}
```

### Via MCP Tool (schneller)

```
mcp_dkz-n8n-research_github_repo_overview(
  repo_url: "https://github.com/NousResearch/hermes-agent"
)
```

---

## Methode 3: Deep Research (Auto-Ripper)

Nutzt DuckDuckGo + Jina AI für tiefgehende Recherche:

```
mcp_dkz-n8n-research_google_deep_research_max(
  query: "Hermes Agent configuration and setup guide",
  follow_links: 5
)
```

Oder für autonome Recherche mit Speicherung in Obsidian:

```
mcp_devkitz-autoresearch_autoresearch(
  topic: "OpenRouter API free tier models and rate limits 2026"
)
```

---

## Methode 4: YouTube Transkript rippen

```
mcp_devkitz-autoresearch_ingest_url_to_obsidian(
  url: "https://www.youtube.com/watch?v=VIDEO_ID",
  title: "Tutorial - Thema"
)
```

---

## Ablage-Struktur (Second Brain)

```
C:\Users\BAZE~1\Documents\SecondBrain\
├── 01_Projekte/
│   └── hermes/
│       ├── setup-guide.md
│       └── api-reference.md
├── 02_Wissen/
│   ├── openrouter-docs/
│   │   ├── getting-started.md
│   │   ├── models.md
│   │   └── rate-limits.md
│   ├── hermes-agent-docs/
│   │   ├── README.md
│   │   ├── docs_user-guide_features_lsp.md
│   │   └── CONTRIBUTING.md
│   └── youtube-transcripts/
│       └── tutorial-thema.md
├── 03_Chat_Logs/
├── 04_Templates/
└── 05_Archive/
```

---

## Markdown Cleanup Regeln

Nach dem Rippen immer prüfen:

1. **Frontmatter hinzufügen:**
```markdown
---
source: https://original-url.com
date: 2026-05-13
type: documentation
tags: [hermes, api, setup]
---
```

2. **Kaputte Links entfernen** — relative URLs funktionieren nicht lokal
3. **Bilder optional laden** — oder durch `[Bild: Beschreibung]` ersetzen
4. **Navigation-Elemente entfernen** — Header, Footer, Sidebar
5. **Code-Blöcke prüfen** — Sprache annotieren (```javascript, ```python)

---

## Batch-Ripper für komplette Doku-Sites

### Vorgehensweise

1. **Sitemap finden:** `https://docs.example.com/sitemap.xml`
2. **URLs extrahieren:** Alle `<loc>` Tags parsen
3. **Batch-Download:** Jede URL durch Jina Reader jagen
4. **Speichern:** Als `.md` im Second Brain

```powershell
# Sitemap parsen und alle Doku-Seiten rippen
$sitemap = Invoke-RestMethod -Uri "https://docs.example.com/sitemap.xml"
$urls = $sitemap.urlset.url.loc | Where-Object { $_ -match '/docs/' }

$outputDir = "SecondBrain\02_Wissen\example-complete"
New-Item -ItemType Directory -Path $outputDir -Force

$i = 0
foreach ($url in $urls) {
  $i++
  $name = ($url -split '/')[-1]
  if (-not $name) { $name = "index" }
  
  Write-Host "[$i/$($urls.Count)] $name..."
  $md = Invoke-RestMethod -Uri "https://r.jina.ai/$url" -Method Get
  
  # Frontmatter hinzufügen
  $header = "---`nsource: $url`ndate: $(Get-Date -Format 'yyyy-MM-dd')`n---`n`n"
  ($header + $md) | Out-File "$outputDir\$name.md" -Encoding utf8
  
  Start-Sleep 3  # Rate Limit
}
Write-Host "`n Fertig! $i Seiten gerippt."
```

---

## Quick Commands

| Aktion | Befehl |
|:-------|:-------|
| Einzelne URL | `ingest_url_to_obsidian(url, title)` |
| Deep Research | `google_deep_research_max(query, 5)` |
| Auto Research | `autoresearch(topic)` |
| GitHub Repo | `github_repo_overview(repo_url)` |
| YouTube | `ingest_url_to_obsidian(youtube_url, title)` |

---

## Tipps

- **Rate Limits:** Jina Reader hat ~20 req/min — `Start-Sleep 3` zwischen Requests
- **Große Dokus:** Sitemap-Methode nutzen statt manuell URLs sammeln
- **API Docs:** Swagger/OpenAPI JSON holen und zu Markdown konvertieren
- **Obsidian Links:** `[[Dateiname]]` Syntax für Verlinkung zwischen Dokumenten
- **Versionierung:** Git-Track den SecondBrain Ordner für History
