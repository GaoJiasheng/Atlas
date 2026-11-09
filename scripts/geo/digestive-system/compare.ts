/** Genuine source comparisons, without browser/GPU use.
 * pnpm tsx scripts/geo/digestive-system/compare.ts --round round1 --renders /tmp/atlas-digestive-rebuild/round1
 * Options: --out /tmp/atlas-digestive-rebuild/comparisons --theme paper|cinema|paper,cinema
 * --hero tooth,stomach,villi limits regeneration to the selected specimen(s).
 * Requires every selected render before writing any sheet. References are only
 * cropped (recorded in refs/manifest.json) and aspect-preserving contain-fitted.
 * Different reference/view axes remain explicitly labelled on the sheet.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';
import sharp from 'sharp';

type Reference = { file: string; sourcePage: string; author: string; licence: string; angle: string; crops: { file: string; pixelBox: number[]; operation: string }[] };
type Selection = { hero: string; view: string; reference: string; image: string; referenceView: string; caveat: string };
const args = process.argv.slice(2);
const option = (key: string, fallback: string) => { const i = args.indexOf(`--${key}`); return i < 0 ? fallback : args[i + 1] ?? fallback; };
const round = option('round', 'round1');
assert(/^[a-zA-Z0-9_-]+$/.test(round), '--round must be a simple name');
const renders = path.resolve(option('renders', `/tmp/atlas-digestive-rebuild/${round}`));
const out = path.resolve(option('out', '/tmp/atlas-digestive-rebuild/comparisons'));
const themes = option('theme', 'paper').split(',');
assert(themes.length > 0 && themes.every(theme => theme === 'paper' || theme === 'cinema'), '--theme must be paper or cinema (or both, comma separated)');
const refsDir = fileURLToPath(new URL('./refs/', import.meta.url));
const manifest = JSON.parse(fs.readFileSync(path.join(refsDir, 'manifest.json'), 'utf8')) as { angleCaveat: string; references: Reference[] };
const refs = new Map(manifest.references.map(ref => [ref.file, ref]));
const choices: Selection[] = [
  { hero: 'tooth', view: 'front', reference: '2409_Tooth.jpg', image: 'molar-front-section.jpg', referenceView: 'Front longitudinal scientific section', caveat: 'Compare crown/neck proportions, enamel thickness, pulp horns and the two root canals. Section plane is comparable; the teaching model is a three-dimensional cutaway.' },
  { hero: 'tooth', view: 'three-quarter', reference: 'Lower_wisdom_tooth.jpg', image: 'Lower_wisdom_tooth.jpg', referenceView: 'Near frontal photograph, slightly elevated', caveat: 'Camera azimuth differs. This is a lower third molar; use crown/root form and surface relief, not a first-molar cusp-count claim.' },
  { hero: 'tooth', view: 'profile', reference: 'Sobo_1906_335.png', image: 'molar-proximal-profile.png', referenceView: 'Sobotta: lower first molar, proximal side elevation', caveat: 'Comparable proximal profile: roots overlap in the source drawing. Compare crown lean, rounded cusp relief, cervical constriction and root taper. Model camera has a small elevation; source is a straight elevation.' },
  { hero: 'tooth', view: 'detail', reference: 'Lower_wisdom_tooth.jpg', image: 'molar-cusp-photo.jpg', referenceView: 'Cropped crown photograph, slightly elevated', caveat: 'Third-molar crown reference. Compare joined cusps, valleys and continuous enamel relief; viewpoint and exact cusp count differ.' },
  { hero: 'stomach', view: 'front', reference: 'Histology_of_normal_fundic_mucosa.png', image: 'Histology_of_normal_fundic_mucosa.png', referenceView: 'Frontal longitudinal gastric mucosa micrograph', caveat: 'Comparable frontal pit/gland section. The reference shows mucosa with a high-power inset; it does not expose the entire muscularis externa. H&E stain colours are not natural tissue colours.' },
  { hero: 'stomach', view: 'three-quarter', reference: '2415_Histology_of_StomachN.jpg', image: 'stomach-wall-block.jpg', referenceView: 'Three-quarter histological block section', caveat: 'Comparable tissue-block view, with a different azimuth. Pits are microscopic invaginations; the large folds of whole-stomach rugae occur at another scale.' },
  { hero: 'stomach', view: 'profile', reference: 'Illu_stomach_layers.jpg', image: 'Illu_stomach_layers.jpg', referenceView: 'Three-quarter NCI / SEER tissue block', caveat: 'Reference is an oblique scientific drawing, not a profile photograph. Compare layer thickness relationships, glands and muscle orientations; source resolution is limited.' },
  { hero: 'stomach', view: 'detail', reference: '2415_Histology_of_StomachN.jpg', image: 'stomach-pits-detail.jpg', referenceView: 'Cropped oblique gastric-pit / gland section', caveat: 'Compare recessed pits with continuous surface epithelium and deep gastric glands. Oblique source section and model detail camera differ.' },
  { hero: 'villi', view: 'front', reference: '2418_Histology_Small_IntestinesN.jpg', image: 'villi-front-section.jpg', referenceView: 'Front longitudinal villus section', caveat: 'Comparable frontal section. The scientific illustration isolates two villi; the model also shows their denser surrounding field.' },
  { hero: 'villi', view: 'three-quarter', reference: 'Gray1061.png', image: 'Gray1061.png', referenceView: 'Near frontal vascular cutaway, slight obliquity', caveat: 'Model camera is more oblique. Compare irregular finger proportions, narrow clefts and the capillary mesh around a central blind-ended lymphatic vessel.' },
  { hero: 'villi', view: 'profile', reference: 'wellcome-intestinal-villi-B0006133.jpg', image: 'wellcome-intestinal-villi-B0006133.jpg', referenceView: 'Wellcome SEM: oblique exterior profile / tip', caveat: 'Genuine electron micrograph; long axis lies horizontally. Compare rounded finger outline and epithelial surface relief. Source is more oblique; species is unspecified in the catalogue. False colour does not establish tissue colour.' },
  { hero: 'villi', view: 'detail', reference: 'Gray1061.png', image: 'villi-capillary-detail.png', referenceView: 'Cropped vascular cutaway drawing', caveat: 'Compare peripheral vascular reticulum and the central blind-ended lacteal. The historic drawing and model detail camera have different obliquity.' },
];
const selectedHeroes=option('hero','tooth,stomach,villi').split(',');
assert(selectedHeroes.every(hero=>['tooth','stomach','villi'].includes(hero)), '--hero must select tooth, stomach or villi');
const jobs = themes.flatMap(theme => choices.filter(choice=>selectedHeroes.includes(choice.hero)).map(choice => {
  const filename = `${round}-${choice.hero}-${choice.view}-${theme}.png`;
  const renderPath = path.join(renders, filename);
  const referencePath = path.join(refsDir, choice.image);
  assert(fs.existsSync(renderPath), `Missing render: ${renderPath}. Run preview.ts before compare.ts.`);
  assert(fs.existsSync(referencePath), `Missing genuine reference: ${referencePath}`);
  assert(refs.has(choice.reference), `Missing source metadata: ${choice.reference}`);
  return { theme, choice, filename, renderPath, referencePath };
}));

const W = 1680, H = 1160, margin = 32, gap = 24, panelW = (W - margin * 2 - gap) / 2, panelH = 700, top = 145;
const escape = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
function wrap(s: string, width: number) {
  const lines: string[] = []; let line = '';
  for (const word of s.split(/\s+/)) { if (line && line.length + word.length + 1 > width) { lines.push(line); line = word; } else line += `${line ? ' ' : ''}${word}`; }
  if (line) lines.push(line); return lines;
}
function textLines(lines: string[], x: number, y: number, size = 20, color = '#30343a') {
  return `<text x="${x}" y="${y}" fill="${color}" font-family="Arial, sans-serif" font-size="${size}">${lines.map((line, i) => `<tspan x="${x}" dy="${i ? size * 1.4 : 0}">${escape(line)}</tspan>`).join('')}</text>`;
}
fs.mkdirSync(out, { recursive: true });
const index = [];
for (const job of jobs) {
  const { choice, theme } = job, ref = refs.get(choice.reference)!;
  const title = `${round} | ${choice.hero === 'tooth' ? 'Molar section' : choice.hero === 'stomach' ? 'Stomach wall' : 'Intestinal villi'} | ${choice.view} | ${theme}`;
  const [render, reference] = await Promise.all([
    sharp(job.renderPath).trim({ threshold: 5, margin: 14 }).resize(panelW, panelH, { fit: 'contain', background: '#ebe7de' }).png().toBuffer(),
    sharp(job.referencePath).resize(panelW, panelH, { fit: 'contain', background: '#ffffff' }).png().toBuffer(),
  ]);
  const author = choice.image === 'villi-histology-profile.jpg' ? 'Regents of University of Michigan Medical School © 2012; via OpenStax College' : ref.author;
  const licence = ref.licence.startsWith('Public domain') ? 'Public domain (see source metadata)' : ref.licence;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
    <rect width="100%" height="100%" fill="#f3f1eb"/>
    ${textLines([title], margin, 43, 28)}
    ${textLines(['MODEL: offline studio / ACES CPU study'], margin, 87, 21)}
    ${textLines(['REFERENCE: genuine published image'], margin + panelW + gap, 87, 21)}
    ${textLines([`Camera: ${choice.view}`], margin, 122, 19)}
    ${textLines(wrap(choice.referenceView, 66), margin + panelW + gap, 122, 19)}
    ${textLines(wrap(choice.caveat, 142), margin, 885, 20)}
    ${textLines(wrap(`Source: ${author} | ${licence}`, 151), margin, 1000, 17)}
    ${textLines(wrap(`Source file: ${choice.reference} | Complete URL / crop provenance: companion index.json`, 150), margin, 1070, 17)}
    ${textLines(['Processing: model background trim; reference recorded crop; aspect-preserving fit only. No reference warp, relighting or generated substitute.', 'CPU study omits GPU shadows / micro-normal maps and approximates PMREM. GPU acceptance remains separate.'], margin, 1110, 17)}
  </svg>`;
  const output = `${round}-${choice.hero}-${choice.view}-${theme}-comparison.png`;
  await sharp(Buffer.from(svg)).composite([{ input: render, left: margin, top }, { input: reference, left: margin + panelW + gap, top }]).png().toFile(path.join(out, output));
  index.push({ output, round, theme, hero: choice.hero, renderView: choice.view, render: job.renderPath, reference: { sourceFile: ref.file, comparisonFile: choice.image, sourcePage: ref.sourcePage, author, licence: ref.licence, actualReferenceView: choice.referenceView, crop: ref.crops.find(crop => crop.file === choice.image) ?? null }, caveat: choice.caveat, imageProcessing: 'Model background trimmed at threshold 5 with 14 px margin; reference uses its recorded crop. Both followed by aspect-preserving contain fit. No rotation, warping, colour edits or relighting.' });
  process.stdout.write(`${path.join(out, output)}\n`);
}
const indexPath = path.join(out, 'index.json');
// Preserve preceding rounds/themes when iterating in the same comparison folder.
const previous = fs.existsSync(indexPath) ? JSON.parse(fs.readFileSync(indexPath, 'utf8')) as { sheets?: typeof index } : {};
const replaced = new Set(index.map(entry => entry.output));
fs.writeFileSync(indexPath, JSON.stringify({ topic: 'digestive-system', referenceManifest: path.join(refsDir, 'manifest.json'), angleCaveat: manifest.angleCaveat, sheets: [...(previous.sheets ?? []).filter(entry => !replaced.has(entry.output)), ...index] }, null, 2) + '\n');
