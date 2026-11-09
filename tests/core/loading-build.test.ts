import { describe, expect, it } from 'vitest';
import { build } from 'vite';
import { engineClientModules, spaceSceneChunks } from '../../src/engines/core/loading-build';
import { staticClosure } from '../../scripts/js-budget';

describe('browser runtime boundaries', () => {
  it('groups only static space dependencies, retaining optional and cross-engine boundaries', () => {
    const root = '/repo/src/engines/space-scene/View.tsx';
    const part = '/repo/src/engines/space-scene/stages/model3d/PartNode.tsx';
    const optional = '/repo/src/engines/space-scene/lib/sim/sim-tools-runtime.ts';
    const react = '/node_modules/react/index.js';
    const three = '/node_modules/three/build/three.module.js';
    const core = '/repo/src/engines/core/context.tsx';
    const descriptor = '/repo/src/engines/space-scene/index.ts';
    const modules: Record<string, string[]> = { [root]: [part, core, react, descriptor], [part]: [three], [core]: [react], [react]: [], [three]: [], [optional]: [part], [descriptor]: [] };
    const graph = { *getModuleIds() { yield* Object.keys(modules); }, getModuleInfo(id: string) { return { importedIds: modules[id] ?? [] }; } };
    const chunk = spaceSceneChunks();
    for (const id of [root, part]) expect(chunk(id, graph)).toBe('space-base');
    for (const id of [optional, core, react, three, descriptor]) expect(chunk(id, graph)).toBeUndefined();
  });
  it('keeps simulation tools out of the static per-part import closure', async () => {
    const result = await build({
      configFile: false,
      logLevel: 'silent',
      plugins: [engineClientModules()],
      build: {
        write: false,
        minify: false,
        lib: { entry: 'src/engines/space-scene/lib/sim/sim-tools.client.ts', formats: ['es'] },
        rollupOptions: { external: ['react'] },
      },
    });
    const outputs = Array.isArray(result) ? result : [result];
    const chunks = outputs.flatMap(output => 'output' in output ? output.output : []).filter(item => item.type === 'chunk');
    const entry = chunks.find(chunk => chunk.isEntry)!;
    const graph = Object.fromEntries(chunks.map(chunk => [chunk.fileName, { imports: chunk.imports.filter(id => id !== 'react') }]));
    const initial = new Set(staticClosure([entry.fileName], graph));
    const initialModules = chunks.filter(c => initial.has(c.fileName)).flatMap(c => Object.keys(c.modules));
    expect(initialModules.some(id => id.endsWith('/part-bind.ts'))).toBe(true);
    expect(initialModules.some(id => /\/(bind|carrier|text|replay|table)\.ts$/.test(id))).toBe(false);
    const runtime = chunks.find(c => Object.keys(c.modules).some(id => id.endsWith('/sim-tools-runtime.ts')))!;
    expect(runtime).toBeDefined();
    expect(initial.has(runtime.fileName)).toBe(false);
  });
  it('keeps math notation behind the dynamic time-reading import after Rollup', async () => {
    const result = await build({
      configFile: false,
      logLevel: 'silent',
      plugins: [engineClientModules()],
      build: {
        write: false,
        minify: false,
        lib: { entry: 'src/engines/space-scene/lib/sim/time-text.ts', formats: ['es'] },
        rollupOptions: { external: ['react'] },
      },
    });
    const outputs = Array.isArray(result) ? result : [result];
    const chunks = outputs.flatMap(output => 'output' in output ? output.output : []).filter(item => item.type === 'chunk');
    const entry = chunks.find(chunk => chunk.isEntry)!;
    expect(entry).toBeDefined();
    expect(Object.keys(entry.modules).some(id => id.endsWith('/time-text.client.ts'))).toBe(true);
    const graph = Object.fromEntries(chunks.map(chunk => [chunk.fileName, { imports: chunk.imports }]));
    const initial = new Set(staticClosure([entry.fileName], graph));
    const notation = chunks.filter(chunk => Object.keys(chunk.modules).some(id => id.endsWith('/rich-text.ts')));
    expect(notation).toHaveLength(1);
    expect(initial.has(notation[0]!.fileName)).toBe(false);
    expect(entry.dynamicImports).toHaveLength(1);
  });
});
