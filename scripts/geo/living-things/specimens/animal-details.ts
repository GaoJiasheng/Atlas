/** Close-view anatomy for the small teaching specimens. All geometry is authored
 * here, then baked by build-parts; no downloaded models or runtime requests.
 * Modelling references (accessed 2026-11-03, development-only photographs):
 * NParks /florafaunaweb/fauna/4/8/488 (squirrel coat and eye ring),
 * NParks /florafaunaweb/fauna/2/1/212 (pangolin armour and digging claws),
 * ecologyasia.com/verts/lizards/spiny-tailed_house_gecko.htm (pad underside),
 * biosch.hku.hk/ecology/hkreptiles/lizard/Hemidactylus_frenatus.html (split pads),
 * fisheries.noaa.gov/species/hawksbill-turtle (bill and paired head scales).
 */
import { BufferGeometry, CatmullRomCurve3, Float32BufferAttribute, SphereGeometry, TubeGeometry, Vector3 } from 'three';
import { foldedLimb } from '../implicit';
import { tube as sculptTube } from '../sculpture';
import { modelGeometry } from '../bake';
import { Color } from 'three';
import { eulerMatrix, rng, type Model, type Prim, type V3 } from '../kit';

const v = (p: V3) => new Vector3(...p);
const pt = (p: Vector3): V3 => [p.x, p.y, p.z];
const mesh = (geometry: BufferGeometry, color: string, tint: string): Prim => ({ kind: '__mesh', at: [0, 0, 0], geometry, color, tint });
const mix = (a: V3, b: V3, t: number): V3 => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];

/** One indexed mesh per finish, even when hundreds of scales/hairs are present. */
class Skin {
  positions: number[] = [];
  indices: number[] = [];
  add(g: BufferGeometry) {
    const offset = this.positions.length / 3;
    const a = g.getAttribute('position');
    for (let i = 0; i < a.count; i++) this.positions.push(a.getX(i), a.getY(i), a.getZ(i));
    if (g.index) for (let i = 0; i < g.index.count; i++) this.indices.push(offset + g.index.getX(i));
    else for (let i = 0; i < a.count; i++) this.indices.push(offset + i);
    g.dispose();
  }
  grid(f: (u: number, w: number) => V3, n = 6, m = 6) {
    const offset = this.positions.length / 3;
    for (let i = 0; i <= n; i++) for (let j = 0; j <= m; j++) this.positions.push(...f(i / n, j / m));
    for (let i = 0; i < n; i++) for (let j = 0; j < m; j++) {
      const a = offset + i * (m + 1) + j, b = a + m + 1;
      this.indices.push(a, b, a + 1, b, b + 1, a + 1);
    }
  }
  tube(points: V3[], radius: number, radial = 6, segments = 8, taper = false) {
    const curve = new CatmullRomCurve3(points.map(v));
    if (!taper) { this.add(new TubeGeometry(curve, segments, radius, radial, false)); return; }
    const frames = curve.computeFrenetFrames(segments, false);
    this.grid((u, w) => {
      const a = -w * Math.PI * 2, i = Math.min(segments, Math.round(u * segments));
      const r = radius * Math.pow(1 - u, 0.72);
      return pt(curve.getPoint(u).addScaledVector(frames.normals[i]!, Math.cos(a) * r).addScaledVector(frames.binormals[i]!, Math.sin(a) * r));
    }, segments, radial);
  }
  finger(points: V3[], radius: number) {
    const curve = new CatmullRomCurve3(points.map(v)), frames = curve.computeFrenetFrames(6, false);
    this.grid((u, w) => {
      const a = -w * Math.PI * 2, i = Math.min(6, Math.round(u * 6));
      const joints = 0.76 + 0.24 * Math.cos(u * Math.PI * 3.2) ** 2;
      const end = Math.cos(Math.max(0, (u - 0.84) / 0.16) * Math.PI / 2);
      const r = radius * joints * (1 - 0.42 * u) * end;
      return pt(curve.getPoint(u).addScaledVector(frames.normals[i]!, Math.cos(a) * r).addScaledVector(frames.binormals[i]!, Math.sin(a) * r * 0.82));
    }, 6, 6);
  }
  oval(at: V3, size: V3, turn = 0, segments = 12, rings = 8) {
    const g = new SphereGeometry(1, segments, rings);
    g.scale(...size).rotateY(turn).translate(...at);
    this.add(g);
  }
  prim(color: string, tint: string, twoSided = false): Prim {
    const g = new BufferGeometry();
    g.setAttribute('position', new Float32BufferAttribute(this.positions, 3));
    g.setIndex(this.indices);
    g.computeVertexNormals();
    if (twoSided) g.userData.twoSided = true;
    return mesh(g, color, tint);
  }
}

