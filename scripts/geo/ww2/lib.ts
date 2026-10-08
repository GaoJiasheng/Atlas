/**
 * Shared helpers for the WWII real-map pipeline (scripts/geo/ww2/*.ts).
 *
 *   raw/     downloaded source data (fetch.ts, ohm-export.ts)     gitignored
 *   work/    intermediate GeoJSON (georef-svg.ts, compose.ts)      gitignored
 *   .tools/  mapshaper + osmtogeojson, installed by fetch.ts        gitignored
 *
 * Geometry operations (clip / erase / union / buffer / simplify) run through
 * mapshaper's in-memory API, which is robust on real coastlines. It lives in
 * `.tools/` so the pipeline never touches the app's package.json.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { join, resolve } from 'node:path';
import type { Feature, FeatureCollection, Geometry, MultiPolygon, Polygon, Position } from 'geojson';

export const HERE = import.meta.dirname;
export const ROOT = resolve(HERE, '../../..');
export const RAW = join(HERE, 'raw');
export const WORK = join(HERE, 'work');
export const TOOLS = join(HERE, '.tools');
export const TOPIC = join(ROOT, 'src/content/topics/ww2');
export const SHOTS = join(ROOT, 'docs/screenshots/ww2');

/** Tool versions installed into .tools/ by fetch.ts. */
export const TOOL_PACKAGES = ['mapshaper@0.6.121', 'osmtogeojson@3.0.0-beta.5'];

/* ------------------------------------------------------------------ */
/* sources.json                                                        */
/* ------------------------------------------------------------------ */

export interface Dataset {
  ref: string;
  title: string;
  url: string;
  file: string;
  page?: string;
  author?: string;
  license: string;
  role: string;
}

export interface ControlPoint {
  name: string;
  /** Known position [lng, lat] (decimal degrees, WGS84). */
  lnglat: [number, number];
  /** Position in SVG user units (after all transforms). */
  svg: [number, number];
}

export interface SvgSource {
  dataset: string;
  /** Map projection model fitted to the control points, or `auto`. */
  projection: string;
  /** Fill colour (lower-case #rrggbb) or `clip:<clipPath id>` -> class name. */
  classes: Record<string, string>;
  /** Fills that are land (the rest of the frame is sea, unless `sea` is given). */
  land: string[];
  /** Fills that are sea, for maps drawn on a land-coloured background. */
  sea?: string[];
  /** SVG-unit boxes [x0, y0, x1, y1] (legends, insets): shapes entirely inside are ignored. */
  exclude?: [number, number, number, number][];
  /** Residual budget in km (docs/09 §5.3: 30 Europe, 60 Asia-Pacific). */
  maxResidualKm: number;
  controlPoints: ControlPoint[];
}

export interface OhmSet {
  date: string;
  /** relation id -> expected name (checked against the export). */
  relations: Record<string, string>;
}

/** A geometry selector used by compose.ts steps. */
export type GeomSpec =
  | { cshapes: number[]; partsAt?: [number, number][] }
  | { ohm: number }
  | { admin1: string; names: string[] }
  | { svg: string; class: string | string[]; coastFillKm?: number }
  | { svgFrame: string }
  | { bbox: [number, number, number, number] }
  | { union: GeomSpec[] }
  | { intersect: [GeomSpec, GeomSpec] }
  | { difference: [GeomSpec, GeomSpec] };

export interface Step {
  /** Short note shown in logs and kept on the features as `note`. */
  note: string;
  holder: string;
  label?: { en: string; zh: string };
  /** Source reference ids from SOURCES.md, e.g. ["G1", "G2"]. */
  src: string[];
  from: GeomSpec;
  clip?: GeomSpec;
  minus?: GeomSpec;
}

export interface Keyframe {
  id: string;
  t: string;
  /** CShapes gwcode -> holder (or holder + label) for the sovereign base. */
  base: Record<string, string | { holder: string; label?: { en: string; zh: string } }>;
  /** OHM relation set used by `ohm` selectors in this keyframe. */
  ohm: string;
  /** How the keyframe was made, for SOURCES.md. */
  method: string;
  steps: Step[];
  /** Views rendered by check.ts: [lng, lat, zoom] plus the source image shown beside it. */
  checks: { name: string; center: [number, number]; zoom: number; source?: string }[];
}

export interface Sources {
  datasets: Record<string, Dataset>;
  ohm: Record<string, OhmSet>;
  svg: Record<string, SvgSource>;
  keyframes: Keyframe[];
}

export function loadSources(): Sources {
  return readJson<Sources>(join(HERE, 'sources.json'));
}

/* ------------------------------------------------------------------ */
/* IO                                                                  */
/* ------------------------------------------------------------------ */

export function readJson<T>(file: string): T {
  return JSON.parse(readFileSync(file, 'utf8')) as T;
}

