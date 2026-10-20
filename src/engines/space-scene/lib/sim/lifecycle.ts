/**
 * The life-cycle model (docs/33 §4.2 E-M1, sim `kind: 'life-cycle'`; pure,
 * synchronous, deterministic, well under 0.1 ms). The data are measured:
 * one row of `lifeCycle.days` per value of the temperature control, the
 * mean days spent in each stage from `start` (day 0 = hatching) up to the
 * last stage (the adult), and optionally the study's own `total` (hatching
 * to adult, measured on all the animals: the stage means come from samples
 * of different sizes, so their sum can differ a little). With a `total` the
 * stages are scaled by total ÷ Σ so they add up to it; without one the total
 * is Σ. Everything shown is worked out from that row (docs/30 D2: a table of
 * measurements, the numbers on show come from the model):
 *
 *   `stage`            the stage on day `day` (a stage covers [from, to):
 *                      left-closed, right-open; on or after the total = the
 *                      last stage; a stage before `start`, the egg, never);
 *   `to-adult`         the total at this temperature (days);
 *   `days-left`        max(0, total − day);
 *   `days:<stage>`     a stage's (scaled) length; `days:<group>` the sum of
 *                      a group's stages (`groups.larva`);
 *   `on:<stage>`       1 on that stage, else 0 (a `tint` binding);
 *   `size:<q>`         `size.<q>.values` at the stage on show (NaN, `—`,
 *                      where it has none);
 *   `control:<id>`     a step control's value (a toggle: 1 / 0), the PLATE
 *                      echo of the water temperature;
 *   `emptying:adults`  `some` when the water is tipped out less often than a
 *                      larva takes to become an adult (`every` > total),
 *                      else `none` (the mean: a fast one is out a little
 *                      sooner, which the content says);
 *   `emptying:eggs`    `none` when the wall is scrubbed too, else `yes`
 *                      (eggs sit above the water line and survive drying);
 *   `rate`             vector `<flow>:<path>` → reference total ÷ total
 *                      (the cycle flow's particle speed: 1 at the reference
 *                      temperature, faster where it is warmer).
 */
import type { LifeCycleData, SimControl, SimValues } from '../../sim-schema';

type QuantityKind = 'number' | 'state' | 'vector';

/** What a life-cycle quantity name is: its kind, the model data it needs, and the id after the prefix. */
export interface LifeCycleQuantity {
  kind: QuantityKind;
  /** The part of `lifeCycle` it needs (`emptying`, `rate`, `size`), if any. */
  needs?: 'emptying' | 'rate' | 'size';
  /** `days:<ref>`, `on:<ref>`, `size:<ref>`, `control:<ref>`. */
  prefix?: 'days' | 'on' | 'size' | 'control';
  ref?: string;
}

const FIXED: Readonly<Record<string, LifeCycleQuantity>> = {
  stage: { kind: 'state' },
  'to-adult': { kind: 'number' },
  'days-left': { kind: 'number' },
  'emptying:adults': { kind: 'state', needs: 'emptying' },
  'emptying:eggs': { kind: 'state', needs: 'emptying' },
  rate: { kind: 'vector', needs: 'rate' },
};

/** The states of the emptying quantities (each needs a label). */
export const EMPTYING_STATES: Readonly<Record<string, readonly string[]>> = {
  'emptying:adults': ['none', 'some'],
  'emptying:eggs': ['yes', 'none'],
};

/** A quantity name's kind and what it refers to (null: not a life-cycle quantity name). */
export function lifeCycleQuantity(name: string): LifeCycleQuantity | null {
  const fixed = FIXED[name];
  if (fixed) return fixed;
  const m = /^(days|on|size|control):([a-z0-9]+(?:-[a-z0-9]+)*)$/.exec(name);
  if (!m) return null;
  const prefix = m[1] as 'days' | 'on' | 'size' | 'control';
  return { kind: 'number', prefix, ref: m[2]!, ...(prefix === 'size' ? { needs: 'size' as const } : {}) };
}

/** The stages that take days: from `start` up to, not including, the last stage. */
export function timedStages(lc: Pick<LifeCycleData, 'stages' | 'start'>): string[] {
  const ids = lc.stages.map((s) => s.id);
  const i = ids.indexOf(lc.start);
  return i < 0 ? [] : ids.slice(i, -1);
}

