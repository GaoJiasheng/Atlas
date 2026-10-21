/**
 * Net geometry (docs/39 §3.2, lib/net.ts) against the research
 * (art/research/nets-and-solids/hex_check.py, box_nets.py): of the 35 free
 * hexominoes 11 fold into a cube and 24 do not (8 with a 2 × 2 block, 4 more
 * with 5 or more in a row, 12 more only because two faces land on one); the
 * 11 named CUBE_NETS are those 11; a cuboid's 384 edge unfoldings never
 * overlap flat and are 11 different nets for 1 × 1 × 1, 29 for 1 × 1 × 2 and
 * 54 for 2 × 3 × 4; the regular tetrahedron has 2. Every net that closes puts
 * each piece exactly on its face when folded; opposite faces, the layers of
 * a staggered fold and a rectangle the wrong size.
 */
import { describe, expect, it } from 'vitest';
import type { SolidSpec } from '../../src/engines/math-scene/schema';
import { buildNet, canonicalCells, CUBE_NET_NAMES, CUBE_NETS, cubeNetName, flatOverlap, foldedPolys, foldResult, layerFolds, type P2 } from '../../src/engines/math-scene/lib/net';
import { norm, solid, sub } from '../../src/engines/math-scene/lib/solid';

const CUBE: SolidSpec = { type: 'cuboid', size: [1, 1, 1] };
const cubeNet = (cells: P2[]) => buildNet({ solid: CUBE, layout: { cells }, stagger: true, view: 'auto', turn: 0 });

/** All free polyominoes of n cells (as in hex_check.py). */
function polyominoes(n: number): P2[][] {
  let level = new Map<string, P2[]>([[canonicalCells([[0, 0]]), [[0, 0]]]]);
  for (let k = 1; k < n; k++) {
    const next = new Map<string, P2[]>();
    for (const cells of level.values()) {
      const have = new Set(cells.map((c) => c.join(',')));
      for (const [x, y] of cells)
        for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]] as const) {
          const c: P2 = [x + dx, y + dy];
          if (have.has(c.join(','))) continue;
          const grown = [...cells, c];
          const mx = Math.min(...grown.map((p) => p[0]));
          const my = Math.min(...grown.map((p) => p[1]));
          const moved = grown.map(([a, b]) => [a - mx, b - my] as P2);
          next.set(canonicalCells(moved), moved);
        }
    }
    level = next;
  }
  return [...level.values()];
}
const has2x2 = (cells: P2[]) => {
  const s = new Set(cells.map((c) => c.join(',')));
  return cells.some(([x, y]) => [`${x + 1},${y}`, `${x},${y + 1}`, `${x + 1},${y + 1}`].every((k) => s.has(k)));
};
const longestRun = (cells: P2[]) => {
  const s = new Set(cells.map((c) => c.join(',')));
  let m = 0;
  for (const [x, y] of cells)
    for (const [dx, dy] of [[1, 0], [0, 1]] as const) {
      let L = 0;
      while (s.has(`${x + dx * L},${y + dy * L}`)) L++;
      m = Math.max(m, L);
    }
  return m;
};

