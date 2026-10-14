/**
 * Step 1 — download every dataset listed in the topic's sources.json into its
 * raw/ and install the pipeline tools into the shared scripts/geo/.tools/
 * (all gitignored).
 *
 *   pnpm tsx scripts/geo/lib/fetch.ts --topic <slug>            # skip files already present
 *   pnpm tsx scripts/geo/lib/fetch.ts --topic <slug> --force    # re-download everything
 *
 * Each download is retried 3 times with backoff; a dataset that still fails
 * prints a WARN and the run continues (later steps say which input is missing).
 * OpenHistoricalMap extracts are not downloaded here: see ohm-export.ts.
 *
 * Two dataset kinds are resolved at download time (manifest.ts `Dataset`):
 * `datagov` (a data.gov.sg dataset id: the API's `poll-download` gives the
 * current signed link) and `overpass` (an OpenStreetMap Overpass QL query: the
 * response is kept as `<file>.osm.json`, its osmtogeojson conversion is
 * `file`). Every download is logged with its size, SHA-256 and time in
 * raw/fetch-log.json (gitignored with raw/; copy the lines into SOURCES-GEO.md).
 */
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { parseArgs } from 'node:util';
import { TOOLS, TOOLS_PACKAGE_NAME, TOOL_PACKAGES, log, osmToGeoJson, readJson, toolsInstalled, warn, writeJson } from './common';
import type { Dataset } from './manifest';
import { openTopic } from './topic';

const USER_AGENT = 'AtlasGeoPipeline/0.1 (non-commercial education; https://github.com/)';
const DATAGOV_API = 'https://api-open.data.gov.sg/v1/public/api/datasets';
/** Public Overpass instances, tried in order (a busy one answers with an HTML error page). */
const OVERPASS = ['https://overpass-api.de/api/interpreter', 'https://overpass.private.coffee/api/interpreter', 'https://overpass.kumi.systems/api/interpreter'];

const { values } = parseArgs({ options: { topic: { type: 'string' }, force: { type: 'boolean', default: false } } });
const topic = openTopic(values.topic);

async function download(url: string, file: string, init: RequestInit = {}): Promise<number> {
  let lastError: unknown;
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const res = await fetch(url, { ...init, headers: { 'User-Agent': USER_AGENT, ...(init.headers ?? {}) }, signal: AbortSignal.timeout(600_000) });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const buf = Buffer.from(await res.arrayBuffer());
      writeFileSync(file, buf);
      return buf.length;
    } catch (e) {
      lastError = e;
      if (attempt < 3) await new Promise((r) => setTimeout(r, 2000 * attempt));
    }
  }
  throw lastError;
}

/** The current signed download link of a data.gov.sg dataset (valid for about an hour). */
async function datagovUrl(id: string): Promise<string> {
  const res = await fetch(`${DATAGOV_API}/${id}/poll-download`, { headers: { 'User-Agent': USER_AGENT }, signal: AbortSignal.timeout(60_000) });
  if (!res.ok) throw new Error(`data.gov.sg poll-download HTTP ${res.status}`);
  const body = (await res.json()) as { code?: number; data?: { url?: string }; errorMsg?: string };
  if (!body.data?.url) throw new Error(`data.gov.sg poll-download: ${body.errorMsg || 'no url'}`);
  return body.data.url;
}

/** Download one dataset into raw/; returns the file written and its size. */
async function fetchDataset(ds: Dataset, file: string): Promise<{ bytes: number; from: string }> {
  if (ds.overpass) {
    const osm = `${file.replace(/\.geojson$/, '')}.osm.json`;
    let lastError: unknown;
    for (const endpoint of OVERPASS) {
      try {
        const bytes = await download(endpoint, osm, {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: `data=${encodeURIComponent(ds.overpass)}`,
        });
        const data = JSON.parse(readFileSync(osm, 'utf8')) as { elements?: unknown[] };
        if (!Array.isArray(data.elements)) throw new Error('no elements in the response');
        writeJson(file, osmToGeoJson(data));
        return { bytes, from: `${endpoint} (Overpass QL in sources.json)` };
      } catch (e) {
        lastError = e;
        warn(`Overpass ${endpoint}: ${(e as Error).message}`);
      }
    }
    throw lastError;
  }
  if (ds.datagov) return { bytes: await download(await datagovUrl(ds.datagov), file), from: `data.gov.sg dataset ${ds.datagov} (poll-download)` };
  return { bytes: await download(ds.url, file), from: ds.url };
}

const sha256 = (file: string) => createHash('sha256').update(readFileSync(file)).digest('hex');

function installTools(): void {
  if (toolsInstalled() && !values.force) {
    log(`tools     present in ${TOOLS}`);
    return;
  }
  writeJson(`${TOOLS}/package.json`, { name: TOOLS_PACKAGE_NAME, private: true }, true);
  log(`tools     npm install ${TOOL_PACKAGES.join(' ')}`);
  try {
    execFileSync('npm', ['install', '--no-audit', '--no-fund', '--silent', ...TOOL_PACKAGES], { cwd: TOOLS, stdio: 'inherit' });
  } catch (e) {
    warn(`tool install failed (${(e as Error).message}); later steps need ${TOOL_PACKAGES.join(', ')}`);
  }
}

async function main(): Promise<void> {
  topic.ensureDirs();
  installTools();
  let failed = 0;
  const logFile = topic.rawFile('fetch-log.json');
  const fetchLog = existsSync(logFile) ? readJson<Record<string, unknown>>(logFile) : {};
  for (const [id, ds] of Object.entries(topic.sources.datasets)) {
    const file = topic.rawFile(ds.file);
    if (existsSync(file) && statSync(file).size > 0 && !values.force) {
      log(`skip      ${id} (${ds.file}, ${(statSync(file).size / 1e6).toFixed(1)} MB)`);
      continue;
    }
    try {
      const { bytes, from } = await fetchDataset(ds, file);
      const hash = sha256(file);
      fetchLog[id] = { file: ds.file, bytes: statSync(file).size, sha256: hash, fetched: new Date().toISOString(), from, license: ds.license };
      writeJson(logFile, fetchLog, true);
      log(`fetched   ${id} -> raw/${ds.file} (${(bytes / 1e6).toFixed(1)} MB, ${ds.license}) sha256 ${hash}`);
    } catch (e) {
      failed++;
      warn(`could not download ${id} from ${ds.url}: ${(e as Error).message} — continuing`);
    }
  }
  if (failed) warn(`${failed} dataset(s) missing; compose.ts will fail for keyframes that use them`);
}

await main();
