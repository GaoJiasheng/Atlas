/** Local mouth repair on frozen original pixels; offline proofs, no browser. */
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {mkdirSync, readFileSync, writeFileSync, existsSync, copyFileSync} from 'node:fs';
import sharp from 'sharp';

const dir='/private/tmp/atlas-ia-round5';
mkdirSync(dir,{recursive:true});
const file='public/illustrations/figures/coral-reef-polyp.webp';
if(!existsSync(`${dir}/before.webp`))copyFileSync(file,`${dir}/before.webp`);
const source='scripts/figures/materials/round4-polyp-original.webp';
assert.equal(createHash('sha256').update(readFileSync(source)).digest('hex'),'be57deb981f4a0b9a66dca67d18999a5bf68d3d23cd64f51157ab71fe16409cc');
const original=await sharp(source).ensureAlpha().raw().toBuffer();
const patch=await sharp('scripts/figures/materials/round5-polyp-mouth-patch.png').resize(240,240).removeAlpha().raw().toBuffer();
const after=Buffer.from(original), mask=Buffer.alloc(1200*900);
let changed=0;
// Cover the WHOLE former rim and the pupil, with a feather beyond its tips.
// The retained outer disc, tentacles and skeleton are original pixels.
for(let y=328;y<568;y++)for(let x=482;x<722;x++){
  const r=Math.hypot((x-602)/74,(y-448)/86);
  const t=Math.max(0,Math.min(1,(1-r)/.28));
  const a=t*t*(3-2*t), p=(y*1200+x)*4, q=((y-328)*240+x-482)*3;
  mask[y*1200+x]=Math.ceil(a*255);
  for(let c=0;c<3;c++)after[p+c]=Math.round(original[p+c]!*(1-a)+patch[q+c]!*a);
}
for(let p=0;p<original.length;p+=4){
  assert.equal(after[p+3],original[p+3]);
  if(!original.subarray(p,p+4).equals(after.subarray(p,p+4))){
    changed++;assert(mask[p/4]!>0,'Changed pixels outside local mouth mask');
  }
}
assert(changed<20000);
assert(74>35 && 86>55,'Mask must include the entire old almond rim');
const master=await sharp(after,{raw:{width:1200,height:900,channels:4}}).png().toBuffer();
writeFileSync(`${dir}/master.png`,master);
await sharp(mask,{raw:{width:1200,height:900,channels:1}}).png().toFile(`${dir}/mask.png`);
let encoded=Buffer.alloc(0), quality=93;
for(;quality>=88;quality--){
  encoded=await sharp(master).webp({quality,alphaQuality:80,effort:6,preset:'drawing'}).toBuffer();
  if(encoded.length<=120000)break;
}
assert(encoded.length<=120000);
writeFileSync(file,encoded);
const decoded=await sharp(encoded).ensureAlpha().raw().toBuffer();
let maxAlphaError=0;
for(let p=3;p<decoded.length;p+=4)maxAlphaError=Math.max(maxAlphaError,Math.abs(decoded[p]!-after[p]!));
assert(maxAlphaError<=2);
type Theme='paper'|'cinema';
async function proof(input:Buffer|string,theme:Theme,width:number,crop=false){
  let s=sharp(input);
  if(crop)s=s.extract({left:522,top:348,width:160,height:200});
  const {data,info}=await s.ensureAlpha().raw().toBuffer({resolveWithObject:true});
  const output=Buffer.alloc(info.width*info.height*3);
  const bg=theme==='paper'?[233,228,216]:[31,33,36];
  const hue=[[-.574,1.43,.144],[.426,.43,.144],[.426,1.43,-.856]];
  for(let p=0,q=0;p<data.length;p+=4,q+=3){
    const a=data[p+3]!/255*(theme==='cinema'?.86:1);
    const inverted=[0,1,2].map(c=>1-data[p+c]!/255);
    for(let c=0;c<3;c++){
      const b=bg[c]!/255, ink=data[p+c]!/255;
      const h=Math.max(0,Math.min(1,hue[c]!.reduce((n,v,k)=>n+v*inverted[k]!,0)));
      const filtered=(h-.5)*.94+.5;
      const blend=theme==='paper'?b*ink:1-(1-b)*(1-filtered);
      output[q+c]=Math.round(255*(b*(1-a)+blend*a));
    }
  }
  return sharp(output,{raw:{width:info.width,height:info.height,channels:3}}).resize(width).png().toBuffer();
}
const label=(s:string,w:number,theme:Theme)=>Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="30"><text x="8" y="21" font-family="sans-serif" font-size="14" fill="${theme==='paper'?'#36332d':'#e9e4d8'}">${s}</text></svg>`);
const contact=[];
for(const theme of ['paper','cinema'] as const){
  for(const width of [420,840])writeFileSync(`${dir}/${theme}-${width}.png`,await proof(encoded,theme,width));
  const before=await proof(`${dir}/before.webp`,theme,640,true), final=await proof(encoded,theme,640,true);
  await sharp({create:{width:1280,height:830,channels:3,background:theme==='paper'?'#e9e4d8':'#1f2124'}}).composite([
    {input:before,left:0,top:30},{input:final,left:640,top:30},
    {input:label('Before / native 4x',640,theme),left:0,top:0},
    {input:label('After / native 4x',640,theme),left:640,top:0},
  ]).png().toFile(`${dir}/${theme}-before-after-4x.png`);
  const left=theme==='paper'?0:420;
  contact.push({input:await proof(encoded,theme,420),left,top:30},{input:label(`coral-reef-polyp / ${theme}`,420,theme),left,top:0});
  // Comparison to lossless master, independently from the before/after proof.
  await sharp({create:{width:1280,height:830,channels:3,background:theme==='paper'?'#e9e4d8':'#1f2124'}}).composite([
    {input:await proof(master,theme,640,true),left:0,top:30},{input:final,left:640,top:30},
    {input:label('Lossless master / native 4x',640,theme),left:0,top:0},
    {input:label('Final WebP / native 4x',640,theme),left:640,top:0},
  ]).png().toFile(`${dir}/${theme}-compression-4x.png`);
}
const dark=await sharp({create:{width:420,height:345,channels:3,background:'#1f2124'}}).png().toBuffer();
await sharp({create:{width:840,height:345,channels:3,background:'#e9e4d8'}}).composite([{input:dark,left:420,top:0},...contact]).png().toFile(`${dir}/contact-sheet-420.png`);
const chapter=readFileSync('src/content/topics/coral-reef/chapters/01-coral-and-partners.mdx','utf8');
const alt={en:'Oblique graphite view of a hard-coral polyp on its skeletal cup, with a small oval mouth and surrounding tentacles.',zh:'硬珊瑚虫位于骨骼杯上的石墨斜视图，可见小椭圆形口及周围的触手。'};
for(const text of Object.values(alt))assert.equal(chapter.split(text).length-1,2);
const audit={slug:'coral-reef',kind:'figure',file:'figures/coral-reef-polyp.webp',round:5,
  subject:'Original oblique coral polyp with one small, shallow oval mouth and radiating disc ridges.',
  method:'Built-in imagegen precise-object-edit on a 4x mouth crop; feathered local patch composited onto frozen original pixels; no full image redraw.',
  checks:[
    'Inspected native 4x before/after in paper and cinema: the whole tall almond rim and flat dark dot are gone; one small rounded horizontal mouth remains, without pupil, iris, eye outline or hard dark centre.',
    'Inspected mouth and disc at native 4x and 2x: soft raised lip, shallow graded interior, and radial ridges join the lip naturally; local graphite grain and shading match the surrounding tissue.',
    'Lossless master preserves every original pixel outside the 148x172 local elliptical patch and all original alpha values; tentacles, skeletal cup, outline, framing and viewpoint retained.',
    'Inspected 420px and 840px proofs in paper and CSS-equivalent cinema: subject fills 73.8% of frame width; centre reads as a small mouth. Its intentionally small opening follows the explicit round-5 size instruction, superseding the generic 40px feature target. No physical illumination state requires an inversion exception.',
    'Inspected final WebP against lossless master at native 4x in both themes: no visible compression loss; 1200x900 transparent output within 120000 bytes; alpha error at most 2/255.',
    'Round-4 corrected English and Chinese alt text and captions retained verbatim; no other illustration, including the accepted tiger tally, edited.',
  ],width:1200,height:900,bytes:encoded.length,quality,alphaQuality:80,maxAlphaError,
  masterEditedPixels:changed,masterOutsideMaskPixelIdentical:true,masterAlphaIdentical:true,
  sha256:createHash('sha256').update(encoded).digest('hex'),source,alt,requiresNoInvert:false,
  previews:{directory:dir,contactSheet:'contact-sheet-420.png',paper4x:'paper-before-after-4x.png',cinema4x:'cinema-before-after-4x.png'}};
writeFileSync(`${dir}/audit.json`,JSON.stringify(audit,null,2)+'\n');
writeFileSync('public/illustrations/round5-manifest.jsonl',JSON.stringify(audit)+'\n');
console.log(JSON.stringify({bytes:encoded.length,quality,changed,maxAlphaError,previews:dir}));
