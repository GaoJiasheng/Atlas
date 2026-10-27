/**
 * `pnpm tsx scripts/geo/how-planes-fly/build-parts.ts` — writes
 * src/content/topics/how-planes-fly/data/parts.json (docs/45 §3–§4).
 *
 * Four stations on one stage, never shown together (the chapters hide the
 * others, ./layout.ts): the generic airliner W at 1:10 around CG, the wing
 * box B, the two-spool turbofan section E and the airfoil experiment A. All
 * geometry is procedural and original; the airfoil sample is the engine's own
 * 128-point Joukowski outline (lib/sim/airfoil-field.ts), never external
 * coordinates. Names, leader lines and details come from ./text.ts.
 */
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { Euler, Quaternion, Vector3 } from 'three';
import { airfoilOutline } from '../../../src/engines/space-scene/lib/sim/airfoil-field';
import { A, B, BOX, CG, E, ENGINE, ORIGIN, PIVOT, PRESETS, W, cam, type Vec3 } from './layout';
import { PART_TEXT } from './text';

type T = { en: string; zh: string };
type Json = Record<string, unknown>;
const t = (en: string, zh: string): T => ({ en, zh });
const OUT = join(import.meta.dirname, '../../../src/content/topics/how-planes-fly/data/parts.json');
const r4 = (n: number) => Math.round(n * 1e4) / 1e4;
const v4 = (v: readonly number[]) => v.map(r4) as Vec3;
const DEG = Math.PI / 180;

/* ------------------------------------------------------------------ */
/* Materials                                                           */
/* ------------------------------------------------------------------ */

/** Control surfaces a shade darker than the skin, so the hinge lines read. */
const CONTROL = { color: 'casing', tint: '#8d949a' };
const SKIN = { color: 'casing' };
const WINDOWS = { color: 'rubber' };

/* ------------------------------------------------------------------ */
/* Wing planform (left wing, z ≥ 0; the right wing mirrors z)          */
/* ------------------------------------------------------------------ */

const DIHEDRAL = 6 * DEG;
const ROOT_Z = 0.12;
const Y_ROOT = 0.99;
const TIP_Z = 1.78;
/** Leading edge (28° sweep), trailing edge (straight inboard of the kink at z 0.62). */
const LE = (z: number) => -0.62 + 0.53 * z;
const TE = (z: number) => (z <= 0.62 ? 0.24 : 0.24 + ((z - 0.62) * 0.32) / 1.16);
const chord = (z: number) => TE(z) - LE(z);
/** Hinge line of the trailing-edge surfaces: 78 % of the local chord. */
const HINGE = 0.78;
const H = (z: number) => LE(z) + HINGE * chord(z);
/** Mid-plane height with dihedral. */
const yWing = (z: number) => Y_ROOT + (z - ROOT_Z) * Math.tan(DIHEDRAL);
/** The main wing's lens section: centre at 39 % chord, half-width 39 % chord, thickness ratio. */
const LENS_FLAT = 0.14;
/** Half-thickness of the lens `s` (scene x) behind the leading edge at span z. */
const lensHalf = (z: number, s: number) => {
  const r = (HINGE / 2) * chord(z);
  const q = (s - r) / r;
  return Math.abs(q) >= 1 ? 0 : LENS_FLAT * r * Math.sqrt(1 - q * q);
};

/** A planform polygon [x, z] (in the dihedral plane) as an extrude: thickness along the plane's normal. */
function planform(poly: [number, number][], side: 1 | -1, thickness: number, bevel: number, yLift = 0, look: Json = CONTROL): Json {
  const tilt = 90 - side * (DIHEDRAL / DEG);
  const sin = Math.sin(tilt * DEG);
  return {
    kind: 'extrude',
    shape: poly.map(([x, z]) => [r4(x), r4(z / sin)]),
    depth: thickness,
    bevel,
    at: v4([0, yWing(0) + yLift, 0]),
    rotation: [r4(tilt), 0, 0],
    ...look,
  };
}

/** Rotation (Euler XYZ degrees, the pose convention) of `deg` about the unit axis p1 → p2. */
function axisEuler(p1: Vec3, p2: Vec3, deg: number): Vec3 {
  const axis = new Vector3(p2[0] - p1[0], p2[1] - p1[1], p2[2] - p1[2]).normalize();
  const e = new Euler().setFromQuaternion(new Quaternion().setFromAxisAngle(axis, deg * DEG), 'XYZ');
  return v4([e.x / DEG, e.y / DEG, e.z / DEG]);
}
/** Deflect a trailing-edge surface hinged on p1 → p2 so that its trailing edge goes down by `deg` (negative: up). */
function teDown(p1: Vec3, p2: Vec3, deg: number, behind: Vec3 = [1, 0, 0]): { pivot: Vec3; rotation: Vec3 } {
  for (const sign of [1, -1]) {
    const rot = axisEuler(p1, p2, sign * Math.abs(deg));
    const q = new Quaternion().setFromEuler(new Euler(rot[0] * DEG, rot[1] * DEG, rot[2] * DEG, 'XYZ'));
    const moved = new Vector3(...behind).normalize().multiplyScalar(0.1).applyQuaternion(q);
    if ((moved.y < 0) === deg > 0) return { pivot: v4(p1), rotation: rot };
  }
  throw new Error('teDown: no direction');
}
const hingeAt = (z: number, side: 1 | -1, f = H): Vec3 => [f(z), yWing(z), side * z];

/* ------------------------------------------------------------------ */
/* W: the generic airliner                                             */
/* ------------------------------------------------------------------ */

