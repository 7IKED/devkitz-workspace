/**
 * ⚡ DKZ API — MCP Meta Routes
 * ══════════════════════════════
 * MCP Server Info, Tool List, Config
 */

import { Router } from 'express';

const router = Router();

const MCP_TOOLS = [
    { name: 'dkz_chat', category: 'Chat', description: 'AI Chat mit Multi-Model' },
    { name: 'dkz_summarize', category: 'Chat', description: 'Text zusammenfassen' },
    { name: 'dkz_translate', category: 'Chat', description: 'Text übersetzen' },
    { name: 'dkz_codegen', category: 'Chat', description: 'Code generieren / konvertieren' },
    { name: 'dkz_list_files', category: 'Files', description: 'Dateien auflisten' },
    { name: 'dkz_read_file', category: 'Files', description: 'Datei lesen' },
    { name: 'dkz_write_file', category: 'Files', description: 'Datei schreiben' },
    { name: 'dkz_search_files', category: 'Files', description: 'Dateien suchen' },
    { name: 'dkz_move_file', category: 'Files', description: 'Datei verschieben' },
    { name: 'dkz_health_check', category: 'Health', description: 'System Health Check' },
    { name: 'dkz_incidents', category: 'Health', description: 'Incident Log' },
    { name: 'dkz_metrics', category: 'Health', description: 'System Metriken' },
    { name: 'dkz_list_modules', category: 'Modules', description: 'Module auflisten' },
    { name: 'dkz_module_info', category: 'Modules', description: 'Modul-Details' },
    { name: 'dkz_register_module', category: 'Modules', description: 'Modul registrieren' },
    { name: 'dkz_seo_analyze', category: 'SEO', description: 'SEO Analyse' },
    { name: 'dkz_keyword_research', category: 'SEO', description: 'Keyword-Recherche' },
    { name: 'dkz_generate_meta', category: 'SEO', description: 'Meta-Tags generieren' },
    { name: 'dkz_list_workflows', category: 'Workflow', description: 'Workflows auflisten' },
    { name: 'dkz_start_workflow', category: 'Workflow', description: 'Workflow starten' },
    { name: 'dkz_create_task', category: 'Workflow', description: 'Task erstellen' },
    { name: 'dkz_git_sync', category: 'System', description: 'Git Sync' },
    { name: 'dkz_ecosystem_info', category: 'System', description: 'Ökosystem Info' },
    { name: 'dkz_mcp_info', category: 'System', description: 'MCP Server Info' }
];

// ─── GET /mcp/info ───
router.get('/mcp/info', (req, res) => {
    res.json({
        name: 'DkZ MCP Server',
        version: 'v1.01.1_01',
        protocol: 'MCP v1.0 (JSON-RPC 2.0)',
        transport: 'stdio',
        toolCount: MCP_TOOLS.length,
        resourceCount: 4,
        promptCount: 4,
        categories: [...new Set(MCP_TOOLS.map(t => t.category))],
        configPath: 'mcp-server/',
        status: 'ready'
    });
});

// ─── GET /mcp/tools ───
router.get('/mcp/tools', (req, res) => {
    const { category } = req.query;
    let tools = [...MCP_TOOLS];
    if (category) tools = tools.filter(t => t.category === category);
    res.json({ tools, count: tools.length });
});

// ─── GET /mcp/config ───
router.get('/mcp/config', (req, res) => {
    // Generate MCP client config for different editors
    res.json({
        gemini: {
            mcpServers: {
                dkz: {
                    command: 'node',
                    args: ['C:/DEVKiTZ/01_PROJECTS/01_dashboard/mcp-server/index.js'],
                    env: {
                        DKZ_API_URL: 'http://localhost:3040'
                    }
                }
            }
        },
        claude_desktop: {
            mcpServers: {
                dkz: {
                    command: 'node',
                    args: ['C:/DEVKiTZ/01_PROJECTS/01_dashboard/mcp-server/index.js'],
                    env: {
                        DKZ_API_URL: 'http://localhost:3040'
                    }
                }
            }
        },
        cursor: {
            mcpServers: {
                dkz: {
                    command: 'node',
                    args: ['C:/DEVKiTZ/01_PROJECTS/01_dashboard/mcp-server/index.js']
                }
            }
        },
        vscode: {
            'mcp.servers': {
                dkz: {
                    type: 'stdio',
                    command: 'node',
                    args: ['C:/DEVKiTZ/01_PROJECTS/01_dashboard/mcp-server/index.js']
                }
            }
        }
    });
});

export { router as mcpRoutes };
