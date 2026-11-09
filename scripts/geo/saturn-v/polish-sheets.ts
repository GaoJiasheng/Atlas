/** Evidence images stay outside the checkout. Source photographs are ignored. */
import fs from 'node:fs';
import sharp,{type OverlayOptions} from 'sharp';
const root=process.argv[2]??'/tmp/atlas-leftover-polish',out=root+'/sheets';fs.mkdirSync(out,{recursive:true});
const W=600,H=450;
async function sheet(name:string,rows:{render:string;reference:string;label:string}[],note:string){
 const layers:OverlayOptions[]=[];
 for(const [i,row]of rows.entries()){
  const title=Buffer.from(`<svg width="1200" height="34"><text x="12" y="24" font-family="sans-serif" font-size="17" fill="#2a2824">${row.label}</text></svg>`);
  layers.push({input:title,left:0,top:i*(H+34)});
  for(const [j,path]of [row.render,row.reference].entries())layers.push({input:await sharp(path).resize(W,H,{fit:'contain',background:'#e9e4d8'}).png().toBuffer(),left:j*W,top:i*(H+34)+34});
 }
 const footer=Buffer.from(`<svg width="1200" height="60"><text x="12" y="22" font-size="16">Decoded GLB | real reference. Engine studio / RoomEnvironment / exposure / ACES; CPU evidence.</text><text x="12" y="46" font-size="14">${note}</text></svg>`);
 layers.push({input:footer,left:0,top:rows.length*(H+34)});
 await sharp({create:{width:W*2,height:rows.length*(H+34)+60,channels:3,background:'#e9e4d8'}}).composite(layers).jpeg({quality:94}).toFile(`${out}/${name}.jpg`);
}
for(const round of ['before','look1','look2','look3','final'])for(const theme of ['paper','cinema'])for(const hero of ['ascent','descent']){
 const dir=`${root}/saturn/${round}-${theme}`,views=['front','quarter','profile','detail'];if(!fs.existsSync(`${dir}/polish-${hero}-front-render.png`))continue;
 const references=hero==='ascent'?['polish-ascent-front.jpg','polish-ascent-quarter.jpg','polish-ascent-profile.jpg','polish-windows.jpg']:['polish-descent-front.jpg','polish-descent-quarter.jpg','polish-descent-profile.jpg','polish-foil.jpg'];
 await sheet(`saturn-${round}-${theme}-${hero}`,views.map((view,i)=>({render:`${dir}/polish-${hero}-${view}-render.png`,reference:'scripts/geo/saturn-v/refs/'+references[i],label:`${round} / ${theme} / ${hero} / ${view} | NASA flight photography`})), 'NASA views are nearest available elevations; profile photo is rear-quarter, not registered CAD evidence.');
}
await sheet('saturn-final-target',['paper','cinema'].map(theme=>({render:`${root}/saturn/final-${theme}/polish-target-detail-render.png`,reference:'scripts/geo/saturn-v/refs/target.jpg',label:`Target / ${theme} | NASA AS11-36-5365`})), 'Annulus and cross are flat target markings; fastening heads and panel lap joints have physical relief.');
const gasRef=root+'/gas-reference-upright.png';
await sharp('scripts/geo/heat/refs/Gas_syringe.jpg').extract({left:0,top:500,width:740,height:254}).rotate(270).png().toFile(gasRef);
for(const round of ['before-polish','look1','look2','final'])if(fs.existsSync(`${root}/heat/${round}/gas-front.png`))await sheet(`heat-${round}`,['front','three-quarter','profile','floor-paper'].map(view=>({render:`${root}/heat/${round}/gas-${view}.png`,reference:view.startsWith('floor')?'scripts/geo/heat/refs/Glass_100ml_beaker.jpg':gasRef,label:`${round} / gas / ${view} | Geni gas syringe; Schott glass-base study`})), 'Generic teaching cylinder. Rotated side photo controls glass seating; floor reference is a side elevation.');
for(const round of ['look1','look2','final'])if(fs.existsSync(`${root}/water/${round}-pipeline-01-3-paper.png`))await sheet(`water-${round}`,['01-3','07-1'].map(beat=>({render:`${root}/water/${round}-pipeline-${beat}-paper.png`,reference:'scripts/geo/water/refs/Causeway_pipeline.jpg',label:`${round} / water beat ${beat} | real Causeway pipeline context`})), 'Camera/layout repair of an accepted schematic diorama, not a scale reconstruction of the Causeway.');
console.log(out);
