/**
 * Step 5 — simplify the composed keyframes and write the topic data file
 * src/content/topics/ww2/data/control.json, in the TopoJSON shape: one shared
 * topology, `{ topology, keyframes: [{ t, object }] }` (see docs/06 "TimeScene").
 *
 *   pnpm tsx scripts/geo/ww2/simplify.ts                          # auto: finest interval that fits the budget
 *   pnpm tsx scripts/geo/ww2/simplify.ts --fine 3 --coarse 50     # fixed intervals in km
 *   pnpm tsx scripts/geo/ww2/simplify.ts --budget 2.0 --quant 50000 --method dp --no-measure
 *   pnpm tsx scripts/geo/ww2/simplify.ts --out /tmp/control.json  # write elsewhere (default: the topic's data/control.json)
 *   pnpm tsx scripts/geo/ww2/simplify.ts --islands 20,300         # drop detached parts under these km² (focus, elsewhere)
 *
 * Input: work/K#.geojson from compose.ts (plain GeoJSON per keyframe — the
 * intermediate; compose.ts is unchanged and this script never edits it).
 *
 * Topology-preserving, and across keyframes: all keyframes go into ONE
 * mapshaper dataset, so a border shared by two holders — or by two keyframes —
 * is one arc, simplified once, stored once. Detail is regional: each keyframe is
 * cut along the focus boxes (the theatres the chapters zoom into: Europe /
 * North Africa / Middle East, and East and Southeast Asia / western Pacific).
 * Inside, the `fine` interval applies (detached islands under 20 km² dropped),
 * outside the `coarse` one (300 km²). The halves meet on the straight box edges
 * and are dissolved back per holder. Method `dp` (Douglas–Peucker) makes the
 * interval a genuine deviation bound; `weighted` (Visvalingam) is smoother but
 * drops thin fjords wholesale. keep-shapes either way. Output: TopoJSON with
 * quantisation (`--quant` grid points across the data extent; 5e4 ≈ 0.8 km
 * cells at the equator, half that at 60°N) and delta-coded arcs.
 *
 * THE KNOB — size budget: `--budget` MB for the 12 keyframes of docs/09 §4.2
 * (default 2.0), pro rata for fewer: 2.0 MB × (keyframes present / 12). Without
 * --fine the script starts at 1.5 km and adds 0.25 km until the file fits, so
 * the tolerance you get is what the budget allows; more keyframes → coarser. A
 * fixed --fine skips the search.
 *
 * Reported "deviation": distance from the original vertices (work/K#.geojson)
 * inside the focus boxes to the written boundaries, in km (p50 / p95 / p99 /
 * max). Islands dropped on purpose are excluded; the max still shows the odd
 * peninsula tip or islet that `keep-shapes` / cleaning removed.
 */
