/**
 * Projection and occlusion (docs/39 §3.3, lib/project.ts): the painter's
 * order from pairwise plane tests agrees with ray casting — at 64 × 64
 * points over the drawing, the last face painted over a point is the face
 * a ray from the viewer meets first — for the 11 cube nets, three cuboid
 * nets, a triangular prism, a square pyramid and the regular tetrahedron's
 * two nets, at folds 0.25, 0.5, 0.75 and 1 and all four quarter turns. The
 * views: top reads the net as drawn, iso is the true isometric angle, auto
 * goes from one to the other in the first quarter of the fold.
 */
import { describe, expect, it } from 'vitest';
import type { NetSpec, SolidSpec } from '../../src/engines/math-scene/schema';
import { buildNet, CUBE_NET_NAMES, foldedPolys, layerFolds, type Net, type P2 } from '../../src/engines/math-scene/lib/net';
import { autoIso, boundsOf, camera, insideConvex, ISO_PITCH, paintOrder, project, rayHit } from '../../src/engines/math-scene/lib/project';
import { dot } from '../../src/engines/math-scene/lib/solid';

const spec = (solid: SolidSpec, layout?: NetSpec['layout']) => ({ solid, layout, stagger: true, view: 'auto' as const, turn: 0 });
const NETS: [string, Net][] = [
  ...CUBE_NET_NAMES.map((n) => [n, buildNet(spec({ type: 'cuboid', size: [1, 1, 1] }, { cubeNet: n }))] as [string, Net]),
  ['box cross', buildNet(spec({ type: 'cuboid', size: [3, 2, 1] }))],
  ['box 2-row', buildNet(spec({ type: 'cuboid', size: [3, 2, 1] }, { rects: [[1, 1, 3, 2], [1, 0, 3, 1], [1, 3, 3, 1], [1, 4, 3, 2], [0, 1, 1, 2], [4, 1, 1, 2]] }))],
  ['box tall', buildNet(spec({ type: 'cuboid', size: [2, 2, 3] }, { rects: [[0, 2, 2, 3], [2, 2, 2, 3], [4, 2, 2, 3], [6, 2, 2, 3], [2, 0, 2, 2], [4, 5, 2, 2]] }))],
  ['tri-prism', buildNet(spec({ type: 'prism', sides: 3, edge: 2, length: 3 }, { tree: [['side-2', null], ['side-1', 'side-2'], ['side-3', 'side-2'], ['end-a', 'side-2'], ['end-b', 'side-2']] }))],
  ['sq-pyr', buildNet(spec({ type: 'pyramid', sides: 4, edge: 2, height: 1.6 }))],
  ['tetra star', buildNet(spec({ type: 'pyramid', sides: 3, edge: 2, regular: true }))],
  ['tetra strip', buildNet(spec({ type: 'pyramid', sides: 3, edge: 2, regular: true }, { tree: [['base', null], ['side-1', 'base'], ['side-2', 'side-1'], ['side-3', 'side-2']] }))],
];

describe('the camera', () => {
  it('from the top the net reads as drawn; isometric is 45° round and 35.264° down', () => {
    const top = camera(0, 0);
    expect(project([1, 0, 0], top).x).toBeCloseTo(1, 12);
    expect(project([0, 1, 0], top).y).toBeCloseTo(1, 12);
    expect(project([0, 0, 1], top).z).toBeCloseTo(1, 12);
    const iso = camera(1, 0);
    expect((Math.asin(iso.c[2]) * 180) / Math.PI).toBeCloseTo(35.264, 3);
    expect(ISO_PITCH).toBeCloseTo(Math.atan(1 / Math.SQRT2), 12);
    // The three edges of a cube at a corner look the same length (true isometric).
    const len = (v: [number, number, number]) => Math.hypot(project(v, iso).x, project(v, iso).y);
    expect(len([1, 0, 0])).toBeCloseTo(len([0, 1, 0]), 12);
    expect(len([1, 0, 0])).toBeCloseTo(len([0, 0, 1]), 12);
    // A quarter turn turns the world: what was in front is on the side.
    const q = camera(1, 1);
    expect(dot(q.c, [1, 0, 0])).toBeCloseTo(dot(iso.c, [0, 1, 0]), 12);
  });

  it('auto is the top view flat and isometric from a quarter folded', () => {
    expect(autoIso(0)).toBe(0);
    expect(autoIso(0.25)).toBe(1);
    expect(autoIso(0.8)).toBe(1);
    expect(autoIso(0.125)).toBeCloseTo(0.5, 12);
  });
});

describe('painter\'s order against ray casting', () => {
  for (const [name, net] of NETS) {
    it(name, () => {
      let checked = 0;
      for (const fold of [0.25, 0.5, 0.75, 1])
        for (const turn of [0, 1, 2, 3]) {
          const cam = camera(1, turn);
          const faces = foldedPolys(net, layerFolds(net, fold));
          const order = paintOrder(faces, cam);
          const screen = faces.map((pts) => pts.map((p) => [dot(p, cam.r), dot(p, cam.u)] as P2));
          const b = boundsOf(faces.flat().map((p) => project(p, cam)))!;
          for (let i = 0; i < 64; i++)
            for (let j = 0; j < 64; j++) {
              const x = b.minX + ((i + 0.5) / 64) * (b.maxX - b.minX);
              const y = b.minY + ((j + 0.5) / 64) * (b.maxY - b.minY);
              const hit = rayHit(faces, cam, x, y);
              if (!hit || hit.t - hit.second < 1e-6) continue;
              // Points on an edge belong to two faces: leave them out.
              if (screen.some((poly) => insideConvex(poly, [x, y]) && !insideConvex(poly, [x, y], 1e-6))) continue;
              const painted = [...order].reverse().find((k) => insideConvex(screen[k]!, [x, y]));
              expect(painted, `${name} fold ${fold} turn ${turn} at ${x.toFixed(3)},${y.toFixed(3)}`).toBe(hit.face);
              checked++;
            }
        }
      expect(checked).toBeGreaterThan(1000);
    });
  }
});
