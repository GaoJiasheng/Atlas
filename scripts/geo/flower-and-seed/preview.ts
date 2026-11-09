/** Decoded-asset studio preview. Engine GGX + RoomEnvironment + ACES, no browser. */
import fs from "node:fs";
import { createHash } from "node:crypto";
import sharp from "sharp";
import { NodeIO } from "@gltf-transform/core";
import { ALL_EXTENSIONS } from "@gltf-transform/extensions";
import { dequantize } from "@gltf-transform/functions";
import { MeshoptDecoder } from "meshoptimizer";
import {
  BufferGeometry,
  BufferAttribute,
  Matrix4,
  OrthographicCamera,
  PerspectiveCamera,
  Vector3,
  Color,
  Box3,
} from "three";
import {
  prepareStudio,
  studioShade,
  studioRigs,
  aces,
} from "../fossils-and-skeletons/studio-cpu";
import { partPieces } from "../../../src/engines/space-scene/stages/model3d/geometry";
import { partMaterialSlots } from "../../../src/engines/space-scene/lib/parts";
import { partsFile } from "../../../src/engines/space-scene/schema";
import { resolveMaterialLook } from "../../../src/engines/space-scene/lib/color";
import { fitCameraToAspect } from "../../../src/engines/space-scene/lib/camera";
import { animationAngle } from "../../../src/engines/space-scene/lib/animation";
import type { OrbitCamera } from "../../../src/engines/core/types";
import { SIDE, VISIT, FRUITS, FLOWER, FIG, at, dirIn } from "./layout";
import { tokens } from "./bake";
const round = process.argv[2] ?? "round1",
  out = process.env.PREVIEW_OUT ?? `scripts/geo/flower-and-seed/evidence/${round}`;
const round4 = process.env.ROUND4 === "1";
fs.mkdirSync(out, { recursive: true });
const baseline = process.argv.includes("--before");
const file = partsFile.parse(
  JSON.parse(
    fs.readFileSync(
      baseline
        ? "scripts/geo/flower-and-seed/evidence/before/parts.json"
        : "src/content/topics/flower-and-seed/data/parts.json",
      "utf8",
    ),
  ),
);
const assetPath = process.env.PREVIEW_ASSET ?? (file.model ? `public${file.model}` : undefined);
const hash = (bytes: Buffer | string) =>
  createHash("sha256").update(bytes).digest("hex");