function fuselage(): Json {
  // Station x, drop of the centre line (nose droop, tail upsweep), radius.
  const st: [number, number, number][] = [
    [-2.0, -0.03, 0.012],
    [-1.93, -0.022, 0.075],
    [-1.82, -0.012, 0.13],
    [-1.65, -0.004, 0.17],
    [-1.4, 0, 0.195],
    [-1.0, 0, 0.2],
    [0, 0, 0.2],
    [0.8, 0, 0.2],
    [1.2, 0.03, 0.19],
    [1.5, 0.07, 0.16],
    [1.75, 0.1, 0.11],
    [1.95, 0.12, 0.06],
    [2.02, 0.125, 0.025],
  ];
  return {
    kind: 'sweep',
    path: st.map(([x, dy]) => [x, r4(dy), 0]),
    radius: st.map(([, , r]) => r),
    radial: 32,
    segments: 120,
    at: CG,
    ...SKIN,
  };
}
/** Cabin windows, one row each side (one instanced mesh per row). */
function windowRow(side: 1 | -1): Json {
  return { kind: 'fins', size: [0.006, 0.026, 0.018], count: 36, gap: 0.042, axis: 'x', at: v4([-0.34, 1.135, side * 0.197]), ...WINDOWS };
}
function cockpit(): Json {
  const rOf = (x: number) => {
    const st = [
      [-1.93, 0.075],
      [-1.82, 0.13],
      [-1.65, 0.17],
    ];
    for (let i = 0; i + 1 < st.length; i++) {
      const [x0, r0] = st[i]!, [x1, r1] = st[i + 1]!;
      if (x <= x1!) return r0! + ((r1! - r0!) * (x - x0!)) / (x1! - x0!);
    }
    return 0.17;
  };
  const xs = [-1.87, -1.83, -1.79, -1.75, -1.71];
  const xc = -1.79;
  const outer = xs.map((x) => [r4(rOf(x) + 0.004), r4(x - xc)]);
  const inner = [...xs].reverse().map((x) => [r4(rOf(x) - 0.004), r4(x - xc)]);
  return { kind: 'lathe', profile: [...outer, ...inner, outer[0]], segments: 64, arc: 120, at: v4([xc, 1.1 - 0.011, 0]), rotation: [90, 0, -90], color: 'glass', tint: '#33424b' };
}
function mainWing(side: 1 | -1): Json {
  const n = 19;
  const zs = Array.from({ length: n }, (_, i) => ROOT_Z + ((1.7 - ROOT_Z) * i) / (n - 1));
  const mid = zs[Math.floor(n / 2)]!;
  const at: Vec3 = [LE(mid) + 0.39 * chord(mid), yWing(mid), side * mid];
  return {
    kind: 'sweep',
    path: zs.map((z) => v4([LE(z) + (HINGE / 2) * chord(z) - at[0], yWing(z) - at[1], side * z - at[2]])),
    radius: zs.map((z) => r4((HINGE / 2) * chord(z))),
    section: { flat: LENS_FLAT },
    up: [0, 1, 0],
    radial: 28,
    at: v4(at),
    ...SKIN,
  };
}
function winglet(side: 1 | -1): Json {
  // Seat the tip device on the final wing station, rather than beyond the slanted sweep cap.
  const z = TIP_Z - 0.08;
  return {
    kind: 'extrude',
    shape: [
      [0, 0],
      [0.2, 0],
      [0.235, 0.17],
      [0.165, 0.178],
    ],
    depth: 0.012,
    bevel: 0.004,
    at: v4([0.31, yWing(z) - 0.006, side * z]),
    rotation: [side * 12, 0, 0],
    ...SKIN,
  };
}
const GAP = 0.004;
function trailingSurface(z0: number, z1: number, side: 1 | -1, kink = false): Json {
  const zs = kink ? [z0, 0.62, z1] : [z0, z1];
  const poly: [number, number][] = [...zs.map((z) => [H(z) + GAP, z] as [number, number]), ...[...zs].reverse().map((z) => [TE(z), z] as [number, number])];
  return planform(poly.map(([x, z]) => [x, side * z]), side, 0.009, 0.003);
}
const AILERON: [number, number] = [1.0, 1.7];
const FLAP: [number, number] = [0.22, 0.98];
const SPOILER: [number, number] = [0.42, 0.92];
const SLAT: [number, number] = [0.3, 1.62];
const spoilerLift = () => {
  const z = (SPOILER[0] + SPOILER[1]) / 2;
  return lensHalf(z, H(z) - 0.04 - LE(z)) + 0.003;
};
function spoiler(): Json {
  const zs = [SPOILER[0], SPOILER[1]];
  const poly: [number, number][] = [...zs.map((z) => [H(z) - 0.075, z] as [number, number]), ...[...zs].reverse().map((z) => [H(z) - 0.008, z] as [number, number])];
  return planform(poly, 1, 0.006, 0.002, spoilerLift());
}
function slat(side: 1 | -1): Json {
  // Narrow leading-edge cuff: seated into the wing at rest, clear of it after the 0.025 forward deployment.
  const n = 9;
  const zs = Array.from({ length: n }, (_, i) => SLAT[0] + ((SLAT[1] - SLAT[0]) * i) / (n - 1));
  const mid = zs[4]!;
  const at: Vec3 = [LE(mid) - 0.03, yWing(mid), side * mid];
  return {
    kind: 'sweep',
    path: zs.map((z) => v4([LE(z) - 0.03 - at[0], yWing(z) - at[1], side * z - at[2]])),
    radius: 0.016,
    section: { flat: 0.48 },
    up: [0, 1, 0],
    radial: 16,
    at: v4(at),
    ...CONTROL,
  };
}

// Tailplane: root at the tail cone, 33° sweep, half-span 0.70, dihedral 6°.
const T_ROOT_X = 1.42;
const T_SPAN = 0.7;
const T_Y = 1.155;
const LEt = (z: number) => T_ROOT_X + 0.649 * z;
const ct = (z: number) => 0.42 - (0.26 / T_SPAN) * z;
const Ht = (z: number) => LEt(z) + 0.72 * ct(z);
const yTail = (z: number) => T_Y + z * Math.tan(DIHEDRAL);
function tailPlanform(poly: [number, number][], side: 1 | -1, thickness: number, bevel: number, look: Json): Json {
  const tilt = 90 - side * (DIHEDRAL / DEG);
  const sin = Math.sin(tilt * DEG);
  return { kind: 'extrude', shape: poly.map(([x, z]) => [r4(x), r4((side * z) / sin)]), depth: thickness, bevel, at: [0, T_Y, 0], rotation: [r4(tilt), 0, 0], ...look };
}
function tailplane(side: 1 | -1): Json {
  return tailPlanform(
    [
      [LEt(0.04), 0.04],
      [LEt(T_SPAN), T_SPAN],
      [Ht(T_SPAN), T_SPAN],
      [Ht(0.04), 0.04],
    ],
    side,
    0.022,
    0.007,
    SKIN,
  );
}
function elevator(side: 1 | -1): Json {
  const z0 = 0.09,
    z1 = 0.68;
  return tailPlanform(
    [
      [Ht(z0) + GAP, z0],
      [Ht(z1) + GAP, z1],
      [LEt(z1) + ct(z1), z1],
      [LEt(z0) + ct(z0), z0],
    ],
    side,
    0.009,
    0.003,
    CONTROL,
  );
}
// Fin and rudder: a vertical planform in the XY plane.
const F_ROOT_Y = 1.25;
const F_TOP_Y = 1.88;
const F_LE0 = 1.3;
const F_LE1 = F_LE0 + (F_TOP_Y - F_ROOT_Y) * Math.tan(38 * DEG);
const F_C0 = 0.66;
const F_C1 = 0.25;
const finLE = (y: number) => F_LE0 + ((F_LE1 - F_LE0) * (y - F_ROOT_Y)) / (F_TOP_Y - F_ROOT_Y);
const finC = (y: number) => F_C0 + ((F_C1 - F_C0) * (y - F_ROOT_Y)) / (F_TOP_Y - F_ROOT_Y);
const finH = (y: number) => finLE(y) + 0.7 * finC(y);
const RUDDER: [number, number] = [1.31, 1.85];
function fin(): Json {
  return {
    kind: 'extrude',
    shape: [
      [finLE(F_ROOT_Y), F_ROOT_Y],
      [finLE(F_TOP_Y), F_TOP_Y],
      [finH(F_TOP_Y), F_TOP_Y],
      [finH(F_ROOT_Y), F_ROOT_Y],
    ].map(([x, y]) => [r4(x!), r4(y!)]),
    depth: 0.024,
    bevel: 0.008,
    at: [0, 0, 0],
    ...SKIN,
  };
}
function rudder(): Json {
  const [y0, y1] = RUDDER;
  return {
    kind: 'extrude',
    shape: [
      [finH(y0) + GAP, y0],
      [finH(y1) + GAP, y1],
      [finLE(y1) + finC(y1), y1],
      [finLE(y0) + finC(y0), y0],
    ].map(([x, y]) => [r4(x!), r4(y!)]),
    depth: 0.01,
    bevel: 0.003,
    at: [0, 0, 0],
    ...CONTROL,
  };
}

