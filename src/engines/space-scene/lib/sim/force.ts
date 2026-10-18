/**
 * The forces model (docs/30 §4.2, sim `kind: 'force'`; pure, synchronous,
 * deterministic, well under a millisecond): six small sub-models, each one
 * optional (a quantity of a sub-model the data leaves out is not offered).
 * g is `force.g` (9.8 N/kg by default). Readings are rounded only for show
 * (the outputs' `decimals`); the model keeps full precision.
 *
 *  1. push   — a toy car on the runway gets a short push: a velocity change Δv
 *              (per option of a choice control) at the push point, from rest or
 *              moving at `speed`; then it rolls on, slowing at c g, to a stop or
 *              the runway's end. `effect` (starts / speeds-up / slows-down /
 *              stops / turns / none), `speed-before`, `speed-after`, `push-run`.
 *              `magnet` (a toggle) swaps the rod's push for a fixed magnet push
 *              (`magnet-run`; `push-run` is then still).
 *  2. fall   — two objects let go together from a height: dv/dt = g − (½ ρ C A ÷ m) v²,
 *              stepped explicitly in 1 ms; `t-left`, `t-right`, `landing`
 *              (together within 0.03 s), `drop-run`; `weight` (m g) of the
 *              object on the weighing balance, `weigh-note`.
 *  3. slide  — a block pulled across a surface: `f-start` = μs m g, `f-move` = μk m g;
 *              `pull-run`: the pull rises to f-start while the block holds,
 *              then drops to f-move while it slides at a steady speed.
 *  4. roll   — a car released at height h on the ramp (losing `loss` of its
 *              energy), slowing on the runway at c g: `distance` = (1 − loss) h ÷ c,
 *              `run-time`, `run-end` (stops / off-end), `car-run`.
 *  5. spring — a spring loaded in grams: 1 per50 cm per 50 g up to `limit`,
 *              faster past it (`beyond`), a set left after unloading (`set`):
 *              `extension`, `spring-length`, `load-weight`, `returns`.
 *  6. brake  — a wheel spinning at `rps`, slowed by hub friction and two brake
 *              pads: τ = hub + 2 μ N r; `stop-time` = I ω ÷ τ, `turns`, `wheel-run`.
 *
 * Timeline channels (lib/sim/timeline.ts; `play` / `stretch` bindings and
 * force arrows read them): push-run and magnet-run `x`, `z` (m along and
 * across the runway from where the car is drawn, at the push point),
 * `heading` (° from +X toward +Z: bind `turn: [0, -1, 0]`), `spin` (° the
 * wheels turn), `push` (the arrow's value while the push lasts); drop-run one
 * channel per object id (m fallen) and `<id>-sway` (°, an object with
 * `sway`); pull-run `x` (m the block slid), `pull` and `friction` (N);
 * car-run `dx`, `dy` (m from the foot of the ramp, where the car is drawn),
 * `pitch` (° the car leans on the ramp, nose down: bind `turn: [0, 0, -1]`),
 * `spin` (°); wheel-run `spin` (° about the axle) and `brake` (N at the pads).
 */
import type { ForceData, SimValues } from '../../sim-schema';
import { EMPTY_TIMELINE, seg, thinSamples, type Timeline, type TimelineSegment } from './timeline';

/** Integration step of a fall (s). */
export const FALL_STEP = 0.001;
/** Sample spacing of a fall's timeline (s). */
export const FALL_SAMPLE = 0.01;
/** Two landings closer than this (s) are "together". */
const TOGETHER = 0.03;
/** Below this (m/s) the car counts as standing still. */
const STILL = 0.01;
/** A turn of more than this (°) is a change of direction. */
const TURNS = 10;
/** Within ±5 % the speed is "about the same". */
const SAME = 0.05;
/** A weight below this (N) is too light for a school balance (reads 0.0). */
const BALANCE_FLOOR = 0.05;
/** The pull drops from f-start to f-move over this long once the block slips (s). */
const SLIP = 0.1;
/** The push lasts this long (the arrow shows) (s). */
const PUSH_SPAN = 0.15;
/** A car standing at the push point waits this long before it is pushed (s). */
const REST_WAIT = 0.3;
const DEG = 180 / Math.PI;

