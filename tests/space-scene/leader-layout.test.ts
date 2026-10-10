import { describe, expect, it } from 'vitest';
import { columnEdges, layoutLeaders, LEADER, naturalSide, type LeaderFrame, type LeaderItem, type ScreenRect } from '../../src/engines/space-scene/lib/leader-layout';

/** A 1200 × 800 stage with HUD blocks at the left (title), right (card) and bottom (panels). */
const hudFrame = (): LeaderFrame => ({
  width: 1200,
  height: 800,
  left: 300,
  right: 880,
  top: 14,
  bottom: 640,
  obstacles: [
    { x0: 20, y0: 10, x1: 280, y1: 600 },
    { x0: 900, y0: 10, x1: 1180, y1: 640 },
    { x0: 20, y0: 652, x1: 1180, y1: 790 },
  ],
});

/** A 1600 × 900 stage with no HUD (presentation, cover). */
const openFrame = (): LeaderFrame => ({ width: 1600, height: 900, left: 14, right: 1586, top: 14, bottom: 886, obstacles: [] });

const item = (id: string, ax: number, ay: number, bounds: ScreenRect | null = null): LeaderItem => ({
  id,
  ax,
  ay,
  w: 150,
  h: 40,
  lead: 9,
  bounds,
  prev: null,
});

const inside = (a: ScreenRect, b: ScreenRect) => a.x0 < b.x1 && a.x1 > b.x0 && a.y0 < b.y1 && a.y1 > b.y0;

describe('leader columns', () => {
  it('sit no further out than 22 % / 78 % of an open stage and move in towards their anchors', () => {
    const f = openFrame();
    const far = columnEdges([item('a', 200, 400), item('b', 1400, 400)], f);
    expect(far.two).toBe(true);
    // Anchors near the edges: the columns go out to just beside them (never past the band edge).
    expect(far.L).toBe(200 - 2 * LEADER.ELBOW);
    expect(far.R).toBe(1400 + 2 * LEADER.ELBOW);
    expect(columnEdges([item('a', 100, 400)], f).L).toBe(f.left + 150);
    const near = columnEdges([item('a', 600, 400), item('b', 1000, 400)], f);
    expect(near.L).toBeCloseTo(1600 * LEADER.COLUMN_SHARE);
    expect(near.R).toBeCloseTo(1600 * (1 - LEADER.COLUMN_SHARE));
  });

  it('sit at the band edges when HUD blocks bound the band', () => {
    const f = hudFrame();
    const cols = columnEdges([item('a', 450, 300), item('b', 800, 300)], f);
    expect(cols.L).toBe(f.left + 150);
    expect(cols.R).toBe(f.right - 150);
  });

  it('take the anchor side by thirds, the nearer column in the middle third (with hysteresis)', () => {
    const f = openFrame();
    const cols = { L: 352, R: 1248 };
    expect(naturalSide(f, cols, 300)).toBe('L');
    expect(naturalSide(f, cols, 1300)).toBe('R');
    expect(naturalSide(f, cols, 700)).toBe('L');
    expect(naturalSide(f, cols, 900)).toBe('R');
    expect(naturalSide(f, cols, 805, 'L')).toBe('L');
    expect(naturalSide(f, cols, 795, 'R')).toBe('R');
  });
});

describe('layoutLeaders', () => {
  it('labels every anchor in a narrow HUD band: placards clear of the HUD, each other, the anchors and the other labelled parts', () => {
    const f = hudFrame();
    // Four parts across the band, two of them large (their bounds cover much of the band).
    const items = [
      item('big-left', 420, 250, { x0: 330, y0: 180, x1: 520, y1: 320 }),
      item('big-right', 760, 480, { x0: 640, y0: 400, x1: 860, y1: 600 }),
      item('small-a', 600, 330, { x0: 585, y0: 315, x1: 615, y1: 345 }),
      item('small-b', 820, 560, { x0: 810, y0: 550, x1: 830, y1: 570 }),
    ];
    const places = layoutLeaders(items, f);
    expect(places.map((p) => p.id).sort()).toEqual(['big-left', 'big-right', 'small-a', 'small-b']);
    for (const p of places) {
      const own = items.find((i) => i.id === p.id)!;
      expect(p.y0).toBeGreaterThanOrEqual(f.top);
      expect(p.y1).toBeLessThanOrEqual(f.bottom);
      for (const r of f.obstacles) expect(inside(p, { x0: r.x0 - 8, y0: r.y0 - 8, x1: r.x1 + 8, y1: r.y1 + 8 })).toBe(false);
      for (const q of places) if (q !== p) expect(inside(p, q)).toBe(false);
      for (const i of items) expect(i.ax > p.x0 && i.ax < p.x1 && i.ay > p.y0 && i.ay < p.y1).toBe(false);
      for (const i of items) if (i.id !== p.id && i.bounds) expect(inside(p, i.bounds)).toBe(false);
      // The anchor is beside the placard on its side; the leader is no longer than 35 % of the stage.
      if (p.side === 'L') expect(own.ax).toBeGreaterThan(p.x1);
      else expect(own.ax).toBeLessThan(p.x0);
      expect(Math.hypot(own.ax - p.ex, own.ay - p.sy)).toBeLessThanOrEqual(1200 * LEADER.MAX_LEADER_SHARE);
    }
  });

  it('puts placards in aligned columns level with their anchors on an open stage', () => {
    const f = openFrame();
    const items = [item('a', 500, 300, { x0: 450, y0: 260, x1: 560, y1: 340 }), item('b', 1100, 500, { x0: 1040, y0: 450, x1: 1180, y1: 560 })];
    const [a, b] = ['a', 'b'].map((id) => layoutLeaders(items, f).find((p) => p.id === id)!);
    expect(a!.side).toBe('L');
    expect(b!.side).toBe('R');
    const cols = columnEdges(items, f);
    expect(a!.x1).toBeCloseTo(cols.L);
    expect(b!.x0).toBeCloseTo(cols.R);
    expect(Math.abs(a!.sy - 300)).toBeLessThan(LEADER.STEP);
    expect(Math.abs(b!.sy - 500)).toBeLessThan(LEADER.STEP);
  });

  it('stacks placards of anchors at the same height without overlap, and keeps a placard where it was', () => {
    const f = openFrame();
    const items = [item('a', 400, 400), item('b', 410, 405), item('c', 420, 410)];
    const places = layoutLeaders(items, f);
    expect(places).toHaveLength(3);
    for (const p of places) for (const q of places) if (p !== q) expect(inside(p, q)).toBe(false);
    // Hysteresis: last frame's place wins over an equally good one.
    const again = layoutLeaders(
      items.map((i) => {
        const p = places.find((q) => q.id === i.id)!;
        return { ...i, prev: { side: p.side, x0: p.x0, y0: p.y0 } };
      }),
      f,
    );
    expect(again.map((p) => [p.id, p.x0, p.y0])).toEqual(places.map((p) => [p.id, p.x0, p.y0]));
  });

  it('leaves out a placard with no legal place (anchor boxed in by HUD blocks)', () => {
    const f: LeaderFrame = { ...openFrame(), obstacles: [{ x0: 0, y0: 0, x1: 1600, y1: 380 }, { x0: 0, y0: 420, x1: 1600, y1: 900 }] };
    expect(layoutLeaders([item('a', 800, 400)], f)).toEqual([]);
  });
});
