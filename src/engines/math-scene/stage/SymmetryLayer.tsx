/**
 * Line symmetry on the square grid (docs/79 §3.1–3.4), drawn over `GridModel`:
 * lines of symmetry as centre lines (dash-dot ink) and lines being tested
 * (dashed ink); the fold — the part left of the line turned over onto the
 * right (a flap of hot outline over a pale back, the same 180° turn as the
 * fractions' fold, the crease left as a hairline), the side it came from
 * dimmed, and where the halves do not match hatched in ink once it lands;
 * partners (a square or point, its partner in signal, the line between and
 * the squares to the line on each side); and on a completion the child's
 * layer — squares and half squares (tap a corner of a square for a half;
 * ←→↑↓, Enter, H turns the half), or corners joined in order (tap a grid
 * point; ←→↑↓ and Enter on the point cursor); on a line of symmetry to draw
 * (`draw-segment`), two grid corners picked the same way and joined, folded
 * along with "Fold it". Reduced motion: no turning, the flap lies flat at
 * once.
 */
import { useEffect, useMemo, useRef, useState, type KeyboardEvent, type PointerEvent, type ReactNode } from 'react';
import type { Locale } from '../../core/types';
import { t } from '../../../i18n';
import type { GridModelSpec, SymLineSpec, Task } from '../schema';
import type { Action, TaskState } from '../lib/state';
import { cellKey, extentOf, parseCell, parseHalf } from '../lib/grid';
import { axisOf, cellDistance, clipHalf, figurePieces, figuresOnLine, foldPieces, halfPoly, keyPieces, lineOf, orientToward, partnerKey, partnerPoint, type Line, type Piece, type Poly, type Pt } from '../lib/symmetry';
import { cellOpen, givenOf, planOf, pointOpen, segmentPieces, symSegmentSolution, type Plan } from '../lib/symmetry-tasks';

export interface SymFrame {
  X(x: number): number;
  Y(y: number): number;
  sx: number;
  sy: number;
}

const polyPath = (F: SymFrame, polys: readonly Poly[]) => polys.map((p) => `M${p.map((q) => `${F.X(q[0])} ${F.Y(q[1])}`).join('L')}Z`).join('');

/** The sides of the pieces that are not shared by two of them (the outline of their union). */
function outerEdges(polys: readonly Poly[]): [Pt, Pt][] {
  const key = (a: Pt, b: Pt) => `${a[0].toFixed(4)},${a[1].toFixed(4)}|${b[0].toFixed(4)},${b[1].toFixed(4)}`;
  const count = new Map<string, number>();
  const edges: { a: Pt; b: Pt; k: string; r: string }[] = [];
  for (const p of polys)
    for (let i = 0; i < p.length; i++) {
      const a = p[i]!;
      const b = p[(i + 1) % p.length]!;
      const k = key(a, b);
      const r = key(b, a);
      edges.push({ a, b, k, r });
      count.set(k, (count.get(k) ?? 0) + 1);
    }
  return edges.filter((e) => !count.get(e.r)).map((e) => [e.a, e.b]);
}

/** Where a line is drawn: up / across over the whole paper; a segment as given. */
function lineEnds(m: GridModelSpec, spec: SymLineSpec): [Pt, Pt] {
  const ext = extentOf(m);
  if ('x' in spec) return [[spec.x, -0.6], [spec.x, ext.h + 0.6]];
  if ('y' in spec) return [[-0.6, spec.y], [ext.w + 0.6, spec.y]];
  return [spec.from, spec.to];
}

function SymLines({ F, m }: { F: SymFrame; m: GridModelSpec }) {
  const draw = (spec: SymLineSpec, cls: string, i: number) => {
    const [a, b] = lineEnds(m, spec);
    return <line key={`${cls}${i}`} className={cls} x1={F.X(a[0])} y1={F.Y(a[1])} x2={F.X(b[0])} y2={F.Y(b[1])} />;
  };
  return (
    <g className="ms-sym__lines" aria-hidden="true">
      {(m.candidates ?? []).map((l, i) => draw(l, 'ms-sym__cand', i))}
      {(m.mirror ?? []).map((l, i) => draw(l, 'ms-sym__mirror', i))}
    </g>
  );
}

