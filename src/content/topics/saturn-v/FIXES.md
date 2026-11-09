# 土星五号 · 插图修复记录

2026-10-27，browser acceptance（Claude）。除下列一项外，其余问题已在验收中直接修复（见 docs/61 §9.5）。

## 1. 封面图：五台 F-1 已重绘（2026-10-29）

- 已用 `image_gen.imagegen` 重绘两次；第 1 次仍只清楚显示四个喷口，弃用；第 2 次改为更低的仰视，最终 PNG 和 800 / 1600 px WebP 均已打开检查：外围后排两台、中央一台、外围前排两台，五个独立喷口均可数清，均连接在同一个 S-IC 底部。
- 保留三级主级、仪器舱环、渐缩适配器、Apollo 服务舱/指令舱和骨架逃逸塔；细长整体在低仰视下有透视缩短。无文字、旗帜、背景、烟火或宽飞机翼。
- 替换源图暂存于**本工作树** `art/planned/saturn-v/saturn-v.png`（1254²，SHA-256 `7b85c959809a903164e8a80c73f0cbb1bea6285bf66f2c740c49368633f90c08`）。主 checkout 的 `/Users/gavin/work/atlas/art/planned/saturn-v/` 在 sandbox 可写范围之外，未覆盖；本工作树的源图、`prompts.json`、`manifest.jsonl` 保留可复制的完整交付。
- 已运行 `pnpm tsx scripts/illustrate.ts process art/planned/saturn-v/saturn-v.png saturn-v`：800² / 44,338 B、1600² / 124,064 B，均 q82，透明外缘；仅更新 `illustrations.json` 的 `saturn-v` 蒙版。prompt、哈希与验图记录见 `ILLUSTRATIONS.md`。
- 浏览器验收由主 session 运行：本 sandbox 按用户要求跳过 `pnpm shoot` 和 `pnpm e2e`。
- 本轮非浏览器门槛全部通过：`pnpm check`、`pnpm validate`（85 主题，0 error / warning）、`pnpm test`（219 文件，5,448 测试）和 `pnpm build`（173 页）；无引擎或 package/lockfile 改动，无 git 写操作。

### 原验收问题（2026-10-27，已由上述替换解决）

- 截图/源图：`art/planned/saturn-v/saturn-v.png`（1024²，部署为 `public/illustrations/saturn-v.webp`、`saturn-v@2x.webp`）。
- 现状：S-IC 底部只看得到四个喷管呈十字形，中央一台没有出现，读起来像“四台发动机”。这与全主题的核心事实（S-IC 五台 F-1，一中央四外围，01 章、封面 prompt、spec §3 都是 1+4）相冲突。原 prompt 里“不要求显示全部喷管”的豁免不成立：斜仰视下中央喷管本应位于四个外围喷管之间可见。
- 期望：重新生成（不要手改）。S-IC 底部清楚画出 5 个 F-1 喷管（中央 1 + 外围 4，斜视时允许外围之一部分遮挡，但中央一台必须可见）。其余保持：三个主级（S-IC 五台 F-1、S-II、S-IVB）、仪器舱环、渐缩适配器、服务舱、指令舱、骨架式逃逸塔、细长比例、无字无旗无背景、灰度等 RGB、透明底。保留已通过的部分：四片尾翼可见两到三片即可，不要画成飞机翼。
- 重做后：更新 `ILLUSTRATIONS.md` 的 SHA-256 / prompt / “已看过最终 PNG” 记录，重新运行 `pnpm tsx scripts/illustrate.ts process art/planned/saturn-v/saturn-v.png saturn-v`，同步 `src/lib/illustrations.json` 的 `saturn-v` 蒙版；封面是索引页卡片图和 PWA 预缓存图，替换后需重新 build。
- 备注：这是唯一阻碍“封面正确显示五台 F-1”的项目，不影响主题功能；主 session 可决定先发布后补图。

## Rebuild 2026-11-05

