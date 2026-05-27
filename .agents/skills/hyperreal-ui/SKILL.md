---
name: hyperreal-ui
description: >
  Hyperrealistisches UI-Animation-System — generiert 8K-fähige, interaktive
  Oberflächen mit fotorealistischen Lichteffekten, Nanobot-Schriftauflösung,
  Matrix-Cyber-Waben, Maus-interaktiven Partikeln, Explosions-Animationen,
  Standby/AFK-Modus und hyperrealen Controls.
---

# Hyperreal UI — Standard-Vorgehen (Skill)

> **PFLICHT bei JEDER neuen UI-KomponentE:** Dieses Dokument definiert den
> Standard für alle interaktiven Animationen und Lichteffekte im DkZ™ Ökosystem.
> ALLE Effekte MÜSSEN aus diesem Skill referenziert werden.

---

## 📋 Effekt-Katalog (Übersicht)

| # | Effekt | Typ | Canvas/CSS | Priorität |
|:-|:-------|:----|:-----------|:----------|
| 01 | Fotorealistischer Licht-Nebel | Hintergrund | Canvas | 🔴 High |
| 02 | Radiale Lichtstrahlen | Hintergrund | Canvas | 🔴 High |
| 03 | Sternen-Mikrodots (8K-Detail) | Hintergrund | Canvas | 🟡 Medium |
| 04 | Farbige Nebelflocken | Hintergrund | Canvas | 🟡 Medium |
| 05 | Maus-interaktive Partikel | Interaktion | Canvas | 🔴 High |
| 06 | Partikel-Verbindungslinien | Interaktion | Canvas | 🟡 Medium |
| 07 | Nanobot-Schriftauflösung | Interaktion | DOM+CSS | 🔴 High |
| 08 | Matrix-Cyber-Waben (Hexagons) | Hintergrund | Canvas | 🔴 High |
| 09 | 8K-Explosions-Animation | Aktion | DOM+WAAPI | 🔴 High |
| 10 | Intro-Stagger-Animation | Initial | CSS | 🔴 High |
| 11 | Standby/AFK-Lauftext | Idle | DOM+JS | 🟡 Medium |
| 12 | 4K-Glassmorphism-Buttons | UI | CSS | 🔴 High |
| 13 | HD-SVG-Icons | UI | SVG | 🔴 High |
| 14 | Button-Ripple-Effekt | Interaktion | DOM+JS | 🟡 Medium |
| 15 | Hyperreales Hamburger-Menü | UI | CSS+JS | 🔴 High |
| 16 | Floating-Logo-Animation | Initial | CSS | 🟡 Medium |
| 17 | Gradient-Text-Shift | Initial | CSS | 🟡 Medium |
| 18 | Akzent-Linien-Shimmer | Dekoration | CSS | 🟢 Low |
| 19 | Status-Bar-Scan | Dekoration | CSS | 🟢 Low |
| 20 | Corner-Dots-Pulse | Dekoration | CSS | 🟢 Low |

---

## 🔥 Detail-Beschreibung ALLER Effekte

### 01 — Fotorealistischer Licht-Nebel (Nebula Glow)

**Zweck:** Erzeugt tiefe, fotoähnliche Leuchteffekte im Hintergrund — wie Nebel oder Galaxien.

**Implementierung (Canvas):**
```javascript
// NEBULA POSITIONEN (4 Ecken + verteilt)
const nebulae = [
  { x: 200, y: 150, r: 600 },
  { x: W-300, y: 200, r: 500 },
  { x: 100, y: H-200, r: 450 },
  { x: W-500, y: H-300, r: 550 }
];

for (const n of nebulae) {
  const path = new Path2D();
  path.ellipse(n.x + n.r/2, n.y + n.r/2, n.r/2, n.r/2, 0, 0, Math.PI*2);
  const grad = ctx.createRadialGradient(
    n.x + n.r/2, n.y + n.r/2, 0,
    n.x + n.r/2, n.y + n.r/2, n.r/2
  );
  grad.addColorStop(0, 'rgba(250,30,78,0.04)');
  grad.addColorStop(0.5, 'rgba(59,130,246,0.02)');
  grad.addColorStop(1, 'transparent');
  ctx.fillStyle = grad;
  ctx.fillRect(n.x, n.y, n.r, n.r);
}
```

**Empfohlene Werte:**
- Opacity: 0.02–0.08 (sehr subtil!)
- Radius: 300–800px
- Farben: Akzentrot + Blau + Violett
- Anzahl: 3–6 Nebulae pro Seite

---

### 02 — Radiale Lichtstrahlen

**Zweck:** Sonnenstrahl-ähnliche Lichtkegel, die vom Zentrum ausgehen — 8K-fotorealistischer Look.

