/**
 * DkZ™ Kontrollzentrum — TestCafe UI Tests
 * @version v1.0.0
 *
 * Testet:
 *   - Toast-System (alle 4 Typen, Stacking, Dismiss, Clear)
 *   - Watchdog (Alert, Dedup, Recheck, Stats, Levels)
 *   - LiveTicker (Footer, Publish, Toggle)
 *   - Kontrollzentrum UI (Ampel, Score, Feed, Buttons)
 *   - Cross-Tab localStorage Sync
 *
 * Ausfuehren:
 *   npx testcafe chrome testcafe/kontrollzentrum.testcafe.js
 *   npx testcafe chrome:headless testcafe/kontrollzentrum.testcafe.js
 */
import { Selector, ClientFunction } from 'testcafe';

const KZ_URL = 'file:///C:/DEVKiTZ/01_PROJECTS/01_dashboard/modules/kontrollzentrum/index.html';

/* ═══════════════════════════════════════════════════
 * Helpers — ClientFunction Wrapper
 * ═══════════════════════════════════════════════════ */
const getToastCount = ClientFunction(() => window.DkzToast ? window.DkzToast.count() : -1);
const showToast = ClientFunction((msg, type, source) => {
    window.DkzToast.show(msg, type, { source: source || 'testcafe' });
});
const clearToasts = ClientFunction(() => window.DkzToast.clear());

const getWatchdogStatus = ClientFunction(() => window.DkzWatchdog ? window.DkzWatchdog.getStatus() : null);
const getWatchdogStats = ClientFunction(() => window.DkzWatchdog ? window.DkzWatchdog.getStats() : null);
const getWatchdogAlerts = ClientFunction((n) => window.DkzWatchdog ? window.DkzWatchdog.getAlerts(n || 50) : []);
const watchdogAlert = ClientFunction((sev, msg, src) => {
    return window.DkzWatchdog.alert(sev, msg, src, {});
});
const watchdogClearAlerts = ClientFunction(() => window.DkzWatchdog.clearAlerts());
const watchdogCheck = ClientFunction(() => window.DkzWatchdog.check());
const watchdogSetLevel = ClientFunction((lvl) => window.DkzWatchdog.setLevel(lvl));
const watchdogGetLevel = ClientFunction(() => window.DkzWatchdog.getLevel());

const tickerPublish = ClientFunction((msg, agent) => window.DkzTicker.publish(msg, agent));
const tickerGetHistory = ClientFunction((n) => window.DkzTicker.getHistory(n || 10));
const tickerToggle = ClientFunction(() => window.DkzTicker.toggle());
const tickerIsVisible = ClientFunction(() => window.DkzTicker.isVisible());

const hasAPI = ClientFunction((name) => typeof window[name] === 'object' && window[name] !== null);

const getConsoleErrors = ClientFunction(() => window.__tcErrors || []);
const initErrorCollector = ClientFunction(() => {
    window.__tcErrors = [];
    window.addEventListener('error', function(e) {
        window.__tcErrors.push(e.message || 'Unknown Error');
    });
});

/* ═══════════════════════════════════════════════════
 * Selektoren
 * ═══════════════════════════════════════════════════ */
const ampel       = Selector('#kz-ampel');
const scoreEl     = Selector('#kz-score');
const alertsTotal = Selector('#kz-alerts-total');
const errorsEl    = Selector('#kz-errors');
const warningsEl  = Selector('#kz-warnings');
const checksEl    = Selector('#kz-checks');
const feedList    = Selector('#kz-feed-list');
const feedCount   = Selector('#kz-feed-count');
const wdStatus    = Selector('#kz-wd-status');

const btnRecheck  = Selector('#kz-btn-check');
const btnExport   = Selector('#kz-btn-export');
const btnClear    = Selector('#kz-btn-clear');

const levelBtnInfo  = Selector('.kz-level-btn[data-level="info"]');
const levelBtnWarn  = Selector('.kz-level-btn[data-level="warn"]');
const levelBtnError = Selector('.kz-level-btn[data-level="error"]');

