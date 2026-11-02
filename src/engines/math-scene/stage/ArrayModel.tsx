/**
 * The array (docs/19 §3.1, model A1) in the technical-plate line style:
 * things (dots, kueh, curry puffs, eggs, chopsticks, seats, oranges, pencils,
 * stickers: orthographic line art, ≤ 6 paths each) loose on a tray, in
 * containers (ring, plate, box, bag, car) or in rows, with count braces drawn
 * as dimension lines, a split drawn a little apart, a paper strip over the
 * count that is the question, an ink slash over what is taken away, and a
 * pair of layouts side by side.
 *
 * Every thing keeps its index from beat to beat, so a `group`, `deal` or
 * `arrange` beat moves each one from where it was to where it goes (a CSS
 * transform transition; `deal` goes one at a time, round the containers);
 * `rotate` turns the whole array a quarter turn in. On a check the child's
 * layer is live: put things into containers (tap a container, or Enter on it;
 * Delete takes one out), lay out an array from the fixed corner (tap a
 * point, drag the corner handle, or ←→↑↓ on it), or cut an array between two
 * rows or columns (tap the gap, or the cut cursor: ↑↓ rows, ←→ columns,
 * Enter). "Show me" draws the answer in dashed ink.
 */
import { arrayFrame, Brace, ARRAY_SHARE, type Tone } from './array-layout';
import { useRef, useState, type KeyboardEvent, type PointerEvent, type ReactNode } from 'react';
import type { Locale } from '../../core/types';
import { t, tx } from '../../../i18n';
import type { ArrayLayoutSpec, ArrayModelSpec, BeatMove, Task } from '../schema';
import type { Action, TaskState } from '../lib/state';
import { looseOf, MAX_GROUPS } from '../lib/state';
import { groupSizes, layoutOf, packOf, parseArrayCut } from '../lib/array';
import { groupTarget } from '../lib/diagnose/whole-ops';
import type { Rect } from './layout';

export interface ArrayModelProps {
  defs: string;
  box: Rect;
  model: ArrayModelSpec;
  locale: Locale;
  label: string;
  /** The beat's move (how the things get to where they are). */
  move?: BeatMove | null;
  task?: Task | null;
  state?: TaskState | null;
  editable?: boolean;
  act?(a: Action): void;
  /** "Show me": the solved state. */
  ghost?: TaskState | null;
  /** A picture option: small, no braces' words. */
  mini?: boolean;
  /** Where the drawing sits in its box: centred (default), or at the top (a number line under it). */
  align?: 'center' | 'top';
}

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

/* ------------------------------------------------------------------ */
/* Things                                                              */
/* ------------------------------------------------------------------ */

