/** Original procedural teaching plates, CC BY-SA 4.0.
 * Metres; +Z faces the reader. Section faces use the engine's lathe hatching.
 * All repeated struts/lobules merge by material in the existing geometry builder. */
const bone = 'token:bone';
const shape = (kind, size, at, tint = bone, extra = {}) => ({ kind, size, at, color: 'tissue', tint, ...extra });
const lathe = (profile, at, tint = bone, extra = {}) => ({ kind: 'lathe', profile, segments: 48, at, color: 'tissue', tint, ...extra });
const close = points => [...points, points[0]];

export function jointSpecimens() {
  // The facing end is a shallow convex dome. Each cap shares its INNER
  // boundary with the bone, then returns along a 4–6 mm outer coating.
  const face = [[0,.016],[.018,.019],[.037,.028],[.052,.044],[.060,.064]];
  const upper = [...face,[.057,.083],[.039,.115],[.027,.205],[0,.205],[0,.016]];
  const cap = [...face,[.064,.064],[.057,.040],[.041,.023],[.020,.013],[0,.010],[0,.016]];
  const mirror = p => p.map(([r,y]) => [r,-y]).reverse();
  const pair = sign => [
    lathe(sign === 1 ? cap : mirror(cap), [-2,0,0], 'token:cold'),
    lathe(sign === 1 ? upper : mirror(upper), [-2,0,0]),
  ];
  // A sleeve attached beyond the cartilage margins; the frontal window
  // reveals a lining and the continuous fluid cavity between the caps.
  const capsule = close([[.040,-.132],[.069,-.094],[.080,-.055],[.083,0],[.080,.055],[.069,.094],[.040,.132],
    [.036,.132],[.065,.094],[.076,.055],[.079,0],[.076,-.055],[.065,-.094],[.036,-.132]]);
  const fluid = close([[0,-.009],[.023,-.013],[.043,-.025],[.062,-.049],[.069,-.068],[.072,0],
    [.069,.068],[.062,.049],[.043,.025],[.023,.013],[0,.009]]);
  const lining = capsule.map(([r,y]) => [r-.0045,y*.99]);
  const bands = [-1,1].map(s => ({
    kind:'sweep', path:[[s*.034,-.143,0],[s*.072,-.087,0],[s*.088,0,0],[s*.072,.087,0],[s*.034,.143,0]],
    radius:[.007,.009,.010,.009,.007], at:[-2,0,0], scale:[1,1,.3], color:'tissue', tint:'token:cut',
  }));
  return {
    'joint-cartilage-a': pair(1), 'joint-cartilage-b': pair(-1),
    'joint-capsule': [lathe(capsule,[-2,0,0],'token:neutral',{arc:220}),
      lathe(lining,[-2,0,0],'token:muscle-3',{arc:220}),
      lathe(fluid,[-2,0,0],'token:xray',{color:'membrane',arc:220})],
    'joint-ligament': bands,
  };
}

