/** Original build-time scale figure. Metres, feet y=0, anterior surface +Z.
 * Anatomical landmarks follow OpenStax's Regions of the Human Body and the
 * standing proportion studies listed in REBUILD-3D.md. This is an illustrative
 * neutral adult, not a patient, scan, clothing mannequin, or a claimed average.
 * The anatomical volumes are unioned BEFORE meshing: no detached joint balls,
 * capsule body, intersecting limb meshes, or painted facial form.
 */
import { BufferGeometry, Float32BufferAttribute, Vector3 } from 'three';
import { mergeVertices } from 'three/examples/jsm/utils/BufferGeometryUtils.js';

type V3 = [number, number, number];
type Volume = { c: V3; r: V3; u: V3; v: V3; w: V3; blend: number };
const dot = (a: V3, b: V3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const mix = (a: V3, b: V3, t: number): V3 => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
const smoothMin = (a: number, b: number, k: number) => {
  const h = Math.max(k - Math.abs(a - b), 0) / k;
  return Math.min(a, b) - h * h * k * .25;
};

export function createHuman(): BufferGeometry {
  const volumes: Volume[] = [];
  const ellipsoid = (c: V3, r: V3, blend = .016, axis?: V3) => {
    const v = axis ? new Vector3(...axis).normalize() : new Vector3(0, 1, 0);
    const u = new Vector3(1, 0, 0).addScaledVector(v, -v.x).normalize();
    const w = new Vector3().crossVectors(u, v).normalize();
    volumes.push({ c, r, u: u.toArray() as V3, v: v.toArray() as V3, w: w.toArray() as V3, blend });
  };
  const along = (a: V3, b: V3, width: number, depth: number, blend = .018) => {
    const d = new Vector3(...b).sub(new Vector3(...a));
    ellipsoid(mix(a, b, .5), [width, d.length() * .64, depth], blend, d.toArray() as V3);
  };

  // Torso: broad upper rib cage, abdominal taper, iliac flare and buttocks.
  // Small lateral shift and unequal shoulder heights carry a relaxed stance.
  ellipsoid([-.009, 1.279, -.008], [.158, .206, .098], .045);
  ellipsoid([-.004, 1.100, -.004], [.137, .153, .090], .042);
  ellipsoid([.004, .978, -.014], [.140, .116, .090], .039);
  // Long abdominal envelope removes the equatorial join between rib cage
  // and pelvic volumes; the silhouette remains tapered without a waist seam.
  ellipsoid([-.002, 1.133, -.012], [.128, .243, .085], .028);
  ellipsoid([-.072, .964, -.054], [.080, .096, .061], .020);
  ellipsoid([.081, .957, -.054], [.078, .097, .060], .020);
  // Pectoral and scapular slopes are skin relief in the same surface.
  ellipsoid([-.077, 1.329, .043], [.093, .088, .046], .032);
  ellipsoid([.070, 1.326, .042], [.092, .086, .045], .032);
  along([-.155, 1.407, -.003], [-.035, 1.459, -.014], .054, .065, .030);
  along([.145, 1.398, -.008], [.025, 1.456, -.014], .054, .065, .030);
  ellipsoid([-.005, 1.490, -.008], [.046, .075, .047], .023);

  // Cranial vault, cheek plane, tapered mandible and real projecting nose.
  // No eye decals: a subdued scale figure uses shallow orbital recesses.
  ellipsoid([-.006, 1.649, -.008], [.075, .101, .088], .013);
  ellipsoid([-.006, 1.613, .050], [.063, .075, .040], .022);
  ellipsoid([-.005, 1.560, .047], [.049, .046, .038], .021);
  ellipsoid([-.005, 1.559, .076], [.032, .026, .016], .015);
  along([-.006, 1.639, .080], [-.006, 1.602, .106], .013, .015, .011);
  ellipsoid([-.006, 1.603, .108], [.014, .011, .014], .009);
  ellipsoid([-.005, 1.579, .083], [.024, .010, .009], .012);
  ellipsoid([-.080, 1.628, -.005], [.013, .029, .018], .007);
  ellipsoid([.068, 1.626, -.005], [.012, .028, .018], .007);

  // Arms: deltoid, tapering upper arm, palpable elbow, bowed forearm and wrist.
  const arm = (s: number) => {
    const lift = s < 0 ? .008 : 0;
    const shoulder: V3 = [s * .180 - .006, 1.394 + lift, -.002];
    const elbow: V3 = [s * .223 - .005, 1.150 + lift, -.025];
    const wrist: V3 = [s * .248 - .004, .930 + lift, .012];
    ellipsoid(shoulder, [.051, .071, .056], .033);
    along(mix(shoulder, elbow, .08), mix(shoulder, elbow, .94), .041, .043, .031);
    ellipsoid(elbow, [.032, .042, .034], .026);
    along(mix(elbow, wrist, .10), mix(elbow, wrist, .61), .037, .035, .019);
    along(mix(elbow, wrist, .53), wrist, .026, .026, .015);
    ellipsoid(wrist, [.023, .031, .022], .017);
    // Palm and four individual relaxed fingers, rather than a mitten sphere.
    along([wrist[0], wrist[1] - .012, .013], [wrist[0] + s * .008, wrist[1] - .077, .022], .031, .017, .011);
    for (let i = 0; i < 4; i++) {
      const x = wrist[0] + (i - 1.5) * .014;
      const y = wrist[1] - .070;
      const length = [.058, .069, .064, .049][i]!;
      along([x, y, .020], [x + s * .003, y - length * .57, .028], .009, .010, .006);
      along([x + s * .003, y - length * .48, .028], [x + s * .005, y - length, .042], .0085, .009, .006);
    }
    // Thumb attaches to thenar eminence on the medial edge, flexed forward.
    along([wrist[0] - s * .022, wrist[1] - .024, .025], [wrist[0] - s * .039, wrist[1] - .058, .052], .013, .012, .009);
    along([wrist[0] - s * .039, wrist[1] - .055, .051], [wrist[0] - s * .032, wrist[1] - .083, .057], .009, .009, .006);
  };
  arm(-1); arm(1);

  // Pelvis joins each femur above the separated crotch. Knees face forward;
  // unequal leg lines and small outward foot angles avoid mirror symmetry.
  for (const s of [-1, 1]) {
    const hip: V3 = [s * .079 + .005, .901, -.010];
    const knee: V3 = [s * (s < 0 ? .094 : .100), .510, s < 0 ? .018 : -.006];
    const ankle: V3 = [s * (s < 0 ? .111 : .121), .113, s < 0 ? .014 : -.025];
    along(hip, mix(hip, knee, .77), .070, .076, .031);
    along(mix(hip, knee, .45), knee, .052, .057, .029);
    ellipsoid(knee, [.042, .053, .044], .027);
    ellipsoid([knee[0], knee[1] + .005, knee[2] + .022], [.032, .036, .024], .018);
    along(mix(knee, ankle, .08), mix(knee, ankle, .65), .044, .049, .026);
    along(mix(knee, ankle, .47), ankle, .033, .034, .021);
    ellipsoid(ankle, [.030, .040, .032], .014);
    // Instep, heel and spreading metatarsal envelope; flat contact is clipped
    // from the implicit field, so both feet are actually planted at y=0.
    ellipsoid([ankle[0], .061, ankle[2] + .030], [.033, .050, .070], .015);
    ellipsoid([ankle[0], .035, ankle[2] - .020], [.038, .036, .046], .012);
    ellipsoid([ankle[0] + s * .012, .030, ankle[2] + .108], [.044, .028, .066], .014);
  }

  const distance = (p: V3) => {
    let d = 1e3;
    for (const e of volumes) {
      const delta: V3 = [p[0] - e.c[0], p[1] - e.c[1], p[2] - e.c[2]];
      // IQ ellipsoid distance estimator preserves anisotropic forms and gives
      // gradients smooth enough for analytic normals at the final resolution.
      const q: V3 = [dot(delta, e.u), dot(delta, e.v), dot(delta, e.w)];
      const k0 = Math.hypot(q[0] / e.r[0], q[1] / e.r[1], q[2] / e.r[2]);
      const k1 = Math.hypot(q[0] / e.r[0] ** 2, q[1] / e.r[1] ** 2, q[2] / e.r[2] ** 2);
      const v = k1 > 1e-10 ? k0 * (k0 - 1) / k1 : -Math.min(...e.r);
      d = smoothMin(d, v, e.blend);
    }
    // Orbital bowls create shallow real relief; no faux texture eyes.
    for (const x of [-.034, .022]) {
      const q = Math.hypot((p[0] - x) / .020, (p[1] - 1.628) / .011, (p[2] - .096) / .014);
      d = Math.max(d, -(q - 1) * .011);
    }
    return Math.max(d, -p[1]);
  };

  // Marching tetrahedra, as in living-things/implicit.ts. Gradient normals are
  // evaluated on the actual union field, never averaged across separate parts.
  const min: V3 = [-.33, -.014, -.15], max: V3 = [.33, 1.77, .23], step = .009;
  const cells = max.map((v, i) => Math.ceil((v - min[i]!) / step)) as V3;
  const ny = cells[1] + 1, nz = cells[2] + 1;
  const index = (x: number, y: number, z: number) => (x * ny + y) * nz + z;
  const at = (x: number, y: number, z: number): V3 => [min[0] + x * (max[0] - min[0]) / cells[0], min[1] + y * (max[1] - min[1]) / cells[1], min[2] + z * (max[2] - min[2]) / cells[2]];
  const values = new Float32Array((cells[0] + 1) * ny * nz);
  for (let x = 0; x <= cells[0]; x++) for (let y = 0; y <= cells[1]; y++) for (let z = 0; z <= cells[2]; z++) values[index(x, y, z)] = distance(at(x, y, z));
  const offsets: V3[] = [[0, 0, 0], [1, 0, 0], [1, 1, 0], [0, 1, 0], [0, 0, 1], [1, 0, 1], [1, 1, 1], [0, 1, 1]];
  const tetra = [[0, 5, 1, 6], [0, 1, 2, 6], [0, 2, 3, 6], [0, 3, 7, 6], [0, 7, 4, 6], [0, 4, 5, 6]];
  const edges = [[0, 1], [0, 2], [0, 3], [1, 2], [1, 3], [2, 3]];
  const pos: number[] = [], normalData: number[] = [];
  const normal = (p: V3) => {
    const e = .00015;
    return new Vector3(...[0, 1, 2].map(k => { const a = [...p] as V3, b = [...p] as V3; a[k]! += e; b[k]! -= e; return distance(a) - distance(b); }) as V3).normalize();
  };
  const triangle = (a: V3, b: V3, c: V3) => {
    const n = normal(mix(mix(a, b, .5), c, 1 / 3));
    const cross = new Vector3(...b).sub(new Vector3(...a)).cross(new Vector3(...c).sub(new Vector3(...a)));
    if (cross.lengthSq() < 1e-19) return;
    if (cross.dot(n) < 0) [b, c] = [c, b];
    for (const p of [a, b, c]) { pos.push(...p); normalData.push(...normal(p).toArray()); }
  };
  for (let x = 0; x < cells[0]; x++) for (let y = 0; y < cells[1]; y++) for (let z = 0; z < cells[2]; z++) {
    const ds = offsets.map(o => values[index(x + o[0], y + o[1], z + o[2])]!);
    if (ds.every(d => d >= 0) || ds.every(d => d < 0)) continue;
    const ps = offsets.map(o => at(x + o[0], y + o[1], z + o[2]));
    for (const t of tetra) {
      const points: V3[] = [];
      for (const [a, b] of edges) {
        const ia = t[a!]!, ib = t[b!]!, da = ds[ia]!, db = ds[ib]!;
        if ((da < 0) !== (db < 0)) points.push(mix(ps[ia]!, ps[ib]!, da / (da - db)));
      }
      if (points.length === 3) triangle(points[0]!, points[1]!, points[2]!);
      else if (points.length === 4) {
        const centre = points.reduce((a, p) => [a[0] + p[0] / 4, a[1] + p[1] / 4, a[2] + p[2] / 4] as V3, [0, 0, 0] as V3);
        const n = normal(centre), u = new Vector3(...points[0]!).sub(new Vector3(...centre)).normalize(), v = new Vector3().crossVectors(n, u);
        points.sort((a, b) => { const pa = new Vector3(...a).sub(new Vector3(...centre)), pb = new Vector3(...b).sub(new Vector3(...centre)); return Math.atan2(pa.dot(v), pa.dot(u)) - Math.atan2(pb.dot(v), pb.dot(u)); });
        triangle(points[0]!, points[1]!, points[2]!); triangle(points[0]!, points[2]!, points[3]!);
      }
    }
  }
  const raw = new BufferGeometry();
  raw.setAttribute('position', new Float32BufferAttribute(pos, 3));
  raw.setAttribute('normal', new Float32BufferAttribute(normalData, 3));
  const welded = mergeVertices(raw, .00001);
  raw.dispose();
  welded.computeBoundingBox();
  // Set exactly 1.75 m stature, feet on ground, preserving all proportions.
  const height = welded.boundingBox!.max.y - welded.boundingBox!.min.y;
  welded.translate(0, -welded.boundingBox!.min.y, 0);
  welded.scale(1.75 / height, 1.75 / height, 1.75 / height);
  welded.computeBoundingBox(); welded.computeBoundingSphere();
  return welded;
}