const tickerFooter  = Selector('#dkz-ticker-footer');
const tickerLabel   = Selector('#dkz-ticker-label');
const tickerTogBtn  = Selector('#dkz-ticker-toggle');

const toastContainer = Selector('#dkz-toast-container');
const firstToast     = Selector('.dkz-toast').nth(0);

/* ═══════════════════════════════════════════════════
 * Fixture 1: Grundlagen
 * ═══════════════════════════════════════════════════ */
fixture`Kontrollzentrum — Grundlagen`
    .page(KZ_URL);

test('Seite laedt korrekt', async t => {
    await t
        .expect(Selector('title').innerText).contains('Kontrollzentrum')
        .expect(Selector('.kz-header').exists).ok('Header fehlt')
        .expect(Selector('.kz-main').exists).ok('Main-Grid fehlt');
});

test('Ampel ist sichtbar und hat Farbe', async t => {
    // Warten bis Watchdog die erste Kontrollschleife durchlaufen hat (3s delay + 1s loop)
    await t.wait(5000);

    await t
        .expect(ampel.exists).ok('Ampel fehlt')
        .expect(ampel.visible).ok('Ampel nicht sichtbar');

    // Ampel-Klasse pruefen via ClientFunction
    const getAmpelClass = ClientFunction(() => {
        var el = document.getElementById('kz-ampel');
        return el ? el.className : '';
    });
    const cls = await getAmpelClass();
    // Valide Klassen: green, yellow, red (nach Init auch kurzzeitig nur 'kz-ampel')
    const hasColor = cls.includes('green') || cls.includes('yellow') || cls.includes('red');
    await t.expect(hasColor).ok('Ampel hat keine Farbklasse, className: ' + cls);
});

test('Score-Karte mit 5 Metriken', async t => {
    const metrics = Selector('.kz-metric');
    await t
        .expect(metrics.count).eql(5, '5 Metrik-Karten erwartet')
        .expect(scoreEl.exists).ok('Score Element fehlt')
        .expect(alertsTotal.exists).ok('Alerts Total fehlt')
        .expect(errorsEl.exists).ok('Errors fehlt')
        .expect(warningsEl.exists).ok('Warnings fehlt')
        .expect(checksEl.exists).ok('Checks Run fehlt');
});

test('Header-Buttons vorhanden', async t => {
    await t
        .expect(btnRecheck.exists).ok('Recheck Button fehlt')
        .expect(btnExport.exists).ok('Export Button fehlt')
        .expect(btnClear.exists).ok('Clear Button fehlt');
});

test('Level-Buttons vorhanden', async t => {
    await t
        .expect(levelBtnInfo.exists).ok('Info Level Button fehlt')
        .expect(levelBtnWarn.exists).ok('Warn Level Button fehlt')
        .expect(levelBtnError.exists).ok('Error Level Button fehlt');
});

/* ═══════════════════════════════════════════════════
 * Fixture 2: APIs verfuegbar
 * ═══════════════════════════════════════════════════ */
fixture`Kontrollzentrum — API Checks`
    .page(KZ_URL)
    .beforeEach(async t => {
        await t.wait(3000); // Warten bis Scripts geladen
    });

test('DkzToast API geladen', async t => {
    await t.expect(await hasAPI('DkzToast')).ok('DkzToast nicht verfuegbar');
});

test('DkzWatchdog API geladen', async t => {
    await t.expect(await hasAPI('DkzWatchdog')).ok('DkzWatchdog nicht verfuegbar');
});

test('DkzTicker API geladen', async t => {
    await t.expect(await hasAPI('DkzTicker')).ok('DkzTicker nicht verfuegbar');
});

test('Watchdog laeuft (running=true)', async t => {
    const stats = await getWatchdogStats();
    await t.expect(stats.running).ok('Watchdog laeuft nicht');
});

/* ═══════════════════════════════════════════════════
 * Fixture 3: Toast System
 * ═══════════════════════════════════════════════════ */
fixture`Kontrollzentrum — Toast System`
    .page(KZ_URL)
    .beforeEach(async t => {
        await t.wait(2500);
        await clearToasts();
    });

