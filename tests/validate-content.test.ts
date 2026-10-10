/**
 * The content validator against a temporary topics tree (ATLAS_TOPICS_DIR):
 * copies of sample-time and sample-space, each broken in one way.
 */
import { execFileSync } from 'node:child_process';
import { cpSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { mergeSourcesMd, sourceLine, sourcesBlock, BEGIN, END } from '../scripts/sources-md';

const ROOT = join(import.meta.dirname, '..');
const SAMPLE = join(ROOT, 'src/content/topics/sample-time');
const SAMPLE_SPACE = join(ROOT, 'src/content/topics/sample-space');

let dir = '';
let output = '';
let status = 0;

/** Copy sample-time (or `from`) to `<dir>/<slug>` and apply `edit` to it. */
function topic(slug: string, edit: (root: string) => void = () => {}, from = SAMPLE) {
  const root = join(dir, slug);
  cpSync(from, root, { recursive: true });
  const yaml = join(root, 'topic.yaml');
  writeFileSync(yaml, readFileSync(yaml, 'utf8').replace(/^id: sample-(time|space)$/m, `id: ${slug}`));
  edit(root);
}

/** A chapter file: frontmatter lines + a bilingual body. */
function chapterFile(front: string[], body = 'Text.'): string {
  return ['---', ...front, '---', '', '<Lang en>', '', body, '', '</Lang>', '', '<Lang zh>', '', '文字。', '', '</Lang>', ''].join('\n');
}

const GLOSSARY = {
  terms: [
    { id: 'front', term: { en: 'Front', zh: '前线' }, definition: { en: 'Where two armies meet.', zh: '两军交锋的地方。' }, see: ['siege'] },
    { id: 'siege', term: { en: 'Siege', zh: '围城' }, definition: { en: 'A city cut off.', zh: '被切断的城市。' } },
  ],
};

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
  topic('with-background', (root) => {
    writeFileSync(
      join(root, 'chapters/00-before.mdx'),
      chapterFile(
        ['id: before', 'order: 0', 'kind: background', 'title: { en: "Before", zh: "之前" }', 'state:', '  note: { en: "How it is written.", zh: "怎么写的。" }', '  summary: { en: "Before.", zh: "之前。" }'],
        'A <Term id="front">front</Term> line.',
      ),
    );
    writeFileSync(join(root, 'data/glossary.json'), JSON.stringify(GLOSSARY));
  });
  topic('bad-background', (root) => {
    writeFileSync(join(root, 'chapters/09-late.mdx'), chapterFile(['id: late', 'order: 9', 'kind: background', 'title: { en: "Late", zh: "晚" }']));
    writeFileSync(
      join(root, 'chapters/10-noted.mdx'),
      chapterFile(['id: noted', 'order: 10', 'title: { en: "Noted", zh: "注" }', 'state:', '  note: { en: "A note.", zh: "说明。" }']),
    );
  });
  topic('term-without-glossary', (root) => {
    writeFileSync(join(root, 'chapters/09-term.mdx'), chapterFile(['id: term', 'order: 9', 'title: { en: "Term", zh: "词" }'], 'A <Term id="front">front</Term>.'));
  });
  topic('bad-glossary', (root) => {
    const glossary = structuredClone(GLOSSARY);
    glossary.terms[0]!.see = ['nowhere'];
    writeFileSync(join(root, 'data/glossary.json'), JSON.stringify(glossary));
  });
  topic('unknown-term', (root) => {
    writeFileSync(join(root, 'data/glossary.json'), JSON.stringify(GLOSSARY));
    writeFileSync(join(root, 'chapters/09-term.mdx'), chapterFile(['id: term', 'order: 9', 'title: { en: "Term", zh: "词" }'], 'A <Term id="trench">trench</Term>.'));
  });
  topic('space-clean', () => {}, SAMPLE_SPACE);
  topic(
    'space-bad-beats',
    (root) => {
      const file = join(root, 'chapters/03-switch-on.mdx');
      const text = readFileSync(file, 'utf8')
        .replace('hide: [sample-panel, sample-shroud]', 'hide: [sample-panel, sample-lid]')
        .replace('labels: [sample-drum, sample-fins, sample-cap]', 'labels: [sample-drum, sample-wall, sample-cog]')
        .replace('camera: sample-left', 'camera: sample-right')
        .replace('"group:sample-loop"', '"group:sample-air"')
        .replace('<FlyTo preset="sample-left">See', '<FlyTo preset="sample-top">See');
      writeFileSync(file, text);
      // A named preset may not reuse an id of the topic.
      editJson(join(root, 'data/parts.json'), (parts: { presets: { id: string }[] }) => {
        parts.presets.push({ ...parts.presets[0]!, id: 'whole-thing' });
      });
    },
    SAMPLE_SPACE,
  );
  topic(
    'space-orbit-preset',
    (root) =>
      editJson(join(root, 'data/parts.json'), (parts: { presets: { id: string }[] }) => {
        parts.presets.push({ ...parts.presets[0]!, id: 'orbit' });
      }),
    SAMPLE_SPACE,
  );
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
    expect(output).toMatch(/12 topic\(s\)/);
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

  it('accepts a background chapter (order 0, reading note) and <Term> refs to the glossary', () => {
    expect(linesFor('with-background').filter((l) => l.startsWith('error'))).toEqual([]);
  });

  it('requires the background chapter to come first, and the reading note to sit on it', () => {
    const lines = linesFor('bad-background').join('\n');
    expect(lines).toContain('the background chapter must have order 0 (has 9)');
    expect(lines).toContain('state.note (the reading note) belongs on the background chapter');
  });

  it('checks <Term> ids and glossary references', () => {
    expect(linesFor('term-without-glossary').join('\n')).toContain('<Term id="front">: the topic has no data/glossary.json');
    expect(linesFor('bad-glossary').join('\n')).toContain('data.glossary.terms.0.see.0: unknown term "nowhere"');
    expect(linesFor('unknown-term').join('\n')).toContain('<Term id="trench">: unknown term (not in data/glossary.json)');
  });
});

describe('validate-content: SpaceScene beats and presets', () => {
  it('passes an unmodified copy of sample-space (beats, a named preset, <FlyTo>)', () => {
    expect(linesFor('space-clean').filter((l) => l.startsWith('error'))).toEqual([]);
  });

  it('checks the ids a beat names and the named presets', () => {
    const lines = linesFor('space-bad-beats').join('\n');
    expect(lines).toContain('state.beats.0.hide: unknown part "sample-lid"');
    expect(lines).toContain('state.beats.0.labels: "sample-wall" is a context part');
    expect(lines).toContain('state.beats.0.labels: unknown part "sample-cog"');
    expect(lines).toContain('state.beats.1.camera: unknown preset "sample-right"');
    expect(lines).toContain('state.beats.1.labels: unknown group "sample-air"');
    expect(lines).toContain('<FlyTo preset="sample-top">: unknown preset');
    expect(lines).toMatch(/chapter id "whole-thing" duplicates/);
  });

  it('keeps the engine\'s own preset ids (ORBIT, REF.) for the engine', () => {
    expect(linesFor('space-orbit-preset').join('\n')).toContain('data.parts.presets.2.id: "orbit" is the engine\'s own preset id');
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
