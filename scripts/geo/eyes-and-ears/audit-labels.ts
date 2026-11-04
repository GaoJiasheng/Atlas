/** Offline label geometry, using the shipped anchors and the real pure camera /
 * leader functions. HUD rectangles are explicit conservative fixtures, NOT DOM
 * measurements. No browser, PBR or font-layout certification is implied.
 * pnpm tsx scripts/geo/eyes-and-ears/audit-labels.ts [topic-or-baseline-dir] [out-dir]
 */
import { mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { NodeIO } from '@gltf-transform/core';
import { PerspectiveCamera, Vector3 } from 'three';
import { parse } from 'yaml';
import { partsFile, type SpaceChapterState } from '../../../src/engines/space-scene/schema';
import type { OrbitCamera } from '../../../src/engines/core/types';
import { measureFreeStage } from '../../../src/engines/core/hud-room';
import { partBounds } from '../../../src/engines/space-scene/lib/parts';
import { anchorPoint } from '../../../src/engines/space-scene/stages/model3d/shapes';
import { fitCameraToAspect } from '../../../src/engines/space-scene/lib/camera';
import { fitCameraToHud, type FrameBox, type FrameRect } from '../../../src/engines/space-scene/lib/hud-framing';
import { layoutLeaders } from '../../../src/engines/space-scene/lib/leader-layout';
import { insetRect } from '../../../src/engines/space-scene/lib/insets';
import { resolvePartDisplay } from '../../../src/engines/space-scene/lib/visibility';
import { evaluateSim } from '../../../src/engines/space-scene/lib/sim';
import { resolveSimValues } from '../../../src/engines/space-scene/lib/sim/controls';
import { simEffects } from '../../../src/engines/space-scene/lib/sim/bind';

const root=resolve(import.meta.dirname,'../../..');
export const topicDir=resolve(root,'src/content/topics/eyes-and-ears');
type V3=[number,number,number];
export async function loadLabelStudy(dir=topicDir) {
  const baseline=resolve(dir)!==topicDir;
  const file=partsFile.parse(JSON.parse(readFileSync(resolve(dir,baseline?'parts.json':'data/parts.json'),'utf8')));
  const doc=await new NodeIO().read(baseline?resolve(dir,'eyes-and-ears.glb'):resolve(root,'public',file.model!.slice(1)));
  const geometry=new Map<string,{center:V3;half:V3;point:V3}>();
  for(const p of file.parts) {
    let b=partBounds(p),point:V3|undefined;
    if(p.mesh) {
      const node=doc.getRoot().listNodes().find(n=>n.getName()===p.mesh)!;
      const a=node.getMesh()!.listPrimitives()[0]!.getAttribute('POSITION')!;
      const min:V3=[Infinity,Infinity,Infinity],max:V3=[-Infinity,-Infinity,-Infinity];
      for(let i=0;i<a.getCount();i++) {const v:number[]=[];a.getElement(i,v);for(let k=0;k<3;k++){min[k]=Math.min(min[k]!,v[k]!);max[k]=Math.max(max[k]!,v[k]!);}}
      b={min,max};point=node.getExtras().labelPoint as V3|undefined;
    } else if(p.primitive) point=anchorPoint(p).map((v,k)=>v+p.primitive!.at[k]!) as V3;
    if(!b) continue;
    const center=b.min.map((v,k)=>(v+b!.max[k]!)/2) as V3;
    geometry.set(p.id,{center,half:b.min.map((v,k)=>(b!.max[k]!-v)/2) as V3,point:point??center});
  }
  const chapters=readdirSync(resolve(dir,'chapters')).filter(n=>n.endsWith('.mdx')).sort().map(n=> {
    const c=parse(readFileSync(resolve(dir,'chapters',n),'utf8').split(/^---$/m)[1]!);
    return {id:c.id as string,state:c.state as SpaceChapterState};
  });
  return {file,geometry,chapters};
}
export type LabelStudy=Awaited<ReturnType<typeof loadLabelStudy>>;

/** Docked reader stays open. Insets below the heading rows use the wide lower
 * stage. Fixture bounds include the 44px tabs and a 60px chapter-axis reserve. */
export function viewportFrame(w:number,h:number,presentation=false) {
  const width=presentation?w:w-400,height=presentation?h:h-(w<1180?98:57);
  const collapsed=w<1400;
  const panels:FrameRect[]=presentation?[
    {x0:16,y0:12,x1:300,y1:100},
    {x0:(w-600)/2,y0:h-160,x1:(w+600)/2,y1:h-12},
  ]:[
    {x0:22,y0:16,x1:collapsed?66:262,y1:collapsed?220:350},
    {x0:width-300,y0:16,x1:width-44,y1:160},
    {x0:width-44,y0:16,x1:width,y1:220},
    {x0:0,y0:height-60,x1:width,y1:height},
  ];
  const f=measureFreeStage(width,height,panels);
  const rect={x0:f.x0+12,y0:f.y0+12,x1:f.x1-12,y1:f.y1-12};
  let left=14,right=width-14,bottom=height-14;
  for(const p of panels) if(p.y0>height*.45&&p.x0<width/2&&p.x1>width/2) bottom=Math.min(bottom,p.y0-12);
  for(const p of panels) if(p.y0<bottom&&p.y1>14) {
    if(p.x1<width/2)left=Math.max(left,p.x1+18);
    else if(p.x0>width/2)right=Math.min(right,p.x0-18);
  }
  return {width,height,rect,panels,frame:{width,height,left,right,top:14,bottom,obstacles:panels}};
}

export function projectBeat(study:LabelStudy,chapter:string,beat:number,w:number,h:number,presentation=false,phase=0) {
  const {file}=study,c=study.chapters.find(c=>c.id===chapter)!,b=c.state.beats![beat-1]!;
  const sim=file.sim!,values=resolveSimValues(sim,{...c.state.sim?.set,...b.sim?.set});
  const fx=simEffects(sim,values,evaluateSim(sim,values));
  const state={...c.state,...b,view:b.view??c.state.view??'assembled',layers:b.layers??c.state.layers??[],part:b.part??c.state.part??null,hidden:[...(b.hide??c.state.hide??[]),...fx.hidden]};
  const geometry=new Map(study.geometry);
  // Sample the authored extrema of the local membrane / bundle movement. The
  // chapter uses amplitude 1; this is a geometric envelope check, not a clock.
  if(state.run&&phase!==0)for(const a of file.animations.filter(a=>['basilar-strip','hair-patch'].includes(a.target))) {
    if(a.kind!=='sequence')continue;
    const k=a.keys.find(k=>k.t===phase),g=geometry.get(a.target);
    if(!k||!g||!('offset'in k))continue;
    const pivot=new Vector3(...(a.pivot??g.center)),angle=(k.rotation?.[2]??0)*Math.PI/180;
    const move=(p:V3)=>new Vector3(...p).sub(pivot).applyAxisAngle(new Vector3(0,0,1),angle).add(pivot).add(new Vector3(...(k.offset??[0,0,0]))).toArray() as V3;
    const corners=Array.from({length:8},(_,i)=>move(g.center.map((v,j)=>v+(i&1<<j?1:-1)*g.half[j]!) as V3));
    const min=[0,1,2].map(j=>Math.min(...corners.map(p=>p[j]!))),max=[0,1,2].map(j=>Math.max(...corners.map(p=>p[j]!)));
    geometry.set(a.target,{point:move(g.point),center:min.map((v,j)=>(v+max[j]!)/2) as V3,half:min.map((v,j)=>(max[j]!-v)/2) as V3});
  }
  const visible=file.parts.filter(p=>resolvePartDisplay(p,state,file.parts).visible);
  const ids=new Set(visible.map(p=>p.id));
  const cameraValue=b.camera??c.state.camera!;
  const authored=(typeof cameraValue==='string'?file.presets!.find(p=>p.id===cameraValue)!.camera:cameraValue) as OrbitCamera;
  const layout=viewportFrame(w,h,presentation),{width,height,rect,panels,frame}=layout;
  const boxes:FrameBox[]=file.views.hudFrame!.parts.filter(id=>ids.has(id)).map(id=>geometry.get(id)!);
  const camera=fitCameraToHud(fitCameraToAspect(authored,width/height),boxes,width,height,rect,{panels});
  const cam=new PerspectiveCamera(camera.fov,width/height,.001,1000);
  cam.position.fromArray(camera.position);cam.lookAt(...camera.target);cam.updateMatrixWorld();
  const project=(v:V3)=>{const p=new Vector3(...v).project(cam);return {x:(p.x+1)*width/2,y:(1-p.y)*height/2,onScreen:Math.abs(p.x)<1.02&&Math.abs(p.y)<1.02&&Math.abs(p.z)<1};};
  const anchors=visible.map(p=>{
    const g=geometry.get(p.id)!;
    const points=Array.from({length:8},(_,i)=>project(g.center.map((v,k)=>v+(i&1<<k?1:-1)*g.half[k]!) as V3));
    return {id:p.id,...project(g.point),shown:true,x0:Math.min(...points.map(p=>p.x)),x1:Math.max(...points.map(p=>p.x)),y0:Math.min(...points.map(p=>p.y)),y1:Math.max(...points.map(p=>p.y))};
  });
  const labels=[...(b.labels??c.state.labels??[])];
  if(state.part&&!labels.includes(state.part))labels.unshift(state.part);
  // The real component keeps only the selected label in a narrow HUD band.
  const active=anchors.filter(a=>labels.includes(a.id)&&a.onScreen&&!panels.some(p=>a.x>=p.x0&&a.x<=p.x1&&a.y>=p.y0&&a.y<=p.y1))
    .filter(a=>presentation||frame.right-frame.left>=480||a.id===state.part)
    .sort((a,b)=>a.id===state.part?-1:b.id===state.part?1:labels.indexOf(a.id)-labels.indexOf(b.id));
  // Conservative text estimates at the .8 type floor, including the number and
  // triangle. Final browser font measurements remain the acceptance boundary.
  const labelWidth=(id:string)=>{
    const p=file.parts.find(p=>p.id===id)!,name=p.short??p.name,k=presentation?1.2:1;
    return Math.ceil(Math.max((name.en.length+3)*9.04*.65,name.zh.length*9.42,p.summary.en.slice(0,34).length*8.48*.55,p.summary.zh.slice(0,18).length*8.48*1.04)*k+8);
  };
  const places=layoutLeaders(active.map(a=>({id:a.id,ax:a.x,ay:a.y,w:labelWidth(a.id),h:presentation?42:36,lead:6,bounds:a,prev:null})),frame);
  const labelled=anchors.filter(a=>labels.includes(a.id));
  const pairs=labelled.flatMap((a,i)=>labelled.slice(i+1).map(b=>({ids:[a.id,b.id],distance:Math.hypot(a.x-b.x,a.y-b.y),dy:Math.abs(a.y-b.y)})));
  const inset=insetRect(file.views.insets![0]!.parts.map(id=>anchors.find(a=>a.id===id)),width,height);
  const insetTitle=inset?{x0:inset.x+6,y0:inset.y-15,x1:inset.x+246,y1:inset.y-3}:null;
  return {chapter,beat,phase,viewport:[w,h],presentation,authored,camera,...layout,part:state.part,labels,visible:visible.map(p=>p.id),anchors:labelled,allAnchors:anchors,pairs,places,inset,insetTitle};
}

export async function auditLabels(dir=topicDir) {
  const study=await loadLabelStudy(dir);
  return [false,true].flatMap(p=>[[1024,768],[1366,1024],[1440,900]].flatMap(([w,h])=>study.chapters.flatMap(c=>c.state.beats!.map((_,i)=>projectBeat(study,c.id,i+1,w!,h!,p)))));
}
const escapeXml=(s:string)=>s.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('"','&quot;');
export function previewSvg(b:ReturnType<typeof projectBeat>,study:LabelStudy,locale='en') {
  const inset=b.inset;
  const frame=inset?`<rect x="${inset.x}" y="${inset.y}" width="${inset.w}" height="${inset.h}" fill="none" stroke="#857d70" stroke-dasharray="4 3"/><text x="${inset.x+6}" y="${inset.y-5}" font-family="monospace" font-size="10.5" letter-spacing=".63">${escapeXml(study.file.views.insets![0]!.label[locale as 'en'|'zh'].toUpperCase())}</text>`:'';
  const labels=b.places.map(p=>{
    const part=study.file.parts.find(a=>a.id===p.id)!,a=b.anchors.find(a=>a.id===p.id)!;
    const x=p.side==='L'?p.x1:p.x0,align=p.side==='L'?'end':'start';
    return `<path d="M${p.sx} ${p.sy}H${p.ex}L${a.x} ${a.y}" fill="none" stroke="#555047" stroke-width=".7"/><circle cx="${a.x}" cy="${a.y}" r="2.6" fill="#e9e4d8" stroke="#555047"/><rect x="${p.x0}" y="${p.y0}" width="${p.x1-p.x0}" height="${p.y1-p.y0}" fill="#e9e4d8" fill-opacity=".8"/><text x="${x}" y="${p.y0+8}" text-anchor="${align}" font-size="10" fill="${p.id===b.part?'#cc6328':'#2a2824'}">${escapeXml((part.short??part.name).en.toUpperCase())}<tspan x="${x}" dy="13">${escapeXml((part.short??part.name).zh)}</tspan><tspan x="${x}" dy="12" font-size="9">${escapeXml(part.summary[locale as 'en'|'zh'].slice(0,locale==='zh'?18:34))}</tspan></text>`;
  }).join('');
  const panels=b.panels.map((p,i)=>`<rect x="${p.x0}" y="${p.y0}" width="${p.x1-p.x0}" height="${p.y1-p.y0}" fill="#e9e4d8" fill-opacity=".96" stroke="#b6aea0"/><text x="${p.x0+6}" y="${p.y0+14}" font-size="10">${b.presentation?(i?'CAPTION RESERVE':'TITLE RESERVE'):'HUD RESERVE'}</text>`).join('');
  return `<svg width="${b.width}" height="${b.height}" font-family="Arial, PingFang SC, sans-serif" fill="#555047">${panels}${frame}${labels}<text x="14" y="${b.height-18}" font-size="10">CPU STUDY · ${b.chapter}.${b.beat} · ${b.viewport.join('×')} · ${locale} · ${b.presentation?'PRESENT':'HUD'} · FIXTURE PANELS / FONTS</text></svg>`;
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)) {
  const out=resolve(process.argv[3]??'/tmp/atlas-eyes-and-ears-labels/current');mkdirSync(out,{recursive:true});
  const result=await auditLabels(process.argv[2]);
  writeFileSync(resolve(out,'label-projections.json'),JSON.stringify({kind:'Offline geometry; conservative HUD / font fixtures, not browser screenshots',beats:result},null,2));
  const study=await loadLabelStudy(process.argv[2]);
  for(const presentation of [false,true])for(const [w,h]of [[1024,768],[1366,1024],[1440,900]])for(const locale of ['en','zh']) {
    const selected=result.filter(b=>b.viewport[0]===w&&b.presentation===presentation&&(['vibration-to-signal'].includes(b.chapter)||b.chapter==='three-moving-bones'&&[3,4].includes(b.beat)||b.chapter==='care-and-protection'&&b.beat===3));
    const views=selected.map(b=>({name:`${b.chapter}-${b.beat}`,camera:b.camera,ids:b.visible,svg:previewSvg(b,study,locale)}));
    writeFileSync(resolve(out,`scenes-${w}-${presentation?'present':'hud'}-${locale}.json`),JSON.stringify({width:selected[0]!.width,height:selected[0]!.height,views},null,2));
  }
  const scenes=result.filter(b=>b.viewport[0]===1024&&(['vibration-to-signal','three-moving-bones'].includes(b.chapter)||b.chapter==='care-and-protection'&&b.beat===3));
  for(const b of scenes) console.log(`${b.presentation?'PRESENT':'HUD'} ${b.chapter}.${b.beat}: ${b.pairs.map(p=>`${p.ids.join('/')}=${p.distance.toFixed(1)}px Δy=${p.dy.toFixed(1)}`).join('; ')}; placed ${b.places.map(p=>p.id).join(',')}`);
}
