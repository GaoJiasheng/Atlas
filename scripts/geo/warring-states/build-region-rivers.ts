/** Build region coastline and historical river lines from published sources. */
import {readFileSync,writeFileSync} from 'node:fs';
import {readSvg} from '../lib/svg';
import {candidates,evaluate} from '../lib/fit';
import {mapshaper,mapshaperApi,toFc,writeJson} from '../lib/common';
const dir='scripts/geo/warring-states';
const m=JSON.parse(readFileSync(`${dir}/sources.json`,'utf8'));
const cps=JSON.parse(readFileSync(`${dir}/g1-control-points.json`,'utf8'));
m.datasets['G1-registration']={...m.datasets.G1,file:'G1-registration.svg',role:'Style-only registration copy of G1: inline fills, all geographic paths unmodified'};
m.svg.G1={dataset:'G1-registration',projection:'equirectangular+affine',classes:{},land:['#a8c68f'],controlPoints:cps,maxResidualKm:5};
m.datasets['G2-registration']={...m.datasets.G2,file:'G2-registration.svg',role:'Geometrically unchanged background-only registration copy; G2 shares G1 base'};
m.svg.G2={...m.svg.G1,dataset:'G2-registration',controlPoints:[],controlPointsFrom:'G1'};
writeJson(`${dir}/sources.json`,m,true);
const best=evaluate(candidates('equirectangular+affine',cps)[0]!.proj,'affine',cps);writeJson(`${dir}/g1-river-fit.json`,best.report,true);console.log('G1 fit',best.report.rmsKm,best.report.maxKm);
const doc=readSvg(readFileSync(`${dir}/raw/G1-rivers.svg`,'utf8'));
const metadata=JSON.parse(readFileSync(`${dir}/river-path-metadata.json`,'utf8'));
const rivers=toFc(doc.shapes.map(s=>({type:'Feature' as const,properties:metadata[s.id],geometry:{type:'MultiLineString' as const,coordinates:s.rings.map(r=>r.map(([x,y])=>best.model.toLngLat(x,y).map(v=>Number(v.toFixed(5)))))}})));
// NE middle/upper reaches are already present in G1. G1's historical lower reaches
// replace, rather than supplement, today's post-1855 Yellow River course.
for(const f of rivers.features){delete f.properties!.src;delete f.properties!.method;}
const thin=await mapshaper('-i rivers.json -simplify interval=400 keep-shapes',{rivers});
writeJson('public/geo/warring-states-rivers.json',thin);
const land=JSON.parse(readFileSync(`${dir}/raw/ne-land.geojson`,'utf8'));
const clipped=await mapshaper('-i land.json -clip bbox=100,20,125,44 -dissolve2 -simplify interval=1500 keep-shapes -clean',{land});
for(const f of clipped.features)f.properties={kind:'land'};
// Only real shoreline segments are stroked: bbox clip edges never become coast.
const rawCoast=await mapshaper('-i land.json -lines -clip bbox=100,20,125,44 -simplify interval=1500 keep-shapes',{land});
for(const f of rawCoast.features)f.properties={kind:'coast'};
const region=toFc([...clipped.features,...rawCoast.features]);
const out=await mapshaperApi().applyCommands('-i region.json -o region.topojson format=topojson quantization=100000',{ 'region.json':region });
const topo=JSON.parse(out['region.topojson']!.toString());topo.objects={'warring-states-region':{type:'GeometryCollection',geometries:Object.values(topo.objects).flatMap((o:any)=>o.geometries??[o])}};topo.bbox=[100,20,125,44];
writeJson('public/geo/warring-states-region.json',topo);
console.log('Rivers',thin.features.length,'region',clipped.features.length,'coast',rawCoast.features.length);
