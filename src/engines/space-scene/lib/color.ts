/**
 * Colour resolution for the 3D stage (pure, unit-tested).
 *
 * Part colours in data are either a material preset (`metal`, `plastic`,
 * `copper`, `glass`, `rubber`, `matte`), a theme token (`token:accent-1`) or a
 * hex literal. Presets map to a small per-theme palette; tokens resolve against
 * the current CSS token values (`readThemeTokens()`), so the stage follows
 * theme switches. The theme also sets the surface finish: paper is matte,
 * cinema is metallic.
 */
import type { Theme } from '../../../theme/theme';
import { resolveColorRef } from '../../../theme/theme';
import { MATERIAL_PRESET_IDS, type MaterialPreset } from './presets';

export { MATERIAL_PRESET_IDS, type MaterialPreset };

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

/** Per-theme base colours of the material presets. */
export const PRESET_PALETTE: Record<Theme, Record<MaterialPreset, string>> = {
  paper: {
    metal: '#9b968c',
    plastic: '#d8c9a8',
    copper: '#b06a3b',
    glass: '#a8c9c6',
    rubber: '#4a4038',
    matte: '#b9a684',
  },
  cinema: {
    metal: '#9aa6b6',
    plastic: '#5d6774',
    copper: '#d4844c',
    glass: '#73bfe0',
    rubber: '#23272d',
    matte: '#4b535e',
  },
};

export interface MaterialLook {
  /** `#rrggbb` sRGB. */
  color: string;
  metalness: number;
  roughness: number;
  /** Base opacity before view effects (glass < 1). */
  opacity: number;
}

export function isMaterialPreset(ref: string): ref is MaterialPreset {
  return (MATERIAL_PRESET_IDS as readonly string[]).includes(ref);
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
): MaterialLook {
  const color = resolveDataColor(ref, tokens, theme);
  const cinema = theme === 'cinema';
  const look: MaterialLook = cinema
    ? { color, metalness: 0.6, roughness: 0.35, opacity: 1 }
    : { color, metalness: 0.05, roughness: 0.85, opacity: 1 };
  switch (ref) {
    case 'glass':
      return { ...look, metalness: 0, roughness: cinema ? 0.08 : 0.25, opacity: 0.45 };
    case 'rubber':
      return { ...look, metalness: 0, roughness: 0.95 };
    case 'copper':
      return cinema ? { ...look, metalness: 0.8, roughness: 0.3 } : look;
    default:
      return look;
  }
}
