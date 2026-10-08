---
name: atlas-plate
description: Atlas 项目的视觉与交互打磨入口。当要给 Atlas 的引擎、HUD、材质、灯光、镜头、标注、动画、性能或某个主题做"打磨 / polish / 技术图版 / technical plate / 像沙虫那样"的工作时使用，也在新建主题的视觉验收时使用。它把项目级 skill industrial-3d-showcase 的方法映射到 Atlas 的 Astro + 数据驱动引擎架构上。
---

# Atlas Plate

1. 读 `docs/08-technical-plate.md`（Atlas 适配层，冲突时以它为准）。
2. 读 `.claude/skills/industrial-3d-showcase/SKILL.md` 与 `references/master-spec.md`；做材质/性能读 `perf-lessons.md`；主题是真实对象读 `fact-discipline.md`；按轮次打磨读 `rounds.md`。
3. 读 `docs/06-dev-guide.md` 了解引擎契约、`window.__atlas` 测试 API 和 `pnpm shoot`。
4. 按 docs/08 §8 的轮次与范围栅栏施工。每轮末尾：`pnpm shoot <topic> --layout --keys` → 看截图 → 列差异 → 直接修 → 再截图 → 全部门槛绿 → 提交。
5. 不引入外部运行时请求；不加 glTF 依赖除非 docs/08 §0 的例外；两套主题都验。
