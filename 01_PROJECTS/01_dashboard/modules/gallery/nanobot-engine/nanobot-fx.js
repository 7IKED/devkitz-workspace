/* ═══════════════════════════════════════════════ */
/* DEVKiTZ™ — Nanobot FX Engine v1.0              */
/* Dissolve · Reassemble · Explode · Shimmer      */
/* Based on WISPE™ Canvas Engine + DkZ Extensions */
/* ═══════════════════════════════════════════════ */

const NanobotFX = (() => {
    'use strict';

    // ─── Configuration ───
    const CONFIG = {
        particleCount: 200,
        connectionDist: 160,
        dissolveParticles: 3000,
        reassembleSpeed: 0.04,
        explodeForce: 15,
        shimmerIntensity: 0.8,
        colors: {
            accent: { r: 250, g: 30, b: 78 },    // #fa1e4e
            green: { r: 0, g: 255, b: 136 },      // #00ff88
            blue: { r: 59, g: 130, b: 246 },       // #3b82f6
            yellow: { r: 255, g: 184, b: 0 },      // #ffb800
            cyan: { r: 0, g: 255, b: 255 }
        }
    };

    let canvas, ctx;
    let bgParticles = [];
    let fxParticles = [];
    let rings = [];
    let mouseX = 0, mouseY = 0;
    let animFrame;
    let time = 0;
    let activeEffects = [];

    // ─── Particle Class (Background) ───
    class BgParticle {
        constructor(w, h) {
            this.x = Math.random() * w;
            this.y = Math.random() * h;
            this.vx = (Math.random() - 0.5) * 0.3;
            this.vy = (Math.random() - 0.5) * 0.3;
            this.size = Math.random() * 2.5 + 0.5;
            this.baseOpacity = Math.random() * 0.5 + 0.2;
            this.opacity = this.baseOpacity;
            this.pulse = Math.random() * Math.PI * 2;
            this.pulseSpeed = 0.01 + Math.random() * 0.015;
            this.colorType = Math.random() > 0.75 ? 'blue' : 'accent';
        }
        update(w, h) {
            this.x += this.vx;
            this.y += this.vy;
            this.pulse += this.pulseSpeed;
            this.opacity = this.baseOpacity + Math.sin(this.pulse) * 0.12;

            // Mouse interaction — gentle repulsion
            const dx = this.x - mouseX;
            const dy = this.y - mouseY;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 120) {
                const force = (120 - dist) / 120 * 0.08;
                this.vx += (dx / dist) * force;
                this.vy += (dy / dist) * force;
            }

            // Dampen & wrap
            this.vx *= 0.997;
            this.vy *= 0.997;
            const sp = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
            if (sp < 0.05) {
                this.vx += (Math.random() - 0.5) * 0.08;
                this.vy += (Math.random() - 0.5) * 0.08;
            }
            if (this.x < -10) this.x = w + 10;
            if (this.x > w + 10) this.x = -10;
            if (this.y < -10) this.y = h + 10;
            if (this.y > h + 10) this.y = -10;
        }
    }

    // ─── FX Particle (Dissolve/Reassemble) ───
    class FxParticle {
        constructor(x, y, targetX, targetY, color, delay) {
            this.x = x;
            this.y = y;
            this.startX = x;
            this.startY = y;
            this.targetX = targetX;
            this.targetY = targetY;
            this.vx = (Math.random() - 0.5) * CONFIG.explodeForce;
            this.vy = (Math.random() - 0.5) * CONFIG.explodeForce - 3;
            this.size = Math.random() * 3 + 1;
            this.color = color;
            this.opacity = 1;
            this.life = 1;
            this.delay = delay || 0;
            this.phase = 'explode'; // explode | float | reassemble | done
            this.elapsed = 0;
            this.gravity = 0.02;
            this.friction = 0.98;
            this.trail = [];
        }
        update(dt) {
            this.elapsed += dt;
            if (this.elapsed < this.delay) return;

            switch (this.phase) {
                case 'explode':
                    this.vx *= this.friction;
                    this.vy *= this.friction;
                    this.vy += this.gravity;
                    this.x += this.vx;
                    this.y += this.vy;
                    this.life -= 0.008;
                    this.opacity = Math.max(0.3, this.life);
                    // Trail
                    this.trail.push({ x: this.x, y: this.y, o: this.opacity * 0.3 });
                    if (this.trail.length > 8) this.trail.shift();
                    if (this.life < 0.5) this.phase = 'float';
                    break;

                case 'float':
                    this.vx += (Math.random() - 0.5) * 0.3;
                    this.vy += (Math.random() - 0.5) * 0.3;
                    this.vx *= 0.95;
                    this.vy *= 0.95;
                    this.x += this.vx;
                    this.y += this.vy;
                    this.opacity = 0.3 + Math.sin(time * 5) * 0.15;
                    this.life -= 0.003;
                    if (this.life < 0.3) this.phase = 'reassemble';
                    break;

                case 'reassemble':
                    const dx = this.targetX - this.x;
                    const dy = this.targetY - this.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    const speed = CONFIG.reassembleSpeed + (1 - this.life) * 0.06;
                    this.x += dx * speed;
                    this.y += dy * speed;
                    this.opacity = Math.min(1, this.opacity + 0.02);
                    this.size = Math.max(0.5, this.size * 0.995);
                    this.trail = [];
                    if (dist < 2) {
                        this.phase = 'done';
                        this.x = this.targetX;
                        this.y = this.targetY;
                    }
                    break;
            }
        }
    }

    // ─── Floating Ring ───
    class FloatingRing {
        constructor(w, h) {
            this.x = Math.random() * w;
            this.y = Math.random() * h;
            this.radius = 40 + Math.random() * 100;
            this.rotation = Math.random() * Math.PI * 2;
            this.rotSpeed = (Math.random() - 0.5) * 0.004;
            this.vx = (Math.random() - 0.5) * 0.15;
            this.vy = (Math.random() - 0.5) * 0.15;
            this.dashOffset = 0;
            this.opacity = 0.04 + Math.random() * 0.06;
        }
        update(w, h) {
            this.x += this.vx;
            this.y += this.vy;
            this.rotation += this.rotSpeed;
            this.dashOffset += 0.25;
            if (this.x < -100) this.x = w + 100;
            if (this.x > w + 100) this.x = -100;
            if (this.y < -100) this.y = h + 100;
            if (this.y > h + 100) this.y = -100;
        }
    }

    // ─── Shockwave Effect ───
    class Shockwave {
        constructor(x, y) {
            this.x = x;
            this.y = y;
            this.radius = 0;
            this.maxRadius = 300;
            this.opacity = 0.6;
            this.speed = 8;
            this.done = false;
        }
        update() {
            this.radius += this.speed;
            this.opacity -= 0.012;
            if (this.opacity <= 0) this.done = true;
        }
        draw(ctx) {
            if (this.done) return;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.strokeStyle = `rgba(${CONFIG.colors.accent.r}, ${CONFIG.colors.accent.g}, ${CONFIG.colors.accent.b}, ${this.opacity})`;
            ctx.lineWidth = 2;
            ctx.stroke();
            // Inner glow ring
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius * 0.8, 0, Math.PI * 2);
            ctx.strokeStyle = `rgba(${CONFIG.colors.cyan.r}, ${CONFIG.colors.cyan.g}, ${CONFIG.colors.cyan.b}, ${this.opacity * 0.5})`;
            ctx.lineWidth = 1;
            ctx.stroke();
        }
    }

    // ═══ PUBLIC API ═══

    function init(canvasEl) {
        canvas = canvasEl || document.getElementById('nanobotCanvas');
        if (!canvas) return;
        ctx = canvas.getContext('2d');
        resize();
        window.addEventListener('resize', resize);
        document.addEventListener('mousemove', e => {
            mouseX = e.clientX;
            mouseY = e.clientY;
        });
        document.addEventListener('click', e => {
            activeEffects.push(new Shockwave(e.clientX, e.clientY));
        });
        initParticles();
        initRings();
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
    }

    function initParticles() {
        bgParticles = [];
        const w = window.innerWidth, h = window.innerHeight;
        for (let i = 0; i < CONFIG.particleCount; i++) {
            bgParticles.push(new BgParticle(w, h));
        }
    }

    function initRings() {
        rings = [];
        const w = window.innerWidth, h = window.innerHeight;
        for (let i = 0; i < 5; i++) {
            rings.push(new FloatingRing(w, h));
        }
    }

    // ─── Main Render Loop ───
    function animate() {
        const w = window.innerWidth, h = window.innerHeight;
        time += 0.005;
        ctx.clearRect(0, 0, w, h);

        drawGrid(w, h);
        drawNebula(w, h);
        drawRings(w, h);
        drawConnections();
        drawBgParticles(w, h);
        drawFxParticles();
        drawEffects();

        animFrame = requestAnimationFrame(animate);
    }

    function drawGrid(w, h) {
        const step = 60;
        const wave = Math.sin(time * 0.4) * 0.005;
        ctx.strokeStyle = `rgba(255, 255, 255, ${0.03 + wave})`;
        ctx.lineWidth = 0.5;
        for (let x = 0; x <= w; x += step) {
            ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
        }
        for (let y = 0; y <= h; y += step) {
            ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
        }
    }

    function drawNebula(w, h) {
        for (let i = 0; i < 12; i++) {
            const nx = w * (0.1 + 0.8 * ((Math.sin(time * 0.25 + i * 1.7) + 1) / 2));
            const ny = h * (0.1 + 0.8 * ((Math.cos(time * 0.18 + i * 2.3) + 1) / 2));
            const r = 80 + Math.sin(time + i) * 50;
            const grad = ctx.createRadialGradient(nx, ny, 0, nx, ny, r);
            const c = i % 3 === 0 ? CONFIG.colors.accent : i % 3 === 1 ? CONFIG.colors.blue : CONFIG.colors.green;
            const a = i % 3 === 2 ? 0.02 : 0.04;
            grad.addColorStop(0, `rgba(${c.r}, ${c.g}, ${c.b}, ${a})`);
            grad.addColorStop(1, 'transparent');
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, w, h);
        }
    }

    function drawRings(w, h) {
        rings.forEach(ring => {
            ring.update(w, h);
            ctx.save();
            ctx.translate(ring.x, ring.y);
            ctx.rotate(ring.rotation);
            ctx.beginPath();
            ctx.arc(0, 0, ring.radius, 0, Math.PI * 2);
            ctx.strokeStyle = `rgba(${CONFIG.colors.accent.r}, ${CONFIG.colors.accent.g}, ${CONFIG.colors.accent.b}, ${ring.opacity})`;
            ctx.lineWidth = 1.2;
            ctx.setLineDash([5, 9]);
            ctx.lineDashOffset = ring.dashOffset;
            ctx.stroke();
            ctx.setLineDash([]);
            ctx.restore();
        });
    }

    function drawBgParticles(w, h) {
        bgParticles.forEach(p => {
            p.update(w, h);
            const c = CONFIG.colors[p.colorType];
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${c.r}, ${c.g}, ${c.b}, ${p.opacity})`;
            ctx.fill();
            if (p.size > 1.2) {
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size * 3.5, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(${c.r}, ${c.g}, ${c.b}, ${p.opacity * 0.08})`;
                ctx.fill();
            }
        });
    }

    function drawConnections() {
        const maxD = CONFIG.connectionDist;
        for (let i = 0; i < bgParticles.length; i++) {
            for (let j = i + 1; j < bgParticles.length; j++) {
                const dx = bgParticles[i].x - bgParticles[j].x;
                const dy = bgParticles[i].y - bgParticles[j].y;
                const d = dx * dx + dy * dy;
                if (d < maxD * maxD) {
                    const alpha = 0.12 * (1 - Math.sqrt(d) / maxD);
                    ctx.beginPath();
                    ctx.moveTo(bgParticles[i].x, bgParticles[i].y);
                    ctx.lineTo(bgParticles[j].x, bgParticles[j].y);
                    ctx.strokeStyle = `rgba(${CONFIG.colors.accent.r}, ${CONFIG.colors.accent.g}, ${CONFIG.colors.accent.b}, ${alpha})`;
                    ctx.lineWidth = 0.6;
                    ctx.stroke();
                }
            }
        }
    }

    function drawFxParticles() {
        fxParticles.forEach(p => {
            p.update(0.016);
            if (p.phase === 'done') return;
            // Trail
            p.trail.forEach(t => {
                ctx.beginPath();
                ctx.arc(t.x, t.y, p.size * 0.6, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(${p.color.r}, ${p.color.g}, ${p.color.b}, ${t.o})`;
                ctx.fill();
            });
            // Main particle
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${p.color.r}, ${p.color.g}, ${p.color.b}, ${p.opacity})`;
            ctx.fill();
            // Glow
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size * 2.5, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${p.color.r}, ${p.color.g}, ${p.color.b}, ${p.opacity * 0.15})`;
            ctx.fill();
        });
        // Cleanup done particles
        fxParticles = fxParticles.filter(p => p.phase !== 'done');
    }

    function drawEffects() {
        activeEffects.forEach(e => { e.update(); e.draw(ctx); });
        activeEffects = activeEffects.filter(e => !e.done);
    }

    // ═══ DISSOLVE ELEMENT ═══
    function dissolveElement(el, opts = {}) {
        const rect = el.getBoundingClientRect();
        const count = opts.particles || 600;
        const color = opts.color || CONFIG.colors.accent;
        const w = rect.width, h = rect.height;

        el.style.transition = 'opacity 0.3s';
        el.style.opacity = '0';

        for (let i = 0; i < count; i++) {
            const px = rect.left + Math.random() * w;
            const py = rect.top + Math.random() * h;
            const tx = rect.left + w / 2 + (Math.random() - 0.5) * 200;
            const ty = rect.top + h / 2 + (Math.random() - 0.5) * 200;
            const delay = Math.random() * 0.3;
            fxParticles.push(new FxParticle(px, py, tx, ty, color, delay));
        }
        activeEffects.push(new Shockwave(rect.left + w / 2, rect.top + h / 2));
    }

    // ═══ REASSEMBLE ELEMENT ═══
    function reassembleElement(el, opts = {}) {
        const rect = el.getBoundingClientRect();
        const count = opts.particles || 600;
        const color = opts.color || CONFIG.colors.green;
        const w = rect.width, h = rect.height;

        for (let i = 0; i < count; i++) {
            const startX = rect.left + w / 2 + (Math.random() - 0.5) * 600;
            const startY = rect.top + h / 2 + (Math.random() - 0.5) * 600;
            const targetX = rect.left + Math.random() * w;
            const targetY = rect.top + Math.random() * h;
            const p = new FxParticle(startX, startY, targetX, targetY, color, Math.random() * 0.5);
            p.phase = 'reassemble';
            p.opacity = 0.6;
            fxParticles.push(p);
        }

        setTimeout(() => {
            el.style.transition = 'opacity 0.5s';
            el.style.opacity = '1';
        }, count > 300 ? 800 : 500);
    }

    // ═══ EXPLODE TILE ═══
    function explodeTile(tileEl, callback) {
        dissolveElement(tileEl, { particles: 800, color: CONFIG.colors.accent });
        setTimeout(() => {
            if (callback) callback();
            setTimeout(() => {
                reassembleElement(tileEl, { particles: 800, color: CONFIG.colors.green });
            }, 200);
        }, 1200);
    }

    // ═══ DESTROY ═══
    function destroy() {
        cancelAnimationFrame(animFrame);
        window.removeEventListener('resize', resize);
        bgParticles = [];
        fxParticles = [];
        rings = [];
        activeEffects = [];
    }

    return {
        init,
        destroy,
        dissolveElement,
        reassembleElement,
        explodeTile,
        CONFIG
    };
})();
