/**
 * MathScene small-phone audit (opt-in: `ATLAS_AUDIT=1 pnpm e2e tests-e2e/math-scene-phone-audit.spec.ts`): every check of every
 * lesson, pool and practice, at 375×667 with the tray docked, in both locales, as the check opens. Each is reported as drawn whole
 * above the tray, not drawn (its model is whole-or-nothing and did not fit), overlapping the tray, or running into the HUD above or
 * beside the stage (the top bar, the title block, the chapter squares, the card's tab). With `ATLAS_AUDIT_WRONG=1` each is measured
 * again after a planned wrong answer is checked (the tray then holds its feedback and stands taller).
 *
 * What counts is what is painted once the drawing has settled (its animations done, its painted box the same four reads running):
 * hidden, transparent, faded-out and clipped shapes and zero-size boxes are left out, as stage/fit.ts leaves them out. The report
 * (one JSON per topic and locale, and a screenshot of each check not drawn whole and clear) goes to `ATLAS_AUDIT_DIR` (default
 * test-results/math-phone-audit).
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { expect, test, type Page } from '@playwright/test';
import { measurePainted } from './math-painted';

const TOPICS = ['area-perimeter', 'angles', 'average', 'decimals', 'fractions', 'graphs', 'multiplication-division', 'measuring', 'nets-and-solids', 'symmetry', 'telling-time', 'sample-lesson-measure', 'sample-lesson-decimal', 'sample-lesson-net', 'sample-lesson-whole'];
const OUT = process.env.ATLAS_AUDIT_DIR ?? 'test-results/math-phone-audit';

type Row = { topic: string; locale: string; phase: 'open' | 'wrong'; step: string; index: number; id: string; kind: string; result: 'drawn' | 'not-drawn' | 'overlaps' | 'under-hud' | 'no-tray'; hud: string; model: string; bottom: number; trayTop: number; height: number };
type Engine = { tasks(): { step: string; index: number; id: string; kind: string; wrong: string | null }[]; answer(code: string): boolean; goToTask(step: string, i: number, o?: { instant?: boolean }): void; task(): { id: string | null } };

/** Until the stage's animations are done and the painted box holds still. */
async function settled(page: Page) {
  // No animation running on the stage (endless ones aside) and the same painted box for four reads 150 ms apart. A shorter wait
  // reads false overlaps: a check opened after another first stands still in the old one's place for a moment, then its blocks
  // move in (a morph that starts late), so two equal reads with nothing running are not yet the end.
  const running = () => page.evaluate(() => (document.querySelector('.ms-svg')?.getAnimations({ subtree: true }) ?? []).filter((a) => a.playState === 'running' && a.effect?.getTiming().iterations !== Infinity).length);
  let last = '';
  let same = 0;
  for (let i = 0; i < 60 && same < 4; i++) {
    await page.waitForTimeout(150);
    const now = JSON.stringify(await measurePainted(page));
    same = now === last && (await running()) === 0 ? same + 1 : 0;
    last = now;
  }
  return JSON.parse(last) as Awaited<ReturnType<typeof measurePainted>>;
}

test.describe('MathScene small-phone audit', () => {
  test.skip(!process.env.ATLAS_AUDIT, 'opt-in: ATLAS_AUDIT=1');
  for (const topic of TOPICS)
    for (const locale of ['en', 'zh'])
      test(`${topic} ${locale}`, async ({ page }) => {
        test.setTimeout(600_000);
        mkdirSync(OUT, { recursive: true });
        await page.setViewportSize({ width: 375, height: 667 });
        await page.goto(`/${locale}/topics/${topic}/`);
        await page.waitForFunction(() => window.__atlas !== undefined, null, { timeout: 30_000 });
        expect(await page.evaluate(() => window.__atlas!.ready)).toBe(true);
        const tasks = await page.evaluate(() => (window.__atlas!.engine as unknown as Engine).tasks());
        const rows: Row[] = [];
        for (const t of tasks) {
          await page.evaluate(([s, i]) => (window.__atlas!.engine as unknown as Engine).goToTask(s as string, i as number, { instant: true }), [t.step, t.index] as const);
          await expect.poll(() => page.evaluate(() => (window.__atlas!.engine as unknown as Engine).task().id)).toBe(t.id);
          const record = async (phase: Row['phase']) => {
            const m = await settled(page);
            const trayTop = m.tray?.top ?? 0;
            const result: Row['result'] = !m.tray ? 'no-tray' : m.hidden || !m.box ? 'not-drawn' : m.box.bottom > trayTop + 0.5 ? 'overlaps' : m.hud ? 'under-hud' : 'drawn';
            rows.push({ topic, locale, phase, step: t.step, index: t.index, id: t.id, kind: t.kind, result, hud: m.hud, model: m.model, bottom: Math.round(m.box?.bottom ?? 0), trayTop: Math.round(trayTop), height: Math.round(m.box ? m.box.bottom - m.box.top : 0) });
            if (result !== 'drawn') await page.screenshot({ path: join(OUT, `${result}-${t.id}-${locale}-${phase}.png`) });
          };
          await record('open');
          const check = page.locator('.ms-tray-dock .ms-tray [data-command="check"]');
          if (process.env.ATLAS_AUDIT_WRONG && t.wrong && (await page.evaluate((code) => (window.__atlas!.engine as unknown as Engine).answer(code), t.wrong)) && (await check.isEnabled().catch(() => false))) {
            await check.click();
            await page.locator('.ms-tray-dock .ms-tray__feedback').waitFor({ timeout: 3000 }).catch(() => undefined);
            await record('wrong');
          }
        }
        writeFileSync(join(OUT, `${topic}-${locale}.json`), JSON.stringify(rows, null, 1));
      });
});
