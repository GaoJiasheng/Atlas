import { readFileSync } from 'node:fs';
import { describe, it, expect } from 'vitest';
import { TOKEN_NAMES } from '../../src/theme/theme';
import {
  FORCE_COLORS,
  FORCE_NAMES,
} from '../../src/engines/space-scene/lib/sim/arrows';
const css = readFileSync(
  new URL('../../src/theme/tokens.css', import.meta.url),
  'utf8',
);
const lum = (h: string) => {
  const rgb = [1, 3, 5]
    .map((i) => parseInt(h.slice(i, i + 2), 16) / 255)
    .map((c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * rgb[0]! + 0.7152 * rgb[1]! + 0.0722 * rgb[2]!;
};
describe.each(['paper', 'cinema'])('airfoil force tokens %s', (theme) => {
  it.each(['lift', 'drag', 'thrust'] as const)(
    '%s defined, named and ≥3:1 against ground',
    (force) => {
      const at = css.indexOf(`:root[data-theme="${theme}"] {`),
        body = css.slice(at, css.indexOf('\n}', at)),
        tokens = Object.fromEntries(
          [...body.matchAll(/--([a-z0-9-]+):\s*(#[a-f0-9]{6})/gi)].map((m) => [
            m[1],
            m[2],
          ]),
        );
      const name = `f-${force}`;
      expect(TOKEN_NAMES).toContain(name);
      expect(FORCE_COLORS[force]).toBe(`token:${name}`);
      expect(FORCE_NAMES[force].zh).toBeTruthy();
      const a = lum(tokens[name]!),
        b = lum(tokens['bg'] ?? tokens['paper']!);
      expect(
        (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05),
      ).toBeGreaterThanOrEqual(3);
    },
  );
});
