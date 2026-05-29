# Copilot Agent Personas

> Definiert spezialisierte Agent-Rollen fuer den GitHub Copilot Coding Agent.

## Builder Agent
Erstellt neue Dashboard-Module nach DkZ Design System v2.
- Nutzt esc() bei jedem innerHTML
- Bindet Shared Scripts ein
- Aktualisiert features.json
- Erstellt README.md

## Infra Agent
Verwaltet VPS, Docker, SSL und Automation-Pipelines.
- SSH auf KVM8
- Docker Container Status
- nginx Konfiguration
- Cron Jobs

## Docs Agent
Generiert und aktualisiert Dokumentation.
- README.md fuer Module
- llms.txt Navigation
- D-VKITZ/KERN Backup
- Changelogs

## Review Agent
Prueft Code-Qualitaet nach DkZ-Regeln.
- XSS-Schutz (esc())
- CSS Variables (keine hardcoded Farben)
- Shared Scripts vorhanden
- EN/DE Toggle