function digits(model: Model, kind: 'frog' | 'toad' | 'gecko' | 'squirrel'): Model {
  const skin = new Skin(), dark = new Skin(), pale = new Skin(), iris = new Skin();
  const gecko = kind === 'gecko', squirrel = kind === 'squirrel';
  const feet: { at: V3; angle: number; count: number; hind: boolean }[] = [];
  for (const side of [-1, 1]) {
    if (gecko) {
      feet.push({ at: [0.022, 0.0012, side * 0.014], angle: side * 0.5, count: 5, hind: false });
      feet.push({ at: [side > 0 ? -0.012 : -0.002, 0.0012, side * 0.017], angle: side * 1.5, count: 5, hind: true });
    } else if (squirrel) {
      feet.push({ at: [0.017, 0.0009, side * 0.0062], angle: side * 0.14, count: 4, hind: false });
      feet.push({ at: [-0.001, 0.001, side * 0.0068], angle: side * 0.22, count: 5, hind: true });
    } else {
      feet.push({ at: [kind === 'frog' ? 0.0215 : 0.019, 0.001, side * (kind === 'frog' ? 0.0128 : 0.0135)], angle: side * 0.28, count: 4, hind: false });
      feet.push({ at: [kind === 'frog' ? -0.002 : 0.002, 0.001, side * (kind === 'frog' ? 0.0235 : 0.0195)], angle: side * 0.66, count: 5, hind: true });
    }
  }
  for (const foot of feet) {
    const lengths = foot.count === 4 ? [0.72, 0.97, 1, 0.77] : [0.58, 0.85, 1, 0.92, 0.64];
    const tips: V3[] = [];
    for (let d = 0; d < foot.count; d++) {
      const spread = gecko ? 1.65 : squirrel ? 0.7 : 1.35;
      const angle = foot.angle + (d / (foot.count - 1) - 0.5) * spread;
      const length = (gecko ? 0.0056 : squirrel ? 0.0041 : foot.hind ? 0.008 : 0.0058) * lengths[d]!;
      const side = Math.sign(foot.at[2]);
      const base: V3 = [foot.at[0], foot.at[1], foot.at[2] + side * (d - (foot.count - 1) / 2) * 0.00022];
      const end: V3 = [base[0] + Math.cos(angle) * length, 0.00065, base[2] + Math.sin(angle) * length];
      const middle = mix(base, end, 0.48); middle[1] += 0.00042; middle[2] += Math.sin(d * 2.1) * 0.00028;
      skin.finger([base, middle, end], squirrel ? 0.00034 : gecko ? 0.00031 : 0.00044);
      tips.push(end);
      if (kind === 'frog') skin.oval(end, [0.00082, 0.00029, 0.00071], -angle, 10, 5);
      if (gecko) {
        // Expanded distal pad, narrower phalange beyond it, curved claw; paired
        // lamellae are on the underside, split by the central longitudinal gap.
        const pad = mix(base, end, 0.73);
        skin.oval(pad, [0.00112, 0.00033, 0.00064], -angle, 10, 5);
        for (let k = 0; k < 5; k++) for (const lobe of [-1, 1]) {
          const p = mix(base, end, 0.54 + k * 0.075);
          const z = lobe * 0.00029;
          const q: V3 = [p[0] - Math.sin(angle) * z, 0.00028, p[2] + Math.cos(angle) * z];
          pale.grid((u, w) => { const dx = (u - 0.5) * 0.00022, dz = (w - 0.5) * 0.00048; return [q[0] + Math.cos(angle) * dx - Math.sin(angle) * dz, q[1] - Math.sin(Math.PI * u) * 0.00006, q[2] + Math.sin(angle) * dx + Math.cos(angle) * dz]; }, 2, 1);
        }
      }
      if (gecko || squirrel) {
        const claw: V3 = [end[0] + Math.cos(angle) * 0.00065, 0.00035, end[2] + Math.sin(angle) * 0.00065];
        pale.tube([end, [end[0] + Math.cos(angle) * 0.00038, 0.0009, end[2] + Math.sin(angle) * 0.00038], claw], 0.00012, 5, 5, true);
      }
    }
    if (kind === 'frog' && foot.hind) for (let d = 0; d < tips.length - 1; d++) {
      const a = tips[d]!, b = tips[d + 1]!;
      skin.grid((u, fraction) => {
        const w = 1 - fraction;
        const edge = mix(a, b, w), t = u * (0.62 - 0.14 * Math.sin(Math.PI * w));
        const p = mix(foot.at, edge, t); p[1] = 0.0008 + Math.sin(Math.PI * u) * 0.00018; return p;
      }, 3, 4);
    }
  }
  let extra = model.extra;
  if (kind === 'frog') {
    extra = extra.filter(p => !(p.kind === 'lathe' && p.at[1] < 0.002) && !(p.kind === 'sweep' && p.color === 'eye' && p.radius === 0.0007));
    const a = 0.017324, b = 0.009028, c = 0.011224, angle = 16 * Math.PI / 180, ca = Math.cos(angle), sa = Math.sin(angle);
    for (const z0 of [-0.0072, -0.0028, 0.0028, 0.0072]) dark.grid((u, w) => {
      const x = -0.0127 + u * 0.024, z = z0 + Math.sin(u * Math.PI * 1.3) * 0.00025 + (0.5 - w) * 0.00065;
      const A = sa * sa / (a * a) + ca * ca / (b * b), B = 2 * x * ca * sa * (1 / (a * a) - 1 / (b * b)), C = x * x * (ca * ca / (a * a) + sa * sa / (b * b)) + z * z / (c * c) - 1;
      return [x, 0.0125 + (-B + Math.sqrt(Math.max(0, B * B - 4 * A * C))) / (2 * A) + 0.0002, z];
    }, 20, 1);
  }
  if (gecko) extra = extra.filter(p => !(p.kind === 'lathe' && p.at[1] < 0.002));
  if (kind === 'toad') extra = extra.map((p, i) => p.kind === 'lathe' && i >= 1 && i <= 10 ? { ...p, scale: [0.50 + (i % 3) * 0.14, 0.30 + (i % 4) * 0.11, 0.46 + (i % 2) * 0.19] } : p);
  if (kind === 'frog' || kind === 'toad') for (const side of [-1, 1]) {
    // Tympanum behind each eye, upper eyelid, gently bowed jaw and nostrils.
    skin.oval([0.0118, 0.0183, side * 0.0082], [0.0017, 0.00165, 0.0004]);
    dark.tube([[0.023, 0.0142, side * 0.0038], [0.0205, 0.0136, side * 0.0074], [0.012, 0.013, side * 0.009]], 0.00019, 6, 9);
    dark.oval([0.023, 0.018, side * 0.0033], [0.00031, 0.00017, 0.00023]);
    const eyeY = kind === 'frog' ? 0.0218 : 0.0185, eyeX = kind === 'frog' ? 0.0175 : 0.0192;
    const eyeZ = kind === 'frog' ? 0.0066 : 0.0062, eyeR = kind === 'frog' ? 0.0034 : 0.003;
    const out = new Vector3(0.50, 0.37, side * 0.78).normalize(), horizontal = new Vector3(1,0,0).addScaledVector(out,-out.x).normalize(), vertical = new Vector3().crossVectors(out, horizontal).normalize();
    iris.grid((u, r) => { const a = -u * Math.PI * 2; return pt(new Vector3(eyeX, eyeY, side * eyeZ).addScaledVector(out, eyeR + 0.00025 - 0.00105 * r * r).addScaledVector(horizontal, Math.cos(a) * r * 0.00265).addScaledVector(vertical, Math.sin(a) * r * 0.00255)); }, 10, 2);
    dark.grid((u, r) => { const a = -u * Math.PI * 2; return pt(new Vector3(eyeX, eyeY, side * eyeZ).addScaledVector(out, eyeR + 0.00031 - 0.00012 * r * r).addScaledVector(horizontal, Math.cos(a) * r * 0.00135).addScaledVector(vertical, Math.sin(a) * r * 0.00039)); }, 10, 2);
    skin.tube([[eyeX - 0.003, eyeY + 0.001, side * 0.0067], [eyeX, eyeY + 0.003, side * 0.0078], [eyeX + 0.0026, eyeY + 0.0011, side * 0.0068]], 0.00036, 7, 10);
  }
  if (gecko) for (const side of [-1, 1]) {
    const out=new Vector3(.18,.42,side*.89).normalize(),h=new Vector3(1,0,0).addScaledVector(out,-out.x).normalize(),vertical=new Vector3().crossVectors(out,h).normalize();
    const eye=new Vector3(.0235,.0075,side*.003);
    iris.grid((u,r)=>{const a=-u*Math.PI*2;return pt(eye.clone().addScaledVector(out,.00223-.0009*r*r).addScaledVector(h,Math.cos(a)*r*.0018).addScaledVector(vertical,Math.sin(a)*r*.0018));},24,5);
    dark.grid((u,r)=>{const a=-u*Math.PI*2;return pt(eye.clone().addScaledVector(out,.0023-.00008*r*r).addScaledVector(h,Math.cos(a)*r*.00025).addScaledVector(vertical,Math.sin(a)*r*.00145));},20,3);
    const lid:V3[]=Array.from({length:14},(_,i)=>{const a=.08+(Math.PI-.16)*i/13;return pt(eye.clone().addScaledVector(h,Math.cos(a)*.0022).addScaledVector(vertical,Math.sin(a)*.0022).addScaledVector(out,.0007));});skin.tube(lid,.00028,10,20);

    dark.tube([[0.028, 0.0049, side * 0.0017], [0.024, 0.0038, side * 0.0045], [0.018, 0.0034, side * 0.004]], 0.00013, 5, 10);
    dark.oval([0.024, 0.0089, side * 0.0042], [0.0002, 0.00115, 0.00018]);
  }
  const tint = kind === 'frog' ? '#86663a' : kind === 'toad' ? '#6b5c3e' : gecko ? '#d4c1a2' : '#6f5237';
  return { primitive: model.primitive, extra: [...extra, skin.prim(gecko ? 'scales' : squirrel ? 'fabric' : 'enamel', tint), dark.prim('eye', '#302c20'), pale.prim('chitin', '#c1b095'), iris.prim('enamel', '#ab8c48')] };
}

