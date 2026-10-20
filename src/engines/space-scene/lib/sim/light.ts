/** Straight-line light models (docs/35 §4.3). Geometry and gap dimensions are cm. */
import type { LightData, LightShape, SimControl, SimOutput, SimValues } from '../../sim-schema';
import { solarNoon, sunPosition, sunVector } from './sun';

type Bench = NonNullable<LightData['bench']>;
export interface SilhouetteBounds {
  height: number;
  width: number;
  min: [number, number];
  max: [number, number];
}
const rad = Math.PI / 180;
const numeric = (v: unknown): number => (typeof v === 'number' ? v : typeof v === 'boolean' ? +v : NaN);
const cached = new WeakMap<LightShape, Map<string, SilhouetteBounds>>();
const samples = new WeakMap<LightShape, Map<number, Float64Array>>();

/**
 * Analytic surface samples (720 segments per circle). A cylinder is the convex
 * hull of its two end circles and a cone of its base circle and apex; a
 * perspective projection from a source in front of the body keeps convex
 * hulls, so these rims give the exact silhouette bounds.
 */
function surface(shape: LightShape, turn: number): Float64Array {
  let turns = samples.get(shape);
  if (!turns) {
    turns = new Map();
    samples.set(shape, turns);
  }
  const old = turns.get(turn);
  if (old) return old;
  const pts: number[] = [],
    c = Math.cos(turn * rad),
    s = Math.sin(turn * rad);
  const push = (x: number, y: number, z: number) => pts.push(x * c + z * s, y, -x * s + z * c);
  const SEGMENTS = 720;
  if (shape.kind === 'polygon') for (const x of [-shape.thick / 2, shape.thick / 2]) for (const [z, y] of shape.points) push(x, y, z);
  else if (shape.kind === 'disc')
    for (const x of [-shape.thick / 2, shape.thick / 2])
      for (let j = 0; j < SEGMENTS; j++)
        push(x, (shape.d / 2) * Math.sin((2 * Math.PI * j) / SEGMENTS), (shape.d / 2) * Math.cos((2 * Math.PI * j) / SEGMENTS));
  else if (shape.kind !== 'sphere') {
    const r = shape.d / 2;
    for (let j = 0; j < SEGMENTS; j++) push(r * Math.cos((2 * Math.PI * j) / SEGMENTS), r * Math.sin((2 * Math.PI * j) / SEGMENTS), -shape.length / 2);
    if (shape.kind === 'cone') push(0, 0, shape.length / 2);
    else for (let j = 0; j < SEGMENTS; j++) push(r * Math.cos((2 * Math.PI * j) / SEGMENTS), r * Math.sin((2 * Math.PI * j) / SEGMENTS), shape.length / 2);
  }
  const result = new Float64Array(pts);
  turns.set(turn, result);
  return result;
}

/** Maximum half depth along the light axis, including thickness and rotation. */
export function shapeHalfDepth(shape: LightShape, turn: number): number {
  if (shape.kind === 'sphere') return shape.d / 2;
  const p = surface(shape, turn);
  let depth = 0;
  for (let i = 0; i < p.length; i += 3) depth = Math.max(depth, Math.abs(p[i]!));
  return depth;
}

/** Perspective silhouette bounds on x=b, source x=−a; no screen/beam clipping. */
export function benchShadow(bench: Bench, object: string, turn: number, a: number, b: number): SilhouetteBounds {
  const shape = bench.objects[object]?.shape;
  if (!shape) return { height: NaN, width: NaN, min: [NaN, NaN], max: [NaN, NaN] };
  let memo = cached.get(shape);
  if (!memo) {
    memo = new Map();
    cached.set(shape, memo);
  }
  const key = `${turn}:${a}:${b}`,
    old = memo.get(key);
  if (old) return old;
  let minU = Infinity,
    maxU = -Infinity,
    minV = Infinity,
    maxV = -Infinity;
  if (shape.kind === 'sphere') {
    const radius = shape.d / 2,
      shadowRadius = ((a + b) * radius) / Math.sqrt(a * a - radius * radius);
    minU = minV = -shadowRadius;
    maxU = maxV = shadowRadius;
  } else {
    const points = surface(shape, turn);
    for (let i = 0; i < points.length; i += 3) {
      const scale = (a + b) / (a + points[i]!);
      const u = points[i + 2]! * scale,
        v = points[i + 1]! * scale;
      minU = Math.min(minU, u);
      maxU = Math.max(maxU, u);
      minV = Math.min(minV, v);
      maxV = Math.max(maxV, v);
    }
  }
  const result: SilhouetteBounds = {
    height: maxV - minV,
    width: maxU - minU,
    min: [minU, minV],
    max: [maxU, maxV],
  };
  if (memo.size > 4096) memo.clear();
  memo.set(key, result);
  return result;
}

/** Intersection of the holes projected onto the screen; common interval gives the bright dot. */
export function holeInterval(holes: NonNullable<LightData['holes']>, a: number, b: number, moved: boolean): [number, number] {
  let lo = -Infinity,
    hi = Infinity;
  for (const card of holes.cards) {
    const scale = (a + b) / (a + card.at),
      centre = moved ? (card.moved ?? 0) * scale : 0,
      radius = (holes.hole / 2) * scale;
    lo = Math.max(lo, centre - radius);
    hi = Math.min(hi, centre + radius);
  }
  return [lo, hi];
}
export const SHADOW_DIRECTIONS = ['north', 'north-east', 'east', 'south-east', 'south', 'south-west', 'west', 'north-west'] as const;
export const shadowDirection = (bearing: number): string => SHADOW_DIRECTIONS[Math.floor(((bearing + 180 + 22.5) % 360) / 45)]!;

