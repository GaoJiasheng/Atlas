/**
 * Simulated STATE readings (`parts.json` `telemetry`, pure, unit-tested):
 * a first-order lag toward the `run` value while the scene runs and back to
 * `idle` when it stops, x(t) = target + (x0 − target) · e^(−t / lag).
 */
import type { TelemetryRow } from '../schema';

/** Value `dt` seconds after the target was set, starting from `from`. */
export function lagValue(from: number, target: number, dt: number, lag: number): number {
  if (dt <= 0) return from;
  return target + (from - target) * Math.exp(-dt / Math.max(lag, 1e-6));
}

/** Decimal places a number is written with (0.65 → 2, 3600 → 0). */
function places(n: number): number {
  const s = String(n);
  const i = s.indexOf('.');
  return i < 0 || /e/i.test(s) ? 0 : s.length - i - 1;
}

/** Decimals of a reading: its own `decimals`, else as many as `idle` / `run` are written with (≤ 3). */
export function readingDecimals(row: Pick<TelemetryRow, 'idle' | 'run' | 'decimals'>): number {
  return row.decimals ?? Math.min(3, Math.max(places(row.idle), places(row.run)));
}

/** Mono reading with thousands separators: `3,600`, `1.93`, `-0.5`. */
export function formatReading(value: number, decimals: number): string {
  const fixed = Math.abs(value) < 0.5 * 10 ** -decimals ? 0 : value;
  return fixed.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}
