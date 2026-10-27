/** Topic-level oracles: counts, timing, sensitive definitions and frozen-data provenance. */
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { createHash } from 'node:crypto';
import sharp from 'sharp';
import { parse } from 'yaml';
import { describe, expect, it } from 'vitest';
import { decodeTopologyObject } from '../src/engines/time-scene/lib/control';
import { toNumber } from '../src/engines/time-scene/lib/time';
import { timeSceneGeoData, timeSceneTopicIssues } from '../src/engines/time-scene/schema';
import { topicSchema } from '../src/content/schema/topic';
import { catalogueFile } from '../src/engines/time-scene/catalogueSchema';

const root = join(import.meta.dirname, '..');
const dir = join(root, 'src/content/topics/plates-and-hazards');
const json = (path: string) => JSON.parse(readFileSync(path, 'utf8'));
const data = (name: string) => json(join(dir, 'data', `${name}.json`));
const geo = (name: string) => json(join(root, 'public/geo', `${name}.json`));
const topic = topicSchema.parse(parse(readFileSync(join(dir, 'topic.yaml'), 'utf8')));
const chapterText = readdirSync(join(dir, 'chapters')).filter((f) => f.endsWith('.mdx')).sort().map((f) => readFileSync(join(dir, 'chapters', f), 'utf8'));
const chapters = chapterText.map((text) => parse(/^---\n([\s\S]*?)\n---/.exec(text)![1]!));
const engine = timeSceneGeoData.parse(Object.fromEntries(['entities', 'movements', 'events', 'control', 'presets', 'sources', 'glossary'].map((name) => [name, data(name)])));
const counts: Record<string, number> = { 'ph-plate-divergent':2349, 'ph-plate-transform':1604, 'ph-plate-subduction':1129, 'ph-plate-convergent':742, 'ph-orogens':13, 'ph-volcano-catalogue':1214, 'ph-quake-sample':3729, 'ph-observations-1883':99, 'ph-observations-2004':2155, 'ph-observations-2018':410 };
const features = (name: string) => decodeTopologyObject(geo(name), name).features;

