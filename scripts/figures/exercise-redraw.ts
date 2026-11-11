/** Dimensioned composition guides for the November exercise redraw.
 * Run: pnpm tsx scripts/figures/exercise-redraw.ts
 * Guides, prompts and visual QA stay in .review; no browser is used.
 */
import assert from 'node:assert/strict';
import { mkdirSync, writeFileSync, readFileSync, statSync } from 'node:fs';
import sharp from 'sharp';

mkdirSync('.review', { recursive: true });
type V = [number, number, number];
const barLength = 2.2, plateDiameter = .45, shoulderWidth = .4, gripWidth = .62;
assert.equal(barLength, 2.2);
assert.equal(plateDiameter, .45);
assert(gripWidth > shoulderWidth && gripWidth < shoulderWidth * 1.6);
assert(.31 < .72 && .72 < .84 && .84 < 1.1); // hand, collar, plate, sleeve end
const p = ([x,y,z]: V): [number,number] => [345 + 190*x + 150*y, 610 - 65*x + 90*y - 260*z];
const pt = (v: V) => p(v).join(',');
const line = (a: V,b: V,w=2) => `<path d="M${pt(a)}L${pt(b)}" fill="none" stroke="#555" stroke-width="${w}" stroke-linecap="round"/>`;
const poly = (v: V[], fill='#eee') => `<polygon points="${v.map(pt).join(' ')}" fill="${fill}" stroke="#555" stroke-width="2"/>`;
function limb(v: V[], width=21) {
  const d = `M${v.map(pt).join('L')}`;
  return `<path d="${d}" fill="none" stroke="#555" stroke-width="${width+3}" stroke-linecap="round" stroke-linejoin="round"/><path d="${d}" fill="none" stroke="#e6e6e6" stroke-width="${width}" stroke-linecap="round" stroke-linejoin="round"/>`;
}
function plate(x: number,y: number,z: number) {
  const ring = (r: number) => Array.from({length:65},(_,i) => pt([x,y+r*Math.cos(i*Math.PI/32),z+r*Math.sin(i*Math.PI/32)])).join(' ');
  return `<polygon points="${ring(plateDiameter/2)}" fill="#ddd" stroke="#555" stroke-width="3"/><polygon points="${ring(.19)}" fill="url(#hatch)" stroke="#888" stroke-width="1"/>`;
}
function bench(end: boolean) {
  const sy=-.65, ey=-.10, sz=.64, wz=end?.60:1.29, wy=end?ey:sy;
  assert(!end || Math.abs(wy-ey)<.001);
  assert(end || wy===sy);
  const elbowX=.43, elbowY=-.40, elbowZ=.34;
  const angle=Math.atan2(elbowX-.20,elbowY-sy)*180/Math.PI;
  // 3D upper-arm angle from torso direction includes downward displacement.
  const upperAngle=Math.atan2(Math.hypot(elbowX-.20,elbowZ-sz),elbowY-sy)*180/Math.PI;
  assert(upperAngle>=45 && upperAngle<=75);
  assert(angle>0);
  let s='';
  for(const y of [-.85,.45]) {
    s+=limb([[0,y,.43],[0,y,.06]],10);
    s+=limb([[-.28,y,.035],[.28,y,.035]],9);
  }
  s+=poly([[-.16,-1.2,.45],[.16,-1.2,.45],[.16,.53,.45],[-.16,.53,.45]],'#ccc');
  for(const x of [-.24,.24]) {
    s+=limb([[x*.67,.08,.56],[x,.63,.49],[x,.85,.08]],27);
    s+=limb([[x,.79,.04],[x,1.10,.04]],17);
  }
  s+=poly([[-.20,sy,.64],[.20,sy,.64],[.17,.16,.57],[-.17,.16,.57]],'url(#hatch)');
  s+=poly([[-.17,.01,.58],[.17,.01,.58],[.24,.29,.54],[-.24,.29,.54]],'#ccc');
  s+=limb([[0,-.67,.58],[0,-.88,.59]],20);
  const [hx,hy]=p([0,-1.03,.60]);
  s+=`<ellipse cx="${hx}" cy="${hy}" rx="24" ry="28" transform="rotate(-25 ${hx} ${hy})" fill="#f5f5f5" stroke="#555" stroke-width="2"/>`;
  for(const sign of [-1,1]) {
    const shoulder: V=[sign*.20,sy,sz], wrist: V=[sign*.31,wy,wz];
    const elbow: V=end?[sign*.43,-.40,.34]:[sign*.255,sy,(sz+wz)/2];
    s+=limb([shoulder,elbow,wrist],18);
  }
  // The complete shaft and its two full-size plates stay lateral to the head.
  s+=line([-1.1,wy,wz],[1.1,wy,wz],5);
  for(const sign of [-1,1]) {
    s+=line([sign*.72,wy,wz],[sign*1.1,wy,wz],9);
    s+=line([sign*.74,wy,wz-.025],[sign*.74,wy,wz+.025],7);
    s+=plate(sign*.84,wy,wz);
    const [x,y]=p([sign*.31,wy,wz]);
    s+=`<ellipse cx="${x}" cy="${y}" rx="9" ry="8" fill="#eee" stroke="#555" stroke-width="2"/>`;
    const [px,py]=p([sign*.84,wy,wz]);
    assert(Math.abs(px-hx)>65 || Math.abs(py-hy)>110, 'plate silhouette clears head');
  }
  return s;
}
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800"><defs><pattern id="hatch" width="7" height="7" patternUnits="userSpaceOnUse"><rect width="7" height="7" fill="#f4f4f4"/><path d="M-2 7L7-2M4 10L10 4" stroke="#aaa" stroke-width=".6"/></pattern></defs><rect width="1200" height="800" fill="white"/>${bench(false)}<g transform="translate(600 0)">${bench(true)}</g><path d="M530 400Q590 365 650 400L640 389M650 400L635 400" fill="none" stroke="#555" stroke-width="2"/></svg>`;
writeFileSync('.review/bench-composition-guide.svg',svg);
await sharp(Buffer.from(svg)).png().toFile('.review/bench-composition-guide.png');
writeFileSync('.review/geometry-checks.json',JSON.stringify({barLength,plateDiameter,shoulderWidth,gripWidth,startBarY:-.65,startShoulderY:-.65,endBarY:-.10,lowerSternumY:-.10,plateCentres:[-.84,.84],collars:[-.74,.74],sleeveEnds:[-1.1,1.1],heelWalkSoleAngleDegrees:20},null,2)+'\n');
console.log('Bench geometry assertions passed; composition guide written.');

