# Monsoons and weather: fact and data audit (27 October 2026)

Every claim in the chapter bodies, More blocks, captions, site texts and glossary was matched to a source in `data/sources.json`; whatever could not be matched was cut or rewritten. The spec's fact table (docs/50 §0.3: 51 facts, 34 verified, 5 changed, 12 cut) is the starting point. In this build the Changi values and the Seasons / Rainfall wording (S2), the NWS thunderstorm life cycle (S6) and the NWS lightning safety page (S8) were re-read directly; the other web sources rely on the spec's reading of 27 October 2026. Map numbers were recomputed from the shipped data files, and `tests/time-scene/monsoon-and-weather.test.ts` checks them.

## Claims and where they stand

| Claim (as written) | Source | Where | Status |
|---|---|---|---|
| Weather is short-term; climate is the pattern over many years | S1 | 00 ¶1, glossary | verified (spec F01) |
| Monsoon = large-scale seasonal circulation; land and sea heat at different rates; sea breeze by day | S3 | 01 ¶1, More 1, glossary | verified (F02, F04) |
| Winds are named for where they come from | S3 | 00 More 2, 04 More 1 | verified (F03) |
| Rotation turns large-scale winds right in the north, left in the south; no switch at the equator | S3 | 01 ¶3, beat 01-3 | verified (F05) |
| NE Monsoon December to early March; SW Monsoon June to September; inter-monsoons late March to May, October to November | S2 | 02 ¶1, 03 ¶1, 04 ¶1, beats | re-read 27 Oct |
| NE Monsoon: wet first half (December to early January, monsoon surges), windy and relatively dry late January to early March | S2, S5 | 02 ¶2, beat 02-1 | re-read 27 Oct |
| Rain belt near Singapore November to January, moves south towards Java by February | S2 | 02 ¶3, beat 02-3 | re-read 27 Oct |
| Changi 1991–2020: February 105.1 mm, December 331.9 mm | S2 | 02 ¶4, More 1, beat 02-4 | re-read 27 Oct (spec F10 narrowed; annual total not printed) |
| Inter-monsoon surface winds light and variable, with land and sea breezes | S2 | 03 ¶2, beat 03-2 | re-read 27 Oct |
| Singapore's SW Monsoon surface winds commonly south-east to south | S2 | 04 ¶2, beat 04-2 | verified (F07) |
| Surface heating and converging sea breezes help afternoon thunderstorms | S5 | 03 ¶3, beat 03-4 | verified (F13) |
| Cloud = droplets, ice in colder parts; cumulonimbus icy anvil | S4 | 03 ¶3, 06 ¶2, glossary | verified (F11, F12) |
| Ordinary cell: developing (updrafts, little rain), mature (rain and downdraft), dissipating (outflow cuts off supply) | S6 | 03 ¶4, More 2, figure | re-read 27 Oct; NWS cell lifetime (30–60 min) and storm heights deliberately not used |
| "The building block of all thunderstorms is the thunderstorm cell" | S6 | 05 More 2 | re-read 27 Oct |
| Ice crystals and graupel collide and are separated by air motion; details still studied | S7 | 06 ¶3 | verified (F16) |
| Thunder = sound of air heated and expanding along the lightning path; clouds need not collide | S5 | 06 ¶3, beat 06-2 | verified (F17) |
| Lightning can strike away from the rain | S5 | 06 ¶4 | verified (F18) |
| Hear thunder → substantial building with electricity or plumbing, or enclosed metal-topped vehicle, windows up; 30 minutes after the last thunder; no isolated tree; avoid plumbing, corded electrical equipment, windows and doors; "if you hear thunder, lightning is close enough to strike you" | S8 | 06 ¶1, ¶4, More 2–3, summary, beats 06-3/4 | re-read 27 Oct. "Tell a responsible adult" is the spec's child-safety addition (F19 note), not NWS wording |
| Sumatra squall: organised thunderstorm line over Sumatra or the Strait of Malacca, usually eastwards; SW Monsoon and inter-monsoons; often night or early morning; sudden gusts, heavy rain | S5 | 05 ¶1–2, beats | verified (F21, F22); no gust speeds or durations |
| Monsoon surge over the South China Sea gathers moisture, can bring prolonged rain | S5 | 02 ¶2, More 2, glossary | verified (F23) |
| Haze from regional forest and land fires; worse with dry weather, little rain; affected by wind direction | S9 | 07 ¶1, ¶3, More 3 | changed in spec (F24: NEA page 403, MOH page used) |
| BMKG: early warning, inter-agency work, keeping peat wet | S10 | 07 ¶2, More 1, beat 07-2 | verified (F25); article percentages not used |
| METMalaysia GAW: monitoring supports research on transboundary haze, acid deposition, climate change | S11 | 07 ¶3, More 2, beat 07-3 | verified (F26) |
| ASEAN haze agreement signed 10 June 2002, in force 25 November 2003 | S12 | 07 ¶4, More 3, beat 07-4 | changed in spec (F27: ASEAN news page 403, Haze Portal used) |
| Human-caused climate change already affects many extremes in every region | S14 | 08 ¶3, beat 08-3 | changed in spec (F28: only the UNCCD description of the report was read; 1.1 °C cut) |
| Research cannot yet say for certain how much of Singapore's rainfall change is from global warming, natural variation or other causes | S13 | 08 ¶3 | verified (F30) |
| El Niño years generally less rain here, La Niña generally more; tendencies | S1 | 08 ¶2, More 1, beat 08-2 | changed in spec (F31: "warmer" dropped) |
| 1991–2020 period, 850 hPa, 2.5°, 30 valid years everywhere, m/s and mm/day | S101, S102, S32 | 00 ¶2, More 1, 3, 08 More 1 | recomputed from the files |
| Equator at 105° E: January v ≈ −4.9, July v ≈ +3.6 m/s | S101, S24 | 01 ¶2 | recomputed; unit test |
| January South China Sea arrows from the east and north-east, July from the south-west and west | S101 | 01 ¶2 | recomputed (box 107.5–117.5° E, 7.5–20° N; 26 of 30 nodes in each range) |
| February: Jakarta cell ≈ 13 mm/day, Singapore cell ≈ 4.4 mm/day | S102 | 02 ¶3 | recomputed; unit test |
| July 850 hPa arrow at the node nearest Singapore from the south-south-west; south of the equator from the east | S101 | 04 ¶3, More 2 | recomputed; unit test |
| u east, v north; the size of a mean vector is not the mean speed | S24 | 00 More 2, 01 ¶2, More 2 | verified (F39) |
| City coordinates and names | S103 | events.json | checked by `derive.ts` against the pinned file |

