/** Offline R2 geometry plates, not browser acceptance.
 * pnpm tsx scripts/geo/how-planes-fly/audit-geometry.mjs [parts.json] [before|after]
 * Optional first argument permits a read-only git-show baseline JSON in /tmp.
 * Uses production mesh construction, orthographic triangle projection and a
 * deliberately simple CPU painter; no textures, WebGL lighting or HUD.
 */
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {resolve} from 'node:path';
import sharp from 'sharp';
import { Matrix4,Vector3,Triangle,Ray } from 'three';
import {partBounds,modelBounds} from '../../../src/engines/space-scene/lib/parts.ts';
import {explodeOffset} from '../../../src/engines/space-scene/lib/explode.ts';
import {partPieces} from '../../../src/engines/space-scene/stages/model3d/geometry.ts';
const root=fileURLToPath(new URL('../../../',import.meta.url));
const tag=process.argv[3]??'after';
if(!/^[a-z0-9-]+$/.test(tag))throw new Error('Use a kebab-case output label');
const model=JSON.parse(readFileSync(process.argv[2]?resolve(process.argv[2]):root+'/src/content/topics/how-planes-fly/data/parts.json','utf8'));
const parts=Object.fromEntries(model.parts.map(p=>[p.id,p]));
const W=['fuselage-shell','cockpit-glazing','wing-left','wing-right','wing-tip-left','wing-tip-right','aileron-left','aileron-right','spoiler-left','flap-left','flap-right','slat-left','slat-right','tailplane-left','tailplane-right','elevator-left','elevator-right','fin','rudder','nacelle-left','nacelle-right','fan-left','fan-right'];
const B=['front-spar','rear-spar','wing-ribs'];
const E=['engine-shell','fan-disc','bypass-duct','compressor-bank','compressor-rotor','combustor-ring','turbine-bank','hp-turbine-rotor','lp-turbine-rotor','lp-shaft','hp-shaft','core-nozzle','bypass-nozzle'];
function triangles(ids,cut=false){let out=[];for(const id of ids){let p=parts[id];for(const piece of partPieces(p)){let g=piece.geometry,index=g.index?.array,a=g.getAttribute('position');for(const m of piece.matrices??[new Matrix4()]){let v=Array.from({length:a.count},(_,i)=>new Vector3(a.getX(i),a.getY(i),a.getZ(i)).applyMatrix4(m).add(new Vector3(...p.primitive.at)));for(let i=0;i<(index?.length??v.length);i+=3){let tri=[0,1,2].map(j=>v[index?index[i+j]:i+j]);if(cut){const clipped=[];for(let j=0;j<3;j++){let a=tri[j],b=tri[(j+1)%3],ain=a.z<=-2.8,bin=b.z<=-2.8;if(ain)clipped.push(a);if(ain!==bin)clipped.push(a.clone().lerp(b,(-2.8-a.z)/(b.z-a.z)));}for(let j=1;j+1<clipped.length;j++)out.push({tri:[clipped[0],clipped[j],clipped[j+1]],id,color:p.primitive.color});}else out.push({tri,id,color:p.primitive.color});}}}}return out;}
function svg(ids,cam,target,title,cut=false){const origin=new Vector3(...cam),toward=new Vector3(...target).sub(origin).normalize(),right=new Vector3().crossVectors(toward,new Vector3(0,1,0)).normalize(),up=new Vector3().crossVectors(right,toward).normalize();let tris=triangles(ids,cut),points=tris.flatMap(t=>t.tri.map(p=>[p.dot(right),p.dot(up)])),x0=points.reduce((a,p)=>Math.min(a,p[0]),Infinity),x1=points.reduce((a,p)=>Math.max(a,p[0]),-Infinity),y0=points.reduce((a,p)=>Math.min(a,p[1]),Infinity),y1=points.reduce((a,p)=>Math.max(a,p[1]),-Infinity),scale=Math.min(1420/(x1-x0),680/(y1-y0));let paths=tris.map(({tri,id,color})=>{let normal=new Vector3().crossVectors(tri[1].clone().sub(tri[0]),tri[2].clone().sub(tri[0])).normalize(),lit=.72+.28*Math.abs(normal.dot(new Vector3(-.4,.7,.6).normalize()));let c=color==='rubber'?[55,59,62]:color==='glass'?[69,88,99]:color==='steel'?[133,141,147]:id.includes('aileron')||id.includes('flap')||id.includes('slat')||id.includes('spoiler')?[143,151,158]:[201,202,198];let fill=c.map(v=>Math.round(v*lit));return {z:tri.reduce((a,p)=>a+p.dot(toward),0)/3,path:`<path d="M${tri.map(p=>`${(90+(p.dot(right)-x0)*scale).toFixed(2)},${(100+(y1-p.dot(up))*scale).toFixed(2)}`).join('L')}Z" fill="rgb(${fill.join(',')})" stroke="rgb(${fill.join(',')})" stroke-width=".3"/>`};}).sort((a,b)=>b.z-a.z).map(p=>p.path).join('');return `<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="900" viewBox="0 0 1600 900"><rect width="1600" height="900" fill="#f5f1e7"/><text x="60" y="50" font-family="monospace" font-size="23" fill="#353831">HOW PLANES FLY · ${title} · ${tag.toUpperCase()}</text>${paths}<text x="60" y="860" font-family="monospace" font-size="18" fill="#68685f">CPU triangle projection · authored geometry only · no browser / materials / overlays / acceptance</text></svg>`;}
const dir=root+'/docs/screenshots/how-planes-fly';mkdirSync(dir,{recursive:true});
for(const [name,ids,cam,tgt,cut]of [['aircraft',W,[-5,4.5,6],[0,1.1,0],false],['wingbox',B,[-1.45,1.85,4.85],[.02,1.1,2.4],false],['engine',E,[-.12,1.45,1.6],[-.12,.8,-2.8],true]]){let out=dir+`/static-${name}-${tag}.png`;await sharp(Buffer.from(svg(ids,cam,tgt,name,cut))).png().toFile(out);console.log(out);}

