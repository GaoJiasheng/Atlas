/**
 * MathScene content rules for nets and solids (docs/39 §3.8, N6), beside the
 * other domains' in `validate.ts`: a net can be drawn as written (the solid
 * in range, a layout that fits it — squares for a cube, rectangles for a
 * cuboid, faces on faces that share an edge — joined up and not overlapping
 * flat, its base, open face, folds, colours and marks naming its faces, a
 * sphere only folded, a triangle for a cone only flat); every task's answer
 * is what folding says — a choice's pictures, names and "it folds / it does
 * not" checked against the geometry, a net to complete with a way to close
 * and not closed at the start, a face to tap with one answer, a number the
 * net's own — and every declared code is one the task can diagnose; curved
 * solids are only named, never completed or tapped (docs/39 D3); the step's
 * solids. Build time only; shared with `scripts/math/check-pool.ts`.
 */
import type { MisconceptionCode, NetModelSpec, NetSpec, StepLimits, Task } from './schema';
import { buildNet, flatBox, flatOverlap, foldResult, looseNodes, nodeIndex, type Net } from './lib/net';
import { capsOf } from './lib/curved';
import { edgeLengths, faceIds, isCurved, oppositeFace, sameSolid, shareEdge, solid as polyhedron, solidClass } from './lib/solid';
import { netItems } from './lib/net-view';
import { childSpec, completeSolution, completeSolutions, foldedOf, isNetModel, markOf, netOfSpec, netNumberCtx, tapAnswer, taskNetSpec } from './lib/net-tasks';
import { claimShows, foldedCodes, namesShow, pictureShows } from './lib/diagnose/nets';
import { sampleState } from './lib/solve';
import { inputSpecOf } from './lib/state';
import { answerValues } from './lib/forms';
import { isFracValue } from './lib/value';

/** Most squares a net is drawn on (a free task's paper is smaller: 12 × 10). */
const SHOWN: [number, number] = [24, 16];
export const PAPER_MAX: [number, number] = [12, 10];
const GRID_FACES = ['bottom', 'top', 'front', 'back', 'left', 'right'];

/* ------------------------------------------------------------------ */
/* Models                                                               */
/* ------------------------------------------------------------------ */

