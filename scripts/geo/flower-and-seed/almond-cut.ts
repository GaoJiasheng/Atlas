/** Longitudinal Terminalia catappa half-drupe: cork, woody endocarp and real half-kernel. */
import {
  BufferGeometry,
  Color,
  Float32BufferAttribute,
  Path,
  Shape,
  ShapeGeometry,
  Vector2,
} from "three";
import { surface, type P } from "../living-things/sculpture";
import { rng, type Model } from "../living-things/kit";
import { Sculpt } from "./sculpt";
const TAU = Math.PI * 2,
  CUT = 0.011;
function reverse(g: BufferGeometry) {
  const ix = g.index!;
  for (let i = 0; i < ix.count; i += 3) {
    const b = ix.getX(i + 1);
    ix.setX(i + 1, ix.getX(i + 2));
    ix.setX(i + 2, b);
  }
  g.computeVertexNormals();
  return g;
}
const up = (g: BufferGeometry, a: number) => (a === Math.PI ? reverse(g) : g);
const mix = (a: P, b: P, t: number): P =>
  a.map((v, i) => v + (b[i]! - v) * t) as P;
const grain = (x: number, z: number) =>
  0.000013 * Math.sin(x * 1721 + Math.sin(z * 1421)) +
  0.000009 * Math.sin(x * 671 - z * 1823) +
  0.000006 * Math.cos(x * 3601 + z * 2193);
