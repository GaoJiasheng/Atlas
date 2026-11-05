import {describe,it,expect} from 'vitest';
import {readFileSync} from 'node:fs';
import {createElement} from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {shadowCones,solarLayout,lunarLayout,EclipseShadowSchematic} from '../../src/engines/space-scene/hud/EclipseShadowSchematic';

describe('sun-earth-moon F4: finite-source schematic geometry',()=>{
 it('has exact circle tangents, a converging umbra and diverging penumbra',()=>{
  for(const layout of [solarLayout,lunarLayout]){
   const {source,caster,end}=layout, cone=shadowCones(source,caster,end);
   expect(cone.u(caster.x)).toBeGreaterThan(cone.u(caster.x+10));
   expect(cone.p(caster.x)).toBeLessThan(cone.p(caster.x+10));
   expect(cone.u(cone.tip)).toBeCloseTo(0,12);
   // Distance from the axial tip to a tangent line equals each circle's radius.
   const slope=caster.r/Math.sqrt((cone.tip-caster.x)**2-caster.r**2);
   for(const circle of [source,caster])expect((cone.tip-circle.x)*slope/Math.sqrt(1+slope*slope)).toBeCloseTo(circle.r,12);
  }
 });
 it('Moon umbra just reaches Earth, with total and partial surface observers',()=>{
  const {source,caster,earth,end}=solarLayout,c=shadowCones(source,caster,end);
  const near=earth.x-earth.r;
  expect(c.tip).toBeGreaterThan(near);
  expect(c.tip-near).toBeLessThan(earth.r*.2);
  expect(c.u(near)).toBeGreaterThan(0);
  const partialX=earth.x-Math.sqrt(earth.r**2-15**2);
  expect(15).toBeGreaterThan(Math.abs(c.u(partialX)));
  expect(15).toBeLessThan(c.p(partialX));
 });
 it('distinguishes whole-Moon and partial-Moon intersection with Earth umbra',()=>{
  const {source,caster,total,partial,end}=lunarLayout,c=shadowCones(source,caster,end);
  // Signed perpendicular clearance from upper umbral boundary; body radii,
  // rather than centre-only classification, distinguish total from partial.
  const m=(source.r-caster.r)/(caster.x-source.x);
  const boundaryDistance=(moon:typeof total)=> (c.u(moon.x)-Math.abs(moon.y-caster.y))/Math.sqrt(1+m*m/(1-m*m));
  expect(boundaryDistance(total)).toBeGreaterThan(total.r);
  expect(Math.abs(boundaryDistance(partial))).toBeLessThan(partial.r);
  expect(partial.y-caster.y).not.toBe(0);
 });
 it('labels both languages, alternative Moon positions and schematic status explicitly',()=>{
  for(const zh of [false,true])for(const active of ['solar','lunar'] as const){
   const html=renderToStaticMarkup(createElement(EclipseShadowSchematic,{zh,active}));
   expect(html).toContain(zh?'示意，未按比例':'Schematic, not to scale');
   if(active==='lunar')expect(html).toContain(zh?'两个备选位置':'alternative positions');
   expect(html).toContain(zh?'全食':'Total');expect(html).toContain(zh?'偏食':'Partial');
   expect(html).not.toMatch(/#[a-f\d]{3,8}\b/i);
   expect(html.match(/role="img"/g)).toHaveLength(1);
  }
 });
 it('is installed: the schema accepts shadowDiagram and the topic opts into the schematic',()=>{
  expect(readFileSync('src/engines/space-scene/orbit-rotation-schema.ts','utf8')).toContain("shadowDiagram: z.enum(['true-scale', 'schematic']).optional()");
  const live=JSON.parse(readFileSync('src/content/topics/sun-earth-moon/data/parts.json','utf8'));
  expect(live.sim.orbitRotation.panel.shadowDiagram).toBe('schematic');
 });
});
