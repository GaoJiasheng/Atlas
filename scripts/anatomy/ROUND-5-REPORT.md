# Round 5 skin-weight correctness

All six published compressed GLBs pass the attachment ownership, unrelated joint-share and fibre-endpoint audit. Native Blender rebuilt back, shoulders and core; all six topics had their front/back/left/exploded/skin/pose previews refreshed and inspected. No downloads or application build/test/check commands were run.

Radius attachments selected an absent pronation joint and silently fell back to trunk; back also lacked hip ownership for its gluteus neighbour, and core lacked its arm-neighbour chain. The general attachment rule closes owning joints over the rig parents using unexported cached reference bones and fails on unknown/missing limb ownership. Connecting joints border both bones, preserving valid shoulder/elbow/hip boundary binding.

Fibre selectors persist in both manifests and their generator: trapezius fixed medial → lateral clavicular border; iliocostalis thoracis and spinalis thoracis inferior → superior. Coincident source seams share a distance field, each component gets both endpoints, and short transverse fragments receive a separated pair at the same longitudinal station.

| Topic | Audit / fixed list (both sides) | Muscle nodes | Bytes | Triangles | SHA-256 |
|---|---|---:|---:|---:|---|
| chest | clean; unchanged | 28 | 3,685,024 | 231,986 | `4ddd10ce16131977074cb4ba0a1bbf223a7dbee928b8b84c369553e9362a6687` |
| back | clean; biceps-brachii, brachioradialis, gluteus-maximus, trapezius-descending (fibre), iliocostalis-thoracis (fibre), spinalis-thoracis (fibre) | 48 | 3,837,484 | 267,885 | `8cddd44fef7cfe785f676e8696e38d8870277cf40cedf1f5ef5723444711e0ba` |
| shoulders | clean; trapezius-descending (fibre) | 34 | 2,112,884 | 150,985 | `eadd5ac55266c3d4688b9908437b74df0b2513e4cd2f2988754df8f8465ec24e` |
| arms | clean; unchanged | 50 | 3,078,272 | 193,602 | `d07360096ff86b2cf5d5cc49c2d61d7039572ad096ef124d3fd9d635a46d8e73` |
| legs | clean; unchanged | 52 | 3,983,156 | 244,638 | `2a9cce186f8e7215fb242ff01b3b6034559aaeb5dd518ba7aa8657dbf51ece95` |
| core | clean; latissimus-dorsi, serratus-anterior | 26 | 3,701,196 | 274,634 | `d48afa9dca602c543c52b16834998261d0e15cb778fde2318a6c963aeca5fbf3` |

Before correction, back biceps had trunk shares of 55.22% / 55.17% and no elbow; brachioradialis had trunk shares of 39.79% / 39.61% and no elbow. Back gluteus lacked hip weights; core latissimus lacked shoulder and serratus lacked scapula. The fibre gate catches scattered endpoints in the three reviewed fields instead of relying only on whether one seed reaches the correct end.

After correction, back left biceps is scapula 18.38%, shoulder 55.61%, elbow 26.01%; left brachioradialis is shoulder 60.21%, elbow 39.79%. The 55° shoulder / 75° elbow preview moves their centroids 0.117342 m / 0.332447 m. Native decoded surface budgets, topology, attributes, joint positions and output ceilings pass.

Chest remains byte-identical to the required full SHA-256. Each topic report contains the full muscle share table; machine-readable results are in `cache/<topic>-weights-audit.json`. All preview hashes and visual observations are refreshed in `preview-review.md`. The legs pose retains a thin upper-thigh streak; this round validates attachment shares and endpoint direction rather than per-vertex outlier weights.