function useReducedMotion(): boolean {
  const [on, setOn] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setOn(mq.matches);
  }, []);
  return on;
}

/**
 * The fold: `pieces` with their part left of `l` turned over by `t` (1 = flat on the other side), `paths` (open
 * lines) turned with it; at `t` = 1 the mismatch hatched. Plays once on mount unless reduced motion asks it not to.
 */
export function FoldFlap({ F, l, t: amount, pieces, paths = [], defs, bounds, hatch = true }: { F: SymFrame; l: Line; t: number; pieces: readonly Piece[]; paths?: readonly Pt[][]; defs: string; bounds: Poly; hatch?: boolean }) {
  const reduced = useReducedMotion();
  const anim = useRef<SVGAnimateTransformElement>(null);
  const animate = amount === 1 && !reduced;
  useEffect(() => {
    if (animate) anim.current?.beginElement?.();
  }, [animate]);
  const folded = useMemo(() => foldPieces(pieces, l), [pieces, l]);
  const moving = pieces.map((p) => clipHalf(p.poly, l, 1)).filter((p) => p.length);
  const movingShade = pieces.filter((p) => p.shade).map((p) => clipHalf(p.poly, l, 1)).filter((p) => p.length);
  const pa: Pt = [F.X(l.a[0]), F.Y(l.a[1])];
  const pb: Pt = [F.X(l.b[0]), F.Y(l.b[1])];
  const dx = pb[0] - pa[0];
  const dy = pb[1] - pa[1];
  // The normal to the line in screen space: local x after the rotation.
  const deg = (Math.atan2(dx, -dy) * 180) / Math.PI;
  const k = amount === 1 ? -1 : Math.cos(Math.PI * amount);
  const lifted = clipHalf(bounds, l, 1);
  const flapPaths = paths.map((p) => p.map((q) => `${F.X(q[0])},${F.Y(q[1])}`).join(' '));
  const edges = outerEdges(moving);
  return (
    <g className="ms-sym__fold" data-folded={amount === 1 || undefined} aria-hidden="true">
      {lifted.length > 0 && <path className="ms-sym__lifted" d={polyPath(F, [lifted])} />}
      <g transform={`translate(${pa[0]} ${pa[1]}) rotate(${deg})`}>
        <g transform={animate ? undefined : `scale(${k} 1)`}>
          {animate && <animateTransform ref={anim} attributeName="transform" type="scale" from="1 1" to="-1 1" dur="0.76s" begin="indefinite" fill="freeze" calcMode="spline" keyTimes="0;1" keySplines="0.65 0 0.35 1" />}
          <g transform={`rotate(${-deg}) translate(${-pa[0]} ${-pa[1]})`}>
            <path className="ms-sym__flap" d={polyPath(F, moving)} />
            {movingShade.length > 0 && <path className="ms-sym__flap ms-sym__flap--shade" d={polyPath(F, movingShade)} />}
            <path className="ms-sym__flap-edge" d={edges.map(([a, b]) => `M${F.X(a[0])} ${F.Y(a[1])}L${F.X(b[0])} ${F.Y(b[1])}`).join('')} />
            {flapPaths.map((d, i) => (
              <polyline key={i} className="ms-sym__flap-edge" points={d} />
            ))}
          </g>
        </g>
      </g>
      {amount === 1 && hatch && folded.mismatch > 1e-6 && (
        <g className="ms-sym__miss">
          {[false, true].map((shade) => {
            const polys = [...folded.moved, ...folded.stayed].filter((p) => p.shade === shade).map((p) => p.poly);
            return polys.length ? <path key={String(shade)} d={polyPath(F, polys)} fillRule="evenodd" fill={`url(#${defs}-hatch)`} /> : null;
          })}
        </g>
      )}
    </g>
  );
}

const centre = (k: string): Pt => {
  const h = parseHalf(k);
  const [x, y] = h ? [h.x, h.y] : parseCell(k);
  return [x + 0.5, y + 0.5];
};

