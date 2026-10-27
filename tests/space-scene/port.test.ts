import { readFileSync, readdirSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { parse as yaml } from 'yaml';
import { partsFile, spaceChapterState } from '../../src/engines/space-scene/schema';
import { portSchema, portSourceIssues } from '../../src/engines/space-scene/port-schema';
import { simSchema, simIssues, chapterSimIssues, quantityKind, simTimelineChannels, type SimValues } from '../../src/engines/space-scene/sim-schema';
import { evaluateSim, SEPARATE_EXPERIMENTS } from '../../src/engines/space-scene/lib/sim';
import { evaluateSimOnStage } from '../../src/engines/space-scene/lib/sim/carrier';
import { portLift, portYard, PORT_CHANNELS } from '../../src/engines/space-scene/lib/sim/port';
import { channelValue, isTimeline } from '../../src/engines/space-scene/lib/sim/timeline';
import { resolveSimValues, decodeSimParam } from '../../src/engines/space-scene/lib/sim/controls';
const raw = JSON.parse(readFileSync('src/content/topics/sample-port/data/parts.json', 'utf8'));
const file = partsFile.parse(raw);
const sim = file.sim!;
const port = sim.port!;
const ctx = { parts: new Set(file.parts.map((p) => p.id)), partData: file.parts, flows: new Map(), animations: new Map(), poses: new Set(Object.keys(file.poses ?? {})), countable: new Set(['sample-20', 'sample-40']), repeated: new Set(['sample-20', 'sample-40', 'twistlocks']) };
const out = (set: SimValues = {}) => evaluateSim(sim, resolveSimValues(sim, set), [], undefined, file.parts);
const issues = (mutate: (x: typeof raw) => void) => { const x = structuredClone(raw); mutate(x); return simIssues(simSchema.parse(x.sim), ctx).map((x) => `${x.path.join('.')}: ${x.message}`); };
const lift = portLift(port.lift, true);
const at = (t: number) => Object.fromEntries(PORT_CHANNELS.map((c) => [c, channelValue(lift, c, t)]));

describe('port registry and fixture', () => {
  it('has 11 legal controls, 15 registered outputs, five channels and clean references', () => {
    expect(sim.controls).toHaveLength(11); expect(sim.outputs).toHaveLength(15);
    expect(simIssues(sim, ctx)).toEqual([]); expect(SEPARATE_EXPERIMENTS.port).toBe(true);
    for (const o of sim.outputs) expect(quantityKind(sim, o.from ?? o.id)).toBe(o.kind);
    expect(quantityKind(sim, 'mass')).toBeNull();
    expect(simTimelineChannels(sim, 'lift-run')).toEqual([...PORT_CHANNELS]); expect(simTimelineChannels(sim, 'boxes')).toBeNull();
    expect(portSourceIssues(port, new Map([['S1', { design: true }]]))).toEqual([]);
  });
  it('ships legal fixture chapter states and replay/record cards', () => {
    for (const name of readdirSync('src/content/topics/sample-port/chapters')) {
      const body = readFileSync(`src/content/topics/sample-port/chapters/${name}`, 'utf8');
      const chapter = yaml(body.split(/^---$/m)[1]!);
      const state = spaceChapterState.parse(chapter.state);
      expect(chapterSimIssues(name, state.sim, sim)).toEqual([]);
    }
  });
  it('counts boxes and TEU independently', () => {
    expect([out().boxes, out().teu]).toEqual([3, 4]);
    expect([out({ n20: 0, n40: 0 }).boxes, out({ n20: 0, n40: 0 }).teu]).toEqual([0, 0]);
    expect(out().mass).toBeUndefined();
  });
  it('ignores invalid URL controls and never emits nonfinite numbers', () => {
    const values = resolveSimValues(sim, decodeSimParam('n20.99~hours.0~cranes.-1~unknown.4'));
    const result = evaluateSim(sim, values, [], undefined, file.parts);
    expect(result.boxes).toBe(3); expect(result.completed).toBe(36);
    expect(Object.values(result).filter((v) => typeof v === 'number').every(Number.isFinite)).toBe(true);
  });
});

describe('finite lift, exact numeric oracle from docs/62 §4.3', () => {
  it('keeps all start positions when lock confirmation is false', () => {
    const result = out({ 'lock-confirmed': false }); const tl = result['lift-run'];
    expect(result['lift-status']).toBe('lock-not-confirmed'); expect(isTimeline(tl)).toBe(true);
    if (!isTimeline(tl)) return;
    expect(tl.duration).toBe(0);
    for (const c of PORT_CHANNELS) { expect(channelValue(tl, c, 100)).toBe(0); expect(tl.channels[c]).toEqual({ samples: [[0, 0]] }); }
  });
  it.each([
    [8, -18, 20.391, 17.5, -18, 90],
    [16, -4, 27.891, 25, -4, 90],
    [24, 10, 16.391, 13.5, 10, 90],
    [28, 10, 4.891, 2, 10, 90],
    [30, 10, 4.891, 2, 10, 0],
    [32, 10, 27.891, 2, 10, 0],
  ])('t=%s has the authored absolute centres and supported cargo', (t, trolleyZ, spreaderY, bottom, cargoZ, lock) => {
    const p = at(t);
    expect(-18 + p['trolley-dz']!).toBeCloseTo(trolleyZ, 8);
    expect(12.891 + p['spreader-dy']!).toBeCloseTo(spreaderY, 8);
    expect(10 + p['cargo-dy']!).toBeCloseTo(bottom, 8);
    expect(-18 + p['cargo-dz']!).toBeCloseTo(cargoZ, 8);
    expect(p['lock-deg']).toBe(lock);
  });
  it('has 0 and 32 endpoints in every bounded channel', () => {
    expect(lift.duration).toBe(32); expect(lift.slow).toBe(1);
    for (const channel of Object.values(lift.channels)) { if (!('samples' in channel)) continue; expect(channel.samples[0]![0]).toBe(0); expect(channel.samples.at(-1)![0]).toBe(32); expect(channel.samples.length).toBeLessThanOrEqual(256); }
  });
  it('only changes the timeline key for lock or geometry changes', () => {
    const key = (set: SimValues) => (out(set)['lift-run'] as typeof lift).key;
    expect(key({ n20: 4 })).toBe(key({})); expect(key({ cranes: 2 })).toBe(key({})); expect(key({ 'lift-live': false })).toBe(key({}));
    expect(key({ 'lock-confirmed': false })).not.toBe(key({}));
    expect(portLift({ ...port.lift, clearBottomY: 26 }, true).key).not.toBe(lift.key);
  });
});

describe('yard model', () => {
  it('original keeps target low and both blockers in place', () => {
    const q = out(); expect(q.rehandles).toBe(2); expect(q['retrieval-lifts']).toBe(3);
    const slots = q['yard-slots'] as Record<string, number>;
    expect(slots['yard-target:y']).toBe(0); expect(slots['yard-blocker-a:y']).toBe(0); expect(slots['yard-blocker-b:shown']).toBe(1);
  });
  it('retrieved parks both blockers and moves only the target to the retrieval slot', () => {
    const slots = portYard(port, 2, 'retrieved', file.parts);
    expect([18 + slots['yard-blocker-a:x']!, 3.8865 + slots['yard-blocker-a:y']!, 40 + slots['yard-blocker-a:z']!]).toEqual([28, 1.2955, 40]);
    expect([18 + slots['yard-blocker-b:x']!, Number((6.4775 + slots['yard-blocker-b:y']!).toFixed(8)), 40 + slots['yard-blocker-b:z']!]).toEqual([38, 1.2955, 40]);
    expect([18 + slots['yard-target:x']!, 1.2955 + slots['yard-target:y']!, 40 + slots['yard-target:z']!]).toEqual([18, 1.2955, 50]);
  });
  it('on the stage the slots are offsets from the parts\' rest centres, not from the origin', () => {
    const { outputs } = evaluateSimOnStage(sim, file, resolveSimValues(sim, { above: 2, 'yard-state': 'retrieved' }), null);
    const slots = outputs['yard-slots'] as Record<string, number>;
    expect([slots['yard-blocker-a:x'], slots['yard-blocker-a:z'], slots['yard-target:z']]).toEqual([10, 0, 10]);
  });
  it('above=0 hides both blockers without changing the target tier', () => {
    const q = out({ above: 0 }); const slots = q['yard-slots'] as Record<string, number>;
    expect(q.rehandles).toBe(0); expect(q['retrieval-lifts']).toBe(1);
    expect([slots['yard-blocker-a:shown'], slots['yard-blocker-b:shown'], slots['yard-target:y']]).toEqual([0, 0, 0]);
  });
});

describe('continuous flow capacity oracle', () => {
  it.each([
    [1,1,1,30,24,18,18,36,6,12,'yard'],
    [2,1,1,60,24,18,18,36,6,12,'yard'],
    [1,1,2,30,24,36,24,48,0,0,'carrier'],
    [1,2,2,30,48,36,30,48,0,0,'crane'],
  ])('%s/%s/%s resources', (cranes,carriers,yards,crane,carrier,yard,capacity,completed,growth,queued,bottleneck) => {
    const q = out({ cranes,carriers,yards });
    expect(['crane-rate','carrier-rate','yard-rate','capacity-rate','completed','queue-growth','queued','bottleneck'].map((id) => q[id])).toEqual([crane,carrier,yard,capacity,completed,growth,queued,bottleneck]);
  });
  it('custom equal minimum rates produce tied', () => {
    const custom = simSchema.parse({ ...sim, port: { ...port, capacity: { ...port.capacity, rate: { crane: 20, carrier: 20, yard: 30 } } } });
    const q = evaluateSim(custom, resolveSimValues(custom, {})); expect(q['capacity-rate']).toBe(20); expect(q.bottleneck).toBe('tied');
  });
});

describe('port validation', () => {
  it('rejects unknown fields, infinite rates and nonpositive dimensions', () => {
    for (const p of [{ ...port, extra: 1 }, { ...port, lift: { ...port.lift, boxHeight: 0 } }, { ...port, capacity: { ...port.capacity, rate: { crane: Infinity, carrier: 24, yard: 18 } } }]) expect(portSchema.safeParse(p).success).toBe(false);
  });
  it.each([
    [(x: typeof raw) => { x.sim.port.count.n20 = 'unknown'; }, 'unknown control'],
    [(x: typeof raw) => { x.sim.port.lift.enabled = 'n20'; }, 'toggle'],
    [(x: typeof raw) => { x.sim.controls.find((c: {id:string}) => c.id === 'n20').values = [-1, 0]; }, 'nonnegative integers'],
    [(x: typeof raw) => { x.sim.port.yard.blockers[0] = 'yard-target'; }, 'distinct'],
    [(x: typeof raw) => { x.sim.port.lift.clearBottomY = 4; }, 'clear both'],
    [(x: typeof raw) => { x.sim.port.lift.knots.crossed = 11; }, 'ascending'],
    [(x: typeof raw) => { x.sim.port.lift.clearBottomY = 80; }, 'above the highest'],
    [(x: typeof raw) => { x.sim.outputs[0].from = 'mass'; }, 'no quantity'],
    [(x: typeof raw) => { x.sim.outputs.find((o:{id:string})=>o.id==='lift-status').states.extra={en:'extra',zh:'额外'}; }, 'unknown port state'],
    [(x: typeof raw) => { x.sim.outputs.find((o:{id:string})=>o.id==='lift-run').kind='number'; }, 'timeline'],
    [(x: typeof raw) => { x.sim.port.lift.destination[0] = 2; }, 'share X'],
    [(x: typeof raw) => { x.sim.port.lift.destination[2] = 1e6; }, 'model rest envelope'],
    [(x: typeof raw) => { x.sim.port.capacity.rate.crane = 1e308; }, 'finite outputs'],
    [(x: typeof raw) => { x.sim.controls.find((c: {id:string}) => c.id === 'n20').values = [0,5]; }, 'from 0 to 4'],
  ])('reports invalid author data', (edit, expected) => expect(issues(edit).join('\n')).toContain(expected));
  it('requires four countable copies for both box sample controls', () => {
    const fewer = file.parts.map((p) => p.id === 'sample-20' ? { ...p, repeat: { count: 2, axis: [0,0,1] as [number,number,number], spacing: 4 } } : p);
    expect(simIssues(sim, { ...ctx, partData: fewer }).map((x) => x.message).join(' ')).toContain('too few repeat copies');
  });
  it('requires a cited design source and known ids', () => {
    expect(portSourceIssues(port, new Map()).map((x) => x.message).join(' ')).toContain('unknown source');
    expect(portSourceIssues(port, new Map([['S1', {}]])).map((x) => x.message).join(' ')).toContain('design:true');
  });
});
