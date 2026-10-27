import { readFileSync } from 'node:fs';
import { describe, expect, it, vi, afterEach } from 'vitest';
import { compactDeepTimeData, loadModernEvidence } from '../../src/engines/time-scene/deep-time-transport';
import type { DeepTimeBundle, ModernInsetConfig } from '../../src/engines/time-scene/lib/deepTime';
import { parse } from 'yaml';

const json = (stem: string) => JSON.parse(readFileSync(`public/geo/${stem}.json`, 'utf8'));
const config = parse(readFileSync('src/content/topics/sample-deep-time/topic.yaml', 'utf8')).modernInset as ModernInsetConfig;
const bundle = (id: string): DeepTimeBundle => ({ reconstruction: { ...json('sample-de-reconstruction'), modelId: id }, inset: json(config.file), points: [], cards: [] });
afterEach(() => vi.unstubAllGlobals());

describe('static deep-time asset transport', () => {
  it('keeps existing engine payloads byte-for-byte equivalent and strips duplicate modern vectors only', () => {
    const legacy = { parts: { parts: [] } };
    expect(compactDeepTimeData(legacy)).toBe(legacy);
    const full = { deepTime: { ...bundle('transport-compact'), points: json('sample-de-points').points, cards: json('sample-de-cards').cards, land: json(config.land), countries: json(config.countries) }, sources: { sources: [] } };
    expect(compactDeepTimeData(full)).toEqual({ ...full, deepTime: { reconstruction: full.deepTime.reconstruction, inset: full.deepTime.inset, points: [], cards: [] } });
  });
  it('loads only local files, preserves all records, and deduplicates concurrent/remount requests', async () => {
    const fetcher = vi.fn(async (url: string) => ({ ok: true, json: async () => json(/\/geo\/([^/]+)\.json$/.exec(url)![1]!) }));
    vi.stubGlobal('fetch', fetcher);
    const compact = bundle('transport-concurrent');
    const first = loadModernEvidence(compact, config);
    expect(loadModernEvidence(compact, config)).toBe(first);
    const loaded = await first;
    expect(loaded.points).toHaveLength(6); expect(loaded.cards).toHaveLength(4);
    expect(loaded.land?.features.length).toBeGreaterThan(0);
    expect(fetcher).toHaveBeenCalledTimes(4);
    expect(fetcher.mock.calls.every(([url]) => url.startsWith('/geo/'))).toBe(true);
    expect(await loadModernEvidence(loaded, config)).toBe(loaded);
    expect(fetcher).toHaveBeenCalledTimes(4);
  });
  it('reports a missing modern asset and permits a later local retry', async () => {
    const compact = bundle('transport-retry');
    let unavailable = true;
    vi.stubGlobal('fetch', vi.fn(async (url: string) => ({ ok: !unavailable, json: async () => json(/\/geo\/([^/]+)\.json$/.exec(url)![1]!) })));
    await expect(loadModernEvidence(compact, config)).rejects.toThrow('Local modern evidence unavailable');
    unavailable = false;
    expect((await loadModernEvidence(compact, config)).points).toHaveLength(6);
  });
  it('loads the original bibliography locally and omits it from the compact topic response', async () => {
    const fetcher = vi.fn(async (url: string) => ({ ok: true, json: async () => json(/\/geo\/([^/]+)\.json$/.exec(url)![1]!) }));
    vi.stubGlobal('fetch', fetcher);
    const compact = bundle('transport-bibliography');
    compact.inset = { ...compact.inset!, referenceFile: 'de-pbdb-references' };
    const loaded = await loadModernEvidence(compact, config);
    expect(loaded.references?.['6837']).toContain('Wedel, R. L. Cifelli');
    expect(Object.keys(loaded.references!)).toHaveLength(815);
    expect(fetcher).toHaveBeenCalledWith('/geo/de-pbdb-references.json');
    expect(await loadModernEvidence(loaded, config)).toBe(loaded);
    expect((compactDeepTimeData({ deepTime: loaded }) as { deepTime: DeepTimeBundle }).deepTime.references).toBeUndefined();
  });
});
