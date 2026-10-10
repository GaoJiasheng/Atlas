import { describe, expect, it } from 'vitest';
import {
  beatInfos,
  buildBeats,
  chapterSpans,
  current,
  defaultCaption,
  presentationStatus,
  startIndex,
  stepIndex,
  type BeatBase,
} from '../../src/engines/core/presentation/beats';
import { autoplayDwell, BEAT_SETTLE_MS, lostEndFallback } from '../../src/engines/core/presentation/autoplay';

const bi = (en: string) => ({ en, zh: `${en}（中）` });

interface TestBeat extends BeatBase {
  t?: string;
}

type TestChapter = { id: string; title: { en: string; zh: string }; state: { summary?: unknown; question?: unknown; beats?: TestBeat[] } };

const chapters: TestChapter[] = [
  { id: 'background', title: bi('Background'), state: { summary: bi('Before the war') } },
  { id: 'one', title: bi('One'), state: { beats: [{ caption: bi('1a'), t: '1914' }, { caption: bi('1b'), audio: '/audio/1b.mp3' }] } },
  { id: 'two', title: bi('Two'), state: { question: bi('Why?') } },
  { id: 'three', title: bi('Three'), state: {} },
];
const beatsOf = (c: TestChapter) => c.state.beats;

describe('defaultCaption', () => {
  it('summary, else question, else the chapter title', () => {
    expect(defaultCaption(chapters[0]!)).toEqual(bi('Before the war'));
    expect(defaultCaption(chapters[2]!)).toEqual(bi('Why?'));
    expect(defaultCaption(chapters[3]!)).toEqual(bi('Three'));
    expect(defaultCaption({ title: bi('X'), state: { summary: 'not bilingual' } })).toEqual(bi('X'));
  });
});

describe('buildBeats', () => {
  const beats = buildBeats(chapters, beatsOf);
  it('flattens chapters in order: own beats, or one default beat', () => {
    expect(beats.map((b) => `${b.chapter}.${b.index}/${b.count}`)).toEqual(['background.0/1', 'one.0/2', 'one.1/2', 'two.0/1', 'three.0/1']);
    expect(beats.map((b) => b.chapterIndex)).toEqual([0, 1, 1, 2, 3]);
  });
  it('keeps the engine beat as `spec` and lifts caption and audio', () => {
    expect(beats[1]!.spec).toEqual({ caption: bi('1a'), t: '1914' });
    expect(beats[2]!.audio).toBe('/audio/1b.mp3');
    expect(beats[1]!.audio).toBeUndefined();
    expect(beats[0]!.spec).toBeUndefined();
    expect(beats[3]!.caption).toEqual(bi('Why?'));
  });
  it('treats an empty list like none', () => {
    const b = buildBeats([{ id: 'x', title: bi('X'), state: {} }], () => []);
    expect(b).toEqual([{ chapter: 'x', chapterIndex: 0, index: 0, count: 1, caption: bi('X') }]);
  });
  it('lists what __atlas.beats() reports', () => {
    expect(beatInfos(beats)[2]).toEqual({ chapter: 'one', index: 1, caption: bi('1b') });
  });
});

describe('beat indexing', () => {
  const beats = buildBeats(chapters, beatsOf);
  it('chapterSpans: first beat and count per chapter', () => {
    expect(chapterSpans(chapters.length, beats)).toEqual([
      { first: 0, count: 1 },
      { first: 1, count: 2 },
      { first: 3, count: 1 },
      { first: 4, count: 1 },
    ]);
    expect(chapterSpans(5, beats)[4]).toEqual({ first: -1, count: 0 });
  });
  it('startIndex: the requested beat (clamped), else the current chapter, else 0', () => {
    expect(startIndex(beats, 'two', null)).toBe(3);
    expect(startIndex(beats, 'nowhere', null)).toBe(0);
    expect(startIndex(beats, null, null)).toBe(0);
    expect(startIndex(beats, 'two', 1)).toBe(1);
    expect(startIndex(beats, 'two', 99)).toBe(4);
    expect(startIndex(beats, 'two', -3)).toBe(0);
  });
  it('stepIndex stops at both ends', () => {
    expect(stepIndex(0, -1, 5)).toBeNull();
    expect(stepIndex(0, 1, 5)).toBe(1);
    expect(stepIndex(4, 1, 5)).toBeNull();
    expect(stepIndex(4, -1, 5)).toBe(3);
  });
  it('current: chapter, position inside it and the switches; null outside', () => {
    expect(current(beats, 2, { autoplay: true, voice: false })).toEqual({ chapter: 'one', beat: 1, autoplay: true, voice: false });
    expect(current(beats, null, { autoplay: true, voice: true })).toBeNull();
  });
  it('status line', () => {
    expect(presentationStatus(null, 40)).toBe('PRESENTATION');
    expect(presentationStatus(2, 40)).toBe('PRESENTATION 03/40');
  });
});

describe('auto-play timing', () => {
  it('dwell grows with the caption, within 6–20 s', () => {
    expect(autoplayDwell(0)).toBe(6_000);
    expect(autoplayDwell(100)).toBe(10_000);
    expect(autoplayDwell(1_000)).toBe(20_000);
  });
  it('a lost `end` falls back to 3x the speaking time (12 chars/s, >= 6 s) plus 3 s per extra part', () => {
    expect(lostEndFallback(12, 1)).toBe(6_000);
    expect(lostEndFallback(120, 1)).toBe(30_000);
    expect(lostEndFallback(120, 3)).toBe(36_000);
  });
  it('a beat settles 2.3 s after it starts', () => {
    expect(BEAT_SETTLE_MS).toBe(2300);
  });
});
