/**
 * monsoon-and-weather: derive the two monthly-climatology resources and check the city anchors.
 *
 *   pnpm tsx scripts/geo/monsoon-and-weather/derive.ts --in <dir> [--check]
 *
 * `<dir>` holds the prefetched raw files listed in SOURCES-GEO.md (the research cache,
 * `art/research/monsoon-and-weather/data/`, kept out of git). The script
 *   1. checks the SHA-256 of every raw input against the recorded fingerprint;
 *   2. parses the NOAA OPeNDAP ASCII responses (u, v at 850 hPa; GPCP precipitation),
 *      reads their own lat/lon map arrays and writes the grids south-to-north, row-major,
 *      with no spatial resampling, unit change or accumulation;
 *   3. writes public/geo/monsoon-and-weather-{wind-850,rain-gpcp}-1991-2020.json
 *      (or, with --check, compares them with the committed files and writes nothing);
 *   4. checks that every site in data/events.json has the Natural Earth NE_ID, name
 *      and coordinates of the 1:110m populated-places feature it names.
 * It never touches the network.
 */
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const TOPIC = join(ROOT, 'src', 'content', 'topics', 'monsoon-and-weather');

/** Raw inputs and the fingerprints recorded in docs/50 §3.1 and the research INVENTORY. */
export const RAW = {
  u: { file: 'wind-u-subset.ascii', bytes: 80453, sha256: 'dee581745952a24fddbe97bdfb496d15693f8e5d5e687e4a969e8e95822c6e38' },
  v: { file: 'wind-v-subset.ascii', bytes: 81383, sha256: 'c67a52d4c2f6366f8e998af899fd62fe83ea4613d1e200f8b70b7c2c10f6718c' },
  rain: { file: 'rain-subset.ascii', bytes: 68457, sha256: 'be7b59d1f2776296b1fd0bea05d9cdd32f6fce27e23601e24c4d1b8f46aecd9c' },
  places: {
    file: 'ne-110m-populated-places.geojson',
    bytes: 654324,
    sha256: 'a86028b083182b68c7620fc6e1a8a47ee547cb9cd2fb62ccbb78bea786440899',
  },
} as const;

export const OUT = {
  wind: 'public/geo/monsoon-and-weather-wind-850-1991-2020.json',
  rain: 'public/geo/monsoon-and-weather-rain-gpcp-1991-2020.json',
} as const;

const PERIOD = {
  id: 'clim-1991-2020',
  startYear: 1991,
  endYear: 2020,
  statistic: 'mean-of-calendar-month-means',
  yearsExpected: 30,
} as const;

/** Every block of an OPeNDAP ASCII response: `name[dims]` then rows `[i][j], v, v, …` or one flat row. */
export function parseAscii(text: string): Map<string, { dims: number[]; values: number[] }> {
  const out = new Map<string, { dims: number[]; values: number[] }>();
  const body = text.slice(text.indexOf('-----'));
  const lines = body.split('\n');
  let current: { dims: number[]; values: number[] } | null = null;
  for (const raw of lines) {
    const line = raw.trim();
    if (line === '' || line.startsWith('---')) {
      current = null;
      continue;
    }
    const head = /^([A-Za-z_][\w.]*)((?:\[\d+\])+)$/.exec(line);
    if (head) {
      const dims = [...head[2]!.matchAll(/\[(\d+)\]/g)].map((m) => Number(m[1]));
      current = { dims, values: [] };
      out.set(head[1]!, current);
      continue;
    }
    if (!current) throw new Error(`value row outside a block: ${line.slice(0, 40)}`);
    const row = line.replace(/^(\[\d+\])+,\s*/, '');
    for (const cell of row.split(',')) {
      const v = Number(cell.trim());
      if (!Number.isFinite(v)) throw new Error(`non-finite value "${cell}"`);
      current.values.push(v);
    }
  }
  for (const [name, block] of out) {
    const n = block.dims.reduce((a, b) => a * b, 1);
    if (block.values.length !== n) throw new Error(`${name}: ${block.values.length} values, expected ${n}`);
  }
  return out;
}

function block(map: ReturnType<typeof parseAscii>, name: string) {
  const b = map.get(name);
  if (!b) throw new Error(`missing block ${name}`);
  return b;
}

