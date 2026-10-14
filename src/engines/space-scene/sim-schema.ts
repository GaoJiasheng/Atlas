/**
 * The `sim` section of parts.json (docs/22 §4.3 E-SIM, docs/23 §4): reader-operable
 * variables ("try it"), a pure model of the topic's kind that turns them into
 * outputs, and bindings from controls / outputs to parts, flows and
 * animations. Chapters (and beats) set control values with `state.sim.set`;
 * a chapter's `state.sim.try` is its try-it card (vary / keep / observe,
 * record a row, predict then observe).
 *
 * Build-time only (zod); the client imports the types.
 */
import { z } from 'zod';
import { bilingual, colorRef, kebabId, vec3 } from '../../content/schema/common';

/** A control value: a toggle's boolean, a step's number, a choice's option id. */
export const simValue = z.union([z.boolean(), z.number(), kebabId]);
export type SimValue = z.output<typeof simValue>;
/** Control values by control id. */
export const simValues = z.record(kebabId, simValue);
export type SimValues = z.output<typeof simValues>;

/** Option ids a URL could not tell from a toggle or a number. */
const RESERVED_OPTION = /^(on|off|true|false|-?\d+(\.\d+)?)$/;

const option = z
  .object({ id: kebabId.refine((v) => !RESERVED_OPTION.test(v), { message: 'an option id may not be on / off / a number' }), label: bilingual })
  .strict();

const controlBase = {
  id: kebabId,
  label: bilingual,
};

export const simControlSchema = z.discriminatedUnion('kind', [
  /** On / off (a switch, a battery turned round, a bulb screwed in). */
  z.object({ ...controlBase, kind: z.literal('toggle'), default: z.boolean() }).strict(),
  /** Ordered numbers (batteries 1–3, a gap in cm); ‹ › and `[` `]` step through them. */
  z
    .object({
      ...controlBase,
      kind: z.literal('step'),
      values: z.array(z.number()).min(2).max(24),
      default: z.number(),
      /** Shown after the value (`cm`); empty for counts. */
      unit: z.string().trim().max(8).optional(),
    })
    .strict(),
  /**
   * One of a few named options (`gap`: the material in the test gap). `sets`:
   * picking an option also sets other controls (`arrangement: series` closes X,
   * opens Y and Z); changing one of those by hand moves the choice to the
   * option whose `sets` match, else to the first option without `sets` (`free`).
   */
  z
    .object({
      ...controlBase,
      kind: z.literal('choice'),
      options: z.array(option).min(2).max(12),
      default: kebabId,
      sets: z.record(kebabId, simValues).optional(),
    })
    .strict(),
]);
export type SimControl = z.output<typeof simControlSchema>;

export const SIM_OUTPUT_KINDS = ['number', 'state', 'vector'] as const;

/**
 * A model output: a number (`unit`, `decimals`), a state (`states`: label of
 * each value) or a vector (values per id: a circuit's current in each edge).
 * `from` names the model quantity (lib/sim: `current:<edge>`, `brightness:<edge>` …);
 * default the output's own id.
 */
export const simOutputSchema = z
  .object({
    id: kebabId,
    label: bilingual,
    kind: z.enum(SIM_OUTPUT_KINDS).default('number'),
    from: z.string().min(1).max(64).optional(),
    unit: z.string().trim().max(8).optional(),
    decimals: z.number().int().min(0).max(3).optional(),
    states: z.record(kebabId, bilingual).optional(),
  })
  .strict();
export type SimOutput = z.output<typeof simOutputSchema>;

/**
 * When a binding is on: `true` (the value is truthy: on, non-zero, a state
 * other than the first) or a comparison with the value.
 */
export const simCondition = z.union([
  z.literal(true),
  z.object({ eq: simValue }).strict(),
  z.object({ ne: simValue }).strict(),
  z.object({ in: z.array(simValue).min(1) }).strict(),
  z.object({ gte: z.number() }).strict(),
  z.object({ lte: z.number() }).strict(),
]);
export type SimCondition = z.output<typeof simCondition>;

const source = {
  /** A control id (exactly one of control / output). */
  control: kebabId.optional(),
  /** An output id. */
  output: kebabId.optional(),
};

export const GLOW_CURVES = ['linear', 'sqrt'] as const;

