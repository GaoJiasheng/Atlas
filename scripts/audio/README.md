# Recorded narration: pipeline and generator contract

VOICE in the presentation plays pre-generated neural-voice clips when they exist and falls back to the device's speech
synthesis otherwise (docs/06 语音, docs/02 the one runtime-download exception). This folder holds the build side. The
generator (a separate Python job using edge-tts) is not here; this file is its contract.

```
pnpm tsx scripts/audio/extract.ts      # 1. content → audio/manifest.json (published topics; --all adds drafts, --topic <slug> picks)
<generator>                            # 2. manifest → audio/narration/<locale>/<hash>.mp3 (skips files that exist)
pnpm tsx scripts/audio/check.ts        # 3. coverage: present / missing / stale, manifest current? (never fails)
pnpm build && pnpm tsx scripts/audio/stage.ts \
  && pnpm dlx wrangler@4.148.0 pages deploy dist-pages --project-name atlas --branch main   # 4. deploy with audio
```

`audio/` (override with `ATLAS_AUDIO_DIR`) and `dist-pages/` are gitignored. Clips never go into git, into `public/`
or into `dist/`, so `pnpm ios:sync` (`pnpm build && npx cap sync ios`, which copies `dist/`) cannot bundle them; the
staging script refuses to run if `dist/narration` exists.

## Manifest (`audio/manifest.json`)

Written by `extract.ts`, deterministic (same content, same bytes; no timestamps). The text is produced by the runtime's
own functions (`buildBeats`, each engine's `beatsOf` / `captionOf`, `chapterAnnouncement`, `narrationParts`), so it is
exactly what the page speaks: markup and source superscripts removed, MathScene notation read as words.

```jsonc
{
  "version": 1,
  "format": "audio-24khz-48kbitrate-mono-mp3",
  "voices": {
    "en": { "voice": "en-GB-SoniaNeural", "rate": "-10%", "lang": "en-GB" },
    "zh": { "voice": "zh-CN-XiaoxiaoNeural", "rate": "-8%", "lang": "zh-CN" }
  },
  // One per distinct clip file: what the generator iterates. The same words in two places (e.g. "Chapter one" in
  // every topic) are one clip.
  "clips": [
    {
      "hash": "1f0c4e9a7d2b3c51",                 // 16 hex digits
      "locale": "en",
      "voice": "en-GB-SoniaNeural",
      "rate": "-10%",
      "file": "narration/en/1f0c4e9a7d2b3c51.mp3",  // relative to the audio folder (and to the site root)
      "text": "Chapter one",                        // speak exactly this, unmodified
      "chars": 11
    }
  ],
  // One per (topic, locale, kind, chapter, beat): which clip each place says. kind: chapter (number in words, or
  // "Background" / "背景"), title (chapter title), caption (a beat; beat = its index in the chapter, 0-based).
  "entries": [
    { "key": "fractions/en/chapter/equal-parts", "topic": "fractions", "locale": "en", "kind": "chapter", "chapter": "equal-parts", "beat": null, "hash": "1f0c4e9a7d2b3c51" },
    { "key": "fractions/en/caption/equal-parts/0", "topic": "fractions", "locale": "en", "kind": "caption", "chapter": "equal-parts", "beat": 0, "hash": "…" }
  ]
}
```

The hash is FNV-1a 64 of `format|voice|rate|text` (`src/lib/narration-clips.ts`): edit a caption, change a voice or
a rate, and its clip gets a new name. The old file is then stale (the check lists it) and the page speaks the new text
with the device voice until the new clip exists. The generator never computes hashes; it only uses `file`.

## Generator contract

- Input: `audio/manifest.json` (`ATLAS_AUDIO_DIR` if set). Iterate `clips`.
- **Skip every clip whose `file` already exists** (non-empty) under the audio folder. A run only fills in what is
  missing, so re-running after a content change regenerates just the edited captions.
- Voice and rate per clip from its `voice` / `rate` fields: EN `en-GB-SoniaNeural` at `-10%`, ZH
  `zh-CN-XiaoxiaoNeural` at `-8%`. Pitch and volume default. Speak `text` as given (no SSML, no added pauses: the page
  puts ~350 ms between chapter number, title and caption itself).
- Output format: edge-tts's native `audio-24khz-48kbitrate-mono-mp3`, written as-is to `<audio folder>/<file>` (create
  the `narration/<locale>/` folders). No re-encoding: MP3 plays in WKWebView (iPad app), Safari, Chrome and
  Playwright's Chromium (which has no AAC), and edge-tts already emits 24 kHz mono 48 kbps.
- Write each file atomically (to a temporary name in the same folder, then rename), so an interrupted run never leaves
  a truncated clip that a later run would skip.
- Do not delete anything; stale clips are reported by `check.ts` and can be removed by hand.
- Expected size: the published topics (2026-11-22) are 3,269 EN clips (350k characters) and 3,271 ZH clips (111k
  characters), roughly 6,500 files and 300 MB.

## What the site serves

`stage.ts` builds `dist-pages/` from `dist/` (hard links) plus:

- `narration/<locale>/<hash>.mp3`: every manifest clip present in the audio folder (for all topics, drafts included).
- `narration/<slug>.json`: per topic, `{ "version": 1, "en": [hash…], "zh": [hash…] }`, the clips of its *current*
  text that exist. Written for every topic with a presentation (empty lists without audio), so the page never probes
  for missing files.

It lists every published part (topic/locale/kind/chapter/beat) whose current text has no clip, i.e. a caption edited
since the last generation that the device voice now reads; that is a reminder, not a failure.

It fails when the upload would break a Cloudflare Pages limit (20,000 files per deployment, 25 MiB per file). The
published topics come to about 1,054 site files + 6,540 clips + ~104 indexes ≈ 7,700 files. If a future catalogue
outgrows 20,000, move the clips (not the indexes) to an R2 bucket on a custom subdomain (e.g. `audio.gavin.pub`,
never `r2.dev`), point `NARRATION_ORIGIN` / the web URL at it, add that origin to the app's CSP `connect-src`, and
give the bucket the same CORS and immutable caching headers as `public/_headers` gives `/narration/*` today.

`public/_headers` serves `/narration/*` with `Access-Control-Allow-Origin: *` (the iPad app fetches from
`capacitor://localhost`), clips `immutable` for a year (the name is the content), indexes `max-age=0,
must-revalidate`. The service worker neither precaches nor caches narration (`globIgnores` in astro.config.mjs).
