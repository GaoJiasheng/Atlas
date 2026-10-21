/**
 * The materials bench (docs/37 §4.2, E-MT1; pure, synchronous, well under
 * 0.05 ms): five fair tests on one set of samples, worked out from the
 * topic's sourced constants and design sizes.
 *
 * - `bridge`: a strip on two supports, masses at its middle. Small-deflection
 *   beam: sag δ = P L³ ÷ 48 E I + 5 w L⁴ ÷ 384 E I, stress σ = (P L ÷ 4 +
 *   w L² ÷ 8) ÷ Z. Once the sag reaches the supports' height the bench takes
 *   the rest of the load (the stress stops growing there); a strip that snaps
 *   snaps when that stress passes its limit.
 * - `cantilever`: clamped at one end, the free end pushed down. Self droop
 *   δ₀ = w L⁴ ÷ 8 E I; stress at the clamp σ = 3 E h × push ÷ 2 L².
 * - `tank`: floats when lighter than the water; a floating thing sinks in by
 *   its density ÷ the water's of its height.
 * - `drops`, `light`: the sample's sourced, qualitative facts.
 * - `profile`: the five for one material.
 *
 * Numbers (sag, tip, rise, dark) only drive bindings; the card, table and
 * PLATE show the states (docs/37 D9). Quantities (outputs' `from`):
 * `bridge:{result,bend,view,sag}`, `cantilever:{result,view,tip}`,
 * `tank:{result,rise}`, `drops:result`, `light:{result,dark}`,
 * `profile:{strength,flex,float,water,light}`, `control:<step or toggle>`,
 * `control:masses-kg`.
 */
import type { MaterialsData } from '../../materials-schema';
import type { SimControl, SimOutput, SimValues } from '../../sim-schema';

export const MATERIAL_LIGHT = ['most', 'some', 'none'] as const;
export type MaterialLight = (typeof MATERIAL_LIGHT)[number];

export interface StripSection {
  /** Second moment of area (m⁴), section modulus (m³). */
  I: number;
  Z: number;
}

/** I = b h³ ÷ 12, Z = b h² ÷ 6. */
export function stripSection(m: Pick<MaterialsData, 'strip'>): StripSection {
  const { width: b, thick: h } = m.strip;
  return { I: (b * h ** 3) / 12, Z: (b * h ** 2) / 6 };
}

/** The strip's own weight per metre (N/m). */
export function stripWeight(m: Pick<MaterialsData, 'strip' | 'g' | 'samples'>, sample: string): number {
  const s = m.samples[sample];
  return s ? s.density * m.g * m.strip.width * m.strip.thick : 0;
}

export type BridgeResult = 'holds' | 'on-bench' | 'snapped';
export type BridgeBend = 'hardly' | 'a-little' | 'a-lot' | 'none';

export interface BridgeSolution {
  result: BridgeResult;
  bend: BridgeBend;
  view: string;
  /** Drawn sag of the middle, m (0 once snapped; the supports' height on the bench). */
  sag: number;
  /** Small-deflection sag for the whole load (m; Infinity for a limp strip). */
  deflection: number;
  /** Largest stress the strip carries, Pa (capped where the bench takes the load). */
  stress: number;
}

/** Strip `sample` on two supports with `count` masses at its middle. */
export function bridgeSolve(m: MaterialsData, sample: string, count: number): BridgeSolution {
  const b = m.bridge!;
  const s = m.samples[sample];
  if (!s || s.limp || s.E === undefined) return { result: 'on-bench', bend: 'a-lot', view: sample, sag: b.clearance, deflection: Infinity, stress: 0 };
  const { I, Z } = stripSection(m);
  const EI = s.E * 1e9 * I;
  const w = stripWeight(m, sample);
  const L = b.span;
  const self = (5 * w * L ** 4) / (384 * EI);
  const P = count * b.mass * m.g;
  const deflection = (P * L ** 3) / (48 * EI) + self;
  const onBench = deflection >= b.clearance;
  // On the bench the strip carries only the load that brought it down to the bench.
  const carried = onBench ? Math.max(0, ((b.clearance - self) * 48 * EI) / L ** 3) : P;
  const stress = ((carried * L) / 4 + (w * L ** 2) / 8) / Z;
  if (s.fails === 'snaps' && s.limit !== undefined && stress > s.limit * 1e6) return { result: 'snapped', bend: 'none', view: `${sample}-snapped`, sag: 0, deflection, stress };
  if (onBench) return { result: 'on-bench', bend: 'a-lot', view: sample, sag: b.clearance, deflection, stress };
  const bend: BridgeBend = deflection < b.bend.little ? 'hardly' : deflection < b.bend.lot ? 'a-little' : 'a-lot';
  return { result: 'holds', bend, view: sample, sag: deflection, deflection, stress };
}

