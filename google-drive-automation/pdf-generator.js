/**
 * DkZÔäó PDF Handbuch Generator
 * ÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉ
 * Sammelt alle README.md + llms.txt ÔåÆ DkZ-gebrandetes PDF
 * 
 * Nutzung:
 *   node pdf-generator.js          ÔåÆ Generiert PDF
 *   node pdf-generator.js --watch  ÔåÆ Beobachtet ├änderungen
 * 
 * Als Pre-Commit Hook:
 *   Kopiere nach .git/hooks/pre-commit
 * 
 * @version 1.0.0
 */

import { readdir, readFile, writeFile, stat } from 'fs/promises';
import { join, basename, relative } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const ROOT = join(__dirname, '../..');  // C:\DEVKiTZ\
const OUTPUT = join(__dirname, '../docs/DkZ-Handbuch.html');

const BRAND = {
  accent: '#fa1e4e',
  bg: '#060608',
  green: '#00ff88',
  yellow: '#ffb800',
  red: '#ff3b5c',
  font: 'Inter, system-ui, sans-serif',
  mono: 'JetBrains Mono, monospace'
};

/**
 * Rekursiv alle .md und llms.txt Dateien finden
 */
async function findDocs(dir, files = [], depth = 0) {
  if (depth > 5) return files;
  
  const skip = ['node_modules', '.git', '99_ARCHIVE', '.gemini', 'dist', 'build', 
    '00_INBOX', 'downloads', 'RAW', '.agents', 'special-bot-anwendungen', 
    'github-hub', '.github', 'vendor', '__pycache__', '.vscode', '.idea'];
  
  try {
    const entries = await readdir(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      if (skip.includes(entry.name)) continue;
      const full = join(dir, entry.name);
      
      if (entry.isDirectory()) {
        await findDocs(full, files, depth + 1);
      } else if (
        entry.name === 'README.md' || 
        entry.name === 'llms.txt' ||
        entry.name === 'CLAUDE.md' ||
        entry.name === 'REGELWERK.md'
      ) {
        const s = await stat(full);
        files.push({ 
          path: full, 
          name: entry.name, 
          dir: relative(ROOT, dir), 
          size: s.size,
          modified: s.mtime 
        });
      }
    }
  } catch (e) { /* skip unreadable dirs */ }
  
  return files;
}

/**
 * Markdown zu HTML konvertieren (einfach, ohne Lib)
 */
function mdToHtml(md) {
  return md
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^# (.+)$/gm, '<h1>$1</h1>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/```(\w*)\n([\s\S]*?)```/g, '<pre class="code-block"><code>$2</code></pre>')
    .replace(/^\- (.+)$/gm, '<li>$1</li>')
    .replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
    .replace(/^---$/gm, '<hr>')
    .replace(/\n\n/g, '</p><p>')
    .replace(/^(?!<[huploa])/gm, '');
}

/**
 * Vollst├ñndiges HTML-Dokument generieren
 */
