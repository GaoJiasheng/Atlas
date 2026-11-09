/** Countable exercise relationships are authored geometrically, not inferred by an image model. */
import sharp from 'sharp';
import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import assert from 'node:assert/strict';
const DIR=resolve('scripts/anatomy/rebuild-illustrations');
mkdirSync(`${DIR}/sources`,{recursive:true});
const ink='#454545';
const path=(d,fill='url(#shade)',w=1.3)=>`<path d="${d}" fill="${fill}" stroke="${ink}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;
const line=(d,w=1.1,opacity=1)=>`<path d="${d}" fill="none" stroke="${ink}" stroke-width="${w}" opacity="${opacity}" stroke-linecap="round" stroke-linejoin="round"/>`;
const circle=(x,y,r,fill='url(#shade)')=>`<circle cx="${x}" cy="${y}" r="${r}" fill="${fill}" stroke="${ink}" stroke-width="1.5"/>`;
const group=(s,x=0,y=0,scale=1,sx=1)=>`<g transform="translate(${x} ${y}) scale(${scale*sx} ${scale})">${s}</g>`;
function svg(body){return `<svg xmlns="http://www.w3.org/2000/svg" width="1500" height="1000" viewBox="0 0 1500 1000"><defs><pattern id="hatch" width="7" height="7" patternUnits="userSpaceOnUse"><path d="M-2 7L7-2M4 10L10 4" stroke="#727272" stroke-width=".45" opacity=".42"/></pattern><linearGradient id="shade" x1="0" y1="0" x2="1" y2=".1"><stop stop-color="#e8e8e8"/><stop offset=".35" stop-color="#fafafa"/><stop offset="1" stop-color="#b9b9b9"/></linearGradient><linearGradient id="cloth"><stop stop-color="#e2e2e2"/><stop offset=".5" stop-color="#f7f7f7"/><stop offset="1" stop-color="#b4b4b4"/></linearGradient><marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M1 1L9 5 1 9" fill="none" stroke="#454545" stroke-width="1.2"/></marker></defs><g>${body}</g></svg>`;}
const arrow=d=>`<path d="${d}" fill="none" stroke="#626262" stroke-width="1.7" marker-end="url(#arrow)"/>`;
function shoe(x,y,deg=0){return `<g transform="translate(${x} ${y}) rotate(${deg})">${path('M-9 -18Q4 -14 13 -14L43 -4Q52 -2 53 4L51 10Q22 15 -14 9L-17 4Z','#e1e1e1')}${line('M-14 4Q19 10 51 4M7 -12L3 -3M14 -10L11 -1M22 -8L19 0M29 -6L26 2',.9)}${path('M-14 -4L-4 -4 -1 4 -14 2Z','url(#hatch)',.7)}</g>`;}
function profileHead(){return '<g transform="translate(0 -30) scale(1 1.2)">'+path('M278 179Q263 162 266 140Q268 110 292 107Q316 106 324 130L326 147 334 157Q335 162 325 164L323 176Q318 188 300 185L299 205 280 208Z','#f0f0f0')+path('M269 143Q260 117 278 106Q300 95 317 113L322 130Q300 122 288 131L284 146 278 147Z','url(#hatch)',1.2)+line('M313 148Q306 142 305 150Q303 159 311 158M311 173L321 173',.9)+'</g>';}
function leg(a,b,c,{rear=false}={}){ // tailored calf and thigh: radii vary at knee and ankle
const [hx,hy]=a,[kx,ky]=b,[ax,ay]=c;
return path(`M${hx-19} ${hy}Q${kx-24} ${ky-45} ${kx-15} ${ky}Q${ax-21} ${ay-51} ${ax-10} ${ay}L${ax+9} ${ay}Q${ax+15} ${ay-51} ${kx+13} ${ky+3}Q${kx+26} ${ky-45} ${hx+21} ${hy}Z`,rear?'#d0d0d0':'url(#shade)')+line(`M${kx-10} ${ky-4}Q${kx} ${ky+7} ${kx+9} ${ky-3}M${kx+8} ${ky+19}Q${ax+9} ${ay-35} ${ax+4} ${ay-9}`,1,.65);}
function heel(end=false){let s='';
s+=leg([300,491],[end?275:287,653],[end?255:276,807],{rear:true});s+=shoe(end?255:276,817,-30);
s+=leg([322,491],[end?351:315,655],[end?381:319,807]);s+=shoe(end?381:319,817,-30);
s+=profileHead();
s+=path('M279 198Q252 204 248 231L253 365Q257 399 268 419L351 417Q352 385 343 342L341 239Q331 211 301 203Q288 223 279 198Z','url(#cloth)');
s+=path('M267 411Q304 425 351 412L355 497 320 514 304 479 293 512 260 501Z','url(#hatch)');
s+=path('M250 234Q235 256 240 297L246 341 255 391Q258 402 271 399L276 387 265 339 265 292 269 249Z');
s+=path('M331 235Q350 240 352 265L347 320 355 366 350 391Q342 398 336 387L333 371 327 325 326 273Z');
s+=line('M278 230Q289 238 303 234M269 386L326 392M282 426L291 475M323 435L335 483M265 268L257 301',1,.6);
s+=line('M258 394L266 392M260 397L268 395M339 381L347 379',.8);
// Thin datum aligns both heel contacts and makes the lifted forefeet unambiguous.
s+=line('M228 830L445 830',.7,.35);return s;}
function column(){let s=path('M73 161L102 150 130 164 130 801 102 814 73 802Z','#e1e1e1');s+=line('M102 153L102 810M73 208L128 208M73 760L128 760',1);s+=path('M51 805L104 792 152 811 150 827 104 839 51 824Z','url(#hatch)');s+=path('M118 309L174 309 174 704 119 704Z','#dedede');for(let i=0;i<14;i++)s+=line(`M121 ${401+i*20}L171 ${401+i*20}`,1.1);s+=line('M132 325L132 690M162 325L162 690M147 356L147 398',2);s+=circle(141,352,13);s+=circle(128,760,18);s+=circle(128,760,7,'#efefef');s+=line('M139 353L139 373 126 373 126 741',1.8);for(let i=0;i<8;i++)s+=circle(87,280+i*48,2.2,'#686868');return s;}
function cuff(x,y){return path(`M${x-14} ${y-8}Q${x} ${y-3} ${x+13} ${y-8}L${x+13} ${y+7}Q${x} ${y+13} ${x-14} ${y+7}Z`,'url(#hatch)',1.1)+circle(x-14,y,3,'#ededed');}
function adduction(end=false){let s=column();
// Both panels have identical trunk, column, planted limb and camera. Only cuffed limb changes.
s+=leg([348,501],[360,650],[365,798]);s+=shoe(366,813,0);
const near=end?[[306,500],[338,638],[396,791]]:[[306,500],[270,640],[225,787]];
s+=leg(...near);s+=shoe(near[2][0],near[2][1]+15,end?7:-5);s+=cuff(near[2][0],near[2][1]-14);s+=line(`M143 761L${near[2][0]-14} ${near[2][1]-14}`,1.8);
s+=path('M303 188L303 211 284 222Q280 258 273 295L282 358 275 426Q319 440 369 425L360 361 372 289 361 231 335 211 334 184Z','url(#cloth)');
s+='<g transform="translate(0 -30) scale(1 1.2)">'+path('M306 184Q287 172 290 143Q291 114 315 111Q339 113 343 142L340 167 329 188Z','#eeeeee');s+=path('M291 147Q282 122 301 111Q324 100 340 121L343 138Q315 128 291 147Z','url(#hatch)',1.2);
s+=line('M293 150Q300 147 301 155M334 149L338 156M314 176L328 175',.9)+'</g>'+line('M301 214Q314 231 334 213',.9);
s+=path('M282 235Q267 237 257 259L219 288 143 284 139 299 219 308Q234 303 246 296L279 277 290 255Z');
s+=path('M143 285L133 281 123 282 119 287 128 291 117 293 118 298 130 303 142 299Z','#efefef');s+=line('M125 285L136 288M124 291L135 294M125 297L135 299',.75);
s+=path('M360 237Q381 243 384 273L379 337 376 381Q381 393 374 404L363 402 359 386 363 334 358 286 349 256Z');s+=line('M364 385L370 386M364 391L371 392M365 397L372 398',.8);
s+=path('M276 420Q319 432 368 420L376 504 343 514 323 477 312 516 275 502Z','url(#hatch)');s+=line('M286 397L352 401M294 434L304 480M343 436L355 487',1,.6);return s;}
function bench(end=false){const shoulder={x:252,y:460}, wrist=end?{x:315,y:458}:{x:252,y:265};const elbow=end?{x:317,y:554}:{x:252,y:360};
if(!end)assert.equal(wrist.x,shoulder.x,'bar must be directly above shoulder');
else assert.equal(wrist.x,elbow.x-2,'forearm should be vertical at bottom');
let s='';
// Bench footprint and support structure.
s+=path('M122 516L450 516 465 529 135 531Z','#d1d1d1')+path('M135 531L465 529 465 546 135 550Z','url(#hatch)');
s+=path('M170 548L184 548 184 701 169 701Z','#ddd')+path('M413 546L428 546 428 700 413 700Z','#ddd');
s+=path('M143 697L208 697 215 711 135 711Z','url(#hatch)')+path('M393 696L450 696 458 711 385 711Z','url(#hatch)');
// Far lower limb behind body.
s+=path('M393 486Q438 473 462 495L509 568 489 641 470 650 481 567 442 532 393 526Z','#d2d2d2')+shoe(478,661,3);
// Head rests directly on the padded bench, neck in neutral continuation.
s+=path('M185 475Q164 471 155 483L147 494 143 497 151 503Q157 520 181 519L204 508 224 508 229 482Z','#efefef')+path('M153 487Q155 467 178 469L192 474 190 484 174 482 165 491Z','url(#hatch)',1.1);
s+=path('M210 479Q235 451 277 453L330 473 385 482 398 514 341 523 277 514 219 514Z','url(#cloth)');
s+=path('M379 483Q416 474 437 493L450 529 423 548 399 529 384 523Z','url(#hatch)');
s+=path('M430 507Q448 498 459 518L498 574Q502 586 493 600L465 672 445 674 460 595 423 554Z');s+=shoe(446,687,0);
// Both upper arms originate at the shoulder, with rounded elbow and wrist contours.
if(end){
 s+=path('M266 456Q289 462 326 524Q337 540 340 521L339 439 357 435 361 528Q362 554 343 560Q325 565 312 545L258 479Z','#d2d2d2');
 s+=path('M244 456Q253 451 263 467L309 538Q313 544 310 529L305 461 323 457 330 538Q333 561 316 565Q303 568 291 550L243 478Q234 467 244 456Z');
 s+=line('M307 550Q315 555 324 547M312 480L317 523M284 504L303 536',1,.6);
}else{
 s+=path('M267 460Q278 452 276 434L278 364 279 250 298 247 301 362 297 446Q296 470 281 481Z','#d2d2d2');
 s+=path('M241 468Q230 458 235 440L240 361 242 278 262 276 265 361 266 443Q267 469 253 477Z');
 s+=line('M241 366Q250 373 261 366M251 294L250 344',1,.65);
}
s+=line('M263 481Q292 490 325 493M217 499L249 505M433 535L450 547',1,.7);
// Barbell along a visible shallow perspective axis, two circular plate packs, two collars.
const bx=wrist.x,by=wrist.y;const farX=bx+95,farY=by-47;
s+=line(`M${bx-58} ${by+29}L${farX+48} ${farY-24}`,7);s+=line(`M${bx-58} ${by+27}L${farX+48} ${farY-26}`,2,.6);
for(const [x,y] of [[farX+12,farY-6],[bx-42,by+21]]){s+=`<ellipse cx="${x}" cy="${y}" rx="24" ry="54" transform="rotate(27 ${x} ${y})" fill="url(#hatch)" stroke="#454545" stroke-width="2"/><ellipse cx="${x}" cy="${y}" rx="16" ry="44" transform="rotate(27 ${x} ${y})" fill="none" stroke="#747474" stroke-width="1"/>`;s+=circle(x,y,4,'#dedede');s+=line(`M${x-17} ${y+9}l-9 4`,9);}
for(const [x,y] of [[bx,by],[bx+50,by-25]]){s+=path(`M${x-8} ${y+9}L${x-9} ${y-2}Q${x-11} ${y-8} ${x-7} ${y-10}L${x-2} ${y-7}Q${x} ${y-14} ${x+4} ${y-13}L${x+12} ${y-8}Q${x+17} ${y-3} ${x+14} ${y+4}L${x+5} ${y+11}Z`,'#eee',1.1)+line(`M${x-3} ${y-7}L${x+2} ${y-2}M${x+3} ${y-9}L${x+8} ${y-4}M${x+8} ${y-7}L${x+12} ${y-2}`,.8);}
return s;}
const rows=[['heel-walk',group(heel(false),45,35,.95,1.25)+group(heel(true),730,35,.95,1.25)+arrow('M635 490Q690 465 743 490')],['cable-hip-adduction',group(adduction(false),25,35,.95,1.25)+group(adduction(true),735,35,.95,1.25)+arrow('M663 570Q706 545 747 570')],['barbell-bench-press',group(bench(false),55,100,1.08)+group(bench(true),770,100,1.08)+arrow('M644 460Q688 438 730 460')]];
for(const [id,body] of rows){writeFileSync(`${DIR}/sources/${id}.svg`,svg(body));await sharp(Buffer.from(svg(body))).png().toFile(`${DIR}/sources/${id}.png`);console.log(id);}
writeFileSync(`${DIR}/exercise-geometry.json`,JSON.stringify({barbellBenchPress:{startShoulder:[252,460],startBar:[252,265],endElbow:[317,554],endWrist:[315,458],twoPlatePacks:true,twoCollars:true},heelWalk:{shoePitchDegrees:30,projectedPitchDegrees:24.8,heelOnlyContact:true},cableHipAdduction:{machineTransformIdentical:true,supportLegIdentical:true,nearLegStartAnkle:[225,787],nearLegEndAnkle:[396,791],pulley:[128,760]}},null,2)+'\n');
