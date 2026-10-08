/**
 * HUD layout check (docs/08 §2, mirrors the industrial-3d-showcase
 * `shoot.py --layout` logic): every visible `[data-hud-panel]` is on screen,
 * no two of them overlap, and the page never scrolls sideways.
 */
import type { Page } from '@playwright/test';

export const LAYOUT_SIZES = [
  [3840, 2160],
  [2560, 1440],
  [1920, 1080],
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
    return out;
  });
}
