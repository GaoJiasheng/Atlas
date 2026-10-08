/**
 * The content validator against a temporary topics tree (ATLAS_TOPICS_DIR):
 * copies of sample-time, each broken in one way.
 */
import { execFileSync } from 'node:child_process';
import { cpSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { mergeSourcesMd, sourceLine, sourcesBlock, BEGIN, END } from '../scripts/sources-md';

const ROOT = join(import.meta.dirname, '..');
const SAMPLE = join(ROOT, 'src/content/topics/sample-time');

let dir = '';
let output = '';
let status = 0;

/** Copy sample-time to `<dir>/<slug>` and apply `edit` to it. */
function topic(slug: string, edit: (root: string) => void = () => {}) {
  const root = join(dir, slug);
  cpSync(SAMPLE, root, { recursive: true });
  const yaml = join(root, 'topic.yaml');
  writeFileSync(yaml, readFileSync(yaml, 'utf8').replace(/^id: sample-time$/m, `id: ${slug}`));
  edit(root);
}

function editJson(file: string, edit: (value: never) => void) {
  const value = JSON.parse(readFileSync(file, 'utf8'));
  edit(value as never);
  writeFileSync(file, JSON.stringify(value, null, 2));
}

/** Validator lines (errors and warnings) about one topic folder. */
const linesFor = (slug: string) => output.split('\n').filter((l) => l.includes(`/${slug}/`) || l.includes(`/${slug} `));

beforeAll(() => {
  dir = mkdtempSync(join(tmpdir(), 'atlas-validate-'));
  topic('clean');
  topic('bad-kind', (root) =>
    editJson(join(root, 'data/events.json'), (events: { kind: string }[]) => {
      events[1]!.kind = 'skirmish';
    }),
  );
  topic('missing-event-source', (root) =>
    editJson(join(root, 'data/events.json'), (events: { sources?: string[] }[]) => {
      events[0]!.sources = ['S1', 'S9'];
    }),
  );
  topic('bad-body', (root) => {
    const file = join(root, 'chapters/03-third-look.mdx');
    const text = readFileSync(file, 'utf8')
      .replace('<Num s="S1">about 1,000</Num>', '<Num s="S7">about 1,000</Num>')
      .replace('<FlyTo preset="sample-east">Go', '<FlyTo preset="nowhere">Go');
    writeFileSync(file, text);
  });
  try {
    output = execFileSync(join(ROOT, 'node_modules/.bin/tsx'), ['scripts/validate-content.ts'], {
      cwd: ROOT,
      env: { ...process.env, ATLAS_TOPICS_DIR: dir, FORCE_COLOR: '0' },
      encoding: 'utf8',
    });
  } catch (e) {
    const err = e as { status: number; stdout: string };
    status = err.status;
    output = err.stdout;
  }
}, 60_000);

afterAll(() => {
  if (dir) rmSync(dir, { recursive: true, force: true });
});

describe('validate-content', () => {
  it('fails the run when any topic has errors', () => {
    expect(status).toBe(1);
    expect(output).toMatch(/4 topic\(s\)/);
  });

  it('passes an unmodified copy', () => {
    expect(linesFor('clean').filter((l) => l.startsWith('error'))).toEqual([]);
  });

  it('reports an unknown event kind', () => {
    expect(linesFor('bad-kind').join('\n')).toMatch(/data\.events\.1\.kind: Invalid enum value.*'skirmish'/);
  });

  it('reports an event source missing from sources.json', () => {
    expect(linesFor('missing-event-source').join('\n')).toContain('data.events.0.sources.1: unknown source "S9" (not in data/sources.json)');
  });

  it('reports <Num> and <FlyTo> refs that do not exist', () => {
    const lines = linesFor('bad-body').join('\n');
    expect(lines).toContain('<Num s="S7">: unknown source "S7"');
    expect(lines).toContain('<FlyTo preset="nowhere">: unknown preset');
  });
});

describe('sources-md', () => {
  const sources = [
    { id: 'S1', text: { en: 'A judgment.', zh: '判决书。' }, url: 'https://example.org/a' },
    { id: 'S2', text: { en: 'A survey.', zh: '' }, note: { en: 'Range.', zh: '区间。' } },
  ];

  it('renders one line per source', () => {
    expect(sourceLine(sources[0]!)).toBe('- [S1] A judgment. / 判决书。 — https://example.org/a');
    expect(sourceLine(sources[1]!)).toBe('- [S2] A survey. (Range. / 区间。)');
  });

  it('replaces only its own block and keeps the rest of SOURCES.md', () => {
    const block = sourcesBlock(sources);
    expect(mergeSourcesMd(null, block, 'ww2')).toBe(`# Sources · ww2\n\n${block}\n`);
    const handWritten = '# Sources\n\nK1: CShapes 2.0, CC BY-NC-SA.\n';
    const appended = mergeSourcesMd(handWritten, block, 'ww2');
    expect(appended.startsWith(handWritten.trimEnd())).toBe(true);
    expect(appended).toContain(block);
    const replaced = mergeSourcesMd(appended, sourcesBlock(sources.slice(0, 1)), 'ww2');
    expect(replaced).toContain('K1: CShapes 2.0');
    expect(replaced).not.toContain('[S2]');
    expect(replaced.split(BEGIN)).toHaveLength(2);
    expect(replaced.split(END)).toHaveLength(2);
  });
});
