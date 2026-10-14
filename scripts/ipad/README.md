# iPad shell QA

Build and sync from the repository root, with `ATLAS_BASE` unset (the native bundle uses `/`):

```sh
pnpm build && npx cap sync ios
xcodebuild -project ios/App/App.xcodeproj -scheme App -configuration Debug \
  -destination 'platform=iOS Simulator,id=ED7AC183-F9B7-4784-9DF3-C5394AB51952' \
  -derivedDataPath ios/DerivedData CODE_SIGNING_ALLOWED=NO build
xcrun simctl install ED7AC183-F9B7-4784-9DF3-C5394AB51952 ios/DerivedData/Build/Products/Debug-iphonesimulator/App.app
```

`node scripts/ipad/assets.mjs` regenerates the native icon and launch mark from `public/favicon.svg`.

Rotate the actual simulator display before taking each orientation group:

```sh
xcodebuild -project ios/App/App.xcodeproj -scheme AtlasOrientation \
  -destination 'platform=iOS Simulator,id=ED7AC183-F9B7-4784-9DF3-C5394AB51952' \
  -derivedDataPath ios/DerivedData CODE_SIGNING_ALLOWED=NO \
  -only-testing:AppUITests/AtlasOrientationTests/testFullScreenMode \
  -only-testing:AppUITests/AtlasOrientationTests/testLandscape test
```

`testFullScreenMode` selects Full Screen Apps in this simulator’s Settings. For portrait use `testPortrait`. The `AppUITests` helper rotates through XCTest and activates Atlas. It does not change the production app's supported orientations or window geometry. On iPadOS 26, prefer the simulator's Full Screen Apps mode for full-device screenshots; Windowed Apps also remain usable.

```sh
node scripts/ipad/screenshot.mjs home-landscape / landscape
node scripts/ipad/screenshot.mjs aircon-landscape /en/topics/aircon/ landscape
node scripts/ipad/screenshot.mjs ww2-landscape /en/topics/ww2/ landscape
ATLAS_SPEECH_PROBE=1 node scripts/ipad/screenshot.mjs fractions-landscape /en/topics/fractions/ landscape
node scripts/ipad/screenshot.mjs muscles-chest-landscape '/en/topics/muscles-chest/?ch=training-the-chest&b=2' landscape
node scripts/ipad/screenshot.mjs zh-aircon-landscape /zh/topics/aircon/ landscape
# Rotate to portrait first.
node scripts/ipad/screenshot.mjs fractions-portrait /en/topics/fractions/ portrait
```

`ATLAS_SIMULATOR` overrides the UDID. The Debug-only native inspection hook accepts `ATLAS_QA_PATH` and `ATLAS_QA_SCRIPT` through `simctl launch` child environment variables. These hooks are absent from Release builds. The report is read from the app's Documents directory. Captures and JSON reports go to the ignored `scripts/anatomy/cache/ipad/` directory.

`*-raw.png` files are unmodified `xcrun simctl io … screenshot` captures. CoreSimulator exposes a fixed portrait framebuffer; landscape captures are also saved as lossless PNG rotations for viewing, while retaining the originals. The helper asserts the document URL, viewport orientation, scene readiness, visible images, local asset responses, font errors, no observed remote resources, blocked web fetch and blocked native HTTP. With `ATLAS_SPEECH_PROBE=1` it records English/Chinese utterance start/end events and waits for asynchronous WebKit voice enumeration.

The native resource handler confines file reads to bundle `public/`, resolves directory `index.html`, and puts an offline CSP on responses. New-window and normal external navigation are blocked, as is Capacitor's native HTTP plugin. Native speech exposes only installed local OS voices. Source citation URLs and library namespace/license strings can still occur in `dist/`; they are not runtime asset dependencies.

Verification on 2026-10-14: Xcode 26.4.1 / iOS 26.4, iPad Pro 13-inch (M5), UDID `ED7AC183-F9B7-4784-9DF3-C5394AB51952`. All seven captures above were visually inspected. Landscape viewport 1376×1032; portrait 1032×1376; device pixel ratio 2; safe top 32px and safe bottom 25px. Every asset probe returned 200 with nonempty content, including meshopt GLB and all four local basemap files. All reports showed native platform, scene readiness, zero page/resource errors, no missing visible images, no remote resource loads, and rejected web/native HTTP probes. Chest training restored chapter `training-the-chest`, beat index 1 (`b=2`), with the incline dumbbell press model and illustration. EN/ZH Web Speech both emitted start and end events with local voices.

`pnpm check`, `pnpm validate` (17 topics), `pnpm test` (1,507 tests), `pnpm build`, `cap sync`, simulator build and orientation/fullscreen UI tests passed. The browser suite passed 77/78 on its full run; the one scene-readiness timeout passed on an isolated rerun (all 78 tests verified). `pnpm shoot aircon --layout --keys` passed with zero layout issues; its screenshots were inspected. Package manifests and lockfile were unchanged.

URL grep of the copied app bundle found 1,601 HTTP(S) strings: 1,514 citations, 74 namespace identifiers, 3 README credits, and 10 library license/diagnostic/attribution strings. No automatic remote asset URL was found. The audit file list and per-page reports are stored with the ignored screenshots. This string audit supplements the enforced request policies; it does not establish offline operation by itself.

Remaining deployment work: physical-iPad signing/install and an offline check of that device's installed local speech voices (see `docs/07-deploy.md`); App Store distribution requires paid membership, signing and review. No simulator implementation issue remains.