const partBind = z
  .object({
    ...source,
    /** One part or several. */
    part: z.union([kebabId, z.array(kebabId).min(1)]),
    /** Shown while the condition holds (else it fades out and is not pickable). */
    visible: simCondition.optional(),
    /** Value → a pose of `poses` (null: rest) for these parts only; values not listed: rest. */
    pose: z.record(z.string(), kebabId.nullable()).optional(),
    /**
     * Self-light: the value (0 … `full`, through `curve`) sets how strongly the
     * part glows in `color`, from a dull red at a trace to `color` at full.
     */
    glow: z.object({ color: colorRef, full: z.number().positive(), curve: z.enum(GLOW_CURVES).default('sqrt') }).strict().optional(),
    /** Show the first k copies of a `repeat` part (k = the value, × `per`). */
    count: z.object({ per: z.number().positive().default(1) }).strict().optional(),
    /** Move along `axis` (scene units) by (value − `origin`) × `per`. */
    offset: z.object({ axis: vec3, per: z.number(), origin: z.number().default(0) }).strict().optional(),
    /** Turn about `axis` through the part centre by (value − `origin`) × `per` degrees. */
    rotate: z.object({ axis: vec3, per: z.number(), origin: z.number().default(0) }).strict().optional(),
  })
  .strict();

const flowBind = z
  .object({
    ...source,
    flow: kebabId,
    /** The flow runs only while the condition holds. */
    visible: simCondition.optional(),
    /**
     * A vector output by path id (a multi-path flow's `paths`): each path's
     * particles move at a speed ∝ |value| ÷ `full` (clamped), against the path
     * when negative, and vanish below 1 % of `full`.
     */
    intensity: z.object({ full: z.number().positive() }).strict().optional(),
    /** State value → particle colour while the output is in that state (a short circuit runs hot). */
    stops: z.record(kebabId, colorRef).optional(),
  })
  .strict();

const animationBind = z
  .object({
    ...source,
    animation: kebabId,
    /** The value is the turning speed (rpm of a `rotate` animation, × `per`). */
    rpm: z.object({ per: z.number().positive().default(1) }).strict().optional(),
    /** The animation plays only while the condition holds. */
    enabled: simCondition.optional(),
  })
  .strict();

export const simBindSchema = z.union([partBind, flowBind, animationBind]);
export type SimBind = z.output<typeof simBindSchema>;
export type SimPartBind = z.output<typeof partBind>;
export type SimFlowBind = z.output<typeof flowBind>;
export type SimAnimationBind = z.output<typeof animationBind>;

/* ------------------------------------------------------------------ */
/* Models                                                              */
/* ------------------------------------------------------------------ */

export const CIRCUIT_EDGE_KINDS = ['battery', 'switch', 'wire', 'gap', 'load'] as const;
const point2 = z.tuple([z.number(), z.number()]);

/**
 * A circuit (docs/23 §4.2): nodes joined by edges. `battery` edges run from
 * their negative (`from`) to their positive (`to`) terminal; `path` (scene
 * coordinates, from → to) is where a multi-path flow's particles run for this
 * edge; `via` (diagram units) are the corners of its wire on the circuit
 * diagram between the two nodes' `d` positions.
 */
export const circuitEdgeSchema = z
  .object({
    id: kebabId,
    from: kebabId,
    to: kebabId,
    kind: z.enum(CIRCUIT_EDGE_KINDS),
    /** battery: number of cells, or a step control giving it. */
    cells: z.union([z.number().int().min(1).max(12), kebabId]).optional(),
    /** battery: cell number (1-based) → a toggle that turns that cell round. */
    flip: z.record(z.string().regex(/^[1-9]\d?$/), kebabId).optional(),
    /** battery: volts per cell (default 1.5). */
    emf: z.number().positive().optional(),
    /** battery: ohms per cell; wire: ohms. */
    r: z.number().positive().optional(),
    /** switch: its toggle; gap: the choice of `materials`; load: a choice of `loads` (instead of `load`). */
    control: kebabId.optional(),
    /** load: a fixed load of `loads`. */
    load: kebabId.optional(),
    /** load: a toggle saying the load is in place (a bulb screwed in). */
    present: kebabId.optional(),
    /** The part this edge is on the board (diagram symbol ↔ part selection). */
    part: kebabId.optional(),
    path: z.array(vec3).min(2).max(64).optional(),
    via: z.array(point2).max(12).optional(),
    /** Where along the drawn wire its symbol sits (0..1 of the longest straight run; default .5). */
    at: z.number().min(0).max(1).optional(),
  })
  .strict();
