import { describe, it, expect } from 'vitest';
import raw from '../../src/content/topics/sample-orbit/data/parts.json';
import solar from '../../src/content/topics/sample-orbit/data/singapore-sun-2026.json';
import oracles from './fixtures/orbit-oracles.json';
import { spaceSceneData, partsFile } from '../../src/engines/space-scene/schema';
import { simSchema } from '../../src/engines/space-scene/sim-schema';
import { resolveSimValues } from '../../src/engines/space-scene/lib/sim/controls';
import { evaluateSim } from '../../src/engines/space-scene/lib/sim';
import {
  orbitSnapshot,
  solveOrbitRotation,
  geometricDaylight,
  classifySolarDiscs,
  rotate,
  unit,
  sub,
  dot,
  validateBodyFrame,
  RAD,
} from '../../src/engines/space-scene/lib/sim/orbit-rotation';
import { orbitDisplay, bodyPlacement, northBasis } from '../../src/engines/space-scene/lib/sim/orbit-projection';
import { orbitClock, stepOrbitClock, decodeOrbitTime } from '../../src/engines/space-scene/lib/sim/orbit-clock';
import { orbitIsStill, type OrbitSession } from '../../src/engines/space-scene/lib/sim/orbit-session';
import { orbitRotationSchema, orbitTableIssues } from '../../src/engines/space-scene/orbit-rotation-schema';
const cfg = orbitRotationSchema.parse({
  ...raw.sim.orbitRotation,
  solarYear: { ...raw.sim.orbitRotation.solarYear, table: solar },
});
const sim = simSchema.parse({ ...raw.sim, orbitRotation: cfg });
const defaults = resolveSimValues(sim, {});
const snapshot = (set: Record<string, number | string | boolean> = {}, timeSeconds = 0) => orbitSnapshot(cfg, { ...defaults, ...set }, { timeSeconds });
const solve = (set: Record<string, number | string | boolean> = {}, t = 0) => snapshot(set, t).quantities;
const number = (v: unknown) => v as number;
describe('orbit-rotation · docs/44 T01–T28', () => {
  it('T01 zero tilt equator noon', () => {
    const q = solve({ obliquity: 0 });
    expect(q['geometric-daylight-hours']).toBe(12);
    expect(q['noon-altitude-deg']).toBe(90);
    expect(number(q['observer-altitude-deg'])).toBeCloseTo(90, 6);
    expect(q['observer-day']).toBe('day');
  });
  it('T02 frozen orbit 24-hour day', () => {
    [0, 21600, 43200, 64800, 86400].forEach((t, i) => {
      const q = solve({ lab: 'day', obliquity: 0, 'spin-angle': 0 }, t);
      expect(q['observer-day']).toBe(['night', 'boundary', 'day', 'boundary', 'night'][i]);
      expect(number(q['observer-altitude-deg'])).toBeCloseTo([-90, 0, 90, 0, -90][i]!, 6);
    });
  });
  it('T03–T07 daylight oracles, hemispheres and polar branches', () => {
    for (const row of oracles.daylight) {
      const d = geometricDaylight(row.lat_deg, row.declination_deg);
      expect(d.hours).toBeCloseTo(row.geometric_daylight_hours, 9);
      expect(d.noon).toBeCloseTo(row.noon_altitude_deg, 9);
    }
    for (const year of [0, 90, 180, 270])
      for (const lat of [-45, 0, 45])
        expect(
          solve({
            lab: 'year',
            'year-angle': year,
            'observer-lat': lat,
            obliquity: 0,
          })['geometric-daylight-hours'],
        ).toBe(12);
    const a = solve({ lab: 'year', 'year-angle': 90, 'observer-lat': 45 }),
      b = solve({ lab: 'year', 'year-angle': 270, 'observer-lat': 45 });
    expect(number(a['geometric-daylight-hours'])).toBeCloseTo(15.425892413189418, 9);
    expect(number(a['noon-altitude-deg'])).toBeCloseTo(68.44, 9);
    expect(number(b['geometric-daylight-hours'])).toBeCloseTo(8.57410758681058, 9);
    expect(number(a['geometric-daylight-hours']) + number(b['geometric-daylight-hours'])).toBeCloseTo(24, 12);
    expect(solve({ 'year-angle': 90, 'observer-lat': 80 })['daylight-state']).toBe('polar-day');
    expect(solve({ 'year-angle': 270, 'observer-lat': 80 })['daylight-state']).toBe('polar-night');
  });
  it('T08 invariant inertial Earth axis', () => {
    const axis = snapshot().axis;
    for (const year of [0, 90, 180, 270]) expect(snapshot({ 'year-angle': year }).axis).toEqual(axis);
    expect(axis[1]).toBeCloseTo(Math.cos(23.44 * RAD), 12);
  });
  it('T09–T10 exact finite-distance phases and independent lunar eclipse', () => {
    for (const row of oracles.phases) {
      const q = solve({
        lab: 'moon',
        obliquity: 0,
        'lunar-tilt': 0,
        'lunar-angle': row.lunar_angle_deg,
      });
      expect(number(q['moon-lit-percent']) / 100).toBeCloseTo(row.lit_fraction_geocentric, 10);
      expect(number(q['disc-separation-deg'])).toBeCloseTo(row.disc_separation_deg_topocentric, 6);
    }
    for (const [a, p] of [
      [0, 'new'],
      [90, 'first-quarter'],
      [180, 'full'],
      [270, 'last-quarter'],
    ] as const)
      expect(solve({ lab: 'moon', 'lunar-tilt': 0, 'lunar-angle': a })['moon-phase']).toBe(p);
    const q = solve({ 'lunar-tilt': 0, 'lunar-angle': 180 });
    expect(q['moon-lit-percent']).toBe(100);
    expect(q['lunar-eclipse']).toBe('total');
    for (const a of oracles.exact_half_lit_lunar_angles_deg)
      expect(number(solve({ obliquity: 0, 'lunar-tilt': 0, 'lunar-angle': a })['moon-lit-percent'])).toBeCloseTo(50, 9);
  });
  it('T11 off-node alignment is not an eclipse', () => {
    for (const a of [0, 180]) {
      const s = snapshot({
        lab: 'eclipse',
        obliquity: 0,
        'node-angle': 90,
        'lunar-angle': a,
      });
      expect(s.quantities['solar-eclipse']).toBe('none');
      expect(s.quantities['lunar-eclipse']).toBe('none');
      expect(Math.abs(s.bodies.moon.position[1])).toBeCloseTo(oracles.off_node_moon_height_km, 6);
    }
  });
  it('T12–T15 finite observer discs', () => {
    for (const r of oracles.central_discs) {
      const q = solve({
        lab: 'eclipse',
        obliquity: 0,
        'lunar-tilt': 0,
        'moon-range': r.moon_range_km,
      });
      expect(q['solar-eclipse']).toBe(r.solar_eclipse_at_central_model_observer);
      expect(number(q['sun-diameter-deg'])).toBeCloseTo(r.sun_diameter_deg, 9);
      expect(number(q['moon-diameter-deg'])).toBeCloseTo(r.moon_diameter_deg, 9);
    }
    expect(solve({ obliquity: 0, 'lunar-tilt': 0, 'lunar-angle': 0.3 })['solar-eclipse']).toBe('partial');
    expect(solve({ obliquity: 0, 'lunar-tilt': 0, 'lunar-angle': 1 })['solar-eclipse']).toBe('none');
  });
  it('T16–T17 synchronous and fixed inertial orientations', () => {
    const first = snapshot({ 'lunar-tilt': 0, 'lunar-angle': 0 }),
      quarter = snapshot({ 'lunar-tilt': 0, 'lunar-angle': 90 });
    expect(dot(rotate(quarter.bodies.moon.quaternion, [1, 0, 0]), unit(sub(quarter.bodies.earth.position, quarter.bodies.moon.position)))).toBeCloseTo(1, 12);
    const off = snapshot({
      'lunar-tilt': 0,
      'lunar-angle': 90,
      synchronous: false,
    });
    expect(off.bodies.moon.quaternion).toEqual(first.bodies.moon.quaternion);
    expect(dot(rotate(off.bodies.moon.quaternion, [1, 0, 0]), unit(sub(off.bodies.earth.position, off.bodies.moon.position)))).toBeCloseTo(0, 10);
  });
  it('T18–T19 independent true-scale mapping and attachment radius', () => {
    const s = snapshot(),
      a = orbitDisplay(cfg, s, 'true-scale'),
      b = orbitDisplay(cfg, s, 'schematic');
    expect(a.radii.earth * 2000).toBeCloseTo(10, 10);
    expect(a.radii.moon * 2000).toBeCloseTo(oracles.scale.moon_diameter_mm, 9);
    expect(Math.hypot(...sub(a.centres.moon, a.centres.earth)) * 1000).toBeCloseTo(oracles.scale.earth_moon_centre_distance_mm, 9);
    expect((Math.hypot(...sub(a.centres.moon, a.centres.earth)) - a.radii.earth - a.radii.moon) * 1000).toBeCloseTo(oracles.scale.earth_moon_surface_gap_mm, 9);
    expect(a.radii.sun * 2).toBeCloseTo(oracles.scale.sun_diameter_m, 10);
    expect(Math.hypot(...sub(a.centres.sun, a.centres.earth))).toBeCloseTo(oracles.scale.earth_sun_distance_m, 10);
    const mark = bodyPlacement(s, b, {
      body: 'moon',
      attachment: 'surface',
      localDirection: [1, 0, 0],
      surfaceFactor: 1.006,
      scaleWithRadius: true,
    });
    expect(Math.hypot(...sub(mark.position, b.centres.moon))).toBeCloseTo(b.radii.moon * 1.006, 12);
    expect(s.quantities).toEqual(solve());
  });
  it('T20 periods', () => {
    expect(1 / (1 / cfg.periods.moonSeconds - 1 / cfg.periods.yearSeconds) / 86400).toBeCloseTo(oracles.periods.synodic_days_coplanar, 10);
    expect(1 / (1 / cfg.periods.spinSeconds - 1 / cfg.periods.yearSeconds)).toBeCloseTo(oracles.periods.solar_day_seconds_zero_tilt, 6);
  });
  it('T21–T22 unrounded daylight and all 365 rows', () => {
    expect(orbitTableIssues(cfg)).toEqual([]);
    for (const [id, r] of Object.entries(oracles.solar_year_rows)) {
      const q = solve({ lab: 'local-year', 'day-index': Number(id) });
      expect(q['local-daylight-minutes']).toBe(r.daylight_minutes);
      expect(q['local-sunrise']).toBe(Number(r.sunrise_sgt.slice(0, 2)) + Number(r.sunrise_sgt.slice(3)) / 60);
      expect(q['local-noon']).toBe(Number(r.solar_noon_sgt.slice(0, 2)) + Number(r.solar_noon_sgt.slice(3)) / 60);
      expect(q['local-sunset']).toBe(Number(r.sunset_sgt.slice(0, 2)) + Number(r.sunset_sgt.slice(3)) / 60);
    }
    for (let day = 1; day <= 365; day++) {
      const q = solve({ lab: 'local-year', 'day-index': day });
      expect(q['local-daylight-minutes']).toBe(solar.days[day - 1]!.daylight_minutes);
      expect(q['geometric-daylight-hours']).toBeNaN();
      expect(q['moon-phase']).toBe('not-applicable');
      expect(
        solve({
          lab: 'local-year',
          'day-index': day,
          'lunar-angle': 180,
          'year-angle': 270,
        })['local-daylight-minutes'],
      ).toBe(q['local-daylight-minutes']);
    }
  });
  it('T23 decimal URL time validation and context override', () => {
    expect(decodeOrbitTime('21600')).toBe(21600);
    for (const v of ['NaN', 'Infinity', '-1', '1e3', '1.1234567', '31557601', '', ' 2']) expect(decodeOrbitTime(v)).toBeNull();
    expect(solve({ lab: 'day', obliquity: 0, 'spin-angle': 0 }, 21600)['observer-day']).toBe('boundary');
    expect(() => solve({}, NaN)).toThrow(/timeSeconds/);
  });
  it('T24 equal model time at 30/60/120 fps, pause, hidden and clamp', () => {
    for (const fps of [30, 60, 120]) {
      const c = orbitClock();
      c.running = true;
      for (let i = 0; i < fps; i++) stepOrbitClock(c, 1 / fps, 21600, 31557600);
      expect(c.elapsedSeconds).toBeCloseTo(21600, 6);
      c.running = false;
      for (let i = 0; i < 10; i++) stepOrbitClock(c, 1, 21600, 31557600);
      expect(c.elapsedSeconds).toBeCloseTo(21600, 6);
      c.running = true;
      stepOrbitClock(c, 100, 21600, 31557600, true);
      expect(c.elapsedSeconds).toBeCloseTo(21600, 6);
      stepOrbitClock(c, 100, 21600, 31557600);
      expect(c.elapsedSeconds).toBeCloseTo(22680, 6);
    }
    const c = orbitClock(31557599);
    c.running = true;
    stepOrbitClock(c, 1, 21600, 31557600);
    expect(c.elapsedSeconds).toBe(31557600);
    expect(c.running).toBe(false);
  });
  it('T25 invalid frames, model, local path and parent cycle', () => {
    const f = {
      ...(snapshot().quantities['body-frame'] as Record<string, number>),
    };
    delete f['earth.qz'];
    expect(validateBodyFrame(f)).toContain('earth.qz: missing finite value');
    f['earth.qz'] = 0;
    f['earth.qw'] = 2;
    expect(validateBodyFrame(f).join()).toContain('unit');
    for (const change of [
      { model: 'ephemeris' },
      { solarYear: { ...cfg.solarYear, file: 'https://x/year.json' } },
      {
        bodies: [cfg.bodies[0], { ...cfg.bodies[1], parent: 'moon' }, cfg.bodies[2]],
      },
    ])
      expect(orbitRotationSchema.safeParse({ ...cfg, ...change }).success).toBe(false);
  });
  it('T26 registry preserves old five argument API and all output kinds', () => {
    expect(evaluateSim(sim, defaults, [], undefined, [], { timeSeconds: 21600 })).toEqual(solve({}, 21600));
    expect(Object.keys(solve())).toHaveLength(23);
    expect(solveOrbitRotation(cfg, defaults)).toEqual(solve());
    expect(northBasis([0, 1, 0], [0, 1, 0]).up.every(Number.isFinite)).toBe(true);
  });
  it('T27 all normal-distance lunar oracle cases', () => {
    for (const row of oracles.lunar_eclipses) {
      const s = snapshot({
        lab: 'eclipse',
        obliquity: 0,
        'lunar-tilt': 0,
        'lunar-angle': row.lunar_angle_deg,
      });
      expect(s.quantities['lunar-eclipse']).toBe(row.lunar_eclipse);
      expect(s.shadow.x).toBeCloseTo(row.x_behind_earth_km, 6);
      expect(s.shadow.offAxis).toBeCloseTo(row.off_axis_km, 6);
      expect(s.shadow.du).toBeCloseTo(row.umbra_signed_distance_km, 6);
      expect(s.shadow.dp).toBeCloseTo(row.penumbra_signed_distance_km, 6);
    }
  });
  it('T28 contact boundaries', () => {
    expect(classifySolarDiscs(0.25 * RAD, 0.26 * RAD, 0.51 * RAD)).toBe('none');
    expect(classifySolarDiscs(0.25 * RAD, 0.26 * RAD, 0.01 * RAD)).toBe('total');
    expect(classifySolarDiscs(0.25 * RAD, 0.26 * RAD, 0.010001 * RAD)).toBe('partial');
    expect(classifySolarDiscs(0.25 * RAD, 0.25 * RAD, 0)).toBe('total');
  });
});