/** Can one net spec be drawn as written? */
function specIssues(spec: NetSpec, where: string): string[] {
  const out: string[] = [];
  const err = (m: string) => out.push(`${where}${m}`);
  const s = spec.solid;
  if (!s) return [`${where}a net needs its solid`];
  if (s.type === 'cuboid' && s.size.some((v) => !Number.isInteger(v) || v < 1 || v > 4)) err('a cuboid\'s lengths are whole squares, 1–4');
  if (s.type === 'pyramid' && s.regular && s.sides !== 3) err('regular is for a pyramid on a triangle (the regular tetrahedron)');
  if (s.type === 'pyramid' && s.regular && s.height !== undefined) err('a regular pyramid has its own height (leave height out)');
  if (s.type === 'prism' && s.sides === 4 && s.edge === s.length) err('a prism on a square as long as its base is a cube: write it as a cuboid');
  const l = spec.layout;
  if (isCurved(s)) {
    if (l) err(`a ${s.type} has no polygon layout (its net is curved)`);
    if (spec.curved && s.type === 'sphere') err('a sphere has no net');
    if (s.type === 'sphere' && spec.fold !== undefined && spec.fold !== 1) err('a sphere is only drawn whole (fold: 1)');
    if (s.type === 'cylinder' || s.type === 'cone') {
      const c = spec.curved;
      const caps = capsOf(s, c);
      const fold = typeof spec.fold === 'number' ? spec.fold : spec.fold === undefined && !c ? 1 : 0;
      if (typeof spec.fold === 'object') err('a curved net folds as one (fold: a number)');
      if (c?.lateral && s.type !== 'cone') err('lateral is for a cone');
      if (c?.lateral === 'triangle' && fold !== 0) err('a triangle for a cone\'s curved face is a wrong net: fold 0 only');
      if (fold > 0 && s.type === 'cylinder' && !caps.some((x) => x.edge === 'bottom')) err('a cylinder\'s net folds from a circle on its bottom edge');
      if (fold > 0 && s.type === 'cone' && caps.length !== 1) err('a cone\'s net folds with one circle (a second one: fold 0 only)');
      if (s.type === 'cone' && caps.some((x) => x.edge === 'top')) err('a cone\'s circle is on its curved edge (no top edge)');
    }
    if (spec.pairs) err('pairs are a cuboid\'s or a prism\'s');
    if (spec.grid || spec.mark !== undefined || spec.letters || spec.numbers || spec.open || spec.base !== undefined) err('grid, mark, letters, numbers, open and base are for a polyhedron\'s net');
    for (const k of Object.keys(spec.tone ?? {})) if (!faceIds(s).includes(k)) err(`tone "${k}" is not a face of a ${s.type} (${faceIds(s).join(', ')})`);
    return out;
  }
  if (spec.curved) err('curved is for a cylinder or a cone');
  if (l && 'cubeNet' in l && !(s.type === 'cuboid' && solidClass(s) === 'cube' && s.size[0] === 1)) err('a named cube net is a 1 × 1 × 1 cube\'s');
  if (l && 'cells' in l && !(s.type === 'cuboid' && s.size.every((v) => v === 1))) err('cells are squares: the solid is a 1 × 1 × 1 cube (rectangles: rects)');
  if (l && 'rects' in l && s.type !== 'cuboid') err('rects are a cuboid\'s faces (other solids: tree)');
  if (l && 'cells' in l && new Set(l.cells.map((c) => c.join())).size !== l.cells.length) err('a square is listed twice');
  let net: Net;
  try {
    net = buildNet({ ...spec, solid: s });
  } catch {
    return [...out, `${where}the layout cannot be read`];
  }
  if (l && 'tree' in l) {
    const p = polyhedron(s)!;
    const roots = l.tree.filter(([, par]) => par === null);
    if (roots.length !== 1) err(`a tree has one face on the ground (parent null), found ${roots.length}`);
    for (const [face, par] of l.tree) {
      if (!p.faces.some((f) => f.id === face)) err(`"${face}" is not a face of the ${solidClass(s)} (${p.faces.map((f) => f.id).join(', ')})`);
      if (par !== null && !l.tree.some(([f]) => f === par)) err(`"${face}" hangs on "${par}", which is not in the net`);
      else if (par !== null && !shareEdge(s, face, par)) err(`"${face}" and "${par}" do not share an edge`);
    }
  }
  if (looseNodes(net).length) err('the net is in more than one piece');
  if (flatOverlap(net).length) err('faces lie over each other before the net is folded');
  const box = flatBox(net);
  if (box.w > SHOWN[0] || box.h > SHOWN[1]) err(`the net is ${Math.ceil(box.w)} × ${Math.ceil(box.h)} squares (shown ≤ ${SHOWN[0]} × ${SHOWN[1]})`);
  if (spec.base !== undefined) {
    const b = spec.base;
    const ok = Array.isArray(b) ? net.nodes.some((n) => n.key === `${b[0]},${b[1]}`) : typeof b === 'number' ? b < net.nodes.length && net.layout === 'rects' : net.layout === 'tree' ? l !== undefined && 'tree' in l && l.tree.some(([f]) => f === b) : false;
    if (!ok) err(`base ${JSON.stringify(b)} is not a face of this net (a cell [x, y], a rectangle's index, a tree's face)`);
    if (net.layout === 'tree' && l && 'tree' in l && l.tree.find(([, par]) => par === null)?.[0] !== b) err('a tree\'s base is its root (the face with parent null)');
  }
  const faces = net.layout === 'tree' ? faceIds(s) : GRID_FACES;
  if (spec.open && !faces.includes(spec.open)) err(`open "${spec.open}" is not a face (${faces.join(', ')})`);
  if (typeof spec.fold === 'object') for (const k of Object.keys(spec.fold)) if (nodeIndex(net, k) === null) err(`fold "${k}" names no face of the net`);
  for (const k of Object.keys(spec.tone ?? {})) if (nodeIndex(net, k) === null) err(`tone "${k}" names no face of the net`);
  if (spec.mark !== undefined && nodeIndex(net, spec.mark) === null) err(`mark "${spec.mark}" names no face of the net`);
  for (const k of Object.keys(spec.labels ?? {})) if (!faces.includes(k)) err(`labels "${k}" is not a face (${faces.join(', ')})`);
  if (spec.pairs && s.type !== 'cuboid' && s.type !== 'prism') err('pairs are a cuboid\'s or a prism\'s');
  if (spec.dims && net.layout === 'cells') err('dims counts the squares where rectangles meet: rects, a tree or a curved net');
  if ((spec.letters || spec.numbers) && net.nodes.length > 6) err('letters and numbers name up to 6 faces');
  if (spec.letters && spec.numbers) err('letters or numbers, not both');
  if (spec.grid && net.layout === 'tree') err('squared paper is for squares and rectangles');
  return out;
}

