/** Absolute metre-error simplification on a compact, welded position buffer. */
import { readFile, writeFile } from 'node:fs/promises';
import { MeshoptSimplifier } from 'meshoptimizer';

function at<T>(values: ArrayLike<T>, index: number): T {
  const value = values[index];
  if (value === undefined) throw new Error(`Missing value at index ${index}`);
  return value;
}

interface Job {
  name: string;
  positions: number[];
  indices: number[];
  target: number;
  error: number;
  locks?: number[];
}

const [input, output] = process.argv.slice(2);
if (!input || !output) throw new Error('Usage: node --import tsx scripts/anatomy/simplify.ts input.json output.json');
const jobs: Job[] = JSON.parse(await readFile(input, 'utf8'));
await MeshoptSimplifier.ready;
const results = jobs.map((job) => {
  if (job.indices.length <= job.target*3) return {name:job.name,indices:job.indices,positions:job.positions,error:0};
  const centre = [0, 1, 2].map((axis) => {
    let min = Infinity, max = -Infinity;
    for (let i = axis; i < job.positions.length; i += 3) { const value = at(job.positions, i); min = Math.min(min, value); max = Math.max(max, value); }
    return (min + max) / 2;
  });
  const canonical = new Map<string, number>();
  const remap: number[] = [], originals: number[] = [], compact: number[] = [];
  for (let i = 0; i < job.positions.length / 3; i++) {
    const key = [0, 1, 2].map((axis) => Math.round(at(job.positions, i * 3 + axis) * 1e7)).join(',');
    let vertex = canonical.get(key);
    if (vertex === undefined) {
      vertex = originals.length; canonical.set(key, vertex); originals.push(i);
      compact.push(...[0, 1, 2].map((axis) => at(job.positions, i * 3 + axis) - at(centre, axis)));
    }
    remap.push(vertex);
  }
  // Merely remapping indices leaves orphan seam duplicates in the position buffer.
  // meshoptimizer still classifies these as seams and may lock otherwise smooth vertices.
  const welded = new Uint32Array(job.indices.map((i) => at(remap, i)));
  const positions = new Float32Array(compact);
  const locks = new Uint8Array(originals.length);
  for (const vertex of job.locks ?? []) locks[at(remap, vertex)] = 1;
  const [count, error] = MeshoptSimplifier.simplifyWithUpdate(
    welded, positions, 3, new Float32Array(), 0, [], locks,
    Math.min(welded.length, job.target * 3), job.error * .75,
    ['LockBorder', 'ErrorAbsolute', 'PreserveFolds'],
  );
  // Collapsing a thin closed fold can leave opposite coincident triangles.
  // Cancel both faces; Blender validate() would discard just one, opening a hole.
  const groups = new Map<string, { positive: number[][]; negative: number[][] }>();
  for (let i=0;i<count;i+=3) {
    const face = Array.from(welded.subarray(i,i+3));
    const key = [...face].sort((a,b)=>a-b).join(',');
    const group = groups.get(key) ?? {positive:[],negative:[]};
    const corner = face.indexOf(Math.min(...face));
    (at(face,(corner+1)%3) < at(face,(corner+2)%3) ? group.positive : group.negative).push(face);
    groups.set(key,group);
  }
  const cleaned: number[] = [];
  for (const group of groups.values()) {
    const pairs = Math.min(group.positive.length,group.negative.length);
    for (const face of [...group.positive.slice(pairs),...group.negative.slice(pairs)]) cleaned.push(...face);
  }
  const indices = new Uint32Array(cleaned);
  const outputPositions = job.positions.slice();
  for (let i=0;i<originals.length;i++) for (let a=0;a<3;a++) outputPositions[at(originals,i)*3+a]=at(positions,i*3+a)+at(centre,a);
  console.log(`WELD ${job.name}: ${remap.length} → ${originals.length} vertices; ${welded.length/3} → ${indices.length/3} triangles; ${error*1000} mm`);
  return { name: job.name, indices: Array.from(indices, (i) => at(originals,i)), error, positions: outputPositions };
});
await writeFile(output, JSON.stringify(results));
