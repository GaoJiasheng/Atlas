/**
 * Offline original planet meshes. Natural Earth 110m coast data, NASA LROC
 * albedo / LOLA topography; see the topic's data/SOURCES.md. No runtime fetch.
 * pnpm tsx scripts/geo/sun-earth-moon/build-surfaces.ts
 * Uses the accepted atlasSurface material and _emission rendering paths.
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { Document, NodeIO } from '@gltf-transform/core';
import { EXTTextureWebP, EXTMeshoptCompression } from '@gltf-transform/extensions';
import { dedup, prune, weld } from '@gltf-transform/functions';
import { MeshoptEncoder } from 'meshoptimizer';
import sharp from 'sharp';
import { feature } from 'topojson-client';
import type { FeatureCollection, MultiPolygon } from 'geojson';
import type { BufferGeometry } from 'three';
import { fbm, globe, sampleMap, SINGAPORE } from './surfaces';
import { readLolaTiff } from './lola-tiff';
const ROOT = new URL('../../../', import.meta.url);
const local = (s: string) => new URL(s, ROOT);
const OUT = local('public/models/sun-earth-moon/');
mkdirSync(OUT, { recursive: true });
const QA=local('scripts/geo/sun-earth-moon/qa/'),SOURCE=local('scripts/geo/sun-earth-moon/sources/');
mkdirSync(QA,{recursive:true});mkdirSync(SOURCE,{recursive:true});
const world = JSON.parse(readFileSync(local('node_modules/world-atlas/land-110m.json'), 'utf8')) as Parameters<typeof feature>[0];
const land = feature(world, world.objects.land!) as unknown as FeatureCollection<MultiPolygon>;
const width=2048,height=1024;
// Unwrap each real ring before rasterisation; repeated copies close the
// antimeridian. Antarctica needs the southern edge rather than a global chord.
const paths: string[]=[];
for(const f of land.features) for(const polygon of f.geometry.coordinates) {
  const rings=polygon.map(ring=>{
    const pts: number[][]=[];
    let prev=ring[0]![0]!;
    for(const p of ring){let lon=p[0]!;while(lon-prev>180)lon-=360;while(lon-prev< -180)lon+=360;pts.push([lon,p[1]!]);prev=lon;}
    // The polar continent crosses the seam once: explicitly close around pole.
    if(Math.abs(pts.at(-1)![0]!-pts[0]![0]!)>180) pts.push([pts.at(-1)![0]!, -90],[pts[0]![0]!, -90]);
    return pts;
  });
  for(const offset of [-360,0,360]) paths.push(rings.map(r=>r.map(([lon,lat],i)=>`${i?'L':'M'}${((lon!+offset+180)/360*width).toFixed(3)},${((90-lat!)/180*height).toFixed(3)}`).join(' ')+'Z').join(' '));
}
const mask=await sharp(Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}"><rect width="100%" height="100%" fill="black"/><path d="${paths.join(' ')}" fill="white" fill-rule="evenodd"/></svg>`)).removeAlpha().greyscale().raw().toBuffer();
await sharp(mask,{raw:{width,height,channels:1}}).png().toFile(fileURLToPath(new URL('land-mask.png',QA)));
const earth=Buffer.alloc(width*height*3);
const smooth=(a:number,b:number,v:number)=>{const t=Math.max(0,Math.min(1,(v-a)/(b-a)));return t*t*(3-2*t);};
const lerp=(a:number,b:number,t:number)=>a+(b-a)*t;
for(let y=0;y<height;y++) for(let x=0;x<width;x++) {
  const lat=90-(y+.5)/height*180,lon=(x+.5)/width*360-180,a=lat*Math.PI/180,b=lon*Math.PI/180;
  const sx=Math.cos(a)*Math.cos(b),sy=Math.sin(a),sz=Math.cos(a)*Math.sin(b);
  const broad=fbm(sx*4+20,sy*4,sz*4), fine=fbm(sx*28,sy*28,sz*28),isLand=mask[y*width+x]!/255;
  // Restrained natural palette; latitude/noise colour variation is an
  // illustration of surface cover, never a vegetation or climate dataset.
  const arid=Math.exp(-(((Math.abs(lat)-25)/16)**2))*smooth(.42,.65,broad);
  const snow=smooth(66,80,Math.abs(lat)+fine*9-4);
  const sea=[47+fine*8,99+fine*11,130+fine*12];
  const soil=[lerp(100,182,arid),lerp(127,163,arid),lerp(98,116,arid)];
  let rgb=sea.map((v,c)=>lerp(v,soil[c]!+(broad-.5)*22,isLand));
  rgb=rgb.map(v=>lerp(v,222,snow*(isLand*.9+.1)));
  // Domain-warped, broken synoptic wisps, with gaps and unequal widths.
  const warp=fbm(sx*3+5,sy*3+2,sz*3)*2;
  const cloudField=fbm(sx*8+warp,sy*21+3,sz*8-warp);
  const band=.5+.5*Math.sin(a*14+Math.sin(b*3)*.8);
  let cloud=smooth(.62,.79,cloudField)*(.35+.65*band)*.72;
  // Clear the tiny fixed Singapore pin; it is a position, not an island outline.
  const dl=((lon-SINGAPORE.lon+540)%360)-180;
  cloud*=smooth(2,5,Math.hypot((lat-SINGAPORE.lat),dl));
  rgb=rgb.map(v=>lerp(v,235,cloud));
  const pinDistance=Math.hypot(lat-SINGAPORE.lat,dl*Math.cos(a));
  const pin=Math.max(1-smooth(.13,.26,pinDistance),smooth(.44,.54,pinDistance)*(1-smooth(.68,.78,pinDistance)));
  rgb=rgb.map((v,c)=>lerp(v,[204,99,40][c]!,pin));
  const i=(y*width+x)*3;
  rgb.forEach((v,c)=>earth[i+c]=Math.round(v));
}
const earthTexture=await sharp(earth,{raw:{width,height,channels:3}}).webp({quality:88,effort:6}).toBuffer();
const moonPath=existsSync(new URL('lroc.jpg',SOURCE))?new URL('lroc.jpg',SOURCE):local('scripts/geo/sun-earth-moon/refs/lroc_color_2k.jpg');
const demPath=local('scripts/geo/sun-earth-moon/refs/ldem_4_uint.tif');
const dem=existsSync(new URL('lola.u16',SOURCE))
  ? {...JSON.parse(readFileSync(new URL('lola.json',SOURCE),'utf8')),data:readFileSync(new URL('lola.u16',SOURCE))}
  : readLolaTiff(readFileSync(demPath));
const heights=new Uint16Array(dem.data.buffer,dem.data.byteOffset,dem.data.length/2);
writeFileSync(new URL('lroc.jpg',SOURCE),readFileSync(moonPath));
writeFileSync(new URL('lola.u16',SOURCE),dem.data);
const demMeta={width:dem.width as number,height:dem.height as number,channels:1,metresPerUnit:.5,offsetMetres:-10000};
writeFileSync(new URL('lola.json',SOURCE),JSON.stringify(demMeta,null,2)+'\n');
const doc=new Document(),buffer=doc.createBuffer(),scene=doc.createScene('sun-earth-moon');
doc.createExtension(EXTTextureWebP).setRequired(true);
// Lossless mesh compression: preserve the measured lunar relief and smooth normals.
doc.createExtension(EXTMeshoptCompression).setRequired(true).setEncoderOptions({method:EXTMeshoptCompression.EncoderMethod.QUANTIZE});
doc.getRoot().getAsset().copyright="Made with Natural Earth (public domain). Moon: NASA's Scientific Visualization Studio, LROC/LOLA, CGI Moon Kit 4720 (public domain). Original Atlas meshes and procedural surfaces: CC0-1.0. See src/content/topics/sun-earth-moon/data/SOURCES.md.";
const counts:Record<string,number>={};
function mesh(name:string,g:BufferGeometry,texture:Uint8Array,emission=0){
  const p=doc.createPrimitive();
  for(const [attr,semantic,size] of [['position','POSITION','VEC3'],['normal','NORMAL','VEC3'],['uv','TEXCOORD_0','VEC2']] as const){
    p.setAttribute(semantic,doc.createAccessor().setType(size).setArray(new Float32Array(g.getAttribute(attr).array)).setBuffer(buffer));
  }
  // Every body carries _EMISSION (0 = lit by the orbit light), as in solar-system: the shared part
  // shader reads it, and a missing attribute reads a stale generic value left by other draws.
  p.setAttribute('_EMISSION',doc.createAccessor().setType('SCALAR').setArray(new Float32Array(g.getAttribute('position').count).fill(emission)).setBuffer(buffer));
  p.setIndices(doc.createAccessor().setType('SCALAR').setArray(new Uint32Array(g.index!.array)).setBuffer(buffer));
  const tex=doc.createTexture(name+'-albedo').setMimeType('image/webp').setImage(texture);
  p.setMaterial(doc.createMaterial(name).setBaseColorTexture(tex).setRoughnessFactor(1).setMetallicFactor(0).setExtras({atlasSurface:true}));
  scene.addChild(doc.createNode(name).setMesh(doc.createMesh(name).addPrimitive(p)).setExtras({closed:true}));
  counts[name]=g.index!.count/3;
  g.dispose();
}
// Embedded albedo maps keep the real coastal and crater boundaries
// sharp without spending the triangle budget on surface-colour tessellation.
const eg=globe(SINGAPORE.lon,128,64);
mesh('earth-body',eg,earthTexture);
const mg=globe(0,256,128,(lat,lon)=>1+(sampleMap(heights,demMeta.width,demMeta.height,demMeta.channels,lat,lon)*.5-10000)/1737400);
const moonTexture=await sharp(readFileSync(new URL('lroc.jpg',SOURCE))).webp({quality:88,effort:6}).toBuffer();
mesh('moon-body',mg,moonTexture);
const sw=1024,sh=512,sun=Buffer.alloc(sw*sh*3);
for(let y=0;y<sh;y++)for(let x=0;x<sw;x++){
  const a=(.5-y/sh)*Math.PI,b=x/sw*Math.PI*2,sx=Math.cos(a)*Math.cos(b),sy=Math.sin(a),sz=Math.cos(a)*Math.sin(b);
  const gran=fbm(sx*110,sy*110,sz*110),large=fbm(sx*12,sy*12,sz*12);
  const v=.86+gran*.10+large*.04,i=(y*sw+x)*3;
  // Match the accepted solar-system photosphere's warm paper-readable gold.
  sun[i]=Math.round(255*v);sun[i+1]=Math.round(183*v);sun[i+2]=Math.round(79*v);
}
const sunTexture=await sharp(sun,{raw:{width:sw,height:sh,channels:3}}).webp({quality:85,effort:6}).toBuffer();
const sg=globe(0,128,64);mesh('sun-body',sg,sunTexture,1);
await MeshoptEncoder.ready;
await doc.transform(weld(),dedup(),prune());
const bytes=await new NodeIO().registerExtensions([EXTTextureWebP,EXTMeshoptCompression]).registerDependencies({'meshopt.encoder':MeshoptEncoder}).writeBinary(doc);
if(bytes.length>1_500_000)throw new Error(`Surface GLB exceeds 1.5 MB: ${bytes.length}`);
writeFileSync(local('public/models/sun-earth-moon.glb'),bytes);
const sha=(path:URL)=>createHash('sha256').update(readFileSync(path)).digest('hex');
writeFileSync(new URL('build-report.json',OUT),JSON.stringify({counts,total:Object.values(counts).reduce((a,b)=>a+b,0),bytes:bytes.length,textures:{earth:{width,height,bytes:earthTexture.length,quality:88},moon:{width:2048,height:1024,bytes:moonTexture.length,quality:88},sun:{width:sw,height:sh,bytes:sunTexture.length,quality:85}},compression:'WebP + lossless meshopt',meridians:{earth:SINGAPORE.lon,moon:0},lrocSha256:sha(moonPath),lolaSnapshotSha256:sha(new URL('lola.u16',SOURCE)),landSha256:sha(local('node_modules/world-atlas/land-110m.json')),dem:demMeta},null,2)+'\n');
process.stdout.write(JSON.stringify({counts,total:Object.values(counts).reduce((a,b)=>a+b,0),bytes:bytes.length})+'\n');