/** Can a net model be drawn as written? (its set's items each) */
export function netModelIssues(m: NetModelSpec, limits?: StepLimits): string[] {
  const out: string[] = [];
  if (m.set) {
    m.set.forEach((x, i) => out.push(...specIssues(x, `set ${i + 1}: `)));
    if (m.solid || m.layout || m.curved) out.push('a set\'s pictures carry their own solids (nothing at the top)');
  } else out.push(...specIssues(m, ''));
  if (limits?.solids) for (const s of netItems(m)) if (!limits.solids.includes(solidClass(s.solid))) out.push(`a ${solidClass(s.solid)} (the step's solids: ${limits.solids.join(', ')})`);
  return out;
}

/* ------------------------------------------------------------------ */
/* Tasks                                                                */
/* ------------------------------------------------------------------ */

/** A single option or stage net, its letters' faces: A is the first piece. */
function letterNode(net: Net, text: string): number | null {
  const m = /^\s*([A-F])\s*$/.exec(text);
  if (!m) return null;
  const i = m[1]!.charCodeAt(0) - 65;
  return i < net.nodes.length ? i : null;
}

/** Every rule for a nets task: errors, and warnings (a planned wrong answer two rules explain). */
export function netTaskIssues(task: Task, limits: StepLimits | undefined): { errors: string[]; warns: string[] } {
  const errors: string[] = [];
  const warns: string[] = [];
  const models = [task.model, ...(task.kind === 'choose' ? task.options.flatMap((o) => (o.model ? [o.model] : [])) : [])];
  for (const m of models) if (isNetModel(m)) errors.push(...netModelIssues(m, limits));
  if (errors.length) return { errors, warns };
  const stage = taskNetSpec(task);
  const single = isNetModel(task.model) && !task.model.set;
  const codes = new Set<MisconceptionCode>([...task.feedback.wrong.map((w) => w.when), ...(task.kind === 'choose' ? task.options.flatMap((o) => (o.misconception ? [o.misconception] : [])) : [])]);
  const cannot = (c: MisconceptionCode, why: string) => errors.push(`"${c}" cannot be diagnosed here (${why})`);

  if (task.kind === 'complete-net' || task.kind === 'tap-face') {
    if (!single || !stage) return { errors: [...errors, `a ${task.kind} task works on one net (model kind net, no set)`], warns };
    if (isCurved(stage.solid)) return { errors: [...errors, `a ${task.kind} task is for a cube, a cuboid, a prism or a pyramid: a ${stage.solid.type}'s net is only recognised (docs/39 D3)`], warns };
    if (stage.fold !== undefined && stage.fold !== 0) errors.push('the net to work on lies flat (fold 0)');
  }
  if (task.kind === 'complete-net' && stage) {
    const net = netOfSpec(stage)!;
    const faces = faceIds(stage.solid).length - (stage.open ? 1 : 0);
    if (net.nodes.length + task.add !== faces) errors.push(`${net.nodes.length} faces given and ${task.add} to add make ${net.nodes.length + task.add}; the ${solidClass(stage.solid)} needs ${faces}`);
    if (task.candidates === 'free' || task.candidates === 'adjacent') {
      if (net.layout !== 'cells') errors.push(`candidates ${task.candidates} are squares: the net is a cube's cells`);
      const box = task.box;
      if (box && (box[0] > PAPER_MAX[0] || box[1] > PAPER_MAX[1])) errors.push(`the paper is ${box[0]} × ${box[1]} (≤ ${PAPER_MAX[0]} × ${PAPER_MAX[1]})`);
      if (box && net.nodes.some((n) => n.poly.some((p) => p[0] > box[0] || p[1] > box[1]))) errors.push('the faces given are off the paper');
      if (task.candidates === 'free' && !task.box) errors.push('a free task names its paper (box: [columns, rows])');
    } else {
      task.candidates.forEach((c, i) => {
        const kind = typeof c[0] === 'string' ? 'tree' : c.length === 4 ? 'rects' : 'cells';
        if (kind !== net.layout) errors.push(`candidate ${i} is a ${kind === 'tree' ? 'face on a face' : kind === 'rects' ? 'rectangle' : 'square'}; the net is ${net.layout}`);
      });
    }
    if (!completeSolution(task)) errors.push('no choice of places closes the net');
    for (const w of task.feedback.wrong) {
      if (!w.sample) continue;
      const st = sampleState(task, w.sample);
      const mine = st ? childSpec(task, st.nplaced) : null;
      if (!mine) continue;
      const f = foldedOf(mine);
      const rules = foldedCodes(f);
      if (rules.length > 1) warns.push(`sample "${w.sample}" shows ${rules.join(' and ')} (the first is used: face-size, face-count, overlap-unseen)`);
    }
    for (const c of codes) if (!['face-size', 'overlap-unseen'].includes(c)) cannot(c, 'a completed net shows face-size or overlap-unseen when folded');
    if (completeSolutions(task, 2).length > 1 && !/\b(any|one of|either)\b/i.test(task.feedback.correct.en) && !Array.isArray(task.candidates)) warns.push('more than one place closes the net: say so in feedback.correct ("any one of …")');
  }
  if (task.kind === 'tap-face' && stage) {
    const net = netOfSpec(stage)!;
    const r = foldResult(net);
    if (task.ask === 'opposite') {
      const m = markOf(task);
      if (m === null) errors.push('ask opposite needs the face given (mark)');
      else if (!r.closes) errors.push('ask opposite is asked of a net that closes');
      else if (tapAnswer(task) === null) errors.push(`the face given has no opposite on a ${solidClass(stage.solid)}`);
      for (const c of codes) if (c !== 'adjacent-as-opposite') cannot(c, 'a face tapped for the opposite shows adjacent-as-opposite');
    } else {
      if (!stage.open) errors.push('ask bottom is a box with no lid: name its open face (open)');
      else if (!r.closes) errors.push(`folded on its base the box is open at ${r.missing.join(', ') || 'no face'}, not ${stage.open}: write open as that face or set the base to the bottom`);
      if (tapAnswer(task) === null) errors.push('the box has no bottom to tap');
      for (const c of codes) cannot(c, 'the bottom of a box has no planned wrong answer');
    }
  }
  if (task.kind === 'choose') {
    const T = stage && single ? stage.solid : null;
    const stageFold = stage && single && !isCurved(stage.solid) ? foldedOf(stage) : null;
    for (const o of task.options) {
      const pics = o.model && isNetModel(o.model) ? netItems(o.model) : [];
      if (o.solid !== undefined || o.folds !== undefined) {
        if (!stage || !single) {
          errors.push(`option "${o.id}" talks about the stage's net: the task's model is one net`);
          continue;
        }
        if (o.solid !== undefined) {
          const actual = solidClass(stage.solid);
          if (o.correct !== (o.solid === actual)) errors.push(`option "${o.id}" says ${o.solid}; the net makes a ${actual}: correct should be ${o.solid === actual}`);
          if (!o.correct && o.misconception && !namesShow(o.misconception, o.solid, actual)) errors.push(`option "${o.id}": naming a ${actual} a ${o.solid} does not show ${o.misconception}`);
        }
        if (o.folds !== undefined) {
          const closes = isCurved(stage.solid) ? foldedOf(stage).closes : !!stageFold?.closes;
          if (o.correct !== (o.folds === closes)) errors.push(`option "${o.id}" says it ${o.folds ? 'folds' : 'does not fold'}; folded, the net ${closes ? 'closes' : 'does not close'}`);
          const f = foldedOf(stage);
          if (o.misconception && !o.correct && !claimShows(o.misconception, o.folds, f)) errors.push(`option "${o.id}" (${o.folds ? 'it folds' : 'it does not'}) does not show ${o.misconception} for this net`);
        }
      }
      for (const pic of pics) {
        const f = foldedOf(pic);
        const isNet = !!pic.layout || !!pic.curved;
        const target = T ?? task.options.filter((x) => x.correct).flatMap((x) => (x.model && isNetModel(x.model) ? netItems(x.model) : []))[0]?.solid ?? null;
        const right = isNet ? f.closes && !!target && sameSolid(pic.solid, target) : !!target && solidClass(pic.solid) === solidClass(target);
        if (o.correct !== right) errors.push(`option "${o.id}": its picture ${isNet ? (f.closes ? 'folds into a ' + solidClass(pic.solid) : 'does not fold up') : 'is a ' + solidClass(pic.solid)}: correct should be ${right}`);
        if (o.misconception) {
          const shows = isNet ? pictureShows(o.misconception, { ...f, faces: target ? faceIds(target).length - (pic.open ? 1 : 0) : f.faces }, !o.correct) || (!o.correct && !!target && namesShow(o.misconception, solidClass(pic.solid), solidClass(target))) : !o.correct && !!target && namesShow(o.misconception, solidClass(pic.solid), solidClass(target));
          if (!shows) errors.push(`option "${o.id}": its picture does not show ${o.misconception}`);
        }
      }
      if (o.text && stage && single && stage.letters && !pics.length) {
        const net = netOfSpec(stage);
        const k = net ? letterNode(net, o.text.en) : null;
        if (net && k !== null) {
          const opposite = foldResult(net).opposite(0);
          if (o.correct !== (k === opposite)) errors.push(`option "${o.id}" (${o.text.en.trim()}): correct should be ${k === opposite} (the face opposite A is ${opposite === null ? 'none' : String.fromCharCode(65 + opposite)})`);
          const lands = foldResult(net).lands;
          if (o.misconception === 'adjacent-as-opposite' && !(lands[0] && lands[k] && touchingFaces(net, lands[0], lands[k]))) errors.push(`option "${o.id}": ${o.text.en.trim()} does not share an edge with A`);
        }
      }
    }
  }
  if (task.kind === 'input') {
    const spec = inputSpecOf(task)!;
    if (!stage || !single) errors.push('a number about a net is asked of one net (model kind net)');
    else if (spec.ask !== 'faces' && spec.ask !== 'length') errors.push('a number about a net says what it is: ask faces or ask length');
    else {
      const a = answerValues(spec)[0];
      const ctx = netNumberCtx(task, spec);
      if (spec.form !== 'whole') errors.push('a number about a net is a whole number (form whole)');
      if (a && isFracValue(a) && ctx) {
        if (spec.ask === 'faces' && a.n !== ctx.faces) errors.push(`the answer is ${a.n}; the net has ${ctx.faces} faces`);
        if (spec.ask === 'length' && !edgeLengths(stage.solid).includes(a.n)) errors.push(`the answer ${a.n} is not a length of the ${solidClass(stage.solid)} (${edgeLengths(stage.solid).join(', ')})`);
      }
      for (const c of codes) if (!(spec.ask === 'faces' ? c === 'face-count' : c === 'face-size')) cannot(c, spec.ask === 'faces' ? 'a count of faces shows face-count' : 'a length shows face-size');
    }
  }
  if (task.kind !== 'choose' && task.kind !== 'input' && task.kind !== 'complete-net' && task.kind !== 'tap-face') errors.push(`a ${task.kind} task does not work on a net (choose, input, complete-net, tap-face)`);
  return { errors, warns };
}

/** Two faces of a grid net's box, or of a tree's solid, share an edge. */
function touchingFaces(net: Net, a: string, b: string): boolean {
  if (net.layout === 'tree') return shareEdge(net.solid, a, b);
  return a !== b && oppositeFace({ type: 'cuboid', size: [1, 1, 1] }, a) !== b;
}
