"""Shared bind-space skin-weight checks; no Blender dependency.

Normal seams are welded before voting. Sub-edge-sized detached fragments borrow
surface neighbours: their artificial component-local 0/1 seeds are not independent
anatomical attachments. Larger disconnected heads retain their own topology.
"""
from collections import Counter
import numpy as np


def quantized_bind_points(points):
    """Predict the existing signed 16-bit glTF position grid without moving geometry."""
    points = np.asarray(points, dtype=float)
    centre = (points.min(axis=0)+points.max(axis=0))/2
    scale = float(np.ptp(points, axis=0).max())/2
    if scale <= 0:
        return points
    normalized = ((points-centre)/scale).astype(np.float32).astype(float)
    return np.sign(normalized)*np.floor(np.abs(normalized)*32767+.5)/32767*scale+centre


def neighbourhoods(points, faces, shell_aliases=None):
    points = np.asarray(points, dtype=float)
    adjacency = [set() for _ in points]
    areas = np.zeros(len(points))
    welded = {}
    aliases = []
    for i, p in enumerate(points):
        key = tuple(np.round(p, 6))
        root = shell_aliases[i] if shell_aliases is not None else welded.setdefault(key, i)
        aliases.append(root)
    for face in faces:
        a, b, c = face
        area = np.linalg.norm(np.cross(points[b]-points[a], points[c]-points[a])) / 6
        for i in face:
            areas[aliases[i]] += area
            adjacency[aliases[i]].update(aliases[j] for j in face if aliases[j] != aliases[i])
    roots = sorted(set(aliases))
    lengths = [np.linalg.norm(points[i]-points[j]) for i in roots for j in adjacency[i] if i < j]
    scale = float(np.median(lengths)) if lengths else 0
    unseen = set(roots)
    components = []
    while unseen:
        component, queue = set(), [unseen.pop()]
        while queue:
            i = queue.pop()
            component.add(i)
            for j in sorted(adjacency[i] & unseen):
                unseen.remove(j)
                queue.append(j)
        components.append(component)
    fragments = set()
    substantial = [c for c in components if np.linalg.norm(np.ptp(points[sorted(c)], axis=0)) > 2*scale]
    surface = sorted(set().union(*substantial)) if substantial else []
    if surface:
        for component in components:
            if component in substantial:
                continue
            for i in sorted(component):
                distances = np.linalg.norm(points[surface]-points[i], axis=1)
                near = np.argsort(distances, kind='stable')[:4]
                if distances[near[0]] <= 2*scale:
                    fragments.add(i)
                    adjacency[i].update(surface[j] for j in near)
    rings = []
    for i in roots:
        neighbours = adjacency[i] | set().union(*(adjacency[j] for j in adjacency[i]))
        neighbours.discard(i)
        # Micro-fragment votes come from the surrounding substantial surface,
        # rather than from other vertices carrying the same bogus 0/1 seeds.
        if i in fragments:
            neighbours.difference_update(fragments)
        rings.append((i, sorted(neighbours)))
    return aliases, rings, areas, fragments


def vectors(weights, joints):
    names = list(joints)
    return names, np.array([[w.get(j, 0) for j in names] for w in weights], dtype=float)


def candidates(points, values, joint_positions, rings, areas, fragments):
    dominant = np.argmax(values, axis=1)
    distances = np.linalg.norm(points-joint_positions[dominant], axis=1)
    result = []
    for i, neighbours in rings:
        if not neighbours:
            continue
        majority, votes = Counter(dominant[neighbours]).most_common(1)[0]
        average = np.average(values[neighbours], axis=0, weights=np.maximum(areas[neighbours], 1e-20))
        # A smooth joint crossover can change the dominant joint without a stray
        # weight vector. Require at least 25% mass to disagree with the local blend.
        discrepancy = np.abs(values[i]-average).sum()
        mismatch = discrepancy > .5
        far = distances[i] > 2*float(np.median(distances[neighbours]))
        fragment_seed = i in fragments and discrepancy > .02
        if votes > len(neighbours)/2 and (fragment_seed or (mismatch and dominant[i] != majority and far)):
            result.append((i, neighbours, average))
    return result


