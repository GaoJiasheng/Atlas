/**
 * The energy-chain card's Sankey layout (docs/31 E-EN2, §4.8): deterministic,
 * columns by the longest run of links (sinks last), band widths ∝ value with
 * one scale for the card and a minimum width, bands filling their nodes, and
 * nothing laid out for links that carry nothing.
 */
import { describe, expect, it } from 'vitest';
import { sankeyLayout, SANKEY_DEFAULTS } from '../../src/engines/space-scene/lib/sim/sankey';
import { currentChain } from '../../src/engines/space-scene/lib/sim/energy';
import { resolveSimValues } from '../../src/engines/space-scene/lib/sim/controls';
import { energySim } from './fixtures/energy-block';

const dynamo = () => {
  const f = currentChain(energySim.energy!, resolveSimValues(energySim, { chain: 'dynamo', speed: 15 }));
  return {
    nodes: f.chain!.nodes,
    links: f.chain!.links.map((l) => ({ id: l.id, from: l.from, to: l.to, value: f.links[l.id]! })),
  };
};

describe('sankeyLayout', () => {
  it('is deterministic', () => {
    const { nodes, links } = dynamo();
    expect(JSON.stringify(sankeyLayout(nodes, links))).toBe(JSON.stringify(sankeyLayout(nodes, links)));
  });
  it('columns follow the chain; the sink is last', () => {
    const { nodes, links } = dynamo();
    const lay = sankeyLayout(nodes, links);
    const c = Object.fromEntries(lay.nodes.map((n) => [n.id, n.column]));
    expect(c).toEqual({ rider: 0, dyn: 1, lamp: 2, air: 3 });
    expect(lay.columns).toBe(4);
    const x = lay.nodes.map((n) => n.x);
    expect([...x].sort((a, b) => a - b)).toEqual(x);
  });
  it('band width = value × k (one k for the card), at least the minimum; bands fill each node', () => {
    const { nodes, links } = dynamo();
    const lay = sankeyLayout(nodes, links);
    for (const b of lay.bands) expect(b.w).toBeCloseTo(Math.max(SANKEY_DEFAULTS.minBand, b.value * lay.k), 1);
    const dyn = lay.nodes.find((n) => n.id === 'dyn')!;
    const out = lay.bands.filter((b) => b.from === 'dyn').reduce((a, b) => a + b.w, 0);
    expect(out).toBeCloseTo(dyn.h, 1);
    expect(dyn.value).toBe(100);
    // The 3 % light band is drawn at the minimum width or more, never thinner.
    expect(lay.bands.find((b) => b.id === 'l-light')!.w).toBeGreaterThanOrEqual(SANKEY_DEFAULTS.minBand);
  });
  it('the tallest column fits the height', () => {
    const { nodes, links } = dynamo();
    const lay = sankeyLayout(nodes, links, { height: 100 });
    expect(lay.height).toBeLessThanOrEqual(100 + SANKEY_DEFAULTS.top + 0.01);
  });
  it('bands leave a node in the order of their targets and run from the right edge of one node to the left edge of the next', () => {
    const { nodes, links } = dynamo();
    const lay = sankeyLayout(nodes, links);
    const outs = lay.bands.filter((b) => b.from === 'dyn');
    const ys = outs.map((b) => b.y0);
    const targets = outs.map((b) => lay.nodes.find((n) => n.id === b.to)!.y);
    const byTarget = outs.map((_, i) => i).sort((a, b) => targets[a]! - targets[b]! || 0);
    expect(byTarget.map((i) => ys[i])).toEqual([...ys].sort((a, b) => a - b));
    for (const b of lay.bands) {
      const from = lay.nodes.find((n) => n.id === b.from)!;
      const to = lay.nodes.find((n) => n.id === b.to)!;
      expect(b.x0).toBeCloseTo(from.x + SANKEY_DEFAULTS.nodeWidth, 2);
      expect(b.x1).toBeCloseTo(to.x, 2);
      expect(b.d.startsWith(`M${b.x0} ${b.y0}C`)).toBe(true);
    }
  });
  it('links that carry nothing (and their nodes) are left out; nothing at all lays out nothing', () => {
    const lay = sankeyLayout(
      [{ id: 'a' }, { id: 'b' }, { id: 'c', sink: true }],
      [
        { id: 'ab', from: 'a', to: 'b', value: 50 },
        { id: 'bc', from: 'b', to: 'c', value: 0 },
      ],
    );
    expect(lay.nodes.map((n) => n.id)).toEqual(['a', 'b']);
    expect(lay.bands.map((b) => b.id)).toEqual(['ab']);
    expect(sankeyLayout([{ id: 'a' }], []).nodes).toEqual([]);
  });
});
