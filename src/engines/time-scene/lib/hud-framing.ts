/**
 * Map cameras framed in the free stage rect (docs/67 §2.4): the map canvas
 * minus the visible `[data-hud-panel]` blocks, measured live.
 *
 * - Centre: MapLibre `padding` puts the camera centre at the centre of the
 *   free rect. Only the asymmetric part is used (the common inset on opposite
 *   sides cancels), so a centred free rect leaves the camera exactly as authored.
 * - Zoom: authored zooms were tuned on the 1920×1080 default layout, where the
 *   free rect is about REF_FREE. A smaller free rect zooms out by
 *   log2(free / REF_FREE) (never in, at most MAX_ZOOM_OUT), so what the
 *   author framed between the HUD columns still fits between them.
 *   The store keeps authored units: `storedZoom()` takes the shift off a
 *   reader's pan / zoom before it is written back (URL, FREE CAMERA).
 * - Re-fit: a HUD block opening, closing or resizing (or the stage resizing)
 *   eases the current authored camera into the new free rect (.6 s), unless the
 *   reader has panned / zoomed since; then the view holds still and only the
 *   padding follows, until the next chapter / beat / preset.
 */
import type { Map as MlMap, PaddingOptions } from 'maplibre-gl';
import type { GeoCamera } from '../../core/types';
import { freeStageRect, type FrameRect } from './free-rect';

/** Free rect of the 1920×1080 default layout (ww2: title / rail column, card + LAYERS column, chapter axis), CSS px. */
export const REF_FREE = { w: 810, h: 919 } as const;
/** The largest zoom-out for a small free rect (a 2.8× smaller map): beyond this the HUD, not the camera, has to give way. */
export const MAX_ZOOM_OUT = 1.5;
/** Re-fit easing after a HUD change (ms). */
export const REFIT_MS = 600;
/** WHOLE AREA / plate fits: margin inside the free rect, as a share of its shorter side. */
export const FIT_MARGIN = 0.08;

const ZERO: PaddingOptions = { top: 0, bottom: 0, left: 0, right: 0 };

function validRect(width: number, height: number, rect: FrameRect): boolean {
  return [width, height, rect.x0, rect.y0, rect.x1, rect.y1].every(Number.isFinite) &&
    width > 0 && height > 0 && rect.x0 >= 0 && rect.y0 >= 0 &&
    rect.x1 <= width && rect.y1 <= height && rect.x1 > rect.x0 && rect.y1 > rect.y0;
}

/** Shift only the map's centre point. Removing the common opposing inset
 * leaves centred compositions exactly unchanged (including pitched views). */
export function mapHudPadding(width: number, height: number, rect: FrameRect): PaddingOptions {
  if (!validRect(width, height, rect)) return { ...ZERO };
  const x = rect.x0 - (width - rect.x1), y = rect.y0 - (height - rect.y1);
  return { left: Math.max(0, x), right: Math.max(0, -x), top: Math.max(0, y), bottom: Math.max(0, -y) };
}

/** Zoom added to an authored camera for this free rect: 0 at or above REF_FREE, down to −MAX_ZOOM_OUT. */
export function frameZoomShift(width: number, height: number, rect: FrameRect): number {
  if (!validRect(width, height, rect)) return 0;
  const scale = Math.min((rect.x1 - rect.x0) / REF_FREE.w, (rect.y1 - rect.y0) / REF_FREE.h);
  return Math.round(Math.max(-MAX_ZOOM_OUT, Math.min(0, Math.log2(scale))) * 100) / 100;
}

/** `cameraForBounds` padding on top of the map's own padding `current` (MapLibre subtracts both):
 * symmetric on each axis, so the fit centre is the bounds' midpoint, and sized so the room left is
 * the free rect less a margin. Applied through `target()`, that midpoint lands in the free rect's centre. */
export function fitHudPadding(width: number, height: number, rect: FrameRect, margin = FIT_MARGIN, current: PaddingOptions = ZERO): PaddingOptions {
  if (!validRect(width, height, rect)) {
    const m = Math.round(Math.min(width, height) * margin) || 0;
    return { top: m, bottom: m, left: m, right: m };
  }
  const m = Math.round(Math.min(rect.x1 - rect.x0, rect.y1 - rect.y0) * margin);
  const x = Math.max(0, (rect.x0 + width - rect.x1 - (current.left ?? 0) - (current.right ?? 0)) / 2 + m);
  const y = Math.max(0, (rect.y0 + height - rect.y1 - (current.top ?? 0) - (current.bottom ?? 0)) / 2 + m);
  return { left: x, right: x, top: y, bottom: y };
}

/** Screen point (container px) at the centre of the padded area. */
export function paddedCentre(width: number, height: number, p: PaddingOptions): [number, number] {
  return [(p.left! + width - p.right!) / 2, (p.top! + height - p.bottom!) / 2];
}

export interface MapHudFraming {
  /** Where an authored camera goes now (padding + shifted zoom); it becomes the camera re-fits return to. */
  target(camera: GeoCamera): { center: [number, number]; zoom: number; pitch: number; bearing: number; padding: PaddingOptions };
  /** A map zoom in authored units (for writing a reader's camera back to the store). */
  storedZoom(zoom: number): number;
  /** Padding for `cameraForBounds` (WHOLE AREA, the plate); convert its zoom with `storedZoom`. */
  fitPadding(margin?: number): PaddingOptions;
  /** The free rect (container px), as last measured. */
  rect(): FrameRect | null;
  setPresentation(on: boolean): void;
  destroy(): void;
}

