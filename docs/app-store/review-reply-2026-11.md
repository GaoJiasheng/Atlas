# 2026-11-14 被拒回复（Guideline 2.1 · Information Needed）

> 不是功能缺陷，是新 App 首次提交的例行索要材料（观象 2026-08 首提时收到过同一封，补材料后原 build 通过）。
> 状态（11-17 查 App Store Connect）：1.0 `REJECTED`，提交 `UNRESOLVED_ISSUES`，绑的是 **build 10**，审核备注里没有附件。
> **重新提交换成 build 13**（11-17 定：13 含 8 个新主题和打磨，省一轮审核）；Gavin 先上传 13，录屏也用 13。

苹果要六项，五项是文字，一项是录屏：

| 项 | 内容 | 谁做 | 状态 |
|---|---|---|---|
| 1 | 真机录屏（最新系统，从启动 App 开始，走一遍典型流程） | **Gavin** | 等录 |
| 2 | 用途、目标用户、解决什么问题 | Claude | 写好 |
| 3 | 主要功能怎么进，有无登录凭据 | Claude | 写好 |
| 4 | 用到的外部服务 | Claude | 写好（无） |
| 5 | 各地区功能是否一致 | Claude | 写好（一致） |
| 6 | 受监管行业 / 第三方素材的授权 | Claude | 写好（开放许可清单） |

第 2–6 项的英文答复在 [`review-notes-2026-11.txt`](review-notes-2026-11.txt)（3954 字符，备注栏上限 4000），内容都来自 `listing.md`、`THIRD-PARTY-NOTICES.md` 和 build 10 的实际界面。

## 录屏怎么录（约 2–3 分钟，一镜到底，每步停两秒）

准备：iPad 升到最新 iPadOS（设置 → 通用 → 软件更新）；TestFlight 里装 Atlas **1.0 (13)**；语言用英文。

1. 从控制中心开始录屏，回到主屏幕，**点 Atlas 图标启动**（苹果要求从启动开始）。
2. 首页停两秒，往下滑到主题卡片；点一下 Science，再点回 All。
3. 进 **How an Air Conditioner Works**：拖动转一圈 → VIEW 栏点 CUTAWAY → 点 EXPLODED → 点一个零件看说明 → 在底部章节轴点第 3 章。
4. 回首页，进 **Second World War**：点 Next 三四下看地图变化 → 在章节轴上跳一章。
5. 回首页，进 **Fractions**：Next 几下 → 走到一章末尾，答那道小测。
6. 右上角 EN 切到中文再切回；LOOK 切到深色再切回。
7. 点 PRESENT 播几秒，停下。
8. 结束录屏。

App 没有注册、登录、注销账号，没有用户发的内容，没有付费内容，所以这三类流程不用录，备注里已写明。

录完把视频隔空投送到 Mac，放到 `docs/app-store/review-recording.mov`（或把路径告诉 Claude）。

## 拿到录屏之后（Claude 做）

1. 压到 10 MB 左右，经 App Store Connect API 传成「App 审核信息」的附件。
2. 把 `review-notes-2026-11.txt` 写进备注栏。
3. 版本页 Build 换成 13，重新提交，再查一次状态确认是 `WAITING_FOR_REVIEW`。

解决中心里的那条消息 API 回不了；需要回复的话，贴一句 `All requested information has been added to the App Review Information notes, and the screen recording is attached there.` 即可。