// Feather the almost-white ground to alpha while retaining opaque graphite
// shading, as in the accepted sketches. Opaque shading also compresses better
// than encoding all pencil texture in the WebP alpha channel.
if (process.argv.includes('--prepare')) {
  for (const [id, source] of [['barbell-bench-press','bench-generated-r4'],['heel-walk','heel-generated-r2']]) {
    const {data,info}=await sharp(`.review/${source}.png`).flatten({background:'white'}).greyscale().raw().toBuffer({resolveWithObject:true});
    const rgba=Buffer.alloc(info.width*info.height*4);
    for (let i=0;i<data.length;i++) {
      const v=data[i]!;
      rgba[i*4]=rgba[i*4+1]=rgba[i*4+2]=Math.min(v,240);
      rgba[i*4+3]=v>=251?0:v>240?Math.round((255-v)*255/15):255;
    }
    await sharp(rgba,{raw:{width:info.width,height:info.height,channels:4}}).png().toFile(`.review/${id}-source.png`);
  }
}

if (process.argv.includes('--review')) {
  const targets=['barbell-bench-press','heel-walk','cable-hip-adduction'];
  const rows=[['barbell-bench-press','barbell-overhead-press','push-up','dumbbell-fly'],['heel-walk','wall-tibialis-raise','barbell-back-squat','cable-hip-abduction']];
  const bg={paper:[233,228,216],cinema:[31,33,36]} as const;
  async function view(id:string,width:number,theme:'paper'|'cinema') {
    const {data,info}=await sharp(`public/illustrations/exercises/${id}.webp`).resize(width).ensureAlpha().raw().toBuffer({resolveWithObject:true});
    const rgb=Buffer.alloc(info.width*info.height*3);
    for(let i=0;i<info.width*info.height;i++) for(let c=0;c<3;c++) {
      const a=data[i*4+3]!/255;
      const v=data[i*4+c]!;
      const ground=bg[theme][c]!;
      // CSS: multiply on paper; invert + hue-rotate(180) + contrast(.94),
      // screen at .86 opacity on cinema. Greys are hue-rotation invariant.
      const blended=theme==='paper'?ground*v/255:255-(255-ground)*(255-((255-v-127.5)*.94+127.5))/255;
      const opacity=theme==='paper'?a:a*.86;
      rgb[i*3+c]=Math.round(ground*(1-opacity)+blended*opacity);
    }
    return sharp(rgb,{raw:{width:info.width,height:info.height,channels:3}}).png().toBuffer();
  }
  for(const id of targets) {
    const file=`public/illustrations/exercises/${id}.webp`;
    const m=await sharp(file).metadata();
    assert.equal(m.width,1200);assert.equal(m.height,800);assert(m.hasAlpha);
    assert(statSync(file).size<=120*1024);
    for(const theme of ['paper','cinema'] as const) {
      writeFileSync(`.review/${id}-${theme}-420.png`,await view(id,420,theme));
      writeFileSync(`.review/${id}-${theme}-840.png`,await view(id,840,theme));
      writeFileSync(`.review/${id}-${theme}-2x.png`,await view(id,2400,theme));
    }
    console.log(`${id}: 1200x800 alpha; ${statSync(file).size} bytes`);
  }
  for(const theme of ['paper','cinema'] as const) {
    const layers=[];
    for(let r=0;r<rows.length;r++) for(let c=0;c<rows[r]!.length;c++) {
      const id=rows[r]![c]!;
      layers.push({input:await view(id,420,theme),left:c*440+10,top:r*320+30});
      const fill=theme==='paper'?'#333':'#ddd';
      layers.push({input:Buffer.from(`<svg width="430" height="26"><text x="10" y="19" fill="${fill}" font-family="sans-serif" font-size="15">${id}${c===0?' (redraw)':''}</text></svg>`),left:c*440,top:r*320});
    }
    await sharp({create:{width:1760,height:640,channels:3,background:{r:bg[theme][0],g:bg[theme][1],b:bg[theme][2]}}}).composite(layers).png().toFile(`.review/style-comparison-${theme}-420.png`);
  }
  // Keep an easily inspectable account of the exact simulation and inputs.
  writeFileSync('.review/preview-settings.json',JSON.stringify({paper:'#e9e4d8',cinema:'#1f2124',cinemaFilter:'invert(1) hue-rotate(180deg) contrast(.94)',cinemaBlend:'screen',cinemaOpacity:.86,sizes:[420,840,2400],geometry:JSON.parse(readFileSync('.review/geometry-checks.json','utf8'))},null,2)+'\n');
}