// Nacelles under the wings: centre line z ±0.6, intake at x −0.80.
const NAC_X = -0.58;
const NAC_Y = 0.84;
const NAC_Z = 0.6;
function nacelle(side: 1 | -1): { primitive: Json; extra: Json[] } {
  const at: Vec3 = [NAC_X, NAC_Y, side * NAC_Z];
  const outer = [
    [0.098, -0.22],
    [0.109, -0.2],
    [0.115, -0.15],
    [0.117, -0.06],
    [0.113, 0.06],
    [0.102, 0.17],
    [0.094, 0.22],
  ];
  const inner = [
    [0.086, 0.22],
    [0.087, 0.06],
    [0.089, -0.12],
    [0.09, -0.19],
    [0.093, -0.215],
  ];
  const wingY = yWing(NAC_Z) - lensHalf(NAC_Z, 0.2);
  return {
    primitive: { kind: 'lathe', profile: [...outer, ...inner, outer[0]], segments: 48, at, rotation: [0, 0, -90], ...SKIN },
    extra: [
      // Pylon from the nacelle top to the wing's underside.
      {
        kind: 'extrude',
        shape: [
          [-0.64, NAC_Y + 0.1],
          [-0.42, wingY + 0.03],
          [0.0, wingY + 0.02],
          [0.02, wingY - 0.012],
          [-0.3, NAC_Y + 0.1],
        ].map(([x, y]) => [r4(x!), r4(y!)]),
        depth: 0.022,
        bevel: 0.006,
        at: [0, 0, side * NAC_Z],
        ...SKIN,
      },
      // Core cowl and exhaust cone behind the fan cowl.
      {
        kind: 'lathe',
        profile: [
          [0, 0.17],
          [0.074, 0.17],
          [0.07, 0.24],
          [0.048, 0.3],
          [0.022, 0.345],
          [0, 0.36],
        ],
        segments: 32,
        at,
        rotation: [0, 0, -90],
        color: 'steel',
      },
    ],
  };
}
function airlinerFan(side: 1 | -1): Json {
  return { kind: 'blades', count: 18, radius: 0.085, hub: 0.027, chord: 0.03, twist: 30, sweep: 20, pitch: 42, thickness: 0.003, at: v4([NAC_X - 0.16, NAC_Y, side * NAC_Z]), rotation: [0, 0, 90], color: 'steel' };
}

/* ------------------------------------------------------------------ */
/* B: the wing box (span along Z, chord along X, leading edge −X)      */
/* ------------------------------------------------------------------ */

/** A generic cambered drawing section: 2 % camber at 40 % chord, 12 % thick (the classic four-digit formula). */
function camberedSection(c: number, thick: number, inset = 0, n = 34): { upper: [number, number][]; lower: [number, number][]; camber: (x: number) => number; half: (x: number) => number } {
  const m = 0.02,
    p = 0.4;
  const yc = (x: number) => (x < p ? (m / (p * p)) * (2 * p * x - x * x) : (m / ((1 - p) * (1 - p))) * (1 - 2 * p + 2 * p * x - x * x));
  const yt = (x: number) => 5 * thick * (0.2969 * Math.sqrt(x) - 0.126 * x - 0.3516 * x * x + 0.2843 * x ** 3 - 0.1036 * x ** 4);
  const xs = Array.from({ length: n }, (_, i) => (1 - Math.cos((Math.PI * i) / (n - 1))) / 2);
  const span = xs.filter((x) => x >= inset / c && x <= 1 - (inset * 3) / c);
  const upper = span.map((x) => [r4((x - 0.5) * c), r4((yc(x) + Math.max(0, yt(x) - inset / c)) * c)] as [number, number]);
  const lower = span.map((x) => [r4((x - 0.5) * c), r4((yc(x) - Math.max(0, yt(x) - inset / c)) * c)] as [number, number]);
  return { upper, lower, camber: (x) => yc(x) * c, half: (x) => yt(x) * c };
}
const BOX_C = 1;
const BOX_SPAN = 1;
const SKIN_T = 0.008;
const outlineOf = (s: { upper: [number, number][]; lower: [number, number][] }) => [...[...s.upper].reverse(), ...s.lower.slice(1, -1)];
function wingBox(): Record<string, Json> {
  const outer = camberedSection(BOX_C, 0.12);
  const inner = camberedSection(BOX_C, 0.12, SKIN_T);
  const ribOuter = camberedSection(BOX_C, 0.12, SKIN_T + 0.002);
  const spar = (xc: number): { primitive: Json; extra: Json[] } => {
    const x = (xc - 0.5) * BOX_C;
    const cy = outer.camber(xc);
    const h = 2 * (outer.half(xc) - SKIN_T) - 0.002;
    const y = BOX[1] + cy;
    return {
      primitive: { kind: 'bevelBox', size: [0.008, r4(h), BOX_SPAN - 0.01], bevel: 0.002, at: v4([x, y, BOX[2]]), color: 'steel' },
      extra: [1, -1].map((s) => ({ kind: 'bevelBox', size: [0.05, 0.007, BOX_SPAN - 0.01], bevel: 0.002, at: v4([x, y + s * (h / 2 - 0.0035), BOX[2]]), color: 'steel' })),
    };
  };
  // Lightening holes between the spars, sized to the local depth.
  const holes = [0.27, 0.385, 0.5].map((xc) => {
    const r = 0.55 * (outer.half(xc) - SKIN_T);
    const cx = (xc - 0.5) * BOX_C,
      cy = outer.camber(xc);
    return Array.from({ length: 20 }, (_, k) => [r4(cx + r * Math.cos((2 * Math.PI * k) / 20)), r4(cy + r * Math.sin((2 * Math.PI * k) / 20))]);
  });
  return {
    'wing-box-skin': { shell: true, primitive: { kind: 'extrude', shape: outlineOf(outer), holes: [outlineOf(inner)], depth: BOX_SPAN, bevel: 0, at: BOX, ...SKIN } },
    'front-spar': spar(0.15),
    'rear-spar': spar(0.62),
    'wing-ribs': { primitive: { kind: 'extrude', shape: outlineOf(ribOuter), holes, depth: 0.008, bevel: 0, at: BOX, color: 'casing', tint: '#a8adb1' }, repeat: { count: 3, axis: [0, 0, 1], spacing: 0.4 } },
  };
}

/* ------------------------------------------------------------------ */
/* E: the turbofan section (axis +X through ENGINE; u = x − 0)         */
/* ------------------------------------------------------------------ */

