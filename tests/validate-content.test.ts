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
const SAMPLE_CYCLE = join(ROOT, 'src/content/topics/sample-life-cycle');
const FRACTIONS = join(ROOT, 'src/content/topics/fractions');

let dir = '';
let output = '';
let status = 0;

/** Copy sample-time (or `from`) to `<dir>/<slug>` and apply `edit` to it. */
function topic(slug: string, edit: (root: string) => void = () => {}, from = SAMPLE) {
  const root = join(dir, slug);
  cpSync(from, root, { recursive: true });
  const yaml = join(root, 'topic.yaml');
  writeFileSync(yaml, readFileSync(yaml, 'utf8').replace(/^id: (sample-time|sample-space|sample-life-cycle|fractions)$/m, `id: ${slug}`));
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
  topic('dated-layer-refs', (root) => {
    const yaml = join(root, 'topic.yaml');
    writeFileSync(yaml, `${readFileSync(yaml, 'utf8')}\ndatedLayers:\n  - id: north-sample\n    file: missing-dated-overlay\n    kind: point\n    holder: unknown-holder\n    label: { en: Sample blocks, zh: 示例楼宇 }\n`);
    writeFileSync(join(root, 'chapters/09-dated-overlays.mdx'), chapterFile([
      'id: dated-overlays', 'order: 9', 'title: { en: Overlays, zh: 图层 }', 'state:',
      '  layers: [base, north-sample, missing-layer]', '  beats:',
      '    - caption: { en: Sample, zh: 示例 }', '      layers: [north-sample, missing-beat-layer]',
    ]));
  });
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
  topic('topic-links', (root) => {
    writeFileSync(
      join(root, 'chapters/09-links.mdx'),
      chapterFile(
        ['id: links', 'order: 9', 'title: { en: "Links", zh: "链接" }'],
        'See <TopicLink slug="clean" ch="second-look">this</TopicLink>, <TopicLink slug="clean" ch="nowhere">that</TopicLink> and <TopicLink slug="clean">the topic</TopicLink>.',
      ),
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
  for (const [slug, link] of [
    ['cycle-link-clean', { topic: 'clean', chapter: 'second-look' }],
    ['cycle-link-topic', { topic: 'missing-topic' }],
    ['cycle-link-chapter', { topic: 'clean', chapter: 'missing-chapter' }],
  ] as const) {
    topic(slug, (root) => {
      editJson(join(root, 'data/parts.json'), (file: { sim: { lifeCycle: { card: { compare: { link: { topic: string; chapter?: string; label: { en: string; zh: string } } } } } } }) => {
        file.sim.lifeCycle.card.compare.link = { ...link, label: { en: 'See it', zh: '去看' } };
      });
      const chapter = join(root, 'chapters/04-two-cycles.mdx');
      writeFileSync(chapter, readFileSync(chapter, 'utf8').replaceAll('slug="grasshopper" ch="nerves-and-growing-up"', 'slug="clean" ch="second-look"'));
    }, SAMPLE_CYCLE);
  }
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
  topic(
    'space-glb-node',
    (root) => {
      // A glb node the model does not have, an exercise beat outside training.json, a shared source the tree lacks.
      editJson(join(root, 'data/parts.json'), (parts: { parts: { id: string; mesh?: string }[] }) => {
        parts.parts.find((p) => p.id === 'sample-lower')!.mesh = 'sample-forearm.l';
      });
      const file = join(root, 'chapters/05-sample-motion.mdx');
      writeFileSync(file, readFileSync(file, 'utf8').replace('exercise: { id: sample-curl, phase: loop }', 'exercise: { id: sample-hang, phase: loop }'));
      const body = join(root, 'chapters/01-whole-thing.mdx');
      writeFileSync(body, readFileSync(body, 'utf8').replace('<Lang en>\n\n', '<Lang en>\n\nA <Num s="M999">shared</Num> number. '));
    },
    SAMPLE_SPACE,
  );
  topic('lesson-clean', () => {}, FRACTIONS);
  topic(
    'lesson-bad',
    (root) => {
      rmSync(join(root, 'chapters/05-comparing-fractions.mdx'));
      const body = join(root, 'chapters/03-non-unit-fractions.mdx');
      writeFileSync(body, readFileSync(body, 'utf8').replace('<Lang en>\n\n', '<Lang en>\n\nOpen <Task id="nowhere">this</Task>, <Beat n={9}>that</Beat> and <Frac n="a" d={4} />. '));
      editJson(join(root, 'data/lesson.json'), (lesson: { steps: { beats: unknown[]; pool: { prompt: { en: string }; options?: { misconception?: string }[] }[] }[] }) => {
        lesson.steps[0]!.pool[1]!.prompt.en += ' {3/x}';
        delete lesson.steps[1]!.pool[2]!.options![1]!.misconception;
        lesson.steps[3]!.pool = lesson.steps[3]!.pool.slice(0, 5);
        lesson.steps[4]!.beats = lesson.steps[4]!.beats.slice(0, 2);
      });
    },
    FRACTIONS,
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
    expect(output).toMatch(/20 topic\(s\)/);
  });

  it('passes an unmodified copy', () => {
    expect(linesFor('clean').filter((l) => l.startsWith('error'))).toEqual([]);
  });

  it('reports an unknown event kind', () => {
    expect(linesFor('bad-kind').join('\n')).toMatch(/data\.events\.1\.kind: Invalid enum value.*'skirmish'/);
  });

  it('checks dated overlay files, holders, layer references and the shared id namespace', () => {
    const lines = linesFor('dated-layer-refs').join('\n');
    expect(lines).toContain('entity id "north-sample" duplicates dated layer "north-sample"');
    expect(lines).toContain('dated layer "north-sample": unknown entity "unknown-holder"');
    expect(output).toContain('dated layer "north-sample": file not found');
    expect(lines).toContain('state.layers: unknown layer "missing-layer"');
    expect(lines).toContain('state.beats.0.layers: unknown layer "missing-beat-layer"');
    expect(lines).not.toContain('unknown layer "north-sample"');
  });

  it('reports an event source missing from sources.json', () => {
    expect(linesFor('missing-event-source').join('\n')).toContain('data.events.0.sources.1: unknown source "S9" (not in data/sources.json)');
  });

  it('reports <Num> and <FlyTo> refs that do not exist', () => {
    const lines = linesFor('bad-body').join('\n');
    expect(lines).toContain('<Num s="S7">: unknown source "S7"');
    expect(lines).toContain('<FlyTo preset="nowhere">: unknown preset');
  });

  it('checks the chapter a <TopicLink ch> names', () => {
    const errors = linesFor('topic-links').filter((l) => l.startsWith('error'));
    expect(errors).toHaveLength(1);
    expect(errors[0]).toContain('<TopicLink slug="clean" ch="nowhere">: topic "clean" has no chapter "nowhere"');
  });

  it('checks a life-cycle comparison link topic and chapter', () => {
    const linkErrors = (slug: string) => linesFor(slug).filter((line) => line.includes('sim.lifeCycle.card.compare.link'));
    expect(linesFor('cycle-link-clean').filter((line) => line.startsWith('error'))).toEqual([]);
    expect(linkErrors('cycle-link-clean')).toEqual([]);
    expect(linkErrors('cycle-link-topic')).toHaveLength(1);
    expect(linkErrors('cycle-link-topic')[0]).toContain('no topic "missing-topic"');
    expect(linkErrors('cycle-link-chapter')).toHaveLength(1);
    expect(linkErrors('cycle-link-chapter')[0]).toContain('topic "clean" has no chapter "missing-chapter"');
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

describe('validate-content: glb models and shared fitness data (docs/16 M1, M10)', () => {
  it('checks every glb node the parts name, exercise beats against training.json and shared source ids', () => {
    const lines = linesFor('space-glb-node').join('\n');
    expect(lines).toContain('model /models/sample-space.glb: part "sample-lower" mesh: no node named "sample-forearm.l"');
    expect(lines).toContain('state.beats.1.exercise: "sample-hang" is not in data/training.json exercises');
    expect(lines).toContain('<Num s="M999">: unknown source "M999"');
  });
});

describe('validate-content: MathScene lesson (docs/15 §4.10, §10)', () => {
  it('passes an unmodified copy of the fractions lesson', () => {
    expect(linesFor('lesson-clean').filter((l) => l.startsWith('error'))).toEqual([]);
  });

  it('checks chapters against steps, beats and check pools, <Task> / <Beat> / <Frac>, tokens and planned feedback', () => {
    const lines = linesFor('lesson-bad').join('\n');
    expect(lines).toContain('step "comparing-fractions" has no chapter');
    expect(lines).toContain('<Task id="nowhere">: unknown step or check task');
    expect(lines).toContain('<Beat n={9}>: the chapter has beats 1–4');
    expect(lines).toContain('step "number-line": the check pool has 5 tasks (8–10)');
    expect(lines).toContain('step "comparing-fractions": 2 beats (3–5)');
    expect(lines).toContain('<Frac> needs whole numbers n and d');
    expect(lines).toContain('"{3/x}" is not a fraction token');
    expect(lines).toContain('option "b" is wrong but names no misconception');
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