export type CircuitEdge = z.output<typeof circuitEdgeSchema>;

export const LOAD_KINDS = ['lamp', 'buzzer', 'motor'] as const;

export const circuitSchema = z
  .object({
    /** Node id → its position on the circuit diagram (`d`, diagram units; omit for nodes off the diagram). */
    nodes: z.record(kebabId, z.object({ d: point2.optional() }).strict()),
    edges: z.array(circuitEdgeSchema).min(1).max(32),
    /** Gap materials: option id → ohms (an option not listed is an insulator: no current). */
    materials: z.record(kebabId, z.number().positive()).default({}),
    /**
     * Loads: `lamp` (`rated` watts; brightness = power ÷ reference power × 100),
     * `buzzer` (sounds above `on` amps), `motor` (`rpm` of visible turning at `at` volts).
     */
    loads: z.record(
      kebabId,
      z
        .object({
          kind: z.enum(LOAD_KINDS),
          r: z.number().positive(),
          rated: z.number().positive().optional(),
          on: z.number().positive().optional(),
          rpm: z.number().positive().optional(),
          at: z.number().positive().optional(),
        })
        .strict(),
    ),
    /** Power of a lamp at brightness 100 (W). */
    reference: z.object({ power: z.number().positive() }).strict(),
    /** Ohms of a closed switch (default 0.001). */
    closed: z.number().positive().optional(),
    /** Battery current (A) above which the loop is a short circuit (default 3). */
    short: z.number().positive().optional(),
    /** A lamp above `rated` × this is over its rating (default 1.5). */
    over: z.number().positive().optional(),
    /** The circuit diagram: its size in diagram units (the card scales it) and small captions (`labels`: "Board", "Torch"). */
    diagram: z
      .object({ size: point2, labels: z.array(z.object({ at: point2, text: bilingual }).strict()).max(6).optional() })
      .strict()
      .optional(),
  })
  .strict();
export type CircuitData = z.output<typeof circuitSchema>;

/**
 * Bar magnets as Gilbert charge pairs (docs/22 §4.2): the magnets topic's model.
 * Each magnet has two poles (±1 charge) at scene points; `move` names the
 * control that slides it along `axis` (scene units per step value) and `flip`
 * the choice option ids that turn it round.
 */
export const magnetSchema = z
  .object({
    magnets: z
      .array(
        z
          .object({
            id: kebabId,
            north: vec3,
            south: vec3,
            move: z.object({ control: kebabId, axis: vec3, per: z.number(), origin: z.number().default(0) }).strict().optional(),
            flip: z.object({ control: kebabId, when: z.array(kebabId).min(1) }).strict().optional(),
          })
          .strict(),
      )
      .min(1)
      .max(4),
    /** The first magnet's `move` control value at which the force between the first two magnets (unturned) is 100 %. */
    reference: z.number(),
    /**
     * Paper clips held (docs/22 §4.2 items 7–9, illustrative): through `cards`
     * cards of 2 mm, 10 × (5 ÷ (5 + gap mm))²; after `strokes` strokes, one per
     * five (≤ 6); by the electromagnet, 3 per cell while `switch` is on, else 1.
     */
    clips: z.object({ cards: kebabId.optional(), strokes: kebabId.optional(), switch: kebabId.optional(), cells: kebabId.optional() }).strict().optional(),
  })
  .strict();
export type MagnetData = z.output<typeof magnetSchema>;

export const SIM_KINDS = ['circuit', 'magnet'] as const;
export type SimKind = (typeof SIM_KINDS)[number];

export const MAX_SIM_CONTROLS = 16;

export const simSchema = z
  .object({
    kind: z.enum(SIM_KINDS),
    controls: z.array(simControlSchema).min(1).max(MAX_SIM_CONTROLS),
    outputs: z.array(simOutputSchema).min(1).max(16),
    bind: z.array(simBindSchema).max(64).default([]),
    circuit: circuitSchema.optional(),
    magnet: magnetSchema.optional(),
  })
  .strict();
export type SimData = z.output<typeof simSchema>;

/* ------------------------------------------------------------------ */
/* Chapter state                                                       */
/* ------------------------------------------------------------------ */

/** A keep chip: a control (its value is shown, locked) or a plain words chip ("same bulb"). */
const keepItem = z.union([kebabId, bilingual]);

export const PREDICT_MEANS = ['more', 'less', 'same', 'zero', 'positive', 'negative'] as const;