**Implementierung (Canvas):**
```javascript
for (let a = 0; a < 360; a += 12) {
  const rad = a * Math.PI / 180;
  const x1 = W/2 + Math.cos(rad) * 80;
  const y1 = H/2 + Math.sin(rad) * 80;
  const x2 = W/2 + Math.cos(rad) * 2800;
  const y2 = H/2 + Math.sin(rad) * 2800;

  ctx.save();
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2 - 150);
  ctx.lineTo(x2, y2 + 150);
  ctx.closePath();
  ctx.fillStyle = `rgba(255,255,255,0.01)`;
  ctx.fill();
  ctx.restore();
}
```

**Alternative (dünne Linien):**
```javascript
const rayPen = new Path2D();
for (let a = 0; a < 360; a += 15) {
  const rad = a * Math.PI / 180;
  const x1 = W/2 + Math.cos(rad) * 100;
  const y1 = H/2 + Math.sin(rad) * 100;
  const x2 = W/2 + Math.cos(rad) * 3000;
  const y2 = H/2 + Math.sin(rad) * 3000;
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.strokeStyle = `rgba(255,255,255,0.012)`;
  ctx.lineWidth = 300 + Math.sin(a * 0.5) * 100;
  ctx.stroke();
}
```

**Empfohlene Werte:**
- Winkel: alle 8–15°
- Opacity: 0.005–0.025
- Länge: bis zu 3000px
- Linienbreite: 200–400px (für weiche Strahlen)

---

### 03 — Sternen-Mikrodots (8K-Detail)

**Zweck:** Feine, zufällige Punkte im Hintergrund — simuliert 8K-Fototextur.

**Implementierung (Canvas):**
```javascript
const rnd = new Random();
for (let i = 0; i < 400; i++) {
  const sx = rnd.Next(0, W);
  const sy = rnd.Next(0, H);
  const size = rnd.Next(1, 4);
  const alpha = rnd.Next(20, 100);
  ctx.beginPath();
  ctx.arc(sx, sy, size, 0, Math.PI*2);
  ctx.fillStyle = `rgba(255,255,255,${alpha/255})`;
  ctx.fill();
}
```

**Empfohlene Werte:**
- Anzahl: 300–500
- Größe: 1–4px
- Opacity: 0.08–0.4
- Position: gleichmäßig verteilt

---

### 04 — Farbige Nebelflocken

**Zweck:** Sanfte Farbwolken mit 8K-Tiefenschärfe.

**Implementierung (Canvas) — Positionen VOR dem Zeichnen sammeln:**
```javascript
// Positionen generieren (NICHT inline if/else verwenden!)
const clouds = [];
for (let i = 0; i < 50; i++) {
  const ci = i % 3;
  const colors = [
    [250, 30, 78],   // Rot
    [59, 130, 246],  // Blau
    [120, 50, 200]   // Violett
  ];
  clouds.push({
    x: Math.random() * W,
    y: Math.random() * H,
    r: 30 + Math.random() * 150,
    alpha: 0.005 + Math.random() * 0.010,
    color: colors[ci]
  });
}

// Zeichnen (nachdem ALLE Partikel/Strahlen fertig sind — aber VOR dem Logo)
for (const c of clouds) {
  const grad = ctx.createRadialGradient(c.x, c.y, 0, c.x, c.y, c.r);
  grad.addColorStop(0, `rgba(${c.color[0]},${c.color[1]},${c.color[2]},${c.alpha})`);
  grad.addColorStop(1, 'transparent');
  ctx.fillStyle = grad;
  ctx.fillRect(c.x - c.r, c.y - c.r, c.r*2, c.r*2);
}
```

---

### 05 — Maus-interaktive Partikel

**Zweck:** 120–200 Float-Partikel, die auf Mausposition reagieren (abstoßen/anziehen) + farbiger Glow bei Annäherung.

**Vollständige Implementierung:**

