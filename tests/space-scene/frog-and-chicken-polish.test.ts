import { describe, expect, it } from 'vitest';
import { frog, tadpole } from '../../scripts/geo/frog-and-chicken/amphibians';
import type { P, V } from '../../scripts/geo/frog-and-chicken/specimens';

function digits(primitives: P[]) {
  return primitives.filter(p => p.kind === 'sweep' && (p.path as V[]).every(point => point[1] < 0));
}
const distance = (a: V, b: V) => Math.hypot(...a.map((n, i) => n - b[i]!));
describe('frog observation anatomy', () => {
  it('keeps the shrinking tail dorsal, axial and free of leg-like joints or digits', () => {
    const adult=frog(),young=frog(true);
    expect(young).toHaveLength(adult.length+1);
    const tail=young.at(-1)!;
    expect(tail.kind).toBe('sweep');
    const path=tail.path as V[],radii=tail.radius as number[];
    expect(path.every(p=>p[1]>=.275&&Math.abs(p[2])<=.003)).toBe(true);
    expect(path.at(-1)![0]-path[0]![0]).toBeLessThan(.28);
    expect(path.at(-1)![1]).toBeGreaterThan(path[0]![1]);
    for(let i=1;i<radii.length;i++)expect(radii[i]).toBeLessThan(radii[i-1]!);
    expect(digits(young)).toHaveLength(18);
  });
  it('preserves four bare forefingers and five separately capped, webbed hind toes on each side', () => {
    for (const stage of [frog(), frog(true)]) {
      expect(stage.length).toBeLessThanOrEqual(33);
      const allDigits = digits(stage);
      expect(allDigits).toHaveLength(18);
      for (const side of [-1, 1]) {
        const onSide = allDigits.filter(p => Math.sign((p.path as V[])[0]![2]) === side);
        expect(onSide.filter(p => (p.path as V[])[0]![0] < 0)).toHaveLength(4);
        const hind = onSide.filter(p => (p.path as V[])[0]![0] > 0);
        expect(hind).toHaveLength(5);
        const lengths = hind.map(p => distance((p.path as V[])[0]!, (p.path as V[]).at(-1)!));
        expect(lengths.indexOf(Math.max(...lengths))).toBe(3);
      }
      for (const digit of allDigits) expect(digit.caps).toBe('round');
      const webs = stage.filter(p => p.kind === 'extrude');
      expect(webs).toHaveLength(2);
      for (const web of webs) expect((web.shape as [number, number][]).every(([x]) => x > 0)).toBe(true);
    }
  });
  it('shows a legless larva before two hind limbs, without inventing forelimbs or fin rays', () => {
    expect(digits(tadpole())).toHaveLength(0);
    expect(digits(tadpole(true))).toHaveLength(10);
    for (const stage of [tadpole(), tadpole(true)]) {
      expect(stage.length).toBeLessThanOrEqual(33);
      const membranes = stage.filter(p => p.color === 'membrane');
      expect(membranes).toHaveLength(1);
      const outline = membranes[0]!.shape as [number, number][];
      expect(outline.length).toBeGreaterThanOrEqual(64);
      expect(Math.min(...outline.map(p => p[1]))).toBeLessThan(0);
      expect(Math.max(...outline.map(p => p[1]))).toBeGreaterThan(.3);
    }
  });
});
