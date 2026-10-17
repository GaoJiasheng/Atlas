/** Compose manifest recipes with shared pipeline, copying hold frames verbatim.
 * Regional recipes intersect Natural Earth 10m land, including inside excludeBox.
 * Usage: pnpm tsx scripts/geo/singapore-1819-1965/keyframes.ts [K2 K19 | --all]
 */
import { existsSync, copyFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { feature } from 'topojson-client';
import type { FeatureCollection } from 'geojson';
import { readJson, writeJson, toFc } from '../lib/common';
const dir = resolve(import.meta.dirname);
type Frame = { id: string; era: string; hold?: string };
const manifest = readJson<{keyframes: Frame[]}>(`${dir}/sources.json`);
type Topology = Parameters<typeof feature>[0] & {objects: Record<string, Parameters<typeof feature>[1]>};
const land = readJson<Topology>('public/geo/land-10m-sea.json');
writeJson(`${dir}/work/land-10m.geojson`, toFc(Object.values(land.objects).flatMap(o =>
  (feature(land, o) as unknown as FeatureCollection).features)));
const wanted = process.argv.slice(2).filter(a => !a.startsWith('--'));
const done = new Set<string>();
function compose(id: string): void {
  if (done.has(id)) return;
  const k = manifest.keyframes.find(f => f.id === id);
  if (!k) throw Error(`Unknown frame ${id}`);
  const output = `${dir}/work/${id}.geojson`;
  if (k.hold) {
    compose(k.hold);
    copyFileSync(`${dir}/work/${k.hold}.geojson`, output);
    console.log(`${id}: exact duplicate of ${k.hold}`);
  } else {
    if (!existsSync(`${dir}/work/coast-${k.era}.geojson`)) throw Error(`Missing dated coast ${k.era}`);
    const result = spawnSync('pnpm', ['tsx', 'scripts/geo/lib/compose.ts', '--topic', 'singapore-1819-1965', id], {stdio: 'inherit'});
    if (result.status !== 0) throw Error(`Shared compose failed for ${id}`);
  }
  done.add(id);
}
for (const k of wanted.length ? wanted : manifest.keyframes.map(f => f.id)) compose(k);
