/**
 * Map cameras framed in the free stage rect (docs/67 §2.4). The one source of
 * that rect is the host's `hud.freeStage` (core/useHudRoom: the largest empty
 * rectangle between the visible `[data-hud-panel]` blocks, `.atlas-stage`-local);
 * here it is moved into map-container coordinates and inset by GAP.
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
import type { HudStore } from '../../core/controls';
import type { FreeStage } from '../../core/hud-room';
import type { GeoCamera } from '../../core/types';

export type FrameRect = FreeStage;
/** Breathing room between a HUD block and the framed map, CSS px. */
export const GAP = 12;

/** Free rect of the 1920×1080 default layout (ww2: title / rail column, card + LAYERS column, chapter axis), CSS px. */
export const REF_FREE = { w: 810, h: 919 } as const;
/** The largest zoom-out for a small free rect (a 2.8× smaller map): beyond this the HUD, not the camera, has to give way. */
export const MAX_ZOOM_OUT = 1.5;
/** Re-fit easing after a HUD change (ms). */
export const REFIT_MS = 600;
/** WHOLE AREA / plate fits: margin inside the free rect, as a share of its shorter side. */
export const FIT_MARGIN = 0.08;
/** A plate may be zoomed to fill the stage when at least this share of its cropped axis stays on screen. */
export const PLATE_FILL_SHARE = 0.75;

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

const unitX = (lng: number) => (lng + 180) / 360;
const unitY = (lat: number) => 0.5 - Math.log(Math.tan(Math.PI / 4 + (Math.max(-85, Math.min(85, lat)) * Math.PI) / 360)) / (2 * Math.PI);
const lngOf = (x: number) => x * 360 - 180;
const latOf = (y: number) => (Math.atan(Math.sinh(Math.PI * (1 - 2 * y))) * 180) / Math.PI;

/**
 * A regional plate ends in a hard edge at `bounds`, so an authored camera may
 * not be shifted out past it: the zoom-out stops where the plate still fills
 * the canvas (a view framed wider than the plate stays as authored when filling
 * would crop the plate hard, as on a portrait screen), and the centre moves back until the canvas is on the
 * plate on every axis where it can fit. `visibleBottom` is where the free rect
 * ends: below it sit the caption card or chapter axis, and a subject near the
 * plate's south edge must not be pushed behind them to fill that strip.
 */
export function plateCamera(goal: { center: [number, number]; zoom: number }, authoredZoom: number, bounds: readonly [number, number, number, number], width: number, height: number, padding: PaddingOptions, visibleBottom = height): { center: [number, number]; zoom: number } {
  const [w, s, e, n] = bounds;
  const x0 = unitX(w), x1 = unitX(e), y0 = unitY(n), y1 = unitY(s);
  const fillPx = Math.max(width / (x1 - x0), visibleBottom / (y1 - y0));
  const fill = Math.log2(fillPx / 512);
  // At `fill` one axis is shown whole and the other is cropped by the aspect ratio alone: when that keeps most of the plate, even a wider authored view fills the stage.
  const shown = Math.min((width / fillPx) / (x1 - x0), (visibleBottom / fillPx) / (y1 - y0));
  const zoom = Math.max(goal.zoom, shown >= PLATE_FILL_SHARE ? fill : Math.min(authoredZoom, fill));
  const size = 512 * 2 ** zoom;
  const [cx, cy] = paddedCentre(width, height, { ...ZERO, ...padding });
  const clamp = (v: number, lo: number, hi: number) => (lo <= hi ? Math.min(hi, Math.max(lo, v)) : v);
  return {
    zoom,
    center: [
      lngOf(clamp(unitX(goal.center[0]), x0 + cx / size, x1 - (width - cx) / size)),
      latOf(clamp(unitY(goal.center[1]), y0 + cy / size, y1 - (visibleBottom - cy) / size)),
    ],
  };
}

export interface MapHudFraming {
  /** Where an authored camera goes now (padding + shifted zoom); it becomes the camera re-fits return to.
   * `free`: a fitted preset or the reader's own link, which may show the whole sheet. */
  target(camera: GeoCamera, options?: { free?: boolean }): { center: [number, number]; zoom: number; pitch: number; bearing: number; padding: PaddingOptions };
  /** A map zoom in authored units (for writing a reader's camera back to the store). */
  storedZoom(zoom: number): number;
  /** Padding for `cameraForBounds` (WHOLE AREA, the plate); convert its zoom with `storedZoom`. */
  fitPadding(margin?: number): PaddingOptions;
  /** The free rect (container px), as last measured. */
  rect(): FrameRect | null;
  /** Presentation hides the HUD (the host's rect then avoids only the presentation blocks): re-frame. */
  setPresentation(on: boolean): void;
  destroy(): void;
}

export interface MapHudFramingOptions {
  /** The host HUD store: `freeStage` is the measured free rect (absent: the whole canvas less GAP). */
  hud?: HudStore;
  /** Applied to the authored zoom before the shift (e.g. a reconstruction's max zoom). */
  clampZoom?(zoom: number): number;
  reducedMotion?: boolean;
  /** A regional plate's `bounds`: authored cameras stay on it (`plateCamera`). */
  plate?: readonly [number, number, number, number];
}

