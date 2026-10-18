/**
 * The energy model (docs/31 §4.2, sim `kind: 'energy'`; pure, synchronous,
 * deterministic, well under a millisecond). Two halves:
 *
 *  1. Energy chains (the energy-chain card, the five energy flows, the
 *     readings): the `chain` control picks one of `energy.chains`. A chain is
 *     nodes (parts, or labelled places such as "the air around") joined by
 *     links, one form of energy each. The chain's first nodes (no link in)
 *     start with `start` (default 100); every link carries a share of what
 *     goes into its node: `in` (all of it) or `<table>.<key>` (a percentage
 *     of `energy.shares`, or of a table the model works out: `bounce`,
 *     `swing`). Every node gives out what it takes in (validate checks every
 *     combination of the controls a chain reads). Shown values are rounded
 *     to 1 % node by node in chain order, the rounding left over put on the
 *     node's heat link (else its largest), so each node's rounded in = out.
 *     A link `when` counts only while its control condition holds; a chain
 *     `when` (all of them) switches the whole chain to 0 (night, a toy not
 *     wound up). Quantities: `chain-state` (the chain on show), `links`
 *     (vector: link id → %), `paths` (vector: `<flow>:<path>` → share 0–1 of
 *     the start that runs along that flow path; a path several links list
 *     takes the largest; a chain with `mix` also lights the paths of other
 *     chains at their default values × `scale`), `start`, `useful`, `heat`,
 *     `sound` (% of what goes into the chain's `reading` node — that node and
 *     its `through` nodes are "the machine" — leaving it along the links
 *     marked `useful`, and as heat and as sound along the others; NaN where
 *     the chain has no reading or nothing goes in), `in:<node>` (% into a node of the chain on show; 0 where it has
 *     no such node), `out:<node>:<form>` (% leaving it in that form).
 *
 *  2. Sub-models (each optional; a number of one whose `chains` leave out the
 *     chain on show is NaN, shown `—`; timelines are always worked out):
 *     solar — `panel-power` (kW) = modules × area × irradiance × efficiency,
 *              `sun-glow` (the sky's glow table);
 *     bounce — a ball dropped from `drop` cm (measured from the bottom of the
 *              ball, as the ITF test does) onto a surface with rebound ratio r:
 *              `impact-speed` = √(2 g h), `bounce-height` = r h (cm), `kept`
 *              = 100 r, `lost` = 100 (1 − r), `bounce-run` (one fall, one
 *              rebound, free fall between: no loss in the air);
 *     swing  — let go at `amplitude`° on a `length` m chain, losing `loss` of
 *              what is left each half-swing, `swings` half-swings, each as
 *              long as half the pendulum's full-amplitude period (the AGM
 *              formula, not the small-angle one), paused at the last turning
 *              point: `swing-run`, and the computed table `swing`;
 *     windup — `run-time` = `secondsPerTurn` × winds, `toy-run`;
 *     dynamo — I = imax · x ÷ √(1 + x²), x = speed ÷ v0 (km/h), lamp power
 *              I² R, `brightness` = power ÷ rated × 100, `wheel-rpm` = speed ÷
 *              3.6 ÷ circumference × 60, `crank-rpm` = wheel × `crankRatio`;
 *              with `on` off the lamp gets nothing.
 *
 * Timeline channels (lib/sim/timeline.ts): bounce-run `y` (m, bottom of the
 * ball above the surface: bind `axis: [0, 1, 0]` on a ball drawn resting on
 * it), `pe`, `ke`, `lost` (% of the energy at the start; they add up to 100
 * at every moment); swing-run `angle` (° from straight down: bind `turn` with
 * the hanging point as `pivot`), `pe`, `ke`, `lost`; toy-run `x` (m
 * travelled), `spin` (° the wheels turn), `key` (° the key turns back), `pe`,
 * `ke`, `lost`.
 */
import type { EnergyChain, EnergyData, SimControl, SimValues } from '../../sim-schema';
import { holds } from './bind';
import { EMPTY_TIMELINE, seg, thinSamples, type Timeline } from './timeline';

/** Forms drawn as a moving stream (potential energy is stored: bars and the card only). */
export const FLOWING_FORMS = ['light', 'electrical', 'kinetic', 'sound', 'heat'] as const;
export const ENERGY_FORMS = [...FLOWING_FORMS, 'potential'] as const;

