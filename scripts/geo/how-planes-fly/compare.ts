/** Development-only comparison sheets. Photographs remain outside public/. */
import sharp from 'sharp';
import fs from 'node:fs';
const slug=process.argv[2]??'how-planes-fly',round=process.argv[3]??'round1';
const root=`scripts/geo/${slug}`,dir=`${root}/evidence/${round}/comparisons`;fs.mkdirSync(dir,{recursive:true});
const views=slug==='how-planes-fly'?[
 ['front','front',false],['three-quarter','airframe',true],['profile','drawing',false],['nose-close','profile',false],['wing-root','airframe',true],['tail-close','airframe',true],['engine-front','engine-photo',false],['engine-three-quarter','engine',false],['engine-profile','engine-section',false],['engine-blades','engine-detail',false],
]:[['front','board',false],['three-quarter','board',false],['profile','caps',false],['caps-close','power',false],['installed','power',false]];
for(const [view,ref,flip]of views){
 const file=`${root}/evidence/${round}/${view}-paper.png`;if(!fs.existsSync(file))continue;
 let photo=sharp(`${root}/refs/${ref}.jpg`).flatten({background:'#ffffff'});
 if(ref==='drawing')photo=photo.extract({left:0,top:0,width:660,height:235});
 if(slug==='aircon'&&view==='caps-close')photo=photo.extract({left:180,top:390,width:650,height:470});
 if(view==='nose-close')photo=photo.extract({left:0,top:90,width:800,height:515});
 if(flip)photo=photo.flop();
 const right=await photo.resize(900,660,{fit:'contain',background:'#e9e4d8'}).png().toBuffer();
 const crop=await sharp(file).extract({left:0,top:44,width:900,height:656}).png().toBuffer();
 const trimmed=await sharp(crop).trim({background:'#e9e4d8',threshold:12}).png().toBuffer();
 const left=await sharp(trimmed).resize(860,640,{fit:'contain',background:'#e9e4d8'}).extend({top:30,bottom:30,left:20,right:20,background:'#e9e4d8'}).png().toBuffer();
 const banner=Buffer.from(`<svg width="1800" height="40"><rect width="1800" height="40" fill="#e9e4d8"/><text x="20" y="26" font-size="18" font-family="sans-serif" fill="#2a2824">${slug} / ${round} / ${view} — SHIPPING GEOMETRY + ENGINE STUDIO / ACES</text><text x="925" y="26" font-size="16" font-family="sans-serif">REFERENCE: ${ref}${flip?' (horizontally flipped)':''} · attribution in REBUILD-3D.md</text></svg>`);
 await sharp({create:{width:1800,height:740,channels:3,background:'#e9e4d8'}}).composite([{input:left,left:0,top:40},{input:right,left:900,top:60},{input:banner,left:0,top:0}]).png().toFile(`${dir}/${view}.png`);
}
console.log(dir);