describe('plates-and-hazards authoring contract', () => {
  it('stays draft with no synthetic participants, routes or territories', () => {
    expect(topic.status).toBe('draft'); expect(topic.datePrecision).toBe('day');
    expect(topic.basemap).toEqual({ maxZoom:8 });
    expect(engine.entities).toEqual([]); expect(engine.movements).toEqual([]);
    expect(engine.control.keyframes).toHaveLength(7);
    for (const frame of engine.control.keyframes) expect('features' in frame && frame.features.features).toEqual([]);
    expect(engine.events.filter((e) => e.kind === 'disaster')).toHaveLength(5);
    expect(engine.events.filter((e) => e.kind === 'site')).toHaveLength(4);
  });
  it('contains exactly the eight specified chapters and38 explicit dated bilingual beats', () => {
    expect(chapters.map((c) => c.id)).toEqual(['background','tambora-1815','krakatau-1883','mapping-plates','indian-ocean-2004','anak-krakatau-2018','felt-in-singapore','comparing-evidence']);
    expect(chapters.map((c) => c.state.beats.length)).toEqual([4,5,5,5,5,4,5,5]);
    expect(chapters[0].kind).toBe('background');
    for (const c of chapters) for (const beat of c.state.beats) {
      expect(Number.isFinite(toNumber(beat.t))).toBe(true);
      expect(beat.camera.center).toHaveLength(2);
      expect(beat.layers).not.toContain('borders'); expect(Array.isArray(beat.highlight)).toBe(true);
      expect(beat.caption.en.trim().split(/\s+/).length).toBeLessThanOrEqual(45);
      expect(beat.caption.zh.trim().length).toBeGreaterThan(0);
      for (const id of beat.highlight) {
        const event = engine.events.find((e) => e.id === id);
        expect(event, id).toBeDefined();
        if (event?.kind !== 'site') expect(toNumber(event!.t)).toBeLessThanOrEqual(toNumber(beat.t));
        if (event?.kind === 'site') expect(beat.layers).toContain('sites');
      }
    }
  });
  it('keeps each body within the agreed length and paragraph bands with2–4 More blocks per locale', () => {
    for (const [i, text] of chapterText.entries()) for (const locale of ['en','zh']) {
      const body = new RegExp(`<Lang ${locale}>([\\s\\S]*?)</Lang>`).exec(text)![1]!;
      const more = [...body.matchAll(/<More\b/g)].length;
      expect(more, `${i}/${locale} More`).toBeGreaterThanOrEqual(2); expect(more).toBeLessThanOrEqual(4);
      const main = body.split('<More')[0]!.replace(/<Figure\b[^>]*\/>/g,'').replace(/<[^>]*>/g,'').trim();
      const paragraphs = main.split(/\n\s*\n/).filter((p) => p.trim());
      expect(paragraphs.length, `${i}/${locale} paragraphs`).toBeGreaterThanOrEqual(3); expect(paragraphs.length).toBeLessThanOrEqual(5);
      const length = locale === 'en' ? main.split(/\s+/).length : (main.match(/[\u3400-\u9fff]/g) ?? []).length;
      expect(length, `${i}/${locale} length`).toBeGreaterThanOrEqual(locale==='en'?200:350);
      expect(length, `${i}/${locale} length`).toBeLessThanOrEqual(locale==='en'?300:500);
    }
  });
  it('uses every glossary term once per language and makes every see reference valid', () => {
    expect(engine.glossary!.terms).toHaveLength(15);
    const known = new Set(engine.glossary!.terms.map((t) => t.id));
    for (const term of engine.glossary!.terms) {
      for (const see of term.see ?? []) expect(known.has(see)).toBe(true);
      for (const locale of ['en','zh']) {
        const bodies = chapterText.map((text) => new RegExp(`<Lang ${locale}>([\\s\\S]*?)</Lang>`).exec(text)?.[1] ?? '').join('\n');
        expect([...bodies.matchAll(new RegExp(`<Term id="${term.id}"`, 'g'))], `${term.id}/${locale}`).toHaveLength(1);
      }
    }
  });
  it('preserves the impact definitions, qualifiers, date precision and incomplete four-country table', () => {
    const tambora = engine.events.find((e) => e.id==='event-tambora-1815')!.impacts!;
    expect(tambora.map((r) => [r.estimate.kind,r.estimate.value,r.sourceDateKind,r.sourceAsOf])).toEqual([['more-than',70000,'publication','2011-09-29'],['reported',92000,'accessed','2026-10-27']]);
    const krak = engine.events.find((e) => e.id==='event-krakatau-1883')!.impacts![0]!;
    expect(krak.estimate).toEqual({kind:'about',value:36000});
    const total = engine.events.find((e) => e.id==='event-sumatra-2004')!.impacts![0]!;
    expect(total).toMatchObject({measure:'dead-or-missing-presumed-dead',estimate:{kind:'reported',value:227899},sourceAsOf:'2024-10',sourceDateKind:'publication',componentsComplete:false});
    expect(total.scope.zh).toContain('15 个国家'); expect(total.scope.zh).toContain('这里只列四个国家，并非完整分项。');
    expect(total.components!.map((c) => c.value)).toEqual([167540,35322,16269,8212]);
    expect(total.components!.reduce((sum,c) => sum+c.value,0)).toBe(227343);
    expect(227899-total.components!.reduce((sum,c) => sum+c.value,0)).toBe(556);
    const studentText = chapterText.join('\n')+JSON.stringify(engine.events);
    expect(studentText).not.toMatch(/227[ ,]?343|\b556\b/);
    expect(engine.events.every((e) => e.casualties===undefined)).toBe(true);
  });
});

