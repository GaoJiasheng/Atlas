/** No browser: actual engine part geometry + sampled studio rig/ACES. */
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';
import { partsFile } from '../../../src/engines/space-scene/schema';
import { renderParts, measureParts, type V3 } from '../kits/rebuild-studio';
const round=process.argv[2]??'round1';
const root=path.resolve('scripts/geo/materials/evidence');fs.mkdirSync(root,{recursive:true});
const file=partsFile.parse(JSON.parse(fs.readFileSync(round==='baseline'?`${root}/baseline-parts.json`:'src/content/topics/materials/data/parts.json','utf8')));
const clamp=file.parts.filter(p=>['bend-clamp','bend-wood'].includes(p.id));
const clampPart=clamp.find(p=>p.id==='bend-clamp')!;
const isolatedClamp=[{...clampPart,extra:clampPart.extra!.slice(0,9)}];
const cabinet=file.parts.filter(p=>['wall-cabinet','cabinet-hinges','saucepan','bowl','food-box','box-seal','tumbler'].includes(p.id));
const cam=(position:V3,target:V3,fov=34)=>({position,target,fov});
const shots=[
 {name:'clamp-front',parts:isolatedClamp,camera:cam([.264,.106,.073],[-.536,.106,.073],15),ref:'g-clamp.jpg'},
 {name:'clamp-three-quarter',parts:clamp,camera:cam([-.17,.31,.38],[-.49,.105,.05]),ref:'clamp-bench.jpg'},
 {name:'clamp-profile',parts:clamp,camera:cam([-.23,.165,.43],[-.54,.12,.05]),ref:'clamp-bench.jpg'},
 {name:'clamp-detail',parts:clamp,camera:cam([-.35,.158,.190],[-.536,.119,.061],30),ref:'g-clamps-use.jpg'},
 {name:'cabinet-front',parts:cabinet,camera:cam([-1.65,.82,2],[-1.65,.82,-.05]),ref:'upper-cupboards.jpg'},
 {name:'cabinet-three-quarter',parts:cabinet,camera:cam([-2.55,1.05,1.55],[-1.62,.82,-.05]),ref:'upper-cupboards.jpg'},
 {name:'cabinet-profile',parts:cabinet,camera:cam([-3.5,.95,.45],[-1.62,.82,-.05]),ref:'upper-cupboards.jpg'},
 {name:'cabinet-detail',parts:cabinet,camera:cam([-1.88,.72,.55],[-1.41,.63,-.015],34),ref:'upper-cupboards.jpg'},
];
for(const shot of shots){
 const out=`${root}/${round}-${shot.name}.png`;
 await renderParts(shot.parts,{out,camera:shot.camera,width:640,height:640});
 const source=path.resolve('scripts/geo/materials/refs',shot.ref);
 const crop=shot.name==='cabinet-detail'?{left:405,top:570,width:150,height:165}:shot.name.startsWith('cabinet-')?{left:140,top:100,width:430,height:640}:shot.name==='clamp-detail'?{left:65,top:0,width:420,height:650}:null;
 let refImage=sharp(source);if(crop)refImage=refImage.extract(crop);
 const ref=await refImage.resize(640,640,{fit:'contain',background:'#e9e4d8'}).toBuffer();
 const title=`${round} | ${shot.name} | Engine studio / ACES CPU | model left; real reference right`;
 const label=Buffer.from(`<svg width="1280" height="70"><rect width="1280" height="70" fill="#e9e4d8"/><text x="20" y="26" font-family="sans-serif" font-size="17">${title}</text><text x="20" y="51" font-family="sans-serif" font-size="14">Reference: ${shot.ref}; Commons authors/URLs/licences in REBUILD-3D.md. Reference angle is approximate; clamp-front isolates the authored clamp hardware.</text></svg>`);
 await sharp({create:{width:1280,height:710,channels:3,background:'#e9e4d8'}}).composite([{input:out,left:0,top:70},{input:ref,left:640,top:70},{input:label,left:0,top:0}]).png().toFile(`${root}/${round}-${shot.name}-comparison.png`);
}
for(const theme of ['paper','cinema'] as const)await renderParts(clamp,{out:`${root}/${round}-clamp-${theme}.png`,camera:shots[1]!.camera,theme,width:900,height:700});
fs.writeFileSync(`${root}/${round}-counts.json`,JSON.stringify(measureParts(file.parts),null,2));
// Whole-model sweep preserves the engine's default sample choices; variants
// stay mutually exclusive rather than being overlaid as false solid blocks.
const defaults=file.parts.filter(p=>{
 for(const prefix of ['bridge-','bend-','float-','square-','sheet-']) {
  const choices=['wood','wood-big','metal','ceramic','rubber','glass','plastic','fabric','bottle','glass-snapped','ceramic-snapped'];
  if(p.id.startsWith(prefix)&&choices.includes(p.id.slice(prefix.length)))return p.id===prefix+(prefix==='square-'||prefix==='sheet-'?'plastic':'wood');
 }
 return p.id!=='wet-patch'&&p.id!=='bridge-masses';
});
for(const theme of ['paper','cinema'] as const) {
 await renderParts(defaults.filter(p=>!p.group?.startsWith('corner-')&&!['counter','corner-wall'].includes(p.id)),{out:`${root}/${round}-bench-${theme}.png`,camera:{position:[.45,.80,2.15],target:[-.06,.06,.02],fov:52},theme,width:1400,height:900});
 await renderParts(defaults.filter(p=>p.group?.startsWith('corner-')||['counter','corner-wall'].includes(p.id)),{out:`${root}/${round}-kitchen-${theme}.png`,camera:{position:[-3.15,1.0,2.8],target:[-1.95,.38,-.05],fov:39},theme,width:1000,height:1100});
}
