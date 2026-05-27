# GitOps & DeepKeep Auto-Release Pipeline

> Diese Dokumentation wird über den `.gitops` Befehl im DkZ Copilot aufgerufen.

## Was ist das?
Ein vollautomatisches CI/CD Pipeline System, das auf **GitHub Actions** basiert. Es stellt sicher, dass lokaler Code sicher, zensiert und dokumentiert auf den Hostinger VPS (`devkitz.eu`) und Blogger veröffentlicht wird.

## Komponenten
1. **DeepKeep Sanitizer (`deepkeep.js`)**
   - Ein Node.js Filter-Skript, das Code vor dem Release bereinigt.
   - **Filter:** Passwörter (`sk-...`, `ghp_...`), lokale Windows-Pfade.
   - **Identitäten:** Anonymisiert Klarnamen wie "BAZE²" oder "777".

2. **Auto-Release Workflow (`auto-release.yml`)**
   - Ein GitHub Actions Template, das den gesamten Prozess orchestriert.
   - Schiebt sauberen Code per SSH-Key direkt auf den Hostinger VPS in den Nginx `var/www` Ordner.
   - Pusht Blogbeiträge auf Google Blogger.

3. **Drilling (Auto-Dokumentation)**
   - Die Pipeline dokumentiert selbstständig, was sie getan hat, generiert ein `RELEASE_LOG.md` und pusht es zurück ins Git-Repository.

## Wie richte ich es in einem neuen Projekt ein?
1. Kopiere die Datei `C:\DEVKiTZ\github-hub\templates\gitops\auto-release.yml` in den Ordner `.github/workflows/` deines lokalen Projekts.
2. Kopiere das Skript `C:\DEVKiTZ\github-hub\templates\gitops\deepkeep.js` in deinen Projektordner (z.B. unter `shared/gitops/`).
3. Füge in GitHub unter **Settings > Secrets and variables > Actions** die Secrets `HOSTINGER_HOST` (IP/Domain) und `HOSTINGER_SSH_KEY` (dein privater Key `dkz_hostinger`) ein.
4. Mache einen Git Push. Der Rest passiert komplett automatisch.
