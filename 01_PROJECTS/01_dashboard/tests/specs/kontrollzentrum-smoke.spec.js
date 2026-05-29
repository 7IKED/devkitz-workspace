// @ts-check
import { test, expect } from '@playwright/test';

const KZ_URL = 'file:///C:/DEVKiTZ/01_PROJECTS/01_dashboard/modules/kontrollzentrum/index.html';

test.describe('Kontrollzentrum — Toast + Watchdog + LiveTicker', () => {

    test.beforeEach(async ({ page }) => {
        // Console-Errors sammeln
        page.on('console', msg => {
            if (msg.type() === 'error') {
                console.log(`[CONSOLE ERROR] ${msg.text()}`);
            }
        });
    });

    test('Seite laedt und hat Titel', async ({ page }) => {
        await page.goto(KZ_URL);
        await expect(page).toHaveTitle(/Kontrollzentrum/);
    });

    test('Ampel ist sichtbar und hat Status-Klasse', async ({ page }) => {
        await page.goto(KZ_URL);
        const ampel = page.locator('#kz-ampel');
        await expect(ampel).toBeVisible();
        // Ampel muss eine der 3 Klassen haben
        const cls = await ampel.getAttribute('class');
        expect(cls).toMatch(/green|yellow|red/);
    });

    test('Score-Metriken werden gerendert', async ({ page }) => {
        await page.goto(KZ_URL);
        // Warte bis Watchdog initialisiert (3s Delay + 1s init)
        await page.waitForTimeout(5000);

        const scoreEl = page.locator('#kz-score');
        await expect(scoreEl).toBeVisible();
        const scoreText = await scoreEl.textContent();
        // Score soll eine Zahl sein (oder "—" bei fehlender AutoHealth)
        expect(scoreText).toBeTruthy();
    });

    test('DkzToast API ist verfuegbar', async ({ page }) => {
        await page.goto(KZ_URL);
        await page.waitForTimeout(2000);

        const hasToast = await page.evaluate(() => {
            return typeof window.DkzToast === 'object'
                && typeof window.DkzToast.show === 'function'
                && typeof window.DkzToast.success === 'function'
                && typeof window.DkzToast.error === 'function'
                && typeof window.DkzToast.warn === 'function'
                && typeof window.DkzToast.info === 'function';
        });
        expect(hasToast).toBe(true);
    });

    test('DkzWatchdog API ist verfuegbar', async ({ page }) => {
        await page.goto(KZ_URL);
        await page.waitForTimeout(2000);

        const hasWD = await page.evaluate(() => {
            return typeof window.DkzWatchdog === 'object'
                && typeof window.DkzWatchdog.alert === 'function'
                && typeof window.DkzWatchdog.getAlerts === 'function'
                && typeof window.DkzWatchdog.check === 'function'
                && typeof window.DkzWatchdog.getStatus === 'function'
                && typeof window.DkzWatchdog.getStats === 'function';
        });
        expect(hasWD).toBe(true);
    });

    test('DkzTicker API ist verfuegbar', async ({ page }) => {
        await page.goto(KZ_URL);
        await page.waitForTimeout(2000);

        const hasTicker = await page.evaluate(() => {
            return typeof window.DkzTicker === 'object'
                && typeof window.DkzTicker.publish === 'function'
                && typeof window.DkzTicker.getHistory === 'function'
                && typeof window.DkzTicker.toggle === 'function';
        });
        expect(hasTicker).toBe(true);
    });

    test('Toast: success zeigt gruenen Toast', async ({ page }) => {
        await page.goto(KZ_URL);
        await page.waitForTimeout(2000);

        await page.evaluate(() => {
            window.DkzToast.success('Test Success Toast', 'playwright');
        });

        const toast = page.locator('.dkz-toast').first();
        await expect(toast).toBeVisible();
        await expect(toast).toContainText('Test Success Toast');
    });

    test('Toast: error zeigt roten Toast mit Sound', async ({ page }) => {
        await page.goto(KZ_URL);
        await page.waitForTimeout(2000);

        // AudioContext braucht User-Geste - wir testen nur das visuelle
        await page.evaluate(() => {
            window.DkzToast.error('Kritischer Fehler erkannt', 'playwright');
        });

        const toast = page.locator('.dkz-toast').first();
        await expect(toast).toBeVisible();
        await expect(toast).toContainText('Kritischer Fehler erkannt');

        // Progress Bar soll vorhanden sein
        const progress = toast.locator('.dkz-toast-progress');
        await expect(progress).toBeVisible();
    });

    test('Toast: warn zeigt gelben Toast', async ({ page }) => {
        await page.goto(KZ_URL);
        await page.waitForTimeout(2000);

        await page.evaluate(() => {
            window.DkzToast.warn('Speicher fast voll', 'playwright');
        });

        const toast = page.locator('.dkz-toast').first();
        await expect(toast).toBeVisible();
        await expect(toast).toContainText('Speicher fast voll');
    });

    test('Toast: Stacking max 5 Toasts', async ({ page }) => {
        await page.goto(KZ_URL);
        await page.waitForTimeout(2000);

        await page.evaluate(() => {
            for (var i = 0; i < 7; i++) {
                window.DkzToast.info('Toast #' + (i + 1), 'stack-test');
            }
        });

        // Max 5 sichtbar
        const count = await page.evaluate(() => window.DkzToast.count());
        expect(count).toBeLessThanOrEqual(5);
    });

    test('Toast: Click-to-dismiss', async ({ page }) => {
        await page.goto(KZ_URL);
        await page.waitForTimeout(2000);

        await page.evaluate(() => {
            window.DkzToast.info('Click me to dismiss', 'playwright');
        });

        const toast = page.locator('.dkz-toast').first();
        await expect(toast).toBeVisible();

        await toast.click();
        await page.waitForTimeout(500);

        // Nach Remove-Animation (350ms) sollte Toast weg sein
        const remaining = await page.evaluate(() => window.DkzToast.count());
        expect(remaining).toBe(0);
    });

    test('Toast: DkzToast.clear() entfernt alle Toasts', async ({ page }) => {
        await page.goto(KZ_URL);
        await page.waitForTimeout(2000);

        await page.evaluate(() => {
            window.DkzToast.info('Toast 1', 'clear-test');
            window.DkzToast.warn('Toast 2', 'clear-test');
            window.DkzToast.error('Toast 3', 'clear-test');
        });

        let count = await page.evaluate(() => window.DkzToast.count());
        expect(count).toBe(3);

        await page.evaluate(() => window.DkzToast.clear());

        count = await page.evaluate(() => window.DkzToast.count());
        expect(count).toBe(0);
    });

    test('Watchdog: manueller Alert erzeugt Toast + Feed-Eintrag', async ({ page }) => {
        await page.goto(KZ_URL);
        await page.waitForTimeout(4000);

        // Alert History leeren
        await page.evaluate(() => window.DkzWatchdog.clearAlerts());

        // Manueller Alert
        await page.evaluate(() => {
            window.DkzWatchdog.alert('error', 'Test Playwright Error', 'playwright-test', { extra: 'data' });
        });

        // Toast soll erschienen sein
        const toast = page.locator('.dkz-toast').first();
        await expect(toast).toBeVisible({ timeout: 3000 });

        // Alert im Feed pruefen
        const alerts = await page.evaluate(() => window.DkzWatchdog.getAlerts(10));
        expect(alerts.length).toBeGreaterThan(0);

        const lastAlert = alerts[alerts.length - 1];
        expect(lastAlert.severity).toBe('error');
        expect(lastAlert.message).toBe('Test Playwright Error');
        expect(lastAlert.source).toBe('playwright-test');
    });

    test('Watchdog: Deduplizierung verhindert Spam', async ({ page }) => {
        await page.goto(KZ_URL);
        await page.waitForTimeout(4000);

        await page.evaluate(() => window.DkzWatchdog.clearAlerts());

        // Gleichen Alert 3x senden
        await page.evaluate(() => {
            window.DkzWatchdog.alert('warn', 'Dedup-Test Alert', 'dedup-test');
            window.DkzWatchdog.alert('warn', 'Dedup-Test Alert', 'dedup-test');
            window.DkzWatchdog.alert('warn', 'Dedup-Test Alert', 'dedup-test');
        });

        const alerts = await page.evaluate(() => window.DkzWatchdog.getAlerts(10));
        // Alle 3 werden gespeichert, aber nur der erste hat deduplicated=false
        const nonDedup = alerts.filter(a => a.message === 'Dedup-Test Alert' && !a.deduplicated);
        const dedup = alerts.filter(a => a.message === 'Dedup-Test Alert' && a.deduplicated);
        expect(nonDedup.length).toBe(1);
        expect(dedup.length).toBe(2);
    });

    test('Watchdog: check() fuehrt Kontrollschleife manuell aus', async ({ page }) => {
        await page.goto(KZ_URL);
        await page.waitForTimeout(4000);

        const result = await page.evaluate(() => {
            var r = window.DkzWatchdog.check();
            return { health: r.status.health, checkNumber: r.status.checkNumber };
        });

        expect(result.health).toBeTruthy();
        expect(result.checkNumber).toBeGreaterThan(0);
    });

    test('Watchdog: getStats() gibt korrekte Struktur zurueck', async ({ page }) => {
        await page.goto(KZ_URL);
        await page.waitForTimeout(4000);

        const stats = await page.evaluate(() => window.DkzWatchdog.getStats());

        expect(stats).toHaveProperty('total');
        expect(stats).toHaveProperty('bySeverity');
        expect(stats).toHaveProperty('bySource');
        expect(stats).toHaveProperty('checksRun');
        expect(stats).toHaveProperty('running');
        expect(stats).toHaveProperty('interval');
        expect(stats).toHaveProperty('level');
        expect(stats.running).toBe(true);
    });

    test('Recheck Button fuehrt Kontrollschleife aus + zeigt Toast', async ({ page }) => {
        await page.goto(KZ_URL);
        await page.waitForTimeout(4000);

        await page.click('#kz-btn-check');
        await page.waitForTimeout(1000);

        // Success-Toast soll erscheinen
        const toast = page.locator('.dkz-toast');
        await expect(toast.first()).toBeVisible({ timeout: 3000 });
    });

    test('Clear Button leert Alert-History', async ({ page }) => {
        await page.goto(KZ_URL);
        await page.waitForTimeout(4000);

        // Erst Alert erzeugen
        await page.evaluate(() => {
            window.DkzWatchdog.alert('info', 'Pre-Clear Alert', 'clear-test');
        });

        // Dann Clear klicken
        await page.click('#kz-btn-clear');
        await page.waitForTimeout(500);

        const alerts = await page.evaluate(() => window.DkzWatchdog.getAlerts(100));
        expect(alerts.length).toBe(0);
    });

    test('Level-Buttons aendern Min-Level', async ({ page }) => {
        await page.goto(KZ_URL);
        await page.waitForTimeout(4000);

        // Klick auf "error" Level
        await page.click('.kz-level-btn[data-level="error"]');
        await page.waitForTimeout(500);

        const level = await page.evaluate(() => window.DkzWatchdog.getLevel());
        expect(level).toBe('error');

        // Zurueck auf "warn"
        await page.click('.kz-level-btn[data-level="warn"]');
    });

    test('LiveTicker Footer ist sichtbar', async ({ page }) => {
        await page.goto(KZ_URL);
        await page.waitForTimeout(3000);

        const ticker = page.locator('#dkz-ticker-footer');
        await expect(ticker).toBeVisible();

        // LIVE Label
        const label = page.locator('#dkz-ticker-label');
        await expect(label).toContainText('LIVE');
    });

    test('LiveTicker: publish() fuegt Event hinzu', async ({ page }) => {
        await page.goto(KZ_URL);
        await page.waitForTimeout(3000);

        await page.evaluate(() => {
            window.DkzTicker.publish('Playwright Test Event', 'system');
        });

        const history = await page.evaluate(() => window.DkzTicker.getHistory(5));
        const found = history.some(e => e.msg === 'Playwright Test Event');
        expect(found).toBe(true);
    });

    test('LiveTicker: toggle() blendet Footer ein/aus', async ({ page }) => {
        await page.goto(KZ_URL);
        await page.waitForTimeout(3000);

        // Toggle aus
        await page.evaluate(() => window.DkzTicker.toggle());
        await page.waitForTimeout(500);

        const isVisible = await page.evaluate(() => window.DkzTicker.isVisible());
        expect(isVisible).toBe(false);

        const footer = page.locator('#dkz-ticker-footer');
        await expect(footer).toHaveClass(/hidden/);

        // Toggle wieder ein
        await page.evaluate(() => window.DkzTicker.toggle());
        await page.waitForTimeout(500);

        const isVisibleAgain = await page.evaluate(() => window.DkzTicker.isVisible());
        expect(isVisibleAgain).toBe(true);
    });

    test('Keine Console Errors', async ({ page }) => {
        const errors = [];
        page.on('console', msg => {
            if (msg.type() === 'error') {
                errors.push(msg.text());
            }
        });

        await page.goto(KZ_URL);
        await page.waitForTimeout(5000);

        // Erwartete Fehler filtern (z.B. favicon 404)
        const realErrors = errors.filter(e =>
            !e.includes('favicon') &&
            !e.includes('net::ERR_FILE_NOT_FOUND') &&
            !e.includes('404')
        );
        expect(realErrors).toHaveLength(0);
    });

});

