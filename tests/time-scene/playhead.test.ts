import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createPlayhead } from '../../src/engines/time-scene/lib/playhead';

/** A manual animation-frame clock: `advance(ms)` runs the queued frame at that time. */
function installClock() {
  let now = 0;
  let next = 0;
  const frames = new Map<number, (t: number) => void>();
  vi.stubGlobal('performance', { now: () => now });
  vi.stubGlobal('requestAnimationFrame', (cb: (t: number) => void) => {
    frames.set(++next, cb);
    return next;
  });
  vi.stubGlobal('cancelAnimationFrame', (id: number) => frames.delete(id));
  return {
    advance(ms: number) {
      now += ms;
      const queued = [...frames.entries()];
      frames.clear();
      for (const [, cb] of queued) cb(now);
    },
  };
}

describe('playhead tween', () => {
  let clock: ReturnType<typeof installClock>;
  beforeEach(() => {
    clock = installClock();
  });
  afterEach(() => vi.unstubAllGlobals());

  it('starts from `from`, eases monotonically and lands exactly on the target', () => {
    const p = createPlayhead(500);
    const seen: number[] = [];
    p.subscribe((t) => seen.push(t));
    const done = vi.fn();
    p.tweenTo(100.3, 5000, { from: 10, onDone: done });
    expect(p.get()).toBe(10);
    expect(done).not.toHaveBeenCalled();
    for (let i = 0; i < 5; i++) clock.advance(1000);
    expect(p.get()).toBe(100.3);
    expect(done).toHaveBeenCalledExactlyOnceWith(true);
    expect([...seen].sort((a, b) => a - b)).toEqual(seen);
  });

  it('reports a cancelled tween (set, cancelTween, a newer tween) as not completed', () => {
    const p = createPlayhead(0);
    const a = vi.fn();
    p.tweenTo(10, 1000, { onDone: a });
    clock.advance(300);
    p.set(4);
    expect(a).toHaveBeenCalledExactlyOnceWith(false);
    expect(p.get()).toBe(4);
    clock.advance(2000);
    expect(p.get()).toBe(4);

    const b = vi.fn();
    const c = vi.fn();
    p.tweenTo(10, 1000, { onDone: b });
    p.tweenTo(20, 1000, { onDone: c });
    expect(b).toHaveBeenCalledExactlyOnceWith(false);
    p.cancelTween();
    expect(c).toHaveBeenCalledExactlyOnceWith(false);
  });

  it('a zero-length or already-there tween completes at once', () => {
    const p = createPlayhead(3);
    const done = vi.fn();
    p.tweenTo(3, 1000, { onDone: done });
    expect(done).toHaveBeenCalledExactlyOnceWith(true);
    p.tweenTo(9, 0, { onDone: done });
    expect(p.get()).toBe(9);
    expect(done).toHaveBeenCalledTimes(2);
  });
});
