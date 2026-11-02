import { describe, expect, it } from 'vitest';
import { fittedSegmentDate } from '../../src/engines/time-scene/timeline/Timeline';

describe('chapter-axis segment dates fit their segment', () => {
  it('keeps the full bilingual deep-time label when the segment is wide (1920 × 1080)', () => {
    expect(fittedSegmentDate('250 Ma / 250百万年前', 200)).toBe('250 Ma / 250百万年前');
  });
  it('falls back to the first form in a narrow segment (1024 px, zh), never a clipped label', () => {
    expect(fittedSegmentDate('250 Ma / 250百万年前', 73)).toBe('250 Ma');
    expect(fittedSegmentDate('66 Ma / 66百万年前', 73)).toBe('66 Ma');
  });
  it('drops the date when even the short form does not fit, or below the 44 px minimum', () => {
    expect(fittedSegmentDate('2000-01', 40)).toBeNull();
    expect(fittedSegmentDate('1939-09-01', 50)).toBeNull();
    expect(fittedSegmentDate('1939-09', 48)).toBe('1939-09');
  });
});
