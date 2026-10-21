/**
 * G0 (docs/43 §3.2): inventory of the Cliopatria release against the frames
 * and spheres this topic needs, and the extract the later steps read.
 *
 *   pnpm tsx scripts/geo/ancient-civilisations/inventory.ts
 *
 * Input: raw/cliopatria/cliopatria_polities_only_v021.geojson (unzipped from
 * the v0.2.1 release's cliopatria.geojson.zip; SHA-256 in SOURCES-GEO.md).
 * README: "Data ... for any year ... can be obtained finding the row ... where
 * the year of interest is between the row's FromYear and ToYear, inclusive."
 *
 * Output:
 * - work/inventory.json: per frame and holder, the records matched (name,
 *   FromYear–ToYear, Area, MemberOf, Wikidata); per sphere, every record;
 *   the list-only polities (records present but not drawn).
 * - work/inventory-table.md: the same as Markdown tables (copied into INVENTORY.md).
 * - raw/cliopatria-subset.geojson: one feature per matched record, tagged
 *   `{ frame, holder, src }` for compose.ts's `geojson` selector; geometry unchanged.
 * - raw/cliopatria-spheres.geojson: every record of the sphere polities, unchanged.
 * - raw/check-K#.geojson: the raw records of one frame, drawn beside the product by check.ts.
 * A frame year outside every record of a holder falls back to the nearest
 * record within 50 years (`note` says which year it shows); none within 50
 * years leaves the holder out of that frame, and both are listed.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import type { Feature, FeatureCollection } from 'geojson';
import { writeJson } from '../lib/common';

const DIR = 'scripts/geo/ancient-civilisations';
const RAW = `${DIR}/raw/cliopatria/cliopatria_polities_only_v021.geojson`;

interface Holder { holder: string; names?: string[]; memberOf?: string[]; label: { en: string; zh: string } }
interface Frame { id: string; t: string; holders: Holder[] }
interface Sphere { file: string; names: string[]; until: number }
const plan = JSON.parse(readFileSync(`${DIR}/keyframes.json`, 'utf8')) as { release: string; frames: Frame[]; spheres: Sphere[]; listOnly: string[] };

interface Props { Name: string; FromYear: number; ToYear: number; Area: number; Type: string; MemberOf: string; Wikidata: string; Wikipedia: string; SeshatID: string }
const all = JSON.parse(readFileSync(RAW, 'utf8')) as FeatureCollection;
const recs = all.features.filter((f) => f.geometry) as Feature<NonNullable<Feature['geometry']>, Props>[];
const rowOf = (p: Props) => ({ name: p.Name, from: p.FromYear, to: p.ToYear, areaKm2: Math.round(p.Area ?? 0), memberOf: p.MemberOf || null, wikidata: p.Wikidata || null });
const srcOf = (p: Props) => `Cliopatria ${plan.release}: ${p.Name} ${p.FromYear}–${p.ToYear}`;

const year = (t: string) => Number(t);
const pick = (h: Holder) => (p: Props) => (h.names ?? []).includes(p.Name) || (h.memberOf ?? []).includes(p.MemberOf);

const subset: Feature[] = [];
const frames: unknown[] = [];
const table: string[] = ['| K | year | holder | Cliopatria records (FromYear–ToYear, km²) | covers the year? |', '|---|---|---|---|---|'];
for (const f of plan.frames) {
  const y = year(f.t);
  const holders: unknown[] = [];
  for (const h of f.holders) {
    const cands = recs.filter((r) => pick(h)(r.properties));
    let hit = cands.filter((r) => r.properties.FromYear <= y && y <= r.properties.ToYear);
    let note = 'record covers the year';
    if (!hit.length) {
      const near = cands
        .map((r) => ({ r, d: Math.min(Math.abs(r.properties.FromYear - y), Math.abs(r.properties.ToYear - y)) }))
        .filter((x) => x.d <= 50)
        .sort((a, b) => a.d - b.d);
      if (near.length) {
        const best = near[0]!.r.properties;
        hit = cands.filter((r) => r.properties.FromYear === best.FromYear && r.properties.ToYear === best.ToYear);
        note = `no record covers ${y}; nearest within 50 years: ${best.FromYear}–${best.ToYear}`;
      } else note = `no record within 50 years: holder left out`;
    }
    for (const r of hit) subset.push({ type: 'Feature', geometry: r.geometry, properties: { frame: f.id, holder: h.holder, src: srcOf(r.properties) } });
    holders.push({ holder: h.holder, note, records: hit.map((r) => rowOf(r.properties)) });
    const names = hit.length > 4 ? `${hit.length} members of ${(h.memberOf ?? []).join(', ')}: ${hit.map((r) => r.properties.Name).join(', ')}` : hit.map((r) => `${r.properties.Name} ${r.properties.FromYear}–${r.properties.ToYear}, ${Math.round(r.properties.Area).toLocaleString('en')}`).join('; ');
    table.push(`| ${f.id} | ${y} | \`${h.holder}\` | ${names || '—'} | ${note} |`);
  }
  if (!f.holders.length) table.push(`| ${f.id} | ${y} | — | empty frame | — |`);
  frames.push({ id: f.id, t: f.t, holders });
}

const spheres: unknown[] = [];
const sphereFeatures: Feature[] = [];
table.push('', '| sphere file | Cliopatria records (FromYear–ToYear, km²) |', '|---|---|');
for (const s of plan.spheres) {
  const hit = recs.filter((r) => s.names.includes(r.properties.Name) && r.properties.FromYear <= s.until).sort((a, b) => a.properties.FromYear - b.properties.FromYear);
  for (const r of hit) sphereFeatures.push({ type: 'Feature', geometry: r.geometry, properties: { file: s.file, f: r.properties.FromYear, u: r.properties.ToYear + 1, src: srcOf(r.properties) } });
  spheres.push({ file: s.file, records: hit.map((r) => rowOf(r.properties)) });
  table.push(`| ${s.file} | ${hit.map((r) => `${r.properties.FromYear}–${r.properties.ToYear} (${Math.round(r.properties.Area).toLocaleString('en')})`).join(', ')} |`);
}

const listOnly = plan.listOnly.map((name) => ({ name, records: recs.filter((r) => r.properties.Name === name).sort((a, b) => a.properties.FromYear - b.properties.FromYear).map((r) => rowOf(r.properties)) }));
table.push('', '| listed, not drawn | records (FromYear–ToYear, km²) |', '|---|---|');
for (const l of listOnly) table.push(`| ${l.name} | ${l.records.map((r) => `${r.from}–${r.to} (${r.areaKm2.toLocaleString('en')})`).join(', ') || 'none'} |`);

writeJson(`${DIR}/work/inventory.json`, { release: plan.release, records: recs.length, frames, spheres, listOnly }, true);
writeFileSync(`${DIR}/work/inventory-table.md`, `${table.join('\n')}\n`);
writeJson(`${DIR}/raw/cliopatria-subset.geojson`, { type: 'FeatureCollection', features: subset });
// check.ts draws a .geojson dataset as is next to the product: one file per frame with that frame's raw records.
for (const f of plan.frames) writeJson(`${DIR}/raw/check-${f.id}.geojson`, { type: 'FeatureCollection', features: subset.filter((x) => x.properties?.frame === f.id) });
writeJson(`${DIR}/raw/cliopatria-spheres.geojson`, { type: 'FeatureCollection', features: sphereFeatures });
console.log(`${recs.length} Cliopatria records; ${subset.length} frame features, ${sphereFeatures.length} sphere features`);
console.log(table.join('\n'));
