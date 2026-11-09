import { describe, expect, it } from 'vitest';
import en from '../src/i18n/ui.en.json';
import zh from '../src/i18n/ui.zh.json';
import { localeFromPath, normalizeBase, switchLocalePath, t, tx } from '../src/i18n';
import { uiGroup, uiWords, type UiGroup } from '../src/i18n/ui-groups';
import { UI_LOAD_ERROR } from '../src/i18n/ui-error';

describe('tx()', () => {
  it('picks the requested locale', () => {
    expect(tx({ en: 'Hello', zh: '你好' }, 'zh')).toBe('你好');
    expect(tx({ en: 'Hello', zh: '你好' }, 'en')).toBe('Hello');
  });

  it('falls back to English when zh is missing or blank', () => {
    expect(tx({ en: 'Hello' }, 'zh')).toBe('Hello');
    expect(tx({ en: 'Hello', zh: '' }, 'zh')).toBe('Hello');
    expect(tx({ en: 'Hello', zh: '   ' }, 'zh')).toBe('Hello');
  });

  it('passes strings through and tolerates null', () => {
    expect(tx('plain', 'zh')).toBe('plain');
    expect(tx(undefined, 'en')).toBe('');
  });
});

describe('t()', () => {
  it('interpolates variables', () => {
    expect(t('en', 'chapter.position', { n: 2, total: 10 })).toBe('Chapter 2 of 10');
    expect(t('zh', 'chapter.position', { n: 2, total: 10 })).toBe('第 2 章，共 10 章');
  });

  it('has identical keys in both dictionaries', () => {
    expect(Object.keys(zh).sort()).toEqual(Object.keys(en).sort());
  });

  it('keeps the chunk-independent failure message identical to existing UI copy', () => {
    expect(UI_LOAD_ERROR).toEqual({ en: en['scene.error'], zh: zh['scene.error'] });
  });

  it('partitions every word exactly once, preserving both locales and all placeholders', () => {
    const groups: UiGroup[] = ['common', 'space', 'time', 'math', 'index'];
    for (const dictionary of [en, zh]) {
      const chunks = groups.map(group => uiWords(dictionary, group));
      expect(Object.assign({}, ...chunks)).toEqual(dictionary);
      expect(chunks.reduce((n, chunk) => n + Object.keys(chunk).length, 0)).toBe(Object.keys(dictionary).length);
      for (const [i, group] of groups.entries()) expect(Object.keys(chunks[i]!).every(key => uiGroup(key) === group)).toBe(true);
    }
  });
});

describe('locale paths', () => {
  it('swaps the locale segment and keeps the rest', () => {
    expect(switchLocalePath('/en/topics/ww2/', 'zh', '/')).toBe('/zh/topics/ww2/');
    expect(switchLocalePath('/atlas/zh/topics/ww2/', 'en', '/atlas')).toBe('/atlas/en/topics/ww2/');
    expect(switchLocalePath('/en/', 'zh', '')).toBe('/zh/');
    expect(switchLocalePath('/', 'zh', '/')).toBe('/zh/');
  });

  it('reads the locale from a path', () => {
    expect(localeFromPath('/atlas/zh/topics/x/', '/atlas/')).toBe('zh');
    expect(localeFromPath('/fr/', '/')).toBeNull();
    expect(normalizeBase('atlas/')).toBe('/atlas');
  });
});
