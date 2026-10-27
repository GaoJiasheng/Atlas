/** Build-only local asset loading. Shared by Astro and validate-content. */
import type { FeatureCollection } from 'geojson';
import type { TopicMeta } from '../../content/schema/topic';
import { snapshotReferenceId } from './lib/deepTime';
import { decodeTopologyObject } from './lib/control';
import {
  reconstructionManifestSchema, modernInsetManifestSchema, modernPointsFileSchema, modernCardsFileSchema, modernReferencesFileSchema,
  reconstructionFrameIssues, sourceReferenceIssues, modernReferenceIssues, type DeepTimeBundle,
} from './deep-time';

export function loadDeepTime(topic: TopicMeta, raw: Record<string, unknown>, readGeo: (stem: string) => unknown): Record<string, unknown> {
  const config = topic.basemap?.reconstruction;
  if (!config) return raw;
  const read = (stem: string): unknown => {
    const value = readGeo(stem);
    if (value === undefined) throw new Error(`public/geo/${stem}.json: file not found`);
    return value;
  };
  const reconstruction = reconstructionManifestSchema.parse(read(config.file));
  const fail = (issues: string[]) => { if (issues.length) throw new Error(issues.join('\n')); };
  for (const frame of reconstruction.frames) fail(reconstructionFrameIssues(read(frame.file), frame, reconstruction.modelId).map((m) => `${frame.file}: ${m}`));
  const sources = new Set(((raw.sources as { sources?: { id: string }[] } | undefined)?.sources ?? []).map((s) => s.id));
  fail(sourceReferenceIssues(reconstruction, sources));
  const control = raw.control as { keyframes?: { t: unknown; features?: { features?: unknown[] } }[] } | undefined;
  if (!control || control.keyframes?.length !== reconstruction.frames.length || control.keyframes.some((k, i) => JSON.stringify(k.t) !== JSON.stringify(reconstruction.frames[i]?.t) || k.features?.features?.length !== 0))
    throw new Error('reconstruction: control must have matching Ma times and empty feature collections');
  if (['entities', 'events', 'movements'].some((k) => !Array.isArray(raw[k]) || (raw[k] as unknown[]).length !== 0))
    throw new Error('reconstruction: entities, events and movements must be empty');
  if (topic.id === 'dinosaur-earth' && reconstruction.frames.map((f) => f.t.ma).join(',') !== '250,230,200,170,150,130,100,70,65,0') throw new Error('dinosaur-earth requires the ten specified numerical frames');
  if (topic.id === 'dinosaur-earth') for (const frame of reconstruction.frames) {
    const expected = frame.t.ma >= 150 ? [-180, -89, 179, 90] : [-180, -90, 180, 90];
    if (frame.sampleBounds.some((n, i) => n !== expected[i])) throw new Error(`${frame.file}: sampleBounds do not match the published grid coverage`);
  }
  const deepTime: DeepTimeBundle = { reconstruction, points: [], cards: [] };
  const geometry = (stem: string): FeatureCollection => {
    const r = read(stem) as { type?: string };
    const fc = r.type === 'Topology' ? decodeTopologyObject(r, stem) : r as FeatureCollection;
    if (fc.type !== 'FeatureCollection' || !Array.isArray(fc.features) || !fc.features.length) throw new Error(`${stem}: expected nonempty modern FeatureCollection`);
    for (const f of fc.features) {
      if (!f.geometry || !['Polygon', 'MultiPolygon'].includes(f.geometry.type)) throw new Error(`${stem}: expected country/land polygon`);
      const check = (v: unknown): void => {
        if (!Array.isArray(v)) throw new Error(`${stem}: invalid coordinates`);
        if (typeof v[0] === 'number') {
          if (v.length < 2 || !Number.isFinite(v[0]) || !Number.isFinite(v[1]) || Math.abs(v[0]) > 180 || Math.abs(v[1] as number) > 90) throw new Error(`${stem}: invalid modern position`);
        } else v.forEach(check);
      };
      if ('coordinates' in f.geometry) check(f.geometry.coordinates);
    }
    return fc;
  };
  if (topic.modernInset) {
    const inset = modernInsetManifestSchema.parse(read(topic.modernInset.file));
    deepTime.inset = inset;
    deepTime.points = inset.pointFiles.flatMap((stem) => modernPointsFileSchema.parse(read(stem)).points);
    deepTime.cards = inset.cardFiles.flatMap((stem) => modernCardsFileSchema.parse(read(stem)).cards);
    if (inset.referenceFile) {
      deepTime.references = modernReferencesFileSchema.parse(read(inset.referenceFile)).references;
      for (const point of deepTime.points) if (point.kind === 'fossil-collection') for (const age of point.occurrenceAges) {
        const id = snapshotReferenceId(age.basis);
        if (!id || !deepTime.references[id]) throw new Error(`${point.id}: occurrence ${age.pbdbOccurrenceId} has no matching original bibliography entry`);
      }
    } else if (topic.id === 'dinosaur-earth') throw new Error('dinosaur-earth requires the retained public PBDB bibliography');
    deepTime.land = geometry(topic.modernInset.land);
    deepTime.countries = geometry(topic.modernInset.countries);
    const countryIds = new Set(deepTime.countries.features.map((f) => String(f.id ?? f.properties?.id ?? '')));
    fail(modernReferenceIssues(deepTime.points, deepTime.cards, countryIds));
    fail(sourceReferenceIssues({ points: deepTime.points, cards: deepTime.cards }, sources));
    if (topic.id === 'dinosaur-earth' && (inset.suppression.collections !== 3 || inset.suppression.occurrences !== 3)) throw new Error('dinosaur-earth suppression must be 3 collections / 3 occurrences');
  }
  return { ...raw, deepTime };
}
