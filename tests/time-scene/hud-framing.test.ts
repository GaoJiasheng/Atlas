import { afterEach, describe, expect, it, vi } from 'vitest';
import type { Map as MlMap } from 'maplibre-gl';
import { createHudStore } from '../../src/engines/core/controls';
import { measureFreeStage } from '../../src/engines/core/hud-room';
import { containerFreeRect, createMapHudFraming, FIT_MARGIN, fitHudPadding, frameZoomShift, GAP, mapHudPadding, MAX_ZOOM_OUT, paddedCentre, REF_FREE, REFIT_MS, type FrameRect } from '../../src/engines/time-scene/lib/hud-framing';

// The free rect comes from the host (core/useHudRoom → hud.freeStage); the map adds its GAP inset.
const freeStageRect = (width: number, height: number, panels: readonly FrameRect[]) =>
  containerFreeRect(measureFreeStage(width, height, panels), { left: 0, top: 0 }, { left: 0, top: 0, width, height });

const zero = { left: 0, right: 0, top: 0, bottom: 0 };

describe('TimeScene HUD padding', () => {
  it.each([[1600, 900], [1920, 1080], [2560, 1440], [3840, 2160]])(
    'leaves centred free space unchanged at %i × %i (reader already outside canvas)', (w, h) => {
      const width = w - 400, height = h - 80;
      const rect = freeStageRect(width, height, [
        { x0: 16, y0: 20, x1: 240, y1: height - 20 },
        { x0: width - 240, y0: 20, x1: width - 16, y1: height - 20 },
        { x0: width, y0: 0, x1: w, y1: height },
      ]);
      expect(mapHudPadding(width, height, rect)).toEqual(zero);
    },
  );

  it.each([[624, 650], [880, 650], [1017, 703], [1200, 820]])(
    'projects the target to the free rectangle midpoint in a %i × %i canvas', (width, height) => {
      const rect = freeStageRect(width, height, [
        { x0: 12, y0: 20, x1: 240, y1: height - 40 },
        { x0: width - 150, y0: 20, x1: width - 12, y1: height - 40 },
        { x0: 0, y0: height - 30, x1: width, y1: height },
      ]);
      const p = mapHudPadding(width, height, rect);
      // MapLibre EdgeInsets.getCenter: (left + width - right) / 2, likewise y.
      expect((p.left! + width - p.right!) / 2).toBeCloseTo((rect.x0 + rect.x1) / 2);
      expect((p.top! + height - p.bottom!) / 2).toBeCloseTo((rect.y0 + rect.y1) / 2);
      expect(Math.min(p.left!, p.right!)).toBe(0);
      expect(Math.min(p.top!, p.bottom!)).toBe(0);
    },
  );

  it('handles either horizontal/vertical offset without symmetric padding', () => {
    expect(mapHudPadding(1000, 700, { x0: 300, x1: 900, y0: 100, y1: 650 }))
      .toEqual({ left: 200, right: 0, top: 50, bottom: 0 });
    expect(mapHudPadding(1000, 700, { x0: 100, x1: 700, y0: 50, y1: 600 }))
      .toEqual({ left: 0, right: 200, top: 0, bottom: 50 });
  });

  it('keeps portrait width and frames above a bottom drawer, below the title row', () => {
    const rect = freeStageRect(390, 844, [
      { x0: 12, y0: 80, x1: 170, y1: 200 },
      { x0: 0, y0: 600, x1: 390, y1: 844 },
    ]);
    expect(rect).toEqual({ x0: GAP, y0: 200 + GAP, x1: 390 - GAP, y1: 600 - GAP });
    expect(mapHudPadding(390, 844, rect)).toEqual({ left: 0, right: 0, top: 0, bottom: 44 });
  });

  it('moves the stage-local host rect into the map container and clips it', () => {
    expect(containerFreeRect({ x0: 100, y0: 0, x1: 900, y1: 700 }, { left: 0, top: 60 }, { left: 0, top: 60, width: 1000, height: 700 }))
      .toEqual({ x0: 112, y0: 12, x1: 888, y1: 688 });
    // A container offset inside the stage, and a host rect past its edge.
    expect(containerFreeRect({ x0: 0, y0: 0, x1: 1200, y1: 700 }, { left: 0, top: 0 }, { left: 50, top: 0, width: 1000, height: 700 }))
      .toEqual({ x0: 12, y0: 12, x1: 988, y1: 688 });
    expect(containerFreeRect(null, { left: 0, top: 0 }, { left: 0, top: 0, width: 800, height: 600 }))
      .toEqual({ x0: 12, y0: 12, x1: 788, y1: 588 });
  });

  it.each([
    [0, 700, { x0: 0, x1: 0, y0: 0, y1: 700 }],
    [1000, 0, { x0: 0, x1: 1000, y0: 0, y1: 0 }],
    [1000, 700, { x0: 600, x1: 400, y0: 12, y1: 688 }],
    [1000, 700, { x0: 12, x1: 988, y0: 400, y1: 300 }],
    [1000, 700, { x0: -10, x1: 988, y0: 12, y1: 688 }],
    [1000, 700, { x0: 12, x1: 1010, y0: 12, y1: 688 }],
    [NaN, 700, { x0: 12, x1: 988, y0: 12, y1: 688 }],
  ] as [number, number, FrameRect][])('falls back safely for unavailable/invalid space', (w, h, rect) => {
    expect(mapHudPadding(w, h, rect)).toEqual(zero);
  });
});

