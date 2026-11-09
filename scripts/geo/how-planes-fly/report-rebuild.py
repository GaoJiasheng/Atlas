"""Write reproducible per-part evidence tables; preserve previous dated sections."""
import json,pathlib,re,hashlib
root=pathlib.Path.cwd()
def refs(slug):
 return json.load(open(root/f'scripts/geo/{slug}/refs/manifest.json'))
def reference_list(slug):
 return '\n'.join(f"- **{p['id']}** — [{p['title']}]({p['page']}); {re.sub('<[^>]*>','',p['author'])}; [{p['license']}]({p.get('license_url') or p['page']})." for p in refs(slug))
changes={
'fuselage-shell':('Blunt elliptical ogive; continuous smooth skin, integrated belly canoe, 72 rounded cabin panes distributed along the full cabin.','front, nose, profile'),
'cockpit-glazing':('Six recessed panes with real raised frames and a nose-only selection anchor; opaque glossy glazing.','front, nose, profile'),
'wing-left':('Capped tapered airfoil loft, root cuff, three attached flap-track canoe fairings and integrated belly junction; original 6° dihedral and control hinges retained.','front, airframe, drawing'),
'wing-right':('Mirrored manufactured wing loft; same root, three flap-track fairings and dihedral correction.','front, airframe, drawing'),
'wing-tip-left':('Curved transition into a tapered tip device, with closed tips.','front, airframe, drawing'),
'wing-tip-right':('Curved transition into a tapered tip device, with closed tips.','front, airframe, drawing'),
'fin':('Closed aerodynamic section; root-to-tip thickness taper, same rudder hinge.','airframe, drawing'),
'rudder':('Matching tapered aerodynamic section; original yaw pose pivot.','airframe, drawing'),
'engine-shell':('Six blade-only, closed airfoil OGVs replace rectangular stays; no fan hub blocks the core. Original casing and intake retained.','engine, engine-photo, engine-detail'),
'combustor-ring':('Original two open annular liners retained; twelve attached fuel-injector elbows added upstream.','engine, engine-section, engine-detail'),
}
for side in ['left','right']:
 changes['slat-'+side]=('Seated closed leading-edge airfoil cuff in a matching wing cutout; original deployment translation retained. Removes the original detached sweep.','front, airframe, drawing')
 changes['aileron-'+side]=('Airfoil trailing section matches the new wing thickness at the original 78% hinge; original roll pose retained.','airframe, drawing')
 changes['flap-'+side]=('Matching closed airfoil section removes a thickness step at the original high-lift hinge.','airframe, drawing')
 changes['tailplane-'+side]=('Closed loft with rounded leading edge, fine trailing edge and decreasing section thickness.','airframe, drawing')
 changes['elevator-'+side]=('Matching tapered elevator; original pitch hinge and pose retained.','airframe, drawing')
 changes['nacelle-'+side]=('Smooth annular lip and separate core-cowl form; closed airfoil pylon seated between cowl and wing, replacing a slab.','front, airframe, drawing')
for id in ['compressor-bank','compressor-rotor','turbine-bank','hp-turbine-rotor','lp-turbine-rotor']:
 changes[id]=('24 curved, twisted, capped airfoils per row; original row positions/counts and progressively changing gas-path height. Compressor and turbine camber/stagger differ.','engine, engine-section, engine-detail')
