/* ═══════════════════════════════════════════════ */
/* WISPE™ — Main App Controller                   */
/* ═══════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {
    // ─── Init Modules ───
    CanvasBG.init();
    QRSync.init();
    DeviceManager.init();
    SetupPanel.init();
    ConsoleBar.init();
    initMicButton();
    initRulesPanel();
    initChips();
    initKeyboardShortcuts();

    // ─── Mic Button ───
    function initMicButton() {
        const micBtn = document.getElementById('micBtn');
        const micContainer = document.getElementById('micContainer');
        const micIcon = document.getElementById('micIcon');
        const stopIcon = document.getElementById('stopIcon');
        const statusLabel = document.getElementById('statusLabel');
        const recordTimer = document.getElementById('recordTimer');
        const categoryChips = document.getElementById('categoryChips');
        const audioBars = document.getElementById('audioBars');

        if (!micBtn) return;

        let animFrame = null;

        micBtn.addEventListener('click', async () => {
            if (MicEngine.isRecording) {
                // Stop
                const blob = await MicEngine.stopRecording();
                micBtn.classList.remove('recording');
                micContainer.classList.remove('recording-active');
                micIcon.classList.remove('hidden');
                stopIcon.classList.add('hidden');
                statusLabel.textContent = 'Bereit zum Aufnehmen';
                statusLabel.classList.remove('recording');
                recordTimer.classList.add('hidden');
                categoryChips.classList.add('hidden');
                audioBars.classList.remove('active');
                cancelAnimationFrame(animFrame);

                if (blob) {
                    // Simulate nanobot classification
                    const category = Nanobot.classify('Beispiel Notiz Text...');
                    Nanobot.updateUI(category);
                    statusLabel.textContent = `✓ Gespeichert als ${Nanobot.getCategoryInfo(category).label}`;
                    setTimeout(() => {
                        statusLabel.textContent = 'Bereit zum Aufnehmen';
                        document.querySelector('.cat-dot')?.classList.remove('active');
                        document.getElementById('categoryText').textContent = 'Nanobot wartet...';
                    }, 3000);
                }
            } else {
                // Start
                const micOK = await MicEngine.requestMic(MicEngine.selectedDeviceId);
                if (!micOK) {
                    statusLabel.textContent = '⚠ Mikrofon nicht erlaubt';
                    statusLabel.classList.add('recording');
                    setTimeout(() => {
                        statusLabel.textContent = 'Bereit zum Aufnehmen';
                        statusLabel.classList.remove('recording');
                    }, 2000);
                    return;
                }

                // Try auto-select Bluetooth
                await DeviceManager.enumerate();
                DeviceManager.autoSelectBluetooth();

                const started = MicEngine.startRecording();
                if (started) {
                    micBtn.classList.add('recording');
                    micContainer.classList.add('recording-active');
                    micIcon.classList.add('hidden');
                    stopIcon.classList.remove('hidden');
                    statusLabel.textContent = 'Aufnahme läuft...';
                    statusLabel.classList.add('recording');
                    recordTimer.classList.remove('hidden');
                    categoryChips.classList.remove('hidden');
                    audioBars.classList.add('active');

                    // Animate audio bars
                    function updateBars() {
                        const freq = MicEngine.getFrequencyData();
                        const bars = audioBars.querySelectorAll('span');
                        const step = Math.floor(freq.length / bars.length);
                        bars.forEach((bar, i) => {
                            const val = freq[i * step] || 0;
                            const h = Math.max(4, (val / 255) * 28);
                            bar.style.height = h + 'px';
                            bar.style.opacity = Math.max(0.3, val / 255);
                        });
                        animFrame = requestAnimationFrame(updateBars);
                    }
                    updateBars();
                }
            }
        });
    }

    // ─── Rules Panel ───
    function initRulesPanel() {
        const btnRules = document.getElementById('btnRules');
        const rulesPanel = document.getElementById('rulesPanel');
        const rulesClose = document.getElementById('rulesClose');

        if (btnRules) btnRules.addEventListener('click', () => {
            rulesPanel?.classList.remove('hidden');
        });
        if (rulesClose) rulesClose.addEventListener('click', () => {
            rulesPanel?.classList.add('hidden');
        });
        if (rulesPanel) rulesPanel.addEventListener('click', (e) => {
            if (e.target === rulesPanel) rulesPanel.classList.add('hidden');
        });
    }

    // ─── Category Chips ───
    function initChips() {
        document.querySelectorAll('.chip').forEach(chip => {
            chip.addEventListener('click', () => {
                document.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
                chip.classList.add('active');
                const cat = chip.dataset.cat;
                Nanobot.updateUI(cat);
            });
        });
    }

    // ─── Keyboard Shortcuts ───
    function initKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Don't trigger if typing in an input
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

            // Space — toggle recording
            if (e.code === 'Space' && !ConsoleBar.isOpen) {
                e.preventDefault();
                document.getElementById('micBtn')?.click();
            }

            // 1-4 — category switch
            if (['1', '2', '3', '4'].includes(e.key) && !ConsoleBar.isOpen) {
                const chips = document.querySelectorAll('.chip');
                const idx = parseInt(e.key) - 1;
                if (chips[idx]) chips[idx].click();
            }
        });
    }
});
