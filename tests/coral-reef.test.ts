import {readModel} from '../scripts/geo/coral-reef/read-model';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { parse as parseYaml } from 'yaml';
import { partsFile } from '../src/engines/space-scene/schema';
import { evaluateSim } from '../src/engines/space-scene/lib/sim';
import { resolveSimValues } from '../src/engines/space-scene/lib/sim/controls';
import { simEffects } from '../src/engines/space-scene/lib/sim/bind';
import { resolveAllPartDisplays } from '../src/engines/space-scene/lib/visibility';
import type { SimValues } from '../src/engines/space-scene/sim-schema';
import { solveHudRoom } from '../src/engines/core/hud-room';
import { BufferGeometry, DoubleSide, Euler, Mesh, MeshBasicMaterial, PerspectiveCamera, Raycaster, Vector3 } from 'three';
import { partPieces } from '../src/engines/space-scene/stages/model3d/geometry';
import { partBounds } from '../src/engines/space-scene/lib/parts';
import { fitCameraToHud, type FrameBox } from '../src/engines/space-scene/lib/hud-framing';
import { fitCameraToAspect } from '../src/engines/space-scene/lib/camera';

const dir = join(import.meta.dirname, '../src/content/topics/coral-reef');
const file = partsFile.parse(JSON.parse(readFileSync(join(dir, 'data/parts.json'), 'utf8')));
const sim = file.sim!;
const chapters = readdirSync(join(dir, 'chapters')).filter((f) => f.endsWith('.mdx')).sort().map((f) => {
  const text = readFileSync(join(dir, 'chapters', f), 'utf8');
  return { ...parseYaml(text.split(/^---$/m)[1]!), body: text.split(/^---$/m).slice(2).join('---') };
});
const evaluate = (values: SimValues = {}) => evaluateSim(sim, resolveSimValues(sim, values));
const effects = (values: SimValues) => simEffects(sim, resolveSimValues(sim, values), evaluate(values));
const at = (chapter: string, beat: number) => {
  const c = chapters.find((c) => c.id === chapter)!;
  return resolveSimValues(sim, { ...c.state.sim.set, ...c.state.beats[beat - 1].sim?.set });
};

const decoded=await readModel(join(import.meta.dirname,'../public',file.model!));
/** Assertions exercise the actual decoded stage surfaces, including codec transforms. */
function sculptGeometry(id:string):BufferGeometry {
 const p=decoded.meshes.get(id)?.[0];if(!p)throw Error(`Missing sculpted node: ${id}`);
 const g=p.geometry.clone().applyMatrix4(p.matrix);g.computeBoundingBox();return g;
}

// Independent curriculum graph, deliberately not read from the table or its foodWeb metadata.
// A work-list reachability oracle catches indirect support loss and disconnected components.
const producers = ['n-symbionts', 'n-phytoplankton', 'n-turf-algae'];
const consumers = ['n-zooplankton', 'n-coral', 'n-parrotfish'];
const nodes = [...producers, ...consumers];
const edges = [
  ['e-symbionts-coral', 'n-symbionts', 'n-coral'],
  ['e-phyto-zoo', 'n-phytoplankton', 'n-zooplankton'],
  ['e-zoo-coral', 'n-zooplankton', 'n-coral'],
  ['e-algae-parrotfish', 'n-turf-algae', 'n-parrotfish'],
] as const;
function graphOracle(remove: string, inspect: string): Record<string, number | string> {
  const present = new Set(nodes.filter((id) => id !== remove));
  const supported = new Set(producers.filter((id) => present.has(id)));
  const queue = [...supported];
  while (queue.length) {
    const source = queue.shift()!;
    for (const [, from, to] of edges) if (from === source && present.has(to) && !supported.has(to)) {
      supported.add(to); queue.push(to);
    }
  }
  const active = edges.filter(([, from, to]) => present.has(from) && present.has(to) && supported.has(from));
  const count = (id: string) => active.filter(([, , to]) => to === id).length;
  const status = (id: string) => !present.has(id) ? 'removed' : producers.includes(id) ? 'unchanged'
    : count(id) === 0 ? 'no-shown-food' : count(id) < edges.filter(([, , to]) => to === id).length ? 'fewer-foods' : 'unchanged';
  return {
    'present-count': present.size, 'supported-count': supported.size, 'active-links': active.length,
    ...Object.fromEntries(nodes.map((id) => [`status-${id}`, status(id)])),
    ...Object.fromEntries(edges.map(([id]) => [`active-${id}`, Number(active.some(([edge]) => edge === id))])),
    foods: count(inspect), 'food-status': status(inspect),
  };
}
const evidence = ['partnered', 'bleached-alive', 'dead-skeleton'];
const combinations = ['none', ...nodes].flatMap((remove) => consumers.flatMap((inspect) =>
  [1, 3, 7].flatMap((depth) => ['less-turbid', 'more-turbid'].flatMap((water) => evidence.map((state) => ({
    remove, inspect, 'depth-m': depth, 'water-case': water, 'evidence-state': state,
  }))))));

