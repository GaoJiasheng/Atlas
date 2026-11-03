"""Prepare a reviewable integration diff without writing outside topic ownership.

This patch is not applied. The task's ownership rule requires explicit approval
before changing these shared files. Run python3 <this file> to refresh the diff.
"""
from pathlib import Path
from difflib import unified_diff
root = Path(__file__).resolve().parents[3]
changes = {}
def edit(path, old, new):
    before = changes.get(path, (root / path).read_text())
    assert old in before, path
    changes[path] = before.replace(old, new, 1)
base = 'src/engines/space-scene/'
part = base + 'stages/model3d/PartNode.tsx'
edit(part, '  type Plane,', '  type Plane,\n  type Texture,')
edit(part, '  fibre?: FibreMeasure;\n}', '  fibre?: FibreMeasure;\n  /** Explicitly opted-in local glTF albedo; other GLBs keep family materials. */\n  surfaceMap?: Texture;\n}')
edit(part, '      stylePartMaterial(pm, styles[i] ?? style);', '''      stylePartMaterial(pm, styles[i] ?? style);
      pm.uniforms.uOrbitSurface.value = i === 0 && shape.surfaceMap ? 1 : 0;
      if (i === 0 && shape.surfaceMap) {
        pm.material.map = shape.surfaceMap;
        pm.material.color.set('#ffffff');
        pm.material.metalness = 0;
        pm.material.roughness = 1;
        pm.material.normalScale.setScalar(0);
        pm.material.needsUpdate = true;
      }''')
gltf = base + 'stages/model3d/GltfSource.tsx'
edit(gltf, 'type Mesh, type Object3D', 'type Mesh, type MeshStandardMaterial, type Object3D')
edit(gltf, '      return {\n        pieces:', '''      const sourceMaterial = (Array.isArray(mesh.material) ? mesh.material[0] : mesh.material) as MeshStandardMaterial;
      const surfaceMap = mesh.userData.atlasSurface === true ? sourceMaterial.map : null;
      return {
        ...(surfaceMap ? { surfaceMap } : {}),
        pieces:''')
mat = base + 'stages/model3d/materials.ts'
edit(mat, '  uOrbitLight: { value: number };', '  uOrbitLight: { value: number };\n  uOrbitSurface: { value: number };')
edit(mat, 'uniform float uOrbitLight;', 'uniform float uOrbitLight;\nuniform float uOrbitSurface;')
edit(mat, '    uOrbitLight: { value: 0 },', '    uOrbitLight: { value: 0 },\n    uOrbitSurface: { value: 0 },')
edit(mat, '          outgoingLight = diffuseColor.rgb * light;', '''          outgoingLight = diffuseColor.rgb * light;
          if (uOrbitSurface > 0.5) {
            if (uOrbitLight > 1.5) {
              float mu = abs(dot(normalize(normal), normalize(vViewPosition)));
              outgoingLight *= 0.4 + 0.6 * pow(mu, 0.55);
            } else {
              // Neutral teaching fill, independent of the ocean's dark albedo.
              float day = max(0.0, dot(normalize(worldNormal), uOrbitSun));
              outgoingLight = mix(vec3(uOrbitFill), diffuseColor.rgb, day);
            }
          }''')
edit(mat, "'atlas-part-5'", "'atlas-part-6'")
schema = base + 'schema.ts'
edit(schema, ".regex(/^\\/models\\/[a-z0-9][a-z0-9._-]*\\.glb$/, 'must be /models/<name>.glb')", ".regex(/^\\/models\\/(?:[a-z0-9][a-z0-9-]*\\/)?[a-z0-9][a-z0-9._-]*\\.glb$/, 'must be /models/<name>.glb or /models/<topic>/<name>.glb')")
out=[]
for path, after in changes.items():
    before=(root / path).read_text()
    out.extend(unified_diff(before.splitlines(True),after.splitlines(True),fromfile='a/'+path,tofile='b/'+path))
(root / 'scripts/geo/sun-earth-moon/surface-support.patch').write_text(''.join(out))
print('Prepared, not applied: scripts/geo/sun-earth-moon/surface-support.patch')
