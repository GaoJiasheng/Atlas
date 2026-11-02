/**
 * HUD layout check (docs/08 §2, mirrors the industrial-3d-showcase
 * `shoot.py --layout` logic): every visible `[data-hud-panel]` is on screen,
 * no two of them overlap, and the page never scrolls sideways.
 */
import { test as base, type Page } from '@playwright/test';

export const LAYOUT_SIZES = [
  [3840, 2160],
  [2560, 1440],
  [1920, 1080],
  [1600, 900],
  [1133, 744], [744, 1133],
  [1180, 820], [820, 1180],
  [1194, 834], [834, 1194],
  [1366, 1024], [1024, 1366],
  [1280, 800], [1440, 900], [1512, 982],
  [1024, 768],
  [1280, 720],
  [900, 1200],
  [390, 844],
] as const;

/** Returns a list of human-readable issues; empty = pass. */
export function hudLayoutIssues(page: Page): Promise<string[]> {
  return page.evaluate(() => {
    const W = window.innerWidth;
    const H = window.innerHeight;
    const out: string[] = [];
    const shown = (el: Element) => {
      for (let e: Element | null = el; e; e = e.parentElement) {
        const cs = getComputedStyle(e);
        if (cs.display === 'none' || cs.visibility === 'hidden' || Number.parseFloat(cs.opacity) < 0.05) return false;
      }
      const r = el.getBoundingClientRect();
      return r.width > 0 && r.height > 0;
    };
    const panels = [...document.querySelectorAll('[data-hud-panel]')]
      .filter(shown)
      .map((el) => ({ id: el.getAttribute('data-hud-panel') || el.className, r: el.getBoundingClientRect(), el }));
    const hit = (a: DOMRect, b: DOMRect, pad = 1) =>
      a.left < b.right - pad && b.left < a.right - pad && a.top < b.bottom - pad && b.top < a.bottom - pad;
    for (const p of panels) {
      const r = p.r;
      if (r.left < -1 || r.top < -1 || r.right > W + 1 || r.bottom > H + 1)
        out.push(`off-screen: ${p.id} [${Math.round(r.left)},${Math.round(r.top)},${Math.round(r.right)},${Math.round(r.bottom)}]`);
    }
    for (let i = 0; i < panels.length; i++)
      for (let j = i + 1; j < panels.length; j++) {
        const a = panels[i]!;
        const b = panels[j]!;
        if (a.el.contains(b.el) || b.el.contains(a.el)) continue;
        if (hit(a.r, b.r)) out.push(`overlap: ${a.id} × ${b.id}`);
      }
    if (document.documentElement.scrollWidth > W + 1) out.push(`horizontal overflow: ${document.documentElement.scrollWidth} > ${W}`);
    for (const el of document.querySelectorAll('[data-hud-panel]'))
      if (shown(el) && el.scrollWidth > el.clientWidth + 1 && getComputedStyle(el).overflowX === 'visible')
        out.push(`content wider than panel: ${el.getAttribute('data-hud-panel')} (${el.scrollWidth} > ${el.clientWidth})`);
    const scene = document.querySelector<HTMLElement>('.atlas-scene');
    if (scene?.dataset.hud !== 'off') {
      // The primary stage band is measured from DOM edges, independently of
      // the solver's output. Reader-authored overrides may intentionally use
      // more room; those defaults are not subject to the automatic minimum.
      const manual = window.__atlas?.state().manual ?? {};
      if (Object.keys(manual).length === 0) {
        const top = document.querySelector('.atlas-topbar')?.getBoundingClientRect().bottom ?? 0;
        const dock = document.querySelector('.atlas-hud__dock')?.getBoundingClientRect();
        const reader = document.querySelector('.atlas-reader');
        const drawer = !!document.querySelector('.atlas-panel__toggle') && shown(document.querySelector('.atlas-panel__toggle')!);
        const left = [...document.querySelectorAll('.atlas-hud__left [data-hud-panel]')].filter(shown);
        // Phones: the title and the rail's chip row are a header above the stage, not a column beside it.
        const x0 = W < 760 ? 0 : Math.max(0, ...left.map(e => e.getBoundingClientRect().right));
        const x1 = !drawer && reader && shown(reader) ? reader.getBoundingClientRect().left : W;
        // With a bottom drawer the stage is the page above it (docs/67 §2-2), so the height share is taken there.
        const page = drawer && reader ? reader.getBoundingClientRect().top : H;
        const y1 = Math.min(dock && dock.height > 0 ? dock.top : H, page);
        if (x1-x0 < W*.5-1 || y1-top < page*.6-1)
          out.push(`stage share: ${Math.round(x1-x0)}×${Math.round(y1-top)} < ${Math.round(W*.5)}×${Math.round(page*.6)}`);
      }
      for (const tab of document.querySelectorAll('[data-fold-tab],.atlas-card__tab,.atlas-reader__strip,.atlas-panels__bar')) {
        if (!shown(tab)) continue;
        const r=tab.getBoundingClientRect();
        if (r.width < 44-1 || r.height < 44-1) out.push(`fold tap target: ${tab.className} ${Math.round(r.width)}×${Math.round(r.height)}`);
        if (!tab.textContent?.trim()) out.push(`unlabelled fold tab: ${tab.className}`);
        if (tab.getAttribute('aria-expanded') !== 'false') out.push(`fold aria-expanded: ${tab.className}`);
      }
    }
    return out;
  });
}

/** Seed before navigation in e2e, except the explicit first-run case. */
export async function seedGuideSeen(page: Page): Promise<void> {
  await page.addInitScript(() => { try { localStorage.setItem('atlas:guide-seen', '1'); } catch { /* blocked storage */ } });
}

/** Shared Playwright fixture; routine specs should import hudTest as test. */
export const hudTest = base.extend<{ firstRun: boolean }>({
  firstRun: [false, { option: true }],
  page: async ({ page, firstRun }, use) => {
    // Under automation the guide never auto-opens unless the page opts in (lib/prefs.ts GUIDE_FIRST_RUN_TEST_KEY).
    if (firstRun) await page.addInitScript(() => { try { localStorage.setItem('atlas:guide-first-run-test', '1'); } catch { /* blocked storage */ } });
    else await seedGuideSeen(page);
    await use(page);
  },
});