export type CantileverResult = 'not-pushed' | 'bends' | 'droops' | 'snapped';

export interface CantileverSolution {
  result: CantileverResult;
  view: string;
  /** Drawn drop of the free end, m (0 once snapped). */
  tip: number;
  /** Self droop, m (Infinity for a limp strip). */
  droop: number;
  /** Stress at the clamp from the push, Pa. */
  stress: number;
}

/** Strip `sample` clamped at one end, its free end pushed down `push` cm. */
export function cantileverSolve(m: MaterialsData, sample: string, push: number): CantileverSolution {
  const c = m.cantilever!;
  const s = m.samples[sample];
  const pushed = push / 100;
  const L = c.reach;
  const rigid = s !== undefined && !s.limp && s.E !== undefined;
  const E = rigid ? s.E! * 1e9 : 0;
  const droop = rigid ? (stripWeight(m, sample) * L ** 4) / (8 * E * stripSection(m).I) : Infinity;
  const tip = Math.min(Math.max(pushed, droop), c.hang * L);
  const stress = (3 * E * m.strip.thick * pushed) / (2 * L ** 2);
  if (s?.fails === 'snaps' && s.limit !== undefined && stress > s.limit * 1e6) return { result: 'snapped', view: `${sample}-snapped`, tip: 0, droop, stress };
  const result: CantileverResult = droop >= c.droop ? 'droops' : pushed === 0 ? 'not-pushed' : 'bends';
  return { result, view: sample, tip, droop, stress };
}

export interface TankSolution {
  result: 'floats' | 'sinks';
  /** Height of its underside above the tank floor, cm (0: on the floor). */
  rise: number;
  /** How deep a floating thing sits in the water, cm (its height when it sinks). */
  immersed: number;
}

/** Thing `block` (a tank option) put gently into the water. */
export function tankSolve(m: MaterialsData, block: string): TankSolution {
  const t = m.tank!;
  const b = t.blocks[block];
  const density = b ? ('density' in b ? b.density : (m.samples[b.sample]?.density ?? NaN)) : NaN;
  const height = b?.height ?? 0;
  if (!(density < t.density)) return { result: 'sinks', rise: 0, immersed: height };
  const immersed = (density / t.density) * height;
  return { result: 'floats', rise: t.water - immersed, immersed };
}

export const dropResult = (m: MaterialsData, sample: string): 'stays-on-top' | 'soaks-in' => (m.samples[sample]?.absorbs ? 'soaks-in' : 'stays-on-top');
export const lightResult = (m: MaterialsData, sample: string): MaterialLight => m.samples[sample]?.light ?? 'none';

type Kind = SimOutput['kind'];
const CATALOG: Readonly<Record<string, Readonly<Record<string, Kind>>>> = {
  bridge: { result: 'state', bend: 'state', view: 'state', sag: 'number' },
  cantilever: { result: 'state', view: 'state', tip: 'number' },
  tank: { result: 'state', rise: 'number' },
  drops: { result: 'state' },
  light: { result: 'state', dark: 'number' },
  profile: { strength: 'state', flex: 'state', float: 'state', water: 'state', light: 'state' },
};

/** The kind of a quantity of this bench (null: none of that name, or its test is not in the data). */
export function materialsQuantity(m: MaterialsData, from: string, controls: readonly SimControl[]): Kind | null {
  const split = from.indexOf(':');
  if (split < 1) return null;
  const model = from.slice(0, split);
  const name = from.slice(split + 1);
  if (model === 'control') {
    if (name === 'masses-kg') return m.bridge ? 'number' : null;
    return controls.some((c) => c.id === name && c.kind !== 'choice') ? 'number' : null;
  }
  if (!(model in CATALOG) || !m[model as keyof MaterialsData]) return null;
  return CATALOG[model]![name] ?? null;
}