/** Squares or points and their partners, joined, the squares to the line counted. */
function Pairs({ F, m }: { F: SymFrame; m: GridModelSpec }) {
  const first = m.mirror?.[0];
  const ax = first ? axisOf(first) : null;
  if (!ax || !m.pairs) return null;
  const cells = (m.pairs.cells ?? []).map(([x, y]) => `${x},${y}`);
  const points = m.pairs.points ?? [];
  const counts = cells.length + points.length <= 2 && F.sx >= 20;
  const out: ReactNode[] = [];
  const label = (from: Pt, to: Pt, n: number, key: string) => {
    if (n <= 0) return;
    const mx = (from[0] + to[0]) / 2;
    const my = (from[1] + to[1]) / 2;
    out.push(
      <text key={key} className="ms-sym__count" x={F.X(mx)} y={F.Y(my) + (ax.axis === 'x' ? -8 : 4)} dx={ax.axis === 'y' ? 10 : 0} textAnchor={ax.axis === 'x' ? 'middle' : 'start'}>
        {n}
      </text>,
    );
  };
  for (const k of cells) {
    const p = partnerKey(k, ax);
    const [x, y] = parseCell(p);
    const a = centre(k);
    const b = centre(p);
    out.push(<rect key={`p${k}`} className="ms-sym__partner" x={F.X(x) + 1.5} y={F.Y(y + 1) + 1.5} width={F.sx - 3} height={F.sy - 3} />);
    out.push(<line key={`j${k}`} className="ms-sym__join" x1={F.X(a[0])} y1={F.Y(a[1])} x2={F.X(b[0])} y2={F.Y(b[1])} />);
    if (counts) {
      const d = cellDistance(k, ax);
      const near = (c: Pt, toward: number): Pt => (ax.axis === 'x' ? [c[0] + 0.5 * toward, c[1]] : [c[0], c[1] + 0.5 * toward]);
      const onLine: Pt = ax.axis === 'x' ? [ax.at, a[1]] : [a[0], ax.at];
      const sa = Math.sign((ax.axis === 'x' ? ax.at - a[0] : ax.at - a[1]));
      label(near(a, sa), onLine, d, `ca${k}`);
      label(near(b, -sa), onLine, d, `cb${k}`);
    }
  }
  for (const p of points) {
    const q = partnerPoint(p, ax);
    const onLine: Pt = ax.axis === 'x' ? [ax.at, p[1]] : [p[0], ax.at];
    const d = Math.abs(ax.axis === 'x' ? p[0] - ax.at : p[1] - ax.at);
    out.push(<line key={`j${p}`} className="ms-sym__join" x1={F.X(p[0])} y1={F.Y(p[1])} x2={F.X(q[0])} y2={F.Y(q[1])} />);
    out.push(<circle key={`a${p}`} className="ms-sym__point" cx={F.X(p[0])} cy={F.Y(p[1])} r={4.5} />);
    out.push(<circle key={`b${p}`} className="ms-sym__point" data-tone="signal" cx={F.X(q[0])} cy={F.Y(q[1])} r={4.5} />);
    if (counts) {
      label(p, onLine, d, `pa${p}`);
      label(q, onLine, d, `pb${p}`);
    }
  }
  if (m.pairs.guess) {
    const g = m.pairs.guess;
    out.push(<circle key="guess" className="ms-sym__guess" cx={F.X(g[0])} cy={F.Y(g[1])} r={6} />);
  }
  return (
    <g className="ms-sym__pairs" aria-hidden="true">
      {out}
    </g>
  );
}

/** The paper's corners (for the dimmed side a fold lifts). */
const paperOf = (m: GridModelSpec): Poly => {
  const e = extentOf(m);
  return [[-1, -1], [e.w + 1, -1], [e.w + 1, e.h + 1], [-1, e.h + 1]];
};

/**
 * What a symmetry grid draws on top of its figures: a beat's fold, the lines, the partners; on a choice whose
 * stage line the child has folded (after the second hint), that fold.
 */
export function SymmetryDrawing({ F, m, defs, folded }: { F: SymFrame; m: GridModelSpec; defs: string; folded: boolean }) {
  const fold = m.fold ? { line: m.fold.line, t: m.fold.t } : folded ? { line: m.candidates?.[0] ?? m.mirror?.[0], t: 1 } : null;
  const pieces = fold?.line ? figuresOnLine(m, fold.line).flatMap(figurePieces) : [];
  const paths = fold?.line ? figuresOnLine(m, fold.line).flatMap((f) => (f.path ? [f.path.map(([x, y]) => [x, y] as Pt)] : [])) : [];
  return (
    <g className="ms-sym">
      {fold?.line && <FoldFlap key={`${JSON.stringify(fold.line)}${fold.t}`} F={F} l={lineOf(fold.line)} t={fold.t} pieces={pieces} paths={paths} defs={defs} bounds={paperOf(m)} />}
      <SymLines F={F} m={m} />
      <Pairs F={F} m={m} />
    </g>
  );
}

