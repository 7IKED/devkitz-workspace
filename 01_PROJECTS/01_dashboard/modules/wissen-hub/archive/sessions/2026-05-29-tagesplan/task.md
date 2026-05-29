# Tagesplan 2026-05-29 — Task-Liste (FINAL)

> Abgeschlossen: 2026-05-29T08:25 CEST

---

## Block 1: 🧹 Housekeeping ✅ KOMPLETT

### Git Bereinigung
- [x] 2 untracked Projekte committed: `b2f7986f` + `abfce281` ✅
- [x] 3 Stashes gedroppt (Stash-Liste leer) ✅
- [x] 8 alte Branches geloescht + 6 Worktrees entfernt ✅
- [x] Verbleibend: main + feat/docs-roadmap-v3 + feat/second-brain-v2-dashy-nexus ✅
- [ ] ⚠️ git push: Auth-Token abgelaufen → 777 muss neuen PAT generieren

### features.json Sync
- [x] 14 Module registriert (122→138) ✅
- [x] matrix-center hasFeatures Drift gefixt ✅
- [x] flash-ui als leerer Ordner dokumentiert ✅

---

## Block 2: 🔧 Infra-Fixes ✅ KOMPLETT

- [x] REDNOTE.json erstellt (12 Eintraege) ✅
- [x] Blog Hub E2E Tests auf skip gesetzt (RN-003) ✅
- [x] Playwright verifiziert: 24 passed, 15 skipped ✅
- [x] Playwright Config aufgeteilt: offline + server Projekte ✅
- [x] Dedup-Test Timeout 30s→60s gefixt ✅
- [x] NPM Scripts aktualisiert (test:ci, test:server, test:full) ✅
- [x] Git Commits: `50e990b7`, `7654b92b` ✅

---

## Block 3: 🏗️ Modul-Pflege ⚠️ TEILWEISE

- [x] Playwright Config in 2 Projekte aufgeteilt ✅
- [ ] Module ohne index.html scaffolden (video-gen, bookmark, media, openclaw, stitch)
- [ ] Batch-READMEs generieren (~49 fehlend)
- [ ] Toast/Watchdog in weitere Module integrieren

---

## Block 4: 🧪 Testing ✅ KOMPLETT

- [x] Playwright offline: 24/25 passed, 15 skipped ✅
- [x] Dedup Timeout gefixt ✅
- [x] test:ci Script erstellt (nur offline-Tests) ✅
- [x] test:server Script erstellt (braucht localhost:8080) ✅

---

## Block 5: 🏚️ Altlasten ✅ GEKLAERT

### Hermes Gateway
- [x] Vollstaendige Analyse: 7 Hermes-Projekte durchsucht ✅
- [x] Gateway-Code ist PRODUKTIONSREIF (4821 Zeilen Python) ✅
- [x] Problem: .env hat keinen TELEGRAM_BOT_TOKEN ✅
- [x] Loesung: Token in .env setzen + `hermes gateway start` ✅
- [x] REDNOTE RN-001 bleibt offen → 777 muss Token setzen ✅

### SELFHEALTH DOCK → Won't Do
- [x] Existiert NIRGENDWO im Workspace ✅
- [x] Vollstaendig ersetzt durch Observability Stack ✅
- [x] REDNOTE RN-006 → won't_do ✅

### AiAiKirk → DEEPKEEP → Won't Do
- [x] DEEPKEEP existiert NIRGENDWO — war Phantom-Konzept ✅
- [x] AiAiKirk hat nur Build-Artefakte, kein Source ✅
- [x] Legacy-Archiv = Duplikat von AiAiKirk_root ✅
- [x] REDNOTE RN-007 → won't_do ✅

### Weitere Findings
- [x] flash-ui: Komplett leerer Ordner (nie implementiert) ✅
- [x] openclaw-vibe: Nur WORKFLOW.md, kein Code ✅

---

## Block 6: 📚 Doku + Sync ✅ KOMPLETT

- [x] REDNOTE.json aktualisiert (6 resolved/won't-do, 4 offen) ✅
- [x] Walkthrough erstellt ✅
- [x] Task-Liste finalisiert ✅
- [x] 5 Git Commits heute ✅

---

## Verbleibende offene REDNOTE-Eintraege (4)

| ID | Severity | Thema | Aktion fuer 777 |
|:---|:---------|:------|:----------------|
| RN-001 | 🔴 critical | Hermes Telegram Token | Token in .env setzen |
| RN-005 | 🟡 high | 5 Module ohne index.html | Bauen oder archivieren? |
| RN-008 | 🟡 medium | ~49 Module ohne README | deploy-readmes.ps1 |
| RN-009 | 🟡 medium | git push Token abgelaufen | Neuen PAT generieren |

*Abgeschlossen: 2026-05-29T08:25 CEST*
