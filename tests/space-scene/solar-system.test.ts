import { readFileSync } from 'node:fs';
import { describe, it, expect } from 'vitest';
import { partsFile } from '../../src/engines/space-scene/schema';
import { simSchema, simIssues, quantityKind, type SimValues } from '../../src/engines/space-scene/sim-schema';
import { solarSystemSchema } from '../../src/engines/space-scene/solar-system-schema';
import { evaluateSim } from '../../src/engines/space-scene/lib/sim';
import { resolveSimValues } from '../../src/engines/space-scene/lib/sim/controls';
import { simEffects } from '../../src/engines/space-scene/lib/sim/bind';
import { AU_KM, LIGHT_YEAR_KM, YEAR_SECONDS, circularPlanet, twinkleFlux, cometFrame, solveSolarSystem } from '../../src/engines/space-scene/lib/sim/solar-system';
import { equatorialToHorizon, gmstHours, parseStarCatalogue, skySnapshot } from '../../src/engines/space-scene/lib/sim/solar-sky';
const raw = JSON.parse(readFileSync('src/content/topics/sample-solar/data/parts.json', 'utf8'));
const file = partsFile.parse(raw), sim = file.sim!, config = sim.solarSystem!;
const values = (set: SimValues = {}) => resolveSimValues(sim, set);
const out = (set: SimValues = {}) => evaluateSim(sim, values(set));
const ctx = { parts: new Set(file.parts.map(p => p.id)), partData: file.parts, flows: new Map(), animations: new Map(), poses: new Set(Object.keys(file.poses ?? {})), countable: new Set<string>(), groups: new Set(file.groups.map(g => g.id)) };
const catalogueRaw = JSON.parse(readFileSync('public/catalogues/solar-system/stars-hyg-v41-cc-by-sa.json', 'utf8'));
const catalogue = parseStarCatalogue(catalogueRaw, config.patterns);
describe('solar-system snapshots and registry', () => {
    it('parses a complete fixture with registered quantities', () => { expect(sim.controls).toHaveLength(16); expect(simIssues(sim, ctx)).toEqual([]); for (const o of sim.outputs)
        expect(quantityKind(sim, o.from ?? o.id)).toBe(o.kind); expect(quantityKind(sim, 'fake')).toBeNull(); });
    it('O1/O2 circular quarter and whole years, turns do not wrap', () => { const q = circularPlanet(1, 1, .25), y = circularPlanet(1, 1, 1); expect(q.position[0]).toBeCloseTo(0, 6); expect(q.position[2]).toBeCloseTo(-AU_KM, 6); expect(q.turns).toBe(.25); expect(y.position[0]).toBe(AU_KM); expect(y.position[2]).toBeCloseTo(0, 6); expect(y.turns).toBe(1); });
    it('O3 real periods give distinct one-year turn counts', () => { const f = out({ [config.controls.elapsedYears]: 1 })['planet-frame'] as Record<string, number>; expect(f['earth.turns']).toBeCloseTo(.9999826003027548, 13); expect(f['mercury.turns']).toBeCloseTo(4.152018690727338, 13); expect(f['neptune.turns']).toBeCloseTo(.006068280780808115, 15); });
    it('O4 scale changes only display and O5 shared physical ruler', () => { const a = out(), b = out({ [config.controls.scaleMode]: 'true-scale' }); expect(a['planet-frame']).toEqual(b['planet-frame']); expect(b['radius-earth']).toBeCloseTo(.0004258756, 10); const earth = config.bodies[3]!, jupiter = config.bodies[5]!; expect(jupiter.radiusKm / earth.radiusKm * 10).toBeCloseTo(109.7330212, 7); expect(AU_KM / (2 * earth.radiusKm) * .01).toBeCloseTo(117.4051746, 7); });
    it('rejects invalid bodies, control values and wrong quantities', () => { const bad = structuredClone(config); bad.bodies[1]!.radiusKm = -1; expect(solarSystemSchema.safeParse(bad).success).toBe(false); expect(() => solveSolarSystem(config, { ...values(), [config.controls.elapsedYears]: Infinity })).toThrow(); expect(() => solveSolarSystem(config, { ...values(), [config.controls.sourceKind]: 'unknown' })).toThrow(); });
    it('T1/T2/T3 contrasts point/disc with and without air', () => { for (const source of ['point', 'disc'])
        expect(twinkleFlux(false, source, 'low', 2)).toEqual({ flux: 1, state: 'steady' }); expect(twinkleFlux(true, 'point', 'high', 0).flux).toBe(1); expect(twinkleFlux(true, 'point', 'high', 1).flux).toBeCloseTo(1.1, 12); for (const t of [0, 1])
        expect(twinkleFlux(true, 'disc', 'high', t).flux).toBeCloseTo(1.01, 12); expect(twinkleFlux(true, 'point', 'low', 1).flux).toBe(1.3); expect(twinkleFlux(true, 'disc', 'low', 1).flux).toBeCloseTo(1.03, 12); });
    it('C1 anti-solar tail changes direction at opposite apsides', () => { expect(cometFrame(0).position).toEqual([1.2000000000000002, 0, -0]); expect(cometFrame(0).antiSolar[0]).toBe(1); expect(cometFrame(180).position[0]).toBeCloseTo(-4.8, 12); expect(cometFrame(180).antiSolar[0]).toBe(-1); });
    it('L1 uses exact c and Julian year', () => { expect(Math.abs(LIGHT_YEAR_KM - 9460730472580.8)).toBeLessThan(.01); expect(out()['light-time-seconds']).toBeCloseTo(499.004783836, 9); expect(LIGHT_YEAR_KM / 299792.458).toBeCloseTo(YEAR_SECONDS, 7); });
});
describe('catalogue sky and geodetic frame', () => {
    it('S1 east, zenith and west use four-quadrant azimuth', () => { expect(equatorialToHorizon(0, 0, -90).azDeg).toBe(90); expect(equatorialToHorizon(0, 0, 0).azDeg).toBeNull(); expect(equatorialToHorizon(0, 0, 90).azDeg).toBe(270); });
    it('S2/S3 Singapore meridian and north pole', () => { expect(equatorialToHorizon(1.3342, 0, 0).altDeg).toBeCloseTo(88.6658, 10); expect(equatorialToHorizon(1.3342, 0, 0).azDeg).toBe(180); expect(equatorialToHorizon(1.3342, -63, 0).altDeg).toBeCloseTo(25.6658, 10); expect(equatorialToHorizon(1.3342, 90, 43).altDeg).toBeCloseTo(1.3342, 10); });
    it('S4 GMST epoch and timezone-independent UTC conversion', () => { expect(gmstHours(Date.UTC(2000, 0, 1, 12))).toBeCloseTo(18.6973748878605, 12); expect(skySnapshot(config, values(), catalogue).utc).toBe('2026-01-15T12:00:00.000Z'); });
    it('links do not move points, depth ignores missing distances', () => { expect(skySnapshot(config, values(), catalogue).rows).toEqual(skySnapshot(config, values({ [config.controls.patternLinks]: false }), catalogue).rows); const copy = structuredClone(catalogueRaw); copy.stars[0].dist = '100000'; expect(parseStarCatalogue(copy).stars[0]!.dist).toBeNull(); });
    it('rejects wrong licence, invalid RA and unknown pattern endpoints', () => { const a = structuredClone(catalogueRaw); a.meta.licence = 'CC BY-NC-SA'; expect(() => parseStarCatalogue(a)).toThrow(); const b = structuredClone(catalogueRaw); b.stars[0].ra = '24'; expect(() => parseStarCatalogue(b)).toThrow(); expect(() => parseStarCatalogue(catalogueRaw, { ...config.patterns, orion: [['999999', '25930']] })).toThrow(/unknown HIP/); });
});
describe('generic scale binding', () => {
    it('multiplies scalar and per, preserves zero and existing shifts', () => { const s = simSchema.parse({ ...raw.sim, bind: [{ output: 'radius-earth', part: 'earth', scale: { per: 2 } }, { output: 'display-positions', part: 'earth', shift: { ease: 0, stagger: 0, lift: 0 } }] }); const fx = simEffects(s, values(), { 'radius-earth': .25, 'display-positions': { 'earth:x': 2, 'earth:y': 0, 'earth:z': 3 } }); expect(fx.scale.get('earth')).toBe(.5); expect(fx.shift.get('earth')!.offset).toEqual([2, 0, 3]); expect(simEffects(s, values(), { 'radius-earth': 0 }).scale.get('earth')).toBe(0); expect(() => simEffects(s, values(), { 'radius-earth': -1 })).toThrow(); expect(() => simEffects(s, values(), { 'radius-earth': Infinity })).toThrow(); });
    it('rejects nonnumeric sources, duplicate writers and conflicting place', () => { const duplicate = simSchema.parse({ ...raw.sim, bind: [{ output: 'radius-earth', part: 'earth', scale: { per: 1 } }, { output: 'radius-earth', part: 'earth', scale: { per: 1 } }] }); expect(simIssues(duplicate, ctx).some(i => i.message.includes('duplicate scale'))).toBe(true); const state = simSchema.parse({ ...raw.sim, bind: [{ output: 'scale-state', part: 'earth', scale: { per: 1 } }] }); expect(simIssues(state, ctx).some(i => i.message.includes('numeric'))).toBe(true); const conflict = simSchema.parse({ ...raw.sim, bind: [{ output: 'radius-earth', part: 'earth', scale: { per: 1 } }, { output: 'planet-frame', part: 'earth', place: { centre: [0, 0, 0], radius: 1 } }] }); expect(simIssues(conflict, ctx).some(i => i.message.includes('conflicts'))).toBe(true); const legacy = simSchema.parse({ ...raw.sim, bind: [] }); expect(simEffects(legacy, values(), out()).scale.size).toBe(0); });
});
