/** The seven independent matter experiments (docs/36 §4.2). */
import { z } from 'zod';
import { kebabId } from '../../content/schema/common';
import type { Primitive } from './schema';
import type { SimControl } from './sim-schema';
import { capacity, fillShapeForPrimitive } from './lib/fill';
import { solveCup } from './lib/sim/matter';

const positive = z.number().finite().positive();
const nonnegative = z.number().finite().nonnegative();
const liquidIds = <T extends z.ZodRawShape>(shape: T) => z.object(shape).strict();

export const matterSchema = z.object({
  /** m/s², kPa, g/litre, then water's g/ml and compressibility per kPa. */
  g: positive.default(9.8),
  p0: positive.default(101.325),
  air: positive.default(1.18),
  water: z.object({ density: positive, squash: nonnegative }).strict().default({ density: 0.997, squash: 4.5e-7 }),
  objects: z.record(kebabId, z.object({ volume: positive, density: positive, floats: z.boolean().optional() }).strict()).default({}),
  weigh: z.object({ object: kebabId, step: positive }).strict().optional(),
  displace: z.object({ object: kebabId, water: nonnegative, liquid: kebabId, step: positive }).strict().optional(),
  pour: z.object({ container: kebabId, volume: positive, liquids: z.record(kebabId, kebabId) }).strict().optional(),
  pump: z.object({ pumps: kebabId, ball: positive, stroke: positive, inside: positive, firm: z.tuple([positive, positive]) }).strict().optional(),
  cup: z.object({
    place: kebabId,
    hole: kebabId,
    basin: z.object({ radius: positive, depth: positive }).strict(),
    cup: z.object({ radius: positive, height: positive, glass: positive, rim: nonnegative, top: positive }).strict(),
    liquids: liquidIds({ basin: kebabId, around: kebabId, inside: kebabId }),
  }).strict().optional(),
  squeeze: z.object({ load: kebabId, volume: positive, bore: positive, fillings: z.record(kebabId, z.enum(['gas', 'liquid', 'grains'])) }).strict().optional(),
  pores: z.object({ water: kebabId, sand: positive, porosity: z.number().finite().gt(0).lt(0.6), liquids: liquidIds({ above: kebabId, jug: kebabId }), jug: positive }).strict().optional(),
}).strict();

export type MatterData = z.output<typeof matterSchema>;
export type MatterPart = { id: string; primitive?: Primitive; context?: boolean; repeat?: unknown; extra?: readonly unknown[] };
export interface MatterIssue { path: (string | number)[]; message: string }

