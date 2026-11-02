/** Compatibility entry point; the reproducible build-time model lives in scripts/geo. */
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
execFileSync('pnpm', ['tsx', fileURLToPath(new URL('../../../../scripts/geo/steam-engine/build-engine.mjs', import.meta.url))], { stdio: 'inherit' });