/**
 * A chapter's try-it card (docs/22 §4.3 S3, S6, S7): `vary` (the control the
 * reader changes; `[` `]` step it), `also` (more controls on the card), `keep`
 * (what stays the same), `observe` (outputs in large type and bold in the
 * PLATE block), `record` (a "record a row" button and the data table; `judge`
 * adds a yes / no column: the output above `gt`), `predict` (pick an outcome,
 * then `change` is applied and the card says what was observed; never marked).
 */
export const simTrySchema = z
  .object({
    vary: kebabId,
    also: z.array(kebabId).max(4).optional(),
    keep: z.array(keepItem).max(5).optional(),
    observe: z.array(kebabId).min(1).max(4),
    record: z
      .union([z.literal(true), z.object({ judge: z.object({ output: kebabId, gt: z.number().default(0), label: bilingual }).strict() }).strict()])
      .optional(),
    predict: z
      .object({
        prompt: bilingual,
        /** Values set first, before the reading is taken (the switch closed, the bulb in): what the prediction starts from. */
        start: simValues.optional(),
        change: simValues,
        options: z.array(z.object({ id: kebabId, label: bilingual, means: z.enum(PREDICT_MEANS) }).strict()).min(2).max(4),
        observe: kebabId,
      })
      .strict()
      .optional(),
  })
  .strict();
export type SimTry = z.output<typeof simTrySchema>;

/** `state.sim` of a chapter: the control values it starts from (not cumulative) and its try-it card. */
export const chapterSimSchema = z.object({ set: simValues.optional(), try: simTrySchema.optional() }).strict();
export type ChapterSim = z.output<typeof chapterSimSchema>;
/** `sim` of a beat: control values on top of the chapter's `set`. */
export const beatSimSchema = z.object({ set: simValues }).strict();

/* ------------------------------------------------------------------ */
/* Cross-checks                                                        */
/* ------------------------------------------------------------------ */

interface SimContext {
  parts: ReadonlySet<string>;
  flows: ReadonlyMap<string, { paths?: readonly { id: string }[] | undefined }>;
  animations: ReadonlyMap<string, { kind: string; target: string }>;
  poses: ReadonlySet<string>;
  /** Parts with a `repeat` and no `extra` (a `count` binding shows their first k copies). */
  countable: ReadonlySet<string>;
}

/** Whether a value is a legal value of a control. */
export function legalValue(c: SimControl, v: unknown): boolean {
  if (c.kind === 'toggle') return typeof v === 'boolean';
  if (c.kind === 'step') return typeof v === 'number' && c.values.includes(v);
  return typeof v === 'string' && c.options.some((o) => o.id === v);
}

/** Quantity names a circuit model offers (outputs' `from`). */
export function circuitQuantities(c: CircuitData): string[] {
  const out = ['edges'];
  for (const e of c.edges) {
    out.push(`current:${e.id}`, `volts:${e.id}`, `power:${e.id}`);
    if (e.kind === 'battery') out.push(`status:${e.id}`);
    if (e.kind === 'load') out.push(`brightness:${e.id}`, `speed:${e.id}`, `sound:${e.id}`);
  }
  return out;
}

/** Quantity names the magnet model offers. */
export const MAGNET_QUANTITIES = ['force', 'clips-cards', 'clips-stroke', 'clips-em', 'facing'] as const;

/**
 * What a `sim` section names that does not exist or does not fit: control
 * defaults and `sets`, outputs' `from`, bindings' controls / outputs / parts /
 * flows / animations / poses, and the kind's model data. Pure; the parts-file
 * schema reports each as an issue.
 */