```javascript
// === SETUP ===
const particles = [];
const PCOUNT = 160;

for (let i = 0; i < PCOUNT; i++) {
  particles.push({
    x: Math.random() * W, y: Math.random() * H,
    r: Math.random() * 2.5 + 0.5,
    dx: (Math.random() - 0.5) * 0.4,
    dy: (Math.random() - 0.5) * 0.4,
    life: Math.random() * 200,
    maxLife: 200 + Math.random() * 300,
    alpha: Math.random() * 0.4 + 0.1,
    hue: Math.random() > 0.6 ? 250 : 348,  // 348=Rot, 250=Blau
    phase: Math.random() * Math.PI * 2
  });
}

// === MOUSE TRACKING ===
const mouse = { x: -1000, y: -1000, active: false };
document.addEventListener('mousemove', e => {
  mouse.x = e.clientX;
  mouse.y = e.clientY;
  mouse.active = true;
});
document.addEventListener('mouseleave', () => { mouse.active = false; });

// === MAIN LOOP (Auszug) ===
function drawParticles() {
  ctx.clearRect(0, 0, W, H);
  time += 0.008;

  // Floating-Bewegung
  for (const p of particles) {
    p.x += p.dx + Math.sin(time * 0.5 + p.phase) * 0.08;
    p.y += p.dy + Math.cos(time * 0.4 + p.phase) * 0.08;
    p.life++;

    // Maus-Abstoßung
    const dm = Math.hypot(p.x - mouse.x, p.y - mouse.y);
    if (dm < 120 && mouse.active) {
      const force = (120 - dm) / 120;
      const angle = Math.atan2(p.y - mouse.y, p.x - mouse.x);
      p.x += Math.cos(angle) * force * 2.5;
      p.y += Math.sin(angle) * force * 2.5;

      // Mouse-Glow
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r * 4, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(250,30,78,${0.08 * force})`;
      ctx.fill();
    }

    // Partikel zeichnen
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fillStyle = p.hue === 348
      ? `rgba(250,30,78,${p.alpha})`
      : `rgba(120,80,255,${p.alpha * 0.8})`;
    ctx.fill();
  }

  requestAnimationFrame(drawParticles);
}
```

**Physik-Parameter:**
| Parameter | Wert | Effekt |
|:----------|:-----|:-------|
| Partikelanzahl | 120–200 | Performance vs. Dichte |
| Geschwindigkeit | 0.3–0.6 | Float-Tempo |
| Maus-Radius | 100–150px | Reichweite Interaktion |
| Abstoßungskraft | 2.0–3.5 | Wie stark Partikel fliehen |
| Partikelgröße | 0.5–3px | Visuelle Präsenz |
| Rot-Anteil | ~70% | Primärfarbe |
| Blau-Anteil | ~30% | Sekundärfarbe |

---

### 06 — Partikel-Verbindungslinien (Neural Mesh)

**Zweck:** Zeichnet transparente Linien zwischen nahen Partikeln — wie ein neuronales Netz.

```javascript
// INNERHALB des Main-Loops (nach Partikel-Update)
// Performance: nur jedes 3. Paar prüfen
for (let i = 0; i < particles.length; i++) {
  for (let j = i + 1; j < particles.length; j += 3) {
    const dx = particles[i].x - particles[j].x;
    const dy = particles[i].y - particles[j].y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < 100) {
      ctx.beginPath();
      ctx.moveTo(particles[i].x, particles[i].y);
      ctx.lineTo(particles[j].x, particles[j].y);
      ctx.strokeStyle = `rgba(250,30,78,${0.025 * (1 - dist/100)})`;
      ctx.lineWidth = 0.5;
      ctx.stroke();
    }
  }
}
```

**Parameter:**
| Parameter | Wert |
|:----------|:-----|
| Max. Distanz | 100–150px |
| Opacity | 0.015–0.04 |
| Linienbreite | 0.5px |
| Schritt (j+=) | 2–4 (Performance) |

---

### 07 — Nanobot-Schriftauflösung

**Zweck:** Text zerfällt unter der Maus in einzelne Buchstaben-Partikel, die auseinanderfliegen und sich später wieder rekonstruieren.

**HTML-Struktur:**
```html
<div class="nanobot-text" id="nanobotText">
  <span id="dkzLogoText">DkZ</span>
</div>
```

**CSS:**
```css
.char {
  display: inline-block;
  transition: all 0.6s cubic-bezier(0.22, 1, 0.36, 1);
}
.char.nanobot-disperse {
  opacity: 0;
  transform: translate(
    calc(var(--dx, 0) * 1px),
    calc(var(--dy, 0) * 1px)
  ) scale(0.3) rotate(calc(var(--dr, 0) * 1deg));
  filter: blur(8px) brightness(2);
}
.char.nanobot-reconstruct {
  opacity: 1;
  transform: translate(0, 0) scale(1) rotate(0deg);
  filter: blur(0) brightness(1);
  transition: all 0.8s cubic-bezier(0.22, 1, 0.36, 1);
}
```

**JavaScript — Setup + Disperse + Reconstruct:**
```javascript
function setupNanobot(selector) {
  const el = document.querySelector(selector);
  const text = el.textContent;
  el.innerHTML = '';
  for (let i = 0; i < text.length; i++) {
    const span = document.createElement('span');
    span.className = 'char';
    span.textContent = text[i];
    el.appendChild(span);
  }
}

