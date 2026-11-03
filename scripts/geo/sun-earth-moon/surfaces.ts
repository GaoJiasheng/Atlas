/** Topic-owned, deterministic planet surfaces. No runtime requests. */
import { BufferAttribute, BufferGeometry, Vector3 } from 'three';
export const SINGAPORE = { lat: 1.3342, lon: 103.7357 };
const RAD = Math.PI / 180;
export type V3 = [number, number, number];
/** Local +X is the simulator's observing meridian / lunar near-side centre. */
export function geographicDirection(lat: number, lon: number, meridian = SINGAPORE.lon): V3 {
  const a = lat * RAD, b = (lon - meridian) * RAD;
  return [Math.cos(a) * Math.cos(b), Math.sin(a), -Math.cos(a) * Math.sin(b)];
}
export function hash(x: number, y: number, z: number): number {
  const a = Math.sin(x * 127.1 + y * 311.7 + z * 74.7) * 43758.5453123;
  return a - Math.floor(a);
}
const mix = (a: number, b: number, t: number) => a + (b - a) * t;
export function noise(x: number, y: number, z: number): number {
  const ix = Math.floor(x), iy = Math.floor(y), iz = Math.floor(z);
  const smooth = (v: number) => v * v * (3 - 2 * v);
  const u = smooth(x - ix), v = smooth(y - iy), w = smooth(z - iz);
  const face = (k: number) => mix(mix(hash(ix,iy,k),hash(ix+1,iy,k),u),mix(hash(ix,iy+1,k),hash(ix+1,iy+1,k),u),v);
  return mix(face(iz),face(iz+1),w);
}
export function fbm(x: number, y: number, z: number): number {
  return noise(x,y,z)*.57 + noise(x*2.03+13,y*2.03,z*2.03)*.28 + noise(x*4.11,y*4.11+9,z*4.11)*.15;
}
/** Indexed continuous surface, smooth normals, exact lon/lat UV alignment.
 * Radius may be sampled from LOLA; 256 × 128 needs only 65,024 triangles. */
export function globe(meridian: number, around = 128, rows = 64, radius: (lat: number, lon: number) => number = () => 1): BufferGeometry {
  const pos: number[] = [], uv: number[] = [], normals: number[] = [], indices: number[] = [];
  const point = (lat: number, lon: number) => new Vector3(...geographicDirection(lat,lon,meridian)).multiplyScalar(radius(lat,lon));
  for (let j=0;j<=rows;j++) for (let i=0;i<=around;i++) {
    const lat=90-j/rows*180, lon=-180+i/around*360;
    const p=point(lat,lon), tangent=point(Math.max(-89.999,Math.min(89.999,lat+.025)),lon).sub(point(Math.max(-89.999,Math.min(89.999,lat-.025)),lon));
    const east=point(Math.max(-89.999,Math.min(89.999,lat)),lon+.025).sub(point(Math.max(-89.999,Math.min(89.999,lat)),lon-.025));
    const n=tangent.cross(east).normalize();
    if (n.dot(p)<0) n.negate();
    pos.push(p.x,p.y,p.z); normals.push(n.x,n.y,n.z); uv.push(i/around,j/rows);
  }
  for(let j=0;j<rows;j++) for(let i=0;i<around;i++) {
    const a=j*(around+1)+i,b=a+1,c=a+around+1,d=c+1;
    if(j>0) indices.push(a,c,b);
    if(j<rows-1) indices.push(b,c,d);
  }
  const g=new BufferGeometry();
  g.setAttribute('position',new BufferAttribute(new Float32Array(pos),3));
  g.setAttribute('normal',new BufferAttribute(new Float32Array(normals),3));
  g.setAttribute('uv',new BufferAttribute(new Float32Array(uv),2));
  g.setIndex(indices);
  return g;
}
/** Sample an equirectangular map; x wraps, y clamps, bilinear filtering. */
export function sampleMap(data: ArrayLike<number>, width: number, height: number, channels: number, lat: number, lon: number, channel = 0): number {
  const x=((lon+180)/360*width-.5+width)%width,y=Math.max(0,Math.min(height-1,(90-lat)/180*height-.5));
  const x0=Math.floor(x),y0=Math.floor(y),fx=x-x0,fy=y-y0;
  const at=(a:number,b:number)=>data[(b*width+(a+width)%width)*channels+channel]!;
  return mix(mix(at(x0,y0),at(x0+1,y0),fx),mix(at(x0,Math.min(y0+1,height-1)),at(x0+1,Math.min(y0+1,height-1)),fx),fy);
}
