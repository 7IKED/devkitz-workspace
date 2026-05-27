/**
 * DkZ Auth — User-Verwaltung & Rollen-System
 * @DKZ:TAG [SHARED:auth] [CAT:security] [LANG:js]
 * @DKZ:RULES R100 Archiv-Pflicht, R97 Auto-Integration
 * @version v0.01.1_01
 * 
 * 4-Tier Rollen-System:
 * - superadmin: ALLES + System-Einstellungen (nur BAZE²)
 * - admin: User+/User-, Feature-Sichtbarkeit, kein System-Zugriff
 * - userplus: Vertrauens-Bonus, mehr Einblick + Personalisierung
 * - user: Nur freigeschaltete Features
 * 
 * Einbinden: <script src="../../shared/dkz-auth.js"></script>
 */
const DkzAuth = (() => {
    'use strict';

    const VERSION = '1.1.0';
    const LS_USERS = 'dkz-auth-users';
    const LS_SESSION = 'dkz-auth-session';
    const LS_FEATURES = 'dkz-auth-features';
    const LS_ARCHIVE = 'dkz-auth-archive';

    // Default Super Admin
    const SUPER_ADMIN = {
        id: 'SA-001',
        name: 'BAZE\u00B2',
        email: 'admin@devkitz.com',
        role: 'superadmin',
        created: '2026-03-01',
        status: 'active',
        features: '*'
    };

    // All manageable features
    const ALL_FEATURES = [
        { id: 'memory', name: 'Memory 3-Layer', icon: '\uD83E\uDDE0', desc: 'Hot/Warm/Cold Memory Management' },
        { id: 'iceberg', name: 'Iceberg Versioning', icon: '\u2744\uFE0F', desc: 'Prompt-Versionierung und Archiv' },
        { id: 'james-score', name: 'James Score', icon: '\uD83E\uDD16', desc: 'KI-Prompt-Bewertung 0-100' },
        { id: 'templates', name: 'Templates', icon: '\uD83D\uDCC4', desc: '125 Prompt-Templates Katalog' },
        { id: 'bridge', name: 'Builder Bridge', icon: '\uD83C\uDF09', desc: 'Bidirektionale Modul-Verbindung' },
        { id: 'compaction', name: 'Auto-Compaction', icon: '\uD83D\uDDDC\uFE0F', desc: 'Automatische Speicher-Optimierung' },
        { id: 'prompt-score', name: 'Live Score Widget', icon: '\uD83C\uDFAF', desc: 'Echtzeit-Prompt-Bewertung beim Tippen' },
        { id: 'debug-panel', name: 'Debug Panel', icon: '\uD83D\uDC1B', desc: 'F12 Debug-Werkzeuge' },
        { id: 'export', name: 'Export', icon: '\uD83D\uDCE4', desc: 'JSON/CSV/MD/PDF Export' },
        { id: 'health-check', name: 'Health Check', icon: '\uD83C\uDFE5', desc: 'System-Gesundheits-Monitor' },
        { id: 'botnet-admin', name: 'BotNet Admin', icon: '\uD83C\uDF10', desc: 'Agent-Netzwerk Verwaltung' },
        { id: 'settings-admin', name: 'Admin Settings', icon: '\u2699\uFE0F', desc: 'System-Konfiguration' },
        { id: 'personalization', name: 'Personalisierung', icon: '\uD83C\uDFA8', desc: 'Akzentfarbe, Schrift, Layout-Einstellungen' },
        { id: 'insights', name: 'Insights', icon: '\uD83D\uDCCA', desc: 'Erweiterte Statistiken und Einblicke' },
        { id: 'theme-editor', name: 'Theme Editor', icon: '\uD83C\uDF19', desc: 'Eigenes Farbschema erstellen' }
    ];

    // Default feature config per role
    const DEFAULT_ROLE_FEATURES = {
        superadmin: '*',
        admin: ['memory','iceberg','james-score','templates','bridge','compaction','prompt-score','debug-panel','export','health-check','settings-admin','personalization','insights','theme-editor'],
        userplus: ['memory','iceberg','james-score','templates','bridge','prompt-score','export','personalization','insights','theme-editor'],
        user: ['templates','export','prompt-score']
    };

    // Role hierarchy (index = power level)
    const ROLE_HIERARCHY = ['user', 'userplus', 'admin', 'superadmin'];

    // ═══════════════════════════════════════
    // USER DATABASE (localStorage)
    // ═══════════════════════════════════════
    function getUsers() {
        var users = JSON.parse(localStorage.getItem(LS_USERS) || '[]');
        // Ensure super admin always exists
        if (!users.find(function(u) { return u.role === 'superadmin'; })) {
            users.unshift(SUPER_ADMIN);
            localStorage.setItem(LS_USERS, JSON.stringify(users));
        }
        return users;
    }

    function saveUsers(users) {
        localStorage.setItem(LS_USERS, JSON.stringify(users));
    }

    function addUser(email, name, role) {
        if (!email || !name) return { error: 'Email und Name erforderlich' };
        var users = getUsers();
        if (users.find(function(u) { return u.email === email; })) {
            return { error: 'Email bereits registriert' };
        }
        var user = {
            id: 'USR-' + Date.now().toString(36).toUpperCase(),
            name: name,
            email: email.toLowerCase().trim(),
            role: role || 'user',
            created: new Date().toISOString().split('T')[0],
            status: 'active',
            features: DEFAULT_ROLE_FEATURES[role || 'user'],
            lastActive: null,
            tags: []
        };
        users.push(user);
        saveUsers(users);
        _log('User added: ' + name + ' (' + email + ') as ' + user.role);
        return user;
    }

    // R100: NEVER delete, always archive
    function removeUser(userId) {
        var users = getUsers();
        var idx = users.findIndex(function(u) { return u.id === userId; });
        if (idx === -1) return { error: 'User nicht gefunden' };
        if (users[idx].role === 'superadmin') return { error: 'Super Admin kann nicht entfernt werden' };

        var archived = users.splice(idx, 1)[0];
        archived.status = 'archived';
        archived.archivedAt = new Date().toISOString();

        // Move to archive (R100)
        var archive = JSON.parse(localStorage.getItem(LS_ARCHIVE) || '[]');
        archive.push(archived);
        localStorage.setItem(LS_ARCHIVE, JSON.stringify(archive));

        saveUsers(users);
        _log('User archived (R100): ' + archived.name);
        return { archived: archived };
    }

    // ═══════════════════════════════════════
    // ROLE MANAGEMENT: User+ / User-
    // Hierarchy: user → userplus → admin (→ superadmin only by system)
    // ═══════════════════════════════════════
    function promoteUser(userId) {
        var users = getUsers();
        var user = users.find(function(u) { return u.id === userId; });
        if (!user) return { error: 'User nicht gefunden' };
        if (user.role === 'superadmin') return { error: 'Bereits Super Admin' };

        var session = currentUser();
        if (!session || (session.role !== 'superadmin' && session.role !== 'admin')) {
            return { error: 'Keine Berechtigung' };
        }
        // Promote one step: user → userplus → admin
        var idx = ROLE_HIERARCHY.indexOf(user.role);
        if (idx < 0 || idx >= ROLE_HIERARCHY.indexOf('admin')) return { error: 'Kann nicht weiter befoerdert werden' };
        // Only superadmin can promote to admin
        if (ROLE_HIERARCHY[idx + 1] === 'admin' && session.role !== 'superadmin') {
            return { error: 'Nur Super Admin kann zum Admin befoerdern' };
        }
        user.role = ROLE_HIERARCHY[idx + 1];
        user.features = DEFAULT_ROLE_FEATURES[user.role] || [];
        user.trustBonus = user.role === 'userplus' ? true : user.trustBonus;
        saveUsers(users);
        _log('User+ : ' + user.name + ' -> ' + user.role);
        return user;
    }

    function demoteUser(userId) {
        var users = getUsers();
        var user = users.find(function(u) { return u.id === userId; });
        if (!user) return { error: 'User nicht gefunden' };
        if (user.role === 'superadmin') return { error: 'Super Admin kann nicht herabgestuft werden' };

        var session = currentUser();
        if (!session || (session.role !== 'superadmin' && session.role !== 'admin')) {
            return { error: 'Keine Berechtigung' };
        }
        // Demote one step: admin → userplus → user
        var idx = ROLE_HIERARCHY.indexOf(user.role);
        if (idx <= 0) return { error: 'Bereits niedrigste Stufe' };
        // Only superadmin can demote admins
        if (user.role === 'admin' && session.role !== 'superadmin') {
            return { error: 'Nur Super Admin kann Admins herabstufen' };
        }
        user.role = ROLE_HIERARCHY[idx - 1];
        user.features = DEFAULT_ROLE_FEATURES[user.role] || [];
        saveUsers(users);
        _log('User- : ' + user.name + ' -> ' + user.role);
        return user;
    }

    // ═══════════════════════════════════════
    // FEATURE VISIBILITY
    // ═══════════════════════════════════════
    function setFeature(userId, featureId, visible) {
        var users = getUsers();
        var user = users.find(function(u) { return u.id === userId; });
        if (!user) return false;
        if (user.features === '*') return true; // superadmin always has all

        if (!Array.isArray(user.features)) user.features = [];
        if (visible && user.features.indexOf(featureId) === -1) {
            user.features.push(featureId);
        } else if (!visible) {
            user.features = user.features.filter(function(f) { return f !== featureId; });
        }
        saveUsers(users);
        return true;
    }

    function canSee(featureId) {
        var user = currentUser();
        if (!user) return false;
        if (user.role === 'superadmin' || user.features === '*') return true;
        if (!Array.isArray(user.features)) return false;
        return user.features.indexOf(featureId) !== -1;
    }

    function setRoleFeatures(role, features) {
        var config = JSON.parse(localStorage.getItem(LS_FEATURES) || '{}');
        config[role] = features;
        localStorage.setItem(LS_FEATURES, JSON.stringify(config));
    }

    function getRoleFeatures(role) {
        var config = JSON.parse(localStorage.getItem(LS_FEATURES) || '{}');
        return config[role] || DEFAULT_ROLE_FEATURES[role] || [];
    }

    // ═══════════════════════════════════════
    // SESSION / LOGIN
    // ═══════════════════════════════════════
    function login(email, password) {
        var users = getUsers();
        var user = users.find(function(u) {
            return u.email === email.toLowerCase().trim() && u.status === 'active';
        });
        if (!user) return { error: 'User nicht gefunden oder inaktiv' };

        // Simple password check (hash stored in user or any 8+ char password)
        if (!password || password.length < 8) return { error: 'Passwort min. 8 Zeichen' };

        // Update last active
        user.lastActive = new Date().toISOString();
        saveUsers(users);

        // Create session
        var session = {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            features: user.features,
            loginAt: Date.now()
        };
        sessionStorage.setItem(LS_SESSION, JSON.stringify(session));
        _log('Login: ' + user.name + ' (' + user.role + ')');
        return session;
    }

    function logout() {
        sessionStorage.removeItem(LS_SESSION);
        _log('Logout');
    }

    function currentUser() {
        var session = sessionStorage.getItem(LS_SESSION);
        return session ? JSON.parse(session) : null;
    }

    function isLoggedIn() { return !!currentUser(); }
    function isAdmin() { var u = currentUser(); return u && (u.role === 'admin' || u.role === 'superadmin'); }
    function isSuperAdmin() { var u = currentUser(); return u && u.role === 'superadmin'; }
    function isUserPlus() { var u = currentUser(); return u && (u.role === 'userplus' || u.role === 'admin' || u.role === 'superadmin'); }
    function getRoleLevel(role) { return ROLE_HIERARCHY.indexOf(role || 'user'); }

    // ═══════════════════════════════════════
    // PUSH LISTS
    // ═══════════════════════════════════════
    function exportPushList(groupFilter) {
        var users = getUsers().filter(function(u) { return u.status === 'active'; });
        if (groupFilter) {
            if (groupFilter.role) users = users.filter(function(u) { return u.role === groupFilter.role; });
            if (groupFilter.tag) users = users.filter(function(u) { return (u.tags || []).indexOf(groupFilter.tag) !== -1; });
        }
        return {
            group: groupFilter || 'all',
            count: users.length,
            emails: users.map(function(u) { return u.email; }),
            users: users.map(function(u) { return { name: u.name, email: u.email, role: u.role }; }),
            exported: new Date().toISOString()
        };
    }

    function tagUser(userId, tag) {
        var users = getUsers();
        var user = users.find(function(u) { return u.id === userId; });
        if (!user) return false;
        if (!user.tags) user.tags = [];
        if (user.tags.indexOf(tag) === -1) user.tags.push(tag);
        saveUsers(users);
        return true;
    }

    function untagUser(userId, tag) {
        var users = getUsers();
        var user = users.find(function(u) { return u.id === userId; });
        if (!user || !user.tags) return false;
        user.tags = user.tags.filter(function(t) { return t !== tag; });
        saveUsers(users);
        return true;
    }

    // ═══════════════════════════════════════
    // UI HELPERS
    // ═══════════════════════════════════════
    function injectLoginGate() {
        if (isLoggedIn()) return;
        // Don't block if no users yet (fresh install)
        var users = getUsers();
        if (users.length <= 1) return; // Only super admin = open access

        var gate = document.createElement('div');
        gate.id = 'dkz-login-gate';
        gate.innerHTML = '<div style="position:fixed;inset:0;z-index:99999;background:rgba(10,10,14,.97);display:flex;align-items:center;justify-content:center">' +
            '<div style="background:#111116;border:1px solid #2a2a2e;border-radius:16px;padding:40px;width:380px;text-align:center;font-family:Inter,sans-serif">' +
            '<div style="font-size:36px;margin-bottom:12px">\uD83D\uDD10</div>' +
            '<h2 style="color:#f6f6f7;font-size:18px;margin-bottom:6px">DkZ Login</h2>' +
            '<div style="color:#71717a;font-size:11px;margin-bottom:20px">Anmelden um fortzufahren</div>' +
            '<input id="dkz-login-email" type="email" placeholder="Email" style="width:100%;padding:10px;background:rgba(0,0,0,.4);border:1px solid #2a2a2e;border-radius:8px;color:#f6f6f7;font-size:13px;margin-bottom:8px">' +
            '<input id="dkz-login-pw" type="password" placeholder="Passwort (min. 8)" style="width:100%;padding:10px;background:rgba(0,0,0,.4);border:1px solid #2a2a2e;border-radius:8px;color:#f6f6f7;font-size:13px;margin-bottom:12px">' +
            '<button onclick="DkzAuth._doLogin()" style="width:100%;padding:10px;background:#fa1e4e;border:none;border-radius:8px;color:#fff;font-weight:700;cursor:pointer">\uD83D\uDD13 Anmelden</button>' +
            '<div id="dkz-login-error" style="color:#fa1e4e;font-size:11px;margin-top:8px"></div>' +
            '</div></div>';
        document.body.appendChild(gate);
    }

    function _doLogin() {
        var email = document.getElementById('dkz-login-email').value;
        var pw = document.getElementById('dkz-login-pw').value;
        var result = login(email, pw);
        if (result.error) {
            document.getElementById('dkz-login-error').textContent = '\u274C ' + result.error;
        } else {
            var gate = document.getElementById('dkz-login-gate');
            if (gate) gate.remove();
            _applyFeatureGates();
        }
    }

    function injectAdminBadge() {
        var user = currentUser();
        if (!user) return;
        var badge = document.createElement('div');
        badge.id = 'dkz-auth-badge';
        var roleColors = { superadmin: '#fa1e4e', admin: '#FFB800', userplus: '#a855f7', user: '#55ACEE' };
        var roleLabels = { superadmin: '\uD83D\uDC51 Super Admin', admin: '\uD83D\uDEE1\uFE0F Admin', userplus: '\u2B50 User+', user: '\uD83D\uDC64 User' };
        var roleColor = roleColors[user.role] || '#55ACEE';
        var roleLabel = roleLabels[user.role] || '\uD83D\uDC64 User';
        badge.innerHTML = '<span style="position:fixed;top:8px;right:80px;z-index:9990;font-size:9px;padding:3px 8px;border-radius:6px;' +
            'background:' + roleColor + '22;color:' + roleColor + ';font-weight:700;font-family:Inter,sans-serif;border:1px solid ' + roleColor + '33">' +
            roleLabel + ' \u00B7 ' + user.name + '</span>';
        document.body.appendChild(badge);
    }

    function _applyFeatureGates() {
        // Hide elements with [data-feature] that user can't see
        document.querySelectorAll('[data-feature]').forEach(function(el) {
            var feature = el.getAttribute('data-feature');
            if (!canSee(feature)) {
                el.style.display = 'none';
                el.setAttribute('data-hidden-by-auth', 'true');
            }
        });
    }

    // ═══════════════════════════════════════
    // LOGGING
    // ═══════════════════════════════════════
    function _log(msg) {
        var logs = JSON.parse(localStorage.getItem('dkz-auth-log') || '[]');
        logs.push({ ts: Date.now(), msg: msg });
        if (logs.length > 200) logs = logs.slice(-200);
        localStorage.setItem('dkz-auth-log', JSON.stringify(logs));
    }

    // ═══════════════════════════════════════
    // STATS
    // ═══════════════════════════════════════
    function getStats() {
        var users = getUsers();
        var archive = JSON.parse(localStorage.getItem(LS_ARCHIVE) || '[]');
        return {
            total: users.length,
            active: users.filter(function(u) { return u.status === 'active'; }).length,
            archived: archive.length,
            superadmins: users.filter(function(u) { return u.role === 'superadmin'; }).length,
            admins: users.filter(function(u) { return u.role === 'admin'; }).length,
            userplus: users.filter(function(u) { return u.role === 'userplus'; }).length,
            regularUsers: users.filter(function(u) { return u.role === 'user'; }).length
        };
    }

    // ═══════════════════════════════════════
    // AUTO-INIT
    // ═══════════════════════════════════════
    if (typeof document !== 'undefined') {
        document.addEventListener('DOMContentLoaded', function() {
            setTimeout(function() {
                getUsers(); // Ensure super admin exists
                if (isLoggedIn()) {
                    injectAdminBadge();
                    _applyFeatureGates();
                }
            }, 300);
        });
    }

    // ═══════════════════════════════════════
    // PUBLIC API
    // ═══════════════════════════════════════
    return {
        version: VERSION,
        ALL_FEATURES: ALL_FEATURES,
        // Auth
        login: login,
        logout: logout,
        currentUser: currentUser,
        isLoggedIn: isLoggedIn,
        isAdmin: isAdmin,
        isSuperAdmin: isSuperAdmin,
        isUserPlus: isUserPlus,
        getRoleLevel: getRoleLevel,
        ROLE_HIERARCHY: ROLE_HIERARCHY,
        // Users
        getUsers: getUsers,
        addUser: addUser,
        removeUser: removeUser,
        getStats: getStats,
        // Roles (User+/User-)
        promoteUser: promoteUser,
        demoteUser: demoteUser,
        // Features
        canSee: canSee,
        setFeature: setFeature,
        setRoleFeatures: setRoleFeatures,
        getRoleFeatures: getRoleFeatures,
        // Push Lists
        exportPushList: exportPushList,
        tagUser: tagUser,
        untagUser: untagUser,
        // UI
        injectLoginGate: injectLoginGate,
        injectAdminBadge: injectAdminBadge,
        _doLogin: _doLogin
    };
})();

if (typeof window !== 'undefined') window.DkzAuth = DkzAuth;
