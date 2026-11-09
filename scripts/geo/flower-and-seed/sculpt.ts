/** Original build-time botanical and zoological surfaces. No photograph textures. */
import {
  BufferGeometry,
  Float32BufferAttribute,
  Vector3,
  CatmullRomCurve3,
  Color,
  Matrix4,
} from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { surface, tube, orb, type P } from "../living-things/sculpture";
import { type Model, rng } from "../living-things/kit";
import { coatUV, coatPigment } from "./bat-finish";
import { fernRound3, mossRound3 } from "./fern-moss";
import { redFlowerRound3 } from "./costus";
import { coconutRound3 } from "./coconut";
import { seaAlmondCutRound3 } from "./almond-cut";
import { figCutRound3 } from "./fig-cut";
const TAU = Math.PI * 2;
function reverse(g: BufferGeometry) {
  const ix = g.index!;
  for (let i = 0; i < ix.count; i += 3) {
    const b = ix.getX(i + 1);
    ix.setX(i + 1, ix.getX(i + 2));
    ix.setX(i + 2, b);
  }
  const n = g.getAttribute("normal");
  for (let i = 0; i < n.count; i++)
    n.setXYZ(i, -n.getX(i), -n.getY(i), -n.getZ(i));
  return g;
}
const palette = {
  leaf: "#2d5a34",
  young: "#8a8a3c",
  rib: "#555047",
  humus: "#555047",
  bark: "#857d70",
  fur: "#5e554e",
  furLight: "#555047",
  wing: "#555047",
  bone: "#857d70",
  dark: "#2a2824",
  ivory: "#e9e4d8",
  yellow: "#b8973c",
  olive: "#576a2f",
  husk: "#6e5a44",
  fibre: "#857d70",
  shell: "#2a2824",
  meat: "#e9e4d8",
  red: "#6e5a44",
};
export const ROUND = Number(process.env.FLOWER_ROUND ?? 4);
function coloured(g: BufferGeometry, c: string, variation = 0) {
  const p = g.getAttribute("position"),
    old = g.getAttribute("color"),
    a: number[] = [],
    col = new Color(c);
  for (let i = 0; i < p.count; i++) {
    const k =
      1 +
      variation *
        Math.sin(p.getX(i) * 679 + p.getY(i) * 453 + Math.sin(p.getZ(i) * 951));
    a.push(
      (old ? old.getX(i) : col.r) * k,
      (old ? old.getY(i) : col.g) * k,
      (old ? old.getZ(i) : col.b) * k,
    );
  }
  g.setAttribute("color", new Float32BufferAttribute(a, 3));
  if (!g.index) g.setIndex(Array.from({ length: p.count }, (_, i) => i));
  for (const key of Object.keys(g.attributes))
    if (!["position", "normal", "color", "uv", "uv1"].includes(key))
      g.deleteAttribute(key);
  const finish =
    c === palette.wing
      ? 1
      : c === palette.dark
        ? 2
        : c === palette.leaf || c === palette.young
          ? 3
          : 0;
  g.setAttribute(
    "uv1",
    new Float32BufferAttribute(
      Array.from({ length: p.count }, () => [(finish + 0.5) / 4, 0.5]).flat(),
      2,
    ),
  );
  if (!g.userData.textureUV)
    g.setAttribute(
      "uv",
      new Float32BufferAttribute(
        Array.from({ length: p.count * 2 }, () => 0.001),
        2,
      ),
    );
  return g;
}
export class Sculpt {
  pieces: BufferGeometry[] = [];
  put(g: BufferGeometry, c: string, v = 0) {
    this.pieces.push(coloured(g, c, v));
    return g;
  }
  line(p: P[], r: number[], c: string, flat = 1, radial = 8, n = 14) {
    return this.put(tube(p, r, flat, radial, n), c);
  }
  orb(p: P, r: P, c: string, n = 24, m = 16) {
    return this.put(orb(p, r, n, m), c);
  }
  finish(): Model {
    const g = mergeGeometries(this.pieces, false);
    if (!g) throw new Error("incompatible sculpture attributes");
    return {
      primitive: {
        kind: "__mesh",
        at: [0, 0, 0],
        geometry: g,
        color: "plastic",
        tint: "#ffffff",
      },
      extra: [],
    };
  }
}
const mix = (a: P, b: P, t: number): P =>
  a.map((x, k) => x + (b[k]! - x) * t) as P;
