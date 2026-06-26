# Next Round — Open Questions & Prompt

## Completed This Session
- `8327b513 feat(arch): v2.02 Graphify & GitNexus First, 4 neue Module, VPS-Deployment, ignore _github_upload_temp` ✓
- BFG-Temp gelöscht (`C:\Users\BAZE²\AppData\Local\Temp\bfg.jar`) ✓
- Git-Status sauber (nur submodules untracked) ✓

## Open Tasks für Nächste Runde

### 1. GitHub OAuth App erstellen & Client ID eintragen
Dringend. Wird für globales Login auf `hub.dkz.app` benötigt.

**Aktion:**
1. Gehe zu https://github.com/settings/developers
2. "New OAuth App" → Application name: `dkz.app`
3. Homepage URL: `https://hub.dkz.app`
4. Authorization callback URL: `https://hub.dkz.app/oauth-callback`
5. Client ID kopieren
6. Client Secret generieren

**Client ID eintragen in:**
- `01_PROJECTS/01_dashboard/shared/dkz-auth.js` → Zeile mit `REPLACE_WITH_GITHUB_CLIENT_ID`

### 2. 4 private Repos in D-VKITZ erstellen
`gh` CLI zeigt 401 (Token ungültig). Lösung:
- Entweder `gh auth login` mit gültigem PAT mit `admin:org` + `repo` Scopes
- Oder manuell via Browser:
  - `github.com/D-VKITZ/anythingllm-config` (private)
  - `github.com/D-VKITZ/dashy-config` (private)
  - `github.com/D-VKITZ/graphify-ui` (private)
  - `github.com/D-VKITZ/gitnexus-visualizer` (private)

### 3. VPS Deployment pushen
SSH key `~/.ssh/dkz_hostinger` für root@72.61.93.129 schlägt fehl.
- **Prüfen:** Ist der Public Key (`dkz_hostinger.pub`) in `~/.ssh/authorized_keys` auf dem VPS?
- **Wenn ja:** `ssh-add ~/.ssh/dkz_hostinger` und erneut verbinden
- **Dann:** `scp 04_SYSTEM/vps-deployment/* root@72.61.93.129:/root/dkz-deploy/`
- **Dann:** `ssh root@72.61.93.129 "cd /root/dkz-deploy && ./deploy.sh"`

### 4. Finaler Commit & Push
Wenn alles oben erledigt ist:
```bash
git add 01_dashboard/shared/dkz-auth.js
git commit -m "feat(vps): Docker Deployment Scripts und OAuth Architektur integriert"
git push origin main
git push dvkitz main
```

## Wichtige Notes
- `GITHUB_TOKEN` env var war ungültig (fake-token) — nach Bereinigung funktionierte `gh` als 7IKED, aber Token hat keine D-VKITZ Org-Rechte
- SSH Key `dkz_hostinger` existiert lokal, wird aber vom VPS abgewiesen
- `dkz-center` + `freeapi` sind submodules — nicht anfassen
- `hyperreal-react/node_modules` gross — evtl. später in `.gitignore` aufnehmen