export function simIssues(sim: SimData, ctx: SimContext): { path: (string | number)[]; message: string }[] {
  const out: { path: (string | number)[]; message: string }[] = [];
  const issue = (path: (string | number)[], message: string) => out.push({ path, message });
  const controls = new Map(sim.controls.map((c) => [c.id, c]));
  const outputs = new Map(sim.outputs.map((o) => [o.id, o]));
  sim.controls.forEach((c, i) => {
    if (sim.controls.findIndex((x) => x.id === c.id) !== i) issue(['controls', i, 'id'], `duplicate control "${c.id}"`);
    if (outputs.has(c.id)) issue(['controls', i, 'id'], `"${c.id}" is also an output`);
    if (!legalValue(c, c.default)) issue(['controls', i, 'default'], `default ${JSON.stringify(c.default)} is not one of the control's values`);
    if (c.kind === 'step' && c.values.some((v, j) => j > 0 && v <= c.values[j - 1]!)) issue(['controls', i, 'values'], 'step values must ascend');
    if (c.kind === 'choice') {
      if (new Set(c.options.map((o) => o.id)).size !== c.options.length) issue(['controls', i, 'options'], 'duplicate option ids');
      for (const [opt, set] of Object.entries(c.sets ?? {})) {
        if (!c.options.some((o) => o.id === opt)) issue(['controls', i, 'sets', opt], `unknown option "${opt}"`);
        for (const [id, v] of Object.entries(set)) {
          const t = controls.get(id);
          if (!t) issue(['controls', i, 'sets', opt, id], `unknown control "${id}"`);
          else if (t.kind === 'choice' && t.sets) issue(['controls', i, 'sets', opt, id], `"${id}" has sets of its own (no chains)`);
          else if (!legalValue(t, v)) issue(['controls', i, 'sets', opt, id], `${JSON.stringify(v)} is not a value of "${id}"`);
        }
      }
      // The defaults must agree with the default option's sets (the card would show a mismatch at load).
      for (const [id, v] of Object.entries(c.sets?.[c.default] ?? {})) {
        const t = controls.get(id);
        if (t && t.default !== v) issue(['controls', i, 'default'], `option "${c.default}" sets ${id} = ${JSON.stringify(v)}, but ${id} defaults to ${JSON.stringify(t.default)}`);
      }
      if (c.sets && !c.options.some((o) => !(o.id in c.sets!)))
        issue(['controls', i, 'sets'], 'give one option without `sets` (where a hand-set combination lands, e.g. `free`)');
    }
  });
  const quantities = new Set(
    sim.kind === 'circuit' ? (sim.circuit ? circuitQuantities(sim.circuit) : []) : [...MAGNET_QUANTITIES],
  );
  sim.outputs.forEach((o, i) => {
    if (sim.outputs.findIndex((x) => x.id === o.id) !== i) issue(['outputs', i, 'id'], `duplicate output "${o.id}"`);
    const from = o.from ?? o.id;
    if (!quantities.has(from)) issue(['outputs', i, 'from'], `the ${sim.kind} model has no quantity "${from}"`);
    const kind = from === 'edges' ? 'vector' : from.startsWith('status:') || from.startsWith('sound:') || from === 'facing' ? 'state' : 'number';
    if (quantities.has(from) && kind !== o.kind) issue(['outputs', i, 'kind'], `"${from}" is a ${kind}, not a ${o.kind}`);
  });
  if (sim.kind === 'circuit' && !sim.circuit) issue(['circuit'], 'a circuit sim needs `circuit`');
  if (sim.kind === 'magnet' && !sim.magnet) issue(['magnet'], 'a magnet sim needs `magnet`');
  if (sim.circuit) circuitIssues(sim.circuit, controls, ctx).forEach((x) => issue(['circuit', ...x.path], x.message));
  if (sim.magnet) {
    sim.magnet.magnets.forEach((m, i) => {
      if (m.move && controls.get(m.move.control)?.kind !== 'step') issue(['magnet', 'magnets', i, 'move', 'control'], `"${m.move.control}" is not a step control`);
      if (m.flip) {
        const c = controls.get(m.flip.control);
        if (c?.kind !== 'choice') issue(['magnet', 'magnets', i, 'flip', 'control'], `"${m.flip.control}" is not a choice control`);
        else for (const w of m.flip.when) if (!c.options.some((o) => o.id === w)) issue(['magnet', 'magnets', i, 'flip', 'when'], `unknown option "${w}"`);
      }
    });
  }
  sim.bind.forEach((b, i) => {
    const has = (k: string) => k in b && (b as Record<string, unknown>)[k] !== undefined;
    if (has('control') === has('output')) {
      issue(['bind', i], 'a binding names exactly one `control` or `output`');
      return;
    }
    const src = b.control ?? b.output!;
    const ctl = b.control ? controls.get(src) : undefined;
    const outp = b.output ? outputs.get(src) : undefined;
    if (b.control && !ctl) issue(['bind', i, 'control'], `unknown control "${src}"`);
    if (b.output && !outp) issue(['bind', i, 'output'], `unknown output "${src}"`);
    if ('part' in b) {
      const ids = Array.isArray(b.part) ? b.part : [b.part];
      for (const id of ids) if (!ctx.parts.has(id)) issue(['bind', i, 'part'], `unknown part "${id}"`);
      for (const pose of Object.values(b.pose ?? {})) if (pose !== null && !ctx.poses.has(pose)) issue(['bind', i, 'pose'], `unknown pose "${pose}"`);
      if (b.count) for (const id of ids) if (!ctx.countable.has(id)) issue(['bind', i, 'count'], `"${id}" needs a \`repeat\` and no \`extra\` to show a count of copies`);
      if ((b.glow || b.count || b.offset || b.rotate) && outp && outp.kind !== 'number') issue(['bind', i], `glow / count / offset / rotate need a number, "${src}" is a ${outp.kind}`);
      const fields = ['visible', 'pose', 'glow', 'count', 'offset', 'rotate'].filter(has);
      if (fields.length === 0) issue(['bind', i], 'a part binding needs visible, pose, glow, count, offset or rotate');
    } else if ('flow' in b) {
      const flow = ctx.flows.get(b.flow);
      if (!flow) issue(['bind', i, 'flow'], `unknown flow "${b.flow}"`);
      if (b.intensity) {
        if (outp?.kind !== 'vector') issue(['bind', i, 'intensity'], 'intensity needs a vector output (a value per path id)');
        if (flow && !flow.paths) issue(['bind', i, 'intensity'], `flow "${b.flow}" has no \`paths\``);
        else if (flow && sim.circuit && outp?.from === 'edges') {
          const edges = new Set(sim.circuit.edges.map((e) => e.id));
          for (const p of flow.paths ?? []) if (!edges.has(p.id)) issue(['bind', i, 'intensity'], `path "${p.id}" of flow "${b.flow}" is not a circuit edge`);
        }
      }
      if (b.stops) {
        if (outp?.kind !== 'state') issue(['bind', i, 'stops'], 'stops need a state output');
        else if (outp.states) for (const k of Object.keys(b.stops)) if (!(k in outp.states)) issue(['bind', i, 'stops', k], `"${k}" is not a state of "${src}"`);
      }
      if (!b.visible && !b.intensity && !b.stops) issue(['bind', i], 'a flow binding needs visible, intensity or stops');
    } else {
      const anim = ctx.animations.get(b.animation);
      if (!anim) issue(['bind', i, 'animation'], `unknown animation "${b.animation}"`);
      else if (b.rpm && anim.kind !== 'rotate') issue(['bind', i, 'rpm'], `"${b.animation}" is a ${anim.kind} animation (rpm turns a rotate)`);
      if (b.rpm && outp && outp.kind !== 'number') issue(['bind', i, 'rpm'], 'rpm needs a number');
      if (!b.rpm && !b.enabled) issue(['bind', i], 'an animation binding needs rpm or enabled');
    }
    if (ctl && 'pose' in b && b.pose) {
      const keys = ctl.kind === 'toggle' ? ['true', 'false'] : ctl.kind === 'step' ? ctl.values.map(String) : ctl.options.map((o) => o.id);
      for (const k of Object.keys(b.pose)) if (!keys.includes(k)) issue(['bind', i, 'pose', k], `"${k}" is not a value of "${src}"`);
    }
  });
  return out;
}

