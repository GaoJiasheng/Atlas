/**
 * The `seeds` model (docs/41 §4.2, E-S1; pure, synchronous, deterministic,
 * well under 0.05 ms): sourced facts combined by rule, no numbers made up.
 *
 * - `dispersal`: the chosen fruit's row — `dispersal:method` (wind / water /
 *   animals / splitting) and `dispersal:feature` (wing / floats / eaten /
 *   bursts).
 * - `timing`: m = `medians[temp]` (days until half the seeds that germinate
 *   have germinated, one laboratory study); `timing:median` = m,
 *   `timing:half` = day ≥ m ? `half-or-more` : `fewer`.
 * - `cups`: a cup germinates when it has water ∧ air ∧ a warm place (light
 *   is not in the rule); on a day before `after` every cup is `waiting`.
 *   A germinated cup's seedlings are `green` in a lit place, else `pale`.
 *   `cups:changed` compares the chosen cup with the `against` cup over water,
 *   air, warmth and light: none different → `same-cup`, one → that factor,
 *   two or more → `more-than-one`. `cup:<id>:grown` / `cup:<id>:pale` are
 *   1 / 0 per cup (for `visible` and `tint` bindings).
 *
 * Plus `control:<id>` (a step's value, a toggle's 1 / 0) for the PLATE.
 */
import type { SimControl, SimOutput, SimValues } from '../../sim-schema';
import type { SeedsCups, SeedsData } from '../../seeds-schema';

export const CUP_FACTORS = ['water', 'air', 'warmth', 'light'] as const;
export type CupFactor = (typeof CUP_FACTORS)[number];
export type CupConditions = Readonly<Record<CupFactor, boolean>>;
export const CUP_RESULTS = ['waiting', 'germinated', 'not-germinated'] as const;
export type CupResult = (typeof CUP_RESULTS)[number];
export type CupSeedlings = 'none' | 'green' | 'pale';
export type CupChange = 'same-cup' | CupFactor | 'more-than-one';
export type HalfState = 'fewer' | 'half-or-more';

/** A cup's four conditions (null: no such cup, or its place is unknown). */
export function cupConditions(cups: Pick<SeedsCups, 'set' | 'places'>, id: string): CupConditions | null {
  const cup = cups.set[id];
  const place = cup ? cups.places[cup.place] : undefined;
  if (!cup || !place) return null;
  return { water: cup.water, air: cup.air, warmth: place.warm, light: place.light };
}

/** One string per set of conditions (two cups with the same key are set up alike). */
export const cupKey = (c: CupConditions): string => CUP_FACTORS.map((f) => (c[f] ? 1 : 0)).join('');

/** Germination needs water, air and warmth; light is not in the rule (most seeds, green beans among them). */
export const germinates = (c: CupConditions): boolean => c.water && c.air && c.warmth;

/** The cup on this day: `waiting` before the check day, then germinated or not. */
export function cupResult(cups: SeedsCups, id: string, day: number): CupResult {
  const c = cupConditions(cups, id);
  if (day < cups.after) return 'waiting';
  return c && germinates(c) ? 'germinated' : 'not-germinated';
}

/** The seedlings in a cup on this day: green in a lit place, pale in the dark, none before they germinate. */
export function cupSeedlings(cups: SeedsCups, id: string, day: number): CupSeedlings {
  if (cupResult(cups, id, day) !== 'germinated') return 'none';
  return cupConditions(cups, id)!.light ? 'green' : 'pale';
}

/** What differs between two cups: nothing (`same-cup`), exactly one factor, or `more-than-one` (not a fair test). */
export function cupChange(cups: Pick<SeedsCups, 'set' | 'places'>, a: string, b: string): CupChange {
  const x = cupConditions(cups, a);
  const y = cupConditions(cups, b);
  if (!x || !y) return 'same-cup';
  const differ = CUP_FACTORS.filter((f) => x[f] !== y[f]);
  return differ.length === 0 ? 'same-cup' : differ.length === 1 ? differ[0]! : 'more-than-one';
}

/** By this day, have half (or more) of the seeds that germinate germinated? The median day itself counts. */
export const halfState = (median: number, day: number): HalfState => (day >= median ? 'half-or-more' : 'fewer');