## Rewritten or cut in this build

| Draft wording | What happened | Why |
|---|---|---|
| "region thousands of times larger than one beach"; "drops thousands of times bigger" | cut to "far larger" / "far bigger" | no source for a ratio |
| Sea breeze "grows in the late morning, fades in the evening" | cut to "a daytime wind" | S3 says only "by day" |
| Monsoon surge brings "hours" of rain; squall "passes in one night" | cut | the spec excludes durations |
| Safe shelter examples "bus stop, tent, convertible" | replaced by NWS wording (electricity or plumbing; enclosed, metal-topped, windows up; windows and doors) | not on the page that was read |
| "Count seconds" More | rewritten around the NWS sentence "If you hear thunder, lightning is close enough to strike you" | the page does not discuss counting |
| BMKG "forecasts so that dry spells are seen coming" | cut to the article's title and three named measures | embellishment |
| METMalaysia "acid rain" | "acid deposition" | the source's term |
| South China Sea January arrows "from the north-east"; July Java arrows "from the south-east" | corrected to east/north-east and east | the data say so (850 hPa, not surface) |
| Opening beat "January climatology" with no monthly layer on | "with the 1991–2020 monthly layers still switched off" | caption must match the map |
| "MSS" in captions | "Singapore's weather service" | captions are read aloud |

Spec cuts kept out: Changi annual total, temperature trends (F29), the 1.1 °C global figure, children's misconception studies (F32–F33), data.gov.sg / SODL datasets (F34–F37), the 1948 start and termination date of R1, IMERG and ERA5 (F40–F42), syllabus mapping (F45–F46), health thresholds, fire counts, casualty figures, any responsibility for particular fires.

## Map data

| Item | Verdict | Check |
|---|---|---|
| Wind file | kept | derived from the raw OPeNDAP ASCII by `derive.ts`; input SHA-256 match the inventory; rows reversed to south-to-north; frames identical to the research cache and the engine fixture; 12 × 399 vectors, 30 valid years everywhere |
| Rain file | kept | same, 12 × 360 cells; GPCP latitude already ascending; the rejected wrong-latitude cache file is never read |
| Six city points | kept | NE_ID, NAME and coordinates equal the pinned Natural Earth file |
| Basemap | reused | `land-50m.json`, `land-10m-sea.json` hashes equal the inventory |
| Storm tracks, smoke plumes, fire points | none drawn | no licensed observed data (S31) |
| Display rules (rain steps, arrow scale, calm circle) | design source S199 | shown as the KEY's source |