function scaleArmour(model: Model): Model {
  const scales = [new Skin(), new Skin(), new Skin()], claws = new Skin(), lines = new Skin();
  const path = [[0.031, 0.0065, 0], [0.024, 0.0095, 0], [0.016, 0.0135, 0], [0.004, 0.017, 0], [-0.008, 0.0165, 0], [-0.017, 0.012, 0], [-0.023, 0.0065, 0.004], [-0.024, 0.0045, 0.014], [-0.017, 0.0035, 0.022], [-0.008, 0.003, 0.025]] as V3[];
  const radii = [0.0016, 0.0042, 0.0068, 0.0098, 0.0098, 0.0076, 0.0058, 0.0044, 0.003, 0.0015];
  const curve = new CatmullRomCurve3(path.map(v));
  const random = rng(2303);
  const surface = (t: number, a: number, lift: number): V3 => {
    t = Math.max(0.015, Math.min(0.995, t));
    const p = curve.getPoint(t), tangent = curve.getTangent(t).normalize();
    const side = new Vector3().crossVectors(tangent, new Vector3(0, 1, 0)).normalize();
    const up = new Vector3().crossVectors(side, tangent).normalize();
    const j = t * 9, k = Math.min(8, Math.floor(j)), r = radii[k]! + (radii[k + 1]! - radii[k]!) * (j - k);
    return pt(p.addScaledVector(up, (r * 0.82 + lift) * Math.cos(a)).addScaledVector(side, (r + lift) * Math.sin(a)));
  };
  for (let row = 0; row < 30; row++) {
    const t = 0.095 + row * 0.029;
    const n = t > 0.65 ? 5 : 9;
    for (let col = 0; col < n; col++) {
      const a = -1.63 + (col + 0.5 + (row % 2 ? 0.34 : 0)) / n * 3.26;
      const width = 3.26 / n * (0.92 + random() * 0.12), length = (t > 0.65 ? 0.048 : 0.057) * (0.9 + random() * 0.2);
      const bucket = scales[(row + col * 2) % 3]!;
      // Broad rounded base, a raised median keel, and a rearward pointed free
      // edge overlapping the next row. No separate spherical "scale beads".
      bucket.grid((u, w) => {
        const half = (0.76 + 0.25 * Math.sin(Math.PI * u)) * Math.pow(1 - u, 0.36);
        const angle = a + (0.5 - w) * width * half;
        const lift = 0.00016 + Math.sin(Math.PI * u) * 0.00062 + u * 0.00036 + Math.sin(Math.PI * w) * 0.00018;
        return surface(t + (u - 0.35) * length, angle, lift);
      }, 4, 2);
    }
  }
  for (const side of [-1, 1]) for (const x of [0.019, -0.0055]) for (let d = 0; d < 5; d++) {
    const z = side * (x > 0 ? 0.0092 : 0.0098) + (d - 2) * 0.00095;
    const l = (d === 2 ? 0.0042 : d === 1 || d === 3 ? 0.0032 : 0.0022) * (x < 0 ? 0.72 : 1);
    claws.tube([[x, 0.0012, z], [x + l * 0.4, 0.0013, z], [x + l, 0.00035, z + 0.00016 * side]], d === 2 ? 0.00042 : 0.00028, 6, 6, true);
  }
  lines.tube([[0.0304, 0.0063, 0.001], [0.0282, 0.0061, 0.002], [0.0244, 0.0074, 0.0036]], 0.00017, 5, 10);
  return { primitive: { ...model.primitive, rings: undefined }, extra: [...model.extra, ...scales.map((s, i) => s.prim('chitin', ['#8a693e', '#765633', '#9b784c'][i]!)), claws.prim('chitin', '#c9b78b'), lines.prim('eye', '#34291d')] };
}

