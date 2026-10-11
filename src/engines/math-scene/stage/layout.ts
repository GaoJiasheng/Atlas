/**
 * Where the lesson draws (docs/15 §4.3, §10). The model is laid out in the
 * largest free rectangle of the stage: between the HUD's left and right
 * columns, or under them, above the chapter axis (the dock). The check's
 * answer controls live in the reading panel; below 1024 px, where the reader
 * is a sheet over the stage, they sit on the stage above the dock instead
 * (`docked`: the tray is the floor). HUD hidden: the whole stage; presenting:
 * the caption card is the floor and the title block an obstacle.
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
  /** Distance from the stage's bottom to the top of the dock plus the HUD's row gap (where the docked tray's bottom goes). */
  dock: number;
}

export type LayoutMode = 'hud' | 'bare' | 'present';

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

function measure(root: HTMLElement, mode: LayoutMode, tray: HTMLElement | null): StageLayout {
  const S = root.getBoundingClientRect();
  const scene = root.closest<HTMLElement>('.atlas-scene');
  const W = S.width;
  const H = S.height;
  let floor = H - PAD;
  let dockGap = 0;
  if (mode === 'hud' && scene) {
    const dock = scene.querySelector<HTMLElement>('.atlas-hud__dock');
    if (dock && visible(dock)) {
      floor = Math.min(floor, dock.getBoundingClientRect().top - S.top - PAD);
      const hud = scene.querySelector<HTMLElement>('.atlas-hud');
      const rowGap = hud ? Number.parseFloat(getComputedStyle(hud).rowGap) || 0 : 0;
      dockGap = Math.max(0, S.bottom - dock.getBoundingClientRect().top + rowGap);
    }
  }
  // The docked tray (below 1024 px) is the floor.
  if (tray && mode !== 'present' && visible(tray)) floor = Math.min(floor, tray.getBoundingClientRect().top - S.top - PAD);

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
  return { w: W, h: H, free, dock: dockGap };
}

const same = (a: StageLayout, b: StageLayout) => JSON.stringify(a) === JSON.stringify(b);

/** Lay the stage out now and whenever the stage or the HUD around it changes size. */
export function useStageLayout(root: RefObject<HTMLElement | null>, tray: RefObject<HTMLElement | null>, mode: LayoutMode, key: string): StageLayout {
  const [layout, setLayout] = useState<StageLayout>({ w: 0, h: 0, free: { x: 0, y: 0, w: 0, h: 0 }, dock: 0 });
  useLayoutEffect(() => {
    const el = root.current;
    if (!el) return;
    const scene = el.closest<HTMLElement>('.atlas-scene');
    let frame = 0;
    const run = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const next = measure(el, mode, tray.current);
        setLayout((prev) => (same(prev, next) ? prev : next));
      });
    };
    run();
    const ro = new ResizeObserver(run);
    ro.observe(el);
    if (tray.current) ro.observe(tray.current);
    for (const sel of ['.atlas-hud', '.atlas-hud__dock', '.atlas-hud__left', '.atlas-hud__right', '.atlas-stage__overlay', '[data-hud-panel="reader"]']) {
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
  return layout;
}
