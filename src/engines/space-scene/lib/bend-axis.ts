/** The parts of the strip bend (bend.ts) every stage reads: the bent primitive's vertex mark, its slices, the bend axis. */

/** The vertex attribute marking the vertices of the bent primitive (1; the part's `extra` pieces 0). */
export const BEND_ATTRIBUTE = 'atlasBend';
/** Slices the bent primitive is cut into along its axis (the stage builds it so). */
export const BEND_SLICES = 64;

/** The index of a ±X / ±Z unit axis (0 or 2) and its sign; null for any other. */
export function bendAxisIndex(axis: readonly number[]): { index: 0 | 2; sign: 1 | -1 } | null {
  const [x = 0, y = 0, z = 0] = axis;
  if (Math.abs(y) > 1e-9) return null;
  if (Math.abs(Math.abs(x) - 1) < 1e-9 && Math.abs(z) < 1e-9) return { index: 0, sign: x > 0 ? 1 : -1 };
  if (Math.abs(Math.abs(z) - 1) < 1e-9 && Math.abs(x) < 1e-9) return { index: 2, sign: z > 0 ? 1 : -1 };
  return null;
}
