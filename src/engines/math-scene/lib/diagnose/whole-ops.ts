/**
 * Diagnosis in the whole-number domain (docs/19 §2.1, §3.4): multiplication
 * and division. Every rule is a pure test of one wrong answer: a number (or a
 * quotient and remainder) the child wrote against the fact being worked out
 * (`op`), or the groups, the array, the jumps or the shared blocks the child
 * made against the task. As everywhere in the lesson, only the codes a task
 * declares are looked for, in the order it declares them; anything else is
 * `null` and gets the task's fallback. `unequal-groups`, `sharing-only` and
 * `divide-order` are diagnosed by `choose` options (and `unequal-groups` also
 * by the groups of a `group` task).
 */
import type { InputSpec, MisconceptionCode, Task, TaskOf } from '../../schema';
import { placeDigits } from '../value';

export type WholeOp = NonNullable<InputSpec['op']>;
/** A written whole number, or a quotient and remainder. */
export type WholeWritten = { n: number } | { q: number; r: number };

export interface WholeContext {
  /** The fact the number is about (`null`: only the right value is known). */
  op: WholeOp | null;
  /** The right value of the box. */
  answer: WholeWritten;
  /** The known part a split array starts from (rows or columns), when the stage shows one. */
  split?: { first: number; of: 'a' | 'b' } | null;
}

const valueOf = (w: WholeWritten): number => ('n' in w ? w.n : w.q);
const same = (x: WholeWritten, y: WholeWritten) => ('n' in x ? 'n' in y && x.n === y.n : 'q' in y && x.q === y.q && x.r === y.r);

/** The number an `op` asks for: the product, the quotient (and remainder), or the missing factor. */
export function opResult(op: WholeOp): WholeWritten {
  if (op.kind === '×') {
    if (op.missing === 'a') return { n: op.a };
    if (op.missing === 'b') return { n: op.b };
    return { n: op.a * op.b };
  }
  const q = Math.floor(op.a / op.b);
  const r = op.a % op.b;
  if (op.round) return { n: op.round === 'up' && r ? q + 1 : q };
  return r ? { q, r } : { n: q };
}

/** Partial products of `a × b`, place by place (`235 × 4` → 800, 120, 20). */
export function partialProducts(a: number, b: number): { value: number; place: number; digit: number }[] {
  const out: { value: number; place: number; digit: number }[] = [];
  placeDigits(a).forEach((da, i) =>
    placeDigits(b).forEach((db, j) => {
      if (da && db) out.push({ value: da * db * 10 ** (i + j), place: i + j, digit: da * 10 ** i });
    }),
  );
  return out;
}

/** `a × b` (one-digit b) worked place by place keeping only each place's ones digit: the carries never added (26 × 3 → 68). */
export function carryDropped(a: number, b: number): number {
  return placeDigits(a).reduce((sum, d, i) => sum + ((d * b) % 10) * 10 ** i, 0);
}

/** Each place's product written side by side, highest first (26 × 3 → "6" "18" → 618). */
export function placeProductsJoined(a: number, b: number): number {
  return Number(
    placeDigits(a)
      .reverse()
      .map((d) => String(d * b))
      .join(''),
  );
}

/** `a ÷ b` from the top place, each place's left-over dropped instead of traded: 72 ÷ 3 → 20 r 2. */
export function notTradedQuotient(a: number, b: number): { q: number; r: number } {
  const digits = placeDigits(a).reverse();
  const q = Number(digits.map((d) => String(Math.floor(d / b))).join(''));
  return { q, r: digits.at(-1)! % b };
}

/** The quotient with its zeros between other digits left out (103 → 13). */
export function zerosDropped(n: number): number {
  const s = String(n);
  return Number(s.replace(/0+(?=[1-9])/g, '').replace(/^$/, '0'));
}