import { createRequire } from 'node:module';
import { existsSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { parseArgs } from 'node:util';
import type { Feature, FeatureCollection, Position } from 'geojson';
import { TOOLS, TOPIC, areaFeatures, loadSources, log, mapshaper, readJson, toFc, toolsInstalled, warn, workFile } from './lib';

const PLANNED_KEYFRAMES = 12;
/** [west, south, east, north] boxes that keep the fine interval. */
const FOCUS: [number, number, number, number][] = [
  [-12, 28, 62, 72], // Europe, North Africa coast, Middle East
  [88, -12, 160, 56], // East and Southeast Asia, western Pacific
];
/** Auto search: start here and add this much (km) until the file fits. */
const FINE_START = 1.5;
const FINE_STEP = 0.25;
/** Detached parts smaller than this are dropped (km²), inside / outside the focus boxes (`--islands fine,coarse`). */
let FOCUS_ISLAND_KM2 = 20;
let COARSE_ISLAND_KM2 = 300;

const { values } = parseArgs({
  options: {
    fine: { type: 'string' },
    coarse: { type: 'string' },
    budget: { type: 'string' },
    quant: { type: 'string' },
    out: { type: 'string' },
    islands: { type: 'string' },
    method: { type: 'string' },
    'no-measure': { type: 'boolean', default: false },
  },
});
/** MB for the 12 planned keyframes. */
const BUDGET_MB = values.budget ? Number(values.budget) : 2.0;
/** `dp` (Douglas–Peucker: the interval is a real maximum-deviation tolerance) or `weighted` (Visvalingam: smoother, but drops thin fjords). */
const METHOD = values.method ?? 'dp';
const QUANTIZATION = values.quant ? Number(values.quant) : 50_000;
if (values.islands) [FOCUS_ISLAND_KM2 = FOCUS_ISLAND_KM2, COARSE_ISLAND_KM2 = COARSE_ISLAND_KM2] = values.islands.split(',').map(Number);

/* ------------------------------------------------------------------ */
/* mapshaper                                                           */
/* ------------------------------------------------------------------ */

interface Mapshaper {
  applyCommands(cmd: string, input: Record<string, unknown>): Promise<Record<string, Buffer | string>>;
}
const ms = (): Mapshaper => {
  if (!toolsInstalled()) throw new Error('pipeline tools missing: run `pnpm tsx scripts/geo/ww2/fetch.ts` first');
  return createRequire(join(TOOLS, 'package.json'))('mapshaper') as Mapshaper;
};

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
  return toFc(
    fc.features.map((f) => ({
      ...f,
      properties: {
        holder: f.properties?.holder,
        label_en: f.properties?.label_en ?? '',
        label_zh: f.properties?.label_zh ?? '',
        src: (f.properties?.src as string[] | undefined)?.join(',') ?? '',
      },
    })),
  );
}

/** The inside/outside split of one keyframe (cut once; independent of the intervals). */
async function cutKeyframe(fc: FeatureCollection): Promise<{ inside: FeatureCollection; outside: FeatureCollection }> {
  const a = flatSrc(fc);
  const focus = boxes(FOCUS);
  const inside = await mapshaper('-i a.json focus.json combine-files -clip target=a focus', { a, focus });
  const outside = await mapshaper('-i a.json focus.json combine-files -erase target=a focus', { a, focus });
  return { inside, outside };
}

type Cut = Awaited<ReturnType<typeof cutKeyframe>>;

/** Wire-format TopoJSON as mapshaper writes it. */
interface Topo {
  type: 'Topology';
  transform?: { scale: [number, number]; translate: [number, number] };
  arcs: number[][][];
  objects: Record<string, { type: string; geometries: { type: string | null; properties?: Record<string, unknown>; arcs?: unknown }[] }>;
}

/**
 * Simplify all keyframes together: fine inside, coarse outside, merged and
 * dissolved per holder, exported as one topology (objects named by keyframe id).
 */
async function build(ids: string[], cuts: Cut[], fine: number, coarse: number): Promise<{ topo: Topo; geojson: Record<string, FeatureCollection> }> {
  const m = ms();
  const part = async (which: 'inside' | 'outside', km: number, islandKm2: number) => {
    const files: Record<string, unknown> = {};
    ids.forEach((id, i) => (files[`${id}.json`] = cuts[i]![which]));
    const out = await m.applyCommands(
      `-i ${ids.map((id) => `${id}.json`).join(' ')} combine-files -simplify ${METHOD === 'dp' ? 'dp' : 'weighted'} interval=${km * 1000} keep-shapes -filter-islands min-area=${islandKm2}km2 -o format=geojson precision=0.0001 target=*`,
      files,
    );
    const byId: Record<string, FeatureCollection> = {};
    for (const id of ids) {
      const raw = out[`${id}.json`];
      byId[id] = raw ? (JSON.parse(raw.toString()) as FeatureCollection) : toFc([]);
    }
    return byId;
  };
  const inside = await part('inside', fine, FOCUS_ISLAND_KM2);
  const outside = await part('outside', coarse, COARSE_ISLAND_KM2);
  const merged: Record<string, unknown> = {};
  for (const id of ids) merged[`${id}.json`] = toFc([...inside[id]!.features, ...outside[id]!.features]);
  const dissolved = await m.applyCommands(
    `-i ${ids.map((id) => `${id}.json`).join(' ')} combine-files -dissolve2 holder,label_en,label_zh calc='src=collect(src)' target=* -clean target=* ` +
      `-o format=geojson precision=0.0001 target=*`,
    merged,
  );
  const geojson: Record<string, FeatureCollection> = {};
  for (const id of ids) geojson[id] = JSON.parse((dissolved[`${id}.json`] ?? '{"type":"FeatureCollection","features":[]}').toString()) as FeatureCollection;
  // One dataset again for the export, so identical borders across keyframes become shared arcs.
  const files: Record<string, unknown> = {};
  for (const id of ids) files[`${id}.json`] = geojson[id];
  const out = await m.applyCommands(
    `-i ${ids.map((id) => `${id}.json`).join(' ')} combine-files -o out.json format=topojson quantization=${QUANTIZATION} target=*`,
    files,
  );
  const raw = out['out.json'] ?? Object.values(out)[0];
  if (raw === undefined) throw new Error('mapshaper wrote no topology');
  return { topo: JSON.parse(raw.toString()) as Topo, geojson };
}

