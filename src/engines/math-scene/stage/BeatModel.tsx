/**
 * An explanation beat on the stage (docs/15 §10): the beat's model — a bar
 * (one whole, several wholes, or rows stacked for comparing), a circle, a
 * number line, the fraction wall or a model drawing — drawn read-only in the
 * free rectangle, with the beat's overlays (labels, equivalent cuts, an
 * aligned number line, the big symbol) on top of the reader's own S / E / N /
 * L modes. The transition from the previous beat is the wrapper's
 * `data-move` (math-scene.css): a structural change (another kind, other
 * parts) remounts the drawing with that move's entry animation; a change of
 * marks keeps it and the parts' fills ease.
 */
import type { Locale } from '../../core/types';
import { t, tx } from '../../../i18n';
import type { Beat } from '../schema';
import { toImproper, toMixed, valueOnLine, type Frac } from '../lib/fraction';
import type { Rect } from './layout';
import { BarModel, EQUIV_ROW, LINE_ROW, WHOLE_GAP } from './BarModel';
import { CircleModel } from './CircleModel';
import { NumberLine, type LinePoint } from './NumberLine';
import { Rows, type RowSpec } from './Rows';
import { BarModelDiagram } from './BarModelDiagram';
import { SvgFrac } from './svg';
import { GridModel } from './GridModel';
import type { DisplayModes } from './Stage';

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
const indices = (set: number | number[] | undefined): number[] => (set === undefined ? [] : Array.isArray(set) ? [...set] : Array.from({ length: set }, (_, i) => i));

/** What changes the drawing's structure (a new key remounts it with the move's entry animation). */
export function beatShape(beat: Beat): string {
  const m = beat.model;
  switch (m.kind) {
    case 'bar':
      return `bar|${m.parts}|${m.wholes ?? 1}|${m.cuts?.join(',') ?? ''}|${m.diagonal ? 'd' : ''}|${m.rows?.map((r) => r.parts).join(',') ?? ''}`;
    case 'circle':
      return `circle|${m.parts}`;
    case 'numberline':
      return `line|${m.from}|${m.to}|${m.intervals}`;
    case 'wall':
      return `wall|${m.rows.join(',')}`;
    case 'barmodel':
      return `barmodel|${m.bars.map((b) => b.id).join(',')}`;
    case 'grid':
      // Squares laid, sides walked, dimensions and highlights change in place; new figures, a cut or another scale remount.
      return `grid|${m.unit}|${m.show}|${JSON.stringify(m.figures.map((f) => [f.rect, f.rects, f.cells, f.poly, f.halves]))}|${JSON.stringify(m.cuts ?? [])}|${m.apart ? 'apart' : ''}`;
  }
}

/** The amount the beat's single bar or circle shows (given + shaded − crossed over the parts). */
function beatValue(beat: Beat): Frac | null {
  const m = beat.model;
  if (m.kind !== 'bar' && m.kind !== 'circle') return null;
  if (m.kind === 'bar' && (m.rows || m.cuts || m.diagonal || !m.parts)) return null;
  const count = indices(m.given).length + indices(m.shaded).length - indices(beat.crossed).length;
  return count > 0 ? { n: count, d: m.parts! } : null;
}

