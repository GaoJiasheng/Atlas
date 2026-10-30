/** Content contracts from docs/59: geographic anchors are not reconstructed tracks. */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import type { FeatureCollection, Point } from 'geojson';
import { parse } from 'yaml';
import { describe, expect, it } from 'vitest';
import { chapterSchema } from '../src/content/schema/chapter';
import { controlFile, eventsFile } from '../src/engines/time-scene/schema';
import { decodeControl, decodeTopologyObject } from '../src/engines/time-scene/lib/control';
import { ringIssues } from '../scripts/geo/lib/rings';

const ROOT = join(import.meta.dirname, '..');
const TOPIC = join(ROOT, 'src/content/topics/zheng-he');
const json = (file: string) => JSON.parse(readFileSync(join(TOPIC, 'data', file), 'utf8'));
type Camera = { center: [number, number]; zoom: number };
type State = { time: string; camera: Camera; layers: string[]; highlight: string[]; beats: Beat[]; note?: { en: string; zh: string } };
type Beat = { t: string; camera: Camera; layers: string[]; highlight: string[]; caption: { en: string; zh: string } };
const chapters = readdirSync(join(TOPIC, 'chapters')).filter((name) => name.endsWith('.mdx')).sort().map((name) => {
  const text = readFileSync(join(TOPIC, 'chapters', name), 'utf8');
  const match = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/.exec(text)!;
  const front = chapterSchema.parse(parse(match[1]!));
  return { ...front, state: front.state as unknown as State, body: match[2]!, name };
});
const events = eventsFile.parse(json('events.json'));
const eventById = new Map(events.map((event) => [event.id, event]));
const ports = JSON.parse(readFileSync(join(ROOT, 'scripts/geo/zheng-he/evidence/ports.geojson'), 'utf8')) as FeatureCollection<Point, { id: string; source: string; role: string }>;
const portById = new Map(ports.features.map((port) => [port.properties.id.replace(/^place-/, ''), port]));
const control = controlFile.parse(json('control.json'));
const topic = parse(readFileSync(join(TOPIC, 'topic.yaml'), 'utf8'));
const localeBody = (body: string, locale: string) => new RegExp(`<Lang ${locale}>([\\s\\S]*?)<\\/Lang>`).exec(body)![1]!;

/** Broad visibility check only; label collisions and the reader panel need browser QA. */
function inViewport(at: readonly number[], camera: Camera): boolean {
  const scale = 512 * 2 ** camera.zoom;
  const mercatorY = (latitude: number) => (1 - Math.log(Math.tan(Math.PI / 4 + latitude * Math.PI / 360)) / Math.PI) / 2;
  const dx = Math.abs(at[0]! - camera.center[0]) / 360 * scale;
  const dy = Math.abs(mercatorY(at[1]!) - mercatorY(camera.center[1])) * scale;
  return dx <= 1920 / 2 && dy <= 1080 / 2;
}

// Independent anchor assignment from docs/59 §2 (not nearest-point guessing).
const DATED_ANCHORS: Record<string, string> = {
  'evt-first-voyage': 'nanjing',
  'evt-old-port-1407': 'palembang',
  'evt-java-report-1407': 'java-region',
  'evt-second-voyage': 'calicut',
  'evt-third-voyage': 'nanjing',
  'evt-captives-1411': 'nanjing',
  'evt-fourth-voyage': 'nanjing',
  'evt-giraffe-gift-1414': 'nanjing',
  'evt-samudera-1415': 'samudera-region',
  'evt-fifth-voyage': 'nanjing',
  'evt-sixth-voyage': 'nanjing',
  'evt-seventh-voyage': 'nanjing',
  'evt-final-return': 'nanjing',
};

