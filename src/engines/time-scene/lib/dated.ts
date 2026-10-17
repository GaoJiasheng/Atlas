/**
 * Dated map features: a `from` / `to` pair on a feature's properties means it
 * exists while `from <= t < to` (`[from, to)`, either end open). Shared by the
 * regional plate's rivers (lib/rivers.ts) and the island-scale coast by date
 * (lib/localLand.ts), and by the validator's interval checks (schema.ts).
 * Pure; unit-tested in tests/time-scene/dated.test.ts.
 */
import { toNumber, type TimePoint } from './time';

/** A numeric `[from, to)` window: −∞ / +∞ where the end is open. */
export interface DatedWindow {
  from: number;
  to: number;
}

const bound = (t: TimePoint | undefined, open: number) => {
  if (t === undefined) return open;
  const n = toNumber(t);
  return Number.isFinite(n) ? n : open;
};

/** The numeric window of a `from` / `to` pair (a missing or malformed end is open). */
export function datedWindow(from: TimePoint | undefined, to: TimePoint | undefined): DatedWindow {
  return { from: bound(from, Number.NEGATIVE_INFINITY), to: bound(to, Number.POSITIVE_INFINITY) };
}

/** Whether `t` lies in the window (`from <= t < to`). */
export function isDatedAt(w: DatedWindow, t: number): boolean {
  return w.from <= t && t < w.to;
}

/** The items whose window holds `t`, in their order. */
export function datedAt<T extends DatedWindow>(items: readonly T[], t: number): T[] {
  return items.filter((w) => isDatedAt(w, t));
}

/** Whether a feature's properties carry a date (`from` or `to`). */
export function hasDate(p: { from?: unknown; to?: unknown } | null | undefined): boolean {
  return p?.from !== undefined || p?.to !== undefined;
}

/**
 * Problems of a sequence of windows that must tile time exactly once (the
 * eras of a dated coast): sorted by `from`, each must start where the
 * previous one ends; only the first may be open at the start and only the
 * last open at the end. Returns one message per problem, naming items by
 * their index in the input.
 */
export function eraSequenceIssues(windows: readonly DatedWindow[]): string[] {
  const issues: string[] = [];
  const order = windows.map((w, i) => ({ w, i })).sort((a, b) => a.w.from - b.w.from || a.w.to - b.w.to);
  order.forEach(({ w, i }, k) => {
    if (!(w.to > w.from)) issues.push(`#${i}: \`to\` must be after \`from\``);
    if (k > 0 && w.from === Number.NEGATIVE_INFINITY) issues.push(`#${i}: only the first era may leave out \`from\``);
    if (k < order.length - 1 && w.to === Number.POSITIVE_INFINITY) issues.push(`#${i}: only the last era may leave out \`to\``);
    const prev = order[k - 1];
    if (!prev) return;
    if (w.from < prev.w.to) issues.push(`#${i} overlaps #${prev.i} (it starts before #${prev.i} ends)`);
    else if (w.from > prev.w.to) issues.push(`gap between #${prev.i} and #${i} (no era in force in between)`);
  });
  return issues;
}
