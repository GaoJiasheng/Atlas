"""Native-pixel G14 shore-identification trial, never a published coastline.

Follow the light-water/dense-mangrove transition in a narrow corridor about
the independently read guides. The cross-shore density gradient avoids using
soundings, jetties and leading lines as a shoreline. Retain every source pixel
so the result can be inspected without manufacturing geographic coordinates.
Date/datum qualification remains separate from tracing precision.
"""
import json
from pathlib import Path

import cv2
import numpy as np
from PIL import Image
from scipy.interpolate import PchipInterpolator

ROOT = Path(__file__).parent
Image.MAX_IMAGE_PIXELS = None
spec = json.loads((ROOT / "polish-jurong-trace.json").read_text())
guides = np.asarray(spec["path"], dtype=float) * 5
image = Image.open(ROOT / "raw/G14.jpg").crop((600, 480, 8150, 4000)).convert("L")
gray = cv2.GaussianBlur(np.asarray(image).astype(np.float32), (11, 11), 0)
height, width = gray.shape


def samples(points):
    x = np.clip(points[..., 0], 0, width - 1).astype(np.float32)
    y = np.clip(points[..., 1], 0, height - 1).astype(np.float32)
    return cv2.remap(gray, x, y, cv2.INTER_LINEAR, borderMode=cv2.BORDER_REPLICATE)


distance = np.r_[0, np.cumsum(np.linalg.norm(np.diff(guides, axis=0), axis=1))]
interpolator = PchipInterpolator(distance, guides, axis=0)
positions = np.linspace(0, distance[-1], int(np.ceil(distance[-1] / 12)) + 1)
centres = interpolator(positions)
tangents = interpolator.derivative()(positions)
tangents /= np.linalg.norm(tangents, axis=1)[:, None]
normals = np.c_[-tangents[:, 1], tangents[:, 0]]
shifts = np.arange(-45, 46, dtype=float)
scores = []
for centre, tangent, normal in zip(centres, tangents, normals):
    candidates = centre + shifts[:, None] * normal
    strips = candidates[:, None, :] + np.arange(-12, 13, 6)[None, :, None] * tangent
    difference = (samples(strips + 12 * normal) - samples(strips - 12 * normal)).mean(axis=1)
    scores.append(difference - np.abs(shifts) * 0.12)
# A connected path, rather than independent pixel maxima: avoid alternating
# between hatch strokes, numerals and water. Interpolation defines the search
# corridor only; every final offset is selected from the original raster.
transition = 0.14 * (shifts[:, None] - shifts[None, :]) ** 2
cost = -scores[0]
back = []
for score in scores[1:]:
    choices = cost[:, None] + transition
    previous = choices.argmin(axis=0)
    back.append(previous)
    cost = choices[previous, np.arange(len(shifts))] - score
indices = [int(cost.argmin())]
for previous in reversed(back):
    indices.append(int(previous[indices[-1]]))
indices.reverse()
offsets = shifts[indices]
path = np.round(centres + offsets[:, None] * normals + [600, 480], 1).tolist()
output = {
    "source": "G14", "status": "unpublished-shore-identification-trial",
    "pixelConvention": "native raw/G14.jpg, x right / y down",
    "method": "Guide-constrained cross-shore image-density gradient; shape-preserving interpolated search corridor, 11px Gaussian, +/-45px corridor, 24px cross-shore difference, 24px along-shore averaging, 12px sampling, global dynamic-programming path with 0.14 squared-pixel transition cost. No modern geographic geometry enters this trace.",
    "knownLimits": spec["limitations"],
    "coordinates": path,
    "guideOffsetPx": {"max": max(abs(x) for x in offsets), "median": float(np.median(np.abs(offsets)))},
}
(ROOT / "polish-jurong-edge.json").write_text(json.dumps(output, indent=2) + "\n")
print(f"G14 trial: {len(path)} retained native-pixel vertices; date/datum acceptance remains failed.")
