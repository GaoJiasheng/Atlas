import { describe, expect, it } from 'vitest';
import { pickVoice, speakableText } from '../../src/engines/time-scene/lib/speech';

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
