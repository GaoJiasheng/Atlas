"""CPU depth-buffer preview of preview-geometry.ts output. Forms only, no runtime HUD/shaders."""
import base64
import json
import sys
from pathlib import Path
import numpy as np
from PIL import Image

for name in sys.argv[1:]:
    data = json.loads(Path(name).read_text())
    width, height = data['width'], data['height']
    image = np.full((height, width, 3), [233., 228., 216.])
    depth = np.full((height, width), np.inf)
    key = np.array([-.3, .75, .6]); key /= np.linalg.norm(key)
    fill = np.array([.7, .3, -.3]); fill /= np.linalg.norm(fill)
    for mesh in data['meshes']:
        p = np.frombuffer(base64.b64decode(mesh['position']), dtype=np.float32).reshape(-1, 3)
        n = np.frombuffer(base64.b64decode(mesh['normal']), dtype=np.float32).reshape(-1, 3)
        index = np.frombuffer(base64.b64decode(mesh['index']), dtype=np.uint32).reshape(-1, 3)
        color = np.array([int(mesh['color'][i:i+2], 16) for i in (1, 3, 5)])
        light = .36 + .52 * np.maximum(0, np.sum(n * key, axis=1)) + .20 * np.maximum(0, np.sum(n * fill, axis=1))
        for tri in index:
            q = p[tri]
            if np.any(q[:, 2] <= .01): continue
            x0, y0 = np.floor(q[:, :2].min(axis=0)).astype(int)
            x1, y1 = np.ceil(q[:, :2].max(axis=0)).astype(int)
            if x1 < 0 or y1 < 0 or x0 >= width or y0 >= height: continue
            x0, y0, x1, y1 = max(0, x0), max(0, y0), min(width-1, x1), min(height-1, y1)
            x, y = np.meshgrid(np.arange(x0,x1+1)+.5, np.arange(y0,y1+1)+.5)
            a, b, c = q
            den = (b[1]-c[1])*(a[0]-c[0])+(c[0]-b[0])*(a[1]-c[1])
            if abs(den) < 1e-7: continue
            u = ((b[1]-c[1])*(x-c[0])+(c[0]-b[0])*(y-c[1]))/den
            v = ((c[1]-a[1])*(x-c[0])+(a[0]-c[0])*(y-c[1]))/den
            w = 1-u-v
            z = 1/(u/a[2]+v/b[2]+w/c[2])
            region = depth[y0:y1+1,x0:x1+1]
            mask = (u>=0)&(v>=0)&(w>=0)&(z<region)
            if not np.any(mask): continue
            brightness = u*light[tri[0]]+v*light[tri[1]]+w*light[tri[2]]
            image[y0:y1+1,x0:x1+1][mask] = np.clip(color[None,:]*brightness[mask,None],0,255)
            region[mask]=z[mask]
    dest = str(Path(name).with_suffix('.png'))
    Image.fromarray(image.astype(np.uint8)).save(dest)
    print(dest, flush=True)