function buildHtml(docs) {
  const toc = docs.map((d, i) => 
    `<a href="#doc-${i}" class="toc-item">${d.dir}/${d.name}</a>`
  ).join('\n');

  const sections = docs.map((d, i) => `
    <section id="doc-${i}" class="doc-section">
      <div class="section-header">
        <span class="section-path">${d.dir}/</span>
        <span class="section-name">${d.name}</span>
        <span class="section-meta">${Math.round(d.size/1024)}KB ┬À ${d.modified.toLocaleDateString('de-DE')}</span>
      </div>
      <div class="section-content">
        ${mdToHtml(d.content)}
      </div>
    </section>
  `).join('\n');

  return `<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>DkZÔäó Handbuch</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700&family=JetBrains+Mono:wght@400;600&display=swap');
    
    * { margin: 0; padding: 0; box-sizing: border-box; }
    
    body {
      font-family: ${BRAND.font};
      background: ${BRAND.bg};
      color: #e0e0e0;
      line-height: 1.7;
    }
    
    .cover {
      height: 100vh;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      background: linear-gradient(135deg, ${BRAND.bg} 0%, #0a0a12 50%, ${BRAND.bg} 100%);
      border-bottom: 2px solid ${BRAND.accent};
      page-break-after: always;
    }
    
    .cover h1 {
      font-size: 4rem;
      font-weight: 700;
      background: linear-gradient(135deg, ${BRAND.accent}, ${BRAND.yellow});
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      margin-bottom: 1rem;
    }
    
    .cover .subtitle {
      font-size: 1.2rem;
      color: #888;
      letter-spacing: 0.3em;
      text-transform: uppercase;
    }
    
    .cover .date {
      margin-top: 3rem;
      color: #555;
      font-family: ${BRAND.mono};
    }
    
    .toc {
      padding: 3rem;
      page-break-after: always;
    }
    
    .toc h2 {
      color: ${BRAND.accent};
      margin-bottom: 1.5rem;
      font-size: 1.5rem;
    }
    
    .toc-item {
      display: block;
      padding: 0.5rem 1rem;
      color: #aaa;
      text-decoration: none;
      border-left: 2px solid #222;
      margin-bottom: 0.25rem;
      font-family: ${BRAND.mono};
      font-size: 0.85rem;
      transition: all 0.2s;
    }
    
    .toc-item:hover {
      color: ${BRAND.accent};
      border-color: ${BRAND.accent};
      background: rgba(250, 30, 78, 0.05);
    }
    
    .doc-section {
      padding: 2rem 3rem;
      border-bottom: 1px solid #1a1a1a;
      page-break-inside: avoid;
    }
    
    .section-header {
      display: flex;
      align-items: baseline;
      gap: 0.5rem;
      margin-bottom: 1.5rem;
      padding-bottom: 0.75rem;
      border-bottom: 1px solid #222;
    }
    
    .section-path { color: #555; font-family: ${BRAND.mono}; font-size: 0.8rem; }
    .section-name { color: ${BRAND.accent}; font-weight: 600; font-size: 1.1rem; }
    .section-meta { margin-left: auto; color: #444; font-size: 0.75rem; font-family: ${BRAND.mono}; }
    
    .section-content h1 { color: ${BRAND.accent}; font-size: 1.5rem; margin: 1.5rem 0 0.75rem; }
    .section-content h2 { color: ${BRAND.yellow}; font-size: 1.2rem; margin: 1.25rem 0 0.5rem; }
    .section-content h3 { color: ${BRAND.green}; font-size: 1rem; margin: 1rem 0 0.5rem; }
    
    .section-content code {
      background: #111;
      padding: 0.15em 0.4em;
      border-radius: 3px;
      font-family: ${BRAND.mono};
      font-size: 0.85em;
      color: ${BRAND.green};
    }
    
    .code-block {
      background: #0a0a0f;
      border: 1px solid #1a1a2a;
      border-radius: 6px;
      padding: 1rem;
      overflow-x: auto;
      margin: 1rem 0;
    }
    
    .code-block code {
      background: none;
      padding: 0;
      color: #ccc;
    }
    
    ul { padding-left: 1.5rem; margin: 0.5rem 0; }
    li { margin: 0.25rem 0; }
    a { color: ${BRAND.accent}; }
    hr { border: none; border-top: 1px solid #222; margin: 1.5rem 0; }
    strong { color: #fff; }
    
    .footer {
      text-align: center;
      padding: 2rem;
      color: #333;
      font-size: 0.75rem;
      font-family: ${BRAND.mono};
    }
    
    @media print {
      body { background: #fff; color: #111; }
      .cover { background: #fff; border-color: ${BRAND.accent}; }
      .cover h1 { -webkit-text-fill-color: ${BRAND.accent}; }
      .section-content code { background: #f0f0f0; color: #333; }
      .code-block { background: #f8f8f8; border-color: #ddd; }
    }
  </style>
</head>
<body>
  <div class="cover">
    <h1>DEVKiTZÔäó</h1>
    <div class="subtitle">Vollst├ñndiges Handbuch</div>
    <div class="date">Generiert: ${new Date().toISOString().split('T')[0]}</div>
    <div class="date">${docs.length} Dokumente ┬À ${Math.round(docs.reduce((s,d) => s + d.size, 0) / 1024)}KB</div>
  </div>
  
  <div class="toc">
    <h2>­ƒôæ Inhaltsverzeichnis</h2>
    ${toc}
  </div>
  
  ${sections}
  
  <div class="footer">
    DEVKiTZÔäó Handbuch ┬À Automatisch generiert ┬À ${new Date().toISOString()}
  </div>
</body>
</html>`;
}

/**
 * Hauptfunktion
 */
async function generate() {
  console.log('­ƒôû DkZ Handbuch Generator startet...\n');
  
  const docs = await findDocs(ROOT);
  console.log(`­ƒôü ${docs.length} Dokumente gefunden\n`);
  
  // Inhalte laden
  for (const doc of docs) {
    doc.content = await readFile(doc.path, 'utf-8');
    console.log(`  Ô£à ${doc.dir}/${doc.name} (${Math.round(doc.size/1024)}KB)`);
  }
  
  // HTML generieren
  const html = buildHtml(docs);
  
  // Sicherstellen dass docs/ Ordner existiert
  const { mkdir } = await import('fs/promises');
  await mkdir(join(__dirname, '../docs'), { recursive: true });
  
  await writeFile(OUTPUT, html, 'utf-8');
  console.log(`\n­ƒôä Handbuch generiert: ${OUTPUT}`);
  console.log(`   ${docs.length} Dokumente ┬À ${Math.round(html.length/1024)}KB HTML`);
  console.log(`\n­ƒÆí In Browser ├Âffnen und als PDF drucken (Strg+P ÔåÆ PDF speichern)`);
}

generate().catch(e => {
  console.error('ÔØî Fehler:', e.message);
  process.exit(1);
});
