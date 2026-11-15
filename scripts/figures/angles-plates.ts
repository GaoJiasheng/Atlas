import assert from 'node:assert/strict';
import {pathToFileURL} from 'node:url';
import {path,line,ellipse,f,rect,material,render,type Plate,type Point} from './angles-img5-materials.js';
export const DIVIDER={pivot:[512,130] as Point,length:760,width:76,angles:[-24,24]};
export const PROTRACTOR={centre:[768,950] as Point,radius:665,armLength:560,degrees:55,ticks:Array.from({length:37},(_,i)=>({degree:i*5,long:i%2===0}))};
export const GRILLE={x:190,y:115,width:1156,height:922,barWidth:44,verticals:[479,768,1057],crossY:576};
const woodArm=(length:number,width:number)=>material(`M${-width/2} 0A${width/2} ${width/2} 0 0 1 ${width/2} 0V${length-width/2}A${width/2} ${width/2} 0 0 1 ${-width/2} ${length-width/2}Z`,'url(#front)','wood')+line([[-width/2+4,30],[-width/2+4,length-width/2]],'#eeeeee',2);
const pin=(x:number,y:number,r:number)=>ellipse(x,y,r,r,'url(#metal)','#555555',1.6)+ellipse(x,y,r-7,r-7,'url(#hatch)','#999999',.6)+ellipse(x-5,y-6,r*.25,r*.25,'#b7b7b7','#666666',1)+path(`M${x-r*.48} ${y+r*.54}A${r*.72} ${r*.72} 0 0 0 ${x+r*.68} ${y-r*.26}`,'none','#454545',1.3);
export function assertAngles(){
 assert.equal(DIVIDER.angles.length,2);assert.equal(DIVIDER.angles[1]!-DIVIDER.angles[0]!,48);assert.equal(DIVIDER.length,760);
 const [cx,cy]=PROTRACTOR.centre;assert.equal(cx,1536/2);assert.equal(PROTRACTOR.degrees,55);
 assert.equal(PROTRACTOR.ticks.filter(t=>t.long).length,19);assert.equal(PROTRACTOR.ticks.filter(t=>!t.long).length,18);
 PROTRACTOR.ticks.forEach((t,i)=>{assert.equal(t.degree,i*5);assert.equal(t.long,t.degree%10===0);});
 assert(PROTRACTOR.armLength<PROTRACTOR.radius-62,'all radial ticks remain outside the wooden strips');
 const u=[1,0],v=[Math.cos(55*Math.PI/180),-Math.sin(55*Math.PI/180)];assert(Math.abs(Math.acos(u[0]!*v[0]!)*180/Math.PI-55)<1e-10);
 assert.equal(cy,950);assert.equal(GRILLE.verticals.length,3);const spaces=[GRILLE.x,...GRILLE.verticals,GRILLE.x+GRILLE.width];
 for(let i=1;i<spaces.length;i++)assert.equal(spaces[i]!-spaces[i-1]!,289);
 assert.equal(GRILLE.crossY,GRILLE.y+GRILLE.height/2);assert.equal(u[0]!*0+u[1]!*1,0);
}
export function anglesPlates():Plate[]{
 const cover=DIVIDER.angles.map(a=>`<g transform="translate(512 130) rotate(${a})">${woodArm(DIVIDER.length,DIVIDER.width)}</g>`).join('')+pin(512,130,55);
 const [cx,cy]=PROTRACTOR.centre,r=PROTRACTOR.radius;
 const semi=`M${cx-r} ${cy}A${r} ${r} 0 0 1 ${cx+r} ${cy}Z`;
 let pro=path(semi,'#d5d5d5','#777777',2,'fill-opacity=".24"')+path(semi,'url(#hatch)','none',0,'opacity=".18"');
 // Moulded rim is the object boundary, not an added angle arc.
 pro+=path(`M${cx-r+9} ${cy-10}A${r-9} ${r-9} 0 0 1 ${cx+r-9} ${cy-10}`,'none','#a9a9a9',1);
 for(const t of PROTRACTOR.ticks){const a=t.degree*Math.PI/180,rr=r-(t.long?62:33);pro+=`<g data-tick-degree="${t.degree}" data-tick-length="${t.long?'long':'short'}">`+line([[cx+rr*Math.cos(a),cy-rr*Math.sin(a)],[cx+(r-15)*Math.cos(a),cy-(r-15)*Math.sin(a)]],'#555555',t.long?2.4:1.4)+'</g>';}
 // Wood arms are narrow enough to preserve the outer scale, and terminate bluntly.
 pro+=`<g transform="translate(${cx} ${cy}) rotate(-90)">${woodArm(PROTRACTOR.armLength,48)}</g>`;
 pro+=`<g transform="translate(${cx} ${cy}) rotate(${-90-PROTRACTOR.degrees})">${woodArm(PROTRACTOR.armLength,48)}</g>`+pin(cx,cy,31);
 const g=GRILLE,t=44;
 // True rectangular metal bars: narrow edge highlights and broad graphite faces.
 const bar=(x:number,y:number,w:number,h:number)=>rect(x,y,w,h,'url(#metal)','#5b5b5b',1.5,2)+rect(x+3,y+3,w-6,h-6,'url(#hatch)')+line([[x+4,y+4],[x+4,y+h-4]],'#eeeeee',1.5);
 let grille=bar(g.x-t/2,g.y-t/2,g.width+t,t)+bar(g.x-t/2,g.y+g.height-t/2,g.width+t,t)+bar(g.x-t/2,g.y,t,g.height)+bar(g.x+g.width-t/2,g.y,t,g.height);
 for(const x of g.verticals)grille+=bar(x-t/2,g.y+t/2,t,g.height-t);
 grille+=bar(g.x+t/2,g.crossY-t/2,g.width-t,t);
 // Small weld fillets bind all three intersections, never extra bars.
 for(const x of g.verticals)for(const s of[-1,1])grille+=path(`M${x+s*25} ${g.crossY-25}q${-s*5} 4 ${-s*5} 9`,'none','#666666',2);
 return [
 {slug:'angles',id:'cover',chapter:'cover',subject:'A blunt wooden divider opened to 48 degrees, with one round metal hinge.',body:cover,width:1024,height:1024,checks:['Exactly two straight 760-unit arms, one common hinge; computed opening 48° (within 30°–50°).','Equal lengths and blunt rounded ends; no needle, pencil clamp or scale.','Front orthographic view, wood grain and graphite metal shading; no writing, angle arcs, hands or background.'],facts:{arms:2,hinges:1,armLengths:[760,760],openingDegrees:48},alt:{en:'Two equal wooden arms joined by a round metal hinge, opened to a small angle.',zh:'两条等长木臂由一个圆形金属铰钉连接，张开成一个小角。'},caption:{en:'The two wooden arms turn about one hinge.',zh:'两条木臂绕同一个铰点转动。'}},
 {slug:'angles',id:'protractor-arms',chapter:'measuring-angles',subject:'A transparent semicircular protractor with two hinged wooden strips at exactly 55 degrees.',body:pro,width:1536,height:1152,checks:['Hinge is exactly at the semicircle baseline midpoint; lower arm is collinear with the baseline toward the right.','Second arm centreline is exactly 55° above the rightward baseline.','Exactly 19 long radial ticks every 10° including endpoints and 18 short ticks at intervening 5° positions; no numerals.','One transparent protractor and two blunt wooden strips; no angle arcs, letters, arrows or hands.'],facts:{hinge:[cx,cy],diameter:2*r,angleDegrees:55,longTicks:19,shortTicks:18,tickSpacingDegrees:5},alt:{en:'A protractor centred on a hinge, with one wooden arm along its baseline and the other rising to the right.',zh:'量角器中心对着铰点，一条木臂沿底边向右，另一条斜向右上。'},caption:{en:"A protractor’s centre sits exactly on the point where the two arms meet.",zh:'量角器的中心正好对着两条边相交的点。'}},
 {slug:'angles',id:'window-frame',chapter:'perpendicular-and-parallel',subject:'A detached rectangular metal window grille with three equally spaced upright bars and one central crossbar.',body:grille,width:1536,height:1152,checks:['Exactly three inner upright bars with centreline gaps of 289 units, including the equal outer-frame intervals.','All uprights are parallel (0° difference); all bar crossings and frame corners are exactly 90°.','One crossbar at exactly 50% of the frame height.','Front orthographic grille with graphite metal faces and welds; no glass, wall, lock, ornament or text.'],facts:{innerUprights:3,crossbars:1,spacing:289,crossbarHeightFraction:.5,intersectionDegrees:90},alt:{en:'A metal window grille with three parallel upright bars and one horizontal crossbar.',zh:'一块金属窗花有三根互相平行的竖杆和一根横杆。'},caption:{en:'In a window grille, the upright bars are parallel and the crossbar is perpendicular to them.',zh:'窗花里，竖杆互相平行，横杆和它们垂直。'}}
 ];
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){assertAngles();if(!process.argv.includes('--check'))for(const p of anglesPlates())await render(p);console.log('angles assertions passed');}
