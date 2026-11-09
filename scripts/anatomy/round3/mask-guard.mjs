/** Asset-build guard; checks the exact skinFaces consumed by the GLB writer. */
import fs from 'node:fs/promises';
import YAML from 'yaml';
export async function assertLabelledExerciseMasks(topic, project) {
 const directory=`src/content/topics/muscles-${topic}`,parts=JSON.parse(await fs.readFile(`${directory}/data/parts.json`,'utf8')).parts;
 for(const file of await fs.readdir(`${directory}/chapters`)){
  if(!file.endsWith('.mdx'))continue;
  const chapter=YAML.parse((await fs.readFile(`${directory}/chapters/${file}`,'utf8')).split('---')[1]);
  for(const beat of chapter.state?.beats??[])if(beat.exercise)for(const id of beat.labels??[]){
   const part=parts.find(p=>p.id===id);if(!part?.muscle)continue;
   for(const node of [part.mesh,...part.bilateral?.mesh?[part.bilateral.mesh]:[]])if(!(project[node]?.skinFaces.length>0))throw Error(`Refusing muscles-${topic} asset build: labelled exercise muscle ${id}/${node} has zero skinFaces`);
  }
 }
}
