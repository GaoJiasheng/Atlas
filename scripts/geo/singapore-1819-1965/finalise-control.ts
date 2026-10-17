/** Restore topic uncertainty metadata after shared simplification, and verify exact holds.
 * This does not simplify, clip, repair, quantise, or redraw geometry.
 */
import { resolve } from 'node:path';
import { readJson, writeJson } from '../lib/common';
const dir=resolve(import.meta.dirname);
const path=resolve(dir,'../../../src/content/topics/singapore-1819-1965/data/control.json');
type Geometry={properties?:{src?:string[];label?:{en?:string};certainty?:string};[key:string]:unknown};
type ObjectLayer={geometries:Geometry[]};
const data=readJson<{topology:{objects:Record<string,ObjectLayer>};keyframes:unknown[]}>(path);
const manifest=readJson<{keyframes:{id:string;hold?:string}[]}>(`${dir}/sources.json`);
let approximate=0;
for(const frame of manifest.keyframes){
 const object=data.topology.objects[frame.id];
 if(!object)throw Error(`Missing ${frame.id}`);
 for(const geometry of object.geometries){
  const props=geometry.properties;
  if(!props)throw Error(`${frame.id}: missing properties`);
  if(props.src?.some(s=>['G1','G23','G30','G34'].includes(s))||props.label?.en?.includes('approximate')){
   props.certainty='approximate';approximate++;
  }
 }
 if(frame.hold){
  const predecessor=data.topology.objects[frame.hold];
  if(!predecessor)throw Error(`Missing hold predecessor ${frame.hold}`);
  if(JSON.stringify(object.geometries)!==JSON.stringify(predecessor.geometries)){
   throw Error(`${frame.id}: shared simplification changed an exact hold of ${frame.hold}`);
  }
 }
}
writeJson(path,data);
console.log(`Restored approximate metadata on ${approximate} features; six exact hold pairs verified.`);
