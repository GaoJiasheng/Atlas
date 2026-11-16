import { execFile } from 'node:child_process';
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';
import { beforeAll, describe, expect, it } from 'vitest';

const root = fileURLToPath(new URL('../', import.meta.url));
const preload = resolve(root, 'tests/helpers/generator-text-capture.mjs');
const runner = resolve(root, 'tests/helpers/generator-text-run.mjs');
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
  'heart-and-lungs': 'build-parts.ts',
  'saturn-v': 'build-parts.ts',
};
const topics = readdirSync(resolve(root, 'scripts/geo')).filter(topic =>
  existsSync(resolve(root, `src/content/topics/${topic}/data/parts.json`)) &&
  (topic in textStages || existsSync(resolve(root, `scripts/geo/${topic}/build-parts.ts`))));
const jobs = topics.map(topic => ({
  topic,
  path: resolve(root, `scripts/geo/${topic}/${textStages[topic] ?? 'build-parts.ts'}`),
  target: resolve(root, `src/content/topics/${topic}/data/parts.json`),
  args: topic in textStages ? ['--text-only'] : [],
}));

// Every generator runs once, in one child process (generator-text-run.mjs):
// one Node + tsx start-up for the whole suite instead of one per topic.
const before = Object.fromEntries(jobs.map(job => [job.topic, readFileSync(job.target, 'utf8')]));
let results: Record<string, { output: string; error?: string }> = {};
beforeAll(async () => {
  const { stdout } = await promisify(execFile)(process.execPath,
    ['--import', 'tsx', '--import', preload, runner, JSON.stringify(jobs)], {
      cwd: root, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024, timeout: 90000,
      env: { ...process.env },
    });
  const rows = JSON.parse(stdout) as ({ topic: string } & (typeof results)[string])[];
  results = Object.fromEntries(rows.map(({ topic, ...row }) => [topic, row]));
}, 95000);

describe('generator text agrees byte-for-byte with accepted bilingual display text', () => {
  it.each(topics)('%s can be rebuilt without reverting any text', topic => {
    const { target } = jobs.find(job => job.topic === topic)!;
    const result = results[topic];
    expect(result, `${topic}: generator did not run`).toBeDefined();
    expect(result!.error, `${topic}: generator failed`).toBeUndefined();
    const output = result!.output;
    const captured = output.split('\n').filter(line => line.startsWith('ATLAS_TEXT_STAGE ')).at(-1);
    const generated = captured ? JSON.parse(captured.slice('ATLAS_TEXT_STAGE '.length)) as Text : textFields(JSON.parse(output));
    const accepted = textFields(JSON.parse(before[topic]!));
    const differences = [...new Set([...Object.keys(generated), ...Object.keys(accepted)])]
      .filter(key => JSON.stringify(generated[key]) !== JSON.stringify(accepted[key]));
    expect(differences, `${topic}: mismatched text paths`).toEqual([]);
    expect(readFileSync(target, 'utf8')).toBe(before[topic]);
  });
});