function disperseNanobot(mx, my) {
  if (nanobotActive) return;
  const chars = document.querySelectorAll('.char');
  let hit = false;
  chars.forEach(ch => {
    const rect = ch.getBoundingClientRect();
    const cx = rect.left + rect.width/2;
    const cy = rect.top + rect.height/2;
    const dist = Math.hypot(mx - cx, my - cy);
    if (dist < 100) {
      hit = true;
      const angle = Math.atan2(cy - my, cx - mx);
      const force = 80 + Math.random() * 60;
      ch.style.setProperty('--dx', (Math.cos(angle) * force + (Math.random()-0.5)*40).toFixed(1));
      ch.style.setProperty('--dy', (Math.sin(angle) * force + (Math.random()-0.5)*40).toFixed(1));
      ch.style.setProperty('--dr', ((Math.random()-0.5)*180).toFixed(1));
      ch.className = 'char nanobot-disperse';
    }
  });
  if (hit) {
    nanobotActive = true;
    setTimeout(() => reconstructNanobot(), 1800);
  }
}

function reconstructNanobot() {
  document.querySelectorAll('.char').forEach(ch => {
    ch.className = 'char nanobot-reconstruct';
  });
  setTimeout(() => {
    document.querySelectorAll('.char').forEach(ch => { ch.className = 'char'; });
    nanobotActive = false;
  }, 900);
}

// Trigger via Maus
document.addEventListener('mousemove', e => disperseNanobot(e.clientX, e.clientY));
```

**Parameter:**
| Parameter | Wert | Beschreibung |
|:----------|:-----|:------------|
| Auslöseradius | 100px | Wie nah Maus an Schrift |
| Zerfallskraft | 80–140px | Flugweite der Partikel |
| Zerfallsdauer | 0.6s | Wie schnell Auflösung |
| Rekonstruktionsdelay | 1.8s | Wartezeit vor Neubau |
| Rekonstruktionsdauer | 0.8s | Wie schnell Neubau |

---

### 08 — Matrix-Cyber-Waben (Hexagons)

**Zweck:** Sechseck-Wabenstruktur, die aus den Ecken kommt und zum Zentrum hin zuspitzt — Matrix-/Cyberpunk-Ästhetik.

**Canvas-Implementierung:**
```javascript
function drawHexagons(ctx, W, H) {
  const size = 45;           // Hexagon-Größe
  const rows = Math.ceil(H / (size * 1.5)) + 2;
  const cols = Math.ceil(W / (size * 1.75)) + 2;
  const cx = W / 2, cy = H / 2;
  const maxDist = Math.hypot(W, H) / 2;

  for (let row = -1; row < rows; row++) {
    for (let col = -1; col < cols; col++) {
      const offsetX = (row % 2 === 0) ? 0 : size * 0.9;
      const x = col * size * 1.75 + offsetX;
      const y = row * size * 1.5;

      const dist = Math.hypot(x - cx, y - cy) / maxDist;
      if (dist < 0.15) continue;  // NICHTS im Zentrum

      // Opacity: von Ecke (max) zu Mitte (0)
      const alpha = Math.min(1, Math.pow(Math.max(0, (dist - 0.15) / 0.7), 1.4)) * 0.15;

      // Leichte Verzerrung für Tiefe
      ctx.save();
      ctx.translate(x, y);
      ctx.transform(1, (y-cy)/cy*0.05, (x-cx)/cx*0.08, 1, 0, 0);

      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const angle = (Math.PI / 3) * i - Math.PI / 6;
        const px = size * Math.cos(angle);
        const py = size * Math.sin(angle);
        i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.strokeStyle = `rgba(250,30,78,${alpha})`;
      ctx.lineWidth = 0.8;
      ctx.stroke();
      ctx.fillStyle = `rgba(250,30,78,${alpha * 0.08})`;
      ctx.fill();
      ctx.restore();
    }
  }
}
```

**Parameter:**
| Parameter | Wert | Beschreibung |
|:----------|:-----|:------------|
| Hexagon-Größe | 35–50px | Kantenlänge |
| Opacity (Ecke) | 0.12–0.20 | Maximale Transparenz |
| Opacity (Zentrum) | 0 | Unsichtbar in Mitte |
| Verzerrung X | 0.08 | Tiefen-Skew |
| Verzerrung Y | 0.05 | Tiefen-Skew |
| Linienbreite | 0.6–1.0px | Feine Linien |

---

### 09 — 8K-Explosions-Animation

**Zweck:** Beim Klick auf "Explode"-Button zerfällt das Ziel in 80+ Konfetti-Partikel mit Rotation und Schweif.

```javascript
function explodeElement(element) {
  const rect = element.getBoundingClientRect();
  const ex = rect.left + rect.width / 2;
  const ey = rect.top + rect.height / 2;

  for (let i = 0; i < 80; i++) {
    const piece = document.createElement('div');
    piece.className = 'confetti-piece';

    const angle = Math.random() * Math.PI * 2;
    const speed = 200 + Math.random() * 400;
    const dx = Math.cos(angle) * speed;
    const dy = Math.sin(angle) * speed - 150;
    const size = 3 + Math.random() * 8;
    const colors = ['#fa1e4e','#ff6b8a','#00ff88','#3b82f6','#ffb800','#a855f7'];

    piece.style.cssText = `
      position: fixed; width:${size}px; height:${size}px;
      background:${colors[i % colors.length]};
      border-radius:${Math.random()>0.5?'50%':'2px'};
      left:${ex}px; top:${ey}px; z-index:8;
      pointer-events:none;
      box-shadow:0 0 6px ${colors[i % colors.length]};
    `;
    document.body.appendChild(piece);

    const rotation = (Math.random() - 0.5) * 720;
    piece.animate([
      { transform: 'translate(0,0) rotate(0deg)', opacity: 1 },
      { transform: `translate(${dx}px,${dy}px) rotate(${rotation}deg)`, opacity: 0 }
    ], {
      duration: 800 + Math.random() * 600,
      easing: 'cubic-bezier(.22,1,.36,1)',
      fill: 'forwards'
    }).onfinish = () => piece.remove();
  }

  // Button-Flash
  element.style.transform = 'scale(1.1)';
  element.style.boxShadow = '0 0 60px rgba(250,30,78,0.6), 0 0 120px rgba(250,30,78,0.3)';
  setTimeout(() => { element.style.transform = ''; element.style.boxShadow = ''; }, 400);
}
```

**Parameter:**
| Parameter | Wert | Beschreibung |
|:----------|:-----|:------------|
| Partikelanzahl | 60–120 | Explosionsdichte |
| Geschwindigkeit | 200–600px | Flugweite |
| Größe | 3–10px | Konfetti-Varianz |
| Dauer | 800–1400ms | Animationslänge |
| Farben | 6 | Regenbogen-Palette |
| Schwerkraft | -150px (up) | Leichter Aufwärtsbogen |

---

### 10 — Intro-Stagger-Animation

**Zweck:** Beim Laden der Seite erscheinen Elemente in gestaffelter Reihenfolge.

```css
/* Basis-Keyframe */
@keyframes introFade {
  from { opacity: 0; transform: translateY(16px); }
  to   { opacity: 1; transform: translateY(0); }
}

