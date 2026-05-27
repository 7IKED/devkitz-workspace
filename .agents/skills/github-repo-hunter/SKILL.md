# GitHub Repo Hunter — Skills, Docs, Workflows & Frameworks finden

> Systematische GitHub-Suche nach Dokumentationen, Skills, Workflows,
> Grafiken, Methoden (BMAD, Ralph Loop), Frameworks und Awesome-Listen.
> **Awesome-Repos immer oben anzeigen!**

---

## Wann benutzen

- Du suchst **Skills/Skill-Packs** für Agenten (Claude, Hermes, Cursor)
- Du brauchst **Workflow-Templates** (n8n, GitHub Actions, CI/CD)
- Du willst **Awesome-Listen** zu einem Thema finden
- Du suchst **Methoden/Frameworks** wie BMAD, Ralph Loop, PARA, Zettelkasten
- Du brauchst **Grafik-Assets** (Icons, UI Kits, Design Systems)
- Du willst **Dokumentationen** von Tools/Libraries rippen

---

## Suchstrategie: Awesome-First

**IMMER diese Reihenfolge:**

1. 🏆 **Awesome-Listen** zuerst (kuratierte Sammlungen)
2. 📦 **Skill-Packs / Frameworks** (fertige Pakete)
3. 📖 **Dokumentationen** (Guides, Wikis)
4. 🔄 **Workflows** (Automatisierung)
5. 🎨 **Grafiken** (Assets, Icons, Templates)

---

## Kategorie 1: Awesome-Listen finden

### MCP Tool (bevorzugt)

```
mcp_dkz-n8n-research_google_search(
  query: "site:github.com awesome-llm-agents curated list",
  num_results: 10
)
```

### Suchbegriffe für Awesome-Listen

| Thema | Suchbegriff |
|:------|:-----------|
| LLM Agents | `awesome-llm-agents` `awesome-ai-agents` |
| AI Skills | `awesome-ai-skills` `awesome-claude-code` |
| Workflows | `awesome-n8n` `awesome-github-actions` |
| Prompts | `awesome-chatgpt-prompts` `awesome-system-prompts` |
| Design | `awesome-design-systems` `awesome-css` |
| MCP | `awesome-mcp-servers` `awesome-model-context-protocol` |
| Coding | `awesome-coding-agents` `awesome-copilot` |
| DevOps | `awesome-docker` `awesome-selfhosted` |
| Data | `awesome-data-engineering` `awesome-duckdb` |
| Grafiken | `awesome-icons` `awesome-svg` `awesome-design-tools` |

### PowerShell: GitHub API Suche

```powershell
# Awesome-Listen suchen — sortiert nach Sternen
$query = "awesome+llm+agents"
$result = Invoke-RestMethod -Uri "https://api.github.com/search/repositories?q=$query+in:name&sort=stars&order=desc&per_page=10"
$result.items | ForEach-Object {
  Write-Host "⭐ $($_.stargazers_count) | $($_.full_name) — $($_.description)"
}
```

---

## Kategorie 2: Skills & Skill-Packs

### Agent-spezifische Skills

```powershell
# Claude Code Skills
$queries = @(
  "claude-code+skills",
  "cursor+rules+collection",
  "hermes+agent+skills",
  "opencode+plugins",
  "copilot+instructions"
)

foreach ($q in $queries) {
  Write-Host "`n=== $q ===" -ForegroundColor Cyan
  $r = Invoke-RestMethod -Uri "https://api.github.com/search/repositories?q=$q&sort=stars&order=desc&per_page=5"
  $r.items | ForEach-Object {
    Write-Host "  ⭐ $($_.stargazers_count) | $($_.full_name)"
  }
  Start-Sleep 2
}
```

### Bekannte Skill-Repos (Direkt-Links)

| Repo | Beschreibung |
|:-----|:-------------|
| `sindresorhus/awesome` | Meta: Alle Awesome-Listen |
| `f/awesome-chatgpt-prompts` | 100K+ Prompts |
| `modelcontextprotocol/servers` | Offizielle MCP Server |
| `punkpeye/awesome-mcp-servers` | Community MCP Server |
| `NousResearch/hermes-agent` | Hermes + 87 Skills |
| `anthropics/anthropic-cookbook` | Claude Code Patterns |
| `cursor-rules/cursor-rules` | Cursor Rules Sammlung |
| `PatrickJS/awesome-cursorrules` | Awesome Cursor Rules |
| `stackblitz/bolt.new` | Full-Stack Agent |

---

## Kategorie 3: Dokumentationen suchen

### Doku-Repos finden

```powershell
# Dokumentation zu einem Tool suchen
$tool = "hermes-agent"
$queries = @(
  "$tool+documentation",
  "$tool+wiki",
  "$tool+docs+guide",
  "$tool+tutorial+examples"
)