const cutHeight = (x: number, z: number) => CUT + grain(x, z);
function shape(
  u: number,
  a: number,
  R: number,
  L: number,
  H: number,
  wood = false,
): P {
  const t = u * Math.PI,
    outline = Math.sin(t) ** 1.05,
    keel = 1 + 0.14 * Math.abs(Math.cos(a)) ** 18;
  const irregular = wood
    ? 1 + 0.045 * Math.sin(u * 29 + a * 0.7) + 0.027 * Math.sin(u * 71 - a * 3)
    : 1 + 0.023 * Math.sin(t * 5 + a * 3);
  const relief = wood
    ? 0
    : (0.000085 * Math.sin(a * 15 + Math.sin(u * 5)) +
        0.000045 * Math.sin(a * 23 - u * 4)) *
      outline;
  return [
    L * (2 * u - 1),
    CUT - Math.sin(a) * (H * outline + relief),
    Math.cos(a) *
      (R * outline * keel * (1 + 0.09 * Math.cos(t)) * irregular + relief),
  ];
}
function refined(g: BufferGeometry): BufferGeometry {
  const p = g.getAttribute("position"),
    vertices: number[] = Array.from(p.array),
    ix = g.index!,
    indices: number[] = [],
    mids = new Map<string, number>();
  const midpoint = (a: number, b: number) => {
    const key = a < b ? `${a}:${b}` : `${b}:${a}`;
    let m = mids.get(key);
    if (m !== undefined) return m;
    m = vertices.length / 3;
    for (let k = 0; k < 3; k++)
      vertices.push((vertices[a * 3 + k]! + vertices[b * 3 + k]!) * 0.5);
    mids.set(key, m);
    return m;
  };
  for (let k = 0; k < ix.count; k += 3) {
    const a = ix.getX(k),
      b = ix.getX(k + 1),
      c = ix.getX(k + 2),
      ab = midpoint(a, b),
      bc = midpoint(b, c),
      ca = midpoint(c, a);
    indices.push(a, ab, ca, ab, b, bc, ca, bc, c, ab, bc, ca);
  }
  const out = new BufferGeometry();
  out.setAttribute("position", new Float32BufferAttribute(vertices, 3));
  out.setIndex(indices);
  return out;
}
function corkFinish(g: BufferGeometry) {
  const p = g.getAttribute("position"),
    cols: number[] = [],
    tan = new Color("#6e5a44"),
    buff = new Color("#b8973c"),
    russet = new Color("#82372b");
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i),
      z = p.getZ(i);
    p.setY(i, cutHeight(x, z));
    const speck =
      0.5 +
      0.5 *
        Math.sin(x * 3201 + Math.sin(z * 4181)) *
        Math.cos(z * 1301 - x * 1631);
    const edge = Math.max(0, (Math.abs(z) / 0.016 - 0.45) * 1.7);
    const c = tan
      .clone()
      .lerp(buff, 0.08 + 0.14 * speck)
      .lerp(russet, edge * 0.32)
      .multiplyScalar(0.76 + 0.18 * speck);
    cols.push(c.r, c.g, c.b);
  }
  g.setAttribute("color", new Float32BufferAttribute(cols, 3));
  g.computeVertexNormals();
  return g;
}
export function seaAlmondCutRound3(): Model {
  const s = new Sculpt();
  // Same 55 mm long, keeled, pointed half-drupe; the skin is a thin rind.
  s.put(
    reverse(
      surface(44, 40, (u, v) => shape(u, v * Math.PI, 0.016, 0.0275, 0.009)),
    ),
    "#513f2e",
    0.035,
  );
  for (const a of [0, Math.PI])
    s.put(
      up(
        surface(44, 3, (u, v) => {
          const p = mix(
            shape(u, a, 0.016, 0.0275, 0.009),
            shape(u, a, 0.0148, 0.0263, 0.008),
            v,
          );
          p[1] = cutHeight(p[0], p[2]);
          return p;
        }),
        a,
      ),
      "#82372b",
      0.045,
    );
  s.put(
    reverse(
      surface(36, 20, (u, v) => shape(u, v * Math.PI, 0.0148, 0.0263, 0.008)),
    ),
    "#6e5a44",
    0.05,
  );

  const woodOuter = (u: number, a: number) =>
    shape(u, a, 0.00455, 0.0183, 0.0039, true);
  const seed = (u: number, a: number): P => {
    const t = Math.PI * u,
      outline = Math.sin(t) ** 0.72,
      w = 0.0041 * outline * (1 - 0.1 * Math.cos(t));
    return [
      0.017 * (2 * u - 1),
      CUT - 0.0031 * Math.sin(a) * outline,
      Math.cos(a) * w + 0.00017 * Math.sin(t * 2) * outline,
    ];
  };
  // The woody endocarp is slender and wavering, never a broad regular brown band.
  s.put(
    reverse(surface(40, 16, (u, v) => woodOuter(u, v * Math.PI))),
    "#51351f",
    0.035,
  );
  for (const a of [0, Math.PI])
    s.put(
      up(
        surface(48, 4, (u, v) => {
          const p = mix(woodOuter(u, a), seed(u, a), v);
          p[1] = cutHeight(p[0], p[2]) + 0.00002;
          return p;
        }),
        a,
      ),
      "#513f2e",
      0.045,
    );

  // Plump cut cotyledons: a convex cream face, natural longitudinal crease and buff perimeter.
  s.put(
    reverse(surface(48, 20, (u, v) => seed(u, v * Math.PI))),
    "#e9e4d8",
    0.012,
  );
  const kernel = reverse(
    surface(56, 18, (u, v) => {
      const q = v * 2 - 1,
        a = seed(u, 0),
        b = seed(u, Math.PI),
        p = mix(a, b, v),
        o = Math.sin(Math.PI * u) ** 0.72;
      const convex = 0.00105 * o * Math.max(0, 1 - q * q) ** 0.65;
      const crease =
        0.0005 * Math.exp(-(((q + 0.1 * Math.sin(u * 6)) / 0.075) ** 2)) * o;
      p[1] = CUT + convex - crease + 0.000035 * Math.sin(u * 45 + q * 3) * o;
      return p;
    }),
  );
  const kp = kernel.getAttribute("position"),
    kc: number[] = [],
    cream = new Color("#b9b4a8"),
    buff = new Color("#b8973c");
  for (let i = 0; i < kp.count; i++) {
    const u = Math.floor(i / 19) / 56,
      q = ((i % 19) / 18) * 2 - 1;
    const edge = Math.abs(q) ** 12 * 0.13,
      crease = 0.18 * Math.exp(-(((q + 0.1 * Math.sin(u * 6)) / 0.11) ** 2));
    const c = cream
      .clone()
      .lerp(buff, edge + crease)
      .multiplyScalar(0.98 + 0.018 * Math.sin(u * 13 + q));
    kc.push(c.r, c.g, c.b);
  }
  kernel.setAttribute("color", new Float32BufferAttribute(kc, 3));
  s.put(kernel, "#e9e4d8");

  const outline = (fn: (u: number, a: number) => P) => [
    ...Array.from({ length: 73 }, (_, i) => fn(i / 72, 0)),
    ...Array.from({ length: 71 }, (_, i) => fn(1 - (i + 1) / 72, Math.PI)),
  ];
  const outer = outline((u, a) => shape(u, a, 0.0148, 0.0263, 0.008)),
    inner = outline(woodOuter);
  const face = new Shape(outer.map((p) => new Vector2(p[0], p[2])));
  face.holes.push(new Path(inner.map((p) => new Vector2(p[0], p[2]))));
  const rand = rng(883),
    cells: { c: P; r: number; aspect: number; phase: number }[] = [];
  for (let i = 0; i < 1400 && cells.length < 54; i++) {
    const side = rand() > 0.5 ? 0 : Math.PI,
      u = 0.09 + rand() * 0.82,
      v = 0.18 + rand() * 0.62;
    const c = mix(shape(u, side, 0.0148, 0.0263, 0.008), woodOuter(u, side), v),
      r = 0.00048 + rand() * 0.00034,
      aspect = 0.28 + rand() * 0.45,
      phase = rand() * TAU;
    if (
      cells.some(
        (q) =>
          Math.hypot(c[0] - q.c[0], (c[2] - q.c[2]) * 1.25) < r + q.r + 0.0002,
      )
    )
      continue;
    cells.push({ c, r, aspect, phase });
    const rim = (a: number, q = 1): P => {
      const R = r * (1 + 0.1 * Math.sin(a * 3 + phase));
      const x = c[0] + Math.cos(a) * R * q,
        z = c[2] + Math.sin(a) * R * q * aspect;
      return [x, cutHeight(x, z) - 0.00105 * (1 - q * q), z];
    };
    const points = Array.from({ length: 10 }, (_, j) => {
      const p = rim((j / 10) * TAU);
      return new Vector2(p[0], p[2]);
    });
    face.holes.push(new Path(points));
    s.put(
      reverse(surface(3, 10, (q, w) => rim(w * TAU, q), true)),
      "#513f2e",
      0.05,
    );
  }
  if (cells.length !== 54)
    throw new Error("Sea almond must retain 54 teaching air spaces");
  const cut = new ShapeGeometry(face, 1);
  cut.rotateX(Math.PI / 2).translate(0, CUT, 0);
  s.put(corkFinish(refined(reverse(cut))), "#6e5a44");

  // Compact cut fibre bundles, firmly rooted in the cork, rather than long scratches.
  for (const side of [0, Math.PI])
    for (let j = 0; j < 55; j++) {
      const u = 0.07 + rand() * 0.84,
        v = 0.08 + rand() * 0.84;
      for (let strand = 0; strand < 2; strand++) {
        const len = 0.0035 + rand() * 0.006,
          offset = (strand - 0.5) * 0.008;
        const points = Array.from({ length: 3 }, (_, k) => {
          const U = Math.min(0.97, u + (len * k) / 2),
            V = Math.min(
              0.96,
              Math.max(0.04, v + offset + 0.006 * Math.sin(k * 2 + j)),
            );
          const p = mix(
            shape(U, side, 0.0148, 0.0263, 0.008),
            woodOuter(U, side),
            V,
          );
          p[1] =
            cutHeight(p[0], p[2]) -
            0.000025 +
            0.000025 * Math.sin((k * Math.PI) / 2);
          return p;
        });
        if (
          cells.some((q) =>
            points.some(
              (p) =>
                Math.hypot(p[0] - q.c[0], (p[2] - q.c[2]) / q.aspect) <
                q.r * 1.15,
            ),
          )
        )
          continue;
        s.line(
          points,
          [0.00006, 0.000055, 0.000015],
          j % 4 === 0 ? "#857d70" : j % 3 ? "#6e5a44" : "#513f2e",
          0.8,
          3,
          3,
        );
      }
    }

  return s.finish();
}
