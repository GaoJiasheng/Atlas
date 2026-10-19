/**
 * MathScene content rules for reading instruments and quantities in units
 * (docs/32 §3.8, M8 / M9 / M11), beside the other domains' in `validate.ts`:
 * an instrument can be drawn as written (a range, marks the same size, what
 * it shows on its marks, a two-unit scale of one pair, brackets end to end
 * and adding up to the reading, a balance as its masses say); every task's
 * answer is what its instrument reads or its quantities come to; what each
 * declared misconception needs to be diagnosed is there; the step's number
 * limits; and no quantity written as bare text ("9 cm": write `{u:9 cm}` so
 * it is shown and read as one). Build time only; shared with
 * `scripts/math/check-pool.ts`.
 */
import type { InputSpec, InstrumentModelSpec, InstrumentSpec, MisconceptionCode, Model, StepLimits, Task } from './schema';
import { SCALE } from './lib/decimal';
import { answerValues } from './lib/forms';
import { drawnParts, fewestWeights, loadMass, markOf, panMass, partsOf, readingOf, scaleOf, tiltOf, unitOf, type Scale } from './lib/instrument';
import { isInstrument, measureWorkOf } from './lib/measure-kind';
import { countParts, instrumentOf, printedUnit, readingQty, setStart, setTarget } from './lib/measure-tasks';
import { inputSpecOf } from './lib/state';
import { compareQty, FACTOR, familyOf, fromSmall, isFracValue, isQty, PAIR, pairOf, qtyFamily, qtyIn, type QtyValue, type Unit } from './lib/value';

const V = (units: number) => {
  const whole = Math.floor(units / SCALE);
  const rest = units % SCALE;
  return rest ? `${whole}.${String(rest).padStart(6, '0').replace(/0+$/, '')}` : String(whole);
};

/** Most small parts an instrument draws (more: draw a stretch, or magnify it). */
export const PARTS_MAX = 60;

/* ------------------------------------------------------------------ */
/* Models                                                              */
/* ------------------------------------------------------------------ */

const STRAIGHT = new Set(['ruler', 'tape']);

