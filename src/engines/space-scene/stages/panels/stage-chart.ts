/**
 * What a stage chart draws, as plain data: the try-it curve of a heat model
 * and the computed solar year of the orbit lab both become one spec, so the
 * panel on the stage has a single renderer (StageChart.tsx).
 */
import { tx, type BilingualText } from '../../../../i18n';
import type { Locale } from '../../../core/types';
import type { SimData, SimValues } from '../../sim-schema';
import { curveCursor, curveModel, curveSummary, type CurveSpec } from '../../lib/sim/curve';
import { outputText } from '../../lib/sim/text';

export interface StageChartSeries {
  id: string;
  label: string;
  points: readonly (readonly [number, number])[];
  /** The series at the cursor. */
  now: number;
}
export interface StageChartSpec {
  id: 'heat-curve' | 'solar-year';
  xDomain: readonly [number, number];
  yDomain: readonly [number, number];
  xTicks: readonly { x: number; label: string }[];
  yTicks: readonly number[];
  yUnit: string;
  xTitle: string;
  series: readonly StageChartSeries[];
  cursor: number;
  /** The reading at the cursor. */
  current: string;
  /** A qualification the reader has to see beside the plot. */
  note?: string;
  /** The whole chart in words (the image's accessible name). */
  summary: string;
}

const round = (n: number) => Math.round(n * 100) / 100;

/** The curve the try-it card draws, read-only; null where the model has none. */
export function heatChart(sim: SimData, values: SimValues, curve: CurveSpec, locale: Locale, xTitle: string): StageChartSpec | null {
  const model = curveModel(sim, values, curve);
  const cursor = curveCursor(sim, values, curve);
  if (!model || !cursor) return null;
  return {
    id: 'heat-curve',
    xDomain: model.domain,
    yDomain: model.yDomain,
    xTicks: model.ticks.map((x) => ({ x, label: String(round(x)) })),
    yTicks: model.yTicks,
    yUnit: '°C',
    xTitle,
    series: model.series.map((s) => ({
      id: s.output.id,
      label: tx(s.output.label, locale),
      points: s.points.map((p) => [p.x, p.y] as const),
      now: cursor.values[s.output.id]!,
    })),
    cursor: cursor.x,
    current: `${cursor.x} s · ${model.series.map((s) => `${tx(s.output.label, locale)} ${outputText(s.output, cursor.values[s.output.id], locale)} °C`).join(' · ')}`,
    summary: curveSummary(model, locale),
  };
}

export interface SolarDay {
  date: string;
  daylight_minutes: number;
}
const DAYLIGHT: BilingualText = { en: 'Daylight', zh: '日长' };
const DATE: BilingualText = { en: 'Month of 2026', zh: '2026 年月份' };
const EXPANDED: BilingualText = { en: 'Vertical range expanded · calculated estimate', zh: '纵轴放大区间 · 计算估计' };
const MONTHS: readonly BilingualText[] = [
  { en: 'Jan', zh: '1月' },
  { en: 'Apr', zh: '4月' },
  { en: 'Jul', zh: '7月' },
  { en: 'Oct', zh: '10月' },
];
const STEP_MINUTES = 5;

/** The computed solar year (day of the year against minutes of daylight), its cursor on `dayIndex` (1-based). */
export function daylightChart(days: readonly SolarDay[], dayIndex: number, locale: Locale): StageChartSpec | null {
  const today = days[dayIndex - 1];
  if (!today) return null;
  const minutes = days.map((d) => d.daylight_minutes);
  const low = Math.floor(Math.min(...minutes) / STEP_MINUTES) * STEP_MINUTES;
  const high = Math.max(low + STEP_MINUTES, Math.ceil(Math.max(...minutes) / STEP_MINUTES) * STEP_MINUTES);
  const label = tx(DAYLIGHT, locale);
  const h = Math.floor(today.daylight_minutes / 60);
  const m = Math.round(today.daylight_minutes - h * 60);
  const longest = Math.max(...minutes);
  const shortest = Math.min(...minutes);
  return {
    id: 'solar-year',
    xDomain: [1, days.length],
    yDomain: [low, high],
    xTicks: MONTHS.map((month, i) => ({ x: days.findIndex((d) => d.date.slice(5, 7) === String(i * 3 + 1).padStart(2, '0')) + 1, label: tx(month, locale) })),
    yTicks: Array.from({ length: (high - low) / STEP_MINUTES + 1 }, (_, i) => low + i * STEP_MINUTES),
    yUnit: 'min',
    xTitle: tx(DATE, locale),
    series: [{ id: 'daylight', label, points: minutes.map((y, i) => [i + 1, y] as const), now: today.daylight_minutes }],
    cursor: dayIndex,
    current: locale === 'zh' ? `${today.date} · ${label} ${h} 小时 ${m} 分` : `${today.date} · ${label} ${h} h ${m} min`,
    note: tx(EXPANDED, locale),
    summary:
      locale === 'zh'
        ? `全年计算日长，最短 ${shortest} 分钟，最长 ${longest} 分钟；纵轴放大至 ${low} 至 ${high} 分钟。`
        : `Computed daylight through the year, from ${shortest} to ${longest} minutes; the vertical range is expanded to ${low} to ${high} minutes.`,
  };
}
