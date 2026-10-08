/**
 * Playback: advance the playhead so the whole span plays in ~60 s at ×1.
 * On reaching a chapter node, hold 1.5 s with the chapter title shown, then
 * continue. Stops at the end; pressing play at the end restarts.
 */
import { useEffect, useState } from 'react';
import type { ChapterNode, TimeModel } from '../lib/model';
import type { Playhead } from '../lib/playhead';

export const PLAY_SECONDS = 60;
export const NODE_HOLD_MS = 1500;
export type Speed = 1 | 2 | 4;

export interface Playback {
  playing: boolean;
  speed: Speed;
  /** Chapter node currently held at (title overlay), if any. */
  stop: ChapterNode | null;
  setPlaying(playing: boolean): void;
  setSpeed(speed: Speed): void;
}

export function usePlayback(
  playhead: Playhead,
  model: TimeModel,
  commit: (t: number) => void,
): Playback {
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState<Speed>(1);
  const [stop, setStop] = useState<ChapterNode | null>(null);

  useEffect(() => {
    if (!playing) return;
    const perMs = model.span / (PLAY_SECONDS * 1000);
    if (playhead.get() >= model.max) commit(model.min);
    let last = performance.now();
    let holdUntil = 0;
    let raf = requestAnimationFrame(function tick(now) {
      raf = requestAnimationFrame(tick);
      const dt = Math.min(100, now - last);
      last = now;
      if (holdUntil) {
        if (now < holdUntil) return;
        holdUntil = 0;
        setStop(null);
      }
      const cur = playhead.get();
      if (cur >= model.max) {
        setPlaying(false);
        return;
      }
      let next = Math.min(model.max, cur + perMs * speed * dt);
      const node = model.chapterNodes.find((c) => c.t > cur && c.t <= next);
      if (node) {
        next = node.t;
        holdUntil = now + NODE_HOLD_MS;
        setStop(node);
      }
      commit(next);
    });
    return () => {
      cancelAnimationFrame(raf);
      setStop(null);
    };
  }, [playing, speed, playhead, model, commit]);

  return { playing, speed, stop, setPlaying, setSpeed };
}
