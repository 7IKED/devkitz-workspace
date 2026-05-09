window.renderWhiteboard = function () {
    setTimeout(initCanvas, 100); // Wait for DOM render
    return `
        <div class="glass-panel slide-in" style="height: calc(100vh - 100px); display: flex; flex-direction: column;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                <div style="display: flex; gap: 1rem; align-items: center;">
                    <h1 class="gradient-text" style="font-size: 1.5rem; margin: 0;">Tactics Board</h1>
                    <select id="map-select" class="btn btn-outline" style="width: auto; padding: 0.25rem 0.5rem;">
                        <option value="mirage">Mirage</option>
                        <option value="inferno">Inferno</option>
                        <option value="nuke">Nuke</option>
                        <option value="vertigo">Vertigo</option>
                    </select>
                </div>
                <div style="display: flex; gap: 0.5rem;">
                    <button class="btn btn-outline" onclick="window.setTool('brush')" style="width: auto; padding: 0.5rem;">🖌️</button>
                    <button class="btn btn-outline" onclick="window.setTool('eraser')" style="width: auto; padding: 0.5rem;">🧹</button>
                    <div style="width: 1px; background: var(--glass-border); margin: 0 0.5rem;"></div>
                    <button class="btn btn-outline" onclick="window.clearBoard()" style="width: auto; padding: 0.5rem 1rem;">Clear All</button>
                </div>
            </div>
            <div id="canvas-container" style="flex: 1; background: #1a1a1a; border-radius: 0.5rem; position: relative; overflow: hidden; cursor: crosshair;">
                <canvas id="tactic-canvas"></canvas>
            </div>
        </div>
    `;
};

// Logic
let canvas, ctx;
let isDrawing = false;
let currentTool = 'brush';

function initCanvas() {
    const container = document.getElementById('canvas-container');
    if (!container) return;

    canvas = document.getElementById('tactic-canvas');
    ctx = canvas.getContext('2d');

    // Resize
    function resize() {
        canvas.width = container.clientWidth;
        canvas.height = container.clientHeight;

        // Draw grid placeholder
        drawGrid();
    }
    window.addEventListener('resize', resize);
    resize();

    // Events
    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('mouseout', stopDrawing);

    // Global listeners
    window.setTool = (tool) => {
        currentTool = tool;
        console.log('Tool:', tool);
    };

    window.clearBoard = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawGrid();
    };
}

function drawGrid() {
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 1;

    // Vertical
    for (let x = 0; x < canvas.width; x += 50) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
    }

    // Horizontal
    for (let y = 0; y < canvas.height; y += 50) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
    }

    // Map Text Placeholder
    ctx.fillStyle = '#444';
    ctx.font = '30px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Select Map (Grid Placeholder)', canvas.width / 2, canvas.height / 2);
}

function startDrawing(e) {
    isDrawing = true;
    draw(e);
}

function stopDrawing() {
    isDrawing = false;
    ctx.beginPath(); // Reset path
}

function draw(e) {
    if (!isDrawing) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.lineWidth = currentTool === 'eraser' ? 20 : 3;
    ctx.lineCap = 'round';
    ctx.strokeStyle = currentTool === 'eraser' ? '#1a1a1a' : '#ef4444'; // Red for tactics, bg color for eraser

    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);
}
