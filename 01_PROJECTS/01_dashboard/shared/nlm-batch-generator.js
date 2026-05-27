/**
 * nlm-batch-generator.js — NLM Batch Content Generator
 * DEVKiTZ™ · v0.01 · 2026-04-08
 * @DKZ:TAG → [SHARED:nlm-batch-generator] [CAT:shared] [LANG:js]
 * @DKZ:RULES → R21 Shared Scripts
 * @version v0.01.1_01
 * 
 * Generiert für JEDES Modul automatisch:
 * 1. Infoseite (Markdown → HTML Blog Post)
 * 2. Präsentation (10-Slide Markdown für NLM)
 * 3. Podcast-Script (Deep-Dive Briefing für NLM Audio)
 * 
 * Workflow:
 *   1. REGISTRY.json lesen → Modul-Liste
 *   2. features.json pro Modul laden → Details
 *   3. NLM Source-Dokumente generieren
 *   4. → Blog Upload Pipeline → Blogger API
 *   5. → NLM MCP → Podcast/Video/Presentations
 * 
 * Nutzung (im Browser):
 *   NLMBatchGen.scanModules()           → Alle Module scannen
 *   NLMBatchGen.generateAll()           → Alles generieren
 *   NLMBatchGen.generateForModule(id)   → Einzelnes Modul
 *   NLMBatchGen.exportAll()             → ZIP Download aller Sources
 *   NLMBatchGen.toBlogPipeline()        → In Blog-Queue einfügen
 * 
 * Nutzung (Node.js/CLI):
 *   node nlm-batch-generator.js --scan
 *   node nlm-batch-generator.js --generate
 *   node nlm-batch-generator.js --module nanobot-center
 */

