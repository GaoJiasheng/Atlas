import { expect, test } from '@playwright/test';

for (const locale of ['en', 'zh'] as const) {
  test(`TimeScene ${locale}: a rail segment opened on one day prints that date once`, async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    const id = 'nsl-toa-payoh-yio-chu-kang';
    await page.goto(`/${locale}/topics/singapore-land-use/?t=1988&hl=${id}&layers=base,movements&cam=103.85,1.36,11`);
    await expect(page.locator('.ts-geo')).toHaveAttribute('data-status', 'ready');
    for (const theme of ['paper', 'cinema'] as const) {
      await page.evaluate((value) => window.__atlas!.setTheme(value), theme);
      const date = page.locator(`.ts-co[data-id="${id}"] .ts-co__note i`);
      await expect(date).toBeVisible();
      await expect(date).toHaveText(locale === 'en' ? '7 NOV 1987' : '1987年11月7日');
    }
  });
}
