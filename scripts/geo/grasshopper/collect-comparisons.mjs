/** Keep review history compact and assemble one directory for both topics. */
import fs from 'node:fs';
import sharp from 'sharp';
const dest='scripts/geo/grasshopper/comparisons/batch-2';fs.mkdirSync(dest,{recursive:true});
for(const topic of ['grasshopper','mosquito']){
 const base=`scripts/geo/${topic}/comparisons`,folder=`${dest}/${topic}`;fs.mkdirSync(folder,{recursive:true});
 for(const round of ['before','round1','round2','round3'])for(const name of fs.readdirSync(`${base}/${round}`).filter(n=>n.endsWith('.png'))){const source=`${base}/${round}/${name}`;await sharp(source).webp({quality:94}).toFile(source.replace(/\.png$/,'.webp'));fs.unlinkSync(source);}
 for(const name of fs.readdirSync(`${base}/final`).filter(n=>n.endsWith('.png'))){await sharp(`${base}/final/${name}`).webp({quality:96}).toFile(`${folder}/${name.replace(/\.png$/,'.webp')}`);}
 fs.copyFileSync(`src/content/topics/${topic}/REBUILD-3D.md`,`${folder}/REBUILD-3D.md`);
 fs.copyFileSync(`scripts/geo/${topic}/performance.json`,`${folder}/performance.json`);
}
fs.writeFileSync(`${dest}/README.md`,'# Insect rebuild review sheets\n\nThe two subdirectories contain decoded final asset renders and side-by-side reference sheets. The reports record reference credits, iteration changes and limits. Front render references are oblique photographs, not matched frontal photographs. These are CPU studio studies, not GPU acceptance screenshots.\n');
