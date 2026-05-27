/* ═══════════════════════════════════════════════ */
/* WISPE™ — Immersive Canvas Engine               */
/* Full-Screen Canvas Rendering                   */
/* ═══════════════════════════════════════════════ */

const CanvasBG = (() => {
    let ctx, canvas;
    let particles = [];
    let rings = [];
    let mouseX = 0, mouseY = 0;
    let animFrame;
    let time = 0;
    let isRecording = false;
    let micX = 0, micY = 0;

    const CONFIG = {
        particleCount: 140,
        connectionDist: 180,
        gridSpacing: 50,
        gridOpacity: 0.06,
        accentR: 250, accentG: 30, accentB: 78,   // #fa1e4e
        greenR: 0, greenG: 255, greenB: 136,       // #00ff88
        blueR: 30, blueG: 100, blueB: 255,
        ringCount: 6,
        orbCount: 8,
        nebulaNodes: 16
    };

    // ─── Particle Class ───
    class Particle {
        constructor(w, h) {
            this.reset(w, h);
        }
        reset(w, h) {
            this.x = Math.random() * w;
            this.y = Math.random() * h;
            this.vx = (Math.random() - 0.5) * 0.4;
            this.vy = (Math.random() - 0.5) * 0.4;
            this.size = Math.random() * 3.5 + 1;
            this.baseOpacity = Math.random() * 0.6 + 0.3;
            this.opacity = this.baseOpacity;
            this.pulse = Math.random() * Math.PI * 2;
            this.pulseSpeed = 0.01 + Math.random() * 0.02;
            this.hue = Math.random() > 0.7 ? 1 : 0; // 0 = red accent, 1 = blue accent
        }
        update(w, h, t) {
            this.x += this.vx;
            this.y += this.vy;
            this.pulse += this.pulseSpeed;
            this.opacity = this.baseOpacity + Math.sin(this.pulse) * 0.15;

            // Subtle gravitational pull towards center when recording
            if (isRecording) {
                const dx = micX - this.x;
                const dy = micY - this.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist > 50) {
                    this.vx += (dx / dist) * 0.01;
                    this.vy += (dy / dist) * 0.01;
                }
                // Speed limit
                const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
                if (speed > 1.5) {
                    this.vx = (this.vx / speed) * 1.5;
                    this.vy = (this.vy / speed) * 1.5;
                }
            }

            // Mouse interaction — gentle repulsion
            const mdx = this.x - mouseX;
            const mdy = this.y - mouseY;
            const mDist = Math.sqrt(mdx * mdx + mdy * mdy);
            if (mDist < 100) {
                this.vx += (mdx / mDist) * 0.05;
                this.vy += (mdy / mDist) * 0.05;
            }

            // Wrap edges
            if (this.x < -10) this.x = w + 10;
            if (this.x > w + 10) this.x = -10;
            if (this.y < -10) this.y = h + 10;
            if (this.y > h + 10) this.y = -10;

            // Dampen speed when not recording
            if (!isRecording) {
                this.vx *= 0.998;
                this.vy *= 0.998;
                // Keep minimum speed
                const sp = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
                if (sp < 0.1) {
                    this.vx += (Math.random() - 0.5) * 0.1;
                    this.vy += (Math.random() - 0.5) * 0.1;
                }
            }
        }
    }

    // ─── Floating Ring ───
    class FloatingRing {
        constructor(w, h) {
            this.x = Math.random() * w;
            this.y = Math.random() * h;
            this.radius = 50 + Math.random() * 120;
            this.rotation = Math.random() * Math.PI * 2;
            this.rotSpeed = (Math.random() - 0.5) * 0.005;
            this.vx = (Math.random() - 0.5) * 0.2;
            this.vy = (Math.random() - 0.5) * 0.2;
            this.dashOffset = 0;
            this.opacity = 0.06 + Math.random() * 0.08;
        }
        update(w, h) {
            this.x += this.vx;
            this.y += this.vy;
            this.rotation += this.rotSpeed;
            this.dashOffset += 0.3;
            if (this.x < -100) this.x = w + 100;
            if (this.x > w + 100) this.x = -100;
            if (this.y < -100) this.y = h + 100;
            if (this.y > h + 100) this.y = -100;
        }
    }

    // ─── Init ───
    function init() {
        canvas = document.getElementById('particleCanvas');
        if (!canvas) return;
        ctx = canvas.getContext('2d');

        // Hide grid canvas — we draw everything on one canvas
        const gridCanvas = document.getElementById('gridCanvas');
        if (gridCanvas) gridCanvas.style.display = 'none';

        resize();
        window.addEventListener('resize', resize);
        document.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
        });

        initParticles();
        initRings();
        updateMicPosition();

        // Observe mic button for recording state
        const micBtn = document.getElementById('micBtn');
        if (micBtn) {
            const observer = new MutationObserver(() => {
                isRecording = micBtn.classList.contains('recording');
            });
            observer.observe(micBtn, { attributes: true, attributeFilter: ['class'] });
        }

        animate();
    }

    function resize() {
        const dpr = window.devicePixelRatio || 1;
        const w = window.innerWidth;
        const h = window.innerHeight;
        canvas.width = w * dpr;
        canvas.height = h * dpr;
        canvas.style.width = w + 'px';
        canvas.style.height = h + 'px';
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        updateMicPosition();
    }

    function updateMicPosition() {
        const mic = document.getElementById('micContainer');
        if (mic) {
            const r = mic.getBoundingClientRect();
            micX = r.left + r.width / 2;
            micY = r.top + r.height / 2;
        } else {
            micX = window.innerWidth - 80;
            micY = window.innerHeight - 80;
        }
    }

    function initParticles() {
        particles = [];
        const w = window.innerWidth;
        const h = window.innerHeight;
        for (let i = 0; i < CONFIG.particleCount; i++) {
            particles.push(new Particle(w, h));
        }
    }

    function initRings() {
        rings = [];
        const w = window.innerWidth;
        const h = window.innerHeight;
        for (let i = 0; i < CONFIG.ringCount; i++) {
            rings.push(new FloatingRing(w, h));
        }
    }

    // ─── Main Draw Loop ───
    function animate() {
        const w = window.innerWidth;
        const h = window.innerHeight;
        time += 0.005;

        ctx.clearRect(0, 0, w, h);

        drawGrid(w, h);
        drawNebula(w, h);
        drawRings(w, h);
        drawConnections(w, h);
        drawParticles(w, h);
        drawOrbs(w, h);
        drawMicGlow(w, h);
        if (isRecording) drawRecordingWaves(w, h);

        animFrame = requestAnimationFrame(animate);
    }

    // ─── Grid ───
    function drawGrid(w, h) {
        const step = CONFIG.gridSpacing;
        const wave = Math.sin(time * 0.5) * 0.008;
        ctx.strokeStyle = `rgba(255, 255, 255, ${CONFIG.gridOpacity + wave})`;
        ctx.lineWidth = 0.5;

        for (let x = 0; x <= w; x += step) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, h);
            ctx.stroke();
        }
        for (let y = 0; y <= h; y += step) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(w, y);
            ctx.stroke();
        }
    }

    // ─── Nebula (subtle color clouds) ───
    function drawNebula(w, h) {
        for (let i = 0; i < CONFIG.nebulaNodes; i++) {
            const nx = w * (0.1 + 0.8 * ((Math.sin(time * 0.3 + i * 1.7) + 1) / 2));
            const ny = h * (0.1 + 0.8 * ((Math.cos(time * 0.2 + i * 2.3) + 1) / 2));
            const r = 100 + Math.sin(time + i) * 60;
            const grad = ctx.createRadialGradient(nx, ny, 0, nx, ny, r);

            if (i % 3 === 0) {
                grad.addColorStop(0, `rgba(${CONFIG.accentR}, ${CONFIG.accentG}, ${CONFIG.accentB}, 0.06)`);
            } else if (i % 3 === 1) {
                grad.addColorStop(0, `rgba(${CONFIG.blueR}, ${CONFIG.blueG}, ${CONFIG.blueB}, 0.04)`);
            } else {
                grad.addColorStop(0, `rgba(${CONFIG.greenR}, ${CONFIG.greenG}, ${CONFIG.greenB}, 0.025)`);
            }
            grad.addColorStop(1, 'transparent');
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, w, h);
        }
    }

    // ─── Floating Rings ───
    function drawRings(w, h) {
        rings.forEach(ring => {
            ring.update(w, h);
            ctx.save();
            ctx.translate(ring.x, ring.y);
            ctx.rotate(ring.rotation);
            ctx.beginPath();
            ctx.arc(0, 0, ring.radius, 0, Math.PI * 2);
            ctx.strokeStyle = `rgba(${CONFIG.accentR}, ${CONFIG.accentG}, ${CONFIG.accentB}, ${ring.opacity})`;
            ctx.lineWidth = 1.5;
            ctx.setLineDash([6, 10]);
            ctx.lineDashOffset = ring.dashOffset;
            ctx.stroke();
            ctx.setLineDash([]);
            ctx.restore();
        });
    }

    // ─── Particles ───
    function drawParticles(w, h) {
        particles.forEach(p => {
            p.update(w, h, time);
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            if (p.hue === 0) {
                ctx.fillStyle = `rgba(${CONFIG.accentR}, ${CONFIG.accentG}, ${CONFIG.accentB}, ${p.opacity})`;
            } else {
                ctx.fillStyle = `rgba(${CONFIG.blueR}, ${CONFIG.blueG}, ${CONFIG.blueB}, ${p.opacity * 0.6})`;
            }
            ctx.fill();

            // Glow layer
            if (p.size > 1.5) {
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size * 4, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(${CONFIG.accentR}, ${CONFIG.accentG}, ${CONFIG.accentB}, ${p.opacity * 0.12})`;
                ctx.fill();
            }
        });
    }

    // ─── Connections ───
    function drawConnections(w, h) {
        const maxDist = CONFIG.connectionDist;
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < maxDist) {
                    const alpha = 0.18 * (1 - dist / maxDist);
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.strokeStyle = `rgba(${CONFIG.accentR}, ${CONFIG.accentG}, ${CONFIG.accentB}, ${alpha})`;
                    ctx.lineWidth = 0.8;
                    ctx.stroke();
                }
            }
        }
    }

    // ─── Floating Orbs (big ambient glows) ───
    function drawOrbs(w, h) {
        for (let i = 0; i < CONFIG.orbCount; i++) {
            const ox = w * (0.1 + 0.8 * ((Math.sin(time * 0.15 + i * 1.1) + 1) / 2));
            const oy = h * (0.1 + 0.8 * ((Math.cos(time * 0.12 + i * 1.5) + 1) / 2));
            const r = 60 + Math.sin(time * 0.3 + i * 0.7) * 40;
            const a = 0.03 + Math.sin(time * 0.5 + i) * 0.015;

            const grad = ctx.createRadialGradient(ox, oy, 0, ox, oy, r);
            grad.addColorStop(0, `rgba(${CONFIG.accentR}, ${CONFIG.accentG}, ${CONFIG.accentB}, ${a * 2})`);
            grad.addColorStop(0.5, `rgba(${CONFIG.accentR}, ${CONFIG.accentG}, ${CONFIG.accentB}, ${a})`);
            grad.addColorStop(1, 'transparent');
            ctx.fillStyle = grad;
            ctx.fillRect(ox - r, oy - r, r * 2, r * 2);
        }
    }

    // ─── Mic Button Glow ───
    function drawMicGlow(w, h) {
        updateMicPosition();

        // Constant ambient glow
        const baseR = isRecording ? 140 : 80;
        const baseA = isRecording ? 0.15 : 0.06;
        const breathe = Math.sin(time * 2) * 0.03;

        const grad = ctx.createRadialGradient(micX, micY, 0, micX, micY, baseR + 30);
        grad.addColorStop(0, `rgba(${CONFIG.accentR}, ${CONFIG.accentG}, ${CONFIG.accentB}, ${baseA + breathe})`);
        grad.addColorStop(0.5, `rgba(${CONFIG.accentR}, ${CONFIG.accentG}, ${CONFIG.accentB}, ${(baseA + breathe) * 0.3})`);
        grad.addColorStop(1, 'transparent');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(micX, micY, baseR + 30, 0, Math.PI * 2);
        ctx.fill();

        if (isRecording) {
            // Pulsating expanding rings
            for (let r = 0; r < 3; r++) {
                const phase = (time * 3 + r * 2) % 6;
                const radius = 40 + phase * 35;
                const alpha = Math.max(0, 0.15 - phase * 0.025);
                ctx.beginPath();
                ctx.arc(micX, micY, radius, 0, Math.PI * 2);
                ctx.strokeStyle = `rgba(${CONFIG.accentR}, ${CONFIG.accentG}, ${CONFIG.accentB}, ${alpha})`;
                ctx.lineWidth = 1.5;
                ctx.stroke();
            }
        }
    }

    // ─── Recording Sound Waves ───
    function drawRecordingWaves(w, h) {
        const cx = micX;
        const cy = micY;
        ctx.save();
        ctx.globalAlpha = 0.15;
        ctx.strokeStyle = `rgb(${CONFIG.accentR}, ${CONFIG.accentG}, ${CONFIG.accentB})`;
        ctx.lineWidth = 1;

        for (let wave = 0; wave < 3; wave++) {
            ctx.beginPath();
            const waveR = 70 + wave * 50;
            for (let angle = 0; angle < Math.PI * 2; angle += 0.05) {
                const noise = Math.sin(angle * 8 + time * 10 + wave) * (3 + wave * 3);
                const r = waveR + noise;
                const px = cx + Math.cos(angle) * r;
                const py = cy + Math.sin(angle) * r;
                if (angle === 0) ctx.moveTo(px, py);
                else ctx.lineTo(px, py);
            }
            ctx.closePath();
            ctx.stroke();
        }
        ctx.restore();
    }

    // ─── Public API ───
    function setRecording(val) {
        isRecording = val;
    }

    function destroy() {
        cancelAnimationFrame(animFrame);
        window.removeEventListener('resize', resize);
    }

    return { init, destroy, setRecording };
})();
