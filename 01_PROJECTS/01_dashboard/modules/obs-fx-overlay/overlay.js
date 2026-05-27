// OBS FX Particle Engine & Event Listener

const canvas = document.getElementById('fx-canvas');
const ctx = canvas.getContext('2d');

let particlesArray = [];
let particleDensity = 50;
let particleBaseColor = '#fa1e4e'; // Default DkZ Red

// Resize canvas
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// Particle Class
class Particle {
    constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.type = type; // 'heart' or 'spark'
        
        // Random velocity
        this.speedX = (Math.random() - 0.5) * 8;
        this.speedY = (Math.random() - 0.5) * 8 - 2; // slight upward bias
        
        this.size = Math.random() * 20 + 10;
        
        // Randomize the base color slightly if it's the default, or just use the chosen one
        this.color = type === 'heart' ? particleBaseColor : shadeColor(particleBaseColor, Math.random() * 40 - 20);
        this.life = 100;
        this.gravity = 0.05;
    }
    
    update() {
        this.x += this.speedX;
        this.y += this.speedY;
        this.speedY += this.gravity;
        this.life -= 1;
        this.size *= 0.98; // shrink
    }
    
    draw() {
        ctx.save();
        ctx.globalAlpha = this.life / 100;
        ctx.translate(this.x, this.y);
        
        if (this.type === 'heart') {
            ctx.fillStyle = this.color;
            ctx.shadowBlur = 15;
            ctx.shadowColor = this.color;
            ctx.font = `${this.size}px Arial`;
            ctx.fillText('❤️', 0, 0);
        } else {
            ctx.fillStyle = this.color;
            ctx.shadowBlur = 20;
            ctx.shadowColor = this.color;
            ctx.beginPath();
            ctx.arc(0, 0, this.size, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.restore();
    }
}

// Particle Engine Loop
function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    for (let i = 0; i < particlesArray.length; i++) {
        particlesArray[i].update();
        particlesArray[i].draw();
        
        if (particlesArray[i].life <= 0) {
            particlesArray.splice(i, 1);
            i--;
        }
    }
    requestAnimationFrame(animate);
}
animate();

// Trigger effects
function spawnParticles(type, count) {
    const startX = canvas.width / 2;
    const startY = canvas.height / 2 + 100; // slightly lower
    
    for (let i = 0; i < count; i++) {
        particlesArray.push(new Particle(startX, startY, type));
    }
}

function showAlert(text, icon, isHype = false) {
    const container = document.getElementById('alert-container');
    const alertBox = document.createElement('div');
    alertBox.className = 'alert-box' + (isHype ? ' hype' : '');
    alertBox.innerHTML = `<span class="icon">${icon}</span> <span>${text}</span>`;
    
    container.appendChild(alertBox);
    
    // Remove after animation (4.5s)
    setTimeout(() => {
        alertBox.remove();
    }, 4500);
}

// Listen to LocalStorage Events from Control Panel
window.addEventListener('storage', (e) => {
    if (e.key === 'dkz_obs_fx_event') {
        const event = JSON.parse(e.newValue);
        if (!event) return;
        
        switch (event.type) {
            case 'liebe':
                spawnParticles('heart', particleDensity);
                showAlert('Liebe geht raus!', '❤️');
                break;
            case 'danke':
                spawnParticles('spark', particleDensity * 2);
                showAlert('Danke, ich liebe euch!', '✨');
                break;
            case 'hype':
                spawnParticles('spark', particleDensity * 3);
                spawnParticles('heart', particleDensity);
                showAlert('HYPE MODE AKTIV', '🔥', true);
                break;
            case 'scene':
                const matrix = document.getElementById('hexagon-matrix');
                matrix.classList.add('active');
                setTimeout(() => matrix.classList.remove('active'), 3000);
                break;
        }
    }
    
    if (e.key === 'dkz_obs_fx_settings') {
        const settings = JSON.parse(e.newValue);
        if (!settings) return;
        
        // Update background
        const body = document.getElementById('overlay-body');
        if (settings.bgMode === 'neon-green') {
            body.classList.remove('bg-transparent');
            body.classList.add('bg-neon-green');
        } else {
            body.classList.add('bg-transparent');
            body.classList.remove('bg-neon-green');
        }
        
        // Update density
        particleDensity = parseInt(settings.particleDensity);
        
        // Update colors
        if (settings.particleColor) {
            particleBaseColor = settings.particleColor;
        }
        if (settings.hexColor) {
            document.documentElement.style.setProperty('--hex-color', settings.hexColor);
        }
    }
});

// Helper for color variation
function shadeColor(color, percent) {
    var R = parseInt(color.substring(1,3),16);
    var G = parseInt(color.substring(3,5),16);
    var B = parseInt(color.substring(5,7),16);

    R = parseInt(R * (100 + percent) / 100);
    G = parseInt(G * (100 + percent) / 100);
    B = parseInt(B * (100 + percent) / 100);

    R = (R<255)?R:255;  
    G = (G<255)?G:255;  
    B = (B<255)?B:255;  

    var RR = ((R.toString(16).length==1)?"0"+R.toString(16):R.toString(16));
    var GG = ((G.toString(16).length==1)?"0"+G.toString(16):G.toString(16));
    var BB = ((B.toString(16).length==1)?"0"+B.toString(16):B.toString(16));

    return "#"+RR+GG+BB;
}

console.log("OBS FX Engine started. Waiting for events...");
