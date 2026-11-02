/** Find a visible authored explanation, without carrying hidden state across beats. */
import type { PartsFile, SpaceChapterState } from '../schema';
export function microscopeIndexBeat(state:SpaceChapterState|undefined,file:Pick<PartsFile,'parts'|'groups'>,id:string):number|null {
 const part=file.parts.find(p=>p.id===id);if(!state||!part)return null;
 const index=state.beats?.findIndex(b=>{
  const hidden=b.hide??state.hide??[],layers=b.layers??state.layers??file.groups.map(g=>g.id);
  return (b.part===id||b.labels?.includes(id))&&!hidden.includes(id)&&(part.group===undefined||layers.includes(part.group));
 });
 return index!==undefined&&index>=0?index:null;
}
