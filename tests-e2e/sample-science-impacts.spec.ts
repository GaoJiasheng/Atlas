import { expect, test } from '@playwright/test';
import type { ImpactRecord } from '../src/engines/time-scene/impactSchema';

for (const locale of ['en', 'zh']) {
  test(`source-defined impact estimates (${locale}) stay qualified and static in both looks`, async ({ page }) => {
    test.setTimeout(150_000); // three page loads with catalogue layers
    await page.goto(`/${locale}/topics/sample-science-layers/?ch=catalogue&t=2004-12-26&hl=sample-estimates`);
    expect(await page.evaluate(async () => {
      for (let i = 0; i < 200 && !window.__atlas; i++) await new Promise((resolve) => setTimeout(resolve, 50));
      return window.__atlas?.ready;
    })).toBe(true);
    const apiRecords = await page.evaluate(() => (window.__atlas!.engine.impacts as unknown as (id: string) => ImpactRecord[])('sample-total'));
    expect(apiRecords[0]).toMatchObject({ estimate: { kind: 'reported', value: 227899 }, measure: 'dead-or-missing-presumed-dead', sourceAsOf: '2024-10', componentsComplete: false });
    expect(apiRecords[0]!.components).toHaveLength(4);
    expect(await page.evaluate(() => (window.__atlas!.engine.impacts as unknown as (id: string) => unknown[])('missing'))).toEqual([]);
    // The normal highlighted event label opens the existing event inspector.
    await page.locator('button.ts-label[data-id="sample-estimates"]').click();
    const first = page.locator('[data-impact="sample-impact-lower"]');
    for (const theme of ['paper', 'cinema'] as const) {
      await page.evaluate((value) => window.__atlas!.setTheme(value), theme);
      await expect(first).toContainText(locale === 'en' ? 'More than 70,000' : '超过70,000');
      await expect(first).toHaveAttribute('aria-label', new RegExp(locale === 'en' ? 'More than 70,000' : '超过70,000'));
      await expect(first).toContainText(locale === 'en' ? 'Source publication date' : '来源发布日期');
      await expect(first).toContainText('2011-09-29');
      const other = page.locator('[data-impact="sample-impact-higher"]');
      await expect(other).toContainText('92,000');
      await expect(other).toContainText(locale === 'en' ? 'Accessed' : '读取日期');
      await expect(other).toContainText('2026-10-27');
      await expect(page.locator('.ts-impact .atlas-counter-vs')).toHaveCount(0);
    }
    await first.locator('[data-source="S1"]').click();
    await expect(page.locator('[role="dialog"]')).toBeVisible();
    await page.keyboard.press('Escape');
    // Approximation remains a qualified number through the ordinary event path.
    await page.goto(`/${locale}/topics/sample-science-layers/?ch=catalogue&t=2004-12-26&hl=sample-approximate`);
    await page.locator('button.ts-label[data-id="sample-approximate"]').click();
    await expect(page.locator('[data-impact="sample-impact-about"]')).toContainText(locale === 'en' ? 'About 36,000' : '约36,000');
    await page.goto(`/${locale}/topics/sample-science-layers/?ch=catalogue&t=2004-12-26&hl=sample-total`);
    await page.locator('button.ts-label[data-id="sample-total"]').click();
    const total = page.locator('[data-impact="sample-impact-total"]');
    await expect(total).toContainText('227,899');
    await expect(total).toContainText('2024-10');
    await expect(total).toContainText(locale === 'en' ? 'Dead or missing and presumed dead' : '死亡或失踪并推定死亡');
    await expect(total).toContainText(locale === 'en' ? 'not a complete breakdown' : '并非完整分项');
    await expect(total.locator('li')).toHaveCount(4);
    await expect(total).not.toContainText('227,343');
    await expect(total).not.toContainText('556');
  });
}
