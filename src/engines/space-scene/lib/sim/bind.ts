/**
 * Try-it bindings → what the stage shows (docs/22 §4.3 S4; pure, unit-tested).
 * The stage applies these on top of the chapter state: visibility, a pose per
 * part (on top of the chapter / beat pose), glow, tint, a count of `repeat`
 * copies, an offset (along an axis or to a ring position, eased or with a
 * damped bounce) or turn (with a damped swing, about a pivot), a coil's
 * stretch, the timeline channels a part plays (moves and turns), the field
 * state a filings part lays out, an animation's speed or on / off, and per
 * flow its visibility, per-path intensity (speed or particle density),
 * colour and field state.
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

export interface SimFill {
  volume: number;
  below: number;
  meniscus: number;
  ease: number;
}

export interface SimFlowEffect {
  visibility?: Record<string, boolean>;
  /** `false`: a binding stops the flow. */
  visible: boolean;
  /**
   * Per path id: `speed` mode — signed speed factor (−1…1 for |value| ≤
   * full, clamped at ±2); `density` mode — the share of the path's particles
   * on show (0–1; negative runs against the path). 0 = no particles on it.
   */
  paths: Record<string, number> | null;
  /** How `paths` reads (the intensity binding's `mode`). */
  mode: 'speed' | 'density';
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

/** A point on a sphere, with optional facing toward its centre. */
export interface SimPlace {
  direction: Vec3;
  centre: Vec3;
  radius: number;
  face?: 'centre';
}

/** Spherical interpolation, including coincident and opposite directions; writes into `out`. */
export function placeDirection(from: Vec3, to: Vec3, t: number, out: Vec3): void {
  const dot = Math.max(-1, Math.min(1, from[0] * to[0] + from[1] * to[1] + from[2] * to[2]));
  if (dot > 0.999999) {
    for (let i = 0; i < 3; i++) out[i] = from[i]! + (to[i]! - from[i]!) * t;
  } else if (dot < -0.999999) {
    // Pick a stable perpendicular so a half-circle still stays on the sphere.
    const x = Math.abs(from[0]) < 0.9 ? 1 : 0;
    const y = x ? 0 : 1;
    const d = from[0] * x + from[1] * y;
    const px = x - d * from[0], py = y - d * from[1], pz = -d * from[2];
    const n = Math.hypot(px, py, pz);
    const c = Math.cos(Math.PI * t), k = Math.sin(Math.PI * t) / n;
    out[0] = from[0] * c + px * k;
    out[1] = from[1] * c + py * k;
    out[2] = from[2] * c + pz * k;
  } else {
    const angle = Math.acos(dot), den = Math.sin(angle);
    const a = Math.sin((1 - t) * angle) / den, b = Math.sin(t * angle) / den;
    for (let i = 0; i < 3; i++) out[i] = from[i]! * a + to[i]! * b;
  }
  const length = Math.hypot(...out);
  for (let i = 0; i < 3; i++) out[i] = out[i]! / length;
}

export interface SimEffects {
  /** Parts a `visible` binding hides. */
  hidden: Set<string>;
  /** Parts a `pose` binding moves: the pose name (null: rest). */
  poses: Map<string, string | null>;
  glow: Map<string, SimGlow>;
  /** Tint toward a colour ref, actual blend strength 0–1 (binding `max`, default .55). */
  tint: Map<string, SimGlow>;
  /** Copies of a `repeat` part on show. */
  count: Map<string, number>;
  fill: Map<string, SimFill>;
  /** Scene-unit offset per part. */
  offset: Map<string, Vec3>;
  place: Map<string, SimPlace>;
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
    fill: new Map(),
    offset: new Map(),
    place: new Map(),
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
          // Unmapped values leave the chapter / beat pose intact; only explicit null requests rest.
          // A named pose wins over explicit rest when several bindings target the same part.
          if (name !== undefined && name !== null) out.poses.set(id, name);
          else if (name === null && !out.poses.has(id)) out.poses.set(id, null);
        }
        if (b.glow) {
          const x = Math.min(MAX_GLOW, Math.max(0, num(v) / b.glow.full));
          out.glow.set(id, { color: b.glow.color, level: b.glow.curve === 'sqrt' ? Math.sqrt(x) : x });
        }
        if (b.tint) {
          const x = Math.min(1, Math.max(0, num(v) / b.tint.full));
          out.tint.set(id, { color: b.tint.color, level: (b.tint.curve === 'sqrt' ? Math.sqrt(x) : x) * b.tint.max });
        }
        if (b.fill) out.fill.set(id, { volume: Math.max(0, num(v) * b.fill.per), below: b.fill.below * b.fill.per, meniscus: b.fill.meniscus, ease: b.fill.ease });
        if (b.count) out.count.set(id, Math.max(0, Math.round(b.count === true ? num(v) : (num(v) - b.count.minus) / b.count.per)));
        if (b.offset) {
          const d = (num(v) - b.offset.origin) * b.offset.per;
          const a = normalize3(b.offset.axis);
          add(out.offset, id, [a[0] * d, a[1] * d, a[2] * d]);
          if (b.offset.settle) out.offsetSettle.set(id, b.offset.settle);
        }
        if (b.place && v && typeof v === 'object' && !isTimeline(v)) {
          const direction = normalize3([v.x ?? 0, v.y ?? 0, v.z ?? 0]);
          out.place.set(id, { direction, centre: b.place.centre, radius: b.place.radius, ...(b.place.face ? { face: b.place.face } : {}) });
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
      const f: SimFlowEffect = out.flows.get(b.flow) ?? { visible: true, paths: null, mode: 'speed', color: null, state: null };
      if (b.state && typeof v === 'string') f.state = v;
      if (b.visible !== undefined) {
        if (b.paths) {
          f.visibility ??= {};
          for (const path of b.paths) f.visibility[path] = (f.visibility[path] ?? true) && holds(b.visible, v, first);
        } else if (!holds(b.visible, v, first)) f.visible = false;
      }
      if (b.intensity && v !== undefined && typeof v === 'object' && !isTimeline(v)) {
        const { full, mode } = b.intensity;
        const cap = mode === 'density' ? 1 : 2;
        // A vector keyed `<flow>:<path>` (the energy model's `paths`) gives this flow the entries that start with its id.
        const prefix = `${b.flow}:`;
        const own = Object.entries(v).flatMap(([id, x]): [string, number][] => (id.startsWith(prefix) ? [[id.slice(prefix.length), x]] : id.includes(':') ? [] : [[id, x]]));
        f.paths = Object.fromEntries(own.map(([id, x]) => [id, Math.abs(x) < full * FLOW_FLOOR ? 0 : Math.max(-cap, Math.min(cap, x / full))]));
        f.mode = mode;
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