export interface MapHudFramingOptions {
  /** Applied to the authored zoom before the shift (e.g. a reconstruction's max zoom). */
  clampZoom?(zoom: number): number;
  reducedMotion?: boolean;
}

export function createMapHudFraming(map: MlMap, container: HTMLElement, options: MapHudFramingOptions = {}): MapHudFraming {
  const scene = container.closest('.atlas-scene');
  const clampZoom = options.clampZoom ?? ((z: number) => z);
  let presenting = false, alive = true, timer: ReturnType<typeof setTimeout> | null = null;
  let rect: FrameRect | null = null;
  let padding: PaddingOptions = { ...ZERO };
  let shift = 0;
  /** The last authored camera applied (chapter / beat / preset / deep link). */
  let authored: GeoCamera | null = null;
  /** The reader has panned / zoomed since `authored`. */
  let userMoved = false;
  const observed = new Set<Element>();
  const resize = new ResizeObserver(() => schedule());

  const measure = () => {
    const box = container.getBoundingClientRect();
    const hudOff = scene?.getAttribute('data-hud') === 'off';
    const panels = scene && (presenting || !hudOff)
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
    rect = freeStageRect(box.width, box.height, rects);
    padding = mapHudPadding(box.width, box.height, rect);
    shift = frameZoomShift(box.width, box.height, rect);
    const sig = validRect(box.width, box.height, rect) ? [rect.x0, rect.y0, rect.x1, rect.y1].map(Math.round).join(',') : '';
    if (container.dataset.hudFrame !== sig) container.dataset.hudFrame = sig;
    return { width: box.width, height: box.height };
  };

  const goal = (camera: GeoCamera) => ({
    center: [camera.center[0], camera.center[1]] as [number, number],
    zoom: clampZoom(camera.zoom) + shift,
    pitch: camera.pitch ?? 0,
    bearing: camera.bearing ?? 0,
    padding: { ...padding },
  });

  const samePadding = (a: PaddingOptions, b: PaddingOptions) =>
    ['top', 'bottom', 'left', 'right'].every(k => Math.abs((a[k as keyof PaddingOptions] ?? 0) - (b[k as keyof PaddingOptions] ?? 0)) < 1);

  const refit = () => {
    timer = null;
    if (!alive) return;
    const prevShift = shift;
    const { width, height } = measure();
    const current = map.getPadding();
    if (samePadding(current, padding) && Math.abs(prevShift - shift) < 0.01) return;
    if (authored && !userMoved) {
      // Ease the authored view into the new free rect (a running flight is retargeted, not stacked).
      const next = goal(authored);
      if (options.reducedMotion) map.jumpTo(next);
      else map.easeTo({ ...next, duration: REFIT_MS, essential: true });
      return;
    }
    if (map.isMoving()) { schedule(); return; }
    // The reader's own view: keep what is on screen still, move only the padding.
    const [cx, cy] = paddedCentre(width, height, padding);
    map.jumpTo({ center: map.unproject([cx, cy]), padding });
  };

  function schedule() {
    if (!alive || timer) return;
    // Settle a CSS transition (reader / card folding) before easing: one re-fit, not one per frame.
    timer = setTimeout(refit, 120);
  }

  const onMoveStart = (e: { originalEvent?: Event }) => { if (e.originalEvent) { userMoved = true; } };
  const onWheel = () => { userMoved = true; };
  const onMoveEnd = () => schedule();
  map.on('movestart', onMoveStart);
  map.on('wheel', onWheel);
  map.on('moveend', onMoveEnd);
  resize.observe(container);
  const children = new MutationObserver((records) => {
    // Map markers / leader labels also mutate: only HUD content changes matter.
    if (records.some(r => (r.target instanceof Element && r.target.closest('[data-hud-panel]')) ||
      [...r.addedNodes, ...r.removedNodes].some(n => n instanceof Element && (n.matches('[data-hud-panel]') || n.querySelector('[data-hud-panel]'))))) schedule();
  });
  const attributes = new MutationObserver(schedule);
  if (scene) {
    children.observe(scene, { childList: true, subtree: true });
    attributes.observe(scene, { attributes: true });
    scene.addEventListener('transitionend', schedule);
  }
  document.fonts?.ready.then(schedule);
  measure();

  return {
    target(camera) {
      measure();
      authored = camera;
      userMoved = false;
      return goal(camera);
    },
    storedZoom: (zoom) => Math.round((zoom - shift) * 100) / 100,
    fitPadding(margin) {
      const box = container.getBoundingClientRect();
      measure();
      return rect ? fitHudPadding(box.width, box.height, rect, margin, map.getPadding()) : { ...ZERO };
    },
    rect: () => rect,
    setPresentation(on) { presenting = on; schedule(); },
    destroy() {
      alive = false;
      if (timer) clearTimeout(timer);
      resize.disconnect(); children.disconnect(); attributes.disconnect();
      scene?.removeEventListener('transitionend', schedule);
      map.off('movestart', onMoveStart);
      map.off('wheel', onWheel);
      map.off('moveend', onMoveEnd);
    },
  };
}