/** Share tables the model works out (data `shares` may not use these names while the sub-model is there). */
export const COMPUTED_TABLES = { bounce: ['potential', 'heat', 'sound'], swing: ['potential', 'heat', 'sound'] } as const;

/** Model quantities by sub-model, with their kind (outputs' `from`); `chain` quantities are always there. */
export const ENERGY_MODEL = {
  chain: { 'chain-state': 'state', links: 'vector', paths: 'vector', start: 'number', useful: 'number', heat: 'number', sound: 'number' },
  solar: { 'panel-power': 'number', 'sun-glow': 'number' },
  bounce: { 'bounce-height': 'number', 'impact-speed': 'number', kept: 'number', lost: 'number', 'bounce-run': 'timeline' },
  swing: { 'swing-run': 'timeline' },
  windup: { 'run-time': 'number', 'toy-run': 'timeline' },
  dynamo: { 'lamp-power': 'number', brightness: 'number', 'wheel-rpm': 'number', 'crank-rpm': 'number' },
} as const;

export type EnergyModel = keyof typeof ENERGY_MODEL;
type QuantityKind = 'number' | 'state' | 'vector' | 'timeline';

/** Which sub-model gives a quantity, and its kind (`in:<node>` / `out:<node>:<form>`: chain numbers). */
export function energyQuantity(name: string): { model: EnergyModel; kind: QuantityKind } | null {
  if (/^in:[a-z0-9-]+$/.test(name) || /^out:[a-z0-9-]+:[a-z]+$/.test(name)) return { model: 'chain', kind: 'number' };
  for (const [model, q] of Object.entries(ENERGY_MODEL)) {
    const kind = (q as Record<string, QuantityKind>)[name];
    if (kind) return { model: model as EnergyModel, kind };
  }
  return null;
}

/** The channels of an energy timeline quantity (null: not one). */
export function energyTimelineChannels(quantity: string): string[] | null {
  switch (quantity) {
    case 'bounce-run':
      return ['y', 'pe', 'ke', 'lost'];
    case 'swing-run':
      return ['angle', 'pe', 'ke', 'lost'];
    case 'toy-run':
      return ['x', 'spin', 'key', 'pe', 'ke', 'lost'];
    default:
      return null;
  }
}

const num = (v: unknown, d = 0) => (typeof v === 'number' ? v : d);
const str = (v: unknown, d = '') => (typeof v === 'string' ? v : d);
const DEG = Math.PI / 180;

/* ------------------------------------------------------------------ */
/* Sub-models                                                          */
/* ------------------------------------------------------------------ */

/** Electrical power of the panels (kW) under an irradiance (W/m²). */
export function panelPower(s: NonNullable<EnergyData['solar']>, irradiance: number): number {
  return (s.modules * s.area * irradiance * s.efficiency) / 1000;
}

/** The fall and first rebound of a ball dropped from h cm with rebound ratio r (heights from the bottom of the ball). */
export function bounceRun(g: number, hCm: number, r: number, slow: number, key: string): Timeline {
  const h = hCm / 100;
  if (h <= 0) return { ...EMPTY_TIMELINE, key };
  const t1 = Math.sqrt((2 * h) / g);
  const v1 = Math.sqrt(2 * g * r * h);
  const t2 = v1 / g;
  const end = t1 + t2;
  const k = (100 * g) / h;
  return {
    kind: 'timeline',
    key,
    duration: end,
    slow,
    channels: {
      y: { segments: [seg(0, t1, h, 0, -g), seg(t1, end, 0, v1, -g)] },
      // Potential energy ∝ height, kinetic = the rest of what the ball still has; the impact turns 1 − r into heat and sound.
      pe: { segments: [seg(0, t1, 100, 0, -k), seg(t1, end, 0, (100 * v1) / h, -k)] },
      ke: { segments: [seg(0, t1, 0, 0, k), seg(t1, end, 100 * r, (-100 * v1) / h, k)] },
      lost: { segments: [seg(0, t1, 0), seg(t1, end, 100 * (1 - r))] },
    },
  };
}

