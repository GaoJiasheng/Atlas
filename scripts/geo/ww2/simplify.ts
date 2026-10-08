/**
 * Step 5 — simplify the composed keyframes and write the topic data file
 * src/content/topics/ww2/data/control.json.
 *
 *   pnpm tsx scripts/geo/ww2/simplify.ts                    # auto: fit the size budget
 *   pnpm tsx scripts/geo/ww2/simplify.ts --fine 4 --coarse 25   # fixed intervals in km
 *
 * Topology-preserving: mapshaper builds one topology per layer, so a border
 * shared by two holders is simplified once and both sides stay aligned (no
 * slivers, no overlaps). Detail is regional: each keyframe is cut along the
 * focus boxes (the theatres the chapters zoom into: Europe / North Africa /
 * Middle East, and East and Southeast Asia / western Pacific); inside them the
 * `fine` interval applies and detached islands under 20 km² are dropped,
 * outside the `coarse` interval and 300 km². The two halves meet on the
 * straight box edges (nodes on both sides), then are dissolved back per
 * holder. Visvalingam (weighted), keep-shapes; coordinates rounded to 0.01°
 * (≈1 km).
 *
 * Size budget: 1.5 MB for the 12 keyframes of docs/09 §4.2, i.e.
 * 1.5 MB × (keyframes present / 12). Without --fine the script coarsens the
 * focus interval step by step (from 4 km) until the file fits.
 */
import { statSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { parseArgs } from 'node:util';
import type { Feature, FeatureCollection, Position } from 'geojson';
import { TOPIC, areaFeatures, loadSources, log, mapshaper, readJson, toFc, warn, workFile } from './lib';

const BUDGET_TOTAL = 1.5 * 1024 * 1024;
const PLANNED_KEYFRAMES = 12;
/** [west, south, east, north] boxes that keep the fine interval. */
const FOCUS: [number, number, number, number][] = [
  [-12, 28, 62, 72], // Europe, North Africa coast, Middle East
  [88, -12, 160, 56], // East and Southeast Asia, western Pacific
];

const { values } = parseArgs({ options: { fine: { type: 'string' }, coarse: { type: 'string' } } });

function boxes(list: [number, number, number, number][]): FeatureCollection {
  return toFc(
    list.map(([w, so, e, n]) => {
      const ring: Position[] = [];
      for (let i = 0; i <= 40; i++) ring.push([w + ((e - w) * i) / 40, so]);
      for (let i = 1; i <= 40; i++) ring.push([e, so + ((n - so) * i) / 40]);
      for (let i = 1; i <= 40; i++) ring.push([e - ((e - w) * i) / 40, n]);
      for (let i = 1; i <= 40; i++) ring.push([w, n - ((n - so) * i) / 40]);
      return { type: 'Feature', properties: {}, geometry: { type: 'Polygon', coordinates: [ring] } } as Feature;
    }),
  );
}

/** Flatten `src` arrays to strings so mapshaper can carry them. */
function flatSrc(fc: FeatureCollection): FeatureCollection {
  return toFc(fc.features.map((f) => ({ ...f, properties: { ...f.properties, src: (f.properties?.src as string[] | undefined)?.join(',') ?? '' } })));
}

function signedArea(ring: Position[]): number {
  let a = 0;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) a += ((ring[j]![0] ?? 0) - (ring[i]![0] ?? 0)) * ((ring[j]![1] ?? 0) + (ring[i]![1] ?? 0));
  return a / 2;
}

/** RFC 7946 winding: outer rings counter-clockwise, holes clockwise (MapLibre tells holes by winding). */
function rewind(poly: Position[][]): Position[][] {
  return poly.map((ring, i) => {
    const ccw = signedArea(ring) > 0;
    return (i === 0) === ccw ? ring : ring.slice().reverse();
  });
}

