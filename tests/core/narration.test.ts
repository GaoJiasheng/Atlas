import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { clipHash, clipPath, fnv1a64, indexPath, NARRATION_VOICES, parseIndex, type NarrationIndex } from '../../src/lib/narration-clips';
import { CLIP_WAIT_MS, createNarrator, type AudioLike, type ClipStore, type NarratorDeps } from '../../src/lib/narration';
import { PART_GAP_MS, spokenNotation, type Narration, type SpeechPart } from '../../src/lib/speech';
import type { VoiceLogEntry } from '../../src/engines/core/controls';
import { chapterAnnouncement, narrationParts } from '../../src/engines/core/presentation/narration';
import { buildManifest, loadTopic, SHARED_DIR, TOPICS_DIR, type LoadedTopic } from '../../scripts/audio/lib';
import { coverage, indexes } from '../../scripts/audio/coverage';

describe('clip names', () => {
  it('FNV-1a 64 matches the published test vectors', () => {
    expect(fnv1a64('')).toBe('cbf29ce484222325');
    expect(fnv1a64('a')).toBe('af63dc4c8601ec8c');
    expect(fnv1a64('foobar')).toBe('85944171f73967e8');
  });
  it('a clip name follows the text and the locale voice, and is stable', () => {
    expect(clipHash('en', 'Chapter one')).toBe(clipHash('en', 'Chapter one'));
    expect(clipHash('en', 'Chapter one')).not.toBe(clipHash('en', 'Chapter two'));
    expect(clipHash('en', '第一章')).not.toBe(clipHash('zh', '第一章'));
    expect(clipPath('zh', 'abcdef0123456789')).toBe('narration/zh/abcdef0123456789.mp3');
    expect(indexPath('ww2')).toBe('narration/ww2.json');
    expect(NARRATION_VOICES.en).toMatchObject({ voice: 'en-GB-SoniaNeural', rate: '-10%' });
    expect(NARRATION_VOICES.zh).toMatchObject({ voice: 'zh-CN-XiaoxiaoNeural', rate: '-8%' });
  });
  it('an index parses only when well formed', () => {
    expect(parseIndex({ version: 1, en: ['0123456789abcdef'], zh: [] })).toEqual({ version: 1, en: ['0123456789abcdef'], zh: [] });
    expect(parseIndex({ version: 2, en: [], zh: [] })).toBeNull();
    expect(parseIndex({ version: 1, en: ['../x'], zh: [] })).toBeNull();
    expect(parseIndex(null)).toBeNull();
  });
});

describe('narrationParts', () => {
  const chapters = [
    { id: 'bg', kind: 'background' as const, title: { en: 'Before you start', zh: '开始之前' } },
    { id: 'one', title: { en: 'One <b>whole</b>', zh: '一个整体' } },
  ];
  it('announces a chapter by number (or Background), then its title, then the caption', () => {
    expect(narrationParts(chapterAnnouncement(chapters, 1, 'en'), 'Hello <sup>2</sup>world', true, 'en')).toEqual([
      { part: 'chapter', text: 'Chapter one' },
      { part: 'title', text: 'One whole' },
      { part: 'caption', text: 'Hello world' },
    ]);
    expect(chapterAnnouncement(chapters, 0, 'zh')).toEqual({ opening: '背景', title: '开始之前' });
    expect(chapterAnnouncement(chapters, 1, 'zh').opening).toBe('第一章');
  });
  it('later beats say the caption only; an empty caption says nothing', () => {
    expect(narrationParts(chapterAnnouncement(chapters, 1, 'en'), 'Next.', false, 'en')).toEqual([{ part: 'caption', text: 'Next.' }]);
    expect(narrationParts(chapterAnnouncement(chapters, 1, 'en'), ' <b></b> ', true, 'en')).toEqual([]);
  });
});

