import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { parse as parseYaml } from 'yaml';
import { SUBJECTS, topicSchema } from '../src/content/schema/topic';
import { chapterSchema } from '../src/content/schema/chapter';
import { bilingual, isoDate, timePoint } from '../src/content/schema/common';
import { timeChapterState, timeSceneGeoData } from '../src/engines/time-scene/schema';
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
    expect(data.events).toHaveLength(3);
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
});
