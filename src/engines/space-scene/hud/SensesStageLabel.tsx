/**
 * The optical study's stage note (docs/58 F1, slot `leaders`): above the
 * receiver while the bench's rays are drawn, the disclosed vertical exaggeration
 * ("Vertical ×20 · schematic") and a two-swatch key for the object points,
 * following the bench every frame through the bridge.
 */
import { useEffect, useMemo, useRef } from 'react';
import { useT } from '../../core/context';
import { resolveColorRef } from '../../../theme/theme';
import type { PartsFile } from '../schema';
import type { StageBridge } from '../bridge';

export function SensesStageLabel({ file, bridge }: { file: PartsFile; bridge: StageBridge }) {
  const t = useT();
  const bench = useMemo(() => {
    if (file.sim?.senses?.profile === 'sound-only') return null;
    const o = file.sim?.overlays.find((x) => x.kind === 'paraxial-eye');
    return o?.kind === 'paraxial-eye' && (o.yScale > 1 || o.pointColors) ? o : null;
  }, [file.sim]);
  const root = useRef<SVGGElement>(null);

  useEffect(() => {
    const g = root.current;
    if (!g || !bench) return;
    let last = '';
    const update = () => {
      const l = bridge.senses.eye?.active ? bridge.senses.eye.label : undefined;
      const key = l?.shown ? `${Math.min(Math.max(l.x, 110), bridge.width - 110).toFixed(1)} ${Math.min(Math.max(l.y, 12), bridge.height - 26).toFixed(1)}` : 'off';
      if (key === last) return;
      last = key;
      if (key === 'off') g.style.opacity = '0';
      else {
        g.setAttribute('transform', `translate(${key})`);
        g.style.opacity = '';
      }
    };
    bridge.listeners.add(update);
    update();
    bridge.invalidate();
    return () => {
      bridge.listeners.delete(update);
    };
  }, [bridge, bench]);

  if (!bench) return null;
  const [top, bottom] = bench.pointColors ?? ['token:en-light', 'token:en-light'];
  return (
    <g ref={root} className="space-senses-note" data-senses-stage="" style={{ opacity: 0 }}>
      {bench.yScale > 1 && (
        <text className="space-senses-note__scale" textAnchor="middle" y={0}>
          {t('space.senses.vertical', { n: String(bench.yScale) })}
        </text>
      )}
      {bench.pointColors && (
        <text className="space-senses-note__key" textAnchor="middle" y={bench.yScale > 1 ? 14 : 0}>
          <tspan style={{ fill: resolveColorRef(top) }}>■ </tspan>
          <tspan>{t('space.senses.upper')}</tspan>
          <tspan style={{ fill: resolveColorRef(bottom) }} dx={10}>■ </tspan>
          <tspan>{t('space.senses.lower')}</tspan>
        </text>
      )}
    </g>
  );
}
