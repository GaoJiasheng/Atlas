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
