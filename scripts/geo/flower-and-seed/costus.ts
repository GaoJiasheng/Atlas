/** Costus woodsonii: closed waxy imbricate bracts and asymmetrical tubular flowers. */
import { BufferGeometry, Color, Float32BufferAttribute, Vector3 } from "three";
import { surface, type P } from "../living-things/sculpture";
import type { Model } from "../living-things/kit";
import { Sculpt } from "./sculpt";

const TAU = Math.PI * 2;
const HEAD_Y = 0.17;
const HEAD_H = 0.08;
const RED = "#82372b";
const ORANGE = "#b8602e";
const LEAF = "#2d5a34";
const RIB = "#576a2f";
const lerp = (a: P, b: P, t: number): P =>
  a.map((x, i) => x + (b[i]! - x) * t) as P;
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
function envelope(t: number) {
  return (
    0.0165 *
    Math.max(
      0,
      Math.sin(Math.PI * (0.09 + 0.91 * Math.min(0.99999, Math.max(0, t)))),
    ) **
      0.29
  );
}
/** Paint variation follows wax growth / the thin central pale streak seen on mature bracts. */
function bractColour(g: BufferGeometry, k: number, n: number, m: number) {
  const out: number[] = [],
    red = new Color(RED),
    warm = new Color("#94372c"),
    old = new Color("#857d70");
  for (let i = 0; i <= n; i++)
    for (let j = 0; j <= m; j++) {
      const u = i / n,
        v = (j / m) * 2 - 1;
      const streak =
        Math.exp(-((v / 0.065) ** 2)) *
        (0.07 + 0.025 * Math.sin(k * 3)) *
        Math.max(0, (u - 0.28) / 0.72);
      const col = red
        .clone()
        .lerp(warm, 0.1 + 0.05 * Math.sin(k * 2.4) + 0.12 * u ** 9)
        .lerp(old, streak)
        .multiplyScalar(
          (0.7 + 0.29 * Math.sin(Math.PI * Math.min(0.98, u + 0.1)) ** 0.55) *
            (0.98 + 0.025 * Math.cos(v * 4 + u * 2 + k)),
        );
      out.push(col.r, col.g, col.b);
    }
  g.setAttribute("color", new Float32BufferAttribute(out, 3));
  return g;
}