/** Voronoi scute borders partition the actual carapace surface; tiles abut
 * rather than floating as blobs over an unsculpted dome. */
function turtle(model: Model): Model {
  const shell = new Skin(), scutes = [new Skin(), new Skin(), new Skin()], beak = new Skin(), seams = new Skin(), headScales = new Skin();
  const rx = 0.0274, rz = 0.0209;
  const top = (x: number, z: number) => 0.0052 + 0.0132 * Math.pow(Math.max(0, 1 - (x / rx) ** 2 - (z / rz) ** 2), 0.62);
  shell.grid((u, w) => {
    const a = u * Math.PI * 2, r = w, scallop = 1 - 0.012 * Math.pow(Math.sin(a * 11), 4) * r ** 10;
    const x = Math.cos(a) * rx * r * scallop, z = Math.sin(a) * rz * r * scallop;
    return [x, top(x, z), z];
  }, 48, 16);
  shell.grid((u, w) => {
    const a = -u * Math.PI * 2, r = w;
    return [Math.cos(a) * rx * r, 0.0035 - 0.0006 * (1 - r * r), Math.sin(a) * rz * r];
  }, 48, 8);
  shell.grid((u, w) => {
    const a = -u * Math.PI * 2, scallop = 1 - 0.012 * Math.pow(Math.sin(a * 11), 4);
    const r = 1 - 0.005 * Math.sin(w * Math.PI);
    const x = Math.cos(a) * rx * r * scallop, z = Math.sin(a) * rz * r * scallop;
    return [x, 0.0035 + w * (top(x, z) - 0.0035), z];
  }, 48, 2);
  const seeds: [number, number][] = [];
  for (let i = 0; i < 5; i++) seeds.push([-0.019 + i * 0.0096, Math.sin(i * 2.4) * 0.00045]);
  for (const side of [-1, 1]) for (let i = 0; i < 4; i++) seeds.push([-0.015 + i * 0.0103, side * (0.0103 + Math.sin(i * 1.1) * 0.0012)]);
  for (let i = 0; i < 22; i++) { const a = i / 22 * Math.PI * 2; seeds.push([Math.cos(a) * rx * 0.95, Math.sin(a) * rz * 0.95]); }
  for (let k = 0; k < seeds.length; k++) {
    const seed = seeds[k]!;
    let poly: [number, number][] = Array.from({ length: 100 }, (_, i) => { const a = i / 100 * Math.PI * 2; return [Math.cos(a) * rx, Math.sin(a) * rz]; });
    for (let j = 0; j < seeds.length; j++) if (j !== k) {
      const other = seeds[j]!, nx = other[0] - seed[0], nz = other[1] - seed[1], threshold = (other[0] ** 2 + other[1] ** 2 - seed[0] ** 2 - seed[1] ** 2) / 2;
      const out: [number, number][] = [];
      for (let i = 0; i < poly.length; i++) {
        const a = poly[i]!, b = poly[(i + 1) % poly.length]!, da = a[0] * nx + a[1] * nz - threshold, db = b[0] * nx + b[1] * nz - threshold;
        if (da <= 0) out.push(a);
        if ((da <= 0) !== (db <= 0)) { const f = da / (da - db); out.push([a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f]); }
      }
      poly = out;
    }
    if (poly.length < 3) continue;
    for (let i = 0; i < poly.length; i++) {
      const a = poly[i]!, b = poly[(i + 1) % poly.length]!;
      scutes[k % 3]!.grid((u, fraction) => {
        const w = 1 - fraction;
        const x = seed[0] + ((a[0] + (b[0] - a[0]) * w) - seed[0]) * u * 0.985;
        const z = seed[1] + ((a[1] + (b[1] - a[1]) * w) - seed[1]) * u * 0.985;
        return [x, top(x, z) + 0.00013 + 0.00024 * (1 - u) + (k < 13 ? 0.0002 * Math.sin(Math.PI * u) : 0), z];
      }, 2, 2);
    }
  }
  // Hawk-like upper jaw ends in a downturned hook, over a smaller lower jaw.
  const bill = new CatmullRomCurve3([[0.034, 0.0073, 0], [0.038, 0.0072, 0], [0.0405, 0.0063, 0], [0.0408, 0.0048, 0]].map(p => new Vector3(p[0]!, p[1]!, p[2]!)));
  const billWidths = [0.0029, 0.0022, 0.0011, 0], billHeights = [0.0018, 0.0016, 0.001, 0];
  beak.grid((u, w) => {
    const t = u * 3, k = Math.min(2, Math.floor(t)), f = t - k, a = -w * Math.PI * 2, q = bill.getPoint(u);
    return [q.x, q.y + Math.cos(a) * (billHeights[k]! + (billHeights[k + 1]! - billHeights[k]!) * f), Math.sin(a) * (billWidths[k]! + (billWidths[k + 1]! - billWidths[k]!) * f)];
  }, 16, 12);
  for (const x0 of [0.0325, 0.0352]) for (const side of [-1, 1]) headScales.grid((u, w) => {
    const x = x0 + (u - 0.5) * 0.0025, z = side * 0.00105 + (0.5 - w) * 0.0019;
    return [x, 0.0072 + 0.004428 * Math.sqrt(Math.max(0, 1 - ((x - 0.0305) / 0.0081) ** 2 - (z / 0.004752) ** 2)) + 0.00011, z];
  }, 2, 2);
  seams.tube([[0.0395, 0.0056, 0.0013], [0.0364, 0.0057, 0.0022], [0.0327, 0.0053, 0.0037]], 0.00017, 6, 9);
  const retained = model.extra.filter((p, i) => i >= 10 && p.kind !== 'cone').map(p => p.kind === 'extrude' ? sculptFin(p) : p);
  return { primitive: shell.prim('chitin', '#5c3e20'), extra: [...retained, ...scutes.map((s, i) => { const p = s.prim('chitin', ['#a37735', '#85572a', '#bd914c'][i]!), g = p.geometry as BufferGeometry, pos = g.getAttribute('position'), n = g.getAttribute('normal'); for (let j = 0; j < pos.count; j++) { const x = pos.getX(j), z = pos.getZ(j), f = Math.pow(Math.max(0.005, 1 - (x/rx)**2 - (z/rz)**2), -0.38), norm = new Vector3(0.016368*x/rx**2*f, 1, 0.016368*z/rz**2*f).normalize(); n.setXYZ(j, norm.x, norm.y, norm.z); } return p; }), beak.prim('chitin', '#8d7046'), seams.prim('chitin', '#46321d'), headScales.prim('chitin', '#99713b')] };
}

