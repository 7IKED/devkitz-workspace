/**
 * DkZ Iceberg Bridge — Versionierte Prompt-Speicherung
 * @DKZ:TAG [SHARED:iceberg] [CAT:storage] [LANG:js]
 * @DKZ:RULES GM-07 Score-Tracking, R12 Kein Wissensverlust
 * @version v0.01.1_01
 * 
 * Apache Iceberg-Style Versionierung für Prompts:
 * - Jeder Prompt bekommt eine Version-Chain
 * - Diff-Tracking zwischen Versionen
 * - Score-History + Trend-Analyse
 * - Kategorie-basierte Speicherung
 * 
 * Einbinden: <script src="../../shared/dkz-iceberg.js"></script>
 */
const DkzIceberg = (() => {
    'use strict';

    const VERSION = '1.0.0';
    const LS_INDEX = 'dkz-iceberg-index';
    const LS_PREFIX = 'dkz-ice-';

    // ═══════════════════════════════════════
    // CATEGORIES (Apache-Iceberg-Style)
    // ═══════════════════════════════════════
    const CATEGORIES = {
        actions: { icon: '⚡', color: '#fa1e4e' },
        skills: { icon: '🔧', color: '#55ACEE' },
        workflows: { icon: '🔄', color: '#00ff88' },
        agents: { icon: '🤖', color: '#ec4899' },
        teams: { icon: '👥', color: '#FFB800' },
        quellen: { icon: '📚', color: '#6366f1' },
        general: { icon: '📝', color: '#888' }
    };

    // ═══════════════════════════════════════
    // INDEX MANAGEMENT
    // ═══════════════════════════════════════
    function getIndex() {
        return JSON.parse(localStorage.getItem(LS_INDEX) || '{}');
    }

    function saveIndex(index) {
        localStorage.setItem(LS_INDEX, JSON.stringify(index));
    }

    // ═══════════════════════════════════════
    // PROMPT VERSIONING
    // ═══════════════════════════════════════
    function savePrompt(promptText, meta) {
        meta = meta || {};
        var index = getIndex();
        var id = meta.id || ('ICE-' + Date.now().toString(36));

        // Check if prompt already exists (by id or similar text)
        var existingId = meta.id || findSimilar(promptText);

        if (existingId && index[existingId]) {
            // New version of existing prompt
            return addVersion(existingId, promptText, meta);
        }

        // New prompt entry
        var entry = {
            id: id,
            created: Date.now(),
            category: meta.category || 'general',
            tags: meta.tags || [],
            versions: 1,
            latestScore: meta.score || 0,
            latestGrade: meta.grade || '?',
            bestScore: meta.score || 0,
            trend: 'new'
        };

        index[id] = entry;
        saveIndex(index);

        // Save version data
        var versionData = {
            v: 1,
            text: promptText,
            score: meta.score || 0,
            grade: meta.grade || '?',
            jamesIssues: meta.jamesIssues || [],
            categories: meta.categories || {},
            playbookSections: meta.playbookSections || 0,
            ts: Date.now()
        };

        localStorage.setItem(LS_PREFIX + id, JSON.stringify([versionData]));
        return { id: id, version: 1, status: 'created' };
    }

    function addVersion(id, promptText, meta) {
        meta = meta || {};
        var index = getIndex();
        if (!index[id]) return { error: 'Prompt nicht gefunden: ' + id };

        var versions = JSON.parse(localStorage.getItem(LS_PREFIX + id) || '[]');
        var lastVersion = versions[versions.length - 1];

        // Calculate diff
        var diff = calculateDiff(lastVersion ? lastVersion.text : '', promptText);

        var newVersion = {
            v: versions.length + 1,
            text: promptText,
            score: meta.score || 0,
            grade: meta.grade || '?',
            jamesIssues: meta.jamesIssues || [],
            categories: meta.categories || {},
            playbookSections: meta.playbookSections || 0,
            diff: diff,
            ts: Date.now()
        };

        versions.push(newVersion);

        // Enforce version limit from DkzMemory config
        var maxVersions = 10;
        if (typeof DkzMemory !== 'undefined') {
            var config = DkzMemory.getConfig();
            maxVersions = config.versionHistory ? config.versionHistory.val : 10;
        }
        if (versions.length > maxVersions) versions = versions.slice(-maxVersions);

        localStorage.setItem(LS_PREFIX + id, JSON.stringify(versions));

        // Update index
        index[id].versions = versions.length;
        index[id].latestScore = meta.score || 0;
        index[id].latestGrade = meta.grade || '?';
        index[id].bestScore = Math.max(index[id].bestScore || 0, meta.score || 0);
        index[id].lastModified = Date.now();

        // Trend calculation (GM-07)
        if (versions.length >= 2) {
            var scores = versions.slice(-3).map(function(v) { return v.score; });
            var avg = scores.reduce(function(s, v) { return s + v; }, 0) / scores.length;
            index[id].trend = meta.score >= avg + 5 ? 'up' : meta.score <= avg - 5 ? 'down' : 'stable';
        }

        saveIndex(index);
        return { id: id, version: newVersion.v, status: 'versioned', trend: index[id].trend, diff: diff };
    }

    // ═══════════════════════════════════════
    // DIFF TRACKING
    // ═══════════════════════════════════════
    function calculateDiff(oldText, newText) {
        if (!oldText) return { type: 'new', additions: newText.length, deletions: 0 };

        var oldWords = oldText.split(/\s+/);
        var newWords = newText.split(/\s+/);

        var added = newWords.filter(function(w) { return oldWords.indexOf(w) === -1; });
        var removed = oldWords.filter(function(w) { return newWords.indexOf(w) === -1; });

        return {
            type: 'modified',
            additions: added.length,
            deletions: removed.length,
            addedWords: added.slice(0, 10),
            removedWords: removed.slice(0, 10),
            changePercent: Math.round((added.length + removed.length) / Math.max(1, Math.max(oldWords.length, newWords.length)) * 100)
        };
    }

    // ═══════════════════════════════════════
    // SEARCH + SIMILARITY
    // ═══════════════════════════════════════
    function findSimilar(promptText) {
        var index = getIndex();
        var textLower = promptText.toLowerCase().substring(0, 100);

        var bestMatch = null;
        var bestScore = 0;

        Object.keys(index).forEach(function(id) {
            var versions = JSON.parse(localStorage.getItem(LS_PREFIX + id) || '[]');
            if (versions.length === 0) return;
            var lastText = (versions[versions.length - 1].text || '').toLowerCase().substring(0, 100);

            // Simple Jaccard similarity
            var words1 = new Set(textLower.split(/\s+/));
            var words2 = new Set(lastText.split(/\s+/));
            var intersection = 0;
            words1.forEach(function(w) { if (words2.has(w)) intersection++; });
            var union = words1.size + words2.size - intersection;
            var similarity = union > 0 ? intersection / union : 0;

            if (similarity > 0.6 && similarity > bestScore) {
                bestScore = similarity;
                bestMatch = id;
            }
        });

        return bestMatch;
    }

    // ═══════════════════════════════════════
    // QUERY + ANALYTICS
    // ═══════════════════════════════════════
    function getPrompt(id) {
        var index = getIndex();
        if (!index[id]) return null;
        var versions = JSON.parse(localStorage.getItem(LS_PREFIX + id) || '[]');
        return { meta: index[id], versions: versions };
    }

    function listPrompts(options) {
        options = options || {};
        var index = getIndex();
        var entries = Object.values(index);

        // Filter by category
        if (options.category) {
            entries = entries.filter(function(e) { return e.category === options.category; });
        }

        // Sort
        var sortBy = options.sortBy || 'lastModified';
        entries.sort(function(a, b) {
            if (sortBy === 'score') return (b.latestScore || 0) - (a.latestScore || 0);
            if (sortBy === 'bestScore') return (b.bestScore || 0) - (a.bestScore || 0);
            return (b[sortBy] || b.created || 0) - (a[sortBy] || a.created || 0);
        });

        if (options.limit) entries = entries.slice(0, options.limit);
        return entries;
    }

    function getScoreTrend(id) {
        var versions = JSON.parse(localStorage.getItem(LS_PREFIX + id) || '[]');
        return versions.map(function(v) {
            return { v: v.v, score: v.score, grade: v.grade, ts: v.ts };
        });
    }

    function getStats() {
        var index = getIndex();
        var entries = Object.values(index);
        var totalPrompts = entries.length;
        var totalVersions = entries.reduce(function(s, e) { return s + (e.versions || 1); }, 0);
        var avgScore = totalPrompts > 0 ? Math.round(entries.reduce(function(s, e) { return s + (e.latestScore || 0); }, 0) / totalPrompts) : 0;

        var byCat = {};
        entries.forEach(function(e) {
            var cat = e.category || 'general';
            if (!byCat[cat]) byCat[cat] = 0;
            byCat[cat]++;
        });

        var trends = { up: 0, down: 0, stable: 0, 'new': 0 };
        entries.forEach(function(e) { trends[e.trend || 'new']++; });

        return { totalPrompts: totalPrompts, totalVersions: totalVersions, avgScore: avgScore, byCategory: byCat, trends: trends };
    }

    function deletePrompt(id) {
        var index = getIndex();
        delete index[id];
        saveIndex(index);
        localStorage.removeItem(LS_PREFIX + id);
    }

    // ═══════════════════════════════════════
    // PUBLIC API
    // ═══════════════════════════════════════
    return {
        version: VERSION,
        CATEGORIES: CATEGORIES,
        savePrompt: savePrompt,
        addVersion: addVersion,
        getPrompt: getPrompt,
        listPrompts: listPrompts,
        getScoreTrend: getScoreTrend,
        getStats: getStats,
        deletePrompt: deletePrompt,
        findSimilar: findSimilar,
        calculateDiff: calculateDiff
    };
})();

if (typeof window !== 'undefined') window.DkzIceberg = DkzIceberg;
