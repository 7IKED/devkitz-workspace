// ============================================================
// DEVKiTZ DocEngine — Main Application Controller
// Omnipotent HTML Scraper, Research Hub & Dynamic Wiki Builder
// ============================================================

// ── Global State ──────────────────────────────────────────
const APP = {
    scrapedData: JSON.parse(localStorage.getItem('docengine-data') || '[]'),
    isRunning: false,
    abortController: null,
    activeEngine: 'fetch',
    selectedCSEVariant: 'popup',
    stats: { pages: 0, images: 0, videos: 0, exports: 0 },
    proxyUrl: 'http://localhost:3847/proxy?url=',
    corsProxies: [
        'https://api.allorigins.win/raw?url=',
        'https://corsproxy.io/?',
    ],
    currentCorsProxy: 0,
};

// ── Initialization ────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initLanguage();
    initClock();
    initNavigation();
    initURLCounter();
    initKeyboardShortcuts();
    updateStats();
    log('info', 'DocEngine initialized. Ready to scrape.');
});

// ── Theme System ──────────────────────────────────────────
function initTheme() {
    const saved = localStorage.getItem('docengine-theme') || 'dark';
    document.documentElement.setAttribute('data-theme', saved);
    updateThemeUI(saved);
}

function handleThemeToggle() {
    const current = document.documentElement.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('docengine-theme', next);
    updateThemeUI(next);
    toast(`Theme: ${next === 'dark' ? '🌙 Dark' : '☀️ Light'}`, 'info');
}

function updateThemeUI(theme) {
    const icon = document.getElementById('themeIcon');
    const label = document.getElementById('themeLabel');
    if (icon) icon.textContent = theme === 'dark' ? '🌙' : '☀️';
    if (label) label.textContent = theme === 'dark' ? 'Dark' : 'Light';
}

// ── Language System ───────────────────────────────────────
function initLanguage() {
    const label = document.getElementById('langLabel');
    if (label) label.textContent = currentLang.toUpperCase();
    applyTranslations();
}

function handleLangToggle() {
    const lang = toggleLanguage();
    const label = document.getElementById('langLabel');
    if (label) label.textContent = lang.toUpperCase();
    toast(`Language: ${lang === 'en' ? '🇬🇧 English' : '🇩🇪 Deutsch'}`, 'info');
}

// ── Clock ─────────────────────────────────────────────────
function initClock() {
    const update = () => {
        const now = new Date();
        const el = document.getElementById('headerClock');
        if (el) el.textContent = now.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    };
    update();
    setInterval(update, 1000);
}

// ── Navigation / Panel Router ─────────────────────────────
function initNavigation() {
    document.querySelectorAll('.nav-item[data-panel]').forEach(item => {
        item.addEventListener('click', () => {
            switchPanel(item.getAttribute('data-panel'));
        });
    });
}

function switchPanel(panelId) {
    // Update nav
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    const navItem = document.getElementById(`nav-${panelId}`);
    if (navItem) navItem.classList.add('active');

    // Update panels
    document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
    const panel = document.getElementById(`panel-${panelId}`);
    if (panel) {
        panel.classList.remove('active');
        // Force reflow for animation
        void panel.offsetWidth;
        panel.classList.add('active');
    }

    // Update header
    const icons = {
        dashboard: '⚡', scraper: '🕸️', results: '📊', wiki: '📖',
        search: '🔍', exports: '📦', cse: '🔎', publisher: '🚀'
    };
    const keys = {
        dashboard: 'nav.dashboard', scraper: 'nav.scraper', results: 'nav.results',
        wiki: 'nav.wiki', search: 'nav.search_engine', exports: 'nav.exports',
        cse: 'nav.cse', publisher: 'nav.publisher'
    };
    const hIcon = document.getElementById('headerIcon');
    const hText = document.getElementById('headerText');
    if (hIcon) hIcon.textContent = icons[panelId] || '⚡';
    if (hText) hText.textContent = t(keys[panelId] || 'nav.dashboard');
}

// ── Keyboard Shortcuts ────────────────────────────────────
function initKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.key === 'k') {
            e.preventDefault();
            switchPanel('search');
            setTimeout(() => document.getElementById('searchInput')?.focus(), 100);
        }
        if (e.ctrlKey && e.key === 'Enter') {
            e.preventDefault();
            startScraping();
        }
        if (e.ctrlKey && e.key === 'e') {
            e.preventDefault();
            switchPanel('exports');
        }
        if (e.key === 'Escape') {
            closeModal();
        }
    });
}

// ── URL Counter ───────────────────────────────────────────
function initURLCounter() {
    const input = document.getElementById('urlInput');
    if (input) {
        input.addEventListener('input', () => {
            const lines = input.value.trim().split('\n').filter(l => l.trim().length > 0);
            const counter = document.getElementById('urlCount');
            if (counter) counter.textContent = lines.length;
        });
    }
}

// ── Engine Selector ───────────────────────────────────────
function selectEngine(engine, el) {
    APP.activeEngine = engine;
    document.querySelectorAll('#engineTabs .tab-item').forEach(t => t.classList.remove('active'));
    if (el) el.classList.add('active');

    const urlCard = document.getElementById('urlInputCard');
    const pasteCard = document.getElementById('pasteInputCard');
    if (engine === 'paste') {
        if (urlCard) urlCard.style.display = 'none';
        if (pasteCard) pasteCard.style.display = 'block';
    } else {
        if (urlCard) urlCard.style.display = 'block';
        if (pasteCard) pasteCard.style.display = 'none';
    }
}

// ══════════════════════════════════════════════════════════
// SCRAPER ENGINE
// ══════════════════════════════════════════════════════════