describe('TimeScene HUD zoom and fit', () => {
  const ref = (x0: number, y0: number, w: number, h: number): FrameRect => ({ x0, y0, x1: x0 + w, y1: y0 + h });

  it('keeps the authored zoom at the 1920 × 1080 reference free rect and anything larger', () => {
    // ww2 at 1920 × 1080: map canvas 1520 × 1023, free rect 340..1150 × 12..931.
    expect(frameZoomShift(1520, 1023, ref(340, 12, REF_FREE.w, REF_FREE.h))).toBe(0);
    expect(frameZoomShift(3000, 2000, ref(100, 100, 2400, 1700))).toBe(0);
  });

  it('zooms out by log2 of the tighter axis, at most MAX_ZOOM_OUT', () => {
    expect(frameZoomShift(1200, 1000, ref(0, 0, REF_FREE.w / 2, REF_FREE.h))).toBe(-1);
    expect(frameZoomShift(1200, 1000, ref(0, 0, REF_FREE.w, REF_FREE.h / 2))).toBe(-1);
    // 1180 × 820 iPad with today's LAYERS column: a 208 px gap would want −1.96.
    expect(frameZoomShift(780, 737, ref(274, 12, 208, 623))).toBe(-MAX_ZOOM_OUT);
    // Reader folded at 1180 × 820: 580 × 636.
    expect(frameZoomShift(1166, 737, ref(274, 12, 580, 636))).toBeCloseTo(Math.log2(Math.min(580 / REF_FREE.w, 636 / REF_FREE.h)), 2);
    expect(frameZoomShift(1000, 700, { x0: 600, x1: 400, y0: 12, y1: 688 })).toBe(0);
  });

  it('fits bounds into the free rect less a margin, centred on the bounds midpoint', () => {
    const width = 1520, height = 1023, rect = ref(340, 12, 810, 919);
    for (const current of [zero, mapHudPadding(width, height, rect)]) {
      const p = fitHudPadding(width, height, rect, FIT_MARGIN, current);
      // MapLibre subtracts both the map's padding and these from the canvas.
      const room = width - current.left! - current.right! - p.left! - p.right!;
      const roomY = height - current.top! - current.bottom! - p.top! - p.bottom!;
      const m = Math.round(810 * FIT_MARGIN);
      expect(room).toBeCloseTo(810 - 2 * m);
      expect(roomY).toBeCloseTo(919 - 2 * m);
      expect(p.left).toBe(p.right);
      expect(p.top).toBe(p.bottom);
    }
    const p = fitHudPadding(1000, 700, ref(100, 50, 600, 500), 0);
    expect(p).toEqual({ left: 200, right: 200, top: 100, bottom: 100 });
  });

  it('puts the padded centre at the free rect centre', () => {
    const rect = ref(274, 12, 580, 636);
    expect(paddedCentre(1166, 737, mapHudPadding(1166, 737, rect))).toEqual([(rect.x0 + rect.x1) / 2, (rect.y0 + rect.y1) / 2]);
  });
});

