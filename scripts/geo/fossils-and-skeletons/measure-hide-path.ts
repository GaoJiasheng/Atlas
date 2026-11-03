/** CPU measurement of the exact renderer flag helper; no browser/GPU claims.
 * pnpm tsx scripts/geo/fossils-and-skeletons/measure-hide-path.ts [output.json]
 * The older benchmark-visibility.ts measures amplified label rays separately.
 */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';
import { performance } from 'node:perf_hooks';
import { evaluateSim } from '../../../src/engines/space-scene/lib/sim';
import { simEffects } from '../../../src/engines/space-scene/lib/sim/bind';
import { resolveSimValues } from '../../../src/engines/space-scene/lib/sim/controls';
import { simSchema } from '../../../src/engines/space-scene/sim-schema';
import { applyVisibilityFlags, type VisibilityObject } from '../../../src/engines/space-scene/stages/model3d/visibilityFlags';

const file = JSON.parse(readFileSync('src/content/topics/fossils-and-skeletons/data/parts.json', 'utf8'));
const sim = simSchema.parse(file.sim);
const ids = (file.parts as {id: string; group?: string}[]).filter(p => p.group === 'skeleton').map(p => p.id);
const hiddenFor = (choice: string) => {
  const values = resolveSimValues(sim, { 'evidence-view': choice });
  return simEffects(sim, values, evaluateSim(sim, values)).hidden;
};
const direct = hiddenFor('direct'), whole = hiddenFor('whole');
const sampleCount = 31, cyclesPerSample = 1000;
function measure(nominalTrianglesPerModule: number) {
  let forbiddenReads = 0, visibilityWrites = 0, shadowWrites = 0;
  const modules = ids.map(id => {
    let visible = true, castShadow = true;
    const object: VisibilityObject = {
      get visible() { return visible; },
      set visible(value: boolean) { visible = value; visibilityWrites++; },
      get castShadow() { return castShadow; },
      set castShadow(value: boolean) { castShadow = value; shadowWrites++; },
    };
    for (const key of ['geometry', 'material', 'children', 'clone', 'traverse', 'loader']) Object.defineProperty(object, key, {
      get() { forbiddenReads++; throw new Error(`Forbidden ${key} access`); },
    });
    return { id, objects: [object], handle: { visible: true } };
  });
  function cycle() {
    for (const hidden of [direct, whole]) for (const module of modules) {
      const shown = !hidden.has(module.id);
      applyVisibilityFlags(module.objects, module.handle, shown, true, shown);
    }
  }
  for (let i = 0; i < 1000; i++) cycle();
  visibilityWrites = shadowWrites = 0;
  const samplesUs: number[] = [];
  for (let i = 0; i < sampleCount; i++) {
    const start = performance.now();
    for (let j = 0; j < cyclesPerSample; j++) cycle();
    samplesUs.push((performance.now() - start) * 1000 / cyclesPerSample);
  }
  const sorted = [...samplesUs].sort((a, b) => a - b);
  return {
    nominalTrianglesPerModule, sampleCount, cyclesPerSample,
    medianUsPerDirectWholeCycle: sorted[Math.floor(sorted.length / 2)],
    p95UsPerDirectWholeCycle: sorted[Math.ceil(sorted.length * 0.95) - 1],
    visibilityWritesPerCycle: visibilityWrites / sampleCount / cyclesPerSample,
    shadowWritesPerCycle: shadowWrites / sampleCount / cyclesPerSample,
    forbiddenGeometryMaterialLoaderReads: forbiddenReads,
    samplesUs,
  };
}
const result = {
  method: 'Actual applyVisibilityFlags helper, twelve stable module objects, precomputed real simEffects direct/whole sets; no geometry allocation, render, raycast, GLB parse or browser timing.',
  hiddenIds: [...direct].sort(),
  tiny: measure(1), dense: measure(1_000_000),
};
const output = process.argv[2] ?? '/private/tmp/fossils-polish-2026-11-03/visibility-flags.json';
mkdirSync(dirname(output), { recursive: true });
writeFileSync(output, `${JSON.stringify(result, null, 2)}\n`);
console.log(JSON.stringify(result, null, 2));
