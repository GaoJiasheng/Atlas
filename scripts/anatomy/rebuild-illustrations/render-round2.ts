/** Shared repaired render source for all six muscle covers.
 * Native CC BY-SA Z-Anatomy superficial mesh set; no skeleton is included.
 * Source skin is a pale closed silhouette for undisected head/hands/feet and body contour.
 * An orthographic skin mask contains muscle projection; this illustration compositing
 * is not a topology fix and does not alter the runtime GLB.
 */
import fs from 'node:fs';
import {recordProvenance} from './record-provenance';
import { BufferGeometry, Float32BufferAttribute, Color } from 'three';
import { render, loadTopic, type Surface } from '../rebuild-evidence/studio';
const dir='scripts/anatomy/rebuild-illustrations';
const frames:Record<string,{target:number;size:number}>={arms:{target:1.13,size:1.08},back:{target:1.23,size:.80},chest:{target:1.32,size:.62},core:{target:1.075,size:.54},legs:{target:.49,size:1.10},shoulders:{target:1.35,size:.78}};
const packet=JSON.parse(fs.readFileSync('scripts/anatomy/cache/rebuild-source.json','utf8'));
const topics=['arms','back','chest','core','legs','shoulders'];
const sourceOnly=process.argv.includes('--source-only'),skinOnly=process.argv.includes('--skin-only');
if(sourceOnly&&skinOnly)throw Error('Choose only one render stage');
if(!sourceOnly)recordProvenance(Number(process.argv[3]??18));
const groups:Record<string,RegExp>={arms:/biceps brachii|triceps brachii|brachialis|brachioradialis|carpi|digitorum|pronator|palmaris|supinator/i,back:/trapezius|latissimus|splenius|gluteus|teres|infraspinatus|rhomboid/i,chest:/pectoralis|serratus anterior|clavicular part of deltoid/i,core:/abdom|linea alba/i,legs:/femoris|vastus|sartorius|gracilis|adductor|tibialis|gastrocnemius|soleus|fibularis|semitend|semimembr|achilles|calcaneal/i,shoulders:/deltoid|trapezius|teres|infraspinatus|supraspinatus/i};
// Rectus lies underneath the external-oblique aponeurosis in the native atlas.
// A superficial-muscle plate reflects that aponeurosis at the semilunar line;
// keeping it opaque falsely depicts an abdomen with no rectus or tendinous intersections.
// Clip the actual native sheet at a curved boundary measured from native rectus vertices.
const rectusProfile=[[.84,.018],[.875,.037],[.90,.054],[.925,.064],[.95,.071],[.975,.074],[1,.075],[1.025,.074],[1.05,.076],[1.075,.078],[1.10,.081],[1.125,.082],[1.15,.085],[1.20,.084],[1.25,.084],[1.27,.075]];
function boundary(y:number){if(y<.84||y>1.27)return 0;let n=1;while(n<rectusProfile.length-1&&y>rectusProfile[n]![0]!)n++;const a=rectusProfile[n-1]!,b=rectusProfile[n]!;return Math.max(0,a[1]!+(b[1]!-a[1]!)*(y-a[0]!)/(b[0]!-a[0]!)-.006);}
function reflectOblique(m:any){const positions:number[]=[],indices:number[]=[];
 for(let i=0;i<m.indices.length;i+=3){let poly=m.indices.slice(i,i+3).map((j:number)=>m.positions.slice(j*3,j*3+3));const clipped:number[][]=[];
 for(let j=0;j<poly.length;j++){const a=poly[j]!,b=poly[(j+1)%poly.length]!,da=Math.abs(a[0])-boundary(a[1]),db=Math.abs(b[0])-boundary(b[1]);if(da>=0)clipped.push(a);if((da>=0)!==(db>=0)){const t=da/(da-db);clipped.push(a.map((x:number,c:number)=>x+(b[c]-x)*t));}}
 for(let j=1;j<clipped.length-1;j++)for(const v of [clipped[0],clipped[j],clipped[j+1]]){indices.push(positions.length/3);positions.push(...v!);}}
 return {positions,indices};}

