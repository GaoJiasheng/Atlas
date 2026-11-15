/** Build-only checks for a rotation map (docs/72 E-CD2). Shared by validate-content and its tests. */
import type { TopicMeta } from '../../content/schema/topic';
import { decodeTopologyObject } from './lib/control';
import { createRotationModel, type RotationFile } from './lib/plateRotation';
import { fossilsFileSchema, gpsFileSchema, rotationManifestSchema, rotationPointsFileSchema } from './rotation-schema';

export interface RotationCheck { objects: string[]; issues: string[] }

const rotationFileShape = (v: unknown): v is RotationFile => {
  const r = v as RotationFile;
  return !!r && r.version === 1 && typeof r.anchorPlateId === 'number' && Array.isArray(r.sequences)
    && r.sequences.every((s) => Number.isInteger(s.moving) && Number.isInteger(s.fixed) && Array.isArray(s.poles) && s.poles.length > 0
      && s.poles.every((p, i) => p.length === 4 && p.every(Number.isFinite) && (i === 0 || p[0] > s.poles[i - 1]![0])));
};

export function checkRotation(topic: TopicMeta, readGeo: (stem: string) => unknown): RotationCheck {
  const config = topic.basemap?.rotation;
  if (!config) return { objects: [], issues: [] };
  const issues: string[] = [];
  const objects: string[] = [];
  const read = (stem: string) => {
    const v = readGeo(stem);
    if (v === undefined) issues.push(`public/geo/${stem}.json: file not found`);
    return v;
  };
  const parsed = rotationManifestSchema.safeParse(read(config.file));
  if (!parsed.success) return { objects, issues: [...issues, ...parsed.error.issues.map((i) => `${config.file}: ${i.path.join('.')}: ${i.message}`)] };
  const manifest = parsed.data;
  const topicLayers = config.layers.map((l) => l.id).join(',');
  if (manifest.layers.map((l) => l.id).join(',') !== topicLayers) issues.push(`${config.file}: layers must match topic basemap.rotation.layers (${topicLayers})`);
  const rot = read(manifest.rotations);
  if (!rotationFileShape(rot)) return { objects, issues: [...issues, `${manifest.rotations}: invalid rotation file (poles must be [age, lat, lon, angle] with strictly increasing ages)`] };
  const model = createRotationModel(rot);
  const known = new Set([rot.anchorPlateId, ...model.plates()]);
  const plate = (where: string, o: { plateId?: unknown; from?: unknown; to?: unknown }) => {
    if (typeof o.plateId !== 'number' || !Number.isInteger(o.plateId)) { issues.push(`${where}: plate layer feature needs an integer plateId`); return; }
    if (!known.has(o.plateId)) issues.push(`${where}: unknown plateId ${o.plateId}`);
    if (typeof o.from !== 'number' || typeof o.to !== 'number' || !Number.isFinite(o.from) || !Number.isFinite(o.to) || o.from < o.to) issues.push(`${where}: needs finite from >= to`);
  };
  const [oldest, youngest] = manifest.rangeMa;
  for (const ma of [oldest, (oldest + youngest) / 2, youngest]) {
    try { model.rotation(rot.sequences[0]!.moving, ma); } catch (e) { issues.push(`${manifest.rotations}: ${String(e)}`); }
  }
  const files = new Map<string, unknown>();
  const file = (stem: string) => { if (!files.has(stem)) files.set(stem, read(stem)); return files.get(stem); };
  for (const layer of manifest.layers) {
    const raw = file(layer.file);
    if (raw === undefined) continue;
    if (layer.kind === 'fill' || layer.kind === 'line') {
      const objectNames = layer.lod ? [layer.lod.scrub, layer.lod.full] : [];
      const collections = (raw as { type?: string }).type === 'Topology'
        ? objectNames.map((name) => { try { return decodeTopologyObject(raw, name); } catch (e) { issues.push(`${layer.file}: ${String(e)}`); return null; } })
        : [raw as { type?: string; features?: { properties?: Record<string, unknown> }[] }];
      for (const fc of collections) {
        if (!fc || fc.type !== 'FeatureCollection' || !fc.features?.length) { issues.push(`${layer.file}: expected a nonempty FeatureCollection`); continue; }
        fc.features.forEach((f, i) => {
          if (layer.motion === 'plate') plate(`${layer.file} feature ${i}`, f.properties ?? {});
          else if (f.properties && 'plateId' in f.properties) issues.push(`${layer.file} feature ${i}: present-only feature must not carry a plateId`);
        });
      }
    }
  }
  const points = rotationPointsFileSchema.safeParse(file(manifest.objects.points));
  if (points.success) {
    for (const p of [...points.data.points, ...points.data.labels]) { plate(`${manifest.objects.points} ${p.id}`, p); objects.push(p.id); }
    for (const l of points.data.labels) if (l.window[0] < l.window[1]) issues.push(`${manifest.objects.points} ${l.id}: window is [oldest, youngest]`);
  } else issues.push(...points.error.issues.map((i) => `${manifest.objects.points}: ${i.path.join('.')}: ${i.message}`));
  const fossils = manifest.objects.fossils ? fossilsFileSchema.safeParse(file(manifest.objects.fossils)) : null;
  if (fossils?.success) {
    const ids = new Set(fossils.data.points.map((p) => p.id));
    for (const p of fossils.data.points) plate(`fossils ${p.id}`, p);
    for (const g of fossils.data.groups) {
      objects.push(g.id);
      for (const m of [...g.members, g.representative]) if (!ids.has(m)) issues.push(`fossils ${g.id}: unknown member ${m}`);
    }
    objects.push(...ids);
  } else if (fossils) issues.push(...fossils.error.issues.map((i) => `fossils: ${i.path.join('.')}: ${i.message}`));
  const gps = manifest.objects.gps ? gpsFileSchema.safeParse(file(manifest.objects.gps)) : null;
  if (gps?.success) objects.push(...gps.data.stations.map((s) => s.id), ...gps.data.present.map((p) => p.id));
  else if (gps) issues.push(...gps.error.issues.map((i) => `gps: ${i.path.join('.')}: ${i.message}`));
  const dup = objects.filter((id, i) => objects.indexOf(id) !== i);
  if (dup.length) issues.push(`duplicate rotation object ids: ${[...new Set(dup)].join(', ')}`);
  return { objects, issues };
}
