/** Seven pure, independent experiments on the matter bench (docs/36 §4.2). */
import type { MatterData, MatterPart } from '../../matter-schema';
import type { SimControl, SimValues } from '../../sim-schema';
import { fillBounds, fillShapeForPrimitive, levelForVolume, type FillShape } from '../fill';

export interface MatterQuantity { kind: 'number' | 'state'; states?: readonly string[] }
const NUMBER: MatterQuantity = { kind: 'number' };
const CATALOG: Readonly<Record<string, Readonly<Record<string, MatterQuantity>>>> = {
  weigh: { mass: NUMBER },
  displace: { reading: NUMBER, volume: NUMBER },
  pour: { level: NUMBER, volume: NUMBER },
  pump: { mass: NUMBER, air: NUMBER, firmness: { kind: 'state', states: ['flat', 'soft', 'firm', 'too-hard'] } },
  cup: { 'basin-level': NUMBER, 'basin-rise': NUMBER, 'cup-rise': NUMBER, wet: NUMBER, tissue: { kind: 'state', states: ['dry', 'wet'] }, bubbles: { kind: 'state', states: ['none', 'rising'] } },
  pores: { reading: NUMBER, air: NUMBER, wet: NUMBER, 'vs-sum': { kind: 'state', states: ['equal', 'less', 'more'] }, bubbles: { kind: 'state', states: ['none', 'rising'] } },
};

/** The liquid parts whose fill volumes this model provides. */
export function matterLiquids(m: MatterData): string[] {
  return [...new Set([
    ...(m.displace ? [m.displace.liquid] : []),
    ...Object.values(m.pour?.liquids ?? {}),
    ...Object.values(m.cup?.liquids ?? {}),
    ...Object.values(m.pores?.liquids ?? {}),
  ])];
}

/** The quantity catalog depends only on submodels present in the data. */
export function matterQuantity(m: MatterData, from: string): MatterQuantity | null {
  const split = from.indexOf(':');
  if (split < 1) return null;
  const model = from.slice(0, split);
  const name = from.slice(split + 1);
  if (model === 'volume') return matterLiquids(m).includes(name) ? NUMBER : null;
  if (model === 'squeeze') return m.squeeze?.fillings[name] ? NUMBER : null;
  if (!(model in CATALOG) || !m[model as keyof MatterData]) return null;
  return CATALOG[model]?.[name] ?? null;
}

/** Derived from the same cavity primitives rendered by fill; never authored twice. */
export function matterLiquidShapes(parts: readonly Pick<MatterPart, 'id' | 'primitive'>[]): ReadonlyMap<string, FillShape> {
  const shapes = new Map<string, FillShape>();
  for (const p of parts) {
    const shape = p.primitive && fillShapeForPrimitive(p.primitive);
    if (shape) shapes.set(p.id, shape);
  }
  return shapes;
}

/** Exact numeric bounds over this quantity's own controls, for fill capacity validation. */
export function matterQuantityRange(m: MatterData, from: string, controls: ReadonlyMap<string, SimControl>, shapes: ReadonlyMap<string, FillShape> = new Map()): [number, number] | null {
  if (matterQuantity(m, from)?.kind !== 'number') return null;
  let model = from.slice(0, from.indexOf(':'));
  if (model === 'volume') {
    const id = from.slice(7);
    if (m.displace?.liquid === id) model = 'displace';
    else if (Object.values(m.pour?.liquids ?? {}).includes(id)) model = 'pour';
    else if (Object.values(m.cup?.liquids ?? {}).includes(id)) model = 'cup';
    else if (Object.values(m.pores?.liquids ?? {}).includes(id)) model = 'pores';
  }
  const ids: Record<string, string[]> = {
    weigh: m.weigh ? [m.weigh.object] : [],
    displace: m.displace ? [m.displace.object] : [],
    pour: m.pour ? [m.pour.container] : [],
    pump: m.pump ? [m.pump.pumps] : [],
    cup: m.cup ? [m.cup.place, m.cup.hole] : [],
    squeeze: m.squeeze ? [m.squeeze.load] : [],
    pores: m.pores ? [m.pores.water] : [],
  };
  const values: Record<string, string | boolean | number> = Object.fromEntries([...controls].map(([id, c]) => [id, c.default]));
  const samples: number[] = [];
  const vary = (i: number) => {
    const id = ids[model]?.[i];
    if (id === undefined) {
      const v = solveMatter(m, values, shapes)[from];
      if (typeof v === 'number' && Number.isFinite(v)) samples.push(v);
      return;
    }
    const c = controls.get(id);
    if (!c) return;
    const options = c.kind === 'choice' ? c.options.map((o) => o.id) : c.kind === 'step' ? c.values : [false, true];
    for (const v of options) { values[id] = v; vary(i + 1); }
  };
  vary(0);
  return samples.length ? [Math.min(...samples), Math.max(...samples)] : null;
}

export interface CupResult {
  basinLevel: number;
  rise: number;
  air: number;
  water: number;
  initialAir: number;
  basinWater: number;
  wet: boolean;
  bubbles: 'none' | 'rising';
}

