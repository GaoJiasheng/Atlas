/** Read the actual decoded shipped candidate rather than a token/constant gate. */
import fs from 'node:fs';
import {NodeIO} from '@gltf-transform/core';
import {ALL_EXTENSIONS} from '@gltf-transform/extensions';
import {dequantize} from '@gltf-transform/functions';
import {MeshoptDecoder} from 'meshoptimizer';
import {Vector3,Matrix4,Color} from 'three';
await MeshoptDecoder.ready;
const doc=await new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({'meshopt.decoder':MeshoptDecoder}).read('scripts/geo/forces/evidence/forces-hardware.glb');await doc.transform(dequantize());
const node=doc.getRoot().listNodes().find(n=>n.getName()==='brake-caliper')!,prim=node.getMesh()!.listPrimitives()[0]!,p=prim.getAttribute('POSITION')!,c=prim.getAttribute('COLOR_0')!,w=new Matrix4().fromArray(node.getWorldMatrix()),rubber=new Color('#1e1f20');let inner=Infinity;
for(let i=0;i<p.getCount();i++){const co=c.getElement(i,[0,0,0]);if(Math.hypot(co[0]!-rubber.r,co[1]!-rubber.g,co[2]!-rubber.b)>.005)continue;const v=new Vector3(...p.getElement(i,[0,0,0]) as [number,number,number]).applyMatrix4(w);if(v.y>.458&&v.y<.469)inner=Math.min(inner,Math.abs(v.z+.12));}
const data=JSON.parse(fs.readFileSync('src/content/topics/forces/data/parts.json','utf8')),light=data.poses['brake-light']['brake-caliper'].scale[2],firm=data.poses['brake-firm']['brake-caliper'].scale[2],rim=.0095;
const report={source:'decoded candidate POSITION/COLOR_0 attributes and actual runtime pose data',restInnerPadMm:inner*1000,rimHalfWidthMm:rim*1000,lightScale:light,lightGapMm:(inner*light-rim)*1000,firmScale:firm,firmGapMm:(inner*firm-rim)*1000};
if(!Number.isFinite(inner)||report.lightGapMm> .16||report.firmGapMm> .03||report.firmGapMm<-.2)throw Error('Decoded brake pads miss rim contact tolerance');
fs.writeFileSync('scripts/geo/forces/hardware-pad-audit.json',JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report,null,2));
