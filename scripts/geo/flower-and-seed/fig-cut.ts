/** Half-sectioned Ficus receptacle with an ostiole flush in its green rind. */
import { BufferGeometry, CatmullRomCurve3, Color, Float32BufferAttribute, Matrix4, Quaternion, Vector3 } from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { surface, type P } from "../living-things/sculpture";
import type { Model } from "../living-things/kit";
import { rng } from "../living-things/kit";
import { Sculpt } from "./sculpt";

const TAU = Math.PI * 2;
const mix = (a: P, b: P, t: number): P => a.map((x, i) => x + (b[i]! - x) * t) as P;
function reverse(g: BufferGeometry) {
  const index = g.index!;
  for (let i = 0; i < index.count; i += 3) {
    const a = index.getX(i); index.setX(i, index.getX(i + 1)); index.setX(i + 1, a);
  }
  g.computeVertexNormals(); return g;
}

export function figCutRound3(): Model {
  const s = new Sculpt();
  // The last three rings form a broad shoulder and a shallow depression around
  // the true opening. The fig-wasp anchor remains [0, .096, 0].
  const profile = new CatmullRomCurve3([
    [.0041, 0, 0], [.0045, .006, 0], [.0052, .012, 0], [.014, .019, 0],
    [.026, .028, 0], [.035, .041, 0], [.039, .059, 0],
    [.038, .073, 0], [.029, .085, 0], [.014, .093, 0],
    [.008, .0960, 0], [.0045, .0962, 0], [.0023, .0953, 0],
  ].map(p => new Vector3(...p)));
  const exterior = (u: number, a: number): P => {
    const q = profile.getPoint(u), fade = Math.sin(Math.PI * u);
    const r = q.x * (1 + .015 * Math.sin(a * 3 + u * 7) * fade);
    return [Math.cos(a) * r, q.y, -Math.sin(a) * r];
  };
  const parameterAtHeight = (curve: CatmullRomCurve3, y: number, ceiling = 1) => {
    let lo = 0, hi = ceiling;
    for (let i = 0; i < 24; i++) {
      const mid = (lo + hi) * .5;
      if (curve.getPoint(mid).y < y) lo = mid; else hi = mid;
    }
    return (lo + hi) * .5;
  };
  // A true longitudinal half-section: no complete front collar can project
  // over the cut plane as a separate disc. The ostiole stays in the rind.
  const outer = reverse(surface(48, 40, (u, v) => exterior(u, v * Math.PI)));
  for (const skin of [outer]) {
    const p = skin.getAttribute("position"), colors: number[] = [];
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i), y = p.getY(i), z = p.getZ(i), a = (Math.atan2(-z, x) + TAU) % TAU;
      const patches = .19 + .12 * Math.sin(y * 74 + a * 2) + .05 * Math.sin(a * 7 - y * 110);
      const c = new Color("#576a2f").lerp(new Color("#8a8a3c"), patches);
      const flecks = Math.max(0, Math.sin(a * 33 + y * 210)) ** 12 * Math.max(0, Math.sin(y * 1500 + a * 11)) ** 10;
      c.lerp(new Color("#e9e4d8"), flecks * .15).multiplyScalar(.96 + .025 * Math.sin(a * 17 + y * 83));
      colors.push(c.r, c.g, c.b);
    }
    skin.setAttribute("color", new Float32BufferAttribute(colors, 3)); s.put(skin, "#576a2f");
  }

  const cavity = new CatmullRomCurve3([
    [.0001, .025, 0], [.009, .030, 0], [.023, .042, 0], [.032, .059, 0],
    [.032, .071, 0], [.024, .080, 0], [.0073, .0938, 0], [.0028, .0948, 0],
  ].map(p => new Vector3(...p)));
  const interior = (u: number, a: number): P => {
    const q = cavity.getPoint(u), fade = Math.sin(Math.PI * u);
    // Rounded, densely papillate tissue is one continuous lining under the
    // florets' feet. Relief fades smoothly at its cut/canal joins.
    const field = .5 + .5 * Math.sin(u * 100 + Math.sin(a * 13) * .4) * Math.sin(a * 28 + u * 16);
    const bump = (.00032 + .00145 * field ** 3) * fade * Math.abs(Math.sin(a)) ** .3;
    const r = Math.max(.0001, q.x - bump);
    return [Math.cos(a) * r, q.y, -Math.sin(a) * r];
  };
  const lining = surface(48, 44, (u, v) => interior(u, v * Math.PI));
  for (const tissue of [lining]) {
    const lp = tissue.getAttribute("position"), lc: number[] = [];
    for (let i = 0; i < lp.count; i++) {
      const y = lp.getY(i), x = lp.getX(i), z = lp.getZ(i);
      // The receptacle wall where the florets stand: blush tissue, shadowed between their feet.
      const c = new Color("#b98a78").lerp(new Color("#b25f6e"), .35 + .2 * Math.sin(y * 310 + x * 117 + z * 130));
      c.multiplyScalar(.82 + .05 * Math.sin(y * 1300 + x * 500)); lc.push(c.r, c.g, c.b);
    }
    tissue.setAttribute("color", new Float32BufferAttribute(lc, 3)); s.put(tissue, "#c9bea6");
  }
  // The cut faces terminate precisely at the edges of the same half-canal.
  const boundaryAtHeight = (y: number, a: number): P => {
    if (y < .025) return [0, y, 0];
    // Match by physical height, not by differently spaced outer/inner loft
    // parameters; the narrow peduncle therefore cannot cross the cavity wall.
    const Y = Math.min(y, .0944);
    const q = cavity.getPoint(parameterAtHeight(cavity, Y));
    return [Math.cos(a) * q.x, q.y, 0];
  };
  for (const a of [0, Math.PI]) {
    const U = 96, V = 10;
    const cut = surface(U, V, (u, v) => {
      const q = exterior(u, a);
      return mix(q, boundaryAtHeight(q[1], a), v);
    });
    // The section through the receptacle: a thin green rind (it wraps the
    // short stalk), cream pulp, and a blush band streaked by the florets'
    // feet where the wall meets the cavity.
    const colors: number[] = [], rind = new Color("#576a2f"), pulp = new Color("#e9e4d8").lerp(new Color("#e4dba2"), .3);
    for (let i = 0; i <= U; i++) for (let j = 0; j <= V; j++) {
      const u = i / U, v = j / V, y = exterior(u, a)[1];
      const c = pulp.clone().multiplyScalar(.97 + .03 * Math.sin(u * 61 + v * 7));
      const feet = Math.min(1, Math.max(0, (v - .5) / .5)) ** 1.2;
      const streak = .55 + .45 * Math.sin(u * 138 + Math.sin(u * 37) * 2);
      c.lerp(new Color("#c48a76"), Math.min(1, feet * (.7 + .45 * streak)));
      if (v < .2 || y < .018) c.copy(rind).lerp(pulp, y < .018 ? 0 : Math.max(0, (v - .1) / .1));
      colors.push(c.r, c.g, c.b);
    }
    cut.setAttribute("color", new Float32BufferAttribute(colors, 3));
    s.put(a ? reverse(cut) : cut, "#c9bea6", .018);
  }
  // A half-canal joins the sectioned ostiole to the cavity, with no front
  // roof or suspended cap. Its outer rim is the same continuous receptacle.
  s.put(reverse(surface(6, 40, (u, v) => {
    const a = v * Math.PI, r = .0023 + .0005 * u, y = .0953 - .0005 * u;
    return [Math.cos(a) * r, y, -Math.sin(a) * r];
  })), "#554235");
  // The ostiole: a rosette of overlapping (imbricate) bracts closing the
  // apical pore, three tiers from the rind inward, each scale a rounded,
  // domed lobe whose tip tucks under the next. The section halves the
  // rosette, so scales stop flush at z = 0. A few inner bracts hang from the
  // canal into the cavity, as in a sectioned fig.
  const scale = (az: number, r0: number, r1: number, y0: number, drop: number, width: number, root: Color, tip: Color, hang = 0) => {
    const g = surface(10, 12, (u, v) => {
      const theta = v * TAU, half = width * Math.sin(Math.PI * (.1 + .9 * u)) ** .8;
      const lateral = Math.cos(theta) * half, r = r0 + (r1 - r0) * u;
      const dome = .00016 * Math.sin(Math.PI * u) * (1 - Math.cos(theta) ** 2);
      const y = y0 - drop * u - hang * u * u + dome + Math.sin(theta) * .00007 * Math.sin(Math.PI * (.1 + .9 * u));
      const x = Math.cos(az) * r - Math.sin(az) * lateral, z = -(Math.sin(az) * r + Math.cos(az) * lateral);
      return [x, y, Math.min(0, z)];
    }, true);
    const sp = g.getAttribute("position"), sc: number[] = [];
    for (let i = 0; i <= 10; i++) for (let j = 0; j <= 12; j++) {
      const c = root.clone().lerp(tip, (i / 10) ** 1.3);
      sc.push(c.r, c.g, c.b);
    }
    if (sc.length / 3 !== sp.count) throw new Error("bract colour count");
    g.setAttribute("color", new Float32BufferAttribute(sc, 3));
    s.put(g, "#576a2f");
  };
  const tiers = [
    { r0: .0052, y0: .09640, drop: .0008, count: 6, phase: 0 },
    { r0: .0041, y0: .09618, drop: .0007, count: 5, phase: .5 },
    { r0: .0030, y0: .09585, drop: .0006, count: 4, phase: .2 },
  ];
  for (const [t, tier] of tiers.entries()) for (let k = 0; k < tier.count; k++) {
    const az = (k + tier.phase + .5) / tier.count * Math.PI + .06 * Math.sin(k * 2.3 + t);
    const width = tier.r0 * Math.PI / tier.count * .62;
    scale(az, tier.r0, .00035, tier.y0, tier.drop, width,
      new Color("#576a2f").lerp(new Color("#8a8a3c"), .3 * t),
      new Color("#9a7350").lerp(new Color("#6e5a44"), .4 * ((k + t) % 2)));
  }
  for (let k = 0; k < 4; k++) {
    const az = (k + .5) / 4 * Math.PI;
    scale(az, .0024, .0004, .0950, .0005, .0009, new Color("#e4dcc8"), new Color("#c48a76"), .0016);
  }

  // Hundreds of florets line the wall (Ficus syconium: each floret a slender
  // pale pedicel carrying a smooth ovary, radiating into the central cavity).
  // One GPU-instanced batch: the bake writes it with EXT_mesh_gpu_instancing.
  const random = rng(51105);
  const up = new Vector3(0, 1, 0), centroid = new Vector3(0, .059, 0);
  const copies: Matrix4[] = [], tints: number[] = [];
  const cream = new Color("#e9e4d8"), blush = new Color("#e8cfc4");
  const floret = (u: number, a: number) => {
    const q = cavity.getPoint(u), base = new Vector3(Math.cos(a) * q.x, q.y, -Math.sin(a) * q.x);
    const du = new Vector3(...interior(Math.min(.99, u + .001), a)).sub(new Vector3(...interior(Math.max(.01, u - .001), a))).normalize();
    const da = new Vector3(...interior(u, a + .001)).sub(new Vector3(...interior(u, a))).normalize();
    const N = new Vector3().crossVectors(du, da).normalize();
    if (N.dot(new Vector3(-base.x, 0, -base.z)) < 0) N.negate();
    const target = new Vector3(0, q.y, 0).lerp(centroid, .5), toward = target.clone().sub(base);
    const reach = toward.length() * (.30 + random() * .20);
    const dir = N.clone().lerp(toward.normalize(), .55).normalize()
      .add(new Vector3(random() - .5, random() - .5, random() - .5).multiplyScalar(.10)).normalize();
    // Head width w; the template is FLORET_LENGTH widths long. Its axial
    // stretch stays near 1 so the ovary keeps its rounded shape.
    let width = .00150 + random() * .00040;
    const tip = base.clone().addScaledVector(dir, reach);
    // The section plane is z = 0: every head stays wholly behind it.
    if (tip.z > -.6 * width) {
      tip.z = -.6 * width;
      if (base.z > tip.z) return;
      dir.copy(tip).sub(base).normalize();
    }
    const length = tip.distanceTo(base);
    let stretch = length / (FLORET_LENGTH * width);
    if (stretch > 1.35) { width = Math.min(.0021, length / (FLORET_LENGTH * 1.35)); stretch = length / (FLORET_LENGTH * width); }
    if (stretch < .8) { width = Math.max(.0009, length / (FLORET_LENGTH * .8)); stretch = length / (FLORET_LENGTH * width); }
    if (stretch < .55) return;
    const turn = new Quaternion().setFromUnitVectors(up, dir)
      .multiply(new Quaternion().setFromAxisAngle(up, random() * TAU));
    // Pedicels differ a little in thickness and section between copies.
    copies.push(new Matrix4().compose(base, turn, new Vector3(width * (.88 + random() * .24), width * stretch, width * (.88 + random() * .24))));
    const c = new Color(1, 1, 1).lerp(random() < .5 ? blush : cream, random() * .9).multiplyScalar(.9 + random() * .1);
    tints.push(c.r, c.g, c.b);
  };
  for (let row = 0; row < 33; row++) {
    const u = cavity.getUtoTmapping(.05 + row / 32 * .85, 0), radius = cavity.getPoint(u).x;
    const count = Math.max(4, Math.round(Math.PI * radius / .0027));
    for (let k = 0; k < count; k++) {
      const a = .045 + (k + .5 * (row % 2) + (random() - .5) * .5) / count * (Math.PI - .09);
      floret(Math.min(.97, Math.max(.02, u + (random() - .5) * .012)), Math.min(Math.PI - .045, Math.max(.045, a)));
    }
  }
  const model = s.finish();
  model.extra.push({
    kind: "__instances",
    at: [0, 0, 0],
    color: "plastic",
    tint: "#ffffff",
    batches: [{ name: "fig-cut-florets", geometry: floretTemplate(), matrices: copies, colors: tints, roughness: .5 }],
  });
  return model;
}

