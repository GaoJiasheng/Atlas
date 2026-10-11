"""Read-only inventory fallback when Blender cannot start; keep node-side names."""
import json
import re
import struct
from pathlib import Path

import numpy as np

ROOT=Path(__file__).resolve().parent
CACHE=ROOT/'cache'
FILES={'muscles':'muscles-raw.glb','skeleton':'skeleton-fallback.glb',
       'regions':'regions-fallback.glb','joints':'joints-fallback.glb'}
DTYPES={5120:'i1',5121:'u1',5122:'<i2',5123:'<u2',5125:'<u4',5126:'<f4'}
WIDTHS={'SCALAR':1,'VEC2':2,'VEC3':3,'VEC4':4,'MAT4':16}


def read_glb(path):
    with path.open('rb') as stream:
        magic,version,_=struct.unpack('<III',stream.read(12))
        assert magic==0x46546C67 and version==2
        length,kind=struct.unpack('<II',stream.read(8))
        assert kind==0x4E4F534A
        doc=json.loads(stream.read(length))
        length,kind=struct.unpack('<II',stream.read(8))
        assert kind==0x004E4942
        binary=stream.read(length)
    return doc,binary


def accessor(doc,binary,index):
    a=doc['accessors'][index]
    v=doc['bufferViews'][a['bufferView']]
    dtype=np.dtype(DTYPES[a['componentType']])
    width=WIDTHS[a['type']]
    return np.ndarray((a['count'],width),dtype=dtype,buffer=binary,
                      offset=v.get('byteOffset',0)+a.get('byteOffset',0),
                      strides=(v.get('byteStride',width*dtype.itemsize),dtype.itemsize)).copy()


def matrix(node):
    if 'matrix' in node:
        return np.array(node['matrix']).reshape((4,4),order='F')
    m=np.eye(4)
    x,y,z,w=node.get('rotation',[0,0,0,1])
    m[:3,:3]=[[1-2*(y*y+z*z),2*(x*y-z*w),2*(x*z+y*w)],
               [2*(x*y+z*w),1-2*(x*x+z*z),2*(y*z-x*w)],
               [2*(x*z-y*w),2*(y*z+x*w),1-2*(x*x+y*y)]]
    m[:3,:3] @= np.diag(node.get('scale',[1,1,1]))
    m[:3,3]=node.get('translation',[0,0,0])
    return m


def inventory(path,system):
    doc,binary=read_glb(path)
    transforms,parents={},{}
    def visit(index,parent,parent_index):
        with np.errstate(all='ignore'):
            transforms[index]=parent@matrix(doc['nodes'][index])
        parents[index]=parent_index
        for child in doc['nodes'][index].get('children',[]):
            visit(child,transforms[index],index)
    for index in doc['scenes'][doc.get('scene',0)]['nodes']:
        visit(index,np.eye(4),None)
    entries=[]
    for index,node in enumerate(doc['nodes']):
        if node.get('name')=='RootNode':
            continue
        mesh=doc['meshes'][node['mesh']] if 'mesh' in node else None
        vertices,faces=[],[]
        if mesh:
            for primitive in mesh['primitives']:
                points=accessor(doc,binary,primitive['attributes']['POSITION'])
                offset=len(vertices)
                vertices.extend(points.tolist())
                ids=accessor(doc,binary,primitive['indices']).reshape(-1) if 'indices' in primitive else np.arange(len(points))
                faces.extend((ids.reshape((-1,3))+offset).tolist())
        xyz=np.column_stack((np.array(vertices).reshape((-1,3)),np.ones(len(vertices)))) if vertices else np.array([[0,0,0,1]])
        with np.errstate(all='ignore'):
            world=np.einsum('nj,ij->ni',xyz,transforms[index])[:,:3]
        # assimp bakes the FBX centimetre factor and leaves a Y-up scene.
        # Convert to the Blender source frame required by the shared manifest.
        world=world[:,[0,2,1]]*np.array([.01,-.01,.01])
        finite=bool(np.isfinite(world).all())
        centre=world.mean(0).tolist() if finite else None
        explicit=re.search(r'\.(?:[oe]\d*)?([lr])(?:\.\d+)?$',node.get('name',''))
        side=explicit[1] if explicit else ('l' if centre and centre[0]>.005 else 'r' if centre and centre[0]<-.005 else None)
        position_ids={}
        remap=[position_ids.setdefault(tuple(round(float(c),7) for c in v),len(position_ids)) for v in vertices]
        counts={}
        for face in faces:
            a,b,c=[remap[i] for i in face]
            for pair in [(a,b),(b,c),(c,a)]:
                key=tuple(sorted(pair));counts[key]=counts.get(key,0)+1
        boundary=sum(value==1 for value in counts.values())
        nonmanifold=sum(value!=2 for value in counts.values())
        entry={'name':node.get('name',f'node-{index}'),'type':'MESH' if mesh else 'EMPTY','side':side,
               'sideSource':'suffix' if explicit else 'centroid-x','system':system,
               'triangles':len(faces),'boundingBox':{'min':world.min(0).tolist(),'max':world.max(0).tolist()} if finite else None,
               'centroid':centre,'boundaryEdges':boundary,'nonmanifoldEdges':nonmanifold,'looseEdges':0,
               'closed':bool(faces) and nonmanifold==0,'finiteCoordinates':finite,
               'sourceParent':doc['nodes'][parents[index]].get('name') if parents[index] is not None else None}
        marker=re.match(r'^(.*?)\.([oeji])(?:\d*[lr])?(?:\.\d+)?$',entry['name'])
        if marker:
            geometric_side='l' if centre and centre[0]>.005 else 'r' if centre and centre[0]<-.005 else None
            if explicit and geometric_side and geometric_side!=side:
                entry['labelSide']=side;entry['side']=geometric_side;entry['sideSource']='attachment-centroid-x (label mismatch)'
            entry['attachment']={'owner':marker[1],'kind':{'o':'origin','e':'insertion','j':'landmark','i':'landmark'}[marker[2]],'centroid':centre}
        entries.append(entry)
    return entries


