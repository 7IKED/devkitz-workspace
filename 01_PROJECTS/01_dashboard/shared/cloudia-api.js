/**
 * CLOUDIA™ Unified Cloud API — Multi-Provider Interface
 * @DKZ:RULES → R12 Persist, R15 esc(), R20 Docs
 * @DKZ:TAG → [SYS:cloud] [CAT:shared] [LANG:js]
 * @version v1.00.0_01
 *
 * Provider: Google Drive (Apps Script), Cloudflare R2 (S3),
 *           GitHub (REST v3), Lokal (localStorage), DuckDB
 */
const CloudiaAPI = (() => {
    'use strict';

    const VERSION = 'v1.00.0';

    // ═══════════════════════════════════════
    // Provider Registry
    // ═══════════════════════════════════════
    const PROVIDERS = {
        drive: {
            name: 'Google Drive',
            icon: '📁',
            color: '#4285F4',
            status: 'unknown',
            lastSync: null,
            config: () => ({
                appsScriptUrl: localStorage.getItem('dkz-apps-script-url') || '',
                folderId: localStorage.getItem('dkz-deepkeep-folder-id') || ''
            })
        },
        r2: {
            name: 'Cloudflare R2',
            icon: '☁️',
            color: '#F38020',
            status: 'unknown',
            lastSync: null,
            config: () => ({
                accountId: localStorage.getItem('dkz-cf-account-id') || '',
                accessKey: localStorage.getItem('dkz-cf-access-key') || '',
                secretKey: localStorage.getItem('dkz-cf-secret-key') || '',
                bucket: localStorage.getItem('dkz-cf-bucket') || 'dkz-backups',
                proxyUrl: 'http://localhost:9880/backup/r2'
            })
        },
        github: {
            name: 'GitHub',
            icon: '🐙',
            color: '#238636',
            status: 'unknown',
            lastSync: null,
            config: () => ({
                token: localStorage.getItem('dkz-github-token') || '',
                org: localStorage.getItem('dkz-github-org') || '7IKED',
                repos: (localStorage.getItem('dkz-github-repos') || 'devkitz-workspace').split(',')
            })
        },
        local: {
            name: 'Lokal',
            icon: '💾',
            color: '#00ff88',
            status: 'online',
            lastSync: null,
            config: () => ({})
        },
        duckdb: {
            name: 'DuckDB',
            icon: '🦆',
            color: '#FFC107',
            status: 'unknown',
            lastSync: null,
            config: () => ({
                apiUrl: localStorage.getItem('dkz-duckdb-api') || 'http://localhost:8080'
            })
        }
    };

    // ═══════════════════════════════════════
    // Health Check — alle Provider pruefen
    // ═══════════════════════════════════════
    async function checkHealth() {
        const results = {};

        // Drive: Apps Script URL vorhanden?
        const driveConf = PROVIDERS.drive.config();
        if (driveConf.appsScriptUrl) {
            try {
                const r = await fetch(driveConf.appsScriptUrl, { method: 'GET', signal: AbortSignal.timeout(3000) });
                PROVIDERS.drive.status = r.ok ? 'online' : 'degraded';
            } catch { PROVIDERS.drive.status = 'offline'; }
        } else {
            PROVIDERS.drive.status = 'not_configured';
        }
        results.drive = PROVIDERS.drive.status;

        // R2: Proxy erreichbar?
        const r2Conf = PROVIDERS.r2.config();
        if (r2Conf.accountId) {
            try {
                const r = await fetch(r2Conf.proxyUrl.replace('/backup/r2', '/health'), { signal: AbortSignal.timeout(2000) });
                PROVIDERS.r2.status = r.ok ? 'online' : 'degraded';
            } catch { PROVIDERS.r2.status = 'offline'; }
        } else {
            PROVIDERS.r2.status = 'not_configured';
        }
        results.r2 = PROVIDERS.r2.status;

        // GitHub: Token gueltig?
        const ghConf = PROVIDERS.github.config();
        if (ghConf.token) {
            try {
                const r = await fetch('https://api.github.com/user', {
                    headers: { 'Authorization': `Bearer ${ghConf.token}` },
                    signal: AbortSignal.timeout(3000)
                });
                PROVIDERS.github.status = r.ok ? 'online' : 'degraded';
            } catch { PROVIDERS.github.status = 'offline'; }
        } else {
            PROVIDERS.github.status = 'not_configured';
        }
        results.github = PROVIDERS.github.status;

        // Local: Immer online
        PROVIDERS.local.status = 'online';
        results.local = 'online';

        // DuckDB: API erreichbar?
        const dbConf = PROVIDERS.duckdb.config();
        try {
            const r = await fetch(dbConf.apiUrl + '/health', { signal: AbortSignal.timeout(2000) });
            PROVIDERS.duckdb.status = r.ok ? 'online' : 'degraded';
        } catch { PROVIDERS.duckdb.status = 'offline'; }
        results.duckdb = PROVIDERS.duckdb.status;

        return results;
    }

    // ═══════════════════════════════════════
    // DEEPKEEP Katalog (localStorage)
    // ═══════════════════════════════════════
    const CATALOG_KEY = 'deepkeep-catalog';

    function getCatalog() {
        try { return JSON.parse(localStorage.getItem(CATALOG_KEY) || '[]'); }
        catch { return []; }
    }

    function saveCatalog(catalog) {
        localStorage.setItem(CATALOG_KEY, JSON.stringify(catalog));
    }

    function addToCatalog(entry) {
        const catalog = getCatalog();
        const item = {
            id: 'dk-' + Date.now().toString(36) + '-' + Math.random().toString(36).substring(2, 6),
            filename: entry.filename,
            path: entry.path || '/_INBOX/',
            provider: entry.provider || 'local',
            fileType: _detectFileType(entry.filename),
            sizeBytes: entry.sizeBytes || 0,
            contentHash: entry.contentHash || '',
            tags: entry.tags || [],
            createdAt: new Date().toISOString(),
            modifiedAt: new Date().toISOString(),
            accessedAt: new Date().toISOString(),
            isProtected: true,
            metadata: entry.metadata || {}
        };
        catalog.unshift(item);
        saveCatalog(catalog);
        _logAction('add', item.filename, item.path, item.provider);
        return item;
    }

    function searchCatalog(query, filters = {}) {
        const catalog = getCatalog();
        const q = query.toLowerCase();
        return catalog.filter(item => {
            if (q && !item.filename.toLowerCase().includes(q) &&
                !item.path.toLowerCase().includes(q) &&
                !(item.tags || []).some(t => t.toLowerCase().includes(q))) {
                return false;
            }
            if (filters.fileType && item.fileType !== filters.fileType) return false;
            if (filters.provider && item.provider !== filters.provider) return false;
            if (filters.path && !item.path.startsWith(filters.path)) return false;
            return true;
        });
    }

    function removeCatalogEntry(id) {
        // DEEPKEEP Regel: NIEMALS loeschen! Nur markieren.
        const catalog = getCatalog();
        const item = catalog.find(i => i.id === id);
        if (item) {
            item.metadata = item.metadata || {};
            item.metadata._markedForReview = true;
            item.metadata._reviewDate = new Date().toISOString();
            saveCatalog(catalog);
            _logAction('mark-review', item.filename, item.path, item.provider);
        }
        return item;
    }

    // ═══════════════════════════════════════
    // CLOUDIA Sortier-Regeln
    // ═══════════════════════════════════════
    const RULES_KEY = 'cloudia-sort-rules';

    const DEFAULT_RULES = [
        { id: 'r1', pattern: '*.md', target: '/02_RESEARCH/', provider: 'drive', priority: 10, active: true },
        { id: 'r2', pattern: '*.txt', target: '/02_RESEARCH/', provider: 'drive', priority: 10, active: true },
        { id: 'r3', pattern: '*.pdf', target: '/02_RESEARCH/', provider: 'drive', priority: 10, active: true },
        { id: 'r4', pattern: '*.jpg', target: '/03_MEDIA/images/', provider: 'drive', priority: 20, active: true },
        { id: 'r5', pattern: '*.png', target: '/03_MEDIA/images/', provider: 'drive', priority: 20, active: true },
        { id: 'r6', pattern: '*.svg', target: '/03_MEDIA/images/', provider: 'drive', priority: 20, active: true },
        { id: 'r7', pattern: '*.mp4', target: '/03_MEDIA/videos/', provider: 'drive', priority: 20, active: true },
        { id: 'r8', pattern: '*.webm', target: '/03_MEDIA/videos/', provider: 'drive', priority: 20, active: true },
        { id: 'r9', pattern: '*.mp3', target: '/03_MEDIA/audio/', provider: 'drive', priority: 20, active: true },
        { id: 'r10', pattern: '*.wav', target: '/03_MEDIA/audio/', provider: 'drive', priority: 20, active: true },
        { id: 'r11', pattern: '*.zip', target: '/99_ARCHIVE/', provider: 'drive', priority: 30, active: true },
        { id: 'r12', pattern: '*.tar.gz', target: '/99_ARCHIVE/', provider: 'drive', priority: 30, active: true },
        { id: 'r13', pattern: '*.js', target: '/01_PROJECTS/', provider: 'drive', priority: 15, active: true },
        { id: 'r14', pattern: '*.py', target: '/01_PROJECTS/', provider: 'drive', priority: 15, active: true },
        { id: 'r15', pattern: '*.html', target: '/01_PROJECTS/', provider: 'drive', priority: 15, active: true },
        { id: 'r16', pattern: '*.css', target: '/01_PROJECTS/', provider: 'drive', priority: 15, active: true },
        { id: 'r17', pattern: '*.eml', target: '/07_EMAIL_DRAFTS/', provider: 'drive', priority: 25, active: true },
        { id: 'r18', pattern: '*.msg', target: '/07_EMAIL_DRAFTS/', provider: 'drive', priority: 25, active: true },
    ];

    function getRules() {
        try {
            const stored = JSON.parse(localStorage.getItem(RULES_KEY) || 'null');
            return stored || DEFAULT_RULES;
        } catch { return DEFAULT_RULES; }
    }

    function saveRules(rules) {
        localStorage.setItem(RULES_KEY, JSON.stringify(rules));
    }

    function matchRule(filename) {
        const rules = getRules().filter(r => r.active).sort((a, b) => a.priority - b.priority);
        for (const rule of rules) {
            if (_globMatch(filename, rule.pattern)) {
                return rule;
            }
        }
        return null;
    }

    function sortFile(filename, sizeBytes = 0) {
        const rule = matchRule(filename);
        const target = rule ? rule.target : '/_INBOX/';
        const provider = rule ? rule.provider : 'local';
        const item = addToCatalog({
            filename,
            path: target,
            provider,
            sizeBytes,
            tags: rule ? [rule.pattern] : ['unsorted']
        });
        _logAction('sort', filename, target, provider);
        return { item, rule, target };
    }

    // ═══════════════════════════════════════
    // Sync Log
    // ═══════════════════════════════════════
    const LOG_KEY = 'cloudia-sync-log';

    function _logAction(action, source, target, provider) {
        try {
            const log = JSON.parse(localStorage.getItem(LOG_KEY) || '[]');
            log.unshift({
                id: 'log-' + Date.now().toString(36),
                action,
                source,
                target,
                provider,
                timestamp: new Date().toISOString(),
                status: 'success'
            });
            // Max 500 Eintraege
            if (log.length > 500) log.length = 500;
            localStorage.setItem(LOG_KEY, JSON.stringify(log));
        } catch { /* localStorage voll */ }
    }

    function getSyncLog(limit = 50) {
        try {
            const log = JSON.parse(localStorage.getItem(LOG_KEY) || '[]');
            return log.slice(0, limit);
        } catch { return []; }
    }

    // ═══════════════════════════════════════
    // 7-Tage-Regel (Desktop/Downloads)
    // ═══════════════════════════════════════
    const SEVEN_DAY_KEY = 'cloudia-7day-watch';

    function get7DayItems() {
        try { return JSON.parse(localStorage.getItem(SEVEN_DAY_KEY) || '[]'); }
        catch { return []; }
    }

    function add7DayItem(filename, source) {
        const items = get7DayItems();
        items.push({
            filename,
            source, // 'desktop' oder 'downloads'
            addedAt: new Date().toISOString(),
            lastAccessed: new Date(Date.now() - 8 * 86400000).toISOString() // 8 Tage her
        });
        localStorage.setItem(SEVEN_DAY_KEY, JSON.stringify(items));
    }

    function moveToDeepkeep(sevenDayId) {
        const items = get7DayItems();
        const idx = items.findIndex((_, i) => i === sevenDayId);
        if (idx >= 0) {
            const item = items.splice(idx, 1)[0];
            const target = item.source === 'desktop' ? '/05_DESKTOP_KEEP/' : '/06_DOWNLOADS_KEEP/';
            addToCatalog({
                filename: item.filename,
                path: target,
                provider: 'drive',
                tags: ['7day-rule', item.source]
            });
            localStorage.setItem(SEVEN_DAY_KEY, JSON.stringify(items));
            return true;
        }
        return false;
    }

    // ═══════════════════════════════════════
    // Helper Functions
    // ═══════════════════════════════════════
    function _detectFileType(filename) {
        const ext = (filename.split('.').pop() || '').toLowerCase();
        const types = {
            md: 'document', txt: 'document', pdf: 'document', doc: 'document', docx: 'document',
            jpg: 'image', jpeg: 'image', png: 'image', gif: 'image', svg: 'image', webp: 'image',
            mp4: 'video', webm: 'video', avi: 'video', mkv: 'video', mov: 'video',
            mp3: 'audio', wav: 'audio', flac: 'audio', ogg: 'audio',
            zip: 'archive', tar: 'archive', gz: 'archive', rar: 'archive', '7z': 'archive',
            js: 'code', py: 'code', html: 'code', css: 'code', ts: 'code', json: 'code',
            eml: 'email', msg: 'email'
        };
        return types[ext] || 'other';
    }

    function _globMatch(filename, pattern) {
        const regex = pattern
            .replace(/\./g, '\\.')
            .replace(/\*/g, '.*')
            .replace(/\?/g, '.');
        return new RegExp('^' + regex + '$', 'i').test(filename);
    }

    function getFileIcon(filename) {
        const type = _detectFileType(filename);
        const icons = {
            document: '📄', image: '🖼️', video: '🎬', audio: '🎵',
            archive: '📦', code: '💻', email: '📧', other: '📎'
        };
        return icons[type] || '📎';
    }

    function formatBytes(bytes) {
        if (!bytes || bytes === 0) return '0 B';
        const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(1024));
        return (bytes / Math.pow(1024, i)).toFixed(1) + ' ' + sizes[i];
    }

    // ═══════════════════════════════════════
    // Export Stats
    // ═══════════════════════════════════════
    function getStats() {
        const catalog = getCatalog();
        const log = getSyncLog(9999);
        const byType = {};
        const byProvider = {};
        let totalSize = 0;

        catalog.forEach(item => {
            byType[item.fileType] = (byType[item.fileType] || 0) + 1;
            byProvider[item.provider] = (byProvider[item.provider] || 0) + 1;
            totalSize += item.sizeBytes || 0;
        });

        return {
            totalFiles: catalog.length,
            totalSize,
            byType,
            byProvider,
            protectedFiles: catalog.filter(i => i.isProtected).length,
            lastAction: log[0] || null,
            todayActions: log.filter(l => l.timestamp.startsWith(new Date().toISOString().substring(0, 10))).length,
            sevenDayPending: get7DayItems().length
        };
    }

    // ═══════════════════════════════════════
    // CSV/JSON Export
    // ═══════════════════════════════════════
    function exportCatalog(format = 'json') {
        const catalog = getCatalog();
        if (format === 'csv') {
            const headers = 'id,filename,path,provider,fileType,sizeBytes,tags,createdAt,isProtected\n';
            const rows = catalog.map(i =>
                `${i.id},${i.filename},${i.path},${i.provider},${i.fileType},${i.sizeBytes},"${(i.tags || []).join(';')}",${i.createdAt},${i.isProtected}`
            ).join('\n');
            return headers + rows;
        }
        return JSON.stringify(catalog, null, 2);
    }

    function downloadExport(format = 'json') {
        const data = exportCatalog(format);
        const blob = new Blob([data], { type: format === 'csv' ? 'text/csv' : 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `deepkeep-catalog-${new Date().toISOString().substring(0, 10)}.${format}`;
        a.click();
        URL.revokeObjectURL(url);
    }

    // ═══════════════════════════════════════
    // Public API
    // ═══════════════════════════════════════
    return {
        VERSION,
        PROVIDERS,
        // Health
        checkHealth,
        // Catalog (DEEPKEEP)
        getCatalog, saveCatalog, addToCatalog, searchCatalog, removeCatalogEntry,
        // Sort (CLOUDIA)
        getRules, saveRules, matchRule, sortFile,
        DEFAULT_RULES,
        // Sync Log
        getSyncLog,
        // 7-Day Rule
        get7DayItems, add7DayItem, moveToDeepkeep,
        // Helpers
        getFileIcon, formatBytes, getStats, _detectFileType,
        // Export
        exportCatalog, downloadExport
    };
})();

if (typeof module !== 'undefined') module.exports = CloudiaAPI;
