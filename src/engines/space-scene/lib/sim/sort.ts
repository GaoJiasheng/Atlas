/**
 * The sort model (docs/38 §4.2 E-LT1, sim `kind: 'sort'`; pure, synchronous,
 * deterministic, well under 0.2 ms for 32 specimens). Each specimen has a
 * true group and yes / no answers to the questions (observable features,
 * with sources: the content's feature table). The tray control picks a tray:
 * the specimens out, a layout of groups on the sorting tray, and a key. The
 * key reads only the features (never the true group, except to put a
 * classmate's arrangement right):
 *
 *   ask <choice>             `none` → all stay in the case (`u`); else yes → A, no → B;
 *   ask + no: { ask }        yes to the first → A; else yes to the second → B;
 *                            else C (the second at `none`: the rest stay in the case);
 *   chain [q1 … qn], asked k the first k questions in turn: the first yes, the
 *                            i-th → the i-th letter; no yes in k: k < n → `u`,
 *                            k = n → `else`;
 *   arrangement + fix        fix off → where the data puts each; on → the group
 *                            headed with its true group (none: the group headed
 *                            `none`).
 *
 * Inside a group the specimens take slots in the order of `specimens` (the
 * case order): the k-th at column k mod cols, row ⌊k ÷ cols⌋ (rows run from
 * the back), slot centre = `at` + ((col − (cols − 1)/2) × pitch, 0,
 * (row − (rows − 1)/2) × pitch). A specimen's offset (the `shift` binding)
 * is that slot less its home: the main primitive's `at` in x and z, the
 * part's underside (rest bounds) in y, so it stands on the pad.
 *
 * Quantities (outputs' `from`):
 *   `slots`          vector `<part>:x|y|z|shown` (the offset, scene units;
 *                    shown 0 = not on this tray: the shift binding hides it);
 *   `layout`         state: `none` or the tray's layout name;
 *   `count:<g>`      specimens in group g; `count:u` in the case; `count:tray` out;
 *   `kinds:<g>`      how many true groups are mixed in group g;
 *   `wrong`          an arrangement's specimens in a group not headed with
 *                    their true group (NaN, `—`, for other keys);
 *   `verdict`        state right / wrong: the `suspect` in the arrangement as it
 *                    stands (fix on: right);
 *   `belongs`        state: the suspect's true group;
 *   `where:<part>`   state: `u`, a group letter, or `off` (not on this tray).
 */
import type { Vec3 } from '../math';
import { partBounds } from '../parts';
import type { Primitive, PartRepeat } from '../../schema';
import type { SimControl, SimValue, SimValues } from '../../sim-schema';
import type { SortData, SortKey } from '../../sort-schema';

/** A group on the tray: one lowercase letter other than `u` (the case). */
export const SORT_GROUP = /^[a-tv-z]$/;
/** Where a specimen in the specimen case is. */
export const IN_CASE = 'u';
/** Where a specimen not on this tray is. */
export const OFF_TRAY = 'off';

/** The parts the model reads (homes: primitive `at` and rest bounds). */
export interface SortPart {
  id: string;
  primitive?: Primitive | undefined;
  repeat?: PartRepeat | undefined;
  extra?: readonly unknown[] | undefined;
}

type Grid = SortData['layouts'][string][string];

/** The centre of slot k of a group's grid (scene units). */
export function sortSlotCentre(g: Grid, k: number): Vec3 {
  const col = k % g.cols;
  const row = Math.floor(k / g.cols);
  return [g.at[0] + (col - (g.cols - 1) / 2) * g.pitch, g.at[1], g.at[2] + (row - (g.rows - 1) / 2) * g.pitch];
}

/** The controls a key reads to place the specimens (the suspect only picks who `verdict` describes). */
export function keyControls(key: SortKey): string[] {
  if ('ask' in key) return key.no ? [key.ask, key.no.ask] : [key.ask];
  if ('chain' in key) return [key.asked];
  return [key.fix];
}

const letter = (i: number) => String.fromCharCode(97 + i);

/** The tray the values pick (the first tray when the value is not one). */
function trayOf(s: SortData, values: SimValues): string {
  const v = values[s.tray];
  return typeof v === 'string' && s.trays[v] ? v : Object.keys(s.trays)[0] ?? '';
}

/** The specimens out on a tray, in case order. */
export function traySpecimens(s: SortData, tray: string): string[] {
  const t = s.trays[tray];
  if (!t) return [];
  if (t.specimens === '*') return Object.keys(s.specimens);
  const on = new Set(t.specimens);
  return Object.keys(s.specimens).filter((id) => on.has(id));
}

