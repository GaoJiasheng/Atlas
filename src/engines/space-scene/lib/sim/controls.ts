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
  for (const [id, v] of valid) if (controls.get(id)!.kind === 'choice') out[id] = v;
  for (const c of choicesWithSets(sim)) Object.assign(out, c.sets?.[String(out[c.id])] ?? {});
  for (const [id, v] of valid) out[id] = v;
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

const ID = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/** `cells.3~gap.pencil-lead~x.on`, keys sorted; empty map = ''. */
export function encodeSimParam(values: Readonly<Record<string, SimValue>>): string {
  return Object.keys(values)
    .sort()
    .map((k) => {
      const v = values[k]!;
      return `${k}.${typeof v === 'boolean' ? (v ? 'on' : 'off') : String(v)}`;
    })
    .join('~');
}

/** Inverse of `encodeSimParam`; malformed entries are dropped (the engine checks values against its controls). */
export function decodeSimParam(param: string): SimValues {
  const out: SimValues = {};
  if (!param) return out;
  for (const item of param.split('~')) {
    const dot = item.indexOf('.');
    if (dot <= 0) continue;
    const key = item.slice(0, dot);
    const raw = item.slice(dot + 1);
    if (!ID.test(key)) continue;
    if (raw === 'on' || raw === 'off') out[key] = raw === 'on';
    else if (/^-?\d+(\.\d+)?$/.test(raw)) out[key] = Number(raw);
    else if (ID.test(raw)) out[key] = raw;
  }
  return out;
}
