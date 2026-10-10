import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { parse as parseYaml } from 'yaml';
import { partsFile, spaceBeat, spaceChapterIssues, spaceChapterState, spacePresetIds, spaceSceneData, spaceSceneIds } from '../../src/engines/space-scene/schema';
import { groupLabelId, labelGroup, listedLabels, PRESENT_LABEL_CAP, unionBox } from '../../src/engines/space-scene/lib/labels';

const part = (id: string, extra: Record<string, unknown> = {}) => ({
  id,
  name: { en: id },
  group: 'g',
  summary: { en: 's' },
  detail: { en: 'd' },
  primitive: { kind: 'box', size: [1, 1, 1], at: [0, 0, 0], color: 'steel' },
  ...extra,
});
const camera = { position: [1, 2, 3], target: [0, 0, 0], fov: 30 };
const parts = {
  parts: [part('a'), part('b'), part('wall', { group: undefined, context: true })],
  groups: [{ id: 'g', name: { en: 'G', zh: '组' }, color: 'token:ink' }],
  presets: [{ id: 'side', label: { en: 'Side', zh: '侧面' }, camera, view: 'xray' }],
};
const data = spaceSceneData.parse({ parts });

describe('space beats (G1)', () => {
  it('a beat takes the scene fields, a caption, an orbit camera or a named preset id', () => {
    expect(spaceBeat.parse({ caption: { en: 'One', zh: '一' } })).toEqual({ caption: { en: 'One', zh: '一' } });
    expect(spaceBeat.parse({ camera: 'side', caption: { en: 'One' } }).camera).toBe('side');
    expect(spaceBeat.parse({ camera, caption: { en: 'One' } }).camera).toEqual(camera);
    const full = { view: 'xray', part: null, explode: 0.5, run: true, cutaway: 'half', layers: ['g'], labels: ['a', 'group:g'], hide: ['b'], caption: { en: 'x' }, audio: '/audio/x/1.mp3' };
    expect(spaceBeat.safeParse(full).success).toBe(true);
  });
  it('rejects a beat without a caption, unknown fields, more than six labels and bad label ids', () => {
    expect(spaceBeat.safeParse({ view: 'xray' }).success).toBe(false);
    expect(spaceBeat.safeParse({ highlight: ['a'], caption: { en: 'x' } }).success).toBe(false);
    expect(spaceBeat.safeParse({ labels: ['a', 'b', 'c', 'd', 'e', 'f', 'g'], caption: { en: 'x' } }).success).toBe(false);
    expect(spaceBeat.safeParse({ labels: ['group:'], caption: { en: 'x' } }).success).toBe(false);
    expect(spaceBeat.safeParse({ labels: ['Group:g'], caption: { en: 'x' } }).success).toBe(false);
  });
  it('the chapter state accepts summary, question and beats (and group labels)', () => {
    const state = spaceChapterState.parse({
      summary: { en: 'S' },
      question: { en: 'Q?' },
      labels: ['group:g'],
      beats: [{ caption: { en: 'One' } }],
    });
    expect(state.beats).toHaveLength(1);
    expect(spaceChapterState.safeParse({ beats: [] }).success).toBe(false);
  });
  it('checks what the state and every beat name against the data', () => {
    const state = spaceChapterState.parse({
      part: 'a',
      labels: ['group:g'],
      beats: [
        { part: 'wall', hide: ['wall', 'nope'], labels: ['group:h', 'a'], layers: ['g', 'x'], camera: 'top', caption: { en: '1' } },
        { camera: 'side', labels: ['wall'], caption: { en: '2' } },
      ],
    });
    expect(spaceChapterIssues(state, data)).toEqual([
      'state.beats.0.part: "wall" is a context part (never selected or labelled)',
      'state.beats.0.hide: unknown part "nope"',
      'state.beats.0.labels: unknown group "h"',
      'state.beats.0.layers: unknown group "x"',
      'state.beats.0.camera: unknown preset "top" (not in parts.json presets)',
      'state.beats.1.labels: "wall" is a context part (never selected or labelled)',
    ]);
  });
});

describe('named camera presets (G7)', () => {
  it('are listed for <FlyTo> and the id registry', () => {
    expect(spacePresetIds(data)).toEqual(['side']);
    expect(spaceSceneIds(data)).toContainEqual({ kind: 'preset', id: 'side' });
  });
  it('keep the engine ids for the engine and stay few', () => {
    const preset = parts.presets[0]!;
    expect(partsFile.safeParse({ ...parts, presets: [{ ...preset, id: 'reference' }] }).success).toBe(false);
    expect(partsFile.safeParse({ ...parts, presets: Array.from({ length: 7 }, (_, i) => ({ ...preset, id: `p${i}` })) }).success).toBe(false);
    expect(partsFile.safeParse({ ...parts, presets: [{ ...preset, view: 'sideways' }] }).success).toBe(false);
  });
});

describe('leader-label targets (G12)', () => {
  it('a group label is group:<id>', () => {
    expect(labelGroup('group:outdoor')).toBe('outdoor');
    expect(labelGroup('outdoor-fan')).toBeNull();
    expect(groupLabelId('outdoor')).toBe('group:outdoor');
  });
  it('the presentation shows the beat list, else the chapter list, capped at six; outside it the chapter list', () => {
    const many = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
    expect(listedLabels({ presenting: true, beat: ['a'], chapter: ['b'] })).toEqual(['a']);
    expect(listedLabels({ presenting: true, beat: null, chapter: many })).toEqual(many.slice(0, PRESENT_LABEL_CAP));
    expect(listedLabels({ presenting: false, beat: ['a'], chapter: many })).toEqual(many);
    expect(listedLabels({ presenting: false, beat: null, chapter: undefined })).toBeNull();
    expect(listedLabels({ presenting: true, beat: null, chapter: undefined })).toBeNull();
  });
  it('a group placard sits at the bounding centre of its visible parts', () => {
    const out = { center: [0, 0, 0] as [number, number, number], half: [0, 0, 0] as [number, number, number] };
    expect(unionBox([], out)).toBe(false);
    expect(
      unionBox(
        [
          { center: [0, 0, 0], half: [1, 1, 1] },
          { center: [4, 0, 0], half: [1, 2, 1] },
        ],
        out,
      ),
    ).toBe(true);
    expect(out).toEqual({ center: [2, 0, 0], half: [3, 2, 1] });
  });
});

describe('sample-space presentation data', () => {
  const root = join(__dirname, '../../src/content/topics/sample-space');
  const read = (name: string) => JSON.parse(readFileSync(join(root, `data/${name}.json`), 'utf8'));
  const sample = spaceSceneData.parse({ parts: read('parts'), sources: read('sources'), glossary: read('glossary') });
  const front = parseYaml(readFileSync(join(root, 'chapters/03-switch-on.mdx'), 'utf8').split('---')[1]!) as { state: unknown };
  const state = spaceChapterState.parse(front.state);
  it('chapter 03 has two beats: one hides parts, one uses a group label and a named preset camera', () => {
    expect(state.beats).toHaveLength(2);
    expect(state.beats![0]!.hide?.length).toBeGreaterThan(0);
    expect(state.beats![1]!.labels?.some((l) => labelGroup(l) !== null)).toBe(true);
    expect(spacePresetIds(sample)).toContain(state.beats![1]!.camera);
    expect(spaceChapterIssues(state, sample)).toEqual([]);
  });
});
