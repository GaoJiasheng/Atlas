/**
 * Build-time bird study: continuous feathered body, bill, overlapping remiges,
 * graduated rectrices and anisodactyl feet. Fossils uses the Javan myna preset;
 * bill/neck/leg/wing/tail parameters are reusable by mangrove heron,
 * flower-and-seed sunbird, frog-and-chicken hen and living-things specimens.
 * Dimensions are an original teaching reconstruction, not specimen measurements.
 */
import type { Primitive } from '../../../src/engines/space-scene/schema';

type V = [number, number, number];
type P2 = [number, number];
export interface BirdOptions {
  /** Body anchor; default matches the fossils author frame, looking toward −X. */
  origin?: V;
  scale?: number;
  bill?: 'myna' | 'dagger' | 'decurved' | 'conical';
  billLength?: number;
  neckLength?: number;
  legLength?: number;
  wingLength?: number;
  tailLength?: number;
  tailFan?: number;
  crest?: boolean;
  bodyTint?: string;
  billLegTint?: string;
  patchTint?: string;
}
export interface BirdGeometry { body: Primitive[]; wing: Primitive[]; legs: Primitive[]; feather: Primitive[] }
const ink = 'token:ink-2';
const bone = 'token:bone';
const anchor: V = [-1.65, 1.02, 0];

function sweep(at: V, path: V[], radius: number | number[], tint: string, flat = 1, segments = 16): Primitive {
  return { kind: 'sweep', at, path, radius, radial: 48, segments, caps: 'round', closed: false,
    section: { flat }, up: [0, 0, 1], color: 'powder', tint };
}

// One rounded asymmetric vane outline is reused with placement/scale; static
// geometry is merged by the stage into material batches for each selectable part.
const vane: P2[] = Array.from({ length: 25 }, (_, i): P2 => {
  const t = i / 24 * Math.PI * 2;
  const u = (1 - Math.cos(t)) / 2;
  const v = Math.sin(t) * (Math.sin(t) >= 0 ? .58 : .42) * Math.pow(Math.max(.001, 1 - u), .24);
  return [u, v];
});
function flightFeather(root: V, tip: V, width: number, tint: string): Primitive {
  const dx = tip[0] - root[0], dy = tip[1] - root[1], dz = tip[2] - root[2];
  const length = Math.hypot(dx, dy, dz);
  return { kind: 'extrude', at: root, shape: vane, depth: .006, bevel: .0015,
    rotation: [0, Math.atan2(-dz, dx) * 180 / Math.PI, Math.asin(dy / length) * 180 / Math.PI],
    scale: [length, width, 1], color: 'powder', tint };
}
function spot(at: V, radius: number, scale: V, tint: string): Primitive {
  return { kind: 'sphere', at, size: [radius], scale, color: 'powder', tint };
}