const EY = ENGINE[1];
const EZ = ENGINE[2];
const onAxis = (u: number): Vec3 => v4([u, EY, EZ]);
/** A lathe about the engine axis: profile [r, u] (u along +X). */
const engineLathe = (profile: number[][], look: Json, segments = 64): Json => ({ kind: 'lathe', profile: profile.map(([r, u]) => [r4(r!), r4(u!)]), segments, at: onAxis(0), rotation: [0, 0, -90], ...look });
/** Core flow path: outer wall radius (the core casing's inside) and the drum / disc radius under the blades. */
const ROUT: [number, number][] = [
  [-0.6, 0.19],
  [-0.55, 0.175],
  [-0.45, 0.16],
  [-0.25, 0.14],
  [-0.02, 0.12],
  [0.02, 0.165],
  [0.22, 0.165],
  [0.26, 0.14],
  [0.42, 0.16],
  [0.56, 0.172],
];
const RIN: [number, number][] = [
  [-0.5, 0.07],
  [-0.03, 0.085],
  [0.25, 0.085],
  [0.32, 0.085],
  [0.4, 0.095],
  [0.6, 0.095],
];
const lerpTable = (tab: [number, number][], u: number) => {
  if (u <= tab[0]![0]) return tab[0]![1];
  for (let i = 0; i + 1 < tab.length; i++) {
    const [u0, r0] = tab[i]!, [u1, r1] = tab[i + 1]!;
    if (u <= u1) return r0 + ((r1 - r0) * (u - u0)) / (u1 - u0);
  }
  return tab[tab.length - 1]![1];
};
const rOut = (u: number) => lerpTable(ROUT, u);
const rIn = (u: number) => lerpTable(RIN, u);
/** A ring of radial blade plates (repeated about the axis): rows at u, from r0 to r1, staggered. */
function bladeRows(rows: { u: number; r0: number; r1: number; chord: number; stagger: number }[], look: Json): { primitive: Json; extra: Json[]; repeat: Json } {
  return {
    // The rotation centre on the axis (a speck inside the fan shaft): the rows turn about it.
    primitive: { kind: 'box', size: [0.003, 0.003, 0.003], at: onAxis(rows[0]!.u), ...look },
    extra: rows.map((r) => ({ kind: 'box', size: [r4(r.chord), r4(r.r1 - r.r0), 0.0045], at: v4([r.u, EY + (r.r0 + r.r1) / 2, EZ]), rotation: [0, r.stagger, 0], ...look })),
    repeat: { count: 24, axis: [1, 0, 0], radius: 0.001 },
  };
}
const rotorRow = (u: number, chord: number, stagger: number) => ({ u, r0: rIn(u) - 0.004, r1: rOut(u) - 0.006, chord, stagger });
const statorRow = (u: number, chord: number, stagger: number) => ({ u, r0: rIn(u) + 0.006, r1: rOut(u), chord, stagger });

function engineParts(): Record<string, Json> {
  const struts: Json[] = [30, 90, 150, 210, 270, 330].map((deg) => {
    const a = deg * DEG,
      r = 0.27;
    return { kind: 'bevelBox', size: [0.035, 0.13, 0.012], bevel: 0.003, at: v4([-0.42, EY + r * Math.cos(a), EZ + r * Math.sin(a)]), rotation: [r4(deg), 0, 0], color: 'casing' };
  });
  return {
    // Core casing and its cowl: the inner wall of the bypass outside, the core path inside; inlet guide vanes at the splitter.
    // The engine case: fan case and nacelle, the outer wall of the bypass, with fixed guide vanes (struts) behind the fan.
    'engine-shell': {
      shell: true,
      primitive: engineLathe(
        [
          [0.345, -0.92],
          [0.366, -0.905],
          [0.384, -0.86],
          [0.396, -0.78],
          [0.401, -0.6],
          [0.398, -0.3],
          [0.386, -0.05],
          [0.372, 0.12],
          [0.353, 0.12],
          [0.346, -0.1],
          [0.339, -0.5],
          [0.336, -0.78],
          [0.339, -0.88],
          [0.345, -0.92],
        ],
        SKIN,
      ),
      extra: struts,
    },
    'fan-disc': {
      primitive: { kind: 'blades', count: 22, radius: 0.325, hub: 0.1, chord: 0.11, twist: 38, sweep: 18, pitch: 52, thickness: 0.007, at: onAxis(-0.72), rotation: [0, 0, 90], color: 'steel' },
      extra: [
        engineLathe(
          [
            [0, -0.88],
            [0.03, -0.86],
            [0.062, -0.82],
            [0.088, -0.78],
            [0.1, -0.76],
            [0, -0.76],
          ],
          { color: 'steel' },
          48,
        ),
      ],
    },
    'bypass-duct': {
      shell: true,
      // The bypass duct's inner wall (the core cowl) and, inside it, the core casing: two skins joined at the splitter lip.
      primitive: engineLathe(
        [
          [0.198, -0.6],
          [0.205, -0.56],
          [0.211, -0.4],
          [0.209, -0.1],
          [0.2, 0.2],
          [0.191, 0.45],
          [0.186, 0.56],
          [0.174, 0.56],
          [0.179, 0.45],
          [0.188, 0.2],
          [0.197, -0.1],
          [0.199, -0.4],
          [0.193, -0.55],
          [0.19, -0.58],
          [0.198, -0.6],
        ],
        SKIN,
      ),
      extra: [
        engineLathe([...ROUT.map(([u, r]) => [r + 0.012, u]), ...[...ROUT].reverse().map(([u, r]) => [r, u]), [ROUT[0]![1] + 0.012, ROUT[0]![0]]], SKIN),
      ],
    },
    'compressor-bank': bladeRows([-0.405, -0.295, -0.185, -0.075].map((u) => statorRow(u, 0.026, -38)), { color: 'casing', tint: '#a3a8ad' }),
    'compressor-rotor': bladeRows([-0.46, -0.35, -0.24, -0.13].map((u) => rotorRow(u, 0.03, 40)), { color: 'steel' }),
    // Separate inner and outer liners leave an annular gas passage, rather
    // than filling the chamber with a solid band through the core stream.
    'combustor-ring': {
      primitive: engineLathe(
        [[0.152, 0.03], [0.16, 0.08], [0.157, 0.17], [0.142, 0.212],
         [0.136, 0.212], [0.151, 0.17], [0.154, 0.08], [0.146, 0.03], [0.152, 0.03]],
        { color: 'stainless' },
      ),
      extra: [engineLathe(
        [[0.082, 0.03], [0.078, 0.08], [0.08, 0.17], [0.096, 0.212],
         [0.102, 0.212], [0.086, 0.17], [0.084, 0.08], [0.088, 0.03], [0.082, 0.03]],
        { color: 'stainless' },
      )],
    },
    'turbine-bank': bladeRows([statorRow(0.235, 0.03, -45), statorRow(0.375, 0.03, -40), statorRow(0.505, 0.03, -40)], { color: 'casing', tint: '#a3a8ad' }),
    'hp-turbine-rotor': bladeRows([rotorRow(0.295, 0.032, 48)], { color: 'steel' }),
    'lp-turbine-rotor': bladeRows([rotorRow(0.44, 0.032, 45), rotorRow(0.565, 0.032, 45)], { color: 'steel' }),
    // The fan shaft: the inner shaft, from the fan to the fan turbine's disc.
    'lp-shaft': {
      primitive: { kind: 'cylinder', size: [0.018, 0.018, 1.36], at: onAxis(-0.06), rotation: [0, 0, 90], color: 'steel', tint: '#7d8489' },
      extra: [
        engineLathe(
          [
            [0.018, 0.4],
            [0.093, 0.41],
            [0.093, 0.595],
            [0.018, 0.605],
            [0.018, 0.4],
          ],
          { color: 'steel', tint: '#7d8489' },
        ),
      ],
    },
    // The core shaft: hollow, round the fan shaft, carrying the compressor drum and the core turbine disc.
    'hp-shaft': {
      primitive: engineLathe(
        [
          [0.036, -0.52],
          [0.036, 0.33],
          [0.027, 0.33],
          [0.027, -0.52],
          [0.036, -0.52],
        ],
        { color: 'steel' },
      ),
      extra: [
        // Radial webs join the hollow compressor drum to its drive shaft.
        engineLathe([[0.034, -0.495], [0.07, -0.495], [0.07, -0.487], [0.034, -0.487], [0.034, -0.495]], { color: 'steel' }),
        engineLathe([[0.034, -0.038], [0.084, -0.038], [0.084, -0.03], [0.034, -0.03], [0.034, -0.038]], { color: 'steel' }),
        engineLathe(
          [
            [0.068, -0.5],
            [0.084, -0.04],
            [0.084, -0.025],
            [0.04, -0.025],
            [0.04, -0.27],
            [0.062, -0.29],
            [0.062, -0.48],
            [0.068, -0.5],
          ],
          { color: 'steel' },
        ),
        engineLathe(
          [
            [0.036, 0.26],
            [0.084, 0.27],
            [0.084, 0.315],
            [0.036, 0.325],
            [0.036, 0.26],
          ],
          { color: 'steel' },
        ),
      ],
    },
    // Core nozzle and its tail cone (clear of the shafts' ends).
    'core-nozzle': {
      primitive: engineLathe(
        [
          [0.186, 0.56],
          [0.174, 0.7],
          [0.146, 0.86],
          [0.136, 0.86],
          [0.161, 0.7],
          [0.172, 0.56],
          [0.186, 0.56],
        ],
        SKIN,
      ),
      extra: [
        engineLathe(
          [
            [0, 0.62],
            [0.09, 0.62],
            [0.086, 0.72],
            [0.062, 0.86],
            [0.03, 0.96],
            [0, 1.0],
          ],
          { color: 'steel' },
        ),
      ],
    },
    'bypass-nozzle': {
      primitive: engineLathe(
        [
          [0.372, 0.12],
          [0.352, 0.3],
          [0.322, 0.44],
          [0.312, 0.44],
          [0.333, 0.3],
          [0.353, 0.12],
          [0.372, 0.12],
        ],
        SKIN,
      ),
    },
  };
}

