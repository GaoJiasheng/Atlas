# 07 · 部署

**现状（2026-10-08 已上线）**：Pages 项目 `atlas`（经典 Pages，CLI 部署，未连 GitHub），生产地址 `https://atlas-565.pages.dev`，自定义域 `https://atlas.gavin.pub`。更新线上：`git push` 后 `pnpm run deploy`。wrangler 4.148 第一次建项目需要 `--force` 走经典 Pages，之后不用。

Atlas 是纯静态站点（`pnpm build` → `dist/`），没有服务端、没有 API。推荐 Cloudflare Pages。

## A. Cloudflare Pages（GitHub 集成，推荐）

Workers & Pages → Create → Pages → Connect to Git，选仓库，然后：

| 字段 | 值 |
|---|---|
| Production branch | `main` |
| Framework preset | `Astro` |
| Build command | `pnpm build` |
| Build output directory | `dist` |
| Root directory | 留空（仓库根） |
| 环境变量 `NODE_VERSION` | 不用设；仓库根的 `.node-version` 写的是 `22`，Pages 会读它 |
| 环境变量 `ATLAS_BASE` | **不要设**（站点在域名根路径，默认 `/`） |

说明：

- Node 选 22 而不是本地的 25：22 是 LTS，肯定在 Pages 构建镜像（v3）里；`package.json` 的 `engines` 写 `>=22`。如果以后确认镜像支持更新的版本再改 `.node-version`。
- pnpm 由 `package.json` 的 `packageManager`（pnpm 9.15.9）和 `pnpm-lock.yaml` 自动识别，不用额外配置。
- `pnpm build` 会先跑 `validate`，内容有 error 构建直接失败，这是有意的。
- `public/_headers` 会被拷进 `dist/`，Pages 自动识别：`/_astro/*` 一年 immutable，`/geo/*`、`/models/*` 一周，全站 `nosniff` / `Referrer-Policy` / `X-Frame-Options: DENY`，`sw.js` 与 manifest 不缓存。
- 不需要 `_redirects`：Astro 用 directory 格式输出 `dist/en/index.html`、`dist/zh/index.html`，Pages 对 `/en` 自动 308 到 `/en/`。`/` 是客户端语言跳转页（读保存的语言，否则 `/en/`），保持原样。
- 预览部署：非 production 分支自动得到 `<branch>.<project>.pages.dev`，用来过一遍下面的检查清单。

## B. CLI（不连 GitHub）

不把 wrangler 装进项目依赖，用 `pnpm dlx` 临时拉：

```bash
pnpm build
pnpm dlx wrangler login                      # 首次，浏览器授权
pnpm dlx wrangler pages deploy dist --project-name atlas
```

或直接 `pnpm run deploy`（注意要带 `run`：`pnpm deploy` 是 pnpm 自带的另一个命令；脚本 = `pnpm build && pnpm dlx wrangler pages deploy dist --project-name atlas`）。首次会提示创建 `atlas` 项目；production 分支用 `--branch main`。

## C. 自定义域名

Pages 项目 → Custom domains → Set up a domain。域名在 Cloudflare DNS 下会自动加 CNAME；不在的话按提示加 CNAME 指向 `<project>.pages.dev`。HTTPS 证书自动签发。service worker 要求 HTTPS（`pages.dev` 和自定义域名都满足）。换域名后旧域名下已安装的 PWA 不会迁移。

## D. 上线前检查清单

本地（`pnpm install` 后）：

- [ ] `pnpm check`、`pnpm validate`、`pnpm test` 全绿
- [ ] `pnpm build` 通过，终端末尾有 `PWA v1.2.0 ... generateSW`
- [ ] `pnpm e2e` 通过（先 `pnpm exec playwright install chromium`，且已 `pnpm build`）
- [ ] `dist/` 里有 `sw.js`、`manifest.webmanifest`、`_headers`、`icons/`（注册由 `BaseLayout.astro` 内联脚本负责）
- [ ] `grep -c geo dist/sw.js` 里 geo 只出现在运行时缓存规则里，预缓存列表没有 `geo/*.json`、`models/*`

线上（预览或正式域名）：

- [ ] `curl -I https://<domain>/_astro/<任一 hash 文件>` 有 `immutable`；`/geo/land-50m.json` 是 `max-age=604800`；任一页有 `x-content-type-options: nosniff`、`x-frame-options: DENY`
- [ ] `/en/` 与 `/zh/` 都能打开，语言切换保持当前页和 `?ch=` 状态；`/` 跳到上次语言
- [ ] 两个示例主题（`sample-time`、`sample-space`）在两种语言下都能打开，舞台出画面，← → 换章
- [ ] 深链接还原状态：`/en/topics/sample-time/?ch=second-look&t=2000-03-01&hl=sample-meeting`、`/en/topics/sample-space/?ch=pull-apart&cut=half`
- [ ] DevTools → Application：manifest 无报错，service worker 已激活；Network 勾 Offline 后刷新页面仍能打开已访问过的主题（地图底图需先看过一次才有缓存）
- [ ] Network 里没有任何第三方域名请求

