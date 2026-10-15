# Magnets content validation — 2026-10-15

The requested scaffold command was attempted with exactly the requested flags. `pnpm tsx` failed before running the script because the sandbox rejects its IPC listener (`listen EPERM .../tsx-501/*.pipe`). Running the same script with `node --import tsx scripts/new-topic.ts magnets --engine space-scene --subject science --title-en "Magnets" --title-zh "磁"` succeeded.

`pnpm validate` encounters the same launcher restriction. Its exact validation entry point, `node --import tsx scripts/validate-content.ts`, completed: **20 topics, 16 errors, 0 warnings**. All reported errors are the pending magnet simulation and rendering extensions below. No engine code was edited to suppress them.

| Actual path in parts.json | Remaining engine requirement |
|---|---|
| `parts[34].primitive.kind` | Add the `filings` primitive and its state-keyed instance transforms. |
| `flows[0].paths` | Support the spec's 24 field paths; the circuit-era maximum is 16. |
| `flows[0].states` | Add state-keyed field-line paths. |
| `sim.outputs[5].states.ns-1.5`, `.nn-1.5` | Permit the exact decimal-gap state names required by the spec. |
| `sim.bind[2].rotate` | Add `settle: {period: 1.2, damping: 0.3}`; §4.3 does not require the old `per`. |
| `sim.bind[3].at` | Add the named `compass-ring` placement binding. |
| `sim.bind[4,5,10,11,12].count` | Accept §4.3 `count: true`; old schema requires an object. |
| `sim.bind[6].state`, `sim.bind[7].state` | Add state selection for `field-lines` and `iron-filings`. |
| `sim.magnet.earth`, `.rings` | Add the chosen Earth background and compass-ring geometry. |
| `sim.overlays` | Add the `force-arrows` overlay. |

Additional integration requirements currently masked by the structural schema failures:

- `gap.values` deliberately remains `[6, 3, 1.5]` as §4.3 requires; existing cross-validation requires ascending steps.
- Register numeric `needle-bearing` and state `field-state` quantities in the magnet evaluator.
- §3.3 specifies the stroking clips as extras of `steel-rod`. Its `clips-stroke` count binding must preserve the needle and count its clip extras. The old count implementation requires a repeated part without extras. This needs an engine-side interpretation or a revised agreed contract; duplicating the needle or counting the whole part would be wrong. The other count-bound parts have plain repeat geometry.
- The exact eight controls contain no pattern-mode selector. Choosing `single`, `horseshoe` and `em-off` independently of pole/gap controls needs the engine's chapter/visibility context or an agreed additional selector. The data supplies all twelve named states and does not invent a control name absent from §4.3.
- Add the `pole-n` / `pole-s` tokens in both themes. Coil and wood already exist in the checked-out schema and are used with their established field shapes (`length`, not the draft `pitch`).

An **audit projection in a temporary directory** replaced only the pending features with supported equivalents (filings → plane; stateful paths → first 16 paths; removed new outputs/bindings; converted count booleans; removed the unsupported stroking-extra binding; sorted gap values). It retained the actual chapter bodies, all ordinary geometry, sources, glossary, IDs, poses, cameras, figures and indexes. The same validator then reported **20 topics, 0 errors, 0 warnings**. This checks established authoring fields; it does not mean the actual topic or future engine extension passes. A separate reference audit of the unmodified sim controls, sets, outputs and binding targets found no missing references.

Static content inventory: 35 selectable parts plus 3 context objects; 6 presets; 6 chapters; 33 beats; 6 try cards; record tables in chapters 03–05; 5 distinct figures; 15 glossary terms; 24 sources. English main bodies contain 219–255 words; Chinese main bodies contain 360–368 Chinese characters. Every literal or written quantity in chapter prose is in `Num`; glossary terms appear once in each language. The numerical tables match S1.

No build, test, e2e or shoot command was run. No claim of visual, runtime or performance acceptance is made.
