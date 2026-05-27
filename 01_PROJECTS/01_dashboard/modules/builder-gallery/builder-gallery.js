/* ═══════════════════════════════════════════════════════════════
   DkZ™ Builder Gallery — Engine v2.0
   Unified Asset Hub · 515 Dateien · 16 Kategorien · Werkzeuge
   ═══════════════════════════════════════════════════════════════ */

(function() {
  'use strict';

  // ─── CONFIG ───
  const CATEGORIES = {
    all:        { icon: '🎨', label: 'Alle Assets',       count: 0 },
    flyer:      { icon: '🖼️', label: 'Flyer (4K)',        count: 0 },
    scene:      { icon: '🎬', label: 'Szenen (8K)',       count: 0 },
    icon:       { icon: '⭐', label: 'Icons & Badges',    count: 0 },
    banner:     { icon: '🏷️', label: 'Banner & Hero',     count: 0 },
    background: { icon: '🌌', label: 'Backgrounds',       count: 0 },
    emote:      { icon: '😎', label: 'Emotes',            count: 0 },
    streaming:  { icon: '📺', label: 'Streaming',         count: 0 },
    panel:      { icon: '📐', label: 'Panels',            count: 0 },
    builder:    { icon: '🛠️', label: 'Builder',           count: 0 },
    mask:       { icon: '🎭', label: 'Masken',            count: 0 },
    hamburger:  { icon: '🍔', label: 'Hamburger Menüs',   count: 0 },
    element:    { icon: '🧩', label: 'Elements',          count: 0 },
    logo:       { icon: '💎', label: 'Logos',             count: 0 },
    asset:      { icon: '📦', label: 'Assets',            count: 0 },
    template:   { icon: '📄', label: 'Templates',         count: 0 },
    mockup:     { icon: '🖥️', label: 'Mockups',           count: 0 }
  };

  const FORMAT_FILTERS = ['all', 'portrait', 'landscape', 'square'];

  let allAssets = [];
  let filteredAssets = [];
  let currentTab = 'all';
  let currentFormat = 'all';
  let currentView = 'grid';
  let searchQuery = '';
  let lightboxIndex = -1;

  // ─── LOAD REAL ASSETS FROM asset-data.js ───
  function buildAssetCatalog() {
    if (typeof REAL_ASSETS === 'undefined') {
      console.error('[BuilderGallery] REAL_ASSETS not loaded! Include asset-data.js before builder-gallery.js');
      return [];
    }

    return REAL_ASSETS.map((item, i) => {
      // Determine format from filename
      let format = 'landscape';
      if (item.f.includes('portrait') || item.s === 'footer' || item.s === 'pricing') format = 'portrait';
      else if (item.f.includes('square') || item.s === 'nav' || item.s === 'social' || item.c === 'emote' || item.c === 'icon') format = 'square';

      // Build readable name
      let displayName = item.n
        .replace(/_/g, ' ')
        .replace(/\b\w/g, c => c.toUpperCase())
        .replace(/\d{13,}/, '') // Remove timestamps
        .trim();

      // Build tags
      const tags = [item.c];
      if (item.s) tags.push(item.s);
      if (item.f.includes('dark')) tags.push('dunkel');
      if (item.f.includes('light')) tags.push('hell');

      return {
        id: `${item.c}-${String(i + 1).padStart(3, '0')}`,
        name: displayName,
        file: item.f,
        path: item.p,
        category: item.c,
        format: format,
        tags: tags,
        module: item.s || item.c,
        sub: item.s
      };
    });
  }

  // ─── INIT ───
  function init() {
    allAssets = buildAssetCatalog();
    updateCounts();
    renderTabs();
    renderToolbar();
    applyFilters();
    initCanvas();
    initLightbox();

    document.getElementById('totalCount').textContent = allAssets.length;
  }

  // ─── UPDATE COUNTS ───
  function updateCounts() {
    Object.keys(CATEGORIES).forEach(key => { CATEGORIES[key].count = 0; });
    allAssets.forEach(a => {
      CATEGORIES.all.count++;
      if (CATEGORIES[a.category]) CATEGORIES[a.category].count++;
    });
  }

  // ─── RENDER TABS ───
  function renderTabs() {
    const bar = document.getElementById('tabBar');
    bar.innerHTML = '';

    Object.entries(CATEGORIES).forEach(([key, cat]) => {
      if (cat.count === 0 && key !== 'all') return;
      const btn = document.createElement('button');
      btn.className = `tab-btn ${key === currentTab ? 'active' : ''}`;
      btn.innerHTML = `${cat.icon} ${cat.label} <span class="tab-count">${cat.count}</span>`;
      btn.onclick = () => {
        currentTab = key;
        renderTabs();
        applyFilters();
      };
      bar.appendChild(btn);
    });

    // ─── WERKZEUGE Separator ───
    const sep = document.createElement('div');
    sep.style.cssText = 'width:1px;height:24px;background:rgba(255,255,255,0.1);margin:0 6px;flex-shrink:0';
    bar.appendChild(sep);

    const werkLabel = document.createElement('span');
    werkLabel.style.cssText = 'font-size:9px;color:var(--text-dim);text-transform:uppercase;letter-spacing:1px;padding:0 4px;white-space:nowrap';
    werkLabel.textContent = '🛠️ WERKZEUGE';
    bar.appendChild(werkLabel);

    // Builder tools
    const tools = [
      { key: 'blog', label: '📰 Blog Designer', panel: 'blog' },
      { key: 'flyer', label: '🖨️ Flyer Builder', panel: 'flyer' },
      { key: 'seo', label: '🔍 SEO Toolkit', panel: 'seo' }
    ];
    tools.forEach(tool => {
      const tabKey = `${tool.key}-tool`;
      const btn = document.createElement('button');
      btn.className = `tab-btn ${currentTab === tabKey ? 'active' : ''}`;
      btn.innerHTML = tool.label;
      btn.onclick = () => {
        currentTab = tabKey;
        renderTabs();
        showBuilderPanel(tool.panel);
      };
      bar.appendChild(btn);
    });
  }

  // ─── RENDER TOOLBAR ───
  function renderToolbar() {
    const chips = document.getElementById('formatChips');
    chips.innerHTML = '';
    FORMAT_FILTERS.forEach(fmt => {
      const chip = document.createElement('button');
      chip.className = `chip ${fmt === currentFormat ? 'active' : ''}`;
      chip.textContent = fmt === 'all' ? 'Alle' : fmt.charAt(0).toUpperCase() + fmt.slice(1);
      chip.onclick = () => { currentFormat = fmt; renderToolbar(); applyFilters(); };
      chips.appendChild(chip);
    });
  }

  // ─── APPLY FILTERS ───
  function applyFilters() {
    document.querySelectorAll('.builder-panel').forEach(p => p.classList.remove('active'));
    document.getElementById('gallerySection').style.display = '';
    document.getElementById('toolbar').style.display = '';

    filteredAssets = allAssets.filter(a => {
      if (currentTab !== 'all' && a.category !== currentTab) return false;
      if (currentFormat !== 'all' && a.format !== currentFormat) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return a.name.toLowerCase().includes(q) ||
               a.tags.some(t => t.toLowerCase().includes(q)) ||
               a.file.toLowerCase().includes(q) ||
               a.module.toLowerCase().includes(q);
      }
      return true;
    });

    renderGrid();
    document.getElementById('filteredCount').textContent = filteredAssets.length;
  }

  // ─── RENDER GRID ───
  function renderGrid() {
    const grid = document.getElementById('galleryGrid');
    grid.className = `gallery-grid ${currentView === 'large' ? 'view-large' : ''} ${currentView === 'list' ? 'view-list' : ''}`;
    grid.innerHTML = '';

    if (filteredAssets.length === 0) {
      grid.innerHTML = `
        <div class="empty-state" style="grid-column: 1/-1;">
          <div class="empty-icon">🔍</div>
          <div class="empty-text">Keine Assets gefunden</div>
          <div class="empty-hint">Versuche einen anderen Filter oder Suchbegriff</div>
        </div>`;
      return;
    }

    filteredAssets.forEach((asset, index) => {
      const card = document.createElement('div');
      card.className = 'gallery-card';
      card.setAttribute('data-index', index);

      const catClass = `cat-${asset.category}`;

      card.innerHTML = `
        <img class="card-img" src="${esc(asset.path)}" alt="${esc(asset.name)}" loading="lazy" onerror="this.src='data:image/svg+xml,<svg xmlns=\\'http://www.w3.org/2000/svg\\' viewBox=\\'0 0 400 250\\' fill=\\'%23222\\'><rect width=\\'400\\' height=\\'250\\' rx=\\'8\\'/><text x=\\'200\\' y=\\'125\\' fill=\\'%23666\\' text-anchor=\\'middle\\' font-family=\\'Inter\\' font-size=\\'14\\'>${esc(asset.file)}</text></svg>'">
        <div class="card-overlay">
          <div class="card-actions">
            <button onclick="event.stopPropagation(); BuilderGallery.download(${index})">⬇ Download</button>
            <button onclick="event.stopPropagation(); BuilderGallery.copyPath(${index})">📋 Pfad</button>
          </div>
        </div>
        <div class="card-info">
          <div class="card-title">${esc(asset.name)}</div>
          <div class="card-meta">${esc(asset.file)} · ${esc(asset.format)}</div>
          <div class="card-tags">
            <span class="card-tag ${catClass}">${esc(asset.category.toUpperCase())}</span>
            ${asset.tags.slice(1, 4).map(t => `<span class="card-tag">${esc(t)}</span>`).join('')}
          </div>
        </div>`;

      card.addEventListener('click', () => openLightbox(index));
      grid.appendChild(card);
    });
  }

  // ─── LIGHTBOX ───
  function initLightbox() {
    const lb = document.getElementById('lightbox');
    lb.addEventListener('click', (e) => {
      if (e.target === lb) closeLightbox();
    });
    document.addEventListener('keydown', (e) => {
      if (!lb.classList.contains('active')) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowRight') navigateLightbox(1);
      if (e.key === 'ArrowLeft') navigateLightbox(-1);
    });
  }

  function openLightbox(index) {
    lightboxIndex = index;
    const asset = filteredAssets[index];
    if (!asset) return;

    const lb = document.getElementById('lightbox');
    const img = document.getElementById('lbImg');
    const info = document.getElementById('lbTitle');

    img.src = asset.path;
    info.textContent = `${asset.name} · ${asset.format} · ${asset.category}`;
    lb.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    document.getElementById('lightbox').classList.remove('active');
    document.body.style.overflow = '';
  }

  function navigateLightbox(dir) {
    lightboxIndex = (lightboxIndex + dir + filteredAssets.length) % filteredAssets.length;
    const asset = filteredAssets[lightboxIndex];
    if (!asset) return;
    document.getElementById('lbImg').src = asset.path;
    document.getElementById('lbTitle').textContent = `${asset.name} · ${asset.format} · ${asset.category}`;
  }

  // ─── BUILDER PANELS ───
  function showBuilderPanel(type) {
    document.getElementById('gallerySection').style.display = 'none';
    document.getElementById('toolbar').style.display = 'none';
    document.querySelectorAll('.builder-panel').forEach(p => p.classList.remove('active'));
    const panel = document.getElementById(`builder-${type}`);
    if (panel) panel.classList.add('active');
  }

  // ─── CANVAS BACKGROUND ───
  function initCanvas() {
    const canvas = document.getElementById('bgCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let w, h, particles = [];

    function resize() {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    for (let i = 0; i < 50; i++) {
      particles.push({
        x: Math.random() * w, y: Math.random() * h,
        r: Math.random() * 2 + 0.3,
        dx: (Math.random() - 0.5) * 0.25,
        dy: (Math.random() - 0.5) * 0.25,
        alpha: Math.random() * 0.4 + 0.1,
        color: ['#fa1e4e', '#3b82f6', '#a855f7', '#00ff88'][Math.floor(Math.random() * 4)]
      });
    }

    function animate() {
      ctx.clearRect(0, 0, w, h);
      particles.forEach((p, i) => {
        particles.slice(i + 1).forEach(q => {
          const dist = Math.hypot(p.x - q.x, p.y - q.y);
          if (dist < 100) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(q.x, q.y);
            ctx.strokeStyle = `rgba(250, 30, 78, ${0.04 * (1 - dist / 100)})`;
            ctx.lineWidth = 0.4;
            ctx.stroke();
          }
        });
        p.x += p.dx; p.y += p.dy;
        if (p.x < 0 || p.x > w) p.dx *= -1;
        if (p.y < 0 || p.y > h) p.dy *= -1;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.fill();
        ctx.globalAlpha = 1;
      });
      requestAnimationFrame(animate);
    }
    animate();
  }

  // ─── UTILITIES ───
  function esc(str) {
    const div = document.createElement('div');
    div.textContent = str || '';
    return div.innerHTML;
  }

  function showToast(msg) {
    const t = document.getElementById('toast');
    t.textContent = msg;
    t.classList.add('show');
    setTimeout(() => t.classList.remove('show'), 2500);
  }

  // ─── PUBLIC API ───
  window.BuilderGallery = {
    download(index) {
      const asset = filteredAssets[index];
      if (!asset) return;
      const a = document.createElement('a');
      a.href = asset.path;
      a.download = asset.file;
      a.click();
      showToast(`⬇ ${asset.file}`);
    },
    copyPath(index) {
      const asset = filteredAssets[index];
      if (!asset) return;
      navigator.clipboard.writeText(asset.path).then(() => {
        showToast(`📋 Pfad kopiert`);
      });
    },
    openFull(index) { openLightbox(index); },
    search(query) { searchQuery = query; applyFilters(); },
    setView(view) {
      currentView = view;
      document.querySelectorAll('.view-btn').forEach(b => b.classList.remove('active'));
      document.querySelector(`.view-btn[data-view="${view}"]`)?.classList.add('active');
      applyFilters();
    },
    navigateLB(dir) { navigateLightbox(dir); }
  };

  // ─── BOOT ───
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