describe('zheng-he history topic', () => {
  it('uses the existing year-based TimeScene with eight bilingual chapters and forty manual beats', () => {
    expect(topic).toMatchObject({ status: 'published', engine: 'time-scene', stage: 'geo', datePrecision: 'year' });
    expect(topic.basemap.region).toEqual({ bounds: [35, -15, 125, 37], land: 'zheng-he-land' });
    expect(chapters).toHaveLength(8);
    expect(chapters.filter((chapter) => chapter.kind === 'background').map((chapter) => chapter.order)).toEqual([0]);
    expect(new Set(chapters.map((chapter) => chapter.id)).size).toBe(8);
    expect(chapters.flatMap((chapter) => chapter.state.beats)).toHaveLength(40);
    let previousStart = 1405;
    for (const chapter of chapters) {
      expect(chapter.quiz, chapter.name).toEqual([]);
      expect(chapter.state.beats, chapter.name).toHaveLength(5);
      const times = chapter.state.beats.map((beat) => Number(beat.t));
      expect(times[0]!, chapter.name).toBeGreaterThanOrEqual(previousStart);
      previousStart = times[0]!;
      expect(times, chapter.name).toEqual([...times].sort((a, b) => a - b));
      for (const beat of chapter.state.beats) {
        expect(beat.t).toMatch(/^14\d{2}$/);
        expect(Number(beat.t)).toBeGreaterThanOrEqual(1405);
        expect(Number(beat.t)).toBeLessThanOrEqual(1433);
        expect(beat.caption.en.trim()).not.toBe('');
        expect(beat.caption.zh.trim()).not.toBe('');
        expect(beat.caption.en.split(/\s+/).length, chapter.name).toBeLessThanOrEqual(45);
      }
      for (const locale of ['en', 'zh']) {
        const body = localeBody(chapter.body, locale);
        // The chapter index shares the disclosure budget with the authored More blocks.
        expect((body.match(/<More\b/g) ?? []).length).toBeGreaterThanOrEqual(2);
        expect((body.match(/<More\b/g) ?? []).length).toBeLessThanOrEqual(4);
        expect(body).not.toMatch(/<Quiz\b|<TryIt\b/);
      }
    }
  });

  it('resolves every chapter and beat highlight to a point inside its broad camera view', () => {
    for (const chapter of chapters) {
      for (const state of [chapter.state, ...chapter.state.beats]) {
        expect(state.layers).toEqual(['base', 'sites', 'battles']);
        for (const id of state.highlight) {
          const event = eventById.get(id);
          expect(event, `${chapter.id}: ${id}`).toBeDefined();
          expect(inViewport(event!.at!, state.camera), `${chapter.id}: ${id} outside camera`).toBe(true);
        }
      }
    }
  });

  it('preserves all seventeen sourced geographic anchors for thirty event points', () => {
    expect(ports.features).toHaveLength(17);
    expect(portById.size).toBe(17);
    expect(events).toHaveLength(30);
    expect(events.filter((event) => event.kind === 'site')).toHaveLength(17);
    expect(events.filter((event) => event.kind !== 'site')).toHaveLength(13);
    expect(new Set(events.map((event) => event.id)).size).toBe(30);
    for (const event of events) {
      const anchor = event.kind === 'site' ? event.id.replace(/^site-/, '') : DATED_ANCHORS[event.id];
      expect(anchor, event.id).toBeDefined();
      const port = portById.get(anchor!);
      expect(port, event.id).toBeDefined();
      expect(event.at, event.id).toEqual(port!.geometry.coordinates);
      expect(port!.properties.source).toMatch(/^D0[234]$/);
      expect(port!.properties.role).not.toBe('');
      expect((event.sources ?? []).length, event.id).toBeGreaterThan(0);
      if (event.kind === 'site') expect(event.t).toBe('1405');
    }
    expect(eventById.get('site-hormuz')!.at).toEqual([56.4529, 27.095]);
    expect(eventById.get('site-hormuz')!.at).not.toEqual([56.272135, 27.20406]);
    expect(events.filter((event) => event.kind !== 'site').map((event) => event.id).sort()).toEqual(Object.keys(DATED_ANCHORS).sort());
  });

  it('separates nine Nanjing records with screen offsets while keeping the sourced city point', () => {
    const records = events.filter((event) => event.displayOffset !== undefined);
    expect(records.map((event) => event.id).sort()).toEqual(Object.entries(DATED_ANCHORS)
      .filter(([, anchor]) => anchor === 'nanjing').map(([id]) => id).sort());
    expect(records).toHaveLength(9);
    const offsets = [[0, 0], ...records.map((event) => event.displayOffset!)];
    for (const event of records) {
      expect(event.at).toEqual(eventById.get('site-nanjing')!.at);
      expect(Math.hypot(...event.displayOffset!)).toBeCloseTo(96, 0);
    }
    // Every 44 px target is disjoint, including the stationary city diamond.
    for (let i = 0; i < offsets.length; i++) for (let j = i + 1; j < offsets.length; j++) {
      expect(Math.max(Math.abs(offsets[i]![0]! - offsets[j]![0]!), Math.abs(offsets[i]![1]! - offsets[j]![1]!))).toBeGreaterThan(44);
    }
    expect(eventById.get('site-nanjing')!.displayOffset).toBeUndefined();
    expect(chapters[0]!.state.note!.en).toContain('not separate historical sites');
    expect(chapters[0]!.state.note!.zh).toContain('不表示不同的历史地点');
  });

  it('makes every authored index row select its named object and retains its framing preset', () => {
    const presets = new Set(json('presets.json').presets.map((preset: { id: string }) => preset.id));
    for (const chapter of chapters) for (const locale of ['en', 'zh']) {
      const body = localeBody(chapter.body, locale);
      const rows = [...body.matchAll(/^\| <FlyTo preset="([^"]+)" event="([^"]+)">([^<]+)<\/FlyTo>/gm)];
      const tableRows = [...body.matchAll(/^\| <FlyTo /gm)];
      expect(rows.length, `${chapter.id}/${locale}`).toBe(tableRows.length);
      const ids = new Set(rows.map((row) => row[2]));
      for (const id of new Set([...(chapter.state.highlight ?? []), ...chapter.state.beats.flatMap((beat) => beat.highlight)])) {
        expect(ids.has(id), `${chapter.id}/${locale}: ${id}`).toBe(true);
      }
      for (const [, preset, id, label] of rows) {
        expect(presets.has(preset!)).toBe(true);
        expect(eventById.has(id!), label).toBe(true);
      }
    }
  });

  it('identifies Wade consistently in Chinese and locates the second expedition at its sourced destination', () => {
    const chinese = chapters.map((chapter) => localeBody(chapter.body, 'zh')).join('\n');
    expect(chinese).toContain('学者韦德（Geoff Wade）');
    expect(chinese).not.toMatch(/学者 Geoff Wade|史家 Geoff Wade|(?<!Geoff )Wade/);
    const second = eventById.get('evt-second-voyage')!;
    expect(second.at).toEqual(portById.get('calicut')!.geometry.coordinates);
    expect(second.sources).toContain('S1');
    expect(second.detail!.en).toContain("new king's inauguration");
    expect(second.detail!.en).toContain('did not lead it in person');
    expect(second.detail!.zh).toContain('新王即位典礼');
    expect(second.detail!.zh).toContain('没有亲自率队');
  });

  it('retains empty political control at every keyframe and supplies no inferred voyages', () => {
    expect(json('movements.json')).toEqual([]);
    expect(decodeControl(control).map((frame) => frame.t)).toEqual(['1405', '1407', '1409', '1411', '1413', '1415', '1417', '1421', '1433']);
    for (const frame of decodeControl(control)) {
      expect(frame.features).toEqual({ type: 'FeatureCollection', features: [] });
      expect(frame.frontier).toBeUndefined();
    }
    // Positions, vessel dimensions and speeds are not reconstructed from camera changes.
    for (const event of events) for (const key of ['path', 'speed', 'length', 'dimensions']) expect(event).not.toHaveProperty(key);
    expect(chapters[0]!.state.note!.en).toMatch(/not show measured ship tracks/);
    expect(chapters[0]!.state.note!.zh).toContain('不是测得的航迹');
  });

  it('keeps both death reports attributed and does not invent missing zero casualties', () => {
    const oldPort = eventById.get('evt-old-port-1407')!;
    const java = eventById.get('evt-java-report-1407')!;
    expect(oldPort.casualties).toEqual({ 'actor-old-port-force': 5000 });
    expect(java.casualties).toEqual({ 'actor-ming-fleet': 170 });
    expect(oldPort.kind).toBe('battle');
    expect(java.kind).toBe('political');
    expect(java.sides).toBeUndefined();
    for (const event of [oldPort, java]) {
      expect(event.sources).toContain('S2');
      expect(event.sensitive).toBe(true);
      expect(event.summary.en).toMatch(/Ming records/);
      expect(event.summary.en).toMatch(/report/i);
      expect(event.summary.en).toContain('killed');
      expect(event.summary.zh).toContain('明方记录');
      expect(event.summary.zh).toContain('报告');
      expect(event.summary.zh).toContain('被杀');
    }
    expect(oldPort.summary.en).toContain('not an independently verified count');
    expect(oldPort.detail!.en).toContain('does not establish a civilian/combatant breakdown');
    expect(java.summary.en).toContain('No total for local deaths');
    const counted = events.filter((event) => event.casualties !== undefined);
    expect(counted.map((event) => event.id).sort()).toEqual(['evt-java-report-1407', 'evt-old-port-1407']);
    for (const event of counted) for (const count of Object.values(event.casualties!)) expect(count).toBeGreaterThan(0);
    const beats = chapters[2]!.state.beats;
    expect(beats[2]!.caption.en.replaceAll(',', '')).toContain('5000');
    expect(beats[2]!.caption.zh.replaceAll(',', '')).toContain('5000');
    expect(beats[2]!.caption.en).toMatch(/not independently verified/);
    expect(beats[3]!.caption.en).toContain('170');
    expect(beats[3]!.caption.zh).toContain('170');
    expect(beats[3]!.caption.en).toContain('Ming records');
  });

  it('preserves evidence limits for context ports, regional anchors and the stele', () => {
    expect(eventById.get('site-kilwa')!.summary.en).toMatch(/does not claim a confirmed fleet stop/);
    expect(eventById.get('site-temasek-region')!.summary.en).toMatch(/not proof of Zheng He landing/);
    expect(eventById.get('site-galle')!.summary.en).toMatch(/findspot.*1409/);
    expect(eventById.get('site-galle')!.summary.en).toMatch(/not.*battle site/);
    expect(eventById.get('site-bengal-region')!.summary.en).toMatch(/not.*where the animal boarded/);
    expect(eventById.get('evt-java-report-1407')!.detail!.en).toContain('conflict site has not been established');
    expect(eventById.get('evt-samudera-1415')!.detail!.en).toContain('not a located palace');
    expect(eventById.get('evt-final-return')!.summary.en).toContain('did not end maritime trade');
    expect(chapters[3]!.state.beats[2]!.caption.en).toMatch(/dated 1409.*findspot/);
    expect(chapters[5]!.state.beats[3]!.caption.en).toMatch(/not a confirmed fleet stop/);
  });

  it('defines fifteen terms and links each exactly once in each language', () => {
    const terms: { id: string }[] = json('glossary.json').terms;
    expect(terms).toHaveLength(15);
    expect(new Set(terms.map((term) => term.id)).size).toBe(15);
    for (const locale of ['en', 'zh']) {
      const bodies = chapters.map((chapter) => localeBody(chapter.body, locale)).join('\n');
      const ids = [...bodies.matchAll(/<Term\s+id="([^"]+)"/g)].map((match) => match[1]);
      expect(ids.sort()).toEqual(terms.map((term) => term.id).sort());
    }
  });

  it('decodes a finite, closed, non-crossing regional coastline within the runtime size budget', () => {
    const path = join(ROOT, 'public/geo/zheng-he-land.json');
    expect(statSync(path).size).toBeLessThan(2_000_000);
    // The pipeline pads the visible plate by 0.25° to avoid clipped edge strokes.
    const pipeline = JSON.parse(readFileSync(join(ROOT, 'scripts/geo/zheng-he/sources.json'), 'utf8'));
    const pad: number = pipeline.pipeline.regionLand.padDeg;
    expect(pad).toBe(0.25);
    const topology = JSON.parse(readFileSync(path, 'utf8'));
    expect(Object.keys(topology.objects)).toEqual(['zheng-he-land']);
    const land = decodeTopologyObject(topology, 'zheng-he-land');
    const polygons = land.features.flatMap((feature) => feature.geometry.type === 'Polygon' ? [feature.geometry.coordinates] : feature.geometry.type === 'MultiPolygon' ? feature.geometry.coordinates : []);
    expect(polygons.length).toBeGreaterThan(10);
    expect(ringIssues(polygons)).toMatchObject({ zeroArea: 0, selfCrossing: 0 });
    const issues: string[] = [];
    for (const [polygonIndex, polygon] of polygons.entries()) for (const [ringIndex, ring] of polygon.entries()) {
      const label = `polygon ${polygonIndex}, ring ${ringIndex}`;
      if (ring.length < 4) issues.push(`${label}: fewer than four coordinates`);
      if (JSON.stringify(ring[0]) !== JSON.stringify(ring.at(-1))) issues.push(`${label}: open ring`);
      for (const [lng, lat] of ring) {
        if (!Number.isFinite(lng) || !Number.isFinite(lat)) issues.push(`${label}: non-finite coordinate`);
        if (lng! < 35 - pad - 1e-6 || lng! > 125 + pad + 1e-6 || lat! < -15 - pad - 1e-6 || lat! > 37 + pad + 1e-6) {
          issues.push(`${label}: coordinate outside padded plate`);
        }
      }
    }
    expect(issues).toEqual([]);
  });
});
