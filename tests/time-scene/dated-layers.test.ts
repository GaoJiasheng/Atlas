import { describe, expect, it, vi } from 'vitest';
import { validateStyleMin } from '@maplibre/maplibre-gl-style-spec';
import type { FeatureCollection } from 'geojson';
import type { Map as MlMap } from 'maplibre-gl';
import type { DatedLayerDef } from '../../src/content/schema/topic';
import type { ThemeTokens } from '../../src/theme/theme';
import { datedAt, numericDatedWindow } from '../../src/engines/time-scene/lib/dated';
import { datedLayerFilter, datedLayerState, decodeDatedLayer, indexDatedLayer } from '../../src/engines/time-scene/lib/datedLayers';
import { createDatedMapLayer, datedLayerStyles } from '../../src/engines/time-scene/stages/geo/datedLayers';
import { LAYER } from '../../src/engines/time-scene/stages/geo/style';

const points = (dates: { f: number; u?: number }[]): FeatureCollection => ({
  type: 'FeatureCollection',
  features: dates.map((properties) => ({ type: 'Feature', properties, geometry: { type: 'Point', coordinates: [103.82, 1.35] } })),
});
const def: DatedLayerDef = { id: 'blocks', file: 'sample-blocks', kind: 'point', label: { en: 'Blocks', zh: '楼宇' }, holder: 'housing', count: true };
const tokens = { signal: 'signal', ink: 'ink' } as ThemeTokens;
const mapMock = () => ({ addSource: vi.fn(), addLayer: vi.fn(), setFilter: vi.fn(), setLayoutProperty: vi.fn(), setPaintProperty: vi.fn() });

describe('dated layer dates and counts', () => {
  it('decodes only the requested object, including an empty geometry collection', () => {
    const topology = { type: 'Topology' as const, objects: { blocks: { type: 'GeometryCollection' as const, geometries: [] } }, arcs: [] };
    expect(decodeDatedLayer(topology, 'blocks')).toEqual({ type: 'FeatureCollection', features: [] });
    expect(decodeDatedLayer(topology, 'missing')).toBeNull();
  });

  it('shares the half-open interval convention, including open ends and fractional years', () => {
    const index = indexDatedLayer(points([{ f: 1960.5 }, { f: 1959, u: 1960.5 }, { f: 1960.5, u: 1960.75 }]));
    expect(index.starts).toEqual([1959, 1960.5, 1960.5]);
    expect(datedLayerState(index, 1958).visible).toBe(0);
    expect(datedLayerState(index, 1959).visible).toBe(1);
    expect(datedLayerState(index, 1960.5).visible).toBe(2);
    expect(datedLayerState(index, 1960.75).visible).toBe(1);
    expect(datedLayerState(index, 2025).visible).toBe(1);
    expect(datedLayerState(indexDatedLayer(points([])), 1960).visible).toBe(0);
  });

  it('a replacement at equal count changes the visible-set signature', () => {
    const index = indexDatedLayer(points([{ f: 1959, u: 1980 }, { f: 1980 }]));
    const before = datedLayerState(index, 1979.9);
    const after = datedLayerState(index, 1980);
    expect(before.visible).toBe(after.visible);
    expect(before.signature).not.toBe(after.signature);
    expect(datedLayerState(index, 1980.5).signature).toBe(after.signature);
    expect(datedLayerState(index, 1979.9).signature).toBe(before.signature);
  });

  it('new points stop at their expiry or at f + 1, with an exclusive lower bound', () => {
    const index = indexDatedLayer(points([{ f: 1980 }, { f: 1980, u: 1980.5 }, { f: 1981 }]));
    expect(datedLayerState(index, 1980).recent).toBe(2);
    expect(datedLayerState(index, 1980.5).recent).toBe(1);
    expect(datedLayerState(index, 1981).recent).toBe(1);
    expect(datedLayerState(index, 1982).recent).toBe(0);
  });

  it('10,000 unsorted windows agree with dated.ts in both directions', () => {
    const dates = Array.from({ length: 10_000 }, (_, i) => ({ f: 1960 + (i % 60), ...(i % 4 === 0 ? { u: 2020 + (i % 5) } : {}) })).reverse();
    const index = indexDatedLayer(points(dates));
    const windows = dates.map(({ f, u }) => numericDatedWindow(f, u));
    expect(index.total).toBe(10_000);
    for (const t of [1959, 1960, 1980.5, 2020, 2025, 2020, 1960]) {
      const state = datedLayerState(index, t);
      expect(state.visible).toBe(datedAt(windows, t).length);
      expect(state.recent).toBe(datedAt(windows, t).filter((w) => w.from > t - 1).length);
    }
  });

  it('GPU filters use numeric dates, exclusive u and exclusive recent lower bound', () => {
    const filter = ['all', ['<=', ['get', 'f'], 1980.5], ['>', ['coalesce', ['get', 'u'], 1e9], 1980.5]];
    expect(datedLayerFilter(1980.5)).toEqual(filter);
    expect(datedLayerFilter(1980.5, true)).toEqual(['all', filter, ['>', ['get', 'f'], 1979.5]]);
  });
});

