/**
 * Circle model (docs/15 §4.3): a whole as a disc of equal sectors from 12
 * o'clock, clockwise — plain, a prata (flaky rings) or a cake. Same marks,
 * tap / drag / keyboard paths and "Show me" outline as the bar.
 */
import type { Locale } from '../../core/types';
import { t } from '../../../i18n';
import { fractionWords } from '../lib/words';
import { SvgFrac, useParts } from './svg';

export interface CircleModelProps {
  defs: string;
  cx: number;
  cy: number;
  r: number;
  parts: number;
  shaded?: number[];
  given?: number[];
  crossed?: number[];
  givenTone?: 'cold' | 'hot';
  object?: 'plain' | 'prata' | 'cake';
  mode?: 'shade' | 'cross' | 'none';
  onToggle?(i: number): void;
  ghost?: { parts: number; marked: number[] } | null;
  labels?: boolean;
  hatchMine?: boolean;
  pointer?: number | null;
  label: string;
  locale: Locale;
}

const polar = (cx: number, cy: number, r: number, turn: number): [number, number] => [cx + r * Math.sin(turn * 2 * Math.PI), cy - r * Math.cos(turn * 2 * Math.PI)];

function sector(cx: number, cy: number, r: number, i: number, n: number): string {
  if (n === 1) return `M${cx - r} ${cy}a${r} ${r} 0 1 0 ${2 * r} 0a${r} ${r} 0 1 0 ${-2 * r} 0Z`;
  const [x0, y0] = polar(cx, cy, r, i / n);
  const [x1, y1] = polar(cx, cy, r, (i + 1) / n);
  const large = 1 / n > 0.5 ? 1 : 0;
  return `M${cx} ${cy}L${x0} ${y0}A${r} ${r} 0 ${large} 1 ${x1} ${y1}Z`;
}

export function CircleModel(p: CircleModelProps) {
  const shaded = p.shaded ?? [];
  const given = p.given ?? [];
  const crossed = p.crossed ?? [];
  const mode = p.mode ?? 'none';
  const { container, part } = useParts({
    count: p.parts,
    marked: (i) => (mode === 'cross' ? crossed.includes(i) : shaded.includes(i)),
    toggle: (i) => p.onToggle?.(i),
    locked: (i) => (mode === 'cross' ? !given.includes(i) : given.includes(i)),
    enabled: mode !== 'none' && !!p.onToggle,
  });
  const value = { n: shaded.length + given.length - crossed.length, d: p.parts };
  const state = (i: number) =>
    crossed.includes(i) ? t(p.locale, 'math.part.taken') : given.includes(i) ? t(p.locale, 'math.part.given') : shaded.includes(i) ? t(p.locale, 'math.part.shaded') : t(p.locale, 'math.part.empty');
  return (
    <g className="ms-circle" role="group" aria-label={`${p.label}. ${fractionWords(value, p.locale)}`} data-keys={mode !== 'none' ? 'arrows' : undefined} {...container}>
      {Array.from({ length: p.parts }, (_, i) => {
        const mark = crossed.includes(i) ? 'taken' : given.includes(i) ? (p.givenTone ?? 'cold') : shaded.includes(i) ? 'mine' : undefined;
        const d = sector(p.cx, p.cy, p.r, i, p.parts);
        const [mx, my] = polar(p.cx, p.cy, p.r * 0.62, (i + 0.5) / p.parts);
        return (
          <g key={i} className="ms-part" data-mark={mark} aria-label={t(p.locale, 'math.part.label', { n: i + 1, d: p.parts, state: state(i) })} {...part(i)}>
            <path className="ms-part__shape" d={d} />
            {mark === 'mine' && p.hatchMine && <path d={d} fill={`url(#${p.defs}-fine)`} className="ms-part__hatch" />}
            {mark === 'taken' && (
              <>
                <path d={d} fill={`url(#${p.defs}-hatch)`} className="ms-part__hatch" />
                <line className="ms-part__strike" x1={mx - 10} y1={my + 10} x2={mx + 10} y2={my - 10} />
              </>
            )}
          </g>
        );
      })}
      <g aria-hidden="true">
        {p.object === 'prata' && (
          <>
            <circle className="ms-detail" cx={p.cx} cy={p.cy} r={p.r * 0.82} strokeDasharray="10 7" />
            <circle className="ms-detail" cx={p.cx} cy={p.cy} r={p.r * 0.55} strokeDasharray="6 9" />
          </>
        )}
        {p.object === 'cake' && <circle className="ms-detail" cx={p.cx} cy={p.cy} r={p.r * 0.9} />}
        <circle className="ms-outline" cx={p.cx} cy={p.cy} r={p.r} />
      </g>
      {p.labels &&
        p.parts > 1 &&
        Array.from({ length: p.parts }, (_, i) => {
          const [x, y] = polar(p.cx, p.cy, p.r * 0.66, (i + 0.5) / p.parts);
          return <SvgFrac key={`l${i}`} cx={x} cy={y - 3} n={1} d={p.parts} size={Math.min(14, (p.r * 2.4) / p.parts)} className="ms-part-label" />;
        })}
      {p.ghost && (
        <g className="ms-ghost" aria-hidden="true">
          {Array.from({ length: p.ghost.parts }, (_, i) => {
            const [x, y] = polar(p.cx, p.cy, p.r, i / p.ghost!.parts);
            return <line key={`c${i}`} className="ms-ghost__cut" x1={p.cx} y1={p.cy} x2={x} y2={y} />;
          })}
          {p.ghost.marked.map((i) => (
            <path key={i} className="ms-ghost__part" d={sector(p.cx, p.cy, p.r - 4, i, p.ghost!.parts)} />
          ))}
        </g>
      )}
      {p.pointer !== null && p.pointer !== undefined && p.pointer < p.parts && (
        <circle className="ms-pointer" cx={polar(p.cx, p.cy, p.r * 0.6, (p.pointer + 0.5) / p.parts)[0]} cy={polar(p.cx, p.cy, p.r * 0.6, (p.pointer + 0.5) / p.parts)[1]} r={Math.min(18, p.r / 4)} />
      )}
    </g>
  );
}
