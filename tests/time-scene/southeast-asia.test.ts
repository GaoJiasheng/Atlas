/** Shipped geography counts, captions and samples must agree with the pinned real data. */
import { createHash } from 'node:crypto';
import { readFileSync, readdirSync } from 'node:fs';
import { parse } from 'yaml';
import { describe, expect, it } from 'vitest';
import { geographyFile, geographyChapterState } from '../../src/engines/time-scene/geography-schema';
import { memberIds } from '../../src/engines/time-scene/lib/geography';
import { climateResourceSchema, packClimate, sampleClimate, type ClimateLoadState } from '../../src/engines/time-scene/lib/climate';

const root = new URL('../../', import.meta.url);
const read = (path: string) => readFileSync(new URL(path, root), 'utf8');
const json = (path: string) => JSON.parse(read(path));
const dir = 'src/content/topics/southeast-asia/';
const geography = geographyFile.parse(json(`${dir}data/geography.json`));
const chapters = readdirSync(new URL(`${dir}chapters/`, root)).filter(f => f.endsWith('.mdx')).sort().map(file => {
  const body = read(`${dir}chapters/${file}`);
  const front = parse(body.split('---')[1]!);
  return { ...front, state: geographyChapterState.parse(front.state), body };
});
const resource = (kind: 'wind' | 'rain'): ClimateLoadState => ({status:'ready',data:packClimate(climateResourceSchema.parse(json(`public/geo/sample-climate-${kind === 'wind' ? 'wind-850' : 'rain-gpcp'}-1991-2020.json`)))});

describe('southeast-asia: real static geography and readable counts', () => {
  it('publishes eight bilingual chapters with exactly 33 complete authored beats', () => {
    expect(parse(read(`${dir}topic.yaml`))).toMatchObject({status:'published',subject:'geography',temporalMode:'geography'});
    expect(chapters).toHaveLength(8);
    expect(chapters.map(c=>c.order)).toEqual([0,1,2,3,4,5,6,7]);
    expect(chapters.reduce((n,c)=>n+c.state.beats.length,0)).toBe(33);
    for (const c of chapters) {
      expect(c.body).toContain('<Lang en>'); expect(c.body).toContain('<Lang zh>');
      expect(c.state.geoContext).toEqual(c.state.beats[0]!.geoContext);
      expect(c.state.selection).toEqual(c.state.beats[0]!.selection);
      for (const b of c.state.beats) {expect(b.camera).toBeDefined(); expect(b.layers).toBeDefined(); expect(b.highlight).toBeDefined(); expect(b.caption.en).toBeTruthy(); expect(b.caption.zh).toBeTruthy();}
    }
  });
  it('preserves pinned country geometry, all eleven shapes and all river source reaches', () => {
    const provenance=json(`${dir}provenance.json`);
    expect(geography.countries.features).toHaveLength(11);
    expect(createHash('sha256').update(JSON.stringify(geography.countries.features.map(f=>f.geometry))).digest('hex')).toBe(provenance.output.countryGeometrySha256);
    expect(new Set(geography.countries.features.map(f=>f.properties.a3)).size).toBe(11);
    const rivers=geography.layers.find(l=>l.id==='geo-rivers')!.features.features;
    expect(rivers).toHaveLength(5);expect(new Set(rivers.map(f=>f.properties.id)).size).toBe(4);
    expect(rivers.filter(f=>f.properties.id==='river-mekong')).toHaveLength(2);
    expect(geography.layers.find(l=>l.id==='geo-peaks')!.features.features).toHaveLength(4);
    expect(geography.layers.find(l=>l.id==='geo-marine-labels')!.features.features).toHaveLength(4);
  });
  it('keeps cases at country scale, with no invented park or factory coordinates', () => {
    expect(geography.referenceItems).toHaveLength(11);
    for (const r of geography.referenceItems) {expect(r.locationScope).toBe('country');expect(r).not.toHaveProperty('at'); expect(geography.countries.features.some(f=>f.properties.id===r.locationRef)).toBe(true);}
    expect(geography.referenceItems.filter(r=>['case-bukit-timah','case-sungei-buloh'].includes(r.id)).map(r=>r.locationRef)).toEqual(['geo-sgp','geo-sgp']);
  });
  it.each([
    ['1967-08-07',0],['1967-08-08',5],['1984-01-06',5],['1984-01-07',6],['1995-07-27',6],['1995-07-28',7],['1997-07-22',7],['1997-07-23',9],['1999-04-29',9],['1999-04-30',10],['2025-10-25',10],['2025-10-26',11],['2026-10-27',11],
  ])('%s counts countries once and includes the accession day (%i)',(date,count)=>{
    expect(memberIds(geography,date)).toHaveLength(count);
  });
  it('connects the eleven-member claim to the exact Timor-Leste accession source/date',()=>{
    expect(geography.members.find(m=>m.a3==='TLS')).toMatchObject({joined:'2025-10-26',sources:['S5']});
    const last=chapters.find(c=>c.id==='asean')!.state.beats.at(-1)!;
    expect(last.geoContext).toEqual({kind:'membership',date:'2025-10-26'});
    expect(last.caption.en).toMatch(/eleventh|eleven/);
    expect(chapters.find(c=>c.id==='asean')!.body).toContain('s="S5"');
  });
  it.each([
    [1,1.1373713,-4.9311786,3.784817,5.060645794674989],
    [7,0.11203182,3.5973375,3.726351,3.599081579736525],
  ])('month %i reuses the independent NOAA grids without resampling',(month,u,v,rate,speed)=>{
    const s=sampleClimate(105,0,month,resource('wind'),resource('rain'));
    expect(s.wind).toMatchObject({status:'valid',index:132,units:'m/s',pressureHpa:850});
    expect(s.rain).toMatchObject({status:'valid',index:126,units:'mm/day'});
    if('u' in s.wind && 'v' in s.wind && 's' in s.wind){expect(s.wind.u).toBeCloseTo(u,6);expect(s.wind.v).toBeCloseTo(v,6);expect(s.wind.s).toBeCloseTo(speed,8);}
    else throw new Error('missing native wind sample');
    if('rate' in s.rain)expect(s.rain.rate).toBeCloseTo(rate,6);else throw new Error('missing native rain sample');
  });
  it('outside both native coverages stays unavailable rather than becoming a zero',()=>{
    const s=sampleClimate(85,0,1,resource('wind'),resource('rain'));
    expect(s.wind.status).toBe('outside');expect(s.rain.status).toBe('outside');
    expect(s.rain).not.toHaveProperty('rate');
  });
  it('uses terrace and mangrove plates with schematic captions and no roundtable',()=>{
    const body=chapters.map(c=>c.body).join('\n');
    expect(body).toContain('figures/southeast-asia-rice-terraces');expect(body).toContain('figures/southeast-asia-mangrove-roots');
    expect(body).not.toContain('southeast-asia-regional-cooperation');
    for(const stem of ['southeast-asia-rice-terraces','southeast-asia-mangrove-roots'])expect(readFileSync(new URL(`public/illustrations/figures/${stem}.webp`,root)).byteLength).toBeGreaterThan(1000);
  });
});
