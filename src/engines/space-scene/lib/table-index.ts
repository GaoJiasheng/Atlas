import type {PartsFile,SpaceChapterState} from '../schema';
import {resolveSimValues} from './sim/controls';
import {simEffects} from './sim/bind';
import {evaluateSim} from './sim/runtime';
export function tableIndexBeat(state:SpaceChapterState|undefined,file:PartsFile,id:string):number|null {
 const part=file.parts.find(p=>p.id===id);if(!state||!part||file.sim?.kind!=='table')return null;
 const candidates=(state.beats??[]).map((beat,index)=>({beat,index}));
 candidates.sort((a,b)=>Number(b.beat.part===id||b.beat.labels?.includes(id))-Number(a.beat.part===id||a.beat.labels?.includes(id)));
 for(const {beat,index}of candidates){
  const values=resolveSimValues(file.sim,{...state.sim?.set,...beat.sim?.set}),effects=simEffects(file.sim,values,evaluateSim(file.sim,values));
  const layers=beat.layers??state.layers??file.groups.map(g=>g.id),hidden=beat.hide??state.hide??[];
  if(!effects.hidden.has(id)&&!hidden.includes(id)&&(part.group===undefined||layers.includes(part.group)))return index;
 }
 return null;
}