function squirrel(model: Model): Model {
  const fur = [new Skin(), new Skin()], face = new Skin(), ankles = new Skin(), cream = new Skin(), stripe = new Skin(), belly = new Skin();
  const random = rng(2011);
  // Fine tapered, swept ribbons follow the coat direction; tail hairs fan
  // sideways from its curved axis instead of making a uniformly smooth tube.
  const hair = (base: V3, direction: V3, width: number, shade: number) => {
    const d = v(direction), n = new Vector3(0, 0, 1).cross(d).normalize().multiplyScalar(width);
    fur[shade]!.grid((u, w) => pt(v(base).addScaledVector(d, u).addScaledVector(n, (w - 0.5) * 2 * (1 - u)).add(new Vector3(0, Math.sin(Math.PI * u) * width, 0))), 1, 1);
  };
  for (let i = 0; i < 400; i++) {
    const x = -0.016 + random() * 0.032, a = random() * Math.PI * 2, f = Math.sqrt(Math.max(0, 1 - (x / 0.018) ** 2));
    const p: V3 = [x, 0.0165 + Math.sin(a) * 0.0108 * f, Math.cos(a) * 0.0099 * f];
    hair(p, [-0.0018 - random() * 0.001, Math.sin(a) * 0.0004, Math.cos(a) * 0.0005], 0.00018, i % 2);
  }
  const tail = new CatmullRomCurve3([[-0.014, 0.016, 0], [-0.024, 0.022, 0], [-0.0285, 0.036, 0], [-0.0245, 0.05, 0], [-0.0145, 0.0585, 0], [-0.0045, 0.057, 0]].map(p => new Vector3(p[0]!, p[1]!, p[2]!)));
  const radii = [0.003, 0.0078, 0.0108, 0.0108, 0.0086, 0.0035];
  for (let i = 0; i < 250; i++) {
    const t = 0.06 + random() * 0.92, a = random() * Math.PI * 2, p = tail.getPoint(t), tangent = tail.getTangent(t), side = new Vector3(0, 0, 1), out = new Vector3().crossVectors(tangent, side).normalize();
    const j = t * 5, k = Math.min(4, Math.floor(j)), r = radii[k]! + (radii[k + 1]! - radii[k]!) * (j - k);
    p.addScaledVector(out, Math.cos(a) * r).addScaledVector(side, Math.sin(a) * r * 0.66);
    const direction = tangent.multiplyScalar(0.001 + random() * 0.0015).addScaledVector(out, Math.cos(a) * 0.0019).addScaledVector(side, Math.sin(a) * 0.0018);
    hair(pt(p), pt(direction), 0.00015 + random() * 0.0001, i % 2);
  }
  face.oval([0.0322, 0.023, 0], [0.0009, 0.00065, 0.0009]);
  for (const side of [-1, 1]) {
    face.tube([[0.0308, 0.0219, side * 0.001], [0.029, 0.0213, side * 0.0025], [0.026, 0.0216, side * 0.003]], 0.00016, 5, 8);
    for (let i = 0; i < 3; i++) face.tube([[0.0295, 0.0225, side * 0.002], [0.032, 0.023 + i * 0.0006, side * 0.005], [0.035, 0.022 + i * 0.0014, side * 0.008]], 0.000055, 4, 6);
  }
  const ears = new Skin();
  for (const side of [-1, 1]) ears.grid((u, w) => {
    const a = -side * u * Math.PI * 2, r = w;
    return [0.018 + Math.cos(a) * 0.0023 * r, 0.0335 + Math.sin(a) * 0.0035 * r, side * (0.0042 + 0.0014 * r * r + 0.00015 * Math.sin(a))];
  }, 16, 4);
  const bodySurface = (x: number, y: number, side: number): V3 => {
    const z = side * (0.009912 * Math.sqrt(Math.max(0, 1 - (x / 0.0177) ** 2 - (y / 0.010856) ** 2)) + 0.00014);
    const a = 12 * Math.PI / 180;
    return [x * Math.cos(a) - y * Math.sin(a), 0.0165 + x * Math.sin(a) + y * Math.cos(a), z];
  };
  for (const side of [-1, 1]) {
    for (const [finish, y, width] of [[cream, 0.0025, 0.0012], [stripe, 0.00065, 0.00095]] as const) finish.grid((u, w) => bodySurface(-0.011 + 0.024 * u, y + side * (w - 0.5) * width * Math.pow(Math.sin(Math.PI * u), 0.55), side), 16, 2);
    cream.grid((u, w) => {
      const a = -side * u * Math.PI * 2, r = 0.00185 + (w - 0.5) * 0.0003;
      return [0.0255 + Math.cos(a) * r, 0.027 + Math.sin(a) * r, side * (0.00615 + Math.sin(w * Math.PI) * 0.00015)];
    }, 16, 2);
  }
  belly.grid((u, w) => {
    const x = -0.012 + u * 0.025, angle = Math.PI * (1.38 - w * 0.76), f = Math.sqrt(Math.max(0, 1 - (x / 0.0177) ** 2)), y = Math.cos(angle) * 0.01095 * f, z = Math.sin(angle) * 0.01002 * f, a = 12 * Math.PI / 180;
    return [x * Math.cos(a) - y * Math.sin(a), 0.0165 + x * Math.sin(a) + y * Math.cos(a), z];
  }, 16, 4);
  for (const side of [-1, 1]) ankles.tube([[-0.009, 0.010, side * 0.0068], [-0.010, 0.006, side * 0.0074], [-0.004, 0.0017, side * 0.0068]], 0.0015, 10, 12);
  const withDigits = digits({ primitive: model.primitive, extra: model.extra.filter(p => p.kind !== 'cone') }, 'squirrel');
  return { primitive: withDigits.primitive, extra: [...withDigits.extra, fur[0]!.prim('fabric', '#96734b', true), fur[1]!.prim('fabric', '#4d3b28', true), face.prim('eye', '#2c251e'), ears.prim('fabric', '#ad8261', true), ankles.prim('fabric', '#6f5237'), cream.prim('fabric', '#d1c2a0'), stripe.prim('fabric', '#30291e'), belly.prim('fabric', '#a66e3e')] };
}

