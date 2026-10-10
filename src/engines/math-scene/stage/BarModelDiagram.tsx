/**
 * Model drawing for word problems (docs/15 §4.3, S4): part–whole (one bar,
 * its segments, a brace with "?") and comparison (two bars from the same
 * start, the difference braced). Segments are cold / hot / signal / ink
 * (taken away, hatched); an unknown segment says "?". "Split into tenths"
 * draws the unit parts on every bar so the pieces can be counted.
 */
import type { Locale } from '../../core/types';
import { tx } from '../../../i18n';
import type { BarModelDiagramSpec } from '../schema';
import { toNumber } from '../lib/fraction';
import { SvgFrac } from './svg';

export interface BarModelDiagramProps {
  defs: string;
  spec: BarModelDiagramSpec;
  x: number;
  y: number;
  w: number;
  barH: number;
  /** Unit parts shown ("Split into tenths"). */
  units: boolean;
  label: string;
  locale: Locale;
}

export const DIAGRAM_LABEL_W = 96;

export function BarModelDiagram(p: BarModelDiagramProps) {
  const len = p.w - DIAGRAM_LABEL_W;
  const x0 = p.x + DIAGRAM_LABEL_W;
  const rowGap = p.barH + 44;
  return (
    <g className="ms-diagram" role="img" aria-label={p.label}>
      {p.spec.bars.map((bar, k) => {
        const y = p.y + 30 + k * rowGap;
        const blen = len * toNumber(bar.length);
        let at = 0;
        return (
          <g key={bar.id}>
            <text className="ms-diagram__name" x={p.x + DIAGRAM_LABEL_W - 12} y={y + p.barH / 2 + 5} textAnchor="end">
              {tx(bar.label, p.locale)}
            </text>
            {bar.segments.map((seg, i) => {
              const sx = x0 + at * len;
              const sw = toNumber(seg.value) * len;
              at += toNumber(seg.value);
              return (
                <g key={i} className="ms-diagram__seg" data-tone={seg.tone}>
                  <rect x={sx} y={y} width={sw} height={p.barH} />
                  {seg.tone === 'ink' && <rect x={sx} y={y} width={sw} height={p.barH} fill={`url(#${p.defs}-hatch)`} className="ms-part__hatch" />}
                  {seg.unknown ? (
                    <text className="ms-diagram__q" x={sx + sw / 2} y={y + p.barH / 2 + 7} textAnchor="middle">?</text>
                  ) : (
                    sw >= 34 && <SvgFrac cx={sx + sw / 2} cy={y + p.barH / 2 - 4} n={seg.value.n} d={seg.value.d} w={seg.value.w} size={13} className="ms-diagram__val" />
                  )}
                  {seg.label && (
                    <text className="ms-diagram__seglabel" x={sx + sw / 2} y={y + p.barH + 18} textAnchor="middle">
                      {tx(seg.label, p.locale)}
                    </text>
                  )}
                </g>
              );
            })}
            {p.units &&
              p.spec.units &&
              Array.from({ length: Math.round(p.spec.units * toNumber(bar.length)) - 1 }, (_, j) => {
                const ux = x0 + ((j + 1) / p.spec.units!) * len;
                return <line key={`u${j}`} className="ms-diagram__unit" x1={ux} x2={ux} y1={y} y2={y + p.barH} />;
              })}
            <rect className="ms-outline" x={x0} y={y} width={blen} height={p.barH} />
            {p.spec.brace?.bar === bar.id && <Brace x1={x0 + toNumber(p.spec.brace.from) * len} x2={x0 + toNumber(p.spec.brace.to) * len} y={y - 8} label={tx(p.spec.brace.label, p.locale)} />}
          </g>
        );
      })}
    </g>
  );
}

function Brace({ x1, x2, y, label }: { x1: number; x2: number; y: number; label: string }) {
  const m = (x1 + x2) / 2;
  const h = 10;
  return (
    <g className="ms-brace" aria-hidden="true">
      <path d={`M${x1} ${y}q0 ${-h} ${h} ${-h}H${m - h}q${h} 0 ${h} ${-h}q0 ${h} ${h} ${h}H${x2 - h}q${h} 0 ${h} ${h}`} />
      <text x={m} y={y - 2 * h - 6} textAnchor="middle">
        {label}
      </text>
    </g>
  );
}
