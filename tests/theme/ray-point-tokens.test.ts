/**
 * The optical study's object-point tokens (docs/58 F1), read from tokens.css
 * for both themes: `--ray-top` and `--ray-bottom` are defined, read apart
 * from each other (ΔE*ab ≥ 40) and from the selection colour `--signal`
 * (≥ 15), keep ≥ 3:1 contrast on the plate ground, and are registered for
 * the WebGL stage (TOKEN_NAMES).
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { TOKEN_NAMES } from '../../src/theme/theme';

const css = readFileSync(join(import.meta.dirname, '../../src/theme/tokens.css'), 'utf8');

function tokens(selector: string): Record<string, string> {
  const at = css.indexOf(selector);
  const body = css.slice(at, css.indexOf('\n}', at));
  return Object.fromEntries([...body.matchAll(/--([a-z0-9-]+):\s*(#[0-9a-f]{6})/gi)].map((m) => [m[1]!, m[2]!.toLowerCase()]));
}
const hex = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16) / 255) as [number, number, number];
const lin = (c: number) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
function lab(h: string): [number, number, number] {
  const [r, g, b] = hex(h).map(lin) as [number, number, number];
  const f = (t: number) => (t > 216 / 24389 ? Math.cbrt(t) : ((24389 / 27) * t + 16) / 116);
  const x = f((0.4124 * r + 0.3576 * g + 0.1805 * b) / 0.95047);
  const y = f(0.2126 * r + 0.7152 * g + 0.0722 * b);
  const z = f((0.0193 * r + 0.1192 * g + 0.9505 * b) / 1.08883);
  return [116 * y - 16, 500 * (x - y), 200 * (y - z)];
}
const deltaE = (a: string, b: string) => Math.hypot(...lab(a).map((v, i) => v - lab(b)[i]!));
const luminance = (h: string) => { const [r, g, b] = hex(h).map(lin) as [number, number, number]; return 0.2126 * r + 0.7152 * g + 0.0722 * b; };
const contrast = (a: string, b: string) => { const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x) as [number, number]; return (hi + 0.05) / (lo + 0.05); };

describe.each([
  ['paper', tokens(':root[data-theme="paper"] {')],
  ['cinema', tokens(':root[data-theme="cinema"] {')],
] as const)('the object-point ray tokens on %s', (_theme, t) => {
  const top = t['ray-top']!, bottom = t['ray-bottom']!;
  it('are defined', () => {
    expect(top).toMatch(/^#[0-9a-f]{6}$/);
    expect(bottom).toMatch(/^#[0-9a-f]{6}$/);
  });
  it('read apart from each other and from the selection colour', () => {
    expect(deltaE(top, bottom)).toBeGreaterThanOrEqual(40);
    expect(deltaE(top, t['signal']!)).toBeGreaterThanOrEqual(15);
    expect(deltaE(bottom, t['signal']!)).toBeGreaterThanOrEqual(15);
  });
  it('stand out on the plate ground', () => {
    expect(contrast(top, t['paper']!)).toBeGreaterThanOrEqual(3);
    expect(contrast(bottom, t['paper']!)).toBeGreaterThanOrEqual(3);
  });
});

it('the WebGL stage reads both object-point tokens', () => {
  expect(TOKEN_NAMES).toContain('ray-top');
  expect(TOKEN_NAMES).toContain('ray-bottom');
});
