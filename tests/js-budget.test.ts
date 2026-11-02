import { describe, expect, it } from 'vitest';
import { existsSync } from 'node:fs';
import { assertBudgets, BUDGET_KB, measureBudgets, staticClosure, type BudgetResult } from '../scripts/js-budget';

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
  }, 60_000);
});