/** All geometric and control references are checked at the parts-file boundary. */
export function matterIssues(m: MatterData, controls: ReadonlyMap<string, SimControl>, parts: readonly MatterPart[]): MatterIssue[] {
  const out: MatterIssue[] = [];
  const issue = (path: MatterIssue['path'], message: string) => out.push({ path, message });
  const control = <K extends SimControl['kind']>(path: MatterIssue['path'], id: string, kind: K): Extract<SimControl, { kind: K }> | undefined => {
    const c = controls.get(id);
    if (!c) issue(path, `unknown control "${id}"`);
    else if (c.kind !== kind) issue(path, `"${id}" is a ${c.kind} control, not a ${kind}`);
    return c?.kind === kind ? c as Extract<SimControl, { kind: K }> : undefined;
  };
  const step = (path: MatterIssue['path'], id: string) => {
    const c = control(path, id, 'step');
    if (c?.values.some((v) => v < 0)) issue(path, 'experiment values must be 0 or more');
    return c;
  };
  const liquid = (path: MatterIssue['path'], id: string, max?: number) => {
    const p = parts.find((p) => p.id === id);
    if (!p) { issue(path, `unknown liquid part "${id}"`); return; }
    if (p.context) issue(path, `"${id}" is a context part (never selected)`);
    const shape = p.primitive && fillShapeForPrimitive(p.primitive);
    if (!shape) issue(path, `"${id}" needs a lathe or box primitive`);
    if (p.repeat !== undefined || (p.extra?.length ?? 0) > 0) issue(path, `"${id}" may not have repeat or extra`);
    if (shape && max !== undefined && max * 1e-6 > capacity(shape) + 1e-12) issue(path, `${max} ml exceeds "${id}" capacity (${capacity(shape) * 1e6} ml)`);
  };
  for (const key of ['weigh', 'displace'] as const) {
    const model = m[key];
    if (!model) continue;
    const c = control([key, 'object'], model.object, 'choice');
    for (const o of c?.options ?? []) {
      if (o.id === 'nothing' && key === 'displace') continue;
      if (!m.objects[o.id]) issue([key, 'object'], `option "${o.id}" has no objects entry`);
      else if (key === 'displace' && m.objects[o.id]!.floats) issue([key, 'object'], `"${o.id}" floats: it cannot be submerged for displacement`);
    }
    if (key === 'displace' && m.displace) {
      const max = Math.max(0, ...(c?.options ?? []).map((o) => m.objects[o.id]?.volume ?? 0));
      liquid([key, 'liquid'], m.displace.liquid, m.displace.water + max);
    }
  }
  if (m.pour) {
    const p = m.pour;
    const c = control(['pour', 'container'], p.container, 'choice');
    for (const o of c?.options ?? []) if (!p.liquids[o.id]) issue(['pour', 'liquids'], `container option "${o.id}" has no liquid part`);
    for (const [option, id] of Object.entries(p.liquids)) {
      if (c && !c.options.some((o) => o.id === option)) issue(['pour', 'liquids', option], `"${option}" is not an option of "${c.id}"`);
      liquid(['pour', 'liquids', option], id, p.volume);
    }
    if (new Set(Object.values(p.liquids)).size !== Object.values(p.liquids).length) issue(['pour', 'liquids'], 'each container needs its own liquid part');
  }
  if (m.pump) {
    step(['pump', 'pumps'], m.pump.pumps);
    if (m.pump.firm[0] > m.pump.firm[1]) issue(['pump', 'firm'], 'firm pressure bounds must ascend');
  }
  if (m.cup) {
    const c = m.cup;
    const place = control(['cup', 'place'], c.place, 'choice');
    if (place && (place.options.length !== 2 || !['above', 'pushed'].every((id) => place.options.some((o) => o.id === id)))) issue(['cup', 'place'], 'cup places must be above and pushed');
    control(['cup', 'hole'], c.hole, 'toggle');
    if (c.cup.top <= c.cup.rim) issue(['cup', 'cup', 'top'], 'cup top must be above its rim');
    if (c.cup.radius >= c.basin.radius) issue(['cup', 'cup', 'radius'], 'cup must fit inside the basin');
    for (const hole of [false, true]) {
      const solved = solveCup(m, c, true, hole);
      if (solved.basinLevel <= c.cup.top) issue(['cup', 'cup', 'top'], `pushed cup must be fully submerged ${hole ? 'with' : 'without'} a hole`);
    }
    const v = Math.PI * c.basin.radius ** 2 * c.basin.depth;
    liquid(['cup', 'liquids', 'basin'], c.liquids.basin, v);
    liquid(['cup', 'liquids', 'around'], c.liquids.around, v);
    liquid(['cup', 'liquids', 'inside'], c.liquids.inside, Math.PI * c.cup.radius ** 2 * c.cup.height);
  }
  if (m.squeeze) {
    const s = m.squeeze;
    const load = step(['squeeze', 'load'], s.load);
    const kinds = Object.values(s.fillings);
    if (kinds.length !== 3 || !['gas', 'liquid', 'grains'].every((k) => kinds.includes(k as typeof kinds[number]))) issue(['squeeze', 'fillings'], 'fillings must name one gas, one liquid and one grains experiment');
    const max = Math.max(0, ...(load?.values ?? []));
    const pressure = max * m.g / (Math.PI * (s.bore / 2) ** 2 * 1e-4) / 1000;
    if (m.water.squash * pressure >= 1) issue(['squeeze', 'load'], 'load exceeds the liquid model compressibility range');
  }
  if (m.pores) {
    const p = m.pores;
    const water = step(['pores', 'water'], p.water);
    const max = Math.max(0, ...(water?.values ?? []));
    if (max > p.jug) issue(['pores', 'water'], `water control exceeds the jug's ${p.jug} ml`);
    // The above-sand profile includes the sand's occupied volume (`fill.below`).
    liquid(['pores', 'liquids', 'above'], p.liquids.above, p.sand + Math.max(0, max - p.sand * p.porosity));
    liquid(['pores', 'liquids', 'jug'], p.liquids.jug, p.jug);
  }
  return out;
}

/** Warnings stay separate from schema errors, so unused object data do not prevent loading. */
export function matterWarnings(m: MatterData, controls: ReadonlyMap<string, SimControl>): MatterIssue[] {
  const used = new Set<string>();
  for (const model of [m.weigh, m.displace]) {
    const c = model && controls.get(model.object);
    if (c?.kind === 'choice') for (const o of c.options) used.add(o.id);
  }
  return Object.keys(m.objects).filter((id) => !used.has(id)).map((id) => ({ path: ['objects', id], message: `object "${id}" is not used by any experiment option` }));
}
