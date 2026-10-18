/**
 * Try-it bindings → what the stage shows (docs/22 §4.3 S4; pure, unit-tested).
 * The stage applies these on top of the chapter state: visibility, a pose per
 * part (on top of the chapter / beat pose), glow, tint, a count of `repeat`
 * copies, an offset (along an axis or to a ring position, eased or with a
 * damped bounce) or turn (with a damped swing, about a pivot), a coil's
 * stretch, the timeline channels a part plays (moves and turns), the field
 * state a filings part lays out, an animation's speed or on / off, and per
 * flow its visibility, per-path intensity, colour and field state.
 */
import type { SimBind, SimCondition, SimData, SimSettle, SimValue, SimValues, STRETCH_ANCHORS } from '../../sim-schema';
import type { SimOutputs, SimOutputValue } from './index';
import { isTimeline } from './timeline';
import { ringPoint } from './magnet';
import { normalize3, type Vec3 } from '../math';

export interface SimGlow {
  /** The binding's colour ref (`token:lamp`). */
  color: string;
  /** 0 = dark; 1 = full (`full`); above 1 brighter still (≤ 2). */
  level: number;
}

export interface SimFlowEffect {
  /** `false`: a binding stops the flow. */
  visible: boolean;
  /** Per path id: signed speed factor (−1…1 for |value| ≤ full, clamped at ±2); 0 = no particles on it. */
  paths: Record<string, number> | null;
  /** Particle colour ref while a state asks for one, else null (the flow's own). */
  color: string | null;
  /** The field state whose lines the flow runs along (a `state` binding), else null. */
  state: string | null;
}

/** A try-it turn: about a unit axis, degrees, with an optional damped swing. */
export interface SimTurn {
  axis: Vec3;
  deg: number;
  settle?: SimSettle;
  /** A scene point the turn is about (the part's posed centre without one). */
  pivot?: Vec3;
}

/** A timeline channel a part plays: a move along `axis` or a turn about `turn` (unit vectors) by the channel's value × `per`. */
export interface SimPlay {
  output: string;
  channel: string;
  axis?: Vec3;
  turn?: Vec3;
  per: number;
  pivot?: Vec3;
  each?: boolean;
}

/** A coil's stretch: `target` scene units (a number source), or a timeline `channel` × `per` (played). */
export interface SimStretch {
  target: number;
  output?: string;
  channel?: string;
  per: number;
  anchor: (typeof STRETCH_ANCHORS)[number];
  settle?: SimSettle;
}

export interface SimEffects {
  /** Parts a `visible` binding hides. */
  hidden: Set<string>;
  /** Parts a `pose` binding moves: the pose name (null: rest). */
  poses: Map<string, string | null>;
  glow: Map<string, SimGlow>;
  /** Tint toward a colour ref, level 0–1. */
  tint: Map<string, SimGlow>;
  /** Copies of a `repeat` part on show. */
  count: Map<string, number>;
  /** Scene-unit offset per part. */
  offset: Map<string, Vec3>;
  /** A damped bounce to the offset instead of the plain ease (`offset.settle`). */
  offsetSettle: Map<string, SimSettle>;
  /** A coil's stretch per part. */
  stretch: Map<string, SimStretch>;
  /** Timeline channels each part plays (they add up). */
  play: Map<string, SimPlay[]>;
  /** Turn about a unit axis through the part centre or a pivot, degrees. */
  rotate: Map<string, SimTurn>;
  /** The field state each filings part lays out. */
  states: Map<string, string>;
  /** Per animation id: rpm (a rotate's speed) and whether it plays. */
  animations: Map<string, { rpm?: number; enabled: boolean }>;
  flows: Map<string, SimFlowEffect>;
}

/** Below this share of `full` a path shows no particles. */
export const FLOW_FLOOR = 0.01;
/** The brightest glow level (a bulb pushed past its rating). */
export const MAX_GLOW = 2;

/** Truthy: on, a non-zero number, a state other than the output's first, a non-empty vector. */
function truthy(v: SimValue | SimOutputValue | undefined, firstState: string | undefined): boolean {
  if (typeof v === 'boolean') return v;
  if (isTimeline(v)) return v.duration > 0;
  if (typeof v === 'number') return Math.abs(v) > 1e-9;
  if (typeof v === 'string') return v !== '' && v !== firstState;
  return v !== undefined && Object.values(v).some((x) => Math.abs(x) > 1e-9);
}

export function holds(cond: SimCondition, v: SimValue | SimOutputValue | undefined, firstState?: string): boolean {
  if (cond === true) return truthy(v, firstState);
  if ('eq' in cond) return v === cond.eq;
  if ('ne' in cond) return v !== cond.ne;
  if ('in' in cond) return cond.in.some((x) => x === v);
  if (typeof v !== 'number') return false;
  if ('gte' in cond) return v >= cond.gte;
  return v <= cond.lte;
}

const num = (v: SimValue | SimOutputValue | undefined) => (typeof v === 'number' ? v : typeof v === 'boolean' ? (v ? 1 : 0) : 0);

/** Offsets of several bindings on one part add up. */
function add(map: Map<string, Vec3>, id: string, d: Vec3): void {
  const o = map.get(id);
  map.set(id, o ? [o[0] + d[0], o[1] + d[1], o[2] + d[2]] : d);
}

/**
 * The tint a material slot takes: a try-it tint (`tint` binding) colours the
 * part's own material only (slot 0, like `glow`: the iron core, not the
 * leads, stand or clips drawn with it); the chapter / exercise highlight
 * colours the other slots, and slot 0 too while no try-it tint is bound.
 */