/* ------------------------------------------------------------------ */
/* Output                                                              */
/* ------------------------------------------------------------------ */

/** Final per-geometry properties: `{ holder, label?, src? }`, as the schema's control feature wants. */
function finalProps(p: Record<string, unknown> | undefined): Record<string, unknown> {
  const out: Record<string, unknown> = { holder: p?.holder };
  if (p?.label_en) out.label = p.label_zh ? { en: p.label_en, zh: p.label_zh } : { en: p.label_en };
  const raw = p?.src as unknown;
  const ids = [...new Set((Array.isArray(raw) ? raw : [raw]).flatMap((s) => String(s ?? '').split(',')).filter(Boolean))];
  if (ids.length) out.src = ids.sort((a, b) => Number(a.slice(1)) - Number(b.slice(1)));
  return out;
}

function finalise(topo: Topo, ids: string[]): Topo {
  for (const id of ids) {
    const obj = topo.objects[id];
    if (!obj) throw new Error(`topology lost keyframe object ${id}`);
    obj.geometries = obj.geometries
      .filter((g) => g.type !== null && g.arcs !== undefined)
      .map((g) => ({ ...g, properties: finalProps(g.properties) }))
      .sort((a, b) => String(a.properties.holder).localeCompare(String(b.properties.holder)) || String((a.properties.label as { en?: string } | undefined)?.en ?? '').localeCompare(String((b.properties.label as { en?: string } | undefined)?.en ?? '')));
  }
  // Only the keyframes' objects survive; keys in a stable order.
  topo.objects = Object.fromEntries(ids.map((id) => [id, topo.objects[id]!]));
  return topo;
}

/** control.json text: the topology on one line per arc group, keyframes spelled out. */
function serialise(topo: Topo, keyframes: { t: string; object: string }[]): string {
  const { arcs, objects, ...head } = topo;
  const lines = [
    '{',
    '  "topology": {',
    ...Object.entries(head).map(([k, v]) => `    ${JSON.stringify(k)}: ${JSON.stringify(v)},`),
    '    "arcs": [',
    arcs.map((a) => `      ${JSON.stringify(a)}`).join(',\n'),
    '    ],',
    '    "objects": {',
    Object.entries(objects)
      .map(([k, o]) => `      ${JSON.stringify(k)}: {\n        "type": ${JSON.stringify(o.type)},\n        "geometries": [\n${o.geometries.map((g) => `          ${JSON.stringify(g)}`).join(',\n')}\n        ]\n      }`)
      .join(',\n'),
    '    }',
    '  },',
    '  "keyframes": [',
    keyframes.map((k) => `    ${JSON.stringify(k)}`).join(',\n'),
    '  ]',
    '}',
    '',
  ];
  return lines.join('\n');
}

/* ------------------------------------------------------------------ */
/* Deviation: original focus-box vertices -> written boundary          */
/* ------------------------------------------------------------------ */

