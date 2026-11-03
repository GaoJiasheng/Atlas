/**
 * Build-time bird study: continuous feathered body, bill, overlapping remiges,
 * graduated rectrices and anisodactyl feet. Fossils uses the Javan myna preset;
 * bill/neck/leg/wing/tail parameters are reusable by mangrove heron,
 * flower-and-seed sunbird, frog-and-chicken hen and living-things specimens.
 * Dimensions are an original teaching reconstruction, not specimen measurements.
 */
import { BufferGeometry, Float32BufferAttribute, Vector3, CatmullRomCurve3, SphereGeometry, Color } from 'three';
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

/** Additional build-time museum specimens. buildBird's historical output above
 * is deliberately unchanged; these smooth surface studies opt in separately. */
export interface BirdSculpturePiece { geometry: import('three').BufferGeometry; color: string; tint: string }
export interface BirdSculpture { pieces: BirdSculpturePiece[]; digits: { foot: number; digit: number; root: V; tip: V }[] }

function studySurface(n:number,m:number,fn:(u:number,v:number)=>V,closed=false):BufferGeometry {
 const p:number[]=[],ix:number[]=[];
 for(let i=0;i<=n;i++)for(let j=0;j<=m;j++)p.push(...fn(i/n,j/m));
 for(let i=0;i<n;i++)for(let j=0;j<m;j++){
  const a=i*(m+1)+j,b=a+m+1;ix.push(a,b,a+1,b,b+1,a+1);
 }
 const g=new BufferGeometry();g.setAttribute('position',new Float32BufferAttribute(p,3));g.setIndex(ix);g.computeVertexNormals();
 if(closed){ // Weld periodic seam normals without collapsing the UV-like parameter grid.
  const norm=g.getAttribute('normal');for(let i=0;i<=n;i++){
   const a=i*(m+1),b=a+m,v=new Vector3().fromBufferAttribute(norm,a).add(new Vector3().fromBufferAttribute(norm,b)).normalize();norm.setXYZ(a,v.x,v.y,v.z);norm.setXYZ(b,v.x,v.y,v.z);
  }
 }
 return g;
}
/** Smooth variable elliptical section along an arbitrary centreline; tapered caps. */
function studyTube(points:V[],radii:number[],flat=1,radial=16,segments=24):BufferGeometry {
 const curve=new CatmullRomCurve3(points.map(p=>new Vector3(...p)));
 const frame=curve.computeFrenetFrames(segments,false);
 return outward(studySurface(segments,radial,(u,v)=>{
  const q=u*(radii.length-1),i=Math.min(radii.length-2,Math.floor(q)),t=q-i;
  const r=radii[i]!*(1-t)+radii[i+1]!*t,c=curve.getPoint(u),a=v*Math.PI*2,k=Math.min(segments,Math.round(u*segments));
  return c.addScaledVector(frame.normals[k]!,Math.cos(a)*r).addScaledVector(frame.binormals[k]!,Math.sin(a)*r*flat).toArray() as V;
 },true));
}
function studyOrb(at:V,size:V,segments=24,rings=16):BufferGeometry {
 const g=new SphereGeometry(1,segments,rings);g.scale(...size).translate(...at);return g;
}
/** Cambered lens feather/frond: closed, curved centre, asymmetric vane widths. */
function studyLancet(root:V,tip:V,width:number,normal:V,camber=.001,segments=16,across=8):BufferGeometry {
 const a=new Vector3(...root),b=new Vector3(...tip),axis=b.clone().sub(a),N=new Vector3(...normal).normalize(),side=new Vector3().crossVectors(N,axis).normalize();
 return outward(studySurface(segments,across*2,(u,v)=>{
  const angle=v*2*Math.PI,span=Math.pow(Math.sin(Math.PI*u),.65)*width*.5;
  const w=Math.cos(angle)*span*(Math.cos(angle)>0?1:.78),h=Math.sin(angle)*width*.032*Math.sin(Math.PI*u);
  const q=a.clone().addScaledVector(axis,u).addScaledVector(side,w).addScaledVector(N,h+camber*Math.sin(Math.PI*u)+.0003*Math.sin(u*8)*Math.abs(w)/width);
  return q.toArray() as V;
 },true));
}

/** A cross-section sculpt, rather than a surface of revolution: each ring has
 * its own centre, fore/aft fullness and lateral width. Cubic interpolation
 * blends the breast, nape and cranium without a ball-on-egg junction. */
