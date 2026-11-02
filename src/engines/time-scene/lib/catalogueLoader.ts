/** Geometry and reader text have separate lifetimes; selection needs both. */
import type { FeatureCollection } from 'geojson';
import type { DatedLayerDef } from '../../../content/schema/topic';
import type { CatalogueEntry, CatalogueIndex } from '../catalogueSchema';
import type { CatalogueLayer } from './catalogue';

export function createCatalogueLoader(
  definitions: readonly DatedLayerDef[],
  fetchEntries: (def: DatedLayerDef) => Promise<CatalogueEntry[]>,
  notify: (layers: CatalogueLayer[]) => void,
) {
  const layers = new Map<string, CatalogueLayer>();
  const geometryReady = new Set<string>();
  const textReady = new Set<string>();
  const requested = new Set<string>();
  let disposed = false;
  const publish = () => { if (!disposed) notify([...layers.values()].map((layer) => ({ ...layer }))); };
  const ensure = (id: string) => {
    let layer = layers.get(id);
    const def = definitions.find((def) => def.id === id);
    if (!layer && def) {
      layer = { id, def, status: 'loading', geometryStatus: 'loading', entries: [], features: { type: 'FeatureCollection', features: [] } };
      layers.set(id, layer);
    }
    return layer;
  };
  const update = (layer: CatalogueLayer) => {
    if (layer.status !== 'error' && geometryReady.has(layer.id) && (!layer.def.catalogue || textReady.has(layer.id))) layer.status = 'ready';
    publish();
  };
  const request = (id: string) => {
    const layer = ensure(id);
    if (!layer?.def.catalogue || requested.has(id) || disposed || layer.status === 'error') return;
    requested.add(id);
    publish();
    void fetchEntries(layer.def).then((entries) => {
      if (disposed) return;
      layer.entries = entries;
      textReady.add(id);
      update(layer);
    }).catch(() => {
      if (disposed) return;
      layer.status = 'error';
      publish();
    });
  };
  return {
    startGeometry(id: string) { ensure(id); publish(); },
    geometryReady(id: string, features: FeatureCollection) {
      const layer = ensure(id);
      if (!layer) return;
      layer.features = features;
      layer.geometryStatus = 'ready';
      geometryReady.add(id);
      update(layer);
    },
    geometryError(id: string) {
      const layer = ensure(id);
      if (layer) { layer.status = 'error'; layer.geometryStatus = 'error'; publish(); }
    },
    request,
    requestIndex(index?: CatalogueIndex) { for (const group of index ?? []) request(group.layerId); },
    requestPick(pick: string | null | undefined, enabled: readonly string[]) {
      if (!pick) return;
      for (const layer of layers.values()) {
        if (enabled.includes(layer.id) && layer.features.features.some((feature) => feature.properties?.id === pick)) request(layer.id);
      }
    },
    dispose() { disposed = true; },
  };
}