/** One thing, centred on 0, 0, `s` across. */
export function Thing({ object, s }: { object: ArrayLayoutSpec['object']; s: number }) {
  const h = s / 2;
  switch (object) {
    case 'kueh':
      return (
        <>
          <rect className="ms-thing__body" x={-h * 0.8} y={-h * 0.8} width={s * 0.8} height={s * 0.8} />
          {[-0.27, 0, 0.27].map((k) => (
            <line key={k} className="ms-thing__line" x1={-h * 0.8} x2={h * 0.8} y1={k * s} y2={k * s} />
          ))}
        </>
      );
    case 'curry-puff':
      return (
        <>
          <path className="ms-thing__body" d={`M${-h * 0.9} ${h * 0.35}A${h * 0.9} ${h * 0.9} 0 0 1 ${h * 0.9} ${h * 0.35}Z`} />
          <path className="ms-thing__line" d={Array.from({ length: 5 }, (_, i) => {
            const a = Math.PI * (0.15 + (i * 0.7) / 4);
            const r1 = h * 0.9;
            const r2 = h * 0.68;
            return `M${-Math.cos(a) * r1} ${h * 0.35 - Math.sin(a) * r1}L${-Math.cos(a) * r2} ${h * 0.35 - Math.sin(a) * r2}`;
          }).join('')} />
        </>
      );
    case 'egg':
      return <ellipse className="ms-thing__body" rx={h * 0.62} ry={h * 0.8} />;
    case 'chopsticks':
      return <rect className="ms-thing__body" x={-s * 0.07} y={-h * 0.92} width={s * 0.14} height={s * 0.92} rx={s * 0.05} />;
    case 'seat':
      return (
        <>
          <rect className="ms-thing__body" x={-h * 0.7} y={-h * 0.2} width={s * 0.7} height={h * 0.9} />
          <line className="ms-thing__line" x1={-h * 0.7} x2={h * 0.7} y1={-h * 0.62} y2={-h * 0.62} />
        </>
      );
    case 'orange':
      return (
        <>
          <circle className="ms-thing__body" r={h * 0.78} />
          <line className="ms-thing__line" x1={0} x2={h * 0.22} y1={-h * 0.78} y2={-h * 1.0} />
        </>
      );
    case 'pencil':
      return (
        <>
          <path className="ms-thing__body" d={`M${-h * 0.95} ${-h * 0.22}H${h * 0.55}L${h * 0.95} 0L${h * 0.55} ${h * 0.22}H${-h * 0.95}Z`} />
          <line className="ms-thing__line" x1={h * 0.55} x2={h * 0.55} y1={-h * 0.22} y2={h * 0.22} />
        </>
      );
    case 'sticker': {
      const pts = Array.from({ length: 10 }, (_, i) => {
        const r = i % 2 ? h * 0.36 : h * 0.82;
        const a = -Math.PI / 2 + (i * Math.PI) / 5;
        return `${(Math.cos(a) * r).toFixed(2)},${(Math.sin(a) * r).toFixed(2)}`;
      }).join(' ');
      return <polygon className="ms-thing__body" points={pts} />;
    }
    default:
      return <circle className="ms-thing__body ms-thing__body--dot" r={h * 0.5} />;
  }
}

/** A container drawn round a box of `w × h` centred on `cx, cy`. */
function Container({ kind, cx, cy, w: inner, h: innerH, dashed, tone, pad = 6 }: { kind: ArrayLayoutSpec['container']; cx: number; cy: number; w: number; h: number; dashed?: boolean; tone?: Tone; pad?: number }) {
  const cls = `ms-container${dashed ? ' ms-container--dashed' : ''}`;
  // Drawn as if `pad` were 6: small things (a picture option) get a closer rim.
  const k = pad / 6;
  const w = inner + 12 * (k - 1);
  const h = innerH + 12 * (k - 1);
  const x = cx - w / 2;
  const y = cy - h / 2;
  switch (kind) {
    case 'plate':
      return (
        <g className={cls} data-tone={tone}>
          <ellipse cx={cx} cy={cy} rx={w / 2 + 6} ry={h / 2 + 8} />
          <ellipse className="ms-container__rim" cx={cx} cy={cy} rx={w / 2 - 2} ry={h / 2} />
        </g>
      );
    case 'box':
      return (
        <g className={cls} data-tone={tone}>
          <rect x={x - 6} y={y - 6} width={w + 12} height={h + 12} />
          <line className="ms-container__rim" x1={x - 6} x2={x + w + 6} y1={y - 1} y2={y - 1} />
        </g>
      );
    case 'bag':
      return (
        <g className={cls} data-tone={tone}>
          <path d={`M${x - 6} ${y - 2}L${x - 2} ${y + h + 8}H${x + w + 2}L${x + w + 6} ${y - 2}Z`} />
          <path className="ms-container__rim" d={`M${cx - 6} ${y - 2}l6 -7l6 7`} />
        </g>
      );
    case 'car':
      return (
        <g className={cls} data-tone={tone}>
          <rect x={x - 8} y={y - 8} width={w + 16} height={h + 16} rx={10} />
          <circle className="ms-container__rim" cx={x + 6} cy={y + h + 10} r={4} />
          <circle className="ms-container__rim" cx={x + w - 6} cy={y + h + 10} r={4} />
        </g>
      );
    default:
      return (
        <g className={cls} data-tone={tone}>
          <rect x={x - 7} y={y - 7} width={w + 14} height={h + 14} rx={Math.min(w, h) / 2 + 7} />
        </g>
      );
  }
}

/* ------------------------------------------------------------------ */
/* Layout                                                              */
/* ------------------------------------------------------------------ */

/* ------------------------------------------------------------------ */
/* The model                                                           */
/* ------------------------------------------------------------------ */

