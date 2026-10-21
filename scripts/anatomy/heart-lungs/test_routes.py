"""Unit tests for the pure route geometry (routes.py) and centreline de-hooking.

Run: python3 -m unittest discover -s scripts/anatomy/heart-lungs -p 'test_*.py'
(run.py --topic heart-lungs runs them before any mesh work).
"""
import sys
import unittest
from pathlib import Path

import numpy as np

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE))
sys.path.insert(0, str(HERE.parent))
import routes as R  # noqa: E402
from centrelines import dehook, geodesic_tube  # noqa: E402


def line(a, b, n=11):
    a, b = np.asarray(a, float), np.asarray(b, float)
    return a + (b - a) * np.linspace(0, 1, n)[:, None]


def tube(axis_from, axis_to, radius=.01, sides=24, rings=20):
    """Open cylinder triangles around the segment axis_from -> axis_to."""
    a, b = np.asarray(axis_from, float), np.asarray(axis_to, float)
    t = (b - a) / np.linalg.norm(b - a)
    e1 = np.cross(t, [0, 0, 1.]) if abs(t[2]) < .9 else np.cross(t, [1., 0, 0])
    e1 /= np.linalg.norm(e1)
    e2 = np.cross(t, e1)
    ang = np.linspace(0, 2 * np.pi, sides, endpoint=False)
    ring = [[a + (b - a) * s + radius * (np.cos(q) * e1 + np.sin(q) * e2) for q in ang] for s in np.linspace(0, 1, rings)]
    tris = []
    for i in range(rings - 1):
        for j in range(sides):
            p, q = ring[i][j], ring[i][(j + 1) % sides]
            r, s = ring[i + 1][j], ring[i + 1][(j + 1) % sides]
            tris += [[p, q, r], [q, s, r]]
    return np.asarray(tris)


class Resample(unittest.TestCase):
    def test_keeps_ends_and_spacing(self):
        path = R.resample([[0, 0, 0], [0, .1, 0], [.05, .1, 0]], .008)
        np.testing.assert_allclose(path[0], [0, 0, 0])
        np.testing.assert_allclose(path[-1], [.05, .1, 0])
        self.assertLessEqual(np.linalg.norm(np.diff(path, axis=0), axis=1).max(), .008 + 1e-12)

    def test_length(self):
        self.assertAlmostEqual(R.length([[0, 0, 0], [3, 4, 0]]), 5.)


class Chain(unittest.TestCase):
    def test_end_to_end_is_one_traced_piece(self):
        pieces, bridges, joins = R.chain([line([0, 0, 0], [0, .1, 0]), line([0, .1, 0], [0, .2, 0])], .005)
        self.assertEqual([k for _, k in pieces], ['traced'])
        self.assertEqual(bridges, [])
        self.assertAlmostEqual(joins[0]['gapM'], 0.)
        np.testing.assert_allclose(pieces[0][0][-1], [0, .2, 0])

    def test_branch_leaves_its_parent_where_it_starts(self):
        # Parent runs along x; the branch starts 2 mm off its middle and runs up.
        parent = line([0, 0, 0], [.2, 0, 0], 21)
        branch = line([.1, .002, 0], [.1, .1, 0])
        pieces, bridges, _ = R.chain([parent, branch], .005)
        path = pieces[0][0]
        self.assertFalse(bridges)
        self.assertLess(path[:, 0].max(), .1 + 1e-9)  # the parent beyond the branch is not on the path
        np.testing.assert_allclose(path[-1], [.1, .1, 0])

    def test_tributary_joins_its_trunk_part_way(self):
        tributary = line([.05, .1, 0], [.002, .1, 0])
        trunk = line([0, 0, 0], [0, .2, 0], 21)  # flows up; entered at y = 0.1
        pieces, _, joins = R.chain([tributary, trunk], .005)
        path = pieces[0][0]
        np.testing.assert_allclose(path[-1], [0, .2, 0])
        self.assertGreater(path[len(tributary):, 1].min(), .1 - 1e-9)  # follows the trunk downstream only
        self.assertAlmostEqual(joins[0]['enteredAtU'], .5, places=6)

    def test_gap_over_tolerance_is_a_bridge(self):
        pieces, bridges, _ = R.chain([line([0, 0, 0], [0, .1, 0]), line([0, .12, 0], [0, .2, 0])], .005)
        self.assertEqual([k for _, k in pieces], ['traced', 'bridge', 'traced'])
        self.assertAlmostEqual(bridges[0]['gapM'], .02)

    def test_start_point_enters_first_segment(self):
        pieces, _, _ = R.chain([line([0, 0, 0], [0, .1, 0])], .005, start=[.001, .05, 0])
        np.testing.assert_allclose(pieces[0][0][0], [0, .05, 0])


