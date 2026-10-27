/** Original procedural teaching plates, CC BY-SA 4.0.
 * Metres; +Z faces the reader. Section faces use the engine's lathe hatching.
 * All repeated struts/lobules merge by material in the existing geometry builder. */
const bone = 'token:bone';
const shape = (kind, size, at, tint = bone, extra = {}) => ({ kind, size, at, color: 'tissue', tint, ...extra });
const lathe = (profile, at, tint = bone, extra = {}) => ({ kind: 'lathe', profile, segments: 48, at, color: 'tissue', tint, ...extra });
const tube = (path, radius, at, tint = bone) => ({ kind: 'tube', path, radius, at, color: 'tissue', tint });
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

export function boneSpecimens() {
  const outer = [[.075,-.26],[.082,-.23],[.073,-.19],[.045,-.13],[.035,-.04],[.037,.12],[.068,.20],[.075,.25]];
  const inner = [[.047,.25],[.043,.20],[.022,.12],[.021,-.04],[.028,-.13],[.048,-.19],[.055,-.23],[.050,-.26]];
  // A narrow interruption in the right cut lip is the nutrient foramen.
  // Upper/lower wall sections and a shorter arc across the entry band
  // leave an actual opening rather than burying the artery in solid cortex.
  const low = close([...outer.slice(0,4),[.0355,-.048],[.0215,-.048],...inner.slice(4)]);
  const high = close([[.035,-.034],...outer.slice(5),...inner.slice(0,3),[.021,-.034]]);
  const portal = close([[.0355,-.048],[.035,-.034],[.021,-.034],[.0215,-.048]]);
  const periosteum = close(outer.slice(2,6).map(([r,y])=>[r+.002,y]).concat(outer.slice(2,6).reverse().map(([r,y])=>[r+.0035,y])));
  // The removed front 160° exposes the wall's 14–28 mm section thickness.
  const cortex = [lathe(low,[2,0,0],bone,{arc:200}),lathe(high,[2,0,0],bone,{arc:200}),
    lathe(portal,[2,0,0],bone,{arc:180,rotation:[0,10,0]}),
    lathe(periosteum,[2,0,0],'token:neutral',{arc:75,rotation:[0,65,0]}),
    {kind:'sweep',path:[[.043,-.11,-.015],[.062,-.065,-.012],[.074,-.02,.004]],radius:[.016,.017,.012],
      scale:[1,1,.1],at:[2,0,0],color:'tissue',tint:'token:neutral'}];
  const struts = [], red = [];
  // A connected 3-D grid clipped to the two end volumes. Every rod joins
  // another rod; oblique braces connect adjacent layers, leaving marrow spaces.
  const step = .016;
  for (const cy of [-.212,.207]) {
    const nodes = new Map();
    for(let ix=-3;ix<=3;ix++) for(let iy=-2;iy<=2;iy++) for(let iz=-3;iz<=1;iz++) {
      const x=ix*step,y=iy*step,z=iz*step;
      if ((x/.057)**2+(y/.042)**2+(z/.057)**2<=1) nodes.set(`${ix},${iy},${iz}`,[x,cy+y,z]);
    }
    const edges=[];
    const lobules=[];
    for(const [key,p] of nodes) {
      const [ix,iy,iz]=key.split(',').map(Number);
      for(const [dx,dy,dz] of [[1,0,0],[0,1,0],[0,0,1],...(iy%2===0?[[1,1,0],[0,1,1]]:[])]) {
        const q=nodes.get(`${ix+dx},${iy+dy},${iz+dz}`);
        if(q) edges.push([p,q]);
      }
      // Lobules sit in the cells rather than replacing the white struts.
      const c=[p[0]+step/2,p[1]+step/2,p[2]+step/2];
      if((c[0]/.052)**2+((c[1]-cy)/.038)**2+(c[2]/.052)**2<1)
        lobules.push(c);
    }
    // A depth-first walk follows only actual lattice edges. Splitting the
    // walk into <=64-point paths stays within the existing primitive schema;
    // no engine limits or data format change is needed.
    const graph=new Map();
    for(const [a,b] of edges) for(const [p,q] of [[a,b],[b,a]]) {
      const key=p.join(',');if(!graph.has(key))graph.set(key,[]);graph.get(key).push(q);
    }
    const seen=new Set(),walk=[];
    const visit=p=>{const key=p.join(',');seen.add(key);walk.push(p);for(const q of graph.get(key)??[])if(!seen.has(q.join(','))){visit(q);walk.push(p);}};
    visit(nodes.values().next().value);
    // Non-tree edges are useful braces: include each as a short excursion
    // from the walk's first visit to its endpoint, returning along that edge.
    for(const [a,b] of edges) {
      const index=walk.indexOf(a);
      if(index>=0 && walk[index+1]!==b && walk[index-1]!==b) walk.splice(index+1,0,b,a);
    }
    for(let i=0;i<walk.length-1;i+=62) {
      const path=walk.slice(i,i+63);
      struts.push({kind:'sweep',path,radius:.0019,radial:6,segments:path.length*4,caps:'flat',at:[2,0,0],color:'tissue',tint:bone});
    }
    for(let i=0;i<15;i++) {
      const c=lobules[Math.floor(i*lobules.length/15)];
      red.push(shape('sphere',[.009],[2+c[0],c[1],c[2]],'token:muscle-3',{scale:[1,1.15,1]}));
    }
  }
  const artery = [tube([[.10,-.075,.018],[.06,-.058,.014],[.033,-.041,.007],[.015,-.025,0],[.008,.09,0]],.004,[2,0,0],'token:blood-rich'),
    tube([[.015,-.025,0],[.006,-.09,0],[0,-.17,0],[.023,-.21,0]],.0028,[2,0,0],'token:blood-rich'),
    tube([[.008,.06,0],[.012,.15,0],[-.021,.21,0]],.0028,[2,0,0],'token:blood-rich'),
    tube([[.012,.15,0],[.035,.20,-.012]],.002,[2,0,0],'token:blood-rich')];
  return {'bone-cortex':cortex,'bone-lattice':struts,
    'bone-marrow':[shape('capsule',[.018,.21],[2,-.003,-.005],'token:cut'),...red],
    'bone-vessel':artery};
}