/** Model quantities by sub-model, with their kind (outputs' `from`). */
export const FORCE_MODEL = {
  push: { effect: 'state', 'speed-before': 'number', 'speed-after': 'number', 'push-run': 'timeline' },
  magnet: { 'magnet-run': 'timeline' },
  fall: { 't-left': 'number', 't-right': 'number', landing: 'state', 'drop-run': 'timeline', weight: 'number', 'weigh-note': 'state' },
  slide: { 'f-start': 'number', 'f-move': 'number', 'pull-run': 'timeline' },
  roll: { distance: 'number', 'run-time': 'number', 'run-end': 'state', 'car-run': 'timeline' },
  spring: { extension: 'number', 'spring-length': 'number', 'load-weight': 'number', returns: 'state' },
  brake: { 'stop-time': 'number', turns: 'number', 'wheel-run': 'timeline' },
} as const;

/** The states each state quantity can take (an output must label every one). */
export const FORCE_STATES: Readonly<Record<string, readonly string[]>> = {
  effect: ['none', 'starts', 'speeds-up', 'slows-down', 'stops', 'turns'],
  landing: ['together', 'left-first', 'right-first'],
  'weigh-note': ['none', 'reads', 'too-light'],
  'run-end': ['stops', 'off-end'],
  returns: ['loaded', 'returns', 'stays-longer'],
};

/** Which sub-model gives a quantity, and its kind. */
export function forceQuantity(name: string): { model: keyof typeof FORCE_MODEL; kind: 'number' | 'state' | 'timeline' } | null {
  for (const [model, q] of Object.entries(FORCE_MODEL)) {
    const kind = (q as Record<string, 'number' | 'state' | 'timeline'>)[name];
    if (kind) return { model: model as keyof typeof FORCE_MODEL, kind };
  }
  return null;
}

/** The channels a timeline quantity of this data has (for validation of `play` / `stretch` / arrows). */
export function forceTimelineChannels(f: ForceData, quantity: string): string[] | null {
  switch (quantity) {
    case 'push-run':
    case 'magnet-run':
      return ['x', 'z', 'heading', 'spin', 'push'];
    case 'drop-run':
      return f.fall ? Object.entries(f.fall.objects).flatMap(([id, o]) => (o.sway ? [id, `${id}-sway`] : [id])) : [];
    case 'pull-run':
      return ['x', 'pull', 'friction'];
    case 'car-run':
      return ['dx', 'dy', 'pitch', 'spin'];
    case 'wheel-run':
      return ['spin', 'brake'];
    default:
      return null;
  }
}

const num = (v: unknown, d = 0) => (typeof v === 'number' ? v : d);
const str = (v: unknown, d = '') => (typeof v === 'string' ? v : d);

/* ------------------------------------------------------------------ */
/* 1. push (and the magnet push)                                       */
/* ------------------------------------------------------------------ */

export interface PushResult {
  effect: string;
  before: number;
  after: number;
  run: Timeline;
}

/** The effect of a push from velocity v0 to v1 (m/s, in the runway plane). */
export function pushEffect(v0: readonly [number, number], v1: readonly [number, number]): string {
  const s0 = Math.hypot(v0[0], v0[1]);
  const s1 = Math.hypot(v1[0], v1[1]);
  if (s0 < STILL && s1 >= STILL) return 'starts';
  if (s1 < STILL && s0 >= STILL) return 'stops';
  if (s0 >= STILL && s1 >= STILL) {
    const turn = Math.abs(Math.atan2(v0[0] * v1[1] - v0[1] * v1[0], v0[0] * v1[0] + v0[1] * v1[1])) * DEG;
    if (turn > TURNS) return 'turns';
  }
  if (s1 > s0 * (1 + SAME)) return 'speeds-up';
  if (s1 < s0 * (1 - SAME)) return 'slows-down';
  return 'none';
}

/**
 * The car's run with a push of Δv at the push point: rolling in from the
 * runway's start (moving) or standing there (rest), pushed for 0.15 s
 * (the `push` channel), then slowing at c g along its new direction until it
 * stops or reaches the end stop. Positions are relative to the push point.
 */
