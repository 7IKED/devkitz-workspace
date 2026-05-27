// NEXUZ² MCP — Background Service Worker
// Handles context menus, sidepanel, and message routing

// Context Menu Setup
chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
        id: 'nexuz-send-to-ai',
        title: '⚡ NEXUZ² — An AI senden',
        contexts: ['selection']
    });
    chrome.contextMenus.create({
        id: 'nexuz-analyze',
        title: '📊 NEXUZ² — Text analysieren',
        contexts: ['selection']
    });
    chrome.contextMenus.create({
        id: 'nexuz-summarize',
        title: '📋 NEXUZ² — Zusammenfassen',
        contexts: ['selection']
    });
    chrome.contextMenus.create({
        id: 'nexuz-translate',
        title: '🌐 NEXUZ² — Übersetzen',
        contexts: ['selection']
    });
    console.log('[NEXUZ² MCP] Context menus created');
});

// Context Menu Click Handler
chrome.contextMenus.onClicked.addListener((info, tab) => {
    const text = info.selectionText;
    if (!text) return;

    const action = info.menuItemId.replace('nexuz-', '');

    // Open sidepanel with the action
    chrome.sidePanel.open({ tabId: tab.id });

    // Send message to sidepanel
    setTimeout(() => {
        chrome.runtime.sendMessage({
            type: 'context-action',
            action: action,
            text: text,
            sourceUrl: tab.url,
            sourceTitle: tab.title
        });
    }, 500);
});

// Open sidepanel on extension icon click
chrome.action.onClicked.addListener((tab) => {
    chrome.sidePanel.open({ tabId: tab.id });
});

// Message Router
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if (msg.type === 'nexuz-request') {
        // Route to appropriate backend
        handleNexuzRequest(msg).then(sendResponse);
        return true; // async response
    }
});

async function handleNexuzRequest(msg) {
    // TODO: Connect to NEXUZ² Core backends
    // For now, return a placeholder
    return {
        status: 'ok',
        message: 'NEXUZ² MCP connected — backend routing wird konfiguriert',
        timestamp: new Date().toISOString()
    };
}