/* ------------------------------------------------------------------ */
/* A: the airfoil experiment                                           */
/* ------------------------------------------------------------------ */

const CHORD = 1;
const FRONT = ORIGIN[2] + 0.06;
function experiment(): Record<string, Json> {
  const o = airfoilOutline();
  const shape = Array.from({ length: 128 }, (_, j) => [o[j * 2]! * CHORD, o[j * 2 + 1]! * CHORD]);
  return {
    'foil-sample': { primitive: { kind: 'extrude', shape, depth: 0.12, bevel: 0, at: ORIGIN, color: 'casing' } },
    'chord-marker': { primitive: { kind: 'tube', path: [v4([ORIGIN[0], ORIGIN[1], FRONT + 0.004]), v4([ORIGIN[0] + CHORD, ORIGIN[1], FRONT + 0.004])], radius: 0.0022, at: [0, 0, 0], color: 'token:ink-2' } },
    'inflow-reference': { primitive: { kind: 'tube', path: [v4([ORIGIN[0] - 0.62, ORIGIN[1], FRONT + 0.005]), v4([ORIGIN[0] - 0.06, ORIGIN[1], FRONT + 0.005])], radius: 0.003, at: [0, 0, 0], color: 'token:air' } },
    'angle-marker': { primitive: { kind: 'sphere', size: [0.006], at: v4([PIVOT[0], PIVOT[1], FRONT + 0.006]), color: 'token:signal' } },
    'display-plinth': {
      primitive: { kind: 'bevelBox', size: [0.62, 0.05, 0.34], bevel: 0.012, at: v4([PIVOT[0], 1.0, ORIGIN[2] - 0.17]), color: 'powder', tint: '#6f6a62' },
      extra: [
        { kind: 'cylinder', size: [0.014, 0.014, 1.15], at: v4([PIVOT[0], 1.6, ORIGIN[2] - 0.18]), color: 'steel' },
        { kind: 'cylinder', size: [0.011, 0.011, 0.14], at: v4([PIVOT[0], PIVOT[1], ORIGIN[2] - 0.115]), rotation: [90, 0, 0], color: 'steel' },
      ],
    },
  };
}

/* ------------------------------------------------------------------ */
/* Assemble                                                            */
/* ------------------------------------------------------------------ */

const GROUP_OF: Record<string, string> = {};
for (const id of ['fuselage-shell', 'cockpit-glazing', 'wing-left', 'wing-right', 'wing-tip-left', 'wing-tip-right', ...B]) GROUP_OF[id] = 'airframe';
for (const id of W.filter((x) => /aileron|spoiler|flap|slat|tailplane|elevator|^fin$|rudder/.test(x))) GROUP_OF[id] = 'flight-controls';
for (const id of ['nacelle-left', 'nacelle-right', 'fan-left', 'fan-right', ...E]) GROUP_OF[id] = 'propulsion';
for (const id of A) GROUP_OF[id] = 'airfoil-bench';

const ORDER = [
  'fuselage-shell',
  'cockpit-glazing',
  'wing-left',
  'wing-right',
  'wing-tip-left',
  'wing-tip-right',
  ...B,
  'aileron-left',
  'aileron-right',
  'spoiler-left',
  'flap-left',
  'flap-right',
  'slat-left',
  'slat-right',
  'tailplane-left',
  'tailplane-right',
  'elevator-left',
  'elevator-right',
  'fin',
  'rudder',
  'nacelle-left',
  'nacelle-right',
  'fan-left',
  'fan-right',
  ...E,
  ...A,
  'display-plinth',
];

const EXPLODE: Record<string, { dir: Vec3; dist: number }> = {
  'fuselage-shell': { dir: [0, 1, 0], dist: 0.4 },
  'wing-left': { dir: [0, 0, 1], dist: 0.5 },
  'wing-right': { dir: [0, 0, -1], dist: 0.5 },
  'wing-tip-left': { dir: [0, 0.2, 1], dist: 0.75 },
  'wing-tip-right': { dir: [0, 0.2, -1], dist: 0.75 },
  'wing-box-skin': { dir: [0, 1, 0], dist: 0.3 },
  'front-spar': { dir: [-1, 0, 0], dist: 0.15 },
  'rear-spar': { dir: [1, 0, 0], dist: 0.15 },
  'aileron-left': { dir: [0.3, -0.3, 1], dist: 0.65 },
  'aileron-right': { dir: [0.3, -0.3, -1], dist: 0.65 },
  'spoiler-left': { dir: [0, 0.8, 1], dist: 0.6 },
  'flap-left': { dir: [0.4, -0.5, 1], dist: 0.6 },
  'flap-right': { dir: [0.4, -0.5, -1], dist: 0.6 },
  'slat-left': { dir: [-0.6, 0, 1], dist: 0.6 },
  'slat-right': { dir: [-0.6, 0, -1], dist: 0.6 },
  'tailplane-left': { dir: [0, 0, 1], dist: 0.35 },
  'tailplane-right': { dir: [0, 0, -1], dist: 0.35 },
  'elevator-left': { dir: [0.4, 0, 1], dist: 0.45 },
  'elevator-right': { dir: [0.4, 0, -1], dist: 0.45 },
  fin: { dir: [0, 1, 0], dist: 0.35 },
  rudder: { dir: [0.5, 1, 0], dist: 0.45 },
  'nacelle-left': { dir: [0, -1, 0.4], dist: 0.35 },
  'nacelle-right': { dir: [0, -1, -0.4], dist: 0.35 },
  'fan-left': { dir: [-1, -0.6, 0.3], dist: 0.5 },
  'fan-right': { dir: [-1, -0.6, -0.3], dist: 0.5 },
  'engine-shell': { dir: [0, 0, 1], dist: 0.3 },
  'fan-disc': { dir: [-1, 0, 0], dist: 0.3 },
  'bypass-duct': { dir: [0, 1, 0], dist: 0.2 },
  'compressor-bank': { dir: [0, 1, 0], dist: 0.2 },
  'compressor-rotor': { dir: [0, -1, 0], dist: 0.25 },
  'combustor-ring': { dir: [0, -1, 0], dist: 0.32 },
  'turbine-bank': { dir: [0, 1, 0], dist: 0.25 },
  'hp-turbine-rotor': { dir: [0, -1, 0], dist: 0.42 },
  'lp-turbine-rotor': { dir: [1, -1, 0], dist: 0.4 },
  'hp-shaft': { dir: [0, -1, 0], dist: 0.15 },
  'core-nozzle': { dir: [1, 0, 0], dist: 0.3 },
  'bypass-nozzle': { dir: [1, 1, 0], dist: 0.35 },
};

