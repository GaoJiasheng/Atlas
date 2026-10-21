/**
 * One clock per part animation (lib/sim/hz.ts), advanced once a frame before
 * the parts and flows read them: an animation an `hz` binding paces
 * integrates its own phase at the eased bound frequency (docs/40 §4.3; parts
 * play it through `clockTime`), every other one reads the shared run clock as
 * before. Tidal flows (docs/40 §4.4) follow their `sync` animation's phase
 * and on-ness. Also publishes each clock's frequency and phase for the test
 * API (`__atlas.engine.animation(id)`). Deep links and instant transitions
 * (`snapKey`) and reduced motion jump to the bound frequency.
 */
import { useEffect, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import type { PartAnimation } from '../../schema';
import type { StageBridge } from '../../bridge';
import type { SimAnimationEffect } from '../../lib/sim/bind';
import { clockEasing, clockPhase, createClock, freeCycles, nativeHz, ON_RATE, stepClock, type AnimClock } from '../../lib/sim/hz';
import { damp } from '../../lib/math';
import { keepAnimating, MAX_DT, prefersReducedMotion, useRuntime } from './runtime';

export function AnimClocks({ animations, effects, bridge, snapKey }: { animations: readonly PartAnimation[]; effects: ReadonlyMap<string, SimAnimationEffect> | undefined; bridge: StageBridge; snapKey: number }) {
  const runtime = useRuntime();
  const invalidate = useThree((s) => s.invalidate);
  const seen = useRef(snapKey);
  useEffect(() => invalidate(), [effects, invalidate]);
  useFrame((state, delta) => {
    const dt = Math.min(delta, MAX_DT);
    const snap = seen.current !== snapKey || prefersReducedMotion();
    seen.current = snapKey;
    let easing = false;
    for (const a of animations) {
      const e = effects?.get(a.id);
      const onTarget = e?.enabled === false ? 0 : 1;
      const run = a.whenRun ? runtime.energy : 1;
      let c: AnimClock | undefined = runtime.clocks.get(a.id);
      if (e?.hz !== undefined) {
        // Paced: its own phase at the eased bound frequency.
        if (!c || !c.paced) {
          c = createClock(e.hz, onTarget, true);
          runtime.clocks.set(a.id, c);
        }
        stepClock(c, e.hz, dt, run, onTarget, snap);
        if (clockEasing(c, e.hz, onTarget)) easing = true;
      } else {
        // Free: the shared clock, exactly as the parts read it.
        if (!c || c.paced) {
          c = createClock(nativeHz(a), onTarget, false);
          runtime.clocks.set(a.id, c);
        }
        const before = c.cycles;
        c.cycles = freeCycles(a, a.whenRun ? runtime.phase : runtime.elapsed);
        c.hz = nativeHz(a);
        c.on = snap ? onTarget : damp(c.on, onTarget, ON_RATE, dt);
        if (Math.abs(c.on - onTarget) < 0.003) c.on = onTarget;
        else easing = true;
        c.advance = c.cycles - before;
        c.seconds = dt * run * c.on;
      }
      const reading = bridge.animations.get(a.id);
      if (reading) {
        reading.hz = c.hz;
        reading.phase = clockPhase(c.cycles);
        reading.on = c.on;
      } else bridge.animations.set(a.id, { hz: c.hz, phase: clockPhase(c.cycles), on: c.on });
    }
    if (easing) keepAnimating(state.invalidate);
  });
  return null;
}
