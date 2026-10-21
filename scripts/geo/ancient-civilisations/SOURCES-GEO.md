# Ancient Civilisations map data — source survey and per-keyframe provenance

Every edge in `src/content/topics/ancient-civilisations/data/control.json` comes from a dataset below; nothing is drawn by hand. Reference ids `[G#]` are the same as in the topic's `data/SOURCES.md`. Commands: `pnpm tsx scripts/geo/lib/<step>.ts --topic ancient-civilisations` (skill atlas-history-topic, references/geo-runbook.md).

## 1. Survey

Per dataset or map: URL, citation, **exact licence** (quoted from its page), coverage, limits for this topic, what it is used for.

## 2. Keyframes

Per keyframe: date, recipe (base + steps), sources, georeferencing model and control-point residuals (RMS / max, km), the side-by-side check image, known simplifications.

## 3. Licences

Attribution and share-alike obligations of each source used in the published data.
