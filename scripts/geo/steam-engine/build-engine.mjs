/** Steam-engine realism build. Run pnpm tsx scripts/geo/steam-engine/build-engine.mjs.
 * definition.json preserves the published bilingual copy, tables, bindings and
 * unchanged geometry. This file generates the rebuilt forms; no runtime kit.
 * Proportions are reconstruction; existing sourced/design numbers stay fixed. */
import { readFileSync, writeFileSync } from 'node:fs';
import { spurGear, meshGears } from '../kits/gear.ts';
import { solveMechanism } from '../../../src/engines/space-scene/lib/mechanism.ts';
import { partsFile } from '../../../src/engines/space-scene/schema.ts';
const data=JSON.parse(readFileSync(new URL('./definition.json',import.meta.url),'utf8'));
const parts=data.parts, spec=data.mechanisms[0], geometry=spec.geometry;
const tau=2*Math.PI,deg=180/Math.PI,rest=solveMechanism(0,geometry).points;
const world=(p,z=0)=>[p[0]+spec.origin[0],p[1]+spec.origin[1],z];
const get=id=>{const p=parts.find(p=>p.id===id);if(!p)throw Error(`Unknown part ${id}`);return p;};
const box=(size,at,color='wood')=>({kind:'bevelBox',size,bevel:Math.min(.018,Math.min(...size)*.22),at,color});
const disc=(r,h,at,color='steel')=>({kind:'cylinder',size:[r,r,h],at,color});
const tube=(path,radius=.05,color='stainless')=>({kind:'tube',path,radius,at:[0,0,0],color});
const rod=(a,b,z=.1,width=.045,color='steel')=>({kind:'box',size:[Math.hypot(b[0]-a[0],b[1]-a[1]),width,.07],at:[(a[0]+b[0])/2,(a[1]+b[1])/2,z],rotation:[0,0,Math.atan2(b[1]-a[1],b[0]-a[0])*deg],color});
function setShape(id,primitive,extra=[]) {const p=get(id);p.primitive=primitive;if(extra.length)p.extra=extra;else delete p.extra;return p;}
// The same 48:48 module/phase is used by the rigid sun-and-planet driver.
const gearSpec={module:geometry.orbitM/48,teeth:48,depth:.08,pressureAngle:20,backlash:.0003,bore:.06,hubRadius:.092,hubDepth:.15,web:4,color:'brass'};
const mesh=meshGears(gearSpec.module,48,48,world(rest.O,.03));
for(const [id,placement] of [['sun',mesh.a],['planet',mesh.b]]) {
 const pieces=spurGear({...gearSpec,...placement});
 get(id).primitive=pieces[0];get(id).extra=pieces.slice(1);
}
// Planet pin links the bored hub to the rear centre link and rigid rod.
get('planet').extra.push(
 {kind:'cylinder',size:[.06,.06,.55],at:world(rest.P,-.125),rotation:[90,0,0],color:'steel'},
 {kind:'cylinder',size:[.08,.08,.025],at:world(rest.P,.1625),rotation:[90,0,0],color:'steel'});
get('drive-rod').primitive.at[2]=-.24;
get('drive-rod').extra=[rest.K,rest.P].map(p=>({kind:'lathe',profile:[[.06,-.05],[.105,-.05],[.105,.05],[.06,.05],[.06,-.05]],segments:64,at:world(p,-.24),rotation:[90,0,0],color:'steel'}));
// Lagging barrel and bolted covers retain the working bore and piston clearance.
get('cylinder').primitive={kind:'lathe',profile:[[.238125,-.76],[.31,-.76],[.31,.76],[.238125,.76],[.238125,-.76]],segments:64,at:[-2.5,2.46,.12],color:'wood'};
get('cylinder').extra.push(...[1.66,3.26].map(y=>({kind:'flange',radius:.34,thickness:.045,boltCount:10,boltRadius:.30,at:[-2.5,y,.12],color:'steel'})),
 {kind:'lathe',profile:[[.025,-.07],[.08,-.07],[.08,.07],[.025,.07],[.025,-.07]],segments:64,at:[-2.5,3.34,.12],color:'brass'});
