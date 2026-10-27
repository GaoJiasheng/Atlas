/** Build-time schemas for the isolated reconstructed / modern coordinate spaces. */
import { z } from 'zod';
import type { FeatureCollection } from 'geojson';
import { kebabId } from '../../content/schema/common';
import { decodeTopologyObject } from './lib/control';
import { ringIssues } from '../../../scripts/geo/lib/rings';

export const deepTimeBi = z.object({ en: z.string().trim().min(1), zh: z.string().trim().min(1) }).strict();
export const maNumber = z.number().finite().nonnegative().refine((n) => Number.isFinite(n * 1e6), 'Ma overflows the time axis');
export const deepTimeMa = z.object({ ma: maNumber }).strict();
const sources = z.array(z.string().min(1)).min(1);
const position = z.tuple([z.number().finite().min(-180).max(180), z.number().finite().min(-90).max(90)]);
export const deepTimeBounds = z.tuple([
  z.number().finite().min(-180).max(180), z.number().finite().min(-90).max(90),
  z.number().finite().min(-180).max(180), z.number().finite().min(-90).max(90),
]).refine(([w, s, e, n]) => w < e && s < n, 'bounds require west < east and south < north');
export const reconstructionFrameSchema = z.object({
  id: kebabId, t: deepTimeMa, file: kebabId, sampleBounds: deepTimeBounds, sources,
}).strict();
export const reconstructionManifestSchema = z.object({
  version: z.literal(1), modelId: kebabId, modelLabel: deepTimeBi,
  coordinateSpace: z.literal('reconstructed'), geometryMeaning: z.literal('exposed-land'),
  method: deepTimeBi, sources, frames: z.array(reconstructionFrameSchema).min(1),
}).strict().superRefine((m, ctx) => {
  const ids = new Set<string>();
  const files = new Set<string>();
  m.frames.forEach((f, i) => {
    if (ids.has(f.id)) ctx.addIssue({ code: 'custom', path: ['frames', i, 'id'], message: `duplicate frame id ${f.id}` });
    if (files.has(f.file)) ctx.addIssue({ code: 'custom', path: ['frames', i, 'file'], message: `duplicate frame file ${f.file}` });
    if (i && m.frames[i - 1]!.t.ma <= f.t.ma) ctx.addIssue({ code: 'custom', path: ['frames', i, 't'], message: 'frame Ma must strictly decrease (older to younger)' });
    ids.add(f.id); files.add(f.file);
  });
});
export type ReconstructionManifest = z.output<typeof reconstructionManifestSchema>;
export type ReconstructionFrame = z.output<typeof reconstructionFrameSchema>;
export const insetViewSchema = z.enum(['world', 'southeast-asia', 'mexico']);
export type InsetView = z.output<typeof insetViewSchema>;
export const fossilModeSchema = z.enum(['age-window', 'all-mesozoic']);
export type FossilMode = z.output<typeof fossilModeSchema>;
export const modernInsetConfigSchema = z.object({
  file: kebabId, land: kebabId, countries: kebabId, label: deepTimeBi,
  defaultView: z.literal('world'), defaultVisible: z.literal(true),
  ageWindowHalfWidthMa: z.literal(5),
  views: z.array(z.object({ id: insetViewSchema, label: deepTimeBi, bounds: deepTimeBounds }).strict()).length(3),
}).strict().superRefine((m, ctx) => {
  const expected: Record<InsetView, number[]> = { world: [-180, -85, 180, 85], 'southeast-asia': [90, -10, 120, 25], mexico: [-105, 10, -80, 30] };
  if (new Set(m.views.map((v) => v.id)).size !== 3) ctx.addIssue({ code: 'custom', path: ['views'], message: 'views must contain world, southeast-asia and mexico exactly once' });
  m.views.forEach((v, i) => { if (v.bounds.some((n, k) => n !== expected[v.id][k])) ctx.addIssue({ code: 'custom', path: ['views', i, 'bounds'], message: `unexpected ${v.id} bounds` }); });
});
export type ModernInsetConfig = z.output<typeof modernInsetConfigSchema>;
export const modernInsetManifestSchema = z.object({
  version: z.literal(1), pointFiles: z.array(kebabId), cardFiles: z.array(kebabId), referenceFile: kebabId.optional(),
  suppression: z.object({ countryCode: z.literal('MY'), collections: z.number().int().nonnegative(), occurrences: z.number().int().nonnegative() }).strict(),
}).strict().superRefine((m, ctx) => {
  const all = [...m.pointFiles, ...m.cardFiles, ...(m.referenceFile ? [m.referenceFile] : [])];
  if (new Set(all).size !== all.length) ctx.addIssue({ code: 'custom', message: 'point/card files must be unique' });
});
export type ModernInsetManifest = z.output<typeof modernInsetManifestSchema>;
export const occurrenceAgeSchema = z.object({
  pbdbOccurrenceId: z.string().min(1), olderMa: maNumber, youngerMa: maNumber, basis: deepTimeBi, sources,
}).strict().refine((a) => a.olderMa >= a.youngerMa, { path: ['youngerMa'], message: 'olderMa must be >= youngerMa' });
const pointFields = {
  id: kebabId, coordinateSpace: z.literal('modern'), at: position,
  title: deepTimeBi, summary: deepTimeBi, detail: deepTimeBi.optional(), sources,
};
export const modernPointSchema = z.union([
  z.object({ ...pointFields, kind: z.literal('fossil-collection'), pbdbCollectionId: z.string().min(1),
    countryCode: z.string().regex(/^[A-Z]{2}$/).refine((c) => c !== 'MY', 'MY precise fossil locations must be suppressed'),
    precision: deepTimeBi, occurrenceAges: z.array(occurrenceAgeSchema).min(1),
  }).strict(),
  z.object({ ...pointFields, kind: z.literal('reference'), role: z.literal('singapore') }).strict(),
  z.object({ ...pointFields, kind: z.literal('reference'), role: z.literal('impact-site'), eventAge: deepTimeMa }).strict(),
]);
export type ModernPoint = z.output<typeof modernPointSchema>;
export type FossilCollection = Extract<ModernPoint, { kind: 'fossil-collection' }>;
export const referenceCardSchema = z.object({
  id: kebabId, kind: z.literal('reference-card'), role: z.enum(['regional-find', 'museum-origin']),
  coordinateSpace: z.literal('modern'), title: deepTimeBi, summary: deepTimeBi, detail: deepTimeBi, sources,
  regionLabel: deepTimeBi, countryCode: z.string().regex(/^[A-Z]{2}$/), precision: z.enum(['region-only', 'country-only']), linkedCountryFeatureId: z.string().min(1).optional(),
}).strict();
export type ReferenceCard = z.output<typeof referenceCardSchema>;
export const modernPointsFileSchema = z.object({ version: z.literal(1), coordinateSpace: z.literal('modern'), points: z.array(modernPointSchema) }).strict();
export const modernCardsFileSchema = z.object({ version: z.literal(1), coordinateSpace: z.literal('modern'), cards: z.array(referenceCardSchema) }).strict();