const num = (v: unknown): number => (typeof v === 'number' ? v : typeof v === 'boolean' ? (v ? 1 : 0) : NaN);

/** Every quantity for these control values. */
export function solveSeeds(s: SeedsData, values: SimValues, controls: readonly SimControl[] = []): Record<string, number | string> {
  const q: Record<string, number | string> = {};
  for (const c of controls) if (c.kind !== 'choice') q[`control:${c.id}`] = num(values[c.id]);
  if (s.dispersal) {
    const f = s.dispersal.fruits[String(values[s.dispersal.fruit])];
    q['dispersal:method'] = f?.method ?? '';
    q['dispersal:feature'] = f?.feature ?? '';
  }
  if (s.timing) {
    const m = s.timing.medians[String(values[s.timing.temp])] ?? NaN;
    q['timing:median'] = m;
    q['timing:half'] = halfState(m, num(values[s.timing.day]));
  }
  if (s.cups) {
    const k = s.cups;
    const day = num(values[k.day]);
    const cup = String(values[k.cup]);
    const against = String(values[k.against]);
    for (const id of Object.keys(k.set)) {
      const r = cupResult(k, id, day);
      q[`cup:${id}:grown`] = r === 'germinated' ? 1 : 0;
      q[`cup:${id}:pale`] = cupSeedlings(k, id, day) === 'pale' ? 1 : 0;
    }
    q['cups:result'] = cupResult(k, cup, day);
    q['cups:against-result'] = cupResult(k, against, day);
    q['cups:seedlings'] = cupSeedlings(k, cup, day);
    q['cups:changed'] = cupChange(k, cup, against);
  }
  return q;
}

type Kind = SimOutput['kind'];
const CATALOG: Readonly<Record<'dispersal' | 'timing' | 'cups', Readonly<Record<string, Kind>>>> = {
  dispersal: { method: 'state', feature: 'state' },
  timing: { median: 'number', half: 'state' },
  cups: { result: 'state', 'against-result': 'state', seedlings: 'state', changed: 'state' },
};

/** The kind of a quantity of this bench (null: none of that name, or its sub-model is not in the data). */
export function seedsQuantity(s: SeedsData, from: string, controls: readonly SimControl[]): Kind | null {
  const split = from.indexOf(':');
  if (split < 1) return null;
  const model = from.slice(0, split);
  const name = from.slice(split + 1);
  if (model === 'control') return controls.some((c) => c.id === name && c.kind !== 'choice') ? 'number' : null;
  if (model === 'cup') {
    const [id, what] = name.split(':');
    return s.cups && id && s.cups.set[id] && (what === 'grown' || what === 'pale') && name.split(':').length === 2 ? 'number' : null;
  }
  if (!(model in CATALOG) || !s[model as keyof SeedsData]) return null;
  return CATALOG[model as keyof typeof CATALOG][name] ?? null;
}

const valuesOf = (controls: readonly SimControl[], id: string | undefined): (string | number | boolean)[] => {
  const c = controls.find((x) => x.id === id);
  return c?.kind === 'choice' ? c.options.map((o) => o.id) : c?.kind === 'step' ? c.values : c?.kind === 'toggle' ? [false, true] : [];
};

/** Every state a state quantity takes over all values of the controls its sub-model reads (in first-seen order). */
export function seedsStates(s: SeedsData, from: string, controls: readonly SimControl[]): string[] | undefined {
  if (seedsQuantity(s, from, controls) !== 'state') return undefined;
  const model = from.slice(0, from.indexOf(':'));
  const reads: Record<string, (string | undefined)[]> = {
    dispersal: [s.dispersal?.fruit],
    timing: [s.timing?.temp, s.timing?.day],
    cups: [s.cups?.cup, s.cups?.against, s.cups?.day],
  };
  const ids = reads[model] ?? [];
  const seen = new Set<string>();
  const base: SimValues = Object.fromEntries(controls.map((c) => [c.id, c.default]));
  const vary = (i: number, values: SimValues) => {
    if (i === ids.length) {
      const v = solveSeeds(s, values, controls)[from];
      if (typeof v === 'string' && v !== '') seen.add(v);
      return;
    }
    for (const x of valuesOf(controls, ids[i])) vary(i + 1, { ...values, [ids[i]!]: x });
  };
  vary(0, base);
  return [...seen];
}
