# Paperclip: Git-Nexus Integrationstest

**Datum:** 2026-06-24T11:00:00+02:00
**Tags:** n8n, test, git-nexus

# Git-Nexus Integrationstest

Dieser Test prüft die vollständige Paperclip-Pipeline:

1. ✅ sync-server.js schreibt JSON nach Paperless_Inbox/
2. 🧪 git_nexus.py archiviert als Markdown in ISSUES/
3. 🧪 Git-Commit wird ausgelöst
4. 🧪 Walkthrough wird aktualisiert

**Status:** Automatischer Durchlauf-Test
