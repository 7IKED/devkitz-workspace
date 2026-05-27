/**
 * DkZ Generate Docs — Auto-generate README.md per module
 * @DKZ:TAG → [SYS:docs] [CAT:shared] [LANG:js]
 * @DKZ:RULES → R21 Shared Scripts
 * @version v0.01.1_01
 *
 * Usage: node shared/generate-docs.js
 * Output: README.md in each module directory
 */
const fs = require('fs');
const path = require('path');

const MODULES_DIR = path.join(__dirname, '..', 'modules');

console.log('📚 DkZ Docs Generator\n');

let count = 0;
const dirs = fs.readdirSync(MODULES_DIR).filter(d => fs.statSync(path.join(MODULES_DIR, d)).isDirectory());

dirs.forEach(dir => {
    const indexPath = path.join(MODULES_DIR, dir, 'index.html');
    if (!fs.existsSync(indexPath)) return;

    const html = fs.readFileSync(indexPath, 'utf8');

    // Extract title
    const titleMatch = html.match(/<title>(.+?)<\/title>/);
    const title = titleMatch ? titleMatch[1].replace(/ - DkZ.*$/, '').replace(/[🎯💬📊🔧🎨📝🔍🔐📋🔄⚡🚀📦✅]/g, '').trim() : dir;

    // Extract description
    const descMatch = html.match(/<meta name="description" content="(.+?)"/);
    const desc = descMatch ? descMatch[1] : `DkZ ${title} Module`;

    // Check features
    const hasTheme = html.includes('dkz-theme.css');
    const hasDebug = html.includes('dkz-debug.js');
    const hasGuide = html.includes('dkz-guide.js');
    const hasCopilot = html.includes('dkz-copilot.js');
    const hasShortcuts = html.includes('dkz-shortcuts.js');
    const hasExport = html.includes('dkz-export.js');
    const hasCrosslinks = html.includes('dkz-crosslinks.js');
    const hasA11y = html.includes('dkz-a11y.js');
    const hasTest = html.includes('dkz-test.js');
    const hasBlobs = html.includes('bg-mesh');

    // Extract localStorage keys
    const lsKeys = [];
    const lsMatches = html.matchAll(/localStorage\.(get|set)Item\(\s*['"]([^'"]+)['"]/g);
    for (const m of lsMatches) { if (!lsKeys.includes(m[2])) lsKeys.push(m[2]); }

    // Build README
    const readme = `# ${title}

> ${desc}

## Modul-Info

| Eigenschaft | Wert |
|------------|------|
| **Pfad** | \`modules/${dir}/index.html\` |
| **Version** | v0.01 |
| **Status** | ✅ Aktiv |

## Shared Scripts

| Script | Status |
|--------|--------|
| dkz-theme.css | ${hasTheme ? '✅' : '❌'} |
| dkz-debug.js | ${hasDebug ? '✅' : '❌'} |
| dkz-guide.js | ${hasGuide ? '✅' : '❌'} |
| dkz-copilot.js | ${hasCopilot ? '✅' : '❌'} |
| dkz-shortcuts.js | ${hasShortcuts ? '✅' : '❌'} |
| dkz-export.js | ${hasExport ? '✅' : '❌'} |
| dkz-crosslinks.js | ${hasCrosslinks ? '✅' : '❌'} |
| dkz-a11y.js | ${hasA11y ? '✅' : '❌'} |
| dkz-test.js | ${hasTest ? '✅' : '❌'} |
| Background Blobs | ${hasBlobs ? '✅' : '❌'} |

## Tastenkürzel

| Taste | Aktion |
|-------|--------|
| \`?\` | Shortcut-Hilfe |
| \`/\` | Suche |
| \`Esc\` | Schließen |
| \`Ctrl+S\` | Speichern |
| \`Ctrl+E\` | Export |
| \`Ctrl+K\` | Copilot |
| \`Ctrl+T\` | Tests |

${lsKeys.length ? `## localStorage Keys\n\n${lsKeys.map(k => `- \`${k}\``).join('\n')}\n` : ''}
---
*Auto-generiert von \`generate-docs.js\` — ${new Date().toISOString().split('T')[0]}*
`;

    fs.writeFileSync(path.join(MODULES_DIR, dir, 'README.md'), readme, 'utf8');
    count++;
});

console.log(`✅ ${count} README.md Dateien generiert`);
