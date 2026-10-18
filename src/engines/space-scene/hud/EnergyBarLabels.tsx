/**
 * The energy bars' labels (docs/31 E-EN6, slot `leaders`): under each
 * energy-bars overlay on the stage, a small block of three rows — a swatch
 * in the form's colour, its name and the percentage now — following the
 * bars every frame through the bridge (the stage writes the values and the
 * projected point under the bars). Names and colours always go together.
 */
import { useEffect, useMemo, useRef } from 'react';
import { useT } from '../../core/context';
import type { PartsFile } from '../schema';
import type { StageBridge } from '../bridge';

const ROW = 14;
const ROWS = [
  { key: 'potential', color: 'var(--en-potential)', label: 'space.energy.potential' },
  { key: 'kinetic', color: 'var(--en-kinetic)', label: 'space.energy.kinetic' },
  { key: 'lost', color: 'var(--en-heat)', label: 'space.energy.lost' },
] as const;

export function EnergyBarLabels({ file, bridge }: { file: PartsFile; bridge: StageBridge }) {
  const t = useT();
  const indices = useMemo(() => (file.sim?.overlays ?? []).flatMap((o, i) => (o.kind === 'energy-bars' ? [i] : [])), [file.sim]);
  const root = useRef<SVGGElement>(null);

  useEffect(() => {
    const g = root.current;
    if (!g || indices.length === 0) return;
    const blocks = [...g.querySelectorAll<SVGGElement>('[data-bars]')];
    const last = new Map<number, string>();
    const update = () => {
      indices.forEach((index, k) => {
        const block = blocks[k];
        const b = bridge.energyBars.get(index);
        if (!block) return;
        if (!b || !b.shown) {
          if (last.get(index) !== 'off') {
            block.style.opacity = '0';
            last.set(index, 'off');
          }
          return;
        }
        const x = Math.min(Math.max(b.x, 64), bridge.width - 64);
        const y = Math.min(b.y + 6, bridge.height - 3 * ROW - 6);
        const values = [b.potential, b.kinetic, b.lost].map((v) => `${Math.round(v)} %`);
        const key = `${x.toFixed(1)},${y.toFixed(1)}|${values.join('|')}`;
        if (last.get(index) === key) return;
        last.set(index, key);
        block.setAttribute('transform', `translate(${x.toFixed(1)} ${y.toFixed(1)})`);
        block.querySelectorAll('[data-value]').forEach((el, i) => {
          if (el.textContent !== values[i]) el.textContent = values[i]!;
        });
        block.style.opacity = '';
      });
    };
    bridge.listeners.add(update);
    update();
    bridge.invalidate();
    return () => {
      bridge.listeners.delete(update);
    };
  }, [bridge, indices]);

  if (indices.length === 0) return null;
  return (
    <g ref={root} className="space-ebars">
      {indices.map((index) => (
        <g key={index} data-bars={index} style={{ opacity: 0 }}>
          <rect className="space-ebars__ground" x={-62} y={-3} width={124} height={ROWS.length * ROW + 4} rx={2} />
          {ROWS.map((r, i) => (
            <g key={r.key} transform={`translate(0 ${i * ROW})`}>
              {r.key === 'lost' ? (
                <>
                  <rect x={-56} y={3} width={8} height={6} style={{ fill: r.color }} />
                  <rect x={-56} y={0} width={8} height={3} style={{ fill: 'var(--en-sound)' }} />
                </>
              ) : (
                <rect x={-56} y={0} width={8} height={8} style={{ fill: r.color }} />
              )}
              <text className="space-ebars__name" x={-44} y={8}>
                {t(r.label)}
              </text>
              <text className="space-ebars__value" x={56} y={8} textAnchor="end" data-value="" />
            </g>
          ))}
        </g>
      ))}
    </g>
  );
}
