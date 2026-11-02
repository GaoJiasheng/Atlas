/** Osteological building blocks for fossils-and-skeletons: tyrannosaur and
 * diplodocid studies. Reusable by future dinosaur/museum topics. All geometry
 * is original, inferred from published anatomy, not a specimen inventory.
 * Functions return existing engine primitives; no rendering or file I/O.
 */
import type { Primitive } from '../../../src/engines/space-scene/schema';
export type Point = [number, number, number];
type XY = [number, number];
const bone = 'token:bone';
const add = (a: Point, b: Point): Point => a.map((v, i) => v + b[i]!) as Point;
const lerp = (a: Point, b: Point, t: number): Point => a.map((v, i) => v + (b[i]! - v) * t) as Point;
/** Thin bones (ribs, teeth, claws, phalanges) are a few pixels across even in
 * close-ups: 24 (or 16 below FINE_BONE) radial divisions keep them round at a
 * fraction of the triangles, which keeps software-GL frames fast. */
export const THIN_BONE = .045;
export const FINE_BONE = .03;
export function boneSweep(at: Point, path: Point[], radius: number | number[], flat = 1, segments = 16): Primitive {
  const widest = Math.max(...[radius].flat());
  return { kind: 'sweep', at, path, radius, section: { flat }, up: [0, 0, 1], radial: widest < FINE_BONE ? 16 : widest < THIN_BONE ? 24 : 48, segments, caps: 'round', color: 'tissue', tint: bone } as Primitive;
}
function plate(at: Point, shape: XY[], depth: number, holes: XY[][] = [], rotation: Point = [0, 0, 0]): Primitive {
  return { kind: 'extrude', at, shape, holes, depth, bevel: Math.min(.012, depth * .18), rotation, color: 'tissue', tint: bone } as Primitive;
}
const oval = (x: number, y: number, rx: number, ry: number): XY[] => Array.from({ length: 24 }, (_, i) => [x + rx * Math.cos(i * Math.PI / 12), y + ry * Math.sin(i * Math.PI / 12)]);

/** Separate articular ends, a narrow curved diaphysis and a distal condyle.
 * Direction and proportions are supplied in author coordinates. */
export function longBone(a: Point, b: Point, shaft: number, head = shaft * 1.65, bend = .02): Primitive {
  const d = b.map((v, i) => v - a[i]!) as Point;
  const path = [0, .07, .18, .38, .65, .85, .95, 1].map(t => [d[0] * t + Math.sin(t * Math.PI) * bend, d[1] * t, d[2] * t] as Point);
  return boneSweep(a, path, [head * .7, head, shaft * 1.1, shaft, shaft * .88, shaft * 1.1, head * .96, head * .7], .78, 20);
}

/** Centrum + perforated neural arch/spine. Local X is the spine axis;
 * `chevron` adds a ventral haemal process to a caudal arch. */
export function vertebra(at: Point, length: number, radius: number, spine: number, angle = 0, chevron = 0, fork = false): Primitive[] {
  const centrum: Primitive = { kind: 'lathe', at, segments: 48, profile: [[0, -length * .47], [radius * .95, -length * .47], [radius, -length * .34], [radius * .72, 0], [radius, length * .34], [radius * .95, length * .47], [0, length * .47]], rotation: [0, 0, angle - 90], scale: [1, 1, .86], color: 'tissue', tint: bone } as Primitive;
  const r = radius;
  const archHeight = fork ? spine * .35 : spine;
  const outline: XY[] = [[-length * .42, -.12 * r], [-length * .44, r], [-length * .22, r * 1.7], [-length * .17, r + archHeight], [length * .18, r + archHeight * .94], [length * .33, r * 1.5], [length * .46, r * .92], [length * .4, -.12 * r], [length * .14, -r * .5], [length * .12, -r - chevron], [-length * .08, -r - chevron * .95], [-length * .19, -r * .5]];
  const arch = plate(at, outline, r * .6, [oval(0, r * .89, length * .19, r * .34)], [0, 0, angle]);
  const out = [centrum, arch];
  if (fork) {
    // Paired metapophyses: the characteristic bifid cervical neural spines.
    out.push(boneSweep(at, [[0, r * 1.5, -.5 * r], [0, r + spine, -.9 * r], [0, r + spine * 1.02, -r]], [.35 * r, .26 * r, .12 * r], 1, 6));
    out.push(boneSweep(at, [[0, r * 1.5, .5 * r], [0, r + spine, .9 * r], [0, r + spine * 1.02, r]], [.35 * r, .26 * r, .12 * r], 1, 6));
  }
  return out;
}

