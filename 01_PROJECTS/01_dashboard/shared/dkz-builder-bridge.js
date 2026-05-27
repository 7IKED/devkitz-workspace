/**
 * DkZ Builder Bridge — Auto-Save aller Builder zu James/Iceberg
 * @DKZ:TAG [SHARED:builder-bridge] [CAT:integration] [LANG:js]
 * @DKZ:RULES R95 Prompt-Archivpflicht, R96 Playbook-Bindung, GM-07 Score-Tracking
 * @version v0.01.1_01
 * 
 * Verbindet ALLE 8 Builder-Module bidirektional mit dem James/Iceberg System:
 * action-builder, skill-builder, workflow-builder, agent-builder,
 * team-builder, app-builder, cron-builder, changelog-builder
 * 
 * Features:
 * - Auto-Save: Jedes gebaute Element -> Iceberg + James Score
 * - Auto-Load: Iceberg-Katalog in Builder verfuegbar
 * - Kategorie-Sync: Builder-Typ -> Iceberg-Kategorie
 * - Event-Hooks: beforeSave, afterSave, onScore
 * 
 * Einbinden: <script src="../../shared/dkz-builder-bridge.js"></script>
 */
const DkzBuilderBridge = (() => {
    'use strict';

    const VERSION = '1.0.0';
    const LS_CATALOG = 'dkz-builder-catalog';

    // ═══════════════════════════════════════
    // BUILDER-TYP -> ICEBERG KATEGORIE MAPPING
    // ═══════════════════════════════════════
    const BUILDER_MAP = {
        'action-builder': { category: 'actions', icon: '\u26A1', label: 'Action' },
        'skill-builder': { category: 'skills', icon: '\uD83D\uDD27', label: 'Skill' },
        'workflow-builder': { category: 'workflows', icon: '\uD83D\uDD04', label: 'Workflow' },
        'agent-builder': { category: 'agents', icon: '\uD83E\uDD16', label: 'Agent' },
        'team-builder': { category: 'teams', icon: '\uD83D\uDC65', label: 'Team' },
        'app-builder': { category: 'general', icon: '\uD83D\uDCF1', label: 'App' },
        'cron-builder': { category: 'workflows', icon: '\u23F0', label: 'Cron' },
        'changelog-builder': { category: 'general', icon: '\uD83D\uDCCB', label: 'Changelog' },
        'prompt-generator': { category: 'general', icon: '\u270D\uFE0F', label: 'Prompt' },
        'prompter': { category: 'general', icon: '\uD83D\uDCAC', label: 'Prompt' }
    };

    // ═══════════════════════════════════════
    // EXTERNAL CATALOG (from ZIP imports)
    // ═══════════════════════════════════════
    const EXTERNAL_CATALOG = {
        // claude-octopus personas (29 agents)
        agents: [
            { id: 'ext-academic-writer', name: 'Academic Writer', source: 'claude-octopus', phase: 'ink', tier: 'standard', file: 'personas/academic-writer.md' },
            { id: 'ext-ai-engineer', name: 'AI Engineer', source: 'claude-octopus', phase: 'probe', tier: 'premium', expertise: ['llm-applications','rag-systems','prompt-engineering'], file: 'personas/ai-engineer.md' },
            { id: 'ext-backend-architect', name: 'Backend Architect', source: 'claude-octopus', phase: 'grasp', tier: 'premium', expertise: ['api-design','microservices','distributed-systems'], file: 'personas/backend-architect.md' },
            { id: 'ext-business-analyst', name: 'Business Analyst', source: 'claude-octopus', phase: 'probe', tier: 'standard', expertise: ['requirements','metrics','stakeholder-analysis'], file: 'personas/business-analyst.md' },
            { id: 'ext-cloud-architect', name: 'Cloud Architect', source: 'claude-octopus', phase: 'grasp', tier: 'premium', file: 'personas/cloud-architect.md' },
            { id: 'ext-code-reviewer', name: 'Code Reviewer', source: 'claude-octopus', phase: 'ink', tier: 'standard', file: 'personas/code-reviewer.md' },
            { id: 'ext-content-analyst', name: 'Content Analyst', source: 'claude-octopus', phase: 'probe', tier: 'standard', file: 'personas/content-analyst.md' },
            { id: 'ext-context-manager', name: 'Context Manager', source: 'claude-octopus', phase: 'probe', tier: 'standard', file: 'personas/context-manager.md' },
            { id: 'ext-database-architect', name: 'Database Architect', source: 'claude-octopus', phase: 'grasp', tier: 'premium', file: 'personas/database-architect.md' },
            { id: 'ext-debugger', name: 'Debugger', source: 'claude-octopus', phase: 'tangle', tier: 'standard', file: 'personas/debugger.md' },
            { id: 'ext-deployment-engineer', name: 'Deployment Engineer', source: 'claude-octopus', phase: 'ink', tier: 'standard', file: 'personas/deployment-engineer.md' },
            { id: 'ext-devops-troubleshooter', name: 'DevOps Troubleshooter', source: 'claude-octopus', phase: 'tangle', tier: 'standard', file: 'personas/devops-troubleshooter.md' },
            { id: 'ext-docs-architect', name: 'Docs Architect', source: 'claude-octopus', phase: 'ink', tier: 'standard', file: 'personas/docs-architect.md' },
            { id: 'ext-exec-communicator', name: 'Executive Communicator', source: 'claude-octopus', phase: 'ink', tier: 'standard', file: 'personas/exec-communicator.md' },
            { id: 'ext-frontend-developer', name: 'Frontend Developer', source: 'claude-octopus', phase: 'grasp', tier: 'premium', file: 'personas/frontend-developer.md' },
            { id: 'ext-graphql-architect', name: 'GraphQL Architect', source: 'claude-octopus', phase: 'grasp', tier: 'premium', file: 'personas/graphql-architect.md' },
            { id: 'ext-incident-responder', name: 'Incident Responder', source: 'claude-octopus', phase: 'tangle', tier: 'premium', file: 'personas/incident-responder.md' },
            { id: 'ext-mermaid-expert', name: 'Mermaid Expert', source: 'claude-octopus', phase: 'ink', tier: 'standard', file: 'personas/mermaid-expert.md' },
            { id: 'ext-performance-engineer', name: 'Performance Engineer', source: 'claude-octopus', phase: 'ink', tier: 'premium', file: 'personas/performance-engineer.md' },
            { id: 'ext-product-writer', name: 'Product Writer', source: 'claude-octopus', phase: 'ink', tier: 'standard', file: 'personas/product-writer.md' },
            { id: 'ext-python-pro', name: 'Python Pro', source: 'claude-octopus', phase: 'tangle', tier: 'premium', file: 'personas/python-pro.md' },
            { id: 'ext-research-synthesizer', name: 'Research Synthesizer', source: 'claude-octopus', phase: 'probe', tier: 'standard', file: 'personas/research-synthesizer.md' },
            { id: 'ext-security-auditor', name: 'Security Auditor', source: 'claude-octopus', phase: 'ink', tier: 'premium', file: 'personas/security-auditor.md' },
            { id: 'ext-strategy-analyst', name: 'Strategy Analyst', source: 'claude-octopus', phase: 'probe', tier: 'standard', file: 'personas/strategy-analyst.md' },
            { id: 'ext-tdd-orchestrator', name: 'TDD Orchestrator', source: 'claude-octopus', phase: 'tangle', tier: 'premium', file: 'personas/tdd-orchestrator.md' },
            { id: 'ext-test-automator', name: 'Test Automator', source: 'claude-octopus', phase: 'ink', tier: 'premium', file: 'personas/test-automator.md' },
            { id: 'ext-thought-partner', name: 'Thought Partner', source: 'claude-octopus', phase: 'probe', tier: 'standard', file: 'personas/thought-partner.md' },
            { id: 'ext-typescript-pro', name: 'TypeScript Pro', source: 'claude-octopus', phase: 'tangle', tier: 'premium', file: 'personas/typescript-pro.md' },
            { id: 'ext-ux-researcher', name: 'UX Researcher', source: 'claude-octopus', phase: 'probe', tier: 'standard', file: 'personas/ux-researcher.md' }
        ],
        // claude-octopus skills
        skills: [
            { id: 'ext-skill-architecture', name: 'Architecture Review', source: 'claude-octopus', file: 'skills/architecture.md' },
            { id: 'ext-skill-code-review', name: 'Code Review', source: 'claude-octopus', file: 'skills/code-review.md' },
            { id: 'ext-skill-security-audit', name: 'Security Audit', source: 'claude-octopus', file: 'skills/security-audit.md' }
        ],
        // claude-octopus principles
        principles: [
            { id: 'ext-principle-general', name: 'General Principles', source: 'claude-octopus', file: 'principles/general.md' },
            { id: 'ext-principle-maintainability', name: 'Maintainability', source: 'claude-octopus', file: 'principles/maintainability.md' },
            { id: 'ext-principle-performance', name: 'Performance', source: 'claude-octopus', file: 'principles/performance.md' },
            { id: 'ext-principle-security', name: 'Security', source: 'claude-octopus', file: 'principles/security.md' }
        ],
        // Phase system from octopus
        phases: {
            probe: { name: 'Probe (Discover)', agents: ['ai-engineer','business-analyst','context-manager','research-synthesizer','strategy-analyst','content-analyst','thought-partner','ux-researcher'] },
            grasp: { name: 'Grasp (Define)', agents: ['backend-architect','frontend-developer','database-architect','cloud-architect','graphql-architect'] },
            tangle: { name: 'Tangle (Develop)', agents: ['tdd-orchestrator','debugger','devops-troubleshooter','python-pro','typescript-pro','incident-responder'] },
            ink: { name: 'Ink (Deliver)', agents: ['code-reviewer','security-auditor','test-automator','performance-engineer','deployment-engineer','docs-architect','product-writer','exec-communicator','mermaid-expert','academic-writer'] }
        },
        // Docs reference (from all 3 ZIPs)
        docs: [
            // Octopus docs
            { id: 'doc-agents', name: 'Agents Guide', source: 'claude-octopus', file: 'docs/AGENTS.md' },
            { id: 'doc-architecture', name: 'Architecture', source: 'claude-octopus', file: 'docs/ARCHITECTURE.md' },
            { id: 'doc-triggers', name: 'Trigger Patterns', source: 'claude-octopus', file: 'docs/TRIGGER_PATTERNS.md' },
            { id: 'doc-workflows', name: 'Workflow Skills', source: 'claude-octopus', file: 'docs/WORKFLOW-SKILLS.md' },
            { id: 'doc-output-format', name: 'Output Format', source: 'claude-octopus', file: 'docs/OUTPUT-FORMAT-STANDARD.md' },
            { id: 'doc-error-handling', name: 'Error Handling', source: 'claude-octopus', file: 'docs/ERROR-HANDLING-STANDARD.md' },
            { id: 'doc-knowledge-workers', name: 'Knowledge Workers', source: 'claude-octopus', file: 'docs/KNOWLEDGE-WORKERS.md' },
            { id: 'doc-plugin-arch', name: 'Plugin Architecture', source: 'claude-octopus', file: 'docs/PLUGIN-ARCHITECTURE.md' },
            { id: 'doc-visual-indicators', name: 'Visual Indicators', source: 'claude-octopus', file: 'docs/VISUAL-INDICATORS.md' },
            { id: 'doc-companion-skills', name: 'Companion Skills', source: 'claude-octopus', file: 'docs/COMPANION-SKILLS.md' },
            // Auto-claude guides
            { id: 'doc-cli-usage', name: 'CLI Usage', source: 'auto-claude', file: 'guides/CLI-USAGE.md' },
            { id: 'doc-docker-setup', name: 'Docker Setup', source: 'auto-claude', file: 'guides/DOCKER-SETUP.md' },
            // Cookbook examples
            { id: 'doc-prompting', name: 'Prompting Cookbook', source: 'cookbook', file: 'examples/prompting' },
            { id: 'doc-langchain', name: 'LangChain Integration', source: 'cookbook', file: 'examples/langchain' },
            { id: 'doc-chromadb', name: 'ChromaDB Vectors', source: 'cookbook', file: 'examples/chromadb' },
            { id: 'doc-google-adk', name: 'Google ADK', source: 'cookbook', file: 'examples/google-adk' },
            { id: 'doc-json-caps', name: 'JSON Capabilities', source: 'cookbook', file: 'examples/json_capabilities' }
        ]
    };

    // ═══════════════════════════════════════
    // AUTO-SAVE: Builder -> Iceberg + James Score
    // ═══════════════════════════════════════
    function autoSave(builderType, data) {
        if (!data || !data.name) return { error: 'Kein Name angegeben' };

        var mapping = BUILDER_MAP[builderType] || BUILDER_MAP['prompter'];
        var promptText = buildPromptFromData(builderType, data);
        var result = { builderType: builderType, name: data.name };

        // 1. James Score
        if (typeof DkzJames !== 'undefined') {
            var jResult = DkzJames.evaluate(promptText, 'prompt');
            result.score = jResult.score;
            result.grade = jResult.grade;
            result.issues = jResult.issues;
        }

        // 2. Iceberg Versioning
        if (typeof DkzIceberg !== 'undefined') {
            var iceResult = DkzIceberg.savePrompt(promptText, {
                id: 'BLD-' + builderType + '-' + sanitizeId(data.name),
                category: mapping.category,
                score: result.score || 0,
                grade: result.grade || '?',
                tags: [builderType, mapping.category, data.name]
            });
            result.iceberg = iceResult;
        }

        // 3. Local catalog
        saveToCatalog(builderType, data, result);

        // 4. Event
        if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('dkz-builder-save', { detail: result }));
        }

        return result;
    }

    function buildPromptFromData(builderType, data) {
        var lines = [];
        lines.push('# ' + (BUILDER_MAP[builderType] || {}).label + ': ' + data.name);
        if (data.description) lines.push(data.description);
        if (data.steps) lines.push('## Steps\n' + data.steps.map(function(s, i) { return (i + 1) + '. ' + s; }).join('\n'));
        if (data.config) lines.push('## Config\n' + JSON.stringify(data.config, null, 2));
        if (data.prompt) lines.push('## Prompt\n' + data.prompt);
        if (data.code) lines.push('## Code\n```\n' + data.code + '\n```');
        return lines.join('\n\n');
    }

    function sanitizeId(name) {
        return (name || 'unnamed').toLowerCase().replace(/[^a-z0-9]/g, '-').substring(0, 30);
    }

    // ═══════════════════════════════════════
    // LOCAL CATALOG
    // ═══════════════════════════════════════
    function saveToCatalog(builderType, data, result) {
        var catalog = getCatalog();
        var key = builderType + '/' + sanitizeId(data.name);
        catalog[key] = {
            builderType: builderType,
            name: data.name,
            category: (BUILDER_MAP[builderType] || {}).category || 'general',
            score: result.score || 0,
            grade: result.grade || '?',
            icebergId: result.iceberg ? result.iceberg.id : null,
            ts: Date.now()
        };
        localStorage.setItem(LS_CATALOG, JSON.stringify(catalog));
    }

    function getCatalog() {
        return JSON.parse(localStorage.getItem(LS_CATALOG) || '{}');
    }

    // ═══════════════════════════════════════
    // AUTO-LOAD: Iceberg -> Builder
    // ═══════════════════════════════════════
    function loadForBuilder(builderType) {
        var mapping = BUILDER_MAP[builderType];
        if (!mapping) return [];

        var results = [];

        // From Iceberg
        if (typeof DkzIceberg !== 'undefined') {
            var prompts = DkzIceberg.listPrompts({ category: mapping.category, limit: 20 });
            results = results.concat(prompts.map(function(p) {
                return { id: p.id, name: p.id, category: p.category, score: p.latestScore, trend: p.trend, source: 'iceberg' };
            }));
        }

        // From external catalog
        if (mapping.category === 'agents') {
            results = results.concat(EXTERNAL_CATALOG.agents.map(function(a) {
                return { id: a.id, name: a.name, category: 'agents', source: a.source, phase: a.phase, tier: a.tier };
            }));
        }

        // From local catalog
        var catalog = getCatalog();
        Object.keys(catalog).forEach(function(key) {
            if (catalog[key].category === mapping.category) {
                results.push({ id: key, name: catalog[key].name, score: catalog[key].score, source: 'local' });
            }
        });

        return results;
    }

    // ═══════════════════════════════════════
    // SEARCH ACROSS ALL SOURCES
    // ═══════════════════════════════════════
    function search(query) {
        var q = (query || '').toLowerCase();
        var results = [];

        // External agents
        EXTERNAL_CATALOG.agents.forEach(function(a) {
            if (a.name.toLowerCase().indexOf(q) !== -1 || (a.expertise || []).join(' ').toLowerCase().indexOf(q) !== -1) {
                results.push({ type: 'agent', id: a.id, name: a.name, source: a.source, phase: a.phase });
            }
        });

        // External skills
        EXTERNAL_CATALOG.skills.forEach(function(s) {
            if (s.name.toLowerCase().indexOf(q) !== -1) {
                results.push({ type: 'skill', id: s.id, name: s.name, source: s.source });
            }
        });

        // External docs
        EXTERNAL_CATALOG.docs.forEach(function(d) {
            if (d.name.toLowerCase().indexOf(q) !== -1) {
                results.push({ type: 'doc', id: d.id, name: d.name, source: d.source, file: d.file });
            }
        });

        // Local catalog
        var catalog = getCatalog();
        Object.keys(catalog).forEach(function(key) {
            if (key.toLowerCase().indexOf(q) !== -1 || catalog[key].name.toLowerCase().indexOf(q) !== -1) {
                results.push({ type: catalog[key].category, id: key, name: catalog[key].name, score: catalog[key].score, source: 'local' });
            }
        });

        return results;
    }

    // ═══════════════════════════════════════
    // STATS
    // ═══════════════════════════════════════
    function getStats() {
        var catalog = getCatalog();
        var localCount = Object.keys(catalog).length;
        var byType = {};
        Object.values(catalog).forEach(function(e) {
            var t = e.builderType || 'unknown';
            byType[t] = (byType[t] || 0) + 1;
        });

        return {
            local: localCount,
            externalAgents: EXTERNAL_CATALOG.agents.length,
            externalSkills: EXTERNAL_CATALOG.skills.length,
            externalDocs: EXTERNAL_CATALOG.docs.length,
            externalPrinciples: EXTERNAL_CATALOG.principles.length,
            phases: Object.keys(EXTERNAL_CATALOG.phases).length,
            byBuilderType: byType,
            total: localCount + EXTERNAL_CATALOG.agents.length + EXTERNAL_CATALOG.skills.length + EXTERNAL_CATALOG.docs.length
        };
    }

    // ═══════════════════════════════════════
    // PUBLIC API
    // ═══════════════════════════════════════
    return {
        version: VERSION,
        BUILDER_MAP: BUILDER_MAP,
        EXTERNAL_CATALOG: EXTERNAL_CATALOG,
        autoSave: autoSave,
        loadForBuilder: loadForBuilder,
        search: search,
        getCatalog: getCatalog,
        getStats: getStats
    };
})();

if (typeof window !== 'undefined') window.DkzBuilderBridge = DkzBuilderBridge;