/** Can one instrument be drawn as written? */
function memberIssues(s: InstrumentSpec, opts: { nearest: boolean; where: string }): string[] {
  const out: string[] = [];
  const at = opts.where ? `${opts.where}: ` : '';
  const err = (m: string) => out.push(`${at}${m}`);
  if (!s.type) return [`${at}an instrument needs a type (ruler, tape, dial, jug, balance)`];
  const only = (field: keyof InstrumentSpec, types: string[]) => {
    if (s[field] !== undefined && s[field] !== false && !types.includes(s.type!)) err(`${String(field)} is for ${types.join(' or ')}`);
  };
  only('inset', ['ruler']);
  only('broken', ['ruler']);
  only('look', ['tape', 'ruler']);
  only('orient', ['ruler', 'tape']);
  only('object', ['ruler', 'tape']);
  only('line', ['ruler', 'tape']);
  only('arrow', ['tape']);
  only('head', ['tape']);
  only('skip', ['tape']);
  only('value', ['dial', 'jug']);
  only('load', ['dial']);
  only('liquid', ['jug']);
  only('shape', ['jug']);
  only('eye', ['jug']);
  only('sweep', ['dial']);
  only('straight', ['dial', 'jug']);
  only('left', ['balance']);
  only('right', ['balance']);
  only('hideMass', ['balance']);
  if (s.scale === false && s.type !== 'jug') err('scale: false is for a jug (a container to compare by looking)');
  if (s.look === 'ruler' && s.type === 'tape') err('look ruler is a ruler: type ruler');
  if (s.head && s.look !== 'height-chart') err('head is the head board of a height chart (look height-chart)');
  if (s.type === 'balance') {
    for (const f of ['from', 'to', 'major', 'minor', 'sub', 'dual', 'count', 'zoom', 'brackets', 'highlight'] as const) if (s[f] !== undefined && s[f] !== false) err(`a balance has no scale: no ${f}`);
    if (!s.left?.length && !s.right?.length) err('a balance needs something in a pan');
    const l = panMass(s.left ?? []);
    const r = panMass(s.right ?? []);
    const want = tiltOf(l, r);
    if (s.tilt !== 'auto' && ({ left: -1, right: 1, level: 0 } as const)[s.tilt] !== want) err(`tilt ${s.tilt}, but the masses (${l} g, ${r} g) put it ${want === 0 ? 'level' : want < 0 ? 'left down' : 'right down'}`);
    return out;
  }
  if (s.type === 'jug' && s.scale === false) {
    if (s.from || s.to || s.major || s.minor || s.value) err('a jug without a scale has no range, marks or level (it is compared by looking)');
    return out;
  }
  const sc = scaleOf(s);
  if (!s.from && s.type !== 'ruler' && s.type !== 'tape') err('the scale needs from');
  if (!s.to || !s.minor || !s.major) return [...out, `${at}the scale needs to, major and minor`];
  if (!sc) return [...out, `${at}the scale must go up (from < to)`];
  const unit = unitOf(s);
  if ((sc.to - sc.from) % sc.minor !== 0) err(`from ${V(sc.from)} to ${V(sc.to)} is not a whole number of small parts of ${V(sc.minor)}`);
  if (sc.major % sc.minor !== 0) err(`numbers every ${V(sc.major)} are not a whole number of small parts of ${V(sc.minor)}`);
  else if (sc.per < 1 || sc.per > 10) err(`${sc.per} small parts between numbers (1–10)`);
  if (sc.from % sc.minor !== 0) err(`from ${V(sc.from)} is not on a mark (marks every ${V(sc.minor)} from 0)`);
  if (drawnParts(s, sc) > PARTS_MAX && !s.zoom) err(`${drawnParts(s, sc)} small parts (≤ ${PARTS_MAX}; draw a stretch, skip one, or magnify)`);
  if (s.sub) {
    const pair = pairOf(s.sub.unit, unit);
    if (!pair) err(`sub ${s.sub.unit} and unit ${unit} are not a pair (km–m, m–cm, kg–g, ℓ–ml): the values are in the small unit`);
    else if (s.sub.per !== undefined && s.sub.per !== FACTOR[pair]) err(`sub per ${s.sub.per}: 1 ${s.sub.unit} = ${FACTOR[pair]} ${unit}`);
    if (sc.minor % SCALE !== 0) err('a two-unit scale counts whole small units');
  }
  if (s.dual && !s.sub) err('dual prints the small unit\'s totals beside a two-unit scale: it needs sub');
  if (typeof s.labels === 'object') for (const h of s.labels.hide) if (h.units % sc.major !== 0 || h.units < sc.from || h.units > sc.to) err(`labels.hide ${V(h.units)} is not a numbered mark`);
  const onMark = (v: number, what: string, nearOk = false) => {
    if (v < sc.from || v > sc.to) err(`${what} ${V(v)} is off the scale (${V(sc.from)}–${V(sc.to)})`);
    else if (markOf(sc, v) === null) {
      if (!nearOk) err(`${what} ${V(v)} is not on a mark (every ${V(sc.minor)})`);
      else {
        const off = (v - sc.from) % sc.minor;
        const d = Math.min(off, sc.minor - off) / sc.minor;
        if (d < 0.2 - 1e-9 || d > 0.4 + 1e-9) err(`${what} ${V(v)} is ${Math.round(d * 100) / 100} of a part from the nearest mark (0.2–0.4: never half way)`);
      }
    }
  };
  if (s.value) onMark(s.value.units, s.type === 'dial' ? 'the needle' : 'the level');
  if (s.arrow) onMark(s.arrow.units, 'the arrow');
  if (s.head) onMark(s.head.units, 'the head board');
  if (s.object) {
    onMark(s.object.from.units, `the ${s.object.kind}'s start`);
    onMark(s.object.to.units, `the ${s.object.kind}'s end`, opts.nearest);
    if (s.object.to.units <= s.object.from.units) err(`the ${s.object.kind} must go from left to right (from < to)`);
  }
  if (s.line) {
    onMark(s.line.from.units, 'the line\'s start');
    onMark(s.line.to.units, 'the line\'s end');
  }
  for (const h of s.highlight ?? []) onMark(h.units, 'highlight');
  for (const [name, span] of [['count', s.count], ['zoom', s.zoom], ['skip', s.skip]] as const) {
    if (!span) continue;
    onMark(span.from.units, `${name} from`);
    onMark(span.to.units, `${name} to`);
    if (span.to.units <= span.from.units) err(`${name} must go up`);
  }
  if (s.skip && (s.value || s.arrow || s.head || s.object) && [s.value, s.arrow, s.head, s.object?.to].some((v) => v && v.units > s.skip!.from.units && v.units < s.skip!.to.units)) err('what is read is inside the skipped stretch');
  if (s.brackets) {
    for (let i = 1; i < s.brackets.length; i++) if (s.brackets[i]!.from.units !== s.brackets[i - 1]!.to.units) err('brackets go end to end (each from the last one\'s to)');
    const r = readingOf(s);
    const end = s.brackets.at(-1)!.to.units;
    const start = s.brackets[0]!.from.units;
    if (r && r.a === undefined && start !== 0) err('brackets for a reading start at 0');
    if (r && r.a === undefined && end !== r.value) err(`the brackets end at ${V(end)}, the reading is ${V(r.value)}`);
    if (r && r.a !== undefined && (start !== r.a || end - start !== r.value)) err('the brackets run from the thing\'s start to its end');
    if (!STRAIGHT.has(s.type) && s.type !== 'jug') err('brackets go beside a straight scale or a jug');
  }
  if (s.eye && !s.value) err('the eye-level line needs a level');
  return out;
}

