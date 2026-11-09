/** Compile colour-batched topic meshes, preserving every selectable part and transform. */
import {
  BufferGeometry,
  Float32BufferAttribute,
  Matrix4,
  Euler,
  Color,
} from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { Document, NodeIO } from "@gltf-transform/core";
import { ALL_EXTENSIONS } from "@gltf-transform/extensions";
import {
  weld,
  meshopt,
  dequantize,
  simplifyPrimitive,
} from "@gltf-transform/functions";
import {
  MeshoptEncoder,
  MeshoptDecoder,
  MeshoptSimplifier,
} from "meshoptimizer";
import { writeFileSync, mkdirSync, readFileSync } from "node:fs";
import {
  primitiveSchema,
  partSchema,
} from "../../../src/engines/space-scene/schema";
import { partPieces } from "../../../src/engines/space-scene/stages/model3d/geometry";
import { resolveMaterialLook } from "../../../src/engines/space-scene/lib/color";
import { partMaterialSlots } from "../../../src/engines/space-scene/lib/parts";
import sharp from "sharp";
import { fruitTexture } from "./fruit-texture";
import { batCoatMaps } from "./bat-finish";
import { coirMaps } from "./coir-finish";
import { angsana, chilli } from "./sculpt";
import { FRUITS, place } from "./layout";
import { boundsOf } from "./reuse";
import type { Prim } from "../living-things/kit";
const DIR = "scripts/geo/flower-and-seed/evidence";
const css = readFileSync("src/theme/tokens.css", "utf8"),
  at = css.indexOf(':root[data-theme="paper"] {'),
  body = css.slice(at, css.indexOf("\n}", at));
