/**
 * ═══════════════════════════════════════════════════════════════
 * DkZ™ Bookmark Auto-Organizer — Google Apps Script
 * ═══════════════════════════════════════════════════════════════
 * Automatische Sortierung von Chrome-Lesezeichen nach Kategorien.
 * Deployed als Web App — wird vom Control Panel angesteuert.
 * 
 * Setup:
 * 1. script.google.com → Neues Projekt
 * 2. Diesen Code einfügen
 * 3. Deploy → Web App → "Jeder" Zugriff
 * ═══════════════════════════════════════════════════════════════
 */

// ─── KONFIGURATION ──────────────────────────────────────────
const CONFIG = {
  SHEET_NAME: 'DkZ Bookmarks',
  CATEGORIES_SHEET: 'Kategorien',
  LOG_SHEET: 'Log',
  MAX_BOOKMARKS: 10000
};

// ─── KATEGORIEN (DkZ™ Ökosystem Struktur) ─────────────────
const CATEGORIES = {
  '🤖 KI & LLMs': {
    keywords: ['chatgpt', 'claude', 'gemini', 'openai', 'anthropic', 'groq', 'mistral', 'deepseek', 'perplexity', 'huggingface', 'ollama', 'ai', 'llm', 'gpt', 'copilot', 'machine learning', 'neural', 'transformer'],
    domains: ['chat.openai.com', 'chatgpt.com', 'claude.ai', 'gemini.google.com', 'aistudio.google.com', 'perplexity.ai', 'huggingface.co', 'groq.com', 'deepseek.com', 'poe.com', 'you.com', 'phind.com', 'together.ai', 'replicate.com', 'openrouter.ai'],
    color: '#fa1e4e'
  },
  '💻 Development': {
    keywords: ['github', 'gitlab', 'stackoverflow', 'code', 'programming', 'developer', 'npm', 'node', 'python', 'javascript', 'typescript', 'api', 'sdk', 'framework', 'library', 'vscode', 'antigravity', 'cursor', 'terminal'],
    domains: ['github.com', 'gitlab.com', 'stackoverflow.com', 'npmjs.com', 'pypi.org', 'dev.to', 'medium.com', 'hashnode.dev', 'replit.com', 'codepen.io', 'jsfiddle.net', 'codesandbox.io', 'vercel.com', 'netlify.com', 'render.com', 'railway.app', 'awesome-antigravity.com'],
    color: '#3b82f6'
  },
  '🔧 DevOps & Infra': {
    keywords: ['docker', 'kubernetes', 'server', 'cloud', 'aws', 'gcp', 'azure', 'hosting', 'deploy', 'ci/cd', 'cloudflare', 'nginx', 'ssh', 'vps', 'dns', 'ssl', 'domain'],
    domains: ['console.cloud.google.com', 'portal.azure.com', 'aws.amazon.com', 'cloudflare.com', 'hpanel.hostinger.com', 'hostinger.com', 'digitalocean.com', 'linode.com', 'vultr.com', 'heroku.com', 'fly.io'],
    color: '#00ff88'
  },
  '🔄 Automation & Workflows': {
    keywords: ['n8n', 'zapier', 'make', 'automation', 'workflow', 'ifttt', 'webhook', 'cron', 'pipeline', 'mcp', 'agent', 'bot'],
    domains: ['n8n.io', 'n8nworkflow.net', 'zapier.com', 'make.com', 'ifttt.com', 'pipedream.com', 'activepieces.com'],
    color: '#ffb800'
  },
  '📚 Research & Docs': {
    keywords: ['documentation', 'docs', 'wiki', 'tutorial', 'guide', 'learn', 'course', 'book', 'paper', 'arxiv', 'research', 'notebooklm', 'notebook'],
    domains: ['notebooklm.google.com', 'arxiv.org', 'scholar.google.com', 'docs.google.com', 'notion.so', 'obsidian.md', 'roamresearch.com', 'remnote.com'],
    color: '#8b5cf6'
  },
  '📊 Daten & Analytics': {
    keywords: ['data', 'analytics', 'dashboard', 'chart', 'graph', 'metric', 'duckdb', 'iceberg', 'sql', 'database', 'supabase', 'firebase'],
    domains: ['analytics.google.com', 'supabase.com', 'firebase.google.com', 'planetscale.com', 'neon.tech', 'turso.tech', 'motherduck.com'],
    color: '#06b6d4'
  },
  '🎨 Design & UI': {
    keywords: ['design', 'figma', 'canva', 'color', 'font', 'icon', 'image', 'css', 'tailwind', 'ui', 'ux', 'mockup', 'prototype', 'glassmorphism'],
    domains: ['figma.com', 'canva.com', 'dribbble.com', 'behance.net', 'coolors.co', 'fonts.google.com', 'iconify.design', 'heroicons.com', 'lucide.dev', 'unsplash.com', 'pexels.com'],
    color: '#ec4899'
  },
  '🎥 Video & Media': {
    keywords: ['youtube', 'video', 'stream', 'podcast', 'music', 'audio', 'tts', 'whisper', 'media'],
    domains: ['youtube.com', 'www.youtube.com', 'youtu.be', 'vimeo.com', 'twitch.tv', 'spotify.com', 'soundcloud.com'],
    color: '#ef4444'
  },
  '📝 Content & Blog': {
    keywords: ['blog', 'blogger', 'wordpress', 'post', 'article', 'cms', 'seo', 'content'],
    domains: ['blogger.com', 'www.blogger.com', 'wordpress.com', 'wordpress.org', 'medium.com', 'substack.com', 'ghost.org', 'blogspot.com'],
    color: '#f97316'
  },
  '📱 Social & Communication': {
    keywords: ['whatsapp', 'telegram', 'discord', 'slack', 'social', 'chat', 'message', 'email', 'mail'],
    domains: ['web.whatsapp.com', 'discord.com', 'slack.com', 'telegram.org', 'twitter.com', 'x.com', 'linkedin.com', 'reddit.com', 'mail.google.com', 'skool.com', 'www.skool.com'],
    color: '#22c55e'
  },
  '☁️ Google Services': {
    keywords: ['google drive', 'google docs', 'google sheets', 'gmail', 'google calendar'],
    domains: ['drive.google.com', 'docs.google.com', 'sheets.google.com', 'calendar.google.com', 'meet.google.com', 'sites.google.com', 'forms.google.com', 'slides.google.com'],
    color: '#4285f4'
  },
  '🎮 Gaming': {
    keywords: ['game', 'gaming', 'cs2', 'counter-strike', 'steam', 'esport', 'aim', 'bhop'],
    domains: ['store.steampowered.com', 'steampowered.com', 'epicgames.com', 'twitch.tv'],
    color: '#a855f7'
  },
  '🛒 Shopping & Tools': {
    keywords: ['shop', 'buy', 'price', 'tool', 'app', 'extension', 'chrome', 'download', 'gumroad', 'product'],
    domains: ['gumroad.com', 'chrome.google.com', 'play.google.com', 'producthunt.com', 'alternativeto.net', 'rarlab.com'],
    color: '#14b8a6'
  },
  '🏥 Gesundheit & Pflege': {
    keywords: ['health', 'care', 'pflege', 'gesundheit', 'betreuung', 'liebevoll', 'medical'],
    domains: ['blh.care', 'liebevoll.manus.space'],
    color: '#f472b6'
  },
  '🏠 DkZ™ Lokal': {
    keywords: [],
    domains: [],
    urlPatterns: ['file:///C:/DEVKiTZ/', 'file:///c:/devkitz/'],
    color: '#fa1e4e'
  },
  '📦 Unsortiert': {
    keywords: [],
    domains: [],
    color: '#6b7280'
  }
};

