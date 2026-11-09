import { execFileSync } from 'node:child_process';
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const root = fileURLToPath(new URL('../', import.meta.url));
const preload = resolve(root, 'tests/helpers/generator-text-capture.mjs');
type Text = Record<string, { en: string; zh: string }>;
function textFields(value: unknown, path = ''): Text {
  if (!value || typeof value !== 'object') return {};
  const object = value as Record<string, unknown>;
  if (typeof object.en === 'string' && typeof object.zh === 'string') return { [path]: object as Text[string] };
  return Object.assign({}, ...Object.entries(object).map(([key, child]) => textFields(child,
    Array.isArray(value) ? `${path}[${(child as { id?: string } | null)?.id ?? key}]` : `${path}.${key}`)));
}

const textStages: Record<string, string> = {
  cells: 'generate.mjs',
  'states-of-matter': 'build-parts.ts',
  'eyes-and-ears': 'build-parts.ts',
  'fossils-and-skeletons': 'build-model.ts',
  'frog-and-chicken': 'build-parts.ts',
  'mangrove-food-web': 'build-topic.ts',
  'living-things': 'build-parts.ts',
};
const topics = readdirSync(resolve(root, 'scripts/geo')).filter(topic =>
  existsSync(resolve(root, `src/content/topics/${topic}/data/parts.json`)) &&
  (topic in textStages || existsSync(resolve(root, `scripts/geo/${topic}/build-parts.ts`))));

describe('generator text agrees byte-for-byte with accepted bilingual display text', () => {
  it.each(topics)('%s can be rebuilt without reverting any text', topic => {
    const target = resolve(root, `src/content/topics/${topic}/data/parts.json`);
    const before = readFileSync(target, 'utf8');
    const path = resolve(root, `scripts/geo/${topic}/${textStages[topic] ?? 'build-parts.ts'}`);
    const output = execFileSync(process.execPath, ['--import', 'tsx', '--import', preload, path,
      ...(topic in textStages ? ['--text-only'] : [])], {
      cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], maxBuffer: 32 * 1024 * 1024, timeout: 30000,
      env: { ...process.env, ATLAS_TEXT_TARGET: target },
    });
    const captured = output.split('\n').filter(line => line.startsWith('ATLAS_TEXT_STAGE ')).at(-1);
    const generated = captured ? JSON.parse(captured.slice('ATLAS_TEXT_STAGE '.length)) as Text : textFields(JSON.parse(output));
    const accepted = textFields(JSON.parse(before));
    const differences = [...new Set([...Object.keys(generated), ...Object.keys(accepted)])]
      .filter(key => JSON.stringify(generated[key]) !== JSON.stringify(accepted[key]));
    expect(differences, `${topic}: mismatched text paths`).toEqual([]);
    expect(readFileSync(target, 'utf8')).toBe(before);
  }, 35000);
});
