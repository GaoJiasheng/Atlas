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
 */
import { execFileSync } from 'node:child_process';
import { existsSync, statSync, writeFileSync } from 'node:fs';
import { parseArgs } from 'node:util';
import { TOOLS, TOOLS_PACKAGE_NAME, TOOL_PACKAGES, log, toolsInstalled, warn, writeJson } from './common';
import { openTopic } from './topic';

const USER_AGENT = 'AtlasGeoPipeline/0.1 (non-commercial education; https://github.com/)';

const { values } = parseArgs({ options: { topic: { type: 'string' }, force: { type: 'boolean', default: false } } });
const topic = openTopic(values.topic);

async function download(url: string, file: string): Promise<number> {
  let lastError: unknown;
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const res = await fetch(url, { headers: { 'User-Agent': USER_AGENT }, signal: AbortSignal.timeout(300_000) });
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
  for (const [id, ds] of Object.entries(topic.sources.datasets)) {
    const file = topic.rawFile(ds.file);
    if (existsSync(file) && statSync(file).size > 0 && !values.force) {
      log(`skip      ${id} (${ds.file}, ${(statSync(file).size / 1e6).toFixed(1)} MB)`);
      continue;
    }
    try {
      const bytes = await download(ds.url, file);
      log(`fetched   ${id} -> raw/${ds.file} (${(bytes / 1e6).toFixed(1)} MB, ${ds.license})`);
    } catch (e) {
      failed++;
      warn(`could not download ${id} from ${ds.url}: ${(e as Error).message} — continuing`);
    }
  }
  if (failed) warn(`${failed} dataset(s) missing; compose.ts will fail for keyframes that use them`);
}

await main();
