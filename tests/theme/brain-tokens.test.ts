/**
 * The brain-region and chemical-signal tokens (docs/75 E-BN1), read from
 * tokens.css for both themes: the six region colours apart from each other
 * (CIE ΔE*ab ≥ 10) with normal vision and under protanopia, deuteranopia and
 * tritanopia (Machado, Oliveira & Fernandes 2009, severity 1, linear RGB),
 * each ≥ 15 from --en-electrical (signal dots run over the brain); the
 * chemical signal ≥ 20 from --en-electrical and ≥ 3:1 on its ground; the
 * dark plate lifts every one of them; the engine can read them.
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
const CVD: Record<string, number[][] | null> = {
  normal: null,
  protanopia: [[0.152286, 1.052583, -0.204868], [0.114503, 0.786281, 0.099216], [-0.003882, -0.048116, 1.051998]],
  deuteranopia: [[0.367322, 0.860646, -0.227968], [0.280085, 0.672501, 0.047413], [-0.01182, 0.04294, 0.968881]],
  tritanopia: [[1.255528, -0.076749, -0.178779], [-0.078411, 0.930809, 0.147602], [0.004733, 0.691367, 0.3039]],
};
function lab(rgbLinear: readonly number[]): [number, number, number] {
  const [r, g, b] = rgbLinear as [number, number, number];
  const f = (t: number) => (t > 216 / 24389 ? Math.cbrt(t) : ((24389 / 27) * t + 16) / 116);
  const x = f((0.4124 * r + 0.3576 * g + 0.1805 * b) / 0.95047);
  const y = f(0.2126 * r + 0.7152 * g + 0.0722 * b);
  const z = f((0.0193 * r + 0.1192 * g + 0.9505 * b) / 1.08883);
  return [116 * y - 16, 500 * (x - y), 200 * (y - z)];
}
const seen = (h: string, m: number[][] | null) => {
  const c = hex(h).map(lin);
  return m ? m.map((row) => Math.min(1, Math.max(0, row[0]! * c[0]! + row[1]! * c[1]! + row[2]! * c[2]!))) : c;
};
const deltaE = (a: string, b: string, m: number[][] | null = null) => {
  const [p, q] = [lab(seen(a, m)), lab(seen(b, m))];
  return Math.hypot(p[0] - q[0], p[1] - q[1], p[2] - q[2]);
};

const REGIONS = ['brain-frontal', 'brain-parietal', 'brain-temporal', 'brain-occipital', 'brain-cerebellum', 'brain-stem'];
const ALL = [...REGIONS, 'chemical-signal'];
const paper = tokens(':root[data-theme="paper"] {');
const cinema = tokens(':root[data-theme="cinema"] {');

describe.each([
  ['paper', paper],
  ['cinema', cinema],
] as const)('brain tokens on %s', (_theme, t) => {
  it('defines all seven', () => {
    for (const n of ALL) expect(t[n], n).toMatch(/^#[0-9a-f]{6}$/);
  });
  it('the six regions are apart under normal vision and three colour-vision deficiencies', () => {
    for (const [kind, m] of Object.entries(CVD))
      for (let i = 0; i < REGIONS.length; i++)
        for (let j = i + 1; j < REGIONS.length; j++)
          expect(deltaE(t[REGIONS[i]!]!, t[REGIONS[j]!]!, m), `${REGIONS[i]} / ${REGIONS[j]} (${kind})`).toBeGreaterThanOrEqual(10);
  });
  it('every region is apart from the electrical signal that runs over it', () => {
    for (const n of REGIONS) expect(deltaE(t[n]!, t['en-electrical']!), n).toBeGreaterThanOrEqual(15);
  });
  it('the chemical signal is apart from the electrical one and readable on the ground', () => {
    expect(deltaE(t['chemical-signal']!, t['en-electrical']!)).toBeGreaterThanOrEqual(20);
    expect(contrast(t['chemical-signal']!, t.paper!)).toBeGreaterThanOrEqual(3);
  });
});

it('the dark plate lifts every one of them', () => {
  for (const n of ALL) expect(lab(seen(cinema[n]!, null))[0], n).toBeGreaterThan(lab(seen(paper[n]!, null))[0]);
});

it('the engine can read every one of them', () => {
  for (const n of ALL) expect(TOKEN_NAMES).toContain(n);
});