/** Four arrays map directly onto the existing bird/wing/leg/feather part IDs. */
export function buildBird(options: BirdOptions = {}): BirdGeometry {
  const body: Primitive[] = [], wing: Primitive[] = [], legs: Primitive[] = [], feather: Primitive[] = [];
  const dark = options.bodyTint ?? ink, pale = options.patchTint ?? bone;
  const billLeg = options.billLegTint ?? bone;
  const neck = options.neckLength ?? 1, leg = options.legLength ?? 1;
  const wingLength = options.wingLength ?? 1, tailLength = options.tailLength ?? 1;
  const lift = .47 * (leg - 1), headLift = .32 * (neck - 1);
  const headY = 1.39 + headLift + lift;

  // A smoothly lofted back, breast, nape and cranium share one axial surface:
  // no sphere-on-egg neck seam. The narrowed nape opens into a rounded forehead.
  body.push(sweep([-1.65, 1.02 + lift, 0], [
    [.40, -.11, 0], [.26, -.015, 0], [.035, .025, 0], [-.16, .10, 0],
    [-.255, .205 + headLift * .35, 0], [-.285, .345 + headLift, 0],
    [-.365, .395 + headLift, 0], [-.435, .370 + headLift, 0],
  ], [.035, .175, .255, .224, .145, .158, .158, .055], dark, .78, 56));

  const billPreset = options.bill ?? 'myna';
  const billLength = options.billLength ?? ({ myna: .245, dagger: .47, decurved: .33, conical: .14 }[billPreset]);
  const downcurve = billPreset === 'decurved' ? .11 : .012;
  const billRadius = billPreset === 'conical' ? .075 : billPreset === 'dagger' ? .045 : .059;
  const billRoot: V = [-2.075, headY, 0];
  body.push(sweep(billRoot, [[0, .018, 0], [-billLength * .28, .015, 0],
    [-billLength * .72, -.005 - downcurve * .35, 0], [-billLength, -.025 - downcurve, 0]],
  [billRadius, billRadius * .82, billRadius * .38, .002], billLeg, .60, 20));
  body.push(sweep([-2.075, headY - .034, 0], [[0, 0, 0], [-billLength * .38, -.007, 0],
    [-billLength * .78, -.004 - downcurve * .65, 0], [-billLength * .97, -.002 - downcurve, 0]],
  [billRadius * .62, billRadius * .48, billRadius * .22, .0015], billLeg, .50, 20));
  // The narrow dark gape separates upper maxilla from lower mandible.
  for (const side of [-1, 1]) {
    body.push(sweep([-2.081, headY - .012, side * .044], [[0, 0, 0], [-billLength * .45, -.006, -side * .012],
      [-billLength * .88, -.011 - downcurve * .65, -side * .035]], [.0026, .0021, .0008], dark, 1, 8));
    body.push(spot([-2.115, headY + .026, side * .045], .009, [1.4, .56, .40], dark));
    // Pale iris and black pupil; no bare yellow Common-Myna eye patch.
    body.push(spot([-2.014, headY + .060, side * .130], .027, [1, 1, .32], pale));
    body.push(spot([-2.017, headY + .061, side * .138], .014, [1, 1, .30], dark));
    body.push(spot([-2.022, headY + .068, side * .143], .0045, [1, 1, .4], pale));
  }
  if (options.crest !== false) for (let i = 0; i < 5; i++) {
    const x = -2.067 + i * .024;
    body.push(flightFeather([x, headY + .145 - i * .003, -.016],
      [x + .024, headY + .231 - i * .014, -.016], .048, dark));
  }

  // Tail feathers lie behind the rump and overlap like a small graduated fan.
  // White tips are placed on each actual feather, rather than a tail plank.
  for (let i = 0; i < 7; i++) {
    const fan = (i - 3) / 3 * (options.tailFan ?? .135);
    const length = (.47 - Math.abs(i - 3) * .026) * tailLength;
    const root: V = [-1.35, .943 + lift, fan * .28];
    const tip: V = [root[0] + length, root[1] - .285 + Math.abs(i - 3) * .011, fan];
    body.push(flightFeather(root, tip, .103, dark));
    const whiteRoot: V = [root[0] + (tip[0] - root[0]) * .84,
      root[1] + (tip[1] - root[1]) * .84, root[2] + (tip[2] - root[2]) * .84 + .004];
    body.push(flightFeather(whiteRoot, [tip[0], tip[1], fan + .004], .060, pale));
  }
  body.push(sweep([-1.34, .825 + lift, 0], [[0, 0, 0], [.14, -.07, 0]], [.075, .025], pale, .70, 12));

  // Layered folded primaries, secondaries, then smaller overlapping coverts.
  // Both wings are present, retaining a complete silhouette when orbited.
  for (const side of [-1, 1]) {
    const z = side * .208;
    for (let i = 0; i < 8; i++) {
      const u = i / 7;
      const root: V = [-1.77 + u * .10, 1.18 - u * .07 + lift, z + side * .010];
      const tip: V = [root[0] + (.36 + u * .10) * wingLength,
        root[1] - (.37 - u * .10) * wingLength, z + side * .010];
      wing.push(flightFeather(root, tip, .069, dark));
    }
    for (let i = 0; i < 4; i++) {
      const u = i / 3;
      const root: V = [-1.83 + u * .22, 1.175 - u * .016 + lift, z + side * .025];
      wing.push(flightFeather(root, [root[0] + .29 * wingLength,
        root[1] - (.18 + u * .026) * wingLength, root[2]], .085, dark));
    }
    // Exposed white bases of flight feathers form the characteristic wing bar.
    for (let i = 0; i < 2; i++) {
      const root: V = [-1.73 + i * .073, 1.105 - i * .034 + lift, z + side * .031];
      wing.push(flightFeather(root, [root[0] + .17, root[1] - .09, root[2]], .089, pale));
    }
    for (let i = 0; i < 2; i++) {
      const root: V = [-1.85 + i * .105, 1.195 - i * .027 + lift, z + side * .042];
      wing.push(flightFeather(root, [root[0] + .19, root[1] - .10, root[2]], .12, dark));
    }
  }

  // Feathered thigh, exposed tibiotarsus, intertarsal joint and scutellate
  // tarsometatarsus. Foot has digits II–IV forward, digit I (hallux) backward.
  for (const side of [-1, 1]) {
    const z = side * .128;
    legs.push(sweep([-1.63, .93 + lift, z], [[0, 0, 0], [-.06, -.19, side * .010]], [.08, .032], dark, .86, 12));
    const ankleY = .30 + .235 * leg;
    legs.push(sweep([-1.69, .73 + lift, z], [[0, 0, 0], [.035, ankleY - (.73 + lift), side * .012]], [.026, .020], billLeg, .88, 12));
    legs.push(spot([-1.655, ankleY, z + side * .012], .026, [.9, 1, .9], billLeg));
    const tarsus = sweep([-1.655, ankleY, z + side * .012], [[0, 0, 0], [-.055, .30 - ankleY, 0]], [.020, .016], billLeg, .88, 20);
    if (tarsus.kind === 'sweep') tarsus.rings = { every: .028, depth: .16 };
    legs.push(tarsus);
    const foot: V = [-1.71, .30, z + side * .012];
    for (let digit = 0; digit < 3; digit++) {
      const spread = (digit - 1) * .095;
      const length = digit === 1 ? .205 : .166;
      const path: V[] = [[0, 0, 0], [-length * .36, -.025, spread * .40],
        [-length * .72, -.029, spread * .85], [-length, -.024, spread]];
      const toe = sweep(foot, path, [.014, .0135, .0105, .007], billLeg, .82, 16);
      if (toe.kind === 'sweep') toe.rings = { every: .037, depth: .12 };
      legs.push(toe);
      legs.push(sweep([foot[0] - length, foot[1] - .024, foot[2] + spread],
        [[0, 0, 0], [-.027, .005, spread * .09], [-.037, -.009, spread * .10]], [.007, .005, .0008], dark, .85, 8));
    }
    const halluxZ = -side * .041;
    legs.push(sweep(foot, [[.005, .014, 0], [.067, -.020, halluxZ * .7], [.119, -.023, halluxZ]],
      [.011, .010, .006], billLeg, .85, 12));
    legs.push(sweep([foot[0] + .119, foot[1] - .023, foot[2] + halluxZ],
      [[0, 0, 0], [.026, .005, 0], [.035, -.010, 0]], [.006, .004, .0008], dark, .85, 8));
  }

  // Enlarged comparison flight feather: asymmetric vanes straddle an off-centre
  // rachis, with swept barbs on the vane surfaces and a projecting bare calamus.
  const featherAt: V = [-.52, 1.14, .40];
  const featherOutline: P2[] = [[-.008, -.63], [-.09, -.49], [-.17, -.22], [-.19, .10],
    [-.15, .39], [-.06, .68], [.018, .83], [.115, .67], [.25, .37], [.30, .04],
    [.25, -.24], [.14, -.47], [.012, -.63]];
  const barbs: P2[][] = [];
  feather.push(sweep([-.52, 1.14, .414], [[0, -.79, 0], [0, -.43, 0], [.006, .13, 0], [.018, .78, 0]],
    [.013, .012, .008, .0015], dark, 1, 24));
  for (let i = 0; i < 13; i++) {
    const y = -.47 + i * .085;
    const tipY = y + .18;
    const width = Math.max(.025, .28 * Math.sin((tipY + .63) / 1.46 * Math.PI));
    for (const side of [-1, 1]) barbs.push([[.005, y], [side * width * (side < 0 ? .53 : .76), y + .105],
      [side * width * (side < 0 ? .65 : 1), tipY]]);
  }
  feather.unshift({ kind: 'wing', at: featherAt, outline: featherOutline, veins: barbs, thickness: .018, color: 'powder', tint: pale });

  const scale = options.scale ?? 1, origin = options.origin ?? anchor;
  for (const array of [body, wing, legs, feather]) for (const primitive of array) {
    primitive.at = primitive.at.map((v, i) => origin[i]! + (v - anchor[i]!) * scale) as V;
    primitive.scale = (primitive.scale ?? [1, 1, 1]).map(v => v * scale) as V;
  }
  return { body, wing, legs, feather };
}