关于草稿：索引页**只列 `status: published` 的主题**，没有任何草稿或状态标签。`draft` / `ready` 主题（两个示例主题就是草稿）照常构建，直接输入 URL（`/en/topics/sample-time/` 等）可进入，开发和 e2e 用；它们不出现在索引页，也不计入类别数量（没有已发布主题的类别显示“即将推出”）。要公开一个主题，把它改成 `status: published`。

## E. iPad (Capacitor)

原生壳使用 Capacitor 8，应用名 `Atlas`、Bundle ID `pub.gavin.atlas`、`webDir: 'dist'`。前提：macOS、Node ≥ 22、仓库指定的 pnpm、Xcode 26.4.1（26.4 系列）及已安装的 iPadOS Simulator runtime；`xcode-select -p` 应指向完整 Xcode。Capacitor 的 core / cli / ios 已在依赖里，直接 `pnpm install`，无需添加依赖或修改锁文件。`ios/` 工程进 git，Pods、DerivedData、xcuserdata 和复制出来的 `ios/App/App/public/` 不进 git。

首次创建工程用 `npx cap add ios`（已有 `ios/` 时不要重复）。每次更新内容后，在仓库根执行以下命令；**不要设置 `ATLAS_BASE` 为子路径**，原生包固定使用默认 `/`：

```bash
pnpm build && npx cap sync ios && npx cap open ios
```

模拟器可在 Xcode 选择 `App` scheme 和 iPad 后 Run，或直接构建。下例使用本次验收的 iPad Pro 13-inch (M5)；其他机器先用 `xcrun simctl list devices available` 查自己的 UDID：

```bash
xcodebuild -project ios/App/App.xcodeproj -scheme App \
  -destination 'platform=iOS Simulator,id=ED7AC183-F9B7-4784-9DF3-C5394AB51952' \
  -derivedDataPath ios/DerivedData CODE_SIGNING_ALLOWED=NO build
xcrun simctl boot ED7AC183-F9B7-4784-9DF3-C5394AB51952
xcrun simctl bootstatus ED7AC183-F9B7-4784-9DF3-C5394AB51952 -b
xcrun simctl install ED7AC183-F9B7-4784-9DF3-C5394AB51952 \
  ios/DerivedData/Build/Products/Debug-iphonesimulator/App.app
xcrun simctl launch ED7AC183-F9B7-4784-9DF3-C5394AB51952 pub.gavin.atlas
```

已启动的模拟器跳过 `boot`。截图：`xcrun simctl io <UDID> screenshot "$PWD/scripts/anatomy/cache/ipad/<name>.png"`；验收包括 EN 首页、aircon、ww2、fractions、muscles-chest 深链接、ZH 页面，以及横竖屏。

批量验收使用 `scripts/ipad/screenshot.mjs <截图名> <路径> <landscape|portrait>`，通过 Debug 专用的 `ATLAS_QA_PATH` / `ATLAS_QA_SCRIPT` 环境变量打开指定 bundle 页面并检查资源、字体、深链接和外部请求阻断；Release 不接受这些检查入口。脚本保留原始 `*-raw.png`，并将 CoreSimulator 固定竖屏 framebuffer 的横屏截图无损旋转为便于查看的 PNG；PNG 和 JSON 报告保存到 `scripts/anatomy/cache/ipad/`；`ATLAS_SIMULATOR` 可覆盖默认 UDID，`ATLAS_SPEECH_PROBE=1` 加做 EN / ZH 朗读探测。

先用 `AtlasOrientation` XCUITest scheme 旋转**模拟器设备本身**，再运行截图脚本；只请求窗口 scene 的 landscape geometry 会在 iPadOS 26 上得到竖屏设备中的横屏窗口。下面示例拍分数页横屏，竖屏换成 `testPortrait` 和 `portrait`：

```bash
xcodebuild -project ios/App/App.xcodeproj -scheme AtlasOrientation \
  -destination 'platform=iOS Simulator,id=ED7AC183-F9B7-4784-9DF3-C5394AB51952' \
  -derivedDataPath ios/DerivedData CODE_SIGNING_ALLOWED=NO \
  -only-testing:AppUITests/AtlasOrientationTests/testFullScreenMode \
  -only-testing:AppUITests/AtlasOrientationTests/testLandscape test
ATLAS_SPEECH_PROBE=1 node scripts/ipad/screenshot.mjs \
  fractions-landscape /en/topics/fractions/ landscape
```

