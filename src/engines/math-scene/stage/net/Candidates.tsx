/**
 * The child's layer on a flat net (docs/39 §3.5): `complete-net` — every
 * place a face may go is a dashed square (or rectangle, or face) with a +,
 * a button of at least 44 px (`aria-pressed`): tap to put a face there, tap
 * again to take it away; `tap-face` — every face is a button. One tab stop
 * each: the arrow keys move to the nearest place in that direction, Enter or
 * Space acts (`data-keys="arrows"`: the chapter keys stay with the page).
 */
import { useRef, useState, type KeyboardEvent } from 'react';
import type { Locale } from '../../../core/types';
import { t } from '../../../../i18n';
import type { TaskOf } from '../../schema';
import type { Action, TaskState } from '../../lib/state';
import type { Net, P2 } from '../../lib/net';
import { candidatePolys, candidatesOf } from '../../lib/net-tasks';
import { pieceShapes } from '../../lib/net';
import type { Fit } from '../../lib/project';
import type { Pose } from '../../lib/net-view';
import { screenOf } from './Faces';

const MIN_HIT = 44;
const path = (pts: readonly P2[]) => `M${pts.map((p) => `${p[0].toFixed(2)},${p[1].toFixed(2)}`).join('L')}Z`;
const centre = (pts: readonly P2[]): P2 => [pts.reduce((s, p) => s + p[0], 0) / pts.length, pts.reduce((s, p) => s + p[1], 0) / pts.length];
const flat = (pts: readonly P2[]): [number, number, number][] => pts.map(([x, y]) => [x, y, 0]);

/** The place nearest `from` in the direction of an arrow key (`null`: none that way). */
export function nextInDirection(points: readonly P2[], from: number, key: string): number | null {
  const d: P2 | null = key === 'ArrowRight' ? [1, 0] : key === 'ArrowLeft' ? [-1, 0] : key === 'ArrowUp' ? [0, -1] : key === 'ArrowDown' ? [0, 1] : null;
  const o = points[from];
  if (!d || !o) return null;
  let best: number | null = null;
  let score = Infinity;
  points.forEach((p, i) => {
    if (i === from) return;
    const v: P2 = [p[0] - o[0], p[1] - o[1]];
    const along = v[0] * d[0] + v[1] * d[1];
    if (along <= 1e-6) return;
    const across = Math.abs(v[0] * d[1] - v[1] * d[0]);
    const sc = along + 2 * across;
    if (sc < score) {
      score = sc;
      best = i;
    }
  });
  return best;
}

/** Roving focus over a set of buttons placed at `points`. */
function useRoving(count: number) {
  const [at, setAt] = useState(0);
  const refs = useRef<(SVGGElement | null)[]>([]);
  const focus = (i: number) => {
    setAt(i);
    refs.current[i]?.focus();
  };
  return { at: Math.min(at, Math.max(0, count - 1)), refs, focus, setAt };
}

function onKeys(e: KeyboardEvent<SVGGElement>, i: number, points: P2[], go: (i: number) => void, press: () => void) {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault();
    press();
    return;
  }
  const j = nextInDirection(points, i, e.key);
  if (e.key.startsWith('Arrow')) e.preventDefault();
  if (j !== null) go(j);
}

