/** Documentary dates, caption denominators and real geometry for the draft history topic. */
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { parse } from 'yaml';
import { describe, expect, it } from 'vitest';
import { decodeDatedLayer, datedLayerState, indexDatedLayer } from '../src/engines/time-scene/lib/datedLayers';
import { toNumber } from '../src/engines/time-scene/lib/time';
import { ringIssues } from '../scripts/geo/lib/rings';
import type { Position } from 'geojson';

const root = join(import.meta.dirname, '..');
const topicDir = join(root, 'src/content/topics/industrial-revolution');
const json = (name: string) => JSON.parse(readFileSync(join(topicDir, 'data', name + '.json'), 'utf8'));
const topic = parse(readFileSync(join(topicDir, 'topic.yaml'), 'utf8'));
type Event = { id: string; t: string; kind: string; at: number[]; sources: string[]; detail: { en: string; zh: string }; casualties?: unknown; sides?: unknown };
const events: Event[] = json('events');
const eventById = new Map(events.map((e) => [e.id, e]));
const chapters = readdirSync(join(topicDir, 'chapters')).filter((f) => f.endsWith('.mdx')).sort().map((f) => {
  const text = readFileSync(join(topicDir, 'chapters', f), 'utf8');
  return { text, ...parse(/^---\n([\s\S]*?)\n---/.exec(text)![1]!) };
});
const layer = (name: string) => decodeDatedLayer(JSON.parse(readFileSync(join(root, 'public/geo', name + '.json'), 'utf8')), name)!;

describe('industrial-revolution documentary content', () => {
  it('remains a draft with eight readers, 37 beats, seven axis segments and 33 formal ticks', () => {
    expect(topic.status).toBe('draft');
    expect(topic.engine).toBe('time-scene');
    expect(chapters.map((c) => c.state.beats.length)).toEqual([4, 5, 5, 5, 5, 5, 4, 4]);
    expect(chapters.filter((c) => c.kind === 'background')).toHaveLength(1);
    expect(chapters.slice(1)).toHaveLength(7);
    expect(chapters.flatMap((c) => c.state.beats)).toHaveLength(37);
    expect(chapters.slice(1).flatMap((c) => c.state.beats)).toHaveLength(33);
    expect(chapters.map((c) => toNumber(c.state.time))).toEqual([1760, 1765, 1790, 1830, 1865, 1872, 1900, 1914]);
    expect(json('entities')).toEqual([]);
    expect(json('movements')).toEqual([]);
    const frames = json('control').keyframes;
    expect(frames.map((f: { t: string }) => f.t)).toEqual(['1760', '1914']);
    expect(frames.flatMap((f: { features: { features: unknown[] } }) => f.features.features)).toEqual([]);
  });

  it('makes every milestone and highlighted city reachable through an event-only chapter index', () => {
    expect(events).toHaveLength(58);
    expect(events.filter((e) => e.kind === 'site')).toHaveLength(27);
    expect(events.filter((e) => e.kind === 'milestone')).toHaveLength(31);
    expect(eventById.size).toBe(58);
    const allIndexes = new Set<string>();
    for (const c of chapters) {
      const ids: string[] = c.state.index;
      expect(new Set(ids).size, c.id).toBe(ids.length);
      for (const id of ids) {
        expect(eventById.has(id), `${c.id}: ${id}`).toBe(true);
        allIndexes.add(id);
      }
      for (const id of [...c.state.highlight, ...c.state.beats.flatMap((b: { highlight: string[] }) => b.highlight)]) {
        expect(ids, `${c.id}: ${id}`).toContain(id);
      }
      for (const b of c.state.beats) {
        expect(b.layers).not.toContain('control');
        expect(b.layers).not.toContain('borders');
        expect(b.layers).not.toContain('movements');
        expect(b.highlight.length).toBeLessThanOrEqual(3);
        expect(b.caption.en).toMatch(/^\d{4}:/);
        expect(b.caption.zh).toMatch(/^\d{4} 年：/);
      }
    }
    expect(allIndexes.size).toBe(58);
    for (const e of events.filter((e) => e.kind === 'milestone')) expect(allIndexes.has(e.id), e.id).toBe(true);
    const recap: string[] = chapters[7].state.index;
    for (const e of events.filter((e) => e.kind === 'milestone')) expect(recap).toContain(e.id);
  });

  it('retains day and month precision, the national census denominator, and annual wharf counts', () => {
    expect(eventById.get('ev-cable-completion')!.t).toBe('1870-12-31');
    expect(eventById.get('ev-cable-advertised')!.t).toBe('1871-01-06');
    expect(eventById.get('ev-pawtucket-machinery')!.t).toBe('1790-12');
    expect(eventById.get('ev-watt-patent')!.t).toBe('1769-01-05');
    const census = eventById.get('ev-us-census-enslavement')!;
    expect(census.t).toBe('1860');
    expect(census.sources).toContain('S70');
    expect(census.detail.en).toContain('3,953,760');
    expect(census.detail.zh).toContain('3,953,760');
    expect(census.detail.en).toContain('nationally');
    expect(census.detail.en).toContain('neither a death toll');
    const censusBeat = chapters[2].state.beats[4];
    expect(censusBeat.t).toBe('1860');
    expect(censusBeat.caption.en).toContain('nationally');
    expect(censusBeat.caption.zh).toContain('全国约四百万');
    const harbour = eventById.get('ev-new-harbour-record')!;
    for (const n of ['99', '65', '541', '91']) {
      expect(harbour.detail.en).toContain(n);
      expect(harbour.detail.zh).toContain(n);
    }
    expect(harbour.sources).toContain('S28');
    expect(chapters[4].state.beats[2].caption.en).toContain('annual wharf records: 99 steamers and 65 sailing vessels');
    for (const e of events) {
      expect(e.casualties).toBeUndefined();
      expect(e.sides).toBeUndefined();
    }
  });

  it('defines the 15 terms and wraps each once per language; no missing sibling links', () => {
    const terms = json('glossary').terms;
    expect(terms).toHaveLength(15);
    for (const term of terms) for (const lang of ['en', 'zh']) {
      const bodies = chapters.map((c) => new RegExp(`<Lang ${lang}>([\\s\\S]*?)</Lang>`, 'g').exec(c.text)?.[1] ?? '').join('\n');
      expect(bodies.match(new RegExp(`<Term id="${term.id}"`, 'g')) ?? [], `${lang}: ${term.id}`).toHaveLength(1);
    }
    expect(chapters.map((c) => c.text).join('\n')).not.toContain('<TopicLink slug="steam-engine"');
    expect(json('presets').presets).toHaveLength(14);
    expect(new Set(json('sources').sources.map((s: { id: string }) => s.id)).size).toBe(54);
  });
});

