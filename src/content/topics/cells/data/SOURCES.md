# 细胞 · 数据与来源 / Cells provenance

2026-10-29。父 dossier：主 checkout `art/research/cells/{facts.json,facts-extra.json,beats-plan.json,syllabus-verification.json}`。生产来源统一去掉前导零：S01→S1，S20 保持不变。以下给出可复核事实映射；科学文字是独立释义，不是原书逐段翻译。

## 派生文件、许可与方法

| 文件 | 来源及方法 | 许可家族 |
|---|---|---|
| `chapters/*.mdx`、`glossary.json` | S1 课纲两条短引；S3–4 事实释义；S6–8 仪器观察；S22–24 视野与洋葱反例；S14–16 术语 | Atlas 原创及兼容的 CC BY-NC-SA 4.0；引文权利不变 |
| `parts.json` | Atlas 原创程序化几何；S4 科学结构、S7 仪器布局、S17–18 公有领域示意作参考；未导入外部网格、SVG 或页面文字 | Atlas CC BY-NC-SA 4.0；不混入 CC BY-SA 网格 |
| 显微视野 patterns/config | 位置、大小、深度、数量均为 S20 教学设计；S3 倒像、S7 总倍数、S22 视野公式，S23–24 洋葱观察边界 | 原创 Atlas CC BY-NC-SA 4.0；不是实测显微影像 |
| 封面 cells、图 cells-microscope | 本任务生成并规范化，主会话处理、查看；原始 prompt 与检查在 `art/planned/cells/` | Atlas 生成资产，CC BY-NC-SA 4.0 |
| 图 cells-systems-link | 复用原生生成图 `art/planned/heart-and-lungs/heart-and-lungs.png`，主会话规范化并查看；没有复用人体解剖 mesh | Atlas 生成资产，CC BY-NC-SA 4.0 |

无地图、测量数据集、在线图片或运行时外部请求。没有新增需独立 carve-out 的 BY-SA、ODbL 或 ODC-BY 资产。OpenStax 当前书级许可由缓存前言核为 CC BY-NC-SA 4.0；未导入个别图片。S24 仅用事实，不导入 CC BY-NC 教材资产。各来源许可局限保留于 sources.json，不把可访问误当作开放许可。

## 课纲与观察边界

S1 原件缓存 SHA-256：`0556023ceb55fe80de75ae044011b8c77ea7ea494a1873d2b224a9b2b8083ab0`。印 43/PDF44 与印 56/PDF57 的两条目标逐字核对，共 20 英文词。全文审计没有 Cell System、microscope、chloroplast、vacuole、cytoplasm、nucleus。2023 核心为生命基本单位；细胞精细结构与显微镜为用户要求的深化。S2 旧纲只保留作历史来源，不冒充 2023 年要求。

洋葱反例仅指非绿色鳞茎表皮，不推广到洋葱全部组织；S24 正文明确无叶绿体，S23 说明膜与薄层细胞质难观察。不照搬 S24 关于淀粉储藏的附带说法。模型可标结构，视野不假装能分辨膜的独立线。液泡有水与溶解物质，不是空气洞；动物省略小液泡/囊泡不等于动物没有。核不固定居中。

## F-id → 生产来源

