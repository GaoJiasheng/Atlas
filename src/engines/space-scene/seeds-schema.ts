/**
 * The seeds bench (docs/41 §4.2–§4.3, E-S1): the author data of the `seeds`
 * model and its checks. Three sub-models, each optional: `dispersal` (a
 * fruit → how its seeds travel and the structure that helps), `timing` (a
 * laboratory temperature → the median days to half germination, and whether
 * a day has reached it) and `cups` (a germination test: cups of seeds under
 * set conditions → germinated or not on the day they are checked, the
 * seedlings' colour, and what differs between two cups). The model only
 * combines sourced facts by rule (docs/41 D8–D9); every value is topic data.
 */
import { z } from 'zod';
import { kebabId } from '../../content/schema/common';
import type { SimControl } from './sim-schema';
import { CUP_FACTORS, cupConditions, cupKey } from './lib/sim/seeds';

/** The four ways seeds travel (MOE P5): by the wind, by water, by animals, or when the fruit bursts or splits open. */
export const SEED_METHODS = ['wind', 'water', 'animals', 'splitting'] as const;
/** The structure that helps (MOE P6 calls these structural adaptations): a wing, air spaces that float, juicy flesh animals eat, a dry fruit that bursts. */
export const SEED_FEATURES = ['wing', 'floats', 'eaten', 'bursts'] as const;

const fruitSchema = z.object({ method: z.enum(SEED_METHODS), feature: z.enum(SEED_FEATURES) }).strict();

/** Where a cup stands: warm enough to germinate, and lit. */
const placeSchema = z.object({ warm: z.boolean(), light: z.boolean() }).strict();
/** One cup: damp (`water`), open to the `air`, standing at `place`. */
const cupSchema = z.object({ water: z.boolean(), air: z.boolean(), place: kebabId }).strict();

export const seedsSchema = z
  .object({
    /** `fruit`: a choice control (its options = the keys of `fruits`). */
    dispersal: z.object({ fruit: kebabId, fruits: z.record(kebabId, fruitSchema) }).strict().optional(),
    /** `temp`, `day`: step controls; `medians`: days to half germination per value of `temp` (keys written as the number: `14`, not `14.0`). */
    timing: z.object({ temp: kebabId, day: kebabId, medians: z.record(z.string(), z.number().finite().positive()) }).strict().optional(),
    /**
     * `cup`, `against`: choice controls (options = the keys of `set`); `day`: a
     * step control; `after`: the day the cups are checked (a value of `day`;
     * before it every cup is `waiting`).
     */
    cups: z
      .object({
        cup: kebabId,
        against: kebabId,
        day: kebabId,
        after: z.number().finite().nonnegative(),
        places: z.record(kebabId, placeSchema),
        set: z.record(kebabId, cupSchema),
      })
      .strict()
      .optional(),
  })
  .strict();

export type SeedsData = z.output<typeof seedsSchema>;
export type SeedsCups = NonNullable<SeedsData['cups']>;
export type SeedsTiming = NonNullable<SeedsData['timing']>;
export type SeedsDispersal = NonNullable<SeedsData['dispersal']>;
export interface SeedsIssue { path: (string | number)[]; message: string }

/**
 * References and the data's own consistency (§4.3): the controls exist and
 * are of the right kind; `fruit`'s options are the fruits; `medians` covers
 * each temperature once; the cups' places exist and `after` is a day the
 * cups can be checked on; no two cups are set up the same (comparing them
 * would change nothing).
 */
export function seedsIssues(s: SeedsData, controls: ReadonlyMap<string, SimControl>): SeedsIssue[] {
  const out: SeedsIssue[] = [];
  const issue = (path: SeedsIssue['path'], message: string) => out.push({ path, message });
  const control = <K extends SimControl['kind']>(path: SeedsIssue['path'], id: string, kind: K): Extract<SimControl, { kind: K }> | undefined => {
    const c = controls.get(id);
    if (!c) issue(path, `unknown control "${id}"`);
    else if (c.kind !== kind) issue(path, `"${id}" is a ${c.kind} control, not a ${kind}`);
    return c?.kind === kind ? (c as Extract<SimControl, { kind: K }>) : undefined;
  };
  /** The choice's options are exactly the keys of `table`. */
  const covers = (path: SeedsIssue['path'], c: Extract<SimControl, { kind: 'choice' }> | undefined, table: Readonly<Record<string, unknown>>, what: string) => {
    if (!c) return;
    for (const o of c.options) if (!(o.id in table)) issue(path, `option "${o.id}" of "${c.id}" has no ${what}`);
    for (const k of Object.keys(table)) if (!c.options.some((o) => o.id === k)) issue([...path, k], `"${k}" is not an option of "${c.id}"`);
  };
  const days = (path: SeedsIssue['path'], c: Extract<SimControl, { kind: 'step' }> | undefined) => {
    if (c?.values.some((v) => v < 0)) issue(path, `"${c.id}" counts days: values must be 0 or more`);
  };

  if (!s.dispersal && !s.timing && !s.cups) issue([], 'give at least one of `dispersal`, `timing`, `cups`');

  if (s.dispersal) {
    const c = control(['dispersal', 'fruit'], s.dispersal.fruit, 'choice');
    covers(['dispersal', 'fruits'], c, s.dispersal.fruits, 'entry in `fruits`');
  }

  if (s.timing) {
    const t = s.timing;
    const temp = control(['timing', 'temp'], t.temp, 'step');
    days(['timing', 'day'], control(['timing', 'day'], t.day, 'step'));
    if (temp) {
      const keys = temp.values.map(String);
      for (const k of keys) if (!(k in t.medians)) issue(['timing', 'medians'], `no median for ${k} (a value of "${temp.id}")`);
      for (const k of Object.keys(t.medians)) if (!keys.includes(k)) issue(['timing', 'medians', k], `"${k}" is not a value of "${temp.id}" (write the number as the control does: ${keys.join(', ')})`);
    }
  }

  if (s.cups) {
    const k = s.cups;
    covers(['cups', 'set'], control(['cups', 'cup'], k.cup, 'choice'), k.set, 'cup in `set`');
    covers(['cups', 'set'], control(['cups', 'against'], k.against, 'choice'), k.set, 'cup in `set`');
    if (k.cup === k.against) issue(['cups', 'against'], '`against` is the cup it is compared with: a control of its own, not `cup`');
    const day = control(['cups', 'day'], k.day, 'step');
    days(['cups', 'day'], day);
    if (day && !day.values.includes(k.after)) issue(['cups', 'after'], `${k.after} is not a value of "${day.id}" (${day.values.join(', ')}): the cups are checked on a day the reader can step to`);
    for (const [id, cup] of Object.entries(k.set)) if (!(cup.place in k.places)) issue(['cups', 'set', id, 'place'], `unknown place "${cup.place}" (${Object.keys(k.places).join(', ')})`);
    // Two cups set up the same: comparing them changes nothing, and `changed` would call two cups the same cup.
    const seen = new Map<string, string>();
    for (const id of Object.keys(k.set)) {
      const f = cupConditions(k, id);
      if (!f) continue;
      const key = cupKey(f);
      const twin = seen.get(key);
      if (twin) issue(['cups', 'set', id], `"${id}" is set up like "${twin}" (${CUP_FACTORS.filter((x) => f[x]).join(', ') || 'none of water, air, warmth, light'}): give each cup its own conditions`);
      else seen.set(key, id);
    }
  }
  return out;
}