壳支持横竖屏和可调整大小的 iPad 窗口，不使用已弃用的 `UIRequiresFullScreen`。需要全屏截图时，在模拟器 Settings → Multitasking & Gestures 选择 Full Screen Apps；Windowed Apps 下应按实际窗口大小验收布局。[Apple 全屏/窗口设置](https://support.apple.com/en-us/123635)、[适配说明 TN3192](https://developer.apple.com/documentation/technotes/tn3192-migrating-your-app-from-the-deprecated-uirequiresfullscreen-key)。

### 资源与离线边界

`pnpm build` 输出所有页面和 `public/` 资源；`cap sync` 将完整 `dist/` 复制到 App bundle。WKWebView 使用 `capacitor://localhost` 从包内读取文件，没有 `server.url`、后端或远程更新。Astro 的 directory 输出保留尾斜杠，原生资源处理器将 `/en/topics/aircon/` 等目录 URL 解析为对应 `index.html`，查询参数仍用于恢复章节和节拍。

`/topics/<slug>/data.json`、`/models/*.glb`、meshopt 解码代码、`/geo/*` 底图、字体和 `/illustrations/*` 都随包安装；首次打开任一主题也不需要缓存或联网。网页 PWA 的 service worker 在原生环境不注册。原生 bundle 资源处理器返回的 CSP 拒绝外部资源；导航（包括新窗口）和 `CapacitorHttp` 原生 HTTP 插件也禁止外部请求，只有本地 origin 和必要的 `data:` / `blob:` 资源可用；更新内容必须重新 build / sync / 安装。

构建后用 `rg -n 'https?://' dist` 审计 URL，再在断网状态打开上述页面并检查原生网络日志。模型元数据、来源链接、SVG 命名空间和第三方库的说明文字可能含 URL 字符串；不能把字符串搜索结果直接当作网络请求，也不能只靠搜索证明离线。实际加载地址必须全部落在 bundle，外部资源请求必须被壳阻止。

朗读沿用 Web Speech，原生壳在 document start 注入过滤器：`getVoices()` 只返回 `localService === true` 的语音，`speak()`（含静音预热）也只允许本地语音，无可用语音时不启动系统朗读。WebKit 枚举语音是异步的，初次空列表不代表不支持；检查脚本先有界等待语音列表。本次 iPad Pro 模拟器 EN / ZH 朗读均收到 `onstart` 和 `onend`，记录见 `scripts/anatomy/cache/ipad/fractions-landscape.json`。

语音由 iPadOS 提供，**语音文件不在 App bundle**。离线朗读取决于设备已经具备的本地 EN / ZH 语音，模拟器成功也不能代替真机断网验收。若要求连语音文件也随 App 交付，需要另行实现本地语音引擎。

### 免费 Apple ID 真机安装与 App Store

在 Xcode → Settings → Accounts 登录免费 Apple ID；连接并信任 iPad，按提示启用 Developer Mode。在 App target → Signing & Capabilities 打开 Automatically manage signing，Team 选择自己的 Personal Team，选择已连接 iPad 后 Run。若 Bundle ID 被其他团队占用，本地测试改成自己唯一的 ID。免费 Personal Team 的设备 provisioning profile **签发后 7 天到期**，届时重新连接 Xcode 构建安装；这是个人开发测试，不是 App Store 分发。[Apple 账户说明](https://developer.apple.com/help/account/basics/about-your-developer-account)、[Developer Mode](https://developer.apple.com/documentation/xcode/enabling-developer-mode-on-a-device)、[签名流程](https://help.apple.com/xcode/mac/current/en.lproj/dev60b6fbbc7.html)。

App Store 分发需要付费 Apple Developer Program、注册 Bundle ID、配置分发签名，在 Xcode Archive 后上传 App Store Connect；准备应用信息、iPad 截图、年龄分级、隐私说明和内容/资源许可，再提交 App Review。可先通过 TestFlight 做真机测试；模拟器免签构建不能直接提交商店。[Apple 分发说明](https://developer.apple.com/documentation/xcode/distributing-your-app-for-beta-testing-and-releases)、[App Store Connect 流程](https://developer.apple.com/help/app-store-connect/get-started/app-store-connect-workflow)、[App Review](https://developer.apple.com/app-store/review/)。

建议以后加入 `package.json` 的脚本（本次只记录，不修改 `package.json` / `pnpm-lock.yaml`）：

```json
{
  "ios:sync": "pnpm build && npx cap sync ios",
  "ios:open": "npx cap open ios",
  "ios:run": "pnpm build && npx cap sync ios && npx cap run ios"
}
```
