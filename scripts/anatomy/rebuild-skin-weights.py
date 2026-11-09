"""Regular continuous skinning for the source-derived closed human surface.
Source branch membership is smoothed across closed panel seams; longitudinal
joint blends use measured source rig pivots, never a different human skeleton.
Regional muscle skinning and the rest-surface geometry are unchanged.
"""
from pathlib import Path
import json
import numpy as np
from scipy.sparse import coo_matrix,diags
r=Path(__file__).resolve().parent/'cache';f=r/'rebuild-skin-compact.json';d=json.loads(f.read_text())
if d.get('weightSmoothingIterations'):
    raise SystemExit('Refusing to repeat skinning: regenerate compact skin first.')
rig=json.loads((r.parent/'arms/rig.json').read_text());rc=rig['sourceCentre'];C=np.array([rc[0],rc[2],-rc[1]])
joints={j['name']:np.array(j['position'])+C for j in rig['joints']};names=d['jointNames']
def smooth(x):
    t=np.clip(x,0,1);return t*t*(3-2*t)
for name,p in d['parts'].items():
    original=np.asarray(p['weights'],dtype=np.float64);faces=np.asarray(p['indices'],dtype=np.int32).reshape(-1,3);positions=np.asarray(p['positions']);w=np.zeros_like(original)
    if name.startswith('skin-hand.'):
        w[:,names.index('joint.hand.'+name[-1])]=1
    else:
        edges=np.vstack([faces[:,[0,1]],faces[:,[1,2]],faces[:,[2,0]]]);uniq,count=np.unique(np.sort(edges,axis=1),axis=0,return_counts=True);boundary=np.unique(uniq[count==1]);doubled=np.vstack([edges,edges[:,::-1]])
        adj=coo_matrix((np.ones(len(doubled)),(doubled[:,0],doubled[:,1])),shape=(len(w),len(w))).tocsr();adj.data[:]=1;adj=diags(1/np.maximum(np.asarray(adj.sum(axis=1)).ravel(),1))@adj
        arm=[]
        for side in ['l','r']:
            ix=[names.index('joint.'+j+'.'+side) for j in ['shoulder','elbow','forearm','hand']];mask=original[:,ix].sum(1)
            for _ in range(15):mask+=(adj@mask-mask)*.5
            arm.append(mask)
        total=np.maximum(arm[0]+arm[1],1);arm=[a/total for a in arm];trunk=1-arm[0]-arm[1];y=positions[:,1]
        for side,mask in zip(['l','r'],arm):
            e=smooth((joints['elbow.'+side][1]+.055-y)/.11);h=smooth((joints['hand.'+side][1]+.03-y)/.06)
            w[:,names.index('joint.shoulder.'+side)]+=mask*(1-e)
            w[:,names.index('joint.forearm.'+side)]+=mask*e*(1-h)
            w[:,names.index('joint.hand.'+side)]+=mask*e*h
        hip=smooth((joints['hip.l'][1]+.10-y)/.24);left=smooth((positions[:,0]+.025)/.05)
        w[:,names.index('joint.trunk')]+=trunk*(1-hip)
        for side,share in [('l',left),('r',1-left)]:
            k=smooth((joints['knee.'+side][1]+.07-y)/.14);a=smooth((joints['ankle.'+side][1]+.10-y)/.09);mask=trunk*hip*share
            w[:,names.index('joint.hip.'+side)]+=mask*(1-k)
            w[:,names.index('joint.knee.'+side)]+=mask*k*(1-a)
            w[:,names.index('joint.ankle.'+side)]+=mask*k*a
        # Exact cut rings share the hand's rigid wrist transform.
        w[boundary]=original[boundary]
        p['fixedWristBoundaryVertices']=len(boundary)
    w[w<.0001]=0;w/=w.sum(axis=1,keepdims=True);p['weights']=w.tolist()
d['weightSmoothingIterations']=15;d['weightSmoothingMethod']='source arm-branch membership diffusion; measured source rig pivots and smooth longitudinal joint blends; exact wrist cut locked; hands rigid on hand joints; top four renormalized by GLB builder'
f.write_text(json.dumps(d,separators=(',',':')))
print('regularized compact continuous skin weights',flush=True)
