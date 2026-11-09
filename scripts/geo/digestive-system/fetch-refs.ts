/** Restore the development-only scientific references and exact recorded crops.
 * pnpm tsx scripts/geo/digestive-system/fetch-refs.ts
 * This is an authoring command, never imported by the static site.
 */
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';
import manifest from './reference-manifest.json';
const root=path.join(import.meta.dirname,'refs');fs.mkdirSync(root,{recursive:true});
for(const ref of manifest.references){
 const destination=path.join(root,ref.file);
 if(!fs.existsSync(destination)){
  const response=await fetch(ref.downloadUrl,{headers:{'User-Agent':'Atlas-reference-study/1.0 (offline authoring)'}});
  if(!response.ok)throw new Error(`${response.status}: ${ref.downloadUrl}`);
  fs.writeFileSync(destination,Buffer.from(await response.arrayBuffer()));
 }
 for(const crop of ref.crops){
  const [x0,y0,x1,y1]=crop.pixelBox;
  await sharp(destination).extract({left:x0!,top:y0!,width:x1!-x0!,height:y1!-y0!}).toFile(path.join(root,crop.file));
 }
}
fs.writeFileSync(path.join(root,'manifest.json'),JSON.stringify(manifest,null,2)+'\n');
