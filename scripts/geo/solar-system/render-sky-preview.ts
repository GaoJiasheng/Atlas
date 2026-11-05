/** CPU catalogue/point-shader previews, using authored cameras, actual HYG rows,
 * theme ink and Three's real point-size uniform uploader. No browser or GPU.
 * pnpm tsx scripts/geo/solar-system/render-sky-preview.ts
 */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import sharp from 'sharp';
import { Color, Matrix4, PerspectiveCamera, ShaderLib, UniformsUtils, Vector3 } from 'three';
import { partsFile } from '../../../src/engines/space-scene/schema';
import { parseStarCatalogue, skySnapshot } from '../../../src/engines/space-scene/lib/sim/solar-sky';
import { cataloguePointSize, createCataloguePointMaterial } from '../../../src/engines/space-scene/stages/model3d/CatalogueSky';
import { resolveDataColor } from '../../../src/engines/space-scene/lib/color';
import type { SimValues } from '../../../src/engines/space-scene/sim-schema';
const out=process.argv[2]??'/tmp/atlas-solar-system-polish/sky';mkdirSync(out,{recursive:true});
const file=partsFile.parse(JSON.parse(readFileSync('src/content/topics/solar-system/data/parts.json','utf8')));
const chapterFile=process.argv[4]??'06-singapore-star-patterns';
if(!['05-a-turning-viewpoint','06-singapore-star-patterns'].includes(chapterFile))throw new Error('Expected a sky chapter');
const chapter=JSON.parse(readFileSync(`src/content/topics/solar-system/chapters/${chapterFile}.mdx`,'utf8').split('---')[1]!);
const c=file.sim!.solarSystem!, overlay=file.sim!.overlays!.find(x=>x.kind==='catalogue-sky')!;
if(overlay.kind!=='catalogue-sky')throw new Error('Missing catalogue overlay');
const catalogue=parseStarCatalogue(JSON.parse(readFileSync(`public/catalogues/solar-system/${overlay.catalogue}`,'utf8')),c.patterns);
// Optional presentation-only override for a repeatable before/after comparison.
const sizeOverride=process.argv[3]===undefined?undefined:Number(process.argv[3]);
if(sizeOverride!==undefined&&(!Number.isFinite(sizeOverride)||sizeOverride<1||sizeOverride>6))throw new Error('Point size must be 1–6 CSS px');
const pointSize=sizeOverride??cataloguePointSize(catalogue);
const modulePath='three/src/renderers/webgl/WebGLMaterials.js';
const {WebGLMaterials}=await import(modulePath), uploader=WebGLMaterials({},{});
const css=readFileSync('src/theme/tokens.css','utf8');
const smooth=(lo:number,hi:number,x:number)=>{const t=Math.min(1,Math.max(0,(x-lo)/(hi-lo)));return t*t*(3-2*t)};
const encode=(x:number)=>Math.round(255*Math.max(0,Math.min(1,x<=.0031308?x*12.92:1.055*x**(1/2.4)-.055)));
const report:Record<string,unknown>[]=[];
for(const theme of ['paper','cinema'] as const){
 const block=css.slice(css.indexOf(`:root[data-theme="${theme}"]`)).split('}')[0]!;
 const tokens=Object.fromEntries([...block.matchAll(/--([\w-]+):\s*([^;]+);/g)].map(m=>[m[1]!,m[2]!.trim()]));
 for(let i=0;i<6;i++)for(const [k,v] of Object.entries(tokens))tokens[k]=v.replace(/var\(--([\w-]+)\)/g,(_,n:string)=>tokens[n]??'#888888');
 const material=createCataloguePointMaterial(resolveDataColor('token:ink',tokens,theme),pointSize);
 const bg=new Color(tokens.paper!), ink=material.color;
 for(const dpr of [1,2])for(const [index,beat] of chapter.state.beats.entries()){
  const values:SimValues={...Object.fromEntries(file.sim!.controls.map(x=>[x.id,x.default])),...chapter.state.sim.set,...beat.sim?.set};
  const sky=skySnapshot(c,values,catalogue,overlay.radius),pose=beat.camera??chapter.state.camera;
  const width=800*dpr,height=520*dpr,pixels=new Float32Array(width*height*3);
  for(let i=0;i<width*height;i++)pixels.set([bg.r,bg.g,bg.b],i*3);
  const camera=new PerspectiveCamera(pose.fov,width/height,.001,10000);camera.position.fromArray(pose.position);camera.lookAt(new Vector3(...pose.target));camera.updateMatrixWorld();
  const project=new Matrix4().multiplyMatrices(camera.projectionMatrix,camera.matrixWorldInverse);
  const uniforms=UniformsUtils.clone(ShaderLib.points.uniforms);uploader.refreshMaterialUniforms(uniforms,material,dpr,height,null);
  const diameter=uniforms.size!.value as number, points=new Map<string,[number,number,number]>();
  for(const row of sky.rows)if(row.shown){const p=new Vector3(...row.position).applyMatrix4(project);if(Math.abs(p.z)<1)points.set(row.hip,[(p.x*.5+.5)*width,(-p.y*.5+.5)*height,p.z])}
  // Lines preserve their live opacity. CPU supersampling is only for subpixel coverage.
  const lineColor=new Color(resolveDataColor('token:signal',tokens,theme));
  const blend=(x:number,y:number,a:number,color:Color)=>{if(x<0||y<0||x>=width||y>=height)return;const at=(y*width+x)*3;pixels[at]=pixels[at]!*(1-a)+color.r*a;pixels[at+1]=pixels[at+1]!*(1-a)+color.g*a;pixels[at+2]=pixels[at+2]!*(1-a)+color.b*a};
  if(values[c.controls.patternLinks]===true&&!sky.depth)for(const [a,b] of c.patterns[String(values[c.controls.skyTarget]) as keyof typeof c.patterns]){
   const A=points.get(a),B=points.get(b);if(!A||!B)continue;
   const loX=Math.max(0,Math.floor(Math.min(A[0],B[0])-dpr)),hiX=Math.min(width-1,Math.ceil(Math.max(A[0],B[0])+dpr));
   const loY=Math.max(0,Math.floor(Math.min(A[1],B[1])-dpr)),hiY=Math.min(height-1,Math.ceil(Math.max(A[1],B[1])+dpr));
   const dx=B[0]-A[0],dy=B[1]-A[1],length2=dx*dx+dy*dy;
   for(let y=loY;y<=hiY;y++)for(let x=loX;x<=hiX;x++){
    const t=Math.min(1,Math.max(0,((x+.5-A[0])*dx+(y+.5-A[1])*dy)/length2));
    const dist=Math.hypot(x+.5-A[0]-t*dx,y+.5-A[1]-t*dy);
    blend(x,y,.65*(1-smooth(.15*dpr,.65*dpr,dist)),lineColor);
   }
  }
  let visible=0;
  for(const [cx,cy] of points.values()){
   if(cx<0||cy<0||cx>width||cy>height)continue;visible++;
   for(let y=Math.floor(cy-diameter/2);y<=Math.ceil(cy+diameter/2);y++)for(let x=Math.floor(cx-diameter/2);x<=Math.ceil(cx+diameter/2);x++){
    let alpha=0;for(let sy=0;sy<4;sy++)for(let sx=0;sx<4;sx++)alpha+=(1-smooth(.32,.5,Math.hypot((x+(sx+.5)/4-cx)/diameter,(y+(sy+.5)/4-cy)/diameter)))/16;
    blend(x,y,alpha,ink);
   }
  }
  const rgb=Buffer.from(pixels.map(encode)),name=`${theme}-${index+1}-${dpr}x`;
  await sharp(rgb,{raw:{width,height,channels:3}}).png().toFile(`${out}/${name}.png`);
  report.push({theme,beat:index+1,dpr,deviceDiameter:diameter,cssDiameter:diameter/dpr,visibleStars:visible,target:values[c.controls.skyTarget],depth:sky.depth});
 }
 material.dispose();
}
writeFileSync(`${out}/report.json`,JSON.stringify(report,null,2)+'\n');
const previews=[];
for(const theme of ['paper','cinema'])for(const beat of chapter.state.beats.map((_:unknown,i:number)=>i+1)){
 const png=await sharp(`${out}/${theme}-${beat}-1x.png`).resize(640,416).png().toBuffer();
 const title=Buffer.from(`<svg width="640" height="30"><rect width="640" height="30" fill="#1f2124"/><text x="10" y="20" fill="#e9e4d8" font-size="13" font-family="sans-serif">${theme} · beat ${beat} · ${pointSize} CSS px · CPU reconstruction</text></svg>`);
 previews.push({png,title});
}
await sharp({create:{width:1920,height:Math.ceil(previews.length/3)*446,channels:3,background:'#1f2124'}}).composite(previews.flatMap((p,i)=>[{input:p.png,left:(i%3)*640,top:Math.floor(i/3)*446},{input:p.title,left:(i%3)*640,top:Math.floor(i/3)*446+416}])).png().toFile(`${out}/contact-sheet.png`);
console.log(out,report);
