/** Topic-owned pond-frog observations. Body sections and surface details share
 * the same sampled profile; mouth curves sit directly against the skin.
 * Four separate forefingers, five hind toes, a longest fourth hind toe.
 */
import { Euler, Quaternion, Vector3 } from 'three';
import type { P, V } from './specimens';
const O: V = [0, 0, 0];
const skin = '#78806a', ink = '#363c30';
type Q = [number, number];
const mix = (a: V, b: V, t: number): V => a.map((v, i) => v + (b[i]! - v) * t) as V;
const sw = (path: V[], radius: number | number[], tint = skin, more = {}): P => ({ kind: 'sweep', at: O, path, radius, tint, color: 'tissue', radial: 16, segments: 28, caps: 'round', ...more });
function ell(at: V, scale: V, tint: string, radial = 24, rotation?: V): P {
  return { kind: 'lathe', at, scale, tint, color: 'tissue', segments: radial, profile: Array.from({ length: 13 }, (_, i) => [i === 0 || i === 12 ? 0 : Math.sin(i * Math.PI / 12), -Math.cos(i * Math.PI / 12)]), ...(rotation ? { rotation } : {}) };
}
function bezier(a: Q, b: Q, c: Q, d: Q, t: number): Q {
  const u = 1 - t;
  return [0, 1].map(i => u ** 3 * a[i]! + 3 * u * u * t * b[i]! + 3 * u * t * t * c[i]! + t ** 3 * d[i]!) as Q;
}
function outline(sections: [Q, Q, Q, Q][], steps = 16): Q[] {
  return sections.flatMap((s, k) => Array.from({ length: steps + (k === sections.length - 1 ? 1 : 0) }, (_, i) => bezier(...s, i / steps)));
}
// x/r upper half: vertical tangent at both poles closes the surface smoothly.
const adultProfile = outline([
  [[-.55, 0], [-.55, .11], [-.46, .25], [-.35, .25]],
  [[-.35, .25], [-.24, .25], [-.05, .22], [.10, .22]],
  [[.10, .22], [.23, .22], [.34, .10], [.34, 0]],
]);
const larvaProfile = outline([
  [[-.43, 0], [-.43, .08], [-.34, .15], [-.24, .16]],
  [[-.24, .16], [-.12, .17], [.02, .12], [.08, .075]],
  [[.08, .075], [.16, .055], [.21, .02], [.22, 0]],
], 12);
function body(profile: Q[], centerY: number, flat: number, radial = 48): P {
  return { kind: 'lathe', at: [0, centerY, 0], profile: profile.map(([x, r]) => [r, -x]).reverse(), segments: radial, scale: [flat, 1, 1], rotation: [0, 0, 90], color: 'tissue', tint: skin };
}
function radiusAt(profile: Q[], x: number): number {
  let i = 0;
  while (i < profile.length - 2 && profile[i + 1]![0] < x) i++;
  const a = profile[i]!, b = profile[i + 1]!;
  return a[1] + (b[1] - a[1]) * Math.max(0, Math.min(1, (x - a[0]) / (b[0] - a[0])));
}
function surface(profile: Q[], centerY: number, flat: number, x: number, z: number): V {
  const r = radiusAt(profile, x);
  return [x, centerY + flat * Math.sqrt(Math.max(0, r * r - z * z)), z];
}
function frontAt(profile: Q[], r: number): number {
  const end = profile.findIndex((p, i) => i > 0 && p[1] >= r);
  if (end < 1) return profile[0]![0];
  const a = profile[end - 1]!, b = profile[end]!;
  return a[0] + (b[0] - a[0]) * (r - a[1]) / (b[1] - a[1]);
}
function mouth(profile: Q[], centerY: number, flat: number, width: number, y: number, thick: number): P {
  const path: V[] = Array.from({ length: 17 }, (_, i) => {
    const z = (i / 8 - 1) * width, yy = y + .018 * (z / width) ** 2;
    const r = Math.hypot(z, (yy - centerY) / flat);
    return [frontAt(profile, r) - .0018, yy, z];
  });
  return sw(path, thick, ink, { radial: 8, segments: 32 });
}
const rotationTo = (normal: V): V => {
  const e = new Euler().setFromQuaternion(new Quaternion().setFromUnitVectors(new Vector3(0, 0, 1), new Vector3(...normal).normalize()));
  return [e.x, e.y, e.z].map(n => n * 180 / Math.PI) as V;
};
const displaced = (p: V, n: V, distance: number): V => p.map((v, i) => v + n[i]! * distance) as V;
function joined(strands: { path: V[]; radius: number[] }[], tint: string, radial: number, segments: number): P {
  const path: V[] = [], radius: number[] = [];
  for (const strand of strands) {
    if (path.length) { path.push([-.23, .22, 0]); radius.push(.00001); }
    path.push(...strand.path); radius.push(...strand.radius);
  }
  return sw(path, radius, tint, { radial, segments, caps: 'flat' });
}
/** Each digit has a narrow metapodial root, a fuller first joint and rounded
 * terminal pad. Separate sweeps preserve every cap at close-up distance. */
