import fs from 'node:fs'; import sharp from 'sharp';
const out='scripts/anatomy/rebuild-evidence/comparisons/round2-final';
const covers=['arms','back','chest','core','legs','shoulders'];
const rows=await Promise.all(covers.map(async(t,i)=>({input:await sharp(`scripts/anatomy/rebuild-illustrations/comparison-sheets-round2/muscles-${t}-paper.png`).resize(450).png().toBuffer(),left:(i%3)*450,top:Math.floor(i/3)*450})));
await sharp({create:{width:1350,height:900,channels:3,background:'#e9e4d8'}}).composite(rows).png().toFile(`${out}/covers-contact.png`);
const files=['barbell-reverse-curl-end-35','chin-up-end-35','barbell-overhead-press-end-35','barbell-bench-press-end-35','side-plank-end-35','barbell-back-squat-end-35','barbell-romanian-deadlift-end-35'];
await sharp({create:{width:1400,height:850,channels:3,background:'#e9e4d8'}}).composite(await Promise.all(files.map(async(f,i)=>({input:await sharp(`${out}/${f}.png`).resize(350,425).png().toBuffer(),left:i%4*350,top:Math.floor(i/4)*425})))).png().toFile(`${out}/poses-contact.png`);
const exercises=['barbell-bench-press','heel-walk','cable-hip-adduction'];
await sharp({create:{width:1200,height:2400,channels:3,background:'#e9e4d8'}}).composite(await Promise.all(exercises.map(async(t,i)=>({input:await sharp(`scripts/anatomy/rebuild-illustrations/comparison-sheets-round2/${t}-paper.png`).png().toBuffer(),left:0,top:i*800})))).png().toFile(`${out}/exercises-contact.png`);
