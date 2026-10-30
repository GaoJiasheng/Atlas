import { describe, expect, it, vi } from 'vitest';
import type { FeatureCollection } from 'geojson';
import { indexDatedLayer, datedLayerState } from '../../src/engines/time-scene/lib/datedLayers';
import { toNumber } from '../../src/engines/time-scene/lib/time';
import { datedLayerStyles, createDatedMapLayer } from '../../src/engines/time-scene/stages/geo/datedLayers';
import type { DatedLayerDef } from '../../src/content/schema/topic';
import type { ThemeTokens } from '../../src/theme/theme';
import type { Map as MlMap } from 'maplibre-gl';
const fc = (...properties: Record<string, unknown>[]): FeatureCollection => ({ type: 'FeatureCollection', features: properties.map((p, i) => ({ type: 'Feature', properties:p, geometry: {type:'Point',coordinates:[103+i,1]}})) });
const reference: DatedLayerDef = {id:'reference-fixture',file:'reference-fixture',kind:'point',color:'token:cold',label:{en:'Reference',zh:'参考'},temporal:{mode:'reference',note:{en:'Fixed',zh:'固定'},release:'v1'}};
describe('scientific layer time boundaries', () => {
 it('keeps reference positions visible over historical dates with no recent window', () => {
  const index=indexDatedLayer(fc({id:'a'},{id:'b'}),reference);
  for(const t of ['1815-04-10','2024-12-31']) expect(datedLayerState(index,toNumber(t))).toMatchObject({visible:2,recent:0,signature:'reference'});
 });
 it('preserves legacy half-open date windows', () => {
  const index=indexDatedLayer(fc({f:2000,u:2001}));
  expect([1999.9,2000,2001].map(t=>datedLayerState(index,t).visible)).toEqual([0,1,0]);
 });
 it('uses UTC day decimal years and disables recent for quake samples', () => {
  const index=indexDatedLayer(fc(...['2000-01-01','2004-12-26','2024-12-31'].map(day=>({f:toNumber(day)}))),{recent:false});
  const states=['1999-12-31','2000-01-01','2004-12-25','2004-12-26','2024-12-31'].map(day=>datedLayerState(index,toNumber(day)));
  expect(states.map(s=>s.visible)).toEqual([0,1,1,2,3]);
  expect(states.every(s=>s.recent===0)).toBe(true);
 });
 it('reveals an observation group on its source date, independent of arrivals', () => {
  const index=indexDatedLayer(fc({f:toNumber('2004-12-26')},{f:toNumber('2004-12-26')}),{recent:false});
  expect(['2004-12-25','2004-12-26','2004-12-27'].map(day=>datedLayerState(index,toNumber(day)).visible)).toEqual([0,2,2]);
 });
});

describe('scientific GPU source caching', () => {
 it('submits a reference source once and never filters it during 60 frames', () => {
  const map={addSource:vi.fn(),addLayer:vi.fn(),setFilter:vi.fn(),setLayoutProperty:vi.fn(),setPaintProperty:vi.fn()};
  const tokens={signal:'#cc6328',ink:'#333333'} as ThemeTokens;
  const layer=createDatedMapLayer(map as unknown as MlMap,reference,fc({id:'a'},{id:'b'}),tokens,'#333333',1815);
  for(let frame=0;frame<60;frame++) layer.update(1815+frame*3);
  expect(map.addSource).toHaveBeenCalledOnce();
  expect(map.setFilter).not.toHaveBeenCalled();
  expect(layer.stats()).toMatchObject({total:2,visible:2,recent:0,filterUpdates:0,sourceUpdates:1,mode:'reference'});
  expect(datedLayerStyles(reference,tokens,'#333333',2000)).toHaveLength(1);
 });
 it('updates dated filters once at a boundary with recent disabled', () => {
  const map={addSource:vi.fn(),addLayer:vi.fn(),setFilter:vi.fn(),setLayoutProperty:vi.fn(),setPaintProperty:vi.fn()};
  const def={...reference,temporal:undefined,recent:false};
  const layer=createDatedMapLayer(map as unknown as MlMap,def,fc({f:2000},{f:2004}),{signal:'#cc6328',ink:'#333333'} as ThemeTokens,'#333333',2003);
  layer.update(2004);
  for(let frame=0;frame<60;frame++) layer.update(2004+frame/100);
  expect(map.setFilter).toHaveBeenCalledOnce();
  expect(layer.stats()).toMatchObject({visible:2,recent:0,filterUpdates:1,sourceUpdates:1});
 });
});