// Deep built-up timber beam (the preserved Lap engine's beam is timber), iron
// strap bands and bored iron pin bosses. Its front face stays at z=.07, clear of
// the parallel and pump links in front.
const beamAngle=Math.atan2(rest.K[1],rest.K[0]);
const beamAt=(x,y=0,z=0)=>[x*Math.cos(beamAngle)-y*Math.sin(beamAngle),5.6+x*Math.sin(beamAngle)+y*Math.cos(beamAngle),z];
const belly=x=>.20+.08*(1-(x/2.5)**2);
const edge=Array.from({length:33},(_,i)=>-2.5+5*i/32);
const beamProfile=[...edge.map(x=>[x,-belly(x)]),...edge.toReversed().map(x=>[x,belly(x)])];
get('beam').primitive={kind:'extrude',shape:beamProfile,depth:.25,bevel:.012,at:[0,5.6,-.055],rotation:[0,0,beamAngle*deg],color:'wood'};
get('beam').extra=[...[-2.2,-.62,.62,2.2].map(x=>({kind:'box',size:[.07,2*belly(x)+.024,.27],at:beamAt(x,0,-.055),rotation:[0,0,beamAngle*deg],color:'steel'})),
 ...[-2.5,-1.25,-1,0,2.5].map(x=>({...disc(x===0?.25:.115,x===0?1.24:.38,beamAt(x),'steel'),rotation:[90,0,0]}))];
// The drive rod runs behind the beam, on a gudgeon passing through its bored top eye.
get('beam').extra.push({...disc(.055,.40,world(rest.K,-.10),'steel'),rotation:[90,0,0]});
// 16 ft outside diameter retained: broad rectangular rim, six straight tapered
// spokes, split hub and shaft key. Same existing rigid output driver.
const flyR=4.8768/2,flyInner=flyR-4.8768/12;
get('flywheel').primitive={kind:'lathe',profile:[[flyInner,-.14],[flyR-.018,-.14],[flyR,-.122],[flyR,.122],[flyR-.018,.14],[flyInner,.14],[flyInner,-.14]],segments:96,at:world(rest.O,-.65),rotation:[90,0,0],color:'steel'};
get('flywheel').extra=Array.from({length:6},(_,i)=>{
 const a=i*tau/6, p=(r,da)=>[r*Math.cos(a+da),r*Math.sin(a+da),0];
 return {kind:'sweep',path:[p(.17,0),p(.65,0),p(1.3,0),p(flyInner+.04,0)],radius:[.15,.13,.10,.08],section:{flat:.72},up:[0,0,1],caps:'flat',radial:48,segments:32,at:world(rest.O,-.65),color:'steel'};
});
get('flywheel').extra.push({kind:'lathe',profile:[[.06,-.26],[.22,-.26],[.27,-.18],[.27,.18],[.22,.26],[.06,.26],[.06,-.26]],segments:64,at:world(rest.O,-.65),rotation:[90,0,0],color:'steel'},box([.045,.035,.31],[2.5,2.665,-.65],'steel'));
// Wagon boiler in a brick setting: flat foot and vaulted crown use the
// existing 0.6 m curve radius and 2.2 m barrel length (design, not Lap survey).
const wagon=r=>[[-r,-r],[r,-r],[r,0],...Array.from({length:49},(_,i)=>[r*Math.cos(i*Math.PI/48),r*Math.sin(i*Math.PI/48)]),[-r,-r]];
setShape('boiler',{kind:'extrude',shape:wagon(.625),holes:[wagon(.6)],depth:2.2,at:[-5,1.4,-.4],rotation:[0,90,0],color:'steel'},
 [-6.1275,-3.8725].map(x=>({kind:'extrude',shape:wagon(.625),depth:.055,at:[x,1.4,-.4],rotation:[0,90,0],color:'steel'}))).shell=true;
