/**
 * What a MathScene check's drawing paints at 375×667 and the like, in page coordinates (tests-e2e/math-scene-phone-audit.spec.ts,
 * math-scene-fit.spec.ts): hidden, transparent, faded-out and clipped shapes and zero-size boxes are left out, as stage/fit.ts
 * leaves them out. A bounding box of the drawing's group would count what a clip path cuts away (the liquid's rect in a pail runs
 * far below the pail) and so read an overlap that is not on screen.
 */
import type { Page } from '@playwright/test';

/** What the check's drawing paints, in page coordinates, or null when nothing (or it is hidden by the fit). */
export const measurePainted = (page: Page) =>
  page.evaluate(() => {
    const beat = document.querySelector<SVGGElement>('.ms-svg .ms-beat');
    const tray = document.querySelector('.ms-tray-dock .ms-tray')?.getBoundingClientRect() ?? null;
    const model = beat?.querySelector('[data-model]')?.getAttribute('data-model') ?? beat?.querySelector('[class^="ms-"]')?.getAttribute('class')?.split(' ')[0] ?? '';
    if (!beat) return { box: null, tray, hidden: true, model, hud: '' };
    const fit = beat.firstElementChild as SVGGElement | null;
    if (fit && getComputedStyle(fit).display === 'none') return { box: null, tray, hidden: true, model, hud: '' };
    const shown = (v: string) => v !== 'none' && v !== 'transparent' && !/rgba\([^)]*,\s*0\)$/.test(v);
    // The HUD above and beside the stage: a painted shape that runs into one of these is under the HUD.
    const huds = [...document.querySelectorAll<HTMLElement>('[data-hud-panel="topbar"], [data-hud-panel="title"], [data-hud-panel="card-tab"], [data-hud-panel="rail"]')]
      .filter((e) => e.offsetParent !== null && getComputedStyle(e).visibility !== 'hidden')
      .map((e) => ({ name: e.dataset.hudPanel!, r: e.getBoundingClientRect() }))
      .filter((h) => h.r.width > 0 && h.r.height > 0);
    const under = new Set<string>();
    let x0 = Infinity;
    let y0 = Infinity;
    let x1 = -Infinity;
    let y1 = -Infinity;
    const screen = (bb: DOMRect, m: DOMMatrix) => {
      const pts = [new DOMPoint(bb.x, bb.y), new DOMPoint(bb.x + bb.width, bb.y), new DOMPoint(bb.x, bb.y + bb.height), new DOMPoint(bb.x + bb.width, bb.y + bb.height)].map((p) => p.matrixTransform(m));
      const xs = pts.map((p) => p.x);
      const ys = pts.map((p) => p.y);
      return { x0: Math.min(...xs), y0: Math.min(...ys), x1: Math.max(...xs), y1: Math.max(...ys) };
    };
    for (const el of beat.querySelectorAll<SVGGraphicsElement>('circle, ellipse, image, line, path, polygon, polyline, rect, text, use')) {
      if (el.closest('clipPath, mask, defs, pattern, marker')) continue;
      const cs = getComputedStyle(el);
      if (cs.display === 'none' || cs.visibility === 'hidden') continue;
      const painted = el instanceof SVGTextElement || el instanceof SVGImageElement || el instanceof SVGUseElement ? shown(cs.fill) || shown(cs.stroke) : (shown(cs.fill) && Number(cs.fillOpacity) > 0) || (shown(cs.stroke) && Number(cs.strokeOpacity) > 0 && Number.parseFloat(cs.strokeWidth) > 0);
      if (!painted) continue;
      let faded = false;
      for (let e: Element | null = el; e && e !== beat.parentElement; e = e.parentElement) if (Number(getComputedStyle(e).opacity) < 0.05) faded = true;
      if (faded) continue;
      const m = el.getScreenCTM();
      const bb = el.getBBox();
      if (!m || (bb.width === 0 && bb.height === 0)) continue;
      let r = screen(bb, m);
      for (let e: Element | null = el; e && e !== beat.parentElement; e = e.parentElement) {
        const ref = /url\(["']?#([^"')]+)/.exec(e.getAttribute('clip-path') ?? '');
        const shape = ref ? document.getElementById(ref[1]!)?.firstElementChild : null;
        const em = (e as SVGGraphicsElement).getScreenCTM?.();
        if (!(shape instanceof SVGGraphicsElement) || !em) continue;
        const c = screen(shape.getBBox(), em);
        r = { x0: Math.max(r.x0, c.x0), y0: Math.max(r.y0, c.y0), x1: Math.min(r.x1, c.x1), y1: Math.min(r.y1, c.y1) };
      }
      if (r.x1 <= r.x0 || r.y1 <= r.y0) continue;
      for (const h of huds) if (r.x0 < h.r.right - 1 && h.r.left < r.x1 - 1 && r.y0 < h.r.bottom - 1 && h.r.top < r.y1 - 1) under.add(h.name);
      x0 = Math.min(x0, r.x0);
      y0 = Math.min(y0, r.y0);
      x1 = Math.max(x1, r.x1);
      y1 = Math.max(y1, r.y1);
    }
    const box = Number.isFinite(x0) ? { top: y0, bottom: y1, left: x0, right: x1 } : null;
    return { box, tray, hidden: !box, model, hud: [...under].join(' ') };
  });
