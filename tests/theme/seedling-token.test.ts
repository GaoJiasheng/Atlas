/**
 * The germination tokens (docs/41 E-S1), read from tokens.css for both
 * themes: `--seedling` (a seedling in the light) and `--seedling-pale` (the
 * try-it tint of seedlings grown in the dark) are defined and L* ≥ 20 apart
 * (they read in grey too); the pale one is pale (L* ≥ 80), yellow rather
 * than white (chroma 20–40, hue 85–110°, CIE LCh) and apart from --bone
 * (ΔE*ab ≥ 12) and --food (≥ 20); the dark plate's are lifted above the
 * paper's.
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

const paper = tokens(':root[data-theme="paper"] {');
const cinema = tokens(':root[data-theme="cinema"] {');

describe.each([
  ['paper', paper],
  ['cinema', cinema],
] as const)('the seedling tokens on %s', (_theme, t) => {
  const pale = t['seedling-pale']!;
  const green = t['seedling']!;
  it('are defined', () => {
    expect(pale).toMatch(/^#[0-9a-f]{6}$/);
    expect(green).toMatch(/^#[0-9a-f]{6}$/);
  });
  it('green and pale read apart in grey', () => expect(lab(pale)[0] - lab(green)[0]).toBeGreaterThanOrEqual(20));
  it('is a pale yellow', () => {
    const [L, a, b] = lab(pale);
    const chroma = Math.hypot(a, b);
    const hue = ((Math.atan2(b, a) * 180) / Math.PI + 360) % 360;
    expect(L).toBeGreaterThanOrEqual(80);
    expect(chroma).toBeGreaterThanOrEqual(20);
    expect(chroma).toBeLessThanOrEqual(40);
    expect(hue).toBeGreaterThanOrEqual(85);
    expect(hue).toBeLessThanOrEqual(110);
  });
  it('reads apart from bone and food', () => {
    expect(deltaE(pale, t['bone']!)).toBeGreaterThanOrEqual(12);
    expect(deltaE(pale, t['food']!)).toBeGreaterThanOrEqual(20);
  });
});

describe('the seedling tokens', () => {
  it('are theme token names (data may write token:seedling, token:seedling-pale)', () => {
    expect(TOKEN_NAMES).toContain('seedling');
    expect(TOKEN_NAMES).toContain('seedling-pale');
  });
  it('are lifted on the dark plate', () => {
    for (const n of ['seedling', 'seedling-pale']) expect(lab(cinema[n]!)[0]).toBeGreaterThan(lab(paper[n]!)[0]);
  });
});