describe('hexominoes and the cube', () => {
  const hexes = polyominoes(6);
  const nets = hexes.filter((h) => foldResult(cubeNet(h)).closes);
  const non = hexes.filter((h) => !foldResult(cubeNet(h)).closes);

  it('there are 35 hexominoes, 11 fold into a cube, 24 do not', () => {
    expect(hexes).toHaveLength(35);
    expect(nets).toHaveLength(11);
    expect(non).toHaveLength(24);
  });

  it('the 24 that do not: 8 with a 2 × 2 block, 4 more with 5 in a row, 12 only because faces overlap', () => {
    const block = non.filter(has2x2);
    const row = non.filter((h) => !has2x2(h) && longestRun(h) >= 5);
    const rest = non.filter((h) => !has2x2(h) && longestRun(h) < 5);
    expect([block.length, row.length, rest.length]).toEqual([8, 4, 12]);
    for (const h of non) {
      const r = foldResult(cubeNet(h));
      expect(r.overlaps.length, canonicalCells(h)).toBeGreaterThan(0);
      expect(r.missing.length).toBeGreaterThan(0);
    }
  });

  it('the 11 named nets are different, all fold, and are exactly the 11 hexominoes that do', () => {
    const named = CUBE_NET_NAMES.map((n) => canonicalCells(CUBE_NETS[n]));
    expect(new Set(named).size).toBe(11);
    expect(new Set(named)).toEqual(new Set(nets.map(canonicalCells)));
    for (const n of CUBE_NET_NAMES) {
      expect(foldResult(cubeNet(CUBE_NETS[n])).closes, n).toBe(true);
      expect(cubeNetName(CUBE_NETS[n])).toBe(n);
    }
  });

  it('a net that closes puts every square exactly on a face of the cube (< 1e-9)', () => {
    for (const n of CUBE_NET_NAMES) {
      const net = cubeNet(CUBE_NETS[n]);
      const polys = foldedPolys(net, net.nodes.map(() => 1));
      for (const pts of polys) expect(net.target.some((f) => pts.every((v) => f.pts.some((w) => norm(sub(v, w)) < 1e-9)))).toBe(true);
    }
  });

  it('two squares that land on one face have the same corners (< 1e-9)', () => {
    const net = cubeNet([[0, 0], [1, 0], [0, 1], [1, 1], [2, 1], [3, 1]]);
    const r = foldResult(net);
    const polys = foldedPolys(net, net.nodes.map(() => 1));
    const [i, j] = r.overlaps[0]!;
    for (const v of polys[i]!) expect(polys[j]!.some((w) => norm(sub(v, w)) < 1e-9)).toBe(true);
    expect(r.missing).toHaveLength(1);
  });

  it('opposite faces match the cube rolled square by square', () => {
    const pairs = (name: (typeof CUBE_NET_NAMES)[number]) => {
      const net = cubeNet(CUBE_NETS[name]);
      const r = foldResult(net);
      return net.nodes.map((nd, i) => `${nd.key}-${net.nodes[r.opposite(i)!]!.key}`).sort();
    };
    // docs/39 §3.2: 141-e pairs (0,1)–(2,1), (1,1)–(3,1), (1,0)–(1,2).
    expect(pairs('141-e')).toEqual(['0,1-2,1', '1,0-1,2', '1,1-3,1', '1,2-1,0', '2,1-0,1', '3,1-1,1'].sort());
    // In a row of 4, squares one apart are opposite in every 1-4-1 net.
    for (const n of ['141-a', '141-b', '141-c', '141-d', '141-f'] as const) {
      const net = cubeNet(CUBE_NETS[n]);
      const r = foldResult(net);
      const at = (k: string) => net.nodes.findIndex((x) => x.key === k);
      expect(r.opposite(at('0,1'))).toBe(at('2,1'));
      expect(r.opposite(at('1,1'))).toBe(at('3,1'));
    }
  });
});

/** Every spanning tree of a polyhedron's faces (edge unfoldings), as layout trees rooted at the first face. */
function unfoldings(s: SolidSpec): [string, string | null][][] {
  const p = solid(s)!;
  const ids = p.faces.map((f) => f.id);
  const edges: [number, number][] = [];
  for (let i = 0; i < ids.length; i++) for (let j = i + 1; j < ids.length; j++) if (p.adjacency.get(ids[i]!)!.some((a) => a.face === ids[j])) edges.push([i, j]);
  const out: [string, string | null][][] = [];
  const choose = (from: number, picked: [number, number][]) => {
    if (picked.length === ids.length - 1) {
      const parent = ids.map((_, i) => i);
      const find = (x: number): number => (parent[x] === x ? x : (parent[x] = find(parent[x]!)));
      for (const [a, b] of picked) {
        const [ra, rb] = [find(a), find(b)];
        if (ra === rb) return;
        parent[ra] = rb;
      }
      const tree: [string, string | null][] = [[ids[0]!, null]];
      const seen = new Set([0]);
      const queue = [0];
      while (queue.length) {
        const i = queue.shift()!;
        for (const [a, b] of picked) {
          const j = a === i ? b : b === i ? a : -1;
          if (j < 0 || seen.has(j)) continue;
          seen.add(j);
          queue.push(j);
          tree.push([ids[j]!, ids[i]!]);
        }
      }
      out.push(tree);
      return;
    }
    for (let k = from; k < edges.length; k++) choose(k + 1, [...picked, edges[k]!]);
  };
  choose(0, []);
  return out;
}

