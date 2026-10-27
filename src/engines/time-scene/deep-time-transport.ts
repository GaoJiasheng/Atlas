/** The static topic payload references modern assets rather than deploying their geometry twice. */
import type { TimeSceneGeoData } from './schema';
import type { DeepTimeBundle, ModernInsetConfig, ModernPoint, ReferenceCard } from './lib/deepTime';
import type { FeatureCollection } from 'geojson';
import { withBase } from '../../i18n';
import { decodeTopologyObject } from './lib/control';

/** Build validation uses the full bundle; only the emitted response is compacted. */
export function compactDeepTimeData(data: unknown): unknown {
  const parsed = data as TimeSceneGeoData;
  if (!parsed.deepTime?.inset) return data;
  return { ...parsed, deepTime: { reconstruction: parsed.deepTime.reconstruction, inset: parsed.deepTime.inset, points: [], cards: [] } };
}

const requests = new Map<string, Promise<DeepTimeBundle>>();
export function loadModernEvidence(bundle: DeepTimeBundle, config: ModernInsetConfig): Promise<DeepTimeBundle> {
  if (bundle.land && bundle.countries && (!bundle.inset?.referenceFile || bundle.references)) return Promise.resolve(bundle);
  const key = JSON.stringify([bundle.reconstruction.modelId, bundle.inset, config.land, config.countries]);
  const prior = requests.get(key);
  if (prior) return prior;
  const read = async <T,>(stem: string): Promise<T> => {
    const response = await fetch(withBase(`/geo/${stem}.json`));
    if (!response.ok) throw new Error(`Local modern evidence unavailable: ${stem}`);
    return response.json() as Promise<T>;
  };
  const geometry = async (stem: string): Promise<FeatureCollection> => {
    const raw = await read<FeatureCollection | { type: 'Topology' }>(stem);
    return raw.type === 'Topology' ? decodeTopologyObject(raw, stem) : raw;
  };
  const request = Promise.all([
    geometry(config.land), geometry(config.countries),
    Promise.all((bundle.inset?.pointFiles ?? []).map((stem) => read<{ points: ModernPoint[] }>(stem))),
    Promise.all((bundle.inset?.cardFiles ?? []).map((stem) => read<{ cards: ReferenceCard[] }>(stem))),
    bundle.inset?.referenceFile ? read<{ references: Record<string, string> }>(bundle.inset.referenceFile) : Promise.resolve({ references: {} }),
  ]).then(([land, countries, points, cards, references]) => ({ ...bundle, land, countries, references: references.references, points: points.flatMap((p) => p.points), cards: cards.flatMap((c) => c.cards) }));
  requests.set(key, request);
  request.catch(() => requests.delete(key));
  return request;
}
