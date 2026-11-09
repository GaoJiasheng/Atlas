/** Final candidates -> unchanged house illustrate.ts in isolated manifest workspace. */
import fs from 'node:fs';import sharp from 'sharp';import {execFileSync} from 'node:child_process';
const dir='scripts/anatomy/rebuild-illustrations',out=`${dir}/comparison-sheets-round2`;
fs.mkdirSync(`${out}/before`,{recursive:true});
const selected={arms:2,back:2,chest:2,core:1,legs:1,shoulders:2};
for(const [t,r]of Object.entries(selected)){for(const suffix of ['', '@2x']){const f=`muscles-${t}${suffix}.webp`;if(!fs.existsSync(`${out}/before/${f}`))fs.copyFileSync(`public/illustrations/${f}`,`${out}/before/${f}`);}if(t==='core')await sharp(`${dir}/sources/imagegen/muscles-${t}-round2-r${r}.png`).blur(.48).greyscale().toColourspace('srgb').png().toFile(`${dir}/sources/muscles-${t}-r23.png`);else await sharp(`${dir}/sources/imagegen/muscles-${t}-round2-r${r}.png`).greyscale().toColourspace('srgb').png().toFile(`${dir}/sources/muscles-${t}-r23.png`);}
for(const [id,r]of Object.entries({'barbell-bench-press':4,'heel-walk':1,'cable-hip-adduction':1})){if(!fs.existsSync(`${out}/before/${id}.webp`))fs.copyFileSync(`public/illustrations/exercises/${id}.webp`,`${out}/before/${id}.webp`);if(id==='cable-hip-adduction')await sharp(`${dir}/sources/imagegen/${id}-round2-r${r}.png`).blur(.48).greyscale().toColourspace('srgb').png().toFile(`${dir}/sources/imagegen/${id}.png`);else await sharp(`${dir}/sources/imagegen/${id}-round2-r${r}.png`).greyscale().toColourspace('srgb').png().toFile(`${dir}/sources/imagegen/${id}.png`);}
execFileSync('node',[`${dir}/process-owned.mjs`,'covers','23'],{stdio:'inherit'});
execFileSync('node',[`${dir}/process-owned.mjs`,'exercises'],{stdio:'inherit'});
fs.writeFileSync(`${dir}/round2-selection.json`,JSON.stringify({covers:selected,exercises:{'barbell-bench-press':4,'heel-walk':1,'cable-hip-adduction':1},pipeline:'scripts/illustrate.ts unchanged in shadow workspace'},null,2)+'\n');