/** Data is assembled at build time; no manifest or PBDB network request is needed at runtime. */
export interface DeepTimeBundle {
  reconstruction: ReconstructionManifest;
  inset?: ModernInsetManifest;
  points: ModernPoint[];
  cards: ReferenceCard[];
  land?: FeatureCollection;
  countries?: FeatureCollection;
  references?: Record<string, string>;
}
const modernGeometryFile = z.custom<FeatureCollection>((v) => {
  if (!v || typeof v !== 'object' || (v as FeatureCollection).type !== 'FeatureCollection' || !Array.isArray((v as FeatureCollection).features)) return false;
  return (v as FeatureCollection).features.every((f) => f?.type === 'Feature' && f.geometry && ['Polygon', 'MultiPolygon'].includes(f.geometry.type));
}, 'modern land/countries must be polygon FeatureCollections');
export const modernReferencesFileSchema = z.object({ version: z.literal(1), references: z.record(z.string().regex(/^[1-9]\d*$/), z.string().min(1)) }).strict();
export const deepTimeBundleSchema = z.object({
  reconstruction: reconstructionManifestSchema, inset: modernInsetManifestSchema.optional(),
  points: z.array(modernPointSchema), cards: z.array(referenceCardSchema),
  land: modernGeometryFile.optional(), countries: modernGeometryFile.optional(), references: modernReferencesFileSchema.shape.references.optional(),
}).strict();

/** Recursive references include every occurrence's independent source list. */
export function sourceReferenceIssues(value: unknown, known: ReadonlySet<string>): string[] {
  const issues: string[] = [];
  function walk(v: unknown, path: string): void {
    if (!v || typeof v !== 'object') return;
    if (Array.isArray(v)) { v.forEach((x, i) => walk(x, `${path}[${i}]`)); return; }
    for (const [key, child] of Object.entries(v)) {
      if (key === 'sources' && Array.isArray(child)) child.forEach((s) => { if (typeof s !== 'string' || !known.has(s)) issues.push(`${path}.sources: unknown source ${String(s)}`); });
      else walk(child, `${path}.${key}`);
    }
  }
  walk(value, '$'); return issues;
}

