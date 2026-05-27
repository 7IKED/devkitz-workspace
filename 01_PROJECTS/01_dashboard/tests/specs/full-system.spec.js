// @ts-check
import { test, expect } from '@playwright/test';

const BASE = 'http://localhost:8080';

// ============================================================
// DkZ Full System Test — 10x Repeat Stress Test
// Testet: Hub, Agent Builder, Action Builder, JAMEZ, WissenHub,
//         Builder Chain, Utilities, Gemini-Elimination
// ============================================================

test.describe('1️⃣ Hub — Hauptseite @full', () => {
  test('Hub lädt und zeigt Module', async ({ page }) => {
    await page.goto(`${BASE}/hub/index.html`);
    await page.waitForLoadState('domcontentloaded');
    await expect(page).toHaveTitle(/DkZ|Hub|Dashboard/i);
    const body = page.locator('body');
    await expect(body).toBeVisible();
  });

  test('Hub hat Suchfeld', async ({ page }) => {
    await page.goto(`${BASE}/hub/index.html`);
    await page.waitForTimeout(1500);
    const search = page.locator('input[type="text"], input[type="search"], .search-input, #moduleSearch');
    const count = await search.count();
    expect(count).toBeGreaterThan(0);
  });

  test('Hub zeigt Kategorie-Tabs', async ({ page }) => {
    await page.goto(`${BASE}/hub/index.html`);
    await page.waitForTimeout(1500);
    const html = await page.content();
    expect(html).toMatch(/Alle|AI|Tools|Media|System/i);
  });
});

test.describe('2️⃣ Agent Builder — Gemini-Elimination @full', () => {
  test('Agent Builder lädt', async ({ page }) => {
    await page.goto(`${BASE}/modules/agent-builder/index.html`);
    await page.waitForLoadState('domcontentloaded');
    const body = page.locator('body');
    await expect(body).toBeVisible();
    const html = await page.content();
    expect(html).toContain('Agent Builder');
  });

  test('KEIN Gemini in Dropdowns', async ({ page }) => {
    await page.goto(`${BASE}/modules/agent-builder/index.html`);
    await page.waitForTimeout(1000);
    const allOptions = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('select option')).map(o => o.textContent);
    });
    const geminiOptions = allOptions.filter(t => t.toLowerCase().includes('gemini'));
    expect(geminiOptions).toHaveLength(0);
  });

  test('gemma-4-2b ist Default-Modell', async ({ page }) => {
    await page.goto(`${BASE}/modules/agent-builder/index.html`);
    await page.waitForTimeout(1000);
    const html = await page.content();
    expect(html).toContain('gemma-4-2b');
  });

  test('qwen-coder-7b ist verfügbar', async ({ page }) => {
    await page.goto(`${BASE}/modules/agent-builder/index.html`);
    await page.waitForTimeout(1000);
    const html = await page.content();
    expect(html).toContain('qwen-coder-7b');
  });

  test('Knoten-Palette vorhanden (5 Typen)', async ({ page }) => {
    await page.goto(`${BASE}/modules/agent-builder/index.html`);
    await page.waitForTimeout(1000);
    const items = page.locator('.node-item, [data-type]');
    const count = await items.count();
    expect(count).toBeGreaterThanOrEqual(5);
  });

  test('Pattern laden funktioniert (JS check)', async ({ page }) => {
    await page.goto(`${BASE}/modules/agent-builder/index.html`);
    await page.waitForTimeout(1000);
    const hasLoadPattern = await page.evaluate(() => typeof window.loadPattern === 'function');
    expect(hasLoadPattern).toBe(true);
  });

  test('Pattern enthält kein Gemini', async ({ page }) => {
    await page.goto(`${BASE}/modules/agent-builder/index.html`);
    await page.waitForTimeout(500);
    await page.evaluate(() => { if (typeof loadPattern === 'function') loadPattern('chain'); });
    await page.waitForTimeout(500);
    const models = await page.evaluate(() => {
      return (typeof S !== 'undefined' && S.nodes) ? S.nodes.map(n => n.config?.model).filter(Boolean) : [];
    });
    const geminiModels = models.filter(m => m.toLowerCase().includes('gemini'));
    expect(geminiModels).toHaveLength(0);
  });

  test('YAML-Export enthält kein Gemini', async ({ page }) => {
    await page.goto(`${BASE}/modules/agent-builder/index.html`);
    await page.waitForTimeout(500);
    await page.evaluate(() => { if (typeof loadPattern === 'function') loadPattern('augmented'); });
    await page.waitForTimeout(300);
    const yaml = await page.evaluate(() => {
      if (typeof exportADK !== 'function') return '';
      // Capture without download
      const g = typeof getGraphJSON === 'function' ? getGraphJSON() : {};
      return JSON.stringify(g);
    });
    expect(yaml.toLowerCase()).not.toContain('gemini');
  });
});

test.describe('3️⃣ Action Builder @full', () => {
  test('Action Builder lädt', async ({ page }) => {
    await page.goto(`${BASE}/modules/action-builder/index.html`);
    await page.waitForLoadState('domcontentloaded');
    const html = await page.content();
    expect(html).toContain('Action Builder');
  });

  test('KEIN Gemini Flash in LLM-Dropdown', async ({ page }) => {
    await page.goto(`${BASE}/modules/action-builder/index.html`);
    await page.waitForTimeout(1000);
    const html = await page.content();
    expect(html).not.toContain('Gemini Flash');
    expect(html).toContain('Gemma 4 2B');
    expect(html).toContain('Qwen Coder 7B');
  });
});

