/** Reproduce the covers and exercise PNG/WebPs without browser or shared writes.
 * The revision argument keeps earlier visual reviews intact.
 * Run: node scripts/anatomy/rebuild-illustrations/rebuild.mjs 18 --covers-only
 */
import {execFileSync} from 'node:child_process';
const tsx='node_modules/.bin/tsx',dir='scripts/anatomy/rebuild-illustrations',revision=process.argv[2]??'18',coversOnly=process.argv.includes('--covers-only');
const run=(cmd,args)=>execFileSync(cmd,args,{stdio:'inherit',maxBuffer:20e6});
run(tsx,[`${dir}/render-covers.ts`,'',revision]);
for(const topic of ['arms','back','chest','core','legs','shoulders'])run(tsx,[`${dir}/graphite.ts`,topic,revision,revision]);
run('node',[`${dir}/process-owned.mjs`,'covers',revision]);
if(!coversOnly){run('node',[`${dir}/draw-exercises.mjs`]);run('node',[`${dir}/finish-generated.mjs`]);run('node',[`${dir}/process-owned.mjs`,'exercises']);}run('node',[`${dir}/qa.mjs`]);run('python3',[`${dir}/coverage-patch.py`]);
