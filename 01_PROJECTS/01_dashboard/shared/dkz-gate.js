/**
 * DkZ Gate Guard — Beta Access Control
 * @DKZ:TAG → [SYS:gate] [CAT:shared]
 * @version v1.0.0
 *
 * Prüft ob Besucher authentifiziert ist.
 * Fremde → Gate-Page (Beta-Bewerbung + Crowdfunding)
 * Owner  → Dashboard (via Passphrase)
 */
(function() {
  'use strict';

  const GATE_KEY = 'dkz_gate_token';
  const GATE_HASH = '5f4dcc3b5aa765d61d8327deb882cf99'; // md5 placeholder
  const GATE_PAGE = '/hub/gate.html';
  const TOKEN_EXPIRY_H = 72; // 72 Stunden gültig

  function isAuthenticated() {
    try {
      const data = JSON.parse(localStorage.getItem(GATE_KEY) || '{}');
      if (!data.token || !data.ts) return false;
      const age = Date.now() - data.ts;
      return age < TOKEN_EXPIRY_H * 3600000;
    } catch(e) { return false; }
  }

  function authenticate(passphrase) {
    // Simple hash check — nicht kryptographisch sicher, reicht für Beta
    if (passphrase === 'dkz777' || passphrase === 'devkitz') {
      localStorage.setItem(GATE_KEY, JSON.stringify({
        token: 'owner-' + Date.now(),
        ts: Date.now(),
        role: 'owner'
      }));
      return true;
    }
    return false;
  }

  function logout() {
    localStorage.removeItem(GATE_KEY);
    window.location.href = GATE_PAGE;
  }

  function getRole() {
    try {
      const data = JSON.parse(localStorage.getItem(GATE_KEY) || '{}');
      return data.role || 'guest';
    } catch(e) { return 'guest'; }
  }

  // Auto-Guard: Redirect wenn nicht auf Gate-Page und nicht authentifiziert
  const isGatePage = window.location.pathname.includes('gate.html') ||
                     window.location.pathname === '/' ||
                     window.location.pathname.endsWith('/index.html') && 
                     !window.location.pathname.includes('/modules/') &&
                     !window.location.pathname.includes('/hub/index');

  if (!isGatePage && !isAuthenticated()) {
    // Redirect zur Gate-Page
    const base = window.location.pathname.split('/modules/')[0] || '';
    window.location.href = base + '/hub/gate.html';
  }

  window.DkzGate = {
    isAuthenticated,
    authenticate,
    logout,
    getRole,
    VERSION: 'v1.0.0'
  };
})();
