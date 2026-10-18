/**
 * The try-it timelines' clock (docs/30 F2; rules in lib/sim/timeline.ts).
 * Each timeline output has a playback in `runtime.play`: a changed run (its
 * key) plays from the start 0.4 s later, at 1 ÷ `slow` speed; "Run again"
 * (ui `simReplay`) plays the card's runs from the start at once; an instant
 * transition (deep link, screenshot, instant beat), EXPLODED, REFERENCE and
 * reduced motion show the end state. It asks for frames only while a run
 * plays, and is mounted before the parts so they read this frame's time.
 */
import { useEffect, useLayoutEffect, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import type { SimOutputs } from '../../lib/sim';
import { endPlayback, isTimeline, replayPlayback, startPlayback, stepPlayback, updatePlayback } from '../../lib/sim/timeline';
import type { SpaceUiStore } from '../../ui';
import type { StageBridge } from '../../bridge';
import { keepAnimating, MAX_DT, prefersReducedMotion, useRuntime } from './runtime';

export function TimelineClock({ outputs, ui, bridge, snapKey, still }: { outputs: SimOutputs; ui: SpaceUiStore; bridge: StageBridge; snapKey: number; still: boolean }) {
  const runtime = useRuntime();
  const invalidate = useThree((s) => s.invalidate);
  const seen = useRef(snapKey);
  const stillRef = useRef(still);
  stillRef.current = still;

  useLayoutEffect(() => {
    bridge.playback = runtime.play;
  }, [bridge, runtime]);

  // New outputs (a control, a chapter, a beat): runs whose key changed start again, or show their end.
  useLayoutEffect(() => {
    const snapped = seen.current !== snapKey;
    seen.current = snapKey;
    const hold = snapped || still || prefersReducedMotion();
    for (const [id, v] of Object.entries(outputs)) {
      if (!isTimeline(v)) continue;
      const p = runtime.play.get(id);
      const next = p ? updatePlayback(p, v, hold) : startPlayback(v);
      if (hold) endPlayback(next);
      runtime.play.set(id, next);
    }
    invalidate();
  }, [outputs, snapKey, still, runtime, invalidate]);

  // "Run again" and the QA hold.
  useEffect(
    () =>
      ui.subscribe((u, prev) => {
        if (u.simReplay !== prev.simReplay && !stillRef.current && !prefersReducedMotion()) {
          for (const id of u.simReplay.ids) {
            const p = runtime.play.get(id);
            if (p) runtime.play.set(id, replayPlayback(p));
          }
          invalidate();
        }
        if (u.simSeek && u.simSeek !== prev.simSeek) {
          const p = runtime.play.get(u.simSeek.id);
          if (p) {
            p.t = Math.min(Math.max(0, u.simSeek.t), p.timeline.duration);
            p.playing = false;
            p.wait = 0;
            invalidate();
          }
        }
      }),
    [ui, runtime, invalidate],
  );

  useFrame((state, delta) => {
    const dt = Math.min(delta, MAX_DT);
    let playing = false;
    for (const p of runtime.play.values()) if (stepPlayback(p, dt)) playing = true;
    if (playing) keepAnimating(state.invalidate);
  });
  return null;
}