/** All numbers, states and the Sun's xyz direction for one control state. */
export function solveLight(
  light: LightData,
  values: SimValues,
  controls: readonly SimControl[] = [],
): Record<string, number | string | Readonly<Record<string, number>>> {
  const q: Record<string, number | string | Readonly<Record<string, number>>> = {};
  const bench = light.bench,
    a = bench ? numeric(values[bench.gaps.torch]) : NaN,
    b = bench ? numeric(values[bench.gaps.screen]) : NaN;
  const on = bench ? values[bench.power] === true : true;
  if (bench) {
    const object = String(values[bench.object]),
      turn = numeric(values[bench.turn]);
    const bounds = on ? benchShadow(bench, object, turn, a, b) : undefined;
    q['shadow:height'] = bounds?.height ?? NaN;
    q['shadow:width'] = bounds?.width ?? NaN;
    q['shadow:shape'] = on ? (bench.objects[object]?.names[String(turn)] ?? 'none') : 'none';
  }
  if (light.sheets) {
    const sheets = light.sheets,
      material = sheets.materials[String(values[sheets.control])],
      area = (sheets.size[0] * sheets.size[1]) / Math.PI;
    const transmission = !on ? 0 : !material ? 1 : Math.min(1, material.straight + ((material.scattered * area) / (area + b * b)) * ((a + b) / a) ** 2);
    q['sheet:light'] = 100 * transmission;
    q['sheet:dark'] = on ? 1 - transmission : 0;
    q['sheet:kind'] =
      !on || !material ? 'none' : transmission * 100 >= sheets.kinds.hardly ? 'hardly' : transmission * 100 < sheets.kinds.dark ? 'dark' : 'lighter';
  }
  if (light.holes) {
    const [lo, hi] = holeInterval(light.holes, a, b, values[light.holes.control] === 'moved');
    q['holes:dot'] = on && hi > lo ? 'yes' : 'no';
  }
  if (light.seeing) {
    const seeing = light.seeing,
      lit = values[seeing.torch] === true;
    q['seeing:eye'] = lit ? (seeing.reflects[String(values[seeing.target])] ?? 'none') : 'none';
    q['seeing:dark'] = lit ? 0 : 1;
  }
  if (light.sun) {
    const sun = light.sun,
      date = sun.dates[String(values[sun.date])];
    if (date) {
      const at = sunPosition(date, numeric(values[sun.time]), sun.lat, sun.lon, sun.zone),
        noon = solarNoon(date, sun.lon, sun.zone),
        noonAt = sunPosition(date, noon, sun.lat, sun.lon, sun.zone);
      q['sun:height'] = at.height;
      q['sun:bearing'] = at.bearing;
      q['sun:length'] = at.height > 0 ? sun.pole / Math.tan(at.height * rad) : NaN;
      q['sun:points'] = shadowDirection(at.bearing);
      q['sun:noon'] = noon;
      q['sun:noon-length'] = sun.pole / Math.tan(noonAt.height * rad);
      q['sun:at'] = sunVector(at.height, at.bearing, sun.north);
    }
  }
  for (const control of controls) if (control.kind !== 'choice') q[`control:${control.id}`] = numeric(values[control.id]);
  return q;
}

/** Quantity kind, only when the required submodel exists. */
export function lightQuantity(light: LightData, from: string): SimOutput['kind'] | null {
  const [model, quantity] = from.split(':');
  if (model === 'shadow' && light.bench) return quantity === 'shape' ? 'state' : ['height', 'width'].includes(quantity!) ? 'number' : null;
  if (model === 'sheet' && light.sheets) return quantity === 'kind' ? 'state' : ['light', 'dark'].includes(quantity!) ? 'number' : null;
  if (model === 'holes' && light.holes && quantity === 'dot') return 'state';
  if (model === 'seeing' && light.seeing) return quantity === 'eye' ? 'state' : quantity === 'dark' ? 'number' : null;
  if (model === 'sun' && light.sun)
    return quantity === 'points'
      ? 'state'
      : quantity === 'at'
        ? 'vector'
        : ['height', 'bearing', 'length', 'noon', 'noon-length'].includes(quantity!)
          ? 'number'
          : null;
  return null;
}
/** Reachable labels of state quantities (computed independently per experiment). */
export function lightStates(light: LightData, from: string, controls: readonly SimControl[]): string[] | undefined {
  if (lightQuantity(light, from) !== 'state') return undefined;
  if ((from === 'sheet:kind' || from === 'holes:dot') && !light.bench) return [];
  if (from === 'shadow:shape') return [...new Set(['none', ...Object.values(light.bench!.objects).flatMap((o) => Object.values(o.names))])];
  const ids =
    from === 'sheet:kind'
      ? [light.sheets!.control, light.bench!.power, light.bench!.gaps.torch, light.bench!.gaps.screen]
      : from === 'holes:dot'
        ? [light.holes!.control, light.bench!.power, light.bench!.gaps.torch, light.bench!.gaps.screen]
        : from === 'seeing:eye'
          ? [light.seeing!.torch, light.seeing!.target]
          : [light.sun!.date, light.sun!.time];
  let combinations: SimValues[] = [Object.fromEntries(controls.map((c) => [c.id, c.default]))];
  for (const id of ids) {
    const c = controls.find((x) => x.id === id);
    if (!c) continue;
    const opts = c.kind === 'step' ? c.values : c.kind === 'toggle' ? [false, true] : c.options.map((o) => o.id);
    combinations = combinations.flatMap((v) => opts.map((o) => ({ ...v, [id]: o })));
  }
  return [...new Set(combinations.map((v) => String(solveLight(light, v, controls)[from])))];
}
