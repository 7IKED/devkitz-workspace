/**
 * ⚡ DKZ API — SEO Routes
 * ═════════════════════════
 * SEO-Analyse, Keywords, Meta-Tags
 */

import { Router } from 'express';

const router = Router();

// ─── POST /seo/analyze ───
router.post('/seo/analyze', async (req, res) => {
    const { url, html, checks = ['all'] } = req.body;

    if (!url && !html) {
        return res.status(400).json({ error: 'url oder html erforderlich' });
    }

    try {
        let content = html;

        // Fetch URL if provided
        if (url && !html) {
            try {
                const resp = await fetch(url);
                content = await resp.text();
            } catch (err) {
                return res.status(400).json({ error: `URL nicht erreichbar: ${err.message}` });
            }
        }

        // Parse HTML for SEO factors
        const results = {
            score: 0,
            passed: [],
            warnings: [],
            errors: [],
            details: ''
        };

        let totalChecks = 0;
        let passedChecks = 0;

        // Title check
        const titleMatch = content.match(/<title[^>]*>(.*?)<\/title>/i);
        totalChecks++;
        if (titleMatch && titleMatch[1]) {
            const title = titleMatch[1].trim();
            if (title.length >= 30 && title.length <= 60) {
                results.passed.push(`✅ Title vorhanden und optimale Länge (${title.length} Zeichen)`);
                passedChecks++;
            } else if (title.length > 0) {
                results.warnings.push(`⚠️ Title vorhanden aber ${title.length < 30 ? 'zu kurz' : 'zu lang'} (${title.length} Zeichen, optimal: 30-60)`);
                passedChecks += 0.5;
            }
        } else {
            results.errors.push('❌ Kein <title> Tag gefunden');
        }

        // Meta description
        const descMatch = content.match(/<meta\s+name=["']description["']\s+content=["'](.*?)["']/i);
        totalChecks++;
        if (descMatch && descMatch[1]) {
            const desc = descMatch[1].trim();
            if (desc.length >= 120 && desc.length <= 160) {
                results.passed.push(`✅ Meta Description optimal (${desc.length} Zeichen)`);
                passedChecks++;
            } else {
                results.warnings.push(`⚠️ Meta Description ${desc.length < 120 ? 'zu kurz' : 'zu lang'} (${desc.length} Zeichen, optimal: 120-160)`);
                passedChecks += 0.5;
            }
        } else {
            results.errors.push('❌ Keine Meta Description gefunden');
        }

        // H1 check
        const h1Match = content.match(/<h1[^>]*>(.*?)<\/h1>/gi);
        totalChecks++;
        if (h1Match && h1Match.length === 1) {
            results.passed.push('✅ Genau ein H1-Tag vorhanden');
            passedChecks++;
        } else if (h1Match && h1Match.length > 1) {
            results.warnings.push(`⚠️ ${h1Match.length} H1-Tags gefunden (optimal: genau 1)`);
            passedChecks += 0.5;
        } else {
            results.errors.push('❌ Kein H1-Tag gefunden');
        }

        // Image alt tags
        const images = content.match(/<img[^>]*>/gi) || [];
        const imagesWithAlt = images.filter(img => /alt=["'][^"']+["']/i.test(img));
        totalChecks++;
        if (images.length === 0) {
            results.passed.push('✅ Keine Bilder ohne Alt-Text');
            passedChecks++;
        } else if (imagesWithAlt.length === images.length) {
            results.passed.push(`✅ Alle ${images.length} Bilder haben Alt-Text`);
            passedChecks++;
        } else {
            results.warnings.push(`⚠️ ${images.length - imagesWithAlt.length}/${images.length} Bilder ohne Alt-Text`);
            passedChecks += imagesWithAlt.length / images.length;
        }

        // Viewport meta
        totalChecks++;
        if (/<meta[^>]*name=["']viewport["']/i.test(content)) {
            results.passed.push('✅ Viewport Meta-Tag vorhanden');
            passedChecks++;
        } else {
            results.errors.push('❌ Kein Viewport Meta-Tag (Mobile-Optimierung fehlt)');
        }

        // Charset
        totalChecks++;
        if (/<meta[^>]*charset/i.test(content)) {
            results.passed.push('✅ Charset definiert');
            passedChecks++;
        } else {
            results.warnings.push('⚠️ Kein Charset Meta-Tag');
        }

        // OG Tags
        totalChecks++;
        const ogTags = content.match(/<meta[^>]*property=["']og:/gi) || [];
        if (ogTags.length >= 3) {
            results.passed.push(`✅ ${ogTags.length} Open Graph Tags vorhanden`);
            passedChecks++;
        } else if (ogTags.length > 0) {
            results.warnings.push(`⚠️ Nur ${ogTags.length} OG-Tags (empfohlen: mindestens 3)`);
            passedChecks += 0.5;
        } else {
            results.warnings.push('⚠️ Keine Open Graph Tags');
        }

        // Calculate score
        results.score = Math.round((passedChecks / totalChecks) * 100);
        results.details = `${results.passed.length} bestanden, ${results.warnings.length} Warnungen, ${results.errors.length} Fehler von ${totalChecks} Checks.`;

        if (url) results.url = url;
        res.json(results);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ─── POST /seo/keywords ───
router.post('/seo/keywords', (req, res) => {
    const { keyword, language = 'de', country = 'DE' } = req.body;
    if (!keyword) return res.status(400).json({ error: 'keyword erforderlich' });

    // Generate keyword suggestions (in production, this would call an API like SEMrush/Ahrefs)
    const baseKeyword = keyword.toLowerCase();
    const suggestions = [
        { keyword: baseKeyword, volume: Math.floor(Math.random() * 10000) + 1000, difficulty: Math.floor(Math.random() * 100), cpc: (Math.random() * 3 + 0.5).toFixed(2) + '€' },
        { keyword: `${baseKeyword} kaufen`, volume: Math.floor(Math.random() * 5000) + 500, difficulty: Math.floor(Math.random() * 80), cpc: (Math.random() * 5 + 1).toFixed(2) + '€' },
        { keyword: `${baseKeyword} vergleich`, volume: Math.floor(Math.random() * 3000) + 300, difficulty: Math.floor(Math.random() * 70), cpc: (Math.random() * 4 + 0.8).toFixed(2) + '€' },
        { keyword: `beste ${baseKeyword}`, volume: Math.floor(Math.random() * 4000) + 400, difficulty: Math.floor(Math.random() * 75), cpc: (Math.random() * 3.5 + 0.6).toFixed(2) + '€' },
        { keyword: `${baseKeyword} test`, volume: Math.floor(Math.random() * 6000) + 600, difficulty: Math.floor(Math.random() * 65), cpc: (Math.random() * 2.5 + 0.4).toFixed(2) + '€' },
        { keyword: `${baseKeyword} erfahrungen`, volume: Math.floor(Math.random() * 2000) + 200, difficulty: Math.floor(Math.random() * 60), cpc: (Math.random() * 2 + 0.3).toFixed(2) + '€' },
        { keyword: `${baseKeyword} online`, volume: Math.floor(Math.random() * 3500) + 350, difficulty: Math.floor(Math.random() * 55), cpc: (Math.random() * 3 + 0.7).toFixed(2) + '€' },
        { keyword: `${baseKeyword} kostenlos`, volume: Math.floor(Math.random() * 8000) + 800, difficulty: Math.floor(Math.random() * 40), cpc: (Math.random() * 1.5 + 0.2).toFixed(2) + '€' },
    ];

    res.json({ keywords: suggestions, language, country });
});

// ─── POST /seo/generate-meta ───
router.post('/seo/generate-meta', (req, res) => {
    const { content, url, keywords = [] } = req.body;
    if (!content) return res.status(400).json({ error: 'content erforderlich' });

    // Extract first meaningful text
    const cleanText = content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    const words = cleanText.split(' ');

    // Generate title (50-60 chars)
    const titleWords = words.slice(0, 8);
    const title = titleWords.join(' ').substring(0, 60);

    // Generate description (120-160 chars)
    const descWords = words.slice(0, 25);
    const description = descWords.join(' ').substring(0, 155) + '...';

    const keywordStr = keywords.length > 0 ? keywords.join(', ') : words.slice(0, 5).join(', ');

    const html = `<title>${title}</title>
<meta name="description" content="${description}">
<meta name="keywords" content="${keywordStr}">
<meta property="og:title" content="${title}">
<meta property="og:description" content="${description}">
<meta property="og:type" content="website">
${url ? `<meta property="og:url" content="${url}">` : ''}
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${title}">
<meta name="twitter:description" content="${description}">`;

    res.json({ title, description, keywords: keywordStr, html });
});

export { router as seoRoutes };
