/**
 * docs/38 §4.5–§4.6: the `scales` and `feathers` material families (semi-gloss
 * scales with their own normal and colour maps, matte feathers with a normal
 * map; both tinted per species) and the micrometre scale bar of a magnified
 * group (`5 µm · ×5000`: a lower-case µ and m, never µM).
 */
import { describe, expect, it } from 'vitest';
import { resolveMaterialLook } from '../../src/engines/space-scene/lib/color';
import { MATERIAL_PRESET_IDS } from '../../src/engines/space-scene/lib/presets';
import { formatLength, groupScaleBar } from '../../src/engines/space-scene/lib/units';
import { groupSchema } from '../../src/engines/space-scene/schema';

describe('scales and feathers', () => {
  it('are families with their own finish', () => {
    expect(MATERIAL_PRESET_IDS).toContain('scales');
    expect(MATERIAL_PRESET_IDS).toContain('feathers');
    const scales = resolveMaterialLook('scales', {}, 'paper');
    const feathers = resolveMaterialLook('feathers', {}, 'cinema');
    expect(scales).toMatchObject({ finish: 'scales', metalness: 0, roughness: 0.45 });
    expect(scales.normal).toBeGreaterThan(0);
    expect(feathers).toMatchObject({ finish: 'feathers', metalness: 0, roughness: 0.8 });
    expect(feathers.normal).toBeGreaterThan(0);
  });
  it('take a tint (the species colour)', () => {
    expect(resolveMaterialLook('scales', {}, 'paper', '#556b2f').color).toBe('#556b2f');
    expect(resolveMaterialLook('feathers', {}, 'paper', '#202020').color).toBe('#202020');
  });
});

describe('micrometres', () => {
  it('formats lengths under 0.1 mm in µm (lower case)', () => {
    expect(formatLength(0.005, 'um')).toBe('5 µm');
    expect(formatLength(0.05, 'mm')).toBe('50 µm');
    expect(formatLength(0.5, 'um')).toBe('500 µm');
    expect(formatLength(2, 'um')).toBe('2 MM');
    expect(formatLength(0.5, 'mm')).toBe('0.5 MM');
    expect(formatLength(20, 'cm')).toBe('2 CM');
  });
  it('a cell drawn 5000 × life size gets a µm bar', () => {
    // 1 scene unit = 1 m; at 2000 px per unit, 100 px is 0.05 m on the stage = 10 µm in life.
    const bar = groupScaleBar(2000, undefined, { unit: 'um', magnification: 5000 })!;
    expect(bar.label).toBe('10 µm · ×5000');
    expect(bar.px).toBeCloseTo(100, 6);
    expect(bar.label).not.toMatch(/µM/);
  });
  it('a group may say um', () => {
    expect(groupSchema.parse({ id: 'magnified', name: { en: 'Cells', zh: '细胞' }, color: 'token:ink', scale: { unit: 'um', magnification: 5000 } }).scale?.unit).toBe('um');
  });
});