/* Staggered Delays */
.badge-8k          { animation: introFade 0.6s ease 2.2s forwards; }
.dkz-logo-hr       { animation: introFade 1.0s ease 0.8s forwards; }
.claim-hr          { animation: introFade 1.0s ease 1.4s forwards; }
.tagline-hr        { animation: introFade 1.0s ease 1.8s forwards; }
.status-hr         { animation: introFade 0.8s ease 2.0s forwards; }
.button-row        { animation: introFade 0.8s ease 2.2s forwards; }
.hamburger-btn     { animation: introFade 0.6s ease 2.6s forwards; }
.corner-dot        { animation: introFade 0.6s ease 1.6s forwards; }
.accent-line-hr    { animation: introFade 0.8s ease 1.2s forwards; }
```

**Stagger-Reihenfolge:**
```
T=0.0s  → Canvas (sofort)
T=0.3s  → Hexagons (opacity fade)
T=0.8s  → DkZ Logo (Hauptelement)
T=1.2s  → Akzent-Linien
T=1.4s  → Claim (DEVKiTZ)
T=1.6s  → Corner Dots
T=1.8s  → Tagline
T=2.0s  → Status-Bar
T=2.2s  → Buttons + 8K Badge
T=2.6s  → Hamburger-Menü
```

---

### 11 — Standby/AFK-Modus

**Zweck:** Nach 4s Inaktivität erscheint ein Lauftext mit System-Infos.

```javascript
const standbyInfos = [
  "⠿ DkZ HYPERREAL v1.0  ⠿  SYSTEM: ONLINE  ⠿  MODULES: 89+",
  "⠿ LAST COMMIT: feat(hyperreal): 8K animation system  ⠿  60 FPS",
  "⠿ DEVKiTZ ECOSYSTEM  ⠿  26 WORKFLOWS  ⠿  19 SKILLS",
  "⠿ HOST: BAZE²  ⠿  DkZ DESIGN SYSTEM v2"
];

let standbyTimer = null;
let standbyActive = false;

function startStandby() {
  if (standbyActive) return;
  standbyActive = true;
  standbyOverlay.classList.add('active');

  let idx = 0, pos = window.innerWidth;
  marqueeEl.textContent = '   ' + standbyInfos[idx] + '   ';
  marqueeEl.style.left = pos + 'px';

  function animate() {
    if (!standbyActive) return;
    pos -= 1.2;
    marqueeEl.style.left = pos + 'px';
    if (pos < -marqueeEl.offsetWidth) {
      idx = (idx + 1) % standbyInfos.length;
      marqueeEl.textContent = '   ' + standbyInfos[idx] + '   ';
      pos = window.innerWidth + 50;
    }
    requestAnimationFrame(animate);
  }
  animate();
}

