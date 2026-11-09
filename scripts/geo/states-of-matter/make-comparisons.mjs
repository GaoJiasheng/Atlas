/** Development-only comparisons. Photos are attributed, cropped to subject,
 * and never shipped in public/. Full sources/rights live in references.json.
 * Each row keeps the unwarped photo: no fabricated reverse-side views.
 */
import fs from 'node:fs';
import sharp from 'sharp';
const round=process.argv[2]??'final',root='scripts/geo/states-of-matter',dir=`${root}/evidence/${round}`,out=`${dir}/comparisons`;fs.mkdirSync(out,{recursive:true});
const refs=JSON.parse(fs.readFileSync(`${root}/references.json`));
const use={
 'bicycle-wheel':['ForhjulSide.jpg','Bicycle wheel.jpg','Bicycle wheel dish diagram.svg','Fixed gear hub.jpg'],
 'floor-pump':['SKS Rennkompressor Standpumpe.jpg','Bike pump.jpg','SKS Rennkompressor Standpumpe.jpg','Bike pump.jpg'],
 basketball:['Basketball (Ball).jpg','Close-up of a basketball with a blurry background.jpg','Basketball (Ball).jpg','Close-up of a basketball with a blurry background.jpg'],
 'ball-pump':['Bicycle pump Luftpumpe.jpg','Bicycle pump Luftpumpe.jpg','Bike pump.jpg','Bicycle pump Luftpumpe.jpg'],
 'balloon-pump':['St Pats Metairie 2013 Balloon Pump.JPG','St Pats Metairie 2013 Balloon Pump.JPG','Bike pump.jpg','Bicycle pump Luftpumpe.jpg'],
 'balloon-round':['11 Sapphire Blue.jpg','Round latex balloons.png','11 Sapphire Blue.jpg','Ballons.jpg'],
 'balloon-long':['Balloon modelling.jpg','Balloon Dog.jpg','Balloon modelling.jpg','Ballons.jpg'],
 'ice-cube':['Icecube.jpg','Ice cubes.jpg','Ice cube Air entrapment.JPG','Icecube.jpg'],
 torch:['Flashlight.jpg','Fenix P1D LED flashlight (2739718566).jpg','Flashlight.jpg','Flashlight.jpg'],
 sponge:['Sponge-viscose.jpg','Sponge-viscose.jpg','Éponge type 3 (2).jpg','Cleaning sponge detail.jpg'],
 tissue:['Crumpled tissue paper.jpg','Tissue paper white.jpg','Crumpled tissue paper.jpg','Crumpled tissue paper.jpg'],
 'sand-grains':['Песчинки-1. Желтый строительный песок.jpg','Sand under electron microscope.jpg','Песчинки-1. Желтый строительный песок.jpg','Sand under electron microscope.jpg'],
 bench:['Paillasse chimie.jpg','Laboratory pipettes.jpg','Paillasse chimie.jpg','Paillasse chimie.jpg'],
 'side-table':['Paillasse chimie.jpg','Laboratory pipettes.jpg','Paillasse chimie.jpg','Paillasse chimie.jpg'],
};
// Crop coordinates refer to the downloaded 960px thumbnail, not a reprojected
// or AI-generated photo. Crop changes are declared in the attribution footer.
const crops={
 'Éponge type 3 (2).jpg':[80,250,310,300],
 '11 Sapphire Blue.jpg':[220,0,520,1100],
 'St Pats Metairie 2013 Balloon Pump.JPG':[340,345,138,170],
 'Close-up of a basketball with a blurry background.jpg':[300,138,401,413],
 'Crumpled tissue paper.jpg':[80,800,720,700],
};
const esc=s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;');
const text=(s,w=1280,h=64)=>Buffer.from(`<svg width="${w}" height="${h}"><rect width="100%" height="100%" fill="#e9e4d8"/><text x="14" y="22" font-size="16" fill="#2a2824">${esc(s)}</text></svg>`);
for(const [id,subjects] of Object.entries(use)){
 if(!fs.existsSync(`${dir}/${id}-front.png`))continue;const rows=[];
 for(const [i,name] of ['front','three-quarter','profile','detail'].entries()){
  const r=refs.find(r=>r.title===subjects[i]);if(!r)throw new Error(`Missing reference ${subjects[i]}`);let img=sharp(r.path).rotate().flatten({background:'#fff'});const meta=await img.metadata(),crop=crops[r.title];if(crop&&crop[0]+crop[2]<=meta.width&&crop[1]+crop[3]<=meta.height)img=img.extract({left:crop[0],top:crop[1],width:crop[2],height:crop[3]});
  const label=`${id} | ${round} ${name} | studio CPU render · reference photo/drawing (crop/resize only)`;
  const footer=`${r.title} · ${r.author||'Author: see source page'} · ${r.license||'Rights: see source page'}`;
  const render=sharp(`${dir}/${id}-${name}.png`),size=await render.metadata(),w=size.width,h=size.height;
  const photo=await img.resize(w,h,{fit:'contain',background:'#fff'}).png().toBuffer();
  const one=await sharp({create:{width:w*2,height:h+80,channels:3,background:'#e9e4d8'}}).composite([{input:text(label,w*2,36),left:0,top:0},{input:await render.toBuffer(),left:0,top:36},{input:photo,left:w,top:36},{input:text(footer,w*2,44),left:0,top:h+36}]).png().toBuffer();
  const rowHeight=Math.round((h+80)*1280/(w*2));fs.writeFileSync(`${out}/${id}-${name}.png`,one);rows.push({input:await sharp(one).resize(1280,rowHeight).toBuffer(),left:0,top:i*rowHeight,height:rowHeight});
 }
 await sharp({create:{width:1280,height:rows.reduce((s,r)=>s+r.height,0),channels:3,background:'#e9e4d8'}}).composite(rows.map(({height,...row})=>row)).png().toFile(`${out}/${id}-sheet.png`);
}
console.log(out);
