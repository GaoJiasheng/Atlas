import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { chapterNumberText, PART_GAP_MS, pickVoice, speakSequence, spellNumber, speakableText, stopSpeech, voiceLog, type SpeechPart } from '../../src/lib/speech';

const v = (name: string, lang: string, localService = true) => ({ name, lang, localService });

describe('pickVoice', () => {
  it('English: en-GB first, then any en-*, preferred names break ties', () => {
    expect(pickVoice([v('Samantha', 'en-US'), v('Daniel', 'en-GB')], 'en')?.name).toBe('Daniel');
    expect(pickVoice([v('Fred', 'en-US'), v('Samantha', 'en-US')], 'en')?.name).toBe('Samantha');
    expect(pickVoice([v('Alex', 'en_US'), v('Tingting', 'zh-CN')], 'en')?.name).toBe('Alex');
    expect(pickVoice([v('Tingting', 'zh-CN')], 'en')).toBeNull();
  });
  it('Chinese: zh-CN / zh-SG, then other zh-*, Traditional and Cantonese only as a last resort', () => {
    expect(pickVoice([v('Meijia', 'zh-TW'), v('Tingting', 'zh-CN')], 'zh')?.name).toBe('Tingting');
    expect(pickVoice([v('Sinji', 'zh-HK'), v('Other', 'zh-Foo')], 'zh')?.name).toBe('Other');
    expect(pickVoice([v('Sinji', 'zh-HK'), v('Cantonese', 'yue-HK')], 'zh')?.name).toBe('Sinji');
    expect(pickVoice([v('Meijia', 'zh-TW')], 'zh')?.name).toBe('Meijia');
    expect(pickVoice([v('Daniel', 'en-GB')], 'zh')).toBeNull();
  });
  it('prefers a local voice over a network one of the same language, then the named voices', () => {
    expect(pickVoice([v('Google 普通话', 'zh-CN', false), v('Lili', 'zh-CN'), v('Plain', 'zh-CN')], 'zh')?.name).toBe('Lili');
    expect(pickVoice([v('Aria', 'en-GB', false), v('Zed', 'en-GB')], 'en')?.name).toBe('Zed');
    expect(pickVoice([v('Libby', 'en-GB'), v('Daniel', 'en-GB')], 'en')?.name).toBe('Daniel');
  });
  it('none when the list is empty', () => {
    expect(pickVoice([], 'en')).toBeNull();
  });
});

describe('speakableText', () => {
  it('drops markup and source superscripts, keeps numbers as written', () => {
    expect(speakableText('Fell on 15 Feb 1942<sup>3</sup>, after <b>70</b> days.')).toBe('Fell on 15 Feb 1942, after 70 days.');
    expect(speakableText('  a\n\n b  ')).toBe('a b');
    expect(speakableText('Plain 1,000 text')).toBe('Plain 1,000 text');
  });
});

describe('chapterNumberText', () => {
  it('spells the chapter number: "Chapter seven" / 第七章', () => {
    expect(chapterNumberText(7, 'en')).toBe('Chapter seven');
    expect(chapterNumberText(7, 'zh')).toBe('第七章');
    expect(chapterNumberText(1, 'zh')).toBe('第一章');
    expect(chapterNumberText(10, 'zh')).toBe('第十章');
    expect(chapterNumberText(11, 'zh')).toBe('第十一章');
    expect(chapterNumberText(11, 'en')).toBe('Chapter eleven');
  });
  it('spells larger numbers too', () => {
    expect(spellNumber(21, 'en')).toBe('twenty-one');
    expect(spellNumber(20, 'zh')).toBe('二十');
    expect(spellNumber(35, 'zh')).toBe('三十五');
    expect(spellNumber(40, 'en')).toBe('forty');
  });
});

/* ------------------------------------------------------------------ */
/* The narration queue against a fake speechSynthesis                  */
/* ------------------------------------------------------------------ */

class FakeUtterance {
  voice: unknown = null;
  lang = '';
  rate = 1;
  pitch = 1;
  volume = 1;
  onstart: (() => void) | null = null;
  onend: (() => void) | null = null;
  onerror: ((e: { error: string }) => void) | null = null;
  constructor(public text: string) {}
}

