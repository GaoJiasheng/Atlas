# Sample climate engine QA — 2026-10-27

Implementation and authored JSON examples: `docs/06-dev-guide.md`, monthly TimeScene section. Contract and deviations: `docs/50-monsoon-and-weather-content-spec.md` §9.1. This is a draft engine fixture, not the final monsoon topic.

## Gates

| Gate | Result |
|---|---|
| pnpm check | Pass: 0 errors, 0 warnings, 3 pre-existing unused-variable hints |
| pnpm validate | Pass: 56 topics, 0 errors, 0 warnings |
| pnpm test | Pass: 161 files, 4,226 tests |
| pnpm build | Pass: 115 static pages |
| git diff --check | Pass |
| pnpm shoot sample-climate --beats --keys --layout | Blocked before browser assertions |
| CI=1 ATLAS_E2E_PORT=5403 pnpm e2e | 349 attempted tests blocked at Chromium launch; no page assertions reached |

The repeated browser failure is macOS `bootstrap_check_in … MachPortRendezvousServer: Permission denied (1100)`. Access to the existing Google Chrome app was also rejected by automatic approval review; no further reason was supplied. No screenshots were produced or visually inspected. No browser/iPad latency, layout, offline or GPU performance is claimed.

## Requested regression comparison

| Topic | Before | After | New application failures |
|---|---|---|---|
| singapore-land-use | Chromium launch blocked | Chromium launch blocked | Not measurable |
| ww2 | Chromium launch blocked | Chromium launch blocked | Not measurable |
| four-taps | Chromium launch blocked | Chromium launch blocked | Not measurable |
| ancient-civilisations | Chromium launch blocked | Chromium launch blocked | Not measurable |

Each attempt used `pnpm shoot <topic> --beats --keys`. Logs are in `/private/tmp/climate-before-<topic>.log` and `/private/tmp/climate-after-<topic>.log`.

## Build-time size evidence

Static import graph seeded by sample-climate HTML plus its selected monthly view/controller dynamic imports; gzip -9, no browser request measurement.

- Static monthly page dependency graph: **458,132 bytes gzip -9 (447.39 KiB)**. This exceeds the 400 KB target; it is a build-time graph estimate, not a browser network measurement.
- Monthly view/controller entry chunks: 15,358 bytes gzip -9; shared dependencies are listed below.
- Vite gzip totals across all client JS: baseline 1027.86 kB → final 1045.24 kB; **increment 17.38 kB**, within the 35 KB added-code allowance. Shared-chunk repartitioning is included.
- Real source arrays: 171,071 uncompressed bytes; artificial edge-case arrays: 2,693 bytes. Both real grids and original frame values are retained.
- First-screen total JS, full heap/cache size and browser month-commit p95 are not passed gates. The latter two require an available browser.

| Static dependency | Bytes | gzip -9 bytes |
|---|---:|---:|
| `_astro/SceneHost.DPY9wBkk.js` | 159 | 137 |
| `_astro/SceneHost.CyHULL6P.js` | 74,717 | 25,962 |
| `_astro/GlobalToggles.DfGwEcpW.js` | 98,955 | 32,081 |
| `_astro/index.C3rmuWrx.js` | 8,332 | 3,229 |
| `_astro/index.BTDmyNhY.js` | 4,209 | 1,568 |
| `_astro/client.1QeOYOsc.js` | 207,314 | 64,512 |
| `_astro/index.Bb8JjhAW.js` | 3,851 | 1,718 |
| `_astro/ClimatologyView.zxHDtysz.js` | 25,369 | 9,702 |
| `_astro/sources.CKA2F6W8.js` | 59,099 | 14,330 |
| `_astro/ControlPanel.D8koH-HC.js` | 20,567 | 7,464 |
| `_astro/climatologyController.B0HJmVvF.js` | 13,104 | 5,656 |
| `_astro/style.kGbY4U_2.js` | 1,071,476 | 288,692 |
| `_astro/localLand.CG6SDVuK.js` | 7,034 | 3,081 |

## Source output fingerprints

| File | Bytes | SHA-256 |
|---|---:|---|
| `public/geo/sample-climate-fixture-rain.json` | 1,252 | `1403a1b800f984917299fa2a71eb9667c9b68b09c6b7fbe19b423cca219ffc0e` |
| `public/geo/sample-climate-fixture-wind.json` | 1,441 | `e0746561dc7c788d2fd0162c533e1be4b07ec095fcc718b05087daf4ac59d066` |
| `public/geo/sample-climate-rain-gpcp-1991-2020.json` | 55,628 | `1d4252d0b235397f2d347a75cb13bb20aaca6a1d02b20bc5cfc1ca8200fb15c0` |
| `public/geo/sample-climate-wind-850-1991-2020.json` | 115,443 | `d1c893ce4474ced4ecaccfaa1bf7fa0f1007e764c1d36bd24f0cdcf3b4e38583` |

Detailed provenance, exact raw URLs, baseline, units, coordinate order, licences and input/output fingerprints are in `src/content/topics/sample-climate/data/SOURCES.md` and `scripts/geo/sample-climate/SOURCES-GEO.md`.

Browser test source: `tests-e2e/sample-climate.spec.ts` (15 cases, including locale/theme matrix). Unit suites cover real-array numbers, strict author/resource validation, independent native sampling, projected direction, rain bins, URL precedence, order, explicit retry, stale requests and disposal. Browser acceptance remains pending.
