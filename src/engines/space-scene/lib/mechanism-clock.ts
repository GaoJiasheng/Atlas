/** A single orbit clock; controls and saved phase stay separate from URL state. */
export interface MechanismClock {
  thetaRad: number;
  qaHold: boolean;
  phaseDeg: number;
  mode: 'manual' | 'auto';
}

export interface MechanismClockSnapshot {
  thetaRad: number;
  qaHold: boolean;
}

const RAD_PER_DEG = Math.PI / 180;

export function createMechanismClock(phaseDeg: number, mode: MechanismClock['mode']): MechanismClock {
  return { thetaRad: phaseDeg * RAD_PER_DEG, qaHold: false, phaseDeg, mode };
}

/** A new beat always starts at its authored phase, even if controls match. */
export function syncMechanismClock(clock: MechanismClock, phaseDeg: number, mode: MechanismClock['mode'], reset = false): void {
  const phaseChanged = phaseDeg !== clock.phaseDeg;
  const modeChanged = mode !== clock.mode;
  if (reset || phaseChanged || (modeChanged && mode === 'manual')) clock.thetaRad = phaseDeg * RAD_PER_DEG;
  if (reset || phaseChanged || modeChanged) clock.qaHold = false;
  clock.phaseDeg = phaseDeg;
  clock.mode = mode;
}

/** QA only: fractional phases never enter the product's step control or URL. */
export function seekMechanismClock(clock: MechanismClock, degrees: number): boolean {
  if (!Number.isFinite(degrees) || degrees < 0 || degrees > 360) return false;
  clock.thetaRad = degrees * RAD_PER_DEG;
  clock.qaHold = true;
  return true;
}

/** `canRun` includes RUN, pause, visibility, protected views and reduced motion. */
export function advanceMechanismClock(clock: MechanismClock, deltaSec: number, cyclesPerMinute: number, canRun: boolean, maxDt = 0.25): void {
  if (!canRun || clock.qaHold || clock.mode !== 'auto') return;
  if (!Number.isFinite(deltaSec) || !Number.isFinite(cyclesPerMinute) || deltaSec <= 0 || cyclesPerMinute <= 0) return;
  clock.thetaRad += Math.min(deltaSec, maxDt) * (2 * Math.PI * cyclesPerMinute / 60);
}

/** Event-time snapshots allocate; the advancing frame path does not. */
export function saveMechanismClock(clock: MechanismClock): MechanismClockSnapshot {
  return { thetaRad: clock.thetaRad, qaHold: clock.qaHold };
}

export function restoreMechanismClock(clock: MechanismClock, saved: MechanismClockSnapshot): void {
  clock.thetaRad = saved.thetaRad;
  clock.qaHold = saved.qaHold;
}
