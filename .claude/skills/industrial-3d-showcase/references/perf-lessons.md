# PERF LESSONS — 实测有效的性能经验

来自 MHI 燃气轮机（Apple M4 集成 GPU，4K HERO 从 21.8 fps 提到 59.6 fps）与 Eaton CDU、沙虫项目的实测。按收益排序。

## 目录

1. 抗锯齿 · 2. 阴影 · 3. 动态分辨率 · 4. 透明队列 · 5. 实例化与 LOD · 6. 合并 ·
7. GPU 流场 · 8. 每帧开销与标签 · 9. 剖切面 · 10. X-RAY · 11. 灯光与后处理 · 12. 测量方法

---

## 1. 关掉原生 MSAA，用后处理 AA

ANGLE/Metal 上原生 4×MSAA 在 4K 占约 32 ms（40.5 → 8.5 ms），1080p 近景也是 3.6 倍开销。改为 `antialias: false` + `RenderPass → OutputPass → FXAA`（r170 用 `ShaderPass(FXAAShader)`，较新版本有 `FXAAPass`）。画质只是略软。

## 2. 阴影按需更新

`renderer.shadowMap.autoUpdate = false`，只在投影几何变化时（剖切角、爆炸位移、X-RAY 状态、主体移动）置 `needsUpdate = true`。绕自身轴旋转的回转体影子基本不变，不必每帧重渲。每帧少约 14 次 draw call 和 25 万三角形。只让大件 castShadow；叶片、螺栓既不投也不收。

移动主体（沙虫）需要每帧更新阴影时，把阴影相机框紧主体，shadow map 尺寸不要盲目加大。

## 3. 动态分辨率调速器

每 90 帧看一次平均帧时间，系数范围 0.7–1.0：
- 连续 2 个窗口均值 > 17.5 ms → 降 0.1；
- 连续 4 个窗口零掉帧 → 试升 0.1；
- 升档后 4 s 内又掉帧 → 30 s 内不再尝试升档。

坑：不要用"均值 < 13 ms 才升档"——vsync 下帧时间不会低于 16.7 ms，降档后永远升不回来。

像素比：`min(devicePixelRatio, 3840 / innerWidth, 2) × scale`，4K 下不会用 2×。

## 4. 透明队列最小化

只有 X-RAY 时要淡出的材质（外壳、内壳、衬套、螺栓）设 `transparent`；内部件保持不透明，享受前后排序与早期深度剔除。双面透明材质设 `forceSinglePass = true`，否则 three.js 会每帧把材质标脏重编译。

## 5. InstancedMesh 与 LOD

- 叶片、螺栓、燃烧筒、装甲面板、换热板边：全部 InstancedMesh。MHI 约 1,930 片压气机叶片 + 386 片涡轮叶片 + ~700 颗螺栓。
- 动叶实例挂在转子 Group 下，旋转只改 Group 的 rotation，不每帧写实例矩阵。
- 每种叶型做高 / 低两档几何（低档约 1/4 三角形），每 12 帧按模块与相机距离切换。螺栓在相机距离超过阈值时隐藏。
- 移动主体（节段环）必须每帧写实例矩阵时，复用同一个 Matrix4，只调用一次 `instanceMatrix.needsUpdate = true`。

## 6. 静态几何合并

每个模块的外壳、法兰、加强肋、中分面合成一个 mesh；底座、管路、支架按材质合成少数 mesh（`mergeGeometries`）。框架方管同截面可实例化。

## 7. GPU 流场

把流道中心线烘成一张 N×2 的 float 纹理（按时间均匀重采样，压缩段和涡轮段自然加速），几千条流线 / 粒子只占 1 次 draw call，CPU 每帧只写几个 uniform（时间、强度、模式混合）。多回路时每个回路一套路径，永不共享段。FLOW 开启只增 +2 次 draw call。

## 8. 每帧开销与标签

- 渲染循环里不 new geometry / material / Vector3（模块级复用临时向量）。
- 标签只写 `transform` / `opacity` / SVG 属性；`getBoundingClientRect` 只在 resize 和字体加载完成后调用。
- 遮挡判断用解析法：沿视线采样查外壳内外半径表 / 地形高度，或对少数粗代理体做节流 raycast（每帧轮询 1–2 个标签），不要每帧对整模型 raycast。
- 文本只在内容变化时写 `textContent`。

## 9. 剖切面（无需封口几何）

两个绕主轴旋转的裁剪平面，`clipIntersection = true` 得到楔形切口（阴影同样被裁剪）。切口不建封口几何：把实体的背面画成剖面色（ochre），法线取切平面方向，再叠 45° 工程剖面线（屏幕或物体空间 hatch）。效果像展台模型的黄色剖面。封闭设备用单平面 clipping + graphite 剖面描边即可。

## 10. X-RAY

- 机械类：外壳不透明度 → 0.10–0.20，0.3 s 过渡，内部件实体；剖切楔形可同时自动闭合。
- 环境类（地下部分透视）：主 pass 正常渲染；X-RAY 开启时清深度，用 layers 渲染主体 depth-only 预通道，再渲染幽灵材质（青色 + 菲涅尔边缘，片元里比较世界坐标 y 与地形高度，只在地面以下显示）。

## 11. 灯光与后处理

1 个半球光 + 最多 3 个平行光 + PMREM 环境（RoomEnvironment 或程序化 softbox），ACES。不用 SSAO、SSR、体积 raymarch、bloom、动态点光源。需要 AO 感时用地面接触阴影贴图或烘到顶点色。

## 12. 测量方法（如实报告）

- headless Chromium 的 rAF 被 vsync 锁在 60 Hz：16.7 ms 只说明"够 60"，看不出余量。
- 另测两种：
  1. uncapped：`--disable-gpu-vsync --disable-frame-rate-limit`，噪声大，只作余量参考；
  2. 同步单帧成本：每帧 render 后 `gl.readPixels` 1 像素强制 GPU 完成，取 40 帧平均（`__showcase.benchSync(40)`），最可靠。
- macOS 用 `--use-angle=metal --enable-gpu --ignore-gpu-blocklist` 才是真实 GPU；检查 `WEBGL_debug_renderer_info`，SwiftShader 即软件渲染，不能报 GPU FPS。
- 同一台机器不同时段有约 ±20% 波动（发热 / 负载）。做 A/B 时新旧版本在同一时段交替测。
- 机器负载高时 headless 合成器节奏会把所有场景（包括极轻场景）拉到同样的低帧率——那是调度问题，不是渲染开销。对外引用 1% low 之前，在安静机器上用有窗口的浏览器复核。
- 报告中把架构指标（calls、triangles、geometries、textures）与实际 FPS 分开写，并注明硬件、浏览器、渲染器字符串、drawing buffer 尺寸、pixel ratio。