/** Can an instrument model be drawn as written (each one, and a pair or a set together)? */
export function instrumentModelIssues(m: InstrumentModelSpec, opts: { nearest?: boolean } = {}): string[] {
  const members = partsOf(m);
  const out: string[] = [];
  if ((m.pair || m.set) && m.type) out.push('a pair or a set writes its instruments in pair / set, not beside them');
  members.forEach((s, i) => out.push(...memberIssues(s, { nearest: !!opts.nearest, where: members.length > 1 ? `${m.pair ? 'pair' : 'set'} ${i + 1}` : '' })));
  if (members.length > 1) {
    if (members.some((s) => !s.label)) out.push('each instrument of a pair or a set has its label');
    if (new Set(members.map((s) => s.type)).size > 1) out.push('a pair or a set is of one kind of instrument (drawn to one scale)');
  }
  return out;
}

/* ------------------------------------------------------------------ */
/* Tasks                                                               */
/* ------------------------------------------------------------------ */

/** The units a task uses (its instruments', its quantities'), for the limits. */
function unitsOf(task: Task): Unit[] {
  const out = new Set<Unit>();
  const models = [task.model, ...(task.kind === 'choose' ? task.options.flatMap((o) => (o.model ? [o.model] : [])) : [])];
  for (const m of models)
    if (isInstrument(m))
      for (const s of partsOf(m))
        if (s.type !== 'balance' && s.scale !== false) {
          out.add(unitOf(s));
          if (s.sub) out.add(s.sub.unit);
        }
  for (const q of quantitiesOf(task)) {
    if (q.kind === 'cmp') {
      out.add(q.big);
      out.add(q.small);
    } else out.add(q.unit);
  }
  return [...out];
}

/** Every quantity a task names (compared, ordered, chosen, written, converted, a target). */
function quantitiesOf(task: Task): QtyValue[] {
  const out: QtyValue[] = [];
  const add = (v: unknown) => {
    if (isQty(v)) out.push(v);
  };
  if (task.kind === 'compare') [task.a, task.b].forEach(add);
  if (task.kind === 'order') task.items.forEach(add);
  if (task.kind === 'choose') task.options.forEach((o) => add(o.value));
  if (task.kind === 'set-scale') add(task.target);
  const spec = inputSpecOf(task);
  if (spec) {
    answerValues(spec).forEach(add);
    const w = measureWorkOf(spec);
    if (w) add(w.from);
  }
  return out;
}

