/** Offline reconstruction of Three r180's ACESFilmicToneMapping (the installed
 * ShaderChunk), not the common Narkowicz approximation. Output is linear sRGB.
 */
export type RGB = [number, number, number];
export function aces(rgb: RGB, exposure: number): RGB {
  const [r,g,b]=rgb.map(v=>v*exposure/.6) as RGB;
  const fit=(v:number)=>(v*(v+.0245786)-.000090537)/(v*(.983729*v+.432951)+.238081);
  const a=fit(.59719*r+.35458*g+.04823*b);
  const c=fit(.076*r+.90834*g+.01566*b);
  const d=fit(.0284*r+.13383*g+.83777*b);
  return [1.60475*a-.53108*c-.07367*d,-.10208*a+1.10813*c-.00605*d,-.00327*a-.07276*c+1.07602*d].map(v=>Math.max(0,Math.min(1,v))) as RGB;
}
export const luminance=([r,g,b]:RGB)=>.2126*r+.7152*g+.0722*b;
export const toLinear=(v:number)=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4;

/** Parse the shipped shader expression for CPU evaluation, so previews/tests
 * cannot quietly keep a different night-fill formula from the renderer.
 * Only the scalar GLSL subset used by this expression is interpreted.
 */
export function mappedOrbitLight(shader:string) {
  const expression=/#ifdef USE_MAP\nif \(uOrbitLight < 1.5\) outgoingLight = ([^;]+);/.exec(shader)?.[1];
  if(!expression)throw new Error('Mapped orbit fill expression missing');
  const scalar=expression
    .replaceAll('diffuseColor.rgb','albedo').replaceAll('uSelRim','rim')
    .replaceAll('abs(dot(normalize(vNormal),normalize(vViewPosition)))','mu');
  if(/[^\w\s.,()+*\-/]/.test(scalar))throw new Error('Unsupported mapped orbit expression');
  const evaluate=new Function('albedo','day','mu','rim','uOrbitFill','mix','step','vec3',`return ${scalar};`) as (...args:unknown[])=>number;
  return (albedo:RGB,day:number,mu:number,cinema:boolean,fill=.05):RGB=>albedo.map(v=>evaluate(v,day,mu,cinema?.35:.75,fill,(a:number,b:number,t:number)=>a*(1-t)+b*t,(a:number,b:number)=>b<a?0:1,(v:number)=>v)) as RGB;
}
