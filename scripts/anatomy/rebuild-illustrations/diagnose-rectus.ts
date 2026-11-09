/** Shared repaired render source for all six muscle covers.
 * Native CC BY-SA Z-Anatomy superficial mesh set; no skeleton is included.
 * Source skin is a pale closed silhouette for undisected head/hands/feet and body contour.
 * An orthographic skin mask contains muscle projection; this illustration compositing
 * is not a topology fix and does not alter the runtime GLB.
 */
import fs from 'node:fs';

import { BufferGeometry, Float32BufferAttribute, Color } from 'three';
import { render, loadTopic, type Surface } from '../rebuild-evidence/studio';
const dir='scripts/anatomy/rebuild-illustrations';
const packet=JSON.parse(fs.readFileSync('scripts/anatomy/cache/rebuild-source.json','utf8'));

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
function sourceShapes(topic:string){const result:Surface[]=[];for(const [id,m] of Object.entries(packet.meshes) as [string,any][]){
 if(/frontalis|orbicularis|temporalis|masseter|nail plate/i.test(id))continue;
 // Deep triceps medial head and deep soleus are included only where naturally visible behind superficial source.
 const surface=/External abdominal oblique/.test(id)?reflectOblique(m):m;
 const geo=new BufferGeometry();geo.setAttribute('position',new Float32BufferAttribute(surface.positions,3));geo.setIndex(surface.indices);geo.computeVertexNormals();
 const flat=geo.toNonIndexed(),isTarget=groups[topic]!.test(id)&&!(/gluteus/i.test(id)&&topic==='back'),color=/linea alba/i.test(id)?'#eeeeee':isTarget?'#555555':'#939393';
 result.push({id,positions:new Float32Array(flat.getAttribute('position').array),normals:new Float32Array(flat.getAttribute('normal').array),rgb:new Color(color),roughness:.88,metalness:0});
 // Native Z-Anatomy superficial fascia is sometimes a single sheet. Give its
 // reverse face a real normal; otherwise a one-sided CPU raster reports false holes.
 const ps=flat.getAttribute('position').array,ns=flat.getAttribute('normal').array,backPs=new Float32Array(ps.length),backNs=new Float32Array(ns.length);
 for(let t=0;t<ps.length;t+=9)for(let v=0;v<3;v++)for(let c=0;c<3;c++){backPs[t+v*3+c]=ps[t+(2-v)*3+c]!;backNs[t+v*3+c]=-ns[t+(2-v)*3+c]!;}
 result.push({id:id+'-reverse',positions:backPs,normals:backNs,rgb:new Color(color),roughness:.88,metalness:0});geo.dispose();flat.dispose();
 }return result;}

const shapes=sourceShapes('core');
const opts={angle:0,target:[0,1.045,.015] as [number,number,number],size:1.56,width:1600,height:1600};
const rectus=shapes.filter(s=>/Rectus abdominis/.test(s.id));
for(const s of rectus)s.rgb=new Color('#777777');
await render(rectus,`${dir}/review/core-rectus-isolated.png`,opts);
for(const s of shapes)s.rgb=new Color(/Rectus abdominis/.test(s.id)?'#a94438':/External abdominal oblique/.test(s.id)?'#386a8a':/Linea alba/.test(s.id)?'#f5f3e9':'#888888');
await render(shapes,`${dir}/review/core-rectus-ownership.png`,opts);
