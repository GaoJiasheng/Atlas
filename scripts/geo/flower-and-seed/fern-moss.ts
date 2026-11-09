/** Round-three botanical replacement meshes. All relief is baked into geometry. */
import { BufferGeometry, Color, Float32BufferAttribute, Vector3 } from "three";
import { surface, type P } from "../living-things/sculpture";
import { rng, type Model } from "../living-things/kit";
import { Sculpt } from "./sculpt";

const TAU = Math.PI * 2;
const LEAF = "#2d5a34", OLIVE = "#576a2f", YOUNG = "#6b8e3a";
const ROOT = "#5e554e", BARK = "#6e5a44", DARK = "#555047";
const lerp = (a: number, b: number, u: number) => a + (b - a) * u;
const darken = (g: BufferGeometry, amount: number) => {
  const color = g.getAttribute("color");
  for (let i = 0; i < color.count; i++) color.setXYZ(i, color.getX(i) * amount, color.getY(i) * amount, color.getZ(i) * amount);
  return g;
};

/** Twelve mature/young fronds are retained, in an irregular rising funnel. */
export function fernRound3(): Model {
  const s = new Sculpt(), random = rng(4203);
  const nestRadius = (t: number, a: number) => .054 * Math.sin(t) * (1 + .11 * Math.sin(a * 5 + t * 2) + .065 * Math.cos(a * 11 - t * 4) + .048 * Math.sin(a * 19 + t * 15) + .023 * Math.cos(a * 17 - t * 19));
  const nestHeight = (t: number, r: number) => .024 + .022 * Math.cos(t) - .011 * Math.exp(-((r / .024) ** 2)) * Math.max(0, Math.cos(t));
  // The core is dark and deeply lobed; exposed surface is mostly woven roots.
  darken(s.put(surface(24, 48, (u, v) => {
    const t = u * Math.PI, a = v * TAU;
    const R = Math.max(0, nestRadius(t, a) - .00035 * Math.sin(t));
    const y = nestHeight(t, R);
    return [Math.cos(a) * R, y, Math.sin(a) * R];
  }, true), BARK, .06), .20);
  // Interleaved mature bases and young upright blades, not a regular radial fan.
  for (let i = 0; i < 12; i++) {
    const az = i * 2.399963 + (random() - .5) * .20;
    const inner = i >= 8, length = inner ? .205 + random() * .025 : .230 + random() * .020;
    const width = inner ? .040 + random() * .006 : .049 + random() * .007;
    const rise = inner ? .90 + random() * .10 : .63 + random() * .13;
    const radial = inner ? .27 + random() * .14 : .68 + random() * .12;
    const twist = (random() - .5) * .35, phase = random() * TAU;
    const D = new Vector3(Math.cos(az), 0, Math.sin(az)), S = new Vector3(-Math.sin(az), 0, Math.cos(az));
    const root = new Vector3().addScaledVector(D, .012 + random() * .005).add(new Vector3(0, .037 + random() * .004, 0));
    const center = (u: number) => root.clone()
      .addScaledVector(D, length * radial * (u * .14 + .86 * u * u))
      .addScaledVector(S, length * .025 * Math.sin(Math.PI * u) * Math.sin(phase))
      .add(new Vector3(0, length * (rise * u + (inner ? .02 : .23) * Math.sin(Math.PI * u)), 0));
    const frame = (u: number) => {
      const tangent = center(Math.min(1, u + .0001)).sub(center(Math.max(0, u - .0001))).normalize();
      const normal = new Vector3().crossVectors(S, tangent).normalize();
      const side = S.clone().applyAxisAngle(tangent, twist * u);
      normal.applyAxisAngle(tangent, twist * u);
      return { normal, side };
    };
    const halfWidth = (u: number) => {
      if (u < .020) return .00085 * (1 - .3 * u / .020);
      const t = (u - .020) / .980;
      // Strap-like middle, broadest beyond halfway, then an acute apical taper.
      const widths = [0, .62, .83, .94, 1, .98, .82, 0], q = t * 7, j = Math.min(6, Math.floor(q)), f = q - j;
      const A = widths[Math.max(0, j - 1)]!, B = widths[j]!, C = widths[j + 1]!, E = widths[Math.min(7, j + 2)]!;
      const span = Math.max(0, .5 * (2 * B + (C - A) * f + (2 * A - 5 * B + 4 * C - E) * f * f + (3 * B - A - 3 * C + E) * f * f * f));
      return width * .5 * span + .000595 * Math.max(0, 1 - t * 8);
    };
    const point = (u: number, q: number, shell = 0): P => {
      const {normal, side} = frame(u), h = halfWidth(u), blade = Math.sin(Math.PI * u);
      const wave = .0020 * Math.sin(u * 37 + phase + q * .65) * Math.abs(q) ** 2 * blade;
      const camber = .0016 * (1 - q * q) * blade;
      const midrib = .00115 * Math.exp(-((q * h / .0022) ** 2)) * (1 - u) * Math.min(1, u / .035);
      const veins = .00018 * Math.sin(u * 122 - Math.abs(q) * 5) * q * q * blade;
      return center(u).addScaledVector(side, q * h * (q < 0 ? .95 : 1))
        .addScaledVector(normal, camber + wave + midrib + veins + shell).toArray() as P;
    };
    // A curved two-sided lamina. A sub-millimetre closed bag let simplification
    // collapse opposite surfaces together, producing broad normal flips.
    const blade = surface(64, 18, (u, v) => point(u, 1 - v * 2));
    const p = blade.getAttribute("position"), cols: number[] = [], dark = new Color(LEAF), young = new Color(YOUNG);
    for (let j = 0; j < p.count; j++) {
      const u = Math.floor(j / 19) / 64, v = (j % 19) / 18;
      const shade = .99 + .045 * Math.sin(u * 16 + phase) + .018 * Math.cos(u * 67 + v * 8);
      const c = dark.clone().lerp(young, inner ? .16 : .035).multiplyScalar(shade);
      cols.push(c.r, c.g, c.b);
    }
    blade.setAttribute("color", new Float32BufferAttribute(cols, 3)); s.put(blade, LEAF);
    // Raised petiole/rib has exactly the blade's centreline and stops before apex.
    const rib: P[] = Array.from({length: 31}, (_, j) => point(j / 30 * .965, 0, -.00019));
    s.line(rib, rib.map((_, j) => .0008 * (1 - j / 31) ** 1.3 + .000025), i % 3 ? OLIVE : DARK, .60, 5, 40);
  }
  // Hundreds of short tangled roots hide the core, with irregular hanging ends.
  for (let i = 0; i < 310; i++) {
    const a = random() * TAU, t = .20 + random() * 2.52;
    const span = .50 + random() * 1.25, slope = (random() - .5) * 1.20, p: P[] = [];
    for (let j = 0; j < 5; j++) {
      const q = a + (j / 4 - .5) * span, tt = Math.max(.06, Math.min(3.08, t + (j / 4 - .5) * slope));
      const rr = nestRadius(tt, q) + .00012;
      const yy = nestHeight(tt, rr);
      p.push([Math.cos(q)*rr,yy+.00012*Math.sin(j*1.1+i),Math.sin(q)*rr]);
    }
    const R = .00045 + random() * .00035;
    darken(s.line(p, [R * .6, R, R * .88, R * .55, .000025], i % 6 ? BARK : DARK, 1, 3, 6), .35);
  }
  // Torn persistent scales: narrow curled, brown and attached among the roots.
  for (let i = 0; i < 38; i++) {
    const a = random() * TAU, r = .029 + random() * .020, y = .025 + random() * .017;
    darken(s.line([[Math.cos(a) * r, y, Math.sin(a) * r], [Math.cos(a + .12) * (r + .008), y - .007, Math.sin(a + .12) * (r + .008)], [Math.cos(a + .21) * (r + .005), y - .016, Math.sin(a + .21) * (r + .005)]], [.0013, .0009, .00003], i % 2 ? DARK : BARK, .25, 4, 7), .35);
  }
  return s.finish();
}

