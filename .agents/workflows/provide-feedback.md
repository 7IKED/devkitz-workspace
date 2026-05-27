---
description: Feedback an GitHub Issues senden — Bug Reports, Feature Requests, Skill-Updates via GitKraken MCP
---

# Provide Feedback — GitHub Issues via MCP

> Feedback direkt aus der Antigravity-Session an GitHub Issues senden

## Schritte

1. **Feedback-Typ bestimmen:**
   - 🐛 Bug → Label: `bug`
   - ✨ Feature → Label: `enhancement`
   - 🔧 Skill-Update → Label: `skill-update`
   - 💬 Allgemein → Label: `feedback`

2. **Issue-Titel formulieren** (kurz, beschreibend)

3. **Issue-Body erstellen** nach Template:
   ```markdown
   ## [Bug Report | Feature Request | Skill Update]
   
   **Modul:** [modul-name]
   **Beschreibung:** [was passiert / was gewünscht]
   
   ### Details
   [Ausführliche Beschreibung]
   
   ### Labels
   feedback, from-agent, [bug|enhancement|skill-update]
   ```

4. **Issue erstellen via GitKraken MCP:**
   ```
   Tool: mcp_GitKraken_issues_add_comment
   Parameters:
     provider: github
     repository_organization: BAZE2
     repository_name: devkitz-ecosystem
     issue_id: [ID oder neues Issue]
     comment: [Body]
   ```

5. **Bestätigung an User** mit Issue-Link

## Eigene Issues abrufen

```
Tool: mcp_GitKraken_issues_assigned_to_me
Parameters:
  provider: github
```

## Pull Request erstellen (bei Code-Feedback)

```
Tool: mcp_GitKraken_pull_request_create
Parameters:
  provider: github
  repository_organization: BAZE2
  repository_name: devkitz-ecosystem
  title: "fix(bereich): beschreibung"
  source_branch: fix/branch-name
  target_branch: main
```