function sculptFin(p: Prim): Prim {
  const outline = p.shape as [number, number][], rotation = eulerMatrix((p.rotation as V3) ?? [0, 0, 0]);
  const center = outline.reduce((s, a) => [s[0]! + a[0] / outline.length, s[1]! + a[1] / outline.length], [0, 0]);
  const fin = new Skin();
  for (let k = 0; k < outline.length; k++) {
    const a = outline[k]!, b = outline[(k + 1) % outline.length]!;
    fin.grid((u, w) => {
      const x = center[0]! + (a[0] + (b[0] - a[0]) * w - center[0]!) * u;
      const y = center[1]! + (a[1] + (b[1] - a[1]) * w - center[1]!) * u;
      const z = 0.0009 * (1 - u * u) + Math.sin(x * 180 + y * 230) * 0.00028 * u;
      return [p.at[0] + rotation[0]![0]! * x + rotation[0]![1]! * y + rotation[0]![2]! * z, p.at[1] + rotation[1]![0]! * x + rotation[1]![1]! * y + rotation[1]![2]! * z, p.at[2] + rotation[2]![0]! * x + rotation[2]![1]! * y + rotation[2]![2]! * z];
    }, 3, 2);
  }
  return fin.prim(p.color as string, p.tint as string, true);
}

function fins(model: Model, id: string): Model {
  const rays = new Skin(), features = new Skin();
  const extra: Prim[] = [];
  for (const p of model.extra) {
    if (p.kind !== 'extrude') { extra.push(p); continue; }
    const outline = p.shape as [number, number][], rotation = eulerMatrix((p.rotation as V3) ?? [0, 0, 0]);
    const trans = (x: number, y: number, z: number): V3 => [p.at[0] + rotation[0]![0]! * x + rotation[0]![1]! * y + rotation[0]![2]! * z, p.at[1] + rotation[1]![0]! * x + rotation[1]![1]! * y + rotation[1]![2]! * z, p.at[2] + rotation[2]![0]! * x + rotation[2]![1]! * y + rotation[2]![2]! * z];
    const fin = new Skin();
    const center: [number, number] = [outline.reduce((s, a) => s + a[0], 0) / outline.length, outline.reduce((s, a) => s + a[1], 0) / outline.length];
    for (let k = 0; k < outline.length; k++) {
      const a = outline[k]!, b = outline[(k + 1) % outline.length]!;
      fin.grid((u, w) => {
        const x = center[0] + ((a[0] + (b[0] - a[0]) * w) - center[0]) * u;
        const y = center[1] + ((a[1] + (b[1] - a[1]) * w) - center[1]) * u;
        const bulge = 0.00062 * (1 - u * u) + Math.sin(x * 180 + y * 230) * 0.00026 * u;
        return trans(x, y, bulge);
      }, 3, 2);
      if (id !== 'shark') {
        const l = Math.hypot(b[0] - a[0], b[1] - a[1]), n = Math.max(1, Math.ceil(l / 0.0024));
        for (let j = 0; j < n; j++) {
          const t = (j + 0.5) / n, x = a[0] + (b[0] - a[0]) * t, y = a[1] + (b[1] - a[1]) * t;
          const rootX = outline[0]![0] * 0.7 + center[0] * 0.3, rootY = outline[0]![1] * 0.7 + center[1] * 0.3;
          rays.tube([trans(rootX, rootY, 0.00025), trans((rootX + x) * 0.5 + 0.0003, (rootY + y) * 0.5, 0.00066), trans(x, y, 0.00023)], 0.000075, 4, 4);
        }
      }
    }
    extra.push(fin.prim(p.color as string, p.tint as string, true));
  }
  const head = id === 'guppy' ? [0.018, 0.0154, 0.0017] : id === 'mudskipper' ? [0.024, 0.0088, 0.0035] : id === 'snakehead' ? [0.03, 0.0104, 0.0025] : [0.029, 0.0084, 0.0028];
  for (const side of [-1, 1]) {
    const [x, y, z] = head as V3;
    features.tube([[x!, y!, side * z! * 0.25], [x! - 0.0023, y! - 0.00035, side * z!], [x! - 0.005, y! - 0.0001, side * z! * 1.2]], id === 'guppy' ? 0.00012 : 0.00018, 5, 10);
    if (id !== 'shark') {
      const gx = id === 'guppy' ? 0.0088 : id === 'mudskipper' ? 0.012 : 0.018;
      const gy = id === 'guppy' ? 0.016 : id === 'mudskipper' ? 0.010 : 0.0113, gz = id === 'guppy' ? 0.0023 : id === 'mudskipper' ? 0.005 : 0.0046;
      features.tube([[gx + 0.002, gy + 0.0032, side * gz * 0.72], [gx, gy + 0.001, side * gz * 1.03], [gx - 0.0004, gy - 0.0018, side * gz]], 0.00014, 5, 12);
    }
  }
  return { primitive: model.primitive, extra: [...extra, rays.prim('chitin', id === 'guppy' ? '#a65329' : '#655946'), features.prim('eye', '#322e26')] };
}

