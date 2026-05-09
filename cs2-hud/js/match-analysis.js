window.renderMatchAnalysis = function () {
    setTimeout(initAnalysis, 100);
    return `
        <div class="glass-panel slide-in">
            <h1 class="gradient-text">Match Analysis</h1>
            <p class="text-muted">Paste your console output below to analyze opponents.</p>
            <div style="margin-top: 2rem;">
                <textarea id="console-input" style="width: 100%; height: 200px; background: rgba(0,0,0,0.3); border: 1px solid var(--glass-border); border-radius: 0.75rem; color: white; padding: 1rem; font-family: monospace;" placeholder="Paste output from 'status' command here..."></textarea>
                <div style="display: flex; gap: 1rem; margin-top: 1rem;">
                    <button id="btn-analyze" class="btn btn-primary" style="width: auto;">Analyze & Open CSStats</button>
                    <button id="btn-faceit" class="btn btn-outline" style="width: auto;">Analyze & Open FaceitFinder</button>
                    <button id="btn-clear" class="btn btn-outline" style="width: auto;">Clear</button>
                </div>
            </div>
            
            <div id="results-area" class="grid-3" style="margin-top: 2rem; display: none;">
                <!-- Results will be injected here if we want to show a summary locally -->
            </div>
        </div>
    `;
};

function initAnalysis() {
    const btnAnalyze = document.getElementById('btn-analyze');
    const btnFaceit = document.getElementById('btn-faceit');
    const btnClear = document.getElementById('btn-clear');
    const input = document.getElementById('console-input');

    if (btnAnalyze) {
        btnAnalyze.onclick = () => {
            const text = input.value;
            const steamIds = parseStatus(text);
            if (steamIds.length > 0) {
                openMultiStats(steamIds, 'csgostats');
            } else {
                alert('No SteamIDs found! specific format: "STEAM_1:..." or "STEAM_0:..."');
            }
        };
    }

    if (btnFaceit) {
        btnFaceit.onclick = () => {
            const text = input.value;
            const steamIds = parseStatus(text);
            if (steamIds.length > 0) {
                openMultiStats(steamIds, 'faceit');
            } else {
                alert('No SteamIDs found!');
            }
        };
    }

    if (btnClear) btnClear.onclick = () => { input.value = ''; };
}

function parseStatus(text) {
    // Regex to find Steam2 IDs (STEAM_X:Y:Z) or Steam3 IDs ([U:1:Z])
    // Standard status output usually has STEAM_1:0:123456...
    const steam2Regex = /STEAM_[0-5]:[0-1]:\d+/g;
    const matches = text.match(steam2Regex);

    if (matches) {
        return [...new Set(matches)]; // Return unique IDs
    }
    return [];
}

function openMultiStats(ids, service) {
    const idString = ids.join('\n');
    navigator.clipboard.writeText(idString).then(() => {
        if (service === 'csgostats') {
            window.open('https://csgostats.gg/player/multi', '_blank');
            alert('SteamIDs copied to clipboard! Paste them into the opened page.');
        } else if (service === 'faceit') {
            window.open('https://faceitfinder.com/', '_blank');
            alert('SteamIDs copied! Paste into Faceit Finder.');
        }
    });
}