/** Sample a curved axis by arc length. Each element has a visible joint gap. */
export function vertebralColumn(path: Point[], count: number, r0: number, r1: number, spine: number, options: { chevrons?: boolean; fork?: boolean; archLimit?: number } = {}): Primitive[] {
  const lengths = path.slice(1).map((p, i) => Math.hypot(...p.map((v, j) => v - path[i]![j]!)));
  const total = lengths.reduce((a, b) => a + b, 0);
  const sample = (t: number) => {
    let d = t * total;
    for (let i = 0; i < lengths.length; i++) {
      if (d <= lengths[i]! || i === lengths.length - 1) return lerp(path[i]!, path[i + 1]!, d / lengths[i]!);
      d -= lengths[i]!;
    }
    return path.at(-1)!;
  };
  const out: Primitive[] = [];
  for (let i = 0; i < count; i++) {
    const t = (i + .5) / count;
    const a = sample(Math.max(0, t - .003)), b = sample(Math.min(1, t + .003));
    const angle = Math.atan2(b[1] - a[1], b[0] - a[0]) * 180 / Math.PI;
    const r = r0 + (r1 - r0) * t;
    const bones=vertebra(sample(t), total / count, r, spine * (1 - .65 * t) * (options.chevrons?r/r0:1), angle, options.chevrons ? r * 1.55 : 0, options.fork);
    // Distal caudals lose the tall arch/processes and become small simple
    // centra. This preserves all joints without a misleading comb to the tip.
    out.push(...(options.archLimit!==undefined&&i>=options.archLimit?bones.slice(0,1):bones));
  }
  return out;
}

/** Paired ribs spring from their own dorsal centrum, sweep caudally and
 * diminish towards the pelvis. The ventral ends remain an open basket. */
export function ribCage(centres: Point[], width: number, height: number, radius: number): Primitive[] {
  return centres.flatMap((at, i) => {
    const t = i / Math.max(1, centres.length - 1);
    const fullness = Math.sin((.22 + .73 * t) * Math.PI);
    const w = width * (.5 + .5 * fullness) * (1 - .2 * t);
    const h = height * (.65 + .35 * fullness) * (1 - .48 * t);
    return [-1, 1].map(s => boneSweep(at, [[0, .015, s * .07], [0, -.07, s * w * .55], [.06, -h * .38, s * w], [.14, -h * .77, s * w * .83], [.23, -h, s * w * .31]], [radius * 1.5, radius, radius * .85, radius * .72, radius * .35], .75, 18));
  });
}

/** Narrow snout widening to the temporal region: curved struts form actual
 * antorbital/orbital/temporal spaces. Maxillae have nasal openings; the
 * paired sides are splayed and curved rather than parallel flat panels. */