describe('orbit schema: bounded date exception and writer conflicts', () => {
  const file = () => structuredClone(raw);
  it('accepts the draft fixture including its local table', async () => {
    const sources = (await import('../../src/content/topics/sample-orbit/data/sources.json')).default;
    expect(
      spaceSceneData.safeParse({
        parts: raw,
        sources,
        'singapore-sun-2026': solar,
      }).success,
    ).toBe(true);
  });
  for (const [name, mutate] of [
    ['missing day 299', (a: number[]) => a.filter((x) => x !== 299)],
    ['out of order', (a: number[]) => [...a.slice(0, 297), 299, 298, ...a.slice(299)]],
    ['duplicate day', (a: number[]) => [...a.slice(0, 298), 298, ...a.slice(299)]],
    ['367 values', () => Array.from({ length: 367 }, (_, i) => i + 1)],
  ] as const)
    it(`rejects ${name}`, () => {
      const d = file();
      d.sim.controls.find((c) => c.id === 'day-index')!.values = mutate(Array.from({ length: 365 }, (_, i) => i + 1));
      expect(simSchema.safeParse(d.sim).success).toBe(false);
    });
  it('keeps the 24-value cap for old kinds and non-date orbit controls', () => {
    const d = file();
    d.sim.controls.find((c) => c.id === 'spin-angle')!.values = Array.from({ length: 25 }, (_, i) => i);
    expect(simSchema.safeParse(d.sim).success).toBe(false);
    const old = {
      kind: 'circuit',
      controls: [
        {
          id: 'cells',
          kind: 'step',
          label: { en: 'Cells', zh: '电池' },
          values: Array.from({ length: 25 }, (_, i) => i),
          default: 0,
        },
      ],
      outputs: [{ id: 'v', kind: 'number', label: { en: 'V', zh: '伏' } }],
    };
    expect(simSchema.safeParse(old).success).toBe(false);
  });
  it('rejects duplicate and conflicting writers, unknown quantities and extra states', () => {
    const duplicate = file();
    duplicate.sim.bind.push(duplicate.sim.bind[0]!);
    expect(partsFile.safeParse(duplicate).success).toBe(false);
    const q = file();
    q.sim.outputs[0]!.id = 'body-frames';
    expect(partsFile.safeParse(q).success).toBe(false);
    const conflict = file();
    (conflict.sim.bind as unknown[]).push({
      control: 'spin-angle',
      part: 'earth-body',
      rotate: { axis: [0, 1, 0] },
    });
    expect(partsFile.safeParse(conflict).success).toBe(false);
    const state = file();
    (state.sim.outputs.find((o) => o.id === 'solar-eclipse')!.states as Record<string, unknown>).banana = { en: 'Banana', zh: '香蕉' };
    expect(partsFile.safeParse(state).success).toBe(false);
  });
  it('rejects missing, reordered and inconsistent date rows without using rounded day length', () => {
    for (const edit of [
      (t: typeof solar) => {
        t.days.splice(298, 1);
      },
      (t: typeof solar) => {
        [t.days[0], t.days[1]] = [t.days[1]!, t.days[0]!];
      },
      (t: typeof solar) => {
        t.meta.lat_deg_north = 2;
      },
    ]) {
      const table = structuredClone(solar);
      edit(table);
      const c = orbitRotationSchema.safeParse({
        ...cfg,
        solarYear: { ...cfg.solarYear, table },
      });
      expect(!c.success || orbitTableIssues(c.data).length > 0).toBe(true);
    }
    expect(solve({ lab: 'local-year', 'day-index': 299 })['local-daylight-minutes']).not.toBe(724);
  });
  it('checks every complete chapter/beat configuration: exactly 39 states', async () => {
    const fs = await import('node:fs');
    const path = await import('node:path');
    const yaml = await import('yaml');
    const dir = path.resolve('src/content/topics/sample-orbit/chapters');
    let count = 0;
    for (const f of fs.readdirSync(dir)) {
      const state = yaml.parse(fs.readFileSync(path.join(dir, f), 'utf8').split('---')[1]!).state;
      for (const beat of state.beats) {
        const v = { ...defaults, ...state.sim.set, ...beat.sim.set };
        const q = solveOrbitRotation(cfg, v);
        expect(Object.keys(q)).toHaveLength(23);
        expect(validateBodyFrame(q['body-frame'] as Record<string, number>)).toEqual([]);
        count++;
      }
    }
    expect(count).toBe(39);
  });
});

