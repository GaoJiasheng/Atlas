import {describe,expect,it} from 'vitest';
import {GHOST_OPACITY,resolveAllPartDisplays,type DisplayState} from '../../src/engines/space-scene/lib/visibility';
const parts=[
 {id:'bone-a',group:'repair'}, {id:'bone-b',group:'repair'},
 {id:'clot',group:'repair',context:true,displayWith:'bone-a'},
 {id:'callus',group:'repair',context:true,displayWith:'bone-b'},
 {id:'stand',context:true},
];
const state:DisplayState={view:'assembled',part:'bone-b',layers:['repair']};
describe('context material skins inherit their owner display',()=>{
 it('SOLO ghosts another specimen and its skin together, retaining ordinary scenery',()=>{
  const d=resolveAllPartDisplays(parts,{...state,solo:'bone-b'});
  expect(d.get('bone-a')!.opacity).toBe(GHOST_OPACITY);
  expect(d.get('clot')).toEqual({...d.get('bone-a'),selected:false,selectable:false});
  expect(d.get('callus')!.opacity).toBe(1);
  expect(d.get('callus')!.selectable).toBe(false);
  expect(d.get('stand')!.opacity).toBe(1);
 });
 it.each([
  {hidden:['bone-a']},{ghosted:['bone-a']},{ghosted:['repair']},
  {layers:[]},{view:'isolate' as const},{view:'xray' as const},
  {highlight:{signal:['bone-a'],cold:[]}},
  {solo:'repair'},
 ])('inherits visibility, faintness, tint and depth state for %o',change=>{
  const d=resolveAllPartDisplays(parts,{...state,...change});
  expect(d.get('clot')).toEqual({...d.get('bone-a'),selected:false,selectable:false});
  expect(d.get('callus')).toEqual({...d.get('bone-b'),selected:false,selectable:false});
 });
 it('can hide a skin explicitly without hiding its owner',()=>{
  const d=resolveAllPartDisplays(parts,{...state,hidden:['callus']});
  expect(d.get('callus')!.visible).toBe(false);
  expect(d.get('callus')!.hidden).toBe(true);
  expect(d.get('bone-b')!.visible).toBe(true);
 });
 it('keeps selected owner and skin solid in X-RAY and restores after SOLO',()=>{
  const x=resolveAllPartDisplays(parts,{...state,view:'xray'});
  expect(x.get('callus')!.ghost).toBe(false);
  const d=resolveAllPartDisplays(parts,{...state,solo:null});
  expect(d.get('clot')!.opacity).toBe(1);
 });
});
