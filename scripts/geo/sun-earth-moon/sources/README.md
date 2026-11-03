# Frozen lunar surface inputs

These are build inputs, committed so a clean mesh rebuild needs no network.
Provenance, public-domain terms and credits are in
`src/content/topics/sun-earth-moon/data/SOURCES.md`.

- `lroc.jpg`: NASA SVS CGI Moon Kit 4720's `lroc_color_2k.jpg`, downloaded
  2026-11-03 without pixel changes. 2048×1024, zero longitude at image centre,
  north at the top. Re-encoded to embedded 2048×1024 WebP, quality 88.
- `lola.u16`: the losslessly decoded pixel plane of that kit's
  `ldem_4_uint.tif`. 1440×720, one channel, little-endian unsigned uint16,
  no header. `lola.json` supplies dimensions and the original half-metre units.
  Elevation = value × 0.5 − 10000 metres. This is not an 8-bit display image.
- Input hashes and exact mesh/asset counts are in
  `public/models/sun-earth-moon/build-report.json`.

Original downloads:

- https://svs.gsfc.nasa.gov/vis/a000000/a004700/a004720/lroc_color_2k.jpg
- https://svs.gsfc.nasa.gov/vis/a000000/a004700/a004720/ldem_4_uint.tif

NASA's Scientific Visualization Studio, LROC WAC / ASU and LOLA teams.
Public domain; see https://svs.gsfc.nasa.gov/help/ and https://svs.gsfc.nasa.gov/4720/.

The TIFF decoder is `../lola-tiff.ts`; projection and bilinear sampling are in
`../surfaces.ts`. No lunar feature is procedurally invented or repeated.