/** Floret template length in head widths: foot at the origin, ovary tip at +Y. */
const FLORET_LENGTH = 5.4;
/** One floret in head-width units: a buried foot, a tapering pedicel, and the ovary on top. */
function floretTemplate(): BufferGeometry {
  const stalk = floretStalk().scale(.21, FLORET_LENGTH - 1.1 + .45, .24).translate(0, -.45, 0);
  const head = floretHead().translate(0, FLORET_LENGTH - 1.32, 0);
  const g = mergeGeometries([stalk, head], false)!;
  return g;
}

/** A pedicel along +Y from 0 to 1, unit radius at its foot, slightly bent: pink-cream to the ovary's pink. */
function floretStalk(): BufferGeometry {
  // Five sides, two segments: the middle ring carries a gentle bend (each
  // copy's own twist turns it a different way). Translucent pink-cream at the
  // foot, close to the wall's tone, to the ovary's pink at the top.
  const radial = 5, rings = [0, .5, 1], bend = [0, 1.7, .5], positions: number[] = [], colors: number[] = [], indices: number[] = [];
  const foot = new Color("#e4dcc8").lerp(new Color("#c48a76"), .68), top = new Color("#c48a76");
  for (const [i, t] of rings.entries()) {
    const r = 1 - .28 * t, c = foot.clone().lerp(top, t);
    for (let k = 0; k < radial; k++) {
      const az = k / radial * TAU;
      positions.push(Math.cos(az) * r + bend[i]!, t, Math.sin(az) * r);
      colors.push(c.r, c.g, c.b);
    }
  }
  for (let i = 0; i < rings.length - 1; i++) for (let k = 0; k < radial; k++) {
    const a = i * radial + k, b = i * radial + (k + 1) % radial;
    indices.push(a, a + radial, b, b, a + radial, b + radial);
  }
  return template(positions, colors, indices);
}

