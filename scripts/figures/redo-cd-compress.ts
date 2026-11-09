/** Re-encode supplied rasters without changing their dimensions or subject geometry.
 * Originals are preserved outside public for 420px/840px comparison. Run once on
 * the original assets; budget-compliant outputs are skipped on subsequent runs.
 */
import assert from 'node:assert/strict';
import { copyFileSync, existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import sharp from 'sharp';
import { PREVIEW } from './redo-cd-utils.js';
const files=['fossils-and-skeletons-fossilisation','inside-the-earth-magma-cutaway','space-race-lunokhod','flower-and-seed-bee-pollination','singapore-1819-1965-rubber-and-tin'];
mkdirSync(`${PREVIEW}/before`,{recursive:true});
for(const id of files){
 const out=`public/illustrations/figures/${id}.webp`;
 if(statSync(out).size<=120000)continue;
 const before=`${PREVIEW}/before/${id}.webp`;
 if(!existsSync(before))copyFileSync(out,before);
 const input=readFileSync(before),meta=await sharp(input).metadata();
 let result:Buffer|undefined;
 if(id==='fossils-and-skeletons-fossilisation'){
  const {data,info}=await sharp(input).ensureAlpha().raw().toBuffer({resolveWithObject:true});
  // The supplied body has alpha 252/253 throughout: canonicalize almost-opaque
  // and almost-empty endpoints. The drawing preset preserves fine pores without
  // the earlier blur prefilter; compare the supplied 420px/840px before/after.
  for(let i=3;i<data.length;i+=4){if(data[i]!>=248)data[i]=255;if(data[i]!<=7)data[i]=0;}
  result=await sharp(data,{raw:{width:info.width,height:info.height,channels:4}}).webp({quality:24,alphaQuality:60,effort:6,smartSubsample:true,preset:'drawing'}).toBuffer();
 }else for(const [quality,alphaQuality] of [[80,80],[74,70],[68,60],[62,50],[56,40]] as const){
  const candidate=await sharp(input).webp({quality,alphaQuality,effort:6,smartSubsample:true}).toBuffer();
  if(candidate.length<=120000){result=candidate;break;}
 }
 assert(result&&result.length<=120000,`${id}: no budget-compliant encoding`);
 const after=await sharp(result).metadata();assert.equal(after.width,meta.width);assert.equal(after.height,meta.height);assert(after.hasAlpha);
 writeFileSync(out,result);console.log(`${id}: ${input.length} → ${result.length} B`);
}
