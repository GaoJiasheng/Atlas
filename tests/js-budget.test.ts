import { describe, expect, it } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';
import { assertBudgets, BUDGET_KB, measureBudgets, staticClosure, type BudgetResult } from '../scripts/js-budget';
import { needsSimTimeText } from '../src/engines/core/loading-data';
import { topicGlossary } from '../src/engines/core/reader-data';
import { needsBendKit } from '../src/engines/space-scene/stages/model3d/kits';
import { needsMotion } from '../src/engines/space-scene/first-frame';

describe('first-screen JS budget', () => {
  it('counts static imports transitively, once, through cycles', () => {
    expect(staticClosure(['entry', 'shared'], { entry: { imports: ['shared', 'nested'] }, shared: { imports: ['entry'] }, nested: { imports: ['shared'] }, unrelatedLazy: { imports: [] } })).toEqual(['entry', 'nested', 'shared']);
    expect(() => staticClosure(['missing'], {})).toThrow('Missing JS chunk');
  });
  it('enforces the engine-specific limits without rounding away an overrun', () => {
    const row = (engine: string, gzipKB: number): BudgetResult => ({ topic: 'fixture', engine, gzipKB, budgetKB: BUDGET_KB[engine]!, files: [] });
    for (const [engine, budget] of Object.entries(BUDGET_KB)) {
      expect(() => assertBudgets([row(engine, budget)])).not.toThrow();
      expect(() => assertBudgets([row(engine, budget + 0.001)])).toThrow(engine);
    }
    expect(() => assertBudgets([row('space-scene', NaN)])).toThrow('space-scene');
  });
  it.skipIf(!existsSync('dist/_astro/js-budget-graph.json'))('keeps every built topic within its first-screen budget', () => {
    const results = measureBudgets();
    expect(results.length).toBeGreaterThan(0);
    assertBudgets(results);
    // A ratchet: the SpaceScene limit sits just above today's peak and comes down with it.
    const peak = Math.max(...results.filter(r => r.engine === 'space-scene').map(r => r.gzipKB));
    expect(BUDGET_KB['space-scene']! - peak, 'lower the space-scene ratchet to the new peak + ~3 KB').toBeLessThan(5);
    const visits = new Map(measureBudgets('dist', undefined, { firstVisit: true }).map(r => [`${r.topic}/${r.locale}`, r.files]));
    const graph = JSON.parse(readFileSync('dist/_astro/js-budget-graph.json', 'utf8')) as Record<string, { modules: string[]; imports: string[] }>;
    const descriptor = Object.keys(graph).find(file => graph[file]!.modules.some(m => m.endsWith('/space-scene/index.ts')))!;
    const descriptorModules = staticClosure([descriptor], graph).flatMap(file => graph[file]!.modules);
    expect(descriptorModules.some(m => /\/(three|@react-three)\//.test(m)), '3D descriptor delays data fetch').toBe(false);
    expect(descriptorModules.some(m => m.endsWith('/space-scene/View.tsx') || m.endsWith('/Model3DStage.tsx')), 'eager 3D view').toBe(false);
    for (const row of results) {
      const modules = row.files.flatMap(file => graph[file]?.modules ?? []);
      const words = modules.filter(m => /\/i18n\/ui\.(en|zh)\.json(?:\?|$)/.test(m));
      expect(words.length, `${row.topic}/${row.locale} locale chunks`).toBeGreaterThan(0);
      for (const locale of ['en', 'zh']) expect(words.some(m => m.endsWith(`/ui.${locale}.json`)), `${row.topic}/${row.locale} bilingual captions`).toBe(true);
      const group = row.engine.split('-')[0];
      expect(words.every(m => !m.includes('?') || m.endsWith(`?${group}`)), `${row.topic}/${row.locale} unrelated UI words`).toBe(true);
      const data = JSON.parse(readFileSync(`dist/topics/${row.topic}/data.json`, 'utf8'));
      // The site's existing clock text/speech and the glossary card's rich text use these four pure notation helpers.
      // They are required only by time-formatted simulations and glossaries, never other engines' UI.
      const notation = (row.engine === 'space-scene' && needsSimTimeText('space-scene', data)) || topicGlossary(data).length > 0
        ? ['fraction', 'decimal', 'value', 'words'].map(name => `/math-scene/lib/${name}.ts`) : [];
      for (const other of ['space-scene', 'time-scene', 'math-scene']) {
        if (other !== row.engine) expect(modules.some(m => m.includes(`/src/engines/${other}/`) && !notation.some(suffix => m.endsWith(suffix))), `${row.topic} unrelated engine ${other}`).toBe(false);
      }
      if (row.engine === 'space-scene') {
        expect(modules.some(m => m.endsWith('/sim-tools-runtime.ts')), `${row.topic} simulation first-frame tools`).toBe(!!data.parts.sim);
        if (!data.parts.sim) expect(modules.some(m => /\/sim\/(bind|carrier|text|replay|table)\.ts$/.test(m)), `${row.topic} eager simulation tools`).toBe(false);
        // Stage code only some topics run stays with them: the strip bend (a kit) and the joint maths (with MotionDriver).
        expect(modules.some(m => m.endsWith('/space-scene/lib/bend.ts')), `${row.topic} bend kit`).toBe(needsBendKit(data.parts));
        expect(modules.some(m => m.endsWith('/space-scene/lib/rig.ts')), `${row.topic} joint maths`).toBe(needsMotion(data.parts, data.fitness));
        // The page preloads every chunk of a plain visit, so none is requested only once the import that needs it runs.
        const html = readFileSync(`dist/${row.locale}/topics/${row.topic}/index.html`, 'utf8');
        const listed = new Set([...html.matchAll(/(?:component-url|renderer-url|src|href)="[^"]*?(_astro\/[^"?#]+\.js)/g)].map(m => m[1]));
        expect(visits.get(`${row.topic}/${row.locale}`)!.filter(file => !listed.has(file)), `${row.topic}/${row.locale} chunks without a preload`).toEqual([]);
      }
      if (row.engine !== 'time-scene') expect(modules.some(m => m.includes('/maplibre-gl/')), row.topic).toBe(false);
      if (row.engine !== 'space-scene') expect(modules.some(m => /\/(?:three|@react-three)\//.test(m)), row.topic).toBe(false);
    }
  }, 60_000);
});