// ─── WEB APP ENTRY POINTS ───────────────────────────────────

/**
 * GET Handler — liefert die Web-UI oder API-Daten
 */
function doGet(e) {
  const action = e && e.parameter && e.parameter.action;
  
  if (action === 'api') {
    return handleApiGet(e);
  }
  
  // Standard: Web-UI ausliefern
  const html = HtmlService.createHtmlOutputFromFile('Panel')
    .setTitle('DkZ™ Bookmark Auto-Organizer')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
  return html;
}

/**
 * POST Handler — Bookmarks empfangen und verarbeiten
 */
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const action = data.action;
    
    switch (action) {
      case 'import':
        return jsonResponse(importBookmarks(data.bookmarks));
      case 'sort':
        return jsonResponse(sortAllBookmarks());
      case 'getAll':
        return jsonResponse(getAllBookmarks());
      case 'getCategories':
        return jsonResponse(getCategories());
      case 'updateCategory':
        return jsonResponse(updateBookmarkCategory(data.id, data.category));
      case 'addRule':
        return jsonResponse(addSortRule(data.rule));
      case 'deleteRule':
        return jsonResponse(deleteSortRule(data.ruleId));
      case 'getRules':
        return jsonResponse(getSortRules());
      case 'getStats':
        return jsonResponse(getStats());
      case 'exportForContext':
        return jsonResponse(exportForContext(data.categoryFilter, data.format));
      case 'removeDuplicates':
        return jsonResponse(removeDuplicates());
      case 'search':
        return jsonResponse(searchBookmarks(data.query));
      default:
        return jsonResponse({ error: 'Unknown action: ' + action });
    }
  } catch (err) {
    return jsonResponse({ error: err.toString() });
  }
}