function insect(model: Model, id: string): Model {
  const detail = new Skin(), light = new Skin(), joints = new Skin();
  let extra = model.extra;
  if (id === 'grasshopper') for (const side of [-1, 1]) for (let row = 0; row < 2; row++) for (let i = 0; i < 10; i++) {
    const t = (i + 0.7) / 11, x = -0.024 + t * 0.025, y = 0.031 - t * 0.0298, z = side * (0.0115 + t * 0.004);
    detail.tube([[x, y, z], [x - 0.001, y + 0.0002, z + side * (row ? -0.0008 : 0.0008)], [x - 0.0018, y + 0.0011, z + side * (row ? -0.0013 : 0.0013)]], 0.00014, 4, 4);
  }
  if (id === 'beetle') for (const side of [-1, 1]) for (let line = 0; line < 6; line++) {
    const a = (line + 0.7) / 7 * Math.PI * 0.45;
    const points: V3[] = [];
    for (let i = 0; i <= 12; i++) { const x = -0.022 + i / 12 * 0.036, r = Math.sqrt(Math.max(0, 1 - ((x + 0.003) / 0.0216) ** 2)); points.push([x, 0.0115 + Math.cos(a) * 0.0103 * r, side * Math.sin(a) * 0.0158 * r]); }
    detail.tube(points, 0.000095, 4, 14);
  }
  if (id === 'spider') {
    // Generic long-legged spider: eight small dorsal eyes in two rows, with
    // the narrow pedicel exposed between cephalothorax and abdomen.
    extra = model.extra.filter(p => !(p.color === 'eye' && p.kind === 'lathe')).map((p, i) => i === 0 ? { ...p, at: [-0.019, 0.0115, 0] as V3, scale: [1.05, 0.82, 0.95] } : p);
    joints.tube([[-0.0055, 0.0092, 0], [-0.007, 0.01, 0], [-0.009, 0.0113, 0]], 0.0011, 12, 10);
    for (let row = 0; row < 2; row++) for (const z of [-0.00315, -0.00115, 0.00115, 0.00315]) {
      const x = row ? 0.0068 : 0.0086, y = 0.0095 + 0.004464 * Math.sqrt(Math.max(0, 1 - ((x - 0.0025) / 0.00828) ** 2 - (z / 0.00684) ** 2)) + 0.00019, r = Math.abs(z) < 0.002 ? 0.00058 : 0.00048;
      detail.oval([x, y, z], [r, r, r], 0, 16, 8);
    }
    for (const side of [-1, 1]) {
      joints.oval([0.0098, 0.0087, side * 0.0017], [0.0017, 0.0012, 0.0012]);
      detail.tube([[0.011, 0.008, side * 0.002], [0.0125, 0.0065, side * 0.0022], [0.0118, 0.0058, side * 0.0012]], 0.00042, 8, 10, true);
    }
    const random = rng(1717);
    for (let i = 0; i < 90; i++) {
      const a = random() * Math.PI * 2, b = random() * Math.PI;
      const p: V3 = [-0.019 + Math.cos(b) * 0.0111, 0.0115 + Math.sin(b) * Math.sin(a) * 0.0087, Math.sin(b) * Math.cos(a) * 0.0101];
      light.tube([p, [p[0] - 0.0003, p[1] + Math.sin(a) * 0.0005, p[2] + Math.cos(a) * 0.0005]], 0.000035, 4, 2, true);
    }
    for (const side of [-1, 1]) for (const [i, deg] of [42, 78, 108, 142].entries()) {
      const a = deg * Math.PI / 180, reach = i === 0 || i === 3 ? 0.031 : 0.027;
      const points: V3[] = [[0.002 + Math.cos(a) * 0.005, 0.0095, side * Math.sin(a) * 0.005], [Math.cos(a) * reach * 0.5, 0.022 - i * 0.0006, side * Math.sin(a) * reach * 0.5], [Math.cos(a) * reach * 0.85, 0.008, side * Math.sin(a) * reach * 0.85], [Math.cos(a) * reach, 0.0008, side * Math.sin(a) * reach]];
      joints.oval(points[1]!, [0.00095, 0.0012, 0.00095], 0, 12, 6);
      const curve = new CatmullRomCurve3(points.map(v));
      for (let j = 0; j < 12; j++) {
        const t = 0.12 + j / 12 * 0.77, angle = random() * Math.PI * 2, tangent = curve.getTangent(t), normal = new Vector3().crossVectors(tangent, new Vector3(0, 0, 1)).normalize(), binormal = new Vector3().crossVectors(tangent, normal).normalize(), out = normal.multiplyScalar(Math.cos(angle)).addScaledVector(binormal, Math.sin(angle));
        const p = curve.getPoint(t).addScaledVector(out, 0.00115 - t * 0.0006), end = p.clone().addScaledVector(out, 0.00035 + random() * 0.00045).addScaledVector(tangent, -0.0002);
        light.tube([pt(p), pt(end)], 0.000025 + random() * 0.00002, 4, 2, true);
      }
    }
  }
  return { primitive: model.primitive, extra: [...extra, detail.prim(id === 'spider' ? 'eye' : 'chitin', id === 'grasshopper' ? '#505b2d' : '#1e251d'), light.prim('fabric', '#947556'), joints.prim('chitin', '#6a4a31')] };
}