const CONNECTS: [string, string][] = [
  ['fuselage-shell', 'cockpit-glazing'],
  ['fuselage-shell', 'wing-left'],
  ['fuselage-shell', 'wing-right'],
  ['fuselage-shell', 'tailplane-left'],
  ['fuselage-shell', 'tailplane-right'],
  ['fuselage-shell', 'fin'],
  ['wing-left', 'wing-tip-left'],
  ['wing-right', 'wing-tip-right'],
  ['wing-left', 'aileron-left'],
  ['wing-right', 'aileron-right'],
  ['wing-left', 'spoiler-left'],
  ['wing-left', 'flap-left'],
  ['wing-right', 'flap-right'],
  ['wing-left', 'slat-left'],
  ['wing-right', 'slat-right'],
  ['wing-left', 'nacelle-left'],
  ['wing-right', 'nacelle-right'],
  ['tailplane-left', 'elevator-left'],
  ['tailplane-right', 'elevator-right'],
  ['fin', 'rudder'],
  ['nacelle-left', 'fan-left'],
  ['nacelle-right', 'fan-right'],
  ['wing-box-skin', 'front-spar'],
  ['wing-box-skin', 'rear-spar'],
  ['wing-box-skin', 'wing-ribs'],
  ['front-spar', 'wing-ribs'],
  ['rear-spar', 'wing-ribs'],
  ['fan-disc', 'lp-shaft'],
  ['fan-disc', 'bypass-duct'],
  ['bypass-duct', 'engine-shell'],
  ['bypass-duct', 'bypass-nozzle'],
  ['engine-shell', 'bypass-nozzle'],
  ['engine-shell', 'compressor-bank'],
  ['engine-shell', 'turbine-bank'],
  ['engine-shell', 'core-nozzle'],
  ['compressor-bank', 'compressor-rotor'],
  ['compressor-bank', 'combustor-ring'],
  ['compressor-rotor', 'hp-shaft'],
  ['combustor-ring', 'turbine-bank'],
  ['turbine-bank', 'hp-turbine-rotor'],
  ['turbine-bank', 'lp-turbine-rotor'],
  ['turbine-bank', 'core-nozzle'],
  ['hp-turbine-rotor', 'hp-shaft'],
  ['lp-turbine-rotor', 'lp-shaft'],
  ['foil-sample', 'chord-marker'],
  ['foil-sample', 'angle-marker'],
];
const connectsOf = (id: string) => CONNECTS.flatMap(([a, b]) => (a === id ? [b] : b === id ? [a] : []));

function geometry(): Record<string, Json> {
  const out: Record<string, Json> = {};
  out['fuselage-shell'] = { primitive: fuselage(), extra: [windowRow(1), windowRow(-1)], shell: true };
  out['cockpit-glazing'] = { primitive: cockpit() };
  out['wing-left'] = { primitive: mainWing(1), shell: true };
  out['wing-right'] = { primitive: mainWing(-1), shell: true };
  out['wing-tip-left'] = { primitive: winglet(1) };
  out['wing-tip-right'] = { primitive: winglet(-1) };
  out['aileron-left'] = { primitive: trailingSurface(AILERON[0], AILERON[1], 1) };
  out['aileron-right'] = { primitive: trailingSurface(AILERON[0], AILERON[1], -1) };
  out['spoiler-left'] = { primitive: spoiler() };
  out['flap-left'] = { primitive: trailingSurface(FLAP[0], FLAP[1], 1, true) };
  out['flap-right'] = { primitive: trailingSurface(FLAP[0], FLAP[1], -1, true) };
  out['slat-left'] = { primitive: slat(1) };
  out['slat-right'] = { primitive: slat(-1) };
  out['tailplane-left'] = { primitive: tailplane(1) };
  out['tailplane-right'] = { primitive: tailplane(-1) };
  out['elevator-left'] = { primitive: elevator(1) };
  out['elevator-right'] = { primitive: elevator(-1) };
  out.fin = { primitive: fin() };
  out.rudder = { primitive: rudder() };
  for (const [id, side] of [
    ['left', 1],
    ['right', -1],
  ] as const) {
    out[`nacelle-${id}`] = { ...nacelle(side), shell: true };
    out[`fan-${id}`] = { primitive: airlinerFan(side) };
  }
  Object.assign(out, wingBox(), engineParts(), experiment());
  return out;
}

/* Poses (docs/45 §3.3; DESIGN angles, S58). */
function poses(): Json {
  const roll = 12,
    pitch = 10,
    yaw = 10;
  const ail = (side: 1 | -1, down: number) => teDown(hingeAt(AILERON[0], side), hingeAt(AILERON[1], side), down);
  const elev = (side: 1 | -1) => teDown([Ht(0.09), yTail(0.09), side * 0.09], [Ht(0.68), yTail(0.68), side * 0.68], -pitch);
  const rudderHinge: [Vec3, Vec3] = [
    [finH(RUDDER[0]), RUDDER[0], 0],
    [finH(RUDDER[1]), RUDDER[1], 0],
  ];
  // A vertical hinge: turn the rudder so its trailing edge swings to the right (−Z), the nose yawing right.
  const rudderTurn = (() => {
    for (const sign of [1, -1]) {
      const rot = axisEuler(rudderHinge[0], rudderHinge[1], sign * yaw);
      const q = new Quaternion().setFromEuler(new Euler(rot[0] * DEG, rot[1] * DEG, rot[2] * DEG, 'XYZ'));
      if (new Vector3(0.1, 0, 0).applyQuaternion(q).z < 0) return { pivot: v4(rudderHinge[0]), rotation: rot };
    }
    throw new Error('rudder: no direction');
  })();
  const flap = (side: 1 | -1) => ({ ...teDown(hingeAt(FLAP[0], side), hingeAt(FLAP[1], side), 20), offset: [0.04, 0, 0] });
  const spoilerHinge = (z: number): Vec3 => [H(z) - 0.075, yWing(z) + spoilerLift(), z];
  const bank: Json = { duration: 0 };
  for (const id of W) bank[id] = { pivot: CG, rotation: [-20, 0, 0] };
  return {
    'controls-roll': { 'aileron-left': ail(1, roll), 'aileron-right': ail(-1, -roll) },
    'controls-pitch': { 'elevator-left': elev(1), 'elevator-right': elev(-1) },
    'controls-yaw': { rudder: rudderTurn },
    'controls-bank': bank,
    'high-lift-open': { 'spoiler-left': teDown(spoilerHinge(SPOILER[0]), spoilerHinge(SPOILER[1]), -35), 'flap-left': flap(1), 'flap-right': flap(-1), 'slat-left': { offset: [-0.025, -0.008, 0] }, 'slat-right': { offset: [-0.025, -0.008, 0] } },
  };
}