// ─── API GET HANDLER ────────────────────────────────────────

function handleApiGet(e) {
  const endpoint = e.parameter.endpoint || 'stats';
  
  switch (endpoint) {
    case 'stats':
      return jsonResponse(getStats());
    case 'categories':
      return jsonResponse(getCategories());
    case 'all':
      return jsonResponse(getAllBookmarks());
    case 'export':
      const cat = e.parameter.category || '';
      const fmt = e.parameter.format || 'json';
      return jsonResponse(exportForContext(cat, fmt));
    default:
      return jsonResponse({ error: 'Unknown endpoint' });
  }
}

// ─── HELPER ─────────────────────────────────────────────────

function jsonResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

function getOrCreateSheet(name) {
  const ss = SpreadsheetApp.getActiveSpreadsheet() || SpreadsheetApp.create(CONFIG.SHEET_NAME);
  let sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
  }
  return sheet;
}

function ensureHeaders(sheet, headers) {
  const existing = sheet.getRange(1, 1, 1, sheet.getMaxColumns()).getValues()[0];
  if (existing[0] !== headers[0]) {
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
    sheet.setFrozenRows(1);
  }
}

// ─── KATEGORISIERUNG ────────────────────────────────────────

/**
 * Automatische Kategorie-Erkennung für eine URL
 */
function categorizeBookmark(name, url) {
  const nameLower = (name || '').toLowerCase();
  let domain = '';
  
  try {
    const urlObj = new URL(url);
    domain = urlObj.hostname.replace('www.', '');
  } catch (e) {
    // Lokale Dateien oder ungültige URLs
    if (url && (url.startsWith('file:///C:/DEVKiTZ') || url.startsWith('file:///c:/devkitz'))) {
      return '🏠 DkZ™ Lokal';
    }
    if (url && url.startsWith('chrome://')) {
      return '🛒 Shopping & Tools';
    }
  }
  
  // Durchsuche Kategorien
  for (const [category, config] of Object.entries(CATEGORIES)) {
    if (category === '📦 Unsortiert') continue;
    
    // URL-Pattern Check (für lokale Dateien)
    if (config.urlPatterns) {
      for (const pattern of config.urlPatterns) {
        if (url && url.toLowerCase().startsWith(pattern.toLowerCase())) return category;
      }
    }
    
    // Domain Check
    if (config.domains && config.domains.includes(domain)) return category;
    
    // Subdomain Check (z.B. docs.google.com → ☁️ Google Services)
    for (const d of (config.domains || [])) {
      if (domain.endsWith('.' + d) || domain === d) return category;
    }
    
    // Keyword Check im Namen
    for (const kw of (config.keywords || [])) {
      if (nameLower.includes(kw.toLowerCase())) return category;
    }
    
    // Keyword Check in URL
    for (const kw of (config.keywords || [])) {
      if (url && url.toLowerCase().includes(kw.toLowerCase())) return category;
    }
  }
  
  return '📦 Unsortiert';
}

// ─── IMPORT ─────────────────────────────────────────────────

/**
 * Bookmarks importieren (Array von {name, url, folder})
 */
