/**
 * Where the lesson draws (docs/15 §4.3–4.4). The answer tray belongs to the
 * stage (it stays with the HUD hidden) but sits in a band the HUD keeps free
 * for it: the engine writes the tray's height to `--task-h` on `.atlas-scene`
 * and math-scene.css adds that band to the HUD grid above the bottom dock, so
 * the title block, the chapter rail, the card and the control panel end above
 * the tray and nothing overlaps. The model is then laid out in the largest
 * free rectangle of the stage: between the HUD's left and right columns, or
 * under them. HUD hidden: the tray floats at the bottom; presenting: the
 * caption card is the floor and the title block an obstacle.
 */
import { useLayoutEffect, useState, type RefObject } from 'react';

export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface StageLayout {
  w: number;
  h: number;
  /** Where the model goes (stage coordinates). */
  free: Rect;
  /** Tray position in the stage: `left` / `width` / `bottom` (px); `null` = not shown. */
  tray: { left: number; width: number; bottom: number } | null;
}

export type LayoutMode = 'hud' | 'bare' | 'present';

const TRAY_MAX = 1040;
const PAD = 14;

const visible = (el: Element) => {
  const r = el.getBoundingClientRect();
  if (r.width <= 0 || r.height <= 0) return false;
  for (let e: Element | null = el; e; e = e.parentElement) {
    const cs = getComputedStyle(e);
    if (cs.display === 'none' || cs.visibility === 'hidden' || Number.parseFloat(cs.opacity) < 0.05) return false;
  }
  return true;
};

/**
 * How far the bottom panels' fold tab (it sits on the strip's top edge, above
 * the dock) reaches into the tray's band: the tray is lifted by this much and
 * the band grows by it.
 */
function foldLift(scene: HTMLElement | null): number {
  const hud = scene?.querySelector<HTMLElement>('.atlas-hud');
  const dock = scene?.querySelector<HTMLElement>('.atlas-hud__dock');
  const fold = scene?.querySelector<HTMLElement>('.atlas-panels__fold');
  if (!hud || !dock || !fold || !visible(fold)) return 0;
  const gap = Number.parseFloat(getComputedStyle(hud).rowGap) || 0;
  return Math.max(0, Math.ceil(dock.getBoundingClientRect().top - gap - (fold.getBoundingClientRect().top - 6)));
}

function measure(root: HTMLElement, tray: HTMLElement | null, mode: LayoutMode, lift: number): StageLayout {
  const S = root.getBoundingClientRect();
  const scene = root.closest<HTMLElement>('.atlas-scene');
  const W = S.width;
  const H = S.height;
  let trayPos: StageLayout['tray'] = null;
  let floor = H - PAD;
  if (mode === 'hud' && scene) {
    const hud = scene.querySelector<HTMLElement>('.atlas-hud');
    const dock = scene.querySelector<HTMLElement>('.atlas-hud__dock');
    if (hud && dock) {
      const cs = getComputedStyle(hud);
      const hr = hud.getBoundingClientRect();
      const left = hr.left + Number.parseFloat(cs.paddingLeft) - S.left;
      const right = hr.right - Number.parseFloat(cs.paddingRight) - S.left;
      const band = dock.getBoundingClientRect().top - (Number.parseFloat(cs.rowGap) || 0) - lift;
      const width = Math.min(TRAY_MAX, right - left);
      trayPos = { left: left + (right - left - width) / 2, width, bottom: Math.max(0, S.bottom - band) };
    }
  } else if (mode === 'bare') {
    const width = Math.min(TRAY_MAX, W - 32);
    trayPos = { left: (W - width) / 2, width, bottom: 16 };
  }
  if (trayPos) floor = H - trayPos.bottom - (tray?.offsetHeight ?? 0) - PAD;

  // Obstacles: the HUD columns (title, rail, card, control panel), or the presentation's title and caption card.
  const obstacles: { r: DOMRect; side: 'left' | 'right' }[] = [];
  if (scene && mode === 'hud') {
    for (const el of scene.querySelectorAll('.atlas-hud__left [data-hud-panel], .atlas-hud__right [data-hud-panel], [data-hud-panel="card-tab"]')) {
      if (!visible(el)) continue;
      const r = el.getBoundingClientRect();
      if (r.bottom <= S.top || r.top >= S.bottom) continue;
      obstacles.push({ r, side: r.left + r.width / 2 < S.left + W / 2 ? 'left' : 'right' });
    }
  }
  if (scene && mode === 'present') {
    const card = scene.querySelector('[data-hud-panel="present"]');
    if (card && visible(card)) floor = Math.min(floor, card.getBoundingClientRect().top - S.top - PAD);
    const title = scene.querySelector('[data-hud-panel="present-title"]');
    if (title && visible(title)) obstacles.push({ r: title.getBoundingClientRect(), side: 'left' });
  }
  const top = PAD;
  const leftEdge = Math.max(PAD, ...obstacles.filter((o) => o.side === 'left').map((o) => o.r.right - S.left + PAD));
  const rightEdge = Math.min(W - PAD, ...obstacles.filter((o) => o.side === 'right').map((o) => o.r.left - S.left - PAD));
  const under = Math.max(top, ...obstacles.map((o) => o.r.bottom - S.top + PAD));
  // Presenting, only the title block stands in the way: keep the model centred on the screen.
  const right = mode === 'present' ? Math.min(rightEdge, W - leftEdge) : rightEdge;
  const between: Rect = { x: leftEdge, y: top, w: Math.max(0, right - leftEdge), h: Math.max(0, floor - top) };
  const below: Rect = { x: PAD, y: under, w: Math.max(0, W - 2 * PAD), h: Math.max(0, floor - under) };
  // A model wants width more than height: judge a rectangle by its area with the width capped at 2.2 × the height.
  const usable = (r: Rect) => Math.min(r.w, 2.2 * r.h) * r.h;
  const free = usable(below) > usable(between) ? below : between;
  return { w: W, h: H, free, tray: trayPos };
}

