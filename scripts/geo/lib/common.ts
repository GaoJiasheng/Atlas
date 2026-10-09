/**
 * Shared helpers of the real-map pipeline (scripts/geo/lib/*.ts): IO, logging,
 * the pipeline tools and geometry helpers.
 *
 * Geometry operations (clip / erase / union / buffer / simplify) run through
 * mapshaper's in-memory API, which is robust on real coastlines. mapshaper and
 * osmtogeojson live in the shared, gitignored `scripts/geo/.tools/` (installed
 * by fetch.ts), so the pipeline never touches the app's package.json.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { join, resolve } from 'node:path';
import type { Feature, FeatureCollection, Geometry, MultiPolygon, Polygon, Position } from 'geojson';

/** scripts/geo/ */
export const GEO = resolve(import.meta.dirname, '..');
export const ROOT = resolve(GEO, '../..');
export const TOOLS = join(GEO, '.tools');

/** Tool versions installed into .tools/ by fetch.ts. */
export const TOOL_PACKAGES = ['mapshaper@0.6.121', 'osmtogeojson@3.0.0-beta.5'];
/** package.json name of the tools folder. */
export const TOOLS_PACKAGE_NAME = 'atlas-geo-tools';

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
    throw new Error(`pipeline tools missing: run \`pnpm tsx scripts/geo/lib/fetch.ts --topic <slug>\` first (installs ${TOOL_PACKAGES.join(', ')} into scripts/geo/.tools/)`);
  }
  return toolRequire(name) as T;
}

export interface Mapshaper {
  applyCommands(cmd: string, input: Record<string, unknown>): Promise<Record<string, Buffer | string>>;
}

/** mapshaper's API, for multi-layer runs that `mapshaper()` does not cover. */
export function mapshaperApi(): Mapshaper {
  return requireTool<Mapshaper>('mapshaper');
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
  const ms = mapshaperApi();
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
