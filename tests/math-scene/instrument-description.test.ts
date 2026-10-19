import { describe, expect, it } from 'vitest';
import { describeInstrument } from '../../src/engines/math-scene/lib/instrument-description';
import { model, type InstrumentModelSpec } from '../../src/engines/math-scene/schema';

const instrument = (s: Record<string, unknown>) => model.parse({ kind: 'instrument', ...s }) as InstrumentModelSpec;

describe('instrument descriptions give landmarks without doing the reading', () => {
  it('describes the needle in both languages without naming its value', () => {
    const s = instrument({ type: 'dial', unit: 'g', from: 0, to: 500, major: 100, minor: 20, value: 280 });
    const en = describeInstrument(s, 'en');
    const zh = describeInstrument(s, 'zh');
    expect(en).toContain('4 small parts after two hundred grams');
    expect(zh).toContain('从二百克往后数4小格');
    expect(en).not.toContain('eighty');
    expect(zh).not.toContain('八十');
  });

  it('describes a nearest-centimetre endpoint without rounding it', () => {
    const s = instrument({ type: 'ruler', unit: 'cm', from: 0, to: 15, major: 1, minor: 1, object: { kind: 'leaf', from: 0, to: '6.7' } });
    expect(describeInstrument(s, 'en')).toContain('end is between six centimetres and seven centimetres');
    expect(describeInstrument(s, 'en')).not.toContain('6.7');
  });

  it('names visible balance weights and tilt but keeps object masses private', () => {
    const s = instrument({ type: 'balance', left: [{ item: 'papaya', mass: 800 }], right: [{ weight: 500 }] });
    expect(describeInstrument(s, 'en')).toContain('Right pan: five hundred grams');
    expect(describeInstrument(s, 'en')).toContain('Left side heavier');
    expect(describeInstrument(s, 'en')).not.toContain('eight hundred');
  });
});