const same = (a: StageLayout, b: StageLayout) => JSON.stringify(a) === JSON.stringify(b);

/** Lay the stage out now and whenever the stage, the tray or the HUD around it changes size. */
export function useStageLayout(root: RefObject<HTMLElement | null>, tray: RefObject<HTMLElement | null>, mode: LayoutMode, key: string): StageLayout {
  const [layout, setLayout] = useState<StageLayout>({ w: 0, h: 0, free: { x: 0, y: 0, w: 0, h: 0 }, tray: null });
  useLayoutEffect(() => {
    const el = root.current;
    if (!el) return;
    const scene = el.closest<HTMLElement>('.atlas-scene');
    let frame = 0;
    const run = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        // The tray's band in the HUD grid: its height (plus the fold tab's reach) while the HUD shows it, none otherwise.
        const lift = mode === 'hud' ? foldLift(scene) : 0;
        const h = mode === 'hud' && tray.current ? Math.ceil(tray.current.offsetHeight) + lift : 0;
        if (scene && scene.style.getPropertyValue('--task-h') !== `${h}px`) scene.style.setProperty('--task-h', `${h}px`);
        const next = measure(el, tray.current, mode, lift);
        setLayout((prev) => (same(prev, next) ? prev : next));
      });
    };
    run();
    const ro = new ResizeObserver(run);
    ro.observe(el);
    if (tray.current) ro.observe(tray.current);
    for (const sel of ['.atlas-hud', '.atlas-hud__dock', '.atlas-hud__left', '.atlas-hud__right', '.atlas-stage__overlay']) {
      const target = scene?.querySelector(sel);
      if (target) ro.observe(target);
    }
    // The presentation card fades in after the beat starts; measure again once it is there.
    const late = window.setTimeout(run, 400);
    const later = window.setTimeout(run, 2400);
    // After a resize the HUD rescales (--k) a render later and the dock may move without changing size: measure again then.
    let settle = 0;
    const onResize = () => {
      run();
      window.clearTimeout(settle);
      settle = window.setTimeout(run, 300);
    };
    window.addEventListener('resize', onResize);
    return () => {
      cancelAnimationFrame(frame);
      window.clearTimeout(late);
      window.clearTimeout(later);
      window.clearTimeout(settle);
      ro.disconnect();
      window.removeEventListener('resize', onResize);
    };
  }, [root, tray, mode, key]);
  useLayoutEffect(
    () => () => {
      root.current?.closest<HTMLElement>('.atlas-scene')?.style.removeProperty('--task-h');
    },
    [root],
  );
  return layout;
}
