// NEXUZ² MCP — Content Script
// Injected into every page for context integration

(function () {
    'use strict';

    // Add NEXUZ² keyboard shortcut listener
    document.addEventListener('keydown', (e) => {
        // Ctrl+Shift+N = Open NEXUZ² with selected text
        if (e.ctrlKey && e.shiftKey && e.key === 'N') {
            e.preventDefault();
            const selectedText = window.getSelection().toString().trim();
            if (selectedText) {
                chrome.runtime.sendMessage({
                    type: 'context-action',
                    action: 'send-to-ai',
                    text: selectedText,
                    sourceUrl: window.location.href,
                    sourceTitle: document.title
                });
            }
        }
    });

    console.log('[NEXUZ² MCP] Content script loaded');
})();
