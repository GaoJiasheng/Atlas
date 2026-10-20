/** docs/35 §4.3 author template, using the complete §4.4-safe control envelope.
 * The printed spec's a=10,b=60 corner cannot fit the stated 60 × 45 cm screen.
 */
import {
  simSchema,
  type SimData,
} from "../../../src/engines/space-scene/sim-schema";
const label = (en: string) => ({ en, zh: `夹具：${en}` });
const shapes = {
  "card-circle": {
    shape: { kind: "disc", d: 8, thick: 0.2 },
    names: ["circle", "oval", "thin-strip"],
  },
  "card-square": {
    shape: {
      kind: "polygon",
      points: [
        [-4, -4],
        [4, -4],
        [4, 4],
        [-4, 4],
      ],
      thick: 0.2,
    },
    names: ["square", "four-sided", "thin-strip"],
  },
  "card-triangle": {
    shape: {
      kind: "polygon",
      points: [
        [-4.619, -2.667],
        [4.619, -2.667],
        [0, 5.333],
      ],
      thick: 0.2,
    },
    names: ["triangle", "triangle", "thin-strip"],
  },
  "card-circle-big": {
    shape: { kind: "disc", d: 12, thick: 0.2 },
    names: ["circle", "oval", "thin-strip"],
  },
  tin: {
    shape: { kind: "cylinder", d: 6.6, length: 12, axis: "z" },
    names: ["rectangle", "round-ends", "circle"],
  },
  cone: {
    shape: { kind: "cone", d: 8, length: 10, axis: "z", apex: "+" },
    names: ["triangle", "round-end", "circle"],
  },
  ball: {
    shape: { kind: "sphere", d: 6.5 },
    names: ["circle", "circle", "circle"],
  },
};
const choice = (id: string, opts: string[], value = opts[0]) => ({
  id,
  kind: "choice",
  options: opts.map((id) => ({ id, label: label(id) })),
  default: value,
  label: label(id),
});
const step = (id: string, values: number[], value: number, unit: string) => ({
  id,
  kind: "step",
  values,
  default: value,
  unit,
  label: label(id),
});
const state = (id: string, from: string, states: string[]) => ({
  id,
  from,
  kind: "state",
  label: label(id),
  states: Object.fromEntries(states.map((id) => [id, label(id)])),
});
const num = (id: string, from: string, unit?: string) => ({
  id,
  from,
  label: label(id),
  unit,
});
export const lightSim: SimData = simSchema.parse({
  kind: "light",
  controls: [
    step("d-torch", [20, 30, 40, 60], 20, "cm"),
    step("d-screen", [10, 20, 30, 40], 30, "cm"),
    {
      ...choice("object", ["none", ...Object.keys(shapes)], "card-circle"),
      sets: Object.fromEntries(
        Object.keys(shapes).map((id) => [id, { material: "none" }]),
      ),
    },
    step("turn", [0, 45, 90], 0, "°"),
    {
      ...choice("material", [
        "none",
        "clear-glass",
        "frosted-glass",
        "tracing-paper",
        "cardboard",
      ]),
      sets: Object.fromEntries(
        ["clear-glass", "frosted-glass", "tracing-paper", "cardboard"].map(
          (id) => [id, { object: "none" }],
        ),
      ),
    },
    choice("middle", ["in-line", "moved"]),
    { id: "torch-on", kind: "toggle", default: true, label: label("Torch") },
    {
      id: "box-torch",
      kind: "toggle",
      default: true,
      label: label("Box torch"),
    },
    choice("in-box", ["ball", "mirror"]),
    {
      ...step("time", [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18], 10, "h"),
      format: "time",
    },
    choice("date", ["oct-20", "jun-21", "mar-24"]),
  ],
  outputs: [
    num("shadow-height", "shadow:height", "cm"),
    num("shadow-width", "shadow:width", "cm"),
    state("shadow-shape", "shadow:shape", [
      "none",
      "circle",
      "oval",
      "square",
      "four-sided",
      "triangle",
      "thin-strip",
      "rectangle",
      "round-ends",
      "round-end",
    ]),
    num("gap-torch", "control:d-torch", "cm"),
    num("gap-screen", "control:d-screen", "cm"),
    num("light-behind", "sheet:light", "%"),
    state("shadow-kind", "sheet:kind", ["none", "hardly", "lighter", "dark"]),
    num("sheet-dark", "sheet:dark"),
    state("dot", "holes:dot", ["yes", "no"]),
    state("eye", "seeing:eye", ["none", "some", "bright"]),
    num("box-dark", "seeing:dark"),
    num("torch-lit", "control:torch-on"),
    num("box-lit", "control:box-torch"),
    num("sun-height", "sun:height", "°"),
    num("shadow-length", "sun:length", "m"),
    state("shadow-points", "sun:points", [
      "north",
      "north-east",
      "east",
      "south-east",
      "south",
      "south-west",
      "west",
      "north-west",
    ]),
    { ...num("noon", "sun:noon", "h"), format: "time" },
    num("noon-length", "sun:noon-length", "m"),
    { ...num("time-now", "control:time", "h"), format: "time" },
    { id: "sun-at", from: "sun:at", kind: "vector", label: label("Sun") },
  ],
  light: {
    bench: {
      source: { part: "torch", point: [0, 1, 0.05], axis: [1, 0, 0], beam: 40 },
      power: "torch-on",
      gaps: { torch: "d-torch", screen: "d-screen" },
      holder: [0, 1, 0.05],
      screen: { part: "screen-board", size: [60, 45] },
      object: "object",
      turn: "turn",
      objects: Object.fromEntries(
        Object.entries(shapes).map(([id, o]) => [
          id,
          {
            part: id,
            shape: o.shape,
            names: Object.fromEntries(
              [0, 45, 90].map((turn, i) => [turn, o.names[i]]),
            ),
          },
        ]),
      ),
    },
    sheets: {
      control: "material",
      size: [10, 10],
      kinds: { hardly: 85, dark: 5 },
      materials: {
        "clear-glass": { part: "clear-glass", straight: 0.91, scattered: 0 },
        "frosted-glass": {
          part: "frosted-glass",
          straight: 0,
          scattered: 0.83,
        },
        "tracing-paper": {
          part: "tracing-paper",
          straight: 0,
          scattered: 0.65,
        },
        cardboard: { part: "cardboard-sheet", straight: 0, scattered: 0 },
      },
    },
    holes: {
      control: "middle",
      hole: 1.2,
      cards: [
        { part: "hole-card-1", at: -10 },
        { part: "hole-card-2", at: 0, moved: 2 },
        { part: "hole-card-3", at: 10 },
      ],
    },
    seeing: {
      torch: "box-torch",
      target: "in-box",
      reflects: { ball: "some", mirror: "bright" },
    },
    sun: {
      lat: 1.3,
      lon: 103.8,
      zone: 8,
      time: "time",
      date: "date",
      dates: {
        "oct-20": "2026-10-20",
        "jun-21": "2026-06-21",
        "mar-24": "2026-03-24",
      },
      pole: 1,
      north: [0, 0, -1],
    },
  },
});
export const LIGHT_PARTS = [
  "torch",
  "screen-board",
  ...Object.keys(shapes),
  "clear-glass",
  "frosted-glass",
  "tracing-paper",
  "cardboard-sheet",
  "hole-card-1",
  "hole-card-2",
  "hole-card-3",
];
