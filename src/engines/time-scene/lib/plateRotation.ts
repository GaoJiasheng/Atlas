/**
 * Finite plate rotations from a GPlates rotation file extracted to JSON (docs/72 E-CD1).
 * Each total reconstruction pole becomes a unit quaternion; between two poles of one
 * (moving, fixed) sequence the rotation is a spherical linear interpolation, and a plate's
 * rotation relative to the anchor is the composition along its fixed-plate chain at that age.
 * Checked against pyGPlates in tests/time-scene/plate-rotation.test.ts.
 */
export type Quat = [w: number, x: number, y: number, z: number];
export type Pole = [ageMa: number, latDeg: number, lonDeg: number, angleDeg: number];

export interface RotationFile {
  version: 1;
  modelId: string;
  anchorPlateId: number;
  sequences: { moving: number; fixed: number; poles: Pole[] }[];
}

export interface RotationModel {
  readonly modelId: string;
  /** Finite rotation of the plate relative to the anchor at `ma`; null for a non-finite age. */
  rotation(plateId: number, ma: number): Quat | null;
  /** Today's position carried to `ma`, as [lon, lat] degrees. */
  rotatePoint(plateId: number, ma: number, lonLat: readonly [number, number]): [number, number] | null;
  /** Row-major 3×3 rotation matrix of the plate at `ma` (written into `out`). */
  matrix(plateId: number, ma: number, out: Float64Array): boolean;
  /** Plate ids that have a sequence of their own. */
  plates(): number[];
}

const RAD = Math.PI / 180;
const IDENTITY: Quat = [1, 0, 0, 0];

export function poleQuat(lat: number, lon: number, angle: number): Quat {
  if (angle === 0) return IDENTITY;
  const half = (angle * RAD) / 2;
  const s = Math.sin(half);
  const cl = Math.cos(lat * RAD);
  return [Math.cos(half), s * cl * Math.cos(lon * RAD), s * cl * Math.sin(lon * RAD), s * Math.sin(lat * RAD)];
}

export function mul(a: Quat, b: Quat): Quat {
  return [
    a[0] * b[0] - a[1] * b[1] - a[2] * b[2] - a[3] * b[3],
    a[0] * b[1] + a[1] * b[0] + a[2] * b[3] - a[3] * b[2],
    a[0] * b[2] - a[1] * b[3] + a[2] * b[0] + a[3] * b[1],
    a[0] * b[3] + a[1] * b[2] - a[2] * b[1] + a[3] * b[0],
  ];
}

/** Shortest-arc slerp from q0 (u = 0) to q1 (u = 1). */
export function slerp(q0: Quat, q1: Quat, u: number): Quat {
  let d = q0[0] * q1[0] + q0[1] * q1[1] + q0[2] * q1[2] + q0[3] * q1[3];
  let b = q1;
  if (d < 0) { d = -d; b = [-q1[0], -q1[1], -q1[2], -q1[3]]; }
  let k0: number, k1: number;
  if (d > 1 - 1e-12) { k0 = 1 - u; k1 = u; } else {
    const th = Math.acos(d);
    const s = Math.sin(th);
    k0 = Math.sin((1 - u) * th) / s;
    k1 = Math.sin(u * th) / s;
  }
  const q: Quat = [k0 * q0[0] + k1 * b[0], k0 * q0[1] + k1 * b[1], k0 * q0[2] + k1 * b[2], k0 * q0[3] + k1 * b[3]];
  const n = Math.hypot(q[0], q[1], q[2], q[3]);
  return [q[0] / n, q[1] / n, q[2] / n, q[3] / n];
}

interface Sequence { moving: number; fixed: number; ages: number[]; quats: Quat[] }