/** The arithmetic–geometric mean (the exact pendulum period: T = 2π √(L ÷ g) ÷ AGM(1, cos(θ₀ ÷ 2))). */
export function agm(a: number, b: number): number {
  let x = a;
  let y = b;
  for (let i = 0; i < 32 && Math.abs(x - y) > 1e-15 * x; i++) [x, y] = [(x + y) / 2, Math.sqrt(x * y)];
  return x;
}

/** Full period (s) of a pendulum of length L swinging to ±θ₀ degrees. */
export function pendulumPeriod(length: number, g: number, amplitudeDeg: number): number {
  return (2 * Math.PI * Math.sqrt(length / g)) / agm(1, Math.cos((amplitudeDeg * DEG) / 2));
}

/** The swing's amplitude (°) with `left` (0–1) of the starting energy: 1 − cos θ = left (1 − cos θ₀). */
export function swingAmplitude(amplitudeDeg: number, left: number): number {
  return Math.acos(1 - left * (1 - Math.cos(amplitudeDeg * DEG))) / DEG;
}

/**
 * The swing let go at `amplitude`°: `swings` half-swings, each losing `loss`
 * of what is left (spread evenly over it), as long as half the period at its
 * starting amplitude; the angle follows a cosine whose amplitude shrinks
 * through the half-swing. Bars: potential = 100 (1 − cos θ) ÷ (1 − cos θ₀)
 * of the starting energy, kinetic = what is left − potential, lost = 100 −
 * what is left. Ends paused at the last turning point.
 */
export function swingRun(s: NonNullable<EnergyData['swing']>, g: number, key: string): { run: Timeline; left: number } {
  const c0 = 1 - Math.cos(s.amplitude * DEG);
  const angle: [number, number][] = [];
  const pe: [number, number][] = [];
  const ke: [number, number][] = [];
  const lost: [number, number][] = [];
  let t = 0;
  for (let k = 0; k < s.swings; k++) {
    const leftA = Math.pow(1 - s.loss, k);
    const leftB = Math.pow(1 - s.loss, k + 1);
    const ampA = swingAmplitude(s.amplitude, leftA);
    const ampB = swingAmplitude(s.amplitude, leftB);
    const half = pendulumPeriod(s.length, g, ampA) / 2;
    const n = Math.max(2, Math.ceil(half / s.sample));
    const sign = k % 2 === 0 ? 1 : -1;
    for (let i = k === 0 ? 0 : 1; i <= n; i++) {
      const f = i / n;
      const amp = ampA + (ampB - ampA) * f;
      const th = sign * amp * Math.cos(Math.PI * f);
      const left = 100 * (leftA + (leftB - leftA) * f);
      const p = (100 * (1 - Math.cos(th * DEG))) / c0;
      const time = t + half * f;
      angle.push([time, th]);
      pe.push([time, Math.min(p, left)]);
      ke.push([time, Math.max(0, left - p)]);
      lost.push([time, 100 - left]);
    }
    t += half;
  }
  const left = Math.pow(1 - s.loss, s.swings);
  return {
    run: {
      kind: 'timeline',
      key,
      duration: t,
      slow: 1,
      channels: { angle: { samples: thinSamples(angle) }, pe: { samples: thinSamples(pe) }, ke: { samples: thinSamples(ke) }, lost: { samples: thinSamples(lost) } },
    },
    left,
  };
}

/**
 * The wind-up toy let go after `winds` turns: the spring gives out its energy
 * evenly over the run (lost = 100 t ÷ T: friction and the ticking turn it
 * into heat and sound); the toy speeds up over `spinUp` s to `speed` m/s,
 * then slows evenly to a stop at T. Kinetic = `kinetic` % × (speed ÷ top
 * speed)², taken from the spring, so potential = 100 (1 − t ÷ T) − kinetic.
 */
