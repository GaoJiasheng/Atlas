import { describe, expect, it } from "vitest";
import {
  BoxGeometry,
  BufferGeometry,
  ConeGeometry,
  CylinderGeometry,
  Matrix4,
  SphereGeometry,
  Vector3,
} from "three";
import { benchShadow } from "../../src/engines/space-scene/lib/sim/light";
import {
  inBeam,
  inReceiver,
  projectShadow,
  receiverFrame,
  receiverPlane,
  receiverUV,
  segmentTriangle,
  shadowBounds,
  shadowMatrix,
  spotOpacity,
  spotRadius,
} from "../../src/engines/space-scene/lib/sim/shadow";
import { panelHoleGeometry } from "../../src/engines/space-scene/stages/model3d/geometry";
import {
  sunPosition,
  sunVector,
} from "../../src/engines/space-scene/lib/sim/sun";
import type {
  LightData,
  LightShape,
} from "../../src/engines/space-scene/sim-schema";
import type { Vec3 } from "../../src/engines/space-scene/lib/math";

const points = (geometry: BufferGeometry): Vec3[] => {
  const p = geometry.getAttribute("position");
  return Array.from({ length: p.count }, (_, i) => [
    p.getX(i),
    p.getY(i),
    p.getZ(i),
  ]);
};
const bench = (shape: LightShape): NonNullable<LightData["bench"]> => ({
  object: "object",
  turn: "turn",
  holder: [0, 0, 0],
  power: "on",
  source: { part: "torch", point: [0, 0, 0], axis: [1, 0, 0], beam: 40 },
  gaps: { torch: "a", screen: "b" },
  screen: { part: "screen", size: [60, 45] },
  objects: { object: { part: "object", shape, names: { "0": "circle" } } },
});
const projected = (g: BufferGeometry, a: number, b: number) => {
  const frame = receiverFrame([b / 100, 0, 0], [-1, 0, 0]);
  return shadowBounds(
    points(g).map((p) =>
      projectShadow(p, receiverPlane(frame), [-a / 100, 0, 0, 1]),
    ),
    frame,
  );
};