/** Codes a measuring task can diagnose (validate rejects the rest). */
function undiagnosable(task: Task, code: MisconceptionCode): string | null {
  if (task.kind === 'choose') return task.options.some((o) => o.misconception === code) ? null : `"${code}": no option shows it`;
  const spec = inputSpecOf(task);
  const w = measureWorkOf(spec);
  const s = instrumentOf(task);
  const r = s ? readingOf(s) : null;
  const need = (ok: boolean, what: string) => (ok ? null : `"${code}" needs ${what}`);
  const reads = task.kind === 'read-scale';
  const valueSet = task.kind === 'set-scale' && task.mode !== 'weights';
  const pointer = reads && !!r && r.a === undefined;
  switch (code) {
    case 'tick-counting':
      return need(reads || valueSet || task.kind === 'count-intervals', 'a read-scale, set-scale (not weights) or count-intervals task');
    case 'read-end-mark':
      return need(reads && !!r && r.a !== undefined && r.a !== 0 && !r.nearest, 'a thing read on a ruler or tape that does not start at 0');
    case 'not-nearest':
      return need(reads && !!r?.nearest, 'a thing whose end is off the marks (to the nearest mark)');
    case 'interval-misread':
      return need(pointer || valueSet || (task.kind === 'count-intervals' && task.ask === 'part'), 'a needle, a level, an arrow or a head board read, a value set, or a part counted (ask part)');
    case 'wrong-unit':
      return need(spec?.form === 'measure', 'form measure (the unit chosen)');
    case 'ignored-unit':
      return need(task.kind === 'compare' || task.kind === 'order', 'a compare or order task of quantities');
    case 'compound-concatenated':
      return need(!!w && w.from.kind === 'cmp' && !w.into.includes('-'), 'work convert from a compound into one unit');
    case 'compound-place':
      return need((!!w && ((w.from.kind === 'cmp' && !w.into.includes('-')) || (w.from.kind === 'meas' && w.into.includes('-')))) || (reads && spec?.form === 'compound') || (task.kind === 'compare' && [task.a, task.b].some((v) => isQty(v) && v.kind === 'cmp')), 'a compound written, changed into one unit, or compared');
    case 'compound-split-wrong':
      return need(!!w && w.from.kind === 'meas' && w.into.includes('-'), 'work convert from one unit into a compound');
    case 'unit-factor-wrong':
      return need(!!w, 'work convert');
    case 'decimal-as-subunit':
      return need((!!w && w.from.kind === 'meas' && w.from.value.units % SCALE !== 0) || (reads && spec?.form === 'compound' && !!s && !s.sub), 'a decimal measure changed, or read off a decimal scale as a compound');
    case 'unreasonable-estimate':
    case 'size-is-mass':
    case 'taller-holds-more':
    case 'balance-misread':
      return `"${code}" is diagnosed by a choose option only`;
    default:
      return `"${code}" is not one for reading instruments`;
  }
}

/** Does an answer equal a quantity (in the written part's own terms)? */
function answerIs(task: Task, spec: InputSpec, want: QtyValue): string | null {
  const a = answerValues(spec)[0];
  if (!a) return 'no answer';
  const shown = want.kind === 'cmp' ? `${want.bigPart} ${want.big} ${want.smallPart} ${want.small}` : `${V(want.value.units)} ${want.unit}`;
  if (spec.form === 'compound') {
    if (isFracValue(a) || a.kind !== 'cmp') return 'form compound needs a compound answer ("1 l 250 ml")';
    return compareQty(a, want) === 0 ? null : `the answer is ${a.bigPart} ${a.big} ${a.smallPart} ${a.small}, it should be ${shown}`;
  }
  if (spec.form === 'measure') {
    if (isFracValue(a) || a.kind !== 'meas') return 'form measure needs a quantity answer ("350 g")';
    if (familyOf(a.unit) !== qtyFamily(want)) return `${a.unit} does not measure what the instrument measures`;
    return compareQty(a, want) === 0 ? null : `the answer is ${V(a.value.units)} ${a.unit}, it should be ${shown}`;
  }
  const unit = printedUnit(task, spec);
  if (!unit) return 'the box needs a unit after it (unit)';
  const x = isFracValue(a) ? (a.d === 1 && !a.w ? a.n * SCALE : null) : a.kind === 'dec' ? a.units : null;
  if (x === null) return `form ${spec.form} needs a number`;
  const v = qtyIn(want, unit);
  return v && v.units === x ? null : `the answer is ${V(x)} ${unit}, it should be ${v ? `${V(v.units)} ${unit}` : shown}`;
}