/** The host's stage-local free rect in container coordinates, inset by GAP and clipped to the canvas. */
export function containerFreeRect(free: FreeStage | null | undefined, stage: { left: number; top: number }, box: { left: number; top: number; width: number; height: number }): FrameRect {
  const r = free ?? { x0: 0, y0: 0, x1: box.width, y1: box.height };
  const dx = stage.left - box.left, dy = stage.top - box.top;
  return {
    x0: Math.max(0, r.x0 + dx) + GAP, y0: Math.max(0, r.y0 + dy) + GAP,
    x1: Math.min(box.width, r.x1 + dx) - GAP, y1: Math.min(box.height, r.y1 + dy) - GAP,
  };
}

export function createMapHudFraming(map: MlMap, container: HTMLElement, options: MapHudFramingOptions = {}): MapHudFraming {
  const clampZoom = options.clampZoom ?? ((z: number) => z);
  let alive = true, timer: ReturnType<typeof setTimeout> | null = null;
  let rect: FrameRect | null = null;
  let padding: PaddingOptions = { ...ZERO };
  let shift = 0;
  /** What the camera was last framed for (a running flight animates padding, so the map's own padding is not a reference). */
  let framed: { padding: PaddingOptions; shift: number } | null = null;
  /** The last authored camera applied (chapter / beat / preset / deep link). */
  let authored: GeoCamera | null = null;
  /** The reader has panned / zoomed since `authored`. */
  let userMoved = false;
  /** `authored` is a fitted preset or a reader's link: not held on the plate. */
  let freeCamera = false;
  /** The zoom the map settled at for `authored`: above the goal when minZoom or a plate's maxBounds floored it. */
  let settledZoom: number | null = null;
  const resize = new ResizeObserver(() => schedule());

  const measure = () => {
    const box = container.getBoundingClientRect();
    const stage = container.closest('.atlas-stage')?.getBoundingClientRect() ?? box;
    rect = containerFreeRect(options.hud?.getState().freeStage, stage, box);
    padding = mapHudPadding(box.width, box.height, rect);
    shift = frameZoomShift(box.width, box.height, rect);
    const sig = validRect(box.width, box.height, rect) ? [rect.x0, rect.y0, rect.x1, rect.y1].map(Math.round).join(',') : '';
    if (container.dataset.hudFrame !== sig) container.dataset.hudFrame = sig;
    return { width: box.width, height: box.height };
  };

  const goal = (camera: GeoCamera) => {
    const shifted = { center: [camera.center[0], camera.center[1]] as [number, number], zoom: clampZoom(camera.zoom) + shift };
    const box = container.getBoundingClientRect();
    const framed = options.plate && !freeCamera ? plateCamera(shifted, clampZoom(camera.zoom), options.plate, box.width, box.height, padding, rect ? Math.min(box.height, rect.y1 + GAP) : box.height) : shifted;
    return { ...framed, pitch: camera.pitch ?? 0, bearing: camera.bearing ?? 0, padding: { ...padding } };
  };

  const samePadding = (a: PaddingOptions, b: PaddingOptions) =>
    ['top', 'bottom', 'left', 'right'].every(k => Math.abs((a[k as keyof PaddingOptions] ?? 0) - (b[k as keyof PaddingOptions] ?? 0)) < 1);

  const refit = () => {
    timer = null;
    if (!alive) return;
    const { width, height } = measure();
    if (framed && samePadding(framed.padding, padding) && Math.abs(framed.shift - shift) < 0.01) return;
    framed = { padding: { ...padding }, shift };
    if (authored && !userMoved) {
      // Ease the authored view into the new free rect (a running flight is retargeted, not stacked).
      const next = goal(authored);
      if (options.reducedMotion) map.jumpTo(next);
      else map.easeTo({ ...next, duration: REFIT_MS, essential: true });
      return;
    }
    if (map.isMoving()) { framed = null; schedule(); return; }
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
  const onMoveEnd = () => {
    if (authored && !userMoved) settledZoom = map.getZoom();
    schedule();
  };
  map.on('movestart', onMoveStart);
  map.on('wheel', onWheel);
  map.on('moveend', onMoveEnd);
  resize.observe(container);
  // The host re-measures on every HUD change (blocks, folds, H, presentation, transitions); follow its rect.
  const unsubscribe = options.hud?.subscribe((s, p) => { if (s.freeStage !== p.freeStage) schedule(); });
  measure();

  return {
    target(camera, targetOptions) {
      measure();
      authored = camera;
      freeCamera = targetOptions?.free ?? false;
      userMoved = false;
      settledZoom = null;
      framed = { padding: { ...padding }, shift };
      return goal(camera);
    },
    // A pan leaves the zoom where it settled, so the authored zoom stands; subtracting the shift from a floored map zoom would invent a jump.
    storedZoom: (zoom) => (authored && settledZoom !== null && Math.abs(zoom - settledZoom) < 0.02 ? authored.zoom : Math.round((zoom - shift) * 100) / 100),
    fitPadding(margin) {
      const box = container.getBoundingClientRect();
      measure();
      return rect ? fitHudPadding(box.width, box.height, rect, margin, map.getPadding()) : { ...ZERO };
    },
    rect: () => rect,
    setPresentation() { schedule(); },
    destroy() {
      alive = false;
      if (timer) clearTimeout(timer);
      resize.disconnect();
      unsubscribe?.();
      map.off('movestart', onMoveStart);
      map.off('wheel', onWheel);
      map.off('moveend', onMoveEnd);
    },
  };
}