async function startScraping() {
    if (APP.isRunning) return;

    if (APP.activeEngine === 'paste') {
        return processPastedHTML();
    }

    const urlInput = document.getElementById('urlInput');
    const urls = urlInput.value.trim().split('\n').filter(l => {
        const trimmed = l.trim();
        return trimmed.length > 0 && (trimmed.startsWith('http://') || trimmed.startsWith('https://'));
    });

    if (urls.length === 0) {
        toast('Please enter at least one valid URL (starting with http:// or https://)', 'warning');
        return;
    }

    APP.isRunning = true;
    APP.abortController = new AbortController();
    showProgress(true);
    updateScrapeButtons(true);
    log('info', `Starting scrape of ${urls.length} URL(s) using ${APP.activeEngine} engine...`);

    let completed = 0;
    for (const url of urls) {
        if (!APP.isRunning) break;

        try {
            log('info', `Fetching: ${url}`);
            updateProgress(completed, urls.length, `Fetching: ${url}`);

            const html = await fetchHTML(url);
            if (html) {
                log('success', `Fetched ${url} (${(html.length / 1024).toFixed(1)} KB)`);
                const parsed = parseHTML(html, url);
                APP.scrapedData.push(parsed);
                saveData();
                log('success', `Parsed: ${parsed.title || 'Untitled'} — ${parsed.textContent.length} chars, ${parsed.images.length} images, ${parsed.videos.length} videos`);
            }
        } catch (err) {
            log('error', `Failed to fetch ${url}: ${err.message}`);
        }

        completed++;
        updateProgress(completed, urls.length, `Completed: ${completed}/${urls.length}`);
    }

    APP.isRunning = false;
    showProgress(false);
    updateScrapeButtons(false);
    updateStats();
    updateResultsPanel();
    updateResultCount();
    log('success', `Scraping complete. ${completed} pages processed. Total data: ${APP.scrapedData.length} pages.`);
    toast(`Scraping complete! ${completed} pages processed.`, 'success');
}

function stopScraping() {
    APP.isRunning = false;
    if (APP.abortController) APP.abortController.abort();
    showProgress(false);
    updateScrapeButtons(false);
    log('warn', 'Scraping stopped by user.');
    toast('Scraping stopped.', 'warning');
}

function clearScraper() {
    document.getElementById('urlInput').value = '';
    document.getElementById('urlCount').textContent = '0';
    if (document.getElementById('pasteInput')) document.getElementById('pasteInput').value = '';
    log('info', 'Scraper cleared.');
}

// ── Fetch HTML with Multi-Engine Fallback ──────────────────
async function fetchHTML(url) {
    if (APP.activeEngine === 'proxy') {
        return fetchViaProxy(url);
    }

    // Primary: CORS proxy
    for (let i = 0; i < APP.corsProxies.length; i++) {
        try {
            const proxyUrl = APP.corsProxies[i] + encodeURIComponent(url);
            const resp = await fetch(proxyUrl, {
                signal: APP.abortController?.signal,
                headers: { 'Accept': 'text/html' }
            });
            if (resp.ok) {
                return await resp.text();
            }
        } catch (e) {
            log('warn', `CORS proxy ${i + 1} failed: ${e.message}. Trying next...`);
        }
    }

    // Fallback: direct fetch (may fail due to CORS)
    try {
        const resp = await fetch(url, {
            signal: APP.abortController?.signal,
            mode: 'cors'
        });
        if (resp.ok) return await resp.text();
    } catch (e) {
        log('warn', `Direct fetch failed: ${e.message}`);
    }

    // Final fallback: local proxy
    log('info', 'Falling back to local Node.js proxy...');
    return fetchViaProxy(url);
}

async function fetchViaProxy(url) {
    try {
        const resp = await fetch(APP.proxyUrl + encodeURIComponent(url), {
            signal: APP.abortController?.signal
        });
        if (resp.ok) return await resp.text();
        throw new Error(`Proxy returned ${resp.status}`);
    } catch (e) {
        throw new Error(`Proxy unavailable: ${e.message}. Start with: node proxy-server.js`);
    }
}

// ── Process Pasted HTML ───────────────────────────────────
function processPastedHTML() {
    const html = document.getElementById('pasteInput')?.value;
    const sourceUrl = document.getElementById('pasteSourceUrl')?.value || 'pasted://local';

    if (!html || html.trim().length < 10) {
        toast('Please paste valid HTML content.', 'warning');
        return;
    }

    log('info', 'Processing pasted HTML...');
    const parsed = parseHTML(html, sourceUrl);
    APP.scrapedData.push(parsed);
    saveData();
    updateStats();
    updateResultsPanel();
    updateResultCount();
    log('success', `Parsed pasted HTML: ${parsed.title || 'Untitled'} — ${parsed.textContent.length} chars`);
    toast('Pasted HTML processed successfully!', 'success');
}

// ══════════════════════════════════════════════════════════
// DOM PARSER
// ══════════════════════════════════════════════════════════

