/**
 * Step 5 — simplify the composed keyframes and write the topic data file
 * src/content/topics/<slug>/data/control.json, in the TopoJSON shape: one shared
 * topology, `{ topology, keyframes: [{ t, object }] }` (see docs/06 "TimeScene").
 *
 *   pnpm tsx scripts/geo/lib/simplify.ts --topic <slug>                          # auto: finest interval that fits the budget
 *   pnpm tsx scripts/geo/lib/simplify.ts --topic <slug> --fine 3 --coarse 50     # fixed intervals in km
 *   pnpm tsx scripts/geo/lib/simplify.ts --topic <slug> --budget 2.0 --quant 400000 --method dp --no-measure
 *   pnpm tsx scripts/geo/lib/simplify.ts --topic <slug> --out /tmp/control.json  # write elsewhere (default: the topic's data/control.json)
 *   pnpm tsx scripts/geo/lib/simplify.ts --topic <slug> --islands 20,300         # drop detached parts under these km² (focus, elsewhere)
 *
 * Every knob has a default in sources.json `pipeline` (manifest.ts
 * `PipelineConfig`; the defaults are the ww2 values quoted below); the flags
 * override it for one run.
 *
 * Input: work/K#.geojson from compose.ts (plain GeoJSON per keyframe — the
 * intermediate; compose.ts is unchanged and this script never edits it).
 *
 * Topology-preserving, and across keyframes: all keyframes go into ONE
 * mapshaper dataset, so a border shared by two holders — or by two keyframes —
 * is one arc, simplified once, stored once. Detail is regional: each keyframe is
 * cut along the focus boxes (`pipeline.focus`, the theatres the chapters zoom
 * into; ww2: Europe / North Africa / Middle East, and East and Southeast Asia /
 * western Pacific). Inside, the `fine` interval applies (detached islands under
 * `islandsKm2.focus` = 20 km² dropped), outside the `coarse` one (300 km²). The halves meet on the straight box edges
 * and are dissolved back per holder. Method `dp` (Douglas–Peucker) makes the
 * interval a genuine deviation bound; `weighted` (Visvalingam) is smoother but
 * drops thin fjords wholesale. keep-shapes either way. Output: TopoJSON with
 * quantisation (`--quant` grid points across the data extent; default 4e5 ≈
 * 0.1 km cells at the equator, half that at 60°N) and delta-coded arcs.
 *
 * Coast, everywhere (`pipeline.coast`): after simplification every keyframe
 * follows the basemap's own land (`followCoast`): water erased, land the
 * simplified polygons missed given to the nearest holder. The land is
 * `coast.land` (the 1:50m basemap `public/geo/land-50m.json`) worldwide and
 * `coast.detailLand` (the 1:10m `public/geo/land-10m-sea.json`) inside
 * `coast.detailBox` (the Southeast Asia box of scripts/build-geo.ts; with both
 * null the 50m land is used everywhere), so the control tint stops exactly where the one
 * drawn coastline is, at every zoom (Singapore island at zoom 10). Land
 * is handed over within `GAP_KM` (6 km) of a holder in the focus boxes and
 * within the coarse interval (50 km: that is how far the coarse simplification
 * can move a coast) elsewhere; further than that it stays uncoloured. The
 * borders between holders keep their tolerance; clipping before simplifying
 * would only get the coast thinned out again (and 1.5 km corner cuts would
 * leave land uncovered), and a coarser quantisation would snap it to a grid
 * wider than the 10m vertex spacing. The clipped coast arcs are the same in
 * every keyframe, so they are stored once. At run time the engine draws edges
 * only along arcs shared by two holders (lib/control.ts `frontierOf`), never
 * along the coast. `--no-coast` skips the step.
 *
 * THE KNOB — size budget: `--budget` MB (`budgetMB`, default 2.0) for the
 * `plannedKeyframes` (12, docs/09 §4.2), pro rata for fewer: 2.0 MB × (keyframes
 * present / 12). Without --fine the script starts at `fineStartKm` (1.5 km) and
 * adds `fineStepKm` (0.25 km) until the file fits, so
 * the tolerance you get is what the budget allows; more keyframes → coarser. A
 * fixed --fine skips the search.
 *
 * Reported "deviation": distance from the original vertices (work/K#.geojson)
 * inside the focus boxes (not those within `COAST_SKIP_KM` of the basemap
 * coast or out at sea when `followCoast` is on: there the boundary is the basemap) to the
 * written boundaries, in km (p50 / p95 / p99 / max). Islands dropped on purpose are excluded; the max still shows the odd
 * peninsula tip or islet that `keep-shapes` / cleaning removed.
 */
import { existsSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { parseArgs } from 'node:util';
import { feature as topoFeature } from 'topojson-client';
import type { Feature, FeatureCollection, Position } from 'geojson';
import { areaFeatures, log, mapshaper, mapshaperApi, pointInPolygon, readJson, toFc, warn } from './common';
import type { Box } from './manifest';
import { openTopic, repoPath } from './topic';

const { values } = parseArgs({
  options: {
    topic: { type: 'string' },
    fine: { type: 'string' },
    coarse: { type: 'string' },
    budget: { type: 'string' },
    quant: { type: 'string' },
    out: { type: 'string' },
    islands: { type: 'string' },
    method: { type: 'string' },
    'no-measure': { type: 'boolean', default: false },
    'no-coast': { type: 'boolean', default: false },
  },
});
const topic = openTopic(values.topic);
const config = topic.config;

const PLANNED_KEYFRAMES = config.plannedKeyframes;
/** [west, south, east, north] boxes that keep the fine interval. */
const FOCUS: Box[] = config.focus;
/** The detail basemap box and file (ww2: scripts/build-geo.ts `SEA_BBOX`, 1:10m): inside it the coast is the detail land; null = none. */
const COAST_BOX: Box | null = config.coast.detailBox;
const COAST_LAND_DETAIL = config.coast.detailLand === null ? null : repoPath(config.coast.detailLand);
const COAST_LAND = repoPath(config.coast.land);
/** The control data's extent: coast and water outside it do not matter (Antarctica is closed along the pole, which a planar clip would choke on). */
const WORLD_BOX: Box = config.coast.worldBox;
/** In the focus boxes, land the simplified polygons miss goes to a holder at most this far (km) away; elsewhere the coarse interval is the reach. Detached pieces under `COAST_ISLAND_KM2` are dropped. */
const GAP_KM = config.coast.gapKm;
const COAST_ISLAND_KM2 = config.coast.islandKm2;
/** Outside the focus boxes the basemap coast is thinned to this tolerance (km) before the clip: invisible at the zoom those regions are shown at (<= 1 px), a third of the arcs. */
const COAST_OUT_KM = config.coast.outsideKm;
/** Deviation is not measured for original vertices this close (km) to the basemap coast: there the boundary is the basemap's. */
const COAST_SKIP_KM = config.coast.skipKm;
/** Auto search: start here and add this much (km) until the file fits. */
const FINE_START = config.fineStartKm;
const FINE_STEP = config.fineStepKm;
/** Detached parts smaller than this are dropped (km²), inside / outside the focus boxes (`--islands fine,coarse`). */
let FOCUS_ISLAND_KM2 = config.islandsKm2.focus;
let COARSE_ISLAND_KM2 = config.islandsKm2.coarse;
/** MB for the planned keyframes. */
const BUDGET_MB = values.budget ? Number(values.budget) : config.budgetMB;
/** `dp` (Douglas–Peucker: the interval is a real maximum-deviation tolerance) or `weighted` (Visvalingam: smoother, but drops thin fjords). */
const METHOD = values.method ?? config.method;
const QUANTIZATION = values.quant ? Number(values.quant) : config.quantization;
/**
 * Post-quantisation clean: vertices closer than SNAP_DEG (at least one grid cell,
 * and at least SNAP_MIN_DEG ≈ 0.5 km) are merged, and rings under SLIVER_KM2 km²
 * (collapsed holes, specks) dropped. Narrower necks and near-touching parts of a
 * ring (a 50 km border chord passing 300 m from a lake shore, ww1 Canada; the
 * Petsamo spike of Finland) cross once MapLibre's geojson-vt quantises them into
 * low-zoom tiles, and earcut then fills a stray wedge across the map.
 */
const SNAP_MIN_DEG = 0.005;
const SNAP_DEG = Math.max(360 / QUANTIZATION, SNAP_MIN_DEG);
const SLIVER_KM2 = 1;
/** Cut control areas to the basemap land (`pipeline.coast.enabled`; `--no-coast` skips it). */
const COAST = config.coast.enabled && !values['no-coast'];
if (values.islands) [FOCUS_ISLAND_KM2 = FOCUS_ISLAND_KM2, COARSE_ISLAND_KM2 = COARSE_ISLAND_KM2] = values.islands.split(',').map(Number);

/* ------------------------------------------------------------------ */
/* mapshaper                                                           */
/* ------------------------------------------------------------------ */

function boxes(list: Box[]): FeatureCollection {
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

/** The basemap's land (`COAST_LAND` worldwide, `COAST_LAND_DETAIL` inside `COAST_BOX`) and the open water around it, split by the focus boxes. */
interface Coast {
  /** Land inside the focus boxes / outside them (where the gap is filled within different reaches). */
  landIn: FeatureCollection;
  landOut: FeatureCollection;
  /** `WORLD_BOX` minus all land (thinned outside the focus boxes). */
  water: FeatureCollection;
}

/** `fc` with every polygon that reaches past ±180° also copied to the other side of the antimeridian (build-geo.ts makes rings longitude-continuous, control data is wrapped). */
function withWrappedCopies(fc: FeatureCollection): FeatureCollection {
  const shift = (pos: Position, d: number): Position => [(pos[0] ?? 0) + d, pos[1] ?? 0];
  const out: Feature[] = [...fc.features];
  for (const f of fc.features) {
    const g = f.geometry;
    const polys = g.type === 'Polygon' ? [g.coordinates] : g.type === 'MultiPolygon' ? g.coordinates : [];
    for (const poly of polys) {
      const xs = poly[0]!.map((p) => p[0] ?? 0);
      const lo = Math.min(...xs);
      const hi = Math.max(...xs);
      for (const [wanted, d] of [[hi > 180, -360], [lo < -180, 360]] as const) {
        if (wanted) out.push({ type: 'Feature', properties: {}, geometry: { type: 'Polygon', coordinates: poly.map((r) => r.map((p) => shift(p, d))) } });
      }
    }
  }
  return toFc(out);
}

type Topology = Parameters<typeof topoFeature>[0];
type TopoObject = Parameters<typeof topoFeature>[1];

/**
 * A land file: GeoJSON as is, or TopoJSON decoded object by object. Features
 * tagged with `kind` (the 1:10m basemap has `land`, `coast` and `frame`) keep
 * only `kind: land`.
 */
function readLand(file: string): FeatureCollection {
  const data = readJson<FeatureCollection | Topology>(file);
  if (data.type !== 'Topology') return data;
  const topo = data;
  const all = Object.values(topo.objects).flatMap((o) => (topoFeature(topo, o as TopoObject) as unknown as FeatureCollection).features);
  const tagged = all.some((f) => f.properties?.kind !== undefined);
  const land = toFc(tagged ? all.filter((f) => f.properties?.kind === 'land') : all);
  if (!land.features.length) throw new Error(`${file} has no land`);
  return land;
}

async function loadCoast(): Promise<Coast> {
  const base = withWrappedCopies(readLand(COAST_LAND));
  const world = boxes([WORLD_BOX]);
  const focus = boxes(FOCUS);
  let land: FeatureCollection;
  if (COAST_BOX && COAST_LAND_DETAIL) {
    // Base land without the detail box, plus the detail land that fills it.
    const detail = readLand(COAST_LAND_DETAIL);
    const outer = await mapshaper('-i land.json box.json world.json combine-files -erase target=land box -clip target=land world', { land: base, box: boxes([COAST_BOX]), world });
    land = toFc([...areaFeatures(outer), ...detail.features]);
  } else {
    const outer = await mapshaper('-i land.json world.json combine-files -clip target=land world', { land: base, world });
    land = toFc(areaFeatures(outer));
  }
  const landIn = await mapshaper('-i land.json focus.json combine-files -clip target=land focus', { land, focus });
  const outRaw = await mapshaper('-i land.json focus.json combine-files -erase target=land focus', { land, focus });
  const landOut = await mapshaper(`-i land.json -simplify dp interval=${COAST_OUT_KM * 1000} keep-shapes`, { land: outRaw });
  const water = await mapshaper('-i box.json land.json combine-files -erase target=box land', { box: world, land: toFc([...areaFeatures(landIn), ...areaFeatures(landOut)]) });
  return { landIn, landOut, water };
}

/**
 * Make one keyframe part follow the basemap coast: (1) erase the water, so
 * nothing is drawn out to sea; (2) give the land the simplified polygons miss
 * (their edges cut corners off the coast) to the nearest holder, as far as
 * `reachKm` from it: buffer the holders (`reachFrom`: the part as simplified,
 * or the source polygons when the simplification is coarse, so that land of
 * neighbours that hold nothing is not taken for 50 km), keep the buffer where
 * it covers uncovered `land` (the part's own region, so a part never takes
 * land of the other). Land further than that from every holder stays uncoloured. Pieces
 * of the same holder merge in the final dissolve; where two buffers meet,
 * `-dissolve2` resolves the overlap.
 */
async function followCoast(fc: FeatureCollection, land: FeatureCollection, water: FeatureCollection, reachKm: number, reachFrom: FeatureCollection = fc): Promise<FeatureCollection> {
  const dry = await mapshaper('-i a.json w.json combine-files -erase target=a w', { a: fc, w: water });
  const held = toFc(dry.features.filter((f) => f.geometry));
  if (!held.features.length) return held;
  const gap = await mapshaper('-i land.json a.json combine-files -erase target=land a', { land, a: held });
  if (!areaFeatures(gap).length) return held;
  const near = await mapshaper(`-i a.json -buffer radius=${reachKm}km`, { a: reachFrom === fc ? held : reachFrom });
  const fill = await mapshaper('-i b.json g.json combine-files -clip target=b g', { b: near, g: gap });
  return toFc([...held.features, ...areaFeatures(fill)]);
}

/**
 * Detached parts under `minKm2` dropped, except inside `COAST_BOX` (ww2:
 * Singapore, Johor and the Riau islands keep everything down to
 * `COAST_ISLAND_KM2`). Following the coast brings back every island the
 * simplification had dropped: those under the part's threshold are not worth
 * their arcs (no tint, the basemap still draws them).
 */
async function trimIslands(fc: FeatureCollection, minKm2: number): Promise<FeatureCollection> {
  if (!COAST_BOX) return toFc(areaFeatures(await mapshaper(`-i a.json -filter-islands min-area=${minKm2}km2`, { a: fc })));
  const box = boxes([COAST_BOX]);
  const rest = await mapshaper(`-i a.json b.json combine-files -erase target=a b -filter-islands min-area=${minKm2}km2`, { a: fc, b: box });
  const kept = await mapshaper('-i a.json b.json combine-files -clip target=a b', { a: fc, b: box });
  return toFc([...areaFeatures(rest), ...areaFeatures(kept)]);
}

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
async function build(ids: string[], cuts: Cut[], fine: number, coarse: number, coast: Coast | null): Promise<{ topo: Topo; geojson: Record<string, FeatureCollection> }> {
  const m = mapshaperApi();
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
  if (coast) {
    for (const [i, id] of ids.entries()) {
      inside[id] = await trimIslands(await followCoast(inside[id]!, coast.landIn, coast.water, GAP_KM), FOCUS_ISLAND_KM2);
      outside[id] = await trimIslands(await followCoast(outside[id]!, coast.landOut, coast.water, GAP_KM, cuts[i]!.outside), COARSE_ISLAND_KM2);
    }
  }
  const merged: Record<string, unknown> = {};
  for (const id of ids) merged[`${id}.json`] = toFc([...inside[id]!.features, ...outside[id]!.features]);
  const dissolved = await m.applyCommands(
    `-i ${ids.map((id) => `${id}.json`).join(' ')} combine-files -dissolve2 holder,label_en,label_zh calc='src=collect(src)' target=* ${coast ? `-filter-islands min-area=${COAST_ISLAND_KM2}km2 target=* ` : ''}-clean target=* ` +
      `-o format=geojson precision=0.0001 target=*`,
    merged,
  );
  const geojson: Record<string, FeatureCollection> = {};
  for (const id of ids) geojson[id] = JSON.parse((dissolved[`${id}.json`] ?? '{"type":"FeatureCollection","features":[]}').toString()) as FeatureCollection;
  // One dataset again for the export, so identical borders across keyframes become shared arcs.
  const files: Record<string, unknown> = {};
  for (const id of ids) files[`${id}.json`] = geojson[id];
  const first = await m.applyCommands(
    `-i ${ids.map((id) => `${id}.json`).join(' ')} combine-files -o out.json format=topojson quantization=${QUANTIZATION} target=*`,
    files,
  );
  const quantised = first['out.json'] ?? Object.values(first)[0];
  if (quantised === undefined) throw new Error('mapshaper wrote no topology');
  // Quantisation can collapse a small hole into a zero-area or self-touching ring and
  // make a simplified ring cross itself; MapLibre's triangulation (earcut) then draws
  // stray wedges across the map (ww1: a band from the Pacific to Montreal). Clean the
  // quantised topology once more (SNAP_DEG, SLIVER_KM2 above) and export again on the same grid.
  const out = await m.applyCommands(
    `-i topo.json -clean snap-interval=${SNAP_DEG} target=* -filter-slivers min-area=${SLIVER_KM2}km2 target=* -o out.json format=topojson quantization=${QUANTIZATION} target=*`,
    { 'topo.json': JSON.parse(quantised.toString()) as unknown },
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

type Seg = [number, number, number, number];
type SegGrid = Map<string, Seg[]>;
const GRID_CELL = 0.5;
const cellKey = (cx: number, cy: number) => `${cx},${cy}`;

/** Grid of segments (0.5° cells) for nearest-segment queries. */
function segGrid(rings: readonly (readonly Position[])[]): SegGrid {
  const grid: SegGrid = new Map();
  for (const ring of rings) {
    for (let i = 0; i + 1 < ring.length; i++) {
      const a = ring[i]!;
      const b = ring[i + 1]!;
      const seg: Seg = [a[0]!, a[1]!, b[0]!, b[1]!];
      const x0 = Math.floor(Math.min(a[0]!, b[0]!) / GRID_CELL);
      const x1 = Math.floor(Math.max(a[0]!, b[0]!) / GRID_CELL);
      const y0 = Math.floor(Math.min(a[1]!, b[1]!) / GRID_CELL);
      const y1 = Math.floor(Math.max(a[1]!, b[1]!) / GRID_CELL);
      for (let cx = x0; cx <= x1; cx++) for (let cy = y0; cy <= y1; cy++) (grid.get(cellKey(cx, cy)) ?? grid.set(cellKey(cx, cy), []).get(cellKey(cx, cy))!).push(seg);
    }
  }
  return grid;
}

const segDistKm = (px: number, py: number, s: Seg) => {
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

/** Distance (km) from a point to the nearest segment of the grid, Infinity beyond ~4 cells. */
function nearestKm(grid: SegGrid, px: number, py: number): number {
  let best = Infinity;
  const cx = Math.floor(px / GRID_CELL);
  const cy = Math.floor(py / GRID_CELL);
  for (let r = 0; r <= 4 && best > r * GRID_CELL * 90; r++)
    for (let ix = cx - r; ix <= cx + r; ix++)
      for (let iy = cy - r; iy <= cy + r; iy++) {
        if (Math.max(Math.abs(ix - cx), Math.abs(iy - cy)) !== r) continue;
        for (const s of grid.get(cellKey(ix, iy)) ?? []) best = Math.min(best, segDistKm(px, py, s));
      }
  return best;
}

const polyRings = (fc: FeatureCollection): Position[][] =>
  areaFeatures(fc).flatMap((f) => (f.geometry.type === 'Polygon' ? [f.geometry.coordinates] : f.geometry.coordinates).flatMap((poly) => poly));

/** Point-in-land test against the basemap land (polygon boxes first). */
function landIndex(coast: Coast): (x: number, y: number) => boolean {
  const polys = [...areaFeatures(coast.landIn), ...areaFeatures(coast.landOut)].flatMap((f) => (f.geometry.type === 'Polygon' ? [f.geometry.coordinates] : f.geometry.coordinates));
  const boxed = polys.map((poly) => {
    const xs = poly[0]!.map((p) => p[0] ?? 0);
    const ys = poly[0]!.map((p) => p[1] ?? 0);
    return { poly, w: Math.min(...xs), e: Math.max(...xs), s: Math.min(...ys), n: Math.max(...ys) };
  });
  return (x, y) => boxed.some((b) => x >= b.w && x <= b.e && y >= b.s && y <= b.n && pointInPolygon([x, y], b.poly));
}

function measure(topo: Topo, ids: string[], originals: FeatureCollection[], droppedIslands: boolean, coast: Coast | null): { p50: number; p95: number; p99: number; max: number; n: number } {
  const dev: number[] = [];
  const coastGrid = coast ? segGrid([...polyRings(coast.landIn), ...polyRings(coast.landOut)]) : null;
  const onLand = coast ? landIndex(coast) : null;
  ids.forEach((id, k) => {
    const grid = segGrid(decodeRings(topo, id));
    for (const f of areaFeatures(originals[k]!)) {
      const polys = f.geometry.type === 'Polygon' ? [f.geometry.coordinates] : f.geometry.coordinates;
      for (const poly of polys) {
        const ring = poly[0]!;
        // Skip tiny detached parts: they are dropped on purpose (`filter-islands`).
        if (droppedIslands && ringKm2(ring) < FOCUS_ISLAND_KM2 * 1.5) continue;
        for (let i = 0; i < ring.length; i += 2) {
          const [px = 0, py = 0] = ring[i]!;
          if (!inFocus([px, py])) continue;
          // Near the basemap coast the boundary is the basemap, not these vertices (coverage is reported separately).
          if (coastGrid && nearestKm(coastGrid, px, py) < COAST_SKIP_KM) continue;
          // Out at sea (the source map's sea or a coast further out than the skip distance): the water is erased on purpose.
          if (onLand && !onLand(px, py)) continue;
          const best = nearestKm(grid, px, py);
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
  const sources = topic.sources;
  const ids: string[] = [];
  const ts: string[] = [];
  const originals: FeatureCollection[] = [];
  for (const k of sources.keyframes) {
    const path = topic.workFile(`${k.id}.geojson`);
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

  const coarse = values.coarse ? Number(values.coarse) : config.coarseKm;
  const coast = COAST ? await loadCoast() : null;
  const keyframes = ids.map((id, i) => ({ t: ts[i]!, object: id }));
  let fine = values.fine ? Number(values.fine) : FINE_START;
  let result = await build(ids, cuts, fine, coarse, coast);
  let text = serialise(finalise(result.topo, ids), keyframes);
  if (!values.fine) {
    while (Buffer.byteLength(text) > budget && fine < 40) {
      log(`  fine ${fine} km: ${(Buffer.byteLength(text) / 1024).toFixed(0)} KB > ${(budget / 1024).toFixed(0)} KB`);
      fine += FINE_STEP;
      result = await build(ids, cuts, fine, coarse, coast);
      text = serialise(finalise(result.topo, ids), keyframes);
    }
  }
  const file = values.out ? resolve(values.out) : topic.controlFile;
  writeFileSync(file, text);
  const size = statSync(file).size;
  log(
    `${file}: ${ids.length} keyframes, interval ${fine} km in focus areas / ${coarse} km elsewhere, quantisation ${QUANTIZATION}, ${(size / 1024).toFixed(0)} KB ` +
      `(budget ${(budget / 1024).toFixed(0)} KB = ${BUDGET_MB} MB × ${ids.length}/${PLANNED_KEYFRAMES}), ${result.topo.arcs.length} arcs`,
  );
  if (size > budget) warn('control.json is over budget');
  if (!values['no-measure']) {
    const d = measure(JSON.parse(readFileSync(file, 'utf8')).topology as Topo, ids, originals, true, coast);
    log(`deviation of original focus-box vertices from the written boundary (km): p50 ${d.p50.toFixed(2)}, p95 ${d.p95.toFixed(2)}, p99 ${d.p99.toFixed(2)}, max ${d.max.toFixed(2)} (${d.n} vertices)`);
  }
}

await main();
