/**
 * A stretched coil and its bounce (docs/30 F4): the rings slide apart while
 * the wire keeps its thickness, the anchored end stays put, pieces at the
 * free end ride with it, and a hanger offset with the same settle as the
 * spring's stretch stays joined to it while both bounce.
 */
import { describe, expect, it } from 'vitest';
import { BufferAttribute, Matrix4 } from 'three';
import { anchorT, placeAlong, stretchPositions, STRETCH_ATTRIBUTE } from '../../src/engines/space-scene/lib/stretch';
import { SETTLE_EPS_LENGTH, stepSwing } from '../../src/engines/space-scene/lib/sim/settle';
import { partPieces } from '../../src/engines/space-scene/stages/model3d/geometry';
import { primitiveSchema } from '../../src/engines/space-scene/schema';
import { helixPoint } from '../../src/engines/space-scene/lib/shaped';

const coil = primitiveSchema.parse({ kind: 'coil', radius: 0.008, wire: 0.0009, turns: 10, length: 0.08, at: [0, 0.4, 0], color: 'steel' });
const hook = primitiveSchema.parse({ kind: 'torus', size: [0.004, 0.0008], at: [0, 0.355, 0], color: 'steel' });

describe('coil places', () => {
  it('every coil vertex knows its ring; a hook below the coil rides with the bottom end', () => {
    const [piece] = partPieces({ primitive: coil, extra: [hook] });
    const t = piece!.geometry.getAttribute(STRETCH_ATTRIBUTE) as BufferAttribute;
    expect(t).toBeDefined();
    const values = new Set(Array.from(t.array as Float32Array, (v) => Math.round(v * 1000) / 1000));
    expect(Math.min(...values)).toBe(0);
    expect(Math.max(...values)).toBe(1);
    expect(placeAlong(0.355 - 0.4, 0.08)).toBe(0);
    expect(placeAlong(0.05, 0.08)).toBe(1);
    expect(placeAlong(0, 0.08)).toBe(0.5);
  });
});

describe('stretching', () => {
  it('rings slide rigidly: the wire keeps its thickness, the top stays, the bottom moves by ΔL', () => {
    // Two rings of a tube cross-section at t = 0 and t = 1 (points around the helix centre line).
    const ring = (t: number) =>
      Array.from({ length: 8 }, (_, k) => {
        const c = helixPoint(coil as Extract<typeof coil, { kind: 'coil' }>, t);
        const a = (k / 8) * Math.PI * 2;
        return [c[0] + 0.0009 * Math.cos(a), c[1] + 0.0009 * Math.sin(a), c[2]];
      });
    const pts = [...ring(0), ...ring(1)];
    const base = new Float32Array(pts.flat());
    const t = new Float32Array([...Array(8).fill(0), ...Array(8).fill(1)]);
    const out = new Float32Array(base.length);
    stretchPositions(base, t, [0, 1, 0], 'top', 0.06, out);
    // Top ring unmoved; bottom ring 6 cm lower; each ring's own size unchanged.
    for (let i = 8; i < 16; i++) expect(out[i * 3 + 1]).toBeCloseTo(base[i * 3 + 1]!, 6);
    for (let i = 0; i < 8; i++) expect(out[i * 3 + 1]).toBeCloseTo(base[i * 3 + 1]! - 0.06, 6);
    const span = (a: Float32Array, from: number) => Math.max(...[0, 1, 2, 3, 4, 5, 6, 7].map((k) => a[(from + k) * 3 + 1]!)) - Math.min(...[0, 1, 2, 3, 4, 5, 6, 7].map((k) => a[(from + k) * 3 + 1]!));
    expect(span(out, 0)).toBeCloseTo(span(base, 0), 6);
    expect(anchorT('bottom')).toBe(0);
    expect(anchorT('centre')).toBe(0.5);
  });
  it('along a turned coil (a horizontal spring balance) the move follows its axis', () => {
    const axis = new Matrix4().makeRotationZ(-Math.PI / 2);
    const a = [0, 1, 0].map((_, i) => [axis.elements[4], axis.elements[5], axis.elements[6]][i]!) as [number, number, number];
    const out = new Float32Array(3);
    stretchPositions(new Float32Array([0, 0, 0]), new Float32Array([0]), a, 'top', 0.02, out);
    expect(out[0]).toBeCloseTo(-0.02, 9);
    expect(out[1]).toBeCloseTo(0, 9);
  });
});

describe('bouncing together', () => {
  it('a hanger offset and the spring stretch with one settle stay joined and come to rest', () => {
    const p = { period: 0.7, damping: 0.15 };
    const spring = { x: 0, v: 0 };
    const hanger = { x: 0, v: 0 };
    let t = 0;
    let moving = true;
    while (moving && t < 10) {
      const a = stepSwing(spring, 0.06, 1 / 60, p, SETTLE_EPS_LENGTH);
      const b = stepSwing(hanger, 0.06, 1 / 60, p, SETTLE_EPS_LENGTH);
      expect(hanger.x).toBe(spring.x);
      moving = a || b;
      t += 1 / 60;
    }
    expect(spring.x).toBe(0.06);
    // It overshoots first (bounces), then settles within a few seconds.
    expect(t).toBeGreaterThan(1);
    expect(t).toBeLessThan(8);
  });
});