// Smooth midline connective-tissue ribbon, using the native alba anterior
// profile below the xiphoid and native medial pectoral origins above it.
// This fixes a jagged source boundary; rectus grooves remain native geometry.
function midlineRibbon(){
 const alba=packet.meshes['Linea alba'].positions as number[];
 const sternum=Object.entries(packet.meshes).filter(([id])=>/pectoralis major/i.test(id)).flatMap(([,m]:any)=>{const a:number[]=[];for(let i=0;i<m.positions.length;i+=3)if(Math.abs(m.positions[i])<.03)a.push(...m.positions.slice(i,i+3));return a;});
 const samples:{y:number;z:number;width:number}[]=[];
 for(let row=0;row<=140;row++){const y=.855+row*(1.237-.855)/140,src=y<=1.237?alba:sternum,near:{d:number;z:number;x:number}[]=[];
 for(let i=0;i<src.length;i+=3)near.push({d:Math.abs(src[i+1]!-y),z:src[i+2]!,x:src[i]!});near.sort((a,b)=>a.d-b.d);
 const top=near.slice(0,Math.min(18,near.length)).map(p=>p.z).sort((a,b)=>a-b);const z=top[Math.floor(top.length*.8)]!;
 // Smooth the actual native alba width; continue its upper width over the sternum.
 const width=Math.min(.0045,Math.max(.002,Math.max(...near.slice(0,18).map(p=>Math.abs(p.x)))*.45));samples.push({y,z,width});}
 for(let pass=0;pass<8;pass++){const zs=samples.map(p=>p.z),ws=samples.map(p=>p.width);for(let i=1;i<samples.length-1;i++){samples[i]!.z=(zs[i-1]!+2*zs[i]!+zs[i+1]!)/4;samples[i]!.width=(ws[i-1]!+2*ws[i]!+ws[i+1]!)/4;}}
 const positions:number[]=[],indices:number[]=[];
 for(const p of samples)positions.push(-p.width,p.y,p.z+.0015,p.width,p.y,p.z+.0015);
 for(let i=0;i<samples.length-1;i++){const a=i*2;indices.push(a,a+1,a+3,a,a+3,a+2);}
 return {positions,indices};
}


// Native closed muscle caps have small medial dissection-cut serrations.
// Smooth their upper medial surface one-rings, bounded to 2 mm from source.
// Rectus grooves below Y=1.20 m are untouched.
const finishingAudit:Record<string,{changedVertices:number;maxDisplacement:number}>={};
function smoothMedialAttachment(m:any,id:string){
 const positions=[...m.positions] as number[],initial=[...positions],neighbors=new Map<number,Set<number>>();
 for(let i=0;i<m.indices.length;i+=3)for(const [a,b] of [[m.indices[i],m.indices[i+1]],[m.indices[i+1],m.indices[i+2]],[m.indices[i+2],m.indices[i]]]){if(!neighbors.has(a))neighbors.set(a,new Set());if(!neighbors.has(b))neighbors.set(b,new Set());neighbors.get(a)!.add(b);neighbors.get(b)!.add(a);}
 const smooth=(a:number,b:number,x:number)=>{const t=Math.max(0,Math.min(1,(x-a)/(b-a)));return t*t*(3-2*t);};
 for(let pass=0;pass<12;pass++){const copy=[...positions];for(const [i,set] of neighbors){const near=[...set],x=Math.abs(initial[i*3]!),y=initial[i*3+1]!,w=.35*(1-smooth(.018,.035,x))*smooth(1.20,1.23,y)*(1-smooth(1.405,1.43,y));if(w<=0)continue;
 const v=[0,1,2].map(c=>copy[i*3+c]!*(1-w)+near.reduce((sum,j)=>sum+copy[j*3+c]!,0)/near.length*w),d=Math.hypot(...v.map((p,c)=>p-initial[i*3+c]!)),scale=d>.002?.002/d:1;for(let c=0;c<3;c++)positions[i*3+c]=initial[i*3+c]!+(v[c]!-initial[i*3+c]!)*scale;}}
 let changedVertices=0,maxDisplacement=0;for(let i=0;i<positions.length;i+=3){const d=Math.hypot(positions[i]!-initial[i]!,positions[i+1]!-initial[i+1]!,positions[i+2]!-initial[i+2]!);if(d>1e-9)changedVertices++;maxDisplacement=Math.max(maxDisplacement,d);}if(maxDisplacement>.002000001)throw Error('Medial finishing exceeded 2 mm');finishingAudit[id]={changedVertices,maxDisplacement};
 return {...m,positions};
}

