/**
 * DkZ Hyperreal Background System v1.1
 * Injects the interactive Honeycomb (Wabenmuster), Particle Canvas, and Contrast Toolbar.
 */
(function() {
    if (document.getElementById('hexCanvas') || document.getElementById('mainCanvas')) return; // Already initialized

    // Inject CSS
    const style = document.createElement('style');
    style.textContent = `
        #mainCanvas { position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; z-index: -1; pointer-events: none; }
        #hexCanvas { position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; z-index: -2; pointer-events: none; opacity: 0; animation: introHex 2s ease 0.3s forwards; }
        @keyframes introHex { from { opacity: 0; } to { opacity: 1; } }

        /* Toolbar */
        #dkz-mode-toolbar {
            position: fixed;
            bottom: 24px;
            left: 24px;
            z-index: 99999;
            display: flex;
            gap: 8px;
            background: rgba(14, 14, 22, 0.8);
            backdrop-filter: blur(12px);
            border: 1px solid rgba(255,255,255,0.1);
            padding: 6px;
            border-radius: 12px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.5);
            transition: all 0.3s;
        }
        .dkz-mode-btn {
            background: transparent;
            border: none;
            color: #8a8a9a;
            width: 32px;
            height: 32px;
            border-radius: 8px;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 16px;
            transition: all 0.2s;
        }
        .dkz-mode-btn:hover { background: rgba(255,255,255,0.1); color: #fff; }
        .dkz-mode-btn.active { background: rgba(250, 30, 78, 0.2); color: #fa1e4e; border: 1px solid rgba(250,30,78,0.4); box-shadow: 0 0 10px rgba(250,30,78,0.2); }
        
        body.dkz-matrix-mode #dkz-mode-toolbar { border-color: #00ff88; background: #000; box-shadow: 0 0 15px rgba(0,255,136,0.2); }
        body.dkz-matrix-mode .dkz-mode-btn.active { background: rgba(0, 255, 136, 0.1); color: #00ff88; border: 1px solid #00ff88; box-shadow: 0 0 10px rgba(0,255,136,0.3); }

        /* Contrast / Matrix Mode */
        body.dkz-matrix-mode {
            --bg: #000000;
            --card: #050505;
            --card2: #080808;
            --border: #00ff88;
            --text: #00ff88;
            --muted: #008844;
            --accent: #00ff88;
            --accent-rgb: 0, 255, 136;
            --glass: #000000;
            --blur: none;
            background: #000 !important;
            color: #00ff88 !important;
        }
        body.dkz-matrix-mode * {
            text-shadow: 0 0 2px rgba(0,255,136,0.3);
        }
        body.dkz-matrix-mode .card, 
        body.dkz-matrix-mode .dkz-card, 
        body.dkz-matrix-mode .glass-card, 
        body.dkz-matrix-mode .header {
            border-color: #00ff88 !important;
            background: #000 !important;
            backdrop-filter: none !important;
            -webkit-backdrop-filter: none !important;
            box-shadow: 0 0 8px rgba(0, 255, 136, 0.15);
        }
        body.dkz-matrix-mode h1, 
        body.dkz-matrix-mode .logo,
        body.dkz-matrix-mode a {
            background: none !important;
            -webkit-text-fill-color: #00ff88 !important;
            color: #00ff88 !important;
            text-shadow: 0 0 8px rgba(0,255,136,0.5);
        }
        body.dkz-matrix-mode .btn, body.dkz-matrix-mode .dkz-btn {
            background: rgba(0,255,136,0.1) !important;
            border: 1px solid #00ff88 !important;
            color: #00ff88 !important;
            box-shadow: 0 0 10px rgba(0,255,136,0.2) !important;
        }
        body.dkz-matrix-mode .input, body.dkz-matrix-mode .dkz-input, 
        body.dkz-matrix-mode .property-input, body.dkz-matrix-mode .property-select, body.dkz-matrix-mode .property-textarea,
        body.dkz-matrix-mode .node-input, body.dkz-matrix-mode .node-select {
            background: #000 !important;
            border-color: #008844 !important;
            color: #00ff88 !important;
        }
    `;
    document.head.appendChild(style);

    // Create Canvases
    const hexCanvas = document.createElement('canvas');
    hexCanvas.id = 'hexCanvas';
    document.body.insertBefore(hexCanvas, document.body.firstChild);

    const mainCanvas = document.createElement('canvas');
    mainCanvas.id = 'mainCanvas';
    document.body.insertBefore(mainCanvas, hexCanvas.nextSibling);

    // Initial Matrix State Load
    if (localStorage.getItem('dkz-matrix-mode') === 'true') {
        document.body.classList.add('dkz-matrix-mode');
    }

    // 1. Mouse Tracker
    const mouse = { x: -1000, y: -1000, px: -1000, py: -1000, active: false };
    document.addEventListener('mousemove', e => {
        mouse.px = mouse.x; mouse.py = mouse.y;
        mouse.x = e.clientX; mouse.y = e.clientY;
        mouse.active = true;
    });
    document.addEventListener('mouseleave', () => { mouse.active = false; });

    // 2. MAIN CANVAS — PARTICLES
    const cvs = mainCanvas;
    const ctx = cvs.getContext('2d');
    let W, H;

    function resize() {
        W = cvs.width = window.innerWidth;
        H = cvs.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    const particles = [];
    const PCOUNT = 100;
    for (let i = 0; i < PCOUNT; i++) {
        particles.push({
            x: Math.random() * W, y: Math.random() * H,
            r: Math.random() * 2.5 + 0.5,
            dx: (Math.random() - 0.5) * 0.4,
            dy: (Math.random() - 0.5) * 0.4,
            life: Math.random() * 200,
            maxLife: 200 + Math.random() * 300,
            alpha: Math.random() * 0.4 + 0.1,
            hue: Math.random() > 0.6 ? 250 : 348,
            phase: Math.random() * Math.PI * 2
        });
    }

    let time = 0;
    function draw() {
        ctx.clearRect(0, 0, W, H);
        time += 0.008;

        const isMatrix = document.body.classList.contains('dkz-matrix-mode');

        // Radial Glow
        const gx = W/2 + Math.sin(time * 0.4) * 80;
        const gy = H/2 + Math.cos(time * 0.3) * 50;
        const grad = ctx.createRadialGradient(gx, gy, 0, gx, gy, 500);
        if (isMatrix) {
            grad.addColorStop(0, 'rgba(0,255,136,0.03)');
            grad.addColorStop(0.5, 'rgba(0,255,136,0.01)');
        } else {
            grad.addColorStop(0, 'rgba(250,30,78,0.035)');
            grad.addColorStop(0.5, 'rgba(59,130,246,0.015)');
        }
        grad.addColorStop(1, 'transparent');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, W, H);

        const mRadius = 120;
        for (const p of particles) {
            p.x += p.dx + Math.sin(time * 0.5 + p.phase) * 0.08;
            p.y += p.dy + Math.cos(time * 0.4 + p.phase) * 0.08;
            p.life++;

            if (p.x < -20) p.x = W + 20; if (p.x > W + 20) p.x = -20;
            if (p.y < -20) p.y = H + 20; if (p.y > H + 20) p.y = -20;

            const dmx = p.x - mouse.x;
            const dmy = p.y - mouse.y;
            const dmDist = Math.hypot(dmx, dmy);

            if (dmDist < mRadius && mouse.active) {
                const force = (mRadius - dmDist) / mRadius;
                const angle = Math.atan2(dmy, dmx);
                const repel = 2.5;
                p.x += Math.cos(angle) * force * repel;
                p.y += Math.sin(angle) * force * repel;
                const glowR = p.r * (1 + force * 3);
                ctx.beginPath();
                ctx.arc(p.x, p.y, glowR * 4, 0, Math.PI * 2);
                ctx.fillStyle = isMatrix ? `rgba(0,255,136,${0.08 * force})` : `rgba(250,30,78,${0.08 * force})`;
                ctx.fill();
            }

            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            const lifeAlpha = p.life < 20 ? p.life / 20 * p.alpha :
                            p.life > p.maxLife - 20 ? (p.maxLife - p.life) / 20 * p.alpha : p.alpha;
            const nearby = dmDist < mRadius && mouse.active ? 1.5 : 1;
            
            if (isMatrix) {
                ctx.fillStyle = `rgba(0,255,136,${lifeAlpha * nearby})`;
            } else {
                ctx.fillStyle = p.hue === 348 ? `rgba(250,30,78,${lifeAlpha * nearby})` : `rgba(120,80,255,${lifeAlpha * nearby * 0.8})`;
            }
            ctx.fill();

            if (p.life > p.maxLife) { p.life = 0; p.maxLife = 200 + Math.random() * 300; }
        }

        // Connections
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j += 3) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 100) {
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    if (isMatrix) {
                        ctx.strokeStyle = `rgba(0,255,136,${0.025 * (1 - dist / 100)})`;
                    } else {
                        ctx.strokeStyle = `rgba(250,30,78,${0.025 * (1 - dist / 100)})`;
                    }
                    ctx.lineWidth = 0.5;
                    ctx.stroke();
                }
            }
        }
        requestAnimationFrame(draw);
    }
    draw();

    // 3. HEXAGON CANVAS — MATRIX WABEN
    const hcvs = hexCanvas;
    const hctx = hcvs.getContext('2d');
    let hW, hH;

    function resizeHex() {
        hW = hcvs.width = window.innerWidth;
        hH = hcvs.height = window.innerHeight;
        drawHexagons();
    }
    resizeHex();
    window.addEventListener('resize', resizeHex);

    // Refresh hex colors when matrix mode toggles
    document.addEventListener('dkz-matrix-toggle', drawHexagons);

    function drawHexagons() {
        hctx.clearRect(0, 0, hW, hH);
        const size = 45;
        const rows = Math.ceil(hH / (size * 1.5)) + 2;
        const cols = Math.ceil(hW / (size * 1.75)) + 2;
        const cx = hW / 2, cy = hH / 2;
        const maxDist = Math.hypot(hW, hH) / 2;
        const isMatrix = document.body.classList.contains('dkz-matrix-mode');

        for (let row = -1; row < rows; row++) {
            for (let col = -1; col < cols; col++) {
                const offsetX = (row % 2 === 0) ? 0 : size * 0.9;
                const x = col * size * 1.75 + offsetX;
                const y = row * size * 1.5;
                const dist = Math.hypot(x - cx, y - cy) / maxDist;
                if (dist < 0.15) continue;

                const alpha = Math.min(1, Math.pow(Math.max(0, (dist - 0.15) / 0.7), 1.4)) * 0.15;
                const skewX = (x - cx) / cx * 0.08;
                const skewY = (y - cy) / cy * 0.05;

                hctx.save();
                hctx.translate(x, y);
                hctx.transform(1, skewY, skewX, 1, 0, 0);

                hctx.beginPath();
                for (let i = 0; i < 6; i++) {
                    const angle = (Math.PI / 3) * i - Math.PI / 6;
                    const px = size * Math.cos(angle);
                    const py = size * Math.sin(angle);
                    i === 0 ? hctx.moveTo(px, py) : hctx.lineTo(px, py);
                }
                hctx.closePath();
                
                if (isMatrix) {
                    hctx.strokeStyle = `rgba(0,255,136,${alpha})`;
                    hctx.fillStyle = `rgba(0,255,136,${alpha * 0.08})`;
                } else {
                    hctx.strokeStyle = `rgba(250,30,78,${alpha})`;
                    hctx.fillStyle = `rgba(250,30,78,${alpha * 0.08})`;
                }
                hctx.lineWidth = 0.8;
                hctx.stroke();
                hctx.fill();
                hctx.restore();
            }
        }
    }
})();
