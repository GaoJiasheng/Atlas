/**
 * The lesson's SVG stage (docs/15 §4.3): draws the current sub-step's model in
 * the chosen view (bar, circle, number line, wall, model drawing) inside the
 * free rectangle the layout found, wires taps / drags / keys to the
 * controller, and adds what the moment needs: "Show me" ghosts and the
 * S / E / N / L display modes. An explanation beat is drawn by `BeatModel`;
 * the background chapter shows one specimen fraction ({3/4}) in every view.
 */
import type { ReactNode } from 'react';
import type { Locale } from '../../core/types';
import { t, tx } from '../../../i18n';
import type { Beat, ModelView, Task } from '../schema';
import type { Controller } from '../controller';
import type { TaskRun } from '../ui';
import { canShow } from '../lib/lesson';
import { commonParts, modelValue, phasesOf, type Action, type TaskState } from '../lib/state';
import { asFrac, sortedOrder } from '../lib/check';
import { solvedState } from '../lib/solve';
import { toImproper, toMixed, valueOnLine, type Frac } from '../lib/fraction';
import { describePicture, fractionWords } from '../lib/words';
import type { Rect } from './layout';
import { BarModel, EQUIV_ROW, LINE_ROW, WHOLE_GAP } from './BarModel';
import { CircleModel } from './CircleModel';
import { NumberLine } from './NumberLine';
import { Rows, type RowSpec } from './Rows';
import { BarModelDiagram } from './BarModelDiagram';
import { CutBar } from './CutBar';
import { OptionGrid, optionGrid, type OptionCell } from './OptionGrid';
import { SvgFrac, type BarObject } from './svg';
import { BeatModel } from './BeatModel';
import { GridModel, describeFigure } from './GridModel';
import type { ArrayModelSpec, GridModelSpec } from '../schema';
import { figureOf } from '../lib/grid';
import { ArrayModel, arrayAspect, describeArray } from './ArrayModel';
import { BlocksModel } from './BlocksModel';
import { WholeLine } from './WholeLine';
import { plainText } from '../../../lib/rich-text';
import { decimalWords, wholeWords } from '../lib/words';
import { matOf, total as blockTotal } from '../lib/blocks';
import { isDec, isDecimalModel, isDecimalTask } from '../lib/decimal-tasks';
import { formatDecimal } from '../lib/decimal';
import type { ClockModelSpec, DecimalGridModelSpec } from '../schema';
import { DecimalTask } from './DecimalTask';
import { decimalViewModel } from '../lib/decimal-views';
import { DecimalModel } from './BeatModel';
import { describeMoney } from './MoneyModel';
import { DecimalGrid } from './DecimalGrid';
import { facesOf } from '../lib/clock';
import { ClockModel, describeClock } from './ClockModel';
import { Timeline } from './Timeline';

export interface DisplayModes {
  symbol: boolean;
  equivalent: boolean;
  numberline: boolean;
  labels: boolean;
}

export interface StageContentProps {
  defs: string;
  box: Rect;
  locale: Locale;
  modes: DisplayModes;
  /** The background chapter: the specimen in this view. */
  specimen?: ModelView;
  task?: Task | null;
  /** The state drawn (the run). */
  state?: TaskState | null;
  run?: TaskRun | null;
  view?: ModelView;
  /** Taps and keys act on the model. */
  editable?: boolean;
  /** An explanation beat (read-only): drawn instead of a task. */
  beat?: Beat | null;
  /** Practice: the right answer drawn after a wrong one. */
  ctl?: Controller;
}

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

/** The parts a "Show me" ghost outlines on a bar or circle. */
function ghostOf(task: Task): { parts: number; marked: number[] } {
  const s = solvedState(task);
  if (task.kind === 'build-sum') return { parts: s.parts, marked: task.op === '+' ? s.shaded : s.crossed };
  if (task.kind === 'fold' || task.kind === 'split' || task.kind === 'merge') return { parts: s.parts, marked: [...s.given, ...s.shaded] };
  return { parts: s.parts, marked: s.shaded };
}

