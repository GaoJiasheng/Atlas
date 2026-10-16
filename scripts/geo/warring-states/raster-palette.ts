import { readImage } from '../lib/raster';
const samples: Record<string, [number, number][]> = {qin:[[215,312],[199,312],[250,309]],zhao:[[378,206],[380,220],[399,231]],wei:[[341,267],[337,302],[367,285]],han:[[365,330],[374,329],[398,329]],qi:[[502,236],[512,243],[502,249]],chu:[[400,398],[400,409],[430,490]],yan:[[484,94],[515,101],[464,113]],yue:[[598,421],[590,406],[579,445]],song:[[514,313],[514,309],[500,305]],zhongshan:[[423,171],[420,174],[414,172]],zhou:[[403,318]],wey:[[454,269],[459,276]],_outside:[[100,400],[150,600],[350,700],[330,100]],_sea:[[650,300]]};
const image = await readImage('scripts/geo/warring-states/raw/G7.png');
for (const [name, points] of Object.entries(samples)) {
  console.log(name, points.map(([x, y]) => {
    if (x < 0 || y < 0 || x >= image.width || y >= image.height) throw new Error(`${name} sample is outside the image`);
    return Array.from(image.data.slice((y * image.width + x) * 4, (y * image.width + x) * 4 + 3));
  }));
}