// Original femoral teaching envelope: bowed shaft, oblique neck, offset
// head, greater trochanter and unequal distal condyles. All stations are
// smoothly interpolated; no rotationally symmetric spool or detached balls.
const shaftPath=[[.002,-.199,0],[-.003,-.150,-.002],[-.010,-.070,-.006],[-.012,.020,-.009],[-.005,.100,-.005],[.009,.158,0],[.012,.180,0]];
const shaftR=[.033,.024,.021,.020,.022,.029,.031];
const sweep=(path,radius,at,tint=bone,extra={})=>({kind:'sweep',path,radius,radial:24,segments:64,caps:'round',up:[0,0,-1],at,color:'tissue',tint,...extra});
const random=seed=>()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
export function boneSpecimens() {
 const rand=random(0x20261103);
 const at=[2,0,0];
 const cortex=[];
 // The periosteal sleeve follows the shaft; a peeled leaf stays attached at
 // its lower edge. It is intentionally opaque so its thin edge stays readable.
 cortex.push(sweep(shaftPath.slice(1,5),shaftR.slice(1,5).map(r=>r+.0008),at,'token:neutral',
  {section:{u:292,flat:.85},hollow:.001,radial:24,segments:64}),
  sweep([[.019,-.119,.003],[.037,-.090,.011],[.049,-.047,.020],[.047,-.018,.026]],
  [.004,.014,.016,.001],at,'token:neutral',{section:{flat:.06},radial:16,segments:40,up:[0,0,1]}));
 const struts=[],red=[];
 const volumes=[{c:[-.053,.217,-.007],r:[.025,.025,.021],anchors:[[-.081,.229,-.0095],[-.029,.233,-.0095]]},
  {c:[.020,.178,-.005],r:[.024,.027,.015],anchors:[[.054,.190,-.0095],[-.0245,.164,-.0095]]},
  {c:[-.023,-.223,-.008],r:[.025,.027,.021],anchors:[[-.049,-.238,-.0095],[-.008,-.249,-.0095]]},
  {c:[.022,-.222,-.008],r:[.023,.026,.021],anchors:[[.0485,-.236,-.0095],[.010,-.249,-.0095]]}];
 for(const {c,r,anchors} of volumes){
  const nodes=[];
  // Stratified samples are jittered in all axes before clipping. Three nearest
  // neighbours form an irregular connected open-cell network, not a cubic grid.
  for(let ix=-3;ix<=3;ix++)for(let iy=-3;iy<=3;iy++)for(let iz=-3;iz<=1;iz++){
   const p=[(ix+(rand()-.5)*.8)/3.5,(iy+(rand()-.5)*.8)/3.5,(iz+(rand()-.5)*.8)/3.5];
   if(p.reduce((v,a)=>v+a*a,0)<.91)nodes.push(p.map((v,k)=>c[k]+v*r[k]));
  }
  const edges=new Set(),graph=nodes.map(()=>[]);
  nodes.forEach((p,i)=>{
   const near=nodes.map((q,j)=>({j,d:Math.hypot(...p.map((v,k)=>v-q[k]))})).filter(q=>q.j!==i).sort((a,b)=>a.d-b.d).slice(0,3);
   for(const {j} of near){const key=[Math.min(i,j),Math.max(i,j)].join(':');if(edges.has(key))continue;edges.add(key);graph[i].push(j);graph[j].push(i);}
  });
  const seen=new Set();
  // Each connected component is a closed edge walk. Bounded chunks share
  // their last station, so every piece meets another at an actual node.
  for(let start=0;start<nodes.length;start++){
   if(graph[start].every(j=>seen.has([Math.min(start,j),Math.max(start,j)].join(':'))))continue;
   const walk=[nodes[start]];
   const visit=i=>{for(const j of graph[i]){const key=[Math.min(i,j),Math.max(i,j)].join(':');if(seen.has(key))continue;seen.add(key);walk.push(nodes[j]);visit(j);walk.push(nodes[i]);}};
   visit(start);
   for(let k=0;k<walk.length-1;k+=119){const path=walk.slice(k,k+120);
    struts.push(sweep(path,path.map((p,i)=>.00065+.00015*Math.sin(i*1.7+p[1]*40)),at,bone,{radial:7,segments:Math.min(512,path.length*2),caps:'flat'}));
   }
  }
  // These braces meet actual cortical material at both ends and pass
  // through two existing lattice nodes, tying the network to the wall.
  const nearest=target=>nodes.reduce((best,p)=>Math.hypot(...p.map((v,k)=>v-target[k]))<Math.hypot(...best.map((v,k)=>v-target[k]))?p:best);
  struts.push(sweep([anchors[0],nearest(anchors[0]),[c[0],c[1]+r[1]*.08,c[2]-.002],nearest(anchors[1]),anchors[1]],
   [.001,.0012,.0013,.0012,.001],at,bone,{radial:7,segments:28,caps:'flat'}));
  // Red marrow is a contiguous lobed bed behind the open lattice. Its
  // undulating surface is recessed, leaving real empty trabecular spaces.
  red.push(sweep([[c[0]-r[0]*.45,c[1]-r[1]*.65,-.011],[c[0]+r[0]*.08,c[1]-r[1]*.3,-.012],
   [c[0]-r[0]*.1,c[1]+r[1]*.3,-.012],[c[0]+r[0]*.2,c[1]+r[1]*.65,-.012]],
   [r[0]*.32,r[0]*.69,r[0]*.62,r[0]*.18],at,'token:muscle-3',{section:{flat:.18},radial:20,segments:40}));
 }
 // Principal compressive/tensile arches run from neck into proximal shaft.
 for(let i=0;i<5;i++){
  const d=i*.0066;
  struts.push(sweep([[-.058+d,.226,-.004],[-.035+d*.6,.193,-.007],[-.010+d*.25,.152,-.007],[-.006+d*.1,.119,-.008]],
   [.001,.0014,.0013,.0007],at,bone,{radial:7,segments:32}));
 }
 const yellow=sweep([[-.003,-.177,-.008],[-.009,-.131,-.008],[-.012,-.079,-.009],[-.013,-.022,-.009],[-.010,.042,-.008],[-.003,.095,-.006],[.005,.129,-.006]],
  [.008,.015,.0135,.014,.013,.012,.006],at,'token:cut',{section:{flat:.61},radial:32,segments:100});
 const artery=[sweep([[.073,-.072,.019],[.041,-.058,.013],[.021,-.043,-.0085],[.004,-.041,-.0085],[.001,-.026,-.004],[-.002,.013,.003],[-.001,.105,.001]],
  [.0036,.0034,.003,.0028,.0026,.0023,.0015],at,'token:blood-rich',{radial:16,segments:72}),
  sweep([[.001,-.026,-.004],[-.001,-.075,.002],[-.003,-.145,0],[-.014,-.199,0],[-.028,-.230,0]],
  [.0028,.0026,.0022,.0016,.0008],at,'token:blood-rich',{radial:14,segments:64}),
  sweep([[-.001,.105,.001],[.001,.150,0],[-.025,.190,-.002],[-.054,.222,-.002]],[.0017,.0015,.0011,.0006],at,'token:blood-rich',{radial:12,segments:48}),
  sweep([[.001,.150,0],[.025,.183,-.001],[.031,.199,-.003]],[.0014,.001,.0005],at,'token:blood-rich',{radial:12,segments:32})];
 // Thin articular coatings hug the external head and distal condyles, leaving
 // the teaching window open. They are part of the lattice selection's pieces.
 const profile=[];
 for(let i=0;i<=44;i++){const a=i/44*2.02;profile.push([.033*Math.sin(a),.032*Math.cos(a)]);}
 for(let i=44;i>=0;i--){const a=i/44*2.02;profile.push([.0318*Math.sin(a),.0308*Math.cos(a)]);}
 const caps=[lathe(close(profile).reverse(),[1.946,.218,-.003],'token:cold',{arc:180,rotation:[0,0,45],scale:[1,1,.875]}),
  ...[-1,1].map(sign=>sweep([[sign*.024,-.231,-.002],[sign*.024,-.242,-.002],[sign*.020,-.253,-.003]],
  [sign<0?.030:.028,.023,.005],at,'token:cold',{section:{u:170,flat:.85},hollow:.0013,radial:32,segments:32}))];
 return {'bone-cortex':cortex,'bone-lattice':[...struts,...caps],
  'bone-marrow':[yellow,...red],'bone-vessel':artery};
}