class Tree(unittest.TestCase):
    def setUp(self):
        self.root = line([0, .2, 0], [0, .1, 0])
        self.segs = {'left': line([0, .1, 0], [.05, .05, 0]), 'right': line([-.05, .05, 0], [0, .1, 0]),  # stored backwards
                     'left-a': line([.05, .05, 0], [.08, 0, 0]), 'far': line([.06, .06, 0], [.1, .08, 0])}

    def test_orients_and_reattaches_siblings(self):
        tree = R.build_tree(self.root, self.segs, .005, parents={'far': 'left'})
        np.testing.assert_allclose(tree['right']['path'][0], [0, .1, 0])  # flipped to run away from the root
        # 'right' starts where 'left' starts: hung on the root, not on its sibling.
        self.assertIn(tree['right']['parent'], ('__root__',))
        self.assertEqual(tree['left-a']['parent'], 'left')
        self.assertEqual(tree['far']['parent'], 'left')
        self.assertTrue(tree['far']['bridged'])

    def test_route_to_leaf(self):
        tree = R.build_tree(self.root, self.segs, .005, parents={'far': 'left'})
        pieces, names = R.tree_route(tree, 'left-a')
        self.assertEqual(names, ['left', 'left-a'])
        path = np.vstack([p for p, _ in pieces])
        np.testing.assert_allclose(path[0], [0, .2, 0])
        np.testing.assert_allclose(path[-1], [.08, 0, 0])
        pieces, _ = R.tree_route(tree, 'far')
        self.assertEqual([k for _, k in pieces], ['traced', 'bridge', 'traced'])


class Curves(unittest.TestCase):
    def test_arc_bows_away(self):
        p, q, away = [0, 0, 0], [.04, 0, 0], [.02, -.1, 0]
        a = R.arc(p, q, away, .01, .002)
        np.testing.assert_allclose(a[0], p, atol=1e-12)
        np.testing.assert_allclose(a[-1], q, atol=1e-12)
        self.assertAlmostEqual(a[:, 1].max(), .01, places=4)
        self.assertGreaterEqual(a[:, 1].min(), -1e-12)

    def test_catmull_rom_through_anchors(self):
        anchors = [[0, 0, 0], [.02, .01, 0], [.02, .01, 0], [.04, 0, 0]]
        c = R.catmull_rom(anchors, .002)
        np.testing.assert_allclose(c[0], anchors[0], atol=1e-12)
        np.testing.assert_allclose(c[-1], anchors[-1], atol=1e-12)
        self.assertLess(np.linalg.norm(c - anchors[1], axis=1).min(), .002)

    def test_spray_is_spread_and_in_band(self):
        rng = np.random.default_rng(1)
        v = rng.uniform(-.1, .1, (500, 3))
        pts = R.spray(v, np.zeros(3), .03, .08, 4)
        d = np.linalg.norm(pts, axis=1)
        self.assertTrue(((d >= .03) & (d <= .08)).all())
        self.assertEqual(len({tuple(x) for x in pts}), 4)


class Containment(unittest.TestCase):
    def setUp(self):
        self.tris = tube([0, 0, 0], [0, .1, 0])

    def test_axis_points_enclosed(self):
        hits = R.enclosure(line([0, .02, 0], [0, .08, 0], 7), self.tris)
        self.assertTrue((hits == 6).all())

    def test_outside_points_not_enclosed(self):
        hits = R.enclosure(line([.03, .02, 0], [.03, .08, 0], 7), self.tris)
        self.assertTrue((hits <= 3).all())

    def test_section_centre_recentres(self):
        c = R.section_centre(np.array([.003, .05, .001]), np.array([0, 1., 0]), self.tris, radius=.015)
        np.testing.assert_allclose(c, [0, .05, 0], atol=2e-4)

    def test_crossing_the_wall_is_found(self):
        self.assertEqual(R.segment_crossings(line([0, .05, 0], [.02, .05, 0], 4), self.tris), [1])
        self.assertEqual(R.segment_crossings(line([0, .02, 0], [0, .08, 0], 5), self.tris), [])


class GeodesicTube(unittest.TestCase):
    def test_follows_a_capped_tube_from_its_ring(self):
        # Open at y = 0.1, closed with a cone at y = 0.
        sides, rings = 16, 21
        ang = np.linspace(0, 2 * np.pi, sides, endpoint=False)
        pts = [[.006 * np.cos(q), y, .006 * np.sin(q)] for y in np.linspace(0, .1, rings) for q in ang] + [[0, -.004, 0]]
        faces = []
        for i in range(rings - 1):
            for j in range(sides):
                a, b, c, d = i * sides + j, i * sides + (j + 1) % sides, (i + 1) * sides + j, (i + 1) * sides + (j + 1) % sides
                faces += [(a, b, c), (b, d, c)]
        tip = len(pts) - 1
        faces += [(tip, (j + 1) % sides, j) for j in range(sides)]
        path = geodesic_tube(pts, faces, [[0, .2, 0]], step=.004)
        self.assertLess(np.abs(path[:, [0, 2]]).max(), .0015)  # on the axis
        self.assertGreater(path[-1, 1] - path[0, 1], .08)  # runs from the capped end to the ring


class Dehook(unittest.TestCase):
    def test_trims_a_path_that_doubles_back(self):
        out = line([0, .1, 0], [0, 0, 0], 11)          # from a mid-tube ring down to the cap...
        back = line([0, 0, .001], [0, .3, .001], 31)   # ...and back up past it
        path, trimmed = dehook(np.vstack([out, back]))
        np.testing.assert_allclose(path[0], [0, 0, 0])
        np.testing.assert_allclose(path[-1], [0, .3, .001])
        self.assertAlmostEqual(trimmed, .1, places=6)

    def test_leaves_a_curved_tube_alone(self):
        t = np.linspace(0, np.pi, 40)
        arch = np.stack([np.cos(t) * .05, np.sin(t) * .05, 0 * t], axis=1)
        path, trimmed = dehook(arch)
        self.assertEqual(trimmed, 0.)
        self.assertEqual(len(path), 40)


if __name__ == '__main__':
    unittest.main()