/** Ascending, evenly spaced axis; returns [first, step]. */
function axis(values: number[], name: string): [number, number] {
  const step = values[1]! - values[0]!;
  values.forEach((v, i) => {
    if (Math.abs(v - (values[0]! + i * step)) > 1e-6) throw new Error(`${name} is not evenly spaced`);
  });
  return [values[0]!, step];
}

/**
 * One month of a [time][(level)][lat][lon] array as a south-to-north row-major grid.
 * `latAsc` says whether the source latitude axis already runs south to north.
 */
function monthGrid(values: number[], month: number, nlat: number, nlon: number, latAsc: boolean): number[] {
  const out: number[] = [];
  const base = month * nlat * nlon;
  for (let j = 0; j < nlat; j++) {
    const srcRow = latAsc ? j : nlat - 1 - j;
    for (let i = 0; i < nlon; i++) out.push(values[base + srcRow * nlon + i]!);
  }
  return out;
}

/**
 * Check that the climatology bounds span January 1991 to December 2020. The DAS gives their
 * units: hours since 1800-01-01 for the reanalysis, days since 1800-01-01 for GPCP.
 */
function checkBounds(map: ReturnType<typeof parseAscii>, unitMs: number) {
  const b = block(map, 'climatology_bounds');
  if (b.dims.join() !== '12,2') throw new Error('climatology_bounds must be [12][2]');
  const epoch = Date.UTC(1800, 0, 1);
  const at = (k: number) => new Date(epoch + b.values[k]! * unitMs);
  const first = at(0);
  const last = at(b.values.length - 1);
  if (first.getUTCFullYear() !== 1991 || first.getUTCMonth() !== 0 || last.getUTCFullYear() !== 2020 || last.getUTCMonth() !== 11)
    throw new Error(`climatology bounds ${first.toISOString()} – ${last.toISOString()} are not January 1991 – December 2020`);
}
const HOUR = 3_600_000;
const DAY = 24 * HOUR;

export function deriveWind(uText: string, vText: string) {
  const u = parseAscii(uText);
  const v = parseAscii(vText);
  checkBounds(u, HOUR);
  checkBounds(v, HOUR);
  const uw = block(u, 'uwnd.uwnd');
  const vw = block(v, 'vwnd.vwnd');
  if (uw.dims.join() !== '12,1,19,21' || vw.dims.join() !== '12,1,19,21') throw new Error('wind arrays must be [12][1][19][21]');
  if (block(u, 'uwnd.level').values[0] !== 850 || block(v, 'vwnd.level').values[0] !== 850) throw new Error('level must be 850 hPa');
  const latSrc = block(u, 'uwnd.lat').values;
  const lonSrc = block(u, 'uwnd.lon').values;
  if (block(v, 'vwnd.lat').values.join() !== latSrc.join() || block(v, 'vwnd.lon').values.join() !== lonSrc.join())
    throw new Error('u and v grids differ');
  const latAsc = latSrc[1]! > latSrc[0]!;
  const lat = latAsc ? latSrc : [...latSrc].reverse();
  const [lat0, dlat] = axis(lat, 'lat');
  const [lon0, dlon] = axis(lonSrc, 'lon');
  const nu = block(u, 'valid_yr_count.valid_yr_count').values;
  const nv = block(v, 'valid_yr_count.valid_yr_count').values;
  const frames = Array.from({ length: 12 }, (_, m) => {
    const yu = monthGrid(nu, m, 19, 21, latAsc);
    const yv = monthGrid(nv, m, 19, 21, latAsc);
    yu.forEach((n, k) => {
      if (n !== yv[k]) throw new Error(`month ${m + 1} cell ${k}: u and v valid-year counts differ`);
    });
    return { month: m + 1, u: monthGrid(uw.values, m, 19, 21, latAsc), v: monthGrid(vw.values, m, 19, 21, latAsc), validYears: yu };
  });
  return {
    schemaVersion: 1,
    kind: 'monthly-wind',
    period: PERIOD,
    crs: 'EPSG:4326',
    pressureHpa: 850,
    units: 'm/s',
    grid: { nx: 21, ny: 19, lon0, lat0, dlon, dlat, layout: 'south-to-north-row-major' },
    frames,
    sources: ['S22', 'S25', 'S101'],
    licenceFamily: 'PD-derived',
    notes:
      'Atlas regional extract of NCEP/NCAR Reanalysis 1 monthly long-term means at 850 hPa; no resampling or terrain mask. Pressure-level values over elevated terrain may be extrapolated; not surface wind.',
  };
}