describe('industrial-revolution real geographic data', () => {
  it('retains one RShapes feature per lid and every expected construction-date count', () => {
    const fc = layer('industrial-rail-rshapes');
    expect(fc.features).toHaveLength(18804);
    const ids = new Set();
    for (const feature of fc.features) {
      const p = feature.properties!;
      expect(p.id).toBe(`rail-seg-${p.lid}`);
      expect(p.f).toBe(p.year);
      expect(p.src).toEqual(['G4']);
      expect(p.licence).toBe('CC-BY-NC-SA-4.0');
      expect(feature.geometry.type).toBe('MultiLineString');
      ids.add(p.lid);
    }
    expect(ids.size).toBe(18804);
    const indexed = indexDatedLayer(fc);
    for (const [year, count] of [[1830, 0], [1834, 35], [1840, 428], [1850, 1925], [1869, 7355], [1871, 8339], [1890, 15577], [1914, 18804]]) {
      expect(datedLayerState(indexed, year!).visible, String(year)).toBe(count);
    }
    expect(topic.datedLayers.every((l: { count: boolean }) => l.count === false)).toBe(true);
  });

  it('keeps 622 GB geological features in valid WGS84 with closed rings and display-only dates', () => {
    const fc = layer('industrial-coal-strata');
    expect(fc.features).toHaveLength(622);
    const ids = new Set();
    const allPolygons: Position[][][] = [];
    for (const feature of fc.features) {
      expect(feature.properties!.f).toBe(1760);
      expect(feature.properties!.reference).toBe('modern-geology');
      expect(feature.properties!.surveyYear).toBe(2004);
      expect(feature.properties!.src).toEqual(['G5']);
      ids.add(feature.properties!.id);
      if (feature.geometry.type !== 'MultiPolygon' && feature.geometry.type !== 'Polygon') throw new Error('Coal must remain area geometry');
      const polygons = feature.geometry.type === 'Polygon' ? [feature.geometry.coordinates] : feature.geometry.coordinates;
      allPolygons.push(...polygons);
      for (const polygon of polygons) for (const ring of polygon) {
        expect(ring.length).toBeGreaterThanOrEqual(4);
        expect(ring[0]).toEqual(ring.at(-1));
        for (const p of ring) {
          expect(p[0]).toBeGreaterThan(-9);
          expect(p[0]).toBeLessThan(3);
          expect(p[1]).toBeGreaterThan(49);
          expect(p[1]).toBeLessThan(61);
        }
      }
    }
    expect(ids.size).toBe(622);
    expect(allPolygons).toHaveLength(624);
    expect(allPolygons.flat()).toHaveLength(1017);
    expect(ringIssues(allPolygons)).toMatchObject({ zeroArea: 0, selfCrossing: 0 });
  });
});
