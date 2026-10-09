/**
 * Step 2 — OpenHistoricalMap (ODbL) boundary relations -> GeoJSON, per date.
 *
 *   pnpm tsx scripts/geo/lib/ohm-export.ts --topic <slug>      # every set in sources.json `ohm`
 *   pnpm tsx scripts/geo/lib/ohm-export.ts --topic <slug> --list 1942-03-09 [--bbox s,w,n,e] [--levels 1-4]
 *        # discovery: print every boundary relation valid on that date (name, dates, id)
 *
 * Sets name their relations explicitly (id -> expected name) so a re-run is
 * reproducible; the export checks each relation's start_date / end_date
 * against the set date and warns when it is not valid on that day.
 * Output: raw/ohm-<set>.json (Overpass response), work/ohm-<set>.geojson.
 */
import { existsSync } from 'node:fs';
import { parseArgs } from 'node:util';
import type { Feature } from 'geojson';
import { log, osmToGeoJson, readJson, warn, writeJson } from './common';
import { openTopic } from './topic';

const OVERPASS = 'https://overpass-api.openhistoricalmap.org/api/interpreter';

const { values } = parseArgs({
  options: {
    topic: { type: 'string' },
    list: { type: 'string' },
    bbox: { type: 'string' },
    levels: { type: 'string', default: '1-3' },
    force: { type: 'boolean', default: false },
  },
});
const topic = openTopic(values.topic);

async function overpass(query: string): Promise<unknown> {
  let lastError: unknown;
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const res = await fetch(OVERPASS, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'User-Agent': 'AtlasGeoPipeline/0.1' },
        body: `data=${encodeURIComponent(query)}`,
        signal: AbortSignal.timeout(400_000),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (e) {
      lastError = e;
      if (attempt < 3) await new Promise((r) => setTimeout(r, 5000 * attempt));
    }
  }
  throw lastError;
}

/** `1941`, `1941-08`, `1941-08-19` -> comparable day number (start or end of the period). */
function dayOf(value: string | undefined, edge: 'start' | 'end'): number | null {
  if (!value) return null;
  const m = /^(-?\d{4})(?:-(\d{2}))?(?:-(\d{2}))?/.exec(value);
  if (!m) return null;
  const y = Number(m[1]);
  const mo = m[2] ? Number(m[2]) : edge === 'start' ? 1 : 12;
  const d = m[3] ? Number(m[3]) : edge === 'start' ? 1 : 31;
  return y * 10000 + mo * 100 + d;
}

function validOn(tags: Record<string, string>, date: string): boolean {
  const day = dayOf(date, 'start')!;
  const start = dayOf(tags.start_date, 'start');
  const end = dayOf(tags.end_date, 'start');
  return (start === null || start <= day) && (end === null || end > day);
}

async function list(date: string): Promise<void> {
  const [lo, hi] = (values.levels ?? '1-3').split('-');
  const bbox = values.bbox ? `(${values.bbox})` : '';
  const query = `[out:json][timeout:300];
rel["boundary"="administrative"]["admin_level"~"^[${lo}-${hi ?? lo}]$"]${bbox}(if: is_tag("start_date") && t["start_date"] <= "${date}" && (!is_tag("end_date") || t["end_date"] > "${date}"));
out tags;`;
  const res = (await overpass(query)) as { elements: { id: number; tags: Record<string, string> }[] };
  for (const e of res.elements.sort((a, b) => (a.tags['name:en'] ?? a.tags.name ?? '').localeCompare(b.tags['name:en'] ?? b.tags.name ?? ''))) {
    log(`${e.id}\tL${e.tags.admin_level}\t${e.tags['name:en'] ?? e.tags.name}\t${e.tags.start_date ?? '?'} – ${e.tags.end_date ?? ''}`);
  }
}

async function exportSets(): Promise<void> {
  for (const [id, set] of Object.entries(topic.sources.ohm ?? {})) {
    const rawPath = topic.rawFile(`ohm-${id}.json`);
    const ids = Object.keys(set.relations);
    let data: unknown;
    if (existsSync(rawPath) && !values.force) {
      data = readJson(rawPath);
      log(`cached    ohm-${id} (${ids.length} relations)`);
    } else {
      try {
        data = await overpass(`[out:json][timeout:600];\nrel(id:${ids.join(',')});\nout geom;`);
        writeJson(rawPath, data);
        log(`fetched   ohm-${id} (${ids.length} relations)`);
      } catch (e) {
        warn(`Overpass export for set ${id} failed: ${(e as Error).message} — continuing`);
        continue;
      }
    }
    const fc = osmToGeoJson(data);
    const features: Feature[] = [];
    for (const relId of ids) {
      const f = fc.features.find((x) => x.id === `relation/${relId}`);
      if (!f || !f.geometry || (f.geometry.type !== 'Polygon' && f.geometry.type !== 'MultiPolygon')) {
        warn(`ohm-${id}: relation ${relId} (${set.relations[relId]}) has no area geometry`);
        continue;
      }
      const tags = (f.properties ?? {}) as Record<string, string>;
      const name = tags['name:en'] ?? tags.name ?? '';
      if (name !== set.relations[relId]) warn(`ohm-${id}: relation ${relId} is named "${name}", expected "${set.relations[relId]}"`);
      if (!validOn(tags, set.date)) warn(`ohm-${id}: relation ${relId} "${name}" (${tags.start_date} – ${tags.end_date ?? ''}) is not valid on ${set.date}`);
      features.push({
        type: 'Feature',
        properties: { ohm: Number(relId), name, start_date: tags.start_date ?? null, end_date: tags.end_date ?? null },
        geometry: f.geometry,
      });
    }
    writeJson(topic.workFile(`ohm-${id}.geojson`), { type: 'FeatureCollection', features });
    log(`wrote     work/ohm-${id}.geojson (${features.length} features, date ${set.date})`);
  }
}

topic.ensureDirs();
if (values.list) await list(values.list);
else await exportSets();
