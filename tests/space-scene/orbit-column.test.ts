import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const engine = readFileSync(new URL('../../src/engines/space-scene/space-scene.css', import.meta.url), 'utf8');
const host = readFileSync(new URL('../../src/styles/scene.css', import.meta.url), 'utf8');
const rule = (css: string, selector: string) => {
  const start = css.indexOf(`${selector} {`);
  expect(start, selector).toBeGreaterThanOrEqual(0);
  return css.slice(start, css.indexOf('}', start));
};

describe('data-enabled orbit HUD column scroll contract', () => {
  it('keeps a scroll viewport in the grid row above the chapter-axis dock', () => {
    expect(rule(engine, '.atlas-hud__right:has(.space-orbit)')).toContain('overflow-y: auto');
    // The empty part of the column must not swallow stage drags.
    expect(rule(engine, '.atlas-hud__right:has(.space-orbit)')).not.toContain('pointer-events');
    expect(rule(host, '.atlas-hud__right')).toContain('min-height: 0');
    const grid = rule(host, '.atlas-hud');
    expect(grid).toContain('grid-template-rows: minmax(0, 1fr) auto');
    expect(grid).toContain('"left . right"');
    expect(grid).toContain('"dock dock dock"');
  });
  it('lets expanded diagrams and the full Tools/Key contents contribute to scroll height', () => {
    const children = rule(engine, '.atlas-hud__right:has(.space-orbit) > :is(.atlas-card, .atlas-stage__overlay)');
    expect(children).toContain('flex: none');
    expect(children).toContain('max-height: none');
    expect(children).toContain('overflow: visible');
    expect(rule(engine, '.atlas-hud__right:has(.space-orbit) .atlas-stage__overlay > *')).toContain('flex: none');
  });
  it('gives 44 px control targets on short, narrow and touch stages only', () => {
    expect(engine).toContain('@media (max-width: 1280px), (max-height: 800px), (pointer: coarse) {\n  .atlas-hud__right:has(.space-orbit) :is(.atlas-ctl__row, .atlas-card__toggle)');
    const controls = rule(engine, '.atlas-hud__right:has(.space-orbit) :is(.atlas-ctl__row, .atlas-card__toggle)');
    expect(controls).toContain('min-height: var(--hit)');
    expect(controls).toContain('min-width: var(--hit)');
    expect(readFileSync(new URL('../../src/theme/tokens.css', import.meta.url), 'utf8')).toContain('--hit: 44px');
  });
});
