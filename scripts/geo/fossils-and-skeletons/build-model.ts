/** Original anatomically informed teaching geometry. Institutional references and limits: model-audit.md.
 * Run once from author coordinates; never normalise the generated JSON again.
 */
import fs from 'node:fs';
import { PART_TEXT } from './text';
import { buildBird } from '../kits/bird';
import { boneSweep, diplodocid, ribCage, theropodForelimb, theropodHindlimb, theropodPelvis, theropodSkull, vertebra, vertebralColumn } from '../kits/dinosaur-skeleton';
import { buildSauropods } from './build-sauropods';
import { bakeMuseum } from './bake-museum';
import { partBounds } from '../../../src/engines/space-scene/lib/parts';
import { partsFile, type Part, type Primitive } from '../../../src/engines/space-scene/schema';

type V = [number, number, number];
const bi = (en: string, zh: string) => ({ en, zh });
const bone = 'token:bone';
const parts: Part[] = [];
function sweep(at: V, path: V[], radius: number | number[], tint = bone, options = {}): Primitive {
  return {kind:'sweep', at, path, radius, color:'tissue', tint, radial:48, segments:24, caps:'round', ...options} as Primitive;
}
function box(at: V,size: V,tint='token:neutral'): Primitive {
  return {kind:'bevelBox',at,size,bevel:Math.min(...size)*.08,color:'abrasive',tint};
}
function extrude(at: V,shape: number[][],depth:number,holes:number[][][]=[],tint=bone,options={}): Primitive {
  return {kind:'extrude',at,shape,depth,holes,bevel:Math.min(depth*.12,.012),color:'tissue',tint,...options} as Primitive;
}
const rect=(w:number,h:number)=>[[-w/2,-h/2],[w/2,-h/2],[w/2,h/2],[-w/2,h/2]];
const ellipse=(x:number,y:number,rx:number,ry:number,n=16)=>Array.from({length:n},(_,i)=>[x+rx*Math.cos(i/n*Math.PI*2),y+ry*Math.sin(i/n*Math.PI*2)]);
function add(id:string,group:string,geometry:Primitive[],options={}): Part {
  const text=PART_TEXT[id];
  if(!text)throw new Error('Missing fossil text: '+id);
  // Key order matches the accepted parts.json, so a rebuild is byte-identical.
  const {name,summary,detail,...labels}=text;
  const p={id,group,name,summary,detail,primitive:geometry[0],...(geometry.length>1?{extra:geometry.slice(1)}:{}),explode:{dir:[0,1,0],dist:0},connects:[],castShadow:false,clip:true,...labels,...options} as Part;
  parts.push(p); return p;
}
function sampleBone(at:V,length=1.1,tint=bone): Primitive {
  // An asymmetric long-bone fragment: articular end, tapered shaft, broken
  // distal wall. Hollow ends show cortex rather than a cartoon dog bone.
  return sweep(at,[[-length*.48,0,0],[-length*.41,.025,0],[-length*.28,.01,0],[-length*.05,-.025,0],[length*.25,-.02,0],[length*.48,.015,0]],[length*.105,length*.145,length*.09,length*.065,length*.057,length*.07],tint,{section:{flat:.74},up:[0,0,1],hollow:length*.018,caps:'flat'});
}

