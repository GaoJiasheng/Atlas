/**
 * Try-it control values (pure, unit-tested; docs/22 §4.3 S1).
 *
 * The store keeps only the values a chapter, a beat or the reader has set
 * (`sim`, not cumulative: a chapter starts from its own `state.sim.set`). The
 * values on show are the defaults, then each choice's `sets` for the option it
 * is on, then the values set by hand; a choice whose `sets` no longer match
 * shows the matching option, else its first option without `sets` (`free`).
 *
 * URL `sim`: `cells.3~gap.pencil-lead~x.on` (toggles `on` / `off`).
 */
import type { SimControl, SimData, SimValue, SimValues } from '../../sim-schema';

/** Whether `v` is a value of control `c`. */
export function isControlValue(c: SimControl, v: unknown): v is SimValue {
  if (c.kind === 'toggle') return typeof v === 'boolean';
  if (c.kind === 'step') return typeof v === 'number' && c.values.includes(v);
  return typeof v === 'string' && c.options.some((o) => o.id === v);
}

export function simDefaults(sim: Pick<SimData, 'controls'>): SimValues {
  return Object.fromEntries(sim.controls.map((c) => [c.id, c.default]));
}

type Choice = Extract<SimControl, { kind: 'choice' }>;
const choicesWithSets = (sim: Pick<SimData, 'controls'>) => sim.controls.filter((c): c is Choice => c.kind === 'choice' && c.sets !== undefined);

/** Controls a choice's `sets` cover. */
export function coveredBy(c: Choice): string[] {
  return [...new Set(Object.values(c.sets ?? {}).flatMap((s) => Object.keys(s)))];
}

/**
 * The option a choice shows: its own while that option's `sets` still hold (an
 * option without `sets`, `free`, always does), else the option whose `sets`
 * hold, else the first option without `sets`.
 */
export function matchingOption(c: Choice, values: SimValues): string {
  const cur = values[c.id];
  const holds = (id: string) => Object.entries(c.sets?.[id] ?? {}).every(([k, v]) => values[k] === v);
  if (typeof cur === 'string' && c.options.some((o) => o.id === cur) && holds(cur)) return cur;
  return c.options.find((o) => c.sets?.[o.id] !== undefined && holds(o.id))?.id ?? c.options.find((o) => c.sets?.[o.id] === undefined)!.id;
}

/** The values on show: defaults ⊕ choices' `sets` ⊕ values set by hand (invalid ones ignored). */
export function resolveSimValues(sim: Pick<SimData, 'controls'>, set: Readonly<Record<string, unknown>>): SimValues {
  const controls = new Map(sim.controls.map((c) => [c.id, c]));
  const out = simDefaults(sim);
  const valid = Object.entries(set).filter(([id, v]) => {
    const c = controls.get(id);
    return c !== undefined && isControlValue(c, v);
  }) as [string, SimValue][];
  // Defaults first; an explicitly selected choice then owns its free target
  // options (e.g. selecting a sheet clears the opaque object in the holder).
  for (const c of choicesWithSets(sim)) Object.assign(out, c.sets?.[String(out[c.id])] ?? {});
  for (const [id, v] of valid) {
    const c = controls.get(id)!;
    if (c.kind !== 'choice') continue;
    out[id] = v;
    Object.assign(out, c.sets?.[String(v)] ?? {});
  }
  for (const [id, v] of valid) if (controls.get(id)!.kind !== 'choice') out[id] = v;
  for (const c of choicesWithSets(sim)) out[c.id] = matchingOption(c, out);
  return out;
}

/**
 * The store's values after the reader (or a key) sets control `id` to `value`.
 * Picking a choice option drops the hand-set values its `sets` now decide (or,
 * for an option without `sets`, keeps the covered controls where they are);
 * setting a covered control moves its choice to the matching option.
 */
export function setSimControl(sim: Pick<SimData, 'controls'>, set: Readonly<SimValues>, id: string, value: SimValue): SimValues {
  const c = sim.controls.find((x) => x.id === id);
  if (!c || !isControlValue(c, value)) return { ...set };
  const before = resolveSimValues(sim, set);
  let next: SimValues = { ...set, [id]: value };
  if (c.kind === 'choice' && c.sets) {
    const own = c.sets[String(value)];
    for (const k of coveredBy(c)) {
      if (own) delete next[k];
      else next[k] = before[k]!;
    }
  }
  for (const ch of choicesWithSets(sim)) {
    if (ch.id === id || !coveredBy(ch).includes(id)) continue;
    const now = resolveSimValues(sim, next);
    const option = now[ch.id] as string;
    const keep = Object.fromEntries(coveredBy(ch).map((k) => [k, now[k]!]));
    next = { ...next, ...keep, [ch.id]: option };
    if (ch.sets?.[option]) for (const k of coveredBy(ch)) delete next[k];
  }
  return next;
}

/** The value one step before / after the current one (toggle: off / on; ends hold). */
export function stepValue(c: SimControl, current: SimValue, direction: 1 | -1): SimValue {
  if (c.kind === 'toggle') return direction > 0;
  const list: SimValue[] = c.kind === 'step' ? c.values : c.options.map((o) => o.id);
  const i = list.indexOf(current);
  return list[Math.min(list.length - 1, Math.max(0, (i < 0 ? 0 : i) + direction))]!;
}

/* ------------------------------------------------------------------ */
/* URL                                                                 */
/* ------------------------------------------------------------------ */

export { encodeSimParam, decodeSimParam } from '../../../core/engine-url-fields';