export function pushRun(p: NonNullable<ForceData['push']>, g: number, c: number, moving: boolean, dv: readonly number[], key: string, arrowPer: number): PushResult {
  const a = c * g;
  const v0: [number, number] = [moving ? p.speed : 0, 0];
  const v1: [number, number] = [v0[0] + (dv[0] ?? 0), v0[1] + (dv[2] ?? 0)];
  const s1 = Math.hypot(v1[0], v1[1]);
  const effect = pushEffect(v0, v1);
  const approach = p.approach ?? p.at;
  const wheel = p.wheel;
  // In: from the runway's start, slowing at c g, to reach the push point at v0.
  const vIn = moving ? Math.sqrt(p.speed * p.speed + 2 * a * approach) : 0;
  const tIn = moving ? (vIn - p.speed) / a : REST_WAIT;
  // Out: along v1 until it stops or the car's x reaches the runway's end.
  const dir: [number, number] = s1 >= STILL ? [v1[0] / s1, v1[1] / s1] : [1, 0];
  let tOut = s1 >= STILL ? s1 / a : 0;
  const room = p.runway - p.at;
  if (dir[0] > 1e-9 && s1 >= STILL) {
    const stop = (s1 * s1) / (2 * a);
    if (stop * dir[0] > room) {
      // The end stop: the time at which the distance along v1 reaches room ÷ cos.
      const d = room / dir[0];
      tOut = (s1 - Math.sqrt(Math.max(0, s1 * s1 - 2 * a * d))) / a;
    }
  }
  const tp = tIn;
  const x: TimelineSegment[] = [];
  const z: TimelineSegment[] = [];
  const spin: TimelineSegment[] = [];
  const k = DEG / wheel;
  if (moving) {
    x.push(seg(0, tp, -approach, vIn, -a));
    spin.push(seg(0, tp, 0, vIn * k, -a * k));
  } else {
    x.push(seg(0, tp, 0));
    spin.push(seg(0, tp, 0));
  }
  z.push(seg(0, tp, 0));
  const spun = moving ? approach * k : 0;
  if (tOut > 0) {
    x.push(seg(tp, tp + tOut, 0, s1 * dir[0], -a * dir[0]));
    z.push(seg(tp, tp + tOut, 0, s1 * dir[1], -a * dir[1]));
    spin.push(seg(tp, tp + tOut, spun, s1 * k, -a * k));
  }
  const heading = Math.atan2(dir[1], dir[0]) * DEG;
  const duration = Math.max(tp + tOut, tp + PUSH_SPAN);
  const push = Math.hypot(dv[0] ?? 0, dv[2] ?? 0) * arrowPer;
  const run: Timeline = {
    kind: 'timeline',
    key,
    duration,
    slow: 1,
    channels: {
      x: { segments: x },
      z: { segments: z },
      spin: { segments: spin },
      heading: { segments: [seg(0, tp, 0), seg(tp, duration, s1 >= STILL ? heading : 0)] },
      push: { segments: [seg(0, tp, 0), seg(tp, tp + PUSH_SPAN, push), seg(tp + PUSH_SPAN, duration, 0)] },
    },
  };
  return { effect, before: Math.hypot(v0[0], v0[1]), after: s1, run };
}

/* ------------------------------------------------------------------ */
/* 2. fall                                                             */
/* ------------------------------------------------------------------ */

export interface FallObject {
  m: number;
  cd: number;
  area: number;
}

/** Falling `h` metres from rest with air drag: the time (s) and samples [t, fallen m] every `sample` s (and at landing). */
export function fallRun(o: FallObject, h: number, g: number, air: number, sample = FALL_SAMPLE): { time: number; samples: [number, number][] } {
  const k = (0.5 * air * o.cd * o.area) / o.m;
  let t = 0;
  let y = 0;
  let v = 0;
  const samples: [number, number][] = [[0, 0]];
  let next = sample;
  // A hard cap (a very light, very flat object): 60 s of fall.
  while (y < h && t < 60) {
    const acc = g - k * v * v;
    const v1 = v + acc * FALL_STEP;
    const y1 = y + v1 * FALL_STEP;
    if (y1 >= h) {
      // Land inside this step (linear between the two positions).
      const f = (h - y) / (y1 - y);
      t += f * FALL_STEP;
      y = h;
      break;
    }
    v = v1;
    y = y1;
    t += FALL_STEP;
    if (t >= next - 1e-9) {
      samples.push([Number(t.toFixed(6)), y]);
      next += sample;
    }
  }
  samples.push([t, h]);
  return { time: t, samples };
}

/* ------------------------------------------------------------------ */
/* 3–6                                                                 */
/* ------------------------------------------------------------------ */

/** Extension (cm) of the spring under a load (g), loaded or after the load is taken off. */
export function springExtension(s: NonNullable<ForceData['spring']>, load: number, unload: boolean): number {
  if (unload) return load > s.limit ? (s.set[String(load)] ?? 0) : 0;
  if (load <= s.limit) return (load / 50) * s.per50;
  const n = (load - s.limit) / 50;
  return (s.limit / 50) * s.per50 + s.beyond[0] * n + s.beyond[1] * n * n;
}