export function ArrayModel(p: ArrayModelProps) {
  const { model: m, box, locale } = p;
  if (p.task && p.state && m.kind === 'array') {
    if (p.task.kind === 'group') return <GroupLayer {...p} />;
    if (p.task.kind === 'arrange') return <ArrangeLayer {...p} />;
    if (p.task.kind === 'split-array') return <SplitLayer {...p} />;
  }
  const { layouts, size, drawn, labelH, scale, x0, y0 } = arrayFrame(m, box, locale, { move: p.move, mini: p.mini, align: p.align });
  let ox = 0;
  let index = 0;
  const parts: ReactNode[] = [];
  drawn.forEach((d, li) => {
    const s = layouts[li]!;
    // Every move ends within 900 ms: dealt one at a time (360 ms each, the starts spread over 520 ms), groups 640 ms with their starts over 260 ms.
    const stagger = p.move === 'deal' ? Math.min(45, 520 / Math.max(1, d.things.length)) : Math.min(70, 260 / Math.max(1, groupSizes(s).length));
    parts.push(
      <g key={li} transform={`translate(${ox} ${labelH})`}>
        {labelH > 0 && s.label && (
          <text className="ms-array__title" x={d.w / 2} y={-14} textAnchor="middle">
            {tx(s.label, locale)}
          </text>
        )}
        {d.extras}
        {d.containers.map((c) => (
          <Container key={`c${c.index}`} kind={s.containers?.kind ?? s.container} cx={c.cx} cy={c.cy} w={c.w} h={c.h} dashed={c.dashed} tone={c.tone} pad={Math.min(6, size * 0.3)} />
        ))}
        {d.things.map((th, i) => {
          const k = index++;
          const group = p.move === 'group' && layoutOf(s) === 'groups' ? Math.floor(i / Math.max(1, groupSizes(s)[0] ?? 1)) : 0;
          return (
            <g key={k} className="ms-thing" data-tone={th.tone} data-crossed={th.crossed || undefined} style={{ transform: `translate(${th.x}px, ${th.y}px)`, transitionDelay: `${p.move === 'deal' ? i * stagger : group * stagger}ms` }}>
              <Thing object={s.object} s={size} />
              {th.crossed && <line className="ms-thing__strike" x1={-size * 0.45} x2={size * 0.45} y1={size * 0.45} y2={-size * 0.45} />}
            </g>
          );
        })}
        {d.braces}
      </g>,
    );
    ox += d.w + 50;
  });
  return (
    <g className="ms-array" role="img" aria-label={p.label} data-move={p.move ?? undefined} transform={`translate(${x0} ${y0}) scale(${scale})`}>
      {parts}
    </g>
  );
}

/* ------------------------------------------------------------------ */
/* Check layers                                                        */
/* ------------------------------------------------------------------ */

