import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { parse as parseYaml } from 'yaml';
import { SUBJECTS, topicSchema } from '../src/content/schema/topic';
import { chapterSchema } from '../src/content/schema/chapter';
import { bilingual, isoDate, timePoint } from '../src/content/schema/common';
import { EVENT_KINDS, controlFile, entitySchema, presetsFile, timeChapterRefs, timeChapterState, timeSceneGeoData } from '../src/engines/time-scene/schema';
import { sourcesFile } from '../src/content/schema/sources';
import { spaceChapterState, spaceSceneData } from '../src/engines/space-scene/schema';

const TOPICS = join(import.meta.dirname, '../src/content/topics');

function loadData(slug: string): Record<string, unknown> {
  const dir = join(TOPICS, slug, 'data');
  return Object.fromEntries(
    readdirSync(dir)
      .filter((f) => f.endsWith('.json'))
      .map((f) => [f.replace(/\.json$/, ''), JSON.parse(readFileSync(join(dir, f), 'utf8'))]),
  );
}

function loadChapters(slug: string): unknown[] {
  const dir = join(TOPICS, slug, 'chapters');
  return readdirSync(dir)
    .filter((f) => f.endsWith('.mdx'))
    .map((f) => {
      const text = readFileSync(join(dir, f), 'utf8');
      return parseYaml(/^---\n([\s\S]*?)\n---/.exec(text)?.[1] ?? '');
    });
}

describe('common schemas', () => {
  it('accepts the three ISO date precisions and rejects impossible dates', () => {
    for (const ok of ['1942', '1942-02', '1942-02-15', '2000-02-29', '-0221']) expect(isoDate.safeParse(ok).success).toBe(true);
    for (const bad of ['42', '1942-2', '1942-13', '1942-02-30', '1900-02-29', '1942/02/15']) {
      expect(isoDate.safeParse(bad).success).toBe(false);
    }
  });

  it('accepts geological time', () => {
    expect(timePoint.parse({ ma: 200 })).toEqual({ ma: 200 });
    expect(timePoint.safeParse({ ma: -1 }).success).toBe(false);
  });

  it('requires en and defaults zh to empty', () => {
    expect(bilingual.parse({ en: 'Hi' })).toEqual({ en: 'Hi', zh: '' });
    expect(bilingual.safeParse({ zh: '你好' }).success).toBe(false);
    expect(bilingual.safeParse({ en: 'Hi', fr: 'Salut' }).success).toBe(false);
  });
});

describe('sample-time topic', () => {
  it('topic.yaml parses', () => {
    const topic = topicSchema.parse(parseYaml(readFileSync(join(TOPICS, 'sample-time/topic.yaml'), 'utf8')));
    expect(topic.engine).toBe('time-scene');
    expect(topic.stage).toBe('geo');
  });

  it('engine data parses', () => {
    const data = timeSceneGeoData.parse(loadData('sample-time'));
    expect(data.entities).toHaveLength(3);
    expect(data.control.keyframes).toHaveLength(3);
    expect(data.movements).toHaveLength(2);
    expect(data.events).toHaveLength(4);
    expect(data.presets?.presets.map((p) => p.id)).toEqual(['sample-east']);
    expect(data.sources?.sources.map((s) => s.id)).toEqual(['S1', 'S2']);
  });

  it('chapters and their states parse', () => {
    for (const raw of loadChapters('sample-time')) {
      const chapter = chapterSchema.parse(raw);
      expect(timeChapterState.safeParse(chapter.state).success).toBe(true);
    }
  });

  it('rejects unknown entities and out-of-order keyframes', () => {
    const data = loadData('sample-time') as { movements: { holder: string }[]; control: { keyframes: unknown[] } };
    const broken = structuredClone(data);
    broken.movements[0]!.holder = 'nobody';
    broken.control.keyframes.reverse();
    const result = timeSceneGeoData.safeParse(broken);
    expect(result.success).toBe(false);
    const messages = result.success ? [] : result.error.issues.map((i) => i.message);
    expect(messages).toContain('unknown entity "nobody"');
    expect(messages).toContain('keyframes must be in strictly ascending time order');
  });
});