export function redFlowerRound3(): Model {
  const s = new Sculpt();
  // The smooth receptacle fills the tiny seams. It is never a separate exposed cone.
  s.put(
    surface(
      36,
      40,
      (u, v) => {
        const r = envelope(u),
          a = v * TAU;
        return [r * Math.cos(a), HEAD_Y + HEAD_H * u, r * Math.sin(a)];
      },
      true,
    ),
    RED,
  );

  s.put(
    reverse(
      surface(
        8,
        32,
        (u, v) => {
          const r = envelope(0) * u,
            a = v * TAU;
          return [
            r * Math.cos(a),
            HEAD_Y - 0.004 * (1 - u * u),
            r * Math.sin(a),
          ];
        },
        true,
      ),
    ),
    RED,
  );

  for (let k = 0; k < 24; k++) {
    const t = -0.025 + k * .041 + .002 * Math.sin(k * 2.1),
      az = k * 2.399963 + .025 * Math.sin(k * 1.9);
    const h = Math.min(
        0.0205 - 0.003 * Math.max(0, t - 0.65),
        (1 - t) * HEAD_H,
      ),
      half = 1.13 + 0.035 * Math.sin(k * 3.1);
    const face = (u: number, v: number, inside = false): P => {
      const q = v * 2 - 1;
      // Broad circular upper margins overlap the next spiral: roots and side joins remain buried.
      const y = HEAD_Y + t * HEAD_H + h * u - 0.0050 * q * q * u;
      const T = (y - HEAD_Y) / HEAD_H;
      const a = az + q * half * (0.72 + 0.28 * Math.sin(u * Math.PI / 2));
      const root = -0.0012 * (1 - u) ** 3;
      const crown =
        0.00065 * Math.sin(Math.PI * u) * (1 - 0.65 * q * q) +
        0.0018 * u ** 9 * (1 - 0.30 * q * q);
      const r = envelope(T) + root + crown - (inside ? 0.00055 : 0);
      return [Math.cos(a) * r, y, Math.sin(a) * r];
    };
    s.put(
      bractColour(
        surface(10, 12, (u, v) => face(u, v)),
        k,
        10,
        12,
      ),
      RED,
    );
    s.put(reverse(surface(5, 10, (u, v) => face(u, v, true))), RED);
    // Rounded finite thickness at the curled free margin, with the lower seam hidden underneath.
    s.put(
      surface(3, 14, (u, v) => {
        const a = face(1, v),
          b = face(1, v, true),
          p = lerp(a, b, u),
          az = Math.atan2(p[2], p[0]);
        p[0] += 0.00023 * Math.sin(Math.PI * u) * Math.cos(az);
        p[2] += 0.00023 * Math.sin(Math.PI * u) * Math.sin(az);
        return p;
      }),
      RED,
    );
    for (const edge of [0, 1])
      s.put(
        surface(8, 2, (u, v) => lerp(face(u, edge), face(u, edge, true), v)),
        RED,
      );
    s.put(
      surface(1, 10, (u, v) => lerp(face(0, v), face(0, v, true), u)),
      RED,
    );
  }

  for (const [i, f] of [
    { t: 0.42, dir: [0.15, 0.12, 1] },
    { t: 0.62, dir: [1, 0.25, -0.2] },
  ].entries()) {
    const oldD = new Vector3(...f.dir).normalize();
    const oldR = 0.019 * Math.sin(Math.PI * (0.18 + 0.72 * f.t)) + 0.003;
    // Keep the teaching/contact anchor and sunbird beak exactly in place.
    const mouth = new Vector3(
      oldD.x * (oldR * 0.7 + 0.031),
      HEAD_Y + f.t * HEAD_H + oldD.y * 0.031,
      oldD.z * (oldR * 0.7 + 0.031),
    );
    const axis = new Vector3(oldD.x, 0.53 + i * 0.1, oldD.z).normalize();
    const root = mouth.clone().addScaledVector(axis, -0.038);
    const side = new Vector3()
      .crossVectors(axis, new Vector3(0, 1, 0))
      .normalize();
    const up = new Vector3().crossVectors(side, axis).normalize();
    const point = (u: number, a: number, inside = false): P => {
      // Continuous narrow corolla tube opens into a rolled, asymmetric flared lip.
      const flare = Math.max(0, (u - .68) / .32);
      const swell = .0019 + .0014 * Math.sin(Math.PI * u * .8) + .0038 * flare * flare;
      const r = swell - (inside ? 0.00048 : 0);
      const tipClose = 1 - .10 * u ** 6;
      const lip = (.0013 * Math.cos(a * 2) + .0023 * Math.cos(a)) * u ** 8;
      const c = root
        .clone()
        .lerp(mouth, u)
        .addScaledVector(up, 0.0013 * Math.sin(Math.PI * u));
      return c
        .addScaledVector(axis, lip)
        .addScaledVector(up, Math.cos(a) * r * (1.0 + .12 * flare))
        .addScaledVector(side, Math.sin(a) * r * .83 * tipClose)
        .toArray() as P;
    };
    const outer = reverse(surface(30, 24, (u, v) => point(u, v * TAU), true));
    const p = outer.getAttribute("position"),
      cols: number[] = [],
      orange = new Color(ORANGE),
      ochre = new Color("#b8973c");
    for (let n = 0; n < p.count; n++) {
      const u = Math.floor(n / 25) / 30,
        a = ((n % 25) / 24) * TAU;
      const c = orange
        .clone()
        .lerp(ochre, Math.max(0, (u - 0.8) * 3.2) * (0.5 + 0.5 * Math.cos(a)));
      cols.push(c.r, c.g, c.b);
    }
    outer.setAttribute("color", new Float32BufferAttribute(cols, 3));
    s.put(outer, ORANGE);
    const inner = surface(12, 24, (u, v) => point(.20 + u * .80, v * TAU, true), true);
    const cavityColors: number[] = [];
    for(let row=0;row<=12;row++) for(let col=0;col<=24;col++) {
      // Baked cavity occlusion accompanies actual hollow geometry: the dark
      // throat remains legible with the engine's high environment fill.
      const c = new Color("#744518").lerp(new Color(ORANGE), (row/12)**4 * .70);
      cavityColors.push(c.r,c.g,c.b);
    }
    inner.setAttribute("color",new Float32BufferAttribute(cavityColors,3));
    s.put(inner, "#744518");
    s.put(surface(3,24,(u,v)=>lerp(point(1,v*TAU),point(1,v*TAU,true),u),true), ORANGE);
    // The open throat and finite rolled lip are geometry, never a painted end cap.
  }

  // The stem has subtle node swelling and sheathing leaf bases rather than slab attachments.
  s.line(
    [
      [0, 0.028, 0],
      [0.002, 0.09, 0.001],
      [0, HEAD_Y + 0.004, 0],
    ],
    [0.0045, 0.0042, 0.004],
    LEAF,
    1,
    18,
    36,
  );
  for (const [li, [y, deg]] of [
    [0.07, 40],
    [0.11, 175],
  ].entries()) {
    const a = (deg! * Math.PI) / 180,
      root = new Vector3(0, y!, 0);
    const D = new Vector3(Math.cos(a), 0.42, -Math.sin(a)).normalize();
    const side = new Vector3(-Math.sin(a), 0, -Math.cos(a));
    const normal = new Vector3().crossVectors(D, side).normalize();
    const L = 0.14,
      W = 0.061;
    const mid = (u: number): Vector3 =>
      root
        .clone()
        .addScaledVector(D, L * u)
        .addScaledVector(normal, 0.007 * Math.sin(Math.PI * u) - 0.007 * u * u);
    const top = (u: number, v: number, lower = false): P => {
      const q = v * 2 - 1,
        span = W * 0.5 * Math.sin(Math.PI * u) ** 0.72 * (1 + 0.1 * u);
      const camber = 0.005 * Math.sin(Math.PI * u) * (1 - q * q);
      const undulate =
        0.0007 * Math.sin(u * 15 + li * 2) * q * q * Math.sin(Math.PI * u);
      let vein = 0;
      if (!lower)
        for (let k = 0; k < 7; k++) {
          const d = (u - (0.17 + k * 0.095 + 0.1875 * Math.abs(q))) / 0.014;
          vein +=
            0.00021 *
            Math.exp(-d * d) *
            Math.max(0, 1 - q * q) ** 0.45 *
            Math.min(1, Math.abs(q) * 5);
        }
      return mid(u)
        .addScaledVector(side, q * span * (q > 0 ? 1 : 0.93))
        .addScaledVector(
          normal,
          camber + undulate + vein - (lower ? 0.0006 : 0),
        )
        .toArray() as P;
    };
    s.put(
      surface(40, 18, (u, v) => top(u, v)),
      LEAF,
      0.018,
    );
    s.put(reverse(surface(24, 10, (u, v) => top(u, v, true))), LEAF);
    for (const edge of [0, 1])
      s.put(
        surface(24, 1, (u, v) => lerp(top(u, edge), top(u, edge, true), v)),
        LEAF,
      );
    const midPath = [0, 0.2, 0.42, 0.64, 0.82, 1].map(
      (u) =>
        new Vector3(...top(u, 0.5))
          .addScaledVector(normal, 0.0002)
          .toArray() as P,
    );
    s.line(
      midPath,
      [0.001, 0.0009, 0.00072, 0.00052, 0.0003, 0.00002],
      RIB,
      0.5,
      8,
      30,
    );
    // Secondary ridges are part of the closed lamina itself: no tiny tubes to alias.
  }
  return s.finish();
}