/** Does a written number show the misconception? */
export function wholeShows(code: MisconceptionCode, c: WholeContext, x: WholeWritten): boolean {
  if (same(x, c.answer)) return false;
  const op = c.op;
  const right = valueOf(c.answer);
  const n = 'n' in x ? x.n : null;
  const times = op?.kind === '×' && (op.missing ?? 'c') === 'c';
  const divide = op?.kind === '÷' && (op.missing ?? 'c') === 'c';
  switch (code) {
    case 'added-not-multiplied':
      return !!op && times && n === op.a + op.b;
    case 'skip-count-slip': {
      if (n === null || n <= 0) return false;
      if (op && times) return [op.a, op.b].some((g) => n === right + g || n === right - g);
      // A missing factor or a quotient: one jump too many or too few.
      return !!op && (op.kind === '÷' || op.missing === 'a' || op.missing === 'b') && 'n' in c.answer && Math.abs(n - right) === 1;
    }
    case 'split-slip': {
      if (n === null || !op || !times) return false;
      const splits = c.split ? [c.split] : op.split ? [{ first: op.split, of: 'a' as const }] : [];
      const tries = splits.length ? splits : [5, 10, 2, op.a - 1, op.a + 1].filter((p) => p >= 1 && p !== op.a).map((first) => ({ first, of: 'a' as const }));
      return tries.some(({ first, of }) => {
        const [whole, other] = of === 'a' ? [op.a, op.b] : [op.b, op.a];
        const known = first * other;
        const rest = whole - first;
        if (rest === 0) return false;
        // The extra part added as its number of rows (or as 1), not as whole rows.
        return n === known + rest || n === known + Math.sign(rest);
      });
    }
    case 'operation-swapped': {
      if (n === null || !op) return false;
      if (divide) return n === op.a * op.b;
      if (op.kind === '×' && op.missing === 'a') return n === op.a * op.b * op.b;
      if (op.kind === '×' && op.missing === 'b') return n === op.a * op.b * op.a;
      if (times) return (op.a % op.b === 0 && n === op.a / op.b) || (op.b % op.a === 0 && n === op.b / op.a);
      return false;
    }
    case 'remainder-too-big':
      return !!op && divide && 'q' in x && x.r >= op.b && x.q * op.b + x.r === op.a;
    case 'remainder-dropped': {
      if (!op || !divide || op.round || op.a % op.b === 0) return false;
      const q = Math.floor(op.a / op.b);
      return ('q' in x && x.q === q && x.r === 0) || n === q;
    }
    case 'remainder-context': {
      if (!op || op.kind !== '÷' || !op.round || n === null || op.a % op.b === 0) return false;
      const q = Math.floor(op.a / op.b);
      return n === (op.round === 'up' ? q : q + 1);
    }
    case 'tens-as-ones': {
      if (n === null || right <= 0) return false;
      for (let k = 1; k <= 3; k++) if (right % 10 ** k === 0 && n === right / 10 ** k) return true;
      // Two-digit by two-digit: the tens of the second number multiplied as ones (23 × 14 → 23 × 4 + 23 × 1).
      return !!op && times && op.b >= 10 && op.b < 100 && n === op.a * (op.b % 10) + op.a * Math.floor(op.b / 10);
    }
    case 'extra-zero':
      return n !== null && right > 0 && n === right * 10;
    case 'carry-not-added':
      return !!op && times && op.b < 10 && n !== null && n === carryDropped(op.a, op.b);
    case 'digits-concatenated':
      return !!op && times && op.b < 10 && n !== null && n === placeProductsJoined(op.a, op.b);
    case 'partial-product-missed': {
      if (!op || !times || n === null) return false;
      const parts = partialProducts(op.a, op.b);
      if (parts.length < 2) return false;
      const product = op.a * op.b;
      if (parts.some((p) => n === product - p.value)) return true;
      // One place of a one-digit multiplication written down without multiplying (23 × 4 → 80 + 3).
      if (op.b < 10 && parts.some((p) => n === product - p.value + p.digit)) return true;
      // Two-digit by two-digit: only tens × tens and ones × ones (23 × 14 → 200 + 12).
      if (op.a >= 10 && op.a < 100 && op.b >= 10 && op.b < 100) return n === Math.floor(op.a / 10) * Math.floor(op.b / 10) * 100 + (op.a % 10) * (op.b % 10);
      return false;
    }
    case 'zero-in-quotient': {
      if (!op || !divide) return false;
      const q = Math.floor(op.a / op.b);
      const short = zerosDropped(q);
      if (short === q) return false;
      return n === short || ('q' in x && x.q === short && x.r === op.a % op.b);
    }
    case 'not-traded': {
      if (!op || !divide) return false;
      const w = notTradedQuotient(op.a, op.b);
      if (w.q === Math.floor(op.a / op.b) && w.r === op.a % op.b) return false;
      return ('q' in x && x.q === w.q && x.r === w.r) || (n === w.q && w.r === 0);
    }
    default:
      return false;
  }
}

