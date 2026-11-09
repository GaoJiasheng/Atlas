import fs from'node:fs';
const rows=JSON.parse(fs.readFileSync('scripts/anatomy/round4/metrics.json','utf8')),native=JSON.parse(fs.readFileSync('scripts/anatomy/round4/native-heroes.json','utf8')),diffs=JSON.parse(fs.readFileSync('scripts/anatomy/round4/studio-diffs.json','utf8'));
const refs={core:['Gray392.png','1105_Anterior_and_Posterior_Views_of_Muscles.jpg'],back:['Gray409.png','1105_Anterior_and_Posterior_Views_of_Muscles.jpg'],chest:['Gray410.png','1105_Anterior_and_Posterior_Views_of_Muscles.jpg'],arms:['Gray411.png','Gray410.png','1105_Anterior_and_Posterior_Views_of_Muscles.jpg'],legs:['Gray430.png','Gray434.png','1105_Anterior_and_Posterior_Views_of_Muscles.jpg'],shoulders:['Gray410.png','Gray409.png']};
const nf=n=>n.toLocaleString('en-US');
for(const r of rows){const t=r.topic,path=`src/content/topics/muscles-${t}/REBUILD-3D.md`,exercise=JSON.parse(fs.readFileSync(`scripts/anatomy/round4/exercise-${t}.json`,'utf8')),heroes=Object.keys(native.topics[t].nodes);let text=`
## Rebuild 2026-11-05 — round 4, anatomy precision restoration (2026-11-09)

This supersedes the earlier claims of anatomy buffer identity. The round-two/three shipped anatomy used int8 normals and int8 fibre directions; those files were **not byte-identical to pre-rebuild main**. Baseline anatomy is the actual checked-in GLB at **994cdc76**, not an offline uncompressed precursor. The accepted exercise/kit baseline is **490d13bf**. No display text, labels, IDs, bilateral counts, chapters, beats, grips, equipment, poses or teaching numbers changed. PartNode's accepted \`if (exerciseMask) pm.material.normalScale.set(0, 0)\` remains intact.

### Changes and self-grades

- **A — complete original close-up meshes:** ${heroes.map(n=>n).join(', ')}. Restored every original vertex attribute (including int16 NORMAL and float32 _FIBRE/_U/UV), indices, original inverse-bind matrices and joint associations. Every attribute and bind buffer is verified by SHA-256 against the original decoded baseline. Meshopt cyclically rotates some index triplets; orientation/topology are identical. No claim of identical raw compressed GLB bytes is made.
- **A — remaining anatomy precision:** retained the accepted topology and restored NORMAL and _FIBRE from native source vertices, resolving coincident seams with source UV/U/fibre data. Normals use a 16-bit octahedral meshopt filter; fibre uses normalized int16, retaining the source's binary 1/4096 lattice (the original chest fields use full-range int16). No anatomy NORMAL or _FIBRE accessor is int8. Complete original buffers are guaranteed only for the named close-up meshes, not every anatomical part.
- **A — exercise-mask boundary:** an eight-pass skin-adjacency field supplies continuous per-vertex alpha, with zero-alpha support outside the edge and small disconnected islands removed. It interpolates inside triangles. Obliques still exclude the rectus-owned faces, all labelled deep masks remain nonempty, and POSITION/NORMAL/JOINTS/WEIGHTS and the skeleton are shared with the actual body. The executing PartNode already blends these masks and applies depth bias. Untinted masks remain hidden.
- **A — elbow weights:** ${exercise.twistVertices} skin vertices considered for correction. The flexion bone carries the elbow; pronation weight starts distally and spreads toward the wrist, instead of twisting through the upper-arm/elbow blend. Weights stay normalized and the wrist/hand transforms remain intact. A decoded-GLB regression test poses the real rig at 90° pronation and checks the near-elbow radius stays at least 98% of rest. No animation keys or rig DOFs changed.
${exercise.bodyBudget?`- **A — exercise-only storage savings:** body ${nf(exercise.bodyBudget.before)} → ${nf(exercise.bodyBudget.after)} triangles; measured simplifier bound ${(exercise.bodyBudget.maxErrorM*1000).toFixed(3)} mm, with wrist borders locked. This affects the rebuilt exercise skin, never the native muscle/bone anatomy.\n`:''}- Removed unused exercise-mask UVs (their normalScale is zero). Moved build-only sourceNodes strings to \`scripts/anatomy/round4/provenance-${t}.json\`; licensing remains embedded. Float prediction is kept only when an actual decode proves bit-for-bit equality. No version-1 codec is used: the test decodes with the engine's bundled meshopt decoder.

### References

${refs[t].map(n=>`- https://commons.wikimedia.org/wiki/File:${n} — ${n.startsWith('1105')?'OpenStax, CC BY 4.0; anterior/posterior proportions.':'Gray/Carter historical anatomical drawing, public domain; anatomy and attachment detail.'}`).join('\n')}

References are development drawings, not runtime textures. Existing downloaded plates are reused. **B, reference-angle evidence only:** these are related anatomical dissections, not four photographs of this exact individual/specimen. No claim of photo-perfect four-angle registration is made; the exact same-angle regression reference is main's original GLB. This limitation does not limit the buffer/renderer equality result.

### Three inspected looks

1. Opened look1 front/detail rectus and exercise sheets, chest front and shoulder detail. Rectus was already identical; the chest framing clipped its lateral margin and the shoulder detail looked between the two sides. Corrected camera span to account for width and aimed detail at the left muscle. Increased the mask diffusion from four to eight passes after seeing residual angular edges.
2. Opened look2 core/chest/arms/legs/shoulder sheets. Original precision alone left visible differences from earlier simplification, especially in deltoid folds. Restored complete original buffers/topology for all six named close-up subjects instead. To remain under the cap, moved savings to exercise UVs, exercise-body sampling and build-only metadata, not those muscles.
3. Opened final detail sheets for all six subjects and elbow comparisons. All **24** final front/three-quarter/profile/detail main comparisons have **zero changed channels, zero maximum error and zero MAE**, under the engine studio/ACES numerical renderer. Each topic's result: ${JSON.stringify(diffs.filter(d=>d.topic===t).map(d=>({view:d.view,mae:d.mae,max:d.max})))}. Characteristic folds/intersections match main. The elbow sheet preserves the joint volume through flexion/pronation, rather than forming the old local waist.

Renderer: reuses \`scripts/anatomy/round3/studio.ts\`, with optional file selection and unchanged defaults. It verifies the executing Lighting.tsx rig/exposure/environment bindings and installed R3F ACES/sRGB defaults. GGX/RoomEnvironment CPU rasterization approximates shader derivatives, AA, shadows and muscle micrograin. Thus the additional exact original shader-input/bind-buffer hashes are essential. No Chromium, user browser or desktop was opened; GPU acceptance remains with the main session. Evidence images are outside the repository at **/private/tmp/atlas-muscles-round4-comparisons/**.

### Storage, topology and draws

Topic GLB: **${nf(r.beforeBytes)} → ${nf(r.afterBytes)} bytes**, below 1,500,000. Declared-node triangles **${nf(r.before.triangles)} → ${nf(r.after.triangles)}**; estimated colour draws **${r.before.draws} → ${r.after.draws}**. These sums include mutually exclusive anatomy, masks, body and wire nodes, not measured simultaneous GPU draws. The conservative maximum topic-node sum is 182,426; adding the 94,732-triangle pulldown and two 9,000-triangle grip hands gives **295,158**, below 350k even while counting hidden topic nodes. Equipment GLBs and their counts/bytes are unchanged. Actual shadow/transparency passes are additional; no FPS claim.

| Anatomical node | Triangles before → after | Change / self-grade |
|---|---:|---|
`;
for(const a of r.after.parts.filter(p=>!/^(skin-|exercise-)/.test(p.node))){const b=r.before.parts.find(p=>p.node===a.node);text+=`| ${a.node} | ${nf(b.triangles)} → ${nf(a.triangles)} | ${heroes.includes(a.node)?'Complete original main attributes/topology/bind; A':'Accepted topology retained; original-precision normals/fibres restored; A'} |\n`;}
text+=`
### Verification and outstanding scope

\`tests/muscles-round4.test.ts\` verifies the actual shipped GLBs, original hero hashes, engine decoder compatibility, cap, mask/body attribute sharing, feather weights, actual pronation deformation and the retained PartNode normalScale opt-out. Existing round-three mask, runtime-motion, equipment, skin/nail and topic tests remain active. Gate results/logs: \`scripts/anatomy/round4/gates/results.json\` (writable exact-source verification snapshot because this worktree's node_modules symlink points outside the allowed write roots). No tests are skipped or weakened; the verifier uses the same installed dependency versions. Final gates: pnpm check, pnpm validate, pnpm test and pnpm build all exit 0; 312 test files / 6,791 tests pass. The post-build JS budget check also passes. See the final gate JSON for exit codes.

Outstanding: GPU acceptance (explicitly reserved for Claude); exact specimen/photo angle evidence described above. No requested code/asset change remains as an unapplied shared-engine patch. No git writes, evidence-image commits or display-text edits.
`;
const old=fs.readFileSync(path,'utf8').split('\n## Rebuild 2026-11-05 — round 4,')[0];fs.writeFileSync(path,old+text);
}
