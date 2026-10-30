import { readFileSync, readdirSync } from 'node:fs';
import { parse } from 'yaml';
import { describe, expect, it } from 'vitest';
import { spaceSceneData, spaceChapterState, spaceChapterIssues } from '../../src/engines/space-scene/schema';
import { evaluateSim } from '../../src/engines/space-scene/lib/sim';
import { resolveSimValues } from '../../src/engines/space-scene/lib/sim/controls';
import parts from '../../src/content/topics/sample-sound/data/parts.json';
import sources from '../../src/content/topics/sample-sound/data/sources.json';

const dir = 'src/content/topics/sample-sound';
const data = spaceSceneData.parse({ parts, sources });
const sim = data.parts.sim!;
const chapters = readdirSync(`${dir}/chapters`).filter(n => n.endsWith('.mdx')).sort().map(n => {
  const front = parse(readFileSync(`${dir}/chapters/${n}`, 'utf8').match(/^---\n([\s\S]*?)\n---/)![1]!);
  return { id: String(front.id), state: spaceChapterState.parse(front.state) };
});
const q = (set: Record<string, number | string | boolean>) => evaluateSim(sim, resolveSimValues(sim, set));

describe('sound engine draft integration fixture', () => {
  it('stays draft and all four isolated cards validate against actual scene data', () => {
    expect(parse(readFileSync(`${dir}/topic.yaml`, 'utf8')).status).toBe('draft');
    expect(chapters.map(c => c.id)).toEqual(['medium-test', 'frequency-test', 'amplitude-test', 'echo-distance-test']);
    for (const chapter of chapters) expect(spaceChapterIssues(chapter.state, data)).toEqual([]);
    expect(sim.senses!.profile).toBe('sound-only'); expect(sim.senses!.eye).toBeUndefined();
  });
  it('all medium defaults compute travel times and vacuum has no fabricated zero event', () => {
    for (const [medium, speed, time] of [['air', 340, 100], ['water', 1500, 68 / 3], ['solid-example', 5000, 6.8]] as const) {
      const v = q({ medium }); expect(v['speed-mps']).toBe(speed); expect(v['one-way-ms']).toBeCloseTo(time, 9);
    }
    expect(q({ medium: 'vacuum' })).toMatchObject({ 'speed-mps': null, 'one-way-ms': null, 'echo-ms': null, 'propagation-state': 'no-medium', 'source-drive': 'amplitude-one' });
    expect(q({ 'sound-active': false })).toMatchObject({ 'speed-mps': 340, 'one-way-ms': null, 'echo-ms': null, 'propagation-state': 'source-off', 'source-drive': 'off' });
  });
  it('distance output remains a physical round trip independent of wave frequency and amplitude', () => {
    for (const [distance, echo] of [[17, 100], [34, 200], [68, 400]]) {
      expect(q({ 'distance-m': distance! })['echo-ms']).toBe(echo);
      expect(q({ 'distance-m': distance!, 'frequency-hz': 500, amplitude: 2 })['echo-ms']).toBe(echo);
    }
  });
  it('authors quarter-wave and 0/half/return echo snapshots with a following baseline beat', () => {
    const wave = chapters[1]!.state.beats!;
    expect(wave[1]!.sensesFrame).toEqual({ waveCycles: .25 }); expect(wave[2]!.sensesFrame).toBeUndefined();
    const echo = chapters[3]!.state.beats!;
    expect(echo.slice(0, 3).map(b => b.sensesFrame)).toEqual([{ echoProgress: 0 }, { echoProgress: .5 }, { echoProgress: 1 }]);
    expect(echo[3]!.sensesFrame).toBeUndefined();
  });
  it('nullable cards retain the propagation state and the medium category in authored records', () => {
    const nullable = new Set(sim.outputs.filter(o => o.nullable).map(o => o.id));
    expect([...nullable]).toEqual(['speed-mps', 'one-way-ms', 'echo-ms']);
    for (const chapter of chapters) {
      const card = chapter.state.sim!.try!;
      if (card.observe.some(id => nullable.has(id))) expect(card.observe).toContain('propagation-state');
      if (card.observe.includes('speed-mps')) expect([card.vary, ...card.also ?? [], ...card.keep ?? []]).toContain('medium');
    }
  });
});
