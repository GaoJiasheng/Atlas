/** Static GPU sources for year-dated points, lines and areas; no HTML markers or per-frame source rebuilds. */
import type { FeatureCollection } from 'geojson';
import type { ExpressionSpecification, LayerSpecification, Map as MlMap } from 'maplibre-gl';
import type { DatedLayerDef } from '../../../../content/schema/topic';
import type { ThemeTokens } from '../../../../theme/theme';
import { datedLayerFilter, datedLayerState, indexDatedLayer, type DatedLayerIndex } from '../../lib/datedLayers';
import { LAYER } from './style';

export interface DatedLayerStats {
  mode?: 'dated' | 'reference';
  sourceUpdates?: number;
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
  const filter = def.temporal?.mode === 'reference' ? ['all'] as ExpressionSpecification : datedLayerFilter(t);
  if (def.kind === 'point') {
    const radius: ExpressionSpecification = def.encoding ? ['interpolate', ['linear'], ['get', 'mag'], 6, 2, 9.5, 8] : ['interpolate', ['linear'], ['zoom'], 9, 1.2, 14, 3];
    return [
      { id: id('point'), source, type: 'circle', filter, paint: { 'circle-radius': radius, 'circle-color': color, 'circle-opacity': 0.85 } },
      ...(def.temporal?.mode !== 'reference' && def.recent !== false ? [{ id: id('recent'), source, type: 'circle', filter: datedLayerFilter(t, true), paint: { 'circle-radius': ['interpolate', ['linear'], ['zoom'], 9, 2.2, 14, 4], 'circle-color': color, 'circle-stroke-color': tokens.signal, 'circle-stroke-width': 0.8 } } as LayerSpecification] : []),
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
  setSelected(id: string | null): void;
  setTheme(tokens: ThemeTokens, color: string): void;
  stats(): DatedLayerStats;
}

/** Install above control / movements and below events; repaint and re-filter only on their respective changes. */
export function createDatedMapLayer(map: MlMap, def: DatedLayerDef, collection: FeatureCollection, tokens: ThemeTokens, color: string, t: number, preparedIndex?: DatedLayerIndex): DatedMapLayer {
  const index = preparedIndex ?? indexDatedLayer(collection, def);
  let state = datedLayerState(index, t);
  let filterUpdates = 0;
  let visible: boolean | null = null;
  let currentTokens = tokens;
  let currentColor = color;
  const layers = datedLayerStyles(def, tokens, color, t);
  if (def.catalogue) {
    const source = `ts-dated-${def.id}`;
    const filter: ExpressionSpecification = ['==', ['get', 'id'], ''];
    layers.push(def.kind === 'point' ? { id: `${source}-selected`, source, type: 'circle', filter, paint: { 'circle-radius': 9, 'circle-color': tokens.signal, 'circle-opacity': 0.15, 'circle-stroke-color': tokens.signal, 'circle-stroke-width': 2 } } : { id: `${source}-selected`, source, type: 'line', filter, paint: { 'line-color': tokens.signal, 'line-width': 3 } });
  }
  let selected: string | null = null;
  let currentTime = t;
  const selectedFilter = (): ExpressionSpecification => {
    const id: ExpressionSpecification = ['==', ['get', 'id'], selected ?? ''];
    return def.temporal?.mode === 'reference' ? id : ['all', id, datedLayerFilter(currentTime)];
  };
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
      if (baseChanged || (def.kind === 'point' && def.recent !== false && recentChanged)) {
        for (const layer of datedLayerStyles(def, currentTokens, currentColor, nextTime)) {
          const isRecent = layer.id.endsWith('-recent');
          if (isRecent ? recentChanged : baseChanged) {
            map.setFilter(layer.id, 'filter' in layer ? layer.filter : undefined);
            filterUpdates++;
          }
        }
      }
      currentTime = nextTime;
      if (def.catalogue && selected && baseChanged) {
        map.setFilter(`ts-dated-${def.id}-selected`, selectedFilter());
        filterUpdates++;
      }
      state = next;
    },
    setSelected(id) {
      if (!def.catalogue || id === selected) return;
      selected = id;
      map.setFilter(`ts-dated-${def.id}-selected`, selectedFilter());
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
      if (def.catalogue) {
        map.setPaintProperty(`ts-dated-${def.id}-selected`, def.kind === 'point' ? 'circle-stroke-color' : 'line-color', nextTokens.signal);
        if (def.kind === 'point') map.setPaintProperty(`ts-dated-${def.id}-selected`, 'circle-color', nextTokens.signal);
      }
      for (const layer of datedLayerStyles(def, nextTokens, nextColor, t)) {
        if (!('paint' in layer) || !layer.paint) continue;
        for (const [key, value] of Object.entries(layer.paint)) map.setPaintProperty(layer.id, key, value);
      }
    },
    stats: () => ({ mode: def.temporal?.mode ?? 'dated', sourceUpdates: 1, total: index.total, visible: visible === false ? 0 : state.visible, recent: visible !== false && def.kind === 'point' ? state.recent : 0, filterUpdates }),
  };
}
