import { describe, expect, it } from 'vitest';
import {
  MATERIAL_PRESET_IDS,
  parseCssColor,
  PRESET_PALETTE,
  resolveDataColor,
  resolveMaterialLook,
  rgbaToHex,
} from '../../src/engines/space-scene/lib/color';
import { MATERIAL_PRESETS } from '../../src/engines/space-scene/schema';

const paperTokens = { 'accent-1': '#a63d2f', 'accent-2': '#2f6f8f', glow: 'transparent', accent: '#33407a' };
const cinemaTokens = { 'accent-1': '#ff6a3d', 'accent-2': '#3dc6ff', glow: 'rgba(255, 150, 90, 0.65)' };

describe('parseCssColor', () => {
  it('parses hex, rgb(a) and transparent', () => {
    expect(parseCssColor('#fff')).toEqual({ r: 1, g: 1, b: 1, a: 1 });
    expect(rgbaToHex(parseCssColor('#A63D2F')!)).toBe('#a63d2f');
    expect(parseCssColor('#00000080')!.a).toBeCloseTo(128 / 255);
    const glow = parseCssColor('rgba(255, 150, 90, 0.65)')!;
    expect(rgbaToHex(glow)).toBe('#ff965a');
    expect(glow.a).toBeCloseTo(0.65);
    expect(parseCssColor('transparent')).toEqual({ r: 0, g: 0, b: 0, a: 0 });
    expect(parseCssColor('rgb(0 128 255)')).not.toBeNull();
    expect(parseCssColor('')).toBeNull();
    expect(parseCssColor('var(--x)')).toBeNull();
  });
});

describe('resolveDataColor', () => {
  it('resolves tokens against the current theme values', () => {
    expect(resolveDataColor('token:accent-1', paperTokens, 'paper')).toBe('#a63d2f');
    expect(resolveDataColor('token:accent-1', cinemaTokens, 'cinema')).toBe('#ff6a3d');
    expect(resolveDataColor('token:glow', cinemaTokens, 'cinema')).toBe('#ff965a');
  });
  it('passes hex through and falls back for unknown tokens', () => {
    expect(resolveDataColor('#123456', paperTokens, 'paper')).toBe('#123456');
    expect(resolveDataColor('token:nope', paperTokens, 'paper', '#888888')).toBe('#888888');
  });
  it('maps material presets to the per-theme palette (aliases included)', () => {
    expect(resolveDataColor('casing', {}, 'paper')).toBe(PRESET_PALETTE.paper.casing);
    expect(resolveDataColor('metal', {}, 'cinema')).toBe(PRESET_PALETTE.cinema.steel);
    expect(resolveDataColor('matte', {}, 'paper')).toBe(PRESET_PALETTE.paper.plastic);
    expect(PRESET_PALETTE.paper.plastic).not.toBe(PRESET_PALETTE.cinema.plastic);
  });
  it('knows every preset the schema allows', () => {
    expect([...MATERIAL_PRESET_IDS]).toEqual([...MATERIAL_PRESETS]);
  });
});

describe('resolveMaterialLook', () => {
  it('gives every family its own finish', () => {
    const look = (ref: string) => resolveMaterialLook(ref, paperTokens, 'paper');
    expect(look('casing')).toMatchObject({ finish: 'brushed', metalness: 0.8 });
    expect(look('stainless').finish).toBe('brushed-axial');
    expect(look('powder')).toMatchObject({ finish: 'peel' });
    expect(look('powder').metalness).toBeGreaterThanOrEqual(0.45);
    expect(look('powder').roughness).toBeGreaterThanOrEqual(0.48);
    expect(look('rubber')).toMatchObject({ metalness: 0, roughness: 0.78 });
    expect(look('plastic').metalness).toBe(0);
    expect(look('metal')).toEqual(look('steel'));
    expect(look('matte')).toEqual(look('plastic'));
  });
  it('plastic is not the default grey', () => {
    const c = parseCssColor(resolveMaterialLook('plastic', paperTokens, 'paper').color)!;
    expect(Math.max(c.r, c.g, c.b) - Math.min(c.r, c.g, c.b)).toBeGreaterThan(0.05);
  });
  it('tokens become a satin paint in the theme colour', () => {
    expect(resolveMaterialLook('token:accent-2', cinemaTokens, 'cinema')).toMatchObject({ color: '#3dc6ff', opacity: 1, finish: 'grain' });
  });
  it('glass is see-through in both themes', () => {
    expect(resolveMaterialLook('glass', paperTokens, 'paper').opacity).toBeLessThan(1);
    expect(resolveMaterialLook('glass', cinemaTokens, 'cinema').opacity).toBeLessThan(1);
  });
});

describe('enamel, brass and tints', () => {
  it('enamel is a warm, non-metal white a step darker than the paper', () => {
    const look = resolveMaterialLook('enamel', paperTokens, 'paper');
    expect(look.metalness).toBe(0);
    const c = parseCssColor(look.color)!;
    const paper = parseCssColor('#e9e4d8')!;
    expect(c.r).toBeGreaterThan(c.b);
    expect(c.r + c.g + c.b).toBeLessThan(paper.r + paper.g + paper.b - 0.1);
    expect(c.r + c.g + c.b).toBeGreaterThan(2.2);
  });
  it('brass is a yellow metal', () => {
    const look = resolveMaterialLook('brass', paperTokens, 'paper');
    const c = parseCssColor(look.color)!;
    expect(look.metalness).toBeGreaterThan(0.8);
    expect(c.r).toBeGreaterThan(c.b + 0.2);
  });
  it('a tint replaces the family colour and keeps its finish', () => {
    const plain = resolveMaterialLook('powder', paperTokens, 'paper');
    const grey = resolveMaterialLook('powder', paperTokens, 'paper', '#c4c6c2');
    expect(grey).toEqual({ ...plain, color: '#c4c6c2' });
    expect(resolveMaterialLook('powder', paperTokens, 'paper', 'token:accent-1').color).toBe('#a63d2f');
  });
});

