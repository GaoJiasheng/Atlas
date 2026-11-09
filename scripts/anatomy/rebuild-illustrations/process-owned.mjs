/** Run the unchanged illustrate.ts pipeline in a temporary shadow workspace.
 * Its shared manifest is written only in /tmp; only owned final WebPs return.
 */
import { existsSync, mkdtempSync, mkdirSync, copyFileSync, symlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';import {resolve,join} from 'node:path';import {execFileSync} from 'node:child_process';
const root=process.cwd(),dir=mkdtempSync(join(tmpdir(),'atlas-muscles-illustrations-'));
mkdirSync(`${dir}/scripts`,{recursive:true});mkdirSync(`${dir}/src/lib`,{recursive:true});
copyFileSync('scripts/illustrate.ts',`${dir}/scripts/illustrate.ts`);symlinkSync(`${root}/node_modules`,`${dir}/node_modules`);writeFileSync(`${dir}/package.json`,'{"type":"module"}');writeFileSync(`${dir}/src/lib/illustrations.json`,'{}');
const rows=process.argv[2]==='covers'?['arms','back','chest','core','legs','shoulders'].map(t=>['process',`muscles-${t}-r${process.argv[3]??18}.png`,`muscles-${t}`]):['barbell-bench-press','heel-walk','cable-hip-adduction'].map(id=>['exercise',`${existsSync(`scripts/anatomy/rebuild-illustrations/sources/imagegen/${id}.png`)?'imagegen/':''}${id}.png`,id]);
for(const [mode,file,id] of rows){execFileSync(`${root}/node_modules/.bin/tsx`,[`${dir}/scripts/illustrate.ts`,mode,resolve(`scripts/anatomy/rebuild-illustrations/sources/${file}`),id],{stdio:'inherit'});for(const suffix of mode==='process'?['','@2x']:['']){const sub=mode==='process'?'':'exercises/';copyFileSync(`${dir}/public/illustrations/${sub}${id}${suffix}.webp`,`${root}/public/illustrations/${sub}${id}${suffix}.webp`);}}
if(process.argv[2]==='covers')copyFileSync(`${dir}/src/lib/illustrations.json`,'scripts/anatomy/rebuild-illustrations/coverage-masks.json');
console.log(`Pipeline sandbox: ${dir}`);
