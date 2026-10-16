import { describe, expect, it } from 'vitest';
import { blocLabel, blocLabelText, entityDated, entityWord } from '../../src/engines/time-scene/lib/blocLabels';
import { t } from '../../src/i18n';

const ww1 = {
  axis: { en: 'Central Powers', zh: '同盟国' },
  allied: { en: 'Allies (Entente)', zh: '协约国' },
};

describe('blocLabel', () => {
  it('falls back to the site-wide UI strings without topic labels', () => {
    for (const key of ['axis', 'allied', 'neutral', 'out'] as const) {
      expect(blocLabel(undefined, key, 'en')).toBe(t('en', `time.bloc.${key}`));
      expect(blocLabel({}, key, 'zh')).toBe(t('zh', `time.bloc.${key}`));
    }
  });

  it('prefers the topic label in each language', () => {
    expect(blocLabel(ww1, 'allied', 'en')).toBe('Allies (Entente)');
    expect(blocLabel(ww1, 'allied', 'zh')).toBe('协约国');
    expect(blocLabel(ww1, 'axis', 'zh')).toBe('同盟国');
  });

  it('falls back per key, not per topic', () => {
    expect(blocLabel(ww1, 'neutral', 'en')).toBe(t('en', 'time.bloc.neutral'));
    expect(blocLabel(ww1, 'out', 'zh')).toBe(t('zh', 'time.bloc.out'));
  });

  it('uses English when a label has no Chinese yet', () => {
    expect(blocLabel({ axis: { en: 'Central Powers', zh: '' } }, 'axis', 'zh')).toBe('Central Powers');
  });

  it('gives both languages at once', () => {
    expect(blocLabelText(ww1, 'allied')).toEqual({ en: 'Allies (Entente)', zh: '协约国' });
    expect(blocLabelText(undefined, 'out')).toEqual({ en: t('en', 'time.bloc.out'), zh: t('zh', 'time.bloc.out') });
  });
});

describe('entity wording (topic.strings)', () => {
  const states = { joined: { en: 'appears', zh: '出现' }, left: { en: 'ends', zh: '灭亡' } };

  it('falls back to the UI strings', () => {
    expect(entityWord(undefined, 'joined', 'en')).toBe(t('en', 'time.entity.joined'));
    expect(entityWord(undefined, 'left', 'zh')).toBe(t('zh', 'time.entity.left'));
    expect(entityWord(undefined, 'notYet', 'en')).toBe(t('en', 'time.bloc.notYet'));
    expect(entityDated(undefined, 'joined', '1941', 'en')).toBe(t('en', 'time.joinedOn', { date: '1941' }));
    expect(entityDated(undefined, 'left', '1945', 'en')).toBeNull();
  });

  it("uses the topic's words, date after the word in English and before it in Chinese", () => {
    expect(entityWord(states, 'joined', 'zh')).toBe('出现');
    expect(entityWord(states, 'notYet', 'en')).toBe(t('en', 'time.bloc.notYet'));
    expect(entityDated(states, 'joined', '770 BCE', 'en')).toBe('appears 770 BCE');
    expect(entityDated(states, 'left', '公元前221年', 'zh')).toBe('公元前221年灭亡');
  });
});
