#!/usr/bin/env node
/**
 * build-wiki-index.js – Scannt das AiAiKirk Wiki und erzeugt wiki-index.json
 * Ausführen: node build-wiki-index.js
 * Das Dashboard lädt diese JSON-Datei für das Hamburger-Seitenpanel.
 */
const fs = require('fs');
const path = require('path');

const WIKI_ROOT = 'C:\\DEVKiTZ\\AiAiKirk\\code\\wiki';
const OUTPUT = path.join(__dirname, 'wiki-index.json');

function parseFrontmatter(content) {
    const m = content.match(/^---\n([\s\S]*?)\n---/);
    if (!m) return {};
    const fm = {};
    m[1].split('\n').forEach(line => {
        const idx = line.indexOf(':');
        if (idx > 0) {
            const key = line.slice(0, idx).trim();
            let val = line.slice(idx + 1).trim().replace(/^["']|["']$/g, '');
            if (val.startsWith('[') && val.endsWith(']')) {
                val = val.slice(1, -1).split(',').map(s => s.trim().replace(/^["']|["']$/g, ''));
            }
            fm[key] = val;
        }
    });
    return fm;
}

function getPreview(content, maxLen = 200) {
    const body = content.replace(/^---[\s\S]*?---/, '').trim();
    const clean = body.replace(/#{1,6}\s/g, '').replace(/[*_`>]/g, '').replace(/\n+/g, ' ').trim();
    return clean.length > maxLen ? clean.slice(0, maxLen) + '…' : clean;
}

function scanDir(dir, base = '') {
    const entries = [];
    if (!fs.existsSync(dir)) return entries;
    for (const item of fs.readdirSync(dir, { withFileTypes: true })) {
        const rel = path.join(base, item.name);
        const full = path.join(dir, item.name);
        if (item.isDirectory() && !item.name.startsWith('.') && item.name !== 'assets') {
            entries.push(...scanDir(full, rel));
        } else if (item.isFile() && item.name.endsWith('.md')) {
            const content = fs.readFileSync(full, 'utf-8');
            const fm = parseFrontmatter(content);
            const category = base.split(path.sep)[0] || 'root';
            entries.push({
                id: rel.replace(/\\/g, '/').replace('.md', ''),
                file: rel.replace(/\\/g, '/'),
                title: fm.title || fm.prompt_id || item.name.replace('.md', ''),
                prefix: fm.prefix || fm.prompt_id || '',
                category,
                tags: Array.isArray(fm.tags) ? fm.tags : (fm.tags || '').split(',').map(s => s.trim()).filter(Boolean),
                status: fm.status || 'active',
                date: fm.created || fm.date || fm.updated || '',
                author: fm.author || 'Seven',
                preview: getPreview(content),
                content: content,
                size: content.length,
            });
        }
    }
    return entries;
}

const entries = scanDir(WIKI_ROOT);
const index = {
    generated: new Date().toISOString(),
    root: WIKI_ROOT.replace(/\\/g, '/'),
    count: entries.length,
    categories: [...new Set(entries.map(e => e.category))],
    entries
};

fs.writeFileSync(OUTPUT, JSON.stringify(index, null, 2), 'utf-8');
console.log(`✅ wiki-index.json: ${entries.length} entries from ${index.categories.length} categories`);
