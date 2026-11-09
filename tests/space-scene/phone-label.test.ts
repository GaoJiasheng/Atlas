import { describe, expect, it } from 'vitest';
import { segmentThroughRect, type LeaderFrame, type LeaderItem, type LeaderPlace, type ScreenRect } from '../../src/engines/space-scene/lib/leader-layout';
import { beatFocusPart, phoneTarget, placePhoneLabel, PHONE_TARGET } from '../../src/engines/space-scene/lib/phone-label';

/** A 390 × 844 presentation: the title block at the top, the caption card at the bottom. */
const title: ScreenRect = { x0: 28, y0: 24, x1: 262, y1: 96 };
const caption: ScreenRect = { x0: 24, y0: 640, x1: 366, y1: 820 };
const portrait = (over: Partial<LeaderFrame> = {}): LeaderFrame => ({ width: 390, height: 844, left: 14, right: 376, top: 14, bottom: 830, obstacles: [title, caption], ...over });

const item = (ax: number, ay: number, bounds: ScreenRect | null = null, over: Partial<LeaderItem> = {}): LeaderItem => ({ id: 'focus', ax, ay, w: 130, h: 30, lead: 9, bounds, prev: null, ...over });

const clear = (a: ScreenRect, b: ScreenRect) => a.x1 <= b.x0 || a.x0 >= b.x1 || a.y1 <= b.y0 || a.y0 >= b.y1;
const targetOf = (p: LeaderPlace) => phoneTarget(p.x0, p.y0, p.x1 - p.x0, p.y1 - p.y0);

describe('beatFocusPart', () => {
  it('takes the beat\'s part first', () => {
    expect(beatFocusPart({ part: 'cochlea', labels: ['ear-drum'] })).toBe('cochlea');
  });
  it('falls back to the first label when the part is absent or null', () => {
    expect(beatFocusPart({ labels: ['ear-drum', 'cochlea'] })).toBe('ear-drum');
    expect(beatFocusPart({ part: null, labels: ['ear-drum'] })).toBe('ear-drum');
  });
  it('never promotes a group label, and does not look further down the list', () => {
    expect(beatFocusPart({ labels: ['group:ear', 'cochlea'] })).toBeNull();
  });
  it('is null when the beat names nothing', () => {
    expect(beatFocusPart({})).toBeNull();
    expect(beatFocusPart({ part: null, labels: [] })).toBeNull();
    expect(beatFocusPart(null)).toBeNull();
    expect(beatFocusPart(undefined)).toBeNull();
  });
});

describe('phoneTarget', () => {
  it('grows a small placard to 44 × 44 around its middle', () => {
    const t = phoneTarget(100, 200, 20, 16);
    expect(t.x1 - t.x0).toBe(PHONE_TARGET);
    expect(t.y1 - t.y0).toBe(PHONE_TARGET);
    expect((t.y0 + t.y1) / 2).toBe(208);
  });
  it('covers a large placard with a margin', () => {
    const t = phoneTarget(100, 200, 130, 50);
    expect(t).toEqual({ x0: 96, y0: 196, x1: 234, y1: 254 });
  });
});