export function toyRun(w: NonNullable<EnergyData['windup']>, winds: number, key: string): Timeline {
  const T = w.secondsPerTurn * winds;
  if (T <= 0) return { ...EMPTY_TIMELINE, key };
  const tau = Math.min(w.spinUp, T / 2);
  const v = w.speed;
  const k = w.kinetic;
  const rest = T - tau;
  const spin = 180 / Math.PI / w.wheel;
  const x = [seg(0, tau, 0, 0, v / tau), seg(tau, T, (v * tau) / 2, v, -v / rest)];
  return {
    kind: 'timeline',
    key,
    duration: T,
    slow: 1,
    channels: {
      x: { segments: x },
      spin: { segments: x.map((s) => seg(s.t0, s.t1, s.x0 * spin, s.v0 * spin, s.a * spin)) },
      key: { segments: [seg(0, T, 0, (-360 * winds) / T)] },
      pe: { segments: [seg(0, tau, 100, -100 / T, (-2 * k) / (tau * tau)), seg(tau, T, 100 * (1 - tau / T) - k, -100 / T + (2 * k) / rest, (-2 * k) / (rest * rest))] },
      ke: { segments: [seg(0, tau, 0, 0, (2 * k) / (tau * tau)), seg(tau, T, k, (-2 * k) / rest, (2 * k) / (rest * rest))] },
      lost: { segments: [seg(0, T, 0, 100 / T)] },
    },
  };
}

/** The bicycle dynamo at `speed` km/h: current (A), lamp power (W), brightness (%), wheel and crank rpm. */
export function dynamoAt(d: NonNullable<EnergyData['dynamo']>, speed: number, on: boolean) {
  const x = speed / d.v0;
  const current = on ? (d.imax * x) / Math.sqrt(1 + x * x) : 0;
  const power = current * current * d.lampOhms;
  const wheel = (speed / 3.6 / d.wheel) * 60;
  return { current, power, brightness: (power / d.rated) * 100, wheel, crank: wheel * d.crankRatio };
}

/* ------------------------------------------------------------------ */
/* Chains                                                              */
/* ------------------------------------------------------------------ */

export type ShareTables = Readonly<Record<string, Readonly<Record<string, number>>>>;

export interface ChainFlow {
  /** The chain on show (null: the `chain` value names none). */
  id: string | null;
  chain: EnergyChain | null;
  /** The chain's `when` all hold (else every value is 0). */
  active: boolean;
  start: number;
  /** Exact % per link (0 for links whose `when` fails). */
  exact: Record<string, number>;
  /** Rounded % per link: whole numbers, each node's rounded in = out. */
  links: Record<string, number>;
  /** Rounded % into each node (a first node: the start). */
  into: Record<string, number>;
  /** Node ids in chain order (every link goes from an earlier node to a later one). */
  order: string[];
}

const condHolds = (c: { control: string; is: Parameters<typeof holds>[0] }, values: SimValues) => holds(c.is, values[c.control]);

/** Nodes in chain order (Kahn's algorithm, ties in the order written); null if the links make a loop. */
export function chainOrder(chain: EnergyChain): string[] | null {
  const ids = chain.nodes.map((n) => n.id);
  const ins = new Map(ids.map((id) => [id, 0]));
  for (const l of chain.links) ins.set(l.to, (ins.get(l.to) ?? 0) + 1);
  const out: string[] = [];
  const ready = ids.filter((id) => ins.get(id) === 0);
  while (ready.length > 0) {
    const id = ready.shift()!;
    out.push(id);
    for (const l of chain.links)
      if (l.from === id) {
        const n = (ins.get(l.to) ?? 0) - 1;
        ins.set(l.to, n);
        if (n === 0) ready.push(l.to);
      }
  }
  return out.length === ids.length ? out : null;
}

/** The chain's start value for these values (a number, or a control's table). */
export function chainStart(chain: EnergyChain, values: SimValues): number {
  const s = chain.start;
  if (s === undefined) return 100;
  if (typeof s === 'number') return s;
  return s.values[String(values[s.control])] ?? 100;
}

/** A link's share of its node's input (0–1): `in` = all of it, else table.key ÷ 100. */
export function linkShare(share: string, tables: ShareTables): number {
  if (share === 'in') return 1;
  const dot = share.indexOf('.');
  return (tables[share.slice(0, dot)]?.[share.slice(dot + 1)] ?? 0) / 100;
}

