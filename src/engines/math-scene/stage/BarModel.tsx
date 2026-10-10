/**
 * Bar model (docs/15 §4.3): one whole (or 2–3 wholes stacked) as a strip of
 * equal parts — or the unequal / diagonal cuts of a picture option — drawn as
 * line art of its object (toast, kueh, chocolate …). Parts are tappable,
 * draggable and keyboard-reachable buttons. Marks: the child's shading
 * (signal), given parts (cold, or hot for a second amount), parts taken away
 * (ink hatch + strike), and the "Show me" answer as a dashed ink outline.
 * Options: L labels each part 1/n, E draws finer equivalent cuts beneath,
 * N an aligned number line; folds leave creases and animate.
 */
import { useId } from 'react';
import type { Locale } from '../../core/types';
import { t } from '../../../i18n';
import { fractionWords } from '../lib/words';
import { DimLine, ObjectDetail, objectPath, SvgFrac, useParts, type BarObject } from './svg';

export interface BarGhost {
  parts: number;
  marked: number[];
}

export interface BarModelProps {
  defs: string;
  x: number;
  y: number;
  w: number;
  /** Height of one whole. */
  h: number;
  parts: number;
  wholes?: number;
  cuts?: number[];
  diagonal?: boolean;
  object?: BarObject;
  shaded?: number[];
  given?: number[];
  crossed?: number[];
  givenTone?: 'cold' | 'hot';
  mode?: 'shade' | 'cross' | 'none';
  onToggle?(i: number): void;
  ghost?: BarGhost | null;
  labels?: boolean;
  /** Dimension line over the whole ("1 whole"); `null` = none. */
  dim?: string | null;
  folds?: number;
  equivalent?: boolean;
  numberline?: boolean;
  /** The child's marks get a fine hatch too (a given or second amount shares the model). */
  hatchMine?: boolean;
  /** Example pointer over part i. */
  pointer?: number | null;
  label: string;
  locale: Locale;
}

/** Vertical gap between stacked wholes. */
export const WHOLE_GAP = 18;
/** Height under the bar taken by the E and N overlays. */
export const EQUIV_ROW = 22;
export const LINE_ROW = 34;

/** Left edges of the parts as fractions of the length. */
function edges(parts: number, cuts?: number[]): number[] {
  if (cuts && cuts.length) return [0, ...[...cuts].sort((a, b) => a - b), 1];
  return Array.from({ length: parts + 1 }, (_, i) => i / parts);
}

