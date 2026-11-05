/** Offline SVG raster of the live orbit-card schematic; no browser. */
import {mkdirSync,writeFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {createElement} from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import sharp from 'sharp';
import {EclipseShadowSchematic} from '../../../src/engines/space-scene/hud/EclipseShadowSchematic';
const out='/tmp/atlas-group-b/sun-earth-moon';mkdirSync(out,{recursive:true});
const note={en:'At one true scale, the shadow cones are too thin to see clearly.',zh:'真实同一比例下，影锥太细，难以看清。'};
const palettes={paper:{'--ink':'#2a2824','--ink-2':'#555047','--ink-3':'#857d70','--panel-solid':'#e9e4d8','--signal':'#cc6328','--en-light':'#a37808'},cinema:{'--ink':'#e7e5df','--ink-2':'#b9b4a8','--ink-3':'#8c8578','--panel-solid':'#1f2124','--signal':'#df8245','--en-light':'#eccd66'}};
const items=[];
for(const [theme,tokens] of Object.entries(palettes))for(const zh of [false,true])for(const active of ['lunar','solar'] as const){
 const html=renderToStaticMarkup(createElement(EclipseShadowSchematic,{zh,active,note}));
 const svgs=[...html.matchAll(/<svg[\s\S]*?<\/svg>/g)].map(m=>m[0]);
 const panels=[];
 for(let i=0;i<svgs.length;i++){
  let svg=svgs[i]!.replace('<svg','<svg xmlns="http://www.w3.org/2000/svg"');
  for(const [token,color] of Object.entries(tokens))svg=svg.replaceAll(`var(${token})`,color);
  // SVG-only raster includes its real font sizes and neutral plate background.
  svg=svg.replaceAll('var(--font-mono)','monospace');
  svg=svg.replace('style="max-height:none"','').replace('><defs>',`><rect width="362" height="180" fill="${tokens['--panel-solid']}"/><defs>`);
  const name=`${theme}-${zh?'zh':'en'}-05-${active==='lunar'?3:4}-${i}`;
  writeFileSync(resolve(out,`${name}.svg`),svg);
  await sharp(Buffer.from(svg)).resize({width:1086}).png().toFile(resolve(out,`${name}.png`));
  panels.push(await sharp(Buffer.from(svg)).resize({width:362}).png().toBuffer());
 }
 const heights=await Promise.all(panels.map(p=>sharp(p).metadata().then(m=>m.height!)));
 const combined=await sharp({create:{width:362,height:heights.reduce((a,b)=>a+b,0)+24,channels:4,background:tokens['--panel-solid']}}).composite(panels.map((input,i)=>({input,left:0,top:24+heights.slice(0,i).reduce((a,b)=>a+b,0)}))).png().toBuffer();
 const label=Buffer.from(`<svg width="362" height="24"><text x="4" y="17" font-size="12" fill="${tokens['--ink']}">${theme} / ${zh?'ZH':'EN'} / 05.${active==='lunar'?3:4} — not to scale</text></svg>`);
 const final=await sharp(combined).composite([{input:label,top:0,left:0}]).png().toBuffer();
 writeFileSync(resolve(out,`${theme}-${zh?'zh':'en'}-${active}-card.png`),final);items.push(final);
}
await sharp({create:{width:362*4,height:190*2,channels:4,background:'#b9b4a8'}}).composite(items.map((input,i)=>({input,left:(i%4)*362,top:Math.floor(i/4)*190}))).png().toFile(resolve(out,'contact-sheet.png'));
process.stdout.write(`${out}/contact-sheet.png\n`);
