/** Export and offline proofs of two local ORIGINAL-pixel edits. No browser. */
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {mkdirSync, readFileSync, writeFileSync} from 'node:fs';
import sharp from 'sharp';

const root = '/private/tmp/atlas-ia-round4';
const dir = `${root}/final`;
const entries = [
  {id:'warring-states-tiger-tally', original:'tiger-tally', slug:'warring-states', chapter:'08-changping-handan',
    quality:92, alphaQuality:100, editedPixels:18066, detail:[470,275,252,332],
    alt:{en:'Graphite drawing of two crouching-tiger tally halves lying side by side, facing outward, with blank bands on their inner cut faces.',zh:'石墨画：两半伏虎形青铜兵符并排放置，虎头朝外，内侧切面上的铭文带留白。'},
    caption:{en:'Two bronze tiger-tally halves with blank inscription bands.',zh:'两半青铜虎符，铭文带留白。'},
    checks:[
      'Both inscription bands are blank: inspected every former glyph location at 2× native detail in paper and cinema; no invented writing remains. Original animal ornament is retained.',
      'The two original animals, outlines, faces, paws, relief ornament, peg/notch edges, spacing and framing are retained; no replacement animals or outlines were drawn.',
      'Lossless master changes exactly 18,066 pixels inside the two narrow inscription masks; every pixel outside them and all original alpha values are identical.',
      'Inspected full images at 420px and 840px and local native-2× details in paper and CSS-equivalent cinema; the blank bands and original graphite remain legible. No physical illumination state is encoded; inversion is appropriate.',
      '1200×900 transparent WebP within 120,000 bytes; export preserves alpha exactly. Compared export with the lossless master at 420px, 840px and native-2× detail: no visible compression loss.',
      'Both chapter occurrences have matching EN/ZH alt text and captions describing the blank inscription bands, without a picture-defence sentence.',
    ]},
  {id:'coral-reef-polyp', original:'polyp', slug:'coral-reef', chapter:'01-coral-and-partners',
    quality:93, alphaQuality:80, editedPixels:1857, detail:[545,380,115,140],
    alt:{en:'Oblique graphite view of a hard-coral polyp on its skeletal cup, with a small oval mouth and surrounding tentacles.',zh:'硬珊瑚虫位于骨骼杯上的石墨斜视图，可见小椭圆形口及周围的触手。'},
    caption:{en:'A polyp viewed obliquely from above: tentacles surround its small oval mouth, and the skeletal cup supports it below.',zh:'从斜上方观察珊瑚虫：触手围绕小椭圆形口，下方的骨骼杯支撑着虫体。'},
    checks:[
      'The original vertical cat-eye slit is replaced by one small plain oval opening; inspected at native-2× in both themes: no pupil, iris, secondary slit or eye highlight.',
      'All original tentacles, oral-disc folds outside the mouth patch, cup, silhouette, perspective and framing are retained. The view is oblique from above; no cutaway is claimed.',
      'Lossless master changes exactly 1,857 pixels within the central mouth mask; every pixel outside it and all original alpha values are identical.',
      'Inspected full images at 420px and 840px and local native-2× details in paper and CSS-equivalent cinema. Original framing is preserved; the intentionally small 30×20-native-pixel mouth is not enlarged. Inversion changes graphite shading, not a physical light state.',
      '1200×900 transparent WebP within 120,000 bytes; alpha quantization differs by at most 2/255. Compared export with the lossless master at 420px, 840px and native-2× detail: no visible compression loss.',
      'Both chapter occurrences have EN/ZH alt text and captions describing an oblique view of a polyp on its cup, with a small oval mouth; the false cutaway wording is removed.',
    ]},
] as const;