/* Flows: the airfoil provider and four engine segments in the section plane (just in front of the cut). */
const FLOW_Z = EZ + 0.005;
const enginePath = (pts: [number, number][], sign: 1 | -1) => pts.map(([u, r]) => v4([u, EY + sign * r, FLOW_Z]));
function flows(): Json[] {
  const core = (u: number) => (rIn(u) + rOut(u)) / 2;
  const coldPts: [number, number][] = [
    [-0.66, 0.16],
    [-0.6, 0.15],
    ...[-0.52, -0.4, -0.28, -0.16, -0.05].map((u) => [u, core(u)] as [number, number]),
    [0.03, 0.118],
  ];
  const hotPts: [number, number][] = [
    [0.03, 0.118],
    [0.12, 0.12],
    [0.21, 0.12],
    ...[0.27, 0.35, 0.45, 0.55].map((u) => [u, core(u)] as [number, number]),
    [0.7, 0.12],
    [0.86, 0.1],
    [1.02, 0.07],
  ];
  const bypassPts = (r: number): [number, number][] => [
    [-0.66, r],
    [-0.4, r],
    [-0.1, r - 0.005],
    [0.2, r - 0.015],
    [0.44, r - 0.03],
    [0.72, r - 0.04],
  ];
  const paths = (id: string, pts: [number, number][][]) =>
    pts.flatMap((p, i) => [
      { id: `${id}-top-${i + 1}`, path: enginePath(p, 1) },
      { id: `${id}-bottom-${i + 1}`, path: enginePath(p, -1) },
    ]);
  const intakeLine = (r: number): [number, number][] => [
    [-1.28, r * 1.08],
    [-1.0, r * 1.03],
    [-0.8, r],
  ];
  return [
    { id: 'section-air', group: 'flight-flows', color: 'token:air', count: 128, size: 0.8, speed: 1, spread: 0, whenRun: true, clip: false, flat: true },
    { id: 'engine-intake', group: 'flight-flows', paths: paths('intake', [intakeLine(0.27), intakeLine(0.15)]), speed: 0.25, color: 'token:air', ends: 'open', count: 96, size: 0.8, spread: 0, clip: false, parts: ['bypass-duct', 'fan-disc'] },
    { id: 'engine-bypass', group: 'flight-flows', paths: paths('bypass', [bypassPts(0.3), bypassPts(0.255)]), speed: 0.35, color: 'token:air', ends: 'open', count: 128, size: 0.8, spread: 0, clip: false, parts: ['fan-disc', 'bypass-duct', 'bypass-nozzle'] },
    { id: 'engine-core-cold', group: 'flight-flows', paths: paths('core-cold', [coldPts]), speed: 0.25, color: 'token:air', ends: 'open', count: 96, size: 0.8, spread: 0, clip: false, parts: ['fan-disc', 'compressor-rotor', 'combustor-ring'] },
    { id: 'engine-core-hot', group: 'flight-flows', paths: paths('core-hot', [hotPts]), speed: 0.35, color: 'token:hot', ends: 'open', count: 128, size: 0.8, spread: 0, clip: false, parts: ['combustor-ring', 'hp-turbine-rotor', 'lp-turbine-rotor', 'core-nozzle'] },
  ];
}

function animations(): Json[] {
  const spin = (id: string, target: string, rpm: number) => ({ id, target, kind: 'rotate', axis: [1, 0, 0], rpm });
  return [
    // One non-looping, eased forward illustration; all W parts share the same keys.
    ...W.map((target) => ({ id: `balanced-travel-${target}`, target, kind: 'sequence', loop: false, keys: [{ t: 0, offset: [0, 0, 0] }, { t: 2, offset: [-0.3, 0, 0] }] })),
    spin('fan-left-spin', 'fan-left', 30),
    spin('fan-right-spin', 'fan-right', 30),
    spin('fan-disc-spin', 'fan-disc', 30),
    spin('lp-shaft-spin', 'lp-shaft', 30),
    spin('lp-turbine-spin', 'lp-turbine-rotor', 30),
    spin('hp-shaft-spin', 'hp-shaft', 45),
    spin('compressor-rotor-spin', 'compressor-rotor', 45),
    spin('hp-turbine-spin', 'hp-turbine-rotor', 45),
  ];
}

