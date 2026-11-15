import assert from 'node:assert/strict';
import {pathToFileURL} from 'node:url';
import {readFileSync} from 'node:fs';
import {path,line,ellipse,f,rect,material,polygon,towers,render,type Plate,type Point} from './angles-img5-materials.js';
export const GRAPH_COUNTS=[2,4,3] as const;
export const TOKEN={diameter:174,spacing:202,xs:[345,768,1191],baseline:1000};
export const PEGS:Point[]=[[230,850],[500,580],[770,700],[1040,380],[1310,260]];
export const PEG_RADIUS=76;
export const CAKE={centre:[768,576] as Point,radius:455,sectors:[[90,270],[270,360],[0,90]] as const};
export const radial=(degree:number,r=CAKE.radius):Point=>[CAKE.centre[0]+r*Math.cos(degree*Math.PI/180),CAKE.centre[1]+r*Math.sin(degree*Math.PI/180)];
export function sector(start:number,end:number){const a=radial(start),b=radial(end);return `M768 576L${f(a[0])} ${f(a[1])}A455 455 0 ${end-start>180?1:0} 1 ${f(b[0])} ${f(b[1])}Z`;}
export function assertGraphs(){
 assert.equal(GRAPH_COUNTS.length,3);assert.equal(GRAPH_COUNTS.reduce((s,n)=>s+n,0),9);
 assert.equal(TOKEN.xs[1]!-TOKEN.xs[0]!,TOKEN.xs[2]!-TOKEN.xs[1]!);assert(TOKEN.spacing>TOKEN.diameter);
 assert.equal(PEGS.length,5);for(let i=1;i<5;i++)assert.equal(PEGS[i]![0]-PEGS[i-1]![0],270);
 assert(2*PEG_RADIUS/1536*420>=40,'peg heads remain at least 40 px at reading width');
 const heights=PEGS.map(p=>-p[1]);assert(heights[2]!<heights[1]!);assert.equal(Math.min(...heights),heights[0]);assert.equal(Math.max(...heights),heights[4]);
 const arcs=CAKE.sectors.map(([a,b])=>b-a);assert.deepEqual(arcs,[180,90,90]);assert.equal(arcs.reduce((a,b)=>a+b,0),360);
 const top=radial(270),bottom=radial(90),right=radial(0);assert(Math.abs((top[0]+bottom[0])/2-768)<1e-10);assert.equal((top[1]+bottom[1])/2,576);
 assert(Math.abs((bottom[0]-768)*(right[0]-768)+(bottom[1]-576)*(right[1]-576))<1e-8);
}
function magnet(x:number,y:number){
 const r=TOKEN.diameter/2,fruit='M-23 -42C-58 -30 -63 14 -40 47C-18 78 35 57 48 16C58 -19 29 -52 -7 -50Q-14 -50 -23 -42Z';
 return `<g data-token="true" transform="translate(${x} ${y})">`+ellipse(0,4,r,r,'url(#side)','#666666',1.3)+ellipse(0,0,r,r,'url(#top)','#696969',1.2)+ellipse(0,0,r-4,r-4,'url(#hatch)','none',0,'opacity=".3"')+
 // A single embossed mango and a single leaf, replicated without variation.
 material(fruit,'url(#mango)','paper')+path('M-10 -48C2 -80 39 -79 56 -66C41 -46 16 -36 -10 -48Z','url(#dark)','#666666',1)+path('M-7 -49Q21 -56 48 -66','none','#c9c9c9',1.5)+path('M-24 -34C-47 -9 -42 22 -26 38','none','#eeeeee',3,'opacity=".7"')+'</g>';
}
export function graphsPlates():Plate[]{
 const cover=towers(GRAPH_COUNTS,[115,420,725],880,true);
 let tokens='';GRAPH_COUNTS.forEach((n,i)=>{for(let j=0;j<n;j++)tokens+=magnet(TOKEN.xs[i]!,TOKEN.baseline-TOKEN.diameter/2-j*TOKEN.spacing);});
 let board=material('M102 133L1423 133Q1435 133 1435 145V1010H102Z','url(#front)','wood',29)+path('M102 1010H1435V1025H102Z','url(#side)','#555555',1)+line([[110,141],[1428,141]],'#eeeeee',2);
 // Identical wooden dowels project from the board; their head centres are the data points.
 for(const [x,y]of PEGS)board+=path(`M${x-PEG_RADIUS} ${y}v28a${PEG_RADIUS} ${PEG_RADIUS*.82} 0 0 0 ${2*PEG_RADIUS} 0v-28Z`,'url(#side)','#666666',1)+ellipse(x,y+28,PEG_RADIUS,PEG_RADIUS*.82,'url(#hatch)','none',0,'opacity=".45"')+ellipse(x,y,PEG_RADIUS,PEG_RADIUS*.86,'url(#top)','#555555',1.3)+ellipse(x,y,PEG_RADIUS-4,PEG_RADIUS*.86-4,'url(#grain)','none',0,'opacity=".35"')+ellipse(x,y,PEG_RADIUS-4,PEG_RADIUS*.86-4,'url(#hatch)','none',0,'opacity=".4"');
 // One straight segment per pair of adjacent head centres; no smoothing or sag.
 board+=line(PEGS,'#393939',6.2)+line(PEGS,'#999999',1.1,'transform="translate(0 -1.4)"');
 for(const [x,y] of PEGS)board+=path(`M${x-5} ${y+2}q5 8 10 0`,'none','#393939',5);
 const cakeSource=readFileSync('art/img5/raw/graphs-cake-material-neutral.png').toString('base64');
 // Appearance comes from one uncut ImageGen material. The radius, outline,
 // centre and cut geometry are independent, exact SVG sectors.
 const surface=`<image href="data:image/png;base64,${cakeSource}" x="219.4" y="27.4" width="1097.2" height="1097.2"/>`;
 let cake=`<defs><clipPath id="platter-circle"><circle cx="768" cy="576" r="523"/></clipPath><clipPath id="cake-circle"><circle cx="768" cy="576" r="455"/></clipPath></defs>`;
 cake+=`<g clip-path="url(#platter-circle)">${surface}</g>`+ellipse(768,576,523,523,'none','#6b6b6b',1.2);
 // A narrow shaded inner wall separates the actual food from the metal lip.
 cake+=ellipse(768,578,460,460,'#777777','#666666',1);
 for(const [i,[start,end]]of CAKE.sectors.entries()){
  const d=sector(start,end);
  cake+=`<defs><clipPath id="cake-piece-${i}">${path(d,'white','none',0)}</clipPath></defs>`;
  cake+=`<g data-sector="${end-start}" clip-path="url(#cake-piece-${i})">${surface}</g>`;
 }
 // Real narrow cut gaps expose the platter. Bevels run beside, never displace,
 // the exact centreline of the diameter and the perpendicular rightward cut.
 cake+=line([[768,121],[768,1031]],'#555555',6)+line([[768,576],[1223,576]],'#555555',6);
 cake+=line([[763.7,124],[763.7,1028]],'#eeeeee',2.6)+line([[772.3,124],[772.3,572]],'#d9d9d9',1.8)+line([[772.3,580],[772.3,1028]],'#d9d9d9',1.8)+line([[772,571.7],[1220,571.7]],'#eeeeee',2.6);
 return [
 {slug:'graphs',id:'cover',chapter:'cover',subject:'Three wooden block towers on one narrow plinth, with 2, 4 and 3 blocks.',body:cover,width:1024,height:1024,checks:['Exactly three towers, with counts 2 / 4 / 3 from left to right: nine blocks total.','All blocks use the identical 160-unit cube; visible bevels and seams; tower bases share y=880.','Three separated towers on a narrow wooden base; no loose blocks, numbers, scales, axes, hands or table.'],facts:{counts:GRAPH_COUNTS,total:9,edge:160,baseline:880},alt:{en:'Three wooden towers on a narrow base contain two, four and three blocks.',zh:'窄木底座上并排三座方块塔，从左到右各有两块、四块、三块。'},caption:{en:'The tower heights show three different counts.',zh:'塔的高低表示三种不同的数量。'}},
 {slug:'graphs',id:'picture-tokens',chapter:'picture-graphs',subject:'Nine identical circular mango magnets on a plain unframed white magnetic surface, in columns of 2, 4 and 3.',body:tokens,width:1536,height:1152,checks:['Exactly three columns, with 2 / 4 / 3 identical circular magnets: nine total.','All magnet diameters are 174 units; vertical spacing 202, equal column spacing 423, shared bottom tangent y=1000.','Each magnet carries one embossed mango and one leaf; blank unframed whiteboard ground is transparent for theme compositing.','No letters, coin inscriptions, title, grid, border, hands or extra magnets.'],facts:{counts:GRAPH_COUNTS,total:9,diameter:174,verticalSpacing:202,columnSpacing:423,baseline:1000},alt:{en:'Three columns of mango magnets contain two, four and three identical magnets.',zh:'三列相同的芒果磁贴，从左到右分别有两枚、四枚、三枚。'},caption:{en:"Each magnet stands for one pupil’s choice.",zh:'每一枚磁贴代表一个学生的选择。'}},
 {slug:'graphs',id:'thread-trend',chapter:'line-graphs',subject:'A taut dark thread joins five identical wooden pegs on a plain wooden board.',body:board,width:1536,height:1152,checks:['Exactly five same-size wooden dowels, with head centres 270 units apart horizontally.','Third head is lower than second; first is lowest and fifth is highest.','One taut thread follows exactly four straight segments between adjacent head centres; no sag or skipped peg.','Graphite wood grain and projecting dowels; no scale, axes, numerals, arrows or sixth peg.'],facts:{pegs:PEGS,pegCount:5,horizontalSpacing:270,threadSegments:4},alt:{en:'A taut thread joins five wooden pegs, rising, dipping, then rising to the highest peg.',zh:'一根拉紧的线依次连起五根木钉，先升、再降，再升到最高处。'},caption:{en:'Joining the readings in order with a thread shows the rises and falls.',zh:'用线按顺序连起各次读数，升和降一眼就看出来。'}},
 {slug:'graphs',id:'cake-sectors',chapter:'pie-charts',subject:'A plain round white rice cake on a circular platter, cut into a half and two equal quarters.',body:cake,width:1536,height:1152,checks:['Exactly three pieces with analytic sector angles 180° / 90° / 90°; their areas sum to the full disc.','One diameter passes exactly through the cake centre; the sole rightward radial cut is perpendicular to it.','Two quarter sectors have identical radius and area, with narrow cut gaps and no additional cuts.','Top-down matte rice-cake surface and metal platter from one uncut ImageGen reference, clipped to exact computed geometry; no topping, decoration, text, utensils or hands.'],facts:{sectorDegrees:[180,90,90],radius:455,cutIntersection:[768,576],quarterArea:Math.PI*455**2/4},alt:{en:'A round white cake on a platter is divided into one half and two equal quarters.',zh:'圆盘上的白糕切成一个半圆和两个一样大的四分之一圆。'},caption:{en:'A half and two quarters make one whole cake.',zh:'一半加两个四分之一，正好是一整块糕。'}}
 ];
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){assertGraphs();if(!process.argv.includes('--check'))for(const p of graphsPlates())await render(p);console.log('graphs assertions passed');}
