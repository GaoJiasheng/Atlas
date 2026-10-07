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
  it('maps material presets to the per-theme palette', () => {
    expect(resolveDataColor('metal', {}, 'paper')).toBe(PRESET_PALETTE.paper.metal);
    expect(resolveDataColor('metal', {}, 'cinema')).toBe(PRESET_PALETTE.cinema.metal);
    expect(PRESET_PALETTE.paper.copper).not.toBe(PRESET_PALETTE.cinema.copper);
  });
  it('knows every preset the schema allows', () => {
    expect([...MATERIAL_PRESET_IDS]).toEqual([...MATERIAL_PRESETS]);
  });
});

describe('resolveMaterialLook', () => {
  it('paper is matte, cinema is metallic', () => {
    expect(resolveMaterialLook('plastic', paperTokens, 'paper')).toMatchObject({ metalness: 0.05, roughness: 0.85 });
    expect(resolveMaterialLook('token:accent-2', cinemaTokens, 'cinema')).toMatchObject({
      color: '#3dc6ff',
      metalness: 0.6,
      roughness: 0.35,
      opacity: 1,
    });
  });
  it('glass is see-through in both themes', () => {
    expect(resolveMaterialLook('glass', paperTokens, 'paper').opacity).toBeLessThan(1);
    expect(resolveMaterialLook('glass', cinemaTokens, 'cinema').opacity).toBeLessThan(1);
  });
});