function importBookmarks(bookmarks) {
  if (!bookmarks || !Array.isArray(bookmarks)) {
    return { error: 'Keine Bookmarks zum Importieren' };
  }
  
  const sheet = getOrCreateSheet(CONFIG.SHEET_NAME);
  const headers = ['ID', 'Name', 'URL', 'Domain', 'Kategorie', 'Quell-Ordner', 'Import-Datum', 'Als Quelle', 'Tags'];
  ensureHeaders(sheet, headers);
  
  // Bestehende URLs laden für Duplikat-Erkennung
  const existingData = sheet.getDataRange().getValues();
  const existingUrls = new Set();
  for (let i = 1; i < existingData.length; i++) {
    if (existingData[i][2]) existingUrls.add(existingData[i][2]);
  }
  
  let imported = 0;
  let skipped = 0;
  let duplicates = 0;
  const rows = [];
  const now = new Date().toISOString();
  
  bookmarks.forEach((bm, idx) => {
    if (!bm.url || bm.url === 'chrome://newtab/') {
      skipped++;
      return;
    }
    
    if (existingUrls.has(bm.url)) {
      duplicates++;
      return;
    }
    
    let domain = '';
    try { domain = new URL(bm.url).hostname; } catch(e) { domain = 'lokal'; }
    
    const category = categorizeBookmark(bm.name, bm.url);
    const id = 'BM-' + Date.now().toString(36) + '-' + idx.toString(36);
    
    rows.push([id, bm.name || '(ohne Name)', bm.url, domain, category, bm.folder || '', now, false, '']);
    existingUrls.add(bm.url);
    imported++;
  });
  
  if (rows.length > 0) {
    const lastRow = sheet.getLastRow();
    sheet.getRange(lastRow + 1, 1, rows.length, headers.length).setValues(rows);
  }
  
  logAction('Import', `${imported} importiert, ${duplicates} Duplikate übersprungen, ${skipped} ungültige übersprungen`);
  
  return {
    success: true,
    imported: imported,
    duplicates: duplicates,
    skipped: skipped,
    total: existingUrls.size
  };
}

// ─── SORTIERUNG ─────────────────────────────────────────────

/**
 * Alle Bookmarks neu sortieren
 */
function sortAllBookmarks() {
  const sheet = getOrCreateSheet(CONFIG.SHEET_NAME);
  const data = sheet.getDataRange().getValues();
  
  if (data.length <= 1) {
    return { error: 'Keine Bookmarks vorhanden' };
  }
  
  let updated = 0;
  const customRules = getCustomRules_();
  
  for (let i = 1; i < data.length; i++) {
    const name = data[i][1];
    const url = data[i][2];
    
    // Custom Rules zuerst
    let newCategory = applyCustomRules(name, url, customRules);
    
    // Standard-Kategorisierung wenn kein Custom Rule greift
    if (!newCategory) {
      newCategory = categorizeBookmark(name, url);
    }
    
    if (newCategory !== data[i][4]) {
      sheet.getRange(i + 1, 5).setValue(newCategory);
      updated++;
    }
  }
  
  logAction('Sort', `${updated} von ${data.length - 1} Bookmarks neu kategorisiert`);
  
  return {
    success: true,
    total: data.length - 1,
    updated: updated
  };
}

/**
 * Custom Sortier-Regeln laden
 */
function getCustomRules_() {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const rulesSheet = ss.getSheetByName('Regeln');
    if (!rulesSheet || rulesSheet.getLastRow() <= 1) return [];
    
    const data = rulesSheet.getDataRange().getValues();
    const rules = [];
    for (let i = 1; i < data.length; i++) {
      rules.push({
        id: data[i][0],
        type: data[i][1],     // 'domain' | 'keyword' | 'urlpattern'
        pattern: data[i][2],
        category: data[i][3],
        active: data[i][4] !== false && data[i][4] !== 'false'
      });
    }
    return rules;
  } catch (e) {
    return [];
  }
}

/**
 * Custom Rules anwenden
 */
