
// State
const state = {
    currentPage: 'dashboard'
};

// DOM Elements
const mainContent = document.getElementById('main-content');
const navLinks = document.querySelectorAll('.nav-links li');

// Route Mapping (using window globals now)
const routes = {
    'dashboard': window.renderDashboard,
    'match-analysis': window.renderMatchAnalysis,
    'whiteboard': window.renderWhiteboard,
    'practice': window.renderPractice,
    'maps': window.renderMaps
};

// Navigation Logic
function init() {
    // Expose navigation globally for inline onclick handlers
    window.navigatePage = (pageId) => {
        const link = document.querySelector(`[data-page="${pageId}"]`);
        if (link) link.click();
    };

    renderPage('dashboard');
    setupNavigation();
}

function setupNavigation() {
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            const page = link.dataset.page;

            // Update active state
            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');

            // Render
            renderPage(page);
        });
    });
}

function renderPage(pageId) {
    state.currentPage = pageId;

    // Refresh routes mapping in case scripts loaded after app.js (though we put app.js last)
    const renderFn = window.routes ? window.routes[pageId] : (window['render' + pageId.split('-').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join('')]);

    // Easier manual mapping since we know the names
    let fn = null;
    if (pageId === 'dashboard') fn = window.renderDashboard;
    else if (pageId === 'match-analysis') fn = window.renderMatchAnalysis;
    else if (pageId === 'whiteboard') fn = window.renderWhiteboard;
    else if (pageId === 'practice') fn = window.renderPractice;
    else if (pageId === 'maps') fn = window.renderMaps;

    if (fn) {
        mainContent.innerHTML = fn();
    } else {
        mainContent.innerHTML = '<h1>Loading... or Error</h1>';
        console.error('Render function not found for', pageId);
    }
}

// Start
// Wait for window load to ensure all other scripts are processed
window.addEventListener('load', init);
