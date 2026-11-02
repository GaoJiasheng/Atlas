/** The chapter-02 protected-organs figure is drawn from explicit geometry, so its rib count holds by construction. */
import { readFileSync, statSync } from 'node:fs';
import sharp from 'sharp';
import { describe, expect, it } from 'vitest';
import { BUDGET, OUTPUT, svg, thorax, type Point, type Rib, type Side } from '../../scripts/figures/bones-protected-organs';

const t = thorax();
const SIDES: Side[] = ['right', 'left'];
const ribsOf = (side: Side) => t.ribs.filter((r) => r.side === side);
const last = (line: readonly Point[]) => line[line.length - 1]!;

function inside(p: Point, poly: readonly Point[]): boolean {
  let hit = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i]!;
    const [xj, yj] = poly[j]!;
    if (yi > p[1] !== yj > p[1] && p[0] < ((xj - xi) * (p[1] - yi)) / (yj - yi) + xi) hit = !hit;
  }
  return hit;
}

function distance(p: Point, line: readonly Point[]): number {
  let best = Infinity;
  for (let i = 1; i < line.length; i++) {
    const [ax, ay] = line[i - 1]!;
    const [bx, by] = line[i]!;
    const dx = bx - ax;
    const dy = by - ay;
    const u = Math.max(0, Math.min(1, ((p[0] - ax) * dx + (p[1] - ay) * dy) / (dx * dx + dy * dy || 1)));
    best = Math.min(best, Math.hypot(p[0] - ax - u * dx, p[1] - ay - u * dy));
  }
  return best;
}

const inBody = (p: Point, id: string) => {
  const v = t.vertebrae.find((x) => x.id === id)!;
  return Math.abs(p[0] - v.centre[0]) <= v.halfWidth && Math.abs(p[1] - v.centre[1]) <= v.height / 2;
};

describe('bones and joints: protected-organs figure geometry', () => {
  it('has twelve thoracic vertebrae, T1 to T12 from the top', () => {
    expect(t.vertebrae.map((v) => v.id)).toEqual(Array.from({ length: 12 }, (_, i) => `T${i + 1}`));
    for (let i = 1; i < 12; i++) expect(t.vertebrae[i]!.centre[1]).toBeGreaterThan(t.vertebrae[i - 1]!.centre[1]);
  });

  it.each(SIDES)('%s side: exactly twelve ribs, numbered 1–12, classed 7 true / 3 false / 2 floating', (side) => {
    const ribs = ribsOf(side);
    expect(ribs.map((r) => r.number).sort((a, b) => a - b)).toEqual(Array.from({ length: 12 }, (_, i) => i + 1));
    const count = (kind: Rib['kind']) => ribs.filter((r) => r.kind === kind).map((r) => r.number);
    expect(count('true')).toEqual([1, 2, 3, 4, 5, 6, 7]);
    expect(count('false')).toEqual([8, 9, 10]);
    expect(count('floating')).toEqual([11, 12]);
    for (const r of ribs) expect(Math.sign(last(r.bone)[0])).toBe(side === 'right' ? -1 : 1);
  });

  it.each(SIDES)('%s side: every rib, floating ones included, starts at its own vertebra', (side) => {
    for (const r of ribsOf(side)) {
      expect(r.vertebra).toBe(`T${r.number}`);
      const head = r.bone[0]!;
      expect(inBody(head, r.vertebra)).toBe(true);
      for (const v of t.vertebrae) if (v.id !== r.vertebra) expect(inBody(head, v.id)).toBe(false);
    }
  });

  it.each(SIDES)('%s side: ribs 1–7 reach the sternum, 8–10 the cartilage above, 11–12 end free', (side) => {
    const ribs = ribsOf(side);
    const rib = (n: number) => ribs.find((r) => r.number === n)!;
    for (const r of ribs) {
      if (r.kind === 'floating') {
        expect(r.joins).toEqual({ to: 'free' });
        expect(r.cartilage).toHaveLength(0);
        const tip = last(r.bone);
        expect(inside(tip, t.sternum)).toBe(false);
        for (const other of t.ribs) {
          if (other.cartilage.length) expect(distance(tip, other.cartilage)).toBeGreaterThan(20);
          if (other !== r) expect(distance(tip, other.bone)).toBeGreaterThan(20);
        }
        continue;
      }
      expect(r.cartilage[0]).toEqual(last(r.bone));
      const end = last(r.cartilage);
      if (r.kind === 'true') {
        expect(r.joins).toEqual({ to: 'sternum' });
        expect(inside(end, t.sternum)).toBe(true);
      } else {
        expect(r.joins).toEqual({ to: 'cartilage', rib: r.number - 1 });
        expect(inside(end, t.sternum)).toBe(false);
        expect(distance(end, rib(r.number - 1).cartilage)).toBeLessThan(0.5);
      }
    }
  });

  it('draws one group per rib in the SVG, and the heart sits left of the midline', () => {
    const text = svg(t);
    expect(text.match(/data-rib="/g)).toHaveLength(24);
    expect(text.match(/data-kind="true"/g)).toHaveLength(14);
    expect(text.match(/data-kind="false"/g)).toHaveLength(6);
    expect(text.match(/data-kind="floating"/g)).toHaveLength(4);
    // The subject's left is the viewer's right in an anterior view.
    const xs = t.heart.map((p) => p[0]);
    expect((Math.min(...xs) + Math.max(...xs)) / 2).toBeGreaterThan(0);
  });

  it('ships a 1200×900 neutral-grey WebP within the figure budget, used in both locales of chapter 02', async () => {
    expect(statSync(OUTPUT).size).toBeLessThanOrEqual(BUDGET);
    const { data, info } = await sharp(OUTPUT).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
    expect([info.width, info.height]).toEqual([1200, 900]);
    let transparent = 0;
    let coloured = 0;
    for (let i = 0; i < data.length; i += 4) {
      if (data[i + 3] === 0) transparent++;
      else if (data[i] !== data[i + 1] || data[i + 1] !== data[i + 2]) coloured++;
    }
    expect(coloured).toBe(0);
    expect(transparent).toBeGreaterThan(0);
    const body = readFileSync('src/content/topics/bones-and-joints/chapters/02-living-bone.mdx', 'utf8');
    expect(body.match(/<Figure src="figures\/bones-and-joints-protected-organs"/g)).toHaveLength(2);
  });
});