/* ------------------------------------------------------------------ */
/* The child's layer on a completion                                    */
/* ------------------------------------------------------------------ */

const CORNERS = ['ne', 'nw', 'sw', 'se'] as const;

export interface SymTaskProps {
  F: SymFrame;
  task: Task;
  state: TaskState;
  defs: string;
  modelPhase: boolean;
  act?(a: Action): void;
  ghost?: TaskState | null;
  locale: Locale;
}

export function SymTaskLayer(p: SymTaskProps) {
  const { task } = p;
  if (task.kind === 'draw-segment' && task.model.kind === 'grid') return <SegmentLayer {...p} m={task.model} />;
  if (task.kind !== 'complete-symmetric') return null;
  const plan = planOf(task);
  if (!plan || task.model.kind !== 'grid') return null;
  return plan.mode === 'cells' ? <CellsLayer {...p} plan={plan} m={task.model} /> : <PointsLayer {...p} plan={plan} m={task.model} />;
}

/** The given half folded over onto the child's side ("Fold it", after the second hint). */
function GivenFold({ F, task, state, plan, m, defs }: SymTaskProps & { plan: Plan; m: GridModelSpec }) {
  const f = task.kind === 'complete-symmetric' ? givenOf(task) : null;
  if (!f || !state.sfold) return null;
  const spec: SymLineSpec = plan.ax.axis === 'x' ? { x: plan.ax.at } : { y: plan.ax.at };
  const anchor: Pt = plan.ax.axis === 'x' ? [plan.ax.at - plan.side, 0.5] : [0.5, plan.ax.at - plan.side];
  const l = orientToward(lineOf(spec), anchor);
  const pieces = plan.mode === 'cells' ? [...figurePieces(f), ...keyPieces(state.sym)] : [];
  const paths = plan.mode === 'outline' && f.path ? [f.path.map(([x, y]) => [x, y] as Pt)] : [];
  return <FoldFlap key={state.sym.join('|')} F={F} l={l} t={1} pieces={pieces} paths={paths} defs={defs} bounds={paperOf(m)} hatch={plan.mode === 'cells'} />;
}