/** A smooth ovoid ovary, foot at the origin, 1 wide and about 1.5 tall along +Y: blush to rose at its tip. */
function floretHead(): BufferGeometry {
  const radial = 9, profile: [number, number][] = [[.55, .11], [.9, .38], [1, .7], [.86, 1.02], [.5, 1.27]];
  const foot = new Color("#c48a76"), apex = new Color("#b25f6e");
  const positions: number[] = [0, 0, 0], colors: number[] = [], indices: number[] = [];
  const shade = (y: number) => { const c = foot.clone().lerp(apex, Math.min(1, y / 1.45) ** 1.2); colors.push(c.r, c.g, c.b); };
  shade(0);
  for (const [r, y] of profile) for (let k = 0; k < radial; k++) {
    const az = k / radial * TAU;
    positions.push(Math.cos(az) * r * .5, y, Math.sin(az) * r * .5);
    shade(y);
  }
  positions.push(0, 1.45, 0); shade(1.45);
  const last = 1 + profile.length * radial;
  for (let k = 0; k < radial; k++) {
    const n = (k + 1) % radial;
    indices.push(0, 1 + k, 1 + n);
    for (let i = 0; i < profile.length - 1; i++) {
      const a = 1 + i * radial + k, b = 1 + i * radial + n;
      indices.push(a, a + radial, b, b, a + radial, b + radial);
    }
    indices.push(last - radial + k, last, last - radial + n);
  }
  return template(positions, colors, indices);
}

function template(positions: number[], colors: number[], indices: number[]): BufferGeometry {
  const g = new BufferGeometry();
  g.setAttribute("position", new Float32BufferAttribute(positions, 3));
  g.setAttribute("color", new Float32BufferAttribute(colors, 3));
  g.setIndex(indices);
  g.computeVertexNormals();
  return g;
}
