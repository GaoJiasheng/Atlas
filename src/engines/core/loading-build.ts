import type { Plugin } from 'vite';

interface ModuleGraph {
  getModuleIds(): IterableIterator<string>;
  getModuleInfo(id: string): { importedIds: readonly string[] } | null;
}

/** Merge only dependencies already statically needed by every 3D scene.
 * Optional GLTF, body and simulation entries stay behind their dynamic imports.
 */
export function spaceSceneChunks() {
  let initial: Set<string> | undefined;
  return (id: string, graph: ModuleGraph): string | undefined => {
    if (!initial) {
      initial = new Set();
      const visit = (module: string) => {
        if (initial!.has(module)) return;
        initial!.add(module);
        graph.getModuleInfo(module)?.importedIds.forEach(visit);
      };
      for (const module of graph.getModuleIds()) {
        if (/\/src\/engines\/space-scene\/(View|stages\/model3d\/Model3DStage)\.tsx$/.test(module)) visit(module);
      }
    }
    // Keep vendors below application code, and the descriptor ahead of data fetch.
    // Mixing three with app code can create a cycle through its example classes.
    const owns = id.includes('/src/engines/space-scene/') && !id.endsWith('/space-scene/index.ts');
    return owns && initial.has(id) ? 'space-base' : undefined;
  };
}

/** Node tests/validation keep synchronous APIs; browser features are prepared from topic data. */
export function engineClientModules(): Plugin {
  let clientBuild = false;
  return {
    name: 'atlas-engine-client-modules',
    enforce: 'pre',
    configResolved(config) { clientBuild = config.command === 'build' && !config.build.ssr; },
    outputOptions(options) {
      if (clientBuild) return { ...options, manualChunks: spaceSceneChunks(), onlyExplicitManualChunks: true };
    },
    async resolveId(source, importer, options) {
      if (options.ssr) return;
      const runtime = '/space-scene/lib/sim/';
      if (importer?.endsWith(`${runtime}sim-tools-runtime.ts`)) return;
      if (/(?:^|\/)(bind|carrier|replay|text|table)(?:\.ts)?$/.test(source)) {
        const resolved = await this.resolve(source, importer, { ...options, skipSelf: true });
        if (resolved && /\/space-scene\/lib\/sim\/(bind|carrier|replay|text|table)\.ts$/.test(resolved.id)) return resolved.id.replace(/[^/]+$/, 'sim-tools.client.ts');
      }
      // The strip-bending maths arrive as a stage kit (stages/model3d/kits.ts, its one direct importer in the browser).
      if (!importer?.endsWith('/stages/model3d/kits.ts') && /(?:^|\/)bend(?:\.ts)?$/.test(source)) {
        const resolved = await this.resolve(source, importer, { ...options, skipSelf: true });
        if (resolved?.id.endsWith('/space-scene/lib/bend.ts')) return resolved.id.replace(/\.ts$/, '.client.ts');
      }
      if (!/(?:^|\/)time-text(?:\.ts)?$/.test(source)) return;
      const resolved = await this.resolve(source, importer, { ...options, skipSelf: true });
      if (resolved?.id.endsWith('/space-scene/lib/sim/time-text.ts')) return resolved.id.replace(/\.ts$/, '.client.ts');
    },
  };
}
