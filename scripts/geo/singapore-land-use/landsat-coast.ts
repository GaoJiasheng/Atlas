/** Topic-local entry point. Python raster dependencies are isolated in ignored work/venv.
 * See landsat-coast.py and SOURCES-GEO.md; no network request occurs at runtime.
 */
import { spawnSync } from 'node:child_process';
import { resolve } from 'node:path';
const dir = import.meta.dirname;
const result = spawnSync(resolve(dir, 'work/venv/bin/python'), [resolve(dir, 'landsat-coast.py'), ...process.argv.slice(2)], { stdio: 'inherit' });
process.exit(result.status ?? 1);