function pythonPattern(model: Model): Model {
  const marks = new Skin(), jaw = new Skin();
  const random = rng(3131);
  const points = (model.primitive.path as V3[]).map(p => v(p).add(v(model.primitive.at)));
  const curve = new CatmullRomCurve3(points), radius = model.primitive.radius as number[];
  const onSkin = (t: number, angle: number): V3 => {
    const j = t * (radius.length - 1), k = Math.min(radius.length - 2, Math.floor(j));
    const r = radius[k]! + (radius[k + 1]! - radius[k]!) * (j - k);
    const tangent = curve.getTangent(t), side = new Vector3().crossVectors(tangent, new Vector3(0, 1, 0)).normalize();
    const up = new Vector3().crossVectors(side, tangent).normalize();
    return pt(curve.getPoint(t).addScaledVector(up, (r + 0.00025) * Math.cos(angle)).addScaledVector(side, (r + 0.00025) * Math.sin(angle)));
  };
  for (let i = 0; i < 32; i++) {
    const t = 0.095 + i * 0.0267 + Math.sin(i * 2.31) * 0.0014, a = Math.sin(i * 1.41) * 0.14, halfT = 0.0106 + random() * 0.003, halfA = 1.12 + random() * 0.24;
    const corners = [[t - halfT, a], [t - 0.001 + random() * 0.002, a + halfA], [t + halfT, a + (random() - 0.5) * 0.12], [t + 0.001 - random() * 0.002, a - halfA], [t - halfT, a]];
    // Project every point of each marking onto the curved skin. Connecting a
    // few corner points by a free-space spline cuts chords through the body.
    marks.grid((u, w) => {
      const j = Math.min(3, Math.floor(u * 4)), f = u * 4 - j, p = corners[j]!, q = corners[j + 1]!;
      const dt = q[0]! - p[0]!, da = q[1]! - p[1]!, length = Math.hypot(dt * 0.3, da * 0.005), width = (w - 0.5) * 0.00046;
      return onSkin(p[0]! + dt * f + da * 0.005 / length * width / 0.3, p[1]! + da * f - dt * 0.3 / length * width / 0.005);
    }, 20, 1);
  }
  const head = model.extra[0]!.at;
  for (const side of [-1, 1]) jaw.tube([[head[0] + 0.006, head[1] - 0.0009, head[2] + side * 0.0015], [head[0] + 0.003, head[1] - 0.0017, head[2] + side * 0.0037], [head[0] - 0.002, head[1] - 0.0014, head[2] + side * 0.0034]], 0.00014, 4, 5);
  return { primitive: model.primitive, extra: [...model.extra, marks.prim('scales', '#46392a'), jaw.prim('eye', '#31291f')] };
}

/** Called before placement/fitting. Models and their public part ids stay intact. */
function detailedAnimal(id: string, model: Model): Model {
  if (id === 'tree-frog') return digits(model, 'frog');
  if (id === 'asian-toad') return digits(model, 'toad');
  if (id === 'house-gecko') return digits(model, 'gecko');
  if (id === 'pangolin') return scaleArmour(model);
  if (id === 'hawksbill-turtle') return turtle(model);
  if (id === 'plantain-squirrel') return squirrel(model);
  if (['snakehead', 'guppy', 'mudskipper', 'shark'].includes(id)) return fins(model, id);
  if (['grasshopper', 'beetle', 'spider'].includes(id)) return insect(model, id);
  if (id === 'dolphin') return { primitive: model.primitive, extra: model.extra.map(p => p.kind === 'extrude' ? sculptFin(p) : p) };
  if (id === 'python') return pythonPattern(model);
  return model;
}

export function polishAnimal(id: string, model: Model): Model {
  if(id==='house-gecko'){
    const g=modelGeometry({primitive:model.primitive,extra:[]}),p=g.getAttribute('position'),c=g.getAttribute('color');
    for(let i=0;i<p.count;i++){
      const x=p.getX(i),z=p.getZ(i),m=Math.sin(x*920+Math.sin(z*1400)*1.4)*Math.sin(z*710+x*250);
      const col=new Color('#d4c1a2').lerp(new Color('#998d79'),Math.max(0,m)*.30).lerp(new Color('#e5d9c4'),Math.max(0,-m)*.16);
      c.setXYZ(i,col.r,col.g,col.b);
    }
    model={primitive:mesh(g,'scales','#ffffff'),extra:model.extra};
  }
  const detailed = detailedAnimal(id, model);
  const smoothLimb=(p:Prim):Prim=>{
    if(!['tree-frog','asian-toad','house-gecko'].includes(id))return p;
    if(p.kind!=='sweep'||!Array.isArray(p.radius)||!Array.isArray(p.path)||p.path.length<3||p.path.length>4)return p;
    const rs=p.radius as number[],max=Math.max(...rs);if(max<.001||max>.005)return p;
    const path=(p.path as V3[]).map(q=>[q[0]+p.at[0],q[1]+p.at[1],q[2]+p.at[2]]as V3);
    if(id!=='house-gecko' && path.length===4){
      const g=foldedLimb(path,rs),pos=g.getAttribute('position'),nor=g.getAttribute('normal'),positions:number[]=[],normals:number[]=[];
      const inside=(i:number)=>{
        const x=pos.getX(i),y=pos.getY(i)-(id==='tree-frog'?.0125:.0122),z=pos.getZ(i);
        const angle=id==='tree-frog'?16*Math.PI/180:0,X=x*Math.cos(angle)+y*Math.sin(angle),Y=-x*Math.sin(angle)+y*Math.cos(angle);
        const a=id==='tree-frog'?.017324:.01775,b=id==='tree-frog'?.009028:.010224,c=id==='tree-frog'?.011224:.01491;
        return (X/a)**2+(Y/b)**2+(z/c)**2<.98;
      };
      for(let i=0;i<pos.count;i+=3){
        // These faces sit entirely inside the closed torso; the visible skin
        // remains continuous and the hidden overlap need not be rasterized.
        if(inside(i)&&inside(i+1)&&inside(i+2))continue;
        for(let j=0;j<3;j++){positions.push(pos.getX(i+j),pos.getY(i+j),pos.getZ(i+j));normals.push(nor.getX(i+j),nor.getY(i+j),nor.getZ(i+j));}
      }
      g.setAttribute('position',new Float32BufferAttribute(positions,3));g.setAttribute('normal',new Float32BufferAttribute(normals,3));
      return mesh(g,p.color as string,p.tint as string);
    }
    const end=path[path.length-1]!,prev=path[path.length-2]!,dir=new Vector3(...end).sub(new Vector3(...prev)).normalize(),r=rs[rs.length-1]!;
    path.push([end[0]+dir.x*r*.7,end[1]+dir.y*r*.7,end[2]+dir.z*r*.7]);
    const g=sculptTube(path,[...rs,r*.05],1,20,32);
    return mesh(g,p.color as string,p.tint as string);
  };
  return { primitive: detailed.primitive, extra: detailed.extra.filter(p => p.kind !== '__mesh' || (p.geometry as BufferGeometry).getAttribute('position').count > 0).map(smoothLimb) };
}