const ENGINE_CASES = ['engine-intake', 'engine-split', 'engine-core', 'engine-shafts', 'engine-exhaust'];
function sim(): Json {
  const choice = (id: string, en: string, zh: string) => ({ id, label: t(en, zh) });
  const number = (id: string, from: string, en: string, zh: string, unit: string, decimals: number) => ({ id, kind: 'number', from, label: t(en, zh), unit, decimals, tag: 'sim' });
  const on = (cases: string[]) => ({ control: 'diagram-case', is: { in: cases } });
  return {
    kind: 'airfoil',
    airfoil: {
      model: 'joukowski-illustrative-v1',
      angle: 'angle-deg',
      speed: 'airspeed-mps',
      atmosphere: { kind: 'nasa-troposphere', altitude: 'altitude-m' },
      profile: { epsilon: 0.08 },
      chord: CHORD,
      area: 2,
      section: { part: 'foil-sample', origin: ORIGIN },
      stall: { tag: 'illustrative', peakDeg: 12, knots: [[12, 1], [16, 0.85], [20, 0.6]], source: 'S58' },
      sources: ['S4', 'S11', 'S57', 'S58'],
      plot: { y: 'cl-now' },
    },
    controls: [
      { id: 'angle-deg', kind: 'step', label: t('Angle of attack', '迎角'), values: [-20, -16, -12, -8, -4, 0, 4, 8, 12, 16, 20], default: 4, unit: '°' },
      { id: 'airspeed-mps', kind: 'step', label: t('Relative airspeed', '相对空气速度'), values: [0, 20, 30, 40, 50, 60], default: 40, unit: 'm/s' },
      { id: 'altitude-m', kind: 'step', label: t('Altitude', '高度'), values: [0, 5000, 10000], default: 0, unit: 'm' },
      { id: 'flow-view', kind: 'choice', label: t('Flow view', '气流视图'), default: 'streamlines', options: [choice('streamlines', 'Streamlines', '流线'), choice('pressure', 'Pressure', '气压')] },
      {
        id: 'diagram-case',
        kind: 'choice',
        label: t('Diagram', '图示'),
        default: 'none',
        options: [
          choice('none', 'None', '无'),
          choice('vertical', 'Lift and weight', '升力与重力'),
          choice('level', 'Level flight', '水平飞行'),
          choice('axial', 'Thrust and drag', '推力与阻力'),
          choice('bank', 'Bank', '倾斜'),
          choice('weight', 'Weight', '重力'),
          choice('engine-intake', 'Intake', '进气'),
          choice('engine-split', 'Two streams', '分流'),
          choice('engine-core', 'Core', '核心'),
          choice('engine-shafts', 'Shafts', '轴'),
          choice('engine-exhaust', 'Exhaust', '排气'),
        ],
      },
    ],
    outputs: [
      number('angle-now', 'control:angle-deg', 'Angle', '迎角', '°', 0),
      number('speed-now', 'control:airspeed-mps', 'Airspeed', '空气速度', 'm/s', 0),
      number('rho-now', 'rho', 'Air density', '空气密度', 'kg/m³', 3),
      number('q-now', 'q', 'Dynamic pressure', '动压', 'Pa', 1),
      number('cl-now', 'cl', 'Lift coefficient', '升力系数', '', 3),
      number('lift-n', 'lift-n', 'Lift', '升力', 'N', 1),
      {
        id: 'flow-state',
        kind: 'state',
        from: 'flow-state',
        label: t('Flow state', '气流状态'),
        states: {
          still: t('Still', '无气流'),
          'ideal-attached': t('Ideal attached flow', '理想附着流'),
          'separated-illustration': t('Separated-flow illustration', '分离气流示意'),
        },
      },
    ],
    bind: [
      { control: 'diagram-case', animation: W.map((id) => `balanced-travel-${id}`), enabled: { eq: 'level' } },
      { control: 'angle-deg', part: ['foil-sample', 'chord-marker'], rotate: { axis: [0, 0, 1], per: -1, pivot: PIVOT } },
      { output: 'flow-state', flow: 'section-air', airfoilFlow: true },
      { control: 'flow-view', flow: 'section-air', visible: { eq: 'streamlines' } },
      { control: 'diagram-case', flow: 'engine-intake', visible: { in: ENGINE_CASES } },
      { control: 'diagram-case', flow: ['engine-bypass', 'engine-core-cold'], visible: { in: ENGINE_CASES.slice(1) } },
      { control: 'diagram-case', flow: 'engine-core-hot', visible: { in: ENGINE_CASES.slice(2) } },
    ],
    overlays: [
      { kind: 'force-vectors', group: 'flight-flows', per: 0.00015, max: 0.5, arrows: [{ part: 'foil-sample', force: 'lift', dir: [0, 1, 0], value: { output: 'lift-n' } }] },
      {
        kind: 'force-vectors',
        group: 'flight-flows',
        per: 0.0005,
        max: 1,
        arrows: [
          { part: 'fuselage-shell', force: 'gravity', dir: [0, -1, 0], value: 1000, at: 'bottom', when: on(['vertical', 'level', 'bank', 'weight']) },
          { part: 'fuselage-shell', force: 'lift', dir: [0, 1, 0], value: 1000, at: 'top', when: on(['vertical', 'level']) },
          { part: 'fuselage-shell', force: 'lift', dir: [0, 0.9396926208, -0.3420201433], value: 1000, at: 'top', when: { control: 'diagram-case', is: { eq: 'bank' } } },
        ],
      },
      {
        kind: 'force-vectors',
        group: 'flight-flows',
        per: 0.004,
        max: 1,
        arrows: [
          { part: 'fuselage-shell', force: 'thrust', dir: [-1, 0, 0], value: 100, offset: [-2.05, -0.06, 0], when: on(['level', 'axial']) },
          { part: 'fuselage-shell', force: 'drag', dir: [1, 0, 0], value: 100, offset: [2.07, 0.07, 0], when: on(['level', 'axial']) },
        ],
      },
      { kind: 'airfoil-pressure', part: 'foil-sample', group: 'flight-flows', when: { control: 'flow-view', is: { eq: 'pressure' } } },
    ],
  };
}

function build(): Json {
  const geo = geometry();
  const missing = ORDER.filter((id) => !geo[id] || !PART_TEXT[id]);
  if (missing.length) throw new Error(`missing geometry or text: ${missing.join(', ')}`);
  const parts = ORDER.map((id) => {
    const tx = PART_TEXT[id]!;
    const g = geo[id]!;
    const context = id === 'display-plinth';
    return {
      id,
      name: tx.name,
      ...(tx.short ? { short: tx.short } : {}),
      ...(context ? { context: true } : { group: GROUP_OF[id] }),
      summary: tx.summary,
      detail: tx.detail,
      ...g,
      ...(EXPLODE[id] ? { explode: EXPLODE[id] } : {}),
      ...(connectsOf(id).length ? { connects: connectsOf(id) } : {}),
    };
  });
  const preset = (id: string) => ({ id, label: PRESETS[id]!.label, camera: PRESETS[id]!.camera });
  return {
    parts,
    groups: [
      { id: 'airframe', name: t('Airframe', '机体'), color: 'token:ink-2' },
      { id: 'flight-controls', name: t('Controls', '操纵面'), color: 'token:ink-3' },
      { id: 'propulsion', name: t('Propulsion', '推进'), color: 'token:neutral' },
      { id: 'airfoil-bench', name: t('Airfoil', '翼型实验'), color: 'token:signal' },
      { id: 'flight-flows', name: t('Air and forces', '气流与力'), color: 'token:air' },
    ],
    flows: flows(),
    animations: animations(),
    poses: poses(),
    views: {
      assembled: { camera: cam('aircraft-overview') },
      cover: { position: [-4.15, 3.55, 5.0], target: [0.05, 1.18, 0], fov: 30 },
      section: { plane: 'xy' },
      cutaway: { normal: [0, 0, -1], offset: 0 },
      cuts: { 'engine-cut': { normal: [0, 0, -1], offset: EZ, label: t('Engine section', '发动机剖面') } },
    },
    presets: Object.keys(PRESETS).map(preset),
    spec: [
      { key: t('Aircraft', '飞机'), value: t('Generic twin-engine airliner · 1:10', '通用双发客机 · 1:10'), tag: 'design' },
      { key: t('Airfoil', '翼型'), value: t('Symmetric Joukowski · ε 0.08', '对称 Joukowski · ε 0.08'), tag: 'design' },
      { key: t('Reference', '参考'), value: '1 m · 2 m²', tag: 'design' },
      { key: t('Angle range', '迎角范围'), value: '−20…20°', tag: 'sim' },
    ],
    telemetry: [
      { key: t('Angle', '迎角'), unit: '°', follow: 'angle-now', scope: 'observe' },
      { key: t('Airspeed', '空气速度'), unit: 'm/s', follow: 'speed-now', scope: 'observe' },
      { key: t('Density', '密度'), unit: 'kg/m³', follow: 'rho-now', scope: 'observe' },
      { key: t('Dynamic pressure', '动压'), unit: 'Pa', follow: 'q-now', scope: 'observe' },
      { key: t('Lift coefficient', '升力系数'), unit: '', follow: 'cl-now', scope: 'observe' },
      { key: t('Lift', '升力'), unit: 'N', follow: 'lift-n', scope: 'observe' },
    ],
    sim: sim(),
  };
}

writeFileSync(OUT, `${JSON.stringify(build(), null, 2)}\n`);
console.log(`wrote ${OUT}`);
