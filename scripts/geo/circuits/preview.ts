/** Offline raster of EXACT partPieces() geometry, engine material resolver and
 * paper/cinema studio + ACES. Reuses fossils' GGX + sampled RoomEnvironment.
 * CPU finite PMREM integration and mean roughness are numerical approximations,
 * not GPU acceptance. No browser/WebGL. See REBUILD-3D.md for provenance.
 */
import fs from 'node:fs';
import sharp from 'sharp';
import {Color,Matrix4,Matrix3,Vector3,OrthographicCamera} from 'three';
import {partsFile,type Part} from '../../../src/engines/space-scene/schema';
import {partPieces} from '../../../src/engines/space-scene/stages/model3d/geometry';
import {partMaterialSlots} from '../../../src/engines/space-scene/lib/parts';
import {resolveMaterialLook} from '../../../src/engines/space-scene/lib/color';
import {prepareStudio,studioShade,studioRigs,aces} from './studio-cpu';
type V=[number,number,number];
const round=process.argv[2]??'round1',path=process.argv[3]??'src/content/topics/circuits/data/parts.json';
const folder=`/private/tmp/atlas-circuits-rebuild/${round}`;fs.mkdirSync(folder,{recursive:true});
const file=partsFile.parse(JSON.parse(fs.readFileSync(path,'utf8')));
const css=fs.readFileSync('src/theme/tokens.css','utf8');
const tokens:Record<string,Record<string,string>>={};
for(const theme of ['paper','cinema']){const at=css.indexOf(`:root[data-theme="${theme}"] {`),body=css.slice(at,css.indexOf('\n}',at));tokens[theme]=Object.fromEntries([...body.matchAll(/--([a-z0-9-]+):\s*(#[0-9a-f]{6})/gi)].map(m=>[m[1]!,m[2]!]));}
// Fail if the reused numerical rig diverges from values the actual engine uses.
const lighting=fs.readFileSync('src/engines/space-scene/stages/model3d/Lighting.tsx','utf8');
for(const theme of ['paper','cinema'] as const){const body=lighting.match(new RegExp(`${theme}: \\{([\\s\\S]*?)\\n  \\}`))![1]!;const rig=studioRigs[theme];for(const [i,key] of ['key','fill','rim'].entries()){const m=body.match(new RegExp(`${key}: \\['(#[0-9a-f]+)', ([\\d.]+)\\]`))!;if(m[1]!==rig.lights[i]![0]||Number(m[2])!==rig.lights[i]![1])throw Error('CPU light rig drift');}for(const k of ['env','exposure'] as const)if(Number(body.match(new RegExp(`${k}: ([\\d.]+)`))![1])!==rig[k])throw Error('CPU studio exposure drift');}
prepareStudio();
const W=800,H=650;
type S={p:Float32Array,n:Float32Array,rgb:V,rough:number,metal:number,opacity:number,environment:number,id:string};
function shapes(parts:Part[],theme:'paper'|'cinema'):S[]{return parts.flatMap(part=>{const slots=partMaterialSlots(part),at=new Vector3(...part.primitive!.at);return partPieces(part).flatMap(piece=>{if(piece.lines)return[];const g=piece.geometry,a=g.getAttribute('position'),n=g.getAttribute('normal'),ix=g.index,mat=slots[piece.slot??0]!,look=resolveMaterialLook(mat.color,tokens[theme]!,theme,mat.tint),size=ix?.count??a.count;return(piece.matrices??[new Matrix4()]).map(matrix=>{const p=new Float32Array(size*3),norm=new Float32Array(size*3),nm=new Matrix3().getNormalMatrix(matrix),v=new Vector3();for(let i=0;i<size;i++){const j=ix?ix.getX(i):i;v.fromBufferAttribute(a,j).applyMatrix4(matrix).add(at);p.set(v.toArray(),i*3);v.fromBufferAttribute(n,j).applyMatrix3(nm).normalize();norm.set(v.toArray(),i*3);}return{p,n:norm,rgb:new Color(look.color).toArray() as V,rough:look.roughness*.92,metal:look.metalness,opacity:look.opacity,environment:look.envIntensity,id:part.id};});});});}
function camera(pos:V,target:V,width:number,up?:V,roll=0){const c=new OrthographicCamera(-width/2,width/2,width*H/W/2,-width*H/W/2,.0001,5);c.position.fromArray(pos);if(up)c.up.fromArray(up);c.lookAt(new Vector3(...target));c.rotateZ(roll*Math.PI/180);c.updateMatrixWorld();return c;}
async function render(ss:S[],cam:OrthographicCamera,theme:'paper'|'cinema',name:string){
 const depth=new Float32Array(W*H).fill(Infinity),rgb=new Float32Array(W*H*3),cm=new Matrix4().multiplyMatrices(cam.projectionMatrix,cam.matrixWorldInverse),v=new Vector3();
 for(const s of [...ss].sort((a,b)=>b.opacity-a.opacity))for(let t=0;t<s.p.length;t+=9){
  const a=new Vector3().fromArray(s.p,t),b=new Vector3().fromArray(s.p,t+3),c=new Vector3().fromArray(s.p,t+6);if(b.clone().sub(a).cross(c.clone().sub(a)).dot(cam.position.clone().sub(a))<=0)continue;
  const q:number[]=[];for(const p of[a,b,c]){v.copy(p).applyMatrix4(cm);q.push((v.x*.5+.5)*W,(-v.y*.5+.5)*H,v.z);}
  const [ax,ay,az,bx,by,bz,cx,cy,cz]=q as [number,number,number,number,number,number,number,number,number];const d=(by-cy)*(ax-cx)+(cx-bx)*(ay-cy);if(Math.abs(d)<1e-9)continue;
  const minX=Math.max(0,Math.floor(Math.min(ax,bx,cx))),maxX=Math.min(W-1,Math.ceil(Math.max(ax,bx,cx))),minY=Math.max(0,Math.floor(Math.min(ay,by,cy))),maxY=Math.min(H-1,Math.ceil(Math.max(ay,by,cy)));
  for(let y=minY;y<=maxY;y++)for(let x=minX;x<=maxX;x++){const u=((by-cy)*(x+.5-cx)+(cx-bx)*(y+.5-cy))/d,w=((cy-ay)*(x+.5-cx)+(ax-cx)*(y+.5-cy))/d,k=1-u-w;if(u<0||w<0||k<0)continue;const z=u*az+w*bz+k*cz,i=y*W+x;if(z>=depth[i]!)continue;depth[i]=z;
   const n=new Vector3(u*s.n[t]!+w*s.n[t+3]!+k*s.n[t+6]!,u*s.n[t+1]!+w*s.n[t+4]!+k*s.n[t+7]!,u*s.n[t+2]!+w*s.n[t+5]!+k*s.n[t+8]!).normalize();const p=a.clone().multiplyScalar(u).addScaledVector(b,w).addScaledVector(c,k),eye=cam.position.clone().sub(p).normalize();const color=studioShade(s.rgb,n.toArray() as V,eye.toArray() as V,theme,Math.max(.08,s.rough),s.metal,s.environment);for(let j=0;j<3;j++)rgb[i*3+j]=rgb[i*3+j]!*(1-s.opacity)+color[j]!*s.opacity;
  }
 }
 const out=new Uint8Array(W*H*3),bg=new Color(theme==='paper'?'#e9e4d8':'#1f2124'),col=new Color();for(let i=0;i<W*H;i++){if(depth[i]===Infinity)col.copy(bg);else col.fromArray(aces([rgb[i*3]!,rgb[i*3+1]!,rgb[i*3+2]!],studioRigs[theme].exposure));col.convertLinearToSRGB();out[i*3]=Math.round(col.r*255);out[i*3+1]=Math.round(col.g*255);out[i*3+2]=Math.round(col.b*255);}
 await sharp(out,{raw:{width:W,height:H,channels:3}}).png().toFile(`${folder}/${name}.png`);console.log(name);
}
const select=(...ids:string[])=>file.parts.filter(p=>ids.includes(p.id));
const targets={motor:[-.27,.018,-.035] as V,buzzer:[-.27,.006,-.105] as V,clip:[-.103,.016,.115] as V};
const shots=[
 ['motor-front',['motor'],camera([-.27,.12,-.035],[-.27,.025,-.035],.029,[0,0,1])],
 ['motor-profile',['motor'],camera([-.15,.020,-.035],[-.27,.020,-.035],.053)],
 ['motor-three-quarter',['motor'],camera([-.21,.08,.065],targets.motor,.055,undefined,-126)],
 ['motor-detail',['motor'],camera([-.24,.06,.02],[-.27,.028,-.035],.025,undefined,-126)],
 ['motor-rear',['motor'],camera([-.24,-.06,.065],[-.27,.004,-.035],.033)],
 ['buzzer-front',['buzzer'],camera([-.27,.09,-.105],targets.buzzer,.018,[0,0,-1])],
 ['buzzer-profile',['buzzer'],camera([-.27,.006,.00],targets.buzzer,.027)],
 ['buzzer-three-quarter',['buzzer'],camera([-.24,.035,-.045],targets.buzzer,.032,undefined,24)],
 ['buzzer-detail',['buzzer'],camera([-.26,.035,-.065],[-.27,.011,-.105],.012)],
 ['clips-profile',['gap-clips','leads'],camera([-.103,.021,.22],targets.clip,.045)],
 ['clips-three-quarter',['gap-clips','leads'],camera([-.08,.055,.20],targets.clip,.047)],
 ['clips-front',['gap-clips','leads'],camera([-.04,.017,.115],targets.clip,.019,[0,1,0])],
 ['clips-detail',['gap-clips','leads'],camera([-.09,.028,.17],[-.095,.016,.115],.024)],
 ['board-hero',file.parts.map(p=>p.id),camera([.55,.65,.9],[0,.02,0],.85)],
] as const;
const only=process.env.CIRCUITS_SHOTS?.split(',');
for(const [name,ids,cam]of shots){if(only&&!only.includes(name))continue;for(const theme of name==='board-hero'||name==='motor-three-quarter'||name==='buzzer-three-quarter'?['paper','cinema'] as const:['paper'] as const){let ss=shapes(select(...ids),theme);if(name.startsWith('clips'))ss=ss.map(s=>{if(s.id!=='leads'&&s.id!=='gap-clips')return s;const p:number[]=[],n:number[]=[];for(let t=0;t<s.p.length;t+=9){let keep=s.id==='gap-clips'?s.p[t]!<-.07:false;if(s.id==='leads'){const x=(s.p[t]!+s.p[t+3]!+s.p[t+6]!)/3,y=(s.p[t+1]!+s.p[t+4]!+s.p[t+7]!)/3,z=(s.p[t+2]!+s.p[t+5]!+s.p[t+8]!)/3;keep=Math.hypot(x+.117,y-.016,z-.115)<.018;}if(keep){p.push(...s.p.slice(t,t+9));n.push(...s.n.slice(t,t+9));}}return{...s,p:new Float32Array(p),n:new Float32Array(n)};});await render(ss,cam,theme,`${name}-${theme}`);}}
const metrics:Record<string,unknown>={},total={triangles:0,calls:0};
for(const p of file.parts){let tris=0;const pieces=partPieces(p);for(const s of pieces)if(!s.lines)tris+=(s.geometry.index?.count??s.geometry.getAttribute('position').count)/3*(s.matrices?.length??1);const calls=pieces.filter(p=>p.matrices!==null).length+new Set(pieces.filter(p=>p.matrices===null).map(p=>p.slot??0)).size;metrics[p.id]={triangles:tris,callsEstimate:calls};total.triangles+=tris;total.calls+=calls;}
fs.writeFileSync(`${folder}/metrics.json`,JSON.stringify({parts:metrics,total,glbBytes:0},null,2));