function applyCustomRules(name, url, rules) {
  const nameLower = (name || '').toLowerCase();
  const urlLower = (url || '').toLowerCase();
  
  for (const rule of rules) {
    if (!rule.active) continue;
    const pattern = rule.pattern.toLowerCase();
    
    switch (rule.type) {
      case 'domain':
        try {
          const domain = new URL(url).hostname.replace('www.', '');
          if (domain === pattern || domain.endsWith('.' + pattern)) return rule.category;
        } catch(e) {}
        break;
      case 'keyword':
        if (nameLower.includes(pattern) || urlLower.includes(pattern)) return rule.category;
        break;
      case 'urlpattern':
        if (urlLower.includes(pattern)) return rule.category;
        break;
    }
  }
  return null;
}

// ─── CRUD OPERATIONS ────────────────────────────────────────

function getAllBookmarks() {
  const sheet = getOrCreateSheet(CONFIG.SHEET_NAME);
  const data = sheet.getDataRange().getValues();
  
  if (data.length <= 1) return { bookmarks: [], total: 0 };
  
  const bookmarks = [];
  for (let i = 1; i < data.length; i++) {
    bookmarks.push({
      id: data[i][0],
      name: data[i][1],
      url: data[i][2],
      domain: data[i][3],
      category: data[i][4],
      folder: data[i][5],
      importDate: data[i][6],
      isSource: data[i][7],
      tags: data[i][8]
    });
  }
  
  return { bookmarks: bookmarks, total: bookmarks.length };
}

function updateBookmarkCategory(id, category) {
  const sheet = getOrCreateSheet(CONFIG.SHEET_NAME);
  const data = sheet.getDataRange().getValues();
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === id) {
      sheet.getRange(i + 1, 5).setValue(category);
      return { success: true, id: id, category: category };
    }
  }
  return { error: 'Bookmark nicht gefunden: ' + id };
}

function searchBookmarks(query) {
  const all = getAllBookmarks();
  const q = (query || '').toLowerCase();
  
  const results = all.bookmarks.filter(bm => 
    bm.name.toLowerCase().includes(q) || 
    bm.url.toLowerCase().includes(q) ||
    bm.category.toLowerCase().includes(q) ||
    (bm.tags || '').toLowerCase().includes(q)
  );
  
  return { results: results, total: results.length, query: query };
}

// ─── DUPLIKATE ──────────────────────────────────────────────

function removeDuplicates() {
  const sheet = getOrCreateSheet(CONFIG.SHEET_NAME);
  const data = sheet.getDataRange().getValues();
  
  if (data.length <= 1) return { removed: 0 };
  
  const seen = new Set();
  const toDelete = [];
  
  for (let i = 1; i < data.length; i++) {
    const url = data[i][2];
    if (seen.has(url)) {
      toDelete.push(i + 1); // 1-indexed row
    } else {
      seen.add(url);
    }
  }
  
  // Von unten löschen damit Row-Indices nicht verschoben werden
  for (let i = toDelete.length - 1; i >= 0; i--) {
    sheet.deleteRow(toDelete[i]);
  }
  
  logAction('Deduplicate', `${toDelete.length} Duplikate entfernt`);
  
  return { success: true, removed: toDelete.length };
}

// ─── REGELN (Custom Sort Rules) ─────────────────────────────

function getSortRules() {
  return { rules: getCustomRules_() };
}

function addSortRule(rule) {
  const ss = SpreadsheetApp.getActiveSpreadsheet() || SpreadsheetApp.create(CONFIG.SHEET_NAME);
  let sheet = ss.getSheetByName('Regeln');
  if (!sheet) {
    sheet = ss.insertSheet('Regeln');
    sheet.getRange(1, 1, 1, 5).setValues([['ID', 'Typ', 'Pattern', 'Kategorie', 'Aktiv']]);
    sheet.getRange(1, 1, 1, 5).setFontWeight('bold');
    sheet.setFrozenRows(1);
  }
  
  const id = 'RULE-' + Date.now().toString(36);
  const lastRow = sheet.getLastRow();
  sheet.getRange(lastRow + 1, 1, 1, 5).setValues([[id, rule.type, rule.pattern, rule.category, true]]);
  
  logAction('AddRule', `${rule.type}: "${rule.pattern}" → ${rule.category}`);
  
  return { success: true, id: id };
}

function deleteSortRule(ruleId) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('Regeln');
  if (!sheet) return { error: 'Keine Regeln vorhanden' };
  
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === ruleId) {
      sheet.deleteRow(i + 1);
      return { success: true };
    }
  }
  return { error: 'Regel nicht gefunden' };
}

