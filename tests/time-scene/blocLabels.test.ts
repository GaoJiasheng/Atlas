import { describe, expect, it } from 'vitest';
import { blocLabel, blocLabelText } from '../../src/engines/time-scene/lib/blocLabels';
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