for slug in ['how-planes-fly','aircon']:
 folder=root/f'src/content/topics/{slug}';script=root/f'scripts/geo/{slug}';before=json.load(open(script/'evidence/before/counts.json'));after=json.load(open(script/'evidence/final/counts.json'));data=json.load(open(folder/'data/parts.json'));base=json.load(open(script/'evidence/before-parts.json'));baseparts={p['id']:p for p in base['parts']}
 if slug=='how-planes-fly':
  intro='Rebuilt every aircraft item identified by review-machines.md, including the detailed notes beyond the two headline items. The generic airliner remains the authored nominal 40 m / 36 m design study at 1:10, not an A330 replica. CF6 imagery establishes engineering relationships; all original teaching stage/blade counts remain drawing choices.'
  rounds='''1. **Look 1 — round1/comparisons:** the nose panes sat too high and were too separated in profile; wing/tail normals revealed reversed winding; the separate belly surface read as a loose appendage. Corrected winding, integrated the belly in the continuous fuselage, reduced the cuff, and moved the glazing forward/down.
2. **Look 2 — round2/comparisons:** an unwrapped-nose join made a dotted seam, the front glazing still read as roof windows, and the tail tips were open. Replaced the separate nose/body patches by one continuous skin, laid six apertures across the forward shoulder, capped all lofts, and retained all hinge coordinates.
3. **Look 3 — round3/comparisons and final:** frontal inspection exposed a pylon protruding above the wing. Replaced the sweep by a closed pylon airfoil in the correct Y stations; added a blended wingtip transition, blade tip/root caps, shaped OGVs and attached injectors. The final photos include a real museum fan/combustor and an orthographic aircraft drawing. Final source materials explicitly opt into atlasSurface, removing family normal maps from UV-free lofts; CPU and GPU now use the same source roughness/metalness. Analytic pole normals and a square-root ogive remove the last tiny conical tip. A fourth, closely matched nose crop showed oversized pane height; reduced it by about a quarter and lowered the brow. Closed pocket backs and reveal walls preserve stencil-section volume behind the inset glazing. The final control-surface lofts also remove a section-thickness step at the original hinges. The final mechanism audit replaced the OGV fan primitive with six blade-only lofts: its automatically generated hub would otherwise plug the core. An independent axial ray through the shipping GLB verifies that the core passage is unobstructed. Replaced the detached slat sweep with a closed leading-edge cuff in a matching wing cutout; retained the original deployment translation. Kept 36 windows per side but distributed them across the full cylindrical cabin instead of ending the row near mid-body.'''
  refs_by_hero='Nose/cockpit: front + nose + profile (3). Wing, tail, pylon and tips: front + airframe + drawing (3). Engine: engine + engine-section + engine-photo + engine-detail (4). The drawing is an illustrative 3-view, not measured CAD.'
 else:
  intro='Rebuilt inverter-board. The accepted folded partition received only a local clearance port for the new thermal assembly; the other 35 parts, animation targets, flows, chapters, labels, teaching quantities and connections are byte-equivalent after schema parsing. The board is an original generic design study within the existing 240 × 200 mm envelope; it is not a manufacturer schematic or wiring diagram.'
  rounds='''1. **Look 1 — round1/comparisons:** the board was too empty, capacitor tops lacked a true score, and the transformer winding was hidden. Added two control-area passive rows with solder pads, cut cross-shaped vent scores through the aluminium lids, and opened the ferrite core to expose the copper winding.
2. **Look 2 — round2/comparisons:** terminal housings read as separate solid blocks; the cable ended short of a connector, and the thermal base stopped short of the power module. Rebuilt one five-port housing with actual bores and five slotted screw heads, returned both cable ends into header positions, cut a PCB aperture and raised the aluminium cold plate into direct contact with the power package.
3. **Look 3 — round3/comparisons and final installed view:** mounting posts lacked a visible supporting carrier with the enclosure removed. Added the notched steel carrier: its ears attach to the partition/side case, its upper surface supports the four bored posts, and its notch clears the airflow fins. Components stay below the existing top cover. The final attachment sweep also seats the can bases/lids, passives and header bodies on their support surfaces, slopes IC leads into the PCB, and gives the transformer a clear two-window ferrite core plus insulating bobbin; copper no longer crosses a solid core bar. A local partition port clears the plate and final fin while the carrier ears attach to intact steel; the cold plate stops at the PCB underside and the IPM seats through its existing slot, so neither plate nor module penetrates the substrate.'''
  refs_by_hero='Inverter: board + power + caps (3). The first is an actual HVAC board. The KACO photographs are auxiliary power-electronics component references (capacitors, wound cores, terminals), explicitly not a split-aircon layout or manufacturer attribution.'
 rows=[]
 for p in data['parts']:
  id=p['id'];b=before[id];a=after[id]
  if slug=='aircon' and id=='inverter-board':change='Populated holed PCB, supported carrier/posts, continuous power-module/cold-plate/11-fin thermal path, three crimped cans with recessed vent scores, ferrite/winding, IC leads/passives, five bored/slotted terminals, seated headers and cable.';references='board, power, caps'
  elif slug=='aircon' and id=='partition':change='Preserved the folded steel panel and its location; opened only the local cold-plate/fin clearance port to prevent interpenetration. Consistency edit to an accepted A part.';references='board, power; original topic design study'
  elif slug=='how-planes-fly' and id in changes:change,references=changes[id]
  else:
   change='Retained after whole-model sweep: existing shaped mechanical/teaching geometry is appropriate to its role.'
   if p.get('context'):change='Retained: context wall or display plinth; an intentionally planar architectural/display surface.'
   if id in ['chord-marker','inflow-reference','angle-marker']:change='Retained: mathematical marker, not a physical specimen or machine part.'
   references='Existing topic SOURCES.md; whole-model studio view'
  rows.append(f"| `{id}` | A | {change} | {references} | {int(b['triangles']):,} → {int(a['triangles']):,} | {b['draws']} → {a['draws']} |")
 scope='All authored parts (a conservative total even though aircraft stations are never displayed together)' if slug=='how-planes-fly' else 'All authored parts'
 totals=f"{scope}: **{sum(int(p['triangles']) for p in before.values()):,} → {sum(int(p['triangles']) for p in after.values()):,} triangles**, **{sum(p['draws'] for p in before.values())} → {sum(p['draws'] for p in after.values())} estimated geometry draw calls**. These exclude engine shadow/stencil passes, floor and flow; no GPU FPS is claimed."
 glb=pathlib.Path('public'+data['model']) if data.get('model') else None
 totals+=' GLB: **0 → '+(f'{glb.stat().st_size:,} bytes** (meshopt; under 1.5 MB).' if glb else '0 bytes** (primitive-only; no GLB needed).')
 geometry_input='the **shipping meshopt-decoded GLB** plus production `partPieces`' if glb else 'production `partPieces` for the shipping primitive geometry'
 text_changes='Aircraft cockpit detail was minimally corrected in **EN + ZH**: it now says six inset panes and frames instead of an unframed band. One existing combustion test now selects the two liner walls explicitly, because twelve injectors are additional geometry; the independent gas-passage checks are retained.' if slug=='how-planes-fly' else 'No teaching text or labels changed.'
 body=f'''# {slug} · 3D rebuild evidence

## Rebuild 2026-11-05

Executed 2026-11-09 in the requested worktree; section date follows the batch brief.

{intro}

### References inspected

{refs_by_hero}

{reference_list(slug)}

Reference images are development-only in `scripts/geo/{slug}/refs/`; none ships in public/. Comparison sheets contain resized/cropped references and occasionally horizontal flips as marked. Reference portions retain the stated CC BY / CC BY-SA licence and attribution; the sheet composition is offered under the most restrictive reference licence in that sheet. Geometry is original code under the repository licence.

### Studio evidence and iteration log

Used a copy of the fossils-and-skeletons CPU PBR/RoomEnvironment renderer, reading {geometry_input}, actual theme tokens and `resolveMaterialLook`. Key/fill/rim directions and intensities, hemisphere, room environment, exposure (paper 1.05; cinema 1.0), linear-to-sRGB conversion and Three's ACES fit follow the installed renderer. Rig checks inspect Lighting.tsx, not a proxy token file. Paper and cinema render sets are included. The sampled CPU environment filtering and omitted micro-normal maps on retained primitives are numerical approximations; browser shadows, HUD framing, X-ray sorting and GPU pixels remain for main-session GPU acceptance.

{rounds}

Final comparison directory: `{script}/evidence/final/comparisons`.

Aircraft/engine sets include front, three-quarter, profile, nose/wing-root/tail/blade close-ups. Inverter sets include front, three-quarter, edge profile, capacitor detail and installed assembly. View orientation is matched where photographs/drawings allow; a generic teaching model and different cameras are not asserted to be photogrammetric registration. The board edge profile is cross-checked against component photographs rather than a dimensioned manufacturer drawing.

### Part-by-part self-grade against docs/68

A means convincing geometry for the authored design-study role: real silhouette/section, attachment and movement, counts preserved; it is a self-grade from offline evidence and **not** GPU acceptance. No B/C item is intentionally left unfinished. Manufacturer-identical PCB routing, aircraft livery/landing gear and real CF6 stage counts are outside the existing generic teaching design and have not been invented.

| Part | Self-grade | Change / sweep result | References | Triangles before → after | Draws estimate before → after |
|---|---|---|---|---:|---:|
'''+ '\n'.join(rows)+f'''

### Performance and teaching contract

{totals}

Original part IDs and counts, groups, teaching numbers, chapter/beat references, pose pivots, flow coordinates, animations, exploded directions and connections retained. {text_changes}

### Reproduce

```sh
python3 scripts/geo/how-planes-fly/fetch-refs.py
pnpm tsx scripts/geo/{slug}/{'build-parts.ts' if slug=='how-planes-fly' else 'build-inverter.ts'}
pnpm tsx scripts/geo/how-planes-fly/preview-studio.ts {slug} final
pnpm tsx scripts/geo/how-planes-fly/compare.ts {slug} final
```

The preview records source SHA-256 values and exact counts. Final gate results are appended below. Chromium, browser/desktop automation, e2e/shoot, git commits and engine edits were not performed, per the explicit task restrictions.
'''
 path=folder/'REBUILD-3D.md'
 if path.exists():
  old=path.read_text();idx=old.find('## Rebuild 2026-11-05');body=old[:idx]+body[body.find('## Rebuild 2026-11-05'):] if idx>=0 else old+'\n'+body[body.find('## Rebuild 2026-11-05'):]
 path.write_text(body)
 src=folder/'data/SOURCES.md';text=src.read_text();marker='## Rebuild 2026-11-05 · geometry reference provenance'
 if marker in text:text=text[:text.index(marker)].rstrip()+'\n'
 src.write_text(text+'\n'+marker+'\n\nOriginal code-generated geometry; no third-party meshes or photo textures. Runtime remains local-only. Reference images are used in development comparison sheets, under their stated licences. Exact links, author credits and the iteration record:\n\n'+reference_list(slug)+'\n\nSee `../REBUILD-3D.md`. Auxiliary inverter photographs establish component shapes only; this design does not reproduce manufacturer electronics.\n')
 print(path)