// ─── QUELLEN-EXPORT (für AI Chat, MCP, Research) ────────────

/**
 * Bookmarks als Quellen exportieren — für Context-Injection
 */
function exportForContext(categoryFilter, format) {
  const all = getAllBookmarks();
  let bookmarks = all.bookmarks;
  
  // Nach Kategorie filtern
  if (categoryFilter) {
    bookmarks = bookmarks.filter(bm => bm.category === categoryFilter);
  }
  
  // Nur als Quelle markierte
  const sources = bookmarks.filter(bm => bm.isSource === true || bm.isSource === 'true' || bm.isSource === 'TRUE');
  const exportData = sources.length > 0 ? sources : bookmarks;
  
  if (format === 'markdown') {
    let md = '# DkZ™ Lesezeichen-Quellen\n\n';
    const grouped = {};
    exportData.forEach(bm => {
      if (!grouped[bm.category]) grouped[bm.category] = [];
      grouped[bm.category].push(bm);
    });
    
    for (const [cat, bms] of Object.entries(grouped)) {
      md += `## ${cat}\n\n`;
      bms.forEach(bm => {
        md += `- [${bm.name}](${bm.url})${bm.tags ? ' — ' + bm.tags : ''}\n`;
      });
      md += '\n';
    }
    
    return { format: 'markdown', content: md, count: exportData.length };
  }
  
  // JSON Format (Standard)
  return {
    format: 'json',
    bookmarks: exportData,
    count: exportData.length,
    categories: [...new Set(exportData.map(b => b.category))]
  };
}

/**
 * Lesezeichen als Quelle markieren/demarkieren
 */
function toggleSource(id, isSource) {
  const sheet = getOrCreateSheet(CONFIG.SHEET_NAME);
  const data = sheet.getDataRange().getValues();
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === id) {
      sheet.getRange(i + 1, 8).setValue(isSource);
      return { success: true, id: id, isSource: isSource };
    }
  }
  return { error: 'Bookmark nicht gefunden' };
}

// ─── KATEGORIEN ─────────────────────────────────────────────

function getCategories() {
  const cats = Object.entries(CATEGORIES).map(([name, config]) => ({
    name: name,
    color: config.color,
    domainCount: (config.domains || []).length,
    keywordCount: (config.keywords || []).length
  }));
  return { categories: cats };
}

// ─── STATISTIKEN ────────────────────────────────────────────

function getStats() {
  const sheet = getOrCreateSheet(CONFIG.SHEET_NAME);
  const data = sheet.getDataRange().getValues();
  
  if (data.length <= 1) {
    return { total: 0, categories: {}, sources: 0, topDomains: [] };
  }
  
  const catCount = {};
  const domainCount = {};
  let sourceCount = 0;
  
  for (let i = 1; i < data.length; i++) {
    const cat = data[i][4] || '📦 Unsortiert';
    catCount[cat] = (catCount[cat] || 0) + 1;
    
    const domain = data[i][3] || 'unknown';
    domainCount[domain] = (domainCount[domain] || 0) + 1;
    
    if (data[i][7] === true || data[i][7] === 'true' || data[i][7] === 'TRUE') {
      sourceCount++;
    }
  }
  
  const topDomains = Object.entries(domainCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 15)
    .map(([domain, count]) => ({ domain, count }));
  
  return {
    total: data.length - 1,
    categories: catCount,
    sources: sourceCount,
    topDomains: topDomains,
    lastUpdate: new Date().toISOString()
  };
}

// ─── LOGGING ────────────────────────────────────────────────

function logAction(action, details) {
  try {
    const sheet = getOrCreateSheet(CONFIG.LOG_SHEET);
    const headers = ['Zeitstempel', 'Aktion', 'Details'];
    ensureHeaders(sheet, headers);
    
    const lastRow = sheet.getLastRow();
    sheet.getRange(lastRow + 1, 1, 1, 3).setValues([
      [new Date().toISOString(), action, details]
    ]);
    
    // Log auf 500 Einträge begrenzen
    if (lastRow > 500) {
      sheet.deleteRows(2, lastRow - 500);
    }
  } catch (e) {
    // Log-Fehler nicht propagieren
  }
}

