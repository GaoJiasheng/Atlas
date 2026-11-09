/** Keep grayscale literal, soften excess cable grain and author heel contact datums. */
import sharp from 'sharp';
const dir='scripts/anatomy/rebuild-illustrations/sources/imagegen';
const datum=Buffer.from('<svg width="1536" height="1024"><path d="M320 848H500M975 848H1300" fill="none" stroke="#676767" stroke-width="1.1" opacity=".45"/></svg>');
for(const id of ['barbell-bench-press','heel-walk','cable-hip-adduction']){
 let image=sharp(`${dir}/${id}-raw.png`).greyscale().toColourspace('srgb');
 if(id==='heel-walk')image=image.composite([{input:datum}]);
 if(id==='cable-hip-adduction')image=image.blur(.35);
 await image.png().toFile(`${dir}/${id}.png`);
}
