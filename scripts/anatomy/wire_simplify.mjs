/** Quadric planar-aware simplification of the native skin-wire candidate. */
import {readFileSync, writeFileSync} from 'node:fs';
import {MeshoptSimplifier} from 'meshoptimizer';
await MeshoptSimplifier.ready;
const file=process.argv[2], input=JSON.parse(readFileSync(file,'utf8'));
const points=new Float32Array(input.points.flat());
const indices=new Uint32Array(input.faces.flat());
const [result,error]=MeshoptSimplifier.simplify(indices,points,3,12000,.03,['ErrorAbsolute','Permissive']);
writeFileSync(file,JSON.stringify({indices:Array.from(result),error}));
