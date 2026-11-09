import { leaderClearOfInsets } from '../../src/engines/space-scene/lib/insets';
import { describe, expect, it } from 'vitest';
import * as LEADER from '../../src/engines/space-scene/lib/leader-layout';
import { BAND_GAP, columnEdges, energyBarsRect, freeBand, layoutLeaders, MIN_BAND, naturalSide, noteLines, type LeaderFrame, type LeaderItem, type ScreenRect } from '../../src/engines/space-scene/lib/leader-layout';

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

const overlapArea = (a: ScreenRect, b: ScreenRect) => Math.max(0, Math.min(a.x1, b.x1) - Math.max(a.x0, b.x0)) * Math.max(0, Math.min(a.y1, b.y1) - Math.max(a.y0, b.y0));

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

describe('magnified inset borders', () => {
  it('moves outside labels and both leader segments away from the dashed window', () => {
    const inset = {x0:250,y0:260,x1:450,y1:480};
    const f = {...openFrame(),accept:(p:any,i:LeaderItem)=>leaderClearOfInsets(p,i.ax,i.ay,[inset])};
    const anchor = item('ear',500,400);
    const places = layoutLeaders([anchor],f);
    expect(places).toHaveLength(1);
    for (const p of places) {
      expect(inside(p,inset)).toBe(false);
      // Independently sample both segments, including their endpoints.
      for (let t=0; t<=1; t+=0.01) {
        for (const [x,y] of [[p.sx+(p.ex-p.sx)*t,p.sy],[p.ex+(anchor.ax-p.ex)*t,p.sy+(anchor.ay-p.sy)*t]]) {
          expect(x! >= inset.x0 && x! <= inset.x1 && y! >= inset.y0 && y! <= inset.y1).toBe(false);
        }
      }
    }
  });
  it('labels a part inside its window either wholly inside it or from outside, never across the frame', () => {
    const anchor = item('hair-cell',500,400);
    const roomy = {x0:250,y0:200,x1:800,y1:600};
    expect(leaderClearOfInsets({id:'hair-cell',side:'L',x0:300,x1:450,y0:380,y1:420,sx:456,ex:472,sy:389},anchor.ax,anchor.ay,[roomy])).toBe(true);
    // A window too small for the placard (the 1024 × 768 hair-cell case): the label stays, outside.
    for (const inset of [roomy,{x0:490,y0:390,x1:510,y1:410}]) {
      const places = layoutLeaders([anchor],{...openFrame(),accept:(p,i)=>leaderClearOfInsets(p,i.ax,i.ay,[inset])});
      expect(places).toHaveLength(1);
      const p = places[0]!;
      const within = p.x0 > inset.x0 && p.x1 < inset.x1 && p.y0 > inset.y0 && p.y1 < inset.y1;
      if (!within) {
        expect(inside(p,{x0:inset.x0-LEADER.PAD,y0:inset.y0-LEADER.PAD-16,x1:inset.x1+LEADER.PAD,y1:inset.y1+LEADER.PAD})).toBe(false);
        for (let t=0; t<=1; t+=0.01) {
          const x = p.sx+(p.ex-p.sx)*t;
          expect(x > inset.x0 && x < inset.x1 && p.sy > inset.y0 && p.sy < inset.y1).toBe(false);
        }
      }
    }
    // A placard straddling the border is never legal.
    expect(leaderClearOfInsets({id:'hair-cell',side:'L',x0:230,x1:380,y0:380,y1:420,sx:386,ex:402,sy:389},anchor.ax,anchor.ay,[roomy])).toBe(false);
  });
  it('keeps placards and both leader segments off the measured frame title', () => {
    const inset = {x0:400,y0:300,x1:700,y1:500}, title = {x0:402,y0:283,x1:640,y1:298};
    // The diagonal leg from an upper-left placard into the window would cut the title line.
    const p = {id:'hair-cell',side:'L' as const,x0:200,x1:350,y0:240,y1:280,sx:356,ex:372,sy:249};
    expect(leaderClearOfInsets(p,620,340,[inset])).toBe(true);
    expect(leaderClearOfInsets(p,620,340,[inset],[title])).toBe(false);
    // Entering past the title's end is legal.
    const q = {id:'hair-cell',side:'R' as const,x0:720,x1:870,y0:220,y1:260,sx:714,ex:690,sy:229};
    expect(leaderClearOfInsets(q,680,340,[inset],[title])).toBe(true);
  });
  it('keeps the leader of a part outside every window out of all of them', () => {
    const p = {id:'ear',side:'L' as const,x0:100,x1:250,y0:380,y1:420,sx:256,ex:272,sy:389};
    expect(leaderClearOfInsets(p,700,400,[{x0:400,y0:300,x1:600,y1:500}])).toBe(false);
    expect(leaderClearOfInsets(p,700,400,[{x0:400,y0:450,x1:600,y1:600}])).toBe(true);
  });
  it('rejects an intermediate glide across a moving frame even when the destination is legal', async () => {
    const anchor = item('ear',500,400);
    const inset = {x0:250,y0:260,x1:450,y1:480};
    const p = layoutLeaders([anchor],{...openFrame(),accept:(p,i)=>leaderClearOfInsets(p,i.ax,i.ay,[inset])})[0]!;
    expect(leaderClearOfInsets(p,anchor.ax,anchor.ay,[inset])).toBe(true);
    expect(leaderClearOfInsets({...p,x0:300,x1:450,y0:380,y1:420,sy:389,sx:456,ex:472},anchor.ax,anchor.ay,[inset])).toBe(false);
  });
});

