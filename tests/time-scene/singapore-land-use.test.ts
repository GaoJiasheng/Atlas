import { readFileSync, readdirSync } from 'node:fs';
import type { FeatureCollection } from 'geojson';
import { describe, expect, it } from 'vitest';
import { parse } from 'yaml';
import { decodeTopologyObject } from '../../src/engines/time-scene/lib/control';
import { datedLayerState, indexDatedLayer } from '../../src/engines/time-scene/lib/datedLayers';
import { toNumber } from '../../src/engines/time-scene/lib/time';
import { timeSceneGeoData, type TimeChapterState } from '../../src/engines/time-scene/schema';
import { buildTimeModel } from '../../src/engines/time-scene/lib/model';

/** singapore-land-use (docs/34): the published map data agrees with the chapters and with four-taps. */
const root = new URL('../../', import.meta.url);
const text = (file: string) => readFileSync(new URL(file, root), 'utf8');
const json = (file: string) => JSON.parse(text(file)) as unknown;
const dir = 'src/content/topics/singapore-land-use/';
const topic = parse(text(`${dir}topic.yaml`)) as {
  status: string;
  levels: string[];
  datedLayers: { id: string; file: string; kind: 'point' | 'line' | 'area'; holder?: string; count?: boolean }[];
};
const chapters = readdirSync(new URL(`${dir}chapters/`, root))
  .filter((name) => name.endsWith('.mdx'))
  .sort()
  .map((name) => {
    const source = text(`${dir}chapters/${name}`);
    return { name, source, ...(parse(source.split('---')[1]!) as { id: string; order: number; state: TimeChapterState }) };
  });
const layer = (file: string): FeatureCollection => decodeTopologyObject(json(`public/geo/${file}.json`), file);
const START = toNumber('1959-04-01');
const END = toNumber('2025-12-31');
const visibleAt = (fc: FeatureCollection, t: number) => datedLayerState(indexDatedLayer(fc), t).visible;

describe('singapore-land-use: dated layers', () => {
  it('has one TopoJSON object per file, named like the file, with geometry matching its kind', () => {
    const types = { point: ['Point'], line: ['LineString', 'MultiLineString'], area: ['Polygon', 'MultiPolygon'] };
    expect(topic.datedLayers.map((l) => l.id)).toEqual(['hdb-blocks', 'estates', 'farm-parks', 'reserves', 'reservoirs']);
    for (const def of topic.datedLayers) {
      const raw = json(`public/geo/${def.file}.json`) as { type: string; objects: Record<string, unknown> };
      expect(raw.type).toBe('Topology');
      expect(Object.keys(raw.objects)).toEqual([def.file]);
      for (const f of layer(def.file).features) {
        expect(types[def.kind]).toContain(f.geometry.type);
        const p = f.properties as { f: number; u?: number; certainty?: string };
        expect(Number.isFinite(p.f)).toBe(true);
        if (p.u !== undefined) expect(p.u).toBeGreaterThan(p.f);
      }
    }
  });

  it('HDB dots: one point per block, completion years from the SIT era to 2026, counts at key years', () => {
    const blocks = layer('sg-hdb-blocks');
    expect(blocks.features).toHaveLength(10644);
    const years = blocks.features.map((f) => (f.properties as { f: number }).f);
    expect(Math.min(...years)).toBe(1937);
    expect(Math.max(...years)).toBe(2026);
    expect(years.every(Number.isInteger)).toBe(true);
    // Blocks standing today, by year completed (dated-layers-report.md).
    expect([1959, 1965, 1980, 1990, 2000, 2019, 2025].map((y) => visibleAt(blocks, y)))
      .toEqual([89, 244, 1751, 5060, 7818, 9890, 10618]);
    for (const f of blocks.features) expect((f.properties as { h: number }).h).toBeGreaterThan(0);
  });

  it('areas carry approximate certainty per feature; reservoirs follow four-taps without Linggiu', () => {
    for (const file of ['sg-estates', 'sg-farm-parks', 'sg-reserves'])
      for (const f of layer(file).features) expect((f.properties as { certainty: string }).certainty).toBe('approximate');
    const events = json('src/content/topics/four-taps/data/events.json') as { id: string; t: string }[];
    const reservoirs = layer('sg-reservoirs').features.map((f) => f.properties as { id: string; f: number });
    expect(reservoirs).toHaveLength(17);
    expect(reservoirs.map((r) => r.id)).not.toContain('site-linggiu-reservoir');
    for (const r of reservoirs) {
      const event = events.find((e) => e.id === r.id)!;
      expect(Math.floor(r.f)).toBe(Number(event.t.slice(0, 4)));
    }
    expect(visibleAt(layer('sg-reservoirs'), START)).toBe(3);
  });
});