/** Groups: things loose on the tray, containers below; tap a container to put one in, a thing in it to take it out. */
function GroupLayer({ model: m, box, task, state, editable, act, ghost, locale, label }: ArrayModelProps) {
  if (!task || task.kind !== 'group' || !state) return null;
  const T = (key: Parameters<typeof t>[1], vars?: Record<string, string | number>) => t(locale, key, vars);
  const target = groupTarget(task);
  const loose = looseOf(task, state);
  const groups = state.groups;
  const live = !!editable && state.phase === 0;
  const pack = task.by === 'pack';
  // A box to start while packing (and room for one more container).
  const slots = groups.length + (pack && live && groups.length < MAX_GROUPS ? 1 : 0);
  const cap = Math.max(task.k, target.each, ...groups, 1);
  const pk = packOf(Math.min(cap, 12));
  const size = clamp(Math.min(box.w / (Math.max(slots, 3) * (pk.cols + 1.4) * 1.25 + 2), box.h / ((pk.rows + 1.6) * 1.25 + Math.sqrt(task.total) * 1.2 + 4)), 22, 56);
  const gap = size * 1.25;
  const cw = pk.cols * gap;
  const ch = pk.rows * gap;
  const perRow = slots > 6 ? Math.ceil(slots / 2) : Math.max(1, slots);
  const pitch = cw + size * 1.6;
  const trayW = Math.min(box.w - 20, Math.max(perRow * pitch, Math.max(6, Math.sqrt(task.total) * 1.9) * gap));
  const trayH = Math.min(box.h * 0.38, Math.max(gap * 2.2, (Math.ceil(task.total / Math.max(1, Math.floor(trayW / gap))) + 0.6) * gap));
  const totalH = trayH + 30 + Math.ceil(slots / perRow) * (ch + size * 2);
  const x0 = box.x + (box.w - Math.max(trayW, perRow * pitch)) / 2;
  const y0 = box.y + Math.max(0, (box.h - totalH) / 2);
  const looseCols = Math.max(1, Math.floor((trayW - 8) / gap));
  const cell = (g: number) => ({ cx: x0 + (g % perRow) * pitch + cw / 2, cy: y0 + trayH + 30 + Math.floor(g / perRow) * (ch + size * 2) + ch / 2 });
  const object = m.object;
  const kind = m.containers?.kind ?? (m.container === 'ring' && !m.containers ? (pack ? 'box' : 'plate') : m.container);
  const ghostGroups = ghost?.groups ?? null;
  const key = (g: number) => (e: KeyboardEvent<SVGGElement>) => {
    if (!live) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      act?.({ do: 'put', group: g });
    } else if (e.key === 'Backspace' || e.key === 'Delete') {
      e.preventDefault();
      act?.({ do: 'take', group: g });
    }
  };
  return (
    <g className="ms-array ms-array--task" role="group" aria-label={label}>
      <rect className="ms-array__tray" x={x0 - 6} y={y0 - 6} width={trayW + 12} height={trayH + 12} rx={8} aria-hidden="true" />
      {Array.from({ length: loose }, (_, i) => (
        <g key={`l${i}`} className="ms-thing" data-tone="cold" aria-hidden="true" style={{ transform: `translate(${x0 + (i % looseCols) * gap + gap / 2}px, ${y0 + Math.floor(i / looseCols) * gap + gap / 2}px)` }}>
          <Thing object={object} s={size} />
        </g>
      ))}
      <text className="ms-array__count" x={x0 + trayW} y={y0 + trayH + 18} textAnchor="end" aria-hidden="true">
        {T('math.array.left', { n: loose })}
      </text>
      {Array.from({ length: slots }, (_, g) => {
        const c = cell(g);
        const n = groups[g] ?? 0;
        const fresh = g >= groups.length;
        return (
          <g
            key={`g${g}`}
            className="ms-array__slot"
            role={live ? 'button' : undefined}
            tabIndex={live ? 0 : undefined}
            data-keys={live ? 'own' : undefined}
            aria-label={fresh ? T(pack ? 'math.array.newBox' : 'math.array.newPlate') : T('math.array.container', { i: g + 1, n })}
            onKeyDown={key(g)}
            onPointerDown={
              live
                ? (e: PointerEvent<SVGGElement>) => {
                    if (e.button !== 0) return;
                    e.preventDefault();
                    act?.({ do: 'put', group: g });
                  }
                : undefined
            }
          >
            <rect className="ms-array__hit" x={c.cx - cw / 2 - 12} y={c.cy - ch / 2 - 12} width={cw + 24} height={ch + 24} />
            <Container kind={kind} cx={c.cx} cy={c.cy} w={cw} h={ch} dashed={fresh} />
            {Array.from({ length: n }, (_, k) => (
              <g
                key={k}
                className="ms-thing"
                data-tone="mine"
                style={{ transform: `translate(${c.cx - cw / 2 + (k % pk.cols) * gap + gap / 2}px, ${c.cy - ch / 2 + Math.floor(k / pk.cols) * gap + gap / 2}px)` }}
                onPointerDown={
                  live
                    ? (e: PointerEvent<SVGGElement>) => {
                        if (e.button !== 0) return;
                        e.preventDefault();
                        e.stopPropagation();
                        act?.({ do: 'take', group: g });
                      }
                    : undefined
                }
              >
                <Thing object={object} s={size} />
              </g>
            ))}
            {!fresh && (
              <text className="ms-array__count" x={c.cx} y={c.cy + ch / 2 + 24} textAnchor="middle" aria-hidden="true">
                {n}
              </text>
            )}
            {ghostGroups && ghostGroups[g] !== undefined && (
              <text className="ms-array__ghost-count" x={c.cx} y={c.cy - ch / 2 - 16} textAnchor="middle" aria-hidden="true">
                {ghostGroups[g]}
              </text>
            )}
          </g>
        );
      })}
      {ghostGroups && ghostGroups.length > slots && (
        <text className="ms-array__ghost-count" x={x0} y={y0 + totalH + 6} aria-hidden="true">
          {T('math.array.groupsOf', { n: ghostGroups.length, k: ghostGroups[0] ?? 0 })}
        </text>
      )}
    </g>
  );
}