get('boiler').extra.push(...[-5.85,-5,-4.15].map(x=>({kind:'extrude',shape:wagon(.64),holes:[wagon(.625)],depth:.035,at:[x,1.4,-.4],rotation:[0,90,0],color:'steel'})));
setShape('boiler-water',{kind:'box',size:[2.16,.575,1.15],at:[-5,1.1125,-.4],color:'token:cold'});
setShape('furnace',{kind:'extrude',shape:[[-1.2,-.35],[1.2,-.35],[1.2,.28],[.85,.42],[-.85,.42],[-1.2,.28]],depth:1.3,at:[-5,.42,-.4],color:'ceramic'},
 [{kind:'extrude',shape:[[-.39,-.17],[.39,-.17],[.39,.07],[.33,.15],[.2,.20],[-.2,.20],[-.33,.15],[-.39,.07]],depth:.035,bevel:.012,at:[-5,.35,.275],color:'powder'},box([.22,.025,.045],[-5,.36,.31],'steel')]);
get('nc-cylinder').primitive={kind:'lathe',profile:[[.3,-.7],[.325,-.7],[.325,.7],[.3,.7],[.3,-.7]],segments:64,arc:180,at:[-12.5,1.85,0],color:'steel'};
get('nc-cylinder').extra.push({kind:'lathe',profile:[[.3,-.04],[.355,-.04],[.355,.04],[.3,.04],[.3,-.04]],segments:64,at:[-12.5,2.55,0],color:'steel'},
 {kind:'flange',radius:.36,thickness:.035,boltCount:8,boltRadius:.33,at:[-12.5,1.13,0],color:'steel'});
// Circular end arcs have fixed vertical tangency x=±R; wrapped chain sections are omitted.
// End sheaves are arc guides about the same pivot, not extra joints.
const arcGuide=(side)=>({kind:'extrude',shape:[...Array.from({length:49},(_,i)=>{const a=(side===1?-24:156)+i*1;return [1.5*Math.cos(a/deg),1.5*Math.sin(a/deg)];}),...Array.from({length:49},(_,i)=>{const a=(side===1?24:204)-i*1;return [1.40*Math.cos(a/deg),1.40*Math.sin(a/deg)];})],depth:.20,at:[-11,3.5,0],color:'steel'});
setShape('nc-beam',box([2.8,.28,.22],[-11,3.5,0]),[arcGuide(1),arcGuide(-1),...[-1,1].map(side=>rod([-11,3.5],[-11+side*1.43,3.5+.35],0,.055,'steel')),{...disc(.20,.56,[-11,3.5,0]),rotation:[90,0,0]}]);
// Keep the chain's original rod-top joint at y=3 while extending the pump
// plunger down the shaft at both end poses, rather than standing on a puck.
setShape('nc-pump',{kind:'cylinder',size:[.055,.055,3.5],at:[-9.5,1.25,0],color:'steel'},
 [disc(.15,.35,[-9.5,-.325,0],'steel')]);
