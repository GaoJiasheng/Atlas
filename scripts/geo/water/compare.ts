/** Build honest render | photographic-reference evidence sheets.
 * Usage: pnpm tsx scripts/geo/water/compare.ts round2
 * Consumes existing offline studio previews; does not render or download images.
 */
import fs from 'node:fs';
import path from 'node:path';
import sharp, { type OverlayOptions } from 'sharp';

const root = path.resolve('scripts/geo/water');
const output = process.env.ATLAS_PREVIEW_OUT??path.join(root, 'comparisons');
const prefix = process.argv[2] ?? 'round1';
const displayPrefix=process.env.ATLAS_COMPARE_LABEL??prefix;
if (!/^[a-zA-Z0-9_-]+$/.test(prefix)) throw new Error('Expected a simple preview prefix, for example round2.');

interface Reference {
  filename: string;
  title: string;
  url: string;
  author: string;
  license: string;
}
const references = JSON.parse(fs.readFileSync(path.join(root, 'reference-manifest.json'), 'utf8')) as Reference[];
type Family = 'cumulus' | 'rain-cloud' | 'forest' | 'city' | 'hdb' | 'barrage' | 'green-roof' | 'urban-tree' | 'emergent' | 'angsana';
type View = 'front' | 'three-quarter' | 'profile' | 'detail';
interface Pair { reference: string; angle: string; custom?: string }
const views: View[] = ['front', 'three-quarter', 'profile', 'detail'];
const families: Record<Family, Record<View, Pair>> = {
  emergent: {
   front:{reference:'tree-rainforest-gardens',angle:'Low front tree architecture; rainforest interior with real adjoining stems.'},
   'three-quarter':{reference:'tree-rainforest-gardens',angle:'Low oblique tree architecture; different individual within the Singapore rainforest.'},
   profile:{reference:'tree-rainforest',angle:'Lateral branch / stem profile; ground-level forest interior.'},
   detail:{reference:'tree-rainforest-gardens',angle:'Terminal broadleaf clusters and tapered crown branching.'},
  },
  angsana: {
   front:{reference:'tree-angsana',angle:'Front crown habit; road-side Singapore specimen.'},
   'three-quarter':{reference:'tree-angsana',angle:'Low oblique crown habit, drooping outer shoots.'},
   profile:{reference:'tree-angsana-branch',angle:'Low side view of branch architecture; different tree instance.'},
   detail:{reference:'tree-angsana-branch',angle:'Drooping leafy branches and supported terminal sprays.'},
  },
  'urban-tree': {
    front: { reference: 'tree-rain-faber', angle: 'Low frontal tree habit, with adjoining HDB estate retained for scale.' },
    'three-quarter': { reference: 'tree-rain-faber', angle: 'Low three-quarter tree habit; different specimen and schematic size.' },
    profile: { reference: 'tree-rain-branch', angle: 'Low branch architecture; unequal real specimen, not a copied pose.' },
    detail: { reference: 'tree-rain-branch', custom: 'urban-tree-detail', angle: 'Branch junction and supported foliage close-up; different specimen.' },
  },
  cumulus: {
    front: { reference: 'cloud-panorama', angle: 'Closest available ground-level broadside; cloud field, not a registered individual.' },
    'three-quarter': { reference: 'cloud-panorama', angle: 'Closest available oblique cloud field; elevation differs.' },
    profile: { reference: 'cloud-cumulus', angle: 'Closest low profile / underside; separate cloud specimen.' },
    detail: { reference: 'cloud-rain-tower', angle: 'Cauliflower detail reference; taller related convective cloud.' },
  },
  'rain-cloud': {
    front: { reference: 'cloud-cumulus', angle: 'Closest available dark-base broadside; separate cloud specimen.' },
    'three-quarter': { reference: 'cloud-cumulus', angle: 'Low cloud-bank broadside with coherent underside; closest available elevation.' },
    profile: { reference: 'cloud-panorama', angle: 'Closest available broadside cloud-bank silhouette; elevation differs.' },
    detail: { reference: 'cloud-rain-tower', angle: 'Lobe and coherent dark-base detail; separate cloud specimen.' },
  },
  forest: {
    front: { reference: 'tree-rainforest-gardens', angle: 'Ground-level frontal forest grouping; different Singapore rainforest specimens.' },
    'three-quarter': { reference: 'tree-rainforest-gardens', angle: 'Ground-level oblique forest grouping; irregular layered crowns and clear stems.' },
    profile: { reference: 'tree-rainforest', angle: 'Rainforest stem and layered foliage reference at low elevation.' },
    detail: { reference: 'tree-rainforest-gardens', custom:'forest-interior',angle:'Under-canopy view with foliage and attached lower shoots; different forest grouping.' },
  },
  city: {
    front: { reference: 'hdb-slab', angle: 'Low frontal slab-block facade; reference is low oblique.' },
    'three-quarter': { reference: 'hdb-estate', angle: 'Closest available elevated estate massing; buildings are different specimens.' },
    profile: { reference: 'hdb-point', angle: 'Low lateral estate view; point-block reference is low three-quarter.' },
    detail: { reference: 'hdb-point', custom:'city-point-detail', angle: 'Point-block wings / window-band reference; photo is from below.' },
  },
  hdb: {
    front: { reference: 'hdb-slab', angle: 'Closest available corridor facade; photo is low three-quarter, model frontal.' },
    'three-quarter': { reference: 'hdb-slab', angle: 'Closest available slab-block three-quarter; photo elevation is lower.' },
    profile: { reference: 'hdb-slab', angle: 'Closest available slab end-wall / stair-core reference; photo is low three-quarter.' },
    detail: { reference: 'hdb-void-deck', custom: 'hdb-void-deck', angle: 'Void-deck opening / column detail; closest available interior angle.' },
  },
  barrage: {
    front: { reference: 'barrage-gates', angle: 'Closest available crest-gate broadside; reference is oblique and slightly elevated.' },
    'three-quarter': { reference: 'barrage-aerial', angle: 'Closest available elevated barrage three-quarter; photo includes building context.' },
    profile: { reference: 'barrage-gates', angle: 'Closest available low bridge profile; reference is oblique.' },
    detail: { reference: 'barrage-gates', custom: 'gates-detail', angle: 'Crest-gate panel / pier detail; closest available low oblique photo.' },
  },
  'green-roof': {
    front: { reference: 'barrage-building', angle: 'Closest available low waterfront building profile; photographed facade differs.' },
    'three-quarter': { reference: 'barrage-aerial', angle: 'Closest available elevated building three-quarter; context retained.' },
    profile: { reference: 'barrage-building', angle: 'Closest available low building profile; reference is waterfront facade.' },
    detail: { reference: 'barrage-roof-aerial', custom: 'green-roof-aerial', angle: 'Closest available roof / courtyard aerial; azimuth and elevation differ.' },
  },
};