describe('coral-reef: finite model and independent science-content oracle', () => {
  it.each(combinations)('all outputs and isolation: $remove / $inspect / $depth-m / $water-case / $evidence-state', (values) => {
    const output = evaluate(values);
    const expected = {
      ...graphOracle(values.remove, values.inspect),
      'light-index': 100 * Math.exp(-(values['water-case'] === 'less-turbid' ? .1 : .5) * values['depth-m']),
      'haze-shown': Number(values['water-case'] === 'more-turbid'),
      'tissue-shown': Number(values['evidence-state'] !== 'dead-skeleton'),
      'partners-shown': Number(values['evidence-state'] === 'partnered'),
      'tissue-evidence': values['evidence-state'],
    };
    expect(Object.keys(output).sort()).toEqual(Object.keys(expected).sort());
    for (const [id, value] of Object.entries(expected)) {
      if (id === 'light-index') expect(output[id], id).toBeCloseTo(value as number, 10);
      else expect(output[id], id).toBe(value);
    }
  });

  it('has exactly 378 combinations, 20 outputs and 37 uniquely keyed, sourced rows', () => {
    expect(combinations).toHaveLength(378);
    expect(sim.kind).toBe('table');
    expect(sim.controls.map((c) => [c.id, c.kind, c.kind === 'step' ? c.values : c.kind === 'choice' ? c.options.map((o) => o.id) : [false, true]])).toEqual([
      ['remove', 'choice', ['none', 'n-symbionts', 'n-phytoplankton', 'n-zooplankton', 'n-coral', 'n-turf-algae', 'n-parrotfish']],
      ['inspect', 'choice', consumers], ['depth-m', 'step', [1, 3, 7]],
      ['water-case', 'choice', ['less-turbid', 'more-turbid']], ['evidence-state', 'choice', evidence],
    ]);
    expect(resolveSimValues(sim, {})).toEqual({ remove: 'none', inspect: 'n-coral', 'depth-m': 3, 'water-case': 'more-turbid', 'evidence-state': 'partnered' });
    expect(sim.outputs).toHaveLength(20);
    const experiments = Object.values(sim.table!.experiments);
    expect(experiments.map((e) => e.rows.length).sort((a, b) => a - b)).toEqual([3, 6, 7, 21]);
    expect(experiments.flatMap((e) => e.rows)).toHaveLength(37);
    for (const experiment of experiments) {
      for (const values of combinations) {
        expect(experiment.rows.filter((r) => experiment.keys.every((k) => r.when[k] === values[k as keyof typeof values]))).toHaveLength(1);
      }
      for (const row of experiment.rows) expect(row.source).toEqual(['S50']);
    }
    for (const output of sim.outputs.filter((o) => o.kind === 'number')) expect(output.tag).toBe('sim');
  });

  it.each([
    ['none', 6, 6, 4, 2, 'unchanged'], ['n-symbionts', 5, 5, 3, 1, 'fewer-foods'],
    ['n-phytoplankton', 5, 4, 2, 1, 'fewer-foods'], ['n-zooplankton', 5, 5, 2, 1, 'fewer-foods'],
    ['n-coral', 5, 5, 2, 0, 'removed'], ['n-turf-algae', 5, 4, 3, 2, 'unchanged'],
    ['n-parrotfish', 5, 5, 3, 2, 'unchanged'],
  ])('matches audited numerical case: removing %s', (remove, present, supported, links, foods, status) => {
    const o = evaluate({ remove, inspect: 'n-coral' });
    expect([o['present-count'], o['supported-count'], o['active-links'], o.foods, o['food-status']]).toEqual([present, supported, links, foods, status]);
  });

  it.each([
    [1, 'less-turbid', 90.48374180359595], [3, 'less-turbid', 74.08182206817179], [7, 'less-turbid', 49.65853037914095],
    [1, 'more-turbid', 60.653065971263345], [3, 'more-turbid', 22.313016014842983], [7, 'more-turbid', 3.0197383422318502],
  ])('retains full precision for illustrative light at %sm / %s', (depth, water, expected) => {
    expect(evaluate({ 'depth-m': depth, 'water-case': water })['light-index']).toBeCloseTo(expected as number, 10);
  });

  it('foodWeb metadata agrees with the independent food-to-consumer graph and its distinct specimens', () => {
    const web = sim.foodWeb!;
    expect(web.nodes).toHaveLength(6); expect(web.edges).toHaveLength(4);
    expect(web.nodes.map((n) => n.id).sort()).toEqual([...nodes].sort());
    expect(web.edges.map((e) => [e.id, e.from, e.to])).toEqual(edges);
    const specimens = web.nodes.flatMap((n) => n.parts);
    expect(new Set(specimens).size).toBe(6);
    for (const node of web.nodes) {
      expect(node.role).toBe(producers.includes(node.id) ? 'producer' : 'consumer');
      expect(node.output).toBe(`status-${node.id}`);
      expect(node.parts).toEqual([node.id.replace('n-', 'web-')]);
      expect(file.parts.find((p) => p.id === node.parts[0])?.context).not.toBe(true);
    }
    for (const edge of web.edges) {
      expect(edge.output).toBe(`active-${edge.id}`); expect(edge.evidence).toBe('general');
      expect(edge.sources.length).toBeGreaterThan(0); expect(edge.note.en).toBeTruthy(); expect(edge.note.zh).toBeTruthy();
    }
    const partner = web.edges.find((e) => e.id === 'e-symbionts-coral')!;
    expect(partner.note.en).toMatch(/food|product/i); expect(partner.note.en).toMatch(/swallow|eat|consum|ingest/i);
  });

  it('removal hides only its web specimen, keeps unsupported animals and drives matching flow intensity', () => {
    for (const remove of ['none', ...nodes]) {
      const o = evaluate({ remove }); const fx = effects({ remove });
      for (const node of sim.foodWeb!.nodes) expect(fx.hidden.has(node.parts[0]!)).toBe(node.id === remove);
      expect(fx.hidden.has('polyp-tissue')).toBe(false); expect(fx.hidden.has('polyp-symbionts')).toBe(false);
      for (const [id] of edges) expect(fx.flows.get(id)?.uniform, id).toBe(o[`active-${id}`]);
    }
    expect(evaluate({ remove: 'n-phytoplankton', inspect: 'n-zooplankton' })['food-status']).toBe('no-shown-food');
    expect(effects({ remove: 'n-phytoplankton' }).hidden.has('web-zooplankton')).toBe(false);
    expect(evaluate({ remove: 'n-turf-algae', inspect: 'n-parrotfish' })['food-status']).toBe('no-shown-food');
  });

  it('keeps a static food-to-consumer arrow for each active path, including when flow motion is paused', () => {
    for (const [id, from, to] of edges) {
      const arrowId = id.replace(/^e-/, 'food-arrow-');
      const arrow = file.parts.find((p) => p.id === arrowId)!;
      expect(arrow, id).toBeDefined();
      expect(arrow.context).toBe(true);
      expect(arrow.group).toBe('feeding-flows');
      expect(file.flows.find((f) => f.id === id)?.parts).toEqual([from.replace('n-', 'web-'), to.replace('n-', 'web-')]);
      expect(sim.bind).toContainEqual(expect.objectContaining({ output: `active-${id}`, part: arrowId, visible: { eq: 1 } }));
      const cone = arrow.extra?.find((p) => p.kind === 'cone');
      if (cone?.kind !== 'cone') throw new Error(`Missing direction head: ${id}`);
      const rotation = cone.rotation ?? [0, 0, 0];
      const tip = new Vector3(0, cone.size[1]! / 2, 0)
        .applyEuler(new Euler(...rotation.map((v) => v * Math.PI / 180) as [number, number, number], 'XYZ'))
        .add(new Vector3(...cone.at));
      const end = file.flows.find((f) => f.id === id)!.path.at(-1)!;
      for (const axis of [0, 1, 2]) expect(tip.getComponent(axis), `${id}: cone tip axis ${axis}`).toBeCloseTo(end[axis]! + (axis === 2 ? .13 : 0), 6);
      // Reachability, including indirect loss of support, determines the annotations.
      // They are ordinary geometry, so pausing particles or reduced motion keeps their direction readable.
      for (const remove of ['none', ...nodes]) {
        const active = graphOracle(remove, 'n-coral')[`active-${id}`] === 1;
        expect(effects({ remove }).hidden.has(arrowId), `${id}/${remove}`).toBe(!active);
      }
    }
    for (const c of chapters) {
      const teachesWeb = ['sunlight-and-food', 'changing-one-node'].includes(c.id);
      for (const beat of [null, ...c.state.beats]) {
        const state = { ...c.state, ...beat };
        expect(state.layers.includes('feeding-flows'), `${c.id}/${beat?.id ?? 'base'}`).toBe(teachesWeb);
      }
    }
  });

  it('lets the shared HUD solver fold the web card before preserving the model band at 1024 × 768', () => {
    // Shared solver fixture: this is a policy check, not a browser layout measurement.
    const room = solveHudRoom({ width: 1024, height: 768 }, {
      top: 90, bottom: 90, reader: 400, edge: 24, tab: 44,
      left: { width: 300, height: 580, metadata: 180 },
      right: { width: 264, height: 500, legends: 160, card: 180 },
    });
    expect(room.steps).toEqual(['legends', 'card', 'metadata', 'left']);
    expect(room.folds).toMatchObject({ cardOpen: false, legendsOpen: false, leftColumn: 'collapsed', reader: true });
    expect(room.stage.x1 - room.stage.x0).toBe(532);
    expect(room.stage.y1 - room.stage.y0).toBe(588);
    expect(room.meetsShare).toBe(true);
  });

  it.each(evidence)('uses tissue evidence rather than whiteness, with skeleton retained: %s', (state) => {
    const fx = effects({ 'evidence-state': state });
    for (const id of ['polyp-tissue', 'polyp-mouth', 'polyp-tentacles']) expect(fx.hidden.has(id)).toBe(state === 'dead-skeleton');
    expect(fx.hidden.has('polyp-symbionts')).toBe(state !== 'partnered');
    expect(fx.hidden.has('polyp-skeleton')).toBe(false);
    expect(fx.hidden.has('web-symbionts')).toBe(false);
  });

  it('binds the light index only to a marker and haze to visibility', () => {
    for (const water of ['less-turbid', 'more-turbid']) {
      const v = { 'water-case': water, 'depth-m': 7 };
      expect(effects(v).hidden.has('water-haze')).toBe(water === 'less-turbid');
      expect(effects(v).offset.get('light-marker')).toEqual([0, Number(evaluate(v)['light-index']) * .01, 0]);
    }
    const bindings = sim.bind.filter((b) => b.output === 'light-index');
    expect(bindings).toHaveLength(1);
    expect(bindings[0]).toMatchObject({ part: 'light-marker', offset: { axis: [0, 1, 0], per: .01, origin: 0 } });
  });

  it('has BG + 7 chapters / 39 beats, and indexes all 26 selectable parts without context', () => {
    expect(chapters).toHaveLength(8);
    expect(chapters.map((c) => c.state.beats.length)).toEqual([4, 5, 5, 5, 5, 5, 5, 5]);
    expect(file.parts.filter((p) => !p.context)).toHaveLength(26);
    expect(file.parts.filter((p) => p.context)).toHaveLength(6);
    expect(file.parts).toHaveLength(32);
    expect(statSync(join(import.meta.dirname,'../public',file.model!)).size).toBeLessThanOrEqual(1_500_000);
    expect(file.views.hudFrame?.parts).toEqual(file.parts.filter((p) => !p.context).map((p) => p.id));
    const indexed = new Set<string>(chapters.flatMap((c) => c.state.index.parts));
    expect([...indexed].sort()).toEqual(file.parts.filter((p) => !p.context).map((p) => p.id).sort());
    expect(file.flows.map((f) => f.id).sort()).toEqual(edges.map(([id]) => id).sort());
    expect(file.flows.reduce((n, f) => n + f.count, 0)).toBeLessThanOrEqual(80);
  });

  it('has twelve short rounded fingers surrounding an open oval mouth', () => {
    const fingers = sculptGeometry('polyp-tentacles');
    const positions = fingers.getAttribute('position');
    const peaks: number[] = [], widths: number[] = [];
    for (let k = 0; k < 12; k++) {
      const angle = k * Math.PI / 6 + .025 * Math.sin(k * 2.1);
      const points = Array.from({ length: positions.count }, (_, i) => new Vector3().fromBufferAttribute(positions, i))
        .filter(p => Math.hypot(p.x - 5, p.z) > .27 && Math.abs(Math.atan2(Math.sin(Math.atan2(p.z,p.x-5)-angle), Math.cos(Math.atan2(p.z,p.x-5)-angle))) < .15);
      expect(points.length).toBeGreaterThan(30);
      const peak = Math.max(...points.map(p => p.y));
      peaks.push(peak);
      expect(peak).toBeGreaterThan(.58); expect(peak).toBeLessThan(.68);
      const shaft = points.filter(p => p.y > .52 && p.y < .55);
      const tangential = shaft.map(p => -(p.x-5)*Math.sin(angle)+p.z*Math.cos(angle));
      widths.push(Math.max(...tangential)-Math.min(...tangential));
    }
    expect(Math.max(...peaks)-Math.min(...peaks)).toBeGreaterThan(.04);
    for (const width of widths) expect(width).toBeGreaterThan(.040);
    expect(fingers.boundingBox!.getSize(new Vector3()).y).toBeLessThan(.24);
    fingers.dispose();
    for (const id of ['polyp-tissue','polyp-mouth','polyp-skeleton','polyp-tentacles']) {
      const part = file.parts.find(p => p.id === id)!;
      expect(part.mesh).toBe(id); expect(part.primitive).toBeUndefined();
    }
    const mouth = sculptGeometry('polyp-mouth');
    const size = mouth.boundingBox!.getSize(new Vector3());
    expect(size.x / size.z).toBeGreaterThan(1.8);
    expect(size.x / size.z).toBeLessThan(2.2); // rounded oval, no pinched eye corners
    expect(size.y).toBeGreaterThan(.06); // a real recessed throat
    const polypChapter = chapters.find(c => c.id === 'coral-and-partners')!;
    const beat = polypChapter.state.beats[1];
    expect(beat.labels).toContain('polyp-mouth');
    expect(beat.camera.position[1] - beat.camera.target[1]).toBeGreaterThan(beat.camera.position[2] - beat.camera.target[2]);
    mouth.dispose();
  });

  it('closes all foliose rims, undersides and central attachments', () => {
    const geometry = sculptGeometry('colony-sheet'), position = geometry.getAttribute('position'), index = geometry.index!;
    const edges = new Map<string, number>();
    const vertex = (i:number) => [position.getX(i),position.getY(i),position.getZ(i)].map(v=>v.toFixed(6)).join(',');
    for(let i=0;i<index.count;i+=3) for(let j=0;j<3;j++) {
      const a=vertex(index.getX(i+j)),b=vertex(index.getX(i+(j+1)%3));
      if(a===b) continue;
      const key=[a,b].sort().join('|');edges.set(key,(edges.get(key)??0)+1);
    }
    expect([...edges.values()].filter(n=>n===1)).toHaveLength(0);
    geometry.dispose();
  });

  it('keeps the labelled mouth unobstructed and the polyp large after the HUD refit', () => {
    const ch=chapters.find(c=>c.id==='coral-and-partners')!,beat=ch.state.beats[1];
    const boxes:FrameBox[]=file.parts.filter(p=>!p.context&&!ch.state.hide.includes(p.id)).map(p=>{
      const g=p.mesh?sculptGeometry(p.mesh):undefined;
      const b=g?.boundingBox??partBounds(p)!;
      const min=b.min instanceof Vector3?b.min.toArray():b.min,max=b.max instanceof Vector3?b.max.toArray():b.max;
      g?.dispose();
      return {center:min.map((v,i)=>(v+max[i]!)/2) as [number,number,number],half:min.map((v,i)=>(max[i]!-v)/2) as [number,number,number]};
    });
    const material=new MeshBasicMaterial({side:DoubleSide});
    const opaque=['polyp-mouth','polyp-tentacles','polyp-skeleton'].map(id=>{
      const mesh=new Mesh(sculptGeometry(id),material);mesh.name=id;mesh.updateMatrixWorld();return mesh;
    });
    for(const fixture of [
      {width:1520,height:1023,rect:{x0:340,y0:12,x1:1150,y1:951},panels:[{x0:28,y0:12,x1:328,y1:951},{x0:1162,y0:12,x1:1508,y1:610},{x0:12,y0:963,x1:1508,y1:1023}]},
      {width:624,height:711,rect:{x0:56,y0:12,x1:612,y1:621},panels:[{x0:0,y0:12,x1:44,y1:621},{x0:0,y0:633,x1:624,y1:711}]},
    ]) {
      const {width,height,rect,panels}=fixture;
      const fitted=fitCameraToHud(fitCameraToAspect(beat.camera,width/height),boxes,width,height,rect,{panels});
      const camera=new PerspectiveCamera(30,width/height,.001,100);camera.position.set(...fitted.position);camera.lookAt(new Vector3(...fitted.target));camera.updateMatrixWorld();
      const mouth=new Vector3(5,.53,0),projection=mouth.clone().project(camera);
      const x=(projection.x+1)*width/2,y=(1-projection.y)*height/2;
      expect(x).toBeGreaterThan(rect.x0);expect(x).toBeLessThan(rect.x1);
      expect(y).toBeGreaterThan(rect.y0);expect(y).toBeLessThan(rect.y1);
      const ray=new Raycaster(camera.position,mouth.sub(camera.position).normalize());
      expect(ray.intersectObjects(opaque)[0]?.object.name).toBe('polyp-mouth');
      const position=opaque[1]!.geometry.getAttribute('position');
      const xs=Array.from({length:position.count},(_,i)=>(new Vector3().fromBufferAttribute(position,i).project(camera).x+1)*width/2);
      expect(Math.max(...xs)-Math.min(...xs)).toBeGreaterThan((rect.x1-rect.x0)*.50);
    }
    for(const mesh of opaque)mesh.geometry.dispose();material.dispose();
  });

  it('ends the living-tissue leader on tissue above the opaque cup, visible from both tissue chapters', () => {
    const point=decoded.labelPoints.get('polyp-tissue')!.clone();
    const tissue = sculptGeometry('polyp-tissue');
    const position = tissue.getAttribute('position');
    let near = Infinity;
    for (let i = 0; i < position.count; i++) near = Math.min(near, new Vector3().fromBufferAttribute(position, i).distanceTo(point));
    expect(near).toBeLessThan(.06);
    // The bounds centre the leader used to end on lies inside the cup; the point is above its rim.
    const cup = sculptGeometry('polyp-skeleton');
    expect(tissue.boundingBox!.getCenter(new Vector3()).y).toBeLessThan(cup.boundingBox!.max.y);
    expect(point.y).toBeGreaterThan(cup.boundingBox!.max.y + .02);
    const material = new MeshBasicMaterial({ side: DoubleSide });
    const occluders = ['polyp-skeleton', 'polyp-tentacles', 'polyp-mouth'].map((id) => {
      const mesh = new Mesh(id === 'polyp-skeleton' ? cup : sculptGeometry(id), material); mesh.updateMatrixWorld(); return mesh;
    });
    const wall = new Mesh(tissue, material); wall.updateMatrixWorld();
    for (const id of ['coral-and-partners', 'bleaching-and-pressures']) {
      const eye = new Vector3(...chapters.find((c) => c.id === id)!.state.camera.position);
      const ray = new Raycaster(eye, point.clone().sub(eye).normalize(), 0, eye.distanceTo(point) - .02);
      expect(ray.intersectObjects(occluders), id).toHaveLength(0);
      // The first tissue surface on that line of sight is the labelled point itself.
      ray.far = Infinity;
      expect(ray.intersectObject(wall)[0]!.point.distanceTo(point), id).toBeLessThan(.003);
    }
    for (const mesh of occluders) mesh.geometry.dispose();
    tissue.dispose(); material.dispose();
  });

  it('contains every algal-marker vertex within the actual sculpted tissue wall', () => {
    const geometry = sculptGeometry('polyp-tissue');
    const material = new MeshBasicMaterial({ side: DoubleSide });
    const wall = new Mesh(geometry, material); wall.updateMatrixWorld();
    const ray = new Raycaster();
    const partners = file.parts.find((p) => p.id === 'polyp-symbionts')!;
    for (const marker of [partners.primitive!, ...partners.extra!]) {
      if (marker.kind !== 'lathe') throw new Error('Partner markers must be smooth closed cells');
      for (const [radius, y] of marker.profile) for (let i = 0; i < 12; i++) {
        const angle = i * Math.PI / 6;
        const point = new Vector3(marker.at[0] + radius * Math.cos(angle), marker.at[1] + y, marker.at[2] + radius * Math.sin(angle));
        const radial = new Vector3(point.x - 5, 0, point.z), distance = radial.length();
        ray.set(new Vector3(5, point.y, 0), radial.normalize());
        const intersections = ray.intersectObject(wall).map((hit) => hit.distance)
          .filter((d, k, all) => k === 0 || Math.abs(d - all[k - 1]!) > 1e-6);
        expect(intersections.length, `marker ${marker.at} point ${point.toArray()} intersections ${intersections}`).toBeGreaterThanOrEqual(2);
        expect(distance, `marker ${marker.at.join(',')}`).toBeGreaterThanOrEqual(intersections[0]! - 1e-6);
        expect(distance, `marker ${marker.at.join(',')}`).toBeLessThanOrEqual(intersections[1]! + 1e-6);
      }
    }
    geometry.dispose(); material.dispose();
  }, 20000);

  it('renders a one-metre square quadrat with four straight sides and a crossing five-by-five grid', () => {
    const quadrat = file.parts.find((p) => p.id === 'monitoring-quadrat')!;
    const frame = partPieces({ primitive: quadrat.primitive! });
    const vertices = frame.flatMap((piece) => {
      const positions = piece.geometry.getAttribute('position');
      return Array.from({ length: positions.count }, (_, i) => new Vector3().fromBufferAttribute(positions, i));
    });
    const widths = [0, 2].map((axis) => Math.max(...vertices.map((v) => v.getComponent(axis))) - Math.min(...vertices.map((v) => v.getComponent(axis))));
    expect(widths[0]).toBeCloseTo(1.025, 3);
    expect(widths[1]).toBeCloseTo(widths[0]!, 3);
    // Actual tessellation must stay along four edges; an oval with the same bounds fails this.
    const edgeDeviation = Math.max(...vertices.map((p) => Math.min(Math.abs(Math.abs(p.x) - .5), Math.abs(Math.abs(p.z) - .5))));
    expect(edgeDeviation).toBeLessThan(.035);
    for (const axis of ['x', 'z'] as const) for (const sign of [-1, 1]) for (const along of [-.4, -.2, 0, .2, .4]) {
      const sample = axis === 'x' ? new Vector3(sign * .5, 0, along) : new Vector3(along, 0, sign * .5);
      expect(Math.min(...vertices.map((v) => v.distanceTo(sample)))).toBeLessThan(.02);
    }
    frame.forEach((p) => p.geometry.dispose());

    const strings = quadrat.extra!.filter((p) => p.color === 'fabric');
    expect(strings).toHaveLength(8);
    const rows: number[] = [], columns: number[] = [];
    for (const string of strings) {
      const pieces = partPieces({ primitive: string });
      expect(pieces).toHaveLength(1);
      const geometry = pieces[0]!.geometry; geometry.computeBoundingBox();
      const box = geometry.boundingBox!, size = box.getSize(new Vector3()), centre = box.getCenter(new Vector3());
      if (size.x > .99 && size.z < .005) rows.push(centre.z);
      else if (size.z > .99 && size.x < .005) columns.push(centre.x);
      else throw new Error('Each grid string must span one metre across the opposite pair of frame sides');
      geometry.dispose();
    }
    for (const positions of [rows, columns]) {
      expect(positions).toHaveLength(4);
      positions.sort((a, b) => a - b);
      positions.forEach((v, i) => expect(v).toBeCloseTo(-.3 + i * .2, 4));
    }
    expect(rows.length * columns.length).toBe(16);
  });

  it('keeps all loaded specimen and annotation tessellation within 350,000 triangles', () => {
    const data = readFileSync(join(import.meta.dirname, '../public', file.model!));
    const gltf = JSON.parse(data.subarray(20, 20 + data.readUInt32LE(12)).toString());
    let triangles = 0;
    for (const part of file.parts) {
      if (part.mesh) {
        const node = gltf.nodes.find((n: { name: string }) => n.name === part.mesh);
        expect(node, part.id).toBeDefined();
        for (const primitive of gltf.meshes[node.mesh].primitives) {
          expect(primitive.mode ?? 4, part.id).toBe(4);
          triangles += gltf.accessors[primitive.indices ?? primitive.attributes.POSITION].count / 3;
        }
      }
      for (const piece of partPieces(part)) {
        if (!piece.lines) triangles += (piece.geometry.index?.count ?? piece.geometry.getAttribute('position').count) / 3 * (piece.matrices?.length ?? 1);
        piece.geometry.dispose();
      }
    }
    // Includes every offscreen study and all contextual arrows, a stricter ceiling than one camera.
    expect(triangles).toBeLessThanOrEqual(350000);
  });

  it('resets every chapter and never labels an object hidden by its beat or evidence', () => {
    for (const c of chapters) {
      expect(c.state).toMatchObject({ view: 'assembled', run: false, explode: 0, cutaway: 'none' });
      expect(c.state.sim.set).toEqual({ remove: 'none', inspect: 'n-coral', 'depth-m': 3, 'water-case': 'more-turbid', 'evidence-state': 'partnered' });
      for (const beat of c.state.beats) {
        expect(beat.caption.en).toBeTruthy(); expect(beat.caption.zh).toBeTruthy();
        const hidden = new Set([...(beat.hide ?? c.state.hide ?? []), ...effects({ ...c.state.sim.set, ...beat.sim?.set }).hidden]);
        for (const id of beat.labels ?? c.state.labels ?? []) expect(hidden.has(id), `${c.id}/${beat.id}: ${id}`).toBe(false);
      }
    }
  });

  it('keeps every named camera target stage available from each chapter and beat', () => {
    const groups: Record<string, string> = { hero: 'reef-habitat', reef: 'reef-habitat', polyp: 'polyp-closeup', web: 'web-specimens', evidence: 'evidence-tools', conservation: 'evidence-tools' };
    expect(file.presets?.map((p) => p.id).sort()).toEqual(Object.keys(groups).sort());
    for (const c of chapters) for (const beat of [null, ...c.state.beats]) {
      const state = { ...c.state, ...beat };
      const fx = effects({ ...c.state.sim.set, ...beat?.sim?.set });
      const display = resolveAllPartDisplays(file.parts, {
        view: state.view, part: state.part ?? null, layers: state.layers,
        hidden: [...(state.hide ?? []), ...fx.hidden], ghosted: state.ghost ?? [],
      });
      for (const preset of file.presets!) {
        const candidates = file.parts.filter((p) => p.group === groups[preset.id] && !p.context);
        expect(candidates.some((p) => display.get(p.id)?.visible), `${c.id}/${beat?.id ?? 'base'} → ${preset.id}`).toBe(true);
      }
    }
  });

  it('chapter food captions, prediction and record agree with actual counts', () => {
    for (const [beat, count, status] of [[1, 2, 'unchanged'], [2, 1, 'fewer-foods'], [3, 0, 'no-shown-food'], [4, 1, 'fewer-foods']] as const) {
      const o = evaluate(at('changing-one-node', beat));
      expect([o.foods, o['food-status']]).toEqual([count, status]);
    }
    const card = chapters.find((c) => c.id === 'changing-one-node')!.state.sim.try;
    expect(card.record).toBe(true);
    expect(evaluate(card.predict.start).foods).toBe(2);
    expect(evaluate({ ...card.predict.start, ...card.predict.change }).foods).toBe(1);
    expect(card.predict.change).toMatchObject({ remove: 'n-symbionts' });
    expect(card.predict.options.find((o: { means: string }) => o.means === 'less')).toBeDefined();
    expect(chapters.find((c) => c.id === 'reef-zones')!.state.sim.try).toMatchObject({ vary: 'depth-m', also: ['water-case'], observe: ['light-index'] });
    expect(chapters.find((c) => c.id === 'bleaching-and-pressures')!.state.sim.try).toMatchObject({ vary: 'evidence-state', observe: ['tissue-evidence'] });
  });

  it('bleaching captions retain living tissue in the bleached state and never automatically restore partners', () => {
    for (const [beat, tissue, partners] of [[1, 1, 1], [2, 1, 0], [3, 0, 0], [5, 1, 0]]) {
      const o = evaluate(at('bleaching-and-pressures', beat!));
      expect([o['tissue-shown'], o['partners-shown']]).toEqual([tissue, partners]);
    }
  });
});