function parseHTML(html, sourceUrl) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    let baseUrl;
    try {
        baseUrl = new URL(sourceUrl).origin;
    } catch (e) {
        baseUrl = 'about:blank';
        log('warn', `Invalid URL "${sourceUrl}", using fallback origin.`);
    }

    const result = {
        id: crypto.randomUUID(),
        url: sourceUrl,
        scrapedAt: new Date().toISOString(),
        title: '',
        metaDescription: '',
        headings: [],
        textContent: '',
        images: [],
        videos: [],
        links: [],
        tables: [],
        menuTree: null,
        rawHTML: html,
        tags: [],
    };

    // Title
    result.title = doc.querySelector('title')?.textContent?.trim() || '';

    // Meta description
    const metaDesc = doc.querySelector('meta[name="description"]');
    result.metaDescription = metaDesc?.getAttribute('content')?.trim() || '';

    // Headings
    doc.querySelectorAll('h1, h2, h3, h4, h5, h6').forEach(h => {
        result.headings.push({
            level: parseInt(h.tagName.charAt(1)),
            text: h.textContent.trim()
        });
    });

    // Text content
    const bodyClone = doc.body?.cloneNode(true);
    if (bodyClone) {
        bodyClone.querySelectorAll('script, style, noscript').forEach(el => el.remove());
        result.textContent = bodyClone.textContent.replace(/\s+/g, ' ').trim();
    }

    // Images
    if (document.getElementById('optImages')?.checked) {
        doc.querySelectorAll('img').forEach(img => {
            let src = img.getAttribute('src') || img.getAttribute('data-src') || '';
            if (src && !src.startsWith('data:')) {
                try {
                    src = new URL(src, sourceUrl).href;
                } catch (e) { /* invalid URL */ }
                result.images.push({
                    src,
                    alt: img.getAttribute('alt') || '',
                    width: img.getAttribute('width') || '',
                    height: img.getAttribute('height') || '',
                });
            }
        });
    }

    // YouTube videos
    if (document.getElementById('optYoutube')?.checked) {
        // iframes
        doc.querySelectorAll('iframe').forEach(iframe => {
            const src = iframe.getAttribute('src') || '';
            const ytMatch = src.match(/(?:youtube\.com\/embed\/|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
            if (ytMatch) {
                result.videos.push({
                    type: 'youtube',
                    videoId: ytMatch[1],
                    embedUrl: `https://www.youtube.com/embed/${ytMatch[1]}`,
                    thumbnailUrl: `https://img.youtube.com/vi/${ytMatch[1]}/maxresdefault.jpg`,
                });
            }
        });

        // YouTube links in anchors
        doc.querySelectorAll('a[href*="youtube.com/watch"], a[href*="youtu.be/"]').forEach(a => {
            const href = a.getAttribute('href') || '';
            let videoId = null;
            const longMatch = href.match(/[?&]v=([a-zA-Z0-9_-]{11})/);
            const shortMatch = href.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/);
            videoId = longMatch?.[1] || shortMatch?.[1];
            if (videoId && !result.videos.find(v => v.videoId === videoId)) {
                result.videos.push({
                    type: 'youtube',
                    videoId,
                    embedUrl: `https://www.youtube.com/embed/${videoId}`,
                    thumbnailUrl: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
                });
            }
        });
    }

    // Links
    doc.querySelectorAll('a[href]').forEach(a => {
        let href = a.getAttribute('href') || '';
        if (href.startsWith('#') || href.startsWith('javascript:') || href.startsWith('mailto:')) return;
        try {
            href = new URL(href, sourceUrl).href;
        } catch (e) { return; }
        result.links.push({
            href,
            text: a.textContent.trim().substring(0, 120),
            isInternal: href.startsWith(baseUrl),
        });
    });

    // Tables
    doc.querySelectorAll('table').forEach(table => {
        const rows = [];
        table.querySelectorAll('tr').forEach(tr => {
            const cells = [];
            tr.querySelectorAll('th, td').forEach(cell => {
                cells.push(cell.textContent.trim());
            });
            if (cells.length > 0) rows.push(cells);
        });
        if (rows.length > 0) result.tables.push(rows);
    });

    // Menu extraction
    if (document.getElementById('optMenu')?.checked) {
        result.menuTree = extractMenuTree(doc, baseUrl);
    }

    // Auto-generate tags
    result.tags = generateTags(result);

    return result;
}

// ── Menu Tree Extractor ───────────────────────────────────
function extractMenuTree(doc, baseUrl) {
    const tree = { name: 'root', children: [] };

    // Look for nav elements
    const navElements = doc.querySelectorAll('nav, [role="navigation"], .nav, .menu, .sidebar-nav, #nav, #menu');

    for (const nav of navElements) {
        const lists = nav.querySelectorAll('ul');
        for (const ul of lists) {
            parseMenuList(ul, tree, baseUrl);
        }
        if (lists.length === 0) {
            // Direct links in nav
            nav.querySelectorAll('a[href]').forEach(a => {
                const href = a.getAttribute('href');
                const text = a.textContent.trim();
                if (text && href && !href.startsWith('#') && !href.startsWith('javascript:')) {
                    tree.children.push({ name: text, href, children: [] });
                }
            });
        }
    }

    // Fallback: look for header links
    if (tree.children.length === 0) {
        const header = doc.querySelector('header, .header, #header');
        if (header) {
            header.querySelectorAll('a[href]').forEach(a => {
                const href = a.getAttribute('href');
                const text = a.textContent.trim();
                if (text && href && !href.startsWith('#') && !href.startsWith('javascript:')) {
                    tree.children.push({ name: text, href, children: [] });
                }
            });
        }
    }

    return tree;
}

function parseMenuList(ul, parent, baseUrl) {
    ul.querySelectorAll(':scope > li').forEach(li => {
        const a = li.querySelector(':scope > a');
        const text = a?.textContent?.trim() || li.firstChild?.textContent?.trim() || '';
        const href = a?.getAttribute('href') || '';
        if (!text) return;

        const node = { name: text, href, children: [] };
        const subUl = li.querySelector(':scope > ul');
        if (subUl) {
            parseMenuList(subUl, node, baseUrl);
        }
        parent.children.push(node);
    });
}