describe('control.json shapes', () => {
  it('accepts the plain GeoJSON shape (sample-time) and the TopoJSON shape (ww2, written by the pipeline)', () => {
    const plain = controlFile.parse(loadData('sample-time').control);
    expect('topology' in plain).toBe(false);
    const topo = controlFile.parse(loadData('ww2').control);
    expect('topology' in topo).toBe(true);
    expect(topo.keyframes.length).toBeGreaterThanOrEqual(2);
    for (const kf of topo.keyframes) expect(kf).toHaveProperty('object');
  });
});

describe('TimeScene schema extensions', () => {
  type RawEvent = Record<string, unknown>;
  const base = () => structuredClone(loadData('sample-time')) as { events: RawEvent[]; entities: Record<string, unknown>[]; sources?: unknown; presets?: unknown };
  const political = (patch: RawEvent): RawEvent => ({
    id: 'extra-event',
    t: '2000-05-01',
    at: [-150, 9],
    importance: 2,
    title: { en: 'Extra', zh: '额外' },
    summary: { en: 'Extra event.', zh: '额外事件。' },
    ...patch,
  });
  const messages = (r: { success: boolean; error?: { issues: { message: string }[] } }) =>
    r.success ? [] : (r.error?.issues ?? []).map((i) => i.message);

  it('accepts movements with no or zero strength', () => {
    const data = structuredClone(loadData('sample-time')) as { movements: Record<string, unknown>[] };
    delete data.movements[0]!.strength;
    data.movements[1]!.strength = 0;
    expect(timeSceneGeoData.safeParse(data).success).toBe(true);
    data.movements[1]!.strength = -1;
    expect(timeSceneGeoData.safeParse(data).success).toBe(false);
  });

  it('accepts the new kinds without sides or result', () => {
    for (const kind of ['massacre', 'siege', 'evacuation', 'liberation', 'atrocity', 'disaster', 'site']) {
      expect(EVENT_KINDS).toContain(kind);
      const data = base();
      data.events.push(political({ kind }));
      expect(timeSceneGeoData.safeParse(data).success, kind).toBe(true);
    }
    const data = base();
    data.events.push(political({ kind: 'skirmish' }));
    expect(timeSceneGeoData.safeParse(data).success).toBe(false);
  });

  it('accepts detail and sources, and checks source refs against sources.json', () => {
    const ok = base();
    ok.events.push(political({ kind: 'massacre', detail: { en: 'Longer.', zh: '更长。' }, sources: ['S2'] }));
    expect(timeSceneGeoData.safeParse(ok).success).toBe(true);

    const missing = base();
    missing.events.push(political({ kind: 'massacre', sources: ['S9'] }));
    expect(messages(timeSceneGeoData.safeParse(missing))).toContain('unknown source "S9" (not in data/sources.json)');

    const noFile = base();
    delete noFile.sources;
    noFile.events[0]!.sources = ['S1'];
    expect(messages(timeSceneGeoData.safeParse(noFile))).toContain('source "S1" needs data/sources.json');

    const badId = base();
    badId.events.push(political({ kind: 'political', sources: ['s1'] }));
    expect(timeSceneGeoData.safeParse(badId).success).toBe(false);
  });

  it('accepts a bloc string or ordered bloc spans', () => {
    const entity = { id: 'italy', name: { en: 'Italy', zh: '意大利' }, joined: '1940-06-10' };
    expect(entitySchema.safeParse({ ...entity, bloc: 'axis' }).success).toBe(true);
    expect(
      entitySchema.safeParse({
        ...entity,
        bloc: [
          { bloc: 'axis', from: '1940-06-10', to: '1943-10-13' },
          { bloc: 'allied', from: '1943-10-13' },
        ],
      }).success,
    ).toBe(true);
    // Overlapping, open-ended in the middle, empty, unknown bloc.
    for (const bloc of [
      [
        { bloc: 'axis', from: '1940', to: '1944' },
        { bloc: 'allied', from: '1943' },
      ],
      [{ bloc: 'axis', from: '1940' }, { bloc: 'allied', from: '1943' }],
      [],
      [{ bloc: 'comintern', from: '1940' }],
      [{ bloc: 'axis', from: '1943', to: '1940' }],
    ]) {
      expect(entitySchema.safeParse({ ...entity, bloc }).success, JSON.stringify(bloc)).toBe(false);
    }
  });

  it('validates presets.json: kebab ids, unique, not a built-in', () => {
    const preset = { id: 'singapore-island', label: { en: 'Singapore', zh: '新加坡' }, camera: { center: [103.8, 1.35], zoom: 9 } };
    expect(presetsFile.safeParse({ presets: [preset] }).success).toBe(true);
    expect(presetsFile.safeParse({ presets: [preset, preset] }).success).toBe(false);
    expect(presetsFile.safeParse({ presets: [{ ...preset, id: 'world' }] }).success).toBe(false);
    expect(presetsFile.safeParse({ presets: [{ ...preset, id: 'Singapore' }] }).success).toBe(false);
    expect(presetsFile.safeParse({ presets: [{ ...preset, camera: { center: [103.8, 1.35] } }] }).success).toBe(false);
  });

  it('validates sources.json: S-ids, unique, http(s) urls', () => {
    const s1 = { id: 'S1', text: { en: 'A judgment.', zh: '判决书。' }, url: 'https://example.org/a' };
    expect(sourcesFile.safeParse({ sources: [s1, { ...s1, id: 'S12', url: undefined, note: { en: 'Range.' } }] }).success).toBe(true);
    expect(sourcesFile.safeParse({ sources: [s1, s1] }).success).toBe(false);
    expect(sourcesFile.safeParse({ sources: [{ ...s1, id: 'S0' }] }).success).toBe(false);
    expect(sourcesFile.safeParse({ sources: [{ ...s1, id: 'src-1' }] }).success).toBe(false);
    expect(sourcesFile.safeParse({ sources: [{ ...s1, url: 'ftp://example.org/a' }] }).success).toBe(false);
  });

  it('accepts `summary` and the `sites` layer in chapter state', () => {
    expect(timeChapterState.safeParse({ summary: { en: 'One line.', zh: '一句话。' }, layers: ['base', 'sites'] }).success).toBe(true);
    expect(timeChapterState.safeParse({ layers: ['monuments'] }).success).toBe(false);
  });

  it('accepts presentation beats (caption required, audio a site path) and lists their highlight refs', () => {
    const caption = { en: 'Step.', zh: '一步。' };
    const ok = timeChapterState.safeParse({
      beats: [
        { t: '1942-02-09', camera: { center: [103.7, 1.4], zoom: 9.6 }, highlight: ['johor-crossing'], caption },
        { caption, layers: ['base', 'control'], audio: '/audio/ww2/ch07-2.mp3' },
      ],
    });
    expect(ok.success).toBe(true);
    expect(timeChapterRefs(ok.data!)).toEqual(['johor-crossing']);
    expect(timeChapterState.safeParse({ beats: [] }).success).toBe(false);
    expect(timeChapterState.safeParse({ beats: [{ t: '1942' }] }).success).toBe(false);
    expect(timeChapterState.safeParse({ beats: [{ caption, audio: 'https://example.org/a.mp3' }] }).success).toBe(false);
    expect(timeChapterState.safeParse({ beats: [{ caption, speed: 2 }] }).success).toBe(false);
  });

  it('ww2 chapters are in time order and chapters 07 and 11 carry four beats each', () => {
    const states = readdirSync(join(TOPICS, 'ww2/chapters'))
      .filter((f) => f.endsWith('.mdx'))
      .sort()
      .map((f) => parseYaml(readFileSync(join(TOPICS, 'ww2/chapters', f), 'utf8').split('---')[1]!) as { id: string; state: { time: string; beats?: unknown[] } });
    const times = states.map((c) => c.state.time);
    expect([...times].sort()).toEqual(times);
    expect(states.find((c) => c.id === 'syonan')!.state.time).toBe('1942-02-18');
    expect(states.find((c) => c.id === 'fall-of-singapore')!.state.beats).toHaveLength(4);
    expect(states.find((c) => c.id === 'end-and-home')!.state.beats).toHaveLength(4);
  });
});

