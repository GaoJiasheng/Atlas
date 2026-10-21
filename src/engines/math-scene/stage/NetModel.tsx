/**
 * Model A8 `net` on the stage (docs/39 §3.2–3.5): a solid folded up from its
 * flat net, drawn in orthographic projection (from the top, isometric, or
 * `auto`: from the top while flat, isometric once folding) with paper faces,
 * 1 px ink edges and the painter's order of `lib/project.ts`. Between beats
 * of the same net the drawing stays and eases: the faces fold or unfold
 * layer by layer (`fold`), it turns (`rotate`), colours come in (`shade`);
 * the scale goes to the transition's fit (the start, the end and eight
 * states between) in its first 30 % and holds, so nothing jumps. Folded all
 * the way, two pieces on one face are drawn a little apart with "2 faces
 * here", an open face dashed with "nothing here", a short piece's gap
 * dashed. On a check the net lies flat from the top: the places a face may
 * go are buttons (complete-net), the faces are buttons (tap-face), and
 * Check folds the child's net up (`play`); "Show me" folds the answer up.
 * A set is a row of small pictures; an option's picture is the same drawing.
 */
import { useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import type { Locale } from '../../core/types';
import { tx } from '../../../i18n';
import type { BeatMove, NetModelSpec, Task } from '../schema';
import type { Action, TaskState } from '../lib/state';
import type { Rect } from './layout';
import { foldResult, nodeIndex } from '../lib/net';
import { candidatePolys, childSpec, completeSolution, markOf, netOfSpec, paperOf, tapAnswer } from '../lib/net-tasks';
import { boxLines, flatOutline, fitIn, gridLines, landedFaces, mixPose, netItems, pairOf, poseBounds, shapeOf, specPose, transitionBounds, transitionFit, worldFaces, type NetShape, type Pose, type SolidNet, type WorldFace } from '../lib/net-view';
import { mixFit, unionBounds, type Fit } from '../lib/project';
import { add, scale, type Vec3 } from '../lib/solid';
import { describeNet } from '../lib/net-description';
import { DashedFace, GroundLines, NetFaces, type FaceLook, type FaceTone } from './net/Faces';
import { NetCandidates, NetFaceButtons } from './net/Candidates';
import { NetDims, NetNotes, SphereDrawing } from './net/Labels';
import { SolidSet } from './net/SolidSet';

/** A beat's fold or turn (≤ 900 ms); a slider step; the check's fold up, the hold before it unfolds. */
export const NET_MOVE_MS = 820;
const STEP_MS = 180;
const PLAY_MS = 800;
const HOLD_MS = 1500;
const PAIR_MARKS = ['●', '▲', '■'] as const;

/** The check's animation: fold the child's net (or the answer) up; it stays up when right or shown. */
export interface NetPlay {
  n: number;
  stay: boolean;
}

export interface NetModelProps {
  model: NetModelSpec;
  box: Rect;
  /** The SVG defs' id (arrowheads). */
  defs: string;
  locale: Locale;
  label: string;
  move?: BeatMove | null;
  /** The FOLD slider and the turn buttons (`null`: the spec's). */
  fold?: number | null;
  turn?: number | null;
  /** The drawing at most this high (≈ half the stage's height: docs/39 §3.2). */
  maxH?: number;
  task?: Task | null;
  state?: TaskState | null;
  editable?: boolean;
  act?(a: Action): void;
  /** "Show me". */
  ghost?: boolean;
  play?: NetPlay | null;
  /** The name is what the check asks: not read out. */
  hideName?: boolean;
  /** An option's picture: no notes, no labels. */
  mini?: boolean;
  /** Pixels per square, shared by a row of pictures (they keep their true sizes). */
  unit?: number;
  /** What is on show (`__atlas.engine.net()`). */
  onShow?(info: NetShown): void;
}

export interface NetShown {
  fold: number;
  view: 'top' | 'iso' | 'auto';
  iso: number;
  turn: number;
  result: { closes: boolean; overlaps: number; missing: number } | null;
}

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

const ease = (k: number) => (k < 0.5 ? 4 * k * k * k : 1 - (-2 * k + 2) ** 3 / 2);
/** The FOLD slider being dragged: the drawing chases it, closing this share of the gap every 16 ms (no fresh ease-in per change). */
const FOLLOW_SHARE = 0.35;
/** The folds sampled for the slider's scale (it holds for all of them). */
const HELD_SAMPLES = 20;
const poseKey = (p: Pose) => JSON.stringify([p.t, p.folds.map((v) => Math.round(v * 1e4)), Math.round(p.iso * 1e4), p.turn]);

/** After a beat's transition the scale settles on the new pose alone (the transition's fit holds while it moves). */
const SETTLE_MS = 360;

/**
 * The drawing's pose and scale, eased from what is on show to the target (a new shape starts where it is told): the
 * scale goes to the transition's fit in its first 30 % and holds, then settles on the target's own fit. Under the FOLD
 * slider (`follow`, same shape and turn) it chases the slider frame by frame instead, so a drag never stalls it.
 */
function useNetMotion(shape: NetShape, target: Pose, fitFor: (from: Pose, to: Pose) => Fit, ms: number, initial: Pose | null, fitKey: string, follow: boolean): { pose: Pose; fit: Fit; moving: boolean } {
  const cur = useRef<{ shape: NetShape; pose: Pose; fit: Fit } | null>(null);
  const last = useRef<Pose | null>(null);
  const goal = useRef<Pose | null>(null);
  const raf = useRef(0);
  const chasing = useRef(false);
  const fitNow = useRef(fitFor);
  fitNow.current = fitFor;
  const [, redraw] = useState(0);
  const [moving, setMoving] = useState(false);
  const key = `${poseKey(target)}|${fitKey}`;
  useEffect(() => () => cancelAnimationFrame(raf.current), []);
  useLayoutEffect(() => {
    const same = cur.current?.shape === shape;
    const from = same ? cur.current!.pose : (initial ?? target);
    const own = fitFor(target, target);
    const quick = ms > 0 && follow && same && last.current?.turn === target.turn;
    last.current = target;
    goal.current = target;
    if (quick) {
      if (chasing.current) return;
      cancelAnimationFrame(raf.current);
      chasing.current = true;
      setMoving(true);
      let then = performance.now();
      const chase = (now: number) => {
        const to = goal.current!;
        const k = 1 - (1 - FOLLOW_SHARE) ** (Math.max(0, now - then) / 16);
        then = Math.max(then, now);
        const pose = mixPose(shape, cur.current!.pose, to, k);
        const done = Math.abs((pose.t ?? 0) - (to.t ?? 0)) < 1e-3 && pose.folds.every((v, i) => Math.abs(v - (to.folds[i] ?? 0)) < 1e-3);
        cur.current = { shape, pose: done ? to : pose, fit: fitNow.current(to, to) };
        redraw((n) => n + 1);
        if (done) {
          chasing.current = false;
          setMoving(false);
        } else raf.current = requestAnimationFrame(chase);
      };
      raf.current = requestAnimationFrame(chase);
      return;
    }
    cancelAnimationFrame(raf.current);
    chasing.current = false;
    if (ms <= 0 || poseKey(from) === poseKey(target)) {
      cur.current = { shape, pose: target, fit: own };
      setMoving(false);
      redraw((n) => n + 1);
      return;
    }
    const fitA = same ? cur.current!.fit : fitFor(from, from);
    const fitB = fitFor(from, target);
    const t0 = performance.now();
    const settle = fitB.s === own.s && fitB.mx === own.mx && fitB.my === own.my && fitB.cx === own.cx && fitB.cy === own.cy ? 0 : SETTLE_MS;
    setMoving(true);
    const step = (now: number) => {
      const k = Math.min(1, Math.max(0, now - t0) / ms);
      const j = settle ? Math.min(1, Math.max(0, (now - t0 - ms) / settle)) : 1;
      cur.current = { shape, pose: mixPose(shape, from, target, ease(k)), fit: k < 1 ? transitionFit(fitA, fitB, k) : mixFit(fitB, own, ease(j)) };
      redraw((n) => n + 1);
      if (k < 1 || j < 1) raf.current = requestAnimationFrame(step);
      else setMoving(false);
    };
    raf.current = requestAnimationFrame(step);
    // The target is read through its key; `fitFor` follows the box (in the key too).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, shape, ms, follow]);
  const now = cur.current?.shape === shape ? cur.current : null;
  return now ? { pose: now.pose, fit: now.fit, moving } : { pose: initial ?? target, fit: fitFor(initial ?? target, target), moving: false };
}

export function NetModel(p: NetModelProps) {
  const items = netItems(p.model);
  if (p.model.set) return <SolidSet items={items} box={p.box} locale={p.locale} label={p.label} />;
  const spec = items[0];
  if (!spec) return null;
  return <SingleNet {...p} spec={spec} />;
}

/** The pose of a check: flat from the top (its own fold for a picture to read); folded while it plays or once done. */
function checkPose(shape: NetShape, spec: SolidNet, task: Task, fold: number | null, turn: number | null): Pose {
  if (task.kind === 'complete-net' || task.kind === 'tap-face') return specPose(shape, { ...spec, fold: 0, view: 'auto' }, { fold, turn });
  return specPose(shape, spec, { fold, turn });
}

function SingleNet(p: NetModelProps & { spec: SolidNet }) {
  const reduced = useReduced();
  const task = p.task ?? null;
  const st = p.state ?? null;
  const live = !!task && !!st;
  const completing = task?.kind === 'complete-net' && st ? task : null;
  const tapping = task?.kind === 'tap-face' && st ? task : null;

  /* the net drawn: the child's (given + placed), the answer's when shown */
  const solution = useMemo(() => (completing ? completeSolution(completing) : null), [completing]);
  const placed = completing ? (p.ghost && solution ? solution : st!.nplaced) : [];
  const drawn: SolidNet = useMemo(() => (completing ? (childSpec(completing, placed) ?? p.spec) : p.spec), [completing, p.spec, placed.join('|')]);
  const shape = shapeOf(drawn);
  const net = shape.kind === 'poly' ? shape.net : null;
  const givenCount = completing ? netOfSpec(p.spec)?.nodes.length ?? 0 : 0;

  /* the check plays: up, a hold, back down (unless it stays) */
  const [phase, setPhase] = useState<'idle' | 'up' | 'hold' | 'down'>('idle');
  const playN = p.play?.n ?? 0;
  const stay = !!p.play?.stay;
  // Only a new play folds it up (a check shown again keeps its last look).
  const seen = useRef(playN);
  useEffect(() => {
    if (playN === seen.current) return;
    seen.current = playN;
    setPhase('up');
  }, [playN]);
  const playing = phase !== 'idle';
  const foldOverride = playing ? (phase === 'down' ? 0 : 1) : stay && playN ? 1 : (p.fold ?? null);

  const target = live ? checkPose(shape, drawn, task!, foldOverride, p.turn ?? null) : specPose(shape, drawn, { fold: foldOverride, turn: p.turn ?? null });
  // A beat remounted with `fold` comes in from the other end (flat, then folded up).
  const initial = useMemo(() => (p.move === 'fold' && !live && target.t !== null ? specPose(shape, drawn, { fold: target.t >= 0.5 ? 0 : 1, turn: p.turn ?? null }) : null), [shape]);

  /* ground lines: squared paper (a free task's sheet), the flat outline */
  const paper = useMemo(() => {
    if (completing && !Array.isArray(completing.candidates)) {
      const [c, r] = paperOf(completing);
      return boxLines(c, r);
    }
    return drawn.grid ? gridLines(shape) : [];
  }, [completing, drawn.grid, shape]);
  const foot = useMemo(() => (drawn.footprint ? flatOutline(shape) : []), [drawn.footprint, shape]);
  // The places a face may go count in the flat net's size (they are drawn beside it).
  const slots = useMemo<[Vec3, Vec3][]>(
    () => (completing && st ? candidatePolys(completing, st.nplaced).flatMap((c) => c.poly.map((q, i) => [[q[0], q[1], 0], [c.poly[(i + 1) % c.poly.length]![0], c.poly[(i + 1) % c.poly.length]![1], 0]] as [Vec3, Vec3])) : []),
    [completing, st],
  );
  const flatGround = useMemo(() => [...paper, ...slots], [paper, slots]);

  /* the scale: under the FOLD slider it holds for every fold (about the net's centre); a transition's goes to its fit, then settles */
  const maxH = Math.min(p.box.h * 0.9, p.maxH ?? Infinity);
  const unit = p.unit;
  const held = p.fold !== null && p.fold !== undefined;
  const heldShape = useRef(shape);
  const flatPose = (q: Pose) => (q.t ?? Math.max(0, ...q.folds)) <= 0.001;
  const fitKey = `${Math.round(p.box.x)}|${Math.round(p.box.y)}|${Math.round(p.box.w)}|${Math.round(p.box.h)}|${unit ?? ''}|${flatGround.length}|${foot.length}|${held}`;
  const heldFits = useRef(new Map<string, Fit>());
  if (heldShape.current !== shape || heldFits.current.size > 8) heldFits.current.clear();
  heldShape.current = shape;
  const fitFor = (from: Pose, to: Pose): Fit => {
    const box = p.box;
    const pad = p.mini ? 0.02 : 0.05;
    if (held) {
      // The same for every fold (worked out once per turn): the whole range, centred on the net's centre, so it stays
      // put on the screen however far it is folded.
      const cacheKey = `${to.turn}|${fitKey}|${Math.round(maxH)}|${pad}`;
      const hit = heldFits.current.get(cacheKey);
      if (hit) return hit;
      const flat = specPose(shape, { ...drawn, fold: 0 }, { turn: to.turn });
      let b = poseBounds(shape, flat, flatGround);
      for (let k = 0; k <= HELD_SAMPLES; k++) b = unionBounds(b, poseBounds(shape, specPose(shape, drawn, { fold: k / HELD_SAMPLES, turn: to.turn }), foot));
      const half = b && { minX: -Math.max(-b.minX, b.maxX), maxX: Math.max(-b.minX, b.maxX), minY: -Math.max(-b.minY, b.maxY), maxY: Math.max(-b.minY, b.maxY) };
      const f = half ? fitIn(half, box, pad, maxH) : { s: 1, cx: box.x + box.w / 2, cy: box.y + box.h / 2, mx: 0, my: 0 };
      heldFits.current.set(cacheKey, f);
      return f;
    }
    // Squared paper counts while the net lies flat on it (it fades as the net folds).
    const b = unionBounds(transitionBounds(shape, from, to, foot), unionBounds(flatPose(from) ? poseBounds(shape, from, flatGround) : null, flatPose(to) ? poseBounds(shape, to, flatGround) : null));
    if (!b) return { s: 1, cx: box.x + box.w / 2, cy: box.y + box.h / 2, mx: 0, my: 0 };
    const f = fitIn(b, box, pad, maxH);
    return unit ? { ...f, s: Math.min(f.s, unit) } : f;
  };
  const ms = reduced ? 0 : playing ? PLAY_MS : p.move && !live ? NET_MOVE_MS : STEP_MS;
  const { pose, fit, moving } = useNetMotion(shape, target, fitFor, ms, initial, fitKey, held && !playing);

  /* what is on show, for the test hooks */
  const result = net ? foldResult(net) : null;
  const shownFold = pose.t ?? Math.max(0, ...pose.folds);

  // The phases move on once the fold up (or down) has eased in; the hold is a pause.
  useEffect(() => {
    if (moving) return;
    if (phase === 'up' && shownFold >= 0.999) setPhase(stay ? 'idle' : 'hold');
    else if (phase === 'down' && shownFold <= 0.001) setPhase('idle');
  }, [moving, phase, shownFold, stay]);
  useEffect(() => {
    if (phase !== 'hold') return;
    const id = window.setTimeout(() => setPhase('down'), reduced ? 300 : HOLD_MS);
    return () => window.clearTimeout(id);
  }, [phase, reduced]);
  useEffect(() => {
    p.onShow?.({ fold: shownFold, view: drawn.view, iso: pose.iso, turn: pose.turn, result: result ? { closes: result.closes, overlaps: result.overlaps.length, missing: result.missing.length } : null });
  });

  /* faces: two on one face drawn a little apart once folded */
  const full = shownFold >= 0.999 && pose.folds.every((v, i) => !net || i === net.root || v >= 0.999);
  const size = useMemo(() => {
    if (!net) return 1;
    const pts = net.target.flatMap((f) => f.pts);
    return Math.max(1, ...pts.map((q) => Math.max(...q)));
  }, [net]);
  const faces = useMemo<WorldFace[]>(() => {
    const fs = worldFaces(shape, pose);
    if (!full || !result || !result.overlaps.length) return fs;
    const moved = new Set(result.overlaps.map(([, j]) => j));
    return fs.map((f, i) => (moved.has(i) ? { ...f, pts: f.pts.map((q) => add(q, scale(f.outside, size * 0.04))) } : f));
  }, [shape, pose, full, result, size]);

  /* how each face looks */
  const lands = landedFaces(shape);
  const keyed = (rec: Record<string, string> | undefined, i: number): string | undefined => {
    if (!rec || !net) return undefined;
    for (const [k, v] of Object.entries(rec)) if (nodeIndex(net, k) === i) return v;
    return undefined;
  };
  const mark = tapping ? markOf(tapping) : net && drawn.mark !== undefined ? nodeIndex(net, drawn.mark) : null;
  const answer = tapping ? tapAnswer(tapping) : null;
  const folded = full;
  // Pair colours: in a beat; on a check only the pair shown once folded (the answer, or the right one).
  const pairsOn = !live ? !!drawn.pairs : false;
  const look = (f: WorldFace): FaceLook => {
    if (f.piece) {
      const tone = drawn.tone?.[f.piece.face] as FaceTone | undefined;
      return { tone: tone ?? null, mark: null, ghost: false };
    }
    const i = f.node!;
    const face = lands[i] ?? null;
    let tone: FaceTone | null = null;
    let text: string | null = null;
    const pair = pairOf(shape.solid, face);
    if (pairsOn && pair !== null) {
      tone = `pair-${pair + 1}` as FaceTone;
      text = PAIR_MARKS[pair]!;
    }
    const own = keyed(drawn.tone, i) as FaceTone | undefined;
    if (own) tone = own;
    if (mark === i) {
      tone = 'given';
      if (tapping?.ask === 'opposite') text = PAIR_MARKS[0];
    }
    // Folded once found (or shown): the pair lights up, a box's bottom is the child's colour.
    if (tapping && folded && (p.ghost || st?.ntapped === answer) && (i === mark || i === answer)) {
      tone = tapping.ask === 'bottom' ? 'placed' : 'pair-1';
      text = tapping.ask === 'bottom' ? null : PAIR_MARKS[0];
    }
    if (completing) tone = i < givenCount ? 'given' : p.ghost ? null : 'placed';
    if (tapping && st?.ntapped === i && !(folded && i === answer)) tone = 'placed';
    if (!p.mini) {
      if (drawn.letters) text = String.fromCharCode(65 + i);
      if (drawn.numbers) text = String(i + 1);
      const name = face ? drawn.labels?.[face] : undefined;
      if (name) text = tx(name, p.locale);
    }
    const ghost = !!p.ghost && ((!!completing && i >= givenCount) || (!!tapping && i === answer));
    return { tone, mark: text, ghost };
  };

  /* screen-reader text */
  const description = describeNet(drawn, p.locale, { fold: shownFold, hideName: p.hideName });
  const flat = shownFold <= 0.001 && !moving;

  let notes: ReactNode = null;
  if (full && !p.mini && result && !result.closes && net) {
    notes = <NetNotes shape={shape} result={result} faces={faces} pose={pose} fit={fit} box={p.box} locale={p.locale} />;
  }

  return (
    <g className="ms-net" role="img" aria-label={[p.label, description].filter(Boolean).join(' ')} data-settling={playing && phase === 'up' ? '' : undefined} data-fold={Math.round(shownFold * 100)}>
      {paper.length > 0 && <GroundLines lines={paper} pose={pose} fit={fit} className={shownFold < 0.02 ? 'ms-net__paper' : 'ms-net__paper ms-net__paper--away'} />}
      {foot.length > 0 && <GroundLines lines={foot} pose={pose} fit={fit} className="ms-net__foot" />}
      {shape.kind === 'sphere' ? <SphereDrawing solid={shape.solid} pose={pose} fit={fit} /> : <NetFaces shape={shape} pose={pose} fit={fit} look={look} faces={faces} />}
      {notes}
      {drawn.dims && flat && <NetDims shape={shape} pose={pose} fit={fit} spec={drawn} defs={p.defs} locale={p.locale} />}
      {completing && flat && !playing && p.editable && !p.ghost && <NetCandidates task={completing} state={st!} pose={pose} fit={fit} act={p.act!} locale={p.locale} />}
      {tapping && flat && !playing && net && <NetFaceButtons net={net} pose={pose} fit={fit} mark={mark} tapped={st!.ntapped} enabled={!!p.editable && !p.ghost} act={p.act!} locale={p.locale} />}
      {p.ghost && completing && flat && net && net.nodes.slice(givenCount).map((n, k) => <DashedFace key={k} pts={n.poly.map(([x, y]) => [x, y, 0] as Vec3)} pose={pose} fit={fit} className="ms-ghost__part" />)}
    </g>
  );
}

/** The scale a row of net pictures shares (each fitted to its box, the smallest kept): they keep their true sizes. */
export function sharedUnit(models: NetModelSpec[], box: Rect): number {
  let s = Infinity;
  for (const m of models)
    for (const spec of netItems(m)) {
      const shape = shapeOf(spec);
      const pose = specPose(shape, spec);
      const b = poseBounds(shape, pose, spec.footprint ? flatOutline(shape) : []);
      if (b) s = Math.min(s, fitIn(b, box, 0.02).s);
    }
  return Number.isFinite(s) ? s : 1;
}
