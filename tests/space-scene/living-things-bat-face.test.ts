/** Fruit-bat cues must survive source edits; decoded budget/fitting is checked
 * by living-things-realism and the before/after audit script. */
import {describe,it,expect} from 'vitest';
import {BufferGeometry,DoubleSide,Mesh,MeshBasicMaterial,Raycaster,Vector3} from 'three';
import {sculptedFruitBat} from '../../scripts/geo/living-things/specimens/bat';

describe('Cynopterus face',()=>{
 it('has two convex 2.2 mm globes projecting at least 1.2 mm beyond skin',()=>{
  const model=sculptedFruitBat(),geometries=[model.primitive,...model.extra].map(p=>p.geometry as BufferGeometry);
  const skin=geometries.find(g=>g.userData.anatomy==='cranial-skin')!;
  const proxy=new Mesh(skin,new MeshBasicMaterial({side:DoubleSide}));
  const eyes=geometries.filter(g=>g.userData.anatomy==='eyeball');expect(eyes).toHaveLength(2);
  for(const eye of eyes){
   eye.computeBoundingBox();const centre=eye.boundingBox!.getCenter(new Vector3()),side=Math.sign(centre.x),N=new Vector3(side*.52,.13,.844).normalize();
   const p=eye.getAttribute('position');let low=Infinity,high=-Infinity,pole=-Infinity;
   for(let i=0;i<p.count;i++){const d=new Vector3().fromBufferAttribute(p,i).sub(centre);low=Math.min(low,d.length());high=Math.max(high,d.length());pole=Math.max(pole,d.dot(N));}
   expect(low).toBeGreaterThan(.00215);expect(high).toBeLessThan(.00225);
   const ray=new Raycaster(centre.clone().addScaledVector(N,.025),N.clone().negate());const hit=ray.intersectObject(proxy)[0]!;
   expect(pole-hit.point.sub(centre).dot(N)).toBeGreaterThan(.0012);
   const colour=eye.getAttribute('color');let black=0,amber=0;
   for(let i=0;i<colour.count;i++){if(colour.getX(i)<.01)black++;if(colour.getX(i)>.04&&colour.getX(i)>colour.getY(i)*1.5)amber++;}
   expect(black).toBeGreaterThan(50);expect(amber).toBeGreaterThan(50);
  }
  (proxy.material as MeshBasicMaterial).dispose();geometries.forEach(g=>g.dispose());
 });
 it('has a raised brow, parallel-sided short muzzle and two deep tubular nares',()=>{
  const model=sculptedFruitBat(),gs=[model.primitive,...model.extra].map(p=>p.geometry as BufferGeometry),head=gs.find(g=>g.userData.anatomy==='cranial-skin')!,p=head.getAttribute('position');
  let crown=-Infinity,bridge=-Infinity;const widths=[0,0];
  for(let i=0;i<p.count;i++){const x=p.getX(i),y=p.getY(i),z=p.getZ(i);if(z>.001&&z<.006)crown=Math.max(crown,y);if(z>.009&&z<.011)bridge=Math.max(bridge,y);if(Math.abs(z-.0105)<.00035)widths[0]=Math.max(widths[0]!,Math.abs(x));if(Math.abs(z-.012)<.00035)widths[1]=Math.max(widths[1]!,Math.abs(x));}
  expect(crown-bridge).toBeGreaterThan(.005);expect(widths[1]!/widths[0]!).toBeGreaterThan(.85);
  const nares=gs.filter(g=>g.userData.anatomy==='tubular-nostril');expect(nares).toHaveLength(2);
  for(const naris of nares){naris.computeBoundingBox();const box=naris.boundingBox!;expect(box.max.z-box.min.z).toBeGreaterThan(.0013);}
  gs.forEach(g=>g.dispose());
 });
});
