/** Contact sheets retain both render and reference for every required angle. */
import fs from 'node:fs';
import sharp from 'sharp';
const round=process.argv[2]??'resume2-paper',dir=`scripts/geo/saturn-v/comparisons/${round}`;
const renderManifest=JSON.parse(fs.readFileSync(`${dir}/render-manifest.json`,'utf8')),contacts:Record<string,unknown>={};
for(const hero of ['stack','f1','j2','csm','les','lm']){
 const shots=['front','quarter','profile','detail'],width=720,height=478;
 const hashes=shots.map(view=>renderManifest[`${hero}-${view}`].assetSHA256);
 if(new Set(hashes).size!==1)throw new Error(`${hero}: mixed asset revisions in contact sheet`);
 const layers=await Promise.all(shots.map(async(view,i)=>({input:await sharp(`${dir}/${hero}-${view}-comparison.png`).resize(width,height,{fit:'contain',background:'#e9e4d8'}).png().toBuffer(),left:(i%2)*width,top:Math.floor(i/2)*height})));
 if(!fs.existsSync(dir))throw new Error(dir);
 await sharp({create:{width:width*2,height:height*2,channels:3,background:'#e9e4d8'}}).composite(layers).png().toFile(`${dir}/${hero}-four-views.png`);
 contacts[hero]={assetSHA256:hashes[0],shots:shots.map(view=>`${hero}-${view}`)};
}
fs.writeFileSync(`${dir}/contact-manifest.json`,JSON.stringify(contacts,null,2)+'\n');
