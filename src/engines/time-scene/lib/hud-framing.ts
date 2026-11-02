import type { Map as MlMap, PaddingOptions } from 'maplibre-gl';
import { freeStageRect, type FrameRect } from './free-rect';

/** Shift only the map's centre point. Removing the common opposing inset
 * leaves centred compositions exactly unchanged (including pitched views). */
export function mapHudPadding(width: number, height: number, rect: FrameRect): PaddingOptions {
  const zero = { top: 0, bottom: 0, left: 0, right: 0 };
  if (![width, height, rect.x0, rect.y0, rect.x1, rect.y1].every(Number.isFinite) ||
      width <= 0 || height <= 0 || rect.x0 < 0 || rect.y0 < 0 ||
      rect.x1 > width || rect.y1 > height || rect.x1 <= rect.x0 || rect.y1 <= rect.y0) return zero;
  const x = rect.x0 - (width - rect.x1), y = rect.y0 - (height - rect.y1);
  return { left: Math.max(0, x), right: Math.max(0, -x), top: Math.max(0, y), bottom: Math.max(0, -y) };
}

/** Measure on HUD/layout changes. Padding persists in MapLibre, keeping
 * getCenter()/store/URL in geographic target coordinates after a user pan.
 * Layout changes keep the current target; they never restore an authored camera. */
export function createMapHudFraming(map: MlMap, container: HTMLElement, enabled = false) {
  if (!enabled) return {
    padding: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
    setPresentation(_on: boolean) {},
    destroy() {},
  };
  const scene = container.closest('.atlas-scene');
  let presenting = false, alive = true, frame = 0;
  let padding: PaddingOptions = { top: 0, bottom: 0, left: 0, right: 0 };
  const observed = new Set<Element>();
  const resize = new ResizeObserver(() => schedule());
  const measure = (apply: boolean) => {
    const box = container.getBoundingClientRect();
    const panels = scene && (presenting || scene.getAttribute('data-hud') !== 'off')
      ? [...scene.querySelectorAll('[data-hud-panel]')]
        .filter(el => el.getAttribute('data-hud-panel') !== 'perf' &&
          (!presenting || el.getAttribute('data-hud-panel')!.startsWith('present')))
        .flatMap(el => el.getAttribute('data-hud-panel') === 'overlay' ? [...el.children] : [el])
      : [];
    for (const el of observed) if (!el.isConnected) { resize.unobserve(el); observed.delete(el); }
    const rects = panels.flatMap(el => {
      if (!observed.has(el)) { observed.add(el); resize.observe(el); }
      const r = el.getBoundingClientRect();
      const style = getComputedStyle(el);
      if (r.width < 1 || r.height < 1 || style.visibility === 'hidden' || style.display === 'none') return [];
      return [{ x0: r.left - box.left, y0: r.top - box.top, x1: r.right - box.left, y1: r.bottom - box.top }];
    });
    padding = mapHudPadding(box.width, box.height, freeStageRect(box.width, box.height, rects));
    // setPadding is jumpTo in MapLibre: wait for flights/gestures to settle so
    // a late caption/reader measurement cannot interrupt a camera transition.
    if (apply && !map.isMoving()) {
      const current = map.getPadding();
      if (current.top !== padding.top || current.bottom !== padding.bottom ||
          current.left !== padding.left || current.right !== padding.right) map.setPadding(padding);
    }
    return padding;
  };
  function schedule() {
    if (alive && !frame) frame = requestAnimationFrame(() => { frame = 0; measure(true); });
  }
  resize.observe(container);
  const children = new MutationObserver((records) => {
    // Map markers/leader labels also mutate: only HUD content changes matter.
    if (records.some(r => (r.target instanceof Element && r.target.closest('[data-hud-panel]')) ||
      [...r.addedNodes].some(n => n instanceof Element && (n.matches('[data-hud-panel]') || n.querySelector('[data-hud-panel]'))))) schedule();
  });
  const attributes = new MutationObserver(schedule);
  if (scene) {
    children.observe(scene, { childList: true, subtree: true });
    attributes.observe(scene, { attributes: true });
    scene.addEventListener('transitionend', schedule);
  }
  map.on('moveend', schedule);
  document.fonts?.ready.then(schedule);
  measure(true);
  return {
    padding: () => measure(false),
    setPresentation(on: boolean) { presenting = on; schedule(); },
    destroy() {
      alive = false;
      cancelAnimationFrame(frame);
      resize.disconnect(); children.disconnect(); attributes.disconnect();
      scene?.removeEventListener('transitionend', schedule);
      map.off('moveend', schedule);
    },
  };
}
