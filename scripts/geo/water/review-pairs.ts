/** Compact two-family review sheets; full four-view evidence uses compare.ts. */
import sharp, { type OverlayOptions } from 'sharp';
const prefix=process.argv[2]??'r2-look1',root='scripts/geo/water',panels:OverlayOptions[]=[];
for(const [i,[family,ref]]of [['forest','tree-rainforest-gardens'],['city','hdb-estate']].entries()){
 for(const [j,file]of [`${root}/comparisons/${prefix}-${family}-three-quarter.png`,`${root}/refs/${ref}.jpg`].entries())panels.push({input:await sharp(file).resize(800,600,{fit:'contain',background:'#e9e4d8'}).png().toBuffer(),left:j*800,top:i*650+50});
 panels.push({input:Buffer.from(`<svg width="1600" height="50"><text x="16" y="32" font-size="24" fill="#2a2824">${prefix} ${family}: engine studio + ACES | real Singapore reference</text></svg>`),left:0,top:i*650});
}
await sharp({create:{width:1600,height:1300,channels:3,background:'#e9e4d8'}}).composite(panels).jpeg({quality:93}).toFile(`${root}/comparisons/${prefix}-review-pairs.jpg`);