export function slotTint<T>(slot: number, highlight: T, sim: T | null): T {
  return slot === 0 && sim !== null ? sim : highlight;
}

export function simEffects(sim: SimData, values: SimValues, outputs: SimOutputs): SimEffects {
  const out: SimEffects = {
    hidden: new Set(),
    poses: new Map(),
    glow: new Map(),
    tint: new Map(),
    count: new Map(),
    offset: new Map(),
    offsetSettle: new Map(),
    stretch: new Map(),
    play: new Map(),
    rotate: new Map(),
    states: new Map(),
    animations: new Map(),
    flows: new Map(),
  };
  const firstState = new Map(sim.outputs.map((o) => [o.id, Object.keys(o.states ?? {})[0]]));
  for (const b of sim.bind as SimBind[]) {
    const v = b.control !== undefined ? values[b.control] : outputs[b.output!];
    const first = b.output !== undefined ? firstState.get(b.output) : undefined;
    if ('part' in b) {
      const ids = Array.isArray(b.part) ? b.part : [b.part];
      for (const id of ids) {
        if (b.visible !== undefined && !holds(b.visible, v, first)) out.hidden.add(id);
        if (b.pose) {
          const name = b.pose[String(v)];
          // Another binding's pose for the same part wins only if this one would leave it at rest.
          if (name !== undefined && name !== null) out.poses.set(id, name);
          else if (!out.poses.has(id)) out.poses.set(id, null);
        }
        if (b.glow) {
          const x = Math.min(MAX_GLOW, Math.max(0, num(v) / b.glow.full));
          out.glow.set(id, { color: b.glow.color, level: b.glow.curve === 'sqrt' ? Math.sqrt(x) : x });
        }
        if (b.tint) {
          const x = Math.min(1, Math.max(0, num(v) / b.tint.full));
          out.tint.set(id, { color: b.tint.color, level: b.tint.curve === 'sqrt' ? Math.sqrt(x) : x });
        }
        if (b.count) out.count.set(id, Math.max(0, Math.round(b.count === true ? num(v) : (num(v) - b.count.minus) / b.count.per)));
        if (b.offset) {
          const d = (num(v) - b.offset.origin) * b.offset.per;
          const a = normalize3(b.offset.axis);
          add(out.offset, id, [a[0] * d, a[1] * d, a[2] * d]);
          if (b.offset.settle) out.offsetSettle.set(id, b.offset.settle);
        }
        if (b.stretch) {
          const st = b.stretch;
          const e: SimStretch = { target: st.channel !== undefined ? 0 : num(v) * st.per, per: st.per, anchor: st.anchor };
          if (st.channel !== undefined && b.output !== undefined) {
            e.output = b.output;
            e.channel = st.channel;
          }
          if (st.settle) e.settle = st.settle;
          out.stretch.set(id, e);
        }
        const pw = b.play?.when;
        const playing = !pw || holds(pw.is, pw.control !== undefined ? values[pw.control] : outputs[pw.output!], pw.output !== undefined ? firstState.get(pw.output) : undefined);
        if (b.play && b.output !== undefined && playing) {
          const p = b.play;
          const e: SimPlay = { output: b.output, channel: p.channel, per: p.per };
          if (p.axis) e.axis = normalize3(p.axis);
          if (p.turn) e.turn = normalize3(p.turn);
          if (p.pivot) e.pivot = p.pivot;
          if (p.each) e.each = true;
          out.play.set(id, [...(out.play.get(id) ?? []), e]);
        }
        if (b.at !== undefined) {
          const ring = sim.magnet?.rings?.[b.at];
          const c = sim.controls.find((x) => x.id === b.control);
          if (ring && c?.kind === 'step') {
            const to = ringPoint(ring, num(v));
            const from = ringPoint(ring, c.default);
            add(out.offset, id, [to[0] - from[0], to[1] - from[1], to[2] - from[2]]);
          }
        }
        if (b.rotate) {
          const turn: SimTurn = { axis: normalize3(b.rotate.axis), deg: (num(v) - b.rotate.origin) * b.rotate.per };
          if (b.rotate.settle) turn.settle = b.rotate.settle;
          if (b.rotate.pivot) turn.pivot = b.rotate.pivot;
          out.rotate.set(id, turn);
        }
        if (b.state && typeof v === 'string') out.states.set(id, v);
      }
    } else if ('flow' in b) {
      const f = out.flows.get(b.flow) ?? { visible: true, paths: null, color: null, state: null };
      if (b.state && typeof v === 'string') f.state = v;
      if (b.visible !== undefined && !holds(b.visible, v, first)) f.visible = false;
      if (b.intensity && v !== undefined && typeof v === 'object' && !isTimeline(v)) {
        const full = b.intensity.full;
        f.paths = Object.fromEntries(
          Object.entries(v).map(([id, x]) => [id, Math.abs(x) < full * FLOW_FLOOR ? 0 : Math.max(-2, Math.min(2, x / full))]),
        );
      }
      if (b.stops && typeof v === 'string' && b.stops[v] !== undefined) f.color = b.stops[v]!;
      out.flows.set(b.flow, f);
    } else {
      const a = out.animations.get(b.animation) ?? { enabled: true };
      if (b.rpm) a.rpm = num(v) * b.rpm.per;
      if (b.enabled !== undefined && !holds(b.enabled, v, first)) a.enabled = false;
      out.animations.set(b.animation, a);
    }
  }
  return out;
}
