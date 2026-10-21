/**
 * The breathing-and-blood tokens (docs/40 §4.5 E-HL4), read from tokens.css
 * for both themes: all five defined; the two bloods both red (hue ≤ 20°
 * apart, CIE LCh), apart in lightness (L* ≥ 20: they read in grey too) and
 * apart from the three muscle layers (ΔE*ab ≥ 15: particles over the heart
 * and vessels); oxygen apart from --xray; carbon dioxide apart from --air and
 * --neutral; air ≥ 3:1 on the ground; the dark plate lifted above the paper.
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
const luminance = (h: string) => {
  const [r, g, b] = hex(h).map(lin) as [number, number, number];
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const contrast = (a: string, b: string) => {
  const [x, y] = [luminance(a), luminance(b)];
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
};
function lab(h: string): [number, number, number] {
  const [r, g, b] = hex(h).map(lin) as [number, number, number];
  const f = (t: number) => (t > 216 / 24389 ? Math.cbrt(t) : ((24389 / 27) * t + 16) / 116);
  const x = f((0.4124 * r + 0.3576 * g + 0.1805 * b) / 0.95047);
  const y = f(0.2126 * r + 0.7152 * g + 0.0722 * b);
  const z = f((0.0193 * r + 0.1192 * g + 0.9505 * b) / 1.08883);
  return [116 * y - 16, 500 * (x - y), 200 * (y - z)];
}
const deltaE = (a: string, b: string) => Math.hypot(...lab(a).map((v, i) => v - lab(b)[i]!));
const hue = (h: string) => {
  const [, a, b] = lab(h);
  return ((Math.atan2(b, a) * 180) / Math.PI + 360) % 360;
};
const NAMES = ['blood-rich', 'blood-poor', 'oxygen', 'carbon-dioxide', 'air'];

const paper = tokens(':root[data-theme="paper"] {');
const cinema = tokens(':root[data-theme="cinema"] {');

describe.each([
  ['paper', paper],
  ['cinema', cinema],
] as const)('blood and gas tokens on %s', (_theme, t) => {
  it('defines all five', () => {
    for (const n of NAMES) expect(t[n], n).toMatch(/^#[0-9a-f]{6}$/);
  });
  it('two reds, one light and one dark', () => {
    const [rich, poor] = [t['blood-rich']!, t['blood-poor']!];
    const d = Math.abs(hue(rich) - hue(poor));
    expect(Math.min(d, 360 - d)).toBeLessThanOrEqual(20);
    for (const h of [hue(rich), hue(poor)]) expect(h < 45 || h > 345).toBe(true);
    expect(lab(rich)[0] - lab(poor)[0]).toBeGreaterThanOrEqual(20);
  });
  it('both bloods apart from the muscle layers', () => {
    for (const m of ['muscle-1', 'muscle-2', 'muscle-3'])
      for (const b of ['blood-rich', 'blood-poor']) expect(deltaE(t[b]!, t[m]!), `${b} / ${m}`).toBeGreaterThanOrEqual(15);
  });
  it('oxygen apart from X-ray; carbon dioxide apart from air and neutral', () => {
    expect(deltaE(t.oxygen!, t.xray!)).toBeGreaterThanOrEqual(15);
    expect(deltaE(t['carbon-dioxide']!, t.air!)).toBeGreaterThanOrEqual(15);
    expect(deltaE(t['carbon-dioxide']!, t.neutral!)).toBeGreaterThanOrEqual(15);
  });
  it('air at least 3:1 on the ground', () => {
    expect(contrast(t.air!, t.paper!)).toBeGreaterThanOrEqual(3);
  });
});

it('the dark plate lifts every one of them', () => {
  for (const n of NAMES) expect(lab(cinema[n]!)[0], n).toBeGreaterThan(lab(paper[n]!)[0]);
});

it('the engine can read every one of them', () => {
  for (const n of NAMES) expect(TOKEN_NAMES).toContain(n);
});