describe('caption extractor', () => {
  const load = (slug: string) => loadTopic(join(TOPICS_DIR, slug), SHARED_DIR);
  const topics = (): LoadedTopic[] => [load('sample-time'), load('fractions')];

  it('is deterministic: the same content gives the same keys, hashes and files', () => {
    const a = buildManifest(topics());
    const b = buildManifest(topics());
    expect(JSON.stringify(a)).toBe(JSON.stringify(b));
    expect(a.entries.length).toBeGreaterThan(10);
    expect(new Set(a.entries.map((e) => e.key)).size).toBe(a.entries.length);
    // Each chapter is announced once per locale (number + title), every beat has its caption.
    const time = a.entries.filter((e) => e.topic === 'sample-time' && e.locale === 'en');
    expect(time.map((e) => e.key)).toEqual([
      'sample-time/en/chapter/first-look',
      'sample-time/en/title/first-look',
      'sample-time/en/caption/first-look/0',
      'sample-time/en/chapter/second-look',
      'sample-time/en/title/second-look',
      'sample-time/en/caption/second-look/0',
      'sample-time/en/chapter/third-look',
      'sample-time/en/title/third-look',
      'sample-time/en/caption/third-look/0',
    ]);
    // The same words are one clip, wherever they are said.
    const files = a.clips.map((c) => c.file);
    expect(new Set(files).size).toBe(files.length);
    for (const c of a.clips) expect(c.hash).toBe(clipHash(c.locale, c.text));
  });

  it('a lesson speaks its notation as words (the MathScene adapter), and its check beat', () => {
    const m = buildManifest([load('fractions')]);
    const text = (key: string) => m.clips.find((c) => c.hash === m.entries.find((e) => e.key === key)?.hash)?.text;
    expect(text('fractions/en/chapter/before-you-start')).toBe('Background');
    expect(text('fractions/zh/chapter/equal-parts')).toBe('第一章');
    for (const c of m.clips) expect(c.text).not.toMatch(/[{}]|<\/?[a-z]/);
  });

  it('editing one caption renames only that clip', () => {
    const before = buildManifest(topics());
    const edited = topics();
    // Chapter two's default beat speaks its question.
    const state = edited[0]!.chapters[1]!.state as { question: { en: string; zh: string } };
    state.question = { ...state.question, en: `${state.question.en} Edited.` };
    const after = buildManifest(edited);
    const changed = after.entries.filter((e, i) => e.hash !== before.entries[i]!.hash).map((e) => e.key);
    expect(changed).toEqual(['sample-time/en/caption/second-look/0']);
  });

  it('coverage and indexes count only files the manifest names', () => {
    const m = buildManifest([load('sample-time')]);
    const first = m.entries.filter((e) => e.chapter === 'first-look' && e.locale === 'en');
    const files = new Set([...first.map((e) => clipPath('en', e.hash)), 'narration/en/ffffffffffffffff.mp3']);
    const c = coverage(m, files);
    expect(c.locales.en.present).toBe(3);
    expect(c.locales.zh.present).toBe(0);
    expect(c.stale).toEqual(['narration/en/ffffffffffffffff.mp3']);
    const index = indexes(m, files).get('sample-time')!;
    expect(index.en.sort()).toEqual(first.map((e) => e.hash).sort());
    expect(index.zh).toEqual([]);
  });
});

/* ------------------------------------------------------------------ */
/* The narrator against a fake <audio>, fetch and speech               */
/* ------------------------------------------------------------------ */

type Listener = () => void;
class FakeAudio implements AudioLike {
  static durations = new Map<string, number>();
  static refuse = false;
  src = '';
  preload = '';
  duration = NaN;
  paused = true;
  played: string[] = [];
  private listeners = new Map<string, Set<Listener>>();
  private timer: ReturnType<typeof setTimeout> | undefined;
  addEventListener(type: string, l: Listener) {
    (this.listeners.get(type) ?? this.listeners.set(type, new Set()).get(type)!).add(l);
  }
  removeEventListener(type: string, l: Listener) {
    this.listeners.get(type)?.delete(l);
  }
  emit(type: string) {
    for (const l of [...(this.listeners.get(type) ?? [])]) l();
  }
  play() {
    if (FakeAudio.refuse) return Promise.reject(Object.assign(new Error('no gesture'), { name: 'NotAllowedError' }));
    const ms = FakeAudio.durations.get(this.src) ?? 1000;
    this.played.push(this.src);
    this.paused = false;
    this.duration = ms / 1000;
    clearTimeout(this.timer);
    setTimeout(() => this.emit('playing'), 0);
    this.timer = setTimeout(() => {
      this.paused = true;
      this.emit('ended');
    }, ms);
    return Promise.resolve();
  }
  pause() {
    this.paused = true;
    clearTimeout(this.timer);
  }
}

const parts = (...texts: [SpeechPart, string][]) => texts.map(([part, text]) => ({ part, text }));
const PARTS = parts(['chapter', 'Chapter one'], ['title', 'Equal parts'], ['caption', 'A whole cut into equal parts.']);
const indexOf = (texts: string[]): NarrationIndex => ({ version: 1, en: texts.map((t) => clipHash('en', t)), zh: [] });

