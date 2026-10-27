import { readFileSync } from 'node:fs';
import type { ThemeTokens } from '../../src/theme/theme';
import { describe, expect, it } from 'vitest';
import { validateStyleMin } from '@maplibre/maplibre-gl-style-spec';
import type { FeatureCollection } from 'geojson';
import type { ReconstructionManifest } from '../../src/engines/time-scene/deep-time';
import { createReconstructionFrames, reconstructionFrameAt, RECONSTRUCTION_EMPTY } from '../../src/engines/time-scene/lib/reconstruction';
import { buildReconstructionStyle } from '../../src/engines/time-scene/reconstruction-style';

// TEST data only: geometry labels identify source replacement without invented ancient coastlines.
const manifest: ReconstructionManifest = {
  version: 1, modelId: 'test-reconstruction', modelLabel: { en: 'Test', zh: '测试' },
  coordinateSpace: 'reconstructed', geometryMeaning: 'exposed-land',
  method: { en: 'Test fixture', zh: '测试夹具' }, sources: ['test-source'],
  frames: [250, 230, 200, 170, 150, 130, 100, 70, 65, 0].map((ma) => ({
    id: `test-frame-${ma}`, t: { ma }, file: `test-land-${ma}`,
    sampleBounds: [-180, -90, 180, 90], sources: ['test-source'],
  })),
};
const geometry = (id: string): FeatureCollection => ({ type: 'FeatureCollection', features: [{
  type: 'Feature', geometry: { type: 'Point', coordinates: [0, 0] }, properties: { id },
}] });
function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason: Error) => void;
  const promise = new Promise<T>((yes, no) => { resolve = yes; reject = no; });
  return { promise, resolve, reject };
}

describe('reconstruction source isolation', () => {
  it('starts with blank local sources in both themes and never adds modern data', () => {
    const css = readFileSync('src/theme/tokens.css', 'utf8');
    for (const theme of ['paper', 'cinema']) {
      const at = css.indexOf(`:root[data-theme="${theme}"] {`);
      const body = css.slice(at, css.indexOf('\n}', at));
      const values = Object.fromEntries([...body.matchAll(/--([a-z0-9-]+):\s*([^;]+);/g)].map((m) => [m[1], m[2]!.trim()]));
      const resolve = (key: string): string => values[key]!.startsWith('var(') ? resolve(values[key]!.slice(6, -1)) : values[key]!;
      const tokens = Object.fromEntries(['land', 'water', 'paper', 'land-edge'].map((k) => [k, resolve(k)])) as Pick<ThemeTokens, 'land' | 'water' | 'paper' | 'land-edge'>;
      const style = buildReconstructionStyle(tokens);
      expect(validateStyleMin({ version: 8, sources: style.sources, layers: style.layers }).map((issue) => issue.message)).toEqual([]);
      const serialized = JSON.stringify(style);
      for (const forbidden of ['land-50m', 'land-10m', 'countries', 'borders', 'rivers', 'glyphs', 'sprite', 'http']) {
        expect(serialized).not.toContain(forbidden);
      }
      expect(style.sources['ts-reconstruction']).toEqual({ type: 'geojson', data: RECONSTRUCTION_EMPTY });
      expect(style.layers.find((layer) => layer.id === 'ts-reconstruction-coast')).toMatchObject({ filter: ['==', ['get', 'kind'], 'coast'] });
      expect(style.transition).toEqual({ duration: 0, delay: 0 });
    }
  });
});

