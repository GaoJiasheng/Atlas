/** Retain source-scale town/Jurong detail without enlarging the rest of the
 * island. Run after shared local-land.ts at 5m, before shared composition.
 * Only existing arc vertices are removed: these boxes select precision, and
 * never become coastline or territory geometry. Shared arc ids stay intact.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { feature } from 'topojson-client';
import type { FeatureCollection } from 'geojson';
import { ringIssues } from '../lib/rings';

const dir = resolve(import.meta.dirname);
const file = resolve(dir, '../../../public/geo/land-sg-history.json');
const topo = JSON.parse(readFileSync(file, 'utf8'));
type P = [number, number];
const historicalArcs=new Set<number>();
for(const object of Object.values(topo.objects) as any[])for(const g of object.geometries){
  if(g.properties?.kind!=='land')continue;
  const visit=(value:any):void=>{if(typeof value==='number')historicalArcs.add(value<0?~value:value);else value.forEach(visit)};
  visit(g.arcs);
}
const fineBoxes = [[103.828, 1.274, 103.878, 1.325], [103.60, 1.27, 103.78, 1.373]];
const fine = ([x, y]: P) => fineBoxes.some(([w, s, e, n]) => x >= w! && x <= e! && y >= s! && y <= n!);
const ll = ([x, y]: P): P => [x * topo.transform.scale[0] + topo.transform.translate[0], y * topo.transform.scale[1] + topo.transform.translate[1]];
const distance = (p: P, a: P, b: P) => {
  const scale = 111195, c = Math.cos(p[1] * Math.PI / 180);
  const ax = (a[0] - p[0]) * scale * c, ay = (a[1] - p[1]) * scale;
  const bx = (b[0] - p[0]) * scale * c, by = (b[1] - p[1]) * scale;
  const dx = bx - ax, dy = by - ay, n = dx * dx + dy * dy;
  const t = n ? Math.max(0, Math.min(1, -(ax * dx + ay * dy) / n)) : 0;
  return Math.hypot(ax + t * dx, ay + t * dy);
};
const simplify = (points: P[], tolerance: number): P[] => {
  if (points.length < 3) return points;
  const geographic = points.map(ll), keep = new Set([0, points.length - 1]);
  const stack: P[] = [[0, points.length - 1]];
  while (stack.length) {
    const [a, b] = stack.pop()!;
    let max = tolerance, index = -1;
    for (let i = a + 1; i < b; i++) {
      const d = distance(geographic[i]!, geographic[a]!, geographic[b]!);
      if (d > max) { max = d; index = i; }
    }
    if (index >= 0) { keep.add(index); stack.push([a, index], [index, b]); }
  }
  return [...keep].sort((a, b) => a - b).map(i => points[i]!);
};
let before = 0, after = 0;
const originalArcs: P[][] = topo.arcs;
topo.arcs = topo.arcs.map((arc: P[], arcIndex:number) => {
  let x = 0, y = 0;
  const points: P[] = arc.map(([dx, dy]) => [x += dx, y += dy]);
  before += points.length;
  const flags = points.map(p => historicalArcs.has(arcIndex)&&fine(ll(p)));
  const stops = [0];
  for (let i = 1; i < points.length; i++) if (flags[i] !== flags[i - 1]) stops.push(i);
  if (stops.at(-1) !== points.length - 1) stops.push(points.length - 1);
  const out: P[] = [];
  for (let i = 1; i < stops.length; i++) {
    const a = stops[i - 1]!, b = stops[i]!;
    const selected = simplify(points.slice(a, b + 1), flags.slice(a, b + 1).some(Boolean) ? 5 : 25);
    out.push(...(out.length ? selected.slice(1) : selected));
  }
  if (!out.length) out.push(...points);
  if (points.length > 3 && points[0]![0] === points.at(-1)![0] && points[0]![1] === points.at(-1)![1] && out.length < 4) {
    out.splice(0, out.length, ...points);
  }
  after += out.length;
  x = 0; y = 0;
  return out.map(([nx, ny]) => { const p: P = [nx - x, ny - y]; x = nx; y = ny; return p; });
});
// Douglas–Peucker alone can close a narrow tidal loop or cross its opposite
// bank. Restore the particular original arcs involved; never drop the island
// or repair it with a new line. All checks run on the quantised output.
const decode = (arc: P[]) => { let x = 0, y = 0; return arc.map(([dx, dy]): P => [x += dx, y += dy]); };
const cross = (a: P, b: P, c: P, d: P) => {
  const orient = (p: P, q: P, r: P) => (q[0]-p[0])*(r[1]-p[1])-(q[1]-p[1])*(r[0]-p[0]);
  const o1=orient(a,b,c), o2=orient(a,b,d), o3=orient(c,d,a), o4=orient(c,d,b);
  return o1*o2<0 && o3*o4<0;
};
const restored = new Set<number>();
for (let pass = 0; pass < 8; pass++) {
  const bad = new Set<number>();
  for (const object of Object.values(topo.objects) as any[]) for (const geometry of object.geometries) {
    const rings: number[][] = geometry.type === 'Polygon' ? geometry.arcs : geometry.type === 'MultiPolygon' ? geometry.arcs.flat() : [];
    for (const refs of rings) {
      const points: P[] = [], owners: number[] = [];
      for (const ref of refs) {
        const id = ref < 0 ? ~ref : ref;
        const arc = decode(topo.arcs[id]);
        if (ref < 0) arc.reverse();
        if (points.length) points.pop();
        points.push(...arc);
        owners.push(...Array(Math.max(0, arc.length-1)).fill(id));
      }
      const geographic = points.map(ll);
      const issue = ringIssues([[geographic]]);
      if (issue.zeroArea) { refs.forEach(r => bad.add(r < 0 ? ~r : r)); continue; }
      if (!issue.selfCrossing) continue;
      const n = points.length-1;
      const order = Array.from({length:n},(_,i)=>i).sort((a,b)=>Math.min(points[a]![0],points[a+1]![0])-Math.min(points[b]![0],points[b+1]![0]));
      let active: number[] = [];
      for (const i of order) {
        const a=points[i]!, b=points[i+1]!;
        active=active.filter(j=>Math.max(points[j]![0],points[j+1]![0])>=Math.min(a[0],b[0]));
        for (const j of active) if (Math.abs(i-j)>1 && !(i===n-1&&j===0) && !(j===n-1&&i===0) && cross(a,b,points[j]!,points[j+1]!)) {
          bad.add(owners[i]!); bad.add(owners[j]!);
        }
        active.push(i);
      }
    }
  }
  const changed = [...bad].filter(id=>!restored.has(id));
  if (!changed.length) break;
  for (const id of changed) { topo.arcs[id]=originalArcs[id]; restored.add(id); }
}
const packedArcs: P[][] = topo.arcs;
const sourceScale: P = [...topo.transform.scale] as P;
let quantizationFactor = 1;
for (const factor of [4, 3, 2, 1]) {
  topo.transform.scale = sourceScale.map(v=>v*factor);
  topo.arcs = packedArcs.map(arc => {
    let x=0, y=0;
    return decode(arc).map(([nx,ny]): P=>{
      nx=Math.round(nx/factor); ny=Math.round(ny/factor);
      const p: P=[nx-x,ny-y]; x=nx; y=ny; return p;
    });
  });
  const features = Object.values(topo.objects).flatMap(o => (feature(topo, o as any) as unknown as FeatureCollection).features);
  const rings = features.flatMap(f => f.geometry.type === 'Polygon' ? [f.geometry.coordinates] : f.geometry.type === 'MultiPolygon' ? f.geometry.coordinates : []);
  const issue = ringIssues(rings);
  if (!issue.zeroArea && !issue.selfCrossing) { quantizationFactor=factor; break; }
}
const fc = Object.values(topo.objects).flatMap(o => (feature(topo, o as any) as unknown as FeatureCollection).features);
const polys = fc.flatMap(f => f.geometry.type === 'Polygon' ? [f.geometry.coordinates] : f.geometry.type === 'MultiPolygon' ? f.geometry.coordinates : []);
const issues = ringIssues(polys);
if (issues.zeroArea || issues.selfCrossing) throw Error(`Precision pack rejected: ${JSON.stringify(issues)}`);
const text = JSON.stringify(topo);
writeFileSync(file, text);
for (const f of fc.filter(f => f.properties?.kind === 'land')) {
  writeFileSync(`${dir}/work/coast-${f.properties!.id}.geojson`, JSON.stringify({ type: 'FeatureCollection', features: [f] }));
}
writeFileSync(`${dir}/resume-pack-audit.json`, JSON.stringify({
  date: '2026-11-09', method: 'Existing shared TopoJSON arcs, source-scale 5m town/Jurong and 25m elsewhere; arc ids/endpoints retained, no new geometry',
  fineBoxes, fineScope:'Historical land arcs only; exclusive current-coast and mask arcs retain25m precision', sourceVertices: before, publishedVertices: topo.arcs.reduce((n: number, a: P[])=>n+a.length,0), restoredArcs: restored.size,
  quantizationFactor, gridStepM: topo.transform.scale.map((v: number)=>v*111195), bytes: Buffer.byteLength(text), issues,
}, null, 2) + '\n');
console.log(`Local precision: ${before} -> ${after} vertices, ${Buffer.byteLength(text)} bytes; ${JSON.stringify(issues)}`);