export function repairSpecimens() {
  // All four share the same flared ends and shaft envelope. The first three
  // retain complementary jagged fracture faces in a longitudinal window.
  const lower = close([[0,-.19],[.025,-.19],[.041,-.174],[.043,-.145],[.026,-.10],[.025,-.014],[.018,-.007],[0,-.009]]);
  const upper = lower.map(([r,y])=>[r,-y]).reverse();
  const result={};
  for(const [i,id] of ['clot','soft','hard','remodelled'].entries()) {
    const x=[1.46,1.82,2.18,2.54][i];
    let pieces=[lathe(lower,[x,0,0]),lathe(upper,[x,0,0])];
    if(i===0) {
      pieces.push(shape('sphere',[.041],[x,0,-.016],'token:muscle-3',{scale:[1,1.05,.65]}));
      pieces.push(tube([[-.025,.012,.025],[-.008,.005,.026],[.005,.014,.026],[.018,.007,.026],[.025,.015,.025]],.0015,[x,0,0],'token:ink-2'));
    } else if(i===1) {
      const callus=close([[.028,-.066],[.043,-.042],[.050,0],[.043,.042],[.028,.066],[.022,.054],[.023,0],[.022,-.054]]);
      pieces.push(lathe(callus,[x,0,0],'token:cold',{arc:235}),shape('sphere',[.029],[x,0,-.012],'token:cold',{scale:[1,1.65,.6]}));
    } else if(i===2) {
      const callus=close([[.028,-.067],[.043,-.049],[.052,-.019],[.049,.022],[.044,.049],[.028,.067],[.023,.05],[.023,-.05]]);
      pieces.push(lathe(callus,[x,0,0],bone,{arc:250}));
      for(let n=0;n<11;n++) {
        const a=n*Math.PI*2/11;
        pieces.push(tube([[Math.cos(a)*.027,-.057,Math.sin(a)*.027],[Math.cos(a)*.049,0,Math.sin(a)*.049],[Math.cos(a)*.027,.057,Math.sin(a)*.027]],.0024,[x,0,0]));
      }
      pieces.push(shape('sphere',[.027],[x,0,-.012],bone,{scale:[1,1.7,.7]}));
    } else {
      const smooth=close([[0,-.19],[.025,-.19],[.041,-.174],[.043,-.145],[.026,-.10],[.025,-.055],[.030,0],[.025,.055],[.026,.10],[.043,.145],[.041,.174],[.025,.19],[0,.19]]);
      pieces=[lathe(smooth,[x,0,0])];
    }
    result[`repair-stage-${id}`]=pieces;
  }
  return result;
}

export function applySpecimens(parts) {
  const specimens={...jointSpecimens(),...boneSpecimens(),...repairSpecimens()};
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