export function theropodSkull(): { skull: Primitive[]; jaw: Primitive[] } {
  const skull: Primitive[] = [], jaw: Primitive[] = [];
  for (const s of [-1, 1]) {
    const A = (x: number, y: number, z: number): Point => [x, y, z * s];
    const bar = (path: Point[], radii: number[]) => skull.push(boneSweep([0, 0, 0], path, radii, .8, 20));
    // Nasal roof, maxillary tooth-bearing arcade and lower cheek bar.
    bar([A(-3.57, 2.37, .13), A(-3.38, 2.62, .17), A(-2.95, 2.76, .22), A(-2.63, 2.81, .29), A(-2.36, 2.63, .31)], [.065, .07, .055, .09, .075]);
    bar([A(-3.57, 2.37, .13), A(-3.36, 2.24, .19), A(-3.0, 2.26, .24), A(-2.79, 2.31, .28)], [.075, .10, .075, .055]);
    bar([A(-3.02, 2.28, .24), A(-2.74, 2.28, .29), A(-2.45, 2.30, .35), A(-2.33, 2.42, .32)], [.035, .045, .05, .075]);
    // Lacrimal in front of orbit, postorbital behind it, quadrate at jaw joint.
    bar([A(-2.97, 2.76, .22), A(-2.86, 2.59, .27), A(-2.79, 2.31, .28)], [.065, .047, .04]);
    bar([A(-2.61, 2.79, .29), A(-2.57, 2.59, .33), A(-2.64, 2.30, .33)], [.07, .055, .045]);
    bar([A(-2.36, 2.63, .31), A(-2.28, 2.46, .31), A(-2.36, 2.16, .34)], [.075, .08, .065]);
    // Small fenestrated anterior maxilla, not an entire skull side panel.
    skull.push(plate(A(-3.39, 2.39, .17), [[-.15,-.07],[.27,-.10],[.26,.15],[.07,.22],[-.15,.08]], .065, [oval(.025,.075,.075,.047)], [0, s * -9, 0]));
    skull.push(plate(A(-3.12,2.43,.22),[[-.27,-.15],[.30,-.10],[.24,.20],[.12,.29],[-.18,.17],[-.29,.015]],.048,[oval(.065,.075,.116,.089)],[0,s*-10,0]));
    for (let i = 0; i < 7; i++) {
      const t = i / 6, x = -3.49 + t * .64, z = (.15 + .12 * t) * s;
      skull.push(boneSweep([x, 2.235, z], [[0,0,0],[.007,-.055,0],[.026,-.14 - .035 * Math.sin(t * Math.PI),0],[.039,-.18 - .025 * Math.sin(t * Math.PI),0]], [.037,.034,.018,.002], .68, 10));
    }
    jaw.push(boneSweep([0,0,0], [A(-3.55,2.00,.12), A(-3.35,1.92,.19), A(-2.97,1.94,.25), A(-2.60,2.03,.32), A(-2.36,2.16,.34)], [.048,.065,.053,.075,.06], .72, 24));
    jaw.push(plate(A(-2.66,2.04,.30), [[-.23,-.07],[.19,.03],[.29,.12],[.20,.22],[-.08,.11]], .06, [oval(.025,.065,.12,.034)], [0, s * -7, 0]));
    for (let i = 0; i < 6; i++) jaw.push(boneSweep(A(-3.43+i*.13,1.98+i*.007,.16+i*.025), [[0,0,0],[.005,.075,0],[.026,.136,0]], [.029,.022,.002], .7, 10));
  }
  skull.push(boneSweep([-2.46,2.65,0], [[0,0,-.29],[.01,.10,0],[0,0,.29]], [.065,.095,.065], 1, 14));
  skull.push(boneSweep([-3.48,2.47,0], [[0,0,-.14],[-.04,.07,0],[0,0,.14]], [.05,.055,.05], 1, 12));
  skull.push(boneSweep([-2.32,2.43,0], [[0,.02,-.28],[0,0,0],[0,.02,.28]], [.05,.105,.05], .8, 14));
  jaw.push(boneSweep([-3.53,2,0], [[0,0,-.12],[-.035,-.02,0],[0,0,.12]], .043, 1, 12));
  return { skull, jaw };
}

export function theropodPelvis(): Primitive[] {
  const out: Primitive[] = [];
  for (const s of [-1,1]) {
    const z = s * .29;
    out.push(plate([.51,1.96,z], [[-.52,.13],[-.45,.29],[-.13,.34],[.43,.27],[.56,.14],[.26,.03],[.16,-.18],[-.06,-.22],[-.21,-.02]], .10, [oval(.035,-.015,.13,.11)], [0,s*7,0]));
    out.push(longBone([.52,1.85,z],[.26,1.04,s*.12],.042,.066,-.015));
    out.push(longBone([.59,1.85,z],[1.02,1.21,s*.12],.033,.051,0));
  }
  out.push(boneSweep([.25,1.04,0], [[-.14,0,-.12],[.09,-.02,0],[.22,.015,.12]], [.06,.095,.05], .6, 12));
  return out;
}

export function theropodForelimb(z: number): Primitive[] {
  const s = Math.sign(z), shoulder: Point = [-1.45,1.78,z], elbow: Point = [-1.22,1.53,z], wrist: Point = [-1.42,1.36,z];
  const out = [longBone(shoulder,elbow,.033,.065), longBone(add(elbow,[0,0,.028*s]),add(wrist,[0,0,.022*s]),.019,.034), longBone(add(elbow,[.025,0,-.027*s]),add(wrist,[.02,0,-.022*s]),.018,.03)];
  for (const dz of [-.065,.065]) {
    out.push(boneSweep(wrist, [[0,0,dz],[-.09,-.018,dz],[-.18,-.04,dz],[-.24,-.095,dz]], [.031,.025,.027,.012], .8, 12));
    out.push(boneSweep(add(wrist,[-.24,-.095,dz]), [[0,0,0],[-.045,-.03,0],[-.065,-.085,0]], [.024,.017,.002], .65, 10));
  }
  // Scapula and coracoid belong to the same movable evidence module.
  out.push(longBone([-1.43,1.8,z],[-.9,2.02,z*.9],.038,.06));
  return out;
}