const themes = ['paper','cinema'] as const;
type Theme = typeof themes[number];
const bg = {paper:[233,228,216], cinema:[31,33,36]};
async function pixels(input:Buffer|string) {
  return sharp(input).ensureAlpha().raw().toBuffer({resolveWithObject:true});
}
async function proof(input:Buffer|string, theme:Theme, width?:number, detail?:readonly number[]) {
  let pipeline=sharp(input);
  if(detail) pipeline=pipeline.extract({left:detail[0]!,top:detail[1]!,width:detail[2]!,height:detail[3]!});
  const {data,info}=await pipeline.ensureAlpha().raw().toBuffer({resolveWithObject:true});
  const out=Buffer.alloc(info.width*info.height*3);
  for(let p=0,q=0;p<data.length;p+=4,q+=3) {
    const alpha=data[p+3]!/255*(theme==='cinema'?.86:1);
    // Original neutral graphite: invert + hue-rotate(180deg) + contrast(.94).
    // Apply the actual hue-rotation matrix as well, retaining 1-level codec tint.
    const rgb=[data[p]!,data[p+1]!,data[p+2]!].map(v=>1-v/255);
    const hue=[[-.574,1.43,.144],[.426,.43,.144],[.426,1.43,-.856]];
    for(let c=0;c<3;c++) {
      const base=bg[theme][c]!/255;
      const h=Math.max(0,Math.min(1,hue[c]!.reduce((s,v,k)=>s+v*rgb[k]!,0)));
      const ink=data[p+c]!/255, filtered=(h-.5)*.94+.5;
      const blend=theme==='cinema'?1-(1-base)*(1-filtered):base*ink;
      out[q+c]=Math.round(255*(base*(1-alpha)+blend*alpha));
    }
  }
  let result=sharp(out,{raw:{width:info.width,height:info.height,channels:3}});
  if(width)result=result.resize(width);
  return result.png().toBuffer();
}
const label=(s:string,width:number,theme:Theme)=>Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="30"><text x="8" y="21" font-family="sans-serif" font-size="14" fill="${theme==='paper'?'#36332d':'#e9e4d8'}">${s}</text></svg>`);
const composites:{input:Buffer;left:number;top:number}[]=[], records=[];
mkdirSync(dir,{recursive:true});
for(const [row,e] of entries.entries()) {
  const file=`public/illustrations/figures/${e.id}.webp`;
  const original=`scripts/figures/materials/round4-${e.original}-original.webp`;
  const master=`${root}/${e.id}-master.png`;
  const [a,m,mask]=await Promise.all([pixels(original),pixels(master),pixels(`${root}/${e.id}-mask.png`)]);
  assert.equal(m.info.width,1200); assert.equal(m.info.height,900);
  let changed=0, minX=1200,maxX=0,minY=900,maxY=0;
  for(let p=0;p<m.data.length;p+=4) {
    const diff=!a.data.subarray(p,p+4).equals(m.data.subarray(p,p+4));
    if(diff) {changed++;assert(mask.data[p]!>0,'Edit escaped mask');}
    assert.equal(a.data[p+3],m.data[p+3],'Master alpha changed');
    if(m.data[p+3]!>24) {
      const x=(p/4)%1200,y=Math.floor(p/4/1200);
      minX=Math.min(minX,x);maxX=Math.max(maxX,x);minY=Math.min(minY,y);maxY=Math.max(maxY,y);
    }
  }
  assert.equal(changed,e.editedPixels);
  const occupancy={width:(maxX-minX+1)/1200,height:(maxY-minY+1)/900};
  assert(occupancy.width>=.6);
  const encoded=await sharp(master).webp({quality:e.quality,alphaQuality:e.alphaQuality,effort:6,preset:'drawing'}).toBuffer();
  assert(encoded.length<=120000,`${e.id}: ${encoded.length} bytes`);
  const decoded=await pixels(encoded);
  let maxAlphaError=0;
  for(let p=3;p<decoded.data.length;p+=4)maxAlphaError=Math.max(maxAlphaError,Math.abs(decoded.data[p]!-m.data[p]!));
  assert(maxAlphaError<=(e.alphaQuality===100?0:2));
  const chapter=readFileSync(`src/content/topics/${e.slug}/chapters/${e.chapter}.mdx`,'utf8');
  for(const s of [e.alt.en,e.alt.zh,e.caption.en,e.caption.zh])assert.equal(chapter.split(s).length-1,2);
  writeFileSync(file,encoded);
  const compression=[];
  for(const theme of themes) {
    const left=theme==='paper'?0:420, top=row*345;
    composites.push({input:label(`${e.id} / ${theme}`,420,theme),left,top});
    for(const width of [420,840]) {
      const final=await proof(encoded,theme,width), source=await proof(master,theme,width);
      writeFileSync(`${dir}/${e.id}-${theme}-${width}.png`,final);
      const [f,s]=await Promise.all([pixels(final),pixels(source)]);
      let absolute=0,squared=0;
      for(let p=0;p<f.data.length;p+=4)for(let c=0;c<3;c++) {
        const d=f.data[p+c]!-s.data[p+c]!;absolute+=Math.abs(d);squared+=d*d;
      }
      const count=f.info.width*f.info.height*3;
      const mae=absolute/count, psnr=10*Math.log10(255**2/(squared/count));
      assert(mae<1.6&&psnr>42,`${e.id} export error ${mae}, ${psnr}`);
      compression.push({theme,width,meanAbsoluteChannelError:mae,psnr});
      await sharp({create:{width:width*2,height:width*3/4+30,channels:3,background:theme==='paper'?'#e9e4d8':'#1f2124'}})
        .composite([{input:source,left:0,top:30},{input:final,left:width,top:30},
          {input:label('Lossless retouch master',width,theme),left:0,top:0},
          {input:label('Final WebP',width,theme),left:width,top:0}])
        .png().toFile(`${dir}/${e.id}-${theme}-compression-${width}.png`);
      if(width===420)composites.push({input:final,left,top:top+30});
    }
    const detailWidth=e.detail[2]*2;
    const [sourceDetail,finalDetail]=await Promise.all([proof(master,theme,detailWidth,e.detail),proof(encoded,theme,detailWidth,e.detail)]);
    await sharp({create:{width:detailWidth*2,height:e.detail[3]*2+30,channels:3,background:theme==='paper'?'#e9e4d8':'#1f2124'}})
      .composite([{input:sourceDetail,left:0,top:30},{input:finalDetail,left:detailWidth,top:30},
        {input:label('Master / native 2x',detailWidth,theme),left:0,top:0},
        {input:label('WebP / native 2x',detailWidth,theme),left:detailWidth,top:0}])
      .png().toFile(`${dir}/${e.id}-${theme}-detail-2x.png`);
  }
  records.push({slug:e.slug,kind:'figure',file:`figures/${e.id}.webp`,chapterIdea:e.caption.en,subject:e.alt.en,
    method:'Local original-pixel retouch only; nearby original graphite texture, no AI or outline redraw',checks:e.checks,
    verifiedAt:'2026-11-09',round:4,width:1200,height:900,bytes:encoded.length,
    sha256:createHash('sha256').update(encoded).digest('hex'),
    original:{file:original,sha256:createHash('sha256').update(readFileSync(original)).digest('hex')},
    masterEditedPixels:changed,masterOutsideMaskPixelIdentical:true,masterAlphaIdentical:true,maxExportAlphaError:maxAlphaError,
    occupancy,compression,requiresNoInvert:false,alt:e.alt,caption:e.caption,
    previews:{directory:dir,paper420:`${e.id}-paper-420.png`,cinema420:`${e.id}-cinema-420.png`,paper840:`${e.id}-paper-840.png`,cinema840:`${e.id}-cinema-840.png`,paperNative2x:`${e.id}-paper-detail-2x.png`,cinemaNative2x:`${e.id}-cinema-detail-2x.png`},
  });
}
const dark=await sharp({create:{width:420,height:690,channels:3,background:'#1f2124'}}).png().toBuffer();
await sharp({create:{width:840,height:690,channels:3,background:'#e9e4d8'}})
  .composite([{input:dark,left:420,top:0},...composites]).png().toFile(`${dir}/contact-sheet-420.png`);
writeFileSync('public/illustrations/round4-manifest.jsonl',records.map(r=>JSON.stringify(r)).join('\n')+'\n');
writeFileSync(`${dir}/audit.json`,JSON.stringify(records,null,2)+'\n');
console.log(records.map(r=>`${r.file}: ${r.bytes} bytes; changed ${r.masterEditedPixels} master pixels; max alpha encoding delta ${r.maxExportAlphaError}`).join('\n'));