foreach ($q in $queries) {
  $r = Invoke-RestMethod -Uri "https://api.github.com/search/repositories?q=$q&sort=stars&order=desc&per_page=3"
  $r.items | ForEach-Object {
    Write-Host "📖 $($_.full_name) — $($_.description)"
  }
}
```

### Doku direkt im Repo suchen (Code Search)

```powershell
# Markdown-Dateien in einem Repo finden
$owner = "NousResearch"
$repo = "hermes-agent"
$tree = Invoke-RestMethod -Uri "https://api.github.com/repos/$owner/$repo/git/trees/main?recursive=1"
$docs = $tree.tree | Where-Object { $_.path -match '\.(md|rst|txt)$' -and $_.path -match 'doc|guide|wiki|tutorial' }
$docs | ForEach-Object { Write-Host "  📄 $($_.path)" }
```

---

## Kategorie 4: Workflows finden

### GitHub Actions Workflows

```powershell
$queries = @(
  "reusable+workflow+template",
  "github+actions+ci+cd+template",
  "n8n+workflow+template",
  "automation+workflow+collection"
)

foreach ($q in $queries) {
  $r = Invoke-RestMethod -Uri "https://api.github.com/search/repositories?q=$q&sort=stars&order=desc&per_page=3"
  $r.items | ForEach-Object {
    Write-Host "🔄 ⭐$($_.stargazers_count) | $($_.full_name)"
  }
}
```

### n8n Community Workflows

```
mcp_dkz-n8n-research_google_search(
  query: "site:github.com n8n workflow template collection",
  num_results: 10
)
```

---

## Kategorie 5: Methoden & Frameworks

### Bekannte Methoden suchen

```powershell
$methods = @(
  "BMAD+methodology+agent",
  "ralph+loop+development",
  "PARA+method+knowledge",
  "zettelkasten+digital+garden",
  "second+brain+obsidian",
  "getting+things+done+GTD",
  "agentic+coding+framework",
  "swarm+multi+agent+framework",
  "crew-ai+framework",
  "autogen+multi+agent",
  "langchain+agent+template"
)

foreach ($m in $methods) {
  $r = Invoke-RestMethod -Uri "https://api.github.com/search/repositories?q=$m&sort=stars&order=desc&per_page=2"
  if ($r.total_count -gt 0) {
    Write-Host "`n🏗️ $m" -ForegroundColor Yellow
    $r.items | ForEach-Object {
      Write-Host "   ⭐ $($_.stargazers_count) | $($_.full_name) — $($_.description)"
    }
  }
  Start-Sleep 2
}
```

---

## Kategorie 6: Grafik-Assets & Design

### Icons, UI Kits, SVGs

```powershell
$queries = @(
  "icon+pack+svg+free",
  "design+system+css+tokens",
  "ui+kit+components+dark+theme",
  "glassmorphism+css+template",
  "dashboard+template+dark+mode",
  "cyberpunk+ui+assets"
)

foreach ($q in $queries) {
  $r = Invoke-RestMethod -Uri "https://api.github.com/search/repositories?q=$q&sort=stars&order=desc&per_page=3"
  $r.items | ForEach-Object {
    Write-Host "🎨 ⭐$($_.stargazers_count) | $($_.full_name)"
  }
}
```

### Bekannte Asset-Repos

| Repo | Was |
|:-----|:----|
| `lucide-icons/lucide` | 1500+ SVG Icons |
| `tabler/tabler-icons` | 5000+ Stroke Icons |
| `simple-icons/simple-icons` | Brand/Logo Icons |
| `phosphor-icons/core` | Flexible Icon Family |
| `css-doodle/css-doodle` | CSS Pattern Generator |
| `animate-css/animate.css` | CSS Animationen |

---

## Mega-Scanner: Alles auf einmal

```powershell
# Komplett-Suche zu einem Thema — Awesome zuerst!
param([string]$topic = "ai-agents")