// Evidence plates. Holes run through a thin upper stratum and stop on a base:
// the footprint and leaf are actual negative relief, never a floating foot/leaf.
add('bone-sample','specimens',[sampleBone([-1.25,.55,0],.85)]);
const track=[[-.10,-.39],[-.22,-.25],[-.20,-.08],[-.38,.12],[-.43,.34],[-.33,.40],[-.12,.13],[-.07,.11],[-.07,.51],[.04,.62],[.12,.50],[.13,.11],[.19,.10],[.37,.39],[.49,.34],[.42,.12],[.25,-.08],[.20,-.29],[.06,-.40]];
const leaf=[[-.03,-.49],[-.16,-.30],[-.30,-.06],[-.30,.14],[-.19,.35],[0,.51],[.19,.34],[.30,.12],[.28,-.10],[.14,-.34],[.03,-.49]];
add('track-slab','specimens',[extrude([0,.29,0],rect(1.06,1.40),.075,[track],'token:neutral',{rotation:[-90,0,0],color:'abrasive'}),box([0,.19,0],[1.06,.12,1.40],'token:ink-2')]);
add('leaf-slab','specimens',[extrude([1.16,.30,0],rect(.90,1.26),.045,[leaf],'token:neutral',{rotation:[-90,0,0],color:'abrasive'}),box([1.16,.245,0],[.9,.06,1.26],'token:neutral')]);
// Veins are recessed into the impression floor, below the slab rim. Thin
// uncut bridges separate the holes so triangulation never crosses a vein.
const veinHoles:number[][][]=[rect(.013,.81)];
for(let i=0;i<6;i++)for(const side of [-1,1]){
 const y=-.30+i*.12, tip=y+.12, w=.235*Math.sin((tip+.49)*Math.PI);
 veinHoles.push([[side*.022,y],[side*w,tip],[side*w,tip+.008],[side*.022,y+.008]]);
}
parts.find(p=>p.id==='leaf-slab')!.extra!.push(extrude([1.16,.281,0],leaf.map(([x,y])=>[x!*.96,y!*.96]),.012,veinHoles,'token:neutral',{rotation:[-90,0,0],bevel:.001,color:'abrasive'}));
add('leaf-lid','specimens',[box([1.16,.40,0],[.90,.13,1.26])],{shell:true,explode:{dir:[0,1,0],dist:.7}});

// Continuous, horizontal contacts; the middle shell leaves a cavity for one bone.
add('sediment-low','burial',[box([0,.3,0],[2.8,.6,1.6],'token:ink-2')]);
const middle=[box([0,.64,0],[2.8,.08,1.6]),box([0,.98,-.72],[2.8,.60,.16]),box([-1.31,.98,0],[.18,.60,1.6]),box([1.31,.98,0],[.18,.60,1.6]),box([0,.98,.72],[2.8,.60,.16])];
add('sediment-mid','burial',middle,{shell:true});
add('sediment-high','burial',[box([0,1.58,0],[2.8,.6,1.6],'token:neutral')],{shell:true,explode:{dir:[0,1,0],dist:1}});
add('buried-bone','burial',[sampleBone([0,.96,.22],1.75)]);
const poreHoles=[ellipse(-.71,.02,.19,.16,11),ellipse(-.27,.06,.15,.19,12),ellipse(.12,.06,.17,.15,10),ellipse(.53,.03,.17,.17,11),ellipse(-.42,-.29,.12,.10,10),ellipse(.37,-.27,.14,.10,10)];
const poreOutline=[[-1.03,-.18],[-.93,-.44],[-.70,-.48],[-.49,-.35],[.40,-.35],[.70,-.48],[.94,-.40],[1.02,-.17],[.98,.17],[.78,.43],[.54,.36],[-.51,.37],[-.77,.43],[-.98,.26]];
add('pore-shell','burial',[extrude([0,1,.60],poreOutline,.25,poreHoles),sweep([0,1,.40],[[-.90,-.26,0],[-.42,-.30,0],[.42,-.3,0],[.88,-.26,0]],[.14,.12,.12,.14],bone)],{clip:true});
add('pore-minerals','burial',[3,0,1,2].map(i=>poreHoles[i]!).map(h=>extrude([0,1,.61],h.map(([x,y])=>[x!*.92,y!*.92]),.19,[],'token:cold')));

