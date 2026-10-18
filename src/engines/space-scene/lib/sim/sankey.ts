/**
 * Layout of the energy-chain card (docs/31 E-EN2; pure, deterministic,
 * unit-tested): a small Sankey diagram. Only links that carry energy now
 * (value > 0) and the nodes they join are laid out. Columns: a node's column
 * is the longest run of links from a first node to it; sinks go in the last
 * column. Each node is a bar as tall as max(in, out) × `k` (px per %), the
 * same `k` for the whole card, so band widths compare across nodes; nodes
 * of a column stack from the top with `gap` between them (room for the name
 * above each). Bands leave a node in the order of their targets' heights and
 * reach a node in the order of their sources', each `value × k` wide (at
 * least `minBand`), drawn as a cubic curve between the two nodes.
 */

export interface SankeyNodeIn {
  id: string;
  sink?: boolean;
}

export interface SankeyLinkIn {
  id: string;
  from: string;
  to: string;
  value: number;
}

export interface SankeyNode {
  id: string;
  column: number;
  x: number;
  y: number;
  /** Bar height (px). */
  h: number;
  /** max(in, out), %. */
  value: number;
}

export interface SankeyBand {
  id: string;
  from: string;
  to: string;
  value: number;
  /** Band width (px). */
  w: number;
  /** Centre of the band where it leaves its source and reaches its target. */
  x0: number;
  y0: number;
  x1: number;
  y1: number;
  /** SVG path of the band's centre line (stroke it `w` wide). */
  d: string;
}

export interface SankeyLayout {
  nodes: SankeyNode[];
  bands: SankeyBand[];
  columns: number;
  /** Px per %. */
  k: number;
  height: number;
}

export interface SankeyOptions {
  width: number;
  /** Height the tallest column's bars and gaps fill (px). */
  height: number;
  /** Space above the first node of a column (its name). */
  top: number;
  nodeWidth: number;
  gap: number;
  minBand: number;
  /** Horizontal margins (px) left of the first column and right of the last. */
  left: number;
  right: number;
}

export const SANKEY_DEFAULTS: SankeyOptions = { width: 330, height: 120, top: 16, nodeWidth: 6, gap: 22, minBand: 1.5, left: 6, right: 6 };

const r2 = (n: number) => Math.round(n * 100) / 100;

export function sankeyLayout(nodesIn: readonly SankeyNodeIn[], linksIn: readonly SankeyLinkIn[], opt: Partial<SankeyOptions> = {}): SankeyLayout {
  const o = { ...SANKEY_DEFAULTS, ...opt };
  const links = linksIn.filter((l) => l.value > 0);
  const used = new Set(links.flatMap((l) => [l.from, l.to]));
  const nodes = nodesIn.filter((n) => used.has(n.id));
  if (nodes.length === 0) return { nodes: [], bands: [], columns: 0, k: 0, height: 0 };
  // Columns: longest path from a first node (nodes are written in chain order; iterate to a fixed point).
  const col = new Map(nodes.map((n) => [n.id, 0]));
  for (let pass = 0; pass < nodes.length; pass++) {
    let moved = false;
    for (const l of links) {
      const c = (col.get(l.from) ?? 0) + 1;
      if (c > (col.get(l.to) ?? 0)) {
        col.set(l.to, c);
        moved = true;
      }
    }
    if (!moved) break;
  }
  const last = Math.max(...nodes.map((n) => col.get(n.id)!));
  for (const n of nodes) if (n.sink) col.set(n.id, Math.max(last, 1));
  const columns = Math.max(...nodes.map((n) => col.get(n.id)!)) + 1;
  const inOf = (id: string) => links.filter((l) => l.to === id).reduce((a, l) => a + l.value, 0);
  const outOf = (id: string) => links.filter((l) => l.from === id).reduce((a, l) => a + l.value, 0);
  const value = new Map(nodes.map((n) => [n.id, Math.max(inOf(n.id), outOf(n.id))]));
  const byCol = Array.from({ length: columns }, (_, c) => nodes.filter((n) => col.get(n.id) === c));
  const k = Math.min(...byCol.filter((c) => c.length > 0).map((c) => (o.height - (c.length - 1) * o.gap) / c.reduce((a, n) => a + value.get(n.id)!, 0)));
  const span = columns > 1 ? (o.width - o.left - o.right - o.nodeWidth) / (columns - 1) : 0;
  const placed = new Map<string, SankeyNode>();
  let bottom = 0;
  byCol.forEach((list, c) => {
    let y = o.top;
    for (const n of list) {
      const h = Math.max(o.minBand, value.get(n.id)! * k);
      placed.set(n.id, { id: n.id, column: c, x: r2(o.left + c * span), y: r2(y), h: r2(h), value: value.get(n.id)! });
      y += h + o.gap;
    }
    bottom = Math.max(bottom, y - o.gap);
  });
  const mid = (id: string) => placed.get(id)!.y + placed.get(id)!.h / 2;
  const order = new Map(links.map((l, i) => [l.id, i]));
  const outStack = new Map<string, number>();
  const inStack = new Map<string, number>();
  const offsets = new Map<string, { a: number; b: number }>();
  // Leaving: in the order of the targets' heights; reaching: in the order of the sources'.
  for (const n of nodes) {
    const outs = links.filter((l) => l.from === n.id).sort((p, q) => mid(p.to) - mid(q.to) || order.get(p.id)! - order.get(q.id)!);
    for (const l of outs) {
      const w = Math.max(o.minBand, l.value * k);
      const at = outStack.get(n.id) ?? 0;
      outStack.set(n.id, at + w);
      offsets.set(l.id, { a: at + w / 2, b: 0 });
    }
    const ins = links.filter((l) => l.to === n.id).sort((p, q) => mid(p.from) - mid(q.from) || order.get(p.id)! - order.get(q.id)!);
    for (const l of ins) {
      const w = Math.max(o.minBand, l.value * k);
      const at = inStack.get(n.id) ?? 0;
      inStack.set(n.id, at + w);
      const known = offsets.get(l.id);
      if (known) known.b = at + w / 2;
      else offsets.set(l.id, { a: 0, b: at + w / 2 });
    }
  }
  const bands: SankeyBand[] = links.map((l) => {
    const a = placed.get(l.from)!;
    const b = placed.get(l.to)!;
    const off = offsets.get(l.id)!;
    const w = Math.max(o.minBand, l.value * k);
    const x0 = a.x + o.nodeWidth;
    const x1 = b.x;
    const y0 = a.y + off.a;
    const y1 = b.y + off.b;
    const xm = (x0 + x1) / 2;
    return {
      id: l.id,
      from: l.from,
      to: l.to,
      value: l.value,
      w: r2(w),
      x0: r2(x0),
      y0: r2(y0),
      x1: r2(x1),
      y1: r2(y1),
      d: `M${r2(x0)} ${r2(y0)}C${r2(xm)} ${r2(y0)} ${r2(xm)} ${r2(y1)} ${r2(x1)} ${r2(y1)}`,
    };
  });
  return { nodes: nodes.map((n) => placed.get(n.id)!), bands, columns, k, height: r2(bottom) };
}
