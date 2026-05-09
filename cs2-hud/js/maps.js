window.renderMaps = function () {
    setTimeout(initMaps, 100);
    return `
        <div class="glass-panel slide-in" style="height: calc(100vh - 100px); display: flex; flex-direction: column;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                <h1 class="gradient-text" style="font-size: 1.5rem; margin: 0;">Map Guides</h1>
                <div style="display: flex; gap: 0.5rem;">
                    <button class="btn btn-outline active-map-btn" onclick="window.loadMap('mirage')" style="width: auto; padding: 0.5rem 1rem;">Mirage</button>
                    <button class="btn btn-outline" onclick="window.loadMap('inferno')" style="width: auto; padding: 0.5rem 1rem;">Inferno</button>
                    <button class="btn btn-outline" onclick="window.loadMap('nuke')" style="width: auto; padding: 0.5rem 1rem;">Nuke</button>
                    <button class="btn btn-outline" onclick="window.loadMap('vertigo')" style="width: auto; padding: 0.5rem 1rem;">Vertigo</button>
                </div>
            </div>
            
            <div id="map-container" style="flex: 1; background: #1a1a1a; border-radius: 0.5rem; position: relative; overflow: hidden; display: flex; align-items: center; justify-content: center;">
                <div id="map-layer" style="position: relative; width: 800px; height: 800px; background: #222;">
                    <!-- Map Image Placeholder -->
                    <div style="position: absolute; top:0; left:0; width:100%; height:100%; display: flex; align-items: center; justify-content: center; color: #444; border: 2px dashed #444;">
                        <h2 id="map-name-display">Mirage Overview</h2>
                    </div>
                    
                    <!-- Callout/Grenade Spots (Mockup for Mirage) -->
                    <div class="callout-spot" style="top: 50%; left: 50%;" data-name="Mid" data-type="callout"></div>
                    <div class="callout-spot" style="top: 30%; left: 45%;" data-name="A Site" data-type="site"></div>
                    <div class="callout-spot" style="top: 70%; left: 60%;" data-name="B Site" data-type="site"></div>
                    <div class="callout-spot smoke" style="top: 55%; left: 48%;" data-name="Top Mid Smoke" data-type="utility"></div>
                </div>
                
                <!-- Info Overlay -->
                <div id="info-overlay" class="glass-panel" style="position: absolute; bottom: 20px; right: 20px; display: none; width: 300px;">
                    <h3 id="info-title">Spot Name</h3>
                    <p id="info-desc" class="text-muted text-sm">Description here.</p>
                </div>
            </div>
        </div>
    `;
};

function initMaps() {
    window.loadMap = (mapName) => {
        // Mock logic to switch maps
        document.getElementById('map-name-display').textContent = mapName.charAt(0).toUpperCase() + mapName.slice(1) + ' Overview';
        // In a real app, we would swap the background image of #map-layer
    };

    const spots = document.querySelectorAll('.callout-spot');
    const overlay = document.getElementById('info-overlay');
    const title = document.getElementById('info-title');
    const desc = document.getElementById('info-desc');

    spots.forEach(spot => {
        spot.addEventListener('mouseenter', () => {
            const name = spot.dataset.name;
            const type = spot.dataset.type;

            title.textContent = name;
            desc.textContent = type === 'utility' ? 'Click to see lineup video.' : 'Standard callout.';

            if (type === 'utility') {
                spot.style.borderColor = '#8b5cf6'; // Purple
            }

            overlay.style.display = 'block';
        });

        spot.addEventListener('click', () => {
            if (spot.dataset.type === 'utility') {
                alert('Opening lineup video...');
                // window.open('...');
            }
        });

        spot.addEventListener('mouseleave', () => {
            overlay.style.display = 'none';
        });
    });
}
