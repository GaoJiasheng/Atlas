/**
 * Rotation map (docs/72 E-CD2): the manifest and object files, as types for the browser and
 * strict schemas for the build (scripts/validate-content.ts and the static page loader).
 */
import { z } from 'zod';
import { kebabId } from '../../content/schema/common';
import { deepTimeBi, maNumber } from './deep-time';

const lonLat = z.tuple([z.number().finite().min(-180).max(180), z.number().finite().min(-90).max(90)]);
const plateBound = { plateId: z.number().int().nonnegative(), from: maNumber, to: maNumber };
const plateRefine = (o: { from: number; to: number }) => o.from >= o.to;

export const rotationLayerSchema = z.object({
  id: kebabId,
  file: kebabId,
  kind: z.enum(['fill', 'line', 'point', 'label']),
  motion: z.enum(['plate', 'present-only']),
  /** Point and label layers read one kind of object from a shared file. */
  select: z.string().min(1).optional(),
  lod: z.object({ scrub: z.string().min(1), full: z.string().min(1) }).strict().optional(),
}).strict();

export const rotationManifestSchema = z.object({
  version: z.literal(1),
  modelId: kebabId,
  modelLabel: deepTimeBi,
  /** Short model name for the PLATE readout (e.g. "MERDITH 2021"); defaults to the model id. */
  plateLabel: z.string().min(1).max(24).optional(),
  coordinateSpace: z.literal('rotated-present-day'),
  rangeMa: z.tuple([maNumber, maNumber]).refine(([a, b]) => a > b, 'rangeMa is [oldest, youngest]'),
  rotations: kebabId,
  layers: z.array(rotationLayerSchema).min(1),
  /** Object files: plate-bound points and labels, PBDB collections, present-only stations and anchors. */
  objects: z.object({ points: kebabId, fossils: kebabId.optional(), gps: kebabId.optional() }).strict(),
  method: deepTimeBi,
  sources: z.array(z.string().min(1)).min(1),
}).strict();
export type RotationManifest = z.output<typeof rotationManifestSchema>;
export type RotationLayer = z.output<typeof rotationLayerSchema>;

export const rotationPointSchema = z.object({ id: kebabId, kind: z.enum(['site', 'glacial', 'belt']), at: lonLat, ...plateBound }).strict().refine(plateRefine, 'from must be >= to');
export const rotationLabelSchema = z.object({ id: kebabId, at: lonLat, ...plateBound, window: z.tuple([maNumber, maNumber]), name: deepTimeBi }).strict().refine(plateRefine, 'from must be >= to');
export const rotationPointsFileSchema = z.object({ version: z.literal(1), points: z.array(rotationPointSchema), labels: z.array(rotationLabelSchema) }).strict();
export const fossilOccurrenceSchema = z.object({ n: z.string(), name: z.string(), older: maNumber, younger: maNumber, ref: z.string() }).strict();
export const fossilPointSchema = z.object({
  id: z.string().regex(/^pbdb-col-\d+$/), kind: z.literal('fossil'), at: lonLat, ...plateBound,
  cc: z.string(), groups: z.array(kebabId).min(1), occ: z.array(fossilOccurrenceSchema).min(1),
}).strict();
export const fossilsFileSchema = z.object({
  version: z.literal(1), points: z.array(fossilPointSchema),
  groups: z.array(z.object({ id: kebabId, members: z.array(z.string()).min(1), representative: z.string() }).strict()),
  references: z.record(z.string()),
}).strict();
export const gpsFileSchema = z.object({
  version: z.literal(1),
  stations: z.array(z.object({ id: kebabId, station: z.string().regex(/^[A-Z0-9]{4}$/), at: lonLat, vNorthMm: z.number().finite(), vEastMm: z.number().finite(), frame: z.literal('IGS14'), epoch: z.string() }).strict()),
  present: z.array(z.object({ id: kebabId, kind: z.literal('ridge'), at: lonLat }).strict()),
}).strict();

export type RotationPointsFile = z.output<typeof rotationPointsFileSchema>;
export type FossilsFile = z.output<typeof fossilsFileSchema>;
export type GpsFile = z.output<typeof gpsFileSchema>;
export type RotationPoint = RotationPointsFile['points'][number];
export type RotationLabel = RotationPointsFile['labels'][number];
export type FossilPoint = FossilsFile['points'][number];