export function BarModel(p: BarModelProps) {
  const wholes = p.wholes ?? 1;
  const shaded = p.shaded ?? [];
  const given = p.given ?? [];
  const crossed = p.crossed ?? [];
  const mode = p.mode ?? 'none';
  const parts = p.cuts?.length ? p.cuts.length + 1 : p.diagonal ? 2 : p.parts;
  const total = parts * wholes;
  const ed = edges(parts, p.cuts);
  const zh = p.locale === 'zh';

  const geom = (i: number) => {
    const whole = Math.floor(i / parts);
    const j = i % parts;
    const y = p.y + whole * (p.h + WHOLE_GAP);
    const x0 = p.x + ed[j]! * p.w;
    const x1 = p.x + ed[j + 1]! * p.w;
    return { x: x0, y, w: x1 - x0, h: p.h, whole };
  };
  const shape = (i: number) => {
    const g = geom(i);
    if (p.diagonal) {
      const { x, y } = { x: p.x, y: p.y };
      return i === 0 ? `M${x} ${y}H${x + p.w}L${x} ${y + p.h}Z` : `M${x + p.w} ${y}V${y + p.h}H${x}Z`;
    }
    return `M${g.x} ${g.y}h${g.w}v${g.h}h${-g.w}Z`;
  };
  const isMarked = (i: number) => (mode === 'cross' ? crossed.includes(i) : shaded.includes(i));
  const { container, part } = useParts({
    count: total,
    marked: isMarked,
    toggle: (i) => p.onToggle?.(i),
    locked: (i) => (mode === 'cross' ? !given.includes(i) : given.includes(i)),
    enabled: mode !== 'none' && !!p.onToggle,
  });
  // One clip path per whole and per model (several models share a stage: picture options).
  const uid = useId().replace(/[^a-z0-9]/gi, '');
  const clip = (k: number) => `${p.defs}-clip-${uid}-${k}`;
  const partLabel = (i: number) => {
    const state = crossed.includes(i) ? t(p.locale, 'math.part.taken') : given.includes(i) ? t(p.locale, 'math.part.given') : shaded.includes(i) ? t(p.locale, 'math.part.shaded') : t(p.locale, 'math.part.empty');
    return t(p.locale, 'math.part.label', { n: (i % parts) + 1, d: parts, state }) + (wholes > 1 ? ` · ${t(p.locale, 'math.part.whole', { n: Math.floor(i / parts) + 1 })}` : '');
  };

  const wholesBoxes = Array.from({ length: wholes }, (_, k) => ({ x: p.x, y: p.y + k * (p.h + WHOLE_GAP), w: p.w, h: p.h }));
  const below = p.y + wholes * p.h + (wholes - 1) * WHOLE_GAP;
  const value = { n: shaded.length + given.length - crossed.length, d: parts };

  return (
    <g className="ms-bar" role="group" aria-label={`${p.label}. ${fractionWords(value, p.locale)}`} data-keys={mode !== 'none' ? 'arrows' : undefined} {...container}>
      <defs>
        {wholesBoxes.map((b, k) => (
          <clipPath key={k} id={clip(k)}>
            <path d={objectPath(p.object, b.x, b.y, b.w, b.h)} />
          </clipPath>
        ))}
      </defs>
      {p.dim && wholes === 1 && <DimLine x1={p.x} x2={p.x + p.w} y={p.y - 16} label={p.dim} defs={p.defs} />}
      {p.dim && wholes > 1 && wholesBoxes.map((b, k) => <text key={`w${k}`} className="ms-whole-no" x={b.x - 10} y={b.y + b.h / 2 + 4} textAnchor="end">{zh ? `第${k + 1}个` : `${k + 1}`}</text>)}
      {Array.from({ length: total }, (_, i) => {
        const g = geom(i);
        const mark = crossed.includes(i) ? 'taken' : given.includes(i) ? (p.givenTone ?? 'cold') : shaded.includes(i) ? 'mine' : undefined;
        return (
          <g key={i} className="ms-part" data-mark={mark} aria-label={partLabel(i)} {...part(i)} clipPath={`url(#${clip(g.whole)})`}>
            <path className="ms-part__shape" d={shape(i)} />
            {mark === 'mine' && p.hatchMine && <path d={shape(i)} fill={`url(#${p.defs}-fine)`} className="ms-part__hatch" />}
            {mark === 'taken' && (
              <>
                <path d={shape(i)} fill={`url(#${p.defs}-hatch)`} className="ms-part__hatch" />
                <line className="ms-part__strike" x1={g.x + 4} y1={g.y + g.h - 4} x2={g.x + g.w - 4} y2={g.y + 4} />
              </>
            )}
          </g>
        );
      })}
      {wholesBoxes.map((b, k) => (
        <g key={`o${k}`} aria-hidden="true">
          <ObjectDetail object={p.object} x={b.x} y={b.y} w={b.w} h={b.h} parts={p.cuts || p.diagonal ? 0 : parts} />
          <path className="ms-outline" d={objectPath(p.object, b.x, b.y, b.w, b.h)} />
        </g>
      ))}
      {p.folds !== undefined && p.folds > 0 && (
        <g className="ms-creases" aria-hidden="true">
          {Array.from({ length: parts - 1 }, (_, j) => {
            const x = p.x + ((j + 1) / parts) * p.w;
            return <line key={j} x1={x} x2={x} y1={p.y - 6} y2={p.y + p.h + 6} />;
          })}
          <rect key={`fold-${p.folds}`} className="ms-fold-flap" x={p.x + p.w / 2} y={p.y} width={p.w / 2} height={p.h} />
        </g>
      )}
      {p.labels &&
        !p.cuts &&
        !p.diagonal &&
        p.w / parts >= 26 &&
        Array.from({ length: total }, (_, i) => {
          const g = geom(i);
          return <SvgFrac key={`lab${i}`} cx={g.x + g.w / 2} cy={g.y + g.h / 2 - 3} n={1} d={parts} size={Math.min(14, g.w / 3)} className="ms-part-label" />;
        })}
      {p.ghost && <BarGhostLayer {...p} ghost={p.ghost} wholes={wholes} />}
      {p.pointer !== null && p.pointer !== undefined && p.pointer < total && (
        <circle className="ms-pointer" cx={geom(p.pointer).x + geom(p.pointer).w / 2} cy={geom(p.pointer).y + p.h / 2} r={Math.min(18, p.h / 3)} />
      )}
      {p.equivalent && wholes === 1 && !p.cuts && !p.diagonal && <EquivalentRows x={p.x} y={below + 10} w={p.w} parts={parts} count={value.n} locale={p.locale} />}
      {p.numberline && wholes === 1 && !p.cuts && !p.diagonal && <AlignedLine x={p.x} y={below + (p.equivalent ? 2 * EQUIV_ROW + 14 : 14)} w={p.w} parts={parts} />}
    </g>
  );
}

