import { expect, test } from '@playwright/test';

// The App Store's required support and privacy URLs must serve real pages, not the root language redirect.
for (const [path, en, zh] of [
  ['/privacy/', 'Atlas privacy policy', 'Atlas 隐私政策'],
  ['/support/', 'Atlas support', 'Atlas 支持'],
] as const) {
  test(`${path} shows both languages and a contact address`, async ({ page }) => {
    await page.goto(path);
    await expect(page).toHaveURL(new RegExp(`${path}$`));
    await expect(page.locator('h1')).toHaveText([en, zh]);
    const mail = page.locator('a[href^="mailto:"]');
    await expect(mail).toHaveCount(2);
    for (const box of await mail.evaluateAll((els) => els.map((el) => el.getBoundingClientRect().height))) expect(box).toBeGreaterThanOrEqual(44);
  });
}