add('ash-low','age-section',[box([0,.3,0],[2.8,.15,1.6],'token:ink-2')]);
add('fossil-bed','age-section',[box([-1.34,.95,0],[.12,1.04,1.6]),box([0,1.49,0],[2.8,.06,1.6]),box([0,.95,-.74],[2.8,1.04,.12]),box([1.34,.95,0],[.12,1.04,1.6]),sampleBone([0,.91,.28],1.6)],{shell:true});
add('ash-high','age-section',[box([0,1.6,0],[2.8,.15,1.6],'token:ink-2')]);
add('dated-crystal','age-section',[extrude([1.1,1.94,.5],[[-.15,-.19],[.02,-.28],[.21,-.1],[.19,.14],[.01,.3],[-.17,.10]],.27,[],'token:cold',{rotation:[0,25,0]})],{clip:false});

// T. rex: original teaching reconstruction, never an individual specimen inventory.
const basis={direct:bone,comparison:'token:cold',inferred:'token:neutral'};
function sk(id:string,level:keyof typeof basis,geometry:Primitive[],dir:V,dist:number,connects:string[]=[]) {
 geometry.forEach(p=>{p.color='tissue';p.tint=basis[level];});
 return add(id,'skeleton',geometry,{explode:{dir,dist},connects});
}
const { skull: skullGeo, jaw: jawGeo } = theropodSkull();
sk('sk-skull','direct',skullGeo,[-1,.4,0],.5,['sk-jaw','sk-neck']);
sk('sk-jaw','direct',jawGeo,[0,-1,0],.35);
const neckGeo=vertebralColumn([[-2.30,2.39,0],[-2.13,2.20,0],[-1.94,1.99,0],[-1.65,1.98,0]],10,.075,.105,.11);
sk('sk-neck','comparison',neckGeo,[-1,.5,0],.4,['sk-trunk']);
const dorsalCentres:V[]=Array.from({length:12},(_,i)=>[-1.65+i*2.13/11,1.98+.17*Math.sin(i/11*Math.PI)-.02*i/11,0]);
const trunkGeo:Primitive[]=dorsalCentres.flatMap((at,i)=>vertebra(at,.176,.105+i*.002,.21+i*.006));
for(let i=0;i<6;i++){const at=dorsalCentres[i*2]!;trunkGeo.push(boneSweep(at,[[0,.04,-.19],[0,.06,0],[0,.04,.19]],[.022,.043,.022],.6,8));}
sk('sk-trunk','direct',trunkGeo,[0,.6,0],.4,['sk-ribs','sk-pelvis','sk-arm-l','sk-arm-r']);
const ribs:Primitive[]=ribCage(dorsalCentres,.66,.94,.028);
for(let i=0;i<6;i++) ribs.push(boneSweep([-1.42+i*.22,1.19+i*.015,0],[[.06,.02,-.32],[0,-.04,0],[.06,.02,.32]],.012,.8,12));
sk('sk-ribs','comparison',ribs,[0,0,1],.5);
const pelvisGeo=theropodPelvis();
sk('sk-pelvis','direct',pelvisGeo,[0,.5,0],.3,['sk-leg-l','sk-leg-r','sk-tail-base']);
for(const [id,z,level] of [['sk-arm-l',.43,'direct'],['sk-arm-r',-.43,'comparison']] as const){sk(id,level,theropodForelimb(z),[0,0,Math.sign(z)],.45,[]);}
for(const [id,z]of [['sk-leg-l',.48],['sk-leg-r',-.48]] as const){sk(id,'direct',theropodHindlimb(z),[0,0,Math.sign(z)],.5,[]);}
sk('sk-tail-base','inferred',vertebralColumn([[.96,1.94,0],[1.55,1.89,0],[2.4,1.73,0]],16,.13,.062,.20,{chevrons:true}),[1,0,0],.45,['sk-tail-tip']);
sk('sk-tail-tip','inferred',vertebralColumn([[2.4,1.73,0],[3.1,1.65,0],[3.7,1.62,0],[4.07,1.68,0]],24,.062,.008,.07,{chevrons:true,archLimit:8}),[1,0,0],.7);

