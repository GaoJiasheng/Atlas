/** Contact sheet of every source-labelled comparison, for a complete angle sweep. */
import sharp from 'sharp';
import { existsSync } from 'node:fs';
const round=process.argv[2]??'round1',stomachRound=process.argv[3]??round,root='/tmp/atlas-digestive-rebuild/comparisons';
const views=['front','three-quarter','profile','detail'],heroes=['tooth','stomach','villi'];
const images=[];
for(let h=0;h<heroes.length;h++)for(let v=0;v<views.length;v++){
 const sourceRound=heroes[h]==='stomach'?stomachRound:round;
 const file=`${root}/${sourceRound}-${heroes[h]}-${views[v]}-paper-comparison.png`;
 if(!existsSync(file))throw new Error(`Missing ${file}`);
 images.push({input:await sharp(file).resize(504,348).png().toBuffer(),left:v*504,top:h*348});
}
await sharp({create:{width:2016,height:1044,channels:3,background:'#e9e4d8'}}).composite(images).png().toFile(`${root}/${round}${stomachRound===round?'':`-with-${stomachRound}`}-all-angles.png`);
