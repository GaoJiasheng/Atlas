/** Geometry deformation gate: orientation of faces against the posed smooth
 * normal field, and edge stretch. Bounds alone cannot catch joint inversions. */
import fs from 'node:fs';
import {Vector3} from 'three';
import {loadTopic} from './studio';
const pose={'shoulder.l':{flexion:90},'elbow.r':{flexion:90},'hip.l':{flexion:60},'knee.r':{flexion:90},'ankle.l':{dorsiflexion:15},'ankle.r':{dorsiflexion:15}};
const rows=[];
for(const topic of (process.env.MUSCLES_TOPICS?.split(',')??['arms','back','chest','core','legs','shoulders'])){
 const actual=JSON.parse(fs.readFileSync(`src/content/topics/muscles-${topic}/data/parts.json`,'utf8'));const available=Object.fromEntries(Object.entries(pose).filter(([name])=>actual.rig?.joints?.[name]));
 const rest=await loadTopic(topic,false,'paper','body'),posed=await loadTopic(topic,false,'paper','body',available);
 let invertedArea=0,area=0,flipped=0,maxEdgeStretch=0;const ratios:number[]=[];const locations:{area:number;rest:number[];surface:string}[]=[];const breakdown:Record<string,{area:number;invertedArea:number;flipped:number;ratios:number[]}>= {};const rig=JSON.parse(fs.readFileSync(`scripts/anatomy/${topic}/rig.json`,'utf8'));const sourceY=(rig.sourceCentre??rig.sourceChestCentre)[2];
 const a=new Vector3(),b=new Vector3(),c=new Vector3(),normal=new Vector3(),temp=new Vector3();
 for(let s=0;s<rest.length;s++){
  const R=rest[s]!.positions,P=posed[s]!.positions,N=posed[s]!.normals;
  for(let i=0;i<P.length;i+=9){
   a.fromArray(P,i);b.fromArray(P,i+3);c.fromArray(P,i+6);const face=b.sub(a).cross(c.sub(a)),weight=face.length()/2;
   const centre=[0,1,2].map(k=>(R[i+k]!+R[i+3+k]!+R[i+6+k]!)/3);const region=rest[s]!.id.startsWith('skin-hand')?'hand':centre[1]!+sourceY<.16?'foot':centre[1]!+sourceY<.99?'hip-leg':'trunk-arm';const key=rest[s]!.id+'/'+region;const bucket=breakdown[key]??={area:0,invertedArea:0,flipped:0,ratios:[]};bucket.area+=weight;
   normal.fromArray(N,i).add(temp.fromArray(N,i+3)).add(temp.fromArray(N,i+6)).normalize();
   area+=weight;if(face.clone().normalize().dot(normal)<-.1){invertedArea+=weight;flipped++;bucket.invertedArea+=weight;bucket.flipped++;locations.push({area:weight,rest:centre,surface:key});}
   for(const [j,k] of [[0,3],[3,6],[6,0]] as const){const before=a.fromArray(R,i+j).distanceTo(b.fromArray(R,i+k));if(before<.001)continue;const after=a.fromArray(P,i+j).distanceTo(b.fromArray(P,i+k)),ratio=after/before;ratios.push(ratio);bucket.ratios.push(ratio);maxEdgeStretch=Math.max(maxEdgeStretch,ratio);}
  }
 }
 ratios.sort((a,b)=>a-b);const row={topic,pose:available,invertedFaces:flipped,invertedAreaFraction:invertedArea/area,p99EdgeStretch:ratios[Math.floor(ratios.length*.99)],maxEdgeStretch,breakdown:Object.fromEntries(Object.entries(breakdown).map(([key,b])=>{b.ratios.sort((a,b)=>a-b);return[key,{areaM2:b.area,invertedAreaFraction:b.invertedArea/b.area,invertedFaces:b.flipped,p99EdgeStretch:b.ratios[Math.floor(b.ratios.length*.99)]}]})),largestInvertedFaces:locations.sort((a,b)=>b.area-a.area).slice(0,15)};rows.push(row);console.log(JSON.stringify(row));
}
fs.writeFileSync(process.argv[2]??'scripts/anatomy/rebuild-evidence/pose-metrics.json',JSON.stringify({method:'Face winding versus the posed smooth-normal field; edges longer than 1 mm; no GPU or contact acceptance implied',rows},null,2)+'\n');