// Local living-bird study. A separate enlarged feather is a comparison object.
const bird = buildBird({ billLegTint: 'token:lamp' });
// Lemon-yellow iris, without the Common Myna's bare eye patch.
for (const p of bird.body) if (p.kind === 'sphere' && p.size[0] === .027) p.tint = 'token:lamp';
// Topic-local correction: the shared bird kit also serves other owned topics.
// The continuous belly encloses the feathered thighs; the scaled lower legs
// start inside that plumage and emerge without a second surface or seam.
for (const p of bird.legs) {
 if (p.kind !== 'sweep') continue;
 if (p.tint === 'token:lamp' && Math.abs(p.at[1] - .73) < 1e-6) {
   const endY = p.at[1] + p.path.at(-1)![1];
   p.at[1] = .83; p.path = [[0,0,0],[.013,-.10,.005*Math.sign(p.at[2])],[.035,endY-.83,.012*Math.sign(p.at[2])]];
   p.radius = [.023,.022,.020]; p.rings = {every:.028,depth:.13};
 }
 if (p.tint === 'token:lamp') p.color = 'scales';
 // Tiny claws and toe scales do not need the body's 48 radial samples.
 p.radial = 24;
}

// The continuous belly is the external feathered thigh surface. Remove the
// kit's separate femoral cuffs so no intersecting stump/seam can show.
bird.legs = bird.legs.filter(p=>!(p.kind==='sweep'&&p.tint==='token:ink-2'&&p.at[1]>.9));
const belly=bird.body[0]!;
if(belly.kind==='sweep'&&Array.isArray(belly.radius))belly.radius[2]=.275;
const bodyGeo=bird.body;
add('myna-body','living-museum',bodyGeo);
const wingGeo=bird.wing;
add('myna-wing','living-museum',wingGeo);
const birdLeg=bird.legs;
add('myna-leg','living-museum',birdLeg);
const featherGeo=bird.feather;
add('myna-feather','living-museum',featherGeo);

for(const [id,cx,z,title,zh]of [['prince-study',-.3,-2.6,'Prince','Prince'],['apollonia-study',0,0,'Apollonia','Apollonia'],['twinky-study',.3,2.6,'Twinky','Twinky']]as const){
 add(id,'living-museum',diplodocid(cx,z),{castShadow:true});
}