/** Arrange: an array laid out from the fixed top-left corner (tap a point, drag the corner handle, or the arrow keys on it). */
function ArrangeLayer({ model: m, box, task, state, editable, act, ghost, locale, label }: ArrayModelProps) {
  const dragging = useRef(false);
  if (!task || task.kind !== 'arrange' || !state) return null;
  const T = (key: Parameters<typeof t>[1], vars?: Record<string, string | number>) => t(locale, key, vars);
  const live = !!editable;
  const R = Math.min(12, Math.max(task.rows, task.cols) + 3);
  const C = R;
  const size = clamp(Math.min((box.w - 120) / (C * 1.25), (box.h - 80) / (R * 1.25), (box.h * ARRAY_SHARE * 1.3) / (R * 1.25)), 18, 64);
  const gap = size * 1.25;
  const x0 = box.x + (box.w - C * gap) / 2 + 30;
  const y0 = box.y + (box.h - R * gap) / 2 + 12;
  const [r, c] = state.arr ?? [0, 0];
  const g = ghost?.arr;
  const pointAt = (e: PointerEvent<SVGElement>) => {
    const b = (e.currentTarget as SVGGraphicsElement).ownerSVGElement?.getBoundingClientRect();
    if (!b) return null;
    const cc = Math.ceil((e.clientX - b.left - x0) / gap);
    const rr = Math.ceil((e.clientY - b.top - y0) / gap);
    return [clamp(rr, 1, R), clamp(cc, 1, C)] as const;
  };
  const key = (e: KeyboardEvent<SVGGElement>) => {
    const d = e.key === 'ArrowRight' ? [0, 1] : e.key === 'ArrowLeft' ? [0, -1] : e.key === 'ArrowDown' ? [1, 0] : e.key === 'ArrowUp' ? [-1, 0] : null;
    if (!d) return;
    e.preventDefault();
    // Like the tray's steppers: from 0 × 0, ↓ is the first row and → the first column.
    act?.({ do: 'arrange', rows: Math.max(0, r + d[0]!), cols: Math.max(0, c + d[1]!) });
  };
  return (
    <g className="ms-array ms-array--task" role="group" aria-label={label}>
      <g aria-hidden="true">
        {Array.from({ length: R * C }, (_, i) => (
          <circle key={i} className="ms-array__point" cx={x0 + (i % C) * gap + gap / 2} cy={y0 + Math.floor(i / C) * gap + gap / 2} r={1.6} />
        ))}
      </g>
      {Array.from({ length: r * c }, (_, i) => (
        <g key={i} className="ms-thing" data-tone="mine" aria-hidden="true" style={{ transform: `translate(${x0 + (i % c) * gap + gap / 2}px, ${y0 + Math.floor(i / c) * gap + gap / 2}px)` }}>
          <Thing object={m.object} s={size} />
        </g>
      ))}
      {r > 0 && <Brace x1={x0 - 14} x2={x0 - 14} y1={y0 + 3} y2={y0 + r * gap - 3} text={T(r === 1 ? 'math.array.row' : 'math.array.rows', { n: r })} side="left" />}
      {c > 0 && <Brace x1={x0 + 3} x2={x0 + c * gap - 3} y1={y0 - 12} y2={y0 - 12} text={T('math.array.each', { n: c })} side="top" />}
      {g && <rect className="ms-array__ghost" x={x0} y={y0} width={g[1] * gap} height={g[0] * gap} aria-hidden="true" />}
      {live && (
        <rect
          className="ms-array__hitarea"
          x={x0}
          y={y0}
          width={C * gap}
          height={R * gap}
          aria-hidden="true"
          onPointerDown={(e) => {
            if (e.button !== 0) return;
            e.preventDefault();
            dragging.current = true;
            (e.currentTarget as Element).setPointerCapture?.(e.pointerId);
            const pt = pointAt(e);
            if (pt) act?.({ do: 'arrange', rows: pt[0], cols: pt[1] });
          }}
          onPointerMove={(e) => {
            if (!dragging.current) return;
            const pt = pointAt(e);
            if (pt) act?.({ do: 'arrange', rows: pt[0], cols: pt[1] });
          }}
          onPointerUp={() => {
            dragging.current = false;
          }}
          onPointerCancel={() => {
            dragging.current = false;
          }}
        />
      )}
      {live && (
        <g
          className="ms-array__handle"
          role="slider"
          tabIndex={0}
          data-keys="arrows"
          aria-label={T('math.array.handle')}
          aria-valuemin={0}
          aria-valuemax={C}
          aria-valuenow={c}
          aria-valuetext={state.arr ? T('math.array.handleValue', { r, c }) : '—'}
          onKeyDown={key}
          transform={`translate(${x0 + c * gap} ${y0 + r * gap})`}
        >
          <circle className="ms-array__handle-hit" r={22} />
          <circle className="ms-array__handle-dot" r={7} />
        </g>
      )}
    </g>
  );
}

