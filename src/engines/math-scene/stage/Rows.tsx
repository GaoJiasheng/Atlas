/**
 * Stacked wholes for comparing (docs/15 §4.3): the fraction wall (rows of unit
 * fractions under one whole) and bar rows (two or more bars, each one whole
 * long unless a picture says otherwise). The first amount is cold, the second
 * hot; "Make same-size parts" re-cuts every row into the shared parts; a row
 * can be the answer ("tap the greater one"). A hairline at the end of each
 * amount lines them up.
 */
import type { KeyboardEvent } from 'react';
import type { Locale } from '../../core/types';
import { t } from '../../../i18n';
import { fractionWords } from '../lib/words';
import { SvgFrac } from './svg';

export interface RowSpec {
  parts: number;
  /** Parts filled from the left. */
  filled: number;
  tone?: 'cold' | 'hot' | 'mine' | null;
  /** Length relative to the whole (a smaller whole). */
  length?: number;
  /** The compare side this row is, when it can be picked. */
  side?: 'a' | 'b';
  /** Unit-fraction label in each cell (fraction wall). */
  unitLabels?: boolean;
}

export interface RowsProps {
  x: number;
  y: number;
  w: number;
  rowH: number;
  gap: number;
  rows: RowSpec[];
  /** Shared parts per whole after "Make same-size parts" (`null` = as drawn). */
  common?: number | null;
  onPick?(side: 'a' | 'b'): void;
  picked?: 'a' | 'b' | null;
  ghostSide?: 'a' | 'b' | null;
  /** Hairlines at the end of each filled amount. */
  align?: boolean;
  /** Labels each row with its fraction at the left. */
  rowLabels?: boolean;
  label: string;
  locale: Locale;
}

export function Rows(p: RowsProps) {
  const pickable = !!p.onPick;
  const key = (side: 'a' | 'b') => (e: KeyboardEvent<SVGGElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      p.onPick?.(side);
    }
  };
  const ends: number[] = [];
  return (
    <g className="ms-rows" role="group" aria-label={p.label}>
      {p.rows.map((r, k) => {
        const y = p.y + k * (p.rowH + p.gap);
        const len = p.w * (r.length ?? 1);
        const cut = p.common && p.common % r.parts === 0 ? p.common : r.parts;
        const scale = cut / r.parts;
        const filled = r.filled * scale;
        if (r.tone && r.filled > 0) ends.push(p.x + (len * r.filled) / r.parts);
        const name = r.parts === 1 ? '1' : fractionWords({ n: r.filled, d: r.parts }, p.locale);
        const picked = r.side !== undefined && p.picked === r.side;
        const body = (
          <>
            {Array.from({ length: cut }, (_, i) => (
              <rect key={i} className="ms-part__shape" data-mark={i < filled ? (r.tone ?? undefined) : undefined} x={p.x + (i / cut) * len} y={y} width={len / cut} height={p.rowH} />
            ))}
            {scale > 1 &&
              Array.from({ length: r.parts - 1 }, (_, j) => (
                <line key={`o${j}`} className="ms-rows__orig" x1={p.x + ((j + 1) / r.parts) * len} x2={p.x + ((j + 1) / r.parts) * len} y1={y} y2={y + p.rowH} />
              ))}
            <rect className="ms-outline" x={p.x} y={y} width={len} height={p.rowH} />
            {r.unitLabels &&
              len / r.parts >= 30 &&
              Array.from({ length: r.parts }, (_, i) =>
                r.parts === 1 ? (
                  <text key={`u${i}`} className="ms-rows__unit" x={p.x + len / 2} y={y + p.rowH / 2 + 4} textAnchor="middle">1</text>
                ) : (
                  <SvgFrac key={`u${i}`} cx={p.x + ((i + 0.5) / r.parts) * len} cy={y + p.rowH / 2 - 2} n={1} d={r.parts} size={Math.min(12, p.rowH / 3)} className="ms-rows__unitfrac" />
                ),
              )}
            {p.rowLabels && r.parts > 1 && <SvgFrac cx={p.x - 26} cy={y + p.rowH / 2 - 3} n={r.filled} d={r.parts} size={13} className="ms-rows__label" />}
            {picked && <rect className="ms-rows__picked" x={p.x - 5} y={y - 5} width={len + 10} height={p.rowH + 10} />}
            {p.ghostSide && r.side === p.ghostSide && <rect className="ms-ghost__part" x={p.x - 8} y={y - 8} width={len + 16} height={p.rowH + 16} />}
          </>
        );
        if (pickable && r.side) {
          return (
            <g
              key={k}
              className="ms-rows__row"
              role="button"
              tabIndex={0}
              aria-pressed={picked}
              aria-label={t(p.locale, 'math.row.pick', { name })}
              data-side={r.side}
              onClick={() => p.onPick?.(r.side!)}
              onKeyDown={key(r.side)}
            >
              <rect className="ms-rows__hit" x={p.x - 6} y={y - Math.max(0, (44 - p.rowH) / 2)} width={len + 12} height={Math.max(44, p.rowH)} />
              {body}
            </g>
          );
        }
        return (
          <g key={k} aria-label={name}>
            {body}
          </g>
        );
      })}
      {p.align &&
        ends.map((x, i) => (
          <line key={`a${i}`} className="ms-rows__align" x1={x} x2={x} y1={p.y - 10} y2={p.y + p.rows.length * (p.rowH + p.gap)} aria-hidden="true" />
        ))}
    </g>
  );
}
