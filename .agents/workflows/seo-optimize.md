---
description: SEO optimieren — Meta-Tags, Schema, Performance, Content-Strategie
---

# /seo-optimize — SEO Optimierungs-Workflow

> **Kernregel:** Der passende und ordentlich eingetragene Workflow ist wichtiger als das Ergebnis.

## Wann verwenden?
- Neue Website/Landing Page live schalten
- Blog-Netzwerk optimieren
- Ranking-Probleme diagnostizieren
- Content-Strategie planen

## Workflow

### 1. Technisches SEO prüfen
```html
<!-- PFLICHT in jedem <head>: -->
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>[Seite] — [Brand] | [Keyword]</title>
<meta name="description" content="[150-160 Zeichen, mit Keyword]">
<meta name="robots" content="index, follow">
<link rel="canonical" href="https://[domain]/[pfad]">

<!-- Open Graph -->
<meta property="og:title" content="[Titel]">
<meta property="og:description" content="[Beschreibung]">
<meta property="og:image" content="https://[domain]/og-image.png">
<meta property="og:type" content="website">

<!-- Twitter -->
<meta name="twitter:card" content="summary_large_image">
```

### 2. Schema Markup
```html
<script type="application/ld+json">
{
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "[Brand]",
    "url": "https://[domain]",
    "description": "[Beschreibung]",
    "publisher": {
        "@type": "Organization",
        "name": "[Brand]"
    }
}
</script>
```

### 3. Content-Checkliste
- [ ] H1 nur 1x pro Seite (mit Haupt-Keyword)
- [ ] H2/H3 Hierarchie korrekt
- [ ] Alt-Text für alle Bilder
- [ ] Interne Verlinkung (min. 3 pro Seite)
- [ ] Meta Description unique pro Seite
- [ ] URL-Struktur sauber (keine Sonderzeichen)
- [ ] Mobile-responsive
- [ ] Ladezeit < 3 Sekunden

### 4. Performance prüfen
```bash
# Lighthouse CLI
npx lighthouse https://[domain] --output=json --output-path=./lighthouse.json

# Oder im Browser: DevTools → Lighthouse Tab
```

### 5. Sitemap & Robots
```xml
<!-- sitemap.xml -->
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    <url>
        <loc>https://[domain]/</loc>
        <lastmod>[DATUM]</lastmod>
        <priority>1.0</priority>
    </url>
</urlset>
```

```
# robots.txt
User-agent: *
Allow: /
Sitemap: https://[domain]/sitemap.xml
```

### 6. Blog-Netzwerk SEO (Multi-Blog)
```markdown
Für jedes Blog:
1. Unique Title + Description
2. Kategorie-spezifische Keywords
3. Cross-Linking zwischen relevanten Blogs
4. Thematische Verticals definieren
5. Content-Kalender erstellen
```

### 7. Monitoring
- Google Search Console einrichten
- Core Web Vitals prüfen
- 404-Fehler beheben
- Indexierungsstatus checken

### 8. Git Commit
```bash
git add -A
git commit -m "chore(seo): [domain/modul] SEO optimiert — meta, schema, performance"
```
