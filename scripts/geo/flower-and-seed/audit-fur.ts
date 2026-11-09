/** Verify the fur rebuild changed only the bat in the shipping GLB. */
import { createHash } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";
import { NodeIO } from "@gltf-transform/core";
import { ALL_EXTENSIONS } from "@gltf-transform/extensions";
import { dequantize } from "@gltf-transform/functions";
import { MeshoptDecoder } from "meshoptimizer";
const before = process.argv[2];
if (!before) throw new Error("Pass the round-1 GLB path.");
const after = "public/models/flower-and-seed.glb";
const hash = (value: Uint8Array | string) => createHash("sha256").update(value).digest("hex");
await MeshoptDecoder.ready;
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({ "meshopt.decoder": MeshoptDecoder });
async function inspect(path: string) {
  const doc = await io.read(path);
  await doc.transform(dequantize());
  return Object.fromEntries(doc.getRoot().listNodes().filter(n=>n.getMesh()).map(n=>{
    const p = n.getMesh()!.listPrimitives()[0]!, material=p.getMaterial()!;
    const geometry = hash(JSON.stringify({ matrix:n.getWorldMatrix(), extras:n.getExtras(),
      attributes:Object.fromEntries(p.listSemantics().map(s=>[s,Array.from(p.getAttribute(s)!.getArray()!)])),
      indices:Array.from(p.getIndices()!.getArray()!),
    }));
    const finish = hash(JSON.stringify({ extras:material.getExtras(),colour:material.getBaseColorFactor(),roughness:material.getRoughnessFactor(),metalness:material.getMetallicFactor(),
      textures:[material.getBaseColorTexture(),material.getNormalTexture(),material.getMetallicRoughnessTexture()].map(t=>t ? hash(t.getImage()!) : null),
    }));
    return [n.getName(),{geometry,finish,triangles:p.getIndices()!.getCount()/3}];
  }));
}
const a=await inspect(before), b=await inspect(after);
if (JSON.stringify(Object.keys(a))!==JSON.stringify(Object.keys(b))) throw new Error("Node identity changed");
const changed=Object.keys(a).filter(id=>JSON.stringify(a[id])!==JSON.stringify(b[id]));
if(JSON.stringify(changed)!==JSON.stringify(["nectar-bat"])) throw new Error(`Unexpected changed meshes: ${changed}`);
writeFileSync("scripts/geo/flower-and-seed/evidence/fur-asset-audit.json",JSON.stringify({
  beforeSha256:hash(readFileSync(before)),afterSha256:hash(readFileSync(after)),
  unchangedMeshes:Object.keys(a).length-1,changed,
  beforeBat:a["nectar-bat"],afterBat:b["nectar-bat"],
},null,2)+"\n");
console.log(`Only nectar-bat changed; ${Object.keys(a).length-1} other meshes, materials and labels identical.`);
