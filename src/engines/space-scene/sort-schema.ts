/**
 * The `sort` model's data (docs/38 §4.2 E-LT1, sim `kind: 'sort'`): the true
 * groups the specimens belong to, the yes / no questions (each one
 * observable feature), each specimen's group and features, the group layouts
 * on the sorting tray, and the trays (which specimens are out, the layout,
 * and the key that sorts them: one question, two, a chain asked one at a
 * time, or a classmate's arrangement). No placement is written in the data:
 * the model works out every group and slot (lib/sim/sort.ts).
 *
 * Build-time only (zod); the client imports the types.
 */
import { z } from 'zod';
import { bilingual, kebabId, vec3 } from '../../content/schema/common';
import type { Primitive, PartRepeat } from './schema';
import type { SimControl, SimOutput, SimValue, SimValues } from './sim-schema';
import { partBounds } from './lib/parts';
import { sortPlacement, sortReach, sortSlotCentre, keyControls, SORT_GROUP, type SortPart } from './lib/sim/sort';

/** A group on the tray: one lowercase letter (A–F, X …); `u` is the specimen case. */
const groupLetter = z.string().regex(SORT_GROUP, 'a tray group is one lowercase letter other than u (u is the specimen case)');

const grid = z
  .object({
    /** Grid centre: x, z on the tray; y = the pad's top (a specimen's underside sits there). */
    at: vec3,
    cols: z.number().int().min(1).max(12),
    rows: z.number().int().min(1).max(12),
    /** Slot spacing (scene units). */
    pitch: z.number().positive(),
    /** The pad part under the group (the flowchart card's leaf selects it). */
    pad: kebabId.optional(),
  })
  .strict();

const ask = z.object({ ask: kebabId, no: z.object({ ask: kebabId }).strict().optional() }).strict();
/** `elseHeading`: the true group the last leaf is named after (the flowchart card; without one it reads "Neither"). */
const chain = z.object({ chain: z.array(kebabId).min(1).max(8), else: groupLetter, asked: kebabId, elseHeading: kebabId.optional() }).strict();
const arrangement = z
  .object({
    /** Per group: its heading (a `groups` key: what the classmate called it) and who the classmate put there. */
    arrangement: z.record(groupLetter, z.object({ heading: kebabId, members: z.array(kebabId) }).strict()),
    /** A toggle: on = every specimen moved to the group headed with its true group. */
    fix: kebabId,
    /** A choice of specimens on this tray: the one `verdict` and `belongs` describe. */
    suspect: kebabId.optional(),
  })
  .strict();
export const sortKeySchema = z.union([ask, chain, arrangement]);
export type SortKey = z.output<typeof sortKeySchema>;

const tray = z
  .object({
    /** The specimens out on this tray (`*`: all of them, in the case). */
    specimens: z.union([z.literal('*'), z.array(kebabId).min(1)]),
    layout: kebabId.optional(),
    key: sortKeySchema.optional(),
  })
  .strict();

export const sortSchema = z
  .object({
    /** The choice control that picks the tray (its options = `trays`). */
    tray: kebabId.default('tray'),
    /** True groups: a label and the big group it is in (verdict, kinds, belongs, the flowchart's `else` leaf). */
    groups: z.record(kebabId, z.object({ label: bilingual, big: kebabId.optional() }).strict()),
    /** Yes / no questions, one observable feature each (the flowchart card's boxes and leaf names). */
    questions: z.record(kebabId, z.object({ label: bilingual }).strict()),
    /** Keyed by part id, in the order groups fill (the case order). */
    specimens: z.record(kebabId, z.object({ group: kebabId, traits: z.record(kebabId, z.boolean()).default({}) }).strict()),
    /** Named group layouts: group letter → its slot grid. */
    layouts: z.record(kebabId, z.record(groupLetter, grid)),
    trays: z.record(kebabId, tray),
  })
  .strict();
export type SortData = z.output<typeof sortSchema>;
export type SortTray = SortData['trays'][string];

export interface SortIssue {
  path: (string | number)[];
  message: string;
}

/** The parts the sort model's checks read. */
export type SortCheckPart = SortPart & { context?: boolean | undefined; primitive?: Primitive | undefined; repeat?: PartRepeat | undefined };

