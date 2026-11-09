"""Neutral fitted-brief groin: repair source region before implicit reconstruction.
No floating garment, closed continuous skin, same source rig and hand split.
"""
from pathlib import Path
import json,numpy as np
r=Path(__file__).resolve().parent/'cache'
f=r/'rebuild-skin-source.json';backup=r/'round2-skin-source-before.json'
if not backup.exists():backup.write_bytes(f.read_bytes())
d=json.loads(backup.read_text());p=np.array(d['positions']).reshape(-1,3)
# Only the narrow anterior urogenital extension. The surrounding inner thighs,
# posterior perineum and inguinal attachments retain their native positions.
x,y,z=p.T;mask=(abs(x)<.055)&(y>.68)&(y<.86)&(z>-.012)
# Contract the extension into the normal continuous pubic envelope. The source
# volume is then re-unified by the existing 2 mm implicit reconstruction.
t=np.clip((.86-y)/.04,0,1);t=t*t*(3-2*t)
side=np.clip((.055-abs(x))/.022,0,1);side=side*side*(3-2*side);blend=t*side*mask
p[:,1]+=np.maximum(.825+.005*(x/.055)**2-y,0)*blend
cap=.071+.022*np.clip((y-.82)/.04,0,1)
p[:,2]-=np.maximum(z-cap,0)*blend
# Pelvic midline follows the pelvis as one surface; no separate mobile lump.
weights=np.array(d['weights']);names=d['jointNames'];pelvis=names.index('joint.trunk')
w=weights.copy();w[mask]*=(1-blend[mask,None]);w[mask,pelvis]+=blend[mask];weights=w/w.sum(1,keepdims=True)
d['positions']=p.ravel().tolist();d['weights']=weights.tolist();d['neutralGroin']={'method':'source urogenital extension contracted into fitted neutral envelope before implicit reconstruction','vertices':int((blend>0).sum()),'crotchFloorM':.825}
f.write_text(json.dumps(d,separators=(',',':')))
print(d['neutralGroin'],flush=True)
