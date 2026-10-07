import { describe, expect, it } from 'vitest';
import { buildMapStyle, BASE_LAYER_IDS } from '../src/theme/map-style';

const land = { type: 'FeatureCollection' as const, features: [] };

describe('buildMapStyle', () => {
  it('builds base layers from tokens without glyphs, sprites or tiles', () => {
    const style = buildMapStyle({ sources: { land, rivers: '/geo/rivers.geojson' }, tokens: { land: '#111', water: '#222', rivers: '#333' } });
    expect(style.version).toBe(8);
    expect(style.glyphs).toBeUndefined();
    expect(style.sprite).toBeUndefined();
    expect(Object.values(style.sources).every((s) => s.type === 'geojson')).toBe(true);
    const ids = style.layers.map((l) => l.id);
    expect(ids).toEqual([BASE_LAYER_IDS.background, BASE_LAYER_IDS.land, BASE_LAYER_IDS.landEdge, BASE_LAYER_IDS.rivers]);
  });

  it('adds a glow layer only when the theme has glow', () => {
    const style = buildMapStyle({ sources: { land, rivers: land }, tokens: { 'glow-strength': '1', 'glow-blur': '8px' } });
    expect(style.layers.map((l) => l.id)).toContain(BASE_LAYER_IDS.riversGlow);
  });
});
