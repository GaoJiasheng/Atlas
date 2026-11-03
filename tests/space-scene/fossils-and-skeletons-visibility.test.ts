/** Measure the exact stage flag gate, not an amplified triangle-ray workload. */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it, vi } from 'vitest';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { evaluateSim } from '../../src/engines/space-scene/lib/sim';
import { simEffects } from '../../src/engines/space-scene/lib/sim/bind';
import { resolveSimValues } from '../../src/engines/space-scene/lib/sim/controls';
import { simSchema } from '../../src/engines/space-scene/sim-schema';
import { resolveAllPartDisplays, type PartRef } from '../../src/engines/space-scene/lib/visibility';
import { applyVisibilityFlags, gateSimulationVisibility, visibilityBaseOpacity, type VisibilityObject } from '../../src/engines/space-scene/stages/model3d/visibilityFlags';

const file = JSON.parse(readFileSync(join(import.meta.dirname, '../../src/content/topics/fossils-and-skeletons/data/parts.json'), 'utf8'));
const sim = simSchema.parse(file.sim);
const ids = (file.parts as { id: string; group?: string }[]).filter(p => p.group === 'skeleton').map(p => p.id);
const expectedHidden = ['sk-arm-r', 'sk-neck', 'sk-ribs', 'sk-tail-base', 'sk-tail-tip'];
function hiddenFor(choice: string): Set<string> {
  const values = resolveSimValues(sim, { 'evidence-view': choice });
  return simEffects(sim, values, evaluateSim(sim, values)).hidden;
}

/** Deliberately inaccessible payloads: accidental rebuild/traversal fails immediately. */
function fixture(triangles: number) {
  const operations: Record<string, number> = {};
  const note = (key: string) => { operations[key] = (operations[key] ?? 0) + 1; };
  const modules = ids.map(id => {
    let visible = true, castShadow = true, labelled = true;
    const object: VisibilityObject = {
      get visible() { note('visibleRead'); return visible; },
      set visible(value: boolean) { note('visibleWrite'); visible = value; },
      get castShadow() { note('shadowRead'); return castShadow; },
      set castShadow(value: boolean) { note('shadowWrite'); castShadow = value; },
      get isLineSegments() { note('kindRead'); return false; },
    };
    for (const key of ['geometry', 'material', 'children', 'clone', 'traverse', 'loader']) Object.defineProperty(object, key, {
      get() { note('forbiddenRead'); throw new Error(`Hide touched ${key} on a ${triangles}-triangle mesh`); },
    });
    const handle = {
      get visible() { note('handleRead'); return labelled; },
      set visible(value: boolean) { note('handleWrite'); labelled = value; },
    };
    return { id, object, handle, snapshot: () => ({ visible, castShadow, labelled }) };
  });
  const apply = (hidden: Set<string>) => modules.filter(module => {
    const shown = !hidden.has(module.id);
    return applyVisibilityFlags([module.object], module.handle, shown, true, shown);
  }).map(module => module.id);
  return { modules, operations, apply };
}