/** Closed, cambered, asymmetric leaf or feather. No flat extruded plank. */
function lancet(
  root: P,
  tip: P,
  width: number,
  N: P,
  camber = 0.002,
  n = 22,
  m = 10,
) {
  const a = new Vector3(...root),
    axis = new Vector3(...tip).sub(a),
    normal = new Vector3(...N).normalize(),
    side = new Vector3().crossVectors(normal, axis).normalize();
  return reverse(
    surface(
      n,
      m,
      (u, v) => {
        const theta = v * TAU,
          span = Math.pow(Math.sin(Math.PI * u), 0.66) * width * 0.5,
          w = Math.cos(theta) * span * (Math.cos(theta) > 0 ? 1 : 0.87),
          h = Math.sin(theta) * width * 0.022 * Math.sin(Math.PI * u);
        return a
          .clone()
          .addScaledVector(axis, u)
          .addScaledVector(side, w)
          .addScaledVector(normal, h + camber * Math.sin(Math.PI * u))
          .toArray() as P;
      },
      true,
    ),
  );
}
/** Cubic ring loft, with independent width and height: rounded cranium / stop / parallel muzzle. */
function axial(rings: [number, number, number, number][], n = 64, m = 40) {
  const c = new CatmullRomCurve3(rings.map(([x, y]) => new Vector3(x, y, 0))),
    r = new CatmullRomCurve3(
      rings.map(([, , ry, rz]) => new Vector3(ry, rz, 0)),
    );
  return reverse(
    surface(
      n,
      m,
      (u, v) => {
        const q = c.getPoint(u),
          s = r.getPoint(u),
          a = v * TAU;
        return [
          q.x,
          q.y + Math.cos(a) * Math.max(0, s.x),
          Math.sin(a) * Math.max(0, s.y),
        ];
      },
      true,
    ),
  );
}
function fuzz(
  s: Sculpt,
  g: BufferGeometry,
  count: number,
  len: number,
  col: string,
  seed = 19,
) {
  const rand = rng(seed),
    p = g.getAttribute("position"),
    n = g.getAttribute("normal");
  for (let i = 0; i < count; i++) {
    const j = Math.floor(rand() * p.count),
      v = new Vector3().fromBufferAttribute(p, j),
      N = new Vector3().fromBufferAttribute(n, j);
    if (N.length() < 0.5) continue;
    const tangent = new Vector3(-1, -0.18, (rand() - 0.5) * 0.6)
        .addScaledVector(N, 0.35)
        .normalize(),
      end = v
        .clone()
        .addScaledVector(N, len * 0.25)
        .addScaledVector(tangent, len * (0.55 + rand() * 0.7));
    s.line(
      [v.toArray() as P, end.toArray() as P],
      [len * 0.055, 0.000005],
      col,
      1,
      3,
      2,
    );
  }
}
function frond(
  s: Sculpt,
  a: number,
  l: number,
  w: number,
  rise: number,
  phase: number,
  under = false,
  base: P = [0, 0.026, 0],
) {
  const D = new Vector3(Math.cos(a), 0, Math.sin(a)),
    S = new Vector3(-Math.sin(a), 0, Math.cos(a));
  const centre = (u: number) =>
    new Vector3(...base)
      .addScaledVector(D, 0.022 + l * (0.15 * u + (rise > 1 ? 0.35 : 0.70) * u * u))
      .add(
        new Vector3(
          0,
          l * (rise > 1 ? rise * (1.05*u-.05*u*u) : rise * Math.sin(u * Math.PI * 0.74) - 0.22 * u * u),
          0,
        ),
      );
  const point = (u: number, q: number, thick = 0) => {
    const width =
        w *
        0.5 *
        (u <= 0.07 || u >= 1 ? 0 : Math.pow(Math.sin(Math.PI * Math.pow((u - 0.07) / 0.93, 1.28)), 0.86)),
      edge = Math.abs(q),
      wave =
        (ROUND >= 4 ? 0.0048 : ROUND >= 2 ? 0.0035 : 0.0015) *
        Math.sin(u * 37 + phase) *
        Math.pow(edge, 2) *
        Math.sin(Math.PI * u);
    return centre(u)
      .addScaledVector(S, q * width)
      .add(
        new Vector3(
          0,
          0.002 * edge * edge * Math.sin(Math.PI * u) + wave + thick,
          0,
        ),
      )
      .toArray() as P;
  };
  // A top and bottom skin joined at the wavy margin, with a dark midrib in relief.
  const g = surface(
    56,
    16,
    (u, v) => {
      const t = v * TAU;
      return point(
        u,
        Math.cos(t),
        Math.sin(t) * 0.00035 * Math.sin(Math.PI * u),
      );
    },
    true,
  );
  s.put(g, under ? palette.young : palette.leaf, 0.012);
  s.put(
    surface(64, 6, (u, v) => {
      const q = 2 * v - 1,
        width = 0.00165 * (1 - u) + 0.00006;
      return centre(u)
        .addScaledVector(S, q * width)
        .add(new Vector3(0, 0.0005 + 0.0021 * (1 - Math.abs(q)) ** 1.5, 0))
        .toArray() as P;
    }),
    palette.rib,
  );
  for (let k = 3; k < 23; k += 2)
    for (const side of [-1, 1]) {
      const u = k / 26;
      const pts = [
        point(u, 0, 0.0005),
        point(u + 0.016, side * 0.45, 0.00053),
        point(u + 0.03, side * 0.88, 0.0005),
      ];
      s.line(
        pts,
        [0.000055, 0.000045, 0.000015],
        under ? palette.young : palette.leaf,
        1,
        4,
        5,
      );
    }
  if (under)
    for (let k = 12; k < 25; k++)
      for (const side of [-1, 1])
        s.line(
          [
            point(k / 27, side * 0.08, 0.0009),
            point(k / 27 + 0.018, side * 0.48, 0.001),
          ],
          [0.00043, 0.00032],
          palette.rib,
          0.5,
          6,
          6,
        );
  return g;
}
export function fern(): Model { return fernRound3(); }
export function underside(): Model {
  const s = new Sculpt();
  frond(s, 0, 0.22, 0.047, 0.3, 1, true, [-0.11, 0.01, 0]);
  return s.finish();
}
export function nectarBat(): Model {
  const s = new Sculpt();
  const facePoint=(p:P):P=>{
    if(p[0]<=.060)return p;
    const t=Math.min(1,(p[0]-.060)/.024);
    return [.060+(p[0]-.060)*.73,p[1]-.0025*t*t*(3-2*t),p[2]];
  };
  const faceMesh=(g:BufferGeometry)=>{
    const p=g.getAttribute("position");for(let i=0;i<p.count;i++)p.setXYZ(i,...facePoint([p.getX(i),p.getY(i),p.getZ(i)]));g.computeVertexNormals();return g;
  };
  const body = s.put(
    axial(
      [
        [-0.052, -0.005, 0, 0],
        [-0.044, -0.004, 0.009, 0.011],
        [-0.027, -0.002, 0.013, 0.014],
        [-0.008, 0.002, 0.019, 0.019],
        [0.012, 0.008, 0.022, 0.023],
        [0.025, 0.012, 0.018, 0.018],
        [0.032, 0.015, 0.0125, 0.0125],
        [0.040, 0.020, 0.014, 0.014],
        [0.049, 0.021, 0.013, 0.0145],
        [0.056, 0.018, 0.0125, 0.012],
        [0.061, 0.012, 0.0082, 0.0085],
        [0.069, 0.009, 0.0062, 0.0063],
        [0.077, 0.0095, 0.0045, 0.0049],
        [0.082, 0.0105, 0.003, 0.0035],
        [0.084, 0.0108, 0, 0],
      ],
      112,
      56,
    ),
    "#ffffff",
  );
  faceMesh(body);
  coatUV(body, 112, 56);
  furBlades(s, body, 1500);
  const skinRows = Array.from({length:113},(_,i)=>{
    const p=body.getAttribute("position"), j=i*57;
    return {x:p.getX(j),y:(p.getY(j)+p.getY(j+28))/2,ry:(p.getY(j)-p.getY(j+28))/2,rz:p.getZ(j+14)};
  });
  const cheekZ=(x:number,y:number)=>{
    let i=skinRows.findIndex(r=>r.x>=x); i=Math.max(1,i);
    const a=skinRows[i-1]!,b=skinRows[i]!,f=Math.max(0,Math.min(1,(x-a.x)/(b.x-a.x))), cy=a.y+(b.y-a.y)*f, ry=a.ry+(b.ry-a.ry)*f, rz=a.rz+(b.rz-a.rz)*f;
    return rz*Math.sqrt(Math.max(.02,1-((y-cy)/ry)**2));
  };
  const eyeX=.055, eyeY=.0215;
  const bp=body.getAttribute("position");
  for(let i=0;i<bp.count;i++) {
    const p=new Vector3().fromBufferAttribute(bp,i),side=p.z>=0?1:-1,N=new Vector3(.88,0,side*.475).normalize(),T=new Vector3(.475,0,-side*.88).normalize();
    const c=new Vector3(eyeX,eyeY,side*cheekZ(eyeX,eyeY)),d=p.clone().sub(c),r=(d.dot(T)/.0050)**2+(d.y/.0044)**2;
    if(r<1.4&&Math.abs(d.dot(N))<.004)p.addScaledVector(N,-.00165*Math.max(0,1-r/1.4)**.65);
    bp.setXYZ(i,p.x,p.y,p.z);
  }
  body.computeVertexNormals();
  // Jaw / open mouth / narrow nectar tongue, no projecting cone.
  const jaw = s.put(
    axial(
      [
        [0.052, 0.006, 0, 0],
        [0.061, 0.0048, 0.0016, 0.0046],
        [0.074, 0.0048, 0.0012, 0.0036],
        [0.082, 0.006, 0, 0],
      ],
      32,
      24,
    ),
    "#ffffff",
  );
  faceMesh(jaw);
  coatUV(jaw, 32, 24);
  // Flush lips wrap both sides of the jaw; a shallow groove separates them.
  for (const side of [-1, 1]) {
    const lip = ([[0.060,0.007,side*.0040],[0.069,0.006,side*.0048],[0.077,0.0063,side*.0033],[0.082,0.007,side*.0016]] as P[]).map(facePoint);
    s.line(lip, [.00010,.00016,.00016,.00006], "#6e5a44", 1, 8, 28);
    s.line(lip.map(p=>[p[0],p[1]-.0002,p[2]] as P), [.00006,.00011,.00010,.00002], palette.dark,1,6,28);
  }
  s.line(
    [
      facePoint([0.071, 0.004, 0]),
      facePoint([0.083, 0.004, 0]),
      [0.098, 0.001, 0.0003],
      [0.109, 0.005, 0.001],
    ],
    [0.0019, 0.0016, 0.0013, 0.0007],
    "#8f6a62",
    0.55,
    12,
    24,
  );
  // Nasal pad with two actual funnel-shaped nostrils.
  const nose = s.orb(
      [0.0815, 0.0108, 0],
      [0.0030, 0.0016, 0.0026],
      "#6e5a44",
      40,
      28,
    ),
    np = nose.getAttribute("position");
  for (let j = 0; j < np.count; j++) {
    if (np.getX(j) < 0.081) continue;
    let dent = 0;
    for (const side of [-1, 1])
      dent = Math.max(
        dent,
        Math.exp(
          -(
            (Math.hypot(np.getY(j) - 0.01, np.getZ(j) - side * 0.0014) /
              0.0011) **
            4
          ),
        ),
      );
    np.setX(j, np.getX(j) - 0.0008 * dent);
  }
  nose.computeVertexNormals();
  faceMesh(nose);
  for (const side of [-1, 1]) {
    const c: P = [0.082, 0.01, side * 0.0014];
    const g = surface(
      16,
      24,
      (u, v) => {
        const a = v * TAU,
          r = 0.00065 * (1 - u) + 0.00015 * u;
        return [
          c[0] + 0.0007 - u * 0.0018,
          c[1] + Math.cos(a) * r,
          c[2] + Math.sin(a) * r,
        ];
      },
      true,
    );
    faceMesh(g);s.put(g, palette.rib);
    // A rounded cornea sits below an actual skin orbit. The thin lids merge
    // into the cheek, rather than surrounding the eyes with raised wire rings.
    const E=new Vector3(eyeX,eyeY,side*cheekZ(eyeX,eyeY)), eyeN=new Vector3(.88,0,side*.475).normalize(), eyeT=new Vector3(.475,0,-side*.88).normalize();
    const eyeSkin=(r:number,a:number)=>{
      const p=E.clone().addScaledVector(eyeT,Math.cos(a)*.0050*r).add(new Vector3(0,Math.sin(a)*.0044*r,0));
      for(let j=0;j<4;j++){
        const f=p.z-side*cheekZ(p.x,p.y),h=.00001;
        const df=eyeN.z-side*(cheekZ(p.x+eyeN.x*h,p.y)-cheekZ(p.x,p.y))/h;
        p.addScaledVector(eyeN,Math.max(-.002,Math.min(.002,-f/(Math.abs(df)<.1?1:df))));
      }
      return p;
    };
    const eye=s.put(surface(18,40,(u,v)=>eyeSkin(u*.94,v*TAU).addScaledVector(eyeN,-.0012+.0010*(1-u*u)).toArray() as P,true),"#382c23");
    eye.setAttribute("uv1",new Float32BufferAttribute(Array.from({length:eye.getAttribute("position").count},()=>[.625,.5]).flat(),2));
    // A narrow skin fold, with the fur-bearing brow formed by the cranium itself.
    s.put(surface(8,40,(u,v)=>{
      const a=v*TAU,hood=Math.max(0,Math.sin(a));
      return eyeSkin(.90+u*(.24+.22*hood),a)
        .addScaledVector(eyeN,-.0011*(1-u)+.00042*Math.sin(Math.PI*u)*hood).toArray() as P;
    },true),"#555047");
    // Broad naked rounded-oval pinnae, about 40% of the head's axial length.
    const earC=new Vector3(.037,.033,side*.013), N=new Vector3(.6,0,side*.8), H=new Vector3(-.8,0,side*.6);
    const earPoint=(r:number,a:number):P=>earC.clone().addScaledVector(H,.0068*r*Math.cos(a)*(1+.07*Math.sin(a))).add(new Vector3(-.001*r*Math.sin(a),.0082*r*Math.sin(a),0)).addScaledVector(N,.0025*r*r).toArray() as P;
    s.put(surface(20,40,(u,v)=>earPoint(Math.sin(u*Math.PI*.5),v*TAU),true),"#554235",.025);
    const rim=Array.from({length:41},(_,j)=>earPoint(1,j/40*TAU));
    s.line(rim,rim.map(()=>.00022),"#6e5a44",1,6,40);
    // Short fur-bearing thigh and shank; the ankle joins the trailing membrane.
    const foot: P = [-0.047, -0.009, side * (side > 0 ? .022 : .023)];
    const leg = s.line(
      [[-.031, -.003, side * .010], [-.039, -.010, side * .018], foot],
      [.0045, .0032, .0017], "#857d70", 1, 12, 18,
    );
    coatUV(leg, 18, 12);
    // Reuse the accepted coat's dark dorsal region, leaving face/body maps intact.
    const legUV = leg.getAttribute("uv");
    for (let j = 0; j < legUV.count; j++)
      legUV.setXY(j, .14 + legUV.getX(j) * .16, .05 + legUV.getY(j) * .15);
    furBlades(s, leg, 260);
    for (let j = 0; j < 5; j++) {
      const toe: P = [-.050 - .0003*j, -.0105, side * (.0185 + j * .0016)];
      const tip: P = [toe[0]-.0020, -.0098, toe[2]];
      s.line([foot, toe, tip], [.00065,.00048,.00025], "#554235", 1, 6, 9);
      s.line([tip, [tip[0]-.0008,tip[1]+.0010,tip[2]], [tip[0]-.0003,tip[1]+.0017,tip[2]]],
        [.00028,.00022,.000015], palette.dark, 1, 6, 7);
    }
    // Asymmetric upstroke, four long digits II–V, one free thumb.
    const lift = ((side > 0 ? 57 : 62) * Math.PI) / 180,
      root: P = [0.013, 0.01, side * 0.017];
    const P3 = (x: number, z: number, h = 0): P => [
      x,
      root[1] + z * Math.sin(lift) + h,
      root[2] + side * z * Math.cos(lift),
    ];
    const wrist = P3(0.026, 0.083),
      elbow = P3(0.0225, 0.041);
    // One tapered arm follows the propatagium to the wrist, with no blunt
    // duplicate shoulder sleeve terminating in front of the wing.
    s.line([root, elbow, wrist], [.0038, .0025, .0013], "#554235", 1, 14, 36);
    const sleeveEnd = mix(root, elbow, .28);
    const shoulder = s.line([root,mix(root,elbow,.12),sleeveEnd], [.0041,.0033,.0029], "#ffffff", 1, 14, 22);
    coatUV(shoulder,22,14);
    const armUV = shoulder.getAttribute("uv");
    for (let j = 0; j < armUV.count; j++)
      armUV.setXY(j, .25 + armUV.getX(j) * .12, .05 + armUV.getY(j) * .15);
    furBlades(s,shoulder,300);
    const tips = [
      P3(0.022, 0.146),
      P3(0.014, 0.185),
      P3(-0.028, 0.155),
      P3(-0.066, 0.1),
    ];
    const digits = tips.map((tip) => {
      const mid = mix(wrist, tip, 0.48);
      mid[0] += 0.003;
      mid[1] += 0.003;
      return [wrist, mid, tip];
    });
    for (const d of digits)
      s.line(d, [0.00135, 0.00095, 0.0004], palette.fur, 1, 8, 18);
    // Membrane boundaries use the EXACT digit curves; no bone can hover above a flat fan.
    const curves = digits.map(
      (d) => new CatmullRomCurve3(d.map((p) => new Vector3(...p))),
    );
    curves.push(
      new CatmullRomCurve3([
        new Vector3(...wrist),
        new Vector3(...mix(wrist, foot, 0.52)),
        new Vector3(...foot),
      ]),
    );
    for (let j = 0; j < curves.length - 1; j++) {
      s.put(
        surface(32, 20, (u, v) => {
          const A = curves[j]!.getPoint(u),
            B = curves[j + 1]!.getPoint(u),
            p = A.lerp(B, v);
          const scallop = Math.sin(Math.PI * v) * u ** 5 * 0.035;
          p.lerp(new Vector3(...wrist), scallop);
          const bulge = Math.sin(Math.PI * u) * Math.sin(Math.PI * v);
          p.x -= 0.002 * bulge;
          p.y += 0.0018 * bulge + 0.00014 * Math.sin(u * 49 + v * 5) * bulge;
          return p.toArray() as P;
        }),
        palette.wing,
        0.012,
      );
    }
    // The leading outline is shoulder → elbow → wrist → digit II.
    // Do not bridge shoulder directly to digit II: that hides the forearm
    // inside the membrane and leaves the upper arm looking like a loose peg.
    const hip: P = [-0.034, -0.004, side * 0.012];
    s.put(
      surface(24, 18, (u, v) =>
        mix(curves[4]!.getPoint(u).toArray() as P, mix(root, hip, u), v),
      ),
      palette.wing,
    );
    // Propatagium ahead of elbow; thumb bends to a real hooked claw.
    s.put(
      surface(16, 12, (u, v) =>
        mix(mix(root, elbow, u), mix(root, wrist, u), v),
      ),
      palette.wing,
    );
    s.line(
      [wrist, P3(0.029, 0.084), P3(0.0305, 0.086), P3(0.029, 0.087)],
      [0.0008, 0.00065, 0.00035, 0.00002],
      palette.dark,
      1,
      8,
      18,
    );
    // Reduced interfemoral membrane joins the short ankles to the rump.
    s.put(
      surface(12, 10, (u, v) =>
        mix(mix([-0.04, -0.007, 0], foot, u), [-0.051, -0.008, 0], v),
      ),
      palette.wing,
    );
  }
  // A minute tail remains enclosed at the rump; no projecting pale tube.
  s.line([[-.045,-.004,0],[-.050,-.006,0],[-.052,-.0065,0]],
    [.0016,.0010,.0001], "#554235", 1, 8, 10);
  // Pollen stays sparse and attached to facial fur.
  for (let i = 0; i < 8; i++) {
    const a = i * 2.4;
    s.orb(
      facePoint([0.064 + i * 0.0016, 0.012 + Math.cos(a) * 0.003, Math.sin(a) * 0.005]),
      [0.0007, 0.00065, 0.0006],
      palette.yellow,
      8,
      6,
    );
  }
  const result = s.finish();
  (result.primitive.geometry as BufferGeometry).scale(0.8, 1, 1);
  return result;
}
export function sunbird(): Model {
  const s = new Sculpt();
  // One body loft through breast, neck and head; plumage colour follows the ventral surface.
  const body = axial(
    [
      [-0.021, 0.017, 0, 0],
      [-0.017, 0.019, 0.009, 0.007],
      [-0.005, 0.021, 0.013, 0.012],
      [0.008, 0.025, 0.011, 0.011],
      [0.014, 0.032, 0.007, 0.007],
      [0.019, 0.037, 0.0083, 0.008],
      [0.024, 0.038, 0.007, 0.0066],
      [0.028, 0.036, 0.003, 0.003],
      [0.029, 0.035, 0, 0],
    ],
    64,
    40,
  );
  const p = body.getAttribute("position"),
    col: number[] = [];
  for (let i = 0; i < p.count; i++) {
    const ventral = Math.max(0, Math.min(1, (0.028 - p.getY(i)) / 0.01));
    const c = new Color(palette.olive).lerp(new Color(palette.yellow), ventral);
    col.push(c.r, c.g, c.b);
  }
  body.setAttribute("color", new Float32BufferAttribute(col, 3));
  s.put(body, palette.olive);
  const bp = body.getAttribute("position"),
    bn = body.getAttribute("normal");
  for (let i = 5; i < 43; i += 5)
    for (let j = 0; j < 40; j += 5) {
      const k = i * 41 + j,
        N = new Vector3().fromBufferAttribute(bn, k),
        root = new Vector3()
          .fromBufferAttribute(bp, k)
          .addScaledVector(N, 0.00012),
        tip = new Vector3()
          .fromBufferAttribute(bp, Math.min(64, i + 6) * 41 + j)
          .addScaledVector(N, 0.00018);
      if (root.y < 0.012 || Math.abs(N.z) < 0.25) continue;
      const ventral = Math.max(0, Math.min(1, (0.028 - root.y) / 0.01)),
        C = new Color(palette.olive).lerp(new Color(palette.yellow), ventral);
      s.put(
        lancet(
          root.toArray() as P,
          tip.toArray() as P,
          0.0028,
          N.toArray() as P,
          0.00018,
          10,
          6,
        ),
        "#" + C.getHexString(),
      );
    }

  for (const side of [-1, 1]) {
    for (let i = 0; i < 9; i++) {
      const u = i / 8;
      s.put(
        lancet(
          [0.008 - u * 0.009, 0.03 - u * 0.003, side * (0.01 + u * 0.001)],
          [
            -0.023 + u * 0.008 + (side > 0 ? 0.0004 : 0),
            0.008 + u * 0.006,
            side * 0.009,
          ],
          0.0055,
          [0, 0.15, side],
          0.0009,
          18,
          8,
        ),
        i % 2 ? palette.olive : palette.rib,
      );
    }
    for (let i = 0; i < 7; i++) {
      const u = i / 6;
      s.put(
        lancet(
          [0.009 - u * 0.02, 0.032 - u * 0.003, side * 0.012],
          [-0.005 - u * 0.014, 0.018, side * 0.0125],
          0.006,
          [0, 0.2, side],
          0.0009,
          14,
          8,
        ),
        palette.olive,
      );
    }
    const E: P = [0.024, 0.039, side * 0.0058];
    s.orb(E, [0.0018, 0.0019, 0.0018], palette.dark, 24, 16);
    s.line(
      [
        [0.018, 0.0415, side * 0.006],
        [0.023, 0.0427, side * 0.006],
        [0.027, 0.0417, side * 0.004],
      ],
      [0.0008, 0.00065, 0.0002],
      palette.yellow,
      1,
      6,
      12,
    );
    const ankle: P = [0.0015, 0.003, side * 0.0038];
    s.line(
      [[0.001, 0.015, side * 0.005], [0.004, 0.009, side * 0.0045], ankle],
      [0.0017, 0.0008, 0.00065],
      palette.rib,
      1,
      8,
      15,
    );
    // Anisodactyl grip: three forward toes and one hallux.
    for (let i = 0; i < 4; i++) {
      const forward = i < 3 ? 1 : -1,
        z = side * 0.0038 + (i < 3 ? (i - 1) * 0.0019 : 0);
      s.line(
        [
          ankle,
          [0.0015 + forward * 0.004, 0.0, z],
          [0.0015 + forward * 0.005, -0.003, z],
          [0.0015 + forward * 0.0038, -0.004, z],
        ],
        [0.00048, 0.0004, 0.00027, 0.00004],
        palette.rib,
        1,
        6,
        10,
      );
    }
  }
  for (let i = 0; i < 12; i++) {
    const z = (i - 5.5) * 0.0012;
    s.put(
      lancet(
        [-0.015, 0.014, z * 0.45],
        [-0.041 + Math.abs(i - 5.5) * 0.0008, -0.003, z],
        0.0038,
        [0, 1, 0],
        0.0006,
        18,
        6,
      ),
      i === 0 || i === 11 ? palette.ivory : palette.olive,
    );
  }
  s.line(
    [
      [0.027, 0.036, 0],
      [0.035, 0.0358, 0],
      [0.043, 0.033, 0],
      [0.0485, 0.028, 0],
    ],
    [0.0017, 0.0012, 0.0007, 0.00006],
    palette.dark,
    0.65,
    16,
    28,
  );
  s.line(
    [
      [0.028, 0.0348, 0],
      [0.038, 0.0337, 0],
      [0.0475, 0.0279, 0],
    ],
    [0.0008, 0.0006, 0.00005],
    palette.dark,
    0.65,
    12,
    24,
  );
  return s.finish();
}
/** Cut drupe layers share the SAME nested ovoid surface, with actual cut faces. */
export function coconut(): Model { return coconutRound3(); }
/** Flattened, keeled Terminalia drupe, not a sphere. */
export function seaAlmond(): Model {
  const s = new Sculpt();
  const g = surface(
    64,
    48,
    (u, v) => {
      const t = u * Math.PI,
        a = v * TAU,
        r =
          0.018 *
          Math.sin(t) *
          (1 + 0.1 * Math.cos(t)) *
          (1 + 0.018 * Math.sin(a * 3 + t * 2));
      const ridge = 1 + 0.12 * Math.abs(Math.cos(a)) ** 16;
      return [
        -0.0275 * Math.cos(t),
        0.011 + Math.sin(a) * r * 0.57,
        Math.cos(a) * r * ridge,
      ];
    },
    true,
  );
  s.put(g, palette.red, 0.045);
  s.line(
    [
      [-0.027, 0.011, 0],
      [-0.01, 0.011, 0.019],
      [0.01, 0.011, 0.017],
      [0.027, 0.011, 0],
    ],
    [0.0001, 0.0006, 0.0005, 0.00005],
    palette.red,
    1,
    6,
    28,
  );
  return s.finish();
}
export function angsana(): Model {
  const s = new Sculpt(),
    rand = rng(6);
  const outline = (a: number) =>
    0.02 *
    (1 + 0.05 * Math.sin(a * 5) + 0.035 * Math.sin(a * 11)) *
    (1 + 0.15 * Math.cos(a));
  const point = (a: number, r: number, lift = 0): P => {
    const u = r / outline(a);
    return [
      Math.cos(a) * r,
      0.002 +
        0.0004 * Math.sin(a * 3) * u +
        0.0015 * Math.sin(u * Math.PI) +
        lift,
      Math.sin(a) * r,
    ];
  };
  s.put(
    surface(48, 64, (u, v) => point(v * TAU, outline(v * TAU) * u), true),
    palette.fibre,
    0.02,
  );
  const boss = s.put(
    surface(
      24,
      40,
      (u, v) => {
        const t = u * Math.PI,
          a = v * TAU,
          r = Math.sin(t) * (1 + 0.065 * Math.sin(a * 3 + t * 4));
        return [
          -0.002 + Math.cos(a) * r * 0.0085,
          0.0025 + Math.cos(t) * 0.0025 + 0.00008 * Math.sin(a * 13) * r,
          Math.sin(a) * r * 0.0095,
        ];
      },
      true,
    ),
    palette.husk,
    0.025,
  );
  const colors = boss.getAttribute("color");
  for (let i = 0; i < colors.count; i++)
    colors.setXYZ(
      i,
      colors.getX(i) * 0.55,
      colors.getY(i) * 0.55,
      colors.getZ(i) * 0.55,
    );
  for (let i = 0; i < 32; i++) {
    const a = (i / 32) * TAU + (rand() - 0.5) * 0.12,
      r = outline(a),
      start = 0.006 + rand() * 0.002,
      end = r * (0.9 + rand() * 0.08),
      path: P[] = [];
    for (let j = 0; j <= 10; j++) {
      const t = j / 10,
        rr = start + (end - start) * t;
      path.push(point(a + 0.03 * Math.sin(t * 3), rr, 0.00007));
    }
    s.line(
      path,
      path.map((_, j) => 0.00009 * (1 - j / 14)),
      palette.bark,
      1,
      4,
      14,
    );
    if (i % 2 === 0) {
      const branch: P[] = [];
      for (let j = 0; j <= 6; j++) {
        const t = j / 6;
        branch.push(
          point(
            a + 0.02 + 0.13 * t,
            start + (end - start) * (0.52 + 0.31 * t),
            0.000055,
          ),
        );
      }
      s.line(
        branch,
        branch.map((_, j) => 0.000045 * (1 - j / 8)),
        palette.bark,
        1,
        3,
        8,
      );
    }
  }
  s.line(
    [
      [0.015, 0.002, 0],
      [0.023, 0.003, 0.002],
      [0.027, 0.004, 0.003],
    ],
    [0.0007, 0.0005, 0.0001],
    palette.rib,
    1,
    6,
    10,
  );
  return s.finish();
}
export function rubberCapsule(): Model {
  const s = new Sculpt();
  s.put(
    surface(
      56,
      64,
      (u, v) => {
        const t = u * Math.PI,
          a = v * TAU,
          r =
            0.021 *
            Math.sin(t) *
            (1 + 0.28 * Math.cos(a * 3) + 0.018 * Math.sin(a * 2)) *
            (1 + 0.08 * Math.cos(t));
        return [Math.cos(a) * r, 0.021 - 0.02 * Math.cos(t), Math.sin(a) * r];
      },
      true,
    ),
    palette.bark,
    0.065,
  );
  for (let i = 0; i < 3; i++) {
    const a = (i * TAU) / 3 + Math.PI / 3,
      p: P[] = [];
    for (let j = 1; j < 25; j++) {
      const t = (j / 25) * Math.PI,
        r = 0.021 * Math.sin(t) * 0.84;
      p.push([Math.cos(a) * r, 0.021 - 0.02 * Math.cos(t), Math.sin(a) * r]);
    }
    s.line(
      p,
      p.map(() => 0.00028),
      palette.rib,
      1,
      4,
      28,
    );
  }
  s.line(
    [
      [0, 0.039, 0],
      [0.002, 0.046, 0.001],
    ],
    [0.002, 0.0012],
    palette.bark,
    1,
    8,
    12,
  );
  return s.finish();
}
export function balsamPod(): Model {
  const s = new Sculpt();
  const g = surface(
    48,
    48,
    (u, v) => {
      const t = u * Math.PI,
        a = v * TAU,
        r =
          0.0045 *
          Math.sin(t) ** 0.85 *
          (1 + 0.07 * Math.cos(a * 5) + 0.018 * Math.sin(a * 2 + t));
      return [0.022 * u, 0.0065 + Math.cos(a) * r, Math.sin(a) * r];
    },
    true,
  );
  s.put(g, palette.leaf, 0.03);
  fuzz(s, g, 210, 0.00055, palette.young, 9);
  for (let i = 0; i < 5; i++) {
    const a = ((i + 0.5) * TAU) / 5;
    const p: P[] = Array.from({ length: 23 }, (_, j) => {
      const u = (j + 1) / 24,
        r = 0.00425 * Math.sin(u * Math.PI) ** 0.85;
      return [0.022 * u, 0.0065 + Math.cos(a) * r, Math.sin(a) * r];
    });
    s.line(
      p,
      p.map(() => 0.00006),
      palette.olive,
      1,
      4,
      24,
    );
  }
  s.line(
    [
      [0, 0.0065, 0],
      [-0.008, 0.007, 0.001],
      [-0.014, 0.0048, 0.002],
    ],
    [0.0011, 0.001, 0.0005],
    palette.olive,
    1,
    8,
    12,
  );
  return s.finish();
}
export function durianFlowers(): Model {
  const s = new Sculpt();
  const branch=barkBranch(s,[[.14,.028,-.02],[.145,.14,-.022],[.12,.235,-.02],[.02,.255,-.018],[-.1,.25,-.02]],[.008,.007,.0065,.005,.0028],24,64);
  for(const u of [.64,.78,.92]) {
    const p=branch.getPoint(u);
    barkBranch(s,[p.toArray() as P,[p.x-.004,p.y+.003,p.z-.003],[p.x-.006,p.y+.0035,p.z-.004]],[.0026,.0020,.0008],20,14);
  }
  const sites = [
    [-0.07, -0.018, 0.034],
    [-0.025, 0, 0.05],
    [0.025, -0.024, 0.038],
  ];
  sites.forEach(([x, z, hang], i) => {
    const c: P = [x! + 0.003, 0.25 - hang!, z! + 0.004];
    const junction=branch.getPoint(i===0?.94:i===1?.84:.73).toArray() as P;
    barkBranch(s,[junction,[x!, .245, z!],c],[.0028,.0021,.0015],16,22);
    s.put(
      axial(
        [
          [0, 0, 0, 0],
          [0.006, 0, 0.007, 0.007],
          [0.014, 0, 0.01, 0.01],
          [0.022, 0, 0.0105, 0.0105],
        ],
        28,
        32,
      )
        .applyMatrix4(new Matrix4().makeRotationZ(-Math.PI / 2))
        .translate(...c),
      "#8a8378",
    );
    for (let k = 0; k < 5; k++) {
      const a = ((k * 72 + i * 20) * Math.PI) / 180;
      const g = surface(
        32,
        14,
        (u, v) => {
          const theta = v * TAU,
            r = 0.007 + 0.025 * Math.sin(u * Math.PI * 0.7),
            w = 0.0075 * Math.sin(Math.PI * u) ** 0.65 * Math.cos(theta),
            h = 0.0007 * Math.sin(theta) * Math.sin(Math.PI * u);
          return [
            c[0] + Math.cos(a) * r - Math.sin(a) * w,
            c[1] -
              0.015 -
              0.031 * Math.sin(u * Math.PI * 0.83) +
              0.009 * u * u +
              h,
            c[2] + Math.sin(a) * r + Math.cos(a) * w,
          ];
        },
        true,
      );
      s.put(g, palette.ivory);
    }
    // Five stamen bundles; each subdivides into six filaments with real anthers.
    for (let k = 0; k < 5; k++)
      for (let j = 0; j < 6; j++) {
        const a = (k / 5 + (j - 2.5) * 0.009) * TAU + i * 0.3,
          r = 0.012 + (j % 3) * 0.0025;
        const tip: P = [
          c[0] + Math.cos(a) * r,
          c[1] - 0.052 - (j % 3) * 0.002,
          c[2] + Math.sin(a) * r,
        ];
        s.line(
          [
            [
              c[0] + Math.cos(a) * 0.003,
              c[1] - 0.018,
              c[2] + Math.sin(a) * 0.003,
            ],
            mix(c, tip, 0.68),
            tip,
          ],
          [0.0005, 0.00038, 0.00028],
          palette.ivory,
          1,
          5,
          14,
        );
        s.orb(tip, [0.0012, 0.0011, 0.0009], palette.yellow, 10, 8);
      }
    s.line(
      [
        [c[0], c[1] - 0.014, c[2]],
        [c[0] + 0.001, c[1] - 0.06, c[2]],
      ],
      [0.00085, 0.00055],
      palette.ivory,
      1,
      8,
      16,
    );
  });
  return s.finish();
}
/** Fruit flesh is painted into a continuous surface; markings never float above it. */
export function rubberSeeds(): Model {
  const s = new Sculpt();
  [
    [-0.03, 0.0085, 0],
    [0, 0.0085, 0.006],
    [0.03, 0.0085, -0.002],
  ].forEach((c, i) => {
    const g = surface(
      40,
      48,
      (u, v) => {
        const t = u * Math.PI,
          a = v * TAU,
          r = Math.sin(t),
          x = Math.cos(t) * 0.0125 * (1 + 0.035 * Math.sin(i * 2.7)),
          z = Math.sin(a) * r * 0.01 * (1 + 0.025 * Math.sin(a * 3 + t + i)),
          y = Math.cos(a) * r * 0.0085;
        const pit =
          0.0007 * Math.exp(-(((x - 0.011) / 0.002) ** 2) - (z / 0.003) ** 2);
        return [c[0]! + x, c[1]! + y - pit, c[2]! + z];
      },
      true,
    );
    normalUV(g, 40, 48, i * 0.19);
    s.put(g, "#6e5a44");
  });
  return s.finish();
}
export function ripeFigs(): Model {
  const s = new Sculpt();
  const twig=barkBranch(s,[[-.05,.006,.004],[-.01,.007,-.002],[.04,.006,.004]],[.0035,.0025,.0010],24,44);
  for(const u of [.2,.53,.8]) {
    const p=twig.getPoint(u), n=s.orb(p.toArray() as P,[.0034,.0028,.003],"#6e5a44",20,12);
    const q=n.getAttribute("position");
    for(let j=0;j<q.count;j++) q.setY(j,q.getY(j)+.0002*Math.sin(q.getX(j)*1200));
    n.computeVertexNormals();
  }
  const sites = [
    [-0.032, 0.02, -45],
    [0.002, 0.024, 20],
    [0.028, -0.018, 110],
  ];
  sites.forEach(([x, z, yaw], i) => {
    const a = (yaw! * Math.PI) / 180,
      axis = new Vector3(Math.cos(a), 0.22, -Math.sin(a)).normalize(),
      U = new Vector3(0, 1, 0),
      V = new Vector3().crossVectors(axis, U).normalize(),
      base = new Vector3(x, 0.014, z);
    const g = surface(
      52,
      64,
      (u, v) => {
        const t = u * Math.PI,
          phi = v * TAU,
          r =
            0.015 *
            Math.sin(t) *
            (1 + 0.09 * Math.cos(t)) *
            (1 + 0.04 * Math.sin(i * 2.7) + 0.012 * Math.sin(phi * 3 + t)),
          L = 0.0155 * (1 - Math.cos(t));
        const q = base
          .clone()
          .addScaledVector(axis, L)
          .addScaledVector(U, Math.cos(phi) * r)
          .addScaledVector(V, Math.sin(phi) * r);
        const tip = base.clone().addScaledVector(axis, 0.031),
          d = q.distanceTo(tip);
        q.addScaledVector(axis, -0.0012 * Math.exp(-((d / 0.003) ** 2)));
        return q.toArray() as P;
      },
      true,
    );
    normalUV(g, 52, 64, i * 0.21);
    s.put(g, "#ffffff");
    s.line(
      [
        [x! * 0.7, 0.007, z! * 0.2],
        [x!, 0.012, z! * 0.85],
        base.toArray() as P,
      ],
      [0.0017, 0.0015, 0.0012],
      "#6e5a44",
      1,
      8,
      14,
    );
    const tip = base.clone().addScaledVector(axis, 0.0305);
    for (let k = 0; k < 5; k++) {
      const a = (k * TAU) / 5;
      s.put(
        lancet(
          tip
            .clone()
            .addScaledVector(U, Math.cos(a) * 0.002)
            .addScaledVector(V, Math.sin(a) * 0.002)
            .toArray() as P,
          tip.clone().addScaledVector(axis, -0.001).toArray() as P,
          0.0018,
          axis.toArray() as P,
          0.00035,
          8,
          6,
        ),
        palette.rib,
      );
    }
  });
  return s.finish();
}
export function seaAlmondCut(): Model { return seaAlmondCutRound3(); }
/** Fine silhouette hairs supplement the dense mapped undercoat; rooted on the loft. */
function furBlades(s: Sculpt, g: BufferGeometry, count: number) {
  const rand = rng(52),
    p = g.getAttribute("position"),
    n = g.getAttribute("normal"),
    positions: number[] = [],
    colors: number[] = [];
  for (let i = 0; i < count; i++) {
    const ix = g.index!,
      j =
        Math.floor(
          ((i % 3 === 0 ? 0.53 + rand() * 0.25 : rand()) * ix.count) / 3,
        ) * 3,
      r = Math.sqrt(rand()),
      t = rand(),
      weights = [1 - r, r * (1 - t), r * t],
      root = new Vector3(),
      N = new Vector3();
    let U = 0, V = 0;
    const uv = g.getAttribute("uv");
    for (let k = 0; k < 3; k++) {
      const q = ix.getX(j + k);
      U += (uv.getX(q) * 1024 - 16) / 992 * weights[k]!;
      V += (uv.getY(q) * 512 - 16) / 480 * weights[k]!;
      root.addScaledVector(
        new Vector3().fromBufferAttribute(p, q),
        weights[k]!,
      );
      N.addScaledVector(new Vector3().fromBufferAttribute(n, q), weights[k]!);
    }
    N.normalize();
    if (root.x > 0.061 || N.length() < 0.5) continue;
    const down = new Vector3(-1, -0.22, (rand() - 0.5) * 0.6);
    down.addScaledVector(N, -down.dot(N)).normalize();
    const side = new Vector3().crossVectors(N, down).normalize(),
      len = 0.00035 + rand() * 0.00065,
      w = 0.000025 + rand() * 0.000025;
    const tip = root
      .clone()
      .addScaledVector(down, len)
      .addScaledVector(N, len * 0.3);
    const A = root.clone().addScaledVector(side, w),
      B = root.clone().addScaledVector(side, -w);
    positions.push(...A.toArray(), ...B.toArray(), ...tip.toArray());
    const col = coatPigment(U, V).multiplyScalar(.8 + rand() * .5);
    for (let k = 0; k < 3; k++) colors.push(col.r, col.g, col.b);
  }
  const hair = new BufferGeometry();
  hair.setAttribute("position", new Float32BufferAttribute(positions, 3));
  hair.setAttribute("color", new Float32BufferAttribute(colors, 3));
  hair.computeVertexNormals();
  s.put(hair, palette.fur);
}
export function mossCushion(): Model { return mossRound3(); }
export function mossCapsules(): Model {
  const s = new Sculpt();
  const sites = [
    [-0.01, 0.002, 0.04, 8],
    [0.006, -0.004, 0.046, -6],
    [0.014, 0.008, 0.036, 14],
    [-0.002, 0.012, 0.042, -12],
    [-0.018, -0.006, 0.034, 4],
  ];
  sites.forEach(([x, z, h, lean]) => {
    const top: P = [
      x! + Math.sin((lean! * Math.PI) / 180) * h!,
      0.028 + h!,
      z!,
    ];
    s.line(
      [
        [x!, 0.026, z!],
        [
          x! + Math.sin((lean! * Math.PI) / 180) * h! * 0.5,
          0.028 + h! * 0.55,
          z!,
        ],
        top,
      ],
      [0.0007, 0.0006, 0.0005],
      "#6e5a44",
      1,
      8,
      20,
    );
    const g = axial(
      [
        [0, 0, 0, 0],
        [0.002, 0, 0.002, 0.002],
        [0.006, 0, 0.0028, 0.0028],
        [0.0085, 0, 0.0016, 0.0016],
        [0.009, 0, 0, 0],
      ],
      24,
      24,
    );
    g.applyMatrix4(
      new Matrix4().makeRotationZ(((20 + lean!) * Math.PI) / 180),
    ).translate(...top);
    s.put(g, "#6e5a44", 0.03);
    const end: P = [
      top[0] + Math.cos(((20 + lean!) * Math.PI) / 180) * 0.008,
      top[1] + Math.sin(((20 + lean!) * Math.PI) / 180) * 0.008,
      top[2],
    ];
    s.orb(end, [0.0006, 0.0006, 0.0006], palette.rib, 12, 8);
  });
  return s.finish();
}
export function rubberValves(): Model {
  const s = new Sculpt();
  for (let k = 0; k < 3; k++) {
    const a = ((k * 120 + 30) * Math.PI) / 180,
      c: P = [Math.cos(a) * 0.03, 0.009, -Math.sin(a) * 0.03];
    const shell = (u: number, v: number, inner = false): P => {
      const t = u * Math.PI,
        theta = (v - 0.5) * Math.PI * 0.92,
        along = -0.021 * Math.cos(t);
      const width = 0.0145 * Math.sin(t),
        cup = 0.007 * Math.sin(t) * (1 - Math.cos(theta));
      const across = width * Math.sin(theta),
        radial = along * 0.89;
      return [
        c[0] + Math.cos(a) * radial + Math.sin(a) * across,
        c[1] + along * 0.2 + cup + (inner ? 0.0016 : 0),
        c[2] - Math.sin(a) * radial + Math.cos(a) * across,
      ];
    };
    s.put(
      surface(40, 28, (u, v) => shell(u, v)),
      palette.husk,
      0.045,
    );
    s.put(
      reverse(surface(40, 28, (u, v) => shell(u, v, true))),
      palette.fibre,
      0.025,
    );
    for (const edge of [0, 1])
      s.put(
        surface(40, 4, (u, v) => mix(shell(u, edge), shell(u, edge, true), v)),
        palette.husk,
      );
  }
  return s.finish();
}
export function chilliPetals(): Model {
  const s = new Sculpt();
  s.put(
    surface(
      14,
      48,
      (u, v) => {
        const a = v * TAU,
          r = 0.008 + 0.03 * u;
        return [
          Math.cos(a) * r,
          0.011 + 0.006 * u + 0.001 * Math.sin(a * 5) * u,
          Math.sin(a) * r,
        ];
      },
      true,
    ),
    palette.ivory,
  );
  for (let k = 0; k < 5; k++) {
    const a = (k * TAU) / 5 + 0.12 + 0.025 * Math.sin(k * 3);
    const g = surface(
      34,
      14,
      (u, v) => {
        const theta = v * TAU,
          r = 0.02 + (0.098 + 0.005 * Math.sin(k * 2)) * u,
          w =
            (0.028 + 0.002 * Math.cos(k * 3)) *
            Math.sin(Math.PI * u) ** 0.7 *
            Math.cos(theta),
          h = 0.0012 * Math.sin(theta) * Math.sin(Math.PI * u);
        return [
          Math.cos(a) * r - Math.sin(a) * w,
          0.014 + 0.018 * Math.sin(u * Math.PI * 0.85) + h,
          Math.sin(a) * r + Math.cos(a) * w,
        ];
      },
      true,
    );
    s.put(g, palette.ivory);
  }
  return s.finish();
}

