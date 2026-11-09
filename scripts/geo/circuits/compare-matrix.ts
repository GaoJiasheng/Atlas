/** Compose four-angle reference sheets. Reference crops keep the source pixels;
 * rotations only align the labelled engineering axes. No synthetic references.
 */
import fs from 'node:fs';
import sharp from 'sharp';
const root='scripts/geo/circuits/refs',round=process.argv[2]??'final',src=`/private/tmp/atlas-circuits-rebuild/${round}`,out='scripts/geo/circuits/comparisons';
fs.mkdirSync(out,{recursive:true});
type Crop={left:number,top:number,width:number,height:number};
type Item={render:string,reference:string,crop?:Crop,rotate?:number,label:string};
const groups:Record<string,Item[]>={
 motor:[
 {render:'motor-front-paper',reference:'fa-130ra.png',crop:{left:65,top:685,width:215,height:220},label:'Front / shaft axis: Mabuchi FA-130RA drawing; 20.1 × 15.1 mm section'},
 {render:'motor-three-quarter-paper',reference:'motor-pololu.jpg',label:'Three-quarter: Pololu FA-130 photo; front bearing / flattened can / end bell'},
 {render:'motor-profile-paper',reference:'fa-130ra.png',crop:{left:290,top:645,width:390,height:285},rotate:90,label:'Profile: manufacturer drawing rotated 90°; 25 mm body / 9.4 mm exposed shaft'},
 {render:'motor-detail-paper',reference:'motor-pololu.jpg',crop:{left:150,top:470,width:670,height:440},label:'Close-up: swaged front bearing, true shaft relief, front-can shoulder'},
 ],
 buzzer:[
 {render:'buzzer-front-paper',reference:'cmi-1210-drawing.png',crop:{left:690,top:515,width:250,height:265},label:'Front / sound face: Same Sky CMI-1210 drawing; generic housing, seal omitted'},
 {render:'buzzer-three-quarter-paper',reference:'buzzer-03.jpg',label:'Three-quarter: Jdx / Commons / CC BY-SA 3.0; generic can proportions'},
 {render:'buzzer-profile-paper',reference:'buzzer-01.jpg',crop:{left:230,top:125,width:180,height:200},label:'Profile: Jdx / Commons / CC BY-SA 3.0; two pins, soldered leads are display dressing'},
 {render:'buzzer-detail-paper',reference:'buzzer-06.jpg',crop:{left:385,top:210,width:240,height:240},label:'Close-up: Jdx / Commons / CC BY-SA 3.0; sound port and rolled moulding edge'},
 ],
 clips:[
 {render:'clips-front-paper',reference:'clip-whole.jpg',crop:{left:690,top:155,width:220,height:190},label:'Front / jaw end: Lambtron / Commons / CC BY-SA 4.0; reference tip is oblique'},
 {render:'clips-three-quarter-paper',reference:'clip-pivot.jpg',label:'Three-quarter: Lambtron / Commons / CC BY-SA 4.0; channel jaws and hinge'},
 {render:'clips-profile-paper',reference:'clip-wire.jpg',label:'Profile: Lambtron / Commons / CC BY-SA 4.0; stamped channel / compression spring'},
 {render:'clips-detail-paper',reference:'clip-wire.jpg',crop:{left:570,top:175,width:295,height:130},label:'Close-up: Lambtron / Commons / CC BY-SA 4.0; serrated gripping edges'},
 ],
};
const W=800,H=650,head=70;
for(const [name,items]of Object.entries(groups)){
 const rows:Buffer[]=[];
 for(const item of items){let ref=sharp(`${root}/${item.reference}`);if(item.crop)ref=ref.extract(item.crop);if(item.rotate)ref=sharp(await ref.png().toBuffer()).rotate(item.rotate);const img=await ref.resize(W,H,{fit:'contain',background:'#e9e4d8'}).png().toBuffer();const header=Buffer.from(`<svg width="1600" height="70"><rect width="1600" height="70" fill="#e9e4d8"/><g font-family="sans-serif" fill="#2a2824"><text x="18" y="25" font-size="20">${item.render} · actual engine geometry / CPU studio / ACES</text><text x="18" y="53" font-size="17">${item.label.replaceAll('&','&amp;')}</text></g></svg>`);const row=await sharp({create:{width:1600,height:H+head,channels:3,background:'#e9e4d8'}}).composite([{input:header,left:0,top:0},{input:await sharp(`${src}/${item.render}.png`).toBuffer(),left:0,top:head},{input:img,left:W,top:head}]).png().toBuffer();rows.push(row);await sharp(row).toFile(`${out}/${round}-${name}-${item.render.replace(`${name}-`,'').replace('-paper','')}.png`);}
 await sharp({create:{width:1600,height:(H+head)*rows.length,channels:3,background:'#e9e4d8'}}).composite(rows.map((input,i)=>({input,left:0,top:i*(H+head)}))).png().toFile(`${out}/${round}-${name}-four-views.png`);
}
for(const r of ['round1','round2','round3'])for(const name of ['motor','buzzer','clips']){const p=`/private/tmp/atlas-circuits-rebuild/${r}/compare-${name}-three-quarter.png`;if(fs.existsSync(p))fs.copyFileSync(p,`${out}/${r}-${name}-three-quarter.png`);}
for(const name of ['board-hero-paper','board-hero-cinema','motor-three-quarter-cinema','buzzer-three-quarter-cinema','motor-rear-paper'])fs.copyFileSync(`${src}/${name}.png`,`${out}/final-${name}.png`);
