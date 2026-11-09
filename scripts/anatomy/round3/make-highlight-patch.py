"""Ownership requires a patch, not an edit, for shared PartNode."""
from pathlib import Path
import difflib
p=Path('src/engines/space-scene/stages/model3d/PartNode.tsx');before=p.read_text();s=before
s="import { applyExerciseMaskDepth, exerciseMaskVisible } from '../../../../content/topics/muscles-core/runtime/highlight';\n"+s
s=s.replace('const shown = !props.instantHidden && m.fade > 0.004 && (!fill || fm.shown);','const shown = !props.instantHidden && m.fade > 0.004 && (!fill || fm.shown) && exerciseMaskVisible(exerciseMask, display.tint);')
s=s.replace('const shown = !props.instantHidden && m.fade > .004 && (!props.fill || fillMotion.current.shown);','const shown = !props.instantHidden && m.fade > .004 && (!props.fill || fillMotion.current.shown) && exerciseMaskVisible(exerciseMask, display.tint);')
s=s.replace('[props.instantHidden, display.visible, props.castShadow, props.fill, props.fillBridge, handle, runtime]);','[props.instantHidden, display.visible, display.tint, exerciseMask, props.castShadow, props.fill, props.fillBridge, handle, runtime]);')
s=s.replace('      const mat = pm.material;\n      if (exerciseMask)', '''      const mat = pm.material;
      applyExerciseMaskDepth(mat, exerciseMask);
      if (exerciseMask)''')
Path('scripts/anatomy/round3/highlights.patch').write_text(''.join(difflib.unified_diff(before.splitlines(True),s.splitlines(True),fromfile='a/'+str(p),tofile='b/'+str(p))))
