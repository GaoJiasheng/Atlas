/** Compact reproducible audit and contact sheets from inspect-geometry.ts. */
import fs from 'node:fs';
import crypto from 'node:crypto';
import sharp from 'sharp';
const round=process.argv[2]??'round2-final',folder='/private/tmp/coral-reef-model-qa';
const report=JSON.parse(fs.readFileSync(`${folder}/${round}-metrics.json`,'utf8'));
const cameras=Object.fromEntries(Object.entries(report.cameras).map(([id,value])=>{
  const c=value as {camera:unknown;targets:Record<string,unknown>;unexpectedVisibleParts:string[]};
  const labels=report.fitted[id]?.subjects??[];
  return [id,{camera:c.camera,subjects:Object.fromEntries(labels.map((p:string)=>[p,c.targets[p]])),unexpectedVisibleParts:c.unexpectedVisibleParts}];
}));
const summary={date:'2026-11-03',round:'Polish round 2',kind:report.kind,beforeTriangles:348182,totalTriangles:report.totalTriangles,totalPieces:report.totalPieces,groupTriangles:report.groupTriangles,counts:report.counts,cameras,modelSha256:crypto.createHash('sha256').update(fs.readFileSync('public/models/coral-reef.glb')).digest('hex'),notes:[...report.notes,'HUD checks use shared fitter and CPU layout fixtures, not measured DOM or GPU screenshots.','47 states (8 chapter bases + 39 beats) × desktop, landscape tablet and presentation fixtures.','Presets and isolated details are also rendered.']};
fs.writeFileSync('src/content/topics/coral-reef/authoring/geometry-review-round2.json',JSON.stringify(summary,null,2)+'\n');
for(const fixture of ['hud','tablet','present']) for(let ch=0;ch<8;ch++){
  const prefix=`${round}-ch${String(ch).padStart(2,'0')}-b`;
  const files=fs.readdirSync(folder).filter(f=>f.startsWith(prefix)&&f.endsWith(`-${fixture}.png`)).sort();
  const w=450,h=410,columns=3,rows=Math.ceil(files.length/columns),panels=[];
  for(const [i,file] of files.entries())panels.push({input:await sharp(`${folder}/${file}`).resize(w,h,{fit:'contain',background:'#e9e4d8'}).png().toBuffer(),left:(i%columns)*w,top:Math.floor(i/columns)*h});
  await sharp({create:{width:columns*w,height:rows*h,channels:4,background:'#e9e4d8'}}).composite(panels).png().toFile(`${folder}/${round}-contact-ch${String(ch).padStart(2,'0')}-${fixture}.png`);
}
console.log(JSON.stringify({triangles:report.totalTriangles,groups:report.groupTriangles,states:Object.keys(report.fitted).length,report:'src/content/topics/coral-reef/authoring/geometry-review-round2.json'}));