const escape = (text: string) => text.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' })[c]!);
function wrap(text: string, maximum: number): string[] {
  const lines: string[] = [];
  for (const word of text.split(/\s+/)) {
    if (!lines.length || lines[lines.length - 1]!.length + word.length + 1 > maximum) lines.push(word);
    else lines[lines.length - 1] += ` ${word}`;
  }
  return lines;
}
function label(width: number, height: number, lines: string[], fontSize = 18): Buffer {
  return Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}"><rect width="100%" height="100%" fill="#e9e4d8"/>${lines.map((line, i) => `<text x="18" y="${fontSize + 10 + i * (fontSize + 7)}" font-family="sans-serif" font-size="${fontSize}" fill="#302e28">${escape(line)}</text>`).join('')}</svg>`);
}
function referenceFor(stem: string): Reference {
  const item = references.find(r => path.basename(r.filename, path.extname(r.filename)) === stem);
  if (!item) throw new Error(`No manifest reference for ${stem}`);
  return item;
}
function renderPath(family: Family, view: View): string {
  const custom = families[family][view].custom;
  const preferred = custom && path.join(output, `${prefix}-${custom}.png`);
  const filename = preferred && fs.existsSync(preferred) ? preferred : path.join(output, `${prefix}-${family}-${view}.png`);
  if (!fs.existsSync(filename)) throw new Error(`Preview missing: ${filename}. Run preview.ts first.`);
  return filename;
}
async function panel(filename: string, width: number, height: number): Promise<Buffer> {
  // Contain preserves the full source; no cropping or geometry-changing registration.
  return sharp(filename).rotate().resize(width, height, { fit: 'contain', background: '#e9e4d8' }).removeAlpha().png().toBuffer();
}

