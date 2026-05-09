window.renderPractice = function () {
    setTimeout(initPractice, 100);
    return `
        <div class="glass-panel slide-in">
            <h1 class="gradient-text">Practice Hub</h1>
            <p class="text-muted">Select a routine to start your daily grind.</p>
            
            <div class="grid-3" style="margin-top: 2rem;">
                <!-- Aim Training -->
                <div class="glass-panel hover-card" onclick="window.startRoutine('aim')">
                    <div class="icon-box red">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="22" y1="12" x2="18" y2="12"></line><line x1="6" y1="12" x2="2" y2="12"></line><line x1="12" y1="6" x2="12" y2="2"></line><line x1="12" y1="22" x2="12" y2="18"></line></svg>
                    </div>
                    <h3>Aim Botz Review</h3>
                    <p class="text-muted text-sm">1000 Kills challenge.</p>
                    <div class="mt-4">
                         <span class="status-indicator" style="background: rgba(239, 68, 68, 0.2); color: #ef4444; width: fit-content; padding: 0.25rem 0.5rem; font-size: 0.75rem;">15 Mins</span>
                    </div>
                </div>

                <!-- Recoil -->
                 <div class="glass-panel hover-card" onclick="window.startRoutine('recoil')">
                    <div class="icon-box blue">
                         <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>
                    </div>
                    <h3>Recoil Master</h3>
                    <p class="text-muted text-sm">Spray control for AK/M4.</p>
                    <div class="mt-4">
                         <span class="status-indicator" style="background: rgba(59, 130, 246, 0.2); color: #3b82f6; width: fit-content; padding: 0.25rem 0.5rem; font-size: 0.75rem;">10 Mins</span>
                    </div>
                </div>

                <!-- Utility -->
                 <div class="glass-panel hover-card" onclick="window.startRoutine('utility')">
                    <div class="icon-box purple">
                         <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3v-4h-3V7a2 2 0 0 1 2-2h3z"></path></svg>
                    </div>
                    <h3>Nade Lineups</h3>
                    <p class="text-muted text-sm">Review essential smokes.</p>
                    <div class="mt-4">
                         <span class="status-indicator" style="background: rgba(139, 92, 246, 0.2); color: #8b5cf6; width: fit-content; padding: 0.25rem 0.5rem; font-size: 0.75rem;">20 Mins</span>
                    </div>
                </div>
            </div>

            <!-- Active Routine View (Hidden by default) -->
            <div id="routine-view" class="glass-panel slide-in" style="display: none; margin-top: 2rem; border-color: var(--primary);">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <h2 id="routine-title">Current Routine</h2>
                    <h1 id="timer-display" style="font-family: monospace; font-size: 3rem; color: var(--primary);">00:00</h1>
                </div>
                <div class="mt-4" style="display: flex; gap: 1rem;">
                    <button id="btn-timer-toggle" class="btn btn-primary" style="width: auto;">Start Timer</button>
                    <button onclick="window.stopRoutine()" class="btn btn-outline" style="width: auto;">End Session</button>
                </div>
            </div>
        </div>
    `;
};

let timerInterval;
let secondsLeft = 0;

function initPractice() {
    window.startRoutine = (type) => {
        const view = document.getElementById('routine-view');
        const title = document.getElementById('routine-title');
        const display = document.getElementById('timer-display');

        view.style.display = 'block';
        view.scrollIntoView({ behavior: 'smooth' });

        if (type === 'aim') {
            title.textContent = 'Aim Botz Routine';
            secondsLeft = 900; // 15 min
        } else if (type === 'recoil') {
            title.textContent = 'Recoil Master Routine';
            secondsLeft = 600; // 10 min
        } else {
            title.textContent = 'Utility Practice';
            secondsLeft = 1200; // 20 min
        }

        updateDisplay(display);
        stopTimer(); // Reset if running
    };

    window.stopRoutine = () => {
        document.getElementById('routine-view').style.display = 'none';
        stopTimer();
    };

    const btnToggle = document.getElementById('btn-timer-toggle');
    if (btnToggle) {
        btnToggle.onclick = () => {
            if (timerInterval) {
                stopTimer();
                btnToggle.textContent = 'Resume Timer';
            } else {
                startTimer();
                btnToggle.textContent = 'Pause Timer';
            }
        };
    }
}

function startTimer() {
    if (timerInterval) return;
    timerInterval = setInterval(() => {
        if (secondsLeft > 0) {
            secondsLeft--;
            const display = document.getElementById('timer-display');
            if (display) updateDisplay(display);
        } else {
            stopTimer();
            alert('Routine Complete!');
        }
    }, 1000);
}

function stopTimer() {
    clearInterval(timerInterval);
    timerInterval = null;
}

function updateDisplay(element) {
    const m = Math.floor(secondsLeft / 60).toString().padStart(2, '0');
    const s = (secondsLeft % 60).toString().padStart(2, '0');
    element.textContent = `${m}:${s}`;
}