// Bake the spec's one-time positive uniform affine transform for all six studies.
const sets:Record<string,string[]>={specimens:parts.filter(p=>p.group==='specimens').map(p=>p.id),burial:parts.filter(p=>p.group==='burial').map(p=>p.id),'age-section':parts.filter(p=>p.group==='age-section').map(p=>p.id),skeleton:parts.filter(p=>p.group==='skeleton').map(p=>p.id),bird:parts.filter(p=>p.id.startsWith('myna-')).map(p=>p.id),museum:parts.filter(p=>p.id.endsWith('-study')).map(p=>p.id)};
const layout:Record<string,{center:V;scale:number;bounds:{min:V;max:V};lift:number}>={};
// Standing studies rest on the platform (y = 0) instead of floating at the
// shared display centre; their cameras move with them, so framing is kept.
const grounded=new Set(['skeleton','museum']);
for(const [set,ids]of Object.entries(sets)){
 const items=parts.filter(p=>ids.includes(p.id));const boxes=items.map(p=>partBounds(p)!);
 const min=[0,1,2].map(i=>Math.min(...boxes.map(b=>b.min[i]!)))as V,max=[0,1,2].map(i=>Math.max(...boxes.map(b=>b.max[i]!)))as V;
 const c=min.map((v,i)=>(v+max[i]!)/2)as V;const h=min.map((v,i)=>(max[i]!-v)/2);const k=Math.min(...(set==='museum'?[4,2,3.8]:[4,2,1.4]).map((v,i)=>h[i]!>0?v/h[i]!:Infinity));
 const lift=grounded.has(set)?-(2+k*(min[1]-c[1])):0;
 layout[set]={center:c,scale:k,bounds:{min,max},lift};
 const point=(v:V)=>v.map((x,i)=>[0,2+lift,0][i]!+k*(x-c[i]!)) as V;
 for(const p of items){for(const g of [p.primitive!,...(p.extra??[])]){
   g.at=point(g.at);if('size'in g&&g.size)g.size=g.size.map(v=>v*k)as never;
   if('path'in g)g.path=g.path.map(v=>v.map(x=>x*k)as V);
   if(g.kind==='lathe')g.profile=g.profile.map(([r,y])=>[r*k,y*k]);
   if(g.kind==='wing'){g.outline=g.outline.map(v=>v.map(x=>x*k)as[number,number]);g.veins=g.veins.map(line=>line.map(v=>v.map(x=>x*k)as[number,number]));g.thickness*=k;}
   if(g.kind==='extrude')g.shape=g.shape.map(v=>v.map(x=>x*k)as[number,number]);
   if('holes'in g&&g.holes)g.holes=g.holes.map(h=>h.map(v=>v.map(x=>x*k)as[number,number]));
   if('radius'in g&&g.radius!==undefined)g.radius=(Array.isArray(g.radius)?g.radius.map(x=>x*k):g.radius*k)as never;
   for(const key of ['depth','bevel','bendRadius','hollow']as const)if(key in g&&(g as any)[key]!==undefined)(g as any)[key]*=k;
   if('rings'in g&&g.rings)g.rings.every*=k;
 }p.explode.dist*=k;}
}
function camera(set:string,position:V,target:V){const{center:c,scale:k,lift}=layout[set]!;const tr=(v:V)=>v.map((x,i)=>Math.round(([0,2+lift,0][i]!+k*(x-c[i]!))*1e5)/1e5)as V;return{position:tr(position),target:tr(target),fov:34};}
const cameras={
 'evidence-close':camera('specimens',[4,3,6],[0,.7,0]),
 'burial-close':camera('burial',[4,2.8,5],[0,1,0]),
 'layers-close':camera('age-section',[4,2.6,5],[0,1,0]),
 'skeleton-side':camera('skeleton',[1.08,3.128,14.04],[0,1.4,0]),
 'bird-close':camera('bird',[-.5,2,5],[-1.5,1,0]),
 'museum-close':camera('museum',[3.42,7.27472,11.0835],[.45,.65,0]),
 'pores-detail':camera('burial',[1.6,1.6,2.6],[0,1,.5]),
 'crystal-detail':camera('age-section',[2.8,2.8,3],[1.1,1.9,.5]),
 'hands-detail':camera('skeleton',[-.7,1.9,3.7],[-1.3,1.4,0]),
 'feather-detail':camera('bird',[.2,1.8,3],[-.52,1.14,.4]),
 'museum-pair':camera('museum',[3.42,7.27472,11.0835],[.45,.65,0]),
};
add('study-plinth','context',[-1,0,1].map(i=>({kind:'bevelBox',at:[i*.3*layout.museum!.scale,-.09,i*2.6*layout.museum!.scale],size:[6.5,.16,1.32],bevel:.045,color:'plastic',tint:'token:mannequin'} as Primitive)),{context:true,castShadow:false,clip:false});delete parts.at(-1)!.group;
// Small, translucent contact patches at each real manus/pes contact. These
// remain under the feet; the opaque plinth covers the shared central blob.
const plinth = parts.at(-1)!;
const museumLayout = layout.museum!;
for (const [cx,z] of [[-.3,-2.6],[0,0],[.3,2.6]]) for (const x of [-.29,.46]) for (const side of [-1,1]) {
 const k=museumLayout.scale, c=museumLayout.center;
 const at:V=[k*(cx!+x-.04-c[0]),-.006,k*(z!+side*(x>0?.20:.23)-c[2])];
 const shadow:Primitive={kind:'extrude',at,shape:ellipse(0,0,.14,.105,24) as [number,number][],depth:.0004,bevel:0,rotation:[-90,0,0],color:'glass',tint:'token:carbon-dioxide'};
 (plinth.extra??=[]).push(shadow);
}

