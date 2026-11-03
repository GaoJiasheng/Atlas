"""Continuous original femoral repair sculptures and tissue material skins.
Their geometry is shared by the existing stage selections and the uncounted
colour surfaces, so clicking coloured tissue still hits its parent selection.
"""
import os,importlib.util
from pathlib import Path
import numpy as np
os.environ['BONE_GRID_STEP']='.0015'
spec=importlib.util.spec_from_file_location('femur',Path(__file__).with_name('cortex-mesh.py'))
f=importlib.util.module_from_spec(spec);spec.loader.exec_module(f)
x,y,z=f.x,f.y,f.z
# Diaphyseal cavity; epiphyses remain solid in these external repair studies.
cavity=f.ell([-.009,-.005,-.006],[.012,.181,.010])
bone=np.maximum(f.outer,-cavity)
# One non-planar fracture, shared by the first three stages. This cuts the
# actual volume, including its medullary cavity: no applied line or plate.
fracture=.005*np.sin(x*105)+.003*np.sin(z*147)+.004*np.sin((x+z)*223)
broken=np.maximum(bone,.0045-np.abs(y-fracture))
# Irregular hematoma contiguous around/within the break, cut to show the gap.
clot=f.ell([-.013,-.002,-.005],[.031,.030,.024])
for c,r in [([-.027,-.011,-.006],[.017,.023,.019]),([.009,.006,-.008],[.018,.019,.018]),([-.008,.020,-.007],[.021,.018,.019])]:
 clot=f.smin(clot,f.ell(c,r),.007)
clot=np.maximum(np.maximum(clot,-broken-.00015),z-.0005)
f.mesh(np.minimum(broken,clot),'/tmp/bones-polish/repair-clot-raw.json')
f.mesh(clot,'/tmp/bones-polish/repair-clot-skin-raw.json')
# A conformal external and internal callus, with a longitudinal viewing window.
cy=np.clip(y,-.072,.071);cx=-.010+.002*np.sin(y*43)
r=.017+.016*np.exp(-((y-.001)/.041)**4)
callus=(np.sqrt(((x-cx)/r)**2+((z+.006)/(r*.86))**2+((y-cy)/r)**2)-1)*r
callus=np.maximum(np.maximum(callus,-broken-.00015),z-.0005)
f.mesh(np.minimum(broken,callus),'/tmp/bones-polish/repair-soft-raw.json')
f.mesh(callus,'/tmp/bones-polish/repair-soft-skin-raw.json')
# Ossified bridge: the gap closes, with an irregular but continuous bony mass.
# A shallow anterior window exposes the healed connection without long fins.
rough=callus-.0007*np.sin(x*311)*np.sin(y*233)*np.sin(z*257)
bridge=f.ell([-.010,0,-.005],[.017,.047,.013])
bridge=np.maximum(bridge,z-.0005)
f.mesh(np.minimum(np.minimum(broken,rough),bridge),'/tmp/bones-polish/repair-hard-raw.json')
# Same femur after remodelling: a small intrinsic residual swelling, no seam.
remodel=np.maximum(f.outer-.0018*np.exp(-(y/.047)**4),-cavity)
f.mesh(remodel,'/tmp/bones-polish/repair-remodelled-raw.json')
