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
- [ ] `dist/` 里有 `sw.js`、`manifest.webmanifest`、`registerSW.js`、`_headers`、`icons/`
- [ ] `grep -c geo dist/sw.js` 里 geo 只出现在运行时缓存规则里，预缓存列表没有 `geo/*.json`、`models/*`

线上（预览或正式域名）：

- [ ] `curl -I https://<domain>/_astro/<任一 hash 文件>` 有 `immutable`；`/geo/land-50m.json` 是 `max-age=604800`；任一页有 `x-content-type-options: nosniff`、`x-frame-options: DENY`
- [ ] `/en/` 与 `/zh/` 都能打开，语言切换保持当前页和 `?ch=` 状态；`/` 跳到上次语言
- [ ] 两个示例主题（`sample-time`、`sample-space`）在两种语言下都能打开，舞台出画面，← → 换章
- [ ] 深链接还原状态：`/en/topics/sample-time/?ch=second-look&t=2000-03-01&hl=sample-meeting`、`/en/topics/sample-space/?ch=pull-apart&cut=half`
- [ ] DevTools → Application：manifest 无报错，service worker 已激活；Network 勾 Offline 后刷新页面仍能打开已访问过的主题（地图底图需先看过一次才有缓存）
- [ ] Network 里没有任何第三方域名请求

关于草稿：索引页**只列 `status: published` 的主题**，没有任何草稿或状态标签。`draft` / `ready` 主题（两个示例主题就是草稿）照常构建，直接输入 URL（`/en/topics/sample-time/` 等）可进入，开发和 e2e 用；它们不出现在索引页，也不计入类别数量（没有已发布主题的类别显示“即将推出”）。要公开一个主题，把它改成 `status: published`。