/** What flows along each link of `chain` for these values (exact and rounded). */
export function chainFlow(id: string | null, chain: EnergyChain | null, values: SimValues, tables: ShareTables): ChainFlow {
  const empty: ChainFlow = { id, chain, active: false, start: 0, exact: {}, links: {}, into: {}, order: [] };
  if (!chain) return empty;
  const order = chainOrder(chain) ?? chain.nodes.map((n) => n.id);
  const active = (chain.when ?? []).every((c) => condHolds(c, values));
  const start = active ? chainStart(chain, values) : 0;
  const exact: Record<string, number> = {};
  const links: Record<string, number> = {};
  const inExact = new Map<string, number>();
  const inRound = new Map<string, number>();
  const hasIn = new Set(chain.links.map((l) => l.to));
  for (const nodeId of order) {
    const first = !hasIn.has(nodeId);
    const e = first ? start : (inExact.get(nodeId) ?? 0);
    const r = first ? Math.round(start) : (inRound.get(nodeId) ?? 0);
    inExact.set(nodeId, e);
    inRound.set(nodeId, r);
    const outs = chain.links.filter((l) => l.from === nodeId);
    if (outs.length === 0) continue;
    const vals = outs.map((l) => (active && (l.when === undefined || condHolds(l.when, values)) ? e * linkShare(l.share, tables) : 0));
    const total = vals.reduce((a, b) => a + b, 0);
    // Round on the rounded input: each link's exact part of the node, scaled to the rounded input.
    const rounded = vals.map((v) => (e > 0 ? Math.round((v * r) / e) : 0));
    const target = e > 0 ? Math.round((total * r) / e) : 0;
    const diff = target - rounded.reduce((a, b) => a + b, 0);
    if (diff !== 0) {
      let k = outs.findIndex((l, i) => l.form === 'heat' && vals[i]! > 0);
      if (k < 0) k = vals.indexOf(Math.max(...vals));
      rounded[k]! += diff;
    }
    outs.forEach((l, i) => {
      exact[l.id] = vals[i]!;
      links[l.id] = rounded[i]!;
      inExact.set(l.to, (inExact.get(l.to) ?? 0) + vals[i]!);
      inRound.set(l.to, (inRound.get(l.to) ?? 0) + rounded[i]!);
    });
  }
  return { id, chain, active, start, exact, links, into: Object.fromEntries(inRound), order };
}

/** The share tables for these values: the data's, plus the ones the model works out. */
export function shareTables(e: EnergyData, values: SimValues): ShareTables {
  const t: Record<string, Readonly<Record<string, number>>> = { ...e.shares };
  if (e.bounce) {
    const r = e.bounce.ratio[str(values[e.bounce.surface])] ?? 0;
    t.bounce = { potential: 100 * r, heat: 100 * (1 - r) * e.bounce.heat, sound: 100 * (1 - r) * (1 - e.bounce.heat) };
  }
  if (e.swing) {
    const left = Math.pow(1 - e.swing.loss, e.swing.swings);
    t.swing = { potential: 100 * left, heat: 100 * (1 - left) * e.swing.heat, sound: 100 * (1 - left) * (1 - e.swing.heat) };
  }
  return t;
}

/** Control values at their defaults (the `chain` control set to `chain`). */
export function defaultValues(controls: readonly SimControl[], chainControl: string, chain: string): SimValues {
  const v: SimValues = {};
  for (const c of controls) v[c.id] = c.default;
  v[chainControl] = chain;
  return v;
}

/** The flow of the chain the `chain` control picks. */
export function currentChain(e: EnergyData, values: SimValues): ChainFlow {
  const id = str(values[e.chain]) || null;
  const chain = id !== null ? (e.chains[id] ?? null) : null;
  return chainFlow(id, chain, values, shareTables(e, values));
}

/** Per `<flow>:<path>`: the share (0–1) of the start running along it (the largest of the links that list it). */
export function chainPaths(f: ChainFlow, scale = 1, into: Record<string, number> = {}): Record<string, number> {
  for (const l of f.chain?.links ?? []) {
    const v = ((f.links[l.id] ?? 0) / 100) * scale;
    for (const p of l.paths ?? []) into[p] = Math.max(into[p] ?? 0, v);
  }
  return into;
}

/**
 * % of what goes into the reading node that leaves "the machine" (it and its
 * `through` nodes): along links marked `useful`, and as heat and as sound
 * along the others; null without a reading or an input.
 */
