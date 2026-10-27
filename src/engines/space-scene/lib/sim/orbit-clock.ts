/** Injectable monotonic delta clock. Hidden intervals reset the baseline, never catch up. */
export function validOrbitTime(t: unknown, max = 31557600): t is number {
  return typeof t === 'number' && Number.isFinite(t) && t >= 0 && t <= max;
}
export interface OrbitClockState {
  seedSeconds: number;
  elapsedSeconds: number;
  running: boolean;
}
export function orbitClock(seedSeconds = 0): OrbitClockState {
  return { seedSeconds, elapsedSeconds: seedSeconds, running: false };
}
export function stepOrbitClock(clock: OrbitClockState, delta: number, rate: number, max: number, hidden = false): boolean {
  if (!clock.running || hidden || rate === 0 || !Number.isFinite(delta)) return false;
  const prev = clock.elapsedSeconds;
  clock.elapsedSeconds = Math.min(max, prev + Math.max(0, Math.min(0.05, delta)) * rate);
  if (clock.elapsedSeconds === max) clock.running = false;
  return prev !== clock.elapsedSeconds;
}
export function seekOrbitClock(clock: OrbitClockState, t: number, max: number): boolean {
  if (!validOrbitTime(t, max)) return false;
  clock.elapsedSeconds = t;
  clock.running = false;
  return true;
}
export function decodeOrbitTime(s: string | null, max = 31557600): number | null {
  if (s === null || !/^\d+(?:\.\d{1,6})?$/.test(s)) return null;
  const t = Number(s);
  return validOrbitTime(t, max) ? t : null;
}