describe('speakSequence', () => {
  const spoken: FakeUtterance[] = [];
  const synth = {
    speaking: false,
    speak: (u: FakeUtterance) => {
      spoken.push(u);
      u.onstart?.();
    },
    cancel: vi.fn(),
    pause: vi.fn(),
    resume: vi.fn(),
  };
  const voice = { name: 'Daniel', lang: 'en-GB' } as SpeechSynthesisVoice;
  const parts: { part: SpeechPart; text: string }[] = [
    { part: 'chapter', text: 'Chapter two' },
    { part: 'title', text: 'Mobilisation and the Marne' },
    { part: 'caption', text: 'More than 27,000 French soldiers are killed on this one day.' },
  ];
  /** Let the next utterance launch (next frame), speak it for `ms`, then end it. */
  const finish = (ms = 3_000) => {
    vi.advanceTimersByTime(ms);
    spoken.at(-1)!.onend?.();
  };

  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout', 'setInterval', 'clearInterval', 'performance'] });
    vi.stubGlobal('window', globalThis);
    vi.stubGlobal('requestAnimationFrame', (cb: () => void) => setTimeout(cb, 16));
    vi.stubGlobal('cancelAnimationFrame', (id: ReturnType<typeof setTimeout>) => clearTimeout(id));
    vi.stubGlobal('speechSynthesis', synth);
    vi.stubGlobal('SpeechSynthesisUtterance', FakeUtterance);
    vi.stubGlobal('document', { visibilityState: 'visible', addEventListener: () => {}, removeEventListener: () => {} });
    spoken.length = 0;
  });
  afterEach(() => {
    stopSpeech();
    vi.unstubAllGlobals();
    vi.useRealTimers();
  });

  it('speaks the parts in order, PART_GAP_MS apart, and ends once after the caption', () => {
    const onEnd = vi.fn();
    const started: SpeechPart[] = [];
    speakSequence(parts, 'en-GB', voice, onEnd, (p) => started.push(p));
    vi.advanceTimersByTime(20);
    expect(spoken.map((u) => u.text)).toEqual(['Chapter two']);
    expect(spoken[0]!.lang).toBe('en-GB');
    finish();
    vi.advanceTimersByTime(PART_GAP_MS - 1);
    expect(spoken).toHaveLength(1);
    vi.advanceTimersByTime(20);
    expect(spoken).toHaveLength(2);
    finish();
    vi.advanceTimersByTime(PART_GAP_MS + 20);
    expect(onEnd).not.toHaveBeenCalled();
    finish();
    expect(onEnd).toHaveBeenCalledTimes(1);
    expect(started).toEqual(['chapter', 'title', 'caption']);
    expect(voiceLog().slice(-3).map((e) => [e.part, e.reason])).toEqual([
      ['chapter', 'end'],
      ['title', 'end'],
      ['caption', 'end'],
    ]);
  });

  it('cancel drops the parts still to come and never fires onEnd', () => {
    const onEnd = vi.fn();
    const narration = speakSequence(parts, 'en-GB', voice, onEnd);
    vi.advanceTimersByTime(20);
    finish();
    vi.advanceTimersByTime(PART_GAP_MS + 20);
    narration.cancel();
    spoken.at(-1)!.onend?.(); // a late event of the cancelled utterance
    vi.advanceTimersByTime(10_000);
    expect(spoken).toHaveLength(2);
    expect(onEnd).not.toHaveBeenCalled();
    expect(voiceLog().at(-1)).toMatchObject({ part: 'title', reason: 'cancelled' });
  });

  it('a new narration cancels the one speaking', () => {
    const first = vi.fn();
    speakSequence(parts, 'en-GB', voice, first);
    vi.advanceTimersByTime(20);
    const second = vi.fn();
    speakSequence([{ part: 'caption', text: 'Next beat.' }], 'en-GB', voice, second);
    vi.advanceTimersByTime(20);
    finish();
    expect(first).not.toHaveBeenCalled();
    expect(second).toHaveBeenCalledTimes(1);
  });

  it('ignores an implausibly early end and cancel-type errors; other errors end the narration', () => {
    const onEnd = vi.fn();
    speakSequence([{ part: 'caption', text: 'A caption long enough to need more than a moment to say.' }], 'en-GB', voice, onEnd);
    vi.advanceTimersByTime(20);
    spoken.at(-1)!.onend?.();
    expect(onEnd).not.toHaveBeenCalled();
    expect(voiceLog().at(-1)!.reason).toBe('spurious-end');

    speakSequence([{ part: 'caption', text: 'Interrupted.' }], 'en-GB', voice, onEnd);
    vi.advanceTimersByTime(20);
    spoken.at(-1)!.onerror?.({ error: 'interrupted' });
    expect(onEnd).not.toHaveBeenCalled();
    expect(voiceLog().at(-1)!.reason).toBe('error:interrupted');

    speakSequence([{ part: 'caption', text: 'Failed.' }], 'en-GB', voice, onEnd);
    vi.advanceTimersByTime(20);
    spoken.at(-1)!.onerror?.({ error: 'synthesis-failed' });
    expect(onEnd).toHaveBeenCalledTimes(1);
  });
});