function setup(options: { index?: NarrationIndex | null; missing?: string[]; slowMs?: number; store?: ClipStore | null; offline?: boolean } = {}) {
  const audio = new FakeAudio();
  const log: VoiceLogEntry[] = [];
  const fetched: string[] = [];
  const spoken: { parts: string[]; cancel: ReturnType<typeof vi.fn>; end: () => void }[] = [];
  const blobs = new Map<string, Blob>();
  let n = 0;
  const index = options.index === undefined ? indexOf(PARTS.map((p) => p.text)) : options.index;
  const deps: NarratorDeps = {
    url: (path) => `/${path}`,
    fetch: (url, init) => {
      fetched.push(url);
      if (options.offline) return Promise.reject(new TypeError('offline'));
      const respond = () => {
        if (url.endsWith('.json')) return index ? { ok: true, json: () => Promise.resolve(index), blob: () => Promise.reject(new Error()) } : { ok: false, json: () => Promise.reject(new Error()), blob: () => Promise.reject(new Error()) };
        const missing = (options.missing ?? []).some((t) => url.includes(clipHash('en', t)));
        return { ok: !missing, json: () => Promise.reject(new Error()), blob: () => Promise.resolve(new Blob([url], { type: 'audio/mpeg' })) };
      };
      return new Promise((resolve, reject) => {
        const timer = setTimeout(() => resolve(respond() as never), options.slowMs ?? 5);
        init.signal.addEventListener('abort', () => {
          clearTimeout(timer);
          reject(new DOMException('aborted', 'AbortError'));
        });
      });
    },
    store: options.store ?? null,
    createAudio: () => audio,
    createObjectURL: (blob) => {
      const url = `blob:${++n}`;
      blobs.set(url, blob);
      return url;
    },
    revokeObjectURL: () => {},
    speak: (ps, _lang, _voice, onEnd) => {
      const cancel = vi.fn();
      spoken.push({ parts: ps.map((p) => p.text), cancel, end: onEnd });
      return { cancel } satisfies Narration;
    },
    log: (e) => log.push(e),
    now: () => Date.now(),
  };
  return { narrator: createNarrator(deps), audio, log, fetched, spoken, blobs };
}
const voice = { name: 'Daniel', lang: 'en-GB' } as SpeechSynthesisVoice;
/** Load the topic's index under fake timers (the fake network answers after `ms`). */
async function loaded(t: ReturnType<typeof setup>, ms = 5) {
  const pending = t.narrator.loadIndex('fractions');
  await vi.advanceTimersByTimeAsync(ms + 1);
  await pending;
}
const options = (over: Partial<Parameters<ReturnType<typeof createNarrator>['narrate']>[1]> = {}) => ({
  topic: 'fractions',
  locale: 'en' as const,
  lang: 'en-GB',
  voice,
  silentMs: 6000,
  onEnd: vi.fn(),
  onPart: vi.fn(),
  ...over,
});