function stopStandby() { standbyActive = false; standbyOverlay.classList.remove('active'); }

// Timer + Reset
function resetStandbyTimer() {
  clearTimeout(standbyTimer);
  if (standbyActive) stopStandby();
  standbyTimer = setTimeout(startStandby, 4000);
}

// Events
document.addEventListener('mousemove', resetStandbyTimer);
document.addEventListener('click', resetStandbyTimer);
document.addEventListener('keydown', resetStandbyTimer);
```

**Parameter:**
| Parameter | Wert |
|:----------|:-----|
| Inaktivitäts-Timeout | 4000ms |
| Lauftext-Geschwindigkeit | 1.2px/Frame |
| Text-Opacity | 0.35 |
| Overlay-Opacity | 0.5 |
| Einblend-Dauer | 1.5s |

---

### 12 — 4K-Glassmorphism-Buttons

**CSS — vollständiges Button-Styling:**
```css
.btn-hr {
  position: relative;
  overflow: hidden;
  padding: 14px 32px;
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 12px;
  background: rgba(18,18,24,0.6);
  backdrop-filter: blur(20px);
  color: #e8e8ec;
  font-size: 14px;
  font-weight: 500;
  letter-spacing: 1px;
  cursor: pointer;
  min-height: 48px;
  display: inline-flex;
  align-items: center;
  gap: 10px;
  transition: all 0.25s cubic-bezier(0.22, 1, 0.36, 1);
  box-shadow:
    0 4px 24px rgba(0,0,0,0.3),
    inset 0 1px 0 rgba(255,255,255,0.06),
    inset 0 0 20px rgba(250,30,78,0.0);
}
.btn-hr:hover {
  transform: translateY(-2px);
  border-color: rgba(250,30,78,0.3);
  box-shadow:
    0 8px 32px rgba(250,30,78,0.15),
    inset 0 1px 0 rgba(255,255,255,0.08),
    inset 0 0 30px rgba(250,30,78,0.08);
}
.btn-hr:active {
  transform: translateY(0px) scale(0.98);
}
.btn-hr.primary {
  background: rgba(250,30,78,0.15);
  border-color: rgba(250,30,78,0.25);
}
```

**Ripple-Effekt bei Click:**
```javascript
function triggerRipple(e) {
  const btn = e.currentTarget;
  const rect = btn.getBoundingClientRect();
  const ripple = document.createElement('span');
  ripple.className = 'ripple-effect';
  const size = Math.max(rect.width, rect.height);
  ripple.style.cssText = `
    position:absolute; border-radius:50%;
    width:${size}px; height:${size}px;
    background:rgba(250,30,78,0.25);
    left:${e.clientX - rect.left - size/2}px;
    top:${e.clientY - rect.top - size/2}px;
    transform:scale(0); pointer-events:none;
    animation:rippleAnim 0.6s ease-out forwards;
  `;
  btn.querySelector('.ripple-container')?.remove(); // Cleanup alter Container
  const container = document.createElement('span');
  container.className = 'ripple-container';
  container.style.cssText = 'position:absolute;inset:0;overflow:hidden;border-radius:inherit;pointer-events:none;';
  btn.appendChild(container);
  container.appendChild(ripple);
  setTimeout(() => ripple.remove(), 700);
}

/* CSS-Keyframe */
@keyframes rippleAnim {
  to { transform: scale(4); opacity: 0; }
}
```

---

### 13 — HD-SVG-Icons

**Standard-SVG-Icons** (18×18px, Stroke-width 2):

```html
<!-- Play/Polygon -->
<svg viewBox="0 0 24 24">
  <polygon points="5 3 19 12 5 21 5 3"/>
</svg>

<!-- Clock/Circle -->
<svg viewBox="0 0 24 24">
  <circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>
</svg>

<!-- Home -->
<svg viewBox="0 0 24 24">
  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
  <polyline points="9 22 9 12 15 12 15 22"/>
</svg>

<!-- Settings/Gear -->
<svg viewBox="0 0 24 24">
  <circle cx="12" cy="12" r="3"/>
  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06..."/>
</svg>

<!-- Trash/Delete -->
<svg viewBox="0 0 24 24">
  <polyline points="3 6 5 6 21 6"/>
  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4..."/>
