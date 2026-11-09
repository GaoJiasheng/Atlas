/** Local muscle-series assets; requested only when exercise equipment mounts. */
import {useMemo,type ReactNode} from 'react';
import {useLoader} from '@react-three/fiber';
import {type BufferGeometry,type Mesh} from 'three';
import type {Primitive} from '../../../../engines/space-scene/schema';
import type {EquipmentShape} from '../../../../engines/space-scene/lib/equipment';
import {KETTLEBELL,DIP_BAR,PULL_UP,LAT_BAR,MACHINE_SEAT,STEP,FLOOR,WALL,POST,MACHINE_FRAME,BACK_EXT,ROPE,DIP_HEIGHT,SEAT_RECLINE} from '../../../../engines/space-scene/lib/equipment';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';
import {MeshoptDecoder} from 'three/examples/jsm/libs/meshopt_decoder.module.js';
import {withBase} from '../../../../i18n';
import {gymGeometry,fitLatTower} from './gymGeometry';
export type GymAssetFactory=(name:string,fit?:number)=>BufferGeometry;
export function GymAssets({children}:{children:(asset:GymAssetFactory,factories:PropFactories)=>ReactNode}){
  // These local assets are fetched only after this muscles-only lazy component mounts.
  const sources = useLoader(GLTFLoader, [withBase('/models/muscles-core-gym.glb'), withBase('/models/muscles-back-pulldown.glb')], loader => loader.setMeshoptDecoder(MeshoptDecoder));
  const asset = useMemo(() => (name: string, fit?: number): BufferGeometry => {
    const mesh = sources.flatMap(s => { const n=s.scene.getObjectByName(name); return n ? [n] : []; })[0] as Mesh | undefined;
    if (!mesh?.geometry) throw new Error(`Missing muscle gym geometry: ${name}`);
    const geometry=gymGeometry(mesh);
    if(name==='lat-frame' && fit!==undefined)fitLatTower(geometry,fit);
    if(name==='rack' && fit!==undefined){
      const position=geometry.getAttribute('position'), weights=geometry.getAttribute('_fit');
      if(!weights)throw new Error('Rack asset missing height weights');
      for(let i=0;i<position.count;i++)position.setY(i,position.getY(i)+(fit-1)*weights.getX(i));
      position.needsUpdate=true;geometry.computeVertexNormals();
    }
    return geometry;
  }, [sources]);
 return <>{children(asset,propFactories)}</>;
}

/** Legacy small-prop geometry, kept inside this muscles-only lazy module. */
type Prim = Primitive;
type V3 = readonly [number, number, number];
const grey = 'rubber' as const;

/** A cylinder (diameter d, length len) lying along X, centred at `at`. */
const alongX = (d: number, len: number, at: V3): Prim => ({ kind: 'cylinder', size: [d / 2, d / 2, len], at: [...at], rotation: [0, 0, 90], color: grey }) as Prim;
/** A cylinder lying along Z. */
const alongZ = (d: number, len: number, at: V3): Prim => ({ kind: 'cylinder', size: [d / 2, d / 2, len], at: [...at], rotation: [90, 0, 0], color: grey }) as Prim;
/** An upright cylinder (along Y). */
const upright = (d: number, len: number, at: V3): Prim => ({ kind: 'cylinder', size: [d / 2, d / 2, len], at: [...at], color: grey }) as Prim;
const box = (size: V3, at: V3, rotation?: V3): Prim =>
  ({ kind: 'bevelBox', size: [...size], bevel: Math.min(0.01, Math.min(...size) / 4), at: [...at], ...(rotation ? { rotation: [...rotation] } : {}), color: grey }) as Prim;


function kettlebellShape(): EquipmentShape {
  const r = KETTLEBELL.bell / 2;
  const cy = -KETTLEBELL.handle / 2 - r * 0.85;
  // A slightly flattened bell with a flat base (lathe about Y).
  const bell: [number, number][] = [];
  for (let i = 0; i <= 10; i++) {
    const a = -Math.PI / 2 + (i / 10) * Math.PI * 0.92;
    bell.push([Math.max(0, r * Math.cos(a)), r * 0.92 * Math.sin(a)]);
  }
  bell[0] = [r * 0.55, -r * 0.92];
  bell.unshift([0, -r * 0.92]);
  bell.push([0, bell[bell.length - 1]![1]]);
  return {
    primitive: { kind: 'torus', size: [KETTLEBELL.handle / 2, KETTLEBELL.wire / 2], at: [0, -KETTLEBELL.handle / 2, 0], color: grey } as Prim,
    extra: [{ kind: 'lathe', profile: bell, segments: 36, at: [0, cy, 0], color: grey } as Prim],
  };
}

