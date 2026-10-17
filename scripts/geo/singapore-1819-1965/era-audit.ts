/** Read-only measurements: era area differences, shared topology and river water samples. */
import {resolve} from 'node:path';
import type {FeatureCollection,Position} from 'geojson';
import {readJson,writeJson,mapshaper,areaFeatures} from '../lib/common';
const dir=resolve(import.meta.dirname);
const coast=(id:string)=>readJson<FeatureCollection>(`${dir}/work/coast-${id}.geojson`);
const bounds=(fc:FeatureCollection)=>{
 const points=areaFeatures(fc).flatMap(f=>f.geometry.type==='Polygon'?f.geometry.coordinates.flat():f.geometry.coordinates.flat(2));
 return points.length?[Math.min(...points.map(p=>p[0]!)),Math.min(...points.map(p=>p[1]!)),Math.max(...points.map(p=>p[0]!)),Math.max(...points.map(p=>p[1]!))]:null;
};
const measured=async(fc:FeatureCollection)=>{
 const pieces=await mapshaper('-i a.json -explode -each "areaKm2=$.area/1000000"',{a:fc});
 return areaFeatures(pieces).map(f=>({areaKm2:Number(f.properties?.areaKm2),bounds:bounds({type:'FeatureCollection',features:[f]})})).sort((a,b)=>b.areaKm2-a.areaKm2);
};
const areas:Record<string,number>={};
for(const id of ['L0','L1','L2','L3','L4','L5'])areas[id]=(await measured(coast(id))).reduce((s,p)=>s+p.areaKm2,0);
// Scanline set difference avoids coincident-boundary artifacts in geographic
// boolean clipping. At 5 m latitude steps, integrate exact line intersections.
type Interval=[number,number];
function intervals(fc:FeatureCollection,y:number):Interval[]{
 const all:Interval[]=[];
 for(const f of areaFeatures(fc))for(const poly of f.geometry.type==='Polygon'?[f.geometry.coordinates]:f.geometry.coordinates){
  const xs:number[]=[];
  for(const ring of poly)for(let i=0,j=ring.length-1;i<ring.length;j=i++){
   const [ax=0,ay=0]=ring[j]!,[bx=0,by=0]=ring[i]!;
   if((ay>y)!==(by>y))xs.push(ax+(bx-ax)*(y-ay)/(by-ay));
  }
  xs.sort((a,b)=>a-b);for(let i=0;i+1<xs.length;i+=2)all.push([xs[i]!,xs[i+1]!]);
 }
 all.sort((a,b)=>a[0]-b[0]);const out:Interval[]=[];
 for(const v of all){const last=out.at(-1);if(last&&v[0]<=last[1])last[1]=Math.max(last[1],v[1]);else out.push([...v]);}
 return out;
}
function subtract(a:Interval[],b:Interval[]):Interval[]{
 const out:Interval[]=[];
 for(const [left,right] of a){let x=left;for(const [l,r] of b){if(r<=x)continue;if(l>=right)break;if(l>x)out.push([x,Math.min(l,right)]);x=Math.max(x,r);if(x>=right)break;}if(x<right)out.push([x,right]);}
 return out;
}
const differences=[];
for(const [a,b] of [['L1','L2'],['L2','L1'],['L4','L5'],['L5','L4']] as const){
 const aa=coast(a),bb=coast(b),dy=0.005/111.195,cells=new Map<string,number>();let areaKm2=0;
 for(let y=1.14+dy/2;y<1.5;y+=dy){const scale=Math.cos(y*Math.PI/180)*111.195**2*dy;
  for(const [left,right] of subtract(intervals(aa,y),intervals(bb,y))){areaKm2+=(right-left)*scale;
   for(let cell=Math.floor(left/0.02);cell<=Math.floor(right/0.02);cell++){
    const width=Math.max(0,Math.min(right,(cell+1)*0.02)-Math.max(left,cell*0.02));
    const key=`${cell},${Math.floor(y/0.02)}`;cells.set(key,(cells.get(key)??0)+width*scale);
   }
  }
 }
 const changedCells=[...cells].sort((a,b)=>b[1]-a[1]).map(([key,areaKm2])=>{const [x=0,y=0]=key.split(',').map(Number);return{areaKm2,box:[x*0.02,y*0.02,(x+1)*0.02,(y+1)*0.02]};});
 const largestChangedCells=changedCells.slice(0,20);
 // Measurement bins only: these rectangles never select, erase or add land.
 const measuredBins=[
  {name:'Tuas / Pasir Laba source-splice cells',box:[103.58,1.24,103.70,1.44]},
  {name:'Eastern Jurong / Pandan cells',box:[103.70,1.24,103.78,1.38]},
  {name:'Northern shore cells',box:[103.70,1.38,104.00,1.50]},
  {name:'Eastern shore cells',box:[103.90,1.24,104.12,1.38]},
 ].map(bin=>({...bin,areaKm2:changedCells.filter(c=>c.box[0]!>=bin.box[0]! - 1e-9&&c.box[1]!>=bin.box[1]! - 1e-9&&c.box[2]!<=bin.box[2]! + 1e-9&&c.box[3]!<=bin.box[3]! + 1e-9).reduce((sum,c)=>sum+c.areaKm2,0)}));
 differences.push({a,b,areaKm2,latitudeStepM:5,largestChangedCells,changedCells,measuredBins});
}
const topo=readJson<{arcs:unknown[];objects:Record<string,{geometries:{properties?:{id?:string;kind?:string};arcs?:unknown}[]}>}>('public/geo/land-sg-history.json');
const uses=new Map<number,Set<string>>();
function walk(v:unknown,id:string):void{if(Array.isArray(v))for(const x of v)walk(x,id);else if(typeof v==='number'){const index=v<0?~v:v;let set=uses.get(index);if(!set){set=new Set();uses.set(index,set);}set.add(id);}}
for(const obj of Object.values(topo.objects))for(const g of obj.geometries)walk(g.arcs,g.properties?.id??g.properties?.kind??'unknown');
const shared={arcs:topo.arcs.length,arcsUsedByMultipleFeatures:[...uses.values()].filter(s=>s.size>1).length,arcsSharedBetweenEras:[...uses.values()].filter(s=>[...s].filter(id=>/^L[0-5]$/.test(id)).length>1).length};
function inRing(point:Position,ring:Position[]):boolean{
 let inside=false;const [x=0,y=0]=point;
 for(let i=0,j=ring.length-1;i<ring.length;j=i++){
  const [xi=0,yi=0]=ring[i]!,[xj=0,yj=0]=ring[j]!;
  if((yi>y)!==(yj>y)&&x<(xj-xi)*(y-yi)/(yj-yi)+xi)inside=!inside;
 }
 return inside;
}
function onLand(point:Position,fc:FeatureCollection):boolean{return areaFeatures(fc).some(f=>(f.geometry.type==='Polygon'?[f.geometry.coordinates]:f.geometry.coordinates).some(p=>inRing(point,p[0]!)&&!p.slice(1).some(h=>inRing(point,h))));}
const samples=[{name:'Elgin Bridge river channel',at:[103.8493033,1.2890664]},{name:'Boat Quay channel',at:[103.8499,1.28755]},{name:'Read Bridge reference (corrected; old 103.84688,1.29063 sample was not the bridge)',at:[103.845028,1.28917]}];
const river=samples.map(s=>({...s,eras:Object.fromEntries(['L0','L1','L2'].map(id=>[id,onLand(s.at,coast(id))?'LAND':'water']))}));
writeJson(`${dir}/era-audit.json`,{method:'Mapshaper spherical area diagnostics; 5 m scanline differences of decoded published land, not inferred historical land loss. Point-in-polygon samples are river-water diagnostics, not a shoreline-accuracy certification.',areas,differences,sharedTopology:shared,river},true);
console.log(JSON.stringify({areas,differences,sharedTopology:shared,river},null,2));