/** Every rule for a measuring task (its model, its answer, its codes, its limits). */
export function measureTaskIssues(task: Task, limits: StepLimits | undefined): string[] {
  const out: string[] = [];
  const nearest = !!limits?.nearest;
  const models: Model[] = [task.model, ...(task.kind === 'choose' ? task.options.flatMap((o) => (o.model ? [o.model] : [])) : [])];
  for (const m of models) if (isInstrument(m)) out.push(...instrumentModelIssues(m, { nearest }));
  if (!isInstrument(task.model)) out.push('a measuring task draws an instrument (model kind instrument)');
  const s = instrumentOf(task);
  const sc = s ? scaleOf(s) : null;
  const spec = inputSpecOf(task);
  const single = isInstrument(task.model) && !task.model.pair && !task.model.set;
  switch (task.kind) {
    case 'read-scale': {
      if (!single || !s) {
        out.push('a read-scale task reads one instrument');
        break;
      }
      const r = readingOf(s);
      if (!r) {
        out.push('the instrument has nothing to read (a thing, a line, an arrow, a head board, a needle, a level, weights on a balance)');
        break;
      }
      const q = s.type === 'balance' ? ({ kind: 'meas', value: { units: r.value, dp: 0 }, unit: 'g' } as QtyValue) : readingQty(s, r.value);
      if (q && spec) {
        // A compound read off a decimal scale in the big unit (1.4 kg = 1 kg 400 g).
        const a = answerValues(spec)[0];
        const want = spec.form === 'compound' && a && !isFracValue(a) && a.kind === 'cmp' && q.kind === 'meas' && q.unit === a.big ? (qtyIn(q, a.small) ? ({ kind: 'meas', value: qtyIn(q, a.small)!, unit: a.small } as QtyValue) : q) : q;
        const bad = answerIs(task, spec, want);
        if (bad) out.push(bad);
      }
      break;
    }
    case 'set-scale': {
      if (!single || !s) {
        out.push('a set-scale task sets one instrument');
        break;
      }
      const want: Record<typeof task.mode, string[]> = { line: ['ruler', 'tape'], arrow: ['tape'], load: ['dial'], fill: ['jug'], weights: ['balance'] };
      if (!want[task.mode].includes(s.type!)) out.push(`mode ${task.mode} is for a ${want[task.mode].join(' or ')}`);
      if (task.mode === 'weights') {
        if (!task.weights?.length) out.push('mode weights needs the weights in the tray');
        else {
          const solution = fewestWeights(loadMass(s), task.weights);
          if (!solution) out.push(`${loadMass(s)} g cannot be made from ${task.weights.join(', ')} g`);
          else if (solution.length > 12) out.push('the mass needs more than the 12 weights the pan can hold');
        }
        if ((s.right ?? []).length) out.push('the right pan starts empty (the child puts the weights on)');
        if (!(s.left ?? []).length) out.push('the left pan holds what is weighed');
        if (setTarget(task) !== loadMass(s) * SCALE) out.push('the target must equal the mass on the left pan');
        break;
      }
      if (task.weights) out.push('weights are for mode weights');
      const t = setTarget(task);
      if (!sc || t === null) {
        out.push('the target is not in the instrument\'s units');
        break;
      }
      if (t < sc.from || t > sc.to) out.push(`the target ${V(t)} is off the scale`);
      else if (markOf(sc, t) === null) out.push(`the target ${V(t)} is not on a mark`);
      if (t === setStart(task)) out.push('the instrument already shows the target');
      if (task.mode === 'line' && s.line) out.push('the line is the child\'s to draw (no line on the model)');
      break;
    }
    case 'count-intervals': {
      if (!single || !s || !sc) {
        out.push('a count-intervals task counts on one instrument with a scale');
        break;
      }
      const [a, b] = [task.between[0].units, task.between[1].units];
      if (markOf(sc, a) === null || markOf(sc, b) === null || b <= a) out.push('between: two marks, the smaller first');
      if (task.ask === 'part' && (a % sc.major !== 0 || b - a !== sc.major)) out.push('ask part: between two numbered marks next to each other');
      if (countParts(task).length < 1) out.push('no parts between the marks');
      if (spec) {
        const unit = unitOf(s);
        const want: QtyValue = { kind: 'meas', value: { units: task.ask === 'part' ? sc.minor : b - a, dp: 0 }, unit };
        const bad = answerIs(task, spec, want);
        if (bad) out.push(bad);
      }
      break;
    }
    case 'compare': {
      if (!isQty(task.a) || !isQty(task.b)) out.push('compare quantities with quantities ("900 g", "1 kg")');
      else if (compareQty(task.a, task.b) === null) out.push('the two quantities measure different things');
      if (task.align && task.align !== 'unit') out.push(`align ${task.align} is for fractions or decimals (quantities: unit)`);
      break;
    }
    case 'order': {
      const qs = task.items.filter(isQty);
      if (qs.length !== task.items.length) out.push('order quantities with quantities');
      else if (new Set(qs.map(qtyFamily)).size > 1) out.push('the quantities measure different things');
      else for (let i = 0; i < qs.length; i++) for (let j = i + 1; j < qs.length; j++) if (compareQty(qs[i]!, qs[j]!) === 0) out.push('two quantities are the same');
      break;
    }
    case 'input': {
      const w = measureWorkOf(spec);
      if (!spec) break;
      if (w) {
        const into = w.into;
        if (into.includes('-')) {
          const pair = into as keyof typeof FACTOR;
          if (spec.form !== 'compound') out.push(`into ${into}: form compound`);
          const small = qtyIn(w.from, PAIR[pair].small);
          if (!small || small.units % SCALE !== 0) out.push(`${w.from.kind === 'cmp' ? 'that' : `${V(w.from.value.units)} ${w.from.unit}`} is not a whole number of ${PAIR[pair].small}`);
          else {
            const bad = answerIs(task, spec, { kind: 'cmp', ...fromSmall(small.units / SCALE, pair) });
            if (bad) out.push(bad);
          }
        } else {
          const v = qtyIn(w.from, into as Unit);
          if (!v) out.push(`${into} does not measure what is converted, or it is not exact`);
          else {
            const bad = answerIs(task, { ...spec, unit: spec.unit ?? (into as Unit) }, { kind: 'meas', value: v, unit: into as Unit });
            if (bad) out.push(bad);
          }
          if (spec.form !== 'whole' && spec.form !== 'decimal' && spec.form !== 'measure') out.push(`into ${into}: form whole (or decimal)`);
          const pair = w.from.kind === 'cmp' ? pairOf(w.from.big, w.from.small) : pairOf(w.from.unit, into as Unit) ?? pairOf(into as Unit, w.from.unit);
          if (!pair) out.push(`${into} is not the other unit of the pair converted`);
        }
      } else if (spec.form === 'compound' || spec.form === 'measure') {
        const a = answerValues(spec)[0];
        if (!a || !isQty(a)) out.push(`form ${spec.form} needs a quantity answer`);
      }
      break;
    }
    default:
      break;
  }
  if (spec?.form === 'measure') {
    const a = answerValues(spec)[0];
    if (Array.isArray(spec.units) && a && isQty(a) && a.kind === 'meas' && !spec.units.includes(a.unit)) out.push(`the unit chips (${spec.units.join(', ')}) leave out the answer's ${a.unit}`);
  }
  if (spec && typeof spec.units === 'string' && spec.form !== 'duration') out.push(`units ${spec.units} is for a duration`);
  for (const c of task.feedback.wrong.map((x) => x.when)) {
    const why = undiagnosable(task, c);
    if (why) out.push(why);
  }
  out.push(...limitIssues(task, limits, sc));
  return out.filter(Boolean);
}