describe('sample-space topic', () => {
  it('topic.yaml parses', () => {
    const topic = topicSchema.parse(parseYaml(readFileSync(join(TOPICS, 'sample-space/topic.yaml'), 'utf8')));
    expect(topic.engine).toBe('space-scene');
  });

  it('engine data parses', () => {
    const data = spaceSceneData.parse(loadData('sample-space'));
    expect(data.parts.parts).toHaveLength(13);
    expect(data.parts.groups).toHaveLength(3);
    expect(data.parts.flows).toHaveLength(2);
    expect(data.parts.animations).toHaveLength(3);
  });

  it('chapters and their states parse', () => {
    for (const raw of loadChapters('sample-space')) {
      const chapter = chapterSchema.parse(raw);
      expect(spaceChapterState.safeParse(chapter.state).success).toBe(true);
    }
  });

  it('rejects a primitive with the wrong number of sizes and dangling refs', () => {
    const data = structuredClone(loadData('sample-space')) as {
      parts: { parts: { primitive: { size: number[] }; connects: string[] }[] };
    };
    data.parts.parts[0]!.primitive.size = [1];
    data.parts.parts[0]!.connects = ['ghost'];
    const result = spaceSceneData.safeParse(data);
    expect(result.success).toBe(false);
  });
});

describe('topic schema', () => {
  it('rejects a stage the engine does not have', () => {
    const raw = parseYaml(readFileSync(join(TOPICS, 'sample-time/topic.yaml'), 'utf8')) as Record<string, unknown>;
    expect(topicSchema.safeParse({ ...raw, stage: 'model3d' }).success).toBe(false);
  });

  it('treats `levels` as optional planning metadata', () => {
    const { levels: _levels, ...raw } = parseYaml(readFileSync(join(TOPICS, 'sample-time/topic.yaml'), 'utf8')) as Record<string, unknown>;
    expect(topicSchema.safeParse(raw).success).toBe(true);
  });
});

