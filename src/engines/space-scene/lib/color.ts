/**
 * Colour and material resolution for the 3D stage (pure, unit-tested).
 *
 * Part colours in data are a material family (`casing`, `steel`, `powder`,
 * `stainless`, `copper`, `rubber`, `plastic`, `glass`, `enamel`, `brass`;
 * `metal` / `matte` are aliases of `steel` / `plastic`), a theme token
 * (`token:accent-1`) or a hex literal. A family can take a `tint` (token or
 * hex) that replaces its colour and keeps the rest of its finish. Families carry a physically plausible finish (master-spec E):
 * colour, metalness, roughness and which procedural map gives them their
 * surface (brushed, axially brushed, orange peel, fine grain). Tokens and hex
 * colours are treated as a satin paint finish. Tokens resolve against the
 * current CSS token values (`readThemeTokens()`), so the stage follows theme
 * switches.
 */
import type { Theme } from '../../../theme/theme';
import { resolveColorRef } from '../../../theme/theme';
import { MATERIAL_PRESET_IDS, PRESET_ALIASES, type MaterialFamily, type MaterialPreset } from './presets';

export { MATERIAL_PRESET_IDS, type MaterialFamily, type MaterialPreset };

export interface Rgba {
  /** sRGB channels 0..1. */
  r: number;
  g: number;
  b: number;
  a: number;
}

const HEX_RE = /^#([0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/i;
const RGB_RE = /^rgba?\(\s*([\d.]+%?)\s*[, ]\s*([\d.]+%?)\s*[, ]\s*([\d.]+%?)\s*(?:[,/]\s*([\d.]+%?)\s*)?\)$/i;

function channel(raw: string, max: number): number {
  const n = raw.endsWith('%') ? (Number(raw.slice(0, -1)) / 100) * max : Number(raw);
  return Math.min(1, Math.max(0, n / max));
}

/** Parse `#rgb[a]`, `#rrggbb[aa]`, `rgb()/rgba()` and `transparent`. */
export function parseCssColor(input: string | null | undefined): Rgba | null {
  if (!input) return null;
  const s = input.trim().toLowerCase();
  if (s === 'transparent') return { r: 0, g: 0, b: 0, a: 0 };
  const hex = HEX_RE.exec(s);
  if (hex) {
    let h = hex[1]!;
    if (h.length <= 4) h = [...h].map((c) => c + c).join('');
    const n = (i: number) => parseInt(h.slice(i, i + 2), 16) / 255;
    return { r: n(0), g: n(2), b: n(4), a: h.length === 8 ? n(6) : 1 };
  }
  const rgb = RGB_RE.exec(s);
  if (rgb) {
    return {
      r: channel(rgb[1]!, 255),
      g: channel(rgb[2]!, 255),
      b: channel(rgb[3]!, 255),
      a: rgb[4] === undefined ? 1 : channel(rgb[4], 1),
    };
  }
  return null;
}

/** `#rrggbb` (alpha dropped) for an Rgba. */
export function rgbaToHex({ r, g, b }: Rgba): string {
  const h = (v: number) => Math.round(v * 255).toString(16).padStart(2, '0');
  return `#${h(r)}${h(g)}${h(b)}`;
}

/** Procedural surface map a finish uses (built once per stage, see stages/model3d/textures.ts). */
export type SurfaceFinish = 'brushed' | 'brushed-axial' | 'peel' | 'grain';

export interface MaterialLook {
  /** `#rrggbb` sRGB. */
  color: string;
  metalness: number;
  roughness: number;
  /** Base opacity before view effects (glass < 1). */
  opacity: number;
  finish: SurfaceFinish;
  /** Multiplier on the room environment reflections. */
  envIntensity: number;
}

interface FamilySpec {
  color: Record<Theme, string>;
  metalness: number;
  roughness: number;
  finish: SurfaceFinish;
  opacity?: number;
  envIntensity?: number;
}

/**
 * The material families (master-spec E). Theme changes the colour only where
 * a family would vanish into the ground (light plastic on the dark plate);
 * lighting does the rest (see Lighting.tsx).
 */
