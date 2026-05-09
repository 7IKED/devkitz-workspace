window.renderDashboard = function () {
    return `
        <div class="glass-panel slide-in" style="margin-bottom: 2rem;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <div>
                    <h1 class="gradient-text">Command Center</h1>
                    <p style="color: var(--text-muted);">Ready for action.</p>
                </div>
                <div class="status-indicator online">
                    <span class="dot"></span> Online
                </div>
            </div>
        </div>

        <div class="grid-3">
            <div class="glass-panel hover-card">
                <div class="icon-box red">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
                </div>
                <h3>Match Analysis</h3>
                <p class="text-sm text-muted">Scan opponents instantly.</p>
                <button class="btn btn-primary mt-4" onclick="window.navigatePage('match-analysis')">Quick Scan</button>
            </div>

            <div class="glass-panel hover-card">
                 <div class="icon-box blue">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
                </div>
                <h3>Tactics Board</h3>
                <p class="text-sm text-muted">Plan your next execute.</p>
                <button class="btn btn-outline mt-4" onclick="window.navigatePage('whiteboard')">Open Board</button>
            </div>

            <div class="glass-panel hover-card">
                 <div class="icon-box purple">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"></polygon><polyline points="2 17 12 22 22 17"></polyline><polyline points="2 12 12 17 22 12"></polyline></svg>
                </div>
                <h3>Pro Practice</h3>
                <p class="text-sm text-muted">Warmup routines & guides.</p>
                <button class="btn btn-outline mt-4" onclick="window.navigatePage('practice')">Start Training</button>
            </div>
        </div>
    `;
};