</svg>
```

**Icon-Regeln:**
- `stroke="currentColor"` für dynamische Farben
- `fill="none"` + `stroke-width="2"` (außer Polygone)
- `stroke-linecap="round"` + `stroke-linejoin="round"`
- Optional: `filter: drop-shadow(0 0 6px rgba(250,30,78,0.3))`

---

### 14 — Hyperreales Hamburger-Menü

**Struktur:**
```html
<!-- Button -->
<div class="hamburger-btn" id="hamburgerBtn" onclick="toggleMenu()">
  <svg viewBox="0 0 24 24">
    <line x1="3" y1="6" x2="21" y2="6"/>
    <line x1="3" y1="12" x2="21" y2="12"/>
    <line x1="3" y1="18" x2="21" y2="18"/>
  </svg>
</div>

<!-- Panel -->
<div class="menu-panel" id="menuPanel">
  <div class="menu-item">... </div>
  ...
  <div class="menu-footer">DkZ™ HYPERREAL</div>
</div>
```

**CSS:**
```css
.hamburger-btn {
  position: fixed; top: 20px; right: 24px; z-index: 20;
  width: 48px; height: 48px;
  background: rgba(18,18,24,0.5);
  backdrop-filter: blur(16px);
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: 12px;
  cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  transition: all 0.3s ease;
}
.hamburger-btn:hover {
  background: rgba(250,30,78,0.15);
  border-color: rgba(250,30,78,0.3);
}
.hamburger-btn.open svg {
  stroke: #fa1e4e;
  transform: rotate(90deg);
}

.menu-panel {
  position: fixed; top: 0; right: -400px;
  width: 360px; max-width: 85vw; height: 100vh;
  z-index: 15;
  background: rgba(8,8,12,0.85);
  backdrop-filter: blur(40px);
  border-left: 1px solid rgba(255,255,255,0.05);
  transition: right 0.5s cubic-bezier(0.22, 1, 0.36, 1);
  padding: 80px 32px 32px;
  display: flex; flex-direction: column;
  box-shadow: -20px 0 80px rgba(0,0,0,0.6);
}
.menu-panel.open { right: 0; }