export function deriveRain(text: string) {
  const r = parseAscii(text);
  checkBounds(r, DAY);
  const p = block(r, 'precip.precip');
  if (p.dims.join() !== '12,18,20') throw new Error('precip must be [12][18][20]');
  const latSrc = block(r, 'precip.lat').values;
  const lonSrc = block(r, 'precip.lon').values;
  const latAsc = latSrc[1]! > latSrc[0]!;
  const lat = latAsc ? latSrc : [...latSrc].reverse();
  const [lat0, dlat] = axis(lat, 'lat');
  const [lon0, dlon] = axis(lonSrc, 'lon');
  const n = block(r, 'valid_yr_count.valid_yr_count').values;
  const frames = Array.from({ length: 12 }, (_, m) => ({
    month: m + 1,
    values: monthGrid(p.values, m, 18, 20, latAsc),
    validYears: monthGrid(n, m, 18, 20, latAsc),
  }));
  return {
    schemaVersion: 1,
    kind: 'monthly-rain',
    period: PERIOD,
    crs: 'EPSG:4326',
    units: 'mm/day',
    grid: { nx: 20, ny: 18, lon0, lat0, dlon, dlat, layout: 'south-to-north-row-major' },
    frames,
    sources: ['S32', 'S25', 'S102'],
    licenceFamily: 'PD-derived',
    notes: 'GPCP V2.3 monthly long-term mean precipitation rate. Cell footprints extend half a grid spacing around centres. No interpolation or accumulation conversion.',
  };
}

const sha = (buf: Buffer | string) => createHash('sha256').update(buf).digest('hex');

function readRaw(dir: string, key: keyof typeof RAW): Buffer {
  const spec = RAW[key];
  const buf = readFileSync(join(dir, spec.file));
  if (buf.length !== spec.bytes || sha(buf) !== spec.sha256) throw new Error(`${spec.file}: bytes or SHA-256 differ from the recorded input`);
  return buf;
}

type Site = { id: string; kind: string; at: [number, number]; title: { en: string; zh: string }; detail?: { en: string } };

/** Each site names its NE_ID in its English detail; check the id, the English name and the exact coordinates. */
export function checkSites(sites: Site[], places: { features: { properties: Record<string, unknown>; geometry: { coordinates: number[] } }[] }) {
  const problems: string[] = [];
  for (const s of sites) {
    const id = /NE_ID (\d+)/.exec(s.detail?.en ?? '')?.[1];
    const f = places.features.find((p) => String(p.properties.NE_ID) === id);
    if (!f) {
      problems.push(`${s.id}: no Natural Earth feature for NE_ID ${id}`);
      continue;
    }
    const [lon, lat] = f.geometry.coordinates;
    if (lon !== s.at[0] || lat !== s.at[1]) problems.push(`${s.id}: coordinates differ from NE (${lon}, ${lat})`);
    if (f.properties.NAME !== s.title.en) problems.push(`${s.id}: NE NAME is ${String(f.properties.NAME)}`);
  }
  return problems;
}

function main() {
  const args = process.argv.slice(2);
  const dir = args[args.indexOf('--in') + 1];
  if (!args.includes('--in') || !dir) throw new Error('usage: derive.ts --in <raw data dir> [--check]');
  const check = args.includes('--check');
  const wind = JSON.stringify(deriveWind(readRaw(dir, 'u').toString('utf8'), readRaw(dir, 'v').toString('utf8')));
  const rain = JSON.stringify(deriveRain(readRaw(dir, 'rain').toString('utf8')));
  for (const [path, text] of [
    [OUT.wind, wind],
    [OUT.rain, rain],
  ] as const) {
    const abs = join(ROOT, path);
    if (check) {
      if (readFileSync(abs, 'utf8') !== text) throw new Error(`${path} differs from a fresh derivation`);
    } else writeFileSync(abs, text);
    console.log(`${check ? 'matches' : 'wrote'} ${path}  ${Buffer.byteLength(text)} bytes  sha256 ${sha(text)}`);
  }
  const places = JSON.parse(readRaw(dir, 'places').toString('utf8'));
  const sites = (JSON.parse(readFileSync(join(TOPIC, 'data', 'events.json'), 'utf8')) as Site[]).filter((e) => e.kind === 'site');
  const problems = checkSites(sites, places);
  if (problems.length) throw new Error(problems.join('\n'));
  console.log(`sites: ${sites.length} checked against Natural Earth 1:110m populated places`);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) main();
