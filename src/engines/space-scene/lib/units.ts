/**
 * Real-world units of a model (pure, unit-tested): `parts.json`
 * `units: { modelUnit, scale }` says one scene unit is `scale` `modelUnit`
 * (a grasshopper drawn 40× life size: `{ "modelUnit": "mm", "scale": 25 }`).
 * Without it lengths read in scene units ("U"). The ARCHITECTURE panel's
 * scale bar and span readout use it; nothing else in the engine changes
 * (camera, explode, flows stay in scene units).
 */
import { scaleStep } from './schematic';

export type LengthUnit = 'mm' | 'cm' | 'm';

export interface ModelUnits {
  modelUnit: LengthUnit;
  scale: number;
}

const MM: Record<LengthUnit, number> = { mm: 1, cm: 10, m: 1000 };

/** Millimetres in one scene unit (`null` without units). */
export function mmPerUnit(units: ModelUnits | undefined): number | null {
  return units ? units.scale * MM[units.modelUnit] : null;
}

const trim = (n: number) => {
  const s = n.toFixed(n >= 100 ? 0 : n >= 10 ? 1 : 2);
  return s.includes('.') ? s.replace(/\.?0+$/, '') : s;
};

/** A real length in millimetres as text in the model's unit family: `8 MM`, `2.5 CM`, `1.2 M` (mm up to 100 mm, cm up to 1 m). */
export function formatLength(mm: number, unit: LengthUnit): string {
  if (unit === 'm' || mm >= 1000) return `${trim(mm / 1000)} M`;
  if (unit === 'cm' || mm >= 100) return `${trim(mm / 10)} CM`;
  return `${trim(mm)} MM`;
}

export interface ScaleBar {
  /** Bar length in scene units. */
  step: number;
  label: string;
}

/** Scale bar for a drawing `span` scene units wide: a 1 / 2 / 5 × 10ⁿ step in real units (or scene units without `units`). */
export function scaleBar(span: number, units: ModelUnits | undefined): ScaleBar {
  const mm = mmPerUnit(units);
  if (mm === null) {
    const step = scaleStep(span);
    return { step, label: `${step} U` };
  }
  const real = scaleStep(span * mm);
  return { step: real / mm, label: formatLength(real, units!.modelUnit) };
}

/** A span in scene units as real-length text (`null` without units). */
export function realLength(span: number, units: ModelUnits | undefined): string | null {
  const mm = mmPerUnit(units);
  return mm === null ? null : formatLength(span * mm, units!.modelUnit);
}

/** Pixels a group scale bar aims for; the bar takes the round length (1 / 2 / 5 × 10ⁿ) just under it. */
export const GROUP_BAR_PX = 100;

/**
 * A group's on-screen scale bar (`groups[].scale`): `pxPerUnit` stage pixels
 * per scene unit at the group's depth; the group is drawn `magnification` ×
 * life size in a model of `units` (default 1 scene unit = 1 m). Returns the
 * bar's length in pixels and its label (`2 MM`, `5 MM · ×20`), or null when
 * nothing is measurable.
 */
export function groupScaleBar(pxPerUnit: number, units: ModelUnits | undefined, scale: { unit: LengthUnit; magnification: number }): { px: number; label: string } | null {
  if (!(pxPerUnit > 0)) return null;
  const mmPerPx = (mmPerUnit(units) ?? 1000) / scale.magnification / pxPerUnit;
  const target = GROUP_BAR_PX * mmPerPx;
  const p = 10 ** Math.floor(Math.log10(target));
  const m = target / p;
  const step = (m >= 5 ? 5 : m >= 2 ? 2 : 1) * p;
  const label = formatLength(step, scale.unit);
  return { px: step / mmPerPx, label: scale.magnification !== 1 ? `${label} · ×${trim(scale.magnification)}` : label };
}