.menu-item {
  display: flex; align-items: center; gap: 16px;
  padding: 14px 16px; border-radius: 10px;
  color: #8a8a9a; font-size: 15px;
  text-decoration: none;
  transition: all 0.25s ease;
  border: 1px solid transparent;
  cursor: pointer;
}
.menu-item:hover {
  color: #e8e8ec;
  background: rgba(250,30,78,0.06);
  border-color: rgba(250,30,78,0.1);
  transform: translateX(4px);
}
```

**Toggle:**
```javascript
function toggleMenu() {
  menuOpen = !menuOpen;
  document.getElementById('menuPanel').classList.toggle('open');
  document.getElementById('hamburgerBtn').classList.toggle('open');
}
```

---

### 15–20 — Zusatz-Effekte (Kurz-Referenz)

**15. Gradient-Text-Shift:**
```css
.dkz-logo {
  background: linear-gradient(135deg, #fa1e4e 0%, #ff6b8a 40%, #fa1e4e 70%);
  background-size: 300% 300%;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: gradShift 5s ease-in-out infinite;
}
@keyframes gradShift {
  0%,100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
}
```

**16. Floating-Logo:**
```css
@keyframes floatText {
  0%,100% { transform: translateY(0px); }
  50% { transform: translateY(-8px); }
}
/* Zusätzlich: Blur-Pulse für Tiefe */
@keyframes blurPulse {
  0%,100% { filter: blur(30px) brightness(1.2); opacity: 0.2; }
  50% { filter: blur(50px) brightness(2); opacity: 0.5; }
}
```

**17. Akzent-Linien-Shimmer:**
```css
.accent-line .line {
  width: 80px; height: 2px;
  background: linear-gradient(90deg, transparent, #fa1e4e, transparent);
  position: relative; overflow: hidden;
}
.accent-line .line::after {
  content: ''; position: absolute;
  top: 0; left: -100%; width: 100%; height: 100%;
  background: linear-gradient(90deg, transparent, rgba(250,30,78,0.8), transparent);
  animation: shimmer 3s ease-in-out infinite;
}
@keyframes shimmer {
  0% { left: -100%; }
  100% { left: 100%; }
}
```

**18. Status-Bar-Scan:**
```css
.status-bar .bar-fill {
  height: 100%;
  background: linear-gradient(90deg, #00ff88, #00ff88);
  animation: barScan 2.5s ease-in-out infinite;
  border-radius: 2px;
}
@keyframes barScan {
  0% { width: 0%; opacity: 0.3; }
  50% { width: 100%; opacity: 1; }
  100% { width: 0%; opacity: 0.3; }
}
```

**19. Corner-Dots-Pulse:**
```css
.corner-dot {
  width: 10px; height: 10px;
  background: #fa1e4e; border-radius: 50%;
  box-shadow: 0 0 24px rgba(250,30,78,0.3);
  animation: dotPulse 3s ease-in-out infinite;
}
@keyframes dotPulse {
  0%,100% { transform: scale(1); opacity: 0.6; }
  50% { transform: scale(1.6); opacity: 1; }
}
```

**20. Logo-Blur-Glow (3D-Tiefe):**
```css
.dkz-logo {
  filter: drop-shadow(0 0 60px rgba(250,30,78,0.3));
}
/* Oder via Canvas-Glow */
ctx.shadowColor = 'rgba(250,30,78,0.3)';
ctx.shadowBlur = 60;
```

---

## 📐 Implementierungs-Architektur

### Layer-Stack (z-index)

```
z-index 0:   Hexagon Canvas (Matrix-Waben)
z-index 1:   Partikel Canvas (Maus-Interaktion)
z-index 2:   Overlay (Logo, Text, Buttons)
z-index 3:   Corner Dots + Badge
z-index 5:   Standby/AFK Overlay
z-index 8:   Explosion-Konfetti
z-index 10:  8K Badge
z-index 15:  Hamburger Panel
z-index 20:  Hamburger Button
```

### Initialisierungs-Reihenfolge

```javascript
// 1. Canvas Setup
initMainCanvas();      // Partikel
initHexCanvas();       // Hexagons

// 2. Mouse Tracker
initMouseTracking();

// 3. Standby Timer
initStandbyTimer();    // 4s Auto-Standby

// 4. Nanobot Setup
setupNanobot('#logoText');

// 5. RAF Loop Start
requestAnimationFrame(mainLoop);

// 6. Events registrieren
// - mousemove → disperseNanobot + resetStandby
// - click → resetStandby
// - resize → Canvas-Resize + Hexagon-Neuzeichnen
```

### Canvas-Management

```javascript
// ZWEI getrennte Canvas (Performance!)
<canvas id="particleCanvas" style="z-index:1"></canvas>
<canvas id="hexCanvas" style="z-index:0"></canvas>

// Jedes Canvas hat eigenen RAF-Loop
// Partikel: 60fps (durchgehend)
// Hexagons: nur bei resize neuzeichnen (statisch)
```

---

## 🌐 Integration ins DkZ™ Ökosystem

```html
<body data-dkz-module="hyperreal-demo" data-dkz-appid="DKZ-HR-001">
  <script src="../../shared/dkz-headbar.js"></script>
  <script src="../../shared/dkz-navbar.js"></script>
  <script src="../../shared/dkz-theme.css"></script>
  <!-- Hyperreal-Core inline -->
</body>
```

---

## 🎯 Qualitäts-Checkliste (erweitert)

- [ ] **Performance:** 60 FPS bei 200 Partikeln + Hexagons
- [ ] **Maus-Interaktion:** Partikel weichen aus, Nanobot zerfällt
- [ ] **Licht:** Nebula + Strahlen + Sterne vorhanden
- [ ] **Hexagons:** Aus Ecken zuspitzend, Zentrum frei
- [ ] **Nanobot:** Auflösung → Rekonstruktion in < 3s
- [ ] **Standby:** Aktiviert nach 4s, deaktiviert bei Maus
- [ ] **Explosion:** 80+ Partikel, Rotation, Verschwinden
- [ ] **Buttons:** Hover (Float) + Active (Scale) + Ripple (Click)
- [ ] **Hamburger:** Open/Close ohne Ruckeln, Hover-Shift
- [ ] **Intro:** Alle Elemente gestaffelt sichtbar
- [ ] **Icons:** SVG, alle mit `currentColor`
- [ ] **Responsive:** Buttons column bei < 600px

---

## 📂 Datei-Struktur (Standard)

```
01_PROJECTS/01_dashboard/modules/hyperreal-demo/
├── index.html              ← Alles inline (portabel!)
├── features.json           ← MOD-ID, Features, Tags
└── README.md               ← Kurzbeschreibung
```

**oder standalone:**
```
[projekt]/hyperreal/
├── index.html              ← Haupt-Datei
└── assets/
    └── icons/              ← SVGs
```

---

## 🔄 Migration Guide (Bestand -> Hyperreal)

Bestehende UI-Komponenten schrittweise aktualisieren:

1. **Phase 1:** Partikel-Hintergrund + Maus-Interaktion
2. **Phase 2:** Fotorealistische Lichteffekte (Nebula, Strahlen)
3. **Phase 3:** Buttons auf Glassmorphism + Ripple umstellen
4. **Phase 4:** Hamburger-Menü hyperreal machen
5. **Phase 5:** Nanobot + Hexagons + Explosion (wo sinnvoll)
6. **Phase 6:** Standby/AFK-Modus + Intro-Animation

---

*Standard-Vorgehen definiert am 2026-05-10 · Version 2.0*
*Erweitert um: 20 Effekte, vollständige Code-Beispiele, Physik-Parameter, Layer-Stack, Migrations-Guide*
