/** Compact final review bundle. Source sheets/iteration evidence stay in-topic. */
import fs from 'node:fs';
import sharp from 'sharp';
const out='scripts/geo/forces/comparison-sheets/batch2-final';
fs.mkdirSync(out,{recursive:true});
const sources=[
 ['circuits','scripts/geo/circuits/comparisons',n=>/^final-(motor|buzzer|clips)-four-views\.png$/.test(n)||/^final-board-hero/.test(n)],
 ['magnets','scripts/geo/magnets/comparisons',n=>/^final-sheet-.*\.(jpg|png)$/.test(n)||/^final-landscape-hero-.*\.png$/.test(n)||n==='final-em-cells-cinema.png'],
 ['forces-car','scripts/geo/forces/evidence/round5/comparisons',n=>n.startsWith('sheet-car-')],
 ['forces-brake-firm','scripts/geo/forces/comparison-sheets/hardware/firm',n=>n.endsWith('-comparison.png')||n.endsWith('-cinema.png')],
 ['forces-hardware','scripts/geo/forces/comparison-sheets/hardware/final',n=>n.endsWith('-comparison.png')||n.endsWith('-cinema.png')],
];
let count=0;
for(const [prefix,dir,select] of sources)for(const name of fs.readdirSync(dir).filter(select)){
 await sharp(`${dir}/${name}`).jpeg({quality:96,chromaSubsampling:'4:4:4'}).toFile(`${out}/${prefix}-${name.replace(/\.(png|jpg)$/,'.jpg')}`);count++;
}
fs.writeFileSync(`${out}/CREDITS.md`,`# Batch 2 review sheets\n\nDevelopment comparisons only; no reference photo is a runtime texture.\n\n- Circuits references, exact authors/licences, limitations and three revision rounds: ../../../../../src/content/topics/circuits/REBUILD-3D.md\n- Forces references, exact authors/licences, limitations, paper B grade and revision rounds: ../../../../../src/content/topics/forces/REBUILD-3D.md\n- Magnets references, exact authors/licences and limitations: ../../../../../src/content/topics/magnets/REBUILD-3D.md and ../../../magnets/comparisons/CREDITS.md\n\nThese final sheets are JPEG copies (quality96, 4:4:4) of the original PNG/JPEG sheets retained in each topic. Reference photographs are resized/cropped for comparison and retain their source licences. Sheets with CC BY-SA photos are CC BY-SA under the source's stated version; other photographs retain attribution obligations as recorded in the topic reports. Rendered geometry is the original Atlas study, not an imported photographic surface. View labels describe the model camera; available generic reference angles are approximate, not calibrated photo registration.\n`);
console.log(`${count} final sheets written to ${out}`);
