/** Offline asset proofs only. Does not launch Chromium, a browser or a desktop. */
import sharp from 'sharp';
import {readFileSync,writeFileSync,mkdirSync,readdirSync,statSync} from 'node:fs';
import YAML from 'yaml';
const OUT='previews/space-race-r3';mkdirSync(`${OUT}/zoom-2x`,{recursive:true});
const figures=[];
for(const [file,beats]of [['00-background.mdx',[2,3,4,5]],['07-costs-and-connections.mdx',[1,2,3,4]]]){
const data=YAML.parse(readFileSync('src/content/topics/space-race/chapters/'+file,'utf8').split('---')[1]);
for(const beat of beats)figures.push({...data.state.beats[beat-1].figure,beat:`${data.id}-${beat}`});}
if(figures.length!==8)throw Error('Expected eight space-race figures');
const reference='figures/space-race-apollo-cutaway';
async function render(src,theme,invert,width){
const height=width*3/4;
const {data,info}=await sharp(`public/illustrations/${src}.webp`).resize(width,height).ensureAlpha().raw().toBuffer({resolveWithObject:true});
const out=Buffer.alloc(width*height*3),bg=(theme==='paper'?[233,228,216]:[31,33,36]).map(x=>x/255);
for(let p=0;p<width*height;p++){
let c=[0,1,2].map(k=>data[p*info.channels+k]/255);const a=data[p*info.channels+3]/255;
if(theme==='cinema'&&invert){c=c.map(v=>1-v);const[r,g,b]=c;c=[-.574*r+1.430*g+.144*b,.426*r+.430*g+.144*b,.426*r+1.430*g-.856*b].map(v=>Math.max(0,Math.min(1,v)));c=c.map(v=>.94*v+.03);c=c.map((v,k)=>bg[k]+(1-bg[k])*v*.86*a);}
else if(theme==='cinema')c=c.map((v,k)=>.95*.85*(v*a+([233,228,216][k]/255)*(1-a))+.025);
else c=c.map((v,k)=>bg[k]*(v*a+1-a));
for(let k=0;k<3;k++)out[p*3+k]=Math.round(Math.max(0,Math.min(1,c[k]))*255);
}
return sharp(out,{raw:{width,height,channels:3}}).png().toBuffer();
}
for(const width of [420,1200]){
const pad=12,cellW=width+24,rowH=width*.75+78,sheetW=4*cellW,sheetH=8*rowH,rows=[];
for(const f of figures){
const pieces=[];
for(const[i,theme,isRef]of [[0,'paper',false],[1,'paper',true],[2,'cinema',false],[3,'cinema',true]]){
const bg=theme==='paper'?'#e9e4d8':'#1f2124',ink=theme==='paper'?'#2a2824':'#e7e5df';
const title=isRef?'A-grade / Apollo cutaway':f.beat;
const label=`${theme}${!isRef&&f.invert===false?' / polarity preserved':''}`;
pieces.push({input:Buffer.from(`<svg width="${cellW}" height="${rowH}"><rect width="100%" height="100%" fill="${bg}"/><g font-family="monospace" font-size="14" fill="${ink}"><text x="12" y="20">${title}</text><text x="12" y="40">${label}</text></g></svg>`),left:i*cellW,top:0});
const input=await render(isRef?reference:f.src,theme,isRef||f.invert!==false,width);pieces.push({input,left:i*cellW+pad,top:54});
if(!isRef){const stem=f.src.split('/')[1];await sharp(input).png().toFile(`${OUT}/${stem}-${theme}-${width}.png`);if(width===1200)await sharp(input).resize(2400,1800,{kernel:'nearest'}).png().toFile(`${OUT}/zoom-2x/${stem}-${theme}.png`);}
}
const row=await sharp({create:{width:sheetW,height:rowH,channels:3,background:'#aaa69f'}}).composite(pieces).png().toBuffer();rows.push({input:row,left:0,top:(rows.length)*rowH});
await sharp(row).toFile(`${OUT}/compare-${f.beat}-${width}.png`);
}
await sharp({create:{width:sheetW,height:sheetH,channels:3,background:'#aaa69f'}}).composite(rows).png().toFile(`${OUT}/contact-${width}-paper-cinema.png`);
}
const stats=[];
for(const f of figures){const file=`public/illustrations/${f.src}.webp`,m=await sharp(file).metadata();if(m.width!==1200||m.height!==900||statSync(file).size>120000||f.caption.en.length>90)throw Error(`${f.beat}: export/caption constraint`);stats.push({beat:f.beat,file,bytes:statSync(file).size,width:m.width,height:m.height,captionCharacters:f.caption.en.length,invert:f.invert!==false});}
writeFileSync(`${OUT}/image-stats.json`,JSON.stringify(stats,null,2)+'\n');
writeFileSync(`${OUT}/proof-method.txt`,'Offline sRGB simulation of existing global.css: paper multiply; cinema invert/hue-rotate(180)/contrast(.94)/screen/opacity(.86), or no-invert warm paper backing + brightness(.85)/contrast(.95). Native 1200px exports and 2x nearest-neighbour magnification. No browser/e2e/page screenshots run.\n');
console.log(JSON.stringify(stats,null,2));
