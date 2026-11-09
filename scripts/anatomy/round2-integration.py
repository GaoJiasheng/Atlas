from pathlib import Path
import difflib
root=Path(__file__).resolve().parents[2]
files={}
p='src/engines/space-scene/stages/model3d/GltfSource.tsx';s=(root/p).read_text();s=s.replace('if (mesh) out.set(partId, shapeOf(mesh)); // `pnpm validate` checks every node exists.', '''if (mesh) {
        const shape = shapeOf(mesh);
        const exercise = findMesh(root.getObjectByName(loaded(`exercise-${name}`)));
        if (exercise) shape.exerciseShape = { ...shapeOf(exercise), closed: false };
        else if (mesh.userData.exerciseMaskSet) shape.exerciseShape = { ...shape, pieces: [] };
        out.set(partId, shape); // `pnpm validate` checks every node exists.
      }''');files[p]=s
p='src/engines/space-scene/stages/model3d/PartNode.tsx';s=(root/p).read_text();s=s.replace('export interface PartShape {','export interface PartShape {\n  /** Muscle sheet projected onto and skinned with the mannequin; exercise only. */\n  exerciseShape?: PartShape;');s=s.replace('const shape = useMemo(() => fillGeometry ?', 'const exerciseMask = props.tintLive === true && props.shape.exerciseShape !== undefined;\n  const baseShape = exerciseMask ? props.shape.exerciseShape! : props.shape;\n  const shape = useMemo(() => fillGeometry ?');s=s.replace('{ ...props.shape, pieces: [{ ...props.shape.pieces[0]!, geometry: fillGeometry, matrices: null }] } : props.shape, [props.shape, fillGeometry]);','{ ...baseShape, pieces: [{ ...baseShape.pieces[0]!, geometry: fillGeometry, matrices: null }] } : baseShape, [baseShape, fillGeometry]);');s=s.replace('const scaled = !shape.fibre && (c > 0 || contractChanged);','const scaled = !shape.fibre && !exerciseMask && (c > 0 || contractChanged);');s=s.replace('(shape.surface?.fade ?? fadePartMaterial)(mat, m.fade * (styles[i] ?? style).look.opacity, display.ghost);','if (exerciseMask) fadePartMaterial(mat, m.fade * (styles[i] ?? style).look.opacity, display.ghost, true);\n      else (shape.surface?.fade ?? fadePartMaterial)(mat, m.fade * (styles[i] ?? style).look.opacity, display.ghost);')
s=s.replace('const animRef = useRef<Group>(null);','const animRef = useRef<Group>(null);\n  useLayoutEffect(() => { animRef.current?.matrix.identity(); }, [baseShape]);')
s=s.replace('[colorKey, shape.surface]);','[colorKey, shape.surface, shape.fibre]);')
files[p]=s
p='src/engines/space-scene/stages/model3d/bodyGeometry.ts';s=(root/p).read_text();s=s.replace("Derived geometries share the source's attribute buffers and only carry a","Derived geometries own their attribute buffers and carry a")
s=s.replace('  for (const [name, attr] of Object.entries(source.attributes)) out.setAttribute(name, attr);','  // Disposing a view must not delete buffers still bound by a live view.\n  const data = {};\n  for (const [name, attr] of Object.entries(source.attributes)) out.setAttribute(name, attr.clone(data));')
files[p]=s
patch=''
for p,s in files.items():patch+=''.join(difflib.unified_diff((root/p).read_text().splitlines(keepends=True),s.splitlines(keepends=True),fromfile='a/'+p,tofile='b/'+p))
(root/'scripts/anatomy/round2-exercise-projections.patch').write_text(patch)
print('wrote patch',len(patch))