const selected=(process.env.ATLAS_COMPARE_FAMILIES?.split(',')??Object.keys(families)) as Family[];
const cellWidth = 800, imageHeight = 520, headingHeight = 52, footerHeight = 142;
const rowHeight = headingHeight + imageHeight + footerHeight;
for (const family of selected) {
  const layers: OverlayOptions[] = [];
  for (const [index, view] of views.entries()) {
    const pair = families[family][view], ref = referenceFor(pair.reference), y = index * rowHeight;
    layers.push({ input: label(cellWidth * 2, headingHeight, [`${displayPrefix} / ${family} / ${view}     OFFLINE ENGINE-STUDIO PREVIEW  |  REAL REFERENCE`], 21), left: 0, top: y });
    const [left, right] = await Promise.all([panel(renderPath(family, view), cellWidth, imageHeight), panel(path.join(root, ref.filename), cellWidth, imageHeight)]);
    layers.push({ input: left, left: 0, top: y + headingHeight }, { input: right, left: cellWidth, top: y + headingHeight });
    const foot = [
      ...wrap(`Angle: ${pair.angle} Photos are closest-view references, not measured camera registration.`, 148),
      ...wrap(`Reference: ${ref.title} | ${ref.author} | ${ref.license}`, 148),
      ...wrap(ref.url, 148),
    ];
    layers.push({ input: label(cellWidth * 2, footerHeight, foot, 17), left: 0, top: y + headingHeight + imageHeight });
  }
  const filename = path.join(output, `${prefix}-${family}-comparison.jpg`);
  await sharp({ create: { width: cellWidth * 2, height: rowHeight * views.length, channels: 3, background: '#e9e4d8' } }).composite(layers).jpeg({ quality: 92 }).toFile(filename);
  console.log(filename);
}

// One three-quarter render/photo pair per family for a compact first inspection.
const reviewCellWidth = 600, reviewImageHeight = 260, reviewLabelHeight = 82;
const reviewRowHeight = reviewImageHeight + reviewLabelHeight;
const reviewLayers: OverlayOptions[] = [];
for (const [index, family] of (selected).entries()) {
  const pair = families[family]['three-quarter'], ref = referenceFor(pair.reference), top = index * reviewRowHeight;
  const [left, right] = await Promise.all([panel(renderPath(family, 'three-quarter'), reviewCellWidth, reviewImageHeight), panel(path.join(root, ref.filename), reviewCellWidth, reviewImageHeight)]);
  reviewLayers.push({ input: left, left: 0, top }, { input: right, left: reviewCellWidth, top });
  reviewLayers.push({ input: label(reviewCellWidth * 2, reviewLabelHeight, [
    `${displayPrefix} / ${family}   render | reference (closest available angle; no camera registration)`,
    ...wrap(`${ref.title} | ${ref.author} | ${ref.license}`, 126),
  ], 16), left: 0, top: top + reviewImageHeight });
}
const review = path.join(output, `${prefix}-review.jpg`);
await sharp({ create: { width: reviewCellWidth * 2, height: reviewRowHeight * selected.length, channels: 3, background: '#e9e4d8' } }).composite(reviewLayers).jpeg({ quality: 92 }).toFile(review);
console.log(review);

// Characteristic architectural relief, paired with the closest real facades.
if(selected.includes('city')){
 const detailRows:[string,string,string][]=[
  ['city-slab-gallery','hdb-slab','Common gallery, supported landings and parapets; low oblique facade'],
  ['city-slab-front','hdb-slab','Recessed window rhythm, sills and slab-roof tanks; low oblique facade'],
  ['city-void-deck','hdb-void-deck','Open ground-floor bays and seated columns; eye-level interior'],
  ['city-point-detail','hdb-point','Four corner units, recessed core and continuous piers; low oblique tower'],
 ];
 const layers:OverlayOptions[]=[];
 for(const [i,[shot,reference,caption]]of detailRows.entries()){
  const ref=referenceFor(reference),top=i*rowHeight;
  layers.push({input:label(cellWidth*2,headingHeight,[`${displayPrefix} / ${caption}`],20),left:0,top});
  const [left,right]=await Promise.all([panel(path.join(output,`${prefix}-${shot}.png`),cellWidth,imageHeight),panel(path.join(root,ref.filename),cellWidth,imageHeight)]);
  layers.push({input:left,left:0,top:top+headingHeight},{input:right,left:cellWidth,top:top+headingHeight});
  layers.push({input:label(cellWidth*2,footerHeight,[...wrap('Offline engine-studio + ACES | real Singapore reference. Different specimen; no measured camera registration.',148),...wrap(`${ref.title} | ${ref.author} | ${ref.license}`,148),...wrap(ref.url,148)],17),left:0,top:top+headingHeight+imageHeight});
 }
 const filename=path.join(output,`${prefix}-architecture-details.jpg`);
 await sharp({create:{width:cellWidth*2,height:rowHeight*detailRows.length,channels:3,background:'#e9e4d8'}}).composite(layers).jpeg({quality:92}).toFile(filename);console.log(filename);
}