const NLMBatchGen = (() => {
    'use strict';

    const VERSION = '0.01';
    const STORAGE_KEY = 'dkz-nlm-batch';

    // --- Modul-Kategorien ---
    const CATEGORIES = {
        'Developer Tools': { emoji: '🛠️', blogTag: 'developer', color: '#3b82f6' },
        'KI & Prompts': { emoji: '🤖', blogTag: 'ki-ai', color: '#8b5cf6' },
        'Design & UI': { emoji: '🎨', blogTag: 'design', color: '#ec4899' },
        'Content & Text': { emoji: '📝', blogTag: 'content', color: '#10b981' },
        'Analyse & Daten': { emoji: '📊', blogTag: 'analyse', color: '#f59e0b' },
        'Produktivität': { emoji: '⚡', blogTag: 'produktivitaet', color: '#06b6d4' },
        'Builder Suite': { emoji: '🔀', blogTag: 'builder', color: '#fa1e4e' },
        'Backend & System': { emoji: '🧊', blogTag: 'system', color: '#6366f1' },
        'Spezial': { emoji: '🎯', blogTag: 'spezial', color: '#f97316' }
    };

    // Modul → Kategorie Mapping (basierend auf BLAUPAUSE.md)
    const MODULE_CATEGORIES = {
        'json-formatter': 'Developer Tools', 'regex-tester': 'Developer Tools',
        'css-generator': 'Developer Tools', 'base64-tools': 'Developer Tools',
        'cron-builder': 'Developer Tools', 'hash-generator': 'Developer Tools',
        'api-tester': 'Developer Tools', 'snippet-manager': 'Developer Tools',
        'code-differ': 'Developer Tools', 'html_viewer': 'Developer Tools',
        'markdown_converter': 'Developer Tools', 'meta-tag-gen': 'Developer Tools',
        'ascii-tool': 'Developer Tools', 'converter': 'Developer Tools',
        'lorem-generator': 'Developer Tools',
        'ai_chat': 'KI & Prompts', 'prompt-generator': 'KI & Prompts',
        'prompt-viewer': 'KI & Prompts', 'prompter': 'KI & Prompts',
        'ki-lernplattform': 'KI & Prompts',
        'color-picker': 'Design & UI', 'favicon-gen': 'Design & UI',
        'blog-designer': 'Design & UI', 'emoji-picker': 'Design & UI',
        'seo-toolkit': 'Design & UI', 'image-forge': 'Design & UI',
        'markdown-gen': 'Content & Text', 'noter': 'Content & Text',
        'devnotes': 'Content & Text', 'changelog-builder': 'Content & Text',
        'text_summary': 'Content & Text', 'text_to_speech': 'Content & Text',
        'speech_to_text': 'Content & Text', 'link-generator': 'Content & Text',
        'analyser': 'Analyse & Daten', 'ip-tools': 'Analyse & Daten',
        'ttl-visualizer': 'Analyse & Daten', 'research': 'Analyse & Daten',
        'doc-engine': 'Analyse & Daten', 'domain-control': 'Analyse & Daten',
        'llm-cost-board': 'Analyse & Daten',
        'timer-tools': 'Produktivität', 'tasker': 'Produktivität',
        'clipboard': 'Produktivität', 'password-gen': 'Produktivität',
        'unit-converter': 'Produktivität', 'split-browser': 'Produktivität',
        'action-builder': 'Builder Suite', 'agent-builder': 'Builder Suite',
        'skill-builder': 'Builder Suite', 'workflow-builder': 'Builder Suite',
        'app-builder': 'Builder Suite',
        'iceberg': 'Backend & System', 'system-check': 'Backend & System',
        'loop-dashboard': 'Backend & System', 'botnet-admin': 'Backend & System',
        'ecosystem-analyzer': 'Backend & System', 'settings': 'Backend & System',
        'source-registry': 'Backend & System',
        'qr-generator': 'Spezial', 'rating-system': 'Spezial',
        'social-dashboard': 'Spezial', 'sportwetten': 'Spezial',
        'cs2-config': 'Spezial', 'suno-ai': 'Spezial',
        'nanobot-center': 'KI & Prompts', 'coderabbit-panel': 'Backend & System',
        'cloud-control': 'Backend & System', 'claudia-cloud': 'Backend & System',
        'whisper-tts': 'Content & Text', 'qr-launcher': 'Spezial',
        'wissen-hub': 'Backend & System', 'notes-manager': 'Content & Text',
        'workflow-viewer': 'Backend & System', 'wiki-viewer': 'Content & Text',
        'nexuz-builder': 'Builder Suite', 'appscript-builder': 'Builder Suite',
        'tenor-builder': 'Builder Suite', 'black8-builder': 'Builder Suite',
        'hood-builder': 'Builder Suite', 'neural-swarm': 'KI & Prompts',
        'gallery': 'Design & UI', 'playbook-archiv': 'Analyse & Daten',
        'project-registry': 'Analyse & Daten', 'ruleboard': 'Backend & System',
        'team-builder': 'Builder Suite', 'icon-creator': 'Design & UI'
    };

    // --- Infoseite Generator ---
    function generateInfoPage(mod) {
        const cat = MODULE_CATEGORIES[mod.slug] || 'Spezial';
        const catInfo = CATEGORIES[cat] || CATEGORIES['Spezial'];
        const features = (mod.features || [])
            .map(f => `- **${f.name}** — Status: ${f.status === 'done' ? '✅' : f.status === 'wip' ? '🔧' : '📋'}`)
            .join('\n');

        return `# ${catInfo.emoji} ${mod.name} — DEVKiTZ™ Modul

> ${mod.description || 'DkZ Dashboard Modul'} · ID: ${mod.id} · v${mod.version || '0.01'}
> Kategorie: ${cat} · Design: DkZ™ v2 Cyberclean Dark

---

## Überblick

${mod.name} ist ein Modul im DEVKiTZ™ Ökosystem-Dashboard. Es gehört zur Kategorie **${cat}** und läuft als portierbare Vanilla HTML/CSS/JS Datei — ohne Framework, ohne Build, ohne npm.

## Features

${features || '- Wird noch dokumentiert'}

## Technische Details

| Eigenschaft | Wert |
|:------------|:-----|
| Modul-ID | ${mod.id} |
| Version | v${mod.version || '0.01'} |
| Kategorie | ${cat} |
| Design System | DkZ™ v2 |
| Akzentfarbe | #fa1e4e (Neonrot) |
| Fonts | Inter + JetBrains Mono |
| Speicher | localStorage (Offline-First) |
| Portabel | ✅ Einzeldatei, Doppelklick öffnen |

## Im Ökosystem

${mod.name} ist eines von 89+ Modulen im DkZ™ Dashboard. Es wird über den Hub (Auto-Discovery) gefunden und ist über das Hamburger-Menü (☰) erreichbar. Shared Scripts (34+) werden dynamisch geladen.

## Eiserne Regeln

- esc() bei jedem User-Input (XSS-Schutz)
- DkZ CSS Variables (kein hardcoded #fa1e4e)
- Git Commit nach jeder Änderung
- features.json immer aktuell

---

*DEVKiTZ™ · ${mod.name} · ${new Date().toISOString().split('T')[0]}*
`;
    }

    // --- Präsentation Generator (10 Slides) ---
    function generatePresentation(mod) {
        const cat = MODULE_CATEGORIES[mod.slug] || 'Spezial';
        const catInfo = CATEGORIES[cat] || CATEGORIES['Spezial'];

        return `# ${mod.name} — Präsentation
## DEVKiTZ™ Modul Deep-Dive · 10 Slides

---

### Slide 1: Titel
# ${catInfo.emoji} ${mod.name}
## DEVKiTZ™ Dashboard-Modul
**${mod.description || 'Modul im DkZ Ökosystem'}**
Kategorie: ${cat} · ID: ${mod.id}

---

### Slide 2: Problem
## Das Problem
- Entwickler brauchen spezialisierte Tools
- Viele Tools sind verstreut über verschiedene Websites
- Setup, Installation, Abhängigkeiten kosten Zeit
- Kein einheitliches Design, keine Integration

---

### Slide 3: Lösung
## Die Lösung: ${mod.name}
- **Sofort nutzbar** — Kein Build, kein npm
- **Integriert** — Teil des DkZ Ökosystems
- **Offline-fähig** — localStorage First
- **Portabel** — Eine HTML-Datei, Doppelklick

---

### Slide 4: Features
## Was kann ${mod.name}?
${(mod.features || []).map(f => `- ${f.status === 'done' ? '✅' : '🔧'} ${f.name}`).join('\n') || '- Wird noch dokumentiert'}

---

### Slide 5: Architektur
## Technischer Aufbau
- **Frontend:** Vanilla HTML5 + CSS3 + JS ES6+
- **Design:** DkZ™ v2 (Glassmorphism, #fa1e4e Accent)
- **Speicher:** localStorage (Offline-First)
- **34+ Shared Scripts** dynamisch geladen

---

### Slide 6: Design System
## DkZ™ Design System v2
- Background: #060608 (Cyberclean Dark)
- Accent: #fa1e4e (Neonrot)
- Success: #00ff88 | Warning: #ffb800 | Error: #ff3b5c
- Fonts: Inter (UI) + JetBrains Mono (Code)
- Glassmorphism + animierte Background Blobs

---

### Slide 7: Integration
## Im Ökosystem
- Eines von **89+ Modulen** im Dashboard
- Über **Hub** (Auto-Discovery) erreichbar
- **Hamburger-Menü** mit 5 Gruppen
- **Cross-Module** Verlinkung via dkz-crosslinks.js

---

### Slide 8: Sicherheit
## Eiserne Regeln
- R1: NIE löschen — IMMER archivieren
- R2: Git Commit nach JEDER Änderung
- R21: Shared Scripts PFLICHT (dkz-debug.js)
- esc() bei jedem User-Input → XSS-Schutz

---

### Slide 9: Demo
## Live Demo
- Doppelklick auf \`index.html\` → sofort nutzbar
- Kein Server, kein Terminal, kein Setup
- Funktioniert auf USB-Stick, NAS, lokal

---

### Slide 10: Nächste Schritte
## Roadmap
- v2.0-beta → v2.0 Stable Release
- Mehr Builder Pipeline Integration
- n8n Automatisierung
- Community Marketplace

**devkitz.eu** · github.com/777/devkitz-ecosystem
`;
    }

    // --- Podcast Script Generator ---
    function generatePodcast(mod) {
        const cat = MODULE_CATEGORIES[mod.slug] || 'Spezial';
        const catInfo = CATEGORIES[cat] || CATEGORIES['Spezial'];

        return `# ${mod.name} — Podcast Deep-Dive
## DEVKiTZ™ Modul-Briefing für NotebookLM Audio

---

## Thema
Das Modul "${mod.name}" (${mod.id}) aus dem DEVKiTZ™ Ökosystem. Kategorie: ${cat}.

## Beschreibung
${mod.description || mod.name + ' ist ein Modul im DkZ Dashboard.'}

## Kernpunkte für den Podcast

### 1. Einführung (2 Minuten)
DEVKiTZ ist ein KI-Entwickler-Ökosystem mit über 89 Modulen. Heute schauen wir uns "${mod.name}" genauer an — ein ${cat}-Tool, das ${mod.description || 'Entwicklern bei ihrer täglichen Arbeit hilft'}.

### 2. Problem & Lösung (3 Minuten)
Das Problem: Entwickler brauchen oft spezialisierte Tools für ${cat.toLowerCase()}-Aufgaben. Die bestehenden Lösungen sind entweder zu komplex, brauchen Installation, oder sind nicht offline-fähig.
Die Lösung: ${mod.name} — eine einzige HTMLDatei, sofort nutzbar per Doppelklick, ohne npm, ohne Build, ohne Framework.

### 3. Features im Detail (5 Minuten)
${(mod.features || []).map(f => `- ${f.name}: ${f.status === 'done' ? 'Fertig und getestet' : f.status === 'wip' ? 'In Entwicklung' : 'Geplant'}`).join('\n') || '- Features werden noch dokumentiert'}

### 4. Technischer Deep-Dive (5 Minuten)
- Vanilla HTML5, CSS3, JavaScript ES6+
- DkZ Design System v2: Glassmorphism, Neonrot #fa1e4e
- 34+ Shared Scripts werden dynamisch geladen
- XSS-Schutz durch esc() Funktion in jedem Modul
- localStorage für Offline-First Persistenz

### 5. Zusammenfassung (2 Minuten)
${mod.name} zeigt, dass man ohne React, ohne Angular, ohne npm ein professionelles Tool bauen kann. Es ist Teil eines Ökosystems, das beweist: Vanilla ist nicht "einfach" — es ist eine bewusste Architektur-Entscheidung.

## Metadata
- Dauer: ~15 Minuten
- Sprache: Deutsch
- Stil: Technisch aber zugänglich
- Zielgruppe: Entwickler, Tech-Enthusiasten
- Tags: #devkitz #${mod.slug} #${catInfo.blogTag} #vanilla-js #dashboard
`;
    }

    // --- Batch Generator ---
    function generateForModule(moduleData) {
        return {
            slug: moduleData.slug,
            id: moduleData.id,
            name: moduleData.name,
            infoPage: generateInfoPage(moduleData),
            presentation: generatePresentation(moduleData),
            podcast: generatePodcast(moduleData),
            designMd: typeof DkzDesignGen !== 'undefined' ? DkzDesignGen.forNLM() : null,
            generated: new Date().toISOString(),
            blogLabels: [
                'devkitz', moduleData.slug,
                (CATEGORIES[MODULE_CATEGORIES[moduleData.slug]] || {}).blogTag || 'modul'
            ]
        };
    }

    // --- Modul-Daten aus REGISTRY laden ---
    async function loadModuleData(registryPath) {
        try {
            const res = await fetch(registryPath || '../../REGISTRY.json');
            const registry = await res.json();
            const modules = [];

            for (const [path, entry] of Object.entries(registry.tree || {})) {
                if (entry.type === 'module' || entry.type === 'dashboard') {
                    const slug = path.split('/').pop();
                    let features = [];
                    let description = '';
                    let version = '0.01';
                    let name = slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

                    try {
                        const fRes = await fetch(`../../${entry.features}`);
                        const fData = await fRes.json();
                        features = fData.features || [];
                        description = fData.description || '';
                        version = fData.version || '0.01';
                        name = fData.name || name;
                    } catch { /* features.json nicht verfügbar */ }

                    modules.push({ slug, id: entry.id, name, description, version, features, type: entry.type });
                }
            }

            return modules;
        } catch (err) {
            console.error('REGISTRY laden fehlgeschlagen:', err);
            return [];
        }
    }

    // --- Alles generieren ---
    async function generateAll(registryPath) {
        const modules = await loadModuleData(registryPath);
        const results = [];

        for (const mod of modules) {
            results.push(generateForModule(mod));
        }

        // In localStorage speichern
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify({
                generated: new Date().toISOString(),
                count: results.length,
                modules: results.map(r => ({ slug: r.slug, id: r.id, name: r.name }))
            }));
        } catch { /* localStorage voll oder nicht verfügbar */ }

        return results;
    }

    // --- In Blog Pipeline einfügen ---
    function toBlogPipeline(results) {
        if (typeof BlogUploadPipeline === 'undefined') {
            console.warn('BlogUploadPipeline nicht geladen');
            return [];
        }
        const entries = [];
        for (const r of results) {
            // Infoseite → Blog
            entries.push(BlogUploadPipeline.addToQueue({
                title: `${r.name} — DEVKiTZ™ Modul Infoseite`,
                content: BlogUploadPipeline.markdownToHtml(r.infoPage),
                template: 'konzept',
                labels: [...r.blogLabels, 'infoseite']
            }));
            // Präsentation → Blog
            entries.push(BlogUploadPipeline.addToQueue({
                title: `${r.name} — Präsentation (10 Slides)`,
                content: BlogUploadPipeline.markdownToHtml(r.presentation),
                template: 'tutorial',
                labels: [...r.blogLabels, 'praesentation']
            }));
            // Podcast Source → Blog
            entries.push(BlogUploadPipeline.addToQueue({
                title: `${r.name} — Podcast Deep-Dive Script`,
                content: BlogUploadPipeline.markdownToHtml(r.podcast),
                template: 'konzept',
                labels: [...r.blogLabels, 'podcast']
            }));
        }
        return entries;
    }

    // --- Export als ZIP (einzelne .md Dateien) ---
    function exportAll(results) {
        // Einzelne Downloads (ohne ZIP-Library)
        results.forEach((r, i) => {
            setTimeout(() => {
                const blob = new Blob([r.infoPage], { type: 'text/markdown' });
                const a = document.createElement('a');
                a.href = URL.createObjectURL(blob);
                a.download = `nlm-source_${r.slug}_info.md`;
                a.click();
            }, i * 200);

            setTimeout(() => {
                const blob = new Blob([r.presentation], { type: 'text/markdown' });
                const a = document.createElement('a');
                a.href = URL.createObjectURL(blob);
                a.download = `nlm-source_${r.slug}_slides.md`;
                a.click();
            }, i * 200 + 100);

            setTimeout(() => {
                const blob = new Blob([r.podcast], { type: 'text/markdown' });
                const a = document.createElement('a');
                a.href = URL.createObjectURL(blob);
                a.download = `nlm-source_${r.slug}_podcast.md`;
                a.click();
            }, i * 200 + 150);
        });
    }

    // --- Stats ---
    function getStats(results) {
        return {
            totalModules: results.length,
            totalDocuments: results.length * 3, // info + slides + podcast
            totalInfoPages: results.length,
            totalPresentations: results.length,
            totalPodcasts: results.length,
            categories: Object.entries(
                results.reduce((acc, r) => {
                    const cat = MODULE_CATEGORIES[r.slug] || 'Spezial';
                    acc[cat] = (acc[cat] || 0) + 1;
                    return acc;
                }, {})
            ).map(([cat, count]) => ({ category: cat, count })),
            generated: new Date().toISOString()
        };
    }

    // --- Public API ---
    return {
        VERSION,
        CATEGORIES,
        MODULE_CATEGORIES,
        // Core
        generateForModule,
        generateAll,
        loadModuleData,
        // Output
        generateInfoPage,
        generatePresentation,
        generatePodcast,
        // Integration
        toBlogPipeline,
        exportAll,
        getStats
    };
})();

// Global registrieren
if (typeof window !== 'undefined') {
    window.NLMBatchGen = NLMBatchGen;
}

// Node.js CLI Support
if (typeof module !== 'undefined' && module.exports) {
    module.exports = NLMBatchGen;
}
