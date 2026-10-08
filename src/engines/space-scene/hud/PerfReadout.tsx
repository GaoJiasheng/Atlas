/**
 * Quiet bottom-right readout (docs/08 §2): `60 FPS · 54 CALLS · 0.21M TRIS ·
 * 1920×1080`. Reads the stage bridge twice a second and writes text only when
 * it changes. FPS is a rolling average of rendered frames; the stage renders
 * on demand, so an idle stage shows `IDLE`.
 */
import { useEffect, useRef } from 'react';
import type { StageBridge } from '../bridge';

function formatPerf(s: StageBridge['stats'], now: number): string {
  const fps = s.fps === undefined || now - s.lastFrame > 1000 ? 'IDLE' : `${Math.round(s.fps)} FPS`;
  const tris = `${(s.triangles / 1e6).toFixed(2)}M TRIS`;
  return `${fps} · ${s.calls} CALLS · ${tris} · ${s.buffer[0]}×${s.buffer[1]}`;
}

export function PerfReadout({ bridge }: { bridge: StageBridge }) {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const tick = () => {
      const el = ref.current;
      if (!el || bridge.stats.buffer[0] === 0) return;
      const text = formatPerf(bridge.stats, performance.now());
      if (el.textContent !== text) el.textContent = text;
    };
    tick();
    const id = window.setInterval(tick, 500);
    return () => window.clearInterval(id);
  }, [bridge]);
  return <span ref={ref} className="space-perf" />;
}