function sourceShapes(topic:string){const result:Surface[]=[],entries=['back','shoulders'].includes(topic)?Object.entries(packet.meshes):[...Object.entries(packet.meshes).filter(([id])=>id!=='Linea alba'),['Smooth midline connective tissue',midlineRibbon()]];for(const [id,m] of entries as [string,any][]){
 if(/frontalis|orbicularis|temporalis|masseter|nail plate/i.test(id))continue;
 // Deep triceps medial head and deep soleus are included only where naturally visible behind superficial source.
 const clipped=/External abdominal oblique/.test(id)?reflectOblique(m):m;
 const surface=/pectoralis major|Rectus abdominis/.test(id)&&!['back','shoulders'].includes(topic)?smoothMedialAttachment(clipped,id):clipped;
 const geo=new BufferGeometry();geo.setAttribute('position',new Float32BufferAttribute(surface.positions,3));geo.setIndex(surface.indices);geo.computeVertexNormals();
 const flat=geo.toNonIndexed(),isTarget=groups[topic]!.test(id)&&!(/gluteus/i.test(id)&&topic==='back')&&!(/External abdominal oblique/i.test(id)&&topic==='core'),color=/Smooth midline|Linea alba/.test(id)?'#eeeeee':/Rectus abdominis/.test(id)&&!['back','shoulders'].includes(topic)?(topic==='core'?'#555555':'#777777'):/External abdominal oblique/.test(id)&&!['back','shoulders'].includes(topic)?'#a0a0a0':isTarget?'#353535':'#666666';
 result.push({id,positions:new Float32Array(flat.getAttribute('position').array),normals:new Float32Array(flat.getAttribute('normal').array),rgb:new Color(color),roughness:.88,metalness:0});
 // Native Z-Anatomy superficial fascia is sometimes a single sheet. Give its
 // reverse face a real normal; otherwise a one-sided CPU raster reports false holes.
 const ps=flat.getAttribute('position').array,ns=flat.getAttribute('normal').array,backPs=new Float32Array(ps.length),backNs=new Float32Array(ns.length);
 for(let t=0;t<ps.length;t+=9)for(let v=0;v<3;v++)for(let c=0;c<3;c++){backPs[t+v*3+c]=ps[t+(2-v)*3+c]!;backNs[t+v*3+c]=-ns[t+(2-v)*3+c]!;}
 result.push({id:id+'-reverse',positions:backPs,normals:backNs,rgb:new Color(color),roughness:.88,metalness:0});geo.dispose();flat.dispose();
 }return result;}
async function renderFrame(topic:string,iteration:number){
 const angle=['back','shoulders'].includes(topic)?180:0;
 const f=frames[topic]!;const opts={angle,target:[0,f.target,.015] as [number,number,number],size:f.size,width:1600,height:1600};
 const renderPath=`${dir}/review/muscles-${topic}-studio-r${iteration}.png`,skinPath=`${dir}/review/muscles-${topic}-skin-r${iteration}.png`;
 if(!skinOnly){const shapes=sourceShapes(topic);await render(shapes,renderPath,opts);console.log(topic,shapes.reduce((n,s)=>n+s.positions.length/9,0),'two-sided raster triangles',renderPath);}
 if(!sourceOnly){
  const skin=await loadTopic(topic,false,'paper','body'),rig=JSON.parse(fs.readFileSync(`scripts/anatomy/${topic}/rig.json`,'utf8'));
  for(const s of skin){for(let i=0;i<s.positions.length;i+=3){s.positions[i]!+=rig.sourceCentre[0];s.positions[i+1]!+=rig.sourceCentre[2];s.positions[i+2]!-=rig.sourceCentre[1];}s.rgb=new Color('#e5e5e5');}
  await render(skin,skinPath,opts);console.log(topic,'backing',skinPath);
 }
}
fs.mkdirSync(`${dir}/review`,{recursive:true});fs.mkdirSync(`${dir}/sources`,{recursive:true});
for(const topic of (process.argv[2]? [process.argv[2]]:topics))await renderFrame(topic,Number(process.argv[3]??18));

if(Object.keys(finishingAudit).length)fs.writeFileSync(`${dir}/surface-finishing-r${Number(process.argv[3]??18)}.json`,JSON.stringify(finishingAudit,null,2)+'\n');