test.describe('Cross-Tab LiveTicker Sync', () => {

    test('Event in Tab A erscheint in Tab B via localStorage', async ({ browser }) => {
        const KZ = 'file:///C:/DEVKiTZ/01_PROJECTS/01_dashboard/modules/kontrollzentrum/index.html';

        // Tab A oeffnen
        const ctxA = await browser.newContext();
        const pageA = await ctxA.newPage();
        await pageA.goto(KZ);
        await pageA.waitForTimeout(3000);

        // Tab B oeffnen
        const ctxB = await browser.newContext();
        const pageB = await ctxB.newPage();
        await pageB.goto(KZ);
        await pageB.waitForTimeout(3000);

        // In Tab A ein Event publishen
        await pageA.evaluate(() => {
            window.DkzTicker.publish('Cross-Tab-Test von Tab A', 'system');
        });

        // Tab B liest localStorage
        await pageB.waitForTimeout(1000);
        const historyB = await pageB.evaluate(() => {
            // Reload feed from localStorage
            var feed = JSON.parse(localStorage.getItem('dkz-ticker-feed') || '[]');
            return feed;
        });

        const found = historyB.some(e => e.msg === 'Cross-Tab-Test von Tab A');
        expect(found).toBe(true);

        await ctxA.close();
        await ctxB.close();
    });

    test('Watchdog Alert in Tab A sichtbar in Tab B via localStorage', async ({ browser }) => {
        const KZ = 'file:///C:/DEVKiTZ/01_PROJECTS/01_dashboard/modules/kontrollzentrum/index.html';

        const ctxA = await browser.newContext();
        const pageA = await ctxA.newPage();
        await pageA.goto(KZ);
        await pageA.waitForTimeout(4000);

        const ctxB = await browser.newContext();
        const pageB = await ctxB.newPage();
        await pageB.goto(KZ);
        await pageB.waitForTimeout(4000);

        // In Tab A Alert senden
        await pageA.evaluate(() => {
            window.DkzWatchdog.clearAlerts();
            window.DkzWatchdog.alert('error', 'Cross-Tab-Watchdog-Test', 'cross-tab-test');
        });

        await pageB.waitForTimeout(1000);

        // Tab B prueft localStorage
        const alertsB = await pageB.evaluate(() => {
            var raw = localStorage.getItem('dkz-watchdog-alerts');
            return raw ? JSON.parse(raw) : [];
        });

        const found = alertsB.some(a => a.message === 'Cross-Tab-Watchdog-Test');
        expect(found).toBe(true);

        await ctxA.close();
        await ctxB.close();
    });

});
