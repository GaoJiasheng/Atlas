/** Offline regression for the sound polish pass. Uses the production projection,
 * HUD-room and leader solvers; panel/text bounds below are conservative fixtures,
 * not a claim that a browser has measured the DOM. */
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { parse as yaml } from 'yaml';
import { PerspectiveCamera, Vector3 } from 'three';
import { solveHudRoom } from '../../src/engines/core/hud-room';
import type { OrbitCamera } from '../../src/engines/core/types';
import { spaceSceneData, type Part } from '../../src/engines/space-scene/schema';
import { fitCameraToAspect } from '../../src/engines/space-scene/lib/camera';
import { fitCameraToHud, freeStageRect, type FrameBox, type FrameRect } from '../../src/engines/space-scene/lib/hud-framing';
import { layoutLeaders, type LeaderItem } from '../../src/engines/space-scene/lib/leader-layout';
import { partBounds } from '../../src/engines/space-scene/lib/parts';
import { evaluateSim } from '../../src/engines/space-scene/lib/sim';
import { simEffects } from '../../src/engines/space-scene/lib/sim/bind';
import { resolveSimValues } from '../../src/engines/space-scene/lib/sim/controls';
import { anchorPoint } from '../../src/engines/space-scene/stages/model3d/shapes';

const dir = join(import.meta.dirname, '../../src/content/topics/sound');
const read = (name: string) => JSON.parse(readFileSync(join(dir, 'data', name), 'utf8'));
const file = spaceSceneData.parse({ parts: read('parts.json'), sources: read('sources.json') }).parts;
const sim = file.sim!;
const chapters = readdirSync(join(dir, 'chapters')).filter(f => f.endsWith('.mdx')).sort().map(name => {
  const front = readFileSync(join(dir, 'chapters', name), 'utf8').split(/^---$/m)[1]!;
  return yaml(front);
});
const part = (id: string) => file.parts.find(p => p.id === id)!;
const frameBox = (p: Part): FrameBox => {
  const b = partBounds(p)!;
  return { center: b.min.map((v, i) => (v + b.max[i]!) / 2) as [number, number, number],
    half: b.min.map((v, i) => (b.max[i]! - v) / 2) as [number, number, number] };
};
function camera(cam: OrbitCamera, w: number, h: number) {
  const c = new PerspectiveCamera(cam.fov, w / h, .001, 1000);
  c.position.fromArray(cam.position); c.lookAt(...cam.target); c.updateMatrixWorld();
  return c;
}
function projectBox(b: FrameBox, c: PerspectiveCamera, w: number, h: number): FrameRect {
  const pts = Array.from({ length: 8 }, (_, k) => new Vector3(...b.center.map((v, i) => v + (k & 1 << i ? 1 : -1) * b.half[i]!) as [number, number, number]).project(c));
  return { x0: Math.min(...pts.map(p => (p.x + 1) * w / 2)), x1: Math.max(...pts.map(p => (p.x + 1) * w / 2)),
    y0: Math.min(...pts.map(p => (1 - p.y) * h / 2)), y1: Math.max(...pts.map(p => (1 - p.y) * h / 2)) };
}
function shown(ch: number, beat: number) {
  const base = chapters[ch]!.state, b = base.beats[beat]!, state = { ...base, ...b };
  const v = resolveSimValues(sim, { ...base.sim.set, ...b.sim.set });
  const fx = simEffects(sim, v, evaluateSim(sim, v));
  return { state, fx, parts: file.parts.filter(p => (!p.group || state.layers.includes(p.group)) && !state.hide?.includes(p.id) && !fx.hidden.has(p.id)) };
}
function hudFit(ch: number, beat: number, w: number, h: number, panels: FrameRect[]) {
  const s = shown(ch, beat), ids = new Set(file.views.hudFrame!.parts);
  const subjects = s.parts.filter(p => ids.has(p.id));
  const cam = fitCameraToHud(fitCameraToAspect(s.state.camera, w / h), subjects.map(frameBox), w, h, freeStageRect(w, h, panels, 12, false), { panels });
  return { ...s, subjects, c: camera(cam, w, h) };
}
function segmentHits(ax: number, ay: number, bx: number, by: number, r: FrameRect): boolean {
  let lo = 0, hi = 1;
  const dx = bx - ax, dy = by - ay;
  for (const [p, q] of [[-dx, ax - r.x0], [dx, r.x1 - ax], [-dy, ay - r.y0], [dy, r.y1 - ay]]) {
    if (Math.abs(p!) < 1e-9) { if (q! < 0) return false; continue; }
    const t = q! / p!;
    if (p! < 0) lo = Math.max(lo, t); else hi = Math.min(hi, t);
    if (lo > hi) return false;
  }
  return true;
}