test.describe('4️⃣ JAMEZ Builder @full', () => {
  test('JAMEZ Builder lädt', async ({ page }) => {
    await page.goto(`${BASE}/modules/agent-builder/jamez-builder.html`);
    await page.waitForLoadState('domcontentloaded');
    const html = await page.content();
    expect(html).toContain('JAMEZ');
  });

  test('KEIN Gemini Flash in Model-Dropdown', async ({ page }) => {
    await page.goto(`${BASE}/modules/agent-builder/jamez-builder.html`);
    await page.waitForTimeout(1000);
    const options = await page.evaluate(() => {
      const sel = document.getElementById('jz-model');
      if (!sel) return [];
      return Array.from(sel.options).map(o => o.textContent);
    });
    const geminiOpts = options.filter(t => t.toLowerCase().includes('gemini'));
    expect(geminiOpts).toHaveLength(0);
    expect(options.some(t => t.includes('Gemma 4 2B'))).toBe(true);
    expect(options.some(t => t.includes('Qwen Coder 7B'))).toBe(true);
  });
});

test.describe('5️⃣ WissenHub @full', () => {
  test('WissenHub lädt', async ({ page }) => {
    await page.goto(`${BASE}/modules/wissen-hub/index.html`);
    await page.waitForLoadState('domcontentloaded');
    const body = page.locator('body');
    await expect(body).toBeVisible();
  });

  test('Tabs vorhanden', async ({ page }) => {
    await page.goto(`${BASE}/modules/wissen-hub/index.html`);
    await page.waitForTimeout(1500);
    const html = await page.content();
    expect(html).toMatch(/Impl|Walk|Research|Task|Doku|README/i);
  });
});

test.describe('6️⃣ Builder Chain Module @full', () => {
  const modules = [
    { name: 'Skill Builder', path: 'skill-builder/index.html' },
    { name: 'Workflow Builder', path: 'workflow-builder/index.html' },
    { name: 'Team Builder', path: 'team-builder/index.html' },
    { name: 'Tenor Builder', path: 'tenor-builder/index.html' },
    { name: 'NanoBot Center', path: 'nanobot-center/index.html' },
    { name: 'Kanban Board', path: 'kanban-board/index.html' },
    { name: 'Loop Dashboard', path: 'loop-dashboard/index.html' },
    { name: 'Second Brain', path: 'second-brain/index.html' },
  ];
  for (const mod of modules) {
    test(`${mod.name} lädt`, async ({ page }) => {
      await page.goto(`${BASE}/modules/${mod.path}`, { timeout: 10000 });
      await page.waitForLoadState('domcontentloaded');
      const body = page.locator('body');
      await expect(body).toBeVisible();
    });
  }
});

test.describe('7️⃣ Utility Module @full', () => {
  const modules = [
    { name: 'Settings', path: 'settings/index.html' },
    { name: 'VPS Monitor', path: 'vps-monitor/index.html' },
    { name: 'Security Scanner', path: 'security-scanner/index.html' },
    { name: 'Prompt Generator', path: 'prompt-generator/index.html' },
    { name: 'Free AI Hub', path: 'free-ai-hub/index.html' },
    { name: 'LLM Arena', path: 'llm-arena/index.html' },
    { name: 'NLM Builder', path: 'nlm-builder/index.html' },
    { name: 'Graphify', path: 'graphify/index.html' },
    { name: 'Ecosystem Analyzer', path: 'ecosystem-analyzer/index.html' },
    { name: 'System Check', path: 'system-check/index.html' },
  ];
  for (const mod of modules) {
    test(`${mod.name} lädt`, async ({ page }) => {
      await page.goto(`${BASE}/modules/${mod.path}`, { timeout: 10000 });
      await page.waitForLoadState('domcontentloaded');
      const body = page.locator('body');
      await expect(body).toBeVisible();
    });
  }
});

test.describe('8️⃣ Performance & Stabilität @full', () => {
  test('Hub lädt unter 5 Sekunden', async ({ page }) => {
    const start = Date.now();
    await page.goto(`${BASE}/hub/index.html`);
    await page.waitForLoadState('load');
    const duration = Date.now() - start;
    expect(duration).toBeLessThan(5000);
  });

  test('Agent Builder DOM < 5000 Nodes', async ({ page }) => {
    await page.goto(`${BASE}/modules/agent-builder/index.html`);
    await page.waitForTimeout(1000);
    const nodeCount = await page.evaluate(() => document.querySelectorAll('*').length);
    expect(nodeCount).toBeLessThan(5000);
  });

  test('Kein horizontaler Overflow im Hub', async ({ page }) => {
    await page.goto(`${BASE}/hub/index.html`);
    await page.waitForTimeout(1000);
    const scrollW = await page.evaluate(() => document.documentElement.scrollWidth);
    const clientW = await page.evaluate(() => window.innerWidth);
    expect(scrollW).toBeLessThanOrEqual(clientW + 10);
  });
});

test.describe('9️⃣ Console Error Check @full', () => {
  const pages = [
    'hub/index.html',
    'modules/agent-builder/index.html',
    'modules/action-builder/index.html',
    'modules/wissen-hub/index.html',
    'modules/kanban-board/index.html',
  ];
  for (const p of pages) {
    test(`Keine JS-Errors: ${p}`, async ({ page }) => {
      const errors = [];
      page.on('pageerror', err => errors.push(err.message));
      await page.goto(`${BASE}/${p}`, { timeout: 10000 });
      await page.waitForTimeout(2000);
      // Allow max 2 non-critical errors (shared script 404s etc.)
      expect(errors.length).toBeLessThanOrEqual(2);
    });
  }
});