export function createRotationModel(file: RotationFile): RotationModel {
  const sequences: Sequence[] = file.sequences.map((s) => ({ moving: s.moving, fixed: s.fixed, ages: s.poles.map((p) => p[0]), quats: s.poles.map((p) => poleQuat(p[1], p[2], p[3])) }));
  let memoMa = NaN;
  const memo = new Map<number, Quat>();
  const edge = new Map<number, Sequence>();
  /**
   * The reconstruction tree at `ma`, built as pyGPlates does: depth-first from the anchor, each plate's
   * child sequences taken in reverse file order, the first sequence to reach a moving plate wins. This
   * settles fixed-plate switch ages, where two sequences of one plate both hold `ma` (golden test).
   */
  const build = (ma: number) => {
    edge.clear();
    const children = new Map<number, Sequence[]>();
    for (const s of sequences) {
      if (ma < s.ages[0]! || ma > s.ages[s.ages.length - 1]!) continue;
      const list = children.get(s.fixed);
      if (list) list.push(s); else children.set(s.fixed, [s]);
    }
    const stack: [Sequence[], number][] = [[children.get(file.anchorPlateId) ?? [], (children.get(file.anchorPlateId)?.length ?? 0) - 1]];
    while (stack.length) {
      const top = stack[stack.length - 1]!;
      if (top[1] < 0) { stack.pop(); continue; }
      const s = top[0][top[1]--]!;
      if (s.moving === file.anchorPlateId || edge.has(s.moving)) continue;
      edge.set(s.moving, s);
      const kids = children.get(s.moving);
      if (kids) stack.push([kids, kids.length - 1]);
    }
  };
  const relative = (s: Sequence, ma: number): Quat => {
    const n = s.ages.length;
    let i = 0;
    while (i < n - 1 && s.ages[i + 1]! < ma) i++;
    if (s.ages[i] === ma || i === n - 1) return s.quats[i]!;
    const a0 = s.ages[i]!, a1 = s.ages[i + 1]!;
    return a1 === ma ? s.quats[i + 1]! : slerp(s.quats[i]!, s.quats[i + 1]!, (ma - a0) / (a1 - a0));
  };
  const total = (plate: number, ma: number): Quat => {
    const hit = memo.get(plate);
    if (hit) return hit;
    const s = edge.get(plate);
    // A plate outside the tree at this age (no sequence reaches it) keeps its present position, as in GPlates.
    const q = s ? mul(total(s.fixed, ma), relative(s, ma)) : IDENTITY;
    memo.set(plate, q);
    return q;
  };
  const rotation = (plateId: number, ma: number): Quat | null => {
    if (!Number.isFinite(ma)) return null;
    if (ma !== memoMa) { memo.clear(); build(ma); memoMa = ma; }
    return total(plateId, ma);
  };
  const matrix = (plateId: number, ma: number, out: Float64Array): boolean => {
    const q = rotation(plateId, ma);
    if (!q) return false;
    const [w, x, y, z] = q;
    out[0] = 1 - 2 * (y * y + z * z); out[1] = 2 * (x * y - w * z); out[2] = 2 * (x * z + w * y);
    out[3] = 2 * (x * y + w * z); out[4] = 1 - 2 * (x * x + z * z); out[5] = 2 * (y * z - w * x);
    out[6] = 2 * (x * z - w * y); out[7] = 2 * (y * z + w * x); out[8] = 1 - 2 * (x * x + y * y);
    return true;
  };
  const m = new Float64Array(9);
  return {
    modelId: file.modelId,
    rotation,
    matrix,
    rotatePoint(plateId, ma, [lon, lat]) {
      if (!matrix(plateId, ma, m)) return null;
      const cl = Math.cos(lat * RAD);
      const x = cl * Math.cos(lon * RAD), y = cl * Math.sin(lon * RAD), z = Math.sin(lat * RAD);
      const rx = m[0]! * x + m[1]! * y + m[2]! * z, ry = m[3]! * x + m[4]! * y + m[5]! * z, rz = m[6]! * x + m[7]! * y + m[8]! * z;
      return [Math.atan2(ry, rx) / RAD, Math.asin(Math.max(-1, Math.min(1, rz))) / RAD];
    },
    plates: () => [...new Set(sequences.map((s) => s.moving))],
  };
}
