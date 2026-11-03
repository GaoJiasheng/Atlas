/**
 * Atlas original microscope reconstruction, 2026-11-03.
 * Layout/handling: existing S6/S7/S21; silhouette/detail reference inspected:
 * art/planned/cells/cells-microscope.png (Atlas generated reference study).
 * Real-instrument cross-check: Nikon E100 Name of each part photograph,
 * https://www.microscope.healthcare.nikon.com/guides/e100/en/page/name.html
 * (reference only; photograph not included in production).
 * Profile dimensions are authored S20 design choices, not a measured product.
 * All coordinates remain metres, Y up, and objective axes/pivot are unchanged.
 */
const q = n => Math.round(n * 1e9) / 1e9;
const at3 = a => a.map(q);
const lathe = (profile, at, color = 'steel', rotation, segments = 48) => ({kind:'lathe',profile:profile.map(p=>p.map(q)),segments,at:at3(at),color,...(rotation?{rotation}:{})});
const profile = (rows, at, color = 'steel', rotation, segments = 48) => lathe([[0,rows[0][1]],...rows,[0,rows.at(-1)[1]]],at,color,rotation,segments);
const extrude = (shape, depth, at, color='enamel', bevel=.001, rotation, holes=[]) => ({kind:'extrude',shape:shape.map(p=>p.map(q)),depth,bevel,at:at3(at),color,...(rotation?{rotation}:{}),...(holes.length?{holes:holes.map(h=>h.map(p=>p.map(q)))}:{})});
const box = (size, at, color='steel', bevel=.001) => ({kind:'bevelBox',size,bevel:Math.min(bevel,Math.min(...size)*.4),at:at3(at),color});
const sweep = (path, radius, at, color='enamel', extra={}) => ({kind:'sweep',path,radius,at,color,segments:72,radial:24,caps:'round',...extra});
const arc = (radius, height, thickness, at, color, angle=40, rotation) => ({kind:'curvedPanel',radius,height,thickness,at:at3(at),color,angle,segments:Math.max(8,Math.ceil(angle/7.5)),...(rotation?{rotation}:{})});
const add = (a,b) => a.map((n,i)=>n+b[i]);
const tilted = ([x,y,z], degrees=24) => {const a=degrees*Math.PI/180;return [x,y*Math.cos(a)-z*Math.sin(a),y*Math.sin(a)+z*Math.cos(a)];};
function roundedRect(w,d,r,n=9) {
  const out=[];
  for(let c=0;c<4;c++) {const a=c*Math.PI/2,cx=(c===0||c===3?1:-1)*(w/2-r),cy=(c<2?1:-1)*(d/2-r);for(let j=0;j<=n;j++){const t=a+j*Math.PI/(2*n);out.push([cx+r*Math.cos(t),cy+r*Math.sin(t)]);}}
  return out;
}
function bezierOutline(start, commands, n=10) {
  const out=[start];let p=start;
  for(const [a,b,c] of commands) {for(let j=1;j<=n;j++){const t=j/n,s=1-t;out.push([s*s*s*p[0]+3*s*s*t*a[0]+3*s*t*t*b[0]+t*t*t*c[0],s*s*s*p[1]+3*s*s*t*a[1]+3*s*t*t*b[1]+t*t*t*c[1]]);}p=c;}
  return out;
}
// A bevelled axial flute profile: one geometry, not forty loose rib meshes.
function fluted(radius, flutes, depth, at, color='powder', rotation=[0,90,0]) {
  const outline=[];
  for(let j=0;j<flutes;j++) for(let k=0;k<4;k++) {const a=(j+k/4)*Math.PI*2/flutes,r=radius+(k===1||k===2?.00035:-.00024);outline.push([r*Math.cos(a),r*Math.sin(a)]);}
  return extrude(outline,depth,at,color,.00013,rotation);
}
function ring(r,h,at,color='steel',rotation,inner=r*.8,segments=48) {
 return lathe([[inner,-h/2],[r-.0002,-h/2],[r,-h/2+.0002],[r,h/2-.0002],[r-.0002,h/2],[inner,h/2],[inner,-h/2]],at,color,rotation,segments);
}
function update(parts,id,primitive,extra=[]) {
 const p=parts.find(p=>p.id===id);if(!p)throw new Error(`Missing microscope part ${id}`);p.primitive=primitive;if(extra.length)p.extra=extra;else delete p.extra;return p;
}
export function polishMicroscope(parts) {
 // The base has a rounded, gently tapering cast footprint, a raised heel and
 // small elastomer pads. Its declared .18 × .03 × .14 envelope is retained.
 const baseOutline=bezierOutline([-.073,.07],[
  [[-.088,.07],[-.09,.064],[-.09,.05]],
  [[-.09,.014],[-.085,-.035],[-.079,-.055]],
  [[-.075,-.067],[-.065,-.07],[-.048,-.07]],
  [[-.008,-.07],[.044,-.064],[.072,-.059]],
  [[.084,-.056],[.09,-.05],[.09,-.037]],
  [[.09,-.008],[.09,.034],[.086,.052]],
  [[.084,.065],[.079,.07],[.064,.07]],
  [[.025,.07],[-.038,.07],[-.073,.07]],
 ],8);
 const baseExtra=[extrude(roundedRect(.057,.076,.016),.013,[.254,.0235,-.027],'enamel',.004,[90,0,0])];
 for(const [x,z] of [[.133,.049],[.27,.044],[.143,-.049],[.267,-.042]])baseExtra.push(profile([[.006,-.0025],[.007,-.0017],[.007,.001],[.0058,.0025]],[x,.0025,z],'rubber',undefined,24));
 // Recessed rocker switch on the outer heel, including its bezel.
 baseExtra.push(box([.011,.003,.018],[.266,.03,.026],'powder',.0015),box([.007,.0015,.011],[.266,.032,.026],'rubber',.0007));
 update(parts,'scope-base',extrude(baseOutline,.023,[.2,.0145,0],'enamel',.005,[90,0,0]),baseExtra);
 // Cast C-arm: a variable oval section loft, with a continuous rounded spine
 // and broader shoulder/heel. It is volumetric from every oblique direction.
 const armPath=[[.263,.034,-.033],[.272,.066,-.033],[.276,.112,-.033],[.274,.163,-.033],[.266,.209,-.03],[.249,.247,-.025],[.225,.273,-.018],[.2,.284,-.011]];
 const arm=sweep(armPath,[.023,.021,.018,.018,.018,.019,.02,.023],[0,0,0],'enamel',{up:[0,0,1],section:{flat:.85},segments:96,radial:32});
 const armExtra=[
  // Flush inlaid focus bearing housing on the cast arm's visible cheek.
  profile([[.023,-.005],[.025,-.003],[.025,.002],[.022,.005]],[.261,.16,0],'enamel',[0,0,-90]),
  box([.011,.108,.007],[.248,.108,-.028],'steel',.002),
  box([.008,.104,.004],[.247,.108,-.023],'stainless',.001),
 ];
 update(parts,'scope-arm',arm,armExtra);
 // Eyepiece: hollow eyecup / retaining rim, recessed lens, optical barrel,
 // dioptre collar and insertion shoulder. The front cup sector is the label
 // anchor rather than a buried centre inside the head.
 const eyeAt=[.18,.326,.007], eyeRot=[24,0,0],eyeTop=.0225, eyeRadius=.0134;
 const eyeBandAt=add(eyeAt,tilted([0,eyeTop-.0025,eyeRadius]));
 const eyePrimary=arc(eyeRadius,.005,.0012,eyeBandAt,'rubber',40,eyeRot);
 const eyeExtra=[
  profile([[.0094,-.0225],[.0102,-.022],[.0102,-.017],[.011,-.016],[.0115,-.014],[.0115,.010],[.012,.0115],[.012,.015],[.0108,.016],[.0108,.0185]],eyeAt,'powder',eyeRot),
  arc(eyeRadius,.005,.0012,add(eyeAt,tilted([0,eyeTop-.0025,-eyeRadius])),'rubber',320,[24,180,0]),
  ring(.0123,.0035,add(eyeAt,tilted([0,.016,0])),'steel',eyeRot,.0096),
  profile([[.0093,-.0006],[.0095,0],[.0093,.0006]],add(eyeAt,tilted([0,.019,0])),'glass',eyeRot),
  ring(.0106,.001,add(eyeAt,tilted([0,-.018,0])),'stainless',eyeRot,.0094),
 ];
 update(parts,'scope-eyepiece',eyePrimary,eyeExtra);
 // Separate head shoulder and inclined ocular socket: no cylinder pile with
 // an unsupported eye tube. The vertical lower optical axis remains x=.18.
 update(parts,'scope-tube',profile([[.017,-.031],[.020,-.029],[.021,-.025],[.021,.013],[.025,.018],[.025,.026],[.022,.031]],[.18,.278,0],'enamel'),[
  sweep([[.181,.297,0],[.18,.302,.001],[.18,.306,.003]],[.022,.019,.013],[0,0,0],'enamel',{radial:32,segments:24,section:{flat:.85},up:[1,0,0]}),
  ring(.0217,.002,[.18,.292,0],'steel',undefined,.0198),
  box([.05,.015,.034],[.207,.287,-.009],'enamel',.004),
  ring(.0225,.003,[.18,.248,0],'stainless',undefined,.0175),
  profile([[.015,-.008],[.018,-.006],[.018,.005],[.016,.008]],[.196,.242,-.009],'enamel'),
 ]);
 const pivot=[.2,.23,-.011547005];
 // Shallow scalloped metal revolving plate, top bearing and three objective
 // mounting sockets. The exact original pivot drives all indexed poses.
 const scallop=[];for(let i=0;i<120;i++){const a=i*Math.PI*2/120;const r=.032+.0011*Math.cos(3*a+.5)+.00025*Math.cos(30*a);scallop.push([r*Math.cos(a),r*Math.sin(a)]);}
 const objectiveSpecs=[['four',.024,[.18,.213,0],'token:pole-n'],['ten',.036,[.22,.207,0],'token:en-light'],['forty',.048,[.2,.201,-.034641015],'token:en-electrical']];
 const turretExtra=[profile([[.021,-.003],[.023,-.0015],[.023,.0015],[.021,.003]],[.2,.236,-.011547005],'powder')];
 for(const [,height,at] of objectiveSpecs)turretExtra.push(ring(.010,.003,[at[0],at[1]+height/2+.0005,at[2]],'steel',undefined,.0075,32));
 update(parts,'scope-turret',extrude(scallop,.01,pivot,'stainless',.0006,[90,0,0]),turretExtra);
 for(const [id,height,at,tint] of objectiveSpecs) {
  const bottom=-height/2,top=height/2, bandY=bottom+height*.34, r=.00835;
  const primary={...arc(r,.0024,.00045,[at[0],at[1]+bandY,at[2]+r],'enamel'),tint};
  const barrel=profile([
   [.0037,bottom],[.0046,bottom+.0006],[.005,bottom+.0028],
   [.0055,bottom+.0045],[.0069,bottom+.0065],[.0078,bottom+.008],
   [.0079,top-.007],[.0083,top-.006],[.0083,top-.0043],
   [.0091,top-.0038],[.0091,top-.0012],[.0087,top],
  ],at,'stainless');
  const backBand={...arc(r,.0024,.00045,[at[0],at[1]+bandY,at[2]-r],'enamel',320,[0,180,0]),tint};
  const extras=[barrel,backBand,
   ring(.0092,.001,[at[0],at[1]+top-.0035,at[2]],'powder',undefined,.008),
   ring(.0052,.001,[at[0],at[1]+bottom+.0012,at[2]],'powder',undefined,.0033,32),
   profile([[.0033,-.0003],[.0036,0],[.0033,.0003]],[at[0],at[1]+bottom+.0004,at[2]],'glass',undefined,32),
  ];
  // Narrow engraved/grip grooves around the mounting collar, not extra
  // objectives. Barrel ends, centre and height match the original model.
  for(let j=0;j<3;j++)extras.push(ring(.00925,.00032,[at[0],at[1]+top-.0012-j*.0007,at[2]],'steel',undefined,.00905,40));
  update(parts,`scope-objective-${id}`,primary,extras);
 }
 // One machined stage with a genuine light aperture and two stainless leaf
 // clips. Their screws stay behind the specimen; spring tongues arch over
 // the slide edges and lift at the tips for access.
 const stageShape=roundedRect(.116,.095,.004),aperture=roundedRect(.03,.03,.001);
 const stageExtra=[box([.035,.007,.023],[.244,.163,-.027],'powder',.002)];
 const clipShape=bezierOutline([-.034,.0002],[
  [[-.031,.002],[-.027,.0036],[-.024,.0036]],
  [[-.015,.0034],[-.004,.0017],[.004,.0016]],
  [[.007,.0016],[.009,.004],[.011,.0042]],
  [[.012,.0043],[.012,.0033],[.011,.003]],
  [[.009,.0028],[.007,.0008],[.004,.0007]],
  [[-.004,.0008],[-.015,.0024],[-.024,.0026]],
  [[-.028,.0026],[-.031,.001],[-.034,-.0006]],
  [[-.034,-.0006],[-.034,-.0002],[-.034,.0002]],
 ],6);
 for(const x of [.151,.209]) {
  stageExtra.push(extrude(clipShape,.0038,[x,.172,0],'stainless',.00015,[0,-90,0]),
   profile([[.0026,-.001],[.0031,-.0006],[.0031,.0007],[.0026,.001]],[x,.1745,-.033],'steel',undefined,24),
   box([.0035,.00015,.00045],[x,.17555,-.033],'powder',.00005));
 }
 const stage=update(parts,'scope-stage',extrude(stageShape,.008,[.18,.168,0],'powder',.0008,[90,0,0],[aperture]),stageExtra);
 stage.detail.en=stage.detail.en.replace('Four solid model plates surround a clear 0.03 × 0.03 m aperture.','A shaped stage surrounds a clear 0.03 × 0.03 m aperture. Two spring clips hold the slide against the stage.');
 stage.detail.zh=stage.detail.zh.replace('模型用四块板围成 0.03 × 0.03 米的光孔。','成形载物台围住 0.03 × 0.03 米的光孔；两只弹簧夹把玻片压在载物台上。');
 // The real slides are thin rectangular glass sheets; retain that geometry.
 // Add a subtle frosted writing zone to the supporting slide only.
 const slide=parts.find(p=>p.id==='slide-glass');slide.extra=[box([.009,.00012,.024],[.148,.17306,0],'plastic',.00003)];
 // Substage condenser: lens dome inside its bezel, aperture iris control
 // ring and a small lever, all centred on the same vertical optical axis.
 update(parts,'scope-condenser',profile([[.014,-.012],[.019,-.011],[.020,-.008],[.020,.003],[.017,.007],[.016,.012]],[.18,.135,0],'powder'),[
  ring(.021,.003,[.18,.129,0],'steel',undefined,.018),
  profile([[.014,-.0006],[.016,0],[.015,.001],[.011,.002]],[.18,.147,0],'glass'),
  ring(.0168,.0015,[.18,.148,0],'stainless',undefined,.0146),
  sweep([[.196,.13,.007],[.203,.13,.014],[.207,.131,.018]],.001,[0,0,0],'steel',{segments:12,radial:10}),
  profile([[.0025,-.001],[.003,-.0005],[.003,.001],[.0025,.0015]],[.207,.131,.018],'powder',undefined,20),
  box([.044,.004,.014],[.224,.137,-.021],'powder',.0015),
 ]);
 // Integrated field lamp: sloped cast housing, stepped field diaphragm rim,
 // recessed diffusing glass and aperture retaining ring.
 update(parts,'scope-illuminator',profile([[.023,-.006],[.025,-.004],[.025,-.002],[.023,.002],[.021,.005],[.020,.006]],[.18,.04,0],'enamel'),[
  ring(.0215,.003,[.18,.046,0],'powder',undefined,.0183),
  ring(.0223,.0015,[.18,.0435,0],'stainless',undefined,.0205),
  profile([[.0178,-.0005],[.0185,0],[.0178,.0005]],[.18,.047,0],'glass'),
 ]);
 // Coaxial focusing wheels: full fluted surfaces, front retaining plates,
 // stepped hubs and a minute index mark. Fine knob centre/rotation preserved.
 update(parts,'scope-coarse-focus',fluted(.0235,40,.01,[.26,.16,0]),[
  ring(.024,.0017,[.2545,.16,0],'steel',[0,0,-90],.0215),
  profile([[.022,-.001],[.0228,-.0005],[.0228,.0006],[.021,.0012]],[.266,.16,0],'steel',[0,0,-90]),
  ring(.0175,.0007,[.2671,.16,0],'powder',[0,0,-90],.0168),
 ]);
 update(parts,'scope-fine-focus',fluted(.0117,30,.011,[.274,.16,0],'powder'),[
  profile([[.006,-.004],[.007,-.003],[.007,.004]],[.267,.16,0],'steel',[0,0,-90],32),
  profile([[.0108,-.0009],[.0116,-.0005],[.0116,.0005],[.0104,.0011]],[.2805,.16,0],'steel',[0,0,-90],40),
  ring(.0088,.0006,[.28155,.16,0],'powder',[0,0,-90],.0082,40),
  box([.00018,.004,.0007],[.28194,.165,0],'enamel',.00005),
 ]);
 return parts;
}