$categories = @{
  "AWESOME"     = "awesome+$topic"
  "SKILLS"      = "$topic+skills+pack"
  "DOCS"        = "$topic+documentation+guide"
  "WORKFLOWS"   = "$topic+workflow+template"
  "FRAMEWORKS"  = "$topic+framework+boilerplate"
  "ASSETS"      = "$topic+assets+icons+design"
}

foreach ($cat in @("AWESOME","SKILLS","DOCS","WORKFLOWS","FRAMEWORKS","ASSETS")) {
  $q = $categories[$cat]
  Write-Host "`n━━━ $cat ━━━" -ForegroundColor Cyan
  
  $r = Invoke-RestMethod -Uri "https://api.github.com/search/repositories?q=$q&sort=stars&order=desc&per_page=5"
  
  if ($r.total_count -eq 0) {
    Write-Host "  (keine Ergebnisse)"
    continue
  }
  
  $r.items | ForEach-Object {
    $icon = switch ($cat) {
      "AWESOME"    { "🏆" }
      "SKILLS"     { "🧠" }
      "DOCS"       { "📖" }
      "WORKFLOWS"  { "🔄" }
      "FRAMEWORKS" { "🏗️" }
      "ASSETS"     { "🎨" }
    }
    Write-Host "  $icon ⭐$($_.stargazers_count) | $($_.full_name)"
    Write-Host "     $($_.description)" -ForegroundColor DarkGray
    Write-Host "     $($_.html_url)" -ForegroundColor DarkGray
  }
  Start-Sleep 3
}
```

### Speichern als Script

```powershell
# Script speichern und benutzen:
# .\github-hunt.ps1 -topic "mcp-servers"
# .\github-hunt.ps1 -topic "ai-coding-agents"
# .\github-hunt.ps1 -topic "design-systems"
```

---

## MCP Tools Integration

| Aktion | Tool |
|:-------|:-----|
| Web-Suche | `mcp_dkz-n8n-research_google_search(query)` |
| Deep Research | `mcp_dkz-n8n-research_google_deep_research_max(query)` |
| Repo Overview | `mcp_dkz-n8n-research_github_repo_overview(repo_url)` |
| Reddit Meinungen | `mcp_dkz-n8n-research_reddit_search(query)` |
| X/Twitter Trends | `mcp_dkz-n8n-research_x_search(query)` |
| YouTube Tutorials | `mcp_dkz-n8n-research_youtube_search(query)` |
| Obsidian Speichern | `mcp_devkitz-autoresearch_ingest_url_to_obsidian(url)` |

---

## Ergebnis-Ablage

```
SecondBrain/02_Wissen/
├── awesome-listen/
│   ├── awesome-llm-agents.md
│   ├── awesome-mcp-servers.md
│   └── awesome-design-systems.md
├── skill-packs/
│   ├── claude-code-skills.md
│   └── hermes-skills-overview.md
├── frameworks/
│   ├── bmad-methodology.md
│   ├── crew-ai-overview.md
│   └── langchain-agents.md
└── assets/
    ├── lucide-icons.md
    └── design-tokens.md
```

---

## Rate Limits

| API | Limit | Tipp |
|:----|:------|:-----|
| GitHub (unauthenticated) | 10 req/min | `Start-Sleep 6` |
| GitHub (mit Token) | 30 req/min | `$headers = @{Authorization = "token $env:GITHUB_TOKEN"}` |
| Jina Reader | ~20 req/min | `Start-Sleep 3` |
| DuckDuckGo (MCP) | Unbegrenzt | Bevorzugt für Erstsuche |

---

## Quick Reference

```powershell
# Schnellsuche — Awesome zu einem Thema
$topic = "ai-agents"
$r = Invoke-RestMethod "https://api.github.com/search/repositories?q=awesome+$topic&sort=stars&per_page=5"
$r.items | ForEach-Object { "⭐ $($_.stargazers_count) | $($_.full_name) — $($_.html_url)" }
```
