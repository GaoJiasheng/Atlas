/** Authored topic cameras and visibility, consumed by the shared HUD fitter. */
import fs from 'node:fs';
import { parse, stringify } from 'yaml';
const root='src/content/topics/coral-reef/chapters/';
// The separated study platforms lie along X. Constrain subject cameras to
// the target's YZ plane so a distant platform never straddles the eye plane
// and forces the shared HUD fitter into a stage-wide pullback.
const camera=(position:number[],target:number[],fov=30)=>({position:[target[0],position[1],position[2]],target,fov});
const front=(file:string,edit:(data:any)=>void)=>{
  const path=root+file,text=fs.readFileSync(path,'utf8'),pieces=text.split(/^---$/m);
  const data=parse(pieces[1]!);edit(data);
  fs.writeFileSync(path,`---\n${stringify(data,{lineWidth:0})}---${pieces.slice(2).join('---')}`);
};
const overhead=camera([5.32,1.55,.93],[5,.40,0]);
front('01-coral-and-partners.mdx',d=>{
  d.state.hide=['larva-inset'];d.state.camera=overhead;
  d.state.beats[1].camera=camera([5.24,1.55,.70],[5,.43,0]);
  d.state.beats[2].camera=camera([5.65,.98,1.32],[5,.31,0]);
  d.state.beats[3].camera=camera([5.53,1.04,1.22],[5,.33,0]);
});
const flatHide=['reef-crest','reef-slope','colony-sheet','colony-encrusting'];
const crestHide=['reef-flat','reef-slope','colony-boulder','colony-tissue','colony-encrusting','refuge-cavity'];
const slopeHide=['reef-flat','reef-crest','colony-boulder','colony-tissue','colony-sheet','refuge-cavity'];
const lightHide=['nursery-frame','nursery-fragments','monitoring-quadrat','sediment-deposit'];
front('02-reef-zones.mdx',d=>{
  d.state.camera=camera([-.55,.88,2.05],[-1,-.20,0]);
  const b=d.state.beats;
  b[0].camera=camera([-.65,.94,1.96],[-1,-.20,0]);b[0].hide=[...flatHide,'substrate-context'];
  b[1].camera=camera([.38,1.05,1.90],[-.12,-.12,0]);b[1].hide=[...crestHide,'substrate-context'];
  b[2].camera=camera([1.72,.78,2.08],[.86,-.39,0]);b[2].hide=[...slopeHide,'substrate-context'];
  b[3].camera=camera([14.95,.82,3.5],[14.95,.5,0]);b[3].hide=[...lightHide,'depth-crest-band','depth-slope-mark'];
  b[4].camera=camera([14.95,.82,3.5],[14.95,.5,0]);b[4].hide=lightHide;
});
front('03-structures-and-feeding.mdx',d=>{
  d.state.camera=overhead;d.state.hide=['larva-inset'];const b=d.state.beats;
  b[0].camera=overhead;
  b[1].camera=camera([5.24,1.55,.70],[5,.43,0]);
  // A steep view shows all three colony forms with the substrate as context.
  b[2].camera=camera([.65,2.05,2.15],[-.12,-.02,0]);
  b[3].camera=camera([-.91,-.20,1.26],[-1.12,-.29,.25]);
  b[3].hide=[...flatHide,'colony-boulder','colony-tissue','substrate-context'];
  b[4].camera=camera([5.89,.5,.88],[5.62,.21,.04]);
  b[4].hide=['polyp-tissue','polyp-mouth','polyp-tentacles','polyp-skeleton','polyp-symbionts','inset-base'];
});

front('06-bleaching-and-pressures.mdx',d=>{d.state.camera=camera([5,1.30,1.48],[5,.36,0]);});