function studyBody(rings: [number, number, number, number, number][], n=64, m=48):BufferGeometry {
 const centres=new CatmullRomCurve3(rings.map(([y,x,z])=>new Vector3(x,y,z)));
 const radii=new CatmullRomCurve3(rings.map(([, , ,rx,rz])=>new Vector3(rx,rz,0)));
 return studySurface(n,m,(u,v)=>{
  const c=centres.getPoint(u),r=radii.getPoint(u),a=v*Math.PI*2;
  return [c.x+Math.cos(a)*Math.max(0,r.x),c.y,c.z+Math.sin(a)*Math.max(0,r.y)];
 },true);
}

/** Original miniature reconstructions, metre-sized for a 7 cm specimen cell.
 * Myna is lateral (+X facing), gentoo-shaped penguin faces +Z. */
export function buildBirdSculpture(species:'myna'|'penguin'):BirdSculpture {
 const pieces:BirdSculpturePiece[]=[],digits:BirdSculpture['digits']=[];
 const put=(geometry:BufferGeometry,tint:string,color='feathers')=>pieces.push({geometry,tint,color});
 const line=(points:V[],radii:number[],tint:string,flat=1,radial=12,n=20,color='tissue')=>put(studyTube(points,radii,flat,Math.max(...radii)<.0012?Math.min(radial,8):radial,Math.max(...radii)<.0012?Math.min(n,10):n),tint,color);
 const eye=(at:V,size:V,tint:string)=>put(studyOrb(at,size,14,10),tint,'eye');
 const feather=(root:V,tip:V,width:number,normal:V,tint:string,curve=.0008)=>put(studyLancet(root,tip,width,normal,curve,12,3),tint);
 const dark=species==='myna'?'#505255':'#272c30',pale='#e9e7df',yellow='#deb43f';
 if(species==='myna'){
  const bodyRings:[number,number,number,number,number][]=[
   [.016,-.006,0,.001,.001],[.019,-.005,0,.009,.007],[.026,-.003,0,.016,.010],
   [.033,.001,0,.014,.011],[.039,.008,0,.009,.008],[.044,.015,0,.0075,.0075],
   [.049,.018,0,.008,.0073],[.053,.018,0,.006,.006],[.055,.017,0,0,0],
  ];
  put(studyBody(bodyRings,56,40),dark);
  // Fit every vane to the very same cubic cross-sections as the body.
  const bodyCentres=new CatmullRomCurve3(bodyRings.map(([y,x,z])=>new Vector3(x,y,z)));
  const bodyRadii=new CatmullRomCurve3(bodyRings.map(([, , ,rx,rz])=>new Vector3(rx,rz,0)));
  const skinRings=Array.from({length:257},(_,i)=>{const c=bodyCentres.getPoint(i/256),r=bodyRadii.getPoint(i/256);return [c.y,c.x,r.x,r.y];});
  const folded=(root:V,tip:V,width:number,side:number,tint:string,camber=.0008)=>{
   const g=studyLancet(root,tip,width,[0,.12,side],camber,12,3),p=g.getAttribute('position');
   for(let i=0;i<p.count;i++){
    const x=p.getX(i),y=p.getY(i);let k=0;while(k<skinRings.length-2&&y>skinRings[k+1]![0]!)k++;
    const a=skinRings[k]!,b=skinRings[k+1]!,t=Math.max(0,Math.min(1,(y-a[0]!)/(b[0]!-a[0]!)));
    const cx=a[1]!*(1-t)+b[1]!*t,rx=a[2]!*(1-t)+b[2]!*t,rz=a[3]!*(1-t)+b[3]!*t;
    const z=rz*Math.sqrt(Math.max(0,1-((x-cx)/rx)**2));
    p.setZ(i,side*(Math.max(.003,z)+.00048+(Math.abs(root[2])-.008)*.45+.00003*Math.sin(root[0]*2000))+(p.getZ(i)-root[2])*.25);
   }
   g.computeVertexNormals();put(g,tint);
  };
  // Broad-rooted maxilla with a shallow arched culmen; each cross-section
  // independently controls bill width and depth, unlike a cone.
  const billLoft=(points:V[],radii:V[],tint:string)=>{
   const centre=new CatmullRomCurve3(points.map(p=>new Vector3(...p))),r=new CatmullRomCurve3(radii.map(p=>new Vector3(...p)));
   put(studySurface(24,20,(u,v)=>{const c=centre.getPoint(u),rr=r.getPoint(u),a=-v*Math.PI*2;return [c.x,c.y+Math.cos(a)*rr.x,c.z+Math.sin(a)*rr.y];},true),tint,'plastic');
  };
  billLoft([[.023,.047,0],[.027,.0473,0],[.031,.0466,0],[.034,.0456,0]],[[.0019,.0024,0],[.0017,.0021,0],[.0008,.0011,0],[.00003,.00003,0]],yellow);
  billLoft([[.023,.0445,0],[.028,.0447,0],[.0315,.0451,0],[.0338,.0455,0]],[[.0010,.0019,0],[.00075,.0015,0],[.00035,.00065,0],[.00003,.00003,0]],yellow);
  for(const side of [-1,1]){
   line([[.024,.0456,side*.0023],[.029,.0455,side*.0016],[.033,.0455,side*.0006]],[.00022,.00018,.00004],dark,1,6,10);
   eye([.0267,.0487,side*.0019],[.00045,.00022,.00015],dark);
   eye([.021,.0496,side*.0064],[.00135,.00135,.0005],yellow);
   eye([.0213,.0496,side*.00685],[.00078,.00082,.00038],'#181b1b');
   eye([.0216,.0502,side*.00715],[.00022,.00022,.00012],pale);
   // Nine exposed primaries, six secondaries, and imbricate covert rows.
   for(let i=0;i<9;i++){
    const u=i/8,z=side*(.0085+.0010*Math.sin(u*Math.PI));
    folded([.007-u*.010,.034-u*.001,z],[-.019-u*.002,.023+u*.006,side*.0065],.0047,side,i%3===0?'#3c4043':dark);
   }
   folded([.008,.0335,side*.0094],[.0015,.0288,side*.0100],.0024,side,dark); // reduced tenth primary
   for(let i=0;i<6;i++)folded([.007-i*.0028,.0344-i*.00018,side*.0100],[-.005-i*.0029,.0275,side*.0093],.0051,side,i===3?pale:'#505154');
   for(let i=0;i<3;i++)folded([.003-i*.003,.0346-i*.00035,side*.0103],[-.008-i*.002,.0283,side*.009],.0040,side,'#55575a'); // tertials
   for(let row=0;row<2;row++)for(let i=0;i<7;i++){
    const x=.007-i*.0027,y=.0350-row*.0020-i*.00030;
    folded([x,y,side*.0100],[x-.006,y-.0035,side*.0105],.0036,side,row?'#4a4e50':'#55575a',.00025);
   }
  }
  for(let i=0;i<12;i++){
   const z=(i-5.5)*.00085,tip:V=[-.039+Math.abs(i-5.5)*.00055,.0115+Math.abs(i-5.5)*.00045,z*1.7];
   const root:V=[-.012,.024,z*.6];feather(root,tip,.0037,[0,1,0],dark,.0006);
   const r:V=root.map((v,k)=>v+(tip[k]!-v)*.86) as V;feather(r,[tip[0],tip[1]+.00015,tip[2]],.0023,[0,1,0],pale,.0001);
  }
  for(let i=0;i<6;i++)feather([.019-i*.0013,.0535,-.0008+i*.0002],[.020-i*.0017,.0574-i*.00038+Math.sin(i*2)*.0004,-.0003],.0013,[0,0,1],dark,.0003);
  for(let foot=0;foot<2;foot++){
   const z=(foot?1:-1)*.0046;
   line([[0,.022,z],[.0015,.016,z],[.0005,.011,z]],[.003,.0023,.0010],dark,1,16,16);
   line([[.0005,.012,z],[-.001,.007,z],[.001,.002,z]],[.001,.00085,.00072],yellow,1,12,18,'plastic');
   for(let i=0;i<8;i++){
    const y=.003+i*.00105,x=.001-(y-.002)*.25;
    line([[x-.00055,y,z-.00060],[x-.0008,y+.00017,z],[x-.00055,y,z+.00060]],[.00012,.00013,.00012],'#b49037',1,6,5,'plastic');
   }
   for(let digit=0;digit<4;digit++){
    const back=digit===3,spread=back?(foot?-.0012:.0012):(digit-1)*.0023;
    const end:V=[back?-.0063:.0076+(digit===1?.0019:0),.00075,z+spread];
    const root:V=[.001,.0018,z],mid:V=[root[0]+(end[0]-root[0])*.55,.0009,z+spread*.52];
    line([root,mid,end],[.00072,.00062,.00039],yellow,1,10,14,'plastic');
    const claw:V=[end[0]+(back?-.0017:.0018),.00035,end[2]+spread*.12];
    line([end,[end[0]+(back?-.0009:.0009),.0010,end[2]],claw],[.0004,.00032,.00003],'#444238',1,8,10,'plastic');
    digits.push({foot,digit,root,tip:end});
    for(let k=1;k<3;k++){
     const t=k/3,p:V=root.map((a,j)=>a+(end[j]!-a)*t) as V;
     eye(p,[.00067,.00025,.00064],yellow);
    }
   }
  }
 }else{
  const g=studyBody([
   [.005,0,-.001,.001,.001],[.009,0,-.001,.011,.009],[.019,0,-.001,.016,.014],
   [.031,0,0,.018,.015],[.044,0,-.001,.016,.013],[.055,0,-.002,.0125,.0105],
   [.064,0,-.004,.008,.008],[.071,0,-.001,.009,.0095],[.078,0,.001,.010,.010],
   [.083,0,.001,.0085,.008],[.087,0,0,.004,.004],[.088,0,0,0,0],
  ],72,48);
  // White feather tracts follow the surface, never an ellipsoid laid on top.
  const pos=g.getAttribute('position'),colors:number[]=[];
  for(let i=0;i<pos.count;i++){
   const x=pos.getX(i),y=pos.getY(i),z=pos.getZ(i);
   const fade=(d:number,w=.0007)=>{const t=Math.max(0,Math.min(1,.5+d/w));return t*t*(3-2*t);};
   const belly=fade(Math.min(y-.009,.064-y,z-(-.002+Math.pow(Math.abs(x)/.018,2)*.008)));
   const brow=fade(Math.min(y-(.081-.0008*Math.cos(z*170)),.085-y,Math.abs(x)-.0045,.006-z,z+.005),.0008);
   const c=new Color(dark).lerp(new Color(pale),Math.max(belly,brow));colors.push(c.r,c.g,c.b);
  }
  g.setAttribute('color',new Float32BufferAttribute(colors,3));put(g,'#ffffff');
  line([[0,.076,.008],[0,.0758,.013],[0,.0745,.019],[0,.0742,.023]],[.0026,.0023,.0012,.00005],'#c56a32',.52,24,26,'plastic');
  line([[0,.0738,.008],[0,.0736,.016],[0,.0740,.0228]],[.0020,.0016,.00005],'#a55630',.42,20,20,'plastic');
  for(const side of [-1,1]){
   line([[side*.0021,.0745,.011],[side*.0015,.0742,.018],[0,.0741,.0226]],[.00024,.00020,.00003],dark,1,6,12);
   eye([side*.00835,.0782,.00665],[.00065,.0007,.0005],'#10181a');
   eye([side*.00855,.0785,.0070],[.00018,.00018,.00012],pale);
   feather([side*.011,.058,-.001],[side*.030,.024,-.006],.011,[side*.2,0,1],dark,.002);
   feather([side*.012,.057,.0003],[side*.029,.025,-.0048],.007,[side*.2,0,1],'#41484a',.001);
   line([[side*.0065,.011,.001],[side*.0065,.006,.004],[side*.0065,.002,.008]],[.003,.0023,.002],'#b9794d',1,16,18,'plastic');
   const wrist:V=[side*.0065,.002,.007];
   const tips:V[]=[[-.004,.0008,.019],[0,.0008,.022],[.004,.0008,.019]].map(([x,y,z])=>[side*.0065+x!,y!,z!] as V);
   // Web follows digit rays and a shallow scallop between three forward toes.
   for(let k=0;k<2;k++){
    const a=tips[k]!,b=tips[k+1]!;
    put(studySurface(12,8,(u,v)=>{
     const x=a[0]*(1-v)+b[0]*v,z=a[2]*(1-v)+b[2]*v-.0012*Math.sin(v*Math.PI);
     return [wrist[0]*(1-u)+x*u,.0012+.00055*Math.sin(u*Math.PI),wrist[2]*(1-u)+z*u];
    }),'#bb7950','plastic');
   }
   for(let digit=0;digit<4;digit++){
    const end=digit<3?tips[digit]!:[side*.0065,.0022,.002] as V;
    const root:V=[...wrist];line([root,[(root[0]+end[0])/2,.0017,(root[2]+end[2])/2],end],[.0012,.0010,.00065],'#bc794f',1,10,14,'plastic');
    line([end,[end[0],.0012,end[2]+(digit<3?.0013:-.0013)],[end[0],.0006,end[2]+(digit<3?.002:-.002)]],[.00065,.00042,.00003],dark,1,8,8,'plastic');
    digits.push({foot:side<0?0:1,digit,root,tip:end});
   }
   for(let row=0;row<5;row++)line([[side*.0065-.002,.0021,.008+row*.0016],[side*.0065,.0024,.008+row*.0016],[side*.0065+.002,.0021,.008+row*.0016]],[.00020,.00023,.00020],'#976044',1,6,6,'plastic');
  }
  for(let i=0;i<9;i++)feather([0,.014,-.008],[(i-4)*.0012,.005,-.026+Math.abs(i-4)*.001],.0032,[0,1,0],dark,.0006);
 }
 return {pieces,digits};
}

function outward(g:BufferGeometry):BufferGeometry {const ix=g.index!;for(let i=0;i<ix.count;i+=3){const a=ix.getX(i);ix.setX(i,ix.getX(i+1));ix.setX(i+1,a);}g.computeVertexNormals();return g;}
