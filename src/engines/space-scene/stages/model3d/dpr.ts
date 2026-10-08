/** Stage pixel ratio: never above 2, never more than a 4K-wide buffer (master-spec M). */
export function stageDpr(): number {
  return Math.max(1, Math.min(window.devicePixelRatio || 1, 3840 / Math.max(1, window.innerWidth), 2));
}