// Conservative bounding boxes include voids: intersections identify review
// candidates, not physical collisions (e.g. shaft inside casing is expected).
function overlap(a,b){const spans=a.min.map((x,i)=>Math.min(a.max[i],b.max[i])-Math.max(x,b.min[i]));return spans.every(x=>x>1e-6)?spans.reduce((a,b)=>a*b,1):0;}
const report={};
for(const [station,ids]of [['aircraft',W],['wingbox',B],['engine',E]]){
  report[station]={restBounds:modelBounds(ids.map(id=>parts[id]))};
  for(const [state,amount]of [['rest',0],['exploded',1]]){
    const boxes=Object.fromEntries(ids.map(id=>[id,partBounds(parts[id],(parts[id].explode?explodeOffset(parts[id].explode,amount):[0,0,0]))]));
    const overlaps=ids.flatMap((id,i)=>ids.slice(i+1).flatMap(other=>{const volume=overlap(boxes[id],boxes[other]);return volume?[{parts:[id,other],aabbVolume:volume}]:[];})).sort((a,b)=>b.aabbVolume-a.aabbVolume);
    report[station][state]={boxes,overlaps};
  }
}
const lt=triangles(['wing-left']).map(x=>x.tri),rt=triangles(['wing-tip-left']).map(x=>x.tri);
let crossings=0,min=Infinity;const temp=new Vector3(),triangle=new Triangle();
for(const [ts,ps]of [[lt,rt],[rt,lt]])for(const a of ts){triangle.set(...a);for(const p of ps.flat()){triangle.closestPointToPoint(p,temp);min=Math.min(min,temp.distanceTo(p));}}
for(const a of lt)for(let j=0;j<3;j++){const p=a[j],q=a[(j+1)%3],len=p.distanceTo(q);if(!len)continue;const ray=new Ray(p,q.clone().sub(p).normalize());for(const b of rt){const hit=ray.intersectTriangle(...b,false,temp);if(hit&&hit.distanceTo(p)<=len+1e-8)crossings++;}}
report.winglet={surfaceEdgeCrossings:crossings,nearestVertexToTriangle:min,note:'Crossings confirm seated surfaces; nearest vertex distance alone does not measure mesh separation.'};
writeFileSync(dir+`/static-geometry-${tag}.json`,JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify(Object.fromEntries(Object.entries(report).map(([id,r])=>[id,r.rest?{restCandidates:r.rest.overlaps.length,explodedCandidates:r.exploded.overlaps.length}:r])),null,2));
