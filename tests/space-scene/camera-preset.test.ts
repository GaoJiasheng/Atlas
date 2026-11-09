import { afterEach, describe, expect, it, vi } from 'vitest';
import { createSceneStore } from '../../src/engines/core/store';
import { createHudActions, createHudStore, registerSceneControls } from '../../src/engines/core/controls';
import { useSceneKeys } from '../../src/engines/core/keys';
import { spaceSceneEngine, type SpaceSceneExt } from '../../src/engines/space-scene';
import type { SceneSnapshot, TopicMeta } from '../../src/engines/core/types';
import { partsFile, cameraPresetSchema } from '../../src/engines/space-scene/schema';
import { applyNamedCameraPreset } from '../../src/engines/space-scene/lib/camera-preset';
import { resolvePartDisplay } from '../../src/engines/space-scene/lib/visibility';
import { readFileSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { parse } from 'yaml';
import steam from '../../src/content/topics/steam-engine/data/parts.json';

vi.mock('react',async importOriginal => ({...await importOriginal<typeof import('react')>(),useEffect:(fn:()=>void)=>fn()}));
afterEach(() => vi.unstubAllGlobals());
const file = partsFile.parse(steam);
function makeStore() {
  return createSceneStore<SpaceSceneExt>({chapters:[], defaults:{
    ...spaceSceneEngine.defaults({} as TopicMeta,undefined),chapter:null,
    layers:['steam-supply','working-motion'],camera:null,theme:undefined,
  } as SceneSnapshot<SpaceSceneExt>});
}

describe('camera preset required layers', () => {
  it('button action and real digit-4 handler reveal the Newcomen module and share HUD state', () => {
    const target = new EventTarget();
    vi.stubGlobal('window',target);
    vi.stubGlobal('Element',class {});
    const store = makeStore(), hud = createHudStore();
    const items = [{id:'orbit',label:'Orbit'},{id:'reference',label:'Reference'},...file.presets!];
    registerSceneControls(hud,{presets:{items,set:(id,options)=>{
      const preset = file.presets!.find(p=>p.id===id);
      if (preset) applyNamedCameraPreset(store,preset,file.parts,options);
    }}});
    const actions = createHudActions(hud,{suppress:fn=>fn()});
    const nc = file.parts.find(p=>p.id==='nc-cylinder')!;
    expect(resolvePartDisplay(nc,store.getState(),file.parts).visible).toBe(false);
    actions.setPreset('newcomen-view');
    const button = store.getState().snapshot();
    expect(button.layers).toEqual(['steam-supply','working-motion','teaching']);
    expect(resolvePartDisplay(nc,store.getState(),file.parts).visible).toBe(true);
    expect(hud.getState().presetId).toBe('newcomen-view');
    store.getState().setLayers(['steam-supply','working-motion']);
    store.getState().setCamera(null);
    hud.setState({presetId:null});
    useSceneKeys(hud,actions,()=>{});
    const event = new Event('keydown');
    Object.defineProperty(event,'key',{value:'4'});
    target.dispatchEvent(event);
    expect(store.getState().snapshot()).toEqual(button);
    expect(store.getState().transition.reason).toBe('preset');
    expect(hud.getState().presetId).toBe('newcomen-view');
    actions.setPreset('newcomen-view');
    expect(store.getState().layers).toEqual(button.layers); // no duplicates
  });
  it('preserves layers for camera-only presets and keeps existing view/explode semantics', () => {
    const store = makeStore(), preset = file.presets![0]!;
    applyNamedCameraPreset(store,preset,file.parts,{instant:true});
    expect(store.getState().layers).toEqual(['steam-supply','working-motion']);
    expect(store.getState().transition.instant).toBe(true);
    applyNamedCameraPreset(store,{...preset,view:'exploded'},file.parts,{instant:false});
    expect(store.getState().view).toBe('exploded');
    expect(store.getState().explode).toBe(0.7);
    store.getState().patch({explode:0.4});
    applyNamedCameraPreset(store,{...preset,view:'exploded'},file.parts,{instant:false});
    expect(store.getState().explode).toBe(0.4);
  });
  it('reveals the required module even when chapters hide it or the reader used solo/isolate', () => {
    const dir = resolve(import.meta.dirname,'../../src/content/topics/steam-engine/chapters');
    const preset = file.presets!.find(p=>p.id==='newcomen-view')!;
    const module = file.parts.filter(p=>p.id.startsWith('nc-'));
    for (const path of readdirSync(dir).filter(p=>p.endsWith('.mdx'))) {
      const chapter = parse(readFileSync(resolve(dir,path),'utf8').split('---')[1]!).state;
      for (const state of [chapter,...(chapter.beats ?? []).map((b:object)=>({...chapter,...b}))]) {
        const store = makeStore();
        store.getState().patch({...spaceSceneEngine.fromChapterState!(state),layers:state.layers});
        store.getState().patch({view:'isolate',part:'boiler',solo:'steam-supply',ghosted:['teaching'],hidden:[...store.getState().hidden,'boiler']});
        applyNamedCameraPreset(store,preset,file.parts,{instant:true});
        for (const p of module) {
          const display = resolvePartDisplay(p,store.getState(),file.parts);
          expect(display.visible,`${path}: ${p.id}`).toBe(true);
          expect(display.faint).toBe(false);
        }
        expect(store.getState().hidden).toContain('boiler');
        // `show` reveals the module only: the energy bars sharing its group keep the chapter's hide.
        for (const id of ['energy-input','energy-work','energy-reject'].filter(id=>(state.hide ?? []).includes(id)))
          expect(store.getState().hidden,`${path}: ${id}`).toContain(id);
      }
    }
  });
  it('validates required layer references and rejects an empty declaration', () => {
    const preset = file.presets![1]!;
    expect(preset.layers).toEqual(['teaching']);
    expect(cameraPresetSchema.safeParse({...preset,layers:[]}).success).toBe(false);
    const parsed = partsFile.safeParse({...steam,presets:[{...preset,layers:['missing-layer']}]});
    expect(parsed.success).toBe(false);
    if (!parsed.success) expect(parsed.error.issues.some(i=>i.path.join('.')==='presets.0.layers.0')).toBe(true);
    const stray = partsFile.safeParse({...steam,presets:[{...preset,show:['boiler']}]});
    expect(stray.success).toBe(false);
    if (!stray.success) expect(stray.error.issues.some(i=>i.path.join('.')==='presets.0.show.0')).toBe(true);
  });
});
