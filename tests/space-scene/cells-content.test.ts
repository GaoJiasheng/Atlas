/** Production content evidence: captions, observation arithmetic, indexes and assets. */
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { parse } from 'yaml';
import { PerspectiveCamera, Vector3 } from 'three';
import { partsFile, spaceChapterState } from '../../src/engines/space-scene/schema';
import { evaluateSim } from '../../src/engines/space-scene/lib/sim';
import { solveMicroscope } from '../../src/engines/space-scene/lib/sim/microscope';
import { resolveSimValues } from '../../src/engines/space-scene/lib/sim/controls';
import { anchorPoint } from '../../src/engines/space-scene/stages/model3d/shapes';

const root = join(import.meta.dirname, '../..');
const dir = join(root, 'src/content/topics/cells');
const file = partsFile.parse(JSON.parse(readFileSync(join(dir, 'data/parts.json'), 'utf8')));
const sim = file.sim!;
const chapters = readdirSync(join(dir, 'chapters')).filter(f => f.endsWith('.mdx')).sort().map(f => {
  const [, front, ...body] = readFileSync(join(dir, 'chapters', f), 'utf8').split(/^---$/m);
  const fm = parse(front!);
  return { id: fm.id as string, kind: fm.kind as string | undefined, state: spaceChapterState.parse(fm.state), body: body.join('---') };
});
const at = (chapter: string, beat: number) => {
  const c = chapters.find(c => c.id === chapter)!;
  const values = resolveSimValues(sim, { ...c.state.sim?.set, ...c.state.beats![beat - 1]!.sim?.set });
  return { values, outputs: { ...solveMicroscope(sim.microscope!, values), ...evaluateSim(sim, values) } };
};

