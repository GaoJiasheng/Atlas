/** Build-time involute spur wheels, cast hubs and webs/spokes for steam-engine
 * sun-and-planet gearing; reusable by energy-conversion and other machinery.
 * All output uses existing extrude/lathe primitives; angles are radians here. */
import type { Primitive } from '../../../src/engines/space-scene/schema';
type XY = [number, number];
type XYZ = [number, number, number];
export interface GearSpec {
  module: number;
  teeth: number;
  depth: number;
  pressureAngle?: number;
  /** Pair's total circular backlash; half is removed from each wheel. */
  backlash?: number;
  bore?: number;
  hubRadius?: number;
  hubDepth?: number;
  web?: 'solid' | number;
  at?: XYZ;
  phase?: number;
  color?: string;
}
const TAU = Math.PI * 2;
export function gearDimensions(spec: Pick<GearSpec, 'module' | 'teeth' | 'pressureAngle' | 'backlash'>) {
  if (!Number.isInteger(spec.teeth) || spec.teeth < 18 || spec.teeth > 120 || !(spec.module > 0)) throw new Error('Spur gear needs 18–120 teeth and positive module');
  const pitchRadius = spec.module * spec.teeth / 2;
  const baseRadius = pitchRadius * Math.cos((spec.pressureAngle ?? 20) * Math.PI / 180);
  const tipRadius = pitchRadius + spec.module;
  const rootRadius = pitchRadius - 1.25 * spec.module;
  const halfTooth = Math.PI / (2 * spec.teeth) - (spec.backlash ?? 0) / (4 * pitchRadius);
  if (halfTooth <= 0) throw new Error('Backlash exceeds tooth thickness');
  return { pitchRadius, baseRadius, tipRadius, rootRadius, halfTooth, pitch: TAU / spec.teeth };
}
/** Twelve points/tooth: exact involute flanks and small root relief blends. */
export function gearTooth(spec: GearSpec, index: number): XY[] {
  const d = gearDimensions(spec);
  const inv = (r: number) => { const a = Math.acos(Math.min(1, d.baseRadius / r)); return Math.tan(a) - a; };
  const base = d.halfTooth + inv(d.pitchRadius);
  const start = Math.max(d.rootRadius, d.baseRadius), startAngle = base - inv(start);
  const mid = (start + d.tipRadius) / 2;
  const tip = base - inv(d.tipRadius), c = index * d.pitch;
  const p = (r: number, a: number): XY => [r * Math.cos(a + c), r * Math.sin(a + c)];
  return [p(d.rootRadius, -d.pitch/2), p(d.rootRadius, -startAngle-.005), p((d.rootRadius+start)/2, -startAngle-.0015),
    p(start, -startAngle), p(mid, -base+inv(mid)), p(d.tipRadius, -tip), p(d.tipRadius, 0), p(d.tipRadius, tip),
    p(mid, base-inv(mid)), p(start, startAngle), p((d.rootRadius+start)/2, startAngle+.0015), p(d.rootRadius, startAngle+.005)];
}
export function gearOutline(spec: GearSpec): XY[] {
  return Array.from({ length: spec.teeth }, (_, i) => gearTooth(spec, i)).flat();
}
/** Ring sectors stay within the schema's 160 outline vertices, with no tooth
 * instances/draw calls. Their inner arcs meet the web or radial cast spokes. */
export function spurGear(spec: GearSpec): Primitive[] {
  const d = gearDimensions(spec), at = spec.at ?? [0, 0, 0], phase = spec.phase ?? 0, color = spec.color ?? 'steel';
  const bore = spec.bore ?? d.pitchRadius * .12, hub = spec.hubRadius ?? d.pitchRadius * .28;
  const inner = d.rootRadius - 2.2 * spec.module;
  if (!(spec.depth > 0 && bore > 0 && bore < hub && hub < inner)) throw new Error('Invalid gear hub, bore or depth');
  const pieces: Primitive[] = [];
  const polar = (r: number, a: number): XY => [r * Math.cos(a), r * Math.sin(a)];
  for (let start = 0; start < spec.teeth; start += 12) {
    const n = Math.min(12, spec.teeth-start), a = (start-.5)*d.pitch, b = (start+n-.5)*d.pitch;
    const teeth = Array.from({length:n}, (_, k) => gearTooth(spec, start+k)).flat();
    pieces.push({ kind:'extrude', shape:[...teeth, polar(d.rootRadius,b), ...Array.from({length:n+1},(_,k)=>polar(inner,b-(b-a)*k/n))],
      depth:spec.depth, at, rotation:[0,0,phase*180/Math.PI], color });
  }
  const ring = (r0: number, r1: number, depth: number): Primitive => ({ kind:'lathe',
    profile:[[r0,-depth/2],[r1,-depth/2],[r1,depth/2],[r0,depth/2],[r0,-depth/2]], segments:64, at, rotation:[90,0,0], color });
  if (typeof spec.web === 'number') {
    if (!Number.isInteger(spec.web) || spec.web < 3 || spec.web > 6) throw new Error('Use 3–6 spokes');
    for (let k=0;k<spec.web;k++) pieces.push({kind:'extrude', shape:[[hub*.8,-hub*.38],[inner+.003,-spec.module*1.15],[inner+.003,spec.module*1.15],[hub*.8,hub*.38]],
      depth:spec.depth*.65, bevel:spec.module*.12, at, rotation:[0,0,(phase+k*TAU/spec.web)*180/Math.PI], color});
  } else pieces.push(ring(bore, inner+.001, spec.depth*.5));
  pieces.push(ring(bore, hub, spec.hubDepth ?? spec.depth*1.7));
  return pieces;
}
/** External mesh placement and phase, valid for unequal counts as well. A tooth
 * centre on wheel A faces a gap on B. In an orbit, advance the carrier angle
 * and supply A's absolute phase: zA*a + zB*b = (zA+zB)*carrier + (zB-1)*π. */
export function meshGears(module: number, teethA: number, teethB: number, centre: XYZ = [0,0,0], carrier = 0, phaseA = 0) {
  gearDimensions({module, teeth:teethA}); gearDimensions({module, teeth:teethB});
  const distance = module*(teethA+teethB)/2;
  const phaseB = ((teethA+teethB)*carrier - teethA*phaseA + (teethB-1)*Math.PI)/teethB;
  return {distance, a:{at:centre, phase:phaseA}, b:{at:[centre[0]+distance*Math.cos(carrier),centre[1]+distance*Math.sin(carrier),centre[2]] as XYZ, phase:phaseB}};
}
