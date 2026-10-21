/**
 * G3 (docs/43 §3.2): keyframe recipes for compose.ts, and the overlap check.
 *
 *   pnpm tsx scripts/geo/ancient-civilisations/inventory.ts        # first: raw/cliopatria-subset.geojson
 *   pnpm tsx scripts/geo/ancient-civilisations/build-keyframes.ts  # sources.json datasets + keyframes, work/overlaps.json
 *   pnpm tsx scripts/geo/lib/compose.ts --topic ancient-civilisations
 *   pnpm tsx scripts/geo/lib/simplify.ts --topic ancient-civilisations
 *   pnpm tsx scripts/geo/ancient-civilisations/finalize-control.ts
 *
 * Every step is `{ geojson: G1, where: { frame, holder } }`: the Cliopatria
 * records the inventory matched for that frame and holder, unchanged (a
 * holder with several records is their union). compose.ts cuts nothing by
 * hand; simplify.ts then follows the plate's coast (Natural Earth 1:10m).
 *
 * Overlap check (docs/43 G3 step 4): within each frame, every pair of holders
 * is intersected on the sphere. Under 2 % of the smaller one's area the later
 * step (paint order in keyframes.json) simply wins; 2 % or more is written to
 * work/overlaps.json and the run exits 1 unless the pair is decided in
 * keyframes.json `overlapDecisions` (`"K11 egypt rome"` → the reason).
 */
import { readFileSync } from 'node:fs';
import type { FeatureCollection } from 'geojson';
import { mapshaper, writeJson } from '../lib/common';
import type { Keyframe, Sources } from '../lib/manifest';

const DIR = 'scripts/geo/ancient-civilisations';
interface Holder { holder: string; label: { en: string; zh: string } }
const plan = JSON.parse(readFileSync(`${DIR}/keyframes.json`, 'utf8')) as {
  release: string;
  frames: { id: string; t: string; holders: Holder[] }[];
  overlapDecisions?: Record<string, string>;
};
const subset = JSON.parse(readFileSync(`${DIR}/raw/cliopatria-subset.geojson`, 'utf8')) as FeatureCollection;
const manifestPath = `${DIR}/sources.json`;
const manifest = JSON.parse(readFileSync(manifestPath, 'utf8')) as Sources;

manifest.datasets = {
  G1: {
    ref: 'G1',
    title: `Cliopatria ${plan.release} (Seshat Global History Databank), extract of the records used by this topic`,
    url: 'https://github.com/Seshat-Global-History-Databank/cliopatria/releases/tag/v0.2.1',
    file: 'cliopatria-subset.geojson',
    page: 'https://zenodo.org/records/13363121',
    author: 'Seshat Global History Databank (data paper doi:10.1038/s41597-025-04516-9)',
    license: 'CC BY 4.0',
    role: 'dated polity polygons for every control keyframe (written by inventory.ts from the release file; geometry unchanged)',
  },
};

/** check.ts view of a frame: the box of its raw records, and a zoom that fits it in the 900 px check panel. */
function checkView(frame: string): { center: [number, number]; zoom: number } {
  let w = 180, s = 90, e = -180, n = -90;
  const walk = (c: unknown): void => {
    if (typeof (c as number[])[0] === 'number') {
      const [x, y] = c as [number, number];
      w = Math.min(w, x); e = Math.max(e, x); s = Math.min(s, y); n = Math.max(n, y);
    } else (c as unknown[]).forEach(walk);
  };
  for (const f of subset.features) if (f.properties?.frame === frame) walk((f.geometry as { coordinates: unknown }).coordinates);
  const span = Math.max(e - w, (n - s) * 1.6, 4);
  return { center: [Math.round(((w + e) / 2) * 10) / 10, Math.round(((s + n) / 2) * 10) / 10], zoom: Math.round(Math.max(1.5, Math.min(6, Math.log2(360 / span) + 0.9)) * 10) / 10 };
}

const srcNote = (frame: string, holder: string) =>
  [...new Set(subset.features.filter((f) => f.properties?.frame === frame && f.properties?.holder === holder).map((f) => String(f.properties?.src)))].join('; ');

manifest.keyframes = plan.frames
  .filter((f) => f.holders.length)
  .map(
    (f): Keyframe => ({
      id: f.id,
      t: f.t,
      method: `Cliopatria ${plan.release} records valid in ${f.t.startsWith('-') ? `${Number(f.t.slice(1))} BCE` : `${Number(f.t)} CE`}, unchanged; coast of the plate (Natural Earth 1:10m)`,
      steps: f.holders.map((h) => ({ holder: h.holder, label: h.label, src: ['G1'], note: srcNote(f.id, h.holder), from: { geojson: 'G1', where: { frame: f.id, holder: h.holder } } })),
      checks: [{ name: 'all records of the frame', ...checkView(f.id), source: `C-${f.id}` }],
    }),
  );
for (const f of plan.frames.filter((x) => x.holders.length))
  manifest.datasets[`C-${f.id}`] = { ...manifest.datasets.G1!, file: `check-${f.id}.geojson`, title: `Cliopatria ${plan.release}: the raw records of ${f.id} (check view only)`, role: 'check.ts comparison: the records of this frame as published, before coast clipping and simplification' };
writeJson(manifestPath, manifest, true);

// Overlap check.
const areaKm2 = async (fc: FeatureCollection): Promise<number> => {
  if (!fc.features.length) return 0;
  const out = await mapshaper('-i a.json -dissolve -each "km2=this.area/1e6"', { a: fc });
  return out.features.reduce((s, f) => s + Number(f.properties?.km2 ?? 0), 0);
};
const overlaps: { frame: string; a: string; b: string; km2: number; share: number; decision: string }[] = [];
let undecided = 0;
for (const f of plan.frames) {
  const parts = new Map<string, FeatureCollection>();
  for (const h of f.holders) {
    if (parts.has(h.holder)) continue;
    parts.set(h.holder, { type: 'FeatureCollection', features: subset.features.filter((x) => x.properties?.frame === f.id && x.properties?.holder === h.holder) });
  }
  const ids = [...parts.keys()];
  for (let i = 0; i < ids.length; i++)
    for (let j = i + 1; j < ids.length; j++) {
      const a = parts.get(ids[i]!)!;
      const b = parts.get(ids[j]!)!;
      const inter = await mapshaper('-i a.json b.json combine-files -clip target=a b', { a, b });
      const km2 = await areaKm2(inter);
      if (km2 < 1) continue;
      const smaller = Math.min(await areaKm2(a), await areaKm2(b));
      const share = km2 / smaller;
      const key = `${f.id} ${ids[i]} ${ids[j]}`;
      const decision = share < 0.02 ? `under 2 %: the later step (${ids[j]}) wins` : (plan.overlapDecisions?.[key] ?? 'UNDECIDED');
      if (decision === 'UNDECIDED') undecided++;
      overlaps.push({ frame: f.id, a: ids[i]!, b: ids[j]!, km2: Math.round(km2), share: Math.round(share * 1000) / 10, decision });
      console.log(`${key}: ${Math.round(km2).toLocaleString('en')} km² = ${(share * 100).toFixed(1)} % of the smaller · ${decision}`);
    }
}
writeJson(`${DIR}/work/overlaps.json`, overlaps, true);
console.log(`${manifest.keyframes.length} keyframe recipes written; ${overlaps.length} overlapping pairs, ${undecided} undecided`);
if (undecided) process.exit(1);
