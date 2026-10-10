/**
 * The lesson's SVG stage (docs/15 §4.3): draws the current sub-step's model in
 * the chosen view (bar, circle, number line, wall, model drawing) inside the
 * free rectangle the layout found, wires taps / drags / keys to the
 * controller, and adds what the moment needs: the example being played, a
 * HISTORY preview, "Show me" ghosts, the S / E / N / L display modes. The
 * background chapter shows one specimen fraction ({3/4}) in every view.
 */
import type { ReactNode } from 'react';
import type { Locale } from '../../core/types';
import { t, tx } from '../../../i18n';
import type { ModelView, Task } from '../schema';
import type { Controller } from '../controller';
import type { TaskRun } from '../ui';
import { canShow } from '../lib/lesson';
import { commonParts, modelValue, phasesOf, type Action, type TaskState } from '../lib/state';
import { sortedOrder } from '../lib/check';
import { solvedState } from '../lib/solve';
import { toImproper, toMixed, valueOnLine, type Frac } from '../lib/fraction';
import { fractionWords } from '../lib/words';
import type { Rect } from './layout';
import { BarModel, EQUIV_ROW, LINE_ROW, WHOLE_GAP } from './BarModel';
import { CircleModel } from './CircleModel';
import { NumberLine } from './NumberLine';
import { Rows, type RowSpec } from './Rows';
import { BarModelDiagram } from './BarModelDiagram';
import { CutBar } from './CutBar';
import { OptionGrid, type OptionCell } from './OptionGrid';
import { SvgFrac, type BarObject } from './svg';

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
  /** The state drawn (the run, an example frame, or a HISTORY preview). */
  state?: TaskState | null;
  run?: TaskRun | null;
  view?: ModelView;
  /** Taps and keys act on the model. */
  editable?: boolean;
  /** Example pointer over a part. */
  pointer?: number | null;
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
  const task = p.task;
  const state = p.state;
  if (!task || !state) return null;
  return <TaskModel {...p} task={task} state={state} view={p.view && canShow(task, p.view) ? p.view : task.model.kind} />;
}

/* ------------------------------------------------------------------ */
/* Background chapter: one fraction, four ways                          */
/* ------------------------------------------------------------------ */