export function NetCandidates({ task, state, pose, fit, act, locale }: { task: TaskOf<'complete-net'>; state: TaskState; pose: Pose; fit: Fit; act(a: Action): void; locale: Locale }) {
  const placed = state.nplaced;
  const cands = candidatesOf(task, placed);
  const polys = new Map(candidatePolys(task, placed).map((c) => [c.key, c.poly]));
  const full = placed.length >= task.add;
  const shown = cands.filter((c) => placed.includes(c.key) || !full);
  const screens = shown.map((c) => screenOf(flat(polys.get(c.key) ?? []), pose, fit));
  const points = screens.map(centre);
  const r = useRoving(shown.length);
  const where = (key: string, i: number) => {
    const c = cands.find((x) => x.key === key)!;
    if (c.cell) return t(locale, 'math.net.where.cell', { x: c.cell[0] + 1, y: c.cell[1] + 1 });
    if (c.rect) return t(locale, 'math.net.where.rect', { i: i + 1, w: c.rect[2], h: c.rect[3] });
    return t(locale, 'math.net.where.face', { i: i + 1, face: c.pair![0], on: c.pair![1] });
  };
  return (
    <g className="ms-net__cands" data-keys="arrows" role="group" aria-label={t(locale, 'math.tray.placed', { n: placed.length, m: task.add })}>
      {shown.map((c, i) => {
        const s = screens[i]!;
        const [cx, cy] = points[i]!;
        const on = placed.includes(c.key);
        const xs = s.map((q) => q[0]);
        const ys = s.map((q) => q[1]);
        const w = Math.max(MIN_HIT, Math.max(...xs) - Math.min(...xs));
        const h = Math.max(MIN_HIT, Math.max(...ys) - Math.min(...ys));
        const press = () => act({ do: 'nplace', key: c.key });
        return (
          <g
            key={c.key}
            ref={(el) => {
              r.refs.current[i] = el;
            }}
            className="ms-net__cand"
            role="button"
            tabIndex={i === r.at ? 0 : -1}
            aria-pressed={on}
            aria-label={t(locale, on ? 'math.net.placedHere' : 'math.net.place', { where: where(c.key, Number.isNaN(Number(c.key)) ? i : Number(c.key)) })}
            data-cand={c.key}
            data-on={on || undefined}
            onClick={press}
            onFocus={() => r.setAt(i)}
            onKeyDown={(e) => onKeys(e, i, points, r.focus, press)}
          >
            <rect className="ms-net__hit" x={cx - w / 2} y={cy - h / 2} width={w} height={h} />
            {!on && <path className="ms-net__slot" d={path(s)} />}
            {!on && (
              <text className="ms-net__plus" x={cx} y={cy} dy="0.36em" textAnchor="middle" aria-hidden="true">
                +
              </text>
            )}
          </g>
        );
      })}
    </g>
  );
}

export function NetFaceButtons({ net, pose, fit, mark, tapped, enabled, act, locale }: { net: Net; pose: Pose; fit: Fit; mark: number | null; tapped: number | null; enabled: boolean; act(a: Action): void; locale: Locale }) {
  const shapes = pieceShapes(net);
  const screens = net.nodes.map((n) => screenOf(flat(n.poly), pose, fit));
  const points = screens.map(centre);
  const r = useRoving(net.nodes.length);
  const name = (i: number) => {
    const key = net.nodes[i]!.key;
    if (/^\d+,\d+$/.test(key)) {
      const [x, y] = key.split(',').map(Number);
      return t(locale, 'math.net.where.cell', { x: x! + 1, y: y! + 1 });
    }
    return `${t(locale, `math.net.shape.${shapes[i]!}`)} ${i + 1}`;
  };
  return (
    <g className="ms-net__taps" data-keys="arrows" role="group">
      {net.nodes.map((_, i) => {
        const press = () => act({ do: 'ntap', node: i });
        const given = i === mark;
        return (
          <g
            key={i}
            ref={(el) => {
              r.refs.current[i] = el;
            }}
            className="ms-net__tap"
            role="button"
            tabIndex={enabled && i === r.at ? 0 : -1}
            aria-pressed={tapped === i}
            aria-disabled={!enabled || given || undefined}
            aria-label={t(locale, 'math.net.faceButton', { where: name(i) }) + (given ? ` · ${t(locale, 'math.net.given')}` : '')}
            data-face={i}
            data-on={tapped === i || undefined}
            onClick={enabled && !given ? press : undefined}
            onFocus={() => r.setAt(i)}
            onKeyDown={enabled ? (e) => onKeys(e, i, points, r.focus, () => !given && press()) : undefined}
          >
            <path className="ms-net__hit" d={path(screens[i]!)} />
          </g>
        );
      })}
    </g>
  );
}
