/** Tiny per-region roughness mask, prepared for the loader's atlasRoughness opt-in.
 * It uses a second UV channel: neither the authored coat charts nor pile maps change.
 */
import sharp from 'sharp';
import type {Document} from '@gltf-transform/core';
export async function batRoughness(doc:Document){
 const png=await sharp(Buffer.from([235,235,235,20,20,20]),{raw:{width:2,height:1,channels:3}}).png().toBuffer();
 const texture=doc.createTexture('bat-coat-cornea-roughness').setMimeType('image/png').setImage(png);
 const material=doc.createMaterial('fruit-bat-finish').setBaseColorFactor([1,1,1,1]).setRoughnessFactor(.96).setMetallicFactor(0).setMetallicRoughnessTexture(texture).setExtras({atlasRoughness:true});
 material.getMetallicRoughnessTextureInfo()!.setTexCoord(1);
 return material;
}
