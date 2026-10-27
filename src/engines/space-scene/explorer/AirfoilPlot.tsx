import { useId } from 'react';
import { useStore } from 'zustand';
import { useSceneContext } from '../../core/context';
import { tx } from '../../../i18n';
import type { SimData, SimValues } from '../sim-schema';
import type { SpaceUiStore } from '../ui';
import { airfoilPlot } from '../lib/sim/airfoil';
export function AirfoilPlot({
  sim,
  values,
  ui,
  chapter,
}: {
  sim: SimData;
  values: SimValues;
  ui: SpaceUiStore;
  chapter: string;
}) {
  const { locale } = useSceneContext(),
    id = useId(),
    d = sim.airfoil!,
    rows = useStore(ui, (u) => u.simTables[chapter]) ?? [],
    output = sim.outputs.find((o) => o.id === d.plot.y)!,
    from = (output.from ?? output.id) as 'cl' | 'lift-n',
    p = airfoilPlot(d, values, from);
  const x = (v: number) => 42 + ((v + 20) / 40) * 264,
    y = (v: number) => 102 - (v / p.extent) * 70;
  return (
    <figure className="space-airfoil-plot" data-airfoil-plot="">
      <figcaption>
        {tx(
          {
            en: 'Lift and angle · teaching model',
            zh: '升力与迎角 · 教学模型',
          },
          locale,
        )}{' '}
        <span className="atlas-chip">SIM</span>
      </figcaption>
      <svg
        viewBox="0 0 330 218"
        role="img"
        aria-labelledby={`${id}-title ${id}-desc`}
      >
        <title id={`${id}-title`}>
          {tx(
            {
              en: 'Signed model curve and recorded model values',
              zh: '有正负值的模型曲线和已记录模型值',
            },
            locale,
          )}
        </title>
        <desc id={`${id}-desc`}>
          {tx(
            {
              en: 'Artificial boundaries at −12° and 12°. Solid: ideal attached flow; dashed and hatched: illustrative stall. Squares are recorded model values, also available in the table.',
              zh: '−12° 和 12° 是人工分界。实线表示理想附着流，虚线与斜线底表示失速示意。方标为已记录模型值，也可从表格读取。',
            },
            locale,
          )}{' '}
          {tx(output.label, locale)}: {p.current.y.toFixed(3)}{' '}
          {output.unit ?? ''}.
        </desc>
        <defs>
          <pattern
            id={`${id}-hatch`}
            width="6"
            height="6"
            patternUnits="userSpaceOnUse"
          >
            <path d="M0 6L6 0" stroke="var(--ink-3)" strokeWidth=".4" />
          </pattern>
        </defs>
        {[
          [-20, -12],
          [12, 20],
        ].map(([a, b]) => (
          <rect
            key={a}
            x={x(a!)}
            y="30"
            width={x(b!) - x(a!)}
            height="144"
            fill={`url(#${id}-hatch)`}
          />
        ))}
        <path
          d={`M42 30V174H306 M42 ${y(0)}H306 M${x(0)} 30V174`}
          fill="none"
          stroke="var(--ink-3)"
          strokeWidth=".6"
        />
        {[-12, 12].map((v) => (
          <path
            key={v}
            d={`M${x(v)} 30V174`}
            stroke="var(--ink-2)"
            strokeDasharray="2 3"
          />
        ))}
        {p.segments.map(([a, b], i) => (
          <polyline
            key={i}
            points={p.x
              .slice(a, b! + 1)
              .map((v, j) => `${x(v)},${y(p.y[a! + j]!)}`)
              .join(' ')}
            fill="none"
            stroke="var(--ink)"
            strokeWidth="1.5"
            strokeDasharray={i === 1 ? undefined : '4 3'}
          />
        ))}
        {[...rows]
          .sort((a, b) => Number(a.vary) - Number(b.vary))
          .map((r) => (
            <rect
              key={String(r.vary)}
              data-airfoil-record=""
              x={x(Number(r.vary)) - 2.5}
              y={y(Number(r.values[d.plot.y])) - 2.5}
              width="5"
              height="5"
              fill="var(--ink)"
            />
          ))}
        <circle
          data-airfoil-current=""
          cx={x(p.current.x)}
          cy={y(p.current.y)}
          r="4"
          fill="var(--signal)"
        />
        {[-20, -12, 0, 12, 20].map((v) => (
          <text key={v} x={x(v)} y="188" textAnchor="middle">
            {v}°
          </text>
        ))}
        <text x="42" y="22">
          {tx(output.label, locale)} {output.unit ?? ''}
        </text>
        <text x="34" y="38" textAnchor="end">
          {p.extent.toFixed(2)}
        </text>
        <text x="34" y="174" textAnchor="end">
          {(-p.extent).toFixed(2)}
        </text>
        <text x="174" y="209" textAnchor="middle">
          {tx({ en: 'Angle of attack (degree)', zh: '迎角（度）' }, locale)}
        </text>
      </svg>
      <p>
        {tx(
          {
            en: 'Line: model curve · ■ recorded model values · ● current value. The table is the text alternative.',
            zh: '线：模型曲线 · ■ 已记录模型值 · ● 当前值。表格提供文字读数。',
          },
          locale,
        )}
      </p>
    </figure>
  );
}