const assetHash = assetPath ? hash(fs.readFileSync(assetPath)) : null;
const lighting = fs.readFileSync(
  "src/engines/space-scene/stages/model3d/Lighting.tsx",
  "utf8",
);
for (const [theme, rig] of Object.entries(studioRigs)) {
  const block = lighting.match(
    new RegExp(`${theme}: \\{([\\s\\S]*?)\\n  \\}`),
  )![1]!;
  for (const [key, value] of [
    ["env", rig.env],
    ["exposure", rig.exposure],
  ] as const)
    if (Number(block.match(new RegExp(`${key}: ([\\d.]+)`))![1]) !== value)
      throw new Error("CPU studio rig drift");
}
for (const [theme, rig] of Object.entries(studioRigs)) {
  const block = lighting.match(
    new RegExp(`${theme}: \{([\\s\\S]*?)\\n  \}`),
  )![1]!;
  for (const [i, key] of ["key", "fill", "rim"].entries()) {
    const row = block.match(new RegExp(`${key}: \\[([^\\]]+)`))![1]!,
      hex = row.match(/#[0-9a-f]{6}/i)![0];
    if (
      hex !== rig.lights[i]![0] ||
      Number(row.split(",")[1]) !== rig.lights[i]![1]
    )
      throw new Error(`${theme} ${key} drift`);
  }
  const hemi = block.match(/hemi: \[([^\]]+)/)![1]!,
    colors = [...hemi.matchAll(/#[0-9a-f]{6}/gi)].map((m) =>
      new Color(m[0]).toArray(),
    );
  if (
    JSON.stringify(colors) !== JSON.stringify(rig.hemi.slice(0, 2)) ||
    Number(hemi.split(",")[2]) !== rig.hemi[2]
  )
    throw new Error("hemisphere rig drift");
}
for (const [i, key] of ["KEY", "FILL", "RIM"].entries()) {
  const line = lighting
    .split("\n")
    .find((line) => line.startsWith(`const ${key}_DIR:`))!;
  const direction = line
    .slice(line.indexOf("[") + 1, line.indexOf("]"))
    .split(",")
    .map(Number);
  if (
    JSON.stringify(direction) !== JSON.stringify(studioRigs.paper.lights[i]![2])
  )
    throw new Error(`${key} direction drift`);
}
prepareStudio();
const meshes = new Map<string, BufferGeometry>();
if (file.model) {
  await MeshoptDecoder.ready;
  const doc = await new NodeIO()
    .registerExtensions(ALL_EXTENSIONS)
    .registerDependencies({ "meshopt.decoder": MeshoptDecoder })
    .read(assetPath!);
  await doc.transform(dequantize());
  for (const n of doc.getRoot().listNodes()) {
    const p = n.getMesh()?.listPrimitives()[0];
    if (!p) continue;
    const g = new BufferGeometry();
    for (const [attr, sem] of [
      ["position", "POSITION"],
      ["normal", "NORMAL"],
      ["color", "COLOR_0"],
      ["uv", "TEXCOORD_0"],
      ["uv1", "TEXCOORD_1"],
    ] as const) {
      const a = p.getAttribute(sem);
      if (a)
        g.setAttribute(
          attr,
          new BufferAttribute(
            new Float32Array(a.getArray()!),
            attr.startsWith("uv") ? 2 : 3,
          ),
        );
    }
    g.setIndex(
      new BufferAttribute(new Uint32Array(p.getIndices()!.getArray()!), 1),
    );
    g.applyMatrix4(new Matrix4().fromArray(n.getWorldMatrix()));
    const part = file.parts.find(part=>part.mesh===n.getName())!;
    const look = resolveMaterialLook(part.material!.color,tokens,"paper",part.material!.tint);
    g.userData.env = p.getMaterial()!.getExtras().atlasRoughness === true ? look.envIntensity : 1;
    g.userData.roughness =
      p.getMaterial()!.getExtras().atlasRoughness === true
        ? look.roughness
        : p.getMaterial()!.getRoughnessFactor();
    const finish = p.getMaterial()!.getMetallicRoughnessTexture()?.getImage();
    if (finish)
      g.userData.finish = await sharp(Buffer.from(finish))
        .removeAlpha()
        .raw()
        .toBuffer();
    const normalImage = p.getMaterial()!.getNormalTexture()?.getImage();
    if (normalImage && p.getMaterial()!.getExtras().atlasMicrostructure === true) {
      const { data, info } = await sharp(Buffer.from(normalImage)).removeAlpha().raw().toBuffer({ resolveWithObject: true });
      g.userData.normalTexture = { data, width: info.width, height: info.height };
      g.userData.normalScale = process.env.NO_NORMAL ? 0 : p.getMaterial()!.getNormalScale();
    }
    const image = p.getMaterial()!.getBaseColorTexture()?.getImage();
    if (image) {
      const { data, info } = await sharp(Buffer.from(image))
        .removeAlpha()
        .raw()
        .toBuffer({ resolveWithObject: true });
      g.userData.texture = { data, width: info.width, height: info.height };
    }
    meshes.set(n.getName(), g);
  }
}
interface Piece {
  g: BufferGeometry;
  rough: number;
  color: Color;
  metal: number;
  env: number;
}
function pieces(id: string): Piece[] {
  const p = file.parts.find((x) => x.id === id)!;
  if (p.mesh) {
    const g = meshes.get(p.mesh)!;
    return [
      {
        g,
        rough: g.userData.roughness,
        color: new Color("#ffffff"),
        metal: 0,
        env: g.userData.env,
      },
    ];
  }
  return partPieces(p)
    .filter((p) => !p.lines)
    .flatMap((piece) => {
      const slot = partMaterialSlots(p)[piece.slot ?? 0]!,
        look = resolveMaterialLook(slot.color, tokens, "paper", slot.tint);
      return (piece.matrices ?? [new Matrix4()]).map((m) => {
        const g = piece.geometry
          .clone()
          .applyMatrix4(m)
          .translate(...p.primitive!.at);
        if (!g.index) g.setIndex(Array.from({ length: g.getAttribute("position").count }, (_, i) => i));
        return { g, rough: look.roughness, color: new Color(look.color), metal: look.metalness, env: look.envIntensity };
      });
    });
}
/** Bilinear glTF image sampling: row zero at V=0 (flipY=false). */
function sample(tex: { data: Buffer; width: number; height: number }, u: number, v: number, repeat = false, srgb = false) {
  const wrap = (x: number) => repeat ? ((x % 1) + 1) % 1 : Math.max(0, Math.min(1, x));
  const x = wrap(u) * tex.width - .5, y = wrap(v) * tex.height - .5, a = Math.floor(x), b = Math.floor(y);
  const at = (i: number, j: number, k: number) => {
    const v = tex.data[(Math.max(0, Math.min(tex.height - 1, j)) * tex.width + Math.max(0, Math.min(tex.width - 1, i))) * 3 + k]! / 255;
    // GPU sRGB textures decode each texel BEFORE linear filtering.
    return srgb ? v <= .04045 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4 : v;
  };
  return [0,1,2].map(k => (at(a,b,k)*(1-(x-a))+at(a+1,b,k)*(x-a))*(1-(y-b)) + (at(a,b+1,k)*(1-(x-a))+at(a+1,b+1,k)*(x-a))*(y-b));
}
const W = Number(process.env.PREVIEW_WIDTH ?? 680),
  H = Number(process.env.PREVIEW_HEIGHT ?? 560);
const previewSize = { width: W, height: H };
async function render(
  ps: Piece[],
  direction: number[],
  spanScale = 1,
  targetOverride?: Vector3,
  theme: "paper" | "cinema" = "paper",
  beatView?: { camera: OrbitCamera; width: number; height: number },
) {
  const width = beatView?.width ?? previewSize.width, height = beatView?.height ?? previewSize.height;
  // Local dimensions preserve the regular comparison-sheet raster sizes.
  const [W, H] = [width, height];
  const box = new Box3();
  for (const { g } of ps) {
    g.computeBoundingBox();
    box.union(g.boundingBox!);
  }
  const target = targetOverride ?? box.getCenter(new Vector3()),
    D = new Vector3(...direction).normalize();
  const camera = beatView
    ? new PerspectiveCamera(beatView.camera.fov ?? 30, W / H, .001, 100)
    : new OrthographicCamera(-1, 1, 1, -1, 0.001, 100);
  if (beatView) {
    // Presentation uses the authored camera, aspect-fitted by the same pure
    // function as CameraRig. No bounding-box fit or hero recentering occurs.
    const view = fitCameraToAspect(beatView.camera, W / H);
    camera.position.set(...view.position);
    camera.lookAt(...view.target);
  } else {
    camera.position.copy(target).addScaledVector(D, 10);
    camera.lookAt(target);
  }
  camera.updateMatrixWorld();
  const inv = camera.matrixWorldInverse;
  if (camera instanceof OrthographicCamera) {
    const projected = box.clone().applyMatrix4(inv), size = projected.getSize(new Vector3());
    const half = Math.max(size.y * 0.58, (size.x * 0.58 * H) / W) * spanScale;
    camera.left = (-half * W) / H;
    camera.right = (half * W) / H;
    camera.top = half;
    camera.bottom = -half;
  }
  camera.updateProjectionMatrix();
  const cm = new Matrix4().multiplyMatrices(camera.projectionMatrix, inv),
    depth = new Float32Array(W * H).fill(Infinity),
    rgb = new Float32Array(W * H * 3),
    p = new Vector3(),
    n = new Vector3(),
    q: number[] = new Array(9);
  const eye = camera.position;
  for (const part of ps) {
    const g = part.g,
      positions = g.getAttribute("position"),
      normals = g.getAttribute("normal"),
      col = g.getAttribute("color"),
      ix = g.index!,
      screen = new Float32Array(positions.count * 3),
      reciprocalW = new Float32Array(positions.count);
    for (let i = 0; i < positions.count; i++) {
      p.fromBufferAttribute(positions, i);
      const e = cm.elements;
      reciprocalW[i] = 1 / (e[3]! * p.x + e[7]! * p.y + e[11]! * p.z + e[15]!);
      p.applyMatrix4(cm);
      screen.set([(p.x * 0.5 + 0.5) * W, (-p.y * 0.5 + 0.5) * H, p.z], i * 3);
    }
    for (let t = 0; t < ix.count; t += 3) {
      const a = ix.getX(t),
        b = ix.getX(t + 1),
        c = ix.getX(t + 2);
      for (let j = 0; j < 3; j++) {
        const k = [a, b, c][j]!;
        q[j * 3] = screen[k * 3]!;
        q[j * 3 + 1] = screen[k * 3 + 1]!;
        q[j * 3 + 2] = screen[k * 3 + 2]!;
      }
      const [ax, ay, az, bx, by, bz, cx, cy, cz] = q as [
        number,
        number,
        number,
        number,
        number,
        number,
        number,
        number,
        number,
      ];
      if ([az, bz, cz].some((z) => z < -1 || z > 1)) continue;
      const d = (by - cy) * (ax - cx) + (cx - bx) * (ay - cy);
      if (Math.abs(d) < 1e-7) continue;
      const x0 = Math.max(0, Math.floor(Math.min(ax, bx, cx))),
        x1 = Math.min(W - 1, Math.ceil(Math.max(ax, bx, cx))),
        y0 = Math.max(0, Math.floor(Math.min(ay, by, cy))),
        y1 = Math.min(H - 1, Math.ceil(Math.max(ay, by, cy)));
      const st = g.getAttribute("uv"), tangent = new Vector3(), bitangent = new Vector3();
      if (g.userData.normalTexture && st) {
        const du1 = st.getX(b) - st.getX(a), dv1 = st.getY(b) - st.getY(a), du2 = st.getX(c) - st.getX(a), dv2 = st.getY(c) - st.getY(a), det = du1 * dv2 - dv1 * du2;
        if (Math.abs(det) > 1e-12) {
          const e1 = new Vector3().fromBufferAttribute(positions,b).sub(new Vector3().fromBufferAttribute(positions,a));
          const e2 = new Vector3().fromBufferAttribute(positions,c).sub(new Vector3().fromBufferAttribute(positions,a));
          tangent.copy(e1).multiplyScalar(dv2).addScaledVector(e2,-dv1).divideScalar(det);
          bitangent.copy(e2).multiplyScalar(du1).addScaledVector(e1,-du2).divideScalar(det);
        }
      }
      for (let y = y0; y <= y1; y++)
        for (let x = x0; x <= x1; x++) {
          const screenU =
              ((by - cy) * (x + 0.5 - cx) + (cx - bx) * (y + 0.5 - cy)) / d,
            screenV = ((cy - ay) * (x + 0.5 - cx) + (ax - cx) * (y + 0.5 - cy)) / d,
            screenW = 1 - screenU - screenV;
          if (screenU < 0 || screenV < 0 || screenW < 0) continue;
          // NDC depth is affine in screen space; surface attributes are not.
          const z = screenU * az + screenV * bz + screenW * cz,
            k = y * W + x;
          if (z >= depth[k]!) continue;
          depth[k] = z;
          const weight = screenU * reciprocalW[a]! + screenV * reciprocalW[b]! + screenW * reciprocalW[c]!;
          const u = screenU * reciprocalW[a]! / weight,
            v = screenV * reciprocalW[b]! / weight,
            w = screenW * reciprocalW[c]! / weight;
          const texture = g.userData.texture;
          {
            const uv = g.getAttribute("uv"),
              tx = uv ? uv.getX(a) * u + uv.getX(b) * v + uv.getX(c) * w : 0,
              ty = uv ? uv.getY(a) * u + uv.getY(b) * v + uv.getY(c) * w : 0;
            const C = new Color("#ffffff");
            if (texture) {
              const texel = sample(texture, tx, ty, !g.userData.normalTexture, true);
              C.setRGB(texel[0]!,texel[1]!,texel[2]!);
            }
            n.set(
              normals.getX(a) * u + normals.getX(b) * v + normals.getX(c) * w,
              normals.getY(a) * u + normals.getY(b) * v + normals.getY(c) * w,
              normals.getZ(a) * u + normals.getZ(b) * v + normals.getZ(c) * w,
            ).normalize();
            p.set(
              positions.getX(a) * u +
                positions.getX(b) * v +
                positions.getX(c) * w,
              positions.getY(a) * u +
                positions.getY(b) * v +
                positions.getY(c) * w,
              positions.getZ(a) * u +
                positions.getZ(b) * v +
                positions.getZ(c) * w,
            );
            const view = eye.clone().sub(p).normalize();
            if (n.dot(view) < 0) n.negate();
            if (g.userData.normalTexture && tangent.lengthSq() > 1e-15) {
              const nm = sample(g.userData.normalTexture, tx, ty).map(x=>x*2-1);
              const T = tangent.clone().addScaledVector(n, -tangent.dot(n)).normalize();
              const B = new Vector3().crossVectors(n,T);
              if (B.dot(bitangent)<0) B.negate();
              n.multiplyScalar(nm[2]!).addScaledVector(T,nm[0]!*g.userData.normalScale).addScaledVector(B,nm[1]!*g.userData.normalScale).normalize();
            }
            C.multiply(
              col
                ? new Color().setRGB(
                    col.getX(a) * u + col.getX(b) * v + col.getX(c) * w,
                    col.getY(a) * u + col.getY(b) * v + col.getY(c) * w,
                    col.getZ(a) * u + col.getZ(b) * v + col.getZ(c) * w,
                  )
                : part.color,
            );
            const finishUV = g.getAttribute("uv1"),
              finish = g.userData.finish;
            const roughness =
              finish && finishUV
                ? (part.rough *
                    finish[
                      Math.max(
                        0,
                        Math.min(
                          3,
                          Math.floor(
                            (finishUV.getX(a) * u +
                              finishUV.getX(b) * v +
                              finishUV.getX(c) * w) *
                              4,
                          ),
                        ),
                      ) *
                        3 +
                        1
                    ]) /
                  255
                : part.rough;
            const radiance = studioShade(
              C.toArray() as any,
              n.toArray() as any,
              view.toArray() as any,
              theme,
              roughness,
              part.metal,
            );
            // The material family's envMapIntensity is renderer state too.
            if (part.env !== 1) {
              const direct = studioShade(C.toArray() as any,n.toArray() as any,view.toArray() as any,theme,roughness,part.metal,()=>0);
              for(let j=0;j<3;j++) radiance[j] = direct[j]! + (radiance[j]! - direct[j]!) * part.env;
            }
            for (let j = 0; j < 3; j++) rgb[k * 3 + j] = radiance[j]!;
          }
        }
    }
  }
  const pixels = new Uint8Array(W * H * 3),
    color = new Color(),
    bg = new Color(theme === "paper" ? "#e9e4d8" : "#1f2124");
  for (let i = 0; i < W * H; i++) {
    color.copy(bg);
    if (depth[i] !== Infinity)
      color.fromArray(
        aces(
          [rgb[i * 3]!, rgb[i * 3 + 1]!, rgb[i * 3 + 2]!],
          studioRigs[theme].exposure,
        ),
      );
    color.convertLinearToSRGB();
    pixels[i * 3] = Math.round(color.r * 255);
    pixels[i * 3 + 1] = Math.round(color.g * 255);
    pixels[i * 3 + 2] = Math.round(color.b * 255);
  }
  return sharp(pixels, { raw: { width: W, height: H, channels: 3 } })
    .png()
    .toBuffer();
}
const heroes = [
  ["fig-cut", "fig", FIG],
  ["red-flower", "costus", VISIT],
  ["moss-cushion", "moss", SIDE],
  ["moss-capsules", "moss", SIDE],
  ["flower", "flower", FLOWER],
  ["rubber-valves", "rubber", FRUITS],
  ["fern-fronds", "fern", SIDE],
  ["fern-underside", "fern", SIDE],
  ["nectar-bat", "bat", VISIT],
  ["sunbird", "sunbird", VISIT],
  ["coconut", "coconut", FRUITS],
  ["sea-almond", "almond", FRUITS],
  ["sea-almond-cut", "almond", FRUITS],
  ["angsana-pod", "angsana", FRUITS],
  ["ripe-figs", "fig", FRUITS],
  ["rubber-capsule", "rubber", FRUITS],
  ["rubber-seeds", "rubber", FRUITS],
  ["balsam-pod", "balsam", FRUITS],
  ["durian-flowers", "durian", VISIT],
  ["chilli-young", "chilli", FRUITS],
  ["chilli-cut", "chilli", FRUITS],
  ["balsam-valves", "balsam", FRUITS],
] as const;
const manifest = fs.existsSync("scripts/geo/flower-and-seed/refs/manifest.json")
  ? JSON.parse(
      fs.readFileSync("scripts/geo/flower-and-seed/refs/manifest.json", "utf8"),
    )
  : {};
for (const [id, ref, station] of heroes) {
  if (process.env.PREVIEW_BEATS_ONLY === "1") continue;
  if (process.env.ONLY && !process.env.ONLY.split(",").includes(id)) continue;
  const ps =
    id === "flower"
      ? ["flower", "sepals", "stamens", "pistil"].flatMap(pieces)
      : pieces(id);
  for (const [name, dir, k] of [
    ["front", [0, 0.25, 1], 0],
    ["three-quarter", [0.7, 0.55, 1], 1],
    ["profile", [1, 0.15, 0], 2],
    ["detail", [0.35, 1, 1], 3],
  ] as const) {
    const isAnimal = id === "nectar-bat" || id === "sunbird";
    let d: readonly number[] = dir;
    if (isAnimal && name === "front") d = [1, 0.08, 0.05];
    if (isAnimal && name === "profile") d = [0, 0.05, 1];
    if (id === "coconut")
      d = name === "detail" ? [1,.1,.02] : name === "profile" ? [0,.12,1] : name === "front" ? [.15,.85,.7] : [1,.9,.5];
    if (id === "sea-almond-cut") d = name === "profile" ? [0,.12,1] : name === "front" ? [0,.75,1] : name === "three-quarter" ? [1,1,1] : [0,1,.05];
    if (id === "fern-fronds")
      d = name === "profile" ? [1, 0.1, 0] : name === "front" ? [0,.45,1] : [0.3, 1.25, 1];
    if (id === "angsana-pod" && name !== "profile") d = [0.2, 1, 0.2];
    const yaw =
      id === "coconut"
        ? 75
        : id === "sunbird"
          ? -48
          : id === "sea-almond"
            ? 15
            : id === "ripe-figs" ? 15
            : id === "fern-fronds"
              ? 10
              : id === "fern-underside"
                ? -8
                : 0;
    const a = (yaw * Math.PI) / 180,
      rotated = [
        Math.cos(a) * d[0]! + Math.sin(a) * d[2]!,
        d[1]!,
        -Math.sin(a) * d[0]! + Math.cos(a) * d[2]!,
      ];
    let target: Vector3 | undefined,
      zoom = name === "detail" ? 0.57 : 1;
    if (id === "nectar-bat") {
      // Compare the fur at the photo's scale; retain whole-animal cinema below.
      const view = name === "profile" ? [0,.10,1] : name === "three-quarter" ? [.70,.12,1] : [1,.12,.02];
      rotated.splice(0,3,...view);
      const pivot = file.animations.find(a=>a.target===id)!.pivot!;
      target = new Vector3(...pivot).add(new Vector3(...dirIn(VISIT, name === "front" || name === "detail" ? [.0385,.033,0] : [.042,.025,0])));
      zoom = name === "detail" ? .17 : name === "front" ? .24 : .28;
      if (round4 && name !== "detail") { target = undefined; zoom = 1; }
      if (round4 && name === "detail") {
        // Round 4 is a limb-only repair. Show shoulder → elbow → wrist and
        // the near short hind leg together, instead of re-auditing the face.
        const local = new Vector3(-.014, .025, .032).applyMatrix4(new Matrix4().makeRotationZ(12 * Math.PI / 180));
        target = new Vector3(...pivot).add(new Vector3(...dirIn(VISIT, local.toArray())));
        rotated.splice(0, 3, 0, .20, 1);
        zoom = .46;
      }
    }
    if(name === "detail" && id === "fern-fronds") {
      target=new Vector3(...at(SIDE,[-.05,.040,-.07]));zoom=.28;
    }
    if(name === "detail" && id === "ripe-figs") {
      target=new Vector3(...at(FRUITS,[.174,.006,.094]));zoom=.35;
    }
    if(name === "detail" && id === "fig-cut") {
      target=new Vector3(...at(FIG,[0,.093,0]));zoom=.26;rotated.splice(0,3,...[.08,1,-.10]);
    }
    if(name === "detail" && id === "sea-almond-cut") zoom=.75;
    if(name === "detail" && id === "durian-flowers") { target=new Vector3(...at(VISIT,[.10,.255,-.088])); zoom=.24; }
    if(name === "detail" && id === "red-flower") { target=new Vector3(...at(VISIT,[-.17,.21,.02])); zoom=.30; }
    if (name === "detail" && id === "coconut") {
      ps[0]!.g.computeBoundingBox();
      const centre = ps[0]!.g.boundingBox!;
      target = centre
        .getCenter(new Vector3())
        .add(
          new Vector3(
            ...dirIn(FRUITS, [
              Math.cos((75 * Math.PI) / 180) * 0.07,
              0.025,
              -Math.sin((75 * Math.PI) / 180) * 0.07,
            ]),
          ),
        );
      zoom = 0.38;
    }
    const img = await render(ps, dirIn(station, rotated), zoom, target);
    fs.writeFileSync(`${out}/${id}-${name}.png`, img);
    const rows = manifest[ref] ?? [],
      refIndex =
        ref === "bat"
          ? round4 ? 0 : name === "front" || name === "detail"
            ? 1
            : 3
          : ref === "fern"
            ? id === "fern-underside"
              ? 2
              : 1
            : ref === "coconut"
              ? name === "detail"
                ? 2
                : 0
              : ref === "angsana"
                ? name === "three-quarter"
                  ? 1
                  : 0
                : ref === "costus" ? k % 3 : ref === "fig" ? id === "fig-cut" ? name === "front" ? 2 : name === "detail" ? 0 : k % 2 : k % 2 : ref === "almond" ? name === "profile" ? 2 : 3 : ref === "flower"
                  ? 1
                  : ref === "chilli"
                    ? id === "chilli-cut"
                      ? 2
                      : k % 2
                    : ref === "moss" ? 1 : ref === "rubber"
                      ? id === "rubber-seeds"
                        ? 0
                        : id === "rubber-valves"
                          ? 1
                          : 2
                      : k,
      row = rows[Math.min(refIndex, rows.length - 1)];
    if (row) {
      const reference = sharp(`scripts/geo/flower-and-seed/refs/${row.file}`);
      if(id === "fig-cut" && name === "detail" && row.detailCrop) reference.extract(row.detailCrop);
      else if (row.crop) reference.extract(row.crop);
      const right = await reference
        .resize(W, H, { fit: "contain", background: "#e9e4d8" })
        .png()
        .toBuffer();
      const label = Buffer.from(
        `<svg width="1360" height="70"><rect width="1360" height="70" fill="#e9e4d8"/><text x="12" y="24" font-size="17" fill="#2a2824">${round} / ${id} / ${name} — engine studio CPU GGX / ACES</text><text x="690" y="24" font-size="12" fill="#2a2824">Reference — ${String(row.title).replace(/[&<>]/g, " ")}</text><text x="12" y="54" font-size="13" fill="#555047">Offline PBR; GPU pending. Reference pose may differ. ${String(
          row.file === "bat-profile.jpg" ? "Cook-Price et al. (2025), Fig.19B; cropped, panel A excluded" : row.artist ?? "Commons contributor",
        )
          .replace(/<[^>]*>/g, "")
          .replace(/[&<>]/g, " ")} / ${row.license}.</text></svg>`,
      );
      await sharp({
        create: {
          width: W * 2,
          height: H + 70,
          channels: 3,
          background: "#e9e4d8",
        },
      })
        .composite([
          { input: img, left: 0, top: 70 },
          { input: right, left: W, top: 70 },
          { input: label, left: 0, top: 0 },
        ])
        .webp({ quality: 90 })
        .toFile(`${out}/${id}-${name}-comparison.webp`);
    }
  }
  const cinema = await render(
    ps,
    dirIn(station, [0.65, 0.4, 1]),
    1,
    undefined,
    "cinema",
  );
  fs.writeFileSync(`${out}/${id}-cinema.png`, cinema);
  if(id === "nectar-bat") {
    const pivot=file.animations.find(a=>a.target===id)!.pivot!;
    const detailTarget=new Vector3(...pivot).add(new Vector3(...dirIn(VISIT,[.0385,.033,0])));
    fs.writeFileSync(`${out}/${id}-cinema-detail.png`, await render(ps,dirIn(VISIT,[1,.12,.02]),.17,detailTarget,"cinema"));
  }
  console.log(`${round}: ${id}`);
}

/** Fixed-frame presentation checks, distinct from the auto-fit study plates.
 * The authored beat cameras are read from the actual chapter. We reproduce
 * CameraRig's presentation aspect fit, with no HUD or free-camera offsets.
 * Perspective-varying attributes above are interpolated with reciprocal W.
 */
const beatEvidence: unknown[] = [];
if (round4) {
  const chapterPath = "src/content/topics/flower-and-seed/chapters/03-who-carries-pollen.mdx";
  const chapter = JSON.parse(fs.readFileSync(chapterPath, "utf8").split("---")[1]!);
  const viewport = { width: 1520, height: 1023 };
  const hover = file.animations.find(a => a.id === "bat-hover")!;
  if (hover.kind !== "oscillate") throw new Error("Expected the actual bat hover oscillation");
  const phaseSamples = [
    { name: "neutral", seconds: 0 },
    { name: "positive", seconds: 1 / (4 * hover.hz) },
    { name: "negative", seconds: 3 / (4 * hover.hz) },
  ];
  const atHoverPhase = (ps: Piece[], seconds: number): Piece[] => {
    const pivot = new Vector3(...hover.pivot!);
    const matrix = new Matrix4().makeTranslation(pivot.x, pivot.y, pivot.z)
      .multiply(new Matrix4().makeRotationAxis(new Vector3(...hover.axis).normalize(), animationAngle(hover, seconds)))
      .multiply(new Matrix4().makeTranslation(-pivot.x, -pivot.y, -pivot.z));
    return ps.map(part => {
      const g = part.g.clone();
      // clone() serialises userData; retain the decoded texture Buffers.
      g.userData = part.g.userData;
      g.applyMatrix4(matrix);
      return { ...part, g };
    });
  };
  for (const row of [
    { beats: [1, 2], hero: "red-flower", ids: ["red-flower", "sunbird"] },
    { beats: [3, 4], hero: "nectar-bat", ids: ["nectar-bat", "durian-flowers"] },
    { beats: [5], hero: "fig-cut", ids: ["fig-cut", "fig-wasp"] },
  ]) {
    if (process.env.ONLY && !process.env.ONLY.split(",").includes(row.hero)) continue;
    const authored: OrbitCamera = chapter.state.beats[row.beats[0]! - 1].camera;
    const camera = { camera: authored, ...viewport };
    const ps = row.ids.flatMap(pieces);
    for (const sample of row.hero === "nectar-bat" ? phaseSamples : [phaseSamples[0]!]) {
      const posed = row.hero === "nectar-bat"
        ? [...atHoverPhase(pieces("nectar-bat"), sample.seconds), ...pieces("durian-flowers")]
        : ps;
      for (const theme of ["paper", "cinema"] as const) {
        const img = await render(posed, [0, 0, 1], 1, undefined, theme, camera);
        for (const beat of row.beats) {
          const filename = `who-carries-pollen-beat${beat}-${sample.name}-${theme}.png`;
          fs.writeFileSync(`${out}/${filename}`, img);
          beatEvidence.push({ filename, beat, partIds: row.ids, theme, authoredCamera: authored,
            fittedCamera: fitCameraToAspect(authored, viewport.width / viewport.height),
            viewport, animationSeconds: sample.seconds,
            animationDegrees: row.hero === "nectar-bat" ? animationAngle(hover, sample.seconds) * 180 / Math.PI : 0 });
        }
      }
      console.log(`${round}: beat ${row.beats.join("/")} / ${sample.name}`);
    }
  }
  fs.writeFileSync(`${out}/beat-framing.json`, JSON.stringify({ chapter: chapterPath,
    chapterSha256: hash(fs.readFileSync(chapterPath)), viewport,
    projection: "Perspective; CameraRig presentation fitCameraToAspect; no auto-fit or recenter",
    hover, views: beatEvidence,
    limits: "No GPU raster derivatives, mip selection, shadow-map occlusion or antialiasing; no HUD/labels. Presentation camera, not desktop HUD-compensated camera."
  }, null, 2) + "\n");
}

if (assetPath && hash(fs.readFileSync(assetPath)) !== assetHash)
  throw new Error("Shipping asset changed during preview; rerun this round.");
fs.writeFileSync(
  `${out}/snapshot.json`,
  JSON.stringify(
    {
      round,
      asset: assetPath,
      assetSha256: assetHash,
      partsSha256: hash(
        fs.readFileSync("src/content/topics/flower-and-seed/data/parts.json"),
      ),
      lightingSha256: hash(lighting),
      rendererSha256: hash(fs.readFileSync("scripts/geo/flower-and-seed/preview.ts")),
      width: W,
      height: H,
      heroes: heroes
        .map((h) => h[0])
        .filter(
          (id) => !process.env.ONLY || process.env.ONLY.split(",").includes(id),
        ),
      views: ["front", "three-quarter", "profile", "detail", "cinema", "cinema-detail"],
      beatViews: beatEvidence,
      normalMapsEnabled: !process.env.NO_NORMAL,
      referenceManifestSha256: hash(fs.readFileSync("scripts/geo/flower-and-seed/evidence/reference-manifest.json")),
      material: file.parts.find(p=>p.id==="nectar-bat")?.material,
      renderer:
        "CPU GGX / sampled RoomEnvironment / engine studio rig / actual family roughness and environment intensity / Three ACES; GPU pending",
    },
    null,
    2,
  ) + "\n",
);
