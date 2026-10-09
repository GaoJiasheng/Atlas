# 验收清单（发布前全部打勾）

## 门槛
- [ ] `pnpm check`、`pnpm validate`（0 error、0 warning）、`pnpm test`、`pnpm build`、`pnpm e2e` 全绿
- [ ] `pnpm shoot <slug> --keys --layout`：键位 0 失败、六个尺寸 0 布局问题、console 干净、无外部请求
- [ ] `pnpm shoot <slug> --beats`：0 节拍失败；"unlabelled highlights"清单为空或每条都有理由
- [ ] **没有高亮 id 在章节镜头下落在屏外**：同一次 `--beats` 末尾的"chapter highlights"清单为空（每章自己的 `state.highlight`）；有就调章节镜头 zoom / 中心，不是删 id（id 与本章无关才删）
- [ ] **没有自相交 / 零面积环**：`simplify.ts` 末尾打印 `rings: N, zero-area 0, self-crossing 0`（0 / 0）；新主题把 slug 加进 `tests/geo-rings.test.ts`

## 内容
- [ ] 每个数字都有 `<Num s>`；事件的数字有 `sources`；冲突来源列了区间
- [ ] 客观性检查（`writing-rules.md`）每章过一遍；各方罪行与平民死亡都在
- [ ] 沉重内容段落的中文稿 Gavin 已审
- [ ] 两种语言都完整：中文独立成文，没有缺 `zh` 的字段
- [ ] 名词表 8–15 个，每个在 EN、ZH 正文里各包了第一次出现
- [ ] 背景章（若有）：`order: 0`、阅读说明写了视角、数字和地图来源
- [ ] 无 TODO、占位文字、脚手架残留（`Chapter one`、`One sentence:`、`1900-01-01`）

## 地图
- [ ] 每个关键帧有并排图 `docs/screenshots/<slug>/geo-K#.png`，逐块核对过，残差在预算内
- [ ] SOURCES-GEO.md 与 data/SOURCES.md 记全来源、许可（原文）、方法、残差、已知简化
- [ ] 海岸只有一条线（底图的）：控制区不在海里、不在海岸外另画一圈；近景（新加坡级 zoom 10）也贴合
- [ ] 控制区只画内陆分界（不同 holder 之间），同一 holder 的接缝和海岸不描边
- [ ] 领土名称（N）每帧都对：谁占着就写谁，`label` 写清占领状态；没有重名、没有压在引线标注上
- [ ] 行军路线沿真实道路 / 海路，途经点记在 SOURCES.md；`linger` 让走过的路线停留得合理
- [ ] 今天的国界（B）默认关；需要时章节 `layers` 打开

## 体验
- [ ] 两套主题（paper / cinema）各看一遍每章截图
- [ ] 手机（390×844）：章节芯片、底部抽屉、阅读、名词卡可用
- [ ] 章节轨、时间轴节点、← → 都能换章，自动跑结束时播放头正好在章节时间
- [ ] 演示：从头到尾翻一遍；自动播放跑一遍；语音（Voice）在中英各听两拍：先读章号、章名，再读字幕，换拍立即停
- [ ] `<Term>` 点开名词卡，相关词可跳，TOOLS"名词"列全部，ESC 关闭
- [ ] `topic.yaml` 改 `status: published`；docs 实现记录表补齐；提交（push 等 Gavin）
