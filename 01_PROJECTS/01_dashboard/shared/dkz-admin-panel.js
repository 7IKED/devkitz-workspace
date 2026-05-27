/**
 * DkZ Admin Panel — User-Verwaltung & Feature-Sichtbarkeit
 * @DKZ:TAG → [SHARED:admin-panel] [CAT:security] [LANG:js]
 * @DKZ:RULES → R21 Shared Scripts
 * @version v0.01.1_01
 * 
 * Injiziert 2 neue Tabs in Settings:
 * - 👥 User-Verwaltung (User+/User-, Push-Listen, Email-Export)
 * - 🛡️ Feature-Sichtbarkeit (Toggle-Matrix pro User/Rolle)
 * 
 * Voraussetzung: dkz-auth.js muss geladen sein
 */
(function() {
    'use strict';
    if (typeof DkzAuth === 'undefined') return;

    // R1: XSS-Schutz — Fallback falls globale esc() nicht verfuegbar
    var esc = window.esc || function(s) {
        var d = document.createElement('div');
        d.textContent = String(s || '');
        return d.innerHTML;
    };

    document.addEventListener('DOMContentLoaded', function() {
        // Only inject in settings module
        var meta = document.querySelector('meta[name="dkz-module"]');
        if (!meta || meta.content !== 'settings') return;
        if (!DkzAuth.isAdmin()) return; // Only admin+ sees these tabs

        setTimeout(injectAdminTabs, 500);
    });

    function injectAdminTabs() {
        // Find tabs container
        var tabsDiv = document.querySelector('.tabs');
        if (!tabsDiv) return;

        // Add separator + 2 new tabs
        var sep = document.createElement('div');
        sep.className = 'tab-sep';
        tabsDiv.appendChild(sep);

        var userTab = document.createElement('button');
        userTab.className = 'tab';
        userTab.style.borderColor = 'rgba(168,85,247,.3)';
        userTab.innerHTML = '\uD83D\uDC65 User';
        userTab.onclick = function() { switchToPanel('users', this); };
        tabsDiv.appendChild(userTab);

        var featTab = document.createElement('button');
        featTab.className = 'tab';
        featTab.style.borderColor = 'rgba(168,85,247,.3)';
        featTab.innerHTML = '\uD83D\uDEE1\uFE0F Features';
        featTab.onclick = function() { switchToPanel('features', this); };
        tabsDiv.appendChild(featTab);

        // Super Admin only: system tab
        if (DkzAuth.isSuperAdmin()) {
            var sysTab = document.createElement('button');
            sysTab.className = 'tab';
            sysTab.style.borderColor = 'rgba(250,30,78,.5)';
            sysTab.innerHTML = '\uD83D\uDC51 System';
            sysTab.onclick = function() { switchToPanel('sysadmin', this); };
            tabsDiv.appendChild(sysTab);
        }

        // Create panels
        var mainDiv = document.querySelector('.main');
        if (!mainDiv) return;

        // User-Verwaltung Panel
        var userPanel = document.createElement('div');
        userPanel.className = 'panel';
        userPanel.id = 'panel-users';
        mainDiv.appendChild(userPanel);

        // Feature-Sichtbarkeit Panel
        var featPanel = document.createElement('div');
        featPanel.className = 'panel';
        featPanel.id = 'panel-features';
        mainDiv.appendChild(featPanel);

        // Super Admin Panel
        if (DkzAuth.isSuperAdmin()) {
            var sysPanel = document.createElement('div');
            sysPanel.className = 'panel';
            sysPanel.id = 'panel-sysadmin';
            mainDiv.appendChild(sysPanel);
        }
    }

    function switchToPanel(name, btn) {
        // Deactivate all
        document.querySelectorAll('.panel').forEach(function(p) { p.classList.remove('active'); });
        document.querySelectorAll('.tab').forEach(function(t) { t.classList.remove('active'); });
        btn.classList.add('active');

        var panel = document.getElementById('panel-' + name);
        if (panel) {
            panel.classList.add('active');
            if (name === 'users') renderUsersPanel(panel);
            if (name === 'features') renderFeaturesPanel(panel);
            if (name === 'sysadmin') renderSysAdminPanel(panel);
        }
    }

    // ═══════════════════════════════════════
    // USER-VERWALTUNG PANEL
    // ═══════════════════════════════════════
    function renderUsersPanel(panel) {
        var users = DkzAuth.getUsers();
        var stats = DkzAuth.getStats();

        var roleColor = { superadmin: '#fa1e4e', admin: '#FFB800', userplus: '#a855f7', user: '#55ACEE' };
        var roleIcon = { superadmin: '\uD83D\uDC51', admin: '\uD83D\uDEE1\uFE0F', userplus: '\u2B50', user: '\uD83D\uDC64' };

        panel.innerHTML = '<div class="section">' +
            '<div class="section-title">\uD83D\uDC65 User-Verwaltung</div>' +
            '<div class="section-desc">Benutzer verwalten, Rollen zuweisen, Push-Listen erstellen</div>' +
            '<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin:12px 0">' +
                '<div style="text-align:center;padding:12px;background:var(--bg);border-radius:8px"><div style="font-size:24px;font-weight:900;color:#fa1e4e">' + stats.total + '</div><div style="font-size:9px;color:var(--muted)">GESAMT</div></div>' +
                '<div style="text-align:center;padding:12px;background:var(--bg);border-radius:8px"><div style="font-size:24px;font-weight:900;color:#fa1e4e">' + stats.superadmins + '</div><div style="font-size:9px;color:var(--muted)">SUPER ADMIN</div></div>' +
                '<div style="text-align:center;padding:12px;background:var(--bg);border-radius:8px"><div style="font-size:24px;font-weight:900;color:#FFB800">' + stats.admins + '</div><div style="font-size:9px;color:var(--muted)">ADMINS</div></div>' +
                '<div style="text-align:center;padding:12px;background:var(--bg);border-radius:8px"><div style="font-size:24px;font-weight:900;color:#a855f7">' + (stats.userplus || 0) + '</div><div style="font-size:9px;color:var(--muted)">USER+</div></div>' +
                '<div style="text-align:center;padding:12px;background:var(--bg);border-radius:8px"><div style="font-size:24px;font-weight:900;color:#55ACEE">' + stats.regularUsers + '</div><div style="font-size:9px;color:var(--muted)">USER</div></div>' +
            '</div></div>' +

            // Add User Form
            '<div class="section">' +
                '<div class="section-title">\u2795 Neuen User anlegen</div>' +
                '<div style="display:grid;grid-template-columns:1fr 1fr auto auto;gap:8px;align-items:end">' +
                    '<div><label style="font-size:9px;color:var(--muted)">Name</label><input id="au-name" type="text" placeholder="Max Mustermann" style="width:100%;padding:8px;background:var(--bg);border:1px solid var(--border);border-radius:6px;color:var(--text);font-size:12px"></div>' +
                    '<div><label style="font-size:9px;color:var(--muted)">Email</label><input id="au-email" type="email" placeholder="max@email.com" style="width:100%;padding:8px;background:var(--bg);border:1px solid var(--border);border-radius:6px;color:var(--text);font-size:12px"></div>' +
                    '<select id="au-role" style="padding:8px;background:var(--bg);border:1px solid var(--border);border-radius:6px;color:var(--text);font-size:12px"><option value="user">User</option><option value="userplus">User+</option><option value="admin">Admin</option></select>' +
                    '<button class="btn btn-accent" onclick="DkzAdminPanel.addUserFromForm()">Anlegen</button>' +
                '</div>' +
                '<div id="au-msg" style="font-size:11px;margin-top:6px"></div>' +
            '</div>' +

            // User List
            '<div class="section">' +
                '<div class="section-title">\uD83D\uDCCB User-Liste <span style="font-size:9px;color:var(--muted);font-weight:400">(' + users.length + ')</span></div>' +
                '<div style="margin-bottom:8px"><input id="user-search" type="text" placeholder="\uD83D\uDD0D Suchen..." oninput="DkzAdminPanel.filterUsers(this.value)" style="width:100%;padding:8px;background:var(--bg);border:1px solid var(--border);border-radius:6px;color:var(--text);font-size:12px"></div>' +
                '<div id="user-list-container">' + renderUserRows(users) + '</div>' +
            '</div>' +

            // Push-Listen
            '<div class="section">' +
                '<div class="section-title">\uD83D\uDCE7 Push-Listen Export</div>' +
                '<div class="section-desc">Email-Listen nach Gruppe exportieren (fuer Newsletter, Benachrichtigungen)</div>' +
                '<div style="display:flex;gap:8px;margin-top:8px;flex-wrap:wrap">' +
                    '<button class="btn" onclick="DkzAdminPanel.exportPush(\'all\')">Alle User</button>' +
                    '<button class="btn" onclick="DkzAdminPanel.exportPush(\'admin\')">Nur Admins</button>' +
                    '<button class="btn" onclick="DkzAdminPanel.exportPush(\'user\')">Nur User</button>' +
                    '<button class="btn btn-accent" onclick="DkzAdminPanel.exportPushCSV()">CSV Export</button>' +
                '</div>' +
                '<pre id="push-output" style="margin-top:8px;padding:10px;background:var(--bg);border-radius:8px;font-size:10px;color:var(--muted);max-height:200px;overflow:auto;display:none"></pre>' +
            '</div>' +

            // Info Popup
            '<div class="section" style="border-color:rgba(85,172,238,.2)">' +
                '<div class="section-title">\u2139\uFE0F Rollen-Guide</div>' +
                '<div style="font-size:11px;line-height:1.8;color:var(--muted)">' +
                    '<div>\uD83D\uDC51 <b style="color:#fa1e4e">Super Admin</b> — Voller System-Zugriff, kann Admins ernennen, System-Einstellungen aendern</div>' +
                    '<div>\uD83D\uDEE1\uFE0F <b style="color:#FFB800">Admin</b> — User verwalten, Features einstellen, kein System-Zugriff</div>' +
                    '<div>\u2B50 <b style="color:#a855f7">User+</b> — Vertrauens-Bonus: Erweiterte Einblicke, Personalisierung, Theme Editor</div>' +
                    '<div>\uD83D\uDC64 <b style="color:#55ACEE">User</b> — Nur freigeschaltete Features, kein Admin-Zugang</div>' +
                    '<div style="margin-top:6px">\u2B06 <b>Promote</b> = User \u2192 User+ \u2192 Admin (stufenweise)</div>' +
                    '<div>\u2B07 <b>Demote</b> = Admin \u2192 User+ \u2192 User (stufenweise)</div>' +
                '</div>' +
            '</div>';
    }

    function renderUserRows(users) {
        var roleColor = { superadmin: '#fa1e4e', admin: '#FFB800', user: '#55ACEE' };
        var roleIcon = { superadmin: '\uD83D\uDC51', admin: '\uD83D\uDEE1\uFE0F', user: '\uD83D\uDC64' };
        return users.map(function(u) {
            var isSA = u.role === 'superadmin';
            var canPromote = !isSA && u.role !== 'admin';
            var canDemote = !isSA && u.role !== 'user';
            var promoteLabel = u.role === 'user' ? '\u2B06 User+' : u.role === 'userplus' ? '\u2B06 Admin' : '';
            var demoteLabel = u.role === 'admin' ? '\u2B07 User+' : u.role === 'userplus' ? '\u2B07 User' : '';
            return '<div class="perm-row" data-user-name="' + esc(u.name).toLowerCase() + '" data-user-email="' + esc(u.email).toLowerCase() + '">' +
                '<span style="font-size:14px">' + (roleIcon[u.role] || '\uD83D\uDC64') + '</span>' +
                '<span style="flex:1;font-size:12px;font-weight:600">' + esc(u.name) + '</span>' +
                '<span style="font-size:10px;color:var(--muted)">' + esc(u.email) + '</span>' +
                '<span style="padding:2px 8px;border-radius:4px;font-size:9px;font-weight:700;background:' + roleColor[u.role] + '22;color:' + roleColor[u.role] + '">' + u.role.toUpperCase() + '</span>' +
                (canPromote ? '<button class="btn" style="font-size:9px;padding:4px 8px" onclick="DkzAdminPanel.promote(\'' + u.id + '\')">' + promoteLabel + '</button>' : '') +
                (canDemote ? '<button class="btn" style="font-size:9px;padding:4px 8px" onclick="DkzAdminPanel.demote(\'' + u.id + '\')">' + demoteLabel + '</button>' : '') +
                (!isSA ? '<button class="btn" style="font-size:9px;padding:4px 8px;color:#ff4444" onclick="DkzAdminPanel.archiveUser(\'' + u.id + '\')">\uD83D\uDDC4\uFE0F</button>' : '') +
            '</div>';
        }).join('');
    }

    // ═══════════════════════════════════════
    // FEATURE-SICHTBARKEIT PANEL
    // ═══════════════════════════════════════
    function renderFeaturesPanel(panel) {
        var users = DkzAuth.getUsers().filter(function(u) { return u.role !== 'superadmin'; });
        var features = DkzAuth.ALL_FEATURES;

        panel.innerHTML = '<div class="section">' +
            '<div class="section-title">\uD83D\uDEE1\uFE0F Feature-Sichtbarkeit</div>' +
            '<div class="section-desc">Einstellen welche Features fuer User/Admins sichtbar sind. Super Admin hat immer vollen Zugriff.</div>' +
            '</div>' +

            // Quick toggles per role
            '<div class="section">' +
                '<div class="section-title">\uD83C\uDFAB Rollen-Defaults</div>' +
                '<div class="section-desc">Standard-Features pro Rolle festlegen</div>' +
                '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:8px">' +
                    '<div style="background:var(--bg);border-radius:8px;padding:12px">' +
                        '<div style="font-size:12px;font-weight:700;color:#FFB800;margin-bottom:8px">\uD83D\uDEE1\uFE0F Admin-Standard</div>' +
                        features.map(function(f) {
                            var checked = DkzAuth.getRoleFeatures('admin').indexOf(f.id) !== -1 || DkzAuth.getRoleFeatures('admin') === '*';
                            return '<label style="display:flex;align-items:center;gap:6px;font-size:11px;padding:3px 0;cursor:pointer">' +
                                '<input type="checkbox" ' + (checked ? 'checked' : '') + ' onchange="DkzAdminPanel.toggleRoleFeature(\'admin\',\'' + f.id + '\',this.checked)" style="accent-color:#FFB800">' +
                                f.icon + ' ' + f.name + '</label>';
                        }).join('') +
                    '</div>' +
                    '<div style="background:var(--bg);border-radius:8px;padding:12px">' +
                        '<div style="font-size:12px;font-weight:700;color:#55ACEE;margin-bottom:8px">\uD83D\uDC64 User-Standard</div>' +
                        features.map(function(f) {
                            var checked = DkzAuth.getRoleFeatures('user').indexOf(f.id) !== -1;
                            return '<label style="display:flex;align-items:center;gap:6px;font-size:11px;padding:3px 0;cursor:pointer">' +
                                '<input type="checkbox" ' + (checked ? 'checked' : '') + ' onchange="DkzAdminPanel.toggleRoleFeature(\'user\',\'' + f.id + '\',this.checked)" style="accent-color:#55ACEE">' +
                                f.icon + ' ' + f.name + '</label>';
                        }).join('') +
                    '</div>' +
                '</div>' +
            '</div>' +

            // Per-user matrix
            (users.length > 0 ? '<div class="section">' +
                '<div class="section-title">\uD83D\uDC64 Pro-User Einstellungen</div>' +
                '<div style="overflow-x:auto"><table style="width:100%;border-collapse:collapse;font-size:11px">' +
                    '<tr style="border-bottom:1px solid var(--border)"><th style="text-align:left;padding:6px;color:var(--muted)">User</th>' +
                    features.map(function(f) { return '<th style="padding:4px;font-size:9px;writing-mode:vertical-rl;color:var(--muted)">' + f.icon + '</th>'; }).join('') + '</tr>' +
                    users.map(function(u) {
                        var userFeats = Array.isArray(u.features) ? u.features : [];
                        return '<tr style="border-bottom:1px solid rgba(255,255,255,.03)"><td style="padding:6px;font-weight:600">' + esc(u.name) + '</td>' +
                            features.map(function(f) {
                                var checked = userFeats.indexOf(f.id) !== -1;
                                return '<td style="text-align:center;padding:4px"><input type="checkbox" ' + (checked ? 'checked' : '') +
                                    ' onchange="DkzAdminPanel.toggleUserFeature(\'' + u.id + '\',\'' + f.id + '\',this.checked)" style="accent-color:var(--accent)"></td>';
                            }).join('') + '</tr>';
                    }).join('') +
                '</table></div></div>' : '') +

            // Info
            '<div class="section" style="border-color:rgba(85,172,238,.2)">' +
                '<div class="section-title">\u2139\uFE0F Feature-Guide</div>' +
                '<div style="font-size:11px;line-height:1.8;color:var(--muted)">' +
                    features.map(function(f) {
                        return '<div>' + f.icon + ' <b style="color:var(--text)">' + f.name + '</b> — ' + f.desc + '</div>';
                    }).join('') +
                '</div>' +
            '</div>';
    }

    // ═══════════════════════════════════════
    // SUPER ADMIN PANEL
    // ═══════════════════════════════════════
    function renderSysAdminPanel(panel) {
        var stats = DkzAuth.getStats();
        var logs = JSON.parse(localStorage.getItem('dkz-auth-log') || '[]').slice(-20).reverse();
        var archive = JSON.parse(localStorage.getItem('dkz-auth-archive') || '[]');

        panel.innerHTML = '<div class="section">' +
            '<div class="section-title">\uD83D\uDC51 Super Admin — System</div>' +
            '<div class="section-desc">Nur fuer dich, BAZE\u00B2. System-Einstellungen und Audit-Log.</div>' +
            '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin:12px 0">' +
                '<div style="text-align:center;padding:12px;background:var(--bg);border-radius:8px"><div style="font-size:24px;font-weight:900;color:#00ff88">' + stats.active + '</div><div style="font-size:9px;color:var(--muted)">AKTIV</div></div>' +
                '<div style="text-align:center;padding:12px;background:var(--bg);border-radius:8px"><div style="font-size:24px;font-weight:900;color:#ff4444">' + stats.archived + '</div><div style="font-size:9px;color:var(--muted)">ARCHIVIERT</div></div>' +
                '<div style="text-align:center;padding:12px;background:var(--bg);border-radius:8px"><div style="font-size:24px;font-weight:900;color:#a855f7">' + Object.keys(localStorage).length + '</div><div style="font-size:9px;color:var(--muted)">LS KEYS</div></div>' +
            '</div></div>' +

            // Audit Log
            '<div class="section">' +
                '<div class="section-title">\uD83D\uDCDC Audit-Log (letzte 20)</div>' +
                '<div style="font-family:monospace;font-size:10px;max-height:300px;overflow:auto">' +
                    logs.map(function(l) {
                        return '<div style="padding:3px 0;border-bottom:1px solid rgba(255,255,255,.03)">' +
                            '<span style="color:var(--muted)">' + esc(new Date(l.ts).toLocaleString('de-DE')) + '</span> ' +
                            '<span style="color:var(--text)">' + esc(l.msg) + '</span></div>';
                    }).join('') +
                '</div>' +
            '</div>' +

            // Archived Users
            (archive.length > 0 ? '<div class="section">' +
                '<div class="section-title">\uD83D\uDDC4\uFE0F Archivierte User (R100)</div>' +
                archive.map(function(u) {
                    return '<div class="perm-row"><span>\uD83D\uDC64</span><span style="flex:1">' + esc(u.name) + '</span><span style="color:var(--muted);font-size:10px">' + esc(u.email) + '</span>' +
                        '<span style="font-size:9px;color:#ff4444">Archiviert ' + (u.archivedAt || '').split('T')[0] + '</span></div>';
                }).join('') +
            '</div>' : '');
    }

    // ═══════════════════════════════════════
    // PUBLIC API (for onclick handlers)
    // ═══════════════════════════════════════
    window.DkzAdminPanel = {
        addUserFromForm: function() {
            var name = document.getElementById('au-name').value;
            var email = document.getElementById('au-email').value;
            var role = document.getElementById('au-role').value;
            var msg = document.getElementById('au-msg');
            if (!name || !email) { msg.innerHTML = '<span style="color:#ff4444">\u274C Name + Email erforderlich</span>'; return; }
            var result = DkzAuth.addUser(email, name, role);
            if (result.error) { msg.innerHTML = '<span style="color:#ff4444">\u274C ' + esc(result.error) + '</span>'; }
            else { msg.innerHTML = '<span style="color:#00ff88">\u2705 ' + esc(name) + ' angelegt als ' + esc(role) + '</span>'; renderUsersPanel(document.getElementById('panel-users')); }
        },
        promote: function(id) { DkzAuth.promoteUser(id); renderUsersPanel(document.getElementById('panel-users')); },
        demote: function(id) { DkzAuth.demoteUser(id); renderUsersPanel(document.getElementById('panel-users')); },
        archiveUser: function(id) {
            if (!confirm('User archivieren? (R100: Wird NICHT geloescht, nur archiviert)')) return;
            DkzAuth.removeUser(id); renderUsersPanel(document.getElementById('panel-users'));
        },
        filterUsers: function(q) {
            q = q.toLowerCase();
            document.querySelectorAll('#user-list-container .perm-row').forEach(function(row) {
                var name = row.getAttribute('data-user-name') || '';
                var email = row.getAttribute('data-user-email') || '';
                row.style.display = (name.indexOf(q) !== -1 || email.indexOf(q) !== -1) ? '' : 'none';
            });
        },
        exportPush: function(role) {
            var list = role === 'all' ? DkzAuth.exportPushList() : DkzAuth.exportPushList({ role: role });
            var out = document.getElementById('push-output');
            out.style.display = 'block';
            out.textContent = 'Gruppe: ' + (role || 'ALLE') + ' (' + list.count + ' User)\n\n' +
                list.users.map(function(u) { return u.name + ' <' + u.email + '> [' + u.role + ']'; }).join('\n') +
                '\n\n--- Emails ---\n' + list.emails.join(', ');
        },
        exportPushCSV: function() {
            var list = DkzAuth.exportPushList();
            var csv = 'Name,Email,Rolle\n' + list.users.map(function(u) { return u.name + ',' + u.email + ',' + u.role; }).join('\n');
            var blob = new Blob([csv], { type: 'text/csv' });
            var a = document.createElement('a');
            a.href = URL.createObjectURL(blob);
            a.download = 'dkz-push-liste-' + new Date().toISOString().split('T')[0] + '.csv';
            a.click();
        },
        toggleRoleFeature: function(role, featureId, enabled) {
            var features = DkzAuth.getRoleFeatures(role);
            if (!Array.isArray(features)) features = [];
            if (enabled && features.indexOf(featureId) === -1) features.push(featureId);
            else if (!enabled) features = features.filter(function(f) { return f !== featureId; });
            DkzAuth.setRoleFeatures(role, features);
        },
        toggleUserFeature: function(userId, featureId, enabled) {
            DkzAuth.setFeature(userId, featureId, enabled);
        }
    };
})();
