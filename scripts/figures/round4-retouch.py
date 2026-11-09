"""Original-pixel corrections only; no regeneration, rescaling or outline edits.

Run with Python + Pillow, numpy, OpenCV, then round4-review.ts. Frozen source
WebPs are the files present at the start of round 4. Output PNGs are lossless
retouch masters, not new drawings. Only inscription bands and the mouth change.
"""
from hashlib import sha256
from pathlib import Path

import cv2
import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parents[2]
OUT = Path('/private/tmp/atlas-ia-round4')
OUT.mkdir(parents=True, exist_ok=True)


def original(name, digest):
    file = ROOT / 'scripts/figures/materials' / f'round4-{name}-original.webp'
    assert sha256(file.read_bytes()).hexdigest() == digest
    a = np.array(Image.open(file).convert('RGBA'))
    assert a.shape == (900, 1200, 4)
    return a


def graphite(sample, height, width, seed):
    """Overlap nearby unmarked graphite samples; no generated noise or motifs."""
    rng = np.random.default_rng(seed)
    field = np.zeros((height, width, 3), float)
    weights = np.zeros((height, width, 1), float)
    size, step = 10, 5
    weight = np.outer(np.hanning(size + 2)[1:-1], np.hanning(size + 2)[1:-1])[:, :, None]
    for y in range(-step, height, step):
        for x in range(-step, width, step):
            sy = rng.integers(0, sample.shape[0] - size + 1)
            sx = rng.integers(0, sample.shape[1] - size + 1)
            patch = sample[sy:sy + size, sx:sx + size].copy()
            if rng.random() < .5:
                patch = patch[:, ::-1]
            if rng.random() < .5:
                patch = patch[::-1]
            ya, xa = max(y, 0), max(x, 0)
            yb, xb = min(y + size, height), min(x + size, width)
            w = weight[ya - y:yb - y, xa - x:xb - x]
            field[ya:yb, xa:xb] += patch[ya - y:yb - y, xa - x:xb - x] * w
            weights[ya:yb, xa:xb] += w
    assert np.all(weights > 0)
    return field / weights


def save(id, before, after, mask):
    changed = np.any(before != after, axis=2)
    assert np.all(~changed | (mask > 0)), 'Changes escaped the approved local masks'
    assert np.array_equal(before[:, :, 3], after[:, :, 3]), 'Original silhouette/alpha changed'
    assert np.array_equal(before[mask == 0], after[mask == 0])
    assert np.count_nonzero(changed) < before.shape[0] * before.shape[1] * .02
    Image.fromarray(after).save(OUT / f'{id}-master.png')
    Image.fromarray(mask).save(OUT / f'{id}-mask.png')
    print(f'{id}: {np.count_nonzero(changed)} locally edited pixels; all other pixels and alpha exact')


def tally():
    a = original('tiger-tally', 'df9a360aabe5fca7a6fad019d308deb253880e450b02867f07b09b92807c931e')
    out = a.copy()
    mask = np.zeros(a.shape[:2], np.uint8)
    # Two narrow internal bands only, never touching an animal/peg contour.
    bands = [(523, 564, 315, 562, 528, 565, 38, 24),
             (639, 679, 322, 554, 638, 560, 40, 25)]
    for seed, (x0, x1, y0, y1, sx, sy, sw, sh) in enumerate(bands):
        sample = a[sy:sy + sh, sx:sx + sw, :3].astype(float)
        sample -= cv2.GaussianBlur(sample, (0, 0), 3)
        height, width = y1 - y0, x1 - x0
        grain = graphite(sample, height, width, 31 + seed) * 1.5
        left = np.median(a[y0:y1, x0 - 4:x0, :3], axis=1)
        right = np.median(a[y0:y1, x1:x1 + 4, :3], axis=1)
        left = cv2.GaussianBlur(left, (1, 0), 10)
        right = cv2.GaussianBlur(right, (1, 0), 10)
        u = np.linspace(0, 1, width)[None, :, None]
        tone = left[:, None, :] * (1 - u) + right[:, None, :] * u
        xx = np.minimum(np.arange(width), np.arange(width)[::-1])
        yy = np.minimum(np.arange(height), np.arange(height)[::-1])
        m = np.clip(np.minimum(xx[None, :], yy[:, None]) / 4, 0, 1)
        blank = np.clip(tone + grain, 0, 255)
        out[y0:y1, x0:x1, :3] = np.rint(
            a[y0:y1, x0:x1, :3] * (1 - m[:, :, None]) + blank * m[:, :, None]
        ).astype(np.uint8)
        mask[y0:y1, x0:x1] = np.rint(m * 255).astype(np.uint8)
    save('warring-states-tiger-tally', a, out, mask)


def polyp():
    a = original('polyp', 'be57deb981f4a0b9a66dca67d18999a5bf68d3d23cd64f51157ab71fe16409cc')
    out = a.copy()
    y, x = np.indices(a.shape[:2])
    cx, cy = 602, 448
    r = np.sqrt(((x - cx) / 13) ** 2 + ((y - cy) / 46) ** 2)
    mask = (np.clip((1 - r) / .12, 0, 1) * 255).astype(np.uint8)
    filled = cv2.inpaint(a[:, :, :3], (mask > 0).astype(np.uint8) * 255, 3, cv2.INPAINT_TELEA)
    # Restore fine original tissue texture in the removed slit, preserving lips/folds.
    sample = a[418:482, 617:631, :3].astype(float)
    sample -= cv2.GaussianBlur(sample, (0, 0), 1.5)
    grain = graphite(sample, 94, 28, 94) * 1.5
    m = mask[401:495, 588:616] / 255
    out[401:495, 588:616, :3] = np.clip(np.rint(
        a[401:495, 588:616, :3] * (1 - m[:, :, None])
        + (filled[401:495, 588:616] + grain) * m[:, :, None]
    ), 0, 255).astype(np.uint8)
    # One small plain oval, with graphite shading; no pupil, iris or inner slit.
    rx, ry = 15, 10
    assert rx > ry and 2 * rx == 30 and 2 * ry == 20
    r = np.sqrt(((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2)
    m = np.clip((1 - r) * 5, 0, 1)
    tone = 81 + 10 * (y - cy) / ry
    # Sample grain is also used inside the oval; never reuse the old slit strokes.
    tone[401:495, 588:616] += grain[:, :, 0] * .2
    out[:, :, :3] = np.clip(np.rint(
        out[:, :, :3] * (1 - m[:, :, None]) + tone[:, :, None] * m[:, :, None]
    ), 0, 255).astype(np.uint8)
    mask = np.maximum(mask, np.ceil(m * 255).astype(np.uint8))
    assert not np.any(mask[:401]) and not np.any(mask[495:])
    assert not np.any(mask[:, :587]) and not np.any(mask[:, 618:])
    save('coral-reef-polyp', a, out, mask)


if __name__ == '__main__':
    tally()
    polyp()
