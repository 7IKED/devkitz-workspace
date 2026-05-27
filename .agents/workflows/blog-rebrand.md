---
description: Blog-Netzwerk rebranden — Systematisches Umbenennen, Verticals, Design-Rollout
---

# /blog-rebrand — Blog-Netzwerk Rebranding

> **Kernregel:** Der passende und ordentlich eingetragene Workflow ist wichtiger als das Ergebnis.

## Wann verwenden?
- Blog-Netzwerk umbenennen/rebranden
- Neue thematische Verticals erstellen
- Design-System auf alle Blogs ausrollen
- Blog-Inventar systematisch pflegen

## Workflow

### 1. Inventar erstellen
```markdown
## Blog-Inventar
| # | Alter Name | Neuer Name | Vertical | URL | Status |
|:--|:-----------|:-----------|:---------|:----|:-------|
| 1 | [alt] | [neu] | [Kategorie] | [url] | ⬜ |
```

### 2. Verticals definieren
```markdown
## Thematische Verticals
| # | Vertical | Blogs | Keyword-Fokus |
|:--|:---------|:------|:-------------|
| 1 | Tech & Dev | 5 | Coding, AI, DevOps |
| 2 | Business | 4 | Marketing, Finance |
| 3 | Lifestyle | 3 | Health, Travel |
| ... | ... | ... | ... |
```

### 3. Naming Convention
```
Muster: [Brand] [Thema] [Suffix]
Beispiel: "DkZ Tech Blog", "DkZ Finance Hub"

Regeln:
- Kurz (max. 30 Zeichen)
- SEO-freundlich (Keyword im Namen)
- Brand-konsistent (gleichen Prefix nutzen)
- Keine Sonderzeichen im URL-Slug
```

### 4. Design-Template ausrollen
```bash
# DkZ Design System V2.1 auf alle Blogs
# → /blog-deploy Workflow für jedes Blog verwenden
# → Panel-Farben pro Vertical anpassen

# Farb-Zuweisung pro Vertical:
# Tech: --accent: #3b82f6 (blau)
# Business: --accent: #10b981 (grün)
# Lifestyle: --accent: #f59e0b (gelb)
# Creative: --accent: #8b5cf6 (lila)
```

### 5. Systematisches Umbenennen
```markdown
Pro Blog:
1. [ ] Blogger Settings → Titel ändern
2. [ ] Beschreibung aktualisieren
3. [ ] Design-Template deployen (/blog-deploy)
4. [ ] SEO Meta-Tags aktualisieren
5. [ ] Vertikals-Tag setzen
6. [ ] Cross-Links zu Vertikals-Blogs
7. [ ] Inventar-Status aktualisieren (✅)
```

### 6. Batch-Verarbeitung
```bash
# Für 50+ Blogs: Batch-Approach
# - 10 Blogs pro Session
# - Inventar nach jeder Session updaten
# - Git Commit nach jedem Batch
```

### 7. Validierung
- [ ] Alle Blogs erreichbar?
- [ ] Design konsistent?
- [ ] SEO-Tags korrekt?
- [ ] Cross-Links funktionieren?
- [ ] Inventar vollständig?

### 8. Git Commit
```bash
git add -A
git commit -m "feat(blogs): batch [X-Y] rebranded — [vertical] vertical"
```
