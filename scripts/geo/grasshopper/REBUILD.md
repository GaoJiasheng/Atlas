# Insect relief build and review

The entry points are `pnpm tsx scripts/geo/grasshopper/rebuild.mjs` and
`pnpm tsx scripts/geo/mosquito/rebuild.mjs`. Each reads its topic-local
`source-parts.json`, preserves the original teaching metadata, and publishes a
meshopt GLB and the topic `parts.json`. `source-parts.json` is the pre-rebuild
input and baseline, not a runtime asset. The older mosquito `build-parts.ts`
remains the historical source generator; rerunning it alone replaces the polish.
If its content changes in future, refresh the snapshot before the relief build.

The new kit `scripts/geo/kits/insect-relief.mjs` owns only these two topics.
It does not modify any existing shared kit or renderer. Vertex pigment bands
share the tarsomere surface; they do not form overlapping white tube sleeves.
The wing's COLOR_0 alpha keeps veins opaque while the membrane is translucent.
The engine's existing `atlasSurface` opt-in is used, with no engine patch.

Run the decoded geometry audit after either build:

```
pnpm tsx scripts/geo/grasshopper/audit-rebuild.mjs
pnpm tsx scripts/geo/grasshopper/studio-preview.mjs grasshopper final
pnpm tsx scripts/geo/grasshopper/studio-preview.mjs mosquito final
```

`studio-preview.mjs` reuses the existing fossil CPU studio lighting / sampled
RoomEnvironment / GGX / ACES implementation. It reads the actual compressed GLB,
source-material opt-in, vertex colours including alpha, actual material-family
resolution, primitive geometry, and expanded bilateral nodes. It is a numerical
studio study, not a GPU screenshot; procedural micro-normal maps, GPU shadows
and transparent-fragment sorting can differ. `before`, `round1`, `round2`,
`round3` and `final` record the iteration sequence. References are development
files in each ignored `refs/` directory, never runtime textures or downloads.

The worktree's node_modules is a read-only symlink. The Astro gate wrapper here
only redirects caches to /private/tmp; it inherits the root config. Vitest uses
the root config directly. Use:

```
pnpm exec astro check --config scripts/geo/grasshopper/astro-gates.config.mjs
pnpm exec tsc --noEmit
pnpm validate
pnpm exec vitest run --maxWorkers 2 --testTimeout 60000
pnpm run build --config scripts/geo/grasshopper/astro-gates.config.mjs
```

The test timeout accommodates existing CPU-heavy sculpt audits under shared
machine load. No browser or desktop automation is involved in these commands.