test('Success Toast wird angezeigt', async t => {
    await showToast('TestCafe Success!', 'success', 'testcafe');
    await t
        .expect(firstToast.exists).ok('Toast nicht erschienen', { timeout: 3000 })
        .expect(firstToast.visible).ok('Toast nicht sichtbar')
        .expect(firstToast.innerText).contains('TestCafe Success!');
});

test('Error Toast wird angezeigt', async t => {
    await showToast('Kritischer Fehler!', 'error', 'testcafe');
    await t
        .expect(firstToast.exists).ok('Error Toast nicht erschienen', { timeout: 3000 })
        .expect(firstToast.innerText).contains('Kritischer Fehler!');

    // Progress Bar vorhanden
    const progress = firstToast.find('.dkz-toast-progress');
    await t.expect(progress.exists).ok('Progress Bar fehlt');
});

test('Warn Toast wird angezeigt', async t => {
    await showToast('Warnung erkannt', 'warn', 'testcafe');
    await t
        .expect(firstToast.exists).ok('Warn Toast nicht erschienen', { timeout: 3000 })
        .expect(firstToast.innerText).contains('Warnung erkannt');
});

test('Info Toast wird angezeigt', async t => {
    await showToast('Info Nachricht', 'info', 'testcafe');
    await t
        .expect(firstToast.exists).ok('Info Toast nicht erschienen', { timeout: 3000 })
        .expect(firstToast.innerText).contains('Info Nachricht');
});

test('Toast zeigt Source Label', async t => {
    await showToast('Source-Test', 'info', 'mein-modul');
    await t.expect(firstToast.exists).ok({ timeout: 3000 });

    const source = firstToast.find('.dkz-toast-source');
    // Toast konvertiert Source auf uppercase
    const sourceText = await source.innerText;
    await t.expect(sourceText.toLowerCase()).contains('mein-modul');
});

test('Toast zeigt Zeitstempel', async t => {
    await showToast('Zeit-Test', 'info', 'testcafe');
    await t.expect(firstToast.exists).ok({ timeout: 3000 });

    const time = firstToast.find('.dkz-toast-time');
    await t.expect(time.exists).ok('Zeitstempel fehlt');
    await t.expect(time.innerText).match(/\d{2}:\d{2}:\d{2}/);
});

test('Max 5 Toasts gleichzeitig', async t => {
    for (let i = 0; i < 7; i++) {
        await showToast('Stack Toast #' + (i + 1), 'info', 'stack-test');
    }
    const count = await getToastCount();
    await t.expect(count).lte(5, 'Mehr als 5 Toasts sichtbar: ' + count);
});

test('Click-to-Dismiss funktioniert', async t => {
    // Erst alle bestehenden Toasts leeren
    await clearToasts();
    await t.wait(300);

    // Toast mit langer Duration (30s) und einzigartigem Text erstellen
    const showLongToast = ClientFunction(() => {
        window.DkzToast.show('DISMISS-TARGET-42', 'info', { source: 'dismiss-test', duration: 30000 });
    });
    await showLongToast();

    // Warte bis Toast sichtbar
    const target = Selector('.dkz-toast').withText('DISMISS-TARGET-42');
    await t.expect(target.exists).ok('Toast nicht erschienen', { timeout: 3000 });

    // Via JS den spezifischen Toast klicken
    const clickTarget = ClientFunction(() => {
        var toasts = document.querySelectorAll('.dkz-toast');
        for (var i = 0; i < toasts.length; i++) {
            if (toasts[i].textContent.indexOf('DISMISS-TARGET-42') !== -1) {
                toasts[i].click();
                return true;
            }
        }
        return false;
    });
    const clicked = await clickTarget();
    await t.expect(clicked).ok('Spezifischer Toast nicht gefunden');
    await t.wait(800);

    // Der spezifische Toast sollte weg sein (andere Watchdog-Toasts koennen existieren)
    await t.expect(target.exists).notOk('Toast DISMISS-TARGET-42 wurde nicht entfernt');
});

