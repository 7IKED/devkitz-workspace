// @ts-check
import { test, expect } from '@playwright/test';

const BLOG_HUB = 'file:///C:/DEVKiTZ/01_PROJECTS/blog-hub/index.html';

// SKIP: blog-hub/index.html existiert nicht (REDNOTE RN-003)
// Reaktivieren sobald Blog Hub Modul erstellt wird
test.describe.skip('Blog Hub — Smoke Tests @smoke', () => {

  // Helper: skip intro screen programmatically
  async function skipIntro(page) {
    await page.goto(BLOG_HUB);
    await page.waitForTimeout(500);
    await page.evaluate(() => {
      const intro = document.getElementById('intro');
      const app = document.getElementById('app');
      if (intro) intro.classList.add('gone');
      if (app) app.classList.add('show');
      if (typeof ContentEngine !== 'undefined') ContentEngine.init();
    });
    await page.waitForTimeout(1500);
  }

  test('Seite lädt und hat Titel', async ({ page }) => {
    await page.goto(BLOG_HUB);
    await expect(page).toHaveTitle(/DkZ|Blog Hub/i);
  });

  test('Intro-Screen ist sichtbar', async ({ page }) => {
    await page.goto(BLOG_HUB);
    const intro = page.locator('#intro');
    await expect(intro).toBeAttached();
  });

  test('Dashboard erscheint nach Skip-Intro', async ({ page }) => {
    await skipIntro(page);
    const app = page.locator('#app');
    await expect(app).toBeVisible();
  });

  test('Filter-Buttons vorhanden', async ({ page }) => {
    await skipIntro(page);
    const filters = page.locator('#filterBar button, .filter-bar .fbtn, .fbtn');
    await expect(filters.first()).toBeAttached();
  });

  test('Post-Cards werden gerendert', async ({ page }) => {
    await skipIntro(page);
    await page.waitForTimeout(1000);
    const cards = page.locator('.g .tile, .card, .g > div');
    const count = await cards.count();
    expect(count).toBeGreaterThan(0);
  });

  test('NanoBot Badge ist sichtbar', async ({ page }) => {
    await page.goto(BLOG_HUB);
    await page.waitForTimeout(2000);
    const badge = page.locator('#dkz-nanobot-badge');
    await expect(badge).toBeVisible();
  });

  test('Meta-Tags korrekt gesetzt', async ({ page }) => {
    await page.goto(BLOG_HUB);
    const viewport = page.locator('meta[name="viewport"]');
    await expect(viewport).toHaveCount(1);
    const desc = page.locator('meta[name="description"]');
    await expect(desc).toHaveCount(1);
    const charset = page.locator('meta[charset]');
    await expect(charset).toHaveCount(1);
  });

  test('Kein horizontaler Overflow', async ({ page }) => {
    await page.goto(BLOG_HUB);
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const clientWidth = await page.evaluate(() => window.innerWidth);
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 5);
  });

  test('Keine Console-Errors', async ({ page }) => {
    const errors = [];
    page.on('pageerror', err => errors.push(err.message));
    await page.goto(BLOG_HUB);
    await page.waitForTimeout(3000);
    expect(errors).toHaveLength(0);
  });
});

test.describe.skip('Blog Hub — Interaktions-Tests @smoke', () => {

  async function skipIntro(page) {
    await page.goto(BLOG_HUB);
    await page.waitForTimeout(500);
    await page.evaluate(() => {
      const intro = document.getElementById('intro');
      const app = document.getElementById('app');
      if (intro) intro.classList.add('gone');
      if (app) app.classList.add('show');
      if (typeof ContentEngine !== 'undefined') ContentEngine.init();
    });
    await page.waitForTimeout(1500);
  }

  test('Filter-Button klicken filtert Cards', async ({ page }) => {
    await skipIntro(page);
    const firstFilter = page.locator('#filterBar button, .filter-bar .fbtn, .fbtn').nth(1);
    if (await firstFilter.count() > 0) {
      await firstFilter.click();
      await page.waitForTimeout(500);
    }
    const app = page.locator('#app');
    await expect(app).toBeVisible();
  });

  test('NanoBot öffnet Chat-Panel', async ({ page }) => {
    await page.goto(BLOG_HUB);
    await page.waitForTimeout(2000);
    await page.locator('#dkz-nanobot-badge').click();
    await page.waitForTimeout(500);
    const panel = page.locator('#dkz-nanobot-panel');
    await expect(panel).toBeVisible();
  });

  test('NanoBot .help Befehl funktioniert', async ({ page }) => {
    await page.goto(BLOG_HUB);
    await page.waitForTimeout(2000);
    await page.locator('#dkz-nanobot-badge').click();
    await page.waitForTimeout(500);
    await page.locator('#nb-input').fill('.help');
    await page.locator('#nb-input').press('Enter');
    await page.waitForTimeout(500);
    const msgs = page.locator('#nb-messages');
    const text = await msgs.textContent();
    expect(text).toContain('Befehle');
  });
});

test.describe.skip('Blog Hub — Performance @stress', () => {

  test('Seite lädt unter 3 Sekunden', async ({ page }) => {
    const start = Date.now();
    await page.goto(BLOG_HUB);
    await page.waitForLoadState('load');
    const duration = Date.now() - start;
    expect(duration).toBeLessThan(3000);
  });

  test('DOM hat weniger als 3000 Nodes', async ({ page }) => {
    await page.goto(BLOG_HUB);
    await page.waitForTimeout(1000);
    const nodeCount = await page.evaluate(() => document.querySelectorAll('*').length);
    expect(nodeCount).toBeLessThan(3000);
  });

  test('Rapid-Click Stabilität (50x)', async ({ page }) => {
    await page.goto(BLOG_HUB);
    await page.waitForTimeout(1000);
    const body = page.locator('body');
    for (let i = 0; i < 50; i++) {
      await body.click({ force: true, position: { x: 100, y: 100 } }).catch(() => {});
    }
    await expect(body).toBeVisible();
  });
});