function BarGhostLayer(p: BarModelProps & { ghost: BarGhost; wholes: number }) {
  const { ghost } = p;
  const per = ghost.parts;
  return (
    <g className="ms-ghost" aria-hidden="true">
      {Array.from({ length: p.wholes }, (_, k) =>
        Array.from({ length: per - 1 }, (_, j) => {
          const x = p.x + ((j + 1) / per) * p.w;
          const y = p.y + k * (p.h + WHOLE_GAP);
          return <line key={`${k}-${j}`} className="ms-ghost__cut" x1={x} x2={x} y1={y} y2={y + p.h} />;
        }),
      )}
      {ghost.marked.map((i) => {
        const k = Math.floor(i / per);
        const j = i % per;
        return <rect key={i} className="ms-ghost__part" x={p.x + (j / per) * p.w + 3} y={p.y + k * (p.h + WHOLE_GAP) + 3} width={p.w / per - 6} height={p.h - 6} />;
      })}
    </g>
  );
}

/** E: the same amount cut finer (×2, ×3 while ≤ 12 parts), faint, with its name. */
function EquivalentRows({ x, y, w, parts, count, locale }: { x: number; y: number; w: number; parts: number; count: number; locale: Locale }) {
  const rows = [2, 3].filter((k) => parts * k <= 12).slice(0, 2);
  return (
    <g className="ms-equiv" aria-label={t(locale, 'math.mode.equivalent')}>
      {rows.map((k, r) => {
        const n = parts * k;
        const yy = y + r * EQUIV_ROW;
        return (
          <g key={k}>
            {Array.from({ length: n }, (_, i) => (
              <rect key={i} x={x + (i / n) * w} y={yy} width={w / n} height={EQUIV_ROW - 8} data-on={i < count * k || undefined} />
            ))}
            <text x={x + w + 10} y={yy + EQUIV_ROW - 11}>{`= ${count * k}/${n}`}</text>
          </g>
        );
      })}
    </g>
  );
}

/** N: a number line under the bar, one tick per part, 0 and 1 at the ends. */
export function AlignedLine({ x, y, w, parts }: { x: number; y: number; w: number; parts: number }) {
  return (
    <g className="ms-aligned" aria-hidden="true">
      <line x1={x} x2={x + w} y1={y} y2={y} />
      {Array.from({ length: parts + 1 }, (_, i) => (
        <line key={i} x1={x + (i / parts) * w} x2={x + (i / parts) * w} y1={y - (i === 0 || i === parts ? 7 : 4)} y2={y + (i === 0 || i === parts ? 7 : 4)} />
      ))}
      <text x={x} y={y + 20} textAnchor="middle">0</text>
      <text x={x + w} y={y + 20} textAnchor="middle">1</text>
    </g>
  );
}