function Specimen(p: StageContentProps & { view: ModelView }) {
  const { box, locale, defs } = p;
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
  const label = tx(task.prompt, locale).replace(/\{([^}]*)\}/g, '$1');
  const m = task.model;
  const value = modelValue(task, state);
  const withSymbol = p.modes.symbol && box.w > 480;
  const area: Rect = withSymbol ? { ...box, w: box.w - 120 } : box;
  const cx = area.x + area.w / 2;
  const cy = area.y + area.h / 2;
  const symbolAt = (x: number, y: number, f: Frac | null): ReactNode => (withSymbol ? <Symbol x={x} y={y} f={f} /> : null);
  const out: ReactNode[] = [];

  /* choose: picture or number cards on the stage, sentences in the tray */
  if (task.kind === 'choose') {
    const letters = 'ABCDEFG';
    const cells: OptionCell[] = task.options
      .map((o, i) => ({ o, letter: letters[i]! }))
      .filter(({ o }) => o.model || o.value)
      .map(({ o, letter }) => ({
        id: o.id,
        letter,
        draw: (b) => (o.model ? <MiniModel defs={defs} model={o.model} box={b} locale={locale} /> : <SvgFrac cx={b.x + b.w / 2} cy={b.y + b.h / 2 - 8} n={o.value!.n} d={o.value!.d} w={o.value!.w} size={clamp(b.h / 4, 18, 40)} className="ms-option__frac" />),
      }));
    if (cells.length === 0) return null;
    const gh = Math.min(area.h, cells.length > 3 ? area.h : clamp(area.w / cells.length, 140, 300));
    return (
      <OptionGrid
        x={area.x}
        y={area.y + (area.h - gh) / 2}
        w={area.w}
        h={gh}
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
    return <BarModelDiagram defs={defs} spec={m} x={cx - w / 2} y={cy - total / 2} w={w} barH={barH} units={state.aligned} label={label} locale={locale} />;
  }

  /* compare: two rows, as bars or on the fraction wall */
  if (task.kind === 'compare') {
    const pick = task.ask !== 'symbol' && editable ? (side: 'a' | 'b') => act({ do: 'pick', side }) : undefined;
    const correctSide = (() => {
      const c = toImproper(task.a).n * task.b.d - toImproper(task.b).n * task.a.d;
      return task.ask === 'greater' ? (c > 0 ? 'a' : 'b') : c < 0 ? 'a' : 'b';
    })();
    const w = clamp(area.w - 90, 220, 820);
    if (p.view === 'wall') {
      const base = m.kind === 'wall' ? m.rows : [1, task.a.d, task.b.d];
      const rows: RowSpec[] = [];
      let usedA = false;
      let usedB = false;
      for (const d of base) {
        if (!usedA && d === task.a.d) {
          rows.push({ parts: d, filled: task.a.n, tone: 'cold', side: 'a', unitLabels: true });
          usedA = true;
          if (task.a.d === task.b.d && !usedB) {
            rows.push({ parts: d, filled: task.b.n, tone: 'hot', side: 'b', unitLabels: true });
            usedB = true;
          }
        } else if (!usedB && d === task.b.d) {
          rows.push({ parts: d, filled: task.b.n, tone: 'hot', side: 'b', unitLabels: true });
          usedB = true;
        } else rows.push({ parts: d, filled: 0, unitLabels: true });
      }
      const rowH = clamp((area.h - 20) / rows.length - 10, 24, 48);
      return (
        <Rows x={cx - w / 2} y={cy - (rows.length * (rowH + 10)) / 2} w={w} rowH={rowH} gap={10} rows={rows} onPick={pick} picked={state.pick} ghostSide={ghost && task.ask !== 'symbol' ? correctSide : null} align label={label} locale={locale} />
      );
    }
    const specRows = m.kind === 'bar' && m.rows ? m.rows : [{ parts: task.a.d, given: task.a.n }, { parts: task.b.d, given: task.b.n }];
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
          common={state.aligned ? commonParts(task.a, task.b) : null}
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
    const placed = run?.done || ghost ? sortedOrder(task) : state.order;
    if (m.kind === 'numberline') {
      const w = clamp(area.w - 80, 240, 880);
      const points = placed.map((i) => {
        const f = task.items[i]!;
        return { pos: valueOnLine(f, m) ?? 0, label: { n: f.n, d: f.d, w: f.w }, tone: 'mine' as const };
      });
      return <NumberLine defs={defs} x={cx - w / 2} y={cy + 24} w={w} from={m.from} to={m.to} intervals={m.intervals} labels={m.labels} points={points} tickLabels={labels} label={label} locale={locale} />;
    }
    const base = m.kind === 'wall' ? m.rows : [1, ...task.items.map((f) => f.d)];
    const rows: RowSpec[] = base.map((d) => {
      const item = task.items.findIndex((f) => f.d === d);
      return { parts: d, filled: item >= 0 && placed.includes(item) ? task.items[item]!.n : 0, tone: 'mine' as const, unitLabels: true };
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
    const target = task.kind === 'place' && m.kind === 'numberline' ? valueOnLine(task.target, m) : null;
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
        intervals={line.intervals}
        labels={line.labels}
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
        pointer={p.pointer}
       
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
      ghost={ghost && phase !== 'input' ? (asPlace ? { parts: state.parts, marked: Array.from({ length: valueOnLine(task.target, { from: 0, intervals: state.parts }) ?? 0 }, (_, i) => i) } : ghostOf(task)) : null}
      labels={labels}
      dim={t(locale, 'math.whole')}
      folds={task.kind === 'fold' ? state.folds : undefined}
      equivalent={p.modes.equivalent}
      numberline={p.modes.numberline}
      hatchMine={state.given.length > 0}
      pointer={p.pointer}
     
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
