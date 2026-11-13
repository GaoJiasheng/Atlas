# Atlas 上架清单（App Store Connect）

所有要粘贴的文字都在 `listing.md`，截图在 `screenshots/`。按顺序做，打勾即可。

## 0. 提交前（11-13 已备好）

- [x] 年龄分级：Gavin 11-13 定为如实填写，结果 **13+**（依据见 `listing.md`「Age rating」）
- [x] 隐私政策页 `https://atlas.gavin.pub/privacy/`、支持页 `https://atlas.gavin.pub/support/` 已上线，中英双语，联系邮箱 gaojiasheng.him@gmail.com
- [x] 截图 11-13 按 build 10 之后的 main 重拍
- [ ] 确认 **build 10** 在 App Store Connect → TestFlight 里显示「已完成处理」（Gavin 11-13 已上传）

## 1. 新建 App

App Store Connect → Apps → 「+」→ New App

- [ ] Platform：iOS
- [ ] Name：`Atlas: Visual Textbook`（被占用就用 `listing.md` 里的备选）
- [ ] Primary Language：English (U.K.)
- [ ] Bundle ID：`pub.gavin.atlas`
- [ ] SKU：`atlas-ipad`
- [ ] User Access：Full Access

## 2. App Information

- [ ] Subtitle：粘贴英文副标题
- [ ] Category：Primary **Education**，Secondary **Reference**
- [ ] Content Rights：选「包含第三方内容」，并确认你有权使用（来源和许可见 `THIRD-PARTY-NOTICES.md`、`LICENSE-CONTENT`）
- [ ] Age Rating → Edit：按 `listing.md` 的表逐项填，确认结果
- [ ] **不要**勾选 Kids Category（儿童类别）
- [ ] 右上语言切换 → 添加 **Chinese (Simplified)**，填中文名称和副标题

## 3. Pricing and Availability

- [ ] 价格：**Free**，不做 App 内购买（内容是 CC BY-NC-SA，不能商用）
- [ ] 地区：至少包含 Singapore，其余按需要

## 4. App Privacy

- [ ] Privacy Policy URL：`https://atlas.gavin.pub/privacy/`
- [ ] Get Started → 选「No, we do not collect data from this app」
- [ ] 点 **Publish**（这一步容易漏）

## 5. 版本页（1.0）：English (U.K.)

- [ ] Previews and Screenshots → **iPad 13-inch**：按编号拖入 `screenshots/en/` 的 8 张
- [ ] （可选）iPad 12.9-inch：拖入 `screenshots/en-12.9/`。不传也行，Apple 会用 13 英寸的缩放
- [ ] Promotional Text、Description、Keywords：粘贴
- [ ] Support URL：`https://atlas.gavin.pub/support/`
- [ ] Marketing URL：`https://atlas.gavin.pub/en/`
- [ ] Copyright：`2026 你的开发者账号法定名称`
- [ ] What's New：首次发布不显示这一栏，跳过

## 6. 版本页（1.0）：简体中文

- [ ] 语言切到 Chinese (Simplified)
- [ ] iPad 13-inch：拖入 `screenshots/zh/` 的 8 张
- [ ] 推广文本、描述、关键词：粘贴
- [ ] Support URL、Marketing URL：同上（Marketing 可换成 `https://atlas.gavin.pub/zh/`）

## 7. 选 Build 和合规

- [ ] Build → 「+」→ 选 **build 10**
- [ ] 加密问题：`Info.plist` 已声明无非豁免加密，一般不会再问；如果问，选 None of the algorithms mentioned above

## 8. App Review Information

- [ ] Sign-in required：**不勾选**
- [ ] Contact：填你的姓名、电话、邮箱（gaojiasheng.him@gmail.com）
- [ ] Notes 粘贴：

```
Atlas is a self-contained bilingual (English/Chinese) visual textbook. All content ships in the app bundle. It has no accounts, no network requests, no ads and no in-app purchases, so no demo account is needed. To review: open any topic on the home page, then use Next/Back or the chapter bar at the bottom. History topics describe war factually in text and maps, which is reflected in the age rating.
```

## 9. 发布方式与提交

- [ ] Version Release：建议选 **Manually release**，过审后自己点发布
- [ ] 回到顶部 **Add for Review** → **Submit for Review**
- [ ] 过审后：在商店页确认名称、截图、分级显示无误，再点发布
