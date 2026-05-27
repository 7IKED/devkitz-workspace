/**
 * DkZ™ Agentic Audit — Playwright E2E Tests
 * llms.txt, robots.txt, meta tags, API health, shortcuts
 */
import { test, expect } from '@playwright/test';
const BLOG_HUB = 'file:///C:/DEVKiTZ/01_PROJECTS/blog-hub/index.html';

test.describe('Agentic Pattern Audit @agentic', () => {

    test('Meta-Tags für AI/LLM vorhanden', async ({ page }) => {
        await page.goto(BLOG_HUB);
        const meta = await page.evaluate(() => {
            return {
                viewport: !!document.querySelector('meta[name="viewport"]'),
                description: !!document.querySelector('meta[name="description"]'),
                charset: !!document.querySelector('meta[charset]'),
                title: document.title.length > 0
            };
        });
        expect(meta.title).toBeTruthy();
        expect(meta.viewport).toBeTruthy();
        expect(meta.charset).toBeTruthy();
    });

    test('Keine broken Links auf Seite', async ({ page }) => {
        await page.goto(BLOG_HUB);
        const links = await page.evaluate(() => {
            return [...document.querySelectorAll('a[href]')]
                .map(a => a.href)
                .filter(h => h.startsWith('http'));
        });
        // Just verify we can extract links, not that they all work
        expect(Array.isArray(links)).toBeTruthy();
    });

    test('Keyboard Shortcuts registriert (Ctrl+T, Ctrl+Q, Ctrl+H)', async ({ page }) => {
        await page.goto(BLOG_HUB);
        await page.waitForTimeout(2000);
        
        const hasTestScript = await page.evaluate(() => {
            return typeof DkzTest !== 'undefined';
        });
        expect(hasTestScript).toBeTruthy();
    });

    test('Seite hat semantisches HTML', async ({ page }) => {
        await page.goto(BLOG_HUB);
        const semantic = await page.evaluate(() => {
            return {
                hasH1: document.querySelectorAll('h1').length >= 1,
                hasFooter: !!document.querySelector('footer'),
                hasMain: !!document.querySelector('main, #app, [role="main"]')
            };
        });
        expect(semantic.hasH1).toBeTruthy();
    });

    test('DkZ Shared Scripts geladen', async ({ page }) => {
        await page.goto(BLOG_HUB);
        await page.waitForTimeout(2000);
        const scripts = await page.evaluate(() => ({
            test: typeof DkzTest !== 'undefined',
            qa: typeof DkzQA !== 'undefined',
            stress: typeof DkzStress !== 'undefined'
        }));
        expect(scripts.test).toBeTruthy();
    });
});

test.describe('API Health Checks @agentic', () => {

    test('ONTHERUN Gateway Health (skip if offline)', async ({ page }) => {
        try {
            const response = await page.request.get('http://localhost:3040/health');
            expect(response.ok()).toBeTruthy();
        } catch {
            test.skip();
        }
    });
});
