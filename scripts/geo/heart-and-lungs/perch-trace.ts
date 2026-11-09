/** Pixel trace of Pmau's 960×640 img_33558. This data actually drives the
 * longitudinal loft AND the SDF head, rather than being an unused guide.
 * Camera pitch is removed by the sloped axial baseline. The photographed
 * mouth is closed; the anterior jaw allowance opens the refitted teaching
 * water inlet. Flow parameters and downstream gill routes stay unchanged.
 * Widths come from Barsch3's
 * near-frontal section, constrained by the unchanged internal gill basket.
 * There is no top view in img_33558: those widths are a reconstruction.
 */
export const PERCH_TRACE={source:'https://commons.wikimedia.org/wiki/File:Perca_fluviatilis_img_33558.jpg',image:[960,640],landmarks:{snout:[190,344],nape:[252,289],headBack:[430,199],hump:[510,175],throat:[287,415],maxillaEnd:[286,378],eye:[294,324],preopercle:[352,370],opercleSpine:[433,324],opercleVentral:[405,427]}};
/** pixel x, upper silhouette y, lower silhouette y, reconstructed half-width */
const SIDE_TRACE=[
 [190,333,375,.0107],[207,318,380,.0116],[230,302,393,.0138],
 [252,289,404,.0155],[278,274,413,.0172],[310,258,422,.0190],
 [348,242,431,.0212],[388,221,438,.0213],[430,199,441,.0208],
 [470,182,444,.0205],[510,175,441,.0200]
];
export const traceX=(px:number)=>-.122+(px-190)*.00032;
export const traceY=(px:number,py:number)=>(363.2-.080*(px-190)-py)*.00025;
export const PERCH_SECTIONS=[
 ...SIDE_TRACE.map(([px,upper,lower,width])=>{
  const x=traceX(px!),opening=Math.max(0,Math.min(1,(-.065-x)/.057));
  return [x,traceY(px!,upper!)+.0025*opening,traceY(px!,lower!)-.006*opening-.0055*Math.exp(-(((x+.060)/.023)**4)),width!];
 }),
 [-.005,.0360,-.0240,.0187],[.018,.026,-.0185,.0168],
 [.040,.017,-.0135,.0127],[.061,.0095,-.0080,.0074],
 [.081,.0044,-.0042,.0038],[.087,.0040,-.0040,.0032]
];
export const PERCH_EYE=[traceX(294),traceY(294,324)+.0025];
