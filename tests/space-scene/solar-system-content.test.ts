/** Production astronomy content: scientific inputs and caption-to-model contracts. */
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { partsFile } from '../../src/engines/space-scene/schema';
import { evaluateSim } from '../../src/engines/space-scene/lib/sim';
import { simEffects } from '../../src/engines/space-scene/lib/sim/bind';
import { resolveSimValues } from '../../src/engines/space-scene/lib/sim/controls';
import type { SimValues } from '../../src/engines/space-scene/sim-schema';
import { AU_KM, C_KM_S, LIGHT_YEAR_KM } from '../../src/engines/space-scene/lib/sim/solar-system';
import { parseStarCatalogue, skySnapshot } from '../../src/engines/space-scene/lib/sim/solar-sky';

const dir = 'src/content/topics/solar-system';
const file = partsFile.parse(JSON.parse(readFileSync(`${dir}/data/parts.json`, 'utf8')));
const sim = file.sim!;
const config = sim.solarSystem!;
type Beat = { run: boolean; labels: string[]; hide?: string[]; layers: string[]; camera: { position: number[]; target: number[]; fov: number }; sim: { set: SimValues; try?: { vary: string; also?: string[] } }; caption: { en: string; zh: string } };
type Chapter = { id: string; order: number; state: Beat & { index: { parts: string[] }; beats: Beat[] }; body: string };
const chapters = readdirSync(`${dir}/chapters`).filter((p) => p.endsWith('.mdx')).sort().map((p): Chapter => {
  const text = readFileSync(join(dir, 'chapters', p), 'utf8');
  const [, front, body] = text.split('---');
  return { ...JSON.parse(front!), body: body! };
});
const chapter = (id: string) => chapters.find((c) => c.id === id)!;
const beat = (id: string, index: number) => chapter(id).state.beats[index - 1]!;
const values = (b: Beat) => resolveSimValues(sim, b.sim.set);
const out = (b: Beat) => evaluateSim(sim, values(b));
const cataloguePath = 'public/catalogues/solar-system/stars-hyg-v41-cc-by-sa.json';
const catalogueText = readFileSync(cataloguePath, 'utf8');
const catalogueRaw = JSON.parse(catalogueText);
const catalogue = parseStarCatalogue(catalogueRaw, config.patterns);
const sources: { id: string; text: { en: string; zh: string }; design?: boolean; url?: string }[] = JSON.parse(readFileSync(`${dir}/data/sources.json`, 'utf8')).sources;
const reference = [
  ['mercury', 2439.4, .38709927, .2408467], ['venus', 6051.8, .72333566, .61519726],
  ['earth', 6371.0084, 1.00000261, 1.0000174], ['mars', 3389.5, 1.52371034, 1.8808476],
  ['jupiter', 69911, 5.202887, 11.862615], ['saturn', 58232, 9.53667594, 29.447498],
  ['uranus', 25362, 19.18916464, 84.016846], ['neptune', 24622, 30.06992276, 164.79132],
] as const;

