/** Enlarged-window borders (`views.insets`, docs/58 F4): frame geometry and the authored contract. */
import { describe, expect, it } from 'vitest';
import { insetRect } from '../../src/engines/space-scene/lib/insets';
import { partsFile } from '../../src/engines/space-scene/schema';
import topic from '../../src/content/topics/eyes-and-ears/data/parts.json';
import { partBounds } from '../../src/engines/space-scene/lib/parts';

const box = (x0: number, y0: number, x1: number, y1: number, shown = true, onScreen = true) => ({ x0, y0, x1, y1, shown, onScreen });

describe('insetRect', () => {
  it('frames the union of the parts on show, padded', () => {
    expect(insetRect([box(100, 200, 150, 260), box(140, 180, 220, 230)], 800, 600, 10)).toEqual({ x: 90, y: 170, w: 140, h: 100 });
  });
  it('ignores hidden and off-screen parts and is null when none is on show', () => {
    expect(insetRect([box(100, 200, 150, 260), box(0, 0, 700, 500, false)], 800, 600, 0)).toEqual({ x: 100, y: 200, w: 50, h: 60 });
    expect(insetRect([box(0, 0, 10, 10, true, false), undefined], 800, 600)).toBeNull();
    expect(insetRect([], 800, 600)).toBeNull();
  });
  it('stays inside the stage', () => {
    const r = insetRect([box(-50, -20, 900, 640)], 800, 600)!;
    expect(r.x).toBeGreaterThanOrEqual(0);
    expect(r.y).toBeGreaterThanOrEqual(0);
    expect(r.x + r.w).toBeLessThanOrEqual(800);
    expect(r.y + r.h).toBeLessThanOrEqual(600);
  });
});

describe('views.insets contract', () => {
  it('rejects unknown or context parts', () => {
    const raw = structuredClone(topic) as any;
    raw.views.insets = [{ id: 'x', parts: ['no-such-part'], label: { en: 'A', zh: '甲' } }];
    expect(partsFile.safeParse(raw).success).toBe(false);
    raw.views.insets = [{ id: 'x', parts: ['iris-aperture-small'], label: { en: 'A', zh: '甲' } }];
    expect(partsFile.safeParse(raw).success).toBe(false);
  });
  it('eyes-and-ears frames its hair-cell window clear of the middle ear', () => {
    const file = partsFile.parse(topic);
    const inset = file.views.insets!.find((i) => i.id === 'hair-cell-window')!;
    expect(inset.label.en).toMatch(/different scale/);
    expect(inset.label.zh).toContain('非同一比例');
    const parts = (ids: string[]) => ids.map((id) => partBounds(file.parts.find((p) => p.id === id)!)!);
    const window = parts(inset.parts), ear = parts(['eardrum', 'malleus', 'incus', 'stapes', 'oval-window', 'eustachian-tube', 'cochlea-shell']);
    const top = Math.max(...window.map((b) => b.max[1]!)), left = Math.min(...window.map((b) => b.min[0]!));
    // Entirely below the middle ear and the cochlea, and right of the Eustachian tube.
    for (const b of ear) expect(top < b.min[1]! || left > b.max[0]!, JSON.stringify(b)).toBe(true);
  });
});
