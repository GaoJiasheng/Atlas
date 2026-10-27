import { describe, expect, it } from 'vitest';
import {
  advanceMechanismClock, createMechanismClock, restoreMechanismClock,
  saveMechanismClock, seekMechanismClock, syncMechanismClock,
} from '../../src/engines/space-scene/lib/mechanism-clock';

describe('beam mechanism shared orbit clock', () => {
  it('keeps unwrapped cycles and only changes future slope when rate changes', () => {
    const clock = createMechanismClock(180, 'auto');
    advanceMechanismClock(clock, 0.2, 10, true);
    expect(clock.thetaRad).toBeCloseTo(Math.PI + Math.PI / 15, 14);
    const before = clock.thetaRad;
    advanceMechanismClock(clock, 0, 12, true);
    expect(clock.thetaRad).toBe(before);
    advanceMechanismClock(clock, 0.2, 12, true);
    expect(clock.thetaRad - before).toBeCloseTo(Math.PI * 0.08, 14);
    for (let i = 0; i < 100; i++) advanceMechanismClock(clock, 0.25, 12, true);
    expect(clock.thetaRad).toBeGreaterThan(2 * Math.PI);
  });

  it.each(['RUN off', 'paused', 'reference', 'exploded', 'isolate', 'solo', 'hidden', 'reduced motion'])('freezes exactly when %s', () => {
    const clock = createMechanismClock(90, 'auto');
    advanceMechanismClock(clock, 0.1, 10, true);
    const before = clock.thetaRad;
    for (let i = 0; i < 100; i++) advanceMechanismClock(clock, 0.25, 12, false);
    expect(clock.thetaRad).toBe(before);
    advanceMechanismClock(clock, 0.1, 10, true);
    expect(clock.thetaRad - before).toBeCloseTo(Math.PI / 30, 14);
  });

  it('manual holds still, seeks on phase change and resets an identical beat', () => {
    const clock = createMechanismClock(0, 'manual');
    advanceMechanismClock(clock, 0.25, 10, true);
    expect(clock.thetaRad).toBe(0);
    syncMechanismClock(clock, 180, 'manual');
    expect(clock.thetaRad).toBe(Math.PI);
    syncMechanismClock(clock, 180, 'auto');
    advanceMechanismClock(clock, 0.2, 10, true);
    syncMechanismClock(clock, 180, 'auto', true);
    expect(clock.thetaRad).toBe(Math.PI);
    advanceMechanismClock(clock, 0.2, 10, true);
    syncMechanismClock(clock, 180, 'manual');
    expect(clock.thetaRad).toBe(Math.PI);
  });

  it('QA seek holds fractional phases without changing declared controls', () => {
    const clock = createMechanismClock(180, 'auto');
    expect(seekMechanismClock(clock, 45.5)).toBe(true);
    expect(clock.thetaRad).toBe(45.5 * Math.PI / 180);
    expect(clock.phaseDeg).toBe(180);
    advanceMechanismClock(clock, 0.2, 10, true);
    expect(clock.thetaRad).toBe(45.5 * Math.PI / 180);
    expect(seekMechanismClock(clock, 360)).toBe(true);
    expect(clock.thetaRad).toBe(2 * Math.PI);
    syncMechanismClock(clock, 270, 'auto');
    expect(clock.qaHold).toBe(false);
    expect(clock.thetaRad).toBe(1.5 * Math.PI);
  });

  it.each([NaN, Infinity, -Infinity, -1, 360.01])('rejects invalid QA angle %s without mutation', (degrees) => {
    const clock = createMechanismClock(90, 'auto');
    const before = { ...clock };
    expect(seekMechanismClock(clock, degrees)).toBe(false);
    expect(clock).toEqual(before);
  });

  it('clears a QA hold when mode changes and preserves current angle on auto entry', () => {
    const clock = createMechanismClock(0, 'manual');
    seekMechanismClock(clock, 45.5);
    syncMechanismClock(clock, 0, 'auto');
    expect(clock.qaHold).toBe(false);
    expect(clock.thetaRad).toBe(45.5 * Math.PI / 180);
    advanceMechanismClock(clock, 0.2, 10, true);
    expect(clock.thetaRad).toBeGreaterThan(45.5 * Math.PI / 180);
  });

  it('restores presentation phase and QA hold after authored controls reapply', () => {
    const clock = createMechanismClock(0, 'auto');
    seekMechanismClock(clock, 123.456);
    const saved = saveMechanismClock(clock);
    syncMechanismClock(clock, 270, 'manual', true);
    restoreMechanismClock(clock, saved);
    expect(clock.thetaRad).toBe(saved.thetaRad);
    expect(clock.qaHold).toBe(true);
    advanceMechanismClock(clock, 0.2, 10, true);
    expect(clock.thetaRad).toBe(saved.thetaRad);
  });

  it('caps stalled deltas and ignores invalid or reverse time', () => {
    const clock = createMechanismClock(0, 'auto');
    advanceMechanismClock(clock, 100, 12, true);
    expect(clock.thetaRad).toBeCloseTo(Math.PI / 10, 14);
    const before = clock.thetaRad;
    for (const dt of [NaN, Infinity, -1, 0]) advanceMechanismClock(clock, dt, 10, true);
    advanceMechanismClock(clock, 0.2, NaN, true);
    expect(clock.thetaRad).toBe(before);
  });
});