def matches(part,entry,side):
    if part['system']!=entry['system'] or entry['type']!='MESH' or 'attachment' in entry:
        return False
    name=re.sub(r'(?:\.[lr])?(?:\.\d+)?$','',entry['name'])
    return (name in part['objects'] or any(re.fullmatch(pattern,name) for pattern in part.get('patterns',[]))) and (side is None or side==entry['side'])


if __name__=='__main__':
    entries=[]
    for system,file in FILES.items():
        entries.extend(inventory(CACHE/file,system))
    result={'converter':'assimp fallback; Blender 5.1.2 crashes during Metal detection before Python',
            'units':'metres','up':'+Z','front':'-Y','left':'+X','objects':entries}
    (CACHE/'inventory.json').write_text(json.dumps(result,indent=2,allow_nan=False)+'\n')
    manifest=json.loads((ROOT/'chest/manifest.json').read_text())
    lines=['# Chest source inventory — human gate','','Generated with the assimp fallback because Blender could not start. '
           'Object names come from FBX **nodes**, preserving sides; assimp mesh resource names are not used. '
           'Bounds are in the metre Z-up Blender source frame. Geometric topology welds duplicated hard-normal seam vertices at source precision. Null bounds mark invalid placeholder transforms.','',
           '| Spec part | Role | Side | Exists | Triangles | Closed sources | Exact source nodes |',
           '|---|---|---|---|---:|---|---|']
    for part in manifest['parts']:
        for side in ['l','r'] if part['sides']=='bilateral' else [None]:
            selected=[e for e in entries if matches(part,e,side)]
            complete=len(selected)>=part.get('minimumObjects',1) and all(e['finiteCoordinates'] for e in selected)
            lines.append(f"| {part.get('specId',part['id'])} | {part['role']} | {side or '—'} | {'YES' if complete else 'MISSING/INVALID'} | "
                         f"{sum(e['triangles'] for e in selected):,} | {sum(e['closed'] for e in selected)}/{len(selected)} | "+'<br>'.join(e['name'] for e in selected)+' |')
    lines+=['','The sternum and ribs rows form §5.2 `thorax`; the forearm row merges radius and ulna. '
            'Muscle, neighbour, bone and skin rows include all §5.2 parts. '
            'No fascia, bursae, attachment-area surfaces or landmark cubes are selected.',
            'Anatomical attachment and movement review remains pending. Run the Blender inventory to replace this fallback gate.']
    (CACHE/'inventory-report.md').write_text('\n'.join(lines)+'\n')
    print(f'{len(entries)} source objects; {CACHE/"inventory-report.md"}')
