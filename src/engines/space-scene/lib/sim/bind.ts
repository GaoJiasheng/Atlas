/**
 * Try-it bindings → what the stage shows (docs/22 §4.3 S4; pure, unit-tested).
 * The stage applies these on top of the chapter state: visibility, a pose per
 * part (on top of the chapter / beat pose), glow, a count of `repeat` copies,
 * an offset or turn, an animation's speed or on / off, and per flow its
 * visibility, per-path intensity and colour.
 */
import type { SimBind, SimCondition, SimData, SimValue, SimValues } from '../../sim-schema';
import type { SimOutputs, SimOutputValue } from './index';
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
}

export interface SimEffects {
  /** Parts a `visible` binding hides. */
  hidden: Set<string>;
  /** Parts a `pose` binding moves: the pose name (null: rest). */
  poses: Map<string, string | null>;
  glow: Map<string, SimGlow>;
  /** Copies of a `repeat` part on show. */
  count: Map<string, number>;
  /** Scene-unit offset per part. */
  offset: Map<string, Vec3>;
  /** Turn about a unit axis through the part centre, degrees. */
  rotate: Map<string, { axis: Vec3; deg: number }>;
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

export function simEffects(sim: SimData, values: SimValues, outputs: SimOutputs): SimEffects {
  const out: SimEffects = {
    hidden: new Set(),
    poses: new Map(),
    glow: new Map(),
    count: new Map(),
    offset: new Map(),
    rotate: new Map(),
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
        if (b.count) out.count.set(id, Math.max(0, Math.round(num(v) * b.count.per)));
        if (b.offset) {
          const d = (num(v) - b.offset.origin) * b.offset.per;
          const a = normalize3(b.offset.axis);
          out.offset.set(id, [a[0] * d, a[1] * d, a[2] * d]);
        }
        if (b.rotate) out.rotate.set(id, { axis: normalize3(b.rotate.axis), deg: (num(v) - b.rotate.origin) * b.rotate.per });
      }
    } else if ('flow' in b) {
      const f = out.flows.get(b.flow) ?? { visible: true, paths: null, color: null };
      if (b.visible !== undefined && !holds(b.visible, v, first)) f.visible = false;
      if (b.intensity && v !== undefined && typeof v === 'object') {
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