/** Big fraction beside the model (S). */
function Symbol({ x, y, f }: { x: number; y: number; f: Frac | null }) {
  if (!f) return null;
  const m = toMixed(f);
  return <SvgFrac cx={x} cy={y} n={m.n} d={m.d} w={m.w} size={34} className="ms-symbol" />;
}

export function StageContent(p: StageContentProps) {
  const { box } = p;
  if (box.w < 40 || box.h < 40) return null;
  if (p.specimen) return <Specimen {...p} view={p.specimen} />;
  if (p.beat) return <BeatModel beat={p.beat} box={box} defs={p.defs} modes={p.modes} locale={p.locale} />;
  const task = p.task;
  const state = p.state;
  if (!task || !state) return null;
  return <TaskModel {...p} task={task} state={state} view={p.view && canShow(task, p.view) ? p.view : task.model.kind} />;
}

/* ------------------------------------------------------------------ */
/* Background chapter: one fraction, four ways                          */
/* ------------------------------------------------------------------ */

/** The background chapter of a grid lesson: one rectangle, covered and walked round. */
export const SPECIMEN_GRID: GridModelSpec = {
  kind: 'grid',
  unit: 'cm',
  show: 'cells',
  figures: [{ id: 'a', rect: [0, 0, 4, 3], tone: 'cold' }],
  tiles: { a: 'all' },
  walk: { a: 'all' },
  dims: [
    { side: 'top', figure: 'a' },
    { side: 'left', figure: 'a' },
  ],
};

/** The background chapter of a lesson on whole numbers: an array of 3 rows of 4, its counts braced. */
export const SPECIMEN_ARRAY: ArrayModelSpec = { kind: 'array', object: 'dot', layout: 'rows', rows: 3, cols: 4, braces: true, container: 'ring' };

/** The background chapter of a lesson on time: a clock face at 7:20 (the hour hand a third of the way to 8). */
export const SPECIMEN_CLOCK: ClockModelSpec = { kind: 'clock', time: 7 * 3600 + 20 * 60, face: 'clock', numerals: true, ticks: 'minutes', minuteLabels: true };

/** The background chapter of a lesson on decimals: a hundred grid with 0.35 shaded. */
export const SPECIMEN_DECIMAL: DecimalGridModelSpec = { kind: 'decimal-grid', level: 100, given: { units: 350_000, dp: 2 } };

function Specimen(p: StageContentProps & { view: ModelView }) {
  const { box, locale, defs } = p;
  if (p.view === 'clock' || p.view === 'timeline') return <ClockModel defs={defs} box={box} model={SPECIMEN_CLOCK} locale={locale} label={t(locale, 'math.specimen.clock')} />;
  if (p.view === 'grid') return <GridModel defs={defs} box={box} model={SPECIMEN_GRID} locale={locale} label={t(locale, 'math.specimen.grid')} />;
  if (p.view === 'decimal-grid') return <DecimalGrid defs={defs} box={box} model={SPECIMEN_DECIMAL} locale={locale} label={t(locale, 'math.specimen.decimal')} />;
  if (p.view === 'array') return <ArrayModel defs={defs} box={box} model={SPECIMEN_ARRAY} locale={locale} label={t(locale, 'math.specimen.array')} />;
  const label = t(locale, 'math.specimen', { name: fractionWords({ n: 3, d: 4 }, locale) });
  const cx = box.x + box.w / 2;
  const cy = box.y + box.h / 2;
  const w = clamp(box.w - 140, 200, 760);
  if (p.view === 'circle') {
    const r = clamp(Math.min(box.w, box.h - 40) / 2 - 10, 50, 170);
    return <CircleModel defs={defs} cx={cx} cy={cy} r={r} parts={4} given={[0, 1, 2]} object="prata" labels={p.modes.labels} label={label} locale={locale} />;
  }
  if (p.view === 'numberline') {
    return <NumberLine defs={defs} x={cx - w / 2} y={cy + 20} w={w} from={0} to={1} intervals={4} labels="ends" points={[{ pos: 3, label: { n: 3, d: 4 }, tone: 'cold' }]} withBar tickLabels={p.modes.labels} label={label} locale={locale} />;
  }
  if (p.view === 'wall') {
    const rows: RowSpec[] = [1, 2, 4, 8].map((d) => ({ parts: d, filled: d === 1 ? 0 : (3 * d) / 4 === Math.round((3 * d) / 4) ? (3 * d) / 4 : 0, tone: d >= 4 ? 'cold' : null, unitLabels: true }));
    const rowH = clamp((box.h - 40) / 4 - 10, 24, 46);
    return <Rows x={cx - w / 2} y={cy - (4 * (rowH + 10)) / 2} w={w} rowH={rowH} gap={10} rows={rows} align label={label} locale={locale} />;
  }
  const h = clamp(box.h * 0.3, 56, 110);
  return <BarModel defs={defs} x={cx - w / 2} y={cy - h / 2} w={w} h={h} parts={4} given={[0, 1, 2]} object="strip" dim={t(locale, 'math.whole')} labels={p.modes.labels} equivalent={p.modes.equivalent} numberline={p.modes.numberline} label={label} locale={locale} />;
}

