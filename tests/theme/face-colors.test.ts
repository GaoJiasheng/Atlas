/**
 * The opposite-face tokens of the nets lesson (docs/39 D10, §3.7):
 * --face-1/2/3 read from tokens.css for both themes, each ≥ 3:1 against its
 * ground (paper, dark plate), and apart (CIE ΔE*ab ≥ 10) from each other and
 * from --signal, --cold and --hot with normal vision and under protanopia,
 * deuteranopia and tritanopia (Machado, Oliveira & Fernandes 2009, severity
 * 1, applied in linear RGB) — the marks ● ▲ ■ carry the pairs in grey too.
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { TOKEN_NAMES } from '../../src/theme/theme';

const css = readFileSync(join(import.meta.dirname, '../../src/theme/tokens.css'), 'utf8');

/** `--name: #hex` inside the block that starts at `selector`. */
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
const CVD: Record<string, number[][]> = {
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
const deltaE = (a: string, b: string, m: number[][] | null) => {
  const [p, q] = [lab(seen(a, m)), lab(seen(b, m))];
  return Math.hypot(p[0] - q[0], p[1] - q[1], p[2] - q[2]);
};

describe.each([
  ['paper', ':root[data-theme="paper"] {', '#e9e4d8'],
  ['cinema', ':root[data-theme="cinema"] {', '#1f2124'],
] as const)('face tokens on %s', (_theme, selector, ground) => {
  const t = tokens(selector);
  const faces = ['face-1', 'face-2', 'face-3'].map((k) => t[k]!);
  const others = ['signal', 'cold', 'hot'].map((k) => t[k]!);
  it('has all three, and the ground is the theme\'s paper', () => {
    expect(faces.every((c) => /^#[0-9a-f]{6}$/.test(c))).toBe(true);
    expect(others.every((c) => /^#[0-9a-f]{6}$/.test(c))).toBe(true);
    expect(t.paper).toBe(ground);
  });
  it('each is at least 3:1 against the ground', () => {
    for (const c of faces) expect(contrast(c, ground)).toBeGreaterThanOrEqual(3);
  });
  it.each([['normal vision', null], ...Object.entries(CVD)] as const)('apart from each other and from signal, cold and hot with %s (ΔE*ab ≥ 10)', (_name, m) => {
    for (let i = 0; i < faces.length; i++) {
      for (let j = i + 1; j < faces.length; j++) expect(deltaE(faces[i]!, faces[j]!, m as number[][] | null)).toBeGreaterThanOrEqual(10);
      for (const o of others) expect(deltaE(faces[i]!, o, m as number[][] | null)).toBeGreaterThanOrEqual(10);
    }
  });
});

it('the engine can read every face token', () => {
  for (const k of ['face-1', 'face-2', 'face-3']) expect(TOKEN_NAMES).toContain(k);
});
