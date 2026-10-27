/** docs/60: independent historical, locational and narrative invariants. */
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { parse } from 'yaml';
import { describe, expect, it } from 'vitest';
import { toNumber } from '../src/engines/time-scene/lib/time';
import { ringIssues } from '../scripts/geo/lib/rings';

const ROOT = join(import.meta.dirname, '../src/content/topics/space-race');
const read = (file: string) => readFileSync(join(ROOT, file), 'utf8');
const json = (file: string) => JSON.parse(read(`data/${file}`));
type Bi = { en: string; zh: string };
type Evidence = {
  id: string; t: string; kind: string; at?: [number, number]; title: Bi; summary: Bi; detail?: Bi;
  sources?: string[]; mapVisibility?: string; casualties?: Record<string, number>;
  missionContext?: { setting: string; anchorRole: string; anchorSite: string; relatedSites?: string[]; occurredAt?: string };
};
type Beat = { t: string; layers: string[]; highlight: string[]; caption: Bi; camera: { zoom: number } };
type Chapter = { id: string; order: number; kind?: string; state: { time: string; layers: string[]; highlight: string[]; beats: Beat[] } };
const events: Evidence[] = json('events.json');
const eventById = new Map(events.map((e) => [e.id, e]));
const files = readdirSync(join(ROOT, 'chapters')).filter((f) => f.endsWith('.mdx')).sort();
const texts = files.map((f) => read(`chapters/${f}`));
const chapters: Chapter[] = texts.map((t) => parse(/^---\n([\s\S]*?)\n---/.exec(t)![1]!));
const topic = parse(read('topic.yaml'));
const expectedChapters = ['background', 'beeps-and-probes', 'people-in-orbit', 'rehearsals-and-surveys', 'losses-and-tests', 'eight-days', 'robots-and-stations', 'costs-and-connections'];
const coords: Record<string, [number, number]> = {
  'site-baikonur': [63.30511111111111, 45.96480555555556],
  'site-kennedy': [-80.64861111111112, 28.52472222222222],
  'site-cape': [-80.57777777777777, 28.48888888888889],
};
const prose = (id: string) => texts[chapters.findIndex((c) => c.id === id)]!;
const plain = (s: string) => s.replace(/\{\/\*[\s\S]*?\*\/\}/g, '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
const eventText = (id: string, lang: keyof Bi) => {
  const e = eventById.get(id)!;
  return `${e.title[lang]} ${e.summary[lang]} ${e.detail?.[lang] ?? ''}`;
};

describe('space-race content (docs/60)', () => {
  it('remains a draft enrichment history topic with mission vocabulary and exactly two programmes', () => {
    expect(topic.status).toBe('draft');
    expect(topic.engine).toBe('time-scene');
    expect(topic.subject).toBe('history');
    expect(topic.tags).toContain('beyond-syllabus');
    expect(topic.timePresentation).toEqual({ mode: 'missions', showArea: false, eventsLabel: { en: 'Events', zh: '事件' }, entityLabel: { en: 'Programmes', zh: '项目' } });
    const entities: { joined: string; left?: string; bloc: string; name: Bi }[] = json('entities.json');
    expect(entities).toHaveLength(2);
    expect(new Set(entities.map((e) => e.bloc))).toEqual(new Set(['axis', 'allied']));
    for (const e of entities) { expect(e.joined).toBe('1957-01-01'); expect(e.left).toBeUndefined(); }
    expect(JSON.stringify(topic.blocLabels)).not.toMatch(/轴心|同盟|Axis|Allies|Victory/);
  });

  it('has eight coherent chapter states, forty bilingual captions, and no time travel in the evidence highlights', () => {
    expect(chapters.map((c) => c.id)).toEqual(expectedChapters);
    expect(chapters.map((c) => c.order)).toEqual([0, 1, 2, 3, 4, 5, 6, 7]);
    expect(chapters[0]!.kind).toBe('background');
    expect(chapters.flatMap((c) => c.state.beats)).toHaveLength(40);
    const highlighted = new Set<string>();
    for (const c of chapters) {
      expect(c.state.beats, c.id).toHaveLength(5);
      expect(c.state.time, c.id).toBe(c.state.beats[0]!.t);
      expect(c.state.highlight, c.id).toEqual(c.state.beats[0]!.highlight);
      let previous = -Infinity;
      for (const b of c.state.beats) {
        expect(toNumber(b.t) >= previous, c.id).toBe(true); previous = toNumber(b.t);
        expect(b.layers, c.id).toEqual(['base', 'battles', 'sites', 'labels']);
        expect(b.camera.zoom, c.id).toBeLessThanOrEqual(4.8);
        expect(b.caption.en.trim().length, c.id).toBeGreaterThan(20);
        expect(b.caption.zh.trim().length, c.id).toBeGreaterThan(10);
        expect(b.caption.en.trim().split(/\s+/).length, c.id).toBeLessThanOrEqual(45);
        expect(b.highlight, c.id).toHaveLength(c.id === 'eight-days' && b.t === '1969-07-21' ? 3 : 1);
        for (const id of b.highlight) {
          const e = eventById.get(id);
          expect(e, `${c.id}: ${id}`).toBeDefined();
          expect(e!.t, `${c.id}: ${id}`).toBe(b.t);
          highlighted.add(id);
        }
      }
    }
    expect(highlighted.size).toBe(42);
    const dated = events.filter((e) => e.kind !== 'site');
    expect(events).toHaveLength(45);
    expect(events.filter((e) => e.kind === 'mission')).toHaveLength(25);
    expect(events.filter((e) => e.kind === 'political' && e.mapVisibility === 'timeline-only')).toHaveLength(17);
    expect(dated.map((e) => e.id).sort()).toEqual([...highlighted].sort());
  });

  it('uses only three unshifted D02 launch-centre points and keeps each mission at its real associated centre', () => {
    const sites = events.filter((e) => e.kind === 'site');
    expect(sites.map((s) => s.id).sort()).toEqual(Object.keys(coords).sort());
    for (const s of sites) expect(s.at, s.id).toEqual(coords[s.id]);
    for (const e of events.filter((e) => e.kind === 'mission')) {
      expect(e.missionContext, e.id).toBeDefined();
      const context = e.missionContext!;
      expect(context.anchorRole, e.id).toBe('associated-launch-centre');
      expect(e.at, e.id).toEqual(coords[context.anchorSite]);
      expect(e.mapVisibility, e.id).not.toBe('timeline-only');
      if (context.occurredAt) expect(context.occurredAt.slice(0, 10), e.id).toBe(e.t);
      for (const site of context.relatedSites ?? []) expect(coords[site], e.id).toBeDefined();
    }
    for (const id of ['ev-explorer-orbit', 'ev-gemini-rendezvous', 'ev-gemini-docking', 'ev-apollo-one-fire']) expect(eventById.get(id)!.missionContext!.anchorSite, id).toBe('site-cape');
    for (const id of ['ev-sputnik-orbit', 'ev-laika-flight', 'ev-luna-nine', 'ev-soyuz-one-loss', 'ev-soyuz-eleven-loss']) expect(eventById.get(id)!.missionContext!.anchorSite, id).toBe('site-baikonur');
    expect(eventById.get('ev-eagle-touchdown')!.missionContext!.setting).toBe('moon-surface');
    const dock = eventById.get('ev-apollo-soyuz-dock')!;
    expect(dock.missionContext!.setting).toBe('earth-orbit');
    expect(dock.missionContext!.relatedSites).toContain('site-baikonur');
  });

  it('keeps historical accounts and accident subtotals off the map and draws no invented territory or orbit route', () => {
    expect(json('movements.json')).toEqual([]);
    const frames: { t: string; features: { features: unknown[] } }[] = json('control.json').keyframes;
    expect(frames.map((f) => f.t)).toEqual(['1957-01-01', '1957-10-04', '1961-04-12', '1965-12-15', '1967-01-27', '1969-07-16', '1970-04-17', '1973-01-01']);
    for (const f of frames) expect(f.features.features).toEqual([]);
    // All eight frames are intentionally empty: there is no hidden control polygon to wedge or misrepresent a programme.
    expect(ringIssues(frames.flatMap((f) => f.features.features) as number[][][][])).toEqual({ rings: 0, zeroArea: 0, selfCrossing: 0 });
    for (const e of events.filter((e) => e.mapVisibility === 'timeline-only')) { expect(e.kind, e.id).toBe('political'); expect(e.at, e.id).toBeUndefined(); }
    for (const id of ['ev-n-one-costs', 'ev-apollo-costs', 'ev-costs-human']) expect(eventById.get(id)!.mapVisibility, id).toBe('timeline-only');
    for (const c of chapters) for (const ls of [c.state.layers, ...c.state.beats.map((b) => b.layers)]) {
      for (const forbidden of ['control', 'borders', 'participation', 'movements']) expect(ls).not.toContain(forbidden);
    }
  });

  it('keeps source references resolvable and uses all fifteen glossary terms in both languages', () => {
    const sources: { id: string }[] = json('sources.json').sources;
    const sourceIds = new Set(sources.map((s) => s.id));
    for (const id of sourceIds) expect(id).toMatch(/^S[1-9]\d*$/);
    for (const e of events) { expect(e.sources?.length, e.id).toBeGreaterThan(0); for (const s of e.sources ?? []) expect(sourceIds.has(s), `${e.id}: ${s}`).toBe(true); }
    for (const t of texts) for (const m of t.matchAll(/<Num\b[^>]*\bs="([^"]+)"/g)) for (const id of m[1]!.split(',')) expect(sourceIds.has(id.trim()), id).toBe(true);
    const terms: { id: string; term: Bi; definition: Bi }[] = json('glossary.json').terms;
    expect(terms).toHaveLength(15);
    for (const term of terms) {
      expect(term.id).toMatch(/^term-/);
      expect(term.definition.en.length).toBeGreaterThan(15); expect(term.definition.zh.length).toBeGreaterThan(8);
      expect(texts.join('\n').match(new RegExp(`<Term id="${term.id}">`, 'g')) ?? [], term.id).toHaveLength(2);
    }
  });

  it('distinguishes the three named crew accidents, their phases and their bounded seven-person subtotal', () => {
    const cases = [
      ['ev-apollo-one-fire', '1967-01-27', ['Grissom', 'White', 'Chaffee'], /ground|test/i, /地面|测试/],
      ['ev-soyuz-one-loss', '1967-04-24', ['Komarov'], /parachute/i, /伞/],
      ['ev-soyuz-eleven-loss', '1971-06-30', ['Dobrovolski', 'Volkov', 'Patsayev'], /pressure|depressuri/i, /失压|压力/],
    ] as const;
    for (const [id, date, names, en, zh] of cases) {
      expect(eventById.get(id)!.t).toBe(date);
      for (const name of names) expect(eventText(id, 'en'), id).toContain(name);
      expect(eventText(id, 'en')).toMatch(en); expect(eventText(id, 'zh')).toMatch(zh);
    }
    // The day-level Soviet mission date is not mislabeled as a precise UTC event.
    expect(eventById.get('ev-soyuz-eleven-loss')!.missionContext?.occurredAt).toBeUndefined();
    expect(eventText('ev-costs-human', 'en')).toMatch(/seven|\b7\b/i);
    expect(eventText('ev-costs-human', 'en')).toMatch(/Apollo 1: 3; Soyuz 1: 1; Soyuz 11: 3/);
    expect(eventText('ev-costs-human', 'en')).toMatch(/subtotal|specified|three.*accidents/i);
    expect(eventText('ev-costs-human', 'zh')).toMatch(/小计/);
  });

  it('keeps Explorer local/UTC dates and Apollo landing/first-step days separate, using Singapore’s 1969 offset', () => {
    expect(eventById.get('ev-explorer-orbit')!.t).toBe('1958-02-01');
    expect(eventText('ev-explorer-orbit', 'en')).toMatch(/31 January|January 31/);
    const landing = eventById.get('ev-eagle-touchdown')!;
    const step = eventById.get('ev-armstrong-step')!;
    expect(landing.t).toBe('1969-07-20'); expect(step.t).toBe('1969-07-21');
    expect(eventById.get('ev-moon-step-and-probe')!.mapVisibility).toBe('timeline-only');
    expect(eventById.get('ev-luna-fifteen-crash')!.missionContext!.anchorSite).toBe('site-baikonur');
    expect(landing.missionContext!.occurredAt).toMatch(/^1969-07-20T20:17:/);
    expect(step.missionContext!.occurredAt).toMatch(/^1969-07-21T02:56:/);
    const chapter = prose('eight-days');
    for (const clock of ['20:17', '02:56', '03:47', '10:26']) expect(chapter).toContain(clock);
    expect(chapter).toMatch(/UTC\s*\+\s*0?7:30/);
    const singapore = (utc: string) => new Date(Date.parse(utc) + 450 * 60_000).toISOString();
    expect(singapore(landing.missionContext!.occurredAt!)).toMatch(/^1969-07-21T03:47:/);
    expect(singapore(step.missionContext!.occurredAt!)).toMatch(/^1969-07-21T10:26:/);
  });

  it('preserves the as-flown sample mass and separates surface stay from EVA duration', () => {
    const chapter = plain(prose('eight-days'));
    expect(chapter).toContain('21.55');
    expect(chapter).toMatch(/20\s*kg/); // the coarser rounded figure is explained, not silently substituted
    expect(chapter).toMatch(/coarser|粗略/);
    expect(chapter).toMatch(/21\s+hours\s+36\s+minutes/);
    expect(chapter).toMatch(/EVA|moonwalk|太空行走|舱外活动/i);
    expect(eventText('ev-apollo-eleven-return', 'en')).toMatch(/22\s*kg|22\s*kilograms/i);
  });

  it('gives Apollo and N1-L3 different account scopes and keeps Saturn IB in the cooperation event', () => {
    const chapter = plain(prose('costs-and-connections'));
    for (const n of ['25.4', '25.8', '3.6', '4.0', '4.5']) expect(chapter).toContain(n);
    expect(chapter).toMatch(/1973/); expect(chapter).toMatch(/ruble/i); expect(chapter).toMatch(/dollar|US\$/i);
    expect(chapter).toMatch(/scope|accounting|范围|口径/i);
    expect(eventText('ev-apollo-soyuz-dock', 'en')).toContain('Saturn IB');
    expect(eventById.get('ev-apollo-costs')!.t).toBe('1973');
  });

  it('keeps chapter bodies within the specified reading length and preserves key difficult histories in both languages', () => {
    for (const [i, t] of texts.entries()) {
      for (const lang of ['en', 'zh'] as const) {
        const match = new RegExp(`<Lang ${lang}>([\\s\\S]*?)<\\/Lang>`).exec(t);
        expect(match, files[i]).not.toBeNull();
        const main = plain(match![1]!.split('<More')[0]!);
        const count = lang === 'en' ? main.split(/\s+/).length : (main.match(/[\p{Script=Han}]/gu) ?? []).length;
        expect(count, `${files[i]} ${lang}`).toBeGreaterThanOrEqual(lang === 'en' ? 200 : 350);
        expect(count, `${files[i]} ${lang}`).toBeLessThanOrEqual(lang === 'en' ? 300 : 500);
      }
    }
    expect(prose('background')).toMatch(/forced labour/); expect(prose('background')).toMatch(/强迫劳动/);
    expect(prose('background')).toMatch(/imprison/); expect(prose('background')).toMatch(/监禁|被囚/);
    expect(prose('beeps-and-probes')).toMatch(/Laika[\s\S]{0,80}died/); expect(prose('beeps-and-probes')).toMatch(/死去|死亡|未能生还/);
    expect(prose('robots-and-stations')).toMatch(/Luna 16/); expect(prose('robots-and-stations')).toMatch(/Salyut/);
  });

  it('omits clickable sibling links while the sibling targets are unavailable and avoids winner/war framing', () => {
    const all = texts.join('\n');
    expect(all).not.toMatch(/<TopicLink\b[^>]*slug="(?:saturn-v|sun-earth-moon)"/);
    expect(all).not.toMatch(/href=["'][^"']*\/topics\/(?:saturn-v|sun-earth-moon)/);
    expect(all).not.toMatch(/我们|我国|我军|敌人|敌军|赢得太空竞赛|登月胜利/);
    expect(all).not.toMatch(/\b(?:we won|our victory|won the space race|the enemy)\b/i);
  });
});