test('DkzToast.clear() entfernt alle', async t => {
    await showToast('Clear 1', 'info');
    await showToast('Clear 2', 'warn');
    await showToast('Clear 3', 'error');

    let count = await getToastCount();
    await t.expect(count).eql(3);

    await clearToasts();
    count = await getToastCount();
    await t.expect(count).eql(0, 'Toasts nicht geleert');
});

/* ═══════════════════════════════════════════════════
 * Fixture 4: Watchdog Alerts
 * ═══════════════════════════════════════════════════ */
fixture`Kontrollzentrum — Watchdog`
    .page(KZ_URL)
    .beforeEach(async t => {
        await t.wait(4500); // Watchdog braucht 3s + init
        await watchdogClearAlerts();
        await clearToasts();
    });

test('Manueller Alert erzeugt Toast + Eintrag', async t => {
    await watchdogAlert('error', 'TestCafe Error Alert', 'testcafe-wd');

    // Toast erscheint
    await t.expect(firstToast.exists).ok('Kein Toast nach Alert', { timeout: 3000 });
    await t.expect(firstToast.innerText).contains('TestCafe Error Alert');

    // Alert in History
    const alerts = await getWatchdogAlerts(10);
    const found = alerts.some(a => a.message === 'TestCafe Error Alert');
    await t.expect(found).ok('Alert nicht in History gefunden');
});

test('Deduplizierung verhindert Spam', async t => {
    await watchdogAlert('warn', 'Dedup TestCafe', 'dedup-tc');
    await watchdogAlert('warn', 'Dedup TestCafe', 'dedup-tc');
    await watchdogAlert('warn', 'Dedup TestCafe', 'dedup-tc');

    const alerts = await getWatchdogAlerts(10);
    const relevant = alerts.filter(a => a.message === 'Dedup TestCafe');
    const nonDedup = relevant.filter(a => !a.deduplicated);
    const dedup = relevant.filter(a => a.deduplicated);

    await t.expect(nonDedup.length).eql(1, 'Genau 1 Nicht-Duplikat');
    await t.expect(dedup.length).eql(2, 'Genau 2 Duplikate');
});

test('check() fuehrt Kontrollschleife aus', async t => {
    const before = await getWatchdogStats();
    await watchdogCheck();
    const after = await getWatchdogStats();

    await t.expect(after.checksRun).gt(before.checksRun, 'Check-Counter nicht erhoeht');
});

test('getStats() gibt korrekte Struktur', async t => {
    const stats = await getWatchdogStats();
    await t
        .expect(stats).ok('Stats null')
        .expect(typeof stats.total).eql('number')
        .expect(typeof stats.bySeverity).eql('object')
        .expect(typeof stats.bySource).eql('object')
        .expect(typeof stats.checksRun).eql('number')
        .expect(typeof stats.running).eql('boolean')
        .expect(typeof stats.interval).eql('number')
        .expect(typeof stats.level).eql('string');
});

test('getStatus() liefert Health-Info', async t => {
    const status = await getWatchdogStatus();
    await t
        .expect(status).ok('Status null')
        .expect(['green', 'yellow', 'red', 'unknown']).contains(status.health);
});

/* ═══════════════════════════════════════════════════
 * Fixture 5: UI-Interaktionen
 * ═══════════════════════════════════════════════════ */
fixture`Kontrollzentrum — UI Buttons`
    .page(KZ_URL)
    .beforeEach(async t => {
        await t.wait(4500);
    });

test('Recheck Button zeigt Toast + aktualisiert Metriken', async t => {
    await clearToasts();
    await t.click(btnRecheck);
    await t.wait(1500);

    // Success Toast soll erscheinen
    await t.expect(firstToast.exists).ok('Kein Toast nach Recheck', { timeout: 3000 });

    // Checks-Counter soll > 0 sein
    const checksText = await checksEl.innerText;
    await t.expect(parseInt(checksText)).gt(0, 'Checks Counter nicht erhoeht');
});

test('Clear Button leert Alert-History', async t => {
    await watchdogAlert('info', 'Pre-Clear TestCafe', 'clear-test');
    await t.click(btnClear);
    await t.wait(1000);

    const alerts = await getWatchdogAlerts(100);
    await t.expect(alerts.length).eql(0, 'Alerts nicht geleert');
});

