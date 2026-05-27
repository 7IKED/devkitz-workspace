/**
 * DkZ Puter — Cloud Integration Layer
 * @DKZ:RULES → R21 Shared Scripts
 * @DKZ:TAG → [SYS:puter] [CAT:shared] [LANG:js]
 * @version v0.01.1_01
 *
 * Puter (puter.com) Cloud-Integration für das DkZ Ökosystem.
 * Features:
 *   - Cloud-Sync: localStorage ↔ Puter KV-Store
 *   - Cloud-Files: Daten in Puter Cloud speichern/laden
 *   - Auth: Puter-User-Login
 *   - AI: GPT/Claude Integration via puter.ai
 *
 * SDK: https://js.puter.com/v2/
 *
 * ═══ MASCHINENANWEISUNGEN ═══
 * 1. Puter SDK wird automatisch geladen wenn Netzwerk verfügbar
 * 2. Cloud-Sync ist OPT-IN — nur wenn showToast('☁️ Cloud aktiv') bestätigt
 * 3. Alle Cloud-Ops benötigen puter.auth.signIn() zuerst
 * 4. KV-Keys bekommen Prefix 'dkz:' für Namespace-Isolation
 * 5. Fallback auf localStorage wenn Puter nicht verfügbar
 * 6. AI-Calls nur über dkz-copilot.js (nicht direkt)
 */