/** The id of the last stage (the adult). */
export const lastStage = (lc: Pick<LifeCycleData, 'stages'>): string => lc.stages[lc.stages.length - 1]?.id ?? '';

/** One stage's place on the day line at a temperature: [from, to) in days after hatching. */
export interface StageSpan {
  id: string;
  from: number;
  to: number;
  /** to − from. */
  days: number;
}

/** The measured row at a temperature, scaled to its `total`: the stages' spans and the total (null: no row). */
export function stageSpans(lc: Pick<LifeCycleData, 'stages' | 'start' | 'days'>, temp: number): { spans: StageSpan[]; total: number } | null {
  const row = lc.days[String(temp)];
  if (!row) return null;
  const ids = timedStages(lc);
  const sum = ids.reduce((s, id) => s + (row[id] ?? 0), 0);
  const total = row.total ?? sum;
  const k = sum > 0 ? total / sum : 0;
  const spans: StageSpan[] = [];
  let at = 0;
  ids.forEach((id, i) => {
    // The last boundary is the total itself (no drift from the scaling).
    const to = i === ids.length - 1 ? total : at + (row[id] ?? 0) * k;
    spans.push({ id, from: at, to, days: to - at });
    at = to;
  });
  return { spans, total };
}

/** The stage on day `day` (left-closed, right-open spans; on or after the total: the last stage). */
export function stageOnDay(spans: readonly StageSpan[], total: number, last: string, day: number): string {
  if (day >= total) return last;
  for (const s of spans) if (day < s.to) return s.id;
  return last;
}

const num = (v: unknown, d = 0) => (typeof v === 'number' ? v : typeof v === 'boolean' ? (v ? 1 : 0) : d);

/** Every quantity of the model for these control values (`controls`: the sim's, for `control:<id>`). */
export function solveLifeCycle(lc: LifeCycleData, values: SimValues, controls: readonly SimControl[]): Record<string, number | string | Readonly<Record<string, number>>> {
  const temp = num(values[lc.temp], NaN);
  const day = num(values[lc.day]);
  const solved = stageSpans(lc, temp);
  const last = lastStage(lc);
  const spans = solved?.spans ?? [];
  const total = solved?.total ?? NaN;
  const stage = solved ? stageOnDay(spans, total, last, day) : (timedStages(lc)[0] ?? last);
  const q: Record<string, number | string | Readonly<Record<string, number>>> = {
    stage,
    'to-adult': total,
    'days-left': Number.isFinite(total) ? Math.max(0, total - day) : NaN,
  };
  const length = new Map(spans.map((s) => [s.id, s.days]));
  for (const s of spans) q[`days:${s.id}`] = s.days;
  for (const [g, members] of Object.entries(lc.groups ?? {})) q[`days:${g}`] = groupStages(members).reduce((a, id) => a + (length.get(id) ?? 0), 0);
  for (const s of lc.stages) q[`on:${s.id}`] = s.id === stage ? 1 : 0;
  for (const [name, sz] of Object.entries(lc.size ?? {})) q[`size:${name}`] = sz.values[stage] ?? NaN;
  for (const c of controls) if (c.kind !== 'choice') q[`control:${c.id}`] = num(values[c.id], NaN);
  if (lc.emptying) {
    const every = num(values[lc.emptying.every], NaN);
    q['emptying:adults'] = Number.isFinite(total) && every > total ? 'some' : 'none';
    q['emptying:eggs'] = lc.emptying.wipe !== undefined && values[lc.emptying.wipe] === true ? 'none' : 'yes';
  }
  if (lc.rate) {
    const ref = stageSpans(lc, lc.rate.reference)?.total ?? NaN;
    const r = Number.isFinite(ref) && total > 0 ? ref / total : 0;
    q.rate = Object.fromEntries(lc.rate.paths.map((p) => [`${lc.rate!.flow}:${p}`, r]));
  }
  return q;
}

/** A group's stage ids (written as a list, or `{ stages, label }` with a label for the card's bracket). */
export function groupStages(g: NonNullable<LifeCycleData['groups']>[string]): readonly string[] {
  return Array.isArray(g) ? g : g.stages;
}
