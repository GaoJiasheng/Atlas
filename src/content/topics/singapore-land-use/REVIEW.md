# Singapore's land, 1959–today: review status (20 October 2026)

Status stays `draft` until Gavin has read the passages below. Facts, objectivity, map data and the Chinese text have been reviewed; the ledger is [AUDIT.md](AUDIT.md), the build notes are in docs/34 §9.

## For Gavin to read before publishing (Chinese text first)

Paragraph numbers count the body paragraphs of each chapter (¶1–¶4).

1. **01 A crowded city — the Bukit Ho Swee fire.** ¶3; More “河水山大火：已知的与有争议的”; beat 3 caption; events `bukit-ho-swee-fire` (disaster) and `bukit-ho-swee-rebuilt`. Questions: the More block gives the rumours of arson (gangs or the government) through two reviews of Loh Kah Seng's book, quotes one former resident (“你不愿意也得搬”), and sets beside them the government's change to the land law and NLB's “cause unknown”. Is naming the rumour that the government was behind it right for this readership, or should the block say only that “some suspected arson”? Loh's book itself was not read — do you want it read before publishing? His Chinese name was not found in a Singapore source, so the Chinese text uses “Loh Kah Seng”; do you know it?
2. **02 New towns — land acquisition.** ¶2; More “土地征用：两种看法”; beat 1 caption; event `land-acquisition-act`. Questions: the government's case is given in Lee Kuan Yew's terms (public development should not enrich landowners) and the owners' in CLC's (compensation on 1973 values could not buy a replacement). The state's share of land is given as about 44 % (1960) to over 85 % (2007); “about 90 % today” was dropped for lack of an official source. Right balance? Is 征用 / 征用土地 the wording you want throughout?
3. **02 New towns — resettlement.** ¶4; More “搬家的那一天” (Au Seck Ngee / 欧摄毅, from the Founders' Memorial exhibition). Questions: gains (water, power, sanitation, safety from fire, ownership) and losses (neighbours, farms, animals, livelihoods, hard first years) are listed side by side. Graves, temples and mosques moved for development are **not** mentioned: no read source covered them. Add a sentence (with a source you prefer), or leave it?
4. **03 Farms — the pig-farm phase-out.** ¶2; More “停止养猪：两种看法”; beat 2 caption; event `pig-farming-phase-out`. Questions: the government's reasons follow the 1985 press release (pollution, treatment cost, land, complaints from nearby estates); the farmers' side is Koh Lip Lin in Parliament (1988) and CLC's account of families who changed trade. NHB says the 1970s move to Punggol was to protect water catchments; the 1984 decision is not tied to reservoirs alone. Is that the right weight? Farmers who moved to Malaysia or Indonesia are not mentioned (no read source).
5. **05 More land — sand for reclamation.** More “沙从哪里来：两种看法”. Questions: costs are given in NLB's words; the dispute is Global Witness (2010, press release only — the report itself was not read) against the Ministry of National Development's reply (imports by private companies, sources checked including Cambodian licences), plus MFA on Indonesia's 2003 sea-sand ban. Cambodia's 2017 export ban is **not** stated (seen only in search snippets). Is a campaign group's claim acceptable in a primary-level text if paired with the ministry's reply?
6. **06 Sharing the island — Lim Chu Kang, 2026.** More “规划会改”. The May 2026 change is after the timeline; it is told as a government decision being carried out, with farms' tenures honoured. Right?
7. **Glossary definitions:** `kampong` (甘榜 — “not a slum”), `resettlement` (搬迁), `land-acquisition` (土地征用) — spec §8.3-3 asked for your reading.
8. **Background reading note** (阅读说明) — the plain-language statement of what the map does not show and how accurate the coasts are.

## Decisions taken in review that you may want to reverse

- **The 1959 coast** is the 1819–1965 topic's L5 (charts 1954–1961) for the whole of 1959–1973, with Ubin, Tekong and the southern and Jurong islands added from the 1973 satellite image. That topic's L4 (1941 map) is not used. When Codex's third pass on `land-sg-history.json` lands, this topic's first era should be rebuilt from it (`coast-eras.ts`, `historic-islands.py`, `build-coasts.ts`, then `control.ts`).
- **Nature reserves** are drawn from 1951 (first legal protection), not 1990.
- **Linggiu** is left out of this topic's reservoir layer and events.
- **The naval base** (copied from singapore-1819-1965) is a `site` here, so it does not pull the time axis back to 1938.
- **A hold frame** (K4 again on 31 December 2025) ends the axis on the spec's date.
- **The Kampong Tiong Bahru fire of 1959** is folded into the Bukit Ho Swee event's detail rather than kept as its own event (it fell before the 1 April 1959 map and stretched the axis).

## Engine notes for the main session (not changed here)

- Persisting rail lines (`persist: true`) are 1 px at 60 % opacity; at island zoom the MRT network of chapter 04 is hard to see, even with the HDB dots turned off for that chapter. A width option for persisting lines (not tied to `strength`, which prints “N people”) would help.
- A movement whose `from` equals `to` shows its date twice in the leader label (“16 DEC 1989 – 16 DEC 1989”).
- At the World preset every leader label of a Singapore-only topic sits mid-stage; a drag that ends on a label does not free the camera. `pnpm shoot … --keys` failed its “drag frees the camera” check for this reason (also on Codex's commit 82ee63c; found by bisecting: removing chapter highlights fixes it). The background chapter therefore has no chapter-level highlights; its four beats keep theirs.

## Questions still open from the spec

- §8.3-1: SLA / NUS 1:25,000 maps of 1966 and 1975 would let the farms and kampongs of the 1960s–70s be mapped; not requested.
- The six 1986 agrotechnology parks are named differently by CLC (Ah Ma Keng, Nee Soon), SFA (Mandai) and the 1986 press release (Ama Keng; Lim Chu Kang/Neo Tiew); the text names only Lim Chu Kang and the three places of the first 1986 tender (Sungei Tengah, Murai, Loyang). Chinese names: 慕莱 for Murai (as four-taps names Murai Reservoir 慕莱蓄水池) and 双溪登加 for Sungei Tengah (Tengah = 登加); confirm.
