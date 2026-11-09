/** Evidence-only reference crops. NASA press kit and mission photography are
 * never shipped as textures. Crops retain the source aspect and identifying IDs. */
import sharp from 'sharp';
const dir='scripts/geo/saturn-v/refs/';
async function crop(src:string,out:string,x:number,y:number,w:number,h:number){const m=await sharp(dir+src).metadata();await sharp(dir+src).extract({left:Math.round(x*m.width!),top:Math.round(y*m.height!),width:Math.floor(w*m.width!),height:Math.floor(h*m.height!)}).png().toFile(dir+out);}
await crop('9264931.jpg','f1-fact-drawing.png',.20,.08,.57,.48);
await crop('csm-bays.png','sm-sector-layout.png',.66,.60,.23,.35);
await crop('csm-bays.png','cm-window-layout.png',.15,.13,.35,.34);
await crop('0100984.jpg','iu-interior.png',.20,.27,.68,.52);
await crop('0100982.jpg','sic-tanks-section.png',.27,.04,.48,.65);
await crop('lm5-front.jpg','lm5-ascent-photo.png',.27,.60,.26,.26);

await sharp(dir+'6862832.jpg').extract({left:0,top:0,width:1120,height:910}).rotate(270).png().toFile(dir+'f1-side-upright.png');
await sharp(dir+'j2-museum-side.jpg').extract({left:90,top:20,width:1040,height:570}).rotate(90).png().toFile(dir+'j2-museum-upright.png');

await sharp(dir+'9801810.jpg').extract({left:170,top:90,width:400,height:360}).rotate(55,{background:'#e9e4d8'}).png().toFile(dir+'sii-cutaway-upright.png');
await sharp(dir+'0100983.jpg').extract({left:390,top:300,width:770,height:520}).rotate(64,{background:'#e9e4d8'}).png().toFile(dir+'sivb-cutaway-upright.png');

await sharp(dir+'j2-nasm-DSH03.jpg').extract({left:110,top:25,width:1010,height:560}).rotate(90).png().toFile(dir+'j2-quarter-upright.png');
