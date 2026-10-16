import fs from 'node:fs';import sharp from 'sharp';import {readImage,classify,fillUnknown,majority,absorbSmall} from '../lib/raster';
const file='scripts/geo/warring-states/raster-manifest.json';const manifest=JSON.parse(fs.readFileSync(file,'utf8'));
const samples:any={qin:[[215,312],[199,312],[250,309]],zhao:[[378,206],[380,220],[399,231]],wei:[[341,267],[337,302],[367,285]],han:[[365,330],[374,329],[398,329]],qi:[[502,236],[512,243],[502,249]],chu:[[400,398],[400,409],[430,490]],yan:[[484,94],[515,101],[464,113]],yue:[[598,421],[590,406],[579,445]],song:[[514,313],[514,309],[500,305]],zhongshan:[[423,171],[420,174],[414,172]],zhou:[[403,318]],wey:[[454,269],[459,276]],_outside:[[100,400],[150,600],[350,700],[330,100]],_sea:[[650,300]]};
const img=await readImage('scripts/geo/warring-states/raw/G7.png');
for(const [n,ps]of Object.entries(samples)as any){console.log(n,ps.map(([x,y]:any)=>Array.from(img.data.slice((y*img.width+x)*4,(y*img.width+x)*4+3))))}