/** The step's number limits (docs/32 §3.5 M9). */
function limitIssues(task: Task, L: StepLimits | undefined, sc: Scale | null): string[] {
  if (!L) return [];
  const out: string[] = [];
  const allowed = L.units?.filter((u) => !u.includes('-')) ?? [];
  if (allowed.length) for (const u of unitsOf(task)) if (!(allowed as string[]).includes(u)) out.push(`unit ${u} (this step: ${allowed.join(', ')})`);
  const models = [task.model, ...(task.kind === 'choose' ? task.options.flatMap((o) => (o.model ? [o.model] : [])) : [])];
  for (const m of models) {
    if (!isInstrument(m)) continue;
    for (const s of partsOf(m)) {
      const x = scaleOf(s);
      if (!x) continue;
      if (L.parts && !L.parts.some((p) => p.units === x.minor)) out.push(`a small part of ${V(x.minor)} (this step: ${L.parts.map((p) => V(p.units)).join(', ')})`);
      if (L.partsPerLabel && (x.per < L.partsPerLabel[0] || x.per > L.partsPerLabel[1])) out.push(`${x.per} parts between numbers (${L.partsPerLabel[0]}–${L.partsPerLabel[1]})`);
      if (L.maxValue !== undefined && x.to > L.maxValue * SCALE) out.push(`the scale goes to ${V(x.to)} (numbers ≤ ${L.maxValue})`);
      if (!L.nearest && s.object && markOf(x, s.object.to.units) === null) out.push('the thing ends off the marks (only a step to the nearest centimetre: limits.nearest)');
      if (L.dp) for (const d of [s.from, s.to, s.major, s.minor, s.value].filter(Boolean)) if (d!.dp < L.dp[0] || d!.dp > L.dp[1]) out.push(`${V(d!.units)} has ${d!.dp} places (${L.dp[0]}–${L.dp[1]})`);
      if (!L.dp && [s.from, s.to, s.major, s.minor, s.value, s.arrow, s.head].some((d) => d && d.units % SCALE !== 0)) out.push('decimals on a scale (only a step with limits.dp)');
    }
    for (const s of partsOf(m)) for (const th of [...(s.left ?? []), ...(s.right ?? [])]) if (th.weight !== undefined && L.weights && !L.weights.includes(th.weight)) out.push(`a ${th.weight} g weight (this step: ${L.weights.join(', ')})`);
  }
  if (task.kind === 'set-scale' && task.weights && L.weights) for (const w of task.weights) if (!L.weights.includes(w)) out.push(`a ${w} g weight (this step: ${L.weights.join(', ')})`);
  for (const q of quantitiesOf(task)) {
    if (q.kind === 'cmp') {
      const pair = pairOf(q.big, q.small)!;
      if (!L.compound?.includes(pair)) out.push(`a compound in ${pair} (this step: ${L.compound?.join(', ') ?? 'none'})`);
      if (L.bigMax !== undefined && q.bigPart > L.bigMax) out.push(`${q.bigPart} ${q.big} (big part ≤ ${L.bigMax})`);
      if (L.smallStep && q.small !== 'cm' && q.smallPart % L.smallStep !== 0) out.push(`${q.smallPart} ${q.small} (a multiple of ${L.smallStep})`);
    } else {
      if (!L.dp && q.value.units % SCALE !== 0) out.push(`${V(q.value.units)} ${q.unit} is a decimal (only a step with limits.dp)`);
      if (L.maxValue !== undefined && q.value.units > L.maxValue * SCALE) out.push(`${V(q.value.units)} ${q.unit} (numbers ≤ ${L.maxValue})`);
    }
  }
  if (sc && !L.compound && sc.sub) out.push('a two-unit scale (this step has no compound pairs)');
  return out;
}

/* ------------------------------------------------------------------ */
/* Quantities written as text (M8)                                     */
/* ------------------------------------------------------------------ */

/** A number and a unit written as plain text (`9 cm`, `1.5 ℓ`, `2 m 35 cm`): write `{u:…}` so it is shown and read as one. */
const BARE_QTY = /(?<![\w.{:])\d[\d.,]*\s?(?:cm|km|kg|ml|m|g|ℓ|l)(?![\wℓ²])/g;

/** The bare quantities in a text (tokens left out). */
export function bareQuantities(text: string): string[] {
  const plain = text.replace(/\{[^{}]*\}/g, ' ');
  return [...plain.matchAll(BARE_QTY)].map((m) => m[0]);
}
