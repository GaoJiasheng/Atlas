/**
 * Energy bars (`overlays: energy-bars`, docs/31 E-EN6; pure, unit-tested):
 * the three bars beside a dropped ball, a swing or a wind-up toy read a
 * timeline's channels at the moment on show — potential, kinetic, and the
 * energy already turned into heat and sound (split by `lostSplit`). The
 * model makes the channels add up to 100 at every moment; the bars clamp
 * each at 0 and scale the three to 100 exactly, so the drawing never shows
 * energy made or lost.
 */
import type { SimOverlay } from '../../sim-schema';
import { channelValue, type Timeline } from './timeline';

type Bars = Extract<SimOverlay, { kind: 'energy-bars' }>;

export interface EnergyBarValues {
  potential: number;
  kinetic: number;
  /** Heat and sound together. */
  lost: number;
  heat: number;
  sound: number;
}

/** The bars at model time `t` (the end state when `t` is not given); null for a run that has none of the channels (nothing to show). */
export function energyBarValues(tl: Timeline | undefined | null, overlay: Pick<Bars, 'bars' | 'lostSplit'>, t?: number): EnergyBarValues | null {
  if (!tl || tl.duration <= 0) return null;
  const { potential, kinetic, lost } = overlay.bars;
  if (!tl.channels[potential] && !tl.channels[kinetic] && !tl.channels[lost]) return null;
  const at = t ?? tl.duration;
  const p = Math.max(0, channelValue(tl, potential, at));
  const k = Math.max(0, channelValue(tl, kinetic, at));
  const l = Math.max(0, channelValue(tl, lost, at));
  const sum = p + k + l;
  if (sum <= 0) return null;
  const f = 100 / sum;
  const split = overlay.lostSplit.heat + overlay.lostSplit.sound || 1;
  return { potential: p * f, kinetic: k * f, lost: l * f, heat: (l * f * overlay.lostSplit.heat) / split, sound: (l * f * overlay.lostSplit.sound) / split };
}