function digits(ankle: V, ends: V[], thick: number): P[] {
  return ends.map((end, i) => {
    const p1 = mix(ankle, end, .22), p2 = mix(ankle, end, .57), p3 = mix(ankle, end, .86);
    p1[1] += .001; p2[1] += .004;
    p2[2] += .003 * Math.sin(i * 2.2);
    return sw([ankle, p1, p2, p3, end], [thick * .72, thick, thick * .72, thick * .50, thick * .34], skin, { radial: ends.length === 4 ? 10 : 12, segments: 20, section: { flat: .74 }, up: [0, 1, 0] });
  });
}
/** Membrane meets the underside of each digit before curving into a deep,
 * smoothly sampled sinus; the longest fourth toe remains visibly free. */
function hindFoot(ankle: V, side: number, size = 1): P[] {
  const ends = [[.34, -.024, side * .33], [.43, -.023, side * .39], [.51, -.022, side * .48], [.59, -.021, side * .59], [.43, -.022, side * .69]].map(p => mix(ankle, p as V, size));
  const shape: Q[] = [[ankle[0], -ankle[2]]];
  for (let i = 0; i < ends.length; i++) {
    const a = mix(ankle, ends[i]!, .80); shape.push([a[0], -a[2]]);
    if (i < ends.length - 1) {
      const b = mix(ankle, ends[i + 1]!, .80), dip = mix(ankle, mix(ends[i]!, ends[i + 1]!, .5), .41);
      for (let j = 1; j <= 10; j++) {
        const t = j / 10, u = 1 - t;
        shape.push([u * u * a[0] + 2 * u * t * dip[0] + t * t * b[0], -(u * u * a[2] + 2 * u * t * dip[2] + t * t * b[2])]);
      }
    }
  }
  return [...digits(ankle, ends, .014 * size), { kind: 'extrude', at: [0, ankle[1] - .013 * size, 0], shape, rotation: [-90, 0, 0], depth: .003 * size, bevel: .001 * size, color: 'tissue', tint: '#879174' }];
}
export function frog(tail = false): P[] {
  const p: P[] = [body(adultProfile, .22, .69), mouth(adultProfile, .22, .69, .207, .190, .0028)];
  // Opposite upper limbs share a hidden continuation through the torso, while
  // their exposed wrist and knee ends retain genuine round geometry caps.
  p.push(sw([[.30,.12,-.31],[.255,.18,-.25],[.10,.22,-.14],[.06,.22,0],[.105,.22,.14],[.26,.184,.25],[.305,.125,.31]], [.068,.106,.091,.09,.091,.106,.068], skin, { radial:24, segments:72 }));
  p.push(sw([[-.406,-.015,-.32],[-.285,.037,-.30],[-.195,.115,-.263],[-.23,.22,-.16],[-.24,.23,0],[-.23,.22,.16],[-.195,.115,.263],[-.285,.037,.30],[-.406,-.015,.32]], [.021,.032,.043,.049,.04,.049,.043,.032,.021], skin, { radial:20, segments:72 }));
  const folds: { path: V[]; radius: number[] }[] = [], drums: { path: V[]; radius: number[] }[] = [];
  for (const side of [-1, 1]) {
    const eye: V = [-.354, .365, side * .153], normal: V = [-.36, .32, side * .876], rot = rotationTo(normal);
    p.push(ell(eye, [.052, .046, .046], '#b2a162', 32, rot));
    p.push(ell(displaced(eye, normal, .044), [.029, .011, .005], ink, 24, rot));
    const q = new Quaternion().setFromEuler(new Euler(...rot.map(v=>v*Math.PI/180) as V));
    const lid:V[]=Array.from({length:13},(_,i)=>{
      const a=(18+i*12)*Math.PI/180;
      return new Vector3(.052*.95*Math.cos(a),.046*.95*Math.sin(a),.046*Math.sqrt(1-.95**2)).applyQuaternion(q).add(new Vector3(...eye)).toArray() as V;
    });
    folds.push({path:lid,radius:lid.map((_,i)=>i===0||i===12?.001:.0065)});
    const dorsal=Array.from({length:9},(_,i)=>{const v=surface(adultProfile,.22,.69,-.275+i*.054,side*(.145-i*.003));v[1]-=.002;return v;});
    folds.push({path:dorsal,radius:[.001,.004,.005,.006,.006,.005,.004,.003,.001]});
    const drum:V=[-.223,.268,side*.236], dn:V=[0,.20,side*.98];
    drums.push({path:[-.007,-.004,0,.004,.007].map(d=>displaced(drum,dn,d)),radius:[.00001,.027,.036,.027,.00001]});
    const ankle: V = [.17, -.008, side * .45];
    p.push(sw([[side===1?.305:.30, side===1?.125:.12, side * .31], [.17, .056, side * .35], [-.017, .018, side * .39], [.065, .004, side * .43], ankle], [.064, .057, .037, .029, .023], skin, { radial: 20, segments: 32 }));
    p.push(...hindFoot(ankle, side));
    const wrist: V = [-.406, -.015, side * .32];
    p.push(...digits(wrist, [[-.556, -.029, side * .225], [-.640, -.029, side * .291], [-.618, -.028, side * .379], [-.548, -.027, side * .439]], .0115));
  }
  p.push(joined(folds,skin,8,144),joined(drums,'#74765e',16,96));
  if (tail) p.push(sw([[.23, .22, 0], [.39, .185, .008], [.55, .15, .035], [.66, .128, .054]], [.065, .044, .021, .001], skin, { radial: 20, segments: 36, section: { flat: .55 }, up: [0, 0, 1], caps: 'flat' }));
  return p;
}
export function tadpole(legs = false): P[] {
  const fin = outline([
    [[-.025, .117], [.045, .218], [.12, .305], [.27, .318]],
    [[.27, .318], [.43, .329], [.64, .283], [.758, .250]],
    [[.758, .250], [.65, .154], [.50, .048], [.34, -.005]],
    [[.34, -.005], [.16, -.047], [.03, .007], [-.025, .117]],
  ], 16);
  const p: P[] = [
    body(larvaProfile, .12, .88, 40),
    sw([[.015, .115, 0], [.19, .105, .008], [.40, .13, .012], [.61, .20, 0], [.755, .25, -.009]], [.089, .068, .042, .018, .0006], skin, { radial: 16, segments: 32, section: { flat: .45 }, up: [0, 0, 1], caps: 'flat' }),
    { kind: 'extrude', at: O, shape: fin, depth: .0035, bevel: .0012, color: 'membrane', tint: '#a0a88b' },
    mouth(larvaProfile, .12, .88, .039, .093, .0023),
  ];
  for (const side of [-1, 1]) {
    const n: V = [-.12, .62, side * .775], rot = rotationTo(n), eye = surface(larvaProfile, .12, .88, -.315, side * .082);
    p.push(ell(displaced(eye, n, .001), [.029, .027, .013], '#a69a69', 20, rot));
    p.push(ell(displaced(eye, n, .012), [.020, .020, .006], ink, 16, rot));
    p.push(ell(displaced(displaced(eye, n, .017), [-.5, .86, 0], .007), [.0035, .0035, .0015], '#dadbc6', 12, rot));
    if (legs) {
      const ankle: V = [.18, -.038, side * .33];
      p.push(sw([[.035, .10, side * .105], [.19, .046, side * .223], [.095, -.008, side * .278], ankle], [.044, .046, .025, .015], skin, { radial: 16, segments: 24 }));
      p.push(...hindFoot(ankle, side, .47));
    }
  }
  return p;
}