describe('singapore-land-use: control and coasts', () => {
  it('has the 1959 map, two empty frames, Master Plan 2019 and a hold frame ending the timeline', () => {
    const control = json(`${dir}data/control.json`) as { keyframes: { t: string; object: string }[]; topology: unknown };
    expect(control.keyframes.map((k) => k.t)).toEqual(['1959-04-01', '1966-01-01', '2019-01-01', '2019-11-18', '2025-12-31']);
    expect(control.keyframes[4]!.object).toBe(control.keyframes[3]!.object);
    const counts = control.keyframes.map((k) => decodeTopologyObject(control.topology, k.object).features.length);
    expect(counts).toEqual([3, 0, 0, 7, 7]);
    const k1 = decodeTopologyObject(control.topology, control.keyframes[0]!.object);
    for (const f of k1.features) expect((f.properties as { certainty: string }).certainty).toBe('approximate');
  });

  it('dates seven coast eras end to end, the first starting before the timeline', () => {
    const land = decodeTopologyObject(json('public/geo/land-sg-modern.json'), 'land-sg-modern').features
      .filter((f) => f.properties?.kind === 'land')
      .map((f) => f.properties as { id: string; from?: string; to?: string });
    expect(land.map((e) => e.id)).toEqual(['L5', 'L6', 'L7', 'L8', 'L9', 'L10', 'L11']);
    expect(land[0]!.from).toBeUndefined();
    expect(land.at(-1)!.to).toBeUndefined();
    for (let i = 1; i < land.length; i++) expect(land[i]!.from).toBe(land[i - 1]!.to);
    expect(land.slice(1, 6).map((e) => e.from)).toEqual(['1973-10-17', '1979-10-31', '1991-04-28', '2002-10-11', '2011-02-14']);
  });
});

describe('singapore-land-use: chapters', () => {
  it('spans 1 April 1959 to 31 December 2025 on the time axis', () => {
    const data = timeSceneGeoData.parse(Object.fromEntries(['control', 'entities', 'events', 'movements', 'sources', 'glossary', 'presets'].map((n) => [n, json(`${dir}data/${n}.json`)])));
    const model = buildTimeModel(data, chapters.map((c) => ({ id: c.id, t: c.state.time! })));
    expect(model.min).toBe(START);
    expect(model.max).toBe(END);
  });

  it('runs in time order, with 3–5 beats per chapter inside 1959–2025', () => {
    expect(chapters.map((c) => c.order)).toEqual([0, 1, 2, 3, 4, 5, 6]);
    const times = chapters.map((c) => toNumber(c.state.time!));
    expect([...times].sort((a, b) => a - b)).toEqual(times);
    for (const c of chapters) {
      const beats = c.state.beats ?? [];
      expect(beats.length).toBeGreaterThanOrEqual(3);
      expect(beats.length).toBeLessThanOrEqual(5);
      for (const b of beats) {
        const t = toNumber(b.t ?? c.state.time!);
        expect(t).toBeGreaterThanOrEqual(START);
        expect(t).toBeLessThanOrEqual(END);
        expect(b.caption.en.length).toBeGreaterThan(0);
        expect(b.caption.zh.length).toBeGreaterThan(0);
      }
    }
  });

  it('a coast beat never shows land before its satellite date (more-land)', () => {
    const more = chapters.find((c) => c.id === 'more-land')!;
    const eras = ['1979-10-31', '1991-04-28', '2002-10-11', '2011-02-14', '2019-11-18'].map(toNumber);
    const [b1, b2, b3, b4, b5] = (more.state.beats ?? []).map((b) => toNumber(b.t!));
    expect(b1).toBeGreaterThanOrEqual(eras[0]!);
    expect(b2).toBeGreaterThanOrEqual(eras[1]!);
    expect(b3).toBeGreaterThanOrEqual(eras[2]!);
    expect(b4).toBeGreaterThanOrEqual(eras[3]!);
    expect(b5).toBeGreaterThanOrEqual(eras[4]!);
  });

  it('is fully bilingual, has no grade labels and is published', () => {
    expect(topic.status).toBe('published');
    const files = [
      ...chapters.map((c) => c.source),
      text(`${dir}topic.yaml`),
      ...['entities', 'events', 'movements', 'glossary', 'presets', 'sources'].map((n) => text(`${dir}data/${n}.json`)),
      text(`${dir}data/control.json`),
    ];
    for (const file of files) {
      expect(file).not.toContain('待译');
      // `levels` in topic.yaml is planning metadata; no reader-facing text names a grade.
      expect(file.replace(/^levels:.*$/m, '')).not.toMatch(/\bP[1-6]\b|小[一二三四五六]/);
    }
    for (const c of chapters) {
      expect(c.source).toContain('<Lang en>');
      expect(c.source).toContain('<Lang zh>');
      // Chinese prose uses “ ” only: no corner brackets and no straight quotes outside tags.
      const zh = c.source.split('<Lang zh>')[1]!.replace(/<[^>]*>/g, '');
      expect(zh).not.toMatch(/[「」"]/);
    }
  });
});

describe('singapore-land-use: railway and events', () => {
  it('rail segments persist from their first passenger day, in the transport colour', () => {
    const movements = json(`${dir}data/movements.json`) as { id: string; from: string; to: string; persist?: boolean; holder: string }[];
    expect(movements).toHaveLength(37);
    for (const m of movements) {
      expect(m.persist).toBe(true);
      expect(m.holder).toBe('transport');
      expect(m.from).toBe(m.to);
    }
    const day = (id: string) => movements.find((m) => m.id === id)!.from;
    expect(day('nsl-toa-payoh-yio-chu-kang')).toBe('1987-11-07');
    expect(day('ewl-outram-park-clementi')).toBe('1988-03-12');
    expect(day('nsl-woodlands-extension')).toBe('1996-02-10');
  });

  it('every milestone has a place; Linggiu is left to four-taps', () => {
    const events = json(`${dir}data/events.json`) as { id: string; kind: string; at?: number[] }[];
    for (const e of events.filter((x) => x.kind === 'milestone')) expect(e.at).toHaveLength(2);
    expect(events.map((e) => e.id).filter((id) => id.includes('linggiu'))).toEqual([]);
  });
});