/** Every value of a control. */
function controlValues(c: SimControl): SimValue[] {
  return c.kind === 'toggle' ? [false, true] : c.kind === 'step' ? c.values : c.options.map((o) => o.id);
}

/** Every combination of these controls' values over `base`. */
function combos(controls: readonly SimControl[], base: SimValues): SimValues[] {
  let out: SimValues[] = [{ ...base }];
  for (const c of controls) out = out.flatMap((v) => controlValues(c).map((x) => ({ ...v, [c.id]: x })));
  return out;
}

const describe = (v: SimValues, ids: readonly string[]) => ids.map((id) => `${id} = ${String(v[id])}`).join(', ');

/**
 * The sort data against its controls, parts and outputs (docs/38 §4.2 rule 6):
 * trays = the tray control's options; specimens are non-context parts with a
 * primitive; every feature a key can ask is written for every specimen on
 * the tray; the key's controls are of the right kind; chain and else letters
 * are in the layout; no group overflows its grid for any setting; a
 * classmate's arrangement covers the tray once; pads are parts, slots lie on
 * their pad and groups do not overlap; and the state outputs label exactly
 * the states the model can give (`predictOnly`: labelled, never given).
 */
export function sortIssues(s: SortData, controls: ReadonlyMap<string, SimControl>, parts: readonly SortCheckPart[], outputs: readonly SimOutput[]): SortIssue[] {
  const out: SortIssue[] = [];
  const issue = (path: SortIssue['path'], message: string) => out.push({ path, message });
  const byId = new Map(parts.map((p) => [p.id, p]));
  const choice = (path: SortIssue['path'], id: string): Extract<SimControl, { kind: 'choice' }> | undefined => {
    const c = controls.get(id);
    if (!c) issue(path, `unknown control "${id}"`);
    else if (c.kind !== 'choice') issue(path, `"${id}" is a ${c.kind} control, not a choice`);
    return c?.kind === 'choice' ? c : undefined;
  };

  // Specimens and their groups.
  for (const [id, sp] of Object.entries(s.specimens)) {
    const p = byId.get(id);
    if (!p) issue(['specimens', id], `unknown part "${id}"`);
    else if (p.context) issue(['specimens', id], `"${id}" is a context part (never moved or selected)`);
    else if (!p.primitive) issue(['specimens', id], `"${id}" needs a primitive (its home is the primitive's place)`);
    if (!s.groups[sp.group]) issue(['specimens', id, 'group'], `unknown group "${sp.group}"`);
    for (const q of Object.keys(sp.traits)) if (!s.questions[q]) issue(['specimens', id, 'traits', q], `"${q}" is not a question`);
  }

  // Layouts: pads, slots on the pad, groups apart.
  for (const [name, layout] of Object.entries(s.layouts)) {
    if (name === 'none') issue(['layouts', name], '"none" is the layout with every specimen in the case');
    const boxes: { g: string; x0: number; x1: number; z0: number; z1: number }[] = [];
    for (const [g, grid] of Object.entries(layout)) {
      const half = grid.pitch / 2;
      const first = sortSlotCentre(grid, 0);
      const last = sortSlotCentre(grid, grid.cols * grid.rows - 1);
      const box = { g, x0: first[0] - half, x1: last[0] + half, z0: first[2] - half, z1: last[2] + half };
      boxes.push(box);
      if (grid.pad === undefined) continue;
      const pad = byId.get(grid.pad);
      if (!pad) {
        issue(['layouts', name, g, 'pad'], `unknown part "${grid.pad}"`);
        continue;
      }
      const b = pad.primitive ? partBounds({ primitive: pad.primitive, repeat: pad.repeat, extra: pad.extra as never }) : null;
      const eps = 1e-6;
      if (b && (first[0] < b.min[0] - eps || last[0] > b.max[0] + eps || first[2] < b.min[2] - eps || last[2] > b.max[2] + eps))
        issue(['layouts', name, g], `the slots of group ${g.toUpperCase()} run off its pad "${grid.pad}"`);
    }
    for (let i = 0; i < boxes.length; i++)
      for (let j = i + 1; j < boxes.length; j++) {
        const a = boxes[i]!;
        const b = boxes[j]!;
        if (a.x0 < b.x1 - 1e-9 && b.x0 < a.x1 - 1e-9 && a.z0 < b.z1 - 1e-9 && b.z0 < a.z1 - 1e-9) issue(['layouts', name], `groups ${a.g.toUpperCase()} and ${b.g.toUpperCase()} overlap`);
      }
  }

  // Trays: the tray control's options, the specimens out, the key.
  const trayControl = choice(['tray'], s.tray);
  if (trayControl) {
    for (const o of trayControl.options) if (!s.trays[o.id]) issue(['trays'], `option "${o.id}" of "${s.tray}" has no tray`);
    for (const id of Object.keys(s.trays)) if (!trayControl.options.some((o) => o.id === id)) issue(['trays', id], `"${id}" is not an option of "${s.tray}"`);
  }
  for (const [name, t] of Object.entries(s.trays)) {
    const at = ['trays', name];
    const ids = t.specimens === '*' ? Object.keys(s.specimens) : t.specimens;
    if (t.specimens !== '*') {
      if (new Set(ids).size !== ids.length) issue([...at, 'specimens'], 'a specimen is out twice');
      for (const id of ids) if (!s.specimens[id]) issue([...at, 'specimens'], `"${id}" is not a specimen`);
    }
    const layout = t.layout === undefined ? undefined : s.layouts[t.layout];
    if (t.layout !== undefined && !layout) issue([...at, 'layout'], `unknown layout "${t.layout}"`);
    if (t.specimens === '*' && (t.key || t.layout)) issue(at, 'the whole case ("*") stays in the case: no layout or key');
    if (!t.key) {
      if (t.layout !== undefined) issue([...at, 'key'], 'a tray with a layout needs a key that sorts it');
      continue;
    }
    if (t.layout === undefined) issue([...at, 'layout'], 'a tray with a key needs a layout');
    const letters = new Set(Object.keys(layout ?? {}));
    const needLetter = (path: SortIssue['path'], g: string, why: string) => {
      if (layout && !letters.has(g)) issue(path, `layout "${t.layout}" has no group ${g.toUpperCase()} (${why})`);
    };
    const key = t.key;
    const asked = new Set<string>();
    if ('ask' in key) {
      for (const [path, id] of [[['key', 'ask'], key.ask], ...(key.no ? [[['key', 'no', 'ask'], key.no.ask]] : [])] as [string[], string][]) {
        const c = choice([...at, ...path], id);
        for (const o of c?.options ?? []) {
          if (o.id === 'none') continue;
          if (!s.questions[o.id]) issue([...at, ...path], `option "${o.id}" of "${id}" is not a question (or none)`);
          else asked.add(o.id);
        }
      }
      needLetter([...at, 'key'], 'a', 'the yes group');
      needLetter([...at, 'key'], 'b', key.no ? 'yes to the second question' : 'the no group');
      if (key.no) needLetter([...at, 'key'], 'c', 'no to both');
    } else if ('chain' in key) {
      key.chain.forEach((q, i) => {
        if (!s.questions[q]) issue([...at, 'key', 'chain', i], `"${q}" is not a question`);
        else asked.add(q);
        needLetter([...at, 'key', 'chain', i], String.fromCharCode(97 + i), `question ${i + 1}`);
      });
      if (new Set(key.chain).size !== key.chain.length) issue([...at, 'key', 'chain'], 'a question is asked twice');
      needLetter([...at, 'key', 'else'], key.else, 'the else group');
      if (key.elseHeading !== undefined && !s.groups[key.elseHeading]) issue([...at, 'key', 'elseHeading'], `"${key.elseHeading}" is not a group`);
      if (key.chain.some((_, i) => String.fromCharCode(97 + i) === key.else)) issue([...at, 'key', 'else'], `${key.else.toUpperCase()} is also a question's group`);
      const c = controls.get(key.asked);
      if (!c) issue([...at, 'key', 'asked'], `unknown control "${key.asked}"`);
      else if (c.kind !== 'step' || c.values.some((v) => !Number.isInteger(v) || v < 0 || v > key.chain.length))
        issue([...at, 'key', 'asked'], `"${key.asked}" must be a step control of 0 … ${key.chain.length} (questions asked)`);
    } else {
      const seen = new Map<string, string>();
      for (const [g, grp] of Object.entries(key.arrangement)) {
        needLetter([...at, 'key', 'arrangement', g], g, 'the arrangement puts specimens there');
        if (!s.groups[grp.heading]) issue([...at, 'key', 'arrangement', g, 'heading'], `"${grp.heading}" is not a group`);
        for (const id of grp.members) {
          if (seen.has(id)) issue([...at, 'key', 'arrangement', g, 'members'], `"${id}" is also in group ${seen.get(id)!.toUpperCase()}`);
          seen.set(id, g);
          if (!ids.includes(id)) issue([...at, 'key', 'arrangement', g, 'members'], `"${id}" is not on this tray`);
        }
      }
      for (const id of ids) if (!seen.has(id)) issue([...at, 'key', 'arrangement'], `"${id}" is on the tray but in no group`);
      const headings = new Set(Object.values(key.arrangement).map((g) => g.heading));
      const homeless = ids.filter((id) => s.specimens[id] && !headings.has(s.specimens[id]!.group));
      if (homeless.length > 0 && !headings.has('none'))
        issue([...at, 'key', 'arrangement'], `${homeless.join(', ')} ha${homeless.length > 1 ? 've' : 's'} no group headed with ${homeless.length > 1 ? 'their' : 'its'} true group: give a group with heading "none"`);
      const fix = controls.get(key.fix);
      if (!fix) issue([...at, 'key', 'fix'], `unknown control "${key.fix}"`);
      else if (fix.kind !== 'toggle') issue([...at, 'key', 'fix'], `"${key.fix}" is a ${fix.kind} control, not a toggle`);
      if (key.suspect !== undefined) {
        const c = choice([...at, 'key', 'suspect'], key.suspect);
        for (const o of c?.options ?? []) if (!ids.includes(o.id)) issue([...at, 'key', 'suspect'], `option "${o.id}" of "${key.suspect}" is not on this tray`);
      }
    }
    // Every feature the key can ask, written for every specimen out.
    for (const id of ids) {
      const sp = s.specimens[id];
      if (!sp) continue;
      const missing = [...asked].filter((q) => sp.traits[q] === undefined);
      if (missing.length > 0) issue([...at, 'specimens'], `"${id}" has no answer to ${missing.map((q) => `"${q}"`).join(', ')} (the key asks it)`);
    }
    // Room: every group's count within its grid for every setting the key reads.
    if (layout) {
      const read = keyControls(key).map((id) => controls.get(id)).filter((c): c is SimControl => c !== undefined);
      const defaults = Object.fromEntries([...controls.values()].map((c) => [c.id, c.default])) as SimValues;
      for (const v of combos(read, { ...defaults, [s.tray]: name })) {
        const place = sortPlacement(s, v);
        const counts = new Map<string, number>();
        for (const g of place.where.values()) counts.set(g, (counts.get(g) ?? 0) + 1);
        for (const [g, n] of counts) {
          const grid = layout[g];
          if (grid && n > grid.cols * grid.rows) issue([...at, 'layout'], `group ${g.toUpperCase()} gets ${n} specimens but has ${grid.cols * grid.rows} slots (${describe(v, read.map((c) => c.id)) || 'always'})`);
        }
      }
    }
  }

  // State outputs: exactly the states the model gives (predictOnly: labelled for a prediction, never given).
  const reach = sortReach(s, [...controls.values()]);
  outputs.forEach((o, i) => {
    const from = o.from ?? o.id;
    const states = reach.get(from);
    if (o.kind !== 'state' || states === undefined) {
      if (o.predictOnly) issue(['outputs', i, 'predictOnly'], 'predictOnly belongs to a state output of the sort model');
      return;
    }
    const only = new Set(o.predictOnly ?? []);
    for (const st of only) {
      if (!o.states?.[st]) issue(['outputs', i, 'predictOnly'], `"${st}" needs a label in \`states\``);
      if (states.has(st)) issue(['outputs', i, 'predictOnly'], `"${from}" can be "${st}" in this model: it is not prediction-only`);
    }
    for (const st of states) if (!o.states?.[st]) issue(['outputs', i, 'states'], `"${from}" can be "${st}": give it a label`);
    for (const st of Object.keys(o.states ?? {})) if (!states.has(st) && !only.has(st)) issue(['outputs', i, 'states', st], `"${from}" is never "${st}" (${[...states].join(', ')})`);
  });
  return out;
}
