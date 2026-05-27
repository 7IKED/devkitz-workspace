/**
 * DkZ NexuzOS Sidebar Navigation
 * Globale Sidebar fuer alle NexuzOS Seiten
 * Injiziert sich automatisch ins DOM
 * 
 * Einbinden: <script src="shared/sidebar.js"></script>
 */
(function() {
  'use strict';

  const PAGES = [
    { id: 'command',   icon: '⚡', label: 'Command Center',  href: 'index.html' },
    { id: 'workflow',  icon: '📋', label: 'Workflow Board',   href: 'workflow-board.html' },
    { id: 'monitor',   icon: '📊', label: 'Monitoring',       href: 'monitoring.html' },
    { id: 'builder',   icon: '🔧', label: 'Nexuz Builder',    href: '../modules/nexuz-builder/index.html' }
  ];

  // Detect active page
  const loc = window.location.pathname;
  function isActive(href) {
    if (href.includes('index.html') && !href.includes('nexuz-builder') && (loc.endsWith('/nexuz/') || loc.endsWith('/nexuz/index.html'))) return true;
    return loc.includes(href.replace('..','').replace('/index.html',''));
  }

  // CSS
  const style = document.createElement('style');
  style.textContent = `
    .nxz-sidebar-toggle{position:fixed;top:16px;left:16px;z-index:10001;width:36px;height:36px;border:1px solid rgba(26,26,42,.8);border-radius:10px;background:rgba(14,14,16,.9);backdrop-filter:blur(16px);color:#e8e8f0;font-size:18px;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all .2s}
    .nxz-sidebar-toggle:hover{border-color:#fa1e4e;color:#fa1e4e;transform:scale(1.05)}
    .nxz-sidebar{position:fixed;top:0;left:-280px;width:260px;height:100vh;z-index:10000;background:rgba(14,14,16,.95);backdrop-filter:blur(24px);border-right:1px solid rgba(26,26,42,.8);transition:left .35s cubic-bezier(.4,0,.2,1);display:flex;flex-direction:column;padding:20px 0}
    .nxz-sidebar.open{left:0}
    .nxz-sidebar-brand{padding:16px 20px 20px;border-bottom:1px solid rgba(26,26,42,.5)}
    .nxz-sidebar-brand h2{font-size:16px;font-weight:900;font-family:'Inter',sans-serif;background:linear-gradient(135deg,#fa1e4e,#a855f7);-webkit-background-clip:text;-webkit-text-fill-color:transparent}
    .nxz-sidebar-brand .sub{font-size:9px;font-family:'JetBrains Mono',monospace;color:#5e5e78;margin-top:4px;letter-spacing:1px}
    .nxz-sidebar-nav{flex:1;padding:12px 10px;overflow-y:auto}
    .nxz-sidebar-link{display:flex;align-items:center;gap:10px;padding:10px 14px;margin-bottom:4px;border-radius:10px;color:#8a8a9a;text-decoration:none;font-family:'Inter',sans-serif;font-size:13px;font-weight:500;transition:all .2s;border:1px solid transparent}
    .nxz-sidebar-link:hover{background:rgba(250,30,78,.06);color:#e8e8f0;border-color:rgba(250,30,78,.15)}
    .nxz-sidebar-link.active{background:rgba(250,30,78,.1);color:#fa1e4e;border-color:rgba(250,30,78,.25);font-weight:700}
    .nxz-sidebar-link .icon{font-size:18px;width:28px;text-align:center}
    .nxz-sidebar-sep{height:1px;background:rgba(26,26,42,.5);margin:10px 14px}
    .nxz-sidebar-footer{padding:12px 20px;border-top:1px solid rgba(26,26,42,.5);font-size:9px;font-family:'JetBrains Mono',monospace;color:#5e5e78}
    .nxz-sidebar-overlay{position:fixed;top:0;left:0;right:0;bottom:0;z-index:9999;background:rgba(0,0,0,.4);opacity:0;pointer-events:none;transition:opacity .3s}
    .nxz-sidebar-overlay.show{opacity:1;pointer-events:auto}
    body.nxz-sidebar-open .nxz-sidebar-toggle{left:272px}
    @media(max-width:768px){.nxz-sidebar{width:100vw;left:-100vw}.nxz-sidebar.open{left:0}body.nxz-sidebar-open .nxz-sidebar-toggle{left:calc(100vw - 48px)}}
  `;
  document.head.appendChild(style);

  // HTML
  const overlay = document.createElement('div');
  overlay.className = 'nxz-sidebar-overlay';
  document.body.appendChild(overlay);

  const toggle = document.createElement('button');
  toggle.className = 'nxz-sidebar-toggle';
  toggle.innerHTML = '☰';
  toggle.setAttribute('aria-label', 'Navigation oeffnen');
  document.body.appendChild(toggle);

  const sidebar = document.createElement('nav');
  sidebar.className = 'nxz-sidebar';
  sidebar.innerHTML = `
    <div class="nxz-sidebar-brand">
      <h2>⚡ NEXUZ²</h2>
      <div class="sub">COMMAND CENTER</div>
    </div>
    <div class="nxz-sidebar-nav">
      ${PAGES.map(p => `<a href="${p.href}" class="nxz-sidebar-link${isActive(p.href) ? ' active' : ''}"><span class="icon">${p.icon}</span>${p.label}</a>`).join('')}
      <div class="nxz-sidebar-sep"></div>
      <a href="../hub/index.html" class="nxz-sidebar-link"><span class="icon">🏠</span>DkZ Hub</a>
      <a href="login.html" class="nxz-sidebar-link"><span class="icon">🔐</span>Login / Auth</a>
    </div>
    <div class="nxz-sidebar-footer">NexuzOS v2.01 · DkZ™ 2026</div>
  `;
  document.body.appendChild(sidebar);

  // Toggle
  let isOpen = false;
  function openSidebar() { isOpen = true; sidebar.classList.add('open'); overlay.classList.add('show'); document.body.classList.add('nxz-sidebar-open'); }
  function closeSidebar() { isOpen = false; sidebar.classList.remove('open'); overlay.classList.remove('show'); document.body.classList.remove('nxz-sidebar-open'); }
  toggle.addEventListener('click', () => isOpen ? closeSidebar() : openSidebar());
  overlay.addEventListener('click', closeSidebar);
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && isOpen) closeSidebar(); });
})();
