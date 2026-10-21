/**
 * The materials bench (docs/37 §4.2–§4.4, E-MT1): the author data of the
 * `materials` model and its checks. Five fair tests share one set of samples
 * (strength on two supports, flexibility clamped at one end, float or sink,
 * a drop of water, light through); `profile` reads all five for one material.
 * Every constant here is topic data (sourced in the topic's S1), never engine
 * code; the UI shows outcomes only (docs/37 D9).
 */
import { z } from 'zod';
import { kebabId } from '../../content/schema/common';
import type { SimControl } from './sim-schema';
import { bridgeSolve, cantileverSolve, MATERIAL_LIGHT, tankSolve } from './lib/sim/materials';

const positive = z.number().finite().positive();

export const MATERIAL_FAILS = ['snaps', 'bends', 'never'] as const;

/**
 * One sample material: `E` (GPa; not for a `limp` one), `limit` (MPa: the
 * breaking stress of a `snaps` material, the yield stress of a `bends` one,
 * none for `never`), `density` (kg/m³), whether it `absorbs` water and how
 * much `light` it lets through.
 */
export const materialSampleSchema = z
  .object({
    E: positive.optional(),
    limit: positive.optional(),
    fails: z.enum(MATERIAL_FAILS),
    limp: z.literal(true).optional(),
    density: positive,
    absorbs: z.boolean(),
    light: z.enum(MATERIAL_LIGHT),
  })
  .strict();
export type MaterialSample = z.output<typeof materialSampleSchema>;

/** A thing put into the tank: a block of a sample material, or its own `density` (kg/m³; a capped bottle); `height` cm. */
const tankBlock = z.union([
  z.object({ sample: kebabId, height: positive }).strict(),
  z.object({ density: positive, height: positive }).strict(),
]);

export const materialsSchema = z
  .object({
    /** N/kg. */
    g: positive.default(9.8),
    samples: z.record(kebabId, materialSampleSchema),
    /** The strips' cross-section, m. */
    strip: z.object({ width: positive, thick: positive }).strict(),
    /** On two supports: `strip` choice, `masses` step (a count), `mass` kg each, `span` and `clearance` (support height) m, bend thresholds m. */
    bridge: z
      .object({ strip: kebabId, masses: kebabId, mass: positive, span: positive, clearance: positive, bend: z.object({ little: positive, lot: positive }).strict() })
      .strict()
      .optional(),
    /** Clamped at one end: `strip` choice, `push` step (cm), `reach` m sticking out, `droop` m (droops by itself at or beyond), `hang` (a share of `reach`: the most a tip drops). */
    cantilever: z.object({ strip: kebabId, push: kebabId, reach: positive, droop: positive, hang: z.number().gt(0).max(1) }).strict().optional(),
    /** The tank: `block` choice, `water` depth cm, water `density` kg/m³ (fresh water), the tank's inside `height` cm, the things put in. */
    tank: z
      .object({ block: kebabId, water: positive, density: positive.default(1000), height: positive.optional(), blocks: z.record(kebabId, tankBlock) })
      .strict()
      .optional(),
    /** A drop of water on the `square` sample. */
    drops: z.object({ square: kebabId }).strict().optional(),
    /** Light through the `square` sample: the shadow's darkness per outcome (0–1, for the shadow-cast overlay). */
    light: z.object({ square: kebabId, dark: z.object({ most: z.number().min(0).max(1), some: z.number().min(0).max(1), none: z.number().min(0).max(1) }).strict() }).strict().optional(),
    /** All five tests for the `pick` material, with `masses` on the strip and the end pushed `push` cm (legal values of those controls). */
    profile: z.object({ pick: kebabId, masses: z.number(), push: z.number(), block: z.literal('same').default('same'), square: z.literal('same').default('same') }).strict().optional(),
  })
  .strict();

export type MaterialsData = z.output<typeof materialsSchema>;
export interface MaterialsIssue { path: (string | number)[]; message: string }

/**
 * References, the samples' own consistency and the design guards (§4.3): a
 * material that `bends` never reaches its limit at any control value, a
 * floating thing never touches the floor, the water fits the tank.
 */