| 事实 | 来源 | 经过限定的主张 |
|---|---|---|
| F-C01 | S1 | 2023 P5 Standard reproduction explicitly includes recognising a cell as a basic unit of life. |
| F-C02 | S1 | The cached 87-page 2023 syllabus has no Cell System section and no microscope, chloroplast, vacuole, cytoplasm or nucleus terms. Detailed cell-part coverage is user-requested enrichment, not a stated 2023 outcome. |
| F-C03 | S1 | P4 plant outcomes identify leaf, stem and root and their functions; link this topic to plant. |
| F-C04 | S1 | P4 covers digestive-system parts and functions. P5 Standard links digestion, respiration and circulation in life processes and compares transport in plants and humans. |
| F-C05 | S2 | 2014 syllabus Cell System (P5/P6 Standard) named plant cell wall, membrane, cytoplasm, nucleus, chloroplasts, and animal membrane, cytoplasm, nucleus; specialised cell knowledge was not required. |
| F-B01 | S3 | A cell is a basic unit of life; organisms may consist of one cell or many. |
| F-B02 | S3 | Most cells need a microscope to be seen individually; there are exceptions, so avoid saying every cell is invisible unaided. |
| F-B03 | S3 | Groups of similar cells with a shared function form tissues; tissues form organs, and organs participate in systems. |
| F-B04 | S4 | Both typical plant and animal cells have a cell membrane, cytoplasm and nucleus. |
| F-B05 | S4 | The cell membrane separates inside from outside and regulates substance passage. |
| F-B06 | S4 | Cytoplasm occupies the cell region outside the nucleus; its gel-like component supports many chemical reactions. |
| F-B07 | S4 | The nucleus holds most of the cell’s genetic instructions and helps direct cell activities. |
| F-B08 | S4 | A plant cell wall is outside its cell membrane and provides structural support and protection. |
| F-B09 | S4 | Chloroplasts are sites of photosynthesis and contain chlorophyll; the green plant-cell example is a photosynthetic cell, not every plant cell. |
| F-B10 | S4 | A mature plant cell often contains a large central vacuole with aqueous contents and dissolved substances. |
| F-B11 | S4 | The large central vacuole contributes to plant-cell water balance and pressure against the wall; it is not an air-filled hole. |
| F-B12 | S4 | Animal cells do not have cell walls or chloroplasts; small vacuoles/vesicles can occur, so never teach that animal cells have no vacuoles. |
| F-B13 | S4 | Plant cells as well as animal cells have mitochondria; chloroplasts do not replace all the other cell machinery. |
| F-M01 | S3 | In a conventional compound light microscope the viewed image is inverted; moving the slide right makes the viewed image move left. |
| F-M02 | S3 | Magnification enlarges the apparent image; resolution concerns distinguishing adjacent structures. Enlarging an image does not guarantee more detail. |
| F-M03 | S3 | Many cells have little natural contrast, and staining can help distinguish structures; a drawing is not the same as a light-microscope observation. |
| F-M04 | S7 | Total magnification equals eyepiece magnification times objective magnification. |
| F-M05 | S7 | A compound microscope has an eyepiece, objective turret, stage with slide, condenser beneath the stage and illuminator below. |
| F-M06 | S6 | Carry using two hands, one at the arm and one supporting the base, following the teacher’s instructions for the actual microscope. |
| F-M07 | S6 | Start with the lowest-power objective and low stage; view from the side when changing stage clearance and keep objective and slide apart. |
| F-M08 | S6 | Use fine adjustment at high power; large coarse movements risk hitting the slide. Centre the specimen before increasing power. |
| F-M09 | S6 | Clean microscope lenses using appropriate lens paper; do not touch optical surfaces. |
| F-M10 | S8 | A thin specimen and suitable contrast matter in transmitted-light microscopy. |
| F-M11 | S8 | Changing focus brings different depths into view; a thick specimen is not all sharply visible at once. |
| F-M12 | S8 | Pondweed chloroplasts occur in peripheral cytoplasm between the cell membrane and vacuole, including near and far surfaces. |
| F-E01 | S24 | Underground onion-bulb epidermis is a useful plant-cell comparison lacking visible chloroplasts, unlike a green pondweed leaf. |
| F-R01 | S10 | Reported learner ideas include a nucleus always in the centre and chloroplasts in all plant cells. |
| F-R02 | S11 | A published inclusive-classroom case study reports 2D shape interpretations and fixed organelle-position/colour ideas. |
| F-R03 | S9 | MOSART lists the idea that bigger organisms must have bigger cells as a life-science misconception. |
| F-SG01 | S12 | Science Centre Singapore’s 2018 DNA Lab booklet described a Diversity of Cells session involving compound-microscope parts and prepared slides. |
| F-SG02 | S13 | NParks lists Allium cepa as onion, 洋葱 / 葱头, an edible bulb and cultivated non-native plant in Singapore. |
| F-L01 | S5 | The current OpenStax Biology 2e preface states CC BY-NC-SA 4.0, although older OpenStax copies may state CC BY. |
| F-L02 | S17 | Commons LadyofHats plant and animal SVGs are public-domain anatomy references; the Commons description-page text has a separate CC BY-SA licence. |
| F-REP01 | S20 | plant, living-things, digestive-system and heart-and-lungs are all published SpaceScene topics; they are cross-links, not sibling splits. |
| F-REP02 | S20 | The repository has sim controls, predictions, records, poses, offsets, visibility and shift bindings; the inspected model registry has no microscope model or microscope-field overlay. |
| F-D01 | S20 | Atlas microscope design uses eyepiece 10×, dry objectives 4×/10×/40× and an 18 mm field number; computed total powers are 40×/100×/400×. These are design choices, not a specific instrument’s measurements. |
| F-D02 | S20 | With that design, field diameter is 18000/objective μm: 4500, 1800, 450 μm. An object with a 100 μm span takes 2.222…, 5.555… or 22.222… percent of field diameter. |
| F-D03 | S20 | The focus demonstration uses chosen tolerance widths 20/8/2 μm for the three objectives and a linear clarity proxy; it is not a calibrated optical depth-of-field model. |
| F-D04 | S20 | All specimen positions, dimensions, counts, opacity and blur mappings are authored teaching geometry, not microscopy observations or biodiversity data. |
| F-D05 | S20 | The two art cell models have one nucleus each; plant cover has six illustrative peripheral chloroplasts and one large vacuole. Counts are drawing choices, not universal biology. |
| F-D06 | S20 | The planned microscope has one eyepiece and three objectives; sizes are generic design-study geometry. All cell-model scale changes are explicitly marked and no continuous anatomical zoom through a real microscope is implied. |
| F-X01 | S22 | For a circular microscope field, object-field diameter is field number divided by objective magnification; field number is specified in millimetres. |
| F-X02 | S23 | In the prepared onion-bulb teaching specimen, membranes and peripheral cytoplasm are difficult to observe directly; use diagrams/models to explain their positions instead of claiming every part is optically resolved. |

