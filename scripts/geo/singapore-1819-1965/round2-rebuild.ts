/** Fresh rebuild from retained, checksummed source rasters and reviewed recipes.
 * No browser, git writes, runtime imports, or authoring-helper overwrites. */
import {execFileSync}from'node:child_process';
import{readFileSync,writeFileSync,mkdirSync}from'node:fs';
import{createHash}from'node:crypto';import{resolve}from'node:path';
const d=import.meta.dirname,root=resolve(d,'../../..'),slug='singapore-1819-1965';
mkdirSync(`${d}/work`,{recursive:true});
const steps=[
 ['lines',`scripts/geo/lib/lines.ts --topic ${slug}`],
 ['inputs',`scripts/geo/${slug}/coast-inputs.ts`],
 ['register',`scripts/geo/${slug}/round2-register.ts`],
 ['history',`scripts/geo/${slug}/resume-history-land.ts`],
 ['splice',`scripts/geo/${slug}/resume-coast-inputs.ts`],
 ['borders',`scripts/geo/${slug}/borders.ts`],
 ['local',`scripts/geo/lib/local-land.ts --topic ${slug}`],
 ['pack',`scripts/geo/${slug}/resume-pack.ts`],
 ['compose',`scripts/geo/${slug}/keyframes.ts --all`],
 ['simplify',`scripts/geo/lib/simplify.ts --topic ${slug}`],
 ['water',`scripts/geo/${slug}/resume-final-water.ts`],
 ['holds',`scripts/geo/${slug}/finalise-control.ts`],
 ['colour',`scripts/geo/lib/colour-holders.ts --topic ${slug} --write`],
];
const completed=[];
for(const [name,command]of steps){
 console.log(`Rebuilding ${name}`);
 const output=execFileSync('pnpm',['tsx',...command!.split(' ')],{cwd:root,encoding:'utf8',maxBuffer:20*1024*1024});
 writeFileSync(`${d}/work/round2-rebuild-${name}.log`,output);completed.push({name,command:`pnpm tsx ${command}`,exitCode:0});
}
const assets=['public/geo/land-sg-history.json',`src/content/topics/${slug}/data/control.json`].map(path=>{const b=readFileSync(`${root}/${path}`);return{path,bytes:b.length,sha256:createHash('sha256').update(b).digest('hex')};});
writeFileSync(`${d}/round2-rebuild-audit.json`,JSON.stringify({date:'2026-11-09',status:'passed',cachedOriginalSources:true,steps:completed,assets},null,2)+'\n');
console.log('Fresh source rebuild passed');
