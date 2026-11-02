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
import { beatValue } from './beat-info';
import { BarModel, CircleModel, NumberLine, Rows, BarModelDiagram, ArrayModel, BlocksModel, WholeLine, DecimalGrid, PlaceValueChart, DecimalLine, MoneyModel, ClockModel, Timeline, InstrumentModel, NetModel } from './lazy-models';
import type { Locale } from '../../core/types';
import { t, tx } from '../../../i18n';
import type { Beat, DecimalLineSpec } from '../schema';
import { toImproper, toMixed, valueOnLine } from '../lib/fraction';
import type { Rect } from './layout';
import { EQUIV_ROW, LINE_ROW, WHOLE_GAP } from './bar-spacing';
import { type LinePoint } from './NumberLine';
import { type RowSpec } from './Rows';
import { SvgFrac } from './svg';
import { GridModel } from './GridModel';
import { arrayFrame } from './array-layout';
import type { DisplayModes } from './Stage';
import { plainText } from '../../../lib/rich-text';
import { layoutOf } from '../lib/array';
import { gridsOf, wholesOf } from '../lib/dgrid';
import { isDecimalModel } from '../lib/decimal-tasks';
import { type NetPlay, type NetShown } from './NetModel';

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
const indices = (set: number | number[] | undefined): number[] => (set === undefined ? [] : Array.isArray(set) ? [...set] : Array.from({ length: set }, (_, i) => i));

/** The net tools' hold on a net beat (the FOLD slider, the turns) and what the drawing reports back. */
export interface NetHold {
  fold: number | null;
  turn: number | null;
  /** The drawing at most this high (about half the stage). */
  maxH?: number;
  play?: NetPlay | null;
  onShow?(info: NetShown): void;
}

