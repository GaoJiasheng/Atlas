/**
 * Muscle attachment markers (docs/16 §6.3; pure, unit-tested): which of
 * parts.json's `sites` show — those of the selected part and of the parts the
 * chapter / beat lists in `sites` — and the keys the stage writes their
 * projected points under (`<site index>:<point index>`, the centroid
 * `<site index>:c`).
 */

export interface SiteLike {
  muscle: string;
  kind: 'origin' | 'insertion';
  bone: string;
  points: readonly (readonly number[])[];
}

/** Indices of the sites on show. */
export function activeSites(sites: readonly SiteLike[] | undefined, selected: string | null, listed: readonly string[]): number[] {
  if (!sites?.length) return [];
  const want = new Set(listed);
  if (selected) want.add(selected);
  const out: number[] = [];
  sites.forEach((s, i) => {
    if (want.has(s.muscle)) out.push(i);
  });
  return out;
}

export const siteKey = (site: number, point: number | 'c'): string => `${site}:${point}`;

/** Centroid of a site's points. */
export function siteCentroid(points: readonly (readonly number[])[]): [number, number, number] {
  const c: [number, number, number] = [0, 0, 0];
  for (const p of points) for (let i = 0; i < 3; i++) c[i] = c[i]! + (p[i] ?? 0) / points.length;
  return c;
}

/** Origin → insertion pairs among the sites on show (one dashed line of pull per muscle). */
export function pullLines(sites: readonly SiteLike[], active: readonly number[]): { muscle: string; origin: number; insertion: number }[] {
  const out: { muscle: string; origin: number; insertion: number }[] = [];
  for (const o of active) {
    if (sites[o]!.kind !== 'origin') continue;
    const ins = active.find((i) => sites[i]!.kind === 'insertion' && sites[i]!.muscle === sites[o]!.muscle);
    if (ins !== undefined) out.push({ muscle: sites[o]!.muscle, origin: o, insertion: ins });
  }
  return out;
}