function decodeRings(topo: Topo, id: string): Position[][] {
  const [sx, sy] = topo.transform?.scale ?? [1, 1];
  const [tx, ty] = topo.transform?.translate ?? [0, 0];
  const arcs: Position[][] = topo.arcs.map((arc) => {
    let x = 0;
    let y = 0;
    return arc.map(([dx = 0, dy = 0]) => {
      if (topo.transform) {
        x += dx;
        y += dy;
        return [x * sx + tx, y * sy + ty];
      }
      return [dx, dy];
    });
  });
  const arcAt = (i: number): Position[] => (i >= 0 ? arcs[i]! : arcs[~i]!.slice().reverse());
  const ringOf = (list: number[]): Position[] => list.flatMap((i, k) => (k === 0 ? arcAt(i) : arcAt(i).slice(1)));
  const rings: Position[][] = [];
  for (const g of topo.objects[id]!.geometries) {
    if (g.type === 'Polygon') for (const r of g.arcs as number[][]) rings.push(ringOf(r));
    else if (g.type === 'MultiPolygon') for (const p of g.arcs as number[][][]) for (const r of p) rings.push(ringOf(r));
  }
  return rings;
}

const inFocus = ([x = 0, y = 0]: readonly number[]) => FOCUS.some(([w, s, e, n]) => x >= w && x <= e && y >= s && y <= n);

/** km per degree of latitude; longitude is scaled by cos(lat) of the point. */
const KM_LAT = 111.195;

function measure(topo: Topo, ids: string[], originals: FeatureCollection[], droppedIslands: boolean): { p50: number; p95: number; p99: number; max: number; n: number } {
  const dev: number[] = [];
  ids.forEach((id, k) => {
    // Grid of the written segments (0.5° cells) for nearest-segment queries.
    const cell = 0.5;
    const grid = new Map<string, [number, number, number, number][]>();
    const key = (cx: number, cy: number) => `${cx},${cy}`;
    for (const ring of decodeRings(topo, id)) {
      for (let i = 0; i + 1 < ring.length; i++) {
        const a = ring[i]!;
        const b = ring[i + 1]!;
        const seg: [number, number, number, number] = [a[0]!, a[1]!, b[0]!, b[1]!];
        const x0 = Math.floor(Math.min(a[0]!, b[0]!) / cell);
        const x1 = Math.floor(Math.max(a[0]!, b[0]!) / cell);
        const y0 = Math.floor(Math.min(a[1]!, b[1]!) / cell);
        const y1 = Math.floor(Math.max(a[1]!, b[1]!) / cell);
        for (let cx = x0; cx <= x1; cx++) for (let cy = y0; cy <= y1; cy++) (grid.get(key(cx, cy)) ?? grid.set(key(cx, cy), []).get(key(cx, cy))!).push(seg);
      }
    }
    const dist = (px: number, py: number, s: [number, number, number, number]) => {
      const kx = Math.cos((py * Math.PI) / 180) * KM_LAT;
      const ax = (s[0] - px) * kx;
      const ay = (s[1] - py) * KM_LAT;
      const bx = (s[2] - px) * kx;
      const by = (s[3] - py) * KM_LAT;
      const dx = bx - ax;
      const dy = by - ay;
      const l2 = dx * dx + dy * dy;
      const u = l2 === 0 ? 0 : Math.max(0, Math.min(1, -(ax * dx + ay * dy) / l2));
      return Math.hypot(ax + u * dx, ay + u * dy);
    };
    for (const f of areaFeatures(originals[k]!)) {
      const polys = f.geometry.type === 'Polygon' ? [f.geometry.coordinates] : f.geometry.coordinates;
      for (const poly of polys) {
        const ring = poly[0]!;
        // Skip tiny detached parts: they are dropped on purpose (`filter-islands`).
        if (droppedIslands && ringKm2(ring) < FOCUS_ISLAND_KM2 * 1.5) continue;
        for (let i = 0; i < ring.length; i += 2) {
          const [px = 0, py = 0] = ring[i]!;
          if (!inFocus([px, py])) continue;
          let best = Infinity;
          const cx = Math.floor(px / cell);
          const cy = Math.floor(py / cell);
          for (let r = 0; r <= 4 && best > r * cell * 90; r++)
            for (let ix = cx - r; ix <= cx + r; ix++)
              for (let iy = cy - r; iy <= cy + r; iy++) {
                if (Math.max(Math.abs(ix - cx), Math.abs(iy - cy)) !== r) continue;
                for (const s of grid.get(key(ix, iy)) ?? []) best = Math.min(best, dist(px, py, s));
              }
          if (Number.isFinite(best)) dev.push(best);
        }
      }
    }
  });
  dev.sort((a, b) => a - b);
  const q = (p: number) => dev[Math.min(dev.length - 1, Math.floor(p * dev.length))] ?? 0;
  return { p50: q(0.5), p95: q(0.95), p99: q(0.99), max: dev[dev.length - 1] ?? 0, n: dev.length };
}

