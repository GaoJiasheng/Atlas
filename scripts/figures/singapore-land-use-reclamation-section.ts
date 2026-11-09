/** Original reclamation section retained, with only a local horseshoe cavern edit. */
import assert from 'node:assert/strict';
import {pathToFileURL} from 'node:url';
import sharp from 'sharp';
import {asset,figure} from './round2-io';
export const layers={fill:[145,340],clay:[340,520],rock:[520,783]} as const;
/** The rendered cavern patch is scaled about its floor centre so that a thick
 * band of rock lies between the clay and the cavern roof (acceptance 2026-11-09). */
export const patch={k:.8,cx:602,cy:762} as const;
const placed=`translate(${patch.cx*(1-patch.k)} ${patch.cy*(1-patch.k)}) scale(${patch.k})`;
export const cavern={x:420,y:584,w:363,h:178,floor:762};
/** Feathered horseshoe mask hugging the cavern rim, so no patch edge shows in the rock. */
export const editMask=`<defs><filter id="feather" x="-10%" y="-10%" width="120%" height="120%"><feGaussianBlur stdDeviation="5"/></filter></defs><path filter="url(#feather)" d="M398 776V676A204 116 0 0 1 806 676V776Z" fill="white"/>`;
export function assertSection():void {
 assert.equal(layers.fill[1],layers.clay[0]);assert.equal(layers.clay[1],layers.rock[0]);
 assert(cavern.y-layers.rock[0]>=60,'thick rock cover above the cavern roof');assert(cavern.floor<layers.rock[1]);
 assert(cavern.w>cavern.h*2,'wide storage cavern, not circular pipe');
 assert(cavern.w*420/1200>=40&&cavern.h*420/1200>=40);
 assert(cavern.y+cavern.h===cavern.floor,'flat floor inside rock');
}
export async function editedSection():Promise<Buffer>{
 const edit=await sharp(asset('reclamation-edit.png')).resize(1200,900,{fit:'fill'}).png().toBuffer();
 const scaled=await sharp(Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="900"><image href="data:image/png;base64,${edit.toString('base64')}" width="1200" height="900" transform="${placed}"/></svg>`)).png().toBuffer();
 // Opaque rock patch laid over the original through the feathered matte: inside
 // the matte it replaces the old tunnel; in the feather it blends rock into rock.
 const matte=Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="900">${editMask}</svg>`);
 const piece=await sharp(scaled).modulate({saturation:0}).composite([{input:matte,blend:'dest-in'}]).png().toBuffer();
 return sharp(asset('reclamation-original.webp')).composite([{input:piece}]).png().toBuffer();
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){assertSection();await figure('public/illustrations/figures/singapore-land-use-reclamation-section.webp',await editedSection());}