describe('free band', () => {
  it('leaves a presentation title as an obstacle, however wide it is (768 x 1024)', () => {
    const band = freeBand([{ x0: 22, y0: 19, x1: 370, y1: 73 }, { x0: 24, y0: 861, x1: 744, y1: 1005 }], 768, 1024);
    expect(band.left).toBe(LEADER.EDGE);
    expect(band.right).toBe(768 - LEADER.EDGE);
    expect(band.bottom).toBe(861 - 12);
    expect(band.right - band.left).toBeGreaterThanOrEqual(MIN_BAND);
  });

  it('is closed by a column of stacked cards, not by a floating card beside it (1440 x 900 reading view)', () => {
    const left = [{ x0: 22, y0: 60, x1: 262, y1: 152 }, { x0: 22, y0: 168, x1: 262, y1: 301 }, { x0: 22, y0: 574, x1: 262, y1: 786 }];
    const right = [{ x0: 754, y0: 16, x1: 1018, y1: 331 }, { x0: 754, y0: 340, x1: 1018, y1: 786 }];
    const band = freeBand([...left, ...right, { x0: 22, y0: 797, x1: 1018, y1: 843 }], 1040, 854);
    expect(band.left).toBe(262 + BAND_GAP);
    expect(band.right).toBe(754 - BAND_GAP);
    expect(band.right - band.left).toBeGreaterThanOrEqual(MIN_BAND);
  });

  it('takes the edge the blocks actually fill, not a shorter card further in (1024 x 768)', () => {
    const tab = { x0: 580, y0: 16, x1: 624, y1: 300 };
    const floating = { x0: 338, y0: 16, x1: 558, y1: 182 };
    const band = freeBand([tab, floating], 624, 703);
    expect(band.right).toBe(580 - BAND_GAP);
  });
});

describe('energy readout and focus part', () => {
  it('keeps a placard and, when it can, its leader off a readout', () => {
    const avoid = [energyBarsRect({ x: 560, y: 440, top: 352 }, 1440, 900)];
    const places = layoutLeaders([item('toy', 760, 450)], { ...openFrame(), avoid });
    expect(places).toHaveLength(1);
    expect(inside(places[0]!, avoid[0]!)).toBe(false);
  });

  it('keeps the readout rectangle on the stage with the block', () => {
    const r = energyBarsRect({ x: 10, y: 880, top: 800 }, 1440, 900);
    expect(r.x0).toBe(2);
    expect(r.y1).toBeLessThanOrEqual(900);
    expect(r.y0).toBe(800);
  });

  it('moves a placard off the focus part sooner than off another part', () => {
    const focus: ScreenRect = { x0: 500, y0: 300, x1: 1100, y1: 600 };
    const items = (on: boolean) => [{ ...item('big', 800, 450, focus), focus: on }, item('small', 460, 450, { x0: 440, y0: 430, x1: 480, y1: 470 })];
    const place = (on: boolean) => layoutLeaders(items(on), openFrame()).find((p) => p.id === 'small')!;
    expect(overlapArea(place(true), focus)).toBeLessThanOrEqual(overlapArea(place(false), focus));
    expect(overlapArea(place(true), focus)).toBe(0);
  });
});

describe('placard notes', () => {
  it('keeps a short note on one line', () => {
    expect(noteLines('Holds the gut.', 'en')).toEqual(['Holds the gut.']);
    expect(noteLines('', 'en')).toEqual([]);
  });

  it('breaks between words and never mid-word', () => {
    const lines = noteLines('Carries heat between the bath and the handle of the spoon', 'en');
    expect(lines).toHaveLength(2);
    for (const line of lines) {
      expect(line.length).toBeLessThanOrEqual(34);
      for (const word of line.replace('…', '').split(' ')) expect('Carries heat between the bath and the handle of the spoon').toContain(word);
    }
    expect(lines.join(' ')).toBe('Carries heat between the bath and the handle of the spoon');
  });

  it('ends an over-long note after a whole word', () => {
    const lines = noteLines('Holds the legs and wings; has a large muscle block that beats the wings hundreds of times every second', 'en');
    expect(lines).toHaveLength(2);
    expect(lines[1]!.endsWith('…')).toBe(true);
    expect(lines[1]!.length).toBeLessThanOrEqual(34);
    expect(' Holds the legs and wings; has a large muscle block that beats the wings hundreds of times every second ').toContain(` ${lines[1]!.slice(0, -1)} `);
  });

  it('fills two lines of Chinese', () => {
    const lines = noteLines('一二三四五六七八九十一二三四五六七八九十一二三四五六七八九十一二三四五六七八九十', 'zh');
    expect(lines).toHaveLength(2);
    expect(lines[0]).toHaveLength(18);
    expect(lines[1]!.endsWith('…')).toBe(true);
  });
});