export function applySpecimens(parts) {
  const specimens={...jointSpecimens(),...boneSpecimens()};
  for(const [id,pieces] of Object.entries(specimens)) {
    const part=parts.find(p=>p.id===id);
    part.primitive=pieces[0];
    if(pieces.length>1)part.extra=pieces.slice(1);else delete part.extra;
  }
  // The hinge belongs to the fixed frame (context); the distance dot belongs
  // to the rotating beam. Neither adds a selectable part or a sim behaviour.
  const beam=parts.find(p=>p.id==='lever-beam');
  beam.extra=[shape('sphere',[.006],[4,-.04,.018],'token:signal'),
    shape('bevelBox',[.030,.002,.002],[4,-.04,.016],'token:ink',{bevel:.0005,color:'powder'})];
  const pivot=shape('cylinder',[.011,.011,.042],[4,0,0],'token:ink-2',{rotation:[90,0,0],color:'steel'});
  parts.push({id:'lever-pivot',name:{en:'Fixed fulcrum',zh:'固定支点'},summary:{en:'Marks the fixed centre of rotation.',zh:'标出固定的转动中心。'},
    detail:{en:'The fixed hinge marks the pivot of the ideal lever. The beam rotates around it [S34].',zh:'固定铰链标出理想杠杆的支点，梁绕它转动 [S34]。'},
    group:'pull-and-lever',context:true,primitive:pivot,
    extra:[{kind:'extrude',shape:[[-.032,-.040],[.032,-.040],[0,-.005]],depth:.012,bevel:.001,at:[4,0,-.025],color:'powder',tint:'token:ink-2'}]});
}
