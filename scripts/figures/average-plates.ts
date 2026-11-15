import assert from 'node:assert/strict';
import {pathToFileURL} from 'node:url';
import {BLOCK,towers,render,type Plate} from './angles-img5-materials.js';
export const LEVELLED=[4,4,4] as const;
export const UNEVEN=[2,4,6] as const;
export function assertAverage(){
 assert.deepEqual(LEVELLED,[4,4,4]);assert.deepEqual(UNEVEN,[2,4,6]);assert.equal(LEVELLED.reduce((a,b)=>a+b,0),12);assert.equal(UNEVEN.reduce((a,b)=>a+b,0),12);
 assert(LEVELLED.every(n=>n*BLOCK.edge===640));assert.equal(BLOCK.edge,160);
 const xs=[265,667,1069];assert.equal(xs[1]!-xs[0]!,xs[2]!-xs[1]!);
}
export function averagePlates():Plate[]{return [
 {slug:'average',id:'cover',chapter:'cover',subject:'Three equal-height wooden towers, each built from four identical blocks, with no base.',body:towers(LEVELLED,[115,420,725],880),width:1024,height:1024,checks:['Exactly three towers, each four blocks high: twelve blocks total.','Every cube is the same 160-unit primitive used in the uneven-stacks figure; same wood grain, bevel and line weight.','All towers share y=880 baseline and exact 640-unit height; clear seams and gaps.','No base, scattered blocks, average line, text, scale, hands or table.'],facts:{counts:LEVELLED,total:12,block:BLOCK,baseline:880,heights:[640,640,640]},alt:{en:'Three equal wooden towers each contain four blocks.',zh:'三座一样高的木方块塔，每座各有四块。'},caption:{en:'After evening out, each tower has four blocks.',zh:'移多补少之后，每座塔都有四块。'}},
 {slug:'average',id:'uneven-stacks',chapter:'evening-out',subject:'The same wooden cubes before levelling, in towers of two, four and six blocks.',body:towers(UNEVEN,[265,667,1069],1080),width:1536,height:1152,checks:['Exactly three towers with 2 / 4 / 6 blocks from left to right: twelve in total.','Identical 160-unit cube primitive, material and line weight to the levelled cover; no substituted blocks.','All three towers share baseline y=1080; equally spaced x positions 402 units apart.','Visible bevels, three-dimensional grain and clear seams; no base, loose blocks, arrows, numerals or scale.'],facts:{counts:UNEVEN,total:12,block:BLOCK,baseline:1080,columnSpacing:402},alt:{en:'Three wooden towers contain two, four and six blocks before evening out.',zh:'移多补少之前，三座木方块塔分别有两块、四块、六块。'},caption:{en:'Before: 2, 4 and 6 blocks. After evening out, each tower has 4.',zh:'移之前：2、4、6 块。移多补少之后，每座 4 块。'}}
 ];}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){assertAverage();if(!process.argv.includes('--check'))for(const p of averagePlates())await render(p);console.log('average assertions passed');}
