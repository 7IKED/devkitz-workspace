# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: dashboard-smoke.spec.js >> Blog Hub — Smoke Tests @smoke >> Keine Console-Errors
- Location: specs\dashboard-smoke.spec.js:77:3

# Error details

```
Error: page.goto: net::ERR_FILE_NOT_FOUND at file:///C:/DEVKiTZ/01_PROJECTS/blog-hub/index.html
Call log:
  - navigating to "file:///C:/DEVKiTZ/01_PROJECTS/blog-hub/index.html", waiting until "load"

```

# Page snapshot

```yaml
- generic [ref=e6]:
  - heading "Zugriff auf die Datei nicht möglich" [level=1] [ref=e7]
  - paragraph [ref=e8]: Eventuell wurde sie verschoben, bearbeitet oder gelöscht.
  - generic [ref=e9]: ERR_FILE_NOT_FOUND
```

# Test source

```ts
  1   | // @ts-check
  2   | import { test, expect } from '@playwright/test';
  3   | 
  4   | const BLOG_HUB = 'file:///C:/DEVKiTZ/01_PROJECTS/blog-hub/index.html';
  5   | 
  6   | test.describe('Blog Hub — Smoke Tests @smoke', () => {
  7   | 
  8   |   // Helper: skip intro screen programmatically
  9   |   async function skipIntro(page) {
  10  |     await page.goto(BLOG_HUB);
  11  |     await page.waitForTimeout(500);
  12  |     await page.evaluate(() => {
  13  |       const intro = document.getElementById('intro');
  14  |       const app = document.getElementById('app');
  15  |       if (intro) intro.classList.add('gone');
  16  |       if (app) app.classList.add('show');
  17  |       if (typeof ContentEngine !== 'undefined') ContentEngine.init();
  18  |     });
  19  |     await page.waitForTimeout(1500);
  20  |   }
  21  | 
  22  |   test('Seite lädt und hat Titel', async ({ page }) => {
  23  |     await page.goto(BLOG_HUB);
  24  |     await expect(page).toHaveTitle(/DkZ|Blog Hub/i);
  25  |   });
  26  | 
  27  |   test('Intro-Screen ist sichtbar', async ({ page }) => {
  28  |     await page.goto(BLOG_HUB);
  29  |     const intro = page.locator('#intro');
  30  |     await expect(intro).toBeAttached();
  31  |   });
  32  | 
  33  |   test('Dashboard erscheint nach Skip-Intro', async ({ page }) => {
  34  |     await skipIntro(page);
  35  |     const app = page.locator('#app');
  36  |     await expect(app).toBeVisible();
  37  |   });
  38  | 
  39  |   test('Filter-Buttons vorhanden', async ({ page }) => {
  40  |     await skipIntro(page);
  41  |     const filters = page.locator('#filterBar button, .filter-bar .fbtn, .fbtn');
  42  |     await expect(filters.first()).toBeAttached();
  43  |   });
  44  | 
  45  |   test('Post-Cards werden gerendert', async ({ page }) => {
  46  |     await skipIntro(page);
  47  |     await page.waitForTimeout(1000);
  48  |     const cards = page.locator('.g .tile, .card, .g > div');
  49  |     const count = await cards.count();
  50  |     expect(count).toBeGreaterThan(0);
  51  |   });
  52  | 
  53  |   test('NanoBot Badge ist sichtbar', async ({ page }) => {
  54  |     await page.goto(BLOG_HUB);
  55  |     await page.waitForTimeout(2000);
  56  |     const badge = page.locator('#dkz-nanobot-badge');
  57  |     await expect(badge).toBeVisible();
  58  |   });
  59  | 
  60  |   test('Meta-Tags korrekt gesetzt', async ({ page }) => {
  61  |     await page.goto(BLOG_HUB);
  62  |     const viewport = page.locator('meta[name="viewport"]');
  63  |     await expect(viewport).toHaveCount(1);
  64  |     const desc = page.locator('meta[name="description"]');
  65  |     await expect(desc).toHaveCount(1);
  66  |     const charset = page.locator('meta[charset]');
  67  |     await expect(charset).toHaveCount(1);
  68  |   });
  69  | 
  70  |   test('Kein horizontaler Overflow', async ({ page }) => {
  71  |     await page.goto(BLOG_HUB);
  72  |     const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
  73  |     const clientWidth = await page.evaluate(() => window.innerWidth);
  74  |     expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 5);
  75  |   });
  76  | 
  77  |   test('Keine Console-Errors', async ({ page }) => {
  78  |     const errors = [];
  79  |     page.on('pageerror', err => errors.push(err.message));
> 80  |     await page.goto(BLOG_HUB);
      |                ^ Error: page.goto: net::ERR_FILE_NOT_FOUND at file:///C:/DEVKiTZ/01_PROJECTS/blog-hub/index.html
  81  |     await page.waitForTimeout(3000);
  82  |     expect(errors).toHaveLength(0);
  83  |   });
  84  | });
  85  | 
  86  | test.describe('Blog Hub — Interaktions-Tests @smoke', () => {
  87  | 
  88  |   async function skipIntro(page) {
  89  |     await page.goto(BLOG_HUB);
  90  |     await page.waitForTimeout(500);
  91  |     await page.evaluate(() => {
  92  |       const intro = document.getElementById('intro');
  93  |       const app = document.getElementById('app');
  94  |       if (intro) intro.classList.add('gone');
  95  |       if (app) app.classList.add('show');
  96  |       if (typeof ContentEngine !== 'undefined') ContentEngine.init();
  97  |     });
  98  |     await page.waitForTimeout(1500);
  99  |   }
  100 | 
  101 |   test('Filter-Button klicken filtert Cards', async ({ page }) => {
  102 |     await skipIntro(page);
  103 |     const firstFilter = page.locator('#filterBar button, .filter-bar .fbtn, .fbtn').nth(1);
  104 |     if (await firstFilter.count() > 0) {
  105 |       await firstFilter.click();
  106 |       await page.waitForTimeout(500);
  107 |     }
  108 |     const app = page.locator('#app');
  109 |     await expect(app).toBeVisible();
  110 |   });
  111 | 
  112 |   test('NanoBot öffnet Chat-Panel', async ({ page }) => {
  113 |     await page.goto(BLOG_HUB);
  114 |     await page.waitForTimeout(2000);
  115 |     await page.locator('#dkz-nanobot-badge').click();
  116 |     await page.waitForTimeout(500);
  117 |     const panel = page.locator('#dkz-nanobot-panel');
  118 |     await expect(panel).toBeVisible();
  119 |   });
  120 | 
  121 |   test('NanoBot .help Befehl funktioniert', async ({ page }) => {
  122 |     await page.goto(BLOG_HUB);
  123 |     await page.waitForTimeout(2000);
  124 |     await page.locator('#dkz-nanobot-badge').click();
  125 |     await page.waitForTimeout(500);
  126 |     await page.locator('#nb-input').fill('.help');
  127 |     await page.locator('#nb-input').press('Enter');
  128 |     await page.waitForTimeout(500);
  129 |     const msgs = page.locator('#nb-messages');
  130 |     const text = await msgs.textContent();
  131 |     expect(text).toContain('Befehle');
  132 |   });
  133 | });
  134 | 
  135 | test.describe('Blog Hub — Performance @stress', () => {
  136 | 
  137 |   test('Seite lädt unter 3 Sekunden', async ({ page }) => {
  138 |     const start = Date.now();
  139 |     await page.goto(BLOG_HUB);
  140 |     await page.waitForLoadState('load');
  141 |     const duration = Date.now() - start;
  142 |     expect(duration).toBeLessThan(3000);
  143 |   });
  144 | 
  145 |   test('DOM hat weniger als 3000 Nodes', async ({ page }) => {
  146 |     await page.goto(BLOG_HUB);
  147 |     await page.waitForTimeout(1000);
  148 |     const nodeCount = await page.evaluate(() => document.querySelectorAll('*').length);
  149 |     expect(nodeCount).toBeLessThan(3000);
  150 |   });
  151 | 
  152 |   test('Rapid-Click Stabilität (50x)', async ({ page }) => {
  153 |     await page.goto(BLOG_HUB);
  154 |     await page.waitForTimeout(1000);
  155 |     const body = page.locator('body');
  156 |     for (let i = 0; i < 50; i++) {
  157 |       await body.click({ force: true, position: { x: 100, y: 100 } }).catch(() => {});
  158 |     }
  159 |     await expect(body).toBeVisible();
  160 |   });
  161 | });
  162 | 
```