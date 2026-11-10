/** New reference-guided graphite drawings, never photo-tonal tracings or accounts. */
import assert from 'node:assert/strict';
import sharp from 'sharp';
import { PRE, plate } from './space-plate';
const figures=[['n1','space-race-n1-launcher'],['saturn','space-race-saturn-v-apollo'],['skylab','space-race-skylab-research'],['three-spacecraft','space-race-three-spacecraft']] as const;
assert.equal(figures.length,4);
// Count in the caption is source data; the image contains exactly three craft.
const losses=[3,1,3];assert.equal(losses.length,3);assert.equal(losses.reduce((a,b)=>a+b),7);
// Preserve orthographic geometry; rotate only in the image plane, so the base
// does not reveal an invented engine count. Source is NASA RP1357 fig.1-13.
await sharp(`${PRE}/n1-profile.png`).rotate(48,{background:'#00000000'}).png().toFile(`${PRE}/n1.png`);
for(const [input,id]of figures)await plate(`${PRE}/${input}.png`,id);
