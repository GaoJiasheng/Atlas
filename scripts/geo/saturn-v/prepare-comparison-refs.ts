/** Reproducible crops of local NASA reference images, for evidence only. */
import sharp from 'sharp';
const root='scripts/geo/saturn-v/refs/';
async function crop(source:string,target:string,x:number,y:number,w:number,h:number){
 const meta=await sharp(root+source).metadata(),W=meta.width!,H=meta.height!;
 await sharp(root+source).extract({left:Math.round(x*W),top:Math.round(y*H),width:Math.floor(w*W),height:Math.floor(h*H)}).png().toFile(root+target);
}
await crop('j2-1.jpg','j2-front-elevation.png',.09,.13,.35,.48);
await crop('j2-1.jpg','j2-rear-elevation.png',.53,.13,.36,.48);
await crop('j2-1.jpg','j2-start-tank.png',.10,.17,.34,.25);
await crop('f1-1-upright.jpg','f1-pump.png',0,0,1,.58);
await crop('stack-elevation.png','sic-elevation-detail.png',0,.72,1,.28);
await crop('csm-elevation.png','sm-elevation-detail.png',0,.24,1,.46);
await crop('les-0.jpg','les-upright-detail.png',.56,.03,.38,.38);
await crop('les-csm-summary.gif','les-summary-elevation.png',.025,0,.31,.92);
await crop('les-csm-summary.gif','les-summary-truss.png',.09,.49,.15,.28);
await crop('les-csm-summary.gif','probe-summary-detail.png',.52,.12,.14,.10);