describe('cells: published content and observable model', () => {
  it('has eight bilingual chapters and forty concise, indexed beats', () => {
    expect(chapters).toHaveLength(8);
    expect(chapters[0]!.kind).toBe('background');
    expect(chapters.flatMap(c => c.state.beats!)).toHaveLength(40);
    expect(parse(readFileSync(join(dir, 'topic.yaml'), 'utf8')).status).toBe('published');
    for (const c of chapters) {
      expect(c.state.beats, c.id).toHaveLength(5);
      expect(c.body).toContain('<Lang en>'); expect(c.body).toContain('<Lang zh>');
      const ids = c.state.index!.parts!;
      for (const id of ids) expect(file.parts.some(p => p.id === id && !p.context), `${c.id}: ${id}`).toBe(true);
      for (const id of ids) {
        const p = file.parts.find(p => p.id === id)!;
        expect(c.state.beats!.some(b => (b.part === id || b.labels?.includes(id)) && !(b.hide ?? c.state.hide ?? []).some(h => h === id || h === p.group)), `${c.id}: index must reveal ${id}`).toBe(true);
      }
      for (const b of c.state.beats!) {
        expect(b.caption.en.trim().split(/\s+/).length).toBeLessThanOrEqual(45);
        expect(b.caption.zh).toMatch(/[\u3400-\u9fff]/);
        expect(b.labels!.length).toBeLessThanOrEqual(6);
        for (const id of b.labels!) expect(ids, `${c.id}: ${id}`).toContain(id);
        expect(Object.keys(b.sim!.set!).sort()).toEqual(sim.controls.map(c => c.id).sort());
      }
    }
  });

  it('models three shared structures and six plant structures without adding animal walls', () => {
    expect(file.parts.filter(p => p.group === 'animal-cell').map(p => p.id).sort()).toEqual(['animal-cytoplasm', 'animal-membrane', 'animal-nucleus']);
    expect(file.parts.filter(p => p.group === 'plant-cell')).toHaveLength(6);
    expect(file.parts.filter(p => p.group === 'microscope-bench')).toHaveLength(15);
    expect(file.parts.filter(p => p.group === 'tissue-context')).toHaveLength(5);
    expect(file.parts).toHaveLength(29);
    expect(file.parts.find(p => p.id === 'animal-membrane')!.shell).toBe(true);
    expect(file.parts.find(p => p.id === 'plant-cell-wall')!.shell).toBe(true);
    expect(file.parts.find(p => p.id === 'plant-membrane')!.shell).toBe(true);
  });

  it('the magnification captions agree with actual objective values and field diameters', () => {
    const low = at('power-and-field', 2), high = at('power-and-field', 3);
    expect(low.values.objective).toBe(4); expect(low.outputs['total-power']).toBe(40);
    expect(high.values.objective).toBe(40); expect(high.outputs['total-power']).toBe(400);
    expect(low.outputs['field-diameter-um']).toBe(4500);
    expect(high.outputs['field-diameter-um']).toBe(450);
    expect(Number(high.outputs['field-diameter-um']) / Number(low.outputs['field-diameter-um'])).toBe(0.1);
    expect(at('power-and-field', 4).outputs['target-u']).toBeCloseTo(-100 / 225, 10);
    expect(at('power-and-field', 5).outputs['clarity']).toBe(0);
  });

  it('the low-centre-high-fine-clear observation sequence is reproducible', () => {
    expect(at('microscope-try-it', 1).outputs['total-power']).toBe(40);
    expect(at('microscope-try-it', 2).outputs['target-u']).toBe(0);
    expect(at('microscope-try-it', 3).outputs['total-power']).toBe(400);
    expect(at('microscope-try-it', 3).outputs['target-u']).toBe(0);
    expect(at('microscope-try-it', 4).outputs['clarity']).toBe(0.5);
    expect(at('microscope-try-it', 5).outputs['clarity']).toBe(1);
  });

  it('the three comparison specimens change the actual field model', () => {
    expect(at('compare-cells', 2).values.specimen).toBe('onion-bulb');
    expect(at('compare-cells', 3).values.specimen).toBe('pondweed-leaf');
    expect(at('compare-cells', 4).values.specimen).toBe('prepared-cheek');
    for (const n of [2, 3, 4]) expect(at('compare-cells', n).values['field-on']).toBe(true);
  });

  it('keeps the MOE basic-unit outcome distinct from requested enrichment', () => {
    const all = chapters.map(c => c.body).join('\n');
    expect(all).toContain('Recognise that a cell is a basic unit of life.');
    expect(all).toContain('Identify the different parts of plants and state their functions.');
    expect(all).toMatch(/enrichment|extension/i);
    expect(all).toMatch(/深化|拓展/);
    for (const slug of ['plant', 'living-things', 'digestive-system', 'heart-and-lungs']) {
      expect(all).toContain(`slug="${slug}"`);
      const sibling = readdirSync(join(root, 'src/content/topics', slug, 'chapters')).filter(f => f.endsWith('.mdx')).map(f => readFileSync(join(root, 'src/content/topics', slug, 'chapters', f), 'utf8')).join('\n');
      expect(sibling).toContain('slug="cells"');
    }
  });

  it('provides sixteen terms with a first-use link in both languages and local illustrations', () => {
    const glossary = JSON.parse(readFileSync(join(dir, 'data/glossary.json'), 'utf8'));
    expect(glossary.terms).toHaveLength(16);
    const all = chapters.map(c => c.body).join('\n');
    for (const term of glossary.terms) expect(all.split(`<Term id="${term.id}">`).length - 1, term.id).toBe(2);
    for (const rel of ['cells.webp', 'cells@2x.webp', 'figures/cells-microscope.webp', 'figures/cells-systems-link.webp']) expect(existsSync(join(root, 'public/illustrations', rel))).toBe(true);
    const sources = JSON.parse(readFileSync(join(dir, 'data/sources.json'), 'utf8')).sources;
    expect(sources.find((s: {id: string}) => s.id === 'S20').design).toBe(true);
    const sourceIds = new Set(sources.map((s: { id: string }) => s.id));
    for (const part of file.parts) for (const lang of ['en', 'zh'] as const) for (const ref of (part.detail?.[lang] ?? '').matchAll(/S\d+/g)) expect(sourceIds.has(ref[0]), `${part.id}: ${ref[0]}`).toBe(true);
    const exposed = new Set(chapters.flatMap(c => c.state.sim?.try ? [c.state.sim.try.vary, ...(c.state.sim.try.also ?? [])] : []));
    for (const control of sim.controls) expect(exposed.has(control.id), `control ${control.id} is reachable`).toBe(true);
  });

  it('projects every requested label into its authored 16:9 camera and visible layer', () => {
    // Checks coordinates only; browser QA must still inspect HUD overlap/occlusion.
    for (const c of chapters) for (const [i, b] of c.state.beats!.entries()) {
      const cam = typeof b.camera === 'object' ? b.camera : file.presets!.find(p => p.id === b.camera)!.camera;
      const camera = new PerspectiveCamera(cam.fov ?? 30, 16 / 9, 0.001, 1000);
      camera.position.fromArray(cam.position); camera.lookAt(new Vector3(...cam.target)); camera.updateMatrixWorld();
      for (const id of b.labels!) {
        const p = file.parts.find(p => p.id === id)!;
        const hide = b.hide ?? c.state.hide ?? [], ghost = b.ghost ?? c.state.ghost ?? [];
        expect(hide, `${c.id}.${i + 1}: hidden ${id}`).not.toContain(id);
        expect(hide).not.toContain(p.group); expect(ghost).not.toContain(id); expect(ghost).not.toContain(p.group);
        expect(b.layers ?? c.state.layers).toContain(p.group);
        const point = new Vector3(...p.primitive!.at).add(new Vector3(...anchorPoint(p))).project(camera);
        expect(Math.abs(point.x), `${c.id}.${i + 1} ${id} x`).toBeLessThan(1);
        expect(Math.abs(point.y), `${c.id}.${i + 1} ${id} y`).toBeLessThan(1);
        expect(point.z).toBeGreaterThan(-1); expect(point.z).toBeLessThan(1);
      }
    }
  });
});
