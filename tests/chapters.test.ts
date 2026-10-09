import { describe, expect, it } from 'vitest';
import { chapterNumbers, isBackground, storyChapters } from '../src/engines/core/chapters';
import { glossaryFile } from '../src/content/schema/glossary';

const chapters = [
  { id: 'before', kind: 'background' as const },
  { id: 'one' },
  { id: 'two', kind: 'chapter' as const },
];

describe('chapter kinds', () => {
  it('numbers the background chapter 0 and the story chapters from 1', () => {
    expect([...chapterNumbers(chapters)]).toEqual([
      ['before', 0],
      ['one', 1],
      ['two', 2],
    ]);
    expect([...chapterNumbers(chapters.slice(1))]).toEqual([
      ['one', 1],
      ['two', 2],
    ]);
  });

  it('keeps only story chapters on the timeline', () => {
    expect(storyChapters(chapters).map((c) => c.id)).toEqual(['one', 'two']);
    expect(isBackground(chapters[0])).toBe(true);
    expect(isBackground(chapters[1])).toBe(false);
    expect(isBackground(null)).toBe(false);
  });
});

describe('glossary schema', () => {
  const term = (id: string, see?: string[]) => ({ id, term: { en: id, zh: id }, definition: { en: `${id}.`, zh: `${id}。` }, ...(see ? { see } : {}) });

  it('accepts terms whose related terms exist', () => {
    expect(glossaryFile.safeParse({ terms: [term('axis', ['allies']), term('allies', ['axis'])] }).success).toBe(true);
  });

  it('rejects duplicate ids, unknown and self references', () => {
    const result = glossaryFile.safeParse({ terms: [term('axis', ['axis', 'nowhere']), term('axis')] });
    expect(result.success).toBe(false);
    const messages = result.error?.issues.map((i) => i.message) ?? [];
    expect(messages).toContain('duplicate term id "axis"');
    expect(messages).toContain('term "axis" refers to itself');
    expect(messages).toContain('unknown term "nowhere"');
  });
});
