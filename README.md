# Atlas

A bilingual (EN/ZH) interactive textbook for a Singapore primary school student: time-evolution scenes (WWII, plate tectonics) and space-exploration scenes (how an air conditioner works).

Design docs live in [docs/](docs/README.md). Phase 1 (foundation) is in place: Astro 5 static site, bilingual routes, two themes, content collections, the Scene contract and shared widgets, with stub engines and two placeholder topics. See [docs/06-dev-guide.md](docs/06-dev-guide.md).

```bash
pnpm install
pnpm dev        # http://localhost:4321/
pnpm check      # astro check + tsc
pnpm validate   # content validator
pnpm test       # vitest
pnpm build      # validate + static build to dist/ (ATLAS_BASE=/sub/path to change base)
```
