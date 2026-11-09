import { describe, expect, it } from 'vitest';
import { needsSimTimeText, prepareEngineData } from '../../src/engines/core/loading-data';
import { plainText, speakable } from '../../src/lib/rich-text';
import { readTimeText } from '../../src/engines/space-scene/lib/sim/time-text';
import { loadTimeText as loadBrowserTimeText, readTimeText as readBrowserTimeText } from '../../src/engines/space-scene/lib/sim/time-text.client';
import { timeText, timeToken, valueWords, outputWords } from '../../src/engines/space-scene/lib/sim/text';
import type { SimControl, SimOutput } from '../../src/engines/space-scene/sim-schema';

describe('simulation time notation loading', () => {
  it('requires an explicit time-formatted control or output', () => {
    for (const field of ['controls', 'outputs']) expect(needsSimTimeText('space-scene', { parts: { sim: { [field]: [{ format: 'time' }] } } })).toBe(true);
    for (const data of [undefined, null, {}, { parts: {} }, { parts: { sim: { controls: [], outputs: [{}] } } }]) expect(needsSimTimeText('space-scene', data)).toBe(false);
    expect(needsSimTimeText('time-scene', { parts: { sim: { controls: [{ format: 'time' }] } } })).toBe(false);
  });
  it('preserves notation, speech, rounding, short text and nonfinite fallbacks', async () => {
    await prepareEngineData('space-scene', { parts: { sim: { controls: [{ format: 'time' }] } } });
    expect(readTimeText()).toMatchObject({ plainText, speakable });
    await loadBrowserTimeText();
    expect(readBrowserTimeText()).toMatchObject({ plainText, speakable });
    const control = { kind: 'step', format: 'time' } as SimControl;
    const output = { kind: 'number', format: 'time' } as SimOutput;
    for (const locale of ['en', 'zh'] as const) for (const hours of [0, 0.001, 1, 5.5, 6, 11.999, 12, 12.5, 17.99, 18, 23.999, 24, 25.5, -1]) {
      const token = timeToken(hours);
      const shown = plainText(token, locale);
      expect(timeText(hours, locale)).toBe(shown);
      expect(timeText(hours, locale, true)).toBe(shown.replace(/\.00(?= |$)/, ''));
      expect(valueWords(control, hours, locale)).toBe(speakable(token, locale));
      expect(outputWords(output, hours, locale)).toBe(speakable(token, locale));
    }
    for (const hours of [NaN, Infinity, -Infinity]) expect(timeText(hours, 'en')).toBe('—');
  });
});