- Replaced the stage/engine/spacecraft/LM hero geometry with a local meshopt asset; source, grades, counts and evidence are in `REBUILD-3D.md`.
- ch05: retained five beats, changed its fifth beat to an explicit launch/return comparison and added the escape tower and docking probe to the index. The other 34 beat references are preserved.
- Prepared `scripts/geo/saturn-v/index-one-tap.patch` for shared-engine review. It finds a visible in-chapter table-simulator configuration before selecting an indexed object, using the simulator's actual visibility output. **Not applied** under the topic ownership restriction; physical two-tap behaviour still requires the main session's GPU acceptance.
- Corrected SM cylinder/nozzle proportions and coupled CSM docking offsets. Tests inspect the compressed mesh and label anchors after quantization, not just the retained invisible primitive envelopes.

### Resume audit 2026-11-09

- Inspected inherited and new four-view reference sheets for all six hero groups under paper/cinema studio lighting and ACES. Corrected CSM hatch interference, duplicate intersecting LM foil, periodic foil folds, F-1/J-2 bell/neck proportions, J-2 start tank, antenna dish supports and fairing crowns; preserved the probe's full smooth lathe for its close-up.
- Actual payload: 157,908 → 335,549 triangles; estimated material draw pieces 41 → 34; topic GLB 0 → 1,485,956 bytes. Packed LM, camera anchors, probe/docking interfaces and actual five F-1 mouth clearances are checked from the decoded payload.
- Self-grade: 10 A / 23 B, provisional pending GPU acceptance. Detailed engine castings, exact flight-specific spacecraft/MLI layouts, internal teaching vessels and articulated LM stowage remain explicit B exceptions, each with its reason in `REBUILD-3D.md`. This is not an all-A museum acceptance claim.
- ch05 tower/probe index entries are present. The one-tap shared-engine patch passes `git apply --check` but remains unapplied under the ownership restriction. No runtime one-tap fix is claimed.

## Rebuild 2026-11-05 — round 2 (audit 2026-11-09)

Supersedes the preceding 10 A / 23 B state. See `REBUILD-3D.md` for the current table, before/after budgets, primary references and repeated comparison looks. Preserved the main session's applied index patch, all 33 selections, 35 beats, 13 configurations and learner-facing teaching numbers.

- Split the F-1/J-2 builders; added correct-size chambers/bells, tube/hatband relief, separate pump castings, ducts, generator, exchanger/collector, gimbal hardware and a perforated F-1 interface. Protected J-2 start spheres through simplification.
- Rebuilt CM apertures/reveals/glass, conforming hatch seal/hinges/handle, SM radial webs and six sectors, real bay contents, four hollow-nozzle quads and supported four-dish antenna array. Rebuilt SPS connections.
- Added LES nominal stowed canards, cover, escape/jettison/pitch nozzle hardware and connected lattice/feet.
- Rebuilt LM descent core/foil/equipment, primary and secondary gear with wrapped pads and three probes, actual cabin facets, diagonal corner quads, radar/antennas/tunnel and ascent cover. A failed 34 mm SLA clearance candidate was corrected at the source mount stations; the fit test was retained.
- Rebuilt six domed tanks, perforated fuel domes/tunnels, baffles/common domes, IU internals and couches. FLOW and physical feeds now share the actual five 1+4 paths. Minimal EN/ZH part text reflects these changes, including replacement of the old two generic SM vessel placeholders by four SPS vessels plus support-system contents.
- Tests measure actual decoded apertures/nozzle throats, start-sphere curvature, common-dome gap, hatch relief, FLOW pipe interiors, packed fit and quantized label anchors. `closed:false` in the shipped GLB is checked against the property the engine actually consumes.
- Resume close-ups corrected footpad foil/backing intersections, foil finish and the couch cloth topology and reclined silhouette. Couches now have four outer armrests and eight common-frame attenuators. New compressed-payload tests cover foil clearance and couch proportions/enclosure fit.
- The baker preserves all 360 current bilingual values by stable ID and verifies their digest. It no longer restores display text from build literals. Studio previews assert parity with the engine's consumed lighting rig; every final frame/contact manifest identifies the delivered asset hash.

Current gates: `round2-verification.json`. No Vitest config, shared engine, package/lock, camera/framing, queue, browser/desktop or git mutation was made. The unrelated shared build-cycle/import blockers are provided as reviewable patches, not silently applied.