export function modernReferenceIssues(points: readonly ModernPoint[], cards: readonly ReferenceCard[], countryFeatureIds: ReadonlySet<string>): string[] {
  const issues: string[] = []; const ids = new Set<string>(); const collections = new Set<string>(); const occurrences = new Set<string>();
  for (const object of [...points, ...cards]) {
    if (ids.has(object.id)) issues.push(`duplicate modern object id ${object.id}`); ids.add(object.id);
    if (object.kind === 'reference-card') {
      if (object.linkedCountryFeatureId && !countryFeatureIds.has(object.linkedCountryFeatureId)) issues.push(`${object.id}: unknown country feature ${object.linkedCountryFeatureId}`);
    } else if (object.kind === 'fossil-collection') {
      if (collections.has(object.pbdbCollectionId)) issues.push(`duplicate collection ${object.pbdbCollectionId}`); collections.add(object.pbdbCollectionId);
      for (const age of object.occurrenceAges) {
        if (occurrences.has(age.pbdbOccurrenceId)) issues.push(`duplicate occurrence ${age.pbdbOccurrenceId}`); occurrences.add(age.pbdbOccurrenceId);
      }
    }
  }
  return issues;
}

/** Validate decoded geometry, including the cut edges which must never be styled as coast. */
export function reconstructionFrameIssues(raw: unknown, frame: ReconstructionFrame, modelId: string): string[] {
  const xy = z.tuple([z.number().finite(), z.number().finite()]);
  const topoSchema = z.object({ type: z.literal('Topology'), objects: z.record(z.unknown()), arcs: z.array(z.array(xy).min(2)), transform: z.object({ scale: xy, translate: xy }).strict().optional() }).passthrough();
  const result = topoSchema.safeParse(raw);
  if (!result.success) return result.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`);
  if (Object.keys(result.data.objects).length !== 1 || !Object.hasOwn(result.data.objects, frame.file)) return [`expected only TopoJSON object ${frame.file}`];
  const issues: string[] = []; let landCount = 0;
  try {
    const fc = decodeTopologyObject(raw, frame.file);
    const object = result.data.objects[frame.file] as { type?: string; geometries?: unknown[] };
    if (object.type === 'GeometryCollection' && object.geometries?.length !== fc.features.length) issues.push('null or missing frame geometry');
    for (const [i, f] of fc.features.entries()) {
      const p = z.object({ kind: z.enum(['land', 'coast', 'unavailable']), modelId: z.literal(modelId), frameMa: z.literal(frame.t.ma) }).strict().safeParse(f.properties);
      if (!p.success) { issues.push(`feature ${i}: invalid kind, modelId or frameMa`); continue; }
      const g = f.geometry;
      const polygons = g.type === 'Polygon' ? [g.coordinates] : g.type === 'MultiPolygon' ? g.coordinates : [];
      const lines = g.type === 'LineString' ? [g.coordinates] : g.type === 'MultiLineString' ? g.coordinates : [];
      if (p.data.kind === 'coast' ? !lines.length : !polygons.length) issues.push(`feature ${i}: ${p.data.kind} has wrong geometry type or is empty`);
      if (p.data.kind === 'land') landCount += polygons.length;
      const allLines = [...polygons.flat(), ...lines];
      for (const line of allLines) {
        if (line.length < 2) issues.push(`feature ${i}: empty line`);
        for (const point of line) if (!position.safeParse(point).success) issues.push(`feature ${i}: invalid coordinate`);
        for (let k = 1; k < line.length; k++) {
          const a = line[k - 1]!; const b = line[k]!;
          if (Math.abs(a[0]! - b[0]!) > 180) issues.push(`feature ${i}: antimeridian-spanning segment`);
          if (p.data.kind === 'coast' && (([frame.sampleBounds[0], frame.sampleBounds[2], -180, 180].includes(a[0]!) && a[0] === b[0]) || (Math.abs(Math.abs(a[1]!) - 85.051129) < 1e-6 && a[1] === b[1]))) issues.push(`feature ${i}: coast includes frame cut edge`);
        }
      }
      for (const polygon of polygons) for (const ring of polygon) if (ring.length < 4 || ring[0]![0] !== ring.at(-1)![0] || ring[0]![1] !== ring.at(-1)![1]) issues.push(`feature ${i}: polygon ring must be closed`);
      const rings = ringIssues(polygons);
      if (rings.zeroArea) issues.push(`feature ${i}: ${rings.zeroArea} zero-area rings`);
      if (rings.selfCrossing) issues.push(`feature ${i}: ${rings.selfCrossing} self-crossing rings`);
    }
    if (!landCount) issues.push('frame must contain nonempty land');
  } catch (e) { issues.push(`cannot decode reconstruction frame: ${e instanceof Error ? e.message : String(e)}`); }
  return issues;
}
