"""Offline z-buffer inspection of actual engine geometry; no browser or GPU.

pnpm tsx scripts/geo/energy-conversion/export-preview.ts
python3 scripts/geo/energy-conversion/render-preview.py /tmp/energy-preview.json scripts/geo/energy-conversion/refs/polish-final

The source export uses X/right, Y/depth, Z/up. Un-invert the teaching bicycle
for the six orthographic inspections, and also render its actual inverted pose.
"""
import json
import sys
from pathlib import Path
import numpy as np
from numba import njit
from PIL import Image, ImageDraw


@njit(cache=True)
def raster(points, normals, triangles, colors, width, height):
    canvas = np.empty((height, width, 3), np.uint8)
    canvas[:] = np.array([233, 228, 216], np.uint8)
    depth = np.full((height, width), -1e30)
    for t in range(len(triangles)):
        ia, ib, ic = triangles[t]
        a, b, c = points[ia], points[ib], points[ic]
        den = (b[1]-c[1])*(a[0]-c[0])+(c[0]-b[0])*(a[1]-c[1])
        if abs(den) < 1e-10:
            continue
        x0, x1 = max(0, int(np.floor(min(a[0], b[0], c[0])))), min(width-1, int(np.ceil(max(a[0], b[0], c[0]))))
        y0, y1 = max(0, int(np.floor(min(a[1], b[1], c[1])))), min(height-1, int(np.ceil(max(a[1], b[1], c[1]))))
        for y in range(y0, y1+1):
            for x in range(x0, x1+1):
                u = ((b[1]-c[1])*(x+.5-c[0])+(c[0]-b[0])*(y+.5-c[1]))/den
                v = ((c[1]-a[1])*(x+.5-c[0])+(a[0]-c[0])*(y+.5-c[1]))/den
                w = 1-u-v
                if min(u, v, w) < 0:
                    continue
                z = u*a[2]+v*b[2]+w*c[2]
                if z <= depth[y,x]:
                    continue
                n = u*normals[ia]+v*normals[ib]+w*normals[ic]
                n /= max(1e-10, np.sqrt(np.sum(n*n)))
                # Broad camera-space key, fill and rim. Absolute backface
                # illumination shows the same closed surfaces on either side.
                lit = .41 + .48*max(0., n[0]*-.30+n[1]*.55+n[2]*.78) + .21*max(0., n[0]*.7+n[1]*.2-n[2]*.4)
                for k in range(3):
                    canvas[y,x,k] = min(255, colors[t,k]*lit)
                depth[y,x] = z
    return canvas


def load(path):
    pieces = []
    for mesh in json.loads(Path(path).read_text()):
        if mesh['id'] not in {'bicycle-frame', 'front-wheel', 'rear-wheel', 'crank-pedals', 'bicycle-dynamo', 'dynamo-magnet', 'dynamo-coil', 'dynamo-wires', 'headlamp'}:
            continue
        p = np.array(mesh['positions'], dtype=float)
        n = np.array(mesh['normals'], dtype=float)
        p = np.column_stack((p[:,0]-.9, 1.1-p[:,2], p[:,1]+1.6))
        n = np.column_stack((n[:,0], -n[:,2], n[:,1]))
        material = mesh['material']
        color = material.get('tint') or {'rubber':'#343838', 'steel':'#b5bcba', 'powder':'#2f5d62', 'plastic':'#555957', 'casing':'#a9b1b0', 'copper':'#ac754c', 'glass':'#b7c5b8', 'token:pole-n':'#ad504b', 'token:pole-s':'#526e8d'}.get(material['color'], '#ada9a0')
        pieces.append((p, n, np.array(mesh['faces'], dtype=np.int32), np.array([int(color[i:i+2],16) for i in (1,3,5)])))
    return pieces


def render(pieces, dest, direction, target=(0,.49,0), span=1.87, up=(0,1,0)):
    direction = np.array(direction, dtype=float); direction /= np.linalg.norm(direction)
    right = np.cross(np.array(up), direction); right /= np.linalg.norm(right)
    vertical = np.cross(direction, right)
    camera = np.stack((right, vertical, direction))
    ps, ns, fs, cs = [], [], [], []
    size = (1400, 1000)
    offset = 0
    for p, n, faces, color in pieces:
        q = np.einsum("ij,kj->ik", p-np.array(target), camera)
        q[:,:2] *= size[0]/span
        q[:,0] += size[0]/2
        q[:,1] = size[1]/2-q[:,1]
        ps.append(q); ns.append(np.einsum("ij,kj->ik", n, camera)); fs.append(faces+offset); cs.append(np.tile(color,(len(faces),1)))
        offset += len(p)
    pixels = raster(np.concatenate(ps), np.concatenate(ns), np.concatenate(fs), np.concatenate(cs), *size)
    im = Image.fromarray(pixels)
    ImageDraw.Draw(im).text((22,20), dest.stem.replace('-', ' ').upper()+' | CPU GEOMETRY PREVIEW', fill='#555047')
    im.save(dest)
    print(dest, flush=True)


if __name__ == '__main__':
    pieces = load(sys.argv[1]); out = Path(sys.argv[2]); out.mkdir(parents=True, exist_ok=True)
    for name, direction, up in [('left',(0,0,1),(0,1,0)), ('right',(0,0,-1),(0,1,0)), ('front',(-1,0,0),(0,1,0)), ('rear',(1,0,0),(0,1,0)), ('top',(0,1,0),(0,0,-1)), ('bottom',(0,-1,0),(0,0,1))]:
        render(pieces,out/f'{name}.png',direction,up=up)
    render(pieces,out/'hero.png',(-.7,.42,1))
    for name, direction in [('saddle-top',(-.6,.8,1)), ('saddle-under',(.6,-.8,1)), ('saddle-side',(0,.08,1))]:
        render(pieces,out/f'{name}.png',direction,(.24,.895,0),.46)
    render(pieces,out/'steering.png',(-.9,.45,1),(-.36,.842,0),.79)
    render(pieces,out/'fork-front.png',(-1,0,0),(-.447,.494,0),.56)
    render(pieces,out/'fork-side.png',(0,0,1),(-.447,.5,0),.58)
    render(pieces,out/'dropout-front.png',(-.5,.25,1),(-.515,.335,0),.24)
    render(pieces,out/'dropout-rear.png',(.5,.2,1),(.51,.335,0),.25)
    render(pieces,out/'pedal.png',(-.5,.7,1),(.19,.425,.13),.24)
    inverted = [(p*np.array([1,-1,-1]),n*np.array([1,-1,-1]),f,c) for p,n,f,c in pieces]
    render(inverted,out/'inverted.png',(-.6,.55,1),target=(0,-.49,0))
    # Contact sheet makes the six-direction inspection reviewable at a glance.
    sheet = Image.new('RGB',(1800,858),'#e9e4d8')
    for i,name in enumerate(['left','right','front','rear','top','bottom']):
        tile=Image.open(out/f'{name}.png').resize((600,429))
        sheet.paste(tile,((i%3)*600,(i//3)*429))
    sheet.save(out/'six-directions.png')
