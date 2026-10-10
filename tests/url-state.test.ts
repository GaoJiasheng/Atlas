import { describe, expect, it } from 'vitest';
import { decodeSceneState, encodeSceneState, mergeSearch, type UrlState } from '../src/engines/core/url-state';
import { decodeCamera, encodeCamera } from '../src/engines/core/camera';

const toSearch = (state: UrlState, baseline?: UrlState) => mergeSearch('', encodeSceneState(state, baseline));

describe('url-state encode/decode', () => {
  it('round-trips a time scene state (docs/02 example)', () => {
    const state: UrlState = {
      chapter: 'fall-of-singapore',
      t: '1942-02-10',
      layers: ['control', 'battles'],
      camera: { center: [103.8, 1.35], zoom: 7.5 },
    };
    const search = toSearch(state);
    expect(search).toBe('?ch=fall-of-singapore&t=1942-02-10&layers=control,battles&cam=103.8,1.35,7.5');
    expect(decodeSceneState(search)).toEqual(state);
  });

  it('round-trips a space scene state (docs/02 example)', () => {
    const state: UrlState = { chapter: 'power-on', part: 'compressor', view: 'xray', run: true, explode: 0.35 };
    const search = toSearch(state);
    expect(search).toBe('?ch=power-on&part=compressor&view=xray&explode=0.35&run=1');
    expect(decodeSceneState(search)).toEqual(state);
  });

  it('round-trips a lesson sub-step and model view (MathScene task / model), never more', () => {
    const state: UrlState = { chapter: 'equivalent-fractions', task: 2, model: 'circle' };
    expect(toSearch(state)).toBe('?ch=equivalent-fractions&task=2&model=circle');
    expect(decodeSceneState(toSearch(state))).toEqual(state);
    expect(toSearch({ chapter: 'practice', task: 1, model: null }, { chapter: 'practice', task: 1, model: null })).toBe('?ch=practice');
    expect(decodeSceneState('?task=0&model=Bad')).toEqual({});
    expect(decodeSceneState('?task=4&model=')).toEqual({ task: 4, model: null });
  });

  it('round-trips highlight (hl) and cutaway (cut)', () => {
    const time: UrlState = { chapter: 'a', t: '1942-02', highlight: ['battle-of-singapore', 'japan'] };
    expect(toSearch(time)).toBe('?ch=a&t=1942-02&hl=battle-of-singapore,japan');
    expect(decodeSceneState(toSearch(time))).toEqual(time);

    const space: UrlState = { chapter: 'b', part: 'fan', run: true, cutaway: 'half' };
    expect(toSearch(space)).toBe('?ch=b&part=fan&run=1&cut=half');
    expect(decodeSceneState(toSearch(space))).toEqual(space);
  });

  it('encodes an explicitly cleared highlight and omits highlight/cutaway equal to the baseline', () => {
    const baseline: UrlState = { chapter: 'a', highlight: ['x-1'], cutaway: 'none' };
    expect(toSearch({ ...baseline }, baseline)).toBe('?ch=a');
    expect(toSearch({ ...baseline, highlight: [] }, baseline)).toBe('?ch=a&hl=');
    expect(decodeSceneState('?hl=')).toEqual({ highlight: [] });
    expect(toSearch({ ...baseline, highlight: ['x-1', 'y-2'] }, baseline)).toBe('?ch=a&hl=x-1,y-2');
    expect(toSearch({ ...baseline, cutaway: 'half' }, baseline)).toBe('?ch=a&cut=half');
  });

  it('drops invalid hl ids and cut values', () => {
    expect(decodeSceneState('?hl=ok-id,Bad%20Id,also-ok')).toEqual({ highlight: ['ok-id', 'also-ok'] });
    expect(decodeSceneState('?cut=Full_Cut')).toEqual({});
    // A named cut (kebab id) passes; the engine falls back to no cut when the data has none of that name.
    expect(decodeSceneState('?cut=sagittal')).toEqual({ cutaway: 'sagittal' });
  });

  it('round-trips a pose (pose), and an explicit rest (empty)', () => {
    expect(toSearch({ chapter: 'a', pose: 'wings-open' })).toBe('?ch=a&pose=wings-open');
    expect(decodeSceneState('?pose=wings-open')).toEqual({ pose: 'wings-open' });
    expect(decodeSceneState('?pose=')).toEqual({ pose: null });
    expect(decodeSceneState('?pose=Bad%20Pose')).toEqual({});
    expect(toSearch({ chapter: 'a', pose: null }, { chapter: 'a', pose: null })).toBe('?ch=a');
  });

  it('round-trips geological time, orbit cameras, theme and nulls', () => {
    const state: UrlState = {
      chapter: 'pangaea',
      t: { ma: 200 },
      camera: { position: [3, 2.5, -4], target: [0, 0.25, 0] },
      theme: 'cinema',
      part: null,
      layers: [],
    };
    const decoded = decodeSceneState(toSearch(state));
    expect(decoded).toEqual(state);
  });

  it('omits fields equal to the baseline but always keeps ch', () => {
    const baseline: UrlState = { chapter: 'a', layers: ['control'], t: '1940', run: false };
    expect(toSearch({ ...baseline }, baseline)).toBe('?ch=a');
    expect(toSearch({ ...baseline, layers: ['control', 'battles'] }, baseline)).toBe('?ch=a&layers=control,battles');
    expect(toSearch({ ...baseline, layers: [] }, baseline)).toBe('?ch=a&layers=');
  });

  it('drops invalid values instead of throwing', () => {
    expect(
      decodeSceneState('?ch=Bad%20Id&t=1942-13-01&cam=1,2&theme=neon&explode=x&run=maybe&view=X!&part=Nope'),
    ).toEqual({});
    expect(decodeSceneState('?explode=4')).toEqual({ explode: 1 });
    expect(decodeSceneState('?layers=ok,NOT%20OK,also-ok')).toEqual({ layers: ['ok', 'also-ok'] });
  });

  it('preserves foreign query params and replaces scene keys', () => {
    const search = mergeSearch('?utm_source=mail&ch=old&t=1939', [['ch', 'new']]);
    expect(search).toBe('?ch=new&utm_source=mail');
    expect(mergeSearch('?ch=x', [])).toBe('');
  });
});

describe('camera codec', () => {
  it('encodes geo cameras compactly with optional pitch/bearing', () => {
    expect(encodeCamera({ center: [103.81234567, 1.35], zoom: 7.5 })).toBe('103.8123,1.35,7.5');
    expect(encodeCamera({ center: [0, 0], zoom: 2, pitch: 30 })).toBe('0,0,2,30');
    expect(encodeCamera({ center: [0, 0], zoom: 2, bearing: 15 })).toBe('0,0,2,0,15');
  });

  it('rejects out-of-range geo cameras and unknown arities', () => {
    expect(decodeCamera('200,0,3')).toBeNull();
    expect(decodeCamera('0,0,30')).toBeNull();
    expect(decodeCamera('1,2,3,4,5,6,7')).toBeNull();
    expect(decodeCamera('1,,3')).toBeNull();
  });
});