function finalise(fc: FeatureCollection): Feature[] {
  const out: Feature[] = [];
  for (const f of areaFeatures(fc)) {
    const p = f.properties ?? {};
    const polys = (f.geometry.type === 'Polygon' ? [f.geometry.coordinates] : f.geometry.coordinates)
      .map((poly) => rewind(poly.filter((r) => r.length >= 4)))
      .filter((poly) => poly.length > 0);
    if (!polys.length) continue;
    const properties: Record<string, unknown> = { holder: p.holder };
    if (p.label_en) properties.label = p.label_zh ? { en: p.label_en, zh: p.label_zh } : { en: p.label_en };
    const raw = p.src as unknown;
    const ids = [...new Set((Array.isArray(raw) ? raw : [raw]).flatMap((s) => String(s ?? '').split(',')).filter(Boolean))];
    if (ids.length) properties.src = ids.sort((a, b) => Number(a.slice(1)) - Number(b.slice(1)));
    out.push({
      type: 'Feature',
      properties,
      geometry: polys.length === 1 ? { type: 'Polygon', coordinates: polys[0]! } : { type: 'MultiPolygon', coordinates: polys },
    });
  }
  return out.sort((a, b) => String(a.properties?.holder).localeCompare(String(b.properties?.holder)) || String((a.properties?.label as { en?: string } | undefined)?.en ?? '').localeCompare(String((b.properties?.label as { en?: string } | undefined)?.en ?? '')));
}

async function simplifyKeyframe(fc: FeatureCollection, fine: number, coarse: number): Promise<Feature[]> {
  const a = flatSrc(fc);
  const focus = boxes(FOCUS);
  const simplify = (km: number, islandKm2: number) => `-simplify interval=${km * 1000} keep-shapes -filter-islands min-area=${islandKm2}km2`;
  const inside = await mapshaper(`-i a.json focus.json combine-files -clip target=a focus ${simplify(fine, 20)}`, { a, focus });
  const outside = await mapshaper(`-i a.json focus.json combine-files -erase target=a focus ${simplify(coarse, 300)}`, { a, focus });
  const out = await mapshaper(
    `-i a.json -dissolve2 holder,label_en,label_zh calc='src=collect(src)' -clean`,
    { a: toFc([...inside.features, ...outside.features]) },
    'precision=0.01',
  );
  return finalise(out);
}

function serialise(keyframes: { t: string; features: Feature[] }[]): string {
  const kf = keyframes.map(
    (k) =>
      `    {\n      "t": ${JSON.stringify(k.t)},\n      "features": {\n        "type": "FeatureCollection",\n        "features": [\n${k.features
        .map((f) => `          ${JSON.stringify(f)}`)
        .join(',\n')}\n        ]\n      }\n    }`,
  );
  return `{\n  "keyframes": [\n${kf.join(',\n')}\n  ]\n}\n`;
}

async function main(): Promise<void> {
  const sources = loadSources();
  const inputs: { t: string; fc: FeatureCollection }[] = [];
  for (const k of sources.keyframes) {
    const path = workFile(`${k.id}.geojson`);
    if (!existsSync(path)) {
      warn(`missing work/${k.id}.geojson (run compose.ts) — keyframe skipped`);
      continue;
    }
    inputs.push({ t: k.t, fc: readJson<FeatureCollection>(path) });
  }
  const budget = (BUDGET_TOTAL * inputs.length) / PLANNED_KEYFRAMES;
  const build = async (fine: number, coarse: number) => {
    const kfs = [];
    for (const i of inputs) kfs.push({ t: i.t, features: await simplifyKeyframe(i.fc, fine, coarse) });
    return serialise(kfs);
  };
  let fine = values.fine ? Number(values.fine) : 4;
  const coarse = values.coarse ? Number(values.coarse) : 50;
  let text = await build(fine, coarse);
  if (!values.fine) {
    while (Buffer.byteLength(text) > budget && fine < 30) {
      fine = Math.round(fine * 1.15 * 10) / 10;
      text = await build(fine, coarse);
    }
  }
  const file = join(TOPIC, 'data', 'control.json');
  writeFileSync(file, text);
  const size = statSync(file).size;
  log(`control.json: ${inputs.length} keyframes, interval ${fine} km in focus areas / ${coarse} km elsewhere, ${(size / 1024).toFixed(0)} KB (budget ${(budget / 1024).toFixed(0)} KB = 1.5 MB × ${inputs.length}/${PLANNED_KEYFRAMES})`);
  if (size > budget) warn('control.json is over budget');
}

await main();