/** Whether a group is headed right for a specimen of this true group (the `none` group takes those no group is headed for). */
function rightGroup(key: Extract<SortKey, { arrangement: unknown }>, group: string): string | undefined {
  const entries = Object.entries(key.arrangement);
  return (entries.find(([, g]) => g.heading === group) ?? entries.find(([, g]) => g.heading === 'none'))?.[0];
}

/** Where one specimen goes under a key: `u` or a group letter. */
function placeOne(s: SortData, key: SortKey, values: SimValues, id: string): string {
  const traits = s.specimens[id]?.traits ?? {};
  const yes = (q: SimValue | undefined) => typeof q === 'string' && traits[q] === true;
  if ('ask' in key) {
    const q = values[key.ask];
    if (typeof q !== 'string' || q === 'none') return IN_CASE;
    if (yes(q)) return 'a';
    if (!key.no) return 'b';
    const q2 = values[key.no.ask];
    if (typeof q2 !== 'string' || q2 === 'none') return IN_CASE;
    return yes(q2) ? 'b' : 'c';
  }
  if ('chain' in key) {
    const raw = values[key.asked];
    const k = Math.max(0, Math.min(key.chain.length, typeof raw === 'number' ? Math.floor(raw) : 0));
    for (let i = 0; i < k; i++) if (traits[key.chain[i]!] === true) return letter(i);
    return k >= key.chain.length ? key.else : IN_CASE;
  }
  if (values[key.fix] === true) return rightGroup(key, s.specimens[id]?.group ?? '') ?? IN_CASE;
  return Object.entries(key.arrangement).find(([, g]) => g.members.includes(id))?.[0] ?? IN_CASE;
}

/** The tray, layout and where each specimen on it is (`u` or a group letter), in case order. */
export interface SortPlacement {
  tray: string;
  layout: string;
  where: Map<string, string>;
}

export function sortPlacement(s: SortData, values: SimValues): SortPlacement {
  const tray = trayOf(s, values);
  const t = s.trays[tray];
  const where = new Map<string, string>();
  const key = t?.key;
  const layout = key && t?.layout && s.layouts[t.layout] ? t.layout : 'none';
  for (const id of traySpecimens(s, tray)) where.set(id, key && layout !== 'none' ? placeOne(s, key, values, id) : IN_CASE);
  return { tray, layout, where };
}

const homeCache = new WeakMap<readonly SortPart[], Map<string, Vec3>>();

/** A specimen's home: its main primitive's x, z and its underside (rest bounds) y. */
function homes(parts: readonly SortPart[]): Map<string, Vec3> {
  let m = homeCache.get(parts);
  if (m) return m;
  m = new Map();
  for (const p of parts) {
    if (!p.primitive) continue;
    const b = partBounds({ primitive: p.primitive, repeat: p.repeat, extra: p.extra as never });
    m.set(p.id, [p.primitive.at[0], b ? b.min[1] : p.primitive.at[1], p.primitive.at[2]]);
  }
  homeCache.set(parts, m);
  return m;
}

/** Whether a specimen sits right in an arrangement group (headed with its true group, or `none` when no group is). */
function isRight(key: Extract<SortKey, { arrangement: unknown }>, group: string, at: string): boolean {
  return rightGroup(key, group) === at;
}

/** The tray (and its key) that names the suspect control. */
function suspectTray(s: SortData): { tray: string; key: Extract<SortKey, { arrangement: unknown }> & { suspect: string } } | null {
  for (const [tray, t] of Object.entries(s.trays)) if (t.key && 'arrangement' in t.key && t.key.suspect !== undefined) return { tray, key: t.key as Extract<SortKey, { arrangement: unknown }> & { suspect: string } };
  return null;
}