## 40 拍证据索引

每拍生产 state 完整设置七个显微控件；拍 id 保留在下表，生产 schema 用数组顺序表达拍号。00.1 改为实际展示叶，00.2 展示组织而非隐藏对应对象；说明模型与视野按 field-on 分开。

| 拍 | 父事实 | 生产来源 |
|---|---|---|
| 00.1 context-leaf | F-C01, F-C03, F-B01, F-B03, F-D04, F-D06 | S1, S3, S20 |
| 00.2 context-tissue | F-B03, F-C03 | S1, S3 |
| 00.3 two-cells | F-B01, F-B04, F-D04 | S3, S4, S20 |
| 00.4 shared-parts | F-B04 | S4 |
| 00.5 model-and-view | F-M03, F-M11 | S3, S8 |
| 01.1 carry-and-place | F-M06 | S6 |
| 01.2 low-objective | F-M07, F-D06 | S6, S20 |
| 01.3 slide-and-light | F-M05, F-M10 | S7, S8 |
| 01.4 fine-focus | F-M08 | S6 |
| 01.5 finish-safely | F-M07, F-M09 | S6 |
| 02.1 membrane-outline | F-B05 | S4 |
| 02.2 membrane-passage | F-B05, F-D04 | S4, S20 |
| 02.3 cytoplasm-open | F-B06 | S4 |
| 02.4 nucleus-open | F-B07 | S4 |
| 02.5 cell-volume | F-R02, F-D04 | S11, S20 |
| 03.1 wall-outline | F-B08 | S4 |
| 03.2 membrane-inside | F-B05, F-B08 | S4 |
| 03.3 chloroplasts | F-B09 | S4 |
| 03.4 vacuole | F-B10, F-B11 | S4 |
| 03.5 peripheral-nucleus | F-B10, F-R01, F-D04 | S4, S10, S20 |
| 04.1 predict-chloroplast | F-R01, F-E01 | S10, S24 |
| 04.2 onion-view | F-E01, F-M03, F-SG02 | S3, S13, S24 |
| 04.3 pondweed-view | F-M12, F-B09 | S4, S8 |
| 04.4 prepared-cheek-view | F-B12, F-M03 | S3, S4 |
| 04.5 compare-evidence | F-B04, F-B08, F-R02 | S4, S11 |
| 05.1 objective-and-ocular | F-M04, F-D01 | S7, S20 |
| 05.2 forty-total | F-D01 | S20 |
| 05.3 four-hundred-total | F-D01, F-D02 | S20 |
| 05.4 inverted-motion | F-M01 | S3 |
| 05.5 focus-not-growth | F-M02, F-D03 | S3, S20 |
| 06.1 start-low | F-M07, F-D04 | S6, S20 |
| 06.2 centre-target | F-M08, F-D04 | S6, S20 |
| 06.3 increase-power | F-D02, F-M08 | S6, S20 |
| 06.4 fine-refocus | F-M11, F-D03 | S8, S20 |
| 06.5 record-same-specimen | F-D02, F-D03, F-D04 | S20 |
| 07.1 cells-to-organs | F-B03 | S3 |
| 07.2 plant-link | F-C03, F-REP01 | S1, S20 |
| 07.3 heart-lung-link | F-C04, F-REP01 | S1, S20 |
| 07.4 digestive-link | F-B03, F-C04, F-REP01 | S1, S3, S20 |
| 07.5 living-things-link | F-B01, F-REP01 | S3, S20 |

