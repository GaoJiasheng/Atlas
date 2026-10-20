/** Fetch dated-layer inputs anonymously from data.gov.sg; never geocode with OneMap. */
import { createHash } from 'node:crypto';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
const base = dirname(fileURLToPath(import.meta.url));
const datasets = {
  landuse: ['d_90d86daa5bfaa371668b84fa5f01424f','ura-mp2019-landuse.geojson'],
  planning: ['d_4765db0e87b9c86336792efe8a1f7a66','ura-mp2019-planning-area.geojson'],
  hdbProperties: ['d_17f5382f26140b1fdae0ba2ef6239d2f','hdb-properties.csv'],
  hdbBuildings: ['d_16b157c52ed637edd6ba1232e026258d','hdb-buildings.geojson'],
  landArea: ['d_0b2c034da121ef8efc71949af1694b4d','land-area.csv'],
  population: ['d_3d227e5d9fdec73f3bcadce671c333a6','population.csv'],
  transport: ['d_ba615ec4cc5d9f5b7800ad82057f36f1','transport-statistics.csv'],
  parks: ['d_77d7ec97be83d44f61b85454f844382f', 'parks.geojson'],
  mp2003: ['d_78c9a05019ea8594a657c192bddcd2d6', 'mp2003.geojson'],
  mp2008: ['d_7ea297b9bf38956bd553638e5db042cd', 'mp2008.geojson'],
  mp2014: ['d_6c3e60b98c170edc47024795330c1353', 'mp2014.geojson'],
} as const;
for (const [name, [id, file]] of Object.entries(datasets)) {
  const out = join(base, 'raw', file);
  if (existsSync(out) || (name === 'transport' && existsSync(join(base, 'raw', 'transport-statistics.json')))) continue;
  const api = `https://api-open.data.gov.sg/v1/public/api/datasets/${id}/poll-download`;
  const poll = await fetch(api);
  if (!poll.ok) throw new Error(`${id} poll ${poll.status}`);
  const info = await poll.json() as { data?: { url?: string } };
  if (!info.data?.url) throw new Error(`${id}: no anonymous download URL`);
  const res = await fetch(info.data.url, { signal: AbortSignal.timeout(600000) });
  if (!res.ok) throw new Error(`${id} download ${res.status}`);
  const bytes = Buffer.from(await res.arrayBuffer());
  writeFileSync(out, bytes);
  const logPath = join(base, 'raw', 'fetch-log.json');
  const log = existsSync(logPath) ? JSON.parse(readFileSync(logPath, 'utf8')) : {};
  log[name] = { file, dataset: id, bytes: bytes.length, sha256: createHash('sha256').update(bytes).digest('hex'), fetched: new Date().toISOString(), from: api, license: 'Singapore Open Data Licence v1.0', licenseUrl: 'https://data.gov.sg/open-data-licence', licence_text: 'Free forever for personal or commercial use, under the Open Data Licence.' };
  writeFileSync(logPath, JSON.stringify(log, null, 2));
  process.stdout.write(`${name}: ${bytes.length} bytes\n`);
}