function cableHandleShape(): EquipmentShape {
  return {
    primitive: alongX(0.03, 0.12, [0, 0, 0]),
    extra: [{ kind: 'torus', size: [0.075, 0.006], at: [0, -0.06, 0], color: grey } as Prim],
  };
}

function straightBarShape(length: number = LAT_BAR.length): EquipmentShape {
  return { primitive: alongX(LAT_BAR.bar, length, [0, 0, 0]), extra: [{ kind: 'torus', size: [0.02, 0.004], at: [0, 0.018, 0], color: grey } as Prim] };
}

function machineSeatShape(angle = SEAT_RECLINE, height: number = MACHINE_SEAT.height, thighPad: boolean | readonly [number, number] = false): EquipmentShape {
  const S = MACHINE_SEAT;
  const a = (angle * Math.PI) / 180;
  const backZ = -S.depth / 2 - S.pad / 2;
  const post = height - S.pad;
  const extra: Prim[] = [
    box([S.width, S.back, S.pad], [0, S.back / 2 * Math.cos(a), backZ - (S.back / 2) * Math.sin(a)], [-angle, 0, 0]),
    upright(0.06, post, [0, -S.pad - post / 2, 0]),
    box([0.5, 0.03, 0.5], [0, -height + 0.015, 0]),
  ];
  if (thighPad) extra.push(alongX(S.thigh, S.width + 0.04, thighPad === true ? [0, S.thigh / 2 + 0.17, S.depth / 2 - 0.08] : [0, thighPad[0], thighPad[1]]));
  return { primitive: box([S.width, S.pad, S.depth], [0, -S.pad / 2, 0]), extra };
}

function pullUpBarShape(height: number = PULL_UP.height): EquipmentShape {
  const x = PULL_UP.width / 2;
  const post = (px: number): Prim => box([PULL_UP.upright, height + PULL_UP.upright / 2, PULL_UP.upright], [px, -height / 2 + PULL_UP.upright / 4, 0]);
  const foot = (px: number): Prim => box([0.08, 0.02, 0.6], [px, -height + 0.01, 0]);
  return { primitive: alongX(PULL_UP.bar, PULL_UP.width + 2 * PULL_UP.upright, [0, 0, 0]), extra: [post(x + PULL_UP.upright / 2), post(-x - PULL_UP.upright / 2), foot(x + PULL_UP.upright / 2), foot(-x - PULL_UP.upright / 2)] };
}

function dipBarShape(height = DIP_HEIGHT): EquipmentShape {
  const r = DIP_BAR.radius;
  const z = DIP_BAR.length / 2 - 0.08;
  const post = (pz: number): Prim => upright(0.04, height, [0, -height / 2, pz]);
  return { primitive: alongZ(2 * r, DIP_BAR.length, [0, -r, 0]), extra: [post(z), post(-z)] };
}

function stepShape(height: number = STEP.height): EquipmentShape {
  return { primitive: box([STEP.width, height, STEP.depth], [0, -height / 2, 0]) };
}

function floorShape(): EquipmentShape {
  return { primitive: { kind: 'box', size: [FLOOR.width, FLOOR.thick, FLOOR.length], at: [0, -FLOOR.thick / 2, 0], color: grey } as Prim };
}

function wallShape(height: number = WALL.height): EquipmentShape {
  return { primitive: box([WALL.width, height, WALL.thick], [0, height / 2, -WALL.thick / 2]) };
}

function postShape(height: number = POST.height, rail = false): EquipmentShape {
  const extra: Prim[] = [box([POST.base, 0.02, POST.base], [0, 0.01, 0])];
  if (rail) extra.push(alongZ(POST.rail, POST.railLength, [0, height - POST.rail / 2, 0]));
  const h = rail ? height - POST.rail / 2 : height;
  return { primitive: upright(POST.diameter, h, [0, h / 2, 0]), extra };
}

