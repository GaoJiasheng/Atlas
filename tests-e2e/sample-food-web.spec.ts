/** Draft directed-card fixture. Existing table model and existing test API only. */
import { expect, test, type Page } from '@playwright/test';

async function open(page: Page, query = 'ch=sample-web', locale = 'en') {
  await page.goto(`/${locale}/topics/sample-food-web/?${query}`);
  await page.waitForFunction(() => window.__atlas !== undefined);
  expect(await page.evaluate(() => window.__atlas!.ready)).toBe(true);
}
const desktop = (page: Page) => page.locator('.space-food-web--card');
const reading = (page: Page) => page.locator('.space-food-web--reader');
const sim = (page: Page) => page.evaluate(() => (window.__atlas!.engine as unknown as { sim(): { values: Record<string, unknown>; outputs: Record<string, unknown> } }).sim());

test.describe('sample-food-web directed table card', () => {
  test.beforeEach(async ({ page }) => { await page.setViewportSize({ width: 1600, height: 1000 }); });

  test('six fixed nodes, six directed active relations and existing table readings', async ({ page }) => {
    await open(page);
    await expect(desktop(page)).toBeVisible();
    await expect(desktop(page).locator('[data-food-node]')).toHaveCount(6);
    await expect(desktop(page).locator('[data-food-edge][data-active="true"]')).toHaveCount(6);
    await expect(desktop(page).locator('[data-food-node="n-mudskipper"]')).toHaveAttribute('data-inspect', 'true');
    const o = (await sim(page)).outputs;
    expect([o['present-count'], o['supported-count'], o['active-links'], o.foods, o['food-status']]).toEqual([6, 6, 6, 2, 'unchanged']);
  });

  test('deep link removal distinguishes absent, unsupported, fewer foods and unchanged', async ({ page }) => {
    await open(page, 'ch=sample-web&sim=remove.n-algae');
    const card = desktop(page);
    await expect(card.locator('[data-food-node="n-algae"]')).toHaveAttribute('data-present', 'false');
    await expect(card.locator('[data-food-node="n-fiddlers"]')).toHaveAttribute('data-present', 'true');
    await expect(card.locator('[data-food-node="n-fiddlers"]')).toHaveAttribute('data-supported', 'false');
    await expect(card.locator('[data-food-node="n-fiddlers"]')).toContainText('No shown food');
    await expect(card.locator('[data-food-node="n-mudskipper"]')).toContainText('Fewer foods');
    await expect(card.locator('[data-food-node="n-heron"]')).toContainText('Unchanged');
    await expect(card.locator('[data-food-edge][data-active="false"]')).toHaveCount(3);
    expect((await sim(page)).outputs.foods).toBe(1);
  });

  test('node click and Enter / Space select its first part without changing inspect or remove', async ({ page }) => {
    await open(page);
    const node = desktop(page).locator('[data-food-node="n-fiddlers"]');
    await node.click();
    await expect(node).toHaveAttribute('data-selected', 'true');
    expect((await sim(page)).values).toMatchObject({ remove: 'none', inspect: 'n-mudskipper' });
    const other = desktop(page).locator('[data-food-node="n-heron"]');
    await other.focus(); await page.keyboard.press('Enter');
    await expect(other).toHaveAttribute('data-selected', 'true');
    await node.focus(); await page.keyboard.press('Space');
    await expect(node).toHaveAttribute('data-selected', 'true');
    expect((await sim(page)).values).toMatchObject({ remove: 'none', inspect: 'n-mudskipper' });
  });

  test('evidence notes and source popovers work without hover', async ({ page }) => {
    await open(page);
    const card = desktop(page);
    await card.locator('summary').click();
    const relation = card.locator('[data-food-relation="e-tree-fish"]');
    await expect(relation).toContainText('Reported observation · medium evidence');
    await expect(relation).toContainText('Sample relation evidence');
    await relation.locator('.atlas-src').click();
    await expect(page.locator('.atlas-source-pop')).toBeVisible();
    await expect(page.locator('.atlas-source-pop')).toContainText('Sample relation evidence');
  });

  test('Chinese and cinema use the same state and evidence text', async ({ page }) => {
    await open(page, 'ch=sample-web&theme=cinema&sim=remove.n-algae', 'zh');
    await expect(desktop(page)).toContainText('食物 → 消费者');
    await expect(desktop(page).locator('[data-food-node="n-fiddlers"]')).toContainText('图中无食物来源');
    await desktop(page).locator('summary').click();
    await expect(desktop(page)).toContainText('索引资料 · 中等证据');
  });

  test('phone background without try-it has a visible reader card and 44px targets', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await open(page, 'ch=before-you-start');
    await page.getByRole('button', { name: 'Read', exact: true }).click();
    await expect(page.locator('.space-try')).toHaveCount(0);
    const card = reading(page);
    await card.scrollIntoViewIfNeeded();
    await expect(card).toBeVisible();
    for (const node of await card.locator('[data-food-node]').all()) {
      const box = (await node.boundingBox())!;
      expect(box.width).toBeGreaterThanOrEqual(44); expect(box.height).toBeGreaterThanOrEqual(44);
    }
    await expect(card.locator('[data-food-relation="e-tree-fish"]')).toContainText('Sample relation evidence');
    const box = (await card.boundingBox())!;
    expect(box.x).toBeGreaterThanOrEqual(0); expect(box.x + box.width).toBeLessThanOrEqual(390);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
  });
});
