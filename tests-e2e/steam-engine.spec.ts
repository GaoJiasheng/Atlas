/** Production steam-engine: docs/52 content, actual drawn members, synchronized ports and recovery.
 * Browser gates are run by the main session with ATLAS_E2E_PORT=5421 after build. */
import { readFileSync } from 'node:fs';
import { expect, test, type Page } from '@playwright/test';
import type { MechanismGeometry } from '../src/engines/space-scene/mechanism-schema';
import { solveMechanism } from '../src/engines/space-scene/lib/mechanism';

type Point = [number, number, number];
type Frame = {
  thetaRad: number; phaseDeg: number; cycles: number; shaftTurns: number;
  pistonDirection: 'up' | 'down' | 'switch';
  planetAngleRad: number; sunAngleRad: number;
  points: Record<string, Point>; ports: Record<string, boolean>; gates: Record<string, boolean>;
  linkResidualM: number; clearanceMarginM: number;
  parts: Record<string, { matrix: number[]; endpoints?: number[][] }>;
};
type Engine = {
  mechanism(id: string): Frame | null;
  seekMechanism(id: string, deg: number): boolean;
  sim(): { values: Record<string, string | number | boolean>; set: Record<string, unknown>; outputs: Record<string, number | string> };
  setSim(values: Record<string, string | number | boolean>): boolean;
  apply(patch: Record<string, unknown>): boolean;
  flow(id: string): { paths: Record<string, { visible: boolean }> } | null;
  copies(id: string): number | null;
  anchor(id: string): { x: number; y: number; shown: boolean } | null;
};
const fixture = JSON.parse(readFileSync(new URL('../src/content/topics/steam-engine/data/parts.json', import.meta.url), 'utf8'));
const geometry = fixture.mechanisms[0].geometry as MechanismGeometry;
const read = (page: Page) => page.evaluate(() => (window.__atlas!.engine as unknown as Engine).mechanism('main-engine'));
const sim = (page: Page) => page.evaluate(() => (window.__atlas!.engine as unknown as Engine).sim());
const set = (page: Page, values: Record<string, number | string | boolean>) => page.evaluate(v => (window.__atlas!.engine as unknown as Engine).setSim(v), values);
async function open(page: Page, query = 'ch=power-both-ways&b=1', lang = 'en') {
  await page.goto(`/${lang}/topics/steam-engine/?${query}`);
  await page.waitForFunction(() => window.__atlas !== undefined, null, { timeout: 30_000 });
  expect(await page.evaluate(() => window.__atlas!.ready)).toBe(true);
  await expect.poll(() => read(page)).not.toBeNull();
}
async function seek(page: Page, angle: number) {
  expect(await page.evaluate(deg => (window.__atlas!.engine as unknown as Engine).seekMechanism('main-engine', deg), angle)).toBe(true);
  const theta = angle * Math.PI / 180;
  await expect.poll(async () => Math.abs((await read(page))!.thetaRad - theta), { timeout: 30_000 }).toBeLessThan(1e-12);
  return (await read(page))!;
}
const distance = (a: number[], b: number[]) => Math.hypot(...a.map((n, i) => n - b[i]!));
const transform = (p: number[], m: number[]) => [m[0]! * p[0]! + m[4]! * p[1]! + m[8]! * p[2]! + m[12]!, m[1]! * p[0]! + m[5]! * p[1]! + m[9]! * p[2]! + m[13]!, m[2]! * p[0]! + m[6]! * p[1]! + m[10]! * p[2]! + m[14]!];
const links: [string, string, string, number][] = [['beam','A','K',2.5],['parallel-inner','C','E',.8],['parallel-outer','B','D',.8],['parallel-bottom','E','D',1.25],['radius-rod','F','E',1.25],['drive-rod','K','P',3],['centre-link','O','P',geometry.orbitM],['piston-rod','S','D',2.4],['pump-rod','Q','W',4.5]];
function checkFrame(f: Frame) {
  expect(f.linkResidualM).toBeLessThan(1e-9);
  expect(f.clearanceMarginM).toBeGreaterThan(.002);
  expect(Math.abs(f.sunAngleRad + f.planetAngleRad - 2 * f.thetaRad)).toBeLessThan(1e-10);
  for (const [id, a, b, length] of links) {
    const drawn = f.parts[id]!.endpoints!;
    expect(drawn, `${id} exposes actual drawn endpoints`).toHaveLength(2);
    expect(Math.abs(distance(drawn[0]!, drawn[1]!) - length), id).toBeLessThan(1e-9);
    for (const [i, key] of [a, b].entries()) for (const axis of [0, 1]) expect(Math.abs(drawn[i]![axis]! - f.points[key]![axis]!), `${id} endpoint ${key}`).toBeLessThan(1e-9);
    // The matrix must be a rigid isometry, not a hidden scale of the rod.
    const m = f.parts[id]!.matrix;
    for (const offset of [0, 4, 8]) expect(Math.hypot(m[offset]!, m[offset + 1]!, m[offset + 2]!)).toBeCloseTo(1, 12);
  }
  for (const role of ['piston','pumpPiston','planet','sun','shaft','flywheel']) {
    const binding = fixture.mechanisms[0].parts[role], primitive = fixture.parts.find((p: { id: string }) => p.id === binding.part).primitive;
    const drawn = transform(primitive.at, f.parts[binding.part]!.matrix);
    const key = role === 'piston' ? 'S' : role === 'pumpPiston' ? 'W' : role === 'planet' ? 'P' : 'O';
    for (const axis of [0, 1]) expect(Math.abs(drawn[axis]! - f.points[key]![axis]!), role).toBeLessThan(1e-9);
  }
  const down = f.pistonDirection === 'down', up = f.pistonDirection === 'up';
  expect(f.ports).toEqual({ upperIn: down, lowerIn: up, upperOut: up, lowerOut: down });
  expect(f.gates).toEqual({ 'port-steam:upper': down, 'port-steam:lower': up, 'exhaust-steam:upper': up, 'exhaust-steam:lower': down });
  for (const [role, binding] of Object.entries(fixture.mechanisms[0].ports) as [string, { part: string; openOffset: number[] }][]) {
    const m = f.parts[binding.part]!.matrix;
    for (const axis of [0, 1, 2]) expect(m[12 + axis]).toBeCloseTo(f.ports[role] ? binding.openOffset[axis]! : 0, 12);
  }
}
function deadpoint(lo: number, hi: number) {
  const sign = Math.sign(solveMechanism(lo, geometry).derivativeM);
  for (let i = 0; i < 48; i++) {
    const mid = (lo + hi) / 2;
    if (Math.sign(solveMechanism(mid, geometry).derivativeM) === sign) lo = mid; else hi = mid;
  }
  return ((lo + hi) / 2) * 180 / Math.PI;
}

