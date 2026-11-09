/** A chart on the stage: hairline axes, ink line, the moment on show in signal. Read-only; it only draws when its spec changes. */
import { memo } from 'react';
import type { StageChartSpec } from './stage-chart';

const round = (n: number) => Math.round(n * 100) / 100;
const DASH = ['', '5 3', '2 3'];

export const StageChart = memo(function StageChart({ spec, title, compact }: { spec: StageChartSpec; title: string; compact: boolean }) {
  // The plate is narrow off the phone: a smaller drawing space keeps the same type readable.
  const W = compact ? 340 : 248;
  const H = compact ? 112 : 150;
  const P = compact ? { l: 34, r: 12, t: 14, b: 28 } : { l: 30, r: 10, t: 15, b: 32 };
  const [x0, x1] = spec.xDomain;
  const [y0, y1] = spec.yDomain;
  const sx = (x: number) => P.l + ((x - x0) / (x1 - x0)) * (W - P.l - P.r);
  const sy = (y: number) => P.t + (1 - (y - y0) / (y1 - y0)) * (H - P.t - P.b);
  return (
    <figure className="space-chart space-stage-chart" data-stage-chart={spec.id}>
      <figcaption className="space-chart__title">
        {title}
        {spec.series.length > 1 &&
          spec.series.map((s, k) => (
            <span className="space-chart__key" key={s.id}>
              <svg width="16" height="10" aria-hidden="true">
                <path className="space-chart__line" strokeDasharray={DASH[k] || undefined} d="M0 5h16" />
              </svg>
              {s.label}
            </span>
          ))}
      </figcaption>
      <svg viewBox={`0 0 ${W} ${H}`} className="space-chart__svg" role="img" aria-label={spec.summary}>
        <text className="space-chart__axis-title" x={P.l} y={9}>
          {spec.yUnit}
        </text>
        {spec.yTicks.map((y) => (
          <g key={y}>
            <path className={y === y0 ? 'space-chart__axis' : 'space-chart__grid'} d={`M${P.l} ${round(sy(y))}H${W - P.r}`} />
            <text className="space-chart__tick" x={P.l - 5} y={round(sy(y)) + 3} textAnchor="end">
              {round(y)}
            </text>
          </g>
        ))}
        <path className="space-chart__axis" d={`M${P.l} ${P.t}V${H - P.b}`} />
        {spec.xTicks.map((t) => (
          <g key={t.x}>
            <path className="space-chart__axis" d={`M${round(sx(t.x))} ${H - P.b}v4`} />
            <text className="space-chart__tick" x={round(sx(t.x))} y={H - P.b + 13} textAnchor="middle">
              {t.label}
            </text>
          </g>
        ))}
        <text className="space-chart__axis-title" x={(W + P.l - P.r) / 2} y={H - 3} textAnchor="middle">
          {spec.xTitle}
        </text>
        {spec.series.map((s, k) => (
          <polyline key={s.id} data-series={s.id} className="space-chart__line" strokeDasharray={DASH[k] || undefined} points={s.points.map(([x, y]) => `${round(sx(x))},${round(sy(y))}`).join(' ')} />
        ))}
        <path className="space-curve__cursor" d={`M${round(sx(spec.cursor))} ${P.t}V${H - P.b}`} />
        {spec.series.map((s) => (
          <circle key={s.id} className="space-chart__mark space-chart__mark--now" cx={round(sx(spec.cursor))} cy={round(sy(s.now))} r={3.5} />
        ))}
      </svg>
      <p className="space-curve__current" data-stage-chart-cursor={spec.cursor}>
        {spec.current}
      </p>
      {spec.note && <p className="space-stage-chart__note">{spec.note}</p>}
    </figure>
  );
});
