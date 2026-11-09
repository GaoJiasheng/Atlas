/** Five enlarged torso crops. All mouths are outside the image; the food tube stays in the neck. */
import assert from 'node:assert/strict';
import { pathToFileURL } from 'node:url';
import { path, svg, writePlate } from './graphite';
import { assertLayout, source, type Box } from './b-layout';
export const systems=['skeletal','muscular','respiratory','circulatory','digestive'] as const;
export const boxes:Box[]=[{x:45,y:30,w:330,h:400},{x:435,y:30,w:330,h:400},{x:825,y:30,w:330,h:400},{x:225,y:475,w:330,h:400},{x:645,y:475,w:330,h:400}];
const centres=[186,396,600,806,1016];
export function assertSystems():void {assert.equal(new Set(systems).size,5);assert.equal(boxes.length,5);assertLayout(boxes);const esophagus={x:1016,y:210},neck={left:993,right:1036};assert(esophagus.x>neck.left&&esophagus.x<neck.right);assert(175>155,'the open mouth and projecting tongue are excluded');assert(400/290*90*420/1200>=40,'stomach remains at least 40 px');}
export function systemsSvg():string {
 return svg(boxes.map((b,i)=>{const c=centres[i]!,scale=b.h/290,dx=b.x+(b.w-188*scale)/2,outline=`M${c-30} 175H${c+30}L${c+70} 188L${c+88} 205L${c+82} 258L${c+62} 319L${c+70} 465H${c-70}L${c-62} 319L${c-82} 258L${c-88} 205L${c-70} 188Z`;
  return `<g transform="translate(${dx} ${b.y}) scale(${scale}) translate(${-c+94} -175)"><clipPath id="torso-${i}">${path(outline,'white','none')}</clipPath><image href="${source('digestive-system-five-systems')}" width="1200" height="900" clip-path="url(#torso-${i})"/></g>`;
 }).join(''));
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){assertSystems();await writePlate('public/illustrations/figures/digestive-system-five-systems.webp',systemsSvg());}
