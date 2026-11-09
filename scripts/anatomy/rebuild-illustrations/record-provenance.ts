/** Fingerprint the executing studio and final GLBs used as cover backing. */
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {pathToFileURL} from 'node:url';
import {verifyRig} from '../rebuild-evidence/studio';
export function recordProvenance(revision:number){
 const fingerprint=(file:string)=>({file,bytes:fs.statSync(file).size,sha256:createHash('sha256').update(fs.readFileSync(file)).digest('hex')});
 const topics=['arms','back','chest','core','legs','shoulders'];
 fs.writeFileSync('scripts/anatomy/rebuild-illustrations/render-provenance.json',JSON.stringify({revision,studio:verifyRig(),muscleSource:fingerprint('scripts/anatomy/cache/rebuild-source.json'),bodySources:topics.map(t=>fingerprint(`public/models/muscles-${t}.glb`))},null,2)+'\n');
}
if(import.meta.url===pathToFileURL(process.argv[1]??'').href)recordProvenance(Number(process.argv[2]??18));
