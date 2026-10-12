"""Independent 90° shoulder/elbow test on the decoded final GLB skin."""
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from preview import setup, pose

scene, meshes, camera = setup()
pose(scene, meshes, camera)