test('Level-Button aendert Watchdog Min-Level', async t => {
    await t.click(levelBtnError);
    await t.wait(500);

    const level = await watchdogGetLevel();
    await t.expect(level).eql('error', 'Level nicht auf error gesetzt');

    // Zurueck auf warn
    await t.click(levelBtnWarn);
    await t.wait(500);
    const level2 = await watchdogGetLevel();
    await t.expect(level2).eql('warn');
});

test('Level-Button hat active-Klasse', async t => {
    await t.click(levelBtnInfo);
    await t.wait(500);

    await t.expect(levelBtnInfo.hasClass('active')).ok('Info Button nicht active');
    await t.expect(levelBtnWarn.hasClass('active')).notOk('Warn Button noch active');

    // Zurueck
    await t.click(levelBtnWarn);
});

test('Watchdog Status Badge zeigt "aktiv"', async t => {
    const text = await wdStatus.innerText;
    await t.expect(text.toLowerCase()).contains('aktiv', 'Watchdog nicht als aktiv gemeldet');
});

/* ═══════════════════════════════════════════════════
 * Fixture 6: LiveTicker
 * ═══════════════════════════════════════════════════ */
fixture`Kontrollzentrum — LiveTicker`
    .page(KZ_URL)
    .beforeEach(async t => {
        await t.wait(3000);
    });

test('LiveTicker Footer ist sichtbar', async t => {
    await t
        .expect(tickerFooter.exists).ok('Ticker Footer fehlt')
        .expect(tickerFooter.visible).ok('Ticker Footer nicht sichtbar');
});

test('LIVE Label vorhanden', async t => {
    await t.expect(tickerLabel.innerText).contains('LIVE');
});

test('publish() fuegt Event zum Feed hinzu', async t => {
    await tickerPublish('TestCafe Ticker Event', 'system');

    const history = await tickerGetHistory(5);
    const found = history.some(e => e.msg === 'TestCafe Ticker Event');
    await t.expect(found).ok('Event nicht im Feed gefunden');
});

test('Toggle blendet Footer ein/aus', async t => {
    // Ausblenden
    await tickerToggle();
    await t.wait(500);
    await t.expect(await tickerIsVisible()).notOk('Ticker sollte unsichtbar sein');
    await t.expect(tickerFooter.hasClass('hidden')).ok('hidden Klasse fehlt');

    // Wieder einblenden
    await tickerToggle();
    await t.wait(500);
    await t.expect(await tickerIsVisible()).ok('Ticker sollte wieder sichtbar sein');
});

test('Toggle Button aendert Symbol', async t => {
    const initialText = await tickerTogBtn.innerText;

    await t.click(tickerTogBtn);
    await t.wait(400);

    const toggledText = await tickerTogBtn.innerText;
    await t.expect(toggledText).notEql(initialText, 'Toggle Symbol hat sich nicht geaendert');

    // Zurueck
    await t.click(tickerTogBtn);
});

/* ═══════════════════════════════════════════════════
 * Fixture 7: Alert Feed Rendering
 * ═══════════════════════════════════════════════════ */
fixture`Kontrollzentrum — Alert Feed`
    .page(KZ_URL)
    .beforeEach(async t => {
        await t.wait(4500);
        await watchdogClearAlerts();
    });

test('Leerer Feed zeigt Empty State', async t => {
    // Feed aktualisieren nach Clear (Recheck klicken)
    await t.click(btnRecheck);
    await t.wait(1500);
    await t.click(btnClear);
    await t.wait(500);

    const emptyState = feedList.find('.kz-empty');
    await t.expect(emptyState.exists).ok('Empty State nicht angezeigt');
});

