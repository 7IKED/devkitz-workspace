param(
  [Parameter(Mandatory=$true)]
  [string]$topic,
  [int]$results = 5
)

# GitHub Repo Hunter — Awesome-First Mega-Scanner
# Usage: .\github-hunt.ps1 -topic "ai-agents"
#        .\github-hunt.ps1 -topic "mcp-servers" -results 10

Write-Host "`n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Magenta
Write-Host "  GitHub Repo Hunter: $topic" -ForegroundColor White
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`n" -ForegroundColor Magenta

$categories = [ordered]@{
  "AWESOME"     = @{ query = "awesome+$topic"; icon = [char]0x1F3C6 }
  "SKILLS"      = @{ query = "$topic+skills+pack+collection"; icon = [char]0x1F9E0 }
  "DOCS"        = @{ query = "$topic+documentation+guide+tutorial"; icon = [char]0x1F4D6 }
  "WORKFLOWS"   = @{ query = "$topic+workflow+template+automation"; icon = [char]0x1F504 }
  "FRAMEWORKS"  = @{ query = "$topic+framework+boilerplate+starter"; icon = [char]0x1F3D7 }
  "ASSETS"      = @{ query = "$topic+assets+icons+design+ui"; icon = [char]0x1F3A8 }
}

$totalFound = 0

foreach ($cat in $categories.Keys) {
  $q = $categories[$cat].query
  $icon = $categories[$cat].icon
  
  Write-Host "`n$icon $cat" -ForegroundColor Cyan
  Write-Host ("=" * 40) -ForegroundColor DarkGray
  
  try {
    $r = Invoke-RestMethod -Uri "https://api.github.com/search/repositories?q=$q&sort=stars&order=desc&per_page=$results" -ErrorAction Stop
  } catch {
    Write-Host "  Rate Limit — warte 10s..." -ForegroundColor Yellow
    Start-Sleep 10
    $r = Invoke-RestMethod -Uri "https://api.github.com/search/repositories?q=$q&sort=stars&order=desc&per_page=$results"
  }
  
  if ($r.total_count -eq 0) {
    Write-Host "  (keine Ergebnisse)" -ForegroundColor DarkGray
    continue
  }
  
  foreach ($item in $r.items) {
    $stars = $item.stargazers_count.ToString("N0")
    $totalFound++
    
    Write-Host "  $([char]0x2B50) $stars | " -NoNewline -ForegroundColor Yellow
    Write-Host "$($item.full_name)" -ForegroundColor White
    
    if ($item.description) {
      $desc = if ($item.description.Length -gt 80) { $item.description.Substring(0,77) + "..." } else { $item.description }
      Write-Host "     $desc" -ForegroundColor DarkGray
    }
    Write-Host "     $($item.html_url)" -ForegroundColor DarkCyan
  }
  
  Start-Sleep 3
}

Write-Host "`n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Magenta
Write-Host "  $totalFound Repos gefunden fuer: $topic" -ForegroundColor Green
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`n" -ForegroundColor Magenta