describe('chapter schema', () => {
  it('treats `level` as optional planning metadata', () => {
    const result = chapterSchema.safeParse({ id: 'one', order: 1, title: { en: 'One', zh: '一' } });
    expect(result.success).toBe(true);
  });
});

describe('subject taxonomy', () => {
  const base = parseYaml(readFileSync(join(TOPICS, 'sample-space/topic.yaml'), 'utf8')) as Record<string, unknown>;

  it('has exactly the six fixed categories in order', () => {
    expect(SUBJECTS).toEqual(['science', 'math', 'history', 'geography', 'biology', 'computer']);
  });

  it('rejects removed categories', () => {
    for (const subject of ['social-studies', 'extension']) {
      expect(topicSchema.safeParse({ ...base, subject }).success).toBe(false);
    }
  });

  it('accepts kebab-case tags only', () => {
    expect(topicSchema.safeParse({ ...base, tags: ['beyond-syllabus', 'singapore'] }).success).toBe(true);
    expect(topicSchema.safeParse({ ...base, tags: ['Beyond Syllabus'] }).success).toBe(false);
  });

  it('accepts optional per-topic bloc labels, bilingual and from the known keys only', () => {
    const labels = { axis: { en: 'Central Powers', zh: '同盟国' }, allied: { en: 'Allies (Entente)', zh: '协约国' } };
    expect(topicSchema.safeParse({ ...base, blocLabels: labels }).success).toBe(true);
    expect(topicSchema.safeParse({ ...base, blocLabels: { ...labels, out: { en: 'Out of the war', zh: '已退出战争' } } }).success).toBe(true);
    expect(topicSchema.safeParse({ ...base, blocLabels: { axis: 'Central Powers' } }).success).toBe(false);
    expect(topicSchema.safeParse({ ...base, blocLabels: { rebels: { en: 'Rebels', zh: '叛军' } } }).success).toBe(false);
    expect(topicSchema.safeParse({ ...base, blocLabels: { axis: { zh: '同盟国' } } }).success).toBe(false);
  });
});