/** Dense gametophyte cushion: small curled lanceolate leaves, no exposed green lump. */
export function mossRound3(): Model {
  const s = new Sculpt(), random = rng(17103), sites: [number, number][] = [];
  const MAT_X = .0355, MAT_Z = .0272, DOME = .0085;
  const skin = (x: number, z: number) => {
    const r = Math.hypot(x / MAT_X, z / MAT_Z), crown = Math.sqrt(Math.max(0, 1 - r * r));
    return .0004 + crown * (DOME + .00075 * Math.sin(x * 195 + Math.sin(z * 260)) * Math.sin(z * 210));
  };
  // Deep-shaded undergrowth domed with the shoots, trimmed inside their foliage footprint.
  darken(s.put(surface(24, 64, (u, v) => {
    const t = u * Math.PI, a = v * TAU, r = Math.min(1, Math.sin(t) * (1 + .03 * Math.sin(a * 7 + t * 5) + .018 * Math.cos(a * 13)));
    const x = Math.cos(a) * r * MAT_X, z = Math.sin(a) * r * MAT_Z;
    return [x, Math.cos(t) > 0 ? Math.max(.0002, skin(x, z) - .0006) : .0002 - .00015 * Math.sin(t), z];
  }, true), LEAF, .06), .40);
  for (let i = 0; i < 240; i++) {
    // Best-candidate sampling spreads the rosettes evenly, leaving no bald lanes.
    let x = 0, z = 0, best = -1;
    for (let attempt = 0; attempt < 24; attempt++) {
      const a = random() * TAU, r = Math.sqrt(random());
      const X = Math.cos(a) * r * .0380, Z = Math.sin(a) * r * .0290;
      const gap = sites.reduce((m, [P, Q]) => Math.min(m, (X - P) ** 2 + (Z - Q) ** 2), Infinity);
      if (gap > best) { best = gap; x = X; z = Z; }
    }
    sites.push([x, z]);
    const y = skin(x, z), h = .0019 + random() * .0030, az = random() * TAU;
    const lean = .00035 + random() * .0006;
    // Clumps drift between deep and olive greens; only a few shoots are young.
    const patch = .5 + .5 * Math.sin(x * 142 + 1.3) * Math.sin(z * 171 + .7), young = i % 9 === 0;
    const col = young ? new Color(YOUNG) : new Color(LEAF).lerp(new Color(OLIVE), patch * .85 + random() * .15);
    const stem = (t: number) => new Vector3(x + Math.cos(az) * lean * t, y + h * t, z + Math.sin(az) * lean * t);
    // At this visual scale a triangular tapered stem is entirely behind its leaves.
    // One actual apex replaces the coincident vertices of a collapsed tube ring.
    const stemGeometry = new BufferGeometry(), stemPositions: number[] = [];
    for (let k = 0; k < 3; k++) {
      const a = k * TAU / 3;
      stemPositions.push(x + Math.cos(a) * .00018, y, z + Math.sin(a) * .00018);
    }
    stemPositions.push(...stem(1).toArray());
    stemGeometry.setAttribute("position", new Float32BufferAttribute(stemPositions, 3));
    stemGeometry.setIndex([0, 3, 1, 1, 3, 2, 2, 3, 0]); stemGeometry.computeVertexNormals();
    s.put(stemGeometry, OLIVE);
    const leaves = 5;
    for (let k = 0; k < leaves; k++) {
      const t = .10 + k / leaves * .82, a = az + k * 2.39996 + (random() - .5) * .28;
      const L = (.0038 + random() * .0012) * (1 - .15 * t), W = .0013 + random() * .0004;
      const root = stem(t), D = new Vector3(Math.cos(a), 0, Math.sin(a)), S = new Vector3(-Math.sin(a), 0, Math.cos(a));
      const lift = .10 + .48 * t + random() * .16, curl = .00018 + random() * .00026;
      // A six-point lanceolate boundary and one raised keel vertex. Actual single
      // root/tip vertices avoid dozens of locked degenerate grid-border vertices.
      const point = (u: number, q: number) => {
        const span = W * Math.sin(Math.PI * u) * (1 - .28 * u);
        return root.clone().addScaledVector(D, L * (u - .18 * u * u * u))
          .addScaledVector(S, q * span + curl * .45 * Math.sin(Math.PI * u))
          .add(new Vector3(0, L * (lift * u + .20 * Math.sin(Math.PI * u)) + curl * u ** 3 + ((1 - Math.abs(q)) * .00030 + .00012 * q * q + .00013 * q) * Math.sin(Math.PI * u), 0)).toArray() as P;
      };
      const coordinates = [[0, 0], [.28, -1], [.68, -.86], [1, 0], [.68, .86], [.28, 1], [.50, 0]] as const;
      const positions = coordinates.flatMap(([u, q]) => point(u, q));
      const triangles: number[] = [];
      for (let j = 0; j < 6; j++) triangles.push(6, (j + 1) % 6, j);
      const g = new BufferGeometry();
      g.setAttribute("position", new Float32BufferAttribute(positions, 3));
      g.setIndex(triangles); g.computeVertexNormals();
      const c = col.clone().lerp(new Color(YOUNG), .02 + .10 * t + random() * .06).multiplyScalar(.70 + random() * .26);
      const colors: number[] = [];
      for (const [u] of coordinates) {
        const light = lerp(.82, 1.07, u);
        colors.push(c.r * light, c.g * light, c.b * light);
      }
      g.setAttribute("color", new Float32BufferAttribute(colors, 3)); s.put(g, LEAF);
    }
  }
  return s.finish();
}