// ── Tag Generator ─────────────────────────────────────────
function generateTags(result) {
    const tags = new Set();
    try {
        const url = new URL(result.url);
        tags.add(url.hostname);
    } catch (e) {
        tags.add('local');
    }

    // Extract from headings
    result.headings.forEach(h => {
        h.text.split(/[\s,;|]+/).forEach(word => {
            if (word.length > 3) tags.add(word.toLowerCase());
        });
    });

    // Extract from title
    if (result.title) {
        result.title.split(/[\s\-|:]+/).forEach(word => {
            if (word.length > 3) tags.add(word.toLowerCase());
        });
    }

    if (result.images.length > 0) tags.add('images');
    if (result.videos.length > 0) tags.add('videos');
    if (result.tables.length > 0) tags.add('tables');

    return [...tags].slice(0, 20);
}

// ══════════════════════════════════════════════════════════
// UI Updates
// ══════════════════════════════════════════════════════════

function showProgress(show) {
    const card = document.getElementById('progressCard');
    if (card) card.style.display = show ? 'block' : 'none';
}

function updateProgress(current, total, label) {
    const pct = total > 0 ? Math.round((current / total) * 100) : 0;
    const fill = document.getElementById('progressFill');
    const lbl = document.getElementById('progressLabel');
    const pctEl = document.getElementById('progressPercent');
    if (fill) fill.style.width = `${pct}%`;
    if (lbl) lbl.textContent = label;
    if (pctEl) pctEl.textContent = `${pct}%`;
}

function updateScrapeButtons(running) {
    const start = document.getElementById('btnStartScrape');
    const stop = document.getElementById('btnStopScrape');
    if (start) start.style.display = running ? 'none' : 'inline-flex';
    if (stop) stop.style.display = running ? 'inline-flex' : 'none';
}

function updateStats() {
    let pages = APP.scrapedData.length;
    let images = 0, videos = 0;
    APP.scrapedData.forEach(d => {
        images += d.images?.length || 0;
        videos += d.videos?.length || 0;
    });
    APP.stats = { pages, images, videos, exports: APP.stats.exports };

    const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
    set('statPages', pages);
    set('statImages', images);
    set('statVideos', videos);
    set('statExports', APP.stats.exports);
}

function updateResultCount() {
    const badge = document.getElementById('resultCount');
    if (badge) badge.textContent = APP.scrapedData.length;
    const label = document.getElementById('resultsCountLabel');
    if (label) label.textContent = APP.scrapedData.length;
}

function updateResultsPanel() {
    const container = document.getElementById('resultsList');
    if (!container) return;

    if (APP.scrapedData.length === 0) {
        container.innerHTML = `<div class="empty-state"><div class="empty-icon">📊</div><p>No results yet. Run a scrape to see data here.</p></div>`;
        return;
    }

    container.innerHTML = APP.scrapedData.map((item, idx) => `
    <div class="result-item">
      <div class="result-status" style="background:rgba(0,230,118,0.1)">✅</div>
      <div class="result-info">
        <div class="result-title">${escapeHTML(item.title || 'Untitled')}</div>
        <div class="result-url">${escapeHTML(item.url)}</div>
        <div class="result-meta">
          <span>📝 ${item.textContent?.length || 0} chars</span>
          <span>🖼️ ${item.images?.length || 0} images</span>
          <span>▶️ ${item.videos?.length || 0} videos</span>
          <span>🔗 ${item.links?.length || 0} links</span>
          <span>📅 ${new Date(item.scrapedAt).toLocaleString('de-DE')}</span>
        </div>
      </div>
      <div class="result-actions">
        <button class="btn btn-sm" onclick="viewResultData(${idx})" title="View Data">👁️</button>
        <button class="btn btn-sm" onclick="copyResultJSON(${idx})" title="Copy JSON">📋</button>
        <button class="btn btn-sm btn-danger" onclick="deleteResult(${idx})" title="Delete">🗑️</button>
      </div>
    </div>
  `).join('');
}

// ── Result Actions ────────────────────────────────────────
function viewResultData(idx) {
    const item = APP.scrapedData[idx];
    if (!item) return;

    const card = document.getElementById('dataPreviewCard');
    const title = document.getElementById('previewTitle');
    const content = document.getElementById('dataPreviewContent');
    if (!card || !content) return;

    card.style.display = 'block';
    title.textContent = `📄 ${item.title || 'Untitled'}`;

    let html = '';

    // Headings
    if (item.headings.length) {
        html += `<div class="section-title">📑 Headings (${item.headings.length})</div>`;
        html += item.headings.map(h => `<div style="padding-left:${(h.level - 1) * 16}px;font-size:${18 - h.level}px;margin:4px 0;color:var(--text-secondary)"><span style="color:var(--accent);font-weight:600">H${h.level}</span> ${escapeHTML(h.text)}</div>`).join('');
    }

    // Text preview
    html += `<div class="section-title">📝 Content Preview</div>`;
    html += `<div class="code-block"><div class="code-block-header"><span>text/plain</span><button class="code-copy-btn" onclick="copyToClipboard(this, ${JSON.stringify(JSON.stringify(item.textContent.substring(0, 2000)))})">📋 Copy</button></div><div class="code-block-body">${escapeHTML(item.textContent.substring(0, 2000))}${item.textContent.length > 2000 ? '\n\n... (truncated)' : ''}</div></div>`;

    // Images
    if (item.images.length) {
        html += `<div class="section-title">🖼️ Images (${item.images.length})</div>`;
        html += `<div class="image-grid">${item.images.slice(0, 12).map(img => `<div class="image-grid-item"><img src="${escapeHTML(img.src)}" alt="${escapeHTML(img.alt)}" loading="lazy" onerror="this.parentElement.style.display='none'"></div>`).join('')}</div>`;
    }

    // Videos
    if (item.videos.length) {
        html += `<div class="section-title">▶️ YouTube Videos (${item.videos.length})</div>`;
        html += item.videos.slice(0, 4).map(v => `<div class="yt-embed-container"><iframe src="${v.embedUrl}" allowfullscreen></iframe></div>`).join('');
    }

    // Tables
    if (item.tables.length) {
        html += `<div class="section-title">📊 Tables (${item.tables.length})</div>`;
        item.tables.forEach((table, ti) => {
            html += `<table class="data-table"><thead><tr>${table[0].map(h => `<th>${escapeHTML(h)}</th>`).join('')}</tr></thead><tbody>${table.slice(1).map(row => `<tr>${row.map(c => `<td>${escapeHTML(c)}</td>`).join('')}</tr>`).join('')}</tbody></table>`;
        });
    }

    // Tags
    if (item.tags.length) {
        html += `<div class="section-title">🏷️ Tags</div>`;
        html += `<div style="display:flex;gap:6px;flex-wrap:wrap">${item.tags.map(tag => `<span class="badge badge-purple">${escapeHTML(tag)}</span>`).join('')}</div>`;
    }

    content.innerHTML = html;
    card.scrollIntoView({ behavior: 'smooth' });
}

