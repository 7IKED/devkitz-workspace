const { test, expect } = require('@playwright/test');

test('Live View Demo - DEVKiTZ', async ({ page }) => {
  // Gehe auf eine Webseite
  await page.goto('https://github.com/777/devkitz-ecosystem');

  // Mach eine kurze Pause, damit du zuschauen kannst
  await page.waitForTimeout(2000);

  // Beispiel-Interaktion: Scrolle nach unten
  await page.evaluate(() => window.scrollBy(0, 500));
  await page.waitForTimeout(1000);

  // Mache einen Screenshot für die Dokumentation
  await page.screenshot({ path: 'demo-screenshot.png' });

  // Bestätige, dass die Seite geladen ist
  expect(await page.title()).toBeDefined();
});
