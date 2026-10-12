"""Full-body mannequin weights and bilateral axis evidence, independent of topic."""
import itertools
import numpy as np

JOINT_TYPES = ('clavicle','scapula','shoulder','elbow','forearm','hand','hip','knee','ankle')
JOINT_NAMES = ['trunk']+[f'{k}.{s}' for s in ('l','r') for k in JOINT_TYPES]
POSE = {'shoulder.l.flexion':90, 'elbow.r.flexion':90, 'hip.l.flexion':60,
        'knee.r.flexion':90, 'ankle.l.dorsiflexion':15, 'ankle.r.dorsiflexion':15}


def axis_checks(joints):
    by_name = {j['name']:j for j in joints}
    rows = []
    for kind in JOINT_TYPES:
        left, right = (by_name[kind+'.'+s]['axes'] for s in ('l','r'))
        for action, axis in left.items():
            mirrored = np.array(axis)*[-1,1,1]
            actual = np.array(right[action])
            dot = float(mirrored @ actual)
            if not np.array_equal(mirrored, actual):
                raise RuntimeError(f'{kind}.{action}: right axis is not the exact X mirror')
            rows.append(dict(joint=kind, action=action, dot=dot))
    return rows


def smooth(t):
    t = np.clip(t, 0, 1)
    return t*t*(3-2*t)


def skin_weights(points, joints):
    """Smooth capsule partition: trunk/girdles, upper/lower limbs and extremities.

    Evaluate one field on both shells, without topic/source-region classifications.
    Segment stations localize bend blends around pivots rather than assigning an
    entire limb to whichever isolated joint happens to be nearest.
    """
    p = np.asarray(points, dtype=float)
    j = {n:np.asarray(v,dtype=float) for n,v in joints.items()}
    names = list(j)
    values = np.zeros((len(p),len(names)))
    mass = np.zeros(len(p))
    def capsule(a,b,radius,vector):
        delta=b-a
        t=np.clip(((p-a) @ delta)/max(float(delta @ delta),1e-12),0,1)
        closest=a+t[:,None]*delta
        distance=np.linalg.norm(p-closest,axis=1)
        score=np.exp(-.5*(distance/radius)**2)
        for name,weight in vector(t).items():
            values[:,names.index(name)] += score*weight
        mass[:] += score
    pelvis=(j['hip.l']+j['hip.r'])/2
    collar=(j['clavicle.l']+j['clavicle.r'])/2
    # Head and neck remain on trunk (neck is optional); use anatomical body
    # references so topic frame changes cannot alter the mannequin's weights.
    top=collar.copy();top[2]=float(p[:,2].max())
    capsule(pelvis,top,.085,lambda t:{'trunk':np.ones(len(t))})
    for side in ('l','r'):
        n=lambda k:k+'.'+side
        sc,shoulder,elbow,hand,hip,knee,ankle=[j[n(k)] for k in
            ('clavicle','shoulder','elbow','hand','hip','knee','ankle')]
        capsule(sc,shoulder,.055,lambda t:{n('clavicle'):1-smooth(t/.65),
            n('scapula'):smooth(t/.65)*(1-smooth((t-.35)/.65)),
            n('shoulder'):smooth(t/.65)*smooth((t-.35)/.65)})
        capsule(shoulder,elbow,.05,lambda t:{n('shoulder'):1-smooth((t-.65)/.35),
            n('elbow'):smooth((t-.65)/.35)})
        def lower_arm(t):
            proximal=1-smooth(t/.25);distal=smooth((t-.75)/.25)
            return {n('elbow'):proximal,n('forearm'):(1-proximal)*(1-distal),n('hand'):distal}
        capsule(elbow,hand,.04,lower_arm)
        tip=hand+(hand-elbow)/np.linalg.norm(hand-elbow)*.15
        capsule(hand,tip,.04,lambda t:{n('hand'):np.ones(len(t))})
        capsule(hip,knee,.08,lambda t:{n('hip'):1-smooth((t-.7)/.3),n('knee'):smooth((t-.7)/.3)})
        capsule(knee,ankle,.055,lambda t:{n('knee'):1-smooth((t-.75)/.25),n('ankle'):smooth((t-.75)/.25)})
        tip=ankle+np.array([0,-.12,-.035]) # source front -Y, sole below ankle
        capsule(ankle,tip,.055,lambda t:{n('ankle'):np.ones(len(t))})
    values/=np.maximum(values.sum(axis=1,keepdims=True),1e-100)
    # glTF permits four influences; retain the strongest continuous blends.
    result=[]
    for row in values:
        best=np.argsort(-row,kind='stable')[:4];total=row[best].sum()
        result.append({names[i]:float(row[i]/total) for i in best if row[i]>1e-12})
    return result


def shell_aliases(points, faces, thickness=.006, normal_dot=.5):
    """Pair thin opposing shells and coincident seams before repair or export.

    The simplifier can tessellate the two shells differently. Parallel surface
    planes (independent of face winding) within the 6 mm source/simplification envelope identify shared bind
    samples; their complete weight vectors are identical. Geometry stays intact.
    """
    p=np.asarray(points,dtype=float);faces=np.asarray(faces,dtype=int)
    normals=np.zeros_like(p);largest=np.zeros(len(p))
    for a,b,c in faces:
        normal=np.cross(p[b]-p[a],p[c]-p[a]);area=np.linalg.norm(normal)
        if area<=1e-15: continue
        for i in (a,b,c):
            if area>largest[i]: largest[i]=area;normals[i]=normal/area
    parent=list(range(len(p)))
    def root(i):
        while parent[i]!=i: parent[i]=parent[parent[i]];i=parent[i]
        return i
    def join(a,b):
        a,b=root(a),root(b);parent[max(a,b)]=min(a,b)
    grid={};offsets=list(itertools.product((-1,0,1),repeat=3))
    for i,point in enumerate(p):
        cell=tuple(np.floor(point/thickness).astype(int))
        for offset in offsets:
            for k in grid.get(tuple(a+b for a,b in zip(cell,offset)),()):
                distance=np.linalg.norm(point-p[k])
                alignment=float(normals[i] @ normals[k])
                parallel=abs(alignment)>normal_dot if normal_dot>=0 else alignment<normal_dot
                if distance<1e-6 or (distance<=thickness and parallel): join(i,k)
        grid.setdefault(cell,[]).append(i)
    return [root(i) for i in range(len(p))]


def match_shell_weights(weights, aliases):
    groups={}
    for i,root in enumerate(aliases): groups.setdefault(root,[]).append(i)
    for indices in groups.values():
        combined={}
        for i in indices:
            for name,weight in weights[i].items(): combined[name]=combined.get(name,0)+weight
        best=sorted(combined,key=lambda n:(-combined[n],n))[:4];total=sum(combined[n] for n in best)
        vector={n:combined[n]/total for n in best}
        for i in indices: weights[i]=vector.copy()
    return sum(len(indices)>1 for indices in groups.values())


def movement_axis(joints, name, action):
    """Match engine mirrorSignedAxes using the real left/right midline normal."""
    by_name={j['name']:j for j in joints}
    axis=np.array(by_name[name]['axes'][action],dtype=float)
    if name.endswith('.r'):
        left=by_name[name[:-1]+'l']
        normal=np.array(left['position'])-by_name[name]['position']
        normal/=np.linalg.norm(normal)
        left_axis=np.array(left['axes'][action])
        wanted=2*(normal @ left_axis)*normal-left_axis
        if axis @ wanted<0: axis=-axis
    return axis.tolist()
