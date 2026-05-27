/**
 * DkZ Handbook — Interaktiver Guide-Generator
 * @DKZ:TAG → [SHARED:handbook] [CAT:shared] [LANG:js]
 * @DKZ:RULES → R21 Shared Scripts
 * @version v1.0.0 | Shortcut: Ctrl+H
 */
const DkzHandbook = (() => {
    'use strict';
    const VERSION = 'v1.0.0';
    let _overlayEl = null;
    let _sections = [];
    function _esc(s) { const d = document.createElement('div'); d.textContent = s; return d.innerHTML; }

    const _defaultSections = [
        { id: 'getting-started', title: '🚀 Erste Schritte', icon: '🚀', content: [
            { type: 'text', text: 'Willkommen beim DEVKiTZ™ Handbuch!' },
            { type: 'step', icon: '🖱️', text: 'Öffne das Dashboard unter 01_PROJECTS/01_dashboard/index.html' },
            { type: 'step', icon: '⌨️', text: 'Ctrl+T → TestStraße · Ctrl+Q → QA Checklist · Ctrl+H → Handbuch' },
            { type: 'step', icon: '🖱️', text: 'Klicke auf 🤖 NanoBot Badge für den Chat' },
            { type: 'tip', text: '💡 Tippe .help im NanoBot Chat für alle Befehle.' },
        ]},
        { id: 'teststrasse', title: '🧪 TestStraße', icon: '🧪', content: [
            { type: 'text', text: '3-Stufen Qualitätssicherung: Unit Tests → QA Checklist → Stress Tests' },
            { type: 'code', lang: 'js', text: 'DkzTest.run();       // Ctrl+T\nDkzQA.run();         // Ctrl+Q\nDkzStress.run();     // via NanoBot: .stress' },
            { type: 'warn', text: '⚠️ Stress-Tests können kurzzeitig Performance beeinträchtigen.' },
        ]},
        { id: 'nanobot', title: '🤖 NanoBot Chat', icon: '🤖', content: [
            { type: 'code', lang: 'html', text: '<script src="../../shared/dkz-nanobot.js" data-module="modul-name"></script>' },
            { type: 'table', headers: ['Befehl', 'Aktion'], rows: [
                ['.help','Hilfe'],['.status','Status'],['.test','Tests'],['.qa','QA'],['.stress','Stress'],['.goto X','Modul öffnen'],['.clear','Chat leeren']
            ]},
        ]},
        { id: 'shortcuts', title: '⌨️ Tastenkürzel', icon: '⌨️', content: [
            { type: 'table', headers: ['Kürzel', 'Aktion'], rows: [
                ['Ctrl+T','TestStraße'],['Ctrl+Q','QA Checklist'],['Ctrl+H','Handbuch'],['Ctrl+P','PDF Export'],['Ctrl+D','Debug Panel']
            ]},
        ]},
    ];

    function addSection(s) { _sections.push(s); }
    function getSections() { return [..._defaultSections, ..._sections]; }

    function _renderBlock(b) {
        if (b.type==='text') return `<p style="color:#a1a1aa;font-size:13px;line-height:1.7;margin:6px 0">${b.text}</p>`;
        if (b.type==='step') return `<div style="display:flex;gap:10px;padding:8px 12px;background:rgba(0,255,136,.04);border-radius:8px;margin:4px 0"><span style="font-size:16px">${b.icon||'→'}</span><span style="color:#c4c4c8;font-size:12px;line-height:1.6">${b.text}</span></div>`;
        if (b.type==='code') return `<div style="position:relative;margin:8px 0"><button onclick="navigator.clipboard.writeText(this.nextElementSibling.textContent);this.textContent='✅'" style="position:absolute;top:6px;right:6px;background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.1);border-radius:6px;padding:3px 10px;font-size:9px;color:#a1a1aa;cursor:pointer">📋</button><pre style="background:rgba(0,0,0,.4);border:1px solid rgba(255,255,255,.06);border-radius:10px;padding:12px 14px;overflow-x:auto;margin:0"><code style="color:#00ff88;font-size:11px;font-family:'JetBrains Mono',monospace;line-height:1.6">${_esc(b.text)}</code></pre></div>`;
        if (b.type==='tip') return `<div style="padding:8px 12px;background:rgba(85,172,238,.06);border-left:3px solid #55ACEE;border-radius:6px;margin:6px 0;color:#55ACEE;font-size:12px">${b.text}</div>`;
        if (b.type==='warn') return `<div style="padding:8px 12px;background:rgba(250,30,78,.06);border-left:3px solid #fa1e4e;border-radius:6px;margin:6px 0;color:#fa1e4e;font-size:12px">${b.text}</div>`;
        if (b.type==='table') {
            let t='<table style="width:100%;border-collapse:collapse;margin:8px 0;font-size:11px"><thead><tr>';
            b.headers.forEach(h=>{t+=`<th style="text-align:left;padding:6px 10px;color:#55ACEE;font-weight:700;border-bottom:1px solid rgba(255,255,255,.06)">${_esc(h)}</th>`;});
            t+='</tr></thead><tbody>';
            b.rows.forEach(r=>{t+='<tr>';r.forEach(c=>{t+=`<td style="padding:5px 10px;color:#a1a1aa;border-bottom:1px solid rgba(255,255,255,.03)">${_esc(c)}</td>`;});t+='</tr>';});
            return t+'</tbody></table>';
        }
        return '';
    }

    function open() {
        if (_overlayEl) { _overlayEl.remove(); _overlayEl=null; return; }
        _overlayEl = document.createElement('div');
        _overlayEl.id='dkz-handbook-overlay';
        _overlayEl.style.cssText='position:fixed;inset:0;z-index:10050;background:rgba(0,0,0,.7);backdrop-filter:blur(8px);display:flex;justify-content:center;align-items:center;font-family:Inter,sans-serif';
        const all=getSections();
        const toc=all.map(s=>`<a href="#hb-${s.id}" style="display:flex;align-items:center;gap:6px;padding:5px 10px;border-radius:6px;color:#a1a1aa;text-decoration:none;font-size:11px;transition:.2s" onmouseenter="this.style.color='#00ff88'" onmouseleave="this.style.color='#a1a1aa'">${s.icon} ${_esc(s.title)}</a>`).join('');
        const content=all.map(s=>`<section id="hb-${s.id}" style="margin-bottom:24px;padding-bottom:16px;border-bottom:1px solid rgba(255,255,255,.04)"><h3 style="color:#f6f6f7;font-size:18px;font-weight:800;margin:0 0 10px">${s.icon} ${_esc(s.title)}</h3>${s.content.map(_renderBlock).join('')}</section>`).join('');

        _overlayEl.innerHTML=`<div style="background:rgba(10,10,14,.98);border:1px solid rgba(255,255,255,.06);border-radius:20px;width:90vw;max-width:1000px;height:85vh;display:flex;overflow:hidden;box-shadow:0 30px 80px rgba(0,0,0,.6)">
            <div style="width:220px;min-width:220px;border-right:1px solid rgba(255,255,255,.04);padding:16px;display:flex;flex-direction:column;gap:4px;overflow-y:auto">
                <div style="font-size:14px;font-weight:900;color:#f6f6f7;margin-bottom:8px">📖 Handbuch</div>
                <input id="hb-search" type="text" placeholder="🔍 Suchen..." style="width:100%;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);border-radius:8px;padding:6px 10px;color:#f6f6f7;font-size:11px;outline:none;margin-bottom:8px;font-family:inherit;box-sizing:border-box"/>
                <div id="hb-toc">${toc}</div>
                <div style="margin-top:auto;padding-top:10px;border-top:1px solid rgba(255,255,255,.04)">
                    <button onclick="if(typeof DkzPdfGen!=='undefined')DkzPdfGen.generate();else alert('PDF-Generator nicht geladen')" style="width:100%;padding:8px;background:rgba(250,30,78,.1);border:1px solid rgba(250,30,78,.2);border-radius:8px;color:#fa1e4e;font-size:11px;font-weight:700;cursor:pointer;font-family:inherit">📄 PDF Export</button>
                </div>
            </div>
            <div id="hb-content" style="flex:1;overflow-y:auto;padding:24px 32px">${content}</div>
            <button onclick="DkzHandbook.open()" style="position:absolute;top:20px;right:30px;background:none;border:none;color:#a1a1aa;font-size:24px;cursor:pointer;z-index:1">✕</button>
        </div>`;
        document.body.appendChild(_overlayEl);
        _overlayEl.addEventListener('click',e=>{if(e.target===_overlayEl)open()});
        document.getElementById('hb-search').addEventListener('input',e=>{
            const q=e.target.value.toLowerCase();
            const secs=document.querySelectorAll('#hb-content section');
            secs.forEach(s=>{s.style.display=s.textContent.toLowerCase().includes(q)?'':'none'});
        });
    }

    document.addEventListener('keydown',e=>{if((e.ctrlKey||e.metaKey)&&e.key==='h'){e.preventDefault();open()}});
    return { open, addSection, getSections, VERSION };
})();
if (typeof window!=='undefined') window.DkzHandbook=DkzHandbook;
