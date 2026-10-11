/**
 * Drawing the check (docs/15 §10): each step's check is one task drawn from
 * its pool. The seed is made once per page load and never written anywhere
 * (not the URL, not storage), so a reload may draw another task; within a page
 * view every visit to a step draws again, avoiding the task shown last time.
 * Pure (the seed comes in).
 */

/** A 32-bit seed for this page view. */
export function pageSeed(): number {
  return Math.floor(Math.random() * 0x100000000) >>> 0;
}

/** mulberry32 step: a float in [0, 1) from the seed and a counter. */
function unit(seed: number, n: number): number {
  let t = (seed + Math.imul(n + 1, 0x6d2b79f5)) >>> 0;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}

/** Stable small hash of a step id. */
function hash(id: string): number {
  let h = 2166136261;
  for (let i = 0; i < id.length; i++) h = Math.imul(h ^ id.charCodeAt(i), 16777619);
  return h >>> 0;
}

/**
 * Pool index for draw number `draw` of step `step` (pool of `size`), never
 * `avoid` (the task shown before) when there is another one.
 */
export function drawIndex(seed: number, step: string, draw: number, size: number, avoid: number | null): number {
  if (size <= 1) return 0;
  const choices = avoid === null || avoid >= size ? size : size - 1;
  const k = Math.floor(unit(seed ^ hash(step), draw) * choices);
  return avoid !== null && avoid < size && k >= avoid ? k + 1 : k;
}
