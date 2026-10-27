import { describe, expect, it, vi } from 'vitest';
import type { FeatureCollection } from 'geojson';
import type { Map as MlMap } from 'maplibre-gl';
import type { ThemeTokens } from '../../src/theme/theme';
import type { DatedLayerDef } from '../../src/content/schema/topic';
import { catalogueHitDistance, resolveCataloguePick, type CatalogueLayer } from '../../src/engines/time-scene/lib/catalogue';
import { prepareDatedLayer, decodeDatedLayer, indexDatedLayer } from '../../src/engines/time-scene/lib/datedLayers';
import { createDatedMapLayer } from '../../src/engines/time-scene/stages/geo/datedLayers';
const def: DatedLayerDef={id:'sample-quakes',file:'sample-quakes',kind:'point',color:'token:cold',label:{en:'Sample',zh:'样本'},recent:false,catalogue:{file:'sample-metadata'}};
const features:FeatureCollection={type:'FeatureCollection',features:[{type:'Feature',properties:{id:'sample-a',f:2004},geometry:{type:'Point',coordinates:[103,1]}}]};
const ready:CatalogueLayer={id:def.id,def,status:'ready',features,entries:[{id:'sample-a',at:[103,1],title:{en:'A',zh:'甲'},summary:{en:'Synthetic',zh:'合成'},sources:['S1'],rows:[]}]};
describe('deferred catalogue resolution',()=>{
 it('waits for missing metadata, resolves its layer before unrelated requests, and rejects late data after navigation',()=>{
  const second={...def,id:'another-layer',file:'another-layer'};
  expect(resolveCataloguePick('sample-a','sample-a',[def],[def.id],[],2004)).toBe('waiting');
  expect(resolveCataloguePick('sample-a','sample-a',[def,second],[def.id,second.id],[ready],2004)).toMatchObject({entry:{id:'sample-a'}});
  expect(resolveCataloguePick('sample-a',null,[def],[def.id],[ready],2004)).toBe('cancelled');
  expect(resolveCataloguePick('sample-a','another-pick',[def],[def.id],[ready],2004)).toBe('cancelled');
 });
 it('rejects a hidden source, future row or failed catalogue without manufacturing zeros',()=>{
  expect(resolveCataloguePick('sample-a','sample-a',[def],[],[ready],2004)).toBe('invalid');
  expect(resolveCataloguePick('sample-a','sample-a',[def],[def.id],[ready],2003)).toBe('invalid');
  expect(resolveCataloguePick('sample-a','sample-a',[def],[def.id],[{...ready,status:'error',entries:[]}],2004)).toBe('invalid');
 });
});
describe('selected GPU overlays',()=>{
 it('keeps selected geometry date-filtered before React clears stale selection and repaints both circle colours',()=>{
  const map={addSource:vi.fn(),addLayer:vi.fn(),setFilter:vi.fn(),setLayoutProperty:vi.fn(),setPaintProperty:vi.fn()};
  const tokens={signal:'#aa1100',ink:'#333333'} as ThemeTokens;
  const layer=createDatedMapLayer(map as unknown as MlMap,def,features,tokens,'#123456',2004);
  layer.setSelected('sample-a');
  layer.update(2003);
  expect(map.setFilter.mock.lastCall).toEqual(['ts-dated-sample-quakes-selected',['all',['==',['get','id'],'sample-a'],['all',['<=',['get','f'],2003],['>',['coalesce',['get','u'],1e9],2003]]]]);
  const count=map.setFilter.mock.calls.length;
  for(let i=0;i<60;i++) layer.update(2003-i/1000);
  expect(map.setFilter).toHaveBeenCalledTimes(count);
  layer.setTheme({...tokens,signal:'#ff8800'},'#123456');
  expect(map.setPaintProperty).toHaveBeenCalledWith('ts-dated-sample-quakes-selected','circle-color','#ff8800');
  expect(map.setPaintProperty).toHaveBeenCalledWith('ts-dated-sample-quakes-selected','circle-stroke-color','#ff8800');
  expect(map.addSource).toHaveBeenCalledOnce();
 });
});

it('prepares large lazy sources in bounded yielding batches without changing geometry or counts',async()=>{
 const topo={type:'Topology' as const,arcs:[],objects:{batch:{type:'GeometryCollection' as const,geometries:Array.from({length:1001},(_,i)=>({type:'Point' as const,coordinates:[103+i/10000,1],properties:{id:`point-${i}`,f:2000+i%3}}))}}};
 const yieldWork=vi.fn(async()=>{});
 const prepared=await prepareDatedLayer(topo,'batch',def,yieldWork);
 expect(yieldWork).toHaveBeenCalledTimes(4);
 expect(prepared?.collection).toEqual(decodeDatedLayer(topo,'batch'));
 expect(prepared?.index).toEqual(indexDatedLayer(prepared!.collection,def));
});

it('exact screen hits reject polygon corners outside 22px and respect interior holes',()=>{
 const project=([x=0,y=0]:number[])=>({x,y});
 const polygon={type:'Polygon' as const,coordinates:[[[0,0],[100,0],[100,100],[0,100],[0,0]],[[20,20],[80,20],[80,80],[20,80],[20,20]]]};
 expect(catalogueHitDistance(polygon,{x:-22,y:-22},project)).toBeCloseTo(Math.sqrt(968));
 expect(catalogueHitDistance(polygon,{x:10,y:10},project)).toBe(0);
 expect(catalogueHitDistance(polygon,{x:50,y:50},project)).toBe(30);
 expect(catalogueHitDistance({type:'LineString',coordinates:[[0,0],[100,0]]},{x:50,y:22},project)).toBe(22);
});

describe('pick is a store field of dated TimeScene topics', () => {
 it('is in the engine defaults, so the store snapshot (and so the URL) carries it', async () => {
  const { timeSceneEngine } = await import('../../src/engines/time-scene/index');
  const defaults = timeSceneEngine.defaults({} as Parameters<typeof timeSceneEngine.defaults>[0], undefined) as Record<string, unknown>;
  expect(defaults).toHaveProperty('pick', null);
 });
});
