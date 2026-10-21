/**
 * singapore-after-1965 (docs/42): data checks the validator does not make.
 * Copied events, sources and the Confrontation definition stay identical to the
 * topics they come from; places lie in Singapore (two regional cities aside);
 * the text has no "we / enemy", no grade labels and no untranslated markers.
 */
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { parse } from 'yaml';
import { describe, expect, it } from 'vitest';

const TOPICS = join(import.meta.dirname, '../src/content/topics');
const json = (slug: string, file: string) => JSON.parse(readFileSync(join(TOPICS, slug, 'data', file), 'utf8'));
const byId = <T extends { id: string }>(list: T[]) => new Map(list.map((item) => [item.id, item]));

type Event = { id: string; t: string; at: [number, number]; kind: string };
const events: Event[] = json('singapore-after-1965', 'events.json');
const sources: { id: string }[] = json('singapore-after-1965', 'sources.json').sources;
const chaptersDir = join(TOPICS, 'singapore-after-1965/chapters');
const chapterFiles = readdirSync(chaptersDir).filter((f) => f.endsWith('.mdx')).sort();
const chapterText = chapterFiles.map((f) => readFileSync(join(chaptersDir, f), 'utf8'));
const frontmatter = chapterText.map((text) => parse(/^---\n([\s\S]*?)\n---/.exec(text)![1]!));
const dataText = ['events.json', 'glossary.json', 'presets.json'].map((f) => readFileSync(join(TOPICS, 'singapore-after-1965/data', f), 'utf8'));

const COPIED = {
  'singapore-1819-1965': ['separation-1965'],
  'singapore-land-use': ['singapore-naval-base', 'site-seletar-airbase', 'site-tengah-airbase', 'site-sembawang-airbase', 'site-changi-airbase', 'jtc-founded'],
};
const INHERITED_SOURCES = {
  'singapore-1819-1965': ['S160', 'S219', 'S271', 'S320', 'S342'],
  'singapore-land-use': ['S9', 'S61', 'S62', 'S203', 'S216', 'S217', 'S230'],
};
/** Events outside Singapore: the end of Confrontation and relations with Indonesia (Jakarta), ASEAN (Bangkok). */
const REGIONAL = new Set(['konfrontasi-ends-1966', 'indonesia-relations-1967', 'asean-founded-1967']);

/** Reader text without quotations (a quoted speaker may say “we”). */
const unquoted = (text: string) => text.replace(/“[^”]*”/g, '').replace(/‘[^’]*’/g, '');

describe('singapore-after-1965 data', () => {
  it('copies events and their sources unchanged from the topics they come from', () => {
    const ours = byId(events);
    for (const [slug, ids] of Object.entries(COPIED)) {
      const theirs = byId<Event>(json(slug, 'events.json'));
      for (const id of ids) expect(JSON.stringify(ours.get(id)), id).toBe(JSON.stringify(theirs.get(id)));
    }
    const ourSources = byId(sources);
    for (const [slug, ids] of Object.entries(INHERITED_SOURCES)) {
      const theirs = byId<{ id: string }>(json(slug, 'sources.json').sources);
      for (const id of ids) expect(JSON.stringify(ourSources.get(id)), id).toBe(JSON.stringify(theirs.get(id)));
    }
    // New sources start at S401, clear of every inherited number.
    const inherited = new Set(Object.values(INHERITED_SOURCES).flat());
    for (const { id } of sources) if (!inherited.has(id)) expect(Number(id.slice(1)), id).toBeGreaterThanOrEqual(401);
  });

  it('keeps the Confrontation definition of singapore-1819-1965, without its link', () => {
    const theirs = byId<{ id: string; see?: string[] }>(json('singapore-1819-1965', 'glossary.json').terms).get('konfrontasi')!;
    const ours = byId<{ id: string; see?: string[] }>(json('singapore-after-1965', 'glossary.json').terms).get('konfrontasi')!;
    const { see: _see, ...rest } = theirs;
    expect(ours).toEqual(rest);
  });

  it('puts every place in Singapore, Pasir Laba as one rounded point, and draws no territory', () => {
    for (const event of events) {
      const [lng, lat] = event.at;
      if (REGIONAL.has(event.id)) continue;
      expect(lng, event.id).toBeGreaterThan(103.6);
      expect(lng, event.id).toBeLessThan(104.1);
      expect(lat, event.id).toBeGreaterThan(1.15);
      expect(lat, event.id).toBeLessThan(1.48);
    }
    expect(byId(events).get('safti-founded-1966')!.at).toEqual([103.672, 1.334]);
    expect(json('singapore-after-1965', 'entities.json')).toEqual([]);
    expect(json('singapore-after-1965', 'movements.json')).toEqual([]);
    const keyframes: { t: string; features: { features: unknown[] } }[] = json('singapore-after-1965', 'control.json').keyframes;
    expect(keyframes.map((k) => k.t)).toEqual(['1965-08-09', '2023-08-09']);
    for (const frame of keyframes) expect(frame.features.features).toEqual([]);
  });

  it('gives each chapter 3–5 beats, never turns on today\'s borders, and keeps cameras near Pasir Laba at zoom 11.5 or less', () => {
    for (const [i, front] of frontmatter.entries()) {
      const beats: { camera?: { center: [number, number]; zoom: number }; layers?: string[] }[] = front.state.beats;
      expect(beats.length, chapterFiles[i]).toBeGreaterThanOrEqual(3);
      expect(beats.length, chapterFiles[i]).toBeLessThanOrEqual(5);
      for (const layers of [front.state.layers, ...beats.map((b) => b.layers)]) expect(layers ?? []).not.toContain('borders');
      for (const camera of [front.state.camera, ...beats.map((b) => b.camera)]) {
        if (!camera) continue;
        const near = Math.abs(camera.center[0] - 103.672) < 0.06 && Math.abs(camera.center[1] - 1.334) < 0.06;
        if (near) expect(camera.zoom, chapterFiles[i]).toBeLessThanOrEqual(11.5);
      }
    }
  });

  it('has no “we / our / enemy”, no grade labels and no untranslated or non-Singapore forms', () => {
    const all = [...chapterText, ...dataText].map(unquoted).join('\n');
    expect(all).not.toMatch(/\b(we|our|ours|us|enemy|enemies)\b/i);
    expect(all).not.toMatch(/我们|我国|我军|敌人|敌军/);
    expect(all).not.toMatch(/\bP[1-6]\b|\bPrimary [1-6]\b|小[一二三四五六]|年级/);
    expect(all).not.toContain('【待译】');
    expect(all).not.toContain('奥斯曼·渥');
    expect(all).not.toContain('兰花');
  });
});