describe('discrete reconstruction frame state', () => {
  it('holds the closest older sample including exact endpoints, and clamps to the provided range', () => {
    expect([250, 230, 201.4, 150, 66, 65, 32.5, 0].map((q) => reconstructionFrameAt(manifest, q)?.t.ma))
      .toEqual([250, 230, 230, 150, 70, 65, 65, 0]);
    expect(reconstructionFrameAt(manifest, 999)?.t.ma).toBe(250);
    expect(reconstructionFrameAt(manifest, -1)?.t.ma).toBe(0);
    for (const invalid of [NaN, Infinity, -Infinity]) expect(reconstructionFrameAt(manifest, invalid)).toBeNull();
  });

  it('uploads once per actual frame change, while same-frame scrubbing changes only readouts', async () => {
    const uploads: FeatureCollection[] = [];
    let loads = 0;
    const frames = createReconstructionFrames({ manifest, load: async (frame) => { loads++; return geometry(frame.id); }, apply: (data) => { uploads.push(data); } });
    await frames.select(66);
    await frames.select(68);
    await frames.select(70);
    expect(loads).toBe(1);
    expect(uploads).toHaveLength(1);
    expect(frames.stats()).toMatchObject({ selectedMa: 70, frameMa: 70, deltaMa: 0, geometryUpdates: 1, status: 'ready' });
    await frames.select(65);
    expect(frames.stats()).toMatchObject({ frameMa: 65, geometryUpdates: 2 });
    await frames.select(32.5);
    expect(frames.stats()).toMatchObject({ frameMa: 65, deltaMa: 32.5, geometryUpdates: 2 });
    expect(loads).toBe(2);
  });

  it('clears old land during loading, discards a late response and stays blank on failure', async () => {
    const pending70 = deferred<FeatureCollection>();
    const pending65 = deferred<FeatureCollection>();
    const uploads: FeatureCollection[] = [];
    const signals: AbortSignal[] = [];
    const frames = createReconstructionFrames({ manifest,
      load: async (frame, signal) => {
        signals.push(signal);
        if (frame.t.ma === 70) return pending70.promise;
        if (frame.t.ma === 65) return pending65.promise;
        return geometry(frame.id);
      }, apply: (data) => { uploads.push(data); },
    });
    await frames.select(100);
    const loading70 = frames.select(66);
    expect(uploads.at(-1)).toEqual(RECONSTRUCTION_EMPTY);
    expect(frames.stats()).toMatchObject({ selectedMa: 66, frameId: null, frameMa: null, deltaMa: null, status: 'loading' });
    const loading65 = frames.select(65);
    expect(signals[1]!.aborted).toBe(true);
    pending70.resolve(geometry('obsolete-70'));
    await loading70;
    expect(frames.stats()).toMatchObject({ selectedMa: 65, frameMa: null, status: 'loading', geometryUpdates: 1 });
    pending65.reject(new Error('TEST missing frame'));
    await loading65;
    expect(frames.stats()).toMatchObject({ selectedMa: 65, frameId: null, frameMa: null, deltaMa: null, status: 'unavailable', geometryUpdates: 1 });
    expect(uploads.at(-1)).toEqual(RECONSTRUCTION_EMPTY);
    expect(frames.cachedIds()).not.toContain('test-frame-70');
  });

  it('reports ready only after source processing and ignores an obsolete upload completion', async () => {
    const processing70 = deferred<void>();
    const processing65 = deferred<void>();
    const frames = createReconstructionFrames({ manifest,
      load: async (frame) => geometry(frame.id),
      apply(data) {
        const id = data.features[0]?.properties?.id;
        if (id === 'test-frame-70') return processing70.promise;
        if (id === 'test-frame-65') return processing65.promise;
      },
    });
    const pending70 = frames.select(66);
    await Promise.resolve();
    expect(frames.stats()).toMatchObject({ status: 'loading', frameMa: null, geometryUpdates: 0 });
    const pending65 = frames.select(65);
    await Promise.resolve();
    processing70.resolve();
    await pending70;
    expect(frames.stats()).toMatchObject({ selectedMa: 65, status: 'loading', frameMa: null, geometryUpdates: 0 });
    processing65.resolve();
    await pending65;
    expect(frames.stats()).toMatchObject({ selectedMa: 65, status: 'ready', frameMa: 65, geometryUpdates: 1 });
  });

  it('keeps at most the current sample and two neighbouring decoded frames', async () => {
    let loads = 0;
    const frames = createReconstructionFrames({ manifest, load: async (frame) => { loads++; return geometry(frame.id); }, apply() {} });
    for (const ma of [250, 230, 200, 230, 200, 170, 150, 130, 100, 70, 65, 0]) {
      await frames.select(ma);
      expect(frames.cachedIds().length).toBeLessThanOrEqual(3);
      expect(frames.cachedIds()).toContain(`test-frame-${ma}`);
    }
    expect(loads).toBe(10);
    expect(frames.cachedIds()).toEqual(['test-frame-70', 'test-frame-65', 'test-frame-0']);
  });

  it('ignores all work after destroy, even when fetch ignores AbortSignal', async () => {
    const waiting = deferred<FeatureCollection>();
    const uploads: FeatureCollection[] = [];
    const frames = createReconstructionFrames({ manifest, load: () => waiting.promise, apply: (data) => { uploads.push(data); } });
    const request = frames.select(66);
    frames.destroy();
    waiting.resolve(geometry('late'));
    await request;
    await frames.select(65);
    expect(uploads).toEqual([]);
    expect(frames.cachedIds()).toEqual([]);
  });
});
