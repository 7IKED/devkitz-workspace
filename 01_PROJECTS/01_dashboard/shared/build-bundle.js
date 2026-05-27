/**
 * DkZ Build Bundle — Concat Shared Scripts
 * @DKZ:TAG → [SYS:build] [CAT:shared] [LANG:js]
 * @DKZ:RULES → R21 Shared Scripts
 * @version v0.01.1_01
 *
 * Usage: node shared/build-bundle.js
 * Output: shared/dkz-bundle.min.js
 */
const fs = require('fs');
const path = require('path');

const SHARED = path.join(__dirname);
const BUNDLE_FILES = [
    'dkz-debug.js',
    'dkz-a11y.js',
    'dkz-shortcuts.js',
    'dkz-export.js',
    'dkz-crosslinks.js',
    'dkz-test.js',
];
const LAZY_FILES = ['dkz-guide.js', 'dkz-copilot.js'];
const OUT = path.join(SHARED, 'dkz-bundle.min.js');

console.log('🔧 DkZ Bundle Build\n');

let bundle = `/* DkZ Bundle — Auto-generated ${new Date().toISOString()} */\n`;
let totalLines = 0;

BUNDLE_FILES.forEach(file => {
    const fp = path.join(SHARED, file);
    if (!fs.existsSync(fp)) { console.log(`⚠️  SKIP: ${file} (not found)`); return; }
    const content = fs.readFileSync(fp, 'utf8');
    const lines = content.split('\n').length;
    totalLines += lines;
    bundle += `\n/* ═══ ${file} ═══ */\n${content}\n`;
    console.log(`✅ ${file} (${lines} Zeilen)`);
});

// Basic minification: remove comments, collapse whitespace
let minified = bundle
    .replace(/\/\*[\s\S]*?\*\//g, '') // block comments
    .replace(/\/\/.*$/gm, '')          // line comments
    .replace(/\n\s*\n/g, '\n')        // empty lines
    .replace(/^\s+/gm, '');           // leading whitespace

fs.writeFileSync(OUT, minified, 'utf8');
const sizeKB = (Buffer.byteLength(minified, 'utf8') / 1024).toFixed(1);
console.log(`\n📦 Bundle: dkz-bundle.min.js (${sizeKB} KB, ${totalLines} Zeilen orig.)`);
console.log(`\n💡 Lazy-loaded (separate): ${LAZY_FILES.join(', ')}`);
