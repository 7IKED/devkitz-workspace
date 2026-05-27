/**
 * DkZ Memory Manager — Gedächtnis-Verwaltung + Prompt-Optimierung
 * @DKZ:TAG → [SHARED:memory] [CAT:system] [LANG:js]
 * @DKZ:RULES → R21 Shared Scripts
 * @version v0.01.1_01
 * 
 * 3-Layer Memory: Hot (aktiv) | Warm (Session) | Cold (persistent)
 * 8 GM-Regeln gegen Kontext-Überfüllung
 * Prompt-Optimierungs-Pipeline (7 Phasen)
 * 
 * Einbinden: <script src="../../shared/dkz-memory.js"></script>
 */
const DkzMemory = (() => {
    'use strict';

    const VERSION = '1.0.0';
    const LS_KEY = 'dkz-memory-config';
    const LS_PROFILES = 'dkz-memory-profiles';
    const LS_HOT = 'dkz-memory-hot';
    const LS_WARM = 'dkz-memory-warm';

    // ═══════════════════════════════════════
    // DEFAULT CONFIG — with recommended ranges
    // ═══════════════════════════════════════
    const DEFAULTS = {
        // --- Gedächtnis ---
        memoryFill: { val: 60, min: 20, max: 95, rec: [55, 70], unit: '%', label: 'Gedächtnis-Füllgrenze', desc: 'Ab welchem Füllstand wird Auto-Compaction ausgelöst', cat: 'memory' },
        hotSlots: { val: 5, min: 1, max: 20, rec: [3, 7], unit: '', label: 'Hot-Memory Slots', desc: 'Wie viele aktive Kontexte gleichzeitig gehalten werden', cat: 'memory' },
        warmTTL: { val: 30, min: 5, max: 120, rec: [20, 45], unit: 'min', label: 'Warm-Memory Lebensdauer', desc: 'Nach wie vielen Minuten Inaktivität wird Warm→Cold verschoben', cat: 'memory' },
        compactionLevel: { val: 3, min: 1, max: 5, rec: [2, 4], unit: 'Stufe', label: 'Compaction-Intensität', desc: 'Stufe 1=minimal (behutsam), 5=aggressiv (maximal kürzen)', cat: 'memory' },
        autoCompact: { val: 1, min: 0, max: 1, rec: [1, 1], unit: 'bool', label: 'Auto-Compaction', desc: 'Automatische Komprimierung wenn Füllgrenze erreicht', cat: 'memory', type: 'toggle' },
        
        // --- Prompt-Optimierung ---
        autoOptimize: { val: 1, min: 0, max: 1, rec: [1, 1], unit: 'bool', label: 'Auto-Prompt-Optimierung', desc: 'Prompts automatisch verbessern wenn Score < Schwelle', cat: 'prompt', type: 'toggle' },
        optimizeThreshold: { val: 70, min: 30, max: 95, rec: [65, 80], unit: 'Score', label: 'Optimierungs-Schwelle', desc: 'Unter diesem James-Score wird automatisch optimiert', cat: 'prompt' },
        tokenBudget: { val: 2000, min: 200, max: 8000, rec: [1500, 3000], unit: 'Token', label: 'Token-Budget', desc: 'Maximale Token-Anzahl pro Prompt vor Kürzung', cat: 'prompt' },
        xmlAutoWrap: { val: 1, min: 0, max: 1, rec: [1, 1], unit: 'bool', label: 'XML-Tags automatisch', desc: 'BP-02: Prompts automatisch mit XML-Tags strukturieren', cat: 'prompt', type: 'toggle' },
        scopeDiscipline: { val: 3, min: 1, max: 5, rec: [2, 4], unit: 'Stufe', label: 'Scope-Disziplin', desc: 'BP-06: Wie streng wird off-topic Content blockiert', cat: 'prompt' },
        
        // --- Archivierung ---
        maxArchiveSize: { val: 500, min: 50, max: 5000, rec: [300, 1000], unit: 'Einträge', label: 'Archiv-Größe', desc: 'Maximale Anzahl gespeicherter Prompts im Archiv', cat: 'archive' },
        versionHistory: { val: 10, min: 1, max: 50, rec: [5, 15], unit: 'Versionen', label: 'Versions-Tiefe', desc: 'Wie viele Versionen pro Prompt aufbewahrt werden', cat: 'archive' },
        coldStorage: { val: 2, min: 0, max: 3, rec: [1, 2], unit: '', label: 'Cold-Storage Backend', desc: '0=Nur localStorage, 1=+Iceberg, 2=+KI Export, 3=Alle', cat: 'archive', type: 'select', options: ['localStorage', '+Iceberg', '+KI Export', 'Alle'] },
        
        // --- Sicherheit ---
        confirmCompact: { val: 0, min: 0, max: 1, rec: [0, 0], unit: 'bool', label: 'Compaction bestätigen', desc: 'GM-08: User muss Komprimierung manuell bestätigen', cat: 'safety', type: 'toggle' },
        backupBeforeCompact: { val: 1, min: 0, max: 1, rec: [1, 1], unit: 'bool', label: 'Backup vor Compaction', desc: 'Automatisches Backup bevor Kontext komprimiert wird', cat: 'safety', type: 'toggle' },
        maxContextLoss: { val: 20, min: 5, max: 50, rec: [15, 25], unit: '%', label: 'Max. Kontextverlust', desc: 'Maximaler erlaubter Informationsverlust bei Compaction', cat: 'safety' }
    };

    // ═══════════════════════════════════════
    // CONFLICT RULES — Ampel-System
    // ═══════════════════════════════════════
    const CONFLICTS = [
        { a: 'memoryFill', b: 'compactionLevel', check: (cfg) => cfg.memoryFill.val > 85 && cfg.compactionLevel.val < 2, severity: 'red', msg: 'Hohe Füllgrenze + niedrige Compaction → Überlauf-Risiko!' },
        { a: 'memoryFill', b: 'hotSlots', check: (cfg) => cfg.memoryFill.val < 40 && cfg.hotSlots.val > 10, severity: 'yellow', msg: 'Niedrige Füllgrenze + viele Slots → häufige Compaction' },
        { a: 'autoCompact', b: 'confirmCompact', check: (cfg) => cfg.autoCompact.val === 1 && cfg.confirmCompact.val === 1, severity: 'yellow', msg: 'Auto-Compaction + manuelle Bestätigung → unterbricht Workflow' },
        { a: 'tokenBudget', b: 'optimizeThreshold', check: (cfg) => cfg.tokenBudget.val < 500 && cfg.optimizeThreshold.val > 85, severity: 'red', msg: 'Niedriges Token-Budget + hoher Schwellwert → fast alles wird optimiert' },
        { a: 'compactionLevel', b: 'maxContextLoss', check: (cfg) => cfg.compactionLevel.val >= 4 && cfg.maxContextLoss.val < 10, severity: 'red', msg: 'Aggressive Compaction + wenig erlaubter Verlust → widersprüchlich' },
        { a: 'autoOptimize', b: 'xmlAutoWrap', check: (cfg) => cfg.autoOptimize.val === 0 && cfg.xmlAutoWrap.val === 1, severity: 'yellow', msg: 'Auto-Optimierung aus, aber XML-Wrap an → XML wird trotzdem eingefügt' },
        { a: 'maxArchiveSize', b: 'versionHistory', check: (cfg) => cfg.maxArchiveSize.val < 100 && cfg.versionHistory.val > 20, severity: 'yellow', msg: 'Kleines Archiv + viele Versionen → Archiv füllt sich schnell' },
        { a: 'warmTTL', b: 'hotSlots', check: (cfg) => cfg.warmTTL.val < 10 && cfg.hotSlots.val < 3, severity: 'yellow', msg: 'Kurze Warm-TTL + wenige Hot-Slots → Kontext geht schnell verloren' }
    ];

    // ═══════════════════════════════════════
    // PRESETS — vordefinierte Profile
    // ═══════════════════════════════════════
    const PRESETS = {
        'Standard': { memoryFill: 60, hotSlots: 5, warmTTL: 30, compactionLevel: 3, autoCompact: 1, autoOptimize: 1, optimizeThreshold: 70, tokenBudget: 2000, xmlAutoWrap: 1, scopeDiscipline: 3, maxArchiveSize: 500, versionHistory: 10, coldStorage: 2, confirmCompact: 0, backupBeforeCompact: 1, maxContextLoss: 20 },
        'Sparsam': { memoryFill: 45, hotSlots: 3, warmTTL: 15, compactionLevel: 4, autoCompact: 1, autoOptimize: 1, optimizeThreshold: 60, tokenBudget: 1000, xmlAutoWrap: 1, scopeDiscipline: 4, maxArchiveSize: 200, versionHistory: 5, coldStorage: 1, confirmCompact: 0, backupBeforeCompact: 1, maxContextLoss: 30 },
        'Performance': { memoryFill: 80, hotSlots: 10, warmTTL: 60, compactionLevel: 2, autoCompact: 1, autoOptimize: 0, optimizeThreshold: 85, tokenBudget: 4000, xmlAutoWrap: 0, scopeDiscipline: 2, maxArchiveSize: 1000, versionHistory: 20, coldStorage: 3, confirmCompact: 0, backupBeforeCompact: 0, maxContextLoss: 15 },
        'Sicher': { memoryFill: 50, hotSlots: 4, warmTTL: 45, compactionLevel: 2, autoCompact: 0, autoOptimize: 1, optimizeThreshold: 75, tokenBudget: 2500, xmlAutoWrap: 1, scopeDiscipline: 4, maxArchiveSize: 500, versionHistory: 15, coldStorage: 2, confirmCompact: 1, backupBeforeCompact: 1, maxContextLoss: 10 },
        'Aggressiv': { memoryFill: 90, hotSlots: 15, warmTTL: 90, compactionLevel: 5, autoCompact: 1, autoOptimize: 1, optimizeThreshold: 50, tokenBudget: 6000, xmlAutoWrap: 0, scopeDiscipline: 1, maxArchiveSize: 2000, versionHistory: 30, coldStorage: 3, confirmCompact: 0, backupBeforeCompact: 0, maxContextLoss: 40 }
    };

    // ═══════════════════════════════════════
    // CONFIG MANAGEMENT
    // ═══════════════════════════════════════
    function getConfig() {
        var saved = JSON.parse(localStorage.getItem(LS_KEY) || '{}');
        var config = {};
        Object.keys(DEFAULTS).forEach(function(key) {
            config[key] = Object.assign({}, DEFAULTS[key]);
            if (saved[key] !== undefined) config[key].val = saved[key];
        });
        return config;
    }

    function setConfigValue(key, val) {
        var saved = JSON.parse(localStorage.getItem(LS_KEY) || '{}');
        saved[key] = val;
        localStorage.setItem(LS_KEY, JSON.stringify(saved));
    }

    function resetConfig() {
        localStorage.removeItem(LS_KEY);
    }

    function applyPreset(name) {
        var preset = PRESETS[name];
        if (!preset) return false;
        localStorage.setItem(LS_KEY, JSON.stringify(preset));
        return true;
    }

    // ═══════════════════════════════════════
    // PROFILE MANAGEMENT
    // ═══════════════════════════════════════
    function getProfiles() {
        return JSON.parse(localStorage.getItem(LS_PROFILES) || '{}');
    }

    function saveProfile(name) {
        var profiles = getProfiles();
        var currentRaw = JSON.parse(localStorage.getItem(LS_KEY) || '{}');
        // If empty, save defaults
        if (!Object.keys(currentRaw).length) {
            Object.keys(DEFAULTS).forEach(function(k) { currentRaw[k] = DEFAULTS[k].val; });
        }
        profiles[name] = { data: currentRaw, date: new Date().toISOString() };
        localStorage.setItem(LS_PROFILES, JSON.stringify(profiles));
        return true;
    }

    function loadProfile(name) {
        var profiles = getProfiles();
        if (!profiles[name]) return false;
        localStorage.setItem(LS_KEY, JSON.stringify(profiles[name].data));
        return true;
    }

    function deleteProfile(name) {
        var profiles = getProfiles();
        delete profiles[name];
        localStorage.setItem(LS_PROFILES, JSON.stringify(profiles));
    }

    // ═══════════════════════════════════════
    // CONFLICT DETECTION
    // ═══════════════════════════════════════
    function detectConflicts() {
        var config = getConfig();
        var active = [];
        CONFLICTS.forEach(function(c) {
            if (c.check(config)) {
                active.push({ keys: [c.a, c.b], severity: c.severity, msg: c.msg });
            }
        });
        return active;
    }

    // ═══════════════════════════════════════
    // 3-LAYER MEMORY OPERATIONS
    // ═══════════════════════════════════════
    function getHotMemory() { return JSON.parse(localStorage.getItem(LS_HOT) || '[]'); }
    function getWarmMemory() { return JSON.parse(localStorage.getItem(LS_WARM) || '[]'); }

    function addToHot(entry) {
        var hot = getHotMemory();
        var config = getConfig();
        entry.ts = Date.now();
        hot.push(entry);
        // Enforce slot limit
        while (hot.length > config.hotSlots.val) {
            var evicted = hot.shift();
            addToWarm(evicted);
        }
        localStorage.setItem(LS_HOT, JSON.stringify(hot));
    }

    function addToWarm(entry) {
        var warm = getWarmMemory();
        entry.warmTs = Date.now();
        warm.push(entry);
        localStorage.setItem(LS_WARM, JSON.stringify(warm));
    }

    function compact() {
        var config = getConfig();
        var hot = getHotMemory();
        var warm = getWarmMemory();

        // Compact warm: remove entries older than TTL
        var cutoff = Date.now() - (config.warmTTL.val * 60000);
        var expired = warm.filter(function(e) { return e.warmTs < cutoff; });
        warm = warm.filter(function(e) { return e.warmTs >= cutoff; });
        localStorage.setItem(LS_WARM, JSON.stringify(warm));

        return { evicted: expired.length, hotCount: hot.length, warmCount: warm.length };
    }

    function getMemoryStats() {
        var hot = getHotMemory();
        var warm = getWarmMemory();
        var config = getConfig();
        var totalKB = ((localStorage.getItem(LS_HOT) || '').length + (localStorage.getItem(LS_WARM) || '').length) / 1024;
        var fillPct = Math.min(100, Math.round((hot.length / Math.max(1, config.hotSlots.val)) * 100));

        return {
            hotSlots: hot.length + '/' + config.hotSlots.val,
            warmItems: warm.length,
            fillPercent: fillPct,
            sizeKB: totalKB.toFixed(1),
            status: fillPct >= config.memoryFill.val ? 'critical' : fillPct >= config.memoryFill.val * 0.7 ? 'warning' : 'ok'
        };
    }

    // ═══════════════════════════════════════
    // PUBLIC API
    // ═══════════════════════════════════════
    return {
        version: VERSION,
        DEFAULTS: DEFAULTS,
        PRESETS: PRESETS,
        CONFLICTS: CONFLICTS,
        // Config
        getConfig: getConfig,
        setConfigValue: setConfigValue,
        resetConfig: resetConfig,
        applyPreset: applyPreset,
        // Profiles
        getProfiles: getProfiles,
        saveProfile: saveProfile,
        loadProfile: loadProfile,
        deleteProfile: deleteProfile,
        // Conflicts
        detectConflicts: detectConflicts,
        // Memory
        addToHot: addToHot,
        compact: compact,
        getMemoryStats: getMemoryStats,
        getHotMemory: getHotMemory,
        getWarmMemory: getWarmMemory
    };
})();

if (typeof window !== 'undefined') window.DkzMemory = DkzMemory;
