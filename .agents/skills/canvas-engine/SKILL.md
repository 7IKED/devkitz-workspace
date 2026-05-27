# ✨ Canvas Engine — Animation Skill

> **Skill-ID:** `canvas-engine`
> **Alias:** `canvas`, `particles`, `fx`
> **Terminal:** `dkz skill:canvas`

---

## Canvas Setup (PFLICHT)

```html
<canvas id="bg"></canvas>
```
```css
canvas#bg { position: fixed; inset: 0; z-index: 0; }
```

## Particle System

```javascript
const C = document.getElementById('bg'), X = C.getContext('2d');
let W, H, P = [], mx = -1, my = -1;

function sz() { W = C.width = innerWidth; H = C.height = innerHeight; }

function initParticles(n = 80) {
  P = [];
  for (let i = 0; i < n; i++) P.push({
    x: Math.random() * W, y: Math.random() * H,
    vx: (Math.random() - .5) * .3, vy: (Math.random() - .5) * .3,
    r: 1 + Math.random() * 1.5, a: .1 + Math.random() * .2
  });
}

function draw() {
  X.clearRect(0, 0, W, H);

  // 1. Nebula Gradient
  const g = X.createRadialGradient(W*.3, H*.3, 0, W*.5, H*.5, W*.6);
  g.addColorStop(0, `hsla(${HUE}, 80%, 8%, .12)`);
  g.addColorStop(.5, `hsla(${CYAN_HUE}, 40%, 5%, .06)`);
  g.addColorStop(1, 'transparent');
  X.fillStyle = g; X.fillRect(0, 0, W, H);

  // 2. Dot Grid
  X.fillStyle = 'rgba(255,255,255,.025)';
  for (let x = 0; x < W; x += 30)
    for (let y = 0; y < H; y += 30) {
      X.beginPath(); X.arc(x, y, .7, 0, 6.28); X.fill();
    }

  // 3. Particles + Mouse Repulsion
  const col = `hsl(${HUE}, 100%, 50%)`;
  for (const p of P) {
    p.x += p.vx; p.y += p.vy;
    // Wrap
    if (p.x < 0) p.x = W; if (p.x > W) p.x = 0;
    if (p.y < 0) p.y = H; if (p.y > H) p.y = 0;
    // Mouse Repulsion
    if (mx > 0) {
      const dx = p.x - mx, dy = p.y - my;
      const d = Math.sqrt(dx*dx + dy*dy);
      if (d < 120) {
        const f = (120 - d) / 120 * .2;
        p.vx += dx/d * f; p.vy += dy/d * f;
      }
    }
    p.vx *= .99; p.vy *= .99;
    // Draw
    X.globalAlpha = p.a;
    X.fillStyle = col;
    X.shadowBlur = 8; X.shadowColor = col;
    X.beginPath(); X.arc(p.x, p.y, p.r, 0, 6.28); X.fill();
  }

  // 4. Connection Lines
  X.shadowBlur = 0;
  for (let i = 0; i < P.length; i++)
    for (let j = i+1; j < P.length; j++) {
      const dx = P[i].x - P[j].x, dy = P[i].y - P[j].y;
      const d = dx*dx + dy*dy;
      if (d < 8000) {
        X.globalAlpha = .03 * (1 - d/8000);
        X.strokeStyle = col;
        X.beginPath();
        X.moveTo(P[i].x, P[i].y);
        X.lineTo(P[j].x, P[j].y);
        X.stroke();
      }
    }
  X.globalAlpha = 1;
  requestAnimationFrame(draw);
}

document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });
window.addEventListener('resize', () => { sz(); initParticles(); });
```

## Erweiterungen

### Click Ripples
```javascript
let ripples = [];
document.addEventListener('click', e =>
  ripples.push({ x: e.clientX, y: e.clientY, r: 0, a: 1 }));

function drawRipples(ctx) {
  ripples = ripples.filter(r => {
    r.r += 3; r.a -= .018;
    if (r.a <= 0) return false;
    ctx.globalAlpha = r.a * .4;
    ctx.strokeStyle = `hsl(${HUE}, 100%, 50%)`;
    ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.arc(r.x, r.y, r.r, 0, 6.28); ctx.stroke();
    return true;
  });
}
```

### Matrix Rain (AFK)
```javascript
function matrixRain(ctx, w, h) {
  const cols = Math.floor(w / 14);
  const drops = new Array(cols).fill(0);
  const chars = 'DkZdevkitz01アイウエオ';
  setInterval(() => {
    ctx.fillStyle = 'rgba(0,0,0,.05)';
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = `hsl(${HUE}, 100%, 50%)`;
    ctx.font = '12px monospace';
    for (let i = 0; i < cols; i++) {
      ctx.fillText(chars[Math.floor(Math.random()*chars.length)], i*14, drops[i]*14);
      if (drops[i]*14 > h && Math.random() > .975) drops[i] = 0;
      drops[i]++;
    }
  }, 50);
}
```
