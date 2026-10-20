/**
 * The small graph under the try-it data table (docs/30 F5; model and words
 * in lib/sim/chart.ts): from two recorded rows, a line graph over a step
 * control's values or a bar graph over a choice's options, hairline axes
 * from 0, mono numbers, axis titles with units, ink marks and the row on show
 * in the signal colour. Screen readers get the summary (`aria-label`); the
 * table above stays the full record. In the phone drawer it takes the same
 * width as the table.
 */
import { useT, useSceneContext } from '../../core/context';
import { tx } from '../../../i18n';
import type { SimControl, SimOutput, SimValue } from '../sim-schema';
import { chartModel, chartSummary } from '../lib/sim/chart';
import type { TableRow } from '../lib/sim/trial';
import { outputDecimals } from '../lib/sim';
import { formatReading } from '../lib/telemetry';
import { outputText, timeText, valueText } from '../lib/sim/text';

const W = 320;
const H = 172;
const PAD = { l: 38, r: 10, t: 22, b: 34 };
const f1 = (n: number) => Math.round(n * 10) / 10;
/** Marker per series: a dot, a square, a triangle (and a dash pattern after the first). */
const DASH = ['', '4 3', '1.5 2.5'];

function Marker({ k, x, y, current }: { k: number; x: number; y: number; current: boolean }) {
  const cls = current ? 'space-chart__mark space-chart__mark--now' : 'space-chart__mark';
  if (k === 1) return <rect className={cls} x={f1(x - 3)} y={f1(y - 3)} width={6} height={6} />;
  if (k === 2) return <path className={cls} d={`M${f1(x)} ${f1(y - 3.6)}L${f1(x + 3.4)} ${f1(y + 2.6)}H${f1(x - 3.4)}Z`} />;
  return <circle className={cls} cx={f1(x)} cy={f1(y)} r={3.2} />;
}

export function TryChart({ rows, vary, ys, current }: { rows: readonly TableRow[]; vary: SimControl; ys: readonly SimOutput[]; current: SimValue | undefined }) {
  const t = useT();
  const { locale } = useSceneContext();
  const m = chartModel(rows, vary, ys, current);
  if (!m) return null;
  const pw = W - PAD.l - PAD.r;
  const ph = H - PAD.t - PAD.b;
  const sx = (x: number) => (m.kind === 'line' ? PAD.l + ((x - m.x[0]) / (m.x[1] - m.x[0] || 1)) * pw : PAD.l + ((x + 0.5) / m.ticks.length) * pw);
  const sy = (y: number) => PAD.t + ph - (Math.max(0, y) / m.yMax) * ph;
  const yTicks: number[] = [];
  for (let v = 0; v <= m.yMax + 1e-9; v += m.yStep) yTicks.push(Number(v.toPrecision(12)));
  const yDec = Math.max(0, ...yTicks.map((v) => (String(v).split('.')[1] ?? '').length));
  const unit = ys[0]!.format === 'time' ? undefined : ys[0]!.unit;
  const yTitle = `${ys.map((o) => tx(o.label, locale)).join(' · ')}${unit ? ` (${unit})` : ''}`;
  const xTitle = `${tx(vary.label, locale)}${vary.kind === 'step' && vary.unit && vary.format !== 'time' ? ` (${vary.unit})` : ''}`;
  const label = chartSummary(m, {
    locale,
    x: tx(vary.label, locale),
    xText: (v) => valueText(vary, v, locale),
    ...(vary.kind === 'step' && vary.format === 'time' ? { xDeltaText: (v: number) => `${v} ${locale === 'zh' ? '小时' : 'h'}` } : {}),
    y: (o) => tx(o.label, locale),
    yText: (o, v) => `${outputText(o, v, locale)}${o.unit && o.format !== 'time' ? ` ${o.unit}` : ''}`,
  });
  const slot = pw / m.ticks.length;
  const barW = (slot * 0.56) / ys.length;
  return (
    <figure className="space-chart" data-kind={m.kind}>
      <figcaption className="space-chart__title">
        {t('space.try.chart')}
        {ys.length > 1 &&
          ys.map((o, k) => (
            <span key={o.id} className="space-chart__key" data-series={k}>
              <svg width="14" height="8" aria-hidden="true">
                {m.kind === 'bar' ? <rect className="space-chart__bar" data-series={k} x="2" y="0" width="10" height="8" /> : <path className="space-chart__line" strokeDasharray={DASH[k] || undefined} d="M0 4h14" />}
              </svg>
              {tx(o.label, locale)}
            </span>
          ))}
      </figcaption>
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={label} className="space-chart__svg">
        <text className="space-chart__axis-title" x={PAD.l - 30} y={11}>
          {yTitle}
        </text>
        {yTicks.map((v) => (
          <g key={v}>
            <path className={v === 0 ? 'space-chart__axis' : 'space-chart__grid'} d={`M${PAD.l} ${f1(sy(v))}H${W - PAD.r}`} />
            <text className="space-chart__tick" x={PAD.l - 5} y={f1(sy(v) + 3)} textAnchor="end">
              {v.toFixed(yDec)}
            </text>
          </g>
        ))}
        <path className="space-chart__axis" d={`M${PAD.l} ${PAD.t - 4}V${PAD.t + ph}`} />
        {m.ticks.map((v, i) => {
          const x = m.kind === 'line' ? sx(v as number) : sx(i);
          const time = vary.kind === 'step' && vary.format === 'time';
          const text = time ? timeText(Number(v), locale, true) : m.kind === 'line' ? String(v) : valueText(vary, v, locale);
          const show = !time || m.ticks.length <= 6 || i % 2 === 0;
          return (
            <g key={String(v)}>
              <path className="space-chart__axis" d={`M${f1(x)} ${PAD.t + ph}v4`} />
              <text className="space-chart__tick" x={f1(x)} y={PAD.t + ph + 14} textAnchor="middle">
                {show ? text : ''}
              </text>
            </g>
          );
        })}
        <text className="space-chart__axis-title" x={PAD.l + pw / 2} y={H - 4} textAnchor="middle">
          {xTitle}
        </text>
        {m.kind === 'line'
          ? m.series.map((s, k) => (
              <g key={s.output.id} data-series={s.output.id}>
                <polyline
                  className="space-chart__line"
                  strokeDasharray={DASH[k] || undefined}
                  points={s.points.map((p) => `${f1(sx(p.x))},${f1(sy(p.y))}`).join(' ')}
                />
                {s.points.map((p) => (
                  <Marker key={String(p.key)} k={k} x={sx(p.x)} y={sy(p.y)} current={p.current} />
                ))}
              </g>
            ))
          : m.series.map((s, k) =>
              s.points.map((p) => {
                const x = PAD.l + p.x * slot + slot * 0.22 + k * barW;
                const y = sy(p.y);
                return (
                  <g key={`${s.output.id}-${String(p.key)}`} data-series={s.output.id}>
                    <rect
                      className={p.current ? 'space-chart__bar space-chart__bar--now' : 'space-chart__bar'}
                      data-series={k}
                      x={f1(x)}
                      y={f1(y)}
                      width={f1(barW - (ys.length > 1 ? 1 : 0))}
                      height={f1(PAD.t + ph - y)}
                    />
                    <text className="space-chart__value" x={f1(x + barW / 2)} y={f1(y - 3)} textAnchor="middle">
                      {formatReading(p.y, outputDecimals(s.output))}
                    </text>
                  </g>
                );
              }),
            )}
      </svg>
    </figure>
  );
}
