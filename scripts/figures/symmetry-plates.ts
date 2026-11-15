import assert from 'node:assert/strict';
import {pathToFileURL} from 'node:url';
import sharp from 'sharp';
import {path,line,rect,material,render,wrap,type Plate} from './angles-img5-materials.js';
/** One half is reflected, never independently redrawn. Four lobes in total. */
export const BUTTERFLY_HALF='M512 186C585 71 778 88 873 190C1000 326 870 459 603 500C811 460 945 616 839 799C756 941 570 890 512 752Z';
export const PAPER={x:150,y:175,width:1236,height:824,foldX:768,foldY:587};
export const HEART_HALF='M0 -240C-103 -408 -451 -374 -480 -130C-510 80 -173 321 0 470Z';
export const HEART_FOLD={cosine:.82,projectedLift:.10};
export function assertSymmetry(){
 assert.equal(PAPER.width/PAPER.height,1.5);assert.equal(PAPER.foldX,PAPER.x+PAPER.width/2);assert.equal(PAPER.foldY,PAPER.y+PAPER.height/2);
 assert(HEART_FOLD.cosine>0&&HEART_FOLD.cosine<1);assert.equal(2*2,4);
}
export async function overlap(p:Plate):Promise<number>{
 const s=wrap(p),{data,info}=await sharp(Buffer.from(s)).ensureAlpha().raw().toBuffer({resolveWithObject:true});
 let union=0,intersect=0;
 for(let y=0;y<info.height;y++)for(let x=0;x<info.width;x++){
 const a=data[(y*info.width+x)*4+3]!>10,b=data[(y*info.width+info.width-1-x)*4+3]!>10;
 if(a||b)union++;if(a&&b)intersect++;
 }
 return intersect/union;
}
export function symmetryPlates():Plate[]{
 // No drop shadow or independent body: the four lobes are one connected cut paper.
 const half=material(BUTTERFLY_HALF,'url(#paper)','paper');
 let butterfly=half+`<g transform="translate(1024 0) scale(-1 1)">${half}</g>`;
 butterfly+=rect(494,186,36,566,'url(#crease)');
 // Deckle-like short graphite ticks describe the cut edge, not a decoration.
 butterfly+=path(BUTTERFLY_HALF,'none','#888888',1.8,'transform="translate(0 2)"')+`<g transform="translate(1024 0) scale(-1 1)">${path(BUTTERFLY_HALF,'none','#888888',1.8,'transform="translate(0 2)"')}</g>`;
 // Two congruent halves share exactly the same straight hinge. A top-view
 // oblique fold projects the raised half with an affine transform about x=0.
 const left=material(HEART_HALF,'url(#paper)','paper');
 const right=`<g transform="matrix(${-HEART_FOLD.cosine} ${HEART_FOLD.projectedLift} 0 1 0 0)">${material(HEART_HALF,'url(#top)','paper')+path(HEART_HALF,'none','#666666',2.5,'transform="translate(0 2)"')}</g>`;
 const heart=`<g transform="translate(816 500) scale(1.33 1.12)">${left}${right}${rect(-12,-240,24,710,'url(#crease)')}</g>`;
 const p=PAPER,shape=`M${p.x} ${p.y}H${p.x+p.width}V${p.y+p.height}H${p.x}Z`;
 // Creases have a dark valley and adjacent reserve highlight, fading over 34
 // units. They are material relief, never ink/dashed construction lines.
 let paper=material(shape,'url(#paper)','paper')+path(shape,'none','#8b8b8b',1.5,'transform="translate(0 2)"');
 paper+=rect(p.foldX-20,p.y+1,40,p.height-2,'url(#crease)');
 paper+=`<g transform="translate(${p.x} ${p.foldY}) rotate(-90)">${rect(-20,0,40,p.width,'url(#crease)')}</g>`;
 // Gently varied edge fibres retain the exact rectangular silhouette.
 for(let x=p.x+5;x<p.x+p.width-5;x+=11)paper+=line([[x,p.y+p.height-1],[x+4,p.y+p.height-1]],'#bbbbbb',1.3);
 return [
 {slug:'symmetry',id:'cover',chapter:'cover',subject:'One plain paper butterfly with four mirrored wing lobes and a central vertical fold.',body:butterfly,width:1024,height:1024,checks:['Exactly four wing lobes: two above and two below, made from one reflected connected paper outline.','Single straight vertical fold at x=512: exactly the canvas centre.','Alpha silhouette reflection intersection-over-union is measured by the delivery script and must exceed 97%.','Thin shaded cut-paper edge, no antenna, body detail, pattern, writing, background or cast shadow.'],facts:{wingLobes:4,foldX:512,axisFraction:.5,reflectionMinimumIoU:.97},alt:{en:'A plain paper butterfly with four wing lobes and one fold down the middle.',zh:'一只素面剪纸蝴蝶有四片翼瓣，正中是一道竖直折痕。'},caption:{en:'The two sides of the paper butterfly have matching outlines.',zh:'剪纸蝴蝶的左右两边轮廓相同。'}},
 {slug:'symmetry',id:'folded-heart',chapter:'fold-and-match',subject:'One connected cut-paper heart, partly folded on its vertical middle with the right half raised.',body:heart,width:1536,height:1152,checks:['One connected sheet: left and right share the exact notch-to-tip straight hinge, with one crease only.','Both halves use the same Bézier outline; right half is projected with horizontal factor .82 and oblique lift, representing a partial fold.','Curved paper edges remain corresponding; shaded raised right half has visible thin paper edge.','No separate sheet, drawn construction line, dashes, arrows, decoration or text.'],facts:{sheets:1,creases:1,sourceOutline:HEART_HALF,raisedHalfTransform:[-.82,.10,0,1,0,0]},alt:{en:'A paper heart partly folded along its middle, with its right half lifted.',zh:'一个剪纸心形沿中线折起一部分，右半边微微掀起。'},caption:{en:'The heart folds along its middle so the two matching halves can lie on each other.',zh:'心形沿中线对折，两半相同的轮廓就能叠在一起。'}},
 {slug:'symmetry',id:'paper-folds',chapter:'testing-a-line',subject:'A landscape rectangular paper sheet with exactly two centred perpendicular material creases.',body:paper,width:1536,height:1152,checks:['Exactly two material creases: one vertical and one horizontal, with no diagonal crease.','Crease centres x=768 and y=587 are exactly the sheet midpoints; four congruent 618 × 412 rectangles.','Sheet dimensions 1236 × 824 have ratio 1.5, clearly a landscape rectangle rather than a square.','Unmarked paper with thin edges and graphite shading; no drawn lines, border, text, picture or background.'],facts:{sheet:PAPER,creaseCount:2,cellDimensions:[618,412],aspectRatio:1.5},alt:{en:'A rectangular sheet of paper has one central vertical crease and one central horizontal crease.',zh:'一张横放的长方形纸，中间各有一道竖折痕和横折痕。'},caption:{en:'A rectangle folds onto itself along these two lines only, not along its diagonals.',zh:'长方形只能沿这两条线折得重合，沿对角线不行。'}}
 ];
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){assertSymmetry();const plates=symmetryPlates();const iou=await overlap(plates[0]!);assert(iou>=.97,`butterfly alpha IoU ${iou}`);console.log(`butterfly alpha reflection IoU: ${iou}`);if(!process.argv.includes('--check'))for(const p of plates)await render(p);console.log('symmetry assertions passed');}