describe('published solar-system production content', () => {
  it('contains eight chapters and forty independently reproducible paused beats', () => {
    expect(readFileSync(`${dir}/topic.yaml`, 'utf8')).toMatch(/^status: published$/m);
    expect(chapters.map((c) => c.order)).toEqual([0, 1, 2, 3, 4, 5, 6, 7]);
    expect(chapters.flatMap((c) => c.state.beats)).toHaveLength(40);
    const controls = sim.controls.map((c) => c.id).sort();
    for (const c of chapters) for (const b of c.state.beats) {
      expect(b.run).toBe(false);
      expect(Object.keys(b.sim.set).sort()).toEqual(controls);
      expect(b.caption.en.length).toBeGreaterThan(30);
      expect(b.caption.zh.length).toBeGreaterThan(10);
      expect(b.camera.position.every(Number.isFinite)).toBe(true);
      expect(b.camera.target.every(Number.isFinite)).toBe(true);
      expect(b.camera.fov).toBeGreaterThan(10);
      for (const id of b.labels) expect(c.state.index.parts, `${c.id}: ${id}`).toContain(id);
      for (const value of Object.values(out(b))) if (typeof value === 'number') expect(Number.isFinite(value)).toBe(true);
    }
  });
  it('preserves full JPL input precision and classifies only eight planets, with a separate ring', () => {
    expect(config.bodies.map((b) => b.id)).toEqual(['sun', ...reference.map((r) => r[0])]);
    expect(config.bodies[0]).toEqual({ id: 'sun', radiusKm: 700000 });
    for (const [id, radiusKm, aAu, periodYears] of reference) {
      expect(config.bodies.find((b) => b.id === id)).toEqual({ id, radiusKm, aAu, periodYears });
      expect(file.parts.filter((p) => p.id === id)).toHaveLength(1);
      const detail = file.parts.find((p) => p.id === id)!.detail!;
      for (const locale of ['en', 'zh'] as const) {
        expect(detail[locale]).toContain(String(Number(radiusKm.toPrecision(6))));
        expect(detail[locale]).toContain(String(Number(aAu.toPrecision(6))));
        expect(detail[locale]).toContain(String(Number(periodYears.toPrecision(6))));
        expect(detail[locale]).toMatch(/\[[^\]]*S5[^\]]*\]/);
        expect(detail[locale]).toMatch(/\[[^\]]*S6[^\]]*\]/);
      }
    }
    expect(config.bodies.some((b) => (b.id as string) === 'saturn-rings')).toBe(false);
    expect(file.parts.find((p) => p.id === 'saturn-rings')).toBeDefined();
    expect(config.sources).toEqual(['S5', 'S6', 'S37']);
    expect(sources.find((s) => s.id === 'S5')!.url).toBe('https://ssd.jpl.nasa.gov/planets/phys_par.html');
    expect(sources.find((s) => s.id === 'S6')!.url).toBe('https://ssd.jpl.nasa.gov/planets/approx_pos.html');
    expect(sources.find((s) => s.id === 'S37')!.design).toBe(true);
  });
  it('makes every authored label reachable and visible in its beat layers', () => {
    for (const c of chapters) for (const b of c.state.beats) {
      const fx = simEffects(sim, values(b), out(b));
      for (const id of b.labels) {
        const part = file.parts.find((p) => p.id === id)!;
        expect(part, `${c.id}: unknown label ${id}`).toBeDefined();
        expect(b.layers, `${c.id}: hidden group for ${id}`).toContain(part.group);
        expect(b.hide ?? [], `${c.id}: hidden label ${id}`).not.toContain(id);
        expect(fx.hidden.has(id), `${c.id}: binding hides ${id}`).toBe(false);
      }
    }
  });
  it('matches the three scale captions without modifying physical reference inputs', () => {
    const overview = out(beat('reading-a-model', 1));
    const sizes = out(beat('reading-a-model', 2));
    const distances = out(beat('reading-a-model', 3));
    expect([overview['scale-state'], sizes['scale-state'], distances['scale-state']]).toEqual(['overview', 'size-row', 'distance-ruler']);
    expect(sizes['planet-frame']).toEqual(overview['planet-frame']);
    expect(distances['planet-frame']).toEqual(overview['planet-frame']);
    for (const [id, radiusKm, aAu] of reference) {
      expect((sizes[`radius-${id}`] as number) / (sizes['radius-earth'] as number)).toBeCloseTo(radiusKm / 6371.0084, 11);
      expect(distances[`radius-${id}`]).toBeCloseTo(radiusKm * 10 / AU_KM, 11);
      expect((distances['display-positions'] as Record<string, number>)[`${id}:x`]).toBeCloseTo(aAu * 10, 11);
    }
    expect(AU_KM / (2 * 6371.0084) * .01).toBeCloseTo(117.40517458743265, 8);
    const year = out(beat('eight-worlds', 6))['planet-frame'] as Record<string, number>;
    expect(year['mercury.turns']).toBeGreaterThan(year['earth.turns']!);
    expect(year['earth.turns']).toBeGreaterThan(year['neptune.turns']!);
  });
  it('backs the twinkle and anti-solar tail captions with distinct numeric states', () => {
    const cases = chapter('through-the-air').state.beats.map(out);
    expect(cases.map((o) => o['twinkle-flux'])).toEqual([1, 1.1, 1.01, 1.3, .99]);
    expect(cases[0]!['twinkle-state']).toBe('steady');
    expect(cases[2]!['twinkle-state']).toBe('disc-averaged');
    const comet = out(beat('smaller-companions', 4));
    const x = (comet['comet-positions'] as Record<string, number>)['comet-nucleus:x']!;
    const angle = (comet['comet-angle'] as number) * Math.PI / 180;
    expect(x).toBeCloseTo(-4.8, 12);
    expect(Math.cos(angle) * x).toBeGreaterThan(0);
  });
  it('changes the received twinkle glow while keeping both source glows steady', () => {
    const noAir = beat('through-the-air', 1), point = beat('through-the-air', 2), disc = beat('through-the-air', 3);
    const effects = [noAir, point, disc].map((b) => simEffects(sim, values(b), out(b)));
    const fluxBindings = sim.bind.filter((b) => b.output === 'twinkle-flux' && 'part' in b && b.glow);
    expect(fluxBindings).toHaveLength(1);
    expect(fluxBindings[0]).toMatchObject({ part: 'observer-eye' });
    for (const id of ['star-source', 'disc-source']) {
      expect(effects[0]!.glow.get(id)).toEqual(effects[1]!.glow.get(id));
      expect(effects[1]!.glow.get(id)).toEqual(effects[2]!.glow.get(id));
    }
    const received = effects.map((fx) => fx.glow.get('observer-eye')!.level);
    expect(received[1]).toBeGreaterThan(received[0]!);
    expect(received[1]).toBeGreaterThan(received[2]!);
    expect(received[2]).toBeGreaterThan(received[0]!);
  });
  it('shows four continuous disc-source paths only with air and an apparent disc', () => {
    const rays = file.parts.find((p) => p.id === 'disc-rays')!;
    const paths = [rays.primitive!, ...(rays.extra ?? [])];
    expect(paths).toHaveLength(4);
    const endpoints: number[][] = [];
    for (const p of paths) {
      if (p.kind !== 'tube') throw new Error('disc sample must be one continuous tube');
      expect(p.path!.length).toBeGreaterThanOrEqual(3);
      expect(p.path!.every((point) => point.every(Number.isFinite))).toBe(true);
      expect(p.path!.at(-1)).toEqual([3, -1, 0]);
      endpoints.push(p.path![0]!);
    }
    expect(new Set(endpoints.map((p) => p.join(','))).size).toBe(4);
    const point = beat('through-the-air', 2), disc = beat('through-the-air', 3);
    expect(simEffects(sim, values(point), out(point)).hidden.has('disc-rays')).toBe(true);
    expect(simEffects(sim, values(disc), out(disc)).hidden.has('disc-rays')).toBe(false);
    const noAir = { ...disc, sim: { set: { ...disc.sim.set, atmosphere: false } } };
    expect(simEffects(sim, values(noAir), out(noAir)).hidden.has('disc-rays')).toBe(true);
  });
  it('exposes the representative galactic arm bands and central bar above the opaque disc', () => {
    const galaxy = file.parts.find((p) => p.id === 'galaxy-disc')!;
    const disc = galaxy.primitive!;
    if (disc.kind !== 'sphere') throw new Error('disc expected as flattened ellipsoid');
    const discTop = disc.at[1] + disc.size![0]! * disc.scale![1]!;
    const arms = galaxy.extra ?? [];
    expect(arms.length).toBeGreaterThan(0);
    for (const arm of arms) {
      if (arm.kind !== 'tube') throw new Error('arm expected as continuous band');
      for (const p of arm.path!) expect(p[1] - Number(arm.radius)).toBeGreaterThanOrEqual(discTop - 1e-9);
    }
    const bar = file.parts.find((p) => p.id === 'galaxy-bar')!.primitive!;
    expect(bar.at[1]).toBeGreaterThan(discTop);
  });
  it('keeps camera and hide transitions in authored beats rather than unsafe try-it controls', () => {
    for (const c of chapters) {
      const card = c.state.sim.try;
      if (!card) continue;
      const controls = [card.vary, ...(card.also ?? [])];
      for (const control of ['lab', 'scale-mode', 'sky-target', 'depth']) expect(controls, c.id).not.toContain(control);
    }
    // The backend still accepts these controls for authored snapshots and fixtures.
    for (const control of ['lab', 'scale-mode', 'sky-target', 'depth']) expect(sim.controls.map((c) => c.id)).toContain(control);
  });
  it('uses the same clock for daily/annual sky comparisons and leaves planetary phases independent', () => {
    const a = beat('a-turning-viewpoint', 1), b = beat('a-turning-viewpoint', 2), d = beat('a-turning-viewpoint', 4);
    expect(b.sim.set['sky-date']).toBe(a.sim.set['sky-date']);
    expect((b.sim.set['sky-hour'] as number) - (a.sim.set['sky-hour'] as number)).toBe(2);
    expect(d.sim.set['sky-hour']).toBe(a.sim.set['sky-hour']);
    expect(d.sim.set['sky-date']).not.toBe(a.sim.set['sky-date']);
    expect(out(a)['planet-frame']).toEqual(out(b)['planet-frame']);
    expect(out(a)['planet-frame']).toEqual(out(d)['planet-frame']);
  });
  it('places the three teaching patterns above the Singapore horizon at their authored times', () => {
    const cases = [
      [2, 'orion', '27989', '2026-01-15T12:00:00.000Z', .7608133803148511, .11407335275025393, .6388663948950563],
      [3, 'crux', '60718', '2026-04-15T14:00:00.000Z', .22053046393280815, -.9007473073538109, .37419326927730767],
      [4, 'scorpius', '80763', '2026-07-15T14:00:00.000Z', .0028003402834782783, -.4658646550030875, .8848515589143474],
    ] as const;
    for (const [index, target, hip, utc, east, north, up] of cases) {
      const b = beat('singapore-star-patterns', index);
      expect(b.sim.set['sky-target']).toBe(target);
      const sky = skySnapshot(config, values(b), catalogue);
      expect(sky.utc).toBe(utc);
      const star = sky.rows.find((s) => s.hip === hip)!;
      expect(star.shown).toBe(true);
      expect(star.east).toBeCloseTo(east, 10);
      expect(star.north).toBeCloseTo(north, 10);
      expect(star.up).toBeCloseTo(up, 10);
      const hips = new Set(config.patterns[target].flat());
      expect(sky.rows.filter((s) => hips.has(s.hip)).every((s) => s.shown)).toBe(true);
    }
    const linked = beat('singapore-star-patterns', 4), unlinked = beat('singapore-star-patterns', 5);
    expect(skySnapshot(config, values(linked), catalogue).rows).toEqual(skySnapshot(config, values(unlinked), catalogue).rows);
    const depth = skySnapshot(config, values(beat('singapore-star-patterns', 6)), catalogue);
    expect(depth.depth).toBe(true);
    for (const s of depth.rows.filter((s) => s.shown)) expect(Math.hypot(...s.position)).toBeCloseTo(s.dist! * .02, 9);
  });
  it('distinguishes a light-year length, light time and the rough galactic diameter target', () => {
    const au = out(beat('beyond-the-planets', 2)), proxima = out(beat('beyond-the-planets', 3)), galaxy = out(beat('beyond-the-planets', 4));
    expect(au['light-distance-km']).toBe(AU_KM);
    expect(au['light-time-seconds']).toBeCloseTo(499.004783836, 9);
    expect(proxima['light-distance-km']).toBe(4.24 * LIGHT_YEAR_KM);
    expect(galaxy['light-distance-km']).toBe(100000 * LIGHT_YEAR_KM);
    expect((galaxy['light-distance-km'] as number) / C_KM_S).toBe(galaxy['light-time-seconds']);
  });
  it('keeps the HYG sidecar independent, attributed and without NC prose or original pattern edges', () => {
    expect(catalogue.stars).toHaveLength(28);
    expect(catalogueRaw.meta.licence).toBe('CC BY-SA 4.0');
    expect(catalogueRaw.meta.credit).toMatch(/David Nash.*Astronexus/);
    expect(catalogueRaw.meta.sourceSha256).toBe('d9f69fd86bbf90a4e4d52b4c5c53eacfa6dfc0bfdef85bfd94f095e0bebe4ebd');
    expect(catalogueRaw).not.toHaveProperty('patterns');
    for (const s of catalogueRaw.stars) {
      expect(s).not.toHaveProperty('summary');
      expect(s).not.toHaveProperty('detail');
      expect(s).not.toHaveProperty('caption');
      expect(s).not.toHaveProperty('en');
      expect(s).not.toHaveProperty('zh');
    }
    expect(catalogueText).not.toMatch(/CC BY-NC-SA/);
    expect(readdirSync(`${dir}/data`)).not.toContain('stars-hyg-v41-cc-by-sa.json');
    expect(file.sim!.overlays!.find((o) => o.kind === 'catalogue-sky')).toMatchObject({ catalogue: 'stars-hyg-v41-cc-by-sa.json', radius: 5 });
  });
  it('keeps figure assets and reusable-topic links explicit, local and source-backed', () => {
    const bodies = chapters.map((c) => c.body).join('\n');
    const sourceIds = new Set(sources.map((s) => s.id));
    for (const match of bodies.matchAll(/<Num s="([^"]+)"/g)) for (const id of match[1]!.split(',')) expect(sourceIds.has(id)).toBe(true);
    for (const [chapterId, figure] of [['smaller-companions', 'solar-system-comet-tails'], ['beyond-the-planets', 'solar-system-milky-way']]) {
      expect(chapter(chapterId!).body).toContain(`<Figure src="figures/${figure}"`);
      expect(existsSync(`public/illustrations/figures/${figure}.webp`)).toBe(true);
    }
    for (const target of ['a-turning-earth', 'a-tilted-year', 'one-moon-many-views']) expect(bodies).toContain(`<TopicLink slug="sun-earth-moon" ch="${target}">`);
    expect(chapters.map((c) => c.id)).not.toContain('alignment-and-eclipses');
    expect(chapters.map((c) => c.id)).not.toContain('one-moon-many-views');
    expect(JSON.stringify(sim)).not.toContain('orbitRotation');
  });
});