function normalUV(g: BufferGeometry, n: number, m: number, shift = 0) {
  const uv: number[] = [];
  for (let i = 0; i <= n; i++)
    for (let j = 0; j <= m; j++) uv.push(0.05 + (0.9 * i) / n, j / m + shift);
  g.setAttribute("uv", new Float32BufferAttribute(uv, 2));
  g.userData.textureUV = true;
}

/** Curved Capsicum fruit with shoulder folds, five-lobed calyx and thirteen retained cut seeds. */
export function chilli(cut = false): Model {
  const s = new Sculpt();
  const center = (u: number): P => [
    u * 0.056,
    0.007 + 0.005 * Math.sin(Math.PI * u),
    0.0015 * Math.sin(u * Math.PI * 0.9),
  ];
  const radius = (u: number) =>
    0.008 * Math.sin(Math.PI * u) ** 0.55 * (1 - 0.55 * u) ** 0.7;
  const point = (u: number, a: number, inset = 0): P => {
    const c = center(u),
      r =
        Math.max(0, radius(u) - inset) *
        (1 +
          0.025 * Math.cos(a * 5) * Math.exp(-u * 4) +
          0.008 * Math.sin(u * 65 + a * 3));
    return [c[0], c[1] - Math.sin(a) * r, c[2] + Math.cos(a) * r];
  };
  const skin = cut ? "#b5473a" : palette.leaf;
  s.put(
    reverse(
      surface(80, 48, (u, v) => point(u, v * (cut ? Math.PI : TAU)), !cut),
    ),
    skin,
    0.012,
  );
  if (cut) {
    s.put(
      surface(80, 32, (u, v) => point(u, v * Math.PI, 0.0008)),
      skin,
    );
    for (const a of [0, Math.PI])
      s.put(
        surface(80, 4, (u, v) => mix(point(u, a), point(u, a, 0.0008), v)),
        "#c48a76",
      );
    const placenta = [0.04, 0.2, 0.4, 0.6, 0.78, 0.92].map((u) => center(u));
    s.line(
      placenta,
      [0.0014, 0.0014, 0.0012, 0.001, 0.0007, 0.0001],
      palette.ivory,
      0.7,
      10,
      48,
    );
    for (let i = 0; i < 13; i++) {
      const u = 0.1 + i * 0.054,
        c = center(u),
        side = i % 2 ? 1 : -1,
        z = c[2] + side * radius(u) * 0.49;
      const seed: P = [c[0], c[1] + 0.0006, z];
      s.line(
        [c, [c[0], c[1] + 0.0003, (c[2] + z) * 0.5], seed],
        [0.00025, 0.0002, 0.00012],
        palette.ivory,
        1,
        5,
        7,
      );
      s.orb(seed, [0.00155, 0.00055, 0.00125], palette.ivory, 20, 12);
    }
  }
  s.put(
    surface(
      24,
      48,
      (u, v) => {
        const t = u * Math.PI,
          a = v * TAU,
          r = 0.0055 * Math.sin(t) * (1 + 0.12 * Math.cos(a * 5));
        return [
          -0.001 + 0.0018 * Math.cos(t),
          0.007 + Math.cos(a) * r,
          Math.sin(a) * r,
        ];
      },
      true,
    ),
    palette.olive,
    0.01,
  );
  s.line(
    [
      [-0.002, 0.007, 0],
      [-0.006, 0.008, 0.001],
      [-0.011, 0.012, 0.0015],
    ],
    [0.0013, 0.0011, 0.00065],
    palette.olive,
    1,
    12,
    24,
  );
  return s.finish();
}

