import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { TOKEN_NAMES } from '../../src/theme/theme';
import { resolveMaterialLook } from '../../src/engines/space-scene/lib/color';
const css=readFileSync(new URL('../../src/theme/tokens.css',import.meta.url),'utf8');
const tokens=(theme:string)=>{
 const at=css.indexOf(`:root[data-theme="${theme}"] {`),body=css.slice(at,css.indexOf('\n}',at));
 return Object.fromEntries([...body.matchAll(/--([a-z0-9-]+):\s*(#[0-9a-f]{6})/gi)].map(m=>[m[1]!,m[2]!]));
};
const rgb=(h:string)=>[1,3,5].map(i=>parseInt(h.slice(i,i+2),16));
const luminance=(h:string)=>rgb(h).map(v=>v/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4).reduce((s,v,i)=>s+v*[.2126,.7152,.0722][i]!,0);
describe('mineralised museum-bone token',()=>{
 it('is a named warm brown-grey in both themes, with a modest lift in cinema',()=>{
  expect(TOKEN_NAMES).toContain('fossil');
  const paper=tokens('paper'),cinema=tokens('cinema');
  expect(paper.fossil).toBe('#6e5a44');expect(cinema.fossil).toBe('#97816a');
  for(const t of [paper,cinema]){
   const [r,g,b]=rgb(t.fossil!);
   expect(r).toBeGreaterThan(g!);expect(g).toBeGreaterThan(b!);
   expect(r!-b!).toBeLessThan(50); // brown-grey, not saturated toy orange
   const a=luminance(t.fossil!),background=luminance(t.paper!);
   expect((Math.max(a,background)+.05)/(Math.min(a,background)+.05)).toBeGreaterThan(3);
  }
  expect(luminance(cinema.fossil!)).toBeGreaterThan(luminance(paper.fossil!));
  expect(luminance(cinema.fossil!)).toBeLessThan(luminance(cinema.bone!)*.6);
 });
 it.each(['paper','cinema'] as const)('resolves an opaque, non-glowing mineral surface on %s',theme=>{
  const t=tokens(theme),look=resolveMaterialLook('plastic',t,theme,'token:fossil');
  expect(look.color).toBe(t.fossil);expect(look.glow).toBe(0);expect(look.normal).toBe(0);
  expect(look.opacity).toBe(1);expect(look.metalness).toBe(0);expect(look.roughness).toBeGreaterThanOrEqual(.6);
 });
});