export function materialsIssues(m: MaterialsData, controls: ReadonlyMap<string, SimControl>): MaterialsIssue[] {
  const out: MaterialsIssue[] = [];
  const issue = (path: MaterialsIssue['path'], message: string) => out.push({ path, message });
  const control = <K extends SimControl['kind']>(path: MaterialsIssue['path'], id: string, kind: K): Extract<SimControl, { kind: K }> | undefined => {
    const c = controls.get(id);
    if (!c) issue(path, `unknown control "${id}"`);
    else if (c.kind !== kind) issue(path, `"${id}" is a ${c.kind} control, not a ${kind}`);
    return c?.kind === kind ? (c as Extract<SimControl, { kind: K }>) : undefined;
  };
  const samples = Object.keys(m.samples);
  const sameAsSamples = (path: MaterialsIssue['path'], id: string) => {
    const c = control(path, id, 'choice');
    if (!c) return undefined;
    for (const o of c.options) if (!m.samples[o.id]) issue(path, `option "${o.id}" of "${id}" has no sample`);
    for (const s of samples) if (!c.options.some((o) => o.id === s)) issue(path, `sample "${s}" is not an option of "${id}"`);
    return c;
  };
  const steps = (path: MaterialsIssue['path'], id: string, integer: boolean) => {
    const c = control(path, id, 'step');
    if (c?.values.some((v) => v < 0 || (integer && !Number.isInteger(v)))) issue(path, integer ? `"${id}" counts masses: whole numbers 0 or more` : `"${id}" values must be 0 or more`);
    return c;
  };

  for (const [id, s] of Object.entries(m.samples)) {
    const at = ['samples', id];
    if (s.limp && s.E !== undefined) issue([...at, 'E'], 'a limp sample has no E (it cannot hold itself up)');
    if (!s.limp && s.E === undefined) issue([...at, 'E'], 'give E (GPa), or `limp: true`');
    if (s.limp && s.fails !== 'never') issue([...at, 'fails'], 'a limp sample never snaps or bends past a limit: `fails: never`');
    if (s.fails === 'snaps' && s.limit === undefined) issue([...at, 'limit'], 'a sample that snaps needs its breaking stress `limit` (MPa)');
    if (s.fails === 'never' && s.limit !== undefined) issue([...at, 'limit'], 'a sample that never fails has no `limit`');
  }
  if (m.light) {
    const d = m.light.dark;
    if (!(d.most < d.some && d.some < d.none)) issue(['light', 'dark'], 'shadows darken from most to some to none light through');
  }

  if (m.bridge) {
    const b = m.bridge;
    const strip = sameAsSamples(['bridge', 'strip'], b.strip);
    const masses = steps(['bridge', 'masses'], b.masses, true);
    if (b.bend.little >= b.bend.lot) issue(['bridge', 'bend'], '`little` must be below `lot`');
    if (strip && masses)
      for (const id of samples) {
        const s = m.samples[id]!;
        if (s.fails !== 'bends' || s.limit === undefined) continue;
        for (const n of masses.values) {
          const r = bridgeSolve(m, id, n);
          if (r.stress >= s.limit * 1e6) issue(['bridge', 'masses'], `"${id}" reaches its limit with ${n} masses (${(r.stress / 1e6).toFixed(1)} ≥ ${s.limit} MPa): it would stay bent, which the model does not draw`);
        }
      }
  }
  if (m.cantilever) {
    const c = m.cantilever;
    const strip = sameAsSamples(['cantilever', 'strip'], c.strip);
    const push = steps(['cantilever', 'push'], c.push, false);
    if (c.droop >= c.hang * c.reach) issue(['cantilever', 'droop'], '`droop` must be below `hang` × `reach`');
    if (strip && push)
      for (const id of samples) {
        const s = m.samples[id]!;
        if (s.fails !== 'bends' || s.limit === undefined) continue;
        for (const v of push.values) {
          const r = cantileverSolve(m, id, v);
          if (r.stress >= s.limit * 1e6) issue(['cantilever', 'push'], `"${id}" reaches its limit pushed ${v} cm (${(r.stress / 1e6).toFixed(1)} ≥ ${s.limit} MPa): it would stay bent, which the model does not draw`);
        }
      }
  }
  if (m.tank) {
    const t = m.tank;
    const c = control(['tank', 'block'], t.block, 'choice');
    for (const o of c?.options ?? []) if (!t.blocks[o.id]) issue(['tank', 'blocks'], `option "${o.id}" of "${t.block}" has no tank entry`);
    for (const id of Object.keys(t.blocks)) if (c && !c.options.some((o) => o.id === id)) issue(['tank', 'blocks', id], `"${id}" is not an option of "${t.block}"`);
    for (const [id, b] of Object.entries(t.blocks)) {
      if ('sample' in b && !m.samples[b.sample]) { issue(['tank', 'blocks', id, 'sample'], `unknown sample "${b.sample}"`); continue; }
      const r = tankSolve(m, id);
      if (r.result === 'floats' && r.rise < 0) issue(['tank', 'blocks', id], `"${id}" floats ${r.immersed.toFixed(2)} cm deep in ${t.water} cm of water: it would touch the bottom`);
      if (r.immersed > b.height + 1e-9) issue(['tank', 'blocks', id], `"${id}" would sink deeper than its own height`);
    }
    if (t.height !== undefined && t.water >= t.height) issue(['tank', 'water'], `${t.water} cm of water does not fit a ${t.height} cm tank`);
  }
  if (m.drops) sameAsSamples(['drops', 'square'], m.drops.square);
  if (m.light) sameAsSamples(['light', 'square'], m.light.square);
  if (m.profile) {
    const p = m.profile;
    sameAsSamples(['profile', 'pick'], p.pick);
    for (const need of ['bridge', 'cantilever', 'tank', 'drops', 'light'] as const) if (!m[need]) issue(['profile'], `profile reads all five tests: give \`${need}\``);
    const masses = m.bridge && controls.get(m.bridge.masses);
    if (masses?.kind === 'step' && !masses.values.includes(p.masses)) issue(['profile', 'masses'], `${p.masses} is not a value of "${masses.id}"`);
    const push = m.cantilever && controls.get(m.cantilever.push);
    if (push?.kind === 'step' && !push.values.includes(p.push)) issue(['profile', 'push'], `${p.push} is not a value of "${push.id}"`);
    if (m.tank) for (const id of samples) if (!m.tank.blocks[id]) issue(['profile', 'block'], `no tank block "${id}" for the ${id} sample (block: same)`);
  }
  return out;
}
