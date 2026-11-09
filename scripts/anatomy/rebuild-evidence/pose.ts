/** Exercise-independent deformation check through the engine's actual axis
 * conversion and right-side mirror convention. No contact solver claim. */
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {loadTopic,render,bounds} from './studio';
const phase=process.argv[2]??'final';
const pose={'shoulder.l':{flexion:90},'elbow.r':{flexion:90},'hip.l':{flexion:60},'knee.r':{flexion:90},'ankle.l':{dorsiflexion:15},'ankle.r':{dorsiflexion:15}};
const manifest=[];const poses:Record<string,unknown>={},assetHashes:Record<string,string>={};
for(const topic of (process.env.MUSCLES_TOPICS?.split(',')??['arms','back','chest','core','legs','shoulders'])){
 assetHashes[topic]=createHash('sha256').update(fs.readFileSync(`public/models/muscles-${topic}.glb`)).digest('hex');
 const actual=JSON.parse(fs.readFileSync(`src/content/topics/muscles-${topic}/data/parts.json`,'utf8'));const available=Object.fromEntries(Object.entries(pose).filter(([name])=>actual.rig?.joints?.[name]));poses[topic]=available;
 const body=await loadTopic(topic,false,'paper','body',available);
 for(const angle of [0,35,90]){
  const file=`scripts/anatomy/rebuild-evidence/comparisons/${phase}/${topic}-pose-${angle}.png`;
  manifest.push(await render(body,file,{angle}));
 }
 const b=bounds(body);if(b.isEmpty()||[...b.min.toArray(),...b.max.toArray()].some(x=>!Number.isFinite(x)))throw Error(`${topic}: nonfinite pose bounds`);
 console.log(topic,'pose bounds',b.min.toArray(),b.max.toArray());
}
fs.writeFileSync(`scripts/anatomy/rebuild-evidence/comparisons/${phase}/pose-manifest.json`,JSON.stringify({poses,assetHashes,renderer:'Executing topic-data joint specs and supported subset; same anglesQuat/foldAngles/mirrorSignedAxes and parent-rest conversion as MotionDriver',limits:'Checks the common asymmetric deformation pose. Held-object contact and runtime procedural hands remain GPU/patch acceptance.',shots:manifest},null,2)+'\n');