/** Centimetres and millilitres; fixed-point Boyle/hydrostatic solution, at most 20 iterations. */
export function solveCup(m: Pick<MatterData, 'p0' | 'g' | 'water'>, c: NonNullable<MatterData['cup']>, pushed: boolean, hole: boolean): CupResult {
  const ab = Math.PI * c.basin.radius ** 2;
  const ac = Math.PI * c.cup.radius ** 2;
  const initialAir = ac * c.cup.height;
  const basinWater = ab * c.basin.depth;
  if (!pushed) return { basinLevel: c.basin.depth, rise: 0, air: initialAir, water: 0, initialAir, basinWater, wet: false, bubbles: 'none' };
  let rise = hole ? c.cup.height : 0;
  if (!hole) for (let i = 0; i < 20; i++) {
    const air = initialAir - ac * rise;
    const h = (basinWater + c.cup.glass + air) / ab;
    // g/ml → kg/m³, cm → m, Pa → kPa cancel to density × g × head / 100.
    const pressure = m.p0 + m.water.density * m.g * (h - c.cup.rim - rise) / 100;
    const next = c.cup.height * (1 - m.p0 / pressure);
    const delta = Math.abs(next - rise);
    rise = next;
    if (delta < 1e-6) break;
  }
  const water = ac * rise;
  const air = initialAir - water;
  return { basinLevel: (basinWater + c.cup.glass + air) / ab, rise, air, water, initialAir, basinWater, wet: hole, bubbles: hole ? 'rising' : 'none' };
}

const num = (v: unknown) => typeof v === 'number' ? v : 0;

/** Gauge pressure in kPa, from added ambient-pressure air in litres. */
export function pumpPressure(m: Pick<MatterData, 'p0'>, p: NonNullable<MatterData['pump']>, strokes: number): number {
  return strokes * p.stroke / p.inside * m.p0;
}

/** Extra pressure in kPa from a mass in kg on a circular bore in cm. */
export function syringePressure(m: Pick<MatterData, 'g'>, s: NonNullable<MatterData['squeeze']>, load: number): number {
  return load * m.g / (Math.PI * (s.bore / 2) ** 2 * 1e-4) / 1000;
}

/** All quantities at full precision, except the balance's explicit measurement step. */
export function solveMatter(m: MatterData, values: SimValues, shapes: ReadonlyMap<string, FillShape> = new Map()): Record<string, number | string> {
  const q: Record<string, number | string> = {};
  if (m.weigh) {
    const w = m.weigh;
    const object = m.objects[String(values[w.object])];
    q['weigh:mass'] = object ? Math.round((object.volume * object.density + Number.EPSILON) / w.step) * w.step : NaN;
  }
  if (m.displace) {
    const d = m.displace;
    const volume = m.objects[String(values[d.object])]?.volume ?? 0;
    q['displace:reading'] = d.water + volume;
    q['displace:volume'] = volume;
    q[`volume:${d.liquid}`] = d.water + volume;
  }
  if (m.pour) {
    const p = m.pour;
    const liquid = p.liquids[String(values[p.container])];
    for (const id of Object.values(p.liquids)) q[`volume:${id}`] = id === liquid ? p.volume : 0;
    const shape = liquid && shapes.get(liquid);
    q['pour:level'] = shape ? (levelForVolume(shape, p.volume * 1e-6) - fillBounds(shape).min) * 100 : NaN;
    q['pour:volume'] = p.volume;
  }
  if (m.pump) {
    const p = m.pump;
    const n = num(values[p.pumps]);
    const air = n * p.stroke * m.air;
    const pressure = pumpPressure(m, p, n);
    const tolerance = Number.EPSILON * Math.max(pressure, ...p.firm) * 4;
    q['pump:air'] = air;
    q['pump:mass'] = p.ball + air;
    q['pump:firmness'] = n === 0 ? 'flat' : pressure < p.firm[0] - tolerance ? 'soft' : pressure <= p.firm[1] + tolerance ? 'firm' : 'too-hard';
  }
  if (m.cup) {
    const c = m.cup;
    const pushed = values[c.place] === 'pushed';
    const s = solveCup(m, c, pushed, values[c.hole] === true);
    q['cup:basin-level'] = s.basinLevel;
    q['cup:basin-rise'] = (s.basinLevel - c.basin.depth) * 10;
    q['cup:cup-rise'] = s.rise * 10;
    q['cup:wet'] = s.wet ? 1 : 0;
    q['cup:tissue'] = s.wet ? 'wet' : 'dry';
    q['cup:bubbles'] = s.bubbles;
    q[`volume:${c.liquids.basin}`] = pushed ? 0 : s.basinWater;
    q[`volume:${c.liquids.around}`] = pushed ? s.basinWater - s.water : 0;
    q[`volume:${c.liquids.inside}`] = s.water;
  }
  if (m.squeeze) {
    const s = m.squeeze;
    const pressure = syringePressure(m, s, num(values[s.load]));
    for (const [id, filling] of Object.entries(s.fillings)) q[`squeeze:${id}`] = filling === 'gas' ? s.volume * m.p0 / (m.p0 + pressure) : filling === 'liquid' ? s.volume * (1 - m.water.squash * pressure) : s.volume;
  }
  if (m.pores) {
    const p = m.pores;
    const water = num(values[p.water]);
    const pores = p.sand * p.porosity;
    const above = Math.max(0, water - pores);
    q['pores:reading'] = p.sand + above;
    q['pores:air'] = Math.max(0, pores - water);
    q['pores:wet'] = Math.min(1, water / pores);
    q['pores:bubbles'] = water > 0 && water < pores ? 'rising' : 'none';
    q['pores:vs-sum'] = water > 0 && pores > 0 ? 'less' : 'equal';
    q[`volume:${p.liquids.above}`] = above;
    q[`volume:${p.liquids.jug}`] = p.jug - water;
  }
  return q;
}