/** Split: the array with a cut between two rows (or columns); the two parts drawn apart, each with its count. */
function SplitLayer({ model: m, box, task, state, editable, act, ghost, locale, label }: ArrayModelProps) {
  const [cursor, setCursor] = useState<{ axis: 'rows' | 'cols'; at: number } | null>(null);
  if (!task || task.kind !== 'split-array' || !state) return null;
  const T = (key: Parameters<typeof t>[1], vars?: Record<string, string | number>) => t(locale, key, vars);
  const live = !!editable && state.phase === 0;
  const R = task.rows;
  const C = task.cols;
  const size = clamp(Math.min((box.w - 150) / (C * 1.25 + 0.5), (box.h - 90) / (R * 1.25 + 0.5), (box.h * ARRAY_SHARE) / (R * 1.25 + 0.5)), 16, 72);
  const gap = size * 1.25;
  const cut = parseArrayCut(state.cut);
  const apart = size * 0.6;
  const x0 = box.x + (box.w - C * gap) / 2 + 34;
  const y0 = box.y + (box.h - R * gap) / 2 + 14;
  const X = (c: number) => x0 + c * gap + (cut?.axis === 'cols' && c >= cut.at ? apart : 0);
  const Y = (r: number) => y0 + r * gap + (cut?.axis === 'rows' && r >= cut.at ? apart : 0);
  const cur = cursor ?? (cut ? cut : { axis: 'rows' as const, at: Math.min(R - 1, Math.max(1, Math.floor(R / 2))) });
  // The line between two rows (or columns), where it is drawn now the parts may sit apart.
  const draw = (c: { axis: 'rows' | 'cols'; at: number }) => {
    const shift = (axis: 'rows' | 'cols') => (cut?.axis === axis ? (c.at > cut.at ? apart : c.at === cut.at ? apart / 2 : 0) : 0);
    if (c.axis === 'rows') {
      const y = y0 + c.at * gap + shift('rows');
      return { x1: x0 - 10, x2: X(C - 1) + gap + 10, y1: y, y2: y };
    }
    const x = x0 + c.at * gap + shift('cols');
    return { x1: x, x2: x, y1: y0 - 10, y2: Y(R - 1) + gap + 10 };
  };
  const put = (c: { axis: 'rows' | 'cols'; at: number }) => {
    const k = `${c.axis === 'rows' ? 'r' : 'c'}${c.at}`;
    act?.({ do: 'arraycut', cut: state.cut === k ? null : k });
  };
  const key = (e: KeyboardEvent<SVGGElement>) => {
    const step = e.key === 'ArrowDown' ? ['rows', 1] : e.key === 'ArrowUp' ? ['rows', -1] : e.key === 'ArrowRight' ? ['cols', 1] : e.key === 'ArrowLeft' ? ['cols', -1] : null;
    if (step) {
      e.preventDefault();
      const axis = step[0] as 'rows' | 'cols';
      const max = axis === 'rows' ? R - 1 : C - 1;
      if (max < 1) return;
      const from = cur.axis === axis ? cur.at + (step[1] as number) : Math.max(1, Math.floor((max + 1) / 2));
      setCursor({ axis, at: clamp(from, 1, max) });
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      put(cur);
    }
  };
  const tap = (e: PointerEvent<SVGRectElement>) => {
    if (e.button !== 0) return;
    const b = (e.currentTarget as SVGGraphicsElement).ownerSVGElement?.getBoundingClientRect();
    if (!b) return;
    const gx = (e.clientX - b.left - x0) / gap;
    const gy = (e.clientY - b.top - y0) / gap;
    const nc = clamp(Math.round(gx), 1, Math.max(1, C - 1));
    const nr = clamp(Math.round(gy), 1, Math.max(1, R - 1));
    const c = R > 1 && (C < 2 || Math.abs(gy - nr) <= Math.abs(gx - nc)) ? { axis: 'rows' as const, at: nr } : { axis: 'cols' as const, at: nc };
    setCursor(c);
    put(c);
  };
  const gcut = parseArrayCut(ghost?.cut);
  const parts = cut ? (cut.axis === 'rows' ? [`${cut.at} × ${C}`, `${R - cut.at} × ${C}`] : [`${R} × ${cut.at}`, `${R} × ${C - cut.at}`]) : null;
  return (
    <g className="ms-array ms-array--task" role="group" aria-label={label}>
      {Array.from({ length: R * C }, (_, i) => {
        const r = Math.floor(i / C);
        const c = i % C;
        const second = cut ? (cut.axis === 'rows' ? r >= cut.at : c >= cut.at) : false;
        return (
          <g key={i} className="ms-thing" data-tone={second ? 'hot' : 'cold'} aria-hidden="true" style={{ transform: `translate(${X(c) + gap / 2}px, ${Y(r) + gap / 2}px)` }}>
            <Thing object={m.object} s={size} />
          </g>
        );
      })}
      <Brace x1={x0 - 16} x2={x0 - 16} y1={y0 + 3} y2={Y(R - 1) + gap - 3} text={T('math.array.rows', { n: R })} side="left" />
      <Brace x1={x0 + 3} x2={X(C - 1) + gap - 3} y1={y0 - 14} y2={y0 - 14} text={T('math.array.each', { n: C })} side="top" />
      {cut && <line className="ms-array__cut" {...draw(cut)} aria-hidden="true" />}
      {parts && cut && (
        <g className="ms-array__parts" aria-hidden="true">
          <text x={cut.axis === 'rows' ? X(C - 1) + gap + 14 : x0 + (cut.at * gap) / 2} y={cut.axis === 'rows' ? y0 + (cut.at * gap) / 2 + 5 : Y(R - 1) + gap + 22} textAnchor={cut.axis === 'rows' ? 'start' : 'middle'}>
            {parts[0]}
          </text>
          <text
            x={cut.axis === 'rows' ? X(C - 1) + gap + 14 : X(cut.at) + ((C - cut.at) * gap) / 2}
            y={cut.axis === 'rows' ? Y(cut.at) + ((R - cut.at) * gap) / 2 + 5 : Y(R - 1) + gap + 22}
            textAnchor={cut.axis === 'rows' ? 'start' : 'middle'}
          >
            {parts[1]}
          </text>
        </g>
      )}
      {gcut && <line className="ms-array__ghost-line" {...draw(gcut)} aria-hidden="true" />}
      {live && (
        <>
          <rect className="ms-array__hitarea" x={x0} y={y0} width={C * gap + (cut?.axis === 'cols' ? apart : 0)} height={R * gap + (cut?.axis === 'rows' ? apart : 0)} onPointerDown={tap} aria-hidden="true" />
          <g
            className="ms-array__cursor"
            role="slider"
            tabIndex={0}
            data-keys="arrows"
            aria-label={T('math.array.cursor')}
            aria-valuemin={1}
            aria-valuemax={Math.max(R, C) - 1}
            aria-valuenow={cur.at}
            aria-valuetext={T(cur.axis === 'rows' ? 'math.array.cutRows' : 'math.array.cutCols', { n: cur.at }) + (state.cut === `${cur.axis === 'rows' ? 'r' : 'c'}${cur.at}` ? T('math.grid.cutHere') : '')}
            onKeyDown={key}
          >
            <line className="ms-array__cursor-line" {...draw(cur)} />
          </g>
        </>
      )}
    </g>
  );
}

export { arrayFrame, arrayAspect, describeArray } from './array-layout';