// ─── AUTO-SORT TRIGGER ─────────────────────────────────────

/**
 * Zeitbasierten Trigger einrichten für Auto-Sortierung
 */
function setupAutoSort() {
  // Bestehende Trigger entfernen
  const triggers = ScriptApp.getProjectTriggers();
  triggers.forEach(trigger => {
    if (trigger.getHandlerFunction() === 'autoSortTrigger') {
      ScriptApp.deleteTrigger(trigger);
    }
  });
  
  // Neuen Trigger: Alle 6 Stunden
  ScriptApp.newTrigger('autoSortTrigger')
    .timeDriven()
    .everyHours(6)
    .create();
  
  logAction('Setup', 'Auto-Sort Trigger eingerichtet (alle 6h)');
  
  return { success: true, interval: '6h' };
}

/**
 * Auto-Sort Trigger Handler
 */
function autoSortTrigger() {
  const result = sortAllBookmarks();
  logAction('AutoSort', JSON.stringify(result));
}

// ─── SETUP / INITIALIZATION ────────────────────────────────

/**
 * Erstmalige Einrichtung — erstellt alle Sheets und Strukturen
 */
function setup() {
  const ss = SpreadsheetApp.getActiveSpreadsheet() || SpreadsheetApp.create(CONFIG.SHEET_NAME);
  
  // Hauptsheet
  const mainSheet = getOrCreateSheet(CONFIG.SHEET_NAME);
  ensureHeaders(mainSheet, ['ID', 'Name', 'URL', 'Domain', 'Kategorie', 'Quell-Ordner', 'Import-Datum', 'Als Quelle', 'Tags']);
  
  // Kategorien-Sheet
  const catSheet = getOrCreateSheet(CONFIG.CATEGORIES_SHEET);
  ensureHeaders(catSheet, ['Kategorie', 'Farbe', 'Domains', 'Keywords']);
  const catData = Object.entries(CATEGORIES).map(([name, config]) => [
    name, config.color, (config.domains || []).join(', '), (config.keywords || []).join(', ')
  ]);
  if (catSheet.getLastRow() <= 1) {
    catSheet.getRange(2, 1, catData.length, 4).setValues(catData);
  }
  
  // Regeln-Sheet
  const rulesSheet = getOrCreateSheet('Regeln');
  ensureHeaders(rulesSheet, ['ID', 'Typ', 'Pattern', 'Kategorie', 'Aktiv']);
  
  // Log-Sheet
  const logSheet = getOrCreateSheet(CONFIG.LOG_SHEET);
  ensureHeaders(logSheet, ['Zeitstempel', 'Aktion', 'Details']);
  
  logAction('Setup', 'Initiale Einrichtung abgeschlossen');
  
  return {
    success: true,
    spreadsheetId: ss.getId(),
    spreadsheetUrl: ss.getUrl(),
    sheets: [CONFIG.SHEET_NAME, CONFIG.CATEGORIES_SHEET, 'Regeln', CONFIG.LOG_SHEET]
  };
}

// ─── BRIDGE für google.script.run (Panel → Server) ─────────

/**
 * Zentrale Bridge-Funktion für Panel-Aufrufe via google.script.run
 * Das Panel ruft: google.script.run.handleApiCall(action, data)
 */
function handleApiCall(action, data) {
  data = data || {};
  
  switch (action) {
    case 'getStats':
      return getStats();
    case 'getAll':
      return getAllBookmarks();
    case 'getCategories':
      return getCategories();
    case 'sort':
      return sortAllBookmarks();
    case 'removeDuplicates':
      return removeDuplicates();
    case 'setupAutoSort':
      return setupAutoSort();
    case 'import':
      return importBookmarks(data.bookmarks);
    case 'getRules':
      return getSortRules();
    case 'addRule':
      return addSortRule(data.rule);
    case 'deleteRule':
      return deleteSortRule(data.ruleId);
    case 'exportForContext':
      return exportForContext(data.categoryFilter || '', data.format || 'json');
    case 'toggleSource':
      return toggleSource(data.id, data.isSource);
    case 'search':
      return searchBookmarks(data.query);
    case 'updateCategory':
      return updateBookmarkCategory(data.id, data.category);
    default:
      return { error: 'Unknown action: ' + action };
  }
}
