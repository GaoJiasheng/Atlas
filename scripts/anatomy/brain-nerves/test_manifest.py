"""The manifest generator's provenance gate (docs/75 §5.4): no excluded family reaches the GLB selection."""
import sys
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from manifest import ALLOWED, generate  # noqa: E402


def entry(name, parent=None, system='nervous'):
    return dict(name=name, type='MESH', triangles=100, system=system, side=None, sourceParent=parent)


class ProvenanceGate(unittest.TestCase):
    def test_allowed_families(self):
        self.assertEqual(ALLOWED, {'bp3d-zanatomy', 'brainder', 'dundee-cn'})

    def test_refuses_each_excluded_family(self):
        for family in ('unknown', 'dundee-ear', 'uw-white'):
            inventory = [entry('Frontal lobe.g'), entry('Superior frontal gyrus.l', 'Frontal lobe.g')]
            inventory[1]['side'] = 'l'
            provenance = {'Superior frontal gyrus.l': dict(family=family)}
            with self.assertRaisesRegex(RuntimeError, 'Provenance gate'):
                generate(inventory, provenance, write=False)

    def test_refuses_a_source_without_a_record(self):
        inventory = [entry('Frontal lobe.g'), entry('Superior frontal gyrus.l', 'Frontal lobe.g')]
        inventory[1]['side'] = 'l'
        with self.assertRaisesRegex(RuntimeError, 'no record'):
            generate(inventory, {}, write=False)


if __name__ == '__main__':
    unittest.main()