## 名词凭据

细胞、组织、器官：S3；膜、质、核、壁、叶绿体、叶绿素、液泡：S4；显微镜：S3；目镜、物镜、放大率：S7/S3；载玻片、盖玻片：S6。中文词形用 S14 繁转简，并用 S15/S16 核对简体用例。香港教育局词表不是新加坡 MOE 官方译名。生产名词表 16 项，正文每项只在 EN/ZH 首次出现各标一次。

## 编号来源

## Numbered sources

<!-- sources:begin (generated by scripts/sources-md.ts from sources.json; edit sources.json) -->
- [S1] Singapore MOE. Science Teaching & Learning Syllabus, Primary Three to Six, 2023 (updated Jan 2026). / 新加坡教育部，2023 小学科学教学与学习课纲（2026 年 1 月更新）。 (Printed pp.43,53–57; PDF page = printed + 1; cached original verified locally. Accessed 2026-10-29. Reference only; no open asset permission established. Cached original SHA-256 0556023ceb55fe80de75ae044011b8c77ea7ea494a1873d2b224a9b2b8083ab0. PDF pp.44/57 = printed pp.43/56. Two exact outcomes quoted, 20 unique words total. Detailed Cell System and microscope terms are absent in the cached 2023 syllabus. Live human-verification page was not bypassed. / 定位：Printed pp.43,53–57; PDF page = printed + 1; cached original verified locally。核查日期：2026-10-29。本地缓存原件经逐字核对；PDF 第 44/57 页对应印刷第 43/56 页。仅引用两条目标，英文共 20 词。未把旧纲 Cell System 当作 2023 年详细要求；没有绕过验证页面。仅作事实或术语参考；不据此复制未核开放许可的资产。) — https://www.moe.gov.sg/api/media/ba3562d3-5b31-4459-8693-45cde7b97273/Primary-Science-Syllabus-2023_May24.pdf
- [S2] Singapore MOE. Primary Science Syllabus, implementation from 2014. / 新加坡教育部，2014 年起实施的小学科学课纲。仅用于历史对照。 (Printed p.38, Cell System (P5 and P6 Standard); search-index text only, historical comparison. Accessed 2026-10-29. Reference only; no open asset permission established. / 定位：Printed p.38, Cell System (P5 and P6 Standard); search-index text only, historical comparison。核查日期：2026-10-29。仅作事实或术语参考；不据此复制未核开放许可的资产。) — https://www.moe.gov.sg/-/media/files/primary/science-primary-2014
- [S3] OpenStax / Rice University. Biology 2e §4.1 Studying Cells. / OpenStax / 莱斯大学，《生物学》第 2 版，第 4.1 节：研究细胞。 (Introduction, Microscopy, Light Microscopes, Cell Theory. Accessed 2026-10-29. CC BY-NC-SA 4.0 (current preface; individual figure credits may differ). Cached HTML reread during content build. No OpenStax illustration imported; scientific explanations paraphrased, current attribution retained. / 定位：Introduction, Microscopy, Light Microscopes, Cell Theory。核查日期：2026-10-29。施工时重新读取本地 HTML。科学解释用自写释义，保留当前 CC BY-NC-SA 4.0 归属；未导入原书插图。) — https://openstax.org/books/biology-2e/pages/4-1-studying-cells
- [S4] OpenStax / Rice University. Biology 2e §4.3 Eukaryotic Cells. / OpenStax / 莱斯大学，《生物学》第 2 版，第 4.3 节：真核细胞。 (Plasma Membrane, Cytoplasm, Nucleus, Vacuoles and Vesicles, Chloroplasts, Cell Wall. Accessed 2026-10-29. CC BY-NC-SA 4.0 (current preface; individual figure credits may differ). Cached HTML reread during content build. No OpenStax illustration imported; scientific explanations paraphrased, current attribution retained. / 定位：Plasma Membrane, Cytoplasm, Nucleus, Vacuoles and Vesicles, Chloroplasts, Cell Wall。核查日期：2026-10-29。施工时重新读取本地 HTML。科学解释用自写释义，保留当前 CC BY-NC-SA 4.0 归属；未导入原书插图。) — https://openstax.org/books/biology-2e/pages/4-3-eukaryotic-cells
- [S5] OpenStax / Rice University. Biology 2e Preface: About OpenStax resources. / OpenStax / 莱斯大学，《生物学》第 2 版前言：资源许可。 (Customization; current book-level licence. Accessed 2026-10-29. CC BY-NC-SA 4.0. Cached HTML reread during content build. No OpenStax illustration imported; scientific explanations paraphrased, current attribution retained. / 定位：Customization; current book-level licence。核查日期：2026-10-29。施工时重新读取本地 HTML。科学解释用自写释义，保留当前 CC BY-NC-SA 4.0 归属；未导入原书插图。) — https://openstax.org/books/biology-2e/pages/preface
- [S6] SUNY teaching laboratory manual / Lumen Learning. Microscope, Biology I Laboratory Manual. / SUNY / Lumen，《生物学实验手册》：显微镜。 (Rules and Instructions for using Compound Light Microscopes; page attribution. Accessed 2026-10-29. Reference only; page-level open licence not independently verified; no asset download. / 定位：Rules and Instructions for using Compound Light Microscopes; page attribution。核查日期：2026-10-29。仅作事实或术语参考；不据此复制未核开放许可的资产。) — https://courses.lumenlearning.com/suny-biolabs1/chapter/microscope/
- [S7] Columbia University Histology Laboratory. Microscope. / 哥伦比亚大学组织学实验室：显微镜结构与使用。 (Stand, optical system and method of use. Accessed 2026-10-29. Reference only; no open asset permission established. / 定位：Stand, optical system and method of use。核查日期：2026-10-29。仅作事实或术语参考；不据此复制未核开放许可的资产。) — https://histologylab.ctl.columbia.edu/microscope/
- [S8] Science & Plants for Schools / University of Cambridge. Teaching Microscopy Using Plants. / 剑桥大学 Science & Plants for Schools：利用植物教授显微观察。 (Article 1 and pondweed video description; Article 2 specimen preparation; text read, cookie-gated videos skipped. Accessed 2026-10-29. Reference only; no open asset permission established. / 定位：Article 1 and pondweed video description; Article 2 specimen preparation; text read, cookie-gated videos skipped。核查日期：2026-10-29。仅作事实或术语参考；不据此复制未核开放许可的资产。) — https://www.saps.org.uk/growth-hub/teaching-microscopy-using-plants/
- [S9] Harvard-Smithsonian Center for Astrophysics, MOSART. Misconceptions: life science. / 哈佛－史密松天体物理中心 MOSART：生命科学常见误解。 (Elementary life science list; organism size and cell size; public page only. Accessed 2026-10-29. Reference only; no open asset permission established. / 定位：Elementary life science list; organism size and cell size; public page only。核查日期：2026-10-29。仅作事实或术语参考；不据此复制未核开放许可的资产。) — https://waps.cfa.harvard.edu/mosart/misconceptions.php
- [S10] Mustafa Ürey & Muammer Çalık, APFSLT 9(2), article 12, 2008. Combining different conceptual change methods within 5E model: a sample teaching design of cell concept and its organelles. / Ürey 与 Çalık，2008 年细胞概念教学设计研究，附录 2。 (Appendix 2: misconception list; use for reported ideas, not all its corrective explanations. Accessed 2026-10-29. Reference only; no open asset permission established. / 定位：Appendix 2: misconception list; use for reported ideas, not all its corrective explanations。核查日期：2026-10-29。仅作事实或术语参考；不据此复制未核开放许可的资产。) — https://www.eduhk.hk/apfslt/v9_issue2/muammer/muammer8.htm
- [S11] Journal of Biological Education / original research authors. Contribution of 3D modelling and printing to learning in primary schools: a case study with visually impaired students from an inclusive Biology classroom. / 《生物教育杂志》：融合课堂中利用三维模型学习细胞的个案研究。 (Results: student knowledge before 3D modelling; public indexed results, not a Singapore prevalence study. Accessed 2026-10-29. Reference only; no open asset permission established. / 定位：Results: student knowledge before 3D modelling; public indexed results, not a Singapore prevalence study。核查日期：2026-10-29。仅用公开索引结果支持写作关注点，不推断新加坡发生比例或教学因果效果。) — https://www.tandfonline.com/doi/full/10.1080/00219266.2022.2118352
- [S12] Science Centre Singapore. DNA Learning Lab booklet 2018. / 新加坡科学馆，2018 年 DNA Learning Lab 手册。仅作历史教学背景。 (Printed pp.3–4 / PDF pp.3–4, Diversity of Cells; historical programme, not current booking advice. Accessed 2026-10-29. Reference only; no open asset permission established. / 定位：Printed pp.3–4 / PDF pp.3–4, Diversity of Cells; historical programme, not current booking advice。核查日期：2026-10-29。仅作事实或术语参考；不据此复制未核开放许可的资产。) — https://www.science.edu.sg/docs/default-source/scs-documents/for-schools/dnabooklet_2018.pdf
- [S13] NParks Flora & Fauna Web. Allium cepa L.. / 新加坡国家公园局 Flora & Fauna Web：洋葱。 (Common names, Local Conservation Status, Ethnobotanical Uses. Accessed 2026-10-29. Reference only; no open asset permission established. / 定位：Common names, Local Conservation Status, Ethnobotanical Uses。核查日期：2026-10-29。仅作事实或术语参考；不据此复制未核开放许可的资产。) — https://www.nparks.gov.sg/florafaunaweb/flora/5/9/5931
- [S14] Hong Kong Education Bureau. An English-Chinese Glossary of Terms Commonly Used in Teaching Science (S1–3), 2017. / 香港教育局，2017 年初中科学英汉词汇表。繁体词形明确转换为简体。 (Alphabetical entries; cached PDF read locally; printed Arabic page = PDF page − 5; traditional forms converted explicitly. Accessed 2026-10-29. Reference only; no open asset permission established. / 定位：Alphabetical entries; cached PDF read locally; printed Arabic page = PDF page − 5; traditional forms converted explicitly。核查日期：2026-10-29。仅作事实或术语参考；不据此复制未核开放许可的资产。) — https://www.edb.gov.hk/attachment/en/curriculum-development/kla/science-edu/ref-and-resources/SciGlossary_2017.pdf
- [S15] 厦门大学生命科学学院. 崔勇教授团队揭示植物细胞中液泡生物发生的机制. / 厦门大学生命科学学院，植物细胞液泡发生研究报告。仅作简体术语凭据。 (2025-03-25 research report; simplified 液泡、细胞器、细胞内、细胞; terminology only. Accessed 2026-10-29. Reference only; no open asset permission established. / 定位：2025-03-25 research report; simplified 液泡、细胞器、细胞内、细胞; terminology only。核查日期：2026-10-29。仅作事实或术语参考；不据此复制未核开放许可的资产。) — https://life.xmu.edu.cn/info/1045/30692.htm
- [S16] KEYENCE China, manufacturer terminology resource. 光学显微镜. / 基恩士中国：光学显微镜词汇。仅作术语凭据，不推荐产品。 (Structure and limitations; lexical evidence only, no product recommendations. Accessed 2026-10-29. Reference only; no open asset permission established. / 定位：Structure and limitations; lexical evidence only, no product recommendations。核查日期：2026-10-29。仅作事实或术语参考；不据此复制未核开放许可的资产。) — https://www.keyence.com.cn/ss/products/microscope/microscope_glossary/optical_microscopes/
- [S17] Mariana Ruiz / LadyofHats, Wikimedia Commons. Plant cell structure-en.svg. / Mariana Ruiz / LadyofHats，植物细胞结构 SVG，维基共享资源。 (File description and licensing; reference only. Accessed 2026-10-29. Public domain (author dedication); Commons page text CC BY-SA is separate. / 定位：File description and licensing; reference only。核查日期：2026-10-29。只作公有领域结构参考；未复制维基页面的 CC BY-SA 说明文字或导入图像。) — https://commons.wikimedia.org/wiki/File:Plant_cell_structure-en.svg
- [S18] Mariana Ruiz / LadyofHats, Wikimedia Commons. Animal cell structure en.svg. / Mariana Ruiz / LadyofHats，动物细胞结构 SVG，维基共享资源。 (File description and licensing; reference only. Accessed 2026-10-29. Public domain (author dedication); Commons page text CC BY-SA is separate. / 定位：File description and licensing; reference only。核查日期：2026-10-29。只作公有领域结构参考；未复制维基页面的 CC BY-SA 说明文字或导入图像。) — https://commons.wikimedia.org/wiki/File:Animal_cell_structure_en.svg
- [S19] Science & Plants for Schools. Microscopy of a pondweed leaf: exploring depth of field and focal plane. / Science & Plants for Schools：水草叶的景深与焦平面。 (Resource page; linked through S08. Accessed 2026-10-29. Reference only; no open asset permission established. / 定位：Resource page; linked through S08。核查日期：2026-10-29。仅作事实或术语参考；不据此复制未核开放许可的资产。) — https://www.saps.org.uk/teaching-resources/resources/6294/microscopy-of-a-pondweed-leaf-exploring-depth-of-field-and-focal-plane/
- [S20] Atlas cells original design study. Eyepiece 10×; objectives 4×, 10×, 40×; field number 18 mm. Total power = 10 × objective = 40×, 100×, 400×. Object-field diameter = 1000 × 18 / objective = 4500, 1800, 450 µm. Focus tolerance widths = 20, 8, 2 µm; clarity proxy = max(0, 1 − abs(focus − layer depth)/width). Cell models enlarged separately 2000×: plant envelope 80×40×25 µm; animal 60×45×8 µm. Wall/membrane thickness exaggerated. Six plant chloroplast shapes, one large plant vacuole and one nucleus per cell are illustration choices. All specimen positions, layers, blur mappings and instrument dimensions are authored teaching geometry. / Atlas 原创设计研究：目镜 10 倍；物镜 4、10、40 倍；视场数 18 毫米。总倍数＝10×物镜倍数＝40、100、400 倍；物方视野直径＝1000×18÷物镜倍数＝4500、1800、450 微米。调焦容差＝20、8、2 微米；清晰度代理量＝max(0,1−焦差绝对值÷容差)。细胞另行放大 2000 倍：植物细胞包络 80×40×25 微米，动物 60×45×8 微米；壁膜厚度额外夸张。植物叶绿体形状 6 个、大液泡 1 个，各细胞核 1 个，均为绘图选择。标本位置、深度、模糊映射及仪器尺寸均为教学设计。 (Original Atlas design, not measured biology or a calibrated optical image. Field formula supported by S22; total power and inversion by S7/S3. With a 100 µm target, the span occupies 2.222…%, 5.555…%, 22.222…% of diameter. Onion target centre x=200 µm; slide-x=−200 µm centres it; at slide-x=−100 µm and objective40, u=−100/225=−0.444444…. At objective40, focus error1 µm gives clarity0.5 and error2 gives0; this is not resolution. No large coarse-focus actuation. All material paraphrases and original geometry remain in the project CC BY-NC-SA family. / 原创设计，不是生物实测或经校准光学影像。视野公式见 S22，总倍数与倒像见 S7、S3。100 微米目标横跨直径的 2.222…%、5.555…%、22.222…%。洋葱目标中心 x=200 微米，slide-x=−200 时居中；−100 时在 40 倍物镜下 u=−100/225=−0.444444…。该物镜焦差 1 微米时代理量 0.5，2 微米时为 0；这不是分辨率。只开放微调。原创几何及释义保持项目 CC BY-NC-SA 许可家族。) (design study / 设计研究)
- [S21] Nikon Corporation Healthcare. Microscope carrying guide, Eclipse E100. / 尼康 Eclipse E100 显微镜搬运说明。 (Carrying the microscope; model-specific two-hand arm grip differs from arm/base laboratory guidance. Accessed 2026-10-29. Reference only; no open asset permission established. / 定位：Carrying the microscope; model-specific two-hand arm grip differs from arm/base laboratory guidance。核查日期：2026-10-29。该型号要求双手握镜臂；与实验指导的扶镜臂、托底座不同，正文明确具体仪器听从教师。) — https://www.microscope.healthcare.nikon.com/guides/e100/en/page/carrying.html
- [S22] Nikon Corporation Healthcare. field of view (FOV), Glossary of Microscopy Terms. / 尼康显微术语表：视野，视场数除以物镜倍数。 (Definition: field number divided by objective magnification; circular field diameter. Accessed 2026-10-29. Reference only; no open asset grant established. / 定位：Definition: field number divided by objective magnification; circular field diameter。核查日期：2026-10-29。仅作事实或术语参考；不据此复制未核开放许可的资产。) — https://www.microscope.healthcare.nikon.com/en_AOM/resources/glossary/field-of-view
- [S23] Austin Community College, 2006. BIO 1406 Laboratory Manual, 12th ed., Exercise 4 laboratory procedures. / 奥斯汀社区学院，2006 年 BIO 1406 实验手册，第 4 课：洋葱鳞茎细胞。 (Printed 4-8 / PDF page4: Onion Bulb Cells, subsection c; non-photosynthetic tissue and membrane visibility limits. Accessed 2026-10-29. Reference only; no open asset grant established. / 定位：Printed 4-8 / PDF page4: Onion Bulb Cells, subsection c; non-photosynthetic tissue and membrane visibility limits。核查日期：2026-10-29。仅作事实或术语参考；不据此复制未核开放许可的资产。) — https://accmultimedia.austincc.edu/biocr/1406/labm/lab_procedure_files/lab_procedure_4.pdf
- [S24] Brad Basehore and Rae Dennis, Harrisburg Area Community College / LibreTexts. BIOL 212 Botany Laboratory Manual §1.5 Cell Structures and Organelles. / Basehore 与 Dennis，哈里斯堡地区社区学院 / LibreTexts，《植物学实验手册》第 1.5 节：细胞结构。 (Onion Cells; paragraph immediately following onion drawing task and chloroplast question. Accessed 2026-10-29. CC BY-NC 4.0 indicated by page metadata, outside the brief’s asset-licence list; factual reference only. / 定位：Onion Cells; paragraph immediately following onion drawing task and chloroplast question。核查日期：2026-10-29。仅作事实或术语参考；不据此复制未核开放许可的资产。) — https://bio.libretexts.org/Courses/Harrisburg_Area_Community_College/BIOL_212%3A_Botany_-_Laboratory_Manual/01%3A_Lab_1-_From_Prokaryotes_to_Eukaryotes/1.05%3A_Cell_Structures_and_Organelles
<!-- sources:end -->