const options = (controls: readonly SimControl[], id: string | undefined): (string | number)[] => {
  const c = controls.find((x) => x.id === id);
  return c?.kind === 'choice' ? c.options.map((o) => o.id) : c?.kind === 'step' ? c.values : [];
};

/** Every state a state quantity takes over all values of the controls its test reads (in first-seen order). */
export function materialsStates(m: MaterialsData, from: string, controls: readonly SimControl[]): string[] | undefined {
  if (materialsQuantity(m, from, controls) !== 'state') return undefined;
  const model = from.slice(0, from.indexOf(':'));
  const seen = new Set<string>();
  const base: SimValues = Object.fromEntries(controls.map((c) => [c.id, c.default]));
  const reads: Record<string, (string | undefined)[]> = {
    bridge: [m.bridge?.strip, m.bridge?.masses],
    cantilever: [m.cantilever?.strip, m.cantilever?.push],
    tank: [m.tank?.block],
    drops: [m.drops?.square],
    light: [m.light?.square],
    profile: [m.profile?.pick],
  };
  const ids = reads[model] ?? [];
  const vary = (i: number, values: SimValues) => {
    if (i === ids.length) {
      const v = solveMaterials(m, values, controls)[from];
      if (typeof v === 'string') seen.add(v);
      return;
    }
    for (const x of options(controls, ids[i])) vary(i + 1, { ...values, [ids[i]!]: x });
  };
  vary(0, base);
  return [...seen];
}

const num = (v: unknown) => (typeof v === 'number' ? v : typeof v === 'boolean' ? (v ? 1 : 0) : 0);

/** All quantities for these control values, at full precision. */
export function solveMaterials(m: MaterialsData, values: SimValues, controls: readonly SimControl[] = []): Record<string, number | string> {
  const q: Record<string, number | string> = {};
  for (const c of controls) if (c.kind !== 'choice') q[`control:${c.id}`] = num(values[c.id]);
  if (m.bridge) {
    const n = num(values[m.bridge.masses]);
    const r = bridgeSolve(m, String(values[m.bridge.strip]), n);
    q['bridge:result'] = r.result;
    q['bridge:bend'] = r.bend;
    q['bridge:view'] = r.view;
    q['bridge:sag'] = r.sag;
    q['control:masses-kg'] = n * m.bridge.mass;
  }
  if (m.cantilever) {
    const r = cantileverSolve(m, String(values[m.cantilever.strip]), num(values[m.cantilever.push]));
    q['cantilever:result'] = r.result;
    q['cantilever:view'] = r.view;
    q['cantilever:tip'] = r.tip;
  }
  if (m.tank) {
    const r = tankSolve(m, String(values[m.tank.block]));
    q['tank:result'] = r.result;
    q['tank:rise'] = r.rise;
  }
  if (m.drops) q['drops:result'] = dropResult(m, String(values[m.drops.square]));
  if (m.light) {
    const r = lightResult(m, String(values[m.light.square]));
    q['light:result'] = r;
    q['light:dark'] = m.light.dark[r];
  }
  if (m.profile && m.bridge && m.cantilever && m.tank && m.drops && m.light) {
    const id = String(values[m.profile.pick]);
    q['profile:strength'] = bridgeSolve(m, id, m.profile.masses).result;
    // `not-pushed` never shows here while the profile push is above 0.
    q['profile:flex'] = cantileverSolve(m, id, m.profile.push).result;
    q['profile:float'] = tankSolve(m, id).result;
    q['profile:water'] = dropResult(m, id);
    q['profile:light'] = lightResult(m, id);
  }
  return q;
}

/**
 * Whether an output may be shown on the card, in the table or the PLATE
 * (docs/37 D9: outcomes, and the apparatus — masses, push, water — never a
 * material's own numbers): a state, or a number read straight off a control.
 */
export function materialsShowable(o: Pick<SimOutput, 'id' | 'kind' | 'from'>): boolean {
  return o.kind === 'state' || (o.kind === 'number' && (o.from ?? o.id).startsWith('control:'));
}
