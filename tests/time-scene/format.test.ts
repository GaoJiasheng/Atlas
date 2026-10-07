import { describe, expect, it } from 'vitest';
import { formatTime, nicePer } from '../../src/engines/time-scene/lib/format';

describe('formatTime', () => {
  it('formats ISO dates by precision (en)', () => {
    expect(formatTime('1942-02-15', 'en')).toBe('15 Feb 1942');
    expect(formatTime('1942-02', 'en')).toBe('Feb 1942');
    expect(formatTime('1942', 'en')).toBe('1942');
    expect(formatTime('1819-01-29', 'en')).toBe('29 Jan 1819');
    expect(formatTime('-0221', 'en')).toBe('221 BCE');
  });

  it('formats ISO dates by precision (zh)', () => {
    expect(formatTime('1942-02-15', 'zh')).toBe('1942年2月15日');
    expect(formatTime('1942-02', 'zh')).toBe('1942年2月');
    expect(formatTime('1942', 'zh')).toBe('1942年');
    expect(formatTime('-0221', 'zh')).toBe('公元前221年');
  });

  it('formats geological time', () => {
    expect(formatTime({ ma: 200 }, 'en')).toBe('200 Ma');
    expect(formatTime({ ma: 1500 }, 'en')).toBe('1,500 Ma');
    expect(formatTime({ ma: 66.04 }, 'en')).toBe('66.04 Ma');
    expect(formatTime({ ma: 200 }, 'zh')).toBe('2亿年前');
    expect(formatTime({ ma: 250 }, 'zh')).toBe('2.5亿年前');
    expect(formatTime({ ma: 66 }, 'zh')).toBe('6600万年前');
    expect(formatTime({ ma: 0.5 }, 'zh')).toBe('50万年前');
    expect(formatTime({ ma: 0.001 }, 'zh')).toBe('1000年前');
    expect(formatTime({ ma: 0 }, 'zh')).toBe('现在');
  });
});

describe('nicePer', () => {
  it('picks a round per-icon value keeping icons <= 20', () => {
    expect(nicePer(12000)).toBe(1000);
    expect(nicePer(7500)).toBe(500);
    expect(nicePer(70000)).toBe(5000);
    expect(nicePer(15)).toBe(1);
    expect(nicePer(0)).toBe(1);
    for (const n of [3, 99, 1234, 87654, 3_000_000]) expect(n / nicePer(n)).toBeLessThanOrEqual(20);
  });
});
