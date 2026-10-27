/** Build-only catalogue validation, kept outside shared TimeScene schema registrations. */
import type { FeatureCollection } from 'geojson';
import type { DatedLayerDef } from '../../content/schema/topic';
import { kebabId } from '../../content/schema/common';
import { sourceIds } from '../../content/schema/sources';
import { catalogueFile, catalogueAnchorValid } from './catalogueSchema';
import { decodeTopologyObject } from './lib/control';
import type { TimeChapterState, TimeSceneGeoData, TimeTopicIssue } from './schema';

export function catalogueGeometryIssues(decoded: FeatureCollection, layer: Pick<DatedLayerDef, 'catalogue' | 'encoding'>): string[] {
  const errors: string[] = [];
  const ids = new Set<string>();
  decoded.features.forEach((f, i) => {
    const p = f.properties ?? {};
    if (layer.catalogue) {
      if (!kebabId.max(128).safeParse(p.id).success) errors.push(`feature ${i}: catalogue requires a valid properties.id`);
      else if (ids.has(p.id)) errors.push(`feature ${i}: duplicate geometry id "${p.id}"`);
      ids.add(p.id);
    }
    if (layer.encoding && (f.geometry.type !== 'Point' || typeof p.mag !== 'number' || !Number.isFinite(p.mag) || p.mag < 6)) errors.push(`feature ${p.id ?? i}: encoding requires Point and finite mag >= 6`);
  });
  return errors;
}

export function catalogueTopicIssues(layers: readonly DatedLayerDef[], data: TimeSceneGeoData, knownIds: readonly string[], readGeo: (name: string) => unknown): TimeTopicIssue[] {
  const issues: TimeTopicIssue[] = [];
  const geo = (name: string) => `public/geo/${name}.json`;
  const allIds = new Set(knownIds);
  for (const term of data.glossary?.terms ?? []) allIds.add(term.id);
  for (const layer of layers) {
    if (!layer.catalogue) continue;
    const file = layer.catalogue.file;
    const raw = readGeo(file);
    const parsed = catalogueFile.safeParse(raw);
    if (!parsed.success) {
      for (const error of parsed.error.issues.slice(0, 10)) issues.push({ level: 'error', file: geo(file), message: `${error.path.join('.')}: ${error.message}` });
      continue;
    }
    let features: ReturnType<typeof decodeTopologyObject>['features'] = [];
    try { const input = readGeo(layer.file); if (input) features = decodeTopologyObject(input as Parameters<typeof decodeTopologyObject>[0], layer.file).features; } catch { /* geometry errors reported above */ }
    const joined = new Set<string>();
    const knownSources = sourceIds(data.sources);
    for (const entry of parsed.data.entries) {
      const report = (message: string) => issues.push({ level: 'error' as const, file: geo(file), message: `${entry.id}: ${message}` });
      if (allIds.has(entry.id)) report('duplicate global id');
      allIds.add(entry.id);
      if (joined.has(entry.id)) report('duplicate catalogue entry');
      joined.add(entry.id);
      const matches = features.filter((f) => f.properties?.id === entry.id);
      if (matches.length !== 1) report('entry must join exactly one feature in its layer');
      else if (!catalogueAnchorValid(entry.at, matches[0]!)) report('at is not on its geometry (line tolerance 250 m)');
      for (const source of [...entry.sources, ...entry.rows.flatMap((row) => row.sources ?? [])]) if (!knownSources.has(source)) report(`unknown source "${source}"`);
      if (layer.id.includes('observations')) for (const row of entry.rows) if (!['ncei-id', 'source-event', 'measurement-type', 'doubtful', 'position', 'longitude', 'latitude', 'version'].includes(row.key)) report(`${row.key}: observation rows allow only identity, source event, original type, doubtful, position and version; no height/arrival values`);
    }
    for (const feature of features) if (!joined.has(feature.properties?.id)) issues.push({ level: 'error', file: geo(file), message: `${feature.properties?.id}: feature has no catalogue entry` });
  }
  return issues;
}

/** Catalogue indexes are checked after loading topic files, without inflating island props. */
export function timeCatalogueIndexIssues(state: TimeChapterState, layers: readonly DatedLayerDef[], readGeo: (name: string) => unknown): string[] {
  const errors: string[] = [];
  const check = (index: TimeChapterState['catalogueIndex'], path: string) => index?.forEach((group) => {
    const layer = layers.find((l) => l.id === group.layerId);
    if (!layer?.catalogue) { errors.push(`${path}: ${group.layerId} requires a catalogue`); return; }
    const parsed = catalogueFile.safeParse(readGeo(layer.catalogue.file));
    if (parsed.success) for (const id of group.ids ?? []) if (!parsed.data.entries.some((e) => e.id === id)) errors.push(`${path}: ${group.layerId}: unknown catalogue id ${id}`);
  });
  check(state.catalogueIndex, 'state.catalogueIndex');
  state.beats?.forEach((beat, i) => check(beat.catalogueIndex, `state.beats.${i}.catalogueIndex`));
  return errors;
}