/** Bark relief follows the grain and taper of the actual branch, including its ends. */
function barkBranch(s:Sculpt, path:P[], radii:number[], radial=24, segments=64) {
  const curve=new CatmullRomCurve3(path.map(p=>new Vector3(...p)));
  const frames=curve.computeFrenetFrames(segments,false);
  const g=tube(path,radii,1,radial,segments), p=g.getAttribute("position"), cols:number[]=[];
  const dark=new Color("#513f2e"), light=new Color("#6e5a44");
  for(let i=0;i<p.count;i++) {
    const u=Math.floor(i/(radial+1))/segments, a=(i%(radial+1))/radial*TAU;
    const c=curve.getPoint(u), q=new Vector3().fromBufferAttribute(p,i), d=q.clone().sub(c);
    const grain=Math.sin(a*17+Math.sin(u*29+a)*1.7)*.045 + Math.sin(a*31-u*13)*.024;
    const node=.10*Math.exp(-(((u-.72)/.025)**2))+.08*Math.exp(-(((u-.88)/.018)**2));
    q.addScaledVector(d,grain+node); p.setXYZ(i,q.x,q.y,q.z);
    const col=dark.clone().lerp(light,.25+.22*Math.sin(a*21+u*18)).multiplyScalar(1+grain*2.5);
    cols.push(col.r,col.g,col.b);
  }
  g.setAttribute("color",new Float32BufferAttribute(cols,3)); g.computeVertexNormals(); s.put(g,"#6e5a44");
  for(const end of [0,1]) {
    const k=end*segments, c=curve.getPoint(end), R=radii[end ? radii.length-1 : 0]!;
    s.put(surface(8,radial,(u,v)=>c.clone().addScaledVector(frames.normals[k]!,Math.cos(v*TAU)*u*R).addScaledVector(frames.binormals[k]!,Math.sin(v*TAU)*u*R).toArray() as P,true),"#857d70",.04);
  }
  return curve;
}

/** Smooth receptacle, actual recessed ostiole with interlocking bracts, 26 retained florets. */
export function figCut():Model { return figCutRound3(); }

/** Thick imbricate bracts, curled margins and hollow tubular flowers. */
export function redFlower():Model { return redFlowerRound3(); }