/** The ramp-and-runway run of a car released at h cm on surface coefficient c. */
export function rollRun(r: NonNullable<ForceData['roll']>, g: number, hCm: number, c: number, key: string) {
  const eta = 1 - r.loss;
  const h = hCm / 100;
  const v0 = Math.sqrt(2 * g * h * eta);
  const a = c * g;
  const free = (eta * h) / c;
  const off = free > r.runway;
  const dist = off ? r.runway : free;
  const tRun = off ? (v0 - Math.sqrt(Math.max(0, v0 * v0 - 2 * a * dist))) / a : v0 / a;
  const th = (r.ramp.angle * Math.PI) / 180;
  const sr = h / Math.sin(th);
  const ar = v0 > 0 ? (v0 * v0) / (2 * sr) : 0;
  const tr = ar > 0 ? v0 / ar : 0;
  const k = DEG / r.wheel;
  const run: Timeline = {
    kind: 'timeline',
    key,
    duration: tr + tRun,
    slow: 1,
    channels: {
      dx: { segments: [seg(0, tr, -sr * Math.cos(th), 0, ar * Math.cos(th)), seg(tr, tr + tRun, 0, v0, -a)] },
      dy: { segments: [seg(0, tr, sr * Math.sin(th), 0, -ar * Math.sin(th)), seg(tr, tr + tRun, 0)] },
      pitch: { segments: [seg(0, tr, r.ramp.angle), seg(tr, tr + tRun, 0)] },
      spin: { segments: [seg(0, tr, 0, 0, ar * k), seg(tr, tr + tRun, sr * k, v0 * k, -a * k)] },
    },
  };
  return { distance: dist * 100, time: tRun, end: off ? 'off-end' : 'stops', run };
}

/** The pull-and-slide run of a block of `m` kg between surfaces (μs, μk). */
export function slideRun(s: NonNullable<ForceData['slide']>, g: number, m: number, mu: readonly [number, number], key: string) {
  const fStart = mu[0] * m * g;
  const fMove = mu[1] * m * g;
  const slide = s.travel / s.speed;
  const end = s.rise + slide;
  const run: Timeline = {
    kind: 'timeline',
    key,
    duration: end,
    slow: 1,
    channels: {
      x: { segments: [seg(0, s.rise, 0), seg(s.rise, end, 0, s.speed)] },
      pull: { segments: [seg(0, s.rise, 0, fStart / s.rise), seg(s.rise, s.rise + SLIP, fStart, (fMove - fStart) / SLIP), seg(s.rise + SLIP, end, fMove)] },
      friction: { segments: [seg(0, s.rise, 0, fStart / s.rise), seg(s.rise, end, fMove)] },
    },
  };
  return { fStart, fMove, run };
}

/** The spin-down of the brake wheel under a pad force N (newtons). */
export function brakeRun(b: NonNullable<ForceData['brake']>, n: number, key: string) {
  const w0 = 2 * Math.PI * b.rps;
  const tau = b.hub + 2 * b.mu * n * b.radius;
  const t = (b.inertia * w0) / tau;
  const turns = (w0 * t) / 2 / (2 * Math.PI);
  const deg0 = b.rps * 360;
  const run: Timeline = {
    kind: 'timeline',
    key,
    duration: t,
    slow: 1,
    channels: {
      spin: { segments: [seg(0, t, 0, deg0, -deg0 / t)] },
      brake: { segments: [seg(0, t, 2 * b.mu * n)] },
    },
  };
  return { time: t, turns, run };
}

/* ------------------------------------------------------------------ */
/* All quantities                                                      */
/* ------------------------------------------------------------------ */

export type ForceValue = number | string | Timeline;

