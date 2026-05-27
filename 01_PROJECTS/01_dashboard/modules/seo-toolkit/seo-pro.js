/* ═══════════════════════════════════════════════════════════════
   DkZ™ SEO Toolkit PRO — Engine v2.0
   Professional Business & E-Commerce SEO Analysis
   ═══════════════════════════════════════════════════════════════ */

(function() {
  'use strict';

  // ─── XSS Protection ───
  function esc(s) {
    const d = document.createElement('div');
    d.appendChild(document.createTextNode(s || ''));
    return d.innerHTML;
  }

  function showToast(m) {
    const t = document.getElementById('toast');
    t.textContent = m; t.classList.add('show');
    setTimeout(() => t.classList.remove('show'), 2500);
  }

  // ─── TAB SYSTEM ───
  function initTabs() {
    document.querySelectorAll('.seo-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        document.querySelectorAll('.seo-tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.seo-section').forEach(s => s.classList.remove('active'));
        tab.classList.add('active');
        document.getElementById('section-' + tab.dataset.section).classList.add('active');
      });
    });
  }

  // ─── SCORE HELPER ───
  function scoreColor(s) {
    return s >= 80 ? 'var(--green)' : s >= 60 ? 'var(--yellow)' : 'var(--red)';
  }
  function scoreRing(score, label) {
    const c = scoreColor(score);
    return `<div class="score-item"><div class="score-ring" style="border:3px solid ${c};color:${c}">${score}</div><div class="score-label">${esc(label)}</div></div>`;
  }

  // ─── 1. ON-PAGE ANALYSE ───
  window.analyzeOnPage = function() {
    const url = document.getElementById('seoUrl').value;
    const title = document.getElementById('seoTitle').value;
    const desc = document.getElementById('seoDesc').value;
    const h1 = document.getElementById('seoH1').value;
    const content = document.getElementById('seoContent').value;
    const keyword = document.getElementById('seoKeyword').value.toLowerCase();

    if (!title && !content) { showToast('⚠️ Bitte mindestens Titel + Content'); return; }

    // Scores
    const tLen = title.length;
    const dLen = desc.length;
    const cLen = content.length;
    const cLow = content.toLowerCase();

    const titleScore = (tLen >= 30 && tLen <= 60) ? 95 : (tLen >= 20 && tLen <= 70) ? 70 : 35;
    const descScore = (dLen >= 120 && dLen <= 160) ? 95 : (dLen >= 80 && dLen <= 180) ? 70 : 35;
    const contentScore = cLen >= 1500 ? 95 : cLen >= 600 ? 75 : cLen >= 300 ? 55 : 25;
    const h1Score = h1.length > 0 ? (h1.length >= 20 && h1.length <= 70 ? 95 : 65) : 20;

    // Keyword Analysis
    let kwScore = 0;
    let kwDensity = 0;
    let kwInTitle = false, kwInDesc = false, kwInH1 = false;
    if (keyword) {
      const words = cLow.split(/\s+/).length;
      const kwCount = (cLow.match(new RegExp(keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi')) || []).length;
      kwDensity = words > 0 ? ((kwCount / words) * 100).toFixed(1) : 0;
      kwInTitle = title.toLowerCase().includes(keyword);
      kwInDesc = desc.toLowerCase().includes(keyword);
      kwInH1 = h1.toLowerCase().includes(keyword);
      kwScore = (kwDensity >= 1 && kwDensity <= 3) ? 90 : (kwDensity > 0) ? 60 : 20;
      if (kwInTitle) kwScore = Math.min(100, kwScore + 5);
      if (kwInH1) kwScore = Math.min(100, kwScore + 5);
    }

    const overall = Math.round((titleScore + descScore + contentScore + h1Score + (keyword ? kwScore : contentScore)) / (keyword ? 5 : 4));

    // Render Scores
    document.getElementById('scoreGrid').innerHTML =
      scoreRing(overall, 'Gesamt') + scoreRing(titleScore, 'Title Tag') +
      scoreRing(descScore, 'Meta Desc') + scoreRing(contentScore, 'Content') +
      scoreRing(h1Score, 'H1 Tag') + (keyword ? scoreRing(kwScore, 'Keyword') : '');

    // Checklist
    const checks = [
      [tLen >= 30 && tLen <= 60, 'Title Tag 30-60 Zeichen', tLen + ' Zeichen'],
      [dLen >= 120 && dLen <= 160, 'Meta-Description 120-160 Zeichen', dLen + ' Zeichen'],
      [h1.length > 0, 'H1-Tag vorhanden', h1.length > 0 ? h1.substring(0, 40) + '...' : 'Fehlt'],
      [cLen >= 300, 'Content mind. 300 Wörter', cLen + ' Zeichen'],
      [url.includes('https'), 'HTTPS Verschlüsselung', url || 'Keine URL'],
      [!title.includes('  '), 'Keine doppelten Leerzeichen', 'Titel sauber'],
      [title.length > 0 && !title.match(/[A-Z\s]{5,}/), 'Kein Caps-Lock Spam', 'Titel Format'],
      [desc.includes('.') || desc.includes('!'), 'Meta mit Call-to-Action', 'Interpunktion'],
    ];
    if (keyword) {
      checks.push(
        [kwInTitle, 'Keyword im Title Tag', keyword],
        [kwInDesc, 'Keyword in Meta-Description', keyword],
        [kwInH1, 'Keyword im H1-Tag', keyword],
        [kwDensity >= 1 && kwDensity <= 3, 'Keyword-Dichte 1-3%', kwDensity + '%'],
      );
    }
    document.getElementById('checkList').innerHTML = checks.map(([pass, label, detail]) =>
      `<div class="check-item"><span class="ci-icon">${pass ? '✅' : '❌'}</span><span style="flex:1">${esc(label)}</span><span class="ci-detail">${esc(detail)}</span></div>`
    ).join('');

    // Keyword Extraction
    const stopwords = new Set(['und','der','die','das','ein','eine','ist','mit','für','von','auf','den','dem','des','sich','nicht','auch','als','wird','bei','nach','zum','zur','über','aber','oder','wie','kann','sind','hat','noch','nur','aus','wenn','man','dann','wir','sie','ich','ihr','sein','war','dass','haben','einem','einer','eines','er','es','so','was','alle','mehr','sehr','dieser','diese','dieses','diese','the','and','for','with','that','this','from','your','are','you','will','have','can','not','all','was','been','has','but','its','our','their','more','also','just','about','into','than','each','which','how','use','when','what','make','like','most','been','they','may','would','could','should','some','them','only','other','very','these','those','much','such','many','well','then','here','where','both','same','own','over','any','after','before','between','under','while','during','through','because','too','just','than']);
    const words = content.toLowerCase().replace(/[^a-zäöüß\s]/g, '').split(/\s+/).filter(w => w.length > 3 && !stopwords.has(w));
    const freq = {}; words.forEach(w => { freq[w] = (freq[w] || 0) + 1; });
    const topKw = Object.entries(freq).sort((a, b) => b[1] - a[1]).slice(0, 15);
    document.getElementById('kwList').innerHTML = topKw.map(([w, c]) =>
      `<span class="kw">${esc(w)} <span class="kw-count">${c}x</span></span>`
    ).join('');

    // SERP Preview
    const serpTitle = title || 'Seitentitel fehlt';
    const serpDesc = desc || 'Meta-Description wurde nicht gesetzt. Google wird einen eigenen Snippet erstellen...';
    const serpUrl = url || 'https://example.com/seite';
    document.getElementById('serpPreview').innerHTML = `
      <div class="serp-preview">
        <div class="serp-url">${esc(serpUrl)}</div>
        <div class="serp-title">${esc(serpTitle.substring(0, 60))}${tLen > 60 ? '...' : ''}</div>
        <div class="serp-desc">${esc(serpDesc.substring(0, 160))}${dLen > 160 ? '...' : ''}</div>
      </div>`;

    document.getElementById('onpageResults').style.display = 'block';
    showToast('🔍 On-Page Analyse abgeschlossen!');
  };

  // ─── 2. SCHEMA MARKUP GENERATOR ───
  window.generateSchema = function() {
    const type = document.getElementById('schemaType').value;
    const name = document.getElementById('schemaName').value || 'Mein Business';
    const desc = document.getElementById('schemaDesc').value || 'Premium Business Beschreibung';
    const url = document.getElementById('schemaUrl').value || 'https://example.com';

    const schemas = {
      LocalBusiness: {
        "@context": "https://schema.org", "@type": "LocalBusiness",
        name, description: desc, url,
        address: { "@type": "PostalAddress", streetAddress: "Musterstraße 1", addressLocality: "Berlin", postalCode: "10115", addressCountry: "DE" },
        telephone: "+49-30-1234567", priceRange: "€€€",
        openingHoursSpecification: [{ "@type": "OpeningHoursSpecification", dayOfWeek: ["Monday","Tuesday","Wednesday","Thursday","Friday"], opens: "09:00", closes: "18:00" }]
      },
      Product: {
        "@context": "https://schema.org", "@type": "Product",
        name, description: desc, url,
        brand: { "@type": "Brand", name: "DkZ™" },
        offers: { "@type": "Offer", price: "99.00", priceCurrency: "EUR", availability: "https://schema.org/InStock", url },
        aggregateRating: { "@type": "AggregateRating", ratingValue: "4.8", reviewCount: "124" }
      },
      Organization: {
        "@context": "https://schema.org", "@type": "Organization",
        name, description: desc, url,
        logo: url + "/logo.png",
        sameAs: ["https://twitter.com/example", "https://linkedin.com/company/example"],
        contactPoint: { "@type": "ContactPoint", telephone: "+49-30-1234567", contactType: "customer service", availableLanguage: ["German", "English"] }
      },
      Article: {
        "@context": "https://schema.org", "@type": "Article",
        headline: name, description: desc, url,
        author: { "@type": "Person", name: "777" },
        publisher: { "@type": "Organization", name: "DEVKiTZ™", logo: { "@type": "ImageObject", url: url + "/logo.png" } },
        datePublished: new Date().toISOString().split('T')[0],
        dateModified: new Date().toISOString().split('T')[0]
      },
      FAQPage: {
        "@context": "https://schema.org", "@type": "FAQPage",
        mainEntity: [
          { "@type": "Question", name: "Was kostet " + name + "?", acceptedAnswer: { "@type": "Answer", text: desc } },
          { "@type": "Question", name: "Wie funktioniert " + name + "?", acceptedAnswer: { "@type": "Answer", text: "Kontaktieren Sie uns für eine individuelle Beratung." } }
        ]
      },
      WebSite: {
        "@context": "https://schema.org", "@type": "WebSite",
        name, url, description: desc,
        potentialAction: { "@type": "SearchAction", target: { "@type": "EntryPoint", urlTemplate: url + "/search?q={search_term_string}" }, "query-input": "required name=search_term_string" }
      }
    };

    const json = JSON.stringify(schemas[type] || schemas.LocalBusiness, null, 2);
    document.getElementById('schemaOutput').textContent = json;
    document.getElementById('schemaScript').textContent = `<script type="application/ld+json">\n${json}\n<\/script>`;
    document.getElementById('schemaResult').style.display = 'block';
    showToast('📋 Schema Markup generiert!');
  };

  window.copySchema = function() {
    const code = document.getElementById('schemaScript').textContent;
    navigator.clipboard.writeText(code).then(() => showToast('📋 In Zwischenablage kopiert!'));
  };

  // ─── 3. OPEN GRAPH GENERATOR ───
  window.generateOG = function() {
    const title = document.getElementById('ogTitle').value || 'Seiten Titel';
    const desc = document.getElementById('ogDesc').value || 'Beschreibung für Social Media';
    const url = document.getElementById('ogUrl').value || 'https://example.com';
    const img = document.getElementById('ogImage').value || url + '/og-image.jpg';
    const type = document.getElementById('ogType').value;
    const site = document.getElementById('ogSiteName').value || 'Mein Business';

    const tags = [
      `<meta property="og:title" content="${title}">`,
      `<meta property="og:description" content="${desc}">`,
      `<meta property="og:url" content="${url}">`,
      `<meta property="og:image" content="${img}">`,
      `<meta property="og:type" content="${type}">`,
      `<meta property="og:site_name" content="${site}">`,
      `<meta property="og:locale" content="de_DE">`,
      ``,
      `<!-- Twitter Card -->`,
      `<meta name="twitter:card" content="summary_large_image">`,
      `<meta name="twitter:title" content="${title}">`,
      `<meta name="twitter:description" content="${desc}">`,
      `<meta name="twitter:image" content="${img}">`,
    ];

    document.getElementById('ogOutput').textContent = tags.join('\n');
    document.getElementById('ogPreviewBox').innerHTML = `
      <div class="og-preview">
        <div class="og-image">📷 ${esc(img.split('/').pop())}</div>
        <div class="og-content">
          <div class="og-site">${esc(site)}</div>
          <div class="og-title">${esc(title)}</div>
          <div class="og-desc">${esc(desc.substring(0, 120))}</div>
        </div>
      </div>`;
    document.getElementById('ogResult').style.display = 'block';
    showToast('🌐 Open Graph Tags generiert!');
  };

  window.copyOG = function() {
    navigator.clipboard.writeText(document.getElementById('ogOutput').textContent)
      .then(() => showToast('📋 OG Tags kopiert!'));
  };

  // ─── 4. EXPORT ───
  window.exportSEOReport = function() {
    const data = {
      tool: 'DkZ SEO Toolkit PRO v2.0',
      exported: new Date().toISOString(),
      url: document.getElementById('seoUrl').value,
      title: document.getElementById('seoTitle').value,
      description: document.getElementById('seoDesc').value,
      keyword: document.getElementById('seoKeyword').value,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `seo-report-${Date.now()}.json`;
    a.click();
    showToast('📤 Report exportiert!');
  };

  // ─── INIT ───
  document.addEventListener('DOMContentLoaded', initTabs);
})();