// Timber A-frames (front and rear) under a timber cap carry the iron trunnion
// bearings, as on the preserved Lap engine. The rear frame sits in front of the
// flywheel plane; the output pedestal is behind it, clear of every spoke.
const leg=(x0,x1,z,w=.2,y0=0,y1=4.76)=>({kind:'bevelBox',size:[w,Math.hypot(x1-x0,y1-y0),w],bevel:.018,at:[(x0+x1)/2,(y0+y1)/2,z],rotation:[0,0,-Math.atan2(x1-x0,y1-y0)*deg],color:'wood'});
const aFrame=z=>[leg(.95,.14,z),box([1.5,.18,.2],[0,1.7,z]),box([2.3,.2,.24],[0,.1,z])];
const frame=get('engine-frame');
frame.primitive=leg(-.95,-.14,-.36);
frame.extra=[...aFrame(-.36),leg(-.95,-.14,.45),...aFrame(.45),box([.75,.24,1.2],[0,4.88,0]),
 box([.52,.35,.34],[0,5.175,-.42],'steel'),box([.52,.35,.34],[0,5.175,.42],'steel'),
 ...[-.42,.42].map(z=>({kind:'lathe',profile:[[.25,-.13],[.33,-.13],[.33,.13],[.25,.13],[.25,-.13]],segments:64,at:[0,5.6,z],rotation:[90,0,0],color:'brass'})),
 box([.65,2.35,.42],[2.5,1.175,-1.08]),box([.80,.22,.60],[2.5,2.43,-1.08],'steel'),
 {kind:'lathe',profile:[[.06,-.24],[.18,-.24],[.18,.24],[.06,.24],[.06,-.24]],segments:64,at:[2.5,2.6,-1.08],rotation:[90,0,0],color:'brass'},
 box([.18,4.6,.18],[-3.1,2.3,-.45]),box([1,.20,.35],[-2.75,4.7,-.45]),
 {...disc(.08,.55,[-2.5,4.8,-.15]),rotation:[90,0,0]},box([.14,1.8,.14],[1,1,.7]),box([.5,.12,.45],[1,2,.7])];
setShape('boiler-seating',box([.35,.8,1.4],[-5.85,.4,-.4],'ceramic'),[box([.35,.8,1.4],[-4.15,.4,-.4],'ceramic'),box([2.7,.78,.18],[-5,.39,-1.04],'ceramic'),
 ...[-5.85,-4.15].map(x=>({kind:'fins',size:[.37,1.42,.15],count:5,gap:.01,axis:'y',at:[x,.4,-.4],color:'matte'}))]).context=true;
// Cutaway engine house: substantial bob-wall under the beam, with a rear
// return wall and open viewing face. Boiler below cylinder; shaft outside.
setShape('comparison-support',{kind:'extrude',shape:[[-2.25,-.8],[2.25,-.8],[2.25,.8],[-2.25,.8]],holes:[[[1.15,-.1],[1.85,-.1],[1.85,.5],[1.15,.5]]],depth:.1,at:[-11,-.05,-.2],rotation:[90,0,0],color:'matte'},[
 box([.51,3.12,1.46],[-11,1.56,-.15],'powder'),box([.85,.18,1.7],[-11,3.21,-.15],'ceramic'),
 box([2.1,3.05,.16],[-12.225,1.525,-.95],'ceramic'),
 box([.62,.08,.70],[-11,3.26,0],'wood'),
 {kind:'lathe',profile:[[.20,-.28],[.25,-.28],[.25,.28],[.20,.28],[.20,-.28]],segments:64,at:[-11,3.5,0],rotation:[90,0,0],color:'steel'},
 box([1.5,.48,1.25],[-12.5,.24,-.12],'ceramic'),
 {kind:'lathe',profile:[[0,-.34],[.58,-.34],[.58,-.05],[.55,.17],[.44,.33],[.25,.43],[0,.46]],segments:64,at:[-12.5,.76,-.12],color:'steel'},
 tube([[-12.5,1.22,-.12],[-12.5,1.3,-.35]],.055,'steel'),
 box([.43,.28,.035],[-12.5,.27,.525],'powder'),
 box([.32,.05,1.2],[-9.95,.025,0],'ceramic'),box([.32,.05,1.2],[-9.05,.025,0],'ceramic'),
 box([.75,.05,.22],[-9.5,.025,-.49],'ceramic'),box([.75,.05,.22],[-9.5,.025,.49],'ceramic'),
 {kind:'fins',size:[.55,1.5,.16],count:18,gap:.013,axis:'y',at:[-11,1.56,-.15],color:'matte'}
]).context=true;

// Keep authored ids, numbering, labels, controls, facts and mechanism drivers.
for(const p of parts)for(const primitive of [p.primitive,...(p.extra??[])])if(primitive.color==='ceramic')primitive.color='matte';
partsFile.parse(data);
writeFileSync(new URL('../../../src/content/topics/steam-engine/data/parts.json',import.meta.url),JSON.stringify(data,null,2)+'\n');