/** Every quantity of the sub-models the data has, for these control values. */
export function solveForces(f: ForceData, values: SimValues): Record<string, ForceValue> {
  const g = f.g;
  const out: Record<string, ForceValue> = {};
  const rolling = (id: string | undefined) => (id !== undefined ? f.roll?.rolling[id] : undefined);

  if (f.push) {
    const p = f.push;
    const moving = p.start === undefined || values[p.start] === 'moving' || values[p.start] === true;
    const c = p.rolling ?? rolling(p.surface) ?? 0.06;
    const magnetOn = f.magnet !== undefined && values[f.magnet.toggle] === true;
    const choice = str(values[p.choice]);
    const dv = magnetOn ? f.magnet!.dv : (p.dv[choice] ?? [0, 0, 0]);
    const keyBase = `${moving ? 'moving' : 'rest'}`;
    const r = pushRun(p, g, c, moving, dv, magnetOn ? `magnet:${keyBase}` : `push:${choice}:${keyBase}`, p.arrow);
    out.effect = r.effect;
    out['speed-before'] = r.before;
    out['speed-after'] = r.after;
    out['push-run'] = magnetOn ? { ...EMPTY_TIMELINE, key: `push:still:${keyBase}` } : r.run;
    if (f.magnet) out['magnet-run'] = magnetOn ? r.run : { ...EMPTY_TIMELINE, key: `magnet:off:${keyBase}` };
  }

  if (f.fall) {
    const fl = f.fall;
    const h = num(values[fl.height], 1);
    const pair = fl.pairs[str(values[fl.pair])] ?? Object.values(fl.pairs)[0]!;
    const runs = pair.map((id) => ({ id, ...fallRun(fl.objects[id]!, h, g, fl.air, fl.sample) }));
    const [l, r] = runs;
    out['t-left'] = l!.time;
    out['t-right'] = r!.time;
    const d = l!.time - r!.time;
    out.landing = Math.abs(d) < TOGETHER ? 'together' : d < 0 ? 'left-first' : 'right-first';
    const duration = Math.max(l!.time, r!.time);
    const channels: Record<string, { samples: [number, number][] }> = {};
    for (const run of runs) {
      channels[run.id] = { samples: thinSamples(run.samples) };
      const sway = fl.objects[run.id]!.sway;
      // A sheet of paper rocks as it falls (illustrative): a slow swing, still once it lands.
      if (sway) {
        const xs: [number, number][] = [];
        const n = Math.min(64, Math.max(2, Math.ceil(run.time / 0.05)));
        for (let i = 0; i <= n; i++) {
          const t = (run.time * i) / n;
          xs.push([t, i === n ? 0 : sway * Math.sin(2 * Math.PI * 0.8 * t) * Math.min(1, t / 0.2)]);
        }
        channels[`${run.id}-sway`] = { samples: xs };
      }
    }
    out['drop-run'] = { kind: 'timeline', key: `fall:${pair.join('+')}:${h}`, duration, slow: fl.slow, channels };
    if (fl.weigh) {
      const which = fl.weigh.map[str(values[fl.weigh.control])];
      const w = which ? fl.objects[which]!.m * g : 0;
      out.weight = w;
      out['weigh-note'] = which === undefined ? 'none' : w < BALANCE_FLOOR ? 'too-light' : 'reads';
    } else {
      out.weight = 0;
      out['weigh-note'] = 'none';
    }
  }

  if (f.slide) {
    const s = f.slide;
    const m = s.block + num(values[s.load]) / 1000;
    const lane = str(values[s.lane]);
    const mu = s.surfaces[lane] ?? Object.values(s.surfaces)[0]!;
    const r = slideRun(s, g, m, mu, `slide:${lane}:${m}`);
    out['f-start'] = r.fStart;
    out['f-move'] = r.fMove;
    out['pull-run'] = r.run;
  }

  if (f.roll) {
    const r = f.roll;
    const hCm = num(values[r.height]);
    const surface = str(values[r.surface]);
    const c = r.rolling[surface] ?? Object.values(r.rolling)[0]!;
    const res = rollRun(r, g, hCm, c, `roll:${surface}:${hCm}`);
    out.distance = res.distance;
    out['run-time'] = res.time;
    out['run-end'] = res.end;
    out['car-run'] = res.run;
  }

  if (f.spring) {
    const s = f.spring;
    const load = num(values[s.load]);
    const unload = s.unload !== undefined && values[s.unload] === true;
    const ext = springExtension(s, load, unload);
    out.extension = ext;
    out['spring-length'] = s.length + ext;
    out['load-weight'] = unload ? 0 : (load / 1000) * g;
    out.returns = !unload ? 'loaded' : ext > 1e-9 ? 'stays-longer' : 'returns';
  }

  if (f.brake) {
    const b = f.brake;
    const squeeze = str(values[b.squeeze]);
    const n = b.force[squeeze] ?? 0;
    const r = brakeRun(b, n, `brake:${squeeze}`);
    out['stop-time'] = r.time;
    out.turns = r.turns;
    out['wheel-run'] = r.run;
  }
  return out;
}
