/**
 * DkZ Persist & Backup System v2.0
 * @DKZ:RULES -> R12 Kein Wissensverlust, R20 Dok-Pflicht
 * @version v2.0.0
 *
 * Dreistufiges Backup-System:
 * 1. Auto-Save: localStorage → Server (60s) + IndexedDB (5min)
 * 2. Cloud Backup: Google Drive (Apps Script) ODER Cloudflare R2
 * 3. Lokale DB: IndexedDB — Versionen, History, Offline-First
 *
 * Usage: <script src="../../shared/dkz-persist.js"></script>
 */

const DkzPersist = (() => {
    'use strict';

    const API = 'http://localhost:9880';
    const SAVE_INTERVAL = 60000;        // Auto-save localStorage → Server (60s)
    const LOCAL_DB_INTERVAL = 300000;   // Auto-save → IndexedDB (5min)
    const BACKUP_INTERVAL = 300000;     // Cloud backup (5min)
    let autoBackupTimer = null;
    let localDbTimer = null;
    let backupActive = false;

    // Aktiver Cloud-Provider: 'google-drive' | 'cloudflare-r2' | 'none'
    function getActiveProvider() {
        return localStorage.getItem('dkz-backup-provider') || 'none';
    }

    function setActiveProvider(provider) {
        localStorage.setItem('dkz-backup-provider', provider);
    }

    // ═══════════════════════════════════════
    // 1a. Auto-Save localStorage → Server
    // ═══════════════════════════════════════
    function collectLocalData() {
        const data = {};
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            // Keine sensiblen Keys exportieren
            if (key.startsWith('dkz-cf-secret') || key.startsWith('dkz-cf-access')) continue;
            try { data[key] = JSON.parse(localStorage.getItem(key)); }
            catch { data[key] = localStorage.getItem(key); }
        }
        return data;
    }

    function collectSystemData() {
        return {
            timestamp: new Date().toISOString(),
            version: 'v2.0.0',
            prompts: localStorage.getItem('dkz-prompts'),
            skills: localStorage.getItem('dkz-skills'),
            personalizations: localStorage.getItem('dkz-personalizations'),
            settings: localStorage.getItem('dkz-settings'),
            snippets: localStorage.getItem('dkz-snippets'),
            pendingIssues: localStorage.getItem('dkz-pending-issues'),
            history: localStorage.getItem('dkz-history'),
            preferences: localStorage.getItem('dkz-preferences'),
            shortcuts: localStorage.getItem('dkz-shortcuts')
        };
    }

    async function autoSave() {
        const data = collectLocalData();
        if (Object.keys(data).length === 0) return;

        try {
            await fetch(`${API}/user/persist`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + (sessionStorage.getItem('dkz-api-key') || '')
                },
                body: JSON.stringify({
                    userId: sessionStorage.getItem('dkz-user-id') || 'anonymous',
                    timestamp: new Date().toISOString(),
                    data: data,
                    keys: Object.keys(data).length
                })
            });
        } catch { /* offline — data stays in localStorage */ }
    }

    async function loadSaved() {
        try {
            const res = await fetch(`${API}/user/persist`, {
                headers: { 'Authorization': 'Bearer ' + (sessionStorage.getItem('dkz-api-key') || '') }
            });
            if (res.ok) {
                const saved = await res.json();
                if (saved && saved.data) {
                    for (const [key, val] of Object.entries(saved.data)) {
                        if (!localStorage.getItem(key)) {
                            localStorage.setItem(key, typeof val === 'string' ? val : JSON.stringify(val));
                        }
                    }
                    return true;
                }
            }
        } catch { /* offline */ }
        return false;
    }

    // ═══════════════════════════════════════
    // 1b. IndexedDB — Lokale Datenbank
    // ═══════════════════════════════════════
    const DB_NAME = 'dkz-backup-db';
    const DB_VERSION = 1;
    const STORE_NAME = 'backups';
    const MAX_LOCAL_BACKUPS = 50;

    function openDB() {
        return new Promise((resolve, reject) => {
            const req = indexedDB.open(DB_NAME, DB_VERSION);
            req.onupgradeneeded = (e) => {
                const db = e.target.result;
                if (!db.objectStoreNames.contains(STORE_NAME)) {
                    const store = db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
                    store.createIndex('timestamp', 'timestamp');
                    store.createIndex('provider', 'provider');
                }
            };
            req.onsuccess = () => resolve(req.result);
            req.onerror = () => reject(req.error);
        });
    }

    async function saveToLocal(data, provider = 'local') {
        try {
            const db = await openDB();
            const tx = db.transaction(STORE_NAME, 'readwrite');
            const store = tx.objectStore(STORE_NAME);

            store.add({
                timestamp: new Date().toISOString(),
                provider,
                keys: Object.keys(data).length,
                size: JSON.stringify(data).length,
                data
            });

            // Alte Backups aufräumen (max 50)
            const countReq = store.count();
            countReq.onsuccess = () => {
                if (countReq.result > MAX_LOCAL_BACKUPS) {
                    const cursorReq = store.openCursor();
                    let toDelete = countReq.result - MAX_LOCAL_BACKUPS;
                    cursorReq.onsuccess = (e) => {
                        const cursor = e.target.result;
                        if (cursor && toDelete > 0) {
                            cursor.delete();
                            toDelete--;
                            cursor.continue();
                        }
                    };
                }
            };

            return new Promise((resolve, reject) => {
                tx.oncomplete = () => { db.close(); resolve(true); };
                tx.onerror = () => { db.close(); reject(tx.error); };
            });
        } catch (e) {
            console.warn('[DkZ Persist] IndexedDB Fehler:', e.message);
            return false;
        }
    }

    async function getLocalBackups(limit = 10) {
        try {
            const db = await openDB();
            const tx = db.transaction(STORE_NAME, 'readonly');
            const store = tx.objectStore(STORE_NAME);
            const all = [];

            return new Promise((resolve) => {
                store.openCursor(null, 'prev').onsuccess = (e) => {
                    const cursor = e.target.result;
                    if (cursor && all.length < limit) {
                        all.push({
                            id: cursor.value.id,
                            timestamp: cursor.value.timestamp,
                            provider: cursor.value.provider,
                            keys: cursor.value.keys,
                            size: cursor.value.size || 0
                        });
                        cursor.continue();
                    } else {
                        db.close();
                        resolve(all);
                    }
                };
            });
        } catch {
            return [];
        }
    }

    async function getLocalBackupCount() {
        try {
            const db = await openDB();
            const tx = db.transaction(STORE_NAME, 'readonly');
            return new Promise((resolve) => {
                tx.objectStore(STORE_NAME).count().onsuccess = (e) => {
                    db.close();
                    resolve(e.target.result);
                };
            });
        } catch { return 0; }
    }

    async function restoreFromLocal(id) {
        try {
            const db = await openDB();
            const tx = db.transaction(STORE_NAME, 'readonly');
            return new Promise((resolve) => {
                tx.objectStore(STORE_NAME).get(id).onsuccess = (e) => {
                    db.close();
                    const backup = e.target.result;
                    if (backup && backup.data) {
                        for (const [key, val] of Object.entries(backup.data)) {
                            localStorage.setItem(key, typeof val === 'string' ? val : JSON.stringify(val));
                        }
                        resolve({ ok: true, restored: Object.keys(backup.data).length, timestamp: backup.timestamp });
                    } else {
                        resolve({ ok: false, error: 'Backup nicht gefunden' });
                    }
                };
            });
        } catch (e) {
            return { ok: false, error: e.message };
        }
    }

    async function autoSaveToLocal() {
        const data = collectSystemData();
        await saveToLocal(data, 'auto-local');
    }

    // ═══════════════════════════════════════
    // 2a. Google Drive Backup (via Apps Script)
    // ═══════════════════════════════════════
    const APPS_SCRIPT_URL = '';

    async function backupToDrive() {
        const scriptUrl = localStorage.getItem('dkz-apps-script-url') || APPS_SCRIPT_URL;
        if (!scriptUrl) return { ok: false, error: 'Apps Script URL nicht konfiguriert' };

        const systemData = collectSystemData();

        try {
            await fetch(scriptUrl, {
                method: 'POST',
                mode: 'no-cors',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'backup', data: systemData })
            });
            await saveToLocal(systemData, 'google-drive');
            return { ok: true };
        } catch (e) {
            return { ok: false, error: e.message };
        }
    }

    async function importFromDrive() {
        const scriptUrl = localStorage.getItem('dkz-apps-script-url') || APPS_SCRIPT_URL;
        if (!scriptUrl) return { ok: false, error: 'Apps Script URL nicht konfiguriert' };

        try {
            const res = await fetch(`${scriptUrl}?action=restore`, { mode: 'cors' });
            if (res.ok) {
                const backup = await res.json();
                if (backup && backup.data) {
                    for (const [key, val] of Object.entries(backup.data)) {
                        if (val !== null && val !== undefined) {
                            localStorage.setItem(`dkz-${key}`, typeof val === 'string' ? val : JSON.stringify(val));
                        }
                    }
                    return { ok: true, restored: Object.keys(backup.data).length };
                }
            }
            return { ok: false, error: 'Kein Backup gefunden' };
        } catch (e) {
            return { ok: false, error: e.message };
        }
    }

    // ═══════════════════════════════════════
    // 2b. Cloudflare R2 Backup (S3-kompatibel)
    // ═══════════════════════════════════════
    function getCfConfig() {
        return {
            accountId: localStorage.getItem('dkz-cf-account-id') || '',
            accessKey: localStorage.getItem('dkz-cf-access-key') || '',
            secretKey: localStorage.getItem('dkz-cf-secret-key') || '',
            bucket: localStorage.getItem('dkz-cf-bucket') || 'dkz-backups'
        };
    }

    function saveCfConfig(config) {
        localStorage.setItem('dkz-cf-account-id', config.accountId);
        localStorage.setItem('dkz-cf-access-key', config.accessKey);
        localStorage.setItem('dkz-cf-secret-key', config.secretKey);
        localStorage.setItem('dkz-cf-bucket', config.bucket);
    }

    function isCfConfigured() {
        const cfg = getCfConfig();
        return !!(cfg.accountId && cfg.accessKey && cfg.secretKey);
    }

    async function backupToR2() {
        const cfg = getCfConfig();
        if (!cfg.accountId || !cfg.accessKey || !cfg.secretKey) {
            return { ok: false, error: 'Cloudflare R2 nicht konfiguriert — Account ID, Access Key und Secret Key benötigt' };
        }

        const data = collectSystemData();
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const key = `backups/dkz-backup-${timestamp}.json`;
        const body = JSON.stringify({
            timestamp: new Date().toISOString(),
            version: 'v2.0.0',
            data,
            keys: Object.keys(data).length
        });

        // Upload via ONTHERUN™ Proxy (S3 Signature Server-Side)
        try {
            const res = await fetch(`${API}/backup/r2`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + (sessionStorage.getItem('dkz-api-key') || '')
                },
                body: JSON.stringify({
                    accountId: cfg.accountId,
                    accessKey: cfg.accessKey,
                    secretKey: cfg.secretKey,
                    bucket: cfg.bucket,
                    key,
                    data: body
                })
            });

            if (res.ok) {
                await saveToLocal(data, 'cloudflare-r2');
                return { ok: true, key, bucket: cfg.bucket };
            }
            // Proxy nicht erreichbar → Fallback: Direct R2 API
            return await backupToR2Direct(cfg, key, body);
        } catch {
            // ONTHERUN™ offline → Direct Upload versuchen
            return await backupToR2Direct(cfg, key, body);
        }
    }

    async function backupToR2Direct(cfg, key, body) {
        // Direct Upload via Cloudflare R2 REST API (PUT mit Token Auth)
        const endpoint = `https://${cfg.accountId}.r2.cloudflarestorage.com/${cfg.bucket}/${key}`;

        try {
            const res = await fetch(endpoint, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Custom-Auth-Key': cfg.accessKey
                },
                body
            });

            if (res.ok || res.status === 200) {
                const data = collectSystemData();
                await saveToLocal(data, 'cloudflare-r2');
                return { ok: true, key, bucket: cfg.bucket };
            }
            // Auch fehlgeschlagen → Lokal speichern
            const data = collectSystemData();
            await saveToLocal(data, 'r2-pending');
            return { ok: false, error: `R2 Upload fehlgeschlagen (${res.status}) — lokal gesichert` };
        } catch (e) {
            const data = collectSystemData();
            await saveToLocal(data, 'r2-pending');
            return { ok: false, error: `R2 nicht erreichbar — lokal gesichert: ${e.message}` };
        }
    }

    async function listR2Backups() {
        const cfg = getCfConfig();
        if (!cfg.accountId || !cfg.accessKey) return [];

        try {
            const res = await fetch(`${API}/backup/r2/list`, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + (sessionStorage.getItem('dkz-api-key') || '')
                }
            });
            if (res.ok) return await res.json();
        } catch { /* offline */ }
        return [];
    }

    // ═══════════════════════════════════════
    // 3. Auto-Backup (Cloud — Provider-basiert)
    // ═══════════════════════════════════════
    function startAutoBackup() {
        backupActive = true;
        localStorage.setItem('dkz-auto-backup', 'true');
        autoBackupTimer = setInterval(async () => {
            const provider = getActiveProvider();
            if (provider === 'google-drive') await backupToDrive();
            else if (provider === 'cloudflare-r2') await backupToR2();
        }, BACKUP_INTERVAL);
    }

    function stopAutoBackup() {
        backupActive = false;
        localStorage.setItem('dkz-auto-backup', 'false');
        if (autoBackupTimer) clearInterval(autoBackupTimer);
    }

    function startLocalAutoSave() {
        localDbTimer = setInterval(autoSaveToLocal, LOCAL_DB_INTERVAL);
    }

    // ═══════════════════════════════════════
    // 4. UI — Erweiterbares Backup-Panel
    // ═══════════════════════════════════════
    function esc(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    function injectToolbar() {
        const header = document.querySelector('header, .header, nav, [class*="header"]');
        if (!header) return;

        // Support Button
        const supportBtn = document.createElement('button');
        supportBtn.id = 'dkz-support-btn';
        supportBtn.innerHTML = '💬 Support';
        supportBtn.title = 'Feedback & Verbesserungsvorschläge';
        Object.assign(supportBtn.style, {
            background: 'rgba(99,102,241,0.08)',
            color: '#818cf8',
            border: '1px solid rgba(99,102,241,0.2)',
            padding: '4px 12px',
            borderRadius: '6px',
            cursor: 'pointer',
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: '0.7rem',
            fontWeight: '600',
            transition: 'all 0.2s',
            marginLeft: '6px'
        });
        supportBtn.addEventListener('click', openSupportPanel);
        header.appendChild(supportBtn);

        // Backup Button
        const backupBtn = document.createElement('button');
        backupBtn.id = 'dkz-backup-btn';
        backupBtn.innerHTML = '☁️ Backup';
        backupBtn.title = 'Backup-Manager — Lokal / Google Drive / Cloudflare R2';
        const isActive = localStorage.getItem('dkz-auto-backup') === 'true';
        const provider = getActiveProvider();
        const providerColor = provider === 'cloudflare-r2' ? '#f6821f' :
                              provider === 'google-drive' ? '#00ff88' : '#52525b';
        Object.assign(backupBtn.style, {
            background: isActive ? `rgba(${provider === 'cloudflare-r2' ? '246,130,31' : '0,255,136'},0.08)` : 'rgba(255,255,255,0.03)',
            color: isActive ? providerColor : '#52525b',
            border: `1px solid ${isActive ? `rgba(${provider === 'cloudflare-r2' ? '246,130,31' : '0,255,136'},0.2)` : 'rgba(255,255,255,0.06)'}`,
            padding: '4px 12px',
            borderRadius: '6px',
            cursor: 'pointer',
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: '0.7rem',
            fontWeight: '600',
            transition: 'all 0.2s',
            marginLeft: '6px'
        });
        backupBtn.addEventListener('click', openBackupPanel);
        header.appendChild(backupBtn);

        if (isActive) startAutoBackup();
    }

    function openSupportPanel() {
        const existing = document.getElementById('dkz-support-panel');
        if (existing) { existing.remove(); return; }

        const panel = document.createElement('div');
        panel.id = 'dkz-support-panel';
        panel.innerHTML = `
            <div style="background:#111116;border:1px solid rgba(99,102,241,0.3);border-radius:12px;padding:24px;max-width:440px;width:90%;position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);z-index:100000;box-shadow:0 20px 60px rgba(0,0,0,0.6);font-family:'Inter',sans-serif">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px">
                    <h3 style="font-size:1rem;font-weight:700;color:#f0f0f2">💬 Support & Feedback</h3>
                    <button onclick="document.getElementById('dkz-support-panel').remove()" style="background:none;border:none;color:#71717a;cursor:pointer;font-size:1.2rem">✕</button>
                </div>

                <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:12px">
                    <button onclick="document.getElementById('dkz-fb-type').value='anregung'" style="padding:10px;background:rgba(0,255,136,0.06);border:1px solid rgba(0,255,136,0.15);border-radius:8px;cursor:pointer;text-align:center">
                        <div style="font-size:1.2rem">💡</div>
                        <div style="font-size:.7rem;color:#00ff88">Anregung</div>
                    </button>
                    <button onclick="document.getElementById('dkz-fb-type').value='verbesserung'" style="padding:10px;background:rgba(99,102,241,0.06);border:1px solid rgba(99,102,241,0.15);border-radius:8px;cursor:pointer;text-align:center">
                        <div style="font-size:1.2rem">🔧</div>
                        <div style="font-size:.7rem;color:#818cf8">Verbesserung</div>
                    </button>
                </div>

                <input type="hidden" id="dkz-fb-type" value="anregung">
                <input id="dkz-fb-email" type="email" placeholder="E-Mail Adresse..." style="width:100%;padding:8px 12px;background:#1a1a20;border:1px solid rgba(255,255,255,0.06);border-radius:6px;color:#f0f0f2;font-family:'Inter',sans-serif;font-size:.8rem;margin-bottom:8px;outline:none;box-sizing:border-box">
                <input id="dkz-fb-module" type="text" value="${esc(document.title)}" readonly style="width:100%;padding:8px 12px;background:#0e0e10;border:1px solid rgba(255,255,255,0.04);border-radius:6px;color:#71717a;font-family:'Inter',sans-serif;font-size:.75rem;margin-bottom:8px;outline:none;box-sizing:border-box">
                <textarea id="dkz-fb-message" placeholder="Dein Feedback..." rows="4" style="width:100%;padding:8px 12px;background:#1a1a20;border:1px solid rgba(255,255,255,0.06);border-radius:6px;color:#f0f0f2;font-family:'Inter',sans-serif;font-size:.8rem;margin-bottom:12px;outline:none;resize:vertical;box-sizing:border-box"></textarea>
                <button id="dkz-fb-submit" style="width:100%;padding:10px;background:linear-gradient(135deg,#6366f1,#818cf8);color:white;border:none;border-radius:8px;cursor:pointer;font-weight:600;font-size:.8rem">📨 Feedback senden</button>
                <div id="dkz-fb-status" style="margin-top:8px;font-size:.7rem;text-align:center;color:#71717a"></div>
            </div>
            <div style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.6);z-index:99999" onclick="document.getElementById('dkz-support-panel').remove()"></div>
        `;
        document.body.appendChild(panel);
        document.getElementById('dkz-fb-submit').addEventListener('click', submitFeedback);
    }

    async function submitFeedback() {
        const email = document.getElementById('dkz-fb-email').value;
        const message = document.getElementById('dkz-fb-message').value;
        const type = document.getElementById('dkz-fb-type').value;
        const module = document.getElementById('dkz-fb-module').value;
        const status = document.getElementById('dkz-fb-status');

        if (!message) { status.textContent = '❌ Nachricht eingeben'; status.style.color = '#fa1e4e'; return; }

        status.textContent = '⏳ Sende...'; status.style.color = '#71717a';

        const feedback = {
            type, email, module, message,
            url: window.location.href,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent.slice(0, 100)
        };

        try {
            const res = await fetch(`${API}/support/feedback`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(feedback)
            });
            if (res.ok) {
                status.textContent = '✅ Danke für dein Feedback!';
                status.style.color = '#00ff88';
                setTimeout(() => document.getElementById('dkz-support-panel')?.remove(), 2000);
            } else {
                saveFeedbackLocal(feedback);
                status.textContent = '📋 Lokal gespeichert (Backend offline)';
                status.style.color = '#ffab40';
            }
        } catch {
            saveFeedbackLocal(feedback);
            status.textContent = '📋 Lokal gespeichert (Backend offline)';
            status.style.color = '#ffab40';
        }
    }

    function saveFeedbackLocal(fb) {
        const list = JSON.parse(localStorage.getItem('dkz-pending-feedback') || '[]');
        list.push(fb);
        localStorage.setItem('dkz-pending-feedback', JSON.stringify(list));
    }

    // ═══════════════════════════════════════
    // 5. Backup Panel — 3 Tabs
    // ═══════════════════════════════════════
    async function openBackupPanel() {
        const existing = document.getElementById('dkz-backup-panel');
        if (existing) { existing.remove(); return; }

        const provider = getActiveProvider();
        const isAuto = localStorage.getItem('dkz-auto-backup') === 'true';
        const cfCfg = getCfConfig();
        const localCount = await getLocalBackupCount();
        const localBackups = await getLocalBackups(8);

        const panel = document.createElement('div');
        panel.id = 'dkz-backup-panel';

        // Backup-Liste HTML generieren
        let localListHtml = '';
        if (localBackups.length === 0) {
            localListHtml = '<div style="text-align:center;color:#52525b;font-size:.7rem;padding:16px">Noch keine lokalen Backups</div>';
        } else {
            localListHtml = localBackups.map(b => {
                const date = new Date(b.timestamp);
                const timeStr = date.toLocaleDateString('de-DE') + ' ' + date.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
                const sizeStr = b.size ? `${(b.size / 1024).toFixed(1)} KB` : '—';
                const provIcons = { 'auto-local': '💾', 'google-drive': '📁', 'cloudflare-r2': '☁️', 'r2-pending': '⏳', 'local': '📦' };
                const icon = provIcons[b.provider] || '📦';
                return `<div style="display:flex;justify-content:space-between;align-items:center;padding:6px 8px;background:rgba(255,255,255,0.02);border-radius:6px;margin-bottom:4px">
                    <div style="display:flex;align-items:center;gap:8px">
                        <span style="font-size:.9rem">${icon}</span>
                        <div>
                            <div style="font-size:.7rem;color:#e8e8ec">${esc(timeStr)}</div>
                            <div style="font-size:.6rem;color:#52525b">${esc(b.provider)} · ${b.keys} Keys · ${esc(sizeStr)}</div>
                        </div>
                    </div>
                    <button data-restore-id="${b.id}" class="dkz-bk-restore-btn" style="background:rgba(99,102,241,0.1);color:#818cf8;border:1px solid rgba(99,102,241,0.2);border-radius:4px;padding:2px 8px;cursor:pointer;font-size:.6rem;font-weight:600">Restore</button>
                </div>`;
            }).join('');
        }

        panel.innerHTML = `
            <div style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.6);z-index:99999" onclick="document.getElementById('dkz-backup-panel').remove()"></div>
            <div style="background:#111116;border:1px solid rgba(250,30,78,0.15);border-radius:16px;padding:0;max-width:520px;width:92%;position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);z-index:100000;box-shadow:0 24px 80px rgba(0,0,0,0.7);font-family:'Inter',sans-serif;overflow:hidden">

                <!-- Header -->
                <div style="display:flex;justify-content:space-between;align-items:center;padding:20px 24px 12px">
                    <div>
                        <h3 style="font-size:1.05rem;font-weight:700;color:#f0f0f2;margin:0">☁️ Backup Manager</h3>
                        <div style="font-size:.65rem;color:#52525b;margin-top:2px">${localCount} lokale Backups · Provider: ${esc(provider === 'none' ? 'Keiner' : provider)}</div>
                    </div>
                    <button onclick="document.getElementById('dkz-backup-panel').remove()" style="background:none;border:none;color:#71717a;cursor:pointer;font-size:1.3rem;line-height:1">✕</button>
                </div>

                <!-- Tabs -->
                <div id="dkz-bk-tabs" style="display:flex;border-bottom:1px solid rgba(255,255,255,0.06);padding:0 24px;gap:0">
                    <button data-tab="local" class="dkz-bk-tab" style="flex:1;padding:10px 0;font-size:.75rem;font-weight:600;color:#818cf8;background:none;border:none;border-bottom:2px solid #818cf8;cursor:pointer;font-family:'Inter',sans-serif;transition:all 0.2s">💾 Lokal</button>
                    <button data-tab="gdrive" class="dkz-bk-tab" style="flex:1;padding:10px 0;font-size:.75rem;font-weight:600;color:#52525b;background:none;border:none;border-bottom:2px solid transparent;cursor:pointer;font-family:'Inter',sans-serif;transition:all 0.2s">📁 Google Drive</button>
                    <button data-tab="r2" class="dkz-bk-tab" style="flex:1;padding:10px 0;font-size:.75rem;font-weight:600;color:#52525b;background:none;border:none;border-bottom:2px solid transparent;cursor:pointer;font-family:'Inter',sans-serif;transition:all 0.2s">☁️ Cloudflare R2</button>
                </div>

                <!-- Tab Content: Lokal -->
                <div id="dkz-bk-tab-local" class="dkz-bk-content" style="padding:16px 24px 20px;display:block">
                    <div style="display:flex;gap:8px;margin-bottom:12px">
                        <button id="dkz-bk-local-save" style="flex:1;padding:10px;background:rgba(99,102,241,0.08);border:1px solid rgba(99,102,241,0.2);border-radius:8px;cursor:pointer;text-align:center;transition:all 0.2s">
                            <div style="font-size:1.2rem">📦</div>
                            <div style="font-size:.7rem;font-weight:600;color:#818cf8">Jetzt sichern</div>
                        </button>
                        <button id="dkz-bk-local-export" style="flex:1;padding:10px;background:rgba(0,255,136,0.06);border:1px solid rgba(0,255,136,0.15);border-radius:8px;cursor:pointer;text-align:center;transition:all 0.2s">
                            <div style="font-size:1.2rem">📥</div>
                            <div style="font-size:.7rem;font-weight:600;color:#00ff88">JSON Export</div>
                        </button>
                    </div>
                    <div style="font-size:.7rem;color:#71717a;margin-bottom:6px;font-weight:600">Letzte Backups (${localCount} gesamt):</div>
                    <div id="dkz-bk-local-list" style="max-height:200px;overflow-y:auto;scrollbar-width:thin">${localListHtml}</div>
                    <div id="dkz-bk-local-status" style="font-size:.7rem;text-align:center;color:#71717a;margin-top:8px"></div>
                </div>

                <!-- Tab Content: Google Drive -->
                <div id="dkz-bk-tab-gdrive" class="dkz-bk-content" style="padding:16px 24px 20px;display:none">
                    <p style="font-size:.7rem;color:#71717a;margin:0 0 12px">Sichert auf Google Drive via Apps Script</p>
                    <div style="background:#0a0a0e;border-radius:8px;padding:12px;border:1px solid rgba(255,255,255,0.04);margin-bottom:12px">
                        <label style="font-size:.65rem;color:#52525b;display:block;margin-bottom:4px">Google Apps Script URL:</label>
                        <input id="dkz-bk-gdrive-url" type="url" value="${esc(localStorage.getItem('dkz-apps-script-url') || '')}" placeholder="https://script.google.com/macros/s/..." style="width:100%;padding:8px 10px;background:#1a1a20;border:1px solid rgba(255,255,255,0.06);border-radius:6px;color:#f0f0f2;font-family:'JetBrains Mono',monospace;font-size:.65rem;outline:none;box-sizing:border-box">
                    </div>
                    <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin-bottom:12px">
                        <button id="dkz-bk-gdrive-manual" style="padding:12px 8px;background:rgba(250,200,50,0.06);border:1px solid rgba(250,200,50,0.15);border-radius:8px;cursor:pointer;text-align:center">
                            <div style="font-size:1rem">📦</div>
                            <div style="font-size:.65rem;font-weight:600;color:#fac832">Manuell</div>
                        </button>
                        <button id="dkz-bk-gdrive-auto" style="padding:12px 8px;background:${provider === 'google-drive' && isAuto ? 'rgba(0,255,136,0.08)' : 'rgba(250,200,50,0.06)'};border:1px solid ${provider === 'google-drive' && isAuto ? 'rgba(0,255,136,0.2)' : 'rgba(250,200,50,0.15)'};border-radius:8px;cursor:pointer;text-align:center">
                            <div style="font-size:1rem">${provider === 'google-drive' && isAuto ? '✅' : '🔄'}</div>
                            <div style="font-size:.65rem;font-weight:600;color:${provider === 'google-drive' && isAuto ? '#00ff88' : '#fac832'}">${provider === 'google-drive' && isAuto ? 'Auto AN' : 'Auto'}</div>
                        </button>
                        <button id="dkz-bk-gdrive-import" style="padding:12px 8px;background:rgba(99,102,241,0.08);border:1px solid rgba(99,102,241,0.2);border-radius:8px;cursor:pointer;text-align:center">
                            <div style="font-size:1rem">📥</div>
                            <div style="font-size:.65rem;font-weight:600;color:#818cf8">Import</div>
                        </button>
                    </div>
                    <div id="dkz-bk-gdrive-status" style="font-size:.7rem;text-align:center;color:#71717a"></div>
                </div>

                <!-- Tab Content: Cloudflare R2 -->
                <div id="dkz-bk-tab-r2" class="dkz-bk-content" style="padding:16px 24px 20px;display:none">
                    <p style="font-size:.7rem;color:#71717a;margin:0 0 4px">Sichert auf Cloudflare R2 (S3-kompatibel)</p>
                    <p style="font-size:.6rem;color:#52525b;margin:0 0 12px">Dashboard → R2 → Manage API Tokens → Create API Token</p>

                    <div style="background:#0a0a0e;border-radius:8px;padding:12px;border:1px solid rgba(255,255,255,0.04);margin-bottom:12px;display:grid;gap:8px">
                        <div>
                            <label style="font-size:.6rem;color:#52525b;display:block;margin-bottom:2px">Account ID</label>
                            <input id="dkz-bk-r2-account" type="text" value="${esc(cfCfg.accountId)}" placeholder="Cloudflare Account ID" style="width:100%;padding:6px 10px;background:#1a1a20;border:1px solid rgba(255,255,255,0.06);border-radius:4px;color:#f0f0f2;font-family:'JetBrains Mono',monospace;font-size:.65rem;outline:none;box-sizing:border-box">
                        </div>
                        <div>
                            <label style="font-size:.6rem;color:#52525b;display:block;margin-bottom:2px">Access Key ID</label>
                            <input id="dkz-bk-r2-access" type="text" value="${esc(cfCfg.accessKey)}" placeholder="S3 Access Key ID" style="width:100%;padding:6px 10px;background:#1a1a20;border:1px solid rgba(255,255,255,0.06);border-radius:4px;color:#f0f0f2;font-family:'JetBrains Mono',monospace;font-size:.65rem;outline:none;box-sizing:border-box">
                        </div>
                        <div>
                            <label style="font-size:.6rem;color:#52525b;display:block;margin-bottom:2px">Secret Access Key</label>
                            <input id="dkz-bk-r2-secret" type="password" value="${esc(cfCfg.secretKey)}" placeholder="S3 Secret Access Key" style="width:100%;padding:6px 10px;background:#1a1a20;border:1px solid rgba(255,255,255,0.06);border-radius:4px;color:#f0f0f2;font-family:'JetBrains Mono',monospace;font-size:.65rem;outline:none;box-sizing:border-box">
                        </div>
                        <div>
                            <label style="font-size:.6rem;color:#52525b;display:block;margin-bottom:2px">Bucket Name</label>
                            <input id="dkz-bk-r2-bucket" type="text" value="${esc(cfCfg.bucket)}" placeholder="dkz-backups" style="width:100%;padding:6px 10px;background:#1a1a20;border:1px solid rgba(255,255,255,0.06);border-radius:4px;color:#f0f0f2;font-family:'JetBrains Mono',monospace;font-size:.65rem;outline:none;box-sizing:border-box">
                        </div>
                        <button id="dkz-bk-r2-save-cfg" style="padding:8px;background:rgba(246,130,31,0.1);color:#f6821f;border:1px solid rgba(246,130,31,0.2);border-radius:6px;cursor:pointer;font-size:.7rem;font-weight:600;transition:all 0.2s">💾 Credentials speichern</button>
                    </div>

                    <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:12px">
                        <button id="dkz-bk-r2-manual" style="padding:12px;background:rgba(246,130,31,0.06);border:1px solid rgba(246,130,31,0.15);border-radius:8px;cursor:pointer;text-align:center;${!isCfConfigured() ? 'opacity:0.4;pointer-events:none' : ''}">
                            <div style="font-size:1.2rem">🚀</div>
                            <div style="font-size:.7rem;font-weight:600;color:#f6821f">Jetzt hochladen</div>
                        </button>
                        <button id="dkz-bk-r2-auto" style="padding:12px;background:${provider === 'cloudflare-r2' && isAuto ? 'rgba(0,255,136,0.08)' : 'rgba(246,130,31,0.06)'};border:1px solid ${provider === 'cloudflare-r2' && isAuto ? 'rgba(0,255,136,0.2)' : 'rgba(246,130,31,0.15)'};border-radius:8px;cursor:pointer;text-align:center;${!isCfConfigured() ? 'opacity:0.4;pointer-events:none' : ''}">
                            <div style="font-size:1.2rem">${provider === 'cloudflare-r2' && isAuto ? '✅' : '🔄'}</div>
                            <div style="font-size:.7rem;font-weight:600;color:${provider === 'cloudflare-r2' && isAuto ? '#00ff88' : '#f6821f'}">${provider === 'cloudflare-r2' && isAuto ? 'Auto AN' : 'Auto-Backup'}</div>
                        </button>
                    </div>
                    <div id="dkz-bk-r2-status" style="font-size:.7rem;text-align:center;color:#71717a"></div>
                </div>
            </div>
        `;

        document.body.appendChild(panel);
        bindBackupPanelEvents();
    }

    function bindBackupPanelEvents() {
        // Tab switching
        document.querySelectorAll('.dkz-bk-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                document.querySelectorAll('.dkz-bk-tab').forEach(t => {
                    t.style.color = '#52525b';
                    t.style.borderBottomColor = 'transparent';
                });
                tab.style.color = '#818cf8';
                tab.style.borderBottomColor = '#818cf8';

                document.querySelectorAll('.dkz-bk-content').forEach(c => c.style.display = 'none');
                const target = tab.getAttribute('data-tab');
                const el = document.getElementById(`dkz-bk-tab-${target}`);
                if (el) el.style.display = 'block';
            });
        });

        // === Lokal ===
        document.getElementById('dkz-bk-local-save')?.addEventListener('click', async () => {
            const status = document.getElementById('dkz-bk-local-status');
            status.textContent = '⏳ Speichere in IndexedDB...';
            status.style.color = '#71717a';
            const data = collectSystemData();
            const ok = await saveToLocal(data, 'manual');
            status.textContent = ok ? '✅ Lokal gespeichert!' : '⚠️ IndexedDB Fehler';
            status.style.color = ok ? '#00ff88' : '#fa1e4e';
            if (ok) refreshLocalList();
        });

        document.getElementById('dkz-bk-local-export')?.addEventListener('click', async () => {
            const data = collectSystemData();
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `dkz-backup-${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
            a.click();
            URL.revokeObjectURL(url);
            const status = document.getElementById('dkz-bk-local-status');
            status.textContent = '✅ JSON exportiert!';
            status.style.color = '#00ff88';
        });

        // Restore buttons
        document.querySelectorAll('.dkz-bk-restore-btn').forEach(btn => {
            btn.addEventListener('click', async () => {
                const id = parseInt(btn.getAttribute('data-restore-id'));
                const status = document.getElementById('dkz-bk-local-status');
                if (!confirm('Backup wiederherstellen? Aktuelle Daten werden überschrieben.')) return;
                status.textContent = '⏳ Stelle wieder her...';
                const result = await restoreFromLocal(id);
                status.textContent = result.ok
                    ? `✅ ${result.restored} Einträge wiederhergestellt (${new Date(result.timestamp).toLocaleString('de-DE')})`
                    : `⚠️ ${result.error}`;
                status.style.color = result.ok ? '#00ff88' : '#fa1e4e';
            });
        });

        // === Google Drive ===
        document.getElementById('dkz-bk-gdrive-manual')?.addEventListener('click', async () => {
            const urlInput = document.getElementById('dkz-bk-gdrive-url');
            if (urlInput?.value) localStorage.setItem('dkz-apps-script-url', urlInput.value);
            const status = document.getElementById('dkz-bk-gdrive-status');
            status.textContent = '⏳ Sichert auf Google Drive...';
            const result = await backupToDrive();
            status.textContent = result.ok ? '✅ Backup gespeichert!' : `⚠️ ${result.error}`;
            status.style.color = result.ok ? '#00ff88' : '#ffab40';
        });

        document.getElementById('dkz-bk-gdrive-auto')?.addEventListener('click', () => {
            const urlInput = document.getElementById('dkz-bk-gdrive-url');
            if (urlInput?.value) localStorage.setItem('dkz-apps-script-url', urlInput.value);
            const status = document.getElementById('dkz-bk-gdrive-status');

            if (backupActive && getActiveProvider() === 'google-drive') {
                stopAutoBackup();
                setActiveProvider('none');
                status.textContent = '⏸️ Auto-Backup deaktiviert';
                status.style.color = '#ffab40';
            } else {
                setActiveProvider('google-drive');
                startAutoBackup();
                status.textContent = '✅ Auto-Backup alle 5 Min via Google Drive';
                status.style.color = '#00ff88';
            }
            updateBackupButton();
        });

        document.getElementById('dkz-bk-gdrive-import')?.addEventListener('click', async () => {
            const urlInput = document.getElementById('dkz-bk-gdrive-url');
            if (urlInput?.value) localStorage.setItem('dkz-apps-script-url', urlInput.value);
            const status = document.getElementById('dkz-bk-gdrive-status');
            status.textContent = '📥 Importiere Backup...';
            const result = await importFromDrive();
            status.textContent = result.ok ? `✅ ${result.restored} Einträge wiederhergestellt!` : `⚠️ ${result.error}`;
            status.style.color = result.ok ? '#00ff88' : '#ffab40';
        });

        // === Cloudflare R2 ===
        document.getElementById('dkz-bk-r2-save-cfg')?.addEventListener('click', () => {
            saveCfConfig({
                accountId: document.getElementById('dkz-bk-r2-account')?.value || '',
                accessKey: document.getElementById('dkz-bk-r2-access')?.value || '',
                secretKey: document.getElementById('dkz-bk-r2-secret')?.value || '',
                bucket: document.getElementById('dkz-bk-r2-bucket')?.value || 'dkz-backups'
            });
            const status = document.getElementById('dkz-bk-r2-status');
            status.textContent = '✅ Credentials gespeichert!';
            status.style.color = '#00ff88';

            // Buttons aktivieren
            const manualBtn = document.getElementById('dkz-bk-r2-manual');
            const autoBtn = document.getElementById('dkz-bk-r2-auto');
            if (manualBtn) { manualBtn.style.opacity = '1'; manualBtn.style.pointerEvents = 'auto'; }
            if (autoBtn) { autoBtn.style.opacity = '1'; autoBtn.style.pointerEvents = 'auto'; }
        });

        document.getElementById('dkz-bk-r2-manual')?.addEventListener('click', async () => {
            const status = document.getElementById('dkz-bk-r2-status');
            status.textContent = '⏳ Lade auf Cloudflare R2 hoch...';
            status.style.color = '#f6821f';
            const result = await backupToR2();
            if (result.ok) {
                status.textContent = `✅ Hochgeladen: ${result.bucket}/${result.key}`;
                status.style.color = '#00ff88';
            } else {
                status.textContent = `⚠️ ${result.error}`;
                status.style.color = '#ffab40';
            }
        });

        document.getElementById('dkz-bk-r2-auto')?.addEventListener('click', () => {
            const status = document.getElementById('dkz-bk-r2-status');

            if (backupActive && getActiveProvider() === 'cloudflare-r2') {
                stopAutoBackup();
                setActiveProvider('none');
                status.textContent = '⏸️ R2 Auto-Backup deaktiviert';
                status.style.color = '#ffab40';
            } else {
                setActiveProvider('cloudflare-r2');
                startAutoBackup();
                status.textContent = '✅ Auto-Backup alle 5 Min via Cloudflare R2';
                status.style.color = '#00ff88';
            }
            updateBackupButton();
        });
    }

    function updateBackupButton() {
        const btn = document.getElementById('dkz-backup-btn');
        if (!btn) return;
        const provider = getActiveProvider();
        const isActive = localStorage.getItem('dkz-auto-backup') === 'true';
        const providerColor = provider === 'cloudflare-r2' ? '#f6821f' :
                              provider === 'google-drive' ? '#00ff88' : '#52525b';
        btn.style.color = isActive ? providerColor : '#52525b';
        btn.style.background = isActive ? `rgba(${provider === 'cloudflare-r2' ? '246,130,31' : '0,255,136'},0.08)` : 'rgba(255,255,255,0.03)';
        btn.style.borderColor = isActive ? `rgba(${provider === 'cloudflare-r2' ? '246,130,31' : '0,255,136'},0.2)` : 'rgba(255,255,255,0.06)';
    }

    async function refreshLocalList() {
        const listEl = document.getElementById('dkz-bk-local-list');
        if (!listEl) return;
        const backups = await getLocalBackups(8);
        if (backups.length === 0) {
            listEl.innerHTML = '<div style="text-align:center;color:#52525b;font-size:.7rem;padding:16px">Noch keine lokalen Backups</div>';
            return;
        }
        listEl.innerHTML = backups.map(b => {
            const date = new Date(b.timestamp);
            const timeStr = date.toLocaleDateString('de-DE') + ' ' + date.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
            const sizeStr = b.size ? `${(b.size / 1024).toFixed(1)} KB` : '—';
            const provIcons = { 'auto-local': '💾', 'google-drive': '📁', 'cloudflare-r2': '☁️', 'r2-pending': '⏳', 'local': '📦', 'manual': '📦' };
            const icon = provIcons[b.provider] || '📦';
            return `<div style="display:flex;justify-content:space-between;align-items:center;padding:6px 8px;background:rgba(255,255,255,0.02);border-radius:6px;margin-bottom:4px">
                <div style="display:flex;align-items:center;gap:8px">
                    <span style="font-size:.9rem">${icon}</span>
                    <div>
                        <div style="font-size:.7rem;color:#e8e8ec">${esc(timeStr)}</div>
                        <div style="font-size:.6rem;color:#52525b">${esc(b.provider)} · ${b.keys} Keys · ${esc(sizeStr)}</div>
                    </div>
                </div>
                <button data-restore-id="${b.id}" class="dkz-bk-restore-btn" style="background:rgba(99,102,241,0.1);color:#818cf8;border:1px solid rgba(99,102,241,0.2);border-radius:4px;padding:2px 8px;cursor:pointer;font-size:.6rem;font-weight:600">Restore</button>
            </div>`;
        }).join('');

        // Re-bind restore buttons
        listEl.querySelectorAll('.dkz-bk-restore-btn').forEach(btn => {
            btn.addEventListener('click', async () => {
                const id = parseInt(btn.getAttribute('data-restore-id'));
                const status = document.getElementById('dkz-bk-local-status');
                if (!confirm('Backup wiederherstellen? Aktuelle Daten werden überschrieben.')) return;
                status.textContent = '⏳ Stelle wieder her...';
                const result = await restoreFromLocal(id);
                status.textContent = result.ok
                    ? `✅ ${result.restored} Einträge wiederhergestellt`
                    : `⚠️ ${result.error}`;
                status.style.color = result.ok ? '#00ff88' : '#fa1e4e';
            });
        });
    }

    // ═══════════════════════════════════════
    // Init
    // ═══════════════════════════════════════
    function init() {
        injectToolbar();

        // Auto-save localStorage → Server (60s)
        setInterval(autoSave, SAVE_INTERVAL);

        // Auto-save → IndexedDB (5min)
        startLocalAutoSave();

        // Check for pending backup import prompt
        if (sessionStorage.getItem('dkz-new-device') === 'true') {
            setTimeout(() => {
                if (confirm('DkZ Backup erkannt. Möchtest du dein Backup importieren?')) {
                    importFromDrive();
                }
                sessionStorage.removeItem('dkz-new-device');
            }, 2000);
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else { init(); }

    // Public API
    return {
        // Server
        autoSave,
        loadSaved,
        // Google Drive
        backupToDrive,
        importFromDrive,
        // Cloudflare R2
        backupToR2,
        getCfConfig,
        saveCfConfig,
        isCfConfigured,
        // IndexedDB Lokal
        saveToLocal,
        getLocalBackups,
        getLocalBackupCount,
        restoreFromLocal,
        // Auto-Backup
        startAutoBackup,
        stopAutoBackup,
        getActiveProvider,
        setActiveProvider
    };
})();