describe('narrate: clip or speech', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    FakeAudio.refuse = false;
  });
  afterEach(() => vi.useRealTimers());

  it('plays every part as a clip, ~350 ms apart, and ends once', async () => {
    const t = setup();
    await loaded(t);
    const o = options();
    t.narrator.narrate(PARTS, o);
    await vi.advanceTimersByTimeAsync(20);
    expect(t.log.map((e) => [e.part, e.source, e.voice])).toEqual([['chapter', 'clip', 'en-GB-SoniaNeural']]);
    await vi.advanceTimersByTimeAsync(1000);
    expect(t.log[0]!.reason).toBe('end');
    expect(t.log).toHaveLength(1); // the gap
    await vi.advanceTimersByTimeAsync(PART_GAP_MS);
    expect(t.log).toHaveLength(2);
    await vi.advanceTimersByTimeAsync(3000);
    expect(t.log.map((e) => [e.part, e.reason])).toEqual([['chapter', 'end'], ['title', 'end'], ['caption', 'end']]);
    expect(t.log[1]!.started! - t.log[0]!.ended!).toBeGreaterThanOrEqual(PART_GAP_MS);
    expect(o.onEnd).toHaveBeenCalledTimes(1);
    expect(vi.mocked(o.onPart!).mock.calls).toEqual([['chapter', 1000], ['title', 1000], ['caption', 1000]]);
    expect(t.spoken).toEqual([]);
    // Plain same-origin GETs: the index once, one file per clip.
    expect(t.fetched).toEqual(['/narration/fractions.json', ...PARTS.map((p) => `/${clipPath('en', clipHash('en', p.text))}`)]);
  });

  it('a part without a clip: the whole beat is spoken, at once, as before (no mixed voices)', async () => {
    const t = setup({ index: indexOf(['Chapter one', 'Equal parts']) });
    await loaded(t);
    const o = options();
    t.narrator.narrate(PARTS, o);
    expect(t.spoken.map((s) => s.parts)).toEqual([PARTS.map((p) => p.text)]);
    expect(t.audio.played).toEqual([]);
    t.spoken[0]!.end();
    expect(o.onEnd).toHaveBeenCalledTimes(1);
  });

  it('no index on the site (404): spoken', async () => {
    const t = setup({ index: null });
    t.narrator.narrate(PARTS, options());
    await vi.advanceTimersByTimeAsync(50);
    expect(t.spoken).toHaveLength(1);
    expect(t.narrator.hasAny('fractions', 'en')).toBe(false);
  });

  it('waits for an index still loading, then plays', async () => {
    const t = setup();
    t.narrator.narrate(PARTS, options());
    expect(t.narrator.hasClip('fractions', 'en', 'Chapter one')).toBeUndefined();
    await vi.advanceTimersByTimeAsync(30);
    expect(t.audio.played).toHaveLength(1);
    expect(t.spoken).toEqual([]);
  });

  it('a slow network falls back to speech after CLIP_WAIT_MS, and keeps the late clips for next time', async () => {
    const t = setup({ slowMs: 3000 });
    await loaded(t, 3000);
    t.narrator.narrate(PARTS, options());
    await vi.advanceTimersByTimeAsync(CLIP_WAIT_MS - 10);
    expect(t.spoken).toEqual([]);
    await vi.advanceTimersByTimeAsync(20);
    expect(t.spoken).toHaveLength(1);
    expect(t.audio.played).toEqual([]);
    // The fetches finished after the wait: the same beat now plays from memory, without fetching again.
    await vi.advanceTimersByTimeAsync(1000);
    const fetchedBefore = t.fetched.length;
    t.narrator.narrate(PARTS, options());
    await vi.advanceTimersByTimeAsync(5);
    expect(t.audio.played).toHaveLength(1);
    expect(t.fetched.length).toBe(fetchedBefore);
  });

  it('a clip that fails to download: spoken', async () => {
    const t = setup({ missing: ['Equal parts'] });
    await loaded(t);
    t.narrator.narrate(PARTS, options());
    await vi.advanceTimersByTimeAsync(50);
    expect(t.spoken.map((s) => s.parts)).toEqual([PARTS.map((p) => p.text)]);
  });

  it('playback refused (no gesture yet): this part and the rest are spoken', async () => {
    const t = setup();
    await loaded(t);
    FakeAudio.refuse = true;
    t.narrator.narrate(PARTS, options());
    await vi.advanceTimersByTimeAsync(50);
    expect(t.log[0]).toMatchObject({ part: 'chapter', source: 'clip', reason: 'error:NotAllowedError' });
    expect(t.spoken.map((s) => s.parts)).toEqual([PARTS.map((p) => p.text)]);
  });

  it('a media error mid-way: the rest is spoken', async () => {
    const t = setup();
    await loaded(t);
    t.narrator.narrate(PARTS, options());
    await vi.advanceTimersByTimeAsync(1000 + PART_GAP_MS + 100);
    t.audio.emit('error');
    expect(t.log.map((e) => [e.part, e.reason])).toEqual([['chapter', 'end'], ['title', 'error:media']]);
    expect(t.spoken.map((s) => s.parts)).toEqual([['Equal parts', 'A whole cut into equal parts.']]);
  });

  it('cancel stops the clip, drops the rest and never ends; a new narration cancels the old one', async () => {
    const t = setup();
    await loaded(t);
    const o = options();
    const n = t.narrator.narrate(PARTS, o);
    await vi.advanceTimersByTimeAsync(500);
    n.cancel();
    expect(t.audio.paused).toBe(true);
    await vi.advanceTimersByTimeAsync(5000);
    expect(t.log.map((e) => [e.part, e.reason])).toEqual([['chapter', 'cancelled']]);
    expect(o.onEnd).not.toHaveBeenCalled();

    const first = options();
    t.narrator.narrate(PARTS, first);
    await vi.advanceTimersByTimeAsync(1000 + PART_GAP_MS + 100);
    const second = options();
    t.narrator.narrate(parts(['caption', 'A whole cut into equal parts.']), second);
    await vi.advanceTimersByTimeAsync(5000);
    expect(first.onEnd).not.toHaveBeenCalled();
    expect(second.onEnd).toHaveBeenCalledTimes(1);
    expect(t.log.slice(1).map((e) => [e.part, e.reason])).toEqual([['chapter', 'end'], ['title', 'cancelled'], ['caption', 'end']]);
  });

  it('cancelled while the clips load: nothing plays or speaks', async () => {
    const t = setup();
    const n = t.narrator.narrate(PARTS, options());
    n.cancel();
    await vi.advanceTimersByTimeAsync(5000);
    expect(t.audio.played).toEqual([]);
    expect(t.spoken).toEqual([]);
  });

  it('without clips or a device voice the beat is silent for silentMs, then ends', async () => {
    const t = setup({ index: null });
    const o = options({ voice: null, silentMs: 4000 });
    t.narrator.narrate(PARTS, o);
    await vi.advanceTimersByTimeAsync(3900);
    expect(o.onEnd).not.toHaveBeenCalled();
    await vi.advanceTimersByTimeAsync(200);
    expect(o.onEnd).toHaveBeenCalledTimes(1);
  });

  it('preload fetches only the given parts that have clips', async () => {
    const t = setup({ index: indexOf(['Chapter two']) });
    await loaded(t);
    t.fetched.length = 0;
    t.narrator.preload('fractions', 'en', parts(['chapter', 'Chapter two'], ['caption', 'Not recorded.']));
    await vi.advanceTimersByTimeAsync(20);
    expect(t.fetched).toEqual([`/${clipPath('en', clipHash('en', 'Chapter two'))}`]);
  });

  it('the app keeps what it fetched: offline, the stored index and clips still play', async () => {
    const clips = new Map<string, Blob>();
    let stored: unknown = null;
    const store: ClipStore = {
      getClip: (k) => Promise.resolve(clips.get(k) ?? null),
      putClip: (k, b) => Promise.resolve(void clips.set(k, b)),
      getIndex: () => Promise.resolve(stored),
      putIndex: (_t, i) => Promise.resolve(void (stored = i)),
    };
    const online = setup({ store });
    await loaded(online);
    online.narrator.narrate(PARTS, options());
    await vi.advanceTimersByTimeAsync(5000);
    expect(clips.size).toBe(3);

    const offline = setup({ store, offline: true });
    offline.narrator.narrate(PARTS, options());
    await vi.advanceTimersByTimeAsync(5000);
    expect(offline.spoken).toEqual([]);
    expect(offline.log.map((e) => [e.source, e.reason])).toEqual([['clip', 'end'], ['clip', 'end'], ['clip', 'end']]);
    expect(offline.fetched).toEqual(['/narration/fractions.json']);
  });
});

