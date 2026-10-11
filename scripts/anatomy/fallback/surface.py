"""Exact nearest-triangle queries with a conservative centroid search."""
import numpy as np
from scipy.spatial import cKDTree


def triangle_distances_squared(points, triangles):
    a, b, c = triangles[:, 0], triangles[:, 1], triangles[:, 2]
    v0, v1, v2 = b-a, c-a, points-a
    normal = np.cross(v0, v1)
    plane = np.sum(v2*normal, axis=1)**2 / np.maximum(1e-30, np.sum(normal*normal, axis=1))
    d00, d01, d11 = np.sum(v0*v0, axis=1), np.sum(v0*v1, axis=1), np.sum(v1*v1, axis=1)
    d20, d21 = np.sum(v2*v0, axis=1), np.sum(v2*v1, axis=1)
    denominator = d00*d11-d01*d01
    u = (d11*d20-d01*d21)/np.maximum(1e-30, denominator)
    v = (d00*d21-d01*d20)/np.maximum(1e-30, denominator)
    inside = (denominator > 1e-24) & (u >= 0) & (v >= 0) & (u+v <= 1)
    edges = []
    for start, end in [(a, b), (b, c), (c, a)]:
        edge = end-start
        t = np.sum((points-start)*edge, axis=1)/np.maximum(1e-30, np.sum(edge*edge, axis=1))
        nearest = start+edge*np.clip(t, 0, 1)[:, None]
        edges.append(np.sum((points-nearest)**2, axis=1))
    return np.where(inside, plane, np.min(edges, axis=0))


class Surface:
    def __init__(self, points, faces):
        self.triangles = np.asarray(points)[np.asarray(faces, dtype=int)]
        centres = self.triangles.mean(1)
        self.tree = cKDTree(centres)
        self.radius = float(np.linalg.norm(self.triangles-centres[:, None, :], axis=2).max())

    def query(self, points):
        points = np.asarray(points)
        scalar = points.ndim == 1
        points = points.reshape((-1, 3))
        distances, triangles = [], []
        for start in range(0, len(points), 100):
            chunk = points[start:start+100]
            _, initial = self.tree.query(chunk, k=min(4, len(self.triangles)))
            initial = initial.reshape((len(chunk), -1))
            d2 = triangle_distances_squared(np.repeat(chunk, initial.shape[1], axis=0),
                                            self.triangles[initial.ravel()]).reshape(initial.shape)
            bounds = np.sqrt(d2.min(1))+self.radius+1e-8
            candidates = self.tree.query_ball_point(chunk, bounds)
            lengths = [len(ids) for ids in candidates]
            rows = np.repeat(np.arange(len(chunk)), lengths)
            ids = np.concatenate(candidates)
            exact = triangle_distances_squared(chunk[rows], self.triangles[ids])
            best = np.full(len(chunk), np.inf)
            np.minimum.at(best, rows, exact)
            nearest = np.full(len(chunk), -1, dtype=int)
            matches = exact == best[rows]
            nearest[rows[matches]] = ids[matches]
            distances.extend(np.sqrt(best))
            triangles.extend(nearest)
        result = np.asarray(distances), np.asarray(triangles)
        return (result[0][0], result[1][0]) if scalar else result
