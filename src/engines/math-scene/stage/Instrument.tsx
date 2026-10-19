/**
 * Model A11 `instrument` on the stage (docs/32 §3.2–3.4): a ruler, a tape, a
 * dial, a jug or a balance — or two or three side by side, drawn to one
 * scale — with the beat's overlays (parts counted, a magnifier, brackets,
 * the eye-level line, marks drawn bold) and moves (`slide` the thing along,
 * `sweep` the needle in value order, `fill` the level, `tip` the beam,
 * `unroll` the dial into its straight line and back, `jump` the counting
 * arcs one by one, `zoom` the magnifier open). On a check it is live: the
 * child's line end, arrow, needle or level is a slider, the weights go on
 * and come off the pan, the small parts are buttons to count; the tray's
 * magnifier and counting tools draw here. "Show me" draws the answer dashed.
 * The same instrument between beats keeps its drawing, so the moves are
 * transitions; another scale remounts it.
 */
import { useEffect, useRef, useState, type ReactNode } from 'react';
import type { Locale } from '../../core/types';
import { t, tx } from '../../../i18n';
import type { BeatMove, InstrumentModelSpec, InstrumentSpec, PanThing, Task } from '../schema';
import type { Action, TaskState } from '../lib/state';
import { markAt, partsBetween, partsOf, pointerOf, readingOf, scaleOf, unitOf, zoomStretch, type Scale } from '../lib/instrument';
import { countParts, ghostWeights, readingQty, setStart, setTarget, setValue } from '../lib/measure-tasks';
import { qtyText } from '../lib/value';
import type { Rect } from './layout';
import { balanceFrame, dialFrame, jugFrame, magnifierSplit, sideBySide, straightFrame, type Track } from './instrument/geometry';
import { StraightInstrument } from './instrument/Ruler';
import { DialInstrument } from './instrument/Dial';
import { JugInstrument } from './instrument/Jug';
import { BalanceInstrument } from './instrument/Balance';
import { Magnifier } from './instrument/Magnifier';
import { PartButtons } from './instrument/Scale';

/** A move's transition length (≤ 900 ms). */
const MOVE_MS = { sweep: 760, fill: 720, tip: 700, slide: 640, unroll: 780 } as const;

function useReduced(): boolean {
  const [on, setOn] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setOn(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);
  return on;
}

