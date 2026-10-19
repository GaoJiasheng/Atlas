import { describe, expect, it } from 'vitest';
import { dragVerdict, type DragSample } from '../scripts/lib/drag-settle';

/** One sample every 250 ms: `cams[i]` the live camera (null: none reported), free from sample `freeAt` on. */
const run = (cams: (string | null)[], freeAt = Infinity): DragSample[] => cams.map((camera, i) => ({ at: i * 250, free: i >= freeAt, camera }));
/** The damped camera of a slow, large scene: a new position every sample for `n` samples, then at rest. */
const creeping = (n: number, rest = 0) => [...Array.from({ length: n }, (_, i) => `p${i}`), ...Array.from({ length: rest }, () => `p${n - 1}`)];

describe('shoot --keys: when the drag-frees-the-camera check may judge', () => {
  it('keeps waiting past the old fixed 16 s while the camera still moves (energy-conversion under software GL: ~21 s)', () => {
    const s = run(creeping(84));
    expect(s.at(-1)!.at).toBeGreaterThan(16_000);
    expect(dragVerdict(s)).toBe('wait');
    // Written back once it settles.
    expect(dragVerdict(run(creeping(86), 85))).toBe('free');
  });

  it('fails once the camera has come to rest without freeing (a preset re-asserting itself)', () => {
    expect(dragVerdict(run(creeping(10, 7)))).toBe('wait');
    expect(dragVerdict(run(creeping(10, 8)))).toBe('still');
  });

  it('fails fast when the drag never moved the camera (something on the stage swallowed it)', () => {
    expect(dragVerdict(run(Array(9).fill('p0')))).toBe('unmoved');
  });

  it('gives up at the cap, and gives an engine without a live camera the fixed wait', () => {
    expect(dragVerdict(run(creeping(361)))).toBe('timeout');
    expect(dragVerdict(run(Array(64).fill(null)))).toBe('wait');
    expect(dragVerdict(run(Array(65).fill(null)))).toBe('timeout');
    expect(dragVerdict(run(Array(20).fill(null), 19))).toBe('free');
  });
});
