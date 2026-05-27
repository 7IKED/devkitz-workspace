/**
 * DkZ™ Info-Canvas Pattern v1.0
 * HTML-basierte Grafiken für Status, Updates, Fragen
 * Nutzbar aus jedem Modul im Ökosystem
 * 
 * Usage:
 *   const { generateStatusCanvas, generateUpdateCanvas } = require('./info-canvas');
 *   const html = generateStatusCanvas({ title: "Agent Status", agents: [...] });
 *   fs.writeFileSync('status.html', html);
 */

const DKZ_THEME = {
  accent: '#fa1e4e',
  bg: '#060608',
  card: 'rgba(18,18,24,.85)',
  text: '#e8e8ec',
  text2: '#8a8a9a',
  green: '#00ff88',
  yellow: '#ffb800',
  red: '#ff3b5c',
  blue: '#3b82f6',
  purple: '#a855f7',
  font: "'Inter', sans-serif",
  mono: "'JetBrains Mono', monospace"
};

function baseHTML(title, bodyContent) {
  return `<!DOCTYPE html>
<html lang="de"><head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>DkZ™ ${title}</title>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&family=JetBrains+Mono:wght@400;600&display=swap" rel="stylesheet">
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{background:${DKZ_THEME.bg};color:${DKZ_THEME.text};font-family:${DKZ_THEME.font};padding:24px}
.card{background:${DKZ_THEME.card};border:1px solid rgba(255,255,255,.06);border-radius:12px;padding:20px;margin:12px 0;backdrop-filter:blur(16px)}
h1{font-size:1.4rem;background:linear-gradient(135deg,${DKZ_THEME.accent},${DKZ_THEME.purple});-webkit-background-clip:text;-webkit-text-fill-color:transparent;margin-bottom:16px}
h2{font-size:1rem;color:${DKZ_THEME.purple};margin:12px 0 8px}
.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:12px}
.badge{display:inline-block;padding:3px 10px;border-radius:20px;font-size:.7rem;font-weight:600}
.ok{background:rgba(0,255,136,.1);color:${DKZ_THEME.green}}
.warn{background:rgba(255,184,0,.1);color:${DKZ_THEME.yellow}}
.err{background:rgba(255,59,92,.1);color:${DKZ_THEME.red}}
.mono{font-family:${DKZ_THEME.mono};font-size:.75rem}
.ts{color:${DKZ_THEME.text2};font-size:.65rem}
</style></head><body>${bodyContent}</body></html>`;
}

/** Status-Canvas: Agent/System Health */
function generateStatusCanvas(data) {
  const agents = (data.agents || []).map(a =>
    `<div class="card"><span class="badge ${a.status}">${a.status === 'ok' ? '🟢' : a.status === 'warn' ? '🟡' : '🔴'} ${a.name}</span><p class="mono" style="margin-top:8px">${a.info || ''}</p></div>`
  ).join('');
  return baseHTML(data.title || 'System Status',
    `<h1>📊 ${data.title || 'DkZ System Status'}</h1><p class="ts">${new Date().toISOString()}</p><div class="grid">${agents}</div>`
  );
}

/** Update-Canvas: Changelog/News */
function generateUpdateCanvas(data) {
  const items = (data.items || []).map(i =>
    `<div class="card"><h2>${i.icon || '📝'} ${i.title}</h2><p style="font-size:.8rem;color:${DKZ_THEME.text2}">${i.description}</p><span class="ts">${i.date || ''}</span></div>`
  ).join('');
  return baseHTML(data.title || 'Updates',
    `<h1>🔄 ${data.title || 'DkZ Updates'}</h1>${items}`
  );
}

/** Frage-Canvas: Interaktive Entscheidung */
function generateQuestionCanvas(data) {
  const options = (data.options || []).map((o, i) =>
    `<div class="card" style="cursor:pointer;border-color:rgba(250,30,78,.2)"><h2>${i + 1}. ${o.label}</h2><p style="font-size:.75rem;color:${DKZ_THEME.text2}">${o.description || ''}</p></div>`
  ).join('');
  return baseHTML(data.title || 'Entscheidung',
    `<h1>❓ ${data.question}</h1><div class="grid">${options}</div>`
  );
}

module.exports = { generateStatusCanvas, generateUpdateCanvas, generateQuestionCanvas, baseHTML, DKZ_THEME };