describe('TimeScene HUD framing lifecycle', () => {
  afterEach(() => { vi.unstubAllGlobals(); vi.useRealTimers(); });

  function setup() {
    vi.useFakeTimers();
    const resizes: (() => void)[] = [];
    let current = { ...zero };
    const hud = createHudStore();
    // Host rect (stage-local): between a 250 px plate column and the overlay's 150 px card.
    hud.setState({ freeStage: { x0: 250, y0: 0, x1: 850, y1: 700 } });
    const stage = { getBoundingClientRect: () => ({ left: 0, top: 0, width: 1000, height: 700 }) };
    const container = { dataset: {} as Record<string, string>, closest: () => stage, getBoundingClientRect: () => ({ left: 0, top: 0, width: 1000, height: 700 }) };
    const disconnect = vi.fn();
    vi.stubGlobal('ResizeObserver', class {
      constructor(cb: () => void) { resizes.push(cb); }
      observe() {} unobserve() {} disconnect = disconnect;
    });
    const handlers = new Map<string, (e: object) => void>();
    const map = {
      on: vi.fn((event: string, fn: (e: object) => void) => handlers.set(event, fn)), off: vi.fn(),
      isMoving: () => false, getPadding: () => current, getZoom: vi.fn(() => 5),
      easeTo: vi.fn((o: { padding: typeof zero }) => { current = o.padding; }),
      jumpTo: vi.fn((o: { padding: typeof zero }) => { current = o.padding; }),
      unproject: vi.fn(([x, y]: [number, number]) => ({ lng: x / 10, lat: y / 10 })),
    };
    const framing = createMapHudFraming(map as unknown as MlMap, container as unknown as HTMLElement, { hud });
    const settle = () => vi.advanceTimersByTime(200);
    const free = (x0: number, y0: number, x1: number, y1: number) => hud.setState({ freeStage: { x0, y0, x1, y1 } });
    return { framing, map, hud, free, resizes, disconnect, settle, handlers, container };
  }
  const authored = { center: [10, 20] as [number, number], zoom: 5 };

  it('frames an authored camera in the host rect; H / presentation re-frame when the host rect changes', () => {
    const s = setup();
    // Free rect 262..838: 576 px wide → padding left 100, zoom out.
    const t = s.framing.target(authored);
    expect(t.padding).toEqual({ ...zero, left: 100 });
    expect(t.zoom).toBeCloseTo(5 + Math.max(-MAX_ZOOM_OUT, Math.log2(Math.min(576 / REF_FREE.w, 676 / REF_FREE.h))), 1);
    expect(s.container.dataset.hudFrame).toBe('262,12,838,688');
    // H: the host drops the faded HUD, the rect is the whole canvas.
    s.free(0, 0, 1000, 700); s.settle();
    expect(s.map.easeTo).toHaveBeenLastCalledWith(expect.objectContaining({ padding: zero, center: [10, 20], duration: REFIT_MS }));
    // Presentation: only the caption card at the bottom.
    s.free(0, 0, 1000, 600); s.framing.setPresentation(true); s.settle();
    expect(s.map.easeTo).toHaveBeenLastCalledWith(expect.objectContaining({ padding: { ...zero, bottom: 100 } }));
    s.framing.destroy();
    expect(s.disconnect).toHaveBeenCalledTimes(1);
    expect(s.map.off).toHaveBeenCalledWith('moveend', expect.any(Function));
    // Unsubscribed: later host changes do nothing.
    s.free(300, 0, 1000, 700); s.settle();
    expect(s.map.easeTo).toHaveBeenCalledTimes(2);
  });

  it('eases the authored view into a changed free rect once per settle, and not again when nothing changed', () => {
    const s = setup();
    s.framing.target(authored);
    // Host re-measures without moving the rect (a new object, same numbers) leave the flight alone.
    s.free(250, 0, 850, 700); s.resizes[0]!(); s.settle();
    expect(s.map.easeTo).not.toHaveBeenCalled();
    s.free(350, 0, 850, 700); s.free(350, 0, 850, 700); s.settle();
    expect(s.map.easeTo).toHaveBeenCalledTimes(1);
    expect(s.map.easeTo.mock.calls[0]![0]).toMatchObject({ center: [10, 20], padding: { ...zero, left: 200 } });
    s.handlers.get('moveend')!({}); s.settle();
    expect(s.map.easeTo).toHaveBeenCalledTimes(1);
  });

  it('leaves the reader\'s own view still after a pan or wheel zoom, moving only the padding', () => {
    const s = setup();
    s.framing.target(authored);
    s.handlers.get('movestart')!({ originalEvent: {} });
    s.free(350, 0, 850, 700); s.settle();
    expect(s.map.easeTo).not.toHaveBeenCalled();
    // Free rect 362..838: new padding left 200 → its centre (600, 350) keeps the geography on screen there.
    expect(s.map.unproject).toHaveBeenCalledWith([600, 350]);
    expect(s.map.jumpTo).toHaveBeenLastCalledWith({ center: { lng: 60, lat: 35 }, padding: { ...zero, left: 200 } });
    // The next chapter / beat / preset is framed again.
    s.framing.target(authored);
    s.handlers.get('wheel')!({});
    s.free(250, 0, 850, 700); s.settle();
    expect(s.map.easeTo).not.toHaveBeenCalled();
  });

  it('keeps the authored zoom after a pan when the map settled above its goal (dinosaur-earth: 1.1 must not become 1.6)', () => {
    const s = setup();
    s.free(262, 0, 838, 676);
    s.settle();
    const t = s.framing.target(authored);
    expect(t.zoom).toBeLessThan(authored.zoom);
    const floored = t.zoom + 0.6;
    s.map.getZoom = vi.fn(() => floored);
    s.handlers.get('moveend')!({});
    s.handlers.get('movestart')!({ originalEvent: {} });
    s.handlers.get('moveend')!({});
    expect(s.framing.storedZoom(floored)).toBe(authored.zoom);
    // A real zoom still converts through the shift.
    expect(s.framing.storedZoom(t.zoom + 1)).toBeCloseTo(authored.zoom + 1, 1);
  });

  it('writes back zoom in authored units', () => {
    const s = setup();
    const t = s.framing.target(authored);
    expect(s.framing.storedZoom(t.zoom)).toBeCloseTo(5, 2);
  });
});