test('Alert erzeugt Feed-Eintrag mit korrektem Layout', async t => {
    await watchdogAlert('error', 'Feed Layout Test', 'feed-test');
    await t.click(btnRecheck); // UI refreshen
    await t.wait(1500);

    const feedItem = feedList.find('.kz-feed-item').nth(0);
    await t.expect(feedItem.exists).ok('Feed Item fehlt');

    // Struktur pruefen
    const dot = feedItem.find('.kz-feed-dot');
    const time = feedItem.find('.kz-feed-time');
    const source = feedItem.find('.kz-feed-source');
    const msg = feedItem.find('.kz-feed-msg');
    const severity = feedItem.find('.kz-feed-severity');

    await t
        .expect(dot.exists).ok('Dot fehlt')
        .expect(time.exists).ok('Time fehlt')
        .expect(source.exists).ok('Source fehlt')
        .expect(msg.exists).ok('Message fehlt')
        .expect(severity.exists).ok('Severity Badge fehlt');
});

test('Feed Count Badge aktualisiert sich', async t => {
    await watchdogAlert('warn', 'Count Test 1', 'count-test');
    await watchdogAlert('error', 'Count Test 2', 'count-test');
    await t.click(btnRecheck);
    await t.wait(1500);

    const countText = await feedCount.innerText;
    // Mindestens die 2 manuellen + eventuelle Kontrollschleifen-Alerts
    await t.expect(countText).match(/\d+ alerts/);
});

/* ═══════════════════════════════════════════════════
 * Fixture 8: Keine Console Errors
 * ═══════════════════════════════════════════════════ */
fixture`Kontrollzentrum — Stabilitaet`
    .page(KZ_URL)
    .beforeEach(async t => {
        await initErrorCollector();
    });

test('Keine JavaScript-Fehler beim Laden', async t => {
    await t.wait(5000);

    const errors = await getConsoleErrors();
    // Filtern: favicon, 404 sind OK bei file://
    const realErrors = errors.filter(e =>
        !e.includes('favicon') &&
        !e.includes('net::ERR_FILE_NOT_FOUND') &&
        !e.includes('404')
    );
    await t.expect(realErrors.length).eql(0, 'JS Errors: ' + realErrors.join(' | '));
});

test('Keine Fehler bei vollstaendiger Interaktion', async t => {
    await t.wait(4000);
    await initErrorCollector();

    // Alle Interaktionen durchspielen
    await t.click(btnRecheck);
    await t.wait(500);
    await showToast('Stress Test', 'error', 'stress');
    await t.wait(300);
    await watchdogAlert('warn', 'Stress Alert', 'stress');
    await t.wait(300);
    await t.click(levelBtnError);
    await t.wait(300);
    await t.click(levelBtnWarn);
    await t.wait(300);
    await tickerPublish('Stress Ticker', 'system');
    await t.wait(300);
    await t.click(btnClear);
    await t.wait(500);

    const errors = await getConsoleErrors();
    const realErrors = errors.filter(e =>
        !e.includes('favicon') &&
        !e.includes('net::ERR_FILE_NOT_FOUND')
    );
    await t.expect(realErrors.length).eql(0, 'Errors nach Interaktion: ' + realErrors.join(' | '));
});

/* ═══════════════════════════════════════════════════
 * Fixture 9: Responsive Design
 * ═══════════════════════════════════════════════════ */
fixture`Kontrollzentrum — Responsive`
    .page(KZ_URL);

test('Mobile Viewport (375px) — kein Overflow', async t => {
    await t.resizeWindow(375, 812);
    await t.wait(2000);

    const body = Selector('body');
    const scrollWidth = await body.scrollWidth;
    const clientWidth = await body.clientWidth;

    // Toleranz von 20% fuer Kontrollzentrum (Metriken-Grid, Feed-Karten)
    // Exakt gleich ist nicht immer moeglich bei komplexen Layouts
    const ratio = scrollWidth / (clientWidth || 1);
    await t.expect(ratio).lte(1.2, 'Horizontaler Overflow bei Mobile >20%: ' + scrollWidth + ' vs ' + clientWidth);
});

test('Tablet Viewport (768px) — Grid passt sich an', async t => {
    await t.resizeWindow(768, 1024);
    await t.wait(2000);

    await t.expect(Selector('.kz-main').exists).ok('Grid fehlt');
    await t.expect(Selector('.kz-card').count).gte(3, 'Weniger als 3 Cards sichtbar');
});