export function BeatModel({ beat, box, defs, modes, locale, net }: { beat: Beat; box: Rect; defs: string; modes: DisplayModes; locale: Locale; net?: NetHold }) {
  const m = beat.model;
  const o = beat.overlay ?? {};
  const labels = !!o.labels || modes.labels;
  const label = plainText(tx(beat.caption, locale), locale);
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
  if (m.kind === 'net') return <NetModel model={m} box={box} defs={defs} locale={locale} label={label} move={beat.move ?? null} fold={net?.fold ?? null} turn={net?.turn ?? null} maxH={net?.maxH} onShow={net?.onShow} />;
  if (m.kind === 'instrument') return <InstrumentModel model={m} box={box} defs={defs} locale={locale} label={label} move={beat.move ?? null} />;
  if (isDecimalModel(m)) {
    if (m.kind === 'decimal-grid' && beat.under) {
      const lined = gridOverLine(m, beat.under, box);
      if (lined)
        return (
          <g>
            <DecimalGrid defs={defs} box={box} model={m} locale={locale} label={label} move={beat.move ?? null} fit={lined.grid} />
            <DecimalLine defs={defs} box={box} model={beat.under as DecimalLineSpec} locale={locale} label={label} move={beat.move ?? null} frame={lined.line} />
          </g>
        );
    }
    // A second model under the first: the box is shared, the first above.
    const top: Rect = beat.under ? { ...box, h: box.h * 0.6 } : box;
    const bottom: Rect | null = beat.under ? { ...box, y: box.y + box.h * 0.62, h: box.h * 0.38 } : null;
    return (
      <g>
        <DecimalModel model={m} box={top} defs={defs} label={label} locale={locale} move={beat.move ?? null} />
        {beat.under && bottom && <DecimalModel model={beat.under} box={bottom} defs={defs} label={label} locale={locale} move={beat.move ?? null} />}
      </g>
    );
  }
  if (m.kind === 'clock' || m.kind === 'timeline') {
    // A clock and a timeline together: side by side on a wide stage (the clock first), else one above the other.
    const pair = beat.under;
    if (pair && box.w > box.h * 1.5) {
      const cw = Math.min(box.w * 0.34, box.h * 1.05);
      const clockFirst = m.kind === 'clock';
      const a: Rect = { ...box, w: cw };
      const b: Rect = { ...box, x: box.x + cw + 24, w: box.w - cw - 24 };
      return (
        <g>
          <ValueModel model={m} box={clockFirst ? a : b} defs={defs} label={label} locale={locale} move={beat.move ?? null} />
          <ValueModel model={pair} box={clockFirst ? b : a} defs={defs} label={label} locale={locale} move={beat.move ?? null} />
        </g>
      );
    }
    const top: Rect = pair ? { ...box, h: box.h * 0.58 } : box;
    return (
      <g>
        <ValueModel model={m} box={top} defs={defs} label={label} locale={locale} move={beat.move ?? null} />
        {pair && <ValueModel model={pair} box={{ ...box, y: box.y + box.h * 0.6, h: box.h * 0.4 }} defs={defs} label={label} locale={locale} move={beat.move ?? null} />}
      </g>
    );
  }
  if (m.kind === 'array' && beat.under?.kind === 'numberline' && beat.under.scale === 'whole') return <ArrayOverLine beat={beat} box={box} defs={defs} label={label} locale={locale} />;
  if (m.kind === 'array' || m.kind === 'blocks' || (m.kind === 'numberline' && m.scale === 'whole')) {
    // A second model lined up under the first (the groups and their jumps): the box is shared, the first above.
    const top: Rect = beat.under ? { ...box, h: box.h * 0.58 } : box;
    const bottom: Rect | null = beat.under ? { ...box, y: box.y + box.h * 0.6, h: box.h * 0.4 } : null;
    return (
      <g>
        <ValueModel model={m} box={top} defs={defs} label={label} locale={locale} move={beat.move ?? null} />
        {beat.under && bottom && <ValueModel model={beat.under} box={bottom} defs={defs} label={label} locale={locale} move={beat.move ?? null} />}
      </g>
    );
  }

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
        intervals={m.intervals ?? 1}
        labels={m.labels === 'tens' || m.labels === 'steps' ? 'all' : m.labels}
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

/** A decimal model, read-only: the hundred grid, the place-value chart, the decimal line, money. */
export function DecimalModel({ model: m, box, defs, label, locale, move }: { model: Beat['model']; box: Rect; defs: string; label: string; locale: Locale; move: Beat['move'] | null }) {
  if (m.kind === 'decimal-grid') return <DecimalGrid defs={defs} box={box} model={m} locale={locale} label={label} move={move} />;
  if (m.kind === 'place-value') return <PlaceValueChart box={box} model={m} locale={locale} label={label} move={move} />;
  if (m.kind === 'money') return <MoneyModel box={box} model={m} locale={locale} label={label} move={move} />;
  if (m.kind === 'numberline' && m.scale === 'decimal') return <DecimalLine defs={defs} box={box} model={m} locale={locale} label={label} move={move} />;
  return null;
}

/** Room a decimal line needs above its line (a mark's value) and below it (the numbers, a second scale), the gap under a grid. */
const DLINE_UP = 40;
const DLINE_DOWN = 42;
const DLINE_DUAL = 22;
const GRID_LINE_GAP = 26;

/**
 * A hundred grid over its number line (docs/29 §2.2 step 02): the two as one figure in the middle of the box, the grid's wholes
 * side by side with no gap and the line laid out under them so that 0…1 on the line is exactly the first whole's width (a strip
 * over each tenth). `null` when they cannot line up (two grids, a magnifier, a zoomed line, a line past the grid's wholes).
 */
export function gridOverLine(m: Beat['model'], under: Beat['model'], box: Rect): { grid: { x: number; y: number; s: number }; line: { x: number; w: number; y: number } } | null {
  if (m.kind !== 'decimal-grid' || m.pair || m.zoom || m.level === 1000) return null;
  if (under.kind !== 'numberline' || under.scale !== 'decimal' || (under.zoom?.length ?? 0) > 0) return null;
  const wholes = wholesOf(gridsOf(m)[0]!);
  const from = under.from.units / 1_000_000;
  const to = under.to.units / 1_000_000;
  if (from < 0 || to > wholes || to <= from) return null;
  const labelH = m.labels && m.labels !== 'none' ? 24 : 0;
  const lineH = DLINE_UP + DLINE_DOWN + (under.dual ? DLINE_DUAL : 0);
  // Above the grid its "1 whole" dimension line; at the line's ends their numbers, after it its unit.
  const fixed = 30 + labelH + GRID_LINE_GAP + lineH;
  const s = clamp(Math.min((box.w - 48 - (under.unit ? 56 : 0)) / wholes, box.h - fixed), 60, 460);
  const total = s + fixed;
  const top = box.y + Math.max(0, (box.h - total) / 2);
  const gx = box.x + (box.w - wholes * s) / 2;
  const gy = top + 30;
  return { grid: { x: gx, y: gy, s }, line: { x: gx + from * s, w: (to - from) * s, y: gy + s + labelH + GRID_LINE_GAP + DLINE_UP } };
}

/** Room a whole-number line needs above its line (the arcs and their "+5") and below it (the numbers). */
const LINE_UP = 62;
const LINE_DOWN = 40;
const LINE_GAP = 30;

/**
 * The groups with their jumps under them (docs/19 §2.2 step 02): the array drawn at the top of the pair and the line close under it,
 * the two as one figure in the middle of the box. When each group has its jump, the line is laid out so that jump i sits under group i.
 */
function ArrayOverLine({ beat, box, defs, label, locale }: { beat: Beat; box: Rect; defs: string; label: string; locale: Locale }) {
  const m = beat.model;
  const line = beat.under;
  if (m.kind !== 'array' || !line || line.kind !== 'numberline' || line.scale === 'decimal') return null;
  const sizing: Rect = { ...box, h: Math.max(80, box.h - (LINE_UP + LINE_DOWN + LINE_GAP)) };
  const f = arrayFrame(m, sizing, locale, { move: beat.move ?? null });
  const total = f.h + LINE_GAP + LINE_UP + LINE_DOWN;
  const top = box.y + Math.max(0, (box.h - total) / 2);
  const lineY = top + f.h + LINE_GAP + LINE_UP;
  let w = clamp(box.w - 80, 240, 960);
  let x = box.x + (box.w - w) / 2;
  const j = line.jumps;
  const c = f.centres;
  if (j && !m.pair && layoutOf(m) === 'groups' && c.length === j.count && j.count >= 2 && c.every((p) => Math.abs(p.y - c[0]!.y) < 1)) {
    // Jump i under group i: the line's scale makes one jump as long as the groups' pitch.
    const span = line.to - line.from;
    const lw = ((c[1]!.x - c[0]!.x) * span) / j.size;
    const lx = c[0]!.x - (((j.from ?? line.from) - line.from + j.size / 2) / span) * lw;
    if (lw >= 240 && lx >= box.x + 8 && lx + lw <= box.x + box.w - 8) {
      w = lw;
      x = lx;
    }
  }
  return (
    <g>
      <ArrayModel defs={defs} box={{ ...sizing, y: top }} model={m} locale={locale} label={label} move={beat.move ?? null} align="top" />
      <WholeLine x={x} y={lineY} w={w} model={line} locale={locale} label={label} move={beat.move ?? null} />
    </g>
  );
}

/** An array, blocks, a whole-number line, a clock or a timeline, read-only (a beat, or the part of a beat under another model). */
export function ValueModel({ model: m, box, defs, label, locale, move }: { model: Beat['model']; box: Rect; defs: string; label: string; locale: Locale; move: Beat['move'] | null }) {
  if (m.kind === 'array') return <ArrayModel defs={defs} box={box} model={m} locale={locale} label={label} move={move} />;
  if (m.kind === 'clock') return <ClockModel defs={defs} box={box} model={m} locale={locale} label={label} move={move} />;
  if (m.kind === 'timeline') return <Timeline defs={defs} box={box} model={m} locale={locale} label={label} move={move} />;
  if (m.kind === 'blocks') return <BlocksModel box={box} model={m} locale={locale} label={label} move={move} />;
  if (m.kind === 'numberline' && m.scale === 'whole') {
    const w = clamp(box.w - 80, 240, 960);
    return <WholeLine x={box.x + (box.w - w) / 2} y={box.y + box.h / 2 + 10} w={w} model={m} locale={locale} label={label} move={move} />;
  }
  return null;
}

export { beatShape, beatFraction, beatPair, beatCounts, beatTime } from './beat-info';