/** Every quantity of the sort model for these control values (`parts`: the specimens' homes; without them offsets are from the origin). */
export function solveSort(s: SortData, values: SimValues, parts: readonly SortPart[] = []): Record<string, number | string | Record<string, number>> {
  const place = sortPlacement(s, values);
  const t = s.trays[place.tray];
  const layout = place.layout === 'none' ? undefined : s.layouts[place.layout];
  const home = homes(parts);
  const q: Record<string, number | string | Record<string, number>> = { layout: place.layout };
  const slots: Record<string, number> = {};
  const filled = new Map<string, number>();
  const members = new Map<string, string[]>();
  for (const id of Object.keys(s.specimens)) {
    const at = place.where.get(id);
    q[`where:${id}`] = at ?? OFF_TRAY;
    if (at === undefined) {
      slots[`${id}:x`] = slots[`${id}:y`] = slots[`${id}:z`] = 0;
      slots[`${id}:shown`] = 0;
      continue;
    }
    members.set(at, [...(members.get(at) ?? []), id]);
    const grid = at === IN_CASE ? undefined : layout?.[at];
    let d: Vec3 = [0, 0, 0];
    if (grid) {
      const k = filled.get(at) ?? 0;
      filled.set(at, k + 1);
      const c = sortSlotCentre(grid, k);
      const h = home.get(id) ?? [0, 0, 0];
      d = [c[0] - h[0], c[1] - h[1], c[2] - h[2]];
    }
    slots[`${id}:x`] = d[0];
    slots[`${id}:y`] = d[1];
    slots[`${id}:z`] = d[2];
    slots[`${id}:shown`] = 1;
  }
  q.slots = slots;
  q['count:tray'] = place.where.size;
  q[`count:${IN_CASE}`] = members.get(IN_CASE)?.length ?? 0;
  for (const g of sortGroups(s)) {
    const ids = members.get(g) ?? [];
    q[`count:${g}`] = ids.length;
    q[`kinds:${g}`] = new Set(ids.map((id) => s.specimens[id]!.group)).size;
  }
  const key = t?.key;
  if (key && 'arrangement' in key) {
    let wrong = 0;
    for (const [id, at] of place.where) if (!isRight(key, s.specimens[id]!.group, at)) wrong++;
    q.wrong = wrong;
  } else q.wrong = NaN;
  const sus = suspectTray(s);
  if (sus) {
    const id = values[sus.key.suspect];
    const sp = typeof id === 'string' ? s.specimens[id] : undefined;
    if (sp && typeof id === 'string') {
      const at = placeOne(s, sus.key, values, id);
      q.verdict = isRight(sus.key, sp.group, at) ? 'right' : 'wrong';
      q.belongs = sp.group;
    }
  }
  return q;
}

/** Every group letter in any layout, in letter order. */
export function sortGroups(s: SortData): string[] {
  return [...new Set(Object.values(s.layouts).flatMap((l) => Object.keys(l)))].sort();
}

/** The kind of a sort quantity, or null when this data has none of that name. */
export function sortQuantity(s: SortData, from: string): 'number' | 'state' | 'vector' | null {
  if (from === 'slots') return 'vector';
  if (from === 'layout') return 'state';
  if (from === 'count:tray' || from === `count:${IN_CASE}`) return 'number';
  if (from === 'wrong') return Object.values(s.trays).some((t) => t.key && 'arrangement' in t.key) ? 'number' : null;
  if (from === 'verdict' || from === 'belongs') return suspectTray(s) ? 'state' : null;
  const [prefix, ref] = from.split(':') as [string, string | undefined];
  if (ref === undefined) return null;
  if (prefix === 'count' || prefix === 'kinds') return sortGroups(s).includes(ref) ? 'number' : null;
  if (prefix === 'where') return s.specimens[ref] ? 'state' : null;
  return null;
}

/** Every value of a control. */
function valuesOf(c: SimControl): SimValue[] {
  return c.kind === 'toggle' ? [false, true] : c.kind === 'step' ? c.values : c.options.map((o) => o.id);
}

/**
 * The states each state quantity can take over every tray and every value of
 * the controls its key reads (`layout`, `verdict`, `belongs`, `where:<part>`).
 */
export function sortReach(s: SortData, controls: readonly SimControl[]): Map<string, Set<string>> {
  const byId = new Map(controls.map((c) => [c.id, c]));
  const defaults = Object.fromEntries(controls.map((c) => [c.id, c.default])) as SimValues;
  const out = new Map<string, Set<string>>([['layout', new Set()]]);
  for (const id of Object.keys(s.specimens)) out.set(`where:${id}`, new Set());
  const add = (k: string, v: string) => out.get(k)?.add(v);
  for (const [tray, t] of Object.entries(s.trays)) {
    let combos: SimValues[] = [{ ...defaults, [s.tray]: tray }];
    for (const id of t.key ? keyControls(t.key) : []) {
      const c = byId.get(id);
      if (c) combos = combos.flatMap((v) => valuesOf(c).map((x) => ({ ...v, [id]: x })));
    }
    for (const v of combos) {
      const place = sortPlacement(s, v);
      add('layout', place.layout);
      for (const id of Object.keys(s.specimens)) add(`where:${id}`, place.where.get(id) ?? OFF_TRAY);
    }
  }
  const sus = suspectTray(s);
  if (sus) {
    const verdict = new Set<string>();
    const belongs = new Set<string>();
    const pick = byId.get(sus.key.suspect);
    for (const id of pick?.kind === 'choice' ? pick.options.map((o) => o.id) : []) {
      const sp = s.specimens[id];
      if (!sp) continue;
      belongs.add(sp.group);
      for (const fix of [false, true]) verdict.add(isRight(sus.key, sp.group, placeOne(s, sus.key, { ...defaults, [sus.key.fix]: fix }, id)) ? 'right' : 'wrong');
    }
    out.set('verdict', verdict);
    out.set('belongs', belongs);
  }
  return out;
}
