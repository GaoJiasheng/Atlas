import type { Plugin } from 'vite';

/** Keep Node validation's complete synchronous registry out of browser chunks. */
export function topicJsBuild(): Plugin {
  let clientBuild = false;
  return {
    name: 'atlas-topic-js',
    enforce: 'pre',
    configResolved(config) { clientBuild = config.command === 'build' && !config.build.ssr; },
    async resolveId(source, importer, options) {
      if (options.ssr || !importer || !/(?:\/sim|\/sim\/index|^\.\/index)$/.test(source)) return;
      const resolved = await this.resolve(source, importer, { ...options, skipSelf: true });
      if (resolved?.id.endsWith('/space-scene/lib/sim/index.ts')) return resolved.id.replace(/index\.ts$/, 'runtime.ts');
    },
    generateBundle(_options, bundle) {
      if (!clientBuild) return;
      const graph = Object.fromEntries(Object.values(bundle).filter(item => item.type === 'chunk').map(chunk => [chunk.fileName, {
        imports: chunk.imports,
        dynamicImports: chunk.dynamicImports,
        modules: Object.keys(chunk.modules),
      }]));
      this.emitFile({ type: 'asset', fileName: '_astro/js-budget-graph.json', source: JSON.stringify(graph) });
    },
  };
}
