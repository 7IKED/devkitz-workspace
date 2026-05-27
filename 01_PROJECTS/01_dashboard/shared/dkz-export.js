/**
 * DkZ Export — Standard Export Utility
 * @DKZ:RULES → R21 Shared Scripts
 * @DKZ:TAG → [SYS:export] [CAT:shared] [LANG:js]
 * @version v0.01.1_01
 *
 * Provides standard export functions for ALL modules:
 * - Copy to clipboard
 * - Download as JSON
 * - Download as Markdown
 * - Download as TXT / CSV / HTML
 */
const DkzExport = (() => {
    'use strict';

    const VERSION = 'v0.01.1_01';

    // ═══ XSS Protection ═══
    function _esc(s) {
        const d = document.createElement('div');
        d.appendChild(document.createTextNode(s));
        return d.innerHTML;
    }

    // ═══ Toast ═══
    function _toast(msg) {
        if (typeof showToast === 'function') return showToast(msg);
        const t = document.getElementById('toast');
        if (t) { t.textContent = msg; t.classList.add('show'); setTimeout(() => t.classList.remove('show'), 2500); }
    }

    // ═══ Copy to Clipboard ═══
    async function copyToClipboard(text, label) {
        try {
            await navigator.clipboard.writeText(text);
            _toast(`📋 ${label || 'Kopiert!'}`);
            return true;
        } catch {
            // Fallback
            const ta = document.createElement('textarea');
            ta.value = text;
            ta.style.cssText = 'position:fixed;opacity:0';
            document.body.appendChild(ta);
            ta.select();
            document.execCommand('copy');
            ta.remove();
            _toast(`📋 ${label || 'Kopiert!'}`);
            return true;
        }
    }

    // ═══ Download File ═══
    function download(content, filename, mimeType) {
        const blob = new Blob([content], { type: mimeType || 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
        _toast(`📥 ${filename}`);
    }

    // ═══ Export as JSON ═══
    function asJSON(data, filename) {
        const json = typeof data === 'string' ? data : JSON.stringify(data, null, 2);
        download(json, filename || 'export.json', 'application/json');
    }

    // ═══ Export as Markdown ═══
    function asMarkdown(content, filename) {
        download(content, filename || 'export.md', 'text/markdown');
    }

    // ═══ Export as CSV ═══
    function asCSV(rows, filename) {
        // rows = [[header1, header2], [val1, val2], ...]
        const csv = rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
        download(csv, filename || 'export.csv', 'text/csv');
    }

    // ═══ Export as HTML ═══
    function asHTML(html, filename) {
        download(html, filename || 'export.html', 'text/html');
    }

    // ═══ Export as TXT ═══
    function asTXT(text, filename) {
        download(text, filename || 'export.txt', 'text/plain');
    }

    // ═══ Export as PNG (from canvas or element) ═══
    async function asPNG(element, filename) {
        if (element.tagName === 'CANVAS') {
            const link = document.createElement('a');
            link.download = filename || 'export.png';
            link.href = element.toDataURL('image/png');
            link.click();
            _toast(`📥 ${filename || 'export.png'}`);
            return;
        }
        // For non-canvas elements, try html2canvas if available
        if (typeof html2canvas !== 'undefined') {
            const canvas = await html2canvas(element);
            const link = document.createElement('a');
            link.download = filename || 'export.png';
            link.href = canvas.toDataURL('image/png');
            link.click();
            _toast(`📥 ${filename || 'export.png'}`);
        } else {
            _toast('⚠️ html2canvas nicht verfügbar');
        }
    }

    // ═══ Module Data Export (localStorage) ═══
    function moduleData(storageKey, format) {
        const data = localStorage.getItem(storageKey);
        if (!data) { _toast('⚠️ Keine Daten'); return; }
        const moduleName = storageKey.replace('dkz-', '');
        if (format === 'json') asJSON(data, `${moduleName}-export.json`);
        else if (format === 'md') {
            try {
                const parsed = JSON.parse(data);
                const md = `# ${moduleName} Export\n\nDatum: ${new Date().toISOString()}\n\n\`\`\`json\n${JSON.stringify(parsed, null, 2)}\n\`\`\`\n`;
                asMarkdown(md, `${moduleName}-export.md`);
            } catch { asTXT(data, `${moduleName}-export.txt`); }
        }
        else asTXT(data, `${moduleName}-export.txt`);
    }

    return {
        copy: copyToClipboard,
        download,
        json: asJSON,
        markdown: asMarkdown,
        csv: asCSV,
        html: asHTML,
        txt: asTXT,
        png: asPNG,
        moduleData,
        VERSION
    };
})();

if (typeof module !== 'undefined') module.exports = DkzExport;