/** The first declared code a written number shows. */
export function diagnoseWhole(codes: readonly MisconceptionCode[], c: WholeContext, x: WholeWritten): MisconceptionCode | null {
  return codes.find((code) => wholeShows(code, c, x)) ?? null;
}

/* ------------------------------------------------------------------ */
/* What the child made on the stage                                    */
/* ------------------------------------------------------------------ */

/** The groups a `group` task asks for: how many groups, how many in each, how many left. */
export function groupTarget(task: TaskOf<'group'>): { groups: number; each: number; left: number } {
  const q = Math.floor(task.total / task.k);
  const r = task.total % task.k;
  return task.by === 'share' ? { groups: task.k, each: q, left: r } : { groups: q, each: task.k, left: r };
}

/** Are the groups made the ones asked for? */
export function groupsRight(task: TaskOf<'group'>, groups: readonly number[]): boolean {
  const t = groupTarget(task);
  const loose = task.total - groups.reduce((s, g) => s + g, 0);
  return groups.length === t.groups && groups.every((g) => g === t.each) && loose === t.left;
}

/** Do the groups made show the misconception? */
export function groupShows(code: MisconceptionCode, task: TaskOf<'group'>, groups: readonly number[]): boolean {
  if (groupsRight(task, groups)) return false;
  const t = groupTarget(task);
  const loose = task.total - groups.reduce((s, g) => s + g, 0);
  const equal = groups.length > 0 && groups.every((g) => g === groups[0]);
  switch (code) {
    case 'groups-size-swapped':
      // As many groups as there should be in each, and the other way round.
      return t.groups !== t.each && groups.length === t.each && equal && groups[0] === t.groups;
    case 'unequal-groups':
      return groups.length >= 2 && !equal && loose < Math.max(1, task.k);
    case 'remainder-too-big':
      // Stopped with enough left for another round (share) or another full group (pack).
      return equal && groups.length > 0 && (task.by === 'pack' ? groups[0] === task.k && loose >= task.k : groups.length === task.k && loose >= task.k);
    default:
      return false;
  }
}

/** Does an array made `r × c` show the misconception? */
export function arrangedShows(code: MisconceptionCode, task: TaskOf<'arrange'>, r: number, c: number): boolean {
  if (code !== 'groups-size-swapped' || task.accept === 'product') return false;
  return task.rows !== task.cols && r === task.cols && c === task.rows;
}

/** The landings a `skip-count` task asks for: size, 2 × size … count × size. */
export const skipTarget = (task: TaskOf<'skip-count'>): number[] => Array.from({ length: task.count }, (_, i) => (i + 1) * task.size);

/** Do the landings show one jump too many or too few, counting 0 as a jump, or one jump off by one? */
export function landingsShow(code: MisconceptionCode, task: TaskOf<'skip-count'>, landings: readonly number[]): boolean {
  if (code !== 'skip-count-slip') return false;
  const want = skipTarget(task);
  if (landings.length === want.length && landings.every((v, i) => v === want[i])) return false;
  const multiples = (list: readonly number[], from: number) => list.every((v, i) => v === (i + from) * task.size);
  if (landings.length > 0 && Math.abs(landings.length - want.length) === 1 && multiples(landings, 1)) return true;
  if (landings[0] === 0 && landings.length === want.length && multiples(landings, 0)) return true;
  if (landings.length === want.length) {
    const off = landings.map((v, i) => v - want[i]!).filter((d) => d !== 0);
    return off.length === 1 && Math.abs(off[0]!) === 1;
  }
  return false;
}

/** The value context of a task's written part (its `op`, else the model's fact). */
export function wholeContextOf(task: Task, spec: InputSpec, answer: WholeWritten, split?: WholeContext['split']): WholeContext {
  if (spec.op) return { op: spec.op, answer, split };
  // A task on the stage carries its own fact: rows × columns split, a share of the blocks, the groups made.
  if (task.kind === 'split-array') return { op: { kind: '×', a: task.rows, b: task.cols }, answer, split };
  if (task.kind === 'share' && typeof task.value === 'number') return { op: { kind: '÷', a: task.value, b: task.k }, answer, split };
  if (task.kind === 'group') return { op: { kind: '÷', a: task.total, b: task.k }, answer, split };
  return { op: null, answer, split };
}
