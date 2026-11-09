import { saveGuide } from './round2-graphite.js';
import assert from 'node:assert/strict';
import { main,etched,path,line,arrow,ellipse } from './redo-cd-utils.js';
export function swallowing(){
 const airway={left:576,right:708,top:548,bottom:824};
 const gullet={left:762,right:900,top:490,bottom:824};
 const bolus={x:810,y:478,rx:61,ry:68};
 assert(airway.right<gullet.left);assert(bolus.x>airway.right);assert(bolus.rx*2*.35>=40);
 const closure={left:552,right:728,y:542};assert(closure.left<=airway.left&&closure.right>=airway.right);
 let b=etched('M260 300Q230 135 445 91Q727 37 905 211Q971 295 968 439L986 822H885L860 649Q848 571 769 547Q655 538 603 580Q567 632 554 715L528 824H380L432 613Q436 566 378 541L302 522Q266 504 281 475L267 459Q243 457 253 437L232 415Q203 411 215 390L260 330Z','#dedede');
 // Nasal space and raised soft palate seal at the posterior pharyngeal wall.
 b+=etched('M277 307Q340 235 486 234Q619 230 700 281L772 285L793 310Q702 340 590 311Q407 283 279 349Z','#aaa');
 b+=etched('M315 353Q436 314 583 339Q662 353 698 374L739 360Q729 320 772 285L793 310L771 389Q715 417 655 399Q470 358 315 390Z','#e8e8e8');
 // Oral cavity, contained incisors, tongue raised against palate.
 b+=etched('M292 392Q445 363 596 400Q681 424 733 411L771 423L761 484Q663 481 583 458Q428 428 296 440Z','#777');
 b+=etched('M315 442Q455 383 590 422Q654 441 725 426Q738 470 681 494Q515 516 354 477Z','#bababa');
 b+=etched('M309 365L337 369L335 403L314 403Z','#efefef');
 // Food route is posterior to the larynx and remains open into the gullet.
 b+=etched('M793 310L841 337Q899 398 900 490V824H762V577Q768 535 748 510L761 484Q778 419 793 310Z','#f0f0f0');
 b+=etched('M576 548H708V824H576Z','#ececec');
 for(let y=590;y<824;y+=37)b+=path(`M577 ${y}Q642 ${y+17}707 ${y}`,'none','#898989',2.1);
 // Broad folded epiglottis covers the entire laryngeal inlet; no open airway-food connection.
 // The cartilage remains rooted at the anterior laryngeal wall; its broad tip
 // lies over the inlet. A continuous stalk prevents a floating flap reading.
 b+=etched('M576 588L576 548L552 542V520Q634 504 710 531L728 542Q653 556 599 548L599 588Z','#858585');
 b+=ellipse(bolus.x,bolus.y,bolus.rx,bolus.ry,'#939393','#555',1.3);
 b+=ellipse(bolus.x,bolus.y,bolus.rx,bolus.ry,'url(#hatch)','none');
 b+=arrow([440,407],[581,415],2.4)+arrow([829,584],[829,749],3);
 b+=line([[724,581],[724,813]],'#aaa',.9);
 return b;
}
if(main(import.meta.url))await saveGuide('digestive-system-swallowing',swallowing());
