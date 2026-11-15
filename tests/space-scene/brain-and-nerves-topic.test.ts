/**
 * brain-and-nerves (docs/75 §6.3): the try-it table values, the model's
 * provenance and budgets, and the parts that must stay procedural.
 */
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { partsFile } from '../../src/engines/space-scene/schema';

const raw = JSON.parse(readFileSync('src/content/topics/brain-and-nerves/data/parts.json', 'utf8'));
const file = partsFile.parse(raw);
const rows = (id: string) => raw.sim.table.experiments[id].rows as { when: Record<string, unknown>; set: Record<string, unknown> }[];
const row = (id: string, key: string, value: unknown) => rows(id).find((r) => r.when[key] === value)!.set;

describe('brain-and-nerves try-its', () => {
  it('signal speed: 100 m/s takes 10 ms over a metre, 1 m/s takes 1,000 ms; both drawn in 2 s', () => {
    expect(row('speed', 'fibre', 'thick-myelin')).toEqual({ speed: 100, 'time-ms': 10, slow: 200 });
    expect(row('speed', 'fibre', 'thin-bare')).toEqual({ speed: 1, 'time-ms': 1000, slow: 2 });
  });
  it('reflex: seven steps, in order', () => {
    expect(rows('reflex').map((r) => r.set.where)).toEqual(['whole', 'skin', 'sensory', 'relay', 'motor', 'muscle', 'brain']);
  });
  it('ruler drop: t = √(2d ÷ 9.81), rounded to ms', () => {
    expect(row('ruler', 'catch-cm', 5)['reaction-ms']).toBe(101);
    expect(row('ruler', 'catch-cm', 20)['reaction-ms']).toBe(202);
    expect(row('ruler', 'catch-cm', 26)['reaction-ms']).toBe(230);
    expect(row('ruler', 'catch-cm', 30)['reaction-ms']).toBe(247);
    for (const r of rows('ruler')) {
      const d = r.when['catch-cm'] as number;
      expect(r.set['reaction-ms']).toBe(Math.round(Math.sqrt((2 * d) / 100 / 9.81) * 1000));
    }
  });
});

describe('brain-and-nerves model', () => {
  const prov = JSON.parse(readFileSync('scripts/anatomy/brain-nerves/provenance.json', 'utf8')).nodes as Record<string, { family: string }>;
  const manifest = JSON.parse(readFileSync('scripts/anatomy/brain-nerves/manifest.json', 'utf8'));
  it('ships only nervous-system sources whose family may go into a CC BY-SA file', () => {
    for (const p of manifest.parts.filter((p: { system: string }) => p.system === 'nervous'))
      for (const n of p.sourceNames) expect(['bp3d-zanatomy', 'brainder', 'dundee-cn'], n).toContain(prov[n]!.family);
  });
  it('uses neither the unattributed Z-Anatomy cerebellum nor its spinal-cord outline', () => {
    const names = manifest.parts.flatMap((p: { sourceNames: string[] }) => p.sourceNames);
    expect(names).not.toContain('White matter of spinal cord');
    expect(names.some((n: string) => /quadrangular|semilunar|Biventral|Gracile lobule|vermis|Culmen|Declive|Flocculus|of cerebellum/.test(n))).toBe(false);
    expect(manifest.parts.find((p: { id: string }) => p.id === 'cerebellum').system).toBe('bp3d');
  });
  it('draws the spinal cord and the corpus callosum as procedural parts', () => {
    for (const id of ['spinal-cord', 'corpus-callosum']) {
      const part = file.parts.find((p) => p.id === id)!;
      expect(part.mesh).toBeUndefined();
      expect(part.primitive?.kind).toBe('sweep');
    }
  });
  it('stays within the GLB budget (≤ 4,000,000 bytes)', () => {
    expect(readFileSync('public/models/brain-and-nerves.glb').byteLength).toBeLessThanOrEqual(4_000_000);
  });
});
