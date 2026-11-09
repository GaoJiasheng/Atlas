import { describe, expect, it, vi } from 'vitest';
import { createUiLoader } from '../src/i18n/ui-loader';

describe('locale word loading', () => {
  it('suspends on only the requested locale and reuses its pending and loaded resource', async () => {
    const en = vi.fn(async () => ({ title: 'Hello' }));
    const zh = vi.fn(async () => ({ title: '你好' }));
    const ui = createUiLoader({ en, zh });
    let suspended: unknown;
    try { ui.read('zh'); } catch (value) { suspended = value; }
    expect(suspended).toBeInstanceOf(Promise);
    expect(ui.load('zh')).toBe(suspended);
    await suspended;
    expect(ui.read('zh')).toEqual({ title: '你好' });
    await ui.load('zh');
    expect(zh).toHaveBeenCalledTimes(1);
    expect(en).not.toHaveBeenCalled();
  });

  it('exposes failures to the render boundary and allows explicit retry', async () => {
    const error = new Error('offline chunk');
    const loader = vi.fn().mockRejectedValueOnce(error).mockResolvedValueOnce({ title: 'Hello' });
    const ui = createUiLoader({ en: loader });
    await expect(ui.load('en')).rejects.toBe(error);
    expect(() => ui.read('en')).toThrow(error);
    await ui.load('en');
    expect(ui.read('en')).toEqual({ title: 'Hello' });
    expect(loader).toHaveBeenCalledTimes(2);
  });
});