test.describe('steam-engine shared rigid frame', () => {
  test.beforeEach(async ({ page }) => { await page.setViewportSize({ width: 1600, height: 900 }); });

  test('nine pressure rows use both faces, atmosphere and the rod area', async ({ page }) => {
    await open(page, 'ch=keep-hot-and-cold-apart');
    const area = Math.PI * .47625 ** 2 / 4, rod = Math.PI * .04 ** 2 / 4;
    for (const cold of [20, 50, 80]) for (const rate of [8, 10, 12]) {
      expect(await set(page, { 'cold-pressure': cold, 'cycle-rate': rate })).toBe(true);
      const out = (await sim(page)).outputs;
      const fd = 110 * (area - rod) + 101.325 * rod - cold * area, fu = 110 * area - cold * (area - rod) - 101.325 * rod;
      expect(out['force-down']).toBeCloseTo(fd, 10);
      expect(out['force-up']).toBeCloseTo(fu, 10);
      expect(out['newcomen-force']).toBeCloseTo((101.325 - cold) * area, 10);
      expect(out['work-cycle']).toBeCloseTo((fd + fu) * 1.2192, 10);
      expect(out['indicated-power']).toBeCloseTo((fd + fu) * 1.2192 * rate / 60, 10);
    }
    expect(await set(page, { 'phase-deg': 45.5 })).toBe(false);
    expect(await set(page, { 'cycle-rate': 11 })).toBe(false);
    await expect(page.locator('.space-try [data-sim-record]')).toBeVisible();
  });

  test('full-turn sweep reads actual endpoints, rigid matrices, gear phase and four valve cores', async ({ page }) => {
    test.setTimeout(120_000);
    await open(page);
    for (let angle = 0; angle <= 360; angle += 10) checkFrame(await seek(page, angle));
    const end = await seek(page, 360);
    expect(end.phaseDeg).toBe(0); expect(end.cycles).toBe(1); expect(end.shaftTurns).toBeCloseTo(2, 12);
    const anchors = await page.evaluate(() => {
      const e = window.__atlas!.engine as unknown as Engine;
      return ['beam','piston','planet','sun'].map(id => e.anchor(id));
    });
    expect(anchors.every(Boolean)).toBe(true);
  });

  test('non-cardinal deadpoints close all four rendered paths immediately', async ({ page }) => {
    await open(page);
    await page.evaluate(() => window.__atlas!.setMode('flow', true, { instant: true }));
    for (const angle of [90, 270]) expect((await seek(page, angle)).pistonDirection).not.toBe('switch');
    for (const angle of [deadpoint(1.4, 1.8), deadpoint(4.5, 4.9)]) {
      const before = await seek(page, angle - .1);
      expect(Object.values(before.ports).filter(Boolean)).toHaveLength(2);
      const closed = await seek(page, angle);
      expect(closed.pistonDirection).toBe('switch'); checkFrame(closed);
      await expect.poll(() => page.evaluate(() => {
        const e = window.__atlas!.engine as unknown as Engine;
        return ['port-steam','exhaust-steam'].flatMap(id => Object.values(e.flow(id)?.paths ?? {}).map(p => p.visible));
      })).toEqual([false, false, false, false]);
      const after = await seek(page, angle + .1);
      expect(after.pistonDirection).not.toBe(before.pistonDirection);
      await expect.poll(() => page.evaluate(() => {
        const e = window.__atlas!.engine as unknown as Engine;
        const f = e.mechanism('main-engine')!;
        return Object.entries(f.gates).every(([key, value]) => { const [flow, path] = key.split(':'); return e.flow(flow!)?.paths[path!]!.visible === value; });
      })).toBe(true);
    }
  });

  test('QA fractional seek holds, keeps URL and controls legal, rejects invalid values without state changes', async ({ page }) => {
    await open(page);
    const before = await page.evaluate(() => ({ url: location.search, set: (window.__atlas!.engine as unknown as Engine).sim().set }));
    const fractional = await seek(page, 45.5); checkFrame(fractional);
    await page.waitForTimeout(100);
    expect((await read(page))!.thetaRad).toBe(fractional.thetaRad);
    const invalid = await page.evaluate(() => {
      const e = window.__atlas!.engine as unknown as Engine;
      return [e.seekMechanism('main-engine', NaN), e.seekMechanism('main-engine', -1), e.seekMechanism('main-engine', 361), e.seekMechanism('unknown', 90), e.seekMechanism('main-engine', Infinity)];
    });
    expect(invalid).toEqual([false, false, false, false, false]);
    expect((await read(page))!.thetaRad).toBe(fractional.thetaRad);
    expect(await page.evaluate(() => ({ url: location.search, set: (window.__atlas!.engine as unknown as Engine).sim().set }))).toEqual(before);
    await set(page, { 'phase-deg': 180 });
    await expect.poll(async () => (await read(page))!.phaseDeg).toBe(180);
  });

  test('manual deep links and axis beat changes produce the same frame; explicit sim overrides the beat', async ({ page }) => {
    await open(page, 'ch=power-both-ways&b=3');
    const linked = (await read(page))!;
    expect(linked.phaseDeg).toBe(180); checkFrame(linked);
    await page.locator('.atlas-axis__tick[data-beat="power-both-ways.0"]').click();
    await expect.poll(async () => (await read(page))!.phaseDeg).toBe(0);
    await page.locator('.atlas-axis__tick[data-beat="power-both-ways.2"]').click();
    await expect.poll(async () => (await read(page))!.phaseDeg).toBe(180);
    expect((await read(page))!.points).toEqual(linked.points);
    await open(page, 'ch=power-both-ways&b=3&sim=experiment.mechanism~motion-mode.manual~phase-deg.90');
    expect((await read(page))!.phaseDeg).toBe(90);
    expect((await sim(page)).values['phase-deg']).toBe(90);
  });

  test('auto rate changes stay continuous; unrelated table controls preserve phase and RUN freezes immediately', async ({ page }) => {
    await open(page, 'ch=sun-and-planet&b=4');
    await expect.poll(async () => (await read(page))!.thetaRad).toBeGreaterThan(.01);
    const sample = await page.evaluate(async () => {
      const e = window.__atlas!.engine as unknown as Engine;
      const raf = () => new Promise<void>(r => requestAnimationFrame(() => r()));
      const before = e.mechanism('main-engine')!.thetaRad;
      e.setSim({ 'cycle-rate': 12, 'cold-pressure': 50, 'work-share': 30, 'governor-rpm': 120 });
      const immediate = e.mechanism('main-engine')!.thetaRad;
      await raf(); await raf();
      const after = e.mechanism('main-engine')!.thetaRad;
      window.__atlas!.setPaused(true);
      await raf(); await raf();
      const frozen = e.mechanism('main-engine')!.thetaRad;
      await new Promise(r => setTimeout(r, 200));
      return { before, immediate, after, frozen, later: e.mechanism('main-engine')!.thetaRad };
    });
    expect(sample.immediate).toBe(sample.before);
    expect(sample.after).toBeGreaterThan(sample.before);
    expect(sample.after - sample.before).toBeLessThan(.4);
    expect(sample.later).toBe(sample.frozen);
    expect(await page.evaluate(() => window.__atlas!.commands().some(c => c.id === 'sim-replay'))).toBe(false);
  });

  test('each protective mode freezes an actually moving auto clock and resumes from that phase', async ({ page }) => {
    await open(page, 'ch=sun-and-planet&b=4');
    for (const protection of ['reference', 'exploded', 'isolate', 'solo']) {
      await page.evaluate(() => window.__atlas!.setPaused(false));
      const start = (await read(page))!.thetaRad;
      await expect.poll(async () => (await read(page))!.thetaRad).toBeGreaterThan(start + .005);
      const result = await page.evaluate(async id => {
        const a = window.__atlas!, e = a.engine as unknown as Engine;
        const raf = () => new Promise<void>(resolve => requestAnimationFrame(() => resolve()));
        const moving = e.mechanism('main-engine')!.thetaRad;
        if (id === 'isolate') e.apply({view:'isolate',part:'beam'});
        else if (id === 'solo') e.apply({solo:'beam'});
        else a.setMode(id,true,{instant:true});
        await raf(); await raf();
        const frozen = e.mechanism('main-engine')!.thetaRad;
        await new Promise(resolve => setTimeout(resolve,120));
        const held = e.mechanism('main-engine')!.thetaRad;
        if (id === 'isolate' || id === 'solo') e.apply({view:'assembled',part:null,solo:null});
        else a.setMode(id,false,{instant:true});
        // Pause in the same task, before any post-exit frame: exact restored phase can be inspected.
        a.setPaused(true);
        await raf(); await raf();
        return {moving,frozen,held,restored:e.mechanism('main-engine')!.thetaRad};
      }, protection);
      expect(result.frozen).toBe(result.moving);
      expect(result.held).toBe(result.frozen);
      expect(result.restored).toBe(result.frozen);
    }
  });

  test('P restores both an arbitrary phase and its QA hold', async ({ page }) => {
    await open(page);
    await set(page, { 'motion-mode': 'auto' });
    await page.evaluate(() => window.__atlas!.setMode('flow', true, { instant: true }));
    const saved = await seek(page, 137.25);
    await page.keyboard.press('p');
    await expect.poll(() => page.evaluate(() => window.__atlas!.state().presentation), { timeout: 30_000 }).not.toBeNull();
    await page.keyboard.press('p');
    await expect.poll(() => page.evaluate(() => window.__atlas!.state().presentation), { timeout: 30_000 }).toBeNull();
    await expect.poll(async () => (await read(page))!.thetaRad, { timeout: 30_000 }).toBe(saved.thetaRad);
    await page.waitForTimeout(100);
    expect((await read(page))!.thetaRad).toBe(saved.thetaRad);
    await set(page, {'phase-deg':90});
    await expect.poll(async () => (await read(page))!.thetaRad).toBeGreaterThan(Math.PI/2);
  });

  test('three duration-zero governor positions and three visible energy counts', async ({ page }) => {
    await open(page, 'ch=speed-feedback');
    await page.evaluate(() => window.__atlas!.setPreset('governor-view', {instant:true}));
    for (const [n, rise, opening] of [[60,.503019594234333,84.92403502048649],[90,.7791198196597037,50],[120,.8757548985585832,36.26315839616716]]) {
      await set(page, { 'governor-rpm': n! });
      const out = (await sim(page)).outputs;
      expect(out['collar-rise']).toBeCloseTo(rise!, 10);
      expect(out['throttle-opening']).toBeCloseTo(opening!, 10);
      const c=9.81/(.5*(2*Math.PI*n!/60)**2), r=.5*Math.sqrt(1-c*c), h=1-c;
      const endpoint={top:[1,3,.9],left:[1-r,3-.5*c,.9],right:[1+r,3-.5*c,.9],collar:[1,2+h,.9]};
      const middle=(a:number[],b:number[])=>a.map((v,i)=>(v+b[i]!)/2);
      const centres:Record<string,number[]>={
        'governor-balls':endpoint.left,'governor-ball-right':endpoint.right,'governor-collar':endpoint.collar,
        'throttle-link':endpoint.collar,'governor-upper':middle(endpoint.top,endpoint.left),
        'governor-upper-right':middle(endpoint.top,endpoint.right),'governor-lower':middle(endpoint.left,endpoint.collar),
        'governor-lower-right':middle(endpoint.right,endpoint.collar),
      };
      // Existing anchor API reads the actual pose-transformed parts; compare with independent perspective projection.
      await expect.poll(async () => page.evaluate(points => {
        const e=window.__atlas!.engine as unknown as Engine;
        const canvas=document.querySelector<HTMLCanvasElement>('.atlas-stage canvas')!;
        const W=canvas.clientWidth,H=canvas.clientHeight;
        // CameraRig fits named presets to the actual canvas aspect; use that
        // drawn camera rather than assuming the author's 16:9 reference pose.
        const camera=(window.__atlas!.stats() as unknown as {camera:{position:number[];target:number[];fov:number}}).camera;
        const eye=camera.position,target=camera.target;
        const normalize=(v:number[])=>{const l=Math.hypot(...v);return v.map(n=>n/l);};
        const forward=normalize(target.map((n,i)=>n-eye[i]!));
        const right=normalize([-forward[2]!,0,forward[0]!]);
        const up=[right[1]!*forward[2]!-right[2]!*forward[1]!,right[2]!*forward[0]!-right[0]!*forward[2]!,right[0]!*forward[1]!-right[1]!*forward[0]!];
        const dot=(a:number[],b:number[])=>a.reduce((sum,n,i)=>sum+n*b[i]!,0),focal=H/2/Math.tan(camera.fov*Math.PI/360);
        return Math.max(...Object.entries(points).map(([id,p])=>{
          const a=e.anchor(id);if(!a?.shown)return Infinity;
          const v=p.map((n,i)=>n-eye[i]!),depth=dot(v,forward);
          return Math.hypot(a.x-(W/2+dot(v,right)*focal/depth),a.y-(H/2-dot(v,up)*focal/depth));
        }));
      },centres)).toBeLessThan(1);
    }
    for (const pose of Object.values(fixture.poses) as { duration: number }[]) expect(pose.duration).toBe(0);
    await page.evaluate(() => { const a = window.__atlas!; const n = a.beats().findIndex(b => b.chapter === 'follow-the-energy' && b.index === 2); a.goToBeat(n, { instant: true }); });
    for (const work of [10,20,30]) {
      await set(page, { 'work-share':work });
      const out = (await sim(page)).outputs;
      expect(Number(out['useful-work']) + Number(out['heat-out'])).toBe(100);
      await expect.poll(() => page.evaluate(() => { const e=window.__atlas!.engine as unknown as Engine; return [e.copies('energy-input'),e.copies('energy-work'),e.copies('energy-reject')]; })).toEqual([100,work,100-work]);
    }
  });

  test('reduced motion stays still while manual phase remains usable, in Chinese cinema', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await open(page, 'ch=sun-and-planet&b=4&theme=cinema', 'zh');
    const stopped = (await read(page))!.thetaRad;
    await page.waitForTimeout(200);
    expect((await read(page))!.thetaRad).toBe(stopped);
    await set(page, { 'motion-mode':'manual','phase-deg':270 });
    await expect.poll(async () => (await read(page))!.phaseDeg).toBe(270);
    checkFrame((await read(page))!);
    await expect(page.locator('[data-hud-panel="reader"]')).toContainText('从摆动到转动');
  });

  test('all chapters, beats, full indexes and the four prediction/record cards are reachable', async ({ page }) => {
    test.setTimeout(240_000); // 56 index selections; each waits for rendered frames
    await open(page, 'ch=before-you-start');
    const chapters = ['before-you-start', 'atmospheric-push', 'keep-hot-and-cold-apart', 'power-both-ways', 'parallel-motion', 'sun-and-planet', 'speed-feedback', 'follow-the-energy'];
    expect(await page.evaluate(() => window.__atlas!.chapters())).toEqual(chapters);
    expect(await page.evaluate(() => window.__atlas!.beats().length)).toBe(36);
    const counts = [4, 5, 5, 5, 4, 5, 4, 4];
    const cards = new Set(['keep-hot-and-cold-apart', 'power-both-ways', 'speed-feedback', 'follow-the-energy']);
    const allIndexed = new Set<string>();
    for (const [i, id] of chapters.entries()) {
      await page.evaluate(ch => window.__atlas!.goToChapter(ch, { instant: true }), id);
      expect(await page.evaluate(ch => window.__atlas!.beats().filter(b => b.chapter === ch).length, id)).toBe(counts[i]);
      await expect(page.locator('.space-try')).toHaveCount(cards.has(id) ? 1 : 0);
      if (cards.has(id)) {
        await expect(page.locator('.space-try [data-predict]')).toHaveCount(3);
        await expect(page.locator('.space-try [data-sim-record]')).toHaveCount(1);
        await expect(page.locator('[data-sim-replay]')).toHaveCount(0);
      }
      const index = page.locator('.space-index__row[data-part]');
      const ids = await index.evaluateAll(rows => rows.map(row => row.getAttribute('data-part')!));
      ids.forEach(part => allIndexed.add(part));
      if (id === 'before-you-start' || id === 'speed-feedback') expect(ids).toHaveLength(14);
      // Select every entry, including right-side governor rods and the two flexible chains.
      for (const part of ids) {
        const row = page.locator(`.space-index__row[data-part="${part}"]`);
        await row.click({ force: true }); // skip the stable-frame wait: the index is plain DOM
        await expect(row).toHaveAttribute('aria-pressed', 'true');
      }
    }
    expect(allIndexed.size).toBe(56);
    // Sister links to the history topic (chapters 02, 03, 06 and two in 07), each to a real chapter.
    const irLinks = await page.locator('a[href*="/topics/industrial-revolution/"]').evaluateAll(links => links.map(a => new URL(a.getAttribute('href')!, location.href).search).sort());
    expect(irLinks).toEqual(['?ch=ir-connected-world-debates', '?ch=ir-railways-networks', '?ch=ir-seas-signals', '?ch=ir-thread-coal-power', '?ch=ir-thread-coal-power']);
  });
});