/** A grid net of rectangles written the same whichever way it is turned or flipped (box_nets.py canon). */
function rectCanon(rects: number[][]): string {
  const forms: string[] = [];
  for (const fx of [1, -1])
    for (const fy of [1, -1])
      for (const sw of [false, true]) {
        const r = rects.map(([x0, y0, x1, y1]) => {
          const xs = [fx * x0!, fx * x1!].sort((a, b) => a - b);
          const ys = [fy * y0!, fy * y1!].sort((a, b) => a - b);
          return sw ? [ys[0]!, xs[0]!, ys[1]!, xs[1]!] : [xs[0]!, ys[0]!, xs[1]!, ys[1]!];
        });
        const mx = Math.min(...r.map((q) => q[0]!));
        const my = Math.min(...r.map((q) => q[1]!));
        forms.push(JSON.stringify(r.map((q) => [q[0]! - mx, q[1]! - my, q[2]! - mx, q[3]! - my]).sort((a, b) => a.join().localeCompare(b.join()))));
      }
  return forms.sort()[0]!;
}

describe('cuboid nets (box_nets.py)', () => {
  const count = (size: [number, number, number]) => {
    const s: SolidSpec = { type: 'cuboid', size };
    const trees = unfoldings(s);
    const shapes = new Set<string>();
    let overlapping = 0;
    for (const tree of trees) {
      const net = buildNet({ solid: s, layout: { tree }, stagger: true, view: 'auto', turn: 0 });
      if (flatOverlap(net).length) overlapping++;
      expect(foldResult(net).closes).toBe(true);
      const rects = net.nodes.map((n) => {
        const xs = n.poly.map((p) => Math.round(p[0]));
        const ys = n.poly.map((p) => Math.round(p[1]));
        return [Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys)];
      });
      shapes.add(rectCanon(rects));
    }
    return { trees: trees.length, overlapping, nets: shapes.size };
  };
  it('a cube: 384 unfoldings, none overlapping, 11 nets', () => expect(count([1, 1, 1])).toEqual({ trees: 384, overlapping: 0, nets: 11 }));
  it('1 × 1 × 2: 29 nets', () => expect(count([1, 1, 2]).nets).toBe(29));
  it('2 × 3 × 4 (three lengths all different): 54 nets', () => expect(count([2, 3, 4])).toEqual({ trees: 384, overlapping: 0, nets: 54 }));
});

describe('the regular tetrahedron', () => {
  it('has 16 unfoldings and 2 different nets', () => {
    const s: SolidSpec = { type: 'pyramid', sides: 3, edge: 2, regular: true };
    const trees = unfoldings(s);
    const shapes = new Set<string>();
    for (const tree of trees) {
      const net = buildNet({ solid: s, layout: { tree }, stagger: true, view: 'auto', turn: 0 });
      expect(foldResult(net).closes).toBe(true);
      expect(flatOverlap(net)).toEqual([]);
      // The distances between the net's corners do not change when it is turned or flipped.
      const key = (v: number) => (Math.round(v * 1e5) / 1e5 + 0).toFixed(5);
      const pts = [...new Map(net.nodes.flatMap((n) => n.poly).map((p) => [`${key(p[0])},${key(p[1])}`, p])).values()];
      const d: string[] = [];
      for (let i = 0; i < pts.length; i++) for (let j = i + 1; j < pts.length; j++) d.push(Math.hypot(pts[i]![0] - pts[j]![0], pts[i]![1] - pts[j]![1]).toFixed(5));
      shapes.add(d.sort().join(' '));
    }
    expect(trees).toHaveLength(16);
    expect(shapes.size).toBe(2);
  });
});