/** `t` eased to its target over `ms` (the unroll); straight to it with reduced motion or no move. */
function useTween(target: number, ms: number, animate: boolean): number {
  const [now, setNow] = useState(target);
  const cur = useRef(target);
  useEffect(() => {
    if (!animate) {
      cur.current = target;
      setNow(target);
      return;
    }
    const from = cur.current;
    if (from === target) return;
    const start = performance.now();
    let raf = 0;
    const step = (time: number) => {
      const k = Math.min(1, (time - start) / ms);
      const e = k < 0.5 ? 2 * k * k : 1 - (-2 * k + 2) ** 2 / 2;
      cur.current = from + (target - from) * e;
      setNow(cur.current);
      if (k < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, ms, animate]);
  return now;
}

/** The beam settles: drawn first as if nothing were on the right pan, then to its tilt (a `tip` beat that mounts fresh). */
function useSettled(on: boolean): boolean {
  const [settled, setSettled] = useState(!on);
  useEffect(() => {
    if (!on) return;
    const id = requestAnimationFrame(() => requestAnimationFrame(() => setSettled(true)));
    return () => cancelAnimationFrame(id);
  }, [on]);
  return settled;
}

export interface InstrumentProps {
  model: InstrumentModelSpec;
  box: Rect;
  defs: string;
  locale: Locale;
  label: string;
  move?: BeatMove | null;
  task?: Task | null;
  state?: TaskState | null;
  editable?: boolean;
  act?(a: Action): void;
  /** "Show me". */
  ghost?: boolean;
  /** The straightened view (a dial or a jug as its number line). */
  straight?: boolean;
  mini?: boolean;
}

/** What a check's state draws on its instrument. */
interface Live {
  task: Task;
  state: TaskState;
  editable: boolean;
  act(a: Action): void;
  ghost: boolean;
}

export function InstrumentModel(p: InstrumentProps) {
  const members = partsOf(p.model);
  const live: Live | null = p.task && p.state ? { task: p.task, state: p.state, editable: !!p.editable, act: p.act ?? (() => undefined), ghost: !!p.ghost } : null;
  if (members.length === 1) return <Member s={members[0]!} box={p.box} p={p} live={live} index={0} />;
  // Side by side, the same box each (one scale); long flat ones stacked.
  const flat = members.every((s) => (s.type === 'ruler' || s.type === 'tape') && s.orient !== 'vertical' && s.look !== 'height-chart');
  const boxes = sideBySide(p.box, members.length, flat);
  return (
    <g className="ms-inst-set" role="group" aria-label={p.label}>
      {members.map((s, i) => (
        <g key={i}>
          {s.label && (
            <text className="ms-array__title" x={boxes[i]!.x + boxes[i]!.w / 2} y={boxes[i]!.y - 8} textAnchor="middle">
              {tx(s.label, p.locale)}
            </text>
          )}
          <Member s={s} box={boxes[i]!} p={p} live={i === 0 ? live : null} index={i} />
        </g>
      ))}
    </g>
  );
}

/** The value a check's slider shows as words ("280 g", "1 m 32 cm"). */
function valueText(s: InstrumentSpec, v: number, locale: Locale): string {
  const q = readingQty(s, v);
  return q ? qtyText(q, locale) : String(v / 1_000_000);
}

function Member({ s, box, p, live, index }: { s: InstrumentSpec; box: Rect; p: InstrumentProps; live: Live | null; index: number }) {
  const reduced = useReduced();
  const move = reduced ? null : (p.move ?? null);
  const ms = (m: keyof typeof MOVE_MS) => (move === m ? MOVE_MS[m] : 0);
  const sc = scaleOf(s);
  const task = live?.task ?? null;
  const st = live?.state ?? null;
  const set = task?.kind === 'set-scale' && st ? task : null;
  const counting = task?.kind === 'count-intervals' && st ? task : null;
  const reading = task?.kind === 'read-scale' && st ? task : null;
  const straight = !!p.straight || !!s.straight;
  const tween = useTween(straight ? 1 : 0, MOVE_MS.unroll, move === 'unroll');
  const settled = useSettled(move === 'tip');
  const label = p.label;

  /* the magnifier: the beat's, or the tray's tool on the stretch the reading is in */
  const pointer = sc ? pointerOf(s) : null;
  const zoom = s.zoom ? { from: s.zoom.from.units, to: s.zoom.to.units } : reading && st?.mzoom && sc && pointer !== null ? zoomStretch(sc, pointer) : null;
  const split = zoom && !p.mini ? magnifierSplit(box) : null;
  const instBox = split ? split.inst : box;

  /* parts counted: the beat's overlay, the child's (count-intervals, or read-scale's tool) */
  const counted = sc ? (counting || (reading && st?.mcount) ? st!.mparts : s.count ? partsBetween(sc, s.count.from.units, s.count.to.units) : undefined) : undefined;
  const partList = sc && live?.editable ? (counting && st?.phase === 0 ? countParts(counting) : reading && st?.mcount ? Array.from({ length: sc.parts }, (_, k) => k) : null) : null;
  const shown: InstrumentSpec = counting ? { ...s, highlight: [...(s.highlight ?? []), counting.between[0], counting.between[1]] } : s;
  const partLabel = (k: number) => (sc ? t(p.locale, 'math.measure.part', { a: valueText(s, markAt(sc, k), p.locale), b: valueText(s, markAt(sc, k + 1), p.locale) }) : '');
  const buttons = (track: Track) =>
    partList && sc ? <PartButtons sc={sc} track={track} parts={partList} counted={st!.mparts} onToggle={(part) => live!.act({ do: 'mpart', part })} enabled={!!live?.editable} label={partLabel} /> : null;

  /* the child's value on a set-scale, and "Show me" */
  const mine = set && st ? setValue(set, st) : null;
  const moved = set && st ? st.mset !== null : false;
  const target = set ? setTarget(set) : null;
  const ghost = live?.ghost && set ? target : null;
  const handle =
    set && live?.editable && set.mode !== 'weights' && mine !== null
      ? {
          value: mine,
          min: set.mode === 'line' ? setStart(set) : (sc?.from ?? 0),
          label: t(p.locale, `math.measure.handle.${set.mode as 'line' | 'arrow' | 'load' | 'fill'}`),
          valueText: valueText(s, mine, p.locale),
          onSet: (v: number) => live!.act({ do: 'mset', to: v }),
        }
      : null;

  let drawing: ReactNode = null;
  let track: Track | null = null;
  if (s.type === 'balance') {
    const f = balanceFrame(instBox);
    const right: PanThing[] = set && set.mode === 'weights' && st ? st.mweights.map((w) => ({ weight: w })) : settled ? (s.right ?? []) : [];
    drawing = (
      <BalanceInstrument
        s={s}
        f={f}
        right={right}
        mine={!!(set && set.mode === 'weights')}
        ghost={live?.ghost && set?.mode === 'weights' ? ghostWeights(set) : null}
        tipMs={move === 'tip' || (set && set.mode === 'weights') ? MOVE_MS.tip : 0}
        onTake={set && live?.editable ? (i) => live.act({ do: 'unweigh', at: i }) : undefined}
        locale={p.locale}
        label={label}
        showMass={!task}
      />
    );
  } else if (sc && (s.type === 'ruler' || s.type === 'tape')) {
    const f = straightFrame(shown, sc, instBox, { counting: !!counted || !!partList });
    track = f.track;
    const line = set?.mode === 'line' && mine !== null ? (moved ? { from: setStart(set), to: mine } : null) : s.line ? { from: s.line.from.units, to: s.line.to.units } : null;
    const arrow = set?.mode === 'arrow' ? mine : (s.arrow?.units ?? null);
    drawing = (
      <StraightInstrument s={shown} sc={sc} f={f} defs={p.defs} locale={p.locale} line={line} arrow={arrow} head={s.head?.units ?? null} ghost={ghost} counted={counted} handle={handle} slideMs={ms('slide')} stagger={move === 'jump'}>
        {buttons(f.track)}
      </StraightInstrument>
    );
  } else if (sc && s.type === 'dial') {
    const f = dialFrame(shown, sc, instBox);
    track = tween >= 0.5 ? f.line : f.track;
    drawing = (
      <DialInstrument s={shown} sc={sc} f={f} unit={unitOf(s)} value={mine ?? s.value?.units ?? sc.from} mine={mine !== null} ghost={ghost} counted={counted} t={tween} sweepMs={ms('sweep')} handle={handle} stagger={move === 'jump'}>
        {buttons(track)}
      </DialInstrument>
    );
  } else if (s.type === 'jug') {
    const f = jugFrame(shown, sc, instBox);
    track = f.track ? (tween >= 0.5 && f.line ? f.line : f.track) : null;
    drawing = (
      <JugInstrument s={shown} sc={sc} f={f} defs={p.defs} locale={p.locale} value={mine ?? s.value?.units ?? null} mine={mine !== null} ghost={ghost} counted={counted} t={tween} fillMs={ms('fill') || (set ? 160 : 0)} handle={handle} stagger={move === 'jump'}>
        {track && buttons(track)}
      </JugInstrument>
    );
  }

  return (
    <g className="ms-inst-member" role={index === 0 && partsOf(p.model).length === 1 ? 'group' : undefined} aria-label={index === 0 && partsOf(p.model).length === 1 ? label : undefined} data-type={s.type}>
      {drawing}
      {split && sc && track && zoom && <Magnifier s={shown} sc={sc} track={track} stretch={zoom} pointer={readingPointer(s, sc, mine)} mag={split.mag} counted={!!s.count && s.count.from.units === zoom.from} />}
    </g>
  );
}

/** Where the reading falls, for the magnifier's mark (a thing's far end, a needle, a level, the child's value). */
function readingPointer(s: InstrumentSpec, sc: Scale, mine: number | null): number | null {
  if (mine !== null) return mine;
  const r = readingOf(s);
  if (r?.b !== undefined) return r.b;
  return pointerOf(s) ?? sc.from;
}
