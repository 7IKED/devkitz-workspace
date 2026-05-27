/**
 * DkZ Compaction Engine — Kontext-Komprimierung + Backup + Rollback
 * @DKZ:TAG [SHARED:compaction] [CAT:system] [LANG:js]
 * @DKZ:RULES GM-02 Fuellstand-Wache, GM-03 Backup-vor-Vergessen, GM-05 Kontext-Bruecke
 * @version v0.01.1_01
 * 
 * 3-Stufen Compaction: Soft → Medium → Aggressive
 * Backup + Rollback vor jeder Komprimierung
 * Integration mit DkzMemory Config
 * 
 * Einbinden: <script src="../../shared/dkz-compaction.js"></script>
 */
const DkzCompaction = (() => {
    'use strict';

    const VERSION = '1.0.0';
    const LS_BACKUP = 'dkz-compaction-backup';
    const LS_LOG = 'dkz-compaction-log';

    // ═══════════════════════════════════════
    // COMPACTION STRATEGIES
    // ═══════════════════════════════════════
    const STRATEGIES = {
        soft: {
            level: 1, name: 'Soft', icon: '🟢',
            desc: 'Nur TTL-abgelaufene Einträge entfernen',
            actions: ['removeTTLExpired']
        },
        medium: {
            level: 3, name: 'Medium', icon: '🟡',
            desc: 'TTL + niedrig-priorisierte + alte Einträge',
            actions: ['removeTTLExpired', 'removeLowPriority', 'summarizeOld']
        },
        aggressive: {
            level: 5, name: 'Aggressiv', icon: '🔴',
            desc: 'Alles außer gepinnte + letzte 3 Hot-Slots',
            actions: ['removeTTLExpired', 'removeLowPriority', 'summarizeOld', 'purgeWarm', 'compressHot']
        }
    };

    // GM-06: Playbook Pinned Keys (überlebt JEDE Compaction)
    const PINNED_KEYS = [
        'dkz-james-context',     // Playbook-Kontext für James
        'dkz-memory-config',     // Memory-Konfiguration
        'dkz-memory-profiles',   // Gespeicherte Profile
        'dkz-prompt-decompositions', // Kombinations-History
        'dkz-iceberg-index'      // Iceberg Prompt-Versionen Index
    ];

    // ═══════════════════════════════════════
    // BACKUP + ROLLBACK (GM-03)
    // ═══════════════════════════════════════
    function createBackup() {
        var snapshot = {};
        var keys = ['dkz-memory-hot', 'dkz-memory-warm', 'dkz-prompt-decompositions'];
        keys.forEach(function(key) {
            var val = localStorage.getItem(key);
            if (val) snapshot[key] = val;
        });
        snapshot._ts = Date.now();
        snapshot._type = 'pre-compaction';

        // Keep max 5 backups
        var backups = JSON.parse(localStorage.getItem(LS_BACKUP) || '[]');
        backups.push(snapshot);
        if (backups.length > 5) backups = backups.slice(-5);
        localStorage.setItem(LS_BACKUP, JSON.stringify(backups));

        return snapshot;
    }

    function rollback(index) {
        var backups = JSON.parse(localStorage.getItem(LS_BACKUP) || '[]');
        var target = index !== undefined ? backups[index] : backups[backups.length - 1];
        if (!target) return { success: false, reason: 'Kein Backup vorhanden' };

        Object.keys(target).forEach(function(key) {
            if (key.startsWith('_')) return;
            localStorage.setItem(key, target[key]);
        });

        logCompaction('rollback', { backupTs: target._ts });
        return { success: true, restoredKeys: Object.keys(target).filter(function(k) { return !k.startsWith('_'); }).length };
    }

    function getBackups() {
        return JSON.parse(localStorage.getItem(LS_BACKUP) || '[]').map(function(b, i) {
            return { index: i, ts: b._ts, date: new Date(b._ts).toLocaleString('de-DE'), keys: Object.keys(b).filter(function(k) { return !k.startsWith('_'); }).length };
        });
    }

    // ═══════════════════════════════════════
    // COMPACTION ACTIONS
    // ═══════════════════════════════════════
    function removeTTLExpired() {
        var config = typeof DkzMemory !== 'undefined' ? DkzMemory.getConfig() : { warmTTL: { val: 30 } };
        var warm = JSON.parse(localStorage.getItem('dkz-memory-warm') || '[]');
        var cutoff = Date.now() - (config.warmTTL.val * 60000);
        var before = warm.length;
        warm = warm.filter(function(e) { return (e.warmTs || e.ts || 0) >= cutoff; });
        localStorage.setItem('dkz-memory-warm', JSON.stringify(warm));
        return { action: 'removeTTLExpired', removed: before - warm.length, remaining: warm.length };
    }

    function removeLowPriority() {
        var warm = JSON.parse(localStorage.getItem('dkz-memory-warm') || '[]');
        var before = warm.length;
        // Remove entries without priority or with priority < 3
        warm = warm.filter(function(e) { return (e.priority || 0) >= 3; });
        localStorage.setItem('dkz-memory-warm', JSON.stringify(warm));
        return { action: 'removeLowPriority', removed: before - warm.length, remaining: warm.length };
    }

    function summarizeOld() {
        // GM-05: Create bridge summaries for old entries before removing
        var hot = JSON.parse(localStorage.getItem('dkz-memory-hot') || '[]');
        var bridges = [];
        var cutoff = Date.now() - (60 * 60000); // 1 hour

        hot.forEach(function(entry) {
            if ((entry.ts || 0) < cutoff && entry.content) {
                bridges.push({
                    originalId: entry.id || 'unknown',
                    summary: (entry.content || '').substring(0, 100) + '...',
                    bridgeTs: Date.now(),
                    type: 'context-bridge'
                });
            }
        });

        if (bridges.length > 0) {
            var existing = JSON.parse(localStorage.getItem('dkz-context-bridges') || '[]');
            existing = existing.concat(bridges);
            if (existing.length > 50) existing = existing.slice(-50);
            localStorage.setItem('dkz-context-bridges', JSON.stringify(existing));
        }

        return { action: 'summarizeOld', bridges: bridges.length };
    }

    function purgeWarm() {
        var warm = JSON.parse(localStorage.getItem('dkz-memory-warm') || '[]');
        var before = warm.length;
        // Keep only last 10 entries
        warm = warm.slice(-10);
        localStorage.setItem('dkz-memory-warm', JSON.stringify(warm));
        return { action: 'purgeWarm', removed: before - warm.length, remaining: warm.length };
    }

    function compressHot() {
        var hot = JSON.parse(localStorage.getItem('dkz-memory-hot') || '[]');
        var before = hot.length;
        // Keep only last 3 slots
        if (hot.length > 3) {
            var evicted = hot.slice(0, hot.length - 3);
            hot = hot.slice(-3);
            // Move evicted to warm bridges
            evicted.forEach(function(e) {
                e.warmTs = Date.now();
                e.evictReason = 'compressHot';
            });
            var warm = JSON.parse(localStorage.getItem('dkz-memory-warm') || '[]');
            warm = warm.concat(evicted);
            localStorage.setItem('dkz-memory-warm', JSON.stringify(warm));
            localStorage.setItem('dkz-memory-hot', JSON.stringify(hot));
        }
        return { action: 'compressHot', removed: before - hot.length, remaining: hot.length };
    }

    // ═══════════════════════════════════════
    // MAIN COMPACT FUNCTION
    // ═══════════════════════════════════════
    function compact(options) {
        options = options || {};
        var level = options.level || 3;
        var confirm = options.confirm || false;
        var config = typeof DkzMemory !== 'undefined' ? DkzMemory.getConfig() : {};

        // Determine strategy
        var strategy;
        if (level <= 2) strategy = STRATEGIES.soft;
        else if (level <= 4) strategy = STRATEGIES.medium;
        else strategy = STRATEGIES.aggressive;

        // GM-03: Backup before compaction
        if (!config.backupBeforeCompact || config.backupBeforeCompact.val !== 0) {
            createBackup();
        }

        // GM-08: Human-in-the-loop check
        if (config.confirmCompact && config.confirmCompact.val === 1 && !confirm) {
            return { status: 'pending', strategy: strategy.name, msg: 'Bestätigung erforderlich. compact({confirm:true}) aufrufen.' };
        }

        // Execute actions
        var results = [];
        var actionMap = {
            removeTTLExpired: removeTTLExpired,
            removeLowPriority: removeLowPriority,
            summarizeOld: summarizeOld,
            purgeWarm: purgeWarm,
            compressHot: compressHot
        };

        strategy.actions.forEach(function(actionName) {
            if (actionMap[actionName]) {
                results.push(actionMap[actionName]());
            }
        });

        // Log
        var totalRemoved = results.reduce(function(s, r) { return s + (r.removed || 0); }, 0);
        logCompaction('compact', { strategy: strategy.name, level: level, results: results, totalRemoved: totalRemoved });

        return { status: 'done', strategy: strategy.name, results: results, totalRemoved: totalRemoved, backupAvailable: true };
    }

    // ═══════════════════════════════════════
    // AUTO-COMPACT CHECK (GM-02)
    // ═══════════════════════════════════════
    function checkAndAutoCompact() {
        if (typeof DkzMemory === 'undefined') return null;
        var config = DkzMemory.getConfig();
        var stats = DkzMemory.getMemoryStats();

        if (config.autoCompact.val !== 1) return { action: 'skip', reason: 'Auto-Compaction deaktiviert' };

        if (stats.fillPercent >= config.memoryFill.val) {
            var level = config.compactionLevel ? config.compactionLevel.val : 3;
            return compact({ level: level, confirm: config.confirmCompact.val !== 1 });
        }

        return { action: 'ok', fillPercent: stats.fillPercent, threshold: config.memoryFill.val };
    }

    // ═══════════════════════════════════════
    // LOGGING
    // ═══════════════════════════════════════
    function logCompaction(type, data) {
        var log = JSON.parse(localStorage.getItem(LS_LOG) || '[]');
        log.push({ type: type, data: data, ts: Date.now() });
        if (log.length > 100) log = log.slice(-100);
        localStorage.setItem(LS_LOG, JSON.stringify(log));
    }

    function getLog(limit) {
        var log = JSON.parse(localStorage.getItem(LS_LOG) || '[]');
        return limit ? log.slice(-limit) : log;
    }

    // ═══════════════════════════════════════
    // STATS
    // ═══════════════════════════════════════
    function getStorageStats() {
        var used = 0;
        var items = {};
        for (var i = 0; i < localStorage.length; i++) {
            var key = localStorage.key(i);
            if (key && key.startsWith('dkz-')) {
                var size = (localStorage.getItem(key) || '').length;
                items[key] = { sizeKB: (size / 1024).toFixed(1), pinned: PINNED_KEYS.indexOf(key) !== -1 };
                used += size;
            }
        }
        return { totalKB: (used / 1024).toFixed(1), items: items, pinnedCount: PINNED_KEYS.length };
    }

    // ═══════════════════════════════════════
    // PUBLIC API
    // ═══════════════════════════════════════
    return {
        version: VERSION,
        STRATEGIES: STRATEGIES,
        PINNED_KEYS: PINNED_KEYS,
        compact: compact,
        checkAndAutoCompact: checkAndAutoCompact,
        createBackup: createBackup,
        rollback: rollback,
        getBackups: getBackups,
        getLog: getLog,
        getStorageStats: getStorageStats
    };
})();

if (typeof window !== 'undefined') window.DkzCompaction = DkzCompaction;