export function BeatModel({ beat, box, defs, modes, locale }: { beat: Beat; box: Rect; defs: string; modes: DisplayModes; locale: Locale }) {
  const m = beat.model;
  const o = beat.overlay ?? {};
  const labels = !!o.labels || modes.labels;
  const label = tx(beat.caption, locale).replace(/\{([^}]*)\}/g, '$1');
  const symbol = (!!o.symbol || modes.symbol) && box.w > 480;
  const area: Rect = symbol ? { ...box, w: box.w - 120 } : box;
  const cx = area.x + area.w / 2;
  const cy = area.y + area.h / 2;
  const value = beatValue(beat);
  const sym = (y: number) => {
    if (!symbol || !value) return null;
    const v = toImproper(value).n > value.d ? toMixed(value) : value;
    return <SvgFrac cx={area.x + area.w + 60} cy={y} n={v.n} d={v.d} w={v.w} size={34} className="ms-symbol" />;
  };

  if (m.kind === 'grid') return <GridModel defs={defs} box={box} model={m} locale={locale} label={label} />;

  if (m.kind === 'wall') {
    const lit = beat.highlight ?? [];
    const rows: RowSpec[] = m.rows.map((d) => {
      const k = lit.findIndex((f) => toImproper(f).d === d);
      return k < 0 ? { parts: d, filled: 0, unitLabels: true } : { parts: d, filled: toImproper(lit[k]!).n, tone: k === 1 && lit.length === 2 ? 'hot' : 'cold', unitLabels: true };
    });
    const w = clamp(area.w - 60, 220, 820);
    const rowH = clamp((area.h - 20) / rows.length - 10, 22, 46);
    return <Rows x={cx - w / 2} y={cy - (rows.length * (rowH + 10)) / 2} w={w} rowH={rowH} gap={10} rows={rows} align label={label} locale={locale} />;
  }

  if (m.kind === 'bar' && m.rows) {
    const rows: RowSpec[] = m.rows.map((r, i) => ({ parts: r.parts ?? 1, filled: indices(r.given).length, tone: i === 0 ? 'cold' : 'hot', length: r.length }));
    const w = clamp(area.w - 90, 220, 820);
    const rowH = clamp(area.h / 5, 36, 74);
    return <Rows x={cx - w / 2 + 20} y={cy - rowH - 12} w={w} rowH={rowH} gap={24} rows={rows} rowLabels align label={label} locale={locale} />;
  }

  if (m.kind === 'barmodel') {
    const w = clamp(area.w - 20, 260, 920);
    const barH = clamp(area.h / (m.bars.length * 2.4), 34, 56);
    const total = 30 + m.bars.length * (barH + 44);
    return <BarModelDiagram defs={defs} spec={m} x={cx - w / 2} y={Math.max(area.y + 20, cy - total / 2)} w={w} barH={barH} units={!!o.equivalent && !!m.units} label={label} locale={locale} />;
  }

  if (m.kind === 'numberline') {
    const w = clamp(area.w - 80, 240, 900);
    const points: LinePoint[] = (m.marks ?? []).flatMap((f) => {
      const pos = valueOnLine(f, m);
      return pos === null ? [] : [{ pos, label: f, tone: 'cold' as const }];
    });
    return (
      <NumberLine
        defs={defs}
        x={cx - w / 2}
        y={cy + (m.withBar ? 30 : 10)}
        w={w}
        from={m.from}
        to={m.to}
        intervals={m.intervals}
        labels={m.labels}
        arrow={m.arrow ? valueOnLine(m.arrow, m) : null}
        points={points}
        withBar={m.withBar}
        tickLabels={labels}
        label={label}
        locale={locale}
      />
    );
  }

  if (m.kind === 'circle') {
    const r = clamp(Math.min(area.w, area.h - 30) / 2 - 8, 46, 180);
    return (
      <g>
        <CircleModel defs={defs} cx={cx} cy={cy} r={r} parts={m.parts} given={indices(m.given)} shaded={indices(m.shaded)} crossed={indices(beat.crossed)} object={m.object} labels={labels} hatchMine={indices(m.given).length > 0} label={label} locale={locale} />
        {sym(cy)}
      </g>
    );
  }

  const wholes = m.wholes ?? 1;
  const equivalent = !!o.equivalent || modes.equivalent;
  const numberline = !!o.numberline || modes.numberline;
  const extras = 34 + (equivalent ? 2 * EQUIV_ROW + 12 : 0) + (numberline ? LINE_ROW + 12 : 0);
  const h = clamp((area.h - extras - (wholes - 1) * WHOLE_GAP) / wholes, 46, wholes > 1 ? 84 : 116);
  const w = clamp(area.w - 60, 220, 900);
  const total = wholes * h + (wholes - 1) * WHOLE_GAP + extras;
  const y = cy - total / 2 + 34;
  return (
    <g>
      <BarModel
        defs={defs}
        x={cx - w / 2}
        y={y}
        w={w}
        h={h}
        parts={m.parts ?? 1}
        wholes={wholes}
        cuts={m.cuts}
        diagonal={m.diagonal}
        object={m.object}
        given={indices(m.given)}
        shaded={indices(m.shaded)}
        crossed={indices(beat.crossed)}
        labels={labels}
        dim={t(locale, 'math.whole')}
        equivalent={equivalent}
        numberline={numberline}
        hatchMine={indices(m.given).length > 0}
        label={label}
        locale={locale}
      />
      {sym(y + h / 2)}
    </g>
  );
}

/** The fraction the card and the plate show for a beat (its bar / circle, else its last lit or marked fraction). */
export function beatFraction(beat: Beat): Frac | null {
  const m = beat.model;
  // Two lit rows are a comparison (the card shows the pair); more are equivalents or an order (the first names them).
  if (m.kind === 'wall') return beat.highlight && beat.highlight.length !== 2 ? beat.highlight[0]! : null;
  if (m.kind === 'numberline') return m.marks?.at(-1) ?? m.arrow ?? null;
  if (m.kind === 'bar' && m.rows) return { n: indices(m.rows[0]!.given).length, d: m.rows[0]!.parts ?? 1 };
  return beatValue(beat);
}

/** The two fractions a beat compares (a wall with two lit rows, or two stacked bars), for the card's `a ○ b`; `open` while the beat's sentence still asks (○). */
export function beatPair(beat: Beat): { a: Frac; b: Frac; open: boolean } | null {
  const m = beat.model;
  const open = beat.equation?.includes('○') ?? false;
  // A sum or a difference written on stacked bars is not a comparison.
  if (/[+−]/.test(beat.equation ?? '')) return null;
  if (m.kind === 'wall' && beat.highlight?.length === 2) return { a: beat.highlight[0]!, b: beat.highlight[1]!, open };
  if (m.kind === 'bar' && m.rows?.length === 2) {
    const f = (r: { given?: number | number[]; parts: number | null }): Frac => ({ n: indices(r.given).length, d: r.parts ?? 1 });
    return { a: f(m.rows[0]!), b: f(m.rows[1]!), open };
  }
  return null;
}

/** The plate's counts for a beat: parts in all, parts marked (given + shaded − crossed). */
export function beatCounts(beat: Beat): { parts: number | null; marked: number | null } {
  const m = beat.model;
  if (m.kind === 'grid') return { parts: null, marked: null };
  if (m.kind === 'bar' && !m.rows) {
    const parts = (m.cuts ? m.cuts.length + 1 : m.diagonal ? 2 : (m.parts ?? 1)) * (m.wholes ?? 1);
    return { parts, marked: indices(m.given).length + indices(m.shaded).length - indices(beat.crossed).length };
  }
  if (m.kind === 'circle') return { parts: m.parts, marked: indices(m.given).length + indices(m.shaded).length - indices(beat.crossed).length };
  if (m.kind === 'numberline') return { parts: m.intervals * (m.to - m.from), marked: null };
  return { parts: null, marked: null };
}
