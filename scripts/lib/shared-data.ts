/**
 * Read a shared-data tree from disk (node only): the raw JSON of
 * `src/content/shared/fitness/` as `withSharedFitness` takes it
 * (content/schema/fitness.ts). Used by `pnpm validate` and the tests; the
 * site build reads the same files with `import.meta.glob` (src/lib/content.ts).
 */
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import type { SharedFitnessRaw } from '../../src/content/schema/fitness';

const isDir = (path: string) => existsSync(path) && statSync(path).isDirectory();

/** Raw JSON of `<sharedDir>/fitness` (empty when there is none); `onError` hears about files that are not JSON. */
export function readSharedFitness(sharedDir: string, onError: (file: string, message: string) => void = () => {}): SharedFitnessRaw {
  const dir = join(sharedDir, 'fitness');
  const out: SharedFitnessRaw = { muscles: {}, exercises: {} };
  if (!isDir(dir)) return out;
  const read = (file: string): unknown => {
    try {
      return JSON.parse(readFileSync(file, 'utf8'));
    } catch (e) {
      onError(file, `invalid JSON: ${(e as Error).message}`);
      return undefined;
    }
  };
  for (const sub of ['muscles', 'exercises'] as const) {
    const subDir = join(dir, sub);
    if (!isDir(subDir)) continue;
    for (const name of readdirSync(subDir).sort()) {
      if (!name.endsWith('.json')) continue;
      const value = read(join(subDir, name));
      if (value !== undefined) out[sub][name.replace(/\.json$/, '')] = value;
    }
  }
  const sources = join(dir, 'sources.json');
  if (existsSync(sources)) out.sources = read(sources);
  return out;
}