const labels:Record<string,[string,string]>={'evidence-close':['Evidence','证据'],'burial-close':['Burial','埋藏'],'layers-close':['Layers','地层'],'skeleton-side':['Skeleton','骨架'],'bird-close':['Bird','鸟'],'museum-close':['Museum','馆藏']};

const path='src/content/topics/fossils-and-skeletons/data/parts.json';
const previous=fs.existsSync(path)?JSON.parse(fs.readFileSync(path,'utf8')):{};
// Preserve accepted connections independently of the geometry rebuild.
for(const part of parts){
 if(part.id==='study-plinth')continue;
 const published=previous.parts?.find((p:Part)=>p.id===part.id);
 if(!published)continue;
 for(const key of ['connects']as const){
  if(published[key]!==undefined)(part as any)[key]=published[key];
  else delete (part as any)[key];
 }
}
const result={...previous,parts,groups:[{id:'specimens',name:bi('Fossil evidence','化石证据'),color:'token:ink-2',card:false},{id:'burial',name:bi('Burial and minerals','埋藏与矿物'),color:'token:neutral',card:false},{id:'age-section',name:bi('Layers and ages','地层与年龄'),color:'token:ink-2',card:false},{id:'skeleton',name:bi('Rebuilding','骨架复原'),color:'token:bone'},{id:'living-museum',name:bi('Living birds and museum','活鸟与馆藏'),color:'token:neutral',card:false}],flows:[],animations:[],views:{shadows:'none',assembled:{camera:cameras['skeleton-side']},xray:{camera:cameras['burial-close']},exploded:{camera:cameras['skeleton-side']},reference:{fit:'layers'},section:{plane:'xy'},cutaway:{normal:[0,0,-1],offset:1.07},simVisibility:'instant'},presets:Object.entries(labels).map(([id,label])=>({id,label:bi(...label),camera:cameras[id as keyof typeof cameras]}))};
result.spec=[
 {key:bi('MODEL','模型'),value:bi('Schematic','示意'),tag:'design'},
 {key:bi('EVIDENCE','证据'),value:bi('Body and activity','身体与活动'),tag:'typical'},
 {key:bi('AGES','年代'),value:bi('Bracket, not one date','年龄范围'),tag:'design'},
 {key:bi('MUSEUM','馆藏'),value:bi('Three diplodocids','三具梁龙科标本'),tag:'typical'},
];
result.sim=JSON.parse(fs.readFileSync('scripts/geo/fossils-and-skeletons/sim.json','utf8'));
if(previous.groups)result.groups=previous.groups;
if(previous.spec)result.spec=previous.spec;
// Read-only editorial stage: no model baking or file writes.
if (process.argv.includes('--text-only')) {
 await new Promise<void>(done => process.stdout.write(JSON.stringify(result)+'\n', () => done()));
 process.exit(0);
}
fs.writeFileSync('scripts/geo/fossils-and-skeletons/skeleton-source.json',JSON.stringify(parts.filter(p=>p.group==='skeleton'),null,2)+'\n');
result.model=await bakeMuseum(parts);
partsFile.parse(result);
fs.writeFileSync(path,JSON.stringify(result,(_,v)=>typeof v==='number'?Math.round(v*1e6)/1e6:v,2)+'\n');
fs.writeFileSync('scripts/geo/fossils-and-skeletons/model-layout.json',JSON.stringify({studies:layout,cameras},null,2)+'\n');
console.log(`Wrote ${parts.length-1} selectable parts plus context; six exact-AABB study transforms.`);

// Retain the accepted study transform, then replace only its anatomical mesh.
await buildSauropods();
