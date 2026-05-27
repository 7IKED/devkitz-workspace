/**
 * DkZ NexuzOS Auth System
 * GitHub Login (empfohlen) + Google Login (Fallback)
 * Lokale KeePass-Option fuer Offline-Betrieb
 * 
 * Einbinden: <script src="shared/auth.js"></script>
 */
(function() {
  'use strict';

  const AUTH_KEY = 'nxz-auth';
  const USER_KEY = 'nxz-user';

  // ─── Public API ────────────────────────────────
  window.NxzAuth = {
    isLoggedIn() { return !!localStorage.getItem(AUTH_KEY); },
    getUser()    { try { return JSON.parse(localStorage.getItem(USER_KEY)); } catch(e) { return null; } },
    getToken()   { return localStorage.getItem(AUTH_KEY); },
    logout()     { localStorage.removeItem(AUTH_KEY); localStorage.removeItem(USER_KEY); window.location.href = 'login.html'; },
    
    // GitHub OAuth (empfohlen)
    async loginGitHub(code) {
      // Exchange code for token via ONTHERUN Gateway
      try {
        const res = await fetch('http://localhost:3040/api/auth/github', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code })
        });
        if (!res.ok) throw new Error('GitHub Auth fehlgeschlagen');
        const data = await res.json();
        localStorage.setItem(AUTH_KEY, data.token);
        localStorage.setItem(USER_KEY, JSON.stringify(data.user));
        return data.user;
      } catch(e) {
        console.error('[NxzAuth] GitHub Login Error:', e);
        throw e;
      }
    },

    // Google OAuth
    async loginGoogle(credential) {
      try {
        const res = await fetch('http://localhost:3040/api/auth/google', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ credential })
        });
        if (!res.ok) throw new Error('Google Auth fehlgeschlagen');
        const data = await res.json();
        localStorage.setItem(AUTH_KEY, data.token);
        localStorage.setItem(USER_KEY, JSON.stringify(data.user));
        return data.user;
      } catch(e) {
        console.error('[NxzAuth] Google Login Error:', e);
        throw e;
      }
    },

    // KeePass / Lokaler Login (Offline)
    loginLocal(name, avatar) {
      const user = { name: name || 'Local User', avatar: avatar || '', provider: 'local', id: 'local-' + Date.now() };
      localStorage.setItem(AUTH_KEY, 'local-token-' + Date.now());
      localStorage.setItem(USER_KEY, JSON.stringify(user));
      return user;
    },

    // Guard — Redirect zu Login wenn nicht eingeloggt
    guard() {
      if (!this.isLoggedIn() && !window.location.pathname.includes('login.html')) {
        window.location.href = 'login.html';
        return false;
      }
      return true;
    },

    // User-Badge in Sidebar injizieren
    renderUserBadge() {
      const user = this.getUser();
      if (!user) return;
      const badge = document.querySelector('.nxz-sidebar-footer');
      if (badge) {
        badge.innerHTML = `
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px">
            ${user.avatar ? '<img src="' + user.avatar + '" style="width:20px;height:20px;border-radius:50%;border:1px solid rgba(250,30,78,.3)" alt="">' : '<span style="font-size:16px">👤</span>'}
            <span style="color:#e8e8f0;font-weight:600;font-size:11px">${esc(user.name)}</span>
          </div>
          <div style="display:flex;justify-content:space-between;align-items:center">
            <span>NexuzOS v2.01</span>
            <button onclick="NxzAuth.logout()" style="all:unset;cursor:pointer;color:#fa1e4e;font-size:9px;font-weight:700">Logout ↗</button>
          </div>
        `;
      }
    }
  };

  // XSS-Schutz
  function esc(str) {
    const div = document.createElement('div');
    div.textContent = str || '';
    return div.innerHTML;
  }

  // Auto-render User Badge wenn Sidebar geladen
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      setTimeout(() => NxzAuth.renderUserBadge(), 300);
    });
  } else {
    setTimeout(() => NxzAuth.renderUserBadge(), 300);
  }
})();
