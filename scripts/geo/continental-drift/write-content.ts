/**
 * Writes continental-drift chapter frontmatter (state, beats, cameras) from content.ts, keeping each
 * MDX body as edited, and public/geo/cd-points-text.json. Cameras for ancient beats are computed here
 * with the runtime rotation code (docs/72 DS06): the spherical centroid of the framed objects at the
 * beat's age, and a zoom from their spread. Run: pnpm tsx scripts/geo/continental-drift/write-content.ts [--check]
 */
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { stringify } from 'yaml';
import { createRotationModel, type RotationFile } from '../../../src/engines/time-scene/lib/plateRotation';
import type { RotationPointsFile, FossilsFile, GpsFile } from '../../../src/engines/time-scene/rotation-schema';
import { CHAPTERS, FIT_GROUPS, OBJECTS, PRESETS, type Cam } from './content';

const ROOT = resolve(import.meta.dirname, '../../..');
const GEO = join(ROOT, 'public/geo');
const DIR = join(ROOT, 'src/content/topics/continental-drift/chapters');
const check = process.argv.includes('--check');
const read = <T,>(stem: string) => JSON.parse(readFileSync(join(GEO, `${stem}.json`), 'utf8')) as T;
const model = createRotationModel(read<RotationFile>('cd-rotations'));
const points = read<RotationPointsFile>('cd-points');
const fossils = read<FossilsFile>('cd-fossils');
const gps = read<GpsFile>('cd-gps');
const RAD = Math.PI / 180;

function positions(id: string, ma: number): [number, number][] {
  if (FIT_GROUPS[id]) return FIT_GROUPS[id]!.flatMap((m) => positions(m, ma));
  const p = points.points.find((x) => x.id === id) ?? points.labels.find((x) => x.id === id) ?? fossils.points.find((x) => x.id === id);
  if (p) {
    if (ma > p.from || ma < p.to) return [];
    return [model.rotatePoint(p.plateId, ma, p.at)!];
  }
  const g = fossils.groups.find((x) => x.id === id);
  if (g) return g.members.flatMap((m) => positions(m, ma));
  const s = gps.stations.find((x) => x.id === id);
  if (s && ma === 0) return [s.at];
  throw new Error(`cannot frame ${id} at ${ma} Ma`);
}

const round = (n: number, d: number) => Math.round(n * 10 ** d) / 10 ** d;
function camera(cam: Cam, ma: number) {
  if (typeof cam === 'string') return PRESETS[cam];
  const pts = cam.fit.flatMap((id) => positions(id, ma));
  if (!pts.length) throw new Error(`nothing to frame for ${cam.fit.join(',')} at ${ma} Ma`);
  const v = pts.map(([lon, lat]) => [Math.cos(lat * RAD) * Math.cos(lon * RAD), Math.cos(lat * RAD) * Math.sin(lon * RAD), Math.sin(lat * RAD)]);
  const m = [0, 1, 2].map((k) => v.reduce((s, x) => s + x[k]!, 0));
  const n = Math.hypot(m[0]!, m[1]!, m[2]!);
  const c = m.map((x) => x / n);
  const spread = Math.max(...v.map((x) => Math.acos(Math.min(1, x[0]! * c[0]! + x[1]! * c[1]! + x[2]! * c[2]!)) / RAD));
  // A globe at zoom 2 fills the 1920×1080 free stage; frame the spread with a margin, never closer than 3.
  const zoom = cam.zoom ?? Math.max(2, Math.min(3, 2 + Math.log2(90 / (1.5 * Math.max(spread, 10)))));
  // A whole-world frame keeps the view between ±40° so both hemispheres stay on the globe's face.
  const lat = Math.asin(c[2]!) / RAD;
  const latShown = spread > 60 ? Math.max(-40, Math.min(40, lat)) : Math.max(-65, Math.min(65, lat));
  // MapLibre's globe keeps Mercator's zoom scale at the centre latitude, so a polar view would come out larger:
  // take that stretch off again, so the same spread reads the same at every latitude.
  const polar = Math.log2(1 / Math.cos(latShown * RAD));
  return { center: [round(Math.atan2(c[1]!, c[0]!) / RAD, 2), round(latShown, 2)] as [number, number], zoom: round(Math.max(1, zoom - polar), 2) };
}

let changed = 0;
for (const ch of CHAPTERS) {
  const beats = ch.beats.map((b) => ({ t: { ma: b.ma }, camera: camera(b.cam, b.ma), layers: b.layers, highlight: b.highlight, caption: b.caption }));
  const last = beats.at(-1)!;
  const state = {
    time: last.t, camera: last.camera, layers: last.layers, highlight: last.highlight,
    ...(ch.note ? { note: ch.note } : {}),
    summary: ch.summary, index: ch.index, beats,
  };
  const front = stringify({ id: ch.id, order: ch.order, ...(ch.kind ? { kind: ch.kind } : {}), title: ch.title, state }, { lineWidth: 0, aliasDuplicateObjects: false });
  const file = join(DIR, ch.file);
  const old = existsSync(file) ? readFileSync(file, 'utf8') : '';
  const body = old.startsWith('---\n') ? old.slice(old.indexOf('\n---\n', 4) + 5) : '\n';
  const next = `---\n${front}---\n${body.startsWith('\n') ? body : `\n${body}`}`;
  if (next !== old) { changed++; if (!check) writeFileSync(file, next); }
}
const text = `${JSON.stringify({ version: 1, objects: OBJECTS }, null, 0)}\n`;
const textFile = join(GEO, 'cd-points-text.json');
if (!existsSync(textFile) || readFileSync(textFile, 'utf8') !== text) { changed++; if (!check) writeFileSync(textFile, text); }
if (check && changed) { console.error(`${changed} continental-drift content files are out of date: run write-content.ts`); process.exit(1); }
console.log(check ? 'continental-drift content up to date' : `wrote ${changed} files`);