export const MATERIAL_FAMILIES: Record<MaterialFamily, FamilySpec> = {
  casing: { color: { paper: '#c3c4c0', cinema: '#b9bbb8' }, metalness: 0.8, roughness: 0.46, finish: 'brushed' },
  steel: { color: { paper: '#a3a7a8', cinema: '#9da1a3' }, metalness: 0.9, roughness: 0.3, finish: 'grain' },
  powder: { color: { paper: '#25292a', cinema: '#272a2c' }, metalness: 0.45, roughness: 0.62, finish: 'peel', envIntensity: 0.55 },
  stainless: { color: { paper: '#b7b9b6', cinema: '#aeb1ae' }, metalness: 0.88, roughness: 0.36, finish: 'brushed-axial' },
  copper: { color: { paper: '#b4703f', cinema: '#be7a4a' }, metalness: 0.92, roughness: 0.34, finish: 'grain' },
  rubber: { color: { paper: '#1e1f20', cinema: '#202123' }, metalness: 0, roughness: 0.78, finish: 'grain', envIntensity: 0.5 },
  plastic: { color: { paper: '#c9bc9f', cinema: '#8c836f' }, metalness: 0, roughness: 0.62, finish: 'grain' },
  glass: { color: { paper: '#cfe0de', cinema: '#b9d0cd' }, metalness: 0, roughness: 0.05, finish: 'grain', opacity: 0.22, envIntensity: 1.8 },
  // Baked appliance enamel: warm white a step darker than the paper (#e9e4d8) so a casing keeps its
  // silhouette on the sheet; low roughness under the fine grain map gives a soft, satin sheen.
  enamel: { color: { paper: '#dcd7cb', cinema: '#cfcabd' }, metalness: 0, roughness: 0.34, finish: 'grain', envIntensity: 0.85 },
  brass: { color: { paper: '#a88a4c', cinema: '#b39555' }, metalness: 0.9, roughness: 0.32, finish: 'grain' },
};

/** Base colour of every preset per theme (aliases included). */
export const PRESET_PALETTE: Record<Theme, Record<MaterialPreset, string>> = (['paper', 'cinema'] as const).reduce(
  (acc, theme) => {
    const row = {} as Record<MaterialPreset, string>;
    for (const id of MATERIAL_PRESET_IDS) row[id] = MATERIAL_FAMILIES[familyOf(id)].color[theme];
    acc[theme] = row;
    return acc;
  },
  {} as Record<Theme, Record<MaterialPreset, string>>,
);

export function isMaterialPreset(ref: string): ref is MaterialPreset {
  return (MATERIAL_PRESET_IDS as readonly string[]).includes(ref);
}

/** The family a preset id stands for (aliases resolved). */
export function familyOf(preset: MaterialPreset): MaterialFamily {
  return preset === 'metal' || preset === 'matte' ? PRESET_ALIASES[preset] : preset;
}

/**
 * Resolve any colour ref used in data to a concrete `#rrggbb`.
 * Unknown tokens / unparsable values fall back to `fallback`.
 */
export function resolveDataColor(
  ref: string,
  tokens: Partial<Record<string, string>>,
  theme: Theme,
  fallback = '#888888',
): string {
  if (isMaterialPreset(ref)) return PRESET_PALETTE[theme][ref];
  const parsed = parseCssColor(resolveColorRef(ref, tokens));
  return parsed ? rgbaToHex(parsed) : fallback;
}

/** Full surface look of a part for the current theme. */
export function resolveMaterialLook(
  ref: string,
  tokens: Partial<Record<string, string>>,
  theme: Theme,
  tint?: string,
): MaterialLook {
  if (isMaterialPreset(ref)) {
    const f = MATERIAL_FAMILIES[familyOf(ref)];
    return {
      color: tint ? resolveDataColor(tint, tokens, theme, f.color[theme]) : f.color[theme],
      metalness: f.metalness,
      roughness: f.roughness,
      opacity: f.opacity ?? 1,
      finish: f.finish,
      envIntensity: f.envIntensity ?? 1,
    };
  }
  // Token / hex colours: satin paint.
  return {
    color: resolveDataColor(ref, tokens, theme),
    metalness: 0.12,
    roughness: 0.45,
    opacity: 1,
    finish: 'grain',
    envIntensity: 1,
  };
}
