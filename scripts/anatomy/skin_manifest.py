"""Engine-facing derived skin declarations (no Blender dependency)."""
SKIN_NODES = ['skin-outline', 'skin-hand.l', 'skin-hand.r', 'skin-wire']

def complete_skin_manifest(manifest):
    manifest['skinNodes'] = SKIN_NODES.copy()
    manifest['skinParts'] = {
        'skin-outline': {'hands': False, 'wristOpening': 'open'},
        'skin-hand.l': {'joint': 'hand.l', 'rigid': True},
        'skin-hand.r': {'joint': 'hand.r', 'rigid': True},
        'skin-wire': {'hands': True, 'triangleRange': [3000, 5000],
                      'simplification': 'planar dissolve then quadric collapse; barycentric source weights',
                      'maxSampledDeviationM': .035}}
    manifest['expectedNodes'] = list(dict.fromkeys(manifest['expectedNodes'] + SKIN_NODES))
    manifest['budgets']['total'].update(maxBytes=8000000, maxTriangles=500000,
                                       targetBytes=4000000, targetTriangles=350000)

