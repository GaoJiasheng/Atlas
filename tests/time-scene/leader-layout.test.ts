import { describe, expect, it } from 'vitest';
import { LEADER_REACH, placeLeaders, type LeaderBand, type LeaderInput } from '../../src/engines/time-scene/lib/leader-layout';

const band: LeaderBand = { left: 340, right: 1002, top: 14, bottom: 590, u: 1, obstacles: [{ x: 16, y: 10, w: 300, h: 70 }] };
const item = (key: string, sx: number, sy: number, over: Partial<LeaderInput> = {}): LeaderInput => ({ key, w: 168, h: 50, sx, sy, side: null, ...over });

describe('placeLeaders', () => {
  it('keeps a placard beside an anchor far from its column', () => {
    const slot = placeLeaders([item('a', 452, 299)], band, 1024, 768).get('a')!;
    const run = slot.side === 'R' ? slot.x - 452 : 452 - (slot.x + slot.w);
    expect(run).toBeGreaterThan(0);
    expect(run).toBeLessThanOrEqual(LEADER_REACH);
  });

  it('uses the other side when the near side has no room', () => {
    const slot = placeLeaders([item('a', 169, 474)], band, 1024, 768).get('a')!;
    expect(slot.side).toBe('R');
    expect(slot.x - 169).toBeLessThanOrEqual(LEADER_REACH);
  });

  it('keeps placards off each other and off other anchors', () => {
    const anchors = [item('a', 500, 300), item('b', 505, 320), item('c', 620, 310), item('d', 470, 340)];
    const slots = [...placeLeaders(anchors, band, 1024, 768).entries()].filter(([, s]) => s);
    expect(slots.length).toBeGreaterThanOrEqual(3);
    for (const [k, s] of slots) {
      for (const [l, o] of slots) if (k !== l) expect(s!.x < o!.x + o!.w && s!.x + s!.w > o!.x && s!.y < o!.y + o!.h && s!.y + s!.h > o!.y).toBe(false);
      for (const a of anchors) if (a.key !== k) expect(a.sx > s!.x && a.sx < s!.x + s!.w && a.sy > s!.y && a.sy < s!.y + s!.h).toBe(false);
    }
  });

  it('never covers a HUD panel and hides off-stage anchors', () => {
    const out = placeLeaders([item('a', 200, 40), item('off', -10, 40)], band, 1024, 768);
    expect(out.get('off')).toBeNull();
    const s = out.get('a');
    if (s) expect(s.y >= 80 || s.x >= 316).toBe(true);
  });
});
