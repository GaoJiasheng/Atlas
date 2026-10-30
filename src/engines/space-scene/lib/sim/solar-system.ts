/** Snapshot astronomy. Physical values and display scales stay separate. */
import type { SolarSystem } from '../../solar-system-schema';
import { SOLAR_BODIES, SOLAR_STATES, SOLAR_INPUTS, SOLAR_CHOICES, SOLAR_STEPS } from './solar-constants';
import type { SimValues, SimOutput } from '../../sim-schema';
import type { SimOutputValue } from './index';
import { RAD, unit, type V3 } from './orbit-rotation';
export const AU_KM = 149597870.7, YEAR_SECONDS = 31557600, C_KM_S = 299792.458, LIGHT_YEAR_KM = C_KM_S * YEAR_SECONDS;
const overview = [.7, .14, .19, .2, .16, .6, .5, .35, .34];
const vectors = ['planet-frame', 'display-positions', 'comet-positions'];
const numbers = ['planet-diameter-km', 'reference-au', 'period-years', 'completed-turns', 'twinkle-flux', 'comet-angle', 'light-distance-km', 'light-time-seconds'];
export function solarQuantity(from: string): SimOutput['kind'] | null { return vectors.includes(from) ? 'vector' : SOLAR_STATES[from] ? 'state' : numbers.includes(from) || SOLAR_BODIES.some(id => from === `radius-${id}`) ? 'number' : null; }
export function circularPlanet(aAu: number, periodYears: number, years: number) { if (![aAu, periodYears, years].every(Number.isFinite) || aAu <= 0 || periodYears <= 0 || years < 0)
    throw new RangeError('finite positive orbit/period and nonnegative elapsed years required'); const turns = years / periodYears, angle = 2 * Math.PI * turns; if (!Number.isFinite(aAu * AU_KM) || !Number.isFinite(angle))
    throw new RangeError('orbit result exceeds finite numeric range'); return { position: [aAu * AU_KM * Math.cos(angle), 0, -aAu * AU_KM * Math.sin(angle)] as V3, turns }; }
export function twinkleFlux(air: boolean, source: string, altitude: string, seconds: number) { if (!Number.isFinite(seconds) || seconds < 0 || seconds > 4)
    throw new RangeError('twinkle time outside 0..4 seconds'); const a = air ? (altitude === 'low' ? .3 : .1) : 0; const flux = [1, .8, .6, .4].map((b, i) => 1 + a * b * Math.sin(Math.PI * seconds / 2 + i * Math.PI / 2)); return { flux: source === 'disc' ? flux.reduce((a, b) => a + b) / 4 : flux[0]!, state: !air ? 'steady' : source === 'disc' ? 'disc-averaged' : 'point-fluctuation' }; }
export function cometFrame(degrees: number) { if (!Number.isFinite(degrees))
    throw new RangeError('finite comet eccentric anomaly required'); const e = degrees * RAD, p: V3 = [3 * (Math.cos(e) - .6), 0, -2.4 * Math.sin(e)]; return { position: p, antiSolar: unit(p), angle: Math.atan2(-p[2], p[0]) / RAD }; }
export function solveSolarSystem(c: SolarSystem, values: SimValues): Record<string, SimOutputValue> {
    const get = (key: keyof SolarSystem['controls']) => values[c.controls[key]];
    const n = (key: keyof SolarSystem['controls']) => { const v = get(key); if (typeof v !== 'number' || !Number.isFinite(v))
        throw new RangeError(`solar ${key} must be finite`); return v; };
    for (const key of SOLAR_INPUTS) {
        const v = get(key), opts = SOLAR_CHOICES[key], steps = SOLAR_STEPS[key];
        if (opts ? !opts.includes(String(v)) : steps ? typeof v !== 'number' || !steps.includes(v) : typeof v !== 'boolean')
            throw new RangeError(`solar ${key}: invalid control value`);
    }
    const lab = String(get('lab')), mode = String(get('scaleMode')), years = n('elapsedYears');
    if (years < 0 || years > 165)
        throw new RangeError('solar elapsed years outside 0..165');
    const frame: Record<string, number> = {}, positions: Record<string, number> = {}, out: Record<string, SimOutputValue> = {};
    const k = 10 / AU_KM;
    const put = (id: string, p: V3) => { p.forEach((v, i) => positions[`${id}:${['x', 'y', 'z'][i]}`] = v); positions[`${id}:shown`] = 1; };
    c.bodies.forEach((b, i) => {
        const phys = b.id === 'sun' ? { position: [0, 0, 0] as V3, turns: 0 } : circularPlanet(b.aAu!, b.periodYears!, years);
        phys.position.forEach((v, j) => frame[`${b.id}.${['xKm', 'yKm', 'zKm'][j]}`] = v);
        frame[`${b.id}.radiusKm`] = b.radiusKm;
        frame[`${b.id}.turns`] = phys.turns;
        let radius = overview[i]!, p: V3 = [0, 0, 0];
        if (lab === 'sizes') {
            radius = b.radiusKm / 69911;
            p = b.id === 'sun' ? [-32, 0, 0] : [(i - 4.5) * 2.8, 0, 0];
        }
        else if (lab === 'distances') {
            radius = b.radiusKm * k;
            p = [(b.aAu ?? 0) * 10, 0, 0];
        }
        else {
            radius = mode === 'true-scale' ? b.radiusKm * k : overview[i]!;
            const r = b.id === 'sun' ? 0 : mode === 'true-scale' ? b.aAu! * 10 : 5 * Math.sqrt(b.aAu!);
            const a = 2 * Math.PI * phys.turns;
            p = [r * Math.cos(a), 0, -r * Math.sin(a)];
        }
        put(b.id, p);
        if (b.id === 'saturn')
            put('saturn-rings', p);
        out[`radius-${b.id}`] = radius;
    });
    const selected = c.bodies.find(b => b.id === get('planet')) ?? c.bodies[3]!;
    const t = twinkleFlux(get('atmosphere') === true, String(get('sourceKind')), String(get('altitudeMode')), n('twinkleSeconds'));
    const comet = cometFrame(n('cometStep'));
    const cp: Record<string, number> = {};
    for (const id of ['comet-nucleus', 'comet-coma', 'ion-tail', 'dust-tail']) {
        comet.position.forEach((v, i) => cp[`${id}:${['x', 'y', 'z'][i]}`] = v);
        cp[`${id}:shown`] = 1;
    }
    const target = String(get('distanceTarget'));
    const distance = target === 'proxima' ? 4.24 * LIGHT_YEAR_KM : target === 'milky-way' ? 1e5 * LIGHT_YEAR_KM : target === 'neptune' ? (c.bodies[8]!.aAu! * AU_KM) : AU_KM;
    return { ...out, 'planet-frame': frame, 'display-positions': positions, 'planet-diameter-km': 2 * selected.radiusKm, 'reference-au': selected.aAu!, 'period-years': selected.periodYears!, 'completed-turns': years / selected.periodYears!, 'scale-state': lab === 'sizes' ? 'size-row' : lab === 'distances' ? 'distance-ruler' : lab === 'sky' ? 'sky' : ['small-bodies', 'twinkle', 'galaxy'].includes(lab) ? 'schematic' : mode, 'twinkle-flux': t.flux, 'twinkle-state': t.state, 'comet-angle': comet.angle, 'comet-positions': cp, 'light-distance-km': distance, 'light-time-seconds': distance / C_KM_S };
}
