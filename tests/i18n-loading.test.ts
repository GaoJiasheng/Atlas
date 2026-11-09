import { afterEach, describe, expect, it, vi } from 'vitest';
import en from '../src/i18n/ui.en.json';
import zh from '../src/i18n/ui.zh.json';

afterEach(() => { vi.unstubAllEnvs(); vi.resetModules(); });

describe('browser translations', () => {
  it.each(['space-scene', 'time-scene', 'math-scene', 'simulation'])('prepares %s bilingual render, effect and event words before mounting', async engine => {
    vi.stubEnv('SSR', false);
    const { loadSceneUi, readSceneUi, t } = await import('../src/i18n');
    let suspended: unknown;
    try { readSceneUi(engine); } catch (pending) { suspended = pending; }
    expect(suspended).toBeInstanceOf(Promise);
    expect(loadSceneUi(engine)).toBe(suspended);
    await suspended;
    expect(() => readSceneUi(engine)).not.toThrow();
    const group = engine.split('-')[0];
    // Call from a later microtask, as effects/store subscriptions and handlers do.
    await Promise.resolve().then(() => {
      for (const [locale, words] of [['en', en], ['zh', zh]] as const) {
        for (const key of Object.keys(words) as (keyof typeof en)[]) {
          const feature = /^(space|anatomy|time|math|index)\./.exec(key)?.[1];
          if (!feature || feature === group || (feature === 'anatomy' && group === 'space')) expect(t(locale, key)).toBe(words[key]);
        }
      }
    });
  });
  it('suspends until each requested word group is ready, then keeps every translation', async () => {
    vi.stubEnv('SSR', false);
    const { t } = await import('../src/i18n');
    for (const [locale, words] of [['en', en], ['zh', zh]] as const) {
      for (const key of Object.keys(words) as (keyof typeof en)[]) {
        let translated: string | undefined;
        try { translated = t(locale, key); } catch (pending) {
          expect(pending).toBeInstanceOf(Promise);
          await pending;
          translated = t(locale, key);
        }
        expect(translated, `${locale}/${key}`).toBe(words[key]);
      }
    }
    expect(t('zh', 'chapter.position', { n: 2, total: 10 })).toBe('第 2 章，共 10 章');
  });
});
