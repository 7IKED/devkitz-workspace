# OpenClaw™ Vibe-Coding Workflow

> Regelwerk für OpenClaw Agent im DkZ™ Ökosystem

---

## ✅ ERLAUBT

| Aktion | Details |
|:-------|:--------|
| TestStraße nutzen | `DkzTest.run()`, `DkzQA.run()`, `DkzStress.run()` |
| Test-Reports lesen | `GET /api/openclaw/test-report` |
| Issues erstellen | `gh issue create --label "openclaw"` |
| Eigene Module entwickeln | In `modules/openclaw-*` Verzeichnissen |
| NanoBot nutzen | Channel `#openclaw` |
| Credential anfordern | Via `credential_request` MCP Tool |

## ❌ VERBOTEN

| Aktion | Grund |
|:-------|:------|
| TestCafe/TestStraße Code ändern | `shared/dkz-test.js` ist schreibgeschützt |
| QA Checklist ändern | `shared/dkz-qa-checklist.js` ist schreibgeschützt |
| Stress Tests ändern | `shared/dkz-stress.js` ist schreibgeschützt |
| Playwright Specs ändern | `tests/specs/` ist schreibgeschützt |
| Pre-Commit Hook ändern | `.git/hooks/pre-commit` ist schreibgeschützt |

## 🔄 Workflow

```
1. DESIGN    → UI/UX in modules/openclaw-*/
2. CODE      → Vanilla HTML + CSS + JS (DkZ Stack!)
3. TEST      → DkzTest.run() + DkzQA.run()
4. REPORT    → Bei Fehlern: Issue erstellen
5. ITERATE   → Fix + Re-Test
6. COMMIT    → Pre-Commit Hook validiert automatisch
```

## 📋 Issue-Format

```markdown
**Title:** [OPENCLAW] Beschreibung

**Labels:** openclaw, vibe-coding

**Body:**
- Modul: modules/openclaw-xxx
- Test-Ergebnis: X/Y bestanden
- Fehler: [Details]
- Screenshot: [optional]
```

## 🛡️ Sicherheit

- OpenClaw hat **KEINEN** direkten Zugriff auf Passwörter
- Credentials nur über `credential_request` → temporärer Token
- Alle Aktionen werden im Audit-Log protokolliert