describe('spokenNotation', () => {
  it('says the notation a neural voice skips or misreads', () => {
    expect(spokenNotation('draw ∠XYZ = 125°.', 'en')).toBe('draw angle XYZ = 125°.');
    expect(spokenNotation('转动一条线，∠a 和 ∠c 一起变。', 'zh')).toBe('转动一条线，角 a 和 角 c 一起变。');
    expect(spokenNotation('Find ∠a. ∠b and ∠PQR, like ∠ab.', 'en')).toBe('Find angle A. angle B and angle PQR, like angle ab.');
    expect(spokenNotation('so two thirds < three quarters, and 5 > 3.', 'en')).toBe('so two thirds is less than three quarters, and 5 is greater than 3.');
    expect(spokenNotation('五分之一 > 三分之一', 'zh')).toBe('五分之一 大于 三分之一');
    expect(spokenNotation('c. 1500 BCE', 'en')).toBe('about 1500 BCE');
    expect(spokenNotation('5, 10, 15 … 40. 0, 100, 200 … up to 500.', 'en')).toBe('5, 10, 15, and so on, up to 40. 0, 100, 200, and so on, up to 500.');
    expect(spokenNotation('5、10、15……40。', 'zh')).toBe('5、10、15，一直到 40。');
  });
  it('leaves what the voices already read well', () => {
    for (const s of ['45° bench at 2 pm, in °C', '12 cm², 8 kg, 900 km/h', '1964–1965', '2 hundreds × 3 = 6', 'etc. and Mr. Lee', '一直下去…，6 一直写下去'])
      expect(spokenNotation(s, 'en')).toBe(s);
  });
  it('is applied to the caption and the chapter title', () => {
    const ch = [{ id: 'a', title: { en: 'Naming ∠ABC', zh: '∠ABC 的名字' } }];
    expect(narrationParts(chapterAnnouncement(ch, 0, 'zh'), '∠ABC 是钝角。', true, 'zh').map((p) => p.text)).toEqual(['第一章', '角 ABC 的名字', '角 ABC 是钝角。']);
  });
});
