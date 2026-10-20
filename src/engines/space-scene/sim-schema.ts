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
import { benchShadow, lightQuantity, lightStates, shapeHalfDepth } from './lib/sim/light';
import { sunPosition } from './lib/sim/sun';
import { simQuantities } from './lib/sim';
import { matterSchema, matterIssues, type MatterPart } from './matter-schema';
import { matterQuantity, matterQuantityRange, matterLiquidShapes } from './lib/sim/matter';
import { capacity, fillShapeForPrimitive, validateFillProfile } from './lib/fill';
import { bilingual, colorRef, kebabId, vec3 } from '../../content/schema/common';
import { fieldLines } from './lib/sim/field';
import { FORCE_STATES, forceQuantity, forceTimelineChannels, springExtension, rollRun } from './lib/sim/force';
import { COMPUTED_TABLES, ENERGY_FORMS, chainFlow, chainOrder, energyNodes, energyQuantity, energyTimelineChannels, shareTables } from './lib/sim/energy';
import { EMPTYING_STATES, groupStages, lastStage, lifeCycleQuantity, timedStages } from './lib/sim/lifecycle';

/** A control value: a toggle's boolean, a step's number, a choice's option id. */
export const simValue = z.union([z.boolean(), z.number(), kebabId]);
/** A state id (an output's state, a magnet field state): kebab-case pieces joined by `-` or `.` (`ns-1.5`). */
export const STATE_ID = /^[a-z0-9]+(?:[-.][a-z0-9]+)*$/;
export const stateId = z.string().regex(STATE_ID, 'must be kebab-case (dots allowed between digits: ns-1.5)');
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
  /** Ordered numbers, ascending or descending (batteries 1–3, a gap 6 → 3 → 1.5 cm); ‹ › and `[` `]` step through them in this order. */
  z
    .object({
      ...controlBase,
      kind: z.literal('step'),
      values: z.array(z.number()).min(2).max(24),
      default: z.number(),
      /** Shown after the value (`cm`); empty for counts. */
      unit: z.string().trim().max(8).optional(),
      format: z.literal('time').optional(),
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

export const SIM_OUTPUT_KINDS = ['number', 'state', 'vector', 'timeline'] as const;

/**
 * A model output: a number (`unit`, `decimals`), a state (`states`: label of
 * each value), a vector (values per id: a circuit's current in each edge) or
 * a timeline (a run of the apparatus over time, lib/sim/timeline.ts: `play`
 * and `stretch` bindings and force arrows read its channels).
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
    format: z.literal('time').optional(),
    decimals: z.number().int().min(0).max(3).optional(),
    states: z.record(stateId, bilingual).optional(),
  })
  .strict();
export type SimOutput = z.output<typeof simOutputSchema>;

/** A value a condition compares with: a control value or a state id. */
const conditionValue = z.union([z.boolean(), z.number(), stateId]);

/**
 * When a binding is on: `true` (the value is truthy: on, non-zero, a state
 * other than the first) or a comparison with the value.
 */
export const simCondition = z.union([
  z.literal(true),
  z.object({ eq: conditionValue }).strict(),
  z.object({ ne: conditionValue }).strict(),
  z.object({ in: z.array(conditionValue).min(1) }).strict(),
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

/**
 * A damped swing toward each new value instead of the plain 0.5 s ease (a
 * compass needle, a hanging magnet): a second-order oscillator with this
 * natural `period` (s) and damping ratio (0 < `damping` < 1 overshoots and
 * swings back). A turn takes the short way round (350° → 10° is +20°).
 * Deep links and screenshots jump to the end value.
 */
export const STRETCH_ANCHORS = ['top', 'bottom', 'centre'] as const;

export const settleSchema = z.object({ period: z.number().min(0.2).max(10), damping: z.number().min(0.05).max(2) }).strict();
export type SimSettle = z.output<typeof settleSchema>;

const partBind = z
  .object({
    ...source,
    /** One part or several. */
    part: z.union([kebabId, z.array(kebabId).min(1)]),
    /** Shown while the condition holds (else it fades out and is not pickable). */
    visible: simCondition.optional(),
    /** Value → a pose of `poses` (null: rest) for these parts only; values not listed: chapter / beat pose. */
    pose: z.record(z.string(), kebabId.nullable()).optional(),
    /**
     * Self-light: the value (0 … `full`, through `curve`) sets how strongly the
     * part glows in `color`, from a dull red at a trace to `color` at full.
     */
    glow: z.object({ color: colorRef, full: z.number().positive(), curve: z.enum(GLOW_CURVES).default('sqrt') }).strict().optional(),
    /**
     * Tint toward `color` (maximum `max`, default .55):
     * the value ÷ `full` (0–1, `linear` or `sqrt`) — an iron core that is a
     * magnet while the current flows.
     */
    tint: z.object({ color: colorRef, full: z.number().positive(), curve: z.enum(GLOW_CURVES).default('linear'), max: z.number().min(0).max(1).default(0.55) }).strict().optional(),
    /**
     * Show the first k copies of a `repeat` part: k = (value − `minus`) ÷ `per`,
     * rounded, at least 0 (`true`: k = the value). Slotted masses on a 50 g
     * hanger: `{ per: 50, minus: 50 }` (the hanger is the first 50 g).
     */
    fill: z.object({ per: z.number().positive(), below: z.number().nonnegative().default(0), meniscus: z.number().nonnegative().max(0.01).default(0), ease: z.number().nonnegative().max(10).default(0.6) }).strict().optional(),
    count: z.union([z.literal(true), z.object({ per: z.number().positive().default(1), minus: z.number().default(0) }).strict()]).optional(),
    /**
     * Move along `axis` (scene units, after any pose) by (value − `origin`) ×
     * `per`; `settle`: a damped swing to each new value (a hanger bouncing on
     * its spring) instead of the plain ease.
     */
    offset: z.object({ axis: vec3, per: z.number(), origin: z.number().default(0), settle: settleSchema.optional() }).strict().optional(),
    /**
     * Stretch the part's coil (its one `coil` primitive, main or `extra`) by
     * value × `per` scene units along the coil's own axis: the turns spread
     * apart, the wire keeps its thickness, the `anchor` end stays put (`top`:
     * the coil's +Y end; `bottom`, `centre`) and the part's other pieces ride
     * with the nearer end (a hook at the bottom goes down with it). The value
     * is a number output or control, or with `channel` a timeline channel;
     * `settle`: a damped bounce to each new value (numbers only).
     */
    stretch: z
      .object({ per: z.number(), channel: z.string().min(1).max(40).optional(), anchor: z.enum(STRETCH_ANCHORS).default('top'), settle: settleSchema.optional() })
      .strict()
      .optional(),
    /**
     * Play a timeline output (lib/sim/timeline.ts): move the parts along
     * `axis` by the `channel`'s value × `per` scene units, or turn them about
     * `turn` by it × `per` degrees (about `pivot`, a scene point, else the
     * part's centre where it is; `each`: every copy of a `repeat` / `extra`
     * part about its own centre, wheels on a car). Applied after the pose and
     * the try-it offset / turn; several `play` bindings on a part add up.
     * `when`: played only while a control or output meets the condition (one
     * car on the bench, pushed in one chapter and rolled down the ramp in
     * another: each run moves it only in its own set-up).
     */
    play: z
      .object({
        channel: z.string().min(1).max(40),
        axis: vec3.optional(),
        turn: vec3.optional(),
        per: z.number().default(1),
        pivot: vec3.optional(),
        each: z.literal(true).optional(),
        when: z.object({ ...source, is: simCondition.default(true) }).strict().optional(),
      })
      .strict()
      .optional(),
    /**
     * Turn about `axis` by (value − `origin`) × `per` degrees (default × 1),
     * after any pose, through the part's (posed) centre or `pivot` (a scene
     * point: the thread a hanging magnet's two halves turn about together);
     * `settle`: a damped swing.
     */
    rotate: z
      .object({ axis: vec3, per: z.number().default(1), origin: z.number().default(0), pivot: vec3.optional(), settle: settleSchema.optional() })
      .strict()
      .optional(),
    /**
     * A named ring of positions (`magnet.rings`): a step control of 1 … count
     * moves the parts to that position (offset from the position of the
     * control's default value, where the parts are drawn).
     */
    at: kebabId.optional(),
    /** Place a part on a sphere along an xyz vector output; face aligns local +Y. */
    place: z.object({ centre: vec3, radius: z.number().positive(), face: z.literal('centre').optional() }).strict().optional(),
    /** A field-state output picks the iron-filings layout of a `filings` part (`magnet.fields`). */
    state: z.literal(true).optional(),
  })
  .strict();

/** How a flow's per-path value shows: particle speed (a circuit's current), or how many particles run (an energy share). */
export const INTENSITY_MODES = ['speed', 'density'] as const;

const flowBind = z
  .object({
    ...source,
    flow: kebabId,
    paths: z.array(kebabId).min(1).max(16).optional(),
    /** The flow runs only while the condition holds. */
    visible: simCondition.optional(),
    /**
     * A vector output by path id (a multi-path flow's `paths`): each path's
     * particles move at a speed ∝ |value| ÷ `full` (clamped), against the path
     * when negative, and vanish below 1 % of `full`. `mode: "density"` (docs/31
     * E-EN4): the speed stays the flow's own and the share of the path's
     * particles on show is |value| ÷ `full` (≤ 1; an energy flow: more
     * particles where more of the energy goes). A vector keyed `<flow>:<path>`
     * gives each flow the entries that start with its id.
     */
    intensity: z.object({ full: z.number().positive(), mode: z.enum(INTENSITY_MODES).default('speed') }).strict().optional(),
    /** State value → particle colour while the output is in that state (a short circuit runs hot). */
    stops: z.record(stateId, colorRef).optional(),
    /**
     * A field-state output: the flow runs along that state's field lines
     * (`magnet.fields`, traced at load and cached), drawn as hairlines with
     * particles on them; the flow then has no `path` / `paths` of its own.
     */
    state: z.literal(true).optional(),
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
 * A rectangle the field lines of a state are traced in (docs/22 §4.2 item 3):
 * centred on `center`, `size` [along u, along v], facing `normal` (default
 * [0, 1, 0]: the bench plane, u = +X, v = +Z; a vertical electromagnet takes
 * [0, 0, 1]: u = +X, v = +Y). The poles are projected onto it.
 */
export const fieldPlaneSchema = z
  .object({ center: vec3, size: z.tuple([z.number().positive(), z.number().positive()]), normal: vec3.optional() })
  .strict();
export type FieldPlane = z.output<typeof fieldPlaneSchema>;

/**
 * Magnets as Gilbert charge pairs (docs/22 §4.2): the magnets topic's model.
 * Each magnet has two poles at scene points (pole strength = `moment` ÷ the
 * pole distance; a school bar magnet ≈ 1 A·m²); `move` names the control that
 * slides it along `axis` (scene units per step value), `flip` the choice
 * option ids that turn it round, `power` the switch (and cell count) of an
 * electromagnet: moment × cells while on, × `residual` while off (a steel core
 * keeps a little); `part` the part it rides on, so the field follows that
 * part wherever a pose or binding puts it.
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
            moment: z.number().positive().optional(),
            move: z.object({ control: kebabId, axis: vec3, per: z.number(), origin: z.number().default(0) }).strict().optional(),
            flip: z.object({ control: kebabId, when: z.array(kebabId).min(1) }).strict().optional(),
            power: z.object({ switch: kebabId, cells: kebabId.optional(), residual: z.number().min(0).max(1).default(0.15) }).strict().optional(),
            /**
             * The part the magnet rides on (a primitive part): its poles follow
             * that part's pose (chapter / beat, or a try-it `pose` binding) and
             * its try-it `offset` / `at` / `rotate` bindings, except those of
             * its own `move` / `flip` controls (lib/sim/carrier.ts).
             */
            part: kebabId.optional(),
          })
          .strict(),
      )
      .min(1)
      .max(6),
    /** The first magnet's `move` control value at which the force between the first two magnets (unturned) is 100 %. */
    reference: z.number(),
    /**
     * Paper clips held (docs/22 §4.2 items 7–9, illustrative): through `cards`
     * cards of 2 mm, 10 × (5 ÷ (5 + gap mm))²; after `strokes` strokes, one per
     * five (≤ 6); by the electromagnet, 3 per cell while `switch` is on, else 1.
     */
    clips: z.object({ cards: kebabId.optional(), strokes: kebabId.optional(), switch: kebabId.optional(), cells: kebabId.optional() }).strict().optional(),
    /** Earth's field at the bench (µT, horizontal, toward `north`): only the compass feels it (docs/22 F-4). */
    earth: z.object({ uT: z.number().nonnegative(), north: vec3 }).strict().optional(),
    /**
     * Named rings of positions (an `at` binding, the compass): `count`
     * positions on a horizontal circle, position 1 at bearing `start` (degrees
     * clockwise from model north seen from above; default 180 = toward the
     * viewer), the rest clockwise.
     */
    rings: z
      .record(
        kebabId,
        z.object({ center: vec3, radius: z.number().positive(), count: z.number().int().min(2).max(36), start: z.number().default(180) }).strict(),
      )
      .optional(),
    /**
     * Where `needle-bearing` is read: a fixed point, or a ring position given
     * by a step control. Default: the first `at` binding's ring and control.
     */
    compass: z.union([z.object({ at: vec3 }).strict(), z.object({ ring: kebabId, control: kebabId }).strict()]).optional(),
    /** The default plane field lines are traced in (each field state may give its own). */
    plane: fieldPlaneSchema.optional(),
    /** Field lines leaving the north pole of a 1 A·m² magnet (∝ moment, ≥ 1 a magnet; ≤ 16 a state). Default 8. */
    lines: z.number().positive().max(400).default(8),
    /**
     * Field states (the `field-state` quantity; docs/22 §4.2 item 4): the
     * first whose `when` control values all hold is on show (one without
     * `when` always holds: put it last). Its lines and filings are worked out
     * once with the controls at their defaults ⊕ `when`, for `magnets` (ids;
     * default all) in `plane` (default the model's).
     */
    fields: z
      .record(
        stateId,
        z
          .object({
            magnets: z.array(kebabId).min(1).optional(),
            when: simValues.optional(),
            plane: fieldPlaneSchema.optional(),
            /** Lines per A·m² for this state (a weak electromagnet drawn with more lines than the bar magnets' default). */
            lines: z.number().positive().max(400).optional(),
          })
          .strict(),
      )
      .optional(),
  })
  .strict();
export type MagnetData = z.output<typeof magnetSchema>;

const pos = z.number().positive();

/**
 * The forces model's data (docs/30 §4.2–4.3, lib/sim/force.ts): six
 * optional sub-models, each naming the controls it reads. Lengths in metres
 * unless a control's unit says otherwise (the fall height is in m, the ramp
 * height in cm, loads in g); `g` in N/kg.
 */
export const forceSchema = z
  .object({
    g: pos.default(9.8),
    /**
     * A push on a car on the runway: `choice` (a choice control: where the rod
     * pushes) → `dv` (velocity change [x, y, z] m/s per option; y is ignored),
     * `start` (a choice of `rest` / `moving`, or a toggle: on = moving; default
     * moving), `speed` (m/s at the push point when moving), `at` (the push
     * point, m from the runway's start; the car rolls in from there), `runway`
     * (m to the end stop), the rolling coefficient after the push: `rolling`,
     * or `surface` (an option of `roll.rolling`), `wheel` (radius, m), `arrow`
     * (the push channel's value per m/s of Δv: the arrow's length).
     */
    push: z
      .object({
        choice: kebabId,
        start: kebabId.optional(),
        speed: pos,
        at: pos,
        approach: pos.optional(),
        runway: pos,
        dv: z.record(kebabId, vec3),
        surface: kebabId.optional(),
        rolling: pos.optional(),
        wheel: pos.default(0.011),
        arrow: pos.default(3),
      })
      .strict()
      .optional(),
    /** A magnet pushes the car instead of the rod while `toggle` is on: Δv `dv` (needs `push`). */
    magnet: z.object({ toggle: kebabId, dv: vec3 }).strict().optional(),
    /**
     * Two objects let go together: `height` (a step control, m), `pair` (a
     * choice; each option names two `objects`, left then right, in `pairs`),
     * `slow` (the run shown this many times slower), `air` (kg/m³), `sample`
     * (s between timeline samples, default 0.01); an object is `{ part, m (kg),
     * cd, area (m²), sway? (° of rocking, a sheet of paper; illustrative) }`.
     * `weigh`: a choice control → the object hung on the weighing balance.
     */
    fall: z
      .object({
        air: pos.default(1.21),
        height: kebabId,
        pair: kebabId,
        slow: z.number().min(1).max(10).default(1),
        sample: z.number().min(0.002).max(0.1).optional(),
        objects: z.record(kebabId, z.object({ part: kebabId, m: pos, cd: pos, area: pos, sway: z.number().min(0).max(45).optional() }).strict()),
        pairs: z.record(kebabId, z.tuple([kebabId, kebabId])),
        weigh: z.object({ control: kebabId, map: z.record(kebabId, kebabId) }).strict().optional(),
      })
      .strict()
      .optional(),
    /**
     * A block pulled across a surface: `block` (kg) plus `load` (a step control,
     * g); `lane` (a choice) → `surfaces` [μ starting, μ moving]; the pull rises
     * over `rise` s, then the block slides `travel` m at `speed` m/s.
     */
    slide: z
      .object({ block: pos, load: kebabId, lane: kebabId, rise: pos, speed: pos, travel: pos, surfaces: z.record(kebabId, z.tuple([pos, pos])) })
      .strict()
      .optional(),
    /**
     * A car let go on the ramp: `height` (a step control, cm), `surface` (a
     * choice) → `rolling` (coefficient c), `loss` (share lost on the ramp),
     * `wheel` (radius, m), `runway` (m to the end stop), `ramp.angle` (°).
     */
    roll: z
      .object({
        height: kebabId,
        surface: kebabId,
        loss: z.number().min(0).max(0.9),
        wheel: pos,
        runway: pos,
        ramp: z.object({ angle: z.number().min(1).max(60) }).strict(),
        rolling: z.record(kebabId, pos),
      })
      .strict()
      .optional(),
    /**
     * A spring: `load` (a step control, g), `unload` (a toggle: the load taken
     * off), `per50` (cm per 50 g up to `limit` g), past the limit 6 + n · a +
     * n² · b more (`beyond` [a, b], n = fifties past it), `set` (cm left after
     * unloading, per load above the limit), `length` (cm unloaded).
     */
    spring: z
      .object({
        load: kebabId,
        unload: kebabId.optional(),
        per50: pos,
        length: pos,
        limit: pos,
        beyond: z.tuple([z.number().min(0), z.number().min(0)]),
        set: z.record(z.string().regex(/^\d+$/), z.number().min(0)).default({}),
      })
      .strict()
      .optional(),
    /**
     * A wheel spun at `rps` and braked: `squeeze` (a choice) → `force` (N per
     * pad); `inertia` (kg·m²), `radius` (m, where the pads grip), `mu`, `hub` (N·m).
     */
    brake: z
      .object({ squeeze: kebabId, rps: pos, inertia: pos, radius: pos, mu: pos, hub: pos, force: z.record(kebabId, z.number().min(0)) })
      .strict()
      .optional(),
  })
  .strict();
export type ForceData = z.output<typeof forceSchema>;

/** A control condition (an energy chain or link counts only while it holds). */
const controlCondition = z.object({ control: kebabId, is: simCondition.default(true) }).strict();

export type EnergyForm = (typeof ENERGY_FORMS)[number];
/** `in` (all that goes into the node) or `<table>.<key>`: a percentage of `energy.shares` (or of a table the model works out). */
const SHARE_REF = /^(in|[a-z0-9]+(?:-[a-z0-9]+)*\.[a-z0-9]+(?:-[a-z0-9]+)*)$/;
/** A flow path a link lights: `<flow id>:<path id>`. */
const FLOW_PATH_REF = /^[a-z0-9]+(?:-[a-z0-9]+)*:[a-z0-9]+(?:-[a-z0-9]+)*$/;

/**
 * One energy chain (docs/31 §4.2): the energy-chain card's nodes and bands
 * and the flow paths it lights. A node is a part (`part`: its short name,
 * picking it selects the part) or a labelled place (`label`, e.g. "The air
 * around"); `sink`: where energy ends (drawn in the last column). A link
 * carries one form of energy from one node to a later one: `share` of what
 * goes into `from` (`in` = all of it, `<table>.<key>` = that percentage),
 * lighting `paths` (`<flow>:<path>`; not for potential energy, which is
 * stored, not a stream) while `when` holds. `start`: what goes into the
 * first nodes (default 100; a control's table: an LED needs a quarter of the
 * filament lamp's energy for the same light). `when`: every condition must
 * hold, else the chain is 0. `reading`: the node (and `through` nodes) whose
 * output the readings describe: `useful` (its links marked `useful`), `heat`
 * and `sound` (the others of those forms), % of what goes into `node`. `mix`: also
 * light other chains' paths at their defaults × `scale` (the whole block).
 */
export const energyChainSchema = z
  .object({
    nodes: z
      .array(z.object({ id: kebabId, part: kebabId.optional(), label: bilingual.optional(), sink: z.literal(true).optional() }).strict())
      .min(1)
      .max(12),
    links: z
      .array(
        z
          .object({
            id: kebabId,
            from: kebabId,
            to: kebabId,
            form: z.enum(ENERGY_FORMS),
            share: z.string().regex(SHARE_REF, 'a share is `in` or `<table>.<key>`'),
            paths: z.array(z.string().regex(FLOW_PATH_REF, 'a path is `<flow id>:<path id>`')).max(8).optional(),
            when: controlCondition.optional(),
            /** The form the machine is for (the `useful` reading: light from a lamp, heat into the kettle's water). */
            useful: z.literal(true).optional(),
          })
          .strict(),
      )
      .max(24),
    start: z.union([z.number().positive(), z.object({ control: kebabId, values: z.record(kebabId, z.number().min(0)) }).strict()]).optional(),
    when: z.array(controlCondition).max(4).optional(),
    reading: z.object({ node: kebabId, through: z.array(kebabId).max(6).optional() }).strict().optional(),
    mix: z.object({ chains: z.array(kebabId).min(1).max(8), scale: z.number().positive().max(1) }).strict().optional(),
    /** A line under the card (what this chain leaves out). */
    note: bilingual.optional(),
  })
  .strict();
export type EnergyChain = z.output<typeof energyChainSchema>;

/** The chain names a sub-model's numbers apply in (elsewhere they read `—`; default: everywhere). */
const inChains = z.array(kebabId).min(1).max(12).optional();
const share = z.number().min(0).max(1);

/**
 * The energy model's data (docs/31 §4.2, lib/sim/energy.ts): `chain` (the
 * choice control naming the chain on show; one chain per option), `chains`,
 * `shares` (tables of percentages per node: `panel.electrical` = 21), and
 * the optional sub-models, each naming the controls it reads. Heights in cm
 * (the drop), lengths in m, speeds of the dynamo in km/h, g in N/kg.
 */
export const energySchema = z
  .object({
    g: pos.default(9.8),
    chain: kebabId,
    /** Panels: `sky` (a choice) → `irradiance` (W/m² on the panels) and the Sun's `glow` (0–1). */
    solar: z
      .object({
        sky: kebabId,
        modules: z.number().int().min(1).max(200),
        area: pos,
        efficiency: z.number().positive().max(1),
        irradiance: z.record(kebabId, z.number().min(0)),
        glow: z.record(kebabId, share),
        chains: inChains,
      })
      .strict()
      .optional(),
    /** A dropped ball: `drop` (a step control, cm), `surface` (a choice) → rebound `ratio`; `heat`: the share of the lost energy that is heat (the rest sound); `slow`. */
    bounce: z
      .object({ drop: kebabId, surface: kebabId, ratio: z.record(kebabId, z.number().min(0).max(1)), slow: z.number().min(1).max(10).default(1), heat: share.default(0.9), chains: inChains })
      .strict()
      .optional(),
    /** A swing: `length` (m), let go at `amplitude`°, losing `loss` of what is left each half-swing, `swings` half-swings, sampled every `sample` s. */
    swing: z
      .object({
        length: pos,
        amplitude: z.number().min(1).max(80),
        loss: z.number().min(0).max(0.5),
        swings: z.number().int().min(1).max(16),
        sample: z.number().min(0.02).max(0.2).default(0.08),
        heat: share.default(0.9),
      })
      .strict()
      .optional(),
    /** A wind-up toy: `winds` (a step control of turns), `secondsPerTurn`, top `speed` (m/s), `wheel` radius (m), `kinetic` (% at top speed), `spinUp` (s). */
    windup: z
      .object({ winds: kebabId, secondsPerTurn: pos, speed: pos, wheel: pos, kinetic: z.number().min(0).max(50).default(8), spinUp: z.number().positive().max(2).default(0.2), chains: inChains })
      .strict()
      .optional(),
    /** A bicycle dynamo: `speed` (a step control, km/h), `on` (a toggle: pressed on the tyre; default always), current cap `imax` (A) and `v0` (km/h), `lampOhms`, `rated` (W), wheel circumference `wheel` (m), `crankRatio`. */
    dynamo: z
      .object({ speed: kebabId, on: kebabId.optional(), imax: pos, v0: pos, lampOhms: pos, rated: pos, wheel: pos, crankRatio: pos, chains: inChains })
      .strict()
      .optional(),
    shares: z.record(kebabId, z.record(kebabId, z.number().min(0).max(100))).default({}),
    chains: z.record(kebabId, energyChainSchema),
  })
  .strict();
export type EnergyData = z.output<typeof energySchema>;

/** Where a life-cycle stage lives: `water` (the card's in-water band), `wall` (above the water line: a short wall stroke), `air`, `land`. */
export const LIFE_STAGE_PLACES = ['water', 'wall', 'air', 'land'] as const;

/** A stage id of the life-cycle model (not `total`: that key of a `days` row is the study's own total). */
const lifeStageId = kebabId.refine((v) => v !== 'total', { message: '"total" is the key of a row\'s measured total, not a stage' });

/**
 * The life-cycle model's data (docs/33 §4.2 E-M1, lib/sim/lifecycle.ts):
 * `temp` and `day` (step controls), the `stages` in order round the cycle
 * (the last is the adult; `start` is day 0, hatching: stages before it, the
 * egg, take no days), `groups` (the four larval stages: a list, or with a
 * `label` for the card's bracket), `days` (measured mean days per stage, one
 * row per temperature value, `total` the study's own hatching-to-adult
 * mean), `size` (a measured size per stage, optional), `emptying` (the
 * tipping-out controls), `rate` (the cycle flow and its paths, and the
 * reference temperature where it runs at speed 1), `card` (the ring card's
 * second ring, shown while `compare.control` is on).
 */
export const lifeCycleSchema = z
  .object({
    temp: kebabId,
    day: kebabId,
    start: lifeStageId,
    stages: z
      .array(
        z
          .object({
            id: lifeStageId,
            in: z.enum(LIFE_STAGE_PLACES),
            part: kebabId.optional(),
            label: bilingual,
            /** The card writes this on the arc out of a stage that takes no days (the egg: "waits for water"). */
            note: bilingual.optional(),
          })
          .strict(),
      )
      .min(2)
      .max(10),
    groups: z.record(kebabId, z.union([z.array(lifeStageId).min(2).max(8), z.object({ stages: z.array(lifeStageId).min(2).max(8), label: bilingual }).strict()])).optional(),
    days: z.record(z.string().regex(/^-?\d+(\.\d+)?$/, 'a row is keyed by a temperature value'), z.record(z.string(), z.number().finite())),
    size: z.record(kebabId, z.object({ unit: z.string().trim().min(1).max(8), values: z.record(lifeStageId, z.number().finite().positive()) }).strict()).optional(),
    emptying: z.object({ every: kebabId, wipe: kebabId.optional() }).strict().optional(),
    rate: z.object({ flow: kebabId, paths: z.array(kebabId).min(1).max(16), reference: z.number().finite() }).strict().optional(),
    card: z
      .object({
        compare: z
          .object({
            control: kebabId,
            label: bilingual,
            stages: z.array(z.object({ id: kebabId, label: bilingual }).strict()).min(2).max(8),
            /** The link under the second ring to that animal's topic (its words: "See the grasshopper"). */
            link: z.object({ topic: kebabId, chapter: kebabId.optional(), label: bilingual }).strict().optional(),
          })
          .strict()
          .optional(),
      })
      .strict()
      .optional(),
  })
  .strict();
export type LifeCycleData = z.output<typeof lifeCycleSchema>;

/**
 * Drawn over the stage from the model's outputs (docs/22 §4.4 M5):
 * `force-arrows` = one arrow on each of two parts along the line between
 * them, toward each other for a pull (positive value, `pull` colour, default
 * token:signal), apart for a push (`push`, default token:cold), `length`
 * (scene units, default 0.04) at 100 % and ∝ √|value| (the reading gives the
 * true relative value), `lift` above the parts' centres (default 0.02).
 * Shown while both parts are on show, the value is ≥ 0.5 and `when` holds.
 */
export const FORCE_KINDS = ['gravity', 'friction', 'elastic', 'push', 'magnetic'] as const;
export type ForceKind = (typeof FORCE_KINDS)[number];
export const ARROW_ANCHORS = ['centre', 'top', 'bottom'] as const;

/**
 * One force arrow (`force-vectors`): on `part`, of one `force` kind (its
 * colour token and KEY name), along `dir` (scene vector), as long as `value`
 * newtons × the overlay's `per`: a number, a number output, or a timeline
 * output's `channel`. It starts at the part's bounds centre, top or bottom
 * (`at`), shifted by `offset`, and follows the part (pose, offset, play).
 * `when`: shown only while the condition holds.
 */
export const forceArrowSchema = z
  .object({
    part: kebabId,
    force: z.enum(FORCE_KINDS),
    dir: vec3,
    value: z.union([z.number(), z.object({ output: kebabId, channel: z.string().min(1).max(40).optional() }).strict()]),
    at: z.enum(ARROW_ANCHORS).default('centre'),
    offset: vec3.optional(),
    when: z.object({ ...source, is: simCondition.default(true) }).strict().optional(),
  })
  .strict();
export type ForceArrow = z.output<typeof forceArrowSchema>;

/** Geometric optics bench; dimensions inside shapes and sheet/holes data are centimetres. */
export const lightShapeSchema = z.discriminatedUnion('kind', [
  z.object({ kind: z.literal('disc'), d: pos, thick: pos }).strict(),
  z.object({ kind: z.literal('polygon'), points: z.array(z.tuple([z.number(), z.number()])).min(3), thick: pos }).strict(),
  z.object({ kind: z.literal('cylinder'), d: pos, length: pos, axis: z.literal('z') }).strict(),
  z.object({ kind: z.literal('cone'), d: pos, length: pos, axis: z.literal('z'), apex: z.literal('+') }).strict(),
  z.object({ kind: z.literal('sphere'), d: pos }).strict(),
]);
export type LightShape = z.output<typeof lightShapeSchema>;
export const lightSchema = z.object({
  bench: z.object({
    source: z.object({ part: kebabId, point: vec3, axis: vec3, beam: z.number().positive().max(89) }).strict(),
    power: kebabId, gaps: z.object({ torch: kebabId, screen: kebabId }).strict(), holder: vec3,
    screen: z.object({ part: kebabId, size: z.tuple([pos, pos]) }).strict(), object: kebabId, turn: kebabId,
    objects: z.record(kebabId, z.object({ part: kebabId, shape: lightShapeSchema, names: z.record(z.string(), stateId) }).strict()),
  }).strict().optional(),
  sheets: z.object({ control: kebabId, size: z.tuple([pos, pos]), kinds: z.object({ hardly: z.number().min(0).max(100), dark: z.number().min(0).max(100) }).strict(), materials: z.record(kebabId, z.object({ part: kebabId, straight: z.number().min(0).max(1), scattered: z.number().min(0).max(1) }).strict()) }).strict().optional(),
  holes: z.object({ control: kebabId, hole: pos, cards: z.array(z.object({ part: kebabId, at: z.number(), moved: z.number().positive().optional() }).strict()).min(3) }).strict().optional(),
  seeing: z.object({ torch: kebabId, target: kebabId, reflects: z.record(kebabId, stateId) }).strict().optional(),
  sun: z.object({ lat: z.number().min(-66).max(66), lon: z.number().min(-180).max(180), zone: z.number().min(-12).max(14), time: kebabId, date: kebabId, dates: z.record(kebabId, z.string()), pole: pos, north: vec3 }).strict().optional(),
}).strict();
export type LightData = z.output<typeof lightSchema>;

const shadowSource = z.union([
  z.object({ part: kebabId, point: vec3, axis: vec3, beam: z.number().positive().max(89), when: z.object({ ...source, is: simCondition.default(true) }).strict().optional() }).strict(),
  z.object({ direction: z.object({ output: kebabId }).strict(), when: z.object({ ...source, is: simCondition.default(true) }).strict().optional() }).strict(),
]);
export const shadowCastSchema = z.object({
  kind: z.literal('shadow-cast'), source: shadowSource,
  receiver: z.object({ part: kebabId, normal: vec3, size: z.tuple([pos, pos]).optional(), radius: pos.optional() }).strict(),
  casters: z.array(z.object({ part: kebabId, dark: z.union([z.number().min(0).max(1), z.object({ output: kebabId }).strict()]).optional() }).strict()).min(1),
  spot: z.object({ color: colorRef }).strict().optional(),
  rays: z.object({ group: kebabId, edges: z.enum(['vertical', 'tip']), through: z.literal('dark').optional(), extra: z.array(z.tuple([z.number(), z.number()])).optional(), parallel: z.array(z.number()).optional() }).strict().optional(),
  trail: z.object({ control: kebabId }).strict().optional(),
}).strict();

export const simOverlaySchema = z.discriminatedUnion('kind', [
  shadowCastSchema,
  /**
   * Force arrows (docs/30 F3): `per` scene units per newton (default 0.03),
   * at most `max` long (0.25), faded below 0.05 N; all arrows one draw call;
   * `group`: a group (LAYERS row) they show with.
   */
  z
    .object({
      kind: z.literal('force-vectors'),
      arrows: z.array(forceArrowSchema).min(1).max(24),
      per: pos.default(0.03),
      max: pos.default(0.25),
      group: kebabId.optional(),
    })
    .strict(),
  /**
   * Energy bars (docs/31 E-EN6): beside `near` (+ `offset`, scene units from
   * the part's bounds centre), three upright bars facing the camera, read
   * from a timeline output's channels (`bars`: potential, kinetic and lost
   * energy, % of the run's start): potential, kinetic, and heat + sound
   * (split by `lostSplit`, illustrative); a hairline marks 100 % at `height`
   * scene units; always summing to 100 %. All bars of all overlays: one draw
   * call; labels on the HUD layer. `when`: shown only while it holds.
   */
  z
    .object({
      kind: z.literal('energy-bars'),
      timeline: kebabId,
      near: kebabId,
      offset: vec3.optional(),
      height: pos.default(0.6),
      width: pos.default(0.04),
      gap: pos.default(0.02),
      bars: z
        .object({ potential: z.string().min(1).max(40).default('pe'), kinetic: z.string().min(1).max(40).default('ke'), lost: z.string().min(1).max(40).default('lost') })
        .strict()
        .default({}),
      lostSplit: z.object({ heat: z.number().min(0).max(1), sound: z.number().min(0).max(1) }).strict().default({ heat: 0.9, sound: 0.1 }),
      when: z.object({ ...source, is: simCondition.default(true) }).strict().optional(),
    })
    .strict(),
  z
    .object({
      kind: z.literal('force-arrows'),
      between: z.tuple([kebabId, kebabId]),
      output: kebabId,
      length: z.number().positive().optional(),
      lift: z.number().optional(),
      pull: colorRef.optional(),
      push: colorRef.optional(),
      when: z.object({ ...source, is: simCondition.default(true) }).strict().optional(),
    })
    .strict(),
]);
export type SimOverlay = z.output<typeof simOverlaySchema>;
export type ShadowCastOverlay = Extract<SimOverlay, { kind: 'shadow-cast' }>;

export const SIM_KINDS = ['circuit', 'magnet', 'force', 'energy', 'life-cycle', 'matter', 'light'] as const;
export type SimKind = (typeof SIM_KINDS)[number];

export const MAX_SIM_CONTROLS = 16;
/** A forces bench reads two dozen quantities (docs/30 §4.3): timelines, numbers and states. */
export const MAX_SIM_OUTPUTS = 32;

export const simSchema = z
  .object({
    kind: z.enum(SIM_KINDS),
    controls: z.array(simControlSchema).min(1).max(MAX_SIM_CONTROLS),
    outputs: z.array(simOutputSchema).min(1).max(MAX_SIM_OUTPUTS),
    bind: z.array(simBindSchema).max(64).default([]),
    overlays: z.array(simOverlaySchema).max(4).default([]),
    circuit: circuitSchema.optional(),
    magnet: magnetSchema.optional(),
    force: forceSchema.optional(),
    energy: energySchema.optional(),
    lifeCycle: lifeCycleSchema.optional(),
    matter: matterSchema.optional(),
    light: lightSchema.optional(),
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
      .union([
        z.literal(true),
        z
          .object({
            judge: z.object({ output: kebabId, gt: z.number().default(0), label: bilingual }).strict().optional(),
            /**
             * A small graph under the table (docs/30 F5) once it has two rows: a
             * line graph over a step control's values, a bar graph over a choice's
             * options; `y`: the number output(s) drawn (≤ 3, one unit; default
             * the first number the card observes).
             */
            chart: z.union([z.literal(true), z.object({ y: z.union([kebabId, z.array(kebabId).min(1).max(3)]) }).strict()]).optional(),
          })
          .strict()
          .refine((r) => r.judge !== undefined || r.chart !== undefined, 'record: give `judge` or `chart` (or write `record: true`)'),
      ])
      .optional(),
    /**
     * A "Run again" button (and key G) that plays the chapter's timeline
     * outputs from the start: `true` = those its varied control changes, or
     * the ids of the timeline outputs. The card also says when a run is shown
     * slowed down.
     */
    replay: z.union([z.literal(true), z.array(kebabId).min(1).max(6)]).optional(),
    predict: z
      .object({
        prompt: bilingual,
        /** Values set first, before the reading is taken (the switch closed, the bulb in): what the prediction starts from. */
        start: simValues.optional(),
        change: simValues,
        /** `means`: an outcome of a number output, or a state of a state output (the reveal names the state). */
        options: z.array(z.object({ id: kebabId, label: bilingual, means: z.union([z.enum(PREDICT_MEANS), stateId]) }).strict()).min(2).max(4),
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
  partData?: readonly MatterPart[];
  parts: ReadonlySet<string>;
  /** `own`: the flow has a `path` or `paths` of its own. */
  flows: ReadonlyMap<string, { paths?: readonly { id: string }[] | undefined; own?: boolean }>;
  animations: ReadonlyMap<string, { kind: string; target: string }>;
  poses: ReadonlySet<string>;
  /** Parts with a `repeat` and no `extra` (a `count` binding shows their first k copies). */
  countable: ReadonlySet<string>;
  /** Parts whose primitive is `filings`. */
  filings?: ReadonlySet<string>;
  /** Parts with a `primitive` (a magnet's `part` must be one). */
  primitives?: ReadonlySet<string>;
  /** Per part: how many `coil` primitives it has (main and `extra`; a `stretch` needs exactly one). */
  coils?: ReadonlyMap<string, number>;
  /** Parts with a `repeat`; parts with `extra` (an `each` play turns every copy). */
  repeated?: ReadonlySet<string>;
  withExtra?: ReadonlySet<string>;
  /** Group ids (a force-vectors overlay's `group`). */
  groups?: ReadonlySet<string>;
  /** Context parts (never selected: a life-cycle stage's `part` may not be one). */
  contextParts?: ReadonlySet<string>;
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

/**
 * Quantity names the magnet model offers: `force` (%), `facing` (state),
 * `needle-bearing` (°, 0–360 clockwise from model north), `field-state`
 * (state: `magnet.fields`), the clip counts, and `clips` (the clip count the
 * chapter's try-it card observes; `—` elsewhere: one PLATE reading for all three).
 */
export const MAGNET_QUANTITIES = ['force', 'clips-cards', 'clips-stroke', 'clips-em', 'clips', 'facing', 'needle-bearing', 'field-state'] as const;
const MAGNET_STATES: readonly string[] = ['facing', 'field-state'];

/** The kind of a model quantity (an output's `from`), or null when the model (or the data it needs) has none of that name. */
export function quantityKind(sim: SimData, from: string): SimOutput['kind'] | null {
  switch (sim.kind) {
    case 'matter':
      return sim.matter ? matterQuantity(sim.matter, from)?.kind ?? null : null;
    case 'light': {
      if (from.startsWith('control:')) return sim.controls.some((c) => c.id === from.slice(8) && c.kind !== 'choice') ? 'number' : null;
      return sim.light ? lightQuantity(sim.light, from) : null;
    }
    case 'circuit':
      if (!sim.circuit || !circuitQuantities(sim.circuit).includes(from)) return null;
      return from === 'edges' ? 'vector' : from.startsWith('status:') || from.startsWith('sound:') ? 'state' : 'number';
    case 'magnet':
      if (!(MAGNET_QUANTITIES as readonly string[]).includes(from)) return null;
      return MAGNET_STATES.includes(from) ? 'state' : 'number';
    case 'force': {
      const q = forceQuantity(from);
      return q && sim.force?.[q.model] ? q.kind : null;
    }
    case 'energy': {
      const q = energyQuantity(from);
      if (!q || !sim.energy) return null;
      if (q.model === 'chain') {
        const node = from.startsWith('in:') || from.startsWith('out:') ? from.split(':')[1]! : null;
        if (node !== null && !energyNodes(sim.energy).has(node)) return null;
        if (from.startsWith('out:') && !(ENERGY_FORMS as readonly string[]).includes(from.split(':')[2]!)) return null;
        return q.kind;
      }
      return sim.energy[q.model] ? q.kind : null;
    }
    case 'life-cycle': {
      const lc = sim.lifeCycle;
      const q = lifeCycleQuantity(from);
      if (!q || !lc || (q.needs && !lc[q.needs])) return null;
      if (q.prefix === 'days' && !timedStages(lc).includes(q.ref!) && !lc.groups?.[q.ref!]) return null;
      if (q.prefix === 'on' && !lc.stages.some((s) => s.id === q.ref)) return null;
      if (q.prefix === 'size' && !lc.size?.[q.ref!]) return null;
      if (q.prefix === 'control' && !sim.controls.some((c) => c.id === q.ref && c.kind !== 'choice')) return null;
      return q.kind;
    }
  }
}

/** The channels of a timeline quantity of this sim's model (null: not a timeline it knows). */
export function simTimelineChannels(sim: SimData, from: string): string[] | null {
  if (sim.kind === 'force' && sim.force) return forceTimelineChannels(sim.force, from);
  if (sim.kind === 'energy' && sim.energy) return energyTimelineChannels(from);
  return null;
}

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
  const defaults = Object.fromEntries(sim.controls.map((c) => [c.id, c.default])) as SimValues;
  let defaultQuantities: ReturnType<typeof simQuantities> | undefined;
  const xyzOutput = (output: SimOutput | undefined): boolean => {
    if (output?.kind !== 'vector') return false;
    defaultQuantities ??= simQuantities(sim, defaults);
    const vector = defaultQuantities[output.from ?? output.id];
    return typeof vector === 'object' && vector !== null && Object.keys(vector).sort().join(',') === 'x,y,z' && Object.values(vector).every((v) => typeof v === 'number' && Number.isFinite(v));
  };
  sim.controls.forEach((c, i) => {
    if (sim.controls.findIndex((x) => x.id === c.id) !== i) issue(['controls', i, 'id'], `duplicate control "${c.id}"`);
    if (outputs.has(c.id)) issue(['controls', i, 'id'], `"${c.id}" is also an output`);
    if (!legalValue(c, c.default)) issue(['controls', i, 'default'], `default ${JSON.stringify(c.default)} is not one of the control's values`);
    if (c.kind === 'step') {
      if (c.format === 'time' && (c.unit !== 'h' || c.values.some((v) => v < 0 || v > 24))) issue(['controls', i, 'format'], 'time format needs unit h and values in 0–24');
      const up = c.values.every((v, j) => j === 0 || v > c.values[j - 1]!);
      const down = c.values.every((v, j) => j === 0 || v < c.values[j - 1]!);
      if (!up && !down) issue(['controls', i, 'values'], 'step values must ascend or descend (no repeats)');
    }
    if (c.kind === 'choice') {
      if (new Set(c.options.map((o) => o.id)).size !== c.options.length) issue(['controls', i, 'options'], 'duplicate option ids');
      for (const [opt, set] of Object.entries(c.sets ?? {})) {
        if (!c.options.some((o) => o.id === opt)) issue(['controls', i, 'sets', opt], `unknown option "${opt}"`);
        for (const [id, v] of Object.entries(set)) {
          const t = controls.get(id);
          if (!t) issue(['controls', i, 'sets', opt, id], `unknown control "${id}"`);
          else if (t.kind === 'choice' && t.sets && t.sets[String(v)] !== undefined) issue(['controls', i, 'sets', opt, id], `"${id}" has sets of its own (no chains)`);
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
  sim.outputs.forEach((o, i) => {
    if (sim.outputs.findIndex((x) => x.id === o.id) !== i) issue(['outputs', i, 'id'], `duplicate output "${o.id}"`);
    const from = o.from ?? o.id;
    if (o.format === 'time' && (o.kind !== 'number' || o.unit !== 'h' || (from.startsWith('control:') && (() => { const c = controls.get(from.slice(8)); return c?.kind !== 'step' || c.values.some((v) => v < 0 || v > 24); })()))) issue(['outputs', i, 'format'], 'time format needs a number output in hours, 0–24');
    const kind = quantityKind(sim, from);
    if (o.format === 'time' && kind === 'number' && o.unit === 'h') {
      const reads = from.startsWith('control:') ? sim.controls.filter((c) => c.id === from.slice(8)) : sim.kind === 'light' && sim.light?.sun && from.startsWith('sun:') ? sim.controls.filter((c) => [sim.light!.sun!.time, sim.light!.sun!.date].includes(c.id)) : sim.controls;
      if (combinations(reads, defaults).some((values) => { const value = simQuantities(sim, values)[from]; return typeof value !== 'number' || !Number.isFinite(value) || value < 0 || value > 24; })) issue(['outputs', i, 'format'], 'time format output values must be finite hours in 0–24');
    }
    if (kind === null) {
      const q = sim.kind === 'force' ? forceQuantity(from) : sim.kind === 'energy' ? energyQuantity(from) : null;
      const lq = sim.kind === 'life-cycle' ? lifeCycleQuantity(from) : null;
      const needs = q && q.model !== 'chain' ? q.model : lq?.needs && sim.lifeCycle && !sim.lifeCycle[lq.needs] ? lq.needs : null;
      issue(['outputs', i, 'from'], needs ? `"${from}" needs the ${sim.kind} model's \`${needs}\` data` : `the ${sim.kind} model has no quantity "${from}"`);
    } else if (kind !== o.kind) issue(['outputs', i, 'kind'], `"${from}" is a ${kind}, not a ${o.kind}`);
    const states =
      sim.kind === 'light' && sim.light
        ? lightStates(sim.light, from, sim.controls)
        : sim.kind === 'matter' && sim.matter
        ? matterQuantity(sim.matter, from)?.states
        : sim.kind === 'force'
        ? FORCE_STATES[from]
        : sim.kind === 'energy' && from === 'chain-state' && sim.energy
          ? Object.keys(sim.energy.chains)
          : sim.kind === 'life-cycle' && sim.lifeCycle
            ? from === 'stage'
              ? [...timedStages(sim.lifeCycle), lastStage(sim.lifeCycle)]
              : EMPTYING_STATES[from]
            : undefined;
    if (states && o.kind === 'state') for (const st of states) if (!o.states?.[st]) issue(['outputs', i, 'states'], `"${from}" can be "${st}": give it a label`);
    if (sim.kind === 'light' && sim.light && o.kind === 'state' && kind === 'state') {
      const known = lightStates(sim.light, from, sim.controls) ?? [];
      for (const st of Object.keys(o.states ?? {})) if (!known.includes(st)) issue(['outputs', i, 'states', st], `"${from}" is never "${st}" (${known.join(', ')})`);
    }
    if (sim.kind === 'life-cycle' && sim.lifeCycle && o.kind === 'state' && kind === 'state') {
      const known = from === 'stage' ? sim.lifeCycle.stages.map((s) => s.id) : (EMPTYING_STATES[from] ?? []);
      for (const st of Object.keys(o.states ?? {})) if (!known.includes(st)) issue(['outputs', i, 'states', st], `"${from}" is never "${st}" (${known.join(', ')})`);
    }
  });
  if (sim.kind === 'matter' && !sim.matter) issue(['matter'], 'a matter sim needs `matter`');
  if (sim.matter) matterIssues(sim.matter, controls, ctx.partData ?? []).forEach((x) => issue(['matter', ...x.path], x.message));
  if (sim.kind === 'circuit' && !sim.circuit) issue(['circuit'], 'a circuit sim needs `circuit`');
  if (sim.kind === 'magnet' && !sim.magnet) issue(['magnet'], 'a magnet sim needs `magnet`');
  if (sim.kind === 'force' && !sim.force) issue(['force'], 'a force sim needs `force`');
  if (sim.kind === 'energy' && !sim.energy) issue(['energy'], 'an energy sim needs `energy`');
  if (sim.kind === 'light' && !sim.light) issue(['light'], 'a light sim needs `light`');
  if (sim.light) lightIssues(sim.light, controls, ctx).forEach((x) => issue(['light', ...x.path], x.message));
  if (sim.kind === 'life-cycle' && !sim.lifeCycle) issue(['lifeCycle'], 'a life-cycle sim needs `lifeCycle`');
  if (sim.lifeCycle) lifeCycleIssues(sim.lifeCycle, controls, ctx).forEach((x) => issue(['lifeCycle', ...x.path], x.message));
  if (sim.force) forceIssues(sim.force, controls, ctx).forEach((x) => issue(['force', ...x.path], x.message));
  if (sim.energy) energyIssues(sim, sim.energy, controls, ctx).forEach((x) => issue(['energy', ...x.path], x.message));
  if (sim.circuit) circuitIssues(sim.circuit, controls, ctx).forEach((x) => issue(['circuit', ...x.path], x.message));
  if (sim.magnet) magnetIssues(sim, sim.magnet, controls, ctx).forEach((x) => issue(['magnet', ...x.path], x.message));
  const fieldStates = (o: SimOutput | undefined) => o?.kind === 'state' && (o.from ?? o.id) === 'field-state' && sim.kind === 'magnet';
  const stateBound = new Set<string>();
  const filled = new Set<string>();
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
      if (b.fill) {
        if (outp && outp.kind !== 'number' || ctl && ctl.kind !== 'step') issue(['bind', i, 'fill'], 'fill needs a number output or step control');
        for (const id of ids) {
          if (filled.has(id)) issue(['bind', i, 'fill'], `duplicate fill for "${id}"`);
          filled.add(id);
          const part = ctx.partData?.find((p) => p.id === id);
          const shape = part?.primitive && fillShapeForPrimitive(part.primitive);
          if (!shape || part?.context || part?.repeat || part?.extra?.length) {
            issue(['bind', i, 'fill'], `"${id}" needs one upright full-round lathe or box primitive, no context, repeat or extra`);
            continue;
          }
          if (part.primitive?.kind === 'lathe') for (const message of validateFillProfile(part.primitive.profile)) issue(['bind', i, 'fill'], message);
          const cap = capacity(shape);
          if (b.fill.below * b.fill.per >= cap) issue(['bind', i, 'fill', 'below'], 'below must be less than capacity');
          const max = ctl?.kind === 'step' ? Math.max(...ctl.values) : sim.matter && outp ? matterQuantityRange(sim.matter, outp.from ?? outp.id, controls, matterLiquidShapes(ctx.partData ?? []))?.[1] ?? null : null;
          if (max !== null && (max + b.fill.below) * b.fill.per > cap + 1e-12) issue(['bind', i, 'fill'], `maximum fill exceeds capacity of "${id}"`);
        }
      }
      if (b.count) for (const id of ids) if (!ctx.countable.has(id)) issue(['bind', i, 'count'], `"${id}" needs a \`repeat\` and no \`extra\` to show a count of copies`);
      if ((b.glow || b.tint || b.count || b.offset || b.rotate || b.fill) && outp && outp.kind !== 'number')
        issue(['bind', i], `glow / tint / count / offset / rotate / fill need a number, "${src}" is a ${outp.kind}`);
      if (outp?.kind === 'timeline' && ['place', 'visible', 'pose', 'glow', 'tint', 'count', 'offset', 'rotate', 'at', 'state'].some(has))
        issue(['bind', i], `"${src}" is a timeline: bind it with \`play\` or a \`stretch\` with a \`channel\``);
      if (b.place) {
        if (!xyzOutput(outp)) issue(['bind', i, 'place'], 'place needs an xyz vector output with exactly three finite values');
        if (b.offset || b.at || b.play) issue(['bind', i, 'place'], 'place cannot combine with offset, at or play');
      }
      if (b.play) {
        const p = b.play;
        if (outp?.kind !== 'timeline') issue(['bind', i, 'play'], `play needs a timeline output${outp ? `, "${src}" is a ${outp.kind}` : ''}`);
        else {
          const channels = simTimelineChannels(sim, outp.from ?? outp.id);
          if (channels && !channels.includes(p.channel)) issue(['bind', i, 'play', 'channel'], `"${src}" has no channel "${p.channel}" (${channels.join(', ') || 'none'})`);
        }
        if ((p.axis === undefined) === (p.turn === undefined)) issue(['bind', i, 'play'], 'give `axis` (a move) or `turn` (a turn), not both');
        if (p.each && p.turn === undefined) issue(['bind', i, 'play', 'each'], '`each` turns every copy: give `turn`');
        if (p.each && p.pivot) issue(['bind', i, 'play', 'pivot'], '`each` turns every copy about its own centre: no `pivot`');
        if (p.pivot && p.turn === undefined) issue(['bind', i, 'play', 'pivot'], 'a `pivot` belongs to a turn');
        if (p.when) {
          const w = p.when;
          if ((w.control === undefined) === (w.output === undefined)) issue(['bind', i, 'play', 'when'], 'name exactly one `control` or `output`');
          else if (w.control !== undefined && !controls.has(w.control)) issue(['bind', i, 'play', 'when', 'control'], `unknown control "${w.control}"`);
          else if (w.output !== undefined && !outputs.has(w.output)) issue(['bind', i, 'play', 'when', 'output'], `unknown output "${w.output}"`);
        }
        if (p.each) for (const id of ids) if (ctx.repeated && !ctx.repeated.has(id) && !ctx.withExtra?.has(id)) issue(['bind', i, 'play', 'each'], `"${id}" has one copy (no \`repeat\` or \`extra\`): leave \`each\` out`);
      }
      if (b.stretch) {
        const st = b.stretch;
        for (const id of ids) {
          if (ctx.coils && (ctx.coils.get(id) ?? 0) !== 1) issue(['bind', i, 'stretch'], `"${id}" needs exactly one \`coil\` primitive to stretch (has ${ctx.coils.get(id) ?? 0})`);
          if (ctx.repeated?.has(id)) issue(['bind', i, 'stretch'], `"${id}" is repeated: a stretched coil is one copy`);
        }
        if (st.channel !== undefined) {
          if (outp?.kind !== 'timeline') issue(['bind', i, 'stretch', 'channel'], `a \`channel\` needs a timeline output${outp ? `, "${src}" is a ${outp.kind}` : ''}`);
          else {
            const channels = simTimelineChannels(sim, outp.from ?? outp.id);
            if (channels && !channels.includes(st.channel)) issue(['bind', i, 'stretch', 'channel'], `"${src}" has no channel "${st.channel}"`);
          }
          if (st.settle) issue(['bind', i, 'stretch', 'settle'], 'a timeline channel is played as it is: no `settle`');
        } else if (outp && outp.kind !== 'number') issue(['bind', i, 'stretch'], `stretch needs a number (or a timeline with \`channel\`), "${src}" is a ${outp.kind}`);
        else if (ctl && ctl.kind === 'choice') issue(['bind', i, 'stretch'], `"${src}" is a choice: stretch by a number`);
      }
      if (b.rotate && outp && (outp.from ?? outp.id) === 'needle-bearing' && sim.kind === 'magnet') {
        // A bearing turns clockwise seen from above: about −Y (a positive turn about +Y is anticlockwise).
        const a = b.rotate.axis;
        const spin = Math.sign(a[1]) * Math.sign(b.rotate.per);
        if (Math.abs(a[0]) > 1e-9 || Math.abs(a[2]) > 1e-9 || spin >= 0)
          issue(['bind', i, 'rotate'], 'a compass bearing turns clockwise seen from above: give `axis: [0, -1, 0]` (or `per: -1` about [0, 1, 0])');
      }
      if (outp && (outp.from ?? outp.id) === 'clips' && sim.kind === 'magnet') issue(['bind', i, 'output'], 'bind clips-cards / clips-stroke / clips-em (`clips` is the PLATE reading of whichever the card observes)');
      if (b.at !== undefined) {
        const ring = sim.magnet?.rings?.[b.at];
        if (!ring) issue(['bind', i, 'at'], `unknown ring "${b.at}" (magnet.rings)`);
        if (!ctl) issue(['bind', i, 'at'], 'a ring position comes from a step `control`');
        else if (ctl.kind !== 'step' || (ring && ctl.values.some((v) => !Number.isInteger(v) || v < 1 || v > ring.count)))
          issue(['bind', i, 'at'], `"${src}" must be a step control of positions 1 … ${ring?.count ?? 'count'}`);
      }
      if (b.state) {
        if (!fieldStates(outp)) issue(['bind', i, 'state'], '`state` needs the magnet model\'s field-state output');
        for (const id of ids) {
          if (!ctx.filings?.has(id)) issue(['bind', i, 'state'], `"${id}" has no \`filings\` primitive`);
          stateBound.add(id);
        }
      }
      const fields = ['place', 'visible', 'pose', 'glow', 'tint', 'count', 'offset', 'rotate', 'at', 'state', 'play', 'stretch', 'fill'].filter(has);
      if (fields.length === 0) issue(['bind', i], 'a part binding needs place, visible, pose, glow, tint, count, offset, rotate, at, state, play, stretch or fill');
    } else if ('flow' in b) {
      if (outp?.kind === 'timeline') issue(['bind', i, 'output'], `"${src}" is a timeline: it moves parts (\`play\`), not flows`);
      const flow = ctx.flows.get(b.flow);
      if (!flow) issue(['bind', i, 'flow'], `unknown flow "${b.flow}"`);
      if (b.paths) {
        if (!b.visible) issue(['bind', i, 'paths'], 'paths belongs to a visible binding');
        if (new Set(b.paths).size !== b.paths.length) issue(['bind', i, 'paths'], 'duplicate path ids');
        for (const path of b.paths) if (!flow?.paths?.some((p) => p.id === path)) issue(['bind', i, 'paths'], `unknown path "${path}" of flow "${b.flow}"`);
      }
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
      if (b.state) {
        if (!fieldStates(outp)) issue(['bind', i, 'state'], '`state` needs the magnet model\'s field-state output');
        if (flow?.own) issue(['bind', i, 'state'], `flow "${b.flow}" runs along the field lines of the field state: drop its \`path\` / \`paths\``);
        if (b.intensity) issue(['bind', i, 'intensity'], 'a field-line flow has no per-path intensity');
        stateBound.add(`flow:${b.flow}`);
      }
      if (!b.visible && !b.intensity && !b.stops && !b.state) issue(['bind', i], 'a flow binding needs visible, intensity, stops or state');
    } else {
      if (outp?.kind === 'timeline') issue(['bind', i, 'output'], `"${src}" is a timeline: it moves parts (\`play\`), not animations`);
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
  for (const id of ctx.filings ?? []) if (!stateBound.has(id)) issue(['bind'], `filings part "${id}" needs a \`state\` binding to the field-state output`);
  for (const [id, f] of ctx.flows) if (f.own === false && !stateBound.has(`flow:${id}`)) issue(['bind'], `flow "${id}" has no path: give it one, or a \`state\` binding to the field-state output`);
  // Parts turned by a play binding: rolling (or spinning) parts take no frictional-force arrow (docs/30 D3: not in the syllabus).
  const turned = new Set(sim.bind.flatMap((b) => ('part' in b && b.play?.turn ? (Array.isArray(b.part) ? b.part : [b.part]) : [])));
  const whenIssues = (path: (string | number)[], w: { control?: string | undefined; output?: string | undefined } | undefined) => {
    if (!w) return;
    if ((w.control === undefined) === (w.output === undefined)) issue([...path, 'when'], 'name exactly one `control` or `output`');
    else if (w.control !== undefined && !controls.has(w.control)) issue([...path, 'when', 'control'], `unknown control "${w.control}"`);
    else if (w.output !== undefined && !outputs.has(w.output)) issue([...path, 'when', 'output'], `unknown output "${w.output}"`);
  };
  sim.overlays.forEach((o, i) => {
    if (o.kind === 'force-vectors') {
      if (o.group !== undefined && ctx.groups && !ctx.groups.has(o.group)) issue(['overlays', i, 'group'], `unknown group "${o.group}"`);
      o.arrows.forEach((a, k) => {
        const at = ['overlays', i, 'arrows', k];
        if (!ctx.parts.has(a.part)) issue([...at, 'part'], `unknown part "${a.part}"`);
        if (Math.hypot(a.dir[0], a.dir[1], a.dir[2]) < 1e-9) issue([...at, 'dir'], 'give the arrow a direction');
        if (a.force === 'friction' && turned.has(a.part))
          issue([...at, 'part'], `"${a.part}" turns (a wheel): the frictional force on rolling things is not drawn (docs/30 D3)`);
        if (typeof a.value === 'object') {
          const v = outputs.get(a.value.output);
          if (!v) issue([...at, 'value', 'output'], `unknown output "${a.value.output}"`);
          else if (a.value.channel !== undefined) {
            if (v.kind !== 'timeline') issue([...at, 'value', 'channel'], `"${a.value.output}" is a ${v.kind}, not a timeline`);
            else {
              const channels = simTimelineChannels(sim, v.from ?? v.id);
              if (channels && !channels.includes(a.value.channel)) issue([...at, 'value', 'channel'], `"${a.value.output}" has no channel "${a.value.channel}"`);
            }
          } else if (v.kind !== 'number') issue([...at, 'value', 'output'], `"${a.value.output}" is a ${v.kind}, not a number (a timeline needs \`channel\`)`);
        }
        whenIssues(at, a.when);
      });
      return;
    }
    if (o.kind === 'energy-bars') {
      const at = ['overlays', i];
      if (!ctx.parts.has(o.near)) issue([...at, 'near'], `unknown part "${o.near}"`);
      const v = outputs.get(o.timeline);
      if (!v) issue([...at, 'timeline'], `unknown output "${o.timeline}"`);
      else if (v.kind !== 'timeline') issue([...at, 'timeline'], `"${o.timeline}" is a ${v.kind}, not a timeline`);
      else {
        const channels = simTimelineChannels(sim, v.from ?? v.id);
        if (channels) for (const ch of Object.values(o.bars)) if (!channels.includes(ch)) issue([...at, 'bars'], `"${o.timeline}" has no channel "${ch}" (${channels.join(', ')})`);
      }
      if (Math.abs(o.lostSplit.heat + o.lostSplit.sound - 1) > 1e-9) issue([...at, 'lostSplit'], 'heat + sound must be 1 (they split the lost energy)');
      whenIssues(at, o.when);
      return;
    }
    if (o.kind === 'shadow-cast') {
      const at = ['overlays', i];
      const part = (path: (string | number)[], id: string) => { if (!ctx.parts.has(id)) issue(path, `unknown part "${id}"`); else if (ctx.contextParts?.has(id)) issue(path, `"${id}" is a context part`); };
      part([...at, 'receiver', 'part'], o.receiver.part);
      if ((o.receiver.size === undefined) === (o.receiver.radius === undefined)) issue([...at, 'receiver'], 'give exactly one rectangular size or circular radius');
      if (Math.hypot(...o.receiver.normal) < 1e-9) issue([...at, 'receiver', 'normal'], 'the receiver normal must be non-zero');
      if ('part' in o.source) { part([...at, 'source', 'part'], o.source.part); if (Math.hypot(...o.source.axis) < 1e-9) issue([...at, 'source', 'axis'], 'the light axis must be non-zero'); }
      else { const v = outputs.get(o.source.direction.output); if (!xyzOutput(v)) issue([...at, 'source', 'direction'], 'direction needs a vector output with exactly three finite x, y, z values'); }
      whenIssues([...at, 'source'], o.source.when);
      for (const [k, caster] of o.casters.entries()) {
        part([...at, 'casters', k, 'part'], caster.part);
        if (typeof caster.dark === 'object') { const v = outputs.get(caster.dark.output); if (!v || v.kind !== 'number') issue([...at, 'casters', k, 'dark'], 'dark needs a number output'); }
      }
      if (o.rays && ctx.groups && !ctx.groups.has(o.rays.group)) issue([...at, 'rays', 'group'], `unknown group "${o.rays.group}"`);
      if (o.trail) { if ('part' in o.source) issue([...at, 'trail'], 'a chalk trail needs parallel sunlight'); if (controls.get(o.trail.control)?.kind !== 'step') issue([...at, 'trail', 'control'], 'a trail needs a step control'); }
      return;
    }
    const [a, b] = o.between;
    for (const id of o.between) if (!ctx.parts.has(id)) issue(['overlays', i, 'between'], `unknown part "${id}"`);
    if (a === b) issue(['overlays', i, 'between'], 'two different parts');
    const v = outputs.get(o.output);
    if (!v) issue(['overlays', i, 'output'], `unknown output "${o.output}"`);
    else if (v.kind !== 'number') issue(['overlays', i, 'output'], `"${o.output}" is a ${v.kind}, not a number`);
    whenIssues(['overlays', i], o.when);
  });
  return out;
}

/** Cross-references and complete geometric envelope for every authored bench combination. */
function lightIssues(light: LightData, controls: ReadonlyMap<string, SimControl>, ctx: SimContext): { path: (string | number)[]; message: string }[] {
  const out: { path: (string | number)[]; message: string }[] = [];
  const issue = (path: (string | number)[], message: string) => out.push({ path, message });
  function control<K extends SimControl['kind']>(path: (string | number)[], id: string, kind: K): Extract<SimControl, { kind: K }> | undefined {
    const c = controls.get(id);
    if (!c) issue(path, `unknown control "${id}"`);
    else if (c.kind !== kind) issue(path, `"${id}" must be a ${kind} control`);
    return c?.kind === kind ? c as Extract<SimControl, { kind: K }> : undefined;
  }
  const part = (path: (string | number)[], id: string) => {
    if (!ctx.parts.has(id)) issue(path, `unknown part "${id}"`);
    else if (ctx.contextParts?.has(id)) issue(path, `"${id}" is a context part`);
  };
  const covers = (path: (string | number)[], choice: Extract<SimControl, {kind: 'choice'}> | undefined, table: Record<string, unknown>, none = false) => {
    if (!choice) return;
    const wanted = choice.options.map((o) => o.id).filter((id) => !none || id !== 'none');
    for (const id of wanted) if (!(id in table)) issue(path, `no data for option "${id}" of "${choice.id}"`);
    for (const id of Object.keys(table)) if (!wanted.includes(id)) issue([...path, id], `"${id}" is not an option of "${choice.id}"`);
  };
  const bench = light.bench;
  if ((light.sheets || light.holes) && !bench) issue(['bench'], 'sheets and holes need the bench source and gaps');
  if (!Object.keys(light).length) issue([], 'give at least one light experiment');
  if (bench) {
    part(['bench', 'source', 'part'], bench.source.part); part(['bench', 'screen', 'part'], bench.screen.part);
    if (Math.hypot(...bench.source.axis) < 1e-9) issue(['bench', 'source', 'axis'], 'the light axis must be non-zero');
    control(['bench', 'power'], bench.power, 'toggle');
    const a = control(['bench', 'gaps', 'torch'], bench.gaps.torch, 'step'), b = control(['bench', 'gaps', 'screen'], bench.gaps.screen, 'step');
    const object = control(['bench', 'object'], bench.object, 'choice'), turn = control(['bench', 'turn'], bench.turn, 'step');
    covers(['bench', 'objects'], object, bench.objects, true);
    for (const [id, obj] of Object.entries(bench.objects)) {
      part(['bench', 'objects', id, 'part'], obj.part);
      for (const angle of turn?.values ?? []) if (!(String(angle) in obj.names)) issue(['bench', 'objects', id, 'names'], `no shape name for turn ${angle}°`);
      for (const key of Object.keys(obj.names)) if (turn && !turn.values.includes(Number(key))) issue(['bench', 'objects', id, 'names', key], `turn ${key}° is not authored`);
      if (a && b && turn) for (const angle of turn.values) {
        const depth = shapeHalfDepth(obj.shape, angle);
        for (const [key, gap] of [['torch', a], ['screen', b]] as const) if (gap.values.some((v) => v <= depth)) issue(['bench', 'gaps', key], `every gap must exceed ${depth.toFixed(3)} cm (${id} at ${angle}° half depth)`);
        for (const torch of a.values) for (const screen of b.values) {
          if (torch <= depth || screen <= depth) continue;
          const shadow = benchShadow(bench, id, angle, torch, screen), [width, height] = bench.screen.size;
          if (shadow.width > width + 1e-9 || shadow.height > height + 1e-9 || shadow.min[0] < -width / 2 || shadow.max[0] > width / 2 || shadow.min[1] < -height / 2 || shadow.max[1] > height / 2)
            issue(['bench', 'screen', 'size'], `${id} at ${angle}°, gaps ${torch}/${screen} cm: ${shadow.width.toFixed(2)} × ${shadow.height.toFixed(2)} cm shadow exceeds the screen`);
          const radius = (torch + screen) * Math.tan(bench.source.beam * Math.PI / 180), corner = Math.hypot(Math.max(Math.abs(shadow.min[0]), Math.abs(shadow.max[0])), Math.max(Math.abs(shadow.min[1]), Math.abs(shadow.max[1])));
          if (corner > radius + 1e-9) issue(['bench', 'source', 'beam'], `${id} at ${angle}°, gaps ${torch}/${screen} cm: shadow is outside the light beam`);
        }
      }
    }
  }
  if (light.sheets) {
    const sheets = light.sheets, c = control(['sheets', 'control'], sheets.control, 'choice'); covers(['sheets', 'materials'], c, sheets.materials, true);
    if (sheets.kinds.dark >= sheets.kinds.hardly) issue(['sheets', 'kinds'], 'dark must be below hardly');
    for (const [id, m] of Object.entries(sheets.materials)) { part(['sheets', 'materials', id, 'part'], m.part); if (m.straight + m.scattered > 1 + 1e-12) issue(['sheets', 'materials', id], 'straight + scattered must be ≤ 1'); }
  }
  if (light.holes) {
    const holes = light.holes; control(['holes', 'control'], holes.control, 'choice');
    const c = controls.get(holes.control); if (c?.kind === 'choice' && (c.options.length !== 2 || !['in-line', 'moved'].every((id) => c.options.some((o) => o.id === id)))) issue(['holes', 'control'], 'hole alignment options must be in-line and moved');
    if (new Set(holes.cards.map((c) => c.at)).size !== holes.cards.length) issue(['holes', 'cards'], 'card positions must be distinct');
    if (holes.cards.filter((c) => c.moved !== undefined).length !== 1) issue(['holes', 'cards'], 'exactly one card has moved');
    holes.cards.forEach((c, i) => { part(['holes', 'cards', i, 'part'], c.part); const gap = bench && controls.get(bench.gaps.torch); if (gap?.kind === 'step' && gap.values.some((v) => v + c.at <= 0)) issue(['holes', 'cards', i, 'at'], 'every card must be in front of the source at every torch gap'); });
  }
  if (light.seeing) { const seeing = light.seeing; control(['seeing', 'torch'], seeing.torch, 'toggle'); covers(['seeing', 'reflects'], control(['seeing', 'target'], seeing.target, 'choice'), seeing.reflects); }
  if (light.sun) {
    const sun = light.sun, date = control(['sun', 'date'], sun.date, 'choice'), time = control(['sun', 'time'], sun.time, 'step'); covers(['sun', 'dates'], date, sun.dates);
    if (Math.abs(sun.north[1]) > 1e-9 || Math.abs(Math.hypot(...sun.north) - 1) > 1e-6) issue(['sun', 'north'], 'north must be a horizontal unit vector');
    if (time?.values.some((v) => v < 0 || v > 24)) issue(['sun', 'time'], 'local hours must be in 0–24');
    for (const [id, iso] of Object.entries(sun.dates)) {
      const parsed = new Date(`${iso}T00:00:00Z`);
      if (!/^\d{4}-\d{2}-\d{2}$/.test(iso) || !Number.isFinite(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== iso) { issue(['sun', 'dates', id], 'use a valid ISO date YYYY-MM-DD'); continue; }
      for (const hour of time?.values ?? []) if (sunPosition(iso, hour, sun.lat, sun.lon, sun.zone).height < 5) issue(['sun', 'time'], `${iso} at ${hour} h: the Sun must be at least 5° above the horizon`);
    }
  }
  return out;
}

/** Every combination of these controls' values (at most `cap`; the rest at `base`). */
function combinations(controls: readonly SimControl[], base: SimValues, cap = 512): SimValues[] {
  let out: SimValues[] = [{ ...base }];
  for (const c of controls) {
    const vals: SimValue[] = c.kind === 'toggle' ? [false, true] : c.kind === 'step' ? c.values : c.options.map((o) => o.id);
    if (out.length * vals.length > cap) break;
    out = out.flatMap((v) => vals.map((x) => ({ ...v, [c.id]: x })));
  }
  return out;
}

/**
 * The energy model's own data: the controls each sub-model reads and their
 * tables, the chains (nodes, links, shares, paths, conditions, readings), and
 * that every node gives out what it takes in for every combination of the
 * controls the chain reads.
 */
function energyIssues(sim: SimData, e: EnergyData, controls: ReadonlyMap<string, SimControl>, ctx: SimContext): { path: (string | number)[]; message: string }[] {
  const out: { path: (string | number)[]; message: string }[] = [];
  const issue = (path: (string | number)[], message: string) => out.push({ path, message });
  const control = (path: (string | number)[], id: string, kinds: readonly SimControl['kind'][]) => {
    const c = controls.get(id);
    if (!c) issue(path, `unknown control "${id}"`);
    else if (!kinds.includes(c.kind)) issue(path, `"${id}" is a ${c.kind} control, not a ${kinds.join(' or ')}`);
    return c;
  };
  const options = (c: SimControl | undefined) => (c?.kind === 'choice' ? c.options.map((o) => o.id) : []);
  const covers = (path: (string | number)[], c: SimControl | undefined, table: Readonly<Record<string, unknown>>, what: string) => {
    if (c?.kind !== 'choice') return;
    for (const o of options(c)) if (!(o in table)) issue(path, `option "${o}" of "${c.id}" has no ${what}`);
    for (const k of Object.keys(table)) if (!options(c).includes(k)) issue(path, `"${k}" is not an option of "${c.id}"`);
  };
  const chainControl = control(['chain'], e.chain, ['choice']);
  covers(['chains'], chainControl, e.chains, 'chain');
  const chainIds = new Set(Object.keys(e.chains));
  const inChains = (path: (string | number)[], list: readonly string[] | undefined) => {
    for (const id of list ?? []) if (!chainIds.has(id)) issue(path, `unknown chain "${id}"`);
  };
  if (e.solar) {
    const sky = control(['solar', 'sky'], e.solar.sky, ['choice']);
    covers(['solar', 'irradiance'], sky, e.solar.irradiance, 'irradiance');
    covers(['solar', 'glow'], sky, e.solar.glow, 'glow');
    inChains(['solar', 'chains'], e.solar.chains);
  }
  if (e.bounce) {
    const drop = control(['bounce', 'drop'], e.bounce.drop, ['step']);
    if (drop?.kind === 'step' && drop.values.some((v) => v <= 0)) issue(['bounce', 'drop'], 'drop heights are in cm, above 0');
    covers(['bounce', 'ratio'], control(['bounce', 'surface'], e.bounce.surface, ['choice']), e.bounce.ratio, 'rebound ratio');
    inChains(['bounce', 'chains'], e.bounce.chains);
  }
  if (e.windup) {
    const w = e.windup;
    const winds = control(['windup', 'winds'], w.winds, ['step']);
    if (winds?.kind === 'step') {
      if (winds.values.some((v) => v < 0 || !Number.isInteger(v))) issue(['windup', 'winds'], 'winds are whole turns, 0 or more');
      // The spring keeps giving out energy while the toy slows: potential falls all the way (docs/31 audit SIM-E-bars).
      const shortest = Math.min(...winds.values.filter((v) => v > 0)) * w.secondsPerTurn;
      if (Number.isFinite(shortest)) {
        const tau = Math.min(w.spinUp, shortest / 2);
        if (w.kinetic > (50 * (shortest - tau)) / shortest)
          issue(['windup', 'kinetic'], `at most ${Math.floor((50 * (shortest - tau)) / shortest)} % for the shortest run (${shortest} s): the stored energy must keep falling`);
      }
    }
    inChains(['windup', 'chains'], w.chains);
  }
  if (e.dynamo) {
    const d = e.dynamo;
    const speed = control(['dynamo', 'speed'], d.speed, ['step']);
    if (speed?.kind === 'step' && speed.values.some((v) => v < 0)) issue(['dynamo', 'speed'], 'speeds are in km/h, 0 or more');
    if (d.on !== undefined) control(['dynamo', 'on'], d.on, ['toggle']);
    // The lamp levels off at its rating, never above it (docs/31 audit SIM-G-limit): imax² R ≤ rated.
    if (d.imax * d.imax * d.lampOhms > d.rated * 1.0001)
      issue(['dynamo', 'imax'], `the lamp would level off at ${(d.imax * d.imax * d.lampOhms).toFixed(2)} W, above its ${d.rated} W rating: imax ≤ ${Math.sqrt(d.rated / d.lampOhms).toFixed(3)} A`);
    inChains(['dynamo', 'chains'], d.chains);
  }
  for (const name of Object.keys(COMPUTED_TABLES))
    if (name in e.shares && e[name as keyof typeof COMPUTED_TABLES]) issue(['shares', name], `"${name}" is worked out by the model (its \`${name}\` data): use another table name`);
  for (const [table, row] of Object.entries(e.shares)) {
    const sum = Object.values(row).reduce((a, b) => a + b, 0);
    if (Math.abs(sum - 100) > 1e-6) issue(['shares', table], `the shares of "${table}" add up to ${sum}, not 100 (a node gives out all it takes in)`);
  }
  const tableKeys = (name: string): readonly string[] | undefined =>
    e.shares[name] ? Object.keys(e.shares[name]!) : name in COMPUTED_TABLES && e[name as keyof typeof COMPUTED_TABLES] ? COMPUTED_TABLES[name as keyof typeof COMPUTED_TABLES] : undefined;
  const condControl = (path: (string | number)[], c: { control: string; is: SimCondition }) => {
    const ctl = controls.get(c.control);
    if (!ctl) issue([...path, 'control'], `unknown control "${c.control}"`);
    else if (c.is !== true && ('eq' in c.is || 'ne' in c.is)) {
      const v = 'eq' in c.is ? c.is.eq : c.is.ne;
      if (!legalValue(ctl, v)) issue([...path, 'is'], `${JSON.stringify(v)} is not a value of "${c.control}"`);
    }
  };
  for (const [cid, chain] of Object.entries(e.chains)) {
    const at = ['chains', cid];
    const nodes = new Map(chain.nodes.map((n) => [n.id, n]));
    chain.nodes.forEach((n, k) => {
      if (chain.nodes.findIndex((x) => x.id === n.id) !== k) issue([...at, 'nodes', k, 'id'], `duplicate node "${n.id}"`);
      if (n.part === undefined && n.label === undefined) issue([...at, 'nodes', k], 'give the node a `part` or a `label`');
      if (n.part !== undefined && !ctx.parts.has(n.part)) issue([...at, 'nodes', k, 'part'], `unknown part "${n.part}"`);
      if (n.sink && chain.links.some((l) => l.from === n.id)) issue([...at, 'nodes', k, 'sink'], `"${n.id}" is a sink: nothing leaves it`);
    });
    chain.links.forEach((l, k) => {
      const lat = [...at, 'links', k];
      if (chain.links.findIndex((x) => x.id === l.id) !== k) issue([...lat, 'id'], `duplicate link "${l.id}"`);
      for (const end of ['from', 'to'] as const) if (!nodes.has(l[end])) issue([...lat, end], `unknown node "${l[end]}"`);
      if (l.from === l.to) issue([...lat, 'to'], 'a link joins two different nodes');
      if (l.share !== 'in') {
        const [table, key] = l.share.split('.') as [string, string];
        const keys = tableKeys(table);
        if (!keys) issue([...lat, 'share'], `unknown share table "${table}"`);
        else if (!keys.includes(key)) issue([...lat, 'share'], `"${table}" has no share "${key}" (${keys.join(', ')})`);
      }
      if (l.form === 'potential' && (l.paths ?? []).length > 0) issue([...lat, 'paths'], 'potential energy is stored, not a stream: no flow paths');
      for (const ref of l.paths ?? []) {
        const [flowId, pathId] = ref.split(':') as [string, string];
        const flow = ctx.flows.get(flowId);
        if (!flow) issue([...lat, 'paths'], `unknown flow "${flowId}"`);
        else if (!flow.paths?.some((p) => p.id === pathId)) issue([...lat, 'paths'], `flow "${flowId}" has no path "${pathId}"`);
      }
      if (l.when) condControl([...lat, 'when'], l.when);
    });
    (chain.when ?? []).forEach((c, k) => condControl([...at, 'when', k], c));
    const order = chainOrder(chain);
    if (!order) issue([...at, 'links'], 'the links go round in a loop: energy moves on from node to node');
    if (chain.start !== undefined && typeof chain.start !== 'number')
      covers([...at, 'start', 'values'], control([...at, 'start', 'control'], chain.start.control, ['choice']), chain.start.values, 'start value');
    if (chain.reading) {
      for (const id of [chain.reading.node, ...(chain.reading.through ?? [])]) if (!nodes.has(id)) issue([...at, 'reading'], `unknown node "${id}"`);
    }
    for (const id of chain.mix?.chains ?? []) if (!chainIds.has(id)) issue([...at, 'mix', 'chains'], `unknown chain "${id}"`);
    else if (id === cid) issue([...at, 'mix', 'chains'], 'a chain does not mix itself');
    if (!order || out.length > 0) continue;
    // In = out at every node, for every combination of the controls this chain (and its tables) read.
    const read = new Set<string>();
    for (const l of chain.links) if (l.when) read.add(l.when.control);
    for (const c of chain.when ?? []) read.add(c.control);
    if (chain.start !== undefined && typeof chain.start !== 'number') read.add(chain.start.control);
    if (chain.links.some((l) => l.share.startsWith('bounce.')) && e.bounce) read.add(e.bounce.surface);
    const reads = [...read].map((id) => controls.get(id)).filter((c): c is SimControl => c !== undefined);
    const base = Object.fromEntries(sim.controls.map((c) => [c.id, c.default])) as SimValues;
    base[e.chain] = cid;
    let leaks = false;
    for (const values of combinations(reads, base)) {
      if (leaks) break;
      const f = chainFlow(cid, chain, values, shareTables(e, values));
      const into = new Map<string, number>();
      const outOf = new Map<string, number>();
      for (const l of chain.links) {
        into.set(l.to, (into.get(l.to) ?? 0) + (f.exact[l.id] ?? 0));
        outOf.set(l.from, (outOf.get(l.from) ?? 0) + (f.exact[l.id] ?? 0));
      }
      const firsts = new Set(chain.nodes.filter((n) => !chain.links.some((l) => l.to === n.id)).map((n) => n.id));
      for (const n of chain.nodes) {
        if (!chain.links.some((l) => l.from === n.id)) continue;
        const inn = firsts.has(n.id) ? f.start : (into.get(n.id) ?? 0);
        const o = outOf.get(n.id) ?? 0;
        if (Math.abs(inn - o) > 1e-6 * Math.max(1, inn)) {
          const when = reads.map((c) => `${c.id} = ${String(values[c.id])}`).join(', ');
          issue([...at, 'nodes', n.id], `"${n.id}" takes in ${+inn.toFixed(4)} % and gives out ${+o.toFixed(4)} %${when ? ` (${when})` : ''}: energy is not made or lost at a node`);
          leaks = true;
          break;
        }
      }
    }
  }
  return out;
}

/**
 * The life-cycle model's own data (docs/33 §4.2): the temperature and day
 * controls, the stages and `start`, one measured row per temperature that
 * covers exactly the stages that take days (each > 0, the `total` within
 * 5 % of their sum: a mistyped number), groups of consecutive stages, sizes,
 * the emptying controls, the cycle flow's paths and reference temperature,
 * and the card's second ring. The second ring's link is checked against
 * the topic folders by `pnpm validate` (like `<TopicLink>`).
 */
function lifeCycleIssues(lc: LifeCycleData, controls: ReadonlyMap<string, SimControl>, ctx: SimContext): { path: (string | number)[]; message: string }[] {
  const out: { path: (string | number)[]; message: string }[] = [];
  const issue = (path: (string | number)[], message: string) => out.push({ path, message });
  const control = <K extends SimControl['kind']>(path: (string | number)[], id: string, kind: K): Extract<SimControl, { kind: K }> | undefined => {
    const c = controls.get(id);
    if (!c) issue(path, `unknown control "${id}"`);
    else if (c.kind !== kind) issue(path, `"${id}" is a ${c.kind} control, not a ${kind}`);
    return c?.kind === kind ? (c as Extract<SimControl, { kind: K }>) : undefined;
  };
  const ids = lc.stages.map((s) => s.id);
  lc.stages.forEach((s, i) => {
    if (ids.indexOf(s.id) !== i) issue(['stages', i, 'id'], `duplicate stage "${s.id}"`);
    if (s.part !== undefined) {
      if (!ctx.parts.has(s.part)) issue(['stages', i, 'part'], `unknown part "${s.part}"`);
      else if (ctx.contextParts?.has(s.part)) issue(['stages', i, 'part'], `"${s.part}" is a context part (never selected)`);
    }
  });
  const last = lastStage(lc);
  if (ids.includes('adult') && last !== 'adult') issue(['stages'], '"adult" must be the last stage');
  if (!ids.includes(lc.start)) issue(['start'], `unknown stage "${lc.start}" (${ids.join(', ')})`);
  else if (lc.start === last) issue(['start'], `"${lc.start}" is the last stage (the adult): day 0 is a stage that takes days`);
  const timed = timedStages(lc);
  const temp = control(['temp'], lc.temp, 'step');
  const day = control(['day'], lc.day, 'step');
  if (day && day.values.some((v) => v < 0)) issue(['day'], 'days after hatching are 0 or more');
  if (temp) {
    for (const v of temp.values) if (!lc.days[String(v)]) issue(['days'], `no measured row for ${v}${temp.unit ? ` ${temp.unit}` : ''} (a value of "${temp.id}")`);
    for (const k of Object.keys(lc.days)) {
      if (!temp.values.includes(Number(k))) issue(['days', k], `${k} is not a value of "${temp.id}"`);
      else if (String(Number(k)) !== k) issue(['days', k], `write the temperature key as "${Number(k)}" (one row per value)`);
    }
  }
  for (const [k, row] of Object.entries(lc.days)) {
    for (const id of timed) {
      const v = row[id];
      if (v === undefined) issue(['days', k, id], `no days for stage "${id}"`);
      else if (!(v > 0)) issue(['days', k, id], `${v}: a stage lasts more than 0 days`);
    }
    for (const key of Object.keys(row)) {
      if (key === 'total' || timed.includes(key)) continue;
      issue(['days', k, key], ids.includes(key) ? `"${key}" takes no days (${key === last ? 'the last stage, the adult' : `before \`start\` "${lc.start}"`})` : `unknown stage "${key}"`);
    }
    const sum = timed.reduce((s, id) => s + (row[id] ?? 0), 0);
    if (row.total !== undefined) {
      if (!(row.total > 0)) issue(['days', k, 'total'], `${row.total}: the total is more than 0 days`);
      else if (Math.abs(row.total - sum) > 0.05 * sum + Number.EPSILON * Math.max(row.total, sum))
        issue(['days', k, 'total'], `total ${row.total} is more than 5 % from the stages' sum ${+sum.toFixed(4)} (a mistyped number?)`);
    }
  }
  for (const [g, def] of Object.entries(lc.groups ?? {})) {
    const members = groupStages(def);
    if (ids.includes(g)) issue(['groups', g], `"${g}" is also a stage (days:${g} would mean both)`);
    for (const m of members) if (!timed.includes(m)) issue(['groups', g], `"${m}" is not a stage that takes days`);
    const at = members.map((m) => ids.indexOf(m));
    if (at.every((x) => x >= 0) && at.some((x, j) => j > 0 && x !== at[j - 1]! + 1)) issue(['groups', g], 'a group is stages next to each other, in order');
  }
  for (const [name, sz] of Object.entries(lc.size ?? {})) for (const k of Object.keys(sz.values)) if (!ids.includes(k)) issue(['size', name, 'values', k], `unknown stage "${k}"`);
  if (lc.emptying) {
    const every = control(['emptying', 'every'], lc.emptying.every, 'step');
    if (every && every.values.some((v) => v <= 0)) issue(['emptying', 'every'], 'the water is tipped out every so many days: above 0');
    if (lc.emptying.wipe !== undefined) control(['emptying', 'wipe'], lc.emptying.wipe, 'toggle');
  }
  if (lc.rate) {
    if (new Set(lc.rate.paths).size !== lc.rate.paths.length) issue(['rate', 'paths'], 'duplicate path ids');
    const flow = ctx.flows.get(lc.rate.flow);
    if (!flow) issue(['rate', 'flow'], `unknown flow "${lc.rate.flow}"`);
    else if (!flow.paths) issue(['rate', 'flow'], `flow "${lc.rate.flow}" has no \`paths\` (the rate is a speed per path)`);
    else {
      const own = flow.paths.map((p) => p.id);
      for (const p of lc.rate.paths) if (!own.includes(p)) issue(['rate', 'paths'], `flow "${lc.rate.flow}" has no path "${p}"`);
      for (const p of own) if (!lc.rate.paths.includes(p)) issue(['rate', 'paths'], `list path "${p}" of flow "${lc.rate.flow}" too (a path left out stops)`);
    }
    if (temp && !temp.values.includes(lc.rate.reference)) issue(['rate', 'reference'], `${lc.rate.reference} is not a value of "${temp.id}"`);
  }
  const cmp = lc.card?.compare;
  if (cmp) {
    control(['card', 'compare', 'control'], cmp.control, 'toggle');
    const cids = cmp.stages.map((s) => s.id);
    if (new Set(cids).size !== cids.length) issue(['card', 'compare', 'stages'], 'duplicate stage ids');
  }
  return out;
}

/** The magnet model's own data: controls it names, rings, the compass, field states and their lines. */
function magnetIssues(sim: SimData, m: MagnetData, controls: ReadonlyMap<string, SimControl>, ctx: SimContext): { path: (string | number)[]; message: string }[] {
  const out: { path: (string | number)[]; message: string }[] = [];
  const issue = (path: (string | number)[], message: string) => out.push({ path, message });
  const ids = new Set<string>();
  m.magnets.forEach((g, i) => {
    if (ids.has(g.id)) issue(['magnets', i, 'id'], `duplicate magnet "${g.id}"`);
    ids.add(g.id);
    if (Math.hypot(g.north[0] - g.south[0], g.north[1] - g.south[1], g.north[2] - g.south[2]) < 1e-6) issue(['magnets', i, 'south'], 'the two poles are at one point');
    if (g.move && controls.get(g.move.control)?.kind !== 'step') issue(['magnets', i, 'move', 'control'], `"${g.move.control}" is not a step control`);
    if (g.flip) {
      const c = controls.get(g.flip.control);
      if (c?.kind !== 'choice') issue(['magnets', i, 'flip', 'control'], `"${g.flip.control}" is not a choice control`);
      else for (const w of g.flip.when) if (!c.options.some((o) => o.id === w)) issue(['magnets', i, 'flip', 'when'], `unknown option "${w}"`);
    }
    if (g.part !== undefined && !ctx.parts.has(g.part)) issue(['magnets', i, 'part'], `unknown part "${g.part}"`);
    else if (g.part !== undefined && ctx.primitives && !ctx.primitives.has(g.part)) issue(['magnets', i, 'part'], `"${g.part}" has no \`primitive\` (a magnet rides on a primitive part: its centre is the pose's pivot)`);
    if (g.power) {
      if (controls.get(g.power.switch)?.kind !== 'toggle') issue(['magnets', i, 'power', 'switch'], `"${g.power.switch}" is not a toggle`);
      if (g.power.cells !== undefined) {
        const c = controls.get(g.power.cells);
        if (c?.kind !== 'step' || c.values.some((v) => v < 0)) issue(['magnets', i, 'power', 'cells'], `"${g.power.cells}" is not a step control of cell counts`);
      }
    }
  });
  if (m.compass && 'ring' in m.compass) {
    const ring = m.rings?.[m.compass.ring];
    if (!ring) issue(['compass', 'ring'], `unknown ring "${m.compass.ring}"`);
    const c = controls.get(m.compass.control);
    if (c?.kind !== 'step' || (ring && c.values.some((v) => !Number.isInteger(v) || v < 1 || v > ring.count)))
      issue(['compass', 'control'], `"${m.compass.control}" must be a step control of positions 1 … ${ring?.count ?? 'count'}`);
  }
  const wants = (q: string) => sim.outputs.some((o) => (o.from ?? o.id) === q);
  if (wants('needle-bearing') && !m.compass && !sim.bind.some((b) => 'part' in b && b.at !== undefined && b.control !== undefined))
    issue(['compass'], 'needle-bearing needs `compass` (a point, or a ring and its control) or an `at` binding to read it at');
  const fields = Object.entries(m.fields ?? {});
  if (wants('field-state') && fields.length === 0) issue(['fields'], 'a field-state output needs `fields`');
  const labels = sim.outputs.find((o) => (o.from ?? o.id) === 'field-state')?.states;
  fields.forEach(([name, f], k) => {
    for (const id of f.magnets ?? []) if (!ids.has(id)) issue(['fields', name, 'magnets'], `unknown magnet "${id}"`);
    for (const [id, v] of Object.entries(f.when ?? {})) {
      const c = controls.get(id);
      if (!c) issue(['fields', name, 'when', id], `unknown control "${id}"`);
      else if (!legalValue(c, v)) issue(['fields', name, 'when', id], `${JSON.stringify(v)} is not a value of "${id}"`);
    }
    if (f.when === undefined && k < fields.length - 1) issue(['fields', name], 'a state without `when` always holds: put it last');
    if (labels && !(name in labels)) issue(['fields', name], `the field-state output has no label for "${name}"`);
    if (!f.plane && !m.plane) issue(['fields', name, 'plane'], 'give the state a `plane` (or the model a default `plane`) to trace its lines in');
    else if (fieldLines(sim, name).length === 0) issue(['fields', name], 'no field line starts inside the plane (is a north pole in it?)');
  });
  if (labels) for (const name of Object.keys(labels)) if (fields.length > 0 && !m.fields?.[name]) issue(['fields'], `field state "${name}" (an output label) is not in \`fields\``);
  return out;
}

/** The forces model's own data: the controls each sub-model reads, its tables, and what its numbers would do on the bench. */
function forceIssues(f: ForceData, controls: ReadonlyMap<string, SimControl>, ctx: SimContext): { path: (string | number)[]; message: string }[] {
  const out: { path: (string | number)[]; message: string }[] = [];
  const issue = (path: (string | number)[], message: string) => out.push({ path, message });
  const control = (path: (string | number)[], id: string, kinds: readonly SimControl['kind'][]) => {
    const c = controls.get(id);
    if (!c) issue(path, `unknown control "${id}"`);
    else if (!kinds.includes(c.kind)) issue(path, `"${id}" is a ${c.kind} control, not a ${kinds.join(' or ')}`);
    return c;
  };
  const options = (c: SimControl | undefined) => (c?.kind === 'choice' ? c.options.map((o) => o.id) : []);
  /** Every option of choice `c` is a key of `table` (and every key an option). */
  const covers = (path: (string | number)[], c: SimControl | undefined, table: Readonly<Record<string, unknown>>, what: string) => {
    if (c?.kind !== 'choice') return;
    for (const o of options(c)) if (!(o in table)) issue(path, `option "${o}" of "${c.id}" has no ${what}`);
    for (const k of Object.keys(table)) if (!options(c).includes(k)) issue(path, `"${k}" is not an option of "${c.id}"`);
  };
  if (f.push) {
    const p = f.push;
    covers(['push', 'dv'], control(['push', 'choice'], p.choice, ['choice']), p.dv, 'Δv');
    if (p.start !== undefined) {
      const c = control(['push', 'start'], p.start, ['choice', 'toggle']);
      if (c?.kind === 'choice' && !['rest', 'moving'].every((o) => options(c).includes(o))) issue(['push', 'start'], `"${p.start}" needs the options "rest" and "moving"`);
    }
    if ((p.rolling === undefined) === (p.surface === undefined)) issue(['push'], 'give `rolling` (a coefficient) or `surface` (an option of `roll.rolling`)');
    if (p.surface !== undefined && f.roll?.rolling[p.surface] === undefined) issue(['push', 'surface'], `"${p.surface}" is not a surface of \`roll.rolling\``);
    if (p.at >= p.runway) issue(['push', 'at'], 'the push point must be before the end of the runway');
  }
  if (f.magnet) {
    control(['magnet', 'toggle'], f.magnet.toggle, ['toggle']);
    if (!f.push) issue(['magnet'], 'the magnet push needs `push` (the car and the runway)');
  }
  if (f.fall) {
    const fl = f.fall;
    const h = control(['fall', 'height'], fl.height, ['step']);
    if (h?.kind === 'step' && h.values.some((v) => v <= 0)) issue(['fall', 'height'], 'drop heights are in metres, above 0');
    covers(['fall', 'pairs'], control(['fall', 'pair'], fl.pair, ['choice']), fl.pairs, 'pair of objects');
    for (const [k, pair] of Object.entries(fl.pairs)) for (const id of pair) if (!fl.objects[id]) issue(['fall', 'pairs', k], `unknown object "${id}"`);
    for (const [id, o] of Object.entries(fl.objects)) {
      if (!ctx.parts.has(o.part)) issue(['fall', 'objects', id, 'part'], `unknown part "${o.part}"`);
      else if (ctx.primitives && !ctx.primitives.has(o.part)) issue(['fall', 'objects', id, 'part'], `"${o.part}" has no \`primitive\``);
    }
    if (fl.weigh) {
      const c = control(['fall', 'weigh', 'control'], fl.weigh.control, ['choice']);
      for (const [opt, id] of Object.entries(fl.weigh.map)) {
        if (c?.kind === 'choice' && !options(c).includes(opt)) issue(['fall', 'weigh', 'map', opt], `"${opt}" is not an option of "${c.id}"`);
        if (!fl.objects[id]) issue(['fall', 'weigh', 'map', opt], `unknown object "${id}"`);
      }
    }
  }
  if (f.slide) {
    const sl = f.slide;
    const load = control(['slide', 'load'], sl.load, ['step']);
    if (load?.kind === 'step' && load.values.some((v) => v < 0)) issue(['slide', 'load'], 'loads are in grams, 0 or more');
    covers(['slide', 'surfaces'], control(['slide', 'lane'], sl.lane, ['choice']), sl.surfaces, 'friction coefficients');
    for (const [k, [st, mv]] of Object.entries(sl.surfaces)) if (mv > st) issue(['slide', 'surfaces', k], `μ moving (${mv}) is above μ starting (${st}): getting a block moving takes more than keeping it moving`);
  }
  if (f.roll) {
    const r = f.roll;
    const h = control(['roll', 'height'], r.height, ['step']);
    const surf = control(['roll', 'surface'], r.surface, ['choice']);
    covers(['roll', 'rolling'], surf, r.rolling, 'rolling coefficient');
    // At the defaults the car must stop on the runway (docs/30 §4.2 item 4).
    if (h?.kind === 'step' && surf?.kind === 'choice') {
      const c = r.rolling[String(surf.default)];
      if (c !== undefined && rollRun(r, f.g, h.default, c, '').end === 'off-end') issue(['roll'], `at the defaults (${h.default} cm, ${surf.default}) the car runs off the end of the runway`);
      if (h.values.some((v) => v <= 0)) issue(['roll', 'height'], 'release heights are in cm, above 0');
    }
  }
  if (f.spring) {
    const sp = f.spring;
    const load = control(['spring', 'load'], sp.load, ['step']);
    if (sp.unload !== undefined) control(['spring', 'unload'], sp.unload, ['toggle']);
    if (load?.kind === 'step') {
      if (!load.values.includes(sp.limit)) issue(['spring', 'limit'], `the elastic limit ${sp.limit} g is not a value of "${sp.load}"`);
      for (const v of load.values) if (v > sp.limit && sp.unload !== undefined && sp.set[String(v)] === undefined) issue(['spring', 'set'], `give the set left after ${v} g (above the limit)`);
      for (const k of Object.keys(sp.set)) {
        if (Number(k) <= sp.limit) issue(['spring', 'set', k], `${k} g is not above the elastic limit (${sp.limit} g)`);
        else if (!load.values.includes(Number(k))) issue(['spring', 'set', k], `${k} g is not a value of "${sp.load}"`);
        else if (sp.set[k]! >= springExtension(sp, Number(k), false)) issue(['spring', 'set', k], 'the set left after unloading must be less than the stretch under the load');
      }
    }
  }
  if (f.brake) covers(['brake', 'force'], control(['brake', 'squeeze'], f.brake.squeeze, ['choice']), f.brake.force, 'pad force');
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
  const byId = new Map(sim.outputs.map((o) => [o.id, o]));
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
    for (const id of t.observe) {
      if (!outputs.has(id)) out.push(`${where}sim.try.observe: unknown output "${id}"`);
      else if (byId.get(id)!.kind === 'timeline') out.push(`${where}sim.try.observe: "${id}" is a timeline (it plays on the stage; observe its numbers)`);
    }
    const rec = t.record && t.record !== true ? t.record : null;
    if (rec?.judge && !outputs.has(rec.judge.output)) out.push(`${where}sim.try.record.judge: unknown output "${rec.judge.output}"`);
    if (rec?.chart) {
      const ys = rec.chart === true ? t.observe.filter((id) => byId.get(id)?.kind === 'number').slice(0, 1) : Array.isArray(rec.chart.y) ? rec.chart.y : [rec.chart.y];
      if (ys.length === 0) out.push(`${where}sim.try.record.chart: the card observes no number to draw (give \`y\`)`);
      for (const id of ys) {
        const o = byId.get(id);
        if (!o) out.push(`${where}sim.try.record.chart.y: unknown output "${id}"`);
        else if (o.kind !== 'number') out.push(`${where}sim.try.record.chart.y: "${id}" is a ${o.kind}, not a number`);
      }
      const units = new Set(ys.map((id) => byId.get(id)?.unit ?? ''));
      if (units.size > 1) out.push(`${where}sim.try.record.chart.y: one graph, one unit (${[...units].join(', ')})`);
    }
    if (Array.isArray(t.replay))
      for (const id of t.replay) if (byId.get(id)?.kind !== 'timeline') out.push(`${where}sim.try.replay: "${id}" is not a timeline output`);
    if (t.replay === true && !sim.outputs.some((o) => o.kind === 'timeline')) out.push(`${where}sim.try.replay: the sim has no timeline output to run again`);
    if (t.predict) {
      values('try.predict.change', t.predict.change);
      if (t.predict.start) values('try.predict.start', t.predict.start);
      const o = byId.get(t.predict.observe);
      if (!o) out.push(`${where}sim.try.predict.observe: unknown output "${t.predict.observe}"`);
      else if (o.kind === 'state') {
        for (const opt of t.predict.options) if (!o.states?.[opt.means]) out.push(`${where}sim.try.predict.options: "${opt.means}" is not a state of "${o.id}"`);
      } else if (o.kind === 'number') {
        for (const opt of t.predict.options)
          if (!(PREDICT_MEANS as readonly string[]).includes(opt.means)) out.push(`${where}sim.try.predict.options: "${opt.means}" is not an outcome (${PREDICT_MEANS.join(', ')})`);
      } else out.push(`${where}sim.try.predict.observe: "${o.id}" is a ${o.kind} (predict a number or a state)`);
    }
  }
  return out;
}
