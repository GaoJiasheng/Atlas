/** Build-time trees for mangrove-food-web, later water/flower-and-seed/plant.
 * Tapered recursive branches, opposite elliptic leaves, Rhizophora stilt-root
 * arches and Avicennia cable-root/pneumatophore fields. All dimensions DESIGN.
 * A sector is repeated by the existing part repeat contract: leaf and root
 * geometry uses the engine’s instance contract (static copies may be baked
 * together per material), without adding selectable parts or kinds.
 */
import type { Primitive, PartRepeat } from '../../../src/engines/space-scene/schema';
type V3 = [number, number, number];
export type TreeModel = { primitive: Primitive; extra?: Primitive[]; repeat?: PartRepeat };
const bark = { color: 'wood', tint: 'token:neutral' } as const;
const leafMaterial = { color: 'tissue', tint: 'token:seedling' } as const;
const rounded = (v: number) => +v.toFixed(6);
const plus = (a: V3, b: V3): V3 => a.map((v, i) => rounded(v + b[i]!)) as V3;
const radialRepeat = (count: number): PartRepeat => ({ count, axis: [0, 1, 0], radius: .000001 });
const curve = (at: V3, path: V3[], radius: number[], segments = 12): Primitive => ({
  kind: 'sweep', at, path, radius, radial: 8, segments, section: 'round', closed: false, caps: 'flat', ...bark,
});
export function ellipticLeaf(at: V3, length = .066, width = .024, rotation: V3 = [0, 0, 0]): Primitive {
  return { kind: 'sweep', at, path: [[0, 0, 0], [length*.23, length*.035, 0], [length*.55, length*.06, 0], [length*.82, length*.02, 0], [length, -length*.045, 0]],
    radius: [.0004, width*.39, width*.5, width*.32, .00015], section: { flat: .065 }, up: [0, 1, 0], radial: 6, segments: 5, closed: false, caps: 'flat', rotation, ...leafMaterial };
}
export function branchingTree(at: V3, options: { height: number; spread: number; lean?: number; sectors?: number }): TreeModel {
  const {height: h, spread: w, lean = 0, sectors = 14} = options;
  const extra: Primitive[] = [];
  // Each trunk sector is a closed lathe wedge. Repetition joins a complete
  // trunk rather than placing coincident whole trunks over one another.
  const profile: [number, number][] = [[0,-.03],[.036,-.03],[.034,.02],[.026,h*.26],[.021,h*.48],[.012,h*.68],[.003,h*.91],[0,h*.94]];
  const primitive: Primitive = {kind:'lathe', at, profile, arc:360/sectors, segments:64, ...bark};
  const twigs: {start:V3;end:V3}[]=[];
  function branch(start: V3, end: V3, radius: number, depth: number) {
    const middle: V3 = [(start[0]+end[0])*.5 + lean, (start[1]+end[1])*.5 + .012, (start[2]+end[2])*.5];
    extra.push(curve(at, [start, middle, end], [radius,radius*.68,radius*.30], 10));
    if (depth) {
      branch(end, [end[0]+w*(depth===2?.27:.17),end[1]+h*(depth===2?.17:.10),end[2]+w*.13], radius*.54, depth-1);
      branch(end, [end[0]+w*(depth===2?.16:.12),end[1]+h*(depth===2?.22:.14),end[2]-w*.18], radius*.49, depth-1);
    } else twigs.push({start,end});
  }
  branch([0,h*.43,0], [w*.38,h*.61,w*.02], .011, 2);
  // Four terminal twigs, three opposite pairs each: 336 leaves in 14 sectors.
  for (const [j,twig] of twigs.entries()) for(let i=0;i<3;i++) {
    const t=.18+i*.37;
    const node=twig.start.map((v,k)=>v+(twig.end[k]!-v)*t) as V3;
    for (const side of [-1,1]) extra.push(ellipticLeaf(plus(at,node), .078+((i+j)%4)*.007, .028+((i+j)%3)*.003, [side*(7+j*4),side*(48+(j%3)*13),-17+i*13]));
  }
  return {primitive,extra,repeat:radialRepeat(sectors)};
}
const cablePoint = (distance: number): V3 => [distance,-.033,Math.sin(distance*18)*.009];
export function pencilRootSystem(at: V3, options: { sectors?: number; reach?: number; height?: number; radius?: number } = {}): { lateral: TreeModel; pencils: TreeModel } {
  const {sectors=12,reach=.30,height=.095,radius=.0025}=options;
  const positions = Array.from({length:6},(_,i)=>reach*(.24+i*.145));
  const cable=curve(at, [[0,-.027,0],cablePoint(reach*.3),cablePoint(reach*.65),cablePoint(reach)], [.013,.009,.006,.0028], 16);
  const roots=positions.map((d,i)=>{
    const base=cablePoint(d), h=height*(.72+(i%4)*.13);
    return curve(at, [base,[d+.001,h*.42,base[2]],[d+.002,h,base[2]+.001]], [radius,radius*.84,radius*.27], 6);
  });
  return {lateral:{primitive:cable,repeat:radialRepeat(sectors)},pencils:{primitive:roots[0]!,extra:roots.slice(1),repeat:radialRepeat(sectors)}};
}
export function propRootSystem(at: V3, options: { sectors?: number; spread?: number; attachment?: number } = {}): TreeModel {
  const {sectors=6,spread=.27,attachment=.32}=options;
  const root=curve(at, [[.005,attachment,0],[spread*.40,attachment*.91,.006],[spread*.86,attachment*.47,.009],[spread,-.026,.007]], [.018,.014,.010,.006], 22);
  const fork=curve(at, [[spread*.59,attachment*.74,.008],[spread*.85,attachment*.52,-.042],[spread*1.12,-.026,-.065]], [.010,.007,.0035], 16);
  const upper=curve(at, [[0,attachment*1.48,0],[spread*.34,attachment*1.22,.026],[spread*.67,attachment*.76,.042],[spread*.84,-.026,.061]], [.012,.010,.0065,.0035], 22);
  // Small elliptical lenticels follow the outer face at known sweep stations.
  const lenticels: Primitive[]=[];
  for(const arch of [root,upper]) if(arch.kind==='sweep') for(const index of [1,2]) {
    const p=arch.path[index]!,r=(arch.radius as number[])[index]!;
    const profile: [number,number][] = Array.from({length:9},(_,i)=>[i===0||i===8?0:.0017*Math.sin(i*Math.PI/8),-.0017*Math.cos(i*Math.PI/8)]);
    lenticels.push({kind:'lathe',at:plus(at,[p[0],p[1],p[2]+r]),profile,segments:12,scale:[1,.42,.20],color:'wood',tint:'token:ink-3'});
  }
  return {primitive:root,extra:[fork,upper,...lenticels],repeat:radialRepeat(sectors)};
}