describe('dated GPU layers', () => {
  it('all layer styles pass MapLibre expression and style validation', () => {
    for (const kind of ['point', 'line', 'area'] as const) {
      const layers = datedLayerStyles({ ...def, kind }, { ...tokens, signal: '#abcdef' }, '#123456', 1980);
      const issues = validateStyleMin({ version: 8, sources: { 'ts-dated-blocks': { type: 'geojson', data: points([]) } }, layers });
      expect(issues.map((issue) => issue.message)).toEqual([]);
    }
  });
  it('installs one static source below events and changes filters only across boundaries', () => {
    const map = mapMock();
    const data = points([{ f: 1959, u: 1960 }, { f: 1960 }]);
    const layer = createDatedMapLayer(map as unknown as MlMap, def, data, tokens, 'holder-colour', 1959.25);
    expect(map.addSource).toHaveBeenCalledOnce();
    expect(map.addSource).toHaveBeenCalledWith('ts-dated-blocks', { type: 'geojson', data, tolerance: 0.05 });
    expect(map.addLayer).toHaveBeenCalledTimes(2);
    expect(map.addLayer.mock.calls.every(([, before]) => before === LAYER.eventRing)).toBe(true);
    layer.update(1959.5);
    expect(map.setFilter).not.toHaveBeenCalled();
    layer.update(1960);
    expect(map.setFilter).toHaveBeenCalledTimes(2);
    layer.update(1960.5);
    expect(map.setFilter).toHaveBeenCalledTimes(2);
    layer.update(1961);
    expect(map.setFilter).toHaveBeenCalledTimes(3);
    expect(map.setFilter.mock.lastCall?.[0]).toBe('ts-dated-blocks-recent');
    expect(layer.stats()).toMatchObject({ total: 2, visible: 1, recent: 0, filterUpdates: 3, sourceUpdates: 1 });
    expect(map.addSource).toHaveBeenCalledOnce();
  });

  it('visibility and theme updates preserve the static source and date filters', () => {
    const map = mapMock();
    const layer = createDatedMapLayer(map as unknown as MlMap, def, points([{ f: 1959 }]), tokens, 'paper-holder', 1960);
    layer.setVisible(false);
    layer.setVisible(false);
    expect(map.setLayoutProperty).toHaveBeenCalledTimes(2);
    expect(layer.stats()).toMatchObject({ total: 1, visible: 0, recent: 0 });
    layer.setVisible(true);
    expect(map.setLayoutProperty).toHaveBeenCalledTimes(4);
    expect(layer.stats()).toMatchObject({ total: 1, visible: 1 });
    const cinema = { ...tokens, signal: 'cinema-signal' };
    layer.setTheme(cinema, 'cinema-holder');
    expect(map.setPaintProperty).toHaveBeenCalledWith('ts-dated-blocks-recent', 'circle-stroke-color', 'cinema-signal');
    expect(map.setPaintProperty).toHaveBeenCalledWith('ts-dated-blocks-point', 'circle-color', 'cinema-holder');
    const paints = map.setPaintProperty.mock.calls.length;
    layer.setTheme(cinema, 'cinema-holder');
    expect(map.setPaintProperty).toHaveBeenCalledTimes(paints);
    expect(map.setFilter).not.toHaveBeenCalled();
    expect(map.addSource).toHaveBeenCalledOnce();
  });

  it('areas use a faint fill and distinct solid / approximate dashed boundaries', () => {
    const layers = datedLayerStyles({ ...def, kind: 'area' }, tokens, 'holder-colour', 1980);
    expect(layers).toHaveLength(3);
    expect(layers[0]).toMatchObject({ type: 'fill', paint: { 'fill-color': 'holder-colour', 'fill-opacity': ['case', ['==', ['get', 'certainty'], 'approximate'], 0.35 * 0.7, 0.35] } });
    expect(layers[1]).toMatchObject({ filter: ['all', datedLayerFilter(1980), ['!=', ['get', 'certainty'], 'approximate']], paint: { 'line-width': 0.6 } });
    expect(layers[2]).toMatchObject({ filter: ['all', datedLayerFilter(1980), ['==', ['get', 'certainty'], 'approximate']], paint: { 'line-dasharray': [3, 2] } });
  });

  it('lines grow at island zoom with token colour and high opacity, without a recent-point overlay', () => {
    const layers = datedLayerStyles({ ...def, kind: 'line' }, tokens, 'rail-colour', 1980);
    expect(layers).toHaveLength(1);
    expect(layers[0]).toMatchObject({ type: 'line', filter: datedLayerFilter(1980), paint: { 'line-color': 'rail-colour', 'line-width': ['interpolate', ['linear'], ['zoom'], 10, 1, 13, 2.5], 'line-opacity': 0.9 } });
  });
});