function copyResultJSON(idx) {
    const item = APP.scrapedData[idx];
    if (!item) return;
    const json = JSON.stringify(item, null, 2);
    navigator.clipboard.writeText(json).then(() => toast('JSON copied to clipboard!', 'success'));
}

function deleteResult(idx) {
    if (!confirm('Delete this result?')) return;
    APP.scrapedData.splice(idx, 1);
    saveData();
    updateStats();
    updateResultsPanel();
    updateResultCount();
    toast('Result deleted.', 'info');
}

// ── Filter Results ────────────────────────────────────────
function filterResults(type, el) {
    document.querySelectorAll('#panel-results .tab-item').forEach(t => t.classList.remove('active'));
    if (el) el.classList.add('active');

    const container = document.getElementById('resultsList');
    if (!container) return;

    let filtered = APP.scrapedData;
    if (type === 'text') {
        filtered = APP.scrapedData.filter(d => d.textContent && d.textContent.length > 0);
    } else if (type === 'images') {
        filtered = APP.scrapedData.filter(d => d.images && d.images.length > 0);
    } else if (type === 'videos') {
        filtered = APP.scrapedData.filter(d => d.videos && d.videos.length > 0);
    }

    if (filtered.length === 0) {
        container.innerHTML = `<div class="empty-state"><div class="empty-icon">📊</div><p>No ${type === 'all' ? '' : type + ' '}results found.</p></div>`;
        return;
    }

    container.innerHTML = filtered.map((item) => {
        const idx = APP.scrapedData.indexOf(item);
        return `
    <div class="result-item">
      <div class="result-status" style="background:rgba(0,230,118,0.1)">✅</div>
      <div class="result-info">
        <div class="result-title">${escapeHTML(item.title || 'Untitled')}</div>
        <div class="result-url">${escapeHTML(item.url)}</div>
        <div class="result-meta">
          <span>📝 ${item.textContent?.length || 0} chars</span>
          <span>🖼️ ${item.images?.length || 0} images</span>
          <span>▶️ ${item.videos?.length || 0} videos</span>
          <span>🔗 ${item.links?.length || 0} links</span>
          <span>📅 ${new Date(item.scrapedAt).toLocaleString('de-DE')}</span>
        </div>
      </div>
      <div class="result-actions">
        <button class="btn btn-sm" onclick="viewResultData(${idx})" title="View Data">👁️</button>
        <button class="btn btn-sm" onclick="copyResultJSON(${idx})" title="Copy JSON">📋</button>
        <button class="btn btn-sm btn-danger" onclick="deleteResult(${idx})" title="Delete">🗑️</button>
      </div>
    </div>
  `;
    }).join('');
}

// ── Folder Tree ───────────────────────────────────────────
function viewFolderTree() {
    const trees = APP.scrapedData.filter(d => d.menuTree && d.menuTree.children.length > 0);
    if (trees.length === 0) {
        openModal('Folder Tree', '<div class="empty-state"><div class="empty-icon">🌳</div><p>No menu trees extracted. Enable "Auto-detect navigation menus" and scrape a site.</p></div>');
        return;
    }

    let html = '<div class="tree-view">';
    trees.forEach(item => {
        html += `<div style="margin-bottom:16px"><strong style="color:var(--accent)">${escapeHTML(new URL(item.url).hostname)}</strong></div>`;
        html += renderTree(item.menuTree);
    });
    html += '</div>';

    openModal('🌳 Folder Tree from Site Navigation', html);
}

function renderTree(node) {
    if (!node.children || node.children.length === 0) {
        return `<div class="tree-node"><span class="tree-icon tree-file">📄</span>${escapeHTML(node.name)}</div>`;
    }
    let html = `<div class="tree-node"><span class="tree-icon tree-folder">📁</span><strong>${escapeHTML(node.name)}</strong></div>`;
    html += '<div style="padding-left:16px">';
    node.children.forEach(child => { html += renderTree(child); });
    html += '</div>';
    return html;
}

// ══════════════════════════════════════════════════════════
// SEARCH ENGINE (In-Memory, DuckDB-ready)
// ══════════════════════════════════════════════════════════