describe('plates-and-hazards frozen map output', () => {
  it('retains all records, one-to-one catalogues, valid sources and original licence separation', () => {
    expect(timeSceneTopicIssues(topic, engine, geo)).toEqual([]);
    expect(topic.datedLayers).toHaveLength(10);
    for (const layer of topic.datedLayers!) {
      expect(features(layer.file), layer.id).toHaveLength(counts[layer.id]!);
      expect(catalogueFile.parse(geo(layer.catalogue!.file)).entries).toHaveLength(counts[layer.id]!);
      if (layer.temporal?.mode==='reference') for(const f of features(layer.file)) { expect(f.properties?.f).toBeUndefined(); expect(f.properties?.u).toBeUndefined(); }
      expect(layer.recent).toBe(false);
    }
  });
  it('keeps all original PB sequence parts and no dateline long chords', () => {
    const pb = Object.keys(counts).filter((id) => id.startsWith('ph-plate-')).flatMap(features);
    expect(pb).toHaveLength(5824);
    const sequences = pb.map((f) => /^ph-step-(\d+)-\d+$/.exec(String(f.properties?.id))?.[1]);
    expect(new Set(sequences).size).toBe(5819);
    for(const f of pb) {
      expect(f.geometry.type).toBe('LineString');
      if(f.geometry.type==='LineString') for(let i=1;i<f.geometry.coordinates.length;i++) expect(Math.abs(f.geometry.coordinates[i]![0]!-f.geometry.coordinates[i-1]![0]!)).toBeLessThanOrEqual(180);
    }
  });
  it('derives earthquake visibility from UTC event day and retains numerical magnitude type/depth/update metadata', () => {
    const rows = catalogueFile.parse(geo('ph-catalogue-quake-sample')).entries;
    const byId = new Map(rows.map((r)=>[r.id,r]));
    for(const f of features('ph-quake-sample')) {
      const record = byId.get(f.properties!.id)!;
      const values = Object.fromEntries(record.rows.map((r)=>[r.key,r.value]));
      const epoch = values.epoch as number;
      expect(Number.isFinite(epoch)).toBe(true);
      const day = new Date(epoch).toISOString().slice(0,10);
      expect(day>='2000-01-01' && day<'2025-01-01').toBe(true);
      expect(f.properties!.f).toBe(toNumber(day));
      expect(f.properties!.mag).toBeGreaterThanOrEqual(6);
      expect(record.summary.en).toMatch(/reviewed M[0-9.]+ \([a-zA-Z]+\)/); expect(values.depth).not.toBeUndefined(); expect(values.updated).not.toBeUndefined();
    }
  });
  it('never ships observation heights or arrival values and reveals each whole group on its source day', () => {
    for(const [year,day] of [[1883,'1883-08-27'],[2004,'2004-12-26'],[2018,'2018-12-22']] as const) {
      const name=`ph-observations-${year}`;
      for(const f of features(name)) expect(f.properties!.f).toBe(toNumber(day));
      const cat=catalogueFile.parse(geo(`ph-catalogue-observations-${year}`));
      const keys=new Set(['ncei-id','source-event','measurement-type','doubtful','position','version']);
      for(const e of cat.entries) for(const row of e.rows) expect(keys.has(row.key)).toBe(true);
      expect(JSON.stringify(cat)).not.toMatch(/runupHt|arrDay|arrHour|travHours|maxWaveArr|height.*value/i);
    }
  });
  it('keeps geometry and lazy catalogue sizes within stated budgets', () => {
    let geometry=0,catalogues=0;
    for(const layer of topic.datedLayers!) {
      geometry+=statSync(join(root,'public/geo',`${layer.file}.json`)).size;
      const bytes=statSync(join(root,'public/geo',`${layer.catalogue!.file}.json`)).size;
      expect(bytes).toBeLessThanOrEqual(2_000_000); catalogues+=bytes;
    }
    expect(geometry).toBeLessThanOrEqual(2_000_000); expect(catalogues).toBeLessThanOrEqual(5_000_000);
    const pb=topic.datedLayers!.filter((l)=>l.id.startsWith('ph-plate-')).reduce((s,l)=>s+statSync(join(root,'public/geo',`${l.file}.json`)).size,0);
    expect(pb).toBeLessThanOrEqual(600_000);
  });
});


describe('plates-and-hazards audit artefacts', () => {
  it('matches all frozen-conversion output hashes and records missing-coordinate rows', () => {
    const audit=json(join(dir,'provenance/provenance.json'));
    expect(audit.inputs).toHaveLength(26);
    expect(audit.outputs).toHaveLength(21);
    for(const record of audit.outputs) {
      const bytes=readFileSync(join(root,record.file));
      expect(bytes.length,record.file).toBe(record.bytes);
      expect(createHash('sha256').update(bytes).digest('hex'),record.file).toBe(record.sha256);
      expect(record.licence).not.toMatch(/BY-SA|ODbL/);
    }
    const report=json(join(dir,'provenance/conversion-report.json'));
    expect(report.inputHashChecks).toEqual({checked:26,mismatches:0});
    expect(report.observations.map((row: { raw:number;mappable:number })=>[row.raw,row.mappable])).toEqual([[102,99],[2177,2155],[410,410]]);
    expect(report.pb.residuals.global.maxM).toBeLessThanOrEqual(10000);
    expect(report.pb.residuals.southeastAsia.maxM).toBeLessThanOrEqual(2000);
  });
  it('keeps every exported illustration transparent and exactly neutral in decoded RGB', async () => {
    const audit=json(join(dir,'provenance/illustrations.json'));
    expect(audit.reports).toHaveLength(4);
    for(const record of audit.reports) {
      const bytes=readFileSync(join(root,record.file));
      expect(createHash('sha256').update(bytes).digest('hex')).toBe(record.sha256);
      const {data,info}=await sharp(bytes).toColourspace('srgb').ensureAlpha().raw().toBuffer({resolveWithObject:true});
      expect(info.channels).toBe(4);
      let transparent=0,coloured=0;
      for(let i=0;i<data.length;i+=4) {
        if(data[i+3]===0) transparent++;
        if(data[i+3] && (data[i]!==data[i+1] || data[i+1]!==data[i+2])) coloured++;
      }
      expect(transparent).toBeGreaterThan(0); expect(coloured).toBe(0);
      expect([info.width,info.height]).toEqual([record.width,record.height]);
    }
  });
});
