/**
 * DkZ PDF Generator — HTML→PDF mit DkZ-Branding
 * @DKZ:TAG → [SHARED:pdf-gen] [CAT:shared] [LANG:js]
 * @DKZ:RULES → R21 Shared Scripts
 * @version v1.0.0 | Shortcut: Ctrl+P (im Handbuch)
 * 
 * Nutzt window.print() mit @media print Styles für PDF-Export.
 * Farbige Hervorhebungen, Symbole, Copy-Fenster-Styling.
 */
const DkzPdfGen = (() => {
    'use strict';
    const VERSION = 'v1.0.0';

    function _injectPrintStyles() {
        if (document.getElementById('dkz-print-styles')) return;
        const s = document.createElement('style');
        s.id = 'dkz-print-styles';
        s.textContent = `
@media print {
    /* Hide UI elements */
    #dkz-nanobot-badge, #dkz-nanobot-panel, .dkz-test-panel, .dkz-qa-panel,
    .dkz-auto-back, #dkz-toast-container, .dkz-breadcrumb,
    #intro, canvas, .filter-bar, .bg-mesh { display: none !important; }

    body { background: #fff !important; color: #111 !important; font-family: 'Inter', sans-serif !important; font-size: 12pt !important; }

    /* Handbook overlay becomes printable */
    #dkz-handbook-overlay { position: static !important; background: none !important; backdrop-filter: none !important; display: block !important; }
    #dkz-handbook-overlay > div { position: static !important; width: 100% !important; max-width: 100% !important; height: auto !important; border: none !important; border-radius: 0 !important; box-shadow: none !important; display: block !important; background: #fff !important; }
    #dkz-handbook-overlay button { display: none !important; }

    /* Sidebar becomes TOC */
    #dkz-handbook-overlay > div > div:first-child {
        width: 100% !important; border-right: none !important; border-bottom: 2px solid #ddd !important;
        padding-bottom: 12pt !important; margin-bottom: 12pt !important; page-break-after: always;
    }
    #hb-search { display: none !important; }
    #hb-toc a { color: #333 !important; font-size: 11pt !important; padding: 3pt 0 !important; }

    /* Content styling */
    #hb-content { padding: 0 !important; }
    #hb-content section { border-bottom: 1px solid #ddd !important; padding-bottom: 12pt !important; margin-bottom: 12pt !important; page-break-inside: avoid; }
    #hb-content h3 { color: #111 !important; font-size: 16pt !important; border-bottom: 2px solid #fa1e4e !important; padding-bottom: 4pt !important; }
    #hb-content h4 { color: #333 !important; }
    #hb-content p, #hb-content span { color: #333 !important; }

    /* Action symbols - keep colored */
    #hb-content div[style*="rgba(0,255,136"] { background: #f0fff0 !important; border: 1px solid #00cc66 !important; }
    #hb-content div[style*="rgba(0,255,136"] span:first-child { color: #00cc66 !important; }

    /* Code blocks */
    #hb-content pre { background: #f5f5f5 !important; border: 1px solid #ddd !important; border-radius: 4pt !important; }
    #hb-content code { color: #006644 !important; }
    #hb-content pre button { display: none !important; }

    /* Tips & Warnings */
    #hb-content div[style*="rgba(85,172,238"] { background: #f0f8ff !important; border-left: 3pt solid #3399cc !important; color: #336699 !important; }
    #hb-content div[style*="rgba(250,30,78"] { background: #fff0f0 !important; border-left: 3pt solid #cc3333 !important; color: #993333 !important; }

    /* Tables */
    #hb-content table { border: 1px solid #ccc !important; }
    #hb-content th { background: #f0f0f0 !important; color: #333 !important; border: 1px solid #ccc !important; }
    #hb-content td { color: #333 !important; border: 1px solid #eee !important; }

    /* Header */
    @page { margin: 2cm; size: A4; }
    body::before {
        content: "DEVKiTZ™ Handbuch · Generiert am " attr(data-print-date);
        display: block; font-size: 9pt; color: #999; margin-bottom: 12pt;
        border-bottom: 1px solid #ddd; padding-bottom: 6pt;
    }
    body::after {
        content: "© DEVKiTZ™ — github.com/777/devkitz-ecosystem";
        display: block; font-size: 8pt; color: #bbb; margin-top: 24pt;
        border-top: 1px solid #ddd; padding-top: 6pt; text-align: center;
    }
}`;
        document.head.appendChild(s);
    }

    function generate() {
        _injectPrintStyles();
        document.body.setAttribute('data-print-date', new Date().toLocaleDateString('de-DE'));

        // Ensure handbook is open
        if (!document.getElementById('dkz-handbook-overlay') && typeof DkzHandbook !== 'undefined') {
            DkzHandbook.open();
        }

        setTimeout(() => { window.print(); }, 300);
    }

    // Ctrl+P override when handbook is open
    document.addEventListener('keydown', e => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'p' && document.getElementById('dkz-handbook-overlay')) {
            e.preventDefault();
            generate();
        }
    });

    return { generate, VERSION };
})();
if (typeof window !== 'undefined') window.DkzPdfGen = DkzPdfGen;