function handleSearch(query) {
    const suggestionsEl = document.getElementById('searchSuggestions');
    const resultsEl = document.getElementById('searchResults');
    const countEl = document.getElementById('searchResultCount');
    const titleEl = document.getElementById('searchResultsTitle');

    if (!query || query.trim().length < 2) {
        if (suggestionsEl) suggestionsEl.classList.remove('active');
        if (resultsEl) resultsEl.innerHTML = `<div class="empty-state"><div class="empty-icon">🔍</div><p>Start typing to search across all scraped content.</p></div>`;
        if (countEl) countEl.style.display = 'none';
        return;
    }

    const q = query.toLowerCase();
    const results = APP.scrapedData.filter(item => {
        return (item.title?.toLowerCase().includes(q)) ||
            (item.textContent?.toLowerCase().includes(q)) ||
            (item.url?.toLowerCase().includes(q)) ||
            (item.tags?.some(tag => tag.includes(q)));
    });

    // Suggestions (safe DOM construction — no inline onclick XSS)
    if (suggestionsEl) {
        const allTags = new Set();
        APP.scrapedData.forEach(d => d.tags?.forEach(tag => allTags.add(tag)));
        const matchingTags = [...allTags].filter(tag => tag.includes(q)).slice(0, 5);

        if (matchingTags.length > 0) {
            suggestionsEl.innerHTML = '';
            matchingTags.forEach(tag => {
                const div = document.createElement('div');
                div.className = 'search-suggestion-item';
                const badge = document.createElement('span');
                badge.className = 'suggestion-tag';
                badge.textContent = 'TAG';
                div.appendChild(badge);
                div.appendChild(document.createTextNode(tag));
                div.addEventListener('click', () => {
                    document.getElementById('searchInput').value = tag;
                    handleSearch(tag);
                });
                suggestionsEl.appendChild(div);
            });
            suggestionsEl.classList.add('active');
        } else {
            suggestionsEl.classList.remove('active');
        }
    }

    // Results
    if (titleEl) titleEl.innerHTML = `${t('search.results_for')} "<strong>${escapeHTML(query)}</strong>"`;
    if (countEl) { countEl.textContent = results.length; countEl.style.display = 'inline-flex'; }

    if (results.length === 0) {
        resultsEl.innerHTML = `<div class="empty-state"><div class="empty-icon">🔍</div><p>${t('search.no_results')}</p></div>`;
        return;
    }

    resultsEl.innerHTML = results.map((item, idx) => {
        // Find matching snippet
        const pos = item.textContent.toLowerCase().indexOf(q);
        const snippet = pos >= 0
            ? '...' + item.textContent.substring(Math.max(0, pos - 60), pos + 100) + '...'
            : item.textContent.substring(0, 150) + '...';

        return `<div class="result-item">
      <div class="result-status" style="background:rgba(68,138,255,0.1)">📄</div>
      <div class="result-info">
        <div class="result-title">${escapeHTML(item.title || 'Untitled')}</div>
        <div class="result-url">${escapeHTML(item.url)}</div>
        <div style="margin-top:6px;font-size:12px;color:var(--text-secondary);line-height:1.5">${highlightSearch(snippet, query)}</div>
        <div style="margin-top:6px;display:flex;gap:4px;flex-wrap:wrap">${item.tags?.slice(0, 6).map(tag => `<span class="badge badge-purple">${escapeHTML(tag)}</span>`).join('') || ''}</div>
      </div>
    </div>`;
    }).join('');
}

function highlightSearch(text, query) {
    const escaped = escapeHTML(text);
    const regex = new RegExp(`(${escapeRegex(query)})`, 'gi');
    return escaped.replace(regex, '<mark style="background:rgba(250,30,78,0.3);color:var(--text-primary);padding:1px 3px;border-radius:2px">$1</mark>');
}

// ══════════════════════════════════════════════════════════
// EXPORT PIPELINES
// ══════════════════════════════════════════════════════════

function exportJSON() {
    if (APP.scrapedData.length === 0) { toast('No data to export.', 'warning'); return; }
    const data = JSON.stringify(APP.scrapedData, null, 2);
    downloadFile('docengine-export.json', data, 'application/json');
    APP.stats.exports++;
    updateStats();
    toast('JSON exported!', 'success');
    log('success', 'JSON export completed.');
}

function exportCSV() {
    if (APP.scrapedData.length === 0) { toast('No data to export.', 'warning'); return; }

    const headers = ['URL', 'Title', 'Description', 'Text Length', 'Images', 'Videos', 'Links', 'Tags', 'Scraped At'];
    const rows = APP.scrapedData.map(d => [
        d.url,
        d.title,
        d.metaDescription,
        d.textContent?.length || 0,
        d.images?.length || 0,
        d.videos?.length || 0,
        d.links?.length || 0,
        d.tags?.join('; ') || '',
        d.scrapedAt
    ]);

    const csv = [headers, ...rows].map(row =>
        row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')
    ).join('\n');

    downloadFile('docengine-export.csv', csv, 'text/csv');
    APP.stats.exports++;
    updateStats();
    toast('CSV exported!', 'success');
    log('success', 'CSV export completed.');
}

function exportMarkdown() {
    if (APP.scrapedData.length === 0) { toast('No data to export.', 'warning'); return; }

    // Generate a combined markdown or individual files in ZIP
    let md = `# DocEngine Export\n\n_Generated: ${new Date().toLocaleString('de-DE')}_\n\n---\n\n`;

    APP.scrapedData.forEach((item, idx) => {
        md += `## ${idx + 1}. ${item.title || 'Untitled'}\n\n`;
        md += `- **URL**: [${item.url}](${item.url})\n`;
        md += `- **Scraped**: ${item.scrapedAt}\n`;
        md += `- **Description**: ${item.metaDescription || 'N/A'}\n\n`;

        // Headings
        if (item.headings.length) {
            md += `### Headings\n\n`;
            item.headings.forEach(h => {
                md += `${'  '.repeat(h.level - 1)}- **H${h.level}**: ${h.text}\n`;
            });
            md += '\n';
        }

        // Content preview
        md += `### Content\n\n${item.textContent.substring(0, 1000)}${item.textContent.length > 1000 ? '\n\n*... (truncated)*' : ''}\n\n`;

        // Images
        if (item.images.length) {
            md += `### Images (${item.images.length})\n\n`;
            item.images.slice(0, 10).forEach(img => {
                md += `- ![${img.alt || 'image'}](${img.src})\n`;
            });
            md += '\n';
        }

        // Videos
        if (item.videos.length) {
            md += `### Videos (${item.videos.length})\n\n`;
            item.videos.forEach(v => {
                md += `- [YouTube: ${v.videoId}](https://www.youtube.com/watch?v=${v.videoId})\n`;
            });
            md += '\n';
        }

        // Tags
        if (item.tags.length) {
            md += `### Tags\n\n${item.tags.map(t => '`' + t + '`').join(' ')}\n\n`;
        }

        md += `---\n\n`;
    });

    downloadFile('docengine-export.md', md, 'text/markdown');
    APP.stats.exports++;
    updateStats();
    toast('Markdown exported!', 'success');
    log('success', 'Markdown export completed.');
}