function CellsLayer(p: SymTaskProps & { plan: Plan; m: GridModelSpec }) {
  const { F, state, plan, act, modelPhase, ghost, locale } = p;
  const open = useMemo(() => {
    const out: string[] = [];
    for (let y = plan.rows - 1; y >= 0; y--) for (let x = 0; x < plan.cols; x++) if (cellOpen(plan, x, y)) out.push(cellKey(x, y));
    return out;
  }, [plan]);
  const [focus, setFocus] = useState(0);
  const refs = useRef<Record<string, SVGGElement | null>>({});
  const at = (cell: string) => state.sym.find((k) => (parseHalf(k) ? `${parseHalf(k)!.x},${parseHalf(k)!.y}` : k) === cell) ?? null;
  const tap = (cell: string, e: PointerEvent<SVGGElement>) => {
    const box = (e.currentTarget as SVGGraphicsElement).ownerSVGElement?.getBoundingClientRect();
    const [x, y] = parseCell(cell);
    if (!box) return act?.({ do: 'stile', key: cell });
    const fx = (e.clientX - box.left - F.X(x)) / F.sx;
    const fy = (F.Y(y) - (e.clientY - box.top)) / F.sy;
    const corner = Math.abs(fx - 0.5) > 0.28 && Math.abs(fy - 0.5) > 0.28 ? `${fy > 0.5 ? 'n' : 's'}${fx > 0.5 ? 'e' : 'w'}` : null;
    const key = corner ? `${cell},${corner}` : cell;
    const now = at(cell);
    act?.({ do: 'stile', key: now === key ? now : key });
  };
  const turnHalf = (cell: string) => {
    const now = at(cell);
    const h = now ? parseHalf(now) : null;
    const i = h ? CORNERS.indexOf(h.c) : -1;
    if (h && i === CORNERS.length - 1) act?.({ do: 'stile', key: now! });
    else act?.({ do: 'stile', key: `${cell},${CORNERS[i + 1]}` });
  };
  const move = (from: string, dx: number, dy: number) => {
    const [x, y] = parseCell(from);
    for (let s = 1; s < 13; s++) {
      const k = cellKey(x + dx * s, y + dy * s);
      if (open.includes(k)) return k;
    }
    return null;
  };
  const onKey = (cell: string) => (e: KeyboardEvent<SVGGElement>) => {
    const d = e.key === 'ArrowRight' ? [1, 0] : e.key === 'ArrowLeft' ? [-1, 0] : e.key === 'ArrowUp' ? [0, 1] : e.key === 'ArrowDown' ? [0, -1] : null;
    if (d) {
      e.preventDefault();
      const next = move(cell, d[0]!, d[1]!);
      if (next) {
        setFocus(open.indexOf(next));
        refs.current[next]?.focus();
      }
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      const now = at(cell);
      act?.({ do: 'stile', key: now && parseHalf(now) ? now : cell });
    } else if (e.key === 'h' || e.key === 'H') {
      e.preventDefault();
      turnHalf(cell);
    }
  };
  const stop = open[Math.min(focus, open.length - 1)];
  const rectOf = (k: string, inset: number) => {
    const [x, y] = parseCell(k);
    return { x: F.X(x) + inset, y: F.Y(y + 1) + inset, width: Math.max(0, F.sx - 2 * inset), height: Math.max(0, F.sy - 2 * inset) };
  };
  const tri = (k: string, inset = 0) => {
    const h = parseHalf(k)!;
    const pts = halfPoly(h);
    const cx = pts.reduce((s, q) => s + q[0], 0) / 3;
    const cy = pts.reduce((s, q) => s + q[1], 0) / 3;
    return pts.map(([x, y]) => `${F.X(x) + Math.sign(cx - x) * inset},${F.Y(y) - Math.sign(cy - y) * inset}`).join(' ');
  };
  const name = (k: string) => {
    const [x, y] = parseCell(k);
    const n = Math.abs((plan.ax.axis === 'x' ? x + 0.5 : y + 0.5) - plan.ax.at) - 0.5;
    const now = at(k);
    const h = now ? parseHalf(now) : null;
    return t(locale, 'math.sym.cell', { r: plan.rows - y, c: x + 1, n }) + (now ? ` · ${h ? t(locale, 'math.sym.half', { c: h.c.toUpperCase() }) : t(locale, 'math.sym.whole')}` : '');
  };
  return (
    <g className="ms-sym__task" data-keys="arrows">
      <GivenFold {...p} />
      <g className="ms-sym__mine" aria-hidden="true">
        {state.sym.map((k) => (parseHalf(k) ? <polygon key={k} className="ms-grid__tile" points={tri(k, F.sx > 14 ? 2.2 : 1)} /> : <rect key={k} className="ms-grid__tile" {...rectOf(k, F.sx > 14 ? 1.5 : 0.8)} />))}
      </g>
      {modelPhase &&
        open.map((k) => (
          <g
            key={k}
            ref={(el) => {
              refs.current[k] = el;
            }}
            className="ms-grid__cellbtn"
            role="button"
            tabIndex={k === stop ? 0 : -1}
            aria-pressed={!!at(k)}
            aria-label={name(k)}
            data-cell={k}
            onPointerDown={(e) => {
              if (e.button !== 0) return;
              e.preventDefault();
              setFocus(open.indexOf(k));
              tap(k, e);
            }}
            onKeyDown={onKey(k)}
          >
            <rect className="ms-grid__hit" {...rectOf(k, 0)} />
          </g>
        ))}
      {ghost && (
        <g className="ms-grid__ghost" aria-hidden="true">
          {ghost.sym.map((k) => (parseHalf(k) ? <polygon key={k} points={tri(k, 2.5)} /> : <rect key={k} {...rectOf(k, 2)} />))}
        </g>
      )}
    </g>
  );
}