export function chainReading(f: ChainFlow): { useful: number; heat: number; sound: number } | null {
  const r = f.chain?.reading;
  if (!f.chain || !r) return null;
  const input = f.into[r.node] ?? 0;
  if (input <= 0) return null;
  const machine = new Set([r.node, ...(r.through ?? [])]);
  const leaving = f.chain.links.filter((l) => machine.has(l.from) && !machine.has(l.to));
  const sum = (pick: (l: EnergyChain['links'][number]) => boolean) => (100 * leaving.filter(pick).reduce((a, l) => a + (f.links[l.id] ?? 0), 0)) / input;
  return { useful: sum((l) => l.useful === true), heat: sum((l) => !l.useful && l.form === 'heat'), sound: sum((l) => !l.useful && l.form === 'sound') };
}

/* ------------------------------------------------------------------ */
/* All quantities                                                      */
/* ------------------------------------------------------------------ */

export type EnergyValue = number | string | Readonly<Record<string, number>> | Timeline;

/** Node ids used anywhere in the chains (the `in:` / `out:` quantities). */
export function energyNodes(e: EnergyData): Set<string> {
  return new Set(Object.values(e.chains).flatMap((c) => c.nodes.map((n) => n.id)));
}

/** Every quantity of the data's sub-models and chains, for these control values. */
export function solveEnergy(e: EnergyData, values: SimValues, controls: readonly SimControl[] = []): Record<string, EnergyValue> {
  const out: Record<string, EnergyValue> = {};
  const g = e.g;
  const f = currentChain(e, values);
  const here = f.id ?? '';
  const applies = (chains: readonly string[] | undefined) => chains === undefined || chains.includes(here);
  out['chain-state'] = here;
  out.links = f.links;
  const paths = chainPaths(f);
  if (f.chain?.mix) for (const id of f.chain.mix.chains) {
    const v = defaultValues(controls, e.chain, id);
    chainPaths(chainFlow(id, e.chains[id] ?? null, v, shareTables(e, v)), f.chain.mix.scale, paths);
  }
  out.paths = paths;
  out.start = f.start;
  const reading = chainReading(f);
  out.useful = reading?.useful ?? NaN;
  out.heat = reading?.heat ?? NaN;
  out.sound = reading?.sound ?? NaN;
  for (const node of energyNodes(e)) {
    out[`in:${node}`] = f.into[node] ?? 0;
    for (const form of ENERGY_FORMS)
      out[`out:${node}:${form}`] = (f.chain?.links ?? []).filter((l) => l.from === node && l.form === form).reduce((a, l) => a + (f.links[l.id] ?? 0), 0);
  }

  if (e.solar) {
    const s = e.solar;
    const sky = str(values[s.sky]);
    const ok = applies(s.chains);
    out['panel-power'] = ok ? panelPower(s, s.irradiance[sky] ?? 0) : NaN;
    out['sun-glow'] = s.glow[sky] ?? 0;
  }
  if (e.bounce) {
    const b = e.bounce;
    const h = num(values[b.drop]);
    const surface = str(values[b.surface]);
    const r = b.ratio[surface] ?? 0;
    const ok = applies(b.chains);
    out['impact-speed'] = ok ? Math.sqrt(2 * g * (h / 100)) : NaN;
    out['bounce-height'] = ok ? r * h : NaN;
    out.kept = ok ? 100 * r : NaN;
    out.lost = ok ? 100 * (1 - r) : NaN;
    out['bounce-run'] = bounceRun(g, h, r, b.slow, `bounce:${h}:${surface}`);
  }
  if (e.swing) out['swing-run'] = swingRun(e.swing, g, `swing:${e.swing.amplitude}`).run;
  if (e.windup) {
    const w = e.windup;
    const winds = num(values[w.winds]);
    out['run-time'] = applies(w.chains) ? w.secondsPerTurn * winds : NaN;
    out['toy-run'] = toyRun(w, winds, `windup:${winds}`);
  }
  if (e.dynamo) {
    const d = e.dynamo;
    const r = dynamoAt(d, num(values[d.speed]), d.on === undefined || values[d.on] === true);
    const ok = applies(d.chains);
    out['lamp-power'] = ok ? r.power : NaN;
    out.brightness = ok ? r.brightness : NaN;
    out['wheel-rpm'] = r.wheel;
    out['crank-rpm'] = r.crank;
  }
  return out;
}