function exportZIP() {
    if (APP.scrapedData.length === 0) { toast('No data to export.', 'warning'); return; }

    // Since we can't use JSZip without CDN, we'll create a combined download
    toast('ZIP export: generating combined JSON + CSV bundle...', 'info');

    // Export both JSON and CSV
    const jsonData = JSON.stringify(APP.scrapedData, null, 2);
    downloadFile('docengine-bundle.json', jsonData, 'application/json');

    setTimeout(() => {
        exportCSV();
        toast('Bundle exported (JSON + CSV). For ZIP packaging, install JSZip.', 'success');
    }, 500);

    APP.stats.exports++;
    updateStats();
    log('success', 'ZIP bundle export completed (JSON + CSV).');
}

function exportSheets() {
    toast('Google Sheets sync requires API key. Configure in Publisher panel.', 'warning');
}

function exportINI() {
    if (APP.scrapedData.length === 0) { toast('No data to export.', 'warning'); return; }

    let ini = `; DocEngine — Auto-generated folder structure\n`;
    ini += `; Usage (PowerShell): Get-Content dirs.ini | Where-Object { $_ -notmatch '^\\s*(;|#|\\[)' -and $_.Trim() } | ForEach-Object { $dir = ($_ -split '=')[0].Trim(); if ($dir) { New-Item -ItemType Directory -Force -Path $dir } }\n\n`;
    ini += `[directories]\n`;
    ini += `Archive/Pic = Image archive\n`;
    ini += `Archive/Data = Export data\n`;
    ini += `Archive/Wiki = Wiki pages\n\n`;

    APP.scrapedData.forEach(item => {
        try {
            const host = new URL(item.url).hostname.replace(/\./g, '_');
            const path = new URL(item.url).pathname.replace(/\//g, '/').replace(/^\//, '');
            ini += `Archive/Wiki/${host} = Pages from ${new URL(item.url).hostname}\n`;
            if (item.images.length) {
                ini += `Archive/Pic/${host} = Images from ${new URL(item.url).hostname}\n`;
            }
        } catch (e) { /* skip invalid URLs */ }
    });

    downloadFile('docengine-dirs.ini', ini, 'text/plain');
    APP.stats.exports++;
    updateStats();
    toast('Folder .ini exported!', 'success');
    log('success', '.ini directory structure exported.');
}

// ── Table Action Buttons ──────────────────────────────────
function saveToSheets() { exportSheets(); }
function downloadResultZip() { exportZIP(); }
function copyAsMarkdown() {
    if (APP.scrapedData.length === 0) { toast('No data to copy.', 'warning'); return; }
    // Generate simplified markdown for clipboard
    let md = APP.scrapedData.map(item =>
        `## ${item.title || 'Untitled'}\n\n**URL**: ${item.url}\n\n${item.textContent.substring(0, 500)}...\n`
    ).join('\n---\n\n');
    navigator.clipboard.writeText(md).then(() => toast('Markdown copied to clipboard!', 'success'));
}

// ══════════════════════════════════════════════════════════
// CSE MANAGER
// ══════════════════════════════════════════════════════════

function saveCSEConfig() {
    const apiKey = document.getElementById('cseApiKey')?.value;
    const cxId = document.getElementById('cseCxId')?.value;
    if (!apiKey || !cxId) {
        toast('Please enter both API Key and CX ID.', 'warning');
        return;
    }
    localStorage.setItem('docengine-cse-key', apiKey);
    localStorage.setItem('docengine-cse-cx', cxId);
    toast('CSE configuration saved!', 'success');
}

function selectCSEVariant(variant, el) {
    APP.selectedCSEVariant = variant;
    document.querySelectorAll('.cse-variant').forEach(v => v.classList.remove('selected'));
    if (el) el.classList.add('selected');
}

// ══════════════════════════════════════════════════════════
// PUBLISHER STUBS
// ══════════════════════════════════════════════════════════

function connectBlogger() {
    const token = document.getElementById('bloggerToken')?.value;
    if (!token) { toast('Please enter a Blogger API token.', 'warning'); return; }
    localStorage.setItem('docengine-blogger-token', token);
    toast('Blogger token saved. Blog listing requires OAuth flow.', 'info');
}

function connectGithub() {
    const token = document.getElementById('githubPubToken')?.value;
    const repo = document.getElementById('githubPubRepo')?.value;
    if (!token || !repo) { toast('Please enter both token and repository.', 'warning'); return; }
    localStorage.setItem('docengine-github-token', token);
    localStorage.setItem('docengine-github-repo', repo);
    toast('GitHub configuration saved!', 'success');
}

function connectNotion() {
    const token = document.getElementById('notionToken')?.value;
    if (!token) { toast('Please enter a Notion integration token.', 'warning'); return; }
    localStorage.setItem('docengine-notion-token', token);
    toast('Notion token saved!', 'success');
}

function connectDrive() {
    const folderId = document.getElementById('drivePubFolderId')?.value;
    if (!folderId) { toast('Please enter a Drive folder ID.', 'warning'); return; }
    localStorage.setItem('docengine-drive-folder', folderId);
    toast('Google Drive folder ID saved!', 'success');
}

function generateSSHCommand() {
    const host = document.getElementById('sshPubHost')?.value || 'server.example.com';
    const port = document.getElementById('sshPubPort')?.value || '22';
    const user = document.getElementById('sshPubUser')?.value || 'root';
    const path = document.getElementById('sshPubPath')?.value || '/var/www/html/';

    const cmd = `scp -P ${port} -r ./Archive/* ${user}@${host}:${path}`;
    navigator.clipboard.writeText(cmd).then(() => {
        toast(`SCP command copied: ${cmd}`, 'success');
    });
}

function generateRsyncCommand() {
    const host = document.getElementById('sshPubHost')?.value || 'server.example.com';
    const port = document.getElementById('sshPubPort')?.value || '22';
    const user = document.getElementById('sshPubUser')?.value || 'root';
    const path = document.getElementById('sshPubPath')?.value || '/var/www/html/';

    const cmd = `rsync -avz -e "ssh -p ${port}" ./Archive/ ${user}@${host}:${path}`;
    navigator.clipboard.writeText(cmd).then(() => {
        toast(`rsync command copied: ${cmd}`, 'success');
    });
}

// ══════════════════════════════════════════════════════════
// UTILITY FUNCTIONS
// ══════════════════════════════════════════════════════════

// ── Toast Notifications ───────────────────────────────────
function toast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const icons = { success: '✅', error: '❌', warning: '⚠️', info: 'ℹ️' };
    const el = document.createElement('div');
    el.className = `toast toast-${type}`;
    el.innerHTML = `<span>${icons[type] || 'ℹ️'}</span><span>${escapeHTML(message)}</span>`;
    container.appendChild(el);

    setTimeout(() => {
        el.style.animation = 'toastOut 0.3s forwards';
        setTimeout(() => el.remove(), 300);
    }, 4000);
}