export const tokens = Object.fromEntries(
  [...body.matchAll(/--([a-z0-9-]+):\s*(#[0-9a-f]{6})/gi)].map((m) => [
    m[1]!,
    m[2]!,
  ]),
);
export function geometryOf(prims: Prim[]): BufferGeometry {
  const all: BufferGeometry[] = [];
  for (const p of prims) {
    const pieces =
      p.kind === "__mesh"
        ? [{ geometry: p.geometry as BufferGeometry, matrices: null }]
        : partPieces({ primitive: primitiveSchema.parse(p) });
    for (const piece of pieces) {
      if ("lines" in piece && piece.lines) continue;
      for (const m of piece.matrices ?? [new Matrix4()]) {
        const g = piece.geometry.clone();
        if (p.kind === "__mesh") {
          const r = (p.rotation ?? [0, 0, 0]) as number[];
          g.applyMatrix4(
            new Matrix4().makeRotationFromEuler(
              new Euler(
                (r[0]! * Math.PI) / 180,
                (r[1]! * Math.PI) / 180,
                (r[2]! * Math.PI) / 180,
              ),
            ),
          );
        } else g.applyMatrix4(m);
        g.translate(...p.at);
        const pos = g.getAttribute("position"),
          old = g.getAttribute("color"),
          cols: number[] = [],
          look = resolveMaterialLook(
            String(p.color),
            tokens,
            "paper",
            p.tint as string | undefined,
          ),
          color = new Color(look.color);
        for (let i = 0; i < pos.count; i++)
          cols.push(
            old ? old.getX(i) : color.r,
            old ? old.getY(i) : color.g,
            old ? old.getZ(i) : color.b,
          );
        g.setAttribute("color", new Float32BufferAttribute(cols, 3));
        if (!g.index)
          g.setIndex(Array.from({ length: pos.count }, (_, i) => i));
        for (const k of Object.keys(g.attributes))
          if (!["position", "normal", "color", "uv", "uv1"].includes(k))
            g.deleteAttribute(k);
        if (!g.hasAttribute("uv1"))
          g.setAttribute(
            "uv1",
            new Float32BufferAttribute(
              Array.from({ length: pos.count * 2 }, () => 0.125),
              2,
            ),
          );
        if (!g.hasAttribute("uv"))
          g.setAttribute(
            "uv",
            new Float32BufferAttribute(
              Array.from({ length: pos.count * 2 }, () => 0.001),
              2,
            ),
          );
        all.push(g);
      }
    }
  }
  const g = mergeGeometries(all, false);
  if (!g) throw new Error("incompatible mesh attributes");
  return g;
}
// Opaque multicolour diagrams retain their original geometry but become one colour batch.
const batches = new Set([
  "fern-fronds",
  "fern-underside",
  "sorus-close",
  "moss-cushion",
  "moss-capsules",
  "flower",
  "flower-section",
  "stamens",
  "pistil",
  "sepals",
  "sunbird",
  "red-flower",
  "nectar-bat",
  "durian-flowers",
  "fig-cut",
  "angsana-pod",
  "sea-almond",
  "sea-almond-cut",
  "coconut",
  "chilli-young",
  "chilli-cut",
  "ripe-figs",
  "rubber-capsule",
  "rubber-seeds",
  "balsam-pod",
  "rubber-valves",
  "balsam-valves",
  "bean-whole",
  "bean-cut",
  "bean-sprout",
  "towel-dish",
  "bean-seedling-close",
  "male-cell",
  "female-cell",
  "sperm",
]);
const rough: Record<string, number> = {
  "fern-fronds": 0.38,
  "fern-underside": 0.48,
  "nectar-bat": 0.72,
  sunbird: 0.82,
  coconut: 0.86,
  "sea-almond": 0.45,
  "chilli-young": 0.35,
  "chilli-cut": 0.43,
  "rubber-seeds": 0.34,
};
export async function bake(data: any) {
  const doc = new Document(),
    buffer = doc.createBuffer(),
    scene = doc.createScene("flower-and-seed");
  doc.getRoot().getAsset().copyright =
    "Atlas original procedural scientific study, 2026. MIT (repository LICENSE). No third-party meshes or photo textures.";
  const report: Record<string, unknown> = {};
  let tris = 0,
    calls = 0;
  for (const p of data.parts) {
    if (!batches.has(p.id)) {
      const parsed = partSchema.parse(p);
      calls += partMaterialSlots(parsed).length;
      for (const piece of partPieces(parsed)) {
        if (piece.lines) continue;
        tris +=
          ((piece.geometry.index?.count ??
            piece.geometry.getAttribute("position").count) /
            3) *
          (piece.matrices?.length ?? 1);
      }
      continue;
    }
    let prims = [p.primitive, ...(p.extra ?? [])];
    if (p.id === "chilli-young" || p.id === "chilli-cut") {
      const target = boundsOf(prims).centre;
      const g = geometryOf(
        place(
          FRUITS,
          chilli(p.id === "chilli-cut"),
          [0, 0, 0],
          p.id === "chilli-young" ? 70 : 105,
        ),
      );
      g.computeBoundingBox();
      const b = g.boundingBox!,
        c = b.getCenter(new (await import("three")).Vector3());
      g.translate(target[0] - c.x, -b.min.y, target[2] - c.z);
      prims = [
        {
          kind: "__mesh",
          at: [0, 0, 0],
          geometry: g,
          color: "plastic",
          tint: "#ffffff",
        },
      ];
    }
    if (p.id === "angsana-pod") {
      const target = boundsOf(prims).centre,
        ps = place(FRUITS, angsana(), [0, 0, 0], 20),
        g = geometryOf(ps);
      g.computeBoundingBox();
      const b = g.boundingBox!,
        c = b.getCenter(new (await import("three")).Vector3());
      g.translate(target[0] - c.x, -b.min.y, target[2] - c.z);
      prims = [
        {
          kind: "__mesh",
          at: [0, 0, 0],
          geometry: g,
          color: "plastic",
          tint: "#ffffff",
        },
      ];
    }
    const g = geometryOf(prims),
      pos = g.getAttribute("position");
    g.computeBoundingBox();
    if (
      [
        "fern-underside",
        "ripe-figs",
        "rubber-seeds",
        "rubber-valves",
        "balsam-pod",
        "coconut",
        "sea-almond-cut",
        "bean-whole",
      ].includes(p.id)
    ) {
      g.translate(0, -g.boundingBox!.min.y, 0);
      g.computeBoundingBox();
    }
    const box = g.boundingBox!;
    // Keep positions in world coordinates, matching the original per-part animation pivots.
    const material = doc
      .createMaterial(p.id)
      .setBaseColorFactor([1, 1, 1, 1])
      .setRoughnessFactor(rough[p.id] ?? 0.68)
      .setMetallicFactor(0)
      .setDoubleSided(true)
      .setExtras({ atlasSurface: true });
    if (["fern-fronds", "fern-underside", "nectar-bat"].includes(p.id)) {
      const png = await sharp(
          Buffer.from(p.id === "nectar-bat"
            ? [245,245,245,160,160,160,36,36,36,153,153,153]
            : p.id === "fern-fronds" ? [255,255,255,217,217,217,45,45,45,98,98,98] : [255,255,255,217,217,217,45,45,45,153,153,153]),
          { raw: { width: 4, height: 1, channels: 3 } },
        )
          .png()
          .toBuffer(),
        texture = doc
          .createTexture(p.id + "-finish")
          .setImage(png)
          .setMimeType("image/png");
      material
        .setMetallicRoughnessTexture(texture)
        .setExtras({ atlasRoughness: true });
      material
        .getMetallicRoughnessTextureInfo()!
        .setTexCoord(1)
        .setMagFilter(9728)
        .setMinFilter(9728);
    }
    if (["rubber-seeds", "ripe-figs"].includes(p.id)) {
      const texture = doc
        .createTexture(p.id + "-pigment")
        .setImage(await fruitTexture(p.id))
        .setMimeType("image/png");
      material.setBaseColorTexture(texture);
      material.getBaseColorTextureInfo()!.setWrapS(10497).setWrapT(10497);
    }
    if (p.id === "nectar-bat") {
      const coat = await batCoatMaps();
      material.setBaseColorTexture(doc.createTexture("nectar-bat-short-fur-colour").setImage(coat.colour).setMimeType("image/jpeg"));
      material.setNormalTexture(doc.createTexture("nectar-bat-short-fur-normal").setImage(coat.normal).setMimeType("image/jpeg"));
      material.setNormalScale(.43).setExtras({ ...material.getExtras(), atlasMicrostructure: true });
      for (const info of [material.getBaseColorTextureInfo()!, material.getNormalTextureInfo()!])
        info.setWrapS(33071).setWrapT(33071);
    }
    if (p.id === "coconut") {
      const finish=await coirMaps();
      material.setBaseColorTexture(doc.createTexture("coconut-coir-pigment").setImage(finish.color).setMimeType("image/jpeg"));
      material.setNormalTexture(doc.createTexture("coconut-coir-relief").setImage(finish.normal).setMimeType("image/jpeg"));
      material.setNormalScale(.55).setExtras({atlasSurface:true,atlasMicrostructure:true});
      for(const info of [material.getBaseColorTextureInfo()!,material.getNormalTextureInfo()!])info.setWrapS(33071).setWrapT(33071);
    }
    const primitive = doc.createPrimitive().setMaterial(material);
    for (const [name, semantic, type] of [
      ["position", "POSITION", "VEC3"],
      ["normal", "NORMAL", "VEC3"],
      ["color", "COLOR_0", "VEC3"],
    ] as const) {
      const a = g.getAttribute(name);
      primitive.setAttribute(
        semantic,
        doc
          .createAccessor()
          .setType(type)
          .setArray(new Float32Array(a.array))
          .setBuffer(buffer),
      );
    }
    if (["rubber-seeds", "ripe-figs", "nectar-bat", "coconut"].includes(p.id)) {
      const uv = g.getAttribute("uv");
      primitive.setAttribute(
        "TEXCOORD_0",
        doc
          .createAccessor()
          .setType("VEC2")
          .setArray(new Float32Array(uv.array))
          .setBuffer(buffer),
      );
    }
    if (["fern-fronds", "fern-underside", "nectar-bat"].includes(p.id)) {
      const uv = g.getAttribute("uv1");
      primitive.setAttribute(
        "TEXCOORD_1",
        doc
          .createAccessor()
          .setType("VEC2")
          .setArray(new Float32Array(uv.array))
          .setBuffer(buffer),
      );
    }
    primitive.setIndices(
      doc
        .createAccessor()
        .setType("SCALAR")
        .setArray(new Uint32Array(g.index!.array))
        .setBuffer(buffer),
    );
    const center = box.getCenter(new (await import("three")).Vector3());
    scene.addChild(
      doc
        .createNode(p.id)
        .setMesh(doc.createMesh(p.id).addPrimitive(primitive))
        .setExtras({
          closed: ![
            "nectar-bat",
            "fern-fronds",
            "fern-underside",
            "angsana-pod",
          ].includes(p.id),
          labelPoint: p.id === "nectar-bat" ? p.primitive.at : center.toArray(),
        }),
    );
    report[p.id] = {
      triangles: g.index!.count / 3,
      drawCalls: 1,
      bounds: { min: box.min.toArray(), max: box.max.toArray() },
      vertices: pos.count,
    };
    tris += g.index!.count / 3;
    calls++;
    delete p.primitive;
    delete p.extra;
    p.mesh = p.id;
    p.material = { color: ["nectar-bat","fern-fronds"].includes(p.id) ? "fabric" : "plastic", tint: "#ffffff" };
  }
  await Promise.all([
    MeshoptEncoder.ready,
    MeshoptDecoder.ready,
    MeshoptSimplifier.ready,
  ]);
  await doc.transform(weld());
  for (const mesh of doc.getRoot().listMeshes()) {
    const p = mesh.listPrimitives()[0]!,
      c = p.getAttribute("COLOR_0")!,
      n = p.getAttribute("NORMAL")!,
      attributes = new Float32Array(c.getCount() * 6);
    for (let i = 0; i < c.getCount(); i++) {
      attributes.set(n.getElement(i, [0, 0, 0]), i * 6);
      attributes.set(c.getElement(i, [0, 0, 0]), i * 6 + 3);
    }
    const simplifier = {
      ...MeshoptSimplifier,
      simplify: (
        ix: Uint32Array,
        pos: Float32Array,
        stride: number,
        target: number,
        error: number,
        flags: "LockBorder"[],
      ) =>
        MeshoptSimplifier.simplifyWithAttributes(
          ix,
          pos,
          stride,
          attributes,
          6,
          [0.05, 0.05, 0.05, 0.03, 0.03, 0.03],
          null,
          target,
          error,
          flags,
        ),
    };
    simplifyPrimitive(p, {
      simplifier,
      ratio: mesh.getName() === "durian-flowers" ? .30 : mesh.getName() === "coconut" ? .29 : mesh.getName() === "moss-cushion" ? .24 : mesh.getName() === "fern-fronds" ? .30 : mesh.getName() === "fig-cut" ? .22 : .38,
      error: mesh.getName() === "fig-cut" ? .0035 : mesh.getName() === "coconut" ? .0009 : mesh.getName() === "nectar-bat" ? 0.0006 : 0.0012,
      lockBorder: true,
    });
  }
  for (const mesh of doc.getRoot().listMeshes()) {
    const c = mesh.listPrimitives()[0]!.getAttribute("COLOR_0")!.getArray()!;
    // Coarse quantization crossed colour-channel thresholds on the dark membrane,
    // producing green/purple patches under the real studio rig. Preserve this part.
    const refined = new Set(["fern-fronds","moss-cushion","red-flower","sea-almond-cut","fig-cut","durian-flowers","ripe-figs"]);
    const levels = ["nectar-bat","coconut"].includes(mesh.getName()) ? 127 : refined.has(mesh.getName()) ? 63 : 31;
    for (let i = 0; i < c.length; i++)
      c[i] = Math.round(c[i]! * levels) / levels;
  }
  const rebuiltGrid=new Set(["fern-fronds","moss-cushion","red-flower","fig-cut","durian-flowers","ripe-figs"]);
  for(const mesh of doc.getRoot().listMeshes()) {
    if(!rebuiltGrid.has(mesh.getName()))continue;
    const primitive=mesh.listPrimitives()[0]!;
    const a=primitive.getAttribute("POSITION")!,b=a.getMin([0,0,0]),c=a.getMax([0,0,0]),step=Math.max(...c.map((x,i)=>x-b[i]!))/4095;
    for(let i=0;i<a.getCount();i++)a.setElement(i,a.getElement(i,[0,0,0]).map((x,k)=>b[k]!+Math.round((x-b[k]!)/step)*step));
  }
  await doc.transform(
    weld(),
    meshopt({
      encoder: MeshoptEncoder,
      level: "high",
      quantizePosition: 14,
      quantizeNormal: 8,
      quantizeColor: 8,
    }),
  );
  // Quantization changes each node frame. extras.labelPoint must be LOCAL to that
  // final frame, because the runtime glbLabelPoint() applies matrixWorld.
  for (const node of doc.getRoot().listNodes()) {
    const extras = node.getExtras();
    if (!Array.isArray(extras.labelPoint)) continue;
    const local = new (await import("three")).Vector3(
      ...(extras.labelPoint as [number, number, number]),
    ).applyMatrix4(new Matrix4().fromArray(node.getWorldMatrix()).invert());
    node.setExtras({ ...extras, labelPoint: local.toArray() });
  }
  const io = new NodeIO()
    .registerExtensions(ALL_EXTENSIONS)
    .registerDependencies({
      "meshopt.encoder": MeshoptEncoder,
      "meshopt.decoder": MeshoptDecoder,
    });
  mkdirSync(DIR, { recursive: true });
  writeFileSync(
    `${DIR}/working-metrics.json`,
    JSON.stringify(
      Object.fromEntries(
        doc
          .getRoot()
          .listMeshes()
          .map((m) => [
            m.getName(),
            m.listPrimitives()[0]!.getIndices()!.getCount() / 3,
          ]),
      ),
      null,
      2,
    ),
  );
  const bytes = await io.writeBinary(doc);
  console.log(`working triangles: ${tris}, bytes: ${bytes.byteLength}`);
  if (bytes.byteLength > 1_500_000) writeFileSync(`${DIR}/oversize.glb`,bytes);
  if (bytes.byteLength > 1_500_000)
    throw new Error(`GLB exceeds 1.5 MB: ${bytes.byteLength}`);
  mkdirSync("public/models", { recursive: true });
  writeFileSync("public/models/flower-and-seed.glb", bytes);
  data.model = "/models/flower-and-seed.glb";
  // Count the compressed deliverable, not the pre-weld working geometry.
  const decoded = await io.readBinary(bytes);
  await decoded.transform(dequantize());
  for (const n of decoded.getRoot().listNodes()) {
    const p = n.getMesh()?.listPrimitives()[0];
    if (!p) continue;
    const entry = report[n.getName()] as any;
    const count = p.getIndices()!.getCount() / 3;
    tris += count - entry.triangles;
    entry.triangles = count;
  }
  mkdirSync(DIR, { recursive: true });
  writeFileSync(
    `${DIR}/metrics.json`,
    JSON.stringify(
      {
        bytes: bytes.byteLength,
        totalTriangles: tris,
        totalMaterialCalls: calls,
        parts: report,
      },
      null,
      2,
    ),
  );
  console.log(
    `flower-and-seed GLB: ${bytes.byteLength} bytes; table before visibility ${tris} triangles / ${calls} material calls`,
  );
  return data;
}
