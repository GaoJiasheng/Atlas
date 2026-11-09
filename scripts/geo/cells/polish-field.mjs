/** Topic-owned synthetic onion epidermis: shared, gently undulating walls.
 * Reference morphology: OpenStax Biology 2e §4.3 and S23/S24 prepared
 * onion-bulb epidermis. This is a drawing recipe, never a micrograph or
 * measured cell size. The tracked nucleus remains exactly [200, 0, 0] µm.
 */
const round = n => Math.round(n * 1e5) / 1e5;
const PERIOD_X = 2400, PERIOD_Y = 1080, ROWS = 6, COLUMNS = 4;
// Row files of unequal height; four unequal cells per row, staggered so no end wall lines up with its neighbours'.
const ROW_Y = [-65, 105, 300, 470, 640, 835];
const STARTS = [[-100, 620, 1180, 1710], [130, 640, 1390, 1870], [-280, 300, 830, 1580], [40, 720, 1200, 1930], [-190, 270, 1010, 1560], [180, 830, 1340, 1910]];
const mod = (n, d) => ((n % d) + d) % d;
const baseY = row => ROW_Y[mod(row, ROWS)] + Math.floor(row / ROWS) * PERIOD_Y;
// Periodic in x, so tiles join; each long wall wanders on its own phase rather than running ruler-straight.
const boundaryY = (row, x) => {
  const r = mod(row, ROWS), t = 2 * Math.PI * x / PERIOD_X;
  return baseY(row) + 14 * Math.sin(t * 2 + r * 1.7) + 9 * Math.sin(t * 5 + r * 2.9) + 4 * Math.cos(t * 7 + r * .8);
};
// End walls lean: ±44 µm at the top, the opposite at the bottom.
const lean = (row, col) => ((mod(row, ROWS) * 7 + mod(col, COLUMNS) * 13) % 9 - 4) * 11;
const startX = (row, col) => STARTS[mod(row, ROWS)][mod(col, COLUMNS)] + Math.floor(col / COLUMNS) * PERIOD_X;
const endTop = (row, col) => startX(row, col) + lean(row, col);
const endBottom = (row, col) => startX(row, col) - lean(row, col);
// Both neighbouring rows use the very same vertices along a shared wall.
function boundaryPoints(row, left, right) {
  const samples = Array.from({ length: PERIOD_X / 150 }, (_, i) => i * 150);
  for (let c = 0; c < COLUMNS; c++) samples.push(mod(endBottom(row - 1, c), PERIOD_X), mod(endTop(row, c), PERIOD_X));
  const values = new Set([left, right]);
  for (const x of samples) for (let tile = -2; tile <= 2; tile++) {
    const p = x + tile * PERIOD_X;
    if (p > left && p < right) values.add(p);
  }
  return [...values].sort((a, b) => a - b).map(x => [round(x), round(boundaryY(row, x))]);
}
// One end wall, top to bottom, shared by the cells on either side.
function endWall(row, col) {
  const top = endTop(row, col), bottom = endBottom(row, col), yTop = boundaryY(row, top), yBottom = boundaryY(row + 1, bottom);
  const bow = 5 + (row * 3 + col * 5) % 9;
  return [.25, .5, .75].map(t => [round(top + (bottom - top) * t + Math.sin(Math.PI * t) * bow), round(yTop + (yBottom - yTop) * t)]);
}
function onionPattern() {
  const features = [];
  for (let row = 0; row < ROWS; row++) for (let col = 0; col < COLUMNS; col++) {
    const i = row * COLUMNS + col, id = i === 0 ? 'onion-cell' : `onion-cell-${i + 1}`;
    const top = boundaryPoints(row, endTop(row, col), endTop(row, col + 1));
    const bottom = boundaryPoints(row + 1, endBottom(row, col), endBottom(row, col + 1)).reverse();
    const absolute = [...top, ...endWall(row, col + 1), ...bottom, ...endWall(row, col).reverse()];
    const left = startX(row, col), right = startX(row, col + 1);
    // Place each outline around its own local origin, keeping values compact.
    const cx = (left + right) / 2, cy = (baseY(row) + baseY(row + 1)) / 2;
    const points = absolute.map(([x, y]) => [round(x - cx), round(y - cy)]);
    features.push({ id, kind: 'polygon', role: 'wall', atUm: [cx, cy, 0], parentCell: id, contrast: .72, pointsUm: points });
    features.push({ id: i === 0 ? 'onion-content' : `onion-content-${i + 1}`, kind: 'polygon', role: 'cytoplasm-area', atUm: [cx, cy, 0], parentCell: id, contrast: .025 + (i % 3) * .006, pointsUm: points.map(([x, y]) => [round(x * .986), round(y * .96)]) });
    features.push({ id: i === 0 ? 'onion-nucleus' : `onion-nucleus-${i + 1}`, kind: 'ellipse', role: 'nucleus', atUm: i === 0 ? [200, 0, 0] : [round(left + (right - left) * (.22 + (i * 7 % 5) * .13)), round(cy - 40 + (i * 19 % 73)), 0], parentCell: id, contrast: .66 + (i % 3) * .04, axesUm: [17 + (i * 3 % 8), 11 + (i * 5 % 6)] });
  }
  return { id: 'onion-grid', periodUm: [PERIOD_X, PERIOD_Y], originUm: [0, 0], tileRange: { x: [-2, 1], y: [-3, 3] }, features };
}
export function polishField(sim) {
  sim.microscope.patterns = sim.microscope.patterns.map(p => p.id === 'onion-grid' ? onionPattern() : p);
  return sim;
}