function PointsLayer(p: SymTaskProps & { plan: Plan; m: GridModelSpec }) {
  const { F, state, plan, act, modelPhase, ghost, locale } = p;
  const first: Pt = useMemo(() => {
    const [x, y] = plan.right[0]!.split(',').map(Number) as [number, number];
    return plan.ax.axis === 'x' ? [plan.ax.at + plan.side, y] : [x, plan.ax.at + plan.side];
  }, [plan]);
  const [cur, setCur] = useState<Pt>(first);
  const toPt = (k: string): Pt => k.split(',').map(Number) as unknown as Pt;
  const line = (keys: readonly string[]) => {
    if (keys.length === 0 || !plan.ends) return '';
    const [start, end] = plan.ends;
    // Joined on from the end of the given line its first corner belongs to (either way round).
    const fromStart = keys[0] === plan.right.at(-1) && keys[0] !== plan.right[0];
    const pts = [fromStart ? start : end, ...keys, ...(keys.length >= plan.right.length ? [fromStart ? end : start] : [])].map(toPt);
    return pts.map(([x, y]) => `${F.X(x)},${F.Y(y)}`).join(' ');
  };
  const tap = (e: PointerEvent<SVGRectElement>) => {
    if (e.button !== 0) return;
    const box = (e.currentTarget as SVGGraphicsElement).ownerSVGElement?.getBoundingClientRect();
    if (!box) return;
    let x = 0;
    let y = 0;
    for (let gx = 0; gx <= plan.cols; gx++) if (Math.abs(F.X(gx) - (e.clientX - box.left)) <= F.sx / 2) x = gx;
    for (let gy = 0; gy <= plan.rows; gy++) if (Math.abs(F.Y(gy) - (e.clientY - box.top)) <= F.sy / 2) y = gy;
    if (!pointOpen(plan, x, y)) return;
    setCur([x, y]);
    act?.({ do: 'spoint', key: `${x},${y}` });
  };
  const key = (e: KeyboardEvent<SVGGElement>) => {
    const d = e.key === 'ArrowRight' ? [1, 0] : e.key === 'ArrowLeft' ? [-1, 0] : e.key === 'ArrowUp' ? [0, 1] : e.key === 'ArrowDown' ? [0, -1] : null;
    if (d) {
      e.preventDefault();
      const n: Pt = [cur[0] + d[0]!, cur[1] + d[1]!];
      if (pointOpen(plan, n[0], n[1])) setCur(n);
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      act?.({ do: 'spoint', key: `${cur[0]},${cur[1]}` });
    }
  };
  // The side the child works on, as a tap area.
  const x0 = plan.ax.axis === 'x' ? (plan.side > 0 ? plan.ax.at + 0.5 : -0.5) : -0.5;
  const x1 = plan.ax.axis === 'x' ? (plan.side > 0 ? plan.cols + 0.5 : plan.ax.at - 0.5) : plan.cols + 0.5;
  const y0 = plan.ax.axis === 'y' ? (plan.side > 0 ? plan.ax.at + 0.5 : -0.5) : -0.5;
  const y1 = plan.ax.axis === 'y' ? (plan.side > 0 ? plan.rows + 0.5 : plan.ax.at - 0.5) : plan.rows + 0.5;
  const placed = state.sym.includes(`${cur[0]},${cur[1]}`);
  const dist = Math.abs((plan.ax.axis === 'x' ? cur[0] : cur[1]) - plan.ax.at);
  return (
    <g className="ms-sym__task">
      <GivenFold {...p} />
      {state.sym.length > 0 && <polyline className="ms-sym__mine-line" points={line(state.sym)} aria-hidden="true" />}
      {state.sym.map((k) => {
        const [x, y] = toPt(k);
        return <circle key={k} className="ms-sym__point" data-tone="signal" cx={F.X(x)} cy={F.Y(y)} r={5} aria-hidden="true" />;
      })}
      {ghost && <polyline className="ms-grid__ghost-line" points={line(ghost.sym)} aria-hidden="true" />}
      {modelPhase && (
        <>
          <rect className="ms-grid__cuthit" x={F.X(x0)} y={F.Y(y1)} width={(x1 - x0) * F.sx} height={(y1 - y0) * F.sy} onPointerDown={tap} aria-hidden="true" />
          <g className="ms-grid__cursor" role="button" tabIndex={0} data-keys="arrows" aria-pressed={placed} aria-label={t(locale, 'math.sym.pointCursor')} aria-description={t(locale, 'math.sym.pointAt', { n: dist, placed: state.sym.length })} onKeyDown={key}>
            <circle className="ms-grid__pen" cx={F.X(cur[0])} cy={F.Y(cur[1])} r={8} />
          </g>
        </>
      )}
    </g>
  );
}

