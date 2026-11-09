"""Build reviewable engine diff WITHOUT writing engine files or invoking git."""
from pathlib import Path
import difflib
root=Path(__file__).resolve().parents[3]
out=[]
def replace_function(s,name,body):
 start=s.index('export function '+name+'(')
 op=s.index('{',start)
 count=1;end=op+1
 while count:
  count+=(s[end]=='{')-(s[end]=='}');end+=1
 return s[:op+1]+'\n  '+body+'\n'+s[end-1:]
p=root/'src/engines/space-scene/lib/equipment.ts';old=p.read_text();new=old
new=new.replace("import { isStanding } from './stance';","import { isStanding } from './stance';\nimport { gymBarbellShape, gymDumbbellShape, gymBenchShape, gymRackShape, gymColumnShape } from '../../../../scripts/geo/kits/muscles-gym';")
for name,body in [('barbellShape','return gymBarbellShape();'),('dumbbellShape','return gymDumbbellShape();'),('benchShape','return gymBenchShape(incline);'),('rackShape','return gymRackShape(hook);'),('columnShape','return gymColumnShape(pulley);')]:new=replace_function(new,name,body)
new=new.replace('/** Bench seat (the part that stays flat under an inclined back). */\nconst SEAT = 0.42;\n','')
# Remove only helpers that become dead after the replacement.
a=new.index('/**\n * A chamfered disc / head profile');b=new.index('export function barbellShape',a);new=new[:a]+new[b:]
out.extend(difflib.unified_diff(old.splitlines(True),new.splitlines(True),fromfile='a/'+str(p.relative_to(root)),tofile='b/'+str(p.relative_to(root))))
p=root/'src/engines/space-scene/stages/model3d/Equipment.tsx';old=p.read_text();new=old.replace("import type { EquipmentSpec }", "import { gymOutputPulleyShape } from '../../../../../scripts/geo/kits/muscles-gym';\nimport type { EquipmentSpec }")
a=new.index('function columnPulley(): EquipmentShape {');b=new.index('\n}\n',a)+2
new=new[:a]+'''function columnPulley(): EquipmentShape {
  // Same mounted output assembly as the review GLB, at the authored anchor.
  return gymOutputPulleyShape();
}'''+new[b:]
out.extend(difflib.unified_diff(old.splitlines(True),new.splitlines(True),fromfile='a/'+str(p.relative_to(root)),tofile='b/'+str(p.relative_to(root))))
(root/'scripts/geo/muscles-core/gym-runtime.patch').write_text(''.join(out))
