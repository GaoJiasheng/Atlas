/** Exercise the decoded shipping asset through the renderer's actual material bridge. */
import { readFileSync } from "node:fs";
import { beforeAll, afterAll, describe, expect, it, vi } from "vitest";
import sharp from "sharp";
import { Mesh, MeshStandardMaterial, Texture, Box3, Vector3, BufferGeometry } from "three";
import {
  GLTFLoader,
  type GLTF,
} from "three/examples/jsm/loaders/GLTFLoader.js";
import { MeshoptDecoder } from "three/examples/jsm/libs/meshopt_decoder.module.js";
import { glbLabelPoint } from "../../src/engines/space-scene/stages/model3d/glbAnchor";
import { gltfSurface } from "../../src/engines/space-scene/stages/model3d/GltfSource";
import {
  createPartMaterial,
  stylePartMaterial,
} from "../../src/engines/space-scene/stages/model3d/materials";
import { resolveMaterialLook } from "../../src/engines/space-scene/lib/color";
import { partMaterialSlots } from "../../src/engines/space-scene/lib/parts";
import { partPieces } from "../../src/engines/space-scene/stages/model3d/geometry";
import { partsFile } from "../../src/engines/space-scene/schema";
const data = partsFile.parse(
  JSON.parse(
    readFileSync("src/content/topics/flower-and-seed/data/parts.json", "utf8"),
  ),
);
const before = partsFile.parse(
  JSON.parse(
    readFileSync(
      "scripts/geo/flower-and-seed/evidence/before/parts.json",
      "utf8",
    ),
  ),
);
let gltf: GLTF;
function closeData(a: any, b: any) {
  if (typeof a === "number" && typeof b === "number") {
    expect(a).toBeCloseTo(b, 4);
    return;
  }
  if (a && b && typeof a === "object" && typeof b === "object") {
    expect(Object.keys(a)).toEqual(Object.keys(b));
    for (const k of Object.keys(a)) closeData(a[k], b[k]);
    return;
  }
  expect(a).toEqual(b);
}
beforeAll(async () => {
  vi.stubGlobal("self", globalThis);
  vi.stubGlobal("createImageBitmap", async (blob: Blob) => {
    const r = await sharp(Buffer.from(await blob.arrayBuffer()))
      .raw()
      .toBuffer({ resolveWithObject: true });
    return {
      width: r.info.width,
      height: r.info.height,
      data: r.data,
      close() {},
    };
  });
  const bytes = readFileSync(`public${data.model}`);
  gltf = await new GLTFLoader()
    .setMeshoptDecoder(MeshoptDecoder)
    .parseAsync(
      bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength),
      "",
    );
  gltf.scene.updateMatrixWorld(true);
});
afterAll(() => vi.unstubAllGlobals());
const mesh = (id: string) => gltf.scene.getObjectByName(id) as Mesh;
describe("flower-and-seed scientific rebuild", () => {
  it("preserves part identity, teaching controls, repetitions, flow and interaction targets", () => {
    expect(data.parts.map((p) => p.id)).toEqual(before.parts.map((p) => p.id));
    closeData(data.sim, before.sim);
    closeData(data.presets, before.presets);
    // Moving the bat's tongue onto the flower also moves the ONE face-contact control point.
    const flows = structuredClone(data.flows),
      pollen = flows.find((f) => f.id === "visitor-pollen") ?? flows[2]!;
    const old = before.flows.find((f) => f.id === pollen.id)!;
    expect(pollen.paths![1]!.path[1]).not.toEqual(old.paths![1]!.path[1]);
    pollen.paths![1]!.path[1] = old.paths![1]!.path[1]!;
    closeData(flows, before.flows);
    for (const p of data.parts) {
      const old = before.parts.find((o) => o.id === p.id)!;
      expect(p.repeat, p.id).toEqual(old.repeat);
      expect(p.connects, p.id).toEqual(old.connects);
      closeData(p.explode, old.explode);
    }
    // Only the bat's hover pivot moves when its tongue, rather than its nose, contacts the flower.
    expect(data.animations.map((a) => [a.id, a.target, a.kind])).toEqual(
      before.animations.map((a) => [a.id, a.target, a.kind]),
    );
    expect(Object.keys(data.poses ?? {})).toEqual(
      Object.keys(before.poses ?? {}),
    );
  });
  it("keeps all geometry plus every flow and both ground passes within budget", () => {
    expect(readFileSync(`public${data.model}`).byteLength).toBeLessThanOrEqual(
      1_500_000,
    );
    let triangles = 0,
      calls = 0;
    for (const p of data.parts) {
      calls += p.mesh ? 1 : partMaterialSlots(p).length;
      if (p.mesh) {
        const g = mesh(p.mesh).geometry;
        triangles += (g.index?.count ?? g.getAttribute("position").count) / 3;
      } else
        for (const piece of partPieces(p)) {
          if (piece.lines) {
            calls++;
            continue;
          }
          triangles +=
            ((piece.geometry.index?.count ??
              piece.geometry.getAttribute("position").count) /
              3) *
            (piece.matrices?.length ?? 1);
        }
    }
    const report = JSON.parse(
      readFileSync("scripts/geo/flower-and-seed/evidence/metrics.json", "utf8"),
    );
    expect(triangles).toBe(report.totalTriangles);
    expect(calls).toBe(report.totalMaterialCalls);
    expect(triangles).toBeLessThan(350_000);
    expect(calls + data.flows.length + 2).toBeLessThanOrEqual(80);
  });
  it.each(["fern-fronds", "fern-underside", "nectar-bat"])(
    "%s delivers regional roughness to the actual renderer material on both themes",
    (id) => {
      const source = mesh(id).material as MeshStandardMaterial;
      expect(source.userData.atlasRoughness).toBe(true);
      expect(source.roughnessMap!.channel).toBe(1);
      expect(mesh(id).geometry.hasAttribute("uv1")).toBe(true);
      for (const theme of ["paper", "cinema"] as const) {
        const pm = createPartMaterial();
        pm.material.vertexColors = true;
        const map = new Texture();
        stylePartMaterial(pm, {
          look: resolveMaterialLook(data.parts.find(p=>p.id===id)!.material!.color, {}, theme, data.parts.find(p=>p.id===id)!.material!.tint),
          kit: {
            albedo: () => null,
            normal: () => map,
            roughness: () => map,
            dispose() {},
          },
          signal: "#cc6328",
          cold: "#4f7f8c",
          cut: "#b8973c",
          ink: "#2a2824",
          rim: 0.35,
          tint: 0.05,
          hatchPx: 7,
        });
        gltfSurface(mesh(id))!.style(pm.material);
        expect(pm.material.roughnessMap).toBe(source.roughnessMap);
        expect(pm.material.roughness).toBe(["nectar-bat","fern-fronds"].includes(id) ? .96 : .62);
        expect(pm.material.color.getHexString()).toBe("ffffff");
        expect(pm.material.vertexColors).toBe(true);
        pm.material.dispose();
        map.dispose();
      }
    },
  );
  it.each(["ripe-figs", "rubber-seeds"])(
    "%s uses embedded pigmentation without raised patches",
    (id) => {
      const m = mesh(id),
        source = m.material as MeshStandardMaterial;
      expect(source.map).toBeDefined();
      expect(m.geometry.hasAttribute("uv")).toBe(true);
      const target = new MeshStandardMaterial();
      gltfSurface(m)!.style(target);
      expect(target.map).toBe(source.map);
      expect(target.roughness).toBe(source.roughness);
      expect(target.vertexColors).toBe(true);
      target.dispose();
    },
  );
  it("loads both embedded fur maps with glTF colour-space and UV orientation, leaving membranes bare", () => {
    const bat = mesh("nectar-bat"), source = bat.material as MeshStandardMaterial;
    expect(source.userData.atlasMicrostructure).toBe(true);
    expect(source.map!.colorSpace).toBe("srgb");
    expect(source.normalMap!.colorSpace).toBe("");
    for (const [map, size] of [[source.map!, [1024,512]], [source.normalMap!, [512,256]]] as const) {
      expect(map.channel).toBe(0);
      expect(map.flipY).toBe(false);
      expect([map.image.width, map.image.height]).toEqual(size);
      expect(map.image.data.length).toBeGreaterThanOrEqual(512*256*3);
    }
    for (const map of [source.map!,source.normalMap!]) {
      const image=map.image, channels=image.data.length/(image.width*image.height);
      const pixel=(x:number,y:number)=>[0,1,2].map(k=>image.data[(y*image.width+x)*channels+k]);
      const swatch=pixel(0,0);
      if(map===source.map) expect(swatch.every(v=>v>=250)).toBe(true);
      else { expect(Math.abs(swatch[0]!-128)).toBeLessThan(8); expect(Math.abs(swatch[1]!-128)).toBeLessThan(8); expect(swatch[2]).toBeGreaterThan(250); }
      let seamError=0;
      for(let x=40;x<image.width-40;x+=17){
        const a=pixel(x,image.height/32),b=pixel(x,image.height*31/32);
        seamError+=a.reduce((sum,v,k)=>sum+Math.abs(v-b[k]!),0)/3;
      }
      expect(seamError/Math.ceil((image.width-80)/17)).toBeLessThan(8);
    }
    const relief=source.normalMap!.image, reliefChannels=relief.data.length/(relief.width*relief.height);
    let reliefPixels=0;
    for(let y=12;y<relief.height-12;y+=2) for(let x=20;x<relief.width-20;x+=2) {
      const k=(y*relief.width+x)*reliefChannels;
      if(Math.abs(relief.data[k]-128)+Math.abs(relief.data[k+1]-128)>5) reliefPixels++;
    }
    expect(reliefPixels).toBeGreaterThan(1000);
    const pigment=source.map!.image, channels=pigment.data.length/(pigment.width*pigment.height);
    const mean=(v:number)=>{let sum=0;for(let x=200;x<400;x++) for(let k=0;k<3;k++) sum+=pigment.data[(Math.floor(v*pigment.height)*pigment.width+x)*channels+k];return sum/600;};
    expect(mean(.50)).toBeGreaterThan(mean(.04)*1.25);
    const g = bat.geometry, uv = g.getAttribute("uv"), finish = g.getAttribute("uv1");
    expect(uv.count).toBe(g.getAttribute("position").count);
    let skin = 0, coatTriangles = 0;
    for (let i = 0; i < uv.count; i++) if (finish.getX(i) > .3 && finish.getX(i) < .45) {
      // Every membrane vertex samples the neutral swatch, never the coat chart.
      expect(uv.getX(i)).toBeCloseTo(.001,3);
      expect(uv.getY(i)).toBeCloseTo(.001,3);
      skin++;
    }
    for (let t = 0; t < g.index!.count; t += 3) {
      const [a,b,c] = [0,1,2].map(j=>g.index!.getX(t+j));
      const area = Math.abs((uv.getX(b!)-uv.getX(a!))*(uv.getY(c!)-uv.getY(a!))-(uv.getX(c!)-uv.getX(a!))*(uv.getY(b!)-uv.getY(a!)));
      if (area > 1e-9) coatTriangles++;
    }
    expect(skin).toBeGreaterThan(500);
    expect(coatTriangles).toBeGreaterThan(1000);
    const bytes = readFileSync(`public${data.model}`), json = JSON.parse(bytes.subarray(20,20+bytes.readUInt32LE(12)).toString());
    expect(json.images).toHaveLength(9); // 3 finish masks, 2 fruits, 2 bat maps, 2 coir maps.
    for (const image of json.images) { expect(image.uri).toBeUndefined(); expect(image.bufferView).toBeTypeOf("number"); }
    for (const other of data.parts.filter(p=>p.mesh && !["nectar-bat","coconut"].includes(p.id)))
      expect((mesh(other.mesh!).material as MeshStandardMaterial).userData.atlasMicrostructure).toBeUndefined();
  });
  it.each(["paper", "cinema"] as const)("retains embedded coconut coir maps through the real surface bridge on %s", theme => {
    const object=mesh("coconut"), source=object.material as MeshStandardMaterial, pm=createPartMaterial();
    expect(source.userData.atlasSurface).toBe(true);
    expect(source.userData.atlasMicrostructure).toBe(true);
    expect(object.geometry.hasAttribute("uv")).toBe(true);
    expect(source.map!.colorSpace).toBe("srgb");
    expect(source.normalMap!.colorSpace).toBe("");
    const kitMap=new Texture();
    stylePartMaterial(pm,{look:resolveMaterialLook("plastic",{},theme,"#ffffff"),kit:{albedo:()=>kitMap,normal:()=>kitMap,roughness:()=>kitMap,dispose(){}},signal:"#cc6328",cold:"#4f7f8c",cut:"#b8973c",ink:"#2a2824",rim:.35,tint:.05,hatchPx:7});
    gltfSurface(object)!.style(pm.material);
    expect(pm.material.map).toBe(source.map);
    expect(pm.material.normalMap).toBe(source.normalMap);
    expect(pm.material.normalScale.toArray()).toEqual(source.normalScale.toArray());
    expect(pm.material.roughness).toBe(source.roughness);
    pm.material.dispose();kitMap.dispose();
  });
  it.each(["paper", "cinema"] as const)("keeps coat colour AND normal maps after real family styling on %s", theme => {
    const source = mesh("nectar-bat").material as MeshStandardMaterial, pm = createPartMaterial();
    const kitMap = new Texture();
    stylePartMaterial(pm,{look:resolveMaterialLook(data.parts.find(p=>p.id==="nectar-bat")!.material!.color,{},theme,data.parts.find(p=>p.id==="nectar-bat")!.material!.tint),kit:{albedo:()=>kitMap,normal:()=>kitMap,roughness:()=>kitMap,dispose(){}},signal:"#cc6328",cold:"#4f7f8c",cut:"#b8973c",ink:"#2a2824",rim:.35,tint:.05,hatchPx:7});
    const compile = pm.material.onBeforeCompile;
    gltfSurface(mesh("nectar-bat"))!.style(pm.material);
    expect(pm.material.map).toBe(source.map);
    expect(pm.material.normalMap).toBe(source.normalMap);
    expect(pm.material.normalScale.toArray()).toEqual(source.normalScale.toArray());
    expect(pm.material.roughnessMap).toBe(source.roughnessMap);
    expect(pm.material.roughness).toBe(.96);
    expect(pm.material.envMapIntensity).toBe(.35);
    expect(pm.material.onBeforeCompile).toBe(compile);
    pm.material.dispose(); kitMap.dispose();
  });
  it.each([undefined,false,"true",1])("retains both legacy surface paths unless the microstructure flag is exactly true (%s)", flag => {
    for (const path of ["atlasSurface","atlasRoughness"]) {
      const albedo = new Texture(), normal = new Texture(), roughness = new Texture();
      const source = new MeshStandardMaterial({map:albedo,normalMap:normal,roughnessMap:roughness});
      source.userData[path] = true;
      source.userData.atlasMicrostructure = flag;
      const object = new Mesh(new BufferGeometry(),source), target = new MeshStandardMaterial({map:new Texture(),normalMap:new Texture()});
      const before = target.clone();
      gltfSurface(object)!.style(target);
      expect(target.map).toBe(path==="atlasSurface" ? albedo : before.map);
      expect(target.normalMap).toBe(path==="atlasSurface" ? null : before.normalMap);
      expect(target.roughnessMap).toBe(path==="atlasSurface" ? null : roughness);
      if(path==="atlasRoughness") {
        const legacy=(m:MeshStandardMaterial)=>Object.fromEntries(Object.entries(m.toJSON()).filter(([k])=>!["uuid","roughnessMap","textures","images"].includes(k)));
        expect(legacy(target)).toEqual(legacy(before));
      }
      source.userData.atlasMicrostructure = true;
      source.normalScale.set(.41,.73);
      gltfSurface(object)!.style(target);
      expect(target.map).toBe(albedo); expect(target.normalMap).toBe(normal);
      expect(target.normalScale.toArray()).toEqual([.41,.73]);
      object.geometry.dispose(); source.dispose(); target.dispose(); before.dispose();
      albedo.dispose(); normal.dispose(); roughness.dispose();
    }
  });
  it("does not let the microstructure flag alone opt an ordinary legacy material in", () => {
    const source=new MeshStandardMaterial({map:new Texture(),normalMap:new Texture()});
    source.userData.atlasMicrostructure=true;
    const object=new Mesh(new BufferGeometry(),source);
    expect(gltfSurface(object)).toBeUndefined();
    source.map!.dispose();source.normalMap!.dispose();source.dispose();object.geometry.dispose();
  });
  it("keeps every label on its actual decoded part after node quantization", () => {
    const report = JSON.parse(
      readFileSync("scripts/geo/flower-and-seed/evidence/metrics.json", "utf8"),
    );
    for (const p of data.parts.filter((p) => p.mesh)) {
      const object = mesh(p.mesh!),
        point = glbLabelPoint(object)!;
      expect(point, p.id).not.toBeNull();
      const box = new Box3().setFromObject(object).expandByScalar(0.0005);
      expect(box.containsPoint(new Vector3(...point)), p.id).toBe(true);
      const bounds = report.parts[p.id].bounds;
      const expected =
        p.id === "nectar-bat"
          ? data.animations.find((a) => a.target === p.id)!.pivot!
          : bounds.min.map((n: number, i: number) => (n + bounds.max[i]) / 2);
      expect(
        new Vector3(...point).distanceTo(new Vector3(...expected)),
        p.id,
      ).toBeLessThan(0.0005);
    }
  });
  it("decodes finite smooth surfaces, with the turned frond above the table", () => {
    gltf.scene.traverse((o) => {
      if (!(o instanceof Mesh)) return;
      const g = o.geometry,
        p = g.getAttribute("position"),
        n = g.getAttribute("normal");
      let finite = true,
        min = Infinity,
        max = 0;
      for (let i = 0; i < p.count; i++) {
        finite &&= Number.isFinite(p.getX(i) + p.getY(i) + p.getZ(i));
        const length = Math.hypot(n.getX(i), n.getY(i), n.getZ(i));
        min = Math.min(min, length);
        max = Math.max(max, length);
      }
      expect(finite, o.name).toBe(true);
      expect(min, o.name).toBeGreaterThan(0.9);
      expect(max, o.name).toBeLessThan(1.05);
    });
    const box = new Box3().setFromObject(mesh("fern-underside"));
    expect(box.min.y).toBeGreaterThanOrEqual(-0.001);
    const batBox = new Box3().setFromObject(mesh("nectar-bat"));
    expect(batBox.getSize(new Vector3()).length()).toBeLessThan(0.5);
  });
});
