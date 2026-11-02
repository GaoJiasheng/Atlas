/** Acoustic display clocks: phase is shared, pulse travel is a single round trip. */
export interface SoundMotion {
  phaseCycles: number;
  waveHold: boolean;
  elapsedVisual: number;
  echoHold: boolean;
}
export const createSoundMotion = (): SoundMotion => ({ phaseCycles: 0, waveHold: false, elapsedVisual: 0, echoHold: false });
export function resetSoundMotion(clock: SoundMotion, frame: { waveCycles?: number; echoProgress?: number } | null | undefined, duration: number): void {
  clock.phaseCycles = frame?.waveCycles ?? 0;
  clock.elapsedVisual = (frame?.echoProgress ?? 0) * duration;
  clock.waveHold = false;
  clock.echoHold = false;
}
export function echoDuration(physicalEchoMs: number | null, slowFactor = 10): number {
  return physicalEchoMs === null ? 0 : physicalEchoMs / 1000 * slowFactor;
}
export function echoPosition(elapsedVisual: number, duration: number, visualDistance: number, target = { u: 0, pathPosition: 0, atReturn: false }) {
  const u = duration > 0 ? Math.max(0, Math.min(1, elapsedVisual / duration)) : 0;
  target.u = u; target.pathPosition = visualDistance * (u <= .5 ? 2 * u : 2 * (1 - u)); target.atReturn = u === 1;
  return target;
}
export function echoVisualDistance(distanceM: number): number {
  if (distanceM === 17) return 1;
  if (distanceM === 34) return 1.4;
  if (distanceM === 68) return 2.2;
  throw new Error('sound echo: distance must be 17, 34 or 68 m');
}
export function seekSoundPhase(value: number): boolean { return Number.isFinite(value) && value >= 0 && value <= 1; }
/** Frequency/amplitude and propagation experiments reset only their own clock. */
export function syncSoundMotion(clock: SoundMotion, seen: { snapshot: number | null; wave: string; echo: string }, keys: { snapshot: number; wave: string; echo: string }, frame: { waveCycles?: number; echoProgress?: number } | null | undefined, duration: number): void {
  if (seen.snapshot !== keys.snapshot) resetSoundMotion(clock, frame, duration);
  else {
    if (seen.wave !== keys.wave) { clock.phaseCycles = 0; clock.waveHold = false; }
    if (seen.echo !== keys.echo) { clock.elapsedVisual = 0; clock.echoHold = false; }
  }
  Object.assign(seen, keys);
}