export function writeJson(file: string, data: unknown, pretty = false): void {
  mkdirSync(resolve(file, '..'), { recursive: true });
  writeFileSync(file, pretty ? `${JSON.stringify(data, null, 2)}\n` : JSON.stringify(data));
}

export function ensureDirs(): void {
  for (const dir of [RAW, WORK]) mkdirSync(dir, { recursive: true });
}

export function warn(message: string): void {
  process.stderr.write(`WARN ${message}\n`);
}

export function log(message: string): void {
  process.stdout.write(`${message}\n`);
}

/* ------------------------------------------------------------------ */
/* Tools                                                               */
/* ------------------------------------------------------------------ */

const toolRequire = createRequire(join(TOOLS, 'package.json'));

export function toolsInstalled(): boolean {
  return existsSync(join(TOOLS, 'node_modules', 'mapshaper')) && existsSync(join(TOOLS, 'node_modules', 'osmtogeojson'));
}

function requireTool<T>(name: string): T {
  if (!toolsInstalled()) {
    throw new Error(`pipeline tools missing: run \`pnpm tsx scripts/geo/ww2/fetch.ts\` first (installs ${TOOL_PACKAGES.join(', ')} into scripts/geo/ww2/.tools/)`);
  }
  return toolRequire(name) as T;
}

interface Mapshaper {
  applyCommands(cmd: string, input: Record<string, unknown>): Promise<Record<string, Buffer | string>>;
}

export function osmToGeoJson(data: unknown): FeatureCollection {
  const fn = requireTool<(d: unknown, o: { flatProperties: boolean }) => FeatureCollection>('osmtogeojson');
  return fn(data, { flatProperties: true });
}

/**
 * Run a mapshaper command line on in-memory GeoJSON layers. Inputs are named
 * `<name>.json` in the command; the target layer is returned as GeoJSON
 * (`outOptions` are appended to the final `-o`, e.g. `precision=0.01`).
 */
export async function mapshaper(cmd: string, inputs: Record<string, FeatureCollection>, outOptions = ''): Promise<FeatureCollection> {
  const ms = requireTool<Mapshaper>('mapshaper');
  const files: Record<string, unknown> = {};
  for (const [name, fc] of Object.entries(inputs)) files[`${name}.json`] = fc;
  const out = await ms.applyCommands(`${cmd} -o out.json format=geojson ${outOptions}`.trim(), files);
  const raw = out['out.json'];
  if (raw === undefined) return emptyFc();
  const parsed = JSON.parse(raw.toString()) as FeatureCollection | { type: 'GeometryCollection'; geometries: Geometry[] };
  if (parsed.type === 'GeometryCollection') {
    return { type: 'FeatureCollection', features: parsed.geometries.map((g) => ({ type: 'Feature', properties: {}, geometry: g })) };
  }
  return parsed;
}

/* ------------------------------------------------------------------ */
/* Geometry helpers                                                    */
/* ------------------------------------------------------------------ */

export function emptyFc(): FeatureCollection {
  return { type: 'FeatureCollection', features: [] };
}

export function areaFeatures(fc: FeatureCollection): Feature<Polygon | MultiPolygon>[] {
  return fc.features.filter(
    (f): f is Feature<Polygon | MultiPolygon> => !!f.geometry && (f.geometry.type === 'Polygon' || f.geometry.type === 'MultiPolygon'),
  );
}

export function pointInRing(pt: readonly number[], ring: readonly Position[]): boolean {
  const x = pt[0] ?? 0;
  const y = pt[1] ?? 0;
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const xi = ring[i]?.[0] ?? 0;
    const yi = ring[i]?.[1] ?? 0;
    const xj = ring[j]?.[0] ?? 0;
    const yj = ring[j]?.[1] ?? 0;
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}

export function pointInPolygon(pt: readonly number[], poly: readonly Position[][]): boolean {
  const [outer, ...holes] = poly;
  if (!outer || !pointInRing(pt, outer)) return false;
  return !holes.some((h) => pointInRing(pt, h));
}

/** Great-circle distance in km. */
export function haversineKm(a: readonly number[], b: readonly number[]): number {
  const R = 6371.0088;
  const rad = Math.PI / 180;
  const dLat = ((b[1] ?? 0) - (a[1] ?? 0)) * rad;
  const dLng = ((b[0] ?? 0) - (a[0] ?? 0)) * rad;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos((a[1] ?? 0) * rad) * Math.cos((b[1] ?? 0) * rad) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)));
}

export function toFc(features: Feature[]): FeatureCollection {
  return { type: 'FeatureCollection', features };
}

export function multiPolygonFeature(polys: Position[][][], properties: Record<string, unknown> = {}): Feature<MultiPolygon> {
  return { type: 'Feature', properties, geometry: { type: 'MultiPolygon', coordinates: polys } };
}

/** Keyframe file in work/. */
export const workFile = (name: string) => join(WORK, name);
export const rawFile = (name: string) => join(RAW, name);
