"""Attachment ownership, independent of which display bones a topic exports."""

STATIC = {'skull', 'cervical-spine', 'thoracic-spine', 'lumbar-spine', 'sternum',
          'ribs', 'thorax', 'pelvis', 'linea-alba', 'external-oblique'}
BONE_JOINT = {'clavicle':'clavicle', 'scapula':'scapula', 'humerus':'shoulder',
              'forearm':'elbow', 'ulna':'elbow', 'radius':'forearm', 'hand':'hand',
              'femur':'hip', 'patella':'knee', 'lower-leg':'knee', 'foot':'ankle',
              'iliotibial-tract':'hip', 'tensor-fasciae-latae':'hip', 'gluteus-maximus':'hip'}


def attachment_joint(bone, side, pronation=False, chest=False):
    if bone in STATIC:
        return 'trunk'
    kind = BONE_JOINT[bone]  # Unknown attachment owners must fail, never fall back.
    if kind == 'forearm' and not pronation:
        kind = 'elbow'
    if chest and kind == 'hand':
        kind = 'wrist'
    if side not in ('l', 'r'):
        raise ValueError(f'Sided attachment {bone} has no side')
    return kind + '.' + side


def parents(names):
    result = {'trunk': None}
    for side in ('l', 'r'):
        for chain in (['trunk']+[k+'.'+side for k in ('clavicle','scapula','shoulder','elbow')]
                      + ([f'forearm.{side}'] if f'forearm.{side}' in names else [])
                      + [f'hand.{side}'], ['trunk']+[k+'.'+side for k in ('hip','knee','ankle')]):
            for a,b in zip(chain, chain[1:]):
                result[b] = a
    return result


def joint_path(a, b, parent):
    def ancestors(n):
        path = [n]
        while parent.get(n) is not None:
            n = parent[n]
            path.append(n)
        return path
    pa,pb = ancestors(a),ancestors(b)
    common = next(n for n in pa if n in pb)
    path = pa[:pa.index(common)+1]+list(reversed(pb[:pb.index(common)]))
    # Preserve the established torso-to-arm blend (no extra girdle drag).
    if a == 'trunk' and b.startswith(('shoulder.', 'elbow.', 'forearm.', 'hand.', 'wrist.')):
        path = [n for n in path if not n.startswith(('clavicle.', 'scapula.'))]
    return path


def complete_manifest(manifest):
    """Close all attachment joints over their parents; leave display parts alone."""
    from full_body import JOINT_NAMES
    from skin_manifest import complete_skin_manifest
    complete_skin_manifest(manifest)
    declared = list(JOINT_NAMES)
    manifest['handGripOffsetM'] = .08
    names = set(declared)
    for part in manifest['parts']:
        if part['role'] not in ('region', 'neighbour'):
            continue
        for side in ('l','r') if part['sides'] == 'bilateral' else (None,):
            for bone in part['origin']+part['insertion']:
                names.add(attachment_joint(bone, side, f'forearm.{side}' in names))
    parent = parents(names)
    for name in list(names):
        while parent.get(name) is not None:
            name = parent[name]
            names.add(name)
    order = ['trunk']+[k+'.'+s for s in ('l','r') for k in
                          ('clavicle','scapula','shoulder','elbow','forearm','hand','hip','knee','ankle')]
    unknown = names - set(order)
    if unknown:
        raise ValueError(f'Unsupported declared rig joints: {sorted(unknown)}')
    # Topic declarations include motion joints without exported display bones.
    # Preserve those declarations, adding only missing attachment/parent joints.
    manifest['jointNames'] = declared + [n for n in order if n in names and n not in declared]
    manifest['expectedNodes'] = [n for n in manifest['expectedNodes'] if not n.startswith('joint.')]+[
        'joint.'+n for n in manifest['jointNames']]


# Reviewed boundary conditions, in source Z-up coordinates. Bounds selectors
# survive different topic frames and simplification without fragile vertex IDs.
FIBRE_OVERRIDES = {
    'trapezius-descending': {'origin': {'axis':'absX', 'end':'min'},
                            'insertion': {'axis':'absX', 'end':'max'}, 'bandM': .003},
    'iliocostalis-thoracis': {'origin': {'axis':'z', 'end':'min'},
                            'insertion': {'axis':'z', 'end':'max'}, 'bandM': .003},
    'spinalis-thoracis': {'origin': {'axis':'z', 'end':'min'},
                        'insertion': {'axis':'z', 'end':'max'}, 'bandM': .003},
}