describe('placePhoneLabel', () => {
  it('finds a place and keeps the touch target clear of the focus and the HUD, inside the safe band', () => {
    const focus = { x0: 150, y0: 340, x1: 240, y1: 430 };
    const f = portrait();
    const p = placePhoneLabel(item(195, 385, focus), f)!;
    expect(p).not.toBeNull();
    const t = targetOf(p);
    expect(t.x1 - t.x0).toBeGreaterThanOrEqual(PHONE_TARGET);
    expect(t.y1 - t.y0).toBeGreaterThanOrEqual(PHONE_TARGET);
    expect(clear(t, focus)).toBe(true);
    for (const r of f.obstacles) expect(clear(t, r)).toBe(true);
    expect(t.x0).toBeGreaterThanOrEqual(f.left);
    expect(t.x1).toBeLessThanOrEqual(f.right);
    expect(t.y0).toBeGreaterThanOrEqual(f.top);
    expect(t.y1).toBeLessThanOrEqual(f.bottom);
  });

  it('sits above or below a part as wide as the stage, the leader leaving the facing edge', () => {
    const focus = { x0: 20, y0: 340, x1: 370, y1: 430 };
    const p = placePhoneLabel(item(195, 385, focus), portrait())!;
    expect(p.sx).toBe(p.ex);
    expect(p.y1 <= 340 || p.y0 >= 430).toBe(true);
    expect(p.sy === p.y1 + 2 || p.sy === p.y0 - 2).toBe(true);
  });

  it('runs the leader clear of every HUD block', () => {
    const block = { x0: 150, y0: 300, x1: 376, y1: 360 };
    const f = portrait({ obstacles: [title, caption, block] });
    const p = placePhoneLabel(item(300, 380, { x0: 290, y0: 370, x1: 310, y1: 390 }), f)!;
    expect(p).not.toBeNull();
    for (const r of f.obstacles) {
      expect(segmentThroughRect(p.sx, p.sy, p.ex, p.sy, r, 0)).toBe(false);
      expect(segmentThroughRect(p.ex, p.sy, 300, 380, r, 0)).toBe(false);
    }
  });

  it('gives no label when the anchor is under a HUD block or outside the safe band', () => {
    expect(placePhoneLabel(item(195, 700), portrait())).toBeNull();
    expect(placePhoneLabel(item(5, 300), portrait())).toBeNull();
  });

  it('gives no label when the focus leaves no room for the target', () => {
    const focus = { x0: 0, y0: 0, x1: 390, y1: 844 };
    expect(placePhoneLabel(item(195, 385, focus), portrait({ obstacles: [] }))).toBeNull();
  });

  it('gives no label when the placard is wider than the band', () => {
    expect(placePhoneLabel(item(195, 385, null, { w: 400 }), portrait())).toBeNull();
  });

  it('gives no label when the only free spots need too long a leader', () => {
    // Only the strip at the very top is free, far from an anchor at the foot of the stage.
    const focus = { x0: 0, y0: 90, x1: 390, y1: 830 };
    expect(placePhoneLabel(item(195, 800, focus), portrait({ obstacles: [] }))).toBeNull();
  });

  it('asks the barrier rule about the whole touch target', () => {
    const seen: ScreenRect[] = [];
    const f = portrait({
      accept: (place) => {
        seen.push(place);
        return false;
      },
    });
    expect(placePhoneLabel(item(195, 385, { x0: 170, y0: 360, x1: 220, y1: 410 }), f)).toBeNull();
    expect(seen.length).toBeGreaterThan(0);
    for (const r of seen) {
      expect(r.x1 - r.x0).toBeGreaterThanOrEqual(PHONE_TARGET);
      expect(r.y1 - r.y0).toBeGreaterThanOrEqual(PHONE_TARGET);
    }
  });

  it('works in a short landscape stage', () => {
    const f: LeaderFrame = { width: 740, height: 360, left: 14, right: 726, top: 14, bottom: 346, obstacles: [{ x0: 28, y0: 24, x1: 300, y1: 90 }, { x0: 24, y0: 270, x1: 716, y1: 340 }] };
    const focus = { x0: 340, y0: 120, x1: 420, y1: 240 };
    const p = placePhoneLabel(item(380, 180, focus), f)!;
    expect(p).not.toBeNull();
    const t = targetOf(p);
    expect(clear(t, focus)).toBe(true);
    for (const r of f.obstacles) expect(clear(t, r)).toBe(true);
  });

  it('keeps its place while nothing has changed', () => {
    const focus = { x0: 150, y0: 340, x1: 240, y1: 430 };
    const first = placePhoneLabel(item(195, 385, focus), portrait())!;
    const again = placePhoneLabel(item(195, 385, focus, { prev: { side: first.side, x0: first.x0, y0: first.y0 } }), portrait())!;
    expect(again.x0).toBe(first.x0);
    expect(again.y0).toBe(first.y0);
  });
});
