import { describe, expect, it } from 'vitest';
import { auditModel } from '../../scripts/geo/eyes-and-ears/audit-model';

const audit=await auditModel();
const EYE=['cornea','iris','lens','ciliary-ring','sclera-shell','vitreous','retina','optic-nerve','iris-aperture-small','iris-aperture-large'];
const EAR=['pinna','canal','eardrum','malleus','incus','stapes','oval-window','eustachian-tube','cochlea-shell','balance-context','auditory-nerve'];

describe('eyes and ears round 2: proportional anatomy and drawn workload',()=>{
  it('uses one consistent middle/inner-ear scale',()=>{
    // Directly measure shipped bone vertices, not constants in the generator.
    expect(audit.boneMm.malleus).toBeGreaterThan(8.5);expect(audit.boneMm.malleus).toBeLessThan(9.5);
    expect(audit.boneMm.incus).toBeGreaterThan(6.7);expect(audit.boneMm.incus).toBeLessThan(7.4);
    expect(audit.boneMm.stapes).toBeGreaterThan(2.7);expect(audit.boneMm.stapes).toBeLessThan(3.3);
    const b=audit.bounds['cochlea-shell']!;
    const breadth=(b.max[0]!-b.min[0]!)/.052, height=(b.max[2]!-b.min[2]!)/.052;
    expect(breadth).toBeGreaterThan(8);expect(breadth).toBeLessThan(10);
    expect(height).toBeGreaterThan(4);expect(height).toBeLessThan(6);
  });
  it('stays below 180k drawn triangles even with all layers, overlays, and a shadow refresh',()=>{
    expect(audit.beats).toHaveLength(40);
    for(const b of audit.beats) expect(b.drawnUpperBound,`${b.chapter}.${b.beat}`).toBeLessThan(180000);
    expect(audit.allLayersDrawnUpperBound).toBeLessThan(180000);
    expect(audit.transitionDrawnUpperBound).toBeLessThan(180000);
    for(const n of audit.simplification) {
      expect(n.triangles).toBeLessThanOrEqual(n.sourceTriangles as number);
      expect(n.simplificationError).toBeLessThanOrEqual(.0005);
    }
  });
  it('never submits the other organ in any eye or ear close-up, including the overview chapters',()=>{
    for(const b of audit.beats) {
      if(['the-light-gate','an-image-on-the-retina','near-far-and-focus'].includes(b.chapter)
        || ['before-you-start','care-and-protection'].includes(b.chapter)&&b.beat===2) {
        expect(b.parts.filter(id=>EAR.includes(id)),`${b.chapter}.${b.beat}`).toEqual([]);
      }
      if(['three-moving-bones','vibration-to-signal','pitch-and-strength'].includes(b.chapter)
        || b.chapter==='before-you-start'&&b.beat===3
        || b.chapter==='care-and-protection'&&[3,4].includes(b.beat)) {
        expect(b.parts.filter(id=>EYE.includes(id)),`${b.chapter}.${b.beat}`).toEqual([]);
      }
    }
  });
});