// ── Modal ─────────────────────────────────────────────────
function openModal(title, bodyHTML, footerHTML) {
    const overlay = document.getElementById('modalOverlay');
    const titleEl = document.getElementById('modalTitle');
    const bodyEl = document.getElementById('modalBody');
    const footerEl = document.getElementById('modalFooter');

    if (titleEl) titleEl.textContent = title;
    if (bodyEl) bodyEl.innerHTML = bodyHTML || '';
    if (footerEl) footerEl.innerHTML = footerHTML || '';
    if (overlay) overlay.classList.add('active');
}

function closeModal() {
    const overlay = document.getElementById('modalOverlay');
    if (overlay) overlay.classList.remove('active');
}

// ── Logging ───────────────────────────────────────────────
function log(type, message) {
    const logEl = document.getElementById('logConsole');
    if (!logEl) return;

    const now = new Date().toLocaleTimeString('de-DE');
    const classes = { info: 'log-msg-info', success: 'log-msg-success', error: 'log-msg-error', warn: 'log-msg-warn' };

    const line = document.createElement('div');
    line.className = 'log-line';
    line.innerHTML = `<span class="log-time">${now}</span><span class="${classes[type] || 'log-msg-info'}">${escapeHTML(message)}</span>`;
    logEl.appendChild(line);
    logEl.scrollTop = logEl.scrollHeight;
}

function clearLog() {
    const logEl = document.getElementById('logConsole');
    if (logEl) logEl.innerHTML = '';
    log('info', 'Log cleared.');
}

// ── Token Visibility ──────────────────────────────────────
function toggleTokenVisibility(inputId) {
    const input = document.getElementById(inputId);
    if (!input) return;
    input.type = input.type === 'password' ? 'text' : 'password';
}

// ── Download Helper ───────────────────────────────────────
function downloadFile(filename, content, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// ── Clipboard ─────────────────────────────────────────────
function copyToClipboard(btn, text) {
    navigator.clipboard.writeText(text).then(() => {
        if (btn) {
            const orig = btn.textContent;
            btn.textContent = '✅ Copied!';
            btn.classList.add('copied');
            setTimeout(() => {
                btn.textContent = orig;
                btn.classList.remove('copied');
            }, 2000);
        }
        toast(t('common.copied'), 'success');
    });
}

// ── Data Persistence ──────────────────────────────────────
function saveData() {
    try {
        // Save WITHOUT rawHTML to conserve storage
        const trimmed = APP.scrapedData.map(d => {
            const { rawHTML, ...rest } = d;
            return rest;
        });
        localStorage.setItem('docengine-data', JSON.stringify(trimmed));
    } catch (e) {
        console.warn('Storage full, clearing old data:', e);
        toast('⚠️ Speicher voll! Alte Daten werden gekürzt.', 'warning');
        // If storage is full, keep last 20 items
        APP.scrapedData = APP.scrapedData.slice(-20);
        try {
            const trimmed = APP.scrapedData.map(d => {
                const { rawHTML, ...rest } = d;
                return rest;
            });
            localStorage.setItem('docengine-data', JSON.stringify(trimmed));
        } catch (e2) {
            console.error('Cannot save data:', e2);
            toast('❌ Daten konnten nicht gespeichert werden!', 'error');
        }
    }
}

// ── Escape Helpers ────────────────────────────────────────
function escapeHTML(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function escapeRegex(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// ── Modal Click Outside ───────────────────────────────────
document.addEventListener('click', (e) => {
    if (e.target.id === 'modalOverlay') closeModal();

    // Close search suggestions on click outside
    const suggestions = document.getElementById('searchSuggestions');
    const searchInput = document.getElementById('searchInput');
    if (suggestions && !suggestions.contains(e.target) && e.target !== searchInput) {
        suggestions.classList.remove('active');
    }
});