describe('fossils evidence: constant-cost visibility flags', () => {
  it('the production display gate preserves opaque targets for initial direct, repeated filters and restoration', () => {
    const refs = file.parts as PartRef[];
    const instantMode = file.views.simVisibility === 'instant';
    expect(instantMode).toBe(true);
    for (const choice of ['direct', 'whole', 'direct', 'supported', 'whole']) {
      const displays = resolveAllPartDisplays(refs, { view: 'assembled', part: 'sk-tail-tip', layers: ['skeleton'] });
      const hidden = hiddenFor(choice);
      const instant = gateSimulationVisibility(displays, hidden, instantMode);
      expect([...instant].sort()).toEqual([...hidden].sort());
      for (const id of ids) {
        const display = displays.get(id)!;
        // PartNode consumes this target: no opacity change means no new
        // transparent material variant for the ordinary evidence filter.
        expect(visibilityBaseOpacity(display, instant.has(id)), `${choice} ${id}`).toBe(1);
        expect(display.visible).toBe(!hidden.has(id));
        if (hidden.has(id)) expect([display.selectable, display.selected]).toEqual([false, false]);
      }
    }
  });

  it('the production gate cannot restore off-station modules and preserves chapter put-aside behavior', () => {
    const refs = file.parts as PartRef[];
    for (const choice of ['direct', 'whole']) {
      const displays = resolveAllPartDisplays(refs, { view: 'assembled', part: null, layers: ['age-section'] });
      const instant = gateSimulationVisibility(displays, hiddenFor(choice), true);
      expect(instant.size).toBe(0);
      for (const id of ids) {
        expect(displays.get(id)!.visible).toBe(false);
        expect(visibilityBaseOpacity(displays.get(id)!, instant.has(id))).toBe(0);
      }
    }
    const displays = resolveAllPartDisplays(refs, { view: 'assembled', part: null, layers: ['skeleton'], hidden: ['sk-neck'] });
    const instant = gateSimulationVisibility(displays, hiddenFor('direct'), true);
    expect(instant.has('sk-neck')).toBe(false);
    expect(displays.get('sk-neck')).toMatchObject({ visible: false, hidden: true });
    expect(visibilityBaseOpacity(displays.get('sk-neck')!, false)).toBe(1);
  });

  it('the production gate keeps an existing x-ray opacity through filter and restore', () => {
    const refs = ids.map(id => ({ id, group: 'skeleton' }));
    for (const choice of ['whole', 'direct', 'whole']) {
      const displays = resolveAllPartDisplays(refs, { view: 'xray', part: null, layers: ['skeleton'] });
      const instant = gateSimulationVisibility(displays, hiddenFor(choice), true);
      for (const id of ids) expect(visibilityBaseOpacity(displays.get(id)!, instant.has(id))).toBe(0.15);
    }
  });

  it('default and explicit fade keep the legacy material fade target for other topics', () => {
    const refs = file.parts as PartRef[];
    for (const instantMode of [undefined, false]) {
      const displays = resolveAllPartDisplays(refs, { view: 'assembled', part: null, layers: ['skeleton'] });
      const direct = hiddenFor('direct');
      const instant = gateSimulationVisibility(displays, direct, instantMode);
      expect(instant.size).toBe(0);
      for (const id of ids) expect(visibilityBaseOpacity(displays.get(id)!, instant.has(id))).toBe(direct.has(id) ? 0 : 1);
    }
  });

  it('the real simulation hides exactly five modules immediately and whole restores all twelve', () => {
    const direct = hiddenFor('direct'), whole = hiddenFor('whole');
    expect([...direct].sort()).toEqual(expectedHidden);
    expect(whole.size).toBe(0);
    expect(ids).toHaveLength(12);
    const stage = fixture(1_000_000);
    expect(stage.apply(direct).sort()).toEqual(expectedHidden);
    for (const module of stage.modules) expect(module.snapshot()).toEqual({ visible: !direct.has(module.id), castShadow: !direct.has(module.id), labelled: !direct.has(module.id) });
    expect(stage.apply(whole).sort()).toEqual(expectedHidden);
    for (const module of stage.modules) expect(module.snapshot()).toEqual({ visible: true, castShadow: true, labelled: true });
    expect(stage.apply(whole)).toEqual([]);
    expect(stage.operations.forbiddenRead ?? 0).toBe(0);
  });

  it('one versus a million triangles takes identical operations and never loads or reparses a GLB', () => {
    const load = vi.spyOn(GLTFLoader.prototype, 'load');
    const parse = vi.spyOn(GLTFLoader.prototype, 'parse');
    try {
      const tiny = fixture(1), dense = fixture(1_000_000);
      const direct = hiddenFor('direct'), whole = hiddenFor('whole');
      for (const stage of [tiny, dense]) {
        stage.apply(direct);
        stage.apply(whole);
        stage.apply(whole);
      }
      expect(dense.operations).toEqual(tiny.operations);
      expect(dense.operations.visibleWrite).toBe(10);
      expect(dense.operations.shadowWrite).toBe(10);
      expect(dense.operations.forbiddenRead ?? 0).toBe(0);
      expect(load).not.toHaveBeenCalled();
      expect(parse).not.toHaveBeenCalled();
    } finally { load.mockRestore(); parse.mockRestore(); }
  });

  it('preserves label and line-shadow gates without touching the surface material', () => {
    const line = { visible: true, castShadow: false, isLineSegments: true };
    const handle = { visible: true };
    expect(applyVisibilityFlags([line], handle, true, false, true)).toBe(true);
    expect(line).toEqual({ visible: true, castShadow: false, isLineSegments: true });
    expect(handle.visible).toBe(false);
  });
});