/** Planar-ish ring area in km² (good enough to tell islands from mainland). */
function ringKm2(ring: readonly Position[]): number {
  let a = 0;
  let lat = 0;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    a += ((ring[j]![0] ?? 0) - (ring[i]![0] ?? 0)) * ((ring[j]![1] ?? 0) + (ring[i]![1] ?? 0));
    lat += ring[i]![1] ?? 0;
  }
  const kx = Math.cos(((lat / ring.length) * Math.PI) / 180) * KM_LAT;
  return Math.abs((a / 2) * kx * KM_LAT);
}

/* ------------------------------------------------------------------ */
/* Main                                                                */
/* ------------------------------------------------------------------ */

async function main(): Promise<void> {
  const sources = loadSources();
  const ids: string[] = [];
  const ts: string[] = [];
  const originals: FeatureCollection[] = [];
  for (const k of sources.keyframes) {
    const path = workFile(`${k.id}.geojson`);
    if (!existsSync(path)) {
      warn(`missing work/${k.id}.geojson (run compose.ts) — keyframe skipped`);
      continue;
    }
    ids.push(k.id);
    ts.push(k.t);
    originals.push(readJson<FeatureCollection>(path));
  }
  if (!ids.length) throw new Error('no composed keyframes in work/');
  const budget = (BUDGET_MB * 1024 * 1024 * ids.length) / PLANNED_KEYFRAMES;
  log(`cutting ${ids.length} keyframes along the focus boxes…`);
  const cuts: Cut[] = [];
  for (const fc of originals) cuts.push(await cutKeyframe(fc));

  const coarse = values.coarse ? Number(values.coarse) : 50;
  const keyframes = ids.map((id, i) => ({ t: ts[i]!, object: id }));
  let fine = values.fine ? Number(values.fine) : FINE_START;
  let result = await build(ids, cuts, fine, coarse);
  let text = serialise(finalise(result.topo, ids), keyframes);
  if (!values.fine) {
    while (Buffer.byteLength(text) > budget && fine < 40) {
      log(`  fine ${fine} km: ${(Buffer.byteLength(text) / 1024).toFixed(0)} KB > ${(budget / 1024).toFixed(0)} KB`);
      fine += FINE_STEP;
      result = await build(ids, cuts, fine, coarse);
      text = serialise(finalise(result.topo, ids), keyframes);
    }
  }
  const file = values.out ? resolve(values.out) : join(TOPIC, 'data', 'control.json');
  writeFileSync(file, text);
  const size = statSync(file).size;
  log(
    `${file}: ${ids.length} keyframes, interval ${fine} km in focus areas / ${coarse} km elsewhere, quantisation ${QUANTIZATION}, ${(size / 1024).toFixed(0)} KB ` +
      `(budget ${(budget / 1024).toFixed(0)} KB = ${BUDGET_MB} MB × ${ids.length}/${PLANNED_KEYFRAMES}), ${result.topo.arcs.length} arcs`,
  );
  if (size > budget) warn('control.json is over budget');
  if (!values['no-measure']) {
    const d = measure(JSON.parse(readFileSync(file, 'utf8')).topology as Topo, ids, originals, true);
    log(`deviation of original focus-box vertices from the written boundary (km): p50 ${d.p50.toFixed(2)}, p95 ${d.p95.toFixed(2)}, p99 ${d.p99.toFixed(2)}, max ${d.max.toFixed(2)} (${d.n} vertices)`);
  }
}

await main();