function machineFrameShape(height: number = MACHINE_FRAME.height): EquipmentShape {
  const F = MACHINE_FRAME;
  const p = F.post;
  const [pw, ph, pd] = F.plates;
  const sz = -F.stack;
  const parts: Prim[] = [
    box([2 * F.half + p, p, p], [0, height - p / 2, 0]),
    box([p, height - p, p], [F.half, (height - p) / 2, 0]),
    box([p, height - p, p], [-F.half, (height - p) / 2, 0]),
    box([2 * F.half + p, 0.025, 0.07], [0, 0.0125, 0]),
    // The stack: base, plates, guide rods, cap, and the beam back to it.
    box([pw + 0.12, 0.025, pd + 0.1], [0, 0.0125, sz]),
    box([pw, ph, pd], [0, 0.06 + ph / 2, sz]),
    upright(0.02, height - 0.08, [pw / 2 + 0.03, (height - 0.08) / 2, sz]),
    upright(0.02, height - 0.08, [-pw / 2 - 0.03, (height - 0.08) / 2, sz]),
    box([pw + 0.12, p, pd + 0.04], [0, height - p / 2, sz]),
    box([p, p, F.stack], [0, height - p / 2, sz / 2]),
    box([0.07, 0.025, F.stack], [0, 0.0125, sz / 2]),
  ];
  return { primitive: parts[0]!, extra: parts.slice(1) };
}

function backExtensionShape(feet: V3, floor: number): EquipmentShape {
  const B = BACK_EXT;
  const L = Math.hypot(feet[1], feet[2]) || 1;
  // d: along the legs (pad → feet); f: the legs' front, across d (both in the YZ plane).
  const d: V3 = [0, feet[1] / L, feet[2] / L];
  const f: V3 = [0, d[2], -d[1]];
  const at = (k: number, j: number): V3 => [0, d[1] * k + f[1] * j, d[2] * k + f[2] * j];
  // The box turn that lays its Y along −d (up the legs) and its Z along f.
  const tilt = (Math.atan2(-d[2], -d[1]) * 180) / Math.PI;
  const rot: V3 = [tilt, 0, 0];
  const beam = B.below;
  const top = at(0, beam);
  const low = at(L, beam);
  const parts: Prim[] = [
    box([B.pad[0], B.pad[1], B.pad[2]], at(0, B.pad[2] / 2), rot),
    // Footplate just past the balls of the feet, across the legs.
    box([B.plate[0], B.plate[1], B.plate[2]], at(L + B.plate[1] / 2 + 0.01, -0.05), rot),
    // Ankle rollers behind the lower shins.
    alongX(B.roller, B.rollerLength, at(L - 0.13, -0.15 - B.roller / 2)),
    // The beam under the legs, the posts up to the pad and the plate and roller.
    box([B.beam, L, B.beam], at(L / 2, beam), rot),
    box([0.05, 0.05, beam - B.pad[2]], at(0, (beam + B.pad[2]) / 2), rot),
    box([0.05, 0.05, beam + 0.2], at(L - 0.04, beam / 2 - 0.1), rot),
  ];
  // Two legs straight down to the floor, a rail along the floor between them.
  for (const q of [top, low]) {
    const h = q[1] - floor;
    if (h > 0.02) parts.push(box([B.beam, h, B.beam], [0, floor + h / 2, q[2]]), box([0.5, 0.03, 0.07], [0, floor + 0.015, q[2]]));
  }
  const span = Math.abs(top[2] - low[2]);
  if (span > 0.05) parts.push(box([0.07, 0.03, span], [0, floor + 0.015, (top[2] + low[2]) / 2]));
  return { primitive: parts[0]!, extra: parts.slice(1) };
}

function ropeGripShape(): EquipmentShape {
  return {
    primitive: alongX(ROPE.grip, ROPE.length, [0, 0, 0]),
    extra: [{ kind: 'sphere', size: [ROPE.knob / 2], at: [-ROPE.length / 2, 0, 0], color: grey } as Prim],
  };
}

function lineShape(thick: number): EquipmentShape {
  return { primitive: upright(thick, 1, [0, 0.5, 0]) };
}

const propFactories={backExtensionShape,cableHandleShape,dipBarShape,floorShape,kettlebellShape,lineShape,machineFrameShape,machineSeatShape,postShape,pullUpBarShape,ropeGripShape,stepShape,straightBarShape,wallShape};
export type PropFactories=typeof propFactories;
