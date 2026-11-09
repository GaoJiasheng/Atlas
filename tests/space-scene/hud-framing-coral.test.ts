import { beforeAll, describe, expect, it } from 'vitest';
import { NodeIO } from '@gltf-transform/core';
import { readFileSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { parse } from 'yaml';
import { partsFile } from '../../src/engines/space-scene/schema';
import topic from '../../src/content/topics/coral-reef/data/parts.json';
import { partBounds } from '../../src/engines/space-scene/lib/parts';
import { fitCameraToAspect } from '../../src/engines/space-scene/lib/camera';
import { fitCameraToHud, freeStageRect, type FrameBox } from '../../src/engines/space-scene/lib/hud-framing';
import type { OrbitCamera } from '../../src/engines/core/types';
import type { Vec3 } from '../../src/engines/space-scene/lib/math';

const file = partsFile.parse(topic);
const boxes = new Map<string, FrameBox>();
const root = resolve(import.meta.dirname, '../..');
const distance = (c: OrbitCamera) => Math.hypot(...c.position.map((v,i) => v-c.target[i]!));
beforeAll(async () => {
  const doc = await new NodeIO().read(resolve(root, 'public/models/coral-reef.glb'));
  for (const part of file.parts) {
    const pos = doc.getRoot().listNodes().find(n => n.getName() === part.mesh)?.getMesh()?.listPrimitives()[0]?.getAttribute('POSITION');
    const b = pos ? {min:pos.getMin([]), max:pos.getMax([])} : partBounds(part);
    if (b) boxes.set(part.id, {
      center:b.min.map((v,i) => (v+b.max[i]!)/2) as Vec3,
      half:b.min.map((v,i) => (b.max[i]!-v)/2) as Vec3,
    });
  }
});

// A measured-size HUD regression: the old first-feasible-rectangle shortcut
// jumped from 8.19 to 15.41 for a 0.03 change in the tentacle tips.
const width = 839.7104433737695, height = 990.8893591724336;
const panels = [
  {x0:20,y0:653.3302832106552,x1:819.7104433737695,y1:970.8893591724336},
  {x0:20,y0:20,x1:340.3551627881825,y1:484.7991806291975},
  {x0:448.8767506554723,y0:20,x1:819.7104433737695,y1:420.55693104630336},
];

describe('coral bounds perturbations', () => {
  it.each(['01-', '02-', '03-', '06-'])('keeps chapter %s and all its beats stable across ±0.03 tentacle changes', prefix => {
    const dir = resolve(root,'src/content/topics/coral-reef/chapters');
    const path = readdirSync(dir).find(p => p.startsWith(prefix))!;
    const chapter = parse(readFileSync(resolve(dir,path),'utf8').split('---')[1]!).state;
    for (const state of [chapter,...(chapter.beats ?? []).map((b: object) => ({...chapter,...b}))]) {
      const authored = typeof state.camera === 'string' ? file.presets!.find(p => p.id === state.camera)!.camera : state.camera;
      const camera = fitCameraToAspect(authored,width/height);
      const subjects = file.parts.filter(p => file.views.hudFrame!.parts.includes(p.id) &&
        (!p.group || state.layers.includes(p.group)) && !state.hide?.includes(p.id));
      const fits = [-0.03,0,0.03].map(delta => {
        const bodies = subjects.flatMap(p => {
          const b = boxes.get(p.id);
          if (!b) return [];
          return [p.id === 'polyp-tentacles' ? {
            center:[b.center[0],b.center[1]+delta/2,b.center[2]] as Vec3,
            half:[b.half[0],b.half[1]+delta/2,b.half[2]] as Vec3,
          } : b];
        });
        return fitCameraToHud(camera,bodies,width,height,freeStageRect(width,height,panels),{panels});
      });
      const depths = fits.map(distance);
      expect(Math.max(...depths)/Math.min(...depths), `${path}: ${depths}`).toBeLessThan(1.1);
      for (const c of fits) expect([...c.position,...c.target].every(Number.isFinite)).toBe(true);
    }
  });
});