describe('folding', () => {
  it('folds in layers: the first layer starts first, the last ends last, all flat at 0 and folded at 1', () => {
    const net = cubeNet(CUBE_NETS['141-e']);
    const depth = net.nodes.map((n) => n.depth);
    expect(Math.max(...depth)).toBe(2);
    const at = (t: number) => layerFolds(net, t);
    expect(at(0).every((v) => v === 0)).toBe(true);
    expect(at(1).every((v, i) => v === (i === net.root ? 0 : 1))).toBe(true);
    const deep = depth.indexOf(2);
    const near = depth.indexOf(1);
    expect(at(0.3)[near]!).toBeGreaterThan(0);
    expect(at(0.3)[deep]!).toBe(0);
    expect(at(0.8)[near]!).toBe(1);
    expect(at(0.8)[deep]!).toBeLessThan(1);
    expect(at(0.5)[near]!).toBeGreaterThan(0);
    expect(at(0.5)[deep]!).toBeGreaterThan(0);
  });

  it('a rectangle too short leaves a gap: it is the wrong size, the box does not close', () => {
    const s: SolidSpec = { type: 'cuboid', size: [3, 2, 1] };
    const good = buildNet({ solid: s, layout: { rects: [[1, 1, 3, 2], [1, 0, 3, 1], [1, 3, 3, 1], [1, 4, 3, 2], [0, 1, 1, 2], [4, 1, 1, 2]] }, stagger: true, view: 'auto', turn: 0 });
    expect(foldResult(good).closes).toBe(true);
    const short = buildNet({ solid: s, layout: { rects: [[1, 1, 3, 2], [1, 0, 3, 1], [1, 3, 3, 1], [1, 4, 3, 2], [0, 1, 1, 2], [4, 1, 1, 1]] }, stagger: true, view: 'auto', turn: 0 });
    const r = foldResult(short);
    expect(r.closes).toBe(false);
    expect(r.sizeMismatch).toEqual([5]);
    expect(r.lands[5]).toBe('right');
    expect(r.missing).toEqual([]);
  });

  it('a box with no lid: open top, the four sides and the bottom', () => {
    const net = buildNet({ solid: CUBE, layout: { cells: [[0, 1], [1, 1], [2, 1], [3, 1], [0, 0]] }, base: [0, 0], open: 'top', stagger: true, view: 'auto', turn: 0 });
    expect(foldResult(net).closes).toBe(true);
    const shut = buildNet({ solid: CUBE, layout: { cells: [[0, 1], [1, 1], [2, 1], [3, 1], [0, 0]] }, base: [0, 0], stagger: true, view: 'auto', turn: 0 });
    expect(foldResult(shut).missing).toEqual(['top']);
  });

  it('a prism and a pyramid fold onto their faces exactly', () => {
    for (const s of [
      { type: 'prism', sides: 3, edge: 2, length: 3 },
      { type: 'prism', sides: 6, edge: 1, length: 2 },
      { type: 'pyramid', sides: 4, edge: 2, height: 1.6 },
      { type: 'pyramid', sides: 5, edge: 1, height: 2 },
    ] as SolidSpec[]) {
      const net = buildNet({ solid: s, stagger: true, view: 'auto', turn: 0 });
      expect(foldResult(net).closes, s.type).toBe(true);
      expect(flatOverlap(net)).toEqual([]);
    }
    const prism: SolidSpec = { type: 'prism', sides: 3, edge: 2, length: 3 };
    const twoOnOneSide = buildNet({ solid: prism, layout: { tree: [['side-2', null], ['side-1', 'side-2'], ['side-3', 'side-2'], ['end-a', 'side-2'], ['end-b', 'side-1'], ['end-b', 'side-3']] }, stagger: true, view: 'auto', turn: 0 });
    const r = foldResult(twoOnOneSide);
    expect(r.closes).toBe(false);
    expect(r.overlaps).toHaveLength(1);
  });
});
