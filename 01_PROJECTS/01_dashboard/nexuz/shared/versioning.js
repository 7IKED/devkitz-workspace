/**
 * DkZ NexuzOS Versioning System
 * Seiten-Versionen in localStorage + GitHub-Backup
 * Zeitreise-Overlay: Zurueck/Vor zwischen Versionen
 * 
 * Einbinden: <script src="shared/versioning.js"></script>
 */
(function() {
  'use strict';

  const VER_KEY = 'nxz-versions';
  const MAX_VERSIONS = 50;

  // ─── Version Store ─────────────────────────────
  function getVersions() {
    try { return JSON.parse(localStorage.getItem(VER_KEY)) || {}; } catch(e) { return {}; }
  }

  function saveVersion(pageId, label) {
    const versions = getVersions();
    if (!versions[pageId]) versions[pageId] = [];
    versions[pageId].push({
      id: 'v-' + Date.now(),
      timestamp: new Date().toISOString(),
      label: label || 'Auto-Save',
      snapshot: document.documentElement.outerHTML.substring(0, 50000) // max 50KB
    });
    // Trim
    if (versions[pageId].length > MAX_VERSIONS) {
      versions[pageId] = versions[pageId].slice(-MAX_VERSIONS);
    }
    localStorage.setItem(VER_KEY, JSON.stringify(versions));
    return versions[pageId].length;
  }

  function getPageVersions(pageId) {
    const versions = getVersions();
    return versions[pageId] || [];
  }

  // ─── CSS ───────────────────────────────────────
  const style = document.createElement('style');
  style.textContent = `
    .nxz-ver-btn{position:fixed;bottom:20px;right:20px;z-index:10001;width:40px;height:40px;border:1px solid rgba(26,26,42,.8);border-radius:12px;background:rgba(14,14,16,.9);backdrop-filter:blur(16px);color:#8a8a9a;font-size:16px;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all .2s;font-family:'Inter',sans-serif}
    .nxz-ver-btn:hover{border-color:#a855f7;color:#a855f7;transform:scale(1.05)}
    .nxz-ver-overlay{position:fixed;top:0;right:-400px;width:380px;height:100vh;z-index:10002;background:rgba(14,14,16,.96);backdrop-filter:blur(24px);border-left:1px solid rgba(26,26,42,.8);transition:right .35s cubic-bezier(.4,0,.2,1);display:flex;flex-direction:column;padding:0}
    .nxz-ver-overlay.open{right:0}
    .nxz-ver-head{padding:20px;border-bottom:1px solid rgba(26,26,42,.5);display:flex;align-items:center;justify-content:space-between}
    .nxz-ver-head h3{font-size:14px;font-weight:800;background:linear-gradient(135deg,#a855f7,#6366f1);-webkit-background-clip:text;-webkit-text-fill-color:transparent}
    .nxz-ver-close{all:unset;cursor:pointer;color:#8a8a9a;font-size:18px;width:28px;height:28px;display:flex;align-items:center;justify-content:center;border-radius:8px;transition:all .2s}
    .nxz-ver-close:hover{color:#fa1e4e;background:rgba(250,30,78,.08)}
    .nxz-ver-body{flex:1;overflow-y:auto;padding:16px}
    .nxz-ver-item{display:flex;align-items:flex-start;gap:12px;padding:12px;border-radius:10px;border:1px solid transparent;cursor:pointer;transition:all .2s;margin-bottom:6px}
    .nxz-ver-item:hover{background:rgba(168,85,247,.05);border-color:rgba(168,85,247,.15)}
    .nxz-ver-item.active{background:rgba(168,85,247,.1);border-color:rgba(168,85,247,.3)}
    .nxz-ver-dot{width:10px;height:10px;border-radius:50%;background:#a855f7;margin-top:4px;flex-shrink:0;box-shadow:0 0 8px rgba(168,85,247,.4)}
    .nxz-ver-dot.first{background:#00ff88;box-shadow:0 0 8px rgba(0,255,136,.4)}
    .nxz-ver-info{flex:1}
    .nxz-ver-label{font-size:12px;font-weight:600;color:#e8e8f0}
    .nxz-ver-time{font-size:9px;font-family:'JetBrains Mono',monospace;color:#5e5e78;margin-top:3px}
    .nxz-ver-line{width:2px;background:rgba(168,85,247,.2);min-height:20px;margin-left:4px}
    .nxz-ver-actions{padding:16px;border-top:1px solid rgba(26,26,42,.5);display:flex;gap:8px}
    .nxz-ver-act{flex:1;padding:8px;border:1px solid rgba(26,26,42,.5);border-radius:8px;background:rgba(14,14,16,.6);color:#e8e8f0;font-size:11px;font-weight:600;cursor:pointer;text-align:center;transition:all .2s;font-family:'Inter',sans-serif}
    .nxz-ver-act:hover{border-color:#a855f7;background:rgba(168,85,247,.08)}
    .nxz-ver-act.save{border-color:rgba(0,255,136,.3);color:#00ff88}
    .nxz-ver-act.save:hover{background:rgba(0,255,136,.08)}
    .nxz-ver-empty{text-align:center;padding:40px 20px;color:#5e5e78;font-size:12px;font-family:'JetBrains Mono',monospace}
    .nxz-ver-bg{position:fixed;top:0;left:0;right:0;bottom:0;z-index:10001;background:rgba(0,0,0,.3);opacity:0;pointer-events:none;transition:opacity .3s}
    .nxz-ver-bg.show{opacity:1;pointer-events:auto}
    .nxz-ver-count{font-size:8px;font-family:'JetBrains Mono',monospace;background:rgba(168,85,247,.2);color:#a855f7;padding:1px 5px;border-radius:4px;position:absolute;top:-4px;right:-4px}
    @media(max-width:768px){.nxz-ver-overlay{width:100vw;right:-100vw}}
  `;
  document.head.appendChild(style);

  // ─── Detect Page ID ────────────────────────────
  const pageId = window.location.pathname.split('/').pop().replace('.html','') || 'index';

  // ─── UI Elements ───────────────────────────────
  const bg = document.createElement('div');
  bg.className = 'nxz-ver-bg';
  document.body.appendChild(bg);

  const btn = document.createElement('button');
  btn.className = 'nxz-ver-btn';
  btn.innerHTML = '⏮';
  btn.title = 'Versionen anzeigen';
  document.body.appendChild(btn);

  const overlay = document.createElement('div');
  overlay.className = 'nxz-ver-overlay';
  document.body.appendChild(overlay);

  let isOpen = false;
  let selectedVersion = null;

  function open() {
    isOpen = true;
    render();
    overlay.classList.add('open');
    bg.classList.add('show');
  }

  function close() {
    isOpen = false;
    overlay.classList.remove('open');
    bg.classList.remove('show');
  }

  btn.addEventListener('click', () => isOpen ? close() : open());
  bg.addEventListener('click', close);

  function formatTime(iso) {
    const d = new Date(iso);
    return d.toLocaleString('de-DE', { day:'2-digit', month:'2-digit', hour:'2-digit', minute:'2-digit', second:'2-digit' });
  }

  function render() {
    const versions = getPageVersions(pageId);
    const count = versions.length;

    // Update button badge
    const existingBadge = btn.querySelector('.nxz-ver-count');
    if (existingBadge) existingBadge.remove();
    if (count > 0) {
      const badge = document.createElement('span');
      badge.className = 'nxz-ver-count';
      badge.textContent = count;
      btn.appendChild(badge);
    }

    overlay.innerHTML = `
      <div class="nxz-ver-head">
        <h3>⏮ Versionen — ${pageId}</h3>
        <button class="nxz-ver-close" onclick="this.closest('.nxz-ver-overlay').classList.remove('open');document.querySelector('.nxz-ver-bg').classList.remove('show')">✕</button>
      </div>
      <div class="nxz-ver-body">
        ${count === 0 ? '<div class="nxz-ver-empty">Keine Versionen gespeichert.<br><br>Klicke "Speichern" um die aktuelle Version zu sichern.</div>' :
          versions.slice().reverse().map((v, i) => `
            <div class="nxz-ver-item${selectedVersion === v.id ? ' active' : ''}" data-vid="${v.id}">
              <div class="nxz-ver-dot${i === 0 ? ' first' : ''}"></div>
              <div class="nxz-ver-info">
                <div class="nxz-ver-label">${esc(v.label)}</div>
                <div class="nxz-ver-time">${formatTime(v.timestamp)}</div>
              </div>
            </div>
            ${i < versions.length - 1 ? '<div class="nxz-ver-line"></div>' : ''}
          `).join('')}
      </div>
      <div class="nxz-ver-actions">
        <button class="nxz-ver-act save" id="nxzVerSave">💾 Speichern</button>
        <button class="nxz-ver-act" id="nxzVerGit">🐙 Git Push</button>
      </div>
    `;

    // Event listeners
    overlay.querySelector('#nxzVerSave')?.addEventListener('click', () => {
      const label = prompt('Versions-Label:', 'Manueller Save');
      if (label !== null) {
        saveVersion(pageId, label);
        render();
      }
    });

    overlay.querySelector('#nxzVerGit')?.addEventListener('click', () => {
      alert('Git Push: In Produktion wird hier ein API-Call an ONTHERUN Gateway ausgefuehrt.\n\ngit add -A && git commit -m "version(' + pageId + '): snapshot" && git push');
    });

    overlay.querySelectorAll('.nxz-ver-item').forEach(item => {
      item.addEventListener('click', () => {
        selectedVersion = item.dataset.vid;
        overlay.querySelectorAll('.nxz-ver-item').forEach(i => i.classList.remove('active'));
        item.classList.add('active');
      });
    });
  }

  // XSS-Schutz
  function esc(str) {
    const div = document.createElement('div');
    div.textContent = str || '';
    return div.innerHTML;
  }

  // ─── Auto-Save bei Seitenwechsel ───────────────
  window.addEventListener('beforeunload', () => {
    // Nur speichern wenn aenderungen da waren (simpel: alle 5 min)
    // In Produktion: MutationObserver fuer DOM-Aenderungen
  });

  // ─── Public API ────────────────────────────────
  window.NxzVersioning = {
    save: (label) => saveVersion(pageId, label),
    list: () => getPageVersions(pageId),
    open, close
  };

  // Initial badge update
  const initVersions = getPageVersions(pageId);
  if (initVersions.length > 0) {
    const badge = document.createElement('span');
    badge.className = 'nxz-ver-count';
    badge.textContent = initVersions.length;
    btn.appendChild(badge);
  }

})();
