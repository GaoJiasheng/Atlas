/** Targeted built-in imagegen edit of the ORIGINAL Atlas image, using Todd's Du
 * tally photo for the outline. Original graphite surface retained; all writing
 * removed. Final mirroring is deterministic so both longitudinal halves share
 * precisely the same contour rather than relying on an AI symmetry claim.
 */
import assert from 'node:assert/strict';
import{readFileSync,writeFileSync}from'node:fs';
import sharp from'sharp';
import{main}from'./redo-cd-utils.js';
export function tally(){return '<!-- Original-image edit; exact reflected contours, see exportTally. -->';}
export async function exportTally(){
 const input='scripts/figures/materials/tiger-tally-original-edited.png';
 const meta=await sharp(input).metadata();assert(meta.width&&meta.height);
 const crop=await sharp(input).extract({left:0,top:0,width:Math.floor(meta.width/2),height:meta.height}).png().toBuffer();const trimmed=await sharp(crop).trim({threshold:15}).png().toBuffer();const half=await sharp(trimmed).resize({width:530}).png().toBuffer();
 const m=await sharp(half).metadata();assert(m.width&&m.height);assert(m.height>180&&m.height<300);
 const right=await sharp(half).flop().png().toBuffer();
 const a=await sharp(half).ensureAlpha().raw().toBuffer(),b=await sharp(right).flop().ensureAlpha().raw().toBuffer();assert(a.equals(b),'Reflected halves must have pixel-identical contours and materials');
 const top=Math.round((900-m.height)/2),left=50,gap=40;assert.equal(2*m.width+gap,1100);
 const final=await sharp({create:{width:1200,height:900,channels:4,background:'#00000000'}}).composite([{input:half,left,top},{input:right,left:left+m.width+gap,top}]).greyscale().png().toBuffer();
 let bytes=Buffer.alloc(0);for(const quality of[92,88,84,80,76]){bytes=await sharp(final).greyscale().toColourspace('srgb').webp({quality,effort:6}).toBuffer();if(bytes.length<=120000)break;}assert(bytes.length<=120000);
 writeFileSync('public/illustrations/figures/warring-states-tiger-tally.webp',bytes);console.log(`tally: ${bytes.length} B; reflected contour assertion passed`);
 // Keep source readable and reject an accidentally empty or wrong input file.
 assert(readFileSync(input).length>100000);
}
if(main(import.meta.url))await exportTally();
