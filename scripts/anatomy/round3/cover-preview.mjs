import sharp from 'sharp';
for(const topic of ['core','shoulders'])await sharp(`public/illustrations/muscles-${topic}@2x.webp`).flatten({background:'#e9e4d8'}).resize(900).png().toFile(`scripts/anatomy/round3/comparisons/look1/${topic}-cover.png`);
