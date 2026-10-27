# 土星五号 · 浏览器验收后需 Codex 重做的项目

2026-10-27，browser acceptance（Claude）。除下列一项外，其余问题已在验收中直接修复（见 docs/61 §9.5）。

## 1. 封面图 `art/planned/saturn-v/saturn-v.png`：F-1 发动机只画出四台

- 截图/源图：`art/planned/saturn-v/saturn-v.png`（1024²，部署为 `public/illustrations/saturn-v.webp`、`saturn-v@2x.webp`）。
- 现状：S-IC 底部只看得到四个喷管呈十字形，中央一台没有出现，读起来像“四台发动机”。这与全主题的核心事实（S-IC 五台 F-1，一中央四外围，01 章、封面 prompt、spec §3 都是 1+4）相冲突。原 prompt 里“不要求显示全部喷管”的豁免不成立：斜仰视下中央喷管本应位于四个外围喷管之间可见。
- 期望：重新生成（不要手改）。S-IC 底部清楚画出 5 个 F-1 喷管（中央 1 + 外围 4，斜视时允许外围之一部分遮挡，但中央一台必须可见）。其余保持：三个主级（S-IC 五台 F-1、S-II、S-IVB）、仪器舱环、渐缩适配器、服务舱、指令舱、骨架式逃逸塔、细长比例、无字无旗无背景、灰度等 RGB、透明底。保留已通过的部分：四片尾翼可见两到三片即可，不要画成飞机翼。
- 重做后：更新 `ILLUSTRATIONS.md` 的 SHA-256 / prompt / “已看过最终 PNG” 记录，重新运行 `pnpm tsx scripts/illustrate.ts process art/planned/saturn-v/saturn-v.png saturn-v`，同步 `src/lib/illustrations.json` 的 `saturn-v` 蒙版；封面是索引页卡片图和 PWA 预缓存图，替换后需重新 build。
- 备注：这是唯一阻碍“封面正确显示五台 F-1”的项目，不影响主题功能；主 session 可决定先发布后补图。