/* ------------------------------------------------------------------ */
/* A sub-step                                                          */
/* ------------------------------------------------------------------ */

function TaskModel(p: StageContentProps & { task: Task; state: TaskState; view: ModelView }) {
  const { task, state, box, locale, defs, ctl } = p;
  const run = p.run ?? null;
  const editable = !!p.editable && !!ctl;
  const act = (a: Action) => ctl?.act(a);
  const phase = phasesOf(task)[state.phase] ?? 'model';
  const ghost = run?.revealed ?? false;
  const labels = p.modes.labels;
  const label = plainText(tx(task.prompt, locale), locale);
  const m = task.model;
  const value = modelValue(task, state);
  const withSymbol = p.modes.symbol && box.w > 480;
  const area: Rect = withSymbol ? { ...box, w: box.w - 120 } : box;
  const cx = area.x + area.w / 2;
  const cy = area.y + area.h / 2;
  const symbolAt = (x: number, y: number, f: Frac | null): ReactNode => (withSymbol ? <Symbol x={x} y={y} f={f} /> : null);
  const out: ReactNode[] = [];

  /* the square grid: count, trace, draw, cut, or a figure to read (input, a choice in words) */
  if (m.kind === 'grid' && !(task.kind === 'choose' && task.options.some((o) => o.model || o.value))) {
    return (
      <GridModel
        defs={defs}
        box={area}
        model={m}
        locale={locale}
        label={label}
        task={task.kind === 'choose' ? null : task}
        state={task.kind === 'choose' ? null : state}
        editable={editable}
        act={act}
        ghost={ghost && task.kind !== 'choose' && task.kind !== 'input' ? solvedState(task) : null}
      />
    );
  }

  /* the array, the blocks, the whole-number line: group, arrange, split, regroup, share, skip-count, or a picture to read */
  const pictures = task.kind === 'choose' && task.options.some((o) => o.model || o.value);
  if (!pictures && (m.kind === 'array' || m.kind === 'blocks' || (m.kind === 'numberline' && m.scale === 'whole'))) {
    const live = task.kind === 'choose' || task.kind === 'input' ? null : task;
    const ghostState = ghost && live ? solvedState(task) : null;
    if (m.kind === 'array') return <ArrayModel defs={defs} box={area} model={m} locale={locale} label={label} task={live} state={live ? state : null} editable={editable} act={act} ghost={ghostState} />;
    if (m.kind === 'blocks') return <BlocksModel box={area} model={m} locale={locale} label={label} task={live} state={live ? state : null} editable={editable} act={act} ghost={ghostState} />;
    const w = clamp(area.w - 80, 240, 960);
    return (
      <WholeLine
        x={cx - w / 2}
        y={cy + 10}
        w={w}
        model={m}
        locale={locale}
        label={label}
        landings={task.kind === 'skip-count' ? state.landings : undefined}
        onLand={task.kind === 'skip-count' && editable ? (at) => act({ do: 'land', at }) : undefined}
        ghost={task.kind === 'skip-count' && ghost ? solvedState(task).landings : null}
      />
    );
  }

  /* decimals: the grid, the chart, the line, money (docs/29 A6), or the view of two decimals compared */
  if (!pictures && isDecimalTask(task)) {
    const dm = decimalViewModel(task, p.view, state.aligned);
    if (dm) return <DecimalTask task={task} state={state} run={run} model={dm} box={area} defs={defs} locale={locale} label={label} editable={editable} act={act} />;
  }

  /* the clock and the timeline: set the hands, jump along the line, or a picture to read */
  if (!pictures && (m.kind === 'clock' || m.kind === 'timeline')) {
    if (m.kind === 'clock') {
      const live = task.kind === 'set-clock' ? task : null;
      return <ClockModel defs={defs} box={area} model={m} locale={locale} label={label} task={live} state={live ? state : null} editable={editable} act={act} ghost={ghost && live ? live.target : null} />;
    }
    const live = task.kind === 'duration' ? task : null;
    return <Timeline defs={defs} box={area} model={m} locale={locale} label={label} task={live} state={live ? state : null} ghost={ghost && live ? solvedState(live) : null} />;
  }

  /* choose: picture or number cards on the stage, sentences in the tray */
  if (task.kind === 'choose') {
    const letters = 'ABCDEFG';
    const cells: OptionCell[] = task.options
      .map((o, i) => ({ o, letter: letters[i]! }))
      .filter(({ o }) => o.model || o.value)
      .map(({ o, letter }) => ({
        id: o.id,
        letter,
        alt: o.value
          ? isDec(o.value)
            ? decimalWords(o.value, locale)
            : fractionWords(o.value, locale)
          : o.model?.kind === 'money'
            ? describeMoney(o.model, locale)
            : o.model?.kind === 'bar'
            ? describePicture(o.model.rows ?? [o.model], locale)
            : o.model?.kind === 'grid'
              ? (o.text ? tx(o.text, locale) : (figureOf(o.model) ? describeFigure(o.model, figureOf(o.model)!, locale) : ''))
              : o.model?.kind === 'array'
                ? describeArray(o.model, locale)
                : o.model?.kind === 'blocks'
                  ? wholeWords(blockTotal(matOf(o.model)), locale)
                  : o.model?.kind === 'clock'
                    ? facesOf(o.model).map((f) => describeClock(f, locale)).join(' · ')
                  : o.text
                    ? plainText(tx(o.text, locale), locale)
                    : '',
        draw: (b) => {
          if (o.model) return <MiniModel defs={defs} model={o.model} box={b} locale={locale} />;
          const v = o.value!;
          if (isDec(v))
            return (
              <text className="ms-option__dec" x={b.x + b.w / 2} y={b.y + b.h / 2 + 6} textAnchor="middle" fontSize={clamp(b.h / 3.6, 18, 44)}>
                {formatDecimal(v)}
              </text>
            );
          return <SvgFrac cx={b.x + b.w / 2} cy={b.y + b.h / 2 - 8} n={v.n} d={v.d} w={v.w} size={clamp(b.h / 4, 18, 40)} className="ms-option__frac" />;
        },
      }));
    if (cells.length === 0) return null;
    // Arrays, blocks and number lines in the cards: the cards take the pictures' shape (lines and groups in a row stack in
    // one column) and up to about 60 % of a big box's height (all of a small one), so the things in them read like a beat's.
    const pictures = task.options.flatMap((o) => (o.model ? [o.model] : []));
    const whole = pictures.length > 0 && pictures.every((pm) => pm.kind === 'array' || pm.kind === 'blocks' || (pm.kind === 'numberline' && pm.scale === 'whole'));
    const aspect = whole ? Math.exp(pictures.reduce((s, pm) => s + Math.log(pm.kind === 'array' ? clamp(arrayAspect(pm), 0.6, 8) : pm.kind === 'numberline' ? 4.5 : 1.3), 0) / pictures.length) : undefined;
    const fitted = aspect ? optionGrid(cells.length, area.w, area.h < 520 ? area.h : Math.max(300, area.h * 0.6), aspect) : null;
    const gh = fitted ? fitted.h : Math.min(area.h, cells.length > 3 ? area.h : clamp(area.w / cells.length, 140, 300));
    return (
      <OptionGrid
        x={area.x}
        y={area.y + (area.h - gh) / 2}
        w={area.w}
        h={gh}
        shape={fitted ?? undefined}
        cells={cells}
        multi={!!task.multi}
        chosen={state.chosen}
        onChoose={editable ? (id) => act({ do: 'choose', id }) : undefined}
        ghost={ghost ? task.options.filter((o) => o.correct).map((o) => o.id) : null}
        label={label}
        locale={locale}
      />
    );
  }
  // Every decimal model is drawn above (a decimal check, or its pictures).
  if (isDecimalModel(m)) return null;

  /* cut */
  if (task.kind === 'cut' && m.kind === 'bar') {
    const w = clamp(area.w - 60, 220, 880);
    const h = clamp(area.h * 0.32, 60, 130);
    return (
      <CutBar
        defs={defs}
        x={cx - w / 2}
        y={cy - h / 2 - 10}
        w={w}
        h={h}
        snap={task.snap}
        cuts={state.cuts}
        object={m.object}
        onCut={editable ? (at) => act({ do: 'cut', at }) : undefined}
        onMove={
          editable
            ? (from, to) => {
                act({ do: 'cut', at: from });
                act({ do: 'cut', at: to });
              }
            : undefined
        }
        measure={!!run && (run.done || run.revealed || run.feedback?.code === 'unequal-parts')}
        ghost={ghost ? solvedState(task).cuts : null}
       
        label={label}
        locale={locale}
      />
    );
  }

  /* model drawing (word problems) */
  if (m.kind === 'barmodel' && p.view === 'barmodel') {
    const w = clamp(area.w - 20, 260, 920);
    const barH = clamp(area.h / (m.bars.length * 2.4), 34, 56);
    const total = 30 + m.bars.length * (barH + 44);
    return <BarModelDiagram defs={defs} spec={m} x={cx - w / 2} y={Math.max(area.y + 20, cy - total / 2)} w={w} barH={barH} units={state.aligned} label={label} locale={locale} />;
  }

  /* compare: two rows, as bars or on the fraction wall */
  if (task.kind === 'compare') {
    // Fractions here (two decimals compared are drawn above).
    const ta = asFrac(task.a);
    const tb = asFrac(task.b);
    const pick = task.ask !== 'symbol' && editable ? (side: 'a' | 'b') => act({ do: 'pick', side }) : undefined;
    const correctSide = (() => {
      const c = toImproper(ta).n * tb.d - toImproper(tb).n * ta.d;
      return task.ask === 'greater' ? (c > 0 ? 'a' : 'b') : c < 0 ? 'a' : 'b';
    })();
    const w = clamp(area.w - 90, 220, 820);
    if (p.view === 'wall') {
      const base = m.kind === 'wall' ? m.rows : [1, ta.d, tb.d];
      const rows: RowSpec[] = [];
      let usedA = false;
      let usedB = false;
      for (const d of base) {
        if (!usedA && d === ta.d) {
          rows.push({ parts: d, filled: ta.n, tone: 'cold', side: 'a', unitLabels: true });
          usedA = true;
          if (ta.d === tb.d && !usedB) {
            rows.push({ parts: d, filled: tb.n, tone: 'hot', side: 'b', unitLabels: true });
            usedB = true;
          }
        } else if (!usedB && d === tb.d) {
          rows.push({ parts: d, filled: tb.n, tone: 'hot', side: 'b', unitLabels: true });
          usedB = true;
        } else rows.push({ parts: d, filled: 0, unitLabels: true });
      }
      const rowH = clamp((area.h - 20) / rows.length - 10, 24, 48);
      return (
        <Rows x={cx - w / 2} y={cy - (rows.length * (rowH + 10)) / 2} w={w} rowH={rowH} gap={10} rows={rows} onPick={pick} picked={state.pick} ghostSide={ghost && task.ask !== 'symbol' ? correctSide : null} align label={label} locale={locale} />
      );
    }
    const specRows = m.kind === 'bar' && m.rows ? m.rows : [{ parts: ta.d, given: ta.n }, { parts: tb.d, given: tb.n }];
    const rows: RowSpec[] = specRows.map((r, i) => ({
      parts: r.parts ?? 1,
      filled: typeof r.given === 'number' ? r.given : (r.given?.length ?? 0),
      tone: i === 0 ? 'cold' : 'hot',
      side: i === 0 ? 'a' : 'b',
      length: 'length' in r ? r.length : undefined,
    }));
    const rowH = clamp(area.h / 5, 40, 74);
    return (
      <g>
        <Rows
          x={cx - w / 2 + 20}
          y={cy - rowH - 10}
          w={w}
          rowH={rowH}
          gap={24}
          rows={rows}
          common={state.aligned ? commonParts(ta, tb) : null}
          onPick={pick}
          picked={state.pick}
          ghostSide={ghost && task.ask !== 'symbol' ? correctSide : null}
          align={state.aligned}
          rowLabels
         
          label={label}
          locale={locale}
        />
        {withSymbol && state.symbol && <text className="ms-symbol ms-symbol--sign" x={area.x + area.w + 60} y={cy + 14} textAnchor="middle">{state.symbol}</text>}
      </g>
    );
  }

  /* order: the items on the wall, or as points on a number line */
  if (task.kind === 'order') {
    const items = task.items.map(asFrac);
    const placed = run?.done || ghost ? sortedOrder(task) : state.order;
    if (m.kind === 'numberline') {
      const w = clamp(area.w - 80, 240, 880);
      const points = placed.map((i) => {
        const f = items[i]!;
        return { pos: valueOnLine(f, m) ?? 0, label: { n: f.n, d: f.d, w: f.w }, tone: 'mine' as const };
      });
      return <NumberLine defs={defs} x={cx - w / 2} y={cy + 24} w={w} from={m.from} to={m.to} intervals={m.intervals ?? 1} labels={m.labels === 'tens' || m.labels === 'steps' ? 'all' : m.labels} points={points} tickLabels={labels} label={label} locale={locale} />;
    }
    const base = m.kind === 'wall' ? m.rows : [1, ...items.map((f) => f.d)];
    const rows: RowSpec[] = base.map((d) => {
      const item = items.findIndex((f) => f.d === d);
      return { parts: d, filled: item >= 0 && placed.includes(item) ? items[item]!.n : 0, tone: 'mine' as const, unitLabels: true };
    });
    const w = clamp(area.w - 60, 220, 820);
    const rowH = clamp((area.h - 20) / rows.length - 10, 24, 46);
    return <Rows x={cx - w / 2} y={cy - (rows.length * (rowH + 10)) / 2} w={w} rowH={rowH} gap={10} rows={rows} align label={label} locale={locale} />;
  }

  /* number line: place, read the arrow, or a bar / circle task shown on a line */
  if (p.view === 'numberline') {
    const line = m.kind === 'numberline' ? m : { from: 0, to: 1, intervals: state.parts, labels: 'ends' as const, arrow: undefined, withBar: false };
    const w = clamp(area.w - 80, 240, 900);
    const marker = task.kind === 'place' ? state.place : m.kind === 'numberline' ? null : state.shaded.length + state.given.length;
    const placeable = editable && phase === 'model' && (task.kind === 'place' || task.kind === 'shade');
    const arrowPos = m.kind === 'numberline' && m.arrow ? valueOnLine(m.arrow, m) : null;
    const arcs = run?.feedback?.code === 'tick-counting' ? (task.kind === 'place' ? state.place : arrowPos) : null;
    const target = task.kind === 'place' && m.kind === 'numberline' ? valueOnLine(asFrac(task.target), m) : null;
    const y = cy + (line.withBar ? 30 : 10);
    out.push(
      <NumberLine
        key="line"
        defs={defs}
        x={cx - w / 2}
        y={y}
        w={w}
        from={line.from}
        to={line.to}
        intervals={line.intervals ?? 1}
        labels={line.labels === 'tens' || line.labels === 'steps' ? 'all' : line.labels}
        marker={task.kind === 'place' || (task.kind === 'shade' && m.kind !== 'numberline') ? marker : null}
        onPlace={placeable ? (at) => act(task.kind === 'place' ? { do: 'place', at } : { do: 'fill', count: at }) : undefined}
        arrow={arrowPos}
        arcs={arcs}
        withBar={line.withBar}
        ghost={ghost ? (target ?? null) : null}
        points={task.kind === 'input' && m.kind !== 'numberline' && value ? [{ pos: value.n, label: value, tone: 'cold' }] : undefined}
        tickLabels={labels}
       
        label={label}
        locale={locale}
      />,
    );
    out.push(<g key="sym">{symbolAt(area.x + area.w + 60, y - 60, value)}</g>);
    return <g>{out}</g>;
  }

  /* circle */
  if (p.view === 'circle') {
    const r = clamp(Math.min(area.w, area.h - 30) / 2 - 8, 46, 180);
    const mode = editable && (phase === 'model' || phase === 'mark') && (task.kind === 'shade' || task.kind === 'build-sum') ? (task.kind === 'build-sum' && task.op === '-' ? 'cross' : 'shade') : 'none';
    out.push(
      <CircleModel
        key="circle"
        defs={defs}
        cx={cx}
        cy={cy}
        r={r}
        parts={state.parts}
        shaded={state.shaded}
        given={state.given}
        crossed={state.crossed}
        object={m.kind === 'circle' ? m.object : m.kind === 'bar' && m.object === 'cake' ? 'cake' : 'plain'}
        mode={mode}
        onToggle={mode === 'none' ? undefined : (part) => act(mode === 'cross' ? { do: 'cross', part } : { do: 'shade', part })}
        ghost={ghost && phase !== 'input' ? ghostOf(task) : null}
        labels={labels}
        hatchMine={state.given.length > 0}
       
        label={label}
        locale={locale}
      />,
    );
    out.push(<g key="sym">{symbolAt(area.x + area.w + 60, cy, value)}</g>);
    return <g>{out}</g>;
  }

  /* bar (the default): one whole or more, place-on-a-bar for a number-line task */
  const object: BarObject | undefined = m.kind === 'bar' ? m.object : 'strip';
  const wholes = state.wholes;
  const extras = 34 + (p.modes.equivalent ? 2 * EQUIV_ROW + 12 : 0) + (p.modes.numberline ? LINE_ROW + 12 : 0);
  const h = clamp((area.h - extras - (wholes - 1) * WHOLE_GAP) / wholes, 46, wholes > 1 ? 84 : 116);
  const w = clamp(area.w - 60, 220, 900);
  const total = wholes * h + (wholes - 1) * WHOLE_GAP + extras;
  const y = cy - total / 2 + 34;
  const asPlace = task.kind === 'place';
  const mode = editable && (phase === 'model' || phase === 'mark') && (task.kind === 'shade' || task.kind === 'build-sum' || asPlace) ? (task.kind === 'build-sum' && task.op === '-' ? 'cross' : 'shade') : 'none';
  const shadedNow = asPlace ? Array.from({ length: state.place ?? 0 }, (_, i) => i) : state.shaded;
  out.push(
    <BarModel
      key="bar"
      defs={defs}
      x={cx - w / 2}
      y={y}
      w={w}
      h={h}
      parts={state.parts || 1}
      wholes={wholes}
      cuts={m.kind === 'bar' ? m.cuts : undefined}
      diagonal={m.kind === 'bar' ? m.diagonal : undefined}
      object={object}
      shaded={shadedNow}
      given={state.given}
      crossed={state.crossed}
      mode={mode}
      onToggle={
        mode === 'none'
          ? undefined
          : (part) => {
              if (asPlace) act({ do: 'place', at: state.place === part + 1 ? part : part + 1 });
              else act(mode === 'cross' ? { do: 'cross', part } : { do: 'shade', part });
            }
      }
      ghost={ghost && phase !== 'input' ? (asPlace ? { parts: state.parts, marked: Array.from({ length: valueOnLine(asFrac(task.target), { from: 0, intervals: state.parts }) ?? 0 }, (_, i) => i) } : ghostOf(task)) : null}
      labels={labels}
      dim={t(locale, 'math.whole')}
      folds={task.kind === 'fold' ? state.folds : undefined}
      equivalent={p.modes.equivalent}
      numberline={p.modes.numberline}
      hatchMine={state.given.length > 0}
     
      label={label}
      locale={locale}
    />,
  );
  out.push(<g key="sym">{symbolAt(area.x + area.w + 60, y + h / 2, asPlace ? (state.place === null ? null : { n: state.place, d: state.parts }) : value)}</g>);
  return <g>{out}</g>;
}