function circuitIssues(c: CircuitData, controls: ReadonlyMap<string, SimControl>, ctx: SimContext): { path: (string | number)[]; message: string }[] {
  const out: { path: (string | number)[]; message: string }[] = [];
  const issue = (path: (string | number)[], message: string) => out.push({ path, message });
  const kindOf = (id: string) => controls.get(id)?.kind;
  c.edges.forEach((e, i) => {
    if (c.edges.findIndex((x) => x.id === e.id) !== i) issue(['edges', i, 'id'], `duplicate edge "${e.id}"`);
    for (const end of ['from', 'to'] as const) if (!(e[end] in c.nodes)) issue(['edges', i, end], `unknown node "${e[end]}"`);
    if (e.from === e.to) issue(['edges', i, 'to'], 'an edge joins two different nodes');
    if (e.part && !ctx.parts.has(e.part)) issue(['edges', i, 'part'], `unknown part "${e.part}"`);
    const need = (field: keyof CircuitEdge, ok: boolean, message: string) => {
      if (!ok) issue(['edges', i, field], message);
    };
    switch (e.kind) {
      case 'battery': {
        need('cells', e.cells !== undefined, 'a battery needs `cells` (a number or a step control)');
        if (typeof e.cells === 'string') {
          const s = controls.get(e.cells);
          need('cells', s?.kind === 'step' && s.values.every((v) => Number.isInteger(v) && v >= 1), `"${e.cells}" is not a step control of whole numbers ≥ 1`);
        }
        need('r', e.r !== undefined, 'a battery needs `r` (ohms per cell, > 0)');
        for (const [, id] of Object.entries(e.flip ?? {})) need('flip', kindOf(id) === 'toggle', `"${id}" is not a toggle`);
        break;
      }
      case 'switch':
        need('control', e.control !== undefined && kindOf(e.control) === 'toggle', 'a switch needs a toggle `control`');
        break;
      case 'wire':
        need('r', e.r !== undefined, 'a wire needs `r` (ohms)');
        break;
      case 'gap': {
        const g = e.control ? controls.get(e.control) : undefined;
        need('control', g?.kind === 'choice', 'a gap needs a choice `control` (its options: `materials` or insulators)');
        if (g?.kind === 'choice') for (const m of Object.keys(c.materials)) need('control', g.options.some((o) => o.id === m), `material "${m}" is not an option of "${g.id}"`);
        break;
      }
      case 'load': {
        need('load', (e.load === undefined) !== (e.control === undefined), 'a load names one `load` or a choice `control` of loads');
        if (e.load !== undefined) need('load', e.load in c.loads, `unknown load "${e.load}"`);
        if (e.control !== undefined) {
          const g = controls.get(e.control);
          need('control', g?.kind === 'choice' && g.options.every((o) => o.id in c.loads), `"${e.control}" is not a choice of loads`);
        }
        if (e.present !== undefined) need('present', kindOf(e.present) === 'toggle', `"${e.present}" is not a toggle`);
        break;
      }
    }
    if (c.diagram && e.via) for (const end of ['from', 'to'] as const) if (!c.nodes[e[end]]?.d) issue(['edges', i, 'via'], `node "${e[end]}" has no diagram position \`d\``);
  });
  for (const [id, l] of Object.entries(c.loads)) {
    if (l.kind === 'lamp' && l.rated === undefined) issue(['loads', id, 'rated'], 'a lamp needs `rated` watts');
    if (l.kind === 'motor' && (l.rpm === undefined || l.at === undefined)) issue(['loads', id], 'a motor needs `rpm` at `at` volts');
    if (l.kind === 'buzzer' && l.on === undefined) issue(['loads', id, 'on'], 'a buzzer needs `on` (amps it sounds above)');
  }
  return out;
}

