import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const css = readFileSync(new URL('../../src/theme/tokens.css', import.meta.url), 'utf8');
const leaders = readFileSync(new URL('../../src/engines/space-scene/space-scene.css', import.meta.url), 'utf8');
const declarations = (body: string) => Object.fromEntries([...body.matchAll(/--([\w-]+):\s*([^;]+);/g)].map(m => [m[1]!, m[2]!.trim()]));
const common = declarations(css.slice(css.indexOf(':root {'), css.indexOf('\n}', css.indexOf(':root {'))));
function tokens(theme: string) {
  const start = css.indexOf(`:root[data-theme="${theme}"] {`);
  const values = { ...common, ...declarations(css.slice(start, css.indexOf('\n}', start))) };
  const resolve = (name: string): string => {
    const value = values[name]!;
    const alias = /^var\(--([\w-]+)\)$/.exec(value);
    return alias ? resolve(alias[1]!) : value;
  };
  return resolve;
}
const luminance = (hex: string) => [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16) / 255)
  .map(v => v <= .04045 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4)
  .reduce((sum, v, i) => sum + v * [.2126, .7152, .0722][i]!, 0);

describe('small leader description contrast', () => {
  it('uses the dedicated theme token', () => {
    expect(leaders.match(/\.space-co__note\s*\{([^}]+)\}/)?.[1]).toContain('fill: var(--leader-note)');
  });
  it.each(['paper', 'cinema'])('meets AA on the %s sheet and darker/lighter paper surfaces', theme => {
    const token = tokens(theme);
    const text = luminance(token('leader-note'));
    for (const name of ['paper', 'panel-solid', 'surface-2', 'surface-sunken']) {
      const background = luminance(token(name));
      expect((Math.max(text, background) + .05) / (Math.min(text, background) + .05), `${theme}/${name}`).toBeGreaterThanOrEqual(4.5);
    }
  });
});