/** A line of symmetry to draw: two grid corners picked (tap, or ←→↑↓ and Enter), joined; "Fold it" folds the figure along it. */
function SegmentLayer(p: SymTaskProps & { m: GridModelSpec }) {
  const { F, task, state, m, act, modelPhase, ghost, locale, defs } = p;
  const ext = extentOf(m);
  const [cur, setCur] = useState<Pt>([Math.round(ext.w / 2), Math.round(ext.h / 2)]);
  if (task.kind !== 'draw-segment') return null;
  const picked: Pt[] = [...(task.from ? [task.from as Pt] : []), ...state.dpts];
  const open = (x: number, y: number) => x >= 0 && y >= 0 && x <= ext.w && y <= ext.h;
  const tap = (e: PointerEvent<SVGRectElement>) => {
    if (e.button !== 0) return;
    const box = (e.currentTarget as SVGGraphicsElement).ownerSVGElement?.getBoundingClientRect();
    if (!box) return;
    e.preventDefault();
    const x = Math.round((e.clientX - box.left - F.X(0)) / F.sx);
    const y = Math.round((F.Y(0) - (e.clientY - box.top)) / F.sy);
    if (!open(x, y)) return;
    setCur([x, y]);
    act?.({ do: 'dot', x, y });
  };
  const key = (e: KeyboardEvent<SVGGElement>) => {
    const d = e.key === 'ArrowRight' ? [1, 0] : e.key === 'ArrowLeft' ? [-1, 0] : e.key === 'ArrowUp' ? [0, 1] : e.key === 'ArrowDown' ? [0, -1] : null;
    if (d) {
      e.preventDefault();
      const n: Pt = [cur[0] + d[0]!, cur[1] + d[1]!];
      if (open(n[0], n[1])) setCur(n);
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      act?.({ do: 'dot', x: cur[0], y: cur[1] });
    }
  };
  const seg = picked.length >= 2 ? ([picked[0]!, picked[1]!] as const) : null;
  const sol = ghost ? symSegmentSolution(task) : null;
  const on = picked.some((q) => q[0] === cur[0] && q[1] === cur[1]);
  return (
    <g className="ms-sym__task">
      {seg && state.sfold && <FoldFlap key={`${seg[0].join(',')}|${seg[1].join(',')}`} F={F} l={{ a: seg[0], b: seg[1] }} t={1} pieces={segmentPieces(task)} defs={defs} bounds={paperOf(m)} />}
      {seg && <line className="ms-sym__mine-line" x1={F.X(seg[0][0])} y1={F.Y(seg[0][1])} x2={F.X(seg[1][0])} y2={F.Y(seg[1][1])} aria-hidden="true" />}
      {picked.map((q) => (
        <circle key={q.join(',')} className="ms-sym__point" data-tone="signal" cx={F.X(q[0])} cy={F.Y(q[1])} r={5} aria-hidden="true" />
      ))}
      {sol && <line className="ms-grid__ghost-line" x1={F.X(sol[0][0])} y1={F.Y(sol[0][1])} x2={F.X(sol[1][0])} y2={F.Y(sol[1][1])} aria-hidden="true" />}
      {modelPhase && (
        <>
          <rect className="ms-grid__cuthit" x={F.X(-0.5)} y={F.Y(ext.h + 0.5)} width={(ext.w + 1) * F.sx} height={(ext.h + 1) * F.sy} onPointerDown={tap} aria-hidden="true" />
          <g className="ms-grid__cursor" role="button" tabIndex={0} data-keys="arrows" aria-pressed={on} aria-label={t(locale, 'math.angle.dotPaper')} aria-description={`${t(locale, 'math.angle.dot', { x: cur[0] + 1, y: cur[1] + 1 })}${on ? ` · ${t(locale, 'math.angle.dotPicked')}` : ''}`} onKeyDown={key}>
            <circle className="ms-grid__pen" cx={F.X(cur[0])} cy={F.Y(cur[1])} r={8} />
          </g>
        </>
      )}
    </g>
  );
}