const DkzPuter = (() => {
    'use strict';
    const VERSION = 'v0.01.1_01';
    const KV_PREFIX = 'dkz:';
    let _sdkLoaded = false;
    let _isSignedIn = false;
    let _user = null;

    // ═══ SDK Loader ═══
    function _loadSDK() {
        return new Promise((resolve, reject) => {
            if (window.puter) { _sdkLoaded = true; resolve(window.puter); return; }
            const script = document.createElement('script');
            script.src = 'https://js.puter.com/v2/';
            script.onload = () => { _sdkLoaded = true; resolve(window.puter); };
            script.onerror = () => { _sdkLoaded = false; reject(new Error('Puter SDK nicht erreichbar')); };
            document.head.appendChild(script);
        });
    }

    // ═══ Auth ═══
    async function signIn() {
        try {
            const sdk = await _loadSDK();
            if (await sdk.auth.isSignedIn()) {
                _isSignedIn = true;
                _user = await sdk.auth.getUser();
                _showStatus('☁️ Cloud verbunden als ' + _user.username);
                return _user;
            }
            await sdk.auth.signIn();
            _isSignedIn = true;
            _user = await sdk.auth.getUser();
            _showStatus('☁️ Angemeldet als ' + _user.username);
            return _user;
        } catch (err) {
            _showStatus('❌ Cloud-Login fehlgeschlagen');
            if(window.DKZ_DEBUG) console.warn('[DkzPuter]', err);
            return null;
        }
    }

    async function signOut() {
        try {
            const sdk = await _loadSDK();
            await sdk.auth.signOut();
            _isSignedIn = false;
            _user = null;
            _showStatus('☁️ Abgemeldet');
        } catch (err) { if(window.DKZ_DEBUG) console.warn('[DkzPuter]', err); }
    }

    function isSignedIn() { return _isSignedIn; }
    function getUser() { return _user; }

    // ═══ KV Store (Cloud localStorage) ═══
    async function kvSet(key, value) {
        try {
            const sdk = await _loadSDK();
            await sdk.kv.set(KV_PREFIX + key, typeof value === 'object' ? JSON.stringify(value) : value);
            return true;
        } catch (err) {
            if(window.DKZ_DEBUG) console.warn('[DkzPuter]', err);
            return false;
        }
    }

    async function kvGet(key) {
        try {
            const sdk = await _loadSDK();
            const val = await sdk.kv.get(KV_PREFIX + key);
            try { return JSON.parse(val); } catch { return val; }
        } catch (err) {
            if(window.DKZ_DEBUG) console.warn('[DkzPuter]', err);
            return null;
        }
    }

    async function kvDel(key) {
        try {
            const sdk = await _loadSDK();
            await sdk.kv.del(KV_PREFIX + key);
            return true;
        } catch { return false; }
    }

    async function kvList() {
        try {
            const sdk = await _loadSDK();
            return await sdk.kv.list({ pattern: KV_PREFIX + '*', returnValues: true });
        } catch { return []; }
    }

    // ═══ Cloud Sync (localStorage ↔ Puter KV) ═══
    async function syncToCloud(keys) {
        if (!_isSignedIn) { _showStatus('⚠️ Erst anmelden'); return false; }
        const keysToSync = keys || _getLocalStorageKeys();
        let synced = 0;
        for (const key of keysToSync) {
            const val = localStorage.getItem(key);
            if (val !== null) {
                const ok = await kvSet(key, val);
                if (ok) synced++;
            }
        }
        _showStatus(`☁️ ${synced}/${keysToSync.length} Keys synchronisiert`);
        return true;
    }

    async function syncFromCloud(keys) {
        if (!_isSignedIn) { _showStatus('⚠️ Erst anmelden'); return false; }
        const kvData = await kvList();
        let restored = 0;
        for (const item of kvData) {
            const localKey = item.key.replace(KV_PREFIX, '');
            if (!keys || keys.includes(localKey)) {
                localStorage.setItem(localKey, typeof item.value === 'object' ? JSON.stringify(item.value) : item.value);
                restored++;
            }
        }
        _showStatus(`☁️ ${restored} Keys wiederhergestellt`);
        return true;
    }

    // ═══ Cloud Files ═══
    async function saveFile(path, content) {
        try {
            const sdk = await _loadSDK();
            const blob = new Blob([content], { type: 'application/json' });
            await sdk.fs.write('/dkz/' + path, blob, { createMissingParents: true });
            _showStatus('☁️ Gespeichert: ' + path);
            return true;
        } catch (err) {
            if(window.DKZ_DEBUG) console.warn('[DkzPuter]', err);
            return false;
        }
    }

    async function readFile(path) {
        try {
            const sdk = await _loadSDK();
            const blob = await sdk.fs.read('/dkz/' + path);
            return await blob.text();
        } catch (err) {
            if(window.DKZ_DEBUG) console.warn('[DkzPuter]', err);
            return null;
        }
    }

    async function listFiles(path) {
        try {
            const sdk = await _loadSDK();
            return await sdk.fs.readdir('/dkz/' + (path || ''));
        } catch { return []; }
    }

    // ═══ AI (via puter.ai) ═══
    async function aiChat(prompt, model) {
        try {
            const sdk = await _loadSDK();
            const response = await sdk.ai.chat(prompt, { model: model || 'gpt-4o-mini' });
            return response;
        } catch (err) {
            if(window.DKZ_DEBUG) console.warn('[DkzPuter]', err);
            return null;
        }
    }

    // ═══ Deploy (Static Site → Puter Hosting) ═══
    async function deploy(subdomain) {
        try {
            const sdk = await _loadSDK();
            const result = await sdk.hosting.create(subdomain || 'dkz-app', './', {});
            _showStatus('🚀 Deployed: ' + result.subdomain + '.puter.site');
            return result;
        } catch (err) {
            if(window.DKZ_DEBUG) console.warn('[DkzPuter]', err);
            return null;
        }
    }

    // ═══ Helpers ═══
    function _getLocalStorageKeys() {
        const keys = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && !key.startsWith('__') && !key.startsWith('dkz-debug')) keys.push(key);
        }
        return keys;
    }

    function _showStatus(msg) {
        if (typeof showToast === 'function') showToast(msg);
        else console.log('[DkzPuter]', msg);
    }

    // ═══ Cloud Badge (inject in header) ═══
    function _injectCloudBadge() {
        const hdr = document.querySelector('.hdr-right') || document.querySelector('.header, .dkz-header');
        if (!hdr) return;
        const target = document.querySelector('.hdr-right') || hdr;
        const btn = document.createElement('button');
        btn.className = 'dkz-cloud-btn';
        btn.title = 'Cloud-Sync (Puter)';
        btn.textContent = '☁️';
        btn.onclick = async () => {
            if (_isSignedIn) {
                if (confirm('Cloud-Sync starten?\n\n↑ Upload: localStorage → Cloud\n↓ Download: Cloud → localStorage')) {
                    await syncToCloud();
                }
            } else {
                await signIn();
            }
        };
        target.appendChild(btn);

        const s = document.createElement('style');
        s.textContent = `.dkz-cloud-btn{padding:5px 8px;border:1px solid rgba(255,255,255,.08);border-radius:8px;background:rgba(255,255,255,.03);color:rgba(255,255,255,.4);font-size:12px;cursor:pointer;transition:all .2s;font-family:inherit}.dkz-cloud-btn:hover{background:rgba(0,150,255,.1);border-color:rgba(0,150,255,.3);color:#0af}`;
        document.head.appendChild(s);
    }

    // ═══ Init ═══
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', _injectCloudBadge);
    else _injectCloudBadge();

    // Register Ctrl+U shortcut for cloud sync
    if (typeof DkzShortcuts !== 'undefined' && DkzShortcuts.register) {
        DkzShortcuts.register('ctrl+u', 'Cloud Sync', async () => {
            if (!_isSignedIn) await signIn();
            else await syncToCloud();
        }, 'localStorage ↔ Puter Cloud');
    }

    return {
        signIn, signOut, isSignedIn, getUser,
        kvSet, kvGet, kvDel, kvList,
        syncToCloud, syncFromCloud,
        saveFile, readFile, listFiles,
        aiChat, deploy,
        VERSION
    };
})();

if (typeof module !== 'undefined') module.exports = DkzPuter;