/** What a chapter's (or beat's) sim names that the topic's sim does not have. */
export function chapterSimIssues(where: string, s: { set?: SimValues | undefined; try?: SimTry | undefined } | undefined, sim: SimData | undefined): string[] {
  if (!s) return [];
  if (!sim) return [`${where}sim: parts.json has no \`sim\``];
  const out: string[] = [];
  const controls = new Map(sim.controls.map((c) => [c.id, c]));
  const outputs = new Set(sim.outputs.map((o) => o.id));
  const values = (field: string, set: SimValues) => {
    for (const [id, v] of Object.entries(set)) {
      const c = controls.get(id);
      if (!c) out.push(`${where}sim.${field}: unknown control "${id}"`);
      else if (!legalValue(c, v)) out.push(`${where}sim.${field}: ${JSON.stringify(v)} is not a value of "${id}"`);
    }
  };
  if (s.set) values('set', s.set);
  const t = s.try;
  if (t) {
    for (const id of [t.vary, ...(t.also ?? [])]) if (!controls.has(id)) out.push(`${where}sim.try: unknown control "${id}"`);
    for (const k of t.keep ?? []) if (typeof k === 'string' && !controls.has(k)) out.push(`${where}sim.try.keep: unknown control "${k}"`);
    for (const id of t.observe) if (!outputs.has(id)) out.push(`${where}sim.try.observe: unknown output "${id}"`);
    if (t.record && t.record !== true && !outputs.has(t.record.judge.output)) out.push(`${where}sim.try.record.judge: unknown output "${t.record.judge.output}"`);
    if (t.predict) {
      values('try.predict.change', t.predict.change);
      if (t.predict.start) values('try.predict.start', t.predict.start);
      if (!outputs.has(t.predict.observe)) out.push(`${where}sim.try.predict.observe: unknown output "${t.predict.observe}"`);
    }
  }
  return out;
}

