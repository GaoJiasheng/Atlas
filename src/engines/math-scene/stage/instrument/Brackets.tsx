/**
 * Dimension brackets beside a scale (docs/32 §3.2 `brackets`, the grid's
 * `dims` grammar): a hairline with arrowheads from one value to the next and
 * its label, the parts of a compound measure end to end ("the two stretches
 * on the number line": 1 m and 32 cm).
 */
import type { Locale } from '../../../core/types';
import { tx } from '../../../../i18n';
import { plainText } from '../../../../lib/rich-text';
import type { InstrumentSpec } from '../../schema';
import type { Track } from './geometry';

/** Brackets at `offset` px from the track, on the side away from its marks (or across a vertical strip: `side` px to its right). */
export function Brackets({ s, track, offset, defs, locale }: { s: InstrumentSpec; track: Track; offset: number; defs: string; locale: Locale }) {
  if (!s.brackets?.length) return null;
  return (
    <g className="ms-inst__brackets" aria-hidden="true">
      {s.brackets.map((b, i) => {
        const p = track.at(b.from.units);
        const q = track.at(b.to.units);
        // Out from the strip: along the marks' direction for a horizontal scale (down), to the right of a vertical one.
        const vertical = Math.abs(p.nx) > 0.7;
        const dx = vertical ? offset : 0;
        const dy = vertical ? 0 : offset;
        const a = { x: p.x + dx, y: p.y + dy };
        const c = { x: q.x + dx, y: q.y + dy };
        const text = plainText(tx(b.label, locale), locale);
        const mid = { x: (a.x + c.x) / 2, y: (a.y + c.y) / 2 };
        return (
          <g key={i} className="ms-inst__bracket" data-tone={b.tone}>
            {/* Short extension lines at the bracket's ends (they stop short of the numbers beside the marks). */}
            <line className="ms-inst__ext" x1={a.x - (vertical ? 12 : 0)} y1={a.y - (vertical ? 0 : 12)} x2={a.x + (vertical ? 8 : 0)} y2={a.y + (vertical ? 0 : 8)} />
            <line className="ms-inst__ext" x1={c.x - (vertical ? 12 : 0)} y1={c.y - (vertical ? 0 : 12)} x2={c.x + (vertical ? 8 : 0)} y2={c.y + (vertical ? 0 : 8)} />
            <line x1={a.x} y1={a.y} x2={c.x} y2={c.y} markerStart={`url(#${defs}-arrow)`} markerEnd={`url(#${defs}-arrow)`} />
            <text x={vertical ? mid.x + 10 : mid.x} y={vertical ? mid.y : mid.y + 16} textAnchor={vertical ? 'start' : 'middle'} dominantBaseline="central">
              {text}
            </text>
          </g>
        );
      })}
    </g>
  );
}