describe('sound polish: anchors, ideal vacuum and tablet HUD', () => {
  it('points label 18 onto the string away from label 20’s bridge, preserving both beat targets', () => {
    expect(chapters[6]!.state.beats[1].labels).toEqual(['monochord-string', 'bridge-short']);
    const a = part('monochord-string'), b = part('bridge-short');
    const ap = anchorPoint(a).map((v, i) => v + a.primitive!.at[i]!);
    const bp = anchorPoint(b).map((v, i) => v + b.primitive!.at[i]!);
    expect(ap[0]).toBeCloseTo(-1.945, 10);
    expect(Math.abs(ap[0]! - bp[0]!)).toBeGreaterThan(.5);
    expect(ap[1]).toBeCloseTo(1.1, 10); expect(ap[2]).toBeCloseTo(-.9, 10);
  });
  it('removes the air rest marker with its medium for every non-air card choice', () => {
    for (const medium of ['water', 'solid-example', 'vacuum']) {
      const v = resolveSimValues(sim, { medium });
      const fx = simEffects(sim, v, evaluateSim(sim, v));
      expect(fx.hidden.has('wave-reference'), medium).toBe(true);
      expect(fx.hidden.has('source-driver'), medium).toBe(false);
      expect(fx.hidden.has('receiver'), medium).toBe(false);
    }
    expect(shown(2, 3).fx.hidden.has('wave-reference')).toBe(true);
    expect(shown(2, 0).fx.hidden.has('wave-reference')).toBe(false);
  });
  it('folds PLATE with the left column at 1024×768 even with tall bilingual notes', () => {
    for (const noteHeight of [420, 620, 820]) {
      const room = solveHudRoom({ width: 1024, height: 768 }, {
        top: 58, bottom: 70, edge: 22, tab: 44, reader: 400,
        left: { width: 240, height: noteHeight, metadata: 180 },
        right: { width: 264, height: 500, card: 180, legends: 160 },
      });
      expect(room.folds.leftColumn).toBe('collapsed');
      expect(room.meetsShare).toBe(true);
      expect(room.stage.x1 - room.stage.x0).toBeGreaterThanOrEqual(512);
    }
  });
  it('keeps framing subjects clear of manually reopened PLATE notes in all 32 tablet beats', () => {
    // 1024px viewport minus the minimum 340px reader, below the 57px topbar.
    const w = 684, h = 711;
    const panels = [{ x0: 22, y0: 16, x1: 262, y1: 620 }, { x0: 22, y0: 650, x1: 662, y1: 696 }];
    for (let ch = 0; ch < 8; ch++) for (let beat = 0; beat < 4; beat++) {
      const f = hudFit(ch, beat, w, h, panels);
      for (const p of f.subjects) {
        const b = projectBox(frameBox(p), f.c, w, h);
        for (const panel of panels) expect(b.x1 <= panel.x0 - 12 + 1e-5 || b.x0 >= panel.x1 + 12 - 1e-5 ||
          b.y1 <= panel.y0 - 12 + 1e-5 || b.y0 >= panel.y1 + 12 - 1e-5, `${ch}/${beat}/${p.id}`).toBe(true);
      }
    }
  });
  it('keeps both chapter 06 beat 2 leaders clear of the other card including its paper padding', () => {
    for (const [w, h] of [[1520, 1023], [1040, 843], [1120, 807]]) {
      const panels = [{ x0: 24, y0: 16, x1: 264, y1: h! - 100 }, { x0: 24, y0: h! - 70, x1: w! - 24, y1: h! - 24 }];
      const f = hudFit(6, 1, w!, h!, panels);
      // Sweep text bounds to cover both language notes and font-metric differences.
      for (const width of [190, 230, 270]) {
        const items: LeaderItem[] = f.state.labels.map((id: string) => {
          const p = part(id), a = anchorPoint(p), q = new Vector3(...a.map((v, i) => v + p.primitive!.at[i]!) as [number, number, number]).project(f.c);
          return { id, ax: (q.x + 1) * w! / 2, ay: (1 - q.y) * h! / 2, w: width, h: 44, lead: 8, bounds: projectBox(frameBox(p), f.c, w!, h!), prev: null };
        });
        const places = layoutLeaders(items, { width: w!, height: h!, left: 282, right: w! - 14, top: 14, bottom: h! - 82, obstacles: panels });
        expect(places).toHaveLength(2);
        for (const p of places) for (const other of places.filter(o => o.id !== p.id)) {
          const a = items.find(i => i.id === p.id)!;
          const padded = { x0: other.x0 - 4, x1: other.x1 + 4, y0: other.y0 - 2, y1: other.y1 + 2 };
          expect(segmentHits(p.ex, p.sy, a.ax, a.ay, padded), `${w}×${h}/${width}/${p.id}`).toBe(false);
        }
      }
    }
  });
});