def inspect(points, faces, weights, joints, shell_aliases=None):
    points = np.asarray(points, dtype=float)
    aliases, rings, areas, fragments = neighbourhoods(points, faces, shell_aliases)
    names, values = vectors(weights, joints)
    positions = np.array([joints[j] for j in names])
    found = candidates(points, values, positions, rings, areas, fragments)
    roots = {i for i, _, _ in found}
    return {'outlierCount': len(roots), 'outlierVertices': [i for i, root in enumerate(aliases) if root in roots]}


def repair(points, faces, weights, joints, u=None, shell_aliases=None, equivalence_aliases=None):
    points = np.asarray(points, dtype=float)
    aliases, rings, areas, fragments = neighbourhoods(points, faces, shell_aliases)
    names, values = vectors(weights, joints)
    positions = np.array([joints[j] for j in names])
    u = np.array(u, dtype=float) if u is not None else None
    fixed = set()
    iterations = 0
    # Use simultaneous updates so results are independent of vertex traversal.
    while True:
        found = candidates(points, values, positions, rings, areas, fragments)
        if not found:
            break
        iterations += 1
        if iterations > len(rings):
            raise RuntimeError('Skin-weight outlier repair did not converge')
        next_values = values.copy()
        next_u = u.copy() if u is not None else None
        for i, neighbours, average in found:
            best = np.argsort(-average, kind='stable')[:4]
            next_values[i] = 0
            next_values[i, best] = average[best]/average[best].sum()
            if u is not None:
                # Component-local seeds on tiny scraps are not true fibre ends.
                # Carry the local fibre station with the replacement weight vector.
                next_u[i] = np.average(u[neighbours], weights=np.maximum(areas[neighbours], 1e-20))
            fixed.add(i)
        if equivalence_aliases is not None:
            replacements = {}
            for i, _, average in found:
                replacements.setdefault(equivalence_aliases[i], []).append(average)
            for root, averages in replacements.items():
                average = np.mean(averages, axis=0)
                best = np.argsort(-average, kind='stable')[:4]
                next_values[root] = 0
                next_values[root, best] = average[best]/average[best].sum()
            for i, root in enumerate(equivalence_aliases):
                if root in replacements:
                    next_values[i] = next_values[root]
        for i, root in enumerate(aliases):
            next_values[i] = next_values[root]
            if u is not None:
                next_u[i] = next_u[root]
        values, u = next_values, next_u
    result = [{j: float(v) for j, v in zip(names, w) if v > 0} for w in values]
    return result, u, {'outliersFixed': len(fixed), 'outlierIterations': iterations,
                       'outlierVerticesFixed': sorted(fixed)}


def monotonic_proximal(weights, u, proximal, areas):
    """Area-weighted decreasing isotonic projection, grouping equal fibre stations."""
    changed = set()
    for joint in sorted(set(proximal)):
        order = sorted((i for i, p in enumerate(proximal) if p == joint), key=lambda i: (u[i], i))
        recipients = [i for i in order if sum(v for j, v in weights[i].items() if j != joint) > 1e-12]
        blocks = []
        for i in order:
            mass = max(float(areas[i]), 1e-20)
            value = weights[i].get(joint, 0)
            if blocks and u[blocks[-1][2][-1]] == u[i]:
                total, count, indices = blocks.pop()
                blocks.append((total+value*mass, count+mass, indices+[i]))
            else:
                blocks.append((value*mass, mass, [i]))
            while len(blocks) > 1 and blocks[-2][0]/blocks[-2][1] < blocks[-1][0]/blocks[-1][1]:
                b = blocks.pop(); a = blocks.pop()
                blocks.append((a[0]+b[0], a[1]+b[1], a[2]+b[2]))
        for total, mass, indices in blocks:
            share = min(1., max(0., total/mass))
            for i in indices:
                old = weights[i].get(joint, 0)
                if abs(old-share) <= 1e-10:
                    continue
                remaining = sum(v for j, v in weights[i].items() if j != joint)
                if remaining <= 1e-12:
                    if not recipients:
                        raise RuntimeError('Monotonic projection needs a distal weight')
                    nearest = min(recipients, key=lambda k: (abs(u[k]-u[i]), k))
                    vector = weights[nearest]
                    remaining = sum(v for j, v in vector.items() if j != joint)
                else:
                    vector = weights[i]
                weights[i] = {j: v*(1-share)/remaining for j, v in vector.items() if j != joint and v > 0}
                if share > 0:
                    weights[i][joint] = share
                changed.add(i)
    return len(changed)
