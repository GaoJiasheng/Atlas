/** Regenerate original terminal geometry; metres, Y up, sea -Z.
 * parts-template.json is the unchanged authored lesson/solver contract.
 * No reference photo, remote model, or build-only kit reaches the runtime.
 * Run: pnpm tsx scripts/geo/container-port/build-parts.ts
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { partsFile } from '../../../src/engines/space-scene/schema';
import { box, rounded, cyl, fins, ISO, isoContainer, containerDetails, workingContainer, workingCorners, shipHull, shipDeck, shipCargo, shipBridge, agvBody, agvWheels, stsPortal, stsBoom, stsBogies, stsTrolley, telescopicSpreader, rtgFrame, rtgTrolley, type P } from '../kits/port';
const data=JSON.parse(readFileSync('scripts/geo/container-port/parts-template.json','utf8'));
const hull=shipHull();
const onward=[...shipHull([48,7,-55],90,22),...shipBridge(14,7,-55)];
// Scale the complete accommodation, including deck heights and window spacing.
for(const p of onward.slice(4)) {
 const at=p.at as number[];p.at=[14+(at[0]!-14)*.65,7+(at[1]!-7)*.65,-55+(at[2]!+55)*.65];
 p.scale=[.65,.65,.65];
}
const lockModel=[cyl(.08,.35,[0,12.65,-19.1]),box([.32,.12,.16],[0,12.53,-19.1]),cyl(.08,.35,[0,12.65,-16.9]),box([.32,.12,.16],[0,12.53,-16.9])];
// Neutral paint follows the bright cinema UI ink. Actual paving instead uses
// matte mineral finishes and restrained physical-value tokens in both themes.
type V=[number,number,number];
const concrete=(size:V,at:V):P=>({...box(size,at,'abrasive'),tint:'token:mannequin'});
// The stock abrasive preset is a stable charcoal mineral value (#5f574e /
// #6b6359), unlike UI grey tokens that invert or lift strongly in cinema.
const asphalt=(size:V,at:V):P=>box(size,at,'abrasive');
const paving:P[]=[concrete([200,1,64],[0,-.5,32]),asphalt([200,.024,40],[0,.012,44])];
// Saw-cut apron joints, 45 mm wide; no raised decorative grid. One merged
// material slot, clear of the four crane running rails and the AGV load path.
for(let x=-90;x<=90;x+=10)paving.push(asphalt([.045,.006,24],[x,.003,12]));
for(const z of [8,16])paving.push(asphalt([200,.006,.045],[0,.003,z]));
const geometry:Record<string,P[]>={
 'ship-hull':hull,'ship-deck':shipDeck(),'ship-bridge':shipBridge(),'ship-cargo':shipCargo(),
 portal:stsPortal(),'rail-bogies':stsBogies(),'crane-rails':[1.2,2.8,21.2,22.8].map(z=>box([190,.12,.3],[0,.1,z])),
 'crane-boom':stsBoom(),trolley:stsTrolley(),spreader:telescopicSpreader([0,12.891,-18]),twistlocks:lockModel,
 'working-box':workingContainer(),'corner-fittings':workingCorners(),
 'sample-20':[isoContainer(ISO.twenty,[-5,1.2955,2])],'sample-40':[isoContainer(ISO.forty,[5,1.2955,2])],
 'agv-body':agvBody(),'agv-wheels':agvWheels(),'yard-gantry':rtgFrame(),'yard-trolley':rtgTrolley(),
 'yard-slot':[box([7,.08,.1],[28,.04,38.5]),box([7,.08,.1],[28,.04,41.5]),box([.1,.08,3],[24.5,.04,40]),box([.1,.08,3],[31.5,.04,40]),box([7,.08,.1],[38,.04,38.5]),box([7,.08,.1],[38,.04,41.5]),box([.1,.08,3],[34.5,.04,40]),box([.1,.08,3],[41.5,.04,40])],
 'onward-ship':onward,
 'destination-box':[isoContainer(ISO.twenty,[-25,1.2955,38],false,'powder',true),...containerDetails(ISO.twenty,[-25,1.2955,38])],
 'control-room':[rounded([11,7,9],[-30,3.5,48],.12,'enamel'),box([12,.6,10],[-30,7.3,48]),box([9,1.3,.12],[-30,5.5,52.55],'powder'),fins([.12,1.5,.12],8,1,'x',[-30,5.5,52.65],'enamel')],
 'quay-context':paving,
 // Topic primitives do not accept texture paths, and the GLB source surface
 // bridge clears normal maps. Use the permitted data-only fallback: a satin
 // nonmetal surface, rather than reflective brushed aluminium masquerading
 // as sea. A dedicated ripple normal still needs an engine capability.
 'water-context':[{kind:'plane',size:[240,90],rotation:[-90,0,0],at:[0,-.85,-45],color:'enamel',tint:'token:cold'}],
};
for(const id of ['a','b','c','d'])geometry[`rope-${id}`]=[cyl(.055,1,[0,0,0])];
for(const [id,y] of [['yard-target',1.2955],['yard-blocker-a',3.8865],['yard-blocker-b',6.4775]] as const) geometry[id]=[isoContainer(ISO.twenty,[18,y,40],false,'powder',true),...containerDetails(ISO.twenty,[18,y,40])];
for(const p of data.parts) {
 const model=geometry[p.id];
 if(!model?.length)throw new Error(`Missing model: ${p.id}`);
 p.primitive=model[0]; if(model.length>1)p.extra=model.slice(1);
 if(['sample-20','sample-40'].includes(p.id))p.repeat={count:4,axis:[0,0,1],spacing:3.3};
 if(['ship-cargo','ship-deck'].includes(p.id))p.repeat={count:10,axis:[1,0,0],spacing:12.5};
 if(p.id==='twistlocks')p.repeat={count:2,axis:[1,0,0],spacing:5.8};
}
// Topic-owned cameras adapt to the longer true-proportion vessel; no engine framing edits.
const hero={position:[165,120,175],target:[0,23,-4],fov:34};
data.views.assembled.camera=hero;data.views.cover=hero;
for(const p of data.presets)if(['hero','network','tuas'].includes(p.id))p.camera=hero;
partsFile.parse(data);
writeFileSync('src/content/topics/container-port/data/parts.json',JSON.stringify(data,null,2)+'\n');
console.log(`container-port: ${data.parts.filter((p:P)=>!p.context).length} parts + 2 context; schema valid`);
