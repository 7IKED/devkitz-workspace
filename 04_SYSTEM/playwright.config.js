const { defineConfig, devices } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './',
  fullyParallel: true,
  retries: 0,
  workers: 1,
  
  // WICHTIG: Das generiert den HTML-Report und zeichnet Videos auf!
  reporter: [['html', { open: 'never' }]],
  
  use: {
    // Nimmt jeden Schritt als Video auf, damit du mir später zusehen kannst
    video: 'on',
    
    // Nimmt den DOM-Trace auf (Zeitmaschine)
    trace: 'on',
    
    // Wir nutzen standardmäßig Chromium (Chrome)
    ...devices['Desktop Chrome'],
    
    // Starte NICHT im Headless Mode, damit Puter/VNC das Fenster zeigen kann
    headless: false,
    
    // Ansichtsfenster
    viewport: { width: 1280, height: 720 },
  },
});