/* ------------------------------------------------------------------ */
/* Small drawings: picture options                                     */
/* ------------------------------------------------------------------ */

export function MiniModel({ defs, model, box, locale }: { defs: string; model: Task['model']; box: Rect; locale: Locale }) {
  const label = '';
  if (model.kind === 'grid') return <GridModel defs={defs} box={box} model={model} locale={locale} label={label} mini />;
  if (model.kind === 'array') return <ArrayModel defs={defs} box={box} model={model} locale={locale} label={label} mini />;
  if (model.kind === 'blocks') return <BlocksModel box={box} model={model} locale={locale} label={label} mini />;
  if (model.kind === 'clock') return <ClockModel defs={defs} box={box} model={model} locale={locale} label={label} mini />;
  if (model.kind === 'timeline') return <Timeline defs={defs} box={box} model={model} locale={locale} label={label} />;
  if (model.kind === 'numberline' && model.scale === 'whole') return <WholeLine x={box.x + 10} y={box.y + box.h / 2} w={box.w - 20} model={model} locale={locale} label={label} />;
  if (isDecimalModel(model)) return <DecimalModel model={model} box={box} defs={defs} label={label} locale={locale} move={null} />;
  if (model.kind === 'circle') {
    const r = Math.max(10, Math.min(box.w, box.h) / 2 - 4);
    const idx = (s: number | number[] | undefined) => (s === undefined ? [] : Array.isArray(s) ? s : Array.from({ length: s }, (_, i) => i));
    return <CircleModel defs={defs} cx={box.x + box.w / 2} cy={box.y + box.h / 2} r={r} parts={model.parts} given={idx(model.given)} shaded={idx(model.shaded)} object={model.object} label={label} locale={locale} />;
  }
  if (model.kind === 'bar' && model.rows) {
    const rowH = Math.min(36, (box.h - 12 * (model.rows.length - 1)) / model.rows.length);
    const rows: RowSpec[] = model.rows.map((r, i) => ({
      parts: r.parts ?? 1,
      filled: typeof r.given === 'number' ? r.given : (r.given?.length ?? 0),
      tone: i === 0 ? 'cold' : 'hot',
      length: r.length,
    }));
    const total = rows.length * rowH + (rows.length - 1) * 12;
    return <Rows x={box.x + 28} y={box.y + (box.h - total) / 2} w={box.w - 28} rowH={rowH} gap={12} rows={rows} rowLabels label={label} locale={locale} />;
  }
  if (model.kind === 'bar') {
    const idx = (s: number | number[] | undefined) => (s === undefined ? [] : Array.isArray(s) ? s : Array.from({ length: s }, (_, i) => i));
    const square = model.object === 'kueh' || model.diagonal;
    const side = Math.min(box.w, box.h);
    const w = square ? side : box.w;
    const h = square ? side : Math.min(box.h, Math.max(40, box.w / 4));
    return (
      <BarModel
        defs={defs}
        x={box.x + (box.w - w) / 2}
        y={box.y + (box.h - h) / 2}
        w={w}
        h={h}
        parts={model.parts ?? 1}
        cuts={model.cuts}
        diagonal={model.diagonal}
        object={model.object}
        given={idx(model.given)}
        shaded={idx(model.shaded)}
        label={label}
        locale={locale}
      />
    );
  }
  return null;
}