export function theropodHindlimb(z: number): Primitive[] {
  const s = Math.sign(z), hip: Point = [.54,1.85,z-s*.07], knee: Point = [.13,1.13,z+s*.06], ankle: Point = [.48,.44,z+s*.09];
  const out = [longBone(hip,knee,.065,.116,.04), longBone(knee,ankle,.042,.082),longBone(add(knee,[.04,0,s*.09]),add(ankle,[.025,.04,s*.065]),.019,.038)];
  for (const dz of [-.13,0,.13]) {
    const base: Point = [.37,.17,z+s*.1+dz*.2];
    out.push(longBone(add(ankle,[0,0,dz*.3]),base,.025,.037));
    const end = -.48 + Math.abs(dz)*.5;
    // Three phalanges with pinched shafts and enlarged knuckles.
    let start = base;
    for (let j=0;j<3;j++) {
      const next: Point = [base[0]+end*(j+1)/3,.145-j*.007,base[2]+dz*(j+1)/3];
      out.push(longBone(start,next,.020-j*.003,.032-j*.003,0));start=next;
    }
    out.push(boneSweep(start,[[0,0,0],[-.07,.005,dz*.08],[-.13,-.025,dz*.12]],[.027,.019,.002],.65,10));
  }
  out.push(longBone([.46,.34,z],[.58,.25,z-s*.14],.013,.022));
  out.push(boneSweep([.58,.25,z-s*.14],[[0,0,0],[.055,-.018,0],[.08,-.055,0]],[.018,.013,.002],.7,10));
  return out;
}

/** Generic diplodocid: 15 elongate cervicals, ten rib-bearing dorsals, five
 * sacrals and eighty diminishing caudals. Counts are generator anatomy,
 * never a claim about Prince/Apollonia/Twinky's discovered material. */
export function diplodocid(cx: number, z: number): Primitive[] {
  const P = (x:number,y:number,dz=0):Point => [cx+x,y,z+dz];
  const out:Primitive[] = [];
  out.push(...vertebralColumn([P(-1.58,1.6),P(-1.27,1.57),P(-.92,1.42),P(-.56,1.13),P(-.38,1.07)],15,.027,.049,.055,{fork:true}));
  const dorsals = Array.from({length:10},(_,i)=>P(-.35+i*.075,1.08+.055*Math.sin(i/9*Math.PI)));
  for(const p of dorsals) out.push(...vertebra(p,.075,.047,.125));
  out.push(...ribCage(dorsals,.25,.48,.012));
  out.push(...vertebralColumn([P(.36,1.08),P(.62,1.04)],5,.055,.05,.12));
  out.push(...vertebralColumn([P(.62,1.04),P(.95,.97),P(1.48,.88),P(2.12,.89),P(2.75,1.03)],80,.045,.002,.10,{chevrons:true,archLimit:40}));
  // Small, low, fenestrated skull with teeth concentrated at the muzzle.
  for(const s of [-1,1]) {
    out.push(plate(P(-1.69,1.59,s*.035),[[-.16,-.025],[-.16,.035],[-.04,.09],[.095,.05],[.09,-.035],[-.07,-.04]],.018,[oval(-.015,.03,.026,.032),oval(-.095,.025,.035,.017)]));
    out.push(boneSweep(P(-1.69,1.54,s*.032),[[-.15,0,0],[-.07,-.02,0],[.085,.02,0]],[.014,.013,.019],.65,10));
    // Ilium, pubis, ischium; broad scapular blade at forelimb.
    out.push(plate(P(.43,1.04,s*.16),[[-.16,.04],[-.12,.18],[.18,.15],[.22,.02],[.08,-.04],[.02,-.15],[-.07,-.14]],.045,[oval(.03,-.005,.04,.035)]));
    out.push(longBone(P(.44,.97,s*.16),P(.40,.73,s*.10),.018,.032));
    out.push(longBone(P(.48,.97,s*.16),P(.62,.78,s*.10),.016,.029));
    out.push(plate(P(-.28,.93,s*.19),[[-.14,-.14],[-.10,.08],[.16,.23],[.24,.21],[.02,-.02],[-.02,-.14]],.033));
  }
  for(const x of [-.29,.46]) for(const s of [-1,1]) {
    const isHind=x>0, dz=s*(isHind?.16:.19);
    const hip=P(x,.91,dz), knee=P(x+(isHind?.055:-.015),.56,dz+s*.025), ankle=P(x+(isHind?.035:.015),.22,dz+s*.04);
    out.push(longBone(hip,knee,.030,.058),longBone(knee,ankle,.023,.042));
    out.push(longBone(add(knee,[.025,0,s*.035]),add(ankle,[.035,.018,s*.03]),.012,.023));
    // Columnar manus / broad pes: five separate metapodials and digits.
    for(let j=0;j<5;j++) {
      const t=(j-2)*.024;
      const root=add(ankle,[-.015,.0,t]); const toe=add(ankle,[-.04-(isHind?.025:0),-.11,t*1.6]);
      out.push(longBone(root,toe,.010,.015,0));
      if(isHind&&j<3) out.push(boneSweep(toe,[[0,0,0],[-.035,-.007,0],[-.05,-.02,0]],[.011,.009,.001],.65,6));
    }
  }
  return out;
}
