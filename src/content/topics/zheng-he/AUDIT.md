# 郑和下西洋：事实与构建核查

日期：2026-10-27。范围：draft 内容，不是发布签收。主证据为只读准备档案 `art/research/zheng-he/` 的 facts.json（ZH-F01—52）、facts-extra.json（ZH-X01—02）、sources.json、datasets.json、spec-beats.json、INVENTORY 与批准插画。运行时 source id 去前导零（S01→S1），其余对应不变；30 条来源，15 个实际用词，完整事实索引在 [FACTS.md](FACTS.md)。不把编辑研究或课纲材料冒充航次证据。

## 事实处置（中文摘要）

| 事实组 | 采用／限制 | 位置 |
|---|---|---|
| F01、F05—11 | 七航次用通常的年份范围；第二航次不同资料有 1407／1408 开始，采用 S1 1407—1409，source note 保留差异；第七航次区分 1430 颁诏与 1431—1433 航行 | 各章、事件、40 拍 |
| F02—04 | 穆斯林家庭、原名马和、童年被明军俘获及阉割，强制服役；不写确切年龄 | 01 ¶1—2 |
| F12—17、F52 | 港口、各种船员、外交／军事／贸易、马六甲仓储；Wade 的支配解释与 Columbia 解释署名 | 01、03、04、06 |
| F14 | 317／约 208 艘各附本源，无平均；正文只称数百艘、数万人 | 01 细看 |
| F18—19 | 5,000 与 170 都是明方记录经 Wade 引述，不是独立核实；未知损失不写 0 | 02 ¶2—3、字幕、两个事件及索引 |
| F20—21 | 锡兰统治者及家人、苏门答剌争位者被俘送中；地点不冒充战场／宫殿；解释并列不抹去俘虏 | 03—04 |
| F22—24、X02 | 尹庆 1403、五／七次访问争论、马来当地利益；Wang Gungwu 只读公开摘要，未读全文 | 00、03 |
| F25—30 | 淡马锡图名与考古非个人登陆；后出图非同年现场测图；加勒为发现地；碑文日期非安装日；中文献佛与其他语言不混同 | 00、03、07 |
| F31—35、X01 | 长颈鹿来自孟加拉国王，宫廷以麒麟解释；东非各港与斯瓦希里主体性；基尔瓦背景非确认访问；丝绸瓷器仅商品类别 | 04—05 与图注 |
| F36—38 | 大船论据与工程反对同列；137×56 与61—76米均不选定；罗盘、观星与文字知识并用 | 01 |
| F39—42、F51 | 国家远航与贸易分开；死亡地点不确定；现代季风说明不是明代观测；不派生风场或航速 | 06—07 |
| F43—44 | 唐代沉船证明更早交换；可能阿拉伯建造、最后中国出发港未定 | 00 |
| F45—49 | 用于作者结构、证据解释和课纲外定位，不输出儿童调查、分数或练习流 | spec 与编辑说明 |
| F50 | 来源页面区分主队／可能支队，原 SVG 403，禁止从图例或镜头发明航线 | 全题 movements=[] |

施工时额外重读公开的 [Wade PDF](https://ari.nus.edu.sg/wp-content/uploads/2018/10/wps04_031.pdf) 纸页 3、14—16，核童年阉割、旧港／爪哇死亡报告、锡兰俘虏；重读 [Columbia 教学页](https://afe.easia.columbia.edu/special/china_1000ce_mingvoyages.htm) 七次航行与准备船队段。Columbia 明确写锡兰俘虏后来获释，正文保留归属；它只写旧港首领被送惩处，未将未核到的处决细节写成事实。Columbia 的巨大船尺寸和确定海葬、Mariners 页的部分帝王时间叙述均未照搬。没有超过 25 词的来源逐字引文。

## 地理与许可

30 个事件全部复制 17 个已预取点的原始坐标，旧港／爪哇／加勒／孟加拉／苏门答剌／基尔瓦的角色逐项限定；5 个 entity 是叙事分组，不是重建国家或军事联盟。9 个控制帧全部为空。单测验证精确锚点归属，不以最近点猜测。完整逐帧来源、原始哈希、许可、命令在 [data/SOURCES.md](data/SOURCES.md) 与 [SOURCES-GEO.md](../../../../scripts/geo/zheng-he/SOURCES-GEO.md)。

海岸固定准备档案的 D01 SHA，而非试跑的 world-atlas；500 m DP、clean、1 km² 岛阈值、1,000,000 量化；363,634 bytes，1,034 环，0 零面积、0 自交。原始数据不进 PWA。已检查静态 [source/runtime comparison](../../../../scripts/geo/zheng-he/evidence/coastline-comparison.png)，不是应用截图；残差不适用，因为没有配准工作。港口底层 PD+CC BY；说明与选择为原创 NC-SA，没有不兼容的 share-alike 合并，也没有需要新增例外的第三方图像。

## 图像检查

封面与两幅章图均为准备批准 PNG，经既有 illustrate.ts 生成 WebP，未调用新生成。已打开原图视觉检查：封面一船三桅三帆、独立舵；长颈鹿四肢、两耳、两角状突起、尾；一罐一碗一卷丝绸。保留代表性示意图边界，不作为出土实物或当时场景。输出：800／1600 方图约88／253 KB；1200×900 长颈鹿约80 KB、货物约101 KB。图注、替代文字中英俱全。

## 技术验收与偏离

保留新引擎项 0，无共享引擎变更；没有未合并分支依赖。章 state 对齐首拍，修正南京出发事件镜头。当前 TimeScene 没有准备稿假定的自定义 PLATE／readerEnd 索引，使用现有 note、年份轴及 More+FlyTo 证据索引，不增加 schema 或交互引擎。索引不直接打开交互 inspector；限制在 REVIEW.md 明示。来源 S1—S30 满足既有 id schema；部分只作编辑／参考仍在目录明确标注。

浏览器门槛由 BUILD brief 明确要求跳过，留主会话 port 5447；未使用用户桌面或浏览器。静态地图、单元投影检查不能替代 UI 标签、手机、语音、触控和性能验收。最终命令结果在下方随收口记录。

### 最终门槛结果

| 命令／检查 | 结果 |
|---|---|
| `pnpm check` | exit 0；765 文件，0 error / 0 warning；3 个既有 unused-variable hints（warring-states 两个脚本与 space-scene/sim.test.ts），非本题 |
| `pnpm validate`（最终） | 58 topics，0 error / 0 warning |
| `pnpm test`（全量） | 161 files、4,285 tests 全部通过 |
| `pnpm test tests/zheng-he.test.ts`（最终内容索引后） | 1 file、8 tests 全部通过 |
| `pnpm build` | exit 0；119 static pages；PWA 完成。Vite 提醒既有共享 chunks 超过 500 kB，本题无新增运行时 JS，不修改引擎来处理共享预算 |
| 构建产物静态检查 | EN/ZH 各 8 个 chapter bodies、2 个 figure、8 个章节索引；data 30 events、0 movements、9 空帧 |
| 几何与图片 | 1,034 环、0 零面积／自交；静态海岸对照及批准 PNG 已查看；原始大数据未入 public |
| `pnpm shoot` / `pnpm e2e` | **按 BUILD brief 跳过**；7 项 e2e 已写未执行；主会话 `ATLAS_E2E_PORT=5447`。不宣称 UI／性能／语音已通过 |

全部文件留工作树，未提交；未改 package.json、lockfile、review-queue、next-batch、其他主题正文、首页 smoke 数或许可总文件。