// Rounded polygon corners retain the shared irregular cell mosaic without
// converting the patch into repeated box outlines. All coordinates are local.
function roundedOutline(points) {
  return points.flatMap((v, i) => {
    const before = points[(i + points.length - 1) % points.length], after = points[(i + 1) % points.length];
    const enter = [v[0] + (before[0] - v[0]) * .12, v[1] + (before[1] - v[1]) * .12];
    const leave = [v[0] + (after[0] - v[0]) * .12, v[1] + (after[1] - v[1]) * .12];
    return [0, .33, .67, 1].map(t => [round((1-t)**2*enter[0]+2*t*(1-t)*v[0]+t*t*leave[0]), round((1-t)**2*enter[1]+2*t*(1-t)*v[1]+t*t*leave[1])]);
  });
}
// Remove redundant samples after rounding, retaining every significant bow
// and junction. 15 µm in this enlarged model is <0.1 px in an overview.
function simplifyContour(points,tolerance=.000015) {
  const out=points.slice();let changed=true;
  while(changed&&out.length>8){
    changed=false;
    for(let i=out.length-1;i>=0;i--){
      const a=out[(i+out.length-1)%out.length],p=out[i],b=out[(i+1)%out.length],dx=b[0]-a[0],dy=b[1]-a[1],l=dx*dx+dy*dy;
      const t=l?Math.max(0,Math.min(1,((p[0]-a[0])*dx+(p[1]-a[1])*dy)/l)):0;
      if(Math.hypot(p[0]-a[0]-t*dx,p[1]-a[1]-t*dy)<tolerance){out.splice(i,1);changed=true;}
    }
  }
  return out;
}
// Ring silhouettes already contain rounded corners. Three.js offsets of these
// tightly sampled annuli can bridge the hole when beveling; keep their annular
// faces planar and bevel only the independent solid cytoplasm reliefs.
const cellPiece = (shape, at, color, tint, holes, depth=.0024) => ({kind:'extrude',shape,depth,at,color,tint,bevel:holes?0:.00018,...(holes?{holes}:{})});
const nucleusPiece = (at, size) => ({kind:'lathe',profile:Array.from({length:19},(_,i)=>[i===0||i===18?0:Math.sin(i*Math.PI/18)*size[0]/2,-Math.cos(i*Math.PI/18)*size[1]/2]),segments:24,scale:[1,1,size[2]/size[0]],at,color:'tissue',tint:'token:neutral'});
export function polishOnionPatch(parts) {
  const patch = parts.find(p=>p.id==='onion-patch'), pieces=[];
  const recipe=onionPattern(), scale=.000065;
  // The 3D patch is the first three rows and three cells of the live field's mosaic.
  const patchWalls=recipe.features.filter(f=>f.role==='wall').slice(0,3*COLUMNS).filter((_,i)=>i%COLUMNS<3);
  for(const wall of patchWalls) {
    const shape=simplifyContour(roundedOutline(wall.pointsUm.map(([x,y])=>[x*scale,y*scale])));
    const inner=simplifyContour(shape.map(([x,y])=>[round(x*.972),round(y*.91)]));
    const at=[-.1+(wall.atUm[0]-800)*scale,.12+(wall.atUm[1]-205)*scale,0];
    pieces.push(cellPiece(shape,at,'tissue','token:food',[inner]));
    pieces.push(cellPiece(inner,[at[0],at[1],-.0009],'tissue','token:bone',undefined,.0012));
    const n=recipe.features.find(f=>f.parentCell===wall.id&&f.role==='nucleus');
    pieces.push(nucleusPiece([-.1+(n.atUm[0]-800)*scale,.12+(n.atUm[1]-205)*scale,.0011],[n.axesUm[0]*scale,n.axesUm[1]*scale,.00075]));
  }
  patch.primitive=pieces[0];patch.extra=pieces.slice(1);
  patch.detail.en='Onion bulb epidermis consists of joined plant cells. These non-photosynthetic bulb cells normally lack chloroplasts, providing a counterexample to the idea that every plant cell has chloroplasts [S23, S24].\n\nNine elongated cells form three staggered rows in this original relief. Irregular shared walls, pale cell contents and one nucleus per cell are illustration choices, not a recorded microscope image; the membrane is not separately resolved [S20].';
  patch.detail.zh='洋葱鳞茎表皮由相邻的植物细胞组成。这些不进行光合作用的鳞茎细胞通常没有叶绿体，可用来检验“所有植物细胞都有叶绿体”的说法 [S23, S24]。\n\n原创浮雕中的九个长形细胞分成三行交错排列。不规则的相邻细胞壁、浅色内部和每个细胞的一个核都是绘图选择，不是真实显微照片；这里没有把细胞膜单独分辨出来 [S20]。';
  const tissue=parts.find(p=>p.id==='tissue-patch'), tissuePieces=[];
  // Six joined epithelial profiles share a perturbed lattice: unequal corner
  // positions and bowed edges, rather than six detached identical spheres.
  const grid=Array.from({length:3},(_,y)=>Array.from({length:4},(_,x)=>[(x-1.5)*.025+(y===1?[0,.002,-.0015,0][x]:0),.12+(y-1)*.029+(x>0&&x<3?[.001,-.0015,.0018][y]:0)]));
  for(let y=0;y<2;y++)for(let x=0;x<3;x++){
    const vertices=[grid[y][x],grid[y][x+1],grid[y+1][x+1],grid[y+1][x]],cx=vertices.reduce((a,p)=>a+p[0],0)/4,cy=vertices.reduce((a,p)=>a+p[1],0)/4;
    const outline=roundedOutline(vertices.map(([px,py])=>[px-cx,py-cy]));
    const inner=outline.map(([px,py])=>[round(px*.94),round(py*.95)]),at=[cx,cy,0];
    tissuePieces.push(cellPiece(outline,at,'tissue','token:neutral',[inner],.005));
    tissuePieces.push(cellPiece(inner,[cx,cy,-.0001],'tissue','token:bone',undefined,.0048));
    tissuePieces.push(nucleusPiece([cx+(x-1)*.0012,cy+(y?-.001:.0015),.0027],[.0055+(x%2)*.0008,.007+(y%2)*.0006,.002]));
  }
  tissue.primitive=tissuePieces[0];tissue.extra=tissuePieces.slice(1);
  tissue.detail.en='A tissue is an organised group of cells working together. Tissues make up organs; an organ is not one giant cell [S3].\n\nSix fitted cell profiles with visible nuclei form this original explanatory relief. Their outlines, colours and separate scale are design choices, not a microscopic observation or a claim that every tissue contains six cells [S20].';
  tissue.detail.zh='组织是协同工作的细胞所组成的结构；组织构成器官，器官不是一个巨大的细胞 [S3]。\n\n原创说明浮雕由六个相互贴合、带有可见细胞核的细胞轮廓组成。形状、颜色与独立尺度都是设计选择，不是显微观察，也不表示每种组织只有六个细胞 [S20]。';
  return parts;
}
