import { afterEach, describe, expect, it, vi } from 'vitest';
import type { Map as MlMap } from 'maplibre-gl';
import { freeStageRect, type FrameRect } from '../../src/engines/time-scene/lib/free-rect';
import { createMapHudFraming, mapHudPadding } from '../../src/engines/time-scene/lib/hud-framing';

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

  it('keeps portrait width and accounts for a bottom drawer', () => {
    const rect = freeStageRect(390, 844, [
      { x0: 12, y0: 80, x1: 170, y1: 200 },
      { x0: 0, y0: 600, x1: 390, y1: 844 },
    ]);
    expect(mapHudPadding(390, 844, rect)).toEqual({ left: 0, right: 0, top: 0, bottom: 244 });
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

describe('TimeScene HUD layout lifecycle', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('leaves unopted topics without observers or layout reads', () => {
    const framing = createMapHudFraming({} as MlMap, {} as HTMLElement);
    expect(framing.padding()).toEqual(zero);
    framing.setPresentation(true);
    framing.destroy();
  });

  function setup() {
    const frames: FrameRequestCallback[] = [];
    const resizes: (() => void)[] = [];
    const mutations: (() => void)[] = [];
    class Panel {
      isConnected = true;
      children: Panel[] = [];
      constructor(public kind: string, public rect: FrameRect, public visibility = 'visible') {}
      getAttribute(name: string) { return name === 'data-hud-panel' ? this.kind : null; }
      getBoundingClientRect() {
        const r = this.rect;
        return { left: r.x0, right: r.x1, top: r.y0, bottom: r.y1, width: r.x1 - r.x0, height: r.y1 - r.y0 };
      }
    }
    let hud = 'on', moving = false, current = { ...zero };
    const panels = [
      new Panel('plate', { x0: 0, x1: 250, y0: 0, y1: 700 }),
      new Panel('overlay', { x0: 600, x1: 1000, y0: 0, y1: 700 }),
      new Panel('reader', { x0: 1000, x1: 1400, y0: 0, y1: 700 }),
      new Panel('perf', { x0: 500, x1: 1000, y0: 0, y1: 700 }),
      new Panel('card', { x0: 400, x1: 1000, y0: 0, y1: 700 }, 'hidden'),
      new Panel('present', { x0: 0, x1: 1000, y0: 600, y1: 700 }, 'hidden'),
    ];
    panels[1]!.children = [new Panel('control', { x0: 850, x1: 1000, y0: 0, y1: 700 })];
    const scene = {
      getAttribute: () => hud, querySelectorAll: () => panels,
      addEventListener: vi.fn(), removeEventListener: vi.fn(),
    };
    const container = { closest: () => scene, getBoundingClientRect: () => ({ left: 0, top: 0, width: 1000, height: 700 }) };
    const disconnect = vi.fn();
    vi.stubGlobal('ResizeObserver', class {
      constructor(cb: () => void) { resizes.push(cb); }
      observe() {} unobserve() {} disconnect = disconnect;
    });
    vi.stubGlobal('MutationObserver', class {
      constructor(cb: () => void) { mutations.push(cb); }
      observe() {} disconnect = disconnect;
    });
    vi.stubGlobal('document', {});
    vi.stubGlobal('getComputedStyle', (el: Panel) => ({ visibility: el.visibility }));
    vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => { frames.push(cb); return frames.length; });
    vi.stubGlobal('cancelAnimationFrame', vi.fn());
    const map = {
      on: vi.fn(), off: vi.fn(), isMoving: () => moving, getPadding: () => current,
      setPadding: vi.fn((p: typeof zero) => { current = p; }),
    };
    const framing = createMapHudFraming(map as unknown as MlMap, container as unknown as HTMLElement, true);
    const flush = () => { while (frames.length) frames.shift()!(0); };
    return { framing, map, panels, resizes, mutations, disconnect, flush,
      hideHud: () => { hud = 'off'; }, moving: (on: boolean) => { moving = on; } };
  }

  it('uses actual overlay children, excludes reader/perf/hidden panels, resets for H and measures presentation', () => {
    const s = setup();
    expect(s.framing.padding()).toEqual({ ...zero, left: 100 });
    s.hideHud(); s.mutations[1]!(); s.flush();
    expect(s.map.setPadding).toHaveBeenLastCalledWith(zero);
    s.panels[5]!.visibility = 'visible';
    s.framing.setPresentation(true); s.flush();
    expect(s.framing.padding()).toEqual({ ...zero, bottom: 100 });
    s.framing.destroy();
    expect(s.disconnect).toHaveBeenCalledTimes(3);
    expect(s.map.off).toHaveBeenCalledWith('moveend', expect.any(Function));
  });

  it('defers padding updates during a flight/gesture and changes no geographic camera on resize', () => {
    const s = setup();
    s.map.setPadding.mockClear();
    s.moving(true);
    s.panels[0]!.rect.x1 = 300;
    s.resizes[0]!(); s.flush();
    expect(s.map.setPadding).not.toHaveBeenCalled();
    expect(s.framing.padding()).toEqual({ ...zero, left: 150 });
    s.moving(false);
    s.map.on.mock.calls.find(([event]) => event === 'moveend')![1](); s.flush();
    expect(s.map.setPadding).toHaveBeenCalledExactlyOnceWith({ ...zero, left: 150 });
    s.resizes[0]!(); s.flush();
    expect(s.map.setPadding).toHaveBeenCalledTimes(1);
    s.framing.destroy();
  });
});