describe('shared orbit session state restoration', () => {
  async function make() {
    const { createSceneStore } = await import('../../src/engines/core/store');
    const { spaceSceneEngine } = await import('../../src/engines/space-scene');
    const { getOrbitSession } = await import('../../src/engines/space-scene/lib/sim/orbit-session');
    const defaults = {
      chapter: null,
      layers: [],
      camera: null,
      theme: undefined,
      ...spaceSceneEngine.defaults({} as never, { parts: partsFile.parse(raw) } as never),
      sim: { ...defaultsForTest(), lab: 'day', obliquity: 0, 'spin-angle': 0 },
      orbitTime: null,
    };
    const store = createSceneStore<import('../../src/engines/space-scene').SpaceSceneExt>({ chapters: [], defaults: defaults as never });
    const session = getOrbitSession(store, sim)!;
    return { store, session };
  }
  function defaultsForTest() {
    return { ...defaults };
  }
  it('one instance, shared t, pause, display-only scale and control reset', async () => {
    const { store, session } = await make();
    store.getState().patch({ run: true });
    session.tick(0);
    session.tick(0.05);
    expect(session.clock.elapsedSeconds).toBe(1080);
    store.getState().patch({ run: false });
    expect(store.getState().orbitTime).toBe(1080);
    const physical = session.snapshot;
    store.getState().patch({ sim: { ...store.getState().sim, 'scale-mode': 'true-scale' } });
    expect(session.snapshot).toBe(physical);
    expect(session.clock.elapsedSeconds).toBe(1080);
    store.getState().patch({ sim: { ...store.getState().sim, 'spin-angle': 90 } });
    expect(session.clock.elapsedSeconds).toBe(0);
    expect(session.clock.running).toBe(false);
    session.dispose();
  });
  it('seek, invalid seek, background baseline, static lab and presentation restoration', async () => {
    const { store, session } = await make();
    expect(session.seek(21600)).toBe(true);
    expect(session.snapshot.quantities['observer-day']).toBe('boundary');
    expect(session.seek(-1)).toBe(false);
    store.getState().patch({ run: true });
    session.tick(0);
    session.tick(100, true);
    session.tick(100);
    expect(session.clock.elapsedSeconds).toBe(21600);
    const saved = {
      ...store.getState().snapshot(),
      orbitTime: session.clock.elapsedSeconds,
    };
    store.getState().applyState({ sim: { ...defaults, lab: 'eclipse' }, orbitTime: null, run: false }, { instant: true });
    expect(session.clock.elapsedSeconds).toBe(0);
    store.getState().patch({ run: true });
    expect(store.getState().run).toBe(false);
    store.getState().applyState(saved, { instant: true });
    expect(session.clock.elapsedSeconds).toBe(21600);
    expect(session.clock.running).toBe(true);
    session.dispose();
  });
});

