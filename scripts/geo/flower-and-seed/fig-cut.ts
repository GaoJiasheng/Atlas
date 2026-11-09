/** Half-sectioned Ficus receptacle with an ostiole flush in its green rind. */
import { BufferGeometry, CatmullRomCurve3, Color, Float32BufferAttribute, Vector3 } from "three";
import { surface, type P } from "../living-things/sculpture";
import type { Model } from "../living-things/kit";
import { rng } from "../living-things/kit";
import { Sculpt } from "./sculpt";

const TAU = Math.PI * 2;
const mix = (a: P, b: P, t: number): P => a.map((x, i) => x + (b[i]! - x) * t) as P;
function reverse(g: BufferGeometry) {
  const index = g.index!;
  for (let i = 0; i < index.count; i += 3) {
    const a = index.getX(i); index.setX(i, index.getX(i + 1)); index.setX(i + 1, a);
  }
  g.computeVertexNormals(); return g;
}

export function figCutRound3(): Model {
  const s = new Sculpt();
  // The last three rings form a broad shoulder and a shallow depression around
  // the true opening. The fig-wasp anchor remains [0, .096, 0].
  const profile = new CatmullRomCurve3([
    [.0041, 0, 0], [.0045, .006, 0], [.0052, .012, 0], [.014, .019, 0],
    [.026, .028, 0], [.035, .041, 0], [.039, .059, 0],
    [.038, .073, 0], [.029, .085, 0], [.014, .093, 0],
    [.008, .0960, 0], [.0045, .0962, 0], [.0023, .0953, 0],
  ].map(p => new Vector3(...p)));
  const exterior = (u: number, a: number): P => {
    const q = profile.getPoint(u), fade = Math.sin(Math.PI * u);
    const r = q.x * (1 + .015 * Math.sin(a * 3 + u * 7) * fade);
    return [Math.cos(a) * r, q.y, -Math.sin(a) * r];
  };
  const parameterAtHeight = (curve: CatmullRomCurve3, y: number, ceiling = 1) => {
    let lo = 0, hi = ceiling;
    for (let i = 0; i < 24; i++) {
      const mid = (lo + hi) * .5;
      if (curve.getPoint(mid).y < y) lo = mid; else hi = mid;
    }
    return (lo + hi) * .5;
  };
  // A true longitudinal half-section: no complete front collar can project
  // over the cut plane as a separate disc. The ostiole stays in the rind.
  const outer = reverse(surface(48, 40, (u, v) => exterior(u, v * Math.PI)));
  for (const skin of [outer]) {
    const p = skin.getAttribute("position"), colors: number[] = [];
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i), y = p.getY(i), z = p.getZ(i), a = (Math.atan2(-z, x) + TAU) % TAU;
      const patches = .19 + .12 * Math.sin(y * 74 + a * 2) + .05 * Math.sin(a * 7 - y * 110);
      const c = new Color("#576a2f").lerp(new Color("#8a8a3c"), patches);
      const flecks = Math.max(0, Math.sin(a * 33 + y * 210)) ** 12 * Math.max(0, Math.sin(y * 1500 + a * 11)) ** 10;
      c.lerp(new Color("#e9e4d8"), flecks * .15).multiplyScalar(.96 + .025 * Math.sin(a * 17 + y * 83));
      colors.push(c.r, c.g, c.b);
    }
    skin.setAttribute("color", new Float32BufferAttribute(colors, 3)); s.put(skin, "#576a2f");
  }

  const cavity = new CatmullRomCurve3([
    [.0001, .025, 0], [.009, .030, 0], [.023, .042, 0], [.032, .059, 0],
    [.032, .071, 0], [.024, .080, 0], [.0073, .0938, 0], [.0028, .0948, 0],
  ].map(p => new Vector3(...p)));
  const interior = (u: number, a: number): P => {
    const q = cavity.getPoint(u), fade = Math.sin(Math.PI * u);
    // Rounded, densely papillate tissue is one continuous lining, separate from
    // the 26 teaching florets. Relief fades smoothly at its cut/canal joins.
    const field = .5 + .5 * Math.sin(u * 100 + Math.sin(a * 13) * .4) * Math.sin(a * 28 + u * 16);
    const bump = (.00032 + .00145 * field ** 3) * fade * Math.abs(Math.sin(a)) ** .3;
    const r = Math.max(.0001, q.x - bump);
    return [Math.cos(a) * r, q.y, -Math.sin(a) * r];
  };
  const lining = surface(48, 44, (u, v) => interior(u, v * Math.PI));
  for (const tissue of [lining]) {
    const lp = tissue.getAttribute("position"), lc: number[] = [];
    for (let i = 0; i < lp.count; i++) {
      const y = lp.getY(i), x = lp.getX(i), z = lp.getZ(i);
      const c = new Color("#8a8378").lerp(new Color("#b8602e"), .32 + .17 * Math.sin(y * 310 + x * 117 + z * 130));
      c.multiplyScalar(.96 + .035 * Math.sin(y * 1300 + x * 500)); lc.push(c.r, c.g, c.b);
    }
    tissue.setAttribute("color", new Float32BufferAttribute(lc, 3)); s.put(tissue, "#c9bea6");
  }
  // The cut faces terminate precisely at the edges of the same half-canal.
  const boundaryAtHeight = (y: number, a: number): P => {
    if (y < .025) return [0, y, 0];
    // Match by physical height, not by differently spaced outer/inner loft
    // parameters; the narrow peduncle therefore cannot cross the cavity wall.
    const Y = Math.min(y, .0944);
    const q = cavity.getPoint(parameterAtHeight(cavity, Y));
    return [Math.cos(a) * q.x, q.y, 0];
  };
  for (const a of [0, Math.PI]) {
    const cut = surface(36, 4, (u, v) => {
      const q = exterior(u, a);
      return mix(q, boundaryAtHeight(q[1], a), v);
    });
    // A real rind wraps onto the section edge, including the short green stalk.
    const colors: number[] = [];
    for (let i = 0; i <= 36; i++) for (let j = 0; j <= 4; j++) {
      const y = exterior(i / 36, a)[1];
      const c = new Color(j <= 1 || y < .018 ? "#576a2f" : "#c9bea6");
      colors.push(c.r, c.g, c.b);
    }
    cut.setAttribute("color", new Float32BufferAttribute(colors, 3));
    s.put(a ? reverse(cut) : cut, "#c9bea6", .018);
  }
  // A half-canal joins the sectioned ostiole to the cavity, with no front
  // roof or suspended cap. Its outer rim is the same continuous receptacle.
  s.put(reverse(surface(6, 40, (u, v) => {
    const a = v * Math.PI, r = .0023 + .0005 * u, y = .0953 - .0005 * u;
    return [Math.cos(a) * r, y, -Math.sin(a) * r];
  })), "#554235");
  // Five small interlocking bract folds embedded in the retained half-rim.
  // Their attached broad bases merge into the receptacle; pointed tips tuck
  // slightly into the opening instead of forming spokes across a wheel.
  for (let k = 0; k < 5; k++) {
    const a = .20 + k * .67, width = .0012 + .00008 * Math.sin(k * 3.1);
    s.put(surface(12, 6, (u, v) => {
      const theta = v * TAU, r = .0047 - (.00492 + .00012 * Math.sin(k * 2.1)) * u;
      const az = a + .08 * u, lateral = Math.cos(theta) * width * Math.sin(Math.PI * u);
      const y = .09615 - .00105 * u + .00013 * Math.sin(Math.PI * u) + .000045 * k * u
        + Math.sin(theta) * .00009 * Math.sin(Math.PI * u);
      return [Math.cos(az) * r - Math.sin(az) * lateral, y, -Math.abs(Math.sin(az) * r + Math.cos(az) * lateral)];
    }, true), k % 2 ? "#576a2f" : "#555047");
  }

  // Twenty-six established teaching florets are retained within a continuous,
  // tightly packed population of sessile florets. Every broad ovary base is
  // buried in the SAME cavity loft; no independent beads in empty space.
  const random = rng(51105);
  const floret = (u: number, a: number, i: number) => {
    const base = new Vector3(...interior(u, a));
    const du = new Vector3(...interior(Math.min(.99,u+.001),a)).sub(new Vector3(...interior(Math.max(.01,u-.001),a))).normalize();
    const da = new Vector3(...interior(u,a+.001)).sub(base).normalize();
    const N = new Vector3().crossVectors(du,da).normalize();
    if (N.dot(new Vector3(-base.x,0,-base.z)) < 0) N.negate();
    const length = .0026 + random() * .0013, width = .00185 + random() * .00030;
    const c = new Color(i % 4 ? "#744518" : "#b8602e").lerp(new Color("#c9bea6"),.10 + random()*.18);
    // Closed shared-ring mesh: no duplicated seam or degenerate pole rings.
    // Eight radial samples suffice for millimetre-scale florets; interpolated
    // surface normals remain smooth after meshopt simplification.
    const positions:number[]=[], colors:number[]=[], indices:number[]=[];
    positions.push(...base.clone().addScaledVector(N,-.0007).toArray());
    for(let ring=1;ring<=3;ring++) {
      const t=[.04,.42,.76][ring-1]!;
      for(let k=0;k<8;k++) {
        const az=k/8*TAU, r=width*(ring===1?.90:ring===2?1:.72);
        positions.push(...base.clone().addScaledVector(N,-.00045+length*t)
          .addScaledVector(du,Math.cos(az)*r+.0005*t*t*Math.sin(i*2.1))
          .addScaledVector(da,Math.sin(az)*r).toArray());
      }
    }
    positions.push(...base.clone().addScaledVector(N,length-.00045).addScaledVector(du,.0005*Math.sin(i*2.1)).toArray());
    for(let k=0;k<8;k++) {
      const next=(k+1)%8;
      indices.push(0,1+next,1+k);
      for(let ring=0;ring<2;ring++) {
        const a=1+ring*8+k,b=1+ring*8+next;
        indices.push(a,b,a+8,b,b+8,a+8);
      }
      indices.push(17+k,17+next,25);
    }
    for(let n=0;n<26;n++) {
      const shade=c.clone().multiplyScalar(.76+.24*Math.min(1,n/18));
      colors.push(shade.r,shade.g,shade.b);
    }
    const g=new BufferGeometry();g.setAttribute("position",new Float32BufferAttribute(positions,3));
    g.setAttribute("color",new Float32BufferAttribute(colors,3));g.setIndex(indices);g.computeVertexNormals();
    s.put(g,"#b8602e");
    // Pale style emerges directly from ovary tip; tapered, never a floating dot.
    if(i%3===0) {
      const tip = base.clone().addScaledVector(N,length-.0005);
      s.line([tip.toArray() as P,tip.clone().addScaledVector(N,.0011).addScaledVector(du,.0006).toArray() as P], [.00025,.00008],"#c9bea6",1,5,3);
    }
  };
  for (let i=0;i<26;i++) floret(.16+i/25*.65,.16+(i*2.39996%2.78),i);
  // Staggered near-hexagonal packing varies with local wall circumference.
  let index=26;
  for(let row=0;row<24;row++) {
    const u=cavity.getUtoTmapping(.06+row/23*.88,0), radius=cavity.getPoint(u).x;
    const count=Math.max(5,Math.floor(Math.PI*radius/.0038));
    for(let k=0;k<count;k++) {
      const a=.035+(k+.25+.5*(row%2)+random()*.17)/(count+.5)*(Math.PI-.07);
      floret(u+(random()-.5)*.013,a,index++);
    }
  }
  return s.finish();
}
