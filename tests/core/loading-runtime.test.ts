import { describe, expect, it } from 'vitest';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { createRequire } from 'node:module';
import { execFileSync } from 'node:child_process';
import { build } from 'vite';
import { engineClientModules } from '../../src/engines/core/loading-build';
import { topicJsBuild } from '../../scripts/lib/js-budget-build';
import { uiWordChunks } from '../../src/i18n/ui-build';
import { partsFile } from '../../src/engines/space-scene/schema';
import { resolveSimValues } from '../../src/engines/space-scene/lib/sim/controls';
import { evaluateSimOnStage, magnetFrames } from '../../src/engines/space-scene/lib/sim/carrier';
import { simEffects } from '../../src/engines/space-scene/lib/sim/bind';
import { solveTable } from '../../src/engines/space-scene/lib/sim/table';
import { timeText, outputText, valueText } from '../../src/engines/space-scene/lib/sim/text';

// JSON snapshots preserve Maps, Sets and nonfinite quantities without sharing module instances.
const snapshot = (value: unknown): string => JSON.stringify(value, (_key, item) => {
  if (item instanceof Map) return { map: [...item] };
  if (item instanceof Set) return { set: [...item] };
  if (typeof item === 'number' && !Number.isFinite(item)) return { number: String(item) };
  return item;
});

describe('executed browser runtime bundle', () => {
  it('prepares table, magnet and time facades before synchronous callbacks use their import cycles', async () => {
    const directory = mkdtempSync(join(tmpdir(), 'atlas-loading-runtime-'));
    const entry = join(directory, 'fixture.ts');
    const output = join(directory, 'dist');
    const source = (path: string) => JSON.stringify(resolve(path));
    writeFileSync(entry, [
      `export { prepareEngineData } from ${source('src/engines/core/loading-data.ts')};`,
      `export { loadSceneUi, readSceneUi } from ${source('src/i18n/index.ts')};`,
      `export { readSim } from ${source('src/engines/space-scene/lib/sim/runtime.ts')};`,
      ...['bind', 'carrier', 'replay', 'text', 'table'].map(name =>
        `export * from ${source(`src/engines/space-scene/lib/sim/${name}.ts`)};`),
    ].join('\n'));
    try {
      await build({
        configFile: false,
        logLevel: 'silent',
        plugins: [topicJsBuild(), engineClientModules(), uiWordChunks()],
        define: { 'import.meta.env.SSR': 'false' },
        build: {
          outDir: output,
          emptyOutDir: true,
          minify: false,
          modulePreload: false,
          lib: { entry, formats: ['es'] },
          rollupOptions: {
            external: ['react'],
            output: {
              entryFileNames: 'entry.mjs',
              chunkFileNames: '[name]-[hash].mjs',
              paths: { react: createRequire(import.meta.url).resolve('react') },
            },
          },
        },
      });
      const fixtures = ['sample-heart', 'magnets', 'light-and-shadows'].map(topic => {
        const file = partsFile.parse(JSON.parse(readFileSync(`src/content/topics/${topic}/data/parts.json`, 'utf8')));
        const sim = file.sim!;
        const values = resolveSimValues(sim, {});
        const evaluated = evaluateSimOnStage(sim, file, values, null);
        const expected = snapshot({
          evaluated,
          frames: magnetFrames(sim, file, values, null),
          effects: simEffects(sim, values, evaluated.outputs),
          ...(sim.table ? { table: solveTable(sim.table, values, sim.outputs) } : {}),
          words: (['en', 'zh'] as const).map(locale => ({
            controls: sim.controls.map(control => valueText(control, values[control.id], locale)),
            outputs: sim.outputs.map(field => outputText(field, evaluated.outputs[field.id], locale)),
            ...(topic === 'light-and-shadows' ? { clock: timeText(12.5, locale) } : {}),
          })),
        });
        return { topic, file, values, expected };
      });
      // A separate Node process executes the emitted graph without Vitest transforms or DOM shims.
      const runner = `
        import { readFileSync } from 'node:fs';
        import assert from 'node:assert/strict';
        const { url, fixtures } = JSON.parse(readFileSync(0, 'utf8'));
        const browser = await import(url);
        const snapshot = ${snapshot.toString()};
        assert.equal(browser.slotTint(0, 'chapter', null), 'chapter');
        assert.equal(browser.statusTag([], []), 'SIM');
        await browser.loadSceneUi('space-scene');
        browser.readSceneUi('space-scene');
        const results = [];
        for (const { topic, file, values } of fixtures) {
          const sim = file.sim;
          await browser.prepareEngineData('space-scene', { parts: file });
          // These callbacks cannot suspend: all dependencies must already be ready.
          results.push(await Promise.resolve().then(() => {
            browser.readSim(sim.kind);
            const evaluated = browser.evaluateSimOnStage(sim, file, values, null);
            return snapshot({
              evaluated,
              frames: browser.magnetFrames(sim, file, values, null),
              effects: browser.simEffects(sim, values, evaluated.outputs),
              ...(sim.table ? { table: browser.solveTable(sim.table, values, sim.outputs) } : {}),
              words: ['en', 'zh'].map(locale => ({
                controls: sim.controls.map(control => browser.valueText(control, values[control.id], locale)),
                outputs: sim.outputs.map(field => browser.outputText(field, evaluated.outputs[field.id], locale)),
                ...(topic === 'light-and-shadows' ? { clock: browser.timeText(12.5, locale) } : {}),
              })),
            });
          }));
        }
        process.stdout.write(JSON.stringify(results));
      `;
      const actual = execFileSync(process.execPath, ['--input-type=module', '-e', runner], {
        input: JSON.stringify({ url: pathToFileURL(join(output, 'entry.mjs')).href, fixtures }),
        encoding: 'utf8',
        timeout: 20_000,
        maxBuffer: 10 * 1024 * 1024,
      });
      expect(JSON.parse(actual)).toEqual(fixtures.map(fixture => fixture.expected));
    } finally {
      rmSync(directory, { recursive: true, force: true });
    }
  }, 60_000);
});
