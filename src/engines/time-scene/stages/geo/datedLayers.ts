/** Static GPU sources for year-dated points, lines and areas; no HTML markers or per-frame source rebuilds. */
import type { FeatureCollection } from 'geojson';
import type { ExpressionSpecification, LayerSpecification, Map as MlMap } from 'maplibre-gl';
import type { DatedLayerDef } from '../../../../content/schema/topic';
import type { ThemeTokens } from '../../../../theme/theme';
import { datedLayerFilter, datedLayerState, indexDatedLayer, type DatedLayerIndex } from '../../lib/datedLayers';
import { LAYER } from './style';

export interface DatedLayerStats {
  total: number;
  visible: number;
  recent: number;
  /** Actual `setFilter` calls since load; useful when verifying playback stays cached. */
  filterUpdates: number;
}

const approximate: ExpressionSpecification = ['==', ['get', 'certainty'], 'approximate'];
const certain: ExpressionSpecification = ['!=', ['get', 'certainty'], 'approximate'];

/** One source per definition; a small fixed number of draw layers regardless of the feature count. */
export function datedLayerStyles(def: DatedLayerDef, tokens: ThemeTokens, color: string, t: number): LayerSpecification[] {
  const source = `ts-dated-${def.id}`;
  const id = (part: string) => `${source}-${part}`;
  const filter = datedLayerFilter(t);
  if (def.kind === 'point') {
    const radius: ExpressionSpecification = ['interpolate', ['linear'], ['zoom'], 9, 1.2, 14, 3];
    return [
      { id: id('point'), source, type: 'circle', filter, paint: { 'circle-radius': radius, 'circle-color': color, 'circle-opacity': 0.85 } },
      { id: id('recent'), source, type: 'circle', filter: datedLayerFilter(t, true), paint: { 'circle-radius': ['interpolate', ['linear'], ['zoom'], 9, 2.2, 14, 4], 'circle-color': color, 'circle-stroke-color': tokens.signal, 'circle-stroke-width': 0.8 } },
    ];
  }
  if (def.kind === 'line') return [
    { id: id('line'), source, type: 'line', filter, layout: { 'line-join': 'round' }, paint: { 'line-color': color, 'line-width': ['interpolate', ['linear'], ['zoom'], 10, 1, 13, 2.5], 'line-opacity': 0.9 } },
  ];
  return [
    { id: id('fill'), source, type: 'fill', filter, paint: { 'fill-color': color, 'fill-opacity': ['case', approximate, 0.35 * 0.7, 0.35] } },
    { id: id('edge'), source, type: 'line', filter: ['all', filter, certain], layout: { 'line-join': 'round' }, paint: { 'line-color': color, 'line-width': 0.6 } },
    { id: id('dash'), source, type: 'line', filter: ['all', filter, approximate], layout: { 'line-join': 'round' }, paint: { 'line-color': color, 'line-width': 0.6, 'line-dasharray': [3, 2] } },
  ];
}

export interface DatedMapLayer {
  id: string;
  def: DatedLayerDef;
  index: DatedLayerIndex;
  update(t: number): void;
  setVisible(on: boolean): void;
  setTheme(tokens: ThemeTokens, color: string): void;
  stats(): DatedLayerStats;
}

/** Install above control / movements and below events; repaint and re-filter only on their respective changes. */
export function createDatedMapLayer(map: MlMap, def: DatedLayerDef, collection: FeatureCollection, tokens: ThemeTokens, color: string, t: number): DatedMapLayer {
  const index = indexDatedLayer(collection);
  let state = datedLayerState(index, t);
  let filterUpdates = 0;
  let visible: boolean | null = null;
  let currentTokens = tokens;
  let currentColor = color;
  const layers = datedLayerStyles(def, tokens, color, t);
  map.addSource(`ts-dated-${def.id}`, { type: 'geojson', data: collection, tolerance: 0.05 });
  for (const layer of layers) map.addLayer(layer, LAYER.eventRing);
  return {
    id: def.id,
    def,
    index,
    update(nextTime) {
      const next = datedLayerState(index, nextTime);
      const baseChanged = next.signature !== state.signature;
      const recentChanged = next.recentSignature !== state.recentSignature;
      if (baseChanged || (def.kind === 'point' && recentChanged)) {
        for (const layer of datedLayerStyles(def, currentTokens, currentColor, nextTime)) {
          const isRecent = layer.id.endsWith('-recent');
          if (isRecent ? recentChanged : baseChanged) {
            map.setFilter(layer.id, 'filter' in layer ? layer.filter : undefined);
            filterUpdates++;
          }
        }
      }
      state = next;
    },
    setVisible(on) {
      if (visible === on) return;
      visible = on;
      for (const layer of layers) map.setLayoutProperty(layer.id, 'visibility', on ? 'visible' : 'none');
    },
    setTheme(nextTokens, nextColor) {
      if (currentTokens === nextTokens && currentColor === nextColor) return;
      currentTokens = nextTokens;
      currentColor = nextColor;
      for (const layer of datedLayerStyles(def, nextTokens, nextColor, t)) {
        if (!('paint' in layer) || !layer.paint) continue;
        for (const [key, value] of Object.entries(layer.paint)) map.setPaintProperty(layer.id, key, value);
      }
    },
    stats: () => ({ total: index.total, visible: visible === false ? 0 : state.visible, recent: visible !== false && def.kind === 'point' ? state.recent : 0, filterUpdates }),
  };
}