describe("geometric shadows", () => {
  it("uses the homogeneous planar matrix for both point and parallel sources", () => {
    const plane = [0, 1, 0, 0] as const;
    for (const light of [
      [-2, 3, 1, 1],
      [1, 2, -1, 0],
    ] as const) {
      const p: [number, number, number] = [0.3, 1.2, -0.4];
      const actual = new Vector3(...p).applyMatrix4(
        new Matrix4().fromArray(shadowMatrix(plane, light)),
      );
      expect(actual.y).toBeCloseTo(0, 12);
      expect(actual.toArray()).toEqual(projectShadow(p, plane, light));
    }
  });
  it("matches both similar-triangle tables within 2 mm using actual thick card vertices", () => {
    const shape: LightShape = { kind: "disc", d: 8, thick: 0.2 };
    const g = new CylinderGeometry(0.04, 0.04, 0.002, 96).rotateZ(Math.PI / 2);
    for (const [a, b] of [
      ...[10, 15, 20, 30, 40, 60].map((a) => [a, 30] as const),
      ...[10, 20, 30, 40, 50, 60].map((b) => [20, b] as const),
    ]) {
      const actual = projected(g, a, b),
        model = benchShadow(bench(shape), "object", 0, a, b);
      expect(
        Math.abs(actual.max[1] - actual.min[1] - model.height),
      ).toBeLessThan(0.2);
      expect(
        Math.abs(actual.max[0] - actual.min[0] - model.width),
      ).toBeLessThan(0.2);
      expect(
        inBeam(
          [b / 100, model.height / 200, model.width / 200],
          [-a / 100, 0, 0],
          [1, 0, 0],
          40,
        ),
      ).toBe(true);
    }
    g.dispose();
  });
  it("matches sphere, cylinder, cone and rotating rectangle meshes to the analytic silhouettes", () => {
    const shapes: { shape: LightShape; g: BufferGeometry }[] = [
      {
        shape: { kind: "sphere", d: 6.5 },
        g: new SphereGeometry(0.0325, 96, 64),
      },
      {
        shape: { kind: "cylinder", d: 6.6, length: 12, axis: "z" },
        g: new CylinderGeometry(0.033, 0.033, 0.12, 96).rotateX(Math.PI / 2),
      },
      {
        shape: { kind: "cone", d: 8, length: 10, axis: "z", apex: "+" },
        g: new ConeGeometry(0.04, 0.1, 96).rotateX(Math.PI / 2),
      },
      {
        shape: {
          kind: "polygon",
          points: [
            [-4, -4],
            [4, -4],
            [4, 4],
            [-4, 4],
          ],
          thick: 0.2,
        },
        g: new BoxGeometry(0.002, 0.08, 0.08),
      },
    ];
    for (const { shape, g } of shapes)
      for (const turn of [0, 45, 90]) {
        const turned = g.clone().rotateY((turn * Math.PI) / 180),
          actual = projected(turned, 20, 30),
          model = benchShadow(bench(shape), "object", turn, 20, 30);
        expect(
          Math.abs(actual.max[1] - actual.min[1] - model.height),
        ).toBeLessThan(0.2);
        expect(
          Math.abs(actual.max[0] - actual.min[0] - model.width),
        ).toBeLessThan(0.2);
        turned.dispose();
      }
    shapes.forEach((x) => x.g.dispose());
  });
  it("clips to rectangular and circular receivers and the source cone", () => {
    expect(inReceiver([0.3, 0.225], [0.6, 0.45])).toBe(true);
    expect(inReceiver([0.301, 0], [0.6, 0.45])).toBe(false);
    expect(inReceiver([5.4, 0], undefined, 5.5)).toBe(true);
    expect(inReceiver([4, 4], undefined, 5.5)).toBe(false);
    expect(inBeam([1, 0.8, 0], [0, 0, 0], [1, 0, 0], 40)).toBe(true);
    expect(inBeam([1, 0.9, 0], [0, 0, 0], [1, 0, 0], 40)).toBe(false);
    expect(inBeam([-1, 0, 0], [0, 0, 0], [1, 0, 0], 40)).toBe(false);
    expect(spotRadius(0.5, 40)).toBeCloseTo(0.41955, 4);
    expect(spotOpacity(0.1)).toBe(0.45);
    expect(spotOpacity(3)).toBe(0.12);
  });
  it("projects the actual hole-card triangle union: aligned Ø 2 cm aperture, moved centre blocks it", () => {
    const g = panelHoleGeometry({
      kind: "panelHole",
      color: "token:ink",
      size: [0.1, 0.1, 0.002],
      hole: { r: 0.006, at: [0, 0] },
      at: [0, 0, 0],
      rotation: [0, 0, 0],
    }).rotateY(Math.PI / 2);
    const start: Vec3 = [-0.2, 0, 0];
    const blocked = (z: number, moved: boolean) => {
      const end: Vec3 = [0.3, 0, z];
      for (const [i, x] of [-0.1, 0, 0.1].entries()) {
        const vertices = points(g).map(
          (p) => [p[0] + x, p[1], p[2] + (moved && i === 1 ? 0.02 : 0)] as Vec3,
        );
        for (let j = 0; j < vertices.length; j += 3)
          if (
            segmentTriangle(
              start,
              end,
              vertices[j]!,
              vertices[j + 1]!,
              vertices[j + 2]!,
            ) !== null
          )
            return true;
      }
      return false;
    };
    expect(blocked(0, false)).toBe(false);
    expect(blocked(0.0099, false)).toBe(false);
    expect(blocked(0.0101, false)).toBe(true);
    expect(blocked(0, true)).toBe(true);
    for (let z = -0.01; z <= 0.01; z += 0.001)
      expect(blocked(z, true)).toBe(true);
    g.dispose();
  });
  it("drawn upper and lower rays graze actual mesh vertices within 1 mm", () => {
    const g = new CylinderGeometry(0.04, 0.04, 0.002, 96).rotateZ(Math.PI / 2),
      vertices = points(g),
      frame = receiverFrame([0.3, 0, 0], [-1, 0, 0]),
      start: Vec3 = [-0.2, 0, 0];
    const pairs = vertices.map((p) => ({
      p,
      q: projectShadow(p, receiverPlane(frame), [...start, 1]),
    }));
    for (const pair of [
      pairs.reduce((a, b) => (a.q[1] > b.q[1] ? a : b)),
      pairs.reduce((a, b) => (a.q[1] < b.q[1] ? a : b)),
    ]) {
      const d = new Vector3(...pair.q).sub(new Vector3(...start)).normalize();
      const edge = new Vector3(...pair.p).sub(new Vector3(...start));
      expect(edge.clone().cross(d).length()).toBeLessThan(0.001);
    }
    g.dispose();
  });
  it("hourly chalk marks equal the Sun model pole-tip length and direction", () => {
    const frame = receiverFrame([10, 0.05, 0], [0, 1, 0]);
    for (let time = 8; time <= 18; time++) {
      const sun = sunPosition("2026-10-20", time, 1.3, 103.8, 8),
        d = sunVector(sun.height, sun.bearing, [0, 0, -1]);
      const p = projectShadow([10, 1.05, 0], receiverPlane(frame), [
          d.x!,
          d.y!,
          d.z!,
          0,
        ]),
        uv = receiverUV(p, frame);
      expect(Math.hypot(...uv)).toBeCloseTo(
        1 / Math.tan((sun.height * Math.PI) / 180),
        10,
      );
      const bearing = ((Math.atan2(uv[0], uv[1]) * 180) / Math.PI + 360) % 360;
      expect(bearing).toBeCloseTo((sun.bearing + 180) % 360, 10);
    }
  });
});