describe('orbit URL boundary', () => {
  it('six-decimal orb-t roundtrip, invalid input, and chapter baseline omission', async () => {
    const { encodeSceneState, decodeSceneState } = await import('../../src/engines/core/url-state');
    const pairs = encodeSceneState({
      chapter: 'a-turning-earth',
      orbitTime: 21600.123456,
      run: false,
    });
    expect(new URLSearchParams(pairs).get('orb-t')).toBe('21600.123456');
    expect(decodeSceneState(new URLSearchParams(pairs)).orbitTime).toBe(21600.123456);
    expect(decodeSceneState('orb-t=NaN').orbitTime).toBeUndefined();
    expect(decodeSceneState('orb-t=12.1234567').orbitTime).toBeUndefined();
    expect(decodeSceneState('orb-t=12&run=1').run).toBe(true); // Pause belongs to the orbit runtime, not other engines' codec.
    expect(encodeSceneState({ orbitTime: null })).toEqual([]);
  });
  it('static-comparison labs (rate 0) are still: FLOW and SPACE stay off there only', () => {
    const still = (lab: string) => orbitIsStill({ config: cfg, snapshot: snapshot({ lab }) } as unknown as OrbitSession);
    expect(['coupled', 'day', 'year', 'moon'].map(still)).toEqual([false, false, false, false]);
    expect(['eclipse', 'local-year'].map(still)).toEqual([true, true]);
  });
  it('pure solver stays under one millisecond per evaluation after warmup', () => {
    for (let i = 0; i < 100; i++) solve({}, i);
    const start = performance.now();
    for (let i = 0; i < 1000; i++) solve({}, i);
    const cost = (performance.now() - start) / 1000;
    expect(cost).toBeLessThan(1);
  });
});
