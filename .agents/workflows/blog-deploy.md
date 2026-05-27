---
description: Blog Template auf Blogger-Blogs deployen — V2.1 DkZ Design mit Panel-Farben
---

# Blog Template Deploy Workflow

> **Wann:** Wenn ein Blogger-Blog das DkZ V2.1 Template erhalten soll
> **Template:** `[WORKSPACE]/blog-dashboard/blogger-template-v2.xml`
> **Regeln:** R2, R13, R15

---

## Phase 1: VORBEREITUNG

// turbo
1. Template laden und Panel-Farbe setzen:
```powershell
$template = Get-Content "C:\DEVKiTZ\[WORKSPACE]\blog-dashboard\blogger-template-v2.xml" -Raw
# Panel-Farbe Referenz: design_blog.md
# DEEPKEEP=#fa1e4e, BETCHECK=#00ff88, INTERN=#3b82f6, etc.
```

2. Panel-Farbe im Template anpassen:
   - `--panel-color:#fa1e4e` → `--panel-color:#BLOG_FARBE`
   - Logo-SVG `fill='#fa1e4e'` → `fill='#BLOG_FARBE'`

## Phase 2: DEPLOY via Browser

3. Blogger Admin öffnen: `https://www.blogger.com/blog/themes/edit/BLOG_ID`
4. **Gesamten inhalt** im HTML-Editor markieren (Ctrl+A)
5. **Template einfügen** (Ctrl+V)
6. **Speichern** klicken und XML-Validierung abwarten
7. Fehlermeldungen prüfen — häufige Fixes:
   - `&amp;` statt `&` in URLs
   - `CDATA` Wrapper für Script-Blöcke
   - Selbstschließende Tags: `<div/>` statt `<div></div>`

## Phase 3: CONTENT PRÜFEN

// turbo
8. Blog öffnen und prüfen:
   - [ ] Header mit Logo + Blog-Titel sichtbar
   - [ ] View-Toggle (Grid/Liste/Alle) funktioniert
   - [ ] Dark/Light Mode Toggle funktioniert
   - [ ] Footer mit DkZ Icons sichtbar
   - [ ] DEVKiTZ Popup bei Klick auf Logo/Footer
   - [ ] Artikel-Karten laden (falls Posts existieren)

## Phase 4: MINDESTENS 1 POST

9. Falls Blog leer → mindestens einen Post erstellen:
   - Titel: `Willkommen bei [BLOG_NAME]`
   - Labels: `DkZ`, `V2`, Themen-Tags
   - Inhalt: Kurze Beschreibung + Was kommt

## Phase 5: DOKUMENTATION

// turbo
10. `design_blog.md` prüfen — Blog + Panel-Farbe eingetragen?
11. Git Commit:
```powershell
cd C:\DEVKiTZ
git add -A ; git commit -m "feat(blog): deploy V2.1 template to BLOG_NAME"
```

## Panel-Farben Referenz (Kurzfassung)

| Blog | Farbe |
|:-----|:------|
| DEEPKEEP | `#fa1e4e` |
| BETCHECK | `#00ff88` |
| INTERN | `#3b82f6` |
| ADMIN | `#94a3b8` |
| CodeBaseHTML | `#22d3ee` |
| CS PLAYBOOK | `#f97316` |
| EAZY PROMPTS | `#ec4899` |
| CS WIKI | `#a855f7` |

> Vollständige Liste: `04_SYSTEM/docs/design_blog.md`
